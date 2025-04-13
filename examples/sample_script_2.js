import axios from 'axios';

const url = "https://adcortex.3102labs.com/ads/match";

const headers = {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.ADCORTEX_API_KEY,
};

// Full conversation messages
const allMessages = [
    {
        "role": "user",
        "content": "message from user",
        "timestamp": "2025-04-13T09:03:12Z"
    },
    {
        "role": "ai",
        "content": "reply from ai",
        "timestamp": "2025-04-13T09:03:25Z"
    },
    {
        "role": "user",
        "content": "message from user",
        "timestamp": "2025-04-13T09:03:45Z"
    },
    {
        "role": "ai",
        "content": "reply from ai",
        "timestamp": "2025-04-13T09:04:00Z"
    }
];

// Base payload structure
const basePayload = {
    RGUID:12345678, // Unique identifier for the request
    session_info: {
        session_id: "", // Unique session ID
        character_name: "", // Name of the character
        character_metadata: "Friendly and humorous assistant", // Character metadata
    },
    user_data: {
        user_id: "", // Unique user ID
        age: 20, // User's age
        gender: "", // User's gender
        location: "", // User's country
        language: "", // User's language
        interests: [""], // User's interests - array of strings
    },
    platform: { 
        name: "", // Name of the platform/website
        version: "" // Version of the platform/website 
    },
};

// Process messages in pairs
let totalLatency = 0;
let numRequests = 0;

(async () => {
    for (let i = 0; i < allMessages.length; i += 2) {
        // Get current pair of messages
        const currentMessages = allMessages.slice(i, i + 2);

        // Create payload for current request
        const payload = { ...basePayload, messages: currentMessages };

        // Send request and measure latency
        console.log(`\nSending request ${Math.floor(i / 2) + 1} with messages:`);
        currentMessages.forEach(msg => {
            console.log(`- ${msg.role}: ${msg.content.slice(0, 50)}...`);
        });

        const startTime = Date.now();
        try {
            const response = await axios.post(url, payload, { headers });
            const endTime = Date.now();

            const latency = (endTime - startTime) / 1000;
            totalLatency += latency;
            numRequests++;

            // Process response
            console.log(`\nResponse ${Math.floor(i / 2) + 1}:`);
            console.log(JSON.stringify(response.data, null, 4));
            console.log(`Response Time: ${latency.toFixed(3)} seconds`);
        } catch (error) {
            const endTime = Date.now();
            const latency = (endTime - startTime) / 1000;
            totalLatency += latency;
            numRequests++;

            console.error(`Error: Received status code ${error.response?.status || "unknown"}`);
            console.error(`Response content: ${error.response?.data || error.message}`);
            console.log(`Response Time: ${latency.toFixed(3)} seconds`);
        }

        console.log("Waiting for 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Print summary
    console.log(`\nSummary:`);
    console.log(`Total Requests: ${numRequests}`);
    console.log(`Average Response Time: ${(totalLatency / numRequests).toFixed(3)} seconds`);
})();