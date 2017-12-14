const pm2 = require('pm2-promise')
const fs = require('fs-extra')

const log = v => (console.log(v), v)
const err = v => (console.error(v), v)

pm2.connect(true).then(() =>
	fs.readdir(__dirname).then( items =>
	Promise.all(items.slice(items.indexOf(__filename))
									 .map(pm2.start))
				 .then(log)))
.catch(err)