// Import necessary modules
import { AdcortexChatClient, SessionInfo, UserInfo, Platform, Message } from 'adcortex-js';

// Initialize session info
const sessionInfo = new SessionInfo({
    session_id: "fads-fda",
    character_name: "Alex",
    character_metadata: { description: "Friendly and humorous assistant" },
    user_info: new UserInfo({
        user_id: "12345",
        age: 20,
        gender: "male",
        location: "US",
        interests: ["all"]
    }),
    platform: new Platform({
        name: "ChatBotX",
        version: "1.0.2"
    })
});

// Initialize the chat client
const chatClient = new AdcortexChatClient({
    session_info: sessionInfo,
    num_messages_before_ad: 3,
    num_messages_between_ads: 10
});

// Simulate adding messages and automatically check for ads
const tryAddMessage = async (role, content) => {
    const adResponse = await chatClient.addMessage({ role, content });
    if (adResponse) {
        console.log(adResponse);
    }
};

// Simulate conversation
(async () => {
    await tryAddMessage("user", "I'm looking for a new gaming setup.");
    await tryAddMessage("ai", "What features are you looking for?");
    await tryAddMessage("user", "I need something ergonomic.");
})();
