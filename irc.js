var irc = require( 'irc' );
var storage = require( './storage' );
var bot = module.exports = new irc.Client(
	'chat.freenode.net',
	'myfanwy',
	require( './config.json' )
);

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

			bot.say( 'NickServ', 'ACC ' + nick);
			bot.whois( nick, function ( info ) {
				console.log( info );
			} );
		} else {
			bot.say( nick, 'Your nick is already verified. You cannot be verified twice.' );
		}
	} else {
		bot.say( nick, 'Unknown command.' );
	}
} );
bot.addListener( 'notice', function ( nick, to, text ) {
	if ( nick === 'NickServ' && to === bot.nick ) {
		console.log( text );
		if ( text.indexOf( ' ACC ' ) !== -1 ) {
			var msg = text.split( ' ' );
			var data = {
				nick: msg[0],
				state: msg[2].trim()
			};
			console.log( data );
			if ( data.state === '3' ) {
				storage.data.nicks[data.nick].ns = 'VERIFIED';
				bot.say( 'ChanServ', 'access ##zuzakistan-lab add ' + data.nick + ' +V' );
				storage.saveToDisk();
			} else {
				storage.data.nicks[data.nick].ns = 'UNVERIFIED';
				bot.say( 'ChanServ', 'voice ##zuzakistan-lab ' + data.nick );
				storage.saveToDisk();
			}
		}
	}
} );
