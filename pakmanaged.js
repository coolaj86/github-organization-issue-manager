var global = Function("return this;")()
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// ender:querystring as querystring
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  // Query String Utilities
  
  (typeof define === "undefined" ? function($) { $(require, exports, module) } : define)(function(require, exports, module, undefined) {
  "use strict";
  
  var QueryString = exports;
  
  function charCode(c) {
    return c.charCodeAt(0);
  }
  
  QueryString.unescape = decodeURIComponent;
  QueryString.escape = encodeURIComponent;
  
  var stringifyPrimitive = function(v) {
    switch (typeof v) {
      case 'string':
        return v;
  
      case 'boolean':
        return v ? 'true' : 'false';
  
      case 'number':
        return isFinite(v) ? v : '';
  
      default:
        return '';
    }
  };
  
  
  QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    obj = (obj === null) ? undefined : obj;
  
    switch (typeof obj) {
      case 'object':
        return Object.keys(obj).map(function(k) {
          if (Array.isArray(obj[k])) {
            return obj[k].map(function(v) {
              return QueryString.escape(stringifyPrimitive(k)) +
                     eq +
                     QueryString.escape(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return QueryString.escape(stringifyPrimitive(k)) +
                   eq +
                   QueryString.escape(stringifyPrimitive(obj[k]));
          }
        }).join(sep);
  
      default:
        if (!name) return '';
        return QueryString.escape(stringifyPrimitive(name)) + eq +
               QueryString.escape(stringifyPrimitive(obj));
    }
  };
  
  // Parse a key=val string.
  QueryString.parse = QueryString.decode = function(qs, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
  
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
  
    qs.split(sep).forEach(function(kvp) {
      var x = kvp.split(eq);
      var k = QueryString.unescape(x[0], true);
      var v = QueryString.unescape(x.slice(1).join(eq), true);
  
      if (!(k in obj)) {
        obj[k] = v;
      } else if (!Array.isArray(obj[k])) {
        obj[k] = [obj[k], v];
      } else {
        obj[k].push(v);
      }
    });
  
    return obj;
  };
  
  });
  

  provide("querystring", module.exports);
  provide("querystring", module.exports);
  $.ender(module.exports);
}(global));

// ender:future as future
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var MAX_INT = Math.pow(2,52);
  
    function isFuture(obj) {
      return obj instanceof future;
    }
  
    function futureTimeout(time) {
      this.name = "FutureTimeout";
      this.message = "timeout " + time + "ms";
    }
  
  
  
    function future(global_context, options) {
      var everytimers = {},
        onetimers = {},
        index = 0,
        deliveries = 0,
        time = 0,
        fulfilled,
        data,
        timeout_id,
        //asap = false,
        asap =  true,
        passenger,
        self = this;
  
      // TODO change `null` to `this`
      global_context = ('undefined' === typeof global_context ? null : global_context);
  
      options = options || {};
      options.error = options.error || function (err) {
        throw err;
      };
  
      function resetTimeout() {
        if (timeout_id) {
          clearTimeout(timeout_id);
          timeout_id = undefined;
        }
  
        if (time > 0) {
          timeout_id = setTimeout(function () {
            self.deliver(new futureTimeout(time));
            timeout_id = undefined;
          }, time);
        }
      }
  
  
  
      self.isFuture = isFuture;
  
      self.setContext = function (context) {
        global_context = context;
      };
  
      self.setTimeout = function (new_time) {
        time = new_time;
        resetTimeout();
      };
  
  
  
      self.errback = function () {
        if (arguments.length < 2) {
          self.deliver.call(self, arguments[0] || new Error("`errback` called without Error"));
        } else {
          self.deliver.apply(self, arguments);
        }
      };
  
  
  
      self.callback = function () {
        var args = Array.prototype.slice.call(arguments);
  
        args.unshift(undefined);
        self.deliver.apply(self, args);
      };
  
  
  
      self.callbackCount = function() {
        return Object.keys(everytimers).length;
      };
  
  
  
      self.deliveryCount = function() {
        return deliveries;
      };
  
  
  
      self.setAsap = function(new_asap) {
        if (undefined === new_asap) {
          new_asap = true;
        }
        if (true !== new_asap && false !== new_asap) {
          options.error(new Error("Future.setAsap(asap) accepts literal true or false, not " + new_asap));
          return;
        }
        asap = new_asap;
      };
  
  
  
      // this will probably never get called and, hence, is not yet well tested
      function cleanup() {
        var new_everytimers = {},
          new_onetimers = {};
  
        index = 0;
        Object.keys(everytimers).forEach(function (id) {
          var newtimer = new_everytimers[index] = everytimers[id];
  
          if (onetimers[id]) {
            new_onetimers[index] = true;
          }
  
          newtimer.id = index;
          index += 1;
        });
  
        onetimers = new_onetimers;
        everytimers = new_everytimers;
      }
  
  
  
      function findCallback(callback, context) {
        var result;
        Object.keys(everytimers).forEach(function (id) {
          var everytimer = everytimers[id];
          if (callback === everytimer.callback) {
            if (context === everytimer.context || everytimer.context === global_context) {
              result = everytimer;
            }
          }
        });
        return result;
      }
  
  
  
      self.hasCallback = function () {
        return !!findCallback.apply(self, arguments);
      };
  
  
  
      self.removeCallback = function(callback, context) {
        var everytimer = findCallback(callback, context);
        if (everytimer) {
          delete everytimers[everytimer.id];
          onetimers[everytimer.id] = undefined;
          delete onetimers[everytimer.id];
        }
  
        return self;
      };
  
  
  
      self.deliver = function() {
        if (fulfilled) {
          options.error(new Error("`Future().fulfill(err, data, ...)` renders future deliveries useless"));
          return;
        }
        var args = Array.prototype.slice.call(arguments);
        data = args;
  
        deliveries += 1; // Eventually reaches `Infinity`...
  
        Object.keys(everytimers).forEach(function (id) {
          var everytimer = everytimers[id],
            callback = everytimer.callback,
            context = everytimer.context;
  
          if (onetimers[id]) {
            delete everytimers[id];
            delete onetimers[id];
          }
  
          // TODO
          callback.apply(context, args);
          /*
          callback.apply(('undefined' !== context ? context : newme), args);
          context = newme;
          context = ('undefined' !== global_context ? global_context : context)
          context = ('undefined' !== local_context ? local_context : context)
          */
        });
  
        if (args[0] && "FutureTimeout" !== args[0].name) {
          resetTimeout();
        }
  
        return self;
      };
  
  
  
      self.fulfill = function () {
        if (arguments.length) {
          self.deliver.apply(self, arguments);
        } else {
          self.deliver();
        }
        fulfilled = true;
      };
  
  
  
      self.whenever = function (callback, local_context) {
        var id = index,
          everytimer;
  
        if ('function' !== typeof callback) {
          options.error(new Error("Future().whenever(callback, [context]): callback must be a function."));
          return;
        }
  
        if (findCallback(callback, local_context)) {
          // TODO log
          options.error(new Error("Future().everytimers is a strict set. Cannot add already subscribed `callback, [context]`."));
          return;
        }
  
        everytimer = everytimers[id] = {
          id: id,
          callback: callback,
          context: (null === local_context) ? null : (local_context || global_context)
        };
  
        if (asap && deliveries > 0) {
          // doesn't raise deliver count on purpose
          everytimer.callback.apply(everytimer.context, data);
          if (onetimers[id]) {
            delete onetimers[id];
            delete everytimers[id];
          }
        }
  
        index += 1;
        if (index >= MAX_INT) {
          cleanup(); // Works even for long-running processes
        }
  
        return self;
      };
  
  
  
      self.when = function (callback, local_context) {
        // this index will be the id of the everytimer
        onetimers[index] = true;
        self.whenever(callback, local_context);
  
        return self;
      };
  
  
      //
      function privatize(obj, pubs) {
        var result = {};
        pubs.forEach(function (pub) {
          result[pub] = function () {
            obj[pub].apply(obj, arguments);
            return result;
          };
        });
        return result;
      }
  
      passenger = privatize(self, [
        "when",
        "whenever"
      ]);
  
      self.passable = function () {
        return passenger;
      };
  
    }
  
    function Future(context, options) {
      // TODO use prototype instead of new
      return (new future(context, options));
    }
  
    Future.isFuture = isFuture;
    module.exports = Future;
  }());
  

  provide("future", module.exports);
  provide("future", module.exports);
  $.ender(module.exports);
}(global));

// ender:sequence as sequence
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    function isSequence(obj) {
      return obj instanceof sequence;
    }
  
    function sequence(global_context) {
      var self = this,
        waiting = true,
        data,
        stack = [];
  
      global_context = global_context || null;
  
      function next() {
        var args = Array.prototype.slice.call(arguments),
          seq = stack.shift(); // BUG this will eventually leak
  
        data = arguments;
  
        if (!seq) {
          // the chain has ended (for now)
          waiting = true;
          return;
        }
  
        args.unshift(next);
        seq.callback.apply(seq.context, args);
      }
  
      function then(callback, context) {
        if ('function' !== typeof callback) {
          throw new Error("`Sequence().then(callback [context])` requires that `callback` be a function and that `context` be `null`, an object, or a function");
        }
        stack.push({
          callback: callback,
          context: (null === context ? null : context || global_context),
          index: stack.length
        });
  
        // if the chain has stopped, start it back up
        if (waiting) {
          waiting = false;
          next.apply(null, data);
        }
  
        return self;
      }
  
      self.next = next;
      self.then = then;
    }
  
    function Sequence(context) {
      // TODO use prototype instead of new
      return (new sequence(context));
    }
    Sequence.isSequence = isSequence;
    module.exports = Sequence;
  }());
  

  provide("sequence", module.exports);
  provide("sequence", module.exports);
  $.ender(module.exports);
}(global));

// ender:events.node as events
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  if ('undefined' === typeof process) {
    process = {};
  }
  (function () {
    "use strict";
  
    process.EventEmitter = process.EventEmitter || function () {};
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var EventEmitter = exports.EventEmitter = process.EventEmitter;
  var isArray = Array.isArray;
  
  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  var defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!this._events) this._events = {};
    this._events.maxListeners = n;
  };
  
  
  EventEmitter.prototype.emit = function(type) {
    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events || !this._events.error ||
          (isArray(this._events.error) && !this._events.error.length))
      {
        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }
  
    if (!this._events) return false;
    var handler = this._events[type];
    if (!handler) return false;
  
    if (typeof handler == 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          var args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
      return true;
  
    } else if (isArray(handler)) {
      var args = Array.prototype.slice.call(arguments, 1);
  
      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
      return true;
  
    } else {
      return false;
    }
  };
  
  // EventEmitter is defined in src/node_events.cc
  // EventEmitter.prototype.emit() is also defined there.
  EventEmitter.prototype.addListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('addListener only takes instances of Function');
    }
  
    if (!this._events) this._events = {};
  
    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);
  
    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else if (isArray(this._events[type])) {
  
      // If we've already got an array, just append.
      this._events[type].push(listener);
  
      // Check for listener leak
      if (!this._events[type].warned) {
        var m;
        if (this._events.maxListeners !== undefined) {
          m = this._events.maxListeners;
        } else {
          m = defaultMaxListeners;
        }
  
        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    } else {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
  
    return this;
  };
  
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  
  EventEmitter.prototype.once = function(type, listener) {
    var self = this;
    function g() {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    };
  
    g.listener = listener;
    self.on(type, g);
  
    return this;
  };
  
  EventEmitter.prototype.removeListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }
  
    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events || !this._events[type]) return this;
  
    var list = this._events[type];
  
    if (isArray(list)) {
      var position = -1;
      for (var i = 0, length = list.length; i < length; i++) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener))
        {
          position = i;
          break;
        }
      }
  
      if (position < 0) return this;
      list.splice(position, 1);
      if (list.length == 0)
        delete this._events[type];
    } else if (list === listener ||
               (list.listener && list.listener === listener))
    {
      delete this._events[type];
    }
  
    return this;
  };
  
  EventEmitter.prototype.removeAllListeners = function(type) {
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  };
  
  EventEmitter.prototype.listeners = function(type) {
    if (!this._events) this._events = {};
    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };
  
  }());
  

  provide("events.node", module.exports);
  provide("events", module.exports);
  $.ender(module.exports);
}(global));

