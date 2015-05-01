(function(window, undefined) {
  if (window.CIMpleHostedForms) {
    return;
  }

  var CIMpleHostedForms = {};
  var listeners = {};

  function mergeObjects(options, defaults){
    var mergedObjects = defaults;

    for(var key in options) {
      if (options.hasOwnProperty(key)) {
        if (options[key] !== undefined) {
            mergedObjects[key] = options[key];
        }
      }
    }
    return mergedObjects;
  }

  function parseURLParams(string){
    var paramsAsObject = {};
    var splitParams = string.split('&');
    var temp;
    for (var i = 0; i < splitParams.length; i++) {
      temp = splitParams[i].split('=');
      paramsAsObject[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    return paramsAsObject;
  }

  function broadcast(eventName, data) {
    if(!listeners[eventName]) {
      return; 
    }
    
    for(var i = 0; i < listeners[eventName].length; i++) {
      listeners[eventName][i](data);
    } 
  }

  function createInputIfNeeded(name, value, form){
    if(value){
      var containerElement = document.createElement("div");
      containerElement.innerHTML = "<input name='"+name+"' value='"+value+"' />";
      form.appendChild(containerElement);
    }
  }
  
  // Known events: resizeWindow, cancel, successfulSave
  // resizeWindow returns width & height in addition to action
  CIMpleHostedForms.listen = function(eventName, handler) {
      if (typeof listeners[eventName] === 'undefined') {
          listeners[eventName] = [];
      }
      listeners[eventName].push(handler);
  };

  CIMpleHostedForms.unlisten = function(eventName, handler) {
    if (!listeners[eventName]) {
      return; 
    }
    for (var i = 0; i < listeners[eventName].length; i++) {
      if (listeners[eventName][i] === handler) {
        listeners[eventName].splice(i, 1);
        break; 
      }
    }
  };

  CIMpleHostedForms.receiveMessage = function(message){
    var data = parseURLParams(message);
    broadcast(data.action, data);
  };

  CIMpleHostedForms.hosted_form = function(path, options, callback) {
    var defaultOptions = {
      testEnv: true,
      selector: '#cimple-hosted-form',
      paymentProfileId: null,
      token: null,
      shippingAddressId: null
    };
    var formURL;
    var containerElement;

    // get relative path
    path = path.match(/^\/?(.+)/)[1];

    options = mergeObjects(options, defaultOptions);

    if(options.testEnv){
      formURL = 'https://test.authorize.net/'+path;
    }else{
      formURL = 'https://secure.authorize.net/'+path;
    }

    containerElement = document.querySelector(options.selector);

    containerElement.innerHTML = "<iframe name='cim-hosted-form-iframe' id='cim-hosted-form-iframe' frameborder='0' scrolling='no' src='/contentx/empty.html'></iframe>";

    var form = document.createElement("form");
    form.action = formURL;
    form.method = "POST";
    form.target = "cim-hosted-form-iframe";

    createInputIfNeeded('PaymentProfileId', options.paymentProfileId, form);

    createInputIfNeeded('ShippingAddressId', options.shippingAddressId, form);

    createInputIfNeeded('Token', options.token, form);
    
    document.body.appendChild(form);

    form.submit();

    document.body.removeChild(form);

    if(callback){
      callback();
    }
  };

  window.CIMpleHostedForms = CIMpleHostedForms;
})(window);
