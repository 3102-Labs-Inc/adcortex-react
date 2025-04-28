/**
 * Types for ADCortex API.
 *
 * This module defines interfaces, enums, and validation schemas used by the ADCortex API client.
 */

import { z } from 'zod';
import { countries } from 'countries-list';

/**
 * Gender enumeration.
 * 
 * @enum {string}
 * @property {string} male - Represents the male gender.
 * @property {string} female - Represents the female gender.
 * @property {string} other - Represents any other gender.
 */
export var Gender;
(function (Gender) {
    Gender["male"] = "male";
    Gender["female"] = "female";
    Gender["other"] = "other";
})(Gender || (Gender = {}));

/**
 * Role enumeration.
 * 
 * @enum {string}
 * @property {string} user - Indicates that the message sender is a user.
 * @property {string} ai - Indicates that the message sender is an AI.
 */
export var Role;
(function (Role) {
    Role["user"] = "user";
    Role["ai"] = "ai";
})(Role || (Role = {}));

/**
 * Interest enumeration.
 * 
 * @enum {string}
 * @property {string} flirting - Interest in flirting.
 * @property {string} gaming - Interest in gaming.
 * @property {string} sports - Interest in sports.
 * @property {string} music - Interest in music.
 * @property {string} travel - Interest in travel.
 * @property {string} technology - Interest in technology.
 * @property {string} art - Interest in art.
 * @property {string} cooking - Interest in cooking.
 * @property {string} all - Interest in all topics.
 */
export var Interest;
(function (Interest) {
    Interest["flirting"] = "flirting";
    Interest["gaming"] = "gaming";
    Interest["sports"] = "sports";
    Interest["music"] = "music";
    Interest["travel"] = "travel";
    Interest["technology"] = "technology";
    Interest["art"] = "art";
    Interest["cooking"] = "cooking";
    Interest["all"] = "all";
})(Interest || (Interest = {}));

/**
 * Language enumeration.
 * 
 * @enum {string}
 * Supported ISO 639-1 two-letter language codes.
 */
export var Language;
(function (Language) {
    Language["ar"] = "ar";
    Language["bg"] = "bg";
    Language["ca"] = "ca";
    Language["cs"] = "cs";
    Language["da"] = "da";
    Language["de"] = "de";
    Language["el"] = "el";
    Language["en"] = "en";
    Language["es"] = "es";
    Language["et"] = "et";
    Language["fa"] = "fa";
    Language["fi"] = "fi";
    Language["fr"] = "fr";
    Language["gl"] = "gl";
    Language["gu"] = "gu";
    Language["he"] = "he";
    Language["hi"] = "hi";
    Language["hr"] = "hr";
    Language["hu"] = "hu";
    Language["hy"] = "hy";
    Language["id"] = "id";
    Language["it"] = "it";
    Language["ja"] = "ja";
    Language["ka"] = "ka";
    Language["ko"] = "ko";
    Language["ku"] = "ku";
    Language["lt"] = "lt";
    Language["lv"] = "lv";
    Language["mk"] = "mk";
    Language["mn"] = "mn";
    Language["mr"] = "mr";
    Language["ms"] = "ms";
    Language["my"] = "my";
    Language["nb"] = "nb";
    Language["nl"] = "nl";
    Language["pl"] = "pl";
    Language["pt"] = "pt";
    Language["ro"] = "ro";
    Language["ru"] = "ru";
    Language["sk"] = "sk";
    Language["sl"] = "sl";
    Language["sq"] = "sq";
    Language["sr"] = "sr";
    Language["sv"] = "sv";
    Language["th"] = "th";
    Language["tr"] = "tr";
    Language["uk"] = "uk";
    Language["ur"] = "ur";
    Language["vi"] = "vi";
})(Language || (Language = {}));

// Zod Schemas

/**
 * Schema for platform metadata.
 *
 * @typedef {Object} Platform
 * @property {string} name - Platform name (e.g., website, app).
 * @property {string} varient - Variant for experimentation (default: "default").
 */
export const PlatformSchema = z.object({
    name: z.string(),
    varient: z.string().default("default")
});

/**
 * Schema for user information.
 *
 * @typedef {Object} UserInfo
 * @property {string} user_id - Unique identifier for the user.
 * @property {number} age - User's age (must be greater than 0).
 * @property {Gender} gender - User's gender.
 * @property {string} location - ISO 3166-1 alpha-2 country code.
 * @property {Language} language - User's preferred language.
 * @property {Interest[]} interests - List of user interests.
 */
export const UserInfoSchema = z.object({
    user_id: z.string(),
    age: z.number().refine(val => val > 0, {
        message: "Age must be greater than 0"
    }),
    gender: z.nativeEnum(Gender),
    location: z.string().refine(val => {
        const upperVal = val.toUpperCase();
        return Object.keys(countries).includes(upperVal);
    }, {
        message: "Invalid country code. Must be a valid ISO 3166-1 alpha-2 code."
    }),
    language: z.nativeEnum(Language),
    interests: z.array(z.nativeEnum(Interest))
});

/**
 * Schema for session information.
 *
 * @typedef {Object} SessionInfo
 * @property {string} session_id - Unique identifier for the session.
 * @property {string} character_name - Name of the AI character/assistant.
 * @property {string} character_metadata - Additional metadata as a serialized string.
 * @property {UserInfo} user_info - Associated user information.
 * @property {Platform} platform - Associated platform information.
 */
export const SessionInfoSchema = z.object({
    session_id: z.string(),
    character_name: z.string(),
    character_metadata: z.string(),
    user_info: UserInfoSchema,
    platform: PlatformSchema
});

/**
 * Schema for a single message in a conversation.
 *
 * @typedef {Object} Message
 * @property {Role} role - Role of the sender (user or AI).
 * @property {string} content - Content of the message.
 */
export const MessageSchema = z.object({
    role: z.nativeEnum(Role),
    content: z.string()
    // timestamp: z.number()  // Optional: Uncomment if timestamp tracking is needed
});

/**
 * Schema for an advertisement object.
 *
 * @typedef {Object} Ad
 * @property {string} ad_title - Title of the advertisement.
 * @property {string} ad_description - Description of the advertisement.
 * @property {string} placement_template - Template used for placing the ad.
 * @property {string} link - URL link to the advertised service or product.
 */
export const AdSchema = z.object({
    ad_title: z.string(),
    ad_description: z.string(),
    placement_template: z.string(),
    link: z.string()
});

/**
 * Schema for API response containing advertisements.
 *
 * @typedef {Object} AdResponse
 * @property {Ad[]} ads - List of advertisements.
 */
export const AdResponseSchema = z.object({
    ads: z.array(AdSchema)
});
