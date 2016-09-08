( function () {
	var slug = document.getElementById( 'slug' ).innerHTML;
	changeStatus( 'Loaded' );
	poll( slug, 0);
} )();

function changeStatus( str ) {
	var element = document.getElementById( 'status' );
	element.innerHTML = str;
}

function poll( slug, i ) {
	i++;
	getJSON( '/keys/' + slug, function ( err, res ) {
		changeStatus( 'Waiting' +  dots( i ) );
		if ( err ) {
			return changeStatus( 'Error! (' + err + ')' );
		}
		if ( res !== null ) {
			// success
			changeStatus( 'Authenticated as ' + res );
		} else {
			setTimeout( function () {
				poll( slug, i++ );
			}, 1000 );
		}
	} );
};


// http://stackoverflow.com/a/35970894
function getJSON( url, cb ) {
	var xhr = new XMLHttpRequest();
	xhr.open( 'get', url, true );
	xhr.responseType = 'json';
	xhr.onload = function () {
		var status = xhr.status;
		if ( status == 200 ) {
			cb( null, xhr.response );
		} else {
			cb( status );
		}
	};
	xhr.send();
};

function dots( x ) {
	str = '';
	for ( var i = 0; i < x % 4; i++ ) {
		str += '.';
	}
	return str;
}
