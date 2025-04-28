# AdCortex JavaScript SDK

JavaScript/TypeScript client library for integrating contextual advertising into chat applications using the AdCortex API.

## Features
- 🚀 **Synchronous and Asynchronous Clients** - Choose the right client for your application needs
- 🧠 **Intelligent Ad Matching** - Contextually relevant ads based on context
- 🔄 **Robust Error Handling** - Circuit breaker pattern prevents cascading failures
- 🔍 **Type Safety** - Full TypeScript support with Zod schema validation
- 📊 **Queue Management** - Efficient message queue with FIFO behavior
- 🔧 **Highly Configurable** - Customize timeout, logging, circuit breaker behavior and more

## Installation

```bash
npm install adcortex-js
```

## Environment Setup

Create a `.env` file in your project root:

```
ADCORTEX_API_KEY=your_api_key_here
```

## Quick Start

### Synchronous Client

```javascript
import { AdcortexChatClient, SessionInfoSchema, Role, Gender, Interest, Language } from 'adcortex-js';

// Initialize session info
const sessionInfo = SessionInfoSchema.parse({
  session_id: "session123",
  character_name: "Assistant", // AI Name/Character Name
  character_metadata: "Friendly AI assistant", //AI Character Description
  user_info: {
    user_id: "user456", //User ID
    age: 25, //User Age
    gender: Gender.male, //User Gender
    location: "US", // Country Code - 2 Letter
    language: Language.en,
    interests: [Interest.technology, Interest.gaming]
  },
  platform: {
    name: "MyApp", //Name of your platform
    varient: "1.0.0"
  }
});

// Create the chat client
const chatClient = new AdcortexChatClient(sessionInfo);

// Process user messages
await chatClient.__call__(Role.user, "I need a new gaming laptop");
await chatClient.__call__(Role.ai, "What's your budget and preferred screen size?");
await chatClient.__call__(Role.user, "Around $1500 and 15-17 inches");

// Check for ads after processing messages
const latestAd = chatClient.get_latest_ad();
if (latestAd) {
  const context = chatClient.create_context(latestAd);
  console.log("Ad Context:", context);
  // Integrate ad into your chat response...
}

// Check client health
if (!chatClient.is_healthy()) {
  console.log("Client is not in a healthy state");
}
```

### Asynchronous Client

```javascript
import { AsyncAdcortexChatClient, SessionInfoSchema, Role } from 'adcortex-js';

// Session setup same as in the synchronous example
const sessionInfo = SessionInfoSchema.parse({/* ... */});

// Create async chat client
const asyncChatClient = new AsyncAdcortexChatClient(
  sessionInfo,
  undefined, // Default context template
  undefined, // API key from environment
  10, // 10-second timeout
  false, // Enable logging
  50 // Max queue size
);

// Process messages
await asyncChatClient.__call__(Role.user, "I need a new gaming laptop");

// Check for ads
const latestAd = asyncChatClient.get_latest_ad();
if (latestAd) {
  const context = asyncChatClient.create_context();
  console.log("Ad Context:", context);
}
```

## Configuration Options

Both the synchronous and asynchronous clients accept the following configuration options:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `session_info` | `SessionInfo` | Required | User and session information |
| `context_template` | `string` | See below | Template for formatting ad context |
| `api_key` | `string` | From env | AdCortex API key |
| `timeout` | `number` | 5/10 | Request timeout in seconds |
| `disable_logging` | `boolean` | `false` | Whether to disable logging |
| `max_queue_size` | `number` | 100 | Maximum number of messages in queue |
| `circuit_breaker_threshold` | `number` | 5 | Number of errors before circuit breaker opens |
| `circuit_breaker_timeout` | `number` | 120 | Time in seconds before circuit resets |

The default context template is:

```
"Here is a product the user might like: {ad_title} - {ad_description}: here is a sample way to present it: {placement_template}"
```

## Production Recommendations

For production environments, we recommend the following settings:

```javascript
const chatClient = new AdcortexChatClient(
  sessionInfo,
  undefined, // Use default template
  undefined, // API key from env
  5, // 5-second timeout
  true, // Disable logging in production
  50 // Appropriate queue size for your traffic volume
);
```

## Client Health Monitoring

The clients provide health monitoring capabilities:

```javascript
// Check if client is in a healthy state
if (!chatClient.is_healthy()) {
  console.log("Client is not healthy - implement backoff strategy");
  // Wait before sending more requests...
}

// Get current client state
const state = chatClient.get_state();
console.log(`Client state: ${state === ClientState.IDLE ? "IDLE" : "PROCESSING"}`);
```

## TypeScript Support

This SDK is built with TypeScript and provides full type definitions. The core types include:

- `SessionInfo` - Session and user details
- `Message` - Chat message structure
- `Ad` - Advertisement structure
- `Role` - Message sender role (user or AI)
- `Gender` - User gender options
- `Interest` - User interest categories
- `Language` - Supported languages

## Error Handling

The SDK implements comprehensive error handling with:

- **Automatic Retries** - Network errors are automatically retried with exponential backoff
- **Circuit Breaker** - Prevents cascading failures by temporarily disabling requests after multiple errors
- **Error Logging** - Detailed error logs for troubleshooting (when logging is enabled)

