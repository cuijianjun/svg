/*
Bridge to native

window.native_invoke(data): invoked from native
window.native_callback(data): callback to native
*/

let target = null;

function init(t) {
  if (target) {
    // throw new Error('double call to init');
    return;
  }
  target = t;
  // patch event emit
  let oldEmit = target.emit;
  target.emit = function (name, obj) {
    let ret = oldEmit.apply(target, arguments);
    eventCallback(name, obj);
    return ret;
  };

  target.error = function (er) {
    if (!(er instanceof Error)) {
      er = new Error();
    }
    errorCallback(er);
  };

  target.sync = function (method, obj) {
    syncCallback(method, obj);
  };

  if (typeof target.onSync !== 'function') {
    target.onSync = function (method, obj) {
    };
  }
}

/*
Called from native

@params
data = {
  method : 'method',
  seq : 1, // call sequence, unique
  args : [arg],
}
*/
function invoke(data) {
  data = JSON.parse(data);
  console.log('native_invoke: ', data);

  let method = data.method;
  // let seq = data.seq;
  let args = data.args;
  try {
    if (typeof (target[method]) !== 'function') {
      throw new Error('Invalid method - ' + method);
    }

    let ret = target[method].apply(target, args);

    // Async method
    if (ret && typeof (ret.then) === 'function') {
      ret.then(ret => {
        // methodCallback(method, seq, ret);
      }).catch(err => {
        console.error(err);
        // errorCallback(err);
      });
    } else {
      return JSON.stringify(ret);
    }
  } catch (err) {
    console.error(err);
    // errorCallback(err);
  }
}

function eventCallback(eventName, obj) {
  let data = {
    type: 'event',
    name: eventName,
    obj: obj,
  };
  callback(data);
}

function errorCallback(err) {
  let data = {
    type: 'error',
    message: err.message,
    stack: err.stack,
  };
  callback(data);
}

function syncCallback(method, obj) {
  let data = {
    type: 'sync',
    method: method,
    obj: obj,
  };
  callback(data);
}

/*
Callback to native
*/
function callback(data) {
  console.log('native_callback: ', data);

  data = JSON.stringify(data);
  if (typeof (window.native_callback) === 'function') {
    window.native_callback(data);
  }
}

window.native_invoke = invoke;

export default {
  init
};
