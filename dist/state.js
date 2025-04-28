/**
 * State management for ADCortex chat client.
 *
 * Provides utility functions and classes to manage the client's state,
 * including managing error handling with a circuit breaker pattern and client operational states.
 */

/**
 * Returns the current UTC time.
 *
 * This function helps track the current time for operations that require timestamping,
 * such as managing state transitions and timeouts for circuit breakers.
 *
 * @returns {Date} The current UTC date and time.
 */
function utcNow() {
    return new Date();
}

/**
 * Enum representing the operational states of the client.
 *
 * This enum defines the states the ADCortex client can be in during its lifecycle, helping to manage
 * client operations and ensure that state transitions are handled correctly.
 *
 * @enum {number}
 * @readonly
 */
export var ClientState;
(function (ClientState) {
    /**
     * Indicates that the client is idle, not currently processing any requests.
     * @type {number}
     */
    ClientState[ClientState["IDLE"] = 1] = "IDLE";

    /**
     * Indicates that the client is currently processing a request or action.
     * @type {number}
     */
    ClientState[ClientState["PROCESSING"] = 2] = "PROCESSING";
})(ClientState || (ClientState = {}));

/**
 * Class implementing a circuit breaker pattern for error management.
 *
 * A circuit breaker is used to prevent making repetitive failed requests by opening the circuit
 * once a threshold of errors is reached, and allowing the system to reset after a timeout.
 */
export class CircuitBreaker {
    /**
     * Creates an instance of the CircuitBreaker class.
     *
     * The constructor sets up the error threshold, timeout for circuit reset, and logging behavior.
     *
     * @param {number} [threshold=5] - The number of errors before the circuit opens.
     * @param {number} [timeout=120] - The time in seconds before the circuit resets (default is 120 seconds).
     * @param {boolean} [disable_logging=false] - If true, disables error logging.
     */
    constructor(threshold = 5, timeout = 120, disable_logging = false) {
        /**
         * @private
         * @type {number}
         */
        this._threshold = threshold;
        
        /**
         * @private
         * @type {number}
         */
        this._timeout = timeout;

        /**
         * @private
         * @type {number}
         */
        this._error_count = 0;

        /**
         * @private
         * @type {Date | null}
         */
        this._reset_time = null;

        /**
         * @private
         * @type {boolean}
         */
        this._is_open = false;

        /**
         * @private
         * @type {boolean}
         */
        this._disable_logging = disable_logging;
    }

    /**
     * Logs an error message to the console if logging is not disabled.
     *
     * This method is used internally to log when the circuit breaker is triggered or when an error
     * threshold is exceeded.
     *
     * @private
     * @param {string} message - The error message to be logged.
     */
    _log_error(message) {
        if (!this._disable_logging) {
            console.error(message);
        }
    }

    /**
     * Records an error and updates the circuit breaker state.
     *
     * Each error is counted, and if the error count exceeds the threshold, 
     * the circuit is opened, and a reset time is set.
     */
    record_error() {
        this._error_count += 1;
        if (this._error_count >= this._threshold && !this._is_open) {
            this._is_open = true;
            const now = utcNow();
            this._reset_time = new Date(now.getTime() + this._timeout * 1000);
            this._log_error("Circuit breaker opened due to too many errors");
        }
    }

    /**
     * Checks if the circuit breaker is open and if it needs to reset.
     *
     * If the circuit is open, it will only reset after the timeout period has passed. Once reset,
     * the circuit will return to a closed state and error count will be reset.
     *
     * @returns {boolean} - Returns true if the circuit is still open, false otherwise.
     */
    is_open() {
        if (!this._is_open) {
            return false;
        }
        const now = utcNow();
        if (this._reset_time && now >= this._reset_time) {
            this._is_open = false;
            this._error_count = 0;
            this._reset_time = null;
            return false;
        }
        return true;
    }

    /**
     * Resets the state of the circuit breaker.
     *
     * This method allows manually resetting the circuit breaker, closing the circuit and clearing
     * any recorded errors or reset times.
     */
    reset() {
        this._is_open = false;
        this._error_count = 0;
        this._reset_time = null;
    }
}
