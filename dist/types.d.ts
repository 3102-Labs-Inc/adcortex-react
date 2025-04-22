/**
 * Types for ADCortex API.
 *
 * This module defines interfaces, enums, and validation schemas used by the ADCortex API client.
 */
import { z } from 'zod';
/**
 * Gender enumeration.
 *
 * Attributes:
 *     male: Represents the male gender.
 *     female: Represents the female gender.
 *     other: Represents any gender not covered by male or female.
 */
export declare enum Gender {
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
export declare enum Role {
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
export declare enum Interest {
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
export declare enum Language {
    ar = "ar",// Arabic
    bg = "bg",// Bulgarian
    ca = "ca",// Catalan
    cs = "cs",// Czech
    da = "da",// Danish
    de = "de",// German
    el = "el",// Greek
    en = "en",// English
    es = "es",// Spanish
    et = "et",// Estonian
    fa = "fa",// Persian
    fi = "fi",// Finnish
    fr = "fr",// French
    gl = "gl",// Galician
    gu = "gu",// Gujarati
    he = "he",// Hebrew
    hi = "hi",// Hindi
    hr = "hr",// Croatian
    hu = "hu",// Hungarian
    hy = "hy",// Armenian
    id = "id",// Indonesian
    it = "it",// Italian
    ja = "ja",// Japanese
    ka = "ka",// Georgian
    ko = "ko",// Korean
    ku = "ku",// Kurdish
    lt = "lt",// Lithuanian
    lv = "lv",// Latvian
    mk = "mk",// Macedonian
    mn = "mn",// Mongolian
    mr = "mr",// Marathi
    ms = "ms",// Malay
    my = "my",// Burmese
    nb = "nb",// Norwegian Bokmål
    nl = "nl",// Dutch
    pl = "pl",// Polish
    pt = "pt",// Portuguese
    ro = "ro",// Romanian
    ru = "ru",// Russian
    sk = "sk",// Slovak
    sl = "sl",// Slovenian
    sq = "sq",// Albanian
    sr = "sr",// Serbian
    sv = "sv",// Swedish
    th = "th",// Thai
    tr = "tr",// Turkish
    uk = "uk",// Ukrainian
    ur = "ur",// Urdu
    vi = "vi"
}
/**
 * Contains platform-related metadata.
 *
 * Attributes:
 *     name (string): Platform name
 *     varient (string): varient for experimentation
 */
export declare const PlatformSchema: z.ZodObject<{
    name: z.ZodString;
    varient: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    varient: string;
}, {
    name: string;
    varient?: string | undefined;
}>;
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
export declare const UserInfoSchema: z.ZodObject<{
    user_id: z.ZodString;
    age: z.ZodEffects<z.ZodNumber, number, number>;
    gender: z.ZodNativeEnum<typeof Gender>;
    location: z.ZodEffects<z.ZodString, string, string>;
    language: z.ZodNativeEnum<typeof Language>;
    interests: z.ZodArray<z.ZodNativeEnum<typeof Interest>, "many">;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    age: number;
    gender: Gender;
    location: string;
    language: Language;
    interests: Interest[];
}, {
    user_id: string;
    age: number;
    gender: Gender;
    location: string;
    language: Language;
    interests: Interest[];
}>;
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
export declare const SessionInfoSchema: z.ZodObject<{
    session_id: z.ZodString;
    character_name: z.ZodString;
    character_metadata: z.ZodString;
    user_info: z.ZodObject<{
        user_id: z.ZodString;
        age: z.ZodEffects<z.ZodNumber, number, number>;
        gender: z.ZodNativeEnum<typeof Gender>;
        location: z.ZodEffects<z.ZodString, string, string>;
        language: z.ZodNativeEnum<typeof Language>;
        interests: z.ZodArray<z.ZodNativeEnum<typeof Interest>, "many">;
    }, "strip", z.ZodTypeAny, {
        user_id: string;
        age: number;
        gender: Gender;
        location: string;
        language: Language;
        interests: Interest[];
    }, {
        user_id: string;
        age: number;
        gender: Gender;
        location: string;
        language: Language;
        interests: Interest[];
    }>;
    platform: z.ZodObject<{
        name: z.ZodString;
        varient: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        varient: string;
    }, {
        name: string;
        varient?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    session_id: string;
    character_name: string;
    character_metadata: string;
    user_info: {
        user_id: string;
        age: number;
        gender: Gender;
        location: string;
        language: Language;
        interests: Interest[];
    };
    platform: {
        name: string;
        varient: string;
    };
}, {
    session_id: string;
    character_name: string;
    character_metadata: string;
    user_info: {
        user_id: string;
        age: number;
        gender: Gender;
        location: string;
        language: Language;
        interests: Interest[];
    };
    platform: {
        name: string;
        varient?: string | undefined;
    };
}>;
export type SessionInfo = z.infer<typeof SessionInfoSchema>;
/**
 * Represents a single message in a conversation.
 *
 * Attributes:
 *     role (Role): The role of the message sender (either user or AI).
 *     content (string): The content of the message.
 */
export declare const MessageSchema: z.ZodObject<{
    role: z.ZodNativeEnum<typeof Role>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: Role;
    content: string;
}, {
    role: Role;
    content: string;
}>;
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
export declare const AdSchema: z.ZodObject<{
    ad_title: z.ZodString;
    ad_description: z.ZodString;
    placement_template: z.ZodString;
    link: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ad_title: string;
    ad_description: string;
    placement_template: string;
    link: string;
}, {
    ad_title: string;
    ad_description: string;
    placement_template: string;
    link: string;
}>;
export type Ad = z.infer<typeof AdSchema>;
/**
 * Schema for validating ADCortex API responses.
 *
 * Attributes:
 *     ads (Ad[]): List of ads returned by the API.
 */
export declare const AdResponseSchema: z.ZodObject<{
    ads: z.ZodArray<z.ZodObject<{
        ad_title: z.ZodString;
        ad_description: z.ZodString;
        placement_template: z.ZodString;
        link: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ad_title: string;
        ad_description: string;
        placement_template: string;
        link: string;
    }, {
        ad_title: string;
        ad_description: string;
        placement_template: string;
        link: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ads: {
        ad_title: string;
        ad_description: string;
        placement_template: string;
        link: string;
    }[];
}, {
    ads: {
        ad_title: string;
        ad_description: string;
        placement_template: string;
        link: string;
    }[];
}>;
export type AdResponse = z.infer<typeof AdResponseSchema>;
