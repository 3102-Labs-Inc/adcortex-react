import { SessionInfo, Message, Ad } from './types';
declare const DEFAULT_CONTEXT_TEMPLATE = "Here is a product the user might like: {ad_title} - {ad_description} - {link}";
declare const AD_FETCH_URL = "https://adcortex.3102labs.com/ads/match";
declare class AdcortexChatClient {
    session_info: SessionInfo;
    context_template: string | null;
    api_key: string | null;
    num_messages_before_ad: number;
    num_messages_between_ads: number;
    headers: {
        "Content-Type": string;
        "X-API-KEY": string | null;
    };
    messages: Message[];
    latest_ad: Ad | null;
    shown_ads: Record<string, any>[];
    constructor(sessionInfo: SessionInfo, context_template?: string, api_key?: null, num_messages_before_ad?: number, num_messages_between_ads?: number);
    /**
     * Add a message and fetch an ad if applicable.
     * @param {string} role - The role of the message sender
     * @param {string} content - The content of the message
     * @returns {Promise<Record<string, any>|null>} - The ad if one should be shown, otherwise null
     */
    call(role: string, content: string): Promise<Record<string, any> | null>;
    /**
     * Fetch an ad based on the current messages.
     * @returns {Promise<Record<string, any>t|null>} - The ad data or null if no ad is available
     * @private
     */
    _fetch_ad(): Promise<Record<string, any> | null>;
    /**
     * Prepare the payload for the ad request.
     * @returns {Record<string, any>} - The prepared payload
     * @private
     */
    _prepare_payload(): {
        RGUID: string;
        session_info: SessionInfo;
        user_data: import("./types").UserInfo;
        messages: Message[];
        platform: import("./types").Platform;
    };
    /**
     * Send the request to the ADCortex API and return the response.
     * @param {<Record<string, any>>} payload - The request payload
     * @returns {Promise<Record<string, any>|null>} - The response data or null if there was an error
     * @private
     */
    _send_request(payload: Record<string, any>): Promise<Record<string, any> | null>;
    /**
     * Handle the response from the ad request.
     * @param {Record<string, any>} response_data - The response data from the API
     * @returns {Record<string, any>|null} - The processed ad data or null
     * @private
     */
    _handle_response(response_data: Record<string, any>): Record<string, any> | null;
    /**
     * Determine if an ad should be shown based on message count.
     * @returns {boolean} - Whether an ad should be shown
     * @private
     */
    _should_show_ad(): boolean;
    /**
     * Create a context string for the last seen ad.
     * @returns {string} - The formatted context string
     */
    create_context(): string;
}
export { AdcortexChatClient, DEFAULT_CONTEXT_TEMPLATE, AD_FETCH_URL };
