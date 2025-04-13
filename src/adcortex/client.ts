// Client for ADCortex API 


import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import {SessionInfo, Message, Ad} from './types';

const DEFAULT_CONTEXT_TEMPLATE = "";

class AdcortexClient {
  session_info: SessionInfo;
  context_template: string|null;
  api_key: string|null;
  base_url: string;
  headers: { "Content-Type": string; "X-API-KEY": string|null; };

  constructor(
    session_info: SessionInfo, 
    context_template = DEFAULT_CONTEXT_TEMPLATE,
    api_key = null
  ) {
    this.session_info = session_info;
    this.context_template = context_template;
    this.api_key = api_key || process.env.ADCORTEX_API_KEY!;
    this.base_url = "https://adcortex.3102labs.com/ads/match";
    
    if (!this.api_key) {
      throw new Error("ADCORTEX_API_KEY is not set and not provided");
    }
    
    this.headers = {
      "Content-Type": "application/json",
      "X-API-KEY": this.api_key,
    };
  }

  _generate_payload(messages: Message[]): any {
    const payload = {
      "RGUID": this.session_info.session_id,
      "session_info": this.session_info,
      "user_data": this.session_info.user_info,
      "messages": messages,
      "platform": this.session_info.platform,
    };
    return payload;
  }

  // NOTE: @Rahul review this for functionality
  async fetchAd(messages: Message[]): Promise<Ad | null> {
    const payload = this._generate_payload(messages);
    try {
      const response = await axios.post(this.base_url, payload, { headers: this.headers });
      
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
    return this.context_template!.replace(/\{ad_title\}/g, ad.ad_title)
      .replace(/\{ad_description\}/g, ad.ad_description)
      .replace(/\{placement_template\}/g, ad.placement_template)
      .replace(/\{link\}/g, ad.link);
  }
}

export { AdcortexClient };