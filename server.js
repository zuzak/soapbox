var express = require( 'express' );
var path = require( 'path' ); // core
var read = require( 'fs' ).readFileSync;

var app = module.exports = express();
var bot = require( './irc' );

app.set( 'view engine', 'pug' );

app.use( express.static( path.join( __dirname, 'public' ) ) );

app.genKey = function ( x ) {
	var o = '';
	// confusing chars ommitted (PMCID: PMC3541865)
	var chars  = 'abdfhijkprstuvwxyzACGHJKLMNPQRUVWXY3469';
	for ( var i = 0; i < x; i++ ) {
		o += chars.charAt( Math.floor( Math.random() * chars.length ) );
	}
	return o;
};

// routes
app.get( '/', function ( req, res ) {
	res.render( 'index.pug', { bot: bot, slug: app.genKey( 5 ) } );
} );

app.get( '/keys/:slug', function ( req, res ) {
	var keys = JSON.parse( read( 'keys.json', 'utf-8' ) );
	if ( keys[req.params.slug] ) {
		res.json( keys[req.params.slug] );
	} else {
		res.json( null );
	}
} );

app.listen( 3000 );
