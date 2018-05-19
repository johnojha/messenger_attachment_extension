
chrome.storage.sync.get(['swaggerToken'], function(items) {
				  console.log(items);
				  var token = items.swaggerToken;
				  if(token && token.length)
					  logoutdiv.style.display="block";
				  else
					  logindiv.style.display="block";

});

document.getElementById("hubsignin").addEventListener("click",function(e){ 

   var emailid = document.getElementById("hubmail").value;
   var pwdid = document.getElementById("hubpwd").value;

   console.log(emailid+'----'+pwdid);
   var credentials ={email:emailid,pwd:pwdid};

   var xhrlogin = new XMLHttpRequest();
		xhrlogin.open('POST', 'https://dev.api.hubble-docs.com/api/test/users/sign_in',  true);
		xhrlogin.onreadystatechange = function() { console.log(xhrlogin);
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
				document.getElementById("signstat").innerHTML ="Successfully signed!";
					logoutdiv.style.display="block";
					logindiv.style.display="none";
				//setTimeout(function() { window.close(); }, 800 );
	        }
          }
		  else
			{
				document.getElementById("signstat").innerHTML ="<b style='color:red;margin-left: 5px;'>Invalid credentials!</b>";
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

document.getElementById("hublogout").addEventListener("click",function(e){

	chrome.storage.sync.remove(['swaggerToken'], function(){ console.log('removed');
					logoutdiv.style.display="none";
					logindiv.style.display="block";

	 })
});