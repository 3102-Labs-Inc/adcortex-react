import { SessionInfo, Message, Ad } from './types';
declare class AdcortexClient {
    session_info: SessionInfo;
    context_template: string | null;
    api_key: string | null;
    base_url: string;
    headers: {
        "Content-Type": string;
        "X-API-KEY": string | null;
    };
    constructor(session_info: SessionInfo, context_template?: string, api_key?: null);
    _generate_payload(messages: Message[]): any;
    fetch_ad(messages: Message[]): Promise<Ad | null>;
    generate_context(ad: Ad): string;
}
export { AdcortexClient };
