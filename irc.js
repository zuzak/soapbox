var irc = require('irc')
var storage = require('./storage')
var isValidHost = require('./utils').isValidHost
var pug = require('pug')

var config
try {
  config = require('./config.json')
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e
  } else {
    console.log('(no IRC config found')
    config = {}
  }
}
var bot = module.exports = new irc.Client(
  'chat.freenode.net',
  'myfanwy',
  config
)

const CHANNELS = [
  '#abercs',
  '#abercompsoc'
]

bot.addListener('pm', function (nick, message) {
  console.log('< ' + nick + '>', message)
  var msg = message.split(' ')
  if (msg.length !== 2) {
    return bot.say(nick, 'Invalid command.')
  }

  if (msg[0] === 'VERIFY') {
    var slug = msg[1]
    if (!storage.data.slugs[slug]) {
      return bot.say(nick, 'Verification code not recognised. Please refresh and try again.')
    }
    if (!storage.data.nicks[nick] || storage.data.nicks[nick].ns !== 'VERIFIED') {
      storage.data.nicks[nick] = {
        'slug': slug,
        'nick': nick,
        'host': storage.data.slugs[slug],
        'ns': null
      }
      storage.data.slugs[slug] = nick
      storage.saveToDisk()

      if (isValidHost(storage.data.nicks[nick].host)) {
        bot.say('NickServ', 'ACC ' + nick)
      } else {
        bot.say(nick, 'Thanks. Return to your browser to continue.')
      }
    } else {
      bot.say(nick, 'Your nick is already verified. You cannot be verified twice.')
      bot.say(nick, 'If you need help, contact this bot\'s owner with /msg MemoServ send zuzak <your message>')
    }
  } else {
    bot.say(nick, 'Unknown command.')
  }
})

bot.addListener('notice', function (nick, to, text) {
  console.log('[ ' + nick + ']', text)
  if (nick === 'NickServ' && to === bot.nick) {
    if (text.indexOf(' ACC ') !== -1) {
      var msg = text.split(' ')
      var data = {
        nick: msg[0],
        state: msg[2].trim()
      }
      if (data.state === '3') {
        storage.data.nicks[data.nick].ns = 'VERIFIED'
        for (var i = 0; i < CHANNELS.length; i++) {
          bot.say('ChanServ', 'access ' + CHANNELS[i] + ' add ' + data.nick + ' +V')
        }
        bot.say(data.nick, 'You have been added to the list of automatic voices in ' + CHANNELS.join(' and ') + '.')
        bot.say(data.nick, 'To voice yourself again, just authenticate to NickServ.')
        storage.data.nicks[data.nick].msg = pug.renderFile('views/verified.pug', { channel: CHANNELS.join(' and ') })
        storage.saveToDisk()
      } else {
        storage.data.nicks[data.nick].ns = 'UNVERIFIED'
        for (var j = 0; j < CHANNELS.length; j++) {
          bot.say('ChanServ', 'voice ' + CHANNELS[j] + ' ' + data.nick)
          bot.say(data.nick, 'You have been temporarily voiced in ' + CHANNELS[j])
        }
        if (data.state !== '0') {
          bot.say(data.nick, 'Authenticate with NickServ and try again to gain permanent voice.')
        } else {
          bot.say(data.nick, 'Register (and authenticate) with NickServ to gain permanent voice.')
        }
        storage.data.nicks[data.nick].msg = pug.renderFile('views/unverified.pug', { channel: CHANNELS.join(' and ') })
        storage.saveToDisk()
      }
    }
  }
})
