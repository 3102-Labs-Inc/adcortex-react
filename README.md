Installation
============

To install the ADCortex Chat Client library, follow these steps:

1. **Install package**:
```sh
npm i adcortex-js
```

2. **Set Up Environment Variables**

Create a ``.env`` file in the project root and add your ADCORTEX_API_KEY:
```sh
ADCORTEX_API_KEY="your_api_key_here"
```


Usage
=====

To use the ADCortex Chat Client library, follow these steps:

1. **Import the required classes**
```js
import * as AdCortex from 'adcortex-js';

const { AdcortexClient, SessionInfo, UserInfo, Platform, Message } = AdCortex;
```

2. **Create an instance of AdcortexClient**
```js
const client = new AdcortexClient(sessionInfo);
```

3. **Then perform actions like**
```js
client.fetch_ad(messages).then(adResponse => {
    console.log("Response content:");
    console.log(JSON.stringify(adResponse, null, 4));
}).catch(err => {
    console.error("Error fetching ad:", err);
});
```

4. **For detailed usage see examples folder**
