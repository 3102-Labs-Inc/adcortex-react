/**
 * Types for ADCortex API.
 *
 * This module defines data classes and enumerations used by the ADCortex API client.
 */
import z from 'zod';
/**
 * Gender enumeration.
 *
 * @readonly
 * @enum {string}
 */
export declare const Gender: {
    /**
     * Represents the male gender.
     */
    male: string;
    /**
     * Represents the female gender.
     */
    female: string;
    /**
     * Represents any gender not covered by male or female.
     */
    other: string;
};
/**
 * Role enumeration.
 *
 * @readonly
 * @enum {string}
 */
export declare const Role: {
    /**
     * Indicates that the message sender is a user.
     */
    user: string;
    /**
     * Indicates that the message sender is an AI.
     */
    ai: string;
};
/**
 * Interest enumeration.
 *
 * @readonly
 * @enum {string}
 */
export declare const Interest: {
    /**
     * Indicates an interest in flirting.
     */
    flirting: string;
    /**
     * Indicates an interest in gaming.
     */
    gaming: string;
    /**
     * Indicates an interest in sports.
     */
    sports: string;
    /**
     * Indicates an interest in music.
     */
    music: string;
    /**
     * Indicates an interest in travel.
     */
    travel: string;
    /**
     * Indicates an interest in technology.
     */
    technology: string;
    /**
     * Indicates an interest in art.
     */
    art: string;
    /**
     * Indicates an interest in cooking.
     */
    cooking: string;
    /**
     * Represents all interests.
     */
    all: string;
};
export declare const UserInfoSchema: z.ZodObject<{
    /**
     * Unique identifier for the user.
     */
    user_id: z.ZodString;
    /**
     * User's age.
     */
    age: z.ZodNumber;
    /**
     * User's gender.
     */
    gender: z.ZodEnum<[string, string, string]>;
    /**
     * User's location (ISO 3166-1 alpha-2 code).
     */
    location: z.ZodEffects<z.ZodString, string, string>;
    /**
     * Preferred language (must be "english").
     */
    language: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string | undefined>;
    /**
     * A list of user's interests.
     */
    interests: z.ZodArray<z.ZodEnum<[string, string, string, string, string, string, string, string, string]>, "many">;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    age: number;
    gender: string;
    location: string;
    language: string;
    interests: string[];
}, {
    user_id: string;
    age: number;
    gender: string;
    location: string;
    interests: string[];
    language?: string | undefined;
}>;
export declare const PlatformSchema: z.ZodObject<{
    /**
     * Name of the platform.
     */
    name: z.ZodString;
    /**
     * Version of the platform.
     */
    version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
}, {
    name: string;
    version: string;
}>;
export declare const SessionInfoSchema: z.ZodObject<{
    /**
     * Unique identifier for the session.
     */
    session_id: z.ZodString;
    /**
     * Name of the character (assistant).
     */
    character_name: z.ZodString;
    /**
     * Additional metadata for the character.
     */
    character_metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    /**
     * User information.
     */
    user_info: z.ZodObject<{
        /**
         * Unique identifier for the user.
         */
        user_id: z.ZodString;
        /**
         * User's age.
         */
        age: z.ZodNumber;
        /**
         * User's gender.
         */
        gender: z.ZodEnum<[string, string, string]>;
        /**
         * User's location (ISO 3166-1 alpha-2 code).
         */
        location: z.ZodEffects<z.ZodString, string, string>;
        /**
         * Preferred language (must be "english").
         */
        language: z.ZodEffects<z.ZodDefault<z.ZodString>, string, string | undefined>;
        /**
         * A list of user's interests.
         */
        interests: z.ZodArray<z.ZodEnum<[string, string, string, string, string, string, string, string, string]>, "many">;
    }, "strip", z.ZodTypeAny, {
        user_id: string;
        age: number;
        gender: string;
        location: string;
        language: string;
        interests: string[];
    }, {
        user_id: string;
        age: number;
        gender: string;
        location: string;
        interests: string[];
        language?: string | undefined;
    }>;
    /**
     * Platform details.
     */
    platform: z.ZodObject<{
        /**
         * Name of the platform.
         */
        name: z.ZodString;
        /**
         * Version of the platform.
         */
        version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
    }, {
        name: string;
        version: string;
    }>;
}, "strip", z.ZodTypeAny, {
    session_id: string;
    character_name: string;
    character_metadata: Record<string, any>;
    user_info: {
        user_id: string;
        age: number;
        gender: string;
        location: string;
        language: string;
        interests: string[];
    };
    platform: {
        name: string;
        version: string;
    };
}, {
    session_id: string;
    character_name: string;
    user_info: {
        user_id: string;
        age: number;
        gender: string;
        location: string;
        interests: string[];
        language?: string | undefined;
    };
    platform: {
        name: string;
        version: string;
    };
    character_metadata?: Record<string, any> | undefined;
}>;
export declare const MessageSchema: z.ZodObject<{
    /**
     * The role of the message sender (either user or AI).
     */
    role: z.ZodEnum<[string, string]>;
    /**
     * The content of the message.
     */
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: string;
    content: string;
}, {
    role: string;
    content: string;
}>;
export declare const AdSchema: z.ZodObject<{
    /**
     * Identifier for the advertisement.
     */
    idx: z.ZodNumber;
    /**
     * Title of the advertisement.
     */
    ad_title: z.ZodString;
    /**
     * Description of the advertisement.
     */
    ad_description: z.ZodString;
    /**
     * Template used for ad placement.
     */
    placement_template: z.ZodString;
    /**
     * URL link to the advertised product or service.
     */
    link: z.ZodString;
}, "strip", z.ZodTypeAny, {
    idx: number;
    ad_title: string;
    ad_description: string;
    placement_template: string;
    link: string;
}, {
    idx: number;
    ad_title: string;
    ad_description: string;
    placement_template: string;
    link: string;
}>;
export declare class UserInfo {
    user_id: string;
    age: number;
    gender: typeof Gender;
    location: string;
    language: string;
    interests: Array<typeof Interest>;
    constructor(data: unknown);
}
export declare class Platform {
    name: string;
    version: string;
    constructor(data: unknown);
}
export declare class SessionInfo {
    session_id: string;
    character_name: string;
    character_metadata: Record<string, any>;
    user_info: UserInfo;
    platform: Platform;
    constructor(data: unknown);
}
export declare class Message {
    role: typeof Role;
    content: string;
    constructor(data: unknown);
}
export declare class Ad {
    idx: number;
    ad_title: string;
    ad_description: string;
    placement_template: string;
    link: string;
    constructor(data: unknown);
}
