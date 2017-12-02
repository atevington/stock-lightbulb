require("dotenv").config()

const request = require("request-promise-native")

const express = require("express")
const app = express()
const port = process.env.PORT || 3000

const lifx = require("lifx-api")
const lifxToken = process.env.LIFX_TOKEN
const lifxSelector = process.env.LIFX_SELECTOR
const lifxClient = new lifx(lifxToken)

const apiKeys = (process.env.LOCAL_API_KEYS || "").split(",").filter(apiKey => apiKey.length > 0)
const maxBrightness = parseFloat(process.env.MAX_BRIGHTNESS || 0.75)
const maxChange = parseFloat(process.env.MAX_CHANGE || .01)
const symbol = process.env.SYMBOL || "SPY"

const setLightState = color => (
	new Promise((resolve, reject) => {
		lifxClient.setColor(lifxSelector, color, 1, true, response => {
			const jsonResponse = JSON.parse(response)

			if (jsonResponse.errors) {
				reject(jsonResponse)
			} else {
				resolve(jsonResponse)
			}
		})
	})
)

const getStockQuote = symbol => (
	new Promise((resolve, reject) => {
		request.get(`https://api.iextrading.com/1.0/stock/${symbol}/quote`)
			.then(response => resolve(JSON.parse(response)))
			.catch(error => reject(JSON.parse(error)))
	})
)

const changePercentColor = (changePercent, maxBrightness, maxChange) => {
	let color = "white"
	const brightness = Math.min(Math.abs(changePercent * (maxBrightness / maxChange)), maxBrightness)

	if (changePercent < 0)
		color = "red"
	
	if (changePercent > 0)
		color = "green"
	
	return `${color} brightness:${brightness}`
}

const setLightStateFromStockQuote = (symbol, maxBrightness, maxChange) => (
	new Promise((resolve, reject) => {
		getStockQuote(symbol)
			.then(quote => setLightState(changePercentColor(quote.changePercent || 0, maxBrightness, maxChange)))
			.then(response => resolve(response))
			.catch(reject)
	})
)

const startServer = (symbol, maxBrightness, maxChange) => {
	app.set("etag", false)

	app.use("*", (req, res, next) => {
		const apiKey = req.headers["x-api-key"] || req.query.apiKey || ""
		
		if (apiKeys.length === 0 || apiKeys.indexOf(apiKey) !== -1) {
			next()
		} else {
			res.status(401).send({error: "Invalid api key."})
		}
	})

	app.post("/", (req, res) => {
		setLightStateFromStockQuote(symbol, maxBrightness, maxChange)
			.then(() => res.status(200).send({status: "Ok."}))
			.catch(() => res.status(500).send({error: "An unknown error has occurred."}))
	})

	app.use("*", (req, res) => {
		res.status(404).send({error: "The requested resource was not found."})
	})

	app.listen(port, () => {
		console.log(`Listening on port ${port}...`)
	})
}

startServer(symbol, maxBrightness, maxChange)
