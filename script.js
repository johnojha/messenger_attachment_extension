'use strict';
(function() {  

	
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

vMailApi.executeAppend=function(target){
				if(vMailApi.nodes.flag)
					return;
				

				var parentDiv = target.getElementsByClassName('aQw'); console.log(parentDiv);
				parentDiv = parentDiv[0];
				  for (var i = 0; parentDiv && parentDiv.childNodes[i]; i++) {
						if (parentDiv.childNodes[i].id === "hubblebtn") {
							return false;
						}
				  }
			
			    var pchnod = parentDiv.childNodes;
									
				var iconbtn= document.createElement('div');
				iconbtn.id='hubblebtn';
                iconbtn.className="T-I J-J5-Ji aQv T-I-ax7 L3";
				iconbtn.setAttribute('role', 'button');
				iconbtn.setAttribute('disabled', 'false');

				iconbtn.dataTooltipClass = 'a1V';
				if(pchnod.length>3)
					iconbtn.style="user-select: none;margin-top:8px;";
				else
					iconbtn.style="user-select: none;margin-top:0px;";

				iconbtn.setAttribute('data-tooltip', 'save to Hubble')
               
                parentDiv.appendChild(iconbtn);

				var btnImg= document.createElement('img');
				btnImg.style="width: 23px; height: 23px; margin-top: 0px;";				btnImg.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAE7UlEQVR4nO3d0W7bOBBA0fFi//+XvQ+tAyfrTGJbFGfIc14KtIiiIrwmKTvS5Xq9BvDYP7NPACoTCCQEAgmBQEIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkPh39gnQzquPA7gcehYnEQi/ccQzMu6P0SYWgZAZ9fCY23HLh2IPwnfOeLJS+ac3mUH46uxBW3o2MYNwb+YresnZRCDcVBigFc7hE4EQUWtgVjoXgVBrQP5V5pwEAgmB7K3MK/UDJc5NIPsqMQB/MP0cBQIJgexp+ivzE6aeq0AgIRBICGQ/nZZXN9POWSCQEAgkBAIJgUBCIJAQyF46XsGaSiB7KflrrZUJBBICgYRAICGQvdikP8l9sfYgjBcJZG3CeJNA1rRaGNMuTwtkLauFMZ1A1iCMQVzF6m/1OKa++28G6Wv1MEoQSD87hTH9s2MC6WOnMCIKxBEhkA52C6MUgdQ1Ooz7V+hqEZaYPSIEUtGZYdz/XZVIysQRIZBKZoTx9d9nR1Iqjgjvg1QxcmBe4vcDb+YALRdHhBlkttFhvPN1Z80mJcO4EcgcFcN4dJzZy77pBHKubgNu1GxSPowbgZyjWxjZ8V/9v7SJ4p5AxuoeRpXvOY1AxlgxjC0J5HgdNuD8kkCOI4wFCeR9wliYQF4njA0I5Hk24BsRyO8JY0MC+ZkwNiaQ7wkDgXzDBpyIEMhXwuCTToE8O3ifGZDC4KHqgbwzcO+/9rtBap9BqnIgRw7ea5x7Fw9hLKJqICMG8Bm/QiqMxVQLZPZdNV4ljEVVC6QbYSyuUiCdZg9hbKJKIF3iEMZmKgTSIQ5hbMqdFX8mjo1VmEGqEgbTA6m4vBIGH2YHUokw+B97kD/EwUMCgYRAICEQSAgEEgKBhEAgIRBICOSPa9R8V5/JBPKZUPhkdiBV38EWChExP5DqRLI5gfzMbLKxCoFUXWZ9JZQNVQgkok8kEULZSpVAInpFEiGULVQKpCuhLKxaIJcYO5OMPLZQFlQtkJsRA/ly96dQ+JWqgUQcO4gfHeuMUGjucr22+TmOfIDOK8d/RrcLEPzVKZCzCIUPlZdYs9if8EEgj9nIExEC+YlQNieQ3xHKpgTyHJeGNyOQ14wMxWxSiEDeI5TFCeQYQlmUQI5lI78YgRzPFa+FCGQcoSxAIOMJpTGPYDvPLZJRg/ka74c4+hPT7fg07zxVPjV81HksGYsl1jwVLg0fGemSr7QCmW/W/mTEgF4uEkusWkb/MC4nfI/779WeGaQWH4YsRiA1jQ7lDEvEKJDauofSPhKB9NA5lNaRCKSXzqG0JJCehHISgfTWJZK2yyyB9Gc2GUgg6xDKAAJZj1AOJJB1CeUAAllb281xFQKBhEDWZon1JoFAQiCQEAgkBAIJgayvwka9wjm8RCCQEAgkBLKHmUuctsurCIHsZMZAbR1HhEB2c+aAbR9HhEAg5e7u+xl9l/klZo4bM8i+RgzkpeKIEMjujhzQy8URYYnF54HtATpfCIR7yw/4Z1liQUIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkBAIJAQCCYFAQiCQ+A9M6Kbfoaj7bgAAAABJRU5ErkJggg==" ;
                iconbtn.appendChild(btnImg);

				var balloonDiv = document.createElement('span');
				balloonDiv.id="myPopup";
				balloonDiv.className="popuptext";


				balloonDiv.innerHTML = 'Transferring...  <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a>';
			
				var shown = true;

				

				$('#hubblebtn').click(function() { 
					var token='';
					chrome.storage.sync.get(['swaggerToken'], function(items) {
					  console.log(items);
					  token = items.swaggerToken;
					  if(token && token.length)
					                         vMailApi.triggerTransfer(target,token);

					  else
						{
					   alert('Please Sign In to complete the operation.');
										   return false;
						}
					});
				    
				});					

};


vMailApi.triggerTransfer= function(input,token){ 
	
										var downloadurl=input.getAttribute("download_url");
									   
										var propUrl = downloadurl.substring(downloadurl.indexOf("https"),downloadurl.length);
										console.log(propUrl);

										var propName = downloadurl.split(':')[1];

										console.log(propName);
										if(propName.split('.')[1]==('doc' || 'docx'))
										{
													console.log('MSWORD');
												
												$('#hubblebtn').showBalloon({ html: true,position: "right", css:{backgroundColor: '#C0C0C0',width:'200px',color:'black',height:'20px'},minLifetime: 2000 ,contents: '<div id="statushub" style="font-weight:bold;font-size:12px;text-align:center;">Saving to MyFolder... <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a></div>'});
												
										}
										else
										{
										   alert('Please transfer only doc/docx files.');
										   return false;
										}		   
							   


		 var fileCode=propName;//.substring(fileName.lastIndexOf('\\')+1,fileName.length);

	     var txtFile = new XMLHttpRequest();

	     console.log('Value currently is ' + token);

		  txtFile.open("POST", "https://dev.api.hubble-docs.com/api/test/documents", true);
		 		  
	      txtFile.onreadystatechange = function() { 
		  if (txtFile.readyState === 4) {  
			if (txtFile.status === 200) 
			{ 			
				console.log(txtFile);
				$('#statushub').html('Added to MyFolder.  <a href="https://dev.app.hubble-docs.com/my-folder">Organize</a>');
				$('#hubblebtn').hideBalloon();
                vMailApi.nodes.flag=false;
				console.log(vMailApi.nodes.flag);

			}
		  }
		}
	
	txtFile.setRequestHeader("Authorization",token); 

	var formData = new FormData();
  
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


				var iconbtn= document.createElement('div');
				iconbtn.id='hubblebtn';
                iconbtn.className="T-I J-J5-Ji aQv T-I-ax7 L3";
				iconbtn.setAttribute('role', 'button')

				iconbtn.dataTooltipClass = 'a1V';
				iconbtn.style="user-select: none;margin-top:8px;";
				iconbtn.setAttribute('data-tooltip', 'save to Hubble')
               
                parentDiv.appendChild(iconbtn);

				var btnImg= document.createElement('img');
				btnImg.style="width:13px;height:13px;margin-top:7px;";				btnImg.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAE7UlEQVR4nO3d0W7bOBBA0fFi//+XvQ+tAyfrTGJbFGfIc14KtIiiIrwmKTvS5Xq9BvDYP7NPACoTCCQEAgmBQEIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkPh39gnQzquPA7gcehYnEQi/ccQzMu6P0SYWgZAZ9fCY23HLh2IPwnfOeLJS+ac3mUH46uxBW3o2MYNwb+YresnZRCDcVBigFc7hE4EQUWtgVjoXgVBrQP5V5pwEAgmB7K3MK/UDJc5NIPsqMQB/MP0cBQIJgexp+ivzE6aeq0AgIRBICGQ/nZZXN9POWSCQEAgkBAIJgUBCIJAQyF46XsGaSiB7KflrrZUJBBICgYRAICGQvdikP8l9sfYgjBcJZG3CeJNA1rRaGNMuTwtkLauFMZ1A1iCMQVzF6m/1OKa++28G6Wv1MEoQSD87hTH9s2MC6WOnMCIKxBEhkA52C6MUgdQ1Ooz7V+hqEZaYPSIEUtGZYdz/XZVIysQRIZBKZoTx9d9nR1Iqjgjvg1QxcmBe4vcDb+YALRdHhBlkttFhvPN1Z80mJcO4EcgcFcN4dJzZy77pBHKubgNu1GxSPowbgZyjWxjZ8V/9v7SJ4p5AxuoeRpXvOY1AxlgxjC0J5HgdNuD8kkCOI4wFCeR9wliYQF4njA0I5Hk24BsRyO8JY0MC+ZkwNiaQ7wkDgXzDBpyIEMhXwuCTToE8O3ifGZDC4KHqgbwzcO+/9rtBap9BqnIgRw7ea5x7Fw9hLKJqICMG8Bm/QiqMxVQLZPZdNV4ljEVVC6QbYSyuUiCdZg9hbKJKIF3iEMZmKgTSIQ5hbMqdFX8mjo1VmEGqEgbTA6m4vBIGH2YHUokw+B97kD/EwUMCgYRAICEQSAgEEgKBhEAgIRBICOSPa9R8V5/JBPKZUPhkdiBV38EWChExP5DqRLI5gfzMbLKxCoFUXWZ9JZQNVQgkok8kEULZSpVAInpFEiGULVQKpCuhLKxaIJcYO5OMPLZQFlQtkJsRA/ly96dQ+JWqgUQcO4gfHeuMUGjucr22+TmOfIDOK8d/RrcLEPzVKZCzCIUPlZdYs9if8EEgj9nIExEC+YlQNieQ3xHKpgTyHJeGNyOQ14wMxWxSiEDeI5TFCeQYQlmUQI5lI78YgRzPFa+FCGQcoSxAIOMJpTGPYDvPLZJRg/ka74c4+hPT7fg07zxVPjV81HksGYsl1jwVLg0fGemSr7QCmW/W/mTEgF4uEkusWkb/MC4nfI/779WeGaQWH4YsRiA1jQ7lDEvEKJDauofSPhKB9NA5lNaRCKSXzqG0JJCehHISgfTWJZK2yyyB9Gc2GUgg6xDKAAJZj1AOJJB1CeUAAllb281xFQKBhEDWZon1JoFAQiCQEAgkBAIJgayvwka9wjm8RCCQEAgkBLKHmUuctsurCIHsZMZAbR1HhEB2c+aAbR9HhEAg5e7u+xl9l/klZo4bM8i+RgzkpeKIEMjujhzQy8URYYnF54HtATpfCIR7yw/4Z1liQUIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkBAIJAQCCYFAQiCQEAgkBAIJgUBCIJAQCCQEAgmBQEIgkBAIJAQCCYFAQiCQ+A9M6Kbfoaj7bgAAAABJRU5ErkJggg==" ;
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
		
	 }
	});
	observer.observe(document.body, {childList: true, subtree:true, attributes:true});

		
	};

vMailApi.init(); 

})();

