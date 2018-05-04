'use strict';
(function() {  

	/**
 * Hover balloon on elements without css and images.
 *
 * Copyright (c) 2011 Hayato Takenaka
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 * @author: Hayato Takenaka (https://urin.github.io)
 * @version: 1.1.2 - 2017/04/30
**/
(function($) {
  //-----------------------------------------------------------------------------
  // Private
  //-----------------------------------------------------------------------------
  // Helper for meta programming
  const Meta = {
    pos: $.extend(['top', 'bottom', 'left', 'right'], {camel: ['Top', 'Bottom', 'Left', 'Right']}),
    size: $.extend(['height', 'width'], {camel: ['Height', 'Width']}),
    getRelativeNames: function(position) {
      const idx = {
        pos: {
          o: position,                                           // origin
          f: (position % 2 === 0) ? position + 1 : position - 1, // faced
          p1: (position % 2 === 0) ? position : position - 1,
          p2: (position % 2 === 0) ? position + 1 : position,
          c1: (position < 2) ? 2 : 0,
          c2: (position < 2) ? 3 : 1
        },
        size: {
          p: (position < 2) ? 0 : 1, // parallel
          c: (position < 2) ? 1 : 0  // cross
        }
      };
      const names = {};
      for(var m1 in idx) {
        if(!names[m1]) { names[m1] = {}; }
        for(var m2 in idx[m1]) {
          names[m1][m2] = Meta[m1][idx[m1][m2]];
          if(!names.camel) { names.camel = {}; }
          if(!names.camel[m1]) { names.camel[m1] = {}; }
          names.camel[m1][m2] = Meta[m1].camel[idx[m1][m2]];
        }
      }
      names.isTopLeft = (names.pos.o === names.pos.p1);
      return names;
    }
  };

  // Helper class to handle position and size as numerical pixels.
  function NumericalBoxElement() { this.initialize.apply(this, arguments); }
  (function() {
    // Method factories
    const Methods = {
      setBorder: function(pos, isVertical) {
        return function(value) {
          this.$.css('border-' + pos.toLowerCase() + '-width', value + 'px');
          this['border' + pos] = value;
          return (this.isActive) ? digitalize(this, isVertical) : this;
        }
      },
      setPosition: function(pos, isVertical) {
        return function(value) {
          this.$.css(pos.toLowerCase(), value + 'px');
          this[pos.toLowerCase()] = value;
          return (this.isActive) ? digitalize(this, isVertical) : this;
        }
      }
    };

    NumericalBoxElement.prototype = {
      initialize: function($element) {
        this.$ = $element;
        $.extend(true, this, this.$.offset(), {center: {}, inner: {center: {}}});
        for(var i = 0; i < Meta.pos.length; i++) {
          this['border' + Meta.pos.camel[i]] = parseInt(this.$.css('border-' + Meta.pos[i] + '-width')) || 0;
        }
        this.active();
      },
      active: function() { this.isActive = true; digitalize(this); return this; },
      inactive: function() { this.isActive = false; return this; }
    };
    for(var i = 0; i < Meta.pos.length; i++) {
      NumericalBoxElement.prototype['setBorder' + Meta.pos.camel[i]] = Methods.setBorder(Meta.pos.camel[i], (i < 2));
      if(i % 2 === 0) {
        NumericalBoxElement.prototype['set' + Meta.pos.camel[i]] = Methods.setPosition(Meta.pos.camel[i], (i < 2));
      }
    }

    function digitalize(box, isVertical) {
      if(isVertical == null) { digitalize(box, true); return digitalize(box, false); }
      const m = Meta.getRelativeNames((isVertical) ? 0 : 2);
      box[m.size.p] = box.$['outer' + m.camel.size.p]();
      box[m.pos.f] = box[m.pos.o] + box[m.size.p];
      box.center[m.pos.o] = box[m.pos.o] + box[m.size.p] / 2;
      box.inner[m.pos.o] = box[m.pos.o] + box['border' + m.camel.pos.o];
      box.inner[m.size.p] = box.$['inner' + m.camel.size.p]();
      box.inner[m.pos.f] = box.inner[m.pos.o] + box.inner[m.size.p];
      box.inner.center[m.pos.o] = box.inner[m.pos.f] + box.inner[m.size.p] / 2;
      return box;
    }
  })();

  // Adjust position of balloon body
  function makeupBalloon($target, $balloon, options) {
    $balloon.stop(true, true);
    var outerTip, innerTip;
    const initTipStyle = {position: 'absolute', height: '0', width: '0', border: 'solid 0 transparent'},
      target = new NumericalBoxElement($target),
      balloon = new NumericalBoxElement($balloon);
    const balloonTop = -options.offsetY
      + ((options.position && options.position.indexOf('top') >= 0) ? target.top - balloon.height
      : ((options.position && options.position.indexOf('bottom') >= 0) ? target.bottom
      : target.center.top - balloon.height / 2));
    const balloonLeft = options.offsetX
      + ((options.position && options.position.indexOf('left') >= 0) ? target.left - balloon.width
      : ((options.position && options.position.indexOf('right') >= 0) ? target.right
      : target.center.left - balloon.width / 2));
    balloon.setTop(balloonTop < 0 ? 0 : balloonTop);
    balloon.setLeft(balloonLeft < 0 ? 0 : balloonLeft);
    if(options.tipSize > 0) {
      // Add hidden balloon tips into balloon body.
      if($balloon.data('outerTip')) { $balloon.data('outerTip').remove(); $balloon.removeData('outerTip'); }
      if($balloon.data('innerTip')) { $balloon.data('innerTip').remove(); $balloon.removeData('innerTip'); }
      outerTip = new NumericalBoxElement($('<div>').css(initTipStyle).appendTo($balloon));
      innerTip = new NumericalBoxElement($('<div>').css(initTipStyle).appendTo($balloon));
      // Make tip triangle, adjust position of tips.
      var m;
      for(var i = 0; i < Meta.pos.length; i++) {
        m = Meta.getRelativeNames(i);
        if(balloon.center[m.pos.c1] >= target[m.pos.c1] &&
          balloon.center[m.pos.c1] <= target[m.pos.c2]) {
          if(i % 2 === 0) {
            if(balloon[m.pos.o] >= target[m.pos.o] && balloon[m.pos.f] >= target[m.pos.f]) { break; }
          } else {
            if(balloon[m.pos.o] <= target[m.pos.o] && balloon[m.pos.f] <= target[m.pos.f]) { break; }
          }
        }
        m = null;
      }
      if(m) {
        balloon['set' + m.camel.pos.p1](
          balloon[m.pos.p1] + ((m.isTopLeft) ? 1 : -1) * (options.tipSize - balloon['border' + m.camel.pos.o])
        );
        makeTip(
          balloon, outerTip, m, options.tipSize,
          $balloon.css('border-' + m.pos.o + '-color'),
          options.tipPosition
        );
        makeTip(
          balloon, innerTip, m, options.tipSize - 2 * balloon['border' + m.camel.pos.o],
          $balloon.css('background-color'),
          options.tipPosition
        );
        $balloon.data('outerTip', outerTip.$).data('innerTip', innerTip.$);
      } else {
        $.each([outerTip.$, innerTip.$], function() { this.remove(); });
      }
    }
    // Make up balloon tip.
    function makeTip(balloon, tip, m, tipSize, color, pos) {
      const len = Math.round(tipSize / 1.7320508);
      tip.inactive()
        ['setBorder' + m.camel.pos.f](tipSize)
        ['setBorder' + m.camel.pos.c1](len)
        ['setBorder' + m.camel.pos.c2](len)
        ['set' + m.camel.pos.p1]((m.isTopLeft) ? -tipSize : balloon.inner[m.size.p])
        ['set' + m.camel.pos.c1](balloon.inner[m.size.c] / pos - len)
        .active()
        .$.css('border-' + m.pos.f + '-color', color);
    }
  }

  // True if the event comes from the target or balloon.
  function isValidTargetEvent($target, e) {
    const b = $target.data('balloon') && $target.data('balloon').get(0);
    return !(b && (b === e.relatedTarget || $.contains(b, e.relatedTarget)));
  }

  // Assign plain text or HTML to the balloon's body
  function assignContents($balloon, options, contents) {
    if(options.html) {
      $balloon.empty().append(contents);
    } else {
      $balloon.text(contents);
    }
  }

  // Actions common to the `options.url` and `options.ajax`
  // callbacks on successful completion of the AJAX request
  function onAjaxContents($target, $balloon, options) {
    $balloon.data('ajaxDisabled', true);
    if(options.ajaxContentsMaxAge >= 0) {
      setTimeout(
        function() { $balloon.data('ajaxDisabled', false); },
        options.ajaxContentsMaxAge
      );
    }
    makeupBalloon($target, $balloon, options);
  }

  //-----------------------------------------------------------------------------
  // Public
  //-----------------------------------------------------------------------------
  $.fn.balloon = function(options) {
    return this.one('mouseenter', function first(e) {
      const $target = $(this), t = this
      const $balloon = $target.on('mouseenter', function(e) {
        isValidTargetEvent($target, e) && $target.showBalloon();
      }).off('mouseenter', first).showBalloon(options).data('balloon');
      if($balloon) {
        $balloon.on('mouseleave', function(e) {
          if(t === e.relatedTarget || $.contains(t, e.relatedTarget)) { return; }
          $target.hideBalloon();
        }).on('mouseenter', function(e) {
          if(t === e.relatedTarget || $.contains(t, e.relatedTarget)) { return; }
          $balloon.stop(true, true);
          $target.showBalloon();
        });
      }
    }).on('mouseleave', function(e) {
      const $target = $(this);
      isValidTargetEvent($target, e) && $target.hideBalloon();
    });
  };

  $.fn.showBalloon = function(options) {
    var optionsOld = this.data('options') ? this.data('options') : options || {};
    if(options || !this.data('options')) {
      if($.balloon.defaults.css === null) { $.balloon.defaults.css = {}; }
      this.data('options', $.extend(true, {}, $.balloon.defaults, options || {}));
    }
    options = this.data('options');
    return this.each(function() {
      var target = this, $target = $(target);
      var isNew = !$target.data('balloon');
      var $balloon = $target.data('balloon') || $('<div>');
      if(!isNew && $balloon.data('active')) { return; }
      $balloon.data('active', true);
      clearTimeout($balloon.data('minLifetime'));
      const contents = $.isFunction(options.contents) ? options.contents.call(target)
        : (options.contents || $target.attr('title') || $target.attr('alt'));
      $target.removeAttr('title');
      var ajax = $.isFunction(options.ajax) || options.url;
      if(!ajax && contents === '' || contents == null) { return; }
      if(!$.isFunction(options.contents)) { options.contents = contents; }
      if(!ajax) {
        assignContents($balloon, options, contents);
      } else if(!$balloon.data('ajaxDisabled')) {
        if(contents !== '' && contents != null) {
          assignContents($balloon, options, contents)
        }
        clearTimeout($balloon.data('ajaxDelay'));
        if(options.url) {
          ajax = function() {
            $balloon.load(
              $.isFunction(options.url) ? options.url.call(target) : options.url,
              function(res, sts, xhr) {
                if(options.ajaxComplete) { options.ajaxComplete.call(target, res, sts, xhr); }
                if(sts === 'success' || sts === 'notmodified') {
                  onAjaxContents($target, $balloon, options);
                }
              }
            );
          }
        } else {
          ajax = function() {
            var called = false;
            function done(error, contents) {
              if(!called) {
                called = true;
                if(error) { return; }
                assignContents($balloon, options, contents);
                onAjaxContents($target, $balloon, options);
              }
            }
            const promise = options.ajax.call(target, done);
            if(promise && $.isFunction(promise.then)) {
              promise.then(
                function (contents) { done(null, contents); },
                function (error) { done(error); }
              );
            }
          };
        }
        $balloon.data('ajaxDelay', setTimeout(ajax, options.ajaxDelay));
      }

      $balloon.css(options.css || {})
        .removeClass(optionsOld.classname)
        .addClass(options.classname);
      if(isNew) {
        $balloon.css({ visibility: 'hidden', position: 'absolute' }).appendTo('body');
        $target.data('balloon', $balloon);
        makeupBalloon($target, $balloon, options);
        $balloon.hide().css('visibility', 'visible');
      } else {
        makeupBalloon($target, $balloon, options);
      }
      $balloon.data('delay', setTimeout(function() {
        if(options.showAnimation) {
          options.showAnimation.apply(
            $balloon.stop(true, true), [
              options.showDuration, function() {
                options.showComplete && options.showComplete.apply($balloon);
              }
            ]
          );
        } else {
          $balloon.show(options.showDuration, function() {
            if(this.style.removeAttribute) { this.style.removeAttribute('filter'); }
            options.showComplete && options.showComplete.apply($balloon);
          });
        }
        if(options.maxLifetime) {
          clearTimeout($balloon.data('maxLifetime'));
          $balloon.data('maxLifetime',
            setTimeout(function() { $target.hideBalloon(); }, options.maxLifetime)
          );
        }
      }, options.delay));
    });
  };

  $.fn.hideBalloon = function() {
    const options = this.data('options');
    if(!this.data('balloon')) { return this; }
    return this.each(function() {
      const $target = $(this), $balloon = $target.data('balloon');
      clearTimeout($balloon.data('delay'));
      clearTimeout($balloon.data('minLifetime'));
      clearTimeout($balloon.data('ajaxDelay'));
      $balloon.data('minLifetime', setTimeout(function() {
        if(options.hideAnimation) {
          options.hideAnimation.apply(
            $balloon.stop(true, true),
            [
              options.hideDuration,
              function(d) {
                $(this).data('active', false);
                options.hideComplete && options.hideComplete(d);
              }
            ]
          );
        } else {
          $balloon.stop(true, true).hide(
            options.hideDuration,
            function(d) {
              $(this).data('active', false);
              options.hideComplete && options.hideComplete(d);
            }
          );
        }
      },
      options.minLifetime));
    });
  };

  $.balloon = {
    defaults: {
      contents: null, html: false, classname: null,
      url: null, ajax: null, ajaxComplete: null, ajaxDelay: 500, ajaxContentsMaxAge: -1,
      delay: 0, minLifetime: 200, maxLifetime: 0,
      position: 'top', offsetX: 0, offsetY: 0, tipSize: 8, tipPosition: 2,
      showDuration: 100, showAnimation: null,
      hideDuration:  80, hideAnimation: function(d, c) { this.fadeOut(d, c); },
      showComplete: null, hideComplete: null,
      css: {
        fontSize       : '.7rem',
        minWidth       : '.7rem',
        padding        : '.2rem .5rem',
        border         : '1px solid rgba(212, 212, 212, .4)',
        borderRadius   : '3px',
        boxShadow      : '2px 2px 4px #555',
        color          : '#eee',
        backgroundColor: '#111',
        opacity        : 0.85,
        zIndex         : '32767',
        textAlign      : 'left'
      }
    }
  };
})(jQuery);


var vMailApi = self.vMailApi = self.vMailApi || {};
 
 vMailApi.nodes = {
    editableNodes:[],
	input:null,
	inputs:[],
	flag:false
};

vMailApi.executeAppend=function(target){ console.log('***********************8'+ vMailApi.nodes.flag); 
				if(vMailApi.nodes.flag)
					return;
				

				var parentDiv = target.getElementsByClassName('aQw'); console.log(parentDiv);
				parentDiv = parentDiv[0];
				  for (var i = 0; parentDiv && parentDiv.childNodes[i]; i++) {
						if (parentDiv.childNodes[i].id === "hubblebtn") {
							return false;
						}
				  }
			
									
				var iconbtn= document.createElement('div');
				iconbtn.id='hubblebtn';
                iconbtn.className="T-I J-J5-Ji aQv T-I-ax7 L3";
				//iconbtn.role="button";
				iconbtn.setAttribute('role', 'button');
				iconbtn.setAttribute('disabled', 'false');

				//iconbtn.title="save to Hubble";
				iconbtn.dataTooltipClass = 'a1V';
				iconbtn.style="user-select: none;margin-top:8px;";
				//iconbtn.dataTooltip = "save to Hubble";
				iconbtn.setAttribute('data-tooltip', 'save to Hubble')
               
                parentDiv.appendChild(iconbtn);

				var btnImg= document.createElement('img');
				btnImg.style="width:13px;height:13px;margin-top:7px;";				btnImg.src="data:image/png;base64,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" ;
                iconbtn.appendChild(btnImg);

				var balloonDiv = document.createElement('span');
				balloonDiv.id="myPopup";
				balloonDiv.className="popuptext";


				balloonDiv.innerHTML = 'Transferring...  <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a>';
				//target.appendChild(balloonDiv);
			
				var shown = true;

				var token='';
				chrome.storage.sync.get(['swaggerToken'], function(items) {
				  console.log(items);
				  token = items.swaggerToken;
				});

				$('#hubblebtn').click(function() { 
					//$('#hubblebtn').balloon({ html: true,position: "right", css:{backgroundColor: '#C0C0C0'} ,minLifetime: 2000,contents: '<p><div id="statushub">Transferring...  </div><a href="https://dev.app.hubble-docs.com/my-folder">Organize</a></p>'});
                       vMailApi.triggerTransfer(target,token);
				    
					//shown ? $(this).hideBalloon() : $(this).showBalloon();
					//shown = !shown;
				});


				/*iconbtn.addEventListener("click",function(){ console.log('aaaa'); //var popup = document.getElementById("myPopup"); console.log(popup);
				//popup.style.visibility ='visible';
				     
				             $('#hubblebtn').balloon({ html: true, contents: '<p>Transferring...  <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a></p>' });

					});*/
					

};


vMailApi.triggerTransfer= function(input,token){ 
	//$('#hubblebtn').unbind('click');
 //chrome.runtime.sendMessage({action: "login",data:credentials},function(response){ 
							   //if(response.download)
								 //  {
										//var downloadurl = input.querySelectorAll('span[download_url]'); 
										//console.log(downloadurl[0].getAttribute("download_url"));
										var downloadurl=input.getAttribute("download_url");
									   
										var propUrl = downloadurl.substring(downloadurl.indexOf("https"),downloadurl.length);
										console.log(propUrl);

										var propName = downloadurl.split(':')[1];

										//var fileName = document.querySelector('.aV3.a6U')[0].innerHTML;
										console.log(propName);
										if(downloadurl.split(':')[0]=='application/msword')
										{
													console.log('MSWORD');
												
												//chrome.runtime.sendMessage({action: "getfile",file:propUrl,name:propName}, function(response) {
												 // console.log(response.farewell);
												//});
										}
										else
										{
										   alert('Can transfer only word documents.');
										   return false;
										}

							   
							   
								  // }
								   //});


								   var fileCode=propName;//.substring(fileName.lastIndexOf('\\')+1,fileName.length);

	     var txtFile = new XMLHttpRequest();

	     // chrome.storage.local.get(['swaggerToken'], function(result) { 
		 // console.log(result);
          console.log('Value currently is ' + token);

		  txtFile.open("POST", "https://dev.api.hubble-docs.com/api/test/documents", true);
		  //	txtFile.open("POST", "http://localhost:3000/api/test/documents", true);
				//$('#hubblebtn').showBalloon();
		vMailApi.nodes.flag=true;

		  $('#hubblebtn').showBalloon({ html: true,position: "right", css:{backgroundColor: '#C0C0C0',width:'200px',color:'black',height:'20px'},minLifetime: 2000 ,contents: '<div id="statushub" style="font-weight:bold;font-size:12px;text-align:center;">Saving to MyFolder... <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a></div>'});
	      txtFile.onreadystatechange = function() { 
		  if (txtFile.readyState === 4) {  
			if (txtFile.status === 200) 
			{ 			
				console.log(txtFile);
				$('#statushub').html('Added to MyFolder.  <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a>');
				$('#hubblebtn').hideBalloon();
                vMailApi.nodes.flag=false;
				console.log(vMailApi.nodes.flag);

				//$(this).hideBalloon()
			}
		  }
		}
	//console.log(tokenStorage);
	//txtFile.setRequestHeader("Content-Type", "multipart/form-data");
	txtFile.setRequestHeader("Authorization",token); 

	var formData = new FormData();
  
	//var file = "http://ojhasoftsolutions.in/mamta/testdoc.docx";

    //*********************************************8

     var blob = null;
	var xhr = new XMLHttpRequest(); 
	xhr.open("GET", propUrl); 
	xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
	xhr.onload = function() 
	{
		blob = xhr.response;//xhr.response is now a blob object
		console.log(blob);
		
		formData.append('file', blob ,propName );
		formData.append('name', propName);
		formData.append('folderId',-1);
		console.log(formData);
		txtFile.send(formData);

	}
	xhr.send();
      //  });
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
	

};

vMailApi.triggerAppend= function(input,i,content){ 
		if(!input.hidden && input.style.display!='none')
		 { console.log(input);
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
             
			    var parentDiv = document.getElementsByClassName('aQw');
				parentDiv = parentDiv[0];


				//<div id=":4b" class="T-I J-J5-Ji aQv T-I-ax7 L3" role="button" tabindex="0" aria-label="save to Hubble" data-tooltip-class="a1V" style="user-select: none;margin-top:8px;" data-tooltip="save to hubble"><div class="style=height:13px;width:13px;background:no-repeat url(https://dev.app.hubble-docs.com/favicon.ico) -41px 0;"></div></div>


				var iconbtn= document.createElement('div');
				iconbtn.id='hubblebtn';
                iconbtn.className="T-I J-J5-Ji aQv T-I-ax7 L3";
				//iconbtn.role="button";
				iconbtn.setAttribute('role', 'button')

				//iconbtn.title="save to Hubble";
				iconbtn.dataTooltipClass = 'a1V';
				iconbtn.style="user-select: none;margin-top:8px;";
				//iconbtn.dataTooltip = "save to Hubble";
				iconbtn.setAttribute('data-tooltip', 'save to Hubble')
               
                parentDiv.appendChild(iconbtn);

				var btnImg= document.createElement('img');
				btnImg.style="width:13px;height:13px;margin-top:7px;";				btnImg.src="data:image/png;base64,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" ;
                iconbtn.appendChild(btnImg);

				var balloonDiv = document.createElement('SPAN');
				balloonDiv.id="myPopup";
				balloonDiv.className="popuptext";


				balloonDiv.innerHTML = 'Transferring...  <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a>';
				                iconbtn.appendChild(balloonDiv);




iconbtn.addEventListener("click",function(){ console.log('aaaa'); var popup = document.getElementById("myPopup");
    popup.classList.toggle("show"); });


				button.addEventListener("click",function(){ 
					
					
					console.log("Sending message to background script...");
					if(!document.getElementById('overlay'))
					{
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

										var propName = downloadurl.split(':')[1];

										//var fileName = document.querySelector('.aV3.a6U')[0].innerHTML;
										console.log(propName);
										if(downloadurl.split(':')[0]=='application/msword')
							   {
										
										chrome.runtime.sendMessage({action: "getfile",file:propUrl,name:propName}, function(response) {
										 // console.log(response.farewell);
										});
							   }
							   else
								   alert('Can transfer only word documents.');

							   
							   
								  // }
								   });

					   });
				   }
					
					
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
	//var itemslist =document.getElementsByClassName("hq gt a10");

	var observer = new MutationObserver(function(mutations) {
	 for (var i = mutations.length - 1; i >= 0; i--) {
	  var m = mutations[i]; //console.log(m);
	  if (m.type == 'attributes') {
		    if(m.attributeName=="class")
		  {
				if(m.target.className=='aZo N5jrZb aZp')
			  {
				console.log(m.target.className);
                console.log('The ' + m.attributeName + ' attribute was modified.');
				vMailApi.executeAppend(m.target);
			  }
		  }
        }
		//var nodes = m.addedNodes;
		/*for (var j = nodes.length - 1; j >= 0; j--) {
			var n = nodes[j]; //console.log(n); console.log(n.className);
			if (n.className == "aZo N5jrZb") { console.log()
			//var itemslist =document.getElementsByClassName("hq gt a10");
				var parentDiv = document.getElementsByClassName('aQw');

				console.log(parentDiv);
				//vMailApi.nodes.editableNodes = itemslist; 

				//vMailApi.executeAppend();
		   }
		 }*/
	 }
	});
	observer.observe(document.body, {childList: true, subtree:true, attributes:true});

		/*//	var parentDiv = document.getElementsByClassName("nH bkK nn");
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
		
		var itemslist =document.getElementsByClassName("hq gt a10");

		console.log(itemslist);
		vMailApi.nodes.editableNodes = itemslist; */

		//vMailApi.executeAppend();
	  
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


