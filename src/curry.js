// CoinMarketCap
const Cmc = require('node-coinmarketcap')
	, cmc = new Cmc()
// 1Forex
	, fs = require('fs-extra')
	, vars = JSON.parse(fs.readFileSync('../data/secrets'))
	, forge_key = vars.other.forge
	, ForexDataClient = require('../libs/ForexDataClient.js')
	, forge = new ForexDataClient(forge_key)
// NeDb
	, Db = require('nedb')
	, store = new Db({
			autoload: true,
			filename: 'curry.json',
			onload: (e) => e && console.err(e)
		})
	, nedbPromise = require('nedb-promise')
	, curry = nedbPromise.fromInstance(store)
// HTTP
	, rp = require('request-promise')
	, { CronJob } = require('cron');

const forgeExchanges = [
	'EURUSD', 'GBPUSD', 'AUDUSD',
  'NZDUSD', 'XAUUSD', 'XAGUSD',
  'JPYUSD', 'CHFUSD', 'CADUSD',
  'SEKUSD', 'NOKUSD', 'MXNUSD',
  'ZARUSD', 'TRYUSD', 'CNHUSD' ]

const log = value =>
	(console.log(value), value);

const getCoins = () =>
	new Promise(resolve =>
		cmc.multi(resolve));

const getTop = (n) =>
	getCoins().then( coins =>
		coins.getTop(n))

const cmcToDb = () => 
	getTop(50).then( arr =>
		Promise.all(arr.map( coin =>
			quoteToDb(coin.symbol, 1 / coin.price_usd))))

const forgeToDb = () =>
	forge.getQuotes(forgeExchanges)
		.then( quotes =>
			Promise.all(quotes.map( quote =>
				quoteToDb(quote.symbol.replace('USD', ''), quote.price))))

const dtToDb = () =>
	rp('https://s3.amazonaws.com/dolartoday/data.json')
		.then(JSON.parse)
			.then( data =>
				quoteToDb('VEF', data.USD.dolartoday));

const quoteToDb = (symbol, price) =>
	curry.find({ symbol: symbol })
		.then( entry =>
			entry.price !== price
			&& curry.update(
				{ symbol: symbol, _id: (entry[0] || {})._id }
			, { $set: { price: price } }
			, { upsert: true }))

const fillDb = () => Promise.all([ cmcToDb(), forgeToDb(), dtToDb() ])
	.then(res=> store.persistence.compactDatafile(), true)
	.catch(console.err)

const twoChars = item =>
 (item<10?'0':'') + item

const getHHMMSS = d =>
	`${twoChars(d.getHours())}:${twoChars(d.getMinutes())}:${twoChars(d.getSeconds())}`

const goJob = () => {
	const d = new Date()
	const str = getHHMMSS(d)
	console.log('Filling database at ' + str)
	fillDb()
}

const job = new CronJob('*/2 * * * *', goJob)
job.start()