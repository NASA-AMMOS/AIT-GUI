/******/ (function(modules) { // webpackBootstrap
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
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _mithril = __webpack_require__(1);

	var _mithril2 = _interopRequireDefault(_mithril);

	var _bliss = __webpack_require__(6);

	var bliss = _interopRequireWildcard(_bliss);

	var _index = __webpack_require__(176);

	var _index2 = _interopRequireDefault(_index);

	__webpack_require__(188);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.bliss = bliss;
	window.m = _mithril2.default;

	bliss.gui.init();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, global, module) {;(function() {
	"use strict"
	function Vnode(tag, key, attrs0, children, text, dom) {
		return {tag: tag, key: key, attrs: attrs0, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
	}
	Vnode.normalize = function(node) {
		if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
		if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
		return node
	}
	Vnode.normalizeChildren = function normalizeChildren(children) {
		for (var i = 0; i < children.length; i++) {
			children[i] = Vnode.normalize(children[i])
		}
		return children
	}
	var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
	var selectorCache = {}
	var hasOwn = {}.hasOwnProperty
	function compileSelector(selector) {
		var match, tag = "div", classes = [], attrs = {}
		while (match = selectorParser.exec(selector)) {
			var type = match[1], value = match[2]
			if (type === "" && value !== "") tag = value
			else if (type === "#") attrs.id = value
			else if (type === ".") classes.push(value)
			else if (match[3][0] === "[") {
				var attrValue = match[6]
				if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
				if (match[4] === "class") classes.push(attrValue)
				else attrs[match[4]] = attrValue || true
			}
		}
		if (classes.length > 0) attrs.className = classes.join(" ")
		return selectorCache[selector] = {tag: tag, attrs: attrs}
	}
	function execSelector(state, attrs, children) {
		var hasAttrs = false, childList, text
		var className = attrs.className || attrs.class
		for (var key in state.attrs) {
			if (hasOwn.call(state.attrs, key)) {
				attrs[key] = state.attrs[key]
			}
		}
		if (className !== undefined) {
			if (attrs.class !== undefined) {
				attrs.class = undefined
				attrs.className = className
			}
			if (state.attrs.className != null) {
				attrs.className = state.attrs.className + " " + className
			}
		}
		for (var key in attrs) {
			if (hasOwn.call(attrs, key) && key !== "key") {
				hasAttrs = true
				break
			}
		}
		if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
			text = children[0].children
		} else {
			childList = children
		}
		return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
	}
	function hyperscript(selector) {
		// Because sloppy mode sucks
		var attrs = arguments[1], start = 2, children
		if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
			throw Error("The selector must be either a string or a component.");
		}
		if (typeof selector === "string") {
			var cached = selectorCache[selector] || compileSelector(selector)
		}
		if (attrs == null) {
			attrs = {}
		} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
			attrs = {}
			start = 1
		}
		if (arguments.length === start + 1) {
			children = arguments[start]
			if (!Array.isArray(children)) children = [children]
		} else {
			children = []
			while (start < arguments.length) children.push(arguments[start++])
		}
		var normalized = Vnode.normalizeChildren(children)
		if (typeof selector === "string") {
			return execSelector(cached, attrs, normalized)
		} else {
			return Vnode(selector, attrs.key, attrs, normalized)
		}
	}
	hyperscript.trust = function(html) {
		if (html == null) html = ""
		return Vnode("<", undefined, undefined, html, undefined, undefined)
	}
	hyperscript.fragment = function(attrs1, children) {
		return Vnode("[", attrs1.key, attrs1, Vnode.normalizeChildren(children), undefined, undefined)
	}
	var m = hyperscript
	/** @constructor */
	var PromisePolyfill = function(executor) {
		if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with `new`")
		if (typeof executor !== "function") throw new TypeError("executor must be a function")
		var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false)
		var instance = self._instance = {resolvers: resolvers, rejectors: rejectors}
		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout
		function handler(list, shouldAbsorb) {
			return function execute(value) {
				var then
				try {
					if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
						if (value === self) throw new TypeError("Promise can't be resolved w/ itself")
						executeOnce(then.bind(value))
					}
					else {
						callAsync(function() {
							if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value)
							for (var i = 0; i < list.length; i++) list[i](value)
							resolvers.length = 0, rejectors.length = 0
							instance.state = shouldAbsorb
							instance.retry = function() {execute(value)}
						})
					}
				}
				catch (e) {
					rejectCurrent(e)
				}
			}
		}
		function executeOnce(then) {
			var runs = 0
			function run(fn) {
				return function(value) {
					if (runs++ > 0) return
					fn(value)
				}
			}
			var onerror = run(rejectCurrent)
			try {then(run(resolveCurrent), onerror)} catch (e) {onerror(e)}
		}
		executeOnce(executor)
	}
	PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
		var self = this, instance = self._instance
		function handle(callback, list, next, state) {
			list.push(function(value) {
				if (typeof callback !== "function") next(value)
				else try {resolveNext(callback(value))} catch (e) {if (rejectNext) rejectNext(e)}
			})
			if (typeof instance.retry === "function" && state === instance.state) instance.retry()
		}
		var resolveNext, rejectNext
		var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject})
		handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false)
		return promise
	}
	PromisePolyfill.prototype.catch = function(onRejection) {
		return this.then(null, onRejection)
	}
	PromisePolyfill.resolve = function(value) {
		if (value instanceof PromisePolyfill) return value
		return new PromisePolyfill(function(resolve) {resolve(value)})
	}
	PromisePolyfill.reject = function(value) {
		return new PromisePolyfill(function(resolve, reject) {reject(value)})
	}
	PromisePolyfill.all = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			var total = list.length, count = 0, values = []
			if (list.length === 0) resolve([])
			else for (var i = 0; i < list.length; i++) {
				(function(i) {
					function consume(value) {
						count++
						values[i] = value
						if (count === total) resolve(values)
					}
					if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
						list[i].then(consume, reject)
					}
					else consume(list[i])
				})(i)
			}
		})
	}
	PromisePolyfill.race = function(list) {
		return new PromisePolyfill(function(resolve, reject) {
			for (var i = 0; i < list.length; i++) {
				list[i].then(resolve, reject)
			}
		})
	}
	if (typeof window !== "undefined") {
		if (typeof window.Promise === "undefined") window.Promise = PromisePolyfill
		var PromisePolyfill = window.Promise
	} else if (typeof global !== "undefined") {
		if (typeof global.Promise === "undefined") global.Promise = PromisePolyfill
		var PromisePolyfill = global.Promise
	} else {
	}
	var buildQueryString = function(object) {
		if (Object.prototype.toString.call(object) !== "[object Object]") return ""
		var args = []
		for (var key0 in object) {
			destructure(key0, object[key0])
		}
		return args.join("&")
		function destructure(key0, value) {
			if (Array.isArray(value)) {
				for (var i = 0; i < value.length; i++) {
					destructure(key0 + "[" + i + "]", value[i])
				}
			}
			else if (Object.prototype.toString.call(value) === "[object Object]") {
				for (var i in value) {
					destructure(key0 + "[" + i + "]", value[i])
				}
			}
			else args.push(encodeURIComponent(key0) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
		}
	}
	var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")
	var _8 = function($window, Promise) {
		var callbackCount = 0
		var oncompletion
		function setCompletionCallback(callback) {oncompletion = callback}
		function finalizer() {
			var count = 0
			function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion()}
			return function finalize(promise0) {
				var then0 = promise0.then
				promise0.then = function() {
					count++
					var next = then0.apply(promise0, arguments)
					next.then(complete, function(e) {
						complete()
						if (count === 0) throw e
					})
					return finalize(next)
				}
				return promise0
			}
		}
		function normalize(args, extra) {
			if (typeof args === "string") {
				var url = args
				args = extra || {}
				if (args.url == null) args.url = url
			}
			return args
		}
		function request(args, extra) {
			var finalize = finalizer()
			args = normalize(args, extra)
			var promise0 = new Promise(function(resolve, reject) {
				if (args.method == null) args.method = "GET"
				args.method = args.method.toUpperCase()
				var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)
				if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify
				if (typeof args.deserialize !== "function") args.deserialize = deserialize
				if (typeof args.extract !== "function") args.extract = extract
				args.url = interpolate(args.url, args.data)
				if (useBody) args.data = args.serialize(args.data)
				else args.url = assemble(args.url, args.data)
				var xhr = new $window.XMLHttpRequest(),
					aborted = false,
					_abort = xhr.abort
				xhr.abort = function abort() {
					aborted = true
					_abort.call(xhr)
				}
				xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)
				if (args.serialize === JSON.stringify && useBody) {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
				}
				if (args.deserialize === deserialize) {
					xhr.setRequestHeader("Accept", "application/json, text/*")
				}
				if (args.withCredentials) xhr.withCredentials = args.withCredentials
				for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
					xhr.setRequestHeader(key, args.headers[key])
				}
				if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr
				xhr.onreadystatechange = function() {
					// Don't throw errors on xhr.abort().
					if(aborted) return
					if (xhr.readyState === 4) {
						try {
							var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
							if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
								resolve(cast(args.type, response))
							}
							else {
								var error = new Error(xhr.responseText)
								for (var key in response) error[key] = response[key]
								reject(error)
							}
						}
						catch (e) {
							reject(e)
						}
					}
				}
				if (useBody && (args.data != null)) xhr.send(args.data)
				else xhr.send()
			})
			return args.background === true ? promise0 : finalize(promise0)
		}
		function jsonp(args, extra) {
			var finalize = finalizer()
			args = normalize(args, extra)
			var promise0 = new Promise(function(resolve, reject) {
				var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
				var script = $window.document.createElement("script")
				$window[callbackName] = function(data) {
					script.parentNode.removeChild(script)
					resolve(cast(args.type, data))
					delete $window[callbackName]
				}
				script.onerror = function() {
					script.parentNode.removeChild(script)
					reject(new Error("JSONP request failed"))
					delete $window[callbackName]
				}
				if (args.data == null) args.data = {}
				args.url = interpolate(args.url, args.data)
				args.data[args.callbackKey || "callback"] = callbackName
				script.src = assemble(args.url, args.data)
				$window.document.documentElement.appendChild(script)
			})
			return args.background === true? promise0 : finalize(promise0)
		}
		function interpolate(url, data) {
			if (data == null) return url
			var tokens = url.match(/:[^\/]+/gi) || []
			for (var i = 0; i < tokens.length; i++) {
				var key = tokens[i].slice(1)
				if (data[key] != null) {
					url = url.replace(tokens[i], data[key])
				}
			}
			return url
		}
		function assemble(url, data) {
			var querystring = buildQueryString(data)
			if (querystring !== "") {
				var prefix = url.indexOf("?") < 0 ? "?" : "&"
				url += prefix + querystring
			}
			return url
		}
		function deserialize(data) {
			try {return data !== "" ? JSON.parse(data) : null}
			catch (e) {throw new Error(data)}
		}
		function extract(xhr) {return xhr.responseText}
		function cast(type0, data) {
			if (typeof type0 === "function") {
				if (Array.isArray(data)) {
					for (var i = 0; i < data.length; i++) {
						data[i] = new type0(data[i])
					}
				}
				else return new type0(data)
			}
			return data
		}
		return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
	}
	var requestService = _8(window, PromisePolyfill)
	var coreRenderer = function($window) {
		var $doc = $window.document
		var $emptyFragment = $doc.createDocumentFragment()
		var onevent
		function setEventCallback(callback) {return onevent = callback}
		//create
		function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i]
				if (vnode != null) {
					createNode(parent, vnode, hooks, ns, nextSibling)
				}
			}
		}
		function createNode(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag
			if (typeof tag === "string") {
				vnode.state = {}
				if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
				switch (tag) {
					case "#": return createText(parent, vnode, nextSibling)
					case "<": return createHTML(parent, vnode, nextSibling)
					case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
					default: return createElement(parent, vnode, hooks, ns, nextSibling)
				}
			}
			else return createComponent(parent, vnode, hooks, ns, nextSibling)
		}
		function createText(parent, vnode, nextSibling) {
			vnode.dom = $doc.createTextNode(vnode.children)
			insertNode(parent, vnode.dom, nextSibling)
			return vnode.dom
		}
		function createHTML(parent, vnode, nextSibling) {
			var match1 = vnode.children.match(/^\s*?<(\w+)/im) || []
			var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match1[1]] || "div"
			var temp = $doc.createElement(parent1)
			temp.innerHTML = vnode.children
			vnode.dom = temp.firstChild
			vnode.domSize = temp.childNodes.length
			var fragment = $doc.createDocumentFragment()
			var child
			while (child = temp.firstChild) {
				fragment.appendChild(child)
			}
			insertNode(parent, fragment, nextSibling)
			return fragment
		}
		function createFragment(parent, vnode, hooks, ns, nextSibling) {
			var fragment = $doc.createDocumentFragment()
			if (vnode.children != null) {
				var children = vnode.children
				createNodes(fragment, children, 0, children.length, hooks, null, ns)
			}
			vnode.dom = fragment.firstChild
			vnode.domSize = fragment.childNodes.length
			insertNode(parent, fragment, nextSibling)
			return fragment
		}
		function createElement(parent, vnode, hooks, ns, nextSibling) {
			var tag = vnode.tag
			switch (vnode.tag) {
				case "svg": ns = "http://www.w3.org/2000/svg"; break
				case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
			}
			var attrs2 = vnode.attrs
			var is = attrs2 && attrs2.is
			var element = ns ?
				is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
				is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
			vnode.dom = element
			if (attrs2 != null) {
				setAttrs(vnode, attrs2, ns)
			}
			insertNode(parent, element, nextSibling)
			if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
				setContentEditable(vnode)
			}
			else {
				if (vnode.text != null) {
					if (vnode.text !== "") element.textContent = vnode.text
					else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				}
				if (vnode.children != null) {
					var children = vnode.children
					createNodes(element, children, 0, children.length, hooks, null, ns)
					setLateAttrs(vnode)
				}
			}
			return element
		}
		function initComponent(vnode, hooks) {
			var sentinel
			if (typeof vnode.tag.view === "function") {
				vnode.state = Object.create(vnode.tag)
				sentinel = vnode.state.view
				if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
				sentinel.$$reentrantLock$$ = true
			} else {
				vnode.state = void 0
				sentinel = vnode.tag
				if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
				sentinel.$$reentrantLock$$ = true
				vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
			}
			vnode._state = vnode.state
			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
			initLifecycle(vnode._state, vnode, hooks)
			vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
			sentinel.$$reentrantLock$$ = null
		}
		function createComponent(parent, vnode, hooks, ns, nextSibling) {
			initComponent(vnode, hooks)
			if (vnode.instance != null) {
				var element = createNode(parent, vnode.instance, hooks, ns, nextSibling)
				vnode.dom = vnode.instance.dom
				vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
				insertNode(parent, element, nextSibling)
				return element
			}
			else {
				vnode.domSize = 0
				return $emptyFragment
			}
		}
		//update
		function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
			if (old === vnodes || old == null && vnodes == null) return
			else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, undefined)
			else if (vnodes == null) removeNodes(old, 0, old.length, vnodes)
			else {
				if (old.length === vnodes.length) {
					var isUnkeyed = false
					for (var i = 0; i < vnodes.length; i++) {
						if (vnodes[i] != null && old[i] != null) {
							isUnkeyed = vnodes[i].key == null && old[i].key == null
							break
						}
					}
					if (isUnkeyed) {
						for (var i = 0; i < old.length; i++) {
							if (old[i] === vnodes[i]) continue
							else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling))
							else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes)
							else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns)
						}
						return
					}
				}
				recycling = recycling || isRecyclable(old, vnodes)
				if (recycling) {
					var pool = old.pool
					old = old.concat(old.pool)
				}
				var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldStart], v = vnodes[start]
					if (o === v && !recycling) oldStart++, start++
					else if (o == null) oldStart++
					else if (v == null) start++
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling)
						oldStart++, start++
						updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns)
						if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
					}
					else {
						var o = old[oldEnd]
						if (o === v && !recycling) oldEnd--, start++
						else if (o == null) oldEnd--
						else if (v == null) start++
						else if (o.key === v.key) {
							var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
							updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
							if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling))
							oldEnd--, start++
						}
						else break
					}
				}
				while (oldEnd >= oldStart && end >= start) {
					var o = old[oldEnd], v = vnodes[end]
					if (o === v && !recycling) oldEnd--, end--
					else if (o == null) oldEnd--
					else if (v == null) end--
					else if (o.key === v.key) {
						var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
						updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
						if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
						if (o.dom != null) nextSibling = o.dom
						oldEnd--, end--
					}
					else {
						if (!map) map = getKeyMap(old, oldEnd)
						if (v != null) {
							var oldIndex = map[v.key]
							if (oldIndex != null) {
								var movable = old[oldIndex]
								var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling)
								updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns)
								insertNode(parent, toFragment(movable), nextSibling)
								old[oldIndex].skip = true
								if (movable.dom != null) nextSibling = movable.dom
							}
							else {
								var dom = createNode(parent, v, hooks, undefined, nextSibling)
								nextSibling = dom
							}
						}
						end--
					}
					if (end < start) break
				}
				createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				removeNodes(old, oldStart, oldEnd + 1, vnodes)
			}
		}
		function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
			var oldTag = old.tag, tag = vnode.tag
			if (oldTag === tag) {
				vnode.state = old.state
				vnode._state = old._state
				vnode.events = old.events
				if (!recycling && shouldNotUpdate(vnode, old)) return
				if (typeof oldTag === "string") {
					if (vnode.attrs != null) {
						if (recycling) {
							vnode.state = {}
							initLifecycle(vnode.attrs, vnode, hooks)
						}
						else updateLifecycle(vnode.attrs, vnode, hooks)
					}
					switch (oldTag) {
						case "#": updateText(old, vnode); break
						case "<": updateHTML(parent, old, vnode, nextSibling); break
						case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
						default: updateElement(old, vnode, recycling, hooks, ns)
					}
				}
				else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns)
			}
			else {
				removeNode(old, null)
				createNode(parent, vnode, hooks, ns, nextSibling)
			}
		}
		function updateText(old, vnode) {
			if (old.children.toString() !== vnode.children.toString()) {
				old.dom.nodeValue = vnode.children
			}
			vnode.dom = old.dom
		}
		function updateHTML(parent, old, vnode, nextSibling) {
			if (old.children !== vnode.children) {
				toFragment(old)
				createHTML(parent, vnode, nextSibling)
			}
			else vnode.dom = old.dom, vnode.domSize = old.domSize
		}
		function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
			updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns)
			var domSize = 0, children = vnode.children
			vnode.dom = null
			if (children != null) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i]
					if (child != null && child.dom != null) {
						if (vnode.dom == null) vnode.dom = child.dom
						domSize += child.domSize || 1
					}
				}
				if (domSize !== 1) vnode.domSize = domSize
			}
		}
		function updateElement(old, vnode, recycling, hooks, ns) {
			var element = vnode.dom = old.dom
			switch (vnode.tag) {
				case "svg": ns = "http://www.w3.org/2000/svg"; break
				case "math": ns = "http://www.w3.org/1998/Math/MathML"; break
			}
			if (vnode.tag === "textarea") {
				if (vnode.attrs == null) vnode.attrs = {}
				if (vnode.text != null) {
					vnode.attrs.value = vnode.text //FIXME handle0 multiple children
					vnode.text = undefined
				}
			}
			updateAttrs(vnode, old.attrs, vnode.attrs, ns)
			if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
				setContentEditable(vnode)
			}
			else if (old.text != null && vnode.text != null && vnode.text !== "") {
				if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
			}
			else {
				if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
				if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
				updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns)
			}
		}
		function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
			if (recycling) {
				initComponent(vnode, hooks)
			} else {
				vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
				if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
				if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
				updateLifecycle(vnode._state, vnode, hooks)
			}
			if (vnode.instance != null) {
				if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
				else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns)
				vnode.dom = vnode.instance.dom
				vnode.domSize = vnode.instance.domSize
			}
			else if (old.instance != null) {
				removeNode(old.instance, null)
				vnode.dom = undefined
				vnode.domSize = 0
			}
			else {
				vnode.dom = old.dom
				vnode.domSize = old.domSize
			}
		}
		function isRecyclable(old, vnodes) {
			if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
				var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0
				var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0
				var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0
				if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
					return true
				}
			}
			return false
		}
		function getKeyMap(vnodes, end) {
			var map = {}, i = 0
			for (var i = 0; i < end; i++) {
				var vnode = vnodes[i]
				if (vnode != null) {
					var key2 = vnode.key
					if (key2 != null) map[key2] = i
				}
			}
			return map
		}
		function toFragment(vnode) {
			var count0 = vnode.domSize
			if (count0 != null || vnode.dom == null) {
				var fragment = $doc.createDocumentFragment()
				if (count0 > 0) {
					var dom = vnode.dom
					while (--count0) fragment.appendChild(dom.nextSibling)
					fragment.insertBefore(dom, fragment.firstChild)
				}
				return fragment
			}
			else return vnode.dom
		}
		function getNextSibling(vnodes, i, nextSibling) {
			for (; i < vnodes.length; i++) {
				if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
			}
			return nextSibling
		}
		function insertNode(parent, dom, nextSibling) {
			if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling)
			else parent.appendChild(dom)
		}
		function setContentEditable(vnode) {
			var children = vnode.children
			if (children != null && children.length === 1 && children[0].tag === "<") {
				var content = children[0].children
				if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
			}
			else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
		}
		//remove
		function removeNodes(vnodes, start, end, context) {
			for (var i = start; i < end; i++) {
				var vnode = vnodes[i]
				if (vnode != null) {
					if (vnode.skip) vnode.skip = false
					else removeNode(vnode, context)
				}
			}
		}
		function removeNode(vnode, context) {
			var expected = 1, called = 0
			if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
				var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode)
				if (result != null && typeof result.then === "function") {
					expected++
					result.then(continuation, continuation)
				}
			}
			if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
				var result = vnode._state.onbeforeremove.call(vnode.state, vnode)
				if (result != null && typeof result.then === "function") {
					expected++
					result.then(continuation, continuation)
				}
			}
			continuation()
			function continuation() {
				if (++called === expected) {
					onremove(vnode)
					if (vnode.dom) {
						var count0 = vnode.domSize || 1
						if (count0 > 1) {
							var dom = vnode.dom
							while (--count0) {
								removeNodeFromDOM(dom.nextSibling)
							}
						}
						removeNodeFromDOM(vnode.dom)
						if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
							if (!context.pool) context.pool = [vnode]
							else context.pool.push(vnode)
						}
					}
				}
			}
		}
		function removeNodeFromDOM(node) {
			var parent = node.parentNode
			if (parent != null) parent.removeChild(node)
		}
		function onremove(vnode) {
			if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode)
			if (typeof vnode.tag !== "string" && typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode)
			if (vnode.instance != null) onremove(vnode.instance)
			else {
				var children = vnode.children
				if (Array.isArray(children)) {
					for (var i = 0; i < children.length; i++) {
						var child = children[i]
						if (child != null) onremove(child)
					}
				}
			}
		}
		//attrs2
		function setAttrs(vnode, attrs2, ns) {
			for (var key2 in attrs2) {
				setAttr(vnode, key2, null, attrs2[key2], ns)
			}
		}
		function setAttr(vnode, key2, old, value, ns) {
			var element = vnode.dom
			if (key2 === "key" || key2 === "is" || (old === value && !isFormAttribute(vnode, key2)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key2)) return
			var nsLastIndex = key2.indexOf(":")
			if (nsLastIndex > -1 && key2.substr(0, nsLastIndex) === "xlink") {
				element.setAttributeNS("http://www.w3.org/1999/xlink", key2.slice(nsLastIndex + 1), value)
			}
			else if (key2[0] === "o" && key2[1] === "n" && typeof value === "function") updateEvent(vnode, key2, value)
			else if (key2 === "style") updateStyle(element, old, value)
			else if (key2 in element && !isAttribute(key2) && ns === undefined && !isCustomElement(vnode)) {
				//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
				if (vnode.tag === "input" && key2 === "value" && vnode.dom.value == value && vnode.dom === $doc.activeElement) return
				//setting select[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "select" && key2 === "value" && vnode.dom.value == value && vnode.dom === $doc.activeElement) return
				//setting option[value] to same value while having select open blinks select dropdown in Chrome
				if (vnode.tag === "option" && key2 === "value" && vnode.dom.value == value) return
				// If you assign an input type1 that is not supported by IE 11 with an assignment expression, an error0 will occur.
				if (vnode.tag === "input" && key2 === "type") {
					element.setAttribute(key2, value)
					return
				}
				element[key2] = value
			}
			else {
				if (typeof value === "boolean") {
					if (value) element.setAttribute(key2, "")
					else element.removeAttribute(key2)
				}
				else element.setAttribute(key2 === "className" ? "class" : key2, value)
			}
		}
		function setLateAttrs(vnode) {
			var attrs2 = vnode.attrs
			if (vnode.tag === "select" && attrs2 != null) {
				if ("value" in attrs2) setAttr(vnode, "value", null, attrs2.value, undefined)
				if ("selectedIndex" in attrs2) setAttr(vnode, "selectedIndex", null, attrs2.selectedIndex, undefined)
			}
		}
		function updateAttrs(vnode, old, attrs2, ns) {
			if (attrs2 != null) {
				for (var key2 in attrs2) {
					setAttr(vnode, key2, old && old[key2], attrs2[key2], ns)
				}
			}
			if (old != null) {
				for (var key2 in old) {
					if (attrs2 == null || !(key2 in attrs2)) {
						if (key2 === "className") key2 = "class"
						if (key2[0] === "o" && key2[1] === "n" && !isLifecycleMethod(key2)) updateEvent(vnode, key2, undefined)
						else if (key2 !== "key") vnode.dom.removeAttribute(key2)
					}
				}
			}
		}
		function isFormAttribute(vnode, attr) {
			return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
		}
		function isLifecycleMethod(attr) {
			return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
		}
		function isAttribute(attr) {
			return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
		}
		function isCustomElement(vnode){
			return vnode.attrs.is || vnode.tag.indexOf("-") > -1
		}
		function hasIntegrationMethods(source) {
			return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
		}
		//style
		function updateStyle(element, old, style) {
			if (old === style) element.style.cssText = "", old = null
			if (style == null) element.style.cssText = ""
			else if (typeof style === "string") element.style.cssText = style
			else {
				if (typeof old === "string") element.style.cssText = ""
				for (var key2 in style) {
					element.style[key2] = style[key2]
				}
				if (old != null && typeof old !== "string") {
					for (var key2 in old) {
						if (!(key2 in style)) element.style[key2] = ""
					}
				}
			}
		}
		//event
		function updateEvent(vnode, key2, value) {
			var element = vnode.dom
			var callback = typeof onevent !== "function" ? value : function(e) {
				var result = value.call(element, e)
				onevent.call(element, e)
				return result
			}
			if (key2 in element) element[key2] = typeof value === "function" ? callback : null
			else {
				var eventName = key2.slice(2)
				if (vnode.events === undefined) vnode.events = {}
				if (vnode.events[key2] === callback) return
				if (vnode.events[key2] != null) element.removeEventListener(eventName, vnode.events[key2], false)
				if (typeof value === "function") {
					vnode.events[key2] = callback
					element.addEventListener(eventName, vnode.events[key2], false)
				}
			}
		}
		//lifecycle
		function initLifecycle(source, vnode, hooks) {
			if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode)
			if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode))
		}
		function updateLifecycle(source, vnode, hooks) {
			if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode))
		}
		function shouldNotUpdate(vnode, old) {
			var forceVnodeUpdate, forceComponentUpdate
			if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old)
			if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old)
			if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
				vnode.dom = old.dom
				vnode.domSize = old.domSize
				vnode.instance = old.instance
				return true
			}
			return false
		}
		function render(dom, vnodes) {
			if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
			var hooks = []
			var active = $doc.activeElement
			// First time0 rendering into a node clears it out
			if (dom.vnodes == null) dom.textContent = ""
			if (!Array.isArray(vnodes)) vnodes = [vnodes]
			updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, undefined)
			dom.vnodes = vnodes
			for (var i = 0; i < hooks.length; i++) hooks[i]()
			if ($doc.activeElement !== active) active.focus()
		}
		return {render: render, setEventCallback: setEventCallback}
	}
	function throttle(callback) {
		//60fps translates to 16.6ms, round it down since setTimeout requires int
		var time = 16
		var last = 0, pending = null
		var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
		return function() {
			var now = Date.now()
			if (last === 0 || now - last >= time) {
				last = now
				callback()
			}
			else if (pending === null) {
				pending = timeout(function() {
					pending = null
					callback()
					last = Date.now()
				}, time - (now - last))
			}
		}
	}
	var _11 = function($window) {
		var renderService = coreRenderer($window)
		renderService.setEventCallback(function(e) {
			if (e.redraw !== false) redraw()
		})
		var callbacks = []
		function subscribe(key1, callback) {
			unsubscribe(key1)
			callbacks.push(key1, throttle(callback))
		}
		function unsubscribe(key1) {
			var index = callbacks.indexOf(key1)
			if (index > -1) callbacks.splice(index, 2)
		}
		function redraw() {
			for (var i = 1; i < callbacks.length; i += 2) {
				callbacks[i]()
			}
		}
		return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
	}
	var redrawService = _11(window)
	requestService.setCompletionCallback(redrawService.redraw)
	var _16 = function(redrawService0) {
		return function(root, component) {
			if (component === null) {
				redrawService0.render(root, [])
				redrawService0.unsubscribe(root)
				return
			}
			
			if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
			
			var run0 = function() {
				redrawService0.render(root, Vnode(component))
			}
			redrawService0.subscribe(root, run0)
			redrawService0.redraw()
		}
	}
	m.mount = _16(redrawService)
	var Promise = PromisePolyfill
	var parseQueryString = function(string) {
		if (string === "" || string == null) return {}
		if (string.charAt(0) === "?") string = string.slice(1)
		var entries = string.split("&"), data0 = {}, counters = {}
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i].split("=")
			var key5 = decodeURIComponent(entry[0])
			var value = entry.length === 2 ? decodeURIComponent(entry[1]) : ""
			if (value === "true") value = true
			else if (value === "false") value = false
			var levels = key5.split(/\]\[?|\[/)
			var cursor = data0
			if (key5.indexOf("[") > -1) levels.pop()
			for (var j = 0; j < levels.length; j++) {
				var level = levels[j], nextLevel = levels[j + 1]
				var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10))
				var isValue = j === levels.length - 1
				if (level === "") {
					var key5 = levels.slice(0, j).join()
					if (counters[key5] == null) counters[key5] = 0
					level = counters[key5]++
				}
				if (cursor[level] == null) {
					cursor[level] = isValue ? value : isNumber ? [] : {}
				}
				cursor = cursor[level]
			}
		}
		return data0
	}
	var coreRouter = function($window) {
		var supportsPushState = typeof $window.history.pushState === "function"
		var callAsync0 = typeof setImmediate === "function" ? setImmediate : setTimeout
		function normalize1(fragment0) {
			var data = $window.location[fragment0].replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent)
			if (fragment0 === "pathname" && data[0] !== "/") data = "/" + data
			return data
		}
		var asyncId
		function debounceAsync(callback0) {
			return function() {
				if (asyncId != null) return
				asyncId = callAsync0(function() {
					asyncId = null
					callback0()
				})
			}
		}
		function parsePath(path, queryData, hashData) {
			var queryIndex = path.indexOf("?")
			var hashIndex = path.indexOf("#")
			var pathEnd = queryIndex > -1 ? queryIndex : hashIndex > -1 ? hashIndex : path.length
			if (queryIndex > -1) {
				var queryEnd = hashIndex > -1 ? hashIndex : path.length
				var queryParams = parseQueryString(path.slice(queryIndex + 1, queryEnd))
				for (var key4 in queryParams) queryData[key4] = queryParams[key4]
			}
			if (hashIndex > -1) {
				var hashParams = parseQueryString(path.slice(hashIndex + 1))
				for (var key4 in hashParams) hashData[key4] = hashParams[key4]
			}
			return path.slice(0, pathEnd)
		}
		var router = {prefix: "#!"}
		router.getPath = function() {
			var type2 = router.prefix.charAt(0)
			switch (type2) {
				case "#": return normalize1("hash").slice(router.prefix.length)
				case "?": return normalize1("search").slice(router.prefix.length) + normalize1("hash")
				default: return normalize1("pathname").slice(router.prefix.length) + normalize1("search") + normalize1("hash")
			}
		}
		router.setPath = function(path, data, options) {
			var queryData = {}, hashData = {}
			path = parsePath(path, queryData, hashData)
			if (data != null) {
				for (var key4 in data) queryData[key4] = data[key4]
				path = path.replace(/:([^\/]+)/g, function(match2, token) {
					delete queryData[token]
					return data[token]
				})
			}
			var query = buildQueryString(queryData)
			if (query) path += "?" + query
			var hash = buildQueryString(hashData)
			if (hash) path += "#" + hash
			if (supportsPushState) {
				var state = options ? options.state : null
				var title = options ? options.title : null
				$window.onpopstate()
				if (options && options.replace) $window.history.replaceState(state, title, router.prefix + path)
				else $window.history.pushState(state, title, router.prefix + path)
			}
			else $window.location.href = router.prefix + path
		}
		router.defineRoutes = function(routes, resolve, reject) {
			function resolveRoute() {
				var path = router.getPath()
				var params = {}
				var pathname = parsePath(path, params, params)
				var state = $window.history.state
				if (state != null) {
					for (var k in state) params[k] = state[k]
				}
				for (var route0 in routes) {
					var matcher = new RegExp("^" + route0.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$")
					if (matcher.test(pathname)) {
						pathname.replace(matcher, function() {
							var keys = route0.match(/:[^\/]+/g) || []
							var values = [].slice.call(arguments, 1, -2)
							for (var i = 0; i < keys.length; i++) {
								params[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
							}
							resolve(routes[route0], params, path, route0)
						})
						return
					}
				}
				reject(path, params)
			}
			if (supportsPushState) $window.onpopstate = debounceAsync(resolveRoute)
			else if (router.prefix.charAt(0) === "#") $window.onhashchange = resolveRoute
			resolveRoute()
		}
		return router
	}
	var _20 = function($window, redrawService0) {
		var routeService = coreRouter($window)
		var identity = function(v) {return v}
		var render1, component, attrs3, currentPath, lastUpdate
		var route = function(root, defaultRoute, routes) {
			if (root == null) throw new Error("Ensure the DOM element that was passed to `m.route` is not undefined")
			var run1 = function() {
				if (render1 != null) redrawService0.render(root, render1(Vnode(component, attrs3.key, attrs3)))
			}
			var bail = function(path) {
				if (path !== defaultRoute) routeService.setPath(defaultRoute, null, {replace: true})
				else throw new Error("Could not resolve default route " + defaultRoute)
			}
			routeService.defineRoutes(routes, function(payload, params, path) {
				var update = lastUpdate = function(routeResolver, comp) {
					if (update !== lastUpdate) return
					component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div"
					attrs3 = params, currentPath = path, lastUpdate = null
					render1 = (routeResolver.render || identity).bind(routeResolver)
					run1()
				}
				if (payload.view || typeof payload === "function") update({}, payload)
				else {
					if (payload.onmatch) {
						Promise.resolve(payload.onmatch(params, path)).then(function(resolved) {
							update(payload, resolved)
						}, bail)
					}
					else update(payload, "div")
				}
			}, bail)
			redrawService0.subscribe(root, run1)
		}
		route.set = function(path, data, options) {
			if (lastUpdate != null) options = {replace: true}
			lastUpdate = null
			routeService.setPath(path, data, options)
		}
		route.get = function() {return currentPath}
		route.prefix = function(prefix0) {routeService.prefix = prefix0}
		route.link = function(vnode1) {
			vnode1.dom.setAttribute("href", routeService.prefix + vnode1.attrs.href)
			vnode1.dom.onclick = function(e) {
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return
				e.preventDefault()
				e.redraw = false
				var href = this.getAttribute("href")
				if (href.indexOf(routeService.prefix) === 0) href = href.slice(routeService.prefix.length)
				route.set(href, undefined, undefined)
			}
		}
		route.param = function(key3) {
			if(typeof attrs3 !== "undefined" && typeof key3 !== "undefined") return attrs3[key3]
			return attrs3
		}
		return route
	}
	m.route = _20(window, redrawService)
	m.withAttr = function(attrName, callback1, context) {
		return function(e) {
			callback1.call(context || this, attrName in e.currentTarget ? e.currentTarget[attrName] : e.currentTarget.getAttribute(attrName))
		}
	}
	var _28 = coreRenderer(window)
	m.render = _28.render
	m.redraw = redrawService.redraw
	m.request = requestService.request
	m.jsonp = requestService.jsonp
	m.parseQueryString = parseQueryString
	m.buildQueryString = buildQueryString
	m.version = "1.1.1"
	m.vnode = Vnode
	if (true) module["exports"] = m
	else window.m = m
	}());
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).setImmediate, (function() { return this; }()), __webpack_require__(5)(module)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(3);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
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
	    var timeout = runTimeout(cleanUpNextTick);
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
	    runClearTimeout(timeout);
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
	        runTimeout(drainQueue);
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
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.util = exports.tlm = exports.time = exports.packets = exports.gui = exports.format = exports.evr = exports.events = exports.cmd = undefined;

	var _events = __webpack_require__(7);

	var _events2 = _interopRequireDefault(_events);

	var _packets = __webpack_require__(8);

	var _packets2 = _interopRequireDefault(_packets);

	var _cmd = __webpack_require__(9);

	var cmd = _interopRequireWildcard(_cmd);

	var _evr = __webpack_require__(10);

	var evr = _interopRequireWildcard(_evr);

	var _format = __webpack_require__(11);

	var format = _interopRequireWildcard(_format);

	var _gui = __webpack_require__(13);

	var gui = _interopRequireWildcard(_gui);

	var _time = __webpack_require__(12);

	var time = _interopRequireWildcard(_time);

	var _tlm = __webpack_require__(174);

	var tlm = _interopRequireWildcard(_tlm);

	var _util = __webpack_require__(22);

	var util = _interopRequireWildcard(_util);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.cmd = cmd;
	exports.events = _events2.default;
	exports.evr = evr;
	exports.format = format;
	exports.gui = gui;
	exports.packets = _packets2.default;
	exports.time = time;
	exports.tlm = tlm;
	exports.util = util;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var EventBus = function () {
	    function EventBus() {
	        _classCallCheck(this, EventBus);

	        this._listeners = {};
	    }

	    _createClass(EventBus, [{
	        key: "emit",
	        value: function emit(event /* , ... */) {
	            var _this = this;

	            var listeners = this._listeners[event];

	            if (listeners !== undefined) {
	                var args = Array.prototype.slice.call(arguments, 1);
	                listeners.forEach(function (fn) {
	                    return fn.apply(_this, args);
	                });
	            }
	        }
	    }, {
	        key: "off",
	        value: function off(event, fn) {
	            var listeners = this._listeners[event];
	            var index = listeners && listeners.indexOf(fn);
	            var found = index !== undefined && index !== -1;

	            if (found) {
	                listeners.splice(index, 1);
	            }

	            return found;
	        }
	    }, {
	        key: "on",
	        value: function on(event, fn) {
	            this._listeners[event] = this._listeners[event] || [];
	            this._listeners[event].push(fn);
	        }
	    }]);

	    return EventBus;
	}();

	exports.default = new EventBus();

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * PacketBuffer
	 *
	 * A `PacketBuffer` implements a circular FIFO queue with
	 * constant-time insert and remove operations.  PacketBuffers have a
	 * fixed-size `capacity` for a certain number of packets.  This allows
	 * for a history of packets to be maintained (e.g. 600 1Hz packets
	 * stores the last 10 minutes of packet data).
	 *
	 * Clients of `PacketBuffer` peek at packets in LIFO order.  That is,
	 * they're often interested in the most recent packets.  Therefore,
	 * `PacketBuffer.get(0)` is always the most current packet, `get(1)`
	 * the next most current, and so on.  The oldest packet is retreived
	 * via `get(capacity - 1)`.
	 */
	var PacketBuffer = function () {
	    /**
	     * Creates a new PacketBuffer to hold up to capacity packets.
	     */
	    function PacketBuffer() {
	        var capacity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 600;

	        _classCallCheck(this, PacketBuffer);

	        this._buffer = new Array(capacity);
	        this.flush();
	    }

	    /**
	     * Maps a client packet index onto the underlying circular _buffer
	     * index.
	     *
	     * @return the underlying circular _buffer index for n.
	     */


	    _createClass(PacketBuffer, [{
	        key: "_index",
	        value: function _index(n) {

	            return (this._start + this._length + n) % this._buffer.length;
	        }

	        /**
	         * @return the total capacity of this PacketBuffer.
	         */

	    }, {
	        key: "flush",


	        /**
	         * Flushes (empties) the contents of this PacketBuffer.
	         */
	        value: function flush() {
	            this._length = 0;
	            this._start = 0;
	            this._buffer.fill(undefined);
	        }

	        /**
	         * @return the nth most recent packet (starting at zero).
	         */

	    }, {
	        key: "get",
	        value: function get(n) {
	            var newest = this._start + this._length - 1;
	            var index = (newest - n) % this._buffer.length;
	            return this._buffer[index];
	        }

	        /**
	         * Inserts a packet into this PacketBuffer, removing the oldest
	         * packet, if the buffer is at capacity.
	         */

	    }, {
	        key: "insert",
	        value: function insert(packet) {
	            if (this._length + 1 > this._buffer.length) {
	                this.remove();
	            }

	            var next = this._start + this._length;
	            var index = next % this._buffer.length;
	            this._buffer[index] = packet;
	            this._length += 1;
	        }

	        /**
	         * @return the length of this PacketBuffer.
	         */

	    }, {
	        key: "remove",


	        /**
	         * Removes the oldest packet from this PacketBuffer.
	         *
	         * @return the removed packet
	         */
	        value: function remove() {
	            var packet = this._buffer[this._start];
	            this._start = (this._start + 1) % this._buffer.length;
	            this._length -= 1;

	            return packet;
	        }
	    }, {
	        key: "capacity",
	        get: function get() {
	            return this._capacity;
	        }
	    }, {
	        key: "length",
	        get: function get() {
	            return this._length;
	        }
	    }]);

	    return PacketBuffer;
	}();

	var PacketBuffers = function () {
	    function PacketBuffers() {
	        _classCallCheck(this, PacketBuffers);
	    }

	    _createClass(PacketBuffers, [{
	        key: "create",
	        value: function create(name) {
	            var capacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 600;

	            var created = false;

	            if (this[name] === undefined) {
	                this[name] = new PacketBuffer(capacity);
	                created = true;
	            }

	            return created;
	        }
	    }, {
	        key: "insert",
	        value: function insert(name, packet) {
	            if (this[name] === undefined) {
	                this.create(name);
	            }

	            this[name].insert(packet);
	        }
	    }]);

	    return PacketBuffers;
	}();

	exports.default = new PacketBuffers();

/***/ }),
/* 9 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var CommandDictionary = function () {
	    /**
	     * Creates a new (empty) CommandDictionary.
	     */
	    function CommandDictionary() {
	        _classCallCheck(this, CommandDictionary);

	        this._byOpcode = {};
	        this._bySubsystem = {};
	    }

	    /**
	     * Adds the given CommandDefinition to this CommandDictionary.
	     */


	    _createClass(CommandDictionary, [{
	        key: 'add',
	        value: function add(defn) {
	            if (defn instanceof CommandDefinition) {
	                this[defn.name] = defn;
	                this._byOpcode[defn.opcode] = defn;

	                if (defn.subsystem) {
	                    var commands = this._bySubsystem[defn.subsystem] || [];

	                    commands.push(defn);
	                    this._bySubsystem[defn.subsystem] = commands;
	                }
	            }
	        }
	    }, {
	        key: 'getByOpcode',


	        /**
	         * Returns the CommandDefinition with the given opcode.
	         */
	        value: function getByOpcode(opcode) {
	            return this._byOpcode[opcode];
	        }

	        /**
	         * Parses the given plain Javascript Object or JSON string and
	         * returns a new CommandDictionary, mapping packet names to
	         * PacketDefinitions.
	         */

	    }, {
	        key: 'bySubsystem',
	        get: function get() {
	            return this._bySubsystem;
	        }
	    }], [{
	        key: 'parse',
	        value: function parse(obj) {
	            var dict = new CommandDictionary();

	            if (typeof obj === 'string') {
	                obj = JSON.parse(obj);
	            }

	            for (var name in obj) {
	                dict.add(new CommandDefinition(obj[name]));
	            }

	            return dict;
	        }
	    }]);

	    return CommandDictionary;
	}();

	var CommandDefinition = function () {
	    function CommandDefinition(obj) {
	        _classCallCheck(this, CommandDefinition);

	        this._arguments = obj.arguments;
	        this._desc = obj.desc;
	        this._name = obj.name;
	        this._opcode = obj.opcode;
	        this._subsystem = obj.subsystem;
	        this._title = obj.title;
	    }

	    _createClass(CommandDefinition, [{
	        key: 'arguments',
	        get: function get() {
	            return this._arguments;
	        }
	    }, {
	        key: 'desc',
	        get: function get() {
	            return this._desc;
	        }
	    }, {
	        key: 'name',
	        get: function get() {
	            return this._name;
	        }
	    }, {
	        key: 'opcode',
	        get: function get() {
	            return this._opcode;
	        }
	    }, {
	        key: 'subsystem',
	        get: function get() {
	            return this._subsystem;
	        }
	    }, {
	        key: 'title',
	        get: function get() {
	            return this._title;
	        }
	    }], [{
	        key: 'parse',
	        value: function parse(obj) {
	            if (typeof obj === 'string') {
	                obj = JSON.parse(obj);
	            }

	            return new CommandDefinition(obj);
	        }
	    }]);

	    return CommandDefinition;
	}();

	exports.CommandDictionary = CommandDictionary;
	exports.CommandDefinition = CommandDefinition;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var EVRDictionary = function () {
	    /**
	     * Creates a new (empty) EVRDictionary.
	     */
	    function EVRDictionary() {
	        _classCallCheck(this, EVRDictionary);

	        this._codes = {};
	    }

	    /**
	     * Adds the given EVRDefinition to this EVRDictionary.
	     */


	    _createClass(EVRDictionary, [{
	        key: 'add',
	        value: function add(defn) {
	            if (defn instanceof EVRDefinition) {
	                this[defn.name] = defn;
	                this._codes[defn.code] = defn;
	            }
	        }

	        /**
	         * Returns the EVRDefinition with the given code.
	         */

	    }, {
	        key: 'getByCode',
	        value: function getByCode(code) {
	            return this._codes[code];
	        }

	        /**
	         * Parses the given plain Javascript Object or JSON string and
	         * returns a new EVRDictionary, mapping packet names to
	         * PacketDefinitions.
	         */

	    }], [{
	        key: 'parse',
	        value: function parse(obj) {
	            var dict = new EVRDictionary();

	            if (typeof obj === 'string') {
	                obj = JSON.parse(obj);
	            }

	            for (var n = 0; n < obj.length; ++n) {
	                dict.add(new EVRDefinition(obj[n]));
	            }

	            return dict;
	        }
	    }]);

	    return EVRDictionary;
	}();

	var EVRDefinition = function () {
	    function EVRDefinition(obj) {
	        _classCallCheck(this, EVRDefinition);

	        this._desc = obj.desc;
	        this._name = obj.name;
	        this._code = obj.code;
	    }

	    _createClass(EVRDefinition, [{
	        key: 'desc',
	        get: function get() {
	            return this._desc;
	        }
	    }, {
	        key: 'name',
	        get: function get() {
	            return this._name;
	        }
	    }, {
	        key: 'code',
	        get: function get() {
	            return this._code;
	        }
	    }], [{
	        key: 'parse',
	        value: function parse(obj) {
	            if (typeof obj === 'string') {
	                obj = JSON.parse(obj);
	            }

	            return new EVRDefinition(obj);
	        }
	    }]);

	    return EVRDefinition;
	}();

	exports.EVRDictionary = EVRDictionary;
	exports.EVRDefinition = EVRDefinition;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.tz = exports.time = exports.datetime = exports.date = undefined;

	var _time = __webpack_require__(12);

	function date(obj) {
	    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref$doy = _ref.doy,
	        doy = _ref$doy === undefined ? false : _ref$doy,
	        _ref$utc = _ref.utc,
	        utc = _ref$utc === undefined ? true : _ref$utc;

	    var yyyy = void 0,
	        mm = void 0,
	        dd = void 0,
	        formatted = void 0;
	    var date = normalize(obj);

	    if (utc) {
	        yyyy = date.getUTCFullYear();
	        mm = date.getUTCMonth();
	        dd = date.getUTCDate();
	    } else {
	        yyyy = date.getFullYear();
	        mm = date.getMonth();
	        dd = date.getDate();
	    }

	    if (doy) {
	        formatted = yyyy + '-' + pad3((0, _time.DOY)(yyyy, mm, dd));
	    } else {
	        formatted = yyyy + '-' + pad2(mm + 1) + '-' + pad2(dd);
	    }

	    return formatted;
	}

	function datetime(obj) {
	    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    return date(obj, opts) + ' ' + time(obj, opts) + ' ' + tz(obj, opts);
	}

	/**
	 * @returns a Javascript Date object given either a date string or a
	 * Javascript Date object.
	 */
	function normalize(obj) {
	    var result = obj;

	    if (typeof obj === 'string') {
	        result = Date.parse(obj);
	    } else if (typeof obj === 'number') {
	        result = new Date(obj);
	    }

	    return result;
	}

	/**
	 * @returns the number n, as a string, padded with a leading zero if
	 * less-than 10.
	 */
	function pad2(n) {
	    return n < 10 ? '0' + n : n;
	}

	/**
	 * @returns the number n, as a string, padded with one or two leading
	 * zero if less-than 100 and 10, respectively.
	 */
	function pad3(n) {
	    return n < 100 ? '0' + pad2(n) : n;
	}

	function time(obj) {
	    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref2$h = _ref2.h24,
	        h24 = _ref2$h === undefined ? true : _ref2$h,
	        _ref2$utc = _ref2.utc,
	        utc = _ref2$utc === undefined ? true : _ref2$utc;

	    var hh = void 0,
	        mm = void 0,
	        ss = void 0,
	        formatted = void 0;
	    var suffix = ' AM';
	    var time = normalize(obj);

	    if (utc) {
	        hh = time.getUTCHours();
	        mm = time.getUTCMinutes();
	        ss = time.getUTCSeconds();
	    } else {
	        hh = time.getHours();
	        mm = time.getMinutes();
	        ss = time.getSeconds();
	    }

	    if (!h24 && hh > 12) {
	        hh -= 12;
	        suffix = ' PM';
	    }

	    formatted = pad2(hh) + ':' + pad2(mm) + ':' + pad2(ss);

	    if (!h24) {
	        formatted += suffix;
	    }

	    return formatted;
	}

	function tz(obj) {
	    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	        _ref3$utc = _ref3.utc,
	        utc = _ref3$utc === undefined ? true : _ref3$utc;

	    return utc ? 'UTC' : (0, _time.timezone)(obj);
	}

	exports.date = date;
	exports.datetime = datetime;
	exports.time = time;
	exports.tz = tz;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * @returns the Day Of Year (DOY) for the given date.
	 */
	function DOY(year, month, day) {
	    var days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	    var doy = days[month] + day;
	    if (isLeap(year) && month >= 2) {
	        doy += 1;
	    }

	    return doy;
	}

	/**
	 * @returns true if year is a leap year, false otherwise.
	 */
	function isLeap(year) {
	    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
	}

	/**
	 * @returns the timezone string for the given Javascript Date.
	 */
	function timezone(date) {
	    var match = /\((\w+)\)$/.exec(date.toString());
	    return Array.isArray(match) && match.length > 1 ? match[1] : '';
	}

	exports.DOY = DOY;
	exports.isLeap = isLeap;
	exports.timezone = timezone;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.init = undefined;

	var _Clock = __webpack_require__(15);

	Object.keys(_Clock).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _Clock[key];
	        }
	    });
	});

	var _Field = __webpack_require__(16);

	Object.keys(_Field).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _Field[key];
	        }
	    });
	});

	var _Messages = __webpack_require__(19);

	Object.keys(_Messages).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _Messages[key];
	        }
	    });
	});

	var _Status = __webpack_require__(20);

	Object.keys(_Status).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _Status[key];
	        }
	    });
	});

	var _TabSet = __webpack_require__(21);

	Object.keys(_TabSet).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _TabSet[key];
	        }
	    });
	});

	var _Command = __webpack_require__(48);

	Object.keys(_Command).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _Command[key];
	        }
	    });
	});

	var _Sequence = __webpack_require__(173);

	Object.keys(_Sequence).forEach(function (key) {
	    if (key === "default" || key === "__esModule") return;
	    Object.defineProperty(exports, key, {
	        enumerable: true,
	        get: function get() {
	            return _Sequence[key];
	        }
	    });
	});

	var _filter = __webpack_require__(72);

	var _filter2 = _interopRequireDefault(_filter);

	var _map = __webpack_require__(161);

	var _map2 = _interopRequireDefault(_map);

	var _cmd = __webpack_require__(9);

	var _evr = __webpack_require__(10);

	var _tlm = __webpack_require__(174);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Registry = {};

	// NOTE: The `exports` symbol in the two lines below used to read
	// `bliss.gui` before I moved this code inside the `bliss.gui` module.
	// Looking at the Babel ES6 => ES5 transpiled code, `exports` resolves
	// as the current module.  I'm not sure whether reyling on `exports`
	// is valid ES6, but from my quick perusal of The ECMAScript 2015
	// Language Specification, Section 9.4.6 Module Namespace Exotic
	// Objects (p. 105), it just might be valid.

	Object.keys(exports).map(function (name) {
	    Registry['bliss-' + name.toLowerCase()] = exports[name];
	}

	/**
	 * @returns a plain Javascript object representation of the HTML
	 * element attributes in a DOM NamedNodeMap.  That is:
	 *
	 *     `<... name="value" ...>`
	 *
	 * pairs become:
	 *
	 * `{ ..., name: value, ... }`
	 *
	 * pairs.
	 */
	);function attrs2obj(attrs) {
	    var obj = {};

	    for (var n = 0; n < attrs.length; ++n) {
	        var item = attrs.item(n);
	        var value = item.value;

	        if (value == 'true') value = true;
	        if (value == 'false') value = false;

	        obj[item.name] = value;
	    }

	    return obj;
	}

	/**
	 * Creates a Mithril vnode for the given DOM element `elem`.
	 *
	 * @returns a Mithril vnode
	 */
	function createMithrilNode(elem) {
	    var node = null;

	    if (elem.nodeType == Node.ELEMENT_NODE) {
	        var name = elem.nodeName.toLowerCase();
	        var attrs = attrs2obj(elem.attributes);
	        var children = createMithrilNodes(elem.childNodes);

	        node = m(Registry[name] || name, attrs, children);
	    } else if (elem.nodeType == Node.TEXT_NODE) {
	        node = elem.nodeValue;
	    }

	    return node;
	}

	/**
	 * Creates a Mithril vnode for each DOM element in `elems`.
	 *
	 * @returns an array of Mithril vnodes.
	 */
	function createMithrilNodes(elems) {
	    return (0, _filter2.default)((0, _map2.default)(elems, createMithrilNode), function (n) {
	        return n !== null;
	    });
	}

	/**
	 * Initializes the BLISS GUI.
	 */
	function init() {
	    ready(function () {
	        var root = document.body;
	        var cloned = root.cloneNode(true);
	        var elems = (0, _map2.default)(cloned.childNodes, function (c) {
	            return c;
	        });

	        bliss.cmd = { dict: {} };
	        bliss.cmd.promise = m.request({ url: '/cmd/dict' });
	        bliss.cmd.promise.then(function (dict) {
	            bliss.cmd.dict = _cmd.CommandDictionary.parse(dict);
	        });

	        m.request({ url: '/evr/dict' }).then(function (dict) {
	            bliss.evr.dict = _evr.EVRDictionary.parse(dict);
	        });

	        m.request({ url: '/tlm/dict' }).then(function (dict) {
	            var url = 'ws://' + location.host + '/tlm/realtime';

	            bliss.tlm.dict = _tlm.TelemetryDictionary.parse(dict);
	            bliss.tlm.stream = new _tlm.TelemetryStream(url, bliss.tlm.dict);

	            bliss.events.on('bliss:tlm:packet', function () {
	                m.redraw();
	            });
	        });

	        var source = new EventSource('/events');
	        source.addEventListener('message', function (event) {
	            var e = JSON.parse(event.data);
	            bliss.events.emit(e.name, e.data);
	        });

	        bliss.events.on('cmd:submit', function () {
	            $('#commanding-modal').modal('hide');
	        });

	        m.mount(root, { view: function view() {
	                return createMithrilNodes(elems);
	            } });
	    });
	}

	/**
	 * Calls the given when the HTML document is loaded and ready.
	 */
	function ready(fn) {
	    if (document.readyState !== 'loading') {
	        fn();
	    } else {
	        document.addEventListener('DOMContentLoaded', fn);
	    }
	}

	exports.init = init;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v3.2.1
	 * https://jquery.com/
	 *
	 * Includes Sizzle.js
	 * https://sizzlejs.com/
	 *
	 * Copyright JS Foundation and other contributors
	 * Released under the MIT license
	 * https://jquery.org/license
	 *
	 * Date: 2017-03-20T18:59Z
	 */
	( function( global, factory ) {

		"use strict";

		if ( typeof module === "object" && typeof module.exports === "object" ) {

			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
	// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
	// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
	// enough that all such attempts are guarded in a try block.
	"use strict";

	var arr = [];

	var document = window.document;

	var getProto = Object.getPrototypeOf;

	var slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var fnToString = hasOwn.toString;

	var ObjectFunctionString = fnToString.call( Object );

	var support = {};



		function DOMEval( code, doc ) {
			doc = doc || document;

			var script = doc.createElement( "script" );

			script.text = code;
			doc.head.appendChild( script ).parentNode.removeChild( script );
		}
	/* global Symbol */
	// Defining this global in .eslintrc.json would create a danger of using the global
	// unguarded in another place, it seems safer to define global only for this module



	var
		version = "3.2.1",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},

		// Support: Android <=4.0 only
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([a-z])/g,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {

			// Return all the elements in a clean array
			if ( num == null ) {
				return slice.call( this );
			}

			// Return just the one element from the set
			return num < 0 ? this[ num + this.length ] : this[ num ];
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = Array.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && Array.isArray( src ) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},

		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function( obj ) {

			// As of jQuery 3.0, isNumeric is limited to
			// strings and numbers (primitives or objects)
			// that can be coerced to finite numbers (gh-2662)
			var type = jQuery.type( obj );
			return ( type === "number" || type === "string" ) &&

				// parseFloat NaNs numeric-cast false positives ("")
				// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
				// subtraction forces infinities to NaN
				!isNaN( obj - parseFloat( obj ) );
		},

		isPlainObject: function( obj ) {
			var proto, Ctor;

			// Detect obvious negatives
			// Use toString instead of jQuery.type to catch host objects
			if ( !obj || toString.call( obj ) !== "[object Object]" ) {
				return false;
			}

			proto = getProto( obj );

			// Objects with no prototype (e.g., `Object.create( null )`) are plain
			if ( !proto ) {
				return true;
			}

			// Objects with prototype are plain iff they were constructed by a global Object function
			Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
			return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
		},

		isEmptyObject: function( obj ) {

			/* eslint-disable no-unused-vars */
			// See https://github.com/eslint/eslint/issues/6125
			var name;

			for ( name in obj ) {
				return false;
			}
			return true;
		},

		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}

			// Support: Android <=2.3 only (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},

		// Evaluates a script in a global context
		globalEval: function( code ) {
			DOMEval( code );
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE <=9 - 11, Edge 12 - 13
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// Support: Android <=4.0 only
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		// Support: Android <=4.0 only, PhantomJS 1 only
		// push.apply(_, arraylike) throws on ancient WebKit
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;

			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}

			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: real iOS 8.2 only (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );

		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.3.3
	 * https://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-08-08
	 */
	(function( window ) {

	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// https://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,

		// CSS escapes
		// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// CSS string/identifier serialization
		// https://drafts.csswg.org/cssom/#common-serializing-idioms
		rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
		fcssescape = function( ch, asCodePoint ) {
			if ( asCodePoint ) {

				// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
				if ( ch === "\0" ) {
					return "\uFFFD";
				}

				// Control characters and (dependent upon position) numbers get escaped as code points
				return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
			}

			// Other potentially-special ASCII characters get backslash-escaped
			return "\\" + ch;
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		},

		disabledAncestor = addCombinator(
			function( elem ) {
				return elem.disabled === true && ("form" in elem || "label" in elem);
			},
			{ dir: "parentNode", next: "legend" }
		);

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {

			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

					// ID selector
					if ( (m = match[1]) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;

					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {

						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						while ( i-- ) {
							groups[i] = "#" + nid + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}

					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created element and returns a boolean result
	 */
	function assert( fn ) {
		var el = document.createElement("fieldset");

		try {
			return !!fn( el );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( el.parentNode ) {
				el.parentNode.removeChild( el );
			}
			// release memory in IE
			el = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				a.sourceIndex - b.sourceIndex;

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for :enabled/:disabled
	 * @param {Boolean} disabled true for :disabled; false for :enabled
	 */
	function createDisabledPseudo( disabled ) {

		// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
		return function( elem ) {

			// Only certain elements can match :enabled or :disabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
			// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
			if ( "form" in elem ) {

				// Check for inherited disabledness on relevant non-disabled elements:
				// * listed form-associated elements in a disabled fieldset
				//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
				// * option elements in a disabled optgroup
				//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
				// All such elements have a "form" property.
				if ( elem.parentNode && elem.disabled === false ) {

					// Option elements defer to a parent optgroup if present
					if ( "label" in elem ) {
						if ( "label" in elem.parentNode ) {
							return elem.parentNode.disabled === disabled;
						} else {
							return elem.disabled === disabled;
						}
					}

					// Support: IE 6 - 11
					// Use the isDisabled shortcut property to check for disabled fieldset ancestors
					return elem.isDisabled === disabled ||

						// Where there is no isDisabled, check manually
						/* jshint -W018 */
						elem.isDisabled !== !disabled &&
							disabledAncestor( elem ) === disabled;
				}

				return elem.disabled === disabled;

			// Try to winnow out elements that can't be disabled before trusting the disabled property.
			// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
			// even exist on them, let alone have a boolean value.
			} else if ( "label" in elem ) {
				return elem.disabled === disabled;
			}

			// Remaining elements are neither :enabled nor :disabled
			return false;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, subWindow,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( preferredDoc !== document &&
			(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

			// Support: IE 11, Edge
			if ( subWindow.addEventListener ) {
				subWindow.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( subWindow.attachEvent ) {
				subWindow.attachEvent( "onunload", unloadHandler );
			}
		}

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( el ) {
			el.className = "i";
			return !el.getAttribute("className");
		});

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( el ) {
			el.appendChild( document.createComment("") );
			return !el.getElementsByTagName("*").length;
		});

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programmatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( el ) {
			docElem.appendChild( el ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});

		// ID filter and find
		if ( support.getById ) {
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var elem = context.getElementById( id );
					return elem ? [ elem ] : [];
				}
			};
		} else {
			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};

			// Support: IE 6 - 7 only
			// getElementById is not reliable as a find shortcut
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var node, i, elems,
						elem = context.getElementById( id );

					if ( elem ) {

						// Verify the id attribute
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}

						// Fall back on getElementsByName
						elems = context.getElementsByName( id );
						i = 0;
						while ( (elem = elems[i++]) ) {
							node = elem.getAttributeNode("id");
							if ( node && node.value === id ) {
								return [ elem ];
							}
						}
					}

					return [];
				}
			};
		}

		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See https://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( el ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// https://bugs.jquery.com/ticket/12359
				docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( el.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !el.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !el.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibling-combinator selector` fails
				if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});

			assert(function( el ) {
				el.innerHTML = "<a href='' disabled='disabled'></a>" +
					"<select disabled='disabled'><option/></select>";

				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				el.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( el.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( el.querySelectorAll(":enabled").length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Support: IE9-11+
				// IE's :disabled selector does not pick up the children of disabled fieldsets
				docElem.appendChild( el ).disabled = true;
				if ( el.querySelectorAll(":disabled").length !== 2 ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				el.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {

			assert(function( el ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( el, "*" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( el, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}

			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );

		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};

	Sizzle.escape = function( sel ) {
		return (sel + "").replace( rcssescape, fcssescape );
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},

			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( (node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),

			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),

			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": createDisabledPseudo( false ),
			"disabled": createDisabledPseudo( true ),

			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},

			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),

			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),

			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),

			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			skip = combinator.next,
			key = skip || dir,
			checkNonElements = base && key === "parentNode",
			doneName = done++;

		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
				return false;
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

							if ( skip && skip === elem.nodeName.toLowerCase() ) {
								elem = elem[ dir ] || elem;
							} else if ( (oldCache = uniqueCache[ key ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ key ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
				return false;
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( el ) {
		// Should return 1, but returns 4 (following)
		return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( el ) {
		el.innerHTML = "<a href='#'></a>";
		return el.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( el ) {
		el.innerHTML = "<input/>";
		el.firstChild.setAttribute( "value", "" );
		return el.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( el ) {
		return el.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}

	return Sizzle;

	})( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;

	// Deprecated
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	jQuery.escapeSelector = Sizzle.escape;




	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;



	function nodeName( elem, name ) {

	  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

	};
	var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
		}

		// Single element
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
		}

		// Arraylike of elements (jQuery, arguments, Array)
		if ( typeof qualifier !== "string" ) {
			return jQuery.grep( elements, function( elem ) {
				return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
			} );
		}

		// Simple selector that can be filtered directly, removing non-Elements
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		// Complex selector, compare the two sets, removing non-Elements
		qualifier = jQuery.filter( qualifier, elements );
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not && elem.nodeType === 1;
		} );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		if ( elems.length === 1 && elem.nodeType === 1 ) {
			return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
		}

		return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i, ret,
				len = this.length,
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			ret = this.pushStack( [] );

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			return len > 1 ? jQuery.uniqueSort( ret ) : ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		// Shortcut simple #id case for speed
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						if ( elem ) {

							// Inject the element directly into the jQuery object
							this[ 0 ] = elem;
							this.length = 1;
						}
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				targets = typeof selectors !== "string" && jQuery( selectors );

			// Positional selectors never match, since there's no _selection_ context
			if ( !rneedsContext.test( selectors ) ) {
				for ( ; i < l; i++ ) {
					for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

						// Always skip document fragments
						if ( cur.nodeType < 11 && ( targets ?
							targets.index( cur ) > -1 :

							// Don't pass non-elements to Sizzle
							cur.nodeType === 1 &&
								jQuery.find.matchesSelector( cur, selectors ) ) ) {

							matched.push( cur );
							break;
						}
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
	        if ( nodeName( elem, "iframe" ) ) {
	            return elem.contentDocument;
	        }

	        // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
	        // Treat the template element as a regular one in browsers that
	        // don't support it.
	        if ( nodeName( elem, "template" ) ) {
	            elem = elem.content || elem;
	        }

	        return jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = locked || options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory && !firing ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	function Identity( v ) {
		return v;
	}
	function Thrower( ex ) {
		throw ex;
	}

	function adoptValue( value, resolve, reject, noValue ) {
		var method;

		try {

			// Check for promise aspect first to privilege synchronous behavior
			if ( value && jQuery.isFunction( ( method = value.promise ) ) ) {
				method.call( value ).done( resolve ).fail( reject );

			// Other thenables
			} else if ( value && jQuery.isFunction( ( method = value.then ) ) ) {
				method.call( value, resolve, reject );

			// Other non-thenables
			} else {

				// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
				// * false: [ value ].slice( 0 ) => resolve( value )
				// * true: [ value ].slice( 1 ) => resolve()
				resolve.apply( undefined, [ value ].slice( noValue ) );
			}

		// For Promises/A+, convert exceptions into rejections
		// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
		// Deferred#then to conditionally suppress rejection.
		} catch ( value ) {

			// Support: Android 4.0 only
			// Strict mode functions invoked without .call/.apply get global-object context
			reject.apply( undefined, [ value ] );
		}
	}

	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, callbacks,
					// ... .then handlers, argument index, [final state]
					[ "notify", "progress", jQuery.Callbacks( "memory" ),
						jQuery.Callbacks( "memory" ), 2 ],
					[ "resolve", "done", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 0, "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ),
						jQuery.Callbacks( "once memory" ), 1, "rejected" ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					"catch": function( fn ) {
						return promise.then( null, fn );
					},

					// Keep pipe for back-compat
					pipe: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;

						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {

								// Map tuples (progress, done, fail) to arguments (done, fail, progress)
								var fn = jQuery.isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

								// deferred.progress(function() { bind to newDefer or newDefer.notify })
								// deferred.done(function() { bind to newDefer or newDefer.resolve })
								// deferred.fail(function() { bind to newDefer or newDefer.reject })
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
					then: function( onFulfilled, onRejected, onProgress ) {
						var maxDepth = 0;
						function resolve( depth, deferred, handler, special ) {
							return function() {
								var that = this,
									args = arguments,
									mightThrow = function() {
										var returned, then;

										// Support: Promises/A+ section 2.3.3.3.3
										// https://promisesaplus.com/#point-59
										// Ignore double-resolution attempts
										if ( depth < maxDepth ) {
											return;
										}

										returned = handler.apply( that, args );

										// Support: Promises/A+ section 2.3.1
										// https://promisesaplus.com/#point-48
										if ( returned === deferred.promise() ) {
											throw new TypeError( "Thenable self-resolution" );
										}

										// Support: Promises/A+ sections 2.3.3.1, 3.5
										// https://promisesaplus.com/#point-54
										// https://promisesaplus.com/#point-75
										// Retrieve `then` only once
										then = returned &&

											// Support: Promises/A+ section 2.3.4
											// https://promisesaplus.com/#point-64
											// Only check objects and functions for thenability
											( typeof returned === "object" ||
												typeof returned === "function" ) &&
											returned.then;

										// Handle a returned thenable
										if ( jQuery.isFunction( then ) ) {

											// Special processors (notify) just wait for resolution
											if ( special ) {
												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special )
												);

											// Normal processors (resolve) also hook into progress
											} else {

												// ...and disregard older resolution values
												maxDepth++;

												then.call(
													returned,
													resolve( maxDepth, deferred, Identity, special ),
													resolve( maxDepth, deferred, Thrower, special ),
													resolve( maxDepth, deferred, Identity,
														deferred.notifyWith )
												);
											}

										// Handle all other returned values
										} else {

											// Only substitute handlers pass on context
											// and multiple values (non-spec behavior)
											if ( handler !== Identity ) {
												that = undefined;
												args = [ returned ];
											}

											// Process the value(s)
											// Default process is resolve
											( special || deferred.resolveWith )( that, args );
										}
									},

									// Only normal processors (resolve) catch and reject exceptions
									process = special ?
										mightThrow :
										function() {
											try {
												mightThrow();
											} catch ( e ) {

												if ( jQuery.Deferred.exceptionHook ) {
													jQuery.Deferred.exceptionHook( e,
														process.stackTrace );
												}

												// Support: Promises/A+ section 2.3.3.3.4.1
												// https://promisesaplus.com/#point-61
												// Ignore post-resolution exceptions
												if ( depth + 1 >= maxDepth ) {

													// Only substitute handlers pass on context
													// and multiple values (non-spec behavior)
													if ( handler !== Thrower ) {
														that = undefined;
														args = [ e ];
													}

													deferred.rejectWith( that, args );
												}
											}
										};

								// Support: Promises/A+ section 2.3.3.3.1
								// https://promisesaplus.com/#point-57
								// Re-resolve promises immediately to dodge false rejection from
								// subsequent errors
								if ( depth ) {
									process();
								} else {

									// Call an optional hook to record the stack, in case of exception
									// since it's otherwise lost when execution goes async
									if ( jQuery.Deferred.getStackHook ) {
										process.stackTrace = jQuery.Deferred.getStackHook();
									}
									window.setTimeout( process );
								}
							};
						}

						return jQuery.Deferred( function( newDefer ) {

							// progress_handlers.add( ... )
							tuples[ 0 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onProgress ) ?
										onProgress :
										Identity,
									newDefer.notifyWith
								)
							);

							// fulfilled_handlers.add( ... )
							tuples[ 1 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onFulfilled ) ?
										onFulfilled :
										Identity
								)
							);

							// rejected_handlers.add( ... )
							tuples[ 2 ][ 3 ].add(
								resolve(
									0,
									newDefer,
									jQuery.isFunction( onRejected ) ?
										onRejected :
										Thrower
								)
							);
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 5 ];

				// promise.progress = list.add
				// promise.done = list.add
				// promise.fail = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add(
						function() {

							// state = "resolved" (i.e., fulfilled)
							// state = "rejected"
							state = stateString;
						},

						// rejected_callbacks.disable
						// fulfilled_callbacks.disable
						tuples[ 3 - i ][ 2 ].disable,

						// progress_callbacks.lock
						tuples[ 0 ][ 2 ].lock
					);
				}

				// progress_handlers.fire
				// fulfilled_handlers.fire
				// rejected_handlers.fire
				list.add( tuple[ 3 ].fire );

				// deferred.notify = function() { deferred.notifyWith(...) }
				// deferred.resolve = function() { deferred.resolveWith(...) }
				// deferred.reject = function() { deferred.rejectWith(...) }
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
					return this;
				};

				// deferred.notifyWith = list.fireWith
				// deferred.resolveWith = list.fireWith
				// deferred.rejectWith = list.fireWith
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( singleValue ) {
			var

				// count of uncompleted subordinates
				remaining = arguments.length,

				// count of unprocessed arguments
				i = remaining,

				// subordinate fulfillment data
				resolveContexts = Array( i ),
				resolveValues = slice.call( arguments ),

				// the master Deferred
				master = jQuery.Deferred(),

				// subordinate callback factory
				updateFunc = function( i ) {
					return function( value ) {
						resolveContexts[ i ] = this;
						resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( !( --remaining ) ) {
							master.resolveWith( resolveContexts, resolveValues );
						}
					};
				};

			// Single- and empty arguments are adopted like Promise.resolve
			if ( remaining <= 1 ) {
				adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
					!remaining );

				// Use .then() to unwrap secondary thenables (cf. gh-3000)
				if ( master.state() === "pending" ||
					jQuery.isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

					return master.then();
				}
			}

			// Multiple arguments are aggregated like Promise.all array elements
			while ( i-- ) {
				adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
			}

			return master.promise();
		}
	} );


	// These usually indicate a programmer mistake during development,
	// warn about them ASAP rather than swallowing them by default.
	var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

	jQuery.Deferred.exceptionHook = function( error, stack ) {

		// Support: IE 8 - 9 only
		// Console exists when dev tools are open, which can happen at any time
		if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
			window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
		}
	};




	jQuery.readyException = function( error ) {
		window.setTimeout( function() {
			throw error;
		} );
	};




	// The deferred used on DOM ready
	var readyList = jQuery.Deferred();

	jQuery.fn.ready = function( fn ) {

		readyList
			.then( fn )

			// Wrap jQuery.readyException in a function so that the lookup
			// happens at the time of error handling instead of callback
			// registration.
			.catch( function( error ) {
				jQuery.readyException( error );
			} );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
		}
	} );

	jQuery.ready.then = readyList.then;

	// The ready event handler and self cleanup method
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE <=9 - 10 only
	// Older IE sometimes signals "interactive" too soon
	if ( document.readyState === "complete" ||
		( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

		// Handle it asynchronously to allow scripts the opportunity to delay ready
		window.setTimeout( jQuery.ready );

	} else {

		// Use the handy event callback
		document.addEventListener( "DOMContentLoaded", completed );

		// A fallback to window.onload, that will always work
		window.addEventListener( "load", completed );
	}




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		if ( chainable ) {
			return elems;
		}

		// Gets
		if ( bulk ) {
			return fn.call( elems );
		}

		return len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		cache: function( owner ) {

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			// Always use camelCase key (gh-2257)
			if ( typeof data === "string" ) {
				cache[ jQuery.camelCase( data ) ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ jQuery.camelCase( prop ) ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :

				// Always use camelCase key (gh-2257)
				owner[ this.expando ] && owner[ this.expando ][ jQuery.camelCase( key ) ];
		},
		access: function( owner, key, value ) {

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				return this.get( owner, key );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key !== undefined ) {

				// Support array or space separated string of keys
				if ( Array.isArray( key ) ) {

					// If key is an array of keys...
					// We always set camelCase keys, so remove that.
					key = key.map( jQuery.camelCase );
				} else {
					key = jQuery.camelCase( key );

					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					key = key in cache ?
						[ key ] :
						( key.match( rnothtmlwhite ) || [] );
				}

				i = key.length;

				while ( i-- ) {
					delete cache[ key[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <=35 - 45
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function getData( data ) {
		if ( data === "true" ) {
			return true;
		}

		if ( data === "false" ) {
			return false;
		}

		if ( data === "null" ) {
			return null;
		}

		// Only convert to a number if it doesn't change the string
		if ( data === +data + "" ) {
			return +data;
		}

		if ( rbrace.test( data ) ) {
			return JSON.parse( data );
		}

		return data;
	}

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = getData( data );
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE 11 only
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// The key will always be camelCased in Data
					data = dataUser.get( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, key );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				this.each( function() {

					// We always store the camelCased key
					dataUser.set( this, key, value );
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || Array.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var isHiddenWithinTree = function( elem, el ) {

			// isHiddenWithinTree might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;

			// Inline style trumps all
			return elem.style.display === "none" ||
				elem.style.display === "" &&

				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.
				jQuery.contains( elem.ownerDocument, elem ) &&

				jQuery.css( elem, "display" ) === "none";
		};

	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};




	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() {
					return tween.cur();
				} :
				function() {
					return jQuery.css( elem, prop, "" );
				},
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}


	var defaultDisplayMap = {};

	function getDefaultDisplay( elem ) {
		var temp,
			doc = elem.ownerDocument,
			nodeName = elem.nodeName,
			display = defaultDisplayMap[ nodeName ];

		if ( display ) {
			return display;
		}

		temp = doc.body.appendChild( doc.createElement( nodeName ) );
		display = jQuery.css( temp, "display" );

		temp.parentNode.removeChild( temp );

		if ( display === "none" ) {
			display = "block";
		}
		defaultDisplayMap[ nodeName ] = display;

		return display;
	}

	function showHide( elements, show ) {
		var display, elem,
			values = [],
			index = 0,
			length = elements.length;

		// Determine new display value for elements that need to change
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			display = elem.style.display;
			if ( show ) {

				// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
				// check is required in this first loop unless we have a nonempty display value (either
				// inline or about-to-be-restored)
				if ( display === "none" ) {
					values[ index ] = dataPriv.get( elem, "display" ) || null;
					if ( !values[ index ] ) {
						elem.style.display = "";
					}
				}
				if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
					values[ index ] = getDefaultDisplay( elem );
				}
			} else {
				if ( display !== "none" ) {
					values[ index ] = "none";

					// Remember what we're overwriting
					dataPriv.set( elem, "display", display );
				}
			}
		}

		// Set the display of the elements in a second loop to avoid constant reflow
		for ( index = 0; index < length; index++ ) {
			if ( values[ index ] != null ) {
				elements[ index ].style.display = values[ index ];
			}
		}

		return elements;
	}

	jQuery.fn.extend( {
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHiddenWithinTree( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );

	var rscriptType = ( /^$|\/(?:java|ecma)script/i );



	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// Support: IE <=9 only
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	// Support: IE <=9 only
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;


	function getAll( context, tag ) {

		// Support: IE <=9 - 11 only
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret;

		if ( typeof context.getElementsByTagName !== "undefined" ) {
			ret = context.getElementsByTagName( tag || "*" );

		} else if ( typeof context.querySelectorAll !== "undefined" ) {
			ret = context.querySelectorAll( tag || "*" );

		} else {
			ret = [];
		}

		if ( tag === undefined || tag && nodeName( context, tag ) ) {
			return jQuery.merge( [ context ], ret );
		}

		return ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android <=4.0 only, PhantomJS 1 only
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0 - 4.3 only
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Android <=4.1 only
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE <=11 only
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();
	var documentElement = document.documentElement;



	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE <=9 only
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Ensure that invalid selectors throw exceptions at attach time
			// Evaluate against documentElement in case elem is a non-element node (e.g., document)
			if ( selector ) {
				jQuery.find.matchesSelector( documentElement, selector );
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( nativeEvent ) {

			// Make a writable jQuery.Event from the native event object
			var event = jQuery.event.fix( nativeEvent );

			var i, j, ret, matched, handleObj, handlerQueue,
				args = new Array( arguments.length ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;

			for ( i = 1; i < arguments.length; i++ ) {
				args[ i ] = arguments[ i ];
			}

			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, handleObj, sel, matchedHandlers, matchedSelectors,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Find delegate handlers
			if ( delegateCount &&

				// Support: IE <=9
				// Black-hole SVG <use> instance trees (trac-13180)
				cur.nodeType &&

				// Support: Firefox <=42
				// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
				// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
				// Support: IE 11 only
				// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
				!( event.type === "click" && event.button >= 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
						matchedHandlers = [];
						matchedSelectors = {};
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matchedSelectors[ sel ] === undefined ) {
								matchedSelectors[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matchedSelectors[ sel ] ) {
								matchedHandlers.push( handleObj );
							}
						}
						if ( matchedHandlers.length ) {
							handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			cur = this;
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		addProp: function( name, hook ) {
			Object.defineProperty( jQuery.Event.prototype, name, {
				enumerable: true,
				configurable: true,

				get: jQuery.isFunction( hook ) ?
					function() {
						if ( this.originalEvent ) {
								return hook( this.originalEvent );
						}
					} :
					function() {
						if ( this.originalEvent ) {
								return this.originalEvent[ name ];
						}
					},

				set: function( value ) {
					Object.defineProperty( this, name, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: value
					} );
				}
			} );
		},

		fix: function( originalEvent ) {
			return originalEvent[ jQuery.expando ] ?
				originalEvent :
				new jQuery.Event( originalEvent );
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {

				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {

				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android <=2.3 only
					src.returnValue === false ?
				returnTrue :
				returnFalse;

			// Create target properties
			// Support: Safari <=6 - 7 only
			// Target should not be a text node (#504, #13143)
			this.target = ( src.target && src.target.nodeType === 3 ) ?
				src.target.parentNode :
				src.target;

			this.currentTarget = src.currentTarget;
			this.relatedTarget = src.relatedTarget;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		isSimulated: false,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e && !this.isSimulated ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e && !this.isSimulated ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Includes all common event props including KeyEvent and MouseEvent specific props
	jQuery.each( {
		altKey: true,
		bubbles: true,
		cancelable: true,
		changedTouches: true,
		ctrlKey: true,
		detail: true,
		eventPhase: true,
		metaKey: true,
		pageX: true,
		pageY: true,
		shiftKey: true,
		view: true,
		"char": true,
		charCode: true,
		key: true,
		keyCode: true,
		button: true,
		buttons: true,
		clientX: true,
		clientY: true,
		offsetX: true,
		offsetY: true,
		pointerId: true,
		pointerType: true,
		screenX: true,
		screenY: true,
		targetTouches: true,
		toElement: true,
		touches: true,

		which: function( event ) {
			var button = event.button;

			// Add which for key events
			if ( event.which == null && rkeyEvent.test( event.type ) ) {
				return event.charCode != null ? event.charCode : event.keyCode;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
				if ( button & 1 ) {
					return 1;
				}

				if ( button & 2 ) {
					return 3;
				}

				if ( button & 4 ) {
					return 2;
				}

				return 0;
			}

			return event.which;
		}
	}, jQuery.event.addProp );

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {

		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var

		/* eslint-disable max-len */

		// See https://github.com/eslint/eslint/issues/3229
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

		/* eslint-enable */

		// Support: IE <=10 - 11, Edge 12 - 13
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	// Prefer a tbody over its parent table for containing new rows
	function manipulationTarget( elem, content ) {
		if ( nodeName( elem, "table" ) &&
			nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

			return jQuery( ">tbody", elem )[ 0 ] || elem;
		}

		return elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );

		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;

			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android <=4.0 only, PhantomJS 1 only
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								DOMEval( node.textContent.replace( rcleanScript, "" ), doc );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <=35 - 45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {
		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: Android <=4.0 only, PhantomJS 1 only
				// .get() because push.apply(_, arraylike) throws on ancient WebKit
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );
	var rmargin = ( /^margin/ );

	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};



	( function() {

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {

			// This is a singleton, we need to execute it only once
			if ( !div ) {
				return;
			}

			div.style.cssText =
				"box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";

			// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";

			documentElement.removeChild( container );

			// Nullify the div so it wouldn't be stored in the memory and
			// it will also be a sign that checks already performed
			div = null;
		}

		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE <=9 - 11 only
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );

		jQuery.extend( support, {
			pixelPosition: function() {
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				computeStyleTests();
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {
				computeStyleTests();
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {
				computeStyleTests();
				return reliableMarginLeftVal;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,

			// Support: Firefox 51+
			// Retrieving style before computed somehow
			// fixes an issue with getting wrong values
			// on detached elements
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is needed for:
		//   .css('filter') (IE 9 only, #12537)
		//   .css('--customProperty) (#3144)
		if ( computed ) {
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// https://drafts.csswg.org/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE <=9 - 11 only
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		rcustomProp = /^--/,
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},

		cssPrefixes = [ "Webkit", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	// Return a property mapped along what jQuery.cssProps suggests or to
	// a vendor prefixed property.
	function finalPropName( name ) {
		var ret = jQuery.cssProps[ name ];
		if ( !ret ) {
			ret = jQuery.cssProps[ name ] = vendorPropName( name ) || name;
		}
		return ret;
	}

	function setPositiveNumber( elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i,
			val = 0;

		// If we already have the right measurement, avoid augmentation
		if ( extra === ( isBorderBox ? "border" : "content" ) ) {
			i = 4;

		// Otherwise initialize for horizontal or vertical properties
		} else {
			i = name === "width" ? 1 : 0;
		}

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}

			if ( isBorderBox ) {

				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {

				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		return val;
	}

	function getWidthOrHeight( elem, name, extra ) {

		// Start with computed style
		var valueIsBorderBox,
			styles = getStyles( elem ),
			val = curCSS( elem, name, styles ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Fall back to offsetWidth/Height when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		if ( val === "auto" ) {
			val = elem[ "offset" + name[ 0 ].toUpperCase() + name.slice( 1 ) ];
		}

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;

		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				isCustomProp = rcustomProp.test( name ),
				style = elem.style;

			// Make sure that we're working with the right name. We don't
			// want to query the value if it is a CSS custom property
			// since they are user-defined.
			if ( !isCustomProp ) {
				name = finalPropName( origName );
			}

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					if ( isCustomProp ) {
						style.setProperty( name, value );
					} else {
						style[ name ] = value;
					}
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name ),
				isCustomProp = rcustomProp.test( name );

			// Make sure that we're working with the right name. We don't
			// want to modify the value if it is a CSS custom property
			// since they are user-defined.
			if ( !isCustomProp ) {
				name = finalPropName( origName );
			}

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}

			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

						// Support: Safari 8+
						// Table columns in Safari have non-zero offsetWidth & zero
						// getBoundingClientRect().width unless display is changed.
						// Support: IE <=11 only
						// Running getBoundingClientRect on a disconnected node
						// in IE throws an error.
						( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( Array.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE <=9 only
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, inProgress,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	function schedule() {
		if ( inProgress ) {
			if ( document.hidden === false && window.requestAnimationFrame ) {
				window.requestAnimationFrame( schedule );
			} else {
				window.setTimeout( schedule, jQuery.fx.interval );
			}

			jQuery.fx.tick();
		}
	}

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
			isBox = "width" in props || "height" in props,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHiddenWithinTree( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Queue-skipping animations hijack the fx hooks
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Detect show/hide animations
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.test( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// Pretend to be hidden if this is a "show" and
					// there is still data from a stopped show/hide
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;

					// Ignore all other no-op show/hide data
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
			}
		}

		// Bail out if this is a no-op like .hide().hide()
		propTween = !jQuery.isEmptyObject( props );
		if ( !propTween && jQuery.isEmptyObject( orig ) ) {
			return;
		}

		// Restrict "overflow" and "display" styles during box animations
		if ( isBox && elem.nodeType === 1 ) {

			// Support: IE <=9 - 11, Edge 12 - 13
			// Record all 3 overflow attributes because IE does not infer the shorthand
			// from identically-valued overflowX and overflowY
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Identify a display type, preferring old show/hide data over the CSS cascade
			restoreDisplay = dataShow && dataShow.display;
			if ( restoreDisplay == null ) {
				restoreDisplay = dataPriv.get( elem, "display" );
			}
			display = jQuery.css( elem, "display" );
			if ( display === "none" ) {
				if ( restoreDisplay ) {
					display = restoreDisplay;
				} else {

					// Get nonempty value(s) by temporarily forcing visibility
					showHide( [ elem ], true );
					restoreDisplay = elem.style.display || restoreDisplay;
					display = jQuery.css( elem, "display" );
					showHide( [ elem ] );
				}
			}

			// Animate inline elements as inline-block
			if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
				if ( jQuery.css( elem, "float" ) === "none" ) {

					// Restore the original display value at the end of pure show/hide animations
					if ( !propTween ) {
						anim.done( function() {
							style.display = restoreDisplay;
						} );
						if ( restoreDisplay == null ) {
							display = style.display;
							restoreDisplay = display === "none" ? "" : display;
						}
					}
					style.display = "inline-block";
				}
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// Implement show/hide animations
		propTween = false;
		for ( prop in orig ) {

			// General show/hide setup for this element animation
			if ( !propTween ) {
				if ( dataShow ) {
					if ( "hidden" in dataShow ) {
						hidden = dataShow.hidden;
					}
				} else {
					dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
				}

				// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
				if ( toggle ) {
					dataShow.hidden = !hidden;
				}

				// Show elements before animating them
				if ( hidden ) {
					showHide( [ elem ], true );
				}

				/* eslint-disable no-loop-func */

				anim.done( function() {

				/* eslint-enable no-loop-func */

					// The final step of a "hide" animation is actually hiding the element
					if ( !hidden ) {
						showHide( [ elem ] );
					}
					dataPriv.remove( elem, "fxshow" );
					for ( prop in orig ) {
						jQuery.style( elem, prop, orig[ prop ] );
					}
				} );
			}

			// Per-property setup
			propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = propTween.start;
				if ( hidden ) {
					propTween.end = propTween.start;
					propTween.start = 0;
				}
			}
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( Array.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3 only
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				// If there's more to do, yield
				if ( percent < 1 && length ) {
					return remaining;
				}

				// If this was an empty animation, synthesize a final progress notification
				if ( !length ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
				}

				// Resolve the animation and report its conclusion
				deferred.resolveWith( elem, [ animation ] );
				return false;
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		// Attach callbacks from options
		animation
			.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		return animation;
	}

	jQuery.Animation = jQuery.extend( Animation, {

		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnothtmlwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		// Go to the end state if fx are off
		if ( jQuery.fx.off ) {
			opt.duration = 0;

		} else {
			if ( typeof opt.duration !== "number" ) {
				if ( opt.duration in jQuery.fx.speeds ) {
					opt.duration = jQuery.fx.speeds[ opt.duration ];

				} else {
					opt.duration = jQuery.fx.speeds._default;
				}
			}
		}

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = jQuery.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Run the timer and safely remove it when done (allowing for external removal)
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		jQuery.fx.start();
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( inProgress ) {
			return;
		}

		inProgress = true;
		schedule();
	};

	jQuery.fx.stop = function() {
		inProgress = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: Android <=4.3 only
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE <=11 only
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: IE <=11 only
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// Attribute hooks are determined by the lowercase version
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name,
				i = 0,

				// Attribute names can contain non-HTML whitespace characters
				// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
				attrNames = value && value.match( rnothtmlwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};

	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle,
				lowercaseName = name.toLowerCase();

			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ lowercaseName ];
				attrHandle[ lowercaseName ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					lowercaseName :
					null;
				attrHandle[ lowercaseName ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// Support: IE <=9 - 11 only
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					if ( tabindex ) {
						return parseInt( tabindex, 10 );
					}

					if (
						rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) &&
						elem.href
					) {
						return 0;
					}

					return -1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	// eslint rule "no-unused-expressions" is disabled for this code
	// since it considers such accessions noop
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {

				/* eslint no-unused-expressions: "off" */

				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




		// Strip and collapse whitespace according to HTML spec
		// https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
		function stripAndCollapse( value ) {
			var tokens = value.match( rnothtmlwhite ) || [];
			return tokens.join( " " );
		}


	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnothtmlwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnothtmlwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = stripAndCollapse( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value;

			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( type === "string" ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnothtmlwhite ) || [];

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
						return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					// Handle most common string cases
					if ( typeof ret === "string" ) {
						return ret.replace( rreturn, "" );
					}

					// Handle cases where value is null/undef or number
					return ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( Array.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE <=10 - 11 only
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						stripAndCollapse( jQuery.text( elem ) );
				}
			},
			select: {
				get: function( elem ) {
					var value, option, i,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one",
						values = one ? null : [],
						max = one ? index + 1 : options.length;

					if ( index < 0 ) {
						i = max;

					} else {
						i = one ? index : 0;
					}

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// Support: IE <=9 only
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								!option.disabled &&
								( !option.parentNode.disabled ||
									!nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];

						/* eslint-disable no-cond-assign */

						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}

						/* eslint-enable no-cond-assign */
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( Array.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		// Used only for `focus(in | out)` events
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
				}
			);

			jQuery.event.trigger( e, null, elem );
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup contextmenu" ).split( " " ),
		function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );

	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );




	support.focusin = "onfocusin" in window;


	// Support: Firefox <=44
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = jQuery.now();

	var rquery = ( /\?/ );



	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE 9 - 11 only
		// IE throws on parseFromString with invalid input.
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( Array.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && jQuery.type( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, valueOrFunction ) {

				// If value is a function, invoke it and use its return value
				var value = jQuery.isFunction( valueOrFunction ) ?
					valueOrFunction() :
					valueOrFunction;

				s[ s.length ] = encodeURIComponent( key ) + "=" +
					encodeURIComponent( value == null ? "" : value );
			};

		// If an array was passed in, assume that it is an array of form elements.
		if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				if ( val == null ) {
					return null;
				}

				if ( Array.isArray( val ) ) {
					return jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} );
				}

				return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	var
		r20 = /%20/g,
		rhash = /#.*$/,
		rantiCache = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

			if ( jQuery.isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

				// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",

			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": JSON.parse,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// Request state (becomes false upon send and true upon completion)
				completed,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// uncached part of the url
				uncached,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( completed ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return completed ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						if ( completed == null ) {
							name = requestHeadersNames[ name.toLowerCase() ] =
								requestHeadersNames[ name.toLowerCase() ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( completed == null ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( completed ) {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							} else {

								// Lazy-add the new callbacks in a way that preserves old ones
								for ( code in map ) {
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR );

			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE <=8 - 11, Edge 12 - 13
				// IE throws exception on accessing the href property if url is malformed,
				// e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE <=8 - 11 only
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( completed ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			// Remove hash to simplify url manipulation
			cacheURL = s.url.replace( rhash, "" );

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// Remember the hash so we can put it back
				uncached = s.url.slice( cacheURL.length );

				// If data is available, append data to url
				if ( s.data ) {
					cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add or update anti-cache param if needed
				if ( s.cache === false ) {
					cacheURL = cacheURL.replace( rantiCache, "$1" );
					uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
				}

				// Put hash and anti-cache on the URL that will be requested (gh-1732)
				s.url = cacheURL + uncached;

			// Change '%20' to '+' if this is encoded form body content (gh-2658)
			} else if ( s.data && s.processData &&
				( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
				s.data = s.data.replace( r20, "+" );
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			completeDeferred.add( s.complete );
			jqXHR.done( s.success );
			jqXHR.fail( s.error );

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( completed ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					completed = false;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Rethrow post-completion exceptions
					if ( completed ) {
						throw e;
					}

					// Propagate others as results
					done( -1, e );
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Ignore repeat invocations
				if ( completed ) {
					return;
				}

				completed = true;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );


	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			cache: true,
			async: false,
			global: false,
			"throws": true
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( this[ 0 ] ) {
				if ( jQuery.isFunction( html ) ) {
					html = html.call( this[ 0 ] );
				}

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function( selector ) {
			this.parent( selector ).not( "body" ).each( function() {
				jQuery( this ).replaceWith( this.childNodes );
			} );
			return this;
		}
	} );


	jQuery.expr.pseudos.hidden = function( elem ) {
		return !jQuery.expr.pseudos.visible( elem );
	};
	jQuery.expr.pseudos.visible = function( elem ) {
		return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
	};




	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE <=9 only
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE <=9 only
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE <=9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );

					// Support: IE 9 only
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
	jQuery.ajaxPrefilter( function( s ) {
		if ( s.crossDomain ) {
			s.contents.script = false;
		}
	} );

	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Support: Safari 8 only
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();


	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( typeof data !== "string" ) {
			return [];
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}

		var base, parsed, scripts;

		if ( !context ) {

			// Stop scripts or inline event handlers from being executed immediately
			// by using document.implementation
			if ( support.createHTMLDocument ) {
				context = document.implementation.createHTMLDocument( "" );

				// Set the base href for the created document
				// so any parsed elements with URLs
				// are based on the document's URL (gh-2965)
				base = context.createElement( "base" );
				base.href = document.location.href;
				context.head.appendChild( base );
			} else {
				context = document;
			}
		}

		parsed = rsingleTag.exec( data );
		scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = stripAndCollapse( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( jQuery.isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.expr.pseudos.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( jQuery.isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {
		offset: function( options ) {

			// Preserve chaining for setter
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var doc, docElem, rect, win,
				elem = this[ 0 ];

			if ( !elem ) {
				return;
			}

			// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
			// Support: IE <=11 only
			// Running getBoundingClientRect on a
			// disconnected node in IE throws an error
			if ( !elem.getClientRects().length ) {
				return { top: 0, left: 0 };
			}

			rect = elem.getBoundingClientRect();

			doc = elem.ownerDocument;
			docElem = doc.documentElement;
			win = doc.defaultView;

			return {
				top: rect.top + win.pageYOffset - docElem.clientTop,
				left: rect.left + win.pageXOffset - docElem.clientLeft
			};
		},

		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();

			} else {

				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if ( !nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset = {
					top: parentOffset.top + jQuery.css( offsetParent[ 0 ], "borderTopWidth", true ),
					left: parentOffset.left + jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true )
				};
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {

				// Coalesce documents and windows
				var win;
				if ( jQuery.isWindow( elem ) ) {
					win = elem;
				} else if ( elem.nodeType === 9 ) {
					win = elem.defaultView;
				}

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari <=7 - 9.1, Chrome <=37 - 49
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( jQuery.isWindow( elem ) ) {

						// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
						return funcName.indexOf( "outer" ) === 0 ?
							elem[ "inner" + name ] :
							elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable );
			};
		} );
	} );


	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		}
	} );

	jQuery.holdReady = function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	};
	jQuery.isArray = Array.isArray;
	jQuery.parseJSON = JSON.parse;
	jQuery.nodeName = nodeName;




	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}




	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}




	return jQuery;
	} );


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Clock = undefined;

	var _mithril = __webpack_require__(1);

	var _mithril2 = _interopRequireDefault(_mithril);

	var _format = __webpack_require__(11);

	var format = _interopRequireWildcard(_format);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * BLISS Clock UI Widget
	 *
	 * The BLISS Clock UI Widget displays a clock with date and time that
	 * updates every second.  The display is configurable with at
	 * initialization time or by clicking on specific parts of the time.
	 *
	 * Configurable / Toggleable options include:
	 *
	 *   - 12-hour or 24-hour time
	 *   - Date (month and day) or Day of Year (DOY)
	 *   - UTC or localtime
	 */
	var Clock = {
	    _now: null,
	    _h24: true,
	    _utc: true,
	    _doy: false,

	    toggleH24: function toggleH24() {
	        this._h24 = !this._h24;
	    },
	    toggleUTC: function toggleUTC() {
	        this._utc = !this._utc;
	    },
	    toggleDOY: function toggleDOY() {
	        this._doy = !this._doy;
	    },
	    update: function update() {
	        this._now = new Date();
	    },


	    // Mithril lifecycle method
	    oninit: function oninit(vnode) {
	        var attrs = vnode.attrs;

	        this._h24 = attrs.h24 !== undefined ? attrs.h24 : Clock._h24;
	        this._utc = attrs.utc !== undefined ? attrs.utc : Clock._utc;
	        this._doy = attrs.doy !== undefined ? attrs.doy : Clock._doy;
	        this.update();
	    },


	    // Mithril lifecycle method
	    oncreate: function oncreate(vnode) {
	        var _this = this;

	        setInterval(function () {
	            Clock.update.call(_this);_mithril2.default.redraw();
	        }, 1000);
	    },


	    // Mithril view() method
	    view: function view(vnode) {
	        var opts = { doy: this._doy, h24: this._h24, utc: this._utc };
	        var date = format.date(this._now, opts);
	        var time = format.time(this._now, opts);
	        var tz = format.tz(this._now, opts);

	        return (0, _mithril2.default)('bliss-clock', vnode.attrs, [(0, _mithril2.default)('span.date', { onclick: Clock.toggleDOY.bind(this) }, date), ' ', (0, _mithril2.default)('span.time', { onclick: Clock.toggleH24.bind(this) }, time), ' ', (0, _mithril2.default)('span.tz', { onclick: Clock.toggleUTC.bind(this) }, tz)]);
	    }
	};

	exports.default = Clock;
	exports.Clock = Clock;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Field = undefined;

	var _mithril = __webpack_require__(1);

	var _mithril2 = _interopRequireDefault(_mithril);

	var _sprintfJs = __webpack_require__(17);

	var _strftime = __webpack_require__(18);

	var strftime = _interopRequireWildcard(_strftime);

	var _cmd = __webpack_require__(9);

	var _evr = __webpack_require__(10);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Field = {
	    // Mithril lifecycle method
	    oninit: function oninit(vnode) {
	        this._name = vnode.attrs.name;
	        this._packet = vnode.attrs.packet;
	    },


	    // Mithril view() method
	    view: function view(vnode) {
	        var pname = this._packet;
	        var buffer = bliss.packets[pname];
	        var packet = buffer && buffer.get(0);
	        var value = packet && packet[this._name];

	        if (value === undefined || value === null) {
	            value = 'N/A';
	        } else if (value instanceof _cmd.CommandDefinition) {
	            value = value.opcode ? value.name : 'N/A';
	        } else if (value instanceof _evr.EVRDefinition) {
	            value = value.code ? value.name : 'N/A';
	        } else {
	            if (vnode.attrs.format) {
	                var defn = packet._defn.fields[this._name];
	                var type = defn && defn.type;

	                value = type && type.isTime ? strftime.utc()(vnode.attrs.format, value) : (0, _sprintfJs.sprintf)(vnode.attrs.format, value);
	            }
	        }

	        return (0, _mithril2.default)('bliss-field', vnode.attrs, value);
	    }
	};

	exports.default = Field;
	exports.Field = Field;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	(function(window) {
	    var re = {
	        not_string: /[^s]/,
	        number: /[diefg]/,
	        json: /[j]/,
	        not_json: /[^j]/,
	        text: /^[^\x25]+/,
	        modulo: /^\x25{2}/,
	        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
	        key: /^([a-z_][a-z_\d]*)/i,
	        key_access: /^\.([a-z_][a-z_\d]*)/i,
	        index_access: /^\[(\d+)\]/,
	        sign: /^[\+\-]/
	    }

	    function sprintf() {
	        var key = arguments[0], cache = sprintf.cache
	        if (!(cache[key] && cache.hasOwnProperty(key))) {
	            cache[key] = sprintf.parse(key)
	        }
	        return sprintf.format.call(null, cache[key], arguments)
	    }

	    sprintf.format = function(parse_tree, argv) {
	        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
	        for (i = 0; i < tree_length; i++) {
	            node_type = get_type(parse_tree[i])
	            if (node_type === "string") {
	                output[output.length] = parse_tree[i]
	            }
	            else if (node_type === "array") {
	                match = parse_tree[i] // convenience purposes only
	                if (match[2]) { // keyword argument
	                    arg = argv[cursor]
	                    for (k = 0; k < match[2].length; k++) {
	                        if (!arg.hasOwnProperty(match[2][k])) {
	                            throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
	                        }
	                        arg = arg[match[2][k]]
	                    }
	                }
	                else if (match[1]) { // positional argument (explicit)
	                    arg = argv[match[1]]
	                }
	                else { // positional argument (implicit)
	                    arg = argv[cursor++]
	                }

	                if (get_type(arg) == "function") {
	                    arg = arg()
	                }

	                if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
	                    throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
	                }

	                if (re.number.test(match[8])) {
	                    is_positive = arg >= 0
	                }

	                switch (match[8]) {
	                    case "b":
	                        arg = arg.toString(2)
	                    break
	                    case "c":
	                        arg = String.fromCharCode(arg)
	                    break
	                    case "d":
	                    case "i":
	                        arg = parseInt(arg, 10)
	                    break
	                    case "j":
	                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
	                    break
	                    case "e":
	                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
	                    break
	                    case "f":
	                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
	                    break
	                    case "g":
	                        arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
	                    break
	                    case "o":
	                        arg = arg.toString(8)
	                    break
	                    case "s":
	                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
	                    break
	                    case "u":
	                        arg = arg >>> 0
	                    break
	                    case "x":
	                        arg = arg.toString(16)
	                    break
	                    case "X":
	                        arg = arg.toString(16).toUpperCase()
	                    break
	                }
	                if (re.json.test(match[8])) {
	                    output[output.length] = arg
	                }
	                else {
	                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
	                        sign = is_positive ? "+" : "-"
	                        arg = arg.toString().replace(re.sign, "")
	                    }
	                    else {
	                        sign = ""
	                    }
	                    pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
	                    pad_length = match[6] - (sign + arg).length
	                    pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
	                    output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
	                }
	            }
	        }
	        return output.join("")
	    }

	    sprintf.cache = {}

	    sprintf.parse = function(fmt) {
	        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
	        while (_fmt) {
	            if ((match = re.text.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = match[0]
	            }
	            else if ((match = re.modulo.exec(_fmt)) !== null) {
	                parse_tree[parse_tree.length] = "%"
	            }
	            else if ((match = re.placeholder.exec(_fmt)) !== null) {
	                if (match[2]) {
	                    arg_names |= 1
	                    var field_list = [], replacement_field = match[2], field_match = []
	                    if ((field_match = re.key.exec(replacement_field)) !== null) {
	                        field_list[field_list.length] = field_match[1]
	                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
	                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
	                                field_list[field_list.length] = field_match[1]
	                            }
	                            else {
	                                throw new SyntaxError("[sprintf] failed to parse named argument key")
	                            }
	                        }
	                    }
	                    else {
	                        throw new SyntaxError("[sprintf] failed to parse named argument key")
	                    }
	                    match[2] = field_list
	                }
	                else {
	                    arg_names |= 2
	                }
	                if (arg_names === 3) {
	                    throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
	                }
	                parse_tree[parse_tree.length] = match
	            }
	            else {
	                throw new SyntaxError("[sprintf] unexpected placeholder")
	            }
	            _fmt = _fmt.substring(match[0].length)
	        }
	        return parse_tree
	    }

	    var vsprintf = function(fmt, argv, _argv) {
	        _argv = (argv || []).slice(0)
	        _argv.splice(0, 0, fmt)
	        return sprintf.apply(null, _argv)
	    }

	    /**
	     * helpers
	     */
	    function get_type(variable) {
	        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
	    }

	    function str_repeat(input, multiplier) {
	        return Array(multiplier + 1).join(input)
	    }

	    /**
	     * export to either browser or node.js
	     */
	    if (true) {
	        exports.sprintf = sprintf
	        exports.vsprintf = vsprintf
	    }
	    else {
	        window.sprintf = sprintf
	        window.vsprintf = vsprintf

	        if (typeof define === "function" && define.amd) {
	            define(function() {
	                return {
	                    sprintf: sprintf,
	                    vsprintf: vsprintf
	                }
	            })
	        }
	    }
	})(typeof window === "undefined" ? this : window);


/***/ }),
/* 18 */
/***/ (function(module, exports) {

	//
	// strftime
	// github.com/samsonjs/strftime
	// @_sjs
	//
	// Copyright 2010 - 2016 Sami Samhuri <sami@samhuri.net>
	//
	// MIT License
	// http://sjs.mit-license.org
	//

	;(function() {

	    var Locales = {
	        de_DE: {
	            days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
	            shortDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
	            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
	            shortMonths: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d.%m.%Y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        en_CA: {
	            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
	            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	            ordinalSuffixes: [
	                'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
	                'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
	                'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
	                'st'
	            ],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d/%m/%y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%r',
	                x: '%D'
	            }
	        },

	        en_US: {
	            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
	            shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	            ordinalSuffixes: [
	                'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
	                'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
	                'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
	                'st'
	            ],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%m/%d/%y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%r',
	                x: '%D'
	            }
	        },

	        es_MX: {
	            days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
	            shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
	            months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre',' diciembre'],
	            shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d/%m/%Y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        fr_FR: {
	            days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
	            shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
	            months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
	            shortMonths: ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d/%m/%Y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        it_IT: {
	            days: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
	            shortDays: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
	            months: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
	            shortMonths: ['pr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d/%m/%Y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        nl_NL: {
	            days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
	            shortDays: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
	            months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
	            shortMonths: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d-%m-%y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        pt_BR: {
	            days: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
	            shortDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
	            months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
	            shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d-%m-%Y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        ru_RU: {
	            days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
	            shortDays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
	            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
	            shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
	            AM: 'AM',
	            PM: 'PM',
	            am: 'am',
	            pm: 'pm',
	            formats: {
	                c: '%a %d %b %Y %X',
	                D: '%d.%m.%y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        tr_TR: {
	            days: ['Pazar', 'Pazartesi', 'Salı','Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
	            shortDays: ['Paz', 'Pzt', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cts'],
	            months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
	            shortMonths: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
	            AM: 'ÖÖ',
	            PM: 'ÖS',
	            am: 'ÖÖ',
	            pm: 'ÖS',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d-%m-%Y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%T',
	                x: '%D'
	            }
	        },

	        // By michaeljayt<michaeljayt@gmail.com>
	        // https://github.com/michaeljayt/strftime/commit/bcb4c12743811d51e568175aa7bff3fd2a77cef3
	        zh_CN: {
	            days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
	            shortDays: ['日', '一', '二', '三', '四', '五', '六'],
	            months: ['一月份', '二月份', '三月份', '四月份', '五月份', '六月份', '七月份', '八月份', '九月份', '十月份', '十一月份', '十二月份'],
	            shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
	            AM: '上午',
	            PM: '下午',
	            am: '上午',
	            pm: '下午',
	            formats: {
	                c: '%a %d %b %Y %X %Z',
	                D: '%d/%m/%y',
	                F: '%Y-%m-%d',
	                R: '%H:%M',
	                r: '%I:%M:%S %p',
	                T: '%H:%M:%S',
	                v: '%e-%b-%Y',
	                X: '%r',
	                x: '%D'
	            }
	        }
	    };

	    var DefaultLocale = Locales['en_US'],
	        defaultStrftime = new Strftime(DefaultLocale, 0, false),
	        isCommonJS = typeof module !== 'undefined',
	        namespace;

	    // CommonJS / Node module
	    if (isCommonJS) {
	        namespace = module.exports = defaultStrftime;
	    }
	    // Browsers and other environments
	    else {
	        // Get the global object. Works in ES3, ES5, and ES5 strict mode.
	        namespace = (function() { return this || (1,eval)('this'); }());
	        namespace.strftime = defaultStrftime;
	    }

	    // Polyfill Date.now for old browsers.
	    if (typeof Date.now !== 'function') {
	        Date.now = function() {
	          return +new Date();
	        };
	    }

	    function Strftime(locale, customTimezoneOffset, useUtcTimezone) {
	        var _locale = locale || DefaultLocale,
	            _customTimezoneOffset = customTimezoneOffset || 0,
	            _useUtcBasedDate = useUtcTimezone || false,

	            // we store unix timestamp value here to not create new Date() each iteration (each millisecond)
	            // Date.now() is 2 times faster than new Date()
	            // while millisecond precise is enough here
	            // this could be very helpful when strftime triggered a lot of times one by one
	            _cachedDateTimestamp = 0,
	            _cachedDate;

	        function _strftime(format, date) {
	            var timestamp;

	            if (!date) {
	                var currentTimestamp = Date.now();
	                if (currentTimestamp > _cachedDateTimestamp) {
	                    _cachedDateTimestamp = currentTimestamp;
	                    _cachedDate = new Date(_cachedDateTimestamp);

	                    timestamp = _cachedDateTimestamp;

	                    if (_useUtcBasedDate) {
	                        // how to avoid duplication of date instantiation for utc here?
	                        // we tied to getTimezoneOffset of the current date
	                        _cachedDate = new Date(_cachedDateTimestamp + getTimestampToUtcOffsetFor(_cachedDate) + _customTimezoneOffset);
	                    }
	                }
	                else {
	                  timestamp = _cachedDateTimestamp;
	                }
	                date = _cachedDate;
	            }
	            else {
	                timestamp = date.getTime();

	                if (_useUtcBasedDate) {
	                    var utcOffset = getTimestampToUtcOffsetFor(date);
	                    date = new Date(timestamp + utcOffset + _customTimezoneOffset);
	                    // If we've crossed a DST boundary with this calculation we need to
	                    // adjust the new date accordingly or it will be off by an hour in UTC.
	                    if (getTimestampToUtcOffsetFor(date) !== utcOffset) {
	                        var newUTCOffset = getTimestampToUtcOffsetFor(date);
	                        date = new Date(timestamp + newUTCOffset + _customTimezoneOffset);
	                    }
	                }
	            }

	            return _processFormat(format, date, _locale, timestamp);
	        }

	        function _processFormat(format, date, locale, timestamp) {
	            var resultString = '',
	                padding = null,
	                isInScope = false,
	                length = format.length,
	                extendedTZ = false;

	            for (var i = 0; i < length; i++) {

	                var currentCharCode = format.charCodeAt(i);

	                if (isInScope === true) {
	                    // '-'
	                    if (currentCharCode === 45) {
	                        padding = '';
	                        continue;
	                    }
	                    // '_'
	                    else if (currentCharCode === 95) {
	                        padding = ' ';
	                        continue;
	                    }
	                    // '0'
	                    else if (currentCharCode === 48) {
	                        padding = '0';
	                        continue;
	                    }
	                    // ':'
	                    else if (currentCharCode === 58) {
	                      if (extendedTZ) {
	                          warn("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime");
	                      }
	                      extendedTZ = true;
	                      continue;
	                    }

	                    switch (currentCharCode) {

	                        // Examples for new Date(0) in GMT

	                        // '%'
	                        // case '%':
	                        case 37:
	                            resultString += '%';
	                            break;

	                        // 'Thursday'
	                        // case 'A':
	                        case 65:
	                            resultString += locale.days[date.getDay()];
	                            break;

	                        // 'January'
	                        // case 'B':
	                        case 66:
	                            resultString += locale.months[date.getMonth()];
	                            break;

	                        // '19'
	                        // case 'C':
	                        case 67:
	                            resultString += padTill2(Math.floor(date.getFullYear() / 100), padding);
	                            break;

	                        // '01/01/70'
	                        // case 'D':
	                        case 68:
	                            resultString += _processFormat(locale.formats.D, date, locale, timestamp);
	                            break;

	                        // '1970-01-01'
	                        // case 'F':
	                        case 70:
	                            resultString += _processFormat(locale.formats.F, date, locale, timestamp);
	                            break;

	                        // '00'
	                        // case 'H':
	                        case 72:
	                            resultString += padTill2(date.getHours(), padding);
	                            break;

	                        // '12'
	                        // case 'I':
	                        case 73:
	                            resultString += padTill2(hours12(date.getHours()), padding);
	                            break;

	                        // '000'
	                        // case 'L':
	                        case 76:
	                            resultString += padTill3(Math.floor(timestamp % 1000));
	                            break;

	                        // '00'
	                        // case 'M':
	                        case 77:
	                            resultString += padTill2(date.getMinutes(), padding);
	                            break;

	                        // 'am'
	                        // case 'P':
	                        case 80:
	                            resultString += date.getHours() < 12 ? locale.am : locale.pm;
	                            break;

	                        // '00:00'
	                        // case 'R':
	                        case 82:
	                            resultString += _processFormat(locale.formats.R, date, locale, timestamp);
	                            break;

	                        // '00'
	                        // case 'S':
	                        case 83:
	                            resultString += padTill2(date.getSeconds(), padding);
	                            break;

	                        // '00:00:00'
	                        // case 'T':
	                        case 84:
	                            resultString += _processFormat(locale.formats.T, date, locale, timestamp);
	                            break;

	                        // '00'
	                        // case 'U':
	                        case 85:
	                            resultString += padTill2(weekNumber(date, 'sunday'), padding);
	                            break;

	                        // '00'
	                        // case 'W':
	                        case 87:
	                            resultString += padTill2(weekNumber(date, 'monday'), padding);
	                            break;

	                        // '16:00:00'
	                        // case 'X':
	                        case 88:
	                            resultString += _processFormat(locale.formats.X, date, locale, timestamp);
	                            break;

	                        // '1970'
	                        // case 'Y':
	                        case 89:
	                            resultString += date.getFullYear();
	                            break;

	                        // 'GMT'
	                        // case 'Z':
	                        case 90:
	                            if (_useUtcBasedDate && _customTimezoneOffset === 0) {
	                                resultString += "GMT";
	                            }
	                            else {
	                                // fixme optimize
	                                var tzString = date.toString().match(/\(([\w\s]+)\)/);
	                                resultString += tzString && tzString[1] || '';
	                            }
	                            break;

	                        // 'Thu'
	                        // case 'a':
	                        case 97:
	                            resultString += locale.shortDays[date.getDay()];
	                            break;

	                        // 'Jan'
	                        // case 'b':
	                        case 98:
	                            resultString += locale.shortMonths[date.getMonth()];
	                            break;

	                        // ''
	                        // case 'c':
	                        case 99:
	                            resultString += _processFormat(locale.formats.c, date, locale, timestamp);
	                            break;

	                        // '01'
	                        // case 'd':
	                        case 100:
	                            resultString += padTill2(date.getDate(), padding);
	                            break;

	                        // ' 1'
	                        // case 'e':
	                        case 101:
	                            resultString += padTill2(date.getDate(), padding == null ? ' ' : padding);
	                            break;

	                        // 'Jan'
	                        // case 'h':
	                        case 104:
	                            resultString += locale.shortMonths[date.getMonth()];
	                            break;

	                        // '000'
	                        // case 'j':
	                        case 106:
	                            var y = new Date(date.getFullYear(), 0, 1);
	                            var day = Math.ceil((date.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
	                            resultString += padTill3(day);
	                            break;

	                        // ' 0'
	                        // case 'k':
	                        case 107:
	                            resultString += padTill2(date.getHours(), padding == null ? ' ' : padding);
	                            break;

	                        // '12'
	                        // case 'l':
	                        case 108:
	                            resultString += padTill2(hours12(date.getHours()), padding == null ? ' ' : padding);
	                            break;

	                        // '01'
	                        // case 'm':
	                        case 109:
	                            resultString += padTill2(date.getMonth() + 1, padding);
	                            break;

	                        // '\n'
	                        // case 'n':
	                        case 110:
	                            resultString += '\n';
	                            break;

	                        // '1st'
	                        // case 'o':
	                        case 111:
	                            // Try to use an ordinal suffix from the locale, but fall back to using the old
	                            // function for compatibility with old locales that lack them.
	                            var day = date.getDate();
	                            if (locale.ordinalSuffixes) {
	                                resultString += String(day) + (locale.ordinalSuffixes[day - 1] || ordinal(day));
	                            }
	                            else {
	                                resultString += String(day) + ordinal(day);
	                            }
	                            break;

	                        // 'AM'
	                        // case 'p':
	                        case 112:
	                            resultString += date.getHours() < 12 ? locale.AM : locale.PM;
	                            break;

	                        // '12:00:00 AM'
	                        // case 'r':
	                        case 114:
	                            resultString += _processFormat(locale.formats.r, date, locale, timestamp);
	                            break;

	                        // '0'
	                        // case 's':
	                        case 115:
	                            resultString += Math.floor(timestamp / 1000);
	                            break;

	                        // '\t'
	                        // case 't':
	                        case 116:
	                            resultString += '\t';
	                            break;

	                        // '4'
	                        // case 'u':
	                        case 117:
	                            var day = date.getDay();
	                            resultString += day === 0 ? 7 : day;
	                            break; // 1 - 7, Monday is first day of the week

	                        // ' 1-Jan-1970'
	                        // case 'v':
	                        case 118:
	                            resultString += _processFormat(locale.formats.v, date, locale, timestamp);
	                            break;

	                        // '4'
	                        // case 'w':
	                        case 119:
	                            resultString += date.getDay();
	                            break; // 0 - 6, Sunday is first day of the week

	                        // '12/31/69'
	                        // case 'x':
	                        case 120:
	                            resultString += _processFormat(locale.formats.x, date, locale, timestamp);
	                            break;

	                        // '70'
	                        // case 'y':
	                        case 121:
	                            resultString += ('' + date.getFullYear()).slice(2);
	                            break;

	                        // '+0000'
	                        // case 'z':
	                        case 122:
	                            if (_useUtcBasedDate && _customTimezoneOffset === 0) {
	                                resultString += extendedTZ ? "+00:00" : "+0000";
	                            }
	                            else {
	                                var off;
	                                if (_customTimezoneOffset !== 0) {
	                                    off = _customTimezoneOffset / (60 * 1000);
	                                }
	                                else {
	                                    off = -date.getTimezoneOffset();
	                                }
	                                var sign = off < 0 ? '-' : '+';
	                                var sep = extendedTZ ? ':' : '';
	                                var hours = Math.floor(Math.abs(off / 60));
	                                var mins = Math.abs(off % 60);
	                                resultString += sign + padTill2(hours) + sep + padTill2(mins);
	                            }
	                            break;

	                        default:
	                            if (isInScope) {
	                                resultString += '%';
	                            }
	                            resultString += format[i];
	                            break;
	                    }

	                    padding = null;
	                    isInScope = false;
	                    continue;
	                }

	                // '%'
	                if (currentCharCode === 37) {
	                    isInScope = true;
	                    continue;
	                }

	                resultString += format[i];
	            }

	            return resultString;
	        }

	        var strftime = _strftime;

	        strftime.localize = function(locale) {
	            return new Strftime(locale || _locale, _customTimezoneOffset, _useUtcBasedDate);
	        };

	        strftime.localizeByIdentifier = function(localeIdentifier) {
	            var locale = Locales[localeIdentifier];
	            if (!locale) {
	                warn('[WARNING] No locale found with identifier "' + localeIdentifier + '".');
	                return strftime;
	            }
	            return strftime.localize(locale);
	        };

	        strftime.timezone = function(timezone) {
	            var customTimezoneOffset = _customTimezoneOffset;
	            var useUtcBasedDate = _useUtcBasedDate;

	            var timezoneType = typeof timezone;
	            if (timezoneType === 'number' || timezoneType === 'string') {
	                useUtcBasedDate = true;

	                // ISO 8601 format timezone string, [-+]HHMM
	                if (timezoneType === 'string') {
	                    var sign = timezone[0] === '-' ? -1 : 1,
	                        hours = parseInt(timezone.slice(1, 3), 10),
	                        minutes = parseInt(timezone.slice(3, 5), 10);

	                    customTimezoneOffset = sign * ((60 * hours) + minutes) * 60 * 1000;
	                    // in minutes: 420
	                }
	                else if (timezoneType === 'number') {
	                    customTimezoneOffset = timezone * 60 * 1000;
	                }
	            }

	            return new Strftime(_locale, customTimezoneOffset, useUtcBasedDate);
	        };

	        strftime.utc = function() {
	            return new Strftime(_locale, _customTimezoneOffset, true);
	        };

	        return strftime;
	    }

	    function padTill2(numberToPad, paddingChar) {
	        if (paddingChar === '' || numberToPad > 9) {
	            return numberToPad;
	        }
	        if (paddingChar == null) {
	            paddingChar = '0';
	        }
	        return paddingChar + numberToPad;
	    }

	    function padTill3(numberToPad) {
	        if (numberToPad > 99) {
	            return numberToPad;
	        }
	        if (numberToPad > 9) {
	            return '0' + numberToPad;
	        }
	        return '00' + numberToPad;
	    }

	    function hours12(hour) {
	        if (hour === 0) {
	            return 12;
	        }
	        else if (hour > 12) {
	            return hour - 12;
	        }
	        return hour;
	    }

	    // firstWeekday: 'sunday' or 'monday', default is 'sunday'
	    //
	    // Pilfered & ported from Ruby's strftime implementation.
	    function weekNumber(date, firstWeekday) {
	        firstWeekday = firstWeekday || 'sunday';

	        // This works by shifting the weekday back by one day if we
	        // are treating Monday as the first day of the week.
	        var weekday = date.getDay();
	        if (firstWeekday === 'monday') {
	            if (weekday === 0) // Sunday
	                weekday = 6;
	            else
	                weekday--;
	        }

	        var firstDayOfYearUtc = Date.UTC(date.getFullYear(), 0, 1),
	            dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	            yday = Math.floor((dateUtc - firstDayOfYearUtc) / 86400000),
	            weekNum = (yday + 7 - weekday) / 7;

	        return Math.floor(weekNum);
	    }

	    // Get the ordinal suffix for a number: st, nd, rd, or th
	    function ordinal(number) {
	        var i = number % 10;
	        var ii = number % 100;

	        if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
	            return 'th';
	        }
	        switch (i) {
	            case 1: return 'st';
	            case 2: return 'nd';
	            case 3: return 'rd';
	        }
	    }

	    function getTimestampToUtcOffsetFor(date) {
	        return (date.getTimezoneOffset() || 0) * 60000;
	    }

	    function warn(message) {
	        if (typeof console !== 'undefined' && typeof console.warn == 'function') {
	            console.warn(message)
	        }
	    }

	}());


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Messages = undefined;

	var _mithril = __webpack_require__(1);

	var _mithril2 = _interopRequireDefault(_mithril);

	var _format = __webpack_require__(11);

	var format = _interopRequireWildcard(_format);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Messages = {
	    _messages: [],
	    _source: null,

	    add: function add(msg) {
	        this._messages.push(this.normalizeMessage(msg));
	        _mithril2.default.redraw();
	    },
	    updateMessageBoxScroll: function updateMessageBoxScroll() {
	        var messageBox = document.getElementById("blisslogs");
	        messageBox.scrollTop = messageBox.scrollHeight;
	    },
	    normalizeMessage: function normalizeMessage(msg) {
	        return {
	            timestamp: Date.parse(msg.asctime),
	            severity: msg.levelname,
	            message: msg.message
	        };
	    },
	    oninit: function oninit(vode) {
	        var _this = this;

	        this._source = new EventSource('/messages');
	        this._source.onmessage = function (event) {
	            _this.add(JSON.parse(event.data));
	            _this.updateMessageBoxScroll();
	        };
	    },
	    view: function view(vnode) {
	        var rows = this._messages.map(function (msg) {
	            return (0, _mithril2.default)('div', { class: 'row log-' + msg.severity.toLowerCase() }, [(0, _mithril2.default)('div', { class: 'col-lg-3' }, format.datetime(msg.timestamp)), (0, _mithril2.default)('div', { class: 'col-lg-2' }, msg.severity), (0, _mithril2.default)('div', { class: 'col-lg-7' }, msg.message)]);
	        });

	        return (0, _mithril2.default)('bliss-messages', vnode.attrs, (0, _mithril2.default)('div', { class: 'container', id: 'blisslogs' }, rows));
	    }
	};

	exports.default = Messages;
	exports.Messages = Messages;

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Displays internal state information via styled Glyphicon and tracks
	 * transitions through its' states via monitoring of the system event queue.
	 *
	 * Allows for configuration of 4 state event handlers
	 * ('on', 'off', 'pending', and 'error') via attributes on the bliss-led tag.
	 *
	 * Example:
	 *   <bliss-led on="seq:exec" off="seq:done" error="seq:err"></bliss-led>
	 *  
	 *  You can specify multiple triggers for a single state by separating the
	 *  event names with a ','
	 *
	 * Example:
	 *   <bliss-led on="seq:exec,seq:sent" off="seq:done"></bliss-led>
	 *
	 *  If you want to start the LED in a state besides 'off' set it via
	 *  the 'default' attribute
	 *
	 * Example:
	 *   <bliss-led on="seq:exec,seq:sent" default="pending"></bliss-led>
	 */
	var LED = {
	    _states: ['on', 'off', 'pending', 'error'],
	    _state: 'off',

	    oninit: function oninit(vnode) {
	        var _this = this;

	        // Set event listeners for each of the valid LED states
	        this._states.forEach(function (s) {
	            if (s in vnode.attrs) {
	                vnode.attrs[s].split(',').forEach(function (e) {
	                    bliss.events.on(e, function () {
	                        _this._state = s;
	                    });
	                });
	            }
	        });

	        this._state = vnode.attrs.default || 'off';
	    },
	    view: function view(vnode) {
	        var classes = 'glyphicon glyphicon-dot bliss-led-' + this._state;
	        return m('span', { class: classes });
	    }
	};

	/**
	 * An expansion of the base LED object for controlling the state of
	 * simulators and displaying state information with regards to their
	 * operation.
	 *
	 * Allows for configuration of 4 state event handlers for displaying information
	 * about the state of the simulator. You can configure these states
	 * ('on', 'off', 'pending', and 'error') via attributes on the tag.
	 *
	 * Example:
	 *   <bliss-simmonitor on='sim:iss:on'
	 *                     off='sim:iss:off'
	 *                     pending='sim:iss:pending'
	 *                     error='sim:iss:error'
	 *                     default='off' action='/sim/iss/'></bliss-simmonitor>
	 *  
	 *  You can specify multiple triggers for a single state by separating the
	 *  event names with a ','.
	 *
	 *  The 'default' attribute specifies the state of the monitored sim on bootup.
	 *  If you start your sim in a particular state you should update 'default'
	 *  accordingly so the component can properly track the sim. The 'off' state
	 *  is the default.
	 *
	 *  The 'action' attribute is the URL for POSTs to be made for starting and
	 *  stopping the monitored Sim. SimStatus expects the following interface
	 *  with the sim:
	 *
	 *      POST 'action' + '/start' to start the sim.
	 *      POST 'action' + '/stop' to stop the sim.
	 *
	 */
	var SimStatus = Object.assign(Object.create(LED), {
	    _hoverState: null,
	    _simRunning: false,

	    oninit: function oninit(vnode) {
	        var _this2 = this;

	        LED.oninit.call(this, vnode);
	        this.action = vnode.attrs.action;
	        bliss.events.on(vnode.attrs.on, function () {
	            _this2._simRunning = true;
	        });
	        bliss.events.on(vnode.attrs.off, function () {
	            _this2._simRunning = false;
	        });

	        if (this._state === 'on') {
	            this._simRunning = true;
	        }
	    },
	    view: function view(vnode) {
	        var _this3 = this;

	        var classes = 'sim-monitor glyphicon';

	        if (this._hoverState === 'mouseover') {
	            if (this._simRunning) {
	                classes += ' glyphicon-stop bliss-led-stop';
	            } else {
	                classes += ' glyphicon-play bliss-led-start';
	            }
	        } else {
	            classes += ' glyphicon-dot bliss-led-' + this._state;
	        }

	        return m('span', {
	            class: classes,
	            onclick: SimStatus.toggleSimState.bind(this),
	            onmouseover: function onmouseover(event) {
	                _this3._hoverState = event.type;
	                m.redraw();
	            },
	            onmouseout: function onmouseout(event) {
	                _this3._hoverState = event.type;
	                m.redraw();
	            }
	        });
	    },
	    toggleSimState: function toggleSimState() {
	        var url = this.action;
	        if (this._simRunning) {
	            url += '/stop';
	        } else {
	            url += '/start';
	        }

	        m.request({ url: url, action: 'POST', data: {} });
	    }
	});

	exports.default = { LED: LED, SimStatus: SimStatus };
	exports.LED = LED;
	exports.SimStatus = SimStatus;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.TabSet = undefined;

	var _mithril = __webpack_require__(1);

	var _mithril2 = _interopRequireDefault(_mithril);

	var _util = __webpack_require__(22);

	var util = _interopRequireWildcard(_util);

	var _range = __webpack_require__(23);

	var _range2 = _interopRequireDefault(_range);

	var _times = __webpack_require__(43);

	var _times2 = _interopRequireDefault(_times);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * DragDrop
	 *
	 * DragDrop manages the drag-and-drop state and behavior for a TabSet,
	 * keeping track of the indicies of the `from` tab (i.e. the tab being
	 * dragged) and the current tab which is being dragged `over`.
	 */
	var DragDrop = {
	    _from: -1,
	    _over: -1,

	    /**
	     * Handle an HTML5 drop event for the tab at the given `index`.
	     *
	     * Calls `callback(from, to)`, where `from` is the index of the
	     * tab that was dragged and `to` is the index of the drop target
	     * tab.  In practical terms, callback is `TabSet.move(from, to)`.
	     */
	    drop: function drop(event, index, callback) {
	        if (this._from !== -1) {
	            event.preventDefault();
	            callback(this._from, index);
	        }
	    },


	    /**
	     * Handle the HTML5 `dragend` event for the tab at the given index.
	     */
	    end: function end(event, index) {
	        this._from = -1;
	        this._over = -1;
	    },


	    /**
	     * @returns true if the tab at the given index is being dragged
	     * over, false otherwise.
	     */
	    isOver: function isOver(index) {
	        return index === this._over;
	    },


	    /**
	     * Handle the HTML5 `dragover` event for the tab at the given index.
	     */
	    over: function over(event, index) {
	        event.preventDefault();
	        this._over = index;
	    },


	    /**
	     * Return CSS classes for the tab at the given index that is being
	     * dragged over.
	     *
	     * @pre  this.isOver(index) === true
	     */
	    overClass: function overClass(index) {
	        return 'drag-over-' + (this._from > index ? 'before' : 'after');
	    },


	    /**
	     * Handle the HTML5 `dragstart` event for the tab at the given index.
	     */
	    start: function start(event, index) {
	        event.dataTransfer.effectAllowed = 'move';
	        this._from = index;
	    }
	};

	/**
	 * BLISS TabSet
	 *
	 * BLISS TabSet is a Mithril UI component for a `<bliss-tabset>`,
	 * which manages a set of children `<bliss-tab>`s.  Tabs have a title
	 * attribute and their own child content.  When a TabSet is rendered
	 * to the DOM via its `view()` method, it:
	 *
	 *     1.  Uses `<bliss-tabset>` and `<bliss-tab>` HTML5 custom tags
	 *         for targeted CSS styling and customization, and
	 *
	 *     2.  Uses Bootstrap HTML structure and CSS classes
	 *
	 * A BLISS TabSet is signficantly more succinct than Bootstrap tabs.
	 * For example, compare creating a BLISS TabSet directly in HTML:
	 *
	 *     <bliss-tabset class="nav-tabs">
	 *         <bliss-tab title="Foo"> ... </bliss-tab>
	 *         <bliss-tab title="Bar"> ... </bliss-tab>
	 *         <bliss-tab title="Baz"> ... </bliss-tab>
	 *     </bliss-tab>
	 *
	 * To the corresponding Bootstrap HTML and CSS:
	 *
	 *     <ul class="nav nav-tabs">
	 *         <li> <a href="#">Foo</a> </li>
	 *         <li> <a href="#">Bar</a> </li>
	 *         <li> <a href="#">Baz</a> </li>
	 *     </ul>
	 *
	 *     <div class="tab-content">
	 *         <div class="tab-pane active"> ... </div>
	 *     </div>
	 *     <!-- Repeat for the contents of all three tabs -->
	 *
	 * Plus a BLISS TabSet only renders the contents of the active tab.
	 *
	 * Tabs may also be rendered as Bootstrap pills, stacked, justified,
	 * etc. by adding the [appropriate CSS
	 * classes](http://getbootstrap.com/components/#nav) to a
	 * <bliss-tabset>.
	 *
	 * Tabs may be reordered programmatically via `TabSet.move(from, to)`
	 * or by interactively via drag-and-drop.
	 */
	var TabSet = {
	    _active: 0, // The index of the active tab
	    _drag: null, // A DragDrop object, created in oninit()
	    _pos: [], // Maps tab position to initial DOM order
	    _uid: [], // Unique numeric ID for each tab (for Mithril keys)


	    /**
	     * Mithril `view()`-helper method
	     *
	     * Renders the `<a>` element of a Bootstrap tab.
	     *
	     * NOTE: The anchor element (`<a>`) of a tab is dragged, but it is
	     * dragged `over` and `drop`ped on parent `<li>` elements.  This
	     * is due primarily to the way Bootstrap tabs are styled and
	     * needing to accommodate CSS animations to slide tabs left or
	     * right to indicate where the dropped tab will be positioned.
	     */
	    anchor: function anchor(vnode, index) {
	        var _this = this;

	        var attrs = {
	            href: '#',
	            draggable: this.isActive(index),
	            ondragstart: function ondragstart(e) {
	                return _this._drag.start(e, index);
	            },
	            ondragend: function ondragend(e) {
	                return _this._drag.end(e, index);
	            }
	        };

	        return (0, _mithril2.default)('a', attrs, vnode.attrs.title);
	    },


	    /**
	     * Mithril `view()`-helper method
	     *
	     * Renders the content of the currently active tab using Bootstrap
	     * styling.  The passed-in `vnode` is the active `<bliss-tab>`.
	     */
	    content: function content(vnode, uid) {
	        var attrs = { key: uid };

	        return (0, _mithril2.default)('bliss-tab', vnode.attrs, (0, _mithril2.default)('.tab-content', (0, _mithril2.default)('.tab-pane.active', attrs, vnode.children || vnode.text)));
	    },


	    /**
	     * @returns an array of only those Mithril `vnodes` that are
	     * `<bliss-tab>`s.
	     *
	     * This method is necessary because we cannot cache only child
	     * `<bliss-tab>` vnodes outside of a `view()` and every time the
	     * `view(vnodes)` render method is called, the passed-in `vnodes`
	     * will contain every child of a `<bliss-tabset>` (i.e. whitespace
	     * text fragments *and* `<bliss-tab>`s) in the original DOM
	     * (i.e. the HTML5 written by a user).
	     */
	    filterTabs: function filterTabs(vnodes) {
	        return vnodes.filter(function (c) {
	            return c.tag === 'bliss-tab';
	        });
	    },


	    /**
	     * @returns true if the tab at the given `index` is active, false
	     * otherwise.
	     */
	    isActive: function isActive(index) {
	        return index === this._active;
	    },


	    /**
	     * Moves the tab at index `from` to index `to`.
	     */
	    move: function move(from, to) {
	        var _this2 = this;

	        if (from === to) return;

	        var ntabs = this._pos.length;
	        var active = (0, _times2.default)(ntabs, function (index) {
	            return index === _this2._active;
	        });

	        util.move(this._pos, from, to);
	        util.move(this._uid, from, to);
	        util.move(active, from, to);

	        this._active = active.findIndex(function (elem) {
	            return elem;
	        });
	    },


	    /**
	     * Mithril lifecycle method
	     *
	     * Initializes this TabSet.
	     */
	    oninit: function oninit(vnode) {
	        var tabs = this.filterTabs(vnode.children);
	        this._pos = (0, _range2.default)(tabs.length);
	        this._uid = (0, _range2.default)(tabs.length);
	        this._drag = Object.create(DragDrop);
	    },


	    /**
	     * @returns an array of tabs, reordered according to the positions
	     * in `this._pos`.  For example, the following `pos[]` array would
	     * reverse the order of four tabs:
	     *
	     *   pos = [ 3, 2, 1, 0 ]
	     *
	     * By returning:
	     *
	     *     [ tabs[3], tabs[2], tabs[1], tabs[0] ]
	     *
	     * This method is necessary because we cannot cache child
	     * `<bliss-tab>` vnodes outside of a `view()` and every time the
	     * `view(vnodes)` render method is called, the order of
	     * `<bliss-tab>`s will be the same as the original DOM (i.e. the
	     * HTML5 written by a user).
	     */
	    reorder: function reorder(tabs) {
	        return this._pos.map(function (index) {
	            return tabs[index];
	        });
	    },


	    /**
	     * Mithril `view()`-helper method
	     *
	     * Renders the `<li>` element of a Bootstrap tab.
	     *
	     * NOTE: The anchor element (`<a>`) of a tab is dragged, but it is
	     * dragged `over` and `drop`ped on parent `<li>` elements.  This
	     * is due primarily to the way Bootstrap tabs are styled and
	     * needing to accomodate CSS animations to slide tabs left or
	     * right to indicate where the dropped tab will be positioned.
	     */
	    tab: function tab(vnode, index) {
	        var _this3 = this;

	        var move = TabSet.move.bind(this);
	        var attrs = {
	            class: this.tabClass(index),
	            key: this._uid[index],
	            onclick: function onclick() {
	                return _this3._active = index;
	            },
	            ondragover: function ondragover(e) {
	                return _this3._drag.over(e, index);
	            },
	            ondrop: function ondrop(e) {
	                return _this3._drag.drop(e, index, move);
	            }
	        };

	        return (0, _mithril2.default)('li', attrs, this.anchor(vnode, index));
	    },


	    /**
	     * @returns the CSS class(es) for the tab at the given `index`.
	     */
	    tabClass: function tabClass(index) {
	        var name = '';

	        if (this.isActive(index)) {
	            name = 'active';
	        } else if (this._drag.isOver(index)) {
	            name = this._drag.overClass(index);
	        }

	        return name;
	    },


	    /**
	     * Mithril `view()` method
	     *
	     * Renders this TabSet and its constituent tabs.
	     */
	    view: function view(vnode) {
	        var tabs = this.reorder(this.filterTabs(vnode.children));
	        var activeTab = tabs[this._active];
	        var activeUID = this._uid[this._active];

	        return (0, _mithril2.default)('bliss-tabset', [(0, _mithril2.default)('ul.nav', vnode.attrs, tabs.map(TabSet.tab.bind(this))), this.content(activeTab, activeUID)]);
	    }
	};

	exports.default = TabSet;
	exports.TabSet = TabSet;

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Object.assign(target, ...sources) merges sources into target.
	 *
	 * @return target
	 */
	/// TODO Figure out if we want to just use _.assign here
	var merge = Object.assign;

	/**
	 * Moves array element at index `from` to index `to`, shifting all
	 * other values up and down, as appropriate.
	 *
	 * Note, there is a proposal for this to end up in Lodash, but at the
	 * moment it hasn't been integrated.
	 *
	 * https://github.com/lodash/lodash/issues/1701
	 */
	function move(array, from, to) {
	  array.splice(to, 0, array.splice(from, 1)[0]);
	}

	exports.merge = merge;
	exports.move = move;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	var createRange = __webpack_require__(24);

	/**
	 * Creates an array of numbers (positive and/or negative) progressing from
	 * `start` up to, but not including, `end`. A step of `-1` is used if a negative
	 * `start` is specified without an `end` or `step`. If `end` is not specified,
	 * it's set to `start` with `start` then set to `0`.
	 *
	 * **Note:** JavaScript follows the IEEE-754 standard for resolving
	 * floating-point values which can produce unexpected results.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {number} [start=0] The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} [step=1] The value to increment or decrement by.
	 * @returns {Array} Returns the range of numbers.
	 * @see _.inRange, _.rangeRight
	 * @example
	 *
	 * _.range(4);
	 * // => [0, 1, 2, 3]
	 *
	 * _.range(-4);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 5);
	 * // => [1, 2, 3, 4]
	 *
	 * _.range(0, 20, 5);
	 * // => [0, 5, 10, 15]
	 *
	 * _.range(0, -4, -1);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 4, 0);
	 * // => [1, 1, 1]
	 *
	 * _.range(0);
	 * // => []
	 */
	var range = createRange();

	module.exports = range;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	var baseRange = __webpack_require__(25),
	    isIterateeCall = __webpack_require__(26),
	    toFinite = __webpack_require__(39);

	/**
	 * Creates a `_.range` or `_.rangeRight` function.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new range function.
	 */
	function createRange(fromRight) {
	  return function(start, end, step) {
	    if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
	      end = step = undefined;
	    }
	    // Ensure the sign of `-0` is preserved.
	    start = toFinite(start);
	    if (end === undefined) {
	      end = start;
	      start = 0;
	    } else {
	      end = toFinite(end);
	    }
	    step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
	    return baseRange(start, end, step, fromRight);
	  };
	}

	module.exports = createRange;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeCeil = Math.ceil,
	    nativeMax = Math.max;

	/**
	 * The base implementation of `_.range` and `_.rangeRight` which doesn't
	 * coerce arguments.
	 *
	 * @private
	 * @param {number} start The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} step The value to increment or decrement by.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Array} Returns the range of numbers.
	 */
	function baseRange(start, end, step, fromRight) {
	  var index = -1,
	      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
	      result = Array(length);

	  while (length--) {
	    result[fromRight ? length : ++index] = start;
	    start += step;
	  }
	  return result;
	}

	module.exports = baseRange;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(27),
	    isArrayLike = __webpack_require__(28),
	    isIndex = __webpack_require__(38),
	    isObject = __webpack_require__(36);

	/**
	 * Checks if the given arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	 *  else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)
	      ) {
	    return eq(object[index], value);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	module.exports = eq;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(29),
	    isLength = __webpack_require__(37);

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	module.exports = isArrayLike;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(30),
	    isObject = __webpack_require__(36);

	/** `Object#toString` result references. */
	var asyncTag = '[object AsyncFunction]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    proxyTag = '[object Proxy]';

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	module.exports = isFunction;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(31),
	    getRawTag = __webpack_require__(34),
	    objectToString = __webpack_require__(35);

	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	module.exports = baseGetTag;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(32);

	/** Built-in value references. */
	var Symbol = root.Symbol;

	module.exports = Symbol;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var freeGlobal = __webpack_require__(33);

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	module.exports = root;


/***/ }),
/* 33 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	module.exports = freeGlobal;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(31);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Built-in value references. */
	var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	module.exports = getRawTag;


/***/ }),
/* 35 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}

	module.exports = objectToString;


/***/ }),
/* 36 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ }),
/* 38 */
/***/ (function(module, exports) {

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	module.exports = isIndex;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var toNumber = __webpack_require__(40);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0,
	    MAX_INTEGER = 1.7976931348623157e+308;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	module.exports = toFinite;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(36),
	    isSymbol = __webpack_require__(41);

	/** Used as references for various `Number` constants. */
	var NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	module.exports = toNumber;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(30),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && baseGetTag(value) == symbolTag);
	}

	module.exports = isSymbol;


/***/ }),
/* 42 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(44),
	    castFunction = __webpack_require__(45),
	    toInteger = __webpack_require__(47);

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** Used as references for the maximum length and index of an array. */
	var MAX_ARRAY_LENGTH = 4294967295;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;

	/**
	 * Invokes the iteratee `n` times, returning an array of the results of
	 * each invocation. The iteratee is invoked with one argument; (index).
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 * @example
	 *
	 * _.times(3, String);
	 * // => ['0', '1', '2']
	 *
	 *  _.times(4, _.constant(0));
	 * // => [0, 0, 0, 0]
	 */
	function times(n, iteratee) {
	  n = toInteger(n);
	  if (n < 1 || n > MAX_SAFE_INTEGER) {
	    return [];
	  }
	  var index = MAX_ARRAY_LENGTH,
	      length = nativeMin(n, MAX_ARRAY_LENGTH);

	  iteratee = castFunction(iteratee);
	  n -= MAX_ARRAY_LENGTH;

	  var result = baseTimes(length, iteratee);
	  while (++index < n) {
	    iteratee(index);
	  }
	  return result;
	}

	module.exports = times;


/***/ }),
/* 44 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	module.exports = baseTimes;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(46);

	/**
	 * Casts `value` to `identity` if it's not a function.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {Function} Returns cast function.
	 */
	function castFunction(value) {
	  return typeof value == 'function' ? value : identity;
	}

	module.exports = castFunction;


/***/ }),
/* 46 */
/***/ (function(module, exports) {

	/**
	 * This method returns the first argument it receives.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Util
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 *
	 * console.log(_.identity(object) === object);
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var toFinite = __webpack_require__(39);

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}

	module.exports = toInteger;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.CommandConfigure = exports.CommandSearch = exports.CommandInput = undefined;

	var _each = __webpack_require__(49);

	var _each2 = _interopRequireDefault(_each);

	var _filter = __webpack_require__(72);

	var _filter2 = _interopRequireDefault(_filter);

	var _flatten = __webpack_require__(157);

	var _flatten2 = _interopRequireDefault(_flatten);

	var _flatMap = __webpack_require__(160);

	var _flatMap2 = _interopRequireDefault(_flatMap);

	var _groupBy = __webpack_require__(163);

	var _groupBy2 = _interopRequireDefault(_groupBy);

	var _map = __webpack_require__(161);

	var _map2 = _interopRequireDefault(_map);

	var _values = __webpack_require__(169);

	var _values2 = _interopRequireDefault(_values);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var typeahead = __webpack_require__(171);
	var Bloodhound = __webpack_require__(172);

	var CommandInput = {
	    oninit: function oninit(vnode) {
	        bliss.cmd.typeahead = { dict: {}, hist: {} };

	        bliss.events.on('cmd:hist', function (cmdname) {
	            bliss.cmd.typeahead.hist.add([cmdname]);
	        });
	    },
	    oncreate: function oncreate(vnode) {
	        bliss.cmd.promise.then(function (dict) {
	            var tokenize = function tokenize(str) {
	                return str ? str.split('_') : [];
	            };

	            bliss.cmd.typeahead.dict = new Bloodhound({
	                datumTokenizer: tokenize,
	                queryTokenizer: tokenize,
	                local: (0, _map2.default)(dict, function (value, key) {
	                    return value.name;
	                })
	            });

	            bliss.cmd.typeahead.hist = new Bloodhound({
	                datumTokenizer: tokenize,
	                queryTokenizer: tokenize,
	                prefetch: { url: '/cmd/hist.json', cache: false }
	            });

	            $('#command-typeahead').typeahead({
	                highlight: true
	            }, {
	                name: 'cmd-hist',
	                limit: 10,
	                source: bliss.cmd.typeahead.hist,
	                templates: { header: '<h4 class="typeahead-heading">History</h4>' }
	            }, {
	                name: 'cmd-dict',
	                limit: 10,
	                source: bliss.cmd.typeahead.dict,
	                templates: { header: '<h4 class="typeahead-heading">Dictionary</h4>' }
	            });
	        });

	        $('#command-submit-form').submit(function (e) {
	            e.preventDefault();
	            var url = $('#command-submit-form').attr('action');
	            var data = new FormData();
	            data.append('command', $('#command-typeahead').val());
	            m.request({ method: 'POST', url: url, data: data });
	            $('#command-typeahead').typeahead('val', '').focus();
	        });
	    },
	    view: function view(vnode) {
	        return m('div', { id: 'bliss-command-input' }, m('form', {
	            class: 'form-horizontal',
	            role: 'form',
	            method: 'POST',
	            action: '/cmd',
	            id: 'command-submit-form'
	        }, [m('label', 'Send Command:'), m('div', { class: 'input-group' }, [m('input', {
	            class: 'typeahead form-control',
	            id: 'command-typeahead',
	            type: 'text',
	            name: 'command',
	            placeholder: 'Select Command ...'
	        }), m('span', { class: 'input-group-btn' }, m('button', { class: 'btn btn-success', type: 'submit' }, 'Send'))])]));
	    }
	};

	var CommandSelectionData = {
	    activeCommand: null
	};

	var CommandSearch = {
	    groupedCommands: {},
	    commandFilter: '',

	    oninit: function oninit(vnode) {
	        var _this = this;

	        bliss.cmd.promise.then(function () {
	            _this.groupedCommands = bliss.cmd.dict.bySubsystem;
	        });
	    },
	    oncreate: function oncreate(vnode) {
	        var _this2 = this;

	        $(function () {
	            $('[data-toggle="popover"]').popover();
	        });

	        $('#command-search').focus(function (e) {
	            $('.panel-collapse').collapse('show');
	        });

	        $('#command-search').keyup(function (e) {
	            _this2.commandFilter = $('#command-search').val();
	            m.redraw();
	        });

	        $('#command-search-clear').mousedown(function (e) {
	            e.preventDefault();
	            _this2.resetCommandFiltering();
	        });
	    },
	    view: function view(vnode) {
	        var _this3 = this;

	        var cmdAccordions = "";
	        if (Object.keys(this.groupedCommands).length > 0) {
	            var displayCommands = this.groupedCommands;

	            // Filter commands based on user search if necessary
	            if (this.commandFilter.length !== 0) {
	                var filteredCommands = {};
	                (0, _each2.default)(displayCommands, function (value, key) {
	                    filteredCommands[key] = (0, _filter2.default)(value, function (cmd) {
	                        return cmd.name.toLowerCase().includes(_this3.commandFilter.toLowerCase());
	                    });
	                });
	                displayCommands = filteredCommands;
	            }

	            cmdAccordions = (0, _flatMap2.default)(displayCommands, function (v, k) {
	                // Generate the accordion header for the current subsystem key
	                var header = m('div', { class: 'panel-heading', role: 'tab', id: 'heading' + k }, m('h4', { class: 'panel-title' }, m('a', {
	                    role: 'button',
	                    'data-toggle': 'collapse',
	                    'data-parent': '#cmdTree',
	                    href: '#collapse' + k
	                }, k)));
	                var commandList = (0, _map2.default)(v, function (v) {
	                    return m('li', m('a', {
	                        class: 'btn',
	                        role: 'button',
	                        'data-toggle': 'popover',
	                        'data-trigger': 'hover',
	                        'data-content': v.desc,
	                        onmousedown: function onmousedown() {
	                            CommandSelectionData.activeCommand = v;
	                        }
	                    }, v.name));
	                }
	                // Generate the accordion body containing each of the commands
	                );var body = m('div', {
	                    class: 'panel-collapse collapse',
	                    role: 'tabpanel',
	                    id: 'collapse' + k
	                }, m('div', { class: 'panel-body' }, m('ul', commandList)));
	                return [header, body];
	            });
	        }

	        var commandSearchInput = m('input', {
	            class: 'form-control',
	            id: 'command-search',
	            placeholder: 'Search ...',
	            type: 'search'
	        });
	        var commandSearchReset = m('div', { class: 'input-group-btn' }, m('button', { class: 'btn btn-default', id: 'command-search-clear' }, m('span', {
	            class: 'glyphicon glyphicon-remove-circle'
	        })));
	        var commandSearchBox = m('div', { class: 'input-group' }, [commandSearchInput, commandSearchReset]);
	        var cmdTree = m('div', {
	            class: 'panel-group',
	            role: 'tablist',
	            id: 'cmdTree',
	            style: 'margin-top: 20px;' }, [commandSearchBox, m('div', {
	            class: 'panel panel-default',
	            id: 'cmdAccordions' }, cmdAccordions)]);
	        return cmdTree;
	    },
	    resetCommandFiltering: function resetCommandFiltering() {
	        $('#command-search').val('');
	        $('.panel-collapse').collapse('hide');
	        this.commandFilter = '';
	        m.redraw();
	    }
	};

	/**
	 * Handle the configuration of command arguments for the currently select
	 * command (specified via CommandSelectionData.activeCommand)
	 */
	var CommandConfigure = {
	    view: function view(vnode) {
	        var commandSelection = null;
	        // If a command has been selected, render the command customization screen
	        if (CommandSelectionData.activeCommand !== null) {
	            commandSelection = m('div', { id: 'commandCustomizer' }, [m('div', { class: 'row' },
	            //m('div', {class: 'col-lg-4 col-lg-offset-1'},
	            m('div', { class: 'col-lg-12' }, m('h3', CommandSelectionData.activeCommand.name))), m('div', { class: 'row' },
	            //m('div', {class: 'col-lg-7 col-lg-offset-1'},
	            m('div', { class: 'col-lg-10 col-lg-offset-1' }, m('div', CommandSelectionData.activeCommand.desc.replace(/(\r\n|\n|\r)/gm, " ")))), m('div', { class: 'row' },
	            //m('div', {class: 'col-lg-7 col-lg-offset-1'},
	            m('div', { class: 'col-lg-10 col-lg-offset-1' }, this.generateCommandArgumentsForm(CommandSelectionData.activeCommand)))]
	            // If no command has been selected, render some help info
	            );
	        } else {
	            commandSelection = m('div', {
	                class: 'col-lg-6 col-lg-offset-3 alert alert-info',
	                role: 'alert',
	                style: 'margin-top: 20px;'
	            }, [m('span', { class: 'glyphicon glyphicon-info-sign' }), ' Please select a command to configure']);
	        }
	        return commandSelection;
	    },


	    /**
	     * Generate the argument configuring form for a given command
	     * dictionary object.
	     */
	    generateCommandArgumentsForm: function generateCommandArgumentsForm(command) {
	        var _this4 = this;

	        var argdefns = Object.keys(command.arguments).map(function (k) {
	            return command.arguments[k];
	        }).filter(function (arg) {
	            if (arg.fixed === true) {
	                return false;
	            } else {
	                return true;
	            }
	        }

	        // Argument definitions needs to be sorted in byte order for display
	        );argdefns.sort(function (a, b) {
	            var aCmp = void 0,
	                bCmp = null;
	            if (Array.isArray(a.bytes)) {
	                aCmp = a.bytes[0];
	            } else {
	                aCmp = a.bytes;
	            }

	            if (Array.isArray(b.bytes)) {
	                bCmp = b.bytes[0];
	            } else {
	                bCmp = b.bytes;
	            }

	            if (aCmp < bCmp) return -1;else if (bCmp < aCmp) return 1;else return 0;
	        });

	        var cmdArgs = (0, _map2.default)(argdefns, function (arg) {
	            return m('div', { class: 'form-group' }, (0, _flatten2.default)([m('label', { class: 'col-lg-2 control-label' }, _this4.prettifyName(arg.name)), _this4.generateArgumentInput(arg)]));
	        });
	        return m('form', {
	            id: 'command-args-form',
	            class: 'form-horizontal',
	            onsubmit: this.handleCommandFormSubmission,
	            method: 'POST',
	            action: '/cmd'
	        }, [m('input', {
	            id: 'command-arg-name',
	            type: 'hidden',
	            value: CommandSelectionData.activeCommand.name
	        }), cmdArgs, m('button', { class: "btn btn-default", type: "submit" }, "Send Command")]);
	    },


	    /**
	     *
	     */
	    prettifyName: function prettifyName(name) {
	        var name_parts = name.split('_');
	        name_parts = (0, _map2.default)(name_parts, function (v) {
	            return v.charAt(0).toUpperCase() + v.slice(1);
	        });
	        return name_parts.join(' ');
	    },


	    /**
	     * Generate the argument input field for a given command's argument object.
	     */
	    generateArgumentInput: function generateArgumentInput(argument) {
	        var argInput = null;
	        if ('enum' in argument) {
	            argInput = m('select', { class: 'form-control' }, (0, _map2.default)(argument.enum, function (v, k) {
	                return m('option', { value: k }, k + ' (' + v + ')');
	            }));
	        } else {
	            argInput = m('input', { class: 'form-control' });
	        }

	        if ('units' in argument && argument.units !== 'none') {
	            return m('div', { class: 'input-group col-lg-8' }, [argInput, m('div', { class: 'input-group-addon' }, argument.units)]);
	        } else {
	            return m('div', { class: 'input-group col-lg-8' }, [argInput]);
	        }
	    },


	    /**
	     * Handles construction of the command and submission to the backend
	     */
	    handleCommandFormSubmission: function handleCommandFormSubmission(e) {
	        e.preventDefault();

	        var url = $('#command-args-form').attr('action'

	        // Generate command from name + configured arguments
	        );var command = $('#command-args-form > input#command-arg-name').val();
	        $('#command-args-form :input').each(function (index, input) {
	            if (!$(input).hasClass('form-control')) return;
	            command += ' ' + $(input).val();
	        }

	        // Note: FormData resoles issues with m.request passing data to the
	        // backend in a form that the existing /cmd endpoint doesn't like.
	        );var data = new FormData();
	        data.append('command', command);
	        m.request({ method: 'POST', url: url, data: data });

	        CommandSelectionData.activeCommand = null;
	        bliss.events.emit('cmd:submit', {});
	    }
	};

	exports.default = { CommandInput: CommandInput, CommandSearch: CommandSearch, CommandConfigure: CommandConfigure };
	exports.CommandInput = CommandInput;
	exports.CommandSearch = CommandSearch;
	exports.CommandConfigure = CommandConfigure;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(50);


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(51),
	    baseEach = __webpack_require__(52),
	    castFunction = __webpack_require__(45),
	    isArray = __webpack_require__(60);

	/**
	 * Iterates over elements of `collection` and invokes `iteratee` for each element.
	 * The iteratee is invoked with three arguments: (value, index|key, collection).
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * **Note:** As with other "Collections" methods, objects with a "length"
	 * property are iterated like arrays. To avoid this behavior use `_.forIn`
	 * or `_.forOwn` for object iteration.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @alias each
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 * @see _.forEachRight
	 * @example
	 *
	 * _.forEach([1, 2], function(value) {
	 *   console.log(value);
	 * });
	 * // => Logs `1` then `2`.
	 *
	 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
	 *   console.log(key);
	 * });
	 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
	 */
	function forEach(collection, iteratee) {
	  var func = isArray(collection) ? arrayEach : baseEach;
	  return func(collection, castFunction(iteratee));
	}

	module.exports = forEach;


/***/ }),
/* 51 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	module.exports = arrayEach;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(53),
	    createBaseEach = __webpack_require__(71);

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	module.exports = baseEach;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(54),
	    keys = __webpack_require__(56);

	/**
	 * The base implementation of `_.forOwn` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return object && baseFor(object, iteratee, keys);
	}

	module.exports = baseForOwn;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(55);

	/**
	 * The base implementation of `baseForOwn` which iterates over `object`
	 * properties returned by `keysFunc` and invokes `iteratee` for each property.
	 * Iteratee functions may exit iteration early by explicitly returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ }),
/* 55 */
/***/ (function(module, exports) {

	/**
	 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var index = -1,
	        iterable = Object(object),
	        props = keysFunc(object),
	        length = props.length;

	    while (length--) {
	      var key = props[fromRight ? length : ++index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = createBaseFor;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayLikeKeys = __webpack_require__(57),
	    baseKeys = __webpack_require__(67),
	    isArrayLike = __webpack_require__(28);

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	module.exports = keys;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var baseTimes = __webpack_require__(44),
	    isArguments = __webpack_require__(58),
	    isArray = __webpack_require__(60),
	    isBuffer = __webpack_require__(61),
	    isIndex = __webpack_require__(38),
	    isTypedArray = __webpack_require__(63);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = arrayLikeKeys;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsArguments = __webpack_require__(59),
	    isObjectLike = __webpack_require__(42);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};

	module.exports = isArguments;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(30),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}

	module.exports = baseIsArguments;


/***/ }),
/* 60 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	module.exports = isArray;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(32),
	    stubFalse = __webpack_require__(62);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	module.exports = isBuffer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)(module)))

/***/ }),
/* 62 */
/***/ (function(module, exports) {

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = stubFalse;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsTypedArray = __webpack_require__(64),
	    baseUnary = __webpack_require__(65),
	    nodeUtil = __webpack_require__(66);

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	module.exports = isTypedArray;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetTag = __webpack_require__(30),
	    isLength = __webpack_require__(37),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

	module.exports = baseIsTypedArray;


/***/ }),
/* 65 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	module.exports = baseUnary;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(33);

	/** Detect free variable `exports`. */
	var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	module.exports = nodeUtil;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)(module)))

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var isPrototype = __webpack_require__(68),
	    nativeKeys = __webpack_require__(69);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = baseKeys;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	module.exports = isPrototype;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(70);

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeKeys = overArg(Object.keys, Object);

	module.exports = nativeKeys;


/***/ }),
/* 70 */
/***/ (function(module, exports) {

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	module.exports = overArg;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(28);

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    if (collection == null) {
	      return collection;
	    }
	    if (!isArrayLike(collection)) {
	      return eachFunc(collection, iteratee);
	    }
	    var length = collection.length,
	        index = fromRight ? length : -1,
	        iterable = Object(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	module.exports = createBaseEach;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(73),
	    baseFilter = __webpack_require__(74),
	    baseIteratee = __webpack_require__(75),
	    isArray = __webpack_require__(60);

	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * **Note:** Unlike `_.remove`, this method returns a new array.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [predicate=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 * @see _.reject
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': true },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * _.filter(users, function(o) { return !o.active; });
	 * // => objects for ['fred']
	 *
	 * // The `_.matches` iteratee shorthand.
	 * _.filter(users, { 'age': 36, 'active': true });
	 * // => objects for ['barney']
	 *
	 * // The `_.matchesProperty` iteratee shorthand.
	 * _.filter(users, ['active', false]);
	 * // => objects for ['fred']
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.filter(users, 'active');
	 * // => objects for ['barney']
	 */
	function filter(collection, predicate) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  return func(collection, baseIteratee(predicate, 3));
	}

	module.exports = filter;


/***/ }),
/* 73 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	module.exports = arrayFilter;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(52);

	/**
	 * The base implementation of `_.filter` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function baseFilter(collection, predicate) {
	  var result = [];
	  baseEach(collection, function(value, index, collection) {
	    if (predicate(value, index, collection)) {
	      result.push(value);
	    }
	  });
	  return result;
	}

	module.exports = baseFilter;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(76),
	    baseMatchesProperty = __webpack_require__(139),
	    identity = __webpack_require__(46),
	    isArray = __webpack_require__(60),
	    property = __webpack_require__(154);

	/**
	 * The base implementation of `_.iteratee`.
	 *
	 * @private
	 * @param {*} [value=_.identity] The value to convert to an iteratee.
	 * @returns {Function} Returns the iteratee.
	 */
	function baseIteratee(value) {
	  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	  if (typeof value == 'function') {
	    return value;
	  }
	  if (value == null) {
	    return identity;
	  }
	  if (typeof value == 'object') {
	    return isArray(value)
	      ? baseMatchesProperty(value[0], value[1])
	      : baseMatches(value);
	  }
	  return property(value);
	}

	module.exports = baseIteratee;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(77),
	    getMatchData = __webpack_require__(136),
	    matchesStrictComparable = __webpack_require__(138);

	/**
	 * The base implementation of `_.matches` which doesn't clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	  }
	  return function(object) {
	    return object === source || baseIsMatch(object, source, matchData);
	  };
	}

	module.exports = baseMatches;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(78),
	    baseIsEqual = __webpack_require__(113);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.isMatch` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Object} source The object of property values to match.
	 * @param {Array} matchData The property names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, source, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = Object(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var stack = new Stack;
	      if (customizer) {
	        var result = customizer(objValue, srcValue, key, object, source, stack);
	      }
	      if (!(result === undefined
	            ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
	            : result
	          )) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(79),
	    stackClear = __webpack_require__(86),
	    stackDelete = __webpack_require__(87),
	    stackGet = __webpack_require__(88),
	    stackHas = __webpack_require__(89),
	    stackSet = __webpack_require__(90);

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	module.exports = Stack;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	var listCacheClear = __webpack_require__(80),
	    listCacheDelete = __webpack_require__(81),
	    listCacheGet = __webpack_require__(83),
	    listCacheHas = __webpack_require__(84),
	    listCacheSet = __webpack_require__(85);

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	module.exports = ListCache;


/***/ }),
/* 80 */
/***/ (function(module, exports) {

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}

	module.exports = listCacheClear;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(82);

	/** Used for built-in method references. */
	var arrayProto = Array.prototype;

	/** Built-in value references. */
	var splice = arrayProto.splice;

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	module.exports = listCacheDelete;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	var eq = __webpack_require__(27);

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	module.exports = assocIndexOf;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(82);

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	module.exports = listCacheGet;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(82);

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	module.exports = listCacheHas;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	var assocIndexOf = __webpack_require__(82);

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	module.exports = listCacheSet;


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(79);

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	  this.size = 0;
	}

	module.exports = stackClear;


/***/ }),
/* 87 */
/***/ (function(module, exports) {

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);

	  this.size = data.size;
	  return result;
	}

	module.exports = stackDelete;


/***/ }),
/* 88 */
/***/ (function(module, exports) {

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	module.exports = stackGet;


/***/ }),
/* 89 */
/***/ (function(module, exports) {

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	module.exports = stackHas;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	var ListCache = __webpack_require__(79),
	    Map = __webpack_require__(91),
	    MapCache = __webpack_require__(98);

	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache) {
	    var pairs = data.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	module.exports = stackSet;


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92),
	    root = __webpack_require__(32);

	/* Built-in method references that are verified to be native. */
	var Map = getNative(root, 'Map');

	module.exports = Map;


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsNative = __webpack_require__(93),
	    getValue = __webpack_require__(97);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(29),
	    isMasked = __webpack_require__(94),
	    isObject = __webpack_require__(36),
	    toSource = __webpack_require__(96);

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	module.exports = baseIsNative;


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	var coreJsData = __webpack_require__(95);

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	module.exports = isMasked;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(32);

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	module.exports = coreJsData;


/***/ }),
/* 96 */
/***/ (function(module, exports) {

	/** Used for built-in method references. */
	var funcProto = Function.prototype;

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	module.exports = toSource;


/***/ }),
/* 97 */
/***/ (function(module, exports) {

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	module.exports = getValue;


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	var mapCacheClear = __webpack_require__(99),
	    mapCacheDelete = __webpack_require__(107),
	    mapCacheGet = __webpack_require__(110),
	    mapCacheHas = __webpack_require__(111),
	    mapCacheSet = __webpack_require__(112);

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	module.exports = MapCache;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

	var Hash = __webpack_require__(100),
	    ListCache = __webpack_require__(79),
	    Map = __webpack_require__(91);

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	module.exports = mapCacheClear;


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	var hashClear = __webpack_require__(101),
	    hashDelete = __webpack_require__(103),
	    hashGet = __webpack_require__(104),
	    hashHas = __webpack_require__(105),
	    hashSet = __webpack_require__(106);

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	module.exports = Hash;


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(102);

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}

	module.exports = hashClear;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92);

	/* Built-in method references that are verified to be native. */
	var nativeCreate = getNative(Object, 'create');

	module.exports = nativeCreate;


/***/ }),
/* 103 */
/***/ (function(module, exports) {

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	module.exports = hashDelete;


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(102);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	module.exports = hashGet;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(102);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
	}

	module.exports = hashHas;


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	var nativeCreate = __webpack_require__(102);

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	module.exports = hashSet;


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(108);

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	module.exports = mapCacheDelete;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	var isKeyable = __webpack_require__(109);

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	module.exports = getMapData;


/***/ }),
/* 109 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	module.exports = isKeyable;


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(108);

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	module.exports = mapCacheGet;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(108);

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	module.exports = mapCacheHas;


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	var getMapData = __webpack_require__(108);

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	module.exports = mapCacheSet;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(114),
	    isObjectLike = __webpack_require__(42);

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

	module.exports = baseIsEqual;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	var Stack = __webpack_require__(78),
	    equalArrays = __webpack_require__(115),
	    equalByTag = __webpack_require__(121),
	    equalObjects = __webpack_require__(125),
	    getTag = __webpack_require__(131),
	    isArray = __webpack_require__(60),
	    isBuffer = __webpack_require__(61),
	    isTypedArray = __webpack_require__(63);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);

	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;

	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	module.exports = baseIsEqualDeep;


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	var SetCache = __webpack_require__(116),
	    arraySome = __webpack_require__(119),
	    cacheHas = __webpack_require__(120);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	module.exports = equalArrays;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(98),
	    setCacheAdd = __webpack_require__(117),
	    setCacheHas = __webpack_require__(118);

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	module.exports = SetCache;


/***/ }),
/* 117 */
/***/ (function(module, exports) {

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	module.exports = setCacheAdd;


/***/ }),
/* 118 */
/***/ (function(module, exports) {

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}

	module.exports = setCacheHas;


/***/ }),
/* 119 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arraySome;


/***/ }),
/* 120 */
/***/ (function(module, exports) {

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}

	module.exports = cacheHas;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(31),
	    Uint8Array = __webpack_require__(122),
	    eq = __webpack_require__(27),
	    equalArrays = __webpack_require__(115),
	    mapToArray = __webpack_require__(123),
	    setToArray = __webpack_require__(124);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]';

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	module.exports = equalByTag;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

	var root = __webpack_require__(32);

	/** Built-in value references. */
	var Uint8Array = root.Uint8Array;

	module.exports = Uint8Array;


/***/ }),
/* 123 */
/***/ (function(module, exports) {

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	module.exports = mapToArray;


/***/ }),
/* 124 */
/***/ (function(module, exports) {

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	module.exports = setToArray;


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	var getAllKeys = __webpack_require__(126);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1;

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	module.exports = equalObjects;


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGetAllKeys = __webpack_require__(127),
	    getSymbols = __webpack_require__(129),
	    keys = __webpack_require__(56);

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	module.exports = getAllKeys;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(128),
	    isArray = __webpack_require__(60);

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}

	module.exports = baseGetAllKeys;


/***/ }),
/* 128 */
/***/ (function(module, exports) {

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	module.exports = arrayPush;


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayFilter = __webpack_require__(73),
	    stubArray = __webpack_require__(130);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Built-in value references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols;

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};

	module.exports = getSymbols;


/***/ }),
/* 130 */
/***/ (function(module, exports) {

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	module.exports = stubArray;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

	var DataView = __webpack_require__(132),
	    Map = __webpack_require__(91),
	    Promise = __webpack_require__(133),
	    Set = __webpack_require__(134),
	    WeakMap = __webpack_require__(135),
	    baseGetTag = __webpack_require__(30),
	    toSource = __webpack_require__(96);

	/** `Object#toString` result references. */
	var mapTag = '[object Map]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    setTag = '[object Set]',
	    weakMapTag = '[object WeakMap]';

	var dataViewTag = '[object DataView]';

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	module.exports = getTag;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92),
	    root = __webpack_require__(32);

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView');

	module.exports = DataView;


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92),
	    root = __webpack_require__(32);

	/* Built-in method references that are verified to be native. */
	var Promise = getNative(root, 'Promise');

	module.exports = Promise;


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92),
	    root = __webpack_require__(32);

	/* Built-in method references that are verified to be native. */
	var Set = getNative(root, 'Set');

	module.exports = Set;


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92),
	    root = __webpack_require__(32);

	/* Built-in method references that are verified to be native. */
	var WeakMap = getNative(root, 'WeakMap');

	module.exports = WeakMap;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(137),
	    keys = __webpack_require__(56);

	/**
	 * Gets the property names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = keys(object),
	      length = result.length;

	  while (length--) {
	    var key = result[length],
	        value = object[key];

	    result[length] = [key, value, isStrictComparable(value)];
	  }
	  return result;
	}

	module.exports = getMatchData;


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(36);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}

	module.exports = isStrictComparable;


/***/ }),
/* 138 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `matchesProperty` for source values suitable
	 * for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function matchesStrictComparable(key, srcValue) {
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    return object[key] === srcValue &&
	      (srcValue !== undefined || (key in Object(object)));
	  };
	}

	module.exports = matchesStrictComparable;


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(113),
	    get = __webpack_require__(140),
	    hasIn = __webpack_require__(151),
	    isKey = __webpack_require__(143),
	    isStrictComparable = __webpack_require__(137),
	    matchesStrictComparable = __webpack_require__(138),
	    toKey = __webpack_require__(150);

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/**
	 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to match.
	 * @returns {Function} Returns the new spec function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  if (isKey(path) && isStrictComparable(srcValue)) {
	    return matchesStrictComparable(toKey(path), srcValue);
	  }
	  return function(object) {
	    var objValue = get(object, path);
	    return (objValue === undefined && objValue === srcValue)
	      ? hasIn(object, path)
	      : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	  };
	}

	module.exports = baseMatchesProperty;


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(141);

	/**
	 * Gets the value at `path` of `object`. If the resolved value is
	 * `undefined`, the `defaultValue` is returned in its place.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.7.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	 * @returns {*} Returns the resolved value.
	 * @example
	 *
	 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	 *
	 * _.get(object, 'a[0].b.c');
	 * // => 3
	 *
	 * _.get(object, ['a', '0', 'b', 'c']);
	 * // => 3
	 *
	 * _.get(object, 'a.b.c', 'default');
	 * // => 'default'
	 */
	function get(object, path, defaultValue) {
	  var result = object == null ? undefined : baseGet(object, path);
	  return result === undefined ? defaultValue : result;
	}

	module.exports = get;


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(142),
	    toKey = __webpack_require__(150);

	/**
	 * The base implementation of `_.get` without support for default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path of the property to get.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path) {
	  path = castPath(path, object);

	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[toKey(path[index++])];
	  }
	  return (index && index == length) ? object : undefined;
	}

	module.exports = baseGet;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(60),
	    isKey = __webpack_require__(143),
	    stringToPath = __webpack_require__(144),
	    toString = __webpack_require__(147);

	/**
	 * Casts `value` to a path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {Array} Returns the cast property path array.
	 */
	function castPath(value, object) {
	  if (isArray(value)) {
	    return value;
	  }
	  return isKey(value, object) ? [value] : stringToPath(toString(value));
	}

	module.exports = castPath;


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(60),
	    isSymbol = __webpack_require__(41);

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  if (isArray(value)) {
	    return false;
	  }
	  var type = typeof value;
	  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	      value == null || isSymbol(value)) {
	    return true;
	  }
	  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	    (object != null && value in Object(object));
	}

	module.exports = isKey;


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

	var memoizeCapped = __webpack_require__(145);

	/** Used to match property names within property paths. */
	var reLeadingDot = /^\./,
	    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `string` to a property path array.
	 *
	 * @private
	 * @param {string} string The string to convert.
	 * @returns {Array} Returns the property path array.
	 */
	var stringToPath = memoizeCapped(function(string) {
	  var result = [];
	  if (reLeadingDot.test(string)) {
	    result.push('');
	  }
	  string.replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	});

	module.exports = stringToPath;


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

	var memoize = __webpack_require__(146);

	/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;

	/**
	 * A specialized version of `_.memoize` which clears the memoized function's
	 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	 *
	 * @private
	 * @param {Function} func The function to have its output memoized.
	 * @returns {Function} Returns the new memoized function.
	 */
	function memoizeCapped(func) {
	  var result = memoize(func, function(key) {
	    if (cache.size === MAX_MEMOIZE_SIZE) {
	      cache.clear();
	    }
	    return key;
	  });

	  var cache = result.cache;
	  return result;
	}

	module.exports = memoizeCapped;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

	var MapCache = __webpack_require__(98);

	/** Error message constants. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/**
	 * Creates a function that memoizes the result of `func`. If `resolver` is
	 * provided, it determines the cache key for storing the result based on the
	 * arguments provided to the memoized function. By default, the first argument
	 * provided to the memoized function is used as the map cache key. The `func`
	 * is invoked with the `this` binding of the memoized function.
	 *
	 * **Note:** The cache is exposed as the `cache` property on the memoized
	 * function. Its creation may be customized by replacing the `_.memoize.Cache`
	 * constructor with one whose instances implement the
	 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Function
	 * @param {Function} func The function to have its output memoized.
	 * @param {Function} [resolver] The function to resolve the cache key.
	 * @returns {Function} Returns the new memoized function.
	 * @example
	 *
	 * var object = { 'a': 1, 'b': 2 };
	 * var other = { 'c': 3, 'd': 4 };
	 *
	 * var values = _.memoize(_.values);
	 * values(object);
	 * // => [1, 2]
	 *
	 * values(other);
	 * // => [3, 4]
	 *
	 * object.a = 2;
	 * values(object);
	 * // => [1, 2]
	 *
	 * // Modify the result cache.
	 * values.cache.set(object, ['a', 'b']);
	 * values(object);
	 * // => ['a', 'b']
	 *
	 * // Replace `_.memoize.Cache`.
	 * _.memoize.Cache = WeakMap;
	 */
	function memoize(func, resolver) {
	  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var memoized = function() {
	    var args = arguments,
	        key = resolver ? resolver.apply(this, args) : args[0],
	        cache = memoized.cache;

	    if (cache.has(key)) {
	      return cache.get(key);
	    }
	    var result = func.apply(this, args);
	    memoized.cache = cache.set(key, result) || cache;
	    return result;
	  };
	  memoized.cache = new (memoize.Cache || MapCache);
	  return memoized;
	}

	// Expose `MapCache`.
	memoize.Cache = MapCache;

	module.exports = memoize;


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(148);

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}

	module.exports = toString;


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(31),
	    arrayMap = __webpack_require__(149),
	    isArray = __webpack_require__(60),
	    isSymbol = __webpack_require__(41);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isArray(value)) {
	    // Recursively convert values (susceptible to call stack limits).
	    return arrayMap(value, baseToString) + '';
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	module.exports = baseToString;


/***/ }),
/* 149 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	module.exports = arrayMap;


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

	var isSymbol = __webpack_require__(41);

	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/**
	 * Converts `value` to a string key if it's not a string or symbol.
	 *
	 * @private
	 * @param {*} value The value to inspect.
	 * @returns {string|symbol} Returns the key.
	 */
	function toKey(value) {
	  if (typeof value == 'string' || isSymbol(value)) {
	    return value;
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	module.exports = toKey;


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

	var baseHasIn = __webpack_require__(152),
	    hasPath = __webpack_require__(153);

	/**
	 * Checks if `path` is a direct or inherited property of `object`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 * @example
	 *
	 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	 *
	 * _.hasIn(object, 'a');
	 * // => true
	 *
	 * _.hasIn(object, 'a.b');
	 * // => true
	 *
	 * _.hasIn(object, ['a', 'b']);
	 * // => true
	 *
	 * _.hasIn(object, 'b');
	 * // => false
	 */
	function hasIn(object, path) {
	  return object != null && hasPath(object, path, baseHasIn);
	}

	module.exports = hasIn;


/***/ }),
/* 152 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.hasIn` without support for deep paths.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {Array|string} key The key to check.
	 * @returns {boolean} Returns `true` if `key` exists, else `false`.
	 */
	function baseHasIn(object, key) {
	  return object != null && key in Object(object);
	}

	module.exports = baseHasIn;


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

	var castPath = __webpack_require__(142),
	    isArguments = __webpack_require__(58),
	    isArray = __webpack_require__(60),
	    isIndex = __webpack_require__(38),
	    isLength = __webpack_require__(37),
	    toKey = __webpack_require__(150);

	/**
	 * Checks if `path` exists on `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @param {Function} hasFunc The function to check properties.
	 * @returns {boolean} Returns `true` if `path` exists, else `false`.
	 */
	function hasPath(object, path, hasFunc) {
	  path = castPath(path, object);

	  var index = -1,
	      length = path.length,
	      result = false;

	  while (++index < length) {
	    var key = toKey(path[index]);
	    if (!(result = object != null && hasFunc(object, key))) {
	      break;
	    }
	    object = object[key];
	  }
	  if (result || ++index != length) {
	    return result;
	  }
	  length = object == null ? 0 : object.length;
	  return !!length && isLength(length) && isIndex(key, length) &&
	    (isArray(object) || isArguments(object));
	}

	module.exports = hasPath;


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(155),
	    basePropertyDeep = __webpack_require__(156),
	    isKey = __webpack_require__(143),
	    toKey = __webpack_require__(150);

	/**
	 * Creates a function that returns the value at `path` of a given object.
	 *
	 * @static
	 * @memberOf _
	 * @since 2.4.0
	 * @category Util
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': 2 } },
	 *   { 'a': { 'b': 1 } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b'));
	 * // => [2, 1]
	 *
	 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	}

	module.exports = property;


/***/ }),
/* 155 */
/***/ (function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(141);

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyDeep(path) {
	  return function(object) {
	    return baseGet(object, path);
	  };
	}

	module.exports = basePropertyDeep;


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(158);

	/**
	 * Flattens `array` a single level deep.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Array
	 * @param {Array} array The array to flatten.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * _.flatten([1, [2, [3, [4]], 5]]);
	 * // => [1, 2, [3, [4]], 5]
	 */
	function flatten(array) {
	  var length = array == null ? 0 : array.length;
	  return length ? baseFlatten(array, 1) : [];
	}

	module.exports = flatten;


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(128),
	    isFlattenable = __webpack_require__(159);

	/**
	 * The base implementation of `_.flatten` with support for restricting flattening.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {number} depth The maximum recursion depth.
	 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, depth, predicate, isStrict, result) {
	  var index = -1,
	      length = array.length;

	  predicate || (predicate = isFlattenable);
	  result || (result = []);

	  while (++index < length) {
	    var value = array[index];
	    if (depth > 0 && predicate(value)) {
	      if (depth > 1) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, depth - 1, predicate, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	module.exports = baseFlatten;


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

	var Symbol = __webpack_require__(31),
	    isArguments = __webpack_require__(58),
	    isArray = __webpack_require__(60);

	/** Built-in value references. */
	var spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

	/**
	 * Checks if `value` is a flattenable `arguments` object or array.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	 */
	function isFlattenable(value) {
	  return isArray(value) || isArguments(value) ||
	    !!(spreadableSymbol && value && value[spreadableSymbol]);
	}

	module.exports = isFlattenable;


/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(158),
	    map = __webpack_require__(161);

	/**
	 * Creates a flattened array of values by running each element in `collection`
	 * thru `iteratee` and flattening the mapped results. The iteratee is invoked
	 * with three arguments: (value, index|key, collection).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new flattened array.
	 * @example
	 *
	 * function duplicate(n) {
	 *   return [n, n];
	 * }
	 *
	 * _.flatMap([1, 2], duplicate);
	 * // => [1, 1, 2, 2]
	 */
	function flatMap(collection, iteratee) {
	  return baseFlatten(map(collection, iteratee), 1);
	}

	module.exports = flatMap;


/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(149),
	    baseIteratee = __webpack_require__(75),
	    baseMap = __webpack_require__(162),
	    isArray = __webpack_require__(60);

	/**
	 * Creates an array of values by running each element in `collection` thru
	 * `iteratee`. The iteratee is invoked with three arguments:
	 * (value, index|key, collection).
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
	 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
	 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
	 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function square(n) {
	 *   return n * n;
	 * }
	 *
	 * _.map([4, 8], square);
	 * // => [16, 64]
	 *
	 * _.map({ 'a': 4, 'b': 8 }, square);
	 * // => [16, 64] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee) {
	  var func = isArray(collection) ? arrayMap : baseMap;
	  return func(collection, baseIteratee(iteratee, 3));
	}

	module.exports = map;


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(52),
	    isArrayLike = __webpack_require__(28);

	/**
	 * The base implementation of `_.map` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike(collection) ? Array(collection.length) : [];

	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}

	module.exports = baseMap;


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

	var baseAssignValue = __webpack_require__(164),
	    createAggregator = __webpack_require__(166);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an object composed of keys generated from the results of running
	 * each element of `collection` thru `iteratee`. The order of grouped values
	 * is determined by the order they occur in `collection`. The corresponding
	 * value of each key is an array of elements responsible for generating the
	 * key. The iteratee is invoked with one argument: (value).
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Collection
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	 * @returns {Object} Returns the composed aggregate object.
	 * @example
	 *
	 * _.groupBy([6.1, 4.2, 6.3], Math.floor);
	 * // => { '4': [4.2], '6': [6.1, 6.3] }
	 *
	 * // The `_.property` iteratee shorthand.
	 * _.groupBy(['one', 'two', 'three'], 'length');
	 * // => { '3': ['one', 'two'], '5': ['three'] }
	 */
	var groupBy = createAggregator(function(result, value, key) {
	  if (hasOwnProperty.call(result, key)) {
	    result[key].push(value);
	  } else {
	    baseAssignValue(result, key, [value]);
	  }
	});

	module.exports = groupBy;


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

	var defineProperty = __webpack_require__(165);

	/**
	 * The base implementation of `assignValue` and `assignMergeValue` without
	 * value checks.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function baseAssignValue(object, key, value) {
	  if (key == '__proto__' && defineProperty) {
	    defineProperty(object, key, {
	      'configurable': true,
	      'enumerable': true,
	      'value': value,
	      'writable': true
	    });
	  } else {
	    object[key] = value;
	  }
	}

	module.exports = baseAssignValue;


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(92);

	var defineProperty = (function() {
	  try {
	    var func = getNative(Object, 'defineProperty');
	    func({}, '', {});
	    return func;
	  } catch (e) {}
	}());

	module.exports = defineProperty;


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayAggregator = __webpack_require__(167),
	    baseAggregator = __webpack_require__(168),
	    baseIteratee = __webpack_require__(75),
	    isArray = __webpack_require__(60);

	/**
	 * Creates a function like `_.groupBy`.
	 *
	 * @private
	 * @param {Function} setter The function to set accumulator values.
	 * @param {Function} [initializer] The accumulator object initializer.
	 * @returns {Function} Returns the new aggregator function.
	 */
	function createAggregator(setter, initializer) {
	  return function(collection, iteratee) {
	    var func = isArray(collection) ? arrayAggregator : baseAggregator,
	        accumulator = initializer ? initializer() : {};

	    return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
	  };
	}

	module.exports = createAggregator;


/***/ }),
/* 167 */
/***/ (function(module, exports) {

	/**
	 * A specialized version of `baseAggregator` for arrays.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function arrayAggregator(array, setter, iteratee, accumulator) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    var value = array[index];
	    setter(accumulator, value, iteratee(value), array);
	  }
	  return accumulator;
	}

	module.exports = arrayAggregator;


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(52);

	/**
	 * Aggregates elements of `collection` on `accumulator` with keys transformed
	 * by `iteratee` and values set by `setter`.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} setter The function to set `accumulator` values.
	 * @param {Function} iteratee The iteratee to transform keys.
	 * @param {Object} accumulator The initial aggregated object.
	 * @returns {Function} Returns `accumulator`.
	 */
	function baseAggregator(collection, setter, iteratee, accumulator) {
	  baseEach(collection, function(value, key, collection) {
	    setter(accumulator, value, iteratee(value), collection);
	  });
	  return accumulator;
	}

	module.exports = baseAggregator;


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

	var baseValues = __webpack_require__(170),
	    keys = __webpack_require__(56);

	/**
	 * Creates an array of the own enumerable string keyed property values of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property values.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.values(new Foo);
	 * // => [1, 2] (iteration order is not guaranteed)
	 *
	 * _.values('hi');
	 * // => ['h', 'i']
	 */
	function values(object) {
	  return object == null ? [] : baseValues(object, keys(object));
	}

	module.exports = values;


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(149);

	/**
	 * The base implementation of `_.values` and `_.valuesIn` which creates an
	 * array of `object` property values corresponding to the property names
	 * of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the array of property values.
	 */
	function baseValues(object, props) {
	  return arrayMap(props, function(key) {
	    return object[key];
	  });
	}

	module.exports = baseValues;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(setImmediate) {/*!
	 * typeahead.js 0.11.1
	 * https://github.com/twitter/typeahead.js
	 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
	 */

	(function(root, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(14) ], __WEBPACK_AMD_DEFINE_RESULT__ = function(a0) {
	            return factory(a0);
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === "object") {
	        module.exports = factory(require("jquery"));
	    } else {
	        factory(jQuery);
	    }
	})(this, function($) {
	    var _ = function() {
	        "use strict";
	        return {
	            isMsie: function() {
	                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
	            },
	            isBlankString: function(str) {
	                return !str || /^\s*$/.test(str);
	            },
	            escapeRegExChars: function(str) {
	                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	            },
	            isString: function(obj) {
	                return typeof obj === "string";
	            },
	            isNumber: function(obj) {
	                return typeof obj === "number";
	            },
	            isArray: $.isArray,
	            isFunction: $.isFunction,
	            isObject: $.isPlainObject,
	            isUndefined: function(obj) {
	                return typeof obj === "undefined";
	            },
	            isElement: function(obj) {
	                return !!(obj && obj.nodeType === 1);
	            },
	            isJQuery: function(obj) {
	                return obj instanceof $;
	            },
	            toStr: function toStr(s) {
	                return _.isUndefined(s) || s === null ? "" : s + "";
	            },
	            bind: $.proxy,
	            each: function(collection, cb) {
	                $.each(collection, reverseArgs);
	                function reverseArgs(index, value) {
	                    return cb(value, index);
	                }
	            },
	            map: $.map,
	            filter: $.grep,
	            every: function(obj, test) {
	                var result = true;
	                if (!obj) {
	                    return result;
	                }
	                $.each(obj, function(key, val) {
	                    if (!(result = test.call(null, val, key, obj))) {
	                        return false;
	                    }
	                });
	                return !!result;
	            },
	            some: function(obj, test) {
	                var result = false;
	                if (!obj) {
	                    return result;
	                }
	                $.each(obj, function(key, val) {
	                    if (result = test.call(null, val, key, obj)) {
	                        return false;
	                    }
	                });
	                return !!result;
	            },
	            mixin: $.extend,
	            identity: function(x) {
	                return x;
	            },
	            clone: function(obj) {
	                return $.extend(true, {}, obj);
	            },
	            getIdGenerator: function() {
	                var counter = 0;
	                return function() {
	                    return counter++;
	                };
	            },
	            templatify: function templatify(obj) {
	                return $.isFunction(obj) ? obj : template;
	                function template() {
	                    return String(obj);
	                }
	            },
	            defer: function(fn) {
	                setTimeout(fn, 0);
	            },
	            debounce: function(func, wait, immediate) {
	                var timeout, result;
	                return function() {
	                    var context = this, args = arguments, later, callNow;
	                    later = function() {
	                        timeout = null;
	                        if (!immediate) {
	                            result = func.apply(context, args);
	                        }
	                    };
	                    callNow = immediate && !timeout;
	                    clearTimeout(timeout);
	                    timeout = setTimeout(later, wait);
	                    if (callNow) {
	                        result = func.apply(context, args);
	                    }
	                    return result;
	                };
	            },
	            throttle: function(func, wait) {
	                var context, args, timeout, result, previous, later;
	                previous = 0;
	                later = function() {
	                    previous = new Date();
	                    timeout = null;
	                    result = func.apply(context, args);
	                };
	                return function() {
	                    var now = new Date(), remaining = wait - (now - previous);
	                    context = this;
	                    args = arguments;
	                    if (remaining <= 0) {
	                        clearTimeout(timeout);
	                        timeout = null;
	                        previous = now;
	                        result = func.apply(context, args);
	                    } else if (!timeout) {
	                        timeout = setTimeout(later, remaining);
	                    }
	                    return result;
	                };
	            },
	            stringify: function(val) {
	                return _.isString(val) ? val : JSON.stringify(val);
	            },
	            noop: function() {}
	        };
	    }();
	    var WWW = function() {
	        "use strict";
	        var defaultClassNames = {
	            wrapper: "twitter-typeahead",
	            input: "tt-input",
	            hint: "tt-hint",
	            menu: "tt-menu",
	            dataset: "tt-dataset",
	            suggestion: "tt-suggestion",
	            selectable: "tt-selectable",
	            empty: "tt-empty",
	            open: "tt-open",
	            cursor: "tt-cursor",
	            highlight: "tt-highlight"
	        };
	        return build;
	        function build(o) {
	            var www, classes;
	            classes = _.mixin({}, defaultClassNames, o);
	            www = {
	                css: buildCss(),
	                classes: classes,
	                html: buildHtml(classes),
	                selectors: buildSelectors(classes)
	            };
	            return {
	                css: www.css,
	                html: www.html,
	                classes: www.classes,
	                selectors: www.selectors,
	                mixin: function(o) {
	                    _.mixin(o, www);
	                }
	            };
	        }
	        function buildHtml(c) {
	            return {
	                wrapper: '<span class="' + c.wrapper + '"></span>',
	                menu: '<div class="' + c.menu + '"></div>'
	            };
	        }
	        function buildSelectors(classes) {
	            var selectors = {};
	            _.each(classes, function(v, k) {
	                selectors[k] = "." + v;
	            });
	            return selectors;
	        }
	        function buildCss() {
	            var css = {
	                wrapper: {
	                    position: "relative",
	                    display: "inline-block"
	                },
	                hint: {
	                    position: "absolute",
	                    top: "0",
	                    left: "0",
	                    borderColor: "transparent",
	                    boxShadow: "none",
	                    opacity: "1"
	                },
	                input: {
	                    position: "relative",
	                    verticalAlign: "top",
	                    backgroundColor: "transparent"
	                },
	                inputWithNoHint: {
	                    position: "relative",
	                    verticalAlign: "top"
	                },
	                menu: {
	                    position: "absolute",
	                    top: "100%",
	                    left: "0",
	                    zIndex: "100",
	                    display: "none"
	                },
	                ltr: {
	                    left: "0",
	                    right: "auto"
	                },
	                rtl: {
	                    left: "auto",
	                    right: " 0"
	                }
	            };
	            if (_.isMsie()) {
	                _.mixin(css.input, {
	                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
	                });
	            }
	            return css;
	        }
	    }();
	    var EventBus = function() {
	        "use strict";
	        var namespace, deprecationMap;
	        namespace = "typeahead:";
	        deprecationMap = {
	            render: "rendered",
	            cursorchange: "cursorchanged",
	            select: "selected",
	            autocomplete: "autocompleted"
	        };
	        function EventBus(o) {
	            if (!o || !o.el) {
	                $.error("EventBus initialized without el");
	            }
	            this.$el = $(o.el);
	        }
	        _.mixin(EventBus.prototype, {
	            _trigger: function(type, args) {
	                var $e;
	                $e = $.Event(namespace + type);
	                (args = args || []).unshift($e);
	                this.$el.trigger.apply(this.$el, args);
	                return $e;
	            },
	            before: function(type) {
	                var args, $e;
	                args = [].slice.call(arguments, 1);
	                $e = this._trigger("before" + type, args);
	                return $e.isDefaultPrevented();
	            },
	            trigger: function(type) {
	                var deprecatedType;
	                this._trigger(type, [].slice.call(arguments, 1));
	                if (deprecatedType = deprecationMap[type]) {
	                    this._trigger(deprecatedType, [].slice.call(arguments, 1));
	                }
	            }
	        });
	        return EventBus;
	    }();
	    var EventEmitter = function() {
	        "use strict";
	        var splitter = /\s+/, nextTick = getNextTick();
	        return {
	            onSync: onSync,
	            onAsync: onAsync,
	            off: off,
	            trigger: trigger
	        };
	        function on(method, types, cb, context) {
	            var type;
	            if (!cb) {
	                return this;
	            }
	            types = types.split(splitter);
	            cb = context ? bindContext(cb, context) : cb;
	            this._callbacks = this._callbacks || {};
	            while (type = types.shift()) {
	                this._callbacks[type] = this._callbacks[type] || {
	                    sync: [],
	                    async: []
	                };
	                this._callbacks[type][method].push(cb);
	            }
	            return this;
	        }
	        function onAsync(types, cb, context) {
	            return on.call(this, "async", types, cb, context);
	        }
	        function onSync(types, cb, context) {
	            return on.call(this, "sync", types, cb, context);
	        }
	        function off(types) {
	            var type;
	            if (!this._callbacks) {
	                return this;
	            }
	            types = types.split(splitter);
	            while (type = types.shift()) {
	                delete this._callbacks[type];
	            }
	            return this;
	        }
	        function trigger(types) {
	            var type, callbacks, args, syncFlush, asyncFlush;
	            if (!this._callbacks) {
	                return this;
	            }
	            types = types.split(splitter);
	            args = [].slice.call(arguments, 1);
	            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
	                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
	                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
	                syncFlush() && nextTick(asyncFlush);
	            }
	            return this;
	        }
	        function getFlush(callbacks, context, args) {
	            return flush;
	            function flush() {
	                var cancelled;
	                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
	                    cancelled = callbacks[i].apply(context, args) === false;
	                }
	                return !cancelled;
	            }
	        }
	        function getNextTick() {
	            var nextTickFn;
	            if (window.setImmediate) {
	                nextTickFn = function nextTickSetImmediate(fn) {
	                    setImmediate(function() {
	                        fn();
	                    });
	                };
	            } else {
	                nextTickFn = function nextTickSetTimeout(fn) {
	                    setTimeout(function() {
	                        fn();
	                    }, 0);
	                };
	            }
	            return nextTickFn;
	        }
	        function bindContext(fn, context) {
	            return fn.bind ? fn.bind(context) : function() {
	                fn.apply(context, [].slice.call(arguments, 0));
	            };
	        }
	    }();
	    var highlight = function(doc) {
	        "use strict";
	        var defaults = {
	            node: null,
	            pattern: null,
	            tagName: "strong",
	            className: null,
	            wordsOnly: false,
	            caseSensitive: false
	        };
	        return function hightlight(o) {
	            var regex;
	            o = _.mixin({}, defaults, o);
	            if (!o.node || !o.pattern) {
	                return;
	            }
	            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
	            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
	            traverse(o.node, hightlightTextNode);
	            function hightlightTextNode(textNode) {
	                var match, patternNode, wrapperNode;
	                if (match = regex.exec(textNode.data)) {
	                    wrapperNode = doc.createElement(o.tagName);
	                    o.className && (wrapperNode.className = o.className);
	                    patternNode = textNode.splitText(match.index);
	                    patternNode.splitText(match[0].length);
	                    wrapperNode.appendChild(patternNode.cloneNode(true));
	                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
	                }
	                return !!match;
	            }
	            function traverse(el, hightlightTextNode) {
	                var childNode, TEXT_NODE_TYPE = 3;
	                for (var i = 0; i < el.childNodes.length; i++) {
	                    childNode = el.childNodes[i];
	                    if (childNode.nodeType === TEXT_NODE_TYPE) {
	                        i += hightlightTextNode(childNode) ? 1 : 0;
	                    } else {
	                        traverse(childNode, hightlightTextNode);
	                    }
	                }
	            }
	        };
	        function getRegex(patterns, caseSensitive, wordsOnly) {
	            var escapedPatterns = [], regexStr;
	            for (var i = 0, len = patterns.length; i < len; i++) {
	                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
	            }
	            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
	            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
	        }
	    }(window.document);
	    var Input = function() {
	        "use strict";
	        var specialKeyCodeMap;
	        specialKeyCodeMap = {
	            9: "tab",
	            27: "esc",
	            37: "left",
	            39: "right",
	            13: "enter",
	            38: "up",
	            40: "down"
	        };
	        function Input(o, www) {
	            o = o || {};
	            if (!o.input) {
	                $.error("input is missing");
	            }
	            www.mixin(this);
	            this.$hint = $(o.hint);
	            this.$input = $(o.input);
	            this.query = this.$input.val();
	            this.queryWhenFocused = this.hasFocus() ? this.query : null;
	            this.$overflowHelper = buildOverflowHelper(this.$input);
	            this._checkLanguageDirection();
	            if (this.$hint.length === 0) {
	                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
	            }
	        }
	        Input.normalizeQuery = function(str) {
	            return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
	        };
	        _.mixin(Input.prototype, EventEmitter, {
	            _onBlur: function onBlur() {
	                this.resetInputValue();
	                this.trigger("blurred");
	            },
	            _onFocus: function onFocus() {
	                this.queryWhenFocused = this.query;
	                this.trigger("focused");
	            },
	            _onKeydown: function onKeydown($e) {
	                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
	                this._managePreventDefault(keyName, $e);
	                if (keyName && this._shouldTrigger(keyName, $e)) {
	                    this.trigger(keyName + "Keyed", $e);
	                }
	            },
	            _onInput: function onInput() {
	                this._setQuery(this.getInputValue());
	                this.clearHintIfInvalid();
	                this._checkLanguageDirection();
	            },
	            _managePreventDefault: function managePreventDefault(keyName, $e) {
	                var preventDefault;
	                switch (keyName) {
	                  case "up":
	                  case "down":
	                    preventDefault = !withModifier($e);
	                    break;

	                  default:
	                    preventDefault = false;
	                }
	                preventDefault && $e.preventDefault();
	            },
	            _shouldTrigger: function shouldTrigger(keyName, $e) {
	                var trigger;
	                switch (keyName) {
	                  case "tab":
	                    trigger = !withModifier($e);
	                    break;

	                  default:
	                    trigger = true;
	                }
	                return trigger;
	            },
	            _checkLanguageDirection: function checkLanguageDirection() {
	                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
	                if (this.dir !== dir) {
	                    this.dir = dir;
	                    this.$hint.attr("dir", dir);
	                    this.trigger("langDirChanged", dir);
	                }
	            },
	            _setQuery: function setQuery(val, silent) {
	                var areEquivalent, hasDifferentWhitespace;
	                areEquivalent = areQueriesEquivalent(val, this.query);
	                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
	                this.query = val;
	                if (!silent && !areEquivalent) {
	                    this.trigger("queryChanged", this.query);
	                } else if (!silent && hasDifferentWhitespace) {
	                    this.trigger("whitespaceChanged", this.query);
	                }
	            },
	            bind: function() {
	                var that = this, onBlur, onFocus, onKeydown, onInput;
	                onBlur = _.bind(this._onBlur, this);
	                onFocus = _.bind(this._onFocus, this);
	                onKeydown = _.bind(this._onKeydown, this);
	                onInput = _.bind(this._onInput, this);
	                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
	                if (!_.isMsie() || _.isMsie() > 9) {
	                    this.$input.on("input.tt", onInput);
	                } else {
	                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
	                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
	                            return;
	                        }
	                        _.defer(_.bind(that._onInput, that, $e));
	                    });
	                }
	                return this;
	            },
	            focus: function focus() {
	                this.$input.focus();
	            },
	            blur: function blur() {
	                this.$input.blur();
	            },
	            getLangDir: function getLangDir() {
	                return this.dir;
	            },
	            getQuery: function getQuery() {
	                return this.query || "";
	            },
	            setQuery: function setQuery(val, silent) {
	                this.setInputValue(val);
	                this._setQuery(val, silent);
	            },
	            hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
	                return this.query !== this.queryWhenFocused;
	            },
	            getInputValue: function getInputValue() {
	                return this.$input.val();
	            },
	            setInputValue: function setInputValue(value) {
	                this.$input.val(value);
	                this.clearHintIfInvalid();
	                this._checkLanguageDirection();
	            },
	            resetInputValue: function resetInputValue() {
	                this.setInputValue(this.query);
	            },
	            getHint: function getHint() {
	                return this.$hint.val();
	            },
	            setHint: function setHint(value) {
	                this.$hint.val(value);
	            },
	            clearHint: function clearHint() {
	                this.setHint("");
	            },
	            clearHintIfInvalid: function clearHintIfInvalid() {
	                var val, hint, valIsPrefixOfHint, isValid;
	                val = this.getInputValue();
	                hint = this.getHint();
	                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
	                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
	                !isValid && this.clearHint();
	            },
	            hasFocus: function hasFocus() {
	                return this.$input.is(":focus");
	            },
	            hasOverflow: function hasOverflow() {
	                var constraint = this.$input.width() - 2;
	                this.$overflowHelper.text(this.getInputValue());
	                return this.$overflowHelper.width() >= constraint;
	            },
	            isCursorAtEnd: function() {
	                var valueLength, selectionStart, range;
	                valueLength = this.$input.val().length;
	                selectionStart = this.$input[0].selectionStart;
	                if (_.isNumber(selectionStart)) {
	                    return selectionStart === valueLength;
	                } else if (document.selection) {
	                    range = document.selection.createRange();
	                    range.moveStart("character", -valueLength);
	                    return valueLength === range.text.length;
	                }
	                return true;
	            },
	            destroy: function destroy() {
	                this.$hint.off(".tt");
	                this.$input.off(".tt");
	                this.$overflowHelper.remove();
	                this.$hint = this.$input = this.$overflowHelper = $("<div>");
	            }
	        });
	        return Input;
	        function buildOverflowHelper($input) {
	            return $('<pre aria-hidden="true"></pre>').css({
	                position: "absolute",
	                visibility: "hidden",
	                whiteSpace: "pre",
	                fontFamily: $input.css("font-family"),
	                fontSize: $input.css("font-size"),
	                fontStyle: $input.css("font-style"),
	                fontVariant: $input.css("font-variant"),
	                fontWeight: $input.css("font-weight"),
	                wordSpacing: $input.css("word-spacing"),
	                letterSpacing: $input.css("letter-spacing"),
	                textIndent: $input.css("text-indent"),
	                textRendering: $input.css("text-rendering"),
	                textTransform: $input.css("text-transform")
	            }).insertAfter($input);
	        }
	        function areQueriesEquivalent(a, b) {
	            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
	        }
	        function withModifier($e) {
	            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
	        }
	    }();
	    var Dataset = function() {
	        "use strict";
	        var keys, nameGenerator;
	        keys = {
	            val: "tt-selectable-display",
	            obj: "tt-selectable-object"
	        };
	        nameGenerator = _.getIdGenerator();
	        function Dataset(o, www) {
	            o = o || {};
	            o.templates = o.templates || {};
	            o.templates.notFound = o.templates.notFound || o.templates.empty;
	            if (!o.source) {
	                $.error("missing source");
	            }
	            if (!o.node) {
	                $.error("missing node");
	            }
	            if (o.name && !isValidName(o.name)) {
	                $.error("invalid dataset name: " + o.name);
	            }
	            www.mixin(this);
	            this.highlight = !!o.highlight;
	            this.name = o.name || nameGenerator();
	            this.limit = o.limit || 5;
	            this.displayFn = getDisplayFn(o.display || o.displayKey);
	            this.templates = getTemplates(o.templates, this.displayFn);
	            this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
	            this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
	            this._resetLastSuggestion();
	            this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
	        }
	        Dataset.extractData = function extractData(el) {
	            var $el = $(el);
	            if ($el.data(keys.obj)) {
	                return {
	                    val: $el.data(keys.val) || "",
	                    obj: $el.data(keys.obj) || null
	                };
	            }
	            return null;
	        };
	        _.mixin(Dataset.prototype, EventEmitter, {
	            _overwrite: function overwrite(query, suggestions) {
	                suggestions = suggestions || [];
	                if (suggestions.length) {
	                    this._renderSuggestions(query, suggestions);
	                } else if (this.async && this.templates.pending) {
	                    this._renderPending(query);
	                } else if (!this.async && this.templates.notFound) {
	                    this._renderNotFound(query);
	                } else {
	                    this._empty();
	                }
	                this.trigger("rendered", this.name, suggestions, false);
	            },
	            _append: function append(query, suggestions) {
	                suggestions = suggestions || [];
	                if (suggestions.length && this.$lastSuggestion.length) {
	                    this._appendSuggestions(query, suggestions);
	                } else if (suggestions.length) {
	                    this._renderSuggestions(query, suggestions);
	                } else if (!this.$lastSuggestion.length && this.templates.notFound) {
	                    this._renderNotFound(query);
	                }
	                this.trigger("rendered", this.name, suggestions, true);
	            },
	            _renderSuggestions: function renderSuggestions(query, suggestions) {
	                var $fragment;
	                $fragment = this._getSuggestionsFragment(query, suggestions);
	                this.$lastSuggestion = $fragment.children().last();
	                this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
	            },
	            _appendSuggestions: function appendSuggestions(query, suggestions) {
	                var $fragment, $lastSuggestion;
	                $fragment = this._getSuggestionsFragment(query, suggestions);
	                $lastSuggestion = $fragment.children().last();
	                this.$lastSuggestion.after($fragment);
	                this.$lastSuggestion = $lastSuggestion;
	            },
	            _renderPending: function renderPending(query) {
	                var template = this.templates.pending;
	                this._resetLastSuggestion();
	                template && this.$el.html(template({
	                    query: query,
	                    dataset: this.name
	                }));
	            },
	            _renderNotFound: function renderNotFound(query) {
	                var template = this.templates.notFound;
	                this._resetLastSuggestion();
	                template && this.$el.html(template({
	                    query: query,
	                    dataset: this.name
	                }));
	            },
	            _empty: function empty() {
	                this.$el.empty();
	                this._resetLastSuggestion();
	            },
	            _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
	                var that = this, fragment;
	                fragment = document.createDocumentFragment();
	                _.each(suggestions, function getSuggestionNode(suggestion) {
	                    var $el, context;
	                    context = that._injectQuery(query, suggestion);
	                    $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
	                    fragment.appendChild($el[0]);
	                });
	                this.highlight && highlight({
	                    className: this.classes.highlight,
	                    node: fragment,
	                    pattern: query
	                });
	                return $(fragment);
	            },
	            _getFooter: function getFooter(query, suggestions) {
	                return this.templates.footer ? this.templates.footer({
	                    query: query,
	                    suggestions: suggestions,
	                    dataset: this.name
	                }) : null;
	            },
	            _getHeader: function getHeader(query, suggestions) {
	                return this.templates.header ? this.templates.header({
	                    query: query,
	                    suggestions: suggestions,
	                    dataset: this.name
	                }) : null;
	            },
	            _resetLastSuggestion: function resetLastSuggestion() {
	                this.$lastSuggestion = $();
	            },
	            _injectQuery: function injectQuery(query, obj) {
	                return _.isObject(obj) ? _.mixin({
	                    _query: query
	                }, obj) : obj;
	            },
	            update: function update(query) {
	                var that = this, canceled = false, syncCalled = false, rendered = 0;
	                this.cancel();
	                this.cancel = function cancel() {
	                    canceled = true;
	                    that.cancel = $.noop;
	                    that.async && that.trigger("asyncCanceled", query);
	                };
	                this.source(query, sync, async);
	                !syncCalled && sync([]);
	                function sync(suggestions) {
	                    if (syncCalled) {
	                        return;
	                    }
	                    syncCalled = true;
	                    suggestions = (suggestions || []).slice(0, that.limit);
	                    rendered = suggestions.length;
	                    that._overwrite(query, suggestions);
	                    if (rendered < that.limit && that.async) {
	                        that.trigger("asyncRequested", query);
	                    }
	                }
	                function async(suggestions) {
	                    suggestions = suggestions || [];
	                    if (!canceled && rendered < that.limit) {
	                        that.cancel = $.noop;
	                        rendered += suggestions.length;
	                        that._append(query, suggestions.slice(0, that.limit - rendered));
	                        that.async && that.trigger("asyncReceived", query);
	                    }
	                }
	            },
	            cancel: $.noop,
	            clear: function clear() {
	                this._empty();
	                this.cancel();
	                this.trigger("cleared");
	            },
	            isEmpty: function isEmpty() {
	                return this.$el.is(":empty");
	            },
	            destroy: function destroy() {
	                this.$el = $("<div>");
	            }
	        });
	        return Dataset;
	        function getDisplayFn(display) {
	            display = display || _.stringify;
	            return _.isFunction(display) ? display : displayFn;
	            function displayFn(obj) {
	                return obj[display];
	            }
	        }
	        function getTemplates(templates, displayFn) {
	            return {
	                notFound: templates.notFound && _.templatify(templates.notFound),
	                pending: templates.pending && _.templatify(templates.pending),
	                header: templates.header && _.templatify(templates.header),
	                footer: templates.footer && _.templatify(templates.footer),
	                suggestion: templates.suggestion || suggestionTemplate
	            };
	            function suggestionTemplate(context) {
	                return $("<div>").text(displayFn(context));
	            }
	        }
	        function isValidName(str) {
	            return /^[_a-zA-Z0-9-]+$/.test(str);
	        }
	    }();
	    var Menu = function() {
	        "use strict";
	        function Menu(o, www) {
	            var that = this;
	            o = o || {};
	            if (!o.node) {
	                $.error("node is required");
	            }
	            www.mixin(this);
	            this.$node = $(o.node);
	            this.query = null;
	            this.datasets = _.map(o.datasets, initializeDataset);
	            function initializeDataset(oDataset) {
	                var node = that.$node.find(oDataset.node).first();
	                oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
	                return new Dataset(oDataset, www);
	            }
	        }
	        _.mixin(Menu.prototype, EventEmitter, {
	            _onSelectableClick: function onSelectableClick($e) {
	                this.trigger("selectableClicked", $($e.currentTarget));
	            },
	            _onRendered: function onRendered(type, dataset, suggestions, async) {
	                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
	                this.trigger("datasetRendered", dataset, suggestions, async);
	            },
	            _onCleared: function onCleared() {
	                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
	                this.trigger("datasetCleared");
	            },
	            _propagate: function propagate() {
	                this.trigger.apply(this, arguments);
	            },
	            _allDatasetsEmpty: function allDatasetsEmpty() {
	                return _.every(this.datasets, isDatasetEmpty);
	                function isDatasetEmpty(dataset) {
	                    return dataset.isEmpty();
	                }
	            },
	            _getSelectables: function getSelectables() {
	                return this.$node.find(this.selectors.selectable);
	            },
	            _removeCursor: function _removeCursor() {
	                var $selectable = this.getActiveSelectable();
	                $selectable && $selectable.removeClass(this.classes.cursor);
	            },
	            _ensureVisible: function ensureVisible($el) {
	                var elTop, elBottom, nodeScrollTop, nodeHeight;
	                elTop = $el.position().top;
	                elBottom = elTop + $el.outerHeight(true);
	                nodeScrollTop = this.$node.scrollTop();
	                nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
	                if (elTop < 0) {
	                    this.$node.scrollTop(nodeScrollTop + elTop);
	                } else if (nodeHeight < elBottom) {
	                    this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
	                }
	            },
	            bind: function() {
	                var that = this, onSelectableClick;
	                onSelectableClick = _.bind(this._onSelectableClick, this);
	                this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
	                _.each(this.datasets, function(dataset) {
	                    dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
	                });
	                return this;
	            },
	            isOpen: function isOpen() {
	                return this.$node.hasClass(this.classes.open);
	            },
	            open: function open() {
	                this.$node.addClass(this.classes.open);
	            },
	            close: function close() {
	                this.$node.removeClass(this.classes.open);
	                this._removeCursor();
	            },
	            setLanguageDirection: function setLanguageDirection(dir) {
	                this.$node.attr("dir", dir);
	            },
	            selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
	                var $selectables, $oldCursor, oldIndex, newIndex;
	                $oldCursor = this.getActiveSelectable();
	                $selectables = this._getSelectables();
	                oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
	                newIndex = oldIndex + delta;
	                newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
	                newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
	                return newIndex === -1 ? null : $selectables.eq(newIndex);
	            },
	            setCursor: function setCursor($selectable) {
	                this._removeCursor();
	                if ($selectable = $selectable && $selectable.first()) {
	                    $selectable.addClass(this.classes.cursor);
	                    this._ensureVisible($selectable);
	                }
	            },
	            getSelectableData: function getSelectableData($el) {
	                return $el && $el.length ? Dataset.extractData($el) : null;
	            },
	            getActiveSelectable: function getActiveSelectable() {
	                var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
	                return $selectable.length ? $selectable : null;
	            },
	            getTopSelectable: function getTopSelectable() {
	                var $selectable = this._getSelectables().first();
	                return $selectable.length ? $selectable : null;
	            },
	            update: function update(query) {
	                var isValidUpdate = query !== this.query;
	                if (isValidUpdate) {
	                    this.query = query;
	                    _.each(this.datasets, updateDataset);
	                }
	                return isValidUpdate;
	                function updateDataset(dataset) {
	                    dataset.update(query);
	                }
	            },
	            empty: function empty() {
	                _.each(this.datasets, clearDataset);
	                this.query = null;
	                this.$node.addClass(this.classes.empty);
	                function clearDataset(dataset) {
	                    dataset.clear();
	                }
	            },
	            destroy: function destroy() {
	                this.$node.off(".tt");
	                this.$node = $("<div>");
	                _.each(this.datasets, destroyDataset);
	                function destroyDataset(dataset) {
	                    dataset.destroy();
	                }
	            }
	        });
	        return Menu;
	    }();
	    var DefaultMenu = function() {
	        "use strict";
	        var s = Menu.prototype;
	        function DefaultMenu() {
	            Menu.apply(this, [].slice.call(arguments, 0));
	        }
	        _.mixin(DefaultMenu.prototype, Menu.prototype, {
	            open: function open() {
	                !this._allDatasetsEmpty() && this._show();
	                return s.open.apply(this, [].slice.call(arguments, 0));
	            },
	            close: function close() {
	                this._hide();
	                return s.close.apply(this, [].slice.call(arguments, 0));
	            },
	            _onRendered: function onRendered() {
	                if (this._allDatasetsEmpty()) {
	                    this._hide();
	                } else {
	                    this.isOpen() && this._show();
	                }
	                return s._onRendered.apply(this, [].slice.call(arguments, 0));
	            },
	            _onCleared: function onCleared() {
	                if (this._allDatasetsEmpty()) {
	                    this._hide();
	                } else {
	                    this.isOpen() && this._show();
	                }
	                return s._onCleared.apply(this, [].slice.call(arguments, 0));
	            },
	            setLanguageDirection: function setLanguageDirection(dir) {
	                this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
	                return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
	            },
	            _hide: function hide() {
	                this.$node.hide();
	            },
	            _show: function show() {
	                this.$node.css("display", "block");
	            }
	        });
	        return DefaultMenu;
	    }();
	    var Typeahead = function() {
	        "use strict";
	        function Typeahead(o, www) {
	            var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
	            o = o || {};
	            if (!o.input) {
	                $.error("missing input");
	            }
	            if (!o.menu) {
	                $.error("missing menu");
	            }
	            if (!o.eventBus) {
	                $.error("missing event bus");
	            }
	            www.mixin(this);
	            this.eventBus = o.eventBus;
	            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
	            this.input = o.input;
	            this.menu = o.menu;
	            this.enabled = true;
	            this.active = false;
	            this.input.hasFocus() && this.activate();
	            this.dir = this.input.getLangDir();
	            this._hacks();
	            this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
	            onFocused = c(this, "activate", "open", "_onFocused");
	            onBlurred = c(this, "deactivate", "_onBlurred");
	            onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
	            onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
	            onEscKeyed = c(this, "isActive", "_onEscKeyed");
	            onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
	            onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
	            onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
	            onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
	            onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
	            onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
	            this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
	        }
	        _.mixin(Typeahead.prototype, {
	            _hacks: function hacks() {
	                var $input, $menu;
	                $input = this.input.$input || $("<div>");
	                $menu = this.menu.$node || $("<div>");
	                $input.on("blur.tt", function($e) {
	                    var active, isActive, hasActive;
	                    active = document.activeElement;
	                    isActive = $menu.is(active);
	                    hasActive = $menu.has(active).length > 0;
	                    if (_.isMsie() && (isActive || hasActive)) {
	                        $e.preventDefault();
	                        $e.stopImmediatePropagation();
	                        _.defer(function() {
	                            $input.focus();
	                        });
	                    }
	                });
	                $menu.on("mousedown.tt", function($e) {
	                    $e.preventDefault();
	                });
	            },
	            _onSelectableClicked: function onSelectableClicked(type, $el) {
	                this.select($el);
	            },
	            _onDatasetCleared: function onDatasetCleared() {
	                this._updateHint();
	            },
	            _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
	                this._updateHint();
	                this.eventBus.trigger("render", suggestions, async, dataset);
	            },
	            _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
	                this.eventBus.trigger("asyncrequest", query, dataset);
	            },
	            _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
	                this.eventBus.trigger("asynccancel", query, dataset);
	            },
	            _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
	                this.eventBus.trigger("asyncreceive", query, dataset);
	            },
	            _onFocused: function onFocused() {
	                this._minLengthMet() && this.menu.update(this.input.getQuery());
	            },
	            _onBlurred: function onBlurred() {
	                if (this.input.hasQueryChangedSinceLastFocus()) {
	                    this.eventBus.trigger("change", this.input.getQuery());
	                }
	            },
	            _onEnterKeyed: function onEnterKeyed(type, $e) {
	                var $selectable;
	                if ($selectable = this.menu.getActiveSelectable()) {
	                    this.select($selectable) && $e.preventDefault();
	                }
	            },
	            _onTabKeyed: function onTabKeyed(type, $e) {
	                var $selectable;
	                if ($selectable = this.menu.getActiveSelectable()) {
	                    this.select($selectable) && $e.preventDefault();
	                } else if ($selectable = this.menu.getTopSelectable()) {
	                    this.autocomplete($selectable) && $e.preventDefault();
	                }
	            },
	            _onEscKeyed: function onEscKeyed() {
	                this.close();
	            },
	            _onUpKeyed: function onUpKeyed() {
	                this.moveCursor(-1);
	            },
	            _onDownKeyed: function onDownKeyed() {
	                this.moveCursor(+1);
	            },
	            _onLeftKeyed: function onLeftKeyed() {
	                if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
	                    this.autocomplete(this.menu.getTopSelectable());
	                }
	            },
	            _onRightKeyed: function onRightKeyed() {
	                if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
	                    this.autocomplete(this.menu.getTopSelectable());
	                }
	            },
	            _onQueryChanged: function onQueryChanged(e, query) {
	                this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
	            },
	            _onWhitespaceChanged: function onWhitespaceChanged() {
	                this._updateHint();
	            },
	            _onLangDirChanged: function onLangDirChanged(e, dir) {
	                if (this.dir !== dir) {
	                    this.dir = dir;
	                    this.menu.setLanguageDirection(dir);
	                }
	            },
	            _openIfActive: function openIfActive() {
	                this.isActive() && this.open();
	            },
	            _minLengthMet: function minLengthMet(query) {
	                query = _.isString(query) ? query : this.input.getQuery() || "";
	                return query.length >= this.minLength;
	            },
	            _updateHint: function updateHint() {
	                var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
	                $selectable = this.menu.getTopSelectable();
	                data = this.menu.getSelectableData($selectable);
	                val = this.input.getInputValue();
	                if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
	                    query = Input.normalizeQuery(val);
	                    escapedQuery = _.escapeRegExChars(query);
	                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
	                    match = frontMatchRegEx.exec(data.val);
	                    match && this.input.setHint(val + match[1]);
	                } else {
	                    this.input.clearHint();
	                }
	            },
	            isEnabled: function isEnabled() {
	                return this.enabled;
	            },
	            enable: function enable() {
	                this.enabled = true;
	            },
	            disable: function disable() {
	                this.enabled = false;
	            },
	            isActive: function isActive() {
	                return this.active;
	            },
	            activate: function activate() {
	                if (this.isActive()) {
	                    return true;
	                } else if (!this.isEnabled() || this.eventBus.before("active")) {
	                    return false;
	                } else {
	                    this.active = true;
	                    this.eventBus.trigger("active");
	                    return true;
	                }
	            },
	            deactivate: function deactivate() {
	                if (!this.isActive()) {
	                    return true;
	                } else if (this.eventBus.before("idle")) {
	                    return false;
	                } else {
	                    this.active = false;
	                    this.close();
	                    this.eventBus.trigger("idle");
	                    return true;
	                }
	            },
	            isOpen: function isOpen() {
	                return this.menu.isOpen();
	            },
	            open: function open() {
	                if (!this.isOpen() && !this.eventBus.before("open")) {
	                    this.menu.open();
	                    this._updateHint();
	                    this.eventBus.trigger("open");
	                }
	                return this.isOpen();
	            },
	            close: function close() {
	                if (this.isOpen() && !this.eventBus.before("close")) {
	                    this.menu.close();
	                    this.input.clearHint();
	                    this.input.resetInputValue();
	                    this.eventBus.trigger("close");
	                }
	                return !this.isOpen();
	            },
	            setVal: function setVal(val) {
	                this.input.setQuery(_.toStr(val));
	            },
	            getVal: function getVal() {
	                return this.input.getQuery();
	            },
	            select: function select($selectable) {
	                var data = this.menu.getSelectableData($selectable);
	                if (data && !this.eventBus.before("select", data.obj)) {
	                    this.input.setQuery(data.val, true);
	                    this.eventBus.trigger("select", data.obj);
	                    this.close();
	                    return true;
	                }
	                return false;
	            },
	            autocomplete: function autocomplete($selectable) {
	                var query, data, isValid;
	                query = this.input.getQuery();
	                data = this.menu.getSelectableData($selectable);
	                isValid = data && query !== data.val;
	                if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
	                    this.input.setQuery(data.val);
	                    this.eventBus.trigger("autocomplete", data.obj);
	                    return true;
	                }
	                return false;
	            },
	            moveCursor: function moveCursor(delta) {
	                var query, $candidate, data, payload, cancelMove;
	                query = this.input.getQuery();
	                $candidate = this.menu.selectableRelativeToCursor(delta);
	                data = this.menu.getSelectableData($candidate);
	                payload = data ? data.obj : null;
	                cancelMove = this._minLengthMet() && this.menu.update(query);
	                if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
	                    this.menu.setCursor($candidate);
	                    if (data) {
	                        this.input.setInputValue(data.val);
	                    } else {
	                        this.input.resetInputValue();
	                        this._updateHint();
	                    }
	                    this.eventBus.trigger("cursorchange", payload);
	                    return true;
	                }
	                return false;
	            },
	            destroy: function destroy() {
	                this.input.destroy();
	                this.menu.destroy();
	            }
	        });
	        return Typeahead;
	        function c(ctx) {
	            var methods = [].slice.call(arguments, 1);
	            return function() {
	                var args = [].slice.call(arguments);
	                _.each(methods, function(method) {
	                    return ctx[method].apply(ctx, args);
	                });
	            };
	        }
	    }();
	    (function() {
	        "use strict";
	        var old, keys, methods;
	        old = $.fn.typeahead;
	        keys = {
	            www: "tt-www",
	            attrs: "tt-attrs",
	            typeahead: "tt-typeahead"
	        };
	        methods = {
	            initialize: function initialize(o, datasets) {
	                var www;
	                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
	                o = o || {};
	                www = WWW(o.classNames);
	                return this.each(attach);
	                function attach() {
	                    var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
	                    _.each(datasets, function(d) {
	                        d.highlight = !!o.highlight;
	                    });
	                    $input = $(this);
	                    $wrapper = $(www.html.wrapper);
	                    $hint = $elOrNull(o.hint);
	                    $menu = $elOrNull(o.menu);
	                    defaultHint = o.hint !== false && !$hint;
	                    defaultMenu = o.menu !== false && !$menu;
	                    defaultHint && ($hint = buildHintFromInput($input, www));
	                    defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
	                    $hint && $hint.val("");
	                    $input = prepInput($input, www);
	                    if (defaultHint || defaultMenu) {
	                        $wrapper.css(www.css.wrapper);
	                        $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
	                        $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
	                    }
	                    MenuConstructor = defaultMenu ? DefaultMenu : Menu;
	                    eventBus = new EventBus({
	                        el: $input
	                    });
	                    input = new Input({
	                        hint: $hint,
	                        input: $input
	                    }, www);
	                    menu = new MenuConstructor({
	                        node: $menu,
	                        datasets: datasets
	                    }, www);
	                    typeahead = new Typeahead({
	                        input: input,
	                        menu: menu,
	                        eventBus: eventBus,
	                        minLength: o.minLength
	                    }, www);
	                    $input.data(keys.www, www);
	                    $input.data(keys.typeahead, typeahead);
	                }
	            },
	            isEnabled: function isEnabled() {
	                var enabled;
	                ttEach(this.first(), function(t) {
	                    enabled = t.isEnabled();
	                });
	                return enabled;
	            },
	            enable: function enable() {
	                ttEach(this, function(t) {
	                    t.enable();
	                });
	                return this;
	            },
	            disable: function disable() {
	                ttEach(this, function(t) {
	                    t.disable();
	                });
	                return this;
	            },
	            isActive: function isActive() {
	                var active;
	                ttEach(this.first(), function(t) {
	                    active = t.isActive();
	                });
	                return active;
	            },
	            activate: function activate() {
	                ttEach(this, function(t) {
	                    t.activate();
	                });
	                return this;
	            },
	            deactivate: function deactivate() {
	                ttEach(this, function(t) {
	                    t.deactivate();
	                });
	                return this;
	            },
	            isOpen: function isOpen() {
	                var open;
	                ttEach(this.first(), function(t) {
	                    open = t.isOpen();
	                });
	                return open;
	            },
	            open: function open() {
	                ttEach(this, function(t) {
	                    t.open();
	                });
	                return this;
	            },
	            close: function close() {
	                ttEach(this, function(t) {
	                    t.close();
	                });
	                return this;
	            },
	            select: function select(el) {
	                var success = false, $el = $(el);
	                ttEach(this.first(), function(t) {
	                    success = t.select($el);
	                });
	                return success;
	            },
	            autocomplete: function autocomplete(el) {
	                var success = false, $el = $(el);
	                ttEach(this.first(), function(t) {
	                    success = t.autocomplete($el);
	                });
	                return success;
	            },
	            moveCursor: function moveCursoe(delta) {
	                var success = false;
	                ttEach(this.first(), function(t) {
	                    success = t.moveCursor(delta);
	                });
	                return success;
	            },
	            val: function val(newVal) {
	                var query;
	                if (!arguments.length) {
	                    ttEach(this.first(), function(t) {
	                        query = t.getVal();
	                    });
	                    return query;
	                } else {
	                    ttEach(this, function(t) {
	                        t.setVal(newVal);
	                    });
	                    return this;
	                }
	            },
	            destroy: function destroy() {
	                ttEach(this, function(typeahead, $input) {
	                    revert($input);
	                    typeahead.destroy();
	                });
	                return this;
	            }
	        };
	        $.fn.typeahead = function(method) {
	            if (methods[method]) {
	                return methods[method].apply(this, [].slice.call(arguments, 1));
	            } else {
	                return methods.initialize.apply(this, arguments);
	            }
	        };
	        $.fn.typeahead.noConflict = function noConflict() {
	            $.fn.typeahead = old;
	            return this;
	        };
	        function ttEach($els, fn) {
	            $els.each(function() {
	                var $input = $(this), typeahead;
	                (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
	            });
	        }
	        function buildHintFromInput($input, www) {
	            return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
	                autocomplete: "off",
	                spellcheck: "false",
	                tabindex: -1
	            });
	        }
	        function prepInput($input, www) {
	            $input.data(keys.attrs, {
	                dir: $input.attr("dir"),
	                autocomplete: $input.attr("autocomplete"),
	                spellcheck: $input.attr("spellcheck"),
	                style: $input.attr("style")
	            });
	            $input.addClass(www.classes.input).attr({
	                autocomplete: "off",
	                spellcheck: false
	            });
	            try {
	                !$input.attr("dir") && $input.attr("dir", "auto");
	            } catch (e) {}
	            return $input;
	        }
	        function getBackgroundStyles($el) {
	            return {
	                backgroundAttachment: $el.css("background-attachment"),
	                backgroundClip: $el.css("background-clip"),
	                backgroundColor: $el.css("background-color"),
	                backgroundImage: $el.css("background-image"),
	                backgroundOrigin: $el.css("background-origin"),
	                backgroundPosition: $el.css("background-position"),
	                backgroundRepeat: $el.css("background-repeat"),
	                backgroundSize: $el.css("background-size")
	            };
	        }
	        function revert($input) {
	            var www, $wrapper;
	            www = $input.data(keys.www);
	            $wrapper = $input.parent().filter(www.selectors.wrapper);
	            _.each($input.data(keys.attrs), function(val, key) {
	                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
	            });
	            $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
	            if ($wrapper.length) {
	                $input.detach().insertAfter($wrapper);
	                $wrapper.remove();
	            }
	        }
	        function $elOrNull(obj) {
	            var isValid, $el;
	            isValid = _.isJQuery(obj) || _.isElement(obj);
	            $el = isValid ? $(obj).first() : [];
	            return $el.length ? $el : null;
	        }
	    })();
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).setImmediate))

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * typeahead.js 0.11.1
	 * https://github.com/twitter/typeahead.js
	 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
	 */

	(function(root, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(14) ], __WEBPACK_AMD_DEFINE_RESULT__ = function(a0) {
	            return root["Bloodhound"] = factory(a0);
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === "object") {
	        module.exports = factory(require("jquery"));
	    } else {
	        root["Bloodhound"] = factory(jQuery);
	    }
	})(this, function($) {
	    var _ = function() {
	        "use strict";
	        return {
	            isMsie: function() {
	                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
	            },
	            isBlankString: function(str) {
	                return !str || /^\s*$/.test(str);
	            },
	            escapeRegExChars: function(str) {
	                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	            },
	            isString: function(obj) {
	                return typeof obj === "string";
	            },
	            isNumber: function(obj) {
	                return typeof obj === "number";
	            },
	            isArray: $.isArray,
	            isFunction: $.isFunction,
	            isObject: $.isPlainObject,
	            isUndefined: function(obj) {
	                return typeof obj === "undefined";
	            },
	            isElement: function(obj) {
	                return !!(obj && obj.nodeType === 1);
	            },
	            isJQuery: function(obj) {
	                return obj instanceof $;
	            },
	            toStr: function toStr(s) {
	                return _.isUndefined(s) || s === null ? "" : s + "";
	            },
	            bind: $.proxy,
	            each: function(collection, cb) {
	                $.each(collection, reverseArgs);
	                function reverseArgs(index, value) {
	                    return cb(value, index);
	                }
	            },
	            map: $.map,
	            filter: $.grep,
	            every: function(obj, test) {
	                var result = true;
	                if (!obj) {
	                    return result;
	                }
	                $.each(obj, function(key, val) {
	                    if (!(result = test.call(null, val, key, obj))) {
	                        return false;
	                    }
	                });
	                return !!result;
	            },
	            some: function(obj, test) {
	                var result = false;
	                if (!obj) {
	                    return result;
	                }
	                $.each(obj, function(key, val) {
	                    if (result = test.call(null, val, key, obj)) {
	                        return false;
	                    }
	                });
	                return !!result;
	            },
	            mixin: $.extend,
	            identity: function(x) {
	                return x;
	            },
	            clone: function(obj) {
	                return $.extend(true, {}, obj);
	            },
	            getIdGenerator: function() {
	                var counter = 0;
	                return function() {
	                    return counter++;
	                };
	            },
	            templatify: function templatify(obj) {
	                return $.isFunction(obj) ? obj : template;
	                function template() {
	                    return String(obj);
	                }
	            },
	            defer: function(fn) {
	                setTimeout(fn, 0);
	            },
	            debounce: function(func, wait, immediate) {
	                var timeout, result;
	                return function() {
	                    var context = this, args = arguments, later, callNow;
	                    later = function() {
	                        timeout = null;
	                        if (!immediate) {
	                            result = func.apply(context, args);
	                        }
	                    };
	                    callNow = immediate && !timeout;
	                    clearTimeout(timeout);
	                    timeout = setTimeout(later, wait);
	                    if (callNow) {
	                        result = func.apply(context, args);
	                    }
	                    return result;
	                };
	            },
	            throttle: function(func, wait) {
	                var context, args, timeout, result, previous, later;
	                previous = 0;
	                later = function() {
	                    previous = new Date();
	                    timeout = null;
	                    result = func.apply(context, args);
	                };
	                return function() {
	                    var now = new Date(), remaining = wait - (now - previous);
	                    context = this;
	                    args = arguments;
	                    if (remaining <= 0) {
	                        clearTimeout(timeout);
	                        timeout = null;
	                        previous = now;
	                        result = func.apply(context, args);
	                    } else if (!timeout) {
	                        timeout = setTimeout(later, remaining);
	                    }
	                    return result;
	                };
	            },
	            stringify: function(val) {
	                return _.isString(val) ? val : JSON.stringify(val);
	            },
	            noop: function() {}
	        };
	    }();
	    var VERSION = "0.11.1";
	    var tokenizers = function() {
	        "use strict";
	        return {
	            nonword: nonword,
	            whitespace: whitespace,
	            obj: {
	                nonword: getObjTokenizer(nonword),
	                whitespace: getObjTokenizer(whitespace)
	            }
	        };
	        function whitespace(str) {
	            str = _.toStr(str);
	            return str ? str.split(/\s+/) : [];
	        }
	        function nonword(str) {
	            str = _.toStr(str);
	            return str ? str.split(/\W+/) : [];
	        }
	        function getObjTokenizer(tokenizer) {
	            return function setKey(keys) {
	                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
	                return function tokenize(o) {
	                    var tokens = [];
	                    _.each(keys, function(k) {
	                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
	                    });
	                    return tokens;
	                };
	            };
	        }
	    }();
	    var LruCache = function() {
	        "use strict";
	        function LruCache(maxSize) {
	            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
	            this.reset();
	            if (this.maxSize <= 0) {
	                this.set = this.get = $.noop;
	            }
	        }
	        _.mixin(LruCache.prototype, {
	            set: function set(key, val) {
	                var tailItem = this.list.tail, node;
	                if (this.size >= this.maxSize) {
	                    this.list.remove(tailItem);
	                    delete this.hash[tailItem.key];
	                    this.size--;
	                }
	                if (node = this.hash[key]) {
	                    node.val = val;
	                    this.list.moveToFront(node);
	                } else {
	                    node = new Node(key, val);
	                    this.list.add(node);
	                    this.hash[key] = node;
	                    this.size++;
	                }
	            },
	            get: function get(key) {
	                var node = this.hash[key];
	                if (node) {
	                    this.list.moveToFront(node);
	                    return node.val;
	                }
	            },
	            reset: function reset() {
	                this.size = 0;
	                this.hash = {};
	                this.list = new List();
	            }
	        });
	        function List() {
	            this.head = this.tail = null;
	        }
	        _.mixin(List.prototype, {
	            add: function add(node) {
	                if (this.head) {
	                    node.next = this.head;
	                    this.head.prev = node;
	                }
	                this.head = node;
	                this.tail = this.tail || node;
	            },
	            remove: function remove(node) {
	                node.prev ? node.prev.next = node.next : this.head = node.next;
	                node.next ? node.next.prev = node.prev : this.tail = node.prev;
	            },
	            moveToFront: function(node) {
	                this.remove(node);
	                this.add(node);
	            }
	        });
	        function Node(key, val) {
	            this.key = key;
	            this.val = val;
	            this.prev = this.next = null;
	        }
	        return LruCache;
	    }();
	    var PersistentStorage = function() {
	        "use strict";
	        var LOCAL_STORAGE;
	        try {
	            LOCAL_STORAGE = window.localStorage;
	            LOCAL_STORAGE.setItem("~~~", "!");
	            LOCAL_STORAGE.removeItem("~~~");
	        } catch (err) {
	            LOCAL_STORAGE = null;
	        }
	        function PersistentStorage(namespace, override) {
	            this.prefix = [ "__", namespace, "__" ].join("");
	            this.ttlKey = "__ttl__";
	            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
	            this.ls = override || LOCAL_STORAGE;
	            !this.ls && this._noop();
	        }
	        _.mixin(PersistentStorage.prototype, {
	            _prefix: function(key) {
	                return this.prefix + key;
	            },
	            _ttlKey: function(key) {
	                return this._prefix(key) + this.ttlKey;
	            },
	            _noop: function() {
	                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
	            },
	            _safeSet: function(key, val) {
	                try {
	                    this.ls.setItem(key, val);
	                } catch (err) {
	                    if (err.name === "QuotaExceededError") {
	                        this.clear();
	                        this._noop();
	                    }
	                }
	            },
	            get: function(key) {
	                if (this.isExpired(key)) {
	                    this.remove(key);
	                }
	                return decode(this.ls.getItem(this._prefix(key)));
	            },
	            set: function(key, val, ttl) {
	                if (_.isNumber(ttl)) {
	                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
	                } else {
	                    this.ls.removeItem(this._ttlKey(key));
	                }
	                return this._safeSet(this._prefix(key), encode(val));
	            },
	            remove: function(key) {
	                this.ls.removeItem(this._ttlKey(key));
	                this.ls.removeItem(this._prefix(key));
	                return this;
	            },
	            clear: function() {
	                var i, keys = gatherMatchingKeys(this.keyMatcher);
	                for (i = keys.length; i--; ) {
	                    this.remove(keys[i]);
	                }
	                return this;
	            },
	            isExpired: function(key) {
	                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
	                return _.isNumber(ttl) && now() > ttl ? true : false;
	            }
	        });
	        return PersistentStorage;
	        function now() {
	            return new Date().getTime();
	        }
	        function encode(val) {
	            return JSON.stringify(_.isUndefined(val) ? null : val);
	        }
	        function decode(val) {
	            return $.parseJSON(val);
	        }
	        function gatherMatchingKeys(keyMatcher) {
	            var i, key, keys = [], len = LOCAL_STORAGE.length;
	            for (i = 0; i < len; i++) {
	                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
	                    keys.push(key.replace(keyMatcher, ""));
	                }
	            }
	            return keys;
	        }
	    }();
	    var Transport = function() {
	        "use strict";
	        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
	        function Transport(o) {
	            o = o || {};
	            this.cancelled = false;
	            this.lastReq = null;
	            this._send = o.transport;
	            this._get = o.limiter ? o.limiter(this._get) : this._get;
	            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
	        }
	        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
	            maxPendingRequests = num;
	        };
	        Transport.resetCache = function resetCache() {
	            sharedCache.reset();
	        };
	        _.mixin(Transport.prototype, {
	            _fingerprint: function fingerprint(o) {
	                o = o || {};
	                return o.url + o.type + $.param(o.data || {});
	            },
	            _get: function(o, cb) {
	                var that = this, fingerprint, jqXhr;
	                fingerprint = this._fingerprint(o);
	                if (this.cancelled || fingerprint !== this.lastReq) {
	                    return;
	                }
	                if (jqXhr = pendingRequests[fingerprint]) {
	                    jqXhr.done(done).fail(fail);
	                } else if (pendingRequestsCount < maxPendingRequests) {
	                    pendingRequestsCount++;
	                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
	                } else {
	                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
	                }
	                function done(resp) {
	                    cb(null, resp);
	                    that._cache.set(fingerprint, resp);
	                }
	                function fail() {
	                    cb(true);
	                }
	                function always() {
	                    pendingRequestsCount--;
	                    delete pendingRequests[fingerprint];
	                    if (that.onDeckRequestArgs) {
	                        that._get.apply(that, that.onDeckRequestArgs);
	                        that.onDeckRequestArgs = null;
	                    }
	                }
	            },
	            get: function(o, cb) {
	                var resp, fingerprint;
	                cb = cb || $.noop;
	                o = _.isString(o) ? {
	                    url: o
	                } : o || {};
	                fingerprint = this._fingerprint(o);
	                this.cancelled = false;
	                this.lastReq = fingerprint;
	                if (resp = this._cache.get(fingerprint)) {
	                    cb(null, resp);
	                } else {
	                    this._get(o, cb);
	                }
	            },
	            cancel: function() {
	                this.cancelled = true;
	            }
	        });
	        return Transport;
	    }();
	    var SearchIndex = window.SearchIndex = function() {
	        "use strict";
	        var CHILDREN = "c", IDS = "i";
	        function SearchIndex(o) {
	            o = o || {};
	            if (!o.datumTokenizer || !o.queryTokenizer) {
	                $.error("datumTokenizer and queryTokenizer are both required");
	            }
	            this.identify = o.identify || _.stringify;
	            this.datumTokenizer = o.datumTokenizer;
	            this.queryTokenizer = o.queryTokenizer;
	            this.reset();
	        }
	        _.mixin(SearchIndex.prototype, {
	            bootstrap: function bootstrap(o) {
	                this.datums = o.datums;
	                this.trie = o.trie;
	            },
	            add: function(data) {
	                var that = this;
	                data = _.isArray(data) ? data : [ data ];
	                _.each(data, function(datum) {
	                    var id, tokens;
	                    that.datums[id = that.identify(datum)] = datum;
	                    tokens = normalizeTokens(that.datumTokenizer(datum));
	                    _.each(tokens, function(token) {
	                        var node, chars, ch;
	                        node = that.trie;
	                        chars = token.split("");
	                        while (ch = chars.shift()) {
	                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
	                            node[IDS].push(id);
	                        }
	                    });
	                });
	            },
	            get: function get(ids) {
	                var that = this;
	                return _.map(ids, function(id) {
	                    return that.datums[id];
	                });
	            },
	            search: function search(query) {
	                var that = this, tokens, matches;
	                tokens = normalizeTokens(this.queryTokenizer(query));
	                _.each(tokens, function(token) {
	                    var node, chars, ch, ids;
	                    if (matches && matches.length === 0) {
	                        return false;
	                    }
	                    node = that.trie;
	                    chars = token.split("");
	                    while (node && (ch = chars.shift())) {
	                        node = node[CHILDREN][ch];
	                    }
	                    if (node && chars.length === 0) {
	                        ids = node[IDS].slice(0);
	                        matches = matches ? getIntersection(matches, ids) : ids;
	                    } else {
	                        matches = [];
	                        return false;
	                    }
	                });
	                return matches ? _.map(unique(matches), function(id) {
	                    return that.datums[id];
	                }) : [];
	            },
	            all: function all() {
	                var values = [];
	                for (var key in this.datums) {
	                    values.push(this.datums[key]);
	                }
	                return values;
	            },
	            reset: function reset() {
	                this.datums = {};
	                this.trie = newNode();
	            },
	            serialize: function serialize() {
	                return {
	                    datums: this.datums,
	                    trie: this.trie
	                };
	            }
	        });
	        return SearchIndex;
	        function normalizeTokens(tokens) {
	            tokens = _.filter(tokens, function(token) {
	                return !!token;
	            });
	            tokens = _.map(tokens, function(token) {
	                return token.toLowerCase();
	            });
	            return tokens;
	        }
	        function newNode() {
	            var node = {};
	            node[IDS] = [];
	            node[CHILDREN] = {};
	            return node;
	        }
	        function unique(array) {
	            var seen = {}, uniques = [];
	            for (var i = 0, len = array.length; i < len; i++) {
	                if (!seen[array[i]]) {
	                    seen[array[i]] = true;
	                    uniques.push(array[i]);
	                }
	            }
	            return uniques;
	        }
	        function getIntersection(arrayA, arrayB) {
	            var ai = 0, bi = 0, intersection = [];
	            arrayA = arrayA.sort();
	            arrayB = arrayB.sort();
	            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
	            while (ai < lenArrayA && bi < lenArrayB) {
	                if (arrayA[ai] < arrayB[bi]) {
	                    ai++;
	                } else if (arrayA[ai] > arrayB[bi]) {
	                    bi++;
	                } else {
	                    intersection.push(arrayA[ai]);
	                    ai++;
	                    bi++;
	                }
	            }
	            return intersection;
	        }
	    }();
	    var Prefetch = function() {
	        "use strict";
	        var keys;
	        keys = {
	            data: "data",
	            protocol: "protocol",
	            thumbprint: "thumbprint"
	        };
	        function Prefetch(o) {
	            this.url = o.url;
	            this.ttl = o.ttl;
	            this.cache = o.cache;
	            this.prepare = o.prepare;
	            this.transform = o.transform;
	            this.transport = o.transport;
	            this.thumbprint = o.thumbprint;
	            this.storage = new PersistentStorage(o.cacheKey);
	        }
	        _.mixin(Prefetch.prototype, {
	            _settings: function settings() {
	                return {
	                    url: this.url,
	                    type: "GET",
	                    dataType: "json"
	                };
	            },
	            store: function store(data) {
	                if (!this.cache) {
	                    return;
	                }
	                this.storage.set(keys.data, data, this.ttl);
	                this.storage.set(keys.protocol, location.protocol, this.ttl);
	                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
	            },
	            fromCache: function fromCache() {
	                var stored = {}, isExpired;
	                if (!this.cache) {
	                    return null;
	                }
	                stored.data = this.storage.get(keys.data);
	                stored.protocol = this.storage.get(keys.protocol);
	                stored.thumbprint = this.storage.get(keys.thumbprint);
	                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
	                return stored.data && !isExpired ? stored.data : null;
	            },
	            fromNetwork: function(cb) {
	                var that = this, settings;
	                if (!cb) {
	                    return;
	                }
	                settings = this.prepare(this._settings());
	                this.transport(settings).fail(onError).done(onResponse);
	                function onError() {
	                    cb(true);
	                }
	                function onResponse(resp) {
	                    cb(null, that.transform(resp));
	                }
	            },
	            clear: function clear() {
	                this.storage.clear();
	                return this;
	            }
	        });
	        return Prefetch;
	    }();
	    var Remote = function() {
	        "use strict";
	        function Remote(o) {
	            this.url = o.url;
	            this.prepare = o.prepare;
	            this.transform = o.transform;
	            this.transport = new Transport({
	                cache: o.cache,
	                limiter: o.limiter,
	                transport: o.transport
	            });
	        }
	        _.mixin(Remote.prototype, {
	            _settings: function settings() {
	                return {
	                    url: this.url,
	                    type: "GET",
	                    dataType: "json"
	                };
	            },
	            get: function get(query, cb) {
	                var that = this, settings;
	                if (!cb) {
	                    return;
	                }
	                query = query || "";
	                settings = this.prepare(query, this._settings());
	                return this.transport.get(settings, onResponse);
	                function onResponse(err, resp) {
	                    err ? cb([]) : cb(that.transform(resp));
	                }
	            },
	            cancelLastRequest: function cancelLastRequest() {
	                this.transport.cancel();
	            }
	        });
	        return Remote;
	    }();
	    var oParser = function() {
	        "use strict";
	        return function parse(o) {
	            var defaults, sorter;
	            defaults = {
	                initialize: true,
	                identify: _.stringify,
	                datumTokenizer: null,
	                queryTokenizer: null,
	                sufficient: 5,
	                sorter: null,
	                local: [],
	                prefetch: null,
	                remote: null
	            };
	            o = _.mixin(defaults, o || {});
	            !o.datumTokenizer && $.error("datumTokenizer is required");
	            !o.queryTokenizer && $.error("queryTokenizer is required");
	            sorter = o.sorter;
	            o.sorter = sorter ? function(x) {
	                return x.sort(sorter);
	            } : _.identity;
	            o.local = _.isFunction(o.local) ? o.local() : o.local;
	            o.prefetch = parsePrefetch(o.prefetch);
	            o.remote = parseRemote(o.remote);
	            return o;
	        };
	        function parsePrefetch(o) {
	            var defaults;
	            if (!o) {
	                return null;
	            }
	            defaults = {
	                url: null,
	                ttl: 24 * 60 * 60 * 1e3,
	                cache: true,
	                cacheKey: null,
	                thumbprint: "",
	                prepare: _.identity,
	                transform: _.identity,
	                transport: null
	            };
	            o = _.isString(o) ? {
	                url: o
	            } : o;
	            o = _.mixin(defaults, o);
	            !o.url && $.error("prefetch requires url to be set");
	            o.transform = o.filter || o.transform;
	            o.cacheKey = o.cacheKey || o.url;
	            o.thumbprint = VERSION + o.thumbprint;
	            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
	            return o;
	        }
	        function parseRemote(o) {
	            var defaults;
	            if (!o) {
	                return;
	            }
	            defaults = {
	                url: null,
	                cache: true,
	                prepare: null,
	                replace: null,
	                wildcard: null,
	                limiter: null,
	                rateLimitBy: "debounce",
	                rateLimitWait: 300,
	                transform: _.identity,
	                transport: null
	            };
	            o = _.isString(o) ? {
	                url: o
	            } : o;
	            o = _.mixin(defaults, o);
	            !o.url && $.error("remote requires url to be set");
	            o.transform = o.filter || o.transform;
	            o.prepare = toRemotePrepare(o);
	            o.limiter = toLimiter(o);
	            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
	            delete o.replace;
	            delete o.wildcard;
	            delete o.rateLimitBy;
	            delete o.rateLimitWait;
	            return o;
	        }
	        function toRemotePrepare(o) {
	            var prepare, replace, wildcard;
	            prepare = o.prepare;
	            replace = o.replace;
	            wildcard = o.wildcard;
	            if (prepare) {
	                return prepare;
	            }
	            if (replace) {
	                prepare = prepareByReplace;
	            } else if (o.wildcard) {
	                prepare = prepareByWildcard;
	            } else {
	                prepare = idenityPrepare;
	            }
	            return prepare;
	            function prepareByReplace(query, settings) {
	                settings.url = replace(settings.url, query);
	                return settings;
	            }
	            function prepareByWildcard(query, settings) {
	                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
	                return settings;
	            }
	            function idenityPrepare(query, settings) {
	                return settings;
	            }
	        }
	        function toLimiter(o) {
	            var limiter, method, wait;
	            limiter = o.limiter;
	            method = o.rateLimitBy;
	            wait = o.rateLimitWait;
	            if (!limiter) {
	                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
	            }
	            return limiter;
	            function debounce(wait) {
	                return function debounce(fn) {
	                    return _.debounce(fn, wait);
	                };
	            }
	            function throttle(wait) {
	                return function throttle(fn) {
	                    return _.throttle(fn, wait);
	                };
	            }
	        }
	        function callbackToDeferred(fn) {
	            return function wrapper(o) {
	                var deferred = $.Deferred();
	                fn(o, onSuccess, onError);
	                return deferred;
	                function onSuccess(resp) {
	                    _.defer(function() {
	                        deferred.resolve(resp);
	                    });
	                }
	                function onError(err) {
	                    _.defer(function() {
	                        deferred.reject(err);
	                    });
	                }
	            };
	        }
	    }();
	    var Bloodhound = function() {
	        "use strict";
	        var old;
	        old = window && window.Bloodhound;
	        function Bloodhound(o) {
	            o = oParser(o);
	            this.sorter = o.sorter;
	            this.identify = o.identify;
	            this.sufficient = o.sufficient;
	            this.local = o.local;
	            this.remote = o.remote ? new Remote(o.remote) : null;
	            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
	            this.index = new SearchIndex({
	                identify: this.identify,
	                datumTokenizer: o.datumTokenizer,
	                queryTokenizer: o.queryTokenizer
	            });
	            o.initialize !== false && this.initialize();
	        }
	        Bloodhound.noConflict = function noConflict() {
	            window && (window.Bloodhound = old);
	            return Bloodhound;
	        };
	        Bloodhound.tokenizers = tokenizers;
	        _.mixin(Bloodhound.prototype, {
	            __ttAdapter: function ttAdapter() {
	                var that = this;
	                return this.remote ? withAsync : withoutAsync;
	                function withAsync(query, sync, async) {
	                    return that.search(query, sync, async);
	                }
	                function withoutAsync(query, sync) {
	                    return that.search(query, sync);
	                }
	            },
	            _loadPrefetch: function loadPrefetch() {
	                var that = this, deferred, serialized;
	                deferred = $.Deferred();
	                if (!this.prefetch) {
	                    deferred.resolve();
	                } else if (serialized = this.prefetch.fromCache()) {
	                    this.index.bootstrap(serialized);
	                    deferred.resolve();
	                } else {
	                    this.prefetch.fromNetwork(done);
	                }
	                return deferred.promise();
	                function done(err, data) {
	                    if (err) {
	                        return deferred.reject();
	                    }
	                    that.add(data);
	                    that.prefetch.store(that.index.serialize());
	                    deferred.resolve();
	                }
	            },
	            _initialize: function initialize() {
	                var that = this, deferred;
	                this.clear();
	                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
	                return this.initPromise;
	                function addLocalToIndex() {
	                    that.add(that.local);
	                }
	            },
	            initialize: function initialize(force) {
	                return !this.initPromise || force ? this._initialize() : this.initPromise;
	            },
	            add: function add(data) {
	                this.index.add(data);
	                return this;
	            },
	            get: function get(ids) {
	                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
	                return this.index.get(ids);
	            },
	            search: function search(query, sync, async) {
	                var that = this, local;
	                local = this.sorter(this.index.search(query));
	                sync(this.remote ? local.slice() : local);
	                if (this.remote && local.length < this.sufficient) {
	                    this.remote.get(query, processRemote);
	                } else if (this.remote) {
	                    this.remote.cancelLastRequest();
	                }
	                return this;
	                function processRemote(remote) {
	                    var nonDuplicates = [];
	                    _.each(remote, function(r) {
	                        !_.some(local, function(l) {
	                            return that.identify(r) === that.identify(l);
	                        }) && nonDuplicates.push(r);
	                    });
	                    async && async(nonDuplicates);
	                }
	            },
	            all: function all() {
	                return this.index.all();
	            },
	            clear: function clear() {
	                this.index.reset();
	                return this;
	            },
	            clearPrefetchCache: function clearPrefetchCache() {
	                this.prefetch && this.prefetch.clear();
	                return this;
	            },
	            clearRemoteCache: function clearRemoteCache() {
	                Transport.resetCache();
	                return this;
	            },
	            ttAdapter: function ttAdapter() {
	                return this.__ttAdapter();
	            }
	        });
	        return Bloodhound;
	    }();
	    return Bloodhound;
	});

/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.Sequence = undefined;

	var _map = __webpack_require__(161);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var Sequence = {
	    sequences: [],

	    refreshSequenceList: function refreshSequenceList() {
	        var _this = this;

	        m.request('/seq').then(function (data) {
	            _this.sequences = (0, _map2.default)(data, function (value) {
	                return m('option', { value: value }, value);
	            });
	        });
	    },
	    handleFormSubmit: function handleFormSubmit() {
	        var url = document.getElementById("form-seq").getAttribute('action');
	        var $btn = document.getElementById('send-seq-btn');
	        var data = new FormData();
	        data.append('seqfile', document.getElementById('seqfile').value);

	        $btn.setAttribute("disabled", "disabled");

	        m.request({ method: 'POST', url: url, data: data }).then(function () {
	            $btn.removeAttribute("disabled");
	        }).catch(function (e) {
	            $btn.removeAttribute("disabled");
	            console.log(e.message);
	        });
	        return false;
	    },
	    oninit: function oninit(vnode) {
	        this.refreshSequenceList();
	    },
	    view: function view(vnode) {
	        var _this2 = this;

	        return m('form', {
	            class: 'form-horizontal',
	            id: 'form-seq',
	            role: 'form',
	            method: 'POST',
	            action: '/seq',
	            onsubmit: function onsubmit() {
	                return _this2.handleFormSubmit();
	            }
	        }, [m('div', { class: 'form-group' }, [m('label', { style: 'width: 50%' }, 'Send Sequence'), m('div', { style: 'width: 50%; float: right; text-align: right' }, m('button', {
	            type: 'button',
	            class: 'btn btn-default seq-refresh-btn',
	            style: 'line-height: 75%; font-size:75%',
	            onclick: function onclick() {
	                _this2.refreshSequenceList();
	            }
	        }, [m('span', { class: 'glyphicon glyphicon-refresh' }), 'Refresh'])), m('select', {
	            class: 'form-control',
	            multiple: 'true',
	            id: 'seqfile'
	        }, this.sequences)]), m('div', { class: 'form-group' }, m('button', {
	            id: 'send-seq-btn',
	            type: 'submit',
	            class: 'btn btn-success'
	        }, 'Send'))]);
	    }
	};

	exports.default = { Sequence: Sequence };
	exports.Sequence = Sequence;

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.TelemetryStream = exports.TelemetryDictionary = exports.PacketDefinition = exports.Packet = exports.FieldDefinition = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _dtype = __webpack_require__(175);

	var dtype = _interopRequireWildcard(_dtype);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var FieldDefinition = function () {
	    function FieldDefinition(args) {
	        _classCallCheck(this, FieldDefinition);

	        args = args === undefined ? {} : args;

	        this.name = args.name;
	        this.mask = args.mask;
	        this.type = dtype.get(args.type);
	        this.enum = args.enum;
	        this.shift = 0;
	        this.bytes = args.bytes;
	        this.dntoeu = args.dntoeu;

	        // Bytes can be either one integer or an array,
	        // all we need is the head
	        if (args.bytes instanceof Array) {
	            this.offset = args.bytes[0];
	        } else {
	            this.offset = args.bytes;
	        }

	        // Set the shift based on the bitmask
	        var mask = this.mask;

	        if (mask !== undefined && mask !== null) {
	            while (mask !== 0 && (mask & 1) === 0) {
	                this.shift += 1;
	                mask >>= 1;
	            }
	        }
	    }

	    _createClass(FieldDefinition, [{
	        key: 'decode',
	        value: function decode(view) {
	            var value = null;

	            if (this.type) {
	                value = this.type.decode(view, this.offset);

	                if (this.mask !== undefined && this.mask !== null) {
	                    value &= this.mask;
	                }

	                if (this.shift > 0) {
	                    value >>= this.shift;
	                }

	                // If enumeration exists, display that value
	                if (this.enum !== undefined) {
	                    value = this.enum[value];
	                }
	            }

	            return value;
	        }
	    }]);

	    return FieldDefinition;
	}();

	var Packet = function () {
	    function Packet(defn, data) {
	        var _this = this;

	        var raw = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	        _classCallCheck(this, Packet);

	        this._defn = defn;
	        this._data = data;
	        this._raw = raw;

	        var _loop = function _loop(name) {
	            var getter = function getter() {
	                return _this.__get__(name);
	            };
	            Object.defineProperty(_this, name, { get: getter });
	        };

	        for (var name in this._defn.fields) {
	            _loop(name);
	        }
	    }

	    _createClass(Packet, [{
	        key: '__get__',
	        value: function __get__(name) {
	            var value = undefined;

	            if (this._data instanceof DataView) {
	                var defn = this._defn.fields[name];

	                if (defn) {
	                    value = defn ? defn.decode(this._data) : undefined;
	                }
	                // else if (defn.dntoeu) {
	                //    value = defn.dntoeu.eval(this)
	                // }
	            }

	            return value;
	        }
	    }, {
	        key: '__clone__',
	        value: function __clone__(data) {
	            var raw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            var proto = Object.getPrototypeOf(obj);
	            var props = Object.getOwnPropertyDescriptors(obj);
	            var obj = Object.create(proto, props);

	            obj._data = data;
	            obj._raw = raw;

	            return obj;
	        }
	    }]);

	    return Packet;
	}();

	var PacketDefinition = function () {
	    function PacketDefinition(obj) {
	        _classCallCheck(this, PacketDefinition);

	        this._name = obj.name;
	        this._desc = obj.desc;
	        this._fields = {};
	        this._uid = obj.uid;

	        for (var key in obj.fields) {
	            this._fields[key] = new FieldDefinition(obj.fields[key]);
	        }
	    }

	    _createClass(PacketDefinition, [{
	        key: 'fields',
	        get: function get() {
	            return this._fields;
	        }
	    }, {
	        key: 'name',
	        get: function get() {
	            return this._name;
	        }
	    }, {
	        key: 'uid',
	        get: function get() {
	            return this._uid;
	        }
	    }], [{
	        key: 'parse',
	        value: function parse(obj) {
	            if (typeof obj === 'string') {
	                obj = JSON.parse(obj);
	            }

	            return new PacketDefinition(obj);
	        }
	    }]);

	    return PacketDefinition;
	}();

	var TelemetryDictionary = function () {
	    /**
	     * Creates a new (empty) TelemetryDictionary.
	     */
	    function TelemetryDictionary() {
	        _classCallCheck(this, TelemetryDictionary);
	    }

	    /**
	     * Adds the given PacketDefinition to this TelemetryDictionary.
	     */


	    _createClass(TelemetryDictionary, [{
	        key: 'add',
	        value: function add(defn) {
	            if (defn instanceof PacketDefinition) {
	                this[defn.name] = defn;
	            }
	        }

	        /**
	         * Parses the given plain Javascript Object or JSON string and
	         * returns a new TelemetryDictionary, mapping packet names to
	         * PacketDefinitions.
	         */

	    }], [{
	        key: 'parse',
	        value: function parse(obj) {
	            var dict = new TelemetryDictionary();

	            if (typeof obj === 'string') {
	                obj = JSON.parse(obj);
	            }

	            for (var name in obj) {
	                dict.add(new PacketDefinition(obj[name]));
	            }

	            return dict;
	        }
	    }]);

	    return TelemetryDictionary;
	}();

	var TelemetryStream = function () {
	    function TelemetryStream(url, dict) {
	        var _this2 = this;

	        _classCallCheck(this, TelemetryStream);

	        this._dict = {};
	        this._interval = 0;
	        this._socket = new WebSocket(url);
	        this._stale = 0;
	        this._url = url;

	        // Re-map telemetry dictionary to be keyed by a PacketDefinition
	        // 'id' instead of 'name'.
	        for (var name in dict) {
	            var defn = dict[name];
	            this._dict[defn.uid] = defn;
	        }

	        this._socket.binaryType = 'arraybuffer';
	        this._socket.onclose = function (event) {
	            return _this2.onClose(event);
	        };
	        this._socket.onmessage = function (event) {
	            return _this2.onMessage(event);
	        };
	        this._socket.onopen = function (event) {
	            return _this2.onOpen(event);
	        };
	    }

	    _createClass(TelemetryStream, [{
	        key: '_emit',
	        value: function _emit(name, data) {
	            bliss.events.emit('bliss:tlm:' + name, data);
	        }
	    }, {
	        key: 'onClose',
	        value: function onClose(event) {
	            clearInterval(this._interval);
	            this._emit('close', this);
	        }
	    }, {
	        key: 'onMessage',
	        value: function onMessage(event) {
	            if (!(event.data instanceof ArrayBuffer)) return;

	            var uid = new DataView(event.data, 1, 4).getUint32(0);
	            var data = new DataView(event.data, 5);
	            var defn = this._dict[uid];

	            if (defn) {
	                // FIXME: packet.__clone__(data)?
	                var packet = new Packet(defn, data);

	                clearInterval(this._interval);
	                this._stale = 0;
	                this._interval = setInterval(this.onStale.bind(this), 1500);

	                bliss.packets.insert(defn.name, packet);
	                this._emit('packet', packet);
	            }
	        }
	    }, {
	        key: 'onOpen',
	        value: function onOpen(event) {
	            this._interval = setInterval(this.onStale.bind(this), 1500);
	            this._stale = 0;

	            //bliss.packets.create(this._defn.name)
	            this._emit('open', this);
	        }
	    }, {
	        key: 'onStale',
	        value: function onStale() {
	            this._stale++;
	            this._emit('stale', this);
	        }
	    }]);

	    return TelemetryStream;
	}();

	exports.FieldDefinition = FieldDefinition;
	exports.Packet = Packet;
	exports.PacketDefinition = PacketDefinition;
	exports.TelemetryDictionary = TelemetryDictionary;
	exports.TelemetryStream = TelemetryStream;

/***/ }),
/* 175 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Number of milliseconds between the Unix and GPS Epochs.
	 */
	var GPSEpoch = 315964800000;

	var CommandType = function () {
	    function CommandType(name) {
	        _classCallCheck(this, CommandType);

	        this._name = name;
	    }

	    _createClass(CommandType, [{
	        key: 'decode',
	        value: function decode(view) {
	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            var dict = bliss.cmd.dict;
	            var opcode = view.getUint16(offset, false);

	            return dict ? dict.getByOpcode(opcode) : opcode;
	        }
	    }, {
	        key: 'isTime',
	        get: function get() {
	            return false;
	        }
	    }]);

	    return CommandType;
	}();

	var EVRType = function () {
	    function EVRType(name) {
	        _classCallCheck(this, EVRType);

	        this._name = name;
	    }

	    _createClass(EVRType, [{
	        key: 'decode',
	        value: function decode(view) {
	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            var dict = bliss.evr.dict;
	            var code = view.getUint16(offset, false);

	            return dict ? dict.getByCode(code) : code;
	        }
	    }, {
	        key: 'isTime',
	        get: function get() {
	            return false;
	        }
	    }]);

	    return EVRType;
	}();

	/**
	 * PrimitiveType
	 *
	 * A PrimitiveType contains a number of fields that provide
	 * information on the details of a primitive type, including: name
	 * (e.g. "MSB_U32"), endianness ("MSB" or "LSB"), float, signed,
	 * nbits, nbytes, min, and max.
	 *
	 * PrimitiveTypes can decode() binary representations stored in a
	 * Javascript DataView.
	 */


	var PrimitiveType = function () {
	    /**
	     * Creates a new PrimitiveType based on the given typename
	     * (e.g. 'MSB_U16' for a big endian, 16-bit short integer).
	     */
	    function PrimitiveType(name) {
	        _classCallCheck(this, PrimitiveType);

	        this._name = name;
	        this._decode = PrimitiveTypeDecoder[name];
	        this._endian = null;
	        this._float = false;
	        this._max = null;
	        this._min = null;
	        this._signed = false;
	        this._string = false;

	        if (this._name.startsWith('LSB_') || this._name.startsWith('MSB_')) {
	            this._endian = this._name.substr(0, 3);
	            this._signed = this._name[4] !== 'U';
	            this._float = this._name[4] === 'F' || this._name[4] === 'D';
	            this._nbits = parseInt(this._name.substr(-2));
	        } else if (this._name.startsWith('S')) {
	            this._nbits = parseInt(this._name.substr(1)) * 8;
	            this._string = true;
	        } else {
	            this._signed = this._name[0] !== 'U';
	            this._nbits = parseInt(this._name.substr(-1));
	        }

	        this._nbytes = this._nbits / 8;

	        if (this._float) {
	            this._max = +Number.MAX_VALUE;
	            this._min = -Number.MAX_VALUE;
	        } else if (this._signed) {
	            this._max = Math.pow(2, this._nbits - 1);
	            this._min = -1 * (this._max - 1);
	        } else if (this._string === false) {
	            this._max = Math.pow(2, this._nbits) - 1;
	            this._min = 0;
	        }
	    }

	    _createClass(PrimitiveType, [{
	        key: 'decode',


	        /**
	         * Decodes the given DataView (starting at optional byte offset)
	         * according to this PrimitiveType definition
	         *
	         * @return the decoded value or null (on error).
	         */
	        value: function decode(view) {
	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            return this._decode ? this._decode(view, offset) : null;
	        }
	    }, {
	        key: 'isTime',
	        get: function get() {
	            return false;
	        }
	    }]);

	    return PrimitiveType;
	}();

	var TimeType = function () {
	    function TimeType(name) {
	        _classCallCheck(this, TimeType);

	        this._name = name;
	    }

	    _createClass(TimeType, [{
	        key: 'isTime',
	        get: function get() {
	            return true;
	        }
	    }]);

	    return TimeType;
	}();

	// FIXME: Time8 is relative, while Time32 and Time64 are absolute.


	var Time8Type = function (_TimeType) {
	    _inherits(Time8Type, _TimeType);

	    function Time8Type() {
	        _classCallCheck(this, Time8Type);

	        return _possibleConstructorReturn(this, (Time8Type.__proto__ || Object.getPrototypeOf(Time8Type)).apply(this, arguments));
	    }

	    _createClass(Time8Type, [{
	        key: 'decode',
	        value: function decode(view) {
	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            return view.getUint8(offset, false) / 256.0;
	        }
	    }]);

	    return Time8Type;
	}(TimeType);

	var Time32Type = function (_TimeType2) {
	    _inherits(Time32Type, _TimeType2);

	    function Time32Type() {
	        _classCallCheck(this, Time32Type);

	        return _possibleConstructorReturn(this, (Time32Type.__proto__ || Object.getPrototypeOf(Time32Type)).apply(this, arguments));
	    }

	    _createClass(Time32Type, [{
	        key: 'decode',
	        value: function decode(view) {
	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            var tv_sec = view.getUint32(offset, false);
	            return new Date(GPSEpoch + tv_sec * 1000);
	        }
	    }]);

	    return Time32Type;
	}(TimeType);

	var Time64Type = function (_TimeType3) {
	    _inherits(Time64Type, _TimeType3);

	    function Time64Type() {
	        _classCallCheck(this, Time64Type);

	        return _possibleConstructorReturn(this, (Time64Type.__proto__ || Object.getPrototypeOf(Time64Type)).apply(this, arguments));
	    }

	    _createClass(Time64Type, [{
	        key: 'decode',
	        value: function decode(view) {
	            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	            var tv_sec = view.getUint32(offset, false);
	            var tv_nsec = view.getUint32(offset + 4, false);

	            return new Date(GPSEpoch + tv_sec * 1000 + tv_nsec / 1e6);
	        }
	    }]);

	    return Time64Type;
	}(TimeType);

	// Used by PrimitiveType.decode():
	//
	//     PrimitiveTypeDecoder[typename](view, offset)
	//


	var PrimitiveTypeDecoder = {
	    'I8': function I8(view, offset) {
	        return view.getUint8(offset);
	    },
	    'U8': function U8(view, offset) {
	        return view.getUint8(offset);
	    },
	    'LSB_I16': function LSB_I16(view, offset) {
	        return view.getInt16(offset, true);
	    },
	    'MSB_I16': function MSB_I16(view, offset) {
	        return view.getInt16(offset, false);
	    },
	    'LSB_U16': function LSB_U16(view, offset) {
	        return view.getUint16(offset, true);
	    },
	    'MSB_U16': function MSB_U16(view, offset) {
	        return view.getUint16(offset, false);
	    },
	    'LSB_I32': function LSB_I32(view, offset) {
	        return view.getInt32(offset, true);
	    },
	    'MSB_I32': function MSB_I32(view, offset) {
	        return view.getInt32(offset, false);
	    },
	    'LSB_U32': function LSB_U32(view, offset) {
	        return view.getUint32(offset, true);
	    },
	    'MSB_U32': function MSB_U32(view, offset) {
	        return view.getUint32(offset, false);
	    },
	    'LSB_F32': function LSB_F32(view, offset) {
	        return view.getFloat32(offset, true);
	    },
	    'MSB_F32': function MSB_F32(view, offset) {
	        return view.getFloat32(offset, false);
	    },
	    'LSB_D64': function LSB_D64(view, offset) {
	        return view.getFloat64(offset, true);
	    },
	    'MSB_D64': function MSB_D64(view, offset) {
	        return view.getFloat64(offset, false);
	    }

	    //
	    // TypeMap
	    //
	    // Maps typenames to PrimitiveType.  Use bliss.dtype.get(typename).
	    // (Populated below based on information in PrimitiveTypeDecoder).
	    //
	};var TypeMap = {};
	Object.keys(PrimitiveTypeDecoder).map(function (typename) {
	    TypeMap[typename] = new PrimitiveType(typename);
	});

	TypeMap['CMD16'] = new CommandType('CMD16');
	TypeMap['EVR16'] = new EVRType('EVR16');
	TypeMap['TIME8'] = new Time8Type('TIME8');
	TypeMap['TIME32'] = new Time32Type('TIME32');
	TypeMap['TIME64'] = new Time64Type('TIME64');

	/**
	 * @returns the PrimitiveType for typename or undefined.
	 */
	function get(typename) {
	    return TypeMap[typename];
	}

	exports.get = get;

/***/ }),
/* 176 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }),
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */,
/* 187 */,
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*!
	 * Bootstrap v3.3.7 (http://getbootstrap.com)
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under the MIT license
	 */

	if (typeof jQuery === 'undefined') {
	  throw new Error('Bootstrap\'s JavaScript requires jQuery')
	}

	+function ($) {
	  'use strict';
	  var version = $.fn.jquery.split(' ')[0].split('.')
	  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
	    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
	  }
	}(jQuery);

	/* ========================================================================
	 * Bootstrap: transition.js v3.3.7
	 * http://getbootstrap.com/javascript/#transitions
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
	  // ============================================================

	  function transitionEnd() {
	    var el = document.createElement('bootstrap')

	    var transEndEventNames = {
	      WebkitTransition : 'webkitTransitionEnd',
	      MozTransition    : 'transitionend',
	      OTransition      : 'oTransitionEnd otransitionend',
	      transition       : 'transitionend'
	    }

	    for (var name in transEndEventNames) {
	      if (el.style[name] !== undefined) {
	        return { end: transEndEventNames[name] }
	      }
	    }

	    return false // explicit for ie8 (  ._.)
	  }

	  // http://blog.alexmaccaw.com/css-transitions
	  $.fn.emulateTransitionEnd = function (duration) {
	    var called = false
	    var $el = this
	    $(this).one('bsTransitionEnd', function () { called = true })
	    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
	    setTimeout(callback, duration)
	    return this
	  }

	  $(function () {
	    $.support.transition = transitionEnd()

	    if (!$.support.transition) return

	    $.event.special.bsTransitionEnd = {
	      bindType: $.support.transition.end,
	      delegateType: $.support.transition.end,
	      handle: function (e) {
	        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
	      }
	    }
	  })

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: alert.js v3.3.7
	 * http://getbootstrap.com/javascript/#alerts
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // ALERT CLASS DEFINITION
	  // ======================

	  var dismiss = '[data-dismiss="alert"]'
	  var Alert   = function (el) {
	    $(el).on('click', dismiss, this.close)
	  }

	  Alert.VERSION = '3.3.7'

	  Alert.TRANSITION_DURATION = 150

	  Alert.prototype.close = function (e) {
	    var $this    = $(this)
	    var selector = $this.attr('data-target')

	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }

	    var $parent = $(selector === '#' ? [] : selector)

	    if (e) e.preventDefault()

	    if (!$parent.length) {
	      $parent = $this.closest('.alert')
	    }

	    $parent.trigger(e = $.Event('close.bs.alert'))

	    if (e.isDefaultPrevented()) return

	    $parent.removeClass('in')

	    function removeElement() {
	      // detach from parent, fire event then clean up data
	      $parent.detach().trigger('closed.bs.alert').remove()
	    }

	    $.support.transition && $parent.hasClass('fade') ?
	      $parent
	        .one('bsTransitionEnd', removeElement)
	        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
	      removeElement()
	  }


	  // ALERT PLUGIN DEFINITION
	  // =======================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.alert')

	      if (!data) $this.data('bs.alert', (data = new Alert(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }

	  var old = $.fn.alert

	  $.fn.alert             = Plugin
	  $.fn.alert.Constructor = Alert


	  // ALERT NO CONFLICT
	  // =================

	  $.fn.alert.noConflict = function () {
	    $.fn.alert = old
	    return this
	  }


	  // ALERT DATA-API
	  // ==============

	  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: button.js v3.3.7
	 * http://getbootstrap.com/javascript/#buttons
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // BUTTON PUBLIC CLASS DEFINITION
	  // ==============================

	  var Button = function (element, options) {
	    this.$element  = $(element)
	    this.options   = $.extend({}, Button.DEFAULTS, options)
	    this.isLoading = false
	  }

	  Button.VERSION  = '3.3.7'

	  Button.DEFAULTS = {
	    loadingText: 'loading...'
	  }

	  Button.prototype.setState = function (state) {
	    var d    = 'disabled'
	    var $el  = this.$element
	    var val  = $el.is('input') ? 'val' : 'html'
	    var data = $el.data()

	    state += 'Text'

	    if (data.resetText == null) $el.data('resetText', $el[val]())

	    // push to event loop to allow forms to submit
	    setTimeout($.proxy(function () {
	      $el[val](data[state] == null ? this.options[state] : data[state])

	      if (state == 'loadingText') {
	        this.isLoading = true
	        $el.addClass(d).attr(d, d).prop(d, true)
	      } else if (this.isLoading) {
	        this.isLoading = false
	        $el.removeClass(d).removeAttr(d).prop(d, false)
	      }
	    }, this), 0)
	  }

	  Button.prototype.toggle = function () {
	    var changed = true
	    var $parent = this.$element.closest('[data-toggle="buttons"]')

	    if ($parent.length) {
	      var $input = this.$element.find('input')
	      if ($input.prop('type') == 'radio') {
	        if ($input.prop('checked')) changed = false
	        $parent.find('.active').removeClass('active')
	        this.$element.addClass('active')
	      } else if ($input.prop('type') == 'checkbox') {
	        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
	        this.$element.toggleClass('active')
	      }
	      $input.prop('checked', this.$element.hasClass('active'))
	      if (changed) $input.trigger('change')
	    } else {
	      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
	      this.$element.toggleClass('active')
	    }
	  }


	  // BUTTON PLUGIN DEFINITION
	  // ========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.button')
	      var options = typeof option == 'object' && option

	      if (!data) $this.data('bs.button', (data = new Button(this, options)))

	      if (option == 'toggle') data.toggle()
	      else if (option) data.setState(option)
	    })
	  }

	  var old = $.fn.button

	  $.fn.button             = Plugin
	  $.fn.button.Constructor = Button


	  // BUTTON NO CONFLICT
	  // ==================

	  $.fn.button.noConflict = function () {
	    $.fn.button = old
	    return this
	  }


	  // BUTTON DATA-API
	  // ===============

	  $(document)
	    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
	      var $btn = $(e.target).closest('.btn')
	      Plugin.call($btn, 'toggle')
	      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
	        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
	        e.preventDefault()
	        // The target component still receive the focus
	        if ($btn.is('input,button')) $btn.trigger('focus')
	        else $btn.find('input:visible,button:visible').first().trigger('focus')
	      }
	    })
	    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
	      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
	    })

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: carousel.js v3.3.7
	 * http://getbootstrap.com/javascript/#carousel
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // CAROUSEL CLASS DEFINITION
	  // =========================

	  var Carousel = function (element, options) {
	    this.$element    = $(element)
	    this.$indicators = this.$element.find('.carousel-indicators')
	    this.options     = options
	    this.paused      = null
	    this.sliding     = null
	    this.interval    = null
	    this.$active     = null
	    this.$items      = null

	    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

	    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
	      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
	      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
	  }

	  Carousel.VERSION  = '3.3.7'

	  Carousel.TRANSITION_DURATION = 600

	  Carousel.DEFAULTS = {
	    interval: 5000,
	    pause: 'hover',
	    wrap: true,
	    keyboard: true
	  }

	  Carousel.prototype.keydown = function (e) {
	    if (/input|textarea/i.test(e.target.tagName)) return
	    switch (e.which) {
	      case 37: this.prev(); break
	      case 39: this.next(); break
	      default: return
	    }

	    e.preventDefault()
	  }

	  Carousel.prototype.cycle = function (e) {
	    e || (this.paused = false)

	    this.interval && clearInterval(this.interval)

	    this.options.interval
	      && !this.paused
	      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

	    return this
	  }

	  Carousel.prototype.getItemIndex = function (item) {
	    this.$items = item.parent().children('.item')
	    return this.$items.index(item || this.$active)
	  }

	  Carousel.prototype.getItemForDirection = function (direction, active) {
	    var activeIndex = this.getItemIndex(active)
	    var willWrap = (direction == 'prev' && activeIndex === 0)
	                || (direction == 'next' && activeIndex == (this.$items.length - 1))
	    if (willWrap && !this.options.wrap) return active
	    var delta = direction == 'prev' ? -1 : 1
	    var itemIndex = (activeIndex + delta) % this.$items.length
	    return this.$items.eq(itemIndex)
	  }

	  Carousel.prototype.to = function (pos) {
	    var that        = this
	    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

	    if (pos > (this.$items.length - 1) || pos < 0) return

	    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
	    if (activeIndex == pos) return this.pause().cycle()

	    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
	  }

	  Carousel.prototype.pause = function (e) {
	    e || (this.paused = true)

	    if (this.$element.find('.next, .prev').length && $.support.transition) {
	      this.$element.trigger($.support.transition.end)
	      this.cycle(true)
	    }

	    this.interval = clearInterval(this.interval)

	    return this
	  }

	  Carousel.prototype.next = function () {
	    if (this.sliding) return
	    return this.slide('next')
	  }

	  Carousel.prototype.prev = function () {
	    if (this.sliding) return
	    return this.slide('prev')
	  }

	  Carousel.prototype.slide = function (type, next) {
	    var $active   = this.$element.find('.item.active')
	    var $next     = next || this.getItemForDirection(type, $active)
	    var isCycling = this.interval
	    var direction = type == 'next' ? 'left' : 'right'
	    var that      = this

	    if ($next.hasClass('active')) return (this.sliding = false)

	    var relatedTarget = $next[0]
	    var slideEvent = $.Event('slide.bs.carousel', {
	      relatedTarget: relatedTarget,
	      direction: direction
	    })
	    this.$element.trigger(slideEvent)
	    if (slideEvent.isDefaultPrevented()) return

	    this.sliding = true

	    isCycling && this.pause()

	    if (this.$indicators.length) {
	      this.$indicators.find('.active').removeClass('active')
	      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
	      $nextIndicator && $nextIndicator.addClass('active')
	    }

	    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
	    if ($.support.transition && this.$element.hasClass('slide')) {
	      $next.addClass(type)
	      $next[0].offsetWidth // force reflow
	      $active.addClass(direction)
	      $next.addClass(direction)
	      $active
	        .one('bsTransitionEnd', function () {
	          $next.removeClass([type, direction].join(' ')).addClass('active')
	          $active.removeClass(['active', direction].join(' '))
	          that.sliding = false
	          setTimeout(function () {
	            that.$element.trigger(slidEvent)
	          }, 0)
	        })
	        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
	    } else {
	      $active.removeClass('active')
	      $next.addClass('active')
	      this.sliding = false
	      this.$element.trigger(slidEvent)
	    }

	    isCycling && this.cycle()

	    return this
	  }


	  // CAROUSEL PLUGIN DEFINITION
	  // ==========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.carousel')
	      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
	      var action  = typeof option == 'string' ? option : options.slide

	      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
	      if (typeof option == 'number') data.to(option)
	      else if (action) data[action]()
	      else if (options.interval) data.pause().cycle()
	    })
	  }

	  var old = $.fn.carousel

	  $.fn.carousel             = Plugin
	  $.fn.carousel.Constructor = Carousel


	  // CAROUSEL NO CONFLICT
	  // ====================

	  $.fn.carousel.noConflict = function () {
	    $.fn.carousel = old
	    return this
	  }


	  // CAROUSEL DATA-API
	  // =================

	  var clickHandler = function (e) {
	    var href
	    var $this   = $(this)
	    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
	    if (!$target.hasClass('carousel')) return
	    var options = $.extend({}, $target.data(), $this.data())
	    var slideIndex = $this.attr('data-slide-to')
	    if (slideIndex) options.interval = false

	    Plugin.call($target, options)

	    if (slideIndex) {
	      $target.data('bs.carousel').to(slideIndex)
	    }

	    e.preventDefault()
	  }

	  $(document)
	    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
	    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

	  $(window).on('load', function () {
	    $('[data-ride="carousel"]').each(function () {
	      var $carousel = $(this)
	      Plugin.call($carousel, $carousel.data())
	    })
	  })

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: collapse.js v3.3.7
	 * http://getbootstrap.com/javascript/#collapse
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */

	/* jshint latedef: false */

	+function ($) {
	  'use strict';

	  // COLLAPSE PUBLIC CLASS DEFINITION
	  // ================================

	  var Collapse = function (element, options) {
	    this.$element      = $(element)
	    this.options       = $.extend({}, Collapse.DEFAULTS, options)
	    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
	                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
	    this.transitioning = null

	    if (this.options.parent) {
	      this.$parent = this.getParent()
	    } else {
	      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
	    }

	    if (this.options.toggle) this.toggle()
	  }

	  Collapse.VERSION  = '3.3.7'

	  Collapse.TRANSITION_DURATION = 350

	  Collapse.DEFAULTS = {
	    toggle: true
	  }

	  Collapse.prototype.dimension = function () {
	    var hasWidth = this.$element.hasClass('width')
	    return hasWidth ? 'width' : 'height'
	  }

	  Collapse.prototype.show = function () {
	    if (this.transitioning || this.$element.hasClass('in')) return

	    var activesData
	    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

	    if (actives && actives.length) {
	      activesData = actives.data('bs.collapse')
	      if (activesData && activesData.transitioning) return
	    }

	    var startEvent = $.Event('show.bs.collapse')
	    this.$element.trigger(startEvent)
	    if (startEvent.isDefaultPrevented()) return

	    if (actives && actives.length) {
	      Plugin.call(actives, 'hide')
	      activesData || actives.data('bs.collapse', null)
	    }

	    var dimension = this.dimension()

	    this.$element
	      .removeClass('collapse')
	      .addClass('collapsing')[dimension](0)
	      .attr('aria-expanded', true)

	    this.$trigger
	      .removeClass('collapsed')
	      .attr('aria-expanded', true)

	    this.transitioning = 1

	    var complete = function () {
	      this.$element
	        .removeClass('collapsing')
	        .addClass('collapse in')[dimension]('')
	      this.transitioning = 0
	      this.$element
	        .trigger('shown.bs.collapse')
	    }

	    if (!$.support.transition) return complete.call(this)

	    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

	    this.$element
	      .one('bsTransitionEnd', $.proxy(complete, this))
	      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
	  }

	  Collapse.prototype.hide = function () {
	    if (this.transitioning || !this.$element.hasClass('in')) return

	    var startEvent = $.Event('hide.bs.collapse')
	    this.$element.trigger(startEvent)
	    if (startEvent.isDefaultPrevented()) return

	    var dimension = this.dimension()

	    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

	    this.$element
	      .addClass('collapsing')
	      .removeClass('collapse in')
	      .attr('aria-expanded', false)

	    this.$trigger
	      .addClass('collapsed')
	      .attr('aria-expanded', false)

	    this.transitioning = 1

	    var complete = function () {
	      this.transitioning = 0
	      this.$element
	        .removeClass('collapsing')
	        .addClass('collapse')
	        .trigger('hidden.bs.collapse')
	    }

	    if (!$.support.transition) return complete.call(this)

	    this.$element
	      [dimension](0)
	      .one('bsTransitionEnd', $.proxy(complete, this))
	      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
	  }

	  Collapse.prototype.toggle = function () {
	    this[this.$element.hasClass('in') ? 'hide' : 'show']()
	  }

	  Collapse.prototype.getParent = function () {
	    return $(this.options.parent)
	      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
	      .each($.proxy(function (i, element) {
	        var $element = $(element)
	        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
	      }, this))
	      .end()
	  }

	  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
	    var isOpen = $element.hasClass('in')

	    $element.attr('aria-expanded', isOpen)
	    $trigger
	      .toggleClass('collapsed', !isOpen)
	      .attr('aria-expanded', isOpen)
	  }

	  function getTargetFromTrigger($trigger) {
	    var href
	    var target = $trigger.attr('data-target')
	      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

	    return $(target)
	  }


	  // COLLAPSE PLUGIN DEFINITION
	  // ==========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.collapse')
	      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

	      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
	      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  var old = $.fn.collapse

	  $.fn.collapse             = Plugin
	  $.fn.collapse.Constructor = Collapse


	  // COLLAPSE NO CONFLICT
	  // ====================

	  $.fn.collapse.noConflict = function () {
	    $.fn.collapse = old
	    return this
	  }


	  // COLLAPSE DATA-API
	  // =================

	  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
	    var $this   = $(this)

	    if (!$this.attr('data-target')) e.preventDefault()

	    var $target = getTargetFromTrigger($this)
	    var data    = $target.data('bs.collapse')
	    var option  = data ? 'toggle' : $this.data()

	    Plugin.call($target, option)
	  })

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: dropdown.js v3.3.7
	 * http://getbootstrap.com/javascript/#dropdowns
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // DROPDOWN CLASS DEFINITION
	  // =========================

	  var backdrop = '.dropdown-backdrop'
	  var toggle   = '[data-toggle="dropdown"]'
	  var Dropdown = function (element) {
	    $(element).on('click.bs.dropdown', this.toggle)
	  }

	  Dropdown.VERSION = '3.3.7'

	  function getParent($this) {
	    var selector = $this.attr('data-target')

	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }

	    var $parent = selector && $(selector)

	    return $parent && $parent.length ? $parent : $this.parent()
	  }

	  function clearMenus(e) {
	    if (e && e.which === 3) return
	    $(backdrop).remove()
	    $(toggle).each(function () {
	      var $this         = $(this)
	      var $parent       = getParent($this)
	      var relatedTarget = { relatedTarget: this }

	      if (!$parent.hasClass('open')) return

	      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

	      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

	      if (e.isDefaultPrevented()) return

	      $this.attr('aria-expanded', 'false')
	      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
	    })
	  }

	  Dropdown.prototype.toggle = function (e) {
	    var $this = $(this)

	    if ($this.is('.disabled, :disabled')) return

	    var $parent  = getParent($this)
	    var isActive = $parent.hasClass('open')

	    clearMenus()

	    if (!isActive) {
	      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
	        // if mobile we use a backdrop because click events don't delegate
	        $(document.createElement('div'))
	          .addClass('dropdown-backdrop')
	          .insertAfter($(this))
	          .on('click', clearMenus)
	      }

	      var relatedTarget = { relatedTarget: this }
	      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

	      if (e.isDefaultPrevented()) return

	      $this
	        .trigger('focus')
	        .attr('aria-expanded', 'true')

	      $parent
	        .toggleClass('open')
	        .trigger($.Event('shown.bs.dropdown', relatedTarget))
	    }

	    return false
	  }

	  Dropdown.prototype.keydown = function (e) {
	    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

	    var $this = $(this)

	    e.preventDefault()
	    e.stopPropagation()

	    if ($this.is('.disabled, :disabled')) return

	    var $parent  = getParent($this)
	    var isActive = $parent.hasClass('open')

	    if (!isActive && e.which != 27 || isActive && e.which == 27) {
	      if (e.which == 27) $parent.find(toggle).trigger('focus')
	      return $this.trigger('click')
	    }

	    var desc = ' li:not(.disabled):visible a'
	    var $items = $parent.find('.dropdown-menu' + desc)

	    if (!$items.length) return

	    var index = $items.index(e.target)

	    if (e.which == 38 && index > 0)                 index--         // up
	    if (e.which == 40 && index < $items.length - 1) index++         // down
	    if (!~index)                                    index = 0

	    $items.eq(index).trigger('focus')
	  }


	  // DROPDOWN PLUGIN DEFINITION
	  // ==========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.dropdown')

	      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }

	  var old = $.fn.dropdown

	  $.fn.dropdown             = Plugin
	  $.fn.dropdown.Constructor = Dropdown


	  // DROPDOWN NO CONFLICT
	  // ====================

	  $.fn.dropdown.noConflict = function () {
	    $.fn.dropdown = old
	    return this
	  }


	  // APPLY TO STANDARD DROPDOWN ELEMENTS
	  // ===================================

	  $(document)
	    .on('click.bs.dropdown.data-api', clearMenus)
	    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
	    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
	    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
	    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: modal.js v3.3.7
	 * http://getbootstrap.com/javascript/#modals
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // MODAL CLASS DEFINITION
	  // ======================

	  var Modal = function (element, options) {
	    this.options             = options
	    this.$body               = $(document.body)
	    this.$element            = $(element)
	    this.$dialog             = this.$element.find('.modal-dialog')
	    this.$backdrop           = null
	    this.isShown             = null
	    this.originalBodyPad     = null
	    this.scrollbarWidth      = 0
	    this.ignoreBackdropClick = false

	    if (this.options.remote) {
	      this.$element
	        .find('.modal-content')
	        .load(this.options.remote, $.proxy(function () {
	          this.$element.trigger('loaded.bs.modal')
	        }, this))
	    }
	  }

	  Modal.VERSION  = '3.3.7'

	  Modal.TRANSITION_DURATION = 300
	  Modal.BACKDROP_TRANSITION_DURATION = 150

	  Modal.DEFAULTS = {
	    backdrop: true,
	    keyboard: true,
	    show: true
	  }

	  Modal.prototype.toggle = function (_relatedTarget) {
	    return this.isShown ? this.hide() : this.show(_relatedTarget)
	  }

	  Modal.prototype.show = function (_relatedTarget) {
	    var that = this
	    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

	    this.$element.trigger(e)

	    if (this.isShown || e.isDefaultPrevented()) return

	    this.isShown = true

	    this.checkScrollbar()
	    this.setScrollbar()
	    this.$body.addClass('modal-open')

	    this.escape()
	    this.resize()

	    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

	    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
	      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
	        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
	      })
	    })

	    this.backdrop(function () {
	      var transition = $.support.transition && that.$element.hasClass('fade')

	      if (!that.$element.parent().length) {
	        that.$element.appendTo(that.$body) // don't move modals dom position
	      }

	      that.$element
	        .show()
	        .scrollTop(0)

	      that.adjustDialog()

	      if (transition) {
	        that.$element[0].offsetWidth // force reflow
	      }

	      that.$element.addClass('in')

	      that.enforceFocus()

	      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

	      transition ?
	        that.$dialog // wait for modal to slide in
	          .one('bsTransitionEnd', function () {
	            that.$element.trigger('focus').trigger(e)
	          })
	          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
	        that.$element.trigger('focus').trigger(e)
	    })
	  }

	  Modal.prototype.hide = function (e) {
	    if (e) e.preventDefault()

	    e = $.Event('hide.bs.modal')

	    this.$element.trigger(e)

	    if (!this.isShown || e.isDefaultPrevented()) return

	    this.isShown = false

	    this.escape()
	    this.resize()

	    $(document).off('focusin.bs.modal')

	    this.$element
	      .removeClass('in')
	      .off('click.dismiss.bs.modal')
	      .off('mouseup.dismiss.bs.modal')

	    this.$dialog.off('mousedown.dismiss.bs.modal')

	    $.support.transition && this.$element.hasClass('fade') ?
	      this.$element
	        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
	        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
	      this.hideModal()
	  }

	  Modal.prototype.enforceFocus = function () {
	    $(document)
	      .off('focusin.bs.modal') // guard against infinite focus loop
	      .on('focusin.bs.modal', $.proxy(function (e) {
	        if (document !== e.target &&
	            this.$element[0] !== e.target &&
	            !this.$element.has(e.target).length) {
	          this.$element.trigger('focus')
	        }
	      }, this))
	  }

	  Modal.prototype.escape = function () {
	    if (this.isShown && this.options.keyboard) {
	      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
	        e.which == 27 && this.hide()
	      }, this))
	    } else if (!this.isShown) {
	      this.$element.off('keydown.dismiss.bs.modal')
	    }
	  }

	  Modal.prototype.resize = function () {
	    if (this.isShown) {
	      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
	    } else {
	      $(window).off('resize.bs.modal')
	    }
	  }

	  Modal.prototype.hideModal = function () {
	    var that = this
	    this.$element.hide()
	    this.backdrop(function () {
	      that.$body.removeClass('modal-open')
	      that.resetAdjustments()
	      that.resetScrollbar()
	      that.$element.trigger('hidden.bs.modal')
	    })
	  }

	  Modal.prototype.removeBackdrop = function () {
	    this.$backdrop && this.$backdrop.remove()
	    this.$backdrop = null
	  }

	  Modal.prototype.backdrop = function (callback) {
	    var that = this
	    var animate = this.$element.hasClass('fade') ? 'fade' : ''

	    if (this.isShown && this.options.backdrop) {
	      var doAnimate = $.support.transition && animate

	      this.$backdrop = $(document.createElement('div'))
	        .addClass('modal-backdrop ' + animate)
	        .appendTo(this.$body)

	      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
	        if (this.ignoreBackdropClick) {
	          this.ignoreBackdropClick = false
	          return
	        }
	        if (e.target !== e.currentTarget) return
	        this.options.backdrop == 'static'
	          ? this.$element[0].focus()
	          : this.hide()
	      }, this))

	      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

	      this.$backdrop.addClass('in')

	      if (!callback) return

	      doAnimate ?
	        this.$backdrop
	          .one('bsTransitionEnd', callback)
	          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
	        callback()

	    } else if (!this.isShown && this.$backdrop) {
	      this.$backdrop.removeClass('in')

	      var callbackRemove = function () {
	        that.removeBackdrop()
	        callback && callback()
	      }
	      $.support.transition && this.$element.hasClass('fade') ?
	        this.$backdrop
	          .one('bsTransitionEnd', callbackRemove)
	          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
	        callbackRemove()

	    } else if (callback) {
	      callback()
	    }
	  }

	  // these following methods are used to handle overflowing modals

	  Modal.prototype.handleUpdate = function () {
	    this.adjustDialog()
	  }

	  Modal.prototype.adjustDialog = function () {
	    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

	    this.$element.css({
	      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
	      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
	    })
	  }

	  Modal.prototype.resetAdjustments = function () {
	    this.$element.css({
	      paddingLeft: '',
	      paddingRight: ''
	    })
	  }

	  Modal.prototype.checkScrollbar = function () {
	    var fullWindowWidth = window.innerWidth
	    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
	      var documentElementRect = document.documentElement.getBoundingClientRect()
	      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
	    }
	    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
	    this.scrollbarWidth = this.measureScrollbar()
	  }

	  Modal.prototype.setScrollbar = function () {
	    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
	    this.originalBodyPad = document.body.style.paddingRight || ''
	    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
	  }

	  Modal.prototype.resetScrollbar = function () {
	    this.$body.css('padding-right', this.originalBodyPad)
	  }

	  Modal.prototype.measureScrollbar = function () { // thx walsh
	    var scrollDiv = document.createElement('div')
	    scrollDiv.className = 'modal-scrollbar-measure'
	    this.$body.append(scrollDiv)
	    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
	    this.$body[0].removeChild(scrollDiv)
	    return scrollbarWidth
	  }


	  // MODAL PLUGIN DEFINITION
	  // =======================

	  function Plugin(option, _relatedTarget) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.modal')
	      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

	      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
	      if (typeof option == 'string') data[option](_relatedTarget)
	      else if (options.show) data.show(_relatedTarget)
	    })
	  }

	  var old = $.fn.modal

	  $.fn.modal             = Plugin
	  $.fn.modal.Constructor = Modal


	  // MODAL NO CONFLICT
	  // =================

	  $.fn.modal.noConflict = function () {
	    $.fn.modal = old
	    return this
	  }


	  // MODAL DATA-API
	  // ==============

	  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
	    var $this   = $(this)
	    var href    = $this.attr('href')
	    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
	    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

	    if ($this.is('a')) e.preventDefault()

	    $target.one('show.bs.modal', function (showEvent) {
	      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
	      $target.one('hidden.bs.modal', function () {
	        $this.is(':visible') && $this.trigger('focus')
	      })
	    })
	    Plugin.call($target, option, this)
	  })

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: tooltip.js v3.3.7
	 * http://getbootstrap.com/javascript/#tooltip
	 * Inspired by the original jQuery.tipsy by Jason Frame
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // TOOLTIP PUBLIC CLASS DEFINITION
	  // ===============================

	  var Tooltip = function (element, options) {
	    this.type       = null
	    this.options    = null
	    this.enabled    = null
	    this.timeout    = null
	    this.hoverState = null
	    this.$element   = null
	    this.inState    = null

	    this.init('tooltip', element, options)
	  }

	  Tooltip.VERSION  = '3.3.7'

	  Tooltip.TRANSITION_DURATION = 150

	  Tooltip.DEFAULTS = {
	    animation: true,
	    placement: 'top',
	    selector: false,
	    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
	    trigger: 'hover focus',
	    title: '',
	    delay: 0,
	    html: false,
	    container: false,
	    viewport: {
	      selector: 'body',
	      padding: 0
	    }
	  }

	  Tooltip.prototype.init = function (type, element, options) {
	    this.enabled   = true
	    this.type      = type
	    this.$element  = $(element)
	    this.options   = this.getOptions(options)
	    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
	    this.inState   = { click: false, hover: false, focus: false }

	    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
	      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
	    }

	    var triggers = this.options.trigger.split(' ')

	    for (var i = triggers.length; i--;) {
	      var trigger = triggers[i]

	      if (trigger == 'click') {
	        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
	      } else if (trigger != 'manual') {
	        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
	        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

	        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
	        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
	      }
	    }

	    this.options.selector ?
	      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
	      this.fixTitle()
	  }

	  Tooltip.prototype.getDefaults = function () {
	    return Tooltip.DEFAULTS
	  }

	  Tooltip.prototype.getOptions = function (options) {
	    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

	    if (options.delay && typeof options.delay == 'number') {
	      options.delay = {
	        show: options.delay,
	        hide: options.delay
	      }
	    }

	    return options
	  }

	  Tooltip.prototype.getDelegateOptions = function () {
	    var options  = {}
	    var defaults = this.getDefaults()

	    this._options && $.each(this._options, function (key, value) {
	      if (defaults[key] != value) options[key] = value
	    })

	    return options
	  }

	  Tooltip.prototype.enter = function (obj) {
	    var self = obj instanceof this.constructor ?
	      obj : $(obj.currentTarget).data('bs.' + this.type)

	    if (!self) {
	      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
	      $(obj.currentTarget).data('bs.' + this.type, self)
	    }

	    if (obj instanceof $.Event) {
	      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
	    }

	    if (self.tip().hasClass('in') || self.hoverState == 'in') {
	      self.hoverState = 'in'
	      return
	    }

	    clearTimeout(self.timeout)

	    self.hoverState = 'in'

	    if (!self.options.delay || !self.options.delay.show) return self.show()

	    self.timeout = setTimeout(function () {
	      if (self.hoverState == 'in') self.show()
	    }, self.options.delay.show)
	  }

	  Tooltip.prototype.isInStateTrue = function () {
	    for (var key in this.inState) {
	      if (this.inState[key]) return true
	    }

	    return false
	  }

	  Tooltip.prototype.leave = function (obj) {
	    var self = obj instanceof this.constructor ?
	      obj : $(obj.currentTarget).data('bs.' + this.type)

	    if (!self) {
	      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
	      $(obj.currentTarget).data('bs.' + this.type, self)
	    }

	    if (obj instanceof $.Event) {
	      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
	    }

	    if (self.isInStateTrue()) return

	    clearTimeout(self.timeout)

	    self.hoverState = 'out'

	    if (!self.options.delay || !self.options.delay.hide) return self.hide()

	    self.timeout = setTimeout(function () {
	      if (self.hoverState == 'out') self.hide()
	    }, self.options.delay.hide)
	  }

	  Tooltip.prototype.show = function () {
	    var e = $.Event('show.bs.' + this.type)

	    if (this.hasContent() && this.enabled) {
	      this.$element.trigger(e)

	      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
	      if (e.isDefaultPrevented() || !inDom) return
	      var that = this

	      var $tip = this.tip()

	      var tipId = this.getUID(this.type)

	      this.setContent()
	      $tip.attr('id', tipId)
	      this.$element.attr('aria-describedby', tipId)

	      if (this.options.animation) $tip.addClass('fade')

	      var placement = typeof this.options.placement == 'function' ?
	        this.options.placement.call(this, $tip[0], this.$element[0]) :
	        this.options.placement

	      var autoToken = /\s?auto?\s?/i
	      var autoPlace = autoToken.test(placement)
	      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

	      $tip
	        .detach()
	        .css({ top: 0, left: 0, display: 'block' })
	        .addClass(placement)
	        .data('bs.' + this.type, this)

	      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
	      this.$element.trigger('inserted.bs.' + this.type)

	      var pos          = this.getPosition()
	      var actualWidth  = $tip[0].offsetWidth
	      var actualHeight = $tip[0].offsetHeight

	      if (autoPlace) {
	        var orgPlacement = placement
	        var viewportDim = this.getPosition(this.$viewport)

	        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
	                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
	                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
	                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
	                    placement

	        $tip
	          .removeClass(orgPlacement)
	          .addClass(placement)
	      }

	      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

	      this.applyPlacement(calculatedOffset, placement)

	      var complete = function () {
	        var prevHoverState = that.hoverState
	        that.$element.trigger('shown.bs.' + that.type)
	        that.hoverState = null

	        if (prevHoverState == 'out') that.leave(that)
	      }

	      $.support.transition && this.$tip.hasClass('fade') ?
	        $tip
	          .one('bsTransitionEnd', complete)
	          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
	        complete()
	    }
	  }

	  Tooltip.prototype.applyPlacement = function (offset, placement) {
	    var $tip   = this.tip()
	    var width  = $tip[0].offsetWidth
	    var height = $tip[0].offsetHeight

	    // manually read margins because getBoundingClientRect includes difference
	    var marginTop = parseInt($tip.css('margin-top'), 10)
	    var marginLeft = parseInt($tip.css('margin-left'), 10)

	    // we must check for NaN for ie 8/9
	    if (isNaN(marginTop))  marginTop  = 0
	    if (isNaN(marginLeft)) marginLeft = 0

	    offset.top  += marginTop
	    offset.left += marginLeft

	    // $.fn.offset doesn't round pixel values
	    // so we use setOffset directly with our own function B-0
	    $.offset.setOffset($tip[0], $.extend({
	      using: function (props) {
	        $tip.css({
	          top: Math.round(props.top),
	          left: Math.round(props.left)
	        })
	      }
	    }, offset), 0)

	    $tip.addClass('in')

	    // check to see if placing tip in new offset caused the tip to resize itself
	    var actualWidth  = $tip[0].offsetWidth
	    var actualHeight = $tip[0].offsetHeight

	    if (placement == 'top' && actualHeight != height) {
	      offset.top = offset.top + height - actualHeight
	    }

	    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

	    if (delta.left) offset.left += delta.left
	    else offset.top += delta.top

	    var isVertical          = /top|bottom/.test(placement)
	    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
	    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

	    $tip.offset(offset)
	    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
	  }

	  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
	    this.arrow()
	      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
	      .css(isVertical ? 'top' : 'left', '')
	  }

	  Tooltip.prototype.setContent = function () {
	    var $tip  = this.tip()
	    var title = this.getTitle()

	    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
	    $tip.removeClass('fade in top bottom left right')
	  }

	  Tooltip.prototype.hide = function (callback) {
	    var that = this
	    var $tip = $(this.$tip)
	    var e    = $.Event('hide.bs.' + this.type)

	    function complete() {
	      if (that.hoverState != 'in') $tip.detach()
	      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
	        that.$element
	          .removeAttr('aria-describedby')
	          .trigger('hidden.bs.' + that.type)
	      }
	      callback && callback()
	    }

	    this.$element.trigger(e)

	    if (e.isDefaultPrevented()) return

	    $tip.removeClass('in')

	    $.support.transition && $tip.hasClass('fade') ?
	      $tip
	        .one('bsTransitionEnd', complete)
	        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
	      complete()

	    this.hoverState = null

	    return this
	  }

	  Tooltip.prototype.fixTitle = function () {
	    var $e = this.$element
	    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
	      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
	    }
	  }

	  Tooltip.prototype.hasContent = function () {
	    return this.getTitle()
	  }

	  Tooltip.prototype.getPosition = function ($element) {
	    $element   = $element || this.$element

	    var el     = $element[0]
	    var isBody = el.tagName == 'BODY'

	    var elRect    = el.getBoundingClientRect()
	    if (elRect.width == null) {
	      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
	      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
	    }
	    var isSvg = window.SVGElement && el instanceof window.SVGElement
	    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
	    // See https://github.com/twbs/bootstrap/issues/20280
	    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
	    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
	    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

	    return $.extend({}, elRect, scroll, outerDims, elOffset)
	  }

	  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
	    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
	           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
	           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
	        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

	  }

	  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
	    var delta = { top: 0, left: 0 }
	    if (!this.$viewport) return delta

	    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
	    var viewportDimensions = this.getPosition(this.$viewport)

	    if (/right|left/.test(placement)) {
	      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
	      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
	      if (topEdgeOffset < viewportDimensions.top) { // top overflow
	        delta.top = viewportDimensions.top - topEdgeOffset
	      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
	        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
	      }
	    } else {
	      var leftEdgeOffset  = pos.left - viewportPadding
	      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
	      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
	        delta.left = viewportDimensions.left - leftEdgeOffset
	      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
	        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
	      }
	    }

	    return delta
	  }

	  Tooltip.prototype.getTitle = function () {
	    var title
	    var $e = this.$element
	    var o  = this.options

	    title = $e.attr('data-original-title')
	      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

	    return title
	  }

	  Tooltip.prototype.getUID = function (prefix) {
	    do prefix += ~~(Math.random() * 1000000)
	    while (document.getElementById(prefix))
	    return prefix
	  }

	  Tooltip.prototype.tip = function () {
	    if (!this.$tip) {
	      this.$tip = $(this.options.template)
	      if (this.$tip.length != 1) {
	        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
	      }
	    }
	    return this.$tip
	  }

	  Tooltip.prototype.arrow = function () {
	    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
	  }

	  Tooltip.prototype.enable = function () {
	    this.enabled = true
	  }

	  Tooltip.prototype.disable = function () {
	    this.enabled = false
	  }

	  Tooltip.prototype.toggleEnabled = function () {
	    this.enabled = !this.enabled
	  }

	  Tooltip.prototype.toggle = function (e) {
	    var self = this
	    if (e) {
	      self = $(e.currentTarget).data('bs.' + this.type)
	      if (!self) {
	        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
	        $(e.currentTarget).data('bs.' + this.type, self)
	      }
	    }

	    if (e) {
	      self.inState.click = !self.inState.click
	      if (self.isInStateTrue()) self.enter(self)
	      else self.leave(self)
	    } else {
	      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
	    }
	  }

	  Tooltip.prototype.destroy = function () {
	    var that = this
	    clearTimeout(this.timeout)
	    this.hide(function () {
	      that.$element.off('.' + that.type).removeData('bs.' + that.type)
	      if (that.$tip) {
	        that.$tip.detach()
	      }
	      that.$tip = null
	      that.$arrow = null
	      that.$viewport = null
	      that.$element = null
	    })
	  }


	  // TOOLTIP PLUGIN DEFINITION
	  // =========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.tooltip')
	      var options = typeof option == 'object' && option

	      if (!data && /destroy|hide/.test(option)) return
	      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  var old = $.fn.tooltip

	  $.fn.tooltip             = Plugin
	  $.fn.tooltip.Constructor = Tooltip


	  // TOOLTIP NO CONFLICT
	  // ===================

	  $.fn.tooltip.noConflict = function () {
	    $.fn.tooltip = old
	    return this
	  }

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: popover.js v3.3.7
	 * http://getbootstrap.com/javascript/#popovers
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // POPOVER PUBLIC CLASS DEFINITION
	  // ===============================

	  var Popover = function (element, options) {
	    this.init('popover', element, options)
	  }

	  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

	  Popover.VERSION  = '3.3.7'

	  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
	    placement: 'right',
	    trigger: 'click',
	    content: '',
	    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
	  })


	  // NOTE: POPOVER EXTENDS tooltip.js
	  // ================================

	  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

	  Popover.prototype.constructor = Popover

	  Popover.prototype.getDefaults = function () {
	    return Popover.DEFAULTS
	  }

	  Popover.prototype.setContent = function () {
	    var $tip    = this.tip()
	    var title   = this.getTitle()
	    var content = this.getContent()

	    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
	    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
	      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
	    ](content)

	    $tip.removeClass('fade top bottom left right in')

	    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
	    // this manually by checking the contents.
	    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
	  }

	  Popover.prototype.hasContent = function () {
	    return this.getTitle() || this.getContent()
	  }

	  Popover.prototype.getContent = function () {
	    var $e = this.$element
	    var o  = this.options

	    return $e.attr('data-content')
	      || (typeof o.content == 'function' ?
	            o.content.call($e[0]) :
	            o.content)
	  }

	  Popover.prototype.arrow = function () {
	    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
	  }


	  // POPOVER PLUGIN DEFINITION
	  // =========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.popover')
	      var options = typeof option == 'object' && option

	      if (!data && /destroy|hide/.test(option)) return
	      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  var old = $.fn.popover

	  $.fn.popover             = Plugin
	  $.fn.popover.Constructor = Popover


	  // POPOVER NO CONFLICT
	  // ===================

	  $.fn.popover.noConflict = function () {
	    $.fn.popover = old
	    return this
	  }

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: scrollspy.js v3.3.7
	 * http://getbootstrap.com/javascript/#scrollspy
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // SCROLLSPY CLASS DEFINITION
	  // ==========================

	  function ScrollSpy(element, options) {
	    this.$body          = $(document.body)
	    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
	    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
	    this.selector       = (this.options.target || '') + ' .nav li > a'
	    this.offsets        = []
	    this.targets        = []
	    this.activeTarget   = null
	    this.scrollHeight   = 0

	    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
	    this.refresh()
	    this.process()
	  }

	  ScrollSpy.VERSION  = '3.3.7'

	  ScrollSpy.DEFAULTS = {
	    offset: 10
	  }

	  ScrollSpy.prototype.getScrollHeight = function () {
	    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
	  }

	  ScrollSpy.prototype.refresh = function () {
	    var that          = this
	    var offsetMethod  = 'offset'
	    var offsetBase    = 0

	    this.offsets      = []
	    this.targets      = []
	    this.scrollHeight = this.getScrollHeight()

	    if (!$.isWindow(this.$scrollElement[0])) {
	      offsetMethod = 'position'
	      offsetBase   = this.$scrollElement.scrollTop()
	    }

	    this.$body
	      .find(this.selector)
	      .map(function () {
	        var $el   = $(this)
	        var href  = $el.data('target') || $el.attr('href')
	        var $href = /^#./.test(href) && $(href)

	        return ($href
	          && $href.length
	          && $href.is(':visible')
	          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
	      })
	      .sort(function (a, b) { return a[0] - b[0] })
	      .each(function () {
	        that.offsets.push(this[0])
	        that.targets.push(this[1])
	      })
	  }

	  ScrollSpy.prototype.process = function () {
	    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
	    var scrollHeight = this.getScrollHeight()
	    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
	    var offsets      = this.offsets
	    var targets      = this.targets
	    var activeTarget = this.activeTarget
	    var i

	    if (this.scrollHeight != scrollHeight) {
	      this.refresh()
	    }

	    if (scrollTop >= maxScroll) {
	      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
	    }

	    if (activeTarget && scrollTop < offsets[0]) {
	      this.activeTarget = null
	      return this.clear()
	    }

	    for (i = offsets.length; i--;) {
	      activeTarget != targets[i]
	        && scrollTop >= offsets[i]
	        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
	        && this.activate(targets[i])
	    }
	  }

	  ScrollSpy.prototype.activate = function (target) {
	    this.activeTarget = target

	    this.clear()

	    var selector = this.selector +
	      '[data-target="' + target + '"],' +
	      this.selector + '[href="' + target + '"]'

	    var active = $(selector)
	      .parents('li')
	      .addClass('active')

	    if (active.parent('.dropdown-menu').length) {
	      active = active
	        .closest('li.dropdown')
	        .addClass('active')
	    }

	    active.trigger('activate.bs.scrollspy')
	  }

	  ScrollSpy.prototype.clear = function () {
	    $(this.selector)
	      .parentsUntil(this.options.target, '.active')
	      .removeClass('active')
	  }


	  // SCROLLSPY PLUGIN DEFINITION
	  // ===========================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.scrollspy')
	      var options = typeof option == 'object' && option

	      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  var old = $.fn.scrollspy

	  $.fn.scrollspy             = Plugin
	  $.fn.scrollspy.Constructor = ScrollSpy


	  // SCROLLSPY NO CONFLICT
	  // =====================

	  $.fn.scrollspy.noConflict = function () {
	    $.fn.scrollspy = old
	    return this
	  }


	  // SCROLLSPY DATA-API
	  // ==================

	  $(window).on('load.bs.scrollspy.data-api', function () {
	    $('[data-spy="scroll"]').each(function () {
	      var $spy = $(this)
	      Plugin.call($spy, $spy.data())
	    })
	  })

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: tab.js v3.3.7
	 * http://getbootstrap.com/javascript/#tabs
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // TAB CLASS DEFINITION
	  // ====================

	  var Tab = function (element) {
	    // jscs:disable requireDollarBeforejQueryAssignment
	    this.element = $(element)
	    // jscs:enable requireDollarBeforejQueryAssignment
	  }

	  Tab.VERSION = '3.3.7'

	  Tab.TRANSITION_DURATION = 150

	  Tab.prototype.show = function () {
	    var $this    = this.element
	    var $ul      = $this.closest('ul:not(.dropdown-menu)')
	    var selector = $this.data('target')

	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }

	    if ($this.parent('li').hasClass('active')) return

	    var $previous = $ul.find('.active:last a')
	    var hideEvent = $.Event('hide.bs.tab', {
	      relatedTarget: $this[0]
	    })
	    var showEvent = $.Event('show.bs.tab', {
	      relatedTarget: $previous[0]
	    })

	    $previous.trigger(hideEvent)
	    $this.trigger(showEvent)

	    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

	    var $target = $(selector)

	    this.activate($this.closest('li'), $ul)
	    this.activate($target, $target.parent(), function () {
	      $previous.trigger({
	        type: 'hidden.bs.tab',
	        relatedTarget: $this[0]
	      })
	      $this.trigger({
	        type: 'shown.bs.tab',
	        relatedTarget: $previous[0]
	      })
	    })
	  }

	  Tab.prototype.activate = function (element, container, callback) {
	    var $active    = container.find('> .active')
	    var transition = callback
	      && $.support.transition
	      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

	    function next() {
	      $active
	        .removeClass('active')
	        .find('> .dropdown-menu > .active')
	          .removeClass('active')
	        .end()
	        .find('[data-toggle="tab"]')
	          .attr('aria-expanded', false)

	      element
	        .addClass('active')
	        .find('[data-toggle="tab"]')
	          .attr('aria-expanded', true)

	      if (transition) {
	        element[0].offsetWidth // reflow for transition
	        element.addClass('in')
	      } else {
	        element.removeClass('fade')
	      }

	      if (element.parent('.dropdown-menu').length) {
	        element
	          .closest('li.dropdown')
	            .addClass('active')
	          .end()
	          .find('[data-toggle="tab"]')
	            .attr('aria-expanded', true)
	      }

	      callback && callback()
	    }

	    $active.length && transition ?
	      $active
	        .one('bsTransitionEnd', next)
	        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
	      next()

	    $active.removeClass('in')
	  }


	  // TAB PLUGIN DEFINITION
	  // =====================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.tab')

	      if (!data) $this.data('bs.tab', (data = new Tab(this)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  var old = $.fn.tab

	  $.fn.tab             = Plugin
	  $.fn.tab.Constructor = Tab


	  // TAB NO CONFLICT
	  // ===============

	  $.fn.tab.noConflict = function () {
	    $.fn.tab = old
	    return this
	  }


	  // TAB DATA-API
	  // ============

	  var clickHandler = function (e) {
	    e.preventDefault()
	    Plugin.call($(this), 'show')
	  }

	  $(document)
	    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
	    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

	}(jQuery);

	/* ========================================================================
	 * Bootstrap: affix.js v3.3.7
	 * http://getbootstrap.com/javascript/#affix
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */


	+function ($) {
	  'use strict';

	  // AFFIX CLASS DEFINITION
	  // ======================

	  var Affix = function (element, options) {
	    this.options = $.extend({}, Affix.DEFAULTS, options)

	    this.$target = $(this.options.target)
	      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
	      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

	    this.$element     = $(element)
	    this.affixed      = null
	    this.unpin        = null
	    this.pinnedOffset = null

	    this.checkPosition()
	  }

	  Affix.VERSION  = '3.3.7'

	  Affix.RESET    = 'affix affix-top affix-bottom'

	  Affix.DEFAULTS = {
	    offset: 0,
	    target: window
	  }

	  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
	    var scrollTop    = this.$target.scrollTop()
	    var position     = this.$element.offset()
	    var targetHeight = this.$target.height()

	    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

	    if (this.affixed == 'bottom') {
	      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
	      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
	    }

	    var initializing   = this.affixed == null
	    var colliderTop    = initializing ? scrollTop : position.top
	    var colliderHeight = initializing ? targetHeight : height

	    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
	    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

	    return false
	  }

	  Affix.prototype.getPinnedOffset = function () {
	    if (this.pinnedOffset) return this.pinnedOffset
	    this.$element.removeClass(Affix.RESET).addClass('affix')
	    var scrollTop = this.$target.scrollTop()
	    var position  = this.$element.offset()
	    return (this.pinnedOffset = position.top - scrollTop)
	  }

	  Affix.prototype.checkPositionWithEventLoop = function () {
	    setTimeout($.proxy(this.checkPosition, this), 1)
	  }

	  Affix.prototype.checkPosition = function () {
	    if (!this.$element.is(':visible')) return

	    var height       = this.$element.height()
	    var offset       = this.options.offset
	    var offsetTop    = offset.top
	    var offsetBottom = offset.bottom
	    var scrollHeight = Math.max($(document).height(), $(document.body).height())

	    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
	    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
	    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

	    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

	    if (this.affixed != affix) {
	      if (this.unpin != null) this.$element.css('top', '')

	      var affixType = 'affix' + (affix ? '-' + affix : '')
	      var e         = $.Event(affixType + '.bs.affix')

	      this.$element.trigger(e)

	      if (e.isDefaultPrevented()) return

	      this.affixed = affix
	      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

	      this.$element
	        .removeClass(Affix.RESET)
	        .addClass(affixType)
	        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
	    }

	    if (affix == 'bottom') {
	      this.$element.offset({
	        top: scrollHeight - height - offsetBottom
	      })
	    }
	  }


	  // AFFIX PLUGIN DEFINITION
	  // =======================

	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.affix')
	      var options = typeof option == 'object' && option

	      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  var old = $.fn.affix

	  $.fn.affix             = Plugin
	  $.fn.affix.Constructor = Affix


	  // AFFIX NO CONFLICT
	  // =================

	  $.fn.affix.noConflict = function () {
	    $.fn.affix = old
	    return this
	  }


	  // AFFIX DATA-API
	  // ==============

	  $(window).on('load', function () {
	    $('[data-spy="affix"]').each(function () {
	      var $spy = $(this)
	      var data = $spy.data()

	      data.offset = data.offset || {}

	      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
	      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

	      Plugin.call($spy, data)
	    })
	  })

	}(jQuery);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14)))

/***/ })
/******/ ]);