## Examples

Check out the examples folder for more complete usage examples:

- **Basic Usage** - Simple synchronous client example
- **Async Usage** - Asynchronous client with higher throughput

---

# Complete API Reference

## Classes

### `AdcortexChatClient`

The primary chat client for synchronous operations.

#### Constructor

```typescript
constructor(
  session_info: SessionInfo,
  context_template?: string,
  api_key?: string | null,
  timeout?: number,
  disable_logging?: boolean,
  max_queue_size?: number,
  circuit_breaker_threshold?: number,
  circuit_breaker_timeout?: number
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `__call__(role: Role, content: string): Promise<void>` | Adds a message to the queue and processes it |
| `create_context(latest_ad: Ad): string` | Creates a context string for the provided ad |
| `get_latest_ad(): Ad \| null` | Gets the latest ad and clears it from memory |
| `get_state(): ClientState` | Gets the current client state |
| `is_healthy(): boolean` | Checks if the client is in a healthy state |

### `AsyncAdcortexChatClient`

Asynchronous chat client with the same functionality but designed for concurrent processing.

#### Constructor

```typescript
constructor(
  session_info: SessionInfo,
  context_template?: string,
  api_key?: string | null,
  timeout?: number,
  disable_logging?: boolean,
  max_queue_size?: number,
  circuit_breaker_threshold?: number,
  circuit_breaker_timeout?: number
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `__call__(role: Role, content: string): Promise<void>` | Adds a message to the queue and processes it asynchronously |
| `create_context(): string` | Creates a context string for the latest ad |
| `get_latest_ad(): Ad \| null` | Gets the latest ad and clears it from memory |
| `get_state(): ClientState` | Gets the current client state |
| `is_healthy(): boolean` | Checks if the client is in a healthy state |

### `CircuitBreaker`

Circuit breaker implementation for error handling.

```typescript
constructor(
  threshold?: number,
  timeout?: number,
  disable_logging?: boolean
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `record_error(): void` | Records an error and potentially opens the circuit |
| `is_open(): boolean` | Checks if the circuit is open |
| `reset(): void` | Resets the circuit breaker state |

## Data Types

### `SessionInfo`

```typescript
interface SessionInfo {
  session_id: string;
  character_name: string;
  character_metadata: string;
  user_info: UserInfo;
  platform: Platform;
}
```

### `UserInfo`

```typescript
interface UserInfo {
  user_id: string;
  age: number;
  gender: Gender;
  location: string; // ISO 3166-1 alpha-2 country code
  language: Language;
  interests: Interest[];
}
```

### `Platform`

```typescript
interface Platform {
  name: string;
  varient: string; // Default is "default"
}
```

### `Message`

```typescript
interface Message {
  role: Role;
  content: string;
  timestamp?: number;
}
```

### `Ad`

```typescript
interface Ad {
  ad_title: string;
  ad_description: string;
  placement_template: string;
  link: string;
}
```

## Enumerations

### `Role`

Message sender roles:

```typescript
enum Role {
  user = "user",
  ai = "ai"
}
```

### `Gender`

User gender options:

```typescript
enum Gender {
  male = "male",
  female = "female",
  other = "other"
}
```

### `Interest`

User interest categories:

```typescript
enum Interest {
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
```

### `Language`

Supported language codes (e.g., `en`, `fr`, `es`, etc.).

### `ClientState`

Client operational states:

```typescript
enum ClientState {
  IDLE = 1,
  PROCESSING = 2
}
```

## Validation Schemas

The SDK uses Zod for runtime validation:

- `SessionInfoSchema` - Validates session info
- `UserInfoSchema` - Validates user info
- `PlatformSchema` - Validates platform info
- `MessageSchema` - Validates message objects
- `AdSchema` - Validates ad objects
- `AdResponseSchema` - Validates API responses

## Advanced Usage Examples

### Custom Context Template

```javascript
const customTemplate = "Product spotlight: {ad_title} - {ad_description}. Click here: {placement_template}";

const chatClient = new AdcortexChatClient(
  sessionInfo,
  customTemplate,
  process.env.ADCORTEX_API_KEY
);
```

### Batch Processing with Async Client

```javascript
async function processBatch(messages) {
  for (const { role, content } of messages) {
    await asyncChatClient.__call__(role, content);
  }
  
  // Get all ads generated during the batch
  const ad = asyncChatClient.get_latest_ad();
  if (ad) {
    return asyncChatClient.create_context();
  }
  return null;
}
```

### Error Handling with Circuit Breaker

```javascript
try {
  await chatClient.__call__(Role.user, "Tell me about gaming laptops");
} catch (error) {
  console.error("Error processing message:", error);
  
  // Check if circuit breaker is open
  if (!chatClient.is_healthy()) {
    console.log("Circuit breaker open - implementing backoff strategy");
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Retry with exponential backoff...
  }
}
```

## Performance Considerations

For optimal performance:

1. **Disable logging in production**
2. **Adjust queue size** based on your message volume
3. **Set appropriate timeouts** for your network conditions
4. **Use AsyncAdcortexChatClient** for high-throughput applications


