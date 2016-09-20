module.exports = {
	isValidHost: function ( host ) {
		//return true;
		var regex = /[a-z]{3}[0-9]\.pip\.aber\.ac.\.uk/;
		var match = host.match( regex );
		return Boolean( match );
	}
};
