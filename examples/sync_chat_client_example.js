/**
 * Example script demonstrating the synchronous AdcortexChatClient usage.
 */

import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';

import { AdcortexChatClient } from 'adcortex-js';
// import { Gender, Interest, Language, Role, SessionInfo,  } from 'adcortex-js';
import { SessionInfoSchema, Role } from "adcortex-js";

// Load environment variables
dotenv.config();

// Configure logging
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} - [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new transports.Console()]
});

function create_session_info() {
  /**
   * Create a sample session info object.
   */
  return SessionInfoSchema.parse({
    session_id: "14149",  // Fixed session ID that works
    character_name: "Alex",
    character_metadata: "Friendly and humorous assistant",  // String instead of dict
    user_info: {
      user_id: "12345",
      age: 20,
      gender: "male",  // Type assertion for enum
      location: "US",
      language: "en",  // Type assertion for enum
      interests: ["flirting", "gaming"]  // Using enum values
    },
    platform: {
      name: "ChatBotX", 
      varient: "1.0.2"
    }
  });
}

function process_chat_interaction(chat_client, role, content){
  /**
   * Process a single chat interaction and return the context if an ad was found.
   */
  try {
    // Send message and process queue
    chat_client.__call__(role, content);
    
    // Check if we got a new ad
    const latest_ad = chat_client.get_latest_ad();
    if (latest_ad) {
      return chat_client.create_context(latest_ad);
    }
    return null;
  } catch (e) {
    logger.error(`Error processing chat interaction: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

async function main() {
  /**
   * Main function demonstrating chat client usage.
   */
  // Initialize the chat client
  const chat_client = new AdcortexChatClient(
    create_session_info(),
    null, // Default context template
    null, // Default API key from env
    5, // timeout
    false, // disable_logging
    50 // max_queue_size
  );

  // Simulate a chat conversation
  const conversation = [
    { role: Role.ai, content: "I'm looking for a desk setup for my gaming. It should be more ergonomic!" },
    { role: Role.user, content: "Preferably something under $500." },
  ];

  // Process the conversation
  for (const { role, content } of conversation) {
    logger.info(`${role}: ${content}`);
    const context = process_chat_interaction(chat_client, role, content);
    
    if (context) {
      logger.info("Ad context generated:");
      logger.info(context);
    }
    
    // Check client health
    if (!chat_client.is_healthy()) {
      logger.warn("Client is not in a healthy state");
      break;
    }
  }
}

// Execute main function
main().catch(err => {
  logger.error(`Main process failed: ${err}`);
  process.exit(1);
});