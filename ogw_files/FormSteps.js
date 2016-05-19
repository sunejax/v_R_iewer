var _fileUploadData = null;     // global variable to store the data uploaded from the file
var _spinner = null;
var _prgrs=null;

    // allow our code to switch between different environments easily
var _viewingSvcEnv = "PROD";     // PROD, STG, DEV
var _baseURL = "";
if (_viewingSvcEnv === "PROD") {
    _baseURL = "https://developer.api.autodesk.com";
    _viewerEnv = "AutodeskProduction";
}
else if (_viewingSvcEnv === "STG") {
    _baseURL = "https://developer-stg.api.autodesk.com";
    _viewerEnv = "AutodeskStaging";
}
else if (_viewingSvcEnv === "DEV") {
    _baseURL = "https://developer.api.autodesk.com";
    _viewerEnv = "AutodeskDevelopment";
}
else {
    alert("DEVELOPER ERROR: Set Environment to a valid state!");
}

console.log("Enviornment: " + _viewingSvcEnv + " " + _baseURL + " " + _viewerEnv);

    // helper object to get us our AuthToken based on our developer keys
var _myAuthToken = new MyAuthToken(_viewingSvcEnv);
_myAuthToken.setManualAuthToken("");
//_myAuthToken.get();


/*function initialize() {
var options = {
'document' : 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dnJpZXdlci9jbGlwdGVzLkNBVFBhcnQ=',
'env':'AutodeskProduction',
'getAccessToken': getToken,
'refreshToken': getToken,
};
alert(strasd);
var viewerElement = document.getElementById("lviewer");

var viewer = new Autodesk.Viewing.Viewer3D(viewerElement, {});
Autodesk.Viewing.Initializer(
options,
function() {
   viewer.initialize();
   loadDocument(viewer, options.document);
}

);
  viewerElement = document.getElementById("rviewer");

var viewerR = new Autodesk.Viewing.Viewer3D(viewerElement, {});
Autodesk.Viewing.Initializer(
options,
function() {
   viewerR.initialize();
   loadDocument(viewerR, options.document);
}

);
 
}


function loadDocument(viewer, documentId) {
// Find the first 3d geometry and load that.
Autodesk.Viewing.Document.load(
  
documentId,
function(doc) {// onLoadCallback
   var geometryItems = [];
   geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
       'type' : 'geometry',
       'role' : '3d'
   }, true);
   if (geometryItems.length > 0) {
       viewer.load(doc.getViewablePath(geometryItems[0]));
   }
},
function(errorMsg) {// onErrorCallback
   alert("Load Error: " + errorMsg);
}
);
}*/




    // start a UI spinner to indicate to the user that an async call is in progress
function startSpinner(divId) {
    var target = document.getElementById(divId);

    if (_spinner === null) {
        _spinner = new Spinner();
    }
    _spinner.spin(target);
}

    // stop the spinner when async call is complete
function stopSpinner() {
    if (_spinner !== null)
        _spinner.stop();
}

function getToken() {
var theUrl = "https://warm-wave-70051.herokuapp.com/auth"; 
var xmlHttp = null;
xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", theUrl, false);
xmlHttp.send(null);
var resp =  JSON.parse(xmlHttp.responseText);
token = resp["access_token"];
return token;
}

function translator() {
	
        $('#currentStatus').html('Translating...');

        $("#txt_resTranslate").html("");  // blank out any previous results

        var urnStr = strasd;
        var dataObj = {
            urn : urnStr
        };
        var dataStr = JSON.stringify(dataObj);
        var urlStr = _baseURL + '/viewingservice/v1/register';
        var jqxhr = $.ajax({
            url: urlStr,
            type: 'POST',
            headers: {
                "Authorization": "Bearer " + token
            },
            data: dataStr,
            contentType: 'application/json',
            beforeSend: startSpinner("spn_translateFile")
            
        })
            
        .done(function(ajax_data) {
            $("#txt_resTranslate").html(JSON.stringify(ajax_data, null, '   '));   
                 _prgrs=setInterval(transtatus,1000);
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resTranslate").html(ajaxErrorStr(jqXHR));
            stopSpinner();
        });
   }
