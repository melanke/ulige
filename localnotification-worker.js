(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
    localForage -- Offline Storage, Improved
    Version 1.3.1
    https://mozilla.github.io/localForage
    (c) 2013-2015 Mozilla, Apache License 2.0
*/
(function() {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };
})();

define("promise/all", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @for RSVP
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    function all(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && isFunction(promise.then)) {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }

    __exports__.all = all;
  });
define("promise/asap", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }

    __exports__.asap = asap;
  });
define("promise/config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {
      instrument: false
    };

    function configure(name, value) {
      if (arguments.length === 2) {
        config[name] = value;
      } else {
        return config[name];
      }
    }

    __exports__.config = config;
    __exports__.configure = configure;
  });
define("promise/polyfill", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*global self*/
    var RSVPPromise = __dependency1__.Promise;
    var isFunction = __dependency2__.isFunction;

    function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport = 
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = RSVPPromise;
      }
    }

    __exports__.polyfill = polyfill;
  });
define("promise/promise", 
  ["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var configure = __dependency1__.configure;
    var objectOrFunction = __dependency2__.objectOrFunction;
    var isFunction = __dependency2__.isFunction;
    var now = __dependency2__.now;
    var all = __dependency3__.all;
    var race = __dependency4__.race;
    var staticResolve = __dependency5__.resolve;
    var staticReject = __dependency6__.reject;
    var asap = __dependency7__.asap;

    var counter = 0;

    config.async = asap; // default async is asap;

    function Promise(resolver) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._subscribers = [];

      invokeResolver(resolver, this);
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      then: function(onFulfillment, onRejection) {
        var promise = this;

        var thenPromise = new this.constructor(function() {});

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        return thenPromise;
      },

      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    Promise.all = all;
    Promise.race = race;
    Promise.resolve = staticResolve;
    Promise.reject = staticReject;

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      publish(promise, promise._state = REJECTED);
    }

    __exports__.Promise = Promise;
  });
define("promise/race", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */
    var isArray = __dependency1__.isArray;

    /**
      `RSVP.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    function race(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to race.');
      }
      return new Promise(function(resolve, reject) {
        var results = [], promise;

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    }

    __exports__.race = race;
  });
define("promise/reject", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    function reject(reason) {
      /*jshint validthis:true */
      var Promise = this;

      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }

    __exports__.reject = reject;
  });
define("promise/resolve", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function resolve(value) {
      /*jshint validthis:true */
      if (value && typeof value === 'object' && value.constructor === this) {
        return value;
      }

      var Promise = this;

      return new Promise(function(resolve) {
        resolve(value);
      });
    }

    __exports__.resolve = resolve;
  });
define("promise/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x) {
      return typeof x === "function";
    }

    function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };


    __exports__.objectOrFunction = objectOrFunction;
    __exports__.isFunction = isFunction;
    __exports__.isArray = isArray;
    __exports__.now = now;
  });
requireModule('promise/polyfill').polyfill();
}());(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["localforage"] = factory();
	else
		root["localforage"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	(function () {
	    'use strict';

	    // Custom drivers are stored here when `defineDriver()` is called.
	    // They are shared across all instances of localForage.
	    var CustomDrivers = {};

	    var DriverType = {
	        INDEXEDDB: 'asyncStorage',
	        LOCALSTORAGE: 'localStorageWrapper',
	        WEBSQL: 'webSQLStorage'
	    };

	    var DefaultDriverOrder = [DriverType.INDEXEDDB, DriverType.WEBSQL, DriverType.LOCALSTORAGE];

	    var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'];

	    var DefaultConfig = {
	        description: '',
	        driver: DefaultDriverOrder.slice(),
	        name: 'localforage',
	        // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
	        // we can use without a prompt.
	        size: 4980736,
	        storeName: 'keyvaluepairs',
	        version: 1.0
	    };

	    // Check to see if IndexedDB is available and if it is the latest
	    // implementation; it's our preferred backend library. We use "_spec_test"
	    // as the name of the database because it's not the one we'll operate on,
	    // but it's useful to make sure its using the right spec.
	    // See: https://github.com/mozilla/localForage/issues/128
	    var driverSupport = (function (self) {
	        // Initialize IndexedDB; fall back to vendor-prefixed versions
	        // if needed.
	        var indexedDB = indexedDB || self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB;

	        var result = {};

	        result[DriverType.WEBSQL] = !!self.openDatabase;
	        result[DriverType.INDEXEDDB] = !!(function () {
	            // We mimic PouchDB here; just UA test for Safari (which, as of
	            // iOS 8/Yosemite, doesn't properly support IndexedDB).
	            // IndexedDB support is broken and different from Blink's.
	            // This is faster than the test case (and it's sync), so we just
	            // do this. *SIGH*
	            // http://bl.ocks.org/nolanlawson/raw/c83e9039edf2278047e9/
	            //
	            // We test for openDatabase because IE Mobile identifies itself
	            // as Safari. Oh the lulz...
	            if (typeof self.openDatabase !== 'undefined' && self.navigator && self.navigator.userAgent && /Safari/.test(self.navigator.userAgent) && !/Chrome/.test(self.navigator.userAgent)) {
	                return false;
	            }
	            try {
	                return indexedDB && typeof indexedDB.open === 'function' &&
	                // Some Samsung/HTC Android 4.0-4.3 devices
	                // have older IndexedDB specs; if this isn't available
	                // their IndexedDB is too old for us to use.
	                // (Replaces the onupgradeneeded test.)
	                typeof self.IDBKeyRange !== 'undefined';
	            } catch (e) {
	                return false;
	            }
	        })();

	        result[DriverType.LOCALSTORAGE] = !!(function () {
	            try {
	                return self.localStorage && 'setItem' in self.localStorage && self.localStorage.setItem;
	            } catch (e) {
	                return false;
	            }
	        })();

	        return result;
	    })(this);

	    var isArray = Array.isArray || function (arg) {
	        return Object.prototype.toString.call(arg) === '[object Array]';
	    };

	    function callWhenReady(localForageInstance, libraryMethod) {
	        localForageInstance[libraryMethod] = function () {
	            var _args = arguments;
	            return localForageInstance.ready().then(function () {
	                return localForageInstance[libraryMethod].apply(localForageInstance, _args);
	            });
	        };
	    }

	    function extend() {
	        for (var i = 1; i < arguments.length; i++) {
	            var arg = arguments[i];

	            if (arg) {
	                for (var key in arg) {
	                    if (arg.hasOwnProperty(key)) {
	                        if (isArray(arg[key])) {
	                            arguments[0][key] = arg[key].slice();
	                        } else {
	                            arguments[0][key] = arg[key];
	                        }
	                    }
	                }
	            }
	        }

	        return arguments[0];
	    }

	    function isLibraryDriver(driverName) {
	        for (var driver in DriverType) {
	            if (DriverType.hasOwnProperty(driver) && DriverType[driver] === driverName) {
	                return true;
	            }
	        }

	        return false;
	    }

	    var LocalForage = (function () {
	        function LocalForage(options) {
	            _classCallCheck(this, LocalForage);

	            this.INDEXEDDB = DriverType.INDEXEDDB;
	            this.LOCALSTORAGE = DriverType.LOCALSTORAGE;
	            this.WEBSQL = DriverType.WEBSQL;

	            this._defaultConfig = extend({}, DefaultConfig);
	            this._config = extend({}, this._defaultConfig, options);
	            this._driverSet = null;
	            this._initDriver = null;
	            this._ready = false;
	            this._dbInfo = null;

	            this._wrapLibraryMethodsWithReady();
	            this.setDriver(this._config.driver);
	        }

	        // The actual localForage object that we expose as a module or via a
	        // global. It's extended by pulling in one of our other libraries.

	        // Set any config values for localForage; can be called anytime before
	        // the first API call (e.g. `getItem`, `setItem`).
	        // We loop through options so we don't overwrite existing config
	        // values.

	        LocalForage.prototype.config = function config(options) {
	            // If the options argument is an object, we use it to set values.
	            // Otherwise, we return either a specified config value or all
	            // config values.
	            if (typeof options === 'object') {
	                // If localforage is ready and fully initialized, we can't set
	                // any new configuration values. Instead, we return an error.
	                if (this._ready) {
	                    return new Error("Can't call config() after localforage " + 'has been used.');
	                }

	                for (var i in options) {
	                    if (i === 'storeName') {
	                        options[i] = options[i].replace(/\W/g, '_');
	                    }

	                    this._config[i] = options[i];
	                }

	                // after all config options are set and
	                // the driver option is used, try setting it
	                if ('driver' in options && options.driver) {
	                    this.setDriver(this._config.driver);
	                }

	                return true;
	            } else if (typeof options === 'string') {
	                return this._config[options];
	            } else {
	                return this._config;
	            }
	        };

	        // Used to define a custom driver, shared across all instances of
	        // localForage.

	        LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
	            var promise = new Promise(function (resolve, reject) {
	                try {
	                    var driverName = driverObject._driver;
	                    var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');
	                    var namingError = new Error('Custom driver name already in use: ' + driverObject._driver);

	                    // A driver name should be defined and not overlap with the
	                    // library-defined, default drivers.
	                    if (!driverObject._driver) {
	                        reject(complianceError);
	                        return;
	                    }
	                    if (isLibraryDriver(driverObject._driver)) {
	                        reject(namingError);
	                        return;
	                    }

	                    var customDriverMethods = LibraryMethods.concat('_initStorage');
	                    for (var i = 0; i < customDriverMethods.length; i++) {
	                        var customDriverMethod = customDriverMethods[i];
	                        if (!customDriverMethod || !driverObject[customDriverMethod] || typeof driverObject[customDriverMethod] !== 'function') {
	                            reject(complianceError);
	                            return;
	                        }
	                    }

	                    var supportPromise = Promise.resolve(true);
	                    if ('_support' in driverObject) {
	                        if (driverObject._support && typeof driverObject._support === 'function') {
	                            supportPromise = driverObject._support();
	                        } else {
	                            supportPromise = Promise.resolve(!!driverObject._support);
	                        }
	                    }

	                    supportPromise.then(function (supportResult) {
	                        driverSupport[driverName] = supportResult;
	                        CustomDrivers[driverName] = driverObject;
	                        resolve();
	                    }, reject);
	                } catch (e) {
	                    reject(e);
	                }
	            });

	            promise.then(callback, errorCallback);
	            return promise;
	        };

	        LocalForage.prototype.driver = function driver() {
	            return this._driver || null;
	        };

	        LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
	            var self = this;
	            var getDriverPromise = (function () {
	                if (isLibraryDriver(driverName)) {
	                    switch (driverName) {
	                        case self.INDEXEDDB:
	                            return new Promise(function (resolve, reject) {
	                                resolve(__webpack_require__(1));
	                            });
	                        case self.LOCALSTORAGE:
	                            return new Promise(function (resolve, reject) {
	                                resolve(__webpack_require__(2));
	                            });
	                        case self.WEBSQL:
	                            return new Promise(function (resolve, reject) {
	                                resolve(__webpack_require__(4));
	                            });
	                    }
	                } else if (CustomDrivers[driverName]) {
	                    return Promise.resolve(CustomDrivers[driverName]);
	                }

	                return Promise.reject(new Error('Driver not found.'));
	            })();

	            getDriverPromise.then(callback, errorCallback);
	            return getDriverPromise;
	        };

	        LocalForage.prototype.getSerializer = function getSerializer(callback) {
	            var serializerPromise = new Promise(function (resolve, reject) {
	                resolve(__webpack_require__(3));
	            });
	            if (callback && typeof callback === 'function') {
	                serializerPromise.then(function (result) {
	                    callback(result);
	                });
	            }
	            return serializerPromise;
	        };

	        LocalForage.prototype.ready = function ready(callback) {
	            var self = this;

	            var promise = self._driverSet.then(function () {
	                if (self._ready === null) {
	                    self._ready = self._initDriver();
	                }

	                return self._ready;
	            });

	            promise.then(callback, callback);
	            return promise;
	        };

	        LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
	            var self = this;

	            if (!isArray(drivers)) {
	                drivers = [drivers];
	            }

	            var supportedDrivers = this._getSupportedDrivers(drivers);

	            function setDriverToConfig() {
	                self._config.driver = self.driver();
	            }

	            function initDriver(supportedDrivers) {
	                return function () {
	                    var currentDriverIndex = 0;

	                    function driverPromiseLoop() {
	                        while (currentDriverIndex < supportedDrivers.length) {
	                            var driverName = supportedDrivers[currentDriverIndex];
	                            currentDriverIndex++;

	                            self._dbInfo = null;
	                            self._ready = null;

	                            return self.getDriver(driverName).then(function (driver) {
	                                self._extend(driver);
	                                setDriverToConfig();

	                                self._ready = self._initStorage(self._config);
	                                return self._ready;
	                            })['catch'](driverPromiseLoop);
	                        }

	                        setDriverToConfig();
	                        var error = new Error('No available storage method found.');
	                        self._driverSet = Promise.reject(error);
	                        return self._driverSet;
	                    }

	                    return driverPromiseLoop();
	                };
	            }

	            // There might be a driver initialization in progress
	            // so wait for it to finish in order to avoid a possible
	            // race condition to set _dbInfo
	            var oldDriverSetDone = this._driverSet !== null ? this._driverSet['catch'](function () {
	                return Promise.resolve();
	            }) : Promise.resolve();

	            this._driverSet = oldDriverSetDone.then(function () {
	                var driverName = supportedDrivers[0];
	                self._dbInfo = null;
	                self._ready = null;

	                return self.getDriver(driverName).then(function (driver) {
	                    self._driver = driver._driver;
	                    setDriverToConfig();
	                    self._wrapLibraryMethodsWithReady();
	                    self._initDriver = initDriver(supportedDrivers);
	                });
	            })['catch'](function () {
	                setDriverToConfig();
	                var error = new Error('No available storage method found.');
	                self._driverSet = Promise.reject(error);
	                return self._driverSet;
	            });

	            this._driverSet.then(callback, errorCallback);
	            return this._driverSet;
	        };

	        LocalForage.prototype.supports = function supports(driverName) {
	            return !!driverSupport[driverName];
	        };

	        LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
	            extend(this, libraryMethodsAndProperties);
	        };

	        LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
	            var supportedDrivers = [];
	            for (var i = 0, len = drivers.length; i < len; i++) {
	                var driverName = drivers[i];
	                if (this.supports(driverName)) {
	                    supportedDrivers.push(driverName);
	                }
	            }
	            return supportedDrivers;
	        };

	        LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
	            // Add a stub for each driver API method that delays the call to the
	            // corresponding driver method until localForage is ready. These stubs
	            // will be replaced by the driver methods as soon as the driver is
	            // loaded, so there is no performance impact.
	            for (var i = 0; i < LibraryMethods.length; i++) {
	                callWhenReady(this, LibraryMethods[i]);
	            }
	        };

	        LocalForage.prototype.createInstance = function createInstance(options) {
	            return new LocalForage(options);
	        };

	        return LocalForage;
	    })();

	    var localForage = new LocalForage();

	    exports['default'] = localForage;
	}).call(typeof window !== 'undefined' ? window : self);
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	// Some code originally from async_storage.js in
	// [Gaia](https://github.com/mozilla-b2g/gaia).
	'use strict';

	exports.__esModule = true;
	(function () {
	    'use strict';

	    var globalObject = this;
	    // Initialize IndexedDB; fall back to vendor-prefixed versions if needed.
	    var indexedDB = indexedDB || this.indexedDB || this.webkitIndexedDB || this.mozIndexedDB || this.OIndexedDB || this.msIndexedDB;

	    // If IndexedDB isn't available, we get outta here!
	    if (!indexedDB) {
	        return;
	    }

	    var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
	    var supportsBlobs;
	    var dbContexts;

	    // Abstracts constructing a Blob object, so it also works in older
	    // browsers that don't support the native Blob constructor. (i.e.
	    // old QtWebKit versions, at least).
	    function _createBlob(parts, properties) {
	        parts = parts || [];
	        properties = properties || {};
	        try {
	            return new Blob(parts, properties);
	        } catch (e) {
	            if (e.name !== 'TypeError') {
	                throw e;
	            }
	            var BlobBuilder = globalObject.BlobBuilder || globalObject.MSBlobBuilder || globalObject.MozBlobBuilder || globalObject.WebKitBlobBuilder;
	            var builder = new BlobBuilder();
	            for (var i = 0; i < parts.length; i += 1) {
	                builder.append(parts[i]);
	            }
	            return builder.getBlob(properties.type);
	        }
	    }

	    // Transform a binary string to an array buffer, because otherwise
	    // weird stuff happens when you try to work with the binary string directly.
	    // It is known.
	    // From http://stackoverflow.com/questions/14967647/ (continues on next line)
	    // encode-decode-image-with-base64-breaks-image (2013-04-21)
	    function _binStringToArrayBuffer(bin) {
	        var length = bin.length;
	        var buf = new ArrayBuffer(length);
	        var arr = new Uint8Array(buf);
	        for (var i = 0; i < length; i++) {
	            arr[i] = bin.charCodeAt(i);
	        }
	        return buf;
	    }

	    // Fetch a blob using ajax. This reveals bugs in Chrome < 43.
	    // For details on all this junk:
	    // https://github.com/nolanlawson/state-of-binary-data-in-the-browser#readme
	    function _blobAjax(url) {
	        return new Promise(function (resolve, reject) {
	            var xhr = new XMLHttpRequest();
	            xhr.open('GET', url);
	            xhr.withCredentials = true;
	            xhr.responseType = 'arraybuffer';

	            xhr.onreadystatechange = function () {
	                if (xhr.readyState !== 4) {
	                    return;
	                }
	                if (xhr.status === 200) {
	                    return resolve({
	                        response: xhr.response,
	                        type: xhr.getResponseHeader('Content-Type')
	                    });
	                }
	                reject({ status: xhr.status, response: xhr.response });
	            };
	            xhr.send();
	        });
	    }

	    //
	    // Detect blob support. Chrome didn't support it until version 38.
	    // In version 37 they had a broken version where PNGs (and possibly
	    // other binary types) aren't stored correctly, because when you fetch
	    // them, the content type is always null.
	    //
	    // Furthermore, they have some outstanding bugs where blobs occasionally
	    // are read by FileReader as null, or by ajax as 404s.
	    //
	    // Sadly we use the 404 bug to detect the FileReader bug, so if they
	    // get fixed independently and released in different versions of Chrome,
	    // then the bug could come back. So it's worthwhile to watch these issues:
	    // 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
	    // FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
	    //
	    function _checkBlobSupportWithoutCaching(idb) {
	        return new Promise(function (resolve, reject) {
	            var blob = _createBlob([''], { type: 'image/png' });
	            var txn = idb.transaction([DETECT_BLOB_SUPPORT_STORE], 'readwrite');
	            txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');
	            txn.oncomplete = function () {
	                // have to do it in a separate transaction, else the correct
	                // content type is always returned
	                var blobTxn = idb.transaction([DETECT_BLOB_SUPPORT_STORE], 'readwrite');
	                var getBlobReq = blobTxn.objectStore(DETECT_BLOB_SUPPORT_STORE).get('key');
	                getBlobReq.onerror = reject;
	                getBlobReq.onsuccess = function (e) {

	                    var storedBlob = e.target.result;
	                    var url = URL.createObjectURL(storedBlob);

	                    _blobAjax(url).then(function (res) {
	                        resolve(!!(res && res.type === 'image/png'));
	                    }, function () {
	                        resolve(false);
	                    }).then(function () {
	                        URL.revokeObjectURL(url);
	                    });
	                };
	            };
	        })['catch'](function () {
	            return false; // error, so assume unsupported
	        });
	    }

	    function _checkBlobSupport(idb) {
	        if (typeof supportsBlobs === 'boolean') {
	            return Promise.resolve(supportsBlobs);
	        }
	        return _checkBlobSupportWithoutCaching(idb).then(function (value) {
	            supportsBlobs = value;
	            return supportsBlobs;
	        });
	    }

	    // encode a blob for indexeddb engines that don't support blobs
	    function _encodeBlob(blob) {
	        return new Promise(function (resolve, reject) {
	            var reader = new FileReader();
	            reader.onerror = reject;
	            reader.onloadend = function (e) {
	                var base64 = btoa(e.target.result || '');
	                resolve({
	                    __local_forage_encoded_blob: true,
	                    data: base64,
	                    type: blob.type
	                });
	            };
	            reader.readAsBinaryString(blob);
	        });
	    }

	    // decode an encoded blob
	    function _decodeBlob(encodedBlob) {
	        var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
	        return _createBlob([arrayBuff], { type: encodedBlob.type });
	    }

	    // is this one of our fancy encoded blobs?
	    function _isEncodedBlob(value) {
	        return value && value.__local_forage_encoded_blob;
	    }

	    // Open the IndexedDB database (automatically creates one if one didn't
	    // previously exist), using any options set in the config.
	    function _initStorage(options) {
	        var self = this;
	        var dbInfo = {
	            db: null
	        };

	        if (options) {
	            for (var i in options) {
	                dbInfo[i] = options[i];
	            }
	        }

	        // Initialize a singleton container for all running localForages.
	        if (!dbContexts) {
	            dbContexts = {};
	        }

	        // Get the current context of the database;
	        var dbContext = dbContexts[dbInfo.name];

	        // ...or create a new context.
	        if (!dbContext) {
	            dbContext = {
	                // Running localForages sharing a database.
	                forages: [],
	                // Shared database.
	                db: null
	            };
	            // Register the new context in the global container.
	            dbContexts[dbInfo.name] = dbContext;
	        }

	        // Register itself as a running localForage in the current context.
	        dbContext.forages.push(this);

	        // Create an array of readiness of the related localForages.
	        var readyPromises = [];

	        function ignoreErrors() {
	            // Don't handle errors here,
	            // just makes sure related localForages aren't pending.
	            return Promise.resolve();
	        }

	        for (var j = 0; j < dbContext.forages.length; j++) {
	            var forage = dbContext.forages[j];
	            if (forage !== this) {
	                // Don't wait for itself...
	                readyPromises.push(forage.ready()['catch'](ignoreErrors));
	            }
	        }

	        // Take a snapshot of the related localForages.
	        var forages = dbContext.forages.slice(0);

	        // Initialize the connection process only when
	        // all the related localForages aren't pending.
	        return Promise.all(readyPromises).then(function () {
	            dbInfo.db = dbContext.db;
	            // Get the connection or open a new one without upgrade.
	            return _getOriginalConnection(dbInfo);
	        }).then(function (db) {
	            dbInfo.db = db;
	            if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
	                // Reopen the database for upgrading.
	                return _getUpgradedConnection(dbInfo);
	            }
	            return db;
	        }).then(function (db) {
	            dbInfo.db = dbContext.db = db;
	            self._dbInfo = dbInfo;
	            // Share the final connection amongst related localForages.
	            for (var k = 0; k < forages.length; k++) {
	                var forage = forages[k];
	                if (forage !== self) {
	                    // Self is already up-to-date.
	                    forage._dbInfo.db = dbInfo.db;
	                    forage._dbInfo.version = dbInfo.version;
	                }
	            }
	        });
	    }

	    function _getOriginalConnection(dbInfo) {
	        return _getConnection(dbInfo, false);
	    }

	    function _getUpgradedConnection(dbInfo) {
	        return _getConnection(dbInfo, true);
	    }

	    function _getConnection(dbInfo, upgradeNeeded) {
	        return new Promise(function (resolve, reject) {
	            if (dbInfo.db) {
	                if (upgradeNeeded) {
	                    dbInfo.db.close();
	                } else {
	                    return resolve(dbInfo.db);
	                }
	            }

	            var dbArgs = [dbInfo.name];

	            if (upgradeNeeded) {
	                dbArgs.push(dbInfo.version);
	            }

	            var openreq = indexedDB.open.apply(indexedDB, dbArgs);

	            if (upgradeNeeded) {
	                openreq.onupgradeneeded = function (e) {
	                    var db = openreq.result;
	                    try {
	                        db.createObjectStore(dbInfo.storeName);
	                        if (e.oldVersion <= 1) {
	                            // Added when support for blob shims was added
	                            db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
	                        }
	                    } catch (ex) {
	                        if (ex.name === 'ConstraintError') {
	                            globalObject.console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
	                        } else {
	                            throw ex;
	                        }
	                    }
	                };
	            }

	            openreq.onerror = function () {
	                reject(openreq.error);
	            };

	            openreq.onsuccess = function () {
	                resolve(openreq.result);
	            };
	        });
	    }

	    function _isUpgradeNeeded(dbInfo, defaultVersion) {
	        if (!dbInfo.db) {
	            return true;
	        }

	        var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
	        var isDowngrade = dbInfo.version < dbInfo.db.version;
	        var isUpgrade = dbInfo.version > dbInfo.db.version;

	        if (isDowngrade) {
	            // If the version is not the default one
	            // then warn for impossible downgrade.
	            if (dbInfo.version !== defaultVersion) {
	                globalObject.console.warn('The database "' + dbInfo.name + '"' + ' can\'t be downgraded from version ' + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
	            }
	            // Align the versions to prevent errors.
	            dbInfo.version = dbInfo.db.version;
	        }

	        if (isUpgrade || isNewStore) {
	            // If the store is new then increment the version (if needed).
	            // This will trigger an "upgradeneeded" event which is required
	            // for creating a store.
	            if (isNewStore) {
	                var incVersion = dbInfo.db.version + 1;
	                if (incVersion > dbInfo.version) {
	                    dbInfo.version = incVersion;
	                }
	            }

	            return true;
	        }

	        return false;
	    }

	    function getItem(key, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
	                var req = store.get(key);

	                req.onsuccess = function () {
	                    var value = req.result;
	                    if (value === undefined) {
	                        value = null;
	                    }
	                    if (_isEncodedBlob(value)) {
	                        value = _decodeBlob(value);
	                    }
	                    resolve(value);
	                };

	                req.onerror = function () {
	                    reject(req.error);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Iterate over all items stored in database.
	    function iterate(iterator, callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	                var req = store.openCursor();
	                var iterationNumber = 1;

	                req.onsuccess = function () {
	                    var cursor = req.result;

	                    if (cursor) {
	                        var value = cursor.value;
	                        if (_isEncodedBlob(value)) {
	                            value = _decodeBlob(value);
	                        }
	                        var result = iterator(value, cursor.key, iterationNumber++);

	                        if (result !== void 0) {
	                            resolve(result);
	                        } else {
	                            cursor['continue']();
	                        }
	                    } else {
	                        resolve();
	                    }
	                };

	                req.onerror = function () {
	                    reject(req.error);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);

	        return promise;
	    }

	    function setItem(key, value, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = new Promise(function (resolve, reject) {
	            var dbInfo;
	            self.ready().then(function () {
	                dbInfo = self._dbInfo;
	                if (value instanceof Blob) {
	                    return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
	                        if (blobSupport) {
	                            return value;
	                        }
	                        return _encodeBlob(value);
	                    });
	                }
	                return value;
	            }).then(function (value) {
	                var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	                var store = transaction.objectStore(dbInfo.storeName);

	                // The reason we don't _save_ null is because IE 10 does
	                // not support saving the `null` type in IndexedDB. How
	                // ironic, given the bug below!
	                // See: https://github.com/mozilla/localForage/issues/161
	                if (value === null) {
	                    value = undefined;
	                }

	                var req = store.put(value, key);
	                transaction.oncomplete = function () {
	                    // Cast to undefined so the value passed to
	                    // callback/promise is the same as what one would get out
	                    // of `getItem()` later. This leads to some weirdness
	                    // (setItem('foo', undefined) will return `null`), but
	                    // it's not my fault localStorage is our baseline and that
	                    // it's weird.
	                    if (value === undefined) {
	                        value = null;
	                    }

	                    resolve(value);
	                };
	                transaction.onabort = transaction.onerror = function () {
	                    var err = req.error ? req.error : req.transaction.error;
	                    reject(err);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function removeItem(key, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	                var store = transaction.objectStore(dbInfo.storeName);

	                // We use a Grunt task to make this safe for IE and some
	                // versions of Android (including those used by Cordova).
	                // Normally IE won't like `.delete()` and will insist on
	                // using `['delete']()`, but we have a build step that
	                // fixes this for us now.
	                var req = store['delete'](key);
	                transaction.oncomplete = function () {
	                    resolve();
	                };

	                transaction.onerror = function () {
	                    reject(req.error);
	                };

	                // The request will be also be aborted if we've exceeded our storage
	                // space.
	                transaction.onabort = function () {
	                    var err = req.error ? req.error : req.transaction.error;
	                    reject(err);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function clear(callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite');
	                var store = transaction.objectStore(dbInfo.storeName);
	                var req = store.clear();

	                transaction.oncomplete = function () {
	                    resolve();
	                };

	                transaction.onabort = transaction.onerror = function () {
	                    var err = req.error ? req.error : req.transaction.error;
	                    reject(err);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function length(callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);
	                var req = store.count();

	                req.onsuccess = function () {
	                    resolve(req.result);
	                };

	                req.onerror = function () {
	                    reject(req.error);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function key(n, callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            if (n < 0) {
	                resolve(null);

	                return;
	            }

	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	                var advanced = false;
	                var req = store.openCursor();
	                req.onsuccess = function () {
	                    var cursor = req.result;
	                    if (!cursor) {
	                        // this means there weren't enough keys
	                        resolve(null);

	                        return;
	                    }

	                    if (n === 0) {
	                        // We have the first key, return it if that's what they
	                        // wanted.
	                        resolve(cursor.key);
	                    } else {
	                        if (!advanced) {
	                            // Otherwise, ask the cursor to skip ahead n
	                            // records.
	                            advanced = true;
	                            cursor.advance(n);
	                        } else {
	                            // When we get here, we've got the nth key.
	                            resolve(cursor.key);
	                        }
	                    }
	                };

	                req.onerror = function () {
	                    reject(req.error);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function keys(callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                var store = dbInfo.db.transaction(dbInfo.storeName, 'readonly').objectStore(dbInfo.storeName);

	                var req = store.openCursor();
	                var keys = [];

	                req.onsuccess = function () {
	                    var cursor = req.result;

	                    if (!cursor) {
	                        resolve(keys);
	                        return;
	                    }

	                    keys.push(cursor.key);
	                    cursor['continue']();
	                };

	                req.onerror = function () {
	                    reject(req.error);
	                };
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function executeCallback(promise, callback) {
	        if (callback) {
	            promise.then(function (result) {
	                callback(null, result);
	            }, function (error) {
	                callback(error);
	            });
	        }
	    }

	    var asyncStorage = {
	        _driver: 'asyncStorage',
	        _initStorage: _initStorage,
	        iterate: iterate,
	        getItem: getItem,
	        setItem: setItem,
	        removeItem: removeItem,
	        clear: clear,
	        length: length,
	        key: key,
	        keys: keys
	    };

	    exports['default'] = asyncStorage;
	}).call(typeof window !== 'undefined' ? window : self);
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// If IndexedDB isn't available, we'll fall back to localStorage.
	// Note that this will have considerable performance and storage
	// side-effects (all data will be serialized on save and only data that
	// can be converted to a string via `JSON.stringify()` will be saved).
	'use strict';

	exports.__esModule = true;
	(function () {
	    'use strict';

	    var globalObject = this;
	    var localStorage = null;

	    // If the app is running inside a Google Chrome packaged webapp, or some
	    // other context where localStorage isn't available, we don't use
	    // localStorage. This feature detection is preferred over the old
	    // `if (window.chrome && window.chrome.runtime)` code.
	    // See: https://github.com/mozilla/localForage/issues/68
	    try {
	        // If localStorage isn't available, we get outta here!
	        // This should be inside a try catch
	        if (!this.localStorage || !('setItem' in this.localStorage)) {
	            return;
	        }
	        // Initialize localStorage and create a variable to use throughout
	        // the code.
	        localStorage = this.localStorage;
	    } catch (e) {
	        return;
	    }

	    // Config the localStorage backend, using options set in the config.
	    function _initStorage(options) {
	        var self = this;
	        var dbInfo = {};
	        if (options) {
	            for (var i in options) {
	                dbInfo[i] = options[i];
	            }
	        }

	        dbInfo.keyPrefix = dbInfo.name + '/';

	        if (dbInfo.storeName !== self._defaultConfig.storeName) {
	            dbInfo.keyPrefix += dbInfo.storeName + '/';
	        }

	        self._dbInfo = dbInfo;

	        return new Promise(function (resolve, reject) {
	            resolve(__webpack_require__(3));
	        }).then(function (lib) {
	            dbInfo.serializer = lib;
	            return Promise.resolve();
	        });
	    }

	    // Remove all keys from the datastore, effectively destroying all data in
	    // the app's key/value store!
	    function clear(callback) {
	        var self = this;
	        var promise = self.ready().then(function () {
	            var keyPrefix = self._dbInfo.keyPrefix;

	            for (var i = localStorage.length - 1; i >= 0; i--) {
	                var key = localStorage.key(i);

	                if (key.indexOf(keyPrefix) === 0) {
	                    localStorage.removeItem(key);
	                }
	            }
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Retrieve an item from the store. Unlike the original async_storage
	    // library in Gaia, we don't modify return values at all. If a key's value
	    // is `undefined`, we pass that value to the callback function.
	    function getItem(key, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var result = localStorage.getItem(dbInfo.keyPrefix + key);

	            // If a result was found, parse it from the serialized
	            // string into a JS object. If result isn't truthy, the key
	            // is likely undefined and we'll pass it straight to the
	            // callback.
	            if (result) {
	                result = dbInfo.serializer.deserialize(result);
	            }

	            return result;
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Iterate over all items in the store.
	    function iterate(iterator, callback) {
	        var self = this;

	        var promise = self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var keyPrefix = dbInfo.keyPrefix;
	            var keyPrefixLength = keyPrefix.length;
	            var length = localStorage.length;

	            // We use a dedicated iterator instead of the `i` variable below
	            // so other keys we fetch in localStorage aren't counted in
	            // the `iterationNumber` argument passed to the `iterate()`
	            // callback.
	            //
	            // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
	            var iterationNumber = 1;

	            for (var i = 0; i < length; i++) {
	                var key = localStorage.key(i);
	                if (key.indexOf(keyPrefix) !== 0) {
	                    continue;
	                }
	                var value = localStorage.getItem(key);

	                // If a result was found, parse it from the serialized
	                // string into a JS object. If result isn't truthy, the
	                // key is likely undefined and we'll pass it straight
	                // to the iterator.
	                if (value) {
	                    value = dbInfo.serializer.deserialize(value);
	                }

	                value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

	                if (value !== void 0) {
	                    return value;
	                }
	            }
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Same as localStorage's key() method, except takes a callback.
	    function key(n, callback) {
	        var self = this;
	        var promise = self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var result;
	            try {
	                result = localStorage.key(n);
	            } catch (error) {
	                result = null;
	            }

	            // Remove the prefix from the key, if a key is found.
	            if (result) {
	                result = result.substring(dbInfo.keyPrefix.length);
	            }

	            return result;
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function keys(callback) {
	        var self = this;
	        var promise = self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            var length = localStorage.length;
	            var keys = [];

	            for (var i = 0; i < length; i++) {
	                if (localStorage.key(i).indexOf(dbInfo.keyPrefix) === 0) {
	                    keys.push(localStorage.key(i).substring(dbInfo.keyPrefix.length));
	                }
	            }

	            return keys;
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Supply the number of keys in the datastore to the callback function.
	    function length(callback) {
	        var self = this;
	        var promise = self.keys().then(function (keys) {
	            return keys.length;
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Remove an item from the store, nice and simple.
	    function removeItem(key, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = self.ready().then(function () {
	            var dbInfo = self._dbInfo;
	            localStorage.removeItem(dbInfo.keyPrefix + key);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Set a key's value and run an optional callback once the value is set.
	    // Unlike Gaia's implementation, the callback function is passed the value,
	    // in case you want to operate on that value only after you're sure it
	    // saved, or something like that.
	    function setItem(key, value, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = self.ready().then(function () {
	            // Convert undefined values to null.
	            // https://github.com/mozilla/localForage/pull/42
	            if (value === undefined) {
	                value = null;
	            }

	            // Save the original value to pass to the callback.
	            var originalValue = value;

	            return new Promise(function (resolve, reject) {
	                var dbInfo = self._dbInfo;
	                dbInfo.serializer.serialize(value, function (value, error) {
	                    if (error) {
	                        reject(error);
	                    } else {
	                        try {
	                            localStorage.setItem(dbInfo.keyPrefix + key, value);
	                            resolve(originalValue);
	                        } catch (e) {
	                            // localStorage capacity exceeded.
	                            // TODO: Make this a specific error/event.
	                            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
	                                reject(e);
	                            }
	                            reject(e);
	                        }
	                    }
	                });
	            });
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function executeCallback(promise, callback) {
	        if (callback) {
	            promise.then(function (result) {
	                callback(null, result);
	            }, function (error) {
	                callback(error);
	            });
	        }
	    }

	    var localStorageWrapper = {
	        _driver: 'localStorageWrapper',
	        _initStorage: _initStorage,
	        // Default API, from Gaia/localStorage.
	        iterate: iterate,
	        getItem: getItem,
	        setItem: setItem,
	        removeItem: removeItem,
	        clear: clear,
	        length: length,
	        key: key,
	        keys: keys
	    };

	    exports['default'] = localStorageWrapper;
	}).call(typeof window !== 'undefined' ? window : self);
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	(function () {
	    'use strict';

	    // Sadly, the best way to save binary data in WebSQL/localStorage is serializing
	    // it to Base64, so this is how we store it to prevent very strange errors with less
	    // verbose ways of binary <-> string data storage.
	    var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	    var BLOB_TYPE_PREFIX = '~~local_forage_type~';
	    var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

	    var SERIALIZED_MARKER = '__lfsc__:';
	    var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

	    // OMG the serializations!
	    var TYPE_ARRAYBUFFER = 'arbf';
	    var TYPE_BLOB = 'blob';
	    var TYPE_INT8ARRAY = 'si08';
	    var TYPE_UINT8ARRAY = 'ui08';
	    var TYPE_UINT8CLAMPEDARRAY = 'uic8';
	    var TYPE_INT16ARRAY = 'si16';
	    var TYPE_INT32ARRAY = 'si32';
	    var TYPE_UINT16ARRAY = 'ur16';
	    var TYPE_UINT32ARRAY = 'ui32';
	    var TYPE_FLOAT32ARRAY = 'fl32';
	    var TYPE_FLOAT64ARRAY = 'fl64';
	    var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

	    // Get out of our habit of using `window` inline, at least.
	    var globalObject = this;

	    // Abstracts constructing a Blob object, so it also works in older
	    // browsers that don't support the native Blob constructor. (i.e.
	    // old QtWebKit versions, at least).
	    function _createBlob(parts, properties) {
	        parts = parts || [];
	        properties = properties || {};

	        try {
	            return new Blob(parts, properties);
	        } catch (err) {
	            if (err.name !== 'TypeError') {
	                throw err;
	            }

	            var BlobBuilder = globalObject.BlobBuilder || globalObject.MSBlobBuilder || globalObject.MozBlobBuilder || globalObject.WebKitBlobBuilder;

	            var builder = new BlobBuilder();
	            for (var i = 0; i < parts.length; i += 1) {
	                builder.append(parts[i]);
	            }

	            return builder.getBlob(properties.type);
	        }
	    }

	    // Serialize a value, afterwards executing a callback (which usually
	    // instructs the `setItem()` callback/promise to be executed). This is how
	    // we store binary data with localStorage.
	    function serialize(value, callback) {
	        var valueString = '';
	        if (value) {
	            valueString = value.toString();
	        }

	        // Cannot use `value instanceof ArrayBuffer` or such here, as these
	        // checks fail when running the tests using casper.js...
	        //
	        // TODO: See why those tests fail and use a better solution.
	        if (value && (value.toString() === '[object ArrayBuffer]' || value.buffer && value.buffer.toString() === '[object ArrayBuffer]')) {
	            // Convert binary arrays to a string and prefix the string with
	            // a special marker.
	            var buffer;
	            var marker = SERIALIZED_MARKER;

	            if (value instanceof ArrayBuffer) {
	                buffer = value;
	                marker += TYPE_ARRAYBUFFER;
	            } else {
	                buffer = value.buffer;

	                if (valueString === '[object Int8Array]') {
	                    marker += TYPE_INT8ARRAY;
	                } else if (valueString === '[object Uint8Array]') {
	                    marker += TYPE_UINT8ARRAY;
	                } else if (valueString === '[object Uint8ClampedArray]') {
	                    marker += TYPE_UINT8CLAMPEDARRAY;
	                } else if (valueString === '[object Int16Array]') {
	                    marker += TYPE_INT16ARRAY;
	                } else if (valueString === '[object Uint16Array]') {
	                    marker += TYPE_UINT16ARRAY;
	                } else if (valueString === '[object Int32Array]') {
	                    marker += TYPE_INT32ARRAY;
	                } else if (valueString === '[object Uint32Array]') {
	                    marker += TYPE_UINT32ARRAY;
	                } else if (valueString === '[object Float32Array]') {
	                    marker += TYPE_FLOAT32ARRAY;
	                } else if (valueString === '[object Float64Array]') {
	                    marker += TYPE_FLOAT64ARRAY;
	                } else {
	                    callback(new Error('Failed to get type for BinaryArray'));
	                }
	            }

	            callback(marker + bufferToString(buffer));
	        } else if (valueString === '[object Blob]') {
	            // Conver the blob to a binaryArray and then to a string.
	            var fileReader = new FileReader();

	            fileReader.onload = function () {
	                // Backwards-compatible prefix for the blob type.
	                var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

	                callback(SERIALIZED_MARKER + TYPE_BLOB + str);
	            };

	            fileReader.readAsArrayBuffer(value);
	        } else {
	            try {
	                callback(JSON.stringify(value));
	            } catch (e) {
	                console.error("Couldn't convert value into a JSON string: ", value);

	                callback(null, e);
	            }
	        }
	    }

	    // Deserialize data we've inserted into a value column/field. We place
	    // special markers into our strings to mark them as encoded; this isn't
	    // as nice as a meta field, but it's the only sane thing we can do whilst
	    // keeping localStorage support intact.
	    //
	    // Oftentimes this will just deserialize JSON content, but if we have a
	    // special marker (SERIALIZED_MARKER, defined above), we will extract
	    // some kind of arraybuffer/binary data/typed array out of the string.
	    function deserialize(value) {
	        // If we haven't marked this string as being specially serialized (i.e.
	        // something other than serialized JSON), we can just return it and be
	        // done with it.
	        if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
	            return JSON.parse(value);
	        }

	        // The following code deals with deserializing some kind of Blob or
	        // TypedArray. First we separate out the type of data we're dealing
	        // with from the data itself.
	        var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
	        var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

	        var blobType;
	        // Backwards-compatible blob type serialization strategy.
	        // DBs created with older versions of localForage will simply not have the blob type.
	        if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
	            var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
	            blobType = matcher[1];
	            serializedString = serializedString.substring(matcher[0].length);
	        }
	        var buffer = stringToBuffer(serializedString);

	        // Return the right type based on the code/type set during
	        // serialization.
	        switch (type) {
	            case TYPE_ARRAYBUFFER:
	                return buffer;
	            case TYPE_BLOB:
	                return _createBlob([buffer], { type: blobType });
	            case TYPE_INT8ARRAY:
	                return new Int8Array(buffer);
	            case TYPE_UINT8ARRAY:
	                return new Uint8Array(buffer);
	            case TYPE_UINT8CLAMPEDARRAY:
	                return new Uint8ClampedArray(buffer);
	            case TYPE_INT16ARRAY:
	                return new Int16Array(buffer);
	            case TYPE_UINT16ARRAY:
	                return new Uint16Array(buffer);
	            case TYPE_INT32ARRAY:
	                return new Int32Array(buffer);
	            case TYPE_UINT32ARRAY:
	                return new Uint32Array(buffer);
	            case TYPE_FLOAT32ARRAY:
	                return new Float32Array(buffer);
	            case TYPE_FLOAT64ARRAY:
	                return new Float64Array(buffer);
	            default:
	                throw new Error('Unkown type: ' + type);
	        }
	    }

	    function stringToBuffer(serializedString) {
	        // Fill the string into a ArrayBuffer.
	        var bufferLength = serializedString.length * 0.75;
	        var len = serializedString.length;
	        var i;
	        var p = 0;
	        var encoded1, encoded2, encoded3, encoded4;

	        if (serializedString[serializedString.length - 1] === '=') {
	            bufferLength--;
	            if (serializedString[serializedString.length - 2] === '=') {
	                bufferLength--;
	            }
	        }

	        var buffer = new ArrayBuffer(bufferLength);
	        var bytes = new Uint8Array(buffer);

	        for (i = 0; i < len; i += 4) {
	            encoded1 = BASE_CHARS.indexOf(serializedString[i]);
	            encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
	            encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
	            encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

	            /*jslint bitwise: true */
	            bytes[p++] = encoded1 << 2 | encoded2 >> 4;
	            bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
	            bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
	        }
	        return buffer;
	    }

	    // Converts a buffer to a string to store, serialized, in the backend
	    // storage library.
	    function bufferToString(buffer) {
	        // base64-arraybuffer
	        var bytes = new Uint8Array(buffer);
	        var base64String = '';
	        var i;

	        for (i = 0; i < bytes.length; i += 3) {
	            /*jslint bitwise: true */
	            base64String += BASE_CHARS[bytes[i] >> 2];
	            base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
	            base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
	            base64String += BASE_CHARS[bytes[i + 2] & 63];
	        }

	        if (bytes.length % 3 === 2) {
	            base64String = base64String.substring(0, base64String.length - 1) + '=';
	        } else if (bytes.length % 3 === 1) {
	            base64String = base64String.substring(0, base64String.length - 2) + '==';
	        }

	        return base64String;
	    }

	    var localforageSerializer = {
	        serialize: serialize,
	        deserialize: deserialize,
	        stringToBuffer: stringToBuffer,
	        bufferToString: bufferToString
	    };

	    exports['default'] = localforageSerializer;
	}).call(typeof window !== 'undefined' ? window : self);
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Includes code from:
	 *
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	'use strict';

	exports.__esModule = true;
	(function () {
	    'use strict';

	    var globalObject = this;
	    var openDatabase = this.openDatabase;

	    // If WebSQL methods aren't available, we can stop now.
	    if (!openDatabase) {
	        return;
	    }

	    // Open the WebSQL database (automatically creates one if one didn't
	    // previously exist), using any options set in the config.
	    function _initStorage(options) {
	        var self = this;
	        var dbInfo = {
	            db: null
	        };

	        if (options) {
	            for (var i in options) {
	                dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
	            }
	        }

	        var dbInfoPromise = new Promise(function (resolve, reject) {
	            // Open the database; the openDatabase API will automatically
	            // create it for us if it doesn't exist.
	            try {
	                dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
	            } catch (e) {
	                return self.setDriver(self.LOCALSTORAGE).then(function () {
	                    return self._initStorage(options);
	                }).then(resolve)['catch'](reject);
	            }

	            // Create our key/value table if it doesn't exist.
	            dbInfo.db.transaction(function (t) {
	                t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' (id INTEGER PRIMARY KEY, key unique, value)', [], function () {
	                    self._dbInfo = dbInfo;
	                    resolve();
	                }, function (t, error) {
	                    reject(error);
	                });
	            });
	        });

	        return new Promise(function (resolve, reject) {
	            resolve(__webpack_require__(3));
	        }).then(function (lib) {
	            dbInfo.serializer = lib;
	            return dbInfoPromise;
	        });
	    }

	    function getItem(key, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                dbInfo.db.transaction(function (t) {
	                    t.executeSql('SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
	                        var result = results.rows.length ? results.rows.item(0).value : null;

	                        // Check to see if this is serialized content we need to
	                        // unpack.
	                        if (result) {
	                            result = dbInfo.serializer.deserialize(result);
	                        }

	                        resolve(result);
	                    }, function (t, error) {

	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function iterate(iterator, callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;

	                dbInfo.db.transaction(function (t) {
	                    t.executeSql('SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
	                        var rows = results.rows;
	                        var length = rows.length;

	                        for (var i = 0; i < length; i++) {
	                            var item = rows.item(i);
	                            var result = item.value;

	                            // Check to see if this is serialized content
	                            // we need to unpack.
	                            if (result) {
	                                result = dbInfo.serializer.deserialize(result);
	                            }

	                            result = iterator(result, item.key, i + 1);

	                            // void(0) prevents problems with redefinition
	                            // of `undefined`.
	                            if (result !== void 0) {
	                                resolve(result);
	                                return;
	                            }
	                        }

	                        resolve();
	                    }, function (t, error) {
	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function setItem(key, value, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                // The localStorage API doesn't return undefined values in an
	                // "expected" way, so undefined is always cast to null in all
	                // drivers. See: https://github.com/mozilla/localForage/pull/42
	                if (value === undefined) {
	                    value = null;
	                }

	                // Save the original value to pass to the callback.
	                var originalValue = value;

	                var dbInfo = self._dbInfo;
	                dbInfo.serializer.serialize(value, function (value, error) {
	                    if (error) {
	                        reject(error);
	                    } else {
	                        dbInfo.db.transaction(function (t) {
	                            t.executeSql('INSERT OR REPLACE INTO ' + dbInfo.storeName + ' (key, value) VALUES (?, ?)', [key, value], function () {
	                                resolve(originalValue);
	                            }, function (t, error) {
	                                reject(error);
	                            });
	                        }, function (sqlError) {
	                            // The transaction failed; check
	                            // to see if it's a quota error.
	                            if (sqlError.code === sqlError.QUOTA_ERR) {
	                                // We reject the callback outright for now, but
	                                // it's worth trying to re-run the transaction.
	                                // Even if the user accepts the prompt to use
	                                // more storage on Safari, this error will
	                                // be called.
	                                //
	                                // TODO: Try to re-run the transaction.
	                                reject(sqlError);
	                            }
	                        });
	                    }
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function removeItem(key, callback) {
	        var self = this;

	        // Cast the key to a string, as that's all we can set as a key.
	        if (typeof key !== 'string') {
	            globalObject.console.warn(key + ' used as a key, but it is not a string.');
	            key = String(key);
	        }

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                dbInfo.db.transaction(function (t) {
	                    t.executeSql('DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
	                        resolve();
	                    }, function (t, error) {

	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Deletes every item in the table.
	    // TODO: Find out if this resets the AUTO_INCREMENT number.
	    function clear(callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                dbInfo.db.transaction(function (t) {
	                    t.executeSql('DELETE FROM ' + dbInfo.storeName, [], function () {
	                        resolve();
	                    }, function (t, error) {
	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Does a simple `COUNT(key)` to get the number of items stored in
	    // localForage.
	    function length(callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                dbInfo.db.transaction(function (t) {
	                    // Ahhh, SQL makes this one soooooo easy.
	                    t.executeSql('SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
	                        var result = results.rows.item(0).c;

	                        resolve(result);
	                    }, function (t, error) {

	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    // Return the key located at key index X; essentially gets the key from a
	    // `WHERE id = ?`. This is the most efficient way I can think to implement
	    // this rarely-used (in my experience) part of the API, but it can seem
	    // inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
	    // the ID of each key will change every time it's updated. Perhaps a stored
	    // procedure for the `setItem()` SQL would solve this problem?
	    // TODO: Don't change ID on `setItem()`.
	    function key(n, callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                dbInfo.db.transaction(function (t) {
	                    t.executeSql('SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
	                        var result = results.rows.length ? results.rows.item(0).key : null;
	                        resolve(result);
	                    }, function (t, error) {
	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function keys(callback) {
	        var self = this;

	        var promise = new Promise(function (resolve, reject) {
	            self.ready().then(function () {
	                var dbInfo = self._dbInfo;
	                dbInfo.db.transaction(function (t) {
	                    t.executeSql('SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
	                        var keys = [];

	                        for (var i = 0; i < results.rows.length; i++) {
	                            keys.push(results.rows.item(i).key);
	                        }

	                        resolve(keys);
	                    }, function (t, error) {

	                        reject(error);
	                    });
	                });
	            })['catch'](reject);
	        });

	        executeCallback(promise, callback);
	        return promise;
	    }

	    function executeCallback(promise, callback) {
	        if (callback) {
	            promise.then(function (result) {
	                callback(null, result);
	            }, function (error) {
	                callback(error);
	            });
	        }
	    }

	    var webSQLStorage = {
	        _driver: 'webSQLStorage',
	        _initStorage: _initStorage,
	        iterate: iterate,
	        getItem: getItem,
	        setItem: setItem,
	        removeItem: removeItem,
	        clear: clear,
	        length: length,
	        key: key,
	        keys: keys
	    };

	    exports['default'] = webSQLStorage;
	}).call(typeof window !== 'undefined' ? window : self);
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":1}],3:[function(require,module,exports){
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = getParsingFlags(from);
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function Locale() {
    }

    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && typeof module !== 'undefined' &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (typeof values === 'undefined') {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, values) {
        if (values !== null) {
            values.abbr = name;
            locales[name] = locales[name] || new Locale();
            locales[name].set(values);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function get_set__set (mom, unit, value) {
        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;

    var regexes = {};

    function isFunction (sth) {
        // https://github.com/moment/moment/issues/2325
        return typeof sth === 'function' &&
            Object.prototype.toString.call(sth) === '[object Function]';
    }


    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  matchWord);
    addRegexToken('MMMM', matchWord);

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m) {
        return this._months[m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m) {
        return this._monthsShort[m.month()];
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (firstTime) {
                warn(msg + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;

    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
        ['YYYY-DDD', /\d{4}-\d{3}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
        ['HH:mm', /(T| )\d\d:\d\d/],
        ['HH', /(T| )\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = from_string__isoRegex.exec(string);

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0];
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    // match[6] should be 'T' or space
                    config._f += (match[6] || ' ') + isoTimes[i][0];
                    break;
                }
            }
            if (string.match(matchOffset)) {
                config._f += 'Z';
            }
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', false);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var week1Jan = 6 + firstDayOfWeek - firstDayOfWeekOfYear, janX = createUTCDate(year, 0, 1 + week1Jan), d = janX.getUTCDay(), dayOfYear;
        if (d < firstDayOfWeek) {
            d += 7;
        }

        weekday = weekday != null ? 1 * weekday : firstDayOfWeek;

        dayOfYear = 1 + week1Jan + 7 * (week - 1) - d + weekday;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
        }
        return [now.getFullYear(), now.getMonth(), now.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             return other < this ? this : other;
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            return other > this ? this : other;
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchOffset);
    addRegexToken('ZZ', matchOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(string) {
        var matches = ((string || '').match(matchOffset) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(+res._d + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(input);
            }
            if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (typeof this._isDSTShifted !== 'undefined') {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return !this._isUTC;
    }

    function isUtcOffset () {
        return this._isUTC;
    }

    function isUtc () {
        return this._isUTC && this._offset === 0;
    }

    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = create__isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                d : parseIso(match[4], sign),
                h : parseIso(match[5], sign),
                m : parseIso(match[6], sign),
                s : parseIso(match[7], sign),
                w : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
        return this.format(formats && formats[format] || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this > +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return inputMs < +this.clone().startOf(units);
        }
    }

    function isBefore (input, units) {
        var inputMs;
        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this < +input;
        } else {
            inputMs = isMoment(input) ? +input : +local__createLocal(input);
            return +this.clone().endOf(units) < inputMs;
        }
    }

    function isBetween (from, to, units) {
        return this.isAfter(from, units) && this.isBefore(to, units);
    }

    function isSame (input, units) {
        var inputMs;
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            input = isMoment(input) ? input : local__createLocal(input);
            return +this === +input;
        } else {
            inputMs = +local__createLocal(input);
            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
        }
    }

    function diff (input, units, asFloat) {
        var that = cloneWithOffset(input, this),
            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
            delta, output;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        return -(wholeMonthDiff + adjust);
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if ('function' === typeof Date.prototype.toISOString) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return +this._d - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(+this / 1000);
    }

    function toDate () {
        return this._offset ? new Date(+this) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // HELPERS

    function weeksInYear(year, dow, doy) {
        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    // MOMENTS

    function getSetWeekYear (input) {
        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getSetISOWeekYear (input) {
        var year = weekOfYear(this, 1, 4).year;
        return input == null ? year : this.add((input - year), 'y');
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    addFormatToken('Q', 0, 0, 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   matchWord);
    addRegexToken('ddd',  matchWord);
    addRegexToken('dddd', matchWord);

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
        var weekday = config._locale.weekdaysParse(input);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m) {
        return this._weekdays[m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function localeWeekdaysParse (weekdayName) {
        var i, mom, regex;

        this._weekdaysParse = this._weekdaysParse || [];

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            if (!this._weekdaysParse[i]) {
                mom = local__createLocal([2000, 1]).day(i);
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, function () {
        return this.hours() % 12 || 12;
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add          = add_subtract__add;
    momentPrototype__proto.calendar     = moment_calendar__calendar;
    momentPrototype__proto.clone        = clone;
    momentPrototype__proto.diff         = diff;
    momentPrototype__proto.endOf        = endOf;
    momentPrototype__proto.format       = format;
    momentPrototype__proto.from         = from;
    momentPrototype__proto.fromNow      = fromNow;
    momentPrototype__proto.to           = to;
    momentPrototype__proto.toNow        = toNow;
    momentPrototype__proto.get          = getSet;
    momentPrototype__proto.invalidAt    = invalidAt;
    momentPrototype__proto.isAfter      = isAfter;
    momentPrototype__proto.isBefore     = isBefore;
    momentPrototype__proto.isBetween    = isBetween;
    momentPrototype__proto.isSame       = isSame;
    momentPrototype__proto.isValid      = moment_valid__isValid;
    momentPrototype__proto.lang         = lang;
    momentPrototype__proto.locale       = locale;
    momentPrototype__proto.localeData   = localeData;
    momentPrototype__proto.max          = prototypeMax;
    momentPrototype__proto.min          = prototypeMin;
    momentPrototype__proto.parsingFlags = parsingFlags;
    momentPrototype__proto.set          = getSet;
    momentPrototype__proto.startOf      = startOf;
    momentPrototype__proto.subtract     = add_subtract__subtract;
    momentPrototype__proto.toArray      = toArray;
    momentPrototype__proto.toObject     = toObject;
    momentPrototype__proto.toDate       = toDate;
    momentPrototype__proto.toISOString  = moment_format__toISOString;
    momentPrototype__proto.toJSON       = moment_format__toISOString;
    momentPrototype__proto.toString     = toString;
    momentPrototype__proto.unix         = unix;
    momentPrototype__proto.valueOf      = to_type__valueOf;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return typeof output === 'function' ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (typeof output === 'function') ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (typeof prop === 'function') {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months       =        localeMonths;
    prototype__proto._months      = defaultLocaleMonths;
    prototype__proto.monthsShort  =        localeMonthsShort;
    prototype__proto._monthsShort = defaultLocaleMonthsShort;
    prototype__proto.monthsParse  =        localeMonthsParse;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function list (format, index, field, count, setter) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, setter);
        }

        var i;
        var out = [];
        for (i = 0; i < count; i++) {
            out[i] = lists__get(format, i, field, setter);
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return list(format, index, 'months', 12, 'month');
    }

    function lists__listMonthsShort (format, index) {
        return list(format, index, 'monthsShort', 12, 'month');
    }

    function lists__listWeekdays (format, index) {
        return list(format, index, 'weekdays', 7, 'day');
    }

    function lists__listWeekdaysShort (format, index) {
        return list(format, index, 'weekdaysShort', 7, 'day');
    }

    function lists__listWeekdaysMin (format, index) {
        return list(format, index, 'weekdaysMin', 7, 'day');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes === 1          && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   === 1          && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    === 1          && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  === 1          && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   === 1          && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.10.6';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
},{}],4:[function(require,module,exports){
(function(){

	var localforage = require("localforage"),
		moment = require("moment");

	var categoriasQueSigo,
		horaUltimaNotificacao;

	var init = function()
	{
		localforage.getItem("categoriasQueSigo", function(valueC) {
            categoriasQueSigo = valueC || [];

            localforage.getItem("horaUltimaNotificacao", function(valueH){
            	horaUltimaNotificacao = valueH;
            });            

			if (horaUltimaNotificacao) {
				horaUltimaNotificacao = moment(horaUltimaNotificacao);
			}

			initLoop();
        });
	};

	var checkNewPosts = function() {
		importScripts('https://melanke-test.blogspot.com.br/feeds/posts/default/?alt=json&max-results=10&callback=cb');
	};

	self.cb = function(data){
	    
		for (var i in data.feed.entry) {
			var post = data.feed.entry[i];	

			if (!horaUltimaNotificacao || horaUltimaNotificacao.isBefore(post.published.$t)) {

				for (var j in post.category) {
					var category = post.category[j];

					if (categoriasQueSigo.indexOf(category.term) > -1) {
						existeNova(post, category.term);
						break; //uma notificação por vez
					}
				}

			}
		}

	};

	var existeNova = function(post, categoria)
	{
		horaUltimaNotificacao = moment();
		localforage.setItem("horaUltimaNotificacao", horaUltimaNotificacao.format());

		showNotification(post.title.$t, "Novo post em \""+categoria+"\"");
	};

	var showNotification = function(titulo, descricao) {
		self.registration.showNotification(titulo, {  
	      body: descricao,  
	      icon: "https://cdn.rawgit.com/melanke/ulige/master/imgs/logo.png"
	    });
	};

	var initLoop = function()
	{
		//a cada 5 minutos
		//setInterval(checkNewPosts, 5 * 60 * 1000);
		checkNewPosts();
	};

	init();

})();
},{"localforage":2,"moment":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2xvY2FsZm9yYWdlL2Rpc3QvbG9jYWxmb3JhZ2UuanMiLCJub2RlX21vZHVsZXMvbW9tZW50L21vbWVudC5qcyIsInNyYy9qcy93b3JrZXIvbG9jYWxub3RpZmljYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMW5HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiFcbiAgICBsb2NhbEZvcmFnZSAtLSBPZmZsaW5lIFN0b3JhZ2UsIEltcHJvdmVkXG4gICAgVmVyc2lvbiAxLjMuMVxuICAgIGh0dHBzOi8vbW96aWxsYS5naXRodWIuaW8vbG9jYWxGb3JhZ2VcbiAgICAoYykgMjAxMy0yMDE1IE1vemlsbGEsIEFwYWNoZSBMaWNlbnNlIDIuMFxuKi9cbihmdW5jdGlvbigpIHtcbnZhciBkZWZpbmUsIHJlcXVpcmVNb2R1bGUsIHJlcXVpcmUsIHJlcXVpcmVqcztcblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgcmVnaXN0cnkgPSB7fSwgc2VlbiA9IHt9O1xuXG4gIGRlZmluZSA9IGZ1bmN0aW9uKG5hbWUsIGRlcHMsIGNhbGxiYWNrKSB7XG4gICAgcmVnaXN0cnlbbmFtZV0gPSB7IGRlcHM6IGRlcHMsIGNhbGxiYWNrOiBjYWxsYmFjayB9O1xuICB9O1xuXG4gIHJlcXVpcmVqcyA9IHJlcXVpcmUgPSByZXF1aXJlTW9kdWxlID0gZnVuY3Rpb24obmFtZSkge1xuICByZXF1aXJlanMuX2Vha19zZWVuID0gcmVnaXN0cnk7XG5cbiAgICBpZiAoc2VlbltuYW1lXSkgeyByZXR1cm4gc2VlbltuYW1lXTsgfVxuICAgIHNlZW5bbmFtZV0gPSB7fTtcblxuICAgIGlmICghcmVnaXN0cnlbbmFtZV0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIG1vZHVsZSBcIiArIG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBtb2QgPSByZWdpc3RyeVtuYW1lXSxcbiAgICAgICAgZGVwcyA9IG1vZC5kZXBzLFxuICAgICAgICBjYWxsYmFjayA9IG1vZC5jYWxsYmFjayxcbiAgICAgICAgcmVpZmllZCA9IFtdLFxuICAgICAgICBleHBvcnRzO1xuXG4gICAgZm9yICh2YXIgaT0wLCBsPWRlcHMubGVuZ3RoOyBpPGw7IGkrKykge1xuICAgICAgaWYgKGRlcHNbaV0gPT09ICdleHBvcnRzJykge1xuICAgICAgICByZWlmaWVkLnB1c2goZXhwb3J0cyA9IHt9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlaWZpZWQucHVzaChyZXF1aXJlTW9kdWxlKHJlc29sdmUoZGVwc1tpXSkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBjYWxsYmFjay5hcHBseSh0aGlzLCByZWlmaWVkKTtcbiAgICByZXR1cm4gc2VlbltuYW1lXSA9IGV4cG9ydHMgfHwgdmFsdWU7XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlKGNoaWxkKSB7XG4gICAgICBpZiAoY2hpbGQuY2hhckF0KDApICE9PSAnLicpIHsgcmV0dXJuIGNoaWxkOyB9XG4gICAgICB2YXIgcGFydHMgPSBjaGlsZC5zcGxpdChcIi9cIik7XG4gICAgICB2YXIgcGFyZW50QmFzZSA9IG5hbWUuc3BsaXQoXCIvXCIpLnNsaWNlKDAsIC0xKTtcblxuICAgICAgZm9yICh2YXIgaT0wLCBsPXBhcnRzLmxlbmd0aDsgaTxsOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBwYXJ0c1tpXTtcblxuICAgICAgICBpZiAocGFydCA9PT0gJy4uJykgeyBwYXJlbnRCYXNlLnBvcCgpOyB9XG4gICAgICAgIGVsc2UgaWYgKHBhcnQgPT09ICcuJykgeyBjb250aW51ZTsgfVxuICAgICAgICBlbHNlIHsgcGFyZW50QmFzZS5wdXNoKHBhcnQpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXJlbnRCYXNlLmpvaW4oXCIvXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbmRlZmluZShcInByb21pc2UvYWxsXCIsIFxuICBbXCIuL3V0aWxzXCIsXCJleHBvcnRzXCJdLFxuICBmdW5jdGlvbihfX2RlcGVuZGVuY3kxX18sIF9fZXhwb3J0c19fKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLyogZ2xvYmFsIHRvU3RyaW5nICovXG5cbiAgICB2YXIgaXNBcnJheSA9IF9fZGVwZW5kZW5jeTFfXy5pc0FycmF5O1xuICAgIHZhciBpc0Z1bmN0aW9uID0gX19kZXBlbmRlbmN5MV9fLmlzRnVuY3Rpb247XG5cbiAgICAvKipcbiAgICAgIFJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gYWxsIHRoZSBnaXZlbiBwcm9taXNlcyBoYXZlIGJlZW5cbiAgICAgIGZ1bGZpbGxlZCwgb3IgcmVqZWN0ZWQgaWYgYW55IG9mIHRoZW0gYmVjb21lIHJlamVjdGVkLiBUaGUgcmV0dXJuIHByb21pc2VcbiAgICAgIGlzIGZ1bGZpbGxlZCB3aXRoIGFuIGFycmF5IHRoYXQgZ2l2ZXMgYWxsIHRoZSB2YWx1ZXMgaW4gdGhlIG9yZGVyIHRoZXkgd2VyZVxuICAgICAgcGFzc2VkIGluIHRoZSBgcHJvbWlzZXNgIGFycmF5IGFyZ3VtZW50LlxuXG4gICAgICBFeGFtcGxlOlxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcHJvbWlzZTEgPSBSU1ZQLnJlc29sdmUoMSk7XG4gICAgICB2YXIgcHJvbWlzZTIgPSBSU1ZQLnJlc29sdmUoMik7XG4gICAgICB2YXIgcHJvbWlzZTMgPSBSU1ZQLnJlc29sdmUoMyk7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbIHByb21pc2UxLCBwcm9taXNlMiwgcHJvbWlzZTMgXTtcblxuICAgICAgUlNWUC5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgICAgICAvLyBUaGUgYXJyYXkgaGVyZSB3b3VsZCBiZSBbIDEsIDIsIDMgXTtcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIElmIGFueSBvZiB0aGUgYHByb21pc2VzYCBnaXZlbiB0byBgUlNWUC5hbGxgIGFyZSByZWplY3RlZCwgdGhlIGZpcnN0IHByb21pc2VcbiAgICAgIHRoYXQgaXMgcmVqZWN0ZWQgd2lsbCBiZSBnaXZlbiBhcyBhbiBhcmd1bWVudCB0byB0aGUgcmV0dXJuZWQgcHJvbWlzZXMnc1xuICAgICAgcmVqZWN0aW9uIGhhbmRsZXIuIEZvciBleGFtcGxlOlxuXG4gICAgICBFeGFtcGxlOlxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcHJvbWlzZTEgPSBSU1ZQLnJlc29sdmUoMSk7XG4gICAgICB2YXIgcHJvbWlzZTIgPSBSU1ZQLnJlamVjdChuZXcgRXJyb3IoXCIyXCIpKTtcbiAgICAgIHZhciBwcm9taXNlMyA9IFJTVlAucmVqZWN0KG5ldyBFcnJvcihcIjNcIikpO1xuICAgICAgdmFyIHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgICAgIFJTVlAuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAgICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnMgYmVjYXVzZSB0aGVyZSBhcmUgcmVqZWN0ZWQgcHJvbWlzZXMhXG4gICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAvLyBlcnJvci5tZXNzYWdlID09PSBcIjJcIlxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBhbGxcbiAgICAgIEBmb3IgUlNWUFxuICAgICAgQHBhcmFtIHtBcnJheX0gcHJvbWlzZXNcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbFxuICAgICAgQHJldHVybiB7UHJvbWlzZX0gcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIGFsbCBgcHJvbWlzZXNgIGhhdmUgYmVlblxuICAgICAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuXG4gICAgKi9cbiAgICBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgUHJvbWlzZSA9IHRoaXM7XG5cbiAgICAgIGlmICghaXNBcnJheShwcm9taXNlcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byBhbGwuJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXSwgcmVtYWluaW5nID0gcHJvbWlzZXMubGVuZ3RoLFxuICAgICAgICBwcm9taXNlO1xuXG4gICAgICAgIGlmIChyZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKFtdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVyKGluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICByZXNvbHZlQWxsKGluZGV4LCB2YWx1ZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlc29sdmVBbGwoaW5kZXgsIHZhbHVlKSB7XG4gICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9taXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHByb21pc2UgPSBwcm9taXNlc1tpXTtcblxuICAgICAgICAgIGlmIChwcm9taXNlICYmIGlzRnVuY3Rpb24ocHJvbWlzZS50aGVuKSkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKHJlc29sdmVyKGkpLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlQWxsKGksIHByb21pc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX19leHBvcnRzX18uYWxsID0gYWxsO1xuICB9KTtcbmRlZmluZShcInByb21pc2UvYXNhcFwiLCBcbiAgW1wiZXhwb3J0c1wiXSxcbiAgZnVuY3Rpb24oX19leHBvcnRzX18pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgYnJvd3Nlckdsb2JhbCA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiB7fTtcbiAgICB2YXIgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgYnJvd3Nlckdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBsb2NhbCA9ICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykgPyBnbG9iYWwgOiAodGhpcyA9PT0gdW5kZWZpbmVkPyB3aW5kb3c6dGhpcyk7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gdXNlTmV4dFRpY2soKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9jYWwuc2V0VGltZW91dChmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdHVwbGUgPSBxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gdHVwbGVbMF0sIGFyZyA9IHR1cGxlWzFdO1xuICAgICAgICBjYWxsYmFjayhhcmcpO1xuICAgICAgfVxuICAgICAgcXVldWUgPSBbXTtcbiAgICB9XG5cbiAgICB2YXIgc2NoZWR1bGVGbHVzaDtcblxuICAgIC8vIERlY2lkZSB3aGF0IGFzeW5jIG1ldGhvZCB0byB1c2UgdG8gdHJpZ2dlcmluZyBwcm9jZXNzaW5nIG9mIHF1ZXVlZCBjYWxsYmFja3M6XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xuICAgIH0gZWxzZSBpZiAoQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gcXVldWUucHVzaChbY2FsbGJhY2ssIGFyZ10pO1xuICAgICAgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBJZiBsZW5ndGggaXMgMSwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIF9fZXhwb3J0c19fLmFzYXAgPSBhc2FwO1xuICB9KTtcbmRlZmluZShcInByb21pc2UvY29uZmlnXCIsIFxuICBbXCJleHBvcnRzXCJdLFxuICBmdW5jdGlvbihfX2V4cG9ydHNfXykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICBpbnN0cnVtZW50OiBmYWxzZVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjb25maWd1cmUobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGNvbmZpZ1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpZ1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBfX2V4cG9ydHNfXy5jb25maWcgPSBjb25maWc7XG4gICAgX19leHBvcnRzX18uY29uZmlndXJlID0gY29uZmlndXJlO1xuICB9KTtcbmRlZmluZShcInByb21pc2UvcG9seWZpbGxcIiwgXG4gIFtcIi4vcHJvbWlzZVwiLFwiLi91dGlsc1wiLFwiZXhwb3J0c1wiXSxcbiAgZnVuY3Rpb24oX19kZXBlbmRlbmN5MV9fLCBfX2RlcGVuZGVuY3kyX18sIF9fZXhwb3J0c19fKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLypnbG9iYWwgc2VsZiovXG4gICAgdmFyIFJTVlBQcm9taXNlID0gX19kZXBlbmRlbmN5MV9fLlByb21pc2U7XG4gICAgdmFyIGlzRnVuY3Rpb24gPSBfX2RlcGVuZGVuY3kyX18uaXNGdW5jdGlvbjtcblxuICAgIGZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICAgICAgdmFyIGxvY2FsO1xuXG4gICAgICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbG9jYWwgPSBnbG9iYWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCkge1xuICAgICAgICBsb2NhbCA9IHdpbmRvdztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsID0gc2VsZjtcbiAgICAgIH1cblxuICAgICAgdmFyIGVzNlByb21pc2VTdXBwb3J0ID0gXG4gICAgICAgIFwiUHJvbWlzZVwiIGluIGxvY2FsICYmXG4gICAgICAgIC8vIFNvbWUgb2YgdGhlc2UgbWV0aG9kcyBhcmUgbWlzc2luZyBmcm9tXG4gICAgICAgIC8vIEZpcmVmb3gvQ2hyb21lIGV4cGVyaW1lbnRhbCBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgXCJyZXNvbHZlXCIgaW4gbG9jYWwuUHJvbWlzZSAmJlxuICAgICAgICBcInJlamVjdFwiIGluIGxvY2FsLlByb21pc2UgJiZcbiAgICAgICAgXCJhbGxcIiBpbiBsb2NhbC5Qcm9taXNlICYmXG4gICAgICAgIFwicmFjZVwiIGluIGxvY2FsLlByb21pc2UgJiZcbiAgICAgICAgLy8gT2xkZXIgdmVyc2lvbiBvZiB0aGUgc3BlYyBoYWQgYSByZXNvbHZlciBvYmplY3RcbiAgICAgICAgLy8gYXMgdGhlIGFyZyByYXRoZXIgdGhhbiBhIGZ1bmN0aW9uXG4gICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcmVzb2x2ZTtcbiAgICAgICAgICBuZXcgbG9jYWwuUHJvbWlzZShmdW5jdGlvbihyKSB7IHJlc29sdmUgPSByOyB9KTtcbiAgICAgICAgICByZXR1cm4gaXNGdW5jdGlvbihyZXNvbHZlKTtcbiAgICAgICAgfSgpKTtcblxuICAgICAgaWYgKCFlczZQcm9taXNlU3VwcG9ydCkge1xuICAgICAgICBsb2NhbC5Qcm9taXNlID0gUlNWUFByb21pc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgX19leHBvcnRzX18ucG9seWZpbGwgPSBwb2x5ZmlsbDtcbiAgfSk7XG5kZWZpbmUoXCJwcm9taXNlL3Byb21pc2VcIiwgXG4gIFtcIi4vY29uZmlnXCIsXCIuL3V0aWxzXCIsXCIuL2FsbFwiLFwiLi9yYWNlXCIsXCIuL3Jlc29sdmVcIixcIi4vcmVqZWN0XCIsXCIuL2FzYXBcIixcImV4cG9ydHNcIl0sXG4gIGZ1bmN0aW9uKF9fZGVwZW5kZW5jeTFfXywgX19kZXBlbmRlbmN5Ml9fLCBfX2RlcGVuZGVuY3kzX18sIF9fZGVwZW5kZW5jeTRfXywgX19kZXBlbmRlbmN5NV9fLCBfX2RlcGVuZGVuY3k2X18sIF9fZGVwZW5kZW5jeTdfXywgX19leHBvcnRzX18pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgY29uZmlnID0gX19kZXBlbmRlbmN5MV9fLmNvbmZpZztcbiAgICB2YXIgY29uZmlndXJlID0gX19kZXBlbmRlbmN5MV9fLmNvbmZpZ3VyZTtcbiAgICB2YXIgb2JqZWN0T3JGdW5jdGlvbiA9IF9fZGVwZW5kZW5jeTJfXy5vYmplY3RPckZ1bmN0aW9uO1xuICAgIHZhciBpc0Z1bmN0aW9uID0gX19kZXBlbmRlbmN5Ml9fLmlzRnVuY3Rpb247XG4gICAgdmFyIG5vdyA9IF9fZGVwZW5kZW5jeTJfXy5ub3c7XG4gICAgdmFyIGFsbCA9IF9fZGVwZW5kZW5jeTNfXy5hbGw7XG4gICAgdmFyIHJhY2UgPSBfX2RlcGVuZGVuY3k0X18ucmFjZTtcbiAgICB2YXIgc3RhdGljUmVzb2x2ZSA9IF9fZGVwZW5kZW5jeTVfXy5yZXNvbHZlO1xuICAgIHZhciBzdGF0aWNSZWplY3QgPSBfX2RlcGVuZGVuY3k2X18ucmVqZWN0O1xuICAgIHZhciBhc2FwID0gX19kZXBlbmRlbmN5N19fLmFzYXA7XG5cbiAgICB2YXIgY291bnRlciA9IDA7XG5cbiAgICBjb25maWcuYXN5bmMgPSBhc2FwOyAvLyBkZWZhdWx0IGFzeW5jIGlzIGFzYXA7XG5cbiAgICBmdW5jdGlvbiBQcm9taXNlKHJlc29sdmVyKSB7XG4gICAgICBpZiAoIWlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFByb21pc2UpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGludm9rZVJlc29sdmVyKHJlc29sdmVyLCB0aGlzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZva2VSZXNvbHZlcihyZXNvbHZlciwgcHJvbWlzZSkge1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihyZXNvbHZlUHJvbWlzZSwgcmVqZWN0UHJvbWlzZSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmVqZWN0UHJvbWlzZShlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgICAgICB2YWx1ZSwgZXJyb3IsIHN1Y2NlZWRlZCwgZmFpbGVkO1xuXG4gICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YWx1ZSA9IGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IGU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gZGV0YWlsO1xuICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaGFuZGxlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICAgICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gRlVMRklMTEVEKSB7XG4gICAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBSRUpFQ1RFRCkge1xuICAgICAgICByZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIFNFQUxFRCAgICA9IDA7XG4gICAgdmFyIEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIFJFSkVDVEVEICA9IDI7XG5cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHBhcmVudC5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgbGVuZ3RoID0gc3Vic2NyaWJlcnMubGVuZ3RoO1xuXG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGhdID0gY2hpbGQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBGVUxGSUxMRURdID0gb25GdWxmaWxsbWVudDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwdWJsaXNoKHByb21pc2UsIHNldHRsZWQpIHtcbiAgICAgIHZhciBjaGlsZCwgY2FsbGJhY2ssIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnMsIGRldGFpbCA9IHByb21pc2UuX2RldGFpbDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICBjaGlsZCA9IHN1YnNjcmliZXJzW2ldO1xuICAgICAgICBjYWxsYmFjayA9IHN1YnNjcmliZXJzW2kgKyBzZXR0bGVkXTtcblxuICAgICAgICBpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBjaGlsZCwgY2FsbGJhY2ssIGRldGFpbCk7XG4gICAgICB9XG5cbiAgICAgIHByb21pc2UuX3N1YnNjcmliZXJzID0gbnVsbDtcbiAgICB9XG5cbiAgICBQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBQcm9taXNlLFxuXG4gICAgICBfc3RhdGU6IHVuZGVmaW5lZCxcbiAgICAgIF9kZXRhaWw6IHVuZGVmaW5lZCxcbiAgICAgIF9zdWJzY3JpYmVyczogdW5kZWZpbmVkLFxuXG4gICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG5cbiAgICAgICAgdmFyIHRoZW5Qcm9taXNlID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZnVuY3Rpb24oKSB7fSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlKSB7XG4gICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IGFyZ3VtZW50cztcbiAgICAgICAgICBjb25maWcuYXN5bmMoZnVuY3Rpb24gaW52b2tlUHJvbWlzZUNhbGxiYWNrKCkge1xuICAgICAgICAgICAgaW52b2tlQ2FsbGJhY2socHJvbWlzZS5fc3RhdGUsIHRoZW5Qcm9taXNlLCBjYWxsYmFja3NbcHJvbWlzZS5fc3RhdGUgLSAxXSwgcHJvbWlzZS5fZGV0YWlsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWJzY3JpYmUodGhpcywgdGhlblByb21pc2UsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGVuUHJvbWlzZTtcbiAgICAgIH0sXG5cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBQcm9taXNlLmFsbCA9IGFsbDtcbiAgICBQcm9taXNlLnJhY2UgPSByYWNlO1xuICAgIFByb21pc2UucmVzb2x2ZSA9IHN0YXRpY1Jlc29sdmU7XG4gICAgUHJvbWlzZS5yZWplY3QgPSBzdGF0aWNSZWplY3Q7XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgdmFyIHRoZW4gPSBudWxsLFxuICAgICAgcmVzb2x2ZWQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgICAgdGhlbiA9IHZhbHVlLnRoZW47XG5cbiAgICAgICAgICBpZiAoaXNGdW5jdGlvbih0aGVuKSkge1xuICAgICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgICAgaWYgKHJlc29sdmVkKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgICAgICAgIHJlc29sdmVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHZhbCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmdWxmaWxsKHByb21pc2UsIHZhbCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICBpZiAocmVzb2x2ZWQpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgICAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgIHJlamVjdChwcm9taXNlLCB2YWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKHJlc29sdmVkKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmICghaGFuZGxlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpKSB7XG4gICAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykgeyByZXR1cm47IH1cbiAgICAgIHByb21pc2UuX3N0YXRlID0gU0VBTEVEO1xuICAgICAgcHJvbWlzZS5fZGV0YWlsID0gdmFsdWU7XG5cbiAgICAgIGNvbmZpZy5hc3luYyhwdWJsaXNoRnVsZmlsbG1lbnQsIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykgeyByZXR1cm47IH1cbiAgICAgIHByb21pc2UuX3N0YXRlID0gU0VBTEVEO1xuICAgICAgcHJvbWlzZS5fZGV0YWlsID0gcmVhc29uO1xuXG4gICAgICBjb25maWcuYXN5bmMocHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHVibGlzaEZ1bGZpbGxtZW50KHByb21pc2UpIHtcbiAgICAgIHB1Ymxpc2gocHJvbWlzZSwgcHJvbWlzZS5fc3RhdGUgPSBGVUxGSUxMRUQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHB1Ymxpc2hSZWplY3Rpb24ocHJvbWlzZSkge1xuICAgICAgcHVibGlzaChwcm9taXNlLCBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEKTtcbiAgICB9XG5cbiAgICBfX2V4cG9ydHNfXy5Qcm9taXNlID0gUHJvbWlzZTtcbiAgfSk7XG5kZWZpbmUoXCJwcm9taXNlL3JhY2VcIiwgXG4gIFtcIi4vdXRpbHNcIixcImV4cG9ydHNcIl0sXG4gIGZ1bmN0aW9uKF9fZGVwZW5kZW5jeTFfXywgX19leHBvcnRzX18pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvKiBnbG9iYWwgdG9TdHJpbmcgKi9cbiAgICB2YXIgaXNBcnJheSA9IF9fZGVwZW5kZW5jeTFfXy5pc0FycmF5O1xuXG4gICAgLyoqXG4gICAgICBgUlNWUC5yYWNlYCBhbGxvd3MgeW91IHRvIHdhdGNoIGEgc2VyaWVzIG9mIHByb21pc2VzIGFuZCBhY3QgYXMgc29vbiBhcyB0aGVcbiAgICAgIGZpcnN0IHByb21pc2UgZ2l2ZW4gdG8gdGhlIGBwcm9taXNlc2AgYXJndW1lbnQgZnVsZmlsbHMgb3IgcmVqZWN0cy5cblxuICAgICAgRXhhbXBsZTpcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHByb21pc2UxID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmVzb2x2ZShcInByb21pc2UgMVwiKTtcbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgcHJvbWlzZTIgPSBuZXcgUlNWUC5Qcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXNvbHZlKFwicHJvbWlzZSAyXCIpO1xuICAgICAgICB9LCAxMDApO1xuICAgICAgfSk7XG5cbiAgICAgIFJTVlAucmFjZShbcHJvbWlzZTEsIHByb21pc2UyXSkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyByZXN1bHQgPT09IFwicHJvbWlzZSAyXCIgYmVjYXVzZSBpdCB3YXMgcmVzb2x2ZWQgYmVmb3JlIHByb21pc2UxXG4gICAgICAgIC8vIHdhcyByZXNvbHZlZC5cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIGBSU1ZQLnJhY2VgIGlzIGRldGVybWluaXN0aWMgaW4gdGhhdCBvbmx5IHRoZSBzdGF0ZSBvZiB0aGUgZmlyc3QgY29tcGxldGVkXG4gICAgICBwcm9taXNlIG1hdHRlcnMuIEZvciBleGFtcGxlLCBldmVuIGlmIG90aGVyIHByb21pc2VzIGdpdmVuIHRvIHRoZSBgcHJvbWlzZXNgXG4gICAgICBhcnJheSBhcmd1bWVudCBhcmUgcmVzb2x2ZWQsIGJ1dCB0aGUgZmlyc3QgY29tcGxldGVkIHByb21pc2UgaGFzIGJlY29tZVxuICAgICAgcmVqZWN0ZWQgYmVmb3JlIHRoZSBvdGhlciBwcm9taXNlcyBiZWNhbWUgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICAgICAgd2lsbCBiZWNvbWUgcmVqZWN0ZWQ6XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBwcm9taXNlMSA9IG5ldyBSU1ZQLlByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIHJlc29sdmUoXCJwcm9taXNlIDFcIik7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIHByb21pc2UyID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcInByb21pc2UgMlwiKSk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9KTtcblxuICAgICAgUlNWUC5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIENvZGUgaGVyZSBuZXZlciBydW5zIGJlY2F1c2UgdGhlcmUgYXJlIHJlamVjdGVkIHByb21pc2VzIVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09IFwicHJvbWlzZTJcIiBiZWNhdXNlIHByb21pc2UgMiBiZWNhbWUgcmVqZWN0ZWQgYmVmb3JlXG4gICAgICAgIC8vIHByb21pc2UgMSBiZWNhbWUgZnVsZmlsbGVkXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIHJhY2VcbiAgICAgIEBmb3IgUlNWUFxuICAgICAgQHBhcmFtIHtBcnJheX0gcHJvbWlzZXMgYXJyYXkgb2YgcHJvbWlzZXMgdG8gb2JzZXJ2ZVxuICAgICAgQHBhcmFtIHtTdHJpbmd9IGxhYmVsIG9wdGlvbmFsIHN0cmluZyBmb3IgZGVzY3JpYmluZyB0aGUgcHJvbWlzZSByZXR1cm5lZC5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IGJlY29tZXMgZnVsZmlsbGVkIHdpdGggdGhlIHZhbHVlIHRoZSBmaXJzdFxuICAgICAgY29tcGxldGVkIHByb21pc2VzIGlzIHJlc29sdmVkIHdpdGggaWYgdGhlIGZpcnN0IGNvbXBsZXRlZCBwcm9taXNlIHdhc1xuICAgICAgZnVsZmlsbGVkLCBvciByZWplY3RlZCB3aXRoIHRoZSByZWFzb24gdGhhdCB0aGUgZmlyc3QgY29tcGxldGVkIHByb21pc2VcbiAgICAgIHdhcyByZWplY3RlZCB3aXRoLlxuICAgICovXG4gICAgZnVuY3Rpb24gcmFjZShwcm9taXNlcykge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBQcm9taXNlID0gdGhpcztcblxuICAgICAgaWYgKCFpc0FycmF5KHByb21pc2VzKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW10sIHByb21pc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9taXNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHByb21pc2UgPSBwcm9taXNlc1tpXTtcblxuICAgICAgICAgIGlmIChwcm9taXNlICYmIHR5cGVvZiBwcm9taXNlLnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHByb21pc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX19leHBvcnRzX18ucmFjZSA9IHJhY2U7XG4gIH0pO1xuZGVmaW5lKFwicHJvbWlzZS9yZWplY3RcIiwgXG4gIFtcImV4cG9ydHNcIl0sXG4gIGZ1bmN0aW9uKF9fZXhwb3J0c19fKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgLyoqXG4gICAgICBgUlNWUC5yZWplY3RgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZWNvbWUgcmVqZWN0ZWQgd2l0aCB0aGUgcGFzc2VkXG4gICAgICBgcmVhc29uYC4gYFJTVlAucmVqZWN0YCBpcyBlc3NlbnRpYWxseSBzaG9ydGhhbmQgZm9yIHRoZSBmb2xsb3dpbmc6XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFJTVlAuUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEluc3RlYWQgb2Ygd3JpdGluZyB0aGUgYWJvdmUsIHlvdXIgY29kZSBub3cgc2ltcGx5IGJlY29tZXMgdGhlIGZvbGxvd2luZzpcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHByb21pc2UgPSBSU1ZQLnJlamVjdChuZXcgRXJyb3IoJ1dIT09QUycpKTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ1dIT09QUydcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgcmVqZWN0XG4gICAgICBAZm9yIFJTVlBcbiAgICAgIEBwYXJhbSB7QW55fSByZWFzb24gdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGguXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBpZGVudGlmeWluZyB0aGUgcmV0dXJuZWQgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB0aGF0IHdpbGwgYmVjb21lIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuXG4gICAgICBgcmVhc29uYC5cbiAgICAqL1xuICAgIGZ1bmN0aW9uIHJlamVjdChyZWFzb24pIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgUHJvbWlzZSA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX19leHBvcnRzX18ucmVqZWN0ID0gcmVqZWN0O1xuICB9KTtcbmRlZmluZShcInByb21pc2UvcmVzb2x2ZVwiLCBcbiAgW1wiZXhwb3J0c1wiXSxcbiAgZnVuY3Rpb24oX19leHBvcnRzX18pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiByZXNvbHZlKHZhbHVlKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IHRoaXMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgUHJvbWlzZSA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgX19leHBvcnRzX18ucmVzb2x2ZSA9IHJlc29sdmU7XG4gIH0pO1xuZGVmaW5lKFwicHJvbWlzZS91dGlsc1wiLCBcbiAgW1wiZXhwb3J0c1wiXSxcbiAgZnVuY3Rpb24oX19leHBvcnRzX18pIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBvYmplY3RPckZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiBpc0Z1bmN0aW9uKHgpIHx8ICh0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQXJyYXkoeCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICAgIH1cblxuICAgIC8vIERhdGUubm93IGlzIG5vdCBhdmFpbGFibGUgaW4gYnJvd3NlcnMgPCBJRTlcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9EYXRlL25vdyNDb21wYXRpYmlsaXR5XG4gICAgdmFyIG5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cblxuICAgIF9fZXhwb3J0c19fLm9iamVjdE9yRnVuY3Rpb24gPSBvYmplY3RPckZ1bmN0aW9uO1xuICAgIF9fZXhwb3J0c19fLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuICAgIF9fZXhwb3J0c19fLmlzQXJyYXkgPSBpc0FycmF5O1xuICAgIF9fZXhwb3J0c19fLm5vdyA9IG5vdztcbiAgfSk7XG5yZXF1aXJlTW9kdWxlKCdwcm9taXNlL3BvbHlmaWxsJykucG9seWZpbGwoKTtcbn0oKSk7KGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibG9jYWxmb3JhZ2VcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wibG9jYWxmb3JhZ2VcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cdGV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblx0ZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cblx0KGZ1bmN0aW9uICgpIHtcblx0ICAgICd1c2Ugc3RyaWN0JztcblxuXHQgICAgLy8gQ3VzdG9tIGRyaXZlcnMgYXJlIHN0b3JlZCBoZXJlIHdoZW4gYGRlZmluZURyaXZlcigpYCBpcyBjYWxsZWQuXG5cdCAgICAvLyBUaGV5IGFyZSBzaGFyZWQgYWNyb3NzIGFsbCBpbnN0YW5jZXMgb2YgbG9jYWxGb3JhZ2UuXG5cdCAgICB2YXIgQ3VzdG9tRHJpdmVycyA9IHt9O1xuXG5cdCAgICB2YXIgRHJpdmVyVHlwZSA9IHtcblx0ICAgICAgICBJTkRFWEVEREI6ICdhc3luY1N0b3JhZ2UnLFxuXHQgICAgICAgIExPQ0FMU1RPUkFHRTogJ2xvY2FsU3RvcmFnZVdyYXBwZXInLFxuXHQgICAgICAgIFdFQlNRTDogJ3dlYlNRTFN0b3JhZ2UnXG5cdCAgICB9O1xuXG5cdCAgICB2YXIgRGVmYXVsdERyaXZlck9yZGVyID0gW0RyaXZlclR5cGUuSU5ERVhFRERCLCBEcml2ZXJUeXBlLldFQlNRTCwgRHJpdmVyVHlwZS5MT0NBTFNUT1JBR0VdO1xuXG5cdCAgICB2YXIgTGlicmFyeU1ldGhvZHMgPSBbJ2NsZWFyJywgJ2dldEl0ZW0nLCAnaXRlcmF0ZScsICdrZXknLCAna2V5cycsICdsZW5ndGgnLCAncmVtb3ZlSXRlbScsICdzZXRJdGVtJ107XG5cblx0ICAgIHZhciBEZWZhdWx0Q29uZmlnID0ge1xuXHQgICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcblx0ICAgICAgICBkcml2ZXI6IERlZmF1bHREcml2ZXJPcmRlci5zbGljZSgpLFxuXHQgICAgICAgIG5hbWU6ICdsb2NhbGZvcmFnZScsXG5cdCAgICAgICAgLy8gRGVmYXVsdCBEQiBzaXplIGlzIF9KVVNUIFVOREVSXyA1TUIsIGFzIGl0J3MgdGhlIGhpZ2hlc3Qgc2l6ZVxuXHQgICAgICAgIC8vIHdlIGNhbiB1c2Ugd2l0aG91dCBhIHByb21wdC5cblx0ICAgICAgICBzaXplOiA0OTgwNzM2LFxuXHQgICAgICAgIHN0b3JlTmFtZTogJ2tleXZhbHVlcGFpcnMnLFxuXHQgICAgICAgIHZlcnNpb246IDEuMFxuXHQgICAgfTtcblxuXHQgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIEluZGV4ZWREQiBpcyBhdmFpbGFibGUgYW5kIGlmIGl0IGlzIHRoZSBsYXRlc3Rcblx0ICAgIC8vIGltcGxlbWVudGF0aW9uOyBpdCdzIG91ciBwcmVmZXJyZWQgYmFja2VuZCBsaWJyYXJ5LiBXZSB1c2UgXCJfc3BlY190ZXN0XCJcblx0ICAgIC8vIGFzIHRoZSBuYW1lIG9mIHRoZSBkYXRhYmFzZSBiZWNhdXNlIGl0J3Mgbm90IHRoZSBvbmUgd2UnbGwgb3BlcmF0ZSBvbixcblx0ICAgIC8vIGJ1dCBpdCdzIHVzZWZ1bCB0byBtYWtlIHN1cmUgaXRzIHVzaW5nIHRoZSByaWdodCBzcGVjLlxuXHQgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvMTI4XG5cdCAgICB2YXIgZHJpdmVyU3VwcG9ydCA9IChmdW5jdGlvbiAoc2VsZikge1xuXHQgICAgICAgIC8vIEluaXRpYWxpemUgSW5kZXhlZERCOyBmYWxsIGJhY2sgdG8gdmVuZG9yLXByZWZpeGVkIHZlcnNpb25zXG5cdCAgICAgICAgLy8gaWYgbmVlZGVkLlxuXHQgICAgICAgIHZhciBpbmRleGVkREIgPSBpbmRleGVkREIgfHwgc2VsZi5pbmRleGVkREIgfHwgc2VsZi53ZWJraXRJbmRleGVkREIgfHwgc2VsZi5tb3pJbmRleGVkREIgfHwgc2VsZi5PSW5kZXhlZERCIHx8IHNlbGYubXNJbmRleGVkREI7XG5cblx0ICAgICAgICB2YXIgcmVzdWx0ID0ge307XG5cblx0ICAgICAgICByZXN1bHRbRHJpdmVyVHlwZS5XRUJTUUxdID0gISFzZWxmLm9wZW5EYXRhYmFzZTtcblx0ICAgICAgICByZXN1bHRbRHJpdmVyVHlwZS5JTkRFWEVEREJdID0gISEoZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAvLyBXZSBtaW1pYyBQb3VjaERCIGhlcmU7IGp1c3QgVUEgdGVzdCBmb3IgU2FmYXJpICh3aGljaCwgYXMgb2Zcblx0ICAgICAgICAgICAgLy8gaU9TIDgvWW9zZW1pdGUsIGRvZXNuJ3QgcHJvcGVybHkgc3VwcG9ydCBJbmRleGVkREIpLlxuXHQgICAgICAgICAgICAvLyBJbmRleGVkREIgc3VwcG9ydCBpcyBicm9rZW4gYW5kIGRpZmZlcmVudCBmcm9tIEJsaW5rJ3MuXG5cdCAgICAgICAgICAgIC8vIFRoaXMgaXMgZmFzdGVyIHRoYW4gdGhlIHRlc3QgY2FzZSAoYW5kIGl0J3Mgc3luYyksIHNvIHdlIGp1c3Rcblx0ICAgICAgICAgICAgLy8gZG8gdGhpcy4gKlNJR0gqXG5cdCAgICAgICAgICAgIC8vIGh0dHA6Ly9ibC5vY2tzLm9yZy9ub2xhbmxhd3Nvbi9yYXcvYzgzZTkwMzllZGYyMjc4MDQ3ZTkvXG5cdCAgICAgICAgICAgIC8vXG5cdCAgICAgICAgICAgIC8vIFdlIHRlc3QgZm9yIG9wZW5EYXRhYmFzZSBiZWNhdXNlIElFIE1vYmlsZSBpZGVudGlmaWVzIGl0c2VsZlxuXHQgICAgICAgICAgICAvLyBhcyBTYWZhcmkuIE9oIHRoZSBsdWx6Li4uXG5cdCAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5vcGVuRGF0YWJhc2UgIT09ICd1bmRlZmluZWQnICYmIHNlbGYubmF2aWdhdG9yICYmIHNlbGYubmF2aWdhdG9yLnVzZXJBZ2VudCAmJiAvU2FmYXJpLy50ZXN0KHNlbGYubmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIS9DaHJvbWUvLnRlc3Qoc2VsZi5uYXZpZ2F0b3IudXNlckFnZW50KSkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXhlZERCICYmIHR5cGVvZiBpbmRleGVkREIub3BlbiA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHQgICAgICAgICAgICAgICAgLy8gU29tZSBTYW1zdW5nL0hUQyBBbmRyb2lkIDQuMC00LjMgZGV2aWNlc1xuXHQgICAgICAgICAgICAgICAgLy8gaGF2ZSBvbGRlciBJbmRleGVkREIgc3BlY3M7IGlmIHRoaXMgaXNuJ3QgYXZhaWxhYmxlXG5cdCAgICAgICAgICAgICAgICAvLyB0aGVpciBJbmRleGVkREIgaXMgdG9vIG9sZCBmb3IgdXMgdG8gdXNlLlxuXHQgICAgICAgICAgICAgICAgLy8gKFJlcGxhY2VzIHRoZSBvbnVwZ3JhZGVuZWVkZWQgdGVzdC4pXG5cdCAgICAgICAgICAgICAgICB0eXBlb2Ygc2VsZi5JREJLZXlSYW5nZSAhPT0gJ3VuZGVmaW5lZCc7XG5cdCAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0pKCk7XG5cblx0ICAgICAgICByZXN1bHRbRHJpdmVyVHlwZS5MT0NBTFNUT1JBR0VdID0gISEoZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB0cnkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYubG9jYWxTdG9yYWdlICYmICdzZXRJdGVtJyBpbiBzZWxmLmxvY2FsU3RvcmFnZSAmJiBzZWxmLmxvY2FsU3RvcmFnZS5zZXRJdGVtO1xuXHQgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9KSgpO1xuXG5cdCAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0ICAgIH0pKHRoaXMpO1xuXG5cdCAgICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFyZykge1xuXHQgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0ICAgIH07XG5cblx0ICAgIGZ1bmN0aW9uIGNhbGxXaGVuUmVhZHkobG9jYWxGb3JhZ2VJbnN0YW5jZSwgbGlicmFyeU1ldGhvZCkge1xuXHQgICAgICAgIGxvY2FsRm9yYWdlSW5zdGFuY2VbbGlicmFyeU1ldGhvZF0gPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBfYXJncyA9IGFyZ3VtZW50cztcblx0ICAgICAgICAgICAgcmV0dXJuIGxvY2FsRm9yYWdlSW5zdGFuY2UucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbEZvcmFnZUluc3RhbmNlW2xpYnJhcnlNZXRob2RdLmFwcGx5KGxvY2FsRm9yYWdlSW5zdGFuY2UsIF9hcmdzKTtcblx0ICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgfTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHQgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cblx0ICAgICAgICAgICAgaWYgKGFyZykge1xuXHQgICAgICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGFyZykge1xuXHQgICAgICAgICAgICAgICAgICAgIGlmIChhcmcuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNBcnJheShhcmdba2V5XSkpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJnW2tleV0uc2xpY2UoKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJnW2tleV07XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuXHQgICAgfVxuXG5cdCAgICBmdW5jdGlvbiBpc0xpYnJhcnlEcml2ZXIoZHJpdmVyTmFtZSkge1xuXHQgICAgICAgIGZvciAodmFyIGRyaXZlciBpbiBEcml2ZXJUeXBlKSB7XG5cdCAgICAgICAgICAgIGlmIChEcml2ZXJUeXBlLmhhc093blByb3BlcnR5KGRyaXZlcikgJiYgRHJpdmVyVHlwZVtkcml2ZXJdID09PSBkcml2ZXJOYW1lKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgIH1cblxuXHQgICAgdmFyIExvY2FsRm9yYWdlID0gKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBmdW5jdGlvbiBMb2NhbEZvcmFnZShvcHRpb25zKSB7XG5cdCAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMb2NhbEZvcmFnZSk7XG5cblx0ICAgICAgICAgICAgdGhpcy5JTkRFWEVEREIgPSBEcml2ZXJUeXBlLklOREVYRUREQjtcblx0ICAgICAgICAgICAgdGhpcy5MT0NBTFNUT1JBR0UgPSBEcml2ZXJUeXBlLkxPQ0FMU1RPUkFHRTtcblx0ICAgICAgICAgICAgdGhpcy5XRUJTUUwgPSBEcml2ZXJUeXBlLldFQlNRTDtcblxuXHQgICAgICAgICAgICB0aGlzLl9kZWZhdWx0Q29uZmlnID0gZXh0ZW5kKHt9LCBEZWZhdWx0Q29uZmlnKTtcblx0ICAgICAgICAgICAgdGhpcy5fY29uZmlnID0gZXh0ZW5kKHt9LCB0aGlzLl9kZWZhdWx0Q29uZmlnLCBvcHRpb25zKTtcblx0ICAgICAgICAgICAgdGhpcy5fZHJpdmVyU2V0ID0gbnVsbDtcblx0ICAgICAgICAgICAgdGhpcy5faW5pdERyaXZlciA9IG51bGw7XG5cdCAgICAgICAgICAgIHRoaXMuX3JlYWR5ID0gZmFsc2U7XG5cdCAgICAgICAgICAgIHRoaXMuX2RiSW5mbyA9IG51bGw7XG5cblx0ICAgICAgICAgICAgdGhpcy5fd3JhcExpYnJhcnlNZXRob2RzV2l0aFJlYWR5KCk7XG5cdCAgICAgICAgICAgIHRoaXMuc2V0RHJpdmVyKHRoaXMuX2NvbmZpZy5kcml2ZXIpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIC8vIFRoZSBhY3R1YWwgbG9jYWxGb3JhZ2Ugb2JqZWN0IHRoYXQgd2UgZXhwb3NlIGFzIGEgbW9kdWxlIG9yIHZpYSBhXG5cdCAgICAgICAgLy8gZ2xvYmFsLiBJdCdzIGV4dGVuZGVkIGJ5IHB1bGxpbmcgaW4gb25lIG9mIG91ciBvdGhlciBsaWJyYXJpZXMuXG5cblx0ICAgICAgICAvLyBTZXQgYW55IGNvbmZpZyB2YWx1ZXMgZm9yIGxvY2FsRm9yYWdlOyBjYW4gYmUgY2FsbGVkIGFueXRpbWUgYmVmb3JlXG5cdCAgICAgICAgLy8gdGhlIGZpcnN0IEFQSSBjYWxsIChlLmcuIGBnZXRJdGVtYCwgYHNldEl0ZW1gKS5cblx0ICAgICAgICAvLyBXZSBsb29wIHRocm91Z2ggb3B0aW9ucyBzbyB3ZSBkb24ndCBvdmVyd3JpdGUgZXhpc3RpbmcgY29uZmlnXG5cdCAgICAgICAgLy8gdmFsdWVzLlxuXG5cdCAgICAgICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmNvbmZpZyA9IGZ1bmN0aW9uIGNvbmZpZyhvcHRpb25zKSB7XG5cdCAgICAgICAgICAgIC8vIElmIHRoZSBvcHRpb25zIGFyZ3VtZW50IGlzIGFuIG9iamVjdCwgd2UgdXNlIGl0IHRvIHNldCB2YWx1ZXMuXG5cdCAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2UgcmV0dXJuIGVpdGhlciBhIHNwZWNpZmllZCBjb25maWcgdmFsdWUgb3IgYWxsXG5cdCAgICAgICAgICAgIC8vIGNvbmZpZyB2YWx1ZXMuXG5cdCAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcblx0ICAgICAgICAgICAgICAgIC8vIElmIGxvY2FsZm9yYWdlIGlzIHJlYWR5IGFuZCBmdWxseSBpbml0aWFsaXplZCwgd2UgY2FuJ3Qgc2V0XG5cdCAgICAgICAgICAgICAgICAvLyBhbnkgbmV3IGNvbmZpZ3VyYXRpb24gdmFsdWVzLiBJbnN0ZWFkLCB3ZSByZXR1cm4gYW4gZXJyb3IuXG5cdCAgICAgICAgICAgICAgICBpZiAodGhpcy5fcmVhZHkpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKFwiQ2FuJ3QgY2FsbCBjb25maWcoKSBhZnRlciBsb2NhbGZvcmFnZSBcIiArICdoYXMgYmVlbiB1c2VkLicpO1xuXHQgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcblx0ICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gJ3N0b3JlTmFtZScpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1tpXSA9IG9wdGlvbnNbaV0ucmVwbGFjZSgvXFxXL2csICdfJyk7XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29uZmlnW2ldID0gb3B0aW9uc1tpXTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgLy8gYWZ0ZXIgYWxsIGNvbmZpZyBvcHRpb25zIGFyZSBzZXQgYW5kXG5cdCAgICAgICAgICAgICAgICAvLyB0aGUgZHJpdmVyIG9wdGlvbiBpcyB1c2VkLCB0cnkgc2V0dGluZyBpdFxuXHQgICAgICAgICAgICAgICAgaWYgKCdkcml2ZXInIGluIG9wdGlvbnMgJiYgb3B0aW9ucy5kcml2ZXIpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLnNldERyaXZlcih0aGlzLl9jb25maWcuZHJpdmVyKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cdCAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnW29wdGlvbnNdO1xuXHQgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH07XG5cblx0ICAgICAgICAvLyBVc2VkIHRvIGRlZmluZSBhIGN1c3RvbSBkcml2ZXIsIHNoYXJlZCBhY3Jvc3MgYWxsIGluc3RhbmNlcyBvZlxuXHQgICAgICAgIC8vIGxvY2FsRm9yYWdlLlxuXG5cdCAgICAgICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLmRlZmluZURyaXZlciA9IGZ1bmN0aW9uIGRlZmluZURyaXZlcihkcml2ZXJPYmplY3QsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG5cdCAgICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IGRyaXZlck9iamVjdC5fZHJpdmVyO1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBjb21wbGlhbmNlRXJyb3IgPSBuZXcgRXJyb3IoJ0N1c3RvbSBkcml2ZXIgbm90IGNvbXBsaWFudDsgc2VlICcgKyAnaHR0cHM6Ly9tb3ppbGxhLmdpdGh1Yi5pby9sb2NhbEZvcmFnZS8jZGVmaW5lZHJpdmVyJyk7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWluZ0Vycm9yID0gbmV3IEVycm9yKCdDdXN0b20gZHJpdmVyIG5hbWUgYWxyZWFkeSBpbiB1c2U6ICcgKyBkcml2ZXJPYmplY3QuX2RyaXZlcik7XG5cblx0ICAgICAgICAgICAgICAgICAgICAvLyBBIGRyaXZlciBuYW1lIHNob3VsZCBiZSBkZWZpbmVkIGFuZCBub3Qgb3ZlcmxhcCB3aXRoIHRoZVxuXHQgICAgICAgICAgICAgICAgICAgIC8vIGxpYnJhcnktZGVmaW5lZCwgZGVmYXVsdCBkcml2ZXJzLlxuXHQgICAgICAgICAgICAgICAgICAgIGlmICghZHJpdmVyT2JqZWN0Ll9kcml2ZXIpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGNvbXBsaWFuY2VFcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKGlzTGlicmFyeURyaXZlcihkcml2ZXJPYmplY3QuX2RyaXZlcikpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5hbWluZ0Vycm9yKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgIHZhciBjdXN0b21Ecml2ZXJNZXRob2RzID0gTGlicmFyeU1ldGhvZHMuY29uY2F0KCdfaW5pdFN0b3JhZ2UnKTtcblx0ICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGN1c3RvbURyaXZlck1ldGhvZHMubGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1c3RvbURyaXZlck1ldGhvZCA9IGN1c3RvbURyaXZlck1ldGhvZHNbaV07XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3VzdG9tRHJpdmVyTWV0aG9kIHx8ICFkcml2ZXJPYmplY3RbY3VzdG9tRHJpdmVyTWV0aG9kXSB8fCB0eXBlb2YgZHJpdmVyT2JqZWN0W2N1c3RvbURyaXZlck1ldGhvZF0gIT09ICdmdW5jdGlvbicpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChjb21wbGlhbmNlRXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIHN1cHBvcnRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHQgICAgICAgICAgICAgICAgICAgIGlmICgnX3N1cHBvcnQnIGluIGRyaXZlck9iamVjdCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHJpdmVyT2JqZWN0Ll9zdXBwb3J0ICYmIHR5cGVvZiBkcml2ZXJPYmplY3QuX3N1cHBvcnQgPT09ICdmdW5jdGlvbicpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRQcm9taXNlID0gZHJpdmVyT2JqZWN0Ll9zdXBwb3J0KCk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdXBwb3J0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSghIWRyaXZlck9iamVjdC5fc3VwcG9ydCk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgICAgICBzdXBwb3J0UHJvbWlzZS50aGVuKGZ1bmN0aW9uIChzdXBwb3J0UmVzdWx0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGRyaXZlclN1cHBvcnRbZHJpdmVyTmFtZV0gPSBzdXBwb3J0UmVzdWx0O1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBDdXN0b21Ecml2ZXJzW2RyaXZlck5hbWVdID0gZHJpdmVyT2JqZWN0O1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cdCAgICAgICAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcblx0ICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH0pO1xuXG5cdCAgICAgICAgICAgIHByb21pc2UudGhlbihjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG5cdCAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgICAgIH07XG5cblx0ICAgICAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuZHJpdmVyID0gZnVuY3Rpb24gZHJpdmVyKCkge1xuXHQgICAgICAgICAgICByZXR1cm4gdGhpcy5fZHJpdmVyIHx8IG51bGw7XG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5nZXREcml2ZXIgPSBmdW5jdGlvbiBnZXREcml2ZXIoZHJpdmVyTmFtZSwgY2FsbGJhY2ssIGVycm9yQ2FsbGJhY2spIHtcblx0ICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXHQgICAgICAgICAgICB2YXIgZ2V0RHJpdmVyUHJvbWlzZSA9IChmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICBpZiAoaXNMaWJyYXJ5RHJpdmVyKGRyaXZlck5hbWUpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChkcml2ZXJOYW1lKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGNhc2Ugc2VsZi5JTkRFWEVEREI6XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoX193ZWJwYWNrX3JlcXVpcmVfXygxKSk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWxmLkxPQ0FMU1RPUkFHRTpcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfX3dlYnBhY2tfcmVxdWlyZV9fKDIpKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHNlbGYuV0VCU1FMOlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKF9fd2VicGFja19yZXF1aXJlX18oNCkpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChDdXN0b21Ecml2ZXJzW2RyaXZlck5hbWVdKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShDdXN0b21Ecml2ZXJzW2RyaXZlck5hbWVdKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignRHJpdmVyIG5vdCBmb3VuZC4nKSk7XG5cdCAgICAgICAgICAgIH0pKCk7XG5cblx0ICAgICAgICAgICAgZ2V0RHJpdmVyUHJvbWlzZS50aGVuKGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKTtcblx0ICAgICAgICAgICAgcmV0dXJuIGdldERyaXZlclByb21pc2U7XG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5nZXRTZXJpYWxpemVyID0gZnVuY3Rpb24gZ2V0U2VyaWFsaXplcihjYWxsYmFjaykge1xuXHQgICAgICAgICAgICB2YXIgc2VyaWFsaXplclByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgICAgICByZXNvbHZlKF9fd2VicGFja19yZXF1aXJlX18oMykpO1xuXHQgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgICAgICAgICAgICAgc2VyaWFsaXplclByb21pc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemVyUHJvbWlzZTtcblx0ICAgICAgICB9O1xuXG5cdCAgICAgICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24gcmVhZHkoY2FsbGJhY2spIHtcblx0ICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgICAgIHZhciBwcm9taXNlID0gc2VsZi5fZHJpdmVyU2V0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgaWYgKHNlbGYuX3JlYWR5ID09PSBudWxsKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBzZWxmLl9pbml0RHJpdmVyKCk7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9yZWFkeTtcblx0ICAgICAgICAgICAgfSk7XG5cblx0ICAgICAgICAgICAgcHJvbWlzZS50aGVuKGNhbGxiYWNrLCBjYWxsYmFjayk7XG5cdCAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgICAgIH07XG5cblx0ICAgICAgICBMb2NhbEZvcmFnZS5wcm90b3R5cGUuc2V0RHJpdmVyID0gZnVuY3Rpb24gc2V0RHJpdmVyKGRyaXZlcnMsIGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSB7XG5cdCAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgICAgICBpZiAoIWlzQXJyYXkoZHJpdmVycykpIHtcblx0ICAgICAgICAgICAgICAgIGRyaXZlcnMgPSBbZHJpdmVyc107XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICB2YXIgc3VwcG9ydGVkRHJpdmVycyA9IHRoaXMuX2dldFN1cHBvcnRlZERyaXZlcnMoZHJpdmVycyk7XG5cblx0ICAgICAgICAgICAgZnVuY3Rpb24gc2V0RHJpdmVyVG9Db25maWcoKSB7XG5cdCAgICAgICAgICAgICAgICBzZWxmLl9jb25maWcuZHJpdmVyID0gc2VsZi5kcml2ZXIoKTtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIGZ1bmN0aW9uIGluaXREcml2ZXIoc3VwcG9ydGVkRHJpdmVycykge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudERyaXZlckluZGV4ID0gMDtcblxuXHQgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRyaXZlclByb21pc2VMb29wKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudERyaXZlckluZGV4IDwgc3VwcG9ydGVkRHJpdmVycy5sZW5ndGgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcml2ZXJOYW1lID0gc3VwcG9ydGVkRHJpdmVyc1tjdXJyZW50RHJpdmVySW5kZXhdO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudERyaXZlckluZGV4Kys7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RiSW5mbyA9IG51bGw7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZWFkeSA9IG51bGw7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldERyaXZlcihkcml2ZXJOYW1lKS50aGVuKGZ1bmN0aW9uIChkcml2ZXIpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9leHRlbmQoZHJpdmVyKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXREcml2ZXJUb0NvbmZpZygpO1xuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBzZWxmLl9pbml0U3RvcmFnZShzZWxmLl9jb25maWcpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9yZWFkeTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pWydjYXRjaCddKGRyaXZlclByb21pc2VMb29wKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHNldERyaXZlclRvQ29uZmlnKCk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignTm8gYXZhaWxhYmxlIHN0b3JhZ2UgbWV0aG9kIGZvdW5kLicpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9kcml2ZXJTZXQgPSBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9kcml2ZXJTZXQ7XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRyaXZlclByb21pc2VMb29wKCk7XG5cdCAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gVGhlcmUgbWlnaHQgYmUgYSBkcml2ZXIgaW5pdGlhbGl6YXRpb24gaW4gcHJvZ3Jlc3Ncblx0ICAgICAgICAgICAgLy8gc28gd2FpdCBmb3IgaXQgdG8gZmluaXNoIGluIG9yZGVyIHRvIGF2b2lkIGEgcG9zc2libGVcblx0ICAgICAgICAgICAgLy8gcmFjZSBjb25kaXRpb24gdG8gc2V0IF9kYkluZm9cblx0ICAgICAgICAgICAgdmFyIG9sZERyaXZlclNldERvbmUgPSB0aGlzLl9kcml2ZXJTZXQgIT09IG51bGwgPyB0aGlzLl9kcml2ZXJTZXRbJ2NhdGNoJ10oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHQgICAgICAgICAgICB9KSA6IFByb21pc2UucmVzb2x2ZSgpO1xuXG5cdCAgICAgICAgICAgIHRoaXMuX2RyaXZlclNldCA9IG9sZERyaXZlclNldERvbmUudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgZHJpdmVyTmFtZSA9IHN1cHBvcnRlZERyaXZlcnNbMF07XG5cdCAgICAgICAgICAgICAgICBzZWxmLl9kYkluZm8gPSBudWxsO1xuXHQgICAgICAgICAgICAgICAgc2VsZi5fcmVhZHkgPSBudWxsO1xuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXREcml2ZXIoZHJpdmVyTmFtZSkudGhlbihmdW5jdGlvbiAoZHJpdmVyKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgc2VsZi5fZHJpdmVyID0gZHJpdmVyLl9kcml2ZXI7XG5cdCAgICAgICAgICAgICAgICAgICAgc2V0RHJpdmVyVG9Db25maWcoKTtcblx0ICAgICAgICAgICAgICAgICAgICBzZWxmLl93cmFwTGlicmFyeU1ldGhvZHNXaXRoUmVhZHkoKTtcblx0ICAgICAgICAgICAgICAgICAgICBzZWxmLl9pbml0RHJpdmVyID0gaW5pdERyaXZlcihzdXBwb3J0ZWREcml2ZXJzKTtcblx0ICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICBzZXREcml2ZXJUb0NvbmZpZygpO1xuXHQgICAgICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKCdObyBhdmFpbGFibGUgc3RvcmFnZSBtZXRob2QgZm91bmQuJyk7XG5cdCAgICAgICAgICAgICAgICBzZWxmLl9kcml2ZXJTZXQgPSBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fZHJpdmVyU2V0O1xuXHQgICAgICAgICAgICB9KTtcblxuXHQgICAgICAgICAgICB0aGlzLl9kcml2ZXJTZXQudGhlbihjYWxsYmFjaywgZXJyb3JDYWxsYmFjayk7XG5cdCAgICAgICAgICAgIHJldHVybiB0aGlzLl9kcml2ZXJTZXQ7XG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5zdXBwb3J0cyA9IGZ1bmN0aW9uIHN1cHBvcnRzKGRyaXZlck5hbWUpIHtcblx0ICAgICAgICAgICAgcmV0dXJuICEhZHJpdmVyU3VwcG9ydFtkcml2ZXJOYW1lXTtcblx0ICAgICAgICB9O1xuXG5cdCAgICAgICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLl9leHRlbmQgPSBmdW5jdGlvbiBfZXh0ZW5kKGxpYnJhcnlNZXRob2RzQW5kUHJvcGVydGllcykge1xuXHQgICAgICAgICAgICBleHRlbmQodGhpcywgbGlicmFyeU1ldGhvZHNBbmRQcm9wZXJ0aWVzKTtcblx0ICAgICAgICB9O1xuXG5cdCAgICAgICAgTG9jYWxGb3JhZ2UucHJvdG90eXBlLl9nZXRTdXBwb3J0ZWREcml2ZXJzID0gZnVuY3Rpb24gX2dldFN1cHBvcnRlZERyaXZlcnMoZHJpdmVycykge1xuXHQgICAgICAgICAgICB2YXIgc3VwcG9ydGVkRHJpdmVycyA9IFtdO1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZHJpdmVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRyaXZlck5hbWUgPSBkcml2ZXJzW2ldO1xuXHQgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3VwcG9ydHMoZHJpdmVyTmFtZSkpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzdXBwb3J0ZWREcml2ZXJzLnB1c2goZHJpdmVyTmFtZSk7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgcmV0dXJuIHN1cHBvcnRlZERyaXZlcnM7XG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5fd3JhcExpYnJhcnlNZXRob2RzV2l0aFJlYWR5ID0gZnVuY3Rpb24gX3dyYXBMaWJyYXJ5TWV0aG9kc1dpdGhSZWFkeSgpIHtcblx0ICAgICAgICAgICAgLy8gQWRkIGEgc3R1YiBmb3IgZWFjaCBkcml2ZXIgQVBJIG1ldGhvZCB0aGF0IGRlbGF5cyB0aGUgY2FsbCB0byB0aGVcblx0ICAgICAgICAgICAgLy8gY29ycmVzcG9uZGluZyBkcml2ZXIgbWV0aG9kIHVudGlsIGxvY2FsRm9yYWdlIGlzIHJlYWR5LiBUaGVzZSBzdHVic1xuXHQgICAgICAgICAgICAvLyB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBkcml2ZXIgbWV0aG9kcyBhcyBzb29uIGFzIHRoZSBkcml2ZXIgaXNcblx0ICAgICAgICAgICAgLy8gbG9hZGVkLCBzbyB0aGVyZSBpcyBubyBwZXJmb3JtYW5jZSBpbXBhY3QuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTGlicmFyeU1ldGhvZHMubGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIGNhbGxXaGVuUmVhZHkodGhpcywgTGlicmFyeU1ldGhvZHNbaV0pO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIExvY2FsRm9yYWdlLnByb3RvdHlwZS5jcmVhdGVJbnN0YW5jZSA9IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKG9wdGlvbnMpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhbEZvcmFnZShvcHRpb25zKTtcblx0ICAgICAgICB9O1xuXG5cdCAgICAgICAgcmV0dXJuIExvY2FsRm9yYWdlO1xuXHQgICAgfSkoKTtcblxuXHQgICAgdmFyIGxvY2FsRm9yYWdlID0gbmV3IExvY2FsRm9yYWdlKCk7XG5cblx0ICAgIGV4cG9ydHNbJ2RlZmF1bHQnXSA9IGxvY2FsRm9yYWdlO1xuXHR9KS5jYWxsKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogc2VsZik7XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKioqLyB9LFxuLyogMSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0Ly8gU29tZSBjb2RlIG9yaWdpbmFsbHkgZnJvbSBhc3luY19zdG9yYWdlLmpzIGluXG5cdC8vIFtHYWlhXShodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS1iMmcvZ2FpYSkuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRleHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXHQoZnVuY3Rpb24gKCkge1xuXHQgICAgJ3VzZSBzdHJpY3QnO1xuXG5cdCAgICB2YXIgZ2xvYmFsT2JqZWN0ID0gdGhpcztcblx0ICAgIC8vIEluaXRpYWxpemUgSW5kZXhlZERCOyBmYWxsIGJhY2sgdG8gdmVuZG9yLXByZWZpeGVkIHZlcnNpb25zIGlmIG5lZWRlZC5cblx0ICAgIHZhciBpbmRleGVkREIgPSBpbmRleGVkREIgfHwgdGhpcy5pbmRleGVkREIgfHwgdGhpcy53ZWJraXRJbmRleGVkREIgfHwgdGhpcy5tb3pJbmRleGVkREIgfHwgdGhpcy5PSW5kZXhlZERCIHx8IHRoaXMubXNJbmRleGVkREI7XG5cblx0ICAgIC8vIElmIEluZGV4ZWREQiBpc24ndCBhdmFpbGFibGUsIHdlIGdldCBvdXR0YSBoZXJlIVxuXHQgICAgaWYgKCFpbmRleGVkREIpIHtcblx0ICAgICAgICByZXR1cm47XG5cdCAgICB9XG5cblx0ICAgIHZhciBERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFID0gJ2xvY2FsLWZvcmFnZS1kZXRlY3QtYmxvYi1zdXBwb3J0Jztcblx0ICAgIHZhciBzdXBwb3J0c0Jsb2JzO1xuXHQgICAgdmFyIGRiQ29udGV4dHM7XG5cblx0ICAgIC8vIEFic3RyYWN0cyBjb25zdHJ1Y3RpbmcgYSBCbG9iIG9iamVjdCwgc28gaXQgYWxzbyB3b3JrcyBpbiBvbGRlclxuXHQgICAgLy8gYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBuYXRpdmUgQmxvYiBjb25zdHJ1Y3Rvci4gKGkuZS5cblx0ICAgIC8vIG9sZCBRdFdlYktpdCB2ZXJzaW9ucywgYXQgbGVhc3QpLlxuXHQgICAgZnVuY3Rpb24gX2NyZWF0ZUJsb2IocGFydHMsIHByb3BlcnRpZXMpIHtcblx0ICAgICAgICBwYXJ0cyA9IHBhcnRzIHx8IFtdO1xuXHQgICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuXHQgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgIHJldHVybiBuZXcgQmxvYihwYXJ0cywgcHJvcGVydGllcyk7XG5cdCAgICAgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgICAgICBpZiAoZS5uYW1lICE9PSAnVHlwZUVycm9yJykge1xuXHQgICAgICAgICAgICAgICAgdGhyb3cgZTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB2YXIgQmxvYkJ1aWxkZXIgPSBnbG9iYWxPYmplY3QuQmxvYkJ1aWxkZXIgfHwgZ2xvYmFsT2JqZWN0Lk1TQmxvYkJ1aWxkZXIgfHwgZ2xvYmFsT2JqZWN0Lk1vekJsb2JCdWlsZGVyIHx8IGdsb2JhbE9iamVjdC5XZWJLaXRCbG9iQnVpbGRlcjtcblx0ICAgICAgICAgICAgdmFyIGJ1aWxkZXIgPSBuZXcgQmxvYkJ1aWxkZXIoKTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMSkge1xuXHQgICAgICAgICAgICAgICAgYnVpbGRlci5hcHBlbmQocGFydHNbaV0pO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHJldHVybiBidWlsZGVyLmdldEJsb2IocHJvcGVydGllcy50eXBlKTtcblx0ICAgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIFRyYW5zZm9ybSBhIGJpbmFyeSBzdHJpbmcgdG8gYW4gYXJyYXkgYnVmZmVyLCBiZWNhdXNlIG90aGVyd2lzZVxuXHQgICAgLy8gd2VpcmQgc3R1ZmYgaGFwcGVucyB3aGVuIHlvdSB0cnkgdG8gd29yayB3aXRoIHRoZSBiaW5hcnkgc3RyaW5nIGRpcmVjdGx5LlxuXHQgICAgLy8gSXQgaXMga25vd24uXG5cdCAgICAvLyBGcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ5Njc2NDcvIChjb250aW51ZXMgb24gbmV4dCBsaW5lKVxuXHQgICAgLy8gZW5jb2RlLWRlY29kZS1pbWFnZS13aXRoLWJhc2U2NC1icmVha3MtaW1hZ2UgKDIwMTMtMDQtMjEpXG5cdCAgICBmdW5jdGlvbiBfYmluU3RyaW5nVG9BcnJheUJ1ZmZlcihiaW4pIHtcblx0ICAgICAgICB2YXIgbGVuZ3RoID0gYmluLmxlbmd0aDtcblx0ICAgICAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKGxlbmd0aCk7XG5cdCAgICAgICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1Zik7XG5cdCAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuXHQgICAgICAgICAgICBhcnJbaV0gPSBiaW4uY2hhckNvZGVBdChpKTtcblx0ICAgICAgICB9XG5cdCAgICAgICAgcmV0dXJuIGJ1Zjtcblx0ICAgIH1cblxuXHQgICAgLy8gRmV0Y2ggYSBibG9iIHVzaW5nIGFqYXguIFRoaXMgcmV2ZWFscyBidWdzIGluIENocm9tZSA8IDQzLlxuXHQgICAgLy8gRm9yIGRldGFpbHMgb24gYWxsIHRoaXMganVuazpcblx0ICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2xhbmxhd3Nvbi9zdGF0ZS1vZi1iaW5hcnktZGF0YS1pbi10aGUtYnJvd3NlciNyZWFkbWVcblx0ICAgIGZ1bmN0aW9uIF9ibG9iQWpheCh1cmwpIHtcblx0ICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdCAgICAgICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuXHQgICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblx0ICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cblx0ICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSAhPT0gNCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiB4aHIucmVzcG9uc2UsXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHhoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJylcblx0ICAgICAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIHJlamVjdCh7IHN0YXR1czogeGhyLnN0YXR1cywgcmVzcG9uc2U6IHhoci5yZXNwb25zZSB9KTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgeGhyLnNlbmQoKTtcblx0ICAgICAgICB9KTtcblx0ICAgIH1cblxuXHQgICAgLy9cblx0ICAgIC8vIERldGVjdCBibG9iIHN1cHBvcnQuIENocm9tZSBkaWRuJ3Qgc3VwcG9ydCBpdCB1bnRpbCB2ZXJzaW9uIDM4LlxuXHQgICAgLy8gSW4gdmVyc2lvbiAzNyB0aGV5IGhhZCBhIGJyb2tlbiB2ZXJzaW9uIHdoZXJlIFBOR3MgKGFuZCBwb3NzaWJseVxuXHQgICAgLy8gb3RoZXIgYmluYXJ5IHR5cGVzKSBhcmVuJ3Qgc3RvcmVkIGNvcnJlY3RseSwgYmVjYXVzZSB3aGVuIHlvdSBmZXRjaFxuXHQgICAgLy8gdGhlbSwgdGhlIGNvbnRlbnQgdHlwZSBpcyBhbHdheXMgbnVsbC5cblx0ICAgIC8vXG5cdCAgICAvLyBGdXJ0aGVybW9yZSwgdGhleSBoYXZlIHNvbWUgb3V0c3RhbmRpbmcgYnVncyB3aGVyZSBibG9icyBvY2Nhc2lvbmFsbHlcblx0ICAgIC8vIGFyZSByZWFkIGJ5IEZpbGVSZWFkZXIgYXMgbnVsbCwgb3IgYnkgYWpheCBhcyA0MDRzLlxuXHQgICAgLy9cblx0ICAgIC8vIFNhZGx5IHdlIHVzZSB0aGUgNDA0IGJ1ZyB0byBkZXRlY3QgdGhlIEZpbGVSZWFkZXIgYnVnLCBzbyBpZiB0aGV5XG5cdCAgICAvLyBnZXQgZml4ZWQgaW5kZXBlbmRlbnRseSBhbmQgcmVsZWFzZWQgaW4gZGlmZmVyZW50IHZlcnNpb25zIG9mIENocm9tZSxcblx0ICAgIC8vIHRoZW4gdGhlIGJ1ZyBjb3VsZCBjb21lIGJhY2suIFNvIGl0J3Mgd29ydGh3aGlsZSB0byB3YXRjaCB0aGVzZSBpc3N1ZXM6XG5cdCAgICAvLyA0MDQgYnVnOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9NDQ3OTE2XG5cdCAgICAvLyBGaWxlUmVhZGVyIGJ1ZzogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTQ0NzgzNlxuXHQgICAgLy9cblx0ICAgIGZ1bmN0aW9uIF9jaGVja0Jsb2JTdXBwb3J0V2l0aG91dENhY2hpbmcoaWRiKSB7XG5cdCAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgdmFyIGJsb2IgPSBfY3JlYXRlQmxvYihbJyddLCB7IHR5cGU6ICdpbWFnZS9wbmcnIH0pO1xuXHQgICAgICAgICAgICB2YXIgdHhuID0gaWRiLnRyYW5zYWN0aW9uKFtERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFXSwgJ3JlYWR3cml0ZScpO1xuXHQgICAgICAgICAgICB0eG4ub2JqZWN0U3RvcmUoREVURUNUX0JMT0JfU1VQUE9SVF9TVE9SRSkucHV0KGJsb2IsICdrZXknKTtcblx0ICAgICAgICAgICAgdHhuLm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBoYXZlIHRvIGRvIGl0IGluIGEgc2VwYXJhdGUgdHJhbnNhY3Rpb24sIGVsc2UgdGhlIGNvcnJlY3Rcblx0ICAgICAgICAgICAgICAgIC8vIGNvbnRlbnQgdHlwZSBpcyBhbHdheXMgcmV0dXJuZWRcblx0ICAgICAgICAgICAgICAgIHZhciBibG9iVHhuID0gaWRiLnRyYW5zYWN0aW9uKFtERVRFQ1RfQkxPQl9TVVBQT1JUX1NUT1JFXSwgJ3JlYWR3cml0ZScpO1xuXHQgICAgICAgICAgICAgICAgdmFyIGdldEJsb2JSZXEgPSBibG9iVHhuLm9iamVjdFN0b3JlKERFVEVDVF9CTE9CX1NVUFBPUlRfU1RPUkUpLmdldCgna2V5Jyk7XG5cdCAgICAgICAgICAgICAgICBnZXRCbG9iUmVxLm9uZXJyb3IgPSByZWplY3Q7XG5cdCAgICAgICAgICAgICAgICBnZXRCbG9iUmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uIChlKSB7XG5cblx0ICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmVkQmxvYiA9IGUudGFyZ2V0LnJlc3VsdDtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChzdG9yZWRCbG9iKTtcblxuXHQgICAgICAgICAgICAgICAgICAgIF9ibG9iQWpheCh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCEhKHJlcyAmJiByZXMudHlwZSA9PT0gJ2ltYWdlL3BuZycpKTtcblx0ICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG5cdCAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgIH0pWydjYXRjaCddKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBlcnJvciwgc28gYXNzdW1lIHVuc3VwcG9ydGVkXG5cdCAgICAgICAgfSk7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIF9jaGVja0Jsb2JTdXBwb3J0KGlkYikge1xuXHQgICAgICAgIGlmICh0eXBlb2Ygc3VwcG9ydHNCbG9icyA9PT0gJ2Jvb2xlYW4nKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc3VwcG9ydHNCbG9icyk7XG5cdCAgICAgICAgfVxuXHQgICAgICAgIHJldHVybiBfY2hlY2tCbG9iU3VwcG9ydFdpdGhvdXRDYWNoaW5nKGlkYikudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgICAgICAgICAgc3VwcG9ydHNCbG9icyA9IHZhbHVlO1xuXHQgICAgICAgICAgICByZXR1cm4gc3VwcG9ydHNCbG9icztcblx0ICAgICAgICB9KTtcblx0ICAgIH1cblxuXHQgICAgLy8gZW5jb2RlIGEgYmxvYiBmb3IgaW5kZXhlZGRiIGVuZ2luZXMgdGhhdCBkb24ndCBzdXBwb3J0IGJsb2JzXG5cdCAgICBmdW5jdGlvbiBfZW5jb2RlQmxvYihibG9iKSB7XG5cdCAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdCAgICAgICAgICAgIHJlYWRlci5vbmVycm9yID0gcmVqZWN0O1xuXHQgICAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24gKGUpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBiYXNlNjQgPSBidG9hKGUudGFyZ2V0LnJlc3VsdCB8fCAnJyk7XG5cdCAgICAgICAgICAgICAgICByZXNvbHZlKHtcblx0ICAgICAgICAgICAgICAgICAgICBfX2xvY2FsX2ZvcmFnZV9lbmNvZGVkX2Jsb2I6IHRydWUsXG5cdCAgICAgICAgICAgICAgICAgICAgZGF0YTogYmFzZTY0LFxuXHQgICAgICAgICAgICAgICAgICAgIHR5cGU6IGJsb2IudHlwZVxuXHQgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgIHJlYWRlci5yZWFkQXNCaW5hcnlTdHJpbmcoYmxvYik7XG5cdCAgICAgICAgfSk7XG5cdCAgICB9XG5cblx0ICAgIC8vIGRlY29kZSBhbiBlbmNvZGVkIGJsb2Jcblx0ICAgIGZ1bmN0aW9uIF9kZWNvZGVCbG9iKGVuY29kZWRCbG9iKSB7XG5cdCAgICAgICAgdmFyIGFycmF5QnVmZiA9IF9iaW5TdHJpbmdUb0FycmF5QnVmZmVyKGF0b2IoZW5jb2RlZEJsb2IuZGF0YSkpO1xuXHQgICAgICAgIHJldHVybiBfY3JlYXRlQmxvYihbYXJyYXlCdWZmXSwgeyB0eXBlOiBlbmNvZGVkQmxvYi50eXBlIH0pO1xuXHQgICAgfVxuXG5cdCAgICAvLyBpcyB0aGlzIG9uZSBvZiBvdXIgZmFuY3kgZW5jb2RlZCBibG9icz9cblx0ICAgIGZ1bmN0aW9uIF9pc0VuY29kZWRCbG9iKHZhbHVlKSB7XG5cdCAgICAgICAgcmV0dXJuIHZhbHVlICYmIHZhbHVlLl9fbG9jYWxfZm9yYWdlX2VuY29kZWRfYmxvYjtcblx0ICAgIH1cblxuXHQgICAgLy8gT3BlbiB0aGUgSW5kZXhlZERCIGRhdGFiYXNlIChhdXRvbWF0aWNhbGx5IGNyZWF0ZXMgb25lIGlmIG9uZSBkaWRuJ3Rcblx0ICAgIC8vIHByZXZpb3VzbHkgZXhpc3QpLCB1c2luZyBhbnkgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cblx0ICAgIGZ1bmN0aW9uIF9pbml0U3RvcmFnZShvcHRpb25zKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXHQgICAgICAgIHZhciBkYkluZm8gPSB7XG5cdCAgICAgICAgICAgIGRiOiBudWxsXG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIGlmIChvcHRpb25zKSB7XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuXHQgICAgICAgICAgICAgICAgZGJJbmZvW2ldID0gb3B0aW9uc1tpXTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIC8vIEluaXRpYWxpemUgYSBzaW5nbGV0b24gY29udGFpbmVyIGZvciBhbGwgcnVubmluZyBsb2NhbEZvcmFnZXMuXG5cdCAgICAgICAgaWYgKCFkYkNvbnRleHRzKSB7XG5cdCAgICAgICAgICAgIGRiQ29udGV4dHMgPSB7fTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgY29udGV4dCBvZiB0aGUgZGF0YWJhc2U7XG5cdCAgICAgICAgdmFyIGRiQ29udGV4dCA9IGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdO1xuXG5cdCAgICAgICAgLy8gLi4ub3IgY3JlYXRlIGEgbmV3IGNvbnRleHQuXG5cdCAgICAgICAgaWYgKCFkYkNvbnRleHQpIHtcblx0ICAgICAgICAgICAgZGJDb250ZXh0ID0ge1xuXHQgICAgICAgICAgICAgICAgLy8gUnVubmluZyBsb2NhbEZvcmFnZXMgc2hhcmluZyBhIGRhdGFiYXNlLlxuXHQgICAgICAgICAgICAgICAgZm9yYWdlczogW10sXG5cdCAgICAgICAgICAgICAgICAvLyBTaGFyZWQgZGF0YWJhc2UuXG5cdCAgICAgICAgICAgICAgICBkYjogbnVsbFxuXHQgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICAvLyBSZWdpc3RlciB0aGUgbmV3IGNvbnRleHQgaW4gdGhlIGdsb2JhbCBjb250YWluZXIuXG5cdCAgICAgICAgICAgIGRiQ29udGV4dHNbZGJJbmZvLm5hbWVdID0gZGJDb250ZXh0O1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIC8vIFJlZ2lzdGVyIGl0c2VsZiBhcyBhIHJ1bm5pbmcgbG9jYWxGb3JhZ2UgaW4gdGhlIGN1cnJlbnQgY29udGV4dC5cblx0ICAgICAgICBkYkNvbnRleHQuZm9yYWdlcy5wdXNoKHRoaXMpO1xuXG5cdCAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIHJlYWRpbmVzcyBvZiB0aGUgcmVsYXRlZCBsb2NhbEZvcmFnZXMuXG5cdCAgICAgICAgdmFyIHJlYWR5UHJvbWlzZXMgPSBbXTtcblxuXHQgICAgICAgIGZ1bmN0aW9uIGlnbm9yZUVycm9ycygpIHtcblx0ICAgICAgICAgICAgLy8gRG9uJ3QgaGFuZGxlIGVycm9ycyBoZXJlLFxuXHQgICAgICAgICAgICAvLyBqdXN0IG1ha2VzIHN1cmUgcmVsYXRlZCBsb2NhbEZvcmFnZXMgYXJlbid0IHBlbmRpbmcuXG5cdCAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRiQ29udGV4dC5mb3JhZ2VzLmxlbmd0aDsgaisrKSB7XG5cdCAgICAgICAgICAgIHZhciBmb3JhZ2UgPSBkYkNvbnRleHQuZm9yYWdlc1tqXTtcblx0ICAgICAgICAgICAgaWYgKGZvcmFnZSAhPT0gdGhpcykge1xuXHQgICAgICAgICAgICAgICAgLy8gRG9uJ3Qgd2FpdCBmb3IgaXRzZWxmLi4uXG5cdCAgICAgICAgICAgICAgICByZWFkeVByb21pc2VzLnB1c2goZm9yYWdlLnJlYWR5KClbJ2NhdGNoJ10oaWdub3JlRXJyb3JzKSk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICAvLyBUYWtlIGEgc25hcHNob3Qgb2YgdGhlIHJlbGF0ZWQgbG9jYWxGb3JhZ2VzLlxuXHQgICAgICAgIHZhciBmb3JhZ2VzID0gZGJDb250ZXh0LmZvcmFnZXMuc2xpY2UoMCk7XG5cblx0ICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBjb25uZWN0aW9uIHByb2Nlc3Mgb25seSB3aGVuXG5cdCAgICAgICAgLy8gYWxsIHRoZSByZWxhdGVkIGxvY2FsRm9yYWdlcyBhcmVuJ3QgcGVuZGluZy5cblx0ICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVhZHlQcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIGRiSW5mby5kYiA9IGRiQ29udGV4dC5kYjtcblx0ICAgICAgICAgICAgLy8gR2V0IHRoZSBjb25uZWN0aW9uIG9yIG9wZW4gYSBuZXcgb25lIHdpdGhvdXQgdXBncmFkZS5cblx0ICAgICAgICAgICAgcmV0dXJuIF9nZXRPcmlnaW5hbENvbm5lY3Rpb24oZGJJbmZvKTtcblx0ICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYikge1xuXHQgICAgICAgICAgICBkYkluZm8uZGIgPSBkYjtcblx0ICAgICAgICAgICAgaWYgKF9pc1VwZ3JhZGVOZWVkZWQoZGJJbmZvLCBzZWxmLl9kZWZhdWx0Q29uZmlnLnZlcnNpb24pKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBSZW9wZW4gdGhlIGRhdGFiYXNlIGZvciB1cGdyYWRpbmcuXG5cdCAgICAgICAgICAgICAgICByZXR1cm4gX2dldFVwZ3JhZGVkQ29ubmVjdGlvbihkYkluZm8pO1xuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgIHJldHVybiBkYjtcblx0ICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYikge1xuXHQgICAgICAgICAgICBkYkluZm8uZGIgPSBkYkNvbnRleHQuZGIgPSBkYjtcblx0ICAgICAgICAgICAgc2VsZi5fZGJJbmZvID0gZGJJbmZvO1xuXHQgICAgICAgICAgICAvLyBTaGFyZSB0aGUgZmluYWwgY29ubmVjdGlvbiBhbW9uZ3N0IHJlbGF0ZWQgbG9jYWxGb3JhZ2VzLlxuXHQgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGZvcmFnZXMubGVuZ3RoOyBrKyspIHtcblx0ICAgICAgICAgICAgICAgIHZhciBmb3JhZ2UgPSBmb3JhZ2VzW2tdO1xuXHQgICAgICAgICAgICAgICAgaWYgKGZvcmFnZSAhPT0gc2VsZikge1xuXHQgICAgICAgICAgICAgICAgICAgIC8vIFNlbGYgaXMgYWxyZWFkeSB1cC10by1kYXRlLlxuXHQgICAgICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLmRiID0gZGJJbmZvLmRiO1xuXHQgICAgICAgICAgICAgICAgICAgIGZvcmFnZS5fZGJJbmZvLnZlcnNpb24gPSBkYkluZm8udmVyc2lvbjtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0pO1xuXHQgICAgfVxuXG5cdCAgICBmdW5jdGlvbiBfZ2V0T3JpZ2luYWxDb25uZWN0aW9uKGRiSW5mbykge1xuXHQgICAgICAgIHJldHVybiBfZ2V0Q29ubmVjdGlvbihkYkluZm8sIGZhbHNlKTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gX2dldFVwZ3JhZGVkQ29ubmVjdGlvbihkYkluZm8pIHtcblx0ICAgICAgICByZXR1cm4gX2dldENvbm5lY3Rpb24oZGJJbmZvLCB0cnVlKTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gX2dldENvbm5lY3Rpb24oZGJJbmZvLCB1cGdyYWRlTmVlZGVkKSB7XG5cdCAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgaWYgKGRiSW5mby5kYikge1xuXHQgICAgICAgICAgICAgICAgaWYgKHVwZ3JhZGVOZWVkZWQpIHtcblx0ICAgICAgICAgICAgICAgICAgICBkYkluZm8uZGIuY2xvc2UoKTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGJJbmZvLmRiKTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHZhciBkYkFyZ3MgPSBbZGJJbmZvLm5hbWVdO1xuXG5cdCAgICAgICAgICAgIGlmICh1cGdyYWRlTmVlZGVkKSB7XG5cdCAgICAgICAgICAgICAgICBkYkFyZ3MucHVzaChkYkluZm8udmVyc2lvbik7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICB2YXIgb3BlbnJlcSA9IGluZGV4ZWREQi5vcGVuLmFwcGx5KGluZGV4ZWREQiwgZGJBcmdzKTtcblxuXHQgICAgICAgICAgICBpZiAodXBncmFkZU5lZWRlZCkge1xuXHQgICAgICAgICAgICAgICAgb3BlbnJlcS5vbnVwZ3JhZGVuZWVkZWQgPSBmdW5jdGlvbiAoZSkge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBkYiA9IG9wZW5yZXEucmVzdWx0O1xuXHQgICAgICAgICAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNyZWF0ZU9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5vbGRWZXJzaW9uIDw9IDEpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZGVkIHdoZW4gc3VwcG9ydCBmb3IgYmxvYiBzaGltcyB3YXMgYWRkZWRcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRiLmNyZWF0ZU9iamVjdFN0b3JlKERFVEVDVF9CTE9CX1NVUFBPUlRfU1RPUkUpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4Lm5hbWUgPT09ICdDb25zdHJhaW50RXJyb3InKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxPYmplY3QuY29uc29sZS53YXJuKCdUaGUgZGF0YWJhc2UgXCInICsgZGJJbmZvLm5hbWUgKyAnXCInICsgJyBoYXMgYmVlbiB1cGdyYWRlZCBmcm9tIHZlcnNpb24gJyArIGUub2xkVmVyc2lvbiArICcgdG8gdmVyc2lvbiAnICsgZS5uZXdWZXJzaW9uICsgJywgYnV0IHRoZSBzdG9yYWdlIFwiJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnXCIgYWxyZWFkeSBleGlzdHMuJyk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBleDtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICBvcGVucmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICByZWplY3Qob3BlbnJlcS5lcnJvcik7XG5cdCAgICAgICAgICAgIH07XG5cblx0ICAgICAgICAgICAgb3BlbnJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICByZXNvbHZlKG9wZW5yZXEucmVzdWx0KTtcblx0ICAgICAgICAgICAgfTtcblx0ICAgICAgICB9KTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gX2lzVXBncmFkZU5lZWRlZChkYkluZm8sIGRlZmF1bHRWZXJzaW9uKSB7XG5cdCAgICAgICAgaWYgKCFkYkluZm8uZGIpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIHRydWU7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgdmFyIGlzTmV3U3RvcmUgPSAhZGJJbmZvLmRiLm9iamVjdFN0b3JlTmFtZXMuY29udGFpbnMoZGJJbmZvLnN0b3JlTmFtZSk7XG5cdCAgICAgICAgdmFyIGlzRG93bmdyYWRlID0gZGJJbmZvLnZlcnNpb24gPCBkYkluZm8uZGIudmVyc2lvbjtcblx0ICAgICAgICB2YXIgaXNVcGdyYWRlID0gZGJJbmZvLnZlcnNpb24gPiBkYkluZm8uZGIudmVyc2lvbjtcblxuXHQgICAgICAgIGlmIChpc0Rvd25ncmFkZSkge1xuXHQgICAgICAgICAgICAvLyBJZiB0aGUgdmVyc2lvbiBpcyBub3QgdGhlIGRlZmF1bHQgb25lXG5cdCAgICAgICAgICAgIC8vIHRoZW4gd2FybiBmb3IgaW1wb3NzaWJsZSBkb3duZ3JhZGUuXG5cdCAgICAgICAgICAgIGlmIChkYkluZm8udmVyc2lvbiAhPT0gZGVmYXVsdFZlcnNpb24pIHtcblx0ICAgICAgICAgICAgICAgIGdsb2JhbE9iamVjdC5jb25zb2xlLndhcm4oJ1RoZSBkYXRhYmFzZSBcIicgKyBkYkluZm8ubmFtZSArICdcIicgKyAnIGNhblxcJ3QgYmUgZG93bmdyYWRlZCBmcm9tIHZlcnNpb24gJyArIGRiSW5mby5kYi52ZXJzaW9uICsgJyB0byB2ZXJzaW9uICcgKyBkYkluZm8udmVyc2lvbiArICcuJyk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgLy8gQWxpZ24gdGhlIHZlcnNpb25zIHRvIHByZXZlbnQgZXJyb3JzLlxuXHQgICAgICAgICAgICBkYkluZm8udmVyc2lvbiA9IGRiSW5mby5kYi52ZXJzaW9uO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIGlmIChpc1VwZ3JhZGUgfHwgaXNOZXdTdG9yZSkge1xuXHQgICAgICAgICAgICAvLyBJZiB0aGUgc3RvcmUgaXMgbmV3IHRoZW4gaW5jcmVtZW50IHRoZSB2ZXJzaW9uIChpZiBuZWVkZWQpLlxuXHQgICAgICAgICAgICAvLyBUaGlzIHdpbGwgdHJpZ2dlciBhbiBcInVwZ3JhZGVuZWVkZWRcIiBldmVudCB3aGljaCBpcyByZXF1aXJlZFxuXHQgICAgICAgICAgICAvLyBmb3IgY3JlYXRpbmcgYSBzdG9yZS5cblx0ICAgICAgICAgICAgaWYgKGlzTmV3U3RvcmUpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBpbmNWZXJzaW9uID0gZGJJbmZvLmRiLnZlcnNpb24gKyAxO1xuXHQgICAgICAgICAgICAgICAgaWYgKGluY1ZlcnNpb24gPiBkYkluZm8udmVyc2lvbikge1xuXHQgICAgICAgICAgICAgICAgICAgIGRiSW5mby52ZXJzaW9uID0gaW5jVmVyc2lvbjtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHJldHVybiBmYWxzZTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gZ2V0SXRlbShrZXksIGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG5cdCAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgIGdsb2JhbE9iamVjdC5jb25zb2xlLndhcm4oa2V5ICsgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuXHQgICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IGRiSW5mby5kYi50cmFuc2FjdGlvbihkYkluZm8uc3RvcmVOYW1lLCAncmVhZG9ubHknKS5vYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcblx0ICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5nZXQoa2V5KTtcblxuXHQgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByZXEucmVzdWx0O1xuXHQgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKF9pc0VuY29kZWRCbG9iKHZhbHVlKSkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9kZWNvZGVCbG9iKHZhbHVlKTtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG5cdCAgICAgICAgICAgICAgICB9O1xuXG5cdCAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcblx0ICAgICAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgIH0pWydjYXRjaCddKHJlamVjdCk7XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuXHQgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgfVxuXG5cdCAgICAvLyBJdGVyYXRlIG92ZXIgYWxsIGl0ZW1zIHN0b3JlZCBpbiBkYXRhYmFzZS5cblx0ICAgIGZ1bmN0aW9uIGl0ZXJhdGUoaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSBkYkluZm8uZGIudHJhbnNhY3Rpb24oZGJJbmZvLnN0b3JlTmFtZSwgJ3JlYWRvbmx5Jykub2JqZWN0U3RvcmUoZGJJbmZvLnN0b3JlTmFtZSk7XG5cblx0ICAgICAgICAgICAgICAgIHZhciByZXEgPSBzdG9yZS5vcGVuQ3Vyc29yKCk7XG5cdCAgICAgICAgICAgICAgICB2YXIgaXRlcmF0aW9uTnVtYmVyID0gMTtcblxuXHQgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgY3Vyc29yID0gcmVxLnJlc3VsdDtcblxuXHQgICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gY3Vyc29yLnZhbHVlO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2lzRW5jb2RlZEJsb2IodmFsdWUpKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IF9kZWNvZGVCbG9iKHZhbHVlKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IodmFsdWUsIGN1cnNvci5rZXksIGl0ZXJhdGlvbk51bWJlcisrKTtcblxuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB2b2lkIDApIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvclsnY29udGludWUnXSgpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH07XG5cblx0ICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gc2V0SXRlbShrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIC8vIENhc3QgdGhlIGtleSB0byBhIHN0cmluZywgYXMgdGhhdCdzIGFsbCB3ZSBjYW4gc2V0IGFzIGEga2V5LlxuXHQgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuXHQgICAgICAgICAgICBnbG9iYWxPYmplY3QuY29uc29sZS53YXJuKGtleSArICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcblx0ICAgICAgICAgICAga2V5ID0gU3RyaW5nKGtleSk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgIHZhciBkYkluZm87XG5cdCAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEJsb2IpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NoZWNrQmxvYlN1cHBvcnQoZGJJbmZvLmRiKS50aGVuKGZ1bmN0aW9uIChibG9iU3VwcG9ydCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxvYlN1cHBvcnQpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VuY29kZUJsb2IodmFsdWUpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuXHQgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgICAgICAgICAgICAgICAgdmFyIHRyYW5zYWN0aW9uID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsICdyZWFkd3JpdGUnKTtcblx0ICAgICAgICAgICAgICAgIHZhciBzdG9yZSA9IHRyYW5zYWN0aW9uLm9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBUaGUgcmVhc29uIHdlIGRvbid0IF9zYXZlXyBudWxsIGlzIGJlY2F1c2UgSUUgMTAgZG9lc1xuXHQgICAgICAgICAgICAgICAgLy8gbm90IHN1cHBvcnQgc2F2aW5nIHRoZSBgbnVsbGAgdHlwZSBpbiBJbmRleGVkREIuIEhvd1xuXHQgICAgICAgICAgICAgICAgLy8gaXJvbmljLCBnaXZlbiB0aGUgYnVnIGJlbG93IVxuXHQgICAgICAgICAgICAgICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9pc3N1ZXMvMTYxXG5cdCAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLnB1dCh2YWx1ZSwga2V5KTtcblx0ICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgLy8gQ2FzdCB0byB1bmRlZmluZWQgc28gdGhlIHZhbHVlIHBhc3NlZCB0b1xuXHQgICAgICAgICAgICAgICAgICAgIC8vIGNhbGxiYWNrL3Byb21pc2UgaXMgdGhlIHNhbWUgYXMgd2hhdCBvbmUgd291bGQgZ2V0IG91dFxuXHQgICAgICAgICAgICAgICAgICAgIC8vIG9mIGBnZXRJdGVtKClgIGxhdGVyLiBUaGlzIGxlYWRzIHRvIHNvbWUgd2VpcmRuZXNzXG5cdCAgICAgICAgICAgICAgICAgICAgLy8gKHNldEl0ZW0oJ2ZvbycsIHVuZGVmaW5lZCkgd2lsbCByZXR1cm4gYG51bGxgKSwgYnV0XG5cdCAgICAgICAgICAgICAgICAgICAgLy8gaXQncyBub3QgbXkgZmF1bHQgbG9jYWxTdG9yYWdlIGlzIG91ciBiYXNlbGluZSBhbmQgdGhhdFxuXHQgICAgICAgICAgICAgICAgICAgIC8vIGl0J3Mgd2VpcmQuXG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuXHQgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uLm9uYWJvcnQgPSB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXEuZXJyb3IgPyByZXEuZXJyb3IgOiByZXEudHJhbnNhY3Rpb24uZXJyb3I7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG5cdCAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICB9KVsnY2F0Y2gnXShyZWplY3QpO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gcmVtb3ZlSXRlbShrZXksIGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG5cdCAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgIGdsb2JhbE9iamVjdC5jb25zb2xlLndhcm4oa2V5ICsgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuXHQgICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIHZhciB0cmFuc2FjdGlvbiA9IGRiSW5mby5kYi50cmFuc2FjdGlvbihkYkluZm8uc3RvcmVOYW1lLCAncmVhZHdyaXRlJyk7XG5cdCAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSB0cmFuc2FjdGlvbi5vYmplY3RTdG9yZShkYkluZm8uc3RvcmVOYW1lKTtcblxuXHQgICAgICAgICAgICAgICAgLy8gV2UgdXNlIGEgR3J1bnQgdGFzayB0byBtYWtlIHRoaXMgc2FmZSBmb3IgSUUgYW5kIHNvbWVcblx0ICAgICAgICAgICAgICAgIC8vIHZlcnNpb25zIG9mIEFuZHJvaWQgKGluY2x1ZGluZyB0aG9zZSB1c2VkIGJ5IENvcmRvdmEpLlxuXHQgICAgICAgICAgICAgICAgLy8gTm9ybWFsbHkgSUUgd29uJ3QgbGlrZSBgLmRlbGV0ZSgpYCBhbmQgd2lsbCBpbnNpc3Qgb25cblx0ICAgICAgICAgICAgICAgIC8vIHVzaW5nIGBbJ2RlbGV0ZSddKClgLCBidXQgd2UgaGF2ZSBhIGJ1aWxkIHN0ZXAgdGhhdFxuXHQgICAgICAgICAgICAgICAgLy8gZml4ZXMgdGhpcyBmb3IgdXMgbm93LlxuXHQgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlWydkZWxldGUnXShrZXkpO1xuXHQgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cdCAgICAgICAgICAgICAgICB9O1xuXG5cdCAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgfTtcblxuXHQgICAgICAgICAgICAgICAgLy8gVGhlIHJlcXVlc3Qgd2lsbCBiZSBhbHNvIGJlIGFib3J0ZWQgaWYgd2UndmUgZXhjZWVkZWQgb3VyIHN0b3JhZ2Vcblx0ICAgICAgICAgICAgICAgIC8vIHNwYWNlLlxuXHQgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25hYm9ydCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVxLmVycm9yID8gcmVxLmVycm9yIDogcmVxLnRyYW5zYWN0aW9uLmVycm9yO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuXHQgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGNsZWFyKGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgICAgICB2YXIgdHJhbnNhY3Rpb24gPSBkYkluZm8uZGIudHJhbnNhY3Rpb24oZGJJbmZvLnN0b3JlTmFtZSwgJ3JlYWR3cml0ZScpO1xuXHQgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gdHJhbnNhY3Rpb24ub2JqZWN0U3RvcmUoZGJJbmZvLnN0b3JlTmFtZSk7XG5cdCAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUuY2xlYXIoKTtcblxuXHQgICAgICAgICAgICAgICAgdHJhbnNhY3Rpb24ub25jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cdCAgICAgICAgICAgICAgICB9O1xuXG5cdCAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbi5vbmFib3J0ID0gdHJhbnNhY3Rpb24ub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVxLmVycm9yID8gcmVxLmVycm9yIDogcmVxLnRyYW5zYWN0aW9uLmVycm9yO1xuXHQgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuXHQgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGxlbmd0aChjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXHQgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsICdyZWFkb25seScpLm9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuXHQgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLmNvdW50KCk7XG5cblx0ICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXEucmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgIH07XG5cblx0ICAgICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXEuZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGtleShuLCBjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBpZiAobiA8IDApIHtcblx0ICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG5cblx0ICAgICAgICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgICAgICB2YXIgc3RvcmUgPSBkYkluZm8uZGIudHJhbnNhY3Rpb24oZGJJbmZvLnN0b3JlTmFtZSwgJ3JlYWRvbmx5Jykub2JqZWN0U3RvcmUoZGJJbmZvLnN0b3JlTmFtZSk7XG5cblx0ICAgICAgICAgICAgICAgIHZhciBhZHZhbmNlZCA9IGZhbHNlO1xuXHQgICAgICAgICAgICAgICAgdmFyIHJlcSA9IHN0b3JlLm9wZW5DdXJzb3IoKTtcblx0ICAgICAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnNvciA9IHJlcS5yZXN1bHQ7XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJzb3IpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBtZWFucyB0aGVyZSB3ZXJlbid0IGVub3VnaCBrZXlzXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgIGlmIChuID09PSAwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgdGhlIGZpcnN0IGtleSwgcmV0dXJuIGl0IGlmIHRoYXQncyB3aGF0IHRoZXlcblx0ICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2FudGVkLlxuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnNvci5rZXkpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYWR2YW5jZWQpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgYXNrIHRoZSBjdXJzb3IgdG8gc2tpcCBhaGVhZCBuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZWNvcmRzLlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZWQgPSB0cnVlO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmFkdmFuY2Uobik7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHdlIGdldCBoZXJlLCB3ZSd2ZSBnb3QgdGhlIG50aCBrZXkuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGN1cnNvci5rZXkpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgfTtcblxuXHQgICAgICAgICAgICAgICAgcmVxLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcS5lcnJvcik7XG5cdCAgICAgICAgICAgICAgICB9O1xuXHQgICAgICAgICAgICB9KVsnY2F0Y2gnXShyZWplY3QpO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24ga2V5cyhjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXHQgICAgICAgICAgICAgICAgdmFyIHN0b3JlID0gZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGRiSW5mby5zdG9yZU5hbWUsICdyZWFkb25seScpLm9iamVjdFN0b3JlKGRiSW5mby5zdG9yZU5hbWUpO1xuXG5cdCAgICAgICAgICAgICAgICB2YXIgcmVxID0gc3RvcmUub3BlbkN1cnNvcigpO1xuXHQgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuXHQgICAgICAgICAgICAgICAgcmVxLm9uc3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIgY3Vyc29yID0gcmVxLnJlc3VsdDtcblxuXHQgICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoa2V5cyk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblx0ICAgICAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2goY3Vyc29yLmtleSk7XG5cdCAgICAgICAgICAgICAgICAgICAgY3Vyc29yWydjb250aW51ZSddKCk7XG5cdCAgICAgICAgICAgICAgICB9O1xuXG5cdCAgICAgICAgICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICByZWplY3QocmVxLmVycm9yKTtcblx0ICAgICAgICAgICAgICAgIH07XG5cdCAgICAgICAgICAgIH0pWydjYXRjaCddKHJlamVjdCk7XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuXHQgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgfVxuXG5cdCAgICBmdW5jdGlvbiBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spIHtcblx0ICAgICAgICBpZiAoY2FsbGJhY2spIHtcblx0ICAgICAgICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcblx0ICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG5cdCAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuXHQgICAgICAgICAgICB9KTtcblx0ICAgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIHZhciBhc3luY1N0b3JhZ2UgPSB7XG5cdCAgICAgICAgX2RyaXZlcjogJ2FzeW5jU3RvcmFnZScsXG5cdCAgICAgICAgX2luaXRTdG9yYWdlOiBfaW5pdFN0b3JhZ2UsXG5cdCAgICAgICAgaXRlcmF0ZTogaXRlcmF0ZSxcblx0ICAgICAgICBnZXRJdGVtOiBnZXRJdGVtLFxuXHQgICAgICAgIHNldEl0ZW06IHNldEl0ZW0sXG5cdCAgICAgICAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSxcblx0ICAgICAgICBjbGVhcjogY2xlYXIsXG5cdCAgICAgICAgbGVuZ3RoOiBsZW5ndGgsXG5cdCAgICAgICAga2V5OiBrZXksXG5cdCAgICAgICAga2V5czoga2V5c1xuXHQgICAgfTtcblxuXHQgICAgZXhwb3J0c1snZGVmYXVsdCddID0gYXN5bmNTdG9yYWdlO1xuXHR9KS5jYWxsKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogc2VsZik7XG5cdG1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuXG4vKioqLyB9LFxuLyogMiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0Ly8gSWYgSW5kZXhlZERCIGlzbid0IGF2YWlsYWJsZSwgd2UnbGwgZmFsbCBiYWNrIHRvIGxvY2FsU3RvcmFnZS5cblx0Ly8gTm90ZSB0aGF0IHRoaXMgd2lsbCBoYXZlIGNvbnNpZGVyYWJsZSBwZXJmb3JtYW5jZSBhbmQgc3RvcmFnZVxuXHQvLyBzaWRlLWVmZmVjdHMgKGFsbCBkYXRhIHdpbGwgYmUgc2VyaWFsaXplZCBvbiBzYXZlIGFuZCBvbmx5IGRhdGEgdGhhdFxuXHQvLyBjYW4gYmUgY29udmVydGVkIHRvIGEgc3RyaW5nIHZpYSBgSlNPTi5zdHJpbmdpZnkoKWAgd2lsbCBiZSBzYXZlZCkuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRleHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXHQoZnVuY3Rpb24gKCkge1xuXHQgICAgJ3VzZSBzdHJpY3QnO1xuXG5cdCAgICB2YXIgZ2xvYmFsT2JqZWN0ID0gdGhpcztcblx0ICAgIHZhciBsb2NhbFN0b3JhZ2UgPSBudWxsO1xuXG5cdCAgICAvLyBJZiB0aGUgYXBwIGlzIHJ1bm5pbmcgaW5zaWRlIGEgR29vZ2xlIENocm9tZSBwYWNrYWdlZCB3ZWJhcHAsIG9yIHNvbWVcblx0ICAgIC8vIG90aGVyIGNvbnRleHQgd2hlcmUgbG9jYWxTdG9yYWdlIGlzbid0IGF2YWlsYWJsZSwgd2UgZG9uJ3QgdXNlXG5cdCAgICAvLyBsb2NhbFN0b3JhZ2UuIFRoaXMgZmVhdHVyZSBkZXRlY3Rpb24gaXMgcHJlZmVycmVkIG92ZXIgdGhlIG9sZFxuXHQgICAgLy8gYGlmICh3aW5kb3cuY2hyb21lICYmIHdpbmRvdy5jaHJvbWUucnVudGltZSlgIGNvZGUuXG5cdCAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL2xvY2FsRm9yYWdlL2lzc3Vlcy82OFxuXHQgICAgdHJ5IHtcblx0ICAgICAgICAvLyBJZiBsb2NhbFN0b3JhZ2UgaXNuJ3QgYXZhaWxhYmxlLCB3ZSBnZXQgb3V0dGEgaGVyZSFcblx0ICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSBpbnNpZGUgYSB0cnkgY2F0Y2hcblx0ICAgICAgICBpZiAoIXRoaXMubG9jYWxTdG9yYWdlIHx8ICEoJ3NldEl0ZW0nIGluIHRoaXMubG9jYWxTdG9yYWdlKSkge1xuXHQgICAgICAgICAgICByZXR1cm47XG5cdCAgICAgICAgfVxuXHQgICAgICAgIC8vIEluaXRpYWxpemUgbG9jYWxTdG9yYWdlIGFuZCBjcmVhdGUgYSB2YXJpYWJsZSB0byB1c2UgdGhyb3VnaG91dFxuXHQgICAgICAgIC8vIHRoZSBjb2RlLlxuXHQgICAgICAgIGxvY2FsU3RvcmFnZSA9IHRoaXMubG9jYWxTdG9yYWdlO1xuXHQgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgIHJldHVybjtcblx0ICAgIH1cblxuXHQgICAgLy8gQ29uZmlnIHRoZSBsb2NhbFN0b3JhZ2UgYmFja2VuZCwgdXNpbmcgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cblx0ICAgIGZ1bmN0aW9uIF9pbml0U3RvcmFnZShvcHRpb25zKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXHQgICAgICAgIHZhciBkYkluZm8gPSB7fTtcblx0ICAgICAgICBpZiAob3B0aW9ucykge1xuXHQgICAgICAgICAgICBmb3IgKHZhciBpIGluIG9wdGlvbnMpIHtcblx0ICAgICAgICAgICAgICAgIGRiSW5mb1tpXSA9IG9wdGlvbnNbaV07XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgICAgICBkYkluZm8ua2V5UHJlZml4ID0gZGJJbmZvLm5hbWUgKyAnLyc7XG5cblx0ICAgICAgICBpZiAoZGJJbmZvLnN0b3JlTmFtZSAhPT0gc2VsZi5fZGVmYXVsdENvbmZpZy5zdG9yZU5hbWUpIHtcblx0ICAgICAgICAgICAgZGJJbmZvLmtleVByZWZpeCArPSBkYkluZm8uc3RvcmVOYW1lICsgJy8nO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHNlbGYuX2RiSW5mbyA9IGRiSW5mbztcblxuXHQgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgIHJlc29sdmUoX193ZWJwYWNrX3JlcXVpcmVfXygzKSk7XG5cdCAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobGliKSB7XG5cdCAgICAgICAgICAgIGRiSW5mby5zZXJpYWxpemVyID0gbGliO1xuXHQgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdCAgICAgICAgfSk7XG5cdCAgICB9XG5cblx0ICAgIC8vIFJlbW92ZSBhbGwga2V5cyBmcm9tIHRoZSBkYXRhc3RvcmUsIGVmZmVjdGl2ZWx5IGRlc3Ryb3lpbmcgYWxsIGRhdGEgaW5cblx0ICAgIC8vIHRoZSBhcHAncyBrZXkvdmFsdWUgc3RvcmUhXG5cdCAgICBmdW5jdGlvbiBjbGVhcihjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGtleVByZWZpeCA9IHNlbGYuX2RiSW5mby5rZXlQcmVmaXg7XG5cblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IGxvY2FsU3RvcmFnZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG5cblx0ICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihrZXlQcmVmaXgpID09PSAwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgLy8gUmV0cmlldmUgYW4gaXRlbSBmcm9tIHRoZSBzdG9yZS4gVW5saWtlIHRoZSBvcmlnaW5hbCBhc3luY19zdG9yYWdlXG5cdCAgICAvLyBsaWJyYXJ5IGluIEdhaWEsIHdlIGRvbid0IG1vZGlmeSByZXR1cm4gdmFsdWVzIGF0IGFsbC4gSWYgYSBrZXkncyB2YWx1ZVxuXHQgICAgLy8gaXMgYHVuZGVmaW5lZGAsIHdlIHBhc3MgdGhhdCB2YWx1ZSB0byB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAgICBmdW5jdGlvbiBnZXRJdGVtKGtleSwgY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cblx0ICAgICAgICAvLyBDYXN0IHRoZSBrZXkgdG8gYSBzdHJpbmcsIGFzIHRoYXQncyBhbGwgd2UgY2FuIHNldCBhcyBhIGtleS5cblx0ICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcblx0ICAgICAgICAgICAgZ2xvYmFsT2JqZWN0LmNvbnNvbGUud2FybihrZXkgKyAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG5cdCAgICAgICAgICAgIGtleSA9IFN0cmluZyhrZXkpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXHQgICAgICAgICAgICB2YXIgcmVzdWx0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oZGJJbmZvLmtleVByZWZpeCArIGtleSk7XG5cblx0ICAgICAgICAgICAgLy8gSWYgYSByZXN1bHQgd2FzIGZvdW5kLCBwYXJzZSBpdCBmcm9tIHRoZSBzZXJpYWxpemVkXG5cdCAgICAgICAgICAgIC8vIHN0cmluZyBpbnRvIGEgSlMgb2JqZWN0LiBJZiByZXN1bHQgaXNuJ3QgdHJ1dGh5LCB0aGUga2V5XG5cdCAgICAgICAgICAgIC8vIGlzIGxpa2VseSB1bmRlZmluZWQgYW5kIHdlJ2xsIHBhc3MgaXQgc3RyYWlnaHQgdG8gdGhlXG5cdCAgICAgICAgICAgIC8vIGNhbGxiYWNrLlxuXHQgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cdCAgICAgICAgICAgICAgICByZXN1bHQgPSBkYkluZm8uc2VyaWFsaXplci5kZXNlcmlhbGl6ZShyZXN1bHQpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIC8vIEl0ZXJhdGUgb3ZlciBhbGwgaXRlbXMgaW4gdGhlIHN0b3JlLlxuXHQgICAgZnVuY3Rpb24gaXRlcmF0ZShpdGVyYXRvciwgY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgdmFyIGtleVByZWZpeCA9IGRiSW5mby5rZXlQcmVmaXg7XG5cdCAgICAgICAgICAgIHZhciBrZXlQcmVmaXhMZW5ndGggPSBrZXlQcmVmaXgubGVuZ3RoO1xuXHQgICAgICAgICAgICB2YXIgbGVuZ3RoID0gbG9jYWxTdG9yYWdlLmxlbmd0aDtcblxuXHQgICAgICAgICAgICAvLyBXZSB1c2UgYSBkZWRpY2F0ZWQgaXRlcmF0b3IgaW5zdGVhZCBvZiB0aGUgYGlgIHZhcmlhYmxlIGJlbG93XG5cdCAgICAgICAgICAgIC8vIHNvIG90aGVyIGtleXMgd2UgZmV0Y2ggaW4gbG9jYWxTdG9yYWdlIGFyZW4ndCBjb3VudGVkIGluXG5cdCAgICAgICAgICAgIC8vIHRoZSBgaXRlcmF0aW9uTnVtYmVyYCBhcmd1bWVudCBwYXNzZWQgdG8gdGhlIGBpdGVyYXRlKClgXG5cdCAgICAgICAgICAgIC8vIGNhbGxiYWNrLlxuXHQgICAgICAgICAgICAvL1xuXHQgICAgICAgICAgICAvLyBTZWU6IGdpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9wdWxsLzQzNSNkaXNjdXNzaW9uX3IzODA2MTUzMFxuXHQgICAgICAgICAgICB2YXIgaXRlcmF0aW9uTnVtYmVyID0gMTtcblxuXHQgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcblx0ICAgICAgICAgICAgICAgIGlmIChrZXkuaW5kZXhPZihrZXlQcmVmaXgpICE9PSAwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuXG5cdCAgICAgICAgICAgICAgICAvLyBJZiBhIHJlc3VsdCB3YXMgZm91bmQsIHBhcnNlIGl0IGZyb20gdGhlIHNlcmlhbGl6ZWRcblx0ICAgICAgICAgICAgICAgIC8vIHN0cmluZyBpbnRvIGEgSlMgb2JqZWN0LiBJZiByZXN1bHQgaXNuJ3QgdHJ1dGh5LCB0aGVcblx0ICAgICAgICAgICAgICAgIC8vIGtleSBpcyBsaWtlbHkgdW5kZWZpbmVkIGFuZCB3ZSdsbCBwYXNzIGl0IHN0cmFpZ2h0XG5cdCAgICAgICAgICAgICAgICAvLyB0byB0aGUgaXRlcmF0b3IuXG5cdCAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRiSW5mby5zZXJpYWxpemVyLmRlc2VyaWFsaXplKHZhbHVlKTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgdmFsdWUgPSBpdGVyYXRvcih2YWx1ZSwga2V5LnN1YnN0cmluZyhrZXlQcmVmaXhMZW5ndGgpLCBpdGVyYXRpb25OdW1iZXIrKyk7XG5cblx0ICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdm9pZCAwKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuXHQgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuXHQgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgfVxuXG5cdCAgICAvLyBTYW1lIGFzIGxvY2FsU3RvcmFnZSdzIGtleSgpIG1ldGhvZCwgZXhjZXB0IHRha2VzIGEgY2FsbGJhY2suXG5cdCAgICBmdW5jdGlvbiBrZXkobiwgY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgIHZhciByZXN1bHQ7XG5cdCAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICByZXN1bHQgPSBsb2NhbFN0b3JhZ2Uua2V5KG4pO1xuXHQgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbDtcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgcHJlZml4IGZyb20gdGhlIGtleSwgaWYgYSBrZXkgaXMgZm91bmQuXG5cdCAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcblx0ICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zdWJzdHJpbmcoZGJJbmZvLmtleVByZWZpeC5sZW5ndGgpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGtleXMoY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgIHZhciBsZW5ndGggPSBsb2NhbFN0b3JhZ2UubGVuZ3RoO1xuXHQgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuXG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgIGlmIChsb2NhbFN0b3JhZ2Uua2V5KGkpLmluZGV4T2YoZGJJbmZvLmtleVByZWZpeCkgPT09IDApIHtcblx0ICAgICAgICAgICAgICAgICAgICBrZXlzLnB1c2gobG9jYWxTdG9yYWdlLmtleShpKS5zdWJzdHJpbmcoZGJJbmZvLmtleVByZWZpeC5sZW5ndGgpKTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIHJldHVybiBrZXlzO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgLy8gU3VwcGx5IHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGUgZGF0YXN0b3JlIHRvIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICAgIGZ1bmN0aW9uIGxlbmd0aChjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IHNlbGYua2V5cygpLnRoZW4oZnVuY3Rpb24gKGtleXMpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGtleXMubGVuZ3RoO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgLy8gUmVtb3ZlIGFuIGl0ZW0gZnJvbSB0aGUgc3RvcmUsIG5pY2UgYW5kIHNpbXBsZS5cblx0ICAgIGZ1bmN0aW9uIHJlbW92ZUl0ZW0oa2V5LCBjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIC8vIENhc3QgdGhlIGtleSB0byBhIHN0cmluZywgYXMgdGhhdCdzIGFsbCB3ZSBjYW4gc2V0IGFzIGEga2V5LlxuXHQgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuXHQgICAgICAgICAgICBnbG9iYWxPYmplY3QuY29uc29sZS53YXJuKGtleSArICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcblx0ICAgICAgICAgICAga2V5ID0gU3RyaW5nKGtleSk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGRiSW5mby5rZXlQcmVmaXggKyBrZXkpO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgLy8gU2V0IGEga2V5J3MgdmFsdWUgYW5kIHJ1biBhbiBvcHRpb25hbCBjYWxsYmFjayBvbmNlIHRoZSB2YWx1ZSBpcyBzZXQuXG5cdCAgICAvLyBVbmxpa2UgR2FpYSdzIGltcGxlbWVudGF0aW9uLCB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcGFzc2VkIHRoZSB2YWx1ZSxcblx0ICAgIC8vIGluIGNhc2UgeW91IHdhbnQgdG8gb3BlcmF0ZSBvbiB0aGF0IHZhbHVlIG9ubHkgYWZ0ZXIgeW91J3JlIHN1cmUgaXRcblx0ICAgIC8vIHNhdmVkLCBvciBzb21ldGhpbmcgbGlrZSB0aGF0LlxuXHQgICAgZnVuY3Rpb24gc2V0SXRlbShrZXksIHZhbHVlLCBjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIC8vIENhc3QgdGhlIGtleSB0byBhIHN0cmluZywgYXMgdGhhdCdzIGFsbCB3ZSBjYW4gc2V0IGFzIGEga2V5LlxuXHQgICAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuXHQgICAgICAgICAgICBnbG9iYWxPYmplY3QuY29uc29sZS53YXJuKGtleSArICcgdXNlZCBhcyBhIGtleSwgYnV0IGl0IGlzIG5vdCBhIHN0cmluZy4nKTtcblx0ICAgICAgICAgICAga2V5ID0gU3RyaW5nKGtleSk7XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgIC8vIENvbnZlcnQgdW5kZWZpbmVkIHZhbHVlcyB0byBudWxsLlxuXHQgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9sb2NhbEZvcmFnZS9wdWxsLzQyXG5cdCAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG5cdCAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAvLyBTYXZlIHRoZSBvcmlnaW5hbCB2YWx1ZSB0byBwYXNzIHRvIHRoZSBjYWxsYmFjay5cblx0ICAgICAgICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIGRiSW5mby5zZXJpYWxpemVyLnNlcmlhbGl6ZSh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlLCBlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShkYkluZm8ua2V5UHJlZml4ICsga2V5LCB2YWx1ZSk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9yaWdpbmFsVmFsdWUpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2NhbFN0b3JhZ2UgY2FwYWNpdHkgZXhjZWVkZWQuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBNYWtlIHRoaXMgYSBzcGVjaWZpYyBlcnJvci9ldmVudC5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdRdW90YUV4Y2VlZGVkRXJyb3InIHx8IGUubmFtZSA9PT0gJ05TX0VSUk9SX0RPTV9RVU9UQV9SRUFDSEVEJykge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB9KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjaykge1xuXHQgICAgICAgIGlmIChjYWxsYmFjaykge1xuXHQgICAgICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXHQgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcblx0ICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG5cdCAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJvcik7XG5cdCAgICAgICAgICAgIH0pO1xuXHQgICAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgdmFyIGxvY2FsU3RvcmFnZVdyYXBwZXIgPSB7XG5cdCAgICAgICAgX2RyaXZlcjogJ2xvY2FsU3RvcmFnZVdyYXBwZXInLFxuXHQgICAgICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlLFxuXHQgICAgICAgIC8vIERlZmF1bHQgQVBJLCBmcm9tIEdhaWEvbG9jYWxTdG9yYWdlLlxuXHQgICAgICAgIGl0ZXJhdGU6IGl0ZXJhdGUsXG5cdCAgICAgICAgZ2V0SXRlbTogZ2V0SXRlbSxcblx0ICAgICAgICBzZXRJdGVtOiBzZXRJdGVtLFxuXHQgICAgICAgIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0sXG5cdCAgICAgICAgY2xlYXI6IGNsZWFyLFxuXHQgICAgICAgIGxlbmd0aDogbGVuZ3RoLFxuXHQgICAgICAgIGtleToga2V5LFxuXHQgICAgICAgIGtleXM6IGtleXNcblx0ICAgIH07XG5cblx0ICAgIGV4cG9ydHNbJ2RlZmF1bHQnXSA9IGxvY2FsU3RvcmFnZVdyYXBwZXI7XG5cdH0pLmNhbGwodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBzZWxmKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbi8qKiovIH0sXG4vKiAzICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQndXNlIHN0cmljdCc7XG5cblx0ZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblx0KGZ1bmN0aW9uICgpIHtcblx0ICAgICd1c2Ugc3RyaWN0JztcblxuXHQgICAgLy8gU2FkbHksIHRoZSBiZXN0IHdheSB0byBzYXZlIGJpbmFyeSBkYXRhIGluIFdlYlNRTC9sb2NhbFN0b3JhZ2UgaXMgc2VyaWFsaXppbmdcblx0ICAgIC8vIGl0IHRvIEJhc2U2NCwgc28gdGhpcyBpcyBob3cgd2Ugc3RvcmUgaXQgdG8gcHJldmVudCB2ZXJ5IHN0cmFuZ2UgZXJyb3JzIHdpdGggbGVzc1xuXHQgICAgLy8gdmVyYm9zZSB3YXlzIG9mIGJpbmFyeSA8LT4gc3RyaW5nIGRhdGEgc3RvcmFnZS5cblx0ICAgIHZhciBCQVNFX0NIQVJTID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG5cdCAgICB2YXIgQkxPQl9UWVBFX1BSRUZJWCA9ICd+fmxvY2FsX2ZvcmFnZV90eXBlfic7XG5cdCAgICB2YXIgQkxPQl9UWVBFX1BSRUZJWF9SRUdFWCA9IC9efn5sb2NhbF9mb3JhZ2VfdHlwZX4oW15+XSspfi87XG5cblx0ICAgIHZhciBTRVJJQUxJWkVEX01BUktFUiA9ICdfX2xmc2NfXzonO1xuXHQgICAgdmFyIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCA9IFNFUklBTElaRURfTUFSS0VSLmxlbmd0aDtcblxuXHQgICAgLy8gT01HIHRoZSBzZXJpYWxpemF0aW9ucyFcblx0ICAgIHZhciBUWVBFX0FSUkFZQlVGRkVSID0gJ2FyYmYnO1xuXHQgICAgdmFyIFRZUEVfQkxPQiA9ICdibG9iJztcblx0ICAgIHZhciBUWVBFX0lOVDhBUlJBWSA9ICdzaTA4Jztcblx0ICAgIHZhciBUWVBFX1VJTlQ4QVJSQVkgPSAndWkwOCc7XG5cdCAgICB2YXIgVFlQRV9VSU5UOENMQU1QRURBUlJBWSA9ICd1aWM4Jztcblx0ICAgIHZhciBUWVBFX0lOVDE2QVJSQVkgPSAnc2kxNic7XG5cdCAgICB2YXIgVFlQRV9JTlQzMkFSUkFZID0gJ3NpMzInO1xuXHQgICAgdmFyIFRZUEVfVUlOVDE2QVJSQVkgPSAndXIxNic7XG5cdCAgICB2YXIgVFlQRV9VSU5UMzJBUlJBWSA9ICd1aTMyJztcblx0ICAgIHZhciBUWVBFX0ZMT0FUMzJBUlJBWSA9ICdmbDMyJztcblx0ICAgIHZhciBUWVBFX0ZMT0FUNjRBUlJBWSA9ICdmbDY0Jztcblx0ICAgIHZhciBUWVBFX1NFUklBTElaRURfTUFSS0VSX0xFTkdUSCA9IFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCArIFRZUEVfQVJSQVlCVUZGRVIubGVuZ3RoO1xuXG5cdCAgICAvLyBHZXQgb3V0IG9mIG91ciBoYWJpdCBvZiB1c2luZyBgd2luZG93YCBpbmxpbmUsIGF0IGxlYXN0LlxuXHQgICAgdmFyIGdsb2JhbE9iamVjdCA9IHRoaXM7XG5cblx0ICAgIC8vIEFic3RyYWN0cyBjb25zdHJ1Y3RpbmcgYSBCbG9iIG9iamVjdCwgc28gaXQgYWxzbyB3b3JrcyBpbiBvbGRlclxuXHQgICAgLy8gYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHRoZSBuYXRpdmUgQmxvYiBjb25zdHJ1Y3Rvci4gKGkuZS5cblx0ICAgIC8vIG9sZCBRdFdlYktpdCB2ZXJzaW9ucywgYXQgbGVhc3QpLlxuXHQgICAgZnVuY3Rpb24gX2NyZWF0ZUJsb2IocGFydHMsIHByb3BlcnRpZXMpIHtcblx0ICAgICAgICBwYXJ0cyA9IHBhcnRzIHx8IFtdO1xuXHQgICAgICAgIHByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IHt9O1xuXG5cdCAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgcmV0dXJuIG5ldyBCbG9iKHBhcnRzLCBwcm9wZXJ0aWVzKTtcblx0ICAgICAgICB9IGNhdGNoIChlcnIpIHtcblx0ICAgICAgICAgICAgaWYgKGVyci5uYW1lICE9PSAnVHlwZUVycm9yJykge1xuXHQgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgdmFyIEJsb2JCdWlsZGVyID0gZ2xvYmFsT2JqZWN0LkJsb2JCdWlsZGVyIHx8IGdsb2JhbE9iamVjdC5NU0Jsb2JCdWlsZGVyIHx8IGdsb2JhbE9iamVjdC5Nb3pCbG9iQnVpbGRlciB8fCBnbG9iYWxPYmplY3QuV2ViS2l0QmxvYkJ1aWxkZXI7XG5cblx0ICAgICAgICAgICAgdmFyIGJ1aWxkZXIgPSBuZXcgQmxvYkJ1aWxkZXIoKTtcblx0ICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMSkge1xuXHQgICAgICAgICAgICAgICAgYnVpbGRlci5hcHBlbmQocGFydHNbaV0pO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0QmxvYihwcm9wZXJ0aWVzLnR5cGUpO1xuXHQgICAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gU2VyaWFsaXplIGEgdmFsdWUsIGFmdGVyd2FyZHMgZXhlY3V0aW5nIGEgY2FsbGJhY2sgKHdoaWNoIHVzdWFsbHlcblx0ICAgIC8vIGluc3RydWN0cyB0aGUgYHNldEl0ZW0oKWAgY2FsbGJhY2svcHJvbWlzZSB0byBiZSBleGVjdXRlZCkuIFRoaXMgaXMgaG93XG5cdCAgICAvLyB3ZSBzdG9yZSBiaW5hcnkgZGF0YSB3aXRoIGxvY2FsU3RvcmFnZS5cblx0ICAgIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWx1ZSwgY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgdmFsdWVTdHJpbmcgPSAnJztcblx0ICAgICAgICBpZiAodmFsdWUpIHtcblx0ICAgICAgICAgICAgdmFsdWVTdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIC8vIENhbm5vdCB1c2UgYHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXJgIG9yIHN1Y2ggaGVyZSwgYXMgdGhlc2Vcblx0ICAgICAgICAvLyBjaGVja3MgZmFpbCB3aGVuIHJ1bm5pbmcgdGhlIHRlc3RzIHVzaW5nIGNhc3Blci5qcy4uLlxuXHQgICAgICAgIC8vXG5cdCAgICAgICAgLy8gVE9ETzogU2VlIHdoeSB0aG9zZSB0ZXN0cyBmYWlsIGFuZCB1c2UgYSBiZXR0ZXIgc29sdXRpb24uXG5cdCAgICAgICAgaWYgKHZhbHVlICYmICh2YWx1ZS50b1N0cmluZygpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nIHx8IHZhbHVlLmJ1ZmZlciAmJiB2YWx1ZS5idWZmZXIudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJykpIHtcblx0ICAgICAgICAgICAgLy8gQ29udmVydCBiaW5hcnkgYXJyYXlzIHRvIGEgc3RyaW5nIGFuZCBwcmVmaXggdGhlIHN0cmluZyB3aXRoXG5cdCAgICAgICAgICAgIC8vIGEgc3BlY2lhbCBtYXJrZXIuXG5cdCAgICAgICAgICAgIHZhciBidWZmZXI7XG5cdCAgICAgICAgICAgIHZhciBtYXJrZXIgPSBTRVJJQUxJWkVEX01BUktFUjtcblxuXHQgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuXHQgICAgICAgICAgICAgICAgYnVmZmVyID0gdmFsdWU7XG5cdCAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9BUlJBWUJVRkZFUjtcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIGJ1ZmZlciA9IHZhbHVlLmJ1ZmZlcjtcblxuXHQgICAgICAgICAgICAgICAgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBJbnQ4QXJyYXldJykge1xuXHQgICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX0lOVDhBUlJBWTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IFVpbnQ4QXJyYXldJykge1xuXHQgICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQ4QVJSQVk7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfVUlOVDhDTEFNUEVEQVJSQVk7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlU3RyaW5nID09PSAnW29iamVjdCBJbnQxNkFycmF5XScpIHtcblx0ICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9JTlQxNkFSUkFZO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgVWludDE2QXJyYXldJykge1xuXHQgICAgICAgICAgICAgICAgICAgIG1hcmtlciArPSBUWVBFX1VJTlQxNkFSUkFZO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgSW50MzJBcnJheV0nKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfSU5UMzJBUlJBWTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IFVpbnQzMkFycmF5XScpIHtcblx0ICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9VSU5UMzJBUlJBWTtcblx0ICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgbWFya2VyICs9IFRZUEVfRkxPQVQzMkFSUkFZO1xuXHQgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVN0cmluZyA9PT0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScpIHtcblx0ICAgICAgICAgICAgICAgICAgICBtYXJrZXIgKz0gVFlQRV9GTE9BVDY0QVJSQVk7XG5cdCAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignRmFpbGVkIHRvIGdldCB0eXBlIGZvciBCaW5hcnlBcnJheScpKTtcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIGNhbGxiYWNrKG1hcmtlciArIGJ1ZmZlclRvU3RyaW5nKGJ1ZmZlcikpO1xuXHQgICAgICAgIH0gZWxzZSBpZiAodmFsdWVTdHJpbmcgPT09ICdbb2JqZWN0IEJsb2JdJykge1xuXHQgICAgICAgICAgICAvLyBDb252ZXIgdGhlIGJsb2IgdG8gYSBiaW5hcnlBcnJheSBhbmQgdGhlbiB0byBhIHN0cmluZy5cblx0ICAgICAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG5cdCAgICAgICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgLy8gQmFja3dhcmRzLWNvbXBhdGlibGUgcHJlZml4IGZvciB0aGUgYmxvYiB0eXBlLlxuXHQgICAgICAgICAgICAgICAgdmFyIHN0ciA9IEJMT0JfVFlQRV9QUkVGSVggKyB2YWx1ZS50eXBlICsgJ34nICsgYnVmZmVyVG9TdHJpbmcodGhpcy5yZXN1bHQpO1xuXG5cdCAgICAgICAgICAgICAgICBjYWxsYmFjayhTRVJJQUxJWkVEX01BUktFUiArIFRZUEVfQkxPQiArIHN0cik7XG5cdCAgICAgICAgICAgIH07XG5cblx0ICAgICAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcih2YWx1ZSk7XG5cdCAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgIGNhbGxiYWNrKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG5cdCAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZG4ndCBjb252ZXJ0IHZhbHVlIGludG8gYSBKU09OIHN0cmluZzogXCIsIHZhbHVlKTtcblxuXHQgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZSk7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIERlc2VyaWFsaXplIGRhdGEgd2UndmUgaW5zZXJ0ZWQgaW50byBhIHZhbHVlIGNvbHVtbi9maWVsZC4gV2UgcGxhY2Vcblx0ICAgIC8vIHNwZWNpYWwgbWFya2VycyBpbnRvIG91ciBzdHJpbmdzIHRvIG1hcmsgdGhlbSBhcyBlbmNvZGVkOyB0aGlzIGlzbid0XG5cdCAgICAvLyBhcyBuaWNlIGFzIGEgbWV0YSBmaWVsZCwgYnV0IGl0J3MgdGhlIG9ubHkgc2FuZSB0aGluZyB3ZSBjYW4gZG8gd2hpbHN0XG5cdCAgICAvLyBrZWVwaW5nIGxvY2FsU3RvcmFnZSBzdXBwb3J0IGludGFjdC5cblx0ICAgIC8vXG5cdCAgICAvLyBPZnRlbnRpbWVzIHRoaXMgd2lsbCBqdXN0IGRlc2VyaWFsaXplIEpTT04gY29udGVudCwgYnV0IGlmIHdlIGhhdmUgYVxuXHQgICAgLy8gc3BlY2lhbCBtYXJrZXIgKFNFUklBTElaRURfTUFSS0VSLCBkZWZpbmVkIGFib3ZlKSwgd2Ugd2lsbCBleHRyYWN0XG5cdCAgICAvLyBzb21lIGtpbmQgb2YgYXJyYXlidWZmZXIvYmluYXJ5IGRhdGEvdHlwZWQgYXJyYXkgb3V0IG9mIHRoZSBzdHJpbmcuXG5cdCAgICBmdW5jdGlvbiBkZXNlcmlhbGl6ZSh2YWx1ZSkge1xuXHQgICAgICAgIC8vIElmIHdlIGhhdmVuJ3QgbWFya2VkIHRoaXMgc3RyaW5nIGFzIGJlaW5nIHNwZWNpYWxseSBzZXJpYWxpemVkIChpLmUuXG5cdCAgICAgICAgLy8gc29tZXRoaW5nIG90aGVyIHRoYW4gc2VyaWFsaXplZCBKU09OKSwgd2UgY2FuIGp1c3QgcmV0dXJuIGl0IGFuZCBiZVxuXHQgICAgICAgIC8vIGRvbmUgd2l0aCBpdC5cblx0ICAgICAgICBpZiAodmFsdWUuc3Vic3RyaW5nKDAsIFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCkgIT09IFNFUklBTElaRURfTUFSS0VSKSB7XG5cdCAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgZGVhbHMgd2l0aCBkZXNlcmlhbGl6aW5nIHNvbWUga2luZCBvZiBCbG9iIG9yXG5cdCAgICAgICAgLy8gVHlwZWRBcnJheS4gRmlyc3Qgd2Ugc2VwYXJhdGUgb3V0IHRoZSB0eXBlIG9mIGRhdGEgd2UncmUgZGVhbGluZ1xuXHQgICAgICAgIC8vIHdpdGggZnJvbSB0aGUgZGF0YSBpdHNlbGYuXG5cdCAgICAgICAgdmFyIHNlcmlhbGl6ZWRTdHJpbmcgPSB2YWx1ZS5zdWJzdHJpbmcoVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpO1xuXHQgICAgICAgIHZhciB0eXBlID0gdmFsdWUuc3Vic3RyaW5nKFNFUklBTElaRURfTUFSS0VSX0xFTkdUSCwgVFlQRV9TRVJJQUxJWkVEX01BUktFUl9MRU5HVEgpO1xuXG5cdCAgICAgICAgdmFyIGJsb2JUeXBlO1xuXHQgICAgICAgIC8vIEJhY2t3YXJkcy1jb21wYXRpYmxlIGJsb2IgdHlwZSBzZXJpYWxpemF0aW9uIHN0cmF0ZWd5LlxuXHQgICAgICAgIC8vIERCcyBjcmVhdGVkIHdpdGggb2xkZXIgdmVyc2lvbnMgb2YgbG9jYWxGb3JhZ2Ugd2lsbCBzaW1wbHkgbm90IGhhdmUgdGhlIGJsb2IgdHlwZS5cblx0ICAgICAgICBpZiAodHlwZSA9PT0gVFlQRV9CTE9CICYmIEJMT0JfVFlQRV9QUkVGSVhfUkVHRVgudGVzdChzZXJpYWxpemVkU3RyaW5nKSkge1xuXHQgICAgICAgICAgICB2YXIgbWF0Y2hlciA9IHNlcmlhbGl6ZWRTdHJpbmcubWF0Y2goQkxPQl9UWVBFX1BSRUZJWF9SRUdFWCk7XG5cdCAgICAgICAgICAgIGJsb2JUeXBlID0gbWF0Y2hlclsxXTtcblx0ICAgICAgICAgICAgc2VyaWFsaXplZFN0cmluZyA9IHNlcmlhbGl6ZWRTdHJpbmcuc3Vic3RyaW5nKG1hdGNoZXJbMF0ubGVuZ3RoKTtcblx0ICAgICAgICB9XG5cdCAgICAgICAgdmFyIGJ1ZmZlciA9IHN0cmluZ1RvQnVmZmVyKHNlcmlhbGl6ZWRTdHJpbmcpO1xuXG5cdCAgICAgICAgLy8gUmV0dXJuIHRoZSByaWdodCB0eXBlIGJhc2VkIG9uIHRoZSBjb2RlL3R5cGUgc2V0IGR1cmluZ1xuXHQgICAgICAgIC8vIHNlcmlhbGl6YXRpb24uXG5cdCAgICAgICAgc3dpdGNoICh0eXBlKSB7XG5cdCAgICAgICAgICAgIGNhc2UgVFlQRV9BUlJBWUJVRkZFUjpcblx0ICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG5cdCAgICAgICAgICAgIGNhc2UgVFlQRV9CTE9COlxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIF9jcmVhdGVCbG9iKFtidWZmZXJdLCB7IHR5cGU6IGJsb2JUeXBlIH0pO1xuXHQgICAgICAgICAgICBjYXNlIFRZUEVfSU5UOEFSUkFZOlxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQ4QXJyYXkoYnVmZmVyKTtcblx0ICAgICAgICAgICAgY2FzZSBUWVBFX1VJTlQ4QVJSQVk6XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0ICAgICAgICAgICAgY2FzZSBUWVBFX1VJTlQ4Q0xBTVBFREFSUkFZOlxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXIpO1xuXHQgICAgICAgICAgICBjYXNlIFRZUEVfSU5UMTZBUlJBWTpcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSW50MTZBcnJheShidWZmZXIpO1xuXHQgICAgICAgICAgICBjYXNlIFRZUEVfVUlOVDE2QVJSQVk6XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQxNkFycmF5KGJ1ZmZlcik7XG5cdCAgICAgICAgICAgIGNhc2UgVFlQRV9JTlQzMkFSUkFZOlxuXHQgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnQzMkFycmF5KGJ1ZmZlcik7XG5cdCAgICAgICAgICAgIGNhc2UgVFlQRV9VSU5UMzJBUlJBWTpcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVWludDMyQXJyYXkoYnVmZmVyKTtcblx0ICAgICAgICAgICAgY2FzZSBUWVBFX0ZMT0FUMzJBUlJBWTpcblx0ICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlcik7XG5cdCAgICAgICAgICAgIGNhc2UgVFlQRV9GTE9BVDY0QVJSQVk6XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0NjRBcnJheShidWZmZXIpO1xuXHQgICAgICAgICAgICBkZWZhdWx0OlxuXHQgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtvd24gdHlwZTogJyArIHR5cGUpO1xuXHQgICAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gc3RyaW5nVG9CdWZmZXIoc2VyaWFsaXplZFN0cmluZykge1xuXHQgICAgICAgIC8vIEZpbGwgdGhlIHN0cmluZyBpbnRvIGEgQXJyYXlCdWZmZXIuXG5cdCAgICAgICAgdmFyIGJ1ZmZlckxlbmd0aCA9IHNlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoICogMC43NTtcblx0ICAgICAgICB2YXIgbGVuID0gc2VyaWFsaXplZFN0cmluZy5sZW5ndGg7XG5cdCAgICAgICAgdmFyIGk7XG5cdCAgICAgICAgdmFyIHAgPSAwO1xuXHQgICAgICAgIHZhciBlbmNvZGVkMSwgZW5jb2RlZDIsIGVuY29kZWQzLCBlbmNvZGVkNDtcblxuXHQgICAgICAgIGlmIChzZXJpYWxpemVkU3RyaW5nW3NlcmlhbGl6ZWRTdHJpbmcubGVuZ3RoIC0gMV0gPT09ICc9Jykge1xuXHQgICAgICAgICAgICBidWZmZXJMZW5ndGgtLTtcblx0ICAgICAgICAgICAgaWYgKHNlcmlhbGl6ZWRTdHJpbmdbc2VyaWFsaXplZFN0cmluZy5sZW5ndGggLSAyXSA9PT0gJz0nKSB7XG5cdCAgICAgICAgICAgICAgICBidWZmZXJMZW5ndGgtLTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVyTGVuZ3RoKTtcblx0ICAgICAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG5cdCAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG5cdCAgICAgICAgICAgIGVuY29kZWQxID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaV0pO1xuXHQgICAgICAgICAgICBlbmNvZGVkMiA9IEJBU0VfQ0hBUlMuaW5kZXhPZihzZXJpYWxpemVkU3RyaW5nW2kgKyAxXSk7XG5cdCAgICAgICAgICAgIGVuY29kZWQzID0gQkFTRV9DSEFSUy5pbmRleE9mKHNlcmlhbGl6ZWRTdHJpbmdbaSArIDJdKTtcblx0ICAgICAgICAgICAgZW5jb2RlZDQgPSBCQVNFX0NIQVJTLmluZGV4T2Yoc2VyaWFsaXplZFN0cmluZ1tpICsgM10pO1xuXG5cdCAgICAgICAgICAgIC8qanNsaW50IGJpdHdpc2U6IHRydWUgKi9cblx0ICAgICAgICAgICAgYnl0ZXNbcCsrXSA9IGVuY29kZWQxIDw8IDIgfCBlbmNvZGVkMiA+PiA0O1xuXHQgICAgICAgICAgICBieXRlc1twKytdID0gKGVuY29kZWQyICYgMTUpIDw8IDQgfCBlbmNvZGVkMyA+PiAyO1xuXHQgICAgICAgICAgICBieXRlc1twKytdID0gKGVuY29kZWQzICYgMykgPDwgNiB8IGVuY29kZWQ0ICYgNjM7XG5cdCAgICAgICAgfVxuXHQgICAgICAgIHJldHVybiBidWZmZXI7XG5cdCAgICB9XG5cblx0ICAgIC8vIENvbnZlcnRzIGEgYnVmZmVyIHRvIGEgc3RyaW5nIHRvIHN0b3JlLCBzZXJpYWxpemVkLCBpbiB0aGUgYmFja2VuZFxuXHQgICAgLy8gc3RvcmFnZSBsaWJyYXJ5LlxuXHQgICAgZnVuY3Rpb24gYnVmZmVyVG9TdHJpbmcoYnVmZmVyKSB7XG5cdCAgICAgICAgLy8gYmFzZTY0LWFycmF5YnVmZmVyXG5cdCAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcblx0ICAgICAgICB2YXIgYmFzZTY0U3RyaW5nID0gJyc7XG5cdCAgICAgICAgdmFyIGk7XG5cblx0ICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDMpIHtcblx0ICAgICAgICAgICAgLypqc2xpbnQgYml0d2lzZTogdHJ1ZSAqL1xuXHQgICAgICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1tieXRlc1tpXSA+PiAyXTtcblx0ICAgICAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbKGJ5dGVzW2ldICYgMykgPDwgNCB8IGJ5dGVzW2kgKyAxXSA+PiA0XTtcblx0ICAgICAgICAgICAgYmFzZTY0U3RyaW5nICs9IEJBU0VfQ0hBUlNbKGJ5dGVzW2kgKyAxXSAmIDE1KSA8PCAyIHwgYnl0ZXNbaSArIDJdID4+IDZdO1xuXHQgICAgICAgICAgICBiYXNlNjRTdHJpbmcgKz0gQkFTRV9DSEFSU1tieXRlc1tpICsgMl0gJiA2M107XG5cdCAgICAgICAgfVxuXG5cdCAgICAgICAgaWYgKGJ5dGVzLmxlbmd0aCAlIDMgPT09IDIpIHtcblx0ICAgICAgICAgICAgYmFzZTY0U3RyaW5nID0gYmFzZTY0U3RyaW5nLnN1YnN0cmluZygwLCBiYXNlNjRTdHJpbmcubGVuZ3RoIC0gMSkgKyAnPSc7XG5cdCAgICAgICAgfSBlbHNlIGlmIChieXRlcy5sZW5ndGggJSAzID09PSAxKSB7XG5cdCAgICAgICAgICAgIGJhc2U2NFN0cmluZyA9IGJhc2U2NFN0cmluZy5zdWJzdHJpbmcoMCwgYmFzZTY0U3RyaW5nLmxlbmd0aCAtIDIpICsgJz09Jztcblx0ICAgICAgICB9XG5cblx0ICAgICAgICByZXR1cm4gYmFzZTY0U3RyaW5nO1xuXHQgICAgfVxuXG5cdCAgICB2YXIgbG9jYWxmb3JhZ2VTZXJpYWxpemVyID0ge1xuXHQgICAgICAgIHNlcmlhbGl6ZTogc2VyaWFsaXplLFxuXHQgICAgICAgIGRlc2VyaWFsaXplOiBkZXNlcmlhbGl6ZSxcblx0ICAgICAgICBzdHJpbmdUb0J1ZmZlcjogc3RyaW5nVG9CdWZmZXIsXG5cdCAgICAgICAgYnVmZmVyVG9TdHJpbmc6IGJ1ZmZlclRvU3RyaW5nXG5cdCAgICB9O1xuXG5cdCAgICBleHBvcnRzWydkZWZhdWx0J10gPSBsb2NhbGZvcmFnZVNlcmlhbGl6ZXI7XG5cdH0pLmNhbGwodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBzZWxmKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbi8qKiovIH0sXG4vKiA0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHQvKlxuXHQgKiBJbmNsdWRlcyBjb2RlIGZyb206XG5cdCAqXG5cdCAqIGJhc2U2NC1hcnJheWJ1ZmZlclxuXHQgKiBodHRwczovL2dpdGh1Yi5jb20vbmlrbGFzdmgvYmFzZTY0LWFycmF5YnVmZmVyXG5cdCAqXG5cdCAqIENvcHlyaWdodCAoYykgMjAxMiBOaWtsYXMgdm9uIEhlcnR6ZW5cblx0ICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXHQgKi9cblx0J3VzZSBzdHJpY3QnO1xuXG5cdGV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cdChmdW5jdGlvbiAoKSB7XG5cdCAgICAndXNlIHN0cmljdCc7XG5cblx0ICAgIHZhciBnbG9iYWxPYmplY3QgPSB0aGlzO1xuXHQgICAgdmFyIG9wZW5EYXRhYmFzZSA9IHRoaXMub3BlbkRhdGFiYXNlO1xuXG5cdCAgICAvLyBJZiBXZWJTUUwgbWV0aG9kcyBhcmVuJ3QgYXZhaWxhYmxlLCB3ZSBjYW4gc3RvcCBub3cuXG5cdCAgICBpZiAoIW9wZW5EYXRhYmFzZSkge1xuXHQgICAgICAgIHJldHVybjtcblx0ICAgIH1cblxuXHQgICAgLy8gT3BlbiB0aGUgV2ViU1FMIGRhdGFiYXNlIChhdXRvbWF0aWNhbGx5IGNyZWF0ZXMgb25lIGlmIG9uZSBkaWRuJ3Rcblx0ICAgIC8vIHByZXZpb3VzbHkgZXhpc3QpLCB1c2luZyBhbnkgb3B0aW9ucyBzZXQgaW4gdGhlIGNvbmZpZy5cblx0ICAgIGZ1bmN0aW9uIF9pbml0U3RvcmFnZShvcHRpb25zKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXHQgICAgICAgIHZhciBkYkluZm8gPSB7XG5cdCAgICAgICAgICAgIGRiOiBudWxsXG5cdCAgICAgICAgfTtcblxuXHQgICAgICAgIGlmIChvcHRpb25zKSB7XG5cdCAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuXHQgICAgICAgICAgICAgICAgZGJJbmZvW2ldID0gdHlwZW9mIG9wdGlvbnNbaV0gIT09ICdzdHJpbmcnID8gb3B0aW9uc1tpXS50b1N0cmluZygpIDogb3B0aW9uc1tpXTtcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHZhciBkYkluZm9Qcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICAvLyBPcGVuIHRoZSBkYXRhYmFzZTsgdGhlIG9wZW5EYXRhYmFzZSBBUEkgd2lsbCBhdXRvbWF0aWNhbGx5XG5cdCAgICAgICAgICAgIC8vIGNyZWF0ZSBpdCBmb3IgdXMgaWYgaXQgZG9lc24ndCBleGlzdC5cblx0ICAgICAgICAgICAgdHJ5IHtcblx0ICAgICAgICAgICAgICAgIGRiSW5mby5kYiA9IG9wZW5EYXRhYmFzZShkYkluZm8ubmFtZSwgU3RyaW5nKGRiSW5mby52ZXJzaW9uKSwgZGJJbmZvLmRlc2NyaXB0aW9uLCBkYkluZm8uc2l6ZSk7XG5cdCAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnNldERyaXZlcihzZWxmLkxPQ0FMU1RPUkFHRSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2luaXRTdG9yYWdlKG9wdGlvbnMpO1xuXHQgICAgICAgICAgICAgICAgfSkudGhlbihyZXNvbHZlKVsnY2F0Y2gnXShyZWplY3QpO1xuXHQgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgLy8gQ3JlYXRlIG91ciBrZXkvdmFsdWUgdGFibGUgaWYgaXQgZG9lc24ndCBleGlzdC5cblx0ICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyAoaWQgSU5URUdFUiBQUklNQVJZIEtFWSwga2V5IHVuaXF1ZSwgdmFsdWUpJywgW10sIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICBzZWxmLl9kYkluZm8gPSBkYkluZm87XG5cdCAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXHQgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcblx0ICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB9KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgIHJlc29sdmUoX193ZWJwYWNrX3JlcXVpcmVfXygzKSk7XG5cdCAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobGliKSB7XG5cdCAgICAgICAgICAgIGRiSW5mby5zZXJpYWxpemVyID0gbGliO1xuXHQgICAgICAgICAgICByZXR1cm4gZGJJbmZvUHJvbWlzZTtcblx0ICAgICAgICB9KTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gZ2V0SXRlbShrZXksIGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG5cdCAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgIGdsb2JhbE9iamVjdC5jb25zb2xlLndhcm4oa2V5ICsgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuXHQgICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnU0VMRUNUICogRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSArICcgV0hFUkUga2V5ID0gPyBMSU1JVCAxJywgW2tleV0sIGZ1bmN0aW9uICh0LCByZXN1bHRzKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXN1bHRzLnJvd3MubGVuZ3RoID8gcmVzdWx0cy5yb3dzLml0ZW0oMCkudmFsdWUgOiBudWxsO1xuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHNlcmlhbGl6ZWQgY29udGVudCB3ZSBuZWVkIHRvXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVucGFjay5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZGJJbmZvLnNlcmlhbGl6ZXIuZGVzZXJpYWxpemUocmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcblxuXHQgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgIH0pWydjYXRjaCddKHJlamVjdCk7XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuXHQgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgfVxuXG5cdCAgICBmdW5jdGlvbiBpdGVyYXRlKGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXG5cdCAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcblx0ICAgICAgICAgICAgICAgICAgICB0LmV4ZWN1dGVTcWwoJ1NFTEVDVCAqIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUsIFtdLCBmdW5jdGlvbiAodCwgcmVzdWx0cykge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm93cyA9IHJlc3VsdHMucm93cztcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxlbmd0aCA9IHJvd3MubGVuZ3RoO1xuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gcm93cy5pdGVtKGkpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGl0ZW0udmFsdWU7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIHNlcmlhbGl6ZWQgY29udGVudFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0byB1bnBhY2suXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZGJJbmZvLnNlcmlhbGl6ZXIuZGVzZXJpYWxpemUocmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gaXRlcmF0b3IocmVzdWx0LCBpdGVtLmtleSwgaSArIDEpO1xuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB2b2lkKDApIHByZXZlbnRzIHByb2JsZW1zIHdpdGggcmVkZWZpbml0aW9uXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvZiBgdW5kZWZpbmVkYC5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHZvaWQgMCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cdCAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIHNldEl0ZW0oa2V5LCB2YWx1ZSwgY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cblx0ICAgICAgICAvLyBDYXN0IHRoZSBrZXkgdG8gYSBzdHJpbmcsIGFzIHRoYXQncyBhbGwgd2UgY2FuIHNldCBhcyBhIGtleS5cblx0ICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcblx0ICAgICAgICAgICAgZ2xvYmFsT2JqZWN0LmNvbnNvbGUud2FybihrZXkgKyAnIHVzZWQgYXMgYSBrZXksIGJ1dCBpdCBpcyBub3QgYSBzdHJpbmcuJyk7XG5cdCAgICAgICAgICAgIGtleSA9IFN0cmluZyhrZXkpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICAvLyBUaGUgbG9jYWxTdG9yYWdlIEFQSSBkb2Vzbid0IHJldHVybiB1bmRlZmluZWQgdmFsdWVzIGluIGFuXG5cdCAgICAgICAgICAgICAgICAvLyBcImV4cGVjdGVkXCIgd2F5LCBzbyB1bmRlZmluZWQgaXMgYWx3YXlzIGNhc3QgdG8gbnVsbCBpbiBhbGxcblx0ICAgICAgICAgICAgICAgIC8vIGRyaXZlcnMuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvbG9jYWxGb3JhZ2UvcHVsbC80MlxuXHQgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG51bGw7XG5cdCAgICAgICAgICAgICAgICB9XG5cblx0ICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIG9yaWdpbmFsIHZhbHVlIHRvIHBhc3MgdG8gdGhlIGNhbGxiYWNrLlxuXHQgICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIGRiSW5mby5zZXJpYWxpemVyLnNlcmlhbGl6ZSh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlLCBlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdJTlNFUlQgT1IgUkVQTEFDRSBJTlRPICcgKyBkYkluZm8uc3RvcmVOYW1lICsgJyAoa2V5LCB2YWx1ZSkgVkFMVUVTICg/LCA/KScsIFtrZXksIHZhbHVlXSwgZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob3JpZ2luYWxWYWx1ZSk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAodCwgZXJyb3IpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChzcWxFcnJvcikge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHRyYW5zYWN0aW9uIGZhaWxlZDsgY2hlY2tcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIHNlZSBpZiBpdCdzIGEgcXVvdGEgZXJyb3IuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3FsRXJyb3IuY29kZSA9PT0gc3FsRXJyb3IuUVVPVEFfRVJSKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgcmVqZWN0IHRoZSBjYWxsYmFjayBvdXRyaWdodCBmb3Igbm93LCBidXRcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdCdzIHdvcnRoIHRyeWluZyB0byByZS1ydW4gdGhlIHRyYW5zYWN0aW9uLlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV2ZW4gaWYgdGhlIHVzZXIgYWNjZXB0cyB0aGUgcHJvbXB0IHRvIHVzZVxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1vcmUgc3RvcmFnZSBvbiBTYWZhcmksIHRoaXMgZXJyb3Igd2lsbFxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJlIGNhbGxlZC5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFRyeSB0byByZS1ydW4gdGhlIHRyYW5zYWN0aW9uLlxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChzcWxFcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB9KVsnY2F0Y2gnXShyZWplY3QpO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgZnVuY3Rpb24gcmVtb3ZlSXRlbShrZXksIGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgLy8gQ2FzdCB0aGUga2V5IHRvIGEgc3RyaW5nLCBhcyB0aGF0J3MgYWxsIHdlIGNhbiBzZXQgYXMgYSBrZXkuXG5cdCAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgICAgIGdsb2JhbE9iamVjdC5jb25zb2xlLndhcm4oa2V5ICsgJyB1c2VkIGFzIGEga2V5LCBidXQgaXQgaXMgbm90IGEgc3RyaW5nLicpO1xuXHQgICAgICAgICAgICBrZXkgPSBTdHJpbmcoa2V5KTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnREVMRVRFIEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnIFdIRVJFIGtleSA9ID8nLCBba2V5XSwgZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG5cdCAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcblx0ICAgICAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB9KVsnY2F0Y2gnXShyZWplY3QpO1xuXHQgICAgICAgIH0pO1xuXG5cdCAgICAgICAgZXhlY3V0ZUNhbGxiYWNrKHByb21pc2UsIGNhbGxiYWNrKTtcblx0ICAgICAgICByZXR1cm4gcHJvbWlzZTtcblx0ICAgIH1cblxuXHQgICAgLy8gRGVsZXRlcyBldmVyeSBpdGVtIGluIHRoZSB0YWJsZS5cblx0ICAgIC8vIFRPRE86IEZpbmQgb3V0IGlmIHRoaXMgcmVzZXRzIHRoZSBBVVRPX0lOQ1JFTUVOVCBudW1iZXIuXG5cdCAgICBmdW5jdGlvbiBjbGVhcihjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXHQgICAgICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdERUxFVEUgRlJPTSAnICsgZGJJbmZvLnN0b3JlTmFtZSwgW10sIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgIH0pWydjYXRjaCddKHJlamVjdCk7XG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICBleGVjdXRlQ2FsbGJhY2socHJvbWlzZSwgY2FsbGJhY2spO1xuXHQgICAgICAgIHJldHVybiBwcm9taXNlO1xuXHQgICAgfVxuXG5cdCAgICAvLyBEb2VzIGEgc2ltcGxlIGBDT1VOVChrZXkpYCB0byBnZXQgdGhlIG51bWJlciBvZiBpdGVtcyBzdG9yZWQgaW5cblx0ICAgIC8vIGxvY2FsRm9yYWdlLlxuXHQgICAgZnVuY3Rpb24gbGVuZ3RoKGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG5cdCAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdCAgICAgICAgICAgIHNlbGYucmVhZHkoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBkYkluZm8gPSBzZWxmLl9kYkluZm87XG5cdCAgICAgICAgICAgICAgICBkYkluZm8uZGIudHJhbnNhY3Rpb24oZnVuY3Rpb24gKHQpIHtcblx0ICAgICAgICAgICAgICAgICAgICAvLyBBaGhoLCBTUUwgbWFrZXMgdGhpcyBvbmUgc29vb29vbyBlYXN5LlxuXHQgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnU0VMRUNUIENPVU5UKGtleSkgYXMgYyBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHMucm93cy5pdGVtKDApLmM7XG5cblx0ICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIC8vIFJldHVybiB0aGUga2V5IGxvY2F0ZWQgYXQga2V5IGluZGV4IFg7IGVzc2VudGlhbGx5IGdldHMgdGhlIGtleSBmcm9tIGFcblx0ICAgIC8vIGBXSEVSRSBpZCA9ID9gLiBUaGlzIGlzIHRoZSBtb3N0IGVmZmljaWVudCB3YXkgSSBjYW4gdGhpbmsgdG8gaW1wbGVtZW50XG5cdCAgICAvLyB0aGlzIHJhcmVseS11c2VkIChpbiBteSBleHBlcmllbmNlKSBwYXJ0IG9mIHRoZSBBUEksIGJ1dCBpdCBjYW4gc2VlbVxuXHQgICAgLy8gaW5jb25zaXN0ZW50LCBiZWNhdXNlIHdlIGRvIGBJTlNFUlQgT1IgUkVQTEFDRSBJTlRPYCBvbiBgc2V0SXRlbSgpYCwgc29cblx0ICAgIC8vIHRoZSBJRCBvZiBlYWNoIGtleSB3aWxsIGNoYW5nZSBldmVyeSB0aW1lIGl0J3MgdXBkYXRlZC4gUGVyaGFwcyBhIHN0b3JlZFxuXHQgICAgLy8gcHJvY2VkdXJlIGZvciB0aGUgYHNldEl0ZW0oKWAgU1FMIHdvdWxkIHNvbHZlIHRoaXMgcHJvYmxlbT9cblx0ICAgIC8vIFRPRE86IERvbid0IGNoYW5nZSBJRCBvbiBgc2V0SXRlbSgpYC5cblx0ICAgIGZ1bmN0aW9uIGtleShuLCBjYWxsYmFjaykge1xuXHQgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuXHQgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHQgICAgICAgICAgICBzZWxmLnJlYWR5KCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgICAgICAgICB2YXIgZGJJbmZvID0gc2VsZi5fZGJJbmZvO1xuXHQgICAgICAgICAgICAgICAgZGJJbmZvLmRiLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICh0KSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdC5leGVjdXRlU3FsKCdTRUxFQ1Qga2V5IEZST00gJyArIGRiSW5mby5zdG9yZU5hbWUgKyAnIFdIRVJFIGlkID0gPyBMSU1JVCAxJywgW24gKyAxXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHJlc3VsdHMucm93cy5sZW5ndGggPyByZXN1bHRzLnJvd3MuaXRlbSgwKS5rZXkgOiBudWxsO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG5cdCAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHQsIGVycm9yKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGtleXMoY2FsbGJhY2spIHtcblx0ICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cblx0ICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0ICAgICAgICAgICAgc2VsZi5yZWFkeSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHQgICAgICAgICAgICAgICAgdmFyIGRiSW5mbyA9IHNlbGYuX2RiSW5mbztcblx0ICAgICAgICAgICAgICAgIGRiSW5mby5kYi50cmFuc2FjdGlvbihmdW5jdGlvbiAodCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHQuZXhlY3V0ZVNxbCgnU0VMRUNUIGtleSBGUk9NICcgKyBkYkluZm8uc3RvcmVOYW1lLCBbXSwgZnVuY3Rpb24gKHQsIHJlc3VsdHMpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcblxuXHQgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMucm93cy5sZW5ndGg7IGkrKykge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKHJlc3VsdHMucm93cy5pdGVtKGkpLmtleSk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGtleXMpO1xuXHQgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uICh0LCBlcnJvcikge1xuXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG5cdCAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgfSlbJ2NhdGNoJ10ocmVqZWN0KTtcblx0ICAgICAgICB9KTtcblxuXHQgICAgICAgIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjayk7XG5cdCAgICAgICAgcmV0dXJuIHByb21pc2U7XG5cdCAgICB9XG5cblx0ICAgIGZ1bmN0aW9uIGV4ZWN1dGVDYWxsYmFjayhwcm9taXNlLCBjYWxsYmFjaykge1xuXHQgICAgICAgIGlmIChjYWxsYmFjaykge1xuXHQgICAgICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuXHQgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0KTtcblx0ICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG5cdCAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJvcik7XG5cdCAgICAgICAgICAgIH0pO1xuXHQgICAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgdmFyIHdlYlNRTFN0b3JhZ2UgPSB7XG5cdCAgICAgICAgX2RyaXZlcjogJ3dlYlNRTFN0b3JhZ2UnLFxuXHQgICAgICAgIF9pbml0U3RvcmFnZTogX2luaXRTdG9yYWdlLFxuXHQgICAgICAgIGl0ZXJhdGU6IGl0ZXJhdGUsXG5cdCAgICAgICAgZ2V0SXRlbTogZ2V0SXRlbSxcblx0ICAgICAgICBzZXRJdGVtOiBzZXRJdGVtLFxuXHQgICAgICAgIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0sXG5cdCAgICAgICAgY2xlYXI6IGNsZWFyLFxuXHQgICAgICAgIGxlbmd0aDogbGVuZ3RoLFxuXHQgICAgICAgIGtleToga2V5LFxuXHQgICAgICAgIGtleXM6IGtleXNcblx0ICAgIH07XG5cblx0ICAgIGV4cG9ydHNbJ2RlZmF1bHQnXSA9IHdlYlNRTFN0b3JhZ2U7XG5cdH0pLmNhbGwodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBzZWxmKTtcblx0bW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCIvLyEgbW9tZW50LmpzXG4vLyEgdmVyc2lvbiA6IDIuMTAuNlxuLy8hIGF1dGhvcnMgOiBUaW0gV29vZCwgSXNrcmVuIENoZXJuZXYsIE1vbWVudC5qcyBjb250cmlidXRvcnNcbi8vISBsaWNlbnNlIDogTUlUXG4vLyEgbW9tZW50anMuY29tXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gICAgZ2xvYmFsLm1vbWVudCA9IGZhY3RvcnkoKVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBob29rQ2FsbGJhY2s7XG5cbiAgICBmdW5jdGlvbiB1dGlsc19ob29rc19faG9va3MgKCkge1xuICAgICAgICByZXR1cm4gaG9va0NhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpcyBkb25lIHRvIHJlZ2lzdGVyIHRoZSBtZXRob2QgY2FsbGVkIHdpdGggbW9tZW50KClcbiAgICAvLyB3aXRob3V0IGNyZWF0aW5nIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgICBmdW5jdGlvbiBzZXRIb29rQ2FsbGJhY2sgKGNhbGxiYWNrKSB7XG4gICAgICAgIGhvb2tDYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQXJyYXkoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpbnB1dCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEYXRlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBpbnB1dCBpbnN0YW5jZW9mIERhdGUgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcChhcnIsIGZuKSB7XG4gICAgICAgIHZhciByZXMgPSBbXSwgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgcmVzLnB1c2goZm4oYXJyW2ldLCBpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNPd25Qcm9wKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhLCBiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRlbmQoYSwgYikge1xuICAgICAgICBmb3IgKHZhciBpIGluIGIpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKGIsIGkpKSB7XG4gICAgICAgICAgICAgICAgYVtpXSA9IGJbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzT3duUHJvcChiLCAndG9TdHJpbmcnKSkge1xuICAgICAgICAgICAgYS50b1N0cmluZyA9IGIudG9TdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzT3duUHJvcChiLCAndmFsdWVPZicpKSB7XG4gICAgICAgICAgICBhLnZhbHVlT2YgPSBiLnZhbHVlT2Y7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVfdXRjX19jcmVhdGVVVEMgKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0KSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVMb2NhbE9yVVRDKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0LCB0cnVlKS51dGMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UGFyc2luZ0ZsYWdzKCkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGRlZXAgY2xvbmUgdGhpcyBvYmplY3QuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbXB0eSAgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHVudXNlZFRva2VucyAgICA6IFtdLFxuICAgICAgICAgICAgdW51c2VkSW5wdXQgICAgIDogW10sXG4gICAgICAgICAgICBvdmVyZmxvdyAgICAgICAgOiAtMixcbiAgICAgICAgICAgIGNoYXJzTGVmdE92ZXIgICA6IDAsXG4gICAgICAgICAgICBudWxsSW5wdXQgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICAgIGludmFsaWRNb250aCAgICA6IG51bGwsXG4gICAgICAgICAgICBpbnZhbGlkRm9ybWF0ICAgOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZXJJbnZhbGlkYXRlZCA6IGZhbHNlLFxuICAgICAgICAgICAgaXNvICAgICAgICAgICAgIDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRQYXJzaW5nRmxhZ3MobSkge1xuICAgICAgICBpZiAobS5fcGYgPT0gbnVsbCkge1xuICAgICAgICAgICAgbS5fcGYgPSBkZWZhdWx0UGFyc2luZ0ZsYWdzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG0uX3BmO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkX19pc1ZhbGlkKG0pIHtcbiAgICAgICAgaWYgKG0uX2lzVmFsaWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGZsYWdzID0gZ2V0UGFyc2luZ0ZsYWdzKG0pO1xuICAgICAgICAgICAgbS5faXNWYWxpZCA9ICFpc05hTihtLl9kLmdldFRpbWUoKSkgJiZcbiAgICAgICAgICAgICAgICBmbGFncy5vdmVyZmxvdyA8IDAgJiZcbiAgICAgICAgICAgICAgICAhZmxhZ3MuZW1wdHkgJiZcbiAgICAgICAgICAgICAgICAhZmxhZ3MuaW52YWxpZE1vbnRoICYmXG4gICAgICAgICAgICAgICAgIWZsYWdzLmludmFsaWRXZWVrZGF5ICYmXG4gICAgICAgICAgICAgICAgIWZsYWdzLm51bGxJbnB1dCAmJlxuICAgICAgICAgICAgICAgICFmbGFncy5pbnZhbGlkRm9ybWF0ICYmXG4gICAgICAgICAgICAgICAgIWZsYWdzLnVzZXJJbnZhbGlkYXRlZDtcblxuICAgICAgICAgICAgaWYgKG0uX3N0cmljdCkge1xuICAgICAgICAgICAgICAgIG0uX2lzVmFsaWQgPSBtLl9pc1ZhbGlkICYmXG4gICAgICAgICAgICAgICAgICAgIGZsYWdzLmNoYXJzTGVmdE92ZXIgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgZmxhZ3MudW51c2VkVG9rZW5zLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICBmbGFncy5iaWdIb3VyID09PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG0uX2lzVmFsaWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFsaWRfX2NyZWF0ZUludmFsaWQgKGZsYWdzKSB7XG4gICAgICAgIHZhciBtID0gY3JlYXRlX3V0Y19fY3JlYXRlVVRDKE5hTik7XG4gICAgICAgIGlmIChmbGFncyAhPSBudWxsKSB7XG4gICAgICAgICAgICBleHRlbmQoZ2V0UGFyc2luZ0ZsYWdzKG0pLCBmbGFncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MobSkudXNlckludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cblxuICAgIHZhciBtb21lbnRQcm9wZXJ0aWVzID0gdXRpbHNfaG9va3NfX2hvb2tzLm1vbWVudFByb3BlcnRpZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNvcHlDb25maWcodG8sIGZyb20pIHtcbiAgICAgICAgdmFyIGksIHByb3AsIHZhbDtcblxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2lzQU1vbWVudE9iamVjdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9pc0FNb21lbnRPYmplY3QgPSBmcm9tLl9pc0FNb21lbnRPYmplY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9pICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2kgPSBmcm9tLl9pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9mID0gZnJvbS5fZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2wgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fbCA9IGZyb20uX2w7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9zdHJpY3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fc3RyaWN0ID0gZnJvbS5fc3RyaWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fdHptICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX3R6bSA9IGZyb20uX3R6bTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2lzVVRDICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2lzVVRDID0gZnJvbS5faXNVVEM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9vZmZzZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fb2Zmc2V0ID0gZnJvbS5fb2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fcGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fcGYgPSBnZXRQYXJzaW5nRmxhZ3MoZnJvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9sb2NhbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fbG9jYWxlID0gZnJvbS5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vbWVudFByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChpIGluIG1vbWVudFByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICBwcm9wID0gbW9tZW50UHJvcGVydGllc1tpXTtcbiAgICAgICAgICAgICAgICB2YWwgPSBmcm9tW3Byb3BdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICB0b1twcm9wXSA9IHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfVxuXG4gICAgdmFyIHVwZGF0ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcblxuICAgIC8vIE1vbWVudCBwcm90b3R5cGUgb2JqZWN0XG4gICAgZnVuY3Rpb24gTW9tZW50KGNvbmZpZykge1xuICAgICAgICBjb3B5Q29uZmlnKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMuX2QgPSBuZXcgRGF0ZShjb25maWcuX2QgIT0gbnVsbCA/IGNvbmZpZy5fZC5nZXRUaW1lKCkgOiBOYU4pO1xuICAgICAgICAvLyBQcmV2ZW50IGluZmluaXRlIGxvb3AgaW4gY2FzZSB1cGRhdGVPZmZzZXQgY3JlYXRlcyBuZXcgbW9tZW50XG4gICAgICAgIC8vIG9iamVjdHMuXG4gICAgICAgIGlmICh1cGRhdGVJblByb2dyZXNzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdXBkYXRlSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICB1dGlsc19ob29rc19faG9va3MudXBkYXRlT2Zmc2V0KHRoaXMpO1xuICAgICAgICAgICAgdXBkYXRlSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNNb21lbnQgKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgTW9tZW50IHx8IChvYmogIT0gbnVsbCAmJiBvYmouX2lzQU1vbWVudE9iamVjdCAhPSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhYnNGbG9vciAobnVtYmVyKSB7XG4gICAgICAgIGlmIChudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKG51bWJlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihudW1iZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9JbnQoYXJndW1lbnRGb3JDb2VyY2lvbikge1xuICAgICAgICB2YXIgY29lcmNlZE51bWJlciA9ICthcmd1bWVudEZvckNvZXJjaW9uLFxuICAgICAgICAgICAgdmFsdWUgPSAwO1xuXG4gICAgICAgIGlmIChjb2VyY2VkTnVtYmVyICE9PSAwICYmIGlzRmluaXRlKGNvZXJjZWROdW1iZXIpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGFic0Zsb29yKGNvZXJjZWROdW1iZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbXBhcmVBcnJheXMoYXJyYXkxLCBhcnJheTIsIGRvbnRDb252ZXJ0KSB7XG4gICAgICAgIHZhciBsZW4gPSBNYXRoLm1pbihhcnJheTEubGVuZ3RoLCBhcnJheTIubGVuZ3RoKSxcbiAgICAgICAgICAgIGxlbmd0aERpZmYgPSBNYXRoLmFicyhhcnJheTEubGVuZ3RoIC0gYXJyYXkyLmxlbmd0aCksXG4gICAgICAgICAgICBkaWZmcyA9IDAsXG4gICAgICAgICAgICBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoZG9udENvbnZlcnQgJiYgYXJyYXkxW2ldICE9PSBhcnJheTJbaV0pIHx8XG4gICAgICAgICAgICAgICAgKCFkb250Q29udmVydCAmJiB0b0ludChhcnJheTFbaV0pICE9PSB0b0ludChhcnJheTJbaV0pKSkge1xuICAgICAgICAgICAgICAgIGRpZmZzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRpZmZzICsgbGVuZ3RoRGlmZjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBMb2NhbGUoKSB7XG4gICAgfVxuXG4gICAgdmFyIGxvY2FsZXMgPSB7fTtcbiAgICB2YXIgZ2xvYmFsTG9jYWxlO1xuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplTG9jYWxlKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5ID8ga2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnXycsICctJykgOiBrZXk7XG4gICAgfVxuXG4gICAgLy8gcGljayB0aGUgbG9jYWxlIGZyb20gdGhlIGFycmF5XG4gICAgLy8gdHJ5IFsnZW4tYXUnLCAnZW4tZ2InXSBhcyAnZW4tYXUnLCAnZW4tZ2InLCAnZW4nLCBhcyBpbiBtb3ZlIHRocm91Z2ggdGhlIGxpc3QgdHJ5aW5nIGVhY2hcbiAgICAvLyBzdWJzdHJpbmcgZnJvbSBtb3N0IHNwZWNpZmljIHRvIGxlYXN0LCBidXQgbW92ZSB0byB0aGUgbmV4dCBhcnJheSBpdGVtIGlmIGl0J3MgYSBtb3JlIHNwZWNpZmljIHZhcmlhbnQgdGhhbiB0aGUgY3VycmVudCByb290XG4gICAgZnVuY3Rpb24gY2hvb3NlTG9jYWxlKG5hbWVzKSB7XG4gICAgICAgIHZhciBpID0gMCwgaiwgbmV4dCwgbG9jYWxlLCBzcGxpdDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc3BsaXQgPSBub3JtYWxpemVMb2NhbGUobmFtZXNbaV0pLnNwbGl0KCctJyk7XG4gICAgICAgICAgICBqID0gc3BsaXQubGVuZ3RoO1xuICAgICAgICAgICAgbmV4dCA9IG5vcm1hbGl6ZUxvY2FsZShuYW1lc1tpICsgMV0pO1xuICAgICAgICAgICAgbmV4dCA9IG5leHQgPyBuZXh0LnNwbGl0KCctJykgOiBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKGogPiAwKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxlID0gbG9hZExvY2FsZShzcGxpdC5zbGljZSgwLCBqKS5qb2luKCctJykpO1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dC5sZW5ndGggPj0gaiAmJiBjb21wYXJlQXJyYXlzKHNwbGl0LCBuZXh0LCB0cnVlKSA+PSBqIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvL3RoZSBuZXh0IGFycmF5IGl0ZW0gaXMgYmV0dGVyIHRoYW4gYSBzaGFsbG93ZXIgc3Vic3RyaW5nIG9mIHRoaXMgb25lXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqLS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZExvY2FsZShuYW1lKSB7XG4gICAgICAgIHZhciBvbGRMb2NhbGUgPSBudWxsO1xuICAgICAgICAvLyBUT0RPOiBGaW5kIGEgYmV0dGVyIHdheSB0byByZWdpc3RlciBhbmQgbG9hZCBhbGwgdGhlIGxvY2FsZXMgaW4gTm9kZVxuICAgICAgICBpZiAoIWxvY2FsZXNbbmFtZV0gJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgICAgICBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgb2xkTG9jYWxlID0gZ2xvYmFsTG9jYWxlLl9hYmJyO1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vbG9jYWxlLycgKyBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIGRlZmluZUxvY2FsZSBjdXJyZW50bHkgYWxzbyBzZXRzIHRoZSBnbG9iYWwgbG9jYWxlLCB3ZVxuICAgICAgICAgICAgICAgIC8vIHdhbnQgdG8gdW5kbyB0aGF0IGZvciBsYXp5IGxvYWRlZCBsb2NhbGVzXG4gICAgICAgICAgICAgICAgbG9jYWxlX2xvY2FsZXNfX2dldFNldEdsb2JhbExvY2FsZShvbGRMb2NhbGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2FsZXNbbmFtZV07XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGxvYWQgbG9jYWxlIGFuZCB0aGVuIHNldCB0aGUgZ2xvYmFsIGxvY2FsZS4gIElmXG4gICAgLy8gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWQgaW4sIGl0IHdpbGwgc2ltcGx5IHJldHVybiB0aGUgY3VycmVudCBnbG9iYWxcbiAgICAvLyBsb2NhbGUga2V5LlxuICAgIGZ1bmN0aW9uIGxvY2FsZV9sb2NhbGVzX19nZXRTZXRHbG9iYWxMb2NhbGUgKGtleSwgdmFsdWVzKSB7XG4gICAgICAgIHZhciBkYXRhO1xuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gbG9jYWxlX2xvY2FsZXNfX2dldExvY2FsZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRlZmluZUxvY2FsZShrZXksIHZhbHVlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gbW9tZW50LmR1cmF0aW9uLl9sb2NhbGUgPSBtb21lbnQuX2xvY2FsZSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgZ2xvYmFsTG9jYWxlID0gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnbG9iYWxMb2NhbGUuX2FiYnI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVmaW5lTG9jYWxlIChuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgaWYgKHZhbHVlcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWVzLmFiYnIgPSBuYW1lO1xuICAgICAgICAgICAgbG9jYWxlc1tuYW1lXSA9IGxvY2FsZXNbbmFtZV0gfHwgbmV3IExvY2FsZSgpO1xuICAgICAgICAgICAgbG9jYWxlc1tuYW1lXS5zZXQodmFsdWVzKTtcblxuICAgICAgICAgICAgLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm93OiBhbHNvIHNldCB0aGUgbG9jYWxlXG4gICAgICAgICAgICBsb2NhbGVfbG9jYWxlc19fZ2V0U2V0R2xvYmFsTG9jYWxlKG5hbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlc1tuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHVzZWZ1bCBmb3IgdGVzdGluZ1xuICAgICAgICAgICAgZGVsZXRlIGxvY2FsZXNbbmFtZV07XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybnMgbG9jYWxlIGRhdGFcbiAgICBmdW5jdGlvbiBsb2NhbGVfbG9jYWxlc19fZ2V0TG9jYWxlIChrZXkpIHtcbiAgICAgICAgdmFyIGxvY2FsZTtcblxuICAgICAgICBpZiAoa2V5ICYmIGtleS5fbG9jYWxlICYmIGtleS5fbG9jYWxlLl9hYmJyKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXkuX2xvY2FsZS5fYWJicjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsTG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0FycmF5KGtleSkpIHtcbiAgICAgICAgICAgIC8vc2hvcnQtY2lyY3VpdCBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgICAgIGxvY2FsZSA9IGxvYWRMb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5ID0gW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hvb3NlTG9jYWxlKGtleSk7XG4gICAgfVxuXG4gICAgdmFyIGFsaWFzZXMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGFkZFVuaXRBbGlhcyAodW5pdCwgc2hvcnRoYW5kKSB7XG4gICAgICAgIHZhciBsb3dlckNhc2UgPSB1bml0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGFsaWFzZXNbbG93ZXJDYXNlXSA9IGFsaWFzZXNbbG93ZXJDYXNlICsgJ3MnXSA9IGFsaWFzZXNbc2hvcnRoYW5kXSA9IHVuaXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplVW5pdHModW5pdHMpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB1bml0cyA9PT0gJ3N0cmluZycgPyBhbGlhc2VzW3VuaXRzXSB8fCBhbGlhc2VzW3VuaXRzLnRvTG93ZXJDYXNlKCldIDogdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZU9iamVjdFVuaXRzKGlucHV0T2JqZWN0KSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQgPSB7fSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRQcm9wLFxuICAgICAgICAgICAgcHJvcDtcblxuICAgICAgICBmb3IgKHByb3AgaW4gaW5wdXRPYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKGlucHV0T2JqZWN0LCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplVW5pdHMocHJvcCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dFtub3JtYWxpemVkUHJvcF0gPSBpbnB1dE9iamVjdFtwcm9wXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZElucHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VHZXRTZXQgKHVuaXQsIGtlZXBUaW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZ2V0X3NldF9fc2V0KHRoaXMsIHVuaXQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB1dGlsc19ob29rc19faG9va3MudXBkYXRlT2Zmc2V0KHRoaXMsIGtlZXBUaW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldF9zZXRfX2dldCh0aGlzLCB1bml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRfc2V0X19nZXQgKG1vbSwgdW5pdCkge1xuICAgICAgICByZXR1cm4gbW9tLl9kWydnZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArIHVuaXRdKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0X3NldF9fc2V0IChtb20sIHVuaXQsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBtb20uX2RbJ3NldCcgKyAobW9tLl9pc1VUQyA/ICdVVEMnIDogJycpICsgdW5pdF0odmFsdWUpO1xuICAgIH1cblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIGdldFNldCAodW5pdHMsIHZhbHVlKSB7XG4gICAgICAgIHZhciB1bml0O1xuICAgICAgICBpZiAodHlwZW9mIHVuaXRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yICh1bml0IGluIHVuaXRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQodW5pdCwgdW5pdHNbdW5pdF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXNbdW5pdHNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHNdKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB6ZXJvRmlsbChudW1iZXIsIHRhcmdldExlbmd0aCwgZm9yY2VTaWduKSB7XG4gICAgICAgIHZhciBhYnNOdW1iZXIgPSAnJyArIE1hdGguYWJzKG51bWJlciksXG4gICAgICAgICAgICB6ZXJvc1RvRmlsbCA9IHRhcmdldExlbmd0aCAtIGFic051bWJlci5sZW5ndGgsXG4gICAgICAgICAgICBzaWduID0gbnVtYmVyID49IDA7XG4gICAgICAgIHJldHVybiAoc2lnbiA/IChmb3JjZVNpZ24gPyAnKycgOiAnJykgOiAnLScpICtcbiAgICAgICAgICAgIE1hdGgucG93KDEwLCBNYXRoLm1heCgwLCB6ZXJvc1RvRmlsbCkpLnRvU3RyaW5nKCkuc3Vic3RyKDEpICsgYWJzTnVtYmVyO1xuICAgIH1cblxuICAgIHZhciBmb3JtYXR0aW5nVG9rZW5zID0gLyhcXFtbXlxcW10qXFxdKXwoXFxcXCk/KE1vfE1NP00/TT98RG98REREb3xERD9EP0Q/fGRkZD9kP3xkbz98d1tvfHddP3xXW298V10/fFF8WVlZWVlZfFlZWVlZfFlZWVl8WVl8Z2coZ2dnPyk/fEdHKEdHRz8pP3xlfEV8YXxBfGhoP3xISD98bW0/fHNzP3xTezEsOX18eHxYfHp6P3xaWj98LikvZztcblxuICAgIHZhciBsb2NhbEZvcm1hdHRpbmdUb2tlbnMgPSAvKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oTFRTfExUfExMP0w/TD98bHsxLDR9KS9nO1xuXG4gICAgdmFyIGZvcm1hdEZ1bmN0aW9ucyA9IHt9O1xuXG4gICAgdmFyIGZvcm1hdFRva2VuRnVuY3Rpb25zID0ge307XG5cbiAgICAvLyB0b2tlbjogICAgJ00nXG4gICAgLy8gcGFkZGVkOiAgIFsnTU0nLCAyXVxuICAgIC8vIG9yZGluYWw6ICAnTW8nXG4gICAgLy8gY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHsgdGhpcy5tb250aCgpICsgMSB9XG4gICAgZnVuY3Rpb24gYWRkRm9ybWF0VG9rZW4gKHRva2VuLCBwYWRkZWQsIG9yZGluYWwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBmdW5jID0gY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBmdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzW2NhbGxiYWNrXSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zW3Rva2VuXSA9IGZ1bmM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhZGRlZCkge1xuICAgICAgICAgICAgZm9ybWF0VG9rZW5GdW5jdGlvbnNbcGFkZGVkWzBdXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gemVyb0ZpbGwoZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCBwYWRkZWRbMV0sIHBhZGRlZFsyXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcmRpbmFsKSB7XG4gICAgICAgICAgICBmb3JtYXRUb2tlbkZ1bmN0aW9uc1tvcmRpbmFsXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkub3JkaW5hbChmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHRva2VuKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVGb3JtYXR0aW5nVG9rZW5zKGlucHV0KSB7XG4gICAgICAgIGlmIChpbnB1dC5tYXRjaCgvXFxbW1xcc1xcU10vKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL15cXFt8XFxdJC9nLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VGb3JtYXRGdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gZm9ybWF0Lm1hdGNoKGZvcm1hdHRpbmdUb2tlbnMpLCBpLCBsZW5ndGg7XG5cbiAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChmb3JtYXRUb2tlbkZ1bmN0aW9uc1thcnJheVtpXV0pIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IGZvcm1hdFRva2VuRnVuY3Rpb25zW2FycmF5W2ldXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSByZW1vdmVGb3JtYXR0aW5nVG9rZW5zKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobW9tKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYXJyYXlbaV0gaW5zdGFuY2VvZiBGdW5jdGlvbiA/IGFycmF5W2ldLmNhbGwobW9tLCBmb3JtYXQpIDogYXJyYXlbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGZvcm1hdCBkYXRlIHVzaW5nIG5hdGl2ZSBkYXRlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGZvcm1hdE1vbWVudChtLCBmb3JtYXQpIHtcbiAgICAgICAgaWYgKCFtLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG0ubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXQgPSBleHBhbmRGb3JtYXQoZm9ybWF0LCBtLmxvY2FsZURhdGEoKSk7XG4gICAgICAgIGZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdID0gZm9ybWF0RnVuY3Rpb25zW2Zvcm1hdF0gfHwgbWFrZUZvcm1hdEZ1bmN0aW9uKGZvcm1hdCk7XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdKG0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cGFuZEZvcm1hdChmb3JtYXQsIGxvY2FsZSkge1xuICAgICAgICB2YXIgaSA9IDU7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLmxvbmdEYXRlRm9ybWF0KGlucHV0KSB8fCBpbnB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoaSA+PSAwICYmIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy50ZXN0KGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKGxvY2FsRm9ybWF0dGluZ1Rva2VucywgcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKTtcbiAgICAgICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2gxICAgICAgICAgPSAvXFxkLzsgICAgICAgICAgICAvLyAgICAgICAwIC0gOVxuICAgIHZhciBtYXRjaDIgICAgICAgICA9IC9cXGRcXGQvOyAgICAgICAgICAvLyAgICAgIDAwIC0gOTlcbiAgICB2YXIgbWF0Y2gzICAgICAgICAgPSAvXFxkezN9LzsgICAgICAgICAvLyAgICAgMDAwIC0gOTk5XG4gICAgdmFyIG1hdGNoNCAgICAgICAgID0gL1xcZHs0fS87ICAgICAgICAgLy8gICAgMDAwMCAtIDk5OTlcbiAgICB2YXIgbWF0Y2g2ICAgICAgICAgPSAvWystXT9cXGR7Nn0vOyAgICAvLyAtOTk5OTk5IC0gOTk5OTk5XG4gICAgdmFyIG1hdGNoMXRvMiAgICAgID0gL1xcZFxcZD8vOyAgICAgICAgIC8vICAgICAgIDAgLSA5OVxuICAgIHZhciBtYXRjaDF0bzMgICAgICA9IC9cXGR7MSwzfS87ICAgICAgIC8vICAgICAgIDAgLSA5OTlcbiAgICB2YXIgbWF0Y2gxdG80ICAgICAgPSAvXFxkezEsNH0vOyAgICAgICAvLyAgICAgICAwIC0gOTk5OVxuICAgIHZhciBtYXRjaDF0bzYgICAgICA9IC9bKy1dP1xcZHsxLDZ9LzsgIC8vIC05OTk5OTkgLSA5OTk5OTlcblxuICAgIHZhciBtYXRjaFVuc2lnbmVkICA9IC9cXGQrLzsgICAgICAgICAgIC8vICAgICAgIDAgLSBpbmZcbiAgICB2YXIgbWF0Y2hTaWduZWQgICAgPSAvWystXT9cXGQrLzsgICAgICAvLyAgICAtaW5mIC0gaW5mXG5cbiAgICB2YXIgbWF0Y2hPZmZzZXQgICAgPSAvWnxbKy1dXFxkXFxkOj9cXGRcXGQvZ2k7IC8vICswMDowMCAtMDA6MDAgKzAwMDAgLTAwMDAgb3IgWlxuXG4gICAgdmFyIG1hdGNoVGltZXN0YW1wID0gL1srLV0/XFxkKyhcXC5cXGR7MSwzfSk/LzsgLy8gMTIzNDU2Nzg5IDEyMzQ1Njc4OS4xMjNcblxuICAgIC8vIGFueSB3b3JkIChvciB0d28pIGNoYXJhY3RlcnMgb3IgbnVtYmVycyBpbmNsdWRpbmcgdHdvL3RocmVlIHdvcmQgbW9udGggaW4gYXJhYmljLlxuICAgIHZhciBtYXRjaFdvcmQgPSAvWzAtOV0qWydhLXpcXHUwMEEwLVxcdTA1RkZcXHUwNzAwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdK3xbXFx1MDYwMC1cXHUwNkZGXFwvXSsoXFxzKj9bXFx1MDYwMC1cXHUwNkZGXSspezEsMn0vaTtcblxuICAgIHZhciByZWdleGVzID0ge307XG5cbiAgICBmdW5jdGlvbiBpc0Z1bmN0aW9uIChzdGgpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzIzMjVcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzdGggPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdGgpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gYWRkUmVnZXhUb2tlbiAodG9rZW4sIHJlZ2V4LCBzdHJpY3RSZWdleCkge1xuICAgICAgICByZWdleGVzW3Rva2VuXSA9IGlzRnVuY3Rpb24ocmVnZXgpID8gcmVnZXggOiBmdW5jdGlvbiAoaXNTdHJpY3QpIHtcbiAgICAgICAgICAgIHJldHVybiAoaXNTdHJpY3QgJiYgc3RyaWN0UmVnZXgpID8gc3RyaWN0UmVnZXggOiByZWdleDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRQYXJzZVJlZ2V4Rm9yVG9rZW4gKHRva2VuLCBjb25maWcpIHtcbiAgICAgICAgaWYgKCFoYXNPd25Qcm9wKHJlZ2V4ZXMsIHRva2VuKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodW5lc2NhcGVGb3JtYXQodG9rZW4pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWdleGVzW3Rva2VuXShjb25maWcuX3N0cmljdCwgY29uZmlnLl9sb2NhbGUpO1xuICAgIH1cblxuICAgIC8vIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM1NjE0OTMvaXMtdGhlcmUtYS1yZWdleHAtZXNjYXBlLWZ1bmN0aW9uLWluLWphdmFzY3JpcHRcbiAgICBmdW5jdGlvbiB1bmVzY2FwZUZvcm1hdChzKSB7XG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoJ1xcXFwnLCAnJykucmVwbGFjZSgvXFxcXChcXFspfFxcXFwoXFxdKXxcXFsoW15cXF1cXFtdKilcXF18XFxcXCguKS9nLCBmdW5jdGlvbiAobWF0Y2hlZCwgcDEsIHAyLCBwMywgcDQpIHtcbiAgICAgICAgICAgIHJldHVybiBwMSB8fCBwMiB8fCBwMyB8fCBwNDtcbiAgICAgICAgfSkucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJyk7XG4gICAgfVxuXG4gICAgdmFyIHRva2VucyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gYWRkUGFyc2VUb2tlbiAodG9rZW4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBpLCBmdW5jID0gY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0b2tlbiA9IFt0b2tlbl07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGZ1bmMgPSBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbY2FsbGJhY2tdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdG9rZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRva2Vuc1t0b2tlbltpXV0gPSBmdW5jO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkV2Vla1BhcnNlVG9rZW4gKHRva2VuLCBjYWxsYmFjaykge1xuICAgICAgICBhZGRQYXJzZVRva2VuKHRva2VuLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcsIHRva2VuKSB7XG4gICAgICAgICAgICBjb25maWcuX3cgPSBjb25maWcuX3cgfHwge307XG4gICAgICAgICAgICBjYWxsYmFjayhpbnB1dCwgY29uZmlnLl93LCBjb25maWcsIHRva2VuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkVGltZVRvQXJyYXlGcm9tVG9rZW4odG9rZW4sIGlucHV0LCBjb25maWcpIHtcbiAgICAgICAgaWYgKGlucHV0ICE9IG51bGwgJiYgaGFzT3duUHJvcCh0b2tlbnMsIHRva2VuKSkge1xuICAgICAgICAgICAgdG9rZW5zW3Rva2VuXShpbnB1dCwgY29uZmlnLl9hLCBjb25maWcsIHRva2VuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBZRUFSID0gMDtcbiAgICB2YXIgTU9OVEggPSAxO1xuICAgIHZhciBEQVRFID0gMjtcbiAgICB2YXIgSE9VUiA9IDM7XG4gICAgdmFyIE1JTlVURSA9IDQ7XG4gICAgdmFyIFNFQ09ORCA9IDU7XG4gICAgdmFyIE1JTExJU0VDT05EID0gNjtcblxuICAgIGZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCArIDEsIDApKS5nZXRVVENEYXRlKCk7XG4gICAgfVxuXG4gICAgLy8gRk9STUFUVElOR1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ00nLCBbJ01NJywgMl0sICdNbycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9udGgoKSArIDE7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignTU1NJywgMCwgMCwgZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubW9udGhzU2hvcnQodGhpcywgZm9ybWF0KTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdNTU1NJywgMCwgMCwgZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubW9udGhzKHRoaXMsIGZvcm1hdCk7XG4gICAgfSk7XG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ21vbnRoJywgJ00nKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ00nLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ01NJywgICBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignTU1NJywgIG1hdGNoV29yZCk7XG4gICAgYWRkUmVnZXhUb2tlbignTU1NTScsIG1hdGNoV29yZCk7XG5cbiAgICBhZGRQYXJzZVRva2VuKFsnTScsICdNTSddLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5W01PTlRIXSA9IHRvSW50KGlucHV0KSAtIDE7XG4gICAgfSk7XG5cbiAgICBhZGRQYXJzZVRva2VuKFsnTU1NJywgJ01NTU0nXSwgZnVuY3Rpb24gKGlucHV0LCBhcnJheSwgY29uZmlnLCB0b2tlbikge1xuICAgICAgICB2YXIgbW9udGggPSBjb25maWcuX2xvY2FsZS5tb250aHNQYXJzZShpbnB1dCwgdG9rZW4sIGNvbmZpZy5fc3RyaWN0KTtcbiAgICAgICAgLy8gaWYgd2UgZGlkbid0IGZpbmQgYSBtb250aCBuYW1lLCBtYXJrIHRoZSBkYXRlIGFzIGludmFsaWQuXG4gICAgICAgIGlmIChtb250aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBhcnJheVtNT05USF0gPSBtb250aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmludmFsaWRNb250aCA9IGlucHV0O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBMT0NBTEVTXG5cbiAgICB2YXIgZGVmYXVsdExvY2FsZU1vbnRocyA9ICdKYW51YXJ5X0ZlYnJ1YXJ5X01hcmNoX0FwcmlsX01heV9KdW5lX0p1bHlfQXVndXN0X1NlcHRlbWJlcl9PY3RvYmVyX05vdmVtYmVyX0RlY2VtYmVyJy5zcGxpdCgnXycpO1xuICAgIGZ1bmN0aW9uIGxvY2FsZU1vbnRocyAobSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9udGhzW20ubW9udGgoKV07XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGVNb250aHNTaG9ydCA9ICdKYW5fRmViX01hcl9BcHJfTWF5X0p1bl9KdWxfQXVnX1NlcF9PY3RfTm92X0RlYycuc3BsaXQoJ18nKTtcbiAgICBmdW5jdGlvbiBsb2NhbGVNb250aHNTaG9ydCAobSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9udGhzU2hvcnRbbS5tb250aCgpXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVNb250aHNQYXJzZSAobW9udGhOYW1lLCBmb3JtYXQsIHN0cmljdCkge1xuICAgICAgICB2YXIgaSwgbW9tLCByZWdleDtcblxuICAgICAgICBpZiAoIXRoaXMuX21vbnRoc1BhcnNlKSB7XG4gICAgICAgICAgICB0aGlzLl9tb250aHNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fbG9uZ01vbnRoc1BhcnNlID0gW107XG4gICAgICAgICAgICB0aGlzLl9zaG9ydE1vbnRoc1BhcnNlID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG4gICAgICAgICAgICBtb20gPSBjcmVhdGVfdXRjX19jcmVhdGVVVEMoWzIwMDAsIGldKTtcbiAgICAgICAgICAgIGlmIChzdHJpY3QgJiYgIXRoaXMuX2xvbmdNb250aHNQYXJzZVtpXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbmdNb250aHNQYXJzZVtpXSA9IG5ldyBSZWdFeHAoJ14nICsgdGhpcy5tb250aHMobW9tLCAnJykucmVwbGFjZSgnLicsICcnKSArICckJywgJ2knKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zaG9ydE1vbnRoc1BhcnNlW2ldID0gbmV3IFJlZ0V4cCgnXicgKyB0aGlzLm1vbnRoc1Nob3J0KG1vbSwgJycpLnJlcGxhY2UoJy4nLCAnJykgKyAnJCcsICdpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXN0cmljdCAmJiAhdGhpcy5fbW9udGhzUGFyc2VbaV0pIHtcbiAgICAgICAgICAgICAgICByZWdleCA9ICdeJyArIHRoaXMubW9udGhzKG1vbSwgJycpICsgJ3xeJyArIHRoaXMubW9udGhzU2hvcnQobW9tLCAnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKHJlZ2V4LnJlcGxhY2UoJy4nLCAnJyksICdpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0ZXN0IHRoZSByZWdleFxuICAgICAgICAgICAgaWYgKHN0cmljdCAmJiBmb3JtYXQgPT09ICdNTU1NJyAmJiB0aGlzLl9sb25nTW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0cmljdCAmJiBmb3JtYXQgPT09ICdNTU0nICYmIHRoaXMuX3Nob3J0TW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzdHJpY3QgJiYgdGhpcy5fbW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICBmdW5jdGlvbiBzZXRNb250aCAobW9tLCB2YWx1ZSkge1xuICAgICAgICB2YXIgZGF5T2ZNb250aDtcblxuICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgb3V0IG9mIGhlcmUhXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG1vbS5sb2NhbGVEYXRhKCkubW9udGhzUGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgLy8gVE9ETzogQW5vdGhlciBzaWxlbnQgZmFpbHVyZT9cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRheU9mTW9udGggPSBNYXRoLm1pbihtb20uZGF0ZSgpLCBkYXlzSW5Nb250aChtb20ueWVhcigpLCB2YWx1ZSkpO1xuICAgICAgICBtb20uX2RbJ3NldCcgKyAobW9tLl9pc1VUQyA/ICdVVEMnIDogJycpICsgJ01vbnRoJ10odmFsdWUsIGRheU9mTW9udGgpO1xuICAgICAgICByZXR1cm4gbW9tO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNldE1vbnRoICh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgc2V0TW9udGgodGhpcywgdmFsdWUpO1xuICAgICAgICAgICAgdXRpbHNfaG9va3NfX2hvb2tzLnVwZGF0ZU9mZnNldCh0aGlzLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldF9zZXRfX2dldCh0aGlzLCAnTW9udGgnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERheXNJbk1vbnRoICgpIHtcbiAgICAgICAgcmV0dXJuIGRheXNJbk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrT3ZlcmZsb3cgKG0pIHtcbiAgICAgICAgdmFyIG92ZXJmbG93O1xuICAgICAgICB2YXIgYSA9IG0uX2E7XG5cbiAgICAgICAgaWYgKGEgJiYgZ2V0UGFyc2luZ0ZsYWdzKG0pLm92ZXJmbG93ID09PSAtMikge1xuICAgICAgICAgICAgb3ZlcmZsb3cgPVxuICAgICAgICAgICAgICAgIGFbTU9OVEhdICAgICAgIDwgMCB8fCBhW01PTlRIXSAgICAgICA+IDExICA/IE1PTlRIIDpcbiAgICAgICAgICAgICAgICBhW0RBVEVdICAgICAgICA8IDEgfHwgYVtEQVRFXSAgICAgICAgPiBkYXlzSW5Nb250aChhW1lFQVJdLCBhW01PTlRIXSkgPyBEQVRFIDpcbiAgICAgICAgICAgICAgICBhW0hPVVJdICAgICAgICA8IDAgfHwgYVtIT1VSXSAgICAgICAgPiAyNCB8fCAoYVtIT1VSXSA9PT0gMjQgJiYgKGFbTUlOVVRFXSAhPT0gMCB8fCBhW1NFQ09ORF0gIT09IDAgfHwgYVtNSUxMSVNFQ09ORF0gIT09IDApKSA/IEhPVVIgOlxuICAgICAgICAgICAgICAgIGFbTUlOVVRFXSAgICAgIDwgMCB8fCBhW01JTlVURV0gICAgICA+IDU5ICA/IE1JTlVURSA6XG4gICAgICAgICAgICAgICAgYVtTRUNPTkRdICAgICAgPCAwIHx8IGFbU0VDT05EXSAgICAgID4gNTkgID8gU0VDT05EIDpcbiAgICAgICAgICAgICAgICBhW01JTExJU0VDT05EXSA8IDAgfHwgYVtNSUxMSVNFQ09ORF0gPiA5OTkgPyBNSUxMSVNFQ09ORCA6XG4gICAgICAgICAgICAgICAgLTE7XG5cbiAgICAgICAgICAgIGlmIChnZXRQYXJzaW5nRmxhZ3MobSkuX292ZXJmbG93RGF5T2ZZZWFyICYmIChvdmVyZmxvdyA8IFlFQVIgfHwgb3ZlcmZsb3cgPiBEQVRFKSkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gREFURTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKG0pLm92ZXJmbG93ID0gb3ZlcmZsb3c7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YXJuKG1zZykge1xuICAgICAgICBpZiAodXRpbHNfaG9va3NfX2hvb2tzLnN1cHByZXNzRGVwcmVjYXRpb25XYXJuaW5ncyA9PT0gZmFsc2UgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdEZXByZWNhdGlvbiB3YXJuaW5nOiAnICsgbXNnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlcHJlY2F0ZShtc2csIGZuKSB7XG4gICAgICAgIHZhciBmaXJzdFRpbWUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBleHRlbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0VGltZSkge1xuICAgICAgICAgICAgICAgIHdhcm4obXNnICsgJ1xcbicgKyAobmV3IEVycm9yKCkpLnN0YWNrKTtcbiAgICAgICAgICAgICAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBmbik7XG4gICAgfVxuXG4gICAgdmFyIGRlcHJlY2F0aW9ucyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlU2ltcGxlKG5hbWUsIG1zZykge1xuICAgICAgICBpZiAoIWRlcHJlY2F0aW9uc1tuYW1lXSkge1xuICAgICAgICAgICAgd2Fybihtc2cpO1xuICAgICAgICAgICAgZGVwcmVjYXRpb25zW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHV0aWxzX2hvb2tzX19ob29rcy5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3MgPSBmYWxzZTtcblxuICAgIHZhciBmcm9tX3N0cmluZ19faXNvUmVnZXggPSAvXlxccyooPzpbKy1dXFxkezZ9fFxcZHs0fSktKD86KFxcZFxcZC1cXGRcXGQpfChXXFxkXFxkJCl8KFdcXGRcXGQtXFxkKXwoXFxkXFxkXFxkKSkoKFR8ICkoXFxkXFxkKDpcXGRcXGQoOlxcZFxcZChcXC5cXGQrKT8pPyk/KT8oW1xcK1xcLV1cXGRcXGQoPzo6P1xcZFxcZCk/fFxccypaKT8pPyQvO1xuXG4gICAgdmFyIGlzb0RhdGVzID0gW1xuICAgICAgICBbJ1lZWVlZWS1NTS1ERCcsIC9bKy1dXFxkezZ9LVxcZHsyfS1cXGR7Mn0vXSxcbiAgICAgICAgWydZWVlZLU1NLUREJywgL1xcZHs0fS1cXGR7Mn0tXFxkezJ9L10sXG4gICAgICAgIFsnR0dHRy1bV11XVy1FJywgL1xcZHs0fS1XXFxkezJ9LVxcZC9dLFxuICAgICAgICBbJ0dHR0ctW1ddV1cnLCAvXFxkezR9LVdcXGR7Mn0vXSxcbiAgICAgICAgWydZWVlZLURERCcsIC9cXGR7NH0tXFxkezN9L11cbiAgICBdO1xuXG4gICAgLy8gaXNvIHRpbWUgZm9ybWF0cyBhbmQgcmVnZXhlc1xuICAgIHZhciBpc29UaW1lcyA9IFtcbiAgICAgICAgWydISDptbTpzcy5TU1NTJywgLyhUfCApXFxkXFxkOlxcZFxcZDpcXGRcXGRcXC5cXGQrL10sXG4gICAgICAgIFsnSEg6bW06c3MnLCAvKFR8IClcXGRcXGQ6XFxkXFxkOlxcZFxcZC9dLFxuICAgICAgICBbJ0hIOm1tJywgLyhUfCApXFxkXFxkOlxcZFxcZC9dLFxuICAgICAgICBbJ0hIJywgLyhUfCApXFxkXFxkL11cbiAgICBdO1xuXG4gICAgdmFyIGFzcE5ldEpzb25SZWdleCA9IC9eXFwvP0RhdGVcXCgoXFwtP1xcZCspL2k7XG5cbiAgICAvLyBkYXRlIGZyb20gaXNvIGZvcm1hdFxuICAgIGZ1bmN0aW9uIGNvbmZpZ0Zyb21JU08oY29uZmlnKSB7XG4gICAgICAgIHZhciBpLCBsLFxuICAgICAgICAgICAgc3RyaW5nID0gY29uZmlnLl9pLFxuICAgICAgICAgICAgbWF0Y2ggPSBmcm9tX3N0cmluZ19faXNvUmVnZXguZXhlYyhzdHJpbmcpO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuaXNvID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBpc29EYXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNvRGF0ZXNbaV1bMV0uZXhlYyhzdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fZiA9IGlzb0RhdGVzW2ldWzBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gaXNvVGltZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzb1RpbWVzW2ldWzFdLmV4ZWMoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaFs2XSBzaG91bGQgYmUgJ1QnIG9yIHNwYWNlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fZiArPSAobWF0Y2hbNl0gfHwgJyAnKSArIGlzb1RpbWVzW2ldWzBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RyaW5nLm1hdGNoKG1hdGNoT2Zmc2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fZiArPSAnWic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maWdGcm9tU3RyaW5nQW5kRm9ybWF0KGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcuX2lzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRhdGUgZnJvbSBpc28gZm9ybWF0IG9yIGZhbGxiYWNrXG4gICAgZnVuY3Rpb24gY29uZmlnRnJvbVN0cmluZyhjb25maWcpIHtcbiAgICAgICAgdmFyIG1hdGNoZWQgPSBhc3BOZXRKc29uUmVnZXguZXhlYyhjb25maWcuX2kpO1xuXG4gICAgICAgIGlmIChtYXRjaGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZSgrbWF0Y2hlZFsxXSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWdGcm9tSVNPKGNvbmZpZyk7XG4gICAgICAgIGlmIChjb25maWcuX2lzVmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnLl9pc1ZhbGlkO1xuICAgICAgICAgICAgdXRpbHNfaG9va3NfX2hvb2tzLmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB1dGlsc19ob29rc19faG9va3MuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2sgPSBkZXByZWNhdGUoXG4gICAgICAgICdtb21lbnQgY29uc3RydWN0aW9uIGZhbGxzIGJhY2sgdG8ganMgRGF0ZS4gVGhpcyBpcyAnICtcbiAgICAgICAgJ2Rpc2NvdXJhZ2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdXBjb21pbmcgbWFqb3IgJyArXG4gICAgICAgICdyZWxlYXNlLiBQbGVhc2UgcmVmZXIgdG8gJyArXG4gICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQwNyBmb3IgbW9yZSBpbmZvLicsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKGNvbmZpZy5faSArIChjb25maWcuX3VzZVVUQyA/ICcgVVRDJyA6ICcnKSk7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRGF0ZSAoeSwgbSwgZCwgaCwgTSwgcywgbXMpIHtcbiAgICAgICAgLy9jYW4ndCBqdXN0IGFwcGx5KCkgdG8gY3JlYXRlIGEgZGF0ZTpcbiAgICAgICAgLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE4MTM0OC9pbnN0YW50aWF0aW5nLWEtamF2YXNjcmlwdC1vYmplY3QtYnktY2FsbGluZy1wcm90b3R5cGUtY29uc3RydWN0b3ItYXBwbHlcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh5LCBtLCBkLCBoLCBNLCBzLCBtcyk7XG5cbiAgICAgICAgLy90aGUgZGF0ZSBjb25zdHJ1Y3RvciBkb2Vzbid0IGFjY2VwdCB5ZWFycyA8IDE5NzBcbiAgICAgICAgaWYgKHkgPCAxOTcwKSB7XG4gICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVVUQ0RhdGUgKHkpIHtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQy5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcbiAgICAgICAgaWYgKHkgPCAxOTcwKSB7XG4gICAgICAgICAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cblxuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnWVknLCAyXSwgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy55ZWFyKCkgJSAxMDA7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1lZWVknLCAgIDRdLCAgICAgICAwLCAneWVhcicpO1xuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnWVlZWVknLCAgNV0sICAgICAgIDAsICd5ZWFyJyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oMCwgWydZWVlZWVknLCA2LCB0cnVlXSwgMCwgJ3llYXInKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygneWVhcicsICd5Jyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdZJywgICAgICBtYXRjaFNpZ25lZCk7XG4gICAgYWRkUmVnZXhUb2tlbignWVknLCAgICAgbWF0Y2gxdG8yLCBtYXRjaDIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1lZWVknLCAgIG1hdGNoMXRvNCwgbWF0Y2g0KTtcbiAgICBhZGRSZWdleFRva2VuKCdZWVlZWScsICBtYXRjaDF0bzYsIG1hdGNoNik7XG4gICAgYWRkUmVnZXhUb2tlbignWVlZWVlZJywgbWF0Y2gxdG82LCBtYXRjaDYpO1xuXG4gICAgYWRkUGFyc2VUb2tlbihbJ1lZWVlZJywgJ1lZWVlZWSddLCBZRUFSKTtcbiAgICBhZGRQYXJzZVRva2VuKCdZWVlZJywgZnVuY3Rpb24gKGlucHV0LCBhcnJheSkge1xuICAgICAgICBhcnJheVtZRUFSXSA9IGlucHV0Lmxlbmd0aCA9PT0gMiA/IHV0aWxzX2hvb2tzX19ob29rcy5wYXJzZVR3b0RpZ2l0WWVhcihpbnB1dCkgOiB0b0ludChpbnB1dCk7XG4gICAgfSk7XG4gICAgYWRkUGFyc2VUb2tlbignWVknLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5W1lFQVJdID0gdXRpbHNfaG9va3NfX2hvb2tzLnBhcnNlVHdvRGlnaXRZZWFyKGlucHV0KTtcbiAgICB9KTtcblxuICAgIC8vIEhFTFBFUlNcblxuICAgIGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcikge1xuICAgICAgICByZXR1cm4gaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0xlYXBZZWFyKHllYXIpIHtcbiAgICAgICAgcmV0dXJuICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCB5ZWFyICUgNDAwID09PSAwO1xuICAgIH1cblxuICAgIC8vIEhPT0tTXG5cbiAgICB1dGlsc19ob29rc19faG9va3MucGFyc2VUd29EaWdpdFllYXIgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRvSW50KGlucHV0KSArICh0b0ludChpbnB1dCkgPiA2OCA/IDE5MDAgOiAyMDAwKTtcbiAgICB9O1xuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgdmFyIGdldFNldFllYXIgPSBtYWtlR2V0U2V0KCdGdWxsWWVhcicsIGZhbHNlKTtcblxuICAgIGZ1bmN0aW9uIGdldElzTGVhcFllYXIgKCkge1xuICAgICAgICByZXR1cm4gaXNMZWFwWWVhcih0aGlzLnllYXIoKSk7XG4gICAgfVxuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ3cnLCBbJ3d3JywgMl0sICd3bycsICd3ZWVrJyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oJ1cnLCBbJ1dXJywgMl0sICdXbycsICdpc29XZWVrJyk7XG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ3dlZWsnLCAndycpO1xuICAgIGFkZFVuaXRBbGlhcygnaXNvV2VlaycsICdXJyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCd3JywgIG1hdGNoMXRvMik7XG4gICAgYWRkUmVnZXhUb2tlbignd3cnLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignVycsICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1dXJywgbWF0Y2gxdG8yLCBtYXRjaDIpO1xuXG4gICAgYWRkV2Vla1BhcnNlVG9rZW4oWyd3JywgJ3d3JywgJ1cnLCAnV1cnXSwgZnVuY3Rpb24gKGlucHV0LCB3ZWVrLCBjb25maWcsIHRva2VuKSB7XG4gICAgICAgIHdlZWtbdG9rZW4uc3Vic3RyKDAsIDEpXSA9IHRvSW50KGlucHV0KTtcbiAgICB9KTtcblxuICAgIC8vIEhFTFBFUlNcblxuICAgIC8vIGZpcnN0RGF5T2ZXZWVrICAgICAgIDAgPSBzdW4sIDYgPSBzYXRcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICB0aGUgZGF5IG9mIHRoZSB3ZWVrIHRoYXQgc3RhcnRzIHRoZSB3ZWVrXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgKHVzdWFsbHkgc3VuZGF5IG9yIG1vbmRheSlcbiAgICAvLyBmaXJzdERheU9mV2Vla09mWWVhciAwID0gc3VuLCA2ID0gc2F0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdGhlIGZpcnN0IHdlZWsgaXMgdGhlIHdlZWsgdGhhdCBjb250YWlucyB0aGUgZmlyc3RcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICBvZiB0aGlzIGRheSBvZiB0aGUgd2Vla1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIChlZy4gSVNPIHdlZWtzIHVzZSB0aHVyc2RheSAoNCkpXG4gICAgZnVuY3Rpb24gd2Vla09mWWVhcihtb20sIGZpcnN0RGF5T2ZXZWVrLCBmaXJzdERheU9mV2Vla09mWWVhcikge1xuICAgICAgICB2YXIgZW5kID0gZmlyc3REYXlPZldlZWtPZlllYXIgLSBmaXJzdERheU9mV2VlayxcbiAgICAgICAgICAgIGRheXNUb0RheU9mV2VlayA9IGZpcnN0RGF5T2ZXZWVrT2ZZZWFyIC0gbW9tLmRheSgpLFxuICAgICAgICAgICAgYWRqdXN0ZWRNb21lbnQ7XG5cblxuICAgICAgICBpZiAoZGF5c1RvRGF5T2ZXZWVrID4gZW5kKSB7XG4gICAgICAgICAgICBkYXlzVG9EYXlPZldlZWsgLT0gNztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXlzVG9EYXlPZldlZWsgPCBlbmQgLSA3KSB7XG4gICAgICAgICAgICBkYXlzVG9EYXlPZldlZWsgKz0gNztcbiAgICAgICAgfVxuXG4gICAgICAgIGFkanVzdGVkTW9tZW50ID0gbG9jYWxfX2NyZWF0ZUxvY2FsKG1vbSkuYWRkKGRheXNUb0RheU9mV2VlaywgJ2QnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdlZWs6IE1hdGguY2VpbChhZGp1c3RlZE1vbWVudC5kYXlPZlllYXIoKSAvIDcpLFxuICAgICAgICAgICAgeWVhcjogYWRqdXN0ZWRNb21lbnQueWVhcigpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gTE9DQUxFU1xuXG4gICAgZnVuY3Rpb24gbG9jYWxlV2VlayAobW9tKSB7XG4gICAgICAgIHJldHVybiB3ZWVrT2ZZZWFyKG1vbSwgdGhpcy5fd2Vlay5kb3csIHRoaXMuX3dlZWsuZG95KS53ZWVrO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0TG9jYWxlV2VlayA9IHtcbiAgICAgICAgZG93IDogMCwgLy8gU3VuZGF5IGlzIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsuXG4gICAgICAgIGRveSA6IDYgIC8vIFRoZSB3ZWVrIHRoYXQgY29udGFpbnMgSmFuIDFzdCBpcyB0aGUgZmlyc3Qgd2VlayBvZiB0aGUgeWVhci5cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbG9jYWxlRmlyc3REYXlPZldlZWsgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2Vlay5kb3c7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9jYWxlRmlyc3REYXlPZlllYXIgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2Vlay5kb3k7XG4gICAgfVxuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgZnVuY3Rpb24gZ2V0U2V0V2VlayAoaW5wdXQpIHtcbiAgICAgICAgdmFyIHdlZWsgPSB0aGlzLmxvY2FsZURhdGEoKS53ZWVrKHRoaXMpO1xuICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWsgOiB0aGlzLmFkZCgoaW5wdXQgLSB3ZWVrKSAqIDcsICdkJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2V0SVNPV2VlayAoaW5wdXQpIHtcbiAgICAgICAgdmFyIHdlZWsgPSB3ZWVrT2ZZZWFyKHRoaXMsIDEsIDQpLndlZWs7XG4gICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2VlayA6IHRoaXMuYWRkKChpbnB1dCAtIHdlZWspICogNywgJ2QnKTtcbiAgICB9XG5cbiAgICBhZGRGb3JtYXRUb2tlbignREREJywgWydEREREJywgM10sICdERERvJywgJ2RheU9mWWVhcicpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCdkYXlPZlllYXInLCAnREREJyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdEREQnLCAgbWF0Y2gxdG8zKTtcbiAgICBhZGRSZWdleFRva2VuKCdEREREJywgbWF0Y2gzKTtcbiAgICBhZGRQYXJzZVRva2VuKFsnREREJywgJ0REREQnXSwgZnVuY3Rpb24gKGlucHV0LCBhcnJheSwgY29uZmlnKSB7XG4gICAgICAgIGNvbmZpZy5fZGF5T2ZZZWFyID0gdG9JbnQoaW5wdXQpO1xuICAgIH0pO1xuXG4gICAgLy8gSEVMUEVSU1xuXG4gICAgLy9odHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGUjQ2FsY3VsYXRpbmdfYV9kYXRlX2dpdmVuX3RoZV95ZWFyLjJDX3dlZWtfbnVtYmVyX2FuZF93ZWVrZGF5XG4gICAgZnVuY3Rpb24gZGF5T2ZZZWFyRnJvbVdlZWtzKHllYXIsIHdlZWssIHdlZWtkYXksIGZpcnN0RGF5T2ZXZWVrT2ZZZWFyLCBmaXJzdERheU9mV2Vlaykge1xuICAgICAgICB2YXIgd2VlazFKYW4gPSA2ICsgZmlyc3REYXlPZldlZWsgLSBmaXJzdERheU9mV2Vla09mWWVhciwgamFuWCA9IGNyZWF0ZVVUQ0RhdGUoeWVhciwgMCwgMSArIHdlZWsxSmFuKSwgZCA9IGphblguZ2V0VVRDRGF5KCksIGRheU9mWWVhcjtcbiAgICAgICAgaWYgKGQgPCBmaXJzdERheU9mV2Vlaykge1xuICAgICAgICAgICAgZCArPSA3O1xuICAgICAgICB9XG5cbiAgICAgICAgd2Vla2RheSA9IHdlZWtkYXkgIT0gbnVsbCA/IDEgKiB3ZWVrZGF5IDogZmlyc3REYXlPZldlZWs7XG5cbiAgICAgICAgZGF5T2ZZZWFyID0gMSArIHdlZWsxSmFuICsgNyAqICh3ZWVrIC0gMSkgLSBkICsgd2Vla2RheTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogZGF5T2ZZZWFyID4gMCA/IHllYXIgOiB5ZWFyIC0gMSxcbiAgICAgICAgICAgIGRheU9mWWVhcjogZGF5T2ZZZWFyID4gMCA/ICBkYXlPZlllYXIgOiBkYXlzSW5ZZWFyKHllYXIgLSAxKSArIGRheU9mWWVhclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIE1PTUVOVFNcblxuICAgIGZ1bmN0aW9uIGdldFNldERheU9mWWVhciAoaW5wdXQpIHtcbiAgICAgICAgdmFyIGRheU9mWWVhciA9IE1hdGgucm91bmQoKHRoaXMuY2xvbmUoKS5zdGFydE9mKCdkYXknKSAtIHRoaXMuY2xvbmUoKS5zdGFydE9mKCd5ZWFyJykpIC8gODY0ZTUpICsgMTtcbiAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyBkYXlPZlllYXIgOiB0aGlzLmFkZCgoaW5wdXQgLSBkYXlPZlllYXIpLCAnZCcpO1xuICAgIH1cblxuICAgIC8vIFBpY2sgdGhlIGZpcnN0IGRlZmluZWQgb2YgdHdvIG9yIHRocmVlIGFyZ3VtZW50cy5cbiAgICBmdW5jdGlvbiBkZWZhdWx0cyhhLCBiLCBjKSB7XG4gICAgICAgIGlmIChhICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChiICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbnREYXRlQXJyYXkoY29uZmlnKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBpZiAoY29uZmlnLl91c2VVVEMpIHtcbiAgICAgICAgICAgIHJldHVybiBbbm93LmdldFVUQ0Z1bGxZZWFyKCksIG5vdy5nZXRVVENNb250aCgpLCBub3cuZ2V0VVRDRGF0ZSgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW25vdy5nZXRGdWxsWWVhcigpLCBub3cuZ2V0TW9udGgoKSwgbm93LmdldERhdGUoKV07XG4gICAgfVxuXG4gICAgLy8gY29udmVydCBhbiBhcnJheSB0byBhIGRhdGUuXG4gICAgLy8gdGhlIGFycmF5IHNob3VsZCBtaXJyb3IgdGhlIHBhcmFtZXRlcnMgYmVsb3dcbiAgICAvLyBub3RlOiBhbGwgdmFsdWVzIHBhc3QgdGhlIHllYXIgYXJlIG9wdGlvbmFsIGFuZCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxvd2VzdCBwb3NzaWJsZSB2YWx1ZS5cbiAgICAvLyBbeWVhciwgbW9udGgsIGRheSAsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZF1cbiAgICBmdW5jdGlvbiBjb25maWdGcm9tQXJyYXkgKGNvbmZpZykge1xuICAgICAgICB2YXIgaSwgZGF0ZSwgaW5wdXQgPSBbXSwgY3VycmVudERhdGUsIHllYXJUb1VzZTtcblxuICAgICAgICBpZiAoY29uZmlnLl9kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50RGF0ZSA9IGN1cnJlbnREYXRlQXJyYXkoY29uZmlnKTtcblxuICAgICAgICAvL2NvbXB1dGUgZGF5IG9mIHRoZSB5ZWFyIGZyb20gd2Vla3MgYW5kIHdlZWtkYXlzXG4gICAgICAgIGlmIChjb25maWcuX3cgJiYgY29uZmlnLl9hW0RBVEVdID09IG51bGwgJiYgY29uZmlnLl9hW01PTlRIXSA9PSBudWxsKSB7XG4gICAgICAgICAgICBkYXlPZlllYXJGcm9tV2Vla0luZm8oY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgdGhlIGRheSBvZiB0aGUgeWVhciBpcyBzZXQsIGZpZ3VyZSBvdXQgd2hhdCBpdCBpc1xuICAgICAgICBpZiAoY29uZmlnLl9kYXlPZlllYXIpIHtcbiAgICAgICAgICAgIHllYXJUb1VzZSA9IGRlZmF1bHRzKGNvbmZpZy5fYVtZRUFSXSwgY3VycmVudERhdGVbWUVBUl0pO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLl9kYXlPZlllYXIgPiBkYXlzSW5ZZWFyKHllYXJUb1VzZSkpIHtcbiAgICAgICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5fb3ZlcmZsb3dEYXlPZlllYXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRlID0gY3JlYXRlVVRDRGF0ZSh5ZWFyVG9Vc2UsIDAsIGNvbmZpZy5fZGF5T2ZZZWFyKTtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtNT05USF0gPSBkYXRlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICBjb25maWcuX2FbREFURV0gPSBkYXRlLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZmF1bHQgdG8gY3VycmVudCBkYXRlLlxuICAgICAgICAvLyAqIGlmIG5vIHllYXIsIG1vbnRoLCBkYXkgb2YgbW9udGggYXJlIGdpdmVuLCBkZWZhdWx0IHRvIHRvZGF5XG4gICAgICAgIC8vICogaWYgZGF5IG9mIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG1vbnRoIGFuZCB5ZWFyXG4gICAgICAgIC8vICogaWYgbW9udGggaXMgZ2l2ZW4sIGRlZmF1bHQgb25seSB5ZWFyXG4gICAgICAgIC8vICogaWYgeWVhciBpcyBnaXZlbiwgZG9uJ3QgZGVmYXVsdCBhbnl0aGluZ1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMyAmJiBjb25maWcuX2FbaV0gPT0gbnVsbDsgKytpKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbaV0gPSBpbnB1dFtpXSA9IGN1cnJlbnREYXRlW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gWmVybyBvdXQgd2hhdGV2ZXIgd2FzIG5vdCBkZWZhdWx0ZWQsIGluY2x1ZGluZyB0aW1lXG4gICAgICAgIGZvciAoOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbaV0gPSBpbnB1dFtpXSA9IChjb25maWcuX2FbaV0gPT0gbnVsbCkgPyAoaSA9PT0gMiA/IDEgOiAwKSA6IGNvbmZpZy5fYVtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciAyNDowMDowMC4wMDBcbiAgICAgICAgaWYgKGNvbmZpZy5fYVtIT1VSXSA9PT0gMjQgJiZcbiAgICAgICAgICAgICAgICBjb25maWcuX2FbTUlOVVRFXSA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIGNvbmZpZy5fYVtTRUNPTkRdID09PSAwICYmXG4gICAgICAgICAgICAgICAgY29uZmlnLl9hW01JTExJU0VDT05EXSA9PT0gMCkge1xuICAgICAgICAgICAgY29uZmlnLl9uZXh0RGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtIT1VSXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcuX2QgPSAoY29uZmlnLl91c2VVVEMgPyBjcmVhdGVVVENEYXRlIDogY3JlYXRlRGF0ZSkuYXBwbHkobnVsbCwgaW5wdXQpO1xuICAgICAgICAvLyBBcHBseSB0aW1lem9uZSBvZmZzZXQgZnJvbSBpbnB1dC4gVGhlIGFjdHVhbCB1dGNPZmZzZXQgY2FuIGJlIGNoYW5nZWRcbiAgICAgICAgLy8gd2l0aCBwYXJzZVpvbmUuXG4gICAgICAgIGlmIChjb25maWcuX3R6bSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25maWcuX2Quc2V0VVRDTWludXRlcyhjb25maWcuX2QuZ2V0VVRDTWludXRlcygpIC0gY29uZmlnLl90em0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmZpZy5fbmV4dERheSkge1xuICAgICAgICAgICAgY29uZmlnLl9hW0hPVVJdID0gMjQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlPZlllYXJGcm9tV2Vla0luZm8oY29uZmlnKSB7XG4gICAgICAgIHZhciB3LCB3ZWVrWWVhciwgd2Vlaywgd2Vla2RheSwgZG93LCBkb3ksIHRlbXA7XG5cbiAgICAgICAgdyA9IGNvbmZpZy5fdztcbiAgICAgICAgaWYgKHcuR0cgIT0gbnVsbCB8fCB3LlcgIT0gbnVsbCB8fCB3LkUgIT0gbnVsbCkge1xuICAgICAgICAgICAgZG93ID0gMTtcbiAgICAgICAgICAgIGRveSA9IDQ7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IFdlIG5lZWQgdG8gdGFrZSB0aGUgY3VycmVudCBpc29XZWVrWWVhciwgYnV0IHRoYXQgZGVwZW5kcyBvblxuICAgICAgICAgICAgLy8gaG93IHdlIGludGVycHJldCBub3cgKGxvY2FsLCB1dGMsIGZpeGVkIG9mZnNldCkuIFNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBub3cgdmVyc2lvbiBvZiBjdXJyZW50IGNvbmZpZyAodGFrZSBsb2NhbC91dGMvb2Zmc2V0IGZsYWdzLCBhbmRcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBub3cpLlxuICAgICAgICAgICAgd2Vla1llYXIgPSBkZWZhdWx0cyh3LkdHLCBjb25maWcuX2FbWUVBUl0sIHdlZWtPZlllYXIobG9jYWxfX2NyZWF0ZUxvY2FsKCksIDEsIDQpLnllYXIpO1xuICAgICAgICAgICAgd2VlayA9IGRlZmF1bHRzKHcuVywgMSk7XG4gICAgICAgICAgICB3ZWVrZGF5ID0gZGVmYXVsdHMody5FLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvdyA9IGNvbmZpZy5fbG9jYWxlLl93ZWVrLmRvdztcbiAgICAgICAgICAgIGRveSA9IGNvbmZpZy5fbG9jYWxlLl93ZWVrLmRveTtcblxuICAgICAgICAgICAgd2Vla1llYXIgPSBkZWZhdWx0cyh3LmdnLCBjb25maWcuX2FbWUVBUl0sIHdlZWtPZlllYXIobG9jYWxfX2NyZWF0ZUxvY2FsKCksIGRvdywgZG95KS55ZWFyKTtcbiAgICAgICAgICAgIHdlZWsgPSBkZWZhdWx0cyh3LncsIDEpO1xuXG4gICAgICAgICAgICBpZiAody5kICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyB3ZWVrZGF5IC0tIGxvdyBkYXkgbnVtYmVycyBhcmUgY29uc2lkZXJlZCBuZXh0IHdlZWtcbiAgICAgICAgICAgICAgICB3ZWVrZGF5ID0gdy5kO1xuICAgICAgICAgICAgICAgIGlmICh3ZWVrZGF5IDwgZG93KSB7XG4gICAgICAgICAgICAgICAgICAgICsrd2VlaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHcuZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jYWwgd2Vla2RheSAtLSBjb3VudGluZyBzdGFydHMgZnJvbSBiZWdpbmluZyBvZiB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IHcuZSArIGRvdztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZGVmYXVsdCB0byBiZWdpbmluZyBvZiB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IGRvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZW1wID0gZGF5T2ZZZWFyRnJvbVdlZWtzKHdlZWtZZWFyLCB3ZWVrLCB3ZWVrZGF5LCBkb3ksIGRvdyk7XG5cbiAgICAgICAgY29uZmlnLl9hW1lFQVJdID0gdGVtcC55ZWFyO1xuICAgICAgICBjb25maWcuX2RheU9mWWVhciA9IHRlbXAuZGF5T2ZZZWFyO1xuICAgIH1cblxuICAgIHV0aWxzX2hvb2tzX19ob29rcy5JU09fODYwMSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgLy8gZGF0ZSBmcm9tIHN0cmluZyBhbmQgZm9ybWF0IHN0cmluZ1xuICAgIGZ1bmN0aW9uIGNvbmZpZ0Zyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKSB7XG4gICAgICAgIC8vIFRPRE86IE1vdmUgdGhpcyB0byBhbm90aGVyIHBhcnQgb2YgdGhlIGNyZWF0aW9uIGZsb3cgdG8gcHJldmVudCBjaXJjdWxhciBkZXBzXG4gICAgICAgIGlmIChjb25maWcuX2YgPT09IHV0aWxzX2hvb2tzX19ob29rcy5JU09fODYwMSkge1xuICAgICAgICAgICAgY29uZmlnRnJvbUlTTyhjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLl9hID0gW107XG4gICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmVtcHR5ID0gdHJ1ZTtcblxuICAgICAgICAvLyBUaGlzIGFycmF5IGlzIHVzZWQgdG8gbWFrZSBhIERhdGUsIGVpdGhlciB3aXRoIGBuZXcgRGF0ZWAgb3IgYERhdGUuVVRDYFxuICAgICAgICB2YXIgc3RyaW5nID0gJycgKyBjb25maWcuX2ksXG4gICAgICAgICAgICBpLCBwYXJzZWRJbnB1dCwgdG9rZW5zLCB0b2tlbiwgc2tpcHBlZCxcbiAgICAgICAgICAgIHN0cmluZ0xlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbFBhcnNlZElucHV0TGVuZ3RoID0gMDtcblxuICAgICAgICB0b2tlbnMgPSBleHBhbmRGb3JtYXQoY29uZmlnLl9mLCBjb25maWcuX2xvY2FsZSkubWF0Y2goZm9ybWF0dGluZ1Rva2VucykgfHwgW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgICAgICBwYXJzZWRJbnB1dCA9IChzdHJpbmcubWF0Y2goZ2V0UGFyc2VSZWdleEZvclRva2VuKHRva2VuLCBjb25maWcpKSB8fCBbXSlbMF07XG4gICAgICAgICAgICBpZiAocGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBza2lwcGVkID0gc3RyaW5nLnN1YnN0cigwLCBzdHJpbmcuaW5kZXhPZihwYXJzZWRJbnB1dCkpO1xuICAgICAgICAgICAgICAgIGlmIChza2lwcGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykudW51c2VkSW5wdXQucHVzaChza2lwcGVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKHN0cmluZy5pbmRleE9mKHBhcnNlZElucHV0KSArIHBhcnNlZElucHV0Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG90YWxQYXJzZWRJbnB1dExlbmd0aCArPSBwYXJzZWRJbnB1dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkb24ndCBwYXJzZSBpZiBpdCdzIG5vdCBhIGtub3duIHRva2VuXG4gICAgICAgICAgICBpZiAoZm9ybWF0VG9rZW5GdW5jdGlvbnNbdG9rZW5dKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlZElucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmVtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS51bnVzZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFkZFRpbWVUb0FycmF5RnJvbVRva2VuKHRva2VuLCBwYXJzZWRJbnB1dCwgY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNvbmZpZy5fc3RyaWN0ICYmICFwYXJzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLnVudXNlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCByZW1haW5pbmcgdW5wYXJzZWQgaW5wdXQgbGVuZ3RoIHRvIHRoZSBzdHJpbmdcbiAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuY2hhcnNMZWZ0T3ZlciA9IHN0cmluZ0xlbmd0aCAtIHRvdGFsUGFyc2VkSW5wdXRMZW5ndGg7XG4gICAgICAgIGlmIChzdHJpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykudW51c2VkSW5wdXQucHVzaChzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xlYXIgXzEyaCBmbGFnIGlmIGhvdXIgaXMgPD0gMTJcbiAgICAgICAgaWYgKGdldFBhcnNpbmdGbGFncyhjb25maWcpLmJpZ0hvdXIgPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICBjb25maWcuX2FbSE9VUl0gPD0gMTIgJiZcbiAgICAgICAgICAgICAgICBjb25maWcuX2FbSE9VUl0gPiAwKSB7XG4gICAgICAgICAgICBnZXRQYXJzaW5nRmxhZ3MoY29uZmlnKS5iaWdIb3VyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIGhhbmRsZSBtZXJpZGllbVxuICAgICAgICBjb25maWcuX2FbSE9VUl0gPSBtZXJpZGllbUZpeFdyYXAoY29uZmlnLl9sb2NhbGUsIGNvbmZpZy5fYVtIT1VSXSwgY29uZmlnLl9tZXJpZGllbSk7XG5cbiAgICAgICAgY29uZmlnRnJvbUFycmF5KGNvbmZpZyk7XG4gICAgICAgIGNoZWNrT3ZlcmZsb3coY29uZmlnKTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIG1lcmlkaWVtRml4V3JhcCAobG9jYWxlLCBob3VyLCBtZXJpZGllbSkge1xuICAgICAgICB2YXIgaXNQbTtcblxuICAgICAgICBpZiAobWVyaWRpZW0gPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gbm90aGluZyB0byBkb1xuICAgICAgICAgICAgcmV0dXJuIGhvdXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsZS5tZXJpZGllbUhvdXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5tZXJpZGllbUhvdXIoaG91ciwgbWVyaWRpZW0pO1xuICAgICAgICB9IGVsc2UgaWYgKGxvY2FsZS5pc1BNICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrXG4gICAgICAgICAgICBpc1BtID0gbG9jYWxlLmlzUE0obWVyaWRpZW0pO1xuICAgICAgICAgICAgaWYgKGlzUG0gJiYgaG91ciA8IDEyKSB7XG4gICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNQbSAmJiBob3VyID09PSAxMikge1xuICAgICAgICAgICAgICAgIGhvdXIgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGhvdXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIG5vdCBzdXBwb3NlZCB0byBoYXBwZW5cbiAgICAgICAgICAgIHJldHVybiBob3VyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uZmlnRnJvbVN0cmluZ0FuZEFycmF5KGNvbmZpZykge1xuICAgICAgICB2YXIgdGVtcENvbmZpZyxcbiAgICAgICAgICAgIGJlc3RNb21lbnQsXG5cbiAgICAgICAgICAgIHNjb3JlVG9CZWF0LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZTtcblxuICAgICAgICBpZiAoY29uZmlnLl9mLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuaW52YWxpZEZvcm1hdCA9IHRydWU7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShOYU4pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZy5fZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY3VycmVudFNjb3JlID0gMDtcbiAgICAgICAgICAgIHRlbXBDb25maWcgPSBjb3B5Q29uZmlnKHt9LCBjb25maWcpO1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5fdXNlVVRDICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0ZW1wQ29uZmlnLl91c2VVVEMgPSBjb25maWcuX3VzZVVUQztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbXBDb25maWcuX2YgPSBjb25maWcuX2ZbaV07XG4gICAgICAgICAgICBjb25maWdGcm9tU3RyaW5nQW5kRm9ybWF0KHRlbXBDb25maWcpO1xuXG4gICAgICAgICAgICBpZiAoIXZhbGlkX19pc1ZhbGlkKHRlbXBDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFueSBpbnB1dCB0aGF0IHdhcyBub3QgcGFyc2VkIGFkZCBhIHBlbmFsdHkgZm9yIHRoYXQgZm9ybWF0XG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gZ2V0UGFyc2luZ0ZsYWdzKHRlbXBDb25maWcpLmNoYXJzTGVmdE92ZXI7XG5cbiAgICAgICAgICAgIC8vb3IgdG9rZW5zXG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gZ2V0UGFyc2luZ0ZsYWdzKHRlbXBDb25maWcpLnVudXNlZFRva2Vucy5sZW5ndGggKiAxMDtcblxuICAgICAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKHRlbXBDb25maWcpLnNjb3JlID0gY3VycmVudFNjb3JlO1xuXG4gICAgICAgICAgICBpZiAoc2NvcmVUb0JlYXQgPT0gbnVsbCB8fCBjdXJyZW50U2NvcmUgPCBzY29yZVRvQmVhdCkge1xuICAgICAgICAgICAgICAgIHNjb3JlVG9CZWF0ID0gY3VycmVudFNjb3JlO1xuICAgICAgICAgICAgICAgIGJlc3RNb21lbnQgPSB0ZW1wQ29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXh0ZW5kKGNvbmZpZywgYmVzdE1vbWVudCB8fCB0ZW1wQ29uZmlnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maWdGcm9tT2JqZWN0KGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnLl9kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaSA9IG5vcm1hbGl6ZU9iamVjdFVuaXRzKGNvbmZpZy5faSk7XG4gICAgICAgIGNvbmZpZy5fYSA9IFtpLnllYXIsIGkubW9udGgsIGkuZGF5IHx8IGkuZGF0ZSwgaS5ob3VyLCBpLm1pbnV0ZSwgaS5zZWNvbmQsIGkubWlsbGlzZWNvbmRdO1xuXG4gICAgICAgIGNvbmZpZ0Zyb21BcnJheShjb25maWcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZyb21Db25maWcgKGNvbmZpZykge1xuICAgICAgICB2YXIgcmVzID0gbmV3IE1vbWVudChjaGVja092ZXJmbG93KHByZXBhcmVDb25maWcoY29uZmlnKSkpO1xuICAgICAgICBpZiAocmVzLl9uZXh0RGF5KSB7XG4gICAgICAgICAgICAvLyBBZGRpbmcgaXMgc21hcnQgZW5vdWdoIGFyb3VuZCBEU1RcbiAgICAgICAgICAgIHJlcy5hZGQoMSwgJ2QnKTtcbiAgICAgICAgICAgIHJlcy5fbmV4dERheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUNvbmZpZyAoY29uZmlnKSB7XG4gICAgICAgIHZhciBpbnB1dCA9IGNvbmZpZy5faSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGNvbmZpZy5fZjtcblxuICAgICAgICBjb25maWcuX2xvY2FsZSA9IGNvbmZpZy5fbG9jYWxlIHx8IGxvY2FsZV9sb2NhbGVzX19nZXRMb2NhbGUoY29uZmlnLl9sKTtcblxuICAgICAgICBpZiAoaW5wdXQgPT09IG51bGwgfHwgKGZvcm1hdCA9PT0gdW5kZWZpbmVkICYmIGlucHV0ID09PSAnJykpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxpZF9fY3JlYXRlSW52YWxpZCh7bnVsbElucHV0OiB0cnVlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uZmlnLl9pID0gaW5wdXQgPSBjb25maWcuX2xvY2FsZS5wcmVwYXJzZShpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNNb21lbnQoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1vbWVudChjaGVja092ZXJmbG93KGlucHV0KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShmb3JtYXQpKSB7XG4gICAgICAgICAgICBjb25maWdGcm9tU3RyaW5nQW5kQXJyYXkoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGNvbmZpZ0Zyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0RhdGUoaW5wdXQpKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBpbnB1dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZ0Zyb21JbnB1dChjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maWdGcm9tSW5wdXQoY29uZmlnKSB7XG4gICAgICAgIHZhciBpbnB1dCA9IGNvbmZpZy5faTtcbiAgICAgICAgaWYgKGlucHV0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoK2lucHV0KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25maWdGcm9tU3RyaW5nKGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYSA9IG1hcChpbnB1dC5zbGljZSgwKSwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChvYmosIDEwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uZmlnRnJvbUFycmF5KGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKGlucHV0KSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGNvbmZpZ0Zyb21PYmplY3QoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YoaW5wdXQpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgLy8gZnJvbSBtaWxsaXNlY29uZHNcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHV0aWxzX2hvb2tzX19ob29rcy5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjayhjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlTG9jYWxPclVUQyAoaW5wdXQsIGZvcm1hdCwgbG9jYWxlLCBzdHJpY3QsIGlzVVRDKSB7XG4gICAgICAgIHZhciBjID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZihsb2NhbGUpID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHN0cmljdCA9IGxvY2FsZTtcbiAgICAgICAgICAgIGxvY2FsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBvYmplY3QgY29uc3RydWN0aW9uIG11c3QgYmUgZG9uZSB0aGlzIHdheS5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE0MjNcbiAgICAgICAgYy5faXNBTW9tZW50T2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgYy5fdXNlVVRDID0gYy5faXNVVEMgPSBpc1VUQztcbiAgICAgICAgYy5fbCA9IGxvY2FsZTtcbiAgICAgICAgYy5faSA9IGlucHV0O1xuICAgICAgICBjLl9mID0gZm9ybWF0O1xuICAgICAgICBjLl9zdHJpY3QgPSBzdHJpY3Q7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUZyb21Db25maWcoYyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9jYWxfX2NyZWF0ZUxvY2FsIChpbnB1dCwgZm9ybWF0LCBsb2NhbGUsIHN0cmljdCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlTG9jYWxPclVUQyhpbnB1dCwgZm9ybWF0LCBsb2NhbGUsIHN0cmljdCwgZmFsc2UpO1xuICAgIH1cblxuICAgIHZhciBwcm90b3R5cGVNaW4gPSBkZXByZWNhdGUoXG4gICAgICAgICAnbW9tZW50KCkubWluIGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQubWluIGluc3RlYWQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNTQ4JyxcbiAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICB2YXIgb3RoZXIgPSBsb2NhbF9fY3JlYXRlTG9jYWwuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICByZXR1cm4gb3RoZXIgPCB0aGlzID8gdGhpcyA6IG90aGVyO1xuICAgICAgICAgfVxuICAgICApO1xuXG4gICAgdmFyIHByb3RvdHlwZU1heCA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudCgpLm1heCBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50Lm1heCBpbnN0ZWFkLiBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTU0OCcsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvdGhlciA9IGxvY2FsX19jcmVhdGVMb2NhbC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgcmV0dXJuIG90aGVyID4gdGhpcyA/IHRoaXMgOiBvdGhlcjtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBQaWNrIGEgbW9tZW50IG0gZnJvbSBtb21lbnRzIHNvIHRoYXQgbVtmbl0ob3RoZXIpIGlzIHRydWUgZm9yIGFsbFxuICAgIC8vIG90aGVyLiBUaGlzIHJlbGllcyBvbiB0aGUgZnVuY3Rpb24gZm4gdG8gYmUgdHJhbnNpdGl2ZS5cbiAgICAvL1xuICAgIC8vIG1vbWVudHMgc2hvdWxkIGVpdGhlciBiZSBhbiBhcnJheSBvZiBtb21lbnQgb2JqZWN0cyBvciBhbiBhcnJheSwgd2hvc2VcbiAgICAvLyBmaXJzdCBlbGVtZW50IGlzIGFuIGFycmF5IG9mIG1vbWVudCBvYmplY3RzLlxuICAgIGZ1bmN0aW9uIHBpY2tCeShmbiwgbW9tZW50cykge1xuICAgICAgICB2YXIgcmVzLCBpO1xuICAgICAgICBpZiAobW9tZW50cy5sZW5ndGggPT09IDEgJiYgaXNBcnJheShtb21lbnRzWzBdKSkge1xuICAgICAgICAgICAgbW9tZW50cyA9IG1vbWVudHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtb21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsX19jcmVhdGVMb2NhbCgpO1xuICAgICAgICB9XG4gICAgICAgIHJlcyA9IG1vbWVudHNbMF07XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBtb21lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoIW1vbWVudHNbaV0uaXNWYWxpZCgpIHx8IG1vbWVudHNbaV1bZm5dKHJlcykpIHtcbiAgICAgICAgICAgICAgICByZXMgPSBtb21lbnRzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogVXNlIFtdLnNvcnQgaW5zdGVhZD9cbiAgICBmdW5jdGlvbiBtaW4gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgICAgICByZXR1cm4gcGlja0J5KCdpc0JlZm9yZScsIGFyZ3MpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1heCAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgICAgIHJldHVybiBwaWNrQnkoJ2lzQWZ0ZXInLCBhcmdzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBEdXJhdGlvbiAoZHVyYXRpb24pIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRJbnB1dCA9IG5vcm1hbGl6ZU9iamVjdFVuaXRzKGR1cmF0aW9uKSxcbiAgICAgICAgICAgIHllYXJzID0gbm9ybWFsaXplZElucHV0LnllYXIgfHwgMCxcbiAgICAgICAgICAgIHF1YXJ0ZXJzID0gbm9ybWFsaXplZElucHV0LnF1YXJ0ZXIgfHwgMCxcbiAgICAgICAgICAgIG1vbnRocyA9IG5vcm1hbGl6ZWRJbnB1dC5tb250aCB8fCAwLFxuICAgICAgICAgICAgd2Vla3MgPSBub3JtYWxpemVkSW5wdXQud2VlayB8fCAwLFxuICAgICAgICAgICAgZGF5cyA9IG5vcm1hbGl6ZWRJbnB1dC5kYXkgfHwgMCxcbiAgICAgICAgICAgIGhvdXJzID0gbm9ybWFsaXplZElucHV0LmhvdXIgfHwgMCxcbiAgICAgICAgICAgIG1pbnV0ZXMgPSBub3JtYWxpemVkSW5wdXQubWludXRlIHx8IDAsXG4gICAgICAgICAgICBzZWNvbmRzID0gbm9ybWFsaXplZElucHV0LnNlY29uZCB8fCAwLFxuICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gbm9ybWFsaXplZElucHV0Lm1pbGxpc2Vjb25kIHx8IDA7XG5cbiAgICAgICAgLy8gcmVwcmVzZW50YXRpb24gZm9yIGRhdGVBZGRSZW1vdmVcbiAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzID0gK21pbGxpc2Vjb25kcyArXG4gICAgICAgICAgICBzZWNvbmRzICogMWUzICsgLy8gMTAwMFxuICAgICAgICAgICAgbWludXRlcyAqIDZlNCArIC8vIDEwMDAgKiA2MFxuICAgICAgICAgICAgaG91cnMgKiAzNmU1OyAvLyAxMDAwICogNjAgKiA2MFxuICAgICAgICAvLyBCZWNhdXNlIG9mIGRhdGVBZGRSZW1vdmUgdHJlYXRzIDI0IGhvdXJzIGFzIGRpZmZlcmVudCBmcm9tIGFcbiAgICAgICAgLy8gZGF5IHdoZW4gd29ya2luZyBhcm91bmQgRFNULCB3ZSBuZWVkIHRvIHN0b3JlIHRoZW0gc2VwYXJhdGVseVxuICAgICAgICB0aGlzLl9kYXlzID0gK2RheXMgK1xuICAgICAgICAgICAgd2Vla3MgKiA3O1xuICAgICAgICAvLyBJdCBpcyBpbXBvc3NpYmxlIHRyYW5zbGF0ZSBtb250aHMgaW50byBkYXlzIHdpdGhvdXQga25vd2luZ1xuICAgICAgICAvLyB3aGljaCBtb250aHMgeW91IGFyZSBhcmUgdGFsa2luZyBhYm91dCwgc28gd2UgaGF2ZSB0byBzdG9yZVxuICAgICAgICAvLyBpdCBzZXBhcmF0ZWx5LlxuICAgICAgICB0aGlzLl9tb250aHMgPSArbW9udGhzICtcbiAgICAgICAgICAgIHF1YXJ0ZXJzICogMyArXG4gICAgICAgICAgICB5ZWFycyAqIDEyO1xuXG4gICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcblxuICAgICAgICB0aGlzLl9sb2NhbGUgPSBsb2NhbGVfbG9jYWxlc19fZ2V0TG9jYWxlKCk7XG5cbiAgICAgICAgdGhpcy5fYnViYmxlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEdXJhdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEdXJhdGlvbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvZmZzZXQgKHRva2VuLCBzZXBhcmF0b3IpIHtcbiAgICAgICAgYWRkRm9ybWF0VG9rZW4odG9rZW4sIDAsIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLnV0Y09mZnNldCgpO1xuICAgICAgICAgICAgdmFyIHNpZ24gPSAnKyc7XG4gICAgICAgICAgICBpZiAob2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IC1vZmZzZXQ7XG4gICAgICAgICAgICAgICAgc2lnbiA9ICctJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaWduICsgemVyb0ZpbGwofn4ob2Zmc2V0IC8gNjApLCAyKSArIHNlcGFyYXRvciArIHplcm9GaWxsKH5+KG9mZnNldCkgJSA2MCwgMik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9mZnNldCgnWicsICc6Jyk7XG4gICAgb2Zmc2V0KCdaWicsICcnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ1onLCAgbWF0Y2hPZmZzZXQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1paJywgbWF0Y2hPZmZzZXQpO1xuICAgIGFkZFBhcnNlVG9rZW4oWydaJywgJ1paJ10sIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICBjb25maWcuX3VzZVVUQyA9IHRydWU7XG4gICAgICAgIGNvbmZpZy5fdHptID0gb2Zmc2V0RnJvbVN0cmluZyhpbnB1dCk7XG4gICAgfSk7XG5cbiAgICAvLyBIRUxQRVJTXG5cbiAgICAvLyB0aW1lem9uZSBjaHVua2VyXG4gICAgLy8gJysxMDowMCcgPiBbJzEwJywgICcwMCddXG4gICAgLy8gJy0xNTMwJyAgPiBbJy0xNScsICczMCddXG4gICAgdmFyIGNodW5rT2Zmc2V0ID0gLyhbXFwrXFwtXXxcXGRcXGQpL2dpO1xuXG4gICAgZnVuY3Rpb24gb2Zmc2V0RnJvbVN0cmluZyhzdHJpbmcpIHtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSAoKHN0cmluZyB8fCAnJykubWF0Y2gobWF0Y2hPZmZzZXQpIHx8IFtdKTtcbiAgICAgICAgdmFyIGNodW5rICAgPSBtYXRjaGVzW21hdGNoZXMubGVuZ3RoIC0gMV0gfHwgW107XG4gICAgICAgIHZhciBwYXJ0cyAgID0gKGNodW5rICsgJycpLm1hdGNoKGNodW5rT2Zmc2V0KSB8fCBbJy0nLCAwLCAwXTtcbiAgICAgICAgdmFyIG1pbnV0ZXMgPSArKHBhcnRzWzFdICogNjApICsgdG9JbnQocGFydHNbMl0pO1xuXG4gICAgICAgIHJldHVybiBwYXJ0c1swXSA9PT0gJysnID8gbWludXRlcyA6IC1taW51dGVzO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhIG1vbWVudCBmcm9tIGlucHV0LCB0aGF0IGlzIGxvY2FsL3V0Yy96b25lIGVxdWl2YWxlbnQgdG8gbW9kZWwuXG4gICAgZnVuY3Rpb24gY2xvbmVXaXRoT2Zmc2V0KGlucHV0LCBtb2RlbCkge1xuICAgICAgICB2YXIgcmVzLCBkaWZmO1xuICAgICAgICBpZiAobW9kZWwuX2lzVVRDKSB7XG4gICAgICAgICAgICByZXMgPSBtb2RlbC5jbG9uZSgpO1xuICAgICAgICAgICAgZGlmZiA9IChpc01vbWVudChpbnB1dCkgfHwgaXNEYXRlKGlucHV0KSA/ICtpbnB1dCA6ICtsb2NhbF9fY3JlYXRlTG9jYWwoaW5wdXQpKSAtICgrcmVzKTtcbiAgICAgICAgICAgIC8vIFVzZSBsb3ctbGV2ZWwgYXBpLCBiZWNhdXNlIHRoaXMgZm4gaXMgbG93LWxldmVsIGFwaS5cbiAgICAgICAgICAgIHJlcy5fZC5zZXRUaW1lKCtyZXMuX2QgKyBkaWZmKTtcbiAgICAgICAgICAgIHV0aWxzX2hvb2tzX19ob29rcy51cGRhdGVPZmZzZXQocmVzLCBmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsX19jcmVhdGVMb2NhbChpbnB1dCkubG9jYWwoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERhdGVPZmZzZXQgKG0pIHtcbiAgICAgICAgLy8gT24gRmlyZWZveC4yNCBEYXRlI2dldFRpbWV6b25lT2Zmc2V0IHJldHVybnMgYSBmbG9hdGluZyBwb2ludC5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvcHVsbC8xODcxXG4gICAgICAgIHJldHVybiAtTWF0aC5yb3VuZChtLl9kLmdldFRpbWV6b25lT2Zmc2V0KCkgLyAxNSkgKiAxNTtcbiAgICB9XG5cbiAgICAvLyBIT09LU1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciBhIG1vbWVudCBpcyBtdXRhdGVkLlxuICAgIC8vIEl0IGlzIGludGVuZGVkIHRvIGtlZXAgdGhlIG9mZnNldCBpbiBzeW5jIHdpdGggdGhlIHRpbWV6b25lLlxuICAgIHV0aWxzX2hvb2tzX19ob29rcy51cGRhdGVPZmZzZXQgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIC8vIGtlZXBMb2NhbFRpbWUgPSB0cnVlIG1lYW5zIG9ubHkgY2hhbmdlIHRoZSB0aW1lem9uZSwgd2l0aG91dFxuICAgIC8vIGFmZmVjdGluZyB0aGUgbG9jYWwgaG91ci4gU28gNTozMToyNiArMDMwMCAtLVt1dGNPZmZzZXQoMiwgdHJ1ZSldLS0+XG4gICAgLy8gNTozMToyNiArMDIwMCBJdCBpcyBwb3NzaWJsZSB0aGF0IDU6MzE6MjYgZG9lc24ndCBleGlzdCB3aXRoIG9mZnNldFxuICAgIC8vICswMjAwLCBzbyB3ZSBhZGp1c3QgdGhlIHRpbWUgYXMgbmVlZGVkLCB0byBiZSB2YWxpZC5cbiAgICAvL1xuICAgIC8vIEtlZXBpbmcgdGhlIHRpbWUgYWN0dWFsbHkgYWRkcy9zdWJ0cmFjdHMgKG9uZSBob3VyKVxuICAgIC8vIGZyb20gdGhlIGFjdHVhbCByZXByZXNlbnRlZCB0aW1lLiBUaGF0IGlzIHdoeSB3ZSBjYWxsIHVwZGF0ZU9mZnNldFxuICAgIC8vIGEgc2Vjb25kIHRpbWUuIEluIGNhc2UgaXQgd2FudHMgdXMgdG8gY2hhbmdlIHRoZSBvZmZzZXQgYWdhaW5cbiAgICAvLyBfY2hhbmdlSW5Qcm9ncmVzcyA9PSB0cnVlIGNhc2UsIHRoZW4gd2UgaGF2ZSB0byBhZGp1c3QsIGJlY2F1c2VcbiAgICAvLyB0aGVyZSBpcyBubyBzdWNoIHRpbWUgaW4gdGhlIGdpdmVuIHRpbWV6b25lLlxuICAgIGZ1bmN0aW9uIGdldFNldE9mZnNldCAoaW5wdXQsIGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuX29mZnNldCB8fCAwLFxuICAgICAgICAgICAgbG9jYWxBZGp1c3Q7XG4gICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gb2Zmc2V0RnJvbVN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoaW5wdXQpIDwgMTYpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0ICogNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2lzVVRDICYmIGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICBsb2NhbEFkanVzdCA9IGdldERhdGVPZmZzZXQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9vZmZzZXQgPSBpbnB1dDtcbiAgICAgICAgICAgIHRoaXMuX2lzVVRDID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChsb2NhbEFkanVzdCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGQobG9jYWxBZGp1c3QsICdtJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2Zmc2V0ICE9PSBpbnB1dCkge1xuICAgICAgICAgICAgICAgIGlmICgha2VlcExvY2FsVGltZSB8fCB0aGlzLl9jaGFuZ2VJblByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZF9zdWJ0cmFjdF9fYWRkU3VidHJhY3QodGhpcywgY3JlYXRlX19jcmVhdGVEdXJhdGlvbihpbnB1dCAtIG9mZnNldCwgJ20nKSwgMSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2NoYW5nZUluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHV0aWxzX2hvb2tzX19ob29rcy51cGRhdGVPZmZzZXQodGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDID8gb2Zmc2V0IDogZ2V0RGF0ZU9mZnNldCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNldFpvbmUgKGlucHV0LCBrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gLWlucHV0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnV0Y09mZnNldChpbnB1dCwga2VlcExvY2FsVGltZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIC10aGlzLnV0Y09mZnNldCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0T2Zmc2V0VG9VVEMgKGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXRjT2Zmc2V0KDAsIGtlZXBMb2NhbFRpbWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldE9mZnNldFRvTG9jYWwgKGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzVVRDKSB7XG4gICAgICAgICAgICB0aGlzLnV0Y09mZnNldCgwLCBrZWVwTG9jYWxUaW1lKTtcbiAgICAgICAgICAgIHRoaXMuX2lzVVRDID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdWJ0cmFjdChnZXREYXRlT2Zmc2V0KHRoaXMpLCAnbScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldE9mZnNldFRvUGFyc2VkT2Zmc2V0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3R6bSkge1xuICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQodGhpcy5fdHptKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5faSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMudXRjT2Zmc2V0KG9mZnNldEZyb21TdHJpbmcodGhpcy5faSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc0FsaWduZWRIb3VyT2Zmc2V0IChpbnB1dCkge1xuICAgICAgICBpbnB1dCA9IGlucHV0ID8gbG9jYWxfX2NyZWF0ZUxvY2FsKGlucHV0KS51dGNPZmZzZXQoKSA6IDA7XG5cbiAgICAgICAgcmV0dXJuICh0aGlzLnV0Y09mZnNldCgpIC0gaW5wdXQpICUgNjAgPT09IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEYXlsaWdodFNhdmluZ1RpbWUgKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQoKSA+IHRoaXMuY2xvbmUoKS5tb250aCgwKS51dGNPZmZzZXQoKSB8fFxuICAgICAgICAgICAgdGhpcy51dGNPZmZzZXQoKSA+IHRoaXMuY2xvbmUoKS5tb250aCg1KS51dGNPZmZzZXQoKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRGF5bGlnaHRTYXZpbmdUaW1lU2hpZnRlZCAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5faXNEU1RTaGlmdGVkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzRFNUU2hpZnRlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjID0ge307XG5cbiAgICAgICAgY29weUNvbmZpZyhjLCB0aGlzKTtcbiAgICAgICAgYyA9IHByZXBhcmVDb25maWcoYyk7XG5cbiAgICAgICAgaWYgKGMuX2EpIHtcbiAgICAgICAgICAgIHZhciBvdGhlciA9IGMuX2lzVVRDID8gY3JlYXRlX3V0Y19fY3JlYXRlVVRDKGMuX2EpIDogbG9jYWxfX2NyZWF0ZUxvY2FsKGMuX2EpO1xuICAgICAgICAgICAgdGhpcy5faXNEU1RTaGlmdGVkID0gdGhpcy5pc1ZhbGlkKCkgJiZcbiAgICAgICAgICAgICAgICBjb21wYXJlQXJyYXlzKGMuX2EsIG90aGVyLnRvQXJyYXkoKSkgPiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faXNEU1RTaGlmdGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5faXNEU1RTaGlmdGVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzTG9jYWwgKCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuX2lzVVRDO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVXRjT2Zmc2V0ICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVXRjICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDICYmIHRoaXMuX29mZnNldCA9PT0gMDtcbiAgICB9XG5cbiAgICB2YXIgYXNwTmV0UmVnZXggPSAvKFxcLSk/KD86KFxcZCopXFwuKT8oXFxkKylcXDooXFxkKykoPzpcXDooXFxkKylcXC4/KFxcZHszfSk/KT8vO1xuXG4gICAgLy8gZnJvbSBodHRwOi8vZG9jcy5jbG9zdXJlLWxpYnJhcnkuZ29vZ2xlY29kZS5jb20vZ2l0L2Nsb3N1cmVfZ29vZ19kYXRlX2RhdGUuanMuc291cmNlLmh0bWxcbiAgICAvLyBzb21ld2hhdCBtb3JlIGluIGxpbmUgd2l0aCA0LjQuMy4yIDIwMDQgc3BlYywgYnV0IGFsbG93cyBkZWNpbWFsIGFueXdoZXJlXG4gICAgdmFyIGNyZWF0ZV9faXNvUmVnZXggPSAvXigtKT9QKD86KD86KFswLTksLl0qKVkpPyg/OihbMC05LC5dKilNKT8oPzooWzAtOSwuXSopRCk/KD86VCg/OihbMC05LC5dKilIKT8oPzooWzAtOSwuXSopTSk/KD86KFswLTksLl0qKVMpPyk/fChbMC05LC5dKilXKSQvO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlX19jcmVhdGVEdXJhdGlvbiAoaW5wdXQsIGtleSkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBpbnB1dCxcbiAgICAgICAgICAgIC8vIG1hdGNoaW5nIGFnYWluc3QgcmVnZXhwIGlzIGV4cGVuc2l2ZSwgZG8gaXQgb24gZGVtYW5kXG4gICAgICAgICAgICBtYXRjaCA9IG51bGwsXG4gICAgICAgICAgICBzaWduLFxuICAgICAgICAgICAgcmV0LFxuICAgICAgICAgICAgZGlmZlJlcztcblxuICAgICAgICBpZiAoaXNEdXJhdGlvbihpbnB1dCkpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1zIDogaW5wdXQuX21pbGxpc2Vjb25kcyxcbiAgICAgICAgICAgICAgICBkICA6IGlucHV0Ll9kYXlzLFxuICAgICAgICAgICAgICAgIE0gIDogaW5wdXQuX21vbnRoc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHt9O1xuICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uW2tleV0gPSBpbnB1dDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb24ubWlsbGlzZWNvbmRzID0gaW5wdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoISEobWF0Y2ggPSBhc3BOZXRSZWdleC5leGVjKGlucHV0KSkpIHtcbiAgICAgICAgICAgIHNpZ24gPSAobWF0Y2hbMV0gPT09ICctJykgPyAtMSA6IDE7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB5ICA6IDAsXG4gICAgICAgICAgICAgICAgZCAgOiB0b0ludChtYXRjaFtEQVRFXSkgICAgICAgICogc2lnbixcbiAgICAgICAgICAgICAgICBoICA6IHRvSW50KG1hdGNoW0hPVVJdKSAgICAgICAgKiBzaWduLFxuICAgICAgICAgICAgICAgIG0gIDogdG9JbnQobWF0Y2hbTUlOVVRFXSkgICAgICAqIHNpZ24sXG4gICAgICAgICAgICAgICAgcyAgOiB0b0ludChtYXRjaFtTRUNPTkRdKSAgICAgICogc2lnbixcbiAgICAgICAgICAgICAgICBtcyA6IHRvSW50KG1hdGNoW01JTExJU0VDT05EXSkgKiBzaWduXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKCEhKG1hdGNoID0gY3JlYXRlX19pc29SZWdleC5leGVjKGlucHV0KSkpIHtcbiAgICAgICAgICAgIHNpZ24gPSAobWF0Y2hbMV0gPT09ICctJykgPyAtMSA6IDE7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB5IDogcGFyc2VJc28obWF0Y2hbMl0sIHNpZ24pLFxuICAgICAgICAgICAgICAgIE0gOiBwYXJzZUlzbyhtYXRjaFszXSwgc2lnbiksXG4gICAgICAgICAgICAgICAgZCA6IHBhcnNlSXNvKG1hdGNoWzRdLCBzaWduKSxcbiAgICAgICAgICAgICAgICBoIDogcGFyc2VJc28obWF0Y2hbNV0sIHNpZ24pLFxuICAgICAgICAgICAgICAgIG0gOiBwYXJzZUlzbyhtYXRjaFs2XSwgc2lnbiksXG4gICAgICAgICAgICAgICAgcyA6IHBhcnNlSXNvKG1hdGNoWzddLCBzaWduKSxcbiAgICAgICAgICAgICAgICB3IDogcGFyc2VJc28obWF0Y2hbOF0sIHNpZ24pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKGR1cmF0aW9uID09IG51bGwpIHsvLyBjaGVja3MgZm9yIG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBkdXJhdGlvbiA9IHt9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkdXJhdGlvbiA9PT0gJ29iamVjdCcgJiYgKCdmcm9tJyBpbiBkdXJhdGlvbiB8fCAndG8nIGluIGR1cmF0aW9uKSkge1xuICAgICAgICAgICAgZGlmZlJlcyA9IG1vbWVudHNEaWZmZXJlbmNlKGxvY2FsX19jcmVhdGVMb2NhbChkdXJhdGlvbi5mcm9tKSwgbG9jYWxfX2NyZWF0ZUxvY2FsKGR1cmF0aW9uLnRvKSk7XG5cbiAgICAgICAgICAgIGR1cmF0aW9uID0ge307XG4gICAgICAgICAgICBkdXJhdGlvbi5tcyA9IGRpZmZSZXMubWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgZHVyYXRpb24uTSA9IGRpZmZSZXMubW9udGhzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0ID0gbmV3IER1cmF0aW9uKGR1cmF0aW9uKTtcblxuICAgICAgICBpZiAoaXNEdXJhdGlvbihpbnB1dCkgJiYgaGFzT3duUHJvcChpbnB1dCwgJ19sb2NhbGUnKSkge1xuICAgICAgICAgICAgcmV0Ll9sb2NhbGUgPSBpbnB1dC5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBjcmVhdGVfX2NyZWF0ZUR1cmF0aW9uLmZuID0gRHVyYXRpb24ucHJvdG90eXBlO1xuXG4gICAgZnVuY3Rpb24gcGFyc2VJc28gKGlucCwgc2lnbikge1xuICAgICAgICAvLyBXZSdkIG5vcm1hbGx5IHVzZSB+fmlucCBmb3IgdGhpcywgYnV0IHVuZm9ydHVuYXRlbHkgaXQgYWxzb1xuICAgICAgICAvLyBjb252ZXJ0cyBmbG9hdHMgdG8gaW50cy5cbiAgICAgICAgLy8gaW5wIG1heSBiZSB1bmRlZmluZWQsIHNvIGNhcmVmdWwgY2FsbGluZyByZXBsYWNlIG9uIGl0LlxuICAgICAgICB2YXIgcmVzID0gaW5wICYmIHBhcnNlRmxvYXQoaW5wLnJlcGxhY2UoJywnLCAnLicpKTtcbiAgICAgICAgLy8gYXBwbHkgc2lnbiB3aGlsZSB3ZSdyZSBhdCBpdFxuICAgICAgICByZXR1cm4gKGlzTmFOKHJlcykgPyAwIDogcmVzKSAqIHNpZ247XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9zaXRpdmVNb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcikge1xuICAgICAgICB2YXIgcmVzID0ge21pbGxpc2Vjb25kczogMCwgbW9udGhzOiAwfTtcblxuICAgICAgICByZXMubW9udGhzID0gb3RoZXIubW9udGgoKSAtIGJhc2UubW9udGgoKSArXG4gICAgICAgICAgICAob3RoZXIueWVhcigpIC0gYmFzZS55ZWFyKCkpICogMTI7XG4gICAgICAgIGlmIChiYXNlLmNsb25lKCkuYWRkKHJlcy5tb250aHMsICdNJykuaXNBZnRlcihvdGhlcikpIHtcbiAgICAgICAgICAgIC0tcmVzLm1vbnRocztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcy5taWxsaXNlY29uZHMgPSArb3RoZXIgLSArKGJhc2UuY2xvbmUoKS5hZGQocmVzLm1vbnRocywgJ00nKSk7XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcikge1xuICAgICAgICB2YXIgcmVzO1xuICAgICAgICBvdGhlciA9IGNsb25lV2l0aE9mZnNldChvdGhlciwgYmFzZSk7XG4gICAgICAgIGlmIChiYXNlLmlzQmVmb3JlKG90aGVyKSkge1xuICAgICAgICAgICAgcmVzID0gcG9zaXRpdmVNb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMgPSBwb3NpdGl2ZU1vbWVudHNEaWZmZXJlbmNlKG90aGVyLCBiYXNlKTtcbiAgICAgICAgICAgIHJlcy5taWxsaXNlY29uZHMgPSAtcmVzLm1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgIHJlcy5tb250aHMgPSAtcmVzLm1vbnRocztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQWRkZXIoZGlyZWN0aW9uLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsLCBwZXJpb2QpIHtcbiAgICAgICAgICAgIHZhciBkdXIsIHRtcDtcbiAgICAgICAgICAgIC8vaW52ZXJ0IHRoZSBhcmd1bWVudHMsIGJ1dCBjb21wbGFpbiBhYm91dCBpdFxuICAgICAgICAgICAgaWYgKHBlcmlvZCAhPT0gbnVsbCAmJiAhaXNOYU4oK3BlcmlvZCkpIHtcbiAgICAgICAgICAgICAgICBkZXByZWNhdGVTaW1wbGUobmFtZSwgJ21vbWVudCgpLicgKyBuYW1lICArICcocGVyaW9kLCBudW1iZXIpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgbW9tZW50KCkuJyArIG5hbWUgKyAnKG51bWJlciwgcGVyaW9kKS4nKTtcbiAgICAgICAgICAgICAgICB0bXAgPSB2YWw7IHZhbCA9IHBlcmlvZDsgcGVyaW9kID0gdG1wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWwgPSB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyA/ICt2YWwgOiB2YWw7XG4gICAgICAgICAgICBkdXIgPSBjcmVhdGVfX2NyZWF0ZUR1cmF0aW9uKHZhbCwgcGVyaW9kKTtcbiAgICAgICAgICAgIGFkZF9zdWJ0cmFjdF9fYWRkU3VidHJhY3QodGhpcywgZHVyLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkX3N1YnRyYWN0X19hZGRTdWJ0cmFjdCAobW9tLCBkdXJhdGlvbiwgaXNBZGRpbmcsIHVwZGF0ZU9mZnNldCkge1xuICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gZHVyYXRpb24uX21pbGxpc2Vjb25kcyxcbiAgICAgICAgICAgIGRheXMgPSBkdXJhdGlvbi5fZGF5cyxcbiAgICAgICAgICAgIG1vbnRocyA9IGR1cmF0aW9uLl9tb250aHM7XG4gICAgICAgIHVwZGF0ZU9mZnNldCA9IHVwZGF0ZU9mZnNldCA9PSBudWxsID8gdHJ1ZSA6IHVwZGF0ZU9mZnNldDtcblxuICAgICAgICBpZiAobWlsbGlzZWNvbmRzKSB7XG4gICAgICAgICAgICBtb20uX2Quc2V0VGltZSgrbW9tLl9kICsgbWlsbGlzZWNvbmRzICogaXNBZGRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXlzKSB7XG4gICAgICAgICAgICBnZXRfc2V0X19zZXQobW9tLCAnRGF0ZScsIGdldF9zZXRfX2dldChtb20sICdEYXRlJykgKyBkYXlzICogaXNBZGRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb250aHMpIHtcbiAgICAgICAgICAgIHNldE1vbnRoKG1vbSwgZ2V0X3NldF9fZ2V0KG1vbSwgJ01vbnRoJykgKyBtb250aHMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZU9mZnNldCkge1xuICAgICAgICAgICAgdXRpbHNfaG9va3NfX2hvb2tzLnVwZGF0ZU9mZnNldChtb20sIGRheXMgfHwgbW9udGhzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhZGRfc3VidHJhY3RfX2FkZCAgICAgID0gY3JlYXRlQWRkZXIoMSwgJ2FkZCcpO1xuICAgIHZhciBhZGRfc3VidHJhY3RfX3N1YnRyYWN0ID0gY3JlYXRlQWRkZXIoLTEsICdzdWJ0cmFjdCcpO1xuXG4gICAgZnVuY3Rpb24gbW9tZW50X2NhbGVuZGFyX19jYWxlbmRhciAodGltZSwgZm9ybWF0cykge1xuICAgICAgICAvLyBXZSB3YW50IHRvIGNvbXBhcmUgdGhlIHN0YXJ0IG9mIHRvZGF5LCB2cyB0aGlzLlxuICAgICAgICAvLyBHZXR0aW5nIHN0YXJ0LW9mLXRvZGF5IGRlcGVuZHMgb24gd2hldGhlciB3ZSdyZSBsb2NhbC91dGMvb2Zmc2V0IG9yIG5vdC5cbiAgICAgICAgdmFyIG5vdyA9IHRpbWUgfHwgbG9jYWxfX2NyZWF0ZUxvY2FsKCksXG4gICAgICAgICAgICBzb2QgPSBjbG9uZVdpdGhPZmZzZXQobm93LCB0aGlzKS5zdGFydE9mKCdkYXknKSxcbiAgICAgICAgICAgIGRpZmYgPSB0aGlzLmRpZmYoc29kLCAnZGF5cycsIHRydWUpLFxuICAgICAgICAgICAgZm9ybWF0ID0gZGlmZiA8IC02ID8gJ3NhbWVFbHNlJyA6XG4gICAgICAgICAgICAgICAgZGlmZiA8IC0xID8gJ2xhc3RXZWVrJyA6XG4gICAgICAgICAgICAgICAgZGlmZiA8IDAgPyAnbGFzdERheScgOlxuICAgICAgICAgICAgICAgIGRpZmYgPCAxID8gJ3NhbWVEYXknIDpcbiAgICAgICAgICAgICAgICBkaWZmIDwgMiA/ICduZXh0RGF5JyA6XG4gICAgICAgICAgICAgICAgZGlmZiA8IDcgPyAnbmV4dFdlZWsnIDogJ3NhbWVFbHNlJztcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KGZvcm1hdHMgJiYgZm9ybWF0c1tmb3JtYXRdIHx8IHRoaXMubG9jYWxlRGF0YSgpLmNhbGVuZGFyKGZvcm1hdCwgdGhpcywgbG9jYWxfX2NyZWF0ZUxvY2FsKG5vdykpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbG9uZSAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTW9tZW50KHRoaXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQWZ0ZXIgKGlucHV0LCB1bml0cykge1xuICAgICAgICB2YXIgaW5wdXRNcztcbiAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh0eXBlb2YgdW5pdHMgIT09ICd1bmRlZmluZWQnID8gdW5pdHMgOiAnbWlsbGlzZWNvbmQnKTtcbiAgICAgICAgaWYgKHVuaXRzID09PSAnbWlsbGlzZWNvbmQnKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGlzTW9tZW50KGlucHV0KSA/IGlucHV0IDogbG9jYWxfX2NyZWF0ZUxvY2FsKGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybiArdGhpcyA+ICtpbnB1dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0TXMgPSBpc01vbWVudChpbnB1dCkgPyAraW5wdXQgOiArbG9jYWxfX2NyZWF0ZUxvY2FsKGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dE1zIDwgK3RoaXMuY2xvbmUoKS5zdGFydE9mKHVuaXRzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQmVmb3JlIChpbnB1dCwgdW5pdHMpIHtcbiAgICAgICAgdmFyIGlucHV0TXM7XG4gICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModHlwZW9mIHVuaXRzICE9PSAndW5kZWZpbmVkJyA/IHVuaXRzIDogJ21pbGxpc2Vjb25kJyk7XG4gICAgICAgIGlmICh1bml0cyA9PT0gJ21pbGxpc2Vjb25kJykge1xuICAgICAgICAgICAgaW5wdXQgPSBpc01vbWVudChpbnB1dCkgPyBpbnB1dCA6IGxvY2FsX19jcmVhdGVMb2NhbChpbnB1dCk7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMgPCAraW5wdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dE1zID0gaXNNb21lbnQoaW5wdXQpID8gK2lucHV0IDogK2xvY2FsX19jcmVhdGVMb2NhbChpbnB1dCk7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMuY2xvbmUoKS5lbmRPZih1bml0cykgPCBpbnB1dE1zO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNCZXR3ZWVuIChmcm9tLCB0bywgdW5pdHMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBZnRlcihmcm9tLCB1bml0cykgJiYgdGhpcy5pc0JlZm9yZSh0bywgdW5pdHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzU2FtZSAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgIHZhciBpbnB1dE1zO1xuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzIHx8ICdtaWxsaXNlY29uZCcpO1xuICAgICAgICBpZiAodW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgIGlucHV0ID0gaXNNb21lbnQoaW5wdXQpID8gaW5wdXQgOiBsb2NhbF9fY3JlYXRlTG9jYWwoaW5wdXQpO1xuICAgICAgICAgICAgcmV0dXJuICt0aGlzID09PSAraW5wdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dE1zID0gK2xvY2FsX19jcmVhdGVMb2NhbChpbnB1dCk7XG4gICAgICAgICAgICByZXR1cm4gKyh0aGlzLmNsb25lKCkuc3RhcnRPZih1bml0cykpIDw9IGlucHV0TXMgJiYgaW5wdXRNcyA8PSArKHRoaXMuY2xvbmUoKS5lbmRPZih1bml0cykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlmZiAoaW5wdXQsIHVuaXRzLCBhc0Zsb2F0KSB7XG4gICAgICAgIHZhciB0aGF0ID0gY2xvbmVXaXRoT2Zmc2V0KGlucHV0LCB0aGlzKSxcbiAgICAgICAgICAgIHpvbmVEZWx0YSA9ICh0aGF0LnV0Y09mZnNldCgpIC0gdGhpcy51dGNPZmZzZXQoKSkgKiA2ZTQsXG4gICAgICAgICAgICBkZWx0YSwgb3V0cHV0O1xuXG4gICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuXG4gICAgICAgIGlmICh1bml0cyA9PT0gJ3llYXInIHx8IHVuaXRzID09PSAnbW9udGgnIHx8IHVuaXRzID09PSAncXVhcnRlcicpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG1vbnRoRGlmZih0aGlzLCB0aGF0KTtcbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ3F1YXJ0ZXInKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0IC8gMztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodW5pdHMgPT09ICd5ZWFyJykge1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCAvIDEyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsdGEgPSB0aGlzIC0gdGhhdDtcbiAgICAgICAgICAgIG91dHB1dCA9IHVuaXRzID09PSAnc2Vjb25kJyA/IGRlbHRhIC8gMWUzIDogLy8gMTAwMFxuICAgICAgICAgICAgICAgIHVuaXRzID09PSAnbWludXRlJyA/IGRlbHRhIC8gNmU0IDogLy8gMTAwMCAqIDYwXG4gICAgICAgICAgICAgICAgdW5pdHMgPT09ICdob3VyJyA/IGRlbHRhIC8gMzZlNSA6IC8vIDEwMDAgKiA2MCAqIDYwXG4gICAgICAgICAgICAgICAgdW5pdHMgPT09ICdkYXknID8gKGRlbHRhIC0gem9uZURlbHRhKSAvIDg2NGU1IDogLy8gMTAwMCAqIDYwICogNjAgKiAyNCwgbmVnYXRlIGRzdFxuICAgICAgICAgICAgICAgIHVuaXRzID09PSAnd2VlaycgPyAoZGVsdGEgLSB6b25lRGVsdGEpIC8gNjA0OGU1IDogLy8gMTAwMCAqIDYwICogNjAgKiAyNCAqIDcsIG5lZ2F0ZSBkc3RcbiAgICAgICAgICAgICAgICBkZWx0YTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXNGbG9hdCA/IG91dHB1dCA6IGFic0Zsb29yKG91dHB1dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9udGhEaWZmIChhLCBiKSB7XG4gICAgICAgIC8vIGRpZmZlcmVuY2UgaW4gbW9udGhzXG4gICAgICAgIHZhciB3aG9sZU1vbnRoRGlmZiA9ICgoYi55ZWFyKCkgLSBhLnllYXIoKSkgKiAxMikgKyAoYi5tb250aCgpIC0gYS5tb250aCgpKSxcbiAgICAgICAgICAgIC8vIGIgaXMgaW4gKGFuY2hvciAtIDEgbW9udGgsIGFuY2hvciArIDEgbW9udGgpXG4gICAgICAgICAgICBhbmNob3IgPSBhLmNsb25lKCkuYWRkKHdob2xlTW9udGhEaWZmLCAnbW9udGhzJyksXG4gICAgICAgICAgICBhbmNob3IyLCBhZGp1c3Q7XG5cbiAgICAgICAgaWYgKGIgLSBhbmNob3IgPCAwKSB7XG4gICAgICAgICAgICBhbmNob3IyID0gYS5jbG9uZSgpLmFkZCh3aG9sZU1vbnRoRGlmZiAtIDEsICdtb250aHMnKTtcbiAgICAgICAgICAgIC8vIGxpbmVhciBhY3Jvc3MgdGhlIG1vbnRoXG4gICAgICAgICAgICBhZGp1c3QgPSAoYiAtIGFuY2hvcikgLyAoYW5jaG9yIC0gYW5jaG9yMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmNob3IyID0gYS5jbG9uZSgpLmFkZCh3aG9sZU1vbnRoRGlmZiArIDEsICdtb250aHMnKTtcbiAgICAgICAgICAgIC8vIGxpbmVhciBhY3Jvc3MgdGhlIG1vbnRoXG4gICAgICAgICAgICBhZGp1c3QgPSAoYiAtIGFuY2hvcikgLyAoYW5jaG9yMiAtIGFuY2hvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gLSh3aG9sZU1vbnRoRGlmZiArIGFkanVzdCk7XG4gICAgfVxuXG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLmRlZmF1bHRGb3JtYXQgPSAnWVlZWS1NTS1ERFRISDptbTpzc1onO1xuXG4gICAgZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmxvY2FsZSgnZW4nKS5mb3JtYXQoJ2RkZCBNTU0gREQgWVlZWSBISDptbTpzcyBbR01UXVpaJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9tZW50X2Zvcm1hdF9fdG9JU09TdHJpbmcgKCkge1xuICAgICAgICB2YXIgbSA9IHRoaXMuY2xvbmUoKS51dGMoKTtcbiAgICAgICAgaWYgKDAgPCBtLnllYXIoKSAmJiBtLnllYXIoKSA8PSA5OTk5KSB7XG4gICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIERhdGUucHJvdG90eXBlLnRvSVNPU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgLy8gbmF0aXZlIGltcGxlbWVudGF0aW9uIGlzIH41MHggZmFzdGVyLCB1c2UgaXQgd2hlbiB3ZSBjYW5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b0RhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0TW9tZW50KG0sICdZWVlZLU1NLUREW1RdSEg6bW06c3MuU1NTW1pdJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0TW9tZW50KG0sICdZWVlZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl0nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdCAoaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgdmFyIG91dHB1dCA9IGZvcm1hdE1vbWVudCh0aGlzLCBpbnB1dFN0cmluZyB8fCB1dGlsc19ob29rc19faG9va3MuZGVmYXVsdEZvcm1hdCk7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5wb3N0Zm9ybWF0KG91dHB1dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnJvbSAodGltZSwgd2l0aG91dFN1ZmZpeCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkuaW52YWxpZERhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3JlYXRlX19jcmVhdGVEdXJhdGlvbih7dG86IHRoaXMsIGZyb206IHRpbWV9KS5sb2NhbGUodGhpcy5sb2NhbGUoKSkuaHVtYW5pemUoIXdpdGhvdXRTdWZmaXgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZyb21Ob3cgKHdpdGhvdXRTdWZmaXgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnJvbShsb2NhbF9fY3JlYXRlTG9jYWwoKSwgd2l0aG91dFN1ZmZpeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG8gKHRpbWUsIHdpdGhvdXRTdWZmaXgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZV9fY3JlYXRlRHVyYXRpb24oe2Zyb206IHRoaXMsIHRvOiB0aW1lfSkubG9jYWxlKHRoaXMubG9jYWxlKCkpLmh1bWFuaXplKCF3aXRob3V0U3VmZml4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b05vdyAod2l0aG91dFN1ZmZpeCkge1xuICAgICAgICByZXR1cm4gdGhpcy50byhsb2NhbF9fY3JlYXRlTG9jYWwoKSwgd2l0aG91dFN1ZmZpeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9jYWxlIChrZXkpIHtcbiAgICAgICAgdmFyIG5ld0xvY2FsZURhdGE7XG5cbiAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxlLl9hYmJyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3TG9jYWxlRGF0YSA9IGxvY2FsZV9sb2NhbGVzX19nZXRMb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIGlmIChuZXdMb2NhbGVEYXRhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2NhbGUgPSBuZXdMb2NhbGVEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGFuZyA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudCgpLmxhbmcoKSBpcyBkZXByZWNhdGVkLiBJbnN0ZWFkLCB1c2UgbW9tZW50KCkubG9jYWxlRGF0YSgpIHRvIGdldCB0aGUgbGFuZ3VhZ2UgY29uZmlndXJhdGlvbi4gVXNlIG1vbWVudCgpLmxvY2FsZSgpIHRvIGNoYW5nZSBsYW5ndWFnZXMuJyxcbiAgICAgICAgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVEYXRhICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGFydE9mICh1bml0cykge1xuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBzd2l0Y2ggaW50ZW50aW9uYWxseSBvbWl0cyBicmVhayBrZXl3b3Jkc1xuICAgICAgICAvLyB0byB1dGlsaXplIGZhbGxpbmcgdGhyb3VnaCB0aGUgY2FzZXMuXG4gICAgICAgIHN3aXRjaCAodW5pdHMpIHtcbiAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgICAgICB0aGlzLm1vbnRoKDApO1xuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdxdWFydGVyJzpcbiAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICAgICAgdGhpcy5kYXRlKDEpO1xuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAnaXNvV2Vlayc6XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgICAgICB0aGlzLmhvdXJzKDApO1xuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgICAgIHRoaXMubWludXRlcygwKTtcbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICAgIHRoaXMuc2Vjb25kcygwKTtcbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgICAgIHRoaXMubWlsbGlzZWNvbmRzKDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2Vla3MgYXJlIGEgc3BlY2lhbCBjYXNlXG4gICAgICAgIGlmICh1bml0cyA9PT0gJ3dlZWsnKSB7XG4gICAgICAgICAgICB0aGlzLndlZWtkYXkoMCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVuaXRzID09PSAnaXNvV2VlaycpIHtcbiAgICAgICAgICAgIHRoaXMuaXNvV2Vla2RheSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHF1YXJ0ZXJzIGFyZSBhbHNvIHNwZWNpYWxcbiAgICAgICAgaWYgKHVuaXRzID09PSAncXVhcnRlcicpIHtcbiAgICAgICAgICAgIHRoaXMubW9udGgoTWF0aC5mbG9vcih0aGlzLm1vbnRoKCkgLyAzKSAqIDMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW5kT2YgKHVuaXRzKSB7XG4gICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICBpZiAodW5pdHMgPT09IHVuZGVmaW5lZCB8fCB1bml0cyA9PT0gJ21pbGxpc2Vjb25kJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRPZih1bml0cykuYWRkKDEsICh1bml0cyA9PT0gJ2lzb1dlZWsnID8gJ3dlZWsnIDogdW5pdHMpKS5zdWJ0cmFjdCgxLCAnbXMnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b190eXBlX192YWx1ZU9mICgpIHtcbiAgICAgICAgcmV0dXJuICt0aGlzLl9kIC0gKCh0aGlzLl9vZmZzZXQgfHwgMCkgKiA2MDAwMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5peCAoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKCt0aGlzIC8gMTAwMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9EYXRlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldCA/IG5ldyBEYXRlKCt0aGlzKSA6IHRoaXMuX2Q7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9BcnJheSAoKSB7XG4gICAgICAgIHZhciBtID0gdGhpcztcbiAgICAgICAgcmV0dXJuIFttLnllYXIoKSwgbS5tb250aCgpLCBtLmRhdGUoKSwgbS5ob3VyKCksIG0ubWludXRlKCksIG0uc2Vjb25kKCksIG0ubWlsbGlzZWNvbmQoKV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9PYmplY3QgKCkge1xuICAgICAgICB2YXIgbSA9IHRoaXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyczogbS55ZWFyKCksXG4gICAgICAgICAgICBtb250aHM6IG0ubW9udGgoKSxcbiAgICAgICAgICAgIGRhdGU6IG0uZGF0ZSgpLFxuICAgICAgICAgICAgaG91cnM6IG0uaG91cnMoKSxcbiAgICAgICAgICAgIG1pbnV0ZXM6IG0ubWludXRlcygpLFxuICAgICAgICAgICAgc2Vjb25kczogbS5zZWNvbmRzKCksXG4gICAgICAgICAgICBtaWxsaXNlY29uZHM6IG0ubWlsbGlzZWNvbmRzKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb21lbnRfdmFsaWRfX2lzVmFsaWQgKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRfX2lzVmFsaWQodGhpcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2luZ0ZsYWdzICgpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgZ2V0UGFyc2luZ0ZsYWdzKHRoaXMpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbnZhbGlkQXQgKCkge1xuICAgICAgICByZXR1cm4gZ2V0UGFyc2luZ0ZsYWdzKHRoaXMpLm92ZXJmbG93O1xuICAgIH1cblxuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnZ2cnLCAyXSwgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53ZWVrWWVhcigpICUgMTAwO1xuICAgIH0pO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oMCwgWydHRycsIDJdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzb1dlZWtZZWFyKCkgJSAxMDA7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBhZGRXZWVrWWVhckZvcm1hdFRva2VuICh0b2tlbiwgZ2V0dGVyKSB7XG4gICAgICAgIGFkZEZvcm1hdFRva2VuKDAsIFt0b2tlbiwgdG9rZW4ubGVuZ3RoXSwgMCwgZ2V0dGVyKTtcbiAgICB9XG5cbiAgICBhZGRXZWVrWWVhckZvcm1hdFRva2VuKCdnZ2dnJywgICAgICd3ZWVrWWVhcicpO1xuICAgIGFkZFdlZWtZZWFyRm9ybWF0VG9rZW4oJ2dnZ2dnJywgICAgJ3dlZWtZZWFyJyk7XG4gICAgYWRkV2Vla1llYXJGb3JtYXRUb2tlbignR0dHRycsICAnaXNvV2Vla1llYXInKTtcbiAgICBhZGRXZWVrWWVhckZvcm1hdFRva2VuKCdHR0dHRycsICdpc29XZWVrWWVhcicpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCd3ZWVrWWVhcicsICdnZycpO1xuICAgIGFkZFVuaXRBbGlhcygnaXNvV2Vla1llYXInLCAnR0cnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ0cnLCAgICAgIG1hdGNoU2lnbmVkKTtcbiAgICBhZGRSZWdleFRva2VuKCdnJywgICAgICBtYXRjaFNpZ25lZCk7XG4gICAgYWRkUmVnZXhUb2tlbignR0cnLCAgICAgbWF0Y2gxdG8yLCBtYXRjaDIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2dnJywgICAgIG1hdGNoMXRvMiwgbWF0Y2gyKTtcbiAgICBhZGRSZWdleFRva2VuKCdHR0dHJywgICBtYXRjaDF0bzQsIG1hdGNoNCk7XG4gICAgYWRkUmVnZXhUb2tlbignZ2dnZycsICAgbWF0Y2gxdG80LCBtYXRjaDQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0dHR0dHJywgIG1hdGNoMXRvNiwgbWF0Y2g2KTtcbiAgICBhZGRSZWdleFRva2VuKCdnZ2dnZycsICBtYXRjaDF0bzYsIG1hdGNoNik7XG5cbiAgICBhZGRXZWVrUGFyc2VUb2tlbihbJ2dnZ2cnLCAnZ2dnZ2cnLCAnR0dHRycsICdHR0dHRyddLCBmdW5jdGlvbiAoaW5wdXQsIHdlZWssIGNvbmZpZywgdG9rZW4pIHtcbiAgICAgICAgd2Vla1t0b2tlbi5zdWJzdHIoMCwgMildID0gdG9JbnQoaW5wdXQpO1xuICAgIH0pO1xuXG4gICAgYWRkV2Vla1BhcnNlVG9rZW4oWydnZycsICdHRyddLCBmdW5jdGlvbiAoaW5wdXQsIHdlZWssIGNvbmZpZywgdG9rZW4pIHtcbiAgICAgICAgd2Vla1t0b2tlbl0gPSB1dGlsc19ob29rc19faG9va3MucGFyc2VUd29EaWdpdFllYXIoaW5wdXQpO1xuICAgIH0pO1xuXG4gICAgLy8gSEVMUEVSU1xuXG4gICAgZnVuY3Rpb24gd2Vla3NJblllYXIoeWVhciwgZG93LCBkb3kpIHtcbiAgICAgICAgcmV0dXJuIHdlZWtPZlllYXIobG9jYWxfX2NyZWF0ZUxvY2FsKFt5ZWFyLCAxMSwgMzEgKyBkb3cgLSBkb3ldKSwgZG93LCBkb3kpLndlZWs7XG4gICAgfVxuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgZnVuY3Rpb24gZ2V0U2V0V2Vla1llYXIgKGlucHV0KSB7XG4gICAgICAgIHZhciB5ZWFyID0gd2Vla09mWWVhcih0aGlzLCB0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3csIHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRveSkueWVhcjtcbiAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB5ZWFyIDogdGhpcy5hZGQoKGlucHV0IC0geWVhciksICd5Jyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U2V0SVNPV2Vla1llYXIgKGlucHV0KSB7XG4gICAgICAgIHZhciB5ZWFyID0gd2Vla09mWWVhcih0aGlzLCAxLCA0KS55ZWFyO1xuICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHllYXIgOiB0aGlzLmFkZCgoaW5wdXQgLSB5ZWFyKSwgJ3knKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJU09XZWVrc0luWWVhciAoKSB7XG4gICAgICAgIHJldHVybiB3ZWVrc0luWWVhcih0aGlzLnllYXIoKSwgMSwgNCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0V2Vla3NJblllYXIgKCkge1xuICAgICAgICB2YXIgd2Vla0luZm8gPSB0aGlzLmxvY2FsZURhdGEoKS5fd2VlaztcbiAgICAgICAgcmV0dXJuIHdlZWtzSW5ZZWFyKHRoaXMueWVhcigpLCB3ZWVrSW5mby5kb3csIHdlZWtJbmZvLmRveSk7XG4gICAgfVxuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ1EnLCAwLCAwLCAncXVhcnRlcicpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCdxdWFydGVyJywgJ1EnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ1EnLCBtYXRjaDEpO1xuICAgIGFkZFBhcnNlVG9rZW4oJ1EnLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5W01PTlRIXSA9ICh0b0ludChpbnB1dCkgLSAxKSAqIDM7XG4gICAgfSk7XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICBmdW5jdGlvbiBnZXRTZXRRdWFydGVyIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IE1hdGguY2VpbCgodGhpcy5tb250aCgpICsgMSkgLyAzKSA6IHRoaXMubW9udGgoKGlucHV0IC0gMSkgKiAzICsgdGhpcy5tb250aCgpICUgMyk7XG4gICAgfVxuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ0QnLCBbJ0REJywgMl0sICdEbycsICdkYXRlJyk7XG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ2RhdGUnLCAnRCcpO1xuXG4gICAgLy8gUEFSU0lOR1xuXG4gICAgYWRkUmVnZXhUb2tlbignRCcsICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0REJywgbWF0Y2gxdG8yLCBtYXRjaDIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0RvJywgZnVuY3Rpb24gKGlzU3RyaWN0LCBsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIGlzU3RyaWN0ID8gbG9jYWxlLl9vcmRpbmFsUGFyc2UgOiBsb2NhbGUuX29yZGluYWxQYXJzZUxlbmllbnQ7XG4gICAgfSk7XG5cbiAgICBhZGRQYXJzZVRva2VuKFsnRCcsICdERCddLCBEQVRFKTtcbiAgICBhZGRQYXJzZVRva2VuKCdEbycsIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXkpIHtcbiAgICAgICAgYXJyYXlbREFURV0gPSB0b0ludChpbnB1dC5tYXRjaChtYXRjaDF0bzIpWzBdLCAxMCk7XG4gICAgfSk7XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICB2YXIgZ2V0U2V0RGF5T2ZNb250aCA9IG1ha2VHZXRTZXQoJ0RhdGUnLCB0cnVlKTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdkJywgMCwgJ2RvJywgJ2RheScpO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ2RkJywgMCwgMCwgZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXNNaW4odGhpcywgZm9ybWF0KTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdkZGQnLCAwLCAwLCBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5c1Nob3J0KHRoaXMsIGZvcm1hdCk7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignZGRkZCcsIDAsIDAsIGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzKHRoaXMsIGZvcm1hdCk7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignZScsIDAsIDAsICd3ZWVrZGF5Jyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oJ0UnLCAwLCAwLCAnaXNvV2Vla2RheScpO1xuXG4gICAgLy8gQUxJQVNFU1xuXG4gICAgYWRkVW5pdEFsaWFzKCdkYXknLCAnZCcpO1xuICAgIGFkZFVuaXRBbGlhcygnd2Vla2RheScsICdlJyk7XG4gICAgYWRkVW5pdEFsaWFzKCdpc29XZWVrZGF5JywgJ0UnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ2QnLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2UnLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0UnLCAgICBtYXRjaDF0bzIpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2RkJywgICBtYXRjaFdvcmQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2RkZCcsICBtYXRjaFdvcmQpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ2RkZGQnLCBtYXRjaFdvcmQpO1xuXG4gICAgYWRkV2Vla1BhcnNlVG9rZW4oWydkZCcsICdkZGQnLCAnZGRkZCddLCBmdW5jdGlvbiAoaW5wdXQsIHdlZWssIGNvbmZpZykge1xuICAgICAgICB2YXIgd2Vla2RheSA9IGNvbmZpZy5fbG9jYWxlLndlZWtkYXlzUGFyc2UoaW5wdXQpO1xuICAgICAgICAvLyBpZiB3ZSBkaWRuJ3QgZ2V0IGEgd2Vla2RheSBuYW1lLCBtYXJrIHRoZSBkYXRlIGFzIGludmFsaWRcbiAgICAgICAgaWYgKHdlZWtkYXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgd2Vlay5kID0gd2Vla2RheTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdldFBhcnNpbmdGbGFncyhjb25maWcpLmludmFsaWRXZWVrZGF5ID0gaW5wdXQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGFkZFdlZWtQYXJzZVRva2VuKFsnZCcsICdlJywgJ0UnXSwgZnVuY3Rpb24gKGlucHV0LCB3ZWVrLCBjb25maWcsIHRva2VuKSB7XG4gICAgICAgIHdlZWtbdG9rZW5dID0gdG9JbnQoaW5wdXQpO1xuICAgIH0pO1xuXG4gICAgLy8gSEVMUEVSU1xuXG4gICAgZnVuY3Rpb24gcGFyc2VXZWVrZGF5KGlucHV0LCBsb2NhbGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNOYU4oaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoaW5wdXQsIDEwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0ID0gbG9jYWxlLndlZWtkYXlzUGFyc2UoaW5wdXQpO1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gTE9DQUxFU1xuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGVXZWVrZGF5cyA9ICdTdW5kYXlfTW9uZGF5X1R1ZXNkYXlfV2VkbmVzZGF5X1RodXJzZGF5X0ZyaWRheV9TYXR1cmRheScuc3BsaXQoJ18nKTtcbiAgICBmdW5jdGlvbiBsb2NhbGVXZWVrZGF5cyAobSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNbbS5kYXkoKV07XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGVXZWVrZGF5c1Nob3J0ID0gJ1N1bl9Nb25fVHVlX1dlZF9UaHVfRnJpX1NhdCcuc3BsaXQoJ18nKTtcbiAgICBmdW5jdGlvbiBsb2NhbGVXZWVrZGF5c1Nob3J0IChtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl93ZWVrZGF5c1Nob3J0W20uZGF5KCldO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0TG9jYWxlV2Vla2RheXNNaW4gPSAnU3VfTW9fVHVfV2VfVGhfRnJfU2EnLnNwbGl0KCdfJyk7XG4gICAgZnVuY3Rpb24gbG9jYWxlV2Vla2RheXNNaW4gKG0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzTWluW20uZGF5KCldO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvY2FsZVdlZWtkYXlzUGFyc2UgKHdlZWtkYXlOYW1lKSB7XG4gICAgICAgIHZhciBpLCBtb20sIHJlZ2V4O1xuXG4gICAgICAgIHRoaXMuX3dlZWtkYXlzUGFyc2UgPSB0aGlzLl93ZWVrZGF5c1BhcnNlIHx8IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuICAgICAgICAgICAgaWYgKCF0aGlzLl93ZWVrZGF5c1BhcnNlW2ldKSB7XG4gICAgICAgICAgICAgICAgbW9tID0gbG9jYWxfX2NyZWF0ZUxvY2FsKFsyMDAwLCAxXSkuZGF5KGkpO1xuICAgICAgICAgICAgICAgIHJlZ2V4ID0gJ14nICsgdGhpcy53ZWVrZGF5cyhtb20sICcnKSArICd8XicgKyB0aGlzLndlZWtkYXlzU2hvcnQobW9tLCAnJykgKyAnfF4nICsgdGhpcy53ZWVrZGF5c01pbihtb20sICcnKTtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1BhcnNlW2ldID0gbmV3IFJlZ0V4cChyZWdleC5yZXBsYWNlKCcuJywgJycpLCAnaScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGVzdCB0aGUgcmVnZXhcbiAgICAgICAgICAgIGlmICh0aGlzLl93ZWVrZGF5c1BhcnNlW2ldLnRlc3Qod2Vla2RheU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICBmdW5jdGlvbiBnZXRTZXREYXlPZldlZWsgKGlucHV0KSB7XG4gICAgICAgIHZhciBkYXkgPSB0aGlzLl9pc1VUQyA/IHRoaXMuX2QuZ2V0VVRDRGF5KCkgOiB0aGlzLl9kLmdldERheSgpO1xuICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaW5wdXQgPSBwYXJzZVdlZWtkYXkoaW5wdXQsIHRoaXMubG9jYWxlRGF0YSgpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChpbnB1dCAtIGRheSwgJ2QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBkYXk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRMb2NhbGVEYXlPZldlZWsgKGlucHV0KSB7XG4gICAgICAgIHZhciB3ZWVrZGF5ID0gKHRoaXMuZGF5KCkgKyA3IC0gdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG93KSAlIDc7XG4gICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2Vla2RheSA6IHRoaXMuYWRkKGlucHV0IC0gd2Vla2RheSwgJ2QnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZXRJU09EYXlPZldlZWsgKGlucHV0KSB7XG4gICAgICAgIC8vIGJlaGF2ZXMgdGhlIHNhbWUgYXMgbW9tZW50I2RheSBleGNlcHRcbiAgICAgICAgLy8gYXMgYSBnZXR0ZXIsIHJldHVybnMgNyBpbnN0ZWFkIG9mIDAgKDEtNyByYW5nZSBpbnN0ZWFkIG9mIDAtNilcbiAgICAgICAgLy8gYXMgYSBzZXR0ZXIsIHN1bmRheSBzaG91bGQgYmVsb25nIHRvIHRoZSBwcmV2aW91cyB3ZWVrLlxuICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHRoaXMuZGF5KCkgfHwgNyA6IHRoaXMuZGF5KHRoaXMuZGF5KCkgJSA3ID8gaW5wdXQgOiBpbnB1dCAtIDcpO1xuICAgIH1cblxuICAgIGFkZEZvcm1hdFRva2VuKCdIJywgWydISCcsIDJdLCAwLCAnaG91cicpO1xuICAgIGFkZEZvcm1hdFRva2VuKCdoJywgWydoaCcsIDJdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIG1lcmlkaWVtICh0b2tlbiwgbG93ZXJjYXNlKSB7XG4gICAgICAgIGFkZEZvcm1hdFRva2VuKHRva2VuLCAwLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubWVyaWRpZW0odGhpcy5ob3VycygpLCB0aGlzLm1pbnV0ZXMoKSwgbG93ZXJjYXNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbWVyaWRpZW0oJ2EnLCB0cnVlKTtcbiAgICBtZXJpZGllbSgnQScsIGZhbHNlKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnaG91cicsICdoJyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBmdW5jdGlvbiBtYXRjaE1lcmlkaWVtIChpc1N0cmljdCwgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGUuX21lcmlkaWVtUGFyc2U7XG4gICAgfVxuXG4gICAgYWRkUmVnZXhUb2tlbignYScsICBtYXRjaE1lcmlkaWVtKTtcbiAgICBhZGRSZWdleFRva2VuKCdBJywgIG1hdGNoTWVyaWRpZW0pO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ0gnLCAgbWF0Y2gxdG8yKTtcbiAgICBhZGRSZWdleFRva2VuKCdoJywgIG1hdGNoMXRvMik7XG4gICAgYWRkUmVnZXhUb2tlbignSEgnLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignaGgnLCBtYXRjaDF0bzIsIG1hdGNoMik7XG5cbiAgICBhZGRQYXJzZVRva2VuKFsnSCcsICdISCddLCBIT1VSKTtcbiAgICBhZGRQYXJzZVRva2VuKFsnYScsICdBJ10sIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICBjb25maWcuX2lzUG0gPSBjb25maWcuX2xvY2FsZS5pc1BNKGlucHV0KTtcbiAgICAgICAgY29uZmlnLl9tZXJpZGllbSA9IGlucHV0O1xuICAgIH0pO1xuICAgIGFkZFBhcnNlVG9rZW4oWydoJywgJ2hoJ10sIGZ1bmN0aW9uIChpbnB1dCwgYXJyYXksIGNvbmZpZykge1xuICAgICAgICBhcnJheVtIT1VSXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgZ2V0UGFyc2luZ0ZsYWdzKGNvbmZpZykuYmlnSG91ciA9IHRydWU7XG4gICAgfSk7XG5cbiAgICAvLyBMT0NBTEVTXG5cbiAgICBmdW5jdGlvbiBsb2NhbGVJc1BNIChpbnB1dCkge1xuICAgICAgICAvLyBJRTggUXVpcmtzIE1vZGUgJiBJRTcgU3RhbmRhcmRzIE1vZGUgZG8gbm90IGFsbG93IGFjY2Vzc2luZyBzdHJpbmdzIGxpa2UgYXJyYXlzXG4gICAgICAgIC8vIFVzaW5nIGNoYXJBdCBzaG91bGQgYmUgbW9yZSBjb21wYXRpYmxlLlxuICAgICAgICByZXR1cm4gKChpbnB1dCArICcnKS50b0xvd2VyQ2FzZSgpLmNoYXJBdCgwKSA9PT0gJ3AnKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdExvY2FsZU1lcmlkaWVtUGFyc2UgPSAvW2FwXVxcLj9tP1xcLj8vaTtcbiAgICBmdW5jdGlvbiBsb2NhbGVNZXJpZGllbSAoaG91cnMsIG1pbnV0ZXMsIGlzTG93ZXIpIHtcbiAgICAgICAgaWYgKGhvdXJzID4gMTEpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0xvd2VyID8gJ3BtJyA6ICdQTSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaXNMb3dlciA/ICdhbScgOiAnQU0nO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICAvLyBTZXR0aW5nIHRoZSBob3VyIHNob3VsZCBrZWVwIHRoZSB0aW1lLCBiZWNhdXNlIHRoZSB1c2VyIGV4cGxpY2l0bHlcbiAgICAvLyBzcGVjaWZpZWQgd2hpY2ggaG91ciBoZSB3YW50cy4gU28gdHJ5aW5nIHRvIG1haW50YWluIHRoZSBzYW1lIGhvdXIgKGluXG4gICAgLy8gYSBuZXcgdGltZXpvbmUpIG1ha2VzIHNlbnNlLiBBZGRpbmcvc3VidHJhY3RpbmcgaG91cnMgZG9lcyBub3QgZm9sbG93XG4gICAgLy8gdGhpcyBydWxlLlxuICAgIHZhciBnZXRTZXRIb3VyID0gbWFrZUdldFNldCgnSG91cnMnLCB0cnVlKTtcblxuICAgIGFkZEZvcm1hdFRva2VuKCdtJywgWydtbScsIDJdLCAwLCAnbWludXRlJyk7XG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ21pbnV0ZScsICdtJyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdtJywgIG1hdGNoMXRvMik7XG4gICAgYWRkUmVnZXhUb2tlbignbW0nLCBtYXRjaDF0bzIsIG1hdGNoMik7XG4gICAgYWRkUGFyc2VUb2tlbihbJ20nLCAnbW0nXSwgTUlOVVRFKTtcblxuICAgIC8vIE1PTUVOVFNcblxuICAgIHZhciBnZXRTZXRNaW51dGUgPSBtYWtlR2V0U2V0KCdNaW51dGVzJywgZmFsc2UpO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ3MnLCBbJ3NzJywgMl0sIDAsICdzZWNvbmQnKTtcblxuICAgIC8vIEFMSUFTRVNcblxuICAgIGFkZFVuaXRBbGlhcygnc2Vjb25kJywgJ3MnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ3MnLCAgbWF0Y2gxdG8yKTtcbiAgICBhZGRSZWdleFRva2VuKCdzcycsIG1hdGNoMXRvMiwgbWF0Y2gyKTtcbiAgICBhZGRQYXJzZVRva2VuKFsncycsICdzcyddLCBTRUNPTkQpO1xuXG4gICAgLy8gTU9NRU5UU1xuXG4gICAgdmFyIGdldFNldFNlY29uZCA9IG1ha2VHZXRTZXQoJ1NlY29uZHMnLCBmYWxzZSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbignUycsIDAsIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIH5+KHRoaXMubWlsbGlzZWNvbmQoKSAvIDEwMCk7XG4gICAgfSk7XG5cbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTJywgMl0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIH5+KHRoaXMubWlsbGlzZWNvbmQoKSAvIDEwKTtcbiAgICB9KTtcblxuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnU1NTJywgM10sIDAsICdtaWxsaXNlY29uZCcpO1xuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnU1NTUycsIDRdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTJywgNV0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmQoKSAqIDEwMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTUycsIDZdLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDAwO1xuICAgIH0pO1xuICAgIGFkZEZvcm1hdFRva2VuKDAsIFsnU1NTU1NTUycsIDddLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDAwMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTU1NTJywgOF0sIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWlsbGlzZWNvbmQoKSAqIDEwMDAwMDtcbiAgICB9KTtcbiAgICBhZGRGb3JtYXRUb2tlbigwLCBbJ1NTU1NTU1NTUycsIDldLCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1pbGxpc2Vjb25kKCkgKiAxMDAwMDAwO1xuICAgIH0pO1xuXG5cbiAgICAvLyBBTElBU0VTXG5cbiAgICBhZGRVbml0QWxpYXMoJ21pbGxpc2Vjb25kJywgJ21zJyk7XG5cbiAgICAvLyBQQVJTSU5HXG5cbiAgICBhZGRSZWdleFRva2VuKCdTJywgICAgbWF0Y2gxdG8zLCBtYXRjaDEpO1xuICAgIGFkZFJlZ2V4VG9rZW4oJ1NTJywgICBtYXRjaDF0bzMsIG1hdGNoMik7XG4gICAgYWRkUmVnZXhUb2tlbignU1NTJywgIG1hdGNoMXRvMywgbWF0Y2gzKTtcblxuICAgIHZhciB0b2tlbjtcbiAgICBmb3IgKHRva2VuID0gJ1NTU1MnOyB0b2tlbi5sZW5ndGggPD0gOTsgdG9rZW4gKz0gJ1MnKSB7XG4gICAgICAgIGFkZFJlZ2V4VG9rZW4odG9rZW4sIG1hdGNoVW5zaWduZWQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlTXMoaW5wdXQsIGFycmF5KSB7XG4gICAgICAgIGFycmF5W01JTExJU0VDT05EXSA9IHRvSW50KCgnMC4nICsgaW5wdXQpICogMTAwMCk7XG4gICAgfVxuXG4gICAgZm9yICh0b2tlbiA9ICdTJzsgdG9rZW4ubGVuZ3RoIDw9IDk7IHRva2VuICs9ICdTJykge1xuICAgICAgICBhZGRQYXJzZVRva2VuKHRva2VuLCBwYXJzZU1zKTtcbiAgICB9XG4gICAgLy8gTU9NRU5UU1xuXG4gICAgdmFyIGdldFNldE1pbGxpc2Vjb25kID0gbWFrZUdldFNldCgnTWlsbGlzZWNvbmRzJywgZmFsc2UpO1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ3onLCAgMCwgMCwgJ3pvbmVBYmJyJyk7XG4gICAgYWRkRm9ybWF0VG9rZW4oJ3p6JywgMCwgMCwgJ3pvbmVOYW1lJyk7XG5cbiAgICAvLyBNT01FTlRTXG5cbiAgICBmdW5jdGlvbiBnZXRab25lQWJiciAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/ICdVVEMnIDogJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Wm9uZU5hbWUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNVVEMgPyAnQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUnIDogJyc7XG4gICAgfVxuXG4gICAgdmFyIG1vbWVudFByb3RvdHlwZV9fcHJvdG8gPSBNb21lbnQucHJvdG90eXBlO1xuXG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5hZGQgICAgICAgICAgPSBhZGRfc3VidHJhY3RfX2FkZDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmNhbGVuZGFyICAgICA9IG1vbWVudF9jYWxlbmRhcl9fY2FsZW5kYXI7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5jbG9uZSAgICAgICAgPSBjbG9uZTtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmRpZmYgICAgICAgICA9IGRpZmY7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5lbmRPZiAgICAgICAgPSBlbmRPZjtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmZvcm1hdCAgICAgICA9IGZvcm1hdDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmZyb20gICAgICAgICA9IGZyb207XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5mcm9tTm93ICAgICAgPSBmcm9tTm93O1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8udG8gICAgICAgICAgID0gdG87XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by50b05vdyAgICAgICAgPSB0b05vdztcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmdldCAgICAgICAgICA9IGdldFNldDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmludmFsaWRBdCAgICA9IGludmFsaWRBdDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmlzQWZ0ZXIgICAgICA9IGlzQWZ0ZXI7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc0JlZm9yZSAgICAgPSBpc0JlZm9yZTtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmlzQmV0d2VlbiAgICA9IGlzQmV0d2VlbjtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmlzU2FtZSAgICAgICA9IGlzU2FtZTtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmlzVmFsaWQgICAgICA9IG1vbWVudF92YWxpZF9faXNWYWxpZDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmxhbmcgICAgICAgICA9IGxhbmc7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5sb2NhbGUgICAgICAgPSBsb2NhbGU7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5sb2NhbGVEYXRhICAgPSBsb2NhbGVEYXRhO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ubWF4ICAgICAgICAgID0gcHJvdG90eXBlTWF4O1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ubWluICAgICAgICAgID0gcHJvdG90eXBlTWluO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ucGFyc2luZ0ZsYWdzID0gcGFyc2luZ0ZsYWdzO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uc2V0ICAgICAgICAgID0gZ2V0U2V0O1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uc3RhcnRPZiAgICAgID0gc3RhcnRPZjtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLnN1YnRyYWN0ICAgICA9IGFkZF9zdWJ0cmFjdF9fc3VidHJhY3Q7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by50b0FycmF5ICAgICAgPSB0b0FycmF5O1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8udG9PYmplY3QgICAgID0gdG9PYmplY3Q7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by50b0RhdGUgICAgICAgPSB0b0RhdGU7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by50b0lTT1N0cmluZyAgPSBtb21lbnRfZm9ybWF0X190b0lTT1N0cmluZztcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLnRvSlNPTiAgICAgICA9IG1vbWVudF9mb3JtYXRfX3RvSVNPU3RyaW5nO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8udG9TdHJpbmcgICAgID0gdG9TdHJpbmc7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by51bml4ICAgICAgICAgPSB1bml4O1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8udmFsdWVPZiAgICAgID0gdG9fdHlwZV9fdmFsdWVPZjtcblxuICAgIC8vIFllYXJcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLnllYXIgICAgICAgPSBnZXRTZXRZZWFyO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uaXNMZWFwWWVhciA9IGdldElzTGVhcFllYXI7XG5cbiAgICAvLyBXZWVrIFllYXJcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLndlZWtZZWFyICAgID0gZ2V0U2V0V2Vla1llYXI7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc29XZWVrWWVhciA9IGdldFNldElTT1dlZWtZZWFyO1xuXG4gICAgLy8gUXVhcnRlclxuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ucXVhcnRlciA9IG1vbWVudFByb3RvdHlwZV9fcHJvdG8ucXVhcnRlcnMgPSBnZXRTZXRRdWFydGVyO1xuXG4gICAgLy8gTW9udGhcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLm1vbnRoICAgICAgID0gZ2V0U2V0TW9udGg7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5kYXlzSW5Nb250aCA9IGdldERheXNJbk1vbnRoO1xuXG4gICAgLy8gV2Vla1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ud2VlayAgICAgICAgICAgPSBtb21lbnRQcm90b3R5cGVfX3Byb3RvLndlZWtzICAgICAgICA9IGdldFNldFdlZWs7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc29XZWVrICAgICAgICA9IG1vbWVudFByb3RvdHlwZV9fcHJvdG8uaXNvV2Vla3MgICAgID0gZ2V0U2V0SVNPV2VlaztcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLndlZWtzSW5ZZWFyICAgID0gZ2V0V2Vla3NJblllYXI7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc29XZWVrc0luWWVhciA9IGdldElTT1dlZWtzSW5ZZWFyO1xuXG4gICAgLy8gRGF5XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5kYXRlICAgICAgID0gZ2V0U2V0RGF5T2ZNb250aDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmRheSAgICAgICAgPSBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmRheXMgICAgICAgICAgICAgPSBnZXRTZXREYXlPZldlZWs7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by53ZWVrZGF5ICAgID0gZ2V0U2V0TG9jYWxlRGF5T2ZXZWVrO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uaXNvV2Vla2RheSA9IGdldFNldElTT0RheU9mV2VlaztcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmRheU9mWWVhciAgPSBnZXRTZXREYXlPZlllYXI7XG5cbiAgICAvLyBIb3VyXG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5ob3VyID0gbW9tZW50UHJvdG90eXBlX19wcm90by5ob3VycyA9IGdldFNldEhvdXI7XG5cbiAgICAvLyBNaW51dGVcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLm1pbnV0ZSA9IG1vbWVudFByb3RvdHlwZV9fcHJvdG8ubWludXRlcyA9IGdldFNldE1pbnV0ZTtcblxuICAgIC8vIFNlY29uZFxuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uc2Vjb25kID0gbW9tZW50UHJvdG90eXBlX19wcm90by5zZWNvbmRzID0gZ2V0U2V0U2Vjb25kO1xuXG4gICAgLy8gTWlsbGlzZWNvbmRcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLm1pbGxpc2Vjb25kID0gbW9tZW50UHJvdG90eXBlX19wcm90by5taWxsaXNlY29uZHMgPSBnZXRTZXRNaWxsaXNlY29uZDtcblxuICAgIC8vIE9mZnNldFxuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8udXRjT2Zmc2V0ICAgICAgICAgICAgPSBnZXRTZXRPZmZzZXQ7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by51dGMgICAgICAgICAgICAgICAgICA9IHNldE9mZnNldFRvVVRDO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ubG9jYWwgICAgICAgICAgICAgICAgPSBzZXRPZmZzZXRUb0xvY2FsO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ucGFyc2Vab25lICAgICAgICAgICAgPSBzZXRPZmZzZXRUb1BhcnNlZE9mZnNldDtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmhhc0FsaWduZWRIb3VyT2Zmc2V0ID0gaGFzQWxpZ25lZEhvdXJPZmZzZXQ7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc0RTVCAgICAgICAgICAgICAgICA9IGlzRGF5bGlnaHRTYXZpbmdUaW1lO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uaXNEU1RTaGlmdGVkICAgICAgICAgPSBpc0RheWxpZ2h0U2F2aW5nVGltZVNoaWZ0ZWQ7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc0xvY2FsICAgICAgICAgICAgICA9IGlzTG9jYWw7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by5pc1V0Y09mZnNldCAgICAgICAgICA9IGlzVXRjT2Zmc2V0O1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uaXNVdGMgICAgICAgICAgICAgICAgPSBpc1V0YztcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmlzVVRDICAgICAgICAgICAgICAgID0gaXNVdGM7XG5cbiAgICAvLyBUaW1lem9uZVxuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8uem9uZUFiYnIgPSBnZXRab25lQWJicjtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLnpvbmVOYW1lID0gZ2V0Wm9uZU5hbWU7XG5cbiAgICAvLyBEZXByZWNhdGlvbnNcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLmRhdGVzICA9IGRlcHJlY2F0ZSgnZGF0ZXMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIGRhdGUgaW5zdGVhZC4nLCBnZXRTZXREYXlPZk1vbnRoKTtcbiAgICBtb21lbnRQcm90b3R5cGVfX3Byb3RvLm1vbnRocyA9IGRlcHJlY2F0ZSgnbW9udGhzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb250aCBpbnN0ZWFkJywgZ2V0U2V0TW9udGgpO1xuICAgIG1vbWVudFByb3RvdHlwZV9fcHJvdG8ueWVhcnMgID0gZGVwcmVjYXRlKCd5ZWFycyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgeWVhciBpbnN0ZWFkJywgZ2V0U2V0WWVhcik7XG4gICAgbW9tZW50UHJvdG90eXBlX19wcm90by56b25lICAgPSBkZXByZWNhdGUoJ21vbWVudCgpLnpvbmUgaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudCgpLnV0Y09mZnNldCBpbnN0ZWFkLiBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTc3OScsIGdldFNldFpvbmUpO1xuXG4gICAgdmFyIG1vbWVudFByb3RvdHlwZSA9IG1vbWVudFByb3RvdHlwZV9fcHJvdG87XG5cbiAgICBmdW5jdGlvbiBtb21lbnRfX2NyZWF0ZVVuaXggKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBsb2NhbF9fY3JlYXRlTG9jYWwoaW5wdXQgKiAxMDAwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb21lbnRfX2NyZWF0ZUluWm9uZSAoKSB7XG4gICAgICAgIHJldHVybiBsb2NhbF9fY3JlYXRlTG9jYWwuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYXJzZVpvbmUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdENhbGVuZGFyID0ge1xuICAgICAgICBzYW1lRGF5IDogJ1tUb2RheSBhdF0gTFQnLFxuICAgICAgICBuZXh0RGF5IDogJ1tUb21vcnJvdyBhdF0gTFQnLFxuICAgICAgICBuZXh0V2VlayA6ICdkZGRkIFthdF0gTFQnLFxuICAgICAgICBsYXN0RGF5IDogJ1tZZXN0ZXJkYXkgYXRdIExUJyxcbiAgICAgICAgbGFzdFdlZWsgOiAnW0xhc3RdIGRkZGQgW2F0XSBMVCcsXG4gICAgICAgIHNhbWVFbHNlIDogJ0wnXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGxvY2FsZV9jYWxlbmRhcl9fY2FsZW5kYXIgKGtleSwgbW9tLCBub3cpIHtcbiAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuX2NhbGVuZGFyW2tleV07XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nID8gb3V0cHV0LmNhbGwobW9tLCBub3cpIDogb3V0cHV0O1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0TG9uZ0RhdGVGb3JtYXQgPSB7XG4gICAgICAgIExUUyAgOiAnaDptbTpzcyBBJyxcbiAgICAgICAgTFQgICA6ICdoOm1tIEEnLFxuICAgICAgICBMICAgIDogJ01NL0REL1lZWVknLFxuICAgICAgICBMTCAgIDogJ01NTU0gRCwgWVlZWScsXG4gICAgICAgIExMTCAgOiAnTU1NTSBELCBZWVlZIGg6bW0gQScsXG4gICAgICAgIExMTEwgOiAnZGRkZCwgTU1NTSBELCBZWVlZIGg6bW0gQSdcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbG9uZ0RhdGVGb3JtYXQgKGtleSkge1xuICAgICAgICB2YXIgZm9ybWF0ID0gdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5XSxcbiAgICAgICAgICAgIGZvcm1hdFVwcGVyID0gdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5LnRvVXBwZXJDYXNlKCldO1xuXG4gICAgICAgIGlmIChmb3JtYXQgfHwgIWZvcm1hdFVwcGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5XSA9IGZvcm1hdFVwcGVyLnJlcGxhY2UoL01NTU18TU18RER8ZGRkZC9nLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsLnNsaWNlKDEpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5XTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdEludmFsaWREYXRlID0gJ0ludmFsaWQgZGF0ZSc7XG5cbiAgICBmdW5jdGlvbiBpbnZhbGlkRGF0ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZhbGlkRGF0ZTtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdE9yZGluYWwgPSAnJWQnO1xuICAgIHZhciBkZWZhdWx0T3JkaW5hbFBhcnNlID0gL1xcZHsxLDJ9LztcblxuICAgIGZ1bmN0aW9uIG9yZGluYWwgKG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3JkaW5hbC5yZXBsYWNlKCclZCcsIG51bWJlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJlUGFyc2VQb3N0Rm9ybWF0IChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdFJlbGF0aXZlVGltZSA9IHtcbiAgICAgICAgZnV0dXJlIDogJ2luICVzJyxcbiAgICAgICAgcGFzdCAgIDogJyVzIGFnbycsXG4gICAgICAgIHMgIDogJ2EgZmV3IHNlY29uZHMnLFxuICAgICAgICBtICA6ICdhIG1pbnV0ZScsXG4gICAgICAgIG1tIDogJyVkIG1pbnV0ZXMnLFxuICAgICAgICBoICA6ICdhbiBob3VyJyxcbiAgICAgICAgaGggOiAnJWQgaG91cnMnLFxuICAgICAgICBkICA6ICdhIGRheScsXG4gICAgICAgIGRkIDogJyVkIGRheXMnLFxuICAgICAgICBNICA6ICdhIG1vbnRoJyxcbiAgICAgICAgTU0gOiAnJWQgbW9udGhzJyxcbiAgICAgICAgeSAgOiAnYSB5ZWFyJyxcbiAgICAgICAgeXkgOiAnJWQgeWVhcnMnXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHJlbGF0aXZlX19yZWxhdGl2ZVRpbWUgKG51bWJlciwgd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSkge1xuICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fcmVsYXRpdmVUaW1lW3N0cmluZ107XG4gICAgICAgIHJldHVybiAodHlwZW9mIG91dHB1dCA9PT0gJ2Z1bmN0aW9uJykgP1xuICAgICAgICAgICAgb3V0cHV0KG51bWJlciwgd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSkgOlxuICAgICAgICAgICAgb3V0cHV0LnJlcGxhY2UoLyVkL2ksIG51bWJlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFzdEZ1dHVyZSAoZGlmZiwgb3V0cHV0KSB7XG4gICAgICAgIHZhciBmb3JtYXQgPSB0aGlzLl9yZWxhdGl2ZVRpbWVbZGlmZiA+IDAgPyAnZnV0dXJlJyA6ICdwYXN0J107XG4gICAgICAgIHJldHVybiB0eXBlb2YgZm9ybWF0ID09PSAnZnVuY3Rpb24nID8gZm9ybWF0KG91dHB1dCkgOiBmb3JtYXQucmVwbGFjZSgvJXMvaSwgb3V0cHV0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2NhbGVfc2V0X19zZXQgKGNvbmZpZykge1xuICAgICAgICB2YXIgcHJvcCwgaTtcbiAgICAgICAgZm9yIChpIGluIGNvbmZpZykge1xuICAgICAgICAgICAgcHJvcCA9IGNvbmZpZ1tpXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXNbaV0gPSBwcm9wO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzWydfJyArIGldID0gcHJvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBMZW5pZW50IG9yZGluYWwgcGFyc2luZyBhY2NlcHRzIGp1c3QgYSBudW1iZXIgaW4gYWRkaXRpb24gdG9cbiAgICAgICAgLy8gbnVtYmVyICsgKHBvc3NpYmx5KSBzdHVmZiBjb21pbmcgZnJvbSBfb3JkaW5hbFBhcnNlTGVuaWVudC5cbiAgICAgICAgdGhpcy5fb3JkaW5hbFBhcnNlTGVuaWVudCA9IG5ldyBSZWdFeHAodGhpcy5fb3JkaW5hbFBhcnNlLnNvdXJjZSArICd8JyArICgvXFxkezEsMn0vKS5zb3VyY2UpO1xuICAgIH1cblxuICAgIHZhciBwcm90b3R5cGVfX3Byb3RvID0gTG9jYWxlLnByb3RvdHlwZTtcblxuICAgIHByb3RvdHlwZV9fcHJvdG8uX2NhbGVuZGFyICAgICAgID0gZGVmYXVsdENhbGVuZGFyO1xuICAgIHByb3RvdHlwZV9fcHJvdG8uY2FsZW5kYXIgICAgICAgID0gbG9jYWxlX2NhbGVuZGFyX19jYWxlbmRhcjtcbiAgICBwcm90b3R5cGVfX3Byb3RvLl9sb25nRGF0ZUZvcm1hdCA9IGRlZmF1bHRMb25nRGF0ZUZvcm1hdDtcbiAgICBwcm90b3R5cGVfX3Byb3RvLmxvbmdEYXRlRm9ybWF0ICA9IGxvbmdEYXRlRm9ybWF0O1xuICAgIHByb3RvdHlwZV9fcHJvdG8uX2ludmFsaWREYXRlICAgID0gZGVmYXVsdEludmFsaWREYXRlO1xuICAgIHByb3RvdHlwZV9fcHJvdG8uaW52YWxpZERhdGUgICAgID0gaW52YWxpZERhdGU7XG4gICAgcHJvdG90eXBlX19wcm90by5fb3JkaW5hbCAgICAgICAgPSBkZWZhdWx0T3JkaW5hbDtcbiAgICBwcm90b3R5cGVfX3Byb3RvLm9yZGluYWwgICAgICAgICA9IG9yZGluYWw7XG4gICAgcHJvdG90eXBlX19wcm90by5fb3JkaW5hbFBhcnNlICAgPSBkZWZhdWx0T3JkaW5hbFBhcnNlO1xuICAgIHByb3RvdHlwZV9fcHJvdG8ucHJlcGFyc2UgICAgICAgID0gcHJlUGFyc2VQb3N0Rm9ybWF0O1xuICAgIHByb3RvdHlwZV9fcHJvdG8ucG9zdGZvcm1hdCAgICAgID0gcHJlUGFyc2VQb3N0Rm9ybWF0O1xuICAgIHByb3RvdHlwZV9fcHJvdG8uX3JlbGF0aXZlVGltZSAgID0gZGVmYXVsdFJlbGF0aXZlVGltZTtcbiAgICBwcm90b3R5cGVfX3Byb3RvLnJlbGF0aXZlVGltZSAgICA9IHJlbGF0aXZlX19yZWxhdGl2ZVRpbWU7XG4gICAgcHJvdG90eXBlX19wcm90by5wYXN0RnV0dXJlICAgICAgPSBwYXN0RnV0dXJlO1xuICAgIHByb3RvdHlwZV9fcHJvdG8uc2V0ICAgICAgICAgICAgID0gbG9jYWxlX3NldF9fc2V0O1xuXG4gICAgLy8gTW9udGhcbiAgICBwcm90b3R5cGVfX3Byb3RvLm1vbnRocyAgICAgICA9ICAgICAgICBsb2NhbGVNb250aHM7XG4gICAgcHJvdG90eXBlX19wcm90by5fbW9udGhzICAgICAgPSBkZWZhdWx0TG9jYWxlTW9udGhzO1xuICAgIHByb3RvdHlwZV9fcHJvdG8ubW9udGhzU2hvcnQgID0gICAgICAgIGxvY2FsZU1vbnRoc1Nob3J0O1xuICAgIHByb3RvdHlwZV9fcHJvdG8uX21vbnRoc1Nob3J0ID0gZGVmYXVsdExvY2FsZU1vbnRoc1Nob3J0O1xuICAgIHByb3RvdHlwZV9fcHJvdG8ubW9udGhzUGFyc2UgID0gICAgICAgIGxvY2FsZU1vbnRoc1BhcnNlO1xuXG4gICAgLy8gV2Vla1xuICAgIHByb3RvdHlwZV9fcHJvdG8ud2VlayA9IGxvY2FsZVdlZWs7XG4gICAgcHJvdG90eXBlX19wcm90by5fd2VlayA9IGRlZmF1bHRMb2NhbGVXZWVrO1xuICAgIHByb3RvdHlwZV9fcHJvdG8uZmlyc3REYXlPZlllYXIgPSBsb2NhbGVGaXJzdERheU9mWWVhcjtcbiAgICBwcm90b3R5cGVfX3Byb3RvLmZpcnN0RGF5T2ZXZWVrID0gbG9jYWxlRmlyc3REYXlPZldlZWs7XG5cbiAgICAvLyBEYXkgb2YgV2Vla1xuICAgIHByb3RvdHlwZV9fcHJvdG8ud2Vla2RheXMgICAgICAgPSAgICAgICAgbG9jYWxlV2Vla2RheXM7XG4gICAgcHJvdG90eXBlX19wcm90by5fd2Vla2RheXMgICAgICA9IGRlZmF1bHRMb2NhbGVXZWVrZGF5cztcbiAgICBwcm90b3R5cGVfX3Byb3RvLndlZWtkYXlzTWluICAgID0gICAgICAgIGxvY2FsZVdlZWtkYXlzTWluO1xuICAgIHByb3RvdHlwZV9fcHJvdG8uX3dlZWtkYXlzTWluICAgPSBkZWZhdWx0TG9jYWxlV2Vla2RheXNNaW47XG4gICAgcHJvdG90eXBlX19wcm90by53ZWVrZGF5c1Nob3J0ICA9ICAgICAgICBsb2NhbGVXZWVrZGF5c1Nob3J0O1xuICAgIHByb3RvdHlwZV9fcHJvdG8uX3dlZWtkYXlzU2hvcnQgPSBkZWZhdWx0TG9jYWxlV2Vla2RheXNTaG9ydDtcbiAgICBwcm90b3R5cGVfX3Byb3RvLndlZWtkYXlzUGFyc2UgID0gICAgICAgIGxvY2FsZVdlZWtkYXlzUGFyc2U7XG5cbiAgICAvLyBIb3Vyc1xuICAgIHByb3RvdHlwZV9fcHJvdG8uaXNQTSA9IGxvY2FsZUlzUE07XG4gICAgcHJvdG90eXBlX19wcm90by5fbWVyaWRpZW1QYXJzZSA9IGRlZmF1bHRMb2NhbGVNZXJpZGllbVBhcnNlO1xuICAgIHByb3RvdHlwZV9fcHJvdG8ubWVyaWRpZW0gPSBsb2NhbGVNZXJpZGllbTtcblxuICAgIGZ1bmN0aW9uIGxpc3RzX19nZXQgKGZvcm1hdCwgaW5kZXgsIGZpZWxkLCBzZXR0ZXIpIHtcbiAgICAgICAgdmFyIGxvY2FsZSA9IGxvY2FsZV9sb2NhbGVzX19nZXRMb2NhbGUoKTtcbiAgICAgICAgdmFyIHV0YyA9IGNyZWF0ZV91dGNfX2NyZWF0ZVVUQygpLnNldChzZXR0ZXIsIGluZGV4KTtcbiAgICAgICAgcmV0dXJuIGxvY2FsZVtmaWVsZF0odXRjLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3QgKGZvcm1hdCwgaW5kZXgsIGZpZWxkLCBjb3VudCwgc2V0dGVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaW5kZXggPSBmb3JtYXQ7XG4gICAgICAgICAgICBmb3JtYXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXQgPSBmb3JtYXQgfHwgJyc7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBsaXN0c19fZ2V0KGZvcm1hdCwgaW5kZXgsIGZpZWxkLCBzZXR0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIG91dFtpXSA9IGxpc3RzX19nZXQoZm9ybWF0LCBpLCBmaWVsZCwgc2V0dGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RzX19saXN0TW9udGhzIChmb3JtYXQsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBsaXN0KGZvcm1hdCwgaW5kZXgsICdtb250aHMnLCAxMiwgJ21vbnRoJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdHNfX2xpc3RNb250aHNTaG9ydCAoZm9ybWF0LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gbGlzdChmb3JtYXQsIGluZGV4LCAnbW9udGhzU2hvcnQnLCAxMiwgJ21vbnRoJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdHNfX2xpc3RXZWVrZGF5cyAoZm9ybWF0LCBpbmRleCkge1xuICAgICAgICByZXR1cm4gbGlzdChmb3JtYXQsIGluZGV4LCAnd2Vla2RheXMnLCA3LCAnZGF5Jyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdHNfX2xpc3RXZWVrZGF5c1Nob3J0IChmb3JtYXQsIGluZGV4KSB7XG4gICAgICAgIHJldHVybiBsaXN0KGZvcm1hdCwgaW5kZXgsICd3ZWVrZGF5c1Nob3J0JywgNywgJ2RheScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RzX19saXN0V2Vla2RheXNNaW4gKGZvcm1hdCwgaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuIGxpc3QoZm9ybWF0LCBpbmRleCwgJ3dlZWtkYXlzTWluJywgNywgJ2RheScpO1xuICAgIH1cblxuICAgIGxvY2FsZV9sb2NhbGVzX19nZXRTZXRHbG9iYWxMb2NhbGUoJ2VuJywge1xuICAgICAgICBvcmRpbmFsUGFyc2U6IC9cXGR7MSwyfSh0aHxzdHxuZHxyZCkvLFxuICAgICAgICBvcmRpbmFsIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICAgICAgdmFyIGIgPSBudW1iZXIgJSAxMCxcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSAodG9JbnQobnVtYmVyICUgMTAwIC8gMTApID09PSAxKSA/ICd0aCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAxKSA/ICdzdCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAyKSA/ICduZCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAzKSA/ICdyZCcgOiAndGgnO1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlciArIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5sYW5nID0gZGVwcmVjYXRlKCdtb21lbnQubGFuZyBpcyBkZXByZWNhdGVkLiBVc2UgbW9tZW50LmxvY2FsZSBpbnN0ZWFkLicsIGxvY2FsZV9sb2NhbGVzX19nZXRTZXRHbG9iYWxMb2NhbGUpO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5sYW5nRGF0YSA9IGRlcHJlY2F0ZSgnbW9tZW50LmxhbmdEYXRhIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb21lbnQubG9jYWxlRGF0YSBpbnN0ZWFkLicsIGxvY2FsZV9sb2NhbGVzX19nZXRMb2NhbGUpO1xuXG4gICAgdmFyIG1hdGhBYnMgPSBNYXRoLmFicztcblxuICAgIGZ1bmN0aW9uIGR1cmF0aW9uX2Fic19fYWJzICgpIHtcbiAgICAgICAgdmFyIGRhdGEgICAgICAgICAgID0gdGhpcy5fZGF0YTtcblxuICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgPSBtYXRoQWJzKHRoaXMuX21pbGxpc2Vjb25kcyk7XG4gICAgICAgIHRoaXMuX2RheXMgICAgICAgICA9IG1hdGhBYnModGhpcy5fZGF5cyk7XG4gICAgICAgIHRoaXMuX21vbnRocyAgICAgICA9IG1hdGhBYnModGhpcy5fbW9udGhzKTtcblxuICAgICAgICBkYXRhLm1pbGxpc2Vjb25kcyAgPSBtYXRoQWJzKGRhdGEubWlsbGlzZWNvbmRzKTtcbiAgICAgICAgZGF0YS5zZWNvbmRzICAgICAgID0gbWF0aEFicyhkYXRhLnNlY29uZHMpO1xuICAgICAgICBkYXRhLm1pbnV0ZXMgICAgICAgPSBtYXRoQWJzKGRhdGEubWludXRlcyk7XG4gICAgICAgIGRhdGEuaG91cnMgICAgICAgICA9IG1hdGhBYnMoZGF0YS5ob3Vycyk7XG4gICAgICAgIGRhdGEubW9udGhzICAgICAgICA9IG1hdGhBYnMoZGF0YS5tb250aHMpO1xuICAgICAgICBkYXRhLnllYXJzICAgICAgICAgPSBtYXRoQWJzKGRhdGEueWVhcnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGR1cmF0aW9uX2FkZF9zdWJ0cmFjdF9fYWRkU3VidHJhY3QgKGR1cmF0aW9uLCBpbnB1dCwgdmFsdWUsIGRpcmVjdGlvbikge1xuICAgICAgICB2YXIgb3RoZXIgPSBjcmVhdGVfX2NyZWF0ZUR1cmF0aW9uKGlucHV0LCB2YWx1ZSk7XG5cbiAgICAgICAgZHVyYXRpb24uX21pbGxpc2Vjb25kcyArPSBkaXJlY3Rpb24gKiBvdGhlci5fbWlsbGlzZWNvbmRzO1xuICAgICAgICBkdXJhdGlvbi5fZGF5cyAgICAgICAgICs9IGRpcmVjdGlvbiAqIG90aGVyLl9kYXlzO1xuICAgICAgICBkdXJhdGlvbi5fbW9udGhzICAgICAgICs9IGRpcmVjdGlvbiAqIG90aGVyLl9tb250aHM7XG5cbiAgICAgICAgcmV0dXJuIGR1cmF0aW9uLl9idWJibGUoKTtcbiAgICB9XG5cbiAgICAvLyBzdXBwb3J0cyBvbmx5IDIuMC1zdHlsZSBhZGQoMSwgJ3MnKSBvciBhZGQoZHVyYXRpb24pXG4gICAgZnVuY3Rpb24gZHVyYXRpb25fYWRkX3N1YnRyYWN0X19hZGQgKGlucHV0LCB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZHVyYXRpb25fYWRkX3N1YnRyYWN0X19hZGRTdWJ0cmFjdCh0aGlzLCBpbnB1dCwgdmFsdWUsIDEpO1xuICAgIH1cblxuICAgIC8vIHN1cHBvcnRzIG9ubHkgMi4wLXN0eWxlIHN1YnRyYWN0KDEsICdzJykgb3Igc3VidHJhY3QoZHVyYXRpb24pXG4gICAgZnVuY3Rpb24gZHVyYXRpb25fYWRkX3N1YnRyYWN0X19zdWJ0cmFjdCAoaW5wdXQsIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBkdXJhdGlvbl9hZGRfc3VidHJhY3RfX2FkZFN1YnRyYWN0KHRoaXMsIGlucHV0LCB2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFic0NlaWwgKG51bWJlcikge1xuICAgICAgICBpZiAobnVtYmVyIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobnVtYmVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtYmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJ1YmJsZSAoKSB7XG4gICAgICAgIHZhciBtaWxsaXNlY29uZHMgPSB0aGlzLl9taWxsaXNlY29uZHM7XG4gICAgICAgIHZhciBkYXlzICAgICAgICAgPSB0aGlzLl9kYXlzO1xuICAgICAgICB2YXIgbW9udGhzICAgICAgID0gdGhpcy5fbW9udGhzO1xuICAgICAgICB2YXIgZGF0YSAgICAgICAgID0gdGhpcy5fZGF0YTtcbiAgICAgICAgdmFyIHNlY29uZHMsIG1pbnV0ZXMsIGhvdXJzLCB5ZWFycywgbW9udGhzRnJvbURheXM7XG5cbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIG1peCBvZiBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzLCBidWJibGUgZG93biBmaXJzdFxuICAgICAgICAvLyBjaGVjazogaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzIxNjZcbiAgICAgICAgaWYgKCEoKG1pbGxpc2Vjb25kcyA+PSAwICYmIGRheXMgPj0gMCAmJiBtb250aHMgPj0gMCkgfHxcbiAgICAgICAgICAgICAgICAobWlsbGlzZWNvbmRzIDw9IDAgJiYgZGF5cyA8PSAwICYmIG1vbnRocyA8PSAwKSkpIHtcbiAgICAgICAgICAgIG1pbGxpc2Vjb25kcyArPSBhYnNDZWlsKG1vbnRoc1RvRGF5cyhtb250aHMpICsgZGF5cykgKiA4NjRlNTtcbiAgICAgICAgICAgIGRheXMgPSAwO1xuICAgICAgICAgICAgbW9udGhzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBidWJibGVzIHVwIHZhbHVlcywgc2VlIHRoZSB0ZXN0cyBmb3JcbiAgICAgICAgLy8gZXhhbXBsZXMgb2Ygd2hhdCB0aGF0IG1lYW5zLlxuICAgICAgICBkYXRhLm1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kcyAlIDEwMDA7XG5cbiAgICAgICAgc2Vjb25kcyAgICAgICAgICAgPSBhYnNGbG9vcihtaWxsaXNlY29uZHMgLyAxMDAwKTtcbiAgICAgICAgZGF0YS5zZWNvbmRzICAgICAgPSBzZWNvbmRzICUgNjA7XG5cbiAgICAgICAgbWludXRlcyAgICAgICAgICAgPSBhYnNGbG9vcihzZWNvbmRzIC8gNjApO1xuICAgICAgICBkYXRhLm1pbnV0ZXMgICAgICA9IG1pbnV0ZXMgJSA2MDtcblxuICAgICAgICBob3VycyAgICAgICAgICAgICA9IGFic0Zsb29yKG1pbnV0ZXMgLyA2MCk7XG4gICAgICAgIGRhdGEuaG91cnMgICAgICAgID0gaG91cnMgJSAyNDtcblxuICAgICAgICBkYXlzICs9IGFic0Zsb29yKGhvdXJzIC8gMjQpO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgZGF5cyB0byBtb250aHNcbiAgICAgICAgbW9udGhzRnJvbURheXMgPSBhYnNGbG9vcihkYXlzVG9Nb250aHMoZGF5cykpO1xuICAgICAgICBtb250aHMgKz0gbW9udGhzRnJvbURheXM7XG4gICAgICAgIGRheXMgLT0gYWJzQ2VpbChtb250aHNUb0RheXMobW9udGhzRnJvbURheXMpKTtcblxuICAgICAgICAvLyAxMiBtb250aHMgLT4gMSB5ZWFyXG4gICAgICAgIHllYXJzID0gYWJzRmxvb3IobW9udGhzIC8gMTIpO1xuICAgICAgICBtb250aHMgJT0gMTI7XG5cbiAgICAgICAgZGF0YS5kYXlzICAgPSBkYXlzO1xuICAgICAgICBkYXRhLm1vbnRocyA9IG1vbnRocztcbiAgICAgICAgZGF0YS55ZWFycyAgPSB5ZWFycztcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlzVG9Nb250aHMgKGRheXMpIHtcbiAgICAgICAgLy8gNDAwIHllYXJzIGhhdmUgMTQ2MDk3IGRheXMgKHRha2luZyBpbnRvIGFjY291bnQgbGVhcCB5ZWFyIHJ1bGVzKVxuICAgICAgICAvLyA0MDAgeWVhcnMgaGF2ZSAxMiBtb250aHMgPT09IDQ4MDBcbiAgICAgICAgcmV0dXJuIGRheXMgKiA0ODAwIC8gMTQ2MDk3O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vbnRoc1RvRGF5cyAobW9udGhzKSB7XG4gICAgICAgIC8vIHRoZSByZXZlcnNlIG9mIGRheXNUb01vbnRoc1xuICAgICAgICByZXR1cm4gbW9udGhzICogMTQ2MDk3IC8gNDgwMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcyAodW5pdHMpIHtcbiAgICAgICAgdmFyIGRheXM7XG4gICAgICAgIHZhciBtb250aHM7XG4gICAgICAgIHZhciBtaWxsaXNlY29uZHMgPSB0aGlzLl9taWxsaXNlY29uZHM7XG5cbiAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG5cbiAgICAgICAgaWYgKHVuaXRzID09PSAnbW9udGgnIHx8IHVuaXRzID09PSAneWVhcicpIHtcbiAgICAgICAgICAgIGRheXMgICA9IHRoaXMuX2RheXMgICArIG1pbGxpc2Vjb25kcyAvIDg2NGU1O1xuICAgICAgICAgICAgbW9udGhzID0gdGhpcy5fbW9udGhzICsgZGF5c1RvTW9udGhzKGRheXMpO1xuICAgICAgICAgICAgcmV0dXJuIHVuaXRzID09PSAnbW9udGgnID8gbW9udGhzIDogbW9udGhzIC8gMTI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBoYW5kbGUgbWlsbGlzZWNvbmRzIHNlcGFyYXRlbHkgYmVjYXVzZSBvZiBmbG9hdGluZyBwb2ludCBtYXRoIGVycm9ycyAoaXNzdWUgIzE4NjcpXG4gICAgICAgICAgICBkYXlzID0gdGhpcy5fZGF5cyArIE1hdGgucm91bmQobW9udGhzVG9EYXlzKHRoaXMuX21vbnRocykpO1xuICAgICAgICAgICAgc3dpdGNoICh1bml0cykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3dlZWsnICAgOiByZXR1cm4gZGF5cyAvIDcgICAgICsgbWlsbGlzZWNvbmRzIC8gNjA0OGU1O1xuICAgICAgICAgICAgICAgIGNhc2UgJ2RheScgICAgOiByZXR1cm4gZGF5cyAgICAgICAgICsgbWlsbGlzZWNvbmRzIC8gODY0ZTU7XG4gICAgICAgICAgICAgICAgY2FzZSAnaG91cicgICA6IHJldHVybiBkYXlzICogMjQgICAgKyBtaWxsaXNlY29uZHMgLyAzNmU1O1xuICAgICAgICAgICAgICAgIGNhc2UgJ21pbnV0ZScgOiByZXR1cm4gZGF5cyAqIDE0NDAgICsgbWlsbGlzZWNvbmRzIC8gNmU0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NlY29uZCcgOiByZXR1cm4gZGF5cyAqIDg2NDAwICsgbWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgICAgICAgICAgICAvLyBNYXRoLmZsb29yIHByZXZlbnRzIGZsb2F0aW5nIHBvaW50IG1hdGggZXJyb3JzIGhlcmVcbiAgICAgICAgICAgICAgICBjYXNlICdtaWxsaXNlY29uZCc6IHJldHVybiBNYXRoLmZsb29yKGRheXMgKiA4NjRlNSkgKyBtaWxsaXNlY29uZHM7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHVuaXQgJyArIHVuaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE86IFVzZSB0aGlzLmFzKCdtcycpP1xuICAgIGZ1bmN0aW9uIGR1cmF0aW9uX2FzX192YWx1ZU9mICgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyArXG4gICAgICAgICAgICB0aGlzLl9kYXlzICogODY0ZTUgK1xuICAgICAgICAgICAgKHRoaXMuX21vbnRocyAlIDEyKSAqIDI1OTJlNiArXG4gICAgICAgICAgICB0b0ludCh0aGlzLl9tb250aHMgLyAxMikgKiAzMTUzNmU2XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUFzIChhbGlhcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXMoYWxpYXMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHZhciBhc01pbGxpc2Vjb25kcyA9IG1ha2VBcygnbXMnKTtcbiAgICB2YXIgYXNTZWNvbmRzICAgICAgPSBtYWtlQXMoJ3MnKTtcbiAgICB2YXIgYXNNaW51dGVzICAgICAgPSBtYWtlQXMoJ20nKTtcbiAgICB2YXIgYXNIb3VycyAgICAgICAgPSBtYWtlQXMoJ2gnKTtcbiAgICB2YXIgYXNEYXlzICAgICAgICAgPSBtYWtlQXMoJ2QnKTtcbiAgICB2YXIgYXNXZWVrcyAgICAgICAgPSBtYWtlQXMoJ3cnKTtcbiAgICB2YXIgYXNNb250aHMgICAgICAgPSBtYWtlQXMoJ00nKTtcbiAgICB2YXIgYXNZZWFycyAgICAgICAgPSBtYWtlQXMoJ3knKTtcblxuICAgIGZ1bmN0aW9uIGR1cmF0aW9uX2dldF9fZ2V0ICh1bml0cykge1xuICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHMgKyAncyddKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUdldHRlcihuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtuYW1lXTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbWlsbGlzZWNvbmRzID0gbWFrZUdldHRlcignbWlsbGlzZWNvbmRzJyk7XG4gICAgdmFyIHNlY29uZHMgICAgICA9IG1ha2VHZXR0ZXIoJ3NlY29uZHMnKTtcbiAgICB2YXIgbWludXRlcyAgICAgID0gbWFrZUdldHRlcignbWludXRlcycpO1xuICAgIHZhciBob3VycyAgICAgICAgPSBtYWtlR2V0dGVyKCdob3VycycpO1xuICAgIHZhciBkYXlzICAgICAgICAgPSBtYWtlR2V0dGVyKCdkYXlzJyk7XG4gICAgdmFyIG1vbnRocyAgICAgICA9IG1ha2VHZXR0ZXIoJ21vbnRocycpO1xuICAgIHZhciB5ZWFycyAgICAgICAgPSBtYWtlR2V0dGVyKCd5ZWFycycpO1xuXG4gICAgZnVuY3Rpb24gd2Vla3MgKCkge1xuICAgICAgICByZXR1cm4gYWJzRmxvb3IodGhpcy5kYXlzKCkgLyA3KTtcbiAgICB9XG5cbiAgICB2YXIgcm91bmQgPSBNYXRoLnJvdW5kO1xuICAgIHZhciB0aHJlc2hvbGRzID0ge1xuICAgICAgICBzOiA0NSwgIC8vIHNlY29uZHMgdG8gbWludXRlXG4gICAgICAgIG06IDQ1LCAgLy8gbWludXRlcyB0byBob3VyXG4gICAgICAgIGg6IDIyLCAgLy8gaG91cnMgdG8gZGF5XG4gICAgICAgIGQ6IDI2LCAgLy8gZGF5cyB0byBtb250aFxuICAgICAgICBNOiAxMSAgIC8vIG1vbnRocyB0byB5ZWFyXG4gICAgfTtcblxuICAgIC8vIGhlbHBlciBmdW5jdGlvbiBmb3IgbW9tZW50LmZuLmZyb20sIG1vbWVudC5mbi5mcm9tTm93LCBhbmQgbW9tZW50LmR1cmF0aW9uLmZuLmh1bWFuaXplXG4gICAgZnVuY3Rpb24gc3Vic3RpdHV0ZVRpbWVBZ28oc3RyaW5nLCBudW1iZXIsIHdpdGhvdXRTdWZmaXgsIGlzRnV0dXJlLCBsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsZS5yZWxhdGl2ZVRpbWUobnVtYmVyIHx8IDEsICEhd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHVyYXRpb25faHVtYW5pemVfX3JlbGF0aXZlVGltZSAocG9zTmVnRHVyYXRpb24sIHdpdGhvdXRTdWZmaXgsIGxvY2FsZSkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBjcmVhdGVfX2NyZWF0ZUR1cmF0aW9uKHBvc05lZ0R1cmF0aW9uKS5hYnMoKTtcbiAgICAgICAgdmFyIHNlY29uZHMgID0gcm91bmQoZHVyYXRpb24uYXMoJ3MnKSk7XG4gICAgICAgIHZhciBtaW51dGVzICA9IHJvdW5kKGR1cmF0aW9uLmFzKCdtJykpO1xuICAgICAgICB2YXIgaG91cnMgICAgPSByb3VuZChkdXJhdGlvbi5hcygnaCcpKTtcbiAgICAgICAgdmFyIGRheXMgICAgID0gcm91bmQoZHVyYXRpb24uYXMoJ2QnKSk7XG4gICAgICAgIHZhciBtb250aHMgICA9IHJvdW5kKGR1cmF0aW9uLmFzKCdNJykpO1xuICAgICAgICB2YXIgeWVhcnMgICAgPSByb3VuZChkdXJhdGlvbi5hcygneScpKTtcblxuICAgICAgICB2YXIgYSA9IHNlY29uZHMgPCB0aHJlc2hvbGRzLnMgJiYgWydzJywgc2Vjb25kc10gIHx8XG4gICAgICAgICAgICAgICAgbWludXRlcyA9PT0gMSAgICAgICAgICAmJiBbJ20nXSAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBtaW51dGVzIDwgdGhyZXNob2xkcy5tICYmIFsnbW0nLCBtaW51dGVzXSB8fFxuICAgICAgICAgICAgICAgIGhvdXJzICAgPT09IDEgICAgICAgICAgJiYgWydoJ10gICAgICAgICAgIHx8XG4gICAgICAgICAgICAgICAgaG91cnMgICA8IHRocmVzaG9sZHMuaCAmJiBbJ2hoJywgaG91cnNdICAgfHxcbiAgICAgICAgICAgICAgICBkYXlzICAgID09PSAxICAgICAgICAgICYmIFsnZCddICAgICAgICAgICB8fFxuICAgICAgICAgICAgICAgIGRheXMgICAgPCB0aHJlc2hvbGRzLmQgJiYgWydkZCcsIGRheXNdICAgIHx8XG4gICAgICAgICAgICAgICAgbW9udGhzICA9PT0gMSAgICAgICAgICAmJiBbJ00nXSAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICBtb250aHMgIDwgdGhyZXNob2xkcy5NICYmIFsnTU0nLCBtb250aHNdICB8fFxuICAgICAgICAgICAgICAgIHllYXJzICAgPT09IDEgICAgICAgICAgJiYgWyd5J10gICAgICAgICAgIHx8IFsneXknLCB5ZWFyc107XG5cbiAgICAgICAgYVsyXSA9IHdpdGhvdXRTdWZmaXg7XG4gICAgICAgIGFbM10gPSArcG9zTmVnRHVyYXRpb24gPiAwO1xuICAgICAgICBhWzRdID0gbG9jYWxlO1xuICAgICAgICByZXR1cm4gc3Vic3RpdHV0ZVRpbWVBZ28uYXBwbHkobnVsbCwgYSk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBhbGxvd3MgeW91IHRvIHNldCBhIHRocmVzaG9sZCBmb3IgcmVsYXRpdmUgdGltZSBzdHJpbmdzXG4gICAgZnVuY3Rpb24gZHVyYXRpb25faHVtYW5pemVfX2dldFNldFJlbGF0aXZlVGltZVRocmVzaG9sZCAodGhyZXNob2xkLCBsaW1pdCkge1xuICAgICAgICBpZiAodGhyZXNob2xkc1t0aHJlc2hvbGRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGltaXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRocmVzaG9sZHNbdGhyZXNob2xkXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJlc2hvbGRzW3RocmVzaG9sZF0gPSBsaW1pdDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHVtYW5pemUgKHdpdGhTdWZmaXgpIHtcbiAgICAgICAgdmFyIGxvY2FsZSA9IHRoaXMubG9jYWxlRGF0YSgpO1xuICAgICAgICB2YXIgb3V0cHV0ID0gZHVyYXRpb25faHVtYW5pemVfX3JlbGF0aXZlVGltZSh0aGlzLCAhd2l0aFN1ZmZpeCwgbG9jYWxlKTtcblxuICAgICAgICBpZiAod2l0aFN1ZmZpeCkge1xuICAgICAgICAgICAgb3V0cHV0ID0gbG9jYWxlLnBhc3RGdXR1cmUoK3RoaXMsIG91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbG9jYWxlLnBvc3Rmb3JtYXQob3V0cHV0KTtcbiAgICB9XG5cbiAgICB2YXIgaXNvX3N0cmluZ19fYWJzID0gTWF0aC5hYnM7XG5cbiAgICBmdW5jdGlvbiBpc29fc3RyaW5nX190b0lTT1N0cmluZygpIHtcbiAgICAgICAgLy8gZm9yIElTTyBzdHJpbmdzIHdlIGRvIG5vdCB1c2UgdGhlIG5vcm1hbCBidWJibGluZyBydWxlczpcbiAgICAgICAgLy8gICogbWlsbGlzZWNvbmRzIGJ1YmJsZSB1cCB1bnRpbCB0aGV5IGJlY29tZSBob3Vyc1xuICAgICAgICAvLyAgKiBkYXlzIGRvIG5vdCBidWJibGUgYXQgYWxsXG4gICAgICAgIC8vICAqIG1vbnRocyBidWJibGUgdXAgdW50aWwgdGhleSBiZWNvbWUgeWVhcnNcbiAgICAgICAgLy8gVGhpcyBpcyBiZWNhdXNlIHRoZXJlIGlzIG5vIGNvbnRleHQtZnJlZSBjb252ZXJzaW9uIGJldHdlZW4gaG91cnMgYW5kIGRheXNcbiAgICAgICAgLy8gKHRoaW5rIG9mIGNsb2NrIGNoYW5nZXMpXG4gICAgICAgIC8vIGFuZCBhbHNvIG5vdCBiZXR3ZWVuIGRheXMgYW5kIG1vbnRocyAoMjgtMzEgZGF5cyBwZXIgbW9udGgpXG4gICAgICAgIHZhciBzZWNvbmRzID0gaXNvX3N0cmluZ19fYWJzKHRoaXMuX21pbGxpc2Vjb25kcykgLyAxMDAwO1xuICAgICAgICB2YXIgZGF5cyAgICAgICAgID0gaXNvX3N0cmluZ19fYWJzKHRoaXMuX2RheXMpO1xuICAgICAgICB2YXIgbW9udGhzICAgICAgID0gaXNvX3N0cmluZ19fYWJzKHRoaXMuX21vbnRocyk7XG4gICAgICAgIHZhciBtaW51dGVzLCBob3VycywgeWVhcnM7XG5cbiAgICAgICAgLy8gMzYwMCBzZWNvbmRzIC0+IDYwIG1pbnV0ZXMgLT4gMSBob3VyXG4gICAgICAgIG1pbnV0ZXMgICAgICAgICAgID0gYWJzRmxvb3Ioc2Vjb25kcyAvIDYwKTtcbiAgICAgICAgaG91cnMgICAgICAgICAgICAgPSBhYnNGbG9vcihtaW51dGVzIC8gNjApO1xuICAgICAgICBzZWNvbmRzICU9IDYwO1xuICAgICAgICBtaW51dGVzICU9IDYwO1xuXG4gICAgICAgIC8vIDEyIG1vbnRocyAtPiAxIHllYXJcbiAgICAgICAgeWVhcnMgID0gYWJzRmxvb3IobW9udGhzIC8gMTIpO1xuICAgICAgICBtb250aHMgJT0gMTI7XG5cblxuICAgICAgICAvLyBpbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vZG9yZGlsbGUvbW9tZW50LWlzb2R1cmF0aW9uL2Jsb2IvbWFzdGVyL21vbWVudC5pc29kdXJhdGlvbi5qc1xuICAgICAgICB2YXIgWSA9IHllYXJzO1xuICAgICAgICB2YXIgTSA9IG1vbnRocztcbiAgICAgICAgdmFyIEQgPSBkYXlzO1xuICAgICAgICB2YXIgaCA9IGhvdXJzO1xuICAgICAgICB2YXIgbSA9IG1pbnV0ZXM7XG4gICAgICAgIHZhciBzID0gc2Vjb25kcztcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5hc1NlY29uZHMoKTtcblxuICAgICAgICBpZiAoIXRvdGFsKSB7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIHRoZSBzYW1lIGFzIEMjJ3MgKE5vZGEpIGFuZCBweXRob24gKGlzb2RhdGUpLi4uXG4gICAgICAgICAgICAvLyBidXQgbm90IG90aGVyIEpTIChnb29nLmRhdGUpXG4gICAgICAgICAgICByZXR1cm4gJ1AwRCc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKHRvdGFsIDwgMCA/ICctJyA6ICcnKSArXG4gICAgICAgICAgICAnUCcgK1xuICAgICAgICAgICAgKFkgPyBZICsgJ1knIDogJycpICtcbiAgICAgICAgICAgIChNID8gTSArICdNJyA6ICcnKSArXG4gICAgICAgICAgICAoRCA/IEQgKyAnRCcgOiAnJykgK1xuICAgICAgICAgICAgKChoIHx8IG0gfHwgcykgPyAnVCcgOiAnJykgK1xuICAgICAgICAgICAgKGggPyBoICsgJ0gnIDogJycpICtcbiAgICAgICAgICAgIChtID8gbSArICdNJyA6ICcnKSArXG4gICAgICAgICAgICAocyA/IHMgKyAnUycgOiAnJyk7XG4gICAgfVxuXG4gICAgdmFyIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8gPSBEdXJhdGlvbi5wcm90b3R5cGU7XG5cbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLmFicyAgICAgICAgICAgID0gZHVyYXRpb25fYWJzX19hYnM7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5hZGQgICAgICAgICAgICA9IGR1cmF0aW9uX2FkZF9zdWJ0cmFjdF9fYWRkO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uc3VidHJhY3QgICAgICAgPSBkdXJhdGlvbl9hZGRfc3VidHJhY3RfX3N1YnRyYWN0O1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uYXMgICAgICAgICAgICAgPSBhcztcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLmFzTWlsbGlzZWNvbmRzID0gYXNNaWxsaXNlY29uZHM7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5hc1NlY29uZHMgICAgICA9IGFzU2Vjb25kcztcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLmFzTWludXRlcyAgICAgID0gYXNNaW51dGVzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uYXNIb3VycyAgICAgICAgPSBhc0hvdXJzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uYXNEYXlzICAgICAgICAgPSBhc0RheXM7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5hc1dlZWtzICAgICAgICA9IGFzV2Vla3M7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5hc01vbnRocyAgICAgICA9IGFzTW9udGhzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uYXNZZWFycyAgICAgICAgPSBhc1llYXJzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8udmFsdWVPZiAgICAgICAgPSBkdXJhdGlvbl9hc19fdmFsdWVPZjtcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLl9idWJibGUgICAgICAgID0gYnViYmxlO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uZ2V0ICAgICAgICAgICAgPSBkdXJhdGlvbl9nZXRfX2dldDtcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLm1pbGxpc2Vjb25kcyAgID0gbWlsbGlzZWNvbmRzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uc2Vjb25kcyAgICAgICAgPSBzZWNvbmRzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8ubWludXRlcyAgICAgICAgPSBtaW51dGVzO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8uaG91cnMgICAgICAgICAgPSBob3VycztcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLmRheXMgICAgICAgICAgID0gZGF5cztcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLndlZWtzICAgICAgICAgID0gd2Vla3M7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5tb250aHMgICAgICAgICA9IG1vbnRocztcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLnllYXJzICAgICAgICAgID0geWVhcnM7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5odW1hbml6ZSAgICAgICA9IGh1bWFuaXplO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8udG9JU09TdHJpbmcgICAgPSBpc29fc3RyaW5nX190b0lTT1N0cmluZztcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLnRvU3RyaW5nICAgICAgID0gaXNvX3N0cmluZ19fdG9JU09TdHJpbmc7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by50b0pTT04gICAgICAgICA9IGlzb19zdHJpbmdfX3RvSVNPU3RyaW5nO1xuICAgIGR1cmF0aW9uX3Byb3RvdHlwZV9fcHJvdG8ubG9jYWxlICAgICAgICAgPSBsb2NhbGU7XG4gICAgZHVyYXRpb25fcHJvdG90eXBlX19wcm90by5sb2NhbGVEYXRhICAgICA9IGxvY2FsZURhdGE7XG5cbiAgICAvLyBEZXByZWNhdGlvbnNcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLnRvSXNvU3RyaW5nID0gZGVwcmVjYXRlKCd0b0lzb1N0cmluZygpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgdG9JU09TdHJpbmcoKSBpbnN0ZWFkIChub3RpY2UgdGhlIGNhcGl0YWxzKScsIGlzb19zdHJpbmdfX3RvSVNPU3RyaW5nKTtcbiAgICBkdXJhdGlvbl9wcm90b3R5cGVfX3Byb3RvLmxhbmcgPSBsYW5nO1xuXG4gICAgLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xuXG4gICAgYWRkRm9ybWF0VG9rZW4oJ1gnLCAwLCAwLCAndW5peCcpO1xuICAgIGFkZEZvcm1hdFRva2VuKCd4JywgMCwgMCwgJ3ZhbHVlT2YnKTtcblxuICAgIC8vIFBBUlNJTkdcblxuICAgIGFkZFJlZ2V4VG9rZW4oJ3gnLCBtYXRjaFNpZ25lZCk7XG4gICAgYWRkUmVnZXhUb2tlbignWCcsIG1hdGNoVGltZXN0YW1wKTtcbiAgICBhZGRQYXJzZVRva2VuKCdYJywgZnVuY3Rpb24gKGlucHV0LCBhcnJheSwgY29uZmlnKSB7XG4gICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKHBhcnNlRmxvYXQoaW5wdXQsIDEwKSAqIDEwMDApO1xuICAgIH0pO1xuICAgIGFkZFBhcnNlVG9rZW4oJ3gnLCBmdW5jdGlvbiAoaW5wdXQsIGFycmF5LCBjb25maWcpIHtcbiAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUodG9JbnQoaW5wdXQpKTtcbiAgICB9KTtcblxuICAgIC8vIFNpZGUgZWZmZWN0IGltcG9ydHNcblxuXG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLnZlcnNpb24gPSAnMi4xMC42JztcblxuICAgIHNldEhvb2tDYWxsYmFjayhsb2NhbF9fY3JlYXRlTG9jYWwpO1xuXG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLmZuICAgICAgICAgICAgICAgICAgICA9IG1vbWVudFByb3RvdHlwZTtcbiAgICB1dGlsc19ob29rc19faG9va3MubWluICAgICAgICAgICAgICAgICAgID0gbWluO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5tYXggICAgICAgICAgICAgICAgICAgPSBtYXg7XG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLnV0YyAgICAgICAgICAgICAgICAgICA9IGNyZWF0ZV91dGNfX2NyZWF0ZVVUQztcbiAgICB1dGlsc19ob29rc19faG9va3MudW5peCAgICAgICAgICAgICAgICAgID0gbW9tZW50X19jcmVhdGVVbml4O1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5tb250aHMgICAgICAgICAgICAgICAgPSBsaXN0c19fbGlzdE1vbnRocztcbiAgICB1dGlsc19ob29rc19faG9va3MuaXNEYXRlICAgICAgICAgICAgICAgID0gaXNEYXRlO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5sb2NhbGUgICAgICAgICAgICAgICAgPSBsb2NhbGVfbG9jYWxlc19fZ2V0U2V0R2xvYmFsTG9jYWxlO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5pbnZhbGlkICAgICAgICAgICAgICAgPSB2YWxpZF9fY3JlYXRlSW52YWxpZDtcbiAgICB1dGlsc19ob29rc19faG9va3MuZHVyYXRpb24gICAgICAgICAgICAgID0gY3JlYXRlX19jcmVhdGVEdXJhdGlvbjtcbiAgICB1dGlsc19ob29rc19faG9va3MuaXNNb21lbnQgICAgICAgICAgICAgID0gaXNNb21lbnQ7XG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLndlZWtkYXlzICAgICAgICAgICAgICA9IGxpc3RzX19saXN0V2Vla2RheXM7XG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLnBhcnNlWm9uZSAgICAgICAgICAgICA9IG1vbWVudF9fY3JlYXRlSW5ab25lO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5sb2NhbGVEYXRhICAgICAgICAgICAgPSBsb2NhbGVfbG9jYWxlc19fZ2V0TG9jYWxlO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5pc0R1cmF0aW9uICAgICAgICAgICAgPSBpc0R1cmF0aW9uO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5tb250aHNTaG9ydCAgICAgICAgICAgPSBsaXN0c19fbGlzdE1vbnRoc1Nob3J0O1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy53ZWVrZGF5c01pbiAgICAgICAgICAgPSBsaXN0c19fbGlzdFdlZWtkYXlzTWluO1xuICAgIHV0aWxzX2hvb2tzX19ob29rcy5kZWZpbmVMb2NhbGUgICAgICAgICAgPSBkZWZpbmVMb2NhbGU7XG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLndlZWtkYXlzU2hvcnQgICAgICAgICA9IGxpc3RzX19saXN0V2Vla2RheXNTaG9ydDtcbiAgICB1dGlsc19ob29rc19faG9va3Mubm9ybWFsaXplVW5pdHMgICAgICAgID0gbm9ybWFsaXplVW5pdHM7XG4gICAgdXRpbHNfaG9va3NfX2hvb2tzLnJlbGF0aXZlVGltZVRocmVzaG9sZCA9IGR1cmF0aW9uX2h1bWFuaXplX19nZXRTZXRSZWxhdGl2ZVRpbWVUaHJlc2hvbGQ7XG5cbiAgICB2YXIgX21vbWVudCA9IHV0aWxzX2hvb2tzX19ob29rcztcblxuICAgIHJldHVybiBfbW9tZW50O1xuXG59KSk7IiwiKGZ1bmN0aW9uKCl7XG5cblx0dmFyIGxvY2FsZm9yYWdlID0gcmVxdWlyZShcImxvY2FsZm9yYWdlXCIpLFxuXHRcdG1vbWVudCA9IHJlcXVpcmUoXCJtb21lbnRcIik7XG5cblx0dmFyIGNhdGVnb3JpYXNRdWVTaWdvLFxuXHRcdGhvcmFVbHRpbWFOb3RpZmljYWNhbztcblxuXHR2YXIgaW5pdCA9IGZ1bmN0aW9uKClcblx0e1xuXHRcdGxvY2FsZm9yYWdlLmdldEl0ZW0oXCJjYXRlZ29yaWFzUXVlU2lnb1wiLCBmdW5jdGlvbih2YWx1ZUMpIHtcbiAgICAgICAgICAgIGNhdGVnb3JpYXNRdWVTaWdvID0gdmFsdWVDIHx8IFtdO1xuXG4gICAgICAgICAgICBsb2NhbGZvcmFnZS5nZXRJdGVtKFwiaG9yYVVsdGltYU5vdGlmaWNhY2FvXCIsIGZ1bmN0aW9uKHZhbHVlSCl7XG4gICAgICAgICAgICBcdGhvcmFVbHRpbWFOb3RpZmljYWNhbyA9IHZhbHVlSDtcbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxuXG5cdFx0XHRpZiAoaG9yYVVsdGltYU5vdGlmaWNhY2FvKSB7XG5cdFx0XHRcdGhvcmFVbHRpbWFOb3RpZmljYWNhbyA9IG1vbWVudChob3JhVWx0aW1hTm90aWZpY2FjYW8pO1xuXHRcdFx0fVxuXG5cdFx0XHRpbml0TG9vcCgpO1xuICAgICAgICB9KTtcblx0fTtcblxuXHR2YXIgY2hlY2tOZXdQb3N0cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGltcG9ydFNjcmlwdHMoJ2h0dHBzOi8vbWVsYW5rZS10ZXN0LmJsb2dzcG90LmNvbS5ici9mZWVkcy9wb3N0cy9kZWZhdWx0Lz9hbHQ9anNvbiZtYXgtcmVzdWx0cz0xMCZjYWxsYmFjaz1jYicpO1xuXHR9O1xuXG5cdHNlbGYuY2IgPSBmdW5jdGlvbihkYXRhKXtcblx0ICAgIFxuXHRcdGZvciAodmFyIGkgaW4gZGF0YS5mZWVkLmVudHJ5KSB7XG5cdFx0XHR2YXIgcG9zdCA9IGRhdGEuZmVlZC5lbnRyeVtpXTtcdFxuXG5cdFx0XHRpZiAoIWhvcmFVbHRpbWFOb3RpZmljYWNhbyB8fCBob3JhVWx0aW1hTm90aWZpY2FjYW8uaXNCZWZvcmUocG9zdC5wdWJsaXNoZWQuJHQpKSB7XG5cblx0XHRcdFx0Zm9yICh2YXIgaiBpbiBwb3N0LmNhdGVnb3J5KSB7XG5cdFx0XHRcdFx0dmFyIGNhdGVnb3J5ID0gcG9zdC5jYXRlZ29yeVtqXTtcblxuXHRcdFx0XHRcdGlmIChjYXRlZ29yaWFzUXVlU2lnby5pbmRleE9mKGNhdGVnb3J5LnRlcm0pID4gLTEpIHtcblx0XHRcdFx0XHRcdGV4aXN0ZU5vdmEocG9zdCwgY2F0ZWdvcnkudGVybSk7XG5cdFx0XHRcdFx0XHRicmVhazsgLy91bWEgbm90aWZpY2HDp8OjbyBwb3IgdmV6XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cblx0fTtcblxuXHR2YXIgZXhpc3RlTm92YSA9IGZ1bmN0aW9uKHBvc3QsIGNhdGVnb3JpYSlcblx0e1xuXHRcdGhvcmFVbHRpbWFOb3RpZmljYWNhbyA9IG1vbWVudCgpO1xuXHRcdGxvY2FsZm9yYWdlLnNldEl0ZW0oXCJob3JhVWx0aW1hTm90aWZpY2FjYW9cIiwgaG9yYVVsdGltYU5vdGlmaWNhY2FvLmZvcm1hdCgpKTtcblxuXHRcdHNob3dOb3RpZmljYXRpb24ocG9zdC50aXRsZS4kdCwgXCJOb3ZvIHBvc3QgZW0gXFxcIlwiK2NhdGVnb3JpYStcIlxcXCJcIik7XG5cdH07XG5cblx0dmFyIHNob3dOb3RpZmljYXRpb24gPSBmdW5jdGlvbih0aXR1bG8sIGRlc2NyaWNhbykge1xuXHRcdHNlbGYucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24odGl0dWxvLCB7ICBcblx0ICAgICAgYm9keTogZGVzY3JpY2FvLCAgXG5cdCAgICAgIGljb246IFwiaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS9tZWxhbmtlL3VsaWdlL21hc3Rlci9pbWdzL2xvZ28ucG5nXCJcblx0ICAgIH0pO1xuXHR9O1xuXG5cdHZhciBpbml0TG9vcCA9IGZ1bmN0aW9uKClcblx0e1xuXHRcdC8vYSBjYWRhIDUgbWludXRvc1xuXHRcdC8vc2V0SW50ZXJ2YWwoY2hlY2tOZXdQb3N0cywgNSAqIDYwICogMTAwMCk7XG5cdFx0Y2hlY2tOZXdQb3N0cygpO1xuXHR9O1xuXG5cdGluaXQoKTtcblxufSkoKTsiXX0=
