var dns = require( 'dns' ); // core
var express = require( 'express' );
var minify = require( 'express-uglify' );
var path = require( 'path' ); // core

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
	if ( false) {
		res.status( 403 ).render( 'ineligible.pug' );
	} else {
		var slug = app.genKey( 5 );
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		dns.reverse( ip, function ( err, hosts ) {
			if ( err.code === 'ENOTFOUND' ) {
				storage.data.slugs[slug] = ip;
				return;
			} else {
				throw err;
			}
			storage.data.slugs[slug] = hosts[0];
			return;
		} );

		// storage.data.slugs[slug] = 
		storage.saveToDisk();
		res.render( 'index.pug', { bot: bot, slug: slug } );
	}
} );

app.get( '/keys/:slug', function ( req, res ) {
	if ( !storage.data.slugs[req.params.slug] ) {
		res.json( { error: 'invalid authentication code' } );
	} else if ( storage.data.nicks[storage.data.slugs[req.params.slug]] ) {
		res.json( storage.data.nicks[storage.data.slugs[req.params.slug]] );
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
