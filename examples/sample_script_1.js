import * as AdCortex from 'adcortex-js';

const { AdcortexClient, SessionInfo, UserInfo, Platform, Message } = AdCortex;

// Initialize session info
const sessionInfo = new SessionInfo({
    session_id: "", // Unique session ID
    character_name: "", // Name of the character
    character_metadata: { description: "Friendly and humorous assistant" }, // Metadata about the character
    user_info: new UserInfo({
        user_id: "", // Unique user ID
        age: 20,  // User's age
        gender: "", // User gender
        location: "", // User country
        interests: [""] // User interests - array of strings
    }),
    platform: new Platform({
        name: "", // Name of the platform/website
        version: "" // Version of the platform/website
    })
});

// Create an instance of AdcortexClient
const client = new AdcortexClient(sessionInfo);

// Prepare messages - example messages for the conversation
const messages = [
    new Message({ role: "ai", content: "conversations from AI" }),
    new Message({ role: "user", content: "chats from users" }),
    new Message({ role: "ai", content: "conversations from AI" }),
    new Message({ role: "user", content: "chats from users" }),
    new Message({ role: "ai", content: "conversations from AI" }),
    new Message({ role: "user", content: "chats from users" }),
    new Message({ role: "ai", content: "conversations from AI" }),
    new Message({ role: "user", content: "chats from users" }),
];

// Measure latency and fetch ad
client.fetch_ad(messages).then(adResponse => {
    console.log("Response content:");
    console.log(JSON.stringify(adResponse, null, 4)); // Print JSON
}).catch(err => {
    console.error("Error fetching ad:", err);
});