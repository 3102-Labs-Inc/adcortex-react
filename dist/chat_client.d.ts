/**
 * Chat Client for ADCortex API with sequential message processing
 */
import { Ad, Role, SessionInfo } from './types.js';
import { ClientState } from './state.js';
declare class AdcortexChatClient {
    private _session_info;
    private _context_template;
    private _api_key;
    private _timeout;
    private _headers;
    latest_ad: Ad | null;
    private _disable_logging;
    private _message_queue;
    private _max_queue_size;
    private _state;
    private _circuit_breaker;
    constructor(session_info: SessionInfo, context_template?: string, api_key?: string | null, timeout?: number, disable_logging?: boolean, max_queue_size?: number, circuit_breaker_threshold?: number, circuit_breaker_timeout?: number);
    private formatDate;
    private _log_info;
    private _log_error;
    __call__(role: Role, content: string): Promise<void>;
    private _process_queue;
    private _fetch_ad_batch;
    private _prepare_batch_payload;
    private _send_request;
    private _handle_response;
    create_context(latest_ad: Ad): string;
    get_latest_ad(): Ad | null;
    get_state(): ClientState;
    is_healthy(): boolean;
}
export { AdcortexChatClient };
