var irc = require( 'irc' );
var storage = require( './storage' );
var isValidHost = require( './utils' ).isValidHost;
var pug = require( 'pug' );
var bot = module.exports = new irc.Client(
	'chat.freenode.net',
	'myfanwy',
	require( './config.json' )
);

const CHANNEL = '##microchip08';

bot.addListener( 'pm', function ( nick, message ) {
	var msg = message.split( ' ' );
	if ( msg.length !== 2 ) {
		return bot.say( nick, 'Invalid command.' );
	}

	if ( msg[0] === 'VERIFY' ) {
		var slug = msg[1];
		if ( !storage.data.slugs[slug] ) {
			return bot.say( nick, 'Verification code not recognised. Please refresh and try again.' );
		}
		if ( !storage.data.nicks[nick] || storage.data.nicks[nick].ns !== 'VERIFIED' ) {
			storage.data.nicks[nick] = {
				'slug': slug,
				'nick': nick,
				'host': storage.data.slugs[slug],
				'ns': null
			};
			storage.data.slugs[slug] = nick;
			bot.say( nick, 'Thanks. Return to your browser to continue.' );
			storage.saveToDisk();

			if ( isValidHost( storage.data.nicks[nick].host ) ) {
				bot.say( nick, 'You\'re now verified. Return to your browser to continue.' );
				bot.say( 'NickServ', 'ACC ' + nick );
			} else {
				bot.say( nick, 'Thanks. Return to your browser to continue.' );
			}
		} else {
			bot.say( nick, 'Your nick is already verified. You cannot be verified twice.' );
			bot.say( nick, 'If you need help, contact this bot\'s owner with /msg MemoServ send zuzak <your message>' );
		}
	} else {
		bot.say( nick, 'Unknown command.' );
	}
} );

bot.addListener( 'notice', function ( nick, to, text ) {
	if ( nick === 'NickServ' && to === bot.nick ) {
		console.log( text );
		if ( text.indexOf( ' ACC ' ) !== -1 ) {
			console.log(text)
			var msg = text.split( ' ' );
			var data = {
				nick: msg[0],
				state: msg[2].trim()
			};
			console.log( data );
			if ( data.state === '3' ) {
				storage.data.nicks[data.nick].ns = 'VERIFIED';
				bot.say( 'ChanServ', 'access ##zuzakistan-lab add ' + data.nick + ' +V' );
				bot.say( data.nick, 'You have been added to the list of automatic voices in ' + CHANNEL + '.' );
				bot.say( data.nick, 'To voice yourself again, just authenticate to NickServ.' );
				storage.data.nicks[data.nick].msg = pug.renderFile('views/verified.pug', { channel: CHANNEL });
				storage.saveToDisk();
			} else {
				storage.data.nicks[data.nick].ns = 'UNVERIFIED';
				bot.say( 'ChanServ', 'voice ' + CHANNEL + ' ' + data.nick );
				bot.say( data.nick, 'You have been temporarily voiced in ' + CHANNEL );
				bot.say( data.nick, 'Register (and authenticate) with NickServ to gain permanent voice.' );
				storage.data.nicks[data.nick].msg = pug.renderFile('views/unverified.pug', { channel: CHANNEL });
				storage.saveToDisk();
			}
		}
	}
} );
