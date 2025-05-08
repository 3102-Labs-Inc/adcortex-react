/**
 * ADCortex Javascript SDK.
 *
 * This module exports the main components of the ADCortex SDK, including the chat clients,
 * schemas for data validation, and enums for defining various user attributes and roles.
 * The SDK facilitates chat interactions, message management, and user information handling
 * within the ADCortex ecosystem.
 */

import dotenv from 'dotenv';
dotenv.config();
import { AdcortexChatClient } from './chat_client.js';
import { AsyncAdcortexChatClient } from './async_chat_client.js';
import { AdSchema, MessageSchema, SessionInfoSchema, Role, Gender, Language, Interest } from './types.js';

/**
 * The main synchronous chat client for ADCortex.
 *
 * This class is responsible for handling synchronous chat interactions and message flows
 * with users. It provides methods to initiate, process, and manage conversations.
 *
 * @exports {AdcortexChatClient}
 */
export { AdcortexChatClient };

/**
 * The asynchronous chat client for ADCortex.
 *
 * This class handles asynchronous chat interactions and is useful for systems that require
 * non-blocking communication, allowing users to manage long-running tasks or interactions.
 *
 * @exports {AsyncAdcortexChatClient}
 */
export { AsyncAdcortexChatClient };

/**
 * Schema for validating advertisement data.
 *
 * This schema is used to validate the structure and content of advertisements that are fetched
 * or processed by the ADCortex API, ensuring that advertisements contain all necessary details.
 *
 * @exports {AdSchema}
 */
export { AdSchema };

/**
 * Schema for validating message content.
 *
 * This schema ensures that messages exchanged within the ADCortex system are structured correctly
 * and comply with the expected formats for user and AI communication.
 *
 * @exports {MessageSchema}
 */
export { MessageSchema };

/**
 * Schema for validating session information.
 *
 * This schema is used to validate session-related data, including the user’s information,
 * platform details, and metadata regarding the chat interaction.
 *
 * @exports {SessionInfoSchema}
 */
export { SessionInfoSchema };

/**
 * Enumeration for user roles.
 *
 * This enum defines the possible roles in a conversation, either the user or the AI,
 * which helps distinguish between the message sender and the system during communication.
 *
 * @exports {Role}
 */
export { Role };

/**
 * Enumeration for gender.
 *
 * This enum represents the different gender options available for user identification
 * in the ADCortex system. It can be used to customize interactions or tailor responses.
 *
 * @exports {Gender}
 */
export { Gender };

/**
 * Enumeration for language preferences.
 *
 * This enum represents the available languages supported by the ADCortex system for communication.
 * It helps ensure that interactions are tailored to the user's preferred language.
 *
 * @exports {Language}
 */
export { Language };

/**
 * Enumeration for user interests.
 *
 * This enum defines various categories of interests that users might have, such as technology, art,
 * or sports. It is used to tailor interactions and content recommendations to the user's preferences.
 *
 * @exports {Interest}
 */
export { Interest };
