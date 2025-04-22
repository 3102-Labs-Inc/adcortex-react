/**
 * State management for ADCortex chat client.
 */

function utcNow(): Date {
    return new Date();
}
  
/**
 * Client operational states.
 */
export enum ClientState {
    IDLE = 1,
    PROCESSING = 2
}

/**
 * Circuit breaker for handling error thresholds and timeouts.
 */
export class CircuitBreaker {
    private _threshold: number;
    private _timeout: number;
    private _error_count: number;
    private _reset_time: Date | null;
    private _is_open: boolean;
    private _disable_logging: boolean;

    /**
     * @param threshold - Number of errors before circuit opens
     * @param timeout - Time in seconds before circuit resets
     * @param disable_logging - Whether to disable error logging
     */
    constructor(
    threshold: number = 5,
    timeout: number = 120, // 2 minutes
    disable_logging: boolean = false
    ) {
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
    private _log_error(message: string): void {
    if (!this._disable_logging) {
        console.error(message);
    }
    }

    /**
     * Record an error and update circuit breaker state.
     */
    public record_error(): void {
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
    public is_open(): boolean {
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
    public reset(): void {
    this._is_open = false;
    this._error_count = 0;
    this._reset_time = null;
    }
}