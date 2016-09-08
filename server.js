var express = require( 'express' );

var app = module.exports = express();

// routes
app.get( '/', function ( req, res ) {
	res.send( 'Hello, World!' );
} );

app.listen( 3000 );
