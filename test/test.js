var app = require( '..' );
var request = require( 'supertest' );
var should = require( 'should' ); // extends prototypes

describe( 'running Express.js', function () {
	it( 'responds with a 404', function ( done ) {
		request( app )
			.get( '/foo' )
			.expect( 404, done )
	} );
} );

describe( 'index page', function () {
	it( 'should hello world', function ( done ) {
		request( app )
			.get( '/' )
			.expect( 200 )
			.end( function ( err, res ) {
				res.text.should.equal( 'Hello, World!' );
				done();
			} );
	} );
} );
