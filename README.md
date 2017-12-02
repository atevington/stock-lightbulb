# Stock Lightbulb

Set the color of an [LIFX](https://api.developer.lifx.com/) lightbulb from an [IEX](https://iextrading.com/developer/) stock quote. Negative daily changes will be red, while positive ones will be green.

# Setup

* Create a file named `.env` in the project root with the following structure:

```
// LIFX token - https://api.developer.lifx.com/docs/authentication
LIFX_TOKEN=YOUR_TOKEN_HERE

// Light selector - https://api.developer.lifx.com/docs/selectors
LIFX_SELECTOR=YOUR_SELECTOR_HERE

// Port of local server
PORT=3000

// CSV of API keys to secure the local server - leave blank for no auth
LOCAL_API_KEYS=12345679,987654321

// Max brightness of the bulb
MAX_BRIGHTNESS=.75

// If a stock moves this % (i.e. 1%) in either direction, it'll result in max brightness
MAX_CHANGE=.01

// Symbol to get quote for
SYMBOL=SPY
```

* Run the server with `npm run start`
* Make a `POST` request to the local server - if you have auth enabled, put the api key in an `apiKey` query param or an `X-Api-Key` header
* Watch the lightbulb change colors as the stock moves
* Ideally have a scheduled task running the `POST` request every few minutes