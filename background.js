
					

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
	console.log(request);
    if (request.action == "login")
	{
		/*var email = request.data.email;
		var password = request.data.pwd;
		console.log(email+'--'+password);
		var xhrlogin = new XMLHttpRequest();
		xhrlogin.open('POST', 'https://dev.api.hubble-docs.com/api/test/users/sign_in',  true);
		xhrlogin.onreadystatechange = function() { 
		if (xhrlogin.readyState === 4) {  // Makes sure the document is ready to parse.
			if (xhrlogin.status === 200) {  // Makes sure it's found the file.
     
				var response = xhrlogin.responseText;
				response = JSON.parse(response); console.log(response);
				var accessToken = response.accessToken; console.log(accessToken);
			    localStorage.setItem("swaggerToken",accessToken);
				sendResponse({download: true});
	        }
          }
		}
       xhrlogin.setRequestHeader("Content-Type", "application/json");


		 var body =  {
				  "email": email,
				  "password": password
			}

				  console.log(body);
		   xhrlogin.send(JSON.stringify(body));*/

	
	}
	if(request.action='getfile')
	{ console.log(request);
		var fileurl = request.file;
		var fileName = request.name;
		console.log(fileurl);
		sendFile(fileurl,fileName);
//				chrome.downloads.download({'url':fileurl}, function(downloadId){ console.log(downloadId); 
//						chrome.downloads.search({'id':downloadId}, function(arr){ console.log(arr);
//								var fileUrl = arr[0].url;
//								/*if(!fileName.length)
//									fileName = arr[0].finalUrl;*/
//								console.log('File Url : '+fileUrl);
//								sendFile(fileUrl,fileName);
//						});
//				
//				})
	}
});

function sendFile(fileUrl,fileName)
{ 
	console.log(fileUrl);
	console.log(fileName);
	var fileCode=fileName;//.substring(fileName.lastIndexOf('\\')+1,fileName.length);
	var txtFile = new XMLHttpRequest();
	var tokenStorage = localStorage.getItem('swaggerToken');

     // Getting folder information
	 /*$.ajax({
					  url: "https://dev.api.hubble-docs.com/api/test/folders",
					 type:'GET',
					  success: function(data){  
						  var result = data; 
						console.log(result);
					
					  },
					  error:function(data){console.log(data); console.log('Error!');},
					headers:{'Content-Type': 'application/json','Authorization':tokenStorage}
					});	*/
	txtFile.open("POST", "https://dev.api.hubble-docs.com/api/test/documents", true);
	//	txtFile.open("POST", "http://localhost:3000/api/test/documents", true);

	txtFile.onreadystatechange = function() { 
	  if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
		if (txtFile.status === 200) 
		{  // Makes sure it's found the file.
			
			console.log(txtFile);
		}
	  }
	}
	console.log(tokenStorage);
	//txtFile.setRequestHeader("Content-Type", "multipart/form-data");
	txtFile.setRequestHeader("Authorization", tokenStorage); 

	var formData = new FormData();
  
	//var file = "http://ojhasoftsolutions.in/mamta/testdoc.docx";

    //*********************************************8

     var blob = null;
	var xhr = new XMLHttpRequest(); 
	xhr.open("GET", fileUrl); 
	xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
	xhr.onload = function() 
	{
		blob = xhr.response;//xhr.response is now a blob object
		console.log(blob);
		
		formData.append('file', blob ,fileName );
		formData.append('name', fileName);
		formData.append('folderId',-1);
		console.log(formData);
		txtFile.send(formData);

	}
	xhr.send();




	//*******************************************





	/*var body1 = {
				  "name": fileCode,
				  "folderId":48790995,
				  "file":fileName
				};*/

}