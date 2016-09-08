var irc = require( 'irc' );
var read = require( 'fs' ).readFileSync;
var write = require( 'fs' ).writeFileSync;
const KEYSTORE = 'keys.json';
var bot = module.exports = new irc.Client(
	'chat.freenode.net',
	'myfanwy',
	{
		channels: [ '##zuzakistan-lab' ]
	}
);

bot.addListener( 'pm', function ( from, message ) {
	var msg = message.split( ' ' );
	if ( msg.length !== 2 ) {
		return client.say( from, 'Invalid command.' );
	}

	if ( msg[0] == 'VERIFY' ) {
		var currentKeys = JSON.parse( read( KEYSTORE, 'utf-8' ) );
		currentKeys[msg[1]] = from;
		write( KEYSTORE, JSON.stringify( currentKeys, null, '    ' ) );
		bot.say( from, 'Authenticated as ' + from + '.' );
	} else {
		bot.say( from, 'Unknown command.' );
	}
} );
