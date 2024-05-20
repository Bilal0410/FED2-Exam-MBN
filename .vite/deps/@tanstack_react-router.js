import {
  __publicField,
  __toESM,
  require_react
} from "./chunk-2DBTUXXQ.js";

// node_modules/@tanstack/history/build/esm/index.js
var pushStateEvent = "pushstate";
var popStateEvent = "popstate";
var beforeUnloadEvent = "beforeunload";
var beforeUnloadListener = (event) => {
  event.preventDefault();
  return event.returnValue = "";
};
var stopBlocking = () => {
  removeEventListener(beforeUnloadEvent, beforeUnloadListener, {
    capture: true
  });
};
function createHistory(opts) {
  let location = opts.getLocation();
  let subscribers = /* @__PURE__ */ new Set();
  let blockers = [];
  let queue = [];
  const onUpdate = () => {
    location = opts.getLocation();
    subscribers.forEach((subscriber) => subscriber());
  };
  const tryUnblock = () => {
    var _a, _b;
    if (blockers.length) {
      (_a = blockers[0]) == null ? void 0 : _a.call(blockers, tryUnblock, () => {
        blockers = [];
        stopBlocking();
      });
      return;
    }
    while (queue.length) {
      (_b = queue.shift()) == null ? void 0 : _b();
    }
  };
  const queueTask = (task) => {
    queue.push(task);
    tryUnblock();
  };
  return {
    get location() {
      return location;
    },
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    push: (path, state) => {
      state = assignKey(state);
      queueTask(() => {
        opts.pushState(path, state, onUpdate);
      });
    },
    replace: (path, state) => {
      state = assignKey(state);
      queueTask(() => {
        opts.replaceState(path, state, onUpdate);
      });
    },
    go: (index) => {
      queueTask(() => {
        opts.go(index);
      });
    },
    back: () => {
      queueTask(() => {
        opts.back();
      });
    },
    forward: () => {
      queueTask(() => {
        opts.forward();
      });
    },
    createHref: (str) => opts.createHref(str),
    block: (cb) => {
      blockers.push(cb);
      if (blockers.length === 1) {
        addEventListener(beforeUnloadEvent, beforeUnloadListener, {
          capture: true
        });
      }
      return () => {
        blockers = blockers.filter((b) => b !== cb);
        if (!blockers.length) {
          stopBlocking();
        }
      };
    },
    flush: () => {
      var _a;
      return (_a = opts.flush) == null ? void 0 : _a.call(opts);
    },
    destroy: () => {
      var _a;
      return (_a = opts.destroy) == null ? void 0 : _a.call(opts);
    },
    notify: onUpdate
  };
}
function assignKey(state) {
  if (!state) {
    state = {};
  }
  return {
    ...state,
    key: createRandomKey()
  };
}
function createBrowserHistory(opts) {
  const getHref = (opts == null ? void 0 : opts.getHref) ?? (() => `${window.location.pathname}${window.location.search}${window.location.hash}`);
  const createHref = (opts == null ? void 0 : opts.createHref) ?? ((path) => path);
  let currentLocation = parseLocation(getHref(), window.history.state);
  const getLocation = () => currentLocation;
  let next;
  let tracking = true;
  let scheduled;
  const untrack = (fn) => {
    tracking = false;
    fn();
    tracking = true;
  };
  const flush = () => {
    untrack(() => {
      if (!next)
        return;
      window.history[next.isPush ? "pushState" : "replaceState"](next.state, "", next.href);
      next = void 0;
      scheduled = void 0;
    });
  };
  const queueHistoryAction = (type, path, state, onUpdate) => {
    const href = createHref(path);
    currentLocation = parseLocation(href, state);
    next = {
      href,
      state,
      isPush: (next == null ? void 0 : next.isPush) || type === "push"
    };
    onUpdate();
    if (!scheduled) {
      scheduled = Promise.resolve().then(() => flush());
    }
  };
  const onPushPop = () => {
    currentLocation = parseLocation(getHref(), window.history.state);
    history.notify();
  };
  var originalPushState = window.history.pushState;
  var originalReplaceState = window.history.replaceState;
  const history = createHistory({
    getLocation,
    pushState: (path, state, onUpdate) => queueHistoryAction("push", path, state, onUpdate),
    replaceState: (path, state, onUpdate) => queueHistoryAction("replace", path, state, onUpdate),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    go: (n) => window.history.go(n),
    createHref: (path) => createHref(path),
    flush,
    destroy: () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener(pushStateEvent, onPushPop);
      window.removeEventListener(popStateEvent, onPushPop);
    }
  });
  window.addEventListener(pushStateEvent, onPushPop);
  window.addEventListener(popStateEvent, onPushPop);
  window.history.pushState = function() {
    let res = originalPushState.apply(window.history, arguments);
    if (tracking)
      history.notify();
    return res;
  };
  window.history.replaceState = function() {
    let res = originalReplaceState.apply(window.history, arguments);
    if (tracking)
      history.notify();
    return res;
  };
  return history;
}
function createHashHistory() {
  return createBrowserHistory({
    getHref: () => window.location.hash.substring(1),
    createHref: (path) => `#${path}`
  });
}
function createMemoryHistory(opts = {
  initialEntries: ["/"]
}) {
  const entries = opts.initialEntries;
  let index = opts.initialIndex ?? entries.length - 1;
  let currentState = {
    key: createRandomKey()
  };
  const getLocation = () => parseLocation(entries[index], currentState);
  return createHistory({
    getLocation,
    pushState: (path, state) => {
      currentState = state;
      entries.push(path);
      index++;
    },
    replaceState: (path, state) => {
      currentState = state;
      entries[index] = path;
    },
    back: () => {
      index--;
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1);
    },
    go: (n) => window.history.go(n),
    createHref: (path) => path
  });
}
function parseLocation(href, state) {
  let hashIndex = href.indexOf("#");
  let searchIndex = href.indexOf("?");
  return {
    href,
    pathname: href.substring(0, hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : href.length),
    hash: hashIndex > -1 ? href.substring(hashIndex) : "",
    search: searchIndex > -1 ? href.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state: state || {}
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}

// node_modules/tiny-invariant/dist/esm/tiny-invariant.js
var isProduction = false;
var prefix = "Invariant failed";
function invariant(condition, message) {
  if (condition) {
    return;
  }
  if (isProduction) {
    throw new Error(prefix);
  }
  var provided = typeof message === "function" ? message() : message;
  var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
  throw new Error(value);
}

// node_modules/tiny-warning/dist/tiny-warning.esm.js
var isProduction2 = false;
function warning(condition, message) {
  if (!isProduction2) {
    if (condition) {
      return;
    }
    var text = "Warning: " + message;
    if (typeof console !== "undefined") {
      console.warn(text);
    }
    try {
      throw Error(text);
    } catch (x) {
    }
  }
}
var tiny_warning_esm_default = warning;

// node_modules/@tanstack/react-router/build/esm/index.js
var React = __toESM(require_react());
function CatchBoundary(props) {
  const errorComponent = props.errorComponent ?? ErrorComponent;
  return React.createElement(CatchBoundaryImpl, {
    resetKey: props.resetKey,
    onCatch: props.onCatch,
    children: ({
      error
    }) => {
      if (error) {
        return React.createElement(errorComponent, {
          error
        });
      }
      return props.children;
    }
  });
}
var CatchBoundaryImpl = class extends React.Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", {
      error: null
    });
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({
        error: null
      });
    }
  }
  componentDidCatch(error) {
    var _a, _b;
    console.error(error);
    (_b = (_a = this.props).onCatch) == null ? void 0 : _b.call(_a, error);
  }
  render() {
    return this.props.children(this.state);
  }
};
function ErrorComponent({
  error
}) {
  const [show, setShow] = React.useState(true);
  return React.createElement("div", {
    style: {
      padding: ".5rem",
      maxWidth: "100%"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: ".5rem"
    }
  }, React.createElement("strong", {
    style: {
      fontSize: "1rem"
    }
  }, "Something went wrong!"), React.createElement("button", {
    style: {
      appearance: "none",
      fontSize: ".6em",
      border: "1px solid currentColor",
      padding: ".1rem .2rem",
      fontWeight: "bold",
      borderRadius: ".25rem"
    },
    onClick: () => setShow((d) => !d)
  }, show ? "Hide Error" : "Show Error")), React.createElement("div", {
    style: {
      height: ".25rem"
    }
  }), show ? React.createElement("div", null, React.createElement("pre", {
    style: {
      fontSize: ".7em",
      border: "1px solid red",
      borderRadius: ".25rem",
      padding: ".3rem",
      color: "red",
      overflow: "auto"
    }
  }, error.message ? React.createElement("code", null, error.message) : null)) : null);
}
var isServer = typeof document === "undefined";
function last(arr) {
  return arr[arr.length - 1];
}
function isFunction(d) {
  return typeof d === "function";
}
function functionalUpdate(updater, previous) {
  if (isFunction(updater)) {
    return updater(previous);
  }
  return updater;
}
function pick(parent, keys) {
  return keys.reduce((obj, key) => {
    obj[key] = parent[key];
    return obj;
  }, {});
}
function replaceEqualDeep(prev, _next) {
  if (prev === _next) {
    return prev;
  }
  const next = _next;
  const array = Array.isArray(prev) && Array.isArray(next);
  if (array || isPlainObject(prev) && isPlainObject(next)) {
    const prevSize = array ? prev.length : Object.keys(prev).length;
    const nextItems = array ? next : Object.keys(next);
    const nextSize = nextItems.length;
    const copy = array ? [] : {};
    let equalItems = 0;
    for (let i = 0; i < nextSize; i++) {
      const key = array ? i : nextItems[i];
      copy[key] = replaceEqualDeep(prev[key], next[key]);
      if (copy[key] === prev[key]) {
        equalItems++;
      }
    }
    return prevSize === nextSize && equalItems === prevSize ? prev : copy;
  }
  return next;
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }
  const ctor = o.constructor;
  if (typeof ctor === "undefined") {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    return !Object.keys(b).some((key) => !partialDeepEqual(a[key], b[key]));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return !(a.length !== b.length || a.some((item, index) => !partialDeepEqual(item, b[index])));
  }
  return false;
}
function useStableCallback(fn) {
  const fnRef = React.useRef(fn);
  fnRef.current = fn;
  const ref = React.useRef((...args) => fnRef.current(...args));
  return ref.current;
}
function shallow(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}
function useRouteContext(opts) {
  return useMatch({
    ...opts,
    select: (match) => (opts == null ? void 0 : opts.select) ? opts.select(match.context) : match.context
  });
}
var useLayoutEffect$1 = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
function joinPaths(paths) {
  return cleanPath(paths.filter(Boolean).join("/"));
}
function cleanPath(path) {
  return path.replace(/\/{2,}/g, "/");
}
function trimPathLeft(path) {
  return path === "/" ? path : path.replace(/^\/{1,}/, "");
}
function trimPathRight(path) {
  return path === "/" ? path : path.replace(/\/{1,}$/, "");
}
function trimPath(path) {
  return trimPathRight(trimPathLeft(path));
}
function resolvePath(basepath, base, to) {
  base = base.replace(new RegExp(`^${basepath}`), "/");
  to = to.replace(new RegExp(`^${basepath}`), "/");
  let baseSegments = parsePathname(base);
  const toSegments = parsePathname(to);
  toSegments.forEach((toSegment, index) => {
    var _a;
    if (toSegment.value === "/") {
      if (!index) {
        baseSegments = [toSegment];
      } else if (index === toSegments.length - 1) {
        baseSegments.push(toSegment);
      } else
        ;
    } else if (toSegment.value === "..") {
      if (baseSegments.length > 1 && ((_a = last(baseSegments)) == null ? void 0 : _a.value) === "/") {
        baseSegments.pop();
      }
      baseSegments.pop();
    } else if (toSegment.value === ".") {
      return;
    } else {
      baseSegments.push(toSegment);
    }
  });
  const joined = joinPaths([basepath, ...baseSegments.map((d) => d.value)]);
  return cleanPath(joined);
}
function parsePathname(pathname) {
  if (!pathname) {
    return [];
  }
  pathname = cleanPath(pathname);
  const segments = [];
  if (pathname.slice(0, 1) === "/") {
    pathname = pathname.substring(1);
    segments.push({
      type: "pathname",
      value: "/"
    });
  }
  if (!pathname) {
    return segments;
  }
  const split = pathname.split("/").filter(Boolean);
  segments.push(...split.map((part) => {
    if (part === "$" || part === "*") {
      return {
        type: "wildcard",
        value: part
      };
    }
    if (part.charAt(0) === "$") {
      return {
        type: "param",
        value: part
      };
    }
    return {
      type: "pathname",
      value: part
    };
  }));
  if (pathname.slice(-1) === "/") {
    pathname = pathname.substring(1);
    segments.push({
      type: "pathname",
      value: "/"
    });
  }
  return segments;
}
function interpolatePath(path, params, leaveWildcards = false) {
  const interpolatedPathSegments = parsePathname(path);
  return joinPaths(interpolatedPathSegments.map((segment) => {
    if (segment.type === "wildcard") {
      const value = params[segment.value];
      if (leaveWildcards)
        return `${segment.value}${value ?? ""}`;
      return value;
    }
    if (segment.type === "param") {
      return params[segment.value.substring(1)] ?? "";
    }
    return segment.value;
  }));
}
function matchPathname(basepath, currentPathname, matchLocation) {
  const pathParams = matchByPath(basepath, currentPathname, matchLocation);
  if (matchLocation.to && !pathParams) {
    return;
  }
  return pathParams ?? {};
}
function matchByPath(basepath, from, matchLocation) {
  from = basepath != "/" ? from.substring(basepath.length) : from;
  const to = `${matchLocation.to ?? "$"}`;
  const baseSegments = parsePathname(from);
  const routeSegments = parsePathname(to);
  if (!from.startsWith("/")) {
    baseSegments.unshift({
      type: "pathname",
      value: "/"
    });
  }
  if (!to.startsWith("/")) {
    routeSegments.unshift({
      type: "pathname",
      value: "/"
    });
  }
  const params = {};
  let isMatch = (() => {
    for (let i = 0; i < Math.max(baseSegments.length, routeSegments.length); i++) {
      const baseSegment = baseSegments[i];
      const routeSegment = routeSegments[i];
      const isLastBaseSegment = i >= baseSegments.length - 1;
      const isLastRouteSegment = i >= routeSegments.length - 1;
      if (routeSegment) {
        if (routeSegment.type === "wildcard") {
          if (baseSegment == null ? void 0 : baseSegment.value) {
            params["*"] = joinPaths(baseSegments.slice(i).map((d) => d.value));
            return true;
          }
          return false;
        }
        if (routeSegment.type === "pathname") {
          if (routeSegment.value === "/" && !(baseSegment == null ? void 0 : baseSegment.value)) {
            return true;
          }
          if (baseSegment) {
            if (matchLocation.caseSensitive) {
              if (routeSegment.value !== baseSegment.value) {
                return false;
              }
            } else if (routeSegment.value.toLowerCase() !== baseSegment.value.toLowerCase()) {
              return false;
            }
          }
        }
        if (!baseSegment) {
          return false;
        }
        if (routeSegment.type === "param") {
          if ((baseSegment == null ? void 0 : baseSegment.value) === "/") {
            return false;
          }
          if (baseSegment.value.charAt(0) !== "$") {
            params[routeSegment.value.substring(1)] = baseSegment.value;
          }
        }
      }
      if (!isLastBaseSegment && isLastRouteSegment) {
        return !!matchLocation.fuzzy;
      }
    }
    return true;
  })();
  return isMatch ? params : void 0;
}
function redirect(opts) {
  opts.isRedirect = true;
  return opts;
}
function isRedirect(obj) {
  return !!(obj == null ? void 0 : obj.isRedirect);
}
function encode(obj, pfx) {
  var k, i, tmp, str = "";
  for (k in obj) {
    if ((tmp = obj[k]) !== void 0) {
      if (Array.isArray(tmp)) {
        for (i = 0; i < tmp.length; i++) {
          str && (str += "&");
          str += encodeURIComponent(k) + "=" + encodeURIComponent(tmp[i]);
        }
      } else {
        str && (str += "&");
        str += encodeURIComponent(k) + "=" + encodeURIComponent(tmp);
      }
    }
  }
  return (pfx || "") + str;
}
function toValue(mix) {
  if (!mix)
    return "";
  var str = decodeURIComponent(mix);
  if (str === "false")
    return false;
  if (str === "true")
    return true;
  return +str * 0 === 0 && +str + "" === str ? +str : str;
}
function decode(str) {
  var tmp, k, out = {}, arr = str.split("&");
  while (tmp = arr.shift()) {
    tmp = tmp.split("=");
    k = tmp.shift();
    if (out[k] !== void 0) {
      out[k] = [].concat(out[k], toValue(tmp.shift()));
    } else {
      out[k] = toValue(tmp.shift());
    }
  }
  return out;
}
var defaultParseSearch = parseSearchWith(JSON.parse);
var defaultStringifySearch = stringifySearchWith(JSON.stringify, JSON.parse);
function parseSearchWith(parser) {
  return (searchStr) => {
    if (searchStr.substring(0, 1) === "?") {
      searchStr = searchStr.substring(1);
    }
    let query = decode(searchStr);
    for (let key in query) {
      const value = query[key];
      if (typeof value === "string") {
        try {
          query[key] = parser(value);
        } catch (err) {
        }
      }
    }
    return query;
  };
}
function stringifySearchWith(stringify, parser) {
  function stringifyValue(val) {
    if (typeof val === "object" && val !== null) {
      try {
        return stringify(val);
      } catch (err) {
      }
    } else if (typeof val === "string" && typeof parser === "function") {
      try {
        parser(val);
        return stringify(val);
      } catch (err) {
      }
    }
    return val;
  }
  return (search) => {
    search = {
      ...search
    };
    if (search) {
      Object.keys(search).forEach((key) => {
        const val = search[key];
        if (typeof val === "undefined" || val === void 0) {
          delete search[key];
        } else {
          search[key] = stringifyValue(val);
        }
      });
    }
    const searchStr = encode(search).toString();
    return searchStr ? `?${searchStr}` : "";
  };
}
var componentTypes = ["component", "errorComponent", "pendingComponent"];
var Router = class {
  // dehydratedData?: TDehydrated
  // resetNextScroll = false
  // tempLocationKey = `${Math.round(Math.random() * 10000000)}`
  constructor(options) {
    __publicField(this, "subscribers", /* @__PURE__ */ new Set());
    __publicField(this, "subscribe", (eventType, fn) => {
      const listener = {
        eventType,
        fn
      };
      this.subscribers.add(listener);
      return () => {
        this.subscribers.delete(listener);
      };
    });
    __publicField(this, "emit", (routerEvent) => {
      this.subscribers.forEach((listener) => {
        if (listener.eventType === routerEvent.type) {
          listener.fn(routerEvent);
        }
      });
    });
    this.options = {
      defaultPreloadDelay: 50,
      context: void 0,
      ...options,
      stringifySearch: (options == null ? void 0 : options.stringifySearch) ?? defaultStringifySearch,
      parseSearch: (options == null ? void 0 : options.parseSearch) ?? defaultParseSearch
    };
    this.routeTree = this.options.routeTree;
  }
  // dehydrate = (): DehydratedRouter => {
  //   return {
  //     state: {
  //       dehydratedMatches: state.matches.map((d) =>
  //         pick(d, ['fetchedAt', 'invalid', 'id', 'status', 'updatedAt']),
  //       ),
  //     },
  //   }
  // }
  // hydrate = async (__do_not_use_server_ctx?: HydrationCtx) => {
  //   let _ctx = __do_not_use_server_ctx
  //   // Client hydrates from window
  //   if (typeof document !== 'undefined') {
  //     _ctx = window.__TSR_DEHYDRATED__
  //   }
  //   invariant(
  //     _ctx,
  //     'Expected to find a __TSR_DEHYDRATED__ property on window... but we did not. Did you forget to render <DehydrateRouter /> in your app?',
  //   )
  //   const ctx = _ctx
  //   this.dehydratedData = ctx.payload as any
  //   this.options.hydrate?.(ctx.payload as any)
  //   const dehydratedState = ctx.router.state
  //   let matches = this.matchRoutes(
  //     state.location.pathname,
  //     state.location.search,
  //   ).map((match) => {
  //     const dehydratedMatch = dehydratedState.dehydratedMatches.find(
  //       (d) => d.id === match.id,
  //     )
  //     invariant(
  //       dehydratedMatch,
  //       `Could not find a client-side match for dehydrated match with id: ${match.id}!`,
  //     )
  //     if (dehydratedMatch) {
  //       return {
  //         ...match,
  //         ...dehydratedMatch,
  //       }
  //     }
  //     return match
  //   })
  //   this.setState((s) => {
  //     return {
  //       ...s,
  //       matches: dehydratedState.dehydratedMatches as any,
  //     }
  //   })
  // }
  // TODO:
  // injectedHtml: (string | (() => Promise<string> | string))[] = []
  // TODO:
  // injectHtml = async (html: string | (() => Promise<string> | string)) => {
  //   this.injectedHtml.push(html)
  // }
  // TODO:
  // dehydrateData = <T>(key: any, getData: T | (() => Promise<T> | T)) => {
  //   if (typeof document === 'undefined') {
  //     const strKey = typeof key === 'string' ? key : JSON.stringify(key)
  //     this.injectHtml(async () => {
  //       const id = `__TSR_DEHYDRATED__${strKey}`
  //       const data =
  //         typeof getData === 'function' ? await (getData as any)() : getData
  //       return `<script id='${id}' suppressHydrationWarning>window["__TSR_DEHYDRATED__${escapeJSON(
  //         strKey,
  //       )}"] = ${JSON.stringify(data)}
  //       ;(() => {
  //         var el = document.getElementById('${id}')
  //         el.parentElement.removeChild(el)
  //       })()
  //       <\/script>`
  //     })
  //     return () => this.hydrateData<T>(key)
  //   }
  //   return () => undefined
  // }
  // hydrateData = <T = unknown>(key: any) => {
  //   if (typeof document !== 'undefined') {
  //     const strKey = typeof key === 'string' ? key : JSON.stringify(key)
  //     return window[`__TSR_DEHYDRATED__${strKey}` as any] as T
  //   }
  //   return undefined
  // }
  // resolveMatchPromise = (matchId: string, key: string, value: any) => {
  //   state.matches
  //     .find((d) => d.id === matchId)
  //     ?.__promisesByKey[key]?.resolve(value)
  // }
  // setRouteMatch = (
  //   id: string,
  //   pending: boolean,
  //   updater: NonNullableUpdater<RouteMatch<TRouteTree>>,
  // ) => {
  //   const key = pending ? 'pendingMatches' : 'matches'
  //   this.setState((prev) => {
  //     return {
  //       ...prev,
  //       [key]: prev[key].map((d) => {
  //         if (d.id === id) {
  //           return functionalUpdate(updater, d)
  //         }
  //         return d
  //       }),
  //     }
  //   })
  // }
  // setPendingRouteMatch = (
  //   id: string,
  //   updater: NonNullableUpdater<RouteMatch<TRouteTree>>,
  // ) => {
  //   this.setRouteMatch(id, true, updater)
  // }
};
function lazyFn(fn, key) {
  return async (...args) => {
    const imported = await fn();
    return imported[key || "default"](...args);
  };
}
var routerContext = React.createContext(null);
if (typeof document !== "undefined") {
  window.__TSR_ROUTER_CONTEXT__ = routerContext;
}
var preloadWarning = "Error preloading route! ☝️";
function isCtrlEvent(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
var SearchParamError = class extends Error {
};
var PathParamError = class extends Error {
};
function getInitialRouterState(location) {
  return {
    status: "idle",
    resolvedLocation: location,
    location,
    matches: [],
    pendingMatches: [],
    lastUpdated: Date.now()
  };
}
function RouterProvider({
  router,
  ...rest
}) {
  const options = {
    ...router.options,
    ...rest,
    context: {
      ...router.options.context,
      ...rest == null ? void 0 : rest.context
    }
  };
  const history = React.useState(() => options.history ?? createBrowserHistory())[0];
  const tempLocationKeyRef = React.useRef(`${Math.round(Math.random() * 1e7)}`);
  const resetNextScrollRef = React.useRef(true);
  const navigateTimeoutRef = React.useRef(null);
  const latestLoadPromiseRef = React.useRef(Promise.resolve());
  const checkLatest = (promise) => {
    return latestLoadPromiseRef.current !== promise ? latestLoadPromiseRef.current : void 0;
  };
  const parseLocation2 = useStableCallback((previousLocation) => {
    const parse = ({
      pathname,
      search,
      hash,
      state: state2
    }) => {
      const parsedSearch = options.parseSearch(search);
      return {
        pathname,
        searchStr: search,
        search: replaceEqualDeep(previousLocation == null ? void 0 : previousLocation.search, parsedSearch),
        hash: hash.split("#").reverse()[0] ?? "",
        href: `${pathname}${search}${hash}`,
        state: replaceEqualDeep(previousLocation == null ? void 0 : previousLocation.state, state2)
      };
    };
    const location = parse(history.location);
    let {
      __tempLocation,
      __tempKey
    } = location.state;
    if (__tempLocation && (!__tempKey || __tempKey === tempLocationKeyRef.current)) {
      const parsedTempLocation = parse(__tempLocation);
      parsedTempLocation.state.key = location.state.key;
      delete parsedTempLocation.state.__tempLocation;
      return {
        ...parsedTempLocation,
        maskedLocation: location
      };
    }
    return location;
  });
  const latestLocationRef = React.useRef(parseLocation2());
  const [preState, setState] = React.useState(() => getInitialRouterState(latestLocationRef.current));
  const [isTransitioning, startReactTransition] = React.useTransition();
  const pendingMatchesRef = React.useRef([]);
  const state = React.useMemo(() => ({
    ...preState,
    status: isTransitioning ? "pending" : "idle",
    location: isTransitioning ? latestLocationRef.current : preState.location,
    pendingMatches: pendingMatchesRef.current
  }), [preState, isTransitioning]);
  React.useLayoutEffect(() => {
    var _a;
    if (!isTransitioning && state.resolvedLocation !== state.location) {
      router.emit({
        type: "onResolved",
        fromLocation: state.resolvedLocation,
        toLocation: state.location,
        pathChanged: state.location.href !== ((_a = state.resolvedLocation) == null ? void 0 : _a.href)
      });
      pendingMatchesRef.current = [];
      setState((s) => ({
        ...s,
        resolvedLocation: s.location
      }));
    }
  });
  const basepath = `/${trimPath(options.basepath ?? "") ?? ""}`;
  const resolvePathWithBase = useStableCallback((from, path) => {
    return resolvePath(basepath, from, cleanPath(path));
  });
  const [routesById, routesByPath] = React.useMemo(() => {
    const routesById2 = {};
    const routesByPath2 = {};
    const recurseRoutes = (routes) => {
      routes.forEach((route, i) => {
        route.init({
          originalIndex: i
        });
        const existingRoute = routesById2[route.id];
        invariant(!existingRoute, `Duplicate routes found with id: ${String(route.id)}`);
        routesById2[route.id] = route;
        if (!route.isRoot && route.path) {
          const trimmedFullPath = trimPathRight(route.fullPath);
          if (!routesByPath2[trimmedFullPath] || route.fullPath.endsWith("/")) {
            routesByPath2[trimmedFullPath] = route;
          }
        }
        const children = route.children;
        if (children == null ? void 0 : children.length) {
          recurseRoutes(children);
        }
      });
    };
    recurseRoutes([router.routeTree]);
    return [routesById2, routesByPath2];
  }, []);
  const looseRoutesById = routesById;
  const flatRoutes = React.useMemo(() => Object.values(routesByPath).map((d, i) => {
    var _a;
    const trimmed = trimPath(d.fullPath);
    const parsed = parsePathname(trimmed);
    while (parsed.length > 1 && ((_a = parsed[0]) == null ? void 0 : _a.value) === "/") {
      parsed.shift();
    }
    const score = parsed.map((d2) => {
      if (d2.type === "param") {
        return 0.5;
      }
      if (d2.type === "wildcard") {
        return 0.25;
      }
      return 1;
    });
    return {
      child: d,
      trimmed,
      parsed,
      index: i,
      score
    };
  }).sort((a, b) => {
    let isIndex = a.trimmed === "/" ? 1 : b.trimmed === "/" ? -1 : 0;
    if (isIndex !== 0)
      return isIndex;
    const length = Math.min(a.score.length, b.score.length);
    if (a.score.length !== b.score.length) {
      return b.score.length - a.score.length;
    }
    for (let i = 0; i < length; i++) {
      if (a.score[i] !== b.score[i]) {
        return b.score[i] - a.score[i];
      }
    }
    for (let i = 0; i < length; i++) {
      if (a.parsed[i].value !== b.parsed[i].value) {
        return a.parsed[i].value > b.parsed[i].value ? 1 : -1;
      }
    }
    if (a.trimmed !== b.trimmed) {
      return a.trimmed > b.trimmed ? 1 : -1;
    }
    return a.index - b.index;
  }).map((d, i) => {
    d.child.rank = i;
    return d.child;
  }), [routesByPath]);
  const matchRoutes = useStableCallback((pathname, locationSearch, opts) => {
    let routeParams = {};
    let foundRoute = flatRoutes.find((route) => {
      const matchedParams = matchPathname(basepath, trimPathRight(pathname), {
        to: route.fullPath,
        caseSensitive: route.options.caseSensitive ?? options.caseSensitive,
        fuzzy: false
      });
      if (matchedParams) {
        routeParams = matchedParams;
        return true;
      }
      return false;
    });
    let routeCursor = foundRoute || routesById["__root__"];
    let matchedRoutes = [routeCursor];
    while (routeCursor == null ? void 0 : routeCursor.parentRoute) {
      routeCursor = routeCursor.parentRoute;
      if (routeCursor)
        matchedRoutes.unshift(routeCursor);
    }
    const parseErrors = matchedRoutes.map((route) => {
      let parsedParamsError;
      if (route.options.parseParams) {
        try {
          const parsedParams = route.options.parseParams(routeParams);
          Object.assign(routeParams, parsedParams);
        } catch (err) {
          parsedParamsError = new PathParamError(err.message, {
            cause: err
          });
          if (opts == null ? void 0 : opts.throwOnError) {
            throw parsedParamsError;
          }
          return parsedParamsError;
        }
      }
      return;
    });
    const matches = matchedRoutes.map((route, index) => {
      const interpolatedPath = interpolatePath(route.path, routeParams);
      const matchId = interpolatePath(route.id, routeParams, true);
      const existingMatch = getRouteMatch(state, matchId);
      if (existingMatch) {
        return {
          ...existingMatch
        };
      }
      const hasLoaders = !!(route.options.loader || componentTypes.some((d) => {
        var _a;
        return (_a = route.options[d]) == null ? void 0 : _a.preload;
      }));
      const routeMatch = {
        id: matchId,
        routeId: route.id,
        params: routeParams,
        pathname: joinPaths([basepath, interpolatedPath]),
        updatedAt: Date.now(),
        routeSearch: {},
        search: {},
        status: hasLoaders ? "pending" : "success",
        isFetching: false,
        invalid: false,
        error: void 0,
        paramsError: parseErrors[index],
        searchError: void 0,
        loadPromise: Promise.resolve(),
        context: void 0,
        abortController: new AbortController(),
        fetchedAt: 0
      };
      return routeMatch;
    });
    matches.forEach((match, i) => {
      const parentMatch = matches[i - 1];
      const route = looseRoutesById[match.routeId];
      const searchInfo = (() => {
        const parentSearchInfo = {
          search: (parentMatch == null ? void 0 : parentMatch.search) ?? locationSearch,
          routeSearch: (parentMatch == null ? void 0 : parentMatch.routeSearch) ?? locationSearch
        };
        try {
          const validator = typeof route.options.validateSearch === "object" ? route.options.validateSearch.parse : route.options.validateSearch;
          let routeSearch = (validator == null ? void 0 : validator(parentSearchInfo.search)) ?? {};
          let search = {
            ...parentSearchInfo.search,
            ...routeSearch
          };
          routeSearch = replaceEqualDeep(match.routeSearch, routeSearch);
          search = replaceEqualDeep(match.search, search);
          return {
            routeSearch,
            search,
            searchDidChange: match.routeSearch !== routeSearch
          };
        } catch (err) {
          match.searchError = new SearchParamError(err.message, {
            cause: err
          });
          if (opts == null ? void 0 : opts.throwOnError) {
            throw match.searchError;
          }
          return parentSearchInfo;
        }
      })();
      Object.assign(match, searchInfo);
    });
    return matches;
  });
  const cancelMatch = useStableCallback((id) => {
    var _a, _b;
    (_b = (_a = getRouteMatch(state, id)) == null ? void 0 : _a.abortController) == null ? void 0 : _b.abort();
  });
  const cancelMatches = useStableCallback((state2) => {
    state2.matches.forEach((match) => {
      cancelMatch(match.id);
    });
  });
  const buildLocation = useStableCallback((opts) => {
    const build = (dest = {}, matches) => {
      var _a;
      const from = latestLocationRef.current;
      const fromPathname = dest.from ?? from.pathname;
      let pathname = resolvePathWithBase(fromPathname, `${dest.to ?? ""}`);
      const fromMatches = matchRoutes(fromPathname, from.search);
      const stayingMatches = matches == null ? void 0 : matches.filter((d) => fromMatches == null ? void 0 : fromMatches.find((e) => e.routeId === d.routeId));
      const prevParams = {
        ...(_a = last(fromMatches)) == null ? void 0 : _a.params
      };
      let nextParams = (dest.params ?? true) === true ? prevParams : functionalUpdate(dest.params, prevParams);
      if (nextParams) {
        matches == null ? void 0 : matches.map((d) => looseRoutesById[d.routeId].options.stringifyParams).filter(Boolean).forEach((fn) => {
          nextParams = {
            ...nextParams,
            ...fn(nextParams)
          };
        });
      }
      pathname = interpolatePath(pathname, nextParams ?? {});
      const preSearchFilters = (stayingMatches == null ? void 0 : stayingMatches.map((match) => looseRoutesById[match.routeId].options.preSearchFilters ?? []).flat().filter(Boolean)) ?? [];
      const postSearchFilters = (stayingMatches == null ? void 0 : stayingMatches.map((match) => looseRoutesById[match.routeId].options.postSearchFilters ?? []).flat().filter(Boolean)) ?? [];
      const preFilteredSearch = (preSearchFilters == null ? void 0 : preSearchFilters.length) ? preSearchFilters == null ? void 0 : preSearchFilters.reduce((prev, next) => next(prev), from.search) : from.search;
      const destSearch = dest.search === true ? preFilteredSearch : dest.search ? functionalUpdate(dest.search, preFilteredSearch) ?? {} : (preSearchFilters == null ? void 0 : preSearchFilters.length) ? preFilteredSearch : {};
      const postFilteredSearch = (postSearchFilters == null ? void 0 : postSearchFilters.length) ? postSearchFilters.reduce((prev, next) => next(prev), destSearch) : destSearch;
      const search = replaceEqualDeep(from.search, postFilteredSearch);
      const searchStr = options.stringifySearch(search);
      const hash = dest.hash === true ? from.hash : dest.hash ? functionalUpdate(dest.hash, from.hash) : from.hash;
      const hashStr = hash ? `#${hash}` : "";
      let nextState = dest.state === true ? from.state : dest.state ? functionalUpdate(dest.state, from.state) : from.state;
      nextState = replaceEqualDeep(from.state, nextState);
      return {
        pathname,
        search,
        searchStr,
        state: nextState,
        hash,
        href: history.createHref(`${pathname}${searchStr}${hashStr}`),
        unmaskOnReload: dest.unmaskOnReload
      };
    };
    const buildWithMatches = (dest = {}, maskedDest) => {
      var _a;
      let next = build(dest);
      let maskedNext = maskedDest ? build(maskedDest) : void 0;
      if (!maskedNext) {
        let params = {};
        let foundMask = (_a = options.routeMasks) == null ? void 0 : _a.find((d) => {
          const match = matchPathname(basepath, next.pathname, {
            to: d.from,
            caseSensitive: false,
            fuzzy: false
          });
          if (match) {
            params = match;
            return true;
          }
          return false;
        });
        if (foundMask) {
          foundMask = {
            ...foundMask,
            from: interpolatePath(foundMask.from, params)
          };
          maskedDest = foundMask;
          maskedNext = build(maskedDest);
        }
      }
      const nextMatches = matchRoutes(next.pathname, next.search);
      const maskedMatches = maskedNext ? matchRoutes(maskedNext.pathname, maskedNext.search) : void 0;
      const maskedFinal = maskedNext ? build(maskedDest, maskedMatches) : void 0;
      const final = build(dest, nextMatches);
      if (maskedFinal) {
        final.maskedLocation = maskedFinal;
      }
      return final;
    };
    if (opts.mask) {
      return buildWithMatches(opts, {
        ...pick(opts, ["from"]),
        ...opts.mask
      });
    }
    return buildWithMatches(opts);
  });
  const commitLocation = useStableCallback(async ({
    startTransition,
    ...next
  }) => {
    if (navigateTimeoutRef.current)
      clearTimeout(navigateTimeoutRef.current);
    const isSameUrl = latestLocationRef.current.href === next.href;
    if (!isSameUrl || !next.replace) {
      let {
        maskedLocation,
        ...nextHistory
      } = next;
      if (maskedLocation) {
        nextHistory = {
          ...maskedLocation,
          state: {
            ...maskedLocation.state,
            __tempKey: void 0,
            __tempLocation: {
              ...nextHistory,
              search: nextHistory.searchStr,
              state: {
                ...nextHistory.state,
                __tempKey: void 0,
                __tempLocation: void 0,
                key: void 0
              }
            }
          }
        };
        if (nextHistory.unmaskOnReload ?? options.unmaskOnReload ?? false) {
          nextHistory.state.__tempKey = tempLocationKeyRef.current;
        }
      }
      const apply = () => {
        history[next.replace ? "replace" : "push"](nextHistory.href, nextHistory.state);
      };
      if (startTransition ?? true) {
        startReactTransition(apply);
      } else {
        apply();
      }
    }
    resetNextScrollRef.current = next.resetScroll ?? true;
    return latestLoadPromiseRef.current;
  });
  const buildAndCommitLocation = useStableCallback(({
    replace,
    resetScroll,
    startTransition,
    ...rest2
  } = {}) => {
    const location = buildLocation(rest2);
    return commitLocation({
      ...location,
      startTransition,
      replace,
      resetScroll
    });
  });
  const navigate = useStableCallback(({
    from,
    to = "",
    ...rest2
  }) => {
    const toString = String(to);
    const fromString = typeof from === "undefined" ? from : String(from);
    let isExternal;
    try {
      new URL(`${toString}`);
      isExternal = true;
    } catch (e) {
    }
    invariant(!isExternal, "Attempting to navigate to external url with this.navigate!");
    return buildAndCommitLocation({
      ...rest2,
      from: fromString,
      to: toString
    });
  });
  const loadMatches = useStableCallback(async ({
    checkLatest: checkLatest2,
    matches,
    preload
  }) => {
    var _a, _b;
    let latestPromise;
    let firstBadMatchIndex;
    try {
      for (let [index, match] of matches.entries()) {
        const parentMatch = matches[index - 1];
        const route = looseRoutesById[match.routeId];
        const handleError = (err, code) => {
          var _a2, _b2;
          err.routerCode = code;
          firstBadMatchIndex = firstBadMatchIndex ?? index;
          if (isRedirect(err)) {
            throw err;
          }
          try {
            (_b2 = (_a2 = route.options).onError) == null ? void 0 : _b2.call(_a2, err);
          } catch (errorHandlerErr) {
            err = errorHandlerErr;
            if (isRedirect(errorHandlerErr)) {
              throw errorHandlerErr;
            }
          }
          matches[index] = match = {
            ...match,
            error: err,
            status: "error",
            updatedAt: Date.now()
          };
        };
        try {
          if (match.paramsError) {
            handleError(match.paramsError, "PARSE_PARAMS");
          }
          if (match.searchError) {
            handleError(match.searchError, "VALIDATE_SEARCH");
          }
          const parentContext = (parentMatch == null ? void 0 : parentMatch.context) ?? options.context ?? {};
          const beforeLoadContext = await ((_b = (_a = route.options).beforeLoad) == null ? void 0 : _b.call(_a, {
            search: match.search,
            abortController: match.abortController,
            params: match.params,
            preload: !!preload,
            context: parentContext,
            location: state.location,
            navigate: (opts) => navigate({
              ...opts,
              from: match.pathname
            }),
            buildLocation
          })) ?? {};
          const context = {
            ...parentContext,
            ...beforeLoadContext
          };
          matches[index] = match = {
            ...match,
            context: replaceEqualDeep(match.context, context)
          };
        } catch (err) {
          handleError(err, "BEFORE_LOAD");
          break;
        }
      }
    } catch (err) {
      if (isRedirect(err)) {
        if (!preload)
          navigate(err);
        return matches;
      }
      throw err;
    }
    const validResolvedMatches = matches.slice(0, firstBadMatchIndex);
    const matchPromises = [];
    validResolvedMatches.forEach((match, index) => {
      matchPromises.push((async () => {
        var _a2, _b2, _c, _d, _e;
        const parentMatchPromise = matchPromises[index - 1];
        const route = looseRoutesById[match.routeId];
        const handleIfRedirect = (err) => {
          if (isRedirect(err)) {
            if (!preload) {
              navigate(err);
            }
            return true;
          }
          return false;
        };
        let loadPromise;
        matches[index] = match = {
          ...match,
          fetchedAt: Date.now(),
          invalid: false
        };
        if (match.isFetching) {
          loadPromise = (_a2 = getRouteMatch(state, match.id)) == null ? void 0 : _a2.loadPromise;
        } else {
          matches[index] = match = {
            ...match,
            isFetching: true
          };
          const componentsPromise = Promise.all(componentTypes.map(async (type) => {
            const component = route.options[type];
            if (component == null ? void 0 : component.preload) {
              await component.preload();
            }
          }));
          const loaderPromise = (_c = (_b2 = route.options).loader) == null ? void 0 : _c.call(_b2, {
            params: match.params,
            search: match.search,
            preload: !!preload,
            parentMatchPromise,
            abortController: match.abortController,
            context: match.context,
            location: state.location,
            navigate: (opts) => navigate({
              ...opts,
              from: match.pathname
            })
          });
          loadPromise = Promise.all([componentsPromise, loaderPromise]).then((d) => d[1]);
        }
        matches[index] = match = {
          ...match,
          loadPromise
        };
        if (!preload) {
          setState((s) => ({
            ...s,
            matches: s.matches.map((d) => d.id === match.id ? match : d)
          }));
        }
        try {
          const loaderData = await loadPromise;
          if (latestPromise = checkLatest2())
            return await latestPromise;
          matches[index] = match = {
            ...match,
            error: void 0,
            status: "success",
            isFetching: false,
            updatedAt: Date.now(),
            loaderData,
            loadPromise: void 0
          };
        } catch (error) {
          if (latestPromise = checkLatest2())
            return await latestPromise;
          if (handleIfRedirect(error))
            return;
          try {
            (_e = (_d = route.options).onError) == null ? void 0 : _e.call(_d, error);
          } catch (onErrorError) {
            error = onErrorError;
            if (handleIfRedirect(onErrorError))
              return;
          }
          matches[index] = match = {
            ...match,
            error,
            status: "error",
            isFetching: false,
            updatedAt: Date.now()
          };
        }
        if (!preload) {
          setState((s) => ({
            ...s,
            matches: s.matches.map((d) => d.id === match.id ? match : d)
          }));
        }
      })());
    });
    await Promise.all(matchPromises);
    return matches;
  });
  const load = useStableCallback(async () => {
    const promise = new Promise(async (resolve, reject) => {
      const next = latestLocationRef.current;
      const prevLocation = state.resolvedLocation;
      const pathDidChange = prevLocation.href !== next.href;
      let latestPromise;
      cancelMatches(state);
      router.emit({
        type: "onBeforeLoad",
        fromLocation: prevLocation,
        toLocation: next,
        pathChanged: pathDidChange
      });
      let matches = matchRoutes(next.pathname, next.search, {
        debug: true
      });
      pendingMatchesRef.current = matches;
      const previousMatches = state.matches;
      setState((s) => ({
        ...s,
        status: "pending",
        location: next,
        matches
      }));
      try {
        try {
          await loadMatches({
            matches,
            checkLatest: () => checkLatest(promise)
          });
        } catch (err) {
        }
        if (latestPromise = checkLatest(promise)) {
          return latestPromise;
        }
        const exitingMatchIds = previousMatches.filter((id) => !pendingMatchesRef.current.includes(id));
        const enteringMatchIds = pendingMatchesRef.current.filter((id) => !previousMatches.includes(id));
        const stayingMatchIds = previousMatches.filter((id) => pendingMatchesRef.current.includes(id));
        [[exitingMatchIds, "onLeave"], [enteringMatchIds, "onEnter"], [stayingMatchIds, "onTransition"]].forEach(([matches2, hook]) => {
          matches2.forEach((match) => {
            var _a, _b;
            (_b = (_a = looseRoutesById[match.routeId].options)[hook]) == null ? void 0 : _b.call(_a, match);
          });
        });
        router.emit({
          type: "onLoad",
          fromLocation: prevLocation,
          toLocation: next,
          pathChanged: pathDidChange
        });
        resolve();
      } catch (err) {
        if (latestPromise = checkLatest(promise)) {
          return latestPromise;
        }
        reject(err);
      }
    });
    latestLoadPromiseRef.current = promise;
    return latestLoadPromiseRef.current;
  });
  const preloadRoute = useStableCallback(async (navigateOpts = state.location) => {
    let next = buildLocation(navigateOpts);
    let matches = matchRoutes(next.pathname, next.search, {
      throwOnError: true
    });
    await loadMatches({
      matches,
      preload: true,
      checkLatest: () => void 0
    });
    return [last(matches), matches];
  });
  const buildLink = useStableCallback((dest) => {
    const {
      to,
      preload: userPreload,
      preloadDelay: userPreloadDelay,
      activeOptions,
      disabled,
      target,
      replace,
      resetScroll,
      startTransition
    } = dest;
    try {
      new URL(`${to}`);
      return {
        type: "external",
        href: to
      };
    } catch (e) {
    }
    const nextOpts = dest;
    const next = buildLocation(nextOpts);
    const preload = userPreload ?? options.defaultPreload;
    const preloadDelay = userPreloadDelay ?? options.defaultPreloadDelay ?? 0;
    const currentPathSplit = latestLocationRef.current.pathname.split("/");
    const nextPathSplit = next.pathname.split("/");
    const pathIsFuzzyEqual = nextPathSplit.every((d, i) => d === currentPathSplit[i]);
    const pathTest = (activeOptions == null ? void 0 : activeOptions.exact) ? latestLocationRef.current.pathname === next.pathname : pathIsFuzzyEqual;
    const hashTest = (activeOptions == null ? void 0 : activeOptions.includeHash) ? latestLocationRef.current.hash === next.hash : true;
    const searchTest = (activeOptions == null ? void 0 : activeOptions.includeSearch) ?? true ? partialDeepEqual(latestLocationRef.current.search, next.search) : true;
    const isActive = pathTest && hashTest && searchTest;
    const handleClick = (e) => {
      if (!disabled && !isCtrlEvent(e) && !e.defaultPrevented && (!target || target === "_self") && e.button === 0) {
        e.preventDefault();
        commitLocation({
          ...next,
          replace,
          resetScroll,
          startTransition
        });
      }
    };
    const handleFocus = (e) => {
      if (preload) {
        preloadRoute(nextOpts).catch((err) => {
          console.warn(err);
          console.warn(preloadWarning);
        });
      }
    };
    const handleTouchStart = (e) => {
      preloadRoute(nextOpts).catch((err) => {
        console.warn(err);
        console.warn(preloadWarning);
      });
    };
    const handleEnter = (e) => {
      const target2 = e.target || {};
      if (preload) {
        if (target2.preloadTimeout) {
          return;
        }
        target2.preloadTimeout = setTimeout(() => {
          target2.preloadTimeout = null;
          preloadRoute(nextOpts).catch((err) => {
            console.warn(err);
            console.warn(preloadWarning);
          });
        }, preloadDelay);
      }
    };
    const handleLeave = (e) => {
      const target2 = e.target || {};
      if (target2.preloadTimeout) {
        clearTimeout(target2.preloadTimeout);
        target2.preloadTimeout = null;
      }
    };
    return {
      type: "internal",
      next,
      handleFocus,
      handleClick,
      handleEnter,
      handleLeave,
      handleTouchStart,
      isActive,
      disabled
    };
  });
  React.useLayoutEffect(() => {
    const unsub = history.subscribe(() => {
      latestLocationRef.current = parseLocation2(latestLocationRef.current);
      if (state.location !== latestLocationRef.current) {
        startReactTransition(() => {
          try {
            load();
          } catch (err) {
            console.error(err);
          }
        });
      }
    });
    const nextLocation = buildLocation({
      search: true,
      params: true,
      hash: true,
      state: true
    });
    if (state.location.href !== nextLocation.href) {
      commitLocation({
        ...nextLocation,
        replace: true
      });
    }
    return () => {
      unsub();
    };
  }, [history]);
  React.useLayoutEffect(() => {
    startReactTransition(() => {
      try {
        load();
      } catch (err) {
        console.error(err);
      }
    });
  }, []);
  const matchRoute = useStableCallback((location, opts) => {
    location = {
      ...location,
      to: location.to ? resolvePathWithBase(location.from || "", location.to) : void 0
    };
    const next = buildLocation(location);
    if ((opts == null ? void 0 : opts.pending) && state.status !== "pending") {
      return false;
    }
    const baseLocation = (opts == null ? void 0 : opts.pending) ? latestLocationRef.current : state.resolvedLocation;
    if (!baseLocation) {
      return false;
    }
    const match = matchPathname(basepath, baseLocation.pathname, {
      ...opts,
      to: next.pathname
    });
    if (!match) {
      return false;
    }
    if (match && ((opts == null ? void 0 : opts.includeSearch) ?? true)) {
      return partialDeepEqual(baseLocation.search, next.search) ? match : false;
    }
    return match;
  });
  const routerContextValue = {
    routeTree: router.routeTree,
    navigate,
    buildLink,
    state,
    matchRoute,
    routesById,
    options,
    history,
    load,
    buildLocation,
    subscribe: router.subscribe,
    resetNextScrollRef
  };
  return React.createElement(routerContext.Provider, {
    value: routerContextValue
  }, React.createElement(Matches, null));
}
function getRouteMatch(state, id) {
  return [...state.pendingMatches, ...state.matches].find((d) => d.id === id);
}
function useRouterState(opts) {
  const {
    state
  } = useRouter();
  return (opts == null ? void 0 : opts.select) ? opts.select(state) : state;
}
function useRouter() {
  const resolvedContext = window.__TSR_ROUTER_CONTEXT__ || routerContext;
  const value = React.useContext(resolvedContext);
  tiny_warning_esm_default(value, "useRouter must be used inside a <RouterProvider> component!");
  return value;
}
function Matches() {
  const {
    routesById,
    state
  } = useRouter();
  const {
    matches
  } = state;
  const locationKey = useRouterState().location.state.key;
  const route = routesById[rootRouteId];
  const errorComponent = React.useCallback((props) => {
    return React.createElement(ErrorComponent, {
      ...props,
      useMatch: route.useMatch,
      useRouteContext: route.useRouteContext,
      useSearch: route.useSearch,
      useParams: route.useParams
    });
  }, [route]);
  return React.createElement(matchesContext.Provider, {
    value: matches
  }, React.createElement(CatchBoundary, {
    resetKey: locationKey,
    errorComponent,
    onCatch: () => {
      tiny_warning_esm_default(false, `Error in router! Consider setting an 'errorComponent' in your RootRoute! 👍`);
    }
  }, matches.length ? React.createElement(Match, {
    matches
  }) : null));
}
var defaultPending = () => null;
function SafeFragment(props) {
  return React.createElement(React.Fragment, null, props.children);
}
function Match({
  matches
}) {
  var _a;
  const {
    options,
    routesById
  } = useRouter();
  const match = matches[0];
  const routeId = match == null ? void 0 : match.routeId;
  const route = routesById[routeId];
  const locationKey = (_a = useRouterState().location.state) == null ? void 0 : _a.key;
  const PendingComponent = route.options.pendingComponent ?? options.defaultPendingComponent ?? defaultPending;
  const routeErrorComponent = route.options.errorComponent ?? options.defaultErrorComponent ?? ErrorComponent;
  const ResolvedSuspenseBoundary = route.options.wrapInSuspense ? React.Suspense : SafeFragment;
  const errorComponent = React.useCallback((props) => {
    return React.createElement(routeErrorComponent, {
      ...props,
      useMatch: route.useMatch,
      useRouteContext: route.useRouteContext,
      useSearch: route.useSearch,
      useParams: route.useParams
    });
  }, [route]);
  return React.createElement(matchesContext.Provider, {
    value: matches
  }, React.createElement(ResolvedSuspenseBoundary, {
    fallback: React.createElement(PendingComponent, {
      useMatch: route.useMatch,
      useRouteContext: route.useRouteContext,
      useSearch: route.useSearch,
      useParams: route.useParams
    })
  }, React.createElement(CatchBoundary, {
    resetKey: locationKey,
    errorComponent,
    onCatch: () => {
      tiny_warning_esm_default(false, `Error in route match: ${match.id}`);
    }
  }, React.createElement(MatchInner, {
    match
  }))));
}
function MatchInner({
  match
}) {
  const {
    options,
    routesById
  } = useRouter();
  const route = routesById[match.routeId];
  if (match.status === "error") {
    throw match.error;
  }
  if (match.status === "pending") {
    throw match.loadPromise;
  }
  if (match.status === "success") {
    let comp = route.options.component ?? options.defaultComponent;
    if (comp) {
      return React.createElement(comp, {
        useMatch: route.useMatch,
        useRouteContext: route.useRouteContext,
        useSearch: route.useSearch,
        useParams: route.useParams,
        useLoaderData: route.useLoaderData
      });
    }
    return React.createElement(Outlet, null);
  }
  invariant(false, "Idle routeMatch status encountered during rendering! You should never see this. File an issue!");
}
function Outlet() {
  const matches = React.useContext(matchesContext).slice(1);
  if (!matches[0]) {
    return null;
  }
  return React.createElement(Match, {
    matches
  });
}
function useMatchRoute() {
  const {
    matchRoute
  } = useRouter();
  return React.useCallback((opts) => {
    const {
      pending,
      caseSensitive,
      ...rest
    } = opts;
    return matchRoute(rest, {
      pending,
      caseSensitive
    });
  }, []);
}
function MatchRoute(props) {
  const matchRoute = useMatchRoute();
  const params = matchRoute(props);
  if (typeof props.children === "function") {
    return props.children(params);
  }
  return !!params ? props.children : null;
}
function useMatch(opts) {
  const nearestMatch = React.useContext(matchesContext)[0];
  const nearestMatchRouteId = nearestMatch == null ? void 0 : nearestMatch.routeId;
  const matchRouteId = useRouterState({
    select: (state) => {
      const match = (opts == null ? void 0 : opts.from) ? state.matches.find((d) => d.routeId === (opts == null ? void 0 : opts.from)) : state.matches.find((d) => d.id === nearestMatch.id);
      return match.routeId;
    }
  });
  if ((opts == null ? void 0 : opts.strict) ?? true) {
    invariant(nearestMatchRouteId == matchRouteId, `useMatch("${matchRouteId}") is being called in a component that is meant to render the '${nearestMatchRouteId}' route. Did you mean to 'useMatch("${matchRouteId}", { strict: false })' or 'useRoute("${matchRouteId}")' instead?`);
  }
  const matchSelection = useRouterState({
    select: (state) => {
      const match = (opts == null ? void 0 : opts.from) ? state.matches.find((d) => d.routeId === (opts == null ? void 0 : opts.from)) : state.matches.find((d) => d.id === nearestMatch.id);
      invariant(match, `Could not find ${(opts == null ? void 0 : opts.from) ? `an active match from "${opts.from}"` : "a nearest match!"}`);
      return (opts == null ? void 0 : opts.select) ? opts.select(match) : match;
    }
  });
  return matchSelection;
}
var matchesContext = React.createContext(null);
function useMatches(opts) {
  const contextMatches = React.useContext(matchesContext);
  return useRouterState({
    select: (state) => {
      const matches = state.matches.slice(state.matches.findIndex((d) => {
        var _a;
        return d.id === ((_a = contextMatches[0]) == null ? void 0 : _a.id);
      }));
      return (opts == null ? void 0 : opts.select) ? opts.select(matches) : matches;
    }
  });
}
function useLoaderData(opts) {
  const match = useMatch({
    ...opts,
    select: void 0
  });
  return typeof opts.select === "function" ? opts.select(match == null ? void 0 : match.loaderData) : match == null ? void 0 : match.loaderData;
}
function useParams(opts) {
  return useRouterState({
    select: (state) => {
      var _a;
      const params = (_a = last(state.matches)) == null ? void 0 : _a.params;
      return (opts == null ? void 0 : opts.select) ? opts.select(params) : params;
    }
  });
}
function useSearch(opts) {
  return useMatch({
    ...opts,
    select: (match) => {
      return (opts == null ? void 0 : opts.select) ? opts.select(match.search) : match.search;
    }
  });
}
var rootRouteId = "__root__";
var _Route = class _Route {
  // Set up in this.init()
  // customId!: TCustomId
  // Optional
  constructor(options) {
    __publicField(this, "init", (opts) => {
      var _a, _b;
      this.originalIndex = opts.originalIndex;
      const options = this.options;
      const isRoot = !(options == null ? void 0 : options.path) && !(options == null ? void 0 : options.id);
      this.parentRoute = (_b = (_a = this.options) == null ? void 0 : _a.getParentRoute) == null ? void 0 : _b.call(_a);
      if (isRoot) {
        this.path = rootRouteId;
      } else {
        invariant(this.parentRoute, `Child Route instances must pass a 'getParentRoute: () => ParentRoute' option that returns a Route instance.`);
      }
      let path = isRoot ? rootRouteId : options.path;
      if (path && path !== "/") {
        path = trimPath(path);
      }
      const customId = (options == null ? void 0 : options.id) || path;
      let id = isRoot ? rootRouteId : joinPaths([this.parentRoute.id === rootRouteId ? "" : this.parentRoute.id, customId]);
      if (path === rootRouteId) {
        path = "/";
      }
      if (id !== rootRouteId) {
        id = joinPaths(["/", id]);
      }
      const fullPath = id === rootRouteId ? "/" : joinPaths([this.parentRoute.fullPath, path]);
      this.path = path;
      this.id = id;
      this.fullPath = fullPath;
      this.to = fullPath;
    });
    __publicField(this, "addChildren", (children) => {
      this.children = children;
      return this;
    });
    __publicField(this, "update", (options) => {
      Object.assign(this.options, options);
      return this;
    });
    __publicField(this, "useMatch", (opts) => {
      return useMatch({
        ...opts,
        from: this.id
      });
    });
    __publicField(this, "useRouteContext", (opts) => {
      return useMatch({
        ...opts,
        from: this.id,
        select: (d) => (opts == null ? void 0 : opts.select) ? opts.select(d.context) : d.context
      });
    });
    __publicField(this, "useSearch", (opts) => {
      return useSearch({
        ...opts,
        from: this.id
      });
    });
    __publicField(this, "useParams", (opts) => {
      return useParams({
        ...opts,
        from: this.id
      });
    });
    __publicField(this, "useLoaderData", (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    });
    this.options = options || {};
    this.isRoot = !(options == null ? void 0 : options.getParentRoute);
    _Route.__onInit(this);
  }
};
__publicField(_Route, "__onInit", (route) => {
});
var Route = _Route;
function rootRouteWithContext() {
  return (options) => {
    return new RootRoute(options);
  };
}
var RootRoute = class extends Route {
  constructor(options) {
    super(options);
  }
};
function createRouteMask(opts) {
  return opts;
}
var FileRoute = class {
  constructor(path) {
    __publicField(this, "createRoute", (options) => {
      const route = new Route(options);
      route.isRoot = false;
      return route;
    });
    this.path = path;
  }
};
function lazyRouteComponent(importer, exportName) {
  let loadPromise;
  const load = () => {
    if (!loadPromise) {
      loadPromise = importer();
    }
    return loadPromise;
  };
  const lazyComp = React.lazy(async () => {
    const moduleExports = await load();
    const comp = moduleExports[exportName ?? "default"];
    return {
      default: comp
    };
  });
  lazyComp.preload = load;
  return lazyComp;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function useLinkProps(options) {
  const {
    buildLink
  } = useRouter();
  const match = useMatch({
    strict: false
  });
  const {
    // custom props
    type,
    children,
    target,
    activeProps = () => ({
      className: "active"
    }),
    inactiveProps = () => ({}),
    activeOptions,
    disabled,
    hash,
    search,
    params,
    to,
    state,
    mask,
    preload,
    preloadDelay,
    replace,
    startTransition,
    resetScroll,
    // element props
    style,
    className,
    onClick,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    ...rest
  } = options;
  const linkInfo = buildLink({
    from: options.to ? match.pathname : void 0,
    ...options
  });
  if (linkInfo.type === "external") {
    const {
      href
    } = linkInfo;
    return {
      href
    };
  }
  const {
    handleClick,
    handleFocus,
    handleEnter,
    handleLeave,
    handleTouchStart,
    isActive,
    next
  } = linkInfo;
  const composeHandlers = (handlers) => (e) => {
    if (e.persist)
      e.persist();
    handlers.filter(Boolean).forEach((handler) => {
      if (e.defaultPrevented)
        return;
      handler(e);
    });
  };
  const resolvedActiveProps = isActive ? functionalUpdate(activeProps, {}) ?? {} : {};
  const resolvedInactiveProps = isActive ? {} : functionalUpdate(inactiveProps, {}) ?? {};
  return {
    ...resolvedActiveProps,
    ...resolvedInactiveProps,
    ...rest,
    href: disabled ? void 0 : next.maskedLocation ? next.maskedLocation.href : next.href,
    onClick: composeHandlers([onClick, handleClick]),
    onFocus: composeHandlers([onFocus, handleFocus]),
    onMouseEnter: composeHandlers([onMouseEnter, handleEnter]),
    onMouseLeave: composeHandlers([onMouseLeave, handleLeave]),
    onTouchStart: composeHandlers([onTouchStart, handleTouchStart]),
    target,
    style: {
      ...style,
      ...resolvedActiveProps.style,
      ...resolvedInactiveProps.style
    },
    className: [className, resolvedActiveProps.className, resolvedInactiveProps.className].filter(Boolean).join(" ") || void 0,
    ...disabled ? {
      role: "link",
      "aria-disabled": true
    } : void 0,
    ["data-status"]: isActive ? "active" : void 0
  };
}
var Link = React.forwardRef((props, ref) => {
  const linkProps = useLinkProps(props);
  return React.createElement("a", _extends({
    ref
  }, linkProps, {
    children: typeof props.children === "function" ? props.children({
      isActive: linkProps["data-status"] === "active"
    }) : props.children
  }));
});
var useLayoutEffect2 = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
var windowKey = "window";
var delimiter = "___";
var weakScrolledElements = /* @__PURE__ */ new WeakSet();
var cache;
var sessionsStorage = typeof window !== "undefined" && window.sessionStorage;
var defaultGetKey = (location) => location.state.key;
function useScrollRestoration(options) {
  const {
    state,
    subscribe,
    resetNextScrollRef
  } = useRouter();
  useLayoutEffect2(() => {
    const getKey = (options == null ? void 0 : options.getKey) || defaultGetKey;
    if (sessionsStorage) {
      if (!cache) {
        cache = (() => {
          const storageKey = "tsr-scroll-restoration-v2";
          const state2 = JSON.parse(window.sessionStorage.getItem(storageKey) || "null") || {
            cached: {},
            next: {}
          };
          return {
            state: state2,
            set: (updater) => {
              cache.state = functionalUpdate(updater, cache.state);
              window.sessionStorage.setItem(storageKey, JSON.stringify(cache.state));
            }
          };
        })();
      }
    }
    const {
      history
    } = window;
    if (history.scrollRestoration) {
      history.scrollRestoration = "manual";
    }
    const onScroll = (event) => {
      if (weakScrolledElements.has(event.target))
        return;
      weakScrolledElements.add(event.target);
      const elementSelector = event.target === document || event.target === window ? windowKey : getCssSelector(event.target);
      if (!cache.state.next[elementSelector]) {
        cache.set((c) => ({
          ...c,
          next: {
            ...c.next,
            [elementSelector]: {
              scrollX: NaN,
              scrollY: NaN
            }
          }
        }));
      }
    };
    const getCssSelector = (el) => {
      let path = [], parent;
      while (parent = el.parentNode) {
        path.unshift(`${el.tagName}:nth-child(${[].indexOf.call(parent.children, el) + 1})`);
        el = parent;
      }
      return `${path.join(" > ")}`.toLowerCase();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("scroll", onScroll, true);
    }
    const unsubOnBeforeLoad = subscribe("onBeforeLoad", (event) => {
      if (event.pathChanged) {
        const restoreKey = getKey(event.fromLocation);
        for (const elementSelector in cache.state.next) {
          const entry = cache.state.next[elementSelector];
          if (elementSelector === windowKey) {
            entry.scrollX = window.scrollX || 0;
            entry.scrollY = window.scrollY || 0;
          } else if (elementSelector) {
            const element = document.querySelector(elementSelector);
            entry.scrollX = (element == null ? void 0 : element.scrollLeft) || 0;
            entry.scrollY = (element == null ? void 0 : element.scrollTop) || 0;
          }
          cache.set((c) => {
            const next = {
              ...c.next
            };
            delete next[elementSelector];
            return {
              ...c,
              next,
              cached: {
                ...c.cached,
                [[restoreKey, elementSelector].join(delimiter)]: entry
              }
            };
          });
        }
      }
    });
    const unsubOnResolved = subscribe("onResolved", (event) => {
      if (event.pathChanged) {
        if (!resetNextScrollRef.current) {
          return;
        }
        resetNextScrollRef.current = true;
        const getKey2 = (options == null ? void 0 : options.getKey) || defaultGetKey;
        const restoreKey = getKey2(event.toLocation);
        let windowRestored = false;
        for (const cacheKey in cache.state.cached) {
          const entry = cache.state.cached[cacheKey];
          const [key, elementSelector] = cacheKey.split(delimiter);
          if (key === restoreKey) {
            if (elementSelector === windowKey) {
              windowRestored = true;
              window.scrollTo(entry.scrollX, entry.scrollY);
            } else if (elementSelector) {
              const element = document.querySelector(elementSelector);
              if (element) {
                element.scrollLeft = entry.scrollX;
                element.scrollTop = entry.scrollY;
              }
            }
          }
        }
        if (!windowRestored) {
          window.scrollTo(0, 0);
        }
        cache.set((c) => ({
          ...c,
          next: {}
        }));
        weakScrolledElements = /* @__PURE__ */ new WeakSet();
      }
    });
    return () => {
      document.removeEventListener("scroll", onScroll);
      unsubOnBeforeLoad();
      unsubOnResolved();
    };
  }, []);
}
function ScrollRestoration(props) {
  useScrollRestoration(props);
  return null;
}
function useBlocker(message, condition = true) {
  const {
    history
  } = useRouter();
  React.useEffect(() => {
    if (!condition)
      return;
    let unblock = history.block((retry, cancel) => {
      if (window.confirm(message)) {
        unblock();
        retry();
      }
    });
    return unblock;
  });
}
function Block({
  message,
  condition,
  children
}) {
  useBlocker(message, condition);
  return children ?? null;
}
function useNavigate(defaultOpts) {
  const {
    navigate
  } = useRouter();
  const match = useMatch({
    strict: false
  });
  return React.useCallback((opts) => {
    return navigate({
      from: (opts == null ? void 0 : opts.to) ? match.pathname : void 0,
      ...defaultOpts,
      ...opts
    });
  }, []);
}
function typedNavigate(navigate) {
  return navigate;
}
function Navigate(props) {
  const {
    navigate
  } = useRouter();
  const match = useMatch({
    strict: false
  });
  useLayoutEffect$1(() => {
    navigate({
      from: props.to ? match.pathname : void 0,
      ...props
    });
  }, []);
  return null;
}
export {
  Block,
  CatchBoundary,
  CatchBoundaryImpl,
  ErrorComponent,
  FileRoute,
  Link,
  Match,
  MatchRoute,
  Matches,
  Navigate,
  Outlet,
  PathParamError,
  RootRoute,
  Route,
  Router,
  RouterProvider,
  ScrollRestoration,
  SearchParamError,
  cleanPath,
  componentTypes,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  createRouteMask,
  decode,
  defaultParseSearch,
  defaultStringifySearch,
  encode,
  functionalUpdate,
  getInitialRouterState,
  getRouteMatch,
  interpolatePath,
  invariant,
  isPlainObject,
  isRedirect,
  isServer,
  joinPaths,
  last,
  lazyFn,
  lazyRouteComponent,
  matchByPath,
  matchPathname,
  matchesContext,
  parsePathname,
  parseSearchWith,
  partialDeepEqual,
  pick,
  redirect,
  replaceEqualDeep,
  resolvePath,
  rootRouteId,
  rootRouteWithContext,
  routerContext,
  shallow,
  stringifySearchWith,
  trimPath,
  trimPathLeft,
  trimPathRight,
  typedNavigate,
  useBlocker,
  useLayoutEffect$1 as useLayoutEffect,
  useLinkProps,
  useLoaderData,
  useMatch,
  useMatchRoute,
  useMatches,
  useNavigate,
  useParams,
  useRouteContext,
  useRouter,
  useRouterState,
  useScrollRestoration,
  useSearch,
  useStableCallback,
  tiny_warning_esm_default as warning
};
/*! Bundled license information:

@tanstack/history/build/esm/index.js:
  (**
   * @tanstack/history/src/index.ts
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)

@tanstack/react-router/build/esm/index.js:
  (**
   * @tanstack/react-router/src/index.tsx
   *
   * Copyright (c) TanStack
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE.md file in the root directory of this source tree.
   *
   * @license MIT
   *)
*/
//# sourceMappingURL=@tanstack_react-router.js.map