// ender:url as url
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  exports.parse = urlParse;
  exports.resolve = urlResolve;
  exports.resolveObject = urlResolveObject;
  exports.format = urlFormat;
  
  // Reference: RFC 3986, RFC 1808, RFC 2396
  
  // define these here so at least they only have to be
  // compiled once on the first module load.
  var protocolPattern = /^([a-z0-9]+:)/i,
      portPattern = /:[0-9]+$/,
      // RFC 2396: characters reserved for delimiting URLs.
      delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
      // RFC 2396: characters not allowed for various reasons.
      unwise = ['{', '}', '|', '\\', '^', '~', '[', ']', '`'].concat(delims),
      // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
      autoEscape = ['\''],
      // Characters that are never ever allowed in a hostname.
      // Note that any invalid chars are also handled, but these
      // are the ones that are *expected* to be seen, so we fast-path
      // them.
      nonHostChars = ['%', '/', '?', ';', '#']
        .concat(unwise).concat(autoEscape),
      nonAuthChars = ['/', '@', '?', '#'].concat(delims),
      hostnameMaxLen = 255,
      hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z-]{0,62}$/,
      hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z-]{0,62})(.*)$/,
      // protocols that can allow "unsafe" and "unwise" chars.
      unsafeProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that never have a hostname.
      hostlessProtocol = {
        'javascript': true,
        'javascript:': true
      },
      // protocols that always have a path component.
      pathedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      // protocols that always contain a // bit.
      slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      querystring = require('querystring');
  
  function urlParse(url, parseQueryString, slashesDenoteHost) {
    if (url && typeof(url) === 'object' && url.href) return url;
  
    var out = {},
        rest = url;
  
    // cut off any delimiters.
    // This is to support parse stuff like "<http://foo.com>"
    for (var i = 0, l = rest.length; i < l; i++) {
      if (delims.indexOf(rest.charAt(i)) === -1) break;
    }
    if (i !== 0) rest = rest.substr(i);
  
  
    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      var lowerProto = proto.toLowerCase();
      out.protocol = lowerProto;
      rest = rest.substr(proto.length);
    }
  
    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        out.slashes = true;
      }
    }
  
    if (!hostlessProtocol[proto] &&
        (slashes || (proto && !slashedProtocol[proto]))) {
      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      // don't enforce full RFC correctness, just be unstupid about it.
  
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the first @ sign, unless some non-auth character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      var atSign = rest.indexOf('@');
      if (atSign !== -1) {
        // there *may be* an auth
        var hasAuth = true;
        for (var i = 0, l = nonAuthChars.length; i < l; i++) {
          var index = rest.indexOf(nonAuthChars[i]);
          if (index !== -1 && index < atSign) {
            // not a valid auth.  Something like http://foo.com/bar@baz/
            hasAuth = false;
            break;
          }
        }
        if (hasAuth) {
          // pluck off the auth portion.
          out.auth = rest.substr(0, atSign);
          rest = rest.substr(atSign + 1);
        }
      }
  
      var firstNonHost = -1;
      for (var i = 0, l = nonHostChars.length; i < l; i++) {
        var index = rest.indexOf(nonHostChars[i]);
        if (index !== -1 &&
            (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
      }
  
      if (firstNonHost !== -1) {
        out.host = rest.substr(0, firstNonHost);
        rest = rest.substr(firstNonHost);
      } else {
        out.host = rest;
        rest = '';
      }
  
      // pull out port.
      var p = parseHost(out.host);
      if (out.auth) out.host = out.auth + '@' + out.host;
      var keys = Object.keys(p);
      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        out[key] = p[key];
      }
  
      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      out.hostname = out.hostname || '';
  
      // validate a little.
      if (out.hostname.length > hostnameMaxLen) {
        out.hostname = '';
      } else {
        var hostparts = out.hostname.split(/\./);
        for (var i = 0, l = hostparts.length; i < l; i++) {
          var part = hostparts[i];
          if (!part) continue;
          if (!part.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest
            }
            out.hostname = validParts.join('.');
            break;
          }
        }
      }
      // hostnames are always lower case.
      out.hostname = out.hostname.toLowerCase();
  
      out.host = ((out.auth) ? out.auth + '@' : '') +
          (out.hostname || '') +
          ((out.port) ? ':' + out.port : '');
      out.href += out.host;
    }
  
    // now rest is set to the post-host stuff.
    // chop off any delim chars.
    if (!unsafeProtocol[lowerProto]) {
  
      // First, make 100% sure that any "autoEscape" chars get
      // escaped, even if encodeURIComponent doesn't think they
      // need to be.
      for (var i = 0, l = autoEscape.length; i < l; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
          esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
      }
  
      // Now make sure that delims never appear in a url.
      var chop = rest.length;
      for (var i = 0, l = delims.length; i < l; i++) {
        var c = rest.indexOf(delims[i]);
        if (c !== -1) {
          chop = Math.min(c, chop);
        }
      }
      rest = rest.substr(0, chop);
    }
  
  
    // chop off from the tail first.
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string.
      out.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
      out.search = rest.substr(qm);
      out.query = rest.substr(qm + 1);
      if (parseQueryString) {
        out.query = querystring.parse(out.query);
      }
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      // no query string, but parseQueryString still requested
      out.search = '';
      out.query = {};
    }
    if (rest) out.pathname = rest;
    if (slashedProtocol[proto] &&
        out.hostname && !out.pathname) {
      out.pathname = '/';
    }
  
    // finally, reconstruct the href based on what has been validated.
    out.href = urlFormat(out);
  
    return out;
  }
  
  // format a parsed object into a url string
  function urlFormat(obj) {
    // ensure it's an object, and not a string url.
    // If it's an obj, this is a no-op.
    // this way, you can call url_format() on strings
    // to clean up potentially wonky urls.
    if (typeof(obj) === 'string') obj = urlParse(obj);
  
    var auth = obj.auth;
    if (auth) {
      auth = auth.split('@').join('%40');
      for (var i = 0, l = nonAuthChars.length; i < l; i++) {
        var nAC = nonAuthChars[i];
        auth = auth.split(nAC).join(encodeURIComponent(nAC));
      }
    }
  
    var protocol = obj.protocol || '',
        host = (obj.host !== undefined) ? obj.host :
            obj.hostname !== undefined ? (
                (auth ? auth + '@' : '') +
                obj.hostname +
                (obj.port ? ':' + obj.port : '')
            ) :
            false,
        pathname = obj.pathname || '',
        query = obj.query &&
                ((typeof obj.query === 'object' &&
                  Object.keys(obj.query).length) ?
                   querystring.stringify(obj.query) :
                   '') || '',
        search = obj.search || (query && ('?' + query)) || '',
        hash = obj.hash || '';
  
    if (protocol && protocol.substr(-1) !== ':') protocol += ':';
  
    // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
    // unless they had them to begin with.
    if (obj.slashes ||
        (!protocol || slashedProtocol[protocol]) && host !== false) {
      host = '//' + (host || '');
      if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
    } else if (!host) {
      host = '';
    }
  
    if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
    if (search && search.charAt(0) !== '?') search = '?' + search;
  
    return protocol + host + pathname + search + hash;
  }
  
  function urlResolve(source, relative) {
    return urlFormat(urlResolveObject(source, relative));
  }
  
  function urlResolveObject(source, relative) {
    if (!source) return relative;
  
    source = urlParse(urlFormat(source), false, true);
    relative = urlParse(urlFormat(relative), false, true);
  
    // hash is always overridden, no matter what.
    source.hash = relative.hash;
  
    if (relative.href === '') return source;
  
    // hrefs like //foo/bar always cut to the protocol.
    if (relative.slashes && !relative.protocol) {
      relative.protocol = source.protocol;
      return relative;
    }
  
    if (relative.protocol && relative.protocol !== source.protocol) {
      // if it's a known url protocol, then changing
      // the protocol does weird things
      // first, if it's not file:, then we MUST have a host,
      // and if there was a path
      // to begin with, then we MUST have a path.
      // if it is file:, then the host is dropped,
      // because that's known to be hostless.
      // anything else is assumed to be absolute.
  
      if (!slashedProtocol[relative.protocol]) return relative;
  
      source.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || '').split('/');
        while (relPath.length && !(relative.host = relPath.shift()));
        if (!relative.host) relative.host = '';
        if (relPath[0] !== '') relPath.unshift('');
        if (relPath.length < 2) relPath.unshift('');
        relative.pathname = relPath.join('/');
      }
      source.pathname = relative.pathname;
      source.search = relative.search;
      source.query = relative.query;
      source.host = relative.host || '';
      delete source.auth;
      delete source.hostname;
      source.port = relative.port;
      return source;
    }
  
    var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
        isRelAbs = (
            relative.host !== undefined ||
            relative.pathname && relative.pathname.charAt(0) === '/'
        ),
        mustEndAbs = (isRelAbs || isSourceAbs ||
                      (source.host && relative.pathname)),
        removeAllDots = mustEndAbs,
        srcPath = source.pathname && source.pathname.split('/') || [],
        relPath = relative.pathname && relative.pathname.split('/') || [],
        psychotic = source.protocol &&
            !slashedProtocol[source.protocol] &&
            source.host !== undefined;
  
    // if the url is a non-slashed url, then relative
    // links like ../.. should be able
    // to crawl up to the hostname, as well.  This is strange.
    // source.protocol has already been set by now.
    // Later on, put the first path part into the host field.
    if (psychotic) {
  
      delete source.hostname;
      delete source.auth;
      delete source.port;
      if (source.host) {
        if (srcPath[0] === '') srcPath[0] = source.host;
        else srcPath.unshift(source.host);
      }
      delete source.host;
  
      if (relative.protocol) {
        delete relative.hostname;
        delete relative.auth;
        delete relative.port;
        if (relative.host) {
          if (relPath[0] === '') relPath[0] = relative.host;
          else relPath.unshift(relative.host);
        }
        delete relative.host;
      }
      mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
    }
  
    if (isRelAbs) {
      // it's absolute.
      source.host = (relative.host || relative.host === '') ?
                        relative.host : source.host;
      source.search = relative.search;
      source.query = relative.query;
      srcPath = relPath;
      // fall through to the dot-handling below.
    } else if (relPath.length) {
      // it's relative
      // throw away the existing file, and take the new path instead.
      if (!srcPath) srcPath = [];
      srcPath.pop();
      srcPath = srcPath.concat(relPath);
      source.search = relative.search;
      source.query = relative.query;
    } else if ('search' in relative) {
      // just pull out the search.
      // like href='?foo'.
      // Put this after the other two cases because it simplifies the booleans
      if (psychotic) {
        source.host = srcPath.shift();
      }
      source.search = relative.search;
      source.query = relative.query;
      return source;
    }
    if (!srcPath.length) {
      // no path at all.  easy.
      // we've already handled the other stuff above.
      delete source.pathname;
      return source;
    }
  
    // if a url ENDs in . or .., then it must get a trailing slash.
    // however, if it ends in anything else non-slashy,
    // then it must NOT get a trailing slash.
    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = (
        (source.host || relative.host) && (last === '.' || last === '..') ||
        last === '');
  
    // strip single dots, resolve double dots to parent dir
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = srcPath.length; i >= 0; i--) {
      last = srcPath[i];
      if (last == '.') {
        srcPath.splice(i, 1);
      } else if (last === '..') {
        srcPath.splice(i, 1);
        up++;
      } else if (up) {
        srcPath.splice(i, 1);
        up--;
      }
    }
  
    // if the path is allowed to go above the root, restore leading ..s
    if (!mustEndAbs && !removeAllDots) {
      for (; up--; up) {
        srcPath.unshift('..');
      }
    }
  
    if (mustEndAbs && srcPath[0] !== '' &&
        (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }
  
    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
      srcPath.push('');
    }
  
    var isAbsolute = srcPath[0] === '' ||
        (srcPath[0] && srcPath[0].charAt(0) === '/');
  
    // put the host back
    if (psychotic) {
      source.host = isAbsolute ? '' : srcPath.shift();
    }
  
    mustEndAbs = mustEndAbs || (source.host && srcPath.length);
  
    if (mustEndAbs && !isAbsolute) {
      srcPath.unshift('');
    }
  
    source.pathname = srcPath.join('/');
  
  
    return source;
  }
  
  function parseHost(host) {
    var out = {};
    var port = portPattern.exec(host);
    if (port) {
      port = port[0];
      out.port = port.substr(1);
      host = host.substr(0, host.length - port.length);
    }
    if (host) out.hostname = host;
    return out;
  }
  
  }());
  

  provide("url", module.exports);
  provide("url", module.exports);
  $.ender(module.exports);
}(global));

// ender:join as join
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var Future = require('future');
  
    function isJoin(obj) {
      return obj instanceof join;
    }
  
    function join(global_context) {
      var self = this,
        data = [],
        ready = [],
        subs = [],
        promise_only = false,
        begun = false,
        updated = 0,
        join_future = Future(global_context);
  
      global_context = global_context || null;
  
      function relay() {
        var i;
        if (!begun || updated !== data.length) {
          return;
        }
        updated = 0;
        join_future.deliver.apply(join_future, data);
        data = Array(data.length);
        ready = Array(ready.length);
        //for (i = 0; i < data.length; i += 1) {
        //  data[i] = undefined;
        //}
      }
  
      function init() {
        var type = (promise_only ? "when" : "whenever");
  
        begun = true;
        data = Array(subs.length);
        ready = Array(subs.length);
  
        subs.forEach(function (sub, id) {
          sub[type](function () {
            var args = Array.prototype.slice.call(arguments);
            data[id] = args;
            if (!ready[id]) {
              ready[id] = true;
              updated += 1;
            }
            relay();
          });
        });
      }
  
      self.deliverer = function () {
        var future = Future();
        self.add(future);
        return future.deliver;
      };
      self.newCallback = self.deliverer;
  
      self.when = function () {
        if (!begun) {
          init();
        }
        join_future.when.apply(join_future, arguments);
      };
  
      self.whenever = function () {
        if (!begun) {
          init();
        }
        join_future.whenever.apply(join_future, arguments);
      };
  
      self.add = function () {
        if (begun) {
          throw new Error("`Join().add(Array<future> | subs1, [subs2, ...])` requires that all additions be completed before the first `when()` or `whenever()`");
        }
        var args = Array.prototype.slice.call(arguments);
        if (0 === args.length) {
          return self.newCallback();
        }
        args = Array.isArray(args[0]) ? args[0] : args;
        args.forEach(function (sub) {
          if (!sub.whenever) {
            promise_only = true;
          }
          if (!sub.when) {
            throw new Error("`Join().add(future)` requires either a promise or future");
          }
          subs.push(sub);
        });
      };
    }
  
    function Join(context) {
      // TODO use prototype instead of new
      return (new join(context));
    }
    Join.isJoin = isJoin;
    module.exports = Join;
  }());
  

  provide("join", module.exports);
  provide("join", module.exports);
  $.ender(module.exports);
}(global));

// ender:domready as domready
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);
  provide("domready", module.exports);
  $.ender(module.exports);
}(global));

