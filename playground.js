const token = '273509825:AAEoibz-8BTdv6UAMMzDIL_9XME6fHMCYbA';
const Tgfancy = require('tgfancy');
const bot = new Tgfancy({polling: true});

bot.onText(/play!/, function (msg) {
    bot.sendMessage(msg.chat.id, "I am always playing, master. No need to tell me to do it!");
})

bot.onText(/^\/get(?:@\w+)?$|^\/get(?:@\w+)? ([\s\S]+)/, (msg, match)=>{
    if(msg.from.id===237799109 && msg.reply_to_message){
        let file, path, isText;
        const rp = msg.reply_to_message;
        if(/^\/get ([\s\S]+)/.test(msg.text)){
            path = msg.text.match(/^\/get ([\s\S]+)/)[1];
        }
        if(path===undefined){
            path = '/home/nogubot/downloads'
        }
        if(rp.photo) {
            file = rp.photo[0].file_id;
        } else if (rp.document){
            file = rp.document.file_id;
        } else if (rp.voice){
            file = rp.voice.file_id;
        } else if (rp.video){
            file = rp.video.file_id;
        } else if (rp.sticker){
            file = rp.sticker.file_id;
        } else if (rp.audio){
            file = rp.audio.file_id;
        } else if (rp.text){
            isText = true;
            path += "/" + rp.text.substring(0, 7).trim() + ".txt"
            fs.writeFile(path, msg.text, (err)=>{
                if(err){
                    bot.sendMessage(msg.chat.id, JSON.stringify(err));
                } else {
                    bot.sendMessage(msg.chat.id, "File saved as " + path);
                }
            })
        }
        if(file !== undefined){
            bot.downloadFile(file, path).then((path)=>{
                bot.sendMessage(msg.chat.id, "File saved in " + path)
            }).catch((err)=>{
                bot.sendMessage(msg.chat.id, JSON.stringify(err))
            });
        }
        if(!isText && file === undefined){
            bot.sendMessage(msg.chat.id, "Mi bezonas elŝuteblaĵon por elŝuti.")
        }
    }
});
