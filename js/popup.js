

document.getElementById("hubsignin").addEventListener("click",function(e){ console.log(e);

   var emailid = document.getElementById("hubmail").value;
   var pwdid = document.getElementById("hubpwd").value;

   console.log(emailid+'----'+pwdid);
   var credentials ={email:emailid,pwd:pwdid};

   var xhrlogin = new XMLHttpRequest();
		xhrlogin.open('POST', 'https://dev.api.hubble-docs.com/api/test/users/sign_in',  true);
		xhrlogin.onreadystatechange = function() { 
		if (xhrlogin.readyState === 4) {  // Makes sure the document is ready to parse.
			if (xhrlogin.status === 200) {  // Makes sure it's found the file.
     
				var response = xhrlogin.responseText;
				response = JSON.parse(response); console.log(response);
				var accessToken = response.accessToken; console.log(accessToken);
			    localStorage.setItem("swaggerToken",accessToken);
				chrome.storage.sync.set({'swaggerToken': accessToken}, function() {
      console.log('Settings saved');
    });

				//sendResponse({download: true});
	        }
          }
		}
       xhrlogin.setRequestHeader("Content-Type", "application/json");


		 var body =  {
				  "email": emailid,
				  "password": pwdid
			}

		   console.log(body);
		   xhrlogin.send(JSON.stringify(body));




});