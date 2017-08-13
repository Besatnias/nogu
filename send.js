'use strict';
const fs = require('fs'),
    secrets = fs.readFileSync("secrets.json"),
    vars = JSON.parse(secrets),
    token = vars.servilobot_token,
    Tgfancy = require('tgfancy'),
    bot = new Tgfancy(token, { polling: true }),
// HTTP modules
    request = require('request'),
// Other modules
    _ = require('underscore');

console.log('bot on');
bot.onText(/^\/deserv(?:@\w+)? ([\s\S]+)/, (msg, match)=>{
    if(msg.from.id===237799109){
        bot.sendDocument(237799109, match[1]);
    }
});

bot.onText(/^\/alserv(?:@\w+)?$|^\/alserv(?:@\w+)? ([\s\S]+)/, (msg, match)=>{
    if(msg.from.id===237799109 && msg.reply_to_message){
        let file, fileId, path, isText;
        const rp = msg.reply_to_message;
        if(/^\/alserv ([\s\S]+)/.test(msg.text)){
            path = msg.text.match(/^\/alserv ([\s\S]+)/)[1];
        }
        if(path===undefined){
            path = '/home/nogubot/downloads'
        }
        if(rp.photo) {
            file = rp.photo[0];
            fileId = rp.photo[0].file_id;
        } else if (rp.document){
            file = rp.document;
            fileId = rp.document.file_id;
        } else if (rp.voice){
            file = rp.voice;
            fileId = rp.voice.file_id;
        } else if (rp.video){
            file = rp.video;
            fileId = rp.video.file_id;
        } else if (rp.sticker){
            file = rp.sticker;
            fileId = rp.sticker.file_id;
        } else if (rp.audio){
            file = rp.audio;
            fileId = rp.audio.file_id;
        } else if (rp.text){
            isText = true;
            path += "/" + rp.text.substring(0, 7).trim() + ".txt"
            fs.writeFile(path, msg.text, (err)=>{
                if(err){
                    console.log(err);
                    bot.sendMessage(msg.chat.id, JSON.stringify(err));
                } else {
                    console.log("saved text as " + path);
                    bot.sendMessage(msg.chat.id, "File saved as " + path);
                }
            })
        }
        if ( file ) {
            bot.downloadFile(fileId, path).then((forcedPath)=>{
                if ( !file.file_name ) {
                    console.log('download success as ' + forcedPath);
                    bot.sendMessage(msg.chat.id, "File saved as " + forcedPath);
                } else {
                    fs.rename(forcedPath, path + "/" + file.file_name);
                    bot.sendMessage(msg.chat.id, "File saved as " + path + "/" + file.file_name);
                }
            }).catch((err)=>{
                console.log(err);
                bot.sendMessage(msg.chat.id, JSON.stringify(err));
            });
        }
        if(!isText && !file){
            bot.sendMessage(msg.chat.id, "I cannot download that.");
        }
    }
});

bot.onText(/^\/ls(?:@\w+)? ([\s\S]+)/, (msg, match)=>{
    if(msg.from.id===237799109){
        const path = match[1];
        fs.readdir(path, (err, files)=>{
            if (err) {
                console.log(err);
                bot.sendMessage(msg.chat.id, "<pre>" + JSON.stringify(err) + "</pre>", {parse_mode: "HTML"});
            } else {
                let text = files.join("\n");
                bot.sendMessage(msg.chat.id, "Files in <code>" + path + "</code>are:\n" + text, {parse_mode: "HTML"});
            }
        })
    }
});

bot.onText(/^\/renom(?:@\w+)?$|^\/renom(?:@\w+)? ([\s\S]+)/, (msg, match)=>{
    const arg = match[1];
    const path1 = arg.split(" ")[0];
    const path2 = arg.split(" ")[1];
    fs.rename(path1, path2, (err)=>{
        if(err){
            console.log(err);
            bot.sendMessage(msg.chat.id, "Mi ne atingis plenumi la renomon");
        } else {
            bot.sendMessage(msg.chat.id, "Renomis <code>" + path1 + "</code> al <code>" + path2 + "</code>", {parse_mode: "HTML"});
        }
    });
});