// ender:domready/ender-bridge as domready/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
    var ready =  require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

  provide("domready/ender-bridge", module.exports);
  provide("domready/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:bonzo as bonzo
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(name, definition)
    else this[name] = definition()
  }('bonzo', function() {
    var context = this
      , win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null
      , specialAttributes = /^(checked|value|selected)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = [ '<table>', '</table>', 1 ]
      , td = [ '<table><tbody><tr>', '</tr></tbody></table>', 3 ]
      , option = [ '<select>', '</select>', 1 ]
      , noscope = [ '_', '', 0, 1 ]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: [ '<table><tbody>', '</tbody></table>', 2 ]
          , th: td , td: td
          , col: [ '<table><colgroup>', '</colgroup></table>', 2 ]
          , fieldset: [ '<form>', '</form>', 1 ]
          , legend: [ '<form><fieldset>', '</fieldset></form>', 2 ]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
    function each(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) fn.call(scope || ar[i], ar[i], i, ar)
      return ar
    }
  
    function deepEach(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, scope)
          fn.call(scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
    function clearData(el) {
      uid = el[getAttribute]('data-node-uid')
      uid && (delete uidMap[uid])
    }
  
    function dataValue(d, f) {
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && node.nodeType == 1
    }
  
    function some(ar, fn, scope, i, j) {
      for (i = 0, j = ar.length; i < j; ++i) if (fn.call(scope, ar[i], i, ar)) return true
      return false
    }
  
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      function (el, property) {
        if (property == 'opacity') {
          var val = 100
          try {
            val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el.filters('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t) {
        each(self, function (el) {
          var n = !el[parentNode] || (el[parentNode] && !el[parentNode][parentNode]) ?
            function () {
              var c = el.cloneNode(true)
                , cloneElems
                , elElems
  
              // check for existence of an event cloner
              // preferably https://github.com/fat/bean
              // otherwise Bonzo won't do this for you
              if (self.$ && self.cloneEvents) {
                self.$(c).cloneEvents(el)
  
                // clone events from every child node
                cloneElems = self.$(c).find('*')
                elElems = self.$(el).find('*')
  
                for (var i = 0; i < elElems.length; i++)
                  self.$(cloneElems[i]).cloneEvents(elElems[i])
              }
              return c
            }() : el
          fn(t, n)
          r[i] = n
          i++
        })
      }, this)
      each(r, function (e, i) {
        self[i] = e
      })
      self.length = i
      return self
    }
  
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    // so we iterate down below
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }
  
  
    // this allows method calling for setting values
    // example:
    // bonzo(elements).css('color', function (el) {
    //   return el.getAttribute('data-original-color')
    // })
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }
  
    Bonzo.prototype = {
  
        // indexr method, because jQueriers want this method. Jerks
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
      , each: function (fn, scope) {
          return each(this, fn, scope)
        }
  
      , deepEach: function (fn, scope) {
          return deepEach(this, fn, scope)
        }
  
      , map: function (fn, reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            reject ? (reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
      , html: function (h, text) {
          var method = text ?
            html.textContent === undefined ?
              'innerText' :
              'textContent' :
            'innerHTML';
          function append(el) {
            each(normalize(h), function (node) {
              el.appendChild(node)
            })
          }
          return typeof h !== 'undefined' ?
              this.empty().each(function (el) {
                !text && specialTags.test(el.tagName) ?
                  append(el) :
                  !function() {
                    try { (el[method] = h) }
                    catch(e) { append(el) }
                  }();
              }) :
            this[0] ? this[0][method] : ''
        }
  
      , text: function (text) {
          return this.html(text, 1)
        }
  
        // more related insertion methods
      , append: function (node) {
          return this.each(function (el) {
            each(normalize(node), function (i) {
              el.appendChild(i)
            })
          })
        }
  
      , prepend: function (node) {
          return this.each(function (el) {
            var first = el.firstChild
            each(normalize(node), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
      , appendTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.appendChild(el)
          })
        }
  
      , prependTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          })
        }
  
      , before: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
      , after: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            })
          })
        }
  
      , insertBefore: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
      , insertAfter: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            var sibling = t.nextSibling
            if (sibling) {
              t[parentNode].insertBefore(el, sibling);
            }
            else {
              t[parentNode].appendChild(el)
            }
          })
        }
  
      , replaceWith: function(html) {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el.parentNode.replaceChild(bonzo.create(html)[0], el)
          })
        }
  
        // class management
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }
  
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }
  
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }
  
      , toggleClass: function (c, condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof condition !== 'undefined' ?
                  condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }
  
        // display togglers
      , show: function (type) {
          return this.each(function (el) {
            el.style.display = type || ''
          })
        }
  
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
      , toggle: function (callback, type) {
          this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : type || ''
          })
          callback && callback()
          return this
        }
  
        // DOM Walkers & getters
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
      , next: function () {
          return this.related('nextSibling')
        }
  
      , previous: function () {
          return this.related('previousSibling')
        }
  
      , parent: function() {
          return this.related(parentNode)
        }
  
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
        // meh. use with care. the ones in Bean are better
      , focus: function () {
          this.length && this[0].focus()
          return this
        }
  
      , blur: function () {
          return this.each(function (el) {
            el.blur()
          })
        }
  
        // style getter setter & related methods
      , css: function (o, v, p) {
          // is this a request for just getting a style?
          if (v === undefined && typeof o == 'string') {
            // repurpose 'v'
            v = this[0]
            if (!v) {
              return null
            }
            if (v === doc || v === win) {
              p = (v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(v, o) : null
          }
          var iter = o
          if (typeof o == 'string') {
            iter = {}
            iter[o] = v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                el.style[p] = setter(el, v)
              }
            }
          }
          return this.each(fn)
        }
  
      , offset: function (x, y) {
          if (typeof x == 'number' || typeof y == 'number') {
            return this.each(function (el) {
              xy(el, x, y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t, s) {
                  s = {
                      position: el.style.position || ''
                    , visibility: el.style.visibility || ''
                    , display: el.style.display || ''
                  }
                  t.first().css({
                      position: 'absolute'
                    , visibility: 'hidden'
                    , display: 'block'
                  })
                  return s
                }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
      , attr: function (k, v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, v)) : el[setAttribute](k, setter(el, v))
            })
        }
  
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
      , data: function (k, v) {
          var el = this[0], uid, o, m
          if (typeof v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof k === 'undefined') {
              each(el.attributes, function(a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[k] === 'undefined')
                o[k] = dataValue(this.attr('data-' + decamelize(k)))
              return o[k]
            }
          } else {
            return this.each(function (el) { data(el)[k] = v })
          }
        }
  
        // DOM detachment & related
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
      , detach: function () {
          return this.map(function (el) {
            return el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node) {
      return typeof node == 'string' ? bonzo.create(node) : isNode(node) ? [node] : node // assume [nodes]
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    function bonzo(els, host) {
      return new Bonzo(els, host)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
  
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  }); // the only line we care about using a semi-colon. placed here for concatenation tools
  

  provide("bonzo", module.exports);
  provide("bonzo", module.exports);
  $.ender(module.exports);
}(global));

// ender:bonzo/ender-bridge as bonzo/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
  
    var b =  require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension.call(this, 'height', v)
      }
  
    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)
  
    function dimension(type, v) {
      return typeof v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, v)
    }
  }(ender);
  

  provide("bonzo/ender-bridge", module.exports);
  provide("bonzo/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:bean as bean
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
  !function (name, context, definition) {
    if (typeof module !== 'undefined') module.exports = definition(name, context);
    else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
    else context[name] = definition(name, context);
  }('bean', this, function (name, context) {
    var win = window
      , old = context[name]
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = { one: 1 } // singleton for quick matching making add() do one()
  
      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        })({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded readystatechange ' + // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'message readystatechange pageshow pagehide popstate ' +           // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        )
  
      , customEvents = (function () {
          var cdp = 'compareDocumentPosition'
          var isAncestor = cdp in root
            ? function (element, container) {
                return container[cdp] && (container[cdp](element) & 16) === 16
              }
            : 'contains' in root
              ? function (element, container) {
                  container = container.nodeType === 9 || container === window ? root : container
                  return container !== element && container.contains(element)
                }
              : function (element, container) {
                  while (element = element.parentNode) if (element === container) return 1
                  return 0
                }
  
          function check(event) {
            var related = event.relatedTarget
            if (!related) return related === null
            return (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this))
          }
  
          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        })()
  
      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }
  
          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result
  
            var props
              , type = event.type
              , target = event.target || event.srcElement
  
            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result.target = target && target.nodeType === 3 ? target.parentNode : target
  
            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.which || event.keyCode
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
                if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        })()
  
        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }
  
        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.isNative = nativeEvents[type] && element[eventSupport]
            this.eventType = W3C_MODEL || this.isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !this.isNative && type
            this.target = targetElement(element, this.isNative)
            this.eventSupport = this.target[eventSupport]
          }
  
          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }
  
              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }
  
          return entry
        })()
  
      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}
  
            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }
  
            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }
  
            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }
  
            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }
  
            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }
  
              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }
  
          return { has: has, get: get, put: put, del: del, entries: entries }
        })()
  
        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }
  
      , nativeHandler = function (element, fn, args) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true)
            if (beanDel) // delegated event, fix the fix
              event.currentTarget = beanDel.ft(event.target, element)
            return fn.apply(element, [event].concat(args))
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , customHandler = function (element, fn, type, condition, args, isNative) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            var target = beanDel ? beanDel.ft(event.target, element) : this // deleated event
            if (condition ? condition.apply(target, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event) {
                event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative)
                event.currentTarget = target
              }
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }
  
      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)
  
          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i]).eventSupport)
                listener(entry.target, entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }
  
      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')
  
          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, args, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry.eventSupport)
            listener(entry.target, entry.eventType, entry.handler, true, entry.customType)
        }
  
      , del = function (selector, fn, $) {
          var findTarget = function (target, root) {
                var i, array = typeof selector === 'string' ? $(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target)
                      return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e.target, this)
                if (match)
                  fn.apply(match, arguments)
              }
  
          handler.__beanDel = {
              ft: findTarget // attach it here for customEvents to use too
            , selector: selector
            , $: $
          }
          return handler
        }
  
      , remove = function (element, typeSpec, fn) {
          var k, m, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'
  
          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }
  
      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'
  
          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }
  
      , one = function () {
          return add.apply(ONE, arguments)
        }
  
      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }
  
      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')
  
          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }
  
      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length
            , args, beanDel
  
          for (;i < l; i++) {
            if (handlers[i].original) {
              beanDel = handlers[i].handler.__beanDel
              if (beanDel) {
                args = [ element, beanDel.selector, handlers[i].type, handlers[i].original, beanDel.$]
              } else
                args = [ element, handlers[i].type, handlers[i].original ]
              add.apply(null, args)
            }
          }
          return element
        }
  
      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , noConflict: function () {
              context[name] = old
              return this
            }
        }
  
    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }
  
    return bean
  })
  

  provide("bean", module.exports);
  provide("bean", module.exports);
  $.ender(module.exports);
}(global));

// ender:bean/ender-bridge as bean/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function ($) {
    var b =  require('bean')
      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var args, i = 0, l = this.length; i < l; i++) {
              args = [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0))
              args.length == 4 && args.push($)
              !arguments.length && method == 'add' && type && (method = 'fire')
              b[method].apply(this, args)
            }
            return this
          }
        }
      , add = integrate('add')
      , remove = integrate('remove')
      , fire = integrate('fire')
  
      , methods = {
            on: add // NOTE: .on() is likely to change in the near future, don't rely on this as-is see https://github.com/fat/bean/issues/55
          , addListener: add
          , bind: add
          , listen: add
          , delegate: add
  
          , one: integrate('one')
  
          , off: remove
          , unbind: remove
          , unlisten: remove
          , removeListener: remove
          , undelegate: remove
  
          , emit: fire
          , trigger: fire
  
          , cloneEvents: integrate('clone')
  
          , hover: function (enter, leave, i) { // i for internal
              for (i = this.length; i--;) {
                b.add.call(this, this[i], 'mouseenter', enter)
                b.add.call(this, this[i], 'mouseleave', leave)
              }
              return this
            }
        }
  
      , shortcuts = [
            'blur', 'change', 'click', 'dblclick', 'error', 'focus', 'focusin'
          , 'focusout', 'keydown', 'keypress', 'keyup', 'load', 'mousedown'
          , 'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'mouseup', 'mousemove'
          , 'resize', 'scroll', 'select', 'submit', 'unload'
        ]
  
    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('add', shortcuts[i])
    }
  
    $.ender(methods, true)
  }(ender)
  

  provide("bean/ender-bridge", module.exports);
  provide("bean/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:qwery as qwery
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
    * Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz & Jacob Thornton 2011
    * MIT License
    */
  
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('qwery', function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'
      , useNativeQSA = 'useNativeQSA'
      , tagName = 'tagName'
      , nodeType = 'nodeType'
      , select // main select() method, assign later
  
      // OOOOOOOOOOOOH HERE COME THE ESSSXXSSPRESSSIONSSSSSSSS!!!!!
      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
      , walker = {
          ' ': function (node) {
            return node && node !== html && node.parentNode
          }
        , '>': function (node, contestant) {
            return node && node.parentNode == contestant.parentNode && node.parentNode
          }
        , '~': function (node) {
            return node && node.previousSibling
          }
        , '+': function (node, contestant, p1, p2) {
            if (!node) return false
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
          }
        }
  
    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }
  
    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()
  
    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }
  
    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn(a[i])
    }
  
    function flatten(ar) {
      for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
      return r
    }
  
    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }
  
    function previous(n) {
      while (n = n.previousSibling) if (n[nodeType] == 1) break;
      return n
    }
  
    function q(query) {
      return query.match(chunker)
    }
  
    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this[nodeType] !== 1) return false
      if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }
  
    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }
  
    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }
  
    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)
  
      if (!tokens.length) return r
  
      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r
  
      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r
  
      // filter further according to the rest of the selector (the left side)
      each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }
  
    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?
  
      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }
  
    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }
  
    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
    }
  
    function uniq(ar) {
      var a = [], i, j
      o: for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }
  
    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }
  
    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root[nodeType] && arrayLike(root)) return root[0]
      return root
    }
  
    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root[nodeType] === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }
  
    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)
  
      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
      }
  
      return select(selector, root)
    }
  
    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function(s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root[nodeType] !== 9) {
           // make sure the el has an id, rewrite the query, set root to doc and run it
           if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
           s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
           collector(root.parentNode || root, s, true)
           oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }
  
    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container[nodeType] === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function() {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function(e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function(e, a) { return e.getAttribute(a) }
     }()
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]
      // use native qSA
    , selectQSA = function (selector, root) {
        var result = [], ss, e
        try {
          if (root[nodeType] === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch(ex) { }
        return selectNonNative(selector, root)
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , configure = function (options) {
        // configNativeQSA: use fully-internal selector or native qSA where present
        if (typeof options[useNativeQSA] !== 'undefined')
          select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      }
  
    configure({ useNativeQSA: true })
  
    qwery.configure = configure
    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}
  
    return qwery
  })
  

  provide("qwery", module.exports);
  provide("qwery", module.exports);
  $.ender(module.exports);
}(global));

// ender:qwery/ender-bridge as qwery/ender-bridge
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  !function (doc, $) {
    var q =  require('qwery')
  
    $.pseudos = q.pseudos
  
    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function(b) {
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }
  
    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(document, ender);
  

  provide("qwery/ender-bridge", module.exports);
  provide("qwery/ender-bridge", module.exports);
  $.ender(module.exports);
}(global));

// ender:forEachAsync as forEachAsync
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var Sequence = require('sequence');
  
    function forEachAsync(arr, callback) {
      var sequence = Sequence();
  
      function handleItem(item, i, arr) {
        sequence.then(function (next) {
          callback(next, item, i, arr);
        });
      }
  
      arr.forEach(handleItem);
  
      return sequence;
    }
  
    module.exports = forEachAsync;
  }());
  

  provide("forEachAsync", module.exports);
  provide("forEachAsync", module.exports);
  $.ender(module.exports);
}(global));

