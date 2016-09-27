var dns = require( 'dns' ); // core
var express = require( 'express' );
var minify = require( 'express-uglify' );
var path = require( 'path' ); // core
var isValidHost = require( './utils' ).isValidHost;

var bot = require( './irc' );
var storage = require( './storage' );

var app = module.exports = express();

app.set( 'view engine', 'pug' );

app.use( minify.middleware( {
	src: path.join( __dirname, 'public' )
} ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );

app.enable( 'trust proxy' );

app.genKey = function ( x ) {
	var o = '';
	var chars = 'bcdfghjkmnpqrstvwxyz23456789BCDFGHJKLMNPQRSTVWXYZ';
	for ( var i = 0; i < x; i++ ) {
		o += chars.charAt( Math.floor( Math.random() * chars.length ) );
	}
	return o;
};

// routes
app.get( '/', function ( req, res ) {
	var slug = app.genKey( 5 );
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if ( !bot ) {
		res.status( 500 ).render( 'noirc.pug' );
	}
	dns.reverse( ip, function ( err, hosts ) {
		if ( err ) {
			if ( err.code !== 'ENOTFOUND' ) {
				throw err;
			}
		} else {
			ip = hosts[0];
		}
		storage.data.slugs[slug] = ip;
		if ( isValidHost( ip ) ) {
			res.render( 'index.pug', { bot: bot, slug: slug, host: ip } );
		} else {
			res.status( 403 ).render( 'ineligible.pug', { host: ip } );
		}
	} );

	// storage.data.slugs[slug] = 
	storage.saveToDisk();
} );

app.get( '/keys/:slug', function ( req, res ) {
	if ( !storage.data.slugs[req.params.slug] ) {
		res.json( { error: 'invalid authentication code' } );
	} else if ( storage.data.nicks[storage.data.slugs[req.params.slug]] ) {
		var data = storage.data.nicks[storage.data.slugs[req.params.slug]];
		data.host = null; // privacy
		res.json( data );
	} else {
		res.json( { error: null } );
	}
} );

app.get( '/privacy', function ( req, res ) {
	res.render( 'privacy.pug' );
} );

app.listen( 3000 );

process.on( 'SIGINT', function () {
	console.log( 'Caught ^C, exiting' );
	storage.saveToDisk();
	process.exit( 0 );
} );
