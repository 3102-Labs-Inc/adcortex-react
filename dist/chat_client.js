/**
 * Chat Client for ADCortex API
 */
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { Message, Ad } from './types.js';
const DEFAULT_CONTEXT_TEMPLATE = "Here is a product the user might like: {ad_title} - {ad_description} - {link}";
const AD_FETCH_URL = "https://adcortex.3102labs.com/ads/match";
class AdcortexChatClient {
    constructor(sessionInfo, context_template = DEFAULT_CONTEXT_TEMPLATE, apiKey = null, num_messages_before_ad = 3, num_messages_between_ads = 2) {
        this.session_info = sessionInfo;
        this.context_template = context_template;
        this.apiKey = apiKey || process.env.ADCORTEX_API_KEY;
        this.headers = {
            "Content-Type": "application/json",
            "X-API-KEY": this.apiKey,
        };
        if (!this.apiKey) {
            throw new Error("ADCORTEX_API_KEY is not set and not provided");
        }
        this.messages = []; // Initialize messages
        this.num_messages_before_ad = num_messages_before_ad;
        this.num_messages_before_ad = num_messages_between_ads;
        this.latest_ad = null;
        this.shown_ads = []; // Store shown ads and their message counts
    }
    /**
     * Add a message and fetch an ad if applicable.
     * @param {string} role - The role of the message sender
     * @param {string} content - The content of the message
     * @returns {Promise<Record<string, any>|null>} - The ad if one should be shown, otherwise null
     */
    async call(role, content) {
        this.messages.push(new Message({ role: role, content: content })); // Add the message
        if (this._should_show_ad()) {
            return await this._fetch_ad(); // Fetch and return the ad if applicable
        }
        return null; // No ad to show
    }
    /**
     * Fetch an ad based on the current messages.
     * @returns {Promise<Record<string, any>t|null>} - The ad data or null if no ad is available
     * @private
     */
    async _fetch_ad() {
        if (this.messages.length < this.num_messages_before_ad) {
            // console.warn("Not enough messages to fetch an ad.");
            return { ads: [] }; // Not enough messages to fetch an ad
        }
        const payload = this._prepare_payload();
        const response_data = await this._send_request(payload);
        if (response_data) {
            return this._handle_response(response_data);
        }
        return null;
    }
    /**
     * Prepare the payload for the ad request.
     * @returns {Record<string, any>} - The prepared payload
     * @private
     */
    _prepare_payload() {
        return {
            "RGUID": this.session_info.session_id,
            "session_info": this.session_info,
            "user_data": this.session_info.user_info,
            "messages": this.messages.slice(-this.num_messages_before_ad),
            "platform": this.session_info.platform,
        };
    }
    /**
     * Send the request to the ADCortex API and return the response.
     * @param {<Record<string, any>>} payload - The request payload
     * @returns {Promise<Record<string, any>|null>} - The response data or null if there was an error
     * @private
     */
    async _send_request(payload) {
        try {
            const response = await axios.post(AD_FETCH_URL, payload, { headers: this.headers });
            return response.data;
        }
        catch (error) {
            // console.error(`Error fetching ad: ${error}`);
            return null;
        }
    }
    /**
     * Handle the response from the ad request.
     * @param {Record<string, any>} response_data - The response data from the API
     * @returns {Record<string, any>|null} - The processed ad data or null
     * @private
     */
    _handle_response(response_data) {
        const ads = response_data.ads || [];
        if (ads.length) {
            this.latest_ad = new Ad(ads[0]); // Store the last ad seen
            // Store the ad and the current message count
            this.shown_ads.push({
                ad: this.latest_ad,
                message_count: this.messages.length
            });
            // console.info(`Ad fetched: ${this.latestAd.ad_title}`);
            return this.latest_ad;
        }
        // console.info("No ads returned.");
        return {};
    }
    /**
     * Determine if an ad should be shown based on message count.
     * @returns {boolean} - Whether an ad should be shown
     * @private
     */
    _should_show_ad() {
        if (!this.shown_ads.length) {
            return this.messages.length >= this.num_messages_before_ad;
        }
        const last_shown_ad = this.shown_ads[this.shown_ads.length - 1];
        const messages_since_last_ad = this.messages.length - last_shown_ad.messageCount;
        return messages_since_last_ad >= this.num_messages_between_ads;
    }
    /**
     * Create a context string for the last seen ad.
     * @returns {string} - The formatted context string
     */
    create_context() {
        if (this.latest_ad) {
            return this.context_template
                .replace(/{ad_title}/g, this.latest_ad.ad_title)
                .replace(/{ad_description}/g, this.latest_ad.ad_description)
                .replace(/{link}/g, this.latest_ad.link);
        }
        return "";
    }
}
export { AdcortexChatClient, DEFAULT_CONTEXT_TEMPLATE, AD_FETCH_URL };