// ender:json-storage as json-storage
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var db;
  
    function Stringify(obj) {
      var str;
      try {
        str = JSON.stringify(obj);
      } catch(e) {
        str = "";
      }
  
      return str;
    }
  
    function Parse(str) {
      var obj = null;
      try {
        obj = JSON.parse(str);
      } catch(e) {}
  
      return obj;
    }
  
    function JsonStorage(w3cStorage) {
      this.db = w3cStorage;
      this.keysAreDirty = true;
    }
    db = JsonStorage;
    
    db.prototype.clear = function () {
      this.keysAreDirty = true;
      this.keys().forEach(function (uuid) {
        this.remove(uuid);
      }, this);
    };
  
    db.prototype.remove = function (uuid) {
      this.keysAreDirty = true;
      this.db.removeItem(uuid);
    };
  
    db.prototype.get = function (uuid) {
      return Parse(this.db.getItem(uuid));
    };
  
    db.prototype.set = function (uuid, val) {
      this.keysAreDirty = true;
      return this.db.setItem(uuid, Stringify(val));
    };
  
    db.prototype.keys = function () {
      var i
        ;
  
      if (!this.keysAreDirty) {
        return this.__keys.concat([]);
      }
  
      this.__keys = [];
      for (i = 0; i < this.db.length; i += 1) {
        this.__keys.push(this.db.key(i));
      }
      this.keysAreDirty = false;
  
      return this.__keys.concat([]);
    };
  
    db.prototype.size = function () {
      return this.db.length;
    };
  
    function create(w3cStorage) {
      return new JsonStorage(w3cStorage);
    }
  
    module.exports = create;
  }());
  

  provide("json-storage", module.exports);
  provide("json-storage", module.exports);
  $.ender(module.exports);
}(global));

