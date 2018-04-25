/*$.ajax({
					  url:"https://dev.api.hubble-docs.com/api/test/users/sign_in",
					  body:{ email: "test2@gmail.com",password: "password"},
					  type:"POST",
					  //dataType:"json",
					  success: function(data){  
						  var result = data; 
						console.log(json.stringify(data));
					
					  },
					  error:function(data){console.log(data.responseText); console.log('Error!');},
						headers:{'accept': 'application/json'}
					});	*/


// $.post("https://virtserver.swaggerhub.com/OlympiadPreparation/OlympiadPreparation/1.0.0/users/sign_in",
//    {
//	  "password": "passw0rd",
//	  "email": "testingmamta"
//    },
//    function(data, status){
//        alert("Data: " + data + "\nStatus: " + status);
//    });


 /*var formData = new FormData();

    formData.append('appendedFile2', new Blob(['style']), 'style.css');

	$.ajax({
					  //url: "https://virtserver.swaggerhub.com/OlympiadPreparation/PetstorePersonal/1.0.0/pet/findByStatus?status=available",
					  url:"https://dev.api.hubble-docs.com/api/documents/upload",
					  data:formData,//{	  "password": "passw0rd",	  "email": "test2@gmail.com"    },
					  method:"POST",
					  success: function(data){  
						  var result = data; 
						console.log(data);
					
					  },
					  error:function(data){console.log(data); console.log('Error!');},
						headers:{'accept': 'application/json','Content-Type': 'multipart/form-data'}
					});
*/
var accessToken = "2:KHZNR_wEgzi9VhCXkViX";
var url_ = "https://mail.google.com/mail/u/0/?ui=2&ik=cc70db4d9b&view=att&th=162bda6c7e174c95&attid=0.1&disp=safe&realattid=f_jfxk8rii0&zw";

var url_="https://mail-attachment.googleusercontent.com/attachment/u/0/?ui=2&ik=cc70db4d9b&view=att&th=1628c4fd144fbb6b&attid=0.1&disp=inline&realattid=f_jfjvdq770&safe=1&zw&saddbat=ANGjdJ_KrZfKTbAlb08JrrbdHNkuZmIyltia80zHHqdWMa2grJT0LkPQ786YqEZHREiOZdfMHgLxGR3bB2IZQnLb4S4pSQZ4Jzopiw4L_33CJ3y3K1X4xdlf1lUvJmPDiX693N5_5IcCV_yr3s1MCh586HQNRnvpOwm-yar6hzOVvAoTEaJdIkVKBReoZPIM1XRRB_EsCNnAYYKNbEdv3xSSIqfCZbFDxhhDBdodXBwM1gHDOnwm3JmqJb-reAZm_jUp6C-i29vu9Mqpq2RoOL3-MTfmXXbvosyEioAhzYxsKqG-XpfkZOcwRJ0yL4ufn92pvgX2er6IWeSwQK1KxZGsBemnA5txbvknhvVZzLgMCDwOcwa89SytyF683QXSN6X_e73PEuThHKqtbsK1BTMNQu2_Y2ehh9bnOPRYWp6kz7n-zX1Oj57DrO_ZAKjVBR8u4tXG_FHwkfWir2SK_D-4IPEQvpiS5rIqzkFFrlUlwrpTMibcIS2EBw86cHw3wQREWSNp3_vMMrY0jvBIzhURFsF8Tc9tPh64u0ll033lbiCEyhYYQru9SNfoJffw84GYdU1FS05FlLTf-jV_Rog7oI77m-Go3K6U9mEQWQ";
//var txtFile = new XMLHttpRequest();
//txtFile.open("GET", "https://dev.api.hubble-docs.com/api/test/documents", true);
//txtFile.onreadystatechange = function() {
//  if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
//    if (txtFile.status === 200) {  // Makes sure it's found the file.
//
//        
//       // lines = txtFile.responseText.split("\n"); // Will separate each line into an array
//        console.log(txtFile);
//    }
//}
//}
//            txtFile.setRequestHeader('Authorization', 'Bearer ' + accessToken);
//
//txtFile.send();


