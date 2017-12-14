'use strict';

// Bot modules
const fs = require('fs'),
	secrets = fs.readFileSync('../data/secrets'),
	vars = JSON.parse(secrets),
	db = JSON.parse(fs.readFileSync('../data/shittydb')),
	token = vars.telegram.bot.muja,
	Tf = require('telegraf'),
	bot = new Tf(token, { username: 'mujabot' }),
// HTTP modules
	cheerio = require('cheerio'),
	rp = require('request-promise'),
	math = require('mathjs'),
	_ = require('lodash');

bot.startPolling();

const log = value =>
	(console.log(value), value);

const code = text =>
	'<pre>' + JSON.stringify(text, null, 2) + '</pre>'

const getArgs = text =>
	text.split(/\s/, 2)[1] || '';

const writeShittyDb = (c, text) =>
	fs.writeFile('shittydb', JSON.stringify(db, null, 2), e =>
		e ? log('writing error', e) : (text && c.reply(text)))

const getProperty = (a, b) =>
	_.hasIn(a, b) ? eval('a.' + b) : undefined

bot.use((ctx, next) => {
	if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
		[ ctx.command, ctx.args ] = getArgs(ctx.message.text)
	}
	ctx.forward = (chatId, opts) => {
		const params = opts ? [ctx.chat.id, chatId, ctx.message.message_id, opts] : [ctx.chat.id, chatId, ctx.message.message_id]
		return bot.telegram.forwardMessage(...params)
	}
	return next()
})

bot.use((ctx, next) =>
	((((ctx||{}).message||{}).text||'').startsWith('/')
	&& ([ ctx.command, ctx.args ] = getArgs(ctx.message.text))
	, next()));

bot.catch((err) => 
	console.log('Ooops', err))

// CURRENCY STUFF

const dt = () =>
	rp('https://s3.amazonaws.com/dolartoday/data.json')
		.then(JSON.parse);

const bv = () =>
	rp.get('http://www.bitven.com/assets/js/rates.js')
		.then(JSON.parse)

const BitVenPaths = [
	
]

bot.command('btc', ctx =>
	bv().then(data =>
		ctx.reply("1 BTC = $" + data.BTC_TO_USD_RATE)))

bot.command('dolar', ctx =>
	dt().then(data =>
		ctx.reply(`$1 = Bs. ${data.USD.dolartoday}`)));

bot.command('euro', ctx =>
	dt().then(data =>
		ctx.reply(`€1 = Bs. ${data.EUR.dolartoday}`)));

bot.command('usdcop', ctx =>
	dt().then(data =>
		ctx.reply(`€1 = Bs. ${data.USCOL.ratetrm}`)));

bot.command('copusd', ctx =>
	dt().then(data =>
		ctx.reply(`€1 = Bs. ${data.COP.dolartoday}`)));

bot.command('math', ctx =>
	dt().then((data) =>
		ctx.replyWithHTML(`Operation:
<code>${masterReplacer(getArgs(ctx.message.text), data)}</code>

Result:
<code>${math.eval(masterReplacer(getArgs(ctx.message.text), data))}</code>`, {reply_to_message_id: ctx.message.message_id}))
	.catch(e=>ctx.reply(JSON.stringify(log(e), null, 2), {reply_to_message_id: ctx.message.message_id})));

const masterReplacer = (str, data) =>
	[
		[/%USDVEF%/i, data.USD.dolartoday],
		[/%VEFUSD%/i, 1/data.USD.dolartoday],
		[/%EURVEF%/i, data.EUR.dolartoday],
		[/%VEFEUR%/i, 1/data.EUR.dolartoday],
		[/%COPVEF%/i, data.USDCOL.ratetrm/data.USD.dolartoday],
		[/%VEFCOP%/i, data.USD.dolartoday/data.USDCOL.ratetrm],
		[/%USDCOP%/i, data.USDCOL.ratetrm],
		[/%COPUSD%/i, 1/data.USDCOL.ratetrm]
	].reduce((str, item) =>
		str.replace(item[0], item[1]), str);

// UTILITIES LIKE getid, code, sticker ids

bot.command('/getid', ctx =>
	bot.telegram.getChat(ctx.args)
	.then(chat =>
		ctx.replyWithHTML(code(chat))));

bot.command('/code', ctx =>
	ctx.replyWithHTML(code(ctx.args)))

bot.command('doc', ctx => {
	ctx.replyWithDocument('http://ipv4.download.thinkbroadband.com/40MB.zip').catch(console.log)
})

bot.hears('id', ctx =>
	(((ctx||{}).message).reply_to_message||{}).sticker
	&& ctx.reply(ctx.message.reply_to_message.sticker.file_id))

bot.hears(/^sticker (.+)$/i, (ctx) =>
	ctx.replyWithSticker(log(ctx.match[1])))

const stickerArr = [
	'CAADBAADAgIAAqIkSQOAkCXE-xtf8QI',
	'CAADAQADbQ8AApl_iALEbiLhxcIIUgI',
	'CAADAgADTQAD3PTgBzBw8WjpI-awAg'
]

bot.hears('random sticker', ({replyWithSticker}) =>
	replyWithSticker(stickerArr[_.random(0, stickerArr.length -1)]))

