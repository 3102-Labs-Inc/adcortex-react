/**
 * State management for ADCortex chat client.
 */
function utcNow() {
    return new Date();
}
/**
 * Client operational states.
 */
export var ClientState;
(function (ClientState) {
    ClientState[ClientState["IDLE"] = 1] = "IDLE";
    ClientState[ClientState["PROCESSING"] = 2] = "PROCESSING";
})(ClientState || (ClientState = {}));
/**
 * Circuit breaker for handling error thresholds and timeouts.
 */
export class CircuitBreaker {
    /**
     * @param threshold - Number of errors before circuit opens
     * @param timeout - Time in seconds before circuit resets
     * @param disable_logging - Whether to disable error logging
     */
    constructor(threshold = 5, timeout = 120, // 2 minutes
    disable_logging = false) {
        this._threshold = threshold;
        this._timeout = timeout;
        this._error_count = 0;
        this._reset_time = null;
        this._is_open = false;
        this._disable_logging = disable_logging;
    }
    /**
     * Log error message if logging is enabled.
     */
    _log_error(message) {
        if (!this._disable_logging) {
            console.error(message);
        }
    }
    /**
     * Record an error and update circuit breaker state.
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
     * Check if circuit breaker is open and update state if needed.
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
     * Reset the circuit breaker state.
     */
    reset() {
        this._is_open = false;
        this._error_count = 0;
        this._reset_time = null;
    }
}
