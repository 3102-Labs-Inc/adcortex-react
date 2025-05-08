/**
 * Chat Client for ADCortex API with sequential message processing
 */
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';
import { AdResponseSchema, MessageSchema, Role } from './types.js';
import { ClientState, CircuitBreaker } from './state.js';
const DEFAULT_CONTEXT_TEMPLATE = "Here is a product the user might like: {ad_title} - {ad_description}: here is a sample way to present it: {placement_template}";
const AD_FETCH_URL = "https://adcortex.3102labs.com/ads/matchv2";
axiosRetry(axios, {
    retries: 3, // number of retries
    retryDelay: axiosRetry.exponentialDelay, // exponential backoff
    retryCondition: (error) => {
        // Retry if it's a network error, idempotent request error, or connection aborted
        return (isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED");
    },
});
class AdcortexChatClient {
    constructor(session_info, context_template = DEFAULT_CONTEXT_TEMPLATE, api_key = null, timeout = 5, 
    // log_level: number|null = 40,
    disable_logging = false, max_queue_size = 100, circuit_breaker_threshold = 5, circuit_breaker_timeout = 120 // 2 minutes
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
        // Circuit breaker
        this._circuit_breaker = new CircuitBreaker(circuit_breaker_threshold, circuit_breaker_timeout, disable_logging);
        // Log level configuration is managed by the logging system in JS
        // We're using console.log/error in this implementation
        // # Configure logging
        //     if not disable_logging:
        //         logger.setLevel(log_level)
        //         if not logger.handlers:
        //             handler = logging.StreamHandler()
        //             formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        //             handler.setFormatter(formatter)
        //             logger.addHandler(handler)
        if (!this._api_key) {
            throw new Error("ADCORTEX_API_KEY is not set and not provided");
        }
    }
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    _log_info(message) {
        /**
         * Log info message if logging is enabled.
         */
        if (!this._disable_logging) {
            console.log(`${this.formatDate(new Date())} - chat_client - INFO - ${message}`);
            // console.info(message);
        }
    }
    _log_error(message) {
        /**
         * Log error message if logging is enabled.
         */
        if (!this._disable_logging) {
            console.error(`${this.formatDate(new Date())} - chat_client - ERROR - ${message}`);
            // console.error(message);
        }
    }
    async __call__(role, content) {
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
            this._message_queue.shift(); // Remove oldest message
            this._log_info("Queue full, removed oldest message");
        }
        this._message_queue.push(current_message);
        this._log_info(`Message queued: ${role} - ${content}`);
        // Process queue if not already processing, role is user, and circuit breaker is closed
        if (this._state === ClientState.IDLE && role === Role.user && !this._circuit_breaker.is_open()) {
            this._state = ClientState.PROCESSING;
            try {
                await this._process_queue();
            }
            catch (e) {
                // this._log_error(`Processing failed: ${e instanceof Error ? e.message : String(e)}`);
                this._log_error(`Processing failed: ${e instanceof Error ? e.message : String(e)}`);
                this._circuit_breaker.record_error();
            }
            finally {
                this._state = ClientState.IDLE;
            }
        }
    }
    async _process_queue() {
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
        }
        catch (e) {
            if (axios.isAxiosError(e)) {
                if (e.code === 'ECONNABORTED') {
                    this._log_error(`Batch request timed out: ${e.message}`);
                }
                else {
                    this._log_error(`Batch request failed: ${e.message}`);
                }
            }
            else if (e instanceof Error) {
                if (e.name === 'ValidationError') {
                    this._log_error(`Invalid response format: ${e.message}`);
                }
                else {
                    this._log_error(`Unexpected error processing batch: ${e.message}`);
                }
            }
            else {
                this._log_error(`Unknown error: ${String(e)}`);
            }
            this._circuit_breaker.record_error();
            throw e;
        }
    }
    async _fetch_ad_batch(messages) {
        /**
         * Fetch an ad based on all messages in a batch.
         */
        const payload = this._prepare_batch_payload(messages);
        console.log(payload);
        this._send_request(payload);
        // Using ts-retry-promise for retry functionality
        // await retry(
        //   async () => this._send_request(payload),
        //   { 
        //     retries: 3, 
        //     backoff: 'exponential', 
        //     delay: 1000, 
        //     maxDelay: 10000, 
        //     factor: 2,
        //     timeout: this._timeout * 1000,
        //     retryIf: (error) => {
        //       return axios.isAxiosError(error) && 
        //         (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK');
        //     }
        //   }
        // );
    }
    _prepare_batch_payload(messages) {
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
    async _send_request(payload) {
        /**
         * Send the request to the ADCortex API.
         */
        try {
            const response = await axios.post(AD_FETCH_URL, payload, {
                headers: this._headers,
                timeout: this._timeout * 1000
            });
            this._handle_response(response.data);
        }
        catch (e) {
            if (axios.isAxiosError(e)) {
                if (e.code === 'ECONNABORTED') {
                    this._log_error("Request timed out");
                }
                else {
                    this._log_error(`Error fetching ad: ${e.message}`);
                }
            }
            else {
                this._log_error(`Unknown error: ${String(e)}`);
            }
            throw e;
        }
    }
    _handle_response(response_data) {
        /**
         * Handle the response from the ad request.
         */
        try {
            const parsed_response = AdResponseSchema.parse(response_data);
            if (parsed_response.ads && parsed_response.ads.length > 0) {
                this.latest_ad = parsed_response.ads[0];
                this._log_info(`Ad fetched: ${this.latest_ad.ad_title}`);
            }
            else {
                this._log_info("No ads returned");
            }
        }
        catch (e) {
            this._log_error(`Invalid ad response format: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    create_context(latest_ad) {
        /**
         * Create a context string for the last seen ad.
         */
        return this._context_template
            .replace('{ad_title}', latest_ad.ad_title)
            .replace('{ad_description}', latest_ad.ad_description)
            .replace('{placement_template}', latest_ad.placement_template);
    }
    get_latest_ad() {
        /**
         * Get the latest ad and clear it from memory.
         */
        const latest = this.latest_ad;
        this.latest_ad = null;
        return latest;
    }
    get_state() {
        /**
         * Get current client state.
         */
        return this._state;
    }
    is_healthy() {
        /**
         * Check if the client is in a healthy state.
         */
        return (!this._circuit_breaker.is_open()
            && this._message_queue.length < this._max_queue_size);
    }
}
export { AdcortexChatClient };
