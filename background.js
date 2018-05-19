
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
	console.log(request);
    if (request.action == "login")
	{	

	
	}
	if(request.action='getfile')
	{ 
		var fileurl = request.file;
		var fileName = request.name;
		console.log(fileurl);
		sendFile(fileurl,fileName);
	}
});

function sendFile(fileUrl,fileName)
{ 
	console.log(fileUrl);
	console.log(fileName);
	var fileCode=fileName;
	var txtFile = new XMLHttpRequest();
	var tokenStorage = localStorage.getItem('swaggerToken');

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
	txtFile.setRequestHeader("Authorization", tokenStorage); 

	var formData = new FormData();
  
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
}


chrome.contextMenus.create({title:"Save to Hubble",documentUrlPatterns:["https://www.messenger.com/*"],contexts:["link"],onclick:function(info,tab)
	{ 
	    console.log(info);
		var uri_dec=info.linkUrl;
		
		var  propUrl= decodeURIComponent(uri_dec);

									   
		//var propUrl = downloadurl.substring(downloadurl.indexOf("u=")+2,downloadurl.length);
		console.log(propUrl);

		var fileNameArr = propUrl.split('?'); console.log(fileNameArr);
		var fileName = fileNameArr[1].substring(fileNameArr[1].lastIndexOf('/')+1,fileNameArr[1].length);
		console.log(fileName);
		if(fileName.indexOf('.doc')==-1 && fileName.indexOf('.docx')==-1)
		{
			 alert('Please transfer only doc/docx files.');
										   return false;
		}

		fileName = fileName.substring(0, fileName.indexOf('.')-1);
        var token='';
		chrome.storage.sync.get(['swaggerToken'], function(items) {
					  console.log(items);
					  token = items.swaggerToken;
					  if(token && token.length)
						{
								 var txtFile = new XMLHttpRequest();

								 console.log('Value currently is ' + token);

								  txtFile.open("POST", "https://dev.api.hubble-docs.com/api/test/documents", true);
								 						  
								  txtFile.onreadystatechange = function() { 
								  if (txtFile.readyState === 4) {  
									if (txtFile.status === 200) 
									{ 			
										console.log(txtFile);
										chrome.tabs.create({url:"https://dev.app.hubble-docs.com/my-folder"}, function() {});										
									}
								  }
								}
						
							txtFile.setRequestHeader("Authorization",token); 

							var formData = new FormData();
						  
							
							 var blob = null;
							var xhr = new XMLHttpRequest(); console.log(propUrl);
							xhr.open("GET", propUrl); 
							xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
							xhr.onload = function() 
							{
								blob = xhr.response;//xhr.response is now a blob object
								console.log(blob);
								
								formData.append('file', blob ,fileName);
								formData.append('name', fileName);
								formData.append('folderId',-1);
								console.log(formData);
								txtFile.send(formData);

							}
							xhr.send();
						}
					  else
						{
								alert('Please Sign In to complete the operation.');
								return false;
						}
		 });
		
	}	
},function(){ });

