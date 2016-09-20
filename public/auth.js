const RED = 'rgb( 200, 16, 46 )';
const BLU = 'rgb( 0, 94, 184 )';
const GRN = 'rgb( 4, 106, 56 )';
const BRN = 'rgb(121, 68, 0)';

( function () {
	var slug = document.getElementById( 'slug' ).innerHTML;
	changeStatus( 'Loaded' );
	poll( slug, 0);
} )();

function changeStatus( str, color ) {
	var element = document.getElementById( 'status' );
	element.innerHTML = str;
	document.body.style.background = color || GRN;
}

function changeMessage( str ) {
	var element = document.getElementById( 'message' );
	element.innerHTML = str;
}

function poll( slug, i ) {
	i++;
	getJSON( '/keys/' + slug, function ( err, res ) {
		changeStatus( 'Waiting' +  dots( i ) );
		if ( err ) {
			return changeStatus( 'Error! (' + err + ')', RED );
		}
		if ( res.error ) {
			changeStatus( res.error, RED );
		} else if ( res.ns ) {
			// success
			if ( res.msg ) {
				changeMessage( res.msg );
			}
			changeStatus( res.ns, BLU );
			document.getElementById( 'name' ).innerHTML = res.nick;
		} else {
			setTimeout( function () {
				poll( slug, i++ );
			}, 2000 );
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
