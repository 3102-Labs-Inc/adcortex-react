// Client for ADCortex API 


import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import {SessionInfo, Message, Ad} from './types';

const DEFAULT_CONTEXT_TEMPLATE = "";

class AdcortexClient {
  sessionInfo: SessionInfo;
  contextTemplate: string|null;
  apiKey: string|null;
  baseUrl: string;
  headers: { "Content-Type": string; "X-API-KEY": string|null; };

  constructor(
    sessionInfo: any, 
    contextTemplate = DEFAULT_CONTEXT_TEMPLATE,
    apiKey = null
  ) {
    this.sessionInfo = sessionInfo;
    this.contextTemplate = contextTemplate;
    this.apiKey = apiKey || process.env.ADCORTEX_API_KEY!;
    this.baseUrl = "https://adcortex.3102labs.com/ads/match";
    
    if (!this.apiKey) {
      throw new Error("ADCORTEX_API_KEY is not set and not provided");
    }
    
    this.headers = {
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
    };
  }

  _generate_payload(messages: Message[]): any {
    const payload = {
      "RGUID": this.sessionInfo.session_id,
      "session_info": this.sessionInfo,
      "user_data": this.sessionInfo.user_info,
      "messages": messages,
      "platform": this.sessionInfo.platform,
    };
    return payload;
  }

  // NOTE: @Rahul review this for functionality
  async fetchAd(messages: Message[]): Promise<Ad | null> {
    const payload = this._generate_payload(messages);
    try {
      const response = await axios.post(this.baseUrl, payload, { headers: this.headers });
      
      // Extract the ad from the response
      const ads = response.data.ads || [];
      if (!ads.length) {
        return null; // Return null if no ads are found
      }
      
      return ads[0]; // Return the first ad
    } catch (error) {
      throw error;
    }
  }

  generateContext(ad: Ad) {
    return this.contextTemplate!.replace(/\{ad_title\}/g, ad.ad_title)
      .replace(/\{ad_description\}/g, ad.ad_description)
      .replace(/\{placement_template\}/g, ad.placement_template)
      .replace(/\{link\}/g, ad.link);
  }
}

export { AdcortexClient };