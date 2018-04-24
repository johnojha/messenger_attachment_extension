'use strict';
(function() {  

var vMailApi = self.vMailApi = self.vMailApi || {};
 
 vMailApi.nodes = {
    editableNodes:[],
	input:null,
	inputs:[]
};

vMailApi.executeAppend=function(){
				console.log(vMailApi.nodes.editableNodes);
		if(vMailApi.nodes.editableNodes.length)
			for (var i = 0; i < vMailApi.nodes.editableNodes.length; i++) 
				vMailApi.triggerAppend(vMailApi.nodes.editableNodes[i],i,'innerText');		
};

vMailApi.triggerAppend= function(input,i,content){ 
		if(!input.hidden && input.style.display!='none')
		 {
			var genId='';
			var descId ='';
			if(input.id)
			 {
				genId = 'attchc_'+input.id;
			 }
			 else
			 {
				input.id= 'attchc'+i;
				genId = 'attchc_ext'+i;
			 }
			console.log(genId); console.log(document.getElementById(genId));
			if(!document.getElementById(genId) || document.getElementById(genId)=='undefined')
			{
				//var inputParentNode = input.parentNode; 
				var button = document.createElement('div');
				button.className ='attchc';
				button.style.opacity='999999999';			
				
				button.id = genId; 
				button.innerHTML ='Transfer';
				input.insertBefore(button, input.firstChild);

				button.addEventListener("click",function(){ 
					
					
					console.log("Sending message to background script...");
					var overlay = document.createElement('div');
					overlay.id="overlay";
					overlay.style.border="2px solid";

					var innerElements = "<div id='inputform' style='margin:20px;'><label>Login to swagger : </label><br><br><label id='em'>Email : </label><label id='pw'>Password : </label><button id='_login' style='margin-top:10px;margin-left:155px;'>login</button></div>";
					overlay.innerHTML = innerElements;

					var email = document.createElement("input");
					email.type='email';
					email.id = "_email";
					email.style.marginTop='';
					var password = document.createElement("input");
					password.type='password';
					password.id = "_password";
					document.body.appendChild(overlay);
					document.getElementById('em').appendChild(email);
					document.getElementById('pw').appendChild(password);


                   document.getElementById("_login").addEventListener("click",function(){ 
				     console.log(document.getElementById("_email"));
					   var emailid = document.getElementById("_email").value;
					   var pwdid = document.getElementById("_password").value;

					   console.log(emailid+'----'+pwdid);
					   var credentials ={email:emailid,pwd:pwdid};
					   chrome.runtime.sendMessage({action: "login",data:credentials},function(response){ 
						   //if(response.download)
							 //  {
									overlay.style.display="none";
									var downloadurl = input.querySelectorAll('span[download_url]'); 
									console.log(downloadurl[0].getAttribute("download_url"));
									downloadurl=downloadurl[0].getAttribute("download_url");
                                   
									var propUrl = downloadurl.substring(downloadurl.indexOf("https"),downloadurl.length);
									console.log(propUrl);
									
									chrome.runtime.sendMessage({action: "getfile",file:propUrl}, function(response) {
									 // console.log(response.farewell);
									});

						   
						   
						      // }
							   });

				   });
					
					
				});
				/*var span = document.createElement('span');
				span.style.maxWidth='200px';
				span.style.padding = '5px';
				span.style.display='inline-block';
				span.style.wordWrap='break-word';
				span.style.marginTop='10px';
				span.id='desc'+genId;
				button.parentNode.insertBefore(span, button.nextSibling); 
				document.querySelector('#'+genId).addEventListener("click", function() {
					var id = this.id;
					var splitId = id.substr(id.indexOf('extbtn')+7,id.length); console.log(splitId); 
					var txtArea= document.querySelector("#"+splitId);
					if(content=='value')
					{
						var data = {"text":'"'+txtArea.value+'"'};
					}
					else
					{
						 console.log("submiting..."+txtArea.innerHTML);
						var data = {"text":'"'+txtArea.innerHTML+'"'};
					}*/

                   var data = {"email": "test2@gmail.com","password": "password"};
				   $.ajax({
					  url: "https://virtserver.swaggerhub.com/OlympiadPreparation/OlympiadPreparation1/1.0.0/user/user1",
					 // data:data,
					  success: function(data){  
						  var result = data; 
						console.log(result);
					
					  },
					  error:function(data){console.log(data); console.log('Error!');},
						headers:{'Accept': 'application/json'}
					});	
				//}, false);
			}
			
		 }
};

vMailApi.init = function(){ 
	//	var parentDiv = document.getElementsByClassName("nH bkK nn");
	//	console.log(parentDiv);

	//var itemslist =document.getElementsByClassName("hq gt a10");

		//console.log(itemslist);
	document.addEventListener("click",function(event){

		console.log(event);	
	var itemslist =document.getElementsByClassName("hq gt a10");

	console.log(itemslist);
	vMailApi.nodes.editableNodes = itemslist; 

	vMailApi.executeAppend();
	});
	
  
	//	if(document.querySelectorAll(".hq.gt.a10").length)
	//	{
	//		console.log("%%%%%%%%%%%%%%%%%%%%%%%5");
	//		console.log(vMailApi.nodes.editableNodes);
	//	}
	//		vMailApi.nodes.editableNodes = document.querySelectorAll(".hq.gt.a10"); 
	//		vMailApi.executeAppend();
};

vMailApi.init(); 

})();


