/**
 * Async Chat Client for ADCortex API with sequential message processing.
 *
 * This module provides an asynchronous implementation of the ADCortex chat client
 * with enhanced concurrency support for high-volume environments.
 */
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';
import axiosRetry, { isNetworkOrIdempotentRequestError } from 'axios-retry';
import { AdResponseSchema, MessageSchema, Role } from './types.js';
import { ClientState, CircuitBreaker } from './state.js';

// Load environment variables from .env file
dotenv.config();

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

/**
 * Asynchronous chat client for ADCortex API with message queue and circuit breaker support.
 *
 * This client provides asynchronous message processing with features like:
 * - Message queue management with FIFO behavior
 * - Circuit breaker pattern for error handling
 * - Batch processing of messages
 * - Automatic retries with exponential backoff
 * - Non-blocking task management for high-throughput scenarios
 * 
 * @example
 * ```javascript
 * // Create session info
 * const sessionInfo = SessionInfoSchema.parse({
 *   session_id: "session123",
 *   character_name: "Assistant",
 *   character_metadata: "Friendly AI assistant",
 *   user_info: {
 *     user_id: "user456",
 *     age: 25,
 *     gender: "male",
 *     location: "US",
 *     language: "en",
 *     interests: ["technology", "gaming"]
 *   },
 *   platform: {
 *     name: "MyApp",
 *     varient: "1.0.0"
 *   }
 * });
 * 
 * // Create async chat client
 * const chatClient = new AsyncAdcortexChatClient(sessionInfo);
 * 
 * // Process a message
 * await chatClient.__call__(Role.user, "I need a new gaming laptop");
 * 
 * // Check for ads
 * const latestAd = chatClient.get_latest_ad();
 * if (latestAd) {
 *   const context = chatClient.create_context();
 *   console.log("Ad Context:", context);
 * }
 * ```
 */
class AsyncAdcortexChatClient {
    /**
     * Creates a new instance of the AsyncAdcortexChatClient.
     * 
     * @param {Object} session_info - Session and user information for ad targeting
     * @param {string} [context_template=DEFAULT_CONTEXT_TEMPLATE] - Template string for formatting ad context
     * @param {string|null} [api_key=null] - API key for ADCortex API, reads from environment if not provided
     * @param {number} [timeout=10] - Request timeout in seconds (default is 10 seconds, longer than synchronous client)
     * @param {boolean} [disable_logging=false] - Whether to disable logging
     * @param {number} [max_queue_size=100] - Maximum number of messages in the queue
     * @param {number} [circuit_breaker_threshold=5] - Number of consecutive errors before circuit opens
     * @param {number} [circuit_breaker_timeout=120] - Time in seconds before circuit resets (2 minutes)
     * 
     * @throws {Error} if ADCORTEX_API_KEY is not set and not provided
     */
    constructor(session_info, context_template = DEFAULT_CONTEXT_TEMPLATE, api_key = null, timeout = 10, 
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
        this._processing_task = null;
        // Circuit breaker
        this._circuit_breaker = new CircuitBreaker(circuit_breaker_threshold, circuit_breaker_timeout, disable_logging);
        if (!this._api_key) {
            throw new Error("ADCORTEX_API_KEY is not set and not provided");
        }
    }

    /**
     * Formats a date object into a string with format YYYY-MM-DD HH:MM:SS.
     * @private
     * 
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Logs an info message if logging is enabled.
     * @private
     * 
     * @param {string} message - The message to log
     */
    _log_info(message) {
        /**
         * Log info message if logging is enabled.
         */
        if (!this._disable_logging) {
            console.log(`${this.formatDate(new Date())} - async_chat_client - INFO - ${message}`);
        }
    }

    /**
     * Logs an error message if logging is enabled.
     * @private
     * 
     * @param {string} message - The error message to log
     */
    _log_error(message) {
        /**
         * Log error message if logging is enabled.
         */
        if (!this._disable_logging) {
            console.error(`${this.formatDate(new Date())} - async_chat_client - ERROR - ${message}`);
        }
    }

    /**
     * Checks if a processing task is currently running.
     * @private
     * 
     * @returns {boolean} True if a task is running, false otherwise
     */
    _is_task_running() {
        /**
         * Check if processing task is running.
         */
        // return this._processing_task !== null && !this._processing_task!.done();
        return this._processing_task !== null && this._state === ClientState.PROCESSING;
    }

