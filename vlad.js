const fs = require('fs'),
    secrets = fs.readFileSync("secrets"),
    vars = JSON.parse(secrets),
    token = vars.telegram.bot.vlad,
    db = JSON.parse(fs.readFileSync("shittydb")),
    Tgfancy = require('node-telegram-bot-api'),
    bot = new Tgfancy(token, { polling: true }),
    rp = require('request-promise'),
    apiBaseUrl = 'https://api.telegram.org/bot';

    // revisar Sakamoto Tatsuma - Gintama

bot.on('message', msg=>{
   msg.reply = (text, form = {})=>{
    form.reply_to_message_id = msg.message_id
    form.parse_mode = "markdown"
    return bot.sendMessage(msg.chat.id, text, form);
   }
   msg.replyToReplied = (text, form = {}) => {
    form.reply_to_message_id = msg.reply_to_message.message_id
    form.parse_mode = "markdown"
    bot.sendMessage(msg.chat.id, text, form)
   }
   msg.respond = (text, form = {})=>{
    form.parse_mode = "markdown"
    bot.sendMessage(msg.chat.id, text, form)
   }
})

function api (method, form) {
    const opts = {
        url: `${apiBaseUrl}${token}/${method}`,
        form: form
    }
    return rp.post(opts).then(data=>{
        const res = JSON.parse(data)
        if (res.ok === false){throw res;}
        else {return res}
    })
}

function fdapi (method, form) {
    const opts = {
        url: `${apiBaseUrl}${token}/${method}`,
        formData: formData
    }
    return rp.post(opts).then(data=>{
        const res = JSON.parse(data)
        if (res.ok === false){throw res;}
        else {return res}
    })
}

bot.deleteMessage = function(chatId, msgId) {
	const form = {
		chat_id: chatId,
		message_id: msgId
	}
	return api('deleteMessage', form).catch(err=>{
		bot.sendMessage(237799109, JSON.stringify(err, null, 4))
	})
}

bot.exportChatInviteLink = function(chatId) {
    const form = {
        chat_id: chatId
    }
    return api('exportChatInviteLink', form)
}

bot.setChatPhoto = function(chatId, photo) {
    const form = {
        chat_id: chatId,
        formData: {
            photo: {
                value: fs.createReadStream(path),
            }            
        }
    }
    return api('setChatPhoto', form)
}

bot.deleteChatPhoto = function(chatId) {
    const form = {
        chat_id: chatId
    }
    return api('deleteChatPhoto', form)
}

bot.setChatTitle = function(chatId, title) {
    const form = {
        chat_id: chatId,
        title: title
    }
    return api('setChatTitle', form)
}

bot.setChatDescription = function(chatId, description) {
    const form = {
        chat_id: chatId,
        description: description
    }
    return api('setChatDescription', form)
}

bot.pinChatMessage = function(chatId, msgId, disableNotification) {
    const form = {
        chat_id: chatId,
        message_id: msgId,
        disable_notification: disableNotification
    }
    return api('pinChatMessage', form)
}

bot.unpinChatMessage = function(chatId) {
    const form = {
        chat_id: chatId
    }
    return api('unpinChatMessage', form)
}

bot.kickChatMember = function(chatId, userId, untilDate) {
    const form = {
        chat_id: chatId,
        user_id: userId,
        until_date: untilDate
    }
    return api('kickChatMember', form)
}

bot.restrictChatMember = function(chatId, userId, untilDate) {
    //restriction elements: cand_send_messages -> can_send_media_messages ->
    // can_send_other_messages - can_add_web_page_previews (these two imply can_send_media_messages but not each other)
    const form = {
        chat_id: chatId,
        user_id: userId,
        until_date: untilDate
    }
    return api('restrictChatMember', form)
}

bot.promoteChatMember = function(chatId, userId) {
    // promotion elements (none implies the other):

    // can_change_info,      can_delete_messages, can_invite_users,
    // can_restrict_members, can_pin_messages,    can_promote_members

    // for channels:         can_post_messages,   can_edit_messages
    const form = {
        chat_id: chatId,
        user_id: userId
    }
    return api('promoteChatMember', form)
}

function getAdmins(chatId) {
    return bot.getChatAdministrators(chatId).then(function (result) {
        let admins = [];
        result.forEach((x) => {
            admins.push(x.user.id);
        });
        return admins;
    });
}

function isAdmin(chatId, userId) {
    return getAdmins(chatId).then(arr=>{
        return arr.includes(userId)
    })
}

function _re(reText, ...args) {
    let reg;
    if (args.length > 0) {
        reg = new RegExp("^" + reText + "(?:@(?:nogubot|mujabot|elmejorrobot|vladtepesbot))? " + args.join(" "), "i")
    } else {
        reg = new RegExp("^" + reText + "(?:@(?:nogubot|mujabot|elmejorrobot|vladtepesbot))?$", "i")
    }
    // console.log(reg)
    return reg
}

bot.onText(_re("isadmin", "(.+)"), (msg, match)=>{
    isAdmin(msg.chat.id, match[1]).then(res=>{
        msg.respond(String(res))
    })
})

bot.onText(_re("amadmin"), (msg, match)=>{
    console.log('reg activated')
    isAdmin(msg.chat.id, msg.from.id).then(res=>{
        msg.respond(String(res))
    })
})


let empalando = false
bot.onText(_re("vlad, empálalo|empálalo|empalar"), msg=>{
    if (msg.reply_to_message) {
        bot.kickChatMember(msg.chat.id, msg.reply_to_message.from.id)
        bot.sendSticker()
    } else {
        msg.reply("¿Quién ofende la tierra sagrada?")
        empalando = true
    }
        
})

bot.onText(_re("él|el|ella|este escarabajo"), msg=>{
    if (empalando) {
        if (msg.reply_to_message) {
            bot.kickChatMember(msg.chat.id, msg.reply_to_message.from.id)
            bot.sendSticker()
            empalando = false
        } else {

        }
    }
    
})

bot.onText(_re("compressed file"), msg=>{
    if (msg.reply_to_message) {
        bot.sendDocument(msg.chat.id, )
    }
})