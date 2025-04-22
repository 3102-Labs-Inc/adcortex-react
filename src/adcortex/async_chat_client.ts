/**
 * Async Chat Client for ADCortex API with sequential message processing
 */

import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';

import { 
  Ad, 
  AdResponse, 
  AdResponseSchema, 
  Message, 
  MessageSchema, 
  Role, 
  SessionInfo 
} from './types';
import { ClientState, CircuitBreaker } from './state';

// Load environment variables from .env file
dotenv.config();

const DEFAULT_CONTEXT_TEMPLATE = "Here is a product the user might like: {ad_title} - {ad_description}: here is a sample way to present it: {placement_template}";
const AD_FETCH_URL = "https://adcortex.3102labs.com/ads/matchv2";

axiosRetry(axios, {
  retries: 3, // number of retries
  retryDelay: axiosRetry.exponentialDelay, // exponential backoff
  retryCondition: (error: AxiosError): boolean => {
    // Retry if it's a network error, idempotent request error, or connection aborted
    return (isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED");
  },
});

/**
 * Asynchronous chat client for ADCortex API with message queue and circuit breaker support.
 * 
 * This client provides asynchronous message processing with features like:
 * - Message queue management with FIFO behavior
 * - Circuit breaker pattern for error handling
 * - Batch processing of messages
 * - Automatic retries with exponential backoff
 */
class AsyncAdcortexChatClient {
  private _session_info: SessionInfo;
  private _context_template: string;
  private _api_key: string;
  private _timeout: number;
  private _headers: Record<string, any>;
  public latest_ad: Ad | null;
  private _disable_logging: boolean;
  
  // Queue management
  private _message_queue: Message[];
  private _max_queue_size: number;
  
  // State management
  private _state: ClientState;
  private _processing_task: Promise<void> | null;
  
  // Circuit breaker
  private _circuit_breaker: CircuitBreaker;
  
  constructor(
    session_info: SessionInfo,
    context_template: string = DEFAULT_CONTEXT_TEMPLATE,
    api_key: string|null = null,
    timeout: number = 10,
    // log_level: number|null = 40,
    disable_logging: boolean = false,
    max_queue_size: number = 100,
    circuit_breaker_threshold: number = 5,
    circuit_breaker_timeout: number = 120  // 2 minutes
  ) {
    this._session_info = session_info;
    this._context_template = context_template;
    this._api_key = api_key || process.env.ADCORTEX_API_KEY || "";
    this._headers = {
      "Content-Type": "application/json",
      "X-API-KEY": this._api_key,
    };
    this._timeout = timeout;
    this.latest_ad = null;
    this._disable_logging = disable_logging;
    
    // Queue management
    this._message_queue = [];
    this._max_queue_size = max_queue_size;
    
    // State management
    this._state = ClientState.IDLE;
    this._processing_task = null;
    
    // Circuit breaker
    this._circuit_breaker = new CircuitBreaker(
      circuit_breaker_threshold,
      circuit_breaker_timeout,
      disable_logging
    );
    
    if (!this._api_key) {
      throw new Error("ADCORTEX_API_KEY is not set and not provided");
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  private _log_info(message: string): void {
    /**
     * Log info message if logging is enabled.
     */
    if (!this._disable_logging) {
      console.log(`${this.formatDate(new Date())} - async_chat_client - INFO - ${message}`);
    }
  }

  private _log_error(message: string): void {
    /**
     * Log error message if logging is enabled.
     */
    if (!this._disable_logging) {
      console.error(`${this.formatDate(new Date())} - async_chat_client - ERROR - ${message}`);
    }
  }

  private _is_task_running(): boolean {
    /**
     * Check if processing task is running.
     */
    // return this._processing_task !== null && !this._processing_task!.done();
    return this._processing_task !== null && this._state === ClientState.PROCESSING;
  }

  public async __call__(role: Role, content: string): Promise<void> {
    /**
     * Add a message to the queue and process it.
     */
    const current_message = MessageSchema.parse({
      role: role,
      content: content,
      timestamp: new Date().getTime() / 1000 // Convert to seconds for consistency with Python
    });
      
    // Always add message to queue, remove oldest if full
    if (this._message_queue.length >= this._max_queue_size) {
      this._message_queue.shift();  // Remove oldest message
      this._log_info("Queue full, removed oldest message");
    }
    
    this._message_queue.push(current_message);
    this._log_info(`Message queued: ${role} - ${content}`);

    // Process queue if not already processing, role is user, and circuit breaker is closed
    if (this._state === ClientState.IDLE && role === Role.user && !this._circuit_breaker.is_open() && !this._is_task_running()) {
      this._state = ClientState.PROCESSING;
      this._processing_task = this._process_queue();
      try {
        await this._processing_task;
      } catch (e) {
        this._log_error(`Processing task failed: ${e instanceof Error ? e.message : String(e)}`);
        this._circuit_breaker.record_error();
      } finally {
        this._state = ClientState.IDLE;
        this._processing_task = null;
      }
    }
  }

  private async _process_queue(): Promise<void> {
    /**
     * Process all messages in the queue in a single batch.
     */
    if (!this._message_queue.length) {
      return;
    }

    // Take a snapshot of current messages
    const messages_to_process = [...this._message_queue];
    this._log_info(`Processing ${messages_to_process.length} messages in batch`);
    
    try {
      await this._fetch_ad_batch(messages_to_process);
      // Only remove messages that were successfully processed
      this._message_queue = this._message_queue.slice(messages_to_process.length);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.code === 'ECONNABORTED') {
          this._log_error(`Batch request timed out: ${e.message}`);
        } else {
          this._log_error(`Batch request failed: ${e.message}`);
        }
      } else if (e instanceof Error) {
        if (e.name === 'ValidationError') {
          this._log_error(`Invalid response format: ${e.message}`);
        } else {
          this._log_error(`Unexpected error processing batch: ${e.message}`);
        }
      } else {
        this._log_error(`Unknown error: ${String(e)}`);
      }
      this._circuit_breaker.record_error();
      throw e;
    }
  }

  private async _fetch_ad_batch(messages: Message[]): Promise<void> {
    /**
     * Fetch an ad based on all messages in a batch.
     */
    const payload = this._prepare_batch_payload(messages);
    await this._send_request(payload);
  }

  private _prepare_batch_payload(messages: Message[]): Record<string, any> {
    /**
     * Prepare the payload for the batch ad request.
     */
    // Convert session info to object and handle enum values
    const session_info_dict = { ...this._session_info };
    const user_info_dict = { ...session_info_dict.user_info };
    user_info_dict.interests = user_info_dict.interests;
    
    // Convert messages to dict and handle enum values
    const messages_dict = messages.map(msg => ({
      ...msg,
      role: msg.role.toString()
    }));
    
    return {
      "RGUID": uuidv4(),
      "session_info": {
        "session_id": session_info_dict.session_id,
        "character_name": session_info_dict.character_name,
        "character_metadata": session_info_dict.character_metadata,
      },
      "user_data": user_info_dict,
      "messages": messages_dict,
      "platform": session_info_dict.platform
    };
  }

  private async _send_request(payload: Record<string, any>): Promise<void> {
    /**
     * Send the request to the ADCortex API asynchronously.
     */
    try {
      const response = await axios.post(
        AD_FETCH_URL,
        payload,
        {
          headers: this._headers,
          timeout: this._timeout * 1000
        }
      );
      await this._handle_response(response.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.code === 'ECONNABORTED') {
          this._log_error("Request timed out");
        } else {
          this._log_error(`Error fetching ad: ${e.message}`);
        }
      } else {
        this._log_error(`Unknown error: ${String(e)}`);
      }
      throw e;
    }
  }

  private async _handle_response(response_data: Record<string,any>): Promise<void> {
    /**
     * Handle the response from the ad request.
     */
    try {
      const parsed_response = AdResponseSchema.parse(response_data);
      if (parsed_response.ads && parsed_response.ads.length > 0) {
        this.latest_ad = parsed_response.ads[0];
        this._log_info(`Ad fetched: ${this.latest_ad.ad_title}`);
      } else {
        this._log_info("No ads returned");
      }
    } catch (e) {
      this._log_error(`Invalid ad response format: ${e instanceof Error ? e.message : String(e)}`);
      this._circuit_breaker.record_error();
      this.latest_ad = null;
    }
  }

  public create_context(): string {
    /**
     * Create a context string for the last seen ad.
     */
    if (this.latest_ad) {
      return this._context_template
        .replace('{ad_title}', this.latest_ad.ad_title)
        .replace('{ad_description}', this.latest_ad.ad_description)
        .replace('{placement_template}', this.latest_ad.placement_template);
    }
    return "";
  }

  public get_latest_ad(): Ad | null {
    /**
     * Get the latest ad and clear it from memory.
     */
    const latest = this.latest_ad;
    this.latest_ad = null;
    return latest;
  }

  public get_state(): ClientState {
    /**
     * Get current client state.
     */
    return this._state;
  }

  public is_healthy(): boolean {
    /**
     * Check if the client is in a healthy state.
     */
    return (
      !this._circuit_breaker.is_open()
      && this._message_queue.length < this._max_queue_size
    );
  }
}

export {AsyncAdcortexChatClient}