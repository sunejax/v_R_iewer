// MyAuthToken.js
//
// object to encapsulate retrieval of an authorization code for the viewing service.  After declaring
// a global instance, you can repeatedly call value() whenever you need the token to pass to an API
// call.  It will keep track of the expiration of the token and referesh it when necessary.
//
// NOTE: there is another way to accomplish this by just calling the API function with a token without
// worrying about whether it has expired, and then if it returns "Invalid Token", then get a new token
// and retry.  This is possible with jQuery, but only works with the .success()/.error() constructs and
// not with .done(), .fail() (at least not without a lot of convoluted extra work).  For now, I am
// happier doing it this way, but am open to suggestions on best practices.
//
// Jim Awe
// Autodesk, Inc.


// CONS MyAuthToken():
// locally running token service (Token Service is started with Node.js command: "node AuthTokenServer.js")
// If you deploy AuthTokenServer.js, this obj constructor needs to change URL accordingly.


function MyAuthToken(env)
{
    this.token = "";
    this.expires_in = 0;
    this.timestamp = 0;

    this.setDefaultTokenServiceUrl(env);
}

MyAuthToken.prototype.setDefaultTokenServiceUrl = function(env)
{
    this.isDefault = true;
    this.isManual = false;

    if (env === "PROD") {
        //this.tokenService = "https://localhost:3000/auth";
        this.tokenService = "https://salty-caverns-3017.herokuapp.com/auth";
    }
    else if (env === "STG") {
        //this.tokenService = "https://localhost:3000/auth-stg";
        this.tokenService = "https://salty-caverns-3017.herokuapp.com/auth-stg";
    }
    else if (env === "DEV") {
        //this.tokenService = "https://localhost:3000/auth-dev";
        this.tokenService = "https://salty-caverns-3017.herokuapp.com/auth-dev";
    }
    else {
        alert("DEVELOPER ERROR: No valid environment set for MyAuthToken()");
    }
}

MyAuthToken.prototype.setCustomTokenServiceUrl = function(urlForTokenService)
{
    this.isDefault = false;
    this.isManual = false;

    this.tokenService = urlForTokenService;
}

MyAuthToken.prototype.setManualAuthToken = function(authToken)
{
    this.isDefault = false;
    this.isManual = true;

    this.tokenService = "";
    this.token = authToken;
}

// FUNC value():
// return the value of the token

MyAuthToken.prototype.value = function()
{
        // if we've never retrieved it, do it the first time
    if (this.token === "") {
        if (this.isManual) {
            alert("No Manual AuthToken Specified!");
        }
        else {
            this.get();
            console.log("AUTH TOKEN: Getting for first time...");
        }
    }
    else {
            // get current timestamp and see if we've expired yet
        var curTimestamp = Math.round(new Date() / 1000);   // time in seconds
        var secsElapsed = curTimestamp - this.timestamp;

        if (secsElapsed > (this.expires_in - 10)) { // if we are within 10 secs of expiring, get new token
            console.log("AUTH TOKEN: expired, refreshing...");
            this.get();
        }
        else {
            var secsLeft = this.expires_in - secsElapsed;
            console.log("AUTH TOKEN: still valid (" + secsLeft + " secs)");
        }
    }

    return this.token;
};

// FUNC get():
// get the token from the Authentication service and cache it, along with the expiration time

MyAuthToken.prototype.get = function()
{
    if (this.isManual)  // they've manually set it, nothing to do
        return this.token;

    var retVal = "";
    var fullRetVal = "";
    var expires_in = 0;

    var jqxhr = $.ajax({
        url: this.tokenService,
        type: 'GET',
        async: false,
        success: function(ajax_data) {
            console.log("AUTH TOKEN: " + ajax_data.access_token);
            fullRetVal = ajax_data;
            retVal = ajax_data.access_token;  // NOTE: this only works because we've made the ajax call Synchronous (and "this" is not valid in this scope!)
            expires_in = ajax_data.expires_in;

        },
        error: function(jqXHR, textStatus) {
            alert("AUTH TOKEN: Failed to get new auth token!");
        }
    });

    this.token = retVal;
    this.expires_in = expires_in;
    this.timestamp = Math.round(new Date() / 1000);  // get time in seconds when we retrieved this token

    return fullRetVal;  // so test function can display raw result
};