    /**
     * Processes a chat message and potentially fetches relevant ads asynchronously.
     * 
     * This method adds the message to the processing queue. If conditions are met
     * (client is idle, message is from user, circuit breaker is closed, no task is running),
     * it will asynchronously process the queue to fetch relevant advertisements.
     * 
     * @param {string} role - The role of the message sender (user or AI)
     * @param {string} content - The content of the message
     * @returns {Promise<void>} A Promise that resolves when the message has been processed
     * 
     * @example
     * ```javascript
     * // Process a user message
     * await asyncChatClient.__call__(Role.user, "I need a gaming laptop under $1500");
     * 
     * // Process an AI response (typically won't trigger ad fetch)
     * await asyncChatClient.__call__(Role.ai, "I can help you find gaming laptops in that price range!");
     * ```
     */
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
        if (this._state === ClientState.IDLE && role === Role.user && !this._circuit_breaker.is_open() && !this._is_task_running()) {
            this._state = ClientState.PROCESSING;
            this._processing_task = this._process_queue();
            try {
                await this._processing_task;
            }
            catch (e) {
                this._log_error(`Processing task failed: ${e instanceof Error ? e.message : String(e)}`);
                this._circuit_breaker.record_error();
            }
            finally {
                this._state = ClientState.IDLE;
                this._processing_task = null;
            }
        }
    }

    /**
     * Processes all messages in the queue as a single batch asynchronously.
     * @private
     * 
     * @returns {Promise<void>} A Promise that resolves when queue processing is complete
     */
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

    /**
     * Fetches an ad based on a batch of messages.
     * @private
     * 
     * @param {Array} messages - Array of messages to analyze for ad matching
     * @returns {Promise<void>} A Promise that resolves when the fetch is complete
     */
    async _fetch_ad_batch(messages) {
        /**
         * Fetch an ad based on all messages in a batch.
         */
        const payload = this._prepare_batch_payload(messages);
        await this._send_request(payload);
    }

    /**
     * Prepares the payload for the batch ad request.
     * @private
     * 
     * @param {Array} messages - Array of messages to include in the payload
     * @returns {Object} Formatted payload object ready to send to the API
     */
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

    /**
     * Sends the request to the ADCortex API asynchronously.
     * @private
     * 
     * @param {Object} payload - The payload to send to the API
     * @returns {Promise<void>} A Promise that resolves when the request is complete
     */
    async _send_request(payload) {
        /**
         * Send the request to the ADCortex API asynchronously.
         */
        try {
            const response = await axios.post(AD_FETCH_URL, payload, {
                headers: this._headers,
                timeout: this._timeout * 1000
            });
            await this._handle_response(response.data);
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

    /**
     * Handles the response from the ad request asynchronously.
     * @private
     * 
     * @param {Object} response_data - The response data from the API
     * @returns {Promise<void>} A Promise that resolves when the response handling is complete
     */
    async _handle_response(response_data) {
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
            this._circuit_breaker.record_error();
            this.latest_ad = null;
        }
    }

    /**
     * Creates a context string based on the latest ad.
     * 
     * This method uses the context template to create a string that can be
     * integrated into chat responses to present the ad in a natural way.
     * Unlike the synchronous client version, this method uses the latest_ad
     * property directly without requiring it as a parameter.
     * 
     * @returns {string} Formatted context string with ad information, or empty string if no ad is available
     * 
     * @example
     * ```javascript
     * // After processing a message
     * if (chatClient.latest_ad) {
     *   const context = chatClient.create_context();
     *   console.log(context);
     *   // Output: "Here is a product the user might like: Gaming Laptop - High performance gaming: Check it out!"
     * }
     * ```
     */
    create_context() {
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

    /**
     * Gets the latest ad and clears it from memory.
     * 
     * This method is designed to be called after processing messages to retrieve
     * any matched advertisements. Once retrieved, the ad is cleared from memory.
     * 
     * @returns {Object|null} The latest ad, or null if no ad was found
     * 
     * @example
     * ```javascript
     * await asyncChatClient.__call__(Role.user, "I need a gaming laptop");
     * const ad = asyncChatClient.get_latest_ad();
     * if (ad) {
     *   console.log(`Found ad: ${ad.ad_title}`);
     * } else {
     *   console.log("No relevant ads found");
     * }
     * ```
     */
    get_latest_ad() {
        /**
         * Get the latest ad and clear it from memory.
         */
        const latest = this.latest_ad;
        this.latest_ad = null;
        return latest;
    }

    /**
     * Gets the current client state.
     * 
     * @returns {ClientState} Current state of the client (IDLE or PROCESSING)
     */
    get_state() {
        /**
         * Get current client state.
         */
        return this._state;
    }

    /**
     * Checks if the client is in a healthy state.
     * 
     * A client is considered healthy when:
     * - The circuit breaker is closed (not in error state)
     * - The message queue is not full
     * 
     * @returns {boolean} Boolean indicating if the client is healthy
     * 
     * @example
     * ```javascript
     * if (!asyncChatClient.is_healthy()) {
     *   console.log("Client is in an unhealthy state, waiting before sending more messages...");
     *   // Implement backoff strategy
     * }
     * ```
     */
    is_healthy() {
        /**
         * Check if the client is in a healthy state.
         */
        return (!this._circuit_breaker.is_open()
            && this._message_queue.length < this._max_queue_size);
    }
}

export { AsyncAdcortexChatClient };