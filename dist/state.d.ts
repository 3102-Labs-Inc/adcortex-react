/**
 * State management for ADCortex chat client.
 */
/**
 * Client operational states.
 */
export declare enum ClientState {
    IDLE = 1,
    PROCESSING = 2
}
/**
 * Circuit breaker for handling error thresholds and timeouts.
 */
export declare class CircuitBreaker {
    private _threshold;
    private _timeout;
    private _error_count;
    private _reset_time;
    private _is_open;
    private _disable_logging;
    /**
     * @param threshold - Number of errors before circuit opens
     * @param timeout - Time in seconds before circuit resets
     * @param disable_logging - Whether to disable error logging
     */
    constructor(threshold?: number, timeout?: number, // 2 minutes
    disable_logging?: boolean);
    /**
     * Log error message if logging is enabled.
     */
    private _log_error;
    /**
     * Record an error and update circuit breaker state.
     */
    record_error(): void;
    /**
     * Check if circuit breaker is open and update state if needed.
     */
    is_open(): boolean;
    /**
     * Reset the circuit breaker state.
     */
    reset(): void;
}
