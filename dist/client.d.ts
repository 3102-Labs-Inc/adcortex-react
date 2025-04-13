import { SessionInfo, Message, Ad } from './types';
declare class AdcortexClient {
    sessionInfo: SessionInfo;
    contextTemplate: string | null;
    apiKey: string | null;
    baseUrl: string;
    headers: {
        "Content-Type": string;
        "X-API-KEY": string | null;
    };
    constructor(sessionInfo: any, contextTemplate?: string, apiKey?: null);
    _generate_payload(messages: Message[]): any;
    fetchAd(messages: Message[]): Promise<Ad | null>;
    generateContext(ad: Ad): string;
}
export { AdcortexClient };