function transtatus() {     

 $("#txt_resViewTranslateStatus").html("");  // blank out any previous results

        var urnStr = strasd;
      	 var includeAll = $("#cb_viewStatusAll").is(":checked");

        var urlStr = _baseURL + '/viewingservice/v1/' + urnStr;
        if (includeAll)
            urlStr += "/all";

        var jqxhr = $.ajax({
            url: urlStr,
            type: 'GET',
            headers: {
                "Authorization": "Bearer " + token
            },
            beforeSend: startSpinner("spn_viewTranslationStatus"),
            success:function (resul) {
            	if(resul.success=='100%')			{
																clearInterval(_prgrs);
																initialize();         											
            												}
            								}
        })
        .done(function(ajax_data) {
				var temp= JSON.stringify(ajax_data, null, '   ') ;     
            $("#txt_resViewTranslateStatus").html(temp);
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resViewTranslateStatus").html(ajaxErrorStr(jqXHR));
            stopSpinner();
        });
        
    }
$(document).ready(function() {

        // upload a file to the given bucket
    $("#form_uploadFile").submit(function(evt) {
        evt.preventDefault();

            // make sure they specified a bucketName
        var bucketNameStr = evt.target.bucketName.value;
        if (!bucketNameStr || (0 === bucketNameStr.length)) {
            alert("You must specify an bucket name!");
            return;
        }

        $("#txt_resUploadFile").html("");  // blank out any previous results
			
            // make sure we can get the file
        var fileObj = $('#ui_filePicker')[0].files[0];
        if (!fileObj) {
            alert("Please choose a file first");
            return;
        }
       

		$('#currentStatus').html('Uploading...');
        var urlStr = _baseURL + '/oss/v1/buckets/'  + bucketNameStr + '/objects/' + fileObj.name;
        var jqxhr = $.ajax({
            url: urlStr,
            type: 'PUT',
            headers: {
                "Authorization": "Bearer " + getToken(),
                "Content-Type": 'application/stream'
            },
            data: _fileUploadData,      // global var set by FileUploader.js in the "loaded(evt)" function
            processData: false,
            beforeSend: startSpinner("spn_uploadFile")
        })
        .done(function(ajax_data) {
        //    ("#txt_resUploadFile").html(JSON.stringify(ajax_data, null, '   '));
        var msg_res=JSON.stringify(ajax_data, null, '   ');
        $("#txt_resUploadFile").html(msg_res);
        var uf= JSON.parse(msg_res);
         strasd=btoa(uf.objects[0].id);
        
         $("#txt_resEncode64").html("");  // blank out any previous results
        $("#txt_resEncode64").val(strasd);
        translator();
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resUploadFile").html(ajaxErrorStr(jqXHR));
            stopSpinner();
        });
    });

        // get the details of an object in a bucket
    $("#form_getObj").submit(function(evt) {
        evt.preventDefault();

        $("#txt_resGetObj").html("");  // blank out any previous results

        var urlStr = _baseURL + '/oss/v1/buckets/' + evt.target.bucketName.value +
                            '/objects/' + evt.target.objKey.value + '/details';
        var jqxhr = $.ajax({
            url: urlStr,
            type: 'GET',
            headers: {
                "Authorization": "Bearer " + _myAuthToken.value()
            },
            beforeSend: startSpinner("spn_getObj")
        })
        .done(function(ajax_data) {
            $("#txt_resGetObj").html(JSON.stringify(ajax_data, null, '   '));
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resGetObj").html(ajaxErrorStr(jqXHR));
            stopSpinner();
        });
    });


        // set References
    $("#form_setReferences").submit(function(evt) {
        evt.preventDefault();

            // Here is sample code hardwired to do one Host file with one Xref
        /*var dataObj = {
            master : "urn:adsk.objects:os.object:MYBUCKET/ROOT_FILE.xyz",
            dependencies : [
              { file : "urn:adsk.objects:os.object:MYBUCKET/LINKED_FILE.xyz",
                metadata : {
                    childPath : "LINKED_FILE.xyz",
                    parentPath : "ROOT_FILE.xyz"
                }
              }
              ]
        };*/

            // here we are reading the JSON in from the form
        var dataObj = null;
        try {
            var textStr = $("#txt_sampleSetRefs").val();
            dataObj = JSON.parse(textStr);
        } catch (error) {
            alert("JSON parsing error: \n" + error.message);
        }
        if (!dataObj)
            return;

        var dataStr = JSON.stringify(dataObj);

        $("#txt_resSetRefs").html("");  // blank out any previous results

        var urlStr = _baseURL + '/references/v1/setreference';
        var jqxhr = $.ajax({
            url: urlStr,
            type: 'POST',
            headers: {
                "Authorization": "Bearer " + _myAuthToken.value()
            },
            data: dataStr,
            //dataType: 'json',
            contentType: 'application/json',
            beforeSend: startSpinner("spn_setRefs")
        })
        .done(function(ajax_data) {
            $("#txt_resSetRefs").html(JSON.stringify(ajax_data, null, '   '));
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resSetRefs").html(ajaxErrorStr(jqXHR, textStatus));
            stopSpinner();
        });
    });


        // encode the given URN to one that is accepted by the translation service
    $("#form_urnToEncode").submit(function(evt) {
        evt.preventDefault();

        $("#txt_resEncode64").html("");  // blank out any previous results

        var str = Base64.encode(evt.target.urn.value);
        $("#txt_resEncode64").val(str);
    });

        // view status the file
    $("#form_viewTranslateStatus").submit(function(evt) {
        evt.preventDefault();

        $("#txt_resViewTranslateStatus").html("");  // blank out any previous results

        var urnStr = evt.target.urn.value;
         if (!urnStr || (0 === urnStr.length)) {
            alert("You must specify a URN!");
            return;
        }

        var includeAll = $("#cb_viewStatusAll").is(":checked");

        var urlStr = _baseURL + '/viewingservice/v1/' + urnStr;
        if (includeAll)
            urlStr += "/all";

        var jqxhr = $.ajax({
            url: urlStr,
            type: 'GET',
            headers: {
                "Authorization": "Bearer " + token
            },
            beforeSend: startSpinner("spn_viewTranslationStatus")
        })
        .done(function(ajax_data) {
            $("#txt_resViewTranslateStatus").html(JSON.stringify(ajax_data, null, '   '));
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resViewTranslateStatus").html(ajaxErrorStr(jqXHR));
            stopSpinner();
        });
    });

        // translate the file
    $("#form_translateFile").submit(function(evt) {
        evt.preventDefault();

        $("#txt_resTranslate").html("");  // blank out any previous results

        var urnStr = strasd;
         if (!urnStr || (0 === urnStr.length)) {
            alert("You must specify a URN!");
            return;
        }

        var dataObj = {
            urn : urnStr
        };
        var dataStr = JSON.stringify(dataObj);

        var urlStr = _baseURL + '/viewingservice/v1/register';
        var jqxhr = $.ajax({
            url: urlStr,
            type: 'POST',
            headers: {
                "Authorization": "Bearer " + token
            },
            data: dataStr,
            contentType: 'application/json',
            beforeSend: startSpinner("spn_translateFile")
        })
        .done(function(ajax_data) {
            $("#txt_resTranslate").html(JSON.stringify(ajax_data, null, '   '));
            stopSpinner();
        })
        .fail(function(jqXHR, textStatus) {
            $("#txt_resTranslate").html(ajaxErrorStr(jqXHR));
            stopSpinner();
        });
    });

});
