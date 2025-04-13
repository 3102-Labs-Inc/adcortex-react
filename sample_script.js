import * as AdCortex from 'adcortex';

const { AdcortexClient, SessionInfo, UserInfo, Platform, Message } = AdCortex;
import { performance } from 'perf_hooks';

// Initialize session info
const sessionInfo = new SessionInfo({
    session_id: "43253425",
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

// Create an instance of AdcortexClient
const client = new AdcortexClient(sessionInfo);

// Prepare messages
const messages = [
    new Message({ role: "ai", content: "I'm looking for a desk setup for my gaming. It should be more ergonomic!!" }),
    new Message({ role: "user", content: "Preferably something under $500." }),
    new Message({ role: "ai", content: "I'm looking for a desk setup for my gaming. It should be more ergonomic!!" }),
    new Message({ role: "user", content: "Preferably something under $500." }),
    new Message({ role: "ai", content: "I'm looking for a desk setup for my gaming. It should be more ergonomic!!" }),
    new Message({ role: "user", content: "Preferably something under $500." }),
    new Message({ role: "ai", content: "I'm looking for a desk setup for my gaming. It should be more ergonomic!!" }),
    new Message({ role: "user", content: "Preferably something under $500." }),
];

// Measure latency and fetch ad
const startTime = performance.now();
client.fetchAd(messages).then(adResponse => {
    const endTime = performance.now();
    const latency = (endTime - startTime) / 1000; // Convert to seconds

    console.log("Response content:");
    console.log(JSON.stringify(adResponse, null, 4)); // Pretty print JSON
    console.log(`Response Time: ${latency.toFixed(3)} seconds`);
}).catch(err => {
    console.error("Error fetching ad:", err);
});