bot.hears(new RegExp(`^/comando(?:@${bot.options.username})?$`, "i"), ({reply}) =>
	reply('got ur message bby'))

const triggers = [
	{
		trigger: '¿?quieres güevo\?',
		response: 'sí! :D'
	}, {
		trigger: '¿?te lo meto bien adentro\?',
		response: 'sí porfa! :D'
	},
	{
		trigger: '¿?cómo te llamas\?',
		response: 'Muja u_u'
	},
	{
		trigger: 'eres mía',
		response: 'lo sé uwu'
	}
]

const attachListener = (trigger, response) =>
	bot.hears(trigger, ({ reply }) =>
		reply(response))

triggers.forEach(tr =>
	attachListener(new RegExp(`^Muja,? ${tr.trigger}`, 'i'), tr.response))

bot.command('pickupline', ctx =>
	rp.get('http://www.pickuplinegen.com/')
		.then(html =>
			ctx.reply(cheerio.load(html)('#content').text()))
		.catch(()=>
			ctx.reply('There was an error retrieving the information you requested')));

bot.command('revy', c =>
	c.replyWithSticker('BQADAQADDwgAAsWGLA7ugW0snffLNwI'));

bot.command('doge', c =>
	c.replyWithSticker(db.doges[_.random(db.doges.length)]))

const dogeInReplied = d =>
	db.doges.includes(d) ? d : false

const addDoge = c =>
	dogeInReplied(
		getProperty(c, 'reply_to_message.sticker.file_id')
	) && db.doges.push(c.reply_to_message.sticker.file_id)
	&& writeShittyDb(c, 'added doge')

const deleteDoge = c =>
	dogeInReplied(
		getProperty(c, 'reply_to_message.sticker.file_id')
	) && db.doges.splice(
		db.doges[db.doges.indexOf(c.reply_to_message.sticker.file_id)], 1)
	&& writeShittyDb(c, 'removed doge')

bot.hears(/^(?:add|new|nuevo|agregar|poner) doge$/, c =>
	c.from.id === 237799109
	&& addDoge(c))

bot.hears(/^(?:remove|delete|quitar|eliminar|sacar) doge$/, c =>
	c.from.id === 237799109
	&& deleteDoge(c))

bot.hears(/^>colony$/, c => c.reply('>Puerto Rico'))

bot.on('audio', c =>
	c.chat.id === -1001131654583
	&& c.forward(-1001127646272))

bot.hears(/nice song|music|bonita canción|música|good taste|buen gusto/, c =>
	getProperty(c, 'reply_to_message.audio')
	&& c.forward(-1001127646272))

bot.hears(/\/?punishment/, c =>
	c.reply(db.punishments(_.random(db.punishments.length))))

bot.hears( /^list punishments$/, c =>
    c.reply(`\`${db.punishments.join("\n")}\``))

bot.command('getphotos', ctx =>
	ctx.args
	? sendPhotos(ctx, ctx.args)
	: sendPhotos(ctx, getProperty(ctx, 'message.reply_to_message.forward_from.id')
		|| getProperty(ctx, 'message.reply_to_message.from.id')
		|| getProperty(ctx, 'message.from.id')))

const getUserPhotos = id =>
	bot.telegram.getUserProfilePhotos(id)
		 .then(r =>
		 		r.photos.map(photo =>
		 			photo[photo.length - 1].file_id))

const sendPhotos = ((c, id) =>
	getUserPhotos(id).then(photos =>
		photos.forEach(fileId =>
			c.replyWithPhoto(fileId))))

bot.hears(/^\/?get(?: |_)+update$/i, ctx =>
	ctx.replyWithHTML('<pre>' + JSON.stringify(ctx.update, null, 2) + '</pre>') || 'undefined');

bot.hears(/^\/?get(?: |_)+message$/i, ctx =>
	((ctx||{}).message||{}).reply_to_message
	&& ctx.replyWithHTML('<pre>' + JSON.stringify(ctx.message.reply_to_message, null, 2) + '</pre>') || 'undefined');

bot.hears(/^\/?get(?: |_)+([a-z\._]+)/i, ctx =>
	((ctx||{}).message||{}).reply_to_message
	&& ctx.replyWithHTML('<pre>' + JSON.stringify(eval('ctx.message.reply_to_message.' + ctx.match[1]), null, 2) + '</pre>' || 'undefined'));


bot.hears('send doc', ctx=>
	(((ctx||{}).message||{}).reply_to_message||{}).document
	&& ctx.replyWithDocument(ctx.message.reply_to_message.document.file_id))

bot.hears('log', c =>
	console.log(c));

[
	{
		trigger: 'sell',
		response: 'CgADBAADjI8AAn4bZAd_ZjcnGNMLyAI'
	}, {
		trigger: 'dance',
		response: 'CgADAQAD0gEAAllsewq2BQ_7OBn0DwI'
	}
].forEach(tr =>
	bot.command(tr.trigger, ({ replyWithDocument }) =>
		replyWithDocument(tr.response)));

bot.hears('forward this', ctx =>
	ctx.forward(ctx.chat.id).catch(console.log))