/**
 * Types for ADCortex API.
 * 
 * This module defines data classes and enumerations used by the ADCortex API client.
 */
import z from 'zod';
import iso3166 from 'iso-3166-1';

/**
 * Gender enumeration.
 * 
 * @readonly
 * @enum {string}
 */
export const Gender = {
  /**
   * Represents the male gender.
   */
  male: "male",
  /**
   * Represents the female gender.
   */
  female: "female",
  /**
   * Represents any gender not covered by male or female.
   */
  other: "other"
};

/**
 * Role enumeration.
 * 
 * @readonly
 * @enum {string}
 */
export const Role = {
  /**
   * Indicates that the message sender is a user.
   */
  user: "user",
  /**
   * Indicates that the message sender is an AI.
   */
  ai: "ai"
};

/**
 * Interest enumeration.
 * 
 * @readonly
 * @enum {string}
 */
export const Interest = {
  /**
   * Indicates an interest in flirting.
   */
  flirting: "flirting",
  /**
   * Indicates an interest in gaming.
   */
  gaming: "gaming",
  /**
   * Indicates an interest in sports.
   */
  sports: "sports",
  /**
   * Indicates an interest in music.
   */
  music: "music",
  /**
   * Indicates an interest in travel.
   */
  travel: "travel",
  /**
   * Indicates an interest in technology.
   */
  technology: "technology",
  /**
   * Indicates an interest in art.
   */
  art: "art",
  /**
   * Indicates an interest in cooking.
   */
  cooking: "cooking",
  /**
   * Represents all interests.
   */
  all: "all" // Option for all interests
};

// Schema for UserInfo - equivalent to Pydantic BaseModel
const UserInfoSchema = z.object({
  /**
   * Unique identifier for the user.
   */
  user_id: z.string(),
  /**
   * User's age.
   */
  age: z.number().int(),
  /**
   * User's gender.
   */
  gender: z.enum([Gender.male, Gender.female, Gender.other]),
  /**
   * User's location (ISO 3166-1 alpha-2 code).
   */
  location: z.string().refine(
    (val) => !!iso3166.whereAlpha2(val),
    (val) => ({ message: `${val} is not a valid country code.` })
  ),
  /**
   * Preferred language (must be "english").
   */
  language: z.string().default("en").refine(
    (val) => val.toLowerCase() === "en",
    { message: "Language must be 'english'." }
  ),
  /**
   * A list of user's interests.
   */
  interests: z.array(
    z.enum([
      Interest.flirting, Interest.gaming, Interest.sports, 
      Interest.music, Interest.travel, Interest.technology,
      Interest.art, Interest.cooking, Interest.all
    ])
  )
});

// Schema for Platform
const PlatformSchema = z.object({
  /**
   * Name of the platform.
   */
  name: z.string(),
  /**
   * Version of the platform.
   */
  version: z.string()
});

// Schema for SessionInfo
const SessionInfoSchema = z.object({
  /**
   * Unique identifier for the session.
   */
  session_id: z.string(),
  /**
   * Name of the character (assistant).
   */
  character_name: z.string(),
  /**
   * Additional metadata for the character.
   */
  character_metadata: z.record(z.any()).default({ description: "" }),
  /**
   * User information.
   */
  user_info: UserInfoSchema,
  /**
   * Platform details.
   */
  platform: PlatformSchema
});

// Schema for Message
const MessageSchema = z.object({
  /**
   * The role of the message sender (either user or AI).
   */
  role: z.enum([Role.user, Role.ai]),
  /**
   * The content of the message.
   */
  content: z.string()
});

// Schema for Ad
const AdSchema = z.object({
  /**
   * Identifier for the advertisement.
   */
  idx: z.number().int(),
  /**
   * Title of the advertisement.
   */
  ad_title: z.string(),
  /**
   * Description of the advertisement.
   */
  ad_description: z.string(),
  /**
   * Template used for ad placement.
   */
  placement_template: z.string(),
  /**
   * URL link to the advertised product or service.
   */
  link: z.string()
});

// Create class-like constructs with validation
export class UserInfo {

  user_id: string;
  age: number;
  gender: typeof Gender;
  location: string;
  language: string;
  interests: Array<typeof Interest>;

  constructor(data: unknown) {
    const validated = UserInfoSchema.parse(data);
    Object.assign(this, validated);
  }
}

export class Platform {

  name: string;
  version: string;

  constructor(data: unknown) {
    const validated = PlatformSchema.parse(data);
    Object.assign(this, validated);
  }
}

export class SessionInfo {

  session_id: string;
  character_name: string;
  character_metadata: Record<string, any>;
  user_info: UserInfo;
  platform: Platform;

  constructor(data: unknown) {
    const validated = SessionInfoSchema.parse(data);
    Object.assign(this, validated);
  }
}

export class Message {

  role: typeof Role;
  content: string;

  constructor(data: unknown) {
    const validated = MessageSchema.parse(data);
    Object.assign(this, validated);
  }
}

export class Ad {

  idx: number;
  ad_title: string;
  ad_description: string;
  placement_template: string;
  link: string;

  constructor(data: unknown) {
    const validated = AdSchema.parse(data);
    Object.assign(this, validated);
  }
}

module.exports = {
  // Enums
  Gender,
  Role,
  Interest,
  // Schemas
  UserInfoSchema,
  PlatformSchema,
  SessionInfoSchema,
  MessageSchema,
  AdSchema,
  // Classes
  UserInfo,
  Platform,
  SessionInfo,
  Message,
  Ad
};