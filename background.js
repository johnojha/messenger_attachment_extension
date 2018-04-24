
					

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
	console.log(request);
    if (request.action == "login")
	{
		var email = request.data.email;
		var password = request.data.pwd;
		console.log(email+'--'+password);
		var request = new XMLHttpRequest();
		request.open('POST', 'https://dev.api.hubble-docs.com/api/test/users/sign_in',  true);
		request.onreadystatechange = function() { 
		if (request.readyState === 4) {  // Makes sure the document is ready to parse.
			if (request.status === 200) {  // Makes sure it's found the file.
     
				var response = request.responseText;
				response = JSON.parse(response); console.log(response);
				var accessToken = response.accessToken; console.log(accessToken);
			    localStorage.setItem("swaggerToken",accessToken);
				sendResponse({download: true});
	        }
          }
		}
       request.setRequestHeader("Content-Type", "application/json");


		 var body =  {
				  "email": email,
				  "password": password
			}

				  console.log(body);
		   request.send(JSON.stringify(body));

	
	}
	if(request.action='getfile')
	{
		var fileurl = request.file;
		chrome.downloads.download({'url':fileurl}, function(downloadId){ console.log(downloadId); 
				chrome.downloads.search({'id':downloadId}, function(arr){ console.log(arr);
						var fileName = arr[0].filename;
						sendFile(fileName);
				});
		
		})


	}
});

function sendFile(fileName)
{
	var fileCode=fileName.substring(fileName.lastIndexOf('\\')+1,fileName.length);
	var txtFile = new XMLHttpRequest();
	var tokenStorage = localStorage.getItem('swaggerToken');

	 $.ajax({
					  url: "https://dev.api.hubble-docs.com/api/test/folders",
					 type:'GET',
					  success: function(data){  
						  var result = data; 
						console.log(result);
					
					  },
					  error:function(data){console.log(data); console.log('Error!');},
					headers:{'Content-Type': 'application/json','Authorization':tokenStorage}
					});	
	txtFile.open("POST", "https://dev.api.hubble-docs.com/api/test/documents", true);
	txtFile.onreadystatechange = function() { console.log(txtFile);
	  if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
		if (txtFile.status === 200) {  // Makes sure it's found the file.

			
		   // lines = txtFile.responseText.split("\n"); // Will separate each line into an array
			console.log(txtFile);
		}
	  }
	}
	console.log(tokenStorage);
	txtFile.setRequestHeader("Content-Type", "application/json");
	txtFile.setRequestHeader("Authorization", tokenStorage); 
	var body1 = {
				  "name": fileCode,
				  "folderId":48790995,
				  "file":fileName
				};
    txtFile.send(JSON.stringify(body1));

}