//chrome.downloads.download({url:url_},function(downloadId) {
//
//	chrome.downloads.search({query:['clinics.txt']}, function(results) {
//    //This is not returning any results
//    console.log(results);
//
//
//
//	var request = new XMLHttpRequest();
//    // POST to httpbin which returns the POST data as JSON
//    request.open('POST', 'https://dev.api.hubble-docs.com/api/test/documents', /* async = */ false);
//
//   // var formData = new FormData();
//
//   // formData.append('appendedFile2', new Blob(['bar']),'test.txt');
// var body = {
//  "file": "test.txt",
//  "name": "test",
//  "folderId": 0
//}
//    request.send(body);
//
//    console.log(request.response);
//});

var request = new XMLHttpRequest();
//    // POST to httpbin which returns the POST data as JSON
   request.open('POST', 'https://dev.api.hubble-docs.com/api/test/users/sign_in',  false);
request.onreadystatechange = function() { console.log(request);
  if (request.readyState === 4) {  // Makes sure the document is ready to parse.
    if (request.status === 200) {  // Makes sure it's found the file.

      //  allText = txtFile.responseText; 
       // lines = txtFile.responseText.split("\n"); // Will separate each line into an array
      //  console.log(request.response);
		var response = request.responseText;
		response = JSON.parse(response); console.log(response);
		var accessToken = response.accessToken; console.log(accessToken);





var formData = new FormData();

formData.append('testing', new Blob(['testing']),'testing.txt');
var txtFile = new XMLHttpRequest();
var token = accessToken.substring(accessToken.indexOf(':')+1,accessToken.length); console.log(token);
txtFile.open("POST", "https://dev.api.hubble-docs.com/api/test/documents", true);
txtFile.onreadystatechange = function() { console.log(txtFile);
  if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
    if (txtFile.status === 200) {  // Makes sure it's found the file.

        
       // lines = txtFile.responseText.split("\n"); // Will separate each line into an array
        console.log(txtFile);
    }
  }
}
console.log(accessToken);
var data={username:'test2',password:'password'};
txtFile.setRequestHeader("Content-Type", "application/json");
//txtFile.setRequestHeader("Content-Type", "application/json");

//txtFile.setRequestHeader("Content-Type", "multipart/form-data");
//txtFile.withCredentials = true;

 txtFile.setRequestHeader("Authorization", accessToken); 
           // txtFile.setRequestHeader('basic', data);
var body1 = {
			  "name": "extension3",
			  "folderId":48790995,
			  "file":{url:"http://ojhasoftsolutions.in/mamta/two.doc"}
            };
//txtFile.send(JSON.stringify(body1));
//txtFile.send(formData);














		// var upfile = new FormData();
        //upfile.append('upfile', new Blob(['bar']),'test.txt');
		//var request1 = new XMLHttpRequest();
//    // POST to httpbin which returns the POST data as JSON
   //request1.open('POST', 'https://dev.api.hubble-docs.com/documents/upload',  false);
//request1.onreadystatechange = function() { console.log(request1);
  //if (request1.readyState === 4) {  // Makes sure the document is ready to parse.
    //if (request1.status === 200) { 
	//}
  //}
//}
//request1.setRequestHeader("Accept","multipart/form-data");
//request1.setRequestHeader("Content-Type", "multipart/form-data");
  //          request1.setRequestHeader('Authorization', 'Bearer ' + accessToken);



    //request1.send(upfile);
}}}
//request.setRequestHeader("accept", "application/json");
request.setRequestHeader("Content-Type", "application/json");


 var body =  {
	 	  "email": "test2@gmail.com",
	  "password": "password"
    }
   // request.send(JSON.stringify(body));

    //console.log(request.response);
	

//});

					

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.action == "login")
	{
		var email = request.data.email;
		var password = request.data.pwd;
		var request = new XMLHttpRequest();
		request.open('POST', 'https://dev.api.hubble-docs.com/api/test/users/sign_in',  false);
		request.onreadystatechange = function() { console.log(request);
		if (request.readyState === 4) {  // Makes sure the document is ready to parse.
			if (request.status === 200) {  // Makes sure it's found the file.
     
				var response = request.responseText;
				response = JSON.parse(response); console.log(response);
				var accessToken = response.accessToken; console.log(accessToken);	
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
	}
});