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
 * Attributes:
 *     male: Represents the male gender.
 *     female: Represents the female gender.
 *     other: Represents any gender not covered by male or female.
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
 * Attributes:
 *     user: Indicates that the message sender is a user.
 *     ai: Indicates that the message sender is an AI.
 */
export var Role;
(function (Role) {
    Role["user"] = "user";
    Role["ai"] = "ai";
})(Role || (Role = {}));
/**
 * Interest enumeration.
 *
 * Attributes:
 *     flirting: Indicates an interest in flirting.
 *     gaming: Indicates an interest in gaming.
 *     sports: Indicates an interest in sports.
 *     music: Indicates an interest in music.
 *     travel: Indicates an interest in travel.
 *     technology: Indicates an interest in technology.
 *     art: Indicates an interest in art.
 *     cooking: Indicates an interest in cooking.
 *     all: Represents all interests.
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
    Language["vi"] = "vi"; // Vietnamese
})(Language || (Language = {}));
// Zod Schemas
/**
 * Contains platform-related metadata.
 *
 * Attributes:
 *     name (string): Platform name
 *     varient (string): varient for experimentation
 */
export const PlatformSchema = z.object({
    name: z.string(),
    varient: z.string().default("default")
});
/**
 * Stores user information for ADCortex API.
 *
 * Attributes:
 *     user_id (string): Unique identifier for the user.
 *     age (number): User's age.
 *     gender (string): User's gender (must be one of the Gender enum values).
 *     location (string): User's location (ISO 3166-1 alpha-2 code).
 *     language (string): Preferred language.
 *     interests (Interest[]): List of user's interests.
 */
export const UserInfoSchema = z.object({
    user_id: z.string(),
    age: z.number().refine(val => val > 0, {
        message: "Age must be greater than 0"
    }),
    gender: z.nativeEnum(Gender),
    location: z.string().refine(val => {
        // Convert to uppercase for validation
        const upperVal = val.toUpperCase();
        // Check if it's a valid ISO 3166-1 alpha-2 code
        return Object.keys(countries).includes(upperVal);
    }, {
        message: "Invalid country code. Must be a valid ISO 3166-1 alpha-2 code."
    }),
    language: z.nativeEnum(Language),
    interests: z.array(z.nativeEnum(Interest))
});
/**
 * Stores session details including user.
 *
 * Attributes:
 *     session_id (string): Unique identifier for the session.
 *     character_name (string): Name of the character (assistant).
 *     character_metadata (string): Additional metadata for the character as a string.
 *     user_info (UserInfo): User information.
 *     platform (Platform): Platform information.
 */
export const SessionInfoSchema = z.object({
    session_id: z.string(),
    character_name: z.string(),
    character_metadata: z.string(),
    user_info: UserInfoSchema,
    platform: PlatformSchema
});
/**
 * Represents a single message in a conversation.
 *
 * Attributes:
 *     role (Role): The role of the message sender (either user or AI).
 *     content (string): The content of the message.
 */
export const MessageSchema = z.object({
    role: z.nativeEnum(Role),
    content: z.string()
    // timestamp: z.number()  // Add timestamp field
});
/**
 * Represents an advertisement fetched via the ADCortex API.
 *
 * Attributes:
 *     ad_title (string): Title of the advertisement.
 *     ad_description (string): Description of the advertisement.
 *     placement_template (string): Template used for ad placement.
 *     link (string): URL link to the advertised product or service.
 */
export const AdSchema = z.object({
    ad_title: z.string(),
    ad_description: z.string(),
    placement_template: z.string(),
    link: z.string()
});
/**
 * Schema for validating ADCortex API responses.
 *
 * Attributes:
 *     ads (Ad[]): List of ads returned by the API.
 */
export const AdResponseSchema = z.object({
    ads: z.array(AdSchema)
});
