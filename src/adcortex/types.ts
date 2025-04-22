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
export enum Gender {
  male = "male",
  female = "female",
  other = "other"
}

/**
 * Role enumeration.
 *
 * Attributes:
 *     user: Indicates that the message sender is a user.
 *     ai: Indicates that the message sender is an AI.
 */
export enum Role {
  user = "user",
  ai = "ai"
}

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
export enum Interest {
  flirting = "flirting",
  gaming = "gaming",
  sports = "sports",
  music = "music",
  travel = "travel",
  technology = "technology",
  art = "art",
  cooking = "cooking",
  all = "all"
}

/**
 * Language enumeration.
 */
export enum Language {
  ar = "ar",  // Arabic
  bg = "bg",  // Bulgarian
  ca = "ca",  // Catalan
  cs = "cs",  // Czech
  da = "da",  // Danish
  de = "de",  // German
  el = "el",  // Greek
  en = "en",  // English
  es = "es",  // Spanish
  et = "et",  // Estonian
  fa = "fa",  // Persian
  fi = "fi",  // Finnish
  fr = "fr",  // French
  gl = "gl",  // Galician
  gu = "gu",  // Gujarati
  he = "he",  // Hebrew
  hi = "hi",  // Hindi
  hr = "hr",  // Croatian
  hu = "hu",  // Hungarian
  hy = "hy",  // Armenian
  id = "id",  // Indonesian
  it = "it",  // Italian
  ja = "ja",  // Japanese
  ka = "ka",  // Georgian
  ko = "ko",  // Korean
  ku = "ku",  // Kurdish
  lt = "lt",  // Lithuanian
  lv = "lv",  // Latvian
  mk = "mk",  // Macedonian
  mn = "mn",  // Mongolian
  mr = "mr",  // Marathi
  ms = "ms",  // Malay
  my = "my",  // Burmese
  nb = "nb",  // Norwegian Bokmål
  nl = "nl",  // Dutch
  pl = "pl",  // Polish
  pt = "pt",  // Portuguese
  ro = "ro",  // Romanian
  ru = "ru",  // Russian
  sk = "sk",  // Slovak
  sl = "sl",  // Slovenian
  sq = "sq",  // Albanian
  sr = "sr",  // Serbian
  sv = "sv",  // Swedish
  th = "th",  // Thai
  tr = "tr",  // Turkish
  uk = "uk",  // Ukrainian
  ur = "ur",  // Urdu
  vi = "vi"   // Vietnamese
}

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

export type Platform = z.infer<typeof PlatformSchema>;

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

export type UserInfo = z.infer<typeof UserInfoSchema>;

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

export type SessionInfo = z.infer<typeof SessionInfoSchema>;

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

export type Message = z.infer<typeof MessageSchema>;

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

export type Ad = z.infer<typeof AdSchema>;

/**
 * Schema for validating ADCortex API responses.
 *
 * Attributes:
 *     ads (Ad[]): List of ads returned by the API.
 */
export const AdResponseSchema = z.object({
  ads: z.array(AdSchema)
});

export type AdResponse = z.infer<typeof AdResponseSchema>;