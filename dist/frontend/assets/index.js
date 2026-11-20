// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes)
				if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true,
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/constants.js
/** Reset all mode flags */
var RESET_MODE = -161;
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
var XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
var MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
var EMPTY_OBJ = {};
var EMPTY_ARR = [];
var MATHML_TOKEN_ELEMENTS = /^m(i|n|o|s|text|space)$/;
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/util.js
var isArray$1 = Array.isArray;
var slice = EMPTY_ARR.slice;
var assign$1 = Object.assign;
/**
 * Remove a child node from its parent if attached.
 * @param {import('./internal').PreactElement | null} node The node to remove
 */
function removeNode(node) {
	if (node && node.parentNode) node.remove();
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/diff/catch-error.js
/**
 * Find the closest error boundary to a thrown error and call it
 * @param {object} error The thrown value
 * @param {import('../internal').VNode} vnode The vnode that threw the error that was caught (except
 * for unmounting when this parameter is the highest parent that was being
 * unmounted)
 * @param {import('../internal').VNode} [oldVNode]
 * @param {import('../internal').ErrorInfo} [errorInfo]
 */
function _catchError(error, vnode, oldVNode, errorInfo) {
	/** @type {import('../internal').Component} */
	let component, ctor, handled;
	for (; (vnode = vnode._parent);)
		if ((component = vnode._component) && !(component._bits & 1)) {
			component._bits |= 4;
			try {
				ctor = component.constructor;
				if (ctor && ctor.getDerivedStateFromError) {
					component.setState(ctor.getDerivedStateFromError(error));
					handled = component._bits & 8;
				}
				if (component.componentDidCatch) {
					component.componentDidCatch(error, errorInfo || {});
					handled = component._bits & 8;
				}
				if (handled) {
					component._bits |= 2;
					return;
				}
			} catch (e) {
				error = e;
				handled = 0;
			}
		}
	resetRenderCount();
	throw error;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/options.js
/**
 * The `option` object can potentially contain callback functions
 * that are called during various stages of our renderer. This is the
 * foundation on which all our addons like `preact/debug`, `preact/compat`,
 * and `preact/hooks` are based on. See the `Options` type in `internal.d.ts`
 * for a full list of available option hooks (most editors/IDEs allow you to
 * ctrl+click or cmd+click on mac the type definition below).
 * @type {import('./internal').Options}
 */
var options$1 = { _catchError };
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/create-element.js
var vnodeId$1 = 0;
/**
 * Create an virtual node (used for JSX)
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor for this
 * virtual node
 * @param {object | null | undefined} [props] The properties of the virtual node
 * @param {Array<import('.').ComponentChildren>} [children] The children of the
 * virtual node
 * @returns {import('./internal').VNode}
 */
function createElement(type, props, children) {
	let normalizedProps = {},
		key,
		ref,
		i,
		length = arguments.length;
	for (i in props)
		if (i == "key") key = props[i];
		else if (i == "ref" && typeof type != "function") ref = props[i];
		else normalizedProps[i] = props[i];
	if (length > 2) normalizedProps.children = length > 3 ? slice.call(arguments, 2) : children;
	return createVNode$1(type, normalizedProps, key, ref, null);
}
/**
 * Clones the given VNode, optionally adding attributes/props and replacing its
 * children.
 * @param {import('./internal').VNode} vnode The virtual DOM element to clone
 * @param {object} props Attributes/props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} children Any additional arguments will be used
 * as replacement children.
 * @returns {import('./internal').VNode}
 */
function cloneElement$1(vnode, props, children) {
	let normalizedProps = assign$1({}, vnode.props),
		key,
		ref,
		i,
		length = arguments.length;
	for (i in props)
		if (i == "key") key = props[i];
		else if (i == "ref" && typeof vnode.type != "function") ref = props[i];
		else normalizedProps[i] = props[i];
	if (length > 2) normalizedProps.children = length > 3 ? slice.call(arguments, 2) : children;
	return createVNode$1(
		vnode.type,
		normalizedProps,
		key !== void 0 ? key : vnode.key,
		ref !== void 0 ? ref : vnode.ref,
		null,
	);
}
/**
 * Create a VNode (used internally by Preact)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * Constructor for this virtual node
 * @param {object | string | number | null} props The properties of this virtual node.
 * If this virtual node represents a text node, this is the text of the node (string or number).
 * @param {string | number | null} key The key for this virtual node, used when
 * diffing it against its children
 * @param {import('./internal').VNode["ref"]} ref The ref property that will
 * receive a reference to its created child
 * @returns {import('./internal').VNode}
 */
function createVNode$1(type, props, key, ref, original) {
	/** @type {import('./internal').VNode} */
	const vnode = {
		type,
		props,
		key,
		ref,
		_children: null,
		_parent: null,
		_depth: 0,
		_dom: null,
		_component: null,
		constructor: void 0,
		_original: original || ++vnodeId$1,
		_index: -1,
		_flags: 0,
	};
	if (!original && options$1.vnode) options$1.vnode(vnode);
	return vnode;
}
function createRef() {
	return { current: null };
}
function Fragment(props) {
	return props.children;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/component.js
/**
 * Base Component class. Provides `setState()` and `forceUpdate()`, which
 * trigger rendering
 * @param {object} props The initial component props
 * @param {object} context The initial context from parent components'
 * getChildContext
 */
function BaseComponent(props, context) {
	this.props = props;
	this.context = context;
	this._bits = 0;
}
/**
 * Update component state and schedule a re-render.
 * @this {import('./internal').Component}
 * @param {object | ((s: object, p: object) => object)} update A hash of state
 * properties to update with new values or a function that given the current
 * state and props returns a new partial state
 * @param {() => void} [callback] A function to be called once component state is
 * updated
 */
BaseComponent.prototype.setState = function (update, callback) {
	let s = this._nextState;
	if (!s || s == this.state) s = this._nextState = assign$1({}, this.state);
	if (typeof update == "function") update = update(assign$1({}, s), this.props);
	if (update) assign$1(s, update);
	else return;
	if (this._vnode) {
		if (callback) this._stateCallbacks.push(callback);
		enqueueRender(this);
	}
};
/**
 * Immediately perform a synchronous re-render of the component
 * @this {import('./internal').Component}
 * @param {() => void} [callback] A function to be called after component is
 * re-rendered
 */
BaseComponent.prototype.forceUpdate = function (callback) {
	if (this._vnode) {
		this._bits |= 4;
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this);
	}
};
/**
 * Accepts `props` and `state`, and returns a new Virtual DOM tree to build.
 * Virtual DOM is generally constructed via [JSX](https://jasonformat.com/wtf-is-jsx).
 * @param {object} props Props (eg: JSX attributes) received from parent
 * element/component
 * @param {object} state The component's current state
 * @param {object} context Context object, as returned by the nearest
 * ancestor's `getChildContext()`
 * @returns {ComponentChildren | void}
 */
BaseComponent.prototype.render = Fragment;
/**
 * @param {import('./internal').VNode} vnode
 * @param {number | null} [childIndex]
 */
function getDomSibling(vnode, childIndex) {
	if (childIndex == null) return vnode._parent ? getDomSibling(vnode._parent, vnode._index + 1) : null;
	let sibling;
	for (; childIndex < vnode._children.length; childIndex++) {
		sibling = vnode._children[childIndex];
		if (sibling && sibling._dom) return sibling._dom;
	}
	return typeof vnode.type == "function" && !vnode.props._parentDom ? getDomSibling(vnode) : null;
}
/**
 * Trigger in-place re-rendering of a component.
 * @param {import('./internal').Component} component The component to rerender
 */
function renderComponent(component) {
	const oldVNode = component._vnode,
		oldDom = oldVNode._dom,
		commitQueue = [],
		refQueue = [];
	const parentDom = component._parentDom;
	if (parentDom) {
		const newVNode = assign$1({ constructor: void 0 }, oldVNode);
		newVNode._original = oldVNode._original + 1;
		if (options$1.vnode) options$1.vnode(newVNode);
		diff(
			parentDom,
			newVNode,
			oldVNode,
			component._globalContext,
			parentDom.namespaceURI,
			oldVNode._flags & 32 ? [oldDom] : null,
			commitQueue,
			oldDom || getDomSibling(oldVNode),
			oldVNode._flags & 32,
			refQueue,
		);
		newVNode._original = oldVNode._original;
		newVNode._parent._children[newVNode._index] = newVNode;
		commitRoot(commitQueue, newVNode, refQueue);
		oldVNode._parent = oldVNode._dom = null;
		if (newVNode._dom != oldDom) updateParentDomPointers(newVNode);
	}
}
/**
 * @param {import('./internal').VNode} vnode
 */
function updateParentDomPointers(vnode) {
	if ((vnode = vnode._parent) && vnode._component && !vnode.props._parentDom) {
		vnode._dom = null;
		vnode._children.some((child) => child && (vnode._dom = child._dom));
		return updateParentDomPointers(vnode);
	}
}
/**
 * The render queue
 * @type {Array<import('./internal').Component>}
 */
var rerenderQueue = [];
var prevDebounce;
var rerenderCount = 0;
function resetRenderCount() {
	rerenderCount = 0;
}
/**
 * Enqueue a rerender of a component
 * @param {import('./internal').Component} c The component to rerender
 */
function enqueueRender(c) {
	if (
		(!(c._bits & 8) && (c._bits |= 8) && rerenderQueue.push(c) && !rerenderCount++) ||
		prevDebounce != options$1.debounceRendering
	) {
		prevDebounce = options$1.debounceRendering;
		(prevDebounce || queueMicrotask)(process);
	}
}
/**
 * @param {import('./internal').Component} a
 * @param {import('./internal').Component} b
 */
var depthSort = (a, b) => a._vnode._depth - b._vnode._depth;
/** Flush the render queue by rerendering all queued components */
function process() {
	try {
		let c,
			l = 1;
		while (rerenderQueue.length) {
			if (rerenderQueue.length > l) rerenderQueue.sort(depthSort);
			c = rerenderQueue.shift();
			l = rerenderQueue.length;
			if (c._bits & 8) renderComponent(c);
		}
	} finally {
		rerenderQueue.length = rerenderCount = 0;
	}
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/diff/children.js
/**
 * @typedef {import('../internal').ComponentChildren} ComponentChildren
 * @typedef {import('../internal').Component} Component
 * @typedef {import('../internal').PreactElement} PreactElement
 * @typedef {import('../internal').VNode} VNode
 */
/**
 * Diff the children of a virtual node
 * @param {PreactElement} parentDom The DOM element whose children are being
 * diffed
 * @param {ComponentChildren[]} renderResult
 * @param {VNode} newParentVNode The new virtual node whose children should be
 * diff'ed against oldParentVNode
 * @param {VNode} oldParentVNode The old virtual node whose children should be
 * diff'ed against newParentVNode
 * @param {object} globalContext The current context object - modified by
 * getChildContext
 * @param {string} namespace Current namespace of the DOM node (HTML, SVG, or MathML)
 * @param {Array<PreactElement>} excessDomChildren
 * @param {Array<Component>} commitQueue List of components which have callbacks
 * to invoke in commitRoot
 * @param {PreactElement} oldDom The current attached DOM element any new dom
 * elements should be placed around. Likely `null` on first render (except when
 * hydrating). Can be a sibling DOM element when diffing Fragments that have
 * siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} isHydrating Whether or not we are in hydration
 * @param {any[]} refQueue an array of elements needed to invoke refs
 * @returns {PreactElement} The next sibling DOM element to insert new elements
 */
function diffChildren(
	parentDom,
	renderResult,
	newParentVNode,
	oldParentVNode,
	globalContext,
	namespace,
	excessDomChildren,
	commitQueue,
	oldDom,
	isHydrating,
	refQueue,
) {
	let i, oldVNode, childVNode, newDom, firstChildDom;
	/** @type {VNode[]} */
	let oldChildren = oldParentVNode._children || EMPTY_ARR;
	let newChildrenLength = renderResult.length;
	oldDom = constructNewChildrenArray(newParentVNode, renderResult, oldChildren, oldDom, newChildrenLength);
	for (i = 0; i < newChildrenLength; i++) {
		childVNode = newParentVNode._children[i];
		if (childVNode == null) continue;
		oldVNode = (~childVNode._index && oldChildren[childVNode._index]) || EMPTY_OBJ;
		childVNode._index = i;
		let result = diff(
			parentDom,
			childVNode,
			oldVNode,
			globalContext,
			namespace,
			excessDomChildren,
			commitQueue,
			oldDom,
			isHydrating,
			refQueue,
		);
		newDom = childVNode._dom;
		if (oldVNode.ref != childVNode.ref || oldVNode._flags & 8) {
			if (oldVNode.ref) applyRef(oldVNode.ref, null, childVNode, oldVNode);
			if (childVNode.ref) refQueue.push(childVNode.ref, childVNode._component || newDom, childVNode);
		}
		firstChildDom = firstChildDom || newDom;
		if (childVNode._flags & 4) {
			oldDom = insert(childVNode, oldDom, parentDom, !oldVNode._original);
			if (oldVNode._dom) oldVNode._dom = null;
		} else if (typeof childVNode.type == "function" && result !== void 0) oldDom = result;
		else if (newDom) oldDom = newDom.nextSibling;
		childVNode._flags &= -7;
	}
	newParentVNode._dom = firstChildDom;
	return oldDom;
}
/**
 * @param {VNode} newParentVNode
 * @param {ComponentChildren[]} renderResult
 * @param {VNode[]} oldChildren
 */
function constructNewChildrenArray(newParentVNode, renderResult, oldChildren, oldDom, newChildrenLength) {
	/** @type {number} */
	let i;
	/** @type {VNode} */
	let childVNode;
	/** @type {VNode} */
	let oldVNode;
	let oldChildrenLength = oldChildren.length,
		remainingOldChildren = oldChildrenLength;
	let skew = 0;
	/** Whether any matched child was found far from its skewed index, i.e. a
	 * real reorder happened and we need to compute the minimal set of moves. */
	let moved = false;
	/** @type {VNode[]} */
	let newChildren = (newParentVNode._children = Array(newChildrenLength));
	for (i = 0; i < newChildrenLength; i++) {
		childVNode = renderResult[i];
		if (childVNode == null || typeof childVNode == "boolean" || typeof childVNode == "function") {
			newChildren[i] = null;
			continue;
		} else if (typeof childVNode != "object" || childVNode.constructor == String)
			childVNode = newChildren[i] = createVNode$1(null, childVNode);
		else if (isArray$1(childVNode)) childVNode = newChildren[i] = createVNode$1(Fragment, { children: childVNode });
		else if (childVNode.constructor === void 0 && childVNode._depth)
			childVNode = newChildren[i] = createVNode$1(
				childVNode.type,
				childVNode.props,
				childVNode.key,
				childVNode.ref,
				childVNode._original,
			);
		else newChildren[i] = childVNode;
		const skewedIndex = i + skew;
		childVNode._parent = newParentVNode;
		childVNode._depth = newParentVNode._depth + 1;
		const matchingIndex = (childVNode._index = findMatchingIndex(
			childVNode,
			oldChildren,
			skewedIndex,
			remainingOldChildren,
		));
		oldVNode = null;
		if (~matchingIndex) {
			oldVNode = oldChildren[matchingIndex];
			remainingOldChildren--;
			if (oldVNode) oldVNode._flags |= 2;
		}
		if (!oldVNode || !oldVNode._original) {
			if (!~matchingIndex) {
				if (newChildrenLength > oldChildrenLength) skew--;
				else if (newChildrenLength < oldChildrenLength) skew++;
			}
			if (typeof childVNode.type != "function") childVNode._flags |= 4;
		} else {
			childVNode._flags |= 2;
			if (matchingIndex == skewedIndex - 1) skew--;
			else if (matchingIndex == skewedIndex + 1) skew++;
			else if (matchingIndex != skewedIndex) {
				if (matchingIndex > skewedIndex) skew--;
				else skew++;
				moved = true;
			}
		}
	}
	if (moved) {
		/** @type {number[]} tails[x] is the smallest old index ending an increasing subsequence of length x+1 */
		let tails = [];
		/** @type {number[]} length of the longest increasing subsequence ending at child i */
		let lisLengths = [];
		for (i = 0; i < newChildrenLength; i++) {
			childVNode = newChildren[i];
			if (childVNode && childVNode._flags & 2) {
				let lo = 0,
					hi = tails.length;
				while (lo < hi) {
					const mid = (lo + hi) >> 1;
					if (tails[mid] < childVNode._index) lo = mid + 1;
					else hi = mid;
				}
				tails[lo] = childVNode._index;
				lisLengths[i] = lo + 1;
			}
		}
		skew = tails.length;
		while (i--)
			if (lisLengths[i]) {
				if (lisLengths[i] == skew) skew--;
				else newChildren[i]._flags |= 4;
			}
	}
	if (remainingOldChildren)
		for (i = 0; i < oldChildrenLength; i++) {
			oldVNode = oldChildren[i];
			if (oldVNode && !(oldVNode._flags & 2)) {
				if (oldVNode._dom == oldDom) oldDom = getDomSibling(oldVNode);
				unmount(oldVNode, oldVNode);
			}
		}
	return oldDom;
}
/**
 * @param {VNode} parentVNode
 * @param {PreactElement} oldDom
 * @param {PreactElement} parentDom
 * @param {boolean} isMounting
 * @returns {PreactElement}
 */
function insert(parentVNode, oldDom, parentDom, isMounting) {
	if (typeof parentVNode.type == "function") {
		if (parentVNode.props._parentDom) return oldDom;
		let children = parentVNode._children;
		if (children) {
			for (let i = 0; i < children.length; i++)
				if (children[i]) {
					children[i]._parent = parentVNode;
					oldDom = insert(children[i], oldDom, parentDom, false);
				}
		}
		return oldDom;
	} else {
		if (oldDom && !oldDom.parentNode) {
			oldDom = getDomSibling(parentVNode);
			if (oldDom && !oldDom.parentNode) oldDom = null;
		}
		let next = oldDom;
		while (next && next.nodeType == 8) next = next.nextSibling;
		if (parentVNode._dom != next) {
			if (!isMounting && parentDom.moveBefore && parentVNode._dom.parentNode)
				parentDom.moveBefore(parentVNode._dom, oldDom);
			else parentDom.insertBefore(parentVNode._dom, oldDom || null);
		}
		oldDom = parentVNode._dom;
	}
	while ((oldDom = oldDom && oldDom.nextSibling) && oldDom.nodeType == 8);
	return oldDom;
}
/**
 * Flatten and loop through the children of a virtual node
 * @param {ComponentChildren} children The unflattened children of a virtual
 * node
 * @returns {VNode[]}
 */
function toChildArray(children, out) {
	out = out || [];
	if (children != null && typeof children != "boolean") {
		if (isArray$1(children))
			children.some((child) => {
				toChildArray(child, out);
			});
		else out.push(children);
	}
	return out;
}
/**
 * @param {VNode} childVNode
 * @param {VNode[]} oldChildren
 * @param {number} skewedIndex
 * @param {number} remainingOldChildren
 * @returns {number}
 */
function findMatchingIndex(childVNode, oldChildren, skewedIndex, remainingOldChildren) {
	const key = childVNode.key;
	const type = childVNode.type;
	let oldVNode = oldChildren[skewedIndex];
	const matched = oldVNode && !(oldVNode._flags & 2);
	let shouldSearch = remainingOldChildren > (matched ? 1 : 0);
	if ((oldVNode === null && key == null) || (matched && key == oldVNode.key && type == oldVNode.type))
		return skewedIndex;
	else if (shouldSearch) {
		let x = skewedIndex - 1;
		let y = skewedIndex + 1;
		while (x >= 0 || y < oldChildren.length) {
			const childIndex = x >= 0 ? x-- : y++;
			oldVNode = oldChildren[childIndex];
			if (oldVNode && !(oldVNode._flags & 2) && key == oldVNode.key && type == oldVNode.type) return childIndex;
		}
	}
	return -1;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/diff/props.js
var EVENT_DISPATCHED = Symbol();
function setStyle(style, key, value) {
	if (value == null) value = "";
	if (key[0] == "-") style.setProperty(key, value);
	else style[key] = value;
}
var CAPTURE_REGEX = /(PointerCapture)$|Capture$/i;
var eventClock = 0;
/**
 * Set a property value on a DOM node
 * @param {import('../internal').PreactElement} dom The DOM node to modify
 * @param {string} name The name of the property to set
 * @param {*} value The value to set the property to
 * @param {*} oldValue The old value the property had
 * @param {string} namespace Whether or not this DOM node is an SVG node or not
 */
function setProperty(dom, name, value, oldValue, namespace) {
	let useCapture;
	o: if (name == "style") {
		if (typeof value == "string") dom.style.cssText = value;
		else {
			if (typeof oldValue == "string") dom.style.cssText = oldValue = "";
			if (oldValue) {
				for (name in oldValue) if (!(value && name in value)) setStyle(dom.style, name, "");
			}
			if (value) {
				for (name in value) if (!oldValue || value[name] != oldValue[name]) setStyle(dom.style, name, value[name]);
			}
		}
	} else if (name[0] == "o" && name[1] == "n") {
		(dom._listeners || (dom._listeners = {}))[name] = value;
		if (!value || !oldValue) {
			const proxy = eventProxies[name] || (eventProxies[name] = createEventProxy(name));
			(dom._attached || (dom._attached = {}))[name] = eventClock;
			useCapture = name != (name = name.replace(CAPTURE_REGEX, "$1"));
			name = name.slice(2);
			if (name[0] < "a") name = name.toLowerCase();
			if (value) dom.addEventListener(name, proxy, useCapture);
			else dom.removeEventListener(name, proxy, useCapture);
		}
	} else {
		if (namespace == "http://www.w3.org/2000/svg") name = name.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if (
			name != "width" &&
			name != "height" &&
			name != "href" &&
			name != "list" &&
			name != "form" &&
			name != "tabIndex" &&
			name != "download" &&
			name != "rowSpan" &&
			name != "colSpan" &&
			name != "role" &&
			name != "popover" &&
			name in dom
		)
			try {
				dom[name] = value == null ? "" : value;
				break o;
			} catch (e) {}
		if (typeof value == "function") {
		} else if (value != null && (value !== false || name[4] == "-"))
			dom.setAttribute(name, name == "popover" && value == true ? "" : value);
		else dom.removeAttribute(name);
	}
}
/**
 * Create an event proxy function.
 * @param {string} name The prop name the handler is stored under.
 * @private
 */
function createEventProxy(name) {
	/**
	 * Proxy an event to hooked event handlers
	 * @param {import('../internal').PreactEvent} e The event object from the browser
	 * @private
	 */
	return function (e) {
		if (this._listeners) {
			const eventHandler = this._listeners[name];
			if (e[EVENT_DISPATCHED] == null) e[EVENT_DISPATCHED] = eventClock++;
			else if (e[EVENT_DISPATCHED] < this._attached[name]) return;
			return eventHandler(options$1.event ? options$1.event(e) : e);
		}
	};
}
/** @type {Record<string, (e: Event) => any>} */
var eventProxies = {};
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/diff/index.js
/**
 * @typedef {import('../internal').ComponentType} ComponentType
 * @typedef {import('../internal').ComponentChildren} ComponentChildren
 * @typedef {import('../internal').Component} Component
 * @typedef {import('../internal').PreactElement} PreactElement
 * @typedef {import('../internal').VNode} VNode
 */
/**
 * @template {any} T
 * @typedef {import('../internal').Ref<T>} Ref<T>
 */
/**
 * Diff two virtual nodes and apply proper changes to the DOM
 * @param {PreactElement} parentDom The parent of the DOM element
 * @param {VNode} newVNode The new virtual node
 * @param {VNode} oldVNode The old virtual node
 * @param {object} globalContext The current context object. Modified by
 * getChildContext
 * @param {string} namespace Current namespace of the DOM node (HTML, SVG, or MathML)
 * @param {Array<PreactElement>} excessDomChildren
 * @param {Array<Component>} commitQueue List of components which have callbacks
 * to invoke in commitRoot
 * @param {PreactElement} oldDom The current attached DOM element any new dom
 * elements should be placed around. Likely `null` on first render (except when
 * hydrating). Can be a sibling DOM element when diffing Fragments that have
 * siblings. In most cases, it starts out as `oldChildren[0]._dom`.
 * @param {boolean} isHydrating Whether or not we are in hydration
 * @param {any[]} refQueue an array of elements needed to invoke refs
 */
function diff(
	parentDom,
	newVNode,
	oldVNode,
	globalContext,
	namespace,
	excessDomChildren,
	commitQueue,
	oldDom,
	isHydrating,
	refQueue,
) {
	/** @type {any} */
	let tmp,
		resumed,
		newType = newVNode.type;
	if (newVNode.constructor !== void 0) return null;
	if (oldVNode._flags & 128 && ((isHydrating = oldVNode._flags & 32), (tmp = oldVNode._component._excess))) {
		newVNode._flags |= isHydrating;
		resumed = excessDomChildren = [];
		if (tmp.nodeType == 8)
			for (let depth = 1, node = tmp.nextSibling; node; node = node.nextSibling) {
				if (node.nodeType == 8) {
					if (node.data.startsWith("$s")) depth++;
					else if (node.data.startsWith("/$s") && !--depth) break;
				}
				excessDomChildren.push(node);
			}
		else excessDomChildren.push(tmp);
		oldDom = excessDomChildren[0];
	}
	if ((tmp = options$1._diff)) tmp(newVNode);
	outer: if (typeof newType == "function") {
		let oldCommitQueueLength = commitQueue.length;
		try {
			let c,
				oldProps,
				oldState,
				snapshot,
				newProps = newVNode.props;
			const isClassComponent = (tmp = newType.prototype) && tmp.render;
			tmp = newType.contextType;
			const provider = tmp && globalContext[tmp._id];
			const componentContext = tmp ? (provider ? provider.props.value : tmp._defaultValue) : globalContext;
			if (oldVNode._component) {
				c = newVNode._component = oldVNode._component;
				if (c._bits & 2) c._bits |= 1;
			} else {
				if (isClassComponent) newVNode._component = c = new newType(newProps, componentContext);
				else {
					newVNode._component = c = new BaseComponent(newProps, componentContext);
					c.constructor = newType;
					c.render = doRender;
				}
				if (provider) provider.sub(c);
				if (!c.state) c.state = {};
				c._globalContext = globalContext;
				c._bits |= 8;
				c._renderCallbacks = [];
				c._stateCallbacks = [];
			}
			if (isClassComponent) {
				if (!c._nextState) c._nextState = c.state;
				if (newType.getDerivedStateFromProps) {
					if (c._nextState == c.state) c._nextState = assign$1({}, c._nextState);
					assign$1(c._nextState, newType.getDerivedStateFromProps(newProps, c._nextState));
				}
			}
			oldProps = c.props;
			oldState = c.state;
			c._vnode = newVNode;
			if (!oldVNode._component) {
				if (isClassComponent && !newType.getDerivedStateFromProps && c.componentWillMount) c.componentWillMount();
				if (isClassComponent && c.componentDidMount) c._renderCallbacks.push(c.componentDidMount);
			} else {
				if (
					isClassComponent &&
					!newType.getDerivedStateFromProps &&
					newProps !== oldProps &&
					c.componentWillReceiveProps
				)
					c.componentWillReceiveProps(newProps, componentContext);
				if (
					(newVNode._original == oldVNode._original && !(c._bits & 8)) ||
					(!(c._bits & 4) &&
						c.shouldComponentUpdate &&
						c.shouldComponentUpdate(newProps, c._nextState, componentContext) === false)
				) {
					if (newVNode._original != oldVNode._original) {
						c.props = newProps;
						c.state = c._nextState;
						c._bits &= -9;
					}
					newVNode._dom = oldVNode._dom;
					newVNode._children = oldVNode._children;
					newVNode._children.some((vnode) => {
						if (vnode) vnode._parent = newVNode;
					});
					EMPTY_ARR.push.apply(c._renderCallbacks, c._stateCallbacks);
					c._stateCallbacks = [];
					if (c._renderCallbacks.length) commitQueue.push(c);
					oldDom = getDomSibling(oldVNode);
					break outer;
				}
				if (c.componentWillUpdate) c.componentWillUpdate(newProps, c._nextState, componentContext);
				if (isClassComponent && c.componentDidUpdate)
					c._renderCallbacks.push(() => {
						c.componentDidUpdate(oldProps, oldState, snapshot);
					});
			}
			c.context = componentContext;
			c.props = newProps;
			c._parentDom = parentDom;
			c._bits &= -5;
			let renderHook = options$1._render,
				count = 0;
			if (isClassComponent) {
				c.state = c._nextState;
				c._bits &= -9;
				if (renderHook) renderHook(newVNode);
				tmp = c.render(c.props, c.state, c.context);
				EMPTY_ARR.push.apply(c._renderCallbacks, c._stateCallbacks);
				c._stateCallbacks = [];
			} else
				do {
					c._bits &= -9;
					if (renderHook) renderHook(newVNode);
					tmp = c.render(c.props, c.state, c.context);
					c.state = c._nextState;
				} while (c._bits & 8 && ++count < 25);
			c.state = c._nextState;
			if (c.getChildContext) globalContext = assign$1({}, globalContext, c.getChildContext());
			if (isClassComponent && oldVNode._component && c.getSnapshotBeforeUpdate)
				snapshot = c.getSnapshotBeforeUpdate(oldProps, oldState);
			const renderResult = tmp && tmp.type === Fragment && tmp.key == null ? tmp.props.children : tmp;
			if (newProps._parentDom) {
				tmp = oldDom;
				parentDom = newProps._parentDom;
				namespace = parentDom.namespaceURI;
				isHydrating = excessDomChildren = null;
				if (oldVNode.props && oldVNode.props._parentDom != parentDom) {
					/** @type {VNode[]} */ oldVNode._children.some((child) => {
						if (child) unmount(child, child);
					});
					oldVNode._children = null;
				}
				oldDom = oldVNode._children ? getDomSibling(oldVNode, 0) : null;
			}
			oldDom = diffChildren(
				parentDom,
				isArray$1(renderResult) ? renderResult : [renderResult],
				newVNode,
				oldVNode,
				globalContext,
				namespace,
				excessDomChildren,
				commitQueue,
				oldDom,
				isHydrating,
				refQueue,
			);
			if (newProps._parentDom) {
				newVNode._dom = null;
				oldDom = tmp;
			}
			newVNode._flags &= RESET_MODE;
			if (oldVNode._flags & 128) c._excess = null;
			if (resumed) resumed.some(removeNode);
			if (c._renderCallbacks.length) commitQueue.push(c);
			if (c._bits & 1) c._bits &= -4;
		} catch (e) {
			commitQueue.length = oldCommitQueueLength;
			newVNode._original = null;
			if (isHydrating || excessDomChildren) {
				if (e.then) {
					let commentMarkersToFind = 0,
						startMarker;
					newVNode._flags |= isHydrating ? 160 : 128;
					if (excessDomChildren) {
						let i = excessDomChildren.indexOf(oldDom || void 0),
							child;
						if (!~i) i = excessDomChildren.length;
						while ((child = excessDomChildren[i - 1]) && child.nodeType == 8) i--;
						for (; i < excessDomChildren.length; i++) {
							child = excessDomChildren[i];
							if (!child) continue;
							excessDomChildren[i] = null;
							if (child.nodeType == 8) {
								if (child.data.startsWith("$s")) {
									if (!commentMarkersToFind++) startMarker = child;
								} else if (commentMarkersToFind && child.data.startsWith("/$s") && !--commentMarkersToFind) {
									oldDom = child;
									break;
								}
							} else if (!commentMarkersToFind) break;
						}
					}
					if (!startMarker) {
						while (oldDom && oldDom.nodeType == 8 && oldDom.nextSibling) oldDom = oldDom.nextSibling;
						startMarker = oldDom;
					}
					if (!newVNode._component._excess) newVNode._component._excess = startMarker;
					newVNode._dom = oldDom;
				} else if (excessDomChildren) excessDomChildren.some(removeNode);
			} else newVNode._dom = oldVNode._dom;
			if (!newVNode._children) newVNode._children = oldVNode._children || [];
			if (!e.then) markAsForce(newVNode);
			options$1._catchError(e, newVNode, oldVNode);
		}
	} else
		oldDom = newVNode._dom = diffElementNodes(
			oldVNode._dom,
			newVNode,
			oldVNode,
			globalContext,
			namespace,
			excessDomChildren,
			commitQueue,
			isHydrating,
			refQueue,
			parentDom,
		);
	if ((tmp = options$1.diffed)) tmp(newVNode);
	return newVNode._flags & 128 ? void 0 : oldDom;
}
function markAsForce(vnode) {
	if (vnode) {
		if (vnode._component) vnode._component._bits |= 4;
		if (vnode._children) vnode._children.some(markAsForce);
	}
}
/**
 * @param {Array<Component>} commitQueue List of components
 * which have callbacks to invoke in commitRoot
 * @param {VNode} root
 */
function commitRoot(commitQueue, root, refQueue) {
	for (let i = 0; i < refQueue.length;) applyRef(refQueue[i++], refQueue[i++], refQueue[i++]);
	if (options$1._commit) options$1._commit(root, commitQueue);
	commitQueue.some((c) => {
		try {
			commitQueue = c._renderCallbacks;
			c._renderCallbacks = [];
			commitQueue.some((cb) => {
				cb.call(c);
			});
		} catch (e) {
			options$1._catchError(e, c._vnode);
		}
	});
}
/**
 * Diff two virtual nodes representing DOM element
 * @param {PreactElement} dom The DOM element representing the virtual nodes
 * being diffed
 * @param {VNode} newVNode The new virtual node
 * @param {VNode} oldVNode The old virtual node
 * @param {object} globalContext The current context object
 * @param {string} namespace Current namespace of the DOM node (HTML, SVG, or MathML)
 * @param {Array<PreactElement>} excessDomChildren
 * @param {Array<Component>} commitQueue List of components which have callbacks
 * to invoke in commitRoot
 * @param {boolean} isHydrating Whether or not we are in hydration
 * @param {any[]} refQueue an array of elements needed to invoke refs
 * @param {PreactElement} parentDom The parent this element will be inserted
 * into; new nodes are created from its ownerDocument (e.g. iframes), or from
 * the global document for containers that don't have one
 * @returns {PreactElement}
 */
function diffElementNodes(
	dom,
	newVNode,
	oldVNode,
	globalContext,
	namespace,
	excessDomChildren,
	commitQueue,
	isHydrating,
	refQueue,
	parentDom,
) {
	let oldProps = oldVNode.props || EMPTY_OBJ;
	const newProps = newVNode.props;
	const nodeType = newVNode.type;
	/** @type {any} */
	let i;
	/** @type {{ __html?: string }} */
	let newHtml;
	/** @type {{ __html?: string }} */
	let oldHtml;
	/** @type {ComponentChildren} */
	let newChildren;
	let value;
	let inputValue;
	let checked;
	if (nodeType == "svg") namespace = SVG_NAMESPACE;
	else if (nodeType == "math") namespace = MATH_NAMESPACE;
	else if (!namespace) namespace = XHTML_NAMESPACE;
	if (excessDomChildren)
		for (i = 0; i < excessDomChildren.length; i++) {
			value = excessDomChildren[i];
			if (value && (nodeType ? value.localName == nodeType : value.nodeType == 3)) {
				dom = value;
				excessDomChildren[i] = null;
				break;
			}
		}
	if (!dom) {
		const doc = parentDom.ownerDocument || document;
		if (!nodeType) return doc.createTextNode(newProps);
		dom = doc.createElementNS(namespace, nodeType, newProps.is && newProps);
		if (isHydrating) {
			if (options$1._hydrationMismatch) options$1._hydrationMismatch(newVNode, excessDomChildren);
			isHydrating = false;
		}
		excessDomChildren = null;
	}
	if (!nodeType) {
		if (oldProps !== newProps && (!isHydrating || dom.data != newProps)) dom.data = newProps;
	} else {
		parentDom = nodeType == "template" ? dom.content : dom;
		excessDomChildren =
			nodeType == "textarea" && newProps.defaultValue != null
				? null
				: excessDomChildren && slice.call(parentDom.childNodes);
		if (!isHydrating && excessDomChildren) {
			oldProps = {};
			for (i = 0; i < dom.attributes.length; i++) {
				value = dom.attributes[i];
				oldProps[value.name] = value.value;
			}
		}
		for (i in oldProps) {
			value = oldProps[i];
			if (i == "dangerouslySetInnerHTML") oldHtml = value;
			else if (
				i != "children" &&
				!(i in newProps) &&
				!(i == "value" && "defaultValue" in newProps) &&
				!(i == "checked" && "defaultChecked" in newProps)
			)
				setProperty(dom, i, null, value, namespace);
		}
		const shouldRevalidateProps = oldVNode._flags & 1;
		for (i in newProps) {
			value = newProps[i];
			if (i == "children") newChildren = value;
			else if (i == "dangerouslySetInnerHTML") newHtml = value;
			else if (i == "value") inputValue = value;
			else if (i == "checked") checked = value;
			else if (
				(!isHydrating || typeof value == "function") &&
				(oldProps[i] !== value || (shouldRevalidateProps && value != null))
			)
				setProperty(dom, i, value, oldProps[i], namespace);
		}
		if (newHtml) {
			if (!isHydrating && (!oldHtml || (newHtml.__html != oldHtml.__html && newHtml.__html != dom.innerHTML)))
				dom.innerHTML = newHtml.__html;
			newVNode._children = [];
		} else {
			if (oldHtml) dom.textContent = "";
			if (
				nodeType == "foreignObject" ||
				(namespace == "http://www.w3.org/1998/Math/MathML" && MATHML_TOKEN_ELEMENTS.test(nodeType))
			)
				namespace = XHTML_NAMESPACE;
			diffChildren(
				parentDom,
				isArray$1(newChildren) ? newChildren : [newChildren],
				newVNode,
				oldVNode,
				globalContext,
				namespace,
				excessDomChildren,
				commitQueue,
				excessDomChildren ? excessDomChildren[0] : oldVNode._children && getDomSibling(oldVNode, 0),
				isHydrating,
				refQueue,
			);
			if (excessDomChildren) excessDomChildren.some(removeNode);
		}
		if (!isHydrating || nodeType == "textarea") {
			i = "value";
			if (nodeType == "progress" && inputValue == null) dom.removeAttribute(i);
			else if (inputValue != void 0 && (inputValue !== dom[i] || (nodeType == "progress" && !inputValue)))
				setProperty(dom, i, inputValue, oldProps[i], namespace);
			i = "checked";
			if (checked != void 0 && checked != dom[i]) setProperty(dom, i, checked, oldProps[i], namespace);
		}
	}
	return dom;
}
/**
 * Invoke or update a ref, depending on whether it is a function or object ref.
 * @param {Ref<any>} ref
 * @param {any} value The element or component to attach, or `null` to detach
 * @param {VNode} vnode
 * @param {any} [owner] The vnode the ref is detached from
 */
function applyRef(ref, value, vnode, owner) {
	try {
		if (typeof ref == "function") {
			if (value) value._refCleanup = ref(value) || 1;
			else if (owner && (owner = owner._component || owner._dom) && (value = owner._refCleanup)) {
				owner._refCleanup = null;
				if (typeof value == "function") value();
				else ref(null);
			}
		} else ref.current = value;
	} catch (e) {
		options$1._catchError(e, vnode);
	}
}
/**
 * Unmount a virtual node from the tree and apply DOM changes
 * @param {VNode} vnode The virtual node to unmount
 * @param {VNode} parentVNode The parent of the VNode that initiated the unmount
 * @param {boolean} [skipRemove] Flag that indicates that a parent node of the
 * current element is already detached from the DOM.
 */
function unmount(vnode, parentVNode, skipRemove) {
	let r;
	if (options$1.unmount) options$1.unmount(vnode);
	if ((r = vnode.ref) && (!r.current || r.current == vnode._dom)) applyRef(r, null, parentVNode, vnode);
	if ((r = vnode._component)) {
		if (r.componentWillUnmount)
			try {
				r.componentWillUnmount();
			} catch (e) {
				options$1._catchError(e, parentVNode);
			}
		r._parentDom = r._globalContext = null;
	}
	if ((r = vnode._children)) {
		for (let i = 0; i < r.length; i++)
			if (r[i])
				unmount(r[i], parentVNode, typeof vnode.type == "function" ? skipRemove && !vnode.props._parentDom : true);
	}
	if ((r = vnode._dom)) {
		if (!skipRemove) removeNode(r);
		if (r._listeners) r._listeners = null;
	}
	vnode._dom = vnode._component = vnode._parent = null;
}
/** The `.render()` method for a PFC backing instance. */
function doRender(props, state, context) {
	return this.constructor(props, context);
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/render.js
/**
 * Render a Preact virtual node into a DOM element
 * @param {import('./internal').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to render into
 */
function render$1(vnode, parentDom) {
	if (options$1._root) options$1._root(vnode, parentDom);
	if (parentDom.nodeType == 9) parentDom = parentDom.documentElement;
	let isHydrating = vnode && vnode._flags & 32;
	let oldVNode = isHydrating ? null : parentDom._children;
	parentDom._children = createVNode$1(Fragment, { children: [vnode] });
	let commitQueue = [],
		refQueue = [];
	diff(
		parentDom,
		parentDom._children,
		oldVNode || EMPTY_OBJ,
		EMPTY_OBJ,
		parentDom.namespaceURI,
		oldVNode ? null : parentDom.firstChild ? slice.call(parentDom.childNodes) : null,
		commitQueue,
		oldVNode ? oldVNode._dom : parentDom.firstChild,
		isHydrating,
		refQueue,
	);
	commitRoot(commitQueue, parentDom._children, refQueue);
	parentDom._children.props.children = null;
}
/**
 * Update an existing DOM element with data from a Preact virtual node
 * @param {import('./internal').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to update
 */
function hydrate$1(vnode, parentDom) {
	if (vnode && typeof vnode == "object") vnode._flags |= 32;
	render$1(vnode, parentDom);
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/create-context.js
var i$1 = 0;
function createContext(defaultValue) {
	function Context(props) {
		if (!this.getChildContext) {
			/** @type {Set<import('./internal').Component> | null} */
			let subs = /* @__PURE__ */ new Set();
			let ctx = {};
			ctx[Context._id] = this;
			this.getChildContext = () => ctx;
			this.shouldComponentUpdate = function (_props) {
				if (this.props.value != _props.value)
					subs.forEach((c) => {
						c._bits |= 4;
						enqueueRender(c);
					});
			};
			this.sub = (c) => {
				subs.add(c);
				let old = c.componentWillUnmount;
				c.componentWillUnmount = () => {
					subs.delete(c);
					if (old) old.call(c);
				};
			};
		}
		return props.children;
	}
	Context._id = "__cC" + i$1++;
	Context._defaultValue = defaultValue;
	/** @type {import('./internal').FunctionComponent} */
	Context.Consumer = (props, contextValue) => {
		return props.children(contextValue);
	};
	Context.Provider = Context.Consumer.contextType = Context;
	return Context;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/src/create-portal.js
/**
 * Portal component. A unique type is used instead of Fragment so that a
 * portal returned directly from a component isn't collapsed into the
 * component's children array by the Fragment unwrapping in `diff()`.
 * @param {object} props
 */
function Portal(props) {
	return props.children;
}
/**
 * Create a `Portal` to continue rendering the vnode tree at a different DOM node
 * @param {import('./internal').ComponentChildren} vnode The vnode to render
 * @param {import('./internal').PreactElement} container The DOM node to continue rendering in to
 */
function createPortal$1(vnode, container) {
	return createVNode$1(Portal, {
		_parentDom: container,
		children: vnode,
	});
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/hooks/src/index.js
var ObjectIs = Object.is;
/** @type {number} */
var currentIndex;
/** @type {import('./internal').Component} */
var currentComponent$1;
/** @type {import('./internal').Component} */
var previousComponent;
/** @type {number} */
var currentHook = 0;
/** @type {Array<import('./internal').Component>} */
var afterPaintEffects = [];
/**
 * Passive (useEffect) hook states of unmounted components whose cleanup is
 * still pending. Deferred to the after-paint flush to match React, which runs
 * passive destroys after the commit has painted. Each state's `_passive` holds
 * the surviving component its errors should be routed to.
 * @type {Array<import('./internal').EffectHookState>}
 */
var unmountCleanups = [];
var options = options$1;
var oldBeforeDiff = options._diff;
var oldBeforeRender = options._render;
var oldAfterDiff = options.diffed;
var oldCommit = options._commit;
var oldBeforeUnmount = options.unmount;
var oldRoot = options._root;
var RAF_TIMEOUT = 35;
var prevRaf;
/** @type {(vnode: import('./internal').VNode) => void} */
options._diff = (vnode) => {
	currentComponent$1 = null;
	if (oldBeforeDiff) oldBeforeDiff(vnode);
};
options._root = (vnode, parentDom) => {
	if (vnode && parentDom._children && parentDom._children._mask) vnode._mask = parentDom._children._mask;
	if (oldRoot) oldRoot(vnode, parentDom);
};
/** @type {(vnode: import('./internal').VNode) => void} */
options._render = (vnode) => {
	if (oldBeforeRender) oldBeforeRender(vnode);
	currentComponent$1 = vnode._component;
	currentIndex = 0;
	const hooks = currentComponent$1.__hooks;
	if (hooks) {
		if (previousComponent == currentComponent$1) currentComponent$1._renderCallbacks = [];
		else {
			hooks._pendingEffects.some(invokeCleanup);
			hooks._pendingEffects.some(invokeEffect);
			currentIndex = 0;
		}
		hooks._pendingEffects = [];
		hooks._list.some((hookItem) => {
			if (hookItem._nextValue) hookItem._value = hookItem._nextValue;
			hookItem._pendingArgs = hookItem._nextValue = void 0;
		});
	}
	previousComponent = currentComponent$1;
};
/** @type {(vnode: import('./internal').VNode) => void} */
options.diffed = (vnode) => {
	if (oldAfterDiff) oldAfterDiff(vnode);
	const c = vnode._component;
	if (c && c.__hooks) {
		if (c.__hooks._pendingEffects.length) afterPaint(afterPaintEffects.push(c));
		c.__hooks._list.some((hookItem) => {
			if (hookItem._pendingArgs) hookItem._args = hookItem._pendingArgs;
		});
	}
	previousComponent = currentComponent$1 = null;
};
/** @type {(vnode: import('./internal').VNode, commitQueue: any) => void} */
options._commit = (vnode, commitQueue) => {
	commitQueue.some((component) => {
		try {
			component._renderCallbacks.some(invokeCleanup);
			component._renderCallbacks = component._renderCallbacks.filter((cb) => (cb._value ? invokeEffect(cb) : true));
		} catch (e) {
			commitQueue.some((c) => {
				if (c._renderCallbacks) c._renderCallbacks = [];
			});
			commitQueue = [];
			options._catchError(e, component._vnode);
		}
	});
	if (oldCommit) oldCommit(vnode, commitQueue);
};
/** @type {(vnode: import('./internal').VNode) => void} */
options.unmount = (vnode) => {
	if (oldBeforeUnmount) oldBeforeUnmount(vnode);
	const c = vnode._component;
	if (c && c.__hooks) {
		let hasErrored, errorParent;
		c.__hooks._list.some((s) => {
			try {
				if (s._passive && s._cleanup) {
					if (errorParent === void 0) {
						errorParent = vnode._parent;
						while (errorParent && !(errorParent._component && errorParent._component._parentDom))
							errorParent = errorParent._parent;
						errorParent = errorParent && errorParent._component;
					}
					s._passive = errorParent;
					afterPaint(unmountCleanups.push(s));
				} else invokeCleanup(s);
			} catch (e) {
				hasErrored = e;
			}
		});
		c.__hooks = void 0;
		if (hasErrored) options._catchError(hasErrored, c._vnode);
	}
};
/**
 * Get a hook's state from the currentComponent
 * @param {number} index The index of the hook to get
 * @param {number} type The type of the hook to get
 * @returns {any}
 */
function getHookState(index, type) {
	if (options._hook) options._hook(currentComponent$1, index, currentHook || type);
	currentHook = 0;
	const hooks =
		currentComponent$1.__hooks ||
		(currentComponent$1.__hooks = {
			_list: [],
			_pendingEffects: [],
		});
	if (index >= hooks._list.length) hooks._list.push({});
	return hooks._list[index];
}
/**
 * @template {unknown} S
 * @param {import('./index').Dispatch<import('./index').StateUpdater<S>>} [initialState]
 * @returns {[S, (state: S) => void]}
 */
function useState(initialState) {
	currentHook = 1;
	return useReducer(invokeOrReturn, initialState);
}
/**
 * @template {unknown} S
 * @template {unknown} A
 * @param {import('./index').Reducer<S, A>} reducer
 * @param {import('./index').Dispatch<import('./index').StateUpdater<S>>} initialState
 * @param {(initialState: any) => void} [init]
 * @returns {[ S, (state: S) => void ]}
 */
function useReducer(reducer, initialState, init) {
	/** @type {import('./internal').ReducerHookState} */
	const hookState = getHookState(currentIndex++, 2);
	hookState._reducer = reducer;
	if (!hookState._component) {
		hookState._value = [
			!init ? invokeOrReturn(void 0, initialState) : init(initialState),
			(action) => {
				const currentValue = hookState._nextValue ? hookState._nextValue[0] : hookState._value[0];
				const nextValue = hookState._reducer(currentValue, action);
				if (!ObjectIs(currentValue, nextValue)) {
					hookState._nextValue = [nextValue, hookState._value[1]];
					hookState._component.setState({});
				}
			},
		];
		hookState._component = currentComponent$1;
		if (!currentComponent$1._hasScuFromHooks) {
			currentComponent$1._hasScuFromHooks = true;
			const prevScu = currentComponent$1.shouldComponentUpdate;
			currentComponent$1.shouldComponentUpdate = function (p, s, c) {
				const hooks = this.__hooks;
				if (!hooks) return true;
				let updatedHook = false;
				let shouldUpdate = this.props != p;
				hooks._list.some((hookItem) => {
					if (hookItem._nextValue) {
						updatedHook = true;
						if (!ObjectIs(hookItem._value[0], hookItem._nextValue[0])) shouldUpdate = true;
					}
				});
				if (prevScu) {
					const result = prevScu.call(this, p, s, c);
					return updatedHook ? result || shouldUpdate : result;
				}
				return !updatedHook || shouldUpdate;
			};
		}
	}
	return hookState._value;
}
/**
 * @param {import('./internal').Effect} callback
 * @param {unknown[]} args
 * @returns {void}
 */
function useEffect(callback, args) {
	/** @type {import('./internal').EffectHookState} */
	const state = getHookState(currentIndex++, 3);
	if (!options._skipEffects && argsChanged(state._args, args)) {
		state._passive = true;
		state._value = callback;
		state._pendingArgs = args;
		currentComponent$1.__hooks._pendingEffects.push(state);
	}
}
/**
 * @param {import('./internal').Effect} callback
 * @param {unknown[]} args
 * @returns {void}
 */
function useLayoutEffect(callback, args) {
	/** @type {import('./internal').EffectHookState} */
	const state = getHookState(currentIndex++, 4);
	if (!options._skipEffects && argsChanged(state._args, args)) {
		state._passive = false;
		state._value = callback;
		state._pendingArgs = args;
		currentComponent$1._renderCallbacks.push(state);
	}
}
/** @type {(initialValue: unknown) => unknown} */
function useRef(initialValue) {
	currentHook = 5;
	return useMemo(() => ({ current: initialValue }), []);
}
/**
 * @param {object} ref
 * @param {() => object} createHandle
 * @param {unknown[]} args
 * @returns {void}
 */
function useImperativeHandle(ref, createHandle, args) {
	currentHook = 6;
	useLayoutEffect(
		() => {
			if (typeof ref == "function") {
				const result = ref(createHandle());
				return () => {
					ref(null);
					if (result && typeof result == "function") result();
				};
			} else if (ref) {
				ref.current = createHandle();
				return () => (ref.current = null);
			}
		},
		args == null ? args : args.concat(ref),
	);
}
/**
 * @template {unknown} T
 * @param {() => T} factory
 * @param {unknown[]} args
 * @returns {T}
 */
function useMemo(factory, args) {
	/** @type {import('./internal').MemoHookState<T>} */
	const state = getHookState(currentIndex++, 7);
	if (argsChanged(state._args, args)) {
		state._value = factory();
		state._args = args;
	}
	return state._value;
}
/**
 * @param {() => void} callback
 * @param {unknown[]} args
 * @returns {() => void}
 */
function useCallback(callback, args) {
	currentHook = 8;
	return useMemo(() => callback, args);
}
/**
 * @param {import('./internal').PreactContext} context
 */
function useContext(context) {
	const provider = currentComponent$1.context[context._id];
	/** @type {import('./internal').ContextHookState} */
	const state = getHookState(currentIndex++, 9);
	state._context = context;
	if (!provider) return context._defaultValue;
	if (state._value == null) {
		state._value = true;
		provider.sub(currentComponent$1);
	}
	return provider.props.value;
}
/**
 * Display a custom label for a custom hook for the devtools panel
 * @type {<T>(value: T, cb?: (value: T) => string | number) => void}
 */
function useDebugValue(value, formatter) {
	if (options.useDebugValue) options.useDebugValue(formatter ? formatter(value) : value);
}
/** @type {() => string} */
function useId() {
	/** @type {import('./internal').IdHookState} */
	const state = getHookState(currentIndex++, 11);
	if (!state._value) {
		/** @type {import('./internal').VNode} */
		let root = currentComponent$1._vnode;
		while (!root._mask && root._parent) root = root._parent;
		let mask = root._mask || (root._mask = [0, 0]);
		state._value = "P" + mask[0] + "-" + mask[1]++;
	}
	return state._value;
}
/**
 * After paint effects consumer.
 */
function flushAfterPaintEffects() {
	let component;
	do {
		while ((component = unmountCleanups.shift()))
			try {
				invokeCleanup(component);
			} catch (e) {
				component = component._passive;
				options._catchError(e, { _parent: component && component._vnode });
			}
		while ((component = afterPaintEffects.shift())) {
			const hooks = component.__hooks;
			if (!component._parentDom || !hooks) continue;
			try {
				hooks._pendingEffects.some(invokeCleanup);
				hooks._pendingEffects.some(invokeEffect);
				hooks._pendingEffects = [];
			} catch (e) {
				hooks._pendingEffects = [];
				options._catchError(e, component._vnode);
			}
		}
	} while (unmountCleanups.length);
}
var HAS_RAF = typeof requestAnimationFrame == "function";
/**
 * Schedule a callback to be invoked after the browser has a chance to paint a new frame.
 * Do this by combining requestAnimationFrame (rAF) + setTimeout to invoke a callback after
 * the next browser frame.
 *
 * Also, schedule a timeout in parallel to the the rAF to ensure the callback is invoked
 * even if RAF doesn't fire (for example if the browser tab is not visible)
 *
 * @param {() => void} callback
 */
function afterNextFrame(callback) {
	const done = () => {
		clearTimeout(timeout);
		if (HAS_RAF) cancelAnimationFrame(raf);
		setTimeout(callback);
	};
	const timeout = setTimeout(done, RAF_TIMEOUT);
	let raf;
	if (HAS_RAF) raf = requestAnimationFrame(done);
}
/**
 * Schedule afterPaintEffects flush after the browser paints
 * @param {number} newQueueLength
 * @returns {void}
 */
function afterPaint(newQueueLength) {
	if (newQueueLength == 1 || prevRaf != options.requestAnimationFrame) {
		prevRaf = options.requestAnimationFrame;
		(prevRaf || afterNextFrame)(flushAfterPaintEffects);
	}
}
/**
 * @param {import('./internal').HookState} hook
 * @returns {void}
 */
function invokeCleanup(hook) {
	const comp = currentComponent$1;
	let cleanup = hook._cleanup;
	if (typeof cleanup == "function") {
		hook._cleanup = void 0;
		cleanup();
	}
	currentComponent$1 = comp;
}
/**
 * Invoke a Hook's effect
 * @param {import('./internal').EffectHookState} hook
 * @returns {void}
 */
function invokeEffect(hook) {
	const comp = currentComponent$1;
	hook._cleanup = hook._value();
	currentComponent$1 = comp;
}
/**
 * @param {unknown[]} oldArgs
 * @param {unknown[]} newArgs
 * @returns {boolean}
 */
function argsChanged(oldArgs, newArgs) {
	return !oldArgs || oldArgs.length != newArgs.length || newArgs.some((arg, index) => !ObjectIs(arg, oldArgs[index]));
}
/**
 * @template Arg
 * @param {Arg} arg
 * @param {(arg: Arg) => any} f
 * @returns {any}
 */
function invokeOrReturn(arg, f) {
	return typeof f == "function" ? f(arg) : f;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/Children.js
var mapFn = (children, fn, context) => {
	if (children == null) return null;
	return toChildArray(toChildArray(children).map(fn.bind(context)));
};
var Children = {
	map: mapFn,
	forEach: mapFn,
	count(children) {
		return children ? toChildArray(children).length : 0;
	},
	only(children) {
		const normalized = toChildArray(children);
		if (normalized.length != 1) throw "Children.only";
		return normalized[0];
	},
	toArray: toChildArray,
};
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/util.js
var assign = Object.assign;
/**
 * Check if two objects have a different shape
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
function shallowDiffers(a, b) {
	for (let i in a) if (i != "__source" && a[i] !== b[i]) return true;
	for (let i in b) if (i != "__source" && !(i in a)) return true;
	return false;
}
var IS_NON_DIMENSIONAL =
	/^(-|f[lo].*[^se]$|g.{5,}[^ps]$|z|o[pr]|(W.{5})?[lL]i.*(t|mp)$|an|(bo|s).{4}Im|sca|m.{6}[ds]|ta|c.*[st]$|wido|ini)/;
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/PureComponent.js
function createPureComponent() {
	/**
	 * Component class with a predefined `shouldComponentUpdate` implementation
	 */
	function PureComponent(p, c) {
		this.props = p;
		this.context = c;
	}
	PureComponent.prototype = new BaseComponent();
	PureComponent.prototype.isPureReactComponent = true;
	PureComponent.prototype.shouldComponentUpdate = function (props, state) {
		return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
	};
	return PureComponent;
}
var PureComponent = /* @__PURE__ */ createPureComponent();
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/forwardRef.js
var REACT_FORWARD_SYMBOL = Symbol.for("react.forward_ref");
/**
 * Pass ref down to a child. This is mainly used in libraries with HOCs that
 * wrap components. Using `forwardRef` there is an easy way to get a reference
 * of the wrapped component instead of one of the wrapper itself.
 * @param {import('./index').ForwardRefRenderFunction} fn
 * @returns {import('./internal').FunctionComponent}
 */
function forwardRef(fn) {
	function Forwarded(props) {
		let clone = assign({}, props);
		delete clone.ref;
		return fn(clone, props.ref || null);
	}
	Forwarded.$$typeof = REACT_FORWARD_SYMBOL;
	Forwarded.render = fn;
	Forwarded.prototype.isReactComponent = true;
	Forwarded.displayName = "ForwardRef(" + (fn.displayName || fn.name) + ")";
	return Forwarded;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/hooks.js
function startTransition(cb) {
	cb();
}
function useDeferredValue(val) {
	return val;
}
function useTransition() {
	return [false, startTransition];
}
var useInsertionEffect = useLayoutEffect;
/**
 * @template {Function} T
 * @param {T} callback
 * @returns {T}
 */
function useEffectEvent(callback) {
	const ref = useRef(callback);
	ref.current = callback;
	return function () {
		return ref.current.apply(void 0, arguments);
	};
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/memo.js
/**
 * Memoize a component, so that it only updates when the props actually have
 * changed. This was previously known as `React.pure`.
 * @param {import('./internal').FunctionComponent} c functional component
 * @param {(prev: object, next: object) => boolean} [comparer] Custom equality function
 * @returns {import('./internal').FunctionComponent}
 */
function memo(c, comparer) {
	function shouldUpdate(nextProps) {
		const ref = this.props.ref;
		if (ref != nextProps.ref && ref) typeof ref == "function" ? ref(null) : (ref.current = null);
		return comparer ? !comparer(this.props, nextProps) || ref != nextProps.ref : shallowDiffers(this.props, nextProps);
	}
	function Memoed(props) {
		this.shouldComponentUpdate = shouldUpdate;
		return createElement(c, props);
	}
	Memoed.displayName = "Memo(" + (c.displayName || c.name) + ")";
	Memoed.prototype.isReactComponent = true;
	Memoed.type = c;
	return Memoed;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/portals.js
/**
 * Create a `Portal` to continue rendering the vnode tree at a different DOM node
 * @param {import('./internal').VNode} vnode The vnode to render
 * @param {import('./internal').PreactElement} container The DOM node to continue rendering in to.
 */
function createPortal(vnode, container) {
	const el = createPortal$1(vnode, container);
	el.containerInfo = container;
	return el;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/render.js
var REACT_ELEMENT_TYPE = Symbol.for("react.element");
var MODE_HYDRATE = 32;
var currentComponent;
var hydrationRoot;
var renderTrackingInitialized;
var CAMEL_PROPS =
	/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(?!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
var CAMEL_REPLACE = /[A-Z0-9]/g;
var IS_DOM = typeof document < "u";
/**
 * This is taken from https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js#L84
 * on a high level this cuts out the warnings, ... and attempts a smaller implementation
 * @typedef {{ _value: any; _getSnapshot: () => any }} Store
 */
var useSyncExternalStore = /* @__PURE__ */ initRenderTracking(
	function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		const value = options$1._skipEffects || hydrationRoot ? (getServerSnapshot || getSnapshot)() : getSnapshot();
		/**
		 * @typedef {{ _instance: Store }} StoreRef
		 * @type {[StoreRef, (store: StoreRef) => void]}
		 */
		const [{ _instance }, forceUpdate] = useState({
			_instance: {
				_value: value,
				_getSnapshot: getSnapshot,
			},
		});
		useLayoutEffect(() => {
			_instance._value = value;
			_instance._getSnapshot = getSnapshot;
			if (didSnapshotChange(_instance)) forceUpdate({ _instance });
		}, [subscribe, value, getSnapshot]);
		useEffect(() => {
			if (didSnapshotChange(_instance)) forceUpdate({ _instance });
			return subscribe(() => {
				if (didSnapshotChange(_instance)) forceUpdate({ _instance });
			});
		}, [subscribe]);
		return value;
	},
);
/** @type {(inst: Store) => boolean} */
function didSnapshotChange(inst) {
	try {
		return !Object.is(inst._value, inst._getSnapshot());
	} catch (error) {
		return true;
	}
}
var onChangeInputType = (type) => /fil|che|rad/.test(type);
BaseComponent.prototype.isReactComponent = true;
["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach((key) => {
	Object.defineProperty(BaseComponent.prototype, key, {
		configurable: true,
		get() {
			return this["UNSAFE_" + key];
		},
		set(v) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				value: v,
			});
		},
	});
});
/**
 * Proxy render() since React returns a Component reference.
 * @param {import('./internal').VNode} vnode VNode tree to render
 * @param {import('./internal').PreactElement} parent DOM node to render vnode tree into
 * @param {() => void} [callback] Optional callback that will be called after rendering
 * @returns {import('./internal').Component | null} The root component reference or null
 */
function render(vnode, parent, callback) {
	if (parent._children == null) parent.textContent = "";
	render$1(vnode, parent);
	if (typeof callback == "function") callback();
	return vnode ? vnode._component : null;
}
function hydrate(vnode, parent, callback) {
	hydrate$1(vnode, parent);
	if (typeof callback == "function") callback();
	return vnode ? vnode._component : null;
}
var oldEventHook = options$1.event;
options$1.event = (e) => {
	if (oldEventHook) e = oldEventHook(e);
	e.persist = () => {};
	e.isPropagationStopped = function isPropagationStopped() {
		return this.cancelBubble;
	};
	e.isDefaultPrevented = function isDefaultPrevented() {
		return this.defaultPrevented;
	};
	return (e.nativeEvent = e);
};
var classNameDescriptorNonEnumberable = {
	configurable: true,
	get() {
		return this.class;
	},
};
function handleDomVNode(vnode) {
	let props = vnode.props,
		type = vnode.type,
		normalizedProps = {},
		isNonDashedType = type.indexOf("-") == -1;
	for (let i in props) {
		let value = props[i];
		if (
			(i == "value" && "defaultValue" in props && value == null) ||
			(IS_DOM && i == "children" && type == "noscript") ||
			i == "class" ||
			i == "className"
		)
			continue;
		if (i == "style" && typeof value == "object") {
			let cloned;
			for (let key in value)
				if (typeof value[key] == "number" && !IS_NON_DIMENSIONAL.test(key)) {
					if (!cloned) cloned = value = assign({}, value);
					value[key] += "px";
				}
		} else if (i == "defaultValue" && "value" in props && props.value == null) i = "value";
		else if (i == "download" && value === true) value = "";
		else if (i == "translate" && value === "no") value = false;
		else if (i[0] == "o" && i[1] == "n") {
			let lowerCased = i.toLowerCase();
			if (lowerCased == "ondoubleclick") i = "ondblclick";
			else if (lowerCased == "onchange" && (type == "input" || type == "textarea") && !onChangeInputType(props.type))
				lowerCased = i = "oninput";
			else if (lowerCased == "onfocus") i = "onfocusin";
			else if (lowerCased == "onblur") i = "onfocusout";
			if (lowerCased == "oninput") {
				i = lowerCased;
				if (normalizedProps[i]) i = "oninputCapture";
			}
		} else if (isNonDashedType && CAMEL_PROPS.test(i)) i = i.replace(CAMEL_REPLACE, "-$&").toLowerCase();
		else if (value === null) value = void 0;
		normalizedProps[i] = value;
	}
	if (type == "select") {
		if (normalizedProps.multiple && Array.isArray(normalizedProps.value))
			normalizedProps.value = toChildArray(props.children).forEach((child) => {
				child.props.selected = normalizedProps.value.indexOf(child.props.value) != -1;
			});
		if (normalizedProps.defaultValue != null)
			normalizedProps.value = toChildArray(props.children).forEach((child) => {
				if (normalizedProps.multiple)
					child.props.selected = normalizedProps.defaultValue.indexOf(child.props.value) != -1;
				else child.props.selected = normalizedProps.defaultValue == child.props.value;
			});
	}
	if (props.class && !props.className) {
		normalizedProps.class = props.class;
		Object.defineProperty(normalizedProps, "className", classNameDescriptorNonEnumberable);
	} else if (props.className) normalizedProps.class = normalizedProps.className = props.className;
	vnode.props = normalizedProps;
}
var oldVNodeHook = options$1.vnode;
options$1.vnode = (vnode) => {
	if (typeof vnode.type == "string") handleDomVNode(vnode);
	else if (typeof vnode.type == "function") {
		const shouldApplyRef = "prototype" in vnode.type && vnode.type.prototype.render;
		if ("ref" in vnode.props && shouldApplyRef) {
			vnode.ref = vnode.props.ref;
			delete vnode.props.ref;
		}
		if (vnode.type.defaultProps) {
			let normalizedProps = assign({}, vnode.props);
			for (let i in vnode.type.defaultProps)
				if (normalizedProps[i] === void 0) normalizedProps[i] = vnode.type.defaultProps[i];
			vnode.props = normalizedProps;
		}
	}
	if (vnode.ref && !("ref" in vnode.props))
		Object.defineProperty(vnode.props, "ref", {
			value: vnode.ref,
			configurable: true,
			writable: true,
		});
	vnode.$$typeof = REACT_ELEMENT_TYPE;
	if (oldVNodeHook) oldVNodeHook(vnode);
};
function initRenderTracking(value) {
	if (!renderTrackingInitialized) {
		renderTrackingInitialized = true;
		const oldBeforeRender = options$1._render;
		options$1._render = (vnode) => {
			if (oldBeforeRender) oldBeforeRender(vnode);
			if (vnode._flags & MODE_HYDRATE) hydrationRoot = vnode;
			currentComponent = vnode._component;
		};
		const oldDiffed = options$1.diffed;
		options$1.diffed = (vnode) => {
			if (oldDiffed) oldDiffed(vnode);
			currentComponent = null;
			if (hydrationRoot == vnode) hydrationRoot = null;
		};
	}
	return value;
}
/**
 * Read the value of a Promise (suspending while pending) or a Context.
 * Unlike other hooks, `use` may be called conditionally.
 * @template T
 * @param {(Promise<T> & { status?: string, value?: T, reason?: any }) | import('../../src/internal').PreactContext} resource
 * @returns {T}
 */
var use = /* @__PURE__ */ initRenderTracking(function use(resource) {
	if (resource.then) {
		if (resource.status == "fulfilled") return resource.value;
		if (resource.status == "rejected") throw resource.reason;
		if (!resource.status) {
			resource.status = "pending";
			resource.then(
				(value) => {
					resource.status = "fulfilled";
					resource.value = value;
				},
				(reason) => {
					resource.status = "rejected";
					resource.reason = reason;
				},
			);
		}
		throw resource;
	}
	const id = resource._id;
	const provider = currentComponent._globalContext[id];
	if (!provider) return resource._defaultValue;
	if (!currentComponent[id]) {
		currentComponent[id] = true;
		provider.sub(currentComponent);
	}
	return provider.props.value;
});
var __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	ReactCurrentDispatcher: {
		current: {
			readContext: use,
			useCallback,
			useContext,
			useDebugValue,
			useDeferredValue,
			useEffect,
			useId,
			useImperativeHandle,
			useInsertionEffect,
			useLayoutEffect,
			useMemo,
			useReducer,
			useRef,
			useState,
			useSyncExternalStore,
			useTransition,
		},
	},
};
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/suspense.js
function initSuspenseHooks() {
	const oldCatchError = options$1._catchError;
	options$1._catchError = (error, newVNode, oldVNode, errorInfo) => {
		if (error.then) {
			/** @type {import('./internal').Component} */
			let component;
			let vnode = newVNode;
			while ((vnode = vnode._parent))
				if ((component = vnode._component) && component._childDidSuspend) {
					if (oldVNode && !oldVNode._component) newVNode._component.__hooks = void 0;
					return component._childDidSuspend(error, newVNode);
				}
		}
		oldCatchError(error, newVNode, oldVNode, errorInfo);
	};
	const oldUnmount = options$1.unmount;
	options$1.unmount = (vnode) => {
		/** @type {import('./internal').Component} */
		const component = vnode._component;
		if (component && component._onResolve) component._onResolve();
		if (oldUnmount) oldUnmount(vnode);
	};
}
function detachedClone(vnode, detachedParent, parentDom) {
	if (vnode) {
		const hooks = vnode._component && vnode._component.__hooks;
		if (hooks) {
			hooks._list.forEach((effect) => {
				if (effect._passive != null) {
					if (typeof effect._cleanup == "function") effect._cleanup();
					effect._cleanup = effect._args = void 0;
				}
			});
			hooks._pendingEffects = vnode._component._renderCallbacks = [];
		}
		if (typeof vnode.type == "string") vnode._flags |= 8;
		vnode = assign({ constructor: void 0 }, vnode);
		if (vnode._component != null) {
			if (vnode._component._parentDom == parentDom) vnode._component._parentDom = detachedParent;
			vnode._component._bits |= 4;
			vnode._component = vnode.ref = null;
		}
		vnode._children =
			vnode._children && vnode._children.map((child) => detachedClone(child, detachedParent, parentDom));
	}
	return vnode;
}
function removeOriginal(vnode, detachedParent, originalParent) {
	if (vnode && originalParent) {
		if (typeof vnode.type == "string") vnode._flags |= 1;
		vnode._original = null;
		vnode._children =
			vnode._children && vnode._children.map((child) => removeOriginal(child, detachedParent, originalParent));
		if (vnode._component) {
			if (vnode._component._parentDom == detachedParent) {
				if (vnode._dom) originalParent.appendChild(vnode._dom);
				vnode._component._bits |= 4;
				vnode._component._parentDom = originalParent;
			}
		}
	}
	return vnode;
}
function createSuspense() {
	initSuspenseHooks();
	function Suspense() {
		this._pendingSuspensionCount = 0;
		this._suspenders = null;
		this._detachOnNextRender = null;
	}
	Suspense.prototype = new BaseComponent();
	/**
	 * @this {import('./internal').SuspenseComponent}
	 * @param {Promise} promise The thrown promise
	 * @param {import('./internal').VNode<any, any>} suspendingVNode The suspending component
	 */
	Suspense.prototype._childDidSuspend = function (promise, suspendingVNode) {
		const suspendingComponent = suspendingVNode._component;
		if (this._suspenders == null) this._suspenders = [];
		this._suspenders.push(suspendingComponent);
		let resolved = false;
		const onResolved = () => {
			if (resolved || !this._parentDom) return;
			resolved = true;
			suspendingComponent._onResolve = null;
			onSuspensionComplete();
		};
		suspendingComponent._onResolve = onResolved;
		const originalParentDom = suspendingComponent._parentDom;
		suspendingComponent._parentDom = null;
		const onSuspensionComplete = () => {
			if (!--this._pendingSuspensionCount) {
				if (this.state._suspended) {
					const suspendedVNode = this.state._suspended;
					this._vnode._children[0] = removeOriginal(
						suspendedVNode,
						suspendedVNode._component._parentDom,
						suspendedVNode._component._originalParentDom,
					);
				}
				this.setState({ _suspended: (this._detachOnNextRender = null) });
				let suspended;
				while ((suspended = this._suspenders.pop())) {
					suspended._parentDom = originalParentDom;
					suspended.forceUpdate();
				}
			}
		};
		/**
		 * We do not set `suspended: true` during hydration because we want the actual markup
		 * to remain on screen and hydrate it when the suspense actually gets resolved.
		 * While in non-hydration cases the usual fallback -> component flow would occour.
		 */
		if (!this._pendingSuspensionCount++ && !(suspendingVNode._flags & 32))
			this.setState({ _suspended: (this._detachOnNextRender = this._vnode._children[0]) });
		promise.then(onResolved, onResolved);
	};
	Suspense.prototype.componentWillUnmount = function () {
		this._suspenders = [];
		if (this.state._suspended) this._vnode._children[0] = this.state._suspended;
	};
	/**
	 * @this {import('./internal').SuspenseComponent}
	 * @param {import('./internal').SuspenseComponent["props"]} props
	 * @param {import('./internal').SuspenseState} state
	 */
	Suspense.prototype.render = function (props, state) {
		if (this._detachOnNextRender) {
			if (this._vnode._children) {
				const detachedParent = document.createElement("div");
				const detachedComponent = this._vnode._children[0]._component;
				this._vnode._children[0] = detachedClone(
					this._detachOnNextRender,
					detachedParent,
					(detachedComponent._originalParentDom = detachedComponent._parentDom),
				);
			}
			this._detachOnNextRender = null;
		}
		return [
			createElement(Fragment, null, state._suspended ? null : props.children),
			state._suspended && createElement(Fragment, null, props.fallback),
		];
	};
	return Suspense;
}
var Suspense = /* @__PURE__ */ createSuspense();
function lazy(loader) {
	let prom;
	let component = null;
	let error;
	let resolved;
	function Lazy(props) {
		if (!prom) {
			prom = loader();
			prom.then(
				(exports) => {
					if (exports) component = exports.default || exports;
					resolved = true;
				},
				(e) => {
					error = e;
					resolved = true;
				},
			);
		}
		if (error) throw error;
		if (!resolved) throw prom;
		return component ? createElement(component, props) : null;
	}
	Lazy.displayName = "Lazy";
	return Lazy;
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/src/index.js
var version$1 = "19.0.0";
/**
 * Legacy version of createElement.
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor
 */
function createFactory(type) {
	return createElement.bind(null, type);
}
/**
 * Check if the passed element is a valid (p)react node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isValidElement(element) {
	return !!element && element.$$typeof === REACT_ELEMENT_TYPE;
}
/**
 * Check if the passed element is a Fragment node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isFragment(element) {
	return isValidElement(element) && element.type == Fragment;
}
/**
 * Check if the passed element is a Memo node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isMemo(element) {
	return !!element && typeof element.displayName == "string" && element.displayName.indexOf("Memo(") == 0;
}
/**
 * Wrap `cloneElement` to abort if the passed element is not a valid element and apply
 * all vnode normalizations.
 * @param {import('./internal').VNode} element The vnode to clone
 * @param {object} props Props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} rest Optional component children
 */
function cloneElement(element) {
	if (!isValidElement(element)) return element;
	return cloneElement$1.apply(null, arguments);
}
/**
 * Remove a component tree from the DOM, including state and event handlers.
 * @param {import('./internal').PreactElement} container
 * @returns {boolean}
 */
function unmountComponentAtNode(container) {
	if (container._children) {
		render$1(null, container);
		return true;
	}
	return false;
}
/**
 * Get the matching DOM node for a component
 * @param {import('./internal').Component} component
 * @returns {import('./internal').PreactElement | null}
 */
function findDOMNode(component) {
	return (component && ((component._vnode && component._vnode._dom) || (component.nodeType == 1 && component))) || null;
}
/**
 * In React, `flushSync` flushes the entire tree and forces a rerender.
 * @template Arg
 * @template Result
 * @param {(arg: Arg) => Result} callback function that runs before the flush
 * @param {Arg} [arg] Optional argument that can be passed to the callback
 * @returns
 */
var flushSync = (callback, arg) => {
	const prevDebounce = options$1.debounceRendering;
	let flush;
	options$1.debounceRendering = (cb) => {
		flush = cb;
	};
	try {
		const res = callback(arg);
		if (flush) flush();
		return res;
	} finally {
		options$1.debounceRendering = prevDebounce;
	}
};
/**
 * In React, `unstable_batchedUpdates` is a legacy feature that was made a no-op
 * outside of legacy mode in React 18 and a no-op across the board in React 19.
 * @template Arg
 * @template Result
 * @param {(arg: Arg) => Result} callback
 * @param {Arg} [arg]
 * @returns {Result}
 */
function unstable_batchedUpdates(callback, arg) {
	return callback(arg);
}
var src_default = {
	useState,
	useId,
	useReducer,
	useEffect,
	useLayoutEffect,
	useInsertionEffect,
	useTransition,
	useDeferredValue,
	useSyncExternalStore,
	useEffectEvent,
	startTransition,
	useRef,
	useImperativeHandle,
	useMemo,
	useCallback,
	useContext,
	use,
	useDebugValue,
	version: version$1,
	Children,
	render,
	hydrate,
	unmountComponentAtNode,
	createPortal,
	createElement,
	createContext,
	createFactory,
	cloneElement,
	createRef,
	Fragment,
	isValidElement,
	isElement: isValidElement,
	isFragment,
	isMemo,
	findDOMNode,
	Component: BaseComponent,
	PureComponent,
	memo,
	forwardRef,
	flushSync,
	unstable_batchedUpdates,
	StrictMode: Fragment,
	Suspense,
	lazy,
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/values/base64.js
var lookup = [];
var revLookup = [];
var Arr = Uint8Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i = 0, len = code.length; i < len; ++i) {
	lookup[i] = code[i];
	revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
	var len = b64.length;
	if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
	var validLen = b64.indexOf("=");
	if (validLen === -1) validLen = len;
	var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
	return [validLen, placeHoldersLen];
}
function _byteLength(_b64, validLen, placeHoldersLen) {
	return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}
function toByteArray(b64) {
	var tmp;
	var lens = getLens(b64);
	var validLen = lens[0];
	var placeHoldersLen = lens[1];
	var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
	var curByte = 0;
	var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
	var i = 0;
	for (; i < len; i += 4) {
		tmp =
			(revLookup[b64.charCodeAt(i)] << 18) |
			(revLookup[b64.charCodeAt(i + 1)] << 12) |
			(revLookup[b64.charCodeAt(i + 2)] << 6) |
			revLookup[b64.charCodeAt(i + 3)];
		arr[curByte++] = (tmp >> 16) & 255;
		arr[curByte++] = (tmp >> 8) & 255;
		arr[curByte++] = tmp & 255;
	}
	if (placeHoldersLen === 2) {
		tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
		arr[curByte++] = tmp & 255;
	}
	if (placeHoldersLen === 1) {
		tmp =
			(revLookup[b64.charCodeAt(i)] << 10) |
			(revLookup[b64.charCodeAt(i + 1)] << 4) |
			(revLookup[b64.charCodeAt(i + 2)] >> 2);
		arr[curByte++] = (tmp >> 8) & 255;
		arr[curByte++] = tmp & 255;
	}
	return arr;
}
function tripletToBase64(num) {
	return lookup[(num >> 18) & 63] + lookup[(num >> 12) & 63] + lookup[(num >> 6) & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
	var tmp;
	var output = [];
	for (var i = start; i < end; i += 3) {
		tmp = ((uint8[i] << 16) & 16711680) + ((uint8[i + 1] << 8) & 65280) + (uint8[i + 2] & 255);
		output.push(tripletToBase64(tmp));
	}
	return output.join("");
}
function fromByteArray(uint8) {
	var tmp;
	var len = uint8.length;
	var extraBytes = len % 3;
	var parts = [];
	var maxChunkLength = 16383;
	for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength)
		parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
	if (extraBytes === 1) {
		tmp = uint8[len - 1];
		parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 63] + "==");
	} else if (extraBytes === 2) {
		tmp = (uint8[len - 2] << 8) + uint8[len - 1];
		parts.push(lookup[tmp >> 10] + lookup[(tmp >> 4) & 63] + lookup[(tmp << 2) & 63] + "=");
	}
	return parts.join("");
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/common/index.js
function parseArgs(args) {
	if (args === void 0) return {};
	if (!isSimpleObject(args)) throw new Error(`The arguments to a Convex function must be an object. Received: ${args}`);
	return args;
}
function validateDeploymentUrl(deploymentUrl) {
	if (typeof deploymentUrl === "undefined")
		throw new Error(
			`Client created with undefined deployment address. If you used an environment variable, check that it's set.`,
		);
	if (typeof deploymentUrl !== "string") throw new Error(`Invalid deployment address: found ${deploymentUrl}".`);
	if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:")))
		throw new Error(`Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`);
	try {
		new URL(deploymentUrl);
	} catch {
		throw new Error(
			`Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
		);
	}
	if (deploymentUrl.endsWith(".convex.site"))
		throw new Error(
			`Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`,
		);
}
function isSimpleObject(value) {
	const isObject = typeof value === "object";
	const prototype = Object.getPrototypeOf(value);
	const isSimple = prototype === null || prototype === Object.prototype || prototype?.constructor?.name === "Object";
	return isObject && isSimple;
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/values/value.js
var LITTLE_ENDIAN = true;
var MIN_INT64 = BigInt("-9223372036854775808");
var MAX_INT64 = BigInt("9223372036854775807");
var ZERO = BigInt("0");
var EIGHT = BigInt("8");
var TWOFIFTYSIX = BigInt("256");
var COMMIT_TS_UNRESOLVED =
	"This commit timestamp is unresolved: its value is assigned when the mutation commits. Read the document after the mutation completes to get its value.";
var CommitTsPlaceholder = class {
	[Symbol.toPrimitive](hint) {
		if (hint === "string") return this.toString();
		throw new Error(COMMIT_TS_UNRESOLVED);
	}
	valueOf() {
		throw new Error(COMMIT_TS_UNRESOLVED);
	}
	toJSON() {
		throw new Error(COMMIT_TS_UNRESOLVED);
	}
	toString() {
		return "[unresolved commit timestamp]";
	}
};
var commitTsPlaceholder = new CommitTsPlaceholder();
function isSpecial(n) {
	return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
}
function slowBigIntToBase64(value) {
	if (value < ZERO) value -= MIN_INT64 + MIN_INT64;
	let hex = value.toString(16);
	if (hex.length % 2 === 1) hex = "0" + hex;
	const bytes = new Uint8Array(/* @__PURE__ */ new ArrayBuffer(8));
	let i = 0;
	for (const hexByte of hex.match(/.{2}/g).reverse()) {
		bytes.set([parseInt(hexByte, 16)], i++);
		value >>= EIGHT;
	}
	return fromByteArray(bytes);
}
function slowBase64ToBigInt(encoded) {
	const integerBytes = toByteArray(encoded);
	if (integerBytes.byteLength !== 8)
		throw new Error(`Received ${integerBytes.byteLength} bytes, expected 8 for $integer`);
	let value = ZERO;
	let power = ZERO;
	for (const byte of integerBytes) {
		value += BigInt(byte) * TWOFIFTYSIX ** power;
		power++;
	}
	if (value > MAX_INT64) value += MIN_INT64 + MIN_INT64;
	return value;
}
function modernBigIntToBase64(value) {
	if (value < MIN_INT64 || MAX_INT64 < value)
		throw new Error(`BigInt ${value} does not fit into a 64-bit signed integer.`);
	const buffer = /* @__PURE__ */ new ArrayBuffer(8);
	new DataView(buffer).setBigInt64(0, value, true);
	return fromByteArray(new Uint8Array(buffer));
}
function modernBase64ToBigInt(encoded) {
	const integerBytes = toByteArray(encoded);
	if (integerBytes.byteLength !== 8)
		throw new Error(`Received ${integerBytes.byteLength} bytes, expected 8 for $integer`);
	return new DataView(integerBytes.buffer).getBigInt64(0, true);
}
var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
var MAX_IDENTIFIER_LEN = 1024;
function validateObjectField(k) {
	if (k.length > MAX_IDENTIFIER_LEN)
		throw new Error(`Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`);
	if (k.startsWith("$")) throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
	for (let i = 0; i < k.length; i += 1) {
		const charCode = k.charCodeAt(i);
		if (charCode < 32 || charCode >= 127)
			throw new Error(
				`Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`,
			);
	}
}
function jsonToConvex(value) {
	if (value === null) return value;
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value;
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map((value2) => jsonToConvex(value2));
	if (typeof value !== "object") throw new Error(`Unexpected type of ${value}`);
	const entries = Object.entries(value);
	if (entries.length === 1) {
		const key = entries[0][0];
		if (key === "$bytes") {
			if (typeof value.$bytes !== "string") throw new Error(`Malformed $bytes field on ${value}`);
			return toByteArray(value.$bytes).buffer;
		}
		if (key === "$integer") {
			if (typeof value.$integer !== "string") throw new Error(`Malformed $integer field on ${value}`);
			return base64ToBigInt(value.$integer);
		}
		if (key === "$float") {
			if (typeof value.$float !== "string") throw new Error(`Malformed $float field on ${value}`);
			const floatBytes = toByteArray(value.$float);
			if (floatBytes.byteLength !== 8)
				throw new Error(`Received ${floatBytes.byteLength} bytes, expected 8 for $float`);
			const float = new DataView(floatBytes.buffer).getFloat64(0, LITTLE_ENDIAN);
			if (!isSpecial(float)) throw new Error(`Float ${float} should be encoded as a number`);
			return float;
		}
		if (key === "$commitTs") {
			if (value.$commitTs !== null) throw new Error(`Malformed $commitTs field on ${value}`);
			return commitTsPlaceholder;
		}
		if (key === "$set") throw new Error(`Received a Set which is no longer supported as a Convex type.`);
		if (key === "$map") throw new Error(`Received a Map which is no longer supported as a Convex type.`);
	}
	const out = {};
	for (const [k, v] of Object.entries(value)) {
		validateObjectField(k);
		out[k] = jsonToConvex(v);
	}
	return out;
}
var MAX_VALUE_FOR_ERROR_LEN = 16384;
function stringifyValueForError(value) {
	const str = JSON.stringify(value, (_key, value2) => {
		if (value2 === void 0) return "undefined";
		if (typeof value2 === "function") return "[Function]";
		if (typeof value2 === "symbol") return String(value2);
		if (typeof value2 === "bigint") return `${value2.toString()}n`;
		return value2;
	});
	if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
		const rest = "[...truncated]";
		let truncateAt = 16370;
		const codePoint = str.codePointAt(truncateAt - 1);
		if (codePoint !== void 0 && codePoint > 65535) truncateAt -= 1;
		return str.substring(0, truncateAt) + rest;
	}
	return str;
}
function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
	if (value === void 0) {
		const contextText =
			context && ` (present at path ${context} in original object ${stringifyValueForError(originalValue)})`;
		throw new Error(
			`undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`,
		);
	}
	if (value === null) return value;
	if (typeof value === "bigint") {
		if (value < MIN_INT64 || MAX_INT64 < value)
			throw new Error(`BigInt ${value} does not fit into a 64-bit signed integer.`);
		return { $integer: bigIntToBase64(value) };
	}
	if (typeof value === "number") {
		if (isSpecial(value)) {
			const buffer = /* @__PURE__ */ new ArrayBuffer(8);
			new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
			return { $float: fromByteArray(new Uint8Array(buffer)) };
		} else return value;
	}
	if (typeof value === "boolean") return value;
	if (typeof value === "string") return value;
	if (value instanceof ArrayBuffer) return { $bytes: fromByteArray(new Uint8Array(value)) };
	if (value instanceof CommitTsPlaceholder) return { $commitTs: null };
	if (Array.isArray(value))
		return value.map((value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`, false));
	if (value instanceof Set) throw new Error(errorMessageForUnsupportedType(context, "Set", [...value], originalValue));
	if (value instanceof Map) throw new Error(errorMessageForUnsupportedType(context, "Map", [...value], originalValue));
	if (!isSimpleObject(value)) {
		const theType = value?.constructor?.name;
		const typeName = theType ? `${theType} ` : "";
		throw new Error(errorMessageForUnsupportedType(context, typeName, value, originalValue));
	}
	const out = {};
	const entries = Object.entries(value);
	entries.sort(([k1, _v1], [k2, _v2]) => (k1 === k2 ? 0 : k1 < k2 ? -1 : 1));
	for (const [k, v] of entries)
		if (v !== void 0) {
			validateObjectField(k);
			out[k] = convexToJsonInternal(v, originalValue, context + `.${k}`, false);
		} else if (includeTopLevelUndefined) {
			validateObjectField(k);
			out[k] = convexOrUndefinedToJsonInternal(v, originalValue, context + `.${k}`);
		}
	return out;
}
function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
	if (context)
		return `${typeName}${stringifyValueForError(value)} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(originalValue)}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
	else return `${typeName}${stringifyValueForError(value)} is not a supported Convex type.`;
}
function convexOrUndefinedToJsonInternal(value, originalValue, context) {
	if (value === void 0) return { $undefined: null };
	else {
		if (originalValue === void 0)
			throw new Error(
				`Programming error. Current value is ${stringifyValueForError(value)} but original value is undefined`,
			);
		return convexToJsonInternal(value, originalValue, context, false);
	}
}
function convexToJson(value) {
	return convexToJsonInternal(value, value, "", false);
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/values/errors.js
var __defProp$11 = Object.defineProperty;
var __defNormalProp$11 = (obj, key, value) =>
	key in obj
		? __defProp$11(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$11 = (obj, key, value) => __defNormalProp$11(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var _b;
var IDENTIFYING_FIELD = Symbol.for("ConvexError");
var ConvexError = class extends ((_b = Error), (_a = IDENTIFYING_FIELD), _b) {
	constructor(data) {
		super(typeof data === "string" ? data : stringifyValueForError(data));
		__publicField$11(this, "name", "ConvexError");
		__publicField$11(this, "data");
		__publicField$11(this, _a, true);
		this.data = data;
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/index.js
var version = "1.50.0";
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/logging.js
var __defProp$10 = Object.defineProperty;
var __defNormalProp$10 = (obj, key, value) =>
	key in obj
		? __defProp$10(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$10 = (obj, key, value) => __defNormalProp$10(obj, typeof key !== "symbol" ? key + "" : key, value);
var INFO_COLOR = "color:rgb(0, 145, 255)";
function prefix_for_source(source) {
	switch (source) {
		case "query":
			return "Q";
		case "mutation":
			return "M";
		case "action":
			return "A";
		case "any":
			return "?";
	}
}
var DefaultLogger = class {
	constructor(options) {
		__publicField$10(this, "_onLogLineFuncs");
		__publicField$10(this, "_verbose");
		this._onLogLineFuncs = {};
		this._verbose = options.verbose;
	}
	addLogLineListener(func) {
		let id = Math.random().toString(36).substring(2, 15);
		for (let i = 0; i < 10; i++) {
			if (this._onLogLineFuncs[id] === void 0) break;
			id = Math.random().toString(36).substring(2, 15);
		}
		this._onLogLineFuncs[id] = func;
		return () => {
			delete this._onLogLineFuncs[id];
		};
	}
	logVerbose(...args) {
		if (this._verbose)
			for (const func of Object.values(this._onLogLineFuncs))
				func("debug", `${/* @__PURE__ */ new Date().toISOString()}`, ...args);
	}
	log(...args) {
		for (const func of Object.values(this._onLogLineFuncs)) func("info", ...args);
	}
	warn(...args) {
		for (const func of Object.values(this._onLogLineFuncs)) func("warn", ...args);
	}
	error(...args) {
		for (const func of Object.values(this._onLogLineFuncs)) func("error", ...args);
	}
};
function instantiateDefaultLogger(options) {
	const logger = new DefaultLogger(options);
	logger.addLogLineListener((level, ...args) => {
		switch (level) {
			case "debug":
				console.debug(...args);
				break;
			case "info":
				console.log(...args);
				break;
			case "warn":
				console.warn(...args);
				break;
			case "error":
				console.error(...args);
				break;
			default:
				console.log(...args);
		}
	});
	return logger;
}
function instantiateNoopLogger(options) {
	return new DefaultLogger(options);
}
function logForFunction(logger, type, source, udfPath, message) {
	const prefix = prefix_for_source(source);
	if (typeof message === "object") message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
	if (type === "info") {
		const match = message.match(/^\[.*?\] /);
		if (match === null) {
			logger.error(`[CONVEX ${prefix}(${udfPath})] Could not parse console.log`);
			return;
		}
		const level = message.slice(1, match[0].length - 2);
		const args = message.slice(match[0].length);
		logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
	} else logger.error(`[CONVEX ${prefix}(${udfPath})] ${message}`);
}
function logFatalError(logger, message) {
	const errorMessage = `[CONVEX FATAL ERROR] ${message}`;
	logger.error(errorMessage);
	return new Error(errorMessage);
}
function createHybridErrorStacktrace(source, udfPath, result) {
	return `[CONVEX ${prefix_for_source(source)}(${udfPath})] ${result.errorMessage}
  Called by client`;
}
function forwardData(result, error) {
	error.data = result.errorData;
	return error;
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/udf_path_utils.js
function canonicalizeUdfPath(udfPath) {
	const pieces = udfPath.split(":");
	let moduleName;
	let functionName;
	if (pieces.length === 1) {
		moduleName = pieces[0];
		functionName = "default";
	} else {
		moduleName = pieces.slice(0, pieces.length - 1).join(":");
		functionName = pieces[pieces.length - 1];
	}
	if (moduleName.endsWith(".js")) moduleName = moduleName.slice(0, -3);
	return `${moduleName}:${functionName}`;
}
function serializePathAndArgs(udfPath, args) {
	return JSON.stringify({
		udfPath: canonicalizeUdfPath(udfPath),
		args: convexToJson(args),
	});
}
function serializePaginatedPathAndArgs(udfPath, args, options) {
	const { initialNumItems, id } = options;
	return JSON.stringify({
		type: "paginated",
		udfPath: canonicalizeUdfPath(udfPath),
		args: convexToJson(args),
		options: convexToJson({
			initialNumItems,
			id,
		}),
	});
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/local_state.js
var __defProp$9 = Object.defineProperty;
var __defNormalProp$9 = (obj, key, value) =>
	key in obj
		? __defProp$9(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$9 = (obj, key, value) => __defNormalProp$9(obj, typeof key !== "symbol" ? key + "" : key, value);
var LocalSyncState = class {
	constructor() {
		__publicField$9(this, "nextQueryId");
		__publicField$9(this, "querySetVersion");
		__publicField$9(this, "querySet");
		__publicField$9(this, "queryIdToToken");
		__publicField$9(this, "identityVersion");
		__publicField$9(this, "auth");
		__publicField$9(this, "outstandingQueriesOlderThanRestart");
		__publicField$9(this, "outstandingAuthOlderThanRestart");
		__publicField$9(this, "paused");
		__publicField$9(this, "pendingQuerySetModifications");
		this.nextQueryId = 0;
		this.querySetVersion = 0;
		this.identityVersion = 0;
		this.querySet = /* @__PURE__ */ new Map();
		this.queryIdToToken = /* @__PURE__ */ new Map();
		this.outstandingQueriesOlderThanRestart = /* @__PURE__ */ new Set();
		this.outstandingAuthOlderThanRestart = false;
		this.paused = false;
		this.pendingQuerySetModifications = /* @__PURE__ */ new Map();
	}
	hasSyncedPastLastReconnect() {
		return this.outstandingQueriesOlderThanRestart.size === 0 && !this.outstandingAuthOlderThanRestart;
	}
	markAuthCompletion() {
		this.outstandingAuthOlderThanRestart = false;
	}
	subscribe(udfPath, args, journal, componentPath) {
		const canonicalizedUdfPath = canonicalizeUdfPath(udfPath);
		const queryToken = serializePathAndArgs(canonicalizedUdfPath, args);
		const existingEntry = this.querySet.get(queryToken);
		if (existingEntry !== void 0) {
			existingEntry.numSubscribers += 1;
			return {
				queryToken,
				modification: null,
				unsubscribe: () => this.removeSubscriber(queryToken),
			};
		} else {
			const queryId = this.nextQueryId++;
			const query = {
				id: queryId,
				canonicalizedUdfPath,
				args,
				numSubscribers: 1,
				journal,
				componentPath,
			};
			this.querySet.set(queryToken, query);
			this.queryIdToToken.set(queryId, queryToken);
			const baseVersion = this.querySetVersion;
			const newVersion = this.querySetVersion + 1;
			const add = {
				type: "Add",
				queryId,
				udfPath: canonicalizedUdfPath,
				args: [convexToJson(args)],
				journal,
				componentPath,
			};
			if (this.paused) this.pendingQuerySetModifications.set(queryId, add);
			else this.querySetVersion = newVersion;
			return {
				queryToken,
				modification: {
					type: "ModifyQuerySet",
					baseVersion,
					newVersion,
					modifications: [add],
				},
				unsubscribe: () => this.removeSubscriber(queryToken),
			};
		}
	}
	transition(transition) {
		for (const modification of transition.modifications)
			switch (modification.type) {
				case "QueryUpdated":
				case "QueryFailed": {
					this.outstandingQueriesOlderThanRestart.delete(modification.queryId);
					const journal = modification.journal;
					if (journal !== void 0) {
						const queryToken = this.queryIdToToken.get(modification.queryId);
						if (queryToken !== void 0) this.querySet.get(queryToken).journal = journal;
					}
					break;
				}
				case "QueryRemoved":
					this.outstandingQueriesOlderThanRestart.delete(modification.queryId);
					break;
				default:
					throw new Error(`Invalid modification ${modification.type}`);
			}
	}
	queryId(udfPath, args) {
		const queryToken = serializePathAndArgs(canonicalizeUdfPath(udfPath), args);
		const existingEntry = this.querySet.get(queryToken);
		if (existingEntry !== void 0) return existingEntry.id;
		return null;
	}
	isCurrentOrNewerAuthVersion(version) {
		return version >= this.identityVersion;
	}
	getAuth() {
		return this.auth;
	}
	setAuth(value) {
		this.auth = {
			tokenType: "User",
			value,
		};
		const baseVersion = this.identityVersion;
		if (!this.paused) this.identityVersion = baseVersion + 1;
		return {
			type: "Authenticate",
			baseVersion,
			...this.auth,
		};
	}
	setAdminAuth(value, actingAs) {
		const auth = {
			tokenType: "Admin",
			value,
			impersonating: actingAs,
		};
		this.auth = auth;
		const baseVersion = this.identityVersion;
		if (!this.paused) this.identityVersion = baseVersion + 1;
		return {
			type: "Authenticate",
			baseVersion,
			...auth,
		};
	}
	clearAuth() {
		this.auth = void 0;
		this.markAuthCompletion();
		const baseVersion = this.identityVersion;
		if (!this.paused) this.identityVersion = baseVersion + 1;
		return {
			type: "Authenticate",
			tokenType: "None",
			baseVersion,
		};
	}
	hasAuth() {
		return !!this.auth;
	}
	isNewAuth(value) {
		return this.auth?.value !== value;
	}
	queryPath(queryId) {
		const pathAndArgs = this.queryIdToToken.get(queryId);
		if (pathAndArgs) return this.querySet.get(pathAndArgs).canonicalizedUdfPath;
		return null;
	}
	queryArgs(queryId) {
		const pathAndArgs = this.queryIdToToken.get(queryId);
		if (pathAndArgs) return this.querySet.get(pathAndArgs).args;
		return null;
	}
	queryToken(queryId) {
		return this.queryIdToToken.get(queryId) ?? null;
	}
	queryJournal(queryToken) {
		return this.querySet.get(queryToken)?.journal;
	}
	restart() {
		this.unpause();
		this.outstandingQueriesOlderThanRestart.clear();
		const modifications = [];
		for (const localQuery of this.querySet.values()) {
			const add = {
				type: "Add",
				queryId: localQuery.id,
				udfPath: localQuery.canonicalizedUdfPath,
				args: [convexToJson(localQuery.args)],
				journal: localQuery.journal,
				componentPath: localQuery.componentPath,
			};
			modifications.push(add);
			this.outstandingQueriesOlderThanRestart.add(localQuery.id);
		}
		this.querySetVersion = 1;
		const querySet = {
			type: "ModifyQuerySet",
			baseVersion: 0,
			newVersion: 1,
			modifications,
		};
		if (!this.auth) {
			this.identityVersion = 0;
			return [querySet, void 0];
		}
		this.outstandingAuthOlderThanRestart = true;
		const authenticate = {
			type: "Authenticate",
			baseVersion: 0,
			...this.auth,
		};
		this.identityVersion = 1;
		return [querySet, authenticate];
	}
	pause() {
		this.paused = true;
	}
	resume() {
		const querySet =
			this.pendingQuerySetModifications.size > 0
				? {
						type: "ModifyQuerySet",
						baseVersion: this.querySetVersion,
						newVersion: ++this.querySetVersion,
						modifications: Array.from(this.pendingQuerySetModifications.values()),
					}
				: void 0;
		const authenticate =
			this.auth !== void 0
				? {
						type: "Authenticate",
						baseVersion: this.identityVersion++,
						...this.auth,
					}
				: void 0;
		this.unpause();
		return [querySet, authenticate];
	}
	unpause() {
		this.paused = false;
		this.pendingQuerySetModifications.clear();
	}
	removeSubscriber(queryToken) {
		const localQuery = this.querySet.get(queryToken);
		if (localQuery.numSubscribers > 1) {
			localQuery.numSubscribers -= 1;
			return null;
		} else {
			this.querySet.delete(queryToken);
			this.queryIdToToken.delete(localQuery.id);
			this.outstandingQueriesOlderThanRestart.delete(localQuery.id);
			const baseVersion = this.querySetVersion;
			const newVersion = this.querySetVersion + 1;
			const remove = {
				type: "Remove",
				queryId: localQuery.id,
			};
			if (this.paused) {
				if (this.pendingQuerySetModifications.has(localQuery.id))
					this.pendingQuerySetModifications.delete(localQuery.id);
				else this.pendingQuerySetModifications.set(localQuery.id, remove);
			} else this.querySetVersion = newVersion;
			return {
				type: "ModifyQuerySet",
				baseVersion,
				newVersion,
				modifications: [remove],
			};
		}
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/request_manager.js
var __defProp$8 = Object.defineProperty;
var __defNormalProp$8 = (obj, key, value) =>
	key in obj
		? __defProp$8(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$8 = (obj, key, value) => __defNormalProp$8(obj, typeof key !== "symbol" ? key + "" : key, value);
var RequestManager = class {
	constructor(logger, markConnectionStateDirty) {
		this.logger = logger;
		this.markConnectionStateDirty = markConnectionStateDirty;
		__publicField$8(this, "inflightRequests");
		__publicField$8(this, "requestsOlderThanRestart");
		__publicField$8(this, "inflightMutationsCount", 0);
		__publicField$8(this, "inflightActionsCount", 0);
		this.inflightRequests = /* @__PURE__ */ new Map();
		this.requestsOlderThanRestart = /* @__PURE__ */ new Set();
	}
	request(message, sent) {
		const result = new Promise((resolve) => {
			const status = sent ? "Requested" : "NotSent";
			this.inflightRequests.set(message.requestId, {
				message,
				status: {
					status,
					requestedAt: /* @__PURE__ */ new Date(),
					onResult: resolve,
				},
			});
			if (message.type === "Mutation") this.inflightMutationsCount++;
			else if (message.type === "Action") this.inflightActionsCount++;
		});
		this.markConnectionStateDirty();
		return result;
	}
	/**
	 * Update the state after receiving a response.
	 *
	 * @returns A RequestId if the request is complete and its optimistic update
	 * can be dropped, null otherwise.
	 */
	onResponse(response) {
		const requestInfo = this.inflightRequests.get(response.requestId);
		if (requestInfo === void 0) return null;
		if (requestInfo.status.status === "Completed") return null;
		const udfType = requestInfo.message.type === "Mutation" ? "mutation" : "action";
		const udfPath = requestInfo.message.udfPath;
		for (const line of response.logLines) logForFunction(this.logger, "info", udfType, udfPath, line);
		const status = requestInfo.status;
		let result;
		let onResolve;
		if (response.success) {
			result = {
				success: true,
				logLines: response.logLines,
				value: jsonToConvex(response.result),
			};
			onResolve = () => status.onResult(result);
		} else {
			const errorMessage = response.result;
			const { errorData } = response;
			logForFunction(this.logger, "error", udfType, udfPath, errorMessage);
			result = {
				success: false,
				errorMessage,
				errorData: errorData !== void 0 ? jsonToConvex(errorData) : void 0,
				logLines: response.logLines,
			};
			onResolve = () => status.onResult(result);
		}
		if (response.type === "ActionResponse" || !response.success) {
			onResolve();
			this.inflightRequests.delete(response.requestId);
			this.requestsOlderThanRestart.delete(response.requestId);
			if (requestInfo.message.type === "Action") this.inflightActionsCount--;
			else if (requestInfo.message.type === "Mutation") this.inflightMutationsCount--;
			this.markConnectionStateDirty();
			return {
				requestId: response.requestId,
				result,
			};
		}
		requestInfo.status = {
			status: "Completed",
			result,
			ts: response.ts,
			onResolve,
		};
		return null;
	}
	removeCompleted(ts) {
		const completeRequests = /* @__PURE__ */ new Map();
		for (const [requestId, requestInfo] of this.inflightRequests.entries()) {
			const status = requestInfo.status;
			if (status.status === "Completed" && status.ts.lessThanOrEqual(ts)) {
				status.onResolve();
				completeRequests.set(requestId, status.result);
				if (requestInfo.message.type === "Mutation") this.inflightMutationsCount--;
				else if (requestInfo.message.type === "Action") this.inflightActionsCount--;
				this.inflightRequests.delete(requestId);
				this.requestsOlderThanRestart.delete(requestId);
			}
		}
		if (completeRequests.size > 0) this.markConnectionStateDirty();
		return completeRequests;
	}
	restart() {
		this.requestsOlderThanRestart = new Set(this.inflightRequests.keys());
		const allMessages = [];
		for (const [requestId, value] of this.inflightRequests) {
			if (value.status.status === "NotSent") {
				value.status.status = "Requested";
				allMessages.push(value.message);
				continue;
			}
			if (value.message.type === "Mutation") allMessages.push(value.message);
			else if (value.message.type === "Action") {
				this.inflightRequests.delete(requestId);
				this.requestsOlderThanRestart.delete(requestId);
				this.inflightActionsCount--;
				if (value.status.status === "Completed") throw new Error("Action should never be in 'Completed' state");
				value.status.onResult({
					success: false,
					errorMessage: "Connection lost while action was in flight",
					logLines: [],
				});
			}
		}
		this.markConnectionStateDirty();
		return allMessages;
	}
	resume() {
		const allMessages = [];
		for (const [, value] of this.inflightRequests)
			if (value.status.status === "NotSent") {
				value.status.status = "Requested";
				allMessages.push(value.message);
				continue;
			}
		return allMessages;
	}
	/**
	 * @returns true if there are any requests that have been requested but have
	 * not be completed yet.
	 */
	hasIncompleteRequests() {
		for (const requestInfo of this.inflightRequests.values())
			if (requestInfo.status.status === "Requested") return true;
		return false;
	}
	/**
	 * @returns true if there are any inflight requests, including ones that have
	 * completed on the server, but have not been applied.
	 */
	hasInflightRequests() {
		return this.inflightRequests.size > 0;
	}
	/**
	 * @returns true if there are any inflight requests, that have been hanging around
	 * since prior to the most recent restart.
	 */
	hasSyncedPastLastReconnect() {
		return this.requestsOlderThanRestart.size === 0;
	}
	timeOfOldestInflightRequest() {
		if (this.inflightRequests.size === 0) return null;
		let oldestInflightRequest = Date.now();
		for (const request of this.inflightRequests.values())
			if (request.status.status !== "Completed") {
				if (request.status.requestedAt.getTime() < oldestInflightRequest)
					oldestInflightRequest = request.status.requestedAt.getTime();
			}
		return new Date(oldestInflightRequest);
	}
	/**
	 * @returns The number of mutations currently in flight.
	 */
	inflightMutations() {
		return this.inflightMutationsCount;
	}
	/**
	 * @returns The number of actions currently in flight.
	 */
	inflightActions() {
		return this.inflightActionsCount;
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/server/functionName.js
var functionName = Symbol.for("functionName");
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/server/components/paths.js
var toReferencePath = Symbol.for("toReferencePath");
function extractReferencePath(reference) {
	return reference[toReferencePath] ?? null;
}
function isFunctionHandle(s) {
	return s.startsWith("function://");
}
function getFunctionAddress(functionReference) {
	let functionAddress;
	if (typeof functionReference === "string") {
		if (isFunctionHandle(functionReference)) functionAddress = { functionHandle: functionReference };
		else functionAddress = { name: functionReference };
	} else if (functionReference[functionName]) functionAddress = { name: functionReference[functionName] };
	else {
		const referencePath = extractReferencePath(functionReference);
		if (!referencePath) throw new Error(`${functionReference} is not a functionReference`);
		functionAddress = { reference: referencePath };
	}
	return functionAddress;
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/server/api.js
function getFunctionName(functionReference) {
	const address = getFunctionAddress(functionReference);
	if (address.name === void 0) {
		if (address.functionHandle !== void 0)
			throw new Error(
				`Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`,
			);
		else if (address.reference !== void 0)
			throw new Error(
				`Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`,
			);
		throw new Error(
			`Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`,
		);
	}
	if (typeof functionReference === "string") return functionReference;
	const name = functionReference[functionName];
	if (!name) throw new Error(`${functionReference} is not a functionReference`);
	return name;
}
function createApi(pathParts = []) {
	return new Proxy(
		{},
		{
			get(_, prop) {
				if (typeof prop === "string") return createApi([...pathParts, prop]);
				else if (prop === functionName) {
					if (pathParts.length < 2) {
						const found = ["api", ...pathParts].join(".");
						throw new Error(
							`API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``,
						);
					}
					const path = pathParts.slice(0, -1).join("/");
					const exportName = pathParts[pathParts.length - 1];
					if (exportName === "default") return path;
					else return path + ":" + exportName;
				} else if (prop === Symbol.toStringTag) return "FunctionReference";
				else return;
			},
		},
	);
}
var anyApi = createApi();
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/optimistic_updates_impl.js
var __defProp$7 = Object.defineProperty;
var __defNormalProp$7 = (obj, key, value) =>
	key in obj
		? __defProp$7(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
var OptimisticLocalStoreImpl = class OptimisticLocalStoreImpl {
	constructor(queryResults) {
		__publicField$7(this, "queryResults");
		__publicField$7(this, "modifiedQueries");
		this.queryResults = queryResults;
		this.modifiedQueries = [];
	}
	getQuery(query, ...args) {
		const queryArgs = parseArgs(args[0]);
		const name = getFunctionName(query);
		const queryResult = this.queryResults.get(serializePathAndArgs(name, queryArgs));
		if (queryResult === void 0) return;
		return OptimisticLocalStoreImpl.queryValue(queryResult.result);
	}
	getAllQueries(query) {
		const queriesWithName = [];
		const name = getFunctionName(query);
		for (const queryResult of this.queryResults.values())
			if (queryResult.udfPath === canonicalizeUdfPath(name))
				queriesWithName.push({
					args: queryResult.args,
					value: OptimisticLocalStoreImpl.queryValue(queryResult.result),
				});
		return queriesWithName;
	}
	setQuery(queryReference, args, value) {
		const queryArgs = parseArgs(args);
		const name = getFunctionName(queryReference);
		const queryToken = serializePathAndArgs(name, queryArgs);
		let result;
		if (value === void 0) result = void 0;
		else
			result = {
				success: true,
				value,
				logLines: [],
			};
		const query = {
			udfPath: name,
			args: queryArgs,
			result,
		};
		this.queryResults.set(queryToken, query);
		this.modifiedQueries.push(queryToken);
	}
	static queryValue(result) {
		if (result === void 0) return;
		else if (result.success) return result.value;
		else return;
	}
};
var OptimisticQueryResults = class {
	constructor() {
		__publicField$7(this, "queryResults");
		__publicField$7(this, "optimisticUpdates");
		this.queryResults = /* @__PURE__ */ new Map();
		this.optimisticUpdates = [];
	}
	/**
	 * Apply all optimistic updates on top of server query results
	 */
	ingestQueryResultsFromServer(serverQueryResults, optimisticUpdatesToDrop) {
		this.optimisticUpdates = this.optimisticUpdates.filter((updateAndId) => {
			return !optimisticUpdatesToDrop.has(updateAndId.mutationId);
		});
		const oldQueryResults = this.queryResults;
		this.queryResults = new Map(serverQueryResults);
		const localStore = new OptimisticLocalStoreImpl(this.queryResults);
		for (const updateAndId of this.optimisticUpdates) updateAndId.update(localStore);
		const changedQueries = [];
		for (const [queryToken, query] of this.queryResults) {
			const oldQuery = oldQueryResults.get(queryToken);
			if (oldQuery === void 0 || oldQuery.result !== query.result) changedQueries.push(queryToken);
		}
		return changedQueries;
	}
	applyOptimisticUpdate(update, mutationId) {
		this.optimisticUpdates.push({
			update,
			mutationId,
		});
		const localStore = new OptimisticLocalStoreImpl(this.queryResults);
		update(localStore);
		return localStore.modifiedQueries;
	}
	/**
	 * "Raw" with respect to errors vs values, but query results still have
	 * optimistic updates applied.
	 *
	 * @internal
	 */
	rawQueryResult(queryToken) {
		const query = this.queryResults.get(queryToken);
		if (query === void 0) return;
		return query.result;
	}
	queryResult(queryToken) {
		const query = this.queryResults.get(queryToken);
		if (query === void 0) return;
		const result = query.result;
		if (result === void 0) return;
		else if (result.success) return result.value;
		else {
			if (result.errorData !== void 0)
				throw forwardData(result, new ConvexError(createHybridErrorStacktrace("query", query.udfPath, result)));
			throw new Error(createHybridErrorStacktrace("query", query.udfPath, result));
		}
	}
	hasQueryResult(queryToken) {
		return this.queryResults.get(queryToken) !== void 0;
	}
	/**
	 * @internal
	 */
	queryLogs(queryToken) {
		return this.queryResults.get(queryToken)?.result?.logLines;
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/vendor/long.js
var __defProp$6 = Object.defineProperty;
var __defNormalProp$6 = (obj, key, value) =>
	key in obj
		? __defProp$6(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
var Long = class Long {
	constructor(low, high) {
		__publicField$6(this, "low");
		__publicField$6(this, "high");
		__publicField$6(this, "__isUnsignedLong__");
		this.low = low | 0;
		this.high = high | 0;
		this.__isUnsignedLong__ = true;
	}
	static isLong(obj) {
		return (obj && obj.__isUnsignedLong__) === true;
	}
	static fromBytesLE(bytes) {
		return new Long(
			bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24),
			bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24),
		);
	}
	toBytesLE() {
		const hi = this.high;
		const lo = this.low;
		return [
			lo & 255,
			(lo >>> 8) & 255,
			(lo >>> 16) & 255,
			lo >>> 24,
			hi & 255,
			(hi >>> 8) & 255,
			(hi >>> 16) & 255,
			hi >>> 24,
		];
	}
	static fromNumber(value) {
		if (isNaN(value)) return UZERO;
		if (value < 0) return UZERO;
		if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
		return new Long((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0);
	}
	toString() {
		return (BigInt(this.high) * BigInt(TWO_PWR_32_DBL) + BigInt(this.low)).toString();
	}
	equals(other) {
		if (!Long.isLong(other)) other = Long.fromValue(other);
		if (this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
		return this.high === other.high && this.low === other.low;
	}
	notEquals(other) {
		return !this.equals(other);
	}
	comp(other) {
		if (!Long.isLong(other)) other = Long.fromValue(other);
		if (this.equals(other)) return 0;
		return other.high >>> 0 > this.high >>> 0 || (other.high === this.high && other.low >>> 0 > this.low >>> 0)
			? -1
			: 1;
	}
	lessThanOrEqual(other) {
		return this.comp(other) <= 0;
	}
	static fromValue(val) {
		if (typeof val === "number") return Long.fromNumber(val);
		return new Long(val.low, val.high);
	}
};
var UZERO = new Long(0, 0);
var TWO_PWR_16_DBL = 65536;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var MAX_UNSIGNED_VALUE = new Long(-1, -1);
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/remote_query_set.js
var __defProp$5 = Object.defineProperty;
var __defNormalProp$5 = (obj, key, value) =>
	key in obj
		? __defProp$5(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
var RemoteQuerySet = class {
	constructor(queryPath, logger) {
		__publicField$5(this, "version");
		__publicField$5(this, "remoteQuerySet");
		__publicField$5(this, "queryPath");
		__publicField$5(this, "logger");
		this.version = {
			querySet: 0,
			ts: Long.fromNumber(0),
			identity: 0,
		};
		this.remoteQuerySet = /* @__PURE__ */ new Map();
		this.queryPath = queryPath;
		this.logger = logger;
	}
	transition(transition) {
		const start = transition.startVersion;
		if (
			this.version.querySet !== start.querySet ||
			this.version.ts.notEquals(start.ts) ||
			this.version.identity !== start.identity
		)
			throw new Error(
				`Invalid start version: ${start.ts.toString()}:${start.querySet}:${start.identity}, transitioning from ${this.version.ts.toString()}:${this.version.querySet}:${this.version.identity}`,
			);
		for (const modification of transition.modifications)
			switch (modification.type) {
				case "QueryUpdated": {
					const queryPath = this.queryPath(modification.queryId);
					if (queryPath)
						for (const line of modification.logLines) logForFunction(this.logger, "info", "query", queryPath, line);
					const value = jsonToConvex(modification.value ?? null);
					this.remoteQuerySet.set(modification.queryId, {
						success: true,
						value,
						logLines: modification.logLines,
					});
					break;
				}
				case "QueryFailed": {
					const queryPath = this.queryPath(modification.queryId);
					if (queryPath)
						for (const line of modification.logLines) logForFunction(this.logger, "info", "query", queryPath, line);
					const { errorData } = modification;
					this.remoteQuerySet.set(modification.queryId, {
						success: false,
						errorMessage: modification.errorMessage,
						errorData: errorData !== void 0 ? jsonToConvex(errorData) : void 0,
						logLines: modification.logLines,
					});
					break;
				}
				case "QueryRemoved":
					this.remoteQuerySet.delete(modification.queryId);
					break;
				default:
					throw new Error(`Invalid modification ${modification.type}`);
			}
		this.version = transition.endVersion;
	}
	remoteQueryResults() {
		return this.remoteQuerySet;
	}
	timestamp() {
		return this.version.ts;
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/protocol.js
function u64ToLong(encoded) {
	const integerBytes = toByteArray(encoded);
	return Long.fromBytesLE(Array.from(integerBytes));
}
function longToU64(raw) {
	return fromByteArray(new Uint8Array(raw.toBytesLE()));
}
function parseServerMessage(encoded) {
	switch (encoded.type) {
		case "FatalError":
		case "AuthError":
		case "ActionResponse":
		case "TransitionChunk":
		case "Ping":
			return { ...encoded };
		case "MutationResponse":
			if (encoded.success)
				return {
					...encoded,
					ts: u64ToLong(encoded.ts),
				};
			else return { ...encoded };
		case "Transition":
			return {
				...encoded,
				startVersion: {
					...encoded.startVersion,
					ts: u64ToLong(encoded.startVersion.ts),
				},
				endVersion: {
					...encoded.endVersion,
					ts: u64ToLong(encoded.endVersion.ts),
				},
			};
	}
}
function encodeClientMessage(message) {
	switch (message.type) {
		case "Authenticate":
		case "ModifyQuerySet":
		case "Mutation":
		case "Action":
		case "Event":
			return { ...message };
		case "Connect":
			if (message.maxObservedTimestamp !== void 0)
				return {
					...message,
					maxObservedTimestamp: longToU64(message.maxObservedTimestamp),
				};
			else
				return {
					...message,
					maxObservedTimestamp: void 0,
				};
	}
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/web_socket_manager.js
var __defProp$4 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) =>
	key in obj
		? __defProp$4(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
var CLOSE_NORMAL = 1e3;
var CLOSE_GOING_AWAY = 1001;
var CLOSE_NO_STATUS = 1005;
var CLOSE_NOT_FOUND = 4040;
var firstTime;
function monotonicMillis() {
	if (firstTime === void 0) firstTime = Date.now();
	if (typeof performance === "undefined" || !performance.now) return Date.now();
	return Math.round(firstTime + performance.now());
}
function prettyNow() {
	return `t=${Math.round((monotonicMillis() - firstTime) / 100) / 10}s`;
}
var serverDisconnectErrors = {
	InternalServerError: { timeout: 1e3 },
	SubscriptionsWorkerFullError: { timeout: 3e3 },
	TooManyConcurrentRequests: { timeout: 3e3 },
	CommitterFullError: { timeout: 3e3 },
	AwsTooManyRequestsException: { timeout: 3e3 },
	ExecuteFullError: { timeout: 3e3 },
	SystemTimeoutError: { timeout: 3e3 },
	ExpiredInQueue: { timeout: 3e3 },
	VectorIndexesUnavailable: { timeout: 1e3 },
	SearchIndexesUnavailable: { timeout: 1e3 },
	TableSummariesUnavailable: { timeout: 1e3 },
	VectorIndexTooLarge: { timeout: 3e3 },
	SearchIndexTooLarge: { timeout: 3e3 },
	TooManyWritesInTimePeriod: { timeout: 3e3 },
};
function classifyDisconnectError(s) {
	if (s === void 0) return "Unknown";
	for (const prefix of Object.keys(serverDisconnectErrors)) if (s.startsWith(prefix)) return prefix;
	return "Unknown";
}
var WebSocketManager = class {
	constructor(uri, callbacks, webSocketConstructor, logger, markConnectionStateDirty, debug) {
		this.markConnectionStateDirty = markConnectionStateDirty;
		this.debug = debug;
		__publicField$4(this, "socket");
		__publicField$4(this, "connectionCount");
		__publicField$4(this, "_hasEverConnected", false);
		__publicField$4(this, "lastCloseReason");
		__publicField$4(this, "transitionChunkBuffer", null);
		/** Upon HTTPS/WSS failure, the first jittered backoff duration, in ms. */
		__publicField$4(this, "defaultInitialBackoff");
		/** We backoff exponentially, but we need to cap that--this is the jittered max. */
		__publicField$4(this, "maxBackoff");
		/** How many times have we failed consecutively? */
		__publicField$4(this, "retries");
		/** How long before lack of server response causes us to initiate a reconnect,
		 * in ms */
		__publicField$4(this, "serverInactivityThreshold");
		__publicField$4(this, "reconnectDueToServerInactivityTimeout");
		/** Scheduled reconnect state: timeout handle and timing info */
		__publicField$4(this, "scheduledReconnect", null);
		__publicField$4(this, "networkOnlineHandler", null);
		/** Pending event to send after reconnecting due to network recovery */
		__publicField$4(this, "pendingNetworkRecoveryInfo", null);
		__publicField$4(this, "uri");
		__publicField$4(this, "onOpen");
		__publicField$4(this, "onResume");
		__publicField$4(this, "onMessage");
		__publicField$4(this, "webSocketConstructor");
		__publicField$4(this, "logger");
		__publicField$4(this, "onServerDisconnectError");
		this.webSocketConstructor = webSocketConstructor;
		this.socket = { state: "disconnected" };
		this.connectionCount = 0;
		this.lastCloseReason = "InitialConnect";
		this.defaultInitialBackoff = 1e3;
		this.maxBackoff = 16e3;
		this.retries = 0;
		this.serverInactivityThreshold = 6e4;
		this.reconnectDueToServerInactivityTimeout = null;
		this.uri = uri;
		this.onOpen = callbacks.onOpen;
		this.onResume = callbacks.onResume;
		this.onMessage = callbacks.onMessage;
		this.onServerDisconnectError = callbacks.onServerDisconnectError;
		this.logger = logger;
		this.setupNetworkListener();
		this.connect();
	}
	setSocketState(state) {
		this.socket = state;
		this._logVerbose(
			`socket state changed: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}`,
		);
		this.markConnectionStateDirty();
	}
	setupNetworkListener() {
		if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
		if (this.networkOnlineHandler !== null) return;
		this.networkOnlineHandler = () => {
			this._logVerbose("network online event detected");
			this.tryReconnectImmediately();
		};
		window.addEventListener("online", this.networkOnlineHandler);
		this._logVerbose("network online event listener registered");
	}
	cleanupNetworkListener() {
		if (
			this.networkOnlineHandler &&
			typeof window !== "undefined" &&
			typeof window.removeEventListener === "function"
		) {
			window.removeEventListener("online", this.networkOnlineHandler);
			this.networkOnlineHandler = null;
			this._logVerbose("network online event listener removed");
		}
	}
	assembleTransition(chunk) {
		if (
			chunk.partNumber < 0 ||
			chunk.partNumber >= chunk.totalParts ||
			chunk.totalParts === 0 ||
			(this.transitionChunkBuffer &&
				(this.transitionChunkBuffer.totalParts !== chunk.totalParts ||
					this.transitionChunkBuffer.transitionId !== chunk.transitionId))
		) {
			this.transitionChunkBuffer = null;
			throw new Error("Invalid TransitionChunk");
		}
		if (this.transitionChunkBuffer === null)
			this.transitionChunkBuffer = {
				chunks: [],
				totalParts: chunk.totalParts,
				transitionId: chunk.transitionId,
			};
		if (chunk.partNumber !== this.transitionChunkBuffer.chunks.length) {
			const expectedLength = this.transitionChunkBuffer.chunks.length;
			this.transitionChunkBuffer = null;
			throw new Error(
				`TransitionChunk received out of order: expected part ${expectedLength}, got ${chunk.partNumber}`,
			);
		}
		this.transitionChunkBuffer.chunks.push(chunk.chunk);
		if (this.transitionChunkBuffer.chunks.length === chunk.totalParts) {
			const fullJson = this.transitionChunkBuffer.chunks.join("");
			this.transitionChunkBuffer = null;
			const transition = parseServerMessage(JSON.parse(fullJson));
			if (transition.type !== "Transition")
				throw new Error(`Expected Transition, got ${transition.type} after assembling chunks`);
			return transition;
		}
		return null;
	}
	connect() {
		if (this.socket.state === "terminated") return;
		if (this.socket.state !== "disconnected" && this.socket.state !== "stopped")
			throw new Error("Didn't start connection from disconnected state: " + this.socket.state);
		const ws = new this.webSocketConstructor(this.uri);
		this._logVerbose("constructed WebSocket");
		this.setSocketState({
			state: "connecting",
			ws,
			paused: "no",
		});
		this.resetServerInactivityTimeout();
		ws.onopen = () => {
			this.logger.logVerbose("begin ws.onopen");
			if (this.socket.state !== "connecting") throw new Error("onopen called with socket not in connecting state");
			this.setSocketState({
				state: "ready",
				ws,
				paused: this.socket.paused === "yes" ? "uninitialized" : "no",
			});
			this.resetServerInactivityTimeout();
			if (this.socket.paused === "no") {
				this._hasEverConnected = true;
				this.onOpen({
					connectionCount: this.connectionCount,
					lastCloseReason: this.lastCloseReason,
					clientTs: monotonicMillis(),
				});
			}
			if (this.lastCloseReason !== "InitialConnect") {
				if (this.lastCloseReason)
					this.logger.log("WebSocket reconnected at", prettyNow(), "after disconnect due to", this.lastCloseReason);
				else this.logger.log("WebSocket reconnected at", prettyNow());
			}
			this.connectionCount += 1;
			this.lastCloseReason = null;
			if (this.pendingNetworkRecoveryInfo !== null) {
				const { timeSavedMs } = this.pendingNetworkRecoveryInfo;
				this.pendingNetworkRecoveryInfo = null;
				this.sendMessage({
					type: "Event",
					eventType: "NetworkRecoveryReconnect",
					event: { timeSavedMs },
				});
				this.logger.log(`Network recovery reconnect saved ~${Math.round(timeSavedMs / 1e3)}s of waiting`);
			}
		};
		ws.onerror = (error) => {
			this.transitionChunkBuffer = null;
			const message = error.message;
			if (message) this.logger.log(`WebSocket error message: ${message}`);
		};
		ws.onmessage = (message) => {
			this.resetServerInactivityTimeout();
			const messageLength = message.data.length;
			let serverMessage = parseServerMessage(JSON.parse(message.data));
			this._logVerbose(`received ws message with type ${serverMessage.type}`);
			if (serverMessage.type === "Ping") return;
			if (serverMessage.type === "TransitionChunk") {
				const transition = this.assembleTransition(serverMessage);
				if (!transition) return;
				serverMessage = transition;
				this._logVerbose(`assembled full ws message of type ${serverMessage.type}`);
			}
			if (this.transitionChunkBuffer !== null) {
				this.transitionChunkBuffer = null;
				this.logger.log(`Received unexpected ${serverMessage.type} while buffering TransitionChunks`);
			}
			if (serverMessage.type === "Transition")
				this.reportLargeTransition({
					messageLength,
					transition: serverMessage,
				});
			if (this.onMessage(serverMessage).hasSyncedPastLastReconnect) {
				this.retries = 0;
				this.markConnectionStateDirty();
			}
		};
		ws.onclose = (event) => {
			this._logVerbose("begin ws.onclose");
			this.transitionChunkBuffer = null;
			if (this.lastCloseReason === null) this.lastCloseReason = event.reason || `closed with code ${event.code}`;
			if (
				event.code !== CLOSE_NORMAL &&
				event.code !== CLOSE_GOING_AWAY &&
				event.code !== CLOSE_NO_STATUS &&
				event.code !== CLOSE_NOT_FOUND
			) {
				let msg = `WebSocket closed with code ${event.code}`;
				if (event.reason) msg += `: ${event.reason}`;
				this.logger.log(msg);
				if (this.onServerDisconnectError && event.reason) this.onServerDisconnectError(msg);
			}
			const reason = classifyDisconnectError(event.reason);
			this.scheduleReconnect(reason);
		};
	}
	/**
	 * @returns The state of the {@link Socket}.
	 */
	socketState() {
		return this.socket.state;
	}
	/**
	 * @param message - A ClientMessage to send.
	 * @returns Whether the message (might have been) sent.
	 */
	sendMessage(message) {
		const messageForLog = {
			type: message.type,
			...(message.type === "Authenticate" && message.tokenType === "User"
				? { value: `...${message.value.slice(-7)}` }
				: {}),
		};
		if (this.socket.state === "ready" && this.socket.paused === "no") {
			const encodedMessage = encodeClientMessage(message);
			const request = JSON.stringify(encodedMessage);
			let sent = false;
			try {
				this.socket.ws.send(request);
				sent = true;
			} catch (error) {
				this.logger.log(`Failed to send message on WebSocket, reconnecting: ${error}`);
				this.closeAndReconnect("FailedToSendMessage");
			}
			this._logVerbose(
				`${sent ? "sent" : "failed to send"} message with type ${message.type}: ${JSON.stringify(messageForLog)}`,
			);
			return true;
		}
		this._logVerbose(
			`message not sent (socket state: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}): ${JSON.stringify(messageForLog)}`,
		);
		return false;
	}
	resetServerInactivityTimeout() {
		if (this.socket.state === "terminated") return;
		if (this.reconnectDueToServerInactivityTimeout !== null) {
			clearTimeout(this.reconnectDueToServerInactivityTimeout);
			this.reconnectDueToServerInactivityTimeout = null;
		}
		this.reconnectDueToServerInactivityTimeout = setTimeout(() => {
			this.closeAndReconnect("InactiveServer");
		}, this.serverInactivityThreshold);
	}
	scheduleReconnect(reason) {
		if (this.scheduledReconnect) {
			clearTimeout(this.scheduledReconnect.timeout);
			this.scheduledReconnect = null;
		}
		this.socket = { state: "disconnected" };
		const backoff = this.nextBackoff(reason);
		this.markConnectionStateDirty();
		this.logger.log(`Attempting reconnect in ${Math.round(backoff)}ms`);
		const scheduledAt = monotonicMillis();
		const timeoutId = setTimeout(() => {
			if (this.scheduledReconnect?.timeout === timeoutId) {
				this.scheduledReconnect = null;
				this.connect();
			}
		}, backoff);
		this.scheduledReconnect = {
			timeout: timeoutId,
			scheduledAt,
			backoffMs: backoff,
		};
	}
	/**
	 * Close the WebSocket and schedule a reconnect.
	 *
	 * This should be used when we hit an error and would like to restart the session.
	 */
	closeAndReconnect(closeReason) {
		this._logVerbose(`begin closeAndReconnect with reason ${closeReason}`);
		switch (this.socket.state) {
			case "disconnected":
			case "terminated":
			case "stopped":
				return;
			case "connecting":
			case "ready":
				this.lastCloseReason = closeReason;
				this.close();
				this.scheduleReconnect("client");
				return;
			default:
				this.socket;
		}
	}
	/**
	 * Close the WebSocket, being careful to clear the onclose handler to avoid re-entrant
	 * calls. Use this instead of directly calling `ws.close()`
	 *
	 * It is the callers responsibility to update the state after this method is called so that the
	 * closed socket is not accessible or used again after this method is called
	 */
	close() {
		this.transitionChunkBuffer = null;
		switch (this.socket.state) {
			case "disconnected":
			case "terminated":
			case "stopped":
				return Promise.resolve();
			case "connecting": {
				const ws = this.socket.ws;
				ws.onmessage = (_message) => {
					this._logVerbose("Ignoring message received after close");
				};
				return new Promise((r) => {
					ws.onclose = () => {
						this._logVerbose("Closed after connecting");
						r();
					};
					ws.onopen = () => {
						this._logVerbose("Opened after connecting");
						ws.close();
					};
				});
			}
			case "ready": {
				this._logVerbose("ws.close called");
				const ws = this.socket.ws;
				ws.onmessage = (_message) => {
					this._logVerbose("Ignoring message received after close");
				};
				const result = new Promise((r) => {
					ws.onclose = () => {
						r();
					};
				});
				ws.close();
				return result;
			}
			default:
				this.socket;
				return Promise.resolve();
		}
	}
	/**
	 * Close the WebSocket and do not reconnect.
	 * @returns A Promise that resolves when the WebSocket `onClose` callback is called.
	 */
	terminate() {
		if (this.reconnectDueToServerInactivityTimeout) clearTimeout(this.reconnectDueToServerInactivityTimeout);
		if (this.scheduledReconnect) {
			clearTimeout(this.scheduledReconnect.timeout);
			this.scheduledReconnect = null;
		}
		this.cleanupNetworkListener();
		switch (this.socket.state) {
			case "terminated":
			case "stopped":
			case "disconnected":
			case "connecting":
			case "ready": {
				const result = this.close();
				this.setSocketState({ state: "terminated" });
				return result;
			}
			default:
				this.socket;
				throw new Error(`Invalid websocket state: ${this.socket.state}`);
		}
	}
	stop() {
		switch (this.socket.state) {
			case "terminated":
				return Promise.resolve();
			case "connecting":
			case "stopped":
			case "disconnected":
			case "ready": {
				this.cleanupNetworkListener();
				const result = this.close();
				this.socket = { state: "stopped" };
				return result;
			}
			default:
				this.socket;
				return Promise.resolve();
		}
	}
	/**
	 * Create a new WebSocket after a previous `stop()`, unless `terminate()` was
	 * called before.
	 */
	tryRestart() {
		switch (this.socket.state) {
			case "stopped":
				break;
			case "terminated":
			case "connecting":
			case "ready":
			case "disconnected":
				this.logger.logVerbose("Restart called without stopping first");
				return;
			default:
				this.socket;
		}
		this.setupNetworkListener();
		this.connect();
	}
	pause() {
		switch (this.socket.state) {
			case "disconnected":
			case "stopped":
			case "terminated":
				return;
			case "connecting":
			case "ready":
				this.socket = {
					...this.socket,
					paused: "yes",
				};
				return;
			default:
				this.socket;
				return;
		}
	}
	/**
	 * Try to reconnect immediately, canceling any scheduled reconnect.
	 * This is useful when detecting network recovery.
	 * Only takes action if we're in disconnected state (waiting to reconnect).
	 */
	tryReconnectImmediately() {
		this._logVerbose("tryReconnectImmediately called");
		if (this.socket.state !== "disconnected") {
			this._logVerbose(`tryReconnectImmediately called but socket state is ${this.socket.state}, no action taken`);
			return;
		}
		let timeSavedMs = null;
		if (this.scheduledReconnect) {
			const elapsed = monotonicMillis() - this.scheduledReconnect.scheduledAt;
			timeSavedMs = Math.max(0, this.scheduledReconnect.backoffMs - elapsed);
			this._logVerbose(
				`would have waited ${Math.round(timeSavedMs)}ms more (backoff was ${Math.round(this.scheduledReconnect.backoffMs)}ms, elapsed ${Math.round(elapsed)}ms)`,
			);
			clearTimeout(this.scheduledReconnect.timeout);
			this.scheduledReconnect = null;
			this._logVerbose("canceled scheduled reconnect");
		}
		this.logger.log("Network recovery detected, reconnecting immediately");
		this.pendingNetworkRecoveryInfo = timeSavedMs !== null ? { timeSavedMs } : null;
		this.connect();
	}
	/**
	 * Resume the state machine if previously paused.
	 */
	resume() {
		switch (this.socket.state) {
			case "connecting":
				this.socket = {
					...this.socket,
					paused: "no",
				};
				return;
			case "ready":
				if (this.socket.paused === "uninitialized") {
					this.socket = {
						...this.socket,
						paused: "no",
					};
					this._hasEverConnected = true;
					this.onOpen({
						connectionCount: this.connectionCount,
						lastCloseReason: this.lastCloseReason,
						clientTs: monotonicMillis(),
					});
				} else if (this.socket.paused === "yes") {
					this.socket = {
						...this.socket,
						paused: "no",
					};
					this.onResume();
				}
				return;
			case "terminated":
			case "stopped":
			case "disconnected":
				return;
			default:
				this.socket;
		}
		this.connect();
	}
	connectionState() {
		return {
			isConnected: this.socket.state === "ready",
			hasEverConnected: this._hasEverConnected,
			connectionCount: this.connectionCount,
			connectionRetries: this.retries,
		};
	}
	_logVerbose(message) {
		this.logger.logVerbose(message);
	}
	nextBackoff(reason) {
		const baseBackoff =
			(reason === "client"
				? 100
				: reason === "Unknown"
					? this.defaultInitialBackoff
					: serverDisconnectErrors[reason].timeout) * Math.pow(2, this.retries);
		this.retries += 1;
		const actualBackoff = Math.min(baseBackoff, this.maxBackoff);
		return actualBackoff + actualBackoff * (Math.random() - 0.5);
	}
	reportLargeTransition({ transition, messageLength }) {
		if (transition.clientClockSkew === void 0 || transition.serverTs === void 0) return;
		const transitionTransitTime = monotonicMillis() - transition.clientClockSkew - transition.serverTs / 1e6;
		const prettyTransitionTime = `${Math.round(transitionTransitTime)}ms`;
		const prettyMessageMB = `${Math.round(messageLength / 1e4) / 100}MB`;
		const bytesPerSecond = messageLength / (transitionTransitTime / 1e3);
		const prettyBytesPerSecond = `${Math.round(bytesPerSecond / 1e4) / 100}MB per second`;
		this._logVerbose(`received ${prettyMessageMB} transition in ${prettyTransitionTime} at ${prettyBytesPerSecond}`);
		if (messageLength > 2e7)
			this.logger.log(
				`received query results totaling more that 20MB (${prettyMessageMB}) which will take a long time to download on slower connections`,
			);
		else if (transitionTransitTime > 2e4)
			this.logger.log(
				`received query results totaling ${prettyMessageMB} which took more than 20s to arrive (${prettyTransitionTime})`,
			);
		if (this.debug)
			this.sendMessage({
				type: "Event",
				eventType: "ClientReceivedTransition",
				event: {
					transitionTransitTime,
					messageLength,
				},
			});
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/session.js
function newSessionId() {
	return uuidv4();
}
function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		return (c === "x" ? r : (r & 3) | 8).toString(16);
	});
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/vendor/jwt-decode/index.js
var InvalidTokenError = class extends Error {};
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
	return decodeURIComponent(
		atob(str).replace(/(.)/g, (_m, p) => {
			let code = p.charCodeAt(0).toString(16).toUpperCase();
			if (code.length < 2) code = "0" + code;
			return "%" + code;
		}),
	);
}
function base64UrlDecode(str) {
	let output = str.replace(/-/g, "+").replace(/_/g, "/");
	switch (output.length % 4) {
		case 0:
			break;
		case 2:
			output += "==";
			break;
		case 3:
			output += "=";
			break;
		default:
			throw new Error("base64 string is not of the correct length");
	}
	try {
		return b64DecodeUnicode(output);
	} catch {
		return atob(output);
	}
}
function jwtDecode(token, options) {
	if (typeof token !== "string") throw new InvalidTokenError("Invalid token specified: must be a string");
	options || (options = {});
	const pos = options.header === true ? 0 : 1;
	const part = token.split(".")[pos];
	if (typeof part !== "string") throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
	let decoded;
	try {
		decoded = base64UrlDecode(part);
	} catch (e) {
		throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
	}
	try {
		return JSON.parse(decoded);
	} catch (e) {
		throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
	}
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/authentication_manager.js
var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) =>
	key in obj
		? __defProp$3(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
var MAXIMUM_REFRESH_DELAY = 1728e6;
var MAX_TOKEN_CONFIRMATION_ATTEMPTS = 2;
var AuthenticationManager = class {
	constructor(syncState, callbacks, config) {
		__publicField$3(this, "authState", { state: "noAuth" });
		__publicField$3(this, "configVersion", 0);
		__publicField$3(this, "syncState");
		__publicField$3(this, "authenticate");
		__publicField$3(this, "stopSocket");
		__publicField$3(this, "tryRestartSocket");
		__publicField$3(this, "pauseSocket");
		__publicField$3(this, "resumeSocket");
		__publicField$3(this, "clearAuth");
		__publicField$3(this, "logger");
		__publicField$3(this, "refreshTokenLeewaySeconds");
		__publicField$3(this, "initialAuthTokenReuse");
		__publicField$3(this, "lastRefreshChange");
		__publicField$3(this, "tokenConfirmationAttempts", 0);
		this.syncState = syncState;
		this.authenticate = callbacks.authenticate;
		this.stopSocket = callbacks.stopSocket;
		this.tryRestartSocket = callbacks.tryRestartSocket;
		this.pauseSocket = callbacks.pauseSocket;
		this.resumeSocket = callbacks.resumeSocket;
		this.clearAuth = callbacks.clearAuth;
		this.logger = config.logger;
		this.refreshTokenLeewaySeconds = config.refreshTokenLeewaySeconds;
		this.initialAuthTokenReuse = config.initialAuthTokenReuse;
		this.lastRefreshChange = false;
	}
	notifyRefreshChange(isRefreshing) {
		if (
			this.authState.state !== "noAuth" &&
			this.authState.state !== "initialRefetch" &&
			this.authState.config.onRefreshChange &&
			this.lastRefreshChange !== isRefreshing
		) {
			this.lastRefreshChange = isRefreshing;
			this.authState.config.onRefreshChange(isRefreshing);
		}
	}
	async setConfig(fetchToken, onChange, onRefreshChange) {
		this.resetAuthState();
		this._logVerbose("pausing WS for auth token fetch");
		this.pauseSocket();
		const token = await this.fetchTokenAndGuardAgainstRace(fetchToken, { forceRefreshToken: false });
		if (token.isFromOutdatedConfig) return;
		const config = {
			fetchToken,
			onAuthChange: onChange,
			onRefreshChange,
		};
		if (token.value) {
			this.setAuthState({
				state: "waitingForServerConfirmationOfCachedToken",
				config,
				hasRetried: false,
			});
			this.authenticate(token.value);
		} else {
			this.setAuthState({
				state: "initialRefetch",
				config,
			});
			await this.refetchToken();
		}
		this._logVerbose("resuming WS after auth token fetch");
		this.resumeSocket();
	}
	onTransition(serverMessage) {
		if (!this.syncState.isCurrentOrNewerAuthVersion(serverMessage.endVersion.identity)) return;
		if (serverMessage.endVersion.identity <= serverMessage.startVersion.identity) return;
		this._logVerbose(`auth state is ${this.authState.state} when handling transition`);
		this.syncState.markAuthCompletion();
		if (this.authState.state === "waitingForServerConfirmationOfCachedToken") {
			this._logVerbose("server confirmed auth token is valid");
			const cachedToken = this.syncState.getAuth()?.value;
			if (this.initialAuthTokenReuse && cachedToken)
				this.scheduleTokenRefetch(cachedToken, serverMessage.clientClockSkew);
			else this.refetchToken();
			this.authState.config.onAuthChange(true);
			return;
		}
		if (this.authState.state === "waitingForServerConfirmationOfFreshToken") {
			this._logVerbose("server confirmed new auth token is valid");
			this.notifyRefreshChange(false);
			this.scheduleTokenRefetch(this.authState.token);
			this.tokenConfirmationAttempts = 0;
			if (!this.authState.hadAuth) this.authState.config.onAuthChange(true);
		}
	}
	onAuthError(serverMessage) {
		if (
			serverMessage.authUpdateAttempted === false &&
			(this.authState.state === "waitingForServerConfirmationOfFreshToken" ||
				this.authState.state === "waitingForServerConfirmationOfCachedToken")
		) {
			this._logVerbose("ignoring non-auth token expired error");
			return;
		}
		const { baseVersion } = serverMessage;
		if (!this.syncState.isCurrentOrNewerAuthVersion(baseVersion + 1)) {
			this._logVerbose("ignoring auth error for previous auth attempt");
			return;
		}
		this.tryToReauthenticate(serverMessage);
	}
	async tryToReauthenticate(serverMessage) {
		this._logVerbose(`attempting to reauthenticate: ${serverMessage.error}`);
		if (
			this.authState.state === "noAuth" ||
			(this.authState.state === "waitingForServerConfirmationOfFreshToken" &&
				this.tokenConfirmationAttempts >= MAX_TOKEN_CONFIRMATION_ATTEMPTS)
		) {
			this.logger.error(`Failed to authenticate: "${serverMessage.error}", check your server auth config`);
			if (this.syncState.hasAuth()) this.syncState.clearAuth();
			if (this.authState.state !== "noAuth") this.setAndReportAuthFailed(this.authState.config.onAuthChange);
			return;
		}
		if (this.authState.state === "waitingForServerConfirmationOfFreshToken") {
			this.tokenConfirmationAttempts++;
			this._logVerbose(
				`retrying reauthentication, ${MAX_TOKEN_CONFIRMATION_ATTEMPTS - this.tokenConfirmationAttempts} attempts remaining`,
			);
		}
		this.notifyRefreshChange(true);
		await this.stopSocket();
		if (this.authState.state === "noAuth") return;
		const token = await this.fetchTokenAndGuardAgainstRace(this.authState.config.fetchToken, {
			forceRefreshToken: true,
		});
		if (token.isFromOutdatedConfig) return;
		if (token.value && this.syncState.isNewAuth(token.value)) {
			this.authenticate(token.value);
			this.setAuthState({
				state: "waitingForServerConfirmationOfFreshToken",
				config: this.authState.config,
				token: token.value,
				hadAuth: this.authState.state === "notRefetching" || this.authState.state === "waitingForScheduledRefetch",
			});
		} else {
			this._logVerbose("reauthentication failed, could not fetch a new token");
			if (this.syncState.hasAuth()) this.syncState.clearAuth();
			this.setAndReportAuthFailed(this.authState.config.onAuthChange);
		}
		this.tryRestartSocket();
	}
	async refetchToken() {
		if (this.authState.state === "noAuth") return;
		this._logVerbose("refetching auth token");
		const token = await this.fetchTokenAndGuardAgainstRace(this.authState.config.fetchToken, {
			forceRefreshToken: true,
		});
		if (token.isFromOutdatedConfig) return;
		if (token.value) {
			if (this.syncState.isNewAuth(token.value)) {
				this.setAuthState({
					state: "waitingForServerConfirmationOfFreshToken",
					hadAuth: this.syncState.hasAuth(),
					token: token.value,
					config: this.authState.config,
				});
				this.authenticate(token.value);
			} else
				this.setAuthState({
					state: "notRefetching",
					config: this.authState.config,
				});
		} else {
			this._logVerbose("refetching token failed");
			if (this.syncState.hasAuth()) this.clearAuth();
			this.setAndReportAuthFailed(this.authState.config.onAuthChange);
		}
		this._logVerbose("restarting WS after auth token fetch (if currently stopped)");
		this.tryRestartSocket();
	}
	scheduleTokenRefetch(token, clientClockSkewMs) {
		if (this.authState.state === "noAuth") return;
		const decodedToken = this.decodeToken(token);
		if (!decodedToken) {
			this.logger.error("Auth token is not a valid JWT, cannot refetch the token");
			return;
		}
		const { iat, exp } = decodedToken;
		if (!iat || !exp) {
			this.logger.error("Auth token does not have required fields, cannot refetch the token");
			return;
		}
		const fullLifetimeSeconds = exp - iat;
		if (fullLifetimeSeconds <= 2) {
			this.logger.error("Auth token does not live long enough, cannot refetch the token");
			return;
		}
		let tokenValiditySeconds;
		if (clientClockSkewMs !== void 0) {
			tokenValiditySeconds = exp - (Date.now() - clientClockSkewMs) / 1e3;
			if (tokenValiditySeconds <= 0) tokenValiditySeconds = 0;
		} else tokenValiditySeconds = fullLifetimeSeconds;
		let delay = Math.min(MAXIMUM_REFRESH_DELAY, (tokenValiditySeconds - this.refreshTokenLeewaySeconds) * 1e3);
		if (delay <= 0) {
			this.logger.warn(
				`Refetching auth token immediately, configured leeway ${this.refreshTokenLeewaySeconds}s is larger than the token's lifetime ${tokenValiditySeconds}s`,
			);
			delay = 0;
		}
		const refetchTokenTimeoutId = setTimeout(() => {
			this._logVerbose("running scheduled token refetch");
			this.refetchToken();
		}, delay);
		this.setAuthState({
			state: "waitingForScheduledRefetch",
			refetchTokenTimeoutId,
			config: this.authState.config,
		});
		this._logVerbose(`scheduled preemptive auth token refetching in ${delay}ms`);
	}
	async fetchTokenAndGuardAgainstRace(fetchToken, fetchArgs) {
		const originalConfigVersion = ++this.configVersion;
		this._logVerbose(`fetching token with config version ${originalConfigVersion}`);
		const token = await fetchToken(fetchArgs);
		if (this.configVersion !== originalConfigVersion) {
			this._logVerbose(`stale config version, expected ${originalConfigVersion}, got ${this.configVersion}`);
			return { isFromOutdatedConfig: true };
		}
		return {
			isFromOutdatedConfig: false,
			value: token,
		};
	}
	stop() {
		this.resetAuthState();
		this.configVersion++;
		this._logVerbose(`config version bumped to ${this.configVersion}`);
	}
	setAndReportAuthFailed(onAuthChange) {
		onAuthChange(false);
		this.resetAuthState();
	}
	resetAuthState() {
		this.notifyRefreshChange(false);
		this.setAuthState({ state: "noAuth" });
	}
	setAuthState(newAuth) {
		const authStateForLog =
			newAuth.state === "waitingForServerConfirmationOfFreshToken"
				? {
						hadAuth: newAuth.hadAuth,
						state: newAuth.state,
						token: `...${newAuth.token.slice(-7)}`,
					}
				: { state: newAuth.state };
		this._logVerbose(`setting auth state to ${JSON.stringify(authStateForLog)}`);
		switch (newAuth.state) {
			case "waitingForScheduledRefetch":
			case "notRefetching":
			case "noAuth":
				this.tokenConfirmationAttempts = 0;
		}
		if (this.authState.state === "waitingForScheduledRefetch") clearTimeout(this.authState.refetchTokenTimeoutId);
		this.authState = newAuth;
	}
	decodeToken(token) {
		try {
			return jwtDecode(token);
		} catch (e) {
			this._logVerbose(`Error decoding token: ${e instanceof Error ? e.message : "Unknown error"}`);
			return null;
		}
	}
	_logVerbose(message) {
		this.logger.logVerbose(`${message} [v${this.configVersion}]`);
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/metrics.js
var markNames = ["convexClientConstructed", "convexWebSocketOpen", "convexFirstMessageReceived"];
function mark(name, sessionId) {
	const detail = { sessionId };
	if (typeof performance === "undefined" || !performance.mark) return;
	performance.mark(name, { detail });
}
function performanceMarkToJson(mark2) {
	let name = mark2.name.slice(6);
	name = name.charAt(0).toLowerCase() + name.slice(1);
	return {
		name,
		startTime: mark2.startTime,
	};
}
function getMarksReport(sessionId) {
	if (typeof performance === "undefined" || !performance.getEntriesByName) return [];
	const allMarks = [];
	for (const name of markNames) {
		const marks = performance
			.getEntriesByName(name)
			.filter((entry) => entry.entryType === "mark")
			.filter((mark2) => mark2.detail.sessionId === sessionId);
		allMarks.push(...marks);
	}
	return allMarks.map(performanceMarkToJson);
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/client.js
var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) =>
	key in obj
		? __defProp$2(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var BaseConvexClient = class {
	/**
	 * @param address - The url of your Convex deployment, often provided
	 * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
	 * @param onTransition - A callback receiving an array of query tokens
	 * corresponding to query results that have changed -- additional handlers
	 * can be added via `addOnTransitionHandler`.
	 * @param options - See {@link BaseConvexClientOptions} for a full description.
	 */
	constructor(address, onTransition, options) {
		__publicField$2(this, "address");
		__publicField$2(this, "state");
		__publicField$2(this, "requestManager");
		__publicField$2(this, "webSocketManager");
		__publicField$2(this, "authenticationManager");
		__publicField$2(this, "remoteQuerySet");
		__publicField$2(this, "optimisticQueryResults");
		__publicField$2(this, "_transitionHandlerCounter", 0);
		__publicField$2(this, "_nextRequestId");
		__publicField$2(this, "_onTransitionFns", /* @__PURE__ */ new Map());
		__publicField$2(this, "_sessionId");
		__publicField$2(this, "firstMessageReceived", false);
		__publicField$2(this, "debug");
		__publicField$2(this, "logger");
		__publicField$2(this, "maxObservedTimestamp");
		__publicField$2(this, "connectionStateSubscribers", /* @__PURE__ */ new Map());
		__publicField$2(this, "nextConnectionStateSubscriberId", 0);
		__publicField$2(this, "_lastPublishedConnectionState");
		/**
		 * Call this whenever the connection state may have changed in a way that could
		 * require publishing it. Schedules a possibly update.
		 */
		__publicField$2(this, "markConnectionStateDirty", () => {
			Promise.resolve().then(() => {
				const curConnectionState = this.connectionState();
				if (JSON.stringify(curConnectionState) !== JSON.stringify(this._lastPublishedConnectionState)) {
					this._lastPublishedConnectionState = curConnectionState;
					for (const cb of this.connectionStateSubscribers.values()) cb(curConnectionState);
				}
			});
		});
		__publicField$2(this, "mark", (name) => {
			if (this.debug) mark(name, this.sessionId);
		});
		if (typeof address === "object")
			throw new Error(
				"Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly.",
			);
		if (options?.skipConvexDeploymentUrlCheck !== true) validateDeploymentUrl(address);
		options = { ...options };
		const authRefreshTokenLeewaySeconds = options.authRefreshTokenLeewaySeconds ?? 10;
		let webSocketConstructor = options.webSocketConstructor;
		if (!webSocketConstructor && typeof WebSocket === "undefined")
			throw new Error(
				"No WebSocket global variable defined! To use Convex in an environment without WebSocket try the HTTP client: https://docs.convex.dev/api/classes/browser.ConvexHttpClient",
			);
		webSocketConstructor = webSocketConstructor || WebSocket;
		this.debug = options.reportDebugInfoToConvex ?? false;
		this.address = address;
		this.logger =
			options.logger === false
				? instantiateNoopLogger({ verbose: options.verbose ?? false })
				: options.logger !== true && options.logger
					? options.logger
					: instantiateDefaultLogger({ verbose: options.verbose ?? false });
		const i = address.search("://");
		if (i === -1) throw new Error("Provided address was not an absolute URL.");
		const origin = address.substring(i + 3);
		const protocol = address.substring(0, i);
		let wsProtocol;
		if (protocol === "http") wsProtocol = "ws";
		else if (protocol === "https") wsProtocol = "wss";
		else throw new Error(`Unknown parent protocol ${protocol}`);
		const wsUri = `${wsProtocol}://${origin}/api/${version}/sync`;
		this.state = new LocalSyncState();
		this.remoteQuerySet = new RemoteQuerySet((queryId) => this.state.queryPath(queryId), this.logger);
		this.requestManager = new RequestManager(this.logger, this.markConnectionStateDirty);
		const pauseSocket = () => {
			this.webSocketManager.pause();
			this.state.pause();
		};
		this.authenticationManager = new AuthenticationManager(
			this.state,
			{
				authenticate: (token) => {
					const message = this.state.setAuth(token);
					this.webSocketManager.sendMessage(message);
					return message.baseVersion;
				},
				stopSocket: () => this.webSocketManager.stop(),
				tryRestartSocket: () => this.webSocketManager.tryRestart(),
				pauseSocket,
				resumeSocket: () => this.webSocketManager.resume(),
				clearAuth: () => {
					this.clearAuth();
				},
			},
			{
				logger: this.logger,
				refreshTokenLeewaySeconds: authRefreshTokenLeewaySeconds,
				initialAuthTokenReuse: options.initialAuthTokenReuse ?? false,
			},
		);
		this.optimisticQueryResults = new OptimisticQueryResults();
		this.addOnTransitionHandler((transition) => {
			onTransition(transition.queries.map((q) => q.token));
		});
		this._nextRequestId = 0;
		this._sessionId = newSessionId();
		const { unsavedChangesWarning } = options;
		if (typeof window === "undefined" || typeof window.addEventListener === "undefined") {
			if (unsavedChangesWarning === true)
				throw new Error(
					"unsavedChangesWarning requested, but window.addEventListener not found! Remove {unsavedChangesWarning: true} from Convex client options.",
				);
		} else if (unsavedChangesWarning !== false)
			window.addEventListener("beforeunload", (e) => {
				if (this.requestManager.hasIncompleteRequests()) {
					e.preventDefault();
					const confirmationMessage = "Are you sure you want to leave? Your changes may not be saved.";
					(e || window.event).returnValue = confirmationMessage;
					return confirmationMessage;
				}
			});
		this.webSocketManager = new WebSocketManager(
			wsUri,
			{
				onOpen: (reconnectMetadata) => {
					this.mark("convexWebSocketOpen");
					this.webSocketManager.sendMessage({
						...reconnectMetadata,
						type: "Connect",
						sessionId: this._sessionId,
						maxObservedTimestamp: this.maxObservedTimestamp,
					});
					this.remoteQuerySet = new RemoteQuerySet((queryId) => this.state.queryPath(queryId), this.logger);
					const [querySetModification, authModification] = this.state.restart();
					if (authModification) this.webSocketManager.sendMessage(authModification);
					this.webSocketManager.sendMessage(querySetModification);
					for (const message of this.requestManager.restart()) this.webSocketManager.sendMessage(message);
				},
				onResume: () => {
					const [querySetModification, authModification] = this.state.resume();
					if (authModification) this.webSocketManager.sendMessage(authModification);
					if (querySetModification) this.webSocketManager.sendMessage(querySetModification);
					for (const message of this.requestManager.resume()) this.webSocketManager.sendMessage(message);
				},
				onMessage: (serverMessage) => {
					if (!this.firstMessageReceived) {
						this.firstMessageReceived = true;
						this.mark("convexFirstMessageReceived");
						this.reportMarks();
					}
					switch (serverMessage.type) {
						case "Transition": {
							this.observedTimestamp(serverMessage.endVersion.ts);
							this.authenticationManager.onTransition(serverMessage);
							this.remoteQuerySet.transition(serverMessage);
							this.state.transition(serverMessage);
							const completedRequests = this.requestManager.removeCompleted(this.remoteQuerySet.timestamp());
							this.notifyOnQueryResultChanges(completedRequests);
							break;
						}
						case "MutationResponse": {
							if (serverMessage.success) this.observedTimestamp(serverMessage.ts);
							const completedMutationInfo = this.requestManager.onResponse(serverMessage);
							if (completedMutationInfo !== null)
								this.notifyOnQueryResultChanges(
									/* @__PURE__ */ new Map([[completedMutationInfo.requestId, completedMutationInfo.result]]),
								);
							break;
						}
						case "ActionResponse":
							this.requestManager.onResponse(serverMessage);
							break;
						case "AuthError":
							this.authenticationManager.onAuthError(serverMessage);
							break;
						case "FatalError": {
							const error = logFatalError(this.logger, serverMessage.error);
							this.webSocketManager.terminate();
							throw error;
						}
					}
					return { hasSyncedPastLastReconnect: this.hasSyncedPastLastReconnect() };
				},
				onServerDisconnectError: options.onServerDisconnectError,
			},
			webSocketConstructor,
			this.logger,
			this.markConnectionStateDirty,
			this.debug,
		);
		this.mark("convexClientConstructed");
		if (options.expectAuth) pauseSocket();
	}
	/**
	 * Return true if there is outstanding work from prior to the time of the most recent restart.
	 * This indicates that the client has not proven itself to have gotten past the issue that
	 * potentially led to the restart. Use this to influence when to reset backoff after a failure.
	 */
	hasSyncedPastLastReconnect() {
		return this.requestManager.hasSyncedPastLastReconnect() && this.state.hasSyncedPastLastReconnect();
	}
	observedTimestamp(observedTs) {
		if (this.maxObservedTimestamp === void 0 || this.maxObservedTimestamp.lessThanOrEqual(observedTs))
			this.maxObservedTimestamp = observedTs;
	}
	getMaxObservedTimestamp() {
		return this.maxObservedTimestamp;
	}
	/**
	 * Compute the current query results based on the remoteQuerySet and the
	 * current optimistic updates and call `onTransition` for all the changed
	 * queries.
	 *
	 * @param completedMutations - A set of mutation IDs whose optimistic updates
	 * are no longer needed.
	 */
	notifyOnQueryResultChanges(completedRequests) {
		const remoteQueryResults = this.remoteQuerySet.remoteQueryResults();
		const queryTokenToValue = /* @__PURE__ */ new Map();
		for (const [queryId, result] of remoteQueryResults) {
			const queryToken = this.state.queryToken(queryId);
			if (queryToken !== null) {
				const query = {
					result,
					udfPath: this.state.queryPath(queryId),
					args: this.state.queryArgs(queryId),
				};
				queryTokenToValue.set(queryToken, query);
			}
		}
		const changedQueryTokens = this.optimisticQueryResults.ingestQueryResultsFromServer(
			queryTokenToValue,
			new Set(completedRequests.keys()),
		);
		this.handleTransition({
			queries: changedQueryTokens.map((token) => {
				return {
					token,
					modification: {
						kind: "Updated",
						result: this.optimisticQueryResults.rawQueryResult(token),
					},
				};
			}),
			reflectedMutations: Array.from(completedRequests).map(([requestId, result]) => ({
				requestId,
				result,
			})),
			timestamp: this.remoteQuerySet.timestamp(),
		});
	}
	handleTransition(transition) {
		for (const fn of this._onTransitionFns.values()) fn(transition);
	}
	/**
	 * Add a handler that will be called on a transition.
	 *
	 * Any external side effects (e.g. setting React state) should be handled here.
	 *
	 * @param fn
	 *
	 * @returns
	 */
	addOnTransitionHandler(fn) {
		const id = this._transitionHandlerCounter++;
		this._onTransitionFns.set(id, fn);
		return () => this._onTransitionFns.delete(id);
	}
	/**
	 * Get the current JWT auth token and decoded claims.
	 */
	getCurrentAuthClaims() {
		const authToken = this.state.getAuth();
		let decoded = {};
		if (authToken && authToken.tokenType === "User")
			try {
				decoded = authToken ? jwtDecode(authToken.value) : {};
			} catch {
				decoded = {};
			}
		else return;
		return {
			token: authToken.value,
			decoded,
		};
	}
	/**
	 * Set the authentication token to be used for subsequent queries and mutations.
	 * `fetchToken` will be called automatically again if a token expires.
	 * `fetchToken` should return `null` if the token cannot be retrieved, for example
	 * when the user's rights were permanently revoked.
	 * @param fetchToken - an async function returning the JWT-encoded OpenID Connect Identity Token
	 * @param onChange - a callback that will be called when the authentication status changes
	 * @param onRefreshChange - a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes
	 */
	setAuth(fetchToken, onChange, onRefreshChange) {
		this.authenticationManager.setConfig(fetchToken, onChange, onRefreshChange);
	}
	hasAuth() {
		return this.state.hasAuth();
	}
	/** @internal */
	setAdminAuth(value, fakeUserIdentity) {
		const message = this.state.setAdminAuth(value, fakeUserIdentity);
		this.webSocketManager.sendMessage(message);
	}
	clearAuth() {
		const message = this.state.clearAuth();
		this.webSocketManager.sendMessage(message);
	}
	/**
	* Subscribe to a query function.
	*
	* Whenever this query's result changes, the `onTransition` callback
	* passed into the constructor will be called.
	*
	* @param name - The name of the query.
	* @param args - An arguments object for the query. If this is omitted, the
	* arguments will be `{}`.
	* @param options - A {@link SubscribeOptions} options object for this query.
	
	* @returns An object containing a {@link QueryToken} corresponding to this
	* query and an `unsubscribe` callback.
	*/
	subscribe(name, args, options) {
		const argsObject = parseArgs(args);
		const { modification, queryToken, unsubscribe } = this.state.subscribe(
			name,
			argsObject,
			options?.journal,
			options?.componentPath,
		);
		if (modification !== null) this.webSocketManager.sendMessage(modification);
		return {
			queryToken,
			unsubscribe: () => {
				const modification2 = unsubscribe();
				if (modification2) this.webSocketManager.sendMessage(modification2);
			},
		};
	}
	/**
	 * A query result based only on the current, local state.
	 *
	 * The only way this will return a value is if we're already subscribed to the
	 * query or its value has been set optimistically.
	 */
	localQueryResult(udfPath, args) {
		const queryToken = serializePathAndArgs(udfPath, parseArgs(args));
		return this.optimisticQueryResults.queryResult(queryToken);
	}
	/**
	 * Get query result by query token based on current, local state
	 *
	 * The only way this will return a value is if we're already subscribed to the
	 * query or its value has been set optimistically.
	 *
	 * @internal
	 */
	localQueryResultByToken(queryToken) {
		return this.optimisticQueryResults.queryResult(queryToken);
	}
	/**
	 * Whether local query result is available for a token.
	 *
	 * This method does not throw if the result is an error.
	 *
	 * @internal
	 */
	hasLocalQueryResultByToken(queryToken) {
		return this.optimisticQueryResults.hasQueryResult(queryToken);
	}
	/**
	 * @internal
	 */
	localQueryLogs(udfPath, args) {
		const queryToken = serializePathAndArgs(udfPath, parseArgs(args));
		return this.optimisticQueryResults.queryLogs(queryToken);
	}
	/**
	 * Retrieve the current {@link QueryJournal} for this query function.
	 *
	 * If we have not yet received a result for this query, this will be `undefined`.
	 *
	 * @param name - The name of the query.
	 * @param args - The arguments object for this query.
	 * @returns The query's {@link QueryJournal} or `undefined`.
	 */
	queryJournal(name, args) {
		const queryToken = serializePathAndArgs(name, parseArgs(args));
		return this.state.queryJournal(queryToken);
	}
	/**
	 * Get the current {@link ConnectionState} between the client and the Convex
	 * backend.
	 *
	 * @returns The {@link ConnectionState} with the Convex backend.
	 */
	connectionState() {
		const wsConnectionState = this.webSocketManager.connectionState();
		return {
			hasInflightRequests: this.requestManager.hasInflightRequests(),
			isWebSocketConnected: wsConnectionState.isConnected,
			hasEverConnected: wsConnectionState.hasEverConnected,
			connectionCount: wsConnectionState.connectionCount,
			connectionRetries: wsConnectionState.connectionRetries,
			timeOfOldestInflightRequest: this.requestManager.timeOfOldestInflightRequest(),
			inflightMutations: this.requestManager.inflightMutations(),
			inflightActions: this.requestManager.inflightActions(),
		};
	}
	/**
	 * Subscribe to the {@link ConnectionState} between the client and the Convex
	 * backend, calling a callback each time it changes.
	 *
	 * Subscribed callbacks will be called when any part of ConnectionState changes.
	 * ConnectionState may grow in future versions (e.g. to provide a array of
	 * inflight requests) in which case callbacks would be called more frequently.
	 *
	 * @returns An unsubscribe function to stop listening.
	 */
	subscribeToConnectionState(cb) {
		const id = this.nextConnectionStateSubscriberId++;
		this.connectionStateSubscribers.set(id, cb);
		return () => {
			this.connectionStateSubscribers.delete(id);
		};
	}
	/**
	* Execute a mutation function.
	*
	* @param name - The name of the mutation.
	* @param args - An arguments object for the mutation. If this is omitted,
	* the arguments will be `{}`.
	* @param options - A {@link MutationOptions} options object for this mutation.
	
	* @returns - A promise of the mutation's result.
	*/
	async mutation(name, args, options) {
		const result = await this.mutationInternal(name, args, options);
		if (!result.success) {
			if (result.errorData !== void 0)
				throw forwardData(result, new ConvexError(createHybridErrorStacktrace("mutation", name, result)));
			throw new Error(createHybridErrorStacktrace("mutation", name, result));
		}
		return result.value;
	}
	/**
	 * @internal
	 */
	async mutationInternal(udfPath, args, options, componentPath) {
		const { mutationPromise } = this.enqueueMutation(udfPath, args, options, componentPath);
		return mutationPromise;
	}
	/**
	 * @internal
	 */
	enqueueMutation(udfPath, args, options, componentPath) {
		const mutationArgs = parseArgs(args);
		this.tryReportLongDisconnect();
		const requestId = this.nextRequestId;
		this._nextRequestId++;
		if (options !== void 0) {
			const optimisticUpdate = options.optimisticUpdate;
			if (optimisticUpdate !== void 0) {
				const wrappedUpdate = (localQueryStore) => {
					if (optimisticUpdate(localQueryStore, mutationArgs) instanceof Promise)
						this.logger.warn("Optimistic update handler returned a Promise. Optimistic updates should be synchronous.");
				};
				const changedQueries = this.optimisticQueryResults
					.applyOptimisticUpdate(wrappedUpdate, requestId)
					.map((token) => {
						const localResult = this.localQueryResultByToken(token);
						return {
							token,
							modification: {
								kind: "Updated",
								result:
									localResult === void 0
										? void 0
										: {
												success: true,
												value: localResult,
												logLines: [],
											},
							},
						};
					});
				this.handleTransition({
					queries: changedQueries,
					reflectedMutations: [],
					timestamp: this.remoteQuerySet.timestamp(),
				});
			}
		}
		const message = {
			type: "Mutation",
			requestId,
			udfPath,
			componentPath,
			args: [convexToJson(mutationArgs)],
		};
		const mightBeSent = this.webSocketManager.sendMessage(message);
		return {
			requestId,
			mutationPromise: this.requestManager.request(message, mightBeSent),
		};
	}
	/**
	 * Execute an action function.
	 *
	 * @param name - The name of the action.
	 * @param args - An arguments object for the action. If this is omitted,
	 * the arguments will be `{}`.
	 * @returns A promise of the action's result.
	 */
	async action(name, args) {
		const result = await this.actionInternal(name, args);
		if (!result.success) {
			if (result.errorData !== void 0)
				throw forwardData(result, new ConvexError(createHybridErrorStacktrace("action", name, result)));
			throw new Error(createHybridErrorStacktrace("action", name, result));
		}
		return result.value;
	}
	/**
	 * @internal
	 */
	async actionInternal(udfPath, args, componentPath) {
		const actionArgs = parseArgs(args);
		const requestId = this.nextRequestId;
		this._nextRequestId++;
		this.tryReportLongDisconnect();
		const message = {
			type: "Action",
			requestId,
			udfPath,
			componentPath,
			args: [convexToJson(actionArgs)],
		};
		const mightBeSent = this.webSocketManager.sendMessage(message);
		return this.requestManager.request(message, mightBeSent);
	}
	/**
	 * Close any network handles associated with this client and stop all subscriptions.
	 *
	 * Call this method when you're done with an {@link BaseConvexClient} to
	 * dispose of its sockets and resources.
	 *
	 * @returns A `Promise` fulfilled when the connection has been completely closed.
	 */
	async close() {
		this.authenticationManager.stop();
		return this.webSocketManager.terminate();
	}
	/**
	 * Return the address for this client, useful for creating a new client.
	 *
	 * Not guaranteed to match the address with which this client was constructed:
	 * it may be canonicalized.
	 */
	get url() {
		return this.address;
	}
	/**
	 * @internal
	 */
	get nextRequestId() {
		return this._nextRequestId;
	}
	/**
	 * @internal
	 */
	get sessionId() {
		return this._sessionId;
	}
	/**
	 * Reports performance marks to the server. This should only be called when
	 * we have a functional websocket.
	 */
	reportMarks() {
		if (this.debug) {
			const report = getMarksReport(this.sessionId);
			this.webSocketManager.sendMessage({
				type: "Event",
				eventType: "ClientConnect",
				event: report,
			});
		}
	}
	tryReportLongDisconnect() {
		if (!this.debug) return;
		const timeOfOldestRequest = this.connectionState().timeOfOldestInflightRequest;
		if (timeOfOldestRequest === null || Date.now() - timeOfOldestRequest.getTime() <= 6e4) return;
		const endpoint = `${this.address}/api/debug_event`;
		fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Convex-Client": `npm-${version}`,
			},
			body: JSON.stringify({ event: "LongWebsocketDisconnect" }),
		})
			.then((response) => {
				if (!response.ok) this.logger.warn("Analytics request failed with response:", response.body);
			})
			.catch((error) => {
				this.logger.warn("Analytics response failed with error:", error);
			});
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/pagination.js
function asPaginationResult(value) {
	if (
		typeof value !== "object" ||
		value === null ||
		!Array.isArray(value.page) ||
		typeof value.isDone !== "boolean" ||
		typeof value.continueCursor !== "string"
	)
		throw new Error(`Not a valid paginated query result: ${value?.toString()}`);
	return value;
}
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/browser/sync/paginated_query_client.js
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) =>
	key in obj
		? __defProp$1(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var PaginatedQueryClient = class {
	constructor(client, onTransition) {
		this.client = client;
		this.onTransition = onTransition;
		__publicField$1(this, "paginatedQuerySet", /* @__PURE__ */ new Map());
		__publicField$1(this, "lastTransitionTs");
		this.lastTransitionTs = Long.fromNumber(0);
		this.client.addOnTransitionHandler((transition) => this.onBaseTransition(transition));
	}
	/**
	 * Subscribe to a paginated query.
	 *
	 * @param name - The name of the paginated query function
	 * @param args - Arguments for the query (excluding paginationOpts)
	 * @param options - Pagination options including initialNumItems
	 * @returns Object with paginatedQueryToken and unsubscribe function
	 */
	subscribe(name, args, options) {
		const canonicalizedUdfPath = canonicalizeUdfPath(name);
		const token = serializePaginatedPathAndArgs(canonicalizedUdfPath, args, options);
		const unsubscribe = () => this.removePaginatedQuerySubscriber(token);
		const existingEntry = this.paginatedQuerySet.get(token);
		if (existingEntry) {
			existingEntry.numSubscribers += 1;
			return {
				paginatedQueryToken: token,
				unsubscribe,
			};
		}
		this.paginatedQuerySet.set(token, {
			token,
			canonicalizedUdfPath,
			args,
			numSubscribers: 1,
			options: { initialNumItems: options.initialNumItems },
			nextPageKey: 0,
			pageKeys: [],
			pageKeyToQuery: /* @__PURE__ */ new Map(),
			ongoingSplits: /* @__PURE__ */ new Map(),
			skip: false,
			id: options.id,
		});
		this.addPageToPaginatedQuery(token, null, options.initialNumItems);
		return {
			paginatedQueryToken: token,
			unsubscribe,
		};
	}
	/**
	 * Get current results for a paginated query based on local state.
	 *
	 * Throws an error when one of the pages has errored.
	 */
	localQueryResult(name, args, options) {
		const token = serializePaginatedPathAndArgs(canonicalizeUdfPath(name), args, options);
		return this.localQueryResultByToken(token);
	}
	/**
	 * @internal
	 */
	localQueryResultByToken(token) {
		const paginatedQuery = this.paginatedQuerySet.get(token);
		if (!paginatedQuery) return;
		const activePages = this.activePageQueryTokens(paginatedQuery);
		if (activePages.length === 0)
			return {
				results: [],
				status: "LoadingFirstPage",
				loadMore: (numItems) => {
					return this.loadMoreOfPaginatedQuery(token, numItems);
				},
			};
		let allResults = [];
		let hasUndefined = false;
		let isDone = false;
		for (const pageToken of activePages) {
			const result = this.client.localQueryResultByToken(pageToken);
			if (result === void 0) {
				hasUndefined = true;
				isDone = false;
				continue;
			}
			const paginationResult = asPaginationResult(result);
			allResults = allResults.concat(paginationResult.page);
			isDone = !!paginationResult.isDone;
		}
		let status;
		if (hasUndefined) status = allResults.length === 0 ? "LoadingFirstPage" : "LoadingMore";
		else if (isDone) status = "Exhausted";
		else status = "CanLoadMore";
		return {
			results: allResults,
			status,
			loadMore: (numItems) => {
				return this.loadMoreOfPaginatedQuery(token, numItems);
			},
		};
	}
	onBaseTransition(transition) {
		const changedBaseTokens = transition.queries.map((q) => q.token);
		const changed = this.queriesContainingTokens(changedBaseTokens);
		let paginatedQueries = [];
		if (changed.length > 0) {
			this.processPaginatedQuerySplits(changed, (token) => this.client.localQueryResultByToken(token));
			paginatedQueries = changed.map((token) => ({
				token,
				modification: {
					kind: "Updated",
					result: this.localQueryResultByToken(token),
				},
			}));
		}
		const extendedTransition = {
			...transition,
			paginatedQueries,
		};
		this.onTransition(extendedTransition);
	}
	/**
	 * Load more items for a paginated query.
	 *
	 * This *always* causes a transition, the status of the query
	 * has probably changed from "CanLoadMore" to "LoadingMore".
	 * Data might have changed too: maybe a subscription to this page
	 * query already exists (unlikely but possible) or this page query
	 * has an optimistic update providing some initial data.
	 *
	 * @internal
	 */
	loadMoreOfPaginatedQuery(token, numItems) {
		this.mustGetPaginatedQuery(token);
		const lastPageToken = this.queryTokenForLastPageOfPaginatedQuery(token);
		const lastPageResult = this.client.localQueryResultByToken(lastPageToken);
		if (!lastPageResult) return false;
		const paginationResult = asPaginationResult(lastPageResult);
		if (paginationResult.isDone) return false;
		this.addPageToPaginatedQuery(token, paginationResult.continueCursor, numItems);
		const loadMoreTransition = {
			timestamp: this.lastTransitionTs,
			reflectedMutations: [],
			queries: [],
			paginatedQueries: [
				{
					token,
					modification: {
						kind: "Updated",
						result: this.localQueryResultByToken(token),
					},
				},
			],
		};
		this.onTransition(loadMoreTransition);
		return true;
	}
	/**
	 * @internal
	 */
	queriesContainingTokens(queryTokens) {
		if (queryTokens.length === 0) return [];
		const changed = [];
		const queryTokenSet = new Set(queryTokens);
		for (const [paginatedToken, paginatedQuery] of this.paginatedQuerySet)
			for (const pageToken of this.allQueryTokens(paginatedQuery))
				if (queryTokenSet.has(pageToken)) {
					changed.push(paginatedToken);
					break;
				}
		return changed;
	}
	/**
	 * @internal
	 */
	processPaginatedQuerySplits(changed, getResult) {
		for (const paginatedQueryToken of changed) {
			const paginatedQuery = this.mustGetPaginatedQuery(paginatedQueryToken);
			const { ongoingSplits, pageKeyToQuery, pageKeys } = paginatedQuery;
			for (const [pageKey, [splitKey1, splitKey2]] of ongoingSplits)
				if (
					getResult(pageKeyToQuery.get(splitKey1).queryToken) !== void 0 &&
					getResult(pageKeyToQuery.get(splitKey2).queryToken) !== void 0
				)
					this.completePaginatedQuerySplit(paginatedQuery, pageKey, splitKey1, splitKey2);
			for (const pageKey of pageKeys) {
				if (ongoingSplits.has(pageKey)) continue;
				const pageEntry = pageKeyToQuery.get(pageKey);
				if (!pageEntry) throw new Error(`No page query for active pageKey ${pageKey}`);
				const pageResult = getResult(pageEntry.queryToken);
				if (!pageResult) continue;
				const result = asPaginationResult(pageResult);
				if (
					result.splitCursor &&
					(result.pageStatus === "SplitRecommended" ||
						result.pageStatus === "SplitRequired" ||
						result.page.length > paginatedQuery.options.initialNumItems * 2)
				)
					this.splitPaginatedQueryPage(
						paginatedQuery,
						pageKey,
						pageEntry.cursor,
						result.splitCursor,
						result.continueCursor,
					);
			}
		}
	}
	splitPaginatedQueryPage(paginatedQuery, pageKey, startCursor, splitCursor, continueCursor) {
		const splitKey1 = paginatedQuery.nextPageKey++;
		const splitKey2 = paginatedQuery.nextPageKey++;
		const paginationOpts = {
			numItems: paginatedQuery.options.initialNumItems,
			id: paginatedQuery.id,
		};
		const firstSubscription = this.client.subscribe(paginatedQuery.canonicalizedUdfPath, {
			...paginatedQuery.args,
			paginationOpts: {
				...paginationOpts,
				cursor: startCursor,
				endCursor: splitCursor,
			},
		});
		paginatedQuery.pageKeyToQuery.set(splitKey1, {
			...firstSubscription,
			cursor: startCursor,
		});
		const secondSubscription = this.client.subscribe(paginatedQuery.canonicalizedUdfPath, {
			...paginatedQuery.args,
			paginationOpts: {
				...paginationOpts,
				cursor: splitCursor,
				endCursor: continueCursor,
			},
		});
		paginatedQuery.pageKeyToQuery.set(splitKey2, {
			...secondSubscription,
			cursor: splitCursor,
		});
		paginatedQuery.ongoingSplits.set(pageKey, [splitKey1, splitKey2]);
	}
	/**
	 * @internal
	 */
	addPageToPaginatedQuery(token, continueCursor, numItems) {
		const paginatedQuery = this.mustGetPaginatedQuery(token);
		const pageKey = paginatedQuery.nextPageKey++;
		const paginationOpts = {
			cursor: continueCursor,
			numItems,
			id: paginatedQuery.id,
		};
		const pageArgs = {
			...paginatedQuery.args,
			paginationOpts,
		};
		const subscription = this.client.subscribe(paginatedQuery.canonicalizedUdfPath, pageArgs);
		paginatedQuery.pageKeys.push(pageKey);
		paginatedQuery.pageKeyToQuery.set(pageKey, {
			...subscription,
			cursor: continueCursor,
		});
		return subscription;
	}
	removePaginatedQuerySubscriber(token) {
		const paginatedQuery = this.paginatedQuerySet.get(token);
		if (!paginatedQuery) return;
		paginatedQuery.numSubscribers -= 1;
		if (paginatedQuery.numSubscribers > 0) return;
		for (const subscription of paginatedQuery.pageKeyToQuery.values()) subscription.unsubscribe();
		this.paginatedQuerySet.delete(token);
	}
	completePaginatedQuerySplit(paginatedQuery, pageKey, splitKey1, splitKey2) {
		const originalQuery = paginatedQuery.pageKeyToQuery.get(pageKey);
		paginatedQuery.pageKeyToQuery.delete(pageKey);
		const pageIndex = paginatedQuery.pageKeys.indexOf(pageKey);
		paginatedQuery.pageKeys.splice(pageIndex, 1, splitKey1, splitKey2);
		paginatedQuery.ongoingSplits.delete(pageKey);
		originalQuery.unsubscribe();
	}
	/** The query tokens for all active pages, in result order */
	activePageQueryTokens(paginatedQuery) {
		return paginatedQuery.pageKeys.map((pageKey) => paginatedQuery.pageKeyToQuery.get(pageKey).queryToken);
	}
	allQueryTokens(paginatedQuery) {
		return Array.from(paginatedQuery.pageKeyToQuery.values()).map((sub) => sub.queryToken);
	}
	queryTokenForLastPageOfPaginatedQuery(token) {
		const paginatedQuery = this.mustGetPaginatedQuery(token);
		const lastPageKey = paginatedQuery.pageKeys[paginatedQuery.pageKeys.length - 1];
		if (lastPageKey === void 0) throw new Error(`No pages for paginated query ${token}`);
		return paginatedQuery.pageKeyToQuery.get(lastPageKey).queryToken;
	}
	mustGetPaginatedQuery(token) {
		const paginatedQuery = this.paginatedQuerySet.get(token);
		if (!paginatedQuery) throw new Error("paginated query no longer exists for token " + token);
		return paginatedQuery;
	}
};
// ../../node_modules/.pnpm/convex@1.50.0_@clerk+clerk-_c54b87385fdc9687decc9d1ce71b38da/node_modules/convex/dist/esm/react/client.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) =>
	key in obj
		? __defProp(obj, key, {
				enumerable: true,
				configurable: true,
				writable: true,
				value,
			})
		: (obj[key] = value);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var DEFAULT_EXTEND_SUBSCRIPTION_FOR = 5e3;
if (typeof src_default === "undefined") throw new Error("Required dependency 'react' not found");
var ConvexReactClient = class {
	/**
	 * @param address - The url of your Convex deployment, often provided
	 * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
	 * @param options - See {@link ConvexReactClientOptions} for a full description.
	 */
	constructor(address, options) {
		__publicField(this, "address");
		__publicField(this, "cachedSync");
		__publicField(this, "cachedPaginatedQueryClient");
		__publicField(this, "listeners");
		__publicField(this, "options");
		__publicField(this, "closed", false);
		__publicField(this, "_logger");
		__publicField(this, "adminAuth");
		__publicField(this, "fakeUserIdentity");
		if (address === void 0)
			throw new Error(
				"No address provided to ConvexReactClient.\nIf trying to deploy to production, make sure to follow all the instructions found at https://docs.convex.dev/production/hosting/\nIf running locally, make sure to run `convex dev` and ensure the .env.local file is populated.",
			);
		if (typeof address !== "string")
			throw new Error(
				`ConvexReactClient requires a URL like 'https://happy-otter-123.convex.cloud', received something of type ${typeof address} instead.`,
			);
		if (!address.includes("://")) throw new Error("Provided address was not an absolute URL.");
		this.address = address;
		this.listeners = /* @__PURE__ */ new Map();
		this._logger =
			options?.logger === false
				? instantiateNoopLogger({ verbose: options?.verbose ?? false })
				: options?.logger !== true && options?.logger
					? options.logger
					: instantiateDefaultLogger({ verbose: options?.verbose ?? false });
		this.options = {
			...options,
			logger: this._logger,
		};
	}
	/**
	 * Return the address for this client, useful for creating a new client.
	 *
	 * Not guaranteed to match the address with which this client was constructed:
	 * it may be canonicalized.
	 */
	get url() {
		return this.address;
	}
	/**
	 * Lazily instantiate the `BaseConvexClient` so we don't create the WebSocket
	 * when server-side rendering.
	 *
	 * @internal
	 */
	get sync() {
		if (this.closed) throw new Error("ConvexReactClient has already been closed.");
		if (this.cachedSync) return this.cachedSync;
		this.cachedSync = this.options.baseClient ?? new BaseConvexClient(this.address, () => {}, this.options);
		if (this.adminAuth) this.cachedSync.setAdminAuth(this.adminAuth, this.fakeUserIdentity);
		this.cachedPaginatedQueryClient = new PaginatedQueryClient(this.cachedSync, (transition) =>
			this.handleTransition(transition),
		);
		return this.cachedSync;
	}
	/**
	 * Lazily instantiate the `PaginatedQueryClient` so we don't create it
	 * when server-side rendering.
	 *
	 * @internal
	 */
	get paginatedQueryClient() {
		this.sync;
		if (this.cachedPaginatedQueryClient) return this.cachedPaginatedQueryClient;
		throw new Error("Should already be instantiated");
	}
	/**
	 * Set the authentication token to be used for subsequent queries and mutations.
	 * `fetchToken` will be called automatically again if a token expires.
	 * `fetchToken` should return `null` if the token cannot be retrieved, for example
	 * when the user's rights were permanently revoked.
	 * @param fetchToken - an async function returning the JWT-encoded OpenID Connect Identity Token
	 * @param onChange - a callback that will be called when the authentication status changes
	 * @param onRefreshChange - a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes
	 */
	setAuth(fetchToken, onChange, onRefreshChange) {
		if (typeof fetchToken === "string")
			throw new Error(
				"Passing a string to ConvexReactClient.setAuth is no longer supported, please upgrade to passing in an async function to handle reauthentication.",
			);
		this.sync.setAuth(fetchToken, onChange ?? (() => {}), onRefreshChange);
	}
	/**
	 * Clear the current authentication token if set.
	 */
	clearAuth() {
		this.sync.clearAuth();
	}
	/**
	 * @internal
	 */
	setAdminAuth(token, identity) {
		this.adminAuth = token;
		this.fakeUserIdentity = identity;
		if (this.closed) throw new Error("ConvexReactClient has already been closed.");
		if (this.cachedSync) this.sync.setAdminAuth(token, identity);
	}
	/**
	 * Construct a new {@link Watch} on a Convex query function.
	 *
	 * **Most application code should not call this method directly. Instead use
	 * the {@link useQuery} hook.**
	 *
	 * The act of creating a watch does nothing, a Watch is stateless.
	 *
	 * @param query - A {@link server.FunctionReference} for the public query to run.
	 * @param args - An arguments object for the query. If this is omitted,
	 * the arguments will be `{}`.
	 * @param options - A {@link WatchQueryOptions} options object for this query.
	 *
	 * @returns The {@link Watch} object.
	 */
	watchQuery(query, ...argsAndOptions) {
		const [args, options] = argsAndOptions;
		const name = getFunctionName(query);
		return {
			onUpdate: (callback) => {
				const { queryToken, unsubscribe } = this.sync.subscribe(name, args, options);
				const currentListeners = this.listeners.get(queryToken);
				if (currentListeners !== void 0) currentListeners.add(callback);
				else this.listeners.set(queryToken, /* @__PURE__ */ new Set([callback]));
				return () => {
					if (this.closed) return;
					const currentListeners2 = this.listeners.get(queryToken);
					currentListeners2.delete(callback);
					if (currentListeners2.size === 0) this.listeners.delete(queryToken);
					unsubscribe();
				};
			},
			localQueryResult: () => {
				if (this.cachedSync) return this.cachedSync.localQueryResult(name, args);
			},
			localQueryLogs: () => {
				if (this.cachedSync) return this.cachedSync.localQueryLogs(name, args);
			},
			journal: () => {
				if (this.cachedSync) return this.cachedSync.queryJournal(name, args);
			},
		};
	}
	/**
	 * Indicates likely future interest in a query subscription.
	 *
	 * The implementation currently immediately subscribes to a query. In the future this method
	 * may prioritize some queries over others, fetch the query result without subscribing, or
	 * do nothing in slow network connections or high load scenarios.
	 *
	 * To use this in a React component, call useQuery() and ignore the return value.
	 *
	 * @param queryOptions - A query (function reference from an api object) and its args, plus
	 * an optional extendSubscriptionFor for how long to subscribe to the query.
	 */
	prewarmQuery(queryOptions) {
		const extendSubscriptionFor = queryOptions.extendSubscriptionFor ?? DEFAULT_EXTEND_SUBSCRIPTION_FOR;
		const unsubscribe = this.watchQuery(queryOptions.query, queryOptions.args || {}).onUpdate(() => {});
		setTimeout(unsubscribe, extendSubscriptionFor);
	}
	/**
	 * Construct a new {@link PaginatedWatch} on a Convex paginated query function.
	 *
	 * **Most application code should not call this method directly. Instead use
	 * the {@link usePaginatedQuery} hook.**
	 *
	 * The act of creating a watch does nothing, a Watch is stateless.
	 *
	 * @param query - A {@link server.FunctionReference} for the public query to run.
	 * @param args - An arguments object for the query. If this is omitted,
	 * the arguments will be `{}`.
	 * @param options - A {@link WatchPaginatedQueryOptions} options object for this query.
	 *
	 * @returns The {@link PaginatedWatch} object.
	 *
	 * @internal
	 */
	watchPaginatedQuery(query, args, options) {
		const name = getFunctionName(query);
		return {
			onUpdate: (callback) => {
				const { paginatedQueryToken, unsubscribe } = this.paginatedQueryClient.subscribe(name, args || {}, options);
				const currentListeners = this.listeners.get(paginatedQueryToken);
				if (currentListeners !== void 0) currentListeners.add(callback);
				else this.listeners.set(paginatedQueryToken, /* @__PURE__ */ new Set([callback]));
				return () => {
					if (this.closed) return;
					const currentListeners2 = this.listeners.get(paginatedQueryToken);
					currentListeners2.delete(callback);
					if (currentListeners2.size === 0) this.listeners.delete(paginatedQueryToken);
					unsubscribe();
				};
			},
			localQueryResult: () => {
				return this.paginatedQueryClient.localQueryResult(name, args, options);
			},
		};
	}
	/**
	 * Execute a mutation function.
	 *
	 * @param mutation - A {@link server.FunctionReference} for the public mutation
	 * to run.
	 * @param args - An arguments object for the mutation. If this is omitted,
	 * the arguments will be `{}`.
	 * @param options - A {@link MutationOptions} options object for the mutation.
	 * @returns A promise of the mutation's result.
	 */
	mutation(mutation, ...argsAndOptions) {
		const [args, options] = argsAndOptions;
		const name = getFunctionName(mutation);
		return this.sync.mutation(name, args, options);
	}
	/**
	 * Execute an action function.
	 *
	 * @param action - A {@link server.FunctionReference} for the public action
	 * to run.
	 * @param args - An arguments object for the action. If this is omitted,
	 * the arguments will be `{}`.
	 * @returns A promise of the action's result.
	 */
	action(action, ...args) {
		const name = getFunctionName(action);
		return this.sync.action(name, ...args);
	}
	/**
	 * Fetch a query result once.
	 *
	 * **Most application code should subscribe to queries instead, using
	 * the {@link useQuery} hook.**
	 *
	 * @param query - A {@link server.FunctionReference} for the public query
	 * to run.
	 * @param args - An arguments object for the query. If this is omitted,
	 * the arguments will be `{}`.
	 * @returns A promise of the query's result.
	 */
	query(query, ...args) {
		const watch = this.watchQuery(query, ...args);
		const existingResult = watch.localQueryResult();
		if (existingResult !== void 0) return Promise.resolve(existingResult);
		return new Promise((resolve, reject) => {
			const unsubscribe = watch.onUpdate(() => {
				unsubscribe();
				try {
					resolve(watch.localQueryResult());
				} catch (e) {
					reject(e);
				}
			});
		});
	}
	/**
	 * Get the current {@link ConnectionState} between the client and the Convex
	 * backend.
	 *
	 * @returns The {@link ConnectionState} with the Convex backend.
	 */
	connectionState() {
		return this.sync.connectionState();
	}
	/**
	 * Subscribe to the {@link ConnectionState} between the client and the Convex
	 * backend, calling a callback each time it changes.
	 *
	 * Subscribed callbacks will be called when any part of ConnectionState changes.
	 * ConnectionState may grow in future versions (e.g. to provide a array of
	 * inflight requests) in which case callbacks would be called more frequently.
	 * ConnectionState may also *lose* properties in future versions as we figure
	 * out what information is most useful. As such this API is considered unstable.
	 *
	 * @returns An unsubscribe function to stop listening.
	 */
	subscribeToConnectionState(cb) {
		return this.sync.subscribeToConnectionState(cb);
	}
	/**
	 * Get the logger for this client.
	 *
	 * @returns The {@link Logger} for this client.
	 */
	get logger() {
		return this._logger;
	}
	/**
	 * Close any network handles associated with this client and stop all subscriptions.
	 *
	 * Call this method when you're done with a {@link ConvexReactClient} to
	 * dispose of its sockets and resources.
	 *
	 * @returns A `Promise` fulfilled when the connection has been completely closed.
	 */
	async close() {
		this.closed = true;
		this.listeners = /* @__PURE__ */ new Map();
		if (this.cachedPaginatedQueryClient) this.cachedPaginatedQueryClient = void 0;
		if (this.cachedSync) {
			const sync = this.cachedSync;
			this.cachedSync = void 0;
			await sync.close();
		}
	}
	/**
	 * Handle transitions from both base client and paginated client.
	 * This ensures all transitions are processed synchronously and in order.
	 */
	handleTransition(transition) {
		const simple = transition.queries.map((q) => q.token);
		const paginated = transition.paginatedQueries.map((q) => q.token);
		this.transition([...simple, ...paginated]);
	}
	transition(updatedQueries) {
		for (const queryToken of updatedQueries) {
			const callbacks = this.listeners.get(queryToken);
			if (callbacks) for (const callback of callbacks) callback();
		}
	}
};
src_default.createContext(void 0);
// ../../packages/bonobo-plugin-sdk/frontend.js
/**
 * The plugin doors with the types the app generated into `convex-api.d.ts`. `anyApi` builds any
 * reference at runtime, so this cast is the one place the SDK trusts that the generated file
 * describes the deployment the frame talks to.
 *
 * @type {import("bonobo-plugin-sdk/convex-api").BonoboConvexApi}
 */
var bonobo_convex_api = anyApi;
/**
 * `getToken` refreshes when the token is expired or expires within this margin. The Convex auth
 * callback treats the stored JWT the same way. The Convex client itself asks for a new JWT 10
 * seconds before it expires, which is inside this margin, so that ask always ends in a host refresh.
 */
var TOKEN_EXPIRY_MARGIN_MS = 6e4;
var READY_RETRY_MS = 500;
var REFRESH_DEADLINE_MS = 1e4;
var CONTEXT_THROTTLE_MS = 500;
var AUTH_WAKE_POLL_MS = 1e3;
var AUTH_WAKE_GAP_MS = 3e4;
var NONCE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Reads a host theme off a bridge message.
 *
 * The host resolves its colour scales and sends the values under their custom property names,
 * because a plugin page is a cross-origin document and inherits none of the host's custom
 * properties. This comes over postMessage, so every field is checked before the page can see it.
 *
 * @param {unknown} value
 * @returns {import("bonobo-plugin-sdk/frontend").BonoboTheme | null}
 */
function read_theme(value) {
	if (typeof value !== "object" || value === null) return null;
	const candidate = value;
	if (candidate.mode !== "light" && candidate.mode !== "dark") return null;
	if (typeof candidate.tokens !== "object" || candidate.tokens === null) return null;
	/**
	 * @type {Record<string, string>}
	 */
	const tokens = {};
	for (const [name, tokenValue] of Object.entries(candidate.tokens)) {
		if (typeof tokenValue !== "string") return null;
		tokens[name] = tokenValue;
	}
	return {
		mode: candidate.mode,
		tokens,
	};
}
/**
 * Paints a host theme onto this document.
 *
 * The frame is a cross-origin document, so the host's stylesheet never reaches it. The SDK writes
 * each scale value onto the root element under the app's own custom property name, and puts the
 * app's `light` / `dark` class on the root too. A plugin stylesheet can then use
 * `var(--color-base-1-03)` and `.dark &` exactly as the app does, and no plugin has to copy this loop.
 *
 * @param {import("bonobo-plugin-sdk/frontend").BonoboTheme} theme
 */
function apply_theme(theme) {
	const root = document.documentElement;
	for (const [name, value] of Object.entries(theme.tokens)) root.style.setProperty(name, value);
	root.classList.toggle("light", theme.mode === "light");
	root.classList.toggle("dark", theme.mode === "dark");
}
/**
 * Validates the `bonobo:init` context union: `kind: "page"` or `kind: "file_view"`.
 *
 * @param {unknown} value
 */
function is_ui_context(value) {
	if (typeof value !== "object" || value === null) return false;
	const context = value;
	if (
		typeof context.pluginName !== "string" ||
		typeof context.userId !== "string" ||
		typeof context.organizationId !== "string" ||
		typeof context.workspaceId !== "string"
	)
		return false;
	if (context.kind === "page") return typeof context.pageId === "string" && typeof context.pageTitle === "string";
	if (context.kind === "file_view") {
		if (typeof context.fileViewId !== "string" || typeof context.fileViewTitle !== "string") return false;
		if (typeof context.file !== "object" || context.file === null) return false;
		const file = context.file;
		return (
			typeof file.fileNodeId === "string" &&
			typeof file.name === "string" &&
			typeof file.path === "string" &&
			typeof file.contentType === "string"
		);
	}
	return false;
}
/**
 * True for a view context the host accepts: null, or an object with optional text blocks and an
 * optional plain object. MCP Apps allows other block types; the host keeps only text for now.
 *
 * @param {unknown} value
 */
function is_agent_context(value) {
	if (value === null) return true;
	if (typeof value !== "object" || Array.isArray(value)) return false;
	const { content, structuredContent } = value;
	return (
		(content === void 0 ||
			(Array.isArray(content) &&
				content.every(
					(block) =>
						typeof block === "object" && block !== null && block.type === "text" && typeof block.text === "string",
				))) &&
		(structuredContent === void 0 ||
			(typeof structuredContent === "object" && structuredContent !== null && !Array.isArray(structuredContent)))
	);
}
/**
 * Reads the host origin and frame nonce from the URL fragment. The fragment is available to the
 * page but is not sent in the asset request, cache key, or referrer.
 *
 * Why the host passes its origin at all: `postMessage` needs a target origin, and the SDK must
 * never send with `"*"`. The same SDK file runs under a localhost host and under the deployed
 * host, so it cannot hardcode the value, and it cannot discover it reliably either
 * (`document.referrer` depends on the referrer policy, `location.ancestorOrigins` is not in
 * Firefox). A wrong value only makes the SDK talk to nobody; it never grants anything. The value
 * is not authentication of the embedder. CSP `frame-ancestors` on the asset response decides who
 * may embed the frame, and only the host's session mint can produce a token.
 *
 * The checks below are format checks, not an allowlist: exactly these two keys, an origin with
 * no path or query, a UUIDv4 nonce.
 */
function read_bridge_bootstrap() {
	const fragment = window.location.hash.slice(1);
	if (!fragment)
		throw new Error("Missing host bridge fragment — this plugin frame must be embedded by the Bonobo host app");
	const params = new URLSearchParams(fragment);
	const parentOrigins = params.getAll("parentOrigin");
	const nonces = params.getAll("nonce");
	if (params.size !== 2 || parentOrigins.length !== 1 || nonces.length !== 1)
		throw new Error("Invalid host bridge fragment");
	const parentOrigin = parentOrigins[0];
	const nonce = nonces[0];
	let parsedParentOrigin;
	try {
		parsedParentOrigin = new URL(parentOrigin);
	} catch {
		throw new Error("Invalid host bridge parent origin");
	}
	if (
		(parsedParentOrigin.protocol !== "http:" && parsedParentOrigin.protocol !== "https:") ||
		parsedParentOrigin.origin !== parentOrigin
	)
		throw new Error("Invalid host bridge parent origin");
	if (!NONCE_PATTERN.test(nonce)) throw new Error("Invalid host bridge nonce");
	return {
		parentOrigin,
		nonce,
	};
}
/**
 * Connects the page to the embedding host app. It installs one shared `message` listener (for
 * init and token responses), posts `{ type: "bonobo:ready", nonce }` to `window.parent`,
 * and resolves with the frontend client when the host's `bonobo:init` arrives. `bonobo:init`
 * messages after the first are ignored.
 *
 * The host puts its canonical HTTP(S) origin and a fresh frame nonce in the URL fragment. The SDK
 * validates both before connecting, sends ready only to that exact origin, and accepts host
 * messages only from that origin, `window.parent`, and the matching nonce. The session token
 * travels over postMessage only and is never placed in a URL.
 *
 * The nonce is a conversation id for one mount of one iframe, not a secret. The host makes a new
 * one per mount and puts it in the URL, so a new mount always loads a fresh document. It does
 * three jobs: the host releases the token only after a ready message that carries it, which
 * proves this document read this mount's fragment; a late init or token from a previous mount
 * carries the old nonce and is dropped; and it backs up the `window.parent` check, because a
 * window keeps its identity across navigations while the document behind it changes.
 *
 * On init the SDK also opens the page's own Convex client against the init's `convexUrl`. The
 * client authenticates with the plugin-session JWT the host delivers beside the session token;
 * the page calls the plugin doors on that client directly. A host that sends no JWT is covered
 * by the same-origin `/plugins-ui/session-jwt` exchange.
 *
 * Token lifetimes, so plugin code never handles refresh itself: the session token and its JWT
 * live 30 minutes and expire together. `getToken` refreshes both through the host when they are
 * expired or within 60 seconds of expiry, and a normal API call that meets a 401 refreshes once
 * and retries once. The Convex client asks for a new JWT 10 seconds before it expires, which is
 * inside that margin, so its own ask is what drives the host refresh: one cadence for both
 * credentials. The host rotates the token on the same session while that session lives. When the
 * session is already gone (the device slept past its expiry), the host mints a new session for
 * this same frame and answers the same refresh with its token and JWT, so the page keeps its
 * state; the SDK treats that answer like any rotation. The session record on the host is the
 * kill switch: every plugin door reads it on each call, so revoking it ends every live
 * subscription at once whatever a JWT says.
 *
 * Secrets never reach this frame. A `plu_` token has no secrets scope, and the SDK has no
 * secrets API. A page that needs a secret calls its own backend through
 * `fetchJson("/api/v1/plugin-backend/invoke", ...)`; the backend run reads the secret with
 * `env.BONOBO.secrets.get(name)`.
 *
 * @returns {Promise<import("bonobo-plugin-sdk/frontend").BonoboClient>}
 */
async function bonobo_connect() {
	const { parentOrigin, nonce } = read_bridge_bootstrap();
	let apiOrigin = "";
	let token = "";
	let tokenExpiresAt = 0;
	let jwt = "";
	let jwtExpiresAt = 0;
	/**
	 * Theme state — set by `bonobo:init`, replaced by `bonobo:theme` when the member switches the
	 * host's theme. Each one is painted onto the document as it arrives. It stays null when the host
	 * sends none, and then the document keeps the page's own colours.
	 *
	 * @type {import("bonobo-plugin-sdk/frontend").BonoboTheme | null}
	 */
	let theme = null;
	/**
	 * @type {Set<(theme: import("bonobo-plugin-sdk/frontend").BonoboTheme) => void>}
	 */
	const themeSubscribers = /* @__PURE__ */ new Set();
	/**
	 * The agent tool handlers this page registered, by tool name. The names come from the page's
	 * `agent.tools` in the manifest.
	 *
	 * @type {Map<string, (input: unknown) => unknown>}
	 */
	const agentTools = /* @__PURE__ */ new Map();
	/**
	 * The page's view context provider. The host asks it right before a chat message is sent, and
	 * when the agent reads the screen.
	 *
	 * @type {((request: { detail: "summary" | "snapshot", ref: string | null }) => unknown) | null}
	 */
	let contextProvider = null;
	/** @type {string | null} */
	let lastContextSent = null;
	/** @type {string | null} */
	let pendingContext = null;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let contextTimer;
	/** @type {Map<string, { resolve: (token: string) => void, reject: (error: Error) => void, timeout: ReturnType<typeof setTimeout> }>} */
	const pending_refreshes = /* @__PURE__ */ new Map();
	/** @type {Promise<string> | null} */
	let refresh_in_flight = null;
	/**
	 * Returns the current session token, refreshing it first when it is expired or within
	 * `TOKEN_EXPIRY_MARGIN_MS` of `tokenExpiresAt`.
	 *
	 * @returns {Promise<string>}
	 */
	async function getToken() {
		if (Date.now() >= tokenExpiresAt - TOKEN_EXPIRY_MARGIN_MS) return refreshToken();
		return token;
	}
	/**
	 * Asks the host for a fresh session token. Concurrent callers share one in-flight
	 * `bonobo:token-refresh-request`; it resolves on the matching `bonobo:token` and rejects on
	 * the matching `bonobo:token-error`.
	 *
	 * @returns {Promise<string>}
	 */
	function refreshToken() {
		if (refresh_in_flight) return refresh_in_flight;
		const requestId = crypto.randomUUID();
		refresh_in_flight = new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				pending_refreshes.delete(requestId);
				reject(/* @__PURE__ */ new Error("Plugin frame token refresh timed out"));
			}, REFRESH_DEADLINE_MS);
			pending_refreshes.set(requestId, {
				resolve,
				reject,
				timeout,
			});
			try {
				window.parent.postMessage(
					{
						type: "bonobo:token-refresh-request",
						nonce,
						requestId,
					},
					parentOrigin,
				);
			} catch (error) {
				clearTimeout(timeout);
				pending_refreshes.delete(requestId);
				reject(error);
			}
		}).finally(() => {
			refresh_in_flight = null;
		});
		return refresh_in_flight;
	}
	const jwt_is_fresh = () => jwt !== "" && Date.now() < jwtExpiresAt - TOKEN_EXPIRY_MARGIN_MS;
	/**
	 * Stores the JWT a host message delivered beside the token, or clears it when the message
	 * carried none (an older host): the exchange fallback then takes over.
	 *
	 * @param {{ jwt?: unknown, jwtExpiresAt?: unknown }} message
	 */
	const store_delivered_jwt = (message) => {
		if (
			typeof message.jwt === "string" &&
			typeof message.jwtExpiresAt === "number" &&
			Number.isFinite(message.jwtExpiresAt)
		) {
			jwt = message.jwt;
			jwtExpiresAt = message.jwtExpiresAt;
		} else {
			jwt = "";
			jwtExpiresAt = 0;
		}
	};
	/**
	 * Send one JSON request and return its Response with the body unread. All statuses resolve.
	 * Refresh the session once on 401, sharing that refresh with other requests.
	 *
	 * @template {import("bonobo-plugin-sdk/http-api").BonoboHttpApiPath} P
	 * @param {P} path
	 * @param {import("bonobo-plugin-sdk/http-api").BonoboHttpApi[P]["POST"]["body"]} body
	 * @param {Omit<RequestInit, "method" | "body" | "redirect">} [init]
	 * @returns {Promise<Response>}
	 */
	async function fetchRaw(path, body, init) {
		const payload = JSON.stringify(body);
		/**
		 * @param {string} bearer
		 */
		const send = (bearer) => {
			const headers = new Headers(init?.headers);
			headers.set("Authorization", `Bearer ${bearer}`);
			headers.set("Content-Type", "application/json");
			return fetch(apiOrigin + path, {
				...init,
				method: "POST",
				body: payload,
				headers,
				redirect: "error",
			});
		};
		const firstBearer = await getToken();
		let response = await send(firstBearer);
		if (response.status === 401) {
			await response.body?.cancel();
			response = await send(token !== firstBearer ? token : await refreshToken());
		}
		return response;
	}
	/**
	 * `POST apiOrigin + path` with `body` as JSON, and the route's own JSON answer back.
	 *
	 * The result is `{ status, body }` typed from the app's route table
	 * ({@link BonoboHttpResponse}, generated into `bonobo-plugin-sdk/http-api`), so narrowing on
	 * `status` narrows `body` to what that route answers for that status. `path` and `body` come
	 * from the same table, so a path the host does not serve and a body field the route does not
	 * accept are both compile errors.
	 *
	 * Every HTTP answer resolves, whatever its status. A 500 resolves like a 200, and the caller
	 * decides what a status means. `body` is the parsed JSON when the text parses and `null` when
	 * it does not, so a plain-text answer — Convex's own router answers an unrouted path that way —
	 * is a value too, not a rejection.
	 *
	 * Two things reject, because there is no answer to hand back:
	 *
	 * - `fetch` itself: a network failure, an aborted `signal`, or a refused redirect. Those
	 *   rejections travel out of here untouched.
	 * - A session the host will not renew. `getToken` and `refreshToken` both reject when the host
	 *   answers `bonobo:token-error` or does not answer in 10 seconds, and that rejection travels
	 *   out of here unchanged.
	 *
	 * A status the route does not declare resolves like any other answer, and its body parses the
	 * same way, but the generated union does not name it. That is on purpose: a catch-all
	 * `{ status: number; body: null }` member would stop `status === 200` from narrowing `body`,
	 * because `number` includes 200. So `body === null` says the text did not parse. It never says
	 * the status was undeclared.
	 *
	 * `init` takes the rest of `RequestInit` — `signal`, extra `headers`, `keepalive`, `cache`, and
	 * so on. These fields are set after `init` is merged, so a caller's value never wins:
	 * `method` (always `POST`), `body` (the parameter, JSON-encoded), `Authorization` (the session
	 * token, with one refresh-and-resend on a 401), `Content-Type` and `Accept`
	 * (`application/json`), and `redirect: "error"`. `method`, `body` and `redirect` are removed
	 * from the type too. The three headers cannot be: header names are case-insensitive, so the
	 * type cannot name them, and setting them last is the whole enforcement. Redirects are refused
	 * because following one would resend the bearer to another origin, and no route redirects.
	 *
	 * @template {import("bonobo-plugin-sdk/frontend").BonoboHttpJsonApiPath} P
	 * @param {P} path - Public API path starting with `/`, e.g. `"/api/v1/files/list"`.
	 * @param {import("bonobo-plugin-sdk/http-api").BonoboHttpApi[P]["POST"]["body"]} body
	 * @param {Omit<RequestInit, "method" | "body" | "redirect">} [init]
	 * @returns {Promise<import("bonobo-plugin-sdk/http-api").BonoboHttpResponse<P>>}
	 */
	async function fetchJson(path, body, init) {
		const headers = new Headers(init?.headers);
		headers.set("Accept", "application/json");
		const response = await fetchRaw(path, body, {
			...init,
			headers,
		});
		const responseText = await response.text();
		let parsedBody = null;
		try {
			parsedBody = JSON.parse(responseText);
		} catch {}
		return {
			status: response.status,
			body: parsedBody,
		};
	}
	/**
	 * A `Headers` object carrying the current session bearer, for a plugin that calls the host with
	 * its own `fetch` instead of `fetchJson`. Any headers passed in are kept; `Authorization` is
	 * set last and replaces one of that name.
	 *
	 * @param {HeadersInit} [headers]
	 * @returns {Promise<Headers>}
	 */
	async function authorize(headers) {
		const authorized = new Headers(headers);
		authorized.set("Authorization", `Bearer ${await getToken()}`);
		return authorized;
	}
	/**
	 * Fallback for a host that delivered no JWT: exchanges the session token for the plugin-session
	 * JWT at the asset origin's `/plugins-ui/session-jwt` route. For a published frame this is a
	 * same-origin JSON POST with no preflight, and the route answers no other origin, so the JWT
	 * never becomes readable cross-origin. The one exception is the app's development-only frame
	 * override: a dev deployment may allowlist exactly one extra origin for this route, and the
	 * same POST then runs preflighted from there.
	 *
	 * @param {string} sessionToken
	 */
	const exchange_session_jwt = (sessionToken) =>
		fetch(apiOrigin + "/plugins-ui/session-jwt", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: sessionToken }),
		});
	/**
	 * The Convex client's auth callback. The stored JWT answers while it is fresh, so a startup or
	 * a wake from a short sleep costs no request at all.
	 *
	 * This chain is also what keeps an open page alive. When the stored JWT is inside the 60-second
	 * margin, or Convex refused the very JWT it holds (a forced refetch for it), one host refresh
	 * replaces both credentials, and that host refresh EXTENDS the session and moves its scheduled
	 * deletion. A page that slept past the session expiry recovers here too: the host finds the
	 * session doc gone, mints a new session for this same frame, and answers the refresh with the
	 * new token and JWT, so the Convex client re-runs its query set under the new session. Only
	 * when the host refuses to mint (uninstalled, membership ended, rate limit) does every path
	 * below answer null, and null tells the Convex client this page is unauthenticated (its
	 * subscriptions die; by then the host has replaced the frame with its error state and Retry).
	 *
	 * A host that sends no JWT falls through to the exchange.
	 *
	 * @param {{ forceRefreshToken: boolean }} [args]
	 */
	async function fetch_convex_jwt(args) {
		const forceRefreshToken = args?.forceRefreshToken === true;
		for (let attempt = 0; ; attempt += 1) {
			if (jwt_is_fresh() && !forceRefreshToken) return jwt;
			/**
			 * @type {Response | null}
			 */
			let response = null;
			try {
				if (jwt !== "") {
					await refreshToken();
					if (jwt_is_fresh()) return jwt;
				}
				response = await exchange_session_jwt(await getToken());
				if (response.status === 401) response = await exchange_session_jwt(await refreshToken());
			} catch {
				response = null;
			}
			if (response?.ok) {
				const body = await response.json().catch(() => null);
				const exchangedJwt = body?._yay?.jwt;
				const sessionExpiresAt = body?._yay?.sessionExpiresAt;
				if (typeof exchangedJwt !== "string" || typeof sessionExpiresAt !== "number") return null;
				tokenExpiresAt = sessionExpiresAt;
				jwt = exchangedJwt;
				jwtExpiresAt = sessionExpiresAt;
				return exchangedJwt;
			}
			if (!(response === null || response.status === 429 || response.status >= 500) || attempt >= 2) return null;
			await new Promise((resolveWait) => setTimeout(resolveWait, 1e3 * (attempt + 1)));
		}
	}
	return new Promise((resolve) => {
		let initialized = false;
		/** @type {ReturnType<typeof setInterval> | undefined} */
		let readyInterval;
		const post_ready = () => {
			window.parent.postMessage(
				{
					type: "bonobo:ready",
					nonce,
				},
				parentOrigin,
			);
		};
		const stop_ready = () => {
			clearInterval(readyInterval);
		};
		/** @param {MessageEvent} event */
		const handle_message = (event) => {
			if (event.source !== window.parent || event.origin !== parentOrigin) return;
			const message = event.data;
			if (typeof message !== "object" || message === null) return;
			if (
				message.type === "bonobo:init" &&
				!initialized &&
				message.nonce === nonce &&
				typeof message.apiOrigin === "string" &&
				typeof message.convexUrl === "string" &&
				typeof message.token === "string" &&
				typeof message.tokenExpiresAt === "number" &&
				Number.isFinite(message.tokenExpiresAt) &&
				is_ui_context(message.context)
			) {
				initialized = true;
				stop_ready();
				window.removeEventListener("pagehide", stop_ready);
				apiOrigin = message.apiOrigin;
				token = message.token;
				tokenExpiresAt = message.tokenExpiresAt;
				store_delivered_jwt(message);
				const convexClient = new ConvexReactClient(message.convexUrl, {
					expectAuth: true,
					unsavedChangesWarning: false,
					initialAuthTokenReuse: true,
				});
				let lastAuthWakePollAt = Date.now();
				const authWakeInterval = setInterval(() => {
					const now = Date.now();
					if (now - lastAuthWakePollAt >= AUTH_WAKE_GAP_MS) convexClient.setAuth(fetch_convex_jwt);
					lastAuthWakePollAt = now;
				}, AUTH_WAKE_POLL_MS);
				convexClient.setAuth(fetch_convex_jwt);
				window.addEventListener(
					"pagehide",
					() => {
						clearInterval(authWakeInterval);
						convexClient.close();
					},
					{ once: true },
				);
				theme = read_theme(message.theme);
				if (theme) apply_theme(theme);
				resolve({
					context: message.context,
					apiOrigin,
					getToken,
					refreshToken,
					fetchRaw,
					fetchJson,
					authorize,
					convex: convexClient,
					api: bonobo_convex_api,
					session: {
						expiresAt: () => tokenExpiresAt,
						fetchJwt: fetch_convex_jwt,
					},
					theme: {
						current: () => theme,
						subscribe(onChange) {
							themeSubscribers.add(onChange);
							return () => {
								themeSubscribers.delete(onChange);
							};
						},
					},
					agent: {
						registerTool(name, handler) {
							agentTools.set(name, handler);
							return () => {
								if (agentTools.get(name) === handler) agentTools.delete(name);
							};
						},
						setContext(context) {
							if (!is_agent_context(context))
								throw new TypeError(
									'setContext needs null or { content?: [{ type: "text", text }], structuredContent?: object }',
								);
							pendingContext = JSON.stringify(context);
							if (contextTimer !== void 0) return;
							contextTimer = setTimeout(() => {
								contextTimer = void 0;
								if (pendingContext === null || pendingContext === lastContextSent) return;
								lastContextSent = pendingContext;
								window.parent.postMessage(
									{
										type: "bonobo:update-model-context",
										nonce,
										context: JSON.parse(pendingContext),
									},
									parentOrigin,
								);
							}, CONTEXT_THROTTLE_MS);
						},
						setContextProvider(provider) {
							if (provider !== null && typeof provider !== "function")
								throw new TypeError("setContextProvider needs a function or null");
							contextProvider = provider;
							window.parent.postMessage(
								{
									type: "bonobo:context-provider",
									nonce,
									enabled: provider !== null,
								},
								parentOrigin,
							);
							return () => {
								if (provider !== null && contextProvider === provider) {
									contextProvider = null;
									window.parent.postMessage(
										{
											type: "bonobo:context-provider",
											nonce,
											enabled: false,
										},
										parentOrigin,
									);
								}
							};
						},
					},
				});
			} else if (
				initialized &&
				message.nonce === nonce &&
				message.type === "bonobo:token" &&
				typeof message.requestId === "string" &&
				typeof message.token === "string" &&
				typeof message.tokenExpiresAt === "number" &&
				Number.isFinite(message.tokenExpiresAt)
			) {
				const pending = pending_refreshes.get(message.requestId);
				if (pending) {
					pending_refreshes.delete(message.requestId);
					clearTimeout(pending.timeout);
					token = message.token;
					tokenExpiresAt = message.tokenExpiresAt;
					store_delivered_jwt(message);
					pending.resolve(message.token);
				}
			} else if (initialized && message.nonce === nonce && message.type === "bonobo:theme") {
				const next = read_theme(message.theme);
				if (next) {
					theme = next;
					apply_theme(next);
					for (const onChange of themeSubscribers) onChange(next);
				}
			} else if (
				initialized &&
				message.nonce === nonce &&
				message.type === "bonobo:token-error" &&
				typeof message.requestId === "string" &&
				typeof message.message === "string"
			) {
				const pending = pending_refreshes.get(message.requestId);
				if (pending) {
					pending_refreshes.delete(message.requestId);
					clearTimeout(pending.timeout);
					pending.reject(new Error(message.message));
				}
			} else if (
				initialized &&
				message.nonce === nonce &&
				message.type === "bonobo:agent-tool-call" &&
				typeof message.callId === "string" &&
				typeof message.toolName === "string"
			) {
				const callId = message.callId;
				/** @param {{ ok: true, output: unknown } | { ok: false, error: string }} answer */
				const reply = (answer) => {
					try {
						window.parent.postMessage(
							{
								type: "bonobo:agent-tool-result",
								nonce,
								callId,
								...answer,
							},
							parentOrigin,
						);
					} catch {
						window.parent.postMessage(
							{
								type: "bonobo:agent-tool-result",
								nonce,
								callId,
								ok: false,
								error: "The tool output could not be sent",
							},
							parentOrigin,
						);
					}
				};
				const handler = agentTools.get(message.toolName);
				if (!handler)
					reply({
						ok: false,
						error: `This page has no tool named ${message.toolName}`,
					});
				else
					Promise.resolve()
						.then(() => handler(message.input))
						.then(
							(output) =>
								reply({
									ok: true,
									output,
								}),
							(error) =>
								reply({
									ok: false,
									error: error instanceof Error ? error.message : String(error),
								}),
						);
			} else if (
				initialized &&
				message.nonce === nonce &&
				message.type === "bonobo:context-request" &&
				typeof message.requestId === "string"
			) {
				const requestId = message.requestId;
				/** @param {{ ok: true, context: unknown } | { ok: false, error: string }} answer */
				const reply = (answer) => {
					try {
						window.parent.postMessage(
							{
								type: "bonobo:context-result",
								nonce,
								requestId,
								...answer,
							},
							parentOrigin,
						);
					} catch {
						window.parent.postMessage(
							{
								type: "bonobo:context-result",
								nonce,
								requestId,
								ok: false,
								error: "The view context could not be sent",
							},
							parentOrigin,
						);
					}
				};
				/** @type {{ detail: "summary" | "snapshot", ref: string | null }} */
				const request = {
					detail: message.detail === "snapshot" ? "snapshot" : "summary",
					ref: typeof message.ref === "string" && message.ref.length <= 64 ? message.ref : null,
				};
				const provider = contextProvider;
				if (!provider)
					reply({
						ok: false,
						error: "No context provider",
					});
				else
					Promise.resolve()
						.then(() => provider(request))
						.then(
							(context) =>
								reply(
									is_agent_context(context)
										? {
												ok: true,
												context,
											}
										: {
												ok: false,
												error: "The context provider returned a bad value",
											},
								),
							(error) =>
								reply({
									ok: false,
									error: error instanceof Error ? error.message : String(error),
								}),
						);
			}
		};
		window.addEventListener("message", handle_message);
		window.addEventListener("pagehide", stop_ready, { once: true });
		post_ready();
		readyInterval = setInterval(post_ready, READY_RETRY_MS);
	});
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/compat/client.mjs
function createRoot(container) {
	return {
		render: function (children) {
			render(children, container);
		},
		unmount: function () {
			unmountComponentAtNode(container);
		},
	};
}
// src/retry.ts
/** How many times a rate-limited call is sent again before its 429 is returned. */
var MAX_429_RETRIES = 4;
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function get_error_message(error) {
	return error instanceof Error ? error.message : String(error);
}
/**
 * `client.fetchJson` with the 429 back-off the SDK README asks for: wait `retryAfterMs` plus a
 * small random delay, then send the exact same body (including any cursor) again.
 *
 * A 429 without `retryAfterMs` does not clear soon, so it comes back at once. Every other status
 * comes back for the caller to narrow on, a 5xx included. `body` is `null` when the answer did not
 * parse as JSON. Only a refused session refresh and a network failure reject.
 */
async function fetch_json_with_429_retry(client, path, body) {
	for (let attempt = 0; ; attempt += 1) {
		const answer = await client.fetchJson(path, body);
		const answerBody = answer.body;
		const retryAfterMs =
			answer.status === 429 && typeof answerBody === "object" && answerBody !== null && "retryAfterMs" in answerBody
				? answerBody.retryAfterMs
				: void 0;
		if (typeof retryAfterMs === "number" && attempt < MAX_429_RETRIES) {
			await sleep(retryAfterMs + Math.random() * 250);
			continue;
		}
		return answer;
	}
}
/**
 * Read the whole text of one flat file.
 *
 * The read route answers bytes, one page at a time. One decoder is kept across the pages, so a
 * character that is split between two pages still decodes right.
 */
async function read_flat_text(client, path) {
	const decoder = new TextDecoder();
	let cursor = null;
	let text = "";
	do {
		const response = await client.fetchRaw("/api/v1/files/read", {
			path,
			cursor,
		});
		if (!response.ok) {
			const body = await response.json().catch(() => null);
			const message =
				typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
					? body.message
					: `The file read answered ${response.status}`;
			throw new Error(message);
		}
		text += decoder.decode(await response.arrayBuffer(), { stream: true });
		cursor = response.headers.get("X-File-Next-Cursor");
	} while (cursor !== null);
	return text + decoder.decode();
}
/**
 * The folder that holds the photos of one flat: the flat file path without `.md`.
 */
function flat_photo_folder(flatPath) {
	return flatPath.replace(/\.md$/u, "");
}
/**
 * List the photos of one flat. A flat without a photo folder has no photos, so a missing or
 * unreadable folder gives an empty list instead of an error.
 */
async function list_flat_photos(client, flatPath) {
	const answer = await fetch_json_with_429_retry(client, "/api/v1/files/list", {
		path: flat_photo_folder(flatPath),
		recursive: true,
		kind: "file",
		contentTypePrefixes: ["image/"],
		limit: 24,
	});
	if (answer.status === 403 || answer.status === 404) return [];
	if (answer.status !== 200) throw new Error(answer.body?.message ?? `The files list answered ${answer.status}`);
	if (answer.body === null) throw new Error("The files list answered 200 with a body that is not JSON");
	return answer.body.items.filter((item) => !item.locked);
}
/**
 * The fields the table shows. The route returns them with each row, so the table needs no
 * second request per flat.
 */
var TABLE_FIELDS = [
	"frontmatter.title",
	"frontmatter.rentWarm",
	"frontmatter.rentWarmEstimated",
	"frontmatter.sizeM2",
	"frontmatter.rooms",
	"frontmatter.bikeMin",
	"frontmatter.postedAt",
	"frontmatter.status",
];
var FLAT_STATUSES = ["new", "saved", "contacted", "hidden"];
var VIEWS = [
	{
		id: "newest",
		label: "Newest",
	},
	{
		id: "cheapest",
		label: "Cheapest",
	},
	{
		id: "biggest",
		label: "Biggest",
	},
	{
		id: "shortest-bike",
		label: "Shortest bike ride",
	},
	{
		id: "ideal",
		label: "Ideal",
	},
	{
		id: "status",
		label: "By status",
	},
];
/**
 * The request one view sends for one page.
 *
 * Every view is one folder-mode query on one field. A sort view leaves out `match`, so the folder
 * answers every flat that has the field, in value order. A flat without that field is not in the
 * view.
 */
function view_request(folder, choice, cursor) {
	const base = {
		mode: "folder",
		path: folder,
		fields: TABLE_FIELDS,
		limit: 50,
		cursor,
	};
	switch (choice.view) {
		case "newest":
			return {
				...base,
				field: "frontmatter.postedAt",
				order: "desc",
			};
		case "cheapest":
			return {
				...base,
				field: "frontmatter.rentWarm",
				order: "asc",
			};
		case "biggest":
			return {
				...base,
				field: "frontmatter.sizeM2",
				order: "desc",
			};
		case "shortest-bike":
			return {
				...base,
				field: "frontmatter.bikeMin",
				order: "asc",
			};
		case "ideal":
			return {
				...base,
				field: "frontmatter.ideal",
				match: { eq: true },
			};
		case "status":
			return {
				...base,
				field: "frontmatter.status",
				match: { eq: choice.status },
			};
	}
}
/**
 * Read one returned field of a row. A file without the field gives `null`.
 */
function row_field(row, field) {
	return row.fields[field]?.value ?? null;
}
/**
 * Read one returned field as a number. A missing field, or a value that is not a number, gives
 * `null`.
 */
function row_number(row, field) {
	const value = row_field(row, field);
	if (typeof value === "number") return value;
	const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
	return Number.isFinite(parsed) ? parsed : null;
}
/**
 * Keep the rows up to the max rent, and say if the page went past it.
 *
 * The "Cheapest" view comes back in rent order. So the first row above the max rent means every
 * later row is above it too, and paging can stop there. No max rent keeps every row.
 */
function take_rows_up_to_max_rent(rows, maxRent) {
	if (maxRent === null)
		return {
			rows,
			reachedMaxRent: false,
		};
	const firstAbove = rows.findIndex((row) => {
		const rent = row_number(row, "frontmatter.rentWarm");
		return rent !== null && rent > maxRent;
	});
	if (firstAbove === -1)
		return {
			rows,
			reachedMaxRent: false,
		};
	return {
		rows: rows.slice(0, firstAbove),
		reachedMaxRent: true,
	};
}
/** The message for a folder the person did not choose for this plugin. */
var PERMISSION_MESSAGE = "Choose the flats folder in My file permissions.";
function create_flat_list(client, folder, choice) {
	let cursor = null;
	let isDone = false;
	const seenNodeIds = /* @__PURE__ */ new Set();
	return {
		async load_next() {
			const rows = [];
			let errorMessage = null;
			let restarted = false;
			try {
				for (let requests = 0; rows.length === 0 && !isDone && requests < 8; requests += 1) {
					const answer = await fetch_json_with_429_retry(
						client,
						"/api/v1/files/query",
						view_request(folder, choice, cursor),
					);
					if (
						answer.status === 400 &&
						answer.body !== null &&
						answer.body.errorCode === "invalid_cursor" &&
						cursor !== null &&
						!restarted
					) {
						restarted = true;
						cursor = null;
						continue;
					}
					if (answer.status === 403) throw new Error(PERMISSION_MESSAGE);
					if (answer.status === 404) throw new Error(`The folder ${folder} does not exist.`);
					if (answer.status !== 200)
						throw new Error(answer.body?.message ?? `The files query answered ${answer.status}`);
					if (answer.body === null) throw new Error("The files query answered 200 with a body that is not JSON");
					const page = take_rows_up_to_max_rent(answer.body.items, choice.view === "cheapest" ? choice.maxRent : null);
					cursor = answer.body.cursor;
					isDone = answer.body.isDone || page.reachedMaxRent;
					for (const row of page.rows) {
						if (seenNodeIds.has(row.nodeId)) continue;
						seenNodeIds.add(row.nodeId);
						rows.push(row);
					}
				}
			} catch (error) {
				errorMessage = get_error_message(error);
			}
			return {
				rows,
				errorMessage,
			};
		},
		has_more() {
			return !isDone;
		},
	};
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/identity.js
var ALIAS = Symbol.for("yaml.alias");
var DOC = Symbol.for("yaml.document");
var MAP = Symbol.for("yaml.map");
var PAIR = Symbol.for("yaml.pair");
var SCALAR$1 = Symbol.for("yaml.scalar");
var SEQ = Symbol.for("yaml.seq");
var NODE_TYPE = Symbol.for("yaml.node.type");
var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR$1;
var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
function isCollection(node) {
	if (node && typeof node === "object")
		switch (node[NODE_TYPE]) {
			case MAP:
			case SEQ:
				return true;
		}
	return false;
}
function isNode(node) {
	if (node && typeof node === "object")
		switch (node[NODE_TYPE]) {
			case ALIAS:
			case MAP:
			case SCALAR$1:
			case SEQ:
				return true;
		}
	return false;
}
var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/visit.js
var BREAK$1 = Symbol("break visit");
var SKIP$1 = Symbol("skip children");
var REMOVE$1 = Symbol("remove node");
/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
function visit$1(node, visitor) {
	const visitor_ = initVisitor(visitor);
	if (isDocument(node)) {
		if (visit_(null, node.contents, visitor_, Object.freeze([node])) === REMOVE$1) node.contents = null;
	} else visit_(null, node, visitor_, Object.freeze([]));
}
/** Terminate visit traversal completely */
visit$1.BREAK = BREAK$1;
/** Do not visit the children of the current node */
visit$1.SKIP = SKIP$1;
/** Remove the current node */
visit$1.REMOVE = REMOVE$1;
function visit_(key, node, visitor, path) {
	const ctrl = callVisitor(key, node, visitor, path);
	if (isNode(ctrl) || isPair(ctrl)) {
		replaceNode(key, path, ctrl);
		return visit_(key, ctrl, visitor, path);
	}
	if (typeof ctrl !== "symbol") {
		if (isCollection(node)) {
			path = Object.freeze(path.concat(node));
			for (let i = 0; i < node.items.length; ++i) {
				const ci = visit_(i, node.items[i], visitor, path);
				if (typeof ci === "number") i = ci - 1;
				else if (ci === BREAK$1) return BREAK$1;
				else if (ci === REMOVE$1) {
					node.items.splice(i, 1);
					i -= 1;
				}
			}
		} else if (isPair(node)) {
			path = Object.freeze(path.concat(node));
			const ck = visit_("key", node.key, visitor, path);
			if (ck === BREAK$1) return BREAK$1;
			else if (ck === REMOVE$1) node.key = null;
			const cv = visit_("value", node.value, visitor, path);
			if (cv === BREAK$1) return BREAK$1;
			else if (cv === REMOVE$1) node.value = null;
		}
	}
	return ctrl;
}
/**
 * Apply an async visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `Promise`: Must resolve to one of the following values
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node. To define the same visitor function for more than
 * one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
 * and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
 * specific defined one will be used for each node.
 */
async function visitAsync(node, visitor) {
	const visitor_ = initVisitor(visitor);
	if (isDocument(node)) {
		if ((await visitAsync_(null, node.contents, visitor_, Object.freeze([node]))) === REMOVE$1) node.contents = null;
	} else await visitAsync_(null, node, visitor_, Object.freeze([]));
}
/** Terminate visit traversal completely */
visitAsync.BREAK = BREAK$1;
/** Do not visit the children of the current node */
visitAsync.SKIP = SKIP$1;
/** Remove the current node */
visitAsync.REMOVE = REMOVE$1;
async function visitAsync_(key, node, visitor, path) {
	const ctrl = await callVisitor(key, node, visitor, path);
	if (isNode(ctrl) || isPair(ctrl)) {
		replaceNode(key, path, ctrl);
		return visitAsync_(key, ctrl, visitor, path);
	}
	if (typeof ctrl !== "symbol") {
		if (isCollection(node)) {
			path = Object.freeze(path.concat(node));
			for (let i = 0; i < node.items.length; ++i) {
				const ci = await visitAsync_(i, node.items[i], visitor, path);
				if (typeof ci === "number") i = ci - 1;
				else if (ci === BREAK$1) return BREAK$1;
				else if (ci === REMOVE$1) {
					node.items.splice(i, 1);
					i -= 1;
				}
			}
		} else if (isPair(node)) {
			path = Object.freeze(path.concat(node));
			const ck = await visitAsync_("key", node.key, visitor, path);
			if (ck === BREAK$1) return BREAK$1;
			else if (ck === REMOVE$1) node.key = null;
			const cv = await visitAsync_("value", node.value, visitor, path);
			if (cv === BREAK$1) return BREAK$1;
			else if (cv === REMOVE$1) node.value = null;
		}
	}
	return ctrl;
}
function initVisitor(visitor) {
	if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value))
		return Object.assign(
			{
				Alias: visitor.Node,
				Map: visitor.Node,
				Scalar: visitor.Node,
				Seq: visitor.Node,
			},
			visitor.Value && {
				Map: visitor.Value,
				Scalar: visitor.Value,
				Seq: visitor.Value,
			},
			visitor.Collection && {
				Map: visitor.Collection,
				Seq: visitor.Collection,
			},
			visitor,
		);
	return visitor;
}
function callVisitor(key, node, visitor, path) {
	if (typeof visitor === "function") return visitor(key, node, path);
	if (isMap(node)) return visitor.Map?.(key, node, path);
	if (isSeq(node)) return visitor.Seq?.(key, node, path);
	if (isPair(node)) return visitor.Pair?.(key, node, path);
	if (isScalar(node)) return visitor.Scalar?.(key, node, path);
	if (isAlias(node)) return visitor.Alias?.(key, node, path);
}
function replaceNode(key, path, node) {
	const parent = path[path.length - 1];
	if (isCollection(parent)) parent.items[key] = node;
	else if (isPair(parent)) {
		if (key === "key") parent.key = node;
		else parent.value = node;
	} else if (isDocument(parent)) parent.contents = node;
	else {
		const pt = isAlias(parent) ? "alias" : "scalar";
		throw new Error(`Cannot replace node with ${pt} parent`);
	}
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/doc/directives.js
var escapeChars = {
	"!": "%21",
	",": "%2C",
	"[": "%5B",
	"]": "%5D",
	"{": "%7B",
	"}": "%7D",
};
var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
var Directives = class Directives {
	constructor(yaml, tags) {
		/**
		 * The directives-end/doc-start marker `---`. If `null`, a marker may still be
		 * included in the document's stringified representation.
		 */
		this.docStart = null;
		/** The doc-end marker `...`.  */
		this.docEnd = false;
		this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
		this.tags = Object.assign({}, Directives.defaultTags, tags);
	}
	clone() {
		const copy = new Directives(this.yaml, this.tags);
		copy.docStart = this.docStart;
		return copy;
	}
	/**
	 * During parsing, get a Directives instance for the current document and
	 * update the stream state according to the current version's spec.
	 */
	atDocument() {
		const res = new Directives(this.yaml, this.tags);
		switch (this.yaml.version) {
			case "1.1":
				this.atNextDocument = true;
				break;
			case "1.2":
				this.atNextDocument = false;
				this.yaml = {
					explicit: Directives.defaultYaml.explicit,
					version: "1.2",
				};
				this.tags = Object.assign({}, Directives.defaultTags);
		}
		return res;
	}
	/**
	 * @param onError - May be called even if the action was successful
	 * @returns `true` on success
	 */
	add(line, onError) {
		if (this.atNextDocument) {
			this.yaml = {
				explicit: Directives.defaultYaml.explicit,
				version: "1.1",
			};
			this.tags = Object.assign({}, Directives.defaultTags);
			this.atNextDocument = false;
		}
		const parts = line.trim().split(/[ \t]+/);
		const name = parts.shift();
		switch (name) {
			case "%TAG": {
				if (parts.length !== 2) {
					onError(0, "%TAG directive should contain exactly two parts");
					if (parts.length < 2) return false;
				}
				const [handle, prefix] = parts;
				this.tags[handle] = prefix;
				return true;
			}
			case "%YAML": {
				this.yaml.explicit = true;
				if (parts.length !== 1) {
					onError(0, "%YAML directive should contain exactly one part");
					return false;
				}
				const [version] = parts;
				if (version === "1.1" || version === "1.2") {
					this.yaml.version = version;
					return true;
				} else {
					const isValid = /^\d+\.\d+$/.test(version);
					onError(6, `Unsupported YAML version ${version}`, isValid);
					return false;
				}
			}
			default:
				onError(0, `Unknown directive ${name}`, true);
				return false;
		}
	}
	/**
	 * Resolves a tag, matching handles to those defined in %TAG directives.
	 *
	 * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
	 *   `'!local'` tag, or `null` if unresolvable.
	 */
	tagName(source, onError) {
		if (source === "!") return "!";
		if (source[0] !== "!") {
			onError(`Not a valid tag: ${source}`);
			return null;
		}
		if (source[1] === "<") {
			const verbatim = source.slice(2, -1);
			if (verbatim === "!" || verbatim === "!!") {
				onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
				return null;
			}
			if (source[source.length - 1] !== ">") onError("Verbatim tags must end with a >");
			return verbatim;
		}
		const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
		if (!suffix) onError(`The ${source} tag has no suffix`);
		const prefix = this.tags[handle];
		if (prefix)
			try {
				return prefix + decodeURIComponent(suffix);
			} catch (error) {
				onError(String(error));
				return null;
			}
		if (handle === "!") return source;
		onError(`Could not resolve tag: ${source}`);
		return null;
	}
	/**
	 * Given a fully resolved tag, returns its printable string form,
	 * taking into account current tag prefixes and defaults.
	 */
	tagString(tag) {
		for (const [handle, prefix] of Object.entries(this.tags))
			if (tag.startsWith(prefix)) return handle + escapeTagName(tag.substring(prefix.length));
		return tag[0] === "!" ? tag : `!<${tag}>`;
	}
	toString(doc) {
		const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
		const tagEntries = Object.entries(this.tags);
		let tagNames;
		if (doc && tagEntries.length > 0 && isNode(doc.contents)) {
			const tags = {};
			visit$1(doc.contents, (_key, node) => {
				if (isNode(node) && node.tag) tags[node.tag] = true;
			});
			tagNames = Object.keys(tags);
		} else tagNames = [];
		for (const [handle, prefix] of tagEntries) {
			if (handle === "!!" && prefix === "tag:yaml.org,2002:") continue;
			if (!doc || tagNames.some((tn) => tn.startsWith(prefix))) lines.push(`%TAG ${handle} ${prefix}`);
		}
		return lines.join("\n");
	}
};
Directives.defaultYaml = {
	explicit: false,
	version: "1.2",
};
Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/doc/anchors.js
/**
 * Verify that the input string is a valid anchor.
 *
 * Will throw on errors.
 */
function anchorIsValid(anchor) {
	if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
		const msg = `Anchor must not contain whitespace or control characters: ${JSON.stringify(anchor)}`;
		throw new Error(msg);
	}
	return true;
}
function anchorNames(root) {
	const anchors = /* @__PURE__ */ new Set();
	visit$1(root, {
		Value(_key, node) {
			if (node.anchor) anchors.add(node.anchor);
		},
	});
	return anchors;
}
/** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
function findNewAnchor(prefix, exclude) {
	for (let i = 1; ; ++i) {
		const name = `${prefix}${i}`;
		if (!exclude.has(name)) return name;
	}
}
function createNodeAnchors(doc, prefix) {
	const aliasObjects = [];
	const sourceObjects = /* @__PURE__ */ new Map();
	let prevAnchors = null;
	return {
		onAnchor: (source) => {
			aliasObjects.push(source);
			prevAnchors ?? (prevAnchors = anchorNames(doc));
			const anchor = findNewAnchor(prefix, prevAnchors);
			prevAnchors.add(anchor);
			return anchor;
		},
		/**
		 * With circular references, the source node is only resolved after all
		 * of its child nodes are. This is why anchors are set only after all of
		 * the nodes have been created.
		 */
		setAnchors: () => {
			for (const source of aliasObjects) {
				const ref = sourceObjects.get(source);
				if (typeof ref === "object" && ref.anchor && (isScalar(ref.node) || isCollection(ref.node)))
					ref.node.anchor = ref.anchor;
				else {
					const error = /* @__PURE__ */ new Error("Failed to resolve repeated object (this should not happen)");
					error.source = source;
					throw error;
				}
			}
		},
		sourceObjects,
	};
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/doc/applyReviver.js
/**
 * Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
 * in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
 * 2021 edition: https://tc39.es/ecma262/#sec-json.parse
 *
 * Includes extensions for handling Map and Set objects.
 */
function applyReviver(reviver, obj, key, val) {
	if (val && typeof val === "object") {
		if (Array.isArray(val))
			for (let i = 0, len = val.length; i < len; ++i) {
				const v0 = val[i];
				const v1 = applyReviver(reviver, val, String(i), v0);
				if (v1 === void 0) delete val[i];
				else if (v1 !== v0) val[i] = v1;
			}
		else if (val instanceof Map)
			for (const k of Array.from(val.keys())) {
				const v0 = val.get(k);
				const v1 = applyReviver(reviver, val, k, v0);
				if (v1 === void 0) val.delete(k);
				else if (v1 !== v0) val.set(k, v1);
			}
		else if (val instanceof Set)
			for (const v0 of Array.from(val)) {
				const v1 = applyReviver(reviver, val, v0, v0);
				if (v1 === void 0) val.delete(v0);
				else if (v1 !== v0) {
					val.delete(v0);
					val.add(v1);
				}
			}
		else
			for (const [k, v0] of Object.entries(val)) {
				const v1 = applyReviver(reviver, val, k, v0);
				if (v1 === void 0) delete val[k];
				else if (v1 !== v0) val[k] = v1;
			}
	}
	return reviver.call(obj, key, val);
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/toJS.js
/**
 * Recursively convert any node or its contents to native JavaScript
 *
 * @param value - The input value
 * @param arg - If `value` defines a `toJSON()` method, use this
 *   as its first argument
 * @param ctx - Conversion context, originally set in Document#toJS(). If
 *   `{ keep: true }` is not set, output should be suitable for JSON
 *   stringification.
 */
function toJS(value, arg, ctx) {
	if (Array.isArray(value)) return value.map((v, i) => toJS(v, String(i), ctx));
	if (value && typeof value.toJSON === "function") {
		if (!ctx || !hasAnchor(value)) return value.toJSON(arg, ctx);
		const data = {
			aliasCount: 0,
			count: 1,
			res: void 0,
		};
		ctx.anchors.set(value, data);
		ctx.onCreate = (res) => {
			data.res = res;
			delete ctx.onCreate;
		};
		const res = value.toJSON(arg, ctx);
		if (ctx.onCreate) ctx.onCreate(res);
		return res;
	}
	if (typeof value === "bigint" && !ctx?.keep) return Number(value);
	return value;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/Node.js
var NodeBase = class {
	constructor(type) {
		Object.defineProperty(this, NODE_TYPE, { value: type });
	}
	/** Create a copy of this node.  */
	clone() {
		const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
		if (this.range) copy.range = this.range.slice();
		return copy;
	}
	/** A plain JavaScript representation of this node. */
	toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
		if (!isDocument(doc)) throw new TypeError("A document argument is required");
		const ctx = {
			anchors: /* @__PURE__ */ new Map(),
			doc,
			keep: true,
			mapAsMap: mapAsMap === true,
			mapKeyWarned: false,
			maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100,
		};
		const res = toJS(this, "", ctx);
		if (typeof onAnchor === "function") for (const { count, res } of ctx.anchors.values()) onAnchor(res, count);
		return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/Alias.js
var Alias = class extends NodeBase {
	constructor(source) {
		super(ALIAS);
		this.source = source;
		Object.defineProperty(this, "tag", {
			set() {
				throw new Error("Alias nodes cannot have tags");
			},
		});
	}
	/**
	 * Resolve the value of this alias within `doc`, finding the last
	 * instance of the `source` anchor before this node.
	 */
	resolve(doc, ctx) {
		if (ctx?.maxAliasCount === 0) throw new ReferenceError("Alias resolution is disabled");
		let nodes;
		if (ctx?.aliasResolveCache) nodes = ctx.aliasResolveCache;
		else {
			nodes = [];
			visit$1(doc, {
				Node: (_key, node) => {
					if (isAlias(node) || hasAnchor(node)) nodes.push(node);
				},
			});
			if (ctx) ctx.aliasResolveCache = nodes;
		}
		let found = void 0;
		for (const node of nodes) {
			if (node === this) break;
			if (node.anchor === this.source) found = node;
		}
		if (found && ctx) {
			const { anchors, doc, maxAliasCount } = ctx;
			let data = anchors.get(found);
			if (!data) {
				toJS(found, null, ctx);
				data = anchors.get(found);
			}
			/* istanbul ignore if */
			if (data?.res === void 0) throw new ReferenceError("This should not happen: Alias anchor was not resolved?");
			if (maxAliasCount >= 0) {
				data.count += 1;
				if (data.aliasCount === 0) data.aliasCount = getAliasCount(doc, found, anchors);
				if (data.count * data.aliasCount > maxAliasCount)
					throw new ReferenceError("Excessive alias count indicates a resource exhaustion attack");
			}
		}
		return found;
	}
	toJSON(_arg, ctx) {
		if (!ctx) return { source: this.source };
		const source = this.resolve(ctx.doc, ctx);
		if (!source) {
			const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
			throw new ReferenceError(msg);
		}
		return ctx.anchors.get(source).res;
	}
	toString(ctx, _onComment, _onChompKeep) {
		const src = `*${this.source}`;
		if (ctx) {
			anchorIsValid(this.source);
			if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
				const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
				throw new Error(msg);
			}
			if (ctx.implicitKey) return `${src} `;
		}
		return src;
	}
};
function getAliasCount(doc, node, anchors) {
	if (isAlias(node)) {
		const source = node.resolve(doc);
		const anchor = anchors && source && anchors.get(source);
		return anchor ? anchor.count * anchor.aliasCount : 0;
	} else if (isCollection(node)) {
		let count = 0;
		for (const item of node.items) {
			const c = getAliasCount(doc, item, anchors);
			if (c > count) count = c;
		}
		return count;
	} else if (isPair(node)) {
		const kc = getAliasCount(doc, node.key, anchors);
		const vc = getAliasCount(doc, node.value, anchors);
		return Math.max(kc, vc);
	}
	return 1;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/Scalar.js
var isScalarValue = (value) => !value || (typeof value !== "function" && typeof value !== "object");
var Scalar = class extends NodeBase {
	constructor(value) {
		super(SCALAR$1);
		this.value = value;
	}
	toJSON(arg, ctx) {
		return ctx?.keep ? this.value : toJS(this.value, arg, ctx);
	}
	toString() {
		return String(this.value);
	}
};
Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
Scalar.PLAIN = "PLAIN";
Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/doc/createNode.js
var defaultTagPrefix = "tag:yaml.org,2002:";
function findTagObject(value, tagName, tags) {
	if (tagName) {
		const match = tags.filter((t) => t.tag === tagName);
		const tagObj = match.find((t) => !t.format) ?? match[0];
		if (!tagObj) throw new Error(`Tag ${tagName} not found`);
		return tagObj;
	}
	return tags.find((t) => t.identify?.(value) && !t.format);
}
function createNode(value, tagName, ctx) {
	if (isDocument(value)) value = value.contents;
	if (isNode(value)) return value;
	if (isPair(value)) {
		const map = ctx.schema[MAP].createNode?.(ctx.schema, null, ctx);
		map.items.push(value);
		return map;
	}
	if (
		value instanceof String ||
		value instanceof Number ||
		value instanceof Boolean ||
		(typeof BigInt !== "undefined" && value instanceof BigInt)
	)
		value = value.valueOf();
	const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
	let ref = void 0;
	if (aliasDuplicateObjects && value && typeof value === "object") {
		ref = sourceObjects.get(value);
		if (ref) {
			ref.anchor ?? (ref.anchor = onAnchor(value));
			return new Alias(ref.anchor);
		} else {
			ref = {
				anchor: null,
				node: null,
			};
			sourceObjects.set(value, ref);
		}
	}
	if (tagName?.startsWith("!!")) tagName = defaultTagPrefix + tagName.slice(2);
	let tagObj = findTagObject(value, tagName, schema.tags);
	if (!tagObj) {
		if (value && typeof value.toJSON === "function") value = value.toJSON();
		if (!value || typeof value !== "object") {
			const node = new Scalar(value);
			if (ref) ref.node = node;
			return node;
		}
		tagObj = value instanceof Map ? schema[MAP] : Symbol.iterator in Object(value) ? schema[SEQ] : schema[MAP];
	}
	if (onTagObj) {
		onTagObj(tagObj);
		delete ctx.onTagObj;
	}
	const node = tagObj?.createNode
		? tagObj.createNode(ctx.schema, value, ctx)
		: typeof tagObj?.nodeClass?.from === "function"
			? tagObj.nodeClass.from(ctx.schema, value, ctx)
			: new Scalar(value);
	if (tagName) node.tag = tagName;
	else if (!tagObj.default) node.tag = tagObj.tag;
	if (ref) ref.node = node;
	return node;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/Collection.js
function collectionFromPath(schema, path, value) {
	let v = value;
	for (let i = path.length - 1; i >= 0; --i) {
		const k = path[i];
		if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
			const a = [];
			a[k] = v;
			v = a;
		} else v = /* @__PURE__ */ new Map([[k, v]]);
	}
	return createNode(v, void 0, {
		aliasDuplicateObjects: false,
		keepUndefined: false,
		onAnchor: () => {
			throw new Error("This should not happen, please report a bug.");
		},
		schema,
		sourceObjects: /* @__PURE__ */ new Map(),
	});
}
var isEmptyPath = (path) => path == null || (typeof path === "object" && !!path[Symbol.iterator]().next().done);
var Collection = class extends NodeBase {
	constructor(type, schema) {
		super(type);
		Object.defineProperty(this, "schema", {
			value: schema,
			configurable: true,
			enumerable: false,
			writable: true,
		});
	}
	/**
	 * Create a copy of this collection.
	 *
	 * @param schema - If defined, overwrites the original's schema
	 */
	clone(schema) {
		const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
		if (schema) copy.schema = schema;
		copy.items = copy.items.map((it) => (isNode(it) || isPair(it) ? it.clone(schema) : it));
		if (this.range) copy.range = this.range.slice();
		return copy;
	}
	/**
	 * Adds a value to the collection. For `!!map` and `!!omap` the value must
	 * be a Pair instance or a `{ key, value }` object, which may not have a key
	 * that already exists in the map.
	 */
	addIn(path, value) {
		if (isEmptyPath(path)) this.add(value);
		else {
			const [key, ...rest] = path;
			const node = this.get(key, true);
			if (isCollection(node)) node.addIn(rest, value);
			else if (node === void 0 && this.schema) this.set(key, collectionFromPath(this.schema, rest, value));
			else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
		}
	}
	/**
	 * Removes a value from the collection.
	 * @returns `true` if the item was found and removed.
	 */
	deleteIn(path) {
		const [key, ...rest] = path;
		if (rest.length === 0) return this.delete(key);
		const node = this.get(key, true);
		if (isCollection(node)) return node.deleteIn(rest);
		else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
	}
	/**
	 * Returns item at `key`, or `undefined` if not found. By default unwraps
	 * scalar values from their surrounding node; to disable set `keepScalar` to
	 * `true` (collections are always returned intact).
	 */
	getIn(path, keepScalar) {
		const [key, ...rest] = path;
		const node = this.get(key, true);
		if (rest.length === 0) return !keepScalar && isScalar(node) ? node.value : node;
		else return isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
	}
	hasAllNullValues(allowScalar) {
		return this.items.every((node) => {
			if (!isPair(node)) return false;
			const n = node.value;
			return n == null || (allowScalar && isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag);
		});
	}
	/**
	 * Checks if the collection includes a value with the key `key`.
	 */
	hasIn(path) {
		const [key, ...rest] = path;
		if (rest.length === 0) return this.has(key);
		const node = this.get(key, true);
		return isCollection(node) ? node.hasIn(rest) : false;
	}
	/**
	 * Sets a value in this collection. For `!!set`, `value` needs to be a
	 * boolean to add/remove the item from the set.
	 */
	setIn(path, value) {
		const [key, ...rest] = path;
		if (rest.length === 0) this.set(key, value);
		else {
			const node = this.get(key, true);
			if (isCollection(node)) node.setIn(rest, value);
			else if (node === void 0 && this.schema) this.set(key, collectionFromPath(this.schema, rest, value));
			else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
		}
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringifyComment.js
/**
 * Stringifies a comment.
 *
 * Empty comment lines are left empty,
 * lines consisting of a single space are replaced by `#`,
 * and all other lines are prefixed with a `#`.
 */
var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
function indentComment(comment, indent) {
	if (/^\n+$/.test(comment)) return comment.substring(1);
	return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
var lineComment = (str, indent, comment) =>
	str.endsWith("\n")
		? indentComment(comment, indent)
		: comment.includes("\n")
			? "\n" + indentComment(comment, indent)
			: (str.endsWith(" ") ? "" : " ") + comment;
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/foldFlowLines.js
var FOLD_FLOW = "flow";
var FOLD_BLOCK = "block";
var FOLD_QUOTED = "quoted";
/**
 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
 * terminated with `\n` and started with `indent`.
 */
function foldFlowLines(
	text,
	indent,
	mode = "flow",
	{ indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {},
) {
	if (!lineWidth || lineWidth < 0) return text;
	if (lineWidth < minContentWidth) minContentWidth = 0;
	const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
	if (text.length <= endStep) return text;
	const folds = [];
	const escapedFolds = {};
	let end = lineWidth - indent.length;
	if (typeof indentAtStart === "number") {
		if (indentAtStart > lineWidth - Math.max(2, minContentWidth)) folds.push(0);
		else end = lineWidth - indentAtStart;
	}
	let split = void 0;
	let prev = void 0;
	let overflow = false;
	let i = -1;
	let escStart = -1;
	let escEnd = -1;
	if (mode === "block") {
		i = consumeMoreIndentedLines(text, i, indent.length);
		if (i !== -1) end = i + endStep;
	}
	for (let ch; (ch = text[(i += 1)]);) {
		if (mode === "quoted" && ch === "\\") {
			escStart = i;
			switch (text[i + 1]) {
				case "x":
					i += 3;
					break;
				case "u":
					i += 5;
					break;
				case "U":
					i += 9;
					break;
				default:
					i += 1;
			}
			escEnd = i;
		}
		if (ch === "\n") {
			if (mode === "block") i = consumeMoreIndentedLines(text, i, indent.length);
			end = i + indent.length + endStep;
			split = void 0;
		} else {
			if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
				const next = text[i + 1];
				if (next && next !== " " && next !== "\n" && next !== "	") split = i;
			}
			if (i >= end) {
				if (split) {
					folds.push(split);
					end = split + endStep;
					split = void 0;
				} else if (mode === "quoted") {
					while (prev === " " || prev === "	") {
						prev = ch;
						ch = text[(i += 1)];
						overflow = true;
					}
					const j = i > escEnd + 1 ? i - 2 : escStart - 1;
					if (escapedFolds[j]) return text;
					folds.push(j);
					escapedFolds[j] = true;
					end = j + endStep;
					split = void 0;
				} else overflow = true;
			}
		}
		prev = ch;
	}
	if (overflow && onOverflow) onOverflow();
	if (folds.length === 0) return text;
	if (onFold) onFold();
	let res = text.slice(0, folds[0]);
	for (let i = 0; i < folds.length; ++i) {
		const fold = folds[i];
		const end = folds[i + 1] || text.length;
		if (fold === 0) res = `\n${indent}${text.slice(0, end)}`;
		else {
			if (mode === "quoted" && escapedFolds[fold]) res += `${text[fold]}\\`;
			res += `\n${indent}${text.slice(fold + 1, end)}`;
		}
	}
	return res;
}
/**
 * Presumes `i + 1` is at the start of a line
 * @returns index of last newline in more-indented block
 */
function consumeMoreIndentedLines(text, i, indent) {
	let end = i;
	let start = i + 1;
	let ch = text[start];
	while (ch === " " || ch === "	")
		if (i < start + indent) ch = text[++i];
		else {
			do ch = text[++i];
			while (ch && ch !== "\n");
			end = i;
			start = i + 1;
			ch = text[start];
		}
	return end;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringifyString.js
var getFoldOptions = (ctx, isBlock) => ({
	indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
	lineWidth: ctx.options.lineWidth,
	minContentWidth: ctx.options.minContentWidth,
});
var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
	if (!lineWidth || lineWidth < 0) return false;
	const limit = lineWidth - indentLength;
	const strLen = str.length;
	if (strLen <= limit) return false;
	for (let i = 0, start = 0; i < strLen; ++i)
		if (str[i] === "\n") {
			if (i - start > limit) return true;
			start = i + 1;
			if (strLen - start <= limit) return false;
		}
	return true;
}
function doubleQuotedString(value, ctx) {
	const json = JSON.stringify(value);
	if (ctx.options.doubleQuotedAsJSON) return json;
	const { implicitKey } = ctx;
	const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
	const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
	let str = "";
	let start = 0;
	for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
		if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
			str += json.slice(start, i) + "\\ ";
			i += 1;
			start = i;
			ch = "\\";
		}
		if (ch === "\\")
			switch (json[i + 1]) {
				case "u":
					{
						str += json.slice(start, i);
						const code = json.substr(i + 2, 4);
						switch (code) {
							case "0000":
								str += "\\0";
								break;
							case "0007":
								str += "\\a";
								break;
							case "000b":
								str += "\\v";
								break;
							case "001b":
								str += "\\e";
								break;
							case "0085":
								str += "\\N";
								break;
							case "00a0":
								str += "\\_";
								break;
							case "2028":
								str += "\\L";
								break;
							case "2029":
								str += "\\P";
								break;
							default:
								if (code.substr(0, 2) === "00") str += "\\x" + code.substr(2);
								else str += json.substr(i, 6);
						}
						i += 5;
						start = i + 1;
					}
					break;
				case "n":
					if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) i += 1;
					else {
						str += json.slice(start, i) + "\n\n";
						while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
							str += "\n";
							i += 2;
						}
						str += indent;
						if (json[i + 2] === " ") str += "\\";
						i += 1;
						start = i + 1;
					}
					break;
				default:
					i += 1;
			}
	}
	str = start ? str + json.slice(start) : json;
	return implicitKey ? str : foldFlowLines(str, indent, FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
	if (ctx.options.singleQuote === false || (ctx.implicitKey && value.includes("\n")) || /[ \t]\n|\n[ \t]/.test(value))
		return doubleQuotedString(value, ctx);
	const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
	const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
	return ctx.implicitKey ? res : foldFlowLines(res, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
	const { singleQuote } = ctx.options;
	let qs;
	if (singleQuote === false) qs = doubleQuotedString;
	else {
		const hasDouble = value.includes('"');
		const hasSingle = value.includes("'");
		if (hasDouble && !hasSingle) qs = singleQuotedString;
		else if (hasSingle && !hasDouble) qs = doubleQuotedString;
		else qs = singleQuote ? singleQuotedString : doubleQuotedString;
	}
	return qs(value, ctx);
}
var blockEndNewlines;
try {
	blockEndNewlines = /* @__PURE__ */ new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
} catch {
	blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
	const { blockQuote, commentString, lineWidth } = ctx.options;
	if (!blockQuote || /\n[\t ]+$/.test(value)) return quotedString(value, ctx);
	const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
	const literal =
		blockQuote === "literal"
			? true
			: blockQuote === "folded" || type === Scalar.BLOCK_FOLDED
				? false
				: type === Scalar.BLOCK_LITERAL
					? true
					: !lineLengthOverLimit(value, lineWidth, indent.length);
	if (!value) return literal ? "|\n" : ">\n";
	let chomp;
	let endStart;
	for (endStart = value.length; endStart > 0; --endStart) {
		const ch = value[endStart - 1];
		if (ch !== "\n" && ch !== "	" && ch !== " ") break;
	}
	let end = value.substring(endStart);
	const endNlPos = end.indexOf("\n");
	if (endNlPos === -1) chomp = "-";
	else if (value === end || endNlPos !== end.length - 1) {
		chomp = "+";
		if (onChompKeep) onChompKeep();
	} else chomp = "";
	if (end) {
		value = value.slice(0, -end.length);
		if (end[end.length - 1] === "\n") end = end.slice(0, -1);
		end = end.replace(blockEndNewlines, `$&${indent}`);
	}
	let startWithSpace = false;
	let startEnd;
	let startNlPos = -1;
	for (startEnd = 0; startEnd < value.length; ++startEnd) {
		const ch = value[startEnd];
		if (ch === " ") startWithSpace = true;
		else if (ch === "\n") startNlPos = startEnd;
		else break;
	}
	let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
	if (start) {
		value = value.substring(start.length);
		start = start.replace(/\n+/g, `$&${indent}`);
	}
	let header = (startWithSpace ? (indent ? "2" : "1") : "") + chomp;
	if (comment) {
		header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
		if (onComment) onComment();
	}
	if (!literal) {
		const foldedValue = value
			.replace(/\n+/g, "\n$&")
			.replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2")
			.replace(/\n+/g, `$&${indent}`);
		let literalFallback = false;
		const foldOptions = getFoldOptions(ctx, true);
		if (blockQuote !== "folded" && type !== Scalar.BLOCK_FOLDED)
			foldOptions.onOverflow = () => {
				literalFallback = true;
			};
		const body = foldFlowLines(`${start}${foldedValue}${end}`, indent, FOLD_BLOCK, foldOptions);
		if (!literalFallback) return `>${header}\n${indent}${body}`;
	}
	value = value.replace(/\n+/g, `$&${indent}`);
	return `|${header}\n${indent}${start}${value}${end}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
	const { type, value } = item;
	const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
	if ((implicitKey && value.includes("\n")) || (inFlow && /[[\]{},]/.test(value))) return quotedString(value, ctx);
	if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value))
		return implicitKey || inFlow || !value.includes("\n")
			? quotedString(value, ctx)
			: blockString(item, ctx, onComment, onChompKeep);
	if (!implicitKey && !inFlow && type !== Scalar.PLAIN && value.includes("\n"))
		return blockString(item, ctx, onComment, onChompKeep);
	if (containsDocumentMarker(value)) {
		if (indent === "") {
			ctx.forceBlockIndent = true;
			return blockString(item, ctx, onComment, onChompKeep);
		} else if (implicitKey && indent === indentStep) return quotedString(value, ctx);
	}
	const str = value.replace(/\n+/g, `$&\n${indent}`);
	if (actualString) {
		const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
		const { compat, tags } = ctx.doc.schema;
		if (tags.some(test) || compat?.some(test)) return quotedString(value, ctx);
	}
	return implicitKey ? str : foldFlowLines(str, indent, FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString(item, ctx, onComment, onChompKeep) {
	const { implicitKey, inFlow } = ctx;
	const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
	let { type } = item;
	if (type !== Scalar.QUOTE_DOUBLE) {
		if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value)) type = Scalar.QUOTE_DOUBLE;
	}
	const _stringify = (_type) => {
		switch (_type) {
			case Scalar.BLOCK_FOLDED:
			case Scalar.BLOCK_LITERAL:
				return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
			case Scalar.QUOTE_DOUBLE:
				return doubleQuotedString(ss.value, ctx);
			case Scalar.QUOTE_SINGLE:
				return singleQuotedString(ss.value, ctx);
			case Scalar.PLAIN:
				return plainString(ss, ctx, onComment, onChompKeep);
			default:
				return null;
		}
	};
	let res = _stringify(type);
	if (res === null) {
		const { defaultKeyType, defaultStringType } = ctx.options;
		const t = (implicitKey && defaultKeyType) || defaultStringType;
		res = _stringify(t);
		if (res === null) throw new Error(`Unsupported default string type ${t}`);
	}
	return res;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringify.js
function createStringifyContext(doc, options) {
	const opt = Object.assign(
		{
			blockQuote: true,
			commentString: stringifyComment,
			defaultKeyType: null,
			defaultStringType: "PLAIN",
			directives: null,
			doubleQuotedAsJSON: false,
			doubleQuotedMinMultiLineLength: 40,
			falseStr: "false",
			flowCollectionPadding: true,
			indentSeq: true,
			lineWidth: 80,
			minContentWidth: 20,
			nullStr: "null",
			simpleKeys: false,
			singleQuote: null,
			trailingComma: false,
			trueStr: "true",
			verifyAliasOrder: true,
		},
		doc.schema.toStringOptions,
		options,
	);
	let inFlow;
	switch (opt.collectionStyle) {
		case "block":
			inFlow = false;
			break;
		case "flow":
			inFlow = true;
			break;
		default:
			inFlow = null;
	}
	return {
		anchors: /* @__PURE__ */ new Set(),
		doc,
		flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
		indent: "",
		indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
		inFlow,
		options: opt,
	};
}
function getTagObject(tags, item) {
	if (item.tag) {
		const match = tags.filter((t) => t.tag === item.tag);
		if (match.length > 0) return match.find((t) => t.format === item.format) ?? match[0];
	}
	let tagObj = void 0;
	let obj;
	if (isScalar(item)) {
		obj = item.value;
		let match = tags.filter((t) => t.identify?.(obj));
		if (match.length > 1) {
			const testMatch = match.filter((t) => t.test);
			if (testMatch.length > 0) match = testMatch;
		}
		tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
	} else {
		obj = item;
		tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
	}
	if (!tagObj) {
		const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
		throw new Error(`Tag not resolved for ${name} value`);
	}
	return tagObj;
}
function stringifyProps(node, tagObj, { anchors, doc }) {
	if (!doc.directives) return "";
	const props = [];
	const anchor = (isScalar(node) || isCollection(node)) && node.anchor;
	if (anchor && anchorIsValid(anchor)) {
		anchors.add(anchor);
		props.push(`&${anchor}`);
	}
	const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
	if (tag) props.push(doc.directives.tagString(tag));
	return props.join(" ");
}
function stringify(item, ctx, onComment, onChompKeep) {
	if (isPair(item)) return item.toString(ctx, onComment, onChompKeep);
	if (isAlias(item)) {
		if (ctx.doc.directives) return item.toString(ctx);
		if (ctx.resolvedAliases?.has(item)) throw new TypeError(`Cannot stringify circular structure without alias nodes`);
		else {
			if (ctx.resolvedAliases) ctx.resolvedAliases.add(item);
			else ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
			item = item.resolve(ctx.doc);
		}
	}
	let tagObj = void 0;
	const node = isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => (tagObj = o) });
	tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
	const props = stringifyProps(node, tagObj, ctx);
	if (props.length > 0) ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
	const str =
		typeof tagObj.stringify === "function"
			? tagObj.stringify(node, ctx, onComment, onChompKeep)
			: isScalar(node)
				? stringifyString(node, ctx, onComment, onChompKeep)
				: node.toString(ctx, onComment, onChompKeep);
	if (!props) return str;
	return isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}\n${ctx.indent}${str}`;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringifyPair.js
function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
	const {
		allNullValues,
		doc,
		indent,
		indentStep,
		options: { commentString, indentSeq, simpleKeys },
	} = ctx;
	let keyComment = (isNode(key) && key.comment) || null;
	if (simpleKeys) {
		if (keyComment) throw new Error("With simple keys, key nodes cannot have comments");
		if (isCollection(key) || (!isNode(key) && typeof key === "object"))
			throw new Error("With simple keys, collection cannot be used as a key value");
	}
	let explicitKey =
		!simpleKeys &&
		(!key ||
			(keyComment && value == null && !ctx.inFlow) ||
			isCollection(key) ||
			(isScalar(key)
				? key.type === Scalar.BLOCK_FOLDED || key.type === Scalar.BLOCK_LITERAL
				: typeof key === "object"));
	ctx = Object.assign({}, ctx, {
		allNullValues: false,
		implicitKey: !explicitKey && (simpleKeys || !allNullValues),
		indent: indent + indentStep,
	});
	let keyCommentDone = false;
	let chompKeep = false;
	let str = stringify(
		key,
		ctx,
		() => (keyCommentDone = true),
		() => (chompKeep = true),
	);
	if (!explicitKey && !ctx.inFlow && str.length > 1024) {
		if (simpleKeys) throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
		explicitKey = true;
	}
	if (ctx.inFlow) {
		if (allNullValues || value == null) {
			if (keyCommentDone && onComment) onComment();
			return str === "" ? "?" : explicitKey ? `? ${str}` : str;
		}
	} else if ((allNullValues && !simpleKeys) || (value == null && explicitKey)) {
		str = `? ${str}`;
		if (keyComment && !keyCommentDone) str += lineComment(str, ctx.indent, commentString(keyComment));
		else if (chompKeep && onChompKeep) onChompKeep();
		return str;
	}
	if (keyCommentDone) keyComment = null;
	if (explicitKey) {
		if (keyComment) str += lineComment(str, ctx.indent, commentString(keyComment));
		str = `? ${str}\n${indent}:`;
	} else {
		str = `${str}:`;
		if (keyComment) str += lineComment(str, ctx.indent, commentString(keyComment));
	}
	let vsb, vcb, valueComment;
	if (isNode(value)) {
		vsb = !!value.spaceBefore;
		vcb = value.commentBefore;
		valueComment = value.comment;
	} else {
		vsb = false;
		vcb = null;
		valueComment = null;
		if (value && typeof value === "object") value = doc.createNode(value);
	}
	ctx.implicitKey = false;
	if (!explicitKey && !keyComment && isScalar(value)) ctx.indentAtStart = str.length + 1;
	chompKeep = false;
	if (
		!indentSeq &&
		indentStep.length >= 2 &&
		!ctx.inFlow &&
		!explicitKey &&
		isSeq(value) &&
		!value.flow &&
		!value.tag &&
		!value.anchor
	)
		ctx.indent = ctx.indent.substring(2);
	let valueCommentDone = false;
	const valueStr = stringify(
		value,
		ctx,
		() => (valueCommentDone = true),
		() => (chompKeep = true),
	);
	let ws = " ";
	if (keyComment || vsb || vcb) {
		ws = vsb ? "\n" : "";
		if (vcb) {
			const cs = commentString(vcb);
			ws += `\n${indentComment(cs, ctx.indent)}`;
		}
		if (valueStr === "" && !ctx.inFlow) {
			if (ws === "\n" && valueComment) ws = "\n\n";
		} else ws += `\n${ctx.indent}`;
	} else if (!explicitKey && isCollection(value)) {
		const vs0 = valueStr[0];
		const nl0 = valueStr.indexOf("\n");
		const hasNewline = nl0 !== -1;
		const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
		if (hasNewline || !flow) {
			let hasPropsLine = false;
			if (hasNewline && (vs0 === "&" || vs0 === "!")) {
				let sp0 = valueStr.indexOf(" ");
				if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") sp0 = valueStr.indexOf(" ", sp0 + 1);
				if (sp0 === -1 || nl0 < sp0) hasPropsLine = true;
			}
			if (!hasPropsLine) ws = `\n${ctx.indent}`;
		}
	} else if (valueStr === "" || valueStr[0] === "\n") ws = "";
	str += ws + valueStr;
	if (ctx.inFlow) {
		if (valueCommentDone && onComment) onComment();
	} else if (valueComment && !valueCommentDone) str += lineComment(str, ctx.indent, commentString(valueComment));
	else if (chompKeep && onChompKeep) onChompKeep();
	return str;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/log.js
function warn(logLevel, warning) {
	if (logLevel === "debug" || logLevel === "warn") console.warn(warning);
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/merge.js
var MERGE_KEY = "<<";
var merge = {
	identify: (value) => value === MERGE_KEY || (typeof value === "symbol" && value.description === MERGE_KEY),
	default: "key",
	tag: "tag:yaml.org,2002:merge",
	test: /^<<$/,
	resolve: () => Object.assign(new Scalar(Symbol(MERGE_KEY)), { addToJSMap: addMergeToJSMap }),
	stringify: () => MERGE_KEY,
};
var isMergeKey = (ctx, key) =>
	(merge.identify(key) || (isScalar(key) && (!key.type || key.type === Scalar.PLAIN) && merge.identify(key.value))) &&
	ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
function addMergeToJSMap(ctx, map, value) {
	const source = resolveAliasValue(ctx, value);
	if (isSeq(source)) for (const it of source.items) mergeValue(ctx, map, it);
	else if (Array.isArray(source)) for (const it of source) mergeValue(ctx, map, it);
	else mergeValue(ctx, map, source);
}
function mergeValue(ctx, map, value) {
	const source = resolveAliasValue(ctx, value);
	if (!isMap(source)) throw new Error("Merge sources must be maps or map aliases");
	const srcMap = source.toJSON(null, ctx, Map);
	for (const [key, value] of srcMap)
		if (map instanceof Map) {
			if (!map.has(key)) map.set(key, value);
		} else if (map instanceof Set) map.add(key);
		else if (!Object.prototype.hasOwnProperty.call(map, key))
			Object.defineProperty(map, key, {
				value,
				writable: true,
				enumerable: true,
				configurable: true,
			});
	return map;
}
function resolveAliasValue(ctx, value) {
	return ctx && isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/addPairToJSMap.js
function addPairToJSMap(ctx, map, { key, value }) {
	if (isNode(key) && key.addToJSMap) key.addToJSMap(ctx, map, value);
	else if (isMergeKey(ctx, key)) addMergeToJSMap(ctx, map, value);
	else {
		const jsKey = toJS(key, "", ctx);
		if (map instanceof Map) map.set(jsKey, toJS(value, jsKey, ctx));
		else if (map instanceof Set) map.add(jsKey);
		else {
			const stringKey = stringifyKey(key, jsKey, ctx);
			const jsValue = toJS(value, stringKey, ctx);
			if (stringKey in map)
				Object.defineProperty(map, stringKey, {
					value: jsValue,
					writable: true,
					enumerable: true,
					configurable: true,
				});
			else map[stringKey] = jsValue;
		}
	}
	return map;
}
function stringifyKey(key, jsKey, ctx) {
	if (jsKey === null) return "";
	if (typeof jsKey !== "object") return String(jsKey);
	if (isNode(key) && ctx?.doc) {
		const strCtx = createStringifyContext(ctx.doc, {});
		strCtx.anchors = /* @__PURE__ */ new Set();
		for (const node of ctx.anchors.keys()) strCtx.anchors.add(node.anchor);
		strCtx.inFlow = true;
		strCtx.inStringifyKey = true;
		const strKey = key.toString(strCtx);
		if (!ctx.mapKeyWarned) {
			let jsonStr = JSON.stringify(strKey);
			if (jsonStr.length > 40) jsonStr = jsonStr.substring(0, 36) + '..."';
			warn(
				ctx.doc.options.logLevel,
				`Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`,
			);
			ctx.mapKeyWarned = true;
		}
		return strKey;
	}
	return JSON.stringify(jsKey);
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/Pair.js
function createPair(key, value, ctx) {
	return new Pair(createNode(key, void 0, ctx), createNode(value, void 0, ctx));
}
var Pair = class Pair {
	constructor(key, value = null) {
		Object.defineProperty(this, NODE_TYPE, { value: PAIR });
		this.key = key;
		this.value = value;
	}
	clone(schema) {
		let { key, value } = this;
		if (isNode(key)) key = key.clone(schema);
		if (isNode(value)) value = value.clone(schema);
		return new Pair(key, value);
	}
	toJSON(_, ctx) {
		return addPairToJSMap(ctx, ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {}, this);
	}
	toString(ctx, onComment, onChompKeep) {
		return ctx?.doc ? stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringifyCollection.js
function stringifyCollection(collection, ctx, options) {
	return ((ctx.inFlow ?? collection.flow) ? stringifyFlowCollection : stringifyBlockCollection)(
		collection,
		ctx,
		options,
	);
}
function stringifyBlockCollection(
	{ comment, items },
	ctx,
	{ blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment },
) {
	const {
		indent,
		options: { commentString },
	} = ctx;
	const itemCtx = Object.assign({}, ctx, {
		indent: itemIndent,
		type: null,
	});
	let chompKeep = false;
	const lines = [];
	for (let i = 0; i < items.length; ++i) {
		const item = items[i];
		let comment = null;
		if (isNode(item)) {
			if (!chompKeep && item.spaceBefore) lines.push("");
			addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
			if (item.comment) comment = item.comment;
		} else if (isPair(item)) {
			const ik = isNode(item.key) ? item.key : null;
			if (ik) {
				if (!chompKeep && ik.spaceBefore) lines.push("");
				addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
			}
		}
		chompKeep = false;
		let str = stringify(
			item,
			itemCtx,
			() => (comment = null),
			() => (chompKeep = true),
		);
		if (comment) str += lineComment(str, itemIndent, commentString(comment));
		if (chompKeep && comment) chompKeep = false;
		lines.push(blockItemPrefix + str);
	}
	let str;
	if (lines.length === 0) str = flowChars.start + flowChars.end;
	else {
		str = lines[0];
		for (let i = 1; i < lines.length; ++i) {
			const line = lines[i];
			str += line ? `\n${indent}${line}` : "\n";
		}
	}
	if (comment) {
		str += "\n" + indentComment(commentString(comment), indent);
		if (onComment) onComment();
	} else if (chompKeep && onChompKeep) onChompKeep();
	return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
	const {
		indent,
		indentStep,
		flowCollectionPadding: fcPadding,
		options: { commentString },
	} = ctx;
	itemIndent += indentStep;
	const itemCtx = Object.assign({}, ctx, {
		indent: itemIndent,
		inFlow: true,
		type: null,
	});
	let reqNewline = false;
	let linesAtValue = 0;
	const lines = [];
	for (let i = 0; i < items.length; ++i) {
		const item = items[i];
		let comment = null;
		if (isNode(item)) {
			if (item.spaceBefore) lines.push("");
			addCommentBefore(ctx, lines, item.commentBefore, false);
			if (item.comment) comment = item.comment;
		} else if (isPair(item)) {
			const ik = isNode(item.key) ? item.key : null;
			if (ik) {
				if (ik.spaceBefore) lines.push("");
				addCommentBefore(ctx, lines, ik.commentBefore, false);
				if (ik.comment) reqNewline = true;
			}
			const iv = isNode(item.value) ? item.value : null;
			if (iv) {
				if (iv.comment) comment = iv.comment;
				if (iv.commentBefore) reqNewline = true;
			} else if (item.value == null && ik?.comment) comment = ik.comment;
		}
		if (comment) reqNewline = true;
		let str = stringify(item, itemCtx, () => (comment = null));
		reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
		if (i < items.length - 1) str += ",";
		else if (ctx.options.trailingComma) {
			if (ctx.options.lineWidth > 0)
				reqNewline ||
					(reqNewline =
						lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
			if (reqNewline) str += ",";
		}
		if (comment) str += lineComment(str, itemIndent, commentString(comment));
		lines.push(str);
		linesAtValue = lines.length;
	}
	const { start, end } = flowChars;
	if (lines.length === 0) return start + end;
	else {
		if (!reqNewline) {
			const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
			reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
		}
		if (reqNewline) {
			let str = start;
			for (const line of lines) str += line ? `\n${indentStep}${indent}${line}` : "\n";
			return `${str}\n${indent}${end}`;
		} else return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
	}
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
	if (comment && chompKeep) comment = comment.replace(/^\n+/, "");
	if (comment) {
		const ic = indentComment(commentString(comment), indent);
		lines.push(ic.trimStart());
	}
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/YAMLMap.js
function findPair(items, key) {
	const k = isScalar(key) ? key.value : key;
	for (const it of items)
		if (isPair(it)) {
			if (it.key === key || it.key === k) return it;
			if (isScalar(it.key) && it.key.value === k) return it;
		}
}
var YAMLMap = class extends Collection {
	static get tagName() {
		return "tag:yaml.org,2002:map";
	}
	constructor(schema) {
		super(MAP, schema);
		this.items = [];
	}
	/**
	 * A generic collection parsing method that can be extended
	 * to other node classes that inherit from YAMLMap
	 */
	static from(schema, obj, ctx) {
		const { keepUndefined, replacer } = ctx;
		const map = new this(schema);
		const add = (key, value) => {
			if (typeof replacer === "function") value = replacer.call(obj, key, value);
			else if (Array.isArray(replacer) && !replacer.includes(key)) return;
			if (value !== void 0 || keepUndefined) map.items.push(createPair(key, value, ctx));
		};
		if (obj instanceof Map) for (const [key, value] of obj) add(key, value);
		else if (obj && typeof obj === "object") for (const key of Object.keys(obj)) add(key, obj[key]);
		if (typeof schema.sortMapEntries === "function") map.items.sort(schema.sortMapEntries);
		return map;
	}
	/**
	 * Adds a value to the collection.
	 *
	 * @param overwrite - If not set `true`, using a key that is already in the
	 *   collection will throw. Otherwise, overwrites the previous value.
	 */
	add(pair, overwrite) {
		let _pair;
		if (isPair(pair)) _pair = pair;
		else if (!pair || typeof pair !== "object" || !("key" in pair)) _pair = new Pair(pair, pair?.value);
		else _pair = new Pair(pair.key, pair.value);
		const prev = findPair(this.items, _pair.key);
		const sortEntries = this.schema?.sortMapEntries;
		if (prev) {
			if (!overwrite) throw new Error(`Key ${_pair.key} already set`);
			if (isScalar(prev.value) && isScalarValue(_pair.value)) prev.value.value = _pair.value;
			else prev.value = _pair.value;
		} else if (sortEntries) {
			const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
			if (i === -1) this.items.push(_pair);
			else this.items.splice(i, 0, _pair);
		} else this.items.push(_pair);
	}
	delete(key) {
		const it = findPair(this.items, key);
		if (!it) return false;
		return this.items.splice(this.items.indexOf(it), 1).length > 0;
	}
	get(key, keepScalar) {
		const node = findPair(this.items, key)?.value;
		return (!keepScalar && isScalar(node) ? node.value : node) ?? void 0;
	}
	has(key) {
		return !!findPair(this.items, key);
	}
	set(key, value) {
		this.add(new Pair(key, value), true);
	}
	/**
	 * @param ctx - Conversion context, originally set in Document#toJS()
	 * @param {Class} Type - If set, forces the returned collection type
	 * @returns Instance of Type, Map, or Object
	 */
	toJSON(_, ctx, Type) {
		const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
		if (ctx?.onCreate) ctx.onCreate(map);
		for (const item of this.items) addPairToJSMap(ctx, map, item);
		return map;
	}
	toString(ctx, onComment, onChompKeep) {
		if (!ctx) return JSON.stringify(this);
		for (const item of this.items)
			if (!isPair(item)) throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
		if (!ctx.allNullValues && this.hasAllNullValues(false)) ctx = Object.assign({}, ctx, { allNullValues: true });
		return stringifyCollection(this, ctx, {
			blockItemPrefix: "",
			flowChars: {
				start: "{",
				end: "}",
			},
			itemIndent: ctx.indent || "",
			onChompKeep,
			onComment,
		});
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/common/map.js
var map = {
	collection: "map",
	default: true,
	nodeClass: YAMLMap,
	tag: "tag:yaml.org,2002:map",
	resolve(map, onError) {
		if (!isMap(map)) onError("Expected a mapping for this tag");
		return map;
	},
	createNode: (schema, obj, ctx) => YAMLMap.from(schema, obj, ctx),
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/nodes/YAMLSeq.js
var YAMLSeq = class extends Collection {
	static get tagName() {
		return "tag:yaml.org,2002:seq";
	}
	constructor(schema) {
		super(SEQ, schema);
		this.items = [];
	}
	add(value) {
		this.items.push(value);
	}
	/**
	 * Removes a value from the collection.
	 *
	 * `key` must contain a representation of an integer for this to succeed.
	 * It may be wrapped in a `Scalar`.
	 *
	 * @returns `true` if the item was found and removed.
	 */
	delete(key) {
		const idx = asItemIndex(key);
		if (typeof idx !== "number") return false;
		return this.items.splice(idx, 1).length > 0;
	}
	get(key, keepScalar) {
		const idx = asItemIndex(key);
		if (typeof idx !== "number") return void 0;
		const it = this.items[idx];
		return !keepScalar && isScalar(it) ? it.value : it;
	}
	/**
	 * Checks if the collection includes a value with the key `key`.
	 *
	 * `key` must contain a representation of an integer for this to succeed.
	 * It may be wrapped in a `Scalar`.
	 */
	has(key) {
		const idx = asItemIndex(key);
		return typeof idx === "number" && idx < this.items.length;
	}
	/**
	 * Sets a value in this collection. For `!!set`, `value` needs to be a
	 * boolean to add/remove the item from the set.
	 *
	 * If `key` does not contain a representation of an integer, this will throw.
	 * It may be wrapped in a `Scalar`.
	 */
	set(key, value) {
		const idx = asItemIndex(key);
		if (typeof idx !== "number") throw new Error(`Expected a valid index, not ${key}.`);
		const prev = this.items[idx];
		if (isScalar(prev) && isScalarValue(value)) prev.value = value;
		else this.items[idx] = value;
	}
	toJSON(_, ctx) {
		const seq = [];
		if (ctx?.onCreate) ctx.onCreate(seq);
		let i = 0;
		for (const item of this.items) seq.push(toJS(item, String(i++), ctx));
		return seq;
	}
	toString(ctx, onComment, onChompKeep) {
		if (!ctx) return JSON.stringify(this);
		return stringifyCollection(this, ctx, {
			blockItemPrefix: "- ",
			flowChars: {
				start: "[",
				end: "]",
			},
			itemIndent: (ctx.indent || "") + "  ",
			onChompKeep,
			onComment,
		});
	}
	static from(schema, obj, ctx) {
		const { replacer } = ctx;
		const seq = new this(schema);
		if (obj && Symbol.iterator in Object(obj)) {
			let i = 0;
			for (let it of obj) {
				if (typeof replacer === "function") {
					const key = obj instanceof Set ? it : String(i++);
					it = replacer.call(obj, key, it);
				}
				seq.items.push(createNode(it, void 0, ctx));
			}
		}
		return seq;
	}
};
function asItemIndex(key) {
	let idx = isScalar(key) ? key.value : key;
	if (idx && typeof idx === "string") idx = Number(idx);
	return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/common/seq.js
var seq = {
	collection: "seq",
	default: true,
	nodeClass: YAMLSeq,
	tag: "tag:yaml.org,2002:seq",
	resolve(seq, onError) {
		if (!isSeq(seq)) onError("Expected a sequence for this tag");
		return seq;
	},
	createNode: (schema, obj, ctx) => YAMLSeq.from(schema, obj, ctx),
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/common/string.js
var string = {
	identify: (value) => typeof value === "string",
	default: true,
	tag: "tag:yaml.org,2002:str",
	resolve: (str) => str,
	stringify(item, ctx, onComment, onChompKeep) {
		ctx = Object.assign({ actualString: true }, ctx);
		return stringifyString(item, ctx, onComment, onChompKeep);
	},
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/common/null.js
var nullTag = {
	identify: (value) => value == null,
	createNode: () => new Scalar(null),
	default: true,
	tag: "tag:yaml.org,2002:null",
	test: /^(?:~|[Nn]ull|NULL)?$/,
	resolve: () => new Scalar(null),
	stringify: ({ source }, ctx) =>
		typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr,
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/core/bool.js
var boolTag = {
	identify: (value) => typeof value === "boolean",
	default: true,
	tag: "tag:yaml.org,2002:bool",
	test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
	resolve: (str) => new Scalar(str[0] === "t" || str[0] === "T"),
	stringify({ source, value }, ctx) {
		if (source && boolTag.test.test(source)) {
			if (value === (source[0] === "t" || source[0] === "T")) return source;
		}
		return value ? ctx.options.trueStr : ctx.options.falseStr;
	},
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringifyNumber.js
function stringifyNumber({ format, minFractionDigits, tag, value }) {
	if (typeof value === "bigint") return String(value);
	const num = typeof value === "number" ? value : Number(value);
	if (!isFinite(num)) return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
	let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
	if (
		!format &&
		minFractionDigits &&
		(!tag || tag === "tag:yaml.org,2002:float") &&
		/^-?\d/.test(n) &&
		!n.includes("e")
	) {
		let i = n.indexOf(".");
		if (i < 0) {
			i = n.length;
			n += ".";
		}
		let d = minFractionDigits - (n.length - i - 1);
		while (d-- > 0) n += "0";
	}
	return n;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/core/float.js
var floatNaN$1 = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
	resolve: (str) =>
		str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
	stringify: stringifyNumber,
};
var floatExp$1 = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	format: "EXP",
	test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
	resolve: (str) => parseFloat(str),
	stringify(node) {
		const num = Number(node.value);
		return isFinite(num) ? num.toExponential() : stringifyNumber(node);
	},
};
var float$1 = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
	resolve(str) {
		const node = new Scalar(parseFloat(str));
		const dot = str.indexOf(".");
		if (dot !== -1 && str[str.length - 1] === "0") node.minFractionDigits = str.length - dot - 1;
		return node;
	},
	stringify: stringifyNumber,
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/core/int.js
var intIdentify$2 = (value) => typeof value === "bigint" || Number.isInteger(value);
var intResolve$1 = (str, offset, radix, { intAsBigInt }) =>
	intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
function intStringify$1(node, radix, prefix) {
	const { value } = node;
	if (intIdentify$2(value) && value >= 0) return prefix + value.toString(radix);
	return stringifyNumber(node);
}
var intOct$1 = {
	identify: (value) => intIdentify$2(value) && value >= 0,
	default: true,
	tag: "tag:yaml.org,2002:int",
	format: "OCT",
	test: /^0o[0-7]+$/,
	resolve: (str, _onError, opt) => intResolve$1(str, 2, 8, opt),
	stringify: (node) => intStringify$1(node, 8, "0o"),
};
var int$1 = {
	identify: intIdentify$2,
	default: true,
	tag: "tag:yaml.org,2002:int",
	test: /^[-+]?[0-9]+$/,
	resolve: (str, _onError, opt) => intResolve$1(str, 0, 10, opt),
	stringify: stringifyNumber,
};
var intHex$1 = {
	identify: (value) => intIdentify$2(value) && value >= 0,
	default: true,
	tag: "tag:yaml.org,2002:int",
	format: "HEX",
	test: /^0x[0-9a-fA-F]+$/,
	resolve: (str, _onError, opt) => intResolve$1(str, 2, 16, opt),
	stringify: (node) => intStringify$1(node, 16, "0x"),
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/core/schema.js
var schema$2 = [map, seq, string, nullTag, boolTag, intOct$1, int$1, intHex$1, floatNaN$1, floatExp$1, float$1];
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/json/schema.js
function intIdentify$1(value) {
	return typeof value === "bigint" || Number.isInteger(value);
}
var stringifyJSON = ({ value }) => JSON.stringify(value);
var jsonScalars = [
	{
		identify: (value) => typeof value === "string",
		default: true,
		tag: "tag:yaml.org,2002:str",
		resolve: (str) => str,
		stringify: stringifyJSON,
	},
	{
		identify: (value) => value == null,
		createNode: () => new Scalar(null),
		default: true,
		tag: "tag:yaml.org,2002:null",
		test: /^null$/,
		resolve: () => null,
		stringify: stringifyJSON,
	},
	{
		identify: (value) => typeof value === "boolean",
		default: true,
		tag: "tag:yaml.org,2002:bool",
		test: /^true$|^false$/,
		resolve: (str) => str === "true",
		stringify: stringifyJSON,
	},
	{
		identify: intIdentify$1,
		default: true,
		tag: "tag:yaml.org,2002:int",
		test: /^-?(?:0|[1-9][0-9]*)$/,
		resolve: (str, _onError, { intAsBigInt }) => (intAsBigInt ? BigInt(str) : parseInt(str, 10)),
		stringify: ({ value }) => (intIdentify$1(value) ? value.toString() : JSON.stringify(value)),
	},
	{
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
		resolve: (str) => parseFloat(str),
		stringify: stringifyJSON,
	},
];
var schema$1 = [map, seq].concat(jsonScalars, {
	default: true,
	tag: "",
	test: /^/,
	resolve(str, onError) {
		onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
		return str;
	},
});
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/binary.js
var binary = {
	identify: (value) => value instanceof Uint8Array,
	default: false,
	tag: "tag:yaml.org,2002:binary",
	/**
	 * Returns a Buffer in node and an Uint8Array in browsers
	 *
	 * To use the resulting buffer as an image, you'll want to do something like:
	 *
	 *   const blob = new Blob([buffer], { type: 'image/jpeg' })
	 *   document.querySelector('#photo').src = URL.createObjectURL(blob)
	 */
	resolve(src, onError) {
		if (typeof atob === "function") {
			const str = atob(src.replace(/[\n\r]/g, ""));
			const buffer = new Uint8Array(str.length);
			for (let i = 0; i < str.length; ++i) buffer[i] = str.charCodeAt(i);
			return buffer;
		} else {
			onError("This environment does not support reading binary tags; either Buffer or atob is required");
			return src;
		}
	},
	stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
		if (!value) return "";
		const buf = value;
		let str;
		if (typeof btoa === "function") {
			let s = "";
			for (let i = 0; i < buf.length; ++i) s += String.fromCharCode(buf[i]);
			str = btoa(s);
		} else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
		type ?? (type = Scalar.BLOCK_LITERAL);
		if (type !== Scalar.QUOTE_DOUBLE) {
			const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
			const n = Math.ceil(str.length / lineWidth);
			const lines = new Array(n);
			for (let i = 0, o = 0; i < n; ++i, o += lineWidth) lines[i] = str.substr(o, lineWidth);
			str = lines.join(type === Scalar.BLOCK_LITERAL ? "\n" : " ");
		}
		return stringifyString(
			{
				comment,
				type,
				value: str,
			},
			ctx,
			onComment,
			onChompKeep,
		);
	},
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/pairs.js
function resolvePairs(seq, onError) {
	if (isSeq(seq))
		for (let i = 0; i < seq.items.length; ++i) {
			let item = seq.items[i];
			if (isPair(item)) continue;
			else if (isMap(item)) {
				if (item.items.length > 1) onError("Each pair must have its own sequence indicator");
				const pair = item.items[0] || new Pair(new Scalar(null));
				if (item.commentBefore)
					pair.key.commentBefore = pair.key.commentBefore
						? `${item.commentBefore}\n${pair.key.commentBefore}`
						: item.commentBefore;
				if (item.comment) {
					const cn = pair.value ?? pair.key;
					cn.comment = cn.comment ? `${item.comment}\n${cn.comment}` : item.comment;
				}
				item = pair;
			}
			seq.items[i] = isPair(item) ? item : new Pair(item);
		}
	else onError("Expected a sequence for this tag");
	return seq;
}
function createPairs(schema, iterable, ctx) {
	const { replacer } = ctx;
	const pairs = new YAMLSeq(schema);
	pairs.tag = "tag:yaml.org,2002:pairs";
	let i = 0;
	if (iterable && Symbol.iterator in Object(iterable))
		for (let it of iterable) {
			if (typeof replacer === "function") it = replacer.call(iterable, String(i++), it);
			let key, value;
			if (Array.isArray(it)) {
				if (it.length === 2) {
					key = it[0];
					value = it[1];
				} else throw new TypeError(`Expected [key, value] tuple: ${it}`);
			} else if (it && it instanceof Object) {
				const keys = Object.keys(it);
				if (keys.length === 1) {
					key = keys[0];
					value = it[key];
				} else throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
			} else key = it;
			pairs.items.push(createPair(key, value, ctx));
		}
	return pairs;
}
var pairs = {
	collection: "seq",
	default: false,
	tag: "tag:yaml.org,2002:pairs",
	resolve: resolvePairs,
	createNode: createPairs,
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/omap.js
var YAMLOMap = class YAMLOMap extends YAMLSeq {
	constructor() {
		super();
		this.add = YAMLMap.prototype.add.bind(this);
		this.delete = YAMLMap.prototype.delete.bind(this);
		this.get = YAMLMap.prototype.get.bind(this);
		this.has = YAMLMap.prototype.has.bind(this);
		this.set = YAMLMap.prototype.set.bind(this);
		this.tag = YAMLOMap.tag;
	}
	/**
	 * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
	 * but TypeScript won't allow widening the signature of a child method.
	 */
	toJSON(_, ctx) {
		if (!ctx) return super.toJSON(_);
		const map = /* @__PURE__ */ new Map();
		if (ctx?.onCreate) ctx.onCreate(map);
		for (const pair of this.items) {
			let key, value;
			if (isPair(pair)) {
				key = toJS(pair.key, "", ctx);
				value = toJS(pair.value, key, ctx);
			} else key = toJS(pair, "", ctx);
			if (map.has(key)) throw new Error("Ordered maps must not include duplicate keys");
			map.set(key, value);
		}
		return map;
	}
	static from(schema, iterable, ctx) {
		const pairs = createPairs(schema, iterable, ctx);
		const omap = new this();
		omap.items = pairs.items;
		return omap;
	}
};
YAMLOMap.tag = "tag:yaml.org,2002:omap";
var omap = {
	collection: "seq",
	identify: (value) => value instanceof Map,
	nodeClass: YAMLOMap,
	default: false,
	tag: "tag:yaml.org,2002:omap",
	resolve(seq, onError) {
		const pairs = resolvePairs(seq, onError);
		const seenKeys = [];
		for (const { key } of pairs.items)
			if (isScalar(key)) {
				if (seenKeys.includes(key.value)) onError(`Ordered maps must not include duplicate keys: ${key.value}`);
				else seenKeys.push(key.value);
			}
		return Object.assign(new YAMLOMap(), pairs);
	},
	createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx),
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/bool.js
function boolStringify({ value, source }, ctx) {
	if (source && (value ? trueTag : falseTag).test.test(source)) return source;
	return value ? ctx.options.trueStr : ctx.options.falseStr;
}
var trueTag = {
	identify: (value) => value === true,
	default: true,
	tag: "tag:yaml.org,2002:bool",
	test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
	resolve: () => new Scalar(true),
	stringify: boolStringify,
};
var falseTag = {
	identify: (value) => value === false,
	default: true,
	tag: "tag:yaml.org,2002:bool",
	test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
	resolve: () => new Scalar(false),
	stringify: boolStringify,
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/float.js
var floatNaN = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
	resolve: (str) =>
		str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
	stringify: stringifyNumber,
};
var floatExp = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	format: "EXP",
	test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
	resolve: (str) => parseFloat(str.replace(/_/g, "")),
	stringify(node) {
		const num = Number(node.value);
		return isFinite(num) ? num.toExponential() : stringifyNumber(node);
	},
};
var float = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
	resolve(str) {
		const node = new Scalar(parseFloat(str.replace(/_/g, "")));
		const dot = str.indexOf(".");
		if (dot !== -1) {
			const f = str.substring(dot + 1).replace(/_/g, "");
			if (f[f.length - 1] === "0") node.minFractionDigits = f.length;
		}
		return node;
	},
	stringify: stringifyNumber,
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/int.js
var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
	const sign = str[0];
	if (sign === "-" || sign === "+") offset += 1;
	str = str.substring(offset).replace(/_/g, "");
	if (intAsBigInt) {
		switch (radix) {
			case 2:
				str = `0b${str}`;
				break;
			case 8:
				str = `0o${str}`;
				break;
			case 16:
				str = `0x${str}`;
		}
		const n = BigInt(str);
		return sign === "-" ? BigInt(-1) * n : n;
	}
	const n = parseInt(str, radix);
	return sign === "-" ? -1 * n : n;
}
function intStringify(node, radix, prefix) {
	const { value } = node;
	if (intIdentify(value)) {
		const str = value.toString(radix);
		return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
	}
	return stringifyNumber(node);
}
var intBin = {
	identify: intIdentify,
	default: true,
	tag: "tag:yaml.org,2002:int",
	format: "BIN",
	test: /^[-+]?0b[0-1_]+$/,
	resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
	stringify: (node) => intStringify(node, 2, "0b"),
};
var intOct = {
	identify: intIdentify,
	default: true,
	tag: "tag:yaml.org,2002:int",
	format: "OCT",
	test: /^[-+]?0[0-7_]+$/,
	resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
	stringify: (node) => intStringify(node, 8, "0"),
};
var int = {
	identify: intIdentify,
	default: true,
	tag: "tag:yaml.org,2002:int",
	test: /^[-+]?[0-9][0-9_]*$/,
	resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
	stringify: stringifyNumber,
};
var intHex = {
	identify: intIdentify,
	default: true,
	tag: "tag:yaml.org,2002:int",
	format: "HEX",
	test: /^[-+]?0x[0-9a-fA-F_]+$/,
	resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
	stringify: (node) => intStringify(node, 16, "0x"),
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/set.js
var YAMLSet = class YAMLSet extends YAMLMap {
	constructor(schema) {
		super(schema);
		this.tag = YAMLSet.tag;
	}
	add(key) {
		let pair;
		if (isPair(key)) pair = key;
		else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
			pair = new Pair(key.key, null);
		else pair = new Pair(key, null);
		if (!findPair(this.items, pair.key)) this.items.push(pair);
	}
	/**
	 * If `keepPair` is `true`, returns the Pair matching `key`.
	 * Otherwise, returns the value of that Pair's key.
	 */
	get(key, keepPair) {
		const pair = findPair(this.items, key);
		return !keepPair && isPair(pair) ? (isScalar(pair.key) ? pair.key.value : pair.key) : pair;
	}
	set(key, value) {
		if (typeof value !== "boolean")
			throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
		const prev = findPair(this.items, key);
		if (prev && !value) this.items.splice(this.items.indexOf(prev), 1);
		else if (!prev && value) this.items.push(new Pair(key));
	}
	toJSON(_, ctx) {
		return super.toJSON(_, ctx, Set);
	}
	toString(ctx, onComment, onChompKeep) {
		if (!ctx) return JSON.stringify(this);
		if (this.hasAllNullValues(true))
			return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
		else throw new Error("Set items must all have null values");
	}
	static from(schema, iterable, ctx) {
		const { replacer } = ctx;
		const set = new this(schema);
		if (iterable && Symbol.iterator in Object(iterable))
			for (let value of iterable) {
				if (typeof replacer === "function") value = replacer.call(iterable, value, value);
				set.items.push(createPair(value, null, ctx));
			}
		return set;
	}
};
YAMLSet.tag = "tag:yaml.org,2002:set";
var set = {
	collection: "map",
	identify: (value) => value instanceof Set,
	nodeClass: YAMLSet,
	default: false,
	tag: "tag:yaml.org,2002:set",
	createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
	resolve(map, onError) {
		if (isMap(map)) {
			if (map.hasAllNullValues(true)) return Object.assign(new YAMLSet(), map);
			else onError("Set items must all have null values");
		} else onError("Expected a mapping for this tag");
		return map;
	},
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/timestamp.js
/** Internal types handle bigint as number, because TS can't figure it out. */
function parseSexagesimal(str, asBigInt) {
	const sign = str[0];
	const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
	const num = (n) => (asBigInt ? BigInt(n) : Number(n));
	const res = parts
		.replace(/_/g, "")
		.split(":")
		.reduce((res, p) => res * num(60) + num(p), num(0));
	return sign === "-" ? num(-1) * res : res;
}
/**
 * hhhh:mm:ss.sss
 *
 * Internal types handle bigint as number, because TS can't figure it out.
 */
function stringifySexagesimal(node) {
	let { value } = node;
	let num = (n) => n;
	if (typeof value === "bigint") num = (n) => BigInt(n);
	else if (isNaN(value) || !isFinite(value)) return stringifyNumber(node);
	let sign = "";
	if (value < 0) {
		sign = "-";
		value *= num(-1);
	}
	const _60 = num(60);
	const parts = [value % _60];
	if (value < 60) parts.unshift(0);
	else {
		value = (value - parts[0]) / _60;
		parts.unshift(value % _60);
		if (value >= 60) {
			value = (value - parts[0]) / _60;
			parts.unshift(value);
		}
	}
	return (
		sign +
		parts
			.map((n) => String(n).padStart(2, "0"))
			.join(":")
			.replace(/000000\d*$/, "")
	);
}
var intTime = {
	identify: (value) => typeof value === "bigint" || Number.isInteger(value),
	default: true,
	tag: "tag:yaml.org,2002:int",
	format: "TIME",
	test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
	resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
	stringify: stringifySexagesimal,
};
var floatTime = {
	identify: (value) => typeof value === "number",
	default: true,
	tag: "tag:yaml.org,2002:float",
	format: "TIME",
	test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
	resolve: (str) => parseSexagesimal(str, false),
	stringify: stringifySexagesimal,
};
var timestamp = {
	identify: (value) => value instanceof Date,
	default: true,
	tag: "tag:yaml.org,2002:timestamp",
	test: RegExp(
		"^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$",
	),
	resolve(str) {
		const match = str.match(timestamp.test);
		if (!match) throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
		const [, year, month, day, hour, minute, second] = match.map(Number);
		const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
		let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
		const tz = match[8];
		if (tz && tz !== "Z") {
			let d = parseSexagesimal(tz, false);
			if (Math.abs(d) < 30) d *= 60;
			date -= 6e4 * d;
		}
		return new Date(date);
	},
	stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? "",
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/yaml-1.1/schema.js
var schema = [
	map,
	seq,
	string,
	nullTag,
	trueTag,
	falseTag,
	intBin,
	intOct,
	int,
	intHex,
	floatNaN,
	floatExp,
	float,
	binary,
	merge,
	omap,
	pairs,
	set,
	intTime,
	floatTime,
	timestamp,
];
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/tags.js
var schemas = /* @__PURE__ */ new Map([
	["core", schema$2],
	["failsafe", [map, seq, string]],
	["json", schema$1],
	["yaml11", schema],
	["yaml-1.1", schema],
]);
var tagsByName = {
	binary,
	bool: boolTag,
	float: float$1,
	floatExp: floatExp$1,
	floatNaN: floatNaN$1,
	floatTime,
	int: int$1,
	intHex: intHex$1,
	intOct: intOct$1,
	intTime,
	map,
	merge,
	null: nullTag,
	omap,
	pairs,
	seq,
	set,
	timestamp,
};
var coreKnownTags = {
	"tag:yaml.org,2002:binary": binary,
	"tag:yaml.org,2002:merge": merge,
	"tag:yaml.org,2002:omap": omap,
	"tag:yaml.org,2002:pairs": pairs,
	"tag:yaml.org,2002:set": set,
	"tag:yaml.org,2002:timestamp": timestamp,
};
function getTags(customTags, schemaName, addMergeTag) {
	const schemaTags = schemas.get(schemaName);
	if (schemaTags && !customTags)
		return addMergeTag && !schemaTags.includes(merge) ? schemaTags.concat(merge) : schemaTags.slice();
	let tags = schemaTags;
	if (!tags) {
		if (Array.isArray(customTags)) tags = [];
		else {
			const keys = Array.from(schemas.keys())
				.filter((key) => key !== "yaml11")
				.map((key) => JSON.stringify(key))
				.join(", ");
			throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
		}
	}
	if (Array.isArray(customTags)) for (const tag of customTags) tags = tags.concat(tag);
	else if (typeof customTags === "function") tags = customTags(tags.slice());
	if (addMergeTag) tags = tags.concat(merge);
	return tags.reduce((tags, tag) => {
		const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
		if (!tagObj) {
			const tagName = JSON.stringify(tag);
			const keys = Object.keys(tagsByName)
				.map((key) => JSON.stringify(key))
				.join(", ");
			throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
		}
		if (!tags.includes(tagObj)) tags.push(tagObj);
		return tags;
	}, []);
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/schema/Schema.js
var sortMapEntriesByKey = (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
var Schema = class Schema {
	constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
		this.compat = Array.isArray(compat) ? getTags(compat, "compat") : compat ? getTags(null, compat) : null;
		this.name = (typeof schema === "string" && schema) || "core";
		this.knownTags = resolveKnownTags ? coreKnownTags : {};
		this.tags = getTags(customTags, this.name, merge);
		this.toStringOptions = toStringDefaults ?? null;
		Object.defineProperty(this, MAP, { value: map });
		Object.defineProperty(this, SCALAR$1, { value: string });
		Object.defineProperty(this, SEQ, { value: seq });
		this.sortMapEntries =
			typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
	}
	clone() {
		const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
		copy.tags = this.tags.slice();
		return copy;
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/stringify/stringifyDocument.js
function stringifyDocument(doc, options) {
	const lines = [];
	let hasDirectives = options.directives === true;
	if (options.directives !== false && doc.directives) {
		const dir = doc.directives.toString(doc);
		if (dir) {
			lines.push(dir);
			hasDirectives = true;
		} else if (doc.directives.docStart) hasDirectives = true;
	}
	if (hasDirectives) lines.push("---");
	const ctx = createStringifyContext(doc, options);
	const { commentString } = ctx.options;
	if (doc.commentBefore) {
		if (lines.length !== 1) lines.unshift("");
		const cs = commentString(doc.commentBefore);
		lines.unshift(indentComment(cs, ""));
	}
	let chompKeep = false;
	let contentComment = null;
	if (doc.contents) {
		if (isNode(doc.contents)) {
			if (doc.contents.spaceBefore && hasDirectives) lines.push("");
			if (doc.contents.commentBefore) {
				const cs = commentString(doc.contents.commentBefore);
				lines.push(indentComment(cs, ""));
			}
			ctx.forceBlockIndent = !!doc.comment;
			contentComment = doc.contents.comment;
		}
		const onChompKeep = contentComment ? void 0 : () => (chompKeep = true);
		let body = stringify(doc.contents, ctx, () => (contentComment = null), onChompKeep);
		if (contentComment) body += lineComment(body, "", commentString(contentComment));
		if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---")
			lines[lines.length - 1] = `--- ${body}`;
		else lines.push(body);
	} else lines.push(stringify(doc.contents, ctx));
	if (doc.directives?.docEnd) {
		if (doc.comment) {
			const cs = commentString(doc.comment);
			if (cs.includes("\n")) {
				lines.push("...");
				lines.push(indentComment(cs, ""));
			} else lines.push(`... ${cs}`);
		} else lines.push("...");
	} else {
		let dc = doc.comment;
		if (dc && chompKeep) dc = dc.replace(/^\n+/, "");
		if (dc) {
			if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "") lines.push("");
			lines.push(indentComment(commentString(dc), ""));
		}
	}
	return lines.join("\n") + "\n";
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/doc/Document.js
var Document = class Document {
	constructor(value, replacer, options) {
		/** A comment before this Document */
		this.commentBefore = null;
		/** A comment immediately after this Document */
		this.comment = null;
		/** Errors encountered during parsing. */
		this.errors = [];
		/** Warnings encountered during parsing. */
		this.warnings = [];
		Object.defineProperty(this, NODE_TYPE, { value: DOC });
		let _replacer = null;
		if (typeof replacer === "function" || Array.isArray(replacer)) _replacer = replacer;
		else if (options === void 0 && replacer) {
			options = replacer;
			replacer = void 0;
		}
		const opt = Object.assign(
			{
				intAsBigInt: false,
				keepSourceTokens: false,
				logLevel: "warn",
				prettyErrors: true,
				strict: true,
				stringKeys: false,
				uniqueKeys: true,
				version: "1.2",
			},
			options,
		);
		this.options = opt;
		let { version } = opt;
		if (options?._directives) {
			this.directives = options._directives.atDocument();
			if (this.directives.yaml.explicit) version = this.directives.yaml.version;
		} else this.directives = new Directives({ version });
		this.setSchema(version, options);
		this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
	}
	/**
	 * Create a deep copy of this Document and its contents.
	 *
	 * Custom Node values that inherit from `Object` still refer to their original instances.
	 */
	clone() {
		const copy = Object.create(Document.prototype, { [NODE_TYPE]: { value: DOC } });
		copy.commentBefore = this.commentBefore;
		copy.comment = this.comment;
		copy.errors = this.errors.slice();
		copy.warnings = this.warnings.slice();
		copy.options = Object.assign({}, this.options);
		if (this.directives) copy.directives = this.directives.clone();
		copy.schema = this.schema.clone();
		copy.contents = isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
		if (this.range) copy.range = this.range.slice();
		return copy;
	}
	/** Adds a value to the document. */
	add(value) {
		if (assertCollection(this.contents)) this.contents.add(value);
	}
	/** Adds a value to the document. */
	addIn(path, value) {
		if (assertCollection(this.contents)) this.contents.addIn(path, value);
	}
	/**
	 * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
	 *
	 * If `node` already has an anchor, `name` is ignored.
	 * Otherwise, the `node.anchor` value will be set to `name`,
	 * or if an anchor with that name is already present in the document,
	 * `name` will be used as a prefix for a new unique anchor.
	 * If `name` is undefined, the generated anchor will use 'a' as a prefix.
	 */
	createAlias(node, name) {
		if (!node.anchor) {
			const prev = anchorNames(this);
			node.anchor = !name || prev.has(name) ? findNewAnchor(name || "a", prev) : name;
		}
		return new Alias(node.anchor);
	}
	createNode(value, replacer, options) {
		let _replacer = void 0;
		if (typeof replacer === "function") {
			value = replacer.call({ "": value }, "", value);
			_replacer = replacer;
		} else if (Array.isArray(replacer)) {
			const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
			const asStr = replacer.filter(keyToStr).map(String);
			if (asStr.length > 0) replacer = replacer.concat(asStr);
			_replacer = replacer;
		} else if (options === void 0 && replacer) {
			options = replacer;
			replacer = void 0;
		}
		const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
		const { onAnchor, setAnchors, sourceObjects } = createNodeAnchors(this, anchorPrefix || "a");
		const ctx = {
			aliasDuplicateObjects: aliasDuplicateObjects ?? true,
			keepUndefined: keepUndefined ?? false,
			onAnchor,
			onTagObj,
			replacer: _replacer,
			schema: this.schema,
			sourceObjects,
		};
		const node = createNode(value, tag, ctx);
		if (flow && isCollection(node)) node.flow = true;
		setAnchors();
		return node;
	}
	/**
	 * Convert a key and a value into a `Pair` using the current schema,
	 * recursively wrapping all values as `Scalar` or `Collection` nodes.
	 */
	createPair(key, value, options = {}) {
		return new Pair(this.createNode(key, null, options), this.createNode(value, null, options));
	}
	/**
	 * Removes a value from the document.
	 * @returns `true` if the item was found and removed.
	 */
	delete(key) {
		return assertCollection(this.contents) ? this.contents.delete(key) : false;
	}
	/**
	 * Removes a value from the document.
	 * @returns `true` if the item was found and removed.
	 */
	deleteIn(path) {
		if (isEmptyPath(path)) {
			if (this.contents == null) return false;
			this.contents = null;
			return true;
		}
		return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
	}
	/**
	 * Returns item at `key`, or `undefined` if not found. By default unwraps
	 * scalar values from their surrounding node; to disable set `keepScalar` to
	 * `true` (collections are always returned intact).
	 */
	get(key, keepScalar) {
		return isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
	}
	/**
	 * Returns item at `path`, or `undefined` if not found. By default unwraps
	 * scalar values from their surrounding node; to disable set `keepScalar` to
	 * `true` (collections are always returned intact).
	 */
	getIn(path, keepScalar) {
		if (isEmptyPath(path)) return !keepScalar && isScalar(this.contents) ? this.contents.value : this.contents;
		return isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
	}
	/**
	 * Checks if the document includes a value with the key `key`.
	 */
	has(key) {
		return isCollection(this.contents) ? this.contents.has(key) : false;
	}
	/**
	 * Checks if the document includes a value at `path`.
	 */
	hasIn(path) {
		if (isEmptyPath(path)) return this.contents !== void 0;
		return isCollection(this.contents) ? this.contents.hasIn(path) : false;
	}
	/**
	 * Sets a value in this document. For `!!set`, `value` needs to be a
	 * boolean to add/remove the item from the set.
	 */
	set(key, value) {
		if (this.contents == null) this.contents = collectionFromPath(this.schema, [key], value);
		else if (assertCollection(this.contents)) this.contents.set(key, value);
	}
	/**
	 * Sets a value in this document. For `!!set`, `value` needs to be a
	 * boolean to add/remove the item from the set.
	 */
	setIn(path, value) {
		if (isEmptyPath(path)) this.contents = value;
		else if (this.contents == null) this.contents = collectionFromPath(this.schema, Array.from(path), value);
		else if (assertCollection(this.contents)) this.contents.setIn(path, value);
	}
	/**
	 * Change the YAML version and schema used by the document.
	 * A `null` version disables support for directives, explicit tags, anchors, and aliases.
	 * It also requires the `schema` option to be given as a `Schema` instance value.
	 *
	 * Overrides all previously set schema options.
	 */
	setSchema(version, options = {}) {
		if (typeof version === "number") version = String(version);
		let opt;
		switch (version) {
			case "1.1":
				if (this.directives) this.directives.yaml.version = "1.1";
				else this.directives = new Directives({ version: "1.1" });
				opt = {
					resolveKnownTags: false,
					schema: "yaml-1.1",
				};
				break;
			case "1.2":
			case "next":
				if (this.directives) this.directives.yaml.version = version;
				else this.directives = new Directives({ version });
				opt = {
					resolveKnownTags: true,
					schema: "core",
				};
				break;
			case null:
				if (this.directives) delete this.directives;
				opt = null;
				break;
			default: {
				const sv = JSON.stringify(version);
				throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
			}
		}
		if (options.schema instanceof Object) this.schema = options.schema;
		else if (opt) this.schema = new Schema(Object.assign(opt, options));
		else throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
	}
	toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
		const ctx = {
			anchors: /* @__PURE__ */ new Map(),
			doc: this,
			keep: !json,
			mapAsMap: mapAsMap === true,
			mapKeyWarned: false,
			maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100,
		};
		const res = toJS(this.contents, jsonArg ?? "", ctx);
		if (typeof onAnchor === "function") for (const { count, res } of ctx.anchors.values()) onAnchor(res, count);
		return typeof reviver === "function" ? applyReviver(reviver, { "": res }, "", res) : res;
	}
	/**
	 * A JSON representation of the document `contents`.
	 *
	 * @param jsonArg Used by `JSON.stringify` to indicate the array index or
	 *   property name.
	 */
	toJSON(jsonArg, onAnchor) {
		return this.toJS({
			json: true,
			jsonArg,
			mapAsMap: false,
			onAnchor,
		});
	}
	/** A YAML representation of the document. */
	toString(options = {}) {
		if (this.errors.length > 0) throw new Error("Document with errors cannot be stringified");
		if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
			const s = JSON.stringify(options.indent);
			throw new Error(`"indent" option must be a positive integer, not ${s}`);
		}
		return stringifyDocument(this, options);
	}
};
function assertCollection(contents) {
	if (isCollection(contents)) return true;
	throw new Error("Expected a YAML collection as document contents");
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/errors.js
var YAMLError = class extends Error {
	constructor(name, pos, code, message) {
		super();
		this.name = name;
		this.code = code;
		this.message = message;
		this.pos = pos;
	}
};
var YAMLParseError = class extends YAMLError {
	constructor(pos, code, message) {
		super("YAMLParseError", pos, code, message);
	}
};
var YAMLWarning = class extends YAMLError {
	constructor(pos, code, message) {
		super("YAMLWarning", pos, code, message);
	}
};
var prettifyError = (src, lc) => (error) => {
	if (error.pos[0] === -1) return;
	error.linePos = error.pos.map((pos) => lc.linePos(pos));
	const { line, col } = error.linePos[0];
	error.message += ` at line ${line}, column ${col}`;
	let ci = col - 1;
	let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
	if (ci >= 60 && lineStr.length > 80) {
		const trimStart = Math.min(ci - 39, lineStr.length - 79);
		lineStr = "…" + lineStr.substring(trimStart);
		ci -= trimStart - 1;
	}
	if (lineStr.length > 80) lineStr = lineStr.substring(0, 79) + "…";
	if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
		let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
		if (prev.length > 80) prev = prev.substring(0, 79) + "…\n";
		lineStr = prev + lineStr;
	}
	if (/[^ ]/.test(lineStr)) {
		let count = 1;
		const end = error.linePos[1];
		if (end?.line === line && end.col > col) count = Math.max(1, Math.min(end.col - col, 80 - ci));
		const pointer = " ".repeat(ci) + "^".repeat(count);
		error.message += `:\n\n${lineStr}\n${pointer}\n`;
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-props.js
function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
	let spaceBefore = false;
	let atNewline = startOnNewline;
	let hasSpace = startOnNewline;
	let comment = "";
	let commentSep = "";
	let hasNewline = false;
	let reqSpace = false;
	let tab = null;
	let anchor = null;
	let tag = null;
	let newlineAfterProp = null;
	let comma = null;
	let found = null;
	let start = null;
	for (const token of tokens) {
		if (reqSpace) {
			if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
				onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
			reqSpace = false;
		}
		if (tab) {
			if (atNewline && token.type !== "comment" && token.type !== "newline")
				onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
			tab = null;
		}
		switch (token.type) {
			case "space":
				if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	"))
					tab = token;
				hasSpace = true;
				break;
			case "comment": {
				if (!hasSpace)
					onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
				const cb = token.source.substring(1) || " ";
				if (!comment) comment = cb;
				else comment += commentSep + cb;
				commentSep = "";
				atNewline = false;
				break;
			}
			case "newline":
				if (atNewline) {
					if (comment) comment += token.source;
					else if (!found || indicator !== "seq-item-ind") spaceBefore = true;
				} else commentSep += token.source;
				atNewline = true;
				hasNewline = true;
				if (anchor || tag) newlineAfterProp = token;
				hasSpace = true;
				break;
			case "anchor":
				if (anchor) onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
				if (token.source.endsWith(":"))
					onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
				anchor = token;
				start ?? (start = token.offset);
				atNewline = false;
				hasSpace = false;
				reqSpace = true;
				break;
			case "tag":
				if (tag) onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
				tag = token;
				start ?? (start = token.offset);
				atNewline = false;
				hasSpace = false;
				reqSpace = true;
				break;
			case indicator:
				if (anchor || tag)
					onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
				if (found) onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
				found = token;
				atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
				hasSpace = false;
				break;
			case "comma":
				if (flow) {
					if (comma) onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
					comma = token;
					atNewline = false;
					hasSpace = false;
					break;
				}
			default:
				onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
				atNewline = false;
				hasSpace = false;
		}
	}
	const last = tokens[tokens.length - 1];
	const end = last ? last.offset + last.source.length : offset;
	if (
		reqSpace &&
		next &&
		next.type !== "space" &&
		next.type !== "newline" &&
		next.type !== "comma" &&
		(next.type !== "scalar" || next.source !== "")
	)
		onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
	if (tab && ((atNewline && tab.indent <= parentIndent) || next?.type === "block-map" || next?.type === "block-seq"))
		onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
	return {
		comma,
		found,
		spaceBefore,
		comment,
		hasNewline,
		anchor,
		tag,
		newlineAfterProp,
		end,
		start: start ?? end,
	};
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/util-contains-newline.js
function containsNewline(key) {
	if (!key) return null;
	switch (key.type) {
		case "alias":
		case "scalar":
		case "double-quoted-scalar":
		case "single-quoted-scalar":
			if (key.source.includes("\n")) return true;
			if (key.end) {
				for (const st of key.end) if (st.type === "newline") return true;
			}
			return false;
		case "flow-collection":
			for (const it of key.items) {
				for (const st of it.start) if (st.type === "newline") return true;
				if (it.sep) {
					for (const st of it.sep) if (st.type === "newline") return true;
				}
				if (containsNewline(it.key) || containsNewline(it.value)) return true;
			}
			return false;
		default:
			return true;
	}
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/util-flow-indent-check.js
function flowIndentCheck(indent, fc, onError) {
	if (fc?.type === "flow-collection") {
		const end = fc.end[0];
		if (end.indent === indent && (end.source === "]" || end.source === "}") && containsNewline(fc))
			onError(end, "BAD_INDENT", "Flow end indicator should be more indented than parent", true);
	}
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/util-map-includes.js
function mapIncludes(ctx, items, search) {
	const { uniqueKeys } = ctx.options;
	if (uniqueKeys === false) return false;
	const isEqual =
		typeof uniqueKeys === "function"
			? uniqueKeys
			: (a, b) => a === b || (isScalar(a) && isScalar(b) && a.value === b.value);
	return items.some((pair) => isEqual(pair.key, search));
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-block-map.js
var startColMsg = "All mapping items must start at the same column";
function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
	const map = new (tag?.nodeClass ?? YAMLMap)(ctx.schema);
	if (ctx.atRoot) ctx.atRoot = false;
	let offset = bm.offset;
	let commentEnd = null;
	for (const collItem of bm.items) {
		const { start, key, sep, value } = collItem;
		const keyProps = resolveProps(start, {
			indicator: "explicit-key-ind",
			next: key ?? sep?.[0],
			offset,
			onError,
			parentIndent: bm.indent,
			startOnNewline: true,
		});
		const implicitKey = !keyProps.found;
		if (implicitKey) {
			if (key) {
				if (key.type === "block-seq")
					onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
				else if ("indent" in key && key.indent !== bm.indent) onError(offset, "BAD_INDENT", startColMsg);
			}
			if (!keyProps.anchor && !keyProps.tag && !sep) {
				commentEnd = keyProps.end;
				if (keyProps.comment) {
					if (map.comment) map.comment += "\n" + keyProps.comment;
					else map.comment = keyProps.comment;
				}
				continue;
			}
			if (keyProps.newlineAfterProp || containsNewline(key))
				onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
		} else if (keyProps.found?.indent !== bm.indent) onError(offset, "BAD_INDENT", startColMsg);
		ctx.atKey = true;
		const keyStart = keyProps.end;
		const keyNode = key
			? composeNode(ctx, key, keyProps, onError)
			: composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
		if (ctx.schema.compat) flowIndentCheck(bm.indent, key, onError);
		ctx.atKey = false;
		if (mapIncludes(ctx, map.items, keyNode)) onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
		const valueProps = resolveProps(sep ?? [], {
			indicator: "map-value-ind",
			next: value,
			offset: keyNode.range[2],
			onError,
			parentIndent: bm.indent,
			startOnNewline: !key || key.type === "block-scalar",
		});
		offset = valueProps.end;
		if (valueProps.found) {
			if (implicitKey) {
				if (value?.type === "block-map" && !valueProps.hasNewline)
					onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
				if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
					onError(
						keyNode.range,
						"KEY_OVER_1024_CHARS",
						"The : indicator must be at most 1024 chars after the start of an implicit block mapping key",
					);
			}
			const valueNode = value
				? composeNode(ctx, value, valueProps, onError)
				: composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
			if (ctx.schema.compat) flowIndentCheck(bm.indent, value, onError);
			offset = valueNode.range[2];
			const pair = new Pair(keyNode, valueNode);
			if (ctx.options.keepSourceTokens) pair.srcToken = collItem;
			map.items.push(pair);
		} else {
			if (implicitKey) onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
			if (valueProps.comment) {
				if (keyNode.comment) keyNode.comment += "\n" + valueProps.comment;
				else keyNode.comment = valueProps.comment;
			}
			const pair = new Pair(keyNode);
			if (ctx.options.keepSourceTokens) pair.srcToken = collItem;
			map.items.push(pair);
		}
	}
	if (commentEnd && commentEnd < offset) onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
	map.range = [bm.offset, offset, commentEnd ?? offset];
	return map;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-block-seq.js
function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
	const seq = new (tag?.nodeClass ?? YAMLSeq)(ctx.schema);
	if (ctx.atRoot) ctx.atRoot = false;
	if (ctx.atKey) ctx.atKey = false;
	let offset = bs.offset;
	let commentEnd = null;
	for (const { start, value } of bs.items) {
		const props = resolveProps(start, {
			indicator: "seq-item-ind",
			next: value,
			offset,
			onError,
			parentIndent: bs.indent,
			startOnNewline: true,
		});
		if (!props.found) {
			if (props.anchor || props.tag || value) {
				if (value?.type === "block-seq")
					onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
				else onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
			} else {
				commentEnd = props.end;
				if (props.comment) seq.comment = props.comment;
				continue;
			}
		}
		const node = value
			? composeNode(ctx, value, props, onError)
			: composeEmptyNode(ctx, props.end, start, null, props, onError);
		if (ctx.schema.compat) flowIndentCheck(bs.indent, value, onError);
		offset = node.range[2];
		seq.items.push(node);
	}
	seq.range = [bs.offset, offset, commentEnd ?? offset];
	return seq;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-end.js
function resolveEnd(end, offset, reqSpace, onError) {
	let comment = "";
	if (end) {
		let hasSpace = false;
		let sep = "";
		for (const token of end) {
			const { source, type } = token;
			switch (type) {
				case "space":
					hasSpace = true;
					break;
				case "comment": {
					if (reqSpace && !hasSpace)
						onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
					const cb = source.substring(1) || " ";
					if (!comment) comment = cb;
					else comment += sep + cb;
					sep = "";
					break;
				}
				case "newline":
					if (comment) sep += source;
					hasSpace = true;
					break;
				default:
					onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
			}
			offset += source.length;
		}
	}
	return {
		comment,
		offset,
	};
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-flow-collection.js
var blockMsg = "Block collections are not allowed within flow collections";
var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
	const isMap = fc.start.source === "{";
	const fcName = isMap ? "flow map" : "flow sequence";
	const coll = new (tag?.nodeClass ?? (isMap ? YAMLMap : YAMLSeq))(ctx.schema);
	coll.flow = true;
	const atRoot = ctx.atRoot;
	if (atRoot) ctx.atRoot = false;
	if (ctx.atKey) ctx.atKey = false;
	let offset = fc.offset + fc.start.source.length;
	for (let i = 0; i < fc.items.length; ++i) {
		const collItem = fc.items[i];
		const { start, key, sep, value } = collItem;
		const props = resolveProps(start, {
			flow: fcName,
			indicator: "explicit-key-ind",
			next: key ?? sep?.[0],
			offset,
			onError,
			parentIndent: fc.indent,
			startOnNewline: false,
		});
		if (!props.found) {
			if (!props.anchor && !props.tag && !sep && !value) {
				if (i === 0 && props.comma) onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
				else if (i < fc.items.length - 1)
					onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
				if (props.comment) {
					if (coll.comment) coll.comment += "\n" + props.comment;
					else coll.comment = props.comment;
				}
				offset = props.end;
				continue;
			}
			if (!isMap && ctx.options.strict && containsNewline(key))
				onError(key, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
		}
		if (i === 0) {
			if (props.comma) onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
		} else {
			if (!props.comma) onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
			if (props.comment) {
				let prevItemComment = "";
				loop: for (const st of start)
					switch (st.type) {
						case "comma":
						case "space":
							break;
						case "comment":
							prevItemComment = st.source.substring(1);
							break loop;
						default:
							break loop;
					}
				if (prevItemComment) {
					let prev = coll.items[coll.items.length - 1];
					if (isPair(prev)) prev = prev.value ?? prev.key;
					if (prev.comment) prev.comment += "\n" + prevItemComment;
					else prev.comment = prevItemComment;
					props.comment = props.comment.substring(prevItemComment.length + 1);
				}
			}
		}
		if (!isMap && !sep && !props.found) {
			const valueNode = value
				? composeNode(ctx, value, props, onError)
				: composeEmptyNode(ctx, props.end, sep, null, props, onError);
			coll.items.push(valueNode);
			offset = valueNode.range[2];
			if (isBlock(value)) onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
		} else {
			ctx.atKey = true;
			const keyStart = props.end;
			const keyNode = key
				? composeNode(ctx, key, props, onError)
				: composeEmptyNode(ctx, keyStart, start, null, props, onError);
			if (isBlock(key)) onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
			ctx.atKey = false;
			const valueProps = resolveProps(sep ?? [], {
				flow: fcName,
				indicator: "map-value-ind",
				next: value,
				offset: keyNode.range[2],
				onError,
				parentIndent: fc.indent,
				startOnNewline: false,
			});
			if (valueProps.found) {
				if (!isMap && !props.found && ctx.options.strict) {
					if (sep)
						for (const st of sep) {
							if (st === valueProps.found) break;
							if (st.type === "newline") {
								onError(
									st,
									"MULTILINE_IMPLICIT_KEY",
									"Implicit keys of flow sequence pairs need to be on a single line",
								);
								break;
							}
						}
					if (props.start < valueProps.found.offset - 1024)
						onError(
							valueProps.found,
							"KEY_OVER_1024_CHARS",
							"The : indicator must be at most 1024 chars after the start of an implicit flow sequence key",
						);
				}
			} else if (value) {
				if ("source" in value && value.source?.[0] === ":")
					onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
				else onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
			}
			const valueNode = value
				? composeNode(ctx, value, valueProps, onError)
				: valueProps.found
					? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError)
					: null;
			if (valueNode) {
				if (isBlock(value)) onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
			} else if (valueProps.comment) {
				if (keyNode.comment) keyNode.comment += "\n" + valueProps.comment;
				else keyNode.comment = valueProps.comment;
			}
			const pair = new Pair(keyNode, valueNode);
			if (ctx.options.keepSourceTokens) pair.srcToken = collItem;
			if (isMap) {
				const map = coll;
				if (mapIncludes(ctx, map.items, keyNode)) onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
				map.items.push(pair);
			} else {
				const map = new YAMLMap(ctx.schema);
				map.flow = true;
				map.items.push(pair);
				const endRange = (valueNode ?? keyNode).range;
				map.range = [keyNode.range[0], endRange[1], endRange[2]];
				coll.items.push(map);
			}
			offset = valueNode ? valueNode.range[2] : valueProps.end;
		}
	}
	const expectedEnd = isMap ? "}" : "]";
	const [ce, ...ee] = fc.end;
	let cePos = offset;
	if (ce?.source === expectedEnd) cePos = ce.offset + ce.source.length;
	else {
		const name = fcName[0].toUpperCase() + fcName.substring(1);
		const msg = atRoot
			? `${name} must end with a ${expectedEnd}`
			: `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
		onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
		if (ce && ce.source.length !== 1) ee.unshift(ce);
	}
	if (ee.length > 0) {
		const end = resolveEnd(ee, cePos, ctx.options.strict, onError);
		if (end.comment) {
			if (coll.comment) coll.comment += "\n" + end.comment;
			else coll.comment = end.comment;
		}
		coll.range = [fc.offset, cePos, end.offset];
	} else coll.range = [fc.offset, cePos, cePos];
	return coll;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/compose-collection.js
function resolveCollection(CN, ctx, token, onError, tagName, tag) {
	const coll =
		token.type === "block-map"
			? resolveBlockMap(CN, ctx, token, onError, tag)
			: token.type === "block-seq"
				? resolveBlockSeq(CN, ctx, token, onError, tag)
				: resolveFlowCollection(CN, ctx, token, onError, tag);
	const Coll = coll.constructor;
	if (tagName === "!" || tagName === Coll.tagName) {
		coll.tag = Coll.tagName;
		return coll;
	}
	if (tagName) coll.tag = tagName;
	return coll;
}
function composeCollection(CN, ctx, token, props, onError) {
	const tagToken = props.tag;
	const tagName = !tagToken
		? null
		: ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
	if (token.type === "block-seq") {
		const { anchor, newlineAfterProp: nl } = props;
		const lastProp = anchor && tagToken ? (anchor.offset > tagToken.offset ? anchor : tagToken) : (anchor ?? tagToken);
		if (lastProp && (!nl || nl.offset < lastProp.offset))
			onError(lastProp, "MISSING_CHAR", "Missing newline after block sequence props");
	}
	const expType =
		token.type === "block-map"
			? "map"
			: token.type === "block-seq"
				? "seq"
				: token.start.source === "{"
					? "map"
					: "seq";
	if (
		!tagToken ||
		!tagName ||
		tagName === "!" ||
		(tagName === YAMLMap.tagName && expType === "map") ||
		(tagName === YAMLSeq.tagName && expType === "seq")
	)
		return resolveCollection(CN, ctx, token, onError, tagName);
	let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
	if (!tag) {
		const kt = ctx.schema.knownTags[tagName];
		if (kt?.collection === expType) {
			ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
			tag = kt;
		} else {
			if (kt)
				onError(
					tagToken,
					"BAD_COLLECTION_TYPE",
					`${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`,
					true,
				);
			else onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
			return resolveCollection(CN, ctx, token, onError, tagName);
		}
	}
	const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
	const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
	const node = isNode(res) ? res : new Scalar(res);
	node.range = coll.range;
	node.tag = tagName;
	if (tag?.format) node.format = tag.format;
	return node;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-block-scalar.js
function resolveBlockScalar(ctx, scalar, onError) {
	const start = scalar.offset;
	const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
	if (!header)
		return {
			value: "",
			type: null,
			comment: "",
			range: [start, start, start],
		};
	const type = header.mode === ">" ? Scalar.BLOCK_FOLDED : Scalar.BLOCK_LITERAL;
	const lines = scalar.source ? splitLines(scalar.source) : [];
	let chompStart = lines.length;
	for (let i = lines.length - 1; i >= 0; --i) {
		const content = lines[i][1];
		if (content === "" || content === "\r") chompStart = i;
		else break;
	}
	if (chompStart === 0) {
		const value = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
		let end = start + header.length;
		if (scalar.source) end += scalar.source.length;
		return {
			value,
			type,
			comment: header.comment,
			range: [start, end, end],
		};
	}
	let trimIndent = scalar.indent + header.indent;
	let offset = scalar.offset + header.length;
	let contentStart = 0;
	for (let i = 0; i < chompStart; ++i) {
		const [indent, content] = lines[i];
		if (content === "" || content === "\r") {
			if (header.indent === 0 && indent.length > trimIndent) trimIndent = indent.length;
		} else {
			if (indent.length < trimIndent)
				onError(
					offset + indent.length,
					"MISSING_CHAR",
					"Block scalars with more-indented leading empty lines must use an explicit indentation indicator",
				);
			if (header.indent === 0) trimIndent = indent.length;
			contentStart = i;
			if (trimIndent === 0 && !ctx.atRoot)
				onError(offset, "BAD_INDENT", "Block scalar values in collections must be indented");
			break;
		}
		offset += indent.length + content.length + 1;
	}
	for (let i = lines.length - 1; i >= chompStart; --i) if (lines[i][0].length > trimIndent) chompStart = i + 1;
	let value = "";
	let sep = "";
	let prevMoreIndented = false;
	for (let i = 0; i < contentStart; ++i) value += lines[i][0].slice(trimIndent) + "\n";
	for (let i = contentStart; i < chompStart; ++i) {
		let [indent, content] = lines[i];
		offset += indent.length + content.length + 1;
		const crlf = content[content.length - 1] === "\r";
		if (crlf) content = content.slice(0, -1);
		/* istanbul ignore if already caught in lexer */
		if (content && indent.length < trimIndent) {
			const message = `Block scalar lines must not be less indented than their ${header.indent ? "explicit indentation indicator" : "first line"}`;
			onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
			indent = "";
		}
		if (type === Scalar.BLOCK_LITERAL) {
			value += sep + indent.slice(trimIndent) + content;
			sep = "\n";
		} else if (indent.length > trimIndent || content[0] === "	") {
			if (sep === " ") sep = "\n";
			else if (!prevMoreIndented && sep === "\n") sep = "\n\n";
			value += sep + indent.slice(trimIndent) + content;
			sep = "\n";
			prevMoreIndented = true;
		} else if (content === "") {
			if (sep === "\n") value += "\n";
			else sep = "\n";
		} else {
			value += sep + content;
			sep = " ";
			prevMoreIndented = false;
		}
	}
	switch (header.chomp) {
		case "-":
			break;
		case "+":
			for (let i = chompStart; i < lines.length; ++i) value += "\n" + lines[i][0].slice(trimIndent);
			if (value[value.length - 1] !== "\n") value += "\n";
			break;
		default:
			value += "\n";
	}
	const end = start + header.length + scalar.source.length;
	return {
		value,
		type,
		comment: header.comment,
		range: [start, end, end],
	};
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
	/* istanbul ignore if should not happen */
	if (props[0].type !== "block-scalar-header") {
		onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
		return null;
	}
	const { source } = props[0];
	const mode = source[0];
	let indent = 0;
	let chomp = "";
	let error = -1;
	for (let i = 1; i < source.length; ++i) {
		const ch = source[i];
		if (!chomp && (ch === "-" || ch === "+")) chomp = ch;
		else {
			const n = Number(ch);
			if (!indent && n) indent = n;
			else if (error === -1) error = offset + i;
		}
	}
	if (error !== -1) onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
	let hasSpace = false;
	let comment = "";
	let length = source.length;
	for (let i = 1; i < props.length; ++i) {
		const token = props[i];
		switch (token.type) {
			case "space":
				hasSpace = true;
			case "newline":
				length += token.source.length;
				break;
			case "comment":
				if (strict && !hasSpace)
					onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
				length += token.source.length;
				comment = token.source.substring(1);
				break;
			case "error":
				onError(token, "UNEXPECTED_TOKEN", token.message);
				length += token.source.length;
				break;
			/* istanbul ignore next should not happen */
			default: {
				onError(token, "UNEXPECTED_TOKEN", `Unexpected token in block scalar header: ${token.type}`);
				const ts = token.source;
				if (ts && typeof ts === "string") length += ts.length;
			}
		}
	}
	return {
		mode,
		indent,
		chomp,
		comment,
		length,
	};
}
/** @returns Array of lines split up as `[indent, content]` */
function splitLines(source) {
	const split = source.split(/\n( *)/);
	const first = split[0];
	const m = first.match(/^( *)/);
	const lines = [m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first]];
	for (let i = 1; i < split.length; i += 2) lines.push([split[i], split[i + 1]]);
	return lines;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/resolve-flow-scalar.js
function resolveFlowScalar(scalar, strict, onError) {
	const { offset, type, source, end } = scalar;
	let _type;
	let value;
	const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
	switch (type) {
		case "scalar":
			_type = Scalar.PLAIN;
			value = plainValue(source, _onError);
			break;
		case "single-quoted-scalar":
			_type = Scalar.QUOTE_SINGLE;
			value = singleQuotedValue(source, _onError);
			break;
		case "double-quoted-scalar":
			_type = Scalar.QUOTE_DOUBLE;
			value = doubleQuotedValue(source, _onError);
			break;
		/* istanbul ignore next should not happen */
		default:
			onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
			return {
				value: "",
				type: null,
				comment: "",
				range: [offset, offset + source.length, offset + source.length],
			};
	}
	const valueEnd = offset + source.length;
	const re = resolveEnd(end, valueEnd, strict, onError);
	return {
		value,
		type: _type,
		comment: re.comment,
		range: [offset, valueEnd, re.offset],
	};
}
function plainValue(source, onError) {
	let badChar = "";
	switch (source[0]) {
		/* istanbul ignore next should not happen */
		case "	":
			badChar = "a tab character";
			break;
		case ",":
			badChar = "flow indicator character ,";
			break;
		case "%":
			badChar = "directive indicator character %";
			break;
		case "|":
		case ">":
			badChar = `block scalar indicator ${source[0]}`;
			break;
		case "@":
		case "`":
			badChar = `reserved character ${source[0]}`;
	}
	if (badChar) onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
	return unfoldLines(source);
}
function singleQuotedValue(source, onError) {
	if (source[source.length - 1] !== "'" || source.length === 1)
		onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
	return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function unfoldLines(source) {
	const line = /(.*?)\r?\n/sy;
	let match = line.exec(source);
	if (!match) return source;
	/**
	 * The negative lookbehinds in these RegExps are to
	 * prevent causing a polynomial search time in certain cases.
	 *
	 * The try-catch is for Safari < 16.4 and other old browsers:
	 * https://caniuse.com/js-regexp-lookbehind
	 */
	let trimEnd, trimBoth;
	try {
		trimEnd = /* @__PURE__ */ new RegExp("(?<![ 	])[ 	]+$");
		trimBoth = /* @__PURE__ */ new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
	} catch {
		trimEnd = /[ \t]+$/;
		trimBoth = /^[ \t]+|[ \t]+$/g;
	}
	let res = match[1].replace(trimEnd, "");
	let sep = " ";
	let pos = line.lastIndex;
	while ((match = line.exec(source))) {
		const lm = match[1].replace(trimBoth, "");
		if (lm === "") {
			if (sep === "\n") res += sep;
			else sep = "\n";
		} else {
			res += sep + lm;
			sep = " ";
		}
		pos = line.lastIndex;
	}
	const last = /[ \t]*(.*)/sy;
	last.lastIndex = pos;
	match = last.exec(source);
	return res + sep + (match?.[1] ?? "");
}
function doubleQuotedValue(source, onError) {
	let res = "";
	for (let i = 1; i < source.length - 1; ++i) {
		const ch = source[i];
		if (ch === "\r" && source[i + 1] === "\n") continue;
		if (ch === "\n") {
			const { fold, offset } = foldNewline(source, i);
			res += fold;
			i = offset;
		} else if (ch === "\\") {
			let next = source[++i];
			const cc = escapeCodes[next];
			if (cc) res += cc;
			else if (next === "\n") {
				next = source[i + 1];
				while (next === " " || next === "	") next = source[++i + 1];
			} else if (next === "\r" && source[i + 1] === "\n") {
				next = source[++i + 1];
				while (next === " " || next === "	") next = source[++i + 1];
			} else if (next === "x" || next === "u" || next === "U") {
				const length = next === "x" ? 2 : next === "u" ? 4 : 8;
				res += parseCharCode(source, i + 1, length, onError);
				i += length;
			} else {
				const raw = source.substr(i - 1, 2);
				onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
				res += raw;
			}
		} else if (ch === " " || ch === "	") {
			const wsStart = i;
			let next = source[i + 1];
			while (next === " " || next === "	") next = source[++i + 1];
			if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
				res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
		} else res += ch;
	}
	if (source[source.length - 1] !== '"' || source.length === 1)
		onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
	return res;
}
/**
 * Fold a single newline into a space, multiple newlines to N - 1 newlines.
 * Presumes `source[offset] === '\n'`
 */
function foldNewline(source, offset) {
	let fold = "";
	let ch = source[offset + 1];
	while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
		if (ch === "\r" && source[offset + 2] !== "\n") break;
		if (ch === "\n") fold += "\n";
		offset += 1;
		ch = source[offset + 1];
	}
	if (!fold) fold = " ";
	return {
		fold,
		offset,
	};
}
var escapeCodes = {
	0: "\0",
	a: "\x07",
	b: "\b",
	e: "\x1B",
	f: "\f",
	n: "\n",
	r: "\r",
	t: "	",
	v: "\v",
	N: "",
	_: "\xA0",
	L: "\u2028",
	P: "\u2029",
	" ": " ",
	'"': '"',
	"/": "/",
	"\\": "\\",
	"	": "	",
};
function parseCharCode(source, offset, length, onError) {
	const cc = source.substr(offset, length);
	const code = cc.length === length && /^[0-9a-fA-F]+$/.test(cc) ? parseInt(cc, 16) : NaN;
	try {
		return String.fromCodePoint(code);
	} catch {
		const raw = source.substr(offset - 2, length + 2);
		onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
		return raw;
	}
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/compose-scalar.js
function composeScalar(ctx, token, tagToken, onError) {
	const { value, type, comment, range } =
		token.type === "block-scalar"
			? resolveBlockScalar(ctx, token, onError)
			: resolveFlowScalar(token, ctx.options.strict, onError);
	const tagName = tagToken
		? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg))
		: null;
	let tag;
	if (ctx.options.stringKeys && ctx.atKey) tag = ctx.schema[SCALAR$1];
	else if (tagName) tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
	else if (token.type === "scalar") tag = findScalarTagByTest(ctx, value, token, onError);
	else tag = ctx.schema[SCALAR$1];
	let scalar;
	try {
		const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
		scalar = isScalar(res) ? res : new Scalar(res);
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
		scalar = new Scalar(value);
	}
	scalar.range = range;
	scalar.source = value;
	if (type) scalar.type = type;
	if (tagName) scalar.tag = tagName;
	if (tag.format) scalar.format = tag.format;
	if (comment) scalar.comment = comment;
	return scalar;
}
function findScalarTagByName(schema, value, tagName, tagToken, onError) {
	if (tagName === "!") return schema[SCALAR$1];
	const matchWithTest = [];
	for (const tag of schema.tags)
		if (!tag.collection && tag.tag === tagName) {
			if (tag.default && tag.test) matchWithTest.push(tag);
			else return tag;
		}
	for (const tag of matchWithTest) if (tag.test?.test(value)) return tag;
	const kt = schema.knownTags[tagName];
	if (kt && !kt.collection) {
		schema.tags.push(
			Object.assign({}, kt, {
				default: false,
				test: void 0,
			}),
		);
		return kt;
	}
	onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
	return schema[SCALAR$1];
}
function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
	const tag =
		schema.tags.find((tag) => (tag.default === true || (atKey && tag.default === "key")) && tag.test?.test(value)) ||
		schema[SCALAR$1];
	if (schema.compat) {
		const compat = schema.compat.find((tag) => tag.default && tag.test?.test(value)) ?? schema[SCALAR$1];
		if (tag.tag !== compat.tag)
			onError(
				token,
				"TAG_RESOLVE_FAILED",
				`Value may be parsed as either ${directives.tagString(tag.tag)} or ${directives.tagString(compat.tag)}`,
				true,
			);
	}
	return tag;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/util-empty-scalar-position.js
function emptyScalarPosition(offset, before, pos) {
	if (before) {
		pos ?? (pos = before.length);
		for (let i = pos - 1; i >= 0; --i) {
			let st = before[i];
			switch (st.type) {
				case "space":
				case "comment":
				case "newline":
					offset -= st.source.length;
					continue;
			}
			st = before[++i];
			while (st?.type === "space") {
				offset += st.source.length;
				st = before[++i];
			}
			break;
		}
	}
	return offset;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/compose-node.js
var CN = {
	composeNode,
	composeEmptyNode,
};
function composeNode(ctx, token, props, onError) {
	const atKey = ctx.atKey;
	const { spaceBefore, comment, anchor, tag } = props;
	let node;
	let isSrcToken = true;
	switch (token.type) {
		case "alias":
			node = composeAlias(ctx, token, onError);
			if (anchor || tag) onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
			break;
		case "scalar":
		case "single-quoted-scalar":
		case "double-quoted-scalar":
		case "block-scalar":
			node = composeScalar(ctx, token, tag, onError);
			if (anchor) node.anchor = anchor.source.substring(1);
			break;
		case "block-map":
		case "block-seq":
		case "flow-collection":
			try {
				node = composeCollection(CN, ctx, token, props, onError);
				if (anchor) node.anchor = anchor.source.substring(1);
			} catch (error) {
				onError(token, "RESOURCE_EXHAUSTION", error instanceof Error ? error.message : String(error));
			}
			break;
		default:
			onError(
				token,
				"UNEXPECTED_TOKEN",
				token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`,
			);
			isSrcToken = false;
	}
	node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
	if (anchor && node.anchor === "") onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
	if (
		atKey &&
		ctx.options.stringKeys &&
		(!isScalar(node) || typeof node.value !== "string" || (node.tag && node.tag !== "tag:yaml.org,2002:str"))
	)
		onError(tag ?? token, "NON_STRING_KEY", "With stringKeys, all keys must be strings");
	if (spaceBefore) node.spaceBefore = true;
	if (comment) {
		if (token.type === "scalar" && token.source === "") node.comment = comment;
		else node.commentBefore = comment;
	}
	if (ctx.options.keepSourceTokens && isSrcToken) node.srcToken = token;
	return node;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
	const node = composeScalar(
		ctx,
		{
			type: "scalar",
			offset: emptyScalarPosition(offset, before, pos),
			indent: -1,
			source: "",
		},
		tag,
		onError,
	);
	if (anchor) {
		node.anchor = anchor.source.substring(1);
		if (node.anchor === "") onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
	}
	if (spaceBefore) node.spaceBefore = true;
	if (comment) {
		node.comment = comment;
		node.range[2] = end;
	}
	return node;
}
function composeAlias({ options }, { offset, source, end }, onError) {
	const alias = new Alias(source.substring(1));
	if (alias.source === "") onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
	if (alias.source.endsWith(":"))
		onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
	const valueEnd = offset + source.length;
	const re = resolveEnd(end, valueEnd, options.strict, onError);
	alias.range = [offset, valueEnd, re.offset];
	if (re.comment) alias.comment = re.comment;
	return alias;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/compose-doc.js
function composeDoc(options, directives, { offset, start, value, end }, onError) {
	const doc = new Document(void 0, Object.assign({ _directives: directives }, options));
	const ctx = {
		atKey: false,
		atRoot: true,
		directives: doc.directives,
		options: doc.options,
		schema: doc.schema,
	};
	const props = resolveProps(start, {
		indicator: "doc-start",
		next: value ?? end?.[0],
		offset,
		onError,
		parentIndent: 0,
		startOnNewline: true,
	});
	if (props.found) {
		doc.directives.docStart = true;
		if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
			onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
	}
	doc.contents = value
		? composeNode(ctx, value, props, onError)
		: composeEmptyNode(ctx, props.end, start, null, props, onError);
	const contentEnd = doc.contents.range[2];
	const re = resolveEnd(end, contentEnd, false, onError);
	if (re.comment) doc.comment = re.comment;
	doc.range = [offset, contentEnd, re.offset];
	return doc;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/compose/composer.js
function getErrorPos(src) {
	if (typeof src === "number") return [src, src + 1];
	if (Array.isArray(src)) return src.length === 2 ? src : [src[0], src[1]];
	const { offset, source } = src;
	return [offset, offset + (typeof source === "string" ? source.length : 1)];
}
function parsePrelude(prelude) {
	let comment = "";
	let atComment = false;
	let afterEmptyLine = false;
	for (let i = 0; i < prelude.length; ++i) {
		const source = prelude[i];
		switch (source[0]) {
			case "#":
				comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
				atComment = true;
				afterEmptyLine = false;
				break;
			case "%":
				if (prelude[i + 1]?.[0] !== "#") i += 1;
				atComment = false;
				break;
			default:
				if (!atComment) afterEmptyLine = true;
				atComment = false;
		}
	}
	return {
		comment,
		afterEmptyLine,
	};
}
/**
 * Compose a stream of CST nodes into a stream of YAML Documents.
 *
 * ```ts
 * import { Composer, Parser } from 'yaml'
 *
 * const src: string = ...
 * const tokens = new Parser().parse(src)
 * const docs = new Composer().compose(tokens)
 * ```
 */
var Composer = class {
	constructor(options = {}) {
		this.doc = null;
		this.atDirectives = false;
		this.prelude = [];
		this.errors = [];
		this.warnings = [];
		this.onError = (source, code, message, warning) => {
			const pos = getErrorPos(source);
			if (warning) this.warnings.push(new YAMLWarning(pos, code, message));
			else this.errors.push(new YAMLParseError(pos, code, message));
		};
		this.directives = new Directives({ version: options.version || "1.2" });
		this.options = options;
	}
	decorate(doc, afterDoc) {
		const { comment, afterEmptyLine } = parsePrelude(this.prelude);
		if (comment) {
			const dc = doc.contents;
			if (afterDoc) doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
			else if (afterEmptyLine || doc.directives.docStart || !dc) doc.commentBefore = comment;
			else if (isCollection(dc) && !dc.flow && dc.items.length > 0) {
				let it = dc.items[0];
				if (isPair(it)) it = it.key;
				const cb = it.commentBefore;
				it.commentBefore = cb ? `${comment}\n${cb}` : comment;
			} else {
				const cb = dc.commentBefore;
				dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
			}
		}
		if (afterDoc) {
			for (let i = 0; i < this.errors.length; ++i) doc.errors.push(this.errors[i]);
			for (let i = 0; i < this.warnings.length; ++i) doc.warnings.push(this.warnings[i]);
		} else {
			doc.errors = this.errors;
			doc.warnings = this.warnings;
		}
		this.prelude = [];
		this.errors = [];
		this.warnings = [];
	}
	/**
	 * Current stream status information.
	 *
	 * Mostly useful at the end of input for an empty stream.
	 */
	streamInfo() {
		return {
			comment: parsePrelude(this.prelude).comment,
			directives: this.directives,
			errors: this.errors,
			warnings: this.warnings,
		};
	}
	/**
	 * Compose tokens into documents.
	 *
	 * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
	 * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
	 */
	*compose(tokens, forceDoc = false, endOffset = -1) {
		for (const token of tokens) yield* this.next(token);
		yield* this.end(forceDoc, endOffset);
	}
	/** Advance the composer by one CST token. */
	*next(token) {
		switch (token.type) {
			case "directive":
				this.directives.add(token.source, (offset, message, warning) => {
					const pos = getErrorPos(token);
					pos[0] += offset;
					this.onError(pos, "BAD_DIRECTIVE", message, warning);
				});
				this.prelude.push(token.source);
				this.atDirectives = true;
				break;
			case "document": {
				const doc = composeDoc(this.options, this.directives, token, this.onError);
				if (this.atDirectives && !doc.directives.docStart)
					this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
				this.decorate(doc, false);
				if (this.doc) yield this.doc;
				this.doc = doc;
				this.atDirectives = false;
				break;
			}
			case "byte-order-mark":
			case "space":
				break;
			case "comment":
			case "newline":
				this.prelude.push(token.source);
				break;
			case "error": {
				const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
				const error = new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
				if (this.atDirectives || !this.doc) this.errors.push(error);
				else this.doc.errors.push(error);
				break;
			}
			case "doc-end": {
				if (!this.doc) {
					this.errors.push(
						new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", "Unexpected doc-end without preceding document"),
					);
					break;
				}
				this.doc.directives.docEnd = true;
				const end = resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
				this.decorate(this.doc, true);
				if (end.comment) {
					const dc = this.doc.comment;
					this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
				}
				this.doc.range[2] = end.offset;
				break;
			}
			default:
				this.errors.push(new YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
		}
	}
	/**
	 * Call at end of input to yield any remaining document.
	 *
	 * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
	 * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
	 */
	*end(forceDoc = false, endOffset = -1) {
		if (this.doc) {
			this.decorate(this.doc, true);
			yield this.doc;
			this.doc = null;
		} else if (forceDoc) {
			const doc = new Document(void 0, Object.assign({ _directives: this.directives }, this.options));
			if (this.atDirectives) this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
			doc.range = [0, endOffset, endOffset];
			this.decorate(doc, false);
			yield doc;
		}
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/parse/cst-visit.js
var BREAK = Symbol("break visit");
var SKIP = Symbol("skip children");
var REMOVE = Symbol("remove item");
/**
 * Apply a visitor to a CST document or item.
 *
 * Walks through the tree (depth-first) starting from the root, calling a
 * `visitor` function with two arguments when entering each item:
 *   - `item`: The current item, which included the following members:
 *     - `start: SourceToken[]` – Source tokens before the key or value,
 *       possibly including its anchor or tag.
 *     - `key?: Token | null` – Set for pair values. May then be `null`, if
 *       the key before the `:` separator is empty.
 *     - `sep?: SourceToken[]` – Source tokens between the key and the value,
 *       which should include the `:` map value indicator if `value` is set.
 *     - `value?: Token` – The value of a sequence item, or of a map pair.
 *   - `path`: The steps from the root to the current node, as an array of
 *     `['key' | 'value', number]` tuples.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this token, continue with
 *      next sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current item, then continue with the next one
 *   - `number`: Set the index of the next step. This is useful especially if
 *     the index of the current token has changed.
 *   - `function`: Define the next visitor for this item. After the original
 *     visitor is called on item entry, next visitors are called after handling
 *     a non-empty `key` and when exiting the item.
 */
function visit(cst, visitor) {
	if ("type" in cst && cst.type === "document")
		cst = {
			start: cst.start,
			value: cst.value,
		};
	_visit(Object.freeze([]), cst, visitor);
}
/** Terminate visit traversal completely */
visit.BREAK = BREAK;
/** Do not visit the children of the current item */
visit.SKIP = SKIP;
/** Remove the current item */
visit.REMOVE = REMOVE;
/** Find the item at `path` from `cst` as the root */
visit.itemAtPath = (cst, path) => {
	let item = cst;
	for (const [field, index] of path) {
		const tok = item?.[field];
		if (tok && "items" in tok) item = tok.items[index];
		else return void 0;
	}
	return item;
};
/**
 * Get the immediate parent collection of the item at `path` from `cst` as the root.
 *
 * Throws an error if the collection is not found, which should never happen if the item itself exists.
 */
visit.parentCollection = (cst, path) => {
	const parent = visit.itemAtPath(cst, path.slice(0, -1));
	const field = path[path.length - 1][0];
	const coll = parent?.[field];
	if (coll && "items" in coll) return coll;
	throw new Error("Parent collection not found");
};
function _visit(path, item, visitor) {
	let ctrl = visitor(item, path);
	if (typeof ctrl === "symbol") return ctrl;
	for (const field of ["key", "value"]) {
		const token = item[field];
		if (token && "items" in token) {
			for (let i = 0; i < token.items.length; ++i) {
				const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
				if (typeof ci === "number") i = ci - 1;
				else if (ci === BREAK) return BREAK;
				else if (ci === REMOVE) {
					token.items.splice(i, 1);
					i -= 1;
				}
			}
			if (typeof ctrl === "function" && field === "key") ctrl = ctrl(item, path);
		}
	}
	return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
}
/** Identify the type of a lexer token. May return `null` for unknown tokens. */
function tokenType(source) {
	switch (source) {
		case "﻿":
			return "byte-order-mark";
		case "":
			return "doc-mode";
		case "":
			return "flow-error-end";
		case "":
			return "scalar";
		case "---":
			return "doc-start";
		case "...":
			return "doc-end";
		case "":
		case "\n":
		case "\r\n":
			return "newline";
		case "-":
			return "seq-item-ind";
		case "?":
			return "explicit-key-ind";
		case ":":
			return "map-value-ind";
		case "{":
			return "flow-map-start";
		case "}":
			return "flow-map-end";
		case "[":
			return "flow-seq-start";
		case "]":
			return "flow-seq-end";
		case ",":
			return "comma";
	}
	switch (source[0]) {
		case " ":
		case "	":
			return "space";
		case "#":
			return "comment";
		case "%":
			return "directive-line";
		case "*":
			return "alias";
		case "&":
			return "anchor";
		case "!":
			return "tag";
		case "'":
			return "single-quoted-scalar";
		case '"':
			return "double-quoted-scalar";
		case "|":
		case ">":
			return "block-scalar-header";
	}
	return null;
}
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/parse/lexer.js
function isEmpty(ch) {
	switch (ch) {
		case void 0:
		case " ":
		case "\n":
		case "\r":
		case "	":
			return true;
		default:
			return false;
	}
}
var hexDigits = /* @__PURE__ */ new Set("0123456789ABCDEFabcdef");
var tagChars = /* @__PURE__ */ new Set(
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()",
);
var flowIndicatorChars = /* @__PURE__ */ new Set(",[]{}");
var invalidAnchorChars = /* @__PURE__ */ new Set(" ,[]{}\n\r	");
var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
/**
 * Splits an input string into lexical tokens, i.e. smaller strings that are
 * easily identifiable by `tokens.tokenType()`.
 *
 * Lexing starts always in a "stream" context. Incomplete input may be buffered
 * until a complete token can be emitted.
 *
 * In addition to slices of the original input, the following control characters
 * may also be emitted:
 *
 * - `\x02` (Start of Text): A document starts with the next token
 * - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
 * - `\x1f` (Unit Separator): Next token is a scalar value
 * - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
 */
var Lexer = class {
	constructor() {
		/**
		 * Flag indicating whether the end of the current buffer marks the end of
		 * all input
		 */
		this.atEnd = false;
		/**
		 * Explicit indent set in block scalar header, as an offset from the current
		 * minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
		 * explicitly set.
		 */
		this.blockScalarIndent = -1;
		/**
		 * Block scalars that include a + (keep) chomping indicator in their header
		 * include trailing empty lines, which are otherwise excluded from the
		 * scalar's contents.
		 */
		this.blockScalarKeep = false;
		/** Current input */
		this.buffer = "";
		/**
		 * Flag noting whether the map value indicator : can immediately follow this
		 * node within a flow context.
		 */
		this.flowKey = false;
		/** Count of surrounding flow collection levels. */
		this.flowLevel = 0;
		/**
		 * Minimum level of indentation required for next lines to be parsed as a
		 * part of the current scalar value.
		 */
		this.indentNext = 0;
		/** Indentation level of the current line. */
		this.indentValue = 0;
		/** Position of the next \n character. */
		this.lineEndPos = null;
		/** Stores the state of the lexer if reaching the end of incpomplete input */
		this.next = null;
		/** A pointer to `buffer`; the current position of the lexer. */
		this.pos = 0;
	}
	/**
	 * Generate YAML tokens from the `source` string. If `incomplete`,
	 * a part of the last line may be left as a buffer for the next call.
	 *
	 * @returns A generator of lexical tokens
	 */
	*lex(source, incomplete = false) {
		if (source) {
			if (typeof source !== "string") throw TypeError("source is not a string");
			this.buffer = this.buffer ? this.buffer + source : source;
			this.lineEndPos = null;
		}
		this.atEnd = !incomplete;
		let next = this.next ?? "stream";
		while (next && (incomplete || this.hasChars(1))) next = yield* this.parseNext(next);
	}
	atLineEnd() {
		let i = this.pos;
		let ch = this.buffer[i];
		while (ch === " " || ch === "	") ch = this.buffer[++i];
		if (!ch || ch === "#" || ch === "\n") return true;
		if (ch === "\r") return this.buffer[i + 1] === "\n";
		return false;
	}
	charAt(n) {
		return this.buffer[this.pos + n];
	}
	continueScalar(offset) {
		let ch = this.buffer[offset];
		if (this.indentNext > 0) {
			let indent = 0;
			while (ch === " ") ch = this.buffer[++indent + offset];
			if (ch === "\r") {
				const next = this.buffer[indent + offset + 1];
				if (next === "\n" || (!next && !this.atEnd)) return offset + indent + 1;
			}
			return ch === "\n" || indent >= this.indentNext || (!ch && !this.atEnd) ? offset + indent : -1;
		}
		if (ch === "-" || ch === ".") {
			const dt = this.buffer.substr(offset, 3);
			if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3])) return -1;
		}
		return offset;
	}
	getLine() {
		let end = this.lineEndPos;
		if (typeof end !== "number" || (end !== -1 && end < this.pos)) {
			end = this.buffer.indexOf("\n", this.pos);
			this.lineEndPos = end;
		}
		if (end === -1) return this.atEnd ? this.buffer.substring(this.pos) : null;
		if (this.buffer[end - 1] === "\r") end -= 1;
		return this.buffer.substring(this.pos, end);
	}
	hasChars(n) {
		return this.pos + n <= this.buffer.length;
	}
	setNext(state) {
		this.buffer = this.buffer.substring(this.pos);
		this.pos = 0;
		this.lineEndPos = null;
		this.next = state;
		return null;
	}
	peek(n) {
		return this.buffer.substr(this.pos, n);
	}
	*parseNext(next) {
		switch (next) {
			case "stream":
				return yield* this.parseStream();
			case "line-start":
				return yield* this.parseLineStart();
			case "block-start":
				return yield* this.parseBlockStart();
			case "doc":
				return yield* this.parseDocument();
			case "flow":
				return yield* this.parseFlowCollection();
			case "quoted-scalar":
				return yield* this.parseQuotedScalar();
			case "block-scalar":
				return yield* this.parseBlockScalar();
			case "plain-scalar":
				return yield* this.parsePlainScalar();
		}
	}
	*parseStream() {
		let line = this.getLine();
		if (line === null) return this.setNext("stream");
		if (line[0] === "﻿") {
			yield* this.pushCount(1);
			line = line.substring(1);
		}
		if (line[0] === "%") {
			let dirEnd = line.length;
			let cs = line.indexOf("#");
			while (cs !== -1) {
				const ch = line[cs - 1];
				if (ch === " " || ch === "	") {
					dirEnd = cs - 1;
					break;
				} else cs = line.indexOf("#", cs + 1);
			}
			while (true) {
				const ch = line[dirEnd - 1];
				if (ch === " " || ch === "	") dirEnd -= 1;
				else break;
			}
			const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
			yield* this.pushCount(line.length - n);
			this.pushNewline();
			return "stream";
		}
		if (this.atLineEnd()) {
			const sp = yield* this.pushSpaces(true);
			yield* this.pushCount(line.length - sp);
			yield* this.pushNewline();
			return "stream";
		}
		yield "";
		return yield* this.parseLineStart();
	}
	*parseLineStart() {
		const ch = this.charAt(0);
		if (!ch && !this.atEnd) return this.setNext("line-start");
		if (ch === "-" || ch === ".") {
			if (!this.atEnd && !this.hasChars(4)) return this.setNext("line-start");
			const s = this.peek(3);
			if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
				yield* this.pushCount(3);
				this.indentValue = 0;
				this.indentNext = 0;
				return s === "---" ? "doc" : "stream";
			}
		}
		this.indentValue = yield* this.pushSpaces(false);
		if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1))) this.indentNext = this.indentValue;
		return yield* this.parseBlockStart();
	}
	*parseBlockStart() {
		const [ch0, ch1] = this.peek(2);
		if (!ch1 && !this.atEnd) return this.setNext("block-start");
		if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
			const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
			this.indentNext = this.indentValue + 1;
			this.indentValue += n;
			return "block-start";
		}
		return "doc";
	}
	*parseDocument() {
		yield* this.pushSpaces(true);
		const line = this.getLine();
		if (line === null) return this.setNext("doc");
		let n = yield* this.pushIndicators();
		switch (line[n]) {
			case "#":
				yield* this.pushCount(line.length - n);
			case void 0:
				yield* this.pushNewline();
				return yield* this.parseLineStart();
			case "{":
			case "[":
				yield* this.pushCount(1);
				this.flowKey = false;
				this.flowLevel = 1;
				return "flow";
			case "}":
			case "]":
				yield* this.pushCount(1);
				return "doc";
			case "*":
				yield* this.pushUntil(isNotAnchorChar);
				return "doc";
			case '"':
			case "'":
				return yield* this.parseQuotedScalar();
			case "|":
			case ">":
				n += yield* this.parseBlockScalarHeader();
				n += yield* this.pushSpaces(true);
				yield* this.pushCount(line.length - n);
				yield* this.pushNewline();
				return yield* this.parseBlockScalar();
			default:
				return yield* this.parsePlainScalar();
		}
	}
	*parseFlowCollection() {
		let nl, sp;
		let indent = -1;
		do {
			nl = yield* this.pushNewline();
			if (nl > 0) {
				sp = yield* this.pushSpaces(false);
				this.indentValue = indent = sp;
			} else sp = 0;
			sp += yield* this.pushSpaces(true);
		} while (nl + sp > 0);
		const line = this.getLine();
		if (line === null) return this.setNext("flow");
		if (
			(indent !== -1 && indent < this.indentNext && line[0] !== "#") ||
			(indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3]))
		) {
			if (!(indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}"))) {
				this.flowLevel = 0;
				yield "";
				return yield* this.parseLineStart();
			}
		}
		let n = 0;
		while (line[n] === ",") {
			n += yield* this.pushCount(1);
			n += yield* this.pushSpaces(true);
			this.flowKey = false;
		}
		n += yield* this.pushIndicators();
		switch (line[n]) {
			case void 0:
				return "flow";
			case "#":
				yield* this.pushCount(line.length - n);
				return "flow";
			case "{":
			case "[":
				yield* this.pushCount(1);
				this.flowKey = false;
				this.flowLevel += 1;
				return "flow";
			case "}":
			case "]":
				yield* this.pushCount(1);
				this.flowKey = true;
				this.flowLevel -= 1;
				return this.flowLevel ? "flow" : "doc";
			case "*":
				yield* this.pushUntil(isNotAnchorChar);
				return "flow";
			case '"':
			case "'":
				this.flowKey = true;
				return yield* this.parseQuotedScalar();
			case ":": {
				const next = this.charAt(1);
				if (this.flowKey || isEmpty(next) || next === ",") {
					this.flowKey = false;
					yield* this.pushCount(1);
					yield* this.pushSpaces(true);
					return "flow";
				}
			}
			default:
				this.flowKey = false;
				return yield* this.parsePlainScalar();
		}
	}
	*parseQuotedScalar() {
		const quote = this.charAt(0);
		let end = this.buffer.indexOf(quote, this.pos + 1);
		if (quote === "'") while (end !== -1 && this.buffer[end + 1] === "'") end = this.buffer.indexOf("'", end + 2);
		else
			while (end !== -1) {
				let n = 0;
				while (this.buffer[end - 1 - n] === "\\") n += 1;
				if (n % 2 === 0) break;
				end = this.buffer.indexOf('"', end + 1);
			}
		const qb = this.buffer.substring(0, end);
		let nl = qb.indexOf("\n", this.pos);
		if (nl !== -1) {
			while (nl !== -1) {
				const cs = this.continueScalar(nl + 1);
				if (cs === -1) break;
				nl = qb.indexOf("\n", cs);
			}
			if (nl !== -1) end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
		}
		if (end === -1) {
			if (!this.atEnd) return this.setNext("quoted-scalar");
			end = this.buffer.length;
		}
		yield* this.pushToIndex(end + 1, false);
		return this.flowLevel ? "flow" : "doc";
	}
	*parseBlockScalarHeader() {
		this.blockScalarIndent = -1;
		this.blockScalarKeep = false;
		let i = this.pos;
		while (true) {
			const ch = this.buffer[++i];
			if (ch === "+") this.blockScalarKeep = true;
			else if (ch > "0" && ch <= "9") this.blockScalarIndent = Number(ch) - 1;
			else if (ch !== "-") break;
		}
		return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
	}
	*parseBlockScalar() {
		let nl = this.pos - 1;
		let indent = 0;
		let ch;
		loop: for (let i = this.pos; (ch = this.buffer[i]); ++i)
			switch (ch) {
				case " ":
					indent += 1;
					break;
				case "\n":
					nl = i;
					indent = 0;
					break;
				case "\r": {
					const next = this.buffer[i + 1];
					if (!next && !this.atEnd) return this.setNext("block-scalar");
					if (next === "\n") break;
				}
				default:
					break loop;
			}
		if (!ch && !this.atEnd) return this.setNext("block-scalar");
		if (indent >= this.indentNext) {
			if (this.blockScalarIndent === -1) this.indentNext = indent;
			else this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
			do {
				const cs = this.continueScalar(nl + 1);
				if (cs === -1) break;
				nl = this.buffer.indexOf("\n", cs);
			} while (nl !== -1);
			if (nl === -1) {
				if (!this.atEnd) return this.setNext("block-scalar");
				nl = this.buffer.length;
			}
		}
		let i = nl + 1;
		ch = this.buffer[i];
		while (ch === " ") ch = this.buffer[++i];
		if (ch === "	") {
			while (ch === "	" || ch === " " || ch === "\r" || ch === "\n") ch = this.buffer[++i];
			nl = i - 1;
		} else if (!this.blockScalarKeep)
			do {
				let i = nl - 1;
				let ch = this.buffer[i];
				if (ch === "\r") ch = this.buffer[--i];
				const lastChar = i;
				while (ch === " ") ch = this.buffer[--i];
				if (ch === "\n" && i >= this.pos && i + 1 + indent > lastChar) nl = i;
				else break;
			} while (true);
		yield "";
		yield* this.pushToIndex(nl + 1, true);
		return yield* this.parseLineStart();
	}
	*parsePlainScalar() {
		const inFlow = this.flowLevel > 0;
		let end = this.pos - 1;
		let i = this.pos - 1;
		let ch;
		while ((ch = this.buffer[++i]))
			if (ch === ":") {
				const next = this.buffer[i + 1];
				if (isEmpty(next) || (inFlow && flowIndicatorChars.has(next))) break;
				end = i;
			} else if (isEmpty(ch)) {
				let next = this.buffer[i + 1];
				if (ch === "\r") {
					if (next === "\n") {
						i += 1;
						ch = "\n";
						next = this.buffer[i + 1];
					} else end = i;
				}
				if (next === "#" || (inFlow && flowIndicatorChars.has(next))) break;
				if (ch === "\n") {
					const cs = this.continueScalar(i + 1);
					if (cs === -1) break;
					i = Math.max(i, cs - 2);
				}
			} else {
				if (inFlow && flowIndicatorChars.has(ch)) break;
				end = i;
			}
		if (!ch && !this.atEnd) return this.setNext("plain-scalar");
		yield "";
		yield* this.pushToIndex(end + 1, true);
		return inFlow ? "flow" : "doc";
	}
	*pushCount(n) {
		if (n > 0) {
			yield this.buffer.substr(this.pos, n);
			this.pos += n;
			return n;
		}
		return 0;
	}
	*pushToIndex(i, allowEmpty) {
		const s = this.buffer.slice(this.pos, i);
		if (s) {
			yield s;
			this.pos += s.length;
			return s.length;
		} else if (allowEmpty) yield "";
		return 0;
	}
	*pushIndicators() {
		let n = 0;
		loop: while (true) {
			switch (this.charAt(0)) {
				case "!":
					n += yield* this.pushTag();
					n += yield* this.pushSpaces(true);
					continue loop;
				case "&":
					n += yield* this.pushUntil(isNotAnchorChar);
					n += yield* this.pushSpaces(true);
					continue loop;
				case "-":
				case "?":
				case ":": {
					const inFlow = this.flowLevel > 0;
					const ch1 = this.charAt(1);
					if (isEmpty(ch1) || (inFlow && flowIndicatorChars.has(ch1))) {
						if (!inFlow) this.indentNext = this.indentValue + 1;
						else if (this.flowKey) this.flowKey = false;
						n += yield* this.pushCount(1);
						n += yield* this.pushSpaces(true);
						continue loop;
					}
				}
			}
			break loop;
		}
		return n;
	}
	*pushTag() {
		if (this.charAt(1) === "<") {
			let i = this.pos + 2;
			let ch = this.buffer[i];
			while (!isEmpty(ch) && ch !== ">") ch = this.buffer[++i];
			return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
		} else {
			let i = this.pos + 1;
			let ch = this.buffer[i];
			while (ch)
				if (tagChars.has(ch)) ch = this.buffer[++i];
				else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2]))
					ch = this.buffer[(i += 3)];
				else break;
			return yield* this.pushToIndex(i, false);
		}
	}
	*pushNewline() {
		const ch = this.buffer[this.pos];
		if (ch === "\n") return yield* this.pushCount(1);
		else if (ch === "\r" && this.charAt(1) === "\n") return yield* this.pushCount(2);
		else return 0;
	}
	*pushSpaces(allowTabs) {
		let i = this.pos - 1;
		let ch;
		do ch = this.buffer[++i];
		while (ch === " " || (allowTabs && ch === "	"));
		const n = i - this.pos;
		if (n > 0) {
			yield this.buffer.substr(this.pos, n);
			this.pos = i;
		}
		return n;
	}
	*pushUntil(test) {
		let i = this.pos;
		let ch = this.buffer[i];
		while (!test(ch)) ch = this.buffer[++i];
		return yield* this.pushToIndex(i, false);
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/parse/line-counter.js
/**
 * Tracks newlines during parsing in order to provide an efficient API for
 * determining the one-indexed `{ line, col }` position for any offset
 * within the input.
 */
var LineCounter = class {
	constructor() {
		this.lineStarts = [];
		/**
		 * Should be called in ascending order. Otherwise, call
		 * `lineCounter.lineStarts.sort()` before calling `linePos()`.
		 */
		this.addNewLine = (offset) => this.lineStarts.push(offset);
		/**
		 * Performs a binary search and returns the 1-indexed { line, col }
		 * position of `offset`. If `line === 0`, `addNewLine` has never been
		 * called or `offset` is before the first known newline.
		 */
		this.linePos = (offset) => {
			let low = 0;
			let high = this.lineStarts.length;
			while (low < high) {
				const mid = (low + high) >> 1;
				if (this.lineStarts[mid] < offset) low = mid + 1;
				else high = mid;
			}
			if (this.lineStarts[low] === offset)
				return {
					line: low + 1,
					col: 1,
				};
			if (low === 0)
				return {
					line: 0,
					col: offset,
				};
			const start = this.lineStarts[low - 1];
			return {
				line: low,
				col: offset - start + 1,
			};
		};
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/parse/parser.js
function includesToken(list, type) {
	for (let i = 0; i < list.length; ++i) if (list[i].type === type) return true;
	return false;
}
function findNonEmptyIndex(list) {
	for (let i = 0; i < list.length; ++i)
		switch (list[i].type) {
			case "space":
			case "comment":
			case "newline":
				break;
			default:
				return i;
		}
	return -1;
}
function isFlowToken(token) {
	switch (token?.type) {
		case "alias":
		case "scalar":
		case "single-quoted-scalar":
		case "double-quoted-scalar":
		case "flow-collection":
			return true;
		default:
			return false;
	}
}
function getPrevProps(parent) {
	switch (parent.type) {
		case "document":
			return parent.start;
		case "block-map": {
			const it = parent.items[parent.items.length - 1];
			return it.sep ?? it.start;
		}
		case "block-seq":
			return parent.items[parent.items.length - 1].start;
		/* istanbul ignore next should not happen */
		default:
			return [];
	}
}
/** Note: May modify input array */
function getFirstKeyStartProps(prev) {
	if (prev.length === 0) return [];
	let i = prev.length;
	loop: while (--i >= 0)
		switch (prev[i].type) {
			case "doc-start":
			case "explicit-key-ind":
			case "map-value-ind":
			case "seq-item-ind":
			case "newline":
				break loop;
		}
	while (prev[++i]?.type === "space");
	return prev.splice(i, prev.length);
}
function arrayPushArray(target, source) {
	if (source.length < 1e5) Array.prototype.push.apply(target, source);
	else for (let i = 0; i < source.length; ++i) target.push(source[i]);
}
function fixFlowSeqItems(fc) {
	if (fc.start.type === "flow-seq-start") {
		for (const it of fc.items)
			if (
				it.sep &&
				!it.value &&
				!includesToken(it.start, "explicit-key-ind") &&
				!includesToken(it.sep, "map-value-ind")
			) {
				if (it.key) it.value = it.key;
				delete it.key;
				if (isFlowToken(it.value)) {
					if (it.value.end) arrayPushArray(it.value.end, it.sep);
					else it.value.end = it.sep;
				} else arrayPushArray(it.start, it.sep);
				delete it.sep;
			}
	}
}
/**
 * A YAML concrete syntax tree (CST) parser
 *
 * ```ts
 * const src: string = ...
 * for (const token of new Parser().parse(src)) {
 *   // token: Token
 * }
 * ```
 *
 * To use the parser with a user-provided lexer:
 *
 * ```ts
 * function* parse(source: string, lexer: Lexer) {
 *   const parser = new Parser()
 *   for (const lexeme of lexer.lex(source))
 *     yield* parser.next(lexeme)
 *   yield* parser.end()
 * }
 *
 * const src: string = ...
 * const lexer = new Lexer()
 * for (const token of parse(src, lexer)) {
 *   // token: Token
 * }
 * ```
 */
var Parser = class {
	/**
	 * @param onNewLine - If defined, called separately with the start position of
	 *   each new line (in `parse()`, including the start of input).
	 */
	constructor(onNewLine) {
		/** If true, space and sequence indicators count as indentation */
		this.atNewLine = true;
		/** If true, next token is a scalar value */
		this.atScalar = false;
		/** Current indentation level */
		this.indent = 0;
		/** Current offset since the start of parsing */
		this.offset = 0;
		/** On the same line with a block map key */
		this.onKeyLine = false;
		/** Top indicates the node that's currently being built */
		this.stack = [];
		/** The source of the current token, set in parse() */
		this.source = "";
		/** The type of the current token, set in parse() */
		this.type = "";
		this.lexer = new Lexer();
		this.onNewLine = onNewLine;
	}
	/**
	 * Parse `source` as a YAML stream.
	 * If `incomplete`, a part of the last line may be left as a buffer for the next call.
	 *
	 * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
	 *
	 * @returns A generator of tokens representing each directive, document, and other structure.
	 */
	*parse(source, incomplete = false) {
		if (this.onNewLine && this.offset === 0) this.onNewLine(0);
		for (const lexeme of this.lexer.lex(source, incomplete)) yield* this.next(lexeme);
		if (!incomplete) yield* this.end();
	}
	/**
	 * Advance the parser by the `source` of one lexical token.
	 */
	*next(source) {
		this.source = source;
		if (this.atScalar) {
			this.atScalar = false;
			yield* this.step();
			this.offset += source.length;
			return;
		}
		const type = tokenType(source);
		if (!type) {
			const message = `Not a YAML token: ${source}`;
			yield* this.pop({
				type: "error",
				offset: this.offset,
				message,
				source,
			});
			this.offset += source.length;
		} else if (type === "scalar") {
			this.atNewLine = false;
			this.atScalar = true;
			this.type = "scalar";
		} else {
			this.type = type;
			yield* this.step();
			switch (type) {
				case "newline":
					this.atNewLine = true;
					this.indent = 0;
					if (this.onNewLine) this.onNewLine(this.offset + source.length);
					break;
				case "space":
					if (this.atNewLine && source[0] === " ") this.indent += source.length;
					break;
				case "explicit-key-ind":
				case "map-value-ind":
				case "seq-item-ind":
					if (this.atNewLine) this.indent += source.length;
					break;
				case "doc-mode":
				case "flow-error-end":
					return;
				default:
					this.atNewLine = false;
			}
			this.offset += source.length;
		}
	}
	/** Call at end of input to push out any remaining constructions */
	*end() {
		while (this.stack.length > 0) yield* this.pop();
	}
	get sourceToken() {
		return {
			type: this.type,
			offset: this.offset,
			indent: this.indent,
			source: this.source,
		};
	}
	*step() {
		const top = this.peek(1);
		if (this.type === "doc-end" && top?.type !== "doc-end") {
			while (this.stack.length > 0) yield* this.pop();
			this.stack.push({
				type: "doc-end",
				offset: this.offset,
				source: this.source,
			});
			return;
		}
		if (!top) return yield* this.stream();
		switch (top.type) {
			case "document":
				return yield* this.document(top);
			case "alias":
			case "scalar":
			case "single-quoted-scalar":
			case "double-quoted-scalar":
				return yield* this.scalar(top);
			case "block-scalar":
				return yield* this.blockScalar(top);
			case "block-map":
				return yield* this.blockMap(top);
			case "block-seq":
				return yield* this.blockSequence(top);
			case "flow-collection":
				return yield* this.flowCollection(top);
			case "doc-end":
				return yield* this.documentEnd(top);
		}
		/* istanbul ignore next should not happen */
		yield* this.pop();
	}
	peek(n) {
		return this.stack[this.stack.length - n];
	}
	*pop(error) {
		const token = error ?? this.stack.pop();
		/* istanbul ignore if should not happen */
		if (!token)
			yield {
				type: "error",
				offset: this.offset,
				source: "",
				message: "Tried to pop an empty stack",
			};
		else if (this.stack.length === 0) yield token;
		else {
			const top = this.peek(1);
			if (token.type === "block-scalar") token.indent = "indent" in top ? top.indent : 0;
			else if (token.type === "flow-collection" && top.type === "document") token.indent = 0;
			if (token.type === "flow-collection") fixFlowSeqItems(token);
			switch (top.type) {
				case "document":
					top.value = token;
					break;
				case "block-scalar":
					top.props.push(token);
					break;
				case "block-map": {
					const it = top.items[top.items.length - 1];
					if (it.value) {
						top.items.push({
							start: [],
							key: token,
							sep: [],
						});
						this.onKeyLine = true;
						return;
					} else if (it.sep) it.value = token;
					else {
						Object.assign(it, {
							key: token,
							sep: [],
						});
						this.onKeyLine = !it.explicitKey;
						return;
					}
					break;
				}
				case "block-seq": {
					const it = top.items[top.items.length - 1];
					if (it.value)
						top.items.push({
							start: [],
							value: token,
						});
					else it.value = token;
					break;
				}
				case "flow-collection": {
					const it = top.items[top.items.length - 1];
					if (!it || it.value)
						top.items.push({
							start: [],
							key: token,
							sep: [],
						});
					else if (it.sep) it.value = token;
					else
						Object.assign(it, {
							key: token,
							sep: [],
						});
					return;
				}
				/* istanbul ignore next should not happen */
				default:
					yield* this.pop();
					yield* this.pop(token);
			}
			if (
				(top.type === "document" || top.type === "block-map" || top.type === "block-seq") &&
				(token.type === "block-map" || token.type === "block-seq")
			) {
				const last = token.items[token.items.length - 1];
				if (
					last &&
					!last.sep &&
					!last.value &&
					last.start.length > 0 &&
					findNonEmptyIndex(last.start) === -1 &&
					(token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))
				) {
					if (top.type === "document") top.end = last.start;
					else top.items.push({ start: last.start });
					token.items.splice(-1, 1);
				}
			}
		}
	}
	*stream() {
		switch (this.type) {
			case "directive-line":
				yield {
					type: "directive",
					offset: this.offset,
					source: this.source,
				};
				return;
			case "byte-order-mark":
			case "space":
			case "comment":
			case "newline":
				yield this.sourceToken;
				return;
			case "doc-mode":
			case "doc-start": {
				const doc = {
					type: "document",
					offset: this.offset,
					start: [],
				};
				if (this.type === "doc-start") doc.start.push(this.sourceToken);
				this.stack.push(doc);
				return;
			}
		}
		yield {
			type: "error",
			offset: this.offset,
			message: `Unexpected ${this.type} token in YAML stream`,
			source: this.source,
		};
	}
	*document(doc) {
		if (doc.value) return yield* this.lineEnd(doc);
		switch (this.type) {
			case "doc-start":
				if (findNonEmptyIndex(doc.start) !== -1) {
					yield* this.pop();
					yield* this.step();
				} else doc.start.push(this.sourceToken);
				return;
			case "anchor":
			case "tag":
			case "space":
			case "comment":
			case "newline":
				doc.start.push(this.sourceToken);
				return;
		}
		const bv = this.startBlockValue(doc);
		if (bv) this.stack.push(bv);
		else
			yield {
				type: "error",
				offset: this.offset,
				message: `Unexpected ${this.type} token in YAML document`,
				source: this.source,
			};
	}
	*scalar(scalar) {
		if (this.type === "map-value-ind") {
			const start = getFirstKeyStartProps(getPrevProps(this.peek(2)));
			let sep;
			if (scalar.end) {
				sep = scalar.end;
				sep.push(this.sourceToken);
				delete scalar.end;
			} else sep = [this.sourceToken];
			const map = {
				type: "block-map",
				offset: scalar.offset,
				indent: scalar.indent,
				items: [
					{
						start,
						key: scalar,
						sep,
					},
				],
			};
			this.onKeyLine = true;
			this.stack[this.stack.length - 1] = map;
		} else yield* this.lineEnd(scalar);
	}
	*blockScalar(scalar) {
		switch (this.type) {
			case "space":
			case "comment":
			case "newline":
				scalar.props.push(this.sourceToken);
				return;
			case "scalar":
				scalar.source = this.source;
				this.atNewLine = true;
				this.indent = 0;
				if (this.onNewLine) {
					let nl = this.source.indexOf("\n") + 1;
					while (nl !== 0) {
						this.onNewLine(this.offset + nl);
						nl = this.source.indexOf("\n", nl) + 1;
					}
				}
				yield* this.pop();
				break;
			/* istanbul ignore next should not happen */
			default:
				yield* this.pop();
				yield* this.step();
		}
	}
	*blockMap(map) {
		const it = map.items[map.items.length - 1];
		switch (this.type) {
			case "newline":
				this.onKeyLine = false;
				if (it.value) {
					const end = "end" in it.value ? it.value.end : void 0;
					if ((Array.isArray(end) ? end[end.length - 1] : void 0)?.type === "comment") end?.push(this.sourceToken);
					else map.items.push({ start: [this.sourceToken] });
				} else if (it.sep) it.sep.push(this.sourceToken);
				else it.start.push(this.sourceToken);
				return;
			case "space":
			case "comment":
				if (it.value) map.items.push({ start: [this.sourceToken] });
				else if (it.sep) it.sep.push(this.sourceToken);
				else {
					if (this.atIndentedComment(it.start, map.indent)) {
						const end = map.items[map.items.length - 2]?.value?.end;
						if (Array.isArray(end)) {
							arrayPushArray(end, it.start);
							end.push(this.sourceToken);
							map.items.pop();
							return;
						}
					}
					it.start.push(this.sourceToken);
				}
				return;
		}
		if (this.indent >= map.indent) {
			const atMapIndent = !this.onKeyLine && this.indent === map.indent;
			const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
			let start = [];
			if (atNextItem && it.sep && !it.value) {
				const nl = [];
				for (let i = 0; i < it.sep.length; ++i) {
					const st = it.sep[i];
					switch (st.type) {
						case "newline":
							nl.push(i);
							break;
						case "space":
							break;
						case "comment":
							if (st.indent > map.indent) nl.length = 0;
							break;
						default:
							nl.length = 0;
					}
				}
				if (nl.length >= 2) start = it.sep.splice(nl[1]);
			}
			switch (this.type) {
				case "anchor":
				case "tag":
					if (atNextItem || it.value) {
						start.push(this.sourceToken);
						map.items.push({ start });
						this.onKeyLine = true;
					} else if (it.sep) it.sep.push(this.sourceToken);
					else it.start.push(this.sourceToken);
					return;
				case "explicit-key-ind":
					if (!it.sep && !it.explicitKey) {
						it.start.push(this.sourceToken);
						it.explicitKey = true;
					} else if (atNextItem || it.value) {
						start.push(this.sourceToken);
						map.items.push({
							start,
							explicitKey: true,
						});
					} else
						this.stack.push({
							type: "block-map",
							offset: this.offset,
							indent: this.indent,
							items: [
								{
									start: [this.sourceToken],
									explicitKey: true,
								},
							],
						});
					this.onKeyLine = true;
					return;
				case "map-value-ind":
					if (it.explicitKey) {
						if (!it.sep) {
							if (includesToken(it.start, "newline"))
								Object.assign(it, {
									key: null,
									sep: [this.sourceToken],
								});
							else {
								const start = getFirstKeyStartProps(it.start);
								this.stack.push({
									type: "block-map",
									offset: this.offset,
									indent: this.indent,
									items: [
										{
											start,
											key: null,
											sep: [this.sourceToken],
										},
									],
								});
							}
						} else if (it.value)
							map.items.push({
								start: [],
								key: null,
								sep: [this.sourceToken],
							});
						else if (includesToken(it.sep, "map-value-ind"))
							this.stack.push({
								type: "block-map",
								offset: this.offset,
								indent: this.indent,
								items: [
									{
										start,
										key: null,
										sep: [this.sourceToken],
									},
								],
							});
						else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
							const start = getFirstKeyStartProps(it.start);
							const key = it.key;
							const sep = it.sep;
							sep.push(this.sourceToken);
							delete it.key;
							delete it.sep;
							this.stack.push({
								type: "block-map",
								offset: this.offset,
								indent: this.indent,
								items: [
									{
										start,
										key,
										sep,
									},
								],
							});
						} else if (start.length > 0) it.sep = it.sep.concat(start, this.sourceToken);
						else it.sep.push(this.sourceToken);
					} else if (!it.sep)
						Object.assign(it, {
							key: null,
							sep: [this.sourceToken],
						});
					else if (it.value || atNextItem)
						map.items.push({
							start,
							key: null,
							sep: [this.sourceToken],
						});
					else if (includesToken(it.sep, "map-value-ind"))
						this.stack.push({
							type: "block-map",
							offset: this.offset,
							indent: this.indent,
							items: [
								{
									start: [],
									key: null,
									sep: [this.sourceToken],
								},
							],
						});
					else it.sep.push(this.sourceToken);
					this.onKeyLine = true;
					return;
				case "alias":
				case "scalar":
				case "single-quoted-scalar":
				case "double-quoted-scalar": {
					const fs = this.flowScalar(this.type);
					if (atNextItem || it.value) {
						map.items.push({
							start,
							key: fs,
							sep: [],
						});
						this.onKeyLine = true;
					} else if (it.sep) this.stack.push(fs);
					else {
						Object.assign(it, {
							key: fs,
							sep: [],
						});
						this.onKeyLine = true;
					}
					return;
				}
				default: {
					const bv = this.startBlockValue(map);
					if (bv) {
						if (bv.type === "block-seq") {
							if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
								yield* this.pop({
									type: "error",
									offset: this.offset,
									message: "Unexpected block-seq-ind on same line with key",
									source: this.source,
								});
								return;
							}
						} else if (atMapIndent) map.items.push({ start });
						this.stack.push(bv);
						return;
					}
				}
			}
		}
		yield* this.pop();
		yield* this.step();
	}
	*blockSequence(seq) {
		const it = seq.items[seq.items.length - 1];
		switch (this.type) {
			case "newline":
				if (it.value) {
					const end = "end" in it.value ? it.value.end : void 0;
					if ((Array.isArray(end) ? end[end.length - 1] : void 0)?.type === "comment") end?.push(this.sourceToken);
					else seq.items.push({ start: [this.sourceToken] });
				} else it.start.push(this.sourceToken);
				return;
			case "space":
			case "comment":
				if (it.value) seq.items.push({ start: [this.sourceToken] });
				else {
					if (this.atIndentedComment(it.start, seq.indent)) {
						const end = seq.items[seq.items.length - 2]?.value?.end;
						if (Array.isArray(end)) {
							arrayPushArray(end, it.start);
							end.push(this.sourceToken);
							seq.items.pop();
							return;
						}
					}
					it.start.push(this.sourceToken);
				}
				return;
			case "anchor":
			case "tag":
				if (it.value || this.indent <= seq.indent) break;
				it.start.push(this.sourceToken);
				return;
			case "seq-item-ind":
				if (this.indent !== seq.indent) break;
				if (it.value || includesToken(it.start, "seq-item-ind")) seq.items.push({ start: [this.sourceToken] });
				else it.start.push(this.sourceToken);
				return;
		}
		if (this.indent > seq.indent) {
			const bv = this.startBlockValue(seq);
			if (bv) {
				this.stack.push(bv);
				return;
			}
		}
		yield* this.pop();
		yield* this.step();
	}
	*flowCollection(fc) {
		const it = fc.items[fc.items.length - 1];
		if (this.type === "flow-error-end") {
			let top;
			do {
				yield* this.pop();
				top = this.peek(1);
			} while (top?.type === "flow-collection");
		} else if (fc.end.length === 0) {
			switch (this.type) {
				case "comma":
				case "explicit-key-ind":
					if (!it || it.sep) fc.items.push({ start: [this.sourceToken] });
					else it.start.push(this.sourceToken);
					return;
				case "map-value-ind":
					if (!it || it.value)
						fc.items.push({
							start: [],
							key: null,
							sep: [this.sourceToken],
						});
					else if (it.sep) it.sep.push(this.sourceToken);
					else
						Object.assign(it, {
							key: null,
							sep: [this.sourceToken],
						});
					return;
				case "space":
				case "comment":
				case "newline":
				case "anchor":
				case "tag":
					if (!it || it.value) fc.items.push({ start: [this.sourceToken] });
					else if (it.sep) it.sep.push(this.sourceToken);
					else it.start.push(this.sourceToken);
					return;
				case "alias":
				case "scalar":
				case "single-quoted-scalar":
				case "double-quoted-scalar": {
					const fs = this.flowScalar(this.type);
					if (!it || it.value)
						fc.items.push({
							start: [],
							key: fs,
							sep: [],
						});
					else if (it.sep) this.stack.push(fs);
					else
						Object.assign(it, {
							key: fs,
							sep: [],
						});
					return;
				}
				case "flow-map-end":
				case "flow-seq-end":
					fc.end.push(this.sourceToken);
					return;
			}
			const bv = this.startBlockValue(fc);
			/* istanbul ignore else should not happen */
			if (bv) this.stack.push(bv);
			else {
				yield* this.pop();
				yield* this.step();
			}
		} else {
			const parent = this.peek(2);
			if (
				parent.type === "block-map" &&
				((this.type === "map-value-ind" && parent.indent === fc.indent) ||
					(this.type === "newline" && !parent.items[parent.items.length - 1].sep))
			) {
				yield* this.pop();
				yield* this.step();
			} else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
				const start = getFirstKeyStartProps(getPrevProps(parent));
				fixFlowSeqItems(fc);
				const sep = fc.end.splice(1, fc.end.length);
				sep.push(this.sourceToken);
				const map = {
					type: "block-map",
					offset: fc.offset,
					indent: fc.indent,
					items: [
						{
							start,
							key: fc,
							sep,
						},
					],
				};
				this.onKeyLine = true;
				this.stack[this.stack.length - 1] = map;
			} else yield* this.lineEnd(fc);
		}
	}
	flowScalar(type) {
		if (this.onNewLine) {
			let nl = this.source.indexOf("\n") + 1;
			while (nl !== 0) {
				this.onNewLine(this.offset + nl);
				nl = this.source.indexOf("\n", nl) + 1;
			}
		}
		return {
			type,
			offset: this.offset,
			indent: this.indent,
			source: this.source,
		};
	}
	startBlockValue(parent) {
		switch (this.type) {
			case "alias":
			case "scalar":
			case "single-quoted-scalar":
			case "double-quoted-scalar":
				return this.flowScalar(this.type);
			case "block-scalar-header":
				return {
					type: "block-scalar",
					offset: this.offset,
					indent: this.indent,
					props: [this.sourceToken],
					source: "",
				};
			case "flow-map-start":
			case "flow-seq-start":
				return {
					type: "flow-collection",
					offset: this.offset,
					indent: this.indent,
					start: this.sourceToken,
					items: [],
					end: [],
				};
			case "seq-item-ind":
				return {
					type: "block-seq",
					offset: this.offset,
					indent: this.indent,
					items: [{ start: [this.sourceToken] }],
				};
			case "explicit-key-ind": {
				this.onKeyLine = true;
				const start = getFirstKeyStartProps(getPrevProps(parent));
				start.push(this.sourceToken);
				return {
					type: "block-map",
					offset: this.offset,
					indent: this.indent,
					items: [
						{
							start,
							explicitKey: true,
						},
					],
				};
			}
			case "map-value-ind": {
				this.onKeyLine = true;
				const start = getFirstKeyStartProps(getPrevProps(parent));
				return {
					type: "block-map",
					offset: this.offset,
					indent: this.indent,
					items: [
						{
							start,
							key: null,
							sep: [this.sourceToken],
						},
					],
				};
			}
		}
		return null;
	}
	atIndentedComment(start, indent) {
		if (this.type !== "comment") return false;
		if (this.indent <= indent) return false;
		return start.every((st) => st.type === "newline" || st.type === "space");
	}
	*documentEnd(docEnd) {
		if (this.type !== "doc-mode") {
			if (docEnd.end) docEnd.end.push(this.sourceToken);
			else docEnd.end = [this.sourceToken];
			if (this.type === "newline") yield* this.pop();
		}
	}
	*lineEnd(token) {
		switch (this.type) {
			case "comma":
			case "doc-start":
			case "doc-end":
			case "flow-seq-end":
			case "flow-map-end":
			case "map-value-ind":
				yield* this.pop();
				yield* this.step();
				break;
			case "newline":
				this.onKeyLine = false;
			default:
				if (token.end) token.end.push(this.sourceToken);
				else token.end = [this.sourceToken];
				if (this.type === "newline") yield* this.pop();
		}
	}
};
// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/browser/dist/public-api.js
function parseOptions(options) {
	const prettyErrors = options.prettyErrors !== false;
	return {
		lineCounter: options.lineCounter || (prettyErrors && new LineCounter()) || null,
		prettyErrors,
	};
}
/** Parse an input string into a single YAML.Document */
function parseDocument(source, options = {}) {
	const { lineCounter, prettyErrors } = parseOptions(options);
	const parser = new Parser(lineCounter?.addNewLine);
	const composer = new Composer(options);
	let doc = null;
	for (const _doc of composer.compose(parser.parse(source), true, source.length))
		if (!doc) doc = _doc;
		else if (doc.options.logLevel !== "silent") {
			doc.errors.push(
				new YAMLParseError(
					_doc.range.slice(0, 2),
					"MULTIPLE_DOCS",
					"Source contains multiple documents; please use YAML.parseAllDocuments()",
				),
			);
			break;
		}
	if (prettyErrors && lineCounter) {
		doc.errors.forEach(prettifyError(source, lineCounter));
		doc.warnings.forEach(prettifyError(source, lineCounter));
	}
	return doc;
}
function parse(src, reviver, options) {
	let _reviver = void 0;
	if (typeof reviver === "function") _reviver = reviver;
	else if (options === void 0 && reviver && typeof reviver === "object") options = reviver;
	const doc = parseDocument(src, options);
	if (!doc) return null;
	doc.warnings.forEach((warning) => warn(doc.options.logLevel, warning));
	if (doc.errors.length > 0) {
		if (doc.options.logLevel !== "silent") throw doc.errors[0];
		else doc.errors = [];
	}
	return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
// src/frontmatter.ts
/**
 * The frontmatter keys this plugin reads, with the type each one must have. Any other key in a
 * flat file is ignored, and so is a known key with the wrong type.
 */
var FLAT_KEYS = {
	source: "text",
	sourceId: "text",
	url: "text",
	title: "text",
	kind: "text",
	rentWarm: "number",
	rentWarmEstimated: "boolean",
	rentCold: "number",
	sizeM2: "number",
	rooms: "number",
	address: "text",
	postcode: "text",
	lat: "number",
	lon: "number",
	availableFrom: "text",
	availableTo: "text",
	floor: "text",
	bikeMin: "number",
	walkMin: "number",
	distanceKm: "number",
	stayMonths: "number",
	postedAt: "text",
	firstSeenAt: "text",
	status: "text",
	ideal: "boolean",
	flags: "list",
	idealMisses: "list",
};
function read_known_value(kind, value) {
	switch (kind) {
		case "text":
			return typeof value === "string" ? value : typeof value === "number" ? String(value) : null;
		case "number":
			return typeof value === "number" && Number.isFinite(value) ? value : null;
		case "boolean":
			return typeof value === "boolean" ? value : null;
		case "list":
			return Array.isArray(value) ? value.filter((item) => typeof item === "string") : null;
	}
}
/**
 * Split a flat file into its known facts and its description.
 *
 * The facts go into a `Map`, read key by key from the list above. So a file with a key such as
 * `__proto__` cannot change how any object in the page behaves. A file without frontmatter, or
 * with frontmatter that is not valid YAML, gives no facts and the whole text as description.
 */
function parse_flat_file(text) {
	const facts = /* @__PURE__ */ new Map();
	const match = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/u.exec(text);
	if (!match)
		return {
			facts,
			description: text.trim(),
		};
	const description = text.slice(match[0].length).trim();
	let parsed;
	try {
		parsed = parse(match[1]);
	} catch {
		return {
			facts,
			description,
		};
	}
	if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
		return {
			facts,
			description,
		};
	for (const key of Object.keys(FLAT_KEYS)) {
		if (!Object.hasOwn(parsed, key)) continue;
		const value = read_known_value(FLAT_KEYS[key], parsed[key]);
		if (value !== null) facts.set(key, value);
	}
	return {
		facts,
		description,
	};
}
/**
 * Return the ad address only when it is a normal web address, else `null`.
 *
 * The page shows it as text with a Copy button, never as a link: the plugin frame cannot open
 * new tabs. The check still matters, because a file could hold `javascript:` or another scheme
 * that nobody should paste into a browser.
 */
function safe_ad_url(value) {
	if (typeof value !== "string") return null;
	let url;
	try {
		url = new URL(value);
	} catch {
		return null;
	}
	return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
}
/**
 * The 200 body, or a throw carrying the route's own refusal sentence. Both call sites below feed
 * a member-visible error, and every refusal this route declares carries `message`. Since SDK
 * 0.18.0 a body that did not parse arrives as `null` on any status, so that throws here too.
 */
function download_urls_body(answer) {
	if (answer.status !== 200)
		throw new Error(answer.body?.message ?? `The download-urls door answered ${answer.status}`);
	if (answer.body === null) throw new Error("The download-urls door answered 200 with a body that is not JSON");
	return answer.body;
}
function create_media_url_manager(client) {
	const cache = /* @__PURE__ */ new Map();
	const pending = /* @__PURE__ */ new Map();
	const waiters = [];
	let active_requests = 0;
	const batch_queue = [];
	let batch_flush_active = false;
	function acquire_slot() {
		if (active_requests < 4) {
			active_requests += 1;
			return Promise.resolve();
		}
		return new Promise((resolve) => waiters.push(resolve));
	}
	function release_slot() {
		const next = waiters.shift();
		if (next) next();
		else active_requests -= 1;
	}
	function request_download_url(nodeId) {
		const in_flight = pending.get(nodeId);
		if (in_flight) return in_flight;
		const request = (async () => {
			await acquire_slot();
			try {
				const response = download_urls_body(
					await fetch_json_with_429_retry(client, "/api/v1/files/download-urls", { fileNodeIds: [nodeId] }),
				);
				const item = response.items[0];
				if (!item) throw new Error(response.errors[0]?.message ?? "Not found");
				const media = {
					url: item.url,
					expiresAt: item.expiresAt,
				};
				cache.set(nodeId, media);
				return media;
			} finally {
				release_slot();
				pending.delete(nodeId);
			}
		})();
		pending.set(nodeId, request);
		return request;
	}
	function request_download_url_batched(nodeId) {
		const in_flight = pending.get(nodeId);
		if (in_flight) return in_flight;
		const request = new Promise((resolve, reject) => {
			batch_queue.push({
				nodeId,
				resolve,
				reject,
			});
		});
		pending.set(nodeId, request);
		if (!batch_flush_active) {
			batch_flush_active = true;
			setTimeout(() => void flush_batch_queue(), 0);
		}
		return request;
	}
	async function flush_batch_queue() {
		while (batch_queue.length > 0) {
			const entries = batch_queue.splice(0, 12);
			await acquire_slot();
			try {
				const response = download_urls_body(
					await fetch_json_with_429_retry(client, "/api/v1/files/download-urls", {
						fileNodeIds: entries.map((entry) => entry.nodeId),
					}),
				);
				const items_by_node_id = new Map(response.items.map((item) => [item.fileNodeId, item]));
				const errors_by_node_id = new Map(response.errors.map((item) => [item.fileNodeId, item.message]));
				for (const entry of entries) {
					pending.delete(entry.nodeId);
					const item = items_by_node_id.get(entry.nodeId);
					if (item) {
						const media = {
							url: item.url,
							expiresAt: item.expiresAt,
						};
						cache.set(entry.nodeId, media);
						entry.resolve(media);
					} else entry.reject(new Error(errors_by_node_id.get(entry.nodeId) ?? "Not found"));
				}
			} catch (error) {
				for (const entry of entries) {
					pending.delete(entry.nodeId);
					entry.reject(error);
				}
			} finally {
				release_slot();
			}
		}
		batch_flush_active = false;
	}
	return {
		get_url(nodeId) {
			const cached = cache.get(nodeId);
			if (cached && Date.now() < cached.expiresAt - 6e4) return Promise.resolve(cached);
			return request_download_url_batched(nodeId);
		},
		get_fresh_url(nodeId) {
			return request_download_url(nodeId);
		},
	};
}
// node_modules/.pnpm/preact@11.0.1/node_modules/preact/jsx-runtime/src/index.js
var vnodeId = 0;
Array.isArray;
/**
 * @fileoverview
 * This file exports various methods that implement Babel's "automatic" JSX runtime API:
 * - jsx(type, props, key)
 * - jsxs(type, props, key)
 * - jsxDEV(type, props, key, __source, __self)
 *
 * The implementation of createVNode here is optimized for performance.
 * Benchmarks: https://esbench.com/bench/5f6b54a0b4632100a7dcd2b3
 */
/**
 * JSX.Element factory used by Babel's {runtime:"automatic"} JSX transform
 * @param {import('../../src/internal').VNode['type']} type
 * @param {import('preact').VNode['props']} props
 * @param {import('preact').VNode['key']} [key]
 * @param {unknown} [isStaticChildren]
 * @param {unknown} [__source]
 * @param {unknown} [__self]
 */
function createVNode(type, props, key, isStaticChildren, __source, __self) {
	if (!props) props = {};
	let normalizedProps = props,
		ref,
		i;
	if ("ref" in normalizedProps && typeof type != "function") {
		normalizedProps = {};
		for (i in props)
			if (i == "ref") ref = props[i];
			else normalizedProps[i] = props[i];
	}
	/** @type {import('../../src/internal').VNode & { __source?: any; __self?: any }} */
	const vnode = {
		type,
		props: normalizedProps,
		key,
		ref,
		_children: null,
		_parent: null,
		_depth: 0,
		_dom: null,
		_component: null,
		constructor: void 0,
		_original: --vnodeId,
		_index: -1,
		_flags: 0,
	};
	if (__source || __self) {
		vnode.__source = __source;
		vnode.__self = __self;
	}
	if (options$1.vnode) options$1.vnode(vnode);
	return vnode;
}
// src/app.tsx
var DEFAULT_FOLDER = "/flats";
/**
 * All plugins share one frame origin, so they share `localStorage` too. Keep the key under this
 * plugin's name, and store only the folder path there, never file data.
 */
var FOLDER_STORAGE_KEY = "bonobo-plugin-apartments:folder";
var number_format = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
var date_format = new Intl.DateTimeFormat("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});
/**
 * Clean a typed folder path, or return `null` when it is not a folder path.
 */
function normalize_folder_path(value) {
	const trimmed = value.trim();
	if (!trimmed.startsWith("/") || trimmed.length > 1024) return null;
	if (trimmed === "/") return "/";
	const path = trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
	return path
		.slice(1)
		.split("/")
		.every((name) => name !== "" && name !== "." && name !== "..")
		? path
		: null;
}
function read_saved_folder() {
	try {
		return normalize_folder_path(window.localStorage.getItem(FOLDER_STORAGE_KEY) ?? "") ?? DEFAULT_FOLDER;
	} catch {
		return DEFAULT_FOLDER;
	}
}
function save_folder(folder) {
	try {
		window.localStorage.setItem(FOLDER_STORAGE_KEY, folder);
	} catch {}
}
function format_number(value, unit) {
	return value === null ? "—" : `${number_format.format(value)} ${unit}`;
}
function format_rent(row) {
	const rent = row_number(row, "frontmatter.rentWarm");
	if (rent === null) return "—";
	return `${row_field(row, "frontmatter.rentWarmEstimated") === true ? "~" : ""}${number_format.format(rent)} €`;
}
function format_date(value) {
	if (typeof value !== "string" || value === "") return "—";
	const time = Date.parse(value);
	return Number.isNaN(time) ? value : date_format.format(time);
}
function row_title(row) {
	const title = row_field(row, "frontmatter.title");
	return typeof title === "string" && title !== "" ? title : row.name;
}
function App(props) {
	const media = useMemo(() => create_media_url_manager(props.client), [props.client]);
	const [folder, setFolder] = useState(read_saved_folder);
	const [folderDraft, setFolderDraft] = useState(folder);
	const [folderError, setFolderError] = useState(null);
	const [view, setView] = useState("newest");
	const [status, setStatus] = useState("new");
	const [maxRent, setMaxRent] = useState(null);
	const [maxRentDraft, setMaxRentDraft] = useState("");
	const [openRow, setOpenRow] = useState(null);
	const choice = useMemo(
		() => ({
			view,
			status,
			maxRent,
		}),
		[view, status, maxRent],
	);
	const handle_submit = (event) => {
		event.preventDefault();
		const nextFolder = normalize_folder_path(folderDraft);
		if (nextFolder === null) {
			setFolderError("Type a folder path that starts with /, for example /flats.");
			return;
		}
		const nextMaxRent = maxRentDraft.trim() === "" ? null : Number(maxRentDraft);
		setFolderError(null);
		setFolder(nextFolder);
		setFolderDraft(nextFolder);
		setMaxRent(nextMaxRent !== null && Number.isFinite(nextMaxRent) && nextMaxRent >= 0 ? nextMaxRent : null);
		save_folder(nextFolder);
	};
	const handle_close_details = useCallback(() => {
		const nodeId = openRow?.nodeId;
		setOpenRow(null);
		if (nodeId !== void 0) setTimeout(() => document.getElementById(`flat-row-${nodeId}`)?.focus(), 0);
	}, [openRow]);
	return /* @__PURE__ */ createVNode("div", {
		className: "flats",
		children: [
			/* @__PURE__ */ createVNode("div", {
				hidden: openRow !== null,
				children: [
					/* @__PURE__ */ createVNode("header", {
						className: "flats-header",
						children: /* @__PURE__ */ createVNode("h1", { children: "Flats" }),
					}),
					/* @__PURE__ */ createVNode("form", {
						className: "flats-controls",
						onSubmit: handle_submit,
						children: [
							/* @__PURE__ */ createVNode("label", {
								className: "field",
								children: [
									/* @__PURE__ */ createVNode("span", {
										className: "field-label",
										children: "Folder",
									}),
									/* @__PURE__ */ createVNode("input", {
										className: "input",
										type: "text",
										value: folderDraft,
										spellCheck: false,
										autoComplete: "off",
										"aria-invalid": folderError !== null,
										onInput: (event) => setFolderDraft(event.currentTarget.value),
									}),
								],
							}),
							/* @__PURE__ */ createVNode("label", {
								className: "field",
								children: [
									/* @__PURE__ */ createVNode("span", {
										className: "field-label",
										children: "View",
									}),
									/* @__PURE__ */ createVNode("select", {
										className: "input",
										value: view,
										onChange: (event) => setView(event.currentTarget.value),
										children: VIEWS.map((option) =>
											/* @__PURE__ */ createVNode(
												"option",
												{
													value: option.id,
													children: option.label,
												},
												option.id,
											),
										),
									}),
								],
							}),
							view === "status"
								? /* @__PURE__ */ createVNode("label", {
										className: "field",
										children: [
											/* @__PURE__ */ createVNode("span", {
												className: "field-label",
												children: "Status",
											}),
											/* @__PURE__ */ createVNode("select", {
												className: "input",
												value: status,
												onChange: (event) => setStatus(event.currentTarget.value),
												children: FLAT_STATUSES.map((option) =>
													/* @__PURE__ */ createVNode(
														"option",
														{
															value: option,
															children: option,
														},
														option,
													),
												),
											}),
										],
									})
								: null,
							view === "cheapest"
								? /* @__PURE__ */ createVNode("label", {
										className: "field",
										children: [
											/* @__PURE__ */ createVNode("span", {
												className: "field-label",
												children: "Max warm rent (€)",
											}),
											/* @__PURE__ */ createVNode("input", {
												className: "input",
												type: "number",
												min: 0,
												inputMode: "numeric",
												value: maxRentDraft,
												onInput: (event) => setMaxRentDraft(event.currentTarget.value),
											}),
										],
									})
								: null,
							/* @__PURE__ */ createVNode("button", {
								className: "button",
								type: "submit",
								children: "Show",
							}),
						],
					}),
					folderError !== null
						? /* @__PURE__ */ createVNode("div", {
								className: "flats-status is-error",
								role: "alert",
								children: folderError,
							})
						: null,
					/* @__PURE__ */ createVNode(
						FlatTable,
						{
							client: props.client,
							folder,
							choice,
							onOpen: setOpenRow,
						},
						JSON.stringify([folder, choice]),
					),
				],
			}),
			openRow !== null
				? /* @__PURE__ */ createVNode(
						FlatDetails,
						{
							client: props.client,
							media,
							row: openRow,
							onClose: handle_close_details,
						},
						openRow.nodeId,
					)
				: null,
		],
	});
}
function FlatTable(props) {
	const list = useMemo(
		() => create_flat_list(props.client, props.folder, props.choice),
		[props.client, props.folder, props.choice],
	);
	const [rows, setRows] = useState([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const loadingRef = useRef(false);
	const load_more = useCallback(async () => {
		if (loadingRef.current) return;
		loadingRef.current = true;
		setLoading(true);
		setError(null);
		const result = await list.load_next();
		if (result.rows.length > 0) setRows((previous) => [...previous, ...result.rows]);
		setError(result.errorMessage);
		setHasMore(list.has_more());
		loadingRef.current = false;
		setLoading(false);
	}, [list]);
	useEffect(() => {
		load_more();
	}, [load_more]);
	return /* @__PURE__ */ createVNode("div", {
		className: "flats-list",
		children: [
			rows.length > 0
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-table-wrap",
						role: "region",
						"aria-label": "Flats table",
						tabIndex: 0,
						children: /* @__PURE__ */ createVNode("table", {
							className: "flats-table",
							children: [
								/* @__PURE__ */ createVNode("thead", {
									children: /* @__PURE__ */ createVNode("tr", {
										children: [
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Title",
											}),
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Warm rent",
											}),
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Size",
											}),
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Rooms",
											}),
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Bike",
											}),
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Posted",
											}),
											/* @__PURE__ */ createVNode("th", {
												scope: "col",
												children: "Status",
											}),
										],
									}),
								}),
								/* @__PURE__ */ createVNode("tbody", {
									children: rows.map((row) =>
										/* @__PURE__ */ createVNode(
											"tr",
											{
												children: [
													/* @__PURE__ */ createVNode("th", {
														scope: "row",
														children: /* @__PURE__ */ createVNode("button", {
															id: `flat-row-${row.nodeId}`,
															className: "flats-open",
															type: "button",
															onClick: () => props.onOpen(row),
															children: row_title(row),
														}),
													}),
													/* @__PURE__ */ createVNode("td", { children: format_rent(row) }),
													/* @__PURE__ */ createVNode("td", {
														children: format_number(row_number(row, "frontmatter.sizeM2"), "m²"),
													}),
													/* @__PURE__ */ createVNode("td", { children: row_number(row, "frontmatter.rooms") ?? "—" }),
													/* @__PURE__ */ createVNode("td", {
														children: format_number(row_number(row, "frontmatter.bikeMin"), "min"),
													}),
													/* @__PURE__ */ createVNode("td", {
														children: format_date(row_field(row, "frontmatter.postedAt")),
													}),
													/* @__PURE__ */ createVNode("td", { children: row_field(row, "frontmatter.status") ?? "—" }),
												],
											},
											row.nodeId,
										),
									),
								}),
							],
						}),
					})
				: null,
			loading
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-status",
						role: "status",
						"aria-live": "polite",
						children: "Loading…",
					})
				: null,
			error !== null
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-status is-error",
						role: "alert",
						children: [
							/* @__PURE__ */ createVNode("span", { children: error }),
							/* @__PURE__ */ createVNode("button", {
								className: "button",
								type: "button",
								onClick: () => void load_more(),
								children: "Retry",
							}),
						],
					})
				: null,
			!loading && error === null && !hasMore && rows.length === 0
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-status",
						children: "No flats in this view.",
					})
				: null,
			hasMore && !loading && error === null
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-more",
						children: /* @__PURE__ */ createVNode("button", {
							className: "button",
							type: "button",
							onClick: () => void load_more(),
							children: "Load more",
						}),
					})
				: null,
			rows.length > 0
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-count",
						children: [rows.length, " flat", rows.length === 1 ? "" : "s"],
					})
				: null,
		],
	});
}
/** The facts the details show, in this order. A flat file without a key skips that line. */
var FACT_LINES = [
	{
		key: "kind",
		label: "Kind",
	},
	{
		key: "status",
		label: "Status",
	},
	{
		key: "ideal",
		label: "Ideal",
	},
	{
		key: "rentWarm",
		label: "Warm rent",
		unit: "€",
	},
	{
		key: "rentWarmEstimated",
		label: "Warm rent is estimated",
	},
	{
		key: "rentCold",
		label: "Cold rent",
		unit: "€",
	},
	{
		key: "sizeM2",
		label: "Size",
		unit: "m²",
	},
	{
		key: "rooms",
		label: "Rooms",
	},
	{
		key: "floor",
		label: "Floor",
	},
	{
		key: "address",
		label: "Address",
	},
	{
		key: "postcode",
		label: "Postcode",
	},
	{
		key: "availableFrom",
		label: "Available from",
	},
	{
		key: "availableTo",
		label: "Available to",
	},
	{
		key: "stayMonths",
		label: "Stay",
		unit: "months",
	},
	{
		key: "bikeMin",
		label: "By bike",
		unit: "min",
	},
	{
		key: "walkMin",
		label: "On foot",
		unit: "min",
	},
	{
		key: "distanceKm",
		label: "Distance",
		unit: "km",
	},
	{
		key: "postedAt",
		label: "Posted",
	},
	{
		key: "firstSeenAt",
		label: "First seen",
	},
	{
		key: "flags",
		label: "Flags",
	},
	{
		key: "idealMisses",
		label: "Not ideal because",
	},
	{
		key: "source",
		label: "Source",
	},
];
function format_fact(line, facts) {
	const value = facts.get(line.key);
	if (value === void 0) return null;
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : null;
	if (typeof value === "number") return format_number(value, line.unit ?? "").trim();
	if (line.key === "postedAt" || line.key === "firstSeenAt") return format_date(value);
	return value;
}
function FlatDetails(props) {
	const { client, row } = props;
	const [state, setState] = useState({ step: "loading" });
	const [photos, setPhotos] = useState([]);
	const [photosError, setPhotosError] = useState(null);
	const [copyNote, setCopyNote] = useState(null);
	const [attempt, setAttempt] = useState(0);
	const backRef = useRef(null);
	useEffect(() => {
		backRef.current?.focus();
	}, []);
	useEffect(() => {
		let cancelled = false;
		setState({ step: "loading" });
		setPhotosError(null);
		read_flat_text(client, row.path).then(
			(text) => {
				if (!cancelled)
					setState({
						step: "ready",
						...parse_flat_file(text),
					});
			},
			(error) => {
				if (!cancelled)
					setState({
						step: "error",
						message: get_error_message(error),
					});
			},
		);
		list_flat_photos(client, row.path).then(
			(items) => {
				if (!cancelled) setPhotos(items);
			},
			(error) => {
				if (!cancelled) setPhotosError(get_error_message(error));
			},
		);
		return () => {
			cancelled = true;
		};
	}, [client, row.path, attempt]);
	const adUrl = state.step === "ready" ? safe_ad_url(state.facts.get("url")) : null;
	const handle_copy = () => {
		if (adUrl === null) return;
		Promise.resolve()
			.then(() => navigator.clipboard.writeText(adUrl))
			.then(
				() => setCopyNote("Copied."),
				() => setCopyNote("Copy did not work. Select the address and copy it."),
			);
	};
	return /* @__PURE__ */ createVNode("article", {
		className: "flat",
		"aria-labelledby": "flat-title",
		children: [
			/* @__PURE__ */ createVNode("div", {
				className: "flat-topbar",
				children: /* @__PURE__ */ createVNode("button", {
					ref: backRef,
					className: "button",
					type: "button",
					onClick: props.onClose,
					children: "← Back to flats",
				}),
			}),
			/* @__PURE__ */ createVNode("h1", {
				id: "flat-title",
				children: row_title(row),
			}),
			/* @__PURE__ */ createVNode("p", {
				className: "flat-path",
				children: row.path,
			}),
			state.step === "loading"
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-status",
						role: "status",
						"aria-live": "polite",
						children: "Loading…",
					})
				: null,
			state.step === "error"
				? /* @__PURE__ */ createVNode("div", {
						className: "flats-status is-error",
						role: "alert",
						children: [
							/* @__PURE__ */ createVNode("span", { children: state.message }),
							/* @__PURE__ */ createVNode("button", {
								className: "button",
								type: "button",
								onClick: () => setAttempt((value) => value + 1),
								children: "Retry",
							}),
						],
					})
				: null,
			state.step === "ready"
				? /* @__PURE__ */ createVNode(Fragment, {
						children: [
							/* @__PURE__ */ createVNode("dl", {
								className: "flat-facts",
								children: FACT_LINES.map((line) => {
									const text = format_fact(line, state.facts);
									return text === null
										? null
										: /* @__PURE__ */ createVNode(
												"div",
												{
													className: "flat-fact",
													children: [
														/* @__PURE__ */ createVNode("dt", { children: line.label }),
														/* @__PURE__ */ createVNode("dd", { children: text }),
													],
												},
												line.key,
											);
								}),
							}),
							adUrl !== null
								? /* @__PURE__ */ createVNode("div", {
										className: "flat-url",
										children: [
											/* @__PURE__ */ createVNode("h2", { children: "Ad address" }),
											/* @__PURE__ */ createVNode("p", {
												className: "flat-url-text",
												children: adUrl,
											}),
											/* @__PURE__ */ createVNode("button", {
												className: "button",
												type: "button",
												onClick: handle_copy,
												children: "Copy address",
											}),
											/* @__PURE__ */ createVNode("span", {
												className: "flat-url-note",
												role: "status",
												"aria-live": "polite",
												children: copyNote,
											}),
										],
									})
								: null,
							state.description !== ""
								? /* @__PURE__ */ createVNode("div", {
										className: "flat-description",
										children: [
											/* @__PURE__ */ createVNode("h2", { children: "Description" }),
											/* @__PURE__ */ createVNode("p", { children: state.description }),
										],
									})
								: null,
						],
					})
				: null,
			photos.length > 0
				? /* @__PURE__ */ createVNode("div", {
						className: "flat-photos",
						children: [
							/* @__PURE__ */ createVNode("h2", { children: "Photos" }),
							/* @__PURE__ */ createVNode("ul", {
								children: photos.map((photo) =>
									/* @__PURE__ */ createVNode(
										"li",
										{
											children: /* @__PURE__ */ createVNode(FlatPhotoTile, {
												media: props.media,
												photo,
											}),
										},
										photo.nodeId,
									),
								),
							}),
						],
					})
				: null,
			photosError !== null
				? /* @__PURE__ */ createVNode("p", {
						className: "flat-photos-note",
						children: ["Photos could not load: ", photosError],
					})
				: null,
		],
	});
}
function FlatPhotoTile(props) {
	const { media, photo } = props;
	const [url, setUrl] = useState(null);
	const [failed, setFailed] = useState(false);
	const renewedRef = useRef(false);
	const request_url = useCallback(
		(fresh) => {
			(fresh ? media.get_fresh_url(photo.nodeId) : media.get_url(photo.nodeId)).then(
				(mediaUrl) => setUrl(mediaUrl.url),
				() => setFailed(true),
			);
		},
		[media, photo.nodeId],
	);
	useEffect(() => {
		request_url(false);
	}, [request_url]);
	const handle_error = () => {
		if (renewedRef.current) {
			setFailed(true);
			return;
		}
		renewedRef.current = true;
		request_url(true);
	};
	if (failed)
		return /* @__PURE__ */ createVNode("span", {
			className: "flat-photo is-failed",
			children: [photo.name, " could not load."],
		});
	return url === null
		? /* @__PURE__ */ createVNode("span", {
				className: "flat-photo is-loading",
				role: "status",
				children: ["Loading ", photo.name, "…"],
			})
		: /* @__PURE__ */ createVNode("img", {
				className: "flat-photo",
				src: url,
				alt: photo.name,
				loading: "lazy",
				onError: handle_error,
			});
}
// src/main.tsx
function BootScreen(props) {
	return /* @__PURE__ */ createVNode("div", {
		className: props.isError ? "boot-screen is-error" : "boot-screen",
		role: props.isError ? "alert" : "status",
		"aria-live": props.isError ? void 0 : "polite",
		children: props.message,
	});
}
var container = document.getElementById("root");
if (!container) throw new Error("index.html is missing the #root element");
var root = createRoot(container);
root.render(/* @__PURE__ */ createVNode(BootScreen, { message: "Connecting…" }));
bonobo_connect().then(
	(client) => {
		if (client.context.kind === "page") document.title = client.context.pageTitle;
		root.render(/* @__PURE__ */ createVNode(App, { client }));
	},
	(error) => {
		root.render(
			/* @__PURE__ */ createVNode(BootScreen, {
				message: error instanceof Error ? error.message : String(error),
				isError: true,
			}),
		);
	},
);