// ender:pure as pure
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*!
  	PURE Unobtrusive Rendering Engine for HTML
  
  	Licensed under the MIT licenses.
  	More information at: http://www.opensource.org
  
  	Copyright (c) 2011 Michael Cvilic - BeeBole.com
  
  	Thanks to Rog Peppe for the functional JS jump
  	revision: 2.67
  */
  
  var $p, pure = $p = function(){
  	var sel = arguments[0], 
  		ctxt = false;
  
  	if(typeof sel === 'string'){
  		ctxt = arguments[1] || false;
  	}else if(sel && !sel[0] && !sel.length){
  		sel = [sel];
  	}
  	return $p.core(sel, ctxt);
  };
  
  $p.core = function(sel, ctxt, plugins){
  	//get an instance of the plugins
  	var templates = [];
  	plugins = plugins || getPlugins();
  
  	//search for the template node(s)
  	switch(typeof sel){
  		case 'string':
  			templates = plugins.find(ctxt || document, sel);
  			if(templates.length === 0) {
  				error('The template "' + sel + '" was not found');
  			}
  		break;
  		case 'undefined':
  			error('The root of the template is undefined, check your selector');
  		break;
  		default:
  			templates = sel;
  	}
  	
  	for(var i = 0, ii = templates.length; i < ii; i++){
  		plugins[i] = templates[i];
  	}
  	plugins.length = ii;
  
  	// set the signature string that will be replaced at render time
  	var Sig = '_s' + Math.floor( Math.random() * 1000000 ) + '_',
  		// another signature to prepend to attributes and avoid checks: style, height, on[events]...
  		attPfx = '_a' + Math.floor( Math.random() * 1000000 ) + '_',
  		// rx to parse selectors, e.g. "+tr.foo[class]"
  		selRx = /^(\+)?([^\@\+]+)?\@?([^\+]+)?(\+)?$/,
  		// set automatically attributes for some tags
  		autoAttr = {
  			IMG:'src',
  			INPUT:'value'
  		},
  		// check if the argument is an array - thanks salty-horse (Ori Avtalion)
  		isArray = Array.isArray ?
  			function(o) {
  				return Array.isArray(o);
  			} :
  			function(o) {
  				return Object.prototype.toString.call(o) === "[object Array]";
  			};
  	
  	/* * * * * * * * * * * * * * * * * * * * * * * * * *
  		core functions
  	 * * * * * * * * * * * * * * * * * * * * * * * * * */
  
  
  	// error utility
  	function error(e){
  		if(typeof console !== 'undefined'){
  			console.log(e);
  			debugger;
  		}
  		throw('pure error: ' + e);
  	}
  	
  	//return a new instance of plugins
  	function getPlugins(){
  		var plugins = $p.plugins,
  			f = function(){};
  		f.prototype = plugins;
  
  		// do not overwrite functions if external definition
  		f.prototype.compile    = plugins.compile || compile;
  		f.prototype.render     = plugins.render || render;
  		f.prototype.autoRender = plugins.autoRender || autoRender;
  		f.prototype.find       = plugins.find || find;
  		
  		// give the compiler and the error handling to the plugin context
  		f.prototype._compiler  = compiler;
  		f.prototype._error     = error;
   
  		return new f();
  	}
  	
  	// returns the outer HTML of a node
  	function outerHTML(node){
  		// if IE, Chrome take the internal method otherwise build one
  		return node.outerHTML || (
  			function(n){
          		var div = document.createElement('div'), h;
  	        	div.appendChild( n.cloneNode(true) );
  				h = div.innerHTML;
  				div = null;
  				return h;
  			})(node);
  	}
  	
  	// returns the string generator function
  	function wrapquote(qfn, f){
  		return function(ctxt){
  			return qfn('' + f.call(ctxt.context, ctxt));
  		};
  	}
  
  	// default find using querySelector when available on the browser
  	function find(n, sel){
  		if(typeof n === 'string'){
  			sel = n;
  			n = false;
  		}
  		if(typeof document.querySelectorAll !== 'undefined'){
  			return (n||document).querySelectorAll( sel );
  		}else{
  			return error('You can test PURE standalone with: iPhone, FF3.5+, Safari4+ and IE8+\n\nTo run PURE on your browser, you need a JS library/framework with a CSS selector engine');
  		}
  	}
  	
  	// create a function that concatenates constant string
  	// sections (given in parts) and the results of called
  	// functions to fill in the gaps between parts (fns).
  	// fns[n] fills in the gap between parts[n-1] and parts[n];
  	// fns[0] is unused.
  	// this is the inner template evaluation loop.
  	function concatenator(parts, fns){
  		return function(ctxt){
  			var strs = [ parts[ 0 ] ],
  				n = parts.length,
  				fnVal, pVal, attLine, pos;
  
  			for(var i = 1; i < n; i++){
  				fnVal = fns[i].call( this, ctxt );
  				pVal = parts[i];
  				
  				// if the value is empty and attribute, remove it
  				if(fnVal === ''){
  					attLine = strs[ strs.length - 1 ];
  					if( ( pos = attLine.search( /[^\s]+=\"?$/ ) ) > -1){
  						strs[ strs.length - 1 ] = attLine.substring( 0, pos );
  						pVal = pVal.substr( 1 );
  					}
  				}
  				
  				strs[ strs.length ] = fnVal;
  				strs[ strs.length ] = pVal;
  			}
  			return strs.join('');
  		};
  	}
  
  	// parse and check the loop directive
  	function parseloopspec(p){
  		var m = p.match( /^(\w+)\s*<-\s*(\S+)?$/ );
  		if(m === null){
  			error('bad loop spec: "' + p + '"');
  		}
  		if(m[1] === 'item'){
  			error('"item<-..." is a reserved word for the current running iteration.\n\nPlease choose another name for your loop.');
  		}
  		if( !m[2] || (m[2] && (/context/i).test(m[2]))){ //undefined or space(IE) 
  			m[2] = function(ctxt){return ctxt.context;};
  		}
  		return {name: m[1], sel: m[2]};
  	}
  
  	// parse a data selector and return a function that
  	// can traverse the data accordingly, given a context.
  	function dataselectfn(sel){
  		if(typeof(sel) === 'function'){
  			return sel;
  		}
  		//check for a valid js variable name with hyphen(for properties only), $, _ and :
  		var m = sel.match(/^[a-zA-Z\$_\@][\w\$:-]*(\.[\w\$:-]*[^\.])*$/);
  		if(m === null){
  			var found = false, s = sel, parts = [], pfns = [], i = 0, retStr;
  			// check if literal
  			if(/\'|\"/.test( s.charAt(0) )){
  				if(/\'|\"/.test( s.charAt(s.length-1) )){
  					retStr = s.substring(1, s.length-1);
  					return function(){ return retStr; };
  				}
  			}else{
  				// check if literal + #{var}
  				while((m = s.match(/#\{([^{}]+)\}/)) !== null){
  					found = true;
  					parts[i++] = s.slice(0, m.index);
  					pfns[i] = dataselectfn(m[1]);
  					s = s.slice(m.index + m[0].length, s.length);
  				}
  			}
  			if(!found){
  				return function(){ return sel; };
  			}
  			parts[i] = s;
  			return concatenator(parts, pfns);
  		}
  		m = sel.split('.');
  		return function(ctxt){
  			var data = ctxt.context || ctxt,
  				v = ctxt[m[0]],
  				i = 0;
  			if(v && v.item){
  				i += 1;
  				if(m[i] === 'pos'){
  					//allow pos to be kept by string. Tx to Adam Freidin
  					return v.pos;
  				}else{
  					data = v.item;
  				}
  			}
  			var n = m.length;
  			for(; i < n; i++){
  				if(!data){break;}
  				data = data[m[i]];
  			}
  			return (!data && data !== 0) ? '':data;
  		};
  	}
  
  	// wrap in an object the target node/attr and their properties
  	function gettarget(dom, sel, isloop){
  		var osel, prepend, selector, attr, append, target = [];
  		if( typeof sel === 'string' ){
  			osel = sel;
  			var m = sel.match(selRx);
  			if( !m ){
  				error( 'bad selector syntax: ' + sel );
  			}
  			
  			prepend = m[1];
  			selector = m[2];
  			attr = m[3];
  			append = m[4];
  			
  			if(selector === '.' || ( !selector && attr ) ){
  				target[0] = dom;
  			}else{
  				target = plugins.find(dom, selector);
  			}
  			if(!target || target.length === 0){
  				return error('The node "' + sel + '" was not found in the template:\n' + outerHTML(dom).replace(/\t/g,'  '));
  			}
  		}else{
  			// autoRender node
  			prepend = sel.prepend;
  			attr = sel.attr;
  			append = sel.append;
  			target = [dom];
  		}
  		
  		if( prepend || append ){
  			if( prepend && append ){
  				error('append/prepend cannot take place at the same time');
  			}else if( isloop ){
  				error('no append/prepend/replace modifiers allowed for loop target');
  			}else if( append && isloop ){
  				error('cannot append with loop (sel: ' + osel + ')');
  			}
  		}
  		var setstr, getstr, quotefn, isStyle, isClass, attName, setfn;
  		if(attr){
  			isStyle = (/^style$/i).test(attr);
  			isClass = (/^class$/i).test(attr);
  			attName = isClass ? 'className' : attr;
  			setstr = function(node, s) {
  				node.setAttribute(attPfx + attr, s);
  				if (attName in node && !isStyle) {
  					node[attName] = '';
  				}
  				if (node.nodeType === 1) {
  					node.removeAttribute(attr);
  					isClass && node.removeAttribute(attName);
  				}
  			};
  			if (isStyle || isClass) {//IE no quotes special care
  				if(isStyle){
  					getstr = function(n){ return n.style.cssText; };
  				}else{
  					getstr = function(n){ return n.className;	};
  				}
  			}else {
  				getstr = function(n){ return n.getAttribute(attr); };
  			}
  			quotefn = function(s){ return s.replace(/\"/g, '&quot;'); };
  			if(prepend){
  				setfn = function(node, s){ setstr( node, s + getstr( node )); };
  			}else if(append){
  				setfn = function(node, s){ setstr( node, getstr( node ) + s); };
  			}else{
  				setfn = function(node, s){ setstr( node, s ); };
  			}
  		}else{
  			if (isloop) {
  				setfn = function(node, s) {
  					var pn = node.parentNode;
  					if (pn) {
  						//replace node with s
  						pn.insertBefore(document.createTextNode(s), node.nextSibling);
  						pn.removeChild(node);
  					}
  				};
  			} else {
  				if (prepend) {
  					setfn = function(node, s) { node.insertBefore(document.createTextNode(s), node.firstChild);	};
  				} else if (append) {
  					setfn = function(node, s) { node.appendChild(document.createTextNode(s));};
  				} else {
  					setfn = function(node, s) {
  						while (node.firstChild) { node.removeChild(node.firstChild); }
  						node.appendChild(document.createTextNode(s));
  					};
  				}
  			}
  			quotefn = function(s) { return s; };
  		}
  		return { attr: attr, nodes: target, set: setfn, sel: osel, quotefn: quotefn };
  	}
  
  	function setsig(target, n){
  		var sig = Sig + n + ':';
  		for(var i = 0; i < target.nodes.length; i++){
  			// could check for overlapping targets here.
  			target.set( target.nodes[i], sig );
  		}
  	}
  
  	// read de loop data, and pass it to the inner rendering function
  	function loopfn(name, dselect, inner, sorter, filter){
  		return function(ctxt){
  			var a = dselect(ctxt),
  				old = ctxt[name],
  				temp = { items : a },
  				filtered = 0,
  				length,
  				strs = [],
  				buildArg = function(idx, temp, ftr, len){
  					//keep the current loop. Tx to Adam Freidin
  					var save_pos = ctxt.pos,
  						save_item = ctxt.item,
  						save_items = ctxt.items;
  					ctxt.pos = temp.pos = idx;
  					ctxt.item = temp.item = a[ idx ];
  					ctxt.items = a;
  					//if array, set a length property - filtered items
  					typeof len !== 'undefined' &&  (ctxt.length = len);
  					//if filter directive
  					if(typeof ftr === 'function' && ftr.call(ctxt.item, ctxt) === false){
  						filtered++;
  						return;
  					}
  					strs.push( inner.call(ctxt.item, ctxt ) );
  					//restore the current loop
  					ctxt.pos = save_pos;
  					ctxt.item = save_item;
  					ctxt.items = save_items;
  				};
  			ctxt[name] = temp;
  			if( isArray(a) ){
  				length = a.length || 0;
  				// if sort directive
  				if(typeof sorter === 'function'){
  					a.sort(sorter);
  				}
  				//loop on array
  				for(var i = 0, ii = length; i < ii; i++){
  					buildArg(i, temp, filter, length - filtered);
  				}
  			}else{
  				if(a && typeof sorter !== 'undefined'){
  					error('sort is only available on arrays, not objects');
  				}
  				//loop on collections
  				for(var prop in a){
  					a.hasOwnProperty( prop ) && buildArg(prop, temp, filter);
  				}
  			}
  
  			typeof old !== 'undefined' ? ctxt[name] = old : delete ctxt[name];
  			return strs.join('');
  		};
  	}
  	// generate the template for a loop node
  	function loopgen(dom, sel, loop, fns){
  		var already = false, ls, sorter, filter, prop;
  		for(prop in loop){
  			if(loop.hasOwnProperty(prop)){
  				if(prop === 'sort'){
  					sorter = loop.sort;
  					continue;
  				}else if(prop === 'filter'){
  					filter = loop.filter;
  					continue;
  				}
  				if(already){
  					error('cannot have more than one loop on a target');
  				}
  				ls = prop;
  				already = true;
  			}
  		}
  		if(!ls){
  			error('Error in the selector: ' + sel + '\nA directive action must be a string, a function or a loop(<-)');
  		}
  		var dsel = loop[ls];
  		// if it's a simple data selector then we default to contents, not replacement.
  		if(typeof(dsel) === 'string' || typeof(dsel) === 'function'){
  			loop = {};
  			loop[ls] = {root: dsel};
  			return loopgen(dom, sel, loop, fns);
  		}
  		var spec = parseloopspec(ls),
  			itersel = dataselectfn(spec.sel),
  			target = gettarget(dom, sel, true),
  			nodes = target.nodes;
  			
  		for(i = 0; i < nodes.length; i++){
  			var node = nodes[i],
  				inner = compiler(node, dsel);
  			fns[fns.length] = wrapquote(target.quotefn, loopfn(spec.name, itersel, inner, sorter, filter));
  			target.nodes = [node];		// N.B. side effect on target.
  			setsig(target, fns.length - 1);
  		}
  		return target;
  	}
  	
  	function getAutoNodes(n, data){
  		var ns = n.getElementsByTagName('*'),
  			an = [],
  			openLoops = {a:[],l:{}},
  			cspec,
  			isNodeValue,
  			i, ii, j, jj, ni, cs, cj;
  		//for each node found in the template
  		for(i = -1, ii = ns.length; i < ii; i++){
  			ni = i > -1 ?ns[i]:n;
  			if(ni.nodeType === 1 && ni.className !== ''){
  				//when a className is found
  				cs = ni.className.split(' ');
  				// for each className 
  				for(j = 0, jj=cs.length;j<jj;j++){
  					cj = cs[j];
  					// check if it is related to a context property
  					cspec = checkClass(cj, ni.tagName);
  					// if so, store the node, plus the type of data
  					if(cspec !== false){
  						isNodeValue = (/nodevalue/i).test(cspec.attr);
  						if(cspec.sel.indexOf('@') > -1 || isNodeValue){
  							ni.className = ni.className.replace('@'+cspec.attr, '');
  							if(isNodeValue){
  								cspec.attr = false;
  							} 
  						}
  						an.push({n:ni, cspec:cspec});
  					}
  				}
  			}
  		}
  		
  		function checkClass(c, tagName){
  			// read the class
  			var ca = c.match(selRx),
  				attr = ca[3] || autoAttr[tagName],
  				cspec = {prepend:!!ca[1], prop:ca[2], attr:attr, append:!!ca[4], sel:c},
  				i, ii, loopi, loopil, val;
  			// check in existing open loops
  			for(i = openLoops.a.length-1; i >= 0; i--){
  				loopi = openLoops.a[i];
  				loopil = loopi.l[0];
  				val = loopil && loopil[cspec.prop];
  				if(typeof val !== 'undefined'){
  					cspec.prop = loopi.p + '.' + cspec.prop;
  					if(openLoops.l[cspec.prop] === true){
  						val = val[0];
  					}
  					break;
  				}
  			}
  			// not found check first level of data
  			if(typeof val === 'undefined'){
  				val = dataselectfn(cspec.prop)(isArray(data) ? data[0] : data);
  				// nothing found return
  				if(val === ''){
  					return false;
  				}
  			}
  			// set the spec for autoNode
  			if(isArray(val)){
  				openLoops.a.push( {l:val, p:cspec.prop} );
  				openLoops.l[cspec.prop] = true;
  				cspec.t = 'loop';
  			}else{
  				cspec.t = 'str';
  			}
  			return cspec;
  		}
  
  		return an;
  
  	}
  
  	// returns a function that, given a context argument,
  	// will render the template defined by dom and directive.
  	function compiler(dom, directive, data, ans){
  		var fns = [], j, jj, cspec, n, target, nodes, itersel, node, inner, dsel, sels, sel, sl, i, h, parts,  pfns = [], p;
  		// autoRendering nodes parsing -> auto-nodes
  		ans = ans || data && getAutoNodes(dom, data);
  		if(data){
  			// for each auto-nodes
  			while(ans.length > 0){
  				cspec = ans[0].cspec;
  				n = ans[0].n;
  				ans.splice(0, 1);
  				if(cspec.t === 'str'){
  					// if the target is a value
  					target = gettarget(n, cspec, false);
  					setsig(target, fns.length);
  					fns[fns.length] = wrapquote(target.quotefn, dataselectfn(cspec.prop));
  				}else{
  					// if the target is a loop
  					itersel = dataselectfn(cspec.sel);
  					target = gettarget(n, cspec, true);
  					nodes = target.nodes;
  					for(j = 0, jj = nodes.length; j < jj; j++){
  						node = nodes[j];
  						inner = compiler(node, false, data, ans);
  						fns[fns.length] = wrapquote(target.quotefn, loopfn(cspec.sel, itersel, inner));
  						target.nodes = [node];
  						setsig(target, fns.length - 1);
  					}
  				}
  			}
  		}
  		// read directives
  		for(sel in directive){
  			if(directive.hasOwnProperty(sel)){
  				i = 0;
  				dsel = directive[sel];
  				sels = sel.split(/\s*,\s*/); //allow selector separation by quotes
  				sl = sels.length;
  				do{
  					if(typeof(dsel) === 'function' || typeof(dsel) === 'string'){
  						// set the value for the node/attr
  						sel = sels[i];
  						target = gettarget(dom, sel, false);
  						setsig(target, fns.length);
  						fns[fns.length] = wrapquote(target.quotefn, dataselectfn(dsel));
  					}else{
  						// loop on node
  						loopgen(dom, sel, dsel, fns);
  					}
  				}while(++i < sl);
  			}
  		}
          // convert node to a string 
          h = outerHTML(dom);
  		// IE adds an unremovable "selected, value" attribute
  		// hard replace while waiting for a better solution
          h = h.replace(/<([^>]+)\s(value\=""|selected)\s?([^>]*)>/ig, "<$1 $3>");
  		
          // remove attribute prefix
          h = h.split(attPfx).join('');
  
  		// slice the html string at "Sig"
  		parts = h.split( Sig );
  		// for each slice add the return string of 
  		for(i = 1; i < parts.length; i++){
  			p = parts[i];
  			// part is of the form "fn-number:..." as placed there by setsig.
  			pfns[i] = fns[ parseInt(p, 10) ];
  			parts[i] = p.substring( p.indexOf(':') + 1 );
  		}
  		return concatenator(parts, pfns);
  	}
  	// compile the template with directive
  	// if a context is passed, the autoRendering is triggered automatically
  	// return a function waiting the data as argument
  	function compile(directive, ctxt, template){
  		var rfn = compiler( ( template || this[0] ).cloneNode(true), directive, ctxt);
  		return function(context){
  			return rfn({context:context});
  		};
  	}
  	//compile with the directive as argument
  	// run the template function on the context argument
  	// return an HTML string 
  	// should replace the template and return this
  	function render(ctxt, directive){
  		var fn = typeof directive === 'function' && directive, i = 0, ii = this.length;
  		for(; i < ii; i++){
  			this[i] = replaceWith( this[i], (fn || plugins.compile( directive, false, this[i] ))( ctxt, false ));
  		}
  		context = null;
  		return this;
  	}
  
  	// compile the template with autoRender
  	// run the template function on the context argument
  	// return an HTML string 
  	function autoRender(ctxt, directive){
  		var fn = plugins.compile( directive, ctxt, this[0] );
  		for(var i = 0, ii = this.length; i < ii; i++){
  			this[i] = replaceWith( this[i], fn( ctxt, false));
  		}
  		context = null;
  		return this;
  	}
  	
  	function replaceWith(elm, html) {
  		var ne,
  			ep = elm.parentNode,
  			depth = 0;
  		if(!ep){ //if no parents
  			ep = document.createElement('DIV');
  			ep.appendChild(elm);
  		}
  		switch (elm.tagName) {
  			case 'TBODY': case 'THEAD': case 'TFOOT':
  				html = '<TABLE>' + html + '</TABLE>';
  				depth = 1;
  			break;
  			case 'TR':
  				html = '<TABLE><TBODY>' + html + '</TBODY></TABLE>';
  				depth = 2;
  			break;
  			case 'TD': case 'TH':
  				html = '<TABLE><TBODY><TR>' + html + '</TR></TBODY></TABLE>';
  				depth = 3;
  			break;
  		}
  		tmp = document.createElement('SPAN');
  		tmp.style.display = 'none';
  		document.body.appendChild(tmp);
  		tmp.innerHTML = html;
  		ne = tmp.firstChild;
  		while (depth--) {
  			ne = ne.firstChild;
  		}
  		ep.insertBefore(ne, elm);
  		ep.removeChild(elm);
  		document.body.removeChild(tmp);
  		elm = ne;
  
  		ne = ep = null;
  		return elm;
  	}
  
  	return plugins;
  };
  
  $p.plugins = {};
  
  $p.libs = {
  	dojo:function(){
  		if(typeof document.querySelector === 'undefined'){
  			$p.plugins.find = function(n, sel){
  				return dojo.query(sel, n);
  			};
  		}
  	},
  	domassistant:function(){
  		if(typeof document.querySelector === 'undefined'){
  			$p.plugins.find = function(n, sel){
  				return $(n).cssSelect(sel);
  			};
  		}
  		DOMAssistant.attach({ 
  			publicMethods : [ 'compile', 'render', 'autoRender'],
  			compile:function(directive, ctxt){
  				return $p([this]).compile(directive, ctxt);
  			},
  			render:function(ctxt, directive){
  				return $( $p([this]).render(ctxt, directive) )[0];
  			},
  			autoRender:function(ctxt, directive){
  				return $( $p([this]).autoRender(ctxt, directive) )[0];
  			}
  		});
  	},
  	jquery:function(){
  		if(typeof document.querySelector === 'undefined'){
  			$p.plugins.find = function(n, sel){
  				return jQuery(n).find(sel);
  			};
  		}
  		jQuery.fn.extend({
  			directives:function(directive){
  				this._pure_d = directive; return this;
  			},
  			compile:function(directive, ctxt){
  				return $p(this).compile(this._pure_d || directive, ctxt);
  			},
  			render:function(ctxt, directive){
  				return jQuery( $p( this ).render( ctxt, this._pure_d || directive ) );
  			},
  			autoRender:function(ctxt, directive){
  				return jQuery( $p( this ).autoRender( ctxt, this._pure_d || directive ) );
  			}
  		});
  	},
  	mootools:function(){
  		if(typeof document.querySelector === 'undefined'){
  			$p.plugins.find = function(n, sel){
  				return $(n).getElements(sel);
  			};
  		}
  		Element.implement({
  			compile:function(directive, ctxt){ 
  				return $p(this).compile(directive, ctxt);
  			},
  			render:function(ctxt, directive){
  				return $p([this]).render(ctxt, directive);
  			},
  			autoRender:function(ctxt, directive){
  				return $p([this]).autoRender(ctxt, directive);
  			}
  		});
  	},
  	prototype:function(){
  		if(typeof document.querySelector === 'undefined'){
  			$p.plugins.find = function(n, sel){
  				n = n === document ? n.body : n;
  				return typeof n === 'string' ? $$(n) : $(n).select(sel);
  			};
  		}
  		Element.addMethods({
  			compile:function(element, directive, ctxt){ 
  				return $p([element]).compile(directive, ctxt);
  			}, 
  			render:function(element, ctxt, directive){
  				return $p([element]).render(ctxt, directive);
  			}, 
  			autoRender:function(element, ctxt, directive){
  				return $p([element]).autoRender(ctxt, directive);
  			}
  		});
  	},
  	sizzle:function(){
  		if(typeof document.querySelector === 'undefined'){
  			$p.plugins.find = function(n, sel){
  				return Sizzle(sel, n);
  			};
  		}
  	},
  	sly:function(){
  		if(typeof document.querySelector === 'undefined'){  
  			$p.plugins.find = function(n, sel){
  				return Sly(sel, n);
  			};
  		}
  	}
  };
  
  // get lib specifics if available
  (function(){
  	var libkey = 
  		typeof dojo         !== 'undefined' && 'dojo' || 
  		typeof DOMAssistant !== 'undefined' && 'domassistant' ||
  		typeof jQuery       !== 'undefined' && 'jquery' || 
  		typeof MooTools     !== 'undefined' && 'mootools' ||
  		typeof Prototype    !== 'undefined' && 'prototype' || 
  		typeof Sizzle       !== 'undefined' && 'sizzle' ||
  		typeof Sly          !== 'undefined' && 'sly';
  		
  	libkey && $p.libs[libkey]();
  	
  	//for node.js
  	if(typeof exports !== 'undefined'){
  		exports.$p = $p;
  	}
  })();

  provide("pure", module.exports);
  provide("pure", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/utils as ahr2/utils
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint white: false, onevar: true, undef: true, node: true, nomen: true, regexp: false, plusplus: true, bitwise: true, es5: true, newcap: true, maxerr: 5 */
  (function () {
    "use strict";
  
    var utils = exports
      , jsonpRegEx = /\s*([\$\w]+)\s*\(\s*(.*)\s*\)\s*/;
  
    utils.clone = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  
    // useful for extending global options onto a local variable
    utils.extend = function (global, local) {
      //global = utils.clone(global);
      Object.keys(local).forEach(function (key) {
        global[key] = local[key] || global[key];
      });
      return global;
    };
  
    // useful for extending global options onto a local variable
    utils.preset = function (local, global) {
      // TODO copy functions
      // TODO recurse / deep copy
      global = utils.clone(global);
      Object.keys(global).forEach(function (key) {
        if ('undefined' === typeof local[key]) {
          local[key] = global[key];
        }
      });
      return local;
    };
  
    utils.objectToLowerCase = function (obj, recurse) {
      // Make headers all lower-case
      Object.keys(obj).forEach(function (key) {
        var value;
  
        value = obj[key];
        delete obj[key];
        key = key.toLowerCase();
        /*
        if ('string' === typeof value) {
          obj[key] = value.toLowerCase();
        } else {
          obj[key] = value;
        }
        */
        obj[key] = value;
      });
      return obj;
    };
  
    utils.parseJsonp = function (jsonpCallback, jsonp) {
      var match = jsonp.match(jsonpRegEx)
        , data
        , json;
  
      if (!match || !match[1] || !match[2]) {
        throw new Error('No JSONP matched');
      }
      if (jsonpCallback !== match[1]) {
        throw new Error('JSONP callback doesn\'t match');
      }
      json = match[2];
  
      data = JSON.parse(json);
      return data;
    };
  
    utils.uriEncodeObject = function(json) {
      var query = '';
  
      try {
        JSON.parse(JSON.stringify(json));
      } catch(e) {
        return 'ERR_CYCLIC_DATA_STRUCTURE';
      }
  
      if ('object' !== typeof json) {
        return 'ERR_NOT_AN_OBJECT';
      }
  
      Object.keys(json).forEach(function (key) {
        var param, value;
  
        // assume that the user meant to delete this element
        if ('undefined' === typeof json[key]) {
          return;
        }
  
        param = encodeURIComponent(key);
        value = encodeURIComponent(json[key]);
        query += '&' + param;
  
        // assume that the user wants just the param name sent
        if (null !== json[key]) {
          query += '=' + value;
        }
      });
  
      // remove first '&'
      return query.substring(1);
    };
  
    utils.addParamsToUri = function(uri, params) {
      var query
        , anchor = ''
        , anchorpos;
  
      uri = uri || "";
      anchor = '';
      params = params || {};
  
      // just in case this gets used client-side
      if (-1 !== (anchorpos = uri.indexOf('#'))) {
        anchor = uri.substr(anchorpos);
        uri = uri.substr(0, anchorpos);
      }
  
      query = utils.uriEncodeObject(params);
  
      // cut the leading '&' if no other params have been written
      if (query.length > 0) {
        if (!uri.match(/\?/)) {
          uri += '?' + query;
        } else {
          uri += '&' + query;
        }
      }
  
      return uri + anchor;
    };
  }());
  

  provide("ahr2/utils", module.exports);
  provide("ahr2/utils", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/browser/jsonp as ahr2/browser/jsonp
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*
     loadstart;
     progress;
     abort;
     error;
     load;
     timeout;
     loadend;
  */
  (function () {
    "use strict";
  
    function browserJsonpClient(req, res) {
      // TODO check for Same-domain / XHR2/CORS support
      // before attempting to insert script tag
      // Those support headers and such, which are good
      var options = req.userOptions
        , cbkey = options.jsonpCallback
        , script = document.createElement("script")
        , head = document.getElementsByTagName("head")[0] || document.documentElement
        , addParamsToUri =  require('ahr2/utils').addParamsToUri
        , timeout
        , fulfilled; // TODO move this logic elsewhere into the emitter
  
      // cleanup: cleanup window and dom
      function cleanup() {
        fulfilled = true;
        window[cbkey] = undefined;
        try {
          delete window[cbkey];
          // may have already been removed
          head.removeChild(script);
        } catch(e) {}
      }
  
      function abortRequest() {
        req.emit('abort');
        cleanup();
      }
  
      function abortResponse() {
        res.emit('abort');
        cleanup();
      }
  
      function prepareResponse() {
        // Sanatize data, Send, Cleanup
        function onSuccess(data) {
          var ev = {
            lengthComputable: false,
            loaded: 1,
            total: 1
          };
          if (fulfilled) {
            return;
          }
  
          clearTimeout(timeout);
          res.emit('loadstart', ev);
          // sanitize
          data = JSON.parse(JSON.stringify(data));
          res.emit('progress', ev);
          ev.target = { result: data };
          res.emit('load', ev);
          cleanup();
        }
  
        function onTimeout() {
          res.emit('timeout', {});
          res.emit('error', new Error('timeout'));
          cleanup();
        }
  
        window[cbkey] = onSuccess;
        // onError: Set timeout if script tag fails to load
        if (options.timeout) {
          timeout = setTimeout(onTimeout, options.timeout);
        }
      }
  
      function makeRequest() {
        var ev = {}
          , jsonp = {};
  
        function onError(ev) {
          res.emit('error', ev);
        }
  
        // ?search=kittens&jsonp=jsonp123456
        jsonp[options.jsonp] = options.jsonpCallback;
        options.href = addParamsToUri(options.href, jsonp);
  
        // Insert JSONP script into the DOM
        // set script source to the service that responds with thepadded JSON data
        req.emit('loadstart', ev);
        try {
          script.setAttribute("type", "text/javascript");
          script.setAttribute("async", "async");
          script.setAttribute("src", options.href);
          // Note that this only works in some browsers,
          // but it's better than nothing
          script.onerror = onError;
          head.insertBefore(script, head.firstChild);
        } catch(e) {
          req.emit('error', e);
        }
  
        // failsafe cleanup
        setTimeout(cleanup, 2 * 60 * 1000);
        // a moot point since the "load" occurs so quickly
        req.emit('progress', ev);
        req.emit('load', ev);
      }
  
      setTimeout(makeRequest, 0);
      req.abort = abortRequest;
      res.abort = abortResponse;
      prepareResponse();
  
      return res;
    }
  
    module.exports = browserJsonpClient;
  }());
  

  provide("ahr2/browser/jsonp", module.exports);
  provide("ahr2/browser/jsonp", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/options as ahr2/options
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  (function () {
    "use strict";
  
    var globalOptions
      , ahrOptions = exports
      , url = require('url')
      , querystring = require('querystring')
      , File = require('File')
      , FileList = require('FileList')
      , btoa = require('btoa')
      , utils =  require('ahr2/utils')
      , location
      , uriEncodeObject
      , clone
      , preset
      , objectToLowerCase
      ;
  
    /*
     * Some browsers don't yet have support for FormData.
     * This isn't a real fix, but it stops stuff from crashing.
     * 
     * This should probably be replaced with a real FormData impl, but whatever.
     */
    function FormData() {
    }
    
    try {
      FormData = require('FormData');
    } catch (e) {
      console.warn('FormData does not exist; using a NOP instead');
    }
  
    // TODO get the "root" dir... somehow
    try {
      location = require('./location');
    } catch(e) {
      location = require('location');
    }
  
    uriEncodeObject = utils.uriEncodeObject;
    clone = utils.clone;
    preset = utils.preset;
    objectToLowerCase = utils.objectToLowerCase;
  
    globalOptions = {
      ssl: false,
      method: 'GET',
      headers: {
        //'accept': "application/json; charset=utf-8, */*; q=0.5"
      },
      redirectCount: 0,
      redirectCountMax: 5,
      // contentType: 'json',
      // accept: 'json',
      followRedirect: true,
      timeout: 20000
    };
  
  
    //
    // Manage global options while keeping state safe
    //
    ahrOptions.globalOptionKeys = function () {
      return Object.keys(globalOptions);
    };
  
    ahrOptions.globalOption = function (key, val) {
      if ('undefined' === typeof val) {
        return globalOptions[key];
      }
      if (null === val) {
        val = undefined;
      }
      globalOptions[key] = val;
    };
  
    ahrOptions.setGlobalOptions = function (bag) {
      Object.keys(bag).forEach(function (key) {
        globalOptions[key] = bag[key];
      });
    };
  
  
    /*
     * About the HTTP spec and which methods allow bodies, etc:
     * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
     */
    function checkBodyAllowed(options) {
      var method = options.method.toUpperCase();
      if ('HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method) {
        return true;
      }
      if (options.body && !options.forceAllowBody) {
        throw new Error("The de facto standard is that '" + method + "' should not have a body.\n" +
          "Most web servers just ignore it. Please use 'query' rather than 'body'.\n" +
          "Also, you may consider filing this as a bug - please give an explanation.\n" +
          "Finally, you may allow this by passing { forceAllowBody: 'true' } ");
      }
      if (options.body && options.jsonp) {
        throw new Error("The de facto standard is that 'jsonp' should not have a body (and I don't see how it could have one anyway).\n" +
          "If you consider filing this as a bug please give an explanation.");
      }
    }
  
  
    /*
      Node.js
  
      > var url = require('url');
      > var urlstring = 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash';
      > url.parse(urlstring, true);
      { href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
        protocol: 'http:',
        host: 'user:pass@host.com:8080',
        auth: 'user:pass',
        hostname: 'host.com',
        port: '8080',
        pathname: '/p/a/t/h',
        search: '?query=string',
        hash: '#hash',
  
        slashes: true,
        query: {'query':'string'} } // 'query=string'
    */
  
    /*
      Browser
  
        href: "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
        protocol: "http:" 
        host: "host.com:8080"
        hostname: "host.com"
        port: "8080"
        pathname: "/p/a/t/h"
        search: '?query=string',
        hash: "#hash"
  
        origin: "http://host.com:8080"
     */
  
    function handleUri(options) {
      var presets
        , urlObj
        ;
  
      presets = clone(globalOptions);
  
      if (!options) {
        throw new Error('ARe yOu kiddiNg me? You have to provide some sort of options');
      }
  
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
      if (options.uri || options.url) {
        console.log('Use `options.href`. `options.url` and `options.uri` are obsolete');
        options.href = options.href || options.url || options.url;
      }
      if (options.params) {
        console.log('Use `options.query`. `options.params` is obsolete');
        options.query = options.query || options.params;
      }
  
  
      //
      // pull `urlObj` from `options`
      //
      if (options.href) {
        urlObj = url.parse(options.href, true, true);
        // ignored anyway
        delete urlObj.href;
        // these trump other options
        delete urlObj.host;
        delete urlObj.search;
      } else {
        urlObj = {
            protocol: options.protocol || location.protocol
        //  host trumps auth, hostname, and port
          , host: options.host
          , auth: options.auth
          , hostname: options.hostname || location.hostname
          , port: options.port || location.port
          , pathname: url.resolve(location.pathname, options.pathname || '') || '/'
        // search trumps query
        //, search: options.search
          , query: options.query || querystring.parse(options.search||"")
          , hash: options.hash
        };
      }
      delete options.href;
      delete options.host;
      delete options.auth;
      delete options.hostname;
      delete options.port;
      delete options.path;
      delete options.search;
      delete options.query;
      delete options.hash;
  
      // Use SSL if desired
      if ('https:' === urlObj.protocol || '443' === urlObj.port || true === options.ssl) {
        options.ssl = true;
        urlObj.port = urlObj.port || '443';
        // hopefully no one would set prt 443 to standard http
        urlObj.protocol = 'https:';
      }
  
      if ('tcp:' === urlObj.protocol || 'tcps:' === urlObj.protocol || 'udp:' === urlObj.protocol) {
        options.method = options.method || 'POST';
      }
  
      if (!options.method && (options.body || options.encodedBody)) {
        options.method = 'POST';
      }
  
      if (options.jsonp) {
        // i.e. /path/to/res?x=y&jsoncallback=jsonp8765
        // i.e. /path/to/res?x=y&json=jsonp_ae75f
        options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
        options.dataType = 'jsonp';
        urlObj.query[options.jsonp] = options.jsonpCallback;
      }
  
      // for the sake of the browser, but it doesn't hurt node
      if (!urlObj.auth && options.username && options.password) {
        urlObj.auth = options.username + ':' + options.password;
      } else if (urlObj.auth) {
        urlObj.username = urlObj.auth.split(':')[0];
        urlObj.password = urlObj.auth.split(':')[1];
      }
  
      urlObj.href = url.format(urlObj);
      urlObj = url.parse(urlObj.href, true, true);
  
      preset(options, presets);
      preset(options, urlObj);
      options.syncback = options.syncback || function () {};
  
      return options;
    }
  
    function handleHeaders(options) {
      var presets
        , ua
        ;
  
      presets = clone(globalOptions);
  
      options.headers = options.headers || {};
      if (options.jsonp) {
        options.headers.accept = "text/javascript";
      }
      // TODO user-agent should retain case
      options.headers = objectToLowerCase(options.headers || {});
      options.headers = preset(options.headers, presets.headers);
      // TODO port?
      options.headers.host = options.hostname;
      options.headers = objectToLowerCase(options.headers);
      if (options.contentType) {
        options.headers['content-type'] = options.contentType;
      }
  
      // for the sake of node, but it doesn't hurt the browser
      if (options.auth) {
        options.headers.authorization = 'Basic ' + btoa(options.auth);
      }
  
      return options;
    }
  
    function hasFiles(body, formData) {
      var hasFile = false;
      if ('object' !== typeof body) {
        return false;
      }
      Object.keys(body).forEach(function (key) {
        var item = body[key];
        if (item instanceof File) {
          hasFile = true;
        } else if (item instanceof FileList) {
          hasFile = true;
        }
      });
      return hasFile;
    }
    function addFiles(body, formData) {
  
      Object.keys(body).forEach(function (key) {
        var item = body[key];
  
        if (item instanceof File) {
          formData.append(key, item);
        } else if (item instanceof FileList) {
          item.forEach(function (file) {
            formData.append(key, file);
          });
        } else {
          formData.append(key, item);
        }
      });
    }
  
    // TODO convert object/map body into array body
    // { "a": 1, "b": 2 } --> [ "name": "a", "value": 1, "name": "b", "value": 2 ]
    // this would be more appropriate and in better accordance with the http spec
    // as it allows for a value such as "a" to have multiple values rather than
    // having to do "a1", "a2" etc
    function handleBody(options) {
      function bodyEncoder() {
        checkBodyAllowed(options);
  
        if (options.encodedBody) {
          return;
        }
  
        //
        // Check for HTML5 FileApi files
        //
        if (hasFiles(options.body)) {
          options.encodedBody = new FormData(); 
          addFiles(options.body, options.encodedBody);
        }
        if (options.body instanceof FormData) {
          options.encodedBody = options.body;
        }
        if (options.encodedBody instanceof FormData) {
            // TODO: is this necessary? This breaks in the browser
  //        options.headers["content-type"] = "multipart/form-data";
          return;
        }
  
        if ('string' === typeof options.body) {
          options.encodedBody = options.body;
        }
  
        if (!options.headers["content-type"]) {
          //options.headers["content-type"] = "application/x-www-form-urlencoded";
          options.headers["content-type"] = "application/json";
        }
  
        if (!options.encodedBody) {
          if (options.headers["content-type"].match(/application\/json/) || 
              options.headers["content-type"].match(/text\/javascript/)) {
            options.encodedBody = JSON.stringify(options.body);
          } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
              options.encodedBody = uriEncodeObject(options.body);
          }
  
          if (!options.encodedBody) {
            throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
          }
  
          options.headers["content-length"] = options.encodedBody.length;
        }
      }
  
      function removeContentBodyAndHeaders() {
        if (options.body) {
          throw new Error('You gave a body for one of HEAD, GET, DELETE, or OPTIONS');
        }
  
        options.encodedBody = "";
        options.headers["content-type"] = undefined;
        options.headers["content-length"] = undefined;
        options.headers["transfer-encoding"] = undefined;
        delete options.headers["content-type"];
        delete options.headers["content-length"];
        delete options.headers["transfer-encoding"];
      }
  
      if ('file:' === options.protocol) {
        options.header = undefined;
        delete options.header;
        return;
      }
  
      // Create & Send body
      // TODO support streaming uploads
      options.headers["transfer-encoding"] = undefined;
      delete options.headers["transfer-encoding"];
  
      if (options.body || options.encodedBody) {
        bodyEncoder(options);
      } else { // no body || body not allowed
        removeContentBodyAndHeaders(options);
      }
    }
  
    ahrOptions.handleOptions = function (options) {
      handleUri(options);
      handleHeaders(options);
      handleBody(options);
  
      return options;
    };
  }());
  

  provide("ahr2/options", module.exports);
  provide("ahr2/options", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2/browser as ahr2/browser
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  // This module is meant for modern browsers. Not much abstraction or 1337 majic
  (function (undefined) {
    "use strict";
  
    var url //= require('url')
      , browserJsonpClient =  require('ahr2/browser/jsonp')
      , triedHeaders = {}
      , nativeHttpClient
      , globalOptions
      , restricted
      , debug = false
      ; // TODO underExtend localOptions
  
    // Restricted Headers
    // http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method
    restricted = [
        "Accept-Charset"
      , "Accept-Encoding"
      , "Connection"
      , "Content-Length"
      , "Cookie"
      , "Cookie2"
      , "Content-Transfer-Encoding"
      , "Date"
      , "Expect"
      , "Host"
      , "Keep-Alive"
      , "Referer"
      , "TE"
      , "Trailer"
      , "Transfer-Encoding"
      , "Upgrade"
      , "User-Agent"
      , "Via"
    ];
    restricted.forEach(function (val, i, arr) {
      arr[i] = val.toLowerCase();
    });
  
    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }
    if (window.XDomainRequest) {
      // TODO fix IE's XHR/XDR to act as normal XHR2
      // check if the location.host is the same (name, port, not protocol) as origin
    }
  
  
    function encodeData(options, xhr2) {
      var data
        , ct = options.overrideResponseType || xhr2.getResponseHeader("content-type") || ""
        , text
        , len
        ;
  
      ct = ct.toLowerCase();
  
      if (xhr2.responseType && xhr2.response) {
        text = xhr2.response;
      } else {
        text = xhr2.responseText;
      }
  
      len = text.length;
  
      if ('binary' === ct) {
        if (window.ArrayBuffer && xhr2.response instanceof window.ArrayBuffer) {
          return xhr2.response;
        }
  
        // TODO how to wrap this for the browser and Node??
        if (options.responseEncoder) {
          return options.responseEncoder(text);
        }
  
        // TODO only Chrome 13 currently handles ArrayBuffers well
        // imageData could work too
        // http://synth.bitsnbites.eu/
        // http://synth.bitsnbites.eu/play.html
        // var ui8a = new Uint8Array(data, 0);
        var i
          , ui8a = Array(len)
          ;
  
        for (i = 0; i < text.length; i += 1) {
          ui8a[i] = (text.charCodeAt(i) & 0xff);
        }
  
        return ui8a;
      }
  
      if (ct.indexOf("xml") >= 0) {
        return xhr2.responseXML;
      }
  
      if (ct.indexOf("jsonp") >= 0 || ct.indexOf("javascript") >= 0) {
        console.log("forcing of jsonp not yet supported");
        return text;
      }
  
      if (ct.indexOf("json") >= 0) {
        try {
          data = JSON.parse(text);
        } catch(e) {
          data = text;
        }
        return data;
      }
  
      return xhr2.responseText;
    }
  
    function browserHttpClient(req, res) {
      var options = req.userOptions
        , xhr2
        , xhr2Request
        , timeoutToken
        ;
  
      function onTimeout() {
        req.emit("timeout", new Error("timeout after " + options.timeout + "ms"));
      }
  
      function resetTimeout() {
        clearTimeout(timeoutToken);
        timeoutToken = setTimeout(onTimeout, options.timeout);
      }
  
      function sanatizeHeaders(header) {
        var value = options.headers[header]
          , headerLc = header.toLowerCase()
          ;
  
        // only warn the user once about bad headers
        if (-1 !== restricted.indexOf(header.toLowerCase())) {
          if (!triedHeaders[headerLc]) {
            console.warn('Ignoring all attempts to set restricted header ' + header + '. See (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)');
          }
          triedHeaders[headerLc] = true;
          return;
        }
  
        try {
          // throws INVALID_STATE_ERROR if called before `open()`
          xhr2.setRequestHeader(header, value);
        } catch(e) {
          console.error('failed to set header: ' + header);
          console.error(e);
        }
      }
  
      // A little confusing that the request object gives you
      // the response handlers and that the upload gives you
      // the request handlers, but oh well
      xhr2 = new XMLHttpRequest();
      xhr2Request = xhr2.upload;
  
      /* Proper States */
      xhr2.addEventListener('loadstart', function (ev) {
          // this fires when the request starts,
          // but shouldn't fire until the request has loaded
          // and the response starts
          req.emit('loadstart', ev);
          resetTimeout();
      }, true);
      xhr2.addEventListener('progress', function (ev) {
          if (!req.loaded) {
            req.loaded = true;
            req.emit('progress', {});
            req.emit('load', {});
          }
          if (!res.loadstart) {
            res.headers = xhr2.getAllResponseHeaders();
            res.loadstart = true;
            res.emit('loadstart', ev);
          }
          res.emit('progress', ev);
          resetTimeout();
      }, true);
      xhr2.addEventListener('load', function (ev) {
        if (xhr2.status >= 400) {
          ev.error = new Error(xhr2.status);
        }
        ev.target.result = encodeData(options, xhr2);
        res.emit('load', ev);
      }, true);
      /*
      xhr2Request.addEventListener('loadstart', function (ev) {
        req.emit('loadstart', ev);
        resetTimeout();
      }, true);
      */
      xhr2Request.addEventListener('load', function (ev) {
        resetTimeout();
        req.loaded = true;
        req.emit('load', ev);
        res.loadstart = true;
        res.emit('loadstart', {});
      }, true);
      xhr2Request.addEventListener('progress', function (ev) {
        resetTimeout();
        req.emit('progress', ev);
      }, true);
  
  
      /* Error States */
      xhr2.addEventListener('abort', function (ev) {
        res.emit('abort', ev);
      }, true);
      xhr2Request.addEventListener('abort', function (ev) {
        req.emit('abort', ev);
      }, true);
      xhr2.addEventListener('error', function (ev) {
        res.emit('error', ev);
      }, true);
      xhr2Request.addEventListener('error', function (ev) {
        req.emit('error', ev);
      }, true);
      // the "Request" is what timeouts
      // the "Response" will timeout as well
      xhr2.addEventListener('timeout', function (ev) {
        req.emit('timeout', ev);
      }, true);
      xhr2Request.addEventListener('timeout', function (ev) {
        req.emit('timeout', ev);
      }, true);
  
      /* Cleanup */
      res.on('loadend', function () {
        // loadend is managed by AHR
        req.status = xhr2.status;
        res.status = xhr2.status;
        clearTimeout(timeoutToken);
      });
  
      if (options.username) {
        xhr2.open(options.method, options.href, true, options.username, options.password);
      } else {
        xhr2.open(options.method, options.href, true);
      }
  
      Object.keys(options.headers).forEach(sanatizeHeaders);
  
      setTimeout(function () {
        if ('binary' === options.overrideResponseType) {
          xhr2.overrideMimeType("text/plain; charset=x-user-defined");
          xhr2.responseType = 'arraybuffer';
        }
        try {
          xhr2.send(options.encodedBody);
        } catch(e) {
          req.emit('error', e);
        }
      }, 1);
      
  
      req.abort = function () {
        xhr2.abort();
      };
      res.abort = function () {
        xhr2.abort();
      };
  
      res.browserRequest = xhr2;
      return res;
    }
  
    function send(req, res) {
      var options = req.userOptions;
      // TODO fix this ugly hack
      url = url || require('url');
      if (options.jsonp && options.jsonpCallback) {
        return browserJsonpClient(req, res);
      }
      return browserHttpClient(req, res);
    }
  
    module.exports = send;
  }());
  

  provide("ahr2/browser", module.exports);
  provide("ahr2/browser", module.exports);
  $.ender(module.exports);
}(global));

// ender:ahr2 as ahr2
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  /*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
  (function () {
    "use strict";
  
    var EventEmitter = require('events').EventEmitter
      , Future = require('future')
      , Join = require('join')
      , ahrOptions
      , nextTick
      , utils
      , preset
      ;
  
    function nextTick(fn, a, b, c, d) {
      try {
        process.nextTick(fn, a, b, c, d);
      } catch(e) {
        setTimeout(fn, 0, a, b, c, d);
      }
    }
  
    ahrOptions =  require('ahr2/options');
    utils =  require('ahr2/utils');
    
    preset = utils.preset;
  
    // The normalization starts here!
    function NewEmitter() {
      var emitter = new EventEmitter()
        , promise = Future()
        , ev = {
              lengthComputable: false
            , loaded: 0
            , total: undefined
          };
  
      function loadend(ev, errmsg) {
        ev.error = ev.error || errmsg && new Error(errmsg);
        nextTick(function () {
          emitter.emit('loadend', ev);
        });
      }
  
      emitter.done = 0;
  
      // any error in the quest causes the response also to fail
      emitter.on('loadend', function (ev) {
        emitter.done += 1;
  
        if (emitter.done > 1) {
          console.warn('loadend called ' + emitter.done + ' times');
          return;
        }
  
        // in FF this is only a getter, setting is not allowed
        if (!ev.target) {
          ev.target = {};
        }
  
        promise.fulfill(emitter.error || ev.error, emitter, ev.target.result, ev.error ? false : true);
      });
  
      emitter.on('timeout', function (ev) {
        if (!emitter.error) {
          emitter.error = ev;
          loadend(ev, 'timeout');
        }
      });
  
      emitter.on('abort', function (ev) {
        if (!emitter.error) {
          loadend(ev, 'abort');
        }
      });
  
      emitter.on('error', function (err, evn) {
        // TODO rethrow the error if there are no listeners (incl. promises)
        //if (respEmitter.listeners.loadend) {}
  
        emitter.error = err;
        ev.error = err;
        if (evn) {
          ev.lengthComputable = evn.lengthComputable || true;
          ev.loaded = evn.loaded || 0;
          ev.total = evn.total;
        }
        if (!emitter.error) {
          loadend(ev);
        }
      });
  
      // TODO there can actually be multiple load events per request
      // as is the case with mjpeg, streaming media, and ad-hoc socket-ish things
      emitter.on('load', function (evn) {
        // ensure that `loadend` is after `load` for all interested parties
        loadend(evn);
      });
  
      // TODO 3.0 remove when
      emitter.when = promise.when;
  
      return emitter;
    }
  
  
    //
    // Emulate `request`
    //
    function ahr(options, callback) {
      var NativeHttpClient
        , req = NewEmitter()
        , res = NewEmitter()
        ;
  
      res.request = req.request = req;
      req.response = res.response = res;
  
      if (callback || options.callback) {
        // TODO 3.0 remove when
        return ahr(options).when(callback);
      }
  
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      ahrOptions.handleOptions(options);
  
      // todo throw all the important properties in the request
      req.userOptions = options;
      // in the browser tradition
      res.upload = req;
  
      // if the request fails, then the response must also fail
      req.on('error', function (err, ev) {
        if (!res.error) {
          res.emit('error', err, ev);
        }
      });
      req.on('timeout', function (ev) {
        if (!res.error) {
          res.emit('timeout', ev);
        }
      });
  
      try {
        // tricking pakmanager to ignore the node stuff
        var client = './node';
        NativeHttpClient = require(client);
      } catch(e) {
        NativeHttpClient =  require('ahr2/browser');
      }
  
      return NativeHttpClient(req, res);
    };
    ahr.globalOptionKeys = ahrOptions.globalOptionKeys;
    ahr.globalOption = ahrOptions.globalOption;
    ahr.setGlobalOptions = ahrOptions.setGlobalOptions;
    ahr.handleOptions = ahrOptions.handleOptions;
  
  
    // TODO 3.0 remove join
    ahr.join = Join;
  
  
    //
    //
    // All of these convenience methods are safe to cut if needed to save kb
    //
    //
    function allRequests(method, href, query, body, jsonp, options, callback) {
      options = options || {};
  
      if (method) { options.method = method; }
      if (href) { options.href = href; }
      if (jsonp) { options.jsonp = jsonp; }
  
      if (query) { options.query = preset((query || {}), (options.query || {})) }
      if (body) { options.body = body; }
  
      return ahr(options, callback);
    }
  
    ahr.http = ahr;
    ahr.file = ahr;
    // TODO copy the jquery / reqwest object syntax
    // ahr.ajax = ahr;
  
    // HTTP jQuery-like body-less methods
    ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
      verb = verb.toLowerCase();
      ahr[verb] = function (href, query, options, callback) {
        return allRequests(verb, href, query, undefined, undefined, options, callback);
      };
    });
  
    // Correcting an oversight of jQuery.
    // POST and PUT can have both query (in the URL) and data (in the body)
    ['POST', 'PUT'].forEach(function (verb) {
      verb = verb.toLowerCase();
      ahr[verb] = function (href, query, body, options, callback) {
        return allRequests(verb, href, query, body, undefined, options, callback);
      };
    });
  
    // JSONP
    ahr.jsonp = function (href, jsonp, query, options, callback) {
      if (!jsonp || 'string' !== typeof jsonp) {
        throw new Error("'jsonp' is not an optional parameter.\n" +
          "If you believe that this should default to 'callback' rather" +
          "than throwing an error, please file a bug");
      }
  
      return allRequests('GET', href, query, undefined, jsonp, options, callback);
    };
  
    // HTTPS
    ahr.https = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.ssl = true;
      options.protocol = "https:";
  
      return ahr(options, callback);
    };
  
    ahr.tcp = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.protocol = "tcp:";
  
      return ahr(options, callback);
    };
  
    ahr.udp = function (options, callback) {
      if ('string' === typeof options) {
        options = {
          href: options
        };
      }
  
      options.protocol = "udp:";
  
      return ahr(options, callback);
    };
  
    module.exports = ahr;
  }());
  

  provide("ahr2", module.exports);
  provide("ahr2", module.exports);
  $.ender(module.exports);
}(global));

// ender:gitscrum-browser/lgitscrum as gitscrum-browser/lgitscrum
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
  (function () {
    "use strict";
  
    var gitscrum = module.exports
      , request = require('ahr2')
      , $ = require('ender')
      , localStorage = require('localStorage')
      , JsonStorage = require('json-storage')
      , store = JsonStorage(localStorage, 'gitscrum')
      , forEachAsync = require('forEachAsync')
      , pure = require('pure').$p
      , issueDirective = {
            ".js-issue": {
                "issue<-": {
                    "@data-issue-id": "issue.id"
                  , ".js-title": function (v) {
                      return v.item.title.replace('<', '&lt;');
                    }
                  , ".js-link@href": "issue.html_url"
                  , ".js-number": "issue.number"
                  , ".js-body": function (v) {
                      return v.item.body.replace('<', '&lt;');
                    }
                }
            }
        }
      , labelDirective = {
            ".js-label": {
                "label<-": {
                    "@data-label-name": "label.name"
                  , ".js-name": function (v) {
                      return v.item[0].name; //.name.replace('<', '&lt;');
                    }
                  , "@style": function (v) {
                      return 'border-color: #' + v.item[0].color + ';';
                    }
                }
            }
        }
      , repoDirective = {
            ".js-repo": {
                "repo<-": {
                    "@data-repo-name": "repo.name"
                  , ".js-name": function (v) {
                      return v.item.name.replace('<', '&lt;');
                    }
                }
            }
        }
      , assigneeDirective = {
            ".js-assignee": {
                "assignee<-": {
                    "@data-assignee-login": "assignee.login"
                  , ".js-login": "assignee.login"
                  , ".js-photo@src": "assignee.avatar_url"
                }
            }
        }
      , auth
      , githubOrg
      , issueTplFn
      , labelTplFn
      , repoTplFn
      , assigneeTplFn
      ;
  
    gitscrum.repos = [];
    gitscrum.issues = [];
    gitscrum.labels = [];
    gitscrum.assignees = [];
  
    function templateIssues() {
      var labelMap = {}
        , labelReduced = {}
        , assigneeMap = {}
        ;
  
      gitscrum.issues.forEach(function (issue) {
        if (issue.assignee) {
          assigneeMap[issue.assignee.login] = issue.assignee;
        }
        issue.labels.forEach(function (label) {
          labelMap[label.url.replace(/.*\/repos\//, '')] = label;
        });
      });
  
      Object.keys(assigneeMap).forEach(function (key) {
        gitscrum.assignees.push(assigneeMap[key]);
      });
  
      Object.keys(labelMap).forEach(function (key) {
        var val = labelMap[key]
          , name = val.name
          , label = labelReduced[name] || []
          ;
  
        labelReduced[name] = label;
        label.push(val);
      });
      Object.keys(labelReduced).forEach(function (key) {
        gitscrum.labels.push(labelReduced[key]);
      });
  
      pure("#js-issues").render(gitscrum.issues, issueTplFn);
      pure("#js-labels").render(gitscrum.labels, labelTplFn);
      pure("#js-repos").render(gitscrum.repos, repoTplFn);
      pure("#js-assignees").render(gitscrum.assignees, assigneeTplFn);
    }
  
    function createOrgGetter(thingyName, thingyArr) {
      function getGithubRepoThings(next, repo) {
        var url = "/repos/" + githubOrg + "/" + repo.name + "/" + thingyName + "?per_page=100"
          , storedArr = store.get(url)
          ;
  
        // TODO needs expiry time
        if (storedArr) {
          storedArr.forEach(function (item) {
            thingyArr.push(item);
          });
          next();
          return;
        }
  
        function eatThingyArr(err, ahr, data) {
          if (err) {
            console.error(url);
            console.error(err);
          }
          console.log(thingyName + ' for ' + repo.name + ':');
          // preserving the original ref
          data.forEach(function (datum) {
            thingyArr.push(datum);
          });
          store.set(url, data);
          next();
        }
  
        request.get("https://" + auth  + "@api.github.com" + url).when(eatThingyArr);
      }
  
      return getGithubRepoThings;
    }
  
    function getGithubOrgLabels() {
      // forEachAsync(gitscrum.repos, getGithubRepoIssues).then(templateIssues);
    }
  
    function getGithubOrgIssues() {
      forEachAsync(gitscrum.repos, createOrgGetter('issues', gitscrum.issues)).then(templateIssues);
    }
  
    /*
    function getGithubOrgRepos() {
      var url = "/orgs/" + githubOrg + "/repos"
        ;
  
      request.get("https://" + auth  + "@api.github.com" + url)
        .when(function (err, ahr, data) {
          if (err) {
            console.log('error with issues');
            return;
          }
          console.log('organizational issues');
          console.log(data);
  
          getGithubOrgIssues();
        });
        ;
    }
    */
  
    function getGithubOrgRepos(user, pass) {
      var url = "/orgs/" + githubOrg + "/repos"
        ;
  
      function showLoginStatus(err, ahr, data) {
        if (err) {
          store.remove('user');
          store.remove('pass');
          store.remove('org');
          store.remove(url);
          alert('error with login');
          return;
        }
  
        store.set('user', user);
        store.set('pass', pass);
        store.set('org', githubOrg);
  
        gitscrum.repos = data;
        store.set(url, gitscrum.repos);
  
        getGithubOrgIssues();
      }
  
      gitscrum.repos = store.get(url);
  
      ///*
      if (gitscrum.repos && gitscrum.repos.length) {
        console.log(gitscrum.repos);
        getGithubOrgIssues();
        return;
      }
      //*/
  
      auth = user + ':' + pass;
  
      //request.get("https://" + auth  + "@api.github.com/users/" + user).when(showLoginStatus);
      request.get("https://" + auth  + "@api.github.com" + url)
        .when(showLoginStatus)
        ;
    }
  
    function showBody(ev) {
      console.log('el', this);
      var id = this.dataset.issueId
        ;
  
      console.log('issue-id', id);
      $("[data-issue-id=" + id + "]").find('.js-body').toggleClass('hidden');
    }
  
    function filterAll() {
      $('.js-issue').removeClass('hidden');
      filterBySearch();
      filterByLabel();
      filterByRepo();
      filterByAssignee();
    }
  
    function selectKeyword() {
      filterAll();
    }
  
    function escapeRegExp(str) {
      return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
  
    function filterBySearch() {
      var keyword = $('#js-search-issues .js-keyword').val().trim()
        ;
  
      function hideClosed(issue) {
        if (issue.closed_at) {
          $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
        }
      }
  
      function matchesKeyword(issue) {
        if (!keyword.exec(issue.title) && !keyword.exec(issue.body)) {
          $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
        }
      }
  
      if (!keyword) {
        gitscrum.issues.forEach(hideClosed);
        return;
      }
  
      if ('/' === keyword[0] && '/' === keyword[keyword.length - 1]) {
        keyword = keyword.substr(1, keyword.length - 2);
      } else {
        keyword = escapeRegExp(keyword);
      }
      keyword = new RegExp(keyword, 'i');
  
      gitscrum.issues.forEach(matchesKeyword);
    }
  
    function filterByAssignee() {
      var assignees = []
        , selectedAssignees = $('.js-assignee[data-selected="selected"]')
        ;
  
      if (!selectedAssignees.length) {
        return;
      }
  
      selectedAssignees.forEach(function (el) {
        var login = $(el)[0].dataset.assigneeLogin;
        // TODO fix the bug causing the assignee name to be missing
        login = login || $(el).find('.js-login').text();
        assignees.push(login);
      });
  
      console.log('filterByAssigneeNames:', assignees);
      gitscrum.issues.forEach(function (issue) {
        var hasAssignee
          ;
  
        console.log(issue);
        hasAssignee = assignees.some(function (name) {
          var assignee = issue.assignee
            ;
          
          return assignee && (-1 !== assignees.indexOf(assignee.login));
        });
  
        if (!hasAssignee) {
          $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
        }
      });
    }
  
    function filterByRepo() {
      var repos = []
        , selectedRepos = $('.js-repo[data-selected="selected"]')
        ;
  
      if (!selectedRepos.length) {
        return;
      }
  
      selectedRepos.forEach(function (el) {
        var name = $(el)[0].dataset.repoName;
        // TODO fix the bug causing the repo name to be missing
        name = name || $(el).find('.js-name').text();
        repos.push(name);
      });
  
      console.log('filterByRepoNames:', repos);
      gitscrum.issues.forEach(function (issue) {
        var hasRepo
          ;
  
        console.log(issue);
        hasRepo = repos.some(function (name) {
          var repo = issue.url.match(/https:\/\/api\.github\.com\/repos\/(.*)\/(.*)\/issues\/(\d+)/)[2]
            ;
          
          return -1 !== repos.indexOf(repo);
        });
  
        if (!hasRepo) {
          $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
        }
      });
    }
  
    function filterByLabel() {
      var labels = []
        , selectedLabels = $('.js-label[data-selected="selected"]')
        ;
  
      if (!selectedLabels.length) {
        return;
      }
  
      selectedLabels.forEach(function (el) {
        var name = $(el)[0].dataset.labelName;
        // TODO fix the bug causing the label name to be missing
        name = name || $(el).find('.js-name').text();
        // we know we don't have duplicate labels
        console.log(name);
        labels.push(name);
      });
  
      gitscrum.issues.forEach(function (issue) {
        var hasLabel
          ;
  
        hasLabel = issue.labels.some(function (label) {
          return -1 !== labels.indexOf(label.name);
        });
  
        if (!hasLabel) {
          $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
        }
      });
    }
  
    function selectLabel() {
      var label = $(this);
      if (!label[0].dataset.selected) {
        label.css('background-color', label.css('border-color'));
        label.css('border-color', '');
        label[0].dataset.selected = 'selected';
        label.find('.js-unselect').removeClass('hidden');
      } else {
        label.css('border-color', label.css('background-color'));
        label.css('background-color', '');
        label[0].dataset.selected = '';
        label.find('.js-unselect').addClass('hidden');
      }
  
      filterAll();
    }
  
    function selectAssignee() {
      var assignee = $(this)
        ;
  
      if (!assignee[0].dataset.selected) {
        assignee.css('background-color', '#ffef74');
        assignee.css('border-color', '');
        assignee[0].dataset.selected = 'selected';
        assignee.find('.js-unselect').removeClass('hidden');
      } else {
        assignee.css('border-color', '#ffef74');
        assignee.css('background-color', null);
        assignee[0].dataset.selected = '';
        assignee.find('.js-unselect').addClass('hidden');
      }
  
      filterAll();
    }
  
    function selectRepo() {
      var repo = $(this)
        ;
  
      if (!repo[0].dataset.selected) {
        repo.css('background-color', 'gray');
        repo.css('border-color', '');
        repo[0].dataset.selected = 'selected';
        repo.find('.js-unselect').removeClass('hidden');
      } else {
        repo.css('border-color', '');
        repo.css('background-color', null);
        repo[0].dataset.selected = '';
        repo.find('.js-unselect').addClass('hidden');
      }
  
      filterAll();
    }
  
    function attachHandlers() {
      console.log('filling in the blanks');
      $('#js-login .js-user').val(store.get('user'))
      $('#js-login .js-pass').val(store.get('pass'));
      $('#js-login .js-org').val(store.get('org'))
      console.log('filled in the blanks');
  
      issueTplFn = pure("#js-issues").compile(issueDirective);
      $('#js-issues').html('');
      labelTplFn = pure("#js-labels").compile(labelDirective);
      $('#js-labels').html('');
      repoTplFn = pure("#js-repos").compile(repoDirective);
      $('#js-repos').html('');
      assigneeTplFn = pure("#js-assignees").compile(assigneeDirective);
      $('#js-assignees').html('');
  
      $('body').delegate('.js-label', 'click', selectLabel);
      $('body').delegate('.js-repo', 'click', selectRepo);
      $('body').delegate('.js-assignee', 'click', selectAssignee);
      $('body').delegate('.js-issue', 'click', showBody);
      $('body').delegate('#js-search-issues .js-keyword', 'keyup', selectKeyword);
      $('body').delegate('form#js-login', 'submit', function (ev) {
        ev.preventDefault();
  
        var user = $('#js-login .js-user').val()
          , pass = $('#js-login .js-pass').val()
          ;
  
        githubOrg = $('#js-login .js-org').val()
  
        request.get("https://" + user  + ":" + pass + "@api.github.com/user").when(function () {
          getGithubOrgRepos(user, pass);
        });
      });
    }
  
    $.domReady(attachHandlers);
  }());
  

  provide("gitscrum-browser/lgitscrum", module.exports);
  provide("gitscrum-browser/lgitscrum", module.exports);
  $.ender(module.exports);
}(global));

// ender:gitscrum-browser as gitscrum-browser
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  
   require('gitscrum-browser/lgitscrum');
  
  var $ = require('ender')
    ;
  
  function attachHandlers() {
    var dragSrcEl_ = null;
  
    function handleDragStart(e) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', $(this).html());
  
      dragSrcEl_ = this;
  
      // this/e.target is the source node.
      $(this).addClass('moving');
      var self = this;
      setTimeout(function () {
        //$(self).addClass('moving');
        //$(self).addClass('xmoving');
      }, 412);
      //$(this).appendTo('#graveyard');
    };
  
    function handleDragOver(e) {
      // e.offset === undefined
      console.log('dragover', $(this).offset(), $(dragSrcEl_).offset(), $(e).offset(), e);
      if (e.preventDefault) {
        e.preventDefault(); // Allows us to drop.
      }
    
      e.dataTransfer.dropEffect = 'move';
  
      return false;
    };
  
    function handleDragEnter(e) {
      console.log('dragenter');
      $(this).addClass('over');
    };
  
    function handleDragLeave(e) {
      console.log('dragleave');
      // this/e.target is previous target element.
      $(this).removeClass('over');
    };
  
    function handleDrop(e) {
      console.log('drop');
      e.stopPropagation(); // stops the browser from redirecting.
  
      // Don't do anything if we're dropping on the same js-issue we're dragging.
      if (dragSrcEl_ === this) {
        return false;
      }
  
      $(dragSrcEl_).remove();
      $(this).after(dragSrcEl_);
      $(this).removeClass('moving');
      $(this).removeClass('xmoving');
  
      setTimeout(function () {
        $('.js-issue').removeClass('xmoving');
        $('.js-issue').removeClass('moving');
      }, 200);
      return false;
  
      //$(dragSrcEl_).html($(this).html());
      //$(this).html(e.dataTransfer.getData('text/html'));
  
      // Set number of times the js-issue has been moved.
      var count = $(this).find('.count');
      var newCount = parseInt(count.attr('data-col-moves')) + 1;
      count.attr('data-col-moves', newCount);
      count.text('moves: ' + newCount);
  
      return false;
    };
  
    function handleDragEnd(e) {
      console.log('dragend');
      $('.js-issue').removeClass('over');
      $('.js-issue').removeClass('moving');
      $('.js-issue').removeClass('xmoving');
      console.log('dragend');
    };
  
    /*
    var body = document.body.innerHTML;
    document.body.innerHTML = '';
    setTimeout(function () {
      document.body.innerHTML = body;
    }, 1 * 1000);
    */
  
    $('body').delegate('.js-issue', 'dragstart', handleDragStart);
    $('body').delegate('.js-issue', 'dragend', handleDragEnd);
    $('body').delegate('.js-issue', 'dragenter', handleDragEnter);
    $('body').delegate('.js-issue', 'dragleave', handleDragLeave);
    $('body').delegate('.js-issue', 'dragover', handleDragOver);
    $('body').delegate('.js-issue', 'drop', handleDrop);
  };
  $.domReady(attachHandlers);
  

  provide("gitscrum-browser", module.exports);
  provide("gitscrum-browser", module.exports);
  $.ender(module.exports);
}(global));