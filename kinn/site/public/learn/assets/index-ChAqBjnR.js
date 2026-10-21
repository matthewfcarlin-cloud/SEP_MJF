(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();var tm={exports:{}},yl={},nm={exports:{}},Pe={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Pa=Symbol.for("react.element"),sv=Symbol.for("react.portal"),av=Symbol.for("react.fragment"),ov=Symbol.for("react.strict_mode"),lv=Symbol.for("react.profiler"),cv=Symbol.for("react.provider"),uv=Symbol.for("react.context"),dv=Symbol.for("react.forward_ref"),fv=Symbol.for("react.suspense"),hv=Symbol.for("react.memo"),pv=Symbol.for("react.lazy"),bf=Symbol.iterator;function mv(t){return t===null||typeof t!="object"?null:(t=bf&&t[bf]||t["@@iterator"],typeof t=="function"?t:null)}var im={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},rm=Object.assign,sm={};function bs(t,e,n){this.props=t,this.context=e,this.refs=sm,this.updater=n||im}bs.prototype.isReactComponent={};bs.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};bs.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function am(){}am.prototype=bs.prototype;function vd(t,e,n){this.props=t,this.context=e,this.refs=sm,this.updater=n||im}var xd=vd.prototype=new am;xd.constructor=vd;rm(xd,bs.prototype);xd.isPureReactComponent=!0;var Tf=Array.isArray,om=Object.prototype.hasOwnProperty,_d={current:null},lm={key:!0,ref:!0,__self:!0,__source:!0};function cm(t,e,n){var i,r={},s=null,a=null;if(e!=null)for(i in e.ref!==void 0&&(a=e.ref),e.key!==void 0&&(s=""+e.key),e)om.call(e,i)&&!lm.hasOwnProperty(i)&&(r[i]=e[i]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var l=Array(o),c=0;c<o;c++)l[c]=arguments[c+2];r.children=l}if(t&&t.defaultProps)for(i in o=t.defaultProps,o)r[i]===void 0&&(r[i]=o[i]);return{$$typeof:Pa,type:t,key:s,ref:a,props:r,_owner:_d.current}}function gv(t,e){return{$$typeof:Pa,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function yd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Pa}function vv(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Cf=/\/+/g;function jl(t,e){return typeof t=="object"&&t!==null&&t.key!=null?vv(""+t.key):e.toString(36)}function Lo(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case Pa:case sv:a=!0}}if(a)return a=t,r=r(a),t=i===""?"."+jl(a,0):i,Tf(r)?(n="",t!=null&&(n=t.replace(Cf,"$&/")+"/"),Lo(r,e,n,"",function(c){return c})):r!=null&&(yd(r)&&(r=gv(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(Cf,"$&/")+"/")+t)),e.push(r)),1;if(a=0,i=i===""?".":i+":",Tf(t))for(var o=0;o<t.length;o++){s=t[o];var l=i+jl(s,o);a+=Lo(s,e,n,l,r)}else if(l=mv(t),typeof l=="function")for(t=l.call(t),o=0;!(s=t.next()).done;)s=s.value,l=i+jl(s,o++),a+=Lo(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return a}function Va(t,e,n){if(t==null)return t;var i=[],r=0;return Lo(t,i,"","",function(s){return e.call(n,s,r++)}),i}function xv(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Bt={current:null},Po={transition:null},_v={ReactCurrentDispatcher:Bt,ReactCurrentBatchConfig:Po,ReactCurrentOwner:_d};function um(){throw Error("act(...) is not supported in production builds of React.")}Pe.Children={map:Va,forEach:function(t,e,n){Va(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Va(t,function(){e++}),e},toArray:function(t){return Va(t,function(e){return e})||[]},only:function(t){if(!yd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};Pe.Component=bs;Pe.Fragment=av;Pe.Profiler=lv;Pe.PureComponent=vd;Pe.StrictMode=ov;Pe.Suspense=fv;Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=_v;Pe.act=um;Pe.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=rm({},t.props),r=t.key,s=t.ref,a=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,a=_d.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var o=t.type.defaultProps;for(l in e)om.call(e,l)&&!lm.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&o!==void 0?o[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){o=Array(l);for(var c=0;c<l;c++)o[c]=arguments[c+2];i.children=o}return{$$typeof:Pa,type:t.type,key:r,ref:s,props:i,_owner:a}};Pe.createContext=function(t){return t={$$typeof:uv,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:cv,_context:t},t.Consumer=t};Pe.createElement=cm;Pe.createFactory=function(t){var e=cm.bind(null,t);return e.type=t,e};Pe.createRef=function(){return{current:null}};Pe.forwardRef=function(t){return{$$typeof:dv,render:t}};Pe.isValidElement=yd;Pe.lazy=function(t){return{$$typeof:pv,_payload:{_status:-1,_result:t},_init:xv}};Pe.memo=function(t,e){return{$$typeof:hv,type:t,compare:e===void 0?null:e}};Pe.startTransition=function(t){var e=Po.transition;Po.transition={};try{t()}finally{Po.transition=e}};Pe.unstable_act=um;Pe.useCallback=function(t,e){return Bt.current.useCallback(t,e)};Pe.useContext=function(t){return Bt.current.useContext(t)};Pe.useDebugValue=function(){};Pe.useDeferredValue=function(t){return Bt.current.useDeferredValue(t)};Pe.useEffect=function(t,e){return Bt.current.useEffect(t,e)};Pe.useId=function(){return Bt.current.useId()};Pe.useImperativeHandle=function(t,e,n){return Bt.current.useImperativeHandle(t,e,n)};Pe.useInsertionEffect=function(t,e){return Bt.current.useInsertionEffect(t,e)};Pe.useLayoutEffect=function(t,e){return Bt.current.useLayoutEffect(t,e)};Pe.useMemo=function(t,e){return Bt.current.useMemo(t,e)};Pe.useReducer=function(t,e,n){return Bt.current.useReducer(t,e,n)};Pe.useRef=function(t){return Bt.current.useRef(t)};Pe.useState=function(t){return Bt.current.useState(t)};Pe.useSyncExternalStore=function(t,e,n){return Bt.current.useSyncExternalStore(t,e,n)};Pe.useTransition=function(){return Bt.current.useTransition()};Pe.version="18.3.1";nm.exports=Pe;var ye=nm.exports;/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var yv=ye,Sv=Symbol.for("react.element"),Mv=Symbol.for("react.fragment"),wv=Object.prototype.hasOwnProperty,Ev=yv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,bv={key:!0,ref:!0,__self:!0,__source:!0};function dm(t,e,n){var i,r={},s=null,a=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(a=e.ref);for(i in e)wv.call(e,i)&&!bv.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:Sv,type:t,key:s,ref:a,props:r,_owner:Ev.current}}yl.Fragment=Mv;yl.jsx=dm;yl.jsxs=dm;tm.exports=yl;var v=tm.exports,fm={exports:{}},cn={},hm={exports:{}},pm={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(D,G){var B=D.length;D.push(G);e:for(;0<B;){var I=B-1>>>1,U=D[I];if(0<r(U,G))D[I]=G,D[B]=U,B=I;else break e}}function n(D){return D.length===0?null:D[0]}function i(D){if(D.length===0)return null;var G=D[0],B=D.pop();if(B!==G){D[0]=B;e:for(var I=0,U=D.length,Q=U>>>1;I<Q;){var ee=2*(I+1)-1,ae=D[ee],W=ee+1,be=D[W];if(0>r(ae,B))W<U&&0>r(be,ae)?(D[I]=be,D[W]=B,I=W):(D[I]=ae,D[ee]=B,I=ee);else if(W<U&&0>r(be,B))D[I]=be,D[W]=B,I=W;else break e}}return G}function r(D,G){var B=D.sortIndex-G.sortIndex;return B!==0?B:D.id-G.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,o=a.now();t.unstable_now=function(){return a.now()-o}}var l=[],c=[],u=1,f=null,d=3,g=!1,S=!1,p=!1,h=typeof setTimeout=="function"?setTimeout:null,m=typeof clearTimeout=="function"?clearTimeout:null,x=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function y(D){for(var G=n(c);G!==null;){if(G.callback===null)i(c);else if(G.startTime<=D)i(c),G.sortIndex=G.expirationTime,e(l,G);else break;G=n(c)}}function M(D){if(p=!1,y(D),!S)if(n(l)!==null)S=!0,K(w);else{var G=n(c);G!==null&&Z(M,G.startTime-D)}}function w(D,G){S=!1,p&&(p=!1,m(_),_=-1),g=!0;var B=d;try{for(y(G),f=n(l);f!==null&&(!(f.expirationTime>G)||D&&!O());){var I=f.callback;if(typeof I=="function"){f.callback=null,d=f.priorityLevel;var U=I(f.expirationTime<=G);G=t.unstable_now(),typeof U=="function"?f.callback=U:f===n(l)&&i(l),y(G)}else i(l);f=n(l)}if(f!==null)var Q=!0;else{var ee=n(c);ee!==null&&Z(M,ee.startTime-G),Q=!1}return Q}finally{f=null,d=B,g=!1}}var T=!1,P=null,_=-1,C=5,L=-1;function O(){return!(t.unstable_now()-L<C)}function re(){if(P!==null){var D=t.unstable_now();L=D;var G=!0;try{G=P(!0,D)}finally{G?V():(T=!1,P=null)}}else T=!1}var V;if(typeof x=="function")V=function(){x(re)};else if(typeof MessageChannel<"u"){var k=new MessageChannel,q=k.port2;k.port1.onmessage=re,V=function(){q.postMessage(null)}}else V=function(){h(re,0)};function K(D){P=D,T||(T=!0,V())}function Z(D,G){_=h(function(){D(t.unstable_now())},G)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(D){D.callback=null},t.unstable_continueExecution=function(){S||g||(S=!0,K(w))},t.unstable_forceFrameRate=function(D){0>D||125<D?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):C=0<D?Math.floor(1e3/D):5},t.unstable_getCurrentPriorityLevel=function(){return d},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(D){switch(d){case 1:case 2:case 3:var G=3;break;default:G=d}var B=d;d=G;try{return D()}finally{d=B}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(D,G){switch(D){case 1:case 2:case 3:case 4:case 5:break;default:D=3}var B=d;d=D;try{return G()}finally{d=B}},t.unstable_scheduleCallback=function(D,G,B){var I=t.unstable_now();switch(typeof B=="object"&&B!==null?(B=B.delay,B=typeof B=="number"&&0<B?I+B:I):B=I,D){case 1:var U=-1;break;case 2:U=250;break;case 5:U=1073741823;break;case 4:U=1e4;break;default:U=5e3}return U=B+U,D={id:u++,callback:G,priorityLevel:D,startTime:B,expirationTime:U,sortIndex:-1},B>I?(D.sortIndex=B,e(c,D),n(l)===null&&D===n(c)&&(p?(m(_),_=-1):p=!0,Z(M,B-I))):(D.sortIndex=U,e(l,D),S||g||(S=!0,K(w))),D},t.unstable_shouldYield=O,t.unstable_wrapCallback=function(D){var G=d;return function(){var B=d;d=G;try{return D.apply(this,arguments)}finally{d=B}}}})(pm);hm.exports=pm;var Tv=hm.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Cv=ye,ln=Tv;function J(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var mm=new Set,ua={};function wr(t,e){ds(t,e),ds(t+"Capture",e)}function ds(t,e){for(ua[t]=e,t=0;t<e.length;t++)mm.add(e[t])}var ui=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),cu=Object.prototype.hasOwnProperty,Av=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Af={},Lf={};function Lv(t){return cu.call(Lf,t)?!0:cu.call(Af,t)?!1:Av.test(t)?Lf[t]=!0:(Af[t]=!0,!1)}function Pv(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function Rv(t,e,n,i){if(e===null||typeof e>"u"||Pv(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Vt(t,e,n,i,r,s,a){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=a}var Mt={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){Mt[t]=new Vt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];Mt[e]=new Vt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){Mt[t]=new Vt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){Mt[t]=new Vt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){Mt[t]=new Vt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){Mt[t]=new Vt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){Mt[t]=new Vt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){Mt[t]=new Vt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){Mt[t]=new Vt(t,5,!1,t.toLowerCase(),null,!1,!1)});var Sd=/[\-:]([a-z])/g;function Md(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(Sd,Md);Mt[e]=new Vt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(Sd,Md);Mt[e]=new Vt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(Sd,Md);Mt[e]=new Vt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){Mt[t]=new Vt(t,1,!1,t.toLowerCase(),null,!1,!1)});Mt.xlinkHref=new Vt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){Mt[t]=new Vt(t,1,!1,t.toLowerCase(),null,!0,!0)});function wd(t,e,n,i){var r=Mt.hasOwnProperty(e)?Mt[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(Rv(e,n,r,i)&&(n=null),i||r===null?Lv(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var pi=Cv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Ga=Symbol.for("react.element"),Wr=Symbol.for("react.portal"),Hr=Symbol.for("react.fragment"),Ed=Symbol.for("react.strict_mode"),uu=Symbol.for("react.profiler"),gm=Symbol.for("react.provider"),vm=Symbol.for("react.context"),bd=Symbol.for("react.forward_ref"),du=Symbol.for("react.suspense"),fu=Symbol.for("react.suspense_list"),Td=Symbol.for("react.memo"),Ei=Symbol.for("react.lazy"),xm=Symbol.for("react.offscreen"),Pf=Symbol.iterator;function Rs(t){return t===null||typeof t!="object"?null:(t=Pf&&t[Pf]||t["@@iterator"],typeof t=="function"?t:null)}var Qe=Object.assign,$l;function $s(t){if($l===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);$l=e&&e[1]||""}return`
`+$l+t}var Xl=!1;function ql(t,e){if(!t||Xl)return"";Xl=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){i=c}t.call(e.prototype)}else{try{throw Error()}catch(c){i=c}t()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),a=r.length-1,o=s.length-1;1<=a&&0<=o&&r[a]!==s[o];)o--;for(;1<=a&&0<=o;a--,o--)if(r[a]!==s[o]){if(a!==1||o!==1)do if(a--,o--,0>o||r[a]!==s[o]){var l=`
`+r[a].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=a&&0<=o);break}}}finally{Xl=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?$s(t):""}function Dv(t){switch(t.tag){case 5:return $s(t.type);case 16:return $s("Lazy");case 13:return $s("Suspense");case 19:return $s("SuspenseList");case 0:case 2:case 15:return t=ql(t.type,!1),t;case 11:return t=ql(t.type.render,!1),t;case 1:return t=ql(t.type,!0),t;default:return""}}function hu(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Hr:return"Fragment";case Wr:return"Portal";case uu:return"Profiler";case Ed:return"StrictMode";case du:return"Suspense";case fu:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case vm:return(t.displayName||"Context")+".Consumer";case gm:return(t._context.displayName||"Context")+".Provider";case bd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Td:return e=t.displayName||null,e!==null?e:hu(t.type)||"Memo";case Ei:e=t._payload,t=t._init;try{return hu(t(e))}catch{}}return null}function Nv(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return hu(e);case 8:return e===Ed?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function Ui(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function _m(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function kv(t){var e=_m(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){i=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(a){i=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Wa(t){t._valueTracker||(t._valueTracker=kv(t))}function ym(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=_m(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function Xo(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function pu(t,e){var n=e.checked;return Qe({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function Rf(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=Ui(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Sm(t,e){e=e.checked,e!=null&&wd(t,"checked",e,!1)}function mu(t,e){Sm(t,e);var n=Ui(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?gu(t,e.type,n):e.hasOwnProperty("defaultValue")&&gu(t,e.type,Ui(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function Df(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function gu(t,e,n){(e!=="number"||Xo(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Xs=Array.isArray;function ns(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+Ui(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function vu(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(J(91));return Qe({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function Nf(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(J(92));if(Xs(n)){if(1<n.length)throw Error(J(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:Ui(n)}}function Mm(t,e){var n=Ui(e.value),i=Ui(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function kf(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function wm(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function xu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?wm(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ha,Em=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Ha=Ha||document.createElement("div"),Ha.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Ha.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function da(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var ea={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Iv=["Webkit","ms","Moz","O"];Object.keys(ea).forEach(function(t){Iv.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),ea[e]=ea[t]})});function bm(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||ea.hasOwnProperty(t)&&ea[t]?(""+e).trim():e+"px"}function Tm(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=bm(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var Fv=Qe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function _u(t,e){if(e){if(Fv[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(J(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(J(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(J(61))}if(e.style!=null&&typeof e.style!="object")throw Error(J(62))}}function yu(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Su=null;function Cd(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Mu=null,is=null,rs=null;function If(t){if(t=Na(t)){if(typeof Mu!="function")throw Error(J(280));var e=t.stateNode;e&&(e=bl(e),Mu(t.stateNode,t.type,e))}}function Cm(t){is?rs?rs.push(t):rs=[t]:is=t}function Am(){if(is){var t=is,e=rs;if(rs=is=null,If(t),e)for(t=0;t<e.length;t++)If(e[t])}}function Lm(t,e){return t(e)}function Pm(){}var Yl=!1;function Rm(t,e,n){if(Yl)return t(e,n);Yl=!0;try{return Lm(t,e,n)}finally{Yl=!1,(is!==null||rs!==null)&&(Pm(),Am())}}function fa(t,e){var n=t.stateNode;if(n===null)return null;var i=bl(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(J(231,e,typeof n));return n}var wu=!1;if(ui)try{var Ds={};Object.defineProperty(Ds,"passive",{get:function(){wu=!0}}),window.addEventListener("test",Ds,Ds),window.removeEventListener("test",Ds,Ds)}catch{wu=!1}function zv(t,e,n,i,r,s,a,o,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(u){this.onError(u)}}var ta=!1,qo=null,Yo=!1,Eu=null,Ov={onError:function(t){ta=!0,qo=t}};function Uv(t,e,n,i,r,s,a,o,l){ta=!1,qo=null,zv.apply(Ov,arguments)}function Bv(t,e,n,i,r,s,a,o,l){if(Uv.apply(this,arguments),ta){if(ta){var c=qo;ta=!1,qo=null}else throw Error(J(198));Yo||(Yo=!0,Eu=c)}}function Er(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Dm(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Ff(t){if(Er(t)!==t)throw Error(J(188))}function Vv(t){var e=t.alternate;if(!e){if(e=Er(t),e===null)throw Error(J(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return Ff(r),t;if(s===i)return Ff(r),e;s=s.sibling}throw Error(J(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(J(189))}}if(n.alternate!==i)throw Error(J(190))}if(n.tag!==3)throw Error(J(188));return n.stateNode.current===n?t:e}function Nm(t){return t=Vv(t),t!==null?km(t):null}function km(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=km(t);if(e!==null)return e;t=t.sibling}return null}var Im=ln.unstable_scheduleCallback,zf=ln.unstable_cancelCallback,Gv=ln.unstable_shouldYield,Wv=ln.unstable_requestPaint,et=ln.unstable_now,Hv=ln.unstable_getCurrentPriorityLevel,Ad=ln.unstable_ImmediatePriority,Fm=ln.unstable_UserBlockingPriority,Ko=ln.unstable_NormalPriority,jv=ln.unstable_LowPriority,zm=ln.unstable_IdlePriority,Sl=null,Hn=null;function $v(t){if(Hn&&typeof Hn.onCommitFiberRoot=="function")try{Hn.onCommitFiberRoot(Sl,t,void 0,(t.current.flags&128)===128)}catch{}}var In=Math.clz32?Math.clz32:Yv,Xv=Math.log,qv=Math.LN2;function Yv(t){return t>>>=0,t===0?32:31-(Xv(t)/qv|0)|0}var ja=64,$a=4194304;function qs(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Zo(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,a=n&268435455;if(a!==0){var o=a&~r;o!==0?i=qs(o):(s&=a,s!==0&&(i=qs(s)))}else a=n&~r,a!==0?i=qs(a):s!==0&&(i=qs(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-In(e),r=1<<n,i|=t[n],e&=~r;return i}function Kv(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Zv(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var a=31-In(s),o=1<<a,l=r[a];l===-1?(!(o&n)||o&i)&&(r[a]=Kv(o,e)):l<=e&&(t.expiredLanes|=o),s&=~o}}function bu(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function Om(){var t=ja;return ja<<=1,!(ja&4194240)&&(ja=64),t}function Kl(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Ra(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-In(e),t[e]=n}function Qv(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-In(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function Ld(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-In(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var Be=0;function Um(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var Bm,Pd,Vm,Gm,Wm,Tu=!1,Xa=[],Pi=null,Ri=null,Di=null,ha=new Map,pa=new Map,Ti=[],Jv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Of(t,e){switch(t){case"focusin":case"focusout":Pi=null;break;case"dragenter":case"dragleave":Ri=null;break;case"mouseover":case"mouseout":Di=null;break;case"pointerover":case"pointerout":ha.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":pa.delete(e.pointerId)}}function Ns(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Na(e),e!==null&&Pd(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function ex(t,e,n,i,r){switch(e){case"focusin":return Pi=Ns(Pi,t,e,n,i,r),!0;case"dragenter":return Ri=Ns(Ri,t,e,n,i,r),!0;case"mouseover":return Di=Ns(Di,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return ha.set(s,Ns(ha.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,pa.set(s,Ns(pa.get(s)||null,t,e,n,i,r)),!0}return!1}function Hm(t){var e=rr(t.target);if(e!==null){var n=Er(e);if(n!==null){if(e=n.tag,e===13){if(e=Dm(n),e!==null){t.blockedOn=e,Wm(t.priority,function(){Vm(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Ro(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Cu(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);Su=i,n.target.dispatchEvent(i),Su=null}else return e=Na(n),e!==null&&Pd(e),t.blockedOn=n,!1;e.shift()}return!0}function Uf(t,e,n){Ro(t)&&n.delete(e)}function tx(){Tu=!1,Pi!==null&&Ro(Pi)&&(Pi=null),Ri!==null&&Ro(Ri)&&(Ri=null),Di!==null&&Ro(Di)&&(Di=null),ha.forEach(Uf),pa.forEach(Uf)}function ks(t,e){t.blockedOn===e&&(t.blockedOn=null,Tu||(Tu=!0,ln.unstable_scheduleCallback(ln.unstable_NormalPriority,tx)))}function ma(t){function e(r){return ks(r,t)}if(0<Xa.length){ks(Xa[0],t);for(var n=1;n<Xa.length;n++){var i=Xa[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Pi!==null&&ks(Pi,t),Ri!==null&&ks(Ri,t),Di!==null&&ks(Di,t),ha.forEach(e),pa.forEach(e),n=0;n<Ti.length;n++)i=Ti[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Ti.length&&(n=Ti[0],n.blockedOn===null);)Hm(n),n.blockedOn===null&&Ti.shift()}var ss=pi.ReactCurrentBatchConfig,Qo=!0;function nx(t,e,n,i){var r=Be,s=ss.transition;ss.transition=null;try{Be=1,Rd(t,e,n,i)}finally{Be=r,ss.transition=s}}function ix(t,e,n,i){var r=Be,s=ss.transition;ss.transition=null;try{Be=4,Rd(t,e,n,i)}finally{Be=r,ss.transition=s}}function Rd(t,e,n,i){if(Qo){var r=Cu(t,e,n,i);if(r===null)ac(t,e,i,Jo,n),Of(t,i);else if(ex(r,t,e,n,i))i.stopPropagation();else if(Of(t,i),e&4&&-1<Jv.indexOf(t)){for(;r!==null;){var s=Na(r);if(s!==null&&Bm(s),s=Cu(t,e,n,i),s===null&&ac(t,e,i,Jo,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else ac(t,e,i,null,n)}}var Jo=null;function Cu(t,e,n,i){if(Jo=null,t=Cd(i),t=rr(t),t!==null)if(e=Er(t),e===null)t=null;else if(n=e.tag,n===13){if(t=Dm(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Jo=t,null}function jm(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Hv()){case Ad:return 1;case Fm:return 4;case Ko:case jv:return 16;case zm:return 536870912;default:return 16}default:return 16}}var Ai=null,Dd=null,Do=null;function $m(){if(Do)return Do;var t,e=Dd,n=e.length,i,r="value"in Ai?Ai.value:Ai.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return Do=r.slice(t,1<i?1-i:void 0)}function No(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function qa(){return!0}function Bf(){return!1}function un(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?qa:Bf,this.isPropagationStopped=Bf,this}return Qe(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=qa)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=qa)},persist:function(){},isPersistent:qa}),e}var Ts={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Nd=un(Ts),Da=Qe({},Ts,{view:0,detail:0}),rx=un(Da),Zl,Ql,Is,Ml=Qe({},Da,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:kd,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Is&&(Is&&t.type==="mousemove"?(Zl=t.screenX-Is.screenX,Ql=t.screenY-Is.screenY):Ql=Zl=0,Is=t),Zl)},movementY:function(t){return"movementY"in t?t.movementY:Ql}}),Vf=un(Ml),sx=Qe({},Ml,{dataTransfer:0}),ax=un(sx),ox=Qe({},Da,{relatedTarget:0}),Jl=un(ox),lx=Qe({},Ts,{animationName:0,elapsedTime:0,pseudoElement:0}),cx=un(lx),ux=Qe({},Ts,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),dx=un(ux),fx=Qe({},Ts,{data:0}),Gf=un(fx),hx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},px={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},mx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function gx(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=mx[t])?!!e[t]:!1}function kd(){return gx}var vx=Qe({},Da,{key:function(t){if(t.key){var e=hx[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=No(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?px[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:kd,charCode:function(t){return t.type==="keypress"?No(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?No(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),xx=un(vx),_x=Qe({},Ml,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Wf=un(_x),yx=Qe({},Da,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:kd}),Sx=un(yx),Mx=Qe({},Ts,{propertyName:0,elapsedTime:0,pseudoElement:0}),wx=un(Mx),Ex=Qe({},Ml,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),bx=un(Ex),Tx=[9,13,27,32],Id=ui&&"CompositionEvent"in window,na=null;ui&&"documentMode"in document&&(na=document.documentMode);var Cx=ui&&"TextEvent"in window&&!na,Xm=ui&&(!Id||na&&8<na&&11>=na),Hf=" ",jf=!1;function qm(t,e){switch(t){case"keyup":return Tx.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ym(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var jr=!1;function Ax(t,e){switch(t){case"compositionend":return Ym(e);case"keypress":return e.which!==32?null:(jf=!0,Hf);case"textInput":return t=e.data,t===Hf&&jf?null:t;default:return null}}function Lx(t,e){if(jr)return t==="compositionend"||!Id&&qm(t,e)?(t=$m(),Do=Dd=Ai=null,jr=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Xm&&e.locale!=="ko"?null:e.data;default:return null}}var Px={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function $f(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!Px[t.type]:e==="textarea"}function Km(t,e,n,i){Cm(i),e=el(e,"onChange"),0<e.length&&(n=new Nd("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var ia=null,ga=null;function Rx(t){og(t,0)}function wl(t){var e=qr(t);if(ym(e))return t}function Dx(t,e){if(t==="change")return e}var Zm=!1;if(ui){var ec;if(ui){var tc="oninput"in document;if(!tc){var Xf=document.createElement("div");Xf.setAttribute("oninput","return;"),tc=typeof Xf.oninput=="function"}ec=tc}else ec=!1;Zm=ec&&(!document.documentMode||9<document.documentMode)}function qf(){ia&&(ia.detachEvent("onpropertychange",Qm),ga=ia=null)}function Qm(t){if(t.propertyName==="value"&&wl(ga)){var e=[];Km(e,ga,t,Cd(t)),Rm(Rx,e)}}function Nx(t,e,n){t==="focusin"?(qf(),ia=e,ga=n,ia.attachEvent("onpropertychange",Qm)):t==="focusout"&&qf()}function kx(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return wl(ga)}function Ix(t,e){if(t==="click")return wl(e)}function Fx(t,e){if(t==="input"||t==="change")return wl(e)}function zx(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var zn=typeof Object.is=="function"?Object.is:zx;function va(t,e){if(zn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!cu.call(e,r)||!zn(t[r],e[r]))return!1}return!0}function Yf(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Kf(t,e){var n=Yf(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Yf(n)}}function Jm(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Jm(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function eg(){for(var t=window,e=Xo();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Xo(t.document)}return e}function Fd(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function Ox(t){var e=eg(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&Jm(n.ownerDocument.documentElement,n)){if(i!==null&&Fd(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=Kf(n,s);var a=Kf(n,i);r&&a&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==a.node||t.focusOffset!==a.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(a.node,a.offset)):(e.setEnd(a.node,a.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var Ux=ui&&"documentMode"in document&&11>=document.documentMode,$r=null,Au=null,ra=null,Lu=!1;function Zf(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Lu||$r==null||$r!==Xo(i)||(i=$r,"selectionStart"in i&&Fd(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),ra&&va(ra,i)||(ra=i,i=el(Au,"onSelect"),0<i.length&&(e=new Nd("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=$r)))}function Ya(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Xr={animationend:Ya("Animation","AnimationEnd"),animationiteration:Ya("Animation","AnimationIteration"),animationstart:Ya("Animation","AnimationStart"),transitionend:Ya("Transition","TransitionEnd")},nc={},tg={};ui&&(tg=document.createElement("div").style,"AnimationEvent"in window||(delete Xr.animationend.animation,delete Xr.animationiteration.animation,delete Xr.animationstart.animation),"TransitionEvent"in window||delete Xr.transitionend.transition);function El(t){if(nc[t])return nc[t];if(!Xr[t])return t;var e=Xr[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in tg)return nc[t]=e[n];return t}var ng=El("animationend"),ig=El("animationiteration"),rg=El("animationstart"),sg=El("transitionend"),ag=new Map,Qf="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Vi(t,e){ag.set(t,e),wr(e,[t])}for(var ic=0;ic<Qf.length;ic++){var rc=Qf[ic],Bx=rc.toLowerCase(),Vx=rc[0].toUpperCase()+rc.slice(1);Vi(Bx,"on"+Vx)}Vi(ng,"onAnimationEnd");Vi(ig,"onAnimationIteration");Vi(rg,"onAnimationStart");Vi("dblclick","onDoubleClick");Vi("focusin","onFocus");Vi("focusout","onBlur");Vi(sg,"onTransitionEnd");ds("onMouseEnter",["mouseout","mouseover"]);ds("onMouseLeave",["mouseout","mouseover"]);ds("onPointerEnter",["pointerout","pointerover"]);ds("onPointerLeave",["pointerout","pointerover"]);wr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));wr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));wr("onBeforeInput",["compositionend","keypress","textInput","paste"]);wr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));wr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));wr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ys="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Gx=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ys));function Jf(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,Bv(i,e,void 0,t),t.currentTarget=null}function og(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==s&&r.isPropagationStopped())break e;Jf(r,o,c),s=l}else for(a=0;a<i.length;a++){if(o=i[a],l=o.instance,c=o.currentTarget,o=o.listener,l!==s&&r.isPropagationStopped())break e;Jf(r,o,c),s=l}}}if(Yo)throw t=Eu,Yo=!1,Eu=null,t}function He(t,e){var n=e[ku];n===void 0&&(n=e[ku]=new Set);var i=t+"__bubble";n.has(i)||(lg(e,t,2,!1),n.add(i))}function sc(t,e,n){var i=0;e&&(i|=4),lg(n,t,i,e)}var Ka="_reactListening"+Math.random().toString(36).slice(2);function xa(t){if(!t[Ka]){t[Ka]=!0,mm.forEach(function(n){n!=="selectionchange"&&(Gx.has(n)||sc(n,!1,t),sc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Ka]||(e[Ka]=!0,sc("selectionchange",!1,e))}}function lg(t,e,n,i){switch(jm(e)){case 1:var r=nx;break;case 4:r=ix;break;default:r=Rd}n=r.bind(null,e,n,t),r=void 0,!wu||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function ac(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r||o.nodeType===8&&o.parentNode===r)break;if(a===4)for(a=i.return;a!==null;){var l=a.tag;if((l===3||l===4)&&(l=a.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;a=a.return}for(;o!==null;){if(a=rr(o),a===null)return;if(l=a.tag,l===5||l===6){i=s=a;continue e}o=o.parentNode}}i=i.return}Rm(function(){var c=s,u=Cd(n),f=[];e:{var d=ag.get(t);if(d!==void 0){var g=Nd,S=t;switch(t){case"keypress":if(No(n)===0)break e;case"keydown":case"keyup":g=xx;break;case"focusin":S="focus",g=Jl;break;case"focusout":S="blur",g=Jl;break;case"beforeblur":case"afterblur":g=Jl;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":g=Vf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":g=ax;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":g=Sx;break;case ng:case ig:case rg:g=cx;break;case sg:g=wx;break;case"scroll":g=rx;break;case"wheel":g=bx;break;case"copy":case"cut":case"paste":g=dx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":g=Wf}var p=(e&4)!==0,h=!p&&t==="scroll",m=p?d!==null?d+"Capture":null:d;p=[];for(var x=c,y;x!==null;){y=x;var M=y.stateNode;if(y.tag===5&&M!==null&&(y=M,m!==null&&(M=fa(x,m),M!=null&&p.push(_a(x,M,y)))),h)break;x=x.return}0<p.length&&(d=new g(d,S,null,n,u),f.push({event:d,listeners:p}))}}if(!(e&7)){e:{if(d=t==="mouseover"||t==="pointerover",g=t==="mouseout"||t==="pointerout",d&&n!==Su&&(S=n.relatedTarget||n.fromElement)&&(rr(S)||S[di]))break e;if((g||d)&&(d=u.window===u?u:(d=u.ownerDocument)?d.defaultView||d.parentWindow:window,g?(S=n.relatedTarget||n.toElement,g=c,S=S?rr(S):null,S!==null&&(h=Er(S),S!==h||S.tag!==5&&S.tag!==6)&&(S=null)):(g=null,S=c),g!==S)){if(p=Vf,M="onMouseLeave",m="onMouseEnter",x="mouse",(t==="pointerout"||t==="pointerover")&&(p=Wf,M="onPointerLeave",m="onPointerEnter",x="pointer"),h=g==null?d:qr(g),y=S==null?d:qr(S),d=new p(M,x+"leave",g,n,u),d.target=h,d.relatedTarget=y,M=null,rr(u)===c&&(p=new p(m,x+"enter",S,n,u),p.target=y,p.relatedTarget=h,M=p),h=M,g&&S)t:{for(p=g,m=S,x=0,y=p;y;y=br(y))x++;for(y=0,M=m;M;M=br(M))y++;for(;0<x-y;)p=br(p),x--;for(;0<y-x;)m=br(m),y--;for(;x--;){if(p===m||m!==null&&p===m.alternate)break t;p=br(p),m=br(m)}p=null}else p=null;g!==null&&eh(f,d,g,p,!1),S!==null&&h!==null&&eh(f,h,S,p,!0)}}e:{if(d=c?qr(c):window,g=d.nodeName&&d.nodeName.toLowerCase(),g==="select"||g==="input"&&d.type==="file")var w=Dx;else if($f(d))if(Zm)w=Fx;else{w=kx;var T=Nx}else(g=d.nodeName)&&g.toLowerCase()==="input"&&(d.type==="checkbox"||d.type==="radio")&&(w=Ix);if(w&&(w=w(t,c))){Km(f,w,n,u);break e}T&&T(t,d,c),t==="focusout"&&(T=d._wrapperState)&&T.controlled&&d.type==="number"&&gu(d,"number",d.value)}switch(T=c?qr(c):window,t){case"focusin":($f(T)||T.contentEditable==="true")&&($r=T,Au=c,ra=null);break;case"focusout":ra=Au=$r=null;break;case"mousedown":Lu=!0;break;case"contextmenu":case"mouseup":case"dragend":Lu=!1,Zf(f,n,u);break;case"selectionchange":if(Ux)break;case"keydown":case"keyup":Zf(f,n,u)}var P;if(Id)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else jr?qm(t,n)&&(_="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(_="onCompositionStart");_&&(Xm&&n.locale!=="ko"&&(jr||_!=="onCompositionStart"?_==="onCompositionEnd"&&jr&&(P=$m()):(Ai=u,Dd="value"in Ai?Ai.value:Ai.textContent,jr=!0)),T=el(c,_),0<T.length&&(_=new Gf(_,t,null,n,u),f.push({event:_,listeners:T}),P?_.data=P:(P=Ym(n),P!==null&&(_.data=P)))),(P=Cx?Ax(t,n):Lx(t,n))&&(c=el(c,"onBeforeInput"),0<c.length&&(u=new Gf("onBeforeInput","beforeinput",null,n,u),f.push({event:u,listeners:c}),u.data=P))}og(f,e)})}function _a(t,e,n){return{instance:t,listener:e,currentTarget:n}}function el(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=fa(t,n),s!=null&&i.unshift(_a(t,s,r)),s=fa(t,e),s!=null&&i.push(_a(t,s,r))),t=t.return}return i}function br(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function eh(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(l!==null&&l===i)break;o.tag===5&&c!==null&&(o=c,r?(l=fa(n,s),l!=null&&a.unshift(_a(n,l,o))):r||(l=fa(n,s),l!=null&&a.push(_a(n,l,o)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var Wx=/\r\n?/g,Hx=/\u0000|\uFFFD/g;function th(t){return(typeof t=="string"?t:""+t).replace(Wx,`
`).replace(Hx,"")}function Za(t,e,n){if(e=th(e),th(t)!==e&&n)throw Error(J(425))}function tl(){}var Pu=null,Ru=null;function Du(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Nu=typeof setTimeout=="function"?setTimeout:void 0,jx=typeof clearTimeout=="function"?clearTimeout:void 0,nh=typeof Promise=="function"?Promise:void 0,$x=typeof queueMicrotask=="function"?queueMicrotask:typeof nh<"u"?function(t){return nh.resolve(null).then(t).catch(Xx)}:Nu;function Xx(t){setTimeout(function(){throw t})}function oc(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),ma(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);ma(e)}function Ni(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function ih(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Cs=Math.random().toString(36).slice(2),Gn="__reactFiber$"+Cs,ya="__reactProps$"+Cs,di="__reactContainer$"+Cs,ku="__reactEvents$"+Cs,qx="__reactListeners$"+Cs,Yx="__reactHandles$"+Cs;function rr(t){var e=t[Gn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[di]||n[Gn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=ih(t);t!==null;){if(n=t[Gn])return n;t=ih(t)}return e}t=n,n=t.parentNode}return null}function Na(t){return t=t[Gn]||t[di],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function qr(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(J(33))}function bl(t){return t[ya]||null}var Iu=[],Yr=-1;function Gi(t){return{current:t}}function $e(t){0>Yr||(t.current=Iu[Yr],Iu[Yr]=null,Yr--)}function We(t,e){Yr++,Iu[Yr]=t.current,t.current=e}var Bi={},Lt=Gi(Bi),jt=Gi(!1),hr=Bi;function fs(t,e){var n=t.type.contextTypes;if(!n)return Bi;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function $t(t){return t=t.childContextTypes,t!=null}function nl(){$e(jt),$e(Lt)}function rh(t,e,n){if(Lt.current!==Bi)throw Error(J(168));We(Lt,e),We(jt,n)}function cg(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(J(108,Nv(t)||"Unknown",r));return Qe({},n,i)}function il(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||Bi,hr=Lt.current,We(Lt,t),We(jt,jt.current),!0}function sh(t,e,n){var i=t.stateNode;if(!i)throw Error(J(169));n?(t=cg(t,e,hr),i.__reactInternalMemoizedMergedChildContext=t,$e(jt),$e(Lt),We(Lt,t)):$e(jt),We(jt,n)}var ii=null,Tl=!1,lc=!1;function ug(t){ii===null?ii=[t]:ii.push(t)}function Kx(t){Tl=!0,ug(t)}function Wi(){if(!lc&&ii!==null){lc=!0;var t=0,e=Be;try{var n=ii;for(Be=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}ii=null,Tl=!1}catch(r){throw ii!==null&&(ii=ii.slice(t+1)),Im(Ad,Wi),r}finally{Be=e,lc=!1}}return null}var Kr=[],Zr=0,rl=null,sl=0,pn=[],mn=0,pr=null,si=1,ai="";function Qi(t,e){Kr[Zr++]=sl,Kr[Zr++]=rl,rl=t,sl=e}function dg(t,e,n){pn[mn++]=si,pn[mn++]=ai,pn[mn++]=pr,pr=t;var i=si;t=ai;var r=32-In(i)-1;i&=~(1<<r),n+=1;var s=32-In(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,si=1<<32-In(e)+r|n<<r|i,ai=s+t}else si=1<<s|n<<r|i,ai=t}function zd(t){t.return!==null&&(Qi(t,1),dg(t,1,0))}function Od(t){for(;t===rl;)rl=Kr[--Zr],Kr[Zr]=null,sl=Kr[--Zr],Kr[Zr]=null;for(;t===pr;)pr=pn[--mn],pn[mn]=null,ai=pn[--mn],pn[mn]=null,si=pn[--mn],pn[mn]=null}var an=null,rn=null,Ye=!1,Dn=null;function fg(t,e){var n=vn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function ah(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,an=t,rn=Ni(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,an=t,rn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=pr!==null?{id:si,overflow:ai}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=vn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,an=t,rn=null,!0):!1;default:return!1}}function Fu(t){return(t.mode&1)!==0&&(t.flags&128)===0}function zu(t){if(Ye){var e=rn;if(e){var n=e;if(!ah(t,e)){if(Fu(t))throw Error(J(418));e=Ni(n.nextSibling);var i=an;e&&ah(t,e)?fg(i,n):(t.flags=t.flags&-4097|2,Ye=!1,an=t)}}else{if(Fu(t))throw Error(J(418));t.flags=t.flags&-4097|2,Ye=!1,an=t}}}function oh(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;an=t}function Qa(t){if(t!==an)return!1;if(!Ye)return oh(t),Ye=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Du(t.type,t.memoizedProps)),e&&(e=rn)){if(Fu(t))throw hg(),Error(J(418));for(;e;)fg(t,e),e=Ni(e.nextSibling)}if(oh(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(J(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){rn=Ni(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}rn=null}}else rn=an?Ni(t.stateNode.nextSibling):null;return!0}function hg(){for(var t=rn;t;)t=Ni(t.nextSibling)}function hs(){rn=an=null,Ye=!1}function Ud(t){Dn===null?Dn=[t]:Dn.push(t)}var Zx=pi.ReactCurrentBatchConfig;function Fs(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(J(309));var i=n.stateNode}if(!i)throw Error(J(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(a){var o=r.refs;a===null?delete o[s]:o[s]=a},e._stringRef=s,e)}if(typeof t!="string")throw Error(J(284));if(!n._owner)throw Error(J(290,t))}return t}function Ja(t,e){throw t=Object.prototype.toString.call(e),Error(J(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function lh(t){var e=t._init;return e(t._payload)}function pg(t){function e(m,x){if(t){var y=m.deletions;y===null?(m.deletions=[x],m.flags|=16):y.push(x)}}function n(m,x){if(!t)return null;for(;x!==null;)e(m,x),x=x.sibling;return null}function i(m,x){for(m=new Map;x!==null;)x.key!==null?m.set(x.key,x):m.set(x.index,x),x=x.sibling;return m}function r(m,x){return m=zi(m,x),m.index=0,m.sibling=null,m}function s(m,x,y){return m.index=y,t?(y=m.alternate,y!==null?(y=y.index,y<x?(m.flags|=2,x):y):(m.flags|=2,x)):(m.flags|=1048576,x)}function a(m){return t&&m.alternate===null&&(m.flags|=2),m}function o(m,x,y,M){return x===null||x.tag!==6?(x=mc(y,m.mode,M),x.return=m,x):(x=r(x,y),x.return=m,x)}function l(m,x,y,M){var w=y.type;return w===Hr?u(m,x,y.props.children,M,y.key):x!==null&&(x.elementType===w||typeof w=="object"&&w!==null&&w.$$typeof===Ei&&lh(w)===x.type)?(M=r(x,y.props),M.ref=Fs(m,x,y),M.return=m,M):(M=Bo(y.type,y.key,y.props,null,m.mode,M),M.ref=Fs(m,x,y),M.return=m,M)}function c(m,x,y,M){return x===null||x.tag!==4||x.stateNode.containerInfo!==y.containerInfo||x.stateNode.implementation!==y.implementation?(x=gc(y,m.mode,M),x.return=m,x):(x=r(x,y.children||[]),x.return=m,x)}function u(m,x,y,M,w){return x===null||x.tag!==7?(x=ur(y,m.mode,M,w),x.return=m,x):(x=r(x,y),x.return=m,x)}function f(m,x,y){if(typeof x=="string"&&x!==""||typeof x=="number")return x=mc(""+x,m.mode,y),x.return=m,x;if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Ga:return y=Bo(x.type,x.key,x.props,null,m.mode,y),y.ref=Fs(m,null,x),y.return=m,y;case Wr:return x=gc(x,m.mode,y),x.return=m,x;case Ei:var M=x._init;return f(m,M(x._payload),y)}if(Xs(x)||Rs(x))return x=ur(x,m.mode,y,null),x.return=m,x;Ja(m,x)}return null}function d(m,x,y,M){var w=x!==null?x.key:null;if(typeof y=="string"&&y!==""||typeof y=="number")return w!==null?null:o(m,x,""+y,M);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Ga:return y.key===w?l(m,x,y,M):null;case Wr:return y.key===w?c(m,x,y,M):null;case Ei:return w=y._init,d(m,x,w(y._payload),M)}if(Xs(y)||Rs(y))return w!==null?null:u(m,x,y,M,null);Ja(m,y)}return null}function g(m,x,y,M,w){if(typeof M=="string"&&M!==""||typeof M=="number")return m=m.get(y)||null,o(x,m,""+M,w);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case Ga:return m=m.get(M.key===null?y:M.key)||null,l(x,m,M,w);case Wr:return m=m.get(M.key===null?y:M.key)||null,c(x,m,M,w);case Ei:var T=M._init;return g(m,x,y,T(M._payload),w)}if(Xs(M)||Rs(M))return m=m.get(y)||null,u(x,m,M,w,null);Ja(x,M)}return null}function S(m,x,y,M){for(var w=null,T=null,P=x,_=x=0,C=null;P!==null&&_<y.length;_++){P.index>_?(C=P,P=null):C=P.sibling;var L=d(m,P,y[_],M);if(L===null){P===null&&(P=C);break}t&&P&&L.alternate===null&&e(m,P),x=s(L,x,_),T===null?w=L:T.sibling=L,T=L,P=C}if(_===y.length)return n(m,P),Ye&&Qi(m,_),w;if(P===null){for(;_<y.length;_++)P=f(m,y[_],M),P!==null&&(x=s(P,x,_),T===null?w=P:T.sibling=P,T=P);return Ye&&Qi(m,_),w}for(P=i(m,P);_<y.length;_++)C=g(P,m,_,y[_],M),C!==null&&(t&&C.alternate!==null&&P.delete(C.key===null?_:C.key),x=s(C,x,_),T===null?w=C:T.sibling=C,T=C);return t&&P.forEach(function(O){return e(m,O)}),Ye&&Qi(m,_),w}function p(m,x,y,M){var w=Rs(y);if(typeof w!="function")throw Error(J(150));if(y=w.call(y),y==null)throw Error(J(151));for(var T=w=null,P=x,_=x=0,C=null,L=y.next();P!==null&&!L.done;_++,L=y.next()){P.index>_?(C=P,P=null):C=P.sibling;var O=d(m,P,L.value,M);if(O===null){P===null&&(P=C);break}t&&P&&O.alternate===null&&e(m,P),x=s(O,x,_),T===null?w=O:T.sibling=O,T=O,P=C}if(L.done)return n(m,P),Ye&&Qi(m,_),w;if(P===null){for(;!L.done;_++,L=y.next())L=f(m,L.value,M),L!==null&&(x=s(L,x,_),T===null?w=L:T.sibling=L,T=L);return Ye&&Qi(m,_),w}for(P=i(m,P);!L.done;_++,L=y.next())L=g(P,m,_,L.value,M),L!==null&&(t&&L.alternate!==null&&P.delete(L.key===null?_:L.key),x=s(L,x,_),T===null?w=L:T.sibling=L,T=L);return t&&P.forEach(function(re){return e(m,re)}),Ye&&Qi(m,_),w}function h(m,x,y,M){if(typeof y=="object"&&y!==null&&y.type===Hr&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case Ga:e:{for(var w=y.key,T=x;T!==null;){if(T.key===w){if(w=y.type,w===Hr){if(T.tag===7){n(m,T.sibling),x=r(T,y.props.children),x.return=m,m=x;break e}}else if(T.elementType===w||typeof w=="object"&&w!==null&&w.$$typeof===Ei&&lh(w)===T.type){n(m,T.sibling),x=r(T,y.props),x.ref=Fs(m,T,y),x.return=m,m=x;break e}n(m,T);break}else e(m,T);T=T.sibling}y.type===Hr?(x=ur(y.props.children,m.mode,M,y.key),x.return=m,m=x):(M=Bo(y.type,y.key,y.props,null,m.mode,M),M.ref=Fs(m,x,y),M.return=m,m=M)}return a(m);case Wr:e:{for(T=y.key;x!==null;){if(x.key===T)if(x.tag===4&&x.stateNode.containerInfo===y.containerInfo&&x.stateNode.implementation===y.implementation){n(m,x.sibling),x=r(x,y.children||[]),x.return=m,m=x;break e}else{n(m,x);break}else e(m,x);x=x.sibling}x=gc(y,m.mode,M),x.return=m,m=x}return a(m);case Ei:return T=y._init,h(m,x,T(y._payload),M)}if(Xs(y))return S(m,x,y,M);if(Rs(y))return p(m,x,y,M);Ja(m,y)}return typeof y=="string"&&y!==""||typeof y=="number"?(y=""+y,x!==null&&x.tag===6?(n(m,x.sibling),x=r(x,y),x.return=m,m=x):(n(m,x),x=mc(y,m.mode,M),x.return=m,m=x),a(m)):n(m,x)}return h}var ps=pg(!0),mg=pg(!1),al=Gi(null),ol=null,Qr=null,Bd=null;function Vd(){Bd=Qr=ol=null}function Gd(t){var e=al.current;$e(al),t._currentValue=e}function Ou(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function as(t,e){ol=t,Bd=Qr=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(Ht=!0),t.firstContext=null)}function Sn(t){var e=t._currentValue;if(Bd!==t)if(t={context:t,memoizedValue:e,next:null},Qr===null){if(ol===null)throw Error(J(308));Qr=t,ol.dependencies={lanes:0,firstContext:t}}else Qr=Qr.next=t;return e}var sr=null;function Wd(t){sr===null?sr=[t]:sr.push(t)}function gg(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,Wd(e)):(n.next=r.next,r.next=n),e.interleaved=n,fi(t,i)}function fi(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var bi=!1;function Hd(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function vg(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function li(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function ki(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,Ie&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,fi(t,n)}return r=i.interleaved,r===null?(e.next=e,Wd(i)):(e.next=r.next,r.next=e),i.interleaved=e,fi(t,n)}function ko(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,Ld(t,n)}}function ch(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function ll(t,e,n,i){var r=t.updateQueue;bi=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var l=o,c=l.next;l.next=null,a===null?s=c:a.next=c,a=l;var u=t.alternate;u!==null&&(u=u.updateQueue,o=u.lastBaseUpdate,o!==a&&(o===null?u.firstBaseUpdate=c:o.next=c,u.lastBaseUpdate=l))}if(s!==null){var f=r.baseState;a=0,u=c=l=null,o=s;do{var d=o.lane,g=o.eventTime;if((i&d)===d){u!==null&&(u=u.next={eventTime:g,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var S=t,p=o;switch(d=e,g=n,p.tag){case 1:if(S=p.payload,typeof S=="function"){f=S.call(g,f,d);break e}f=S;break e;case 3:S.flags=S.flags&-65537|128;case 0:if(S=p.payload,d=typeof S=="function"?S.call(g,f,d):S,d==null)break e;f=Qe({},f,d);break e;case 2:bi=!0}}o.callback!==null&&o.lane!==0&&(t.flags|=64,d=r.effects,d===null?r.effects=[o]:d.push(o))}else g={eventTime:g,lane:d,tag:o.tag,payload:o.payload,callback:o.callback,next:null},u===null?(c=u=g,l=f):u=u.next=g,a|=d;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;d=o,o=d.next,d.next=null,r.lastBaseUpdate=d,r.shared.pending=null}}while(!0);if(u===null&&(l=f),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,e=r.shared.interleaved,e!==null){r=e;do a|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);gr|=a,t.lanes=a,t.memoizedState=f}}function uh(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(J(191,r));r.call(i)}}}var ka={},jn=Gi(ka),Sa=Gi(ka),Ma=Gi(ka);function ar(t){if(t===ka)throw Error(J(174));return t}function jd(t,e){switch(We(Ma,e),We(Sa,t),We(jn,ka),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:xu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=xu(e,t)}$e(jn),We(jn,e)}function ms(){$e(jn),$e(Sa),$e(Ma)}function xg(t){ar(Ma.current);var e=ar(jn.current),n=xu(e,t.type);e!==n&&(We(Sa,t),We(jn,n))}function $d(t){Sa.current===t&&($e(jn),$e(Sa))}var Ke=Gi(0);function cl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var cc=[];function Xd(){for(var t=0;t<cc.length;t++)cc[t]._workInProgressVersionPrimary=null;cc.length=0}var Io=pi.ReactCurrentDispatcher,uc=pi.ReactCurrentBatchConfig,mr=0,Ze=null,lt=null,gt=null,ul=!1,sa=!1,wa=0,Qx=0;function Et(){throw Error(J(321))}function qd(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!zn(t[n],e[n]))return!1;return!0}function Yd(t,e,n,i,r,s){if(mr=s,Ze=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,Io.current=t===null||t.memoizedState===null?n_:i_,t=n(i,r),sa){s=0;do{if(sa=!1,wa=0,25<=s)throw Error(J(301));s+=1,gt=lt=null,e.updateQueue=null,Io.current=r_,t=n(i,r)}while(sa)}if(Io.current=dl,e=lt!==null&&lt.next!==null,mr=0,gt=lt=Ze=null,ul=!1,e)throw Error(J(300));return t}function Kd(){var t=wa!==0;return wa=0,t}function Un(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return gt===null?Ze.memoizedState=gt=t:gt=gt.next=t,gt}function Mn(){if(lt===null){var t=Ze.alternate;t=t!==null?t.memoizedState:null}else t=lt.next;var e=gt===null?Ze.memoizedState:gt.next;if(e!==null)gt=e,lt=t;else{if(t===null)throw Error(J(310));lt=t,t={memoizedState:lt.memoizedState,baseState:lt.baseState,baseQueue:lt.baseQueue,queue:lt.queue,next:null},gt===null?Ze.memoizedState=gt=t:gt=gt.next=t}return gt}function Ea(t,e){return typeof e=="function"?e(t):e}function dc(t){var e=Mn(),n=e.queue;if(n===null)throw Error(J(311));n.lastRenderedReducer=t;var i=lt,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var o=a=null,l=null,c=s;do{var u=c.lane;if((mr&u)===u)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:t(i,c.action);else{var f={lane:u,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(o=l=f,a=i):l=l.next=f,Ze.lanes|=u,gr|=u}c=c.next}while(c!==null&&c!==s);l===null?a=i:l.next=o,zn(i,e.memoizedState)||(Ht=!0),e.memoizedState=i,e.baseState=a,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,Ze.lanes|=s,gr|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function fc(t){var e=Mn(),n=e.queue;if(n===null)throw Error(J(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);zn(s,e.memoizedState)||(Ht=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function _g(){}function yg(t,e){var n=Ze,i=Mn(),r=e(),s=!zn(i.memoizedState,r);if(s&&(i.memoizedState=r,Ht=!0),i=i.queue,Zd(wg.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||gt!==null&&gt.memoizedState.tag&1){if(n.flags|=2048,ba(9,Mg.bind(null,n,i,r,e),void 0,null),vt===null)throw Error(J(349));mr&30||Sg(n,e,r)}return r}function Sg(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Ze.updateQueue,e===null?(e={lastEffect:null,stores:null},Ze.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function Mg(t,e,n,i){e.value=n,e.getSnapshot=i,Eg(e)&&bg(t)}function wg(t,e,n){return n(function(){Eg(e)&&bg(t)})}function Eg(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!zn(t,n)}catch{return!0}}function bg(t){var e=fi(t,1);e!==null&&Fn(e,t,1,-1)}function dh(t){var e=Un();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ea,lastRenderedState:t},e.queue=t,t=t.dispatch=t_.bind(null,Ze,t),[e.memoizedState,t]}function ba(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=Ze.updateQueue,e===null?(e={lastEffect:null,stores:null},Ze.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function Tg(){return Mn().memoizedState}function Fo(t,e,n,i){var r=Un();Ze.flags|=t,r.memoizedState=ba(1|e,n,void 0,i===void 0?null:i)}function Cl(t,e,n,i){var r=Mn();i=i===void 0?null:i;var s=void 0;if(lt!==null){var a=lt.memoizedState;if(s=a.destroy,i!==null&&qd(i,a.deps)){r.memoizedState=ba(e,n,s,i);return}}Ze.flags|=t,r.memoizedState=ba(1|e,n,s,i)}function fh(t,e){return Fo(8390656,8,t,e)}function Zd(t,e){return Cl(2048,8,t,e)}function Cg(t,e){return Cl(4,2,t,e)}function Ag(t,e){return Cl(4,4,t,e)}function Lg(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Pg(t,e,n){return n=n!=null?n.concat([t]):null,Cl(4,4,Lg.bind(null,e,t),n)}function Qd(){}function Rg(t,e){var n=Mn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&qd(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function Dg(t,e){var n=Mn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&qd(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function Ng(t,e,n){return mr&21?(zn(n,e)||(n=Om(),Ze.lanes|=n,gr|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,Ht=!0),t.memoizedState=n)}function Jx(t,e){var n=Be;Be=n!==0&&4>n?n:4,t(!0);var i=uc.transition;uc.transition={};try{t(!1),e()}finally{Be=n,uc.transition=i}}function kg(){return Mn().memoizedState}function e_(t,e,n){var i=Fi(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},Ig(t))Fg(e,n);else if(n=gg(t,e,n,i),n!==null){var r=Ut();Fn(n,t,i,r),zg(n,e,i)}}function t_(t,e,n){var i=Fi(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ig(t))Fg(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,zn(o,a)){var l=e.interleaved;l===null?(r.next=r,Wd(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=gg(t,e,r,i),n!==null&&(r=Ut(),Fn(n,t,i,r),zg(n,e,i))}}function Ig(t){var e=t.alternate;return t===Ze||e!==null&&e===Ze}function Fg(t,e){sa=ul=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function zg(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,Ld(t,n)}}var dl={readContext:Sn,useCallback:Et,useContext:Et,useEffect:Et,useImperativeHandle:Et,useInsertionEffect:Et,useLayoutEffect:Et,useMemo:Et,useReducer:Et,useRef:Et,useState:Et,useDebugValue:Et,useDeferredValue:Et,useTransition:Et,useMutableSource:Et,useSyncExternalStore:Et,useId:Et,unstable_isNewReconciler:!1},n_={readContext:Sn,useCallback:function(t,e){return Un().memoizedState=[t,e===void 0?null:e],t},useContext:Sn,useEffect:fh,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,Fo(4194308,4,Lg.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Fo(4194308,4,t,e)},useInsertionEffect:function(t,e){return Fo(4,2,t,e)},useMemo:function(t,e){var n=Un();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Un();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=e_.bind(null,Ze,t),[i.memoizedState,t]},useRef:function(t){var e=Un();return t={current:t},e.memoizedState=t},useState:dh,useDebugValue:Qd,useDeferredValue:function(t){return Un().memoizedState=t},useTransition:function(){var t=dh(!1),e=t[0];return t=Jx.bind(null,t[1]),Un().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=Ze,r=Un();if(Ye){if(n===void 0)throw Error(J(407));n=n()}else{if(n=e(),vt===null)throw Error(J(349));mr&30||Sg(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,fh(wg.bind(null,i,s,t),[t]),i.flags|=2048,ba(9,Mg.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Un(),e=vt.identifierPrefix;if(Ye){var n=ai,i=si;n=(i&~(1<<32-In(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=wa++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=Qx++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},i_={readContext:Sn,useCallback:Rg,useContext:Sn,useEffect:Zd,useImperativeHandle:Pg,useInsertionEffect:Cg,useLayoutEffect:Ag,useMemo:Dg,useReducer:dc,useRef:Tg,useState:function(){return dc(Ea)},useDebugValue:Qd,useDeferredValue:function(t){var e=Mn();return Ng(e,lt.memoizedState,t)},useTransition:function(){var t=dc(Ea)[0],e=Mn().memoizedState;return[t,e]},useMutableSource:_g,useSyncExternalStore:yg,useId:kg,unstable_isNewReconciler:!1},r_={readContext:Sn,useCallback:Rg,useContext:Sn,useEffect:Zd,useImperativeHandle:Pg,useInsertionEffect:Cg,useLayoutEffect:Ag,useMemo:Dg,useReducer:fc,useRef:Tg,useState:function(){return fc(Ea)},useDebugValue:Qd,useDeferredValue:function(t){var e=Mn();return lt===null?e.memoizedState=t:Ng(e,lt.memoizedState,t)},useTransition:function(){var t=fc(Ea)[0],e=Mn().memoizedState;return[t,e]},useMutableSource:_g,useSyncExternalStore:yg,useId:kg,unstable_isNewReconciler:!1};function An(t,e){if(t&&t.defaultProps){e=Qe({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Uu(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:Qe({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Al={isMounted:function(t){return(t=t._reactInternals)?Er(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Ut(),r=Fi(t),s=li(i,r);s.payload=e,n!=null&&(s.callback=n),e=ki(t,s,r),e!==null&&(Fn(e,t,r,i),ko(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Ut(),r=Fi(t),s=li(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=ki(t,s,r),e!==null&&(Fn(e,t,r,i),ko(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Ut(),i=Fi(t),r=li(n,i);r.tag=2,e!=null&&(r.callback=e),e=ki(t,r,i),e!==null&&(Fn(e,t,i,n),ko(e,t,i))}};function hh(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!va(n,i)||!va(r,s):!0}function Og(t,e,n){var i=!1,r=Bi,s=e.contextType;return typeof s=="object"&&s!==null?s=Sn(s):(r=$t(e)?hr:Lt.current,i=e.contextTypes,s=(i=i!=null)?fs(t,r):Bi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Al,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function ph(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&Al.enqueueReplaceState(e,e.state,null)}function Bu(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},Hd(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Sn(s):(s=$t(e)?hr:Lt.current,r.context=fs(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Uu(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&Al.enqueueReplaceState(r,r.state,null),ll(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function gs(t,e){try{var n="",i=e;do n+=Dv(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function hc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Vu(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var s_=typeof WeakMap=="function"?WeakMap:Map;function Ug(t,e,n){n=li(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){hl||(hl=!0,Zu=i),Vu(t,e)},n}function Bg(t,e,n){n=li(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){Vu(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Vu(t,e),typeof i!="function"&&(Ii===null?Ii=new Set([this]):Ii.add(this));var a=e.stack;this.componentDidCatch(e.value,{componentStack:a!==null?a:""})}),n}function mh(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new s_;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=__.bind(null,t,e,n),e.then(t,t))}function gh(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function vh(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=li(-1,1),e.tag=2,ki(n,e,1))),n.lanes|=1),t)}var a_=pi.ReactCurrentOwner,Ht=!1;function Ft(t,e,n,i){e.child=t===null?mg(e,null,n,i):ps(e,t.child,n,i)}function xh(t,e,n,i,r){n=n.render;var s=e.ref;return as(e,r),i=Yd(t,e,n,i,s,r),n=Kd(),t!==null&&!Ht?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,hi(t,e,r)):(Ye&&n&&zd(e),e.flags|=1,Ft(t,e,i,r),e.child)}function _h(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!of(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,Vg(t,e,s,i,r)):(t=Bo(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:va,n(a,i)&&t.ref===e.ref)return hi(t,e,r)}return e.flags|=1,t=zi(s,i),t.ref=e.ref,t.return=e,e.child=t}function Vg(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(va(s,i)&&t.ref===e.ref)if(Ht=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(Ht=!0);else return e.lanes=t.lanes,hi(t,e,r)}return Gu(t,e,n,i,r)}function Gg(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},We(es,tn),tn|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,We(es,tn),tn|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,We(es,tn),tn|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,We(es,tn),tn|=i;return Ft(t,e,r,n),e.child}function Wg(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Gu(t,e,n,i,r){var s=$t(n)?hr:Lt.current;return s=fs(e,s),as(e,r),n=Yd(t,e,n,i,s,r),i=Kd(),t!==null&&!Ht?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,hi(t,e,r)):(Ye&&i&&zd(e),e.flags|=1,Ft(t,e,n,r),e.child)}function yh(t,e,n,i,r){if($t(n)){var s=!0;il(e)}else s=!1;if(as(e,r),e.stateNode===null)zo(t,e),Og(e,n,i),Bu(e,n,i,r),i=!0;else if(t===null){var a=e.stateNode,o=e.memoizedProps;a.props=o;var l=a.context,c=n.contextType;typeof c=="object"&&c!==null?c=Sn(c):(c=$t(n)?hr:Lt.current,c=fs(e,c));var u=n.getDerivedStateFromProps,f=typeof u=="function"||typeof a.getSnapshotBeforeUpdate=="function";f||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==i||l!==c)&&ph(e,a,i,c),bi=!1;var d=e.memoizedState;a.state=d,ll(e,i,a,r),l=e.memoizedState,o!==i||d!==l||jt.current||bi?(typeof u=="function"&&(Uu(e,n,u,i),l=e.memoizedState),(o=bi||hh(e,n,o,i,d,l,c))?(f||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),a.props=i,a.state=l,a.context=c,i=o):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{a=e.stateNode,vg(t,e),o=e.memoizedProps,c=e.type===e.elementType?o:An(e.type,o),a.props=c,f=e.pendingProps,d=a.context,l=n.contextType,typeof l=="object"&&l!==null?l=Sn(l):(l=$t(n)?hr:Lt.current,l=fs(e,l));var g=n.getDerivedStateFromProps;(u=typeof g=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==f||d!==l)&&ph(e,a,i,l),bi=!1,d=e.memoizedState,a.state=d,ll(e,i,a,r);var S=e.memoizedState;o!==f||d!==S||jt.current||bi?(typeof g=="function"&&(Uu(e,n,g,i),S=e.memoizedState),(c=bi||hh(e,n,c,i,d,S,l)||!1)?(u||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,S,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,S,l)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=S),a.props=i,a.state=S,a.context=l,i=c):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&d===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&d===t.memoizedState||(e.flags|=1024),i=!1)}return Wu(t,e,n,i,s,r)}function Wu(t,e,n,i,r,s){Wg(t,e);var a=(e.flags&128)!==0;if(!i&&!a)return r&&sh(e,n,!1),hi(t,e,s);i=e.stateNode,a_.current=e;var o=a&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&a?(e.child=ps(e,t.child,null,s),e.child=ps(e,null,o,s)):Ft(t,e,o,s),e.memoizedState=i.state,r&&sh(e,n,!0),e.child}function Hg(t){var e=t.stateNode;e.pendingContext?rh(t,e.pendingContext,e.pendingContext!==e.context):e.context&&rh(t,e.context,!1),jd(t,e.containerInfo)}function Sh(t,e,n,i,r){return hs(),Ud(r),e.flags|=256,Ft(t,e,n,i),e.child}var Hu={dehydrated:null,treeContext:null,retryLane:0};function ju(t){return{baseLanes:t,cachePool:null,transitions:null}}function jg(t,e,n){var i=e.pendingProps,r=Ke.current,s=!1,a=(e.flags&128)!==0,o;if((o=a)||(o=t!==null&&t.memoizedState===null?!1:(r&2)!==0),o?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),We(Ke,r&1),t===null)return zu(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(a=i.children,t=i.fallback,s?(i=e.mode,s=e.child,a={mode:"hidden",children:a},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=a):s=Rl(a,i,0,null),t=ur(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=ju(n),e.memoizedState=Hu,t):Jd(e,a));if(r=t.memoizedState,r!==null&&(o=r.dehydrated,o!==null))return o_(t,e,a,i,o,r,n);if(s){s=i.fallback,a=e.mode,r=t.child,o=r.sibling;var l={mode:"hidden",children:i.children};return!(a&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=zi(r,l),i.subtreeFlags=r.subtreeFlags&14680064),o!==null?s=zi(o,s):(s=ur(s,a,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,a=t.child.memoizedState,a=a===null?ju(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},s.memoizedState=a,s.childLanes=t.childLanes&~n,e.memoizedState=Hu,i}return s=t.child,t=s.sibling,i=zi(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function Jd(t,e){return e=Rl({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function eo(t,e,n,i){return i!==null&&Ud(i),ps(e,t.child,null,n),t=Jd(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function o_(t,e,n,i,r,s,a){if(n)return e.flags&256?(e.flags&=-257,i=hc(Error(J(422))),eo(t,e,a,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=Rl({mode:"visible",children:i.children},r,0,null),s=ur(s,r,a,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&ps(e,t.child,null,a),e.child.memoizedState=ju(a),e.memoizedState=Hu,s);if(!(e.mode&1))return eo(t,e,a,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var o=i.dgst;return i=o,s=Error(J(419)),i=hc(s,i,void 0),eo(t,e,a,i)}if(o=(a&t.childLanes)!==0,Ht||o){if(i=vt,i!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|a)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,fi(t,r),Fn(i,t,r,-1))}return af(),i=hc(Error(J(421))),eo(t,e,a,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=y_.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,rn=Ni(r.nextSibling),an=e,Ye=!0,Dn=null,t!==null&&(pn[mn++]=si,pn[mn++]=ai,pn[mn++]=pr,si=t.id,ai=t.overflow,pr=e),e=Jd(e,i.children),e.flags|=4096,e)}function Mh(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),Ou(t.return,e,n)}function pc(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function $g(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(Ft(t,e,i.children,n),i=Ke.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Mh(t,n,e);else if(t.tag===19)Mh(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(We(Ke,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&cl(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),pc(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&cl(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}pc(e,!0,n,null,s);break;case"together":pc(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function zo(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function hi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),gr|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(J(153));if(e.child!==null){for(t=e.child,n=zi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=zi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function l_(t,e,n){switch(e.tag){case 3:Hg(e),hs();break;case 5:xg(e);break;case 1:$t(e.type)&&il(e);break;case 4:jd(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;We(al,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(We(Ke,Ke.current&1),e.flags|=128,null):n&e.child.childLanes?jg(t,e,n):(We(Ke,Ke.current&1),t=hi(t,e,n),t!==null?t.sibling:null);We(Ke,Ke.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return $g(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),We(Ke,Ke.current),i)break;return null;case 22:case 23:return e.lanes=0,Gg(t,e,n)}return hi(t,e,n)}var Xg,$u,qg,Yg;Xg=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};$u=function(){};qg=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,ar(jn.current);var s=null;switch(n){case"input":r=pu(t,r),i=pu(t,i),s=[];break;case"select":r=Qe({},r,{value:void 0}),i=Qe({},i,{value:void 0}),s=[];break;case"textarea":r=vu(t,r),i=vu(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=tl)}_u(n,i);var a;n=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var o=r[c];for(a in o)o.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(ua.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(o=r!=null?r[c]:void 0,i.hasOwnProperty(c)&&l!==o&&(l!=null||o!=null))if(c==="style")if(o){for(a in o)!o.hasOwnProperty(a)||l&&l.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in l)l.hasOwnProperty(a)&&o[a]!==l[a]&&(n||(n={}),n[a]=l[a])}else n||(s||(s=[]),s.push(c,n)),n=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,o=o?o.__html:void 0,l!=null&&o!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(ua.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&He("scroll",t),s||o===l||(s=[])):(s=s||[]).push(c,l))}n&&(s=s||[]).push("style",n);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};Yg=function(t,e,n,i){n!==i&&(e.flags|=4)};function zs(t,e){if(!Ye)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function bt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function c_(t,e,n){var i=e.pendingProps;switch(Od(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return bt(e),null;case 1:return $t(e.type)&&nl(),bt(e),null;case 3:return i=e.stateNode,ms(),$e(jt),$e(Lt),Xd(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(Qa(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Dn!==null&&(ed(Dn),Dn=null))),$u(t,e),bt(e),null;case 5:$d(e);var r=ar(Ma.current);if(n=e.type,t!==null&&e.stateNode!=null)qg(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(J(166));return bt(e),null}if(t=ar(jn.current),Qa(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[Gn]=e,i[ya]=s,t=(e.mode&1)!==0,n){case"dialog":He("cancel",i),He("close",i);break;case"iframe":case"object":case"embed":He("load",i);break;case"video":case"audio":for(r=0;r<Ys.length;r++)He(Ys[r],i);break;case"source":He("error",i);break;case"img":case"image":case"link":He("error",i),He("load",i);break;case"details":He("toggle",i);break;case"input":Rf(i,s),He("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},He("invalid",i);break;case"textarea":Nf(i,s),He("invalid",i)}_u(n,s),r=null;for(var a in s)if(s.hasOwnProperty(a)){var o=s[a];a==="children"?typeof o=="string"?i.textContent!==o&&(s.suppressHydrationWarning!==!0&&Za(i.textContent,o,t),r=["children",o]):typeof o=="number"&&i.textContent!==""+o&&(s.suppressHydrationWarning!==!0&&Za(i.textContent,o,t),r=["children",""+o]):ua.hasOwnProperty(a)&&o!=null&&a==="onScroll"&&He("scroll",i)}switch(n){case"input":Wa(i),Df(i,s,!0);break;case"textarea":Wa(i),kf(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=tl)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=wm(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=a.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=a.createElement(n,{is:i.is}):(t=a.createElement(n),n==="select"&&(a=t,i.multiple?a.multiple=!0:i.size&&(a.size=i.size))):t=a.createElementNS(t,n),t[Gn]=e,t[ya]=i,Xg(t,e,!1,!1),e.stateNode=t;e:{switch(a=yu(n,i),n){case"dialog":He("cancel",t),He("close",t),r=i;break;case"iframe":case"object":case"embed":He("load",t),r=i;break;case"video":case"audio":for(r=0;r<Ys.length;r++)He(Ys[r],t);r=i;break;case"source":He("error",t),r=i;break;case"img":case"image":case"link":He("error",t),He("load",t),r=i;break;case"details":He("toggle",t),r=i;break;case"input":Rf(t,i),r=pu(t,i),He("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=Qe({},i,{value:void 0}),He("invalid",t);break;case"textarea":Nf(t,i),r=vu(t,i),He("invalid",t);break;default:r=i}_u(n,r),o=r;for(s in o)if(o.hasOwnProperty(s)){var l=o[s];s==="style"?Tm(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&Em(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&da(t,l):typeof l=="number"&&da(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(ua.hasOwnProperty(s)?l!=null&&s==="onScroll"&&He("scroll",t):l!=null&&wd(t,s,l,a))}switch(n){case"input":Wa(t),Df(t,i,!1);break;case"textarea":Wa(t),kf(t);break;case"option":i.value!=null&&t.setAttribute("value",""+Ui(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?ns(t,!!i.multiple,s,!1):i.defaultValue!=null&&ns(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=tl)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return bt(e),null;case 6:if(t&&e.stateNode!=null)Yg(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(J(166));if(n=ar(Ma.current),ar(jn.current),Qa(e)){if(i=e.stateNode,n=e.memoizedProps,i[Gn]=e,(s=i.nodeValue!==n)&&(t=an,t!==null))switch(t.tag){case 3:Za(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Za(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[Gn]=e,e.stateNode=i}return bt(e),null;case 13:if($e(Ke),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(Ye&&rn!==null&&e.mode&1&&!(e.flags&128))hg(),hs(),e.flags|=98560,s=!1;else if(s=Qa(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(J(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(J(317));s[Gn]=e}else hs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;bt(e),s=!1}else Dn!==null&&(ed(Dn),Dn=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||Ke.current&1?ct===0&&(ct=3):af())),e.updateQueue!==null&&(e.flags|=4),bt(e),null);case 4:return ms(),$u(t,e),t===null&&xa(e.stateNode.containerInfo),bt(e),null;case 10:return Gd(e.type._context),bt(e),null;case 17:return $t(e.type)&&nl(),bt(e),null;case 19:if($e(Ke),s=e.memoizedState,s===null)return bt(e),null;if(i=(e.flags&128)!==0,a=s.rendering,a===null)if(i)zs(s,!1);else{if(ct!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(a=cl(t),a!==null){for(e.flags|=128,zs(s,!1),i=a.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,a=s.alternate,a===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=a.childLanes,s.lanes=a.lanes,s.child=a.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=a.memoizedProps,s.memoizedState=a.memoizedState,s.updateQueue=a.updateQueue,s.type=a.type,t=a.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return We(Ke,Ke.current&1|2),e.child}t=t.sibling}s.tail!==null&&et()>vs&&(e.flags|=128,i=!0,zs(s,!1),e.lanes=4194304)}else{if(!i)if(t=cl(a),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),zs(s,!0),s.tail===null&&s.tailMode==="hidden"&&!a.alternate&&!Ye)return bt(e),null}else 2*et()-s.renderingStartTime>vs&&n!==1073741824&&(e.flags|=128,i=!0,zs(s,!1),e.lanes=4194304);s.isBackwards?(a.sibling=e.child,e.child=a):(n=s.last,n!==null?n.sibling=a:e.child=a,s.last=a)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=et(),e.sibling=null,n=Ke.current,We(Ke,i?n&1|2:n&1),e):(bt(e),null);case 22:case 23:return sf(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?tn&1073741824&&(bt(e),e.subtreeFlags&6&&(e.flags|=8192)):bt(e),null;case 24:return null;case 25:return null}throw Error(J(156,e.tag))}function u_(t,e){switch(Od(e),e.tag){case 1:return $t(e.type)&&nl(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return ms(),$e(jt),$e(Lt),Xd(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return $d(e),null;case 13:if($e(Ke),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(J(340));hs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return $e(Ke),null;case 4:return ms(),null;case 10:return Gd(e.type._context),null;case 22:case 23:return sf(),null;case 24:return null;default:return null}}var to=!1,Ct=!1,d_=typeof WeakSet=="function"?WeakSet:Set,ue=null;function Jr(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){Je(t,e,i)}else n.current=null}function Xu(t,e,n){try{n()}catch(i){Je(t,e,i)}}var wh=!1;function f_(t,e){if(Pu=Qo,t=eg(),Fd(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,l=-1,c=0,u=0,f=t,d=null;t:for(;;){for(var g;f!==n||r!==0&&f.nodeType!==3||(o=a+r),f!==s||i!==0&&f.nodeType!==3||(l=a+i),f.nodeType===3&&(a+=f.nodeValue.length),(g=f.firstChild)!==null;)d=f,f=g;for(;;){if(f===t)break t;if(d===n&&++c===r&&(o=a),d===s&&++u===i&&(l=a),(g=f.nextSibling)!==null)break;f=d,d=f.parentNode}f=g}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Ru={focusedElem:t,selectionRange:n},Qo=!1,ue=e;ue!==null;)if(e=ue,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,ue=t;else for(;ue!==null;){e=ue;try{var S=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(S!==null){var p=S.memoizedProps,h=S.memoizedState,m=e.stateNode,x=m.getSnapshotBeforeUpdate(e.elementType===e.type?p:An(e.type,p),h);m.__reactInternalSnapshotBeforeUpdate=x}break;case 3:var y=e.stateNode.containerInfo;y.nodeType===1?y.textContent="":y.nodeType===9&&y.documentElement&&y.removeChild(y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(J(163))}}catch(M){Je(e,e.return,M)}if(t=e.sibling,t!==null){t.return=e.return,ue=t;break}ue=e.return}return S=wh,wh=!1,S}function aa(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&Xu(e,n,s)}r=r.next}while(r!==i)}}function Ll(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function qu(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function Kg(t){var e=t.alternate;e!==null&&(t.alternate=null,Kg(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Gn],delete e[ya],delete e[ku],delete e[qx],delete e[Yx])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function Zg(t){return t.tag===5||t.tag===3||t.tag===4}function Eh(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Zg(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Yu(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=tl));else if(i!==4&&(t=t.child,t!==null))for(Yu(t,e,n),t=t.sibling;t!==null;)Yu(t,e,n),t=t.sibling}function Ku(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(Ku(t,e,n),t=t.sibling;t!==null;)Ku(t,e,n),t=t.sibling}var xt=null,Pn=!1;function mi(t,e,n){for(n=n.child;n!==null;)Qg(t,e,n),n=n.sibling}function Qg(t,e,n){if(Hn&&typeof Hn.onCommitFiberUnmount=="function")try{Hn.onCommitFiberUnmount(Sl,n)}catch{}switch(n.tag){case 5:Ct||Jr(n,e);case 6:var i=xt,r=Pn;xt=null,mi(t,e,n),xt=i,Pn=r,xt!==null&&(Pn?(t=xt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):xt.removeChild(n.stateNode));break;case 18:xt!==null&&(Pn?(t=xt,n=n.stateNode,t.nodeType===8?oc(t.parentNode,n):t.nodeType===1&&oc(t,n),ma(t)):oc(xt,n.stateNode));break;case 4:i=xt,r=Pn,xt=n.stateNode.containerInfo,Pn=!0,mi(t,e,n),xt=i,Pn=r;break;case 0:case 11:case 14:case 15:if(!Ct&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,a=s.destroy;s=s.tag,a!==void 0&&(s&2||s&4)&&Xu(n,e,a),r=r.next}while(r!==i)}mi(t,e,n);break;case 1:if(!Ct&&(Jr(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(o){Je(n,e,o)}mi(t,e,n);break;case 21:mi(t,e,n);break;case 22:n.mode&1?(Ct=(i=Ct)||n.memoizedState!==null,mi(t,e,n),Ct=i):mi(t,e,n);break;default:mi(t,e,n)}}function bh(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new d_),e.forEach(function(i){var r=S_.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function En(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 5:xt=o.stateNode,Pn=!1;break e;case 3:xt=o.stateNode.containerInfo,Pn=!0;break e;case 4:xt=o.stateNode.containerInfo,Pn=!0;break e}o=o.return}if(xt===null)throw Error(J(160));Qg(s,a,r),xt=null,Pn=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){Je(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)Jg(e,t),e=e.sibling}function Jg(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(En(e,t),On(t),i&4){try{aa(3,t,t.return),Ll(3,t)}catch(p){Je(t,t.return,p)}try{aa(5,t,t.return)}catch(p){Je(t,t.return,p)}}break;case 1:En(e,t),On(t),i&512&&n!==null&&Jr(n,n.return);break;case 5:if(En(e,t),On(t),i&512&&n!==null&&Jr(n,n.return),t.flags&32){var r=t.stateNode;try{da(r,"")}catch(p){Je(t,t.return,p)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,a=n!==null?n.memoizedProps:s,o=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{o==="input"&&s.type==="radio"&&s.name!=null&&Sm(r,s),yu(o,a);var c=yu(o,s);for(a=0;a<l.length;a+=2){var u=l[a],f=l[a+1];u==="style"?Tm(r,f):u==="dangerouslySetInnerHTML"?Em(r,f):u==="children"?da(r,f):wd(r,u,f,c)}switch(o){case"input":mu(r,s);break;case"textarea":Mm(r,s);break;case"select":var d=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var g=s.value;g!=null?ns(r,!!s.multiple,g,!1):d!==!!s.multiple&&(s.defaultValue!=null?ns(r,!!s.multiple,s.defaultValue,!0):ns(r,!!s.multiple,s.multiple?[]:"",!1))}r[ya]=s}catch(p){Je(t,t.return,p)}}break;case 6:if(En(e,t),On(t),i&4){if(t.stateNode===null)throw Error(J(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(p){Je(t,t.return,p)}}break;case 3:if(En(e,t),On(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{ma(e.containerInfo)}catch(p){Je(t,t.return,p)}break;case 4:En(e,t),On(t);break;case 13:En(e,t),On(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(nf=et())),i&4&&bh(t);break;case 22:if(u=n!==null&&n.memoizedState!==null,t.mode&1?(Ct=(c=Ct)||u,En(e,t),Ct=c):En(e,t),On(t),i&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!u&&t.mode&1)for(ue=t,u=t.child;u!==null;){for(f=ue=u;ue!==null;){switch(d=ue,g=d.child,d.tag){case 0:case 11:case 14:case 15:aa(4,d,d.return);break;case 1:Jr(d,d.return);var S=d.stateNode;if(typeof S.componentWillUnmount=="function"){i=d,n=d.return;try{e=i,S.props=e.memoizedProps,S.state=e.memoizedState,S.componentWillUnmount()}catch(p){Je(i,n,p)}}break;case 5:Jr(d,d.return);break;case 22:if(d.memoizedState!==null){Ch(f);continue}}g!==null?(g.return=d,ue=g):Ch(f)}u=u.sibling}e:for(u=null,f=t;;){if(f.tag===5){if(u===null){u=f;try{r=f.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(o=f.stateNode,l=f.memoizedProps.style,a=l!=null&&l.hasOwnProperty("display")?l.display:null,o.style.display=bm("display",a))}catch(p){Je(t,t.return,p)}}}else if(f.tag===6){if(u===null)try{f.stateNode.nodeValue=c?"":f.memoizedProps}catch(p){Je(t,t.return,p)}}else if((f.tag!==22&&f.tag!==23||f.memoizedState===null||f===t)&&f.child!==null){f.child.return=f,f=f.child;continue}if(f===t)break e;for(;f.sibling===null;){if(f.return===null||f.return===t)break e;u===f&&(u=null),f=f.return}u===f&&(u=null),f.sibling.return=f.return,f=f.sibling}}break;case 19:En(e,t),On(t),i&4&&bh(t);break;case 21:break;default:En(e,t),On(t)}}function On(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(Zg(n)){var i=n;break e}n=n.return}throw Error(J(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(da(r,""),i.flags&=-33);var s=Eh(t);Ku(t,s,r);break;case 3:case 4:var a=i.stateNode.containerInfo,o=Eh(t);Yu(t,o,a);break;default:throw Error(J(161))}}catch(l){Je(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function h_(t,e,n){ue=t,e0(t)}function e0(t,e,n){for(var i=(t.mode&1)!==0;ue!==null;){var r=ue,s=r.child;if(r.tag===22&&i){var a=r.memoizedState!==null||to;if(!a){var o=r.alternate,l=o!==null&&o.memoizedState!==null||Ct;o=to;var c=Ct;if(to=a,(Ct=l)&&!c)for(ue=r;ue!==null;)a=ue,l=a.child,a.tag===22&&a.memoizedState!==null?Ah(r):l!==null?(l.return=a,ue=l):Ah(r);for(;s!==null;)ue=s,e0(s),s=s.sibling;ue=r,to=o,Ct=c}Th(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,ue=s):Th(t)}}function Th(t){for(;ue!==null;){var e=ue;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:Ct||Ll(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!Ct)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:An(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&uh(e,s,i);break;case 3:var a=e.updateQueue;if(a!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}uh(e,a,n)}break;case 5:var o=e.stateNode;if(n===null&&e.flags&4){n=o;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var u=c.memoizedState;if(u!==null){var f=u.dehydrated;f!==null&&ma(f)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(J(163))}Ct||e.flags&512&&qu(e)}catch(d){Je(e,e.return,d)}}if(e===t){ue=null;break}if(n=e.sibling,n!==null){n.return=e.return,ue=n;break}ue=e.return}}function Ch(t){for(;ue!==null;){var e=ue;if(e===t){ue=null;break}var n=e.sibling;if(n!==null){n.return=e.return,ue=n;break}ue=e.return}}function Ah(t){for(;ue!==null;){var e=ue;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Ll(4,e)}catch(l){Je(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){Je(e,r,l)}}var s=e.return;try{qu(e)}catch(l){Je(e,s,l)}break;case 5:var a=e.return;try{qu(e)}catch(l){Je(e,a,l)}}}catch(l){Je(e,e.return,l)}if(e===t){ue=null;break}var o=e.sibling;if(o!==null){o.return=e.return,ue=o;break}ue=e.return}}var p_=Math.ceil,fl=pi.ReactCurrentDispatcher,ef=pi.ReactCurrentOwner,_n=pi.ReactCurrentBatchConfig,Ie=0,vt=null,rt=null,yt=0,tn=0,es=Gi(0),ct=0,Ta=null,gr=0,Pl=0,tf=0,oa=null,Gt=null,nf=0,vs=1/0,ni=null,hl=!1,Zu=null,Ii=null,no=!1,Li=null,pl=0,la=0,Qu=null,Oo=-1,Uo=0;function Ut(){return Ie&6?et():Oo!==-1?Oo:Oo=et()}function Fi(t){return t.mode&1?Ie&2&&yt!==0?yt&-yt:Zx.transition!==null?(Uo===0&&(Uo=Om()),Uo):(t=Be,t!==0||(t=window.event,t=t===void 0?16:jm(t.type)),t):1}function Fn(t,e,n,i){if(50<la)throw la=0,Qu=null,Error(J(185));Ra(t,n,i),(!(Ie&2)||t!==vt)&&(t===vt&&(!(Ie&2)&&(Pl|=n),ct===4&&Ci(t,yt)),Xt(t,i),n===1&&Ie===0&&!(e.mode&1)&&(vs=et()+500,Tl&&Wi()))}function Xt(t,e){var n=t.callbackNode;Zv(t,e);var i=Zo(t,t===vt?yt:0);if(i===0)n!==null&&zf(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&zf(n),e===1)t.tag===0?Kx(Lh.bind(null,t)):ug(Lh.bind(null,t)),$x(function(){!(Ie&6)&&Wi()}),n=null;else{switch(Um(i)){case 1:n=Ad;break;case 4:n=Fm;break;case 16:n=Ko;break;case 536870912:n=zm;break;default:n=Ko}n=l0(n,t0.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function t0(t,e){if(Oo=-1,Uo=0,Ie&6)throw Error(J(327));var n=t.callbackNode;if(os()&&t.callbackNode!==n)return null;var i=Zo(t,t===vt?yt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=ml(t,i);else{e=i;var r=Ie;Ie|=2;var s=i0();(vt!==t||yt!==e)&&(ni=null,vs=et()+500,cr(t,e));do try{v_();break}catch(o){n0(t,o)}while(!0);Vd(),fl.current=s,Ie=r,rt!==null?e=0:(vt=null,yt=0,e=ct)}if(e!==0){if(e===2&&(r=bu(t),r!==0&&(i=r,e=Ju(t,r))),e===1)throw n=Ta,cr(t,0),Ci(t,i),Xt(t,et()),n;if(e===6)Ci(t,i);else{if(r=t.current.alternate,!(i&30)&&!m_(r)&&(e=ml(t,i),e===2&&(s=bu(t),s!==0&&(i=s,e=Ju(t,s))),e===1))throw n=Ta,cr(t,0),Ci(t,i),Xt(t,et()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(J(345));case 2:Ji(t,Gt,ni);break;case 3:if(Ci(t,i),(i&130023424)===i&&(e=nf+500-et(),10<e)){if(Zo(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){Ut(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=Nu(Ji.bind(null,t,Gt,ni),e);break}Ji(t,Gt,ni);break;case 4:if(Ci(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var a=31-In(i);s=1<<a,a=e[a],a>r&&(r=a),i&=~s}if(i=r,i=et()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*p_(i/1960))-i,10<i){t.timeoutHandle=Nu(Ji.bind(null,t,Gt,ni),i);break}Ji(t,Gt,ni);break;case 5:Ji(t,Gt,ni);break;default:throw Error(J(329))}}}return Xt(t,et()),t.callbackNode===n?t0.bind(null,t):null}function Ju(t,e){var n=oa;return t.current.memoizedState.isDehydrated&&(cr(t,e).flags|=256),t=ml(t,e),t!==2&&(e=Gt,Gt=n,e!==null&&ed(e)),t}function ed(t){Gt===null?Gt=t:Gt.push.apply(Gt,t)}function m_(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!zn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Ci(t,e){for(e&=~tf,e&=~Pl,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-In(e),i=1<<n;t[n]=-1,e&=~i}}function Lh(t){if(Ie&6)throw Error(J(327));os();var e=Zo(t,0);if(!(e&1))return Xt(t,et()),null;var n=ml(t,e);if(t.tag!==0&&n===2){var i=bu(t);i!==0&&(e=i,n=Ju(t,i))}if(n===1)throw n=Ta,cr(t,0),Ci(t,e),Xt(t,et()),n;if(n===6)throw Error(J(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,Ji(t,Gt,ni),Xt(t,et()),null}function rf(t,e){var n=Ie;Ie|=1;try{return t(e)}finally{Ie=n,Ie===0&&(vs=et()+500,Tl&&Wi())}}function vr(t){Li!==null&&Li.tag===0&&!(Ie&6)&&os();var e=Ie;Ie|=1;var n=_n.transition,i=Be;try{if(_n.transition=null,Be=1,t)return t()}finally{Be=i,_n.transition=n,Ie=e,!(Ie&6)&&Wi()}}function sf(){tn=es.current,$e(es)}function cr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,jx(n)),rt!==null)for(n=rt.return;n!==null;){var i=n;switch(Od(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&nl();break;case 3:ms(),$e(jt),$e(Lt),Xd();break;case 5:$d(i);break;case 4:ms();break;case 13:$e(Ke);break;case 19:$e(Ke);break;case 10:Gd(i.type._context);break;case 22:case 23:sf()}n=n.return}if(vt=t,rt=t=zi(t.current,null),yt=tn=e,ct=0,Ta=null,tf=Pl=gr=0,Gt=oa=null,sr!==null){for(e=0;e<sr.length;e++)if(n=sr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var a=s.next;s.next=r,i.next=a}n.pending=i}sr=null}return t}function n0(t,e){do{var n=rt;try{if(Vd(),Io.current=dl,ul){for(var i=Ze.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}ul=!1}if(mr=0,gt=lt=Ze=null,sa=!1,wa=0,ef.current=null,n===null||n.return===null){ct=1,Ta=e,rt=null;break}e:{var s=t,a=n.return,o=n,l=e;if(e=yt,o.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,u=o,f=u.tag;if(!(u.mode&1)&&(f===0||f===11||f===15)){var d=u.alternate;d?(u.updateQueue=d.updateQueue,u.memoizedState=d.memoizedState,u.lanes=d.lanes):(u.updateQueue=null,u.memoizedState=null)}var g=gh(a);if(g!==null){g.flags&=-257,vh(g,a,o,s,e),g.mode&1&&mh(s,c,e),e=g,l=c;var S=e.updateQueue;if(S===null){var p=new Set;p.add(l),e.updateQueue=p}else S.add(l);break e}else{if(!(e&1)){mh(s,c,e),af();break e}l=Error(J(426))}}else if(Ye&&o.mode&1){var h=gh(a);if(h!==null){!(h.flags&65536)&&(h.flags|=256),vh(h,a,o,s,e),Ud(gs(l,o));break e}}s=l=gs(l,o),ct!==4&&(ct=2),oa===null?oa=[s]:oa.push(s),s=a;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var m=Ug(s,l,e);ch(s,m);break e;case 1:o=l;var x=s.type,y=s.stateNode;if(!(s.flags&128)&&(typeof x.getDerivedStateFromError=="function"||y!==null&&typeof y.componentDidCatch=="function"&&(Ii===null||!Ii.has(y)))){s.flags|=65536,e&=-e,s.lanes|=e;var M=Bg(s,o,e);ch(s,M);break e}}s=s.return}while(s!==null)}s0(n)}catch(w){e=w,rt===n&&n!==null&&(rt=n=n.return);continue}break}while(!0)}function i0(){var t=fl.current;return fl.current=dl,t===null?dl:t}function af(){(ct===0||ct===3||ct===2)&&(ct=4),vt===null||!(gr&268435455)&&!(Pl&268435455)||Ci(vt,yt)}function ml(t,e){var n=Ie;Ie|=2;var i=i0();(vt!==t||yt!==e)&&(ni=null,cr(t,e));do try{g_();break}catch(r){n0(t,r)}while(!0);if(Vd(),Ie=n,fl.current=i,rt!==null)throw Error(J(261));return vt=null,yt=0,ct}function g_(){for(;rt!==null;)r0(rt)}function v_(){for(;rt!==null&&!Gv();)r0(rt)}function r0(t){var e=o0(t.alternate,t,tn);t.memoizedProps=t.pendingProps,e===null?s0(t):rt=e,ef.current=null}function s0(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=u_(n,e),n!==null){n.flags&=32767,rt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{ct=6,rt=null;return}}else if(n=c_(n,e,tn),n!==null){rt=n;return}if(e=e.sibling,e!==null){rt=e;return}rt=e=t}while(e!==null);ct===0&&(ct=5)}function Ji(t,e,n){var i=Be,r=_n.transition;try{_n.transition=null,Be=1,x_(t,e,n,i)}finally{_n.transition=r,Be=i}return null}function x_(t,e,n,i){do os();while(Li!==null);if(Ie&6)throw Error(J(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(J(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(Qv(t,s),t===vt&&(rt=vt=null,yt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||no||(no=!0,l0(Ko,function(){return os(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=_n.transition,_n.transition=null;var a=Be;Be=1;var o=Ie;Ie|=4,ef.current=null,f_(t,n),Jg(n,t),Ox(Ru),Qo=!!Pu,Ru=Pu=null,t.current=n,h_(n),Wv(),Ie=o,Be=a,_n.transition=s}else t.current=n;if(no&&(no=!1,Li=t,pl=r),s=t.pendingLanes,s===0&&(Ii=null),$v(n.stateNode),Xt(t,et()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(hl)throw hl=!1,t=Zu,Zu=null,t;return pl&1&&t.tag!==0&&os(),s=t.pendingLanes,s&1?t===Qu?la++:(la=0,Qu=t):la=0,Wi(),null}function os(){if(Li!==null){var t=Um(pl),e=_n.transition,n=Be;try{if(_n.transition=null,Be=16>t?16:t,Li===null)var i=!1;else{if(t=Li,Li=null,pl=0,Ie&6)throw Error(J(331));var r=Ie;for(Ie|=4,ue=t.current;ue!==null;){var s=ue,a=s.child;if(ue.flags&16){var o=s.deletions;if(o!==null){for(var l=0;l<o.length;l++){var c=o[l];for(ue=c;ue!==null;){var u=ue;switch(u.tag){case 0:case 11:case 15:aa(8,u,s)}var f=u.child;if(f!==null)f.return=u,ue=f;else for(;ue!==null;){u=ue;var d=u.sibling,g=u.return;if(Kg(u),u===c){ue=null;break}if(d!==null){d.return=g,ue=d;break}ue=g}}}var S=s.alternate;if(S!==null){var p=S.child;if(p!==null){S.child=null;do{var h=p.sibling;p.sibling=null,p=h}while(p!==null)}}ue=s}}if(s.subtreeFlags&2064&&a!==null)a.return=s,ue=a;else e:for(;ue!==null;){if(s=ue,s.flags&2048)switch(s.tag){case 0:case 11:case 15:aa(9,s,s.return)}var m=s.sibling;if(m!==null){m.return=s.return,ue=m;break e}ue=s.return}}var x=t.current;for(ue=x;ue!==null;){a=ue;var y=a.child;if(a.subtreeFlags&2064&&y!==null)y.return=a,ue=y;else e:for(a=x;ue!==null;){if(o=ue,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:Ll(9,o)}}catch(w){Je(o,o.return,w)}if(o===a){ue=null;break e}var M=o.sibling;if(M!==null){M.return=o.return,ue=M;break e}ue=o.return}}if(Ie=r,Wi(),Hn&&typeof Hn.onPostCommitFiberRoot=="function")try{Hn.onPostCommitFiberRoot(Sl,t)}catch{}i=!0}return i}finally{Be=n,_n.transition=e}}return!1}function Ph(t,e,n){e=gs(n,e),e=Ug(t,e,1),t=ki(t,e,1),e=Ut(),t!==null&&(Ra(t,1,e),Xt(t,e))}function Je(t,e,n){if(t.tag===3)Ph(t,t,n);else for(;e!==null;){if(e.tag===3){Ph(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(Ii===null||!Ii.has(i))){t=gs(n,t),t=Bg(e,t,1),e=ki(e,t,1),t=Ut(),e!==null&&(Ra(e,1,t),Xt(e,t));break}}e=e.return}}function __(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=Ut(),t.pingedLanes|=t.suspendedLanes&n,vt===t&&(yt&n)===n&&(ct===4||ct===3&&(yt&130023424)===yt&&500>et()-nf?cr(t,0):tf|=n),Xt(t,e)}function a0(t,e){e===0&&(t.mode&1?(e=$a,$a<<=1,!($a&130023424)&&($a=4194304)):e=1);var n=Ut();t=fi(t,e),t!==null&&(Ra(t,e,n),Xt(t,n))}function y_(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),a0(t,n)}function S_(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(J(314))}i!==null&&i.delete(e),a0(t,n)}var o0;o0=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||jt.current)Ht=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return Ht=!1,l_(t,e,n);Ht=!!(t.flags&131072)}else Ht=!1,Ye&&e.flags&1048576&&dg(e,sl,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;zo(t,e),t=e.pendingProps;var r=fs(e,Lt.current);as(e,n),r=Yd(null,e,i,t,r,n);var s=Kd();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,$t(i)?(s=!0,il(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Hd(e),r.updater=Al,e.stateNode=r,r._reactInternals=e,Bu(e,i,t,n),e=Wu(null,e,i,!0,s,n)):(e.tag=0,Ye&&s&&zd(e),Ft(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(zo(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=w_(i),t=An(i,t),r){case 0:e=Gu(null,e,i,t,n);break e;case 1:e=yh(null,e,i,t,n);break e;case 11:e=xh(null,e,i,t,n);break e;case 14:e=_h(null,e,i,An(i.type,t),n);break e}throw Error(J(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:An(i,r),Gu(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:An(i,r),yh(t,e,i,r,n);case 3:e:{if(Hg(e),t===null)throw Error(J(387));i=e.pendingProps,s=e.memoizedState,r=s.element,vg(t,e),ll(e,i,null,n);var a=e.memoizedState;if(i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=gs(Error(J(423)),e),e=Sh(t,e,i,n,r);break e}else if(i!==r){r=gs(Error(J(424)),e),e=Sh(t,e,i,n,r);break e}else for(rn=Ni(e.stateNode.containerInfo.firstChild),an=e,Ye=!0,Dn=null,n=mg(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(hs(),i===r){e=hi(t,e,n);break e}Ft(t,e,i,n)}e=e.child}return e;case 5:return xg(e),t===null&&zu(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,a=r.children,Du(i,r)?a=null:s!==null&&Du(i,s)&&(e.flags|=32),Wg(t,e),Ft(t,e,a,n),e.child;case 6:return t===null&&zu(e),null;case 13:return jg(t,e,n);case 4:return jd(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=ps(e,null,i,n):Ft(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:An(i,r),xh(t,e,i,r,n);case 7:return Ft(t,e,e.pendingProps,n),e.child;case 8:return Ft(t,e,e.pendingProps.children,n),e.child;case 12:return Ft(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,a=r.value,We(al,i._currentValue),i._currentValue=a,s!==null)if(zn(s.value,a)){if(s.children===r.children&&!jt.current){e=hi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var o=s.dependencies;if(o!==null){a=s.child;for(var l=o.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=li(-1,n&-n),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var u=c.pending;u===null?l.next=l:(l.next=u.next,u.next=l),c.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),Ou(s.return,n,e),o.lanes|=n;break}l=l.next}}else if(s.tag===10)a=s.type===e.type?null:s.child;else if(s.tag===18){if(a=s.return,a===null)throw Error(J(341));a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Ou(a,n,e),a=s.sibling}else a=s.child;if(a!==null)a.return=s;else for(a=s;a!==null;){if(a===e){a=null;break}if(s=a.sibling,s!==null){s.return=a.return,a=s;break}a=a.return}s=a}Ft(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,as(e,n),r=Sn(r),i=i(r),e.flags|=1,Ft(t,e,i,n),e.child;case 14:return i=e.type,r=An(i,e.pendingProps),r=An(i.type,r),_h(t,e,i,r,n);case 15:return Vg(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:An(i,r),zo(t,e),e.tag=1,$t(i)?(t=!0,il(e)):t=!1,as(e,n),Og(e,i,r),Bu(e,i,r,n),Wu(null,e,i,!0,t,n);case 19:return $g(t,e,n);case 22:return Gg(t,e,n)}throw Error(J(156,e.tag))};function l0(t,e){return Im(t,e)}function M_(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function vn(t,e,n,i){return new M_(t,e,n,i)}function of(t){return t=t.prototype,!(!t||!t.isReactComponent)}function w_(t){if(typeof t=="function")return of(t)?1:0;if(t!=null){if(t=t.$$typeof,t===bd)return 11;if(t===Td)return 14}return 2}function zi(t,e){var n=t.alternate;return n===null?(n=vn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function Bo(t,e,n,i,r,s){var a=2;if(i=t,typeof t=="function")of(t)&&(a=1);else if(typeof t=="string")a=5;else e:switch(t){case Hr:return ur(n.children,r,s,e);case Ed:a=8,r|=8;break;case uu:return t=vn(12,n,e,r|2),t.elementType=uu,t.lanes=s,t;case du:return t=vn(13,n,e,r),t.elementType=du,t.lanes=s,t;case fu:return t=vn(19,n,e,r),t.elementType=fu,t.lanes=s,t;case xm:return Rl(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case gm:a=10;break e;case vm:a=9;break e;case bd:a=11;break e;case Td:a=14;break e;case Ei:a=16,i=null;break e}throw Error(J(130,t==null?t:typeof t,""))}return e=vn(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function ur(t,e,n,i){return t=vn(7,t,i,e),t.lanes=n,t}function Rl(t,e,n,i){return t=vn(22,t,i,e),t.elementType=xm,t.lanes=n,t.stateNode={isHidden:!1},t}function mc(t,e,n){return t=vn(6,t,null,e),t.lanes=n,t}function gc(t,e,n){return e=vn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function E_(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Kl(0),this.expirationTimes=Kl(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Kl(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function lf(t,e,n,i,r,s,a,o,l){return t=new E_(t,e,n,o,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=vn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Hd(s),t}function b_(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Wr,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function c0(t){if(!t)return Bi;t=t._reactInternals;e:{if(Er(t)!==t||t.tag!==1)throw Error(J(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if($t(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(J(171))}if(t.tag===1){var n=t.type;if($t(n))return cg(t,n,e)}return e}function u0(t,e,n,i,r,s,a,o,l){return t=lf(n,i,!0,t,r,s,a,o,l),t.context=c0(null),n=t.current,i=Ut(),r=Fi(n),s=li(i,r),s.callback=e??null,ki(n,s,r),t.current.lanes=r,Ra(t,r,i),Xt(t,i),t}function Dl(t,e,n,i){var r=e.current,s=Ut(),a=Fi(r);return n=c0(n),e.context===null?e.context=n:e.pendingContext=n,e=li(s,a),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=ki(r,e,a),t!==null&&(Fn(t,r,a,s),ko(t,r,a)),a}function gl(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function Rh(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function cf(t,e){Rh(t,e),(t=t.alternate)&&Rh(t,e)}function T_(){return null}var d0=typeof reportError=="function"?reportError:function(t){console.error(t)};function uf(t){this._internalRoot=t}Nl.prototype.render=uf.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(J(409));Dl(t,e,null,null)};Nl.prototype.unmount=uf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;vr(function(){Dl(null,t,null,null)}),e[di]=null}};function Nl(t){this._internalRoot=t}Nl.prototype.unstable_scheduleHydration=function(t){if(t){var e=Gm();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Ti.length&&e!==0&&e<Ti[n].priority;n++);Ti.splice(n,0,t),n===0&&Hm(t)}};function df(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function kl(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function Dh(){}function C_(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=gl(a);s.call(c)}}var a=u0(e,i,t,0,null,!1,!1,"",Dh);return t._reactRootContainer=a,t[di]=a.current,xa(t.nodeType===8?t.parentNode:t),vr(),a}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var o=i;i=function(){var c=gl(l);o.call(c)}}var l=lf(t,0,!1,null,null,!1,!1,"",Dh);return t._reactRootContainer=l,t[di]=l.current,xa(t.nodeType===8?t.parentNode:t),vr(function(){Dl(e,l,n,i)}),l}function Il(t,e,n,i,r){var s=n._reactRootContainer;if(s){var a=s;if(typeof r=="function"){var o=r;r=function(){var l=gl(a);o.call(l)}}Dl(e,a,t,r)}else a=C_(n,e,t,r,i);return gl(a)}Bm=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=qs(e.pendingLanes);n!==0&&(Ld(e,n|1),Xt(e,et()),!(Ie&6)&&(vs=et()+500,Wi()))}break;case 13:vr(function(){var i=fi(t,1);if(i!==null){var r=Ut();Fn(i,t,1,r)}}),cf(t,1)}};Pd=function(t){if(t.tag===13){var e=fi(t,134217728);if(e!==null){var n=Ut();Fn(e,t,134217728,n)}cf(t,134217728)}};Vm=function(t){if(t.tag===13){var e=Fi(t),n=fi(t,e);if(n!==null){var i=Ut();Fn(n,t,e,i)}cf(t,e)}};Gm=function(){return Be};Wm=function(t,e){var n=Be;try{return Be=t,e()}finally{Be=n}};Mu=function(t,e,n){switch(e){case"input":if(mu(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=bl(i);if(!r)throw Error(J(90));ym(i),mu(i,r)}}}break;case"textarea":Mm(t,n);break;case"select":e=n.value,e!=null&&ns(t,!!n.multiple,e,!1)}};Lm=rf;Pm=vr;var A_={usingClientEntryPoint:!1,Events:[Na,qr,bl,Cm,Am,rf]},Os={findFiberByHostInstance:rr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},L_={bundleType:Os.bundleType,version:Os.version,rendererPackageName:Os.rendererPackageName,rendererConfig:Os.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:pi.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=Nm(t),t===null?null:t.stateNode},findFiberByHostInstance:Os.findFiberByHostInstance||T_,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var io=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!io.isDisabled&&io.supportsFiber)try{Sl=io.inject(L_),Hn=io}catch{}}cn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=A_;cn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!df(e))throw Error(J(200));return b_(t,e,null,n)};cn.createRoot=function(t,e){if(!df(t))throw Error(J(299));var n=!1,i="",r=d0;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=lf(t,1,!1,null,null,n,!1,i,r),t[di]=e.current,xa(t.nodeType===8?t.parentNode:t),new uf(e)};cn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(J(188)):(t=Object.keys(t).join(","),Error(J(268,t)));return t=Nm(e),t=t===null?null:t.stateNode,t};cn.flushSync=function(t){return vr(t)};cn.hydrate=function(t,e,n){if(!kl(e))throw Error(J(200));return Il(null,t,e,!0,n)};cn.hydrateRoot=function(t,e,n){if(!df(t))throw Error(J(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",a=d0;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),e=u0(e,null,t,1,n??null,r,!1,s,a),t[di]=e.current,xa(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new Nl(e)};cn.render=function(t,e,n){if(!kl(e))throw Error(J(200));return Il(null,t,e,!1,n)};cn.unmountComponentAtNode=function(t){if(!kl(t))throw Error(J(40));return t._reactRootContainer?(vr(function(){Il(null,null,t,!1,function(){t._reactRootContainer=null,t[di]=null})}),!0):!1};cn.unstable_batchedUpdates=rf;cn.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!kl(n))throw Error(J(200));if(t==null||t._reactInternals===void 0)throw Error(J(38));return Il(t,e,n,!1,i)};cn.version="18.3.1-next-f1338f8080-20240426";function f0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(f0)}catch(t){console.error(t)}}f0(),fm.exports=cn;var P_=fm.exports,h0,Nh=P_;h0=Nh.createRoot,Nh.hydrateRoot;const R_=[0,10,30,100,300,1e3,3e3],D_=[{devices:0,rounds:0,weights:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{devices:10,rounds:21,weights:[-1.127553,-.19142,-.287369,.846391,.882094,1.457743,.731699,-.180444,1.522719,.376073,.160766,.378902,-.151925,-.1144,.979648,-.157076,.309223,-.103235,.76589,1.002779,.830529,1.030789,0,0,0,0,0,-.404581,.966507,.385996,-.030006,.173109]},{devices:30,rounds:22,weights:[-1.069718,-.239061,-.477615,.881294,.312072,1.500194,.868766,-.056456,.902763,.544528,.186355,.395674,-.015774,.1963,1.18563,.447184,.386709,-.053998,.435682,.57148,.449283,.486538,-.102037,.675652,-.048096,-.053934,.482325,-.363837,1.113727,.316221,.16626,.298381]},{devices:100,rounds:25,weights:[-1.093259,-.289377,-.332096,.779348,.284914,1.397068,.668918,-.209602,.612892,.476688,.418817,.466982,-.104552,.103882,1.244698,.525442,.447311,-.191816,.29936,.740031,.346283,.88299,-.058373,.411951,-.025174,-.013179,.311215,-.196819,1.268396,-.007014,.106237,.692742]},{devices:300,rounds:35,weights:[-1.14874,-.274815,-.435872,.512225,.390705,1.505649,.806352,-.179558,.928048,.692757,.483796,.699473,-.089446,.32812,1.266736,.423678,.630968,-.175713,.425277,.78824,.130447,.911999,-.052321,.385669,.004724,.129717,.420676,-.215829,1.43604,-.282342,.115963,1.080835]},{devices:1e3,rounds:70,weights:[-1.244268,-.317124,-.40603,.438821,.205362,1.734612,.939553,-.330222,.955442,.771305,.559741,.915657,-.190035,.330182,1.63415,.479806,.773546,-.107699,.560587,.875523,.110309,1.108345,-.01887,.670591,-.137421,.139421,.657401,-.191412,1.533904,-.390016,.213018,1.156131]},{devices:3e3,rounds:150,weights:[-1.23682,-.326299,-.355176,.385583,.265582,1.812857,.909571,-.380062,1.080063,.862189,.516653,1.060015,-.203395,.033301,1.698488,.429168,.828276,-.194026,.654774,.962771,.193072,1.318522,.044816,.95724,-.228176,.193054,.84867,-.148977,1.664143,-.556551,.145433,1.240987]}],N_=400,k_={you:[.5316,.6327,.7015,.7106,.7654,.7829],fleet:[[.5,.5,.5,.5,.5,.5],[.7437,.7481,.743,.7164,.7533,.7576],[.7708,.7683,.7764,.7654,.7786,.7836],[.7796,.7795,.7879,.7725,.7909,.7823],[.7965,.7884,.7861,.7837,.7911,.7999],[.7922,.7854,.794,.7871,.7893,.7965],[.7943,.7834,.7957,.7871,.7921,.8015]],both:[[.5316,.6327,.7015,.7106,.7654,.7829],[.7537,.7763,.7939,.7884,.8358,.8219],[.773,.7837,.8126,.8053,.8368,.8317],[.7794,.7943,.8185,.8155,.8394,.8338],[.7909,.807,.8164,.8136,.8335,.8398],[.7893,.805,.8265,.8135,.8383,.8404],[.7922,.8075,.8253,.8119,.8371,.8419]]},I_=[{group:"acl:under35",newcomers:150,rates:[.5413,.7927,.8033,.7986,.8005,.8057,.8016]},{group:"tkr:under35",newcomers:150,rates:[.5268,.6016,.7345,.7169,.7254,.7413,.7428]}],F_={fleetSizes:R_,fleets:D_,newcomers:N_,weekly:k_,firstWeekByGroup:I_},td={push:"Push",ease:"Ease off",rest:"Rest",learning:"Learning you"};function z_(t){const e=t.line!==null?`${t.line}°`:null;switch(t.call){case"learning":return"Kinn needs a few days with you before it can tell you how hard to push.";case"rest":return t.flaredYesterday?"Yesterday flared. Give the knee a light day and it will be back sooner.":"Your recent days are running hot. Keep today easy.";case"ease":return t.day===1?e?`Early days for a knee like yours. Keep bends under ${e} while Kinn gets to know you.`:"Early days. Keep it moderate.":e?`Days like your recent ones sometimes flared. Keep bends under ${e} and stop when your quad tires.`:"Days like your recent ones sometimes flared. Keep it moderate.";case"push":return t.day===1?e?`Knees like yours usually handle a normal day well. Work up to ${e}.`:"Knees like yours usually handle a normal day well.":e?`Your knee has handled days like this well. Work up to ${e}.`:"Your knee has handled days like this well."}}const Rn=t=>`${Math.round(t*100)}%`,xn=t=>t.toLocaleString("en-US"),ls={good:"Felt good",sore:"A bit sore",flare:"Flare-up"},O_=t=>t.feel==="flare";function U_(t,e){if(!t||typeof t!="object")return null;const n=t;if(n.feel!=="good"&&n.feel!=="sore"&&n.feel!=="flare")return null;const i=typeof n.pain=="number"&&Number.isFinite(n.pain)?Math.max(0,Math.min(10,Math.round(n.pain))):null,r=typeof n.activity=="string"&&n.activity.trim()?n.activity.trim().slice(0,60):null,s=typeof n.summary=="string"?n.summary.trim().slice(0,160):"";return{feel:n.feel,pain:i,activity:r,summary:s||ls[n.feel],readBy:e}}const B_=/\b(flare|swoll|swell|puff|throb|sharp|gave way|buckl|locked|couldn'?t|can'?t (bend|walk|sleep)|ice[d ]|limp)/i,V_=/\b(sore|ache|achy|stiff|tight|tired|twinge|a bit)/i,G_=["soccer","run","jog","squat","stairs","walk","bike","cycling","gym","lunges","hike","work","pt"];function W_(t){const e=t.trim(),n=e.match(/\b(10|[0-9])\s*(\/\s*10|out of 10)/i),i=n?Number(n[1]):null,r=B_.test(e)||i!==null&&i>=6?"flare":V_.test(e)||i!==null&&i>=3?"sore":"good",s=G_.find(a=>new RegExp(`\\b${a}`,"i").test(e))??null;return{feel:r,pain:i,activity:s,summary:e.slice(0,160)||ls[r],readBy:"device"}}async function H_(t,e=fetch){try{const n=await e("/api/checkin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:t}),signal:AbortSignal.timeout(12e3)});if(!n.ok)throw new Error(String(n.status));const i=U_(await n.json(),"claude");if(i)return i}catch{}return W_(t)}function ff(t){let e=t>>>0;const n=()=>{e=e+1831565813>>>0;let r=e;return r=Math.imul(r^r>>>15,r|1),r^=r+Math.imul(r^r>>>7,r|61),((r^r>>>14)>>>0)/4294967296};return{next:n,normal:(r=0,s=1)=>{const a=Math.max(n(),1e-12);return r+s*Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*n())}}}const vl={acl:"ACL reconstruction",meniscus:"Meniscus repair",tkr:"Knee replacement"},p0={under35:"under 35",over35:"35 and over"},Yt=["bend","deepBends","fatigue","warmth"],xs={bend:"How far you bend",deepBends:"How many deep bends",fatigue:"Muscle fatigue",warmth:"Warmth at the knee"},j_={bend:"Stretch traces",deepBends:"Stretch + motion",fatigue:"Muscle sensor",warmth:"Skin temperature"},m0={"acl:under35":{base:-2.4,bend:.4,deepBends:.3,fatigue:1.6,warmth:.8},"acl:over35":{base:-2.4,bend:1,deepBends:.8,fatigue:.5,warmth:.9},"meniscus:under35":{base:-2.4,bend:.2,deepBends:1.6,fatigue:.4,warmth:.8},"meniscus:over35":{base:-2.3,bend:.6,deepBends:1,fatigue:.2,warmth:1.2},"tkr:under35":{base:-2.2,bend:1.4,deepBends:-.6,fatigue:.3,warmth:.9},"tkr:over35":{base:-2.2,bend:1.5,deepBends:-.4,fatigue:.2,warmth:1.1}},hf=Object.keys(m0),$_=1.8,X_=-.5,vc=.75,pf=1+Yt.length,g0=2+hf.length*pf,xr=(t,e)=>2+hf.indexOf(t)*pf+1+Yt.indexOf(e),v0=t=>(t/7-3)/2;function x0(t,e,n){const i=new Array(g0).fill(0);i[0]=1,i[1]=v0(e),i[2+hf.indexOf(t)*pf]=1;for(const r of Yt)i[xr(t,r)]=n[r];return i}const Ln=42,q_=t=>1/(1+Math.exp(-t));function Y_(t,e,n){const i=m0[t],r=(s,a)=>i[s]+((n==null?void 0:n[s])??e.normal(0,a));return{base:r("base",.35),bend:r("bend",vc),deepBends:r("deepBends",vc),fatigue:r("fatigue",vc),warmth:r("warmth",.35)}}function K_(t,e,n,i={}){var c;const r=ff(n),s=Y_(e,r,i.quirks),a=r.normal(0,.6),o=[];let l=0;for(let u=1;u<=Ln;u++){const f=r.normal(a*.5,1),d=.5*f+r.normal(a*.3,.85),g=.4*d+r.normal(0,.9),S=.3*l+r.normal(0,.9),p=(c=i.force)==null?void 0:c[u],h={bend:f,deepBends:d,fatigue:g,warmth:S,...p==null?void 0:p.z};let m=s.base+X_*v0(u);for(const M of Yt)m+=$_*s[M]*h[M];const x=r.next(),y=(p==null?void 0:p.flare)??x<q_(m);o.push({day:u,z:h,x:x0(e,u,h),flare:y}),l=(h.bend+h.deepBends)/2}return{id:t,group:e,days:o}}function _s(t){const{bend:e,deepBends:n,fatigue:i,warmth:r}=t.z;return{flexDeg:Math.round(Z_(t.day,e)),deepBends:Math.max(0,Math.round(28+.5*Math.min(t.day,35)+10*n)),fatiguePct:Math.min(60,Math.max(2,Math.round(18+8*i))),warmthC:Math.round(Math.max(0,.3+.3*r)*10)/10}}const Z_=(t,e)=>88+.8*Math.min(t,35)+6*e,Q_=(t,e)=>(t-88-.8*Math.min(e,35))/6,mf=(t,e)=>{let n=0;for(let i=0;i<e.length;i++)n+=t[i]*e[i];return 1/(1+Math.exp(-n))},J_=.3;function ey(t,e,n,i,r){const s=(e.flare?1:0)-mf(t,e.x);for(let a=0;a<t.length;a++)t[a]+=n*(s*e.x[a]-i*(t[a]-r[a]))}const kh={lr:.12,l2:.02};function ty(t,e,n=!0,i=new Set){const r=e.slice();return t.map(s=>{const a=r.slice(),o=mf(r,s.x);return n&&!i.has(s.day)&&ey(r,s,kh.lr,kh.l2,e),{day:s.day,before:a,risk:o,flare:s.flare,after:r.slice()}})}const nd=()=>({tp:0,fn:0,tn:0,fp:0});function id(t,e,n){const i=e>=J_;n?i?t.tp++:t.fn++:i?t.fp++:t.tn++}function _0(t){const e=t.tp+t.fn,n=t.tn+t.fp;return!e||!n?.5:(t.tp/e+t.tn/n)/2}const xc={you:"Only your data",fleet:"Only everyone else’s",both:"Everyone’s + yours"},Ot={name:"Maya",age:23,group:"acl:under35",sport:"soccer",quirks:{fatigue:.7,bend:-.4,deepBends:-.3,base:-1.2},seed:4242},rd=22;function ny(t={}){return K_(0,Ot.group,Ot.seed,{quirks:Ot.quirks,force:{[rd]:{z:{fatigue:1,bend:.4},flare:!0}}}).days.map(n=>n.day in t?{...n,flare:t[n.day]}:n)}const iy=135,Ih=.3,ry=t=>t.length?t.reduce((e,n)=>e+n,0)/t.length:0;function y0(t,e){const n=t.filter(i=>i.day<e&&i.day>=e-7);return Object.fromEntries(Yt.map(i=>[i,ry(n.map(r=>r.z[i]))]))}const sy=t=>t.every(e=>e===0);function ay(t,e,n,i){const r=t===1?i.slice():n[t-2].after,s=y0(e,t),a=m=>mf(r,x0(Ot.group,t,m)),o=a(s),l=t>1&&e[t-2].flare,c=sy(i)&&t<=3,u={bend:0,deepBends:0,fatigue:0,warmth:0};let f=null;for(let m=80;m<=iy;m++)a({...u,bend:Q_(m,t)})<=Ih&&(f=m);let d=null;for(let m=4;m<=60;m++)a({...u,fatigue:(m-18)/8})<=Ih&&(d=m);const g=c?"learning":l?"rest":o<.22?"push":o<.4?"ease":"rest",S=Object.fromEntries(Yt.map(m=>[m,r[xr(Ot.group,m)]])),p=Object.fromEntries(Yt.map(m=>{const x=i[xr(Ot.group,m)];return[m,Math.abs(x)<.05?1:S[m]/x]}));let h=null;if(t>7){const m=nd();for(const x of n.slice(0,t-1))id(m,x.risk,x.flare);h=_0(m)}return{day:t,weights:r,ownDays:t-1,risk:o,call:g,line:c?null:f,fatigueCap:c?null:d,flaredYesterday:l,vsFleet:p,sensorWeights:S,record:h}}const Fh={bend:"how far you bend",deepBends:"how many deep bends you do",fatigue:"muscle fatigue",warmth:"warmth at the knee"};function Vo(t,e,n={},i=[]){const r=ny(n),s=ty(r,t,!0,new Set(i)),a=Array.from({length:Ln},(d,g)=>ay(g+1,r,s,t)),o=[],l=a[0];o.push(e>0?{day:1,kind:"start",title:`Started from ${e.toLocaleString("en-US")} recoveries`,detail:l.line?`Before Maya's first step, the fleet model set her line at ${l.line}°.`:"The fleet model gave Maya a starting point before her first step."}:{day:1,kind:"start",title:"Started from scratch",detail:"No other wearers to learn from, so the first days are guesses."});let c=l.line,u=null,f=0;for(let d=2;d<=Ln;d++){const g=a[d-1],S=r[d-2];if(S.flare){f=d-1;const p=_s(S),h=oy(s[d-2].before,S),m=g.line!==null&&c!==null&&g.line<c?` Line ${c}° → ${g.line}°.`:"";o.push({day:d-1,kind:"flare",title:"Flare-up logged",detail:`Bent to ${p.flexDeg}°, muscle fatigue ${p.fatiguePct}%. Kinn traced it mostly to ${Fh[h]}.${m}`}),g.line!==null&&c!==null&&g.line<c&&(c=g.line)}else if(g.line!==null&&c===null)o.push({day:d,kind:"line",title:`First line: ${g.line}°`,detail:"Enough of her own days to suggest a limit."}),c=g.line;else if(g.line!==null&&c!==null&&Math.abs(g.line-c)>=5){const p=d-1-f;o.push({day:d,kind:"line",title:`Line ${g.line>c?"up":"down"}: ${c}° → ${g.line}°`,detail:g.line>c?`${p} calm day${p===1?"":"s"} in a row taught Kinn she can do a bit more.`:"Her recent days ran hotter than her model expected."}),c=g.line}if(d>=8&&e+d>10){const p=Yt.reduce((h,m)=>g.sensorWeights[m]>g.sensorWeights[h]?m:h);if(p!==u&&g.sensorWeights[p]>.5){const h=g.vsFleet[p];o.push({day:d,kind:"insight",title:`Her strongest warning sign: ${Fh[p]}`,detail:e>0&&h>=1.05?`It predicts her flare-ups ${h.toFixed(1)}× as strongly as for most people like her.`:"Of everything the strip measures, it predicts her flare-ups best so far."}),u=p}}(d-1)%7===0&&g.record!==null&&o.push({day:d-1,kind:"week",title:`Week ${(d-1)/7}: calls right ${Math.round(g.record*100)}% of the time`,detail:"Each morning’s call, checked against that evening’s check-in."})}return o.sort((d,g)=>d.day-g.day),{days:r,steps:s,mornings:a,events:o}}function oy(t,e){return Yt.reduce((n,i)=>t[xr(Ot.group,i)]*e.z[i]>t[xr(Ot.group,n)]*e.z[n]?i:n)}const _c=t=>t[t.length-1];function ly(t){const e=t.fleets.length-1,n=t.fleets[e],i=Vo(n.weights,n.devices),r=i.mornings[0],s=i.mornings[20],a=Yt.reduce((h,m)=>s.sensorWeights[m]>s.sensorWeights[h]?m:h),[o,l]=t.firstWeekByGroup,c=Math.max(...l.rates),u=t.fleetSizes[l.rates.findIndex(h=>h>=c-.02)],[f,d]=l.group.split(":"),g=t.weekly.you,S=t.weekly.fleet[e],p=t.weekly.both[e];return[{id:"meet",title:`Meet ${Ot.name}`,body:`${Ot.age}, ${Ot.sport} player, recovering from an ${vl.acl}. On day one Kinn already has a call for her and a line of ${r.line}°. It starts from what ${xn(n.devices)} earlier recoveries taught it, then adjusts to her.`,day:1,fleetIndex:e,screen:"start",focus:"phone"},{id:"learns",title:"It learns her",body:`Three weeks of her own days later, her line has moved from ${r.line}° to ${s.line}°, and Kinn has found her strongest warning sign: ${xs[a].toLowerCase()}. Its morning calls have been right ${Rn(s.record??.5)} of the time.`,day:21,fleetIndex:e,screen:"learned",focus:"phone"},{id:"session",title:"A session with a coach",body:"On a Push day, her PT's exercises run live: the strip checks that every rep reaches full range and holds, and the muscle sensor sees her quad tire before the reps get shorter. Press Start session on the phone.",day:21,fleetIndex:e,screen:"session",focus:"phone"},{id:"checkin",title:"Tell it how it went",body:`Day ${rd}: her knee swelled after practice. Tap “Flare-up” on the phone, or type it in your own words. Kinn updates her model before morning, and you can see what changed.`,day:rd,fleetIndex:e,screen:"checkin",focus:"phone"},{id:"fleet",title:"Every Kinn learns",body:`Each night, phones send back model updates, never readings. With no other wearers, a newcomer like ${Ot.name} gets calls right ${Rn(o.rates[0])} of the time in week one, close to a coin flip. With ${xn(_c(t.fleetSizes))} wearers: ${Rn(_c(o.rates))}. Rarer recoveries need more people: for a ${vl[f].toLowerCase()} ${p0[d]}, it takes about ${xn(u)}. Drag the fleet to see it.`,day:1,fleetIndex:0,screen:"start",focus:"fleet"},{id:"loop",title:"It never stops",body:`Everyone else's data alone stays near ${Rn(Math.max(...S))}. Your data alone starts near a coin flip (${Rn(g[0])}). Together: ${Rn(p[0])} in week one and ${Rn(_c(p))} by week six. Every check-in teaches your Kinn, and every Kinn teaches the next person's.`,day:42,fleetIndex:e,screen:"week",focus:"weekly"}]}const Go=230,Us=Go-14-40;function cy(t){const e=ye.useRef(null),[n,i]=ye.useState(t);return ye.useLayoutEffect(()=>{const r=e.current;if(!r)return;const s=new ResizeObserver(([a])=>i(Math.max(280,Math.round(a.contentRect.width))));return s.observe(r),()=>s.disconnect()},[]),[e,n]}function zh({series:t,xLabels:e,xTitle:n,yMin:i,yMax:r,yTicks:s,format:a,marker:o,markerLabel:l,floor:c,ariaLabel:u}){const[f,d]=ye.useState(null),g=ye.useId(),[S,p]=cy(520),h={top:14,right:140,left:40},m=p-h.left-h.right,x=e.length,y=_=>h.left+(x===1?m/2:_/(x-1)*m),M=_=>h.top+(1-(_-i)/(r-i))*Us,w=ye.useMemo(()=>{const _=t.map(C=>({id:C.id,label:C.label,color:C.color,value:C.values[x-1],y:M(C.values[x-1])}));_.sort((C,L)=>C.y-L.y);for(let C=1;C<_.length;C++)_[C].y-_[C-1].y<26&&(_[C].y=_[C-1].y+26);return _},[t,x,i,r,p]),T=f??null,P=T!==null?y(T)/p*100:0;return v.jsxs("figure",{className:"chart",children:[v.jsxs("div",{className:"chart-plot",ref:S,children:[v.jsxs("svg",{width:p,height:Go,viewBox:`0 0 ${p} ${Go}`,role:"img","aria-label":u,"aria-describedby":g,children:[s.map(_=>v.jsxs("g",{children:[v.jsx("line",{x1:h.left,x2:h.left+m,y1:M(_),y2:M(_),className:"grid"}),v.jsx("text",{x:h.left-8,y:M(_),className:"tick",textAnchor:"end",dominantBaseline:"middle",children:a(_)})]},_)),e.map((_,C)=>v.jsx("text",{x:y(C),y:h.top+Us+16,className:"tick",textAnchor:"middle",children:_},_)),v.jsx("text",{x:h.left+m/2,y:Go-4,className:"axis-title",textAnchor:"middle",children:n}),c&&v.jsxs("g",{children:[v.jsx("line",{x1:h.left,x2:h.left+m,y1:M(c.value),y2:M(c.value),className:"floor"}),v.jsx("text",{x:h.left+4,y:M(c.value)-5,className:"tick",children:c.label})]}),o!==void 0&&v.jsxs("g",{children:[v.jsx("line",{x1:y(o),x2:y(o),y1:h.top,y2:h.top+Us,className:"marker"}),l&&v.jsx("text",{x:y(o),y:h.top-3,className:"marker-label",textAnchor:o===x-1?"end":o===0?"start":"middle",children:l})]}),t.map(_=>v.jsxs("g",{children:[v.jsx("path",{d:_.values.map((C,L)=>`${L?"L":"M"}${y(L).toFixed(1)},${M(C).toFixed(1)}`).join(""),fill:"none",stroke:_.color,strokeWidth:2,strokeLinejoin:"round",strokeLinecap:"round",strokeDasharray:_.dashed?"5 5":void 0}),_.values.map((C,L)=>v.jsx("circle",{cx:y(L),cy:M(C),r:T===L||o===L?4.5:3,fill:_.color,className:"dot"},L))]},_.id)),w.map(_=>v.jsxs("g",{children:[v.jsx("line",{x1:h.left+m+8,x2:h.left+m+16,y1:_.y,y2:_.y,stroke:_.color,strokeWidth:2}),v.jsxs("text",{x:h.left+m+20,y:_.y,className:"end-label",dominantBaseline:"middle",children:[v.jsx("tspan",{className:"end-value",children:a(_.value)}),v.jsx("tspan",{x:h.left+m+20,dy:"13",className:"end-name",children:_.label})]})]},_.id)),T!==null&&v.jsx("line",{x1:y(T),x2:y(T),y1:h.top,y2:h.top+Us,className:"crosshair"}),e.map((_,C)=>{const L=x===1?m/2:m/(x-1)/2;return v.jsx("rect",{x:y(C)-L,y:h.top,width:L*2,height:Us,fill:"transparent",onMouseEnter:()=>d(C),onMouseLeave:()=>d(null),onTouchStart:()=>d(C)},C)})]}),T!==null&&v.jsxs("div",{className:"tooltip",style:{left:`${P}%`},role:"status",children:[v.jsxs("div",{className:"tooltip-title",children:[n,": ",e[T]]}),t.map(_=>v.jsxs("div",{className:"tooltip-row",children:[v.jsx("span",{className:"swatch",style:{background:_.color}}),v.jsx("span",{className:"tooltip-name",children:_.label}),v.jsx("span",{className:"tooltip-value",children:a(_.values[T])})]},_.id))]})]}),v.jsx("figcaption",{className:"legend",children:t.map(_=>v.jsxs("span",{className:"legend-item",children:[v.jsx("svg",{width:"22",height:"8","aria-hidden":"true",children:v.jsx("line",{x1:"1",x2:"21",y1:"4",y2:"4",stroke:_.color,strokeWidth:"2",strokeDasharray:_.dashed?"4 3":void 0})}),_.label]},_.id))}),v.jsxs("details",{className:"table-view",id:g,children:[v.jsx("summary",{children:"Show as table"}),v.jsxs("table",{children:[v.jsx("thead",{children:v.jsxs("tr",{children:[v.jsx("th",{scope:"col",children:n}),t.map(_=>v.jsx("th",{scope:"col",children:_.label},_.id))]})}),v.jsx("tbody",{children:e.map((_,C)=>v.jsxs("tr",{children:[v.jsx("th",{scope:"row",children:_}),t.map(L=>v.jsx("td",{children:a(L.values[C])},L.id))]},_))})]})]})]})}function uy({values:t,flares:e,label:n}){if(t.length<2)return v.jsx("svg",{width:120,height:32,"aria-hidden":"true"});const s=Math.min(...t),o=Math.max(...t)-s||1,l=u=>3+u/(t.length-1)*114,c=u=>4+(1-(u-s)/o)*22;return v.jsxs("svg",{width:120,height:32,viewBox:"0 0 120 32",role:"img","aria-label":n,className:"spark",children:[v.jsx("path",{d:t.map((u,f)=>`${f?"L":"M"}${l(f).toFixed(1)},${c(u).toFixed(1)}`).join(""),className:"spark-line"}),e.map((u,f)=>u?v.jsx("circle",{cx:l(f),cy:30,r:2,className:"spark-flare"},f):null),v.jsx("circle",{cx:l(t.length-1),cy:c(t[t.length-1]),r:3,className:"spark-end"})]})}const Bs={you:"#8c8c8c",fleet:"#3987e5",both:"#199e70",rare:"#9085e9"},dy=t=>t>=1e3?`${t/1e3}k`:String(t);function fy({curves:t,fleetIndex:e,run:n,day:i,focus:r,liveBend:s,onLiveBend:a}){const o=t.fleets[e],l=Math.min(5,Math.floor((i-1)/7)),c=ye.useRef(null);return ye.useEffect(()=>{var f,d,g;if(r==="phone")return;const u=(f=window.matchMedia)==null?void 0:f.call(window,"(prefers-reduced-motion: reduce)").matches;(g=(d=c.current)==null?void 0:d.querySelector(".card.focus"))==null||g.scrollIntoView({behavior:u?"auto":"smooth",block:"nearest"})},[r]),v.jsxs("div",{className:"panel",ref:c,children:[v.jsx(py,{run:n,day:i,liveBend:s,onLiveBend:a,line:n.mornings[i-1].line}),v.jsxs("section",{className:r==="weekly"?"card focus":"card","aria-labelledby":"weekly-title",children:[v.jsx("h3",{id:"weekly-title",className:"card-title",children:"Is the morning call right?"}),v.jsxs("p",{className:"card-sub",children:[xn(t.newcomers)," simulated newcomers, each call checked against that evening’s check-in. Fleet: ",xn(o.devices)," wearers."]}),v.jsx(zh,{ariaLabel:"How often the morning call is right, by week of wear, for three ways of learning",xTitle:"Week of wear",xLabels:["1","2","3","4","5","6"],yMin:.45,yMax:.9,yTicks:[.5,.6,.7,.8,.9],format:Rn,floor:{value:.5,label:"Coin flip"},marker:l,markerLabel:`Maya, day ${i}`,series:[{id:"you",label:xc.you,color:Bs.you,dashed:!0,values:t.weekly.you},{id:"fleet",label:xc.fleet,color:Bs.fleet,values:t.weekly.fleet[e]},{id:"both",label:xc.both,color:Bs.both,values:t.weekly.both[e]}]})]}),v.jsxs("section",{className:r==="fleet"?"card focus":"card","aria-labelledby":"fleet-title",children:[v.jsx("h3",{id:"fleet-title",className:"card-title",children:"More wearers, better first weeks"}),v.jsx("p",{className:"card-sub",children:"How often week-one calls are right for a newcomer, by how many people Kinn learned from before them."}),v.jsx(zh,{ariaLabel:"Week-one call accuracy for newcomers by fleet size, for a common and a rare kind of recovery",xTitle:"Wearers Kinn learned from",xLabels:t.fleetSizes.map(dy),yMin:.45,yMax:.9,yTicks:[.5,.6,.7,.8,.9],format:Rn,floor:{value:.5,label:"Coin flip"},marker:e,markerLabel:"Now",series:t.firstWeekByGroup.map((u,f)=>{const[d,g]=u.group.split(":");return{id:u.group,label:`${hy(d)}, ${p0[g]}${f===0?" (Maya)":""}`,color:f===0?Bs.both:Bs.rare,values:u.rates}})}),v.jsx(my,{devices:o.devices,rounds:o.rounds})]})]})}const hy=t=>t==="tkr"?"Knee replacement":t==="acl"?"ACL":vl[t];function py({run:t,day:e,liveBend:n,onLiveBend:i,line:r}){const s=t.days.slice(Math.max(0,e-15),e-1),a=s[s.length-1],o=a?_s(a):null,l=u=>o===null?"—":u==="bend"?`${o.flexDeg}°`:u==="deepBends"?String(o.deepBends):u==="fatigue"?`${o.fatiguePct}%`:`+${o.warmthC.toFixed(1)}°C`,c=u=>s.map(f=>{const d=_s(f);return u==="bend"?d.flexDeg:u==="deepBends"?d.deepBends:u==="fatigue"?d.fatiguePct:d.warmthC});return v.jsxs("section",{className:"card","aria-labelledby":"sensors-title",children:[v.jsxs("h3",{id:"sensors-title",className:"card-title",children:["What the strip measured ",a?`on day ${a.day}`:""]}),v.jsx("p",{className:"card-sub",children:a?"Last two weeks; dots mark flare-ups.":"Nothing yet: this is her first morning."}),v.jsx("ul",{className:"sensors",children:Yt.map(u=>v.jsxs("li",{children:[v.jsxs("div",{children:[v.jsx("p",{className:"sensor-name",children:xs[u]}),v.jsx("p",{className:"sensor-source",children:j_[u]})]}),v.jsx("p",{className:"sensor-value",children:l(u)}),v.jsx(uy,{values:c(u),flares:s.map(f=>f.flare),label:`${xs[u]}, last ${s.length} days`})]},u))}),v.jsxs("div",{className:"try-bend",children:[v.jsxs("label",{htmlFor:"bend",children:["Try it: bend the knee ",v.jsx("span",{className:"try-value",children:n!==null?`${n}°`:""})]}),v.jsx("input",{id:"bend",type:"range",min:60,max:150,value:n??60,onChange:u=>i(Number(u.target.value)),"aria-describedby":"bend-help"}),v.jsxs("p",{id:"bend-help",className:"card-sub",children:[r!==null?`The coin buzzes her phone past her line (${r}°).`:"No line yet, so no buzz.",n!==null&&v.jsx("button",{type:"button",className:"link-button",onClick:()=>i(null),children:"Reset"})]})]})]})}function my({devices:t,rounds:e}){return v.jsxs("div",{className:"fed","aria-label":"How the fleet learns without sharing readings",children:[v.jsxs("div",{className:"fed-node",children:[v.jsx("p",{className:"fed-head",children:"Each phone"}),v.jsx("p",{className:"fed-body",children:"Improves tonight’s fleet model on its own days. Readings and check-ins stay on the phone."})]}),v.jsx("div",{className:"fed-arrow","aria-hidden":"true",children:v.jsxs("span",{children:[g0," numbers"]})}),v.jsxs("div",{className:"fed-node",children:[v.jsx("p",{className:"fed-head",children:"Fleet model"}),v.jsxs("p",{className:"fed-body",children:[t>0?`Averages ${xn(t)} updates. ${e} nights so far.`:"Nothing to average yet."," Sent back to every phone, and to the next newcomer."]})]})]})}function gy({size:t=24}){return v.jsxs("svg",{viewBox:"0 0 120 120",width:t,height:t,"aria-hidden":"true",className:"mark",children:[v.jsx("circle",{cx:"60",cy:"60",r:"44",fill:"none",stroke:"var(--fg)",strokeWidth:"9.7"}),v.jsx("line",{x1:"84.7",y1:"45.8",x2:"111.5",y2:"30.3",stroke:"var(--ring)",strokeWidth:"9.7",strokeLinecap:"round"})]})}function Ca({label:t,onClick:e}){return v.jsxs("button",{type:"button",className:"back",onClick:e,children:[v.jsx("svg",{viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",children:v.jsx("path",{d:"M10 3 5 8l5 5",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})}),t]})}function yc({label:t,children:e}){return v.jsxs("div",{className:"row",children:[v.jsx("span",{className:"row-label",children:t}),v.jsx("span",{className:"row-value",children:e})]})}const vy=()=>v.jsxs("svg",{viewBox:"0 0 24 24",width:"22",height:"22","aria-hidden":"true",children:[v.jsx("path",{d:"M6.3 17.7a8 8 0 1 1 11.4 0",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"}),v.jsx("path",{d:"M12 12l3.5-3",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round"})]}),xy=()=>v.jsx("svg",{viewBox:"0 0 24 24",width:"22",height:"22","aria-hidden":"true",children:v.jsx("path",{d:"M4 17l5-6 4 3 4-6 3 3",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round"})}),_y=()=>v.jsxs("svg",{viewBox:"0 0 24 24",width:"22",height:"22","aria-hidden":"true",children:[v.jsx("circle",{cx:"12",cy:"12",r:"7.5",fill:"none",stroke:"currentColor",strokeWidth:"1.7"}),v.jsx("circle",{cx:"12",cy:"12",r:"3",fill:"none",stroke:"currentColor",strokeWidth:"1.7"})]});function yy({day:t,onCheckIn:e,onBack:n}){const[i,r]=ye.useState(""),[s,a]=ye.useState(!1),o=async l=>{a(!0);try{await e(l)}finally{a(!1)}};return v.jsxs("div",{className:"screen",children:[v.jsx(Ca,{label:"Today",onClick:n}),v.jsxs("p",{className:"eyebrow",children:["Tonight · Day ",t]}),v.jsx("h2",{className:"headline",children:"How did your knee feel today?"}),v.jsx("div",{className:"feel-buttons",children:["good","sore","flare"].map(l=>v.jsxs("button",{type:"button",className:`feel feel-${l}`,disabled:s,onClick:()=>o({feel:l}),children:[v.jsx("span",{className:"feel-dot","aria-hidden":"true"}),ls[l]]},l))}),v.jsxs("form",{className:"say-it",onSubmit:l=>{l.preventDefault(),i.trim()&&o({text:i})},children:[v.jsx("label",{htmlFor:"say",className:"label",children:"Or say it"}),v.jsx("textarea",{id:"say",rows:3,maxLength:600,value:i,placeholder:"Swelled a bit after practice, maybe 5/10",onChange:l=>r(l.target.value)}),v.jsx("button",{type:"submit",className:"btn",disabled:s||!i.trim(),children:s?"Reading…":"Send"})]}),v.jsx("p",{className:"fine",children:"Sore is normal in rehab. Only a flare-up tells Kinn you pushed too far."})]})}function Sy({result:t,onNextDay:e}){const{checkin:n,after:i,other:r,risk:s}=t,o=n.feel==="flare"?ls.good:ls.flare,l=[{label:"Tomorrow",other:td[r.call],yours:td[i.call],call:i.call},{label:"Your line",other:r.line!==null?`${r.line}°`:"—",yours:i.line!==null?`${i.line}°`:"—"},{label:"Fatigue cap",other:r.fatigueCap!==null?`${r.fatigueCap}%`:"—",yours:i.fatigueCap!==null?`${i.fatigueCap}%`:"—"}];return v.jsxs("div",{className:"screen",children:[v.jsxs("p",{className:"eyebrow",children:["Checked in · ",ls[n.feel],n.pain!==null?` · pain ${n.pain}/10`:""]}),v.jsx("h2",{className:"headline",children:"Got it. Tomorrow’s plan is updated."}),n.readBy!=="tap"&&v.jsxs("p",{className:"body muted",children:["“",n.summary,"” ",v.jsx("span",{className:"chip",children:n.readBy==="claude"?"Read by Claude":"Read on device"})]}),v.jsxs("section",{className:"card",children:[v.jsx("p",{className:"label",children:"What your answer changed"}),v.jsxs("div",{className:"diff-row diff-head",children:[v.jsx("span",{}),v.jsxs("span",{children:["If “",o,"”"]}),v.jsx("span",{children:"You said"})]}),l.map(c=>v.jsxs("div",{className:"diff-row",children:[v.jsx("span",{className:"muted",children:c.label}),v.jsx("span",{className:"diff-other",children:c.other}),v.jsx("span",{className:`diff-yours${c.other===c.yours?"":" changed"}${c.call?` call-${c.call}`:""}`,children:c.yours})]},c.label))]}),v.jsxs("p",{className:"caption",children:["This morning Kinn gave today a ",Math.round(s*100),"% chance of a flare-up."]}),v.jsx("p",{className:"fine",children:"Tonight your phone shares a model update with the fleet: a few dozen numbers, never your readings or words."}),v.jsx("button",{type:"button",className:"btn",onClick:e,children:"See tomorrow"})]})}function My(t,e){if(!e)return"Your first day. Kinn will learn from tonight’s check-in.";if(t.flaredYesterday)return"Yesterday flared, so today is lighter.";if(t.line===null||e.line===null)return"Yesterday was calm. Kinn is still learning your line.";const n=t.line-e.line;return n>0?`Yesterday was calm, so your line moved up ${n}°.`:n<0?`Your line is ${-n}° lower today. Recent days ran hot.`:`Yesterday was calm. Your line holds at ${t.line}°.`}const wy=t=>t.call==="rest"?"Rest today. It’s part of the work.":"Ready for another day.",Ey=t=>t.reduce((e,n)=>e+n,0)/t.length;function by(t,e,n){if(e<2)return null;const i=t.slice(0,e-1).map(u=>_s(u)[n]),r=i[i.length-1],s=i.slice(-8,-1),a=i.slice(-7);if(!s.length)return{value:`${r}%`,note:"Your first reading",spark:a};const o=Math.round(r-Ey(s)),c=o===0?"Same as your normal":`${Math.abs(o)} points ${o>0?"over":"under"} your normal`;return{value:`${r}%`,note:c,spark:a}}function S0(t,e){const n=Math.floor((e-1)/7);if(n<1)return null;const i=(n-1)*7+1,r=Array.from({length:7},(c,u)=>i+u),s=[...r,i+7].map(c=>{var u;return((u=t.mornings[c-1])==null?void 0:u.line)??null}),a=nd();let o=0;for(const c of r){const u=t.steps[c-1];id(a,u.risk,u.flare),u.flare&&o++}const l=nd();for(const c of t.steps.slice(0,i+6))id(l,c.risk,c.flare);return{week:n,lineStart:s[0],lineEnd:s[7],lines:s,right:_0(l),flares:o,checkIns:7}}const sd=5;function M0(t){const e=(t-1)%sd+1;return{battery:100-(t-1)%7*9,stripDay:e,stripDaysLeft:sd-e}}function Ty({run:t,m:e,day:n,fleet:i,onWeek:r}){const s=t.events.filter(c=>c.day<n||c.day===n&&(c.kind==="line"||c.kind==="insight"||c.kind==="start")).reverse(),a=c=>i.weights[xr(Ot.group,c)],o=Math.max(.5,...Yt.flatMap(c=>[Math.abs(e.sensorWeights[c]),Math.abs(a(c))])),l=S0(t,n);return v.jsxs("div",{className:"screen",children:[v.jsxs("p",{className:"eyebrow",children:["From ",e.ownDays," of your day",e.ownDays===1?"":"s",i.devices>0?` + ${xn(i.devices)} recoveries`:""]}),v.jsx("h2",{className:"headline",children:"What Kinn has learned"}),l&&v.jsxs("button",{type:"button",className:"week-card",onClick:r,children:[v.jsxs("span",{children:[v.jsxs("span",{className:"label",children:["Week ",l.week," recap"]}),v.jsx("span",{className:"body-strong",children:w0(l.lineStart,l.lineEnd)})]}),v.jsx("span",{className:"metric small",children:l.right!==null?Rn(l.right):"—"})]}),n>2&&v.jsx(Ry,{run:t,day:n}),v.jsxs("section",{className:"card",children:[v.jsx("p",{className:"label",children:"What warns of a flare-up for you"}),v.jsxs("div",{className:"legend","aria-hidden":"true",children:[v.jsxs("span",{children:[v.jsx("i",{className:"bar-you"}),"You"]}),i.devices>0&&v.jsxs("span",{children:[v.jsx("i",{className:"bar-fleet"}),"People like you"]})]}),Yt.map(c=>v.jsxs("div",{className:"matter",children:[v.jsx("span",{className:"caption",children:xs[c]}),v.jsxs("span",{className:"bars","aria-label":`${xs[c]}: ${Cy(e.sensorWeights[c])} for you`,children:[v.jsx("span",{className:"bar bar-you",style:{width:`${Math.max(0,e.sensorWeights[c])/o*100}%`}}),i.devices>0&&v.jsx("span",{className:"bar bar-fleet",style:{width:`${Math.max(0,a(c))/o*100}%`}})]})]},c))]}),v.jsx("ol",{className:"events",children:s.map((c,u)=>v.jsx(Ay,{e:c},`${c.day}-${c.kind}-${u}`))})]})}const w0=(t,e)=>{if(t===null||e===null)return"Kinn is still finding your line.";const n=e-t;return n>0?`Your line went up ${n}°.`:n<0?`Your line came down ${-n}°.`:`Your line held at ${e}°.`},Cy=t=>t>1.5?"strong":t>.6?"moderate":t>.15?"weak":"little or no";function Ay({e:t}){return v.jsxs("li",{className:`event event-${t.kind}`,children:[v.jsxs("span",{className:"caption",children:["Day ",t.day]}),v.jsx("p",{className:"body-strong",children:t.title}),v.jsx("p",{className:"caption",children:t.detail})]})}function Ly({run:t,day:e,onBack:n}){const i=S0(t,e),[r,s]=ye.useState(!1);if(!i)return v.jsxs("div",{className:"screen",children:[v.jsx(Ca,{label:"Learned",onClick:n}),v.jsx("h2",{className:"headline",children:"Your first week ends on day 7."}),v.jsx("p",{className:"body muted",children:"Every Sunday Kinn sums up the week: your line, your flare-ups, and how often its calls were right."})]});const a=i.lines.filter(g=>g!==null),o=Math.min(...a)-4,l=Math.max(...a)+4,c=g=>6+g/(i.lines.length-1)*208,u=g=>8+(1-(g-o)/(l-o))*60,f=i.lines.map((g,S)=>g===null?null:`${c(S).toFixed(1)},${u(g).toFixed(1)}`).filter(Boolean),d=a[a.length-1];return v.jsxs("div",{className:"screen",children:[v.jsx(Ca,{label:"Learned",onClick:n}),v.jsxs("p",{className:"eyebrow",children:["Week ",i.week," recap"]}),v.jsx("h2",{className:"headline",children:w0(i.lineStart,i.lineEnd)}),v.jsxs("section",{className:"card",children:[v.jsx("p",{className:"label",children:"Your line, each morning"}),v.jsxs("svg",{viewBox:"0 0 220 76",width:"100%",height:"76","aria-label":`Your line went from ${i.lineStart??"—"}° to ${i.lineEnd??"—"}°`,children:[v.jsx("polyline",{points:f.join(" "),fill:"none",stroke:"var(--data-load)",strokeWidth:"2.5",strokeLinejoin:"round"}),d!==void 0&&v.jsx("circle",{cx:c(i.lines.length-1),cy:u(d),r:"4",fill:"var(--data-load)"})]}),v.jsxs("div",{className:"axis",children:[v.jsxs("span",{children:[i.lineStart??"—","°"]}),v.jsxs("span",{children:[i.lineEnd??"—","°"]})]})]}),v.jsxs("div",{className:"stats",children:[v.jsxs("div",{className:"stat",children:[v.jsx("span",{className:"metric",children:i.right!==null?Rn(i.right):"—"}),v.jsx("span",{className:"caption",children:"calls right to date"})]}),v.jsxs("div",{className:"stat",children:[v.jsx("span",{className:"metric",children:i.flares}),v.jsxs("span",{className:"caption",children:["flare-up",i.flares===1?"":"s"]})]}),v.jsxs("div",{className:"stat",children:[v.jsxs("span",{className:"metric",children:[i.checkIns,"/7"]}),v.jsx("span",{className:"caption",children:"check-ins"})]})]}),v.jsx("p",{className:"body muted",children:"Calls right checks each morning’s call against that night’s check-in: flare-ups Kinn saw coming and calm days it called calm both count."}),v.jsx("button",{type:"button",className:"btn ghost",onClick:()=>s(!0),disabled:r,children:r?"Sent to your PT":"Share with my PT"})]})}function Py({day:t}){const e=M0(t),[n,i]=ye.useState(!1),[r,s]=ye.useState(!0);return v.jsxs("div",{className:"screen",children:[v.jsx("p",{className:"eyebrow",children:"You"}),v.jsxs("h2",{className:"headline",children:[Ot.name," · Right knee"]}),v.jsxs("p",{className:"caption",children:[vl.acl," · week ",Math.ceil(t/7)," with Kinn"]}),v.jsxs("section",{className:"card",children:[v.jsxs(yc,{label:"Coin",children:[v.jsx("span",{className:"call-push",children:"Connected"})," · ",e.battery,"%"]}),v.jsxs(yc,{label:"Strip",children:["day ",e.stripDay," of ",sd]}),v.jsx(yc,{label:"Physical therapist",children:"Sharing on"})]}),v.jsxs("section",{className:`card strip-card${e.stripDaysLeft<=1?" due":""}`,children:[v.jsx("p",{className:"body-strong",children:e.stripDaysLeft===0?"Put on a new strip today.":`Replace your strip in ${e.stripDaysLeft} day${e.stripDaysLeft===1?"":"s"}.`}),v.jsx("p",{className:"caption",children:"The coin moves to the new strip. Your model stays on your phone."}),v.jsx("button",{type:"button",className:"btn ghost",onClick:()=>i(!0),disabled:n,children:n?"Ordered. 10 strips arrive in 2 days.":"Reorder strips"})]}),v.jsx("section",{className:"card",children:v.jsxs("div",{className:"toggle-row",children:[v.jsxs("span",{children:[v.jsx("span",{className:"body-strong",children:"Help other Kinns learn"}),v.jsx("span",{className:"caption",children:"Share model updates (a few dozen numbers) each night. Your readings and words never leave your phone."})]}),v.jsx("button",{type:"button",role:"switch","aria-checked":r,className:`switch${r?" on":""}`,onClick:()=>s(a=>!a),children:v.jsx("span",{className:"visually-hidden",children:"Help other Kinns learn"})})]})}),v.jsx("p",{className:"fine",children:"Kinn is in development and is not a medical device. It tracks and suggests; it doesn’t diagnose or treat."})]})}function Ry({run:t,day:e}){const r={l:28,r:8,t:8,b:18},s=Array.from({length:e},(h,m)=>m+1),a=s.map(h=>t.mornings[h-1].line),o=s.slice(0,-1).map(h=>_s(t.days[h-1]).flexDeg),l=[...a.filter(h=>h!==null),...o],c=Math.floor((Math.min(...l)-4)/10)*10,u=Math.ceil((Math.max(...l)+4)/10)*10,f=h=>r.l+(h-1)/Math.max(1,e-1)*(300-r.l-r.r),d=h=>r.t+(1-(h-c)/(u-c))*(132-r.t-r.b),g=a.map((h,m)=>h===null?null:`${f(m+1).toFixed(1)},${d(h).toFixed(1)}`).filter(Boolean).join(" "),S=[c,Math.round((c+u)/2/10)*10,u],p=a[a.length-1];return v.jsxs("section",{className:"card",children:[v.jsxs("div",{className:"card-head",children:[v.jsx("p",{className:"label",children:"Day by day"}),v.jsxs("span",{className:"caption",children:["day 1–",e]})]}),v.jsxs("svg",{viewBox:"0 0 300 132",width:"100%","aria-label":`Your line went from ${a.find(h=>h!==null)??"—"}° to ${p??"—"}° over ${e} days`,children:[S.map(h=>v.jsxs("g",{children:[v.jsx("line",{x1:r.l,x2:300-r.r,y1:d(h),y2:d(h),className:"grid"}),v.jsxs("text",{x:r.l-6,y:d(h),className:"tick",textAnchor:"end",dominantBaseline:"middle",children:[h,"°"]})]},h)),o.map((h,m)=>v.jsx("circle",{cx:f(m+1),cy:d(h),r:"2.2",className:"peak-dot"},m)),v.jsx("polyline",{points:g,fill:"none",className:"line-path",strokeWidth:"2.4",strokeLinejoin:"round"}),p!==null&&v.jsx("circle",{cx:f(e),cy:d(p),r:"4",className:"line-end"}),s.slice(0,-1).map(h=>t.days[h-1].flare?v.jsx("rect",{x:f(h)-1.5,y:132-r.b+5,width:"3",height:"8",rx:"1.5",className:"flare-mark"},h):null)]}),v.jsxs("div",{className:"legend",children:[v.jsxs("span",{children:[v.jsx("i",{className:"lg-line"}),"Your line"]}),v.jsxs("span",{children:[v.jsx("i",{className:"lg-peak"}),"Peak bend"]}),v.jsxs("span",{children:[v.jsx("i",{className:"lg-flare"}),"Flare-up"]})]})]})}/**
 * @license
 * Copyright 2010-2022 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const gf="147",Dy=0,Oh=1,Ny=2,E0=1,ky=2,Ks=3,ys=0,yn=1,oi=2,Oi=0,cs=1,Uh=2,Bh=3,Vh=4,Iy=5,Gr=100,Fy=101,zy=102,Gh=103,Wh=104,Oy=200,Uy=201,By=202,Vy=203,b0=204,T0=205,Gy=206,Wy=207,Hy=208,jy=209,$y=210,Xy=0,qy=1,Yy=2,ad=3,Ky=4,Zy=5,Qy=6,Jy=7,C0=0,e1=1,t1=2,ci=0,n1=1,i1=2,r1=3,A0=4,s1=5,L0=300,Ss=301,Ms=302,od=303,ld=304,Fl=306,cd=1e3,Nn=1001,ud=1002,Wt=1003,Hh=1004,jh=1005,gn=1006,a1=1007,zl=1008,_r=1009,o1=1010,l1=1011,P0=1012,c1=1013,or=1014,lr=1015,Aa=1016,u1=1017,d1=1018,us=1020,f1=1021,h1=1022,kn=1023,p1=1024,m1=1025,dr=1026,ws=1027,g1=1028,v1=1029,x1=1030,_1=1031,y1=1033,Sc=33776,Mc=33777,wc=33778,Ec=33779,$h=35840,Xh=35841,qh=35842,Yh=35843,S1=36196,Kh=37492,Zh=37496,Qh=37808,Jh=37809,ep=37810,tp=37811,np=37812,ip=37813,rp=37814,sp=37815,ap=37816,op=37817,lp=37818,cp=37819,up=37820,dp=37821,fp=36492,yr=3e3,je=3001,M1=3200,w1=3201,R0=0,E1=1,Bn="srgb",La="srgb-linear",bc=7680,b1=519,hp=35044,pp="300 es",dd=1035;class As{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Tt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Tc=Math.PI/180,mp=180/Math.PI;function Ia(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Tt[t&255]+Tt[t>>8&255]+Tt[t>>16&255]+Tt[t>>24&255]+"-"+Tt[e&255]+Tt[e>>8&255]+"-"+Tt[e>>16&15|64]+Tt[e>>24&255]+"-"+Tt[n&63|128]+Tt[n>>8&255]+"-"+Tt[n>>16&255]+Tt[n>>24&255]+Tt[i&255]+Tt[i>>8&255]+Tt[i>>16&255]+Tt[i>>24&255]).toLowerCase()}function zt(t,e,n){return Math.max(e,Math.min(n,t))}function T1(t,e){return(t%e+e)%e}function Cc(t,e,n){return(1-n)*t+n*e}function gp(t){return(t&t-1)===0&&t!==0}function fd(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function ro(t,e){switch(e.constructor){case Float32Array:return t;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function Qt(t,e){switch(e.constructor){case Float32Array:return t;case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class ke{constructor(e=0,n=0){ke.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class sn{constructor(){sn.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1]}set(e,n,i,r,s,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=n,u[4]=s,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],f=i[7],d=i[2],g=i[5],S=i[8],p=r[0],h=r[3],m=r[6],x=r[1],y=r[4],M=r[7],w=r[2],T=r[5],P=r[8];return s[0]=a*p+o*x+l*w,s[3]=a*h+o*y+l*T,s[6]=a*m+o*M+l*P,s[1]=c*p+u*x+f*w,s[4]=c*h+u*y+f*T,s[7]=c*m+u*M+f*P,s[2]=d*p+g*x+S*w,s[5]=d*h+g*y+S*T,s[8]=d*m+g*M+S*P,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return n*a*u-n*o*c-i*s*u+i*o*l+r*s*c-r*a*l}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=u*a-o*c,d=o*l-u*s,g=c*s-a*l,S=n*f+i*d+r*g;if(S===0)return this.set(0,0,0,0,0,0,0,0,0);const p=1/S;return e[0]=f*p,e[1]=(r*c-u*i)*p,e[2]=(o*i-r*a)*p,e[3]=d*p,e[4]=(u*n-r*l)*p,e[5]=(r*s-o*n)*p,e[6]=g*p,e[7]=(i*l-c*n)*p,e[8]=(a*n-i*s)*p,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+n,0,0,1),this}scale(e,n){return this.premultiply(Ac.makeScale(e,n)),this}rotate(e){return this.premultiply(Ac.makeRotation(-e)),this}translate(e,n){return this.premultiply(Ac.makeTranslation(e,n)),this}makeTranslation(e,n){return this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ac=new sn;function D0(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function xl(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function fr(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Wo(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}const Lc={[Bn]:{[La]:fr},[La]:{[Bn]:Wo}},kt={legacyMode:!0,get workingColorSpace(){return La},set workingColorSpace(t){console.warn("THREE.ColorManagement: .workingColorSpace is readonly.")},convert:function(t,e,n){if(this.legacyMode||e===n||!e||!n)return t;if(Lc[e]&&Lc[e][n]!==void 0){const i=Lc[e][n];return t.r=i(t.r),t.g=i(t.g),t.b=i(t.b),t}throw new Error("Unsupported color space conversion.")},fromWorkingColorSpace:function(t,e){return this.convert(t,this.workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this.workingColorSpace)}},N0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},at={r:0,g:0,b:0},bn={h:0,s:0,l:0},so={h:0,s:0,l:0};function Pc(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}function ao(t,e){return e.r=t.r,e.g=t.g,e.b=t.b,e}class Oe{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,n===void 0&&i===void 0?this.set(e):this.setRGB(e,n,i)}set(e){return e&&e.isColor?this.copy(e):typeof e=="number"?this.setHex(e):typeof e=="string"&&this.setStyle(e),this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Bn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,kt.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=kt.workingColorSpace){return this.r=e,this.g=n,this.b=i,kt.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=kt.workingColorSpace){if(e=T1(e,1),n=zt(n,0,1),i=zt(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=Pc(a,s,e+1/3),this.g=Pc(a,s,e),this.b=Pc(a,s,e-1/3)}return kt.toWorkingColorSpace(this,r),this}setStyle(e,n=Bn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return this.r=Math.min(255,parseInt(s[1],10))/255,this.g=Math.min(255,parseInt(s[2],10))/255,this.b=Math.min(255,parseInt(s[3],10))/255,kt.toWorkingColorSpace(this,n),i(s[4]),this;if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return this.r=Math.min(100,parseInt(s[1],10))/100,this.g=Math.min(100,parseInt(s[2],10))/100,this.b=Math.min(100,parseInt(s[3],10))/100,kt.toWorkingColorSpace(this,n),i(s[4]),this;break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)){const l=parseFloat(s[1])/360,c=parseFloat(s[2])/100,u=parseFloat(s[3])/100;return i(s[4]),this.setHSL(l,c,u,n)}break}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.r=parseInt(s.charAt(0)+s.charAt(0),16)/255,this.g=parseInt(s.charAt(1)+s.charAt(1),16)/255,this.b=parseInt(s.charAt(2)+s.charAt(2),16)/255,kt.toWorkingColorSpace(this,n),this;if(a===6)return this.r=parseInt(s.charAt(0)+s.charAt(1),16)/255,this.g=parseInt(s.charAt(2)+s.charAt(3),16)/255,this.b=parseInt(s.charAt(4)+s.charAt(5),16)/255,kt.toWorkingColorSpace(this,n),this}return e&&e.length>0?this.setColorName(e,n):this}setColorName(e,n=Bn){const i=N0[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=fr(e.r),this.g=fr(e.g),this.b=fr(e.b),this}copyLinearToSRGB(e){return this.r=Wo(e.r),this.g=Wo(e.g),this.b=Wo(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bn){return kt.fromWorkingColorSpace(ao(this,at),e),zt(at.r*255,0,255)<<16^zt(at.g*255,0,255)<<8^zt(at.b*255,0,255)<<0}getHexString(e=Bn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=kt.workingColorSpace){kt.fromWorkingColorSpace(ao(this,at),n);const i=at.r,r=at.g,s=at.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case i:l=(r-s)/f+(r<s?6:0);break;case r:l=(s-i)/f+2;break;case s:l=(i-r)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,n=kt.workingColorSpace){return kt.fromWorkingColorSpace(ao(this,at),n),e.r=at.r,e.g=at.g,e.b=at.b,e}getStyle(e=Bn){return kt.fromWorkingColorSpace(ao(this,at),e),e!==Bn?`color(${e} ${at.r} ${at.g} ${at.b})`:`rgb(${at.r*255|0},${at.g*255|0},${at.b*255|0})`}offsetHSL(e,n,i){return this.getHSL(bn),bn.h+=e,bn.s+=n,bn.l+=i,this.setHSL(bn.h,bn.s,bn.l),this}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(bn),e.getHSL(so);const i=Cc(bn.h,so.h,n),r=Cc(bn.s,so.s,n),s=Cc(bn.l,so.l,n);return this.setHSL(i,r,s),this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}Oe.NAMES=N0;let Tr;class k0{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Tr===void 0&&(Tr=xl("canvas")),Tr.width=e.width,Tr.height=e.height;const i=Tr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Tr}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=xl("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=fr(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(fr(n[i]/255)*255):n[i]=fr(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}class I0{constructor(e=null){this.isSource=!0,this.uuid=Ia(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Rc(r[a].image)):s.push(Rc(r[a]))}else s=Rc(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function Rc(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?k0.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let C1=0;class qt extends As{constructor(e=qt.DEFAULT_IMAGE,n=qt.DEFAULT_MAPPING,i=Nn,r=Nn,s=gn,a=zl,o=kn,l=_r,c=qt.DEFAULT_ANISOTROPY,u=yr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:C1++}),this.uuid=Ia(),this.name="",this.source=new I0(e),this.mipmaps=[],this.mapping=n,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new sn,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.encoding=e.encoding,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,type:this.type,encoding:this.encoding,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return JSON.stringify(this.userData)!=="{}"&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==L0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case cd:e.x=e.x-Math.floor(e.x);break;case Nn:e.x=e.x<0?0:1;break;case ud:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case cd:e.y=e.y-Math.floor(e.y);break;case Nn:e.y=e.y<0?0:1;break;case ud:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}}qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=L0;qt.DEFAULT_ANISOTROPY=1;class _t{constructor(e=0,n=0,i=0,r=1){_t.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const l=e.elements,c=l[0],u=l[4],f=l[8],d=l[1],g=l[5],S=l[9],p=l[2],h=l[6],m=l[10];if(Math.abs(u-d)<.01&&Math.abs(f-p)<.01&&Math.abs(S-h)<.01){if(Math.abs(u+d)<.1&&Math.abs(f+p)<.1&&Math.abs(S+h)<.1&&Math.abs(c+g+m-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const y=(c+1)/2,M=(g+1)/2,w=(m+1)/2,T=(u+d)/4,P=(f+p)/4,_=(S+h)/4;return y>M&&y>w?y<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(y),r=T/i,s=P/i):M>w?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=T/r,s=_/r):w<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(w),i=P/s,r=_/s),this.set(i,r,s,n),this}let x=Math.sqrt((h-S)*(h-S)+(f-p)*(f-p)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(h-S)/x,this.y=(f-p)/x,this.z=(d-u)/x,this.w=Math.acos((c+g+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Sr extends As{constructor(e=1,n=1,i={}){super(),this.isWebGLRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new _t(0,0,e,n),this.scissorTest=!1,this.viewport=new _t(0,0,e,n);const r={width:e,height:n,depth:1};this.texture=new qt(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.encoding),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps!==void 0?i.generateMipmaps:!1,this.texture.internalFormat=i.internalFormat!==void 0?i.internalFormat:null,this.texture.minFilter=i.minFilter!==void 0?i.minFilter:gn,this.depthBuffer=i.depthBuffer!==void 0?i.depthBuffer:!0,this.stencilBuffer=i.stencilBuffer!==void 0?i.stencilBuffer:!1,this.depthTexture=i.depthTexture!==void 0?i.depthTexture:null,this.samples=i.samples!==void 0?i.samples:0}setSize(e,n,i=1){(this.width!==e||this.height!==n||this.depth!==i)&&(this.width=e,this.height=n,this.depth=i,this.texture.image.width=e,this.texture.image.height=n,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new I0(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class F0 extends qt{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class A1 extends qt{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Fa{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let l=i[r+0],c=i[r+1],u=i[r+2],f=i[r+3];const d=s[a+0],g=s[a+1],S=s[a+2],p=s[a+3];if(o===0){e[n+0]=l,e[n+1]=c,e[n+2]=u,e[n+3]=f;return}if(o===1){e[n+0]=d,e[n+1]=g,e[n+2]=S,e[n+3]=p;return}if(f!==p||l!==d||c!==g||u!==S){let h=1-o;const m=l*d+c*g+u*S+f*p,x=m>=0?1:-1,y=1-m*m;if(y>Number.EPSILON){const w=Math.sqrt(y),T=Math.atan2(w,m*x);h=Math.sin(h*T)/w,o=Math.sin(o*T)/w}const M=o*x;if(l=l*h+d*M,c=c*h+g*M,u=u*h+S*M,f=f*h+p*M,h===1-o){const w=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=w,c*=w,u*=w,f*=w}}e[n]=l,e[n+1]=c,e[n+2]=u,e[n+3]=f}static multiplyQuaternionsFlat(e,n,i,r,s,a){const o=i[r],l=i[r+1],c=i[r+2],u=i[r+3],f=s[a],d=s[a+1],g=s[a+2],S=s[a+3];return e[n]=o*S+u*f+l*g-c*d,e[n+1]=l*S+u*d+c*f-o*g,e[n+2]=c*S+u*g+o*d-l*f,e[n+3]=u*S-o*f-l*d-c*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(r/2),f=o(s/2),d=l(i/2),g=l(r/2),S=l(s/2);switch(a){case"XYZ":this._x=d*u*f+c*g*S,this._y=c*g*f-d*u*S,this._z=c*u*S+d*g*f,this._w=c*u*f-d*g*S;break;case"YXZ":this._x=d*u*f+c*g*S,this._y=c*g*f-d*u*S,this._z=c*u*S-d*g*f,this._w=c*u*f+d*g*S;break;case"ZXY":this._x=d*u*f-c*g*S,this._y=c*g*f+d*u*S,this._z=c*u*S+d*g*f,this._w=c*u*f-d*g*S;break;case"ZYX":this._x=d*u*f-c*g*S,this._y=c*g*f+d*u*S,this._z=c*u*S-d*g*f,this._w=c*u*f+d*g*S;break;case"YZX":this._x=d*u*f+c*g*S,this._y=c*g*f+d*u*S,this._z=c*u*S-d*g*f,this._w=c*u*f-d*g*S;break;case"XZY":this._x=d*u*f-c*g*S,this._y=c*g*f-d*u*S,this._z=c*u*S+d*g*f,this._w=c*u*f+d*g*S;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],l=n[9],c=n[2],u=n[6],f=n[10],d=i+o+f;if(d>0){const g=.5/Math.sqrt(d+1);this._w=.25/g,this._x=(u-l)*g,this._y=(s-c)*g,this._z=(a-r)*g}else if(i>o&&i>f){const g=2*Math.sqrt(1+i-o-f);this._w=(u-l)/g,this._x=.25*g,this._y=(r+a)/g,this._z=(s+c)/g}else if(o>f){const g=2*Math.sqrt(1+o-i-f);this._w=(s-c)/g,this._x=(r+a)/g,this._y=.25*g,this._z=(l+u)/g}else{const g=2*Math.sqrt(1+f-i-o);this._w=(a-r)/g,this._x=(s+c)/g,this._y=(l+u)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(zt(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,l=n._y,c=n._z,u=n._w;return this._x=i*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-i*c,this._z=s*u+a*c+i*l-r*o,this._w=a*u-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const g=1-n;return this._w=g*a+n*this._w,this._x=g*i+n*this._x,this._y=g*r+n*this._y,this._z=g*s+n*this._z,this.normalize(),this._onChangeCallback(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),f=Math.sin((1-n)*u)/c,d=Math.sin(n*u)/c;return this._w=a*f+this._w*d,this._x=i*f+this._x*d,this._y=r*f+this._y*d,this._z=s*f+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=Math.random(),n=Math.sqrt(1-e),i=Math.sqrt(e),r=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(n*Math.cos(r),i*Math.sin(s),i*Math.cos(s),n*Math.sin(r))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class z{constructor(e=0,n=0,i=0){z.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(vp.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(vp.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=l*n+a*r-o*i,u=l*i+o*n-s*r,f=l*r+s*i-a*n,d=-s*n-a*i-o*r;return this.x=c*l+d*-s+u*-o-f*-a,this.y=u*l+d*-a+f*-s-c*-o,this.z=f*l+d*-o+c*-a-u*-s,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,l=n.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Dc.copy(this).projectOnVector(e),this.sub(Dc)}reflect(e){return this.sub(Dc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(zt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,n=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(n),this.y=i*Math.sin(n),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Dc=new z,vp=new Fa;class za{constructor(e=new z(1/0,1/0,1/0),n=new z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){let n=1/0,i=1/0,r=1/0,s=-1/0,a=-1/0,o=-1/0;for(let l=0,c=e.length;l<c;l+=3){const u=e[l],f=e[l+1],d=e[l+2];u<n&&(n=u),f<i&&(i=f),d<r&&(r=d),u>s&&(s=u),f>a&&(a=f),d>o&&(o=d)}return this.min.set(n,i,r),this.max.set(s,a,o),this}setFromBufferAttribute(e){let n=1/0,i=1/0,r=1/0,s=-1/0,a=-1/0,o=-1/0;for(let l=0,c=e.count;l<c;l++){const u=e.getX(l),f=e.getY(l),d=e.getZ(l);u<n&&(n=u),f<i&&(i=f),d<r&&(r=d),u>s&&(s=u),f>a&&(a=f),d>o&&(o=d)}return this.min.set(n,i,r),this.max.set(s,a,o),this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=qi.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0)if(n&&i.attributes!=null&&i.attributes.position!==void 0){const s=i.attributes.position;for(let a=0,o=s.count;a<o;a++)qi.fromBufferAttribute(s,a).applyMatrix4(e.matrixWorld),this.expandByPoint(qi)}else i.boundingBox===null&&i.computeBoundingBox(),Nc.copy(i.boundingBox),Nc.applyMatrix4(e.matrixWorld),this.union(Nc);const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,qi),qi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vs),oo.subVectors(this.max,Vs),Cr.subVectors(e.a,Vs),Ar.subVectors(e.b,Vs),Lr.subVectors(e.c,Vs),gi.subVectors(Ar,Cr),vi.subVectors(Lr,Ar),Yi.subVectors(Cr,Lr);let n=[0,-gi.z,gi.y,0,-vi.z,vi.y,0,-Yi.z,Yi.y,gi.z,0,-gi.x,vi.z,0,-vi.x,Yi.z,0,-Yi.x,-gi.y,gi.x,0,-vi.y,vi.x,0,-Yi.y,Yi.x,0];return!kc(n,Cr,Ar,Lr,oo)||(n=[1,0,0,0,1,0,0,0,1],!kc(n,Cr,Ar,Lr,oo))?!1:(lo.crossVectors(gi,vi),n=[lo.x,lo.y,lo.z],kc(n,Cr,Ar,Lr,oo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return qi.copy(e).clamp(this.min,this.max).sub(e).length()}getBoundingSphere(e){return this.getCenter(e.center),e.radius=this.getSize(qi).length()*.5,e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Zn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Zn=[new z,new z,new z,new z,new z,new z,new z,new z],qi=new z,Nc=new za,Cr=new z,Ar=new z,Lr=new z,gi=new z,vi=new z,Yi=new z,Vs=new z,oo=new z,lo=new z,Ki=new z;function kc(t,e,n,i,r){for(let s=0,a=t.length-3;s<=a;s+=3){Ki.fromArray(t,s);const o=r.x*Math.abs(Ki.x)+r.y*Math.abs(Ki.y)+r.z*Math.abs(Ki.z),l=e.dot(Ki),c=n.dot(Ki),u=i.dot(Ki);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const L1=new za,Gs=new z,Ic=new z;class vf{constructor(e=new z,n=-1){this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):L1.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Gs.subVectors(e,this.center);const n=Gs.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(Gs,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ic.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Gs.copy(e.center).add(Ic)),this.expandByPoint(Gs.copy(e.center).sub(Ic))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Qn=new z,Fc=new z,co=new z,xi=new z,zc=new z,uo=new z,Oc=new z;class P1{constructor(e=new z,n=new z(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.direction).multiplyScalar(e).add(this.origin)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Qn)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.direction).multiplyScalar(i).add(this.origin)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=Qn.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(Qn.copy(this.direction).multiplyScalar(n).add(this.origin),Qn.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){Fc.copy(e).add(n).multiplyScalar(.5),co.copy(n).sub(e).normalize(),xi.copy(this.origin).sub(Fc);const s=e.distanceTo(n)*.5,a=-this.direction.dot(co),o=xi.dot(this.direction),l=-xi.dot(co),c=xi.lengthSq(),u=Math.abs(1-a*a);let f,d,g,S;if(u>0)if(f=a*l-o,d=a*o-l,S=s*u,f>=0)if(d>=-S)if(d<=S){const p=1/u;f*=p,d*=p,g=f*(f+a*d+2*o)+d*(a*f+d+2*l)+c}else d=s,f=Math.max(0,-(a*d+o)),g=-f*f+d*(d+2*l)+c;else d=-s,f=Math.max(0,-(a*d+o)),g=-f*f+d*(d+2*l)+c;else d<=-S?(f=Math.max(0,-(-a*s+o)),d=f>0?-s:Math.min(Math.max(-s,-l),s),g=-f*f+d*(d+2*l)+c):d<=S?(f=0,d=Math.min(Math.max(-s,-l),s),g=d*(d+2*l)+c):(f=Math.max(0,-(a*s+o)),d=f>0?s:Math.min(Math.max(-s,-l),s),g=-f*f+d*(d+2*l)+c);else d=a>0?-s:s,f=Math.max(0,-(a*d+o)),g=-f*f+d*(d+2*l)+c;return i&&i.copy(this.direction).multiplyScalar(f).add(this.origin),r&&r.copy(co).multiplyScalar(d).add(Fc),g}intersectSphere(e,n){Qn.subVectors(e.center,this.origin);const i=Qn.dot(this.direction),r=Qn.dot(Qn)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return o<0&&l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),f>=0?(o=(e.min.z-d.z)*f,l=(e.max.z-d.z)*f):(o=(e.max.z-d.z)*f,l=(e.min.z-d.z)*f),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,Qn)!==null}intersectTriangle(e,n,i,r,s){zc.subVectors(n,e),uo.subVectors(i,e),Oc.crossVectors(zc,uo);let a=this.direction.dot(Oc),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;xi.subVectors(this.origin,e);const l=o*this.direction.dot(uo.crossVectors(xi,uo));if(l<0)return null;const c=o*this.direction.dot(zc.cross(xi));if(c<0||l+c>a)return null;const u=-o*xi.dot(Oc);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class St{constructor(){St.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}set(e,n,i,r,s,a,o,l,c,u,f,d,g,S,p,h){const m=this.elements;return m[0]=e,m[4]=n,m[8]=i,m[12]=r,m[1]=s,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=u,m[10]=f,m[14]=d,m[3]=g,m[7]=S,m[11]=p,m[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new St().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/Pr.setFromMatrixColumn(e,0).length(),s=1/Pr.setFromMatrixColumn(e,1).length(),a=1/Pr.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),f=Math.sin(s);if(e.order==="XYZ"){const d=a*u,g=a*f,S=o*u,p=o*f;n[0]=l*u,n[4]=-l*f,n[8]=c,n[1]=g+S*c,n[5]=d-p*c,n[9]=-o*l,n[2]=p-d*c,n[6]=S+g*c,n[10]=a*l}else if(e.order==="YXZ"){const d=l*u,g=l*f,S=c*u,p=c*f;n[0]=d+p*o,n[4]=S*o-g,n[8]=a*c,n[1]=a*f,n[5]=a*u,n[9]=-o,n[2]=g*o-S,n[6]=p+d*o,n[10]=a*l}else if(e.order==="ZXY"){const d=l*u,g=l*f,S=c*u,p=c*f;n[0]=d-p*o,n[4]=-a*f,n[8]=S+g*o,n[1]=g+S*o,n[5]=a*u,n[9]=p-d*o,n[2]=-a*c,n[6]=o,n[10]=a*l}else if(e.order==="ZYX"){const d=a*u,g=a*f,S=o*u,p=o*f;n[0]=l*u,n[4]=S*c-g,n[8]=d*c+p,n[1]=l*f,n[5]=p*c+d,n[9]=g*c-S,n[2]=-c,n[6]=o*l,n[10]=a*l}else if(e.order==="YZX"){const d=a*l,g=a*c,S=o*l,p=o*c;n[0]=l*u,n[4]=p-d*f,n[8]=S*f+g,n[1]=f,n[5]=a*u,n[9]=-o*u,n[2]=-c*u,n[6]=g*f+S,n[10]=d-p*f}else if(e.order==="XZY"){const d=a*l,g=a*c,S=o*l,p=o*c;n[0]=l*u,n[4]=-f,n[8]=c*u,n[1]=d*f+p,n[5]=a*u,n[9]=g*f-S,n[2]=S*f-g,n[6]=o*u,n[10]=p*f+d}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(R1,e,D1)}lookAt(e,n,i){const r=this.elements;return Jt.subVectors(e,n),Jt.lengthSq()===0&&(Jt.z=1),Jt.normalize(),_i.crossVectors(i,Jt),_i.lengthSq()===0&&(Math.abs(i.z)===1?Jt.x+=1e-4:Jt.z+=1e-4,Jt.normalize(),_i.crossVectors(i,Jt)),_i.normalize(),fo.crossVectors(Jt,_i),r[0]=_i.x,r[4]=fo.x,r[8]=Jt.x,r[1]=_i.y,r[5]=fo.y,r[9]=Jt.y,r[2]=_i.z,r[6]=fo.z,r[10]=Jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],f=i[5],d=i[9],g=i[13],S=i[2],p=i[6],h=i[10],m=i[14],x=i[3],y=i[7],M=i[11],w=i[15],T=r[0],P=r[4],_=r[8],C=r[12],L=r[1],O=r[5],re=r[9],V=r[13],k=r[2],q=r[6],K=r[10],Z=r[14],D=r[3],G=r[7],B=r[11],I=r[15];return s[0]=a*T+o*L+l*k+c*D,s[4]=a*P+o*O+l*q+c*G,s[8]=a*_+o*re+l*K+c*B,s[12]=a*C+o*V+l*Z+c*I,s[1]=u*T+f*L+d*k+g*D,s[5]=u*P+f*O+d*q+g*G,s[9]=u*_+f*re+d*K+g*B,s[13]=u*C+f*V+d*Z+g*I,s[2]=S*T+p*L+h*k+m*D,s[6]=S*P+p*O+h*q+m*G,s[10]=S*_+p*re+h*K+m*B,s[14]=S*C+p*V+h*Z+m*I,s[3]=x*T+y*L+M*k+w*D,s[7]=x*P+y*O+M*q+w*G,s[11]=x*_+y*re+M*K+w*B,s[15]=x*C+y*V+M*Z+w*I,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],f=e[6],d=e[10],g=e[14],S=e[3],p=e[7],h=e[11],m=e[15];return S*(+s*l*f-r*c*f-s*o*d+i*c*d+r*o*g-i*l*g)+p*(+n*l*g-n*c*d+s*a*d-r*a*g+r*c*u-s*l*u)+h*(+n*c*f-n*o*g-s*a*f+i*a*g+s*o*u-i*c*u)+m*(-r*o*u-n*l*f+n*o*d+r*a*f-i*a*d+i*l*u)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=e[9],d=e[10],g=e[11],S=e[12],p=e[13],h=e[14],m=e[15],x=f*h*c-p*d*c+p*l*g-o*h*g-f*l*m+o*d*m,y=S*d*c-u*h*c-S*l*g+a*h*g+u*l*m-a*d*m,M=u*p*c-S*f*c+S*o*g-a*p*g-u*o*m+a*f*m,w=S*f*l-u*p*l-S*o*d+a*p*d+u*o*h-a*f*h,T=n*x+i*y+r*M+s*w;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const P=1/T;return e[0]=x*P,e[1]=(p*d*s-f*h*s-p*r*g+i*h*g+f*r*m-i*d*m)*P,e[2]=(o*h*s-p*l*s+p*r*c-i*h*c-o*r*m+i*l*m)*P,e[3]=(f*l*s-o*d*s-f*r*c+i*d*c+o*r*g-i*l*g)*P,e[4]=y*P,e[5]=(u*h*s-S*d*s+S*r*g-n*h*g-u*r*m+n*d*m)*P,e[6]=(S*l*s-a*h*s-S*r*c+n*h*c+a*r*m-n*l*m)*P,e[7]=(a*d*s-u*l*s+u*r*c-n*d*c-a*r*g+n*l*g)*P,e[8]=M*P,e[9]=(S*f*s-u*p*s-S*i*g+n*p*g+u*i*m-n*f*m)*P,e[10]=(a*p*s-S*o*s+S*i*c-n*p*c-a*i*m+n*o*m)*P,e[11]=(u*o*s-a*f*s-u*i*c+n*f*c+a*i*g-n*o*g)*P,e[12]=w*P,e[13]=(u*p*r-S*f*r+S*i*d-n*p*d-u*i*h+n*f*h)*P,e[14]=(S*o*r-a*p*r-S*i*l+n*p*l+a*i*h-n*o*h)*P,e[15]=(a*f*r-u*o*r+u*i*l-n*f*l-a*i*d+n*o*d)*P,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+i,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,l=n._w,c=s+s,u=a+a,f=o+o,d=s*c,g=s*u,S=s*f,p=a*u,h=a*f,m=o*f,x=l*c,y=l*u,M=l*f,w=i.x,T=i.y,P=i.z;return r[0]=(1-(p+m))*w,r[1]=(g+M)*w,r[2]=(S-y)*w,r[3]=0,r[4]=(g-M)*T,r[5]=(1-(d+m))*T,r[6]=(h+x)*T,r[7]=0,r[8]=(S+y)*P,r[9]=(h-x)*P,r[10]=(1-(d+p))*P,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=Pr.set(r[0],r[1],r[2]).length();const a=Pr.set(r[4],r[5],r[6]).length(),o=Pr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Tn.copy(this);const c=1/s,u=1/a,f=1/o;return Tn.elements[0]*=c,Tn.elements[1]*=c,Tn.elements[2]*=c,Tn.elements[4]*=u,Tn.elements[5]*=u,Tn.elements[6]*=u,Tn.elements[8]*=f,Tn.elements[9]*=f,Tn.elements[10]*=f,n.setFromRotationMatrix(Tn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,n,i,r,s,a){const o=this.elements,l=2*s/(n-e),c=2*s/(i-r),u=(n+e)/(n-e),f=(i+r)/(i-r),d=-(a+s)/(a-s),g=-2*a*s/(a-s);return o[0]=l,o[4]=0,o[8]=u,o[12]=0,o[1]=0,o[5]=c,o[9]=f,o[13]=0,o[2]=0,o[6]=0,o[10]=d,o[14]=g,o[3]=0,o[7]=0,o[11]=-1,o[15]=0,this}makeOrthographic(e,n,i,r,s,a){const o=this.elements,l=1/(n-e),c=1/(i-r),u=1/(a-s),f=(n+e)*l,d=(i+r)*c,g=(a+s)*u;return o[0]=2*l,o[4]=0,o[8]=0,o[12]=-f,o[1]=0,o[5]=2*c,o[9]=0,o[13]=-d,o[2]=0,o[6]=0,o[10]=-2*u,o[14]=-g,o[3]=0,o[7]=0,o[11]=0,o[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const Pr=new z,Tn=new St,R1=new z(0,0,0),D1=new z(1,1,1),_i=new z,fo=new z,Jt=new z,xp=new St,_p=new Fa;class Oa{constructor(e=0,n=0,i=0,r=Oa.DefaultOrder){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],f=r[2],d=r[6],g=r[10];switch(n){case"XYZ":this._y=Math.asin(zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-zt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(zt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,g),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-zt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,g),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(zt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return xp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(xp,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return _p.setFromEuler(this),this.setFromQuaternion(_p,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}toVector3(){console.error("THREE.Euler: .toVector3() has been removed. Use Vector3.setFromEuler() instead")}}Oa.DefaultOrder="XYZ";Oa.RotationOrders=["XYZ","YZX","ZXY","XZY","YXZ","ZYX"];class z0{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let N1=0;const yp=new z,Rr=new Fa,Jn=new St,ho=new z,Ws=new z,k1=new z,I1=new Fa,Sp=new z(1,0,0),Mp=new z(0,1,0),wp=new z(0,0,1),F1={type:"added"},Ep={type:"removed"};class on extends As{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:N1++}),this.uuid=Ia(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=on.DefaultUp.clone();const e=new z,n=new Oa,i=new Fa,r=new z(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new St},normalMatrix:{value:new sn}}),this.matrix=new St,this.matrixWorld=new St,this.matrixAutoUpdate=on.DefaultMatrixAutoUpdate,this.matrixWorldNeedsUpdate=!1,this.matrixWorldAutoUpdate=on.DefaultMatrixWorldAutoUpdate,this.layers=new z0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Rr.setFromAxisAngle(e,n),this.quaternion.multiply(Rr),this}rotateOnWorldAxis(e,n){return Rr.setFromAxisAngle(e,n),this.quaternion.premultiply(Rr),this}rotateX(e){return this.rotateOnAxis(Sp,e)}rotateY(e){return this.rotateOnAxis(Mp,e)}rotateZ(e){return this.rotateOnAxis(wp,e)}translateOnAxis(e,n){return yp.copy(e).applyQuaternion(this.quaternion),this.position.add(yp.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Sp,e)}translateY(e){return this.translateOnAxis(Mp,e)}translateZ(e){return this.translateOnAxis(wp,e)}localToWorld(e){return e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return e.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?ho.copy(e):ho.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Ws.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(Ws,ho,this.up):Jn.lookAt(ho,Ws,this.up),this.quaternion.setFromRotationMatrix(Jn),r&&(Jn.extractRotation(r.matrixWorld),Rr.setFromRotationMatrix(Jn),this.quaternion.premultiply(Rr.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(F1)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(Ep)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){for(let e=0;e<this.children.length;e++){const n=this.children[e];n.parent=null,n.dispatchEvent(Ep)}return this.children.length=0,this}attach(e){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ws,e,k1),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ws,I1,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++){const s=n[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++){const o=r[s];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),JSON.stringify(this.userData)!=="{}"&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];s(e.shapes,f)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(n){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),f=a(e.shapes),d=a(e.skeletons),g=a(e.animations),S=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),d.length>0&&(i.skeletons=d),g.length>0&&(i.animations=g),S.length>0&&(i.nodes=S)}return i.object=r,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}on.DefaultUp=new z(0,1,0);on.DefaultMatrixAutoUpdate=!0;on.DefaultMatrixWorldAutoUpdate=!0;const Cn=new z,ei=new z,Uc=new z,ti=new z,Dr=new z,Nr=new z,bp=new z,Bc=new z,Vc=new z,Gc=new z;class ri{constructor(e=new z,n=new z,i=new z){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),Cn.subVectors(e,n),r.cross(Cn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){Cn.subVectors(r,n),ei.subVectors(i,n),Uc.subVectors(e,n);const a=Cn.dot(Cn),o=Cn.dot(ei),l=Cn.dot(Uc),c=ei.dot(ei),u=ei.dot(Uc),f=a*c-o*o;if(f===0)return s.set(-2,-1,-1);const d=1/f,g=(c*l-o*u)*d,S=(a*u-o*l)*d;return s.set(1-g-S,S,g)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,ti),ti.x>=0&&ti.y>=0&&ti.x+ti.y<=1}static getUV(e,n,i,r,s,a,o,l){return this.getBarycoord(e,n,i,r,ti),l.set(0,0),l.addScaledVector(s,ti.x),l.addScaledVector(a,ti.y),l.addScaledVector(o,ti.z),l}static isFrontFacing(e,n,i,r){return Cn.subVectors(i,n),ei.subVectors(e,n),Cn.cross(ei).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Cn.subVectors(this.c,this.b),ei.subVectors(this.a,this.b),Cn.cross(ei).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ri.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return ri.getBarycoord(e,this.a,this.b,this.c,n)}getUV(e,n,i,r,s){return ri.getUV(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return ri.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ri.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let a,o;Dr.subVectors(r,i),Nr.subVectors(s,i),Bc.subVectors(e,i);const l=Dr.dot(Bc),c=Nr.dot(Bc);if(l<=0&&c<=0)return n.copy(i);Vc.subVectors(e,r);const u=Dr.dot(Vc),f=Nr.dot(Vc);if(u>=0&&f<=u)return n.copy(r);const d=l*f-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),n.copy(i).addScaledVector(Dr,a);Gc.subVectors(e,s);const g=Dr.dot(Gc),S=Nr.dot(Gc);if(S>=0&&g<=S)return n.copy(s);const p=g*c-l*S;if(p<=0&&c>=0&&S<=0)return o=c/(c-S),n.copy(i).addScaledVector(Nr,o);const h=u*S-g*f;if(h<=0&&f-u>=0&&g-S>=0)return bp.subVectors(s,r),o=(f-u)/(f-u+(g-S)),n.copy(r).addScaledVector(bp,o);const m=1/(h+p+d);return a=p*m,o=d*m,n.copy(i).addScaledVector(Dr,a).addScaledVector(Nr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}let z1=0;class Ua extends As{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:z1++}),this.uuid=Ia(),this.name="",this.type="Material",this.blending=cs,this.side=ys,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.blendSrc=b0,this.blendDst=T0,this.blendEquation=Gr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=ad,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=b1,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=bc,this.stencilZFail=bc,this.stencilZPass=bc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn("THREE.Material: '"+n+"' parameter is undefined.");continue}const r=this[n];if(r===void 0){console.warn("THREE."+this.type+": '"+n+"' is not a property of this material.");continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==cs&&(i.blending=this.blending),this.side!==ys&&(i.side=this.side),this.vertexColors&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=this.transparent),i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.stencilWrite=this.stencilWrite,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(i.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=this.premultipliedAlpha),this.wireframe===!0&&(i.wireframe=this.wireframe),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=this.flatShading),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),JSON.stringify(this.userData)!=="{}"&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(n){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Ol extends Ua{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=C0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const it=new z,po=new ke;class $n{constructor(e,n,i){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i===!0,this.usage=hp,this.updateRange={offset:0,count:-1},this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)po.fromBufferAttribute(this,n),po.applyMatrix3(e),this.setXY(n,po.x,po.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)it.fromBufferAttribute(this,n),it.applyMatrix3(e),this.setXYZ(n,it.x,it.y,it.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)it.fromBufferAttribute(this,n),it.applyMatrix4(e),this.setXYZ(n,it.x,it.y,it.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)it.fromBufferAttribute(this,n),it.applyNormalMatrix(e),this.setXYZ(n,it.x,it.y,it.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)it.fromBufferAttribute(this,n),it.transformDirection(e),this.setXYZ(n,it.x,it.y,it.z);return this}set(e,n=0){return this.array.set(e,n),this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=ro(n,this.array)),n}setX(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=ro(n,this.array)),n}setY(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=ro(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=ro(n,this.array)),n}setW(e,n){return this.normalized&&(n=Qt(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Qt(n,this.array),i=Qt(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=Qt(n,this.array),i=Qt(i,this.array),r=Qt(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=Qt(n,this.array),i=Qt(i,this.array),r=Qt(r,this.array),s=Qt(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==hp&&(e.usage=this.usage),(this.updateRange.offset!==0||this.updateRange.count!==-1)&&(e.updateRange=this.updateRange),e}copyColorsArray(){console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.")}copyVector2sArray(){console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.")}copyVector3sArray(){console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.")}copyVector4sArray(){console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.")}}class O0 extends $n{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class U0 extends $n{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class At extends $n{constructor(e,n,i){super(new Float32Array(e),n,i)}}let O1=0;const hn=new St,Wc=new on,kr=new z,en=new za,Hs=new za,mt=new z;class Xn extends As{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:O1++}),this.uuid=Ia(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(D0(e)?U0:O0)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new sn().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return hn.makeRotationFromQuaternion(e),this.applyMatrix4(hn),this}rotateX(e){return hn.makeRotationX(e),this.applyMatrix4(hn),this}rotateY(e){return hn.makeRotationY(e),this.applyMatrix4(hn),this}rotateZ(e){return hn.makeRotationZ(e),this.applyMatrix4(hn),this}translate(e,n,i){return hn.makeTranslation(e,n,i),this.applyMatrix4(hn),this}scale(e,n,i){return hn.makeScale(e,n,i),this.applyMatrix4(hn),this}lookAt(e){return Wc.lookAt(e),Wc.updateMatrix(),this.applyMatrix4(Wc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(kr).negate(),this.translate(kr.x,kr.y,kr.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new At(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new za);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new z(-1/0,-1/0,-1/0),new z(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];en.setFromBufferAttribute(s),this.morphTargetsRelative?(mt.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(mt),mt.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(mt)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vf);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new z,1/0);return}if(e){const i=this.boundingSphere.center;if(en.setFromBufferAttribute(e),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];Hs.setFromBufferAttribute(o),this.morphTargetsRelative?(mt.addVectors(en.min,Hs.min),en.expandByPoint(mt),mt.addVectors(en.max,Hs.max),en.expandByPoint(mt)):(en.expandByPoint(Hs.min),en.expandByPoint(Hs.max))}en.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)mt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(mt));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)mt.fromBufferAttribute(o,c),l&&(kr.fromBufferAttribute(e,c),mt.add(kr)),r=Math.max(r,i.distanceToSquared(mt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.array,r=n.position.array,s=n.normal.array,a=n.uv.array,o=r.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new $n(new Float32Array(4*o),4));const l=this.getAttribute("tangent").array,c=[],u=[];for(let L=0;L<o;L++)c[L]=new z,u[L]=new z;const f=new z,d=new z,g=new z,S=new ke,p=new ke,h=new ke,m=new z,x=new z;function y(L,O,re){f.fromArray(r,L*3),d.fromArray(r,O*3),g.fromArray(r,re*3),S.fromArray(a,L*2),p.fromArray(a,O*2),h.fromArray(a,re*2),d.sub(f),g.sub(f),p.sub(S),h.sub(S);const V=1/(p.x*h.y-h.x*p.y);isFinite(V)&&(m.copy(d).multiplyScalar(h.y).addScaledVector(g,-p.y).multiplyScalar(V),x.copy(g).multiplyScalar(p.x).addScaledVector(d,-h.x).multiplyScalar(V),c[L].add(m),c[O].add(m),c[re].add(m),u[L].add(x),u[O].add(x),u[re].add(x))}let M=this.groups;M.length===0&&(M=[{start:0,count:i.length}]);for(let L=0,O=M.length;L<O;++L){const re=M[L],V=re.start,k=re.count;for(let q=V,K=V+k;q<K;q+=3)y(i[q+0],i[q+1],i[q+2])}const w=new z,T=new z,P=new z,_=new z;function C(L){P.fromArray(s,L*3),_.copy(P);const O=c[L];w.copy(O),w.sub(P.multiplyScalar(P.dot(O))).normalize(),T.crossVectors(_,O);const V=T.dot(u[L])<0?-1:1;l[L*4]=w.x,l[L*4+1]=w.y,l[L*4+2]=w.z,l[L*4+3]=V}for(let L=0,O=M.length;L<O;++L){const re=M[L],V=re.start,k=re.count;for(let q=V,K=V+k;q<K;q+=3)C(i[q+0]),C(i[q+1]),C(i[q+2])}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new $n(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let d=0,g=i.count;d<g;d++)i.setXYZ(d,0,0,0);const r=new z,s=new z,a=new z,o=new z,l=new z,c=new z,u=new z,f=new z;if(e)for(let d=0,g=e.count;d<g;d+=3){const S=e.getX(d+0),p=e.getX(d+1),h=e.getX(d+2);r.fromBufferAttribute(n,S),s.fromBufferAttribute(n,p),a.fromBufferAttribute(n,h),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),o.fromBufferAttribute(i,S),l.fromBufferAttribute(i,p),c.fromBufferAttribute(i,h),o.add(u),l.add(u),c.add(u),i.setXYZ(S,o.x,o.y,o.z),i.setXYZ(p,l.x,l.y,l.z),i.setXYZ(h,c.x,c.y,c.z)}else for(let d=0,g=n.count;d<g;d+=3)r.fromBufferAttribute(n,d+0),s.fromBufferAttribute(n,d+1),a.fromBufferAttribute(n,d+2),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),i.setXYZ(d+0,u.x,u.y,u.z),i.setXYZ(d+1,u.x,u.y,u.z),i.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}merge(){return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeBufferGeometries() instead."),this}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)mt.fromBufferAttribute(e,n),mt.normalize(),e.setXYZ(n,mt.x,mt.y,mt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,f=o.normalized,d=new c.constructor(l.length*u);let g=0,S=0;for(let p=0,h=l.length;p<h;p++){o.isInterleavedBufferAttribute?g=l[p]*o.data.stride+o.offset:g=l[p]*u;for(let m=0;m<u;m++)d[S++]=c[g++]}return new $n(d,u,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Xn,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,i);n.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,f=c.length;u<f;u++){const d=c[u],g=e(d,i);l.push(g)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){const e={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,d=c.length;f<d;f++){const g=c[f];u.push(g.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(n))}const s=e.morphAttributes;for(const c in s){const u=[],f=s[c];for(let d=0,g=f.length;d<g;d++)u.push(f[d].clone(n));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,e.parameters!==void 0&&(this.parameters=Object.assign({},e.parameters)),this}dispose(){this.dispatchEvent({type:"dispose"})}}const Tp=new St,Ir=new P1,Hc=new vf,yi=new z,Si=new z,Mi=new z,jc=new z,$c=new z,Xc=new z,mo=new z,go=new z,vo=new z,xo=new ke,_o=new ke,yo=new ke,qc=new z,So=new z;class Wn extends on{constructor(e=new Xn,n=new Ol){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;if(r===void 0||(i.boundingSphere===null&&i.computeBoundingSphere(),Hc.copy(i.boundingSphere),Hc.applyMatrix4(s),e.ray.intersectsSphere(Hc)===!1)||(Tp.copy(s).invert(),Ir.copy(e.ray).applyMatrix4(Tp),i.boundingBox!==null&&Ir.intersectsBox(i.boundingBox)===!1))return;let a;const o=i.index,l=i.attributes.position,c=i.morphAttributes.position,u=i.morphTargetsRelative,f=i.attributes.uv,d=i.attributes.uv2,g=i.groups,S=i.drawRange;if(o!==null)if(Array.isArray(r))for(let p=0,h=g.length;p<h;p++){const m=g[p],x=r[m.materialIndex],y=Math.max(m.start,S.start),M=Math.min(o.count,Math.min(m.start+m.count,S.start+S.count));for(let w=y,T=M;w<T;w+=3){const P=o.getX(w),_=o.getX(w+1),C=o.getX(w+2);a=Mo(this,x,e,Ir,l,c,u,f,d,P,_,C),a&&(a.faceIndex=Math.floor(w/3),a.face.materialIndex=m.materialIndex,n.push(a))}}else{const p=Math.max(0,S.start),h=Math.min(o.count,S.start+S.count);for(let m=p,x=h;m<x;m+=3){const y=o.getX(m),M=o.getX(m+1),w=o.getX(m+2);a=Mo(this,r,e,Ir,l,c,u,f,d,y,M,w),a&&(a.faceIndex=Math.floor(m/3),n.push(a))}}else if(l!==void 0)if(Array.isArray(r))for(let p=0,h=g.length;p<h;p++){const m=g[p],x=r[m.materialIndex],y=Math.max(m.start,S.start),M=Math.min(l.count,Math.min(m.start+m.count,S.start+S.count));for(let w=y,T=M;w<T;w+=3){const P=w,_=w+1,C=w+2;a=Mo(this,x,e,Ir,l,c,u,f,d,P,_,C),a&&(a.faceIndex=Math.floor(w/3),a.face.materialIndex=m.materialIndex,n.push(a))}}else{const p=Math.max(0,S.start),h=Math.min(l.count,S.start+S.count);for(let m=p,x=h;m<x;m+=3){const y=m,M=m+1,w=m+2;a=Mo(this,r,e,Ir,l,c,u,f,d,y,M,w),a&&(a.faceIndex=Math.floor(m/3),n.push(a))}}}}function U1(t,e,n,i,r,s,a,o){let l;if(e.side===yn?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side!==oi,o),l===null)return null;So.copy(o),So.applyMatrix4(t.matrixWorld);const c=n.ray.origin.distanceTo(So);return c<n.near||c>n.far?null:{distance:c,point:So.clone(),object:t}}function Mo(t,e,n,i,r,s,a,o,l,c,u,f){yi.fromBufferAttribute(r,c),Si.fromBufferAttribute(r,u),Mi.fromBufferAttribute(r,f);const d=t.morphTargetInfluences;if(s&&d){mo.set(0,0,0),go.set(0,0,0),vo.set(0,0,0);for(let S=0,p=s.length;S<p;S++){const h=d[S],m=s[S];h!==0&&(jc.fromBufferAttribute(m,c),$c.fromBufferAttribute(m,u),Xc.fromBufferAttribute(m,f),a?(mo.addScaledVector(jc,h),go.addScaledVector($c,h),vo.addScaledVector(Xc,h)):(mo.addScaledVector(jc.sub(yi),h),go.addScaledVector($c.sub(Si),h),vo.addScaledVector(Xc.sub(Mi),h)))}yi.add(mo),Si.add(go),Mi.add(vo)}t.isSkinnedMesh&&(t.boneTransform(c,yi),t.boneTransform(u,Si),t.boneTransform(f,Mi));const g=U1(t,e,n,i,yi,Si,Mi,qc);if(g){o&&(xo.fromBufferAttribute(o,c),_o.fromBufferAttribute(o,u),yo.fromBufferAttribute(o,f),g.uv=ri.getUV(qc,yi,Si,Mi,xo,_o,yo,new ke)),l&&(xo.fromBufferAttribute(l,c),_o.fromBufferAttribute(l,u),yo.fromBufferAttribute(l,f),g.uv2=ri.getUV(qc,yi,Si,Mi,xo,_o,yo,new ke));const S={a:c,b:u,c:f,normal:new z,materialIndex:0};ri.getNormal(yi,Si,Mi,S.normal),g.face=S}return g}class Ba extends Xn{constructor(e=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],f=[];let d=0,g=0;S("z","y","x",-1,-1,i,n,e,a,s,0),S("z","y","x",1,-1,i,n,-e,a,s,1),S("x","z","y",1,1,e,i,n,r,a,2),S("x","z","y",1,-1,e,i,-n,r,a,3),S("x","y","z",1,-1,e,n,i,r,s,4),S("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new At(c,3)),this.setAttribute("normal",new At(u,3)),this.setAttribute("uv",new At(f,2));function S(p,h,m,x,y,M,w,T,P,_,C){const L=M/P,O=w/_,re=M/2,V=w/2,k=T/2,q=P+1,K=_+1;let Z=0,D=0;const G=new z;for(let B=0;B<K;B++){const I=B*O-V;for(let U=0;U<q;U++){const Q=U*L-re;G[p]=Q*x,G[h]=I*y,G[m]=k,c.push(G.x,G.y,G.z),G[p]=0,G[h]=0,G[m]=T>0?1:-1,u.push(G.x,G.y,G.z),f.push(U/P),f.push(1-B/_),Z+=1}}for(let B=0;B<_;B++)for(let I=0;I<P;I++){const U=d+I+q*B,Q=d+I+q*(B+1),ee=d+(I+1)+q*(B+1),ae=d+(I+1)+q*B;l.push(U,Q,ae),l.push(Q,ee,ae),D+=6}o.addGroup(g,D,C),g+=D,d+=Z}}static fromJSON(e){return new Ba(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Es(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function It(t){const e={};for(let n=0;n<t.length;n++){const i=Es(t[n]);for(const r in i)e[r]=i[r]}return e}function B1(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function B0(t){return t.getRenderTarget()===null&&t.outputEncoding===je?Bn:La}const V1={clone:Es,merge:It};var G1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,W1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Mr extends Ua{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=G1,this.fragmentShader=W1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Es(e.uniforms),this.uniformsGroups=B1(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?n.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[r]={type:"m4",value:a.toArray()}:n.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class V0 extends on{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new St,this.projectionMatrix=new St,this.projectionMatrixInverse=new St}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(-n[8],-n[9],-n[10]).normalize()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class nn extends V0{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=mp*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Tc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return mp*2*Math.atan(Math.tan(Tc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,n,i,r,s,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(Tc*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,n-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const Fr=-90,zr=1;class H1 extends on{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i;const r=new nn(Fr,zr,e,n);r.layers=this.layers,r.up.set(0,1,0),r.lookAt(1,0,0),this.add(r);const s=new nn(Fr,zr,e,n);s.layers=this.layers,s.up.set(0,1,0),s.lookAt(-1,0,0),this.add(s);const a=new nn(Fr,zr,e,n);a.layers=this.layers,a.up.set(0,0,-1),a.lookAt(0,1,0),this.add(a);const o=new nn(Fr,zr,e,n);o.layers=this.layers,o.up.set(0,0,1),o.lookAt(0,-1,0),this.add(o);const l=new nn(Fr,zr,e,n);l.layers=this.layers,l.up.set(0,1,0),l.lookAt(0,0,1),this.add(l);const c=new nn(Fr,zr,e,n);c.layers=this.layers,c.up.set(0,1,0),c.lookAt(0,0,-1),this.add(c)}update(e,n){this.parent===null&&this.updateMatrixWorld();const i=this.renderTarget,[r,s,a,o,l,c]=this.children,u=e.getRenderTarget(),f=e.toneMapping,d=e.xr.enabled;e.toneMapping=ci,e.xr.enabled=!1;const g=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0),e.render(n,r),e.setRenderTarget(i,1),e.render(n,s),e.setRenderTarget(i,2),e.render(n,a),e.setRenderTarget(i,3),e.render(n,o),e.setRenderTarget(i,4),e.render(n,l),i.texture.generateMipmaps=g,e.setRenderTarget(i,5),e.render(n,c),e.setRenderTarget(u),e.toneMapping=f,e.xr.enabled=d,i.texture.needsPMREMUpdate=!0}}class G0 extends qt{constructor(e,n,i,r,s,a,o,l,c,u){e=e!==void 0?e:[],n=n!==void 0?n:Ss,super(e,n,i,r,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class j1 extends Sr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new G0(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.encoding),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:gn}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.encoding=n.encoding,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ba(5,5,5),s=new Mr({name:"CubemapFromEquirect",uniforms:Es(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:yn,blending:Oi});s.uniforms.tEquirect.value=n;const a=new Wn(r,s),o=n.minFilter;return n.minFilter===zl&&(n.minFilter=gn),new H1(1,10,this).update(e,a),n.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,r);e.setRenderTarget(s)}}const Yc=new z,$1=new z,X1=new sn;class er{constructor(e=new z(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=Yc.subVectors(i,n).cross($1.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(this.normal).multiplyScalar(-this.distanceToPoint(e)).add(e)}intersectLine(e,n){const i=e.delta(Yc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(i).multiplyScalar(s).add(e.start)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||X1.getNormalMatrix(e),r=this.coplanarPoint(Yc).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Or=new vf,wo=new z;class W0{constructor(e=new er,n=new er,i=new er,r=new er,s=new er,a=new er){this.planes=[e,n,i,r,s,a]}set(e,n,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(n),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e){const n=this.planes,i=e.elements,r=i[0],s=i[1],a=i[2],o=i[3],l=i[4],c=i[5],u=i[6],f=i[7],d=i[8],g=i[9],S=i[10],p=i[11],h=i[12],m=i[13],x=i[14],y=i[15];return n[0].setComponents(o-r,f-l,p-d,y-h).normalize(),n[1].setComponents(o+r,f+l,p+d,y+h).normalize(),n[2].setComponents(o+s,f+c,p+g,y+m).normalize(),n[3].setComponents(o-s,f-c,p-g,y-m).normalize(),n[4].setComponents(o-a,f-u,p-S,y-x).normalize(),n[5].setComponents(o+a,f+u,p+S,y+x).normalize(),this}intersectsObject(e){const n=e.geometry;return n.boundingSphere===null&&n.computeBoundingSphere(),Or.copy(n.boundingSphere).applyMatrix4(e.matrixWorld),this.intersectsSphere(Or)}intersectsSprite(e){return Or.center.set(0,0,0),Or.radius=.7071067811865476,Or.applyMatrix4(e.matrixWorld),this.intersectsSphere(Or)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(wo.x=r.normal.x>0?e.max.x:e.min.x,wo.y=r.normal.y>0?e.max.y:e.min.y,wo.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(wo)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function H0(){let t=null,e=!1,n=null,i=null;function r(s,a){n(s,a),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function q1(t,e){const n=e.isWebGL2,i=new WeakMap;function r(c,u){const f=c.array,d=c.usage,g=t.createBuffer();t.bindBuffer(u,g),t.bufferData(u,f,d),c.onUploadCallback();let S;if(f instanceof Float32Array)S=5126;else if(f instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(n)S=5131;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else S=5123;else if(f instanceof Int16Array)S=5122;else if(f instanceof Uint32Array)S=5125;else if(f instanceof Int32Array)S=5124;else if(f instanceof Int8Array)S=5120;else if(f instanceof Uint8Array)S=5121;else if(f instanceof Uint8ClampedArray)S=5121;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+f);return{buffer:g,type:S,bytesPerElement:f.BYTES_PER_ELEMENT,version:c.version}}function s(c,u,f){const d=u.array,g=u.updateRange;t.bindBuffer(f,c),g.count===-1?t.bufferSubData(f,0,d):(n?t.bufferSubData(f,g.offset*d.BYTES_PER_ELEMENT,d,g.offset,g.count):t.bufferSubData(f,g.offset*d.BYTES_PER_ELEMENT,d.subarray(g.offset,g.offset+g.count)),g.count=-1),u.onUploadCallback()}function a(c){return c.isInterleavedBufferAttribute&&(c=c.data),i.get(c)}function o(c){c.isInterleavedBufferAttribute&&(c=c.data);const u=i.get(c);u&&(t.deleteBuffer(u.buffer),i.delete(c))}function l(c,u){if(c.isGLBufferAttribute){const d=i.get(c);(!d||d.version<c.version)&&i.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const f=i.get(c);f===void 0?i.set(c,r(c,u)):f.version<c.version&&(s(f.buffer,c,u),f.version=c.version)}return{get:a,remove:o,update:l}}class Ul extends Xn{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,a=n/2,o=Math.floor(i),l=Math.floor(r),c=o+1,u=l+1,f=e/o,d=n/l,g=[],S=[],p=[],h=[];for(let m=0;m<u;m++){const x=m*d-a;for(let y=0;y<c;y++){const M=y*f-s;S.push(M,-x,0),p.push(0,0,1),h.push(y/o),h.push(1-m/l)}}for(let m=0;m<l;m++)for(let x=0;x<o;x++){const y=x+c*m,M=x+c*(m+1),w=x+1+c*(m+1),T=x+1+c*m;g.push(y,M,T),g.push(M,w,T)}this.setIndex(g),this.setAttribute("position",new At(S,3)),this.setAttribute("normal",new At(p,3)),this.setAttribute("uv",new At(h,2))}static fromJSON(e){return new Ul(e.width,e.height,e.widthSegments,e.heightSegments)}}var Y1=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,K1=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Z1=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Q1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,J1=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,eS=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,tS="vec3 transformed = vec3( position );",nS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,iS=`vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
#ifdef USE_IRIDESCENCE
	vec3 BRDF_GGX_Iridescence( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float iridescence, const in vec3 iridescenceFresnel, const in float roughness ) {
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = mix( F_Schlick( f0, f90, dotVH ), iridescenceFresnel, iridescence );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif`,rS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			 return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,sS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,aS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,oS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,uS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,dS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,fS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,hS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,pS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,mS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,gS=`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,vS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,xS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,_S=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,yS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,SS="gl_FragColor = linearToOutputTexel( gl_FragColor );",MS=`vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,wS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ES=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,bS=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,TS=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,CS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,AS=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,LS=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,PS=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,RS=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,DS=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,NS=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,kS=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,IS=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,FS=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,zS=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( PHYSICALLY_CORRECT_LIGHTS )
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#else
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,OS=`#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,US=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,BS=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,VS=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,GS=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,WS=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= texture2D( specularColorMap, vUv ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,HS=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	#ifdef USE_IRIDESCENCE
		reflectedLight.directSpecular += irradiance * BRDF_GGX_Iridescence( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness );
	#else
		reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,jS=`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,$S=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,XS=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,qS=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,YS=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,KS=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,ZS=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,QS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,JS=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,eM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,tM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,iM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rM=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,aM=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,oM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,lM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,cM=`#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,uM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,hM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,pM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,mM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,gM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,vM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,xM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,_M=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,yM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,SM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,MM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,wM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,EM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,bM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,TM=`#if NUM_SPOT_LIGHT_COORDS > 0
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
  uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );
		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
		bool frustumTest = all( frustumTestVec );
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,CM=`#if NUM_SPOT_LIGHT_COORDS > 0
  uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,AM=`#if defined( USE_SHADOWMAP ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#if NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SPOT_LIGHT_COORDS > 0 || NUM_POINT_LIGHT_SHADOWS > 0
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		vec4 shadowWorldPosition;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
		vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
	#endif
#endif`,LM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,PM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,RM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,DM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,NM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,kM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,IM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,FM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,zM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,OM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
#endif`,UM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		#ifdef texture2DLodEXT
			return texture2DLodEXT( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#else
			return texture2D( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#endif
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,BM=`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,VM=`#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,GM=`#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,WM=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,HM=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,jM=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,$M=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const XM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,qM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,YM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,KM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,ZM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,QM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,JM=`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,ew=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,tw=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,nw=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,iw=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,rw=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,sw=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,aw=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ow=`#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,lw=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cw=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,uw=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dw=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,fw=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hw=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,pw=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,mw=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gw=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vw=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,xw=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_w=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yw=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sw=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Mw=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ww=`#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ew=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,bw=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Tw=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,Te={alphamap_fragment:Y1,alphamap_pars_fragment:K1,alphatest_fragment:Z1,alphatest_pars_fragment:Q1,aomap_fragment:J1,aomap_pars_fragment:eS,begin_vertex:tS,beginnormal_vertex:nS,bsdfs:iS,iridescence_fragment:rS,bumpmap_pars_fragment:sS,clipping_planes_fragment:aS,clipping_planes_pars_fragment:oS,clipping_planes_pars_vertex:lS,clipping_planes_vertex:cS,color_fragment:uS,color_pars_fragment:dS,color_pars_vertex:fS,color_vertex:hS,common:pS,cube_uv_reflection_fragment:mS,defaultnormal_vertex:gS,displacementmap_pars_vertex:vS,displacementmap_vertex:xS,emissivemap_fragment:_S,emissivemap_pars_fragment:yS,encodings_fragment:SS,encodings_pars_fragment:MS,envmap_fragment:wS,envmap_common_pars_fragment:ES,envmap_pars_fragment:bS,envmap_pars_vertex:TS,envmap_physical_pars_fragment:OS,envmap_vertex:CS,fog_vertex:AS,fog_pars_vertex:LS,fog_fragment:PS,fog_pars_fragment:RS,gradientmap_pars_fragment:DS,lightmap_fragment:NS,lightmap_pars_fragment:kS,lights_lambert_fragment:IS,lights_lambert_pars_fragment:FS,lights_pars_begin:zS,lights_toon_fragment:US,lights_toon_pars_fragment:BS,lights_phong_fragment:VS,lights_phong_pars_fragment:GS,lights_physical_fragment:WS,lights_physical_pars_fragment:HS,lights_fragment_begin:jS,lights_fragment_maps:$S,lights_fragment_end:XS,logdepthbuf_fragment:qS,logdepthbuf_pars_fragment:YS,logdepthbuf_pars_vertex:KS,logdepthbuf_vertex:ZS,map_fragment:QS,map_pars_fragment:JS,map_particle_fragment:eM,map_particle_pars_fragment:tM,metalnessmap_fragment:nM,metalnessmap_pars_fragment:iM,morphcolor_vertex:rM,morphnormal_vertex:sM,morphtarget_pars_vertex:aM,morphtarget_vertex:oM,normal_fragment_begin:lM,normal_fragment_maps:cM,normal_pars_fragment:uM,normal_pars_vertex:dM,normal_vertex:fM,normalmap_pars_fragment:hM,clearcoat_normal_fragment_begin:pM,clearcoat_normal_fragment_maps:mM,clearcoat_pars_fragment:gM,iridescence_pars_fragment:vM,output_fragment:xM,packing:_M,premultiplied_alpha_fragment:yM,project_vertex:SM,dithering_fragment:MM,dithering_pars_fragment:wM,roughnessmap_fragment:EM,roughnessmap_pars_fragment:bM,shadowmap_pars_fragment:TM,shadowmap_pars_vertex:CM,shadowmap_vertex:AM,shadowmask_pars_fragment:LM,skinbase_vertex:PM,skinning_pars_vertex:RM,skinning_vertex:DM,skinnormal_vertex:NM,specularmap_fragment:kM,specularmap_pars_fragment:IM,tonemapping_fragment:FM,tonemapping_pars_fragment:zM,transmission_fragment:OM,transmission_pars_fragment:UM,uv_pars_fragment:BM,uv_pars_vertex:VM,uv_vertex:GM,uv2_pars_fragment:WM,uv2_pars_vertex:HM,uv2_vertex:jM,worldpos_vertex:$M,background_vert:XM,background_frag:qM,backgroundCube_vert:YM,backgroundCube_frag:KM,cube_vert:ZM,cube_frag:QM,depth_vert:JM,depth_frag:ew,distanceRGBA_vert:tw,distanceRGBA_frag:nw,equirect_vert:iw,equirect_frag:rw,linedashed_vert:sw,linedashed_frag:aw,meshbasic_vert:ow,meshbasic_frag:lw,meshlambert_vert:cw,meshlambert_frag:uw,meshmatcap_vert:dw,meshmatcap_frag:fw,meshnormal_vert:hw,meshnormal_frag:pw,meshphong_vert:mw,meshphong_frag:gw,meshphysical_vert:vw,meshphysical_frag:xw,meshtoon_vert:_w,meshtoon_frag:yw,points_vert:Sw,points_frag:Mw,shadow_vert:ww,shadow_frag:Ew,sprite_vert:bw,sprite_frag:Tw},se={common:{diffuse:{value:new Oe(16777215)},opacity:{value:1},map:{value:null},uvTransform:{value:new sn},uv2Transform:{value:new sn},alphaMap:{value:null},alphaTest:{value:0}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new sn}},sprite:{diffuse:{value:new Oe(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new sn}}},Vn={basic:{uniforms:It([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:Te.meshbasic_vert,fragmentShader:Te.meshbasic_frag},lambert:{uniforms:It([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Te.meshlambert_vert,fragmentShader:Te.meshlambert_frag},phong:{uniforms:It([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Oe(0)},specular:{value:new Oe(1118481)},shininess:{value:30}}]),vertexShader:Te.meshphong_vert,fragmentShader:Te.meshphong_frag},standard:{uniforms:It([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new Oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Te.meshphysical_vert,fragmentShader:Te.meshphysical_frag},toon:{uniforms:It([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Te.meshtoon_vert,fragmentShader:Te.meshtoon_frag},matcap:{uniforms:It([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:Te.meshmatcap_vert,fragmentShader:Te.meshmatcap_frag},points:{uniforms:It([se.points,se.fog]),vertexShader:Te.points_vert,fragmentShader:Te.points_frag},dashed:{uniforms:It([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Te.linedashed_vert,fragmentShader:Te.linedashed_frag},depth:{uniforms:It([se.common,se.displacementmap]),vertexShader:Te.depth_vert,fragmentShader:Te.depth_frag},normal:{uniforms:It([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:Te.meshnormal_vert,fragmentShader:Te.meshnormal_frag},sprite:{uniforms:It([se.sprite,se.fog]),vertexShader:Te.sprite_vert,fragmentShader:Te.sprite_frag},background:{uniforms:{uvTransform:{value:new sn},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Te.background_vert,fragmentShader:Te.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Te.backgroundCube_vert,fragmentShader:Te.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Te.cube_vert,fragmentShader:Te.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Te.equirect_vert,fragmentShader:Te.equirect_frag},distanceRGBA:{uniforms:It([se.common,se.displacementmap,{referencePosition:{value:new z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Te.distanceRGBA_vert,fragmentShader:Te.distanceRGBA_frag},shadow:{uniforms:It([se.lights,se.fog,{color:{value:new Oe(0)},opacity:{value:1}}]),vertexShader:Te.shadow_vert,fragmentShader:Te.shadow_frag}};Vn.physical={uniforms:It([Vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatNormalScale:{value:new ke(1,1)},clearcoatNormalMap:{value:null},iridescence:{value:0},iridescenceMap:{value:null},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},sheen:{value:0},sheenColor:{value:new Oe(0)},sheenColorMap:{value:null},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},transmission:{value:0},transmissionMap:{value:null},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:0},attenuationColor:{value:new Oe(0)},specularIntensity:{value:1},specularIntensityMap:{value:null},specularColor:{value:new Oe(1,1,1)},specularColorMap:{value:null}}]),vertexShader:Te.meshphysical_vert,fragmentShader:Te.meshphysical_frag};const Eo={r:0,b:0,g:0};function Cw(t,e,n,i,r,s,a){const o=new Oe(0);let l=s===!0?0:1,c,u,f=null,d=0,g=null;function S(h,m){let x=!1,y=m.isScene===!0?m.background:null;y&&y.isTexture&&(y=(m.backgroundBlurriness>0?n:e).get(y));const M=t.xr,w=M.getSession&&M.getSession();w&&w.environmentBlendMode==="additive"&&(y=null),y===null?p(o,l):y&&y.isColor&&(p(y,1),x=!0),(t.autoClear||x)&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),y&&(y.isCubeTexture||y.mapping===Fl)?(u===void 0&&(u=new Wn(new Ba(1,1,1),new Mr({name:"BackgroundCubeMaterial",uniforms:Es(Vn.backgroundCube.uniforms),vertexShader:Vn.backgroundCube.vertexShader,fragmentShader:Vn.backgroundCube.fragmentShader,side:yn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,P,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),u.material.uniforms.envMap.value=y,u.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,(f!==y||d!==y.version||g!==t.toneMapping)&&(u.material.needsUpdate=!0,f=y,d=y.version,g=t.toneMapping),u.layers.enableAll(),h.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Wn(new Ul(2,2),new Mr({name:"BackgroundMaterial",uniforms:Es(Vn.background.uniforms),vertexShader:Vn.background.vertexShader,fragmentShader:Vn.background.fragmentShader,side:ys,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(f!==y||d!==y.version||g!==t.toneMapping)&&(c.material.needsUpdate=!0,f=y,d=y.version,g=t.toneMapping),c.layers.enableAll(),h.unshift(c,c.geometry,c.material,0,0,null))}function p(h,m){h.getRGB(Eo,B0(t)),i.buffers.color.setClear(Eo.r,Eo.g,Eo.b,m,a)}return{getClearColor:function(){return o},setClearColor:function(h,m=1){o.set(h),l=m,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(h){l=h,p(o,l)},render:S}}function Aw(t,e,n,i){const r=t.getParameter(34921),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),a=i.isWebGL2||s!==null,o={},l=h(null);let c=l,u=!1;function f(k,q,K,Z,D){let G=!1;if(a){const B=p(Z,K,q);c!==B&&(c=B,g(c.object)),G=m(k,Z,K,D),G&&x(k,Z,K,D)}else{const B=q.wireframe===!0;(c.geometry!==Z.id||c.program!==K.id||c.wireframe!==B)&&(c.geometry=Z.id,c.program=K.id,c.wireframe=B,G=!0)}D!==null&&n.update(D,34963),(G||u)&&(u=!1,_(k,q,K,Z),D!==null&&t.bindBuffer(34963,n.get(D).buffer))}function d(){return i.isWebGL2?t.createVertexArray():s.createVertexArrayOES()}function g(k){return i.isWebGL2?t.bindVertexArray(k):s.bindVertexArrayOES(k)}function S(k){return i.isWebGL2?t.deleteVertexArray(k):s.deleteVertexArrayOES(k)}function p(k,q,K){const Z=K.wireframe===!0;let D=o[k.id];D===void 0&&(D={},o[k.id]=D);let G=D[q.id];G===void 0&&(G={},D[q.id]=G);let B=G[Z];return B===void 0&&(B=h(d()),G[Z]=B),B}function h(k){const q=[],K=[],Z=[];for(let D=0;D<r;D++)q[D]=0,K[D]=0,Z[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:q,enabledAttributes:K,attributeDivisors:Z,object:k,attributes:{},index:null}}function m(k,q,K,Z){const D=c.attributes,G=q.attributes;let B=0;const I=K.getAttributes();for(const U in I)if(I[U].location>=0){const ee=D[U];let ae=G[U];if(ae===void 0&&(U==="instanceMatrix"&&k.instanceMatrix&&(ae=k.instanceMatrix),U==="instanceColor"&&k.instanceColor&&(ae=k.instanceColor)),ee===void 0||ee.attribute!==ae||ae&&ee.data!==ae.data)return!0;B++}return c.attributesNum!==B||c.index!==Z}function x(k,q,K,Z){const D={},G=q.attributes;let B=0;const I=K.getAttributes();for(const U in I)if(I[U].location>=0){let ee=G[U];ee===void 0&&(U==="instanceMatrix"&&k.instanceMatrix&&(ee=k.instanceMatrix),U==="instanceColor"&&k.instanceColor&&(ee=k.instanceColor));const ae={};ae.attribute=ee,ee&&ee.data&&(ae.data=ee.data),D[U]=ae,B++}c.attributes=D,c.attributesNum=B,c.index=Z}function y(){const k=c.newAttributes;for(let q=0,K=k.length;q<K;q++)k[q]=0}function M(k){w(k,0)}function w(k,q){const K=c.newAttributes,Z=c.enabledAttributes,D=c.attributeDivisors;K[k]=1,Z[k]===0&&(t.enableVertexAttribArray(k),Z[k]=1),D[k]!==q&&((i.isWebGL2?t:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](k,q),D[k]=q)}function T(){const k=c.newAttributes,q=c.enabledAttributes;for(let K=0,Z=q.length;K<Z;K++)q[K]!==k[K]&&(t.disableVertexAttribArray(K),q[K]=0)}function P(k,q,K,Z,D,G){i.isWebGL2===!0&&(K===5124||K===5125)?t.vertexAttribIPointer(k,q,K,D,G):t.vertexAttribPointer(k,q,K,Z,D,G)}function _(k,q,K,Z){if(i.isWebGL2===!1&&(k.isInstancedMesh||Z.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;y();const D=Z.attributes,G=K.getAttributes(),B=q.defaultAttributeValues;for(const I in G){const U=G[I];if(U.location>=0){let Q=D[I];if(Q===void 0&&(I==="instanceMatrix"&&k.instanceMatrix&&(Q=k.instanceMatrix),I==="instanceColor"&&k.instanceColor&&(Q=k.instanceColor)),Q!==void 0){const ee=Q.normalized,ae=Q.itemSize,W=n.get(Q);if(W===void 0)continue;const be=W.buffer,fe=W.type,Me=W.bytesPerElement;if(Q.isInterleavedBufferAttribute){const de=Q.data,Ve=de.stride,Ce=Q.offset;if(de.isInstancedInterleavedBuffer){for(let Se=0;Se<U.locationSize;Se++)w(U.location+Se,de.meshPerAttribute);k.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let Se=0;Se<U.locationSize;Se++)M(U.location+Se);t.bindBuffer(34962,be);for(let Se=0;Se<U.locationSize;Se++)P(U.location+Se,ae/U.locationSize,fe,ee,Ve*Me,(Ce+ae/U.locationSize*Se)*Me)}else{if(Q.isInstancedBufferAttribute){for(let de=0;de<U.locationSize;de++)w(U.location+de,Q.meshPerAttribute);k.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let de=0;de<U.locationSize;de++)M(U.location+de);t.bindBuffer(34962,be);for(let de=0;de<U.locationSize;de++)P(U.location+de,ae/U.locationSize,fe,ee,ae*Me,ae/U.locationSize*de*Me)}}else if(B!==void 0){const ee=B[I];if(ee!==void 0)switch(ee.length){case 2:t.vertexAttrib2fv(U.location,ee);break;case 3:t.vertexAttrib3fv(U.location,ee);break;case 4:t.vertexAttrib4fv(U.location,ee);break;default:t.vertexAttrib1fv(U.location,ee)}}}}T()}function C(){re();for(const k in o){const q=o[k];for(const K in q){const Z=q[K];for(const D in Z)S(Z[D].object),delete Z[D];delete q[K]}delete o[k]}}function L(k){if(o[k.id]===void 0)return;const q=o[k.id];for(const K in q){const Z=q[K];for(const D in Z)S(Z[D].object),delete Z[D];delete q[K]}delete o[k.id]}function O(k){for(const q in o){const K=o[q];if(K[k.id]===void 0)continue;const Z=K[k.id];for(const D in Z)S(Z[D].object),delete Z[D];delete K[k.id]}}function re(){V(),u=!0,c!==l&&(c=l,g(c.object))}function V(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:f,reset:re,resetDefaultState:V,dispose:C,releaseStatesOfGeometry:L,releaseStatesOfProgram:O,initAttributes:y,enableAttribute:M,disableUnusedAttributes:T}}function Lw(t,e,n,i){const r=i.isWebGL2;let s;function a(c){s=c}function o(c,u){t.drawArrays(s,c,u),n.update(u,s,1)}function l(c,u,f){if(f===0)return;let d,g;if(r)d=t,g="drawArraysInstanced";else if(d=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[g](s,c,u,f),n.update(u,s,f)}this.setMode=a,this.render=o,this.renderInstances=l}function Pw(t,e,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const P=e.get("EXT_texture_filter_anisotropic");i=t.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(P){if(P==="highp"){if(t.getShaderPrecisionFormat(35633,36338).precision>0&&t.getShaderPrecisionFormat(35632,36338).precision>0)return"highp";P="mediump"}return P==="mediump"&&t.getShaderPrecisionFormat(35633,36337).precision>0&&t.getShaderPrecisionFormat(35632,36337).precision>0?"mediump":"lowp"}const a=typeof WebGL2RenderingContext<"u"&&t instanceof WebGL2RenderingContext||typeof WebGL2ComputeRenderingContext<"u"&&t instanceof WebGL2ComputeRenderingContext;let o=n.precision!==void 0?n.precision:"highp";const l=s(o);l!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",l,"instead."),o=l);const c=a||e.has("WEBGL_draw_buffers"),u=n.logarithmicDepthBuffer===!0,f=t.getParameter(34930),d=t.getParameter(35660),g=t.getParameter(3379),S=t.getParameter(34076),p=t.getParameter(34921),h=t.getParameter(36347),m=t.getParameter(36348),x=t.getParameter(36349),y=d>0,M=a||e.has("OES_texture_float"),w=y&&M,T=a?t.getParameter(36183):0;return{isWebGL2:a,drawBuffers:c,getMaxAnisotropy:r,getMaxPrecision:s,precision:o,logarithmicDepthBuffer:u,maxTextures:f,maxVertexTextures:d,maxTextureSize:g,maxCubemapSize:S,maxAttributes:p,maxVertexUniforms:h,maxVaryings:m,maxFragmentUniforms:x,vertexTextures:y,floatFragmentTextures:M,floatVertexTextures:w,maxSamples:T}}function Rw(t){const e=this;let n=null,i=0,r=!1,s=!1;const a=new er,o=new sn,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d,g){const S=f.length!==0||d||i!==0||r;return r=d,n=u(f,g,0),i=f.length,S},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1,c()},this.setState=function(f,d,g){const S=f.clippingPlanes,p=f.clipIntersection,h=f.clipShadows,m=t.get(f);if(!r||S===null||S.length===0||s&&!h)s?u(null):c();else{const x=s?0:i,y=x*4;let M=m.clippingState||null;l.value=M,M=u(S,d,y,g);for(let w=0;w!==y;++w)M[w]=n[w];m.clippingState=M,this.numIntersection=p?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(f,d,g,S){const p=f!==null?f.length:0;let h=null;if(p!==0){if(h=l.value,S!==!0||h===null){const m=g+p*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(h===null||h.length<m)&&(h=new Float32Array(m));for(let y=0,M=g;y!==p;++y,M+=4)a.copy(f[y]).applyMatrix4(x,o),a.normal.toArray(h,M),h[M+3]=a.constant}l.value=h,l.needsUpdate=!0}return e.numPlanes=p,e.numIntersection=0,h}}function Dw(t){let e=new WeakMap;function n(a,o){return o===od?a.mapping=Ss:o===ld&&(a.mapping=Ms),a}function i(a){if(a&&a.isTexture&&a.isRenderTargetTexture===!1){const o=a.mapping;if(o===od||o===ld)if(e.has(a)){const l=e.get(a).texture;return n(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new j1(l.height/2);return c.fromEquirectangularTexture(t,a),e.set(a,c),a.addEventListener("dispose",r),n(c.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class Nw extends V0{constructor(e=-1,n=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const ts=4,Cp=[.125,.215,.35,.446,.526,.582],nr=20,Kc=new Nw,Ap=new Oe;let Zc=null;const tr=(1+Math.sqrt(5))/2,Ur=1/tr,Lp=[new z(1,1,1),new z(-1,1,1),new z(1,1,-1),new z(-1,1,-1),new z(0,tr,Ur),new z(0,tr,-Ur),new z(Ur,0,tr),new z(-Ur,0,tr),new z(tr,Ur,0),new z(-tr,Ur,0)];class hd{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){Zc=this._renderer.getRenderTarget(),this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Dp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Zc),e.scissorTest=!1,bo(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Ss||e.mapping===Ms?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zc=this._renderer.getRenderTarget();const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:gn,minFilter:gn,generateMipmaps:!1,type:Aa,format:kn,encoding:yr,depthBuffer:!1},r=Pp(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Pp(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=kw(s)),this._blurMaterial=Iw(s,e,n)}return r}_compileMaterial(e){const n=new Wn(this._lodPlanes[0],e);this._renderer.compile(n,Kc)}_sceneToCubeUV(e,n,i,r){const o=new nn(90,1,n,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(Ap),u.toneMapping=ci,u.autoClear=!1;const g=new Ol({name:"PMREM.Background",side:yn,depthWrite:!1,depthTest:!1}),S=new Wn(new Ba,g);let p=!1;const h=e.background;h?h.isColor&&(g.color.copy(h),e.background=null,p=!0):(g.color.copy(Ap),p=!0);for(let m=0;m<6;m++){const x=m%3;x===0?(o.up.set(0,l[m],0),o.lookAt(c[m],0,0)):x===1?(o.up.set(0,0,l[m]),o.lookAt(0,c[m],0)):(o.up.set(0,l[m],0),o.lookAt(0,0,c[m]));const y=this._cubeSize;bo(r,x*y,m>2?y:0,y,y),u.setRenderTarget(r),p&&u.render(S,o),u.render(e,o)}S.geometry.dispose(),S.material.dispose(),u.toneMapping=d,u.autoClear=f,e.background=h}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===Ss||e.mapping===Ms;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Dp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rp());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new Wn(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;bo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(a,Kc)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;for(let r=1;r<this._lodPlanes.length;r++){const s=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Lp[(r-1)%Lp.length];this._blur(e,r-1,r,s,a)}n.autoClear=i}_blur(e,n,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,f=new Wn(this._lodPlanes[r],c),d=c.uniforms,g=this._sizeLods[i]-1,S=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*nr-1),p=s/S,h=isFinite(s)?1+Math.floor(u*p):nr;h>nr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${h} samples when the maximum is set to ${nr}`);const m=[];let x=0;for(let P=0;P<nr;++P){const _=P/p,C=Math.exp(-_*_/2);m.push(C),P===0?x+=C:P<h&&(x+=2*C)}for(let P=0;P<m.length;P++)m[P]=m[P]/x;d.envMap.value=e.texture,d.samples.value=h,d.weights.value=m,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:y}=this;d.dTheta.value=S,d.mipInt.value=y-i;const M=this._sizeLods[r],w=3*M*(r>y-ts?r-y+ts:0),T=4*(this._cubeSize-M);bo(n,w,T,3*M,2*M),l.setRenderTarget(n),l.render(f,Kc)}}function kw(t){const e=[],n=[],i=[];let r=t;const s=t-ts+1+Cp.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);n.push(o);let l=1/o;a>t-ts?l=Cp[a-t+ts-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),u=-c,f=1+c,d=[u,u,f,u,f,f,u,u,f,f,u,f],g=6,S=6,p=3,h=2,m=1,x=new Float32Array(p*S*g),y=new Float32Array(h*S*g),M=new Float32Array(m*S*g);for(let T=0;T<g;T++){const P=T%3*2/3-1,_=T>2?0:-1,C=[P,_,0,P+2/3,_,0,P+2/3,_+1,0,P,_,0,P+2/3,_+1,0,P,_+1,0];x.set(C,p*S*T),y.set(d,h*S*T);const L=[T,T,T,T,T,T];M.set(L,m*S*T)}const w=new Xn;w.setAttribute("position",new $n(x,p)),w.setAttribute("uv",new $n(y,h)),w.setAttribute("faceIndex",new $n(M,m)),e.push(w),r>ts&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function Pp(t,e,n){const i=new Sr(t,e,n);return i.texture.mapping=Fl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function bo(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function Iw(t,e,n){const i=new Float32Array(nr),r=new z(0,1,0);return new Mr({name:"SphericalGaussianBlur",defines:{n:nr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:xf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function Rp(){return new Mr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:xf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function Dp(){return new Mr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:xf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function xf(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Fw(t){let e=new WeakMap,n=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===od||l===ld,u=l===Ss||l===Ms;if(c||u)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let f=e.get(o);return n===null&&(n=new hd(t)),f=c?n.fromEquirectangular(o,f):n.fromCubemap(o,f),e.set(o,f),f.texture}else{if(e.has(o))return e.get(o).texture;{const f=o.image;if(c&&f&&f.height>0||u&&f&&r(f)){n===null&&(n=new hd(t));const d=c?n.fromEquirectangular(o):n.fromCubemap(o);return e.set(o,d),o.addEventListener("dispose",s),d.texture}else return null}}}return o}function r(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:a}}function zw(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(i){i.isWebGL2?n("EXT_color_buffer_float"):(n("WEBGL_depth_texture"),n("OES_texture_float"),n("OES_texture_half_float"),n("OES_texture_half_float_linear"),n("OES_standard_derivatives"),n("OES_element_index_uint"),n("OES_vertex_array_object"),n("ANGLE_instanced_arrays")),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture")},get:function(i){const r=n(i);return r===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Ow(t,e,n,i){const r={},s=new WeakMap;function a(f){const d=f.target;d.index!==null&&e.remove(d.index);for(const S in d.attributes)e.remove(d.attributes[S]);d.removeEventListener("dispose",a),delete r[d.id];const g=s.get(d);g&&(e.remove(g),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,n.memory.geometries--}function o(f,d){return r[d.id]===!0||(d.addEventListener("dispose",a),r[d.id]=!0,n.memory.geometries++),d}function l(f){const d=f.attributes;for(const S in d)e.update(d[S],34962);const g=f.morphAttributes;for(const S in g){const p=g[S];for(let h=0,m=p.length;h<m;h++)e.update(p[h],34962)}}function c(f){const d=[],g=f.index,S=f.attributes.position;let p=0;if(g!==null){const x=g.array;p=g.version;for(let y=0,M=x.length;y<M;y+=3){const w=x[y+0],T=x[y+1],P=x[y+2];d.push(w,T,T,P,P,w)}}else{const x=S.array;p=S.version;for(let y=0,M=x.length/3-1;y<M;y+=3){const w=y+0,T=y+1,P=y+2;d.push(w,T,T,P,P,w)}}const h=new(D0(d)?U0:O0)(d,1);h.version=p;const m=s.get(f);m&&e.remove(m),s.set(f,h)}function u(f){const d=s.get(f);if(d){const g=f.index;g!==null&&d.version<g.version&&c(f)}else c(f);return s.get(f)}return{get:o,update:l,getWireframeAttribute:u}}function Uw(t,e,n,i){const r=i.isWebGL2;let s;function a(d){s=d}let o,l;function c(d){o=d.type,l=d.bytesPerElement}function u(d,g){t.drawElements(s,g,o,d*l),n.update(g,s,1)}function f(d,g,S){if(S===0)return;let p,h;if(r)p=t,h="drawElementsInstanced";else if(p=e.get("ANGLE_instanced_arrays"),h="drawElementsInstancedANGLE",p===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[h](s,g,o,d*l,S),n.update(g,s,S)}this.setMode=a,this.setIndex=c,this.render=u,this.renderInstances=f}function Bw(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case 4:n.triangles+=o*(s/3);break;case 1:n.lines+=o*(s/2);break;case 3:n.lines+=o*(s-1);break;case 2:n.lines+=o*s;break;case 0:n.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){n.frame++,n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function Vw(t,e){return t[0]-e[0]}function Gw(t,e){return Math.abs(e[1])-Math.abs(t[1])}function Ww(t,e,n){const i={},r=new Float32Array(8),s=new WeakMap,a=new _t,o=[];for(let c=0;c<8;c++)o[c]=[c,0];function l(c,u,f,d){const g=c.morphTargetInfluences;if(e.isWebGL2===!0){const p=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,h=p!==void 0?p.length:0;let m=s.get(u);if(m===void 0||m.count!==h){let K=function(){k.dispose(),s.delete(u),u.removeEventListener("dispose",K)};var S=K;m!==void 0&&m.texture.dispose();const M=u.morphAttributes.position!==void 0,w=u.morphAttributes.normal!==void 0,T=u.morphAttributes.color!==void 0,P=u.morphAttributes.position||[],_=u.morphAttributes.normal||[],C=u.morphAttributes.color||[];let L=0;M===!0&&(L=1),w===!0&&(L=2),T===!0&&(L=3);let O=u.attributes.position.count*L,re=1;O>e.maxTextureSize&&(re=Math.ceil(O/e.maxTextureSize),O=e.maxTextureSize);const V=new Float32Array(O*re*4*h),k=new F0(V,O,re,h);k.type=lr,k.needsUpdate=!0;const q=L*4;for(let Z=0;Z<h;Z++){const D=P[Z],G=_[Z],B=C[Z],I=O*re*4*Z;for(let U=0;U<D.count;U++){const Q=U*q;M===!0&&(a.fromBufferAttribute(D,U),V[I+Q+0]=a.x,V[I+Q+1]=a.y,V[I+Q+2]=a.z,V[I+Q+3]=0),w===!0&&(a.fromBufferAttribute(G,U),V[I+Q+4]=a.x,V[I+Q+5]=a.y,V[I+Q+6]=a.z,V[I+Q+7]=0),T===!0&&(a.fromBufferAttribute(B,U),V[I+Q+8]=a.x,V[I+Q+9]=a.y,V[I+Q+10]=a.z,V[I+Q+11]=B.itemSize===4?a.w:1)}}m={count:h,texture:k,size:new ke(O,re)},s.set(u,m),u.addEventListener("dispose",K)}let x=0;for(let M=0;M<g.length;M++)x+=g[M];const y=u.morphTargetsRelative?1:1-x;d.getUniforms().setValue(t,"morphTargetBaseInfluence",y),d.getUniforms().setValue(t,"morphTargetInfluences",g),d.getUniforms().setValue(t,"morphTargetsTexture",m.texture,n),d.getUniforms().setValue(t,"morphTargetsTextureSize",m.size)}else{const p=g===void 0?0:g.length;let h=i[u.id];if(h===void 0||h.length!==p){h=[];for(let w=0;w<p;w++)h[w]=[w,0];i[u.id]=h}for(let w=0;w<p;w++){const T=h[w];T[0]=w,T[1]=g[w]}h.sort(Gw);for(let w=0;w<8;w++)w<p&&h[w][1]?(o[w][0]=h[w][0],o[w][1]=h[w][1]):(o[w][0]=Number.MAX_SAFE_INTEGER,o[w][1]=0);o.sort(Vw);const m=u.morphAttributes.position,x=u.morphAttributes.normal;let y=0;for(let w=0;w<8;w++){const T=o[w],P=T[0],_=T[1];P!==Number.MAX_SAFE_INTEGER&&_?(m&&u.getAttribute("morphTarget"+w)!==m[P]&&u.setAttribute("morphTarget"+w,m[P]),x&&u.getAttribute("morphNormal"+w)!==x[P]&&u.setAttribute("morphNormal"+w,x[P]),r[w]=_,y+=_):(m&&u.hasAttribute("morphTarget"+w)===!0&&u.deleteAttribute("morphTarget"+w),x&&u.hasAttribute("morphNormal"+w)===!0&&u.deleteAttribute("morphNormal"+w),r[w]=0)}const M=u.morphTargetsRelative?1:1-y;d.getUniforms().setValue(t,"morphTargetBaseInfluence",M),d.getUniforms().setValue(t,"morphTargetInfluences",r)}}return{update:l}}function Hw(t,e,n,i){let r=new WeakMap;function s(l){const c=i.render.frame,u=l.geometry,f=e.get(l,u);return r.get(f)!==c&&(e.update(f),r.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),n.update(l.instanceMatrix,34962),l.instanceColor!==null&&n.update(l.instanceColor,34962)),f}function a(){r=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:a}}const j0=new qt,$0=new F0,X0=new A1,q0=new G0,Np=[],kp=[],Ip=new Float32Array(16),Fp=new Float32Array(9),zp=new Float32Array(4);function Ls(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=Np[r];if(s===void 0&&(s=new Float32Array(r),Np[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(s,o)}return s}function ut(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function dt(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Bl(t,e){let n=kp[e];n===void 0&&(n=new Int32Array(e),kp[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function jw(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function $w(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(ut(n,e))return;t.uniform2fv(this.addr,e),dt(n,e)}}function Xw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(ut(n,e))return;t.uniform3fv(this.addr,e),dt(n,e)}}function qw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(ut(n,e))return;t.uniform4fv(this.addr,e),dt(n,e)}}function Yw(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(ut(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),dt(n,e)}else{if(ut(n,i))return;zp.set(i),t.uniformMatrix2fv(this.addr,!1,zp),dt(n,i)}}function Kw(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(ut(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),dt(n,e)}else{if(ut(n,i))return;Fp.set(i),t.uniformMatrix3fv(this.addr,!1,Fp),dt(n,i)}}function Zw(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(ut(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),dt(n,e)}else{if(ut(n,i))return;Ip.set(i),t.uniformMatrix4fv(this.addr,!1,Ip),dt(n,i)}}function Qw(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function Jw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(ut(n,e))return;t.uniform2iv(this.addr,e),dt(n,e)}}function e2(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(ut(n,e))return;t.uniform3iv(this.addr,e),dt(n,e)}}function t2(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(ut(n,e))return;t.uniform4iv(this.addr,e),dt(n,e)}}function n2(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function i2(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(ut(n,e))return;t.uniform2uiv(this.addr,e),dt(n,e)}}function r2(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(ut(n,e))return;t.uniform3uiv(this.addr,e),dt(n,e)}}function s2(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(ut(n,e))return;t.uniform4uiv(this.addr,e),dt(n,e)}}function a2(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2D(e||j0,r)}function o2(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||X0,r)}function l2(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||q0,r)}function c2(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||$0,r)}function u2(t){switch(t){case 5126:return jw;case 35664:return $w;case 35665:return Xw;case 35666:return qw;case 35674:return Yw;case 35675:return Kw;case 35676:return Zw;case 5124:case 35670:return Qw;case 35667:case 35671:return Jw;case 35668:case 35672:return e2;case 35669:case 35673:return t2;case 5125:return n2;case 36294:return i2;case 36295:return r2;case 36296:return s2;case 35678:case 36198:case 36298:case 36306:case 35682:return a2;case 35679:case 36299:case 36307:return o2;case 35680:case 36300:case 36308:case 36293:return l2;case 36289:case 36303:case 36311:case 36292:return c2}}function d2(t,e){t.uniform1fv(this.addr,e)}function f2(t,e){const n=Ls(e,this.size,2);t.uniform2fv(this.addr,n)}function h2(t,e){const n=Ls(e,this.size,3);t.uniform3fv(this.addr,n)}function p2(t,e){const n=Ls(e,this.size,4);t.uniform4fv(this.addr,n)}function m2(t,e){const n=Ls(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function g2(t,e){const n=Ls(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function v2(t,e){const n=Ls(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function x2(t,e){t.uniform1iv(this.addr,e)}function _2(t,e){t.uniform2iv(this.addr,e)}function y2(t,e){t.uniform3iv(this.addr,e)}function S2(t,e){t.uniform4iv(this.addr,e)}function M2(t,e){t.uniform1uiv(this.addr,e)}function w2(t,e){t.uniform2uiv(this.addr,e)}function E2(t,e){t.uniform3uiv(this.addr,e)}function b2(t,e){t.uniform4uiv(this.addr,e)}function T2(t,e,n){const i=this.cache,r=e.length,s=Bl(n,r);ut(i,s)||(t.uniform1iv(this.addr,s),dt(i,s));for(let a=0;a!==r;++a)n.setTexture2D(e[a]||j0,s[a])}function C2(t,e,n){const i=this.cache,r=e.length,s=Bl(n,r);ut(i,s)||(t.uniform1iv(this.addr,s),dt(i,s));for(let a=0;a!==r;++a)n.setTexture3D(e[a]||X0,s[a])}function A2(t,e,n){const i=this.cache,r=e.length,s=Bl(n,r);ut(i,s)||(t.uniform1iv(this.addr,s),dt(i,s));for(let a=0;a!==r;++a)n.setTextureCube(e[a]||q0,s[a])}function L2(t,e,n){const i=this.cache,r=e.length,s=Bl(n,r);ut(i,s)||(t.uniform1iv(this.addr,s),dt(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(e[a]||$0,s[a])}function P2(t){switch(t){case 5126:return d2;case 35664:return f2;case 35665:return h2;case 35666:return p2;case 35674:return m2;case 35675:return g2;case 35676:return v2;case 5124:case 35670:return x2;case 35667:case 35671:return _2;case 35668:case 35672:return y2;case 35669:case 35673:return S2;case 5125:return M2;case 36294:return w2;case 36295:return E2;case 36296:return b2;case 35678:case 36198:case 36298:case 36306:case 35682:return T2;case 35679:case 36299:case 36307:return C2;case 35680:case 36300:case 36308:case 36293:return A2;case 36289:case 36303:case 36311:case 36292:return L2}}class R2{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.setValue=u2(n.type)}}class D2{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.size=n.size,this.setValue=P2(n.type)}}class N2{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,n[o.id],i)}}}const Qc=/(\w+)(\])?(\[|\.)?/g;function Op(t,e){t.seq.push(e),t.map[e.id]=e}function k2(t,e,n){const i=t.name,r=i.length;for(Qc.lastIndex=0;;){const s=Qc.exec(i),a=Qc.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){Op(n,c===void 0?new R2(o,t,e):new D2(o,t,e));break}else{let f=n.map[o];f===void 0&&(f=new N2(o),Op(n,f)),n=f}}}class Ho{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,35718);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),a=e.getUniformLocation(n,s.name);k2(s,a,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,a=n.length;s!==a;++s){const o=n[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in n&&i.push(a)}return i}}function Up(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}let I2=0;function F2(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}function z2(t){switch(t){case yr:return["Linear","( value )"];case je:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported encoding:",t),["Linear","( value )"]}}function Bp(t,e,n){const i=t.getShaderParameter(e,35713),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+F2(t.getShaderSource(e),a)}else return r}function O2(t,e){const n=z2(e);return"vec4 "+t+"( vec4 value ) { return LinearTo"+n[0]+n[1]+"; }"}function U2(t,e){let n;switch(e){case n1:n="Linear";break;case i1:n="Reinhard";break;case r1:n="OptimizedCineon";break;case A0:n="ACESFilmic";break;case s1:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}function B2(t){return[t.extensionDerivatives||t.envMapCubeUVHeight||t.bumpMap||t.tangentSpaceNormalMap||t.clearcoatNormalMap||t.flatShading||t.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(t.extensionFragDepth||t.logarithmicDepthBuffer)&&t.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",t.extensionDrawBuffers&&t.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(t.extensionShaderTextureLOD||t.envMap||t.transmission)&&t.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Zs).join(`
`)}function V2(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function G2(t,e){const n={},i=t.getProgramParameter(e,35721);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),a=s.name;let o=1;s.type===35674&&(o=2),s.type===35675&&(o=3),s.type===35676&&(o=4),n[a]={type:s.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function Zs(t){return t!==""}function Vp(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Gp(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const W2=/^[ \t]*#include +<([\w\d./]+)>/gm;function pd(t){return t.replace(W2,H2)}function H2(t,e){const n=Te[e];if(n===void 0)throw new Error("Can not resolve #include <"+e+">");return pd(n)}const j2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Wp(t){return t.replace(j2,$2)}function $2(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Hp(t){let e="precision "+t.precision+` float;
precision `+t.precision+" int;";return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function X2(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===E0?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===ky?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===Ks&&(e="SHADOWMAP_TYPE_VSM"),e}function q2(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Ss:case Ms:e="ENVMAP_TYPE_CUBE";break;case Fl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Y2(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case Ms:e="ENVMAP_MODE_REFRACTION";break}return e}function K2(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case C0:e="ENVMAP_BLENDING_MULTIPLY";break;case e1:e="ENVMAP_BLENDING_MIX";break;case t1:e="ENVMAP_BLENDING_ADD";break}return e}function Z2(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function Q2(t,e,n,i){const r=t.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const l=X2(n),c=q2(n),u=Y2(n),f=K2(n),d=Z2(n),g=n.isWebGL2?"":B2(n),S=V2(s),p=r.createProgram();let h,m,x=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(h=[S].filter(Zs).join(`
`),h.length>0&&(h+=`
`),m=[g,S].filter(Zs).join(`
`),m.length>0&&(m+=`
`)):(h=[Hp(n),"#define SHADER_NAME "+n.shaderName,S,n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.supportsVertexTextures?"#define VERTEX_TEXTURES":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMap&&n.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",n.normalMap&&n.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.displacementMap&&n.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",n.specularColorMap?"#define USE_SPECULARCOLORMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEENCOLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",n.vertexTangents?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUvs?"#define USE_UV":"",n.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors&&n.isWebGL2?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0&&n.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",n.morphTargetsCount>0&&n.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0&&n.isWebGL2?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.logarithmicDepthBuffer&&n.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Zs).join(`
`),m=[g,Hp(n),"#define SHADER_NAME "+n.shaderName,S,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+u:"",n.envMap?"#define "+f:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMap&&n.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",n.normalMap&&n.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",n.specularColorMap?"#define USE_SPECULARCOLORMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEENCOLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.vertexTangents?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUvs?"#define USE_UV":"",n.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.physicallyCorrectLights?"#define PHYSICALLY_CORRECT_LIGHTS":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.logarithmicDepthBuffer&&n.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==ci?"#define TONE_MAPPING":"",n.toneMapping!==ci?Te.tonemapping_pars_fragment:"",n.toneMapping!==ci?U2("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Te.encodings_pars_fragment,O2("linearToOutputTexel",n.outputEncoding),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Zs).join(`
`)),a=pd(a),a=Vp(a,n),a=Gp(a,n),o=pd(o),o=Vp(o,n),o=Gp(o,n),a=Wp(a),o=Wp(o),n.isWebGL2&&n.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,h=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+h,m=["#define varying in",n.glslVersion===pp?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===pp?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const y=x+h+a,M=x+m+o,w=Up(r,35633,y),T=Up(r,35632,M);if(r.attachShader(p,w),r.attachShader(p,T),n.index0AttributeName!==void 0?r.bindAttribLocation(p,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(p,0,"position"),r.linkProgram(p),t.debug.checkShaderErrors){const C=r.getProgramInfoLog(p).trim(),L=r.getShaderInfoLog(w).trim(),O=r.getShaderInfoLog(T).trim();let re=!0,V=!0;if(r.getProgramParameter(p,35714)===!1){re=!1;const k=Bp(r,w,"vertex"),q=Bp(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(p,35715)+`

Program Info Log: `+C+`
`+k+`
`+q)}else C!==""?console.warn("THREE.WebGLProgram: Program Info Log:",C):(L===""||O==="")&&(V=!1);V&&(this.diagnostics={runnable:re,programLog:C,vertexShader:{log:L,prefix:h},fragmentShader:{log:O,prefix:m}})}r.deleteShader(w),r.deleteShader(T);let P;this.getUniforms=function(){return P===void 0&&(P=new Ho(r,p)),P};let _;return this.getAttributes=function(){return _===void 0&&(_=G2(r,p)),_},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(p),this.program=void 0},this.name=n.shaderName,this.id=I2++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=w,this.fragmentShader=T,this}let J2=0;class e3{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new t3(e),n.set(e,i)),i}}class t3{constructor(e){this.id=J2++,this.code=e,this.usedTimes=0}}function n3(t,e,n,i,r,s,a){const o=new z0,l=new e3,c=[],u=r.isWebGL2,f=r.logarithmicDepthBuffer,d=r.vertexTextures;let g=r.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_,C,L,O,re){const V=O.fog,k=re.geometry,q=_.isMeshStandardMaterial?O.environment:null,K=(_.isMeshStandardMaterial?n:e).get(_.envMap||q),Z=K&&K.mapping===Fl?K.image.height:null,D=S[_.type];_.precision!==null&&(g=r.getMaxPrecision(_.precision),g!==_.precision&&console.warn("THREE.WebGLProgram.getParameters:",_.precision,"not supported, using",g,"instead."));const G=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,B=G!==void 0?G.length:0;let I=0;k.morphAttributes.position!==void 0&&(I=1),k.morphAttributes.normal!==void 0&&(I=2),k.morphAttributes.color!==void 0&&(I=3);let U,Q,ee,ae;if(D){const Ve=Vn[D];U=Ve.vertexShader,Q=Ve.fragmentShader}else U=_.vertexShader,Q=_.fragmentShader,l.update(_),ee=l.getVertexShaderID(_),ae=l.getFragmentShaderID(_);const W=t.getRenderTarget(),be=_.alphaTest>0,fe=_.clearcoat>0,Me=_.iridescence>0;return{isWebGL2:u,shaderID:D,shaderName:_.type,vertexShader:U,fragmentShader:Q,defines:_.defines,customVertexShaderID:ee,customFragmentShaderID:ae,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:g,instancing:re.isInstancedMesh===!0,instancingColor:re.isInstancedMesh===!0&&re.instanceColor!==null,supportsVertexTextures:d,outputEncoding:W===null?t.outputEncoding:W.isXRRenderTarget===!0?W.texture.encoding:yr,map:!!_.map,matcap:!!_.matcap,envMap:!!K,envMapMode:K&&K.mapping,envMapCubeUVHeight:Z,lightMap:!!_.lightMap,aoMap:!!_.aoMap,emissiveMap:!!_.emissiveMap,bumpMap:!!_.bumpMap,normalMap:!!_.normalMap,objectSpaceNormalMap:_.normalMapType===E1,tangentSpaceNormalMap:_.normalMapType===R0,decodeVideoTexture:!!_.map&&_.map.isVideoTexture===!0&&_.map.encoding===je,clearcoat:fe,clearcoatMap:fe&&!!_.clearcoatMap,clearcoatRoughnessMap:fe&&!!_.clearcoatRoughnessMap,clearcoatNormalMap:fe&&!!_.clearcoatNormalMap,iridescence:Me,iridescenceMap:Me&&!!_.iridescenceMap,iridescenceThicknessMap:Me&&!!_.iridescenceThicknessMap,displacementMap:!!_.displacementMap,roughnessMap:!!_.roughnessMap,metalnessMap:!!_.metalnessMap,specularMap:!!_.specularMap,specularIntensityMap:!!_.specularIntensityMap,specularColorMap:!!_.specularColorMap,opaque:_.transparent===!1&&_.blending===cs,alphaMap:!!_.alphaMap,alphaTest:be,gradientMap:!!_.gradientMap,sheen:_.sheen>0,sheenColorMap:!!_.sheenColorMap,sheenRoughnessMap:!!_.sheenRoughnessMap,transmission:_.transmission>0,transmissionMap:!!_.transmissionMap,thicknessMap:!!_.thicknessMap,combine:_.combine,vertexTangents:!!_.normalMap&&!!k.attributes.tangent,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,vertexUvs:!!_.map||!!_.bumpMap||!!_.normalMap||!!_.specularMap||!!_.alphaMap||!!_.emissiveMap||!!_.roughnessMap||!!_.metalnessMap||!!_.clearcoatMap||!!_.clearcoatRoughnessMap||!!_.clearcoatNormalMap||!!_.iridescenceMap||!!_.iridescenceThicknessMap||!!_.displacementMap||!!_.transmissionMap||!!_.thicknessMap||!!_.specularIntensityMap||!!_.specularColorMap||!!_.sheenColorMap||!!_.sheenRoughnessMap,uvsVertexOnly:!(_.map||_.bumpMap||_.normalMap||_.specularMap||_.alphaMap||_.emissiveMap||_.roughnessMap||_.metalnessMap||_.clearcoatNormalMap||_.iridescenceMap||_.iridescenceThicknessMap||_.transmission>0||_.transmissionMap||_.thicknessMap||_.specularIntensityMap||_.specularColorMap||_.sheen>0||_.sheenColorMap||_.sheenRoughnessMap)&&!!_.displacementMap,fog:!!V,useFog:_.fog===!0,fogExp2:V&&V.isFogExp2,flatShading:!!_.flatShading,sizeAttenuation:_.sizeAttenuation,logarithmicDepthBuffer:f,skinning:re.isSkinnedMesh===!0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:B,morphTextureStride:I,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:_.dithering,shadowMapEnabled:t.shadowMap.enabled&&L.length>0,shadowMapType:t.shadowMap.type,toneMapping:_.toneMapped?t.toneMapping:ci,physicallyCorrectLights:t.physicallyCorrectLights,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===oi,flipSided:_.side===yn,useDepthPacking:!!_.depthPacking,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionDerivatives:_.extensions&&_.extensions.derivatives,extensionFragDepth:_.extensions&&_.extensions.fragDepth,extensionDrawBuffers:_.extensions&&_.extensions.drawBuffers,extensionShaderTextureLOD:_.extensions&&_.extensions.shaderTextureLOD,rendererExtensionFragDepth:u||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||i.has("EXT_shader_texture_lod"),customProgramCacheKey:_.customProgramCacheKey()}}function h(_){const C=[];if(_.shaderID?C.push(_.shaderID):(C.push(_.customVertexShaderID),C.push(_.customFragmentShaderID)),_.defines!==void 0)for(const L in _.defines)C.push(L),C.push(_.defines[L]);return _.isRawShaderMaterial===!1&&(m(C,_),x(C,_),C.push(t.outputEncoding)),C.push(_.customProgramCacheKey),C.join()}function m(_,C){_.push(C.precision),_.push(C.outputEncoding),_.push(C.envMapMode),_.push(C.envMapCubeUVHeight),_.push(C.combine),_.push(C.vertexUvs),_.push(C.fogExp2),_.push(C.sizeAttenuation),_.push(C.morphTargetsCount),_.push(C.morphAttributeCount),_.push(C.numDirLights),_.push(C.numPointLights),_.push(C.numSpotLights),_.push(C.numSpotLightMaps),_.push(C.numHemiLights),_.push(C.numRectAreaLights),_.push(C.numDirLightShadows),_.push(C.numPointLightShadows),_.push(C.numSpotLightShadows),_.push(C.numSpotLightShadowsWithMaps),_.push(C.shadowMapType),_.push(C.toneMapping),_.push(C.numClippingPlanes),_.push(C.numClipIntersection),_.push(C.depthPacking)}function x(_,C){o.disableAll(),C.isWebGL2&&o.enable(0),C.supportsVertexTextures&&o.enable(1),C.instancing&&o.enable(2),C.instancingColor&&o.enable(3),C.map&&o.enable(4),C.matcap&&o.enable(5),C.envMap&&o.enable(6),C.lightMap&&o.enable(7),C.aoMap&&o.enable(8),C.emissiveMap&&o.enable(9),C.bumpMap&&o.enable(10),C.normalMap&&o.enable(11),C.objectSpaceNormalMap&&o.enable(12),C.tangentSpaceNormalMap&&o.enable(13),C.clearcoat&&o.enable(14),C.clearcoatMap&&o.enable(15),C.clearcoatRoughnessMap&&o.enable(16),C.clearcoatNormalMap&&o.enable(17),C.iridescence&&o.enable(18),C.iridescenceMap&&o.enable(19),C.iridescenceThicknessMap&&o.enable(20),C.displacementMap&&o.enable(21),C.specularMap&&o.enable(22),C.roughnessMap&&o.enable(23),C.metalnessMap&&o.enable(24),C.gradientMap&&o.enable(25),C.alphaMap&&o.enable(26),C.alphaTest&&o.enable(27),C.vertexColors&&o.enable(28),C.vertexAlphas&&o.enable(29),C.vertexUvs&&o.enable(30),C.vertexTangents&&o.enable(31),C.uvsVertexOnly&&o.enable(32),_.push(o.mask),o.disableAll(),C.fog&&o.enable(0),C.useFog&&o.enable(1),C.flatShading&&o.enable(2),C.logarithmicDepthBuffer&&o.enable(3),C.skinning&&o.enable(4),C.morphTargets&&o.enable(5),C.morphNormals&&o.enable(6),C.morphColors&&o.enable(7),C.premultipliedAlpha&&o.enable(8),C.shadowMapEnabled&&o.enable(9),C.physicallyCorrectLights&&o.enable(10),C.doubleSided&&o.enable(11),C.flipSided&&o.enable(12),C.useDepthPacking&&o.enable(13),C.dithering&&o.enable(14),C.specularIntensityMap&&o.enable(15),C.specularColorMap&&o.enable(16),C.transmission&&o.enable(17),C.transmissionMap&&o.enable(18),C.thicknessMap&&o.enable(19),C.sheen&&o.enable(20),C.sheenColorMap&&o.enable(21),C.sheenRoughnessMap&&o.enable(22),C.decodeVideoTexture&&o.enable(23),C.opaque&&o.enable(24),_.push(o.mask)}function y(_){const C=S[_.type];let L;if(C){const O=Vn[C];L=V1.clone(O.uniforms)}else L=_.uniforms;return L}function M(_,C){let L;for(let O=0,re=c.length;O<re;O++){const V=c[O];if(V.cacheKey===C){L=V,++L.usedTimes;break}}return L===void 0&&(L=new Q2(t,C,_,s),c.push(L)),L}function w(_){if(--_.usedTimes===0){const C=c.indexOf(_);c[C]=c[c.length-1],c.pop(),_.destroy()}}function T(_){l.remove(_)}function P(){l.dispose()}return{getParameters:p,getProgramCacheKey:h,getUniforms:y,acquireProgram:M,releaseProgram:w,releaseShaderCache:T,programs:c,dispose:P}}function i3(){let t=new WeakMap;function e(s){let a=t.get(s);return a===void 0&&(a={},t.set(s,a)),a}function n(s){t.delete(s)}function i(s,a,o){t.get(s)[a]=o}function r(){t=new WeakMap}return{get:e,remove:n,update:i,dispose:r}}function r3(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function jp(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function $p(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function a(f,d,g,S,p,h){let m=t[e];return m===void 0?(m={id:f.id,object:f,geometry:d,material:g,groupOrder:S,renderOrder:f.renderOrder,z:p,group:h},t[e]=m):(m.id=f.id,m.object=f,m.geometry=d,m.material=g,m.groupOrder=S,m.renderOrder=f.renderOrder,m.z=p,m.group=h),e++,m}function o(f,d,g,S,p,h){const m=a(f,d,g,S,p,h);g.transmission>0?i.push(m):g.transparent===!0?r.push(m):n.push(m)}function l(f,d,g,S,p,h){const m=a(f,d,g,S,p,h);g.transmission>0?i.unshift(m):g.transparent===!0?r.unshift(m):n.unshift(m)}function c(f,d){n.length>1&&n.sort(f||r3),i.length>1&&i.sort(d||jp),r.length>1&&r.sort(d||jp)}function u(){for(let f=e,d=t.length;f<d;f++){const g=t[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:u,sort:c}}function s3(){let t=new WeakMap;function e(i,r){const s=t.get(i);let a;return s===void 0?(a=new $p,t.set(i,[a])):r>=s.length?(a=new $p,s.push(a)):a=s[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function a3(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new z,color:new Oe};break;case"SpotLight":n={position:new z,direction:new z,color:new Oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new z,color:new Oe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new z,skyColor:new Oe,groundColor:new Oe};break;case"RectAreaLight":n={color:new Oe,position:new z,halfWidth:new z,halfHeight:new z};break}return t[e.id]=n,n}}}function o3(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":n={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":n={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let l3=0;function c3(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function u3(t,e){const n=new a3,i=o3(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0};for(let u=0;u<9;u++)r.probe.push(new z);const s=new z,a=new St,o=new St;function l(u,f){let d=0,g=0,S=0;for(let O=0;O<9;O++)r.probe[O].set(0,0,0);let p=0,h=0,m=0,x=0,y=0,M=0,w=0,T=0,P=0,_=0;u.sort(c3);const C=f!==!0?Math.PI:1;for(let O=0,re=u.length;O<re;O++){const V=u[O],k=V.color,q=V.intensity,K=V.distance,Z=V.shadow&&V.shadow.map?V.shadow.map.texture:null;if(V.isAmbientLight)d+=k.r*q*C,g+=k.g*q*C,S+=k.b*q*C;else if(V.isLightProbe)for(let D=0;D<9;D++)r.probe[D].addScaledVector(V.sh.coefficients[D],q);else if(V.isDirectionalLight){const D=n.get(V);if(D.color.copy(V.color).multiplyScalar(V.intensity*C),V.castShadow){const G=V.shadow,B=i.get(V);B.shadowBias=G.bias,B.shadowNormalBias=G.normalBias,B.shadowRadius=G.radius,B.shadowMapSize=G.mapSize,r.directionalShadow[p]=B,r.directionalShadowMap[p]=Z,r.directionalShadowMatrix[p]=V.shadow.matrix,M++}r.directional[p]=D,p++}else if(V.isSpotLight){const D=n.get(V);D.position.setFromMatrixPosition(V.matrixWorld),D.color.copy(k).multiplyScalar(q*C),D.distance=K,D.coneCos=Math.cos(V.angle),D.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),D.decay=V.decay,r.spot[m]=D;const G=V.shadow;if(V.map&&(r.spotLightMap[P]=V.map,P++,G.updateMatrices(V),V.castShadow&&_++),r.spotLightMatrix[m]=G.matrix,V.castShadow){const B=i.get(V);B.shadowBias=G.bias,B.shadowNormalBias=G.normalBias,B.shadowRadius=G.radius,B.shadowMapSize=G.mapSize,r.spotShadow[m]=B,r.spotShadowMap[m]=Z,T++}m++}else if(V.isRectAreaLight){const D=n.get(V);D.color.copy(k).multiplyScalar(q),D.halfWidth.set(V.width*.5,0,0),D.halfHeight.set(0,V.height*.5,0),r.rectArea[x]=D,x++}else if(V.isPointLight){const D=n.get(V);if(D.color.copy(V.color).multiplyScalar(V.intensity*C),D.distance=V.distance,D.decay=V.decay,V.castShadow){const G=V.shadow,B=i.get(V);B.shadowBias=G.bias,B.shadowNormalBias=G.normalBias,B.shadowRadius=G.radius,B.shadowMapSize=G.mapSize,B.shadowCameraNear=G.camera.near,B.shadowCameraFar=G.camera.far,r.pointShadow[h]=B,r.pointShadowMap[h]=Z,r.pointShadowMatrix[h]=V.shadow.matrix,w++}r.point[h]=D,h++}else if(V.isHemisphereLight){const D=n.get(V);D.skyColor.copy(V.color).multiplyScalar(q*C),D.groundColor.copy(V.groundColor).multiplyScalar(q*C),r.hemi[y]=D,y++}}x>0&&(e.isWebGL2||t.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=se.LTC_FLOAT_1,r.rectAreaLTC2=se.LTC_FLOAT_2):t.has("OES_texture_half_float_linear")===!0?(r.rectAreaLTC1=se.LTC_HALF_1,r.rectAreaLTC2=se.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),r.ambient[0]=d,r.ambient[1]=g,r.ambient[2]=S;const L=r.hash;(L.directionalLength!==p||L.pointLength!==h||L.spotLength!==m||L.rectAreaLength!==x||L.hemiLength!==y||L.numDirectionalShadows!==M||L.numPointShadows!==w||L.numSpotShadows!==T||L.numSpotMaps!==P)&&(r.directional.length=p,r.spot.length=m,r.rectArea.length=x,r.point.length=h,r.hemi.length=y,r.directionalShadow.length=M,r.directionalShadowMap.length=M,r.pointShadow.length=w,r.pointShadowMap.length=w,r.spotShadow.length=T,r.spotShadowMap.length=T,r.directionalShadowMatrix.length=M,r.pointShadowMatrix.length=w,r.spotLightMatrix.length=T+P-_,r.spotLightMap.length=P,r.numSpotLightShadowsWithMaps=_,L.directionalLength=p,L.pointLength=h,L.spotLength=m,L.rectAreaLength=x,L.hemiLength=y,L.numDirectionalShadows=M,L.numPointShadows=w,L.numSpotShadows=T,L.numSpotMaps=P,r.version=l3++)}function c(u,f){let d=0,g=0,S=0,p=0,h=0;const m=f.matrixWorldInverse;for(let x=0,y=u.length;x<y;x++){const M=u[x];if(M.isDirectionalLight){const w=r.directional[d];w.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(m),d++}else if(M.isSpotLight){const w=r.spot[S];w.position.setFromMatrixPosition(M.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),w.direction.sub(s),w.direction.transformDirection(m),S++}else if(M.isRectAreaLight){const w=r.rectArea[p];w.position.setFromMatrixPosition(M.matrixWorld),w.position.applyMatrix4(m),o.identity(),a.copy(M.matrixWorld),a.premultiply(m),o.extractRotation(a),w.halfWidth.set(M.width*.5,0,0),w.halfHeight.set(0,M.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),p++}else if(M.isPointLight){const w=r.point[g];w.position.setFromMatrixPosition(M.matrixWorld),w.position.applyMatrix4(m),g++}else if(M.isHemisphereLight){const w=r.hemi[h];w.direction.setFromMatrixPosition(M.matrixWorld),w.direction.transformDirection(m),h++}}}return{setup:l,setupView:c,state:r}}function Xp(t,e){const n=new u3(t,e),i=[],r=[];function s(){i.length=0,r.length=0}function a(f){i.push(f)}function o(f){r.push(f)}function l(f){n.setup(i,f)}function c(f){n.setupView(i,f)}return{init:s,state:{lightsArray:i,shadowsArray:r,lights:n},setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function d3(t,e){let n=new WeakMap;function i(s,a=0){const o=n.get(s);let l;return o===void 0?(l=new Xp(t,e),n.set(s,[l])):a>=o.length?(l=new Xp(t,e),o.push(l)):l=o[a],l}function r(){n=new WeakMap}return{get:i,dispose:r}}class f3 extends Ua{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=M1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class h3 extends Ua{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.referencePosition=new z,this.nearDistance=1,this.farDistance=1e3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.referencePosition.copy(e.referencePosition),this.nearDistance=e.nearDistance,this.farDistance=e.farDistance,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const p3=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,m3=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function g3(t,e,n){let i=new W0;const r=new ke,s=new ke,a=new _t,o=new f3({depthPacking:w1}),l=new h3,c={},u=n.maxTextureSize,f={0:yn,1:ys,2:oi},d=new Mr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:p3,fragmentShader:m3}),g=d.clone();g.defines.HORIZONTAL_PASS=1;const S=new Xn;S.setAttribute("position",new $n(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const p=new Wn(S,d),h=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=E0,this.render=function(M,w,T){if(h.enabled===!1||h.autoUpdate===!1&&h.needsUpdate===!1||M.length===0)return;const P=t.getRenderTarget(),_=t.getActiveCubeFace(),C=t.getActiveMipmapLevel(),L=t.state;L.setBlending(Oi),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);for(let O=0,re=M.length;O<re;O++){const V=M[O],k=V.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",V,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;r.copy(k.mapSize);const q=k.getFrameExtents();if(r.multiply(q),s.copy(k.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/q.x),r.x=s.x*q.x,k.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/q.y),r.y=s.y*q.y,k.mapSize.y=s.y)),k.map===null){const Z=this.type!==Ks?{minFilter:Wt,magFilter:Wt}:{};k.map=new Sr(r.x,r.y,Z),k.map.texture.name=V.name+".shadowMap",k.camera.updateProjectionMatrix()}t.setRenderTarget(k.map),t.clear();const K=k.getViewportCount();for(let Z=0;Z<K;Z++){const D=k.getViewport(Z);a.set(s.x*D.x,s.y*D.y,s.x*D.z,s.y*D.w),L.viewport(a),k.updateMatrices(V,Z),i=k.getFrustum(),y(w,T,k.camera,V,this.type)}k.isPointLightShadow!==!0&&this.type===Ks&&m(k,T),k.needsUpdate=!1}h.needsUpdate=!1,t.setRenderTarget(P,_,C)};function m(M,w){const T=e.update(p);d.defines.VSM_SAMPLES!==M.blurSamples&&(d.defines.VSM_SAMPLES=M.blurSamples,g.defines.VSM_SAMPLES=M.blurSamples,d.needsUpdate=!0,g.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new Sr(r.x,r.y)),d.uniforms.shadow_pass.value=M.map.texture,d.uniforms.resolution.value=M.mapSize,d.uniforms.radius.value=M.radius,t.setRenderTarget(M.mapPass),t.clear(),t.renderBufferDirect(w,null,T,d,p,null),g.uniforms.shadow_pass.value=M.mapPass.texture,g.uniforms.resolution.value=M.mapSize,g.uniforms.radius.value=M.radius,t.setRenderTarget(M.map),t.clear(),t.renderBufferDirect(w,null,T,g,p,null)}function x(M,w,T,P,_,C){let L=null;const O=T.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(O!==void 0?L=O:L=T.isPointLight===!0?l:o,t.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const re=L.uuid,V=w.uuid;let k=c[re];k===void 0&&(k={},c[re]=k);let q=k[V];q===void 0&&(q=L.clone(),k[V]=q),L=q}return L.visible=w.visible,L.wireframe=w.wireframe,C===Ks?L.side=w.shadowSide!==null?w.shadowSide:w.side:L.side=w.shadowSide!==null?w.shadowSide:f[w.side],L.alphaMap=w.alphaMap,L.alphaTest=w.alphaTest,L.map=w.map,L.clipShadows=w.clipShadows,L.clippingPlanes=w.clippingPlanes,L.clipIntersection=w.clipIntersection,L.displacementMap=w.displacementMap,L.displacementScale=w.displacementScale,L.displacementBias=w.displacementBias,L.wireframeLinewidth=w.wireframeLinewidth,L.linewidth=w.linewidth,T.isPointLight===!0&&L.isMeshDistanceMaterial===!0&&(L.referencePosition.setFromMatrixPosition(T.matrixWorld),L.nearDistance=P,L.farDistance=_),L}function y(M,w,T,P,_){if(M.visible===!1)return;if(M.layers.test(w.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&_===Ks)&&(!M.frustumCulled||i.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,M.matrixWorld);const O=e.update(M),re=M.material;if(Array.isArray(re)){const V=O.groups;for(let k=0,q=V.length;k<q;k++){const K=V[k],Z=re[K.materialIndex];if(Z&&Z.visible){const D=x(M,Z,P,T.near,T.far,_);t.renderBufferDirect(T,null,O,D,M,K)}}}else if(re.visible){const V=x(M,re,P,T.near,T.far,_);t.renderBufferDirect(T,null,O,V,M,null)}}const L=M.children;for(let O=0,re=L.length;O<re;O++)y(L[O],w,T,P,_)}}function v3(t,e,n){const i=n.isWebGL2;function r(){let R=!1;const $=new _t;let te=null;const ce=new _t(0,0,0,0);return{setMask:function(pe){te!==pe&&!R&&(t.colorMask(pe,pe,pe,pe),te=pe)},setLocked:function(pe){R=pe},setClear:function(pe,Ue,ht,wt,Hi){Hi===!0&&(pe*=wt,Ue*=wt,ht*=wt),$.set(pe,Ue,ht,wt),ce.equals($)===!1&&(t.clearColor(pe,Ue,ht,wt),ce.copy($))},reset:function(){R=!1,te=null,ce.set(-1,0,0,0)}}}function s(){let R=!1,$=null,te=null,ce=null;return{setTest:function(pe){pe?be(2929):fe(2929)},setMask:function(pe){$!==pe&&!R&&(t.depthMask(pe),$=pe)},setFunc:function(pe){if(te!==pe){switch(pe){case Xy:t.depthFunc(512);break;case qy:t.depthFunc(519);break;case Yy:t.depthFunc(513);break;case ad:t.depthFunc(515);break;case Ky:t.depthFunc(514);break;case Zy:t.depthFunc(518);break;case Qy:t.depthFunc(516);break;case Jy:t.depthFunc(517);break;default:t.depthFunc(515)}te=pe}},setLocked:function(pe){R=pe},setClear:function(pe){ce!==pe&&(t.clearDepth(pe),ce=pe)},reset:function(){R=!1,$=null,te=null,ce=null}}}function a(){let R=!1,$=null,te=null,ce=null,pe=null,Ue=null,ht=null,wt=null,Hi=null;return{setTest:function(qe){R||(qe?be(2960):fe(2960))},setMask:function(qe){$!==qe&&!R&&(t.stencilMask(qe),$=qe)},setFunc:function(qe,Yn,fn){(te!==qe||ce!==Yn||pe!==fn)&&(t.stencilFunc(qe,Yn,fn),te=qe,ce=Yn,pe=fn)},setOp:function(qe,Yn,fn){(Ue!==qe||ht!==Yn||wt!==fn)&&(t.stencilOp(qe,Yn,fn),Ue=qe,ht=Yn,wt=fn)},setLocked:function(qe){R=qe},setClear:function(qe){Hi!==qe&&(t.clearStencil(qe),Hi=qe)},reset:function(){R=!1,$=null,te=null,ce=null,pe=null,Ue=null,ht=null,wt=null,Hi=null}}}const o=new r,l=new s,c=new a,u=new WeakMap,f=new WeakMap;let d={},g={},S=new WeakMap,p=[],h=null,m=!1,x=null,y=null,M=null,w=null,T=null,P=null,_=null,C=!1,L=null,O=null,re=null,V=null,k=null;const q=t.getParameter(35661);let K=!1,Z=0;const D=t.getParameter(7938);D.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(D)[1]),K=Z>=1):D.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(D)[1]),K=Z>=2);let G=null,B={};const I=t.getParameter(3088),U=t.getParameter(2978),Q=new _t().fromArray(I),ee=new _t().fromArray(U);function ae(R,$,te){const ce=new Uint8Array(4),pe=t.createTexture();t.bindTexture(R,pe),t.texParameteri(R,10241,9728),t.texParameteri(R,10240,9728);for(let Ue=0;Ue<te;Ue++)t.texImage2D($+Ue,0,6408,1,1,0,6408,5121,ce);return pe}const W={};W[3553]=ae(3553,3553,1),W[34067]=ae(34067,34069,6),o.setClear(0,0,0,1),l.setClear(1),c.setClear(0),be(2929),l.setFunc(ad),Dt(!1),dn(Oh),be(2884),Pt(Oi);function be(R){d[R]!==!0&&(t.enable(R),d[R]=!0)}function fe(R){d[R]!==!1&&(t.disable(R),d[R]=!1)}function Me(R,$){return g[R]!==$?(t.bindFramebuffer(R,$),g[R]=$,i&&(R===36009&&(g[36160]=$),R===36160&&(g[36009]=$)),!0):!1}function de(R,$){let te=p,ce=!1;if(R)if(te=S.get($),te===void 0&&(te=[],S.set($,te)),R.isWebGLMultipleRenderTargets){const pe=R.texture;if(te.length!==pe.length||te[0]!==36064){for(let Ue=0,ht=pe.length;Ue<ht;Ue++)te[Ue]=36064+Ue;te.length=pe.length,ce=!0}}else te[0]!==36064&&(te[0]=36064,ce=!0);else te[0]!==1029&&(te[0]=1029,ce=!0);ce&&(n.isWebGL2?t.drawBuffers(te):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(te))}function Ve(R){return h!==R?(t.useProgram(R),h=R,!0):!1}const Ce={[Gr]:32774,[Fy]:32778,[zy]:32779};if(i)Ce[Gh]=32775,Ce[Wh]=32776;else{const R=e.get("EXT_blend_minmax");R!==null&&(Ce[Gh]=R.MIN_EXT,Ce[Wh]=R.MAX_EXT)}const Se={[Oy]:0,[Uy]:1,[By]:768,[b0]:770,[$y]:776,[Hy]:774,[Gy]:772,[Vy]:769,[T0]:771,[jy]:775,[Wy]:773};function Pt(R,$,te,ce,pe,Ue,ht,wt){if(R===Oi){m===!0&&(fe(3042),m=!1);return}if(m===!1&&(be(3042),m=!0),R!==Iy){if(R!==x||wt!==C){if((y!==Gr||T!==Gr)&&(t.blendEquation(32774),y=Gr,T=Gr),wt)switch(R){case cs:t.blendFuncSeparate(1,771,1,771);break;case Uh:t.blendFunc(1,1);break;case Bh:t.blendFuncSeparate(0,769,0,1);break;case Vh:t.blendFuncSeparate(0,768,0,770);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case cs:t.blendFuncSeparate(770,771,1,771);break;case Uh:t.blendFunc(770,1);break;case Bh:t.blendFuncSeparate(0,769,0,1);break;case Vh:t.blendFunc(0,768);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}M=null,w=null,P=null,_=null,x=R,C=wt}return}pe=pe||$,Ue=Ue||te,ht=ht||ce,($!==y||pe!==T)&&(t.blendEquationSeparate(Ce[$],Ce[pe]),y=$,T=pe),(te!==M||ce!==w||Ue!==P||ht!==_)&&(t.blendFuncSeparate(Se[te],Se[ce],Se[Ue],Se[ht]),M=te,w=ce,P=Ue,_=ht),x=R,C=!1}function Rt(R,$){R.side===oi?fe(2884):be(2884);let te=R.side===yn;$&&(te=!te),Dt(te),R.blending===cs&&R.transparent===!1?Pt(Oi):Pt(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.premultipliedAlpha),l.setFunc(R.depthFunc),l.setTest(R.depthTest),l.setMask(R.depthWrite),o.setMask(R.colorWrite);const ce=R.stencilWrite;c.setTest(ce),ce&&(c.setMask(R.stencilWriteMask),c.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),c.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),Ge(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?be(32926):fe(32926)}function Dt(R){L!==R&&(R?t.frontFace(2304):t.frontFace(2305),L=R)}function dn(R){R!==Dy?(be(2884),R!==O&&(R===Oh?t.cullFace(1029):R===Ny?t.cullFace(1028):t.cullFace(1032))):fe(2884),O=R}function st(R){R!==re&&(K&&t.lineWidth(R),re=R)}function Ge(R,$,te){R?(be(32823),(V!==$||k!==te)&&(t.polygonOffset($,te),V=$,k=te)):fe(32823)}function qn(R){R?be(3089):fe(3089)}function wn(R){R===void 0&&(R=33984+q-1),G!==R&&(t.activeTexture(R),G=R)}function A(R,$,te){te===void 0&&(G===null?te=33984+q-1:te=G);let ce=B[te];ce===void 0&&(ce={type:void 0,texture:void 0},B[te]=ce),(ce.type!==R||ce.texture!==$)&&(G!==te&&(t.activeTexture(te),G=te),t.bindTexture(R,$||W[R]),ce.type=R,ce.texture=$)}function E(){const R=B[G];R!==void 0&&R.type!==void 0&&(t.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function j(){try{t.compressedTexImage2D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ne(){try{t.compressedTexImage3D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ie(){try{t.texSubImage2D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function oe(){try{t.texSubImage3D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function we(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function le(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Y(){try{t.texStorage2D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ve(){try{t.texStorage3D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function _e(){try{t.texImage2D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function he(){try{t.texImage3D.apply(t,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function xe(R){Q.equals(R)===!1&&(t.scissor(R.x,R.y,R.z,R.w),Q.copy(R))}function me(R){ee.equals(R)===!1&&(t.viewport(R.x,R.y,R.z,R.w),ee.copy(R))}function Fe(R,$){let te=f.get($);te===void 0&&(te=new WeakMap,f.set($,te));let ce=te.get(R);ce===void 0&&(ce=t.getUniformBlockIndex($,R.name),te.set(R,ce))}function Xe(R,$){const ce=f.get($).get(R);u.get(R)!==ce&&(t.uniformBlockBinding($,ce,R.__bindingPointIndex),u.set(R,ce))}function ft(){t.disable(3042),t.disable(2884),t.disable(2929),t.disable(32823),t.disable(3089),t.disable(2960),t.disable(32926),t.blendEquation(32774),t.blendFunc(1,0),t.blendFuncSeparate(1,0,1,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(513),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(519,0,4294967295),t.stencilOp(7680,7680,7680),t.clearStencil(0),t.cullFace(1029),t.frontFace(2305),t.polygonOffset(0,0),t.activeTexture(33984),t.bindFramebuffer(36160,null),i===!0&&(t.bindFramebuffer(36009,null),t.bindFramebuffer(36008,null)),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),d={},G=null,B={},g={},S=new WeakMap,p=[],h=null,m=!1,x=null,y=null,M=null,w=null,T=null,P=null,_=null,C=!1,L=null,O=null,re=null,V=null,k=null,Q.set(0,0,t.canvas.width,t.canvas.height),ee.set(0,0,t.canvas.width,t.canvas.height),o.reset(),l.reset(),c.reset()}return{buffers:{color:o,depth:l,stencil:c},enable:be,disable:fe,bindFramebuffer:Me,drawBuffers:de,useProgram:Ve,setBlending:Pt,setMaterial:Rt,setFlipSided:Dt,setCullFace:dn,setLineWidth:st,setPolygonOffset:Ge,setScissorTest:qn,activeTexture:wn,bindTexture:A,unbindTexture:E,compressedTexImage2D:j,compressedTexImage3D:ne,texImage2D:_e,texImage3D:he,updateUBOMapping:Fe,uniformBlockBinding:Xe,texStorage2D:Y,texStorage3D:ve,texSubImage2D:ie,texSubImage3D:oe,compressedTexSubImage2D:we,compressedTexSubImage3D:le,scissor:xe,viewport:me,reset:ft}}function x3(t,e,n,i,r,s,a){const o=r.isWebGL2,l=r.maxTextures,c=r.maxCubemapSize,u=r.maxTextureSize,f=r.maxSamples,d=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,g=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),S=new WeakMap;let p;const h=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(A,E){return m?new OffscreenCanvas(A,E):xl("canvas")}function y(A,E,j,ne){let ie=1;if((A.width>ne||A.height>ne)&&(ie=ne/Math.max(A.width,A.height)),ie<1||E===!0)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap){const oe=E?fd:Math.floor,we=oe(ie*A.width),le=oe(ie*A.height);p===void 0&&(p=x(we,le));const Y=j?x(we,le):p;return Y.width=we,Y.height=le,Y.getContext("2d").drawImage(A,0,0,we,le),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+A.width+"x"+A.height+") to ("+we+"x"+le+")."),Y}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+A.width+"x"+A.height+")."),A;return A}function M(A){return gp(A.width)&&gp(A.height)}function w(A){return o?!1:A.wrapS!==Nn||A.wrapT!==Nn||A.minFilter!==Wt&&A.minFilter!==gn}function T(A,E){return A.generateMipmaps&&E&&A.minFilter!==Wt&&A.minFilter!==gn}function P(A){t.generateMipmap(A)}function _(A,E,j,ne,ie=!1){if(o===!1)return E;if(A!==null){if(t[A]!==void 0)return t[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let oe=E;return E===6403&&(j===5126&&(oe=33326),j===5131&&(oe=33325),j===5121&&(oe=33321)),E===33319&&(j===5126&&(oe=33328),j===5131&&(oe=33327),j===5121&&(oe=33323)),E===6408&&(j===5126&&(oe=34836),j===5131&&(oe=34842),j===5121&&(oe=ne===je&&ie===!1?35907:32856),j===32819&&(oe=32854),j===32820&&(oe=32855)),(oe===33325||oe===33326||oe===33327||oe===33328||oe===34842||oe===34836)&&e.get("EXT_color_buffer_float"),oe}function C(A,E,j){return T(A,j)===!0||A.isFramebufferTexture&&A.minFilter!==Wt&&A.minFilter!==gn?Math.log2(Math.max(E.width,E.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?E.mipmaps.length:1}function L(A){return A===Wt||A===Hh||A===jh?9728:9729}function O(A){const E=A.target;E.removeEventListener("dispose",O),V(E),E.isVideoTexture&&S.delete(E)}function re(A){const E=A.target;E.removeEventListener("dispose",re),q(E)}function V(A){const E=i.get(A);if(E.__webglInit===void 0)return;const j=A.source,ne=h.get(j);if(ne){const ie=ne[E.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&k(A),Object.keys(ne).length===0&&h.delete(j)}i.remove(A)}function k(A){const E=i.get(A);t.deleteTexture(E.__webglTexture);const j=A.source,ne=h.get(j);delete ne[E.__cacheKey],a.memory.textures--}function q(A){const E=A.texture,j=i.get(A),ne=i.get(E);if(ne.__webglTexture!==void 0&&(t.deleteTexture(ne.__webglTexture),a.memory.textures--),A.depthTexture&&A.depthTexture.dispose(),A.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++)t.deleteFramebuffer(j.__webglFramebuffer[ie]),j.__webglDepthbuffer&&t.deleteRenderbuffer(j.__webglDepthbuffer[ie]);else{if(t.deleteFramebuffer(j.__webglFramebuffer),j.__webglDepthbuffer&&t.deleteRenderbuffer(j.__webglDepthbuffer),j.__webglMultisampledFramebuffer&&t.deleteFramebuffer(j.__webglMultisampledFramebuffer),j.__webglColorRenderbuffer)for(let ie=0;ie<j.__webglColorRenderbuffer.length;ie++)j.__webglColorRenderbuffer[ie]&&t.deleteRenderbuffer(j.__webglColorRenderbuffer[ie]);j.__webglDepthRenderbuffer&&t.deleteRenderbuffer(j.__webglDepthRenderbuffer)}if(A.isWebGLMultipleRenderTargets)for(let ie=0,oe=E.length;ie<oe;ie++){const we=i.get(E[ie]);we.__webglTexture&&(t.deleteTexture(we.__webglTexture),a.memory.textures--),i.remove(E[ie])}i.remove(E),i.remove(A)}let K=0;function Z(){K=0}function D(){const A=K;return A>=l&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+l),K+=1,A}function G(A){const E=[];return E.push(A.wrapS),E.push(A.wrapT),E.push(A.wrapR||0),E.push(A.magFilter),E.push(A.minFilter),E.push(A.anisotropy),E.push(A.internalFormat),E.push(A.format),E.push(A.type),E.push(A.generateMipmaps),E.push(A.premultiplyAlpha),E.push(A.flipY),E.push(A.unpackAlignment),E.push(A.encoding),E.join()}function B(A,E){const j=i.get(A);if(A.isVideoTexture&&qn(A),A.isRenderTargetTexture===!1&&A.version>0&&j.__version!==A.version){const ne=A.image;if(ne===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{fe(j,A,E);return}}n.bindTexture(3553,j.__webglTexture,33984+E)}function I(A,E){const j=i.get(A);if(A.version>0&&j.__version!==A.version){fe(j,A,E);return}n.bindTexture(35866,j.__webglTexture,33984+E)}function U(A,E){const j=i.get(A);if(A.version>0&&j.__version!==A.version){fe(j,A,E);return}n.bindTexture(32879,j.__webglTexture,33984+E)}function Q(A,E){const j=i.get(A);if(A.version>0&&j.__version!==A.version){Me(j,A,E);return}n.bindTexture(34067,j.__webglTexture,33984+E)}const ee={[cd]:10497,[Nn]:33071,[ud]:33648},ae={[Wt]:9728,[Hh]:9984,[jh]:9986,[gn]:9729,[a1]:9985,[zl]:9987};function W(A,E,j){if(j?(t.texParameteri(A,10242,ee[E.wrapS]),t.texParameteri(A,10243,ee[E.wrapT]),(A===32879||A===35866)&&t.texParameteri(A,32882,ee[E.wrapR]),t.texParameteri(A,10240,ae[E.magFilter]),t.texParameteri(A,10241,ae[E.minFilter])):(t.texParameteri(A,10242,33071),t.texParameteri(A,10243,33071),(A===32879||A===35866)&&t.texParameteri(A,32882,33071),(E.wrapS!==Nn||E.wrapT!==Nn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),t.texParameteri(A,10240,L(E.magFilter)),t.texParameteri(A,10241,L(E.minFilter)),E.minFilter!==Wt&&E.minFilter!==gn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),e.has("EXT_texture_filter_anisotropic")===!0){const ne=e.get("EXT_texture_filter_anisotropic");if(E.type===lr&&e.has("OES_texture_float_linear")===!1||o===!1&&E.type===Aa&&e.has("OES_texture_half_float_linear")===!1)return;(E.anisotropy>1||i.get(E).__currentAnisotropy)&&(t.texParameterf(A,ne.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,r.getMaxAnisotropy())),i.get(E).__currentAnisotropy=E.anisotropy)}}function be(A,E){let j=!1;A.__webglInit===void 0&&(A.__webglInit=!0,E.addEventListener("dispose",O));const ne=E.source;let ie=h.get(ne);ie===void 0&&(ie={},h.set(ne,ie));const oe=G(E);if(oe!==A.__cacheKey){ie[oe]===void 0&&(ie[oe]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,j=!0),ie[oe].usedTimes++;const we=ie[A.__cacheKey];we!==void 0&&(ie[A.__cacheKey].usedTimes--,we.usedTimes===0&&k(E)),A.__cacheKey=oe,A.__webglTexture=ie[oe].texture}return j}function fe(A,E,j){let ne=3553;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(ne=35866),E.isData3DTexture&&(ne=32879);const ie=be(A,E),oe=E.source;n.bindTexture(ne,A.__webglTexture,33984+j);const we=i.get(oe);if(oe.version!==we.__version||ie===!0){n.activeTexture(33984+j),t.pixelStorei(37440,E.flipY),t.pixelStorei(37441,E.premultiplyAlpha),t.pixelStorei(3317,E.unpackAlignment),t.pixelStorei(37443,0);const le=w(E)&&M(E.image)===!1;let Y=y(E.image,le,!1,u);Y=wn(E,Y);const ve=M(Y)||o,_e=s.convert(E.format,E.encoding);let he=s.convert(E.type),xe=_(E.internalFormat,_e,he,E.encoding,E.isVideoTexture);W(ne,E,ve);let me;const Fe=E.mipmaps,Xe=o&&E.isVideoTexture!==!0,ft=we.__version===void 0||ie===!0,R=C(E,Y,ve);if(E.isDepthTexture)xe=6402,o?E.type===lr?xe=36012:E.type===or?xe=33190:E.type===us?xe=35056:xe=33189:E.type===lr&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),E.format===dr&&xe===6402&&E.type!==P0&&E.type!==or&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),E.type=or,he=s.convert(E.type)),E.format===ws&&xe===6402&&(xe=34041,E.type!==us&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),E.type=us,he=s.convert(E.type))),ft&&(Xe?n.texStorage2D(3553,1,xe,Y.width,Y.height):n.texImage2D(3553,0,xe,Y.width,Y.height,0,_e,he,null));else if(E.isDataTexture)if(Fe.length>0&&ve){Xe&&ft&&n.texStorage2D(3553,R,xe,Fe[0].width,Fe[0].height);for(let $=0,te=Fe.length;$<te;$++)me=Fe[$],Xe?n.texSubImage2D(3553,$,0,0,me.width,me.height,_e,he,me.data):n.texImage2D(3553,$,xe,me.width,me.height,0,_e,he,me.data);E.generateMipmaps=!1}else Xe?(ft&&n.texStorage2D(3553,R,xe,Y.width,Y.height),n.texSubImage2D(3553,0,0,0,Y.width,Y.height,_e,he,Y.data)):n.texImage2D(3553,0,xe,Y.width,Y.height,0,_e,he,Y.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Xe&&ft&&n.texStorage3D(35866,R,xe,Fe[0].width,Fe[0].height,Y.depth);for(let $=0,te=Fe.length;$<te;$++)me=Fe[$],E.format!==kn?_e!==null?Xe?n.compressedTexSubImage3D(35866,$,0,0,0,me.width,me.height,Y.depth,_e,me.data,0,0):n.compressedTexImage3D(35866,$,xe,me.width,me.height,Y.depth,0,me.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?n.texSubImage3D(35866,$,0,0,0,me.width,me.height,Y.depth,_e,he,me.data):n.texImage3D(35866,$,xe,me.width,me.height,Y.depth,0,_e,he,me.data)}else{Xe&&ft&&n.texStorage2D(3553,R,xe,Fe[0].width,Fe[0].height);for(let $=0,te=Fe.length;$<te;$++)me=Fe[$],E.format!==kn?_e!==null?Xe?n.compressedTexSubImage2D(3553,$,0,0,me.width,me.height,_e,me.data):n.compressedTexImage2D(3553,$,xe,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?n.texSubImage2D(3553,$,0,0,me.width,me.height,_e,he,me.data):n.texImage2D(3553,$,xe,me.width,me.height,0,_e,he,me.data)}else if(E.isDataArrayTexture)Xe?(ft&&n.texStorage3D(35866,R,xe,Y.width,Y.height,Y.depth),n.texSubImage3D(35866,0,0,0,0,Y.width,Y.height,Y.depth,_e,he,Y.data)):n.texImage3D(35866,0,xe,Y.width,Y.height,Y.depth,0,_e,he,Y.data);else if(E.isData3DTexture)Xe?(ft&&n.texStorage3D(32879,R,xe,Y.width,Y.height,Y.depth),n.texSubImage3D(32879,0,0,0,0,Y.width,Y.height,Y.depth,_e,he,Y.data)):n.texImage3D(32879,0,xe,Y.width,Y.height,Y.depth,0,_e,he,Y.data);else if(E.isFramebufferTexture){if(ft)if(Xe)n.texStorage2D(3553,R,xe,Y.width,Y.height);else{let $=Y.width,te=Y.height;for(let ce=0;ce<R;ce++)n.texImage2D(3553,ce,xe,$,te,0,_e,he,null),$>>=1,te>>=1}}else if(Fe.length>0&&ve){Xe&&ft&&n.texStorage2D(3553,R,xe,Fe[0].width,Fe[0].height);for(let $=0,te=Fe.length;$<te;$++)me=Fe[$],Xe?n.texSubImage2D(3553,$,0,0,_e,he,me):n.texImage2D(3553,$,xe,_e,he,me);E.generateMipmaps=!1}else Xe?(ft&&n.texStorage2D(3553,R,xe,Y.width,Y.height),n.texSubImage2D(3553,0,0,0,_e,he,Y)):n.texImage2D(3553,0,xe,_e,he,Y);T(E,ve)&&P(ne),we.__version=oe.version,E.onUpdate&&E.onUpdate(E)}A.__version=E.version}function Me(A,E,j){if(E.image.length!==6)return;const ne=be(A,E),ie=E.source;n.bindTexture(34067,A.__webglTexture,33984+j);const oe=i.get(ie);if(ie.version!==oe.__version||ne===!0){n.activeTexture(33984+j),t.pixelStorei(37440,E.flipY),t.pixelStorei(37441,E.premultiplyAlpha),t.pixelStorei(3317,E.unpackAlignment),t.pixelStorei(37443,0);const we=E.isCompressedTexture||E.image[0].isCompressedTexture,le=E.image[0]&&E.image[0].isDataTexture,Y=[];for(let $=0;$<6;$++)!we&&!le?Y[$]=y(E.image[$],!1,!0,c):Y[$]=le?E.image[$].image:E.image[$],Y[$]=wn(E,Y[$]);const ve=Y[0],_e=M(ve)||o,he=s.convert(E.format,E.encoding),xe=s.convert(E.type),me=_(E.internalFormat,he,xe,E.encoding),Fe=o&&E.isVideoTexture!==!0,Xe=oe.__version===void 0||ne===!0;let ft=C(E,ve,_e);W(34067,E,_e);let R;if(we){Fe&&Xe&&n.texStorage2D(34067,ft,me,ve.width,ve.height);for(let $=0;$<6;$++){R=Y[$].mipmaps;for(let te=0;te<R.length;te++){const ce=R[te];E.format!==kn?he!==null?Fe?n.compressedTexSubImage2D(34069+$,te,0,0,ce.width,ce.height,he,ce.data):n.compressedTexImage2D(34069+$,te,me,ce.width,ce.height,0,ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Fe?n.texSubImage2D(34069+$,te,0,0,ce.width,ce.height,he,xe,ce.data):n.texImage2D(34069+$,te,me,ce.width,ce.height,0,he,xe,ce.data)}}}else{R=E.mipmaps,Fe&&Xe&&(R.length>0&&ft++,n.texStorage2D(34067,ft,me,Y[0].width,Y[0].height));for(let $=0;$<6;$++)if(le){Fe?n.texSubImage2D(34069+$,0,0,0,Y[$].width,Y[$].height,he,xe,Y[$].data):n.texImage2D(34069+$,0,me,Y[$].width,Y[$].height,0,he,xe,Y[$].data);for(let te=0;te<R.length;te++){const pe=R[te].image[$].image;Fe?n.texSubImage2D(34069+$,te+1,0,0,pe.width,pe.height,he,xe,pe.data):n.texImage2D(34069+$,te+1,me,pe.width,pe.height,0,he,xe,pe.data)}}else{Fe?n.texSubImage2D(34069+$,0,0,0,he,xe,Y[$]):n.texImage2D(34069+$,0,me,he,xe,Y[$]);for(let te=0;te<R.length;te++){const ce=R[te];Fe?n.texSubImage2D(34069+$,te+1,0,0,he,xe,ce.image[$]):n.texImage2D(34069+$,te+1,me,he,xe,ce.image[$])}}}T(E,_e)&&P(34067),oe.__version=ie.version,E.onUpdate&&E.onUpdate(E)}A.__version=E.version}function de(A,E,j,ne,ie){const oe=s.convert(j.format,j.encoding),we=s.convert(j.type),le=_(j.internalFormat,oe,we,j.encoding);i.get(E).__hasExternalTextures||(ie===32879||ie===35866?n.texImage3D(ie,0,le,E.width,E.height,E.depth,0,oe,we,null):n.texImage2D(ie,0,le,E.width,E.height,0,oe,we,null)),n.bindFramebuffer(36160,A),Ge(E)?d.framebufferTexture2DMultisampleEXT(36160,ne,ie,i.get(j).__webglTexture,0,st(E)):(ie===3553||ie>=34069&&ie<=34074)&&t.framebufferTexture2D(36160,ne,ie,i.get(j).__webglTexture,0),n.bindFramebuffer(36160,null)}function Ve(A,E,j){if(t.bindRenderbuffer(36161,A),E.depthBuffer&&!E.stencilBuffer){let ne=33189;if(j||Ge(E)){const ie=E.depthTexture;ie&&ie.isDepthTexture&&(ie.type===lr?ne=36012:ie.type===or&&(ne=33190));const oe=st(E);Ge(E)?d.renderbufferStorageMultisampleEXT(36161,oe,ne,E.width,E.height):t.renderbufferStorageMultisample(36161,oe,ne,E.width,E.height)}else t.renderbufferStorage(36161,ne,E.width,E.height);t.framebufferRenderbuffer(36160,36096,36161,A)}else if(E.depthBuffer&&E.stencilBuffer){const ne=st(E);j&&Ge(E)===!1?t.renderbufferStorageMultisample(36161,ne,35056,E.width,E.height):Ge(E)?d.renderbufferStorageMultisampleEXT(36161,ne,35056,E.width,E.height):t.renderbufferStorage(36161,34041,E.width,E.height),t.framebufferRenderbuffer(36160,33306,36161,A)}else{const ne=E.isWebGLMultipleRenderTargets===!0?E.texture:[E.texture];for(let ie=0;ie<ne.length;ie++){const oe=ne[ie],we=s.convert(oe.format,oe.encoding),le=s.convert(oe.type),Y=_(oe.internalFormat,we,le,oe.encoding),ve=st(E);j&&Ge(E)===!1?t.renderbufferStorageMultisample(36161,ve,Y,E.width,E.height):Ge(E)?d.renderbufferStorageMultisampleEXT(36161,ve,Y,E.width,E.height):t.renderbufferStorage(36161,Y,E.width,E.height)}}t.bindRenderbuffer(36161,null)}function Ce(A,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(36160,A),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(E.depthTexture).__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),B(E.depthTexture,0);const ne=i.get(E.depthTexture).__webglTexture,ie=st(E);if(E.depthTexture.format===dr)Ge(E)?d.framebufferTexture2DMultisampleEXT(36160,36096,3553,ne,0,ie):t.framebufferTexture2D(36160,36096,3553,ne,0);else if(E.depthTexture.format===ws)Ge(E)?d.framebufferTexture2DMultisampleEXT(36160,33306,3553,ne,0,ie):t.framebufferTexture2D(36160,33306,3553,ne,0);else throw new Error("Unknown depthTexture format")}function Se(A){const E=i.get(A),j=A.isWebGLCubeRenderTarget===!0;if(A.depthTexture&&!E.__autoAllocateDepthBuffer){if(j)throw new Error("target.depthTexture not supported in Cube render targets");Ce(E.__webglFramebuffer,A)}else if(j){E.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)n.bindFramebuffer(36160,E.__webglFramebuffer[ne]),E.__webglDepthbuffer[ne]=t.createRenderbuffer(),Ve(E.__webglDepthbuffer[ne],A,!1)}else n.bindFramebuffer(36160,E.__webglFramebuffer),E.__webglDepthbuffer=t.createRenderbuffer(),Ve(E.__webglDepthbuffer,A,!1);n.bindFramebuffer(36160,null)}function Pt(A,E,j){const ne=i.get(A);E!==void 0&&de(ne.__webglFramebuffer,A,A.texture,36064,3553),j!==void 0&&Se(A)}function Rt(A){const E=A.texture,j=i.get(A),ne=i.get(E);A.addEventListener("dispose",re),A.isWebGLMultipleRenderTargets!==!0&&(ne.__webglTexture===void 0&&(ne.__webglTexture=t.createTexture()),ne.__version=E.version,a.memory.textures++);const ie=A.isWebGLCubeRenderTarget===!0,oe=A.isWebGLMultipleRenderTargets===!0,we=M(A)||o;if(ie){j.__webglFramebuffer=[];for(let le=0;le<6;le++)j.__webglFramebuffer[le]=t.createFramebuffer()}else{if(j.__webglFramebuffer=t.createFramebuffer(),oe)if(r.drawBuffers){const le=A.texture;for(let Y=0,ve=le.length;Y<ve;Y++){const _e=i.get(le[Y]);_e.__webglTexture===void 0&&(_e.__webglTexture=t.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&A.samples>0&&Ge(A)===!1){const le=oe?E:[E];j.__webglMultisampledFramebuffer=t.createFramebuffer(),j.__webglColorRenderbuffer=[],n.bindFramebuffer(36160,j.__webglMultisampledFramebuffer);for(let Y=0;Y<le.length;Y++){const ve=le[Y];j.__webglColorRenderbuffer[Y]=t.createRenderbuffer(),t.bindRenderbuffer(36161,j.__webglColorRenderbuffer[Y]);const _e=s.convert(ve.format,ve.encoding),he=s.convert(ve.type),xe=_(ve.internalFormat,_e,he,ve.encoding,A.isXRRenderTarget===!0),me=st(A);t.renderbufferStorageMultisample(36161,me,xe,A.width,A.height),t.framebufferRenderbuffer(36160,36064+Y,36161,j.__webglColorRenderbuffer[Y])}t.bindRenderbuffer(36161,null),A.depthBuffer&&(j.__webglDepthRenderbuffer=t.createRenderbuffer(),Ve(j.__webglDepthRenderbuffer,A,!0)),n.bindFramebuffer(36160,null)}}if(ie){n.bindTexture(34067,ne.__webglTexture),W(34067,E,we);for(let le=0;le<6;le++)de(j.__webglFramebuffer[le],A,E,36064,34069+le);T(E,we)&&P(34067),n.unbindTexture()}else if(oe){const le=A.texture;for(let Y=0,ve=le.length;Y<ve;Y++){const _e=le[Y],he=i.get(_e);n.bindTexture(3553,he.__webglTexture),W(3553,_e,we),de(j.__webglFramebuffer,A,_e,36064+Y,3553),T(_e,we)&&P(3553)}n.unbindTexture()}else{let le=3553;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(o?le=A.isWebGL3DRenderTarget?32879:35866:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),n.bindTexture(le,ne.__webglTexture),W(le,E,we),de(j.__webglFramebuffer,A,E,36064,le),T(E,we)&&P(le),n.unbindTexture()}A.depthBuffer&&Se(A)}function Dt(A){const E=M(A)||o,j=A.isWebGLMultipleRenderTargets===!0?A.texture:[A.texture];for(let ne=0,ie=j.length;ne<ie;ne++){const oe=j[ne];if(T(oe,E)){const we=A.isWebGLCubeRenderTarget?34067:3553,le=i.get(oe).__webglTexture;n.bindTexture(we,le),P(we),n.unbindTexture()}}}function dn(A){if(o&&A.samples>0&&Ge(A)===!1){const E=A.isWebGLMultipleRenderTargets?A.texture:[A.texture],j=A.width,ne=A.height;let ie=16384;const oe=[],we=A.stencilBuffer?33306:36096,le=i.get(A),Y=A.isWebGLMultipleRenderTargets===!0;if(Y)for(let ve=0;ve<E.length;ve++)n.bindFramebuffer(36160,le.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(36160,36064+ve,36161,null),n.bindFramebuffer(36160,le.__webglFramebuffer),t.framebufferTexture2D(36009,36064+ve,3553,null,0);n.bindFramebuffer(36008,le.__webglMultisampledFramebuffer),n.bindFramebuffer(36009,le.__webglFramebuffer);for(let ve=0;ve<E.length;ve++){oe.push(36064+ve),A.depthBuffer&&oe.push(we);const _e=le.__ignoreDepthValues!==void 0?le.__ignoreDepthValues:!1;if(_e===!1&&(A.depthBuffer&&(ie|=256),A.stencilBuffer&&(ie|=1024)),Y&&t.framebufferRenderbuffer(36008,36064,36161,le.__webglColorRenderbuffer[ve]),_e===!0&&(t.invalidateFramebuffer(36008,[we]),t.invalidateFramebuffer(36009,[we])),Y){const he=i.get(E[ve]).__webglTexture;t.framebufferTexture2D(36009,36064,3553,he,0)}t.blitFramebuffer(0,0,j,ne,0,0,j,ne,ie,9728),g&&t.invalidateFramebuffer(36008,oe)}if(n.bindFramebuffer(36008,null),n.bindFramebuffer(36009,null),Y)for(let ve=0;ve<E.length;ve++){n.bindFramebuffer(36160,le.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(36160,36064+ve,36161,le.__webglColorRenderbuffer[ve]);const _e=i.get(E[ve]).__webglTexture;n.bindFramebuffer(36160,le.__webglFramebuffer),t.framebufferTexture2D(36009,36064+ve,3553,_e,0)}n.bindFramebuffer(36009,le.__webglMultisampledFramebuffer)}}function st(A){return Math.min(f,A.samples)}function Ge(A){const E=i.get(A);return o&&A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function qn(A){const E=a.render.frame;S.get(A)!==E&&(S.set(A,E),A.update())}function wn(A,E){const j=A.encoding,ne=A.format,ie=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||A.format===dd||j!==yr&&(j===je?o===!1?e.has("EXT_sRGB")===!0&&ne===kn?(A.format=dd,A.minFilter=gn,A.generateMipmaps=!1):E=k0.sRGBToLinear(E):(ne!==kn||ie!==_r)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture encoding:",j)),E}this.allocateTextureUnit=D,this.resetTextureUnits=Z,this.setTexture2D=B,this.setTexture2DArray=I,this.setTexture3D=U,this.setTextureCube=Q,this.rebindTextures=Pt,this.setupRenderTarget=Rt,this.updateRenderTargetMipmap=Dt,this.updateMultisampleRenderTarget=dn,this.setupDepthRenderbuffer=Se,this.setupFrameBufferTexture=de,this.useMultisampledRTT=Ge}function _3(t,e,n){const i=n.isWebGL2;function r(s,a=null){let o;if(s===_r)return 5121;if(s===u1)return 32819;if(s===d1)return 32820;if(s===o1)return 5120;if(s===l1)return 5122;if(s===P0)return 5123;if(s===c1)return 5124;if(s===or)return 5125;if(s===lr)return 5126;if(s===Aa)return i?5131:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(s===f1)return 6406;if(s===kn)return 6408;if(s===p1)return 6409;if(s===m1)return 6410;if(s===dr)return 6402;if(s===ws)return 34041;if(s===h1)return console.warn("THREE.WebGLRenderer: THREE.RGBFormat has been removed. Use THREE.RGBAFormat instead. https://github.com/mrdoob/three.js/pull/23228"),6408;if(s===dd)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(s===g1)return 6403;if(s===v1)return 36244;if(s===x1)return 33319;if(s===_1)return 33320;if(s===y1)return 36249;if(s===Sc||s===Mc||s===wc||s===Ec)if(a===je)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(s===Sc)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Mc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===wc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===Ec)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(s===Sc)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Mc)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===wc)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===Ec)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===$h||s===Xh||s===qh||s===Yh)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(s===$h)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===Xh)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===qh)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===Yh)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===S1)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===Kh||s===Zh)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(s===Kh)return a===je?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(s===Zh)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===Qh||s===Jh||s===ep||s===tp||s===np||s===ip||s===rp||s===sp||s===ap||s===op||s===lp||s===cp||s===up||s===dp)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(s===Qh)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Jh)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===ep)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===tp)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===np)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===ip)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===rp)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===sp)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===ap)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===op)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===lp)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===cp)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===up)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===dp)return a===je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===fp)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(s===fp)return a===je?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT}else return null;return s===us?i?34042:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):t[s]!==void 0?t[s]:null}return{convert:r}}class y3 extends nn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Qs extends on{constructor(){super(),this.isGroup=!0,this.type="Group"}}const S3={type:"move"};class Jc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new z),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const p of e.hand.values()){const h=n.getJointPose(p,i),m=this._getHandJoint(c,p);h!==null&&(m.matrix.fromArray(h.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.jointRadius=h.radius),m.visible=h!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],d=u.position.distanceTo(f.position),g=.02,S=.005;c.inputState.pinching&&d>g+S?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=g-S&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(S3)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new Qs;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}class M3 extends qt{constructor(e,n,i,r,s,a,o,l,c,u){if(u=u!==void 0?u:dr,u!==dr&&u!==ws)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===dr&&(i=or),i===void 0&&u===ws&&(i=us),super(null,r,s,a,o,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=o!==void 0?o:Wt,this.minFilter=l!==void 0?l:Wt,this.flipY=!1,this.generateMipmaps=!1}}class w3 extends As{constructor(e,n){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=null,c=null,u=null,f=null,d=null,g=null;const S=n.getContextAttributes();let p=null,h=null;const m=[],x=[],y=new Set,M=new Map,w=new nn;w.layers.enable(1),w.viewport=new _t;const T=new nn;T.layers.enable(2),T.viewport=new _t;const P=[w,T],_=new y3;_.layers.enable(1),_.layers.enable(2);let C=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(I){let U=m[I];return U===void 0&&(U=new Jc,m[I]=U),U.getTargetRaySpace()},this.getControllerGrip=function(I){let U=m[I];return U===void 0&&(U=new Jc,m[I]=U),U.getGripSpace()},this.getHand=function(I){let U=m[I];return U===void 0&&(U=new Jc,m[I]=U),U.getHandSpace()};function O(I){const U=x.indexOf(I.inputSource);if(U===-1)return;const Q=m[U];Q!==void 0&&Q.dispatchEvent({type:I.type,data:I.inputSource})}function re(){r.removeEventListener("select",O),r.removeEventListener("selectstart",O),r.removeEventListener("selectend",O),r.removeEventListener("squeeze",O),r.removeEventListener("squeezestart",O),r.removeEventListener("squeezeend",O),r.removeEventListener("end",re),r.removeEventListener("inputsourceschange",V);for(let I=0;I<m.length;I++){const U=x[I];U!==null&&(x[I]=null,m[I].disconnect(U))}C=null,L=null,e.setRenderTarget(p),d=null,f=null,u=null,r=null,h=null,B.stop(),i.isPresenting=!1,i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(I){s=I,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(I){o=I,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(I){l=I},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(I){if(r=I,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",O),r.addEventListener("selectstart",O),r.addEventListener("selectend",O),r.addEventListener("squeeze",O),r.addEventListener("squeezestart",O),r.addEventListener("squeezeend",O),r.addEventListener("end",re),r.addEventListener("inputsourceschange",V),S.xrCompatible!==!0&&await n.makeXRCompatible(),r.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const U={antialias:r.renderState.layers===void 0?S.antialias:!0,alpha:S.alpha,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,n,U),r.updateRenderState({baseLayer:d}),h=new Sr(d.framebufferWidth,d.framebufferHeight,{format:kn,type:_r,encoding:e.outputEncoding,stencilBuffer:S.stencil})}else{let U=null,Q=null,ee=null;S.depth&&(ee=S.stencil?35056:33190,U=S.stencil?ws:dr,Q=S.stencil?us:or);const ae={colorFormat:32856,depthFormat:ee,scaleFactor:s};u=new XRWebGLBinding(r,n),f=u.createProjectionLayer(ae),r.updateRenderState({layers:[f]}),h=new Sr(f.textureWidth,f.textureHeight,{format:kn,type:_r,depthTexture:new M3(f.textureWidth,f.textureHeight,Q,void 0,void 0,void 0,void 0,void 0,void 0,U),stencilBuffer:S.stencil,encoding:e.outputEncoding,samples:S.antialias?4:0});const W=e.properties.get(h);W.__ignoreDepthValues=f.ignoreDepthValues}h.isXRRenderTarget=!0,this.setFoveation(1),l=null,a=await r.requestReferenceSpace(o),B.setContext(r),B.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}};function V(I){for(let U=0;U<I.removed.length;U++){const Q=I.removed[U],ee=x.indexOf(Q);ee>=0&&(x[ee]=null,m[ee].disconnect(Q))}for(let U=0;U<I.added.length;U++){const Q=I.added[U];let ee=x.indexOf(Q);if(ee===-1){for(let W=0;W<m.length;W++)if(W>=x.length){x.push(Q),ee=W;break}else if(x[W]===null){x[W]=Q,ee=W;break}if(ee===-1)break}const ae=m[ee];ae&&ae.connect(Q)}}const k=new z,q=new z;function K(I,U,Q){k.setFromMatrixPosition(U.matrixWorld),q.setFromMatrixPosition(Q.matrixWorld);const ee=k.distanceTo(q),ae=U.projectionMatrix.elements,W=Q.projectionMatrix.elements,be=ae[14]/(ae[10]-1),fe=ae[14]/(ae[10]+1),Me=(ae[9]+1)/ae[5],de=(ae[9]-1)/ae[5],Ve=(ae[8]-1)/ae[0],Ce=(W[8]+1)/W[0],Se=be*Ve,Pt=be*Ce,Rt=ee/(-Ve+Ce),Dt=Rt*-Ve;U.matrixWorld.decompose(I.position,I.quaternion,I.scale),I.translateX(Dt),I.translateZ(Rt),I.matrixWorld.compose(I.position,I.quaternion,I.scale),I.matrixWorldInverse.copy(I.matrixWorld).invert();const dn=be+Rt,st=fe+Rt,Ge=Se-Dt,qn=Pt+(ee-Dt),wn=Me*fe/st*dn,A=de*fe/st*dn;I.projectionMatrix.makePerspective(Ge,qn,wn,A,dn,st)}function Z(I,U){U===null?I.matrixWorld.copy(I.matrix):I.matrixWorld.multiplyMatrices(U.matrixWorld,I.matrix),I.matrixWorldInverse.copy(I.matrixWorld).invert()}this.updateCamera=function(I){if(r===null)return;_.near=T.near=w.near=I.near,_.far=T.far=w.far=I.far,(C!==_.near||L!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),C=_.near,L=_.far);const U=I.parent,Q=_.cameras;Z(_,U);for(let ae=0;ae<Q.length;ae++)Z(Q[ae],U);_.matrixWorld.decompose(_.position,_.quaternion,_.scale),I.matrix.copy(_.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale);const ee=I.children;for(let ae=0,W=ee.length;ae<W;ae++)ee[ae].updateMatrixWorld(!0);Q.length===2?K(_,w,T):_.projectionMatrix.copy(w.projectionMatrix)},this.getCamera=function(){return _},this.getFoveation=function(){if(f!==null)return f.fixedFoveation;if(d!==null)return d.fixedFoveation},this.setFoveation=function(I){f!==null&&(f.fixedFoveation=I),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=I)},this.getPlanes=function(){return y};let D=null;function G(I,U){if(c=U.getViewerPose(l||a),g=U,c!==null){const Q=c.views;d!==null&&(e.setRenderTargetFramebuffer(h,d.framebuffer),e.setRenderTarget(h));let ee=!1;Q.length!==_.cameras.length&&(_.cameras.length=0,ee=!0);for(let ae=0;ae<Q.length;ae++){const W=Q[ae];let be=null;if(d!==null)be=d.getViewport(W);else{const Me=u.getViewSubImage(f,W);be=Me.viewport,ae===0&&(e.setRenderTargetTextures(h,Me.colorTexture,f.ignoreDepthValues?void 0:Me.depthStencilTexture),e.setRenderTarget(h))}let fe=P[ae];fe===void 0&&(fe=new nn,fe.layers.enable(ae),fe.viewport=new _t,P[ae]=fe),fe.matrix.fromArray(W.transform.matrix),fe.projectionMatrix.fromArray(W.projectionMatrix),fe.viewport.set(be.x,be.y,be.width,be.height),ae===0&&_.matrix.copy(fe.matrix),ee===!0&&_.cameras.push(fe)}}for(let Q=0;Q<m.length;Q++){const ee=x[Q],ae=m[Q];ee!==null&&ae!==void 0&&ae.update(ee,U,l||a)}if(D&&D(I,U),U.detectedPlanes){i.dispatchEvent({type:"planesdetected",data:U.detectedPlanes});let Q=null;for(const ee of y)U.detectedPlanes.has(ee)||(Q===null&&(Q=[]),Q.push(ee));if(Q!==null)for(const ee of Q)y.delete(ee),M.delete(ee),i.dispatchEvent({type:"planeremoved",data:ee});for(const ee of U.detectedPlanes)if(!y.has(ee))y.add(ee),M.set(ee,U.lastChangedTime),i.dispatchEvent({type:"planeadded",data:ee});else{const ae=M.get(ee);ee.lastChangedTime>ae&&(M.set(ee,ee.lastChangedTime),i.dispatchEvent({type:"planechanged",data:ee}))}}g=null}const B=new H0;B.setAnimationLoop(G),this.setAnimationLoop=function(I){D=I},this.dispose=function(){}}}function E3(t,e){function n(p,h){h.color.getRGB(p.fogColor.value,B0(t)),h.isFog?(p.fogNear.value=h.near,p.fogFar.value=h.far):h.isFogExp2&&(p.fogDensity.value=h.density)}function i(p,h,m,x,y){h.isMeshBasicMaterial||h.isMeshLambertMaterial?r(p,h):h.isMeshToonMaterial?(r(p,h),u(p,h)):h.isMeshPhongMaterial?(r(p,h),c(p,h)):h.isMeshStandardMaterial?(r(p,h),f(p,h),h.isMeshPhysicalMaterial&&d(p,h,y)):h.isMeshMatcapMaterial?(r(p,h),g(p,h)):h.isMeshDepthMaterial?r(p,h):h.isMeshDistanceMaterial?(r(p,h),S(p,h)):h.isMeshNormalMaterial?r(p,h):h.isLineBasicMaterial?(s(p,h),h.isLineDashedMaterial&&a(p,h)):h.isPointsMaterial?o(p,h,m,x):h.isSpriteMaterial?l(p,h):h.isShadowMaterial?(p.color.value.copy(h.color),p.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function r(p,h){p.opacity.value=h.opacity,h.color&&p.diffuse.value.copy(h.color),h.emissive&&p.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(p.map.value=h.map),h.alphaMap&&(p.alphaMap.value=h.alphaMap),h.bumpMap&&(p.bumpMap.value=h.bumpMap,p.bumpScale.value=h.bumpScale,h.side===yn&&(p.bumpScale.value*=-1)),h.displacementMap&&(p.displacementMap.value=h.displacementMap,p.displacementScale.value=h.displacementScale,p.displacementBias.value=h.displacementBias),h.emissiveMap&&(p.emissiveMap.value=h.emissiveMap),h.normalMap&&(p.normalMap.value=h.normalMap,p.normalScale.value.copy(h.normalScale),h.side===yn&&p.normalScale.value.negate()),h.specularMap&&(p.specularMap.value=h.specularMap),h.alphaTest>0&&(p.alphaTest.value=h.alphaTest);const m=e.get(h).envMap;if(m&&(p.envMap.value=m,p.flipEnvMap.value=m.isCubeTexture&&m.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=h.reflectivity,p.ior.value=h.ior,p.refractionRatio.value=h.refractionRatio),h.lightMap){p.lightMap.value=h.lightMap;const M=t.physicallyCorrectLights!==!0?Math.PI:1;p.lightMapIntensity.value=h.lightMapIntensity*M}h.aoMap&&(p.aoMap.value=h.aoMap,p.aoMapIntensity.value=h.aoMapIntensity);let x;h.map?x=h.map:h.specularMap?x=h.specularMap:h.displacementMap?x=h.displacementMap:h.normalMap?x=h.normalMap:h.bumpMap?x=h.bumpMap:h.roughnessMap?x=h.roughnessMap:h.metalnessMap?x=h.metalnessMap:h.alphaMap?x=h.alphaMap:h.emissiveMap?x=h.emissiveMap:h.clearcoatMap?x=h.clearcoatMap:h.clearcoatNormalMap?x=h.clearcoatNormalMap:h.clearcoatRoughnessMap?x=h.clearcoatRoughnessMap:h.iridescenceMap?x=h.iridescenceMap:h.iridescenceThicknessMap?x=h.iridescenceThicknessMap:h.specularIntensityMap?x=h.specularIntensityMap:h.specularColorMap?x=h.specularColorMap:h.transmissionMap?x=h.transmissionMap:h.thicknessMap?x=h.thicknessMap:h.sheenColorMap?x=h.sheenColorMap:h.sheenRoughnessMap&&(x=h.sheenRoughnessMap),x!==void 0&&(x.isWebGLRenderTarget&&(x=x.texture),x.matrixAutoUpdate===!0&&x.updateMatrix(),p.uvTransform.value.copy(x.matrix));let y;h.aoMap?y=h.aoMap:h.lightMap&&(y=h.lightMap),y!==void 0&&(y.isWebGLRenderTarget&&(y=y.texture),y.matrixAutoUpdate===!0&&y.updateMatrix(),p.uv2Transform.value.copy(y.matrix))}function s(p,h){p.diffuse.value.copy(h.color),p.opacity.value=h.opacity}function a(p,h){p.dashSize.value=h.dashSize,p.totalSize.value=h.dashSize+h.gapSize,p.scale.value=h.scale}function o(p,h,m,x){p.diffuse.value.copy(h.color),p.opacity.value=h.opacity,p.size.value=h.size*m,p.scale.value=x*.5,h.map&&(p.map.value=h.map),h.alphaMap&&(p.alphaMap.value=h.alphaMap),h.alphaTest>0&&(p.alphaTest.value=h.alphaTest);let y;h.map?y=h.map:h.alphaMap&&(y=h.alphaMap),y!==void 0&&(y.matrixAutoUpdate===!0&&y.updateMatrix(),p.uvTransform.value.copy(y.matrix))}function l(p,h){p.diffuse.value.copy(h.color),p.opacity.value=h.opacity,p.rotation.value=h.rotation,h.map&&(p.map.value=h.map),h.alphaMap&&(p.alphaMap.value=h.alphaMap),h.alphaTest>0&&(p.alphaTest.value=h.alphaTest);let m;h.map?m=h.map:h.alphaMap&&(m=h.alphaMap),m!==void 0&&(m.matrixAutoUpdate===!0&&m.updateMatrix(),p.uvTransform.value.copy(m.matrix))}function c(p,h){p.specular.value.copy(h.specular),p.shininess.value=Math.max(h.shininess,1e-4)}function u(p,h){h.gradientMap&&(p.gradientMap.value=h.gradientMap)}function f(p,h){p.roughness.value=h.roughness,p.metalness.value=h.metalness,h.roughnessMap&&(p.roughnessMap.value=h.roughnessMap),h.metalnessMap&&(p.metalnessMap.value=h.metalnessMap),e.get(h).envMap&&(p.envMapIntensity.value=h.envMapIntensity)}function d(p,h,m){p.ior.value=h.ior,h.sheen>0&&(p.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),p.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(p.sheenColorMap.value=h.sheenColorMap),h.sheenRoughnessMap&&(p.sheenRoughnessMap.value=h.sheenRoughnessMap)),h.clearcoat>0&&(p.clearcoat.value=h.clearcoat,p.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(p.clearcoatMap.value=h.clearcoatMap),h.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap),h.clearcoatNormalMap&&(p.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),p.clearcoatNormalMap.value=h.clearcoatNormalMap,h.side===yn&&p.clearcoatNormalScale.value.negate())),h.iridescence>0&&(p.iridescence.value=h.iridescence,p.iridescenceIOR.value=h.iridescenceIOR,p.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(p.iridescenceMap.value=h.iridescenceMap),h.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=h.iridescenceThicknessMap)),h.transmission>0&&(p.transmission.value=h.transmission,p.transmissionSamplerMap.value=m.texture,p.transmissionSamplerSize.value.set(m.width,m.height),h.transmissionMap&&(p.transmissionMap.value=h.transmissionMap),p.thickness.value=h.thickness,h.thicknessMap&&(p.thicknessMap.value=h.thicknessMap),p.attenuationDistance.value=h.attenuationDistance,p.attenuationColor.value.copy(h.attenuationColor)),p.specularIntensity.value=h.specularIntensity,p.specularColor.value.copy(h.specularColor),h.specularIntensityMap&&(p.specularIntensityMap.value=h.specularIntensityMap),h.specularColorMap&&(p.specularColorMap.value=h.specularColorMap)}function g(p,h){h.matcap&&(p.matcap.value=h.matcap)}function S(p,h){p.referencePosition.value.copy(h.referencePosition),p.nearDistance.value=h.nearDistance,p.farDistance.value=h.farDistance}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function b3(t,e,n,i){let r={},s={},a=[];const o=n.isWebGL2?t.getParameter(35375):0;function l(x,y){const M=y.program;i.uniformBlockBinding(x,M)}function c(x,y){let M=r[x.id];M===void 0&&(S(x),M=u(x),r[x.id]=M,x.addEventListener("dispose",h));const w=y.program;i.updateUBOMapping(x,w);const T=e.render.frame;s[x.id]!==T&&(d(x),s[x.id]=T)}function u(x){const y=f();x.__bindingPointIndex=y;const M=t.createBuffer(),w=x.__size,T=x.usage;return t.bindBuffer(35345,M),t.bufferData(35345,w,T),t.bindBuffer(35345,null),t.bindBufferBase(35345,y,M),M}function f(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const y=r[x.id],M=x.uniforms,w=x.__cache;t.bindBuffer(35345,y);for(let T=0,P=M.length;T<P;T++){const _=M[T];if(g(_,T,w)===!0){const C=_.value,L=_.__offset;typeof C=="number"?(_.__data[0]=C,t.bufferSubData(35345,L,_.__data)):(_.value.isMatrix3?(_.__data[0]=_.value.elements[0],_.__data[1]=_.value.elements[1],_.__data[2]=_.value.elements[2],_.__data[3]=_.value.elements[0],_.__data[4]=_.value.elements[3],_.__data[5]=_.value.elements[4],_.__data[6]=_.value.elements[5],_.__data[7]=_.value.elements[0],_.__data[8]=_.value.elements[6],_.__data[9]=_.value.elements[7],_.__data[10]=_.value.elements[8],_.__data[11]=_.value.elements[0]):C.toArray(_.__data),t.bufferSubData(35345,L,_.__data))}}t.bindBuffer(35345,null)}function g(x,y,M){const w=x.value;if(M[y]===void 0)return typeof w=="number"?M[y]=w:M[y]=w.clone(),!0;if(typeof w=="number"){if(M[y]!==w)return M[y]=w,!0}else{const T=M[y];if(T.equals(w)===!1)return T.copy(w),!0}return!1}function S(x){const y=x.uniforms;let M=0;const w=16;let T=0;for(let P=0,_=y.length;P<_;P++){const C=y[P],L=p(C);if(C.__data=new Float32Array(L.storage/Float32Array.BYTES_PER_ELEMENT),C.__offset=M,P>0){T=M%w;const O=w-T;T!==0&&O-L.boundary<0&&(M+=w-T,C.__offset=M)}M+=L.storage}return T=M%w,T>0&&(M+=w-T),x.__size=M,x.__cache={},this}function p(x){const y=x.value,M={boundary:0,storage:0};return typeof y=="number"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),M}function h(x){const y=x.target;y.removeEventListener("dispose",h);const M=a.indexOf(y.__bindingPointIndex);a.splice(M,1),t.deleteBuffer(r[y.id]),delete r[y.id],delete s[y.id]}function m(){for(const x in r)t.deleteBuffer(r[x]);a=[],r={},s={}}return{bind:l,update:c,dispose:m}}function T3(){const t=xl("canvas");return t.style.display="block",t}function Y0(t={}){this.isWebGLRenderer=!0;const e=t.canvas!==void 0?t.canvas:T3(),n=t.context!==void 0?t.context:null,i=t.depth!==void 0?t.depth:!0,r=t.stencil!==void 0?t.stencil:!0,s=t.antialias!==void 0?t.antialias:!1,a=t.premultipliedAlpha!==void 0?t.premultipliedAlpha:!0,o=t.preserveDrawingBuffer!==void 0?t.preserveDrawingBuffer:!1,l=t.powerPreference!==void 0?t.powerPreference:"default",c=t.failIfMajorPerformanceCaveat!==void 0?t.failIfMajorPerformanceCaveat:!1;let u;n!==null?u=n.getContextAttributes().alpha:u=t.alpha!==void 0?t.alpha:!1;let f=null,d=null;const g=[],S=[];this.domElement=e,this.debug={checkShaderErrors:!0},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.outputEncoding=yr,this.physicallyCorrectLights=!1,this.toneMapping=ci,this.toneMappingExposure=1;const p=this;let h=!1,m=0,x=0,y=null,M=-1,w=null;const T=new _t,P=new _t;let _=null,C=e.width,L=e.height,O=1,re=null,V=null;const k=new _t(0,0,C,L),q=new _t(0,0,C,L);let K=!1;const Z=new W0;let D=!1,G=!1,B=null;const I=new St,U=new ke,Q=new z,ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ae(){return y===null?O:1}let W=n;function be(b,F){for(let H=0;H<b.length;H++){const N=b[H],X=e.getContext(N,F);if(X!==null)return X}return null}try{const b={alpha:!0,depth:i,stencil:r,antialias:s,premultipliedAlpha:a,preserveDrawingBuffer:o,powerPreference:l,failIfMajorPerformanceCaveat:c};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${gf}`),e.addEventListener("webglcontextlost",xe,!1),e.addEventListener("webglcontextrestored",me,!1),e.addEventListener("webglcontextcreationerror",Fe,!1),W===null){const F=["webgl2","webgl","experimental-webgl"];if(p.isWebGL1Renderer===!0&&F.shift(),W=be(F,b),W===null)throw be(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}W.getShaderPrecisionFormat===void 0&&(W.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let fe,Me,de,Ve,Ce,Se,Pt,Rt,Dt,dn,st,Ge,qn,wn,A,E,j,ne,ie,oe,we,le,Y,ve;function _e(){fe=new zw(W),Me=new Pw(W,fe,t),fe.init(Me),le=new _3(W,fe,Me),de=new v3(W,fe,Me),Ve=new Bw,Ce=new i3,Se=new x3(W,fe,de,Ce,Me,le,Ve),Pt=new Dw(p),Rt=new Fw(p),Dt=new q1(W,Me),Y=new Aw(W,fe,Dt,Me),dn=new Ow(W,Dt,Ve,Y),st=new Hw(W,dn,Dt,Ve),ie=new Ww(W,Me,Se),E=new Rw(Ce),Ge=new n3(p,Pt,Rt,fe,Me,Y,E),qn=new E3(p,Ce),wn=new s3,A=new d3(fe,Me),ne=new Cw(p,Pt,Rt,de,st,u,a),j=new g3(p,st,Me),ve=new b3(W,Ve,Me,de),oe=new Lw(W,fe,Ve,Me),we=new Uw(W,fe,Ve,Me),Ve.programs=Ge.programs,p.capabilities=Me,p.extensions=fe,p.properties=Ce,p.renderLists=wn,p.shadowMap=j,p.state=de,p.info=Ve}_e();const he=new w3(p,W);this.xr=he,this.getContext=function(){return W},this.getContextAttributes=function(){return W.getContextAttributes()},this.forceContextLoss=function(){const b=fe.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=fe.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return O},this.setPixelRatio=function(b){b!==void 0&&(O=b,this.setSize(C,L,!1))},this.getSize=function(b){return b.set(C,L)},this.setSize=function(b,F,H){if(he.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}C=b,L=F,e.width=Math.floor(b*O),e.height=Math.floor(F*O),H!==!1&&(e.style.width=b+"px",e.style.height=F+"px"),this.setViewport(0,0,b,F)},this.getDrawingBufferSize=function(b){return b.set(C*O,L*O).floor()},this.setDrawingBufferSize=function(b,F,H){C=b,L=F,O=H,e.width=Math.floor(b*H),e.height=Math.floor(F*H),this.setViewport(0,0,b,F)},this.getCurrentViewport=function(b){return b.copy(T)},this.getViewport=function(b){return b.copy(k)},this.setViewport=function(b,F,H,N){b.isVector4?k.set(b.x,b.y,b.z,b.w):k.set(b,F,H,N),de.viewport(T.copy(k).multiplyScalar(O).floor())},this.getScissor=function(b){return b.copy(q)},this.setScissor=function(b,F,H,N){b.isVector4?q.set(b.x,b.y,b.z,b.w):q.set(b,F,H,N),de.scissor(P.copy(q).multiplyScalar(O).floor())},this.getScissorTest=function(){return K},this.setScissorTest=function(b){de.setScissorTest(K=b)},this.setOpaqueSort=function(b){re=b},this.setTransparentSort=function(b){V=b},this.getClearColor=function(b){return b.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor.apply(ne,arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha.apply(ne,arguments)},this.clear=function(b=!0,F=!0,H=!0){let N=0;b&&(N|=16384),F&&(N|=256),H&&(N|=1024),W.clear(N)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",xe,!1),e.removeEventListener("webglcontextrestored",me,!1),e.removeEventListener("webglcontextcreationerror",Fe,!1),wn.dispose(),A.dispose(),Ce.dispose(),Pt.dispose(),Rt.dispose(),st.dispose(),Y.dispose(),ve.dispose(),Ge.dispose(),he.dispose(),he.removeEventListener("sessionstart",ce),he.removeEventListener("sessionend",pe),B&&(B.dispose(),B=null),Ue.stop()};function xe(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),h=!0}function me(){console.log("THREE.WebGLRenderer: Context Restored."),h=!1;const b=Ve.autoReset,F=j.enabled,H=j.autoUpdate,N=j.needsUpdate,X=j.type;_e(),Ve.autoReset=b,j.enabled=F,j.autoUpdate=H,j.needsUpdate=N,j.type=X}function Fe(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Xe(b){const F=b.target;F.removeEventListener("dispose",Xe),ft(F)}function ft(b){R(b),Ce.remove(b)}function R(b){const F=Ce.get(b).programs;F!==void 0&&(F.forEach(function(H){Ge.releaseProgram(H)}),b.isShaderMaterial&&Ge.releaseShaderCache(b))}this.renderBufferDirect=function(b,F,H,N,X,ge){F===null&&(F=ee);const Ee=X.isMesh&&X.matrixWorld.determinant()<0,Ae=tv(b,F,H,N,X);de.setMaterial(N,Ee);let Le=H.index,ze=1;N.wireframe===!0&&(Le=dn.getWireframeAttribute(H),ze=2);const Re=H.drawRange,De=H.attributes.position;let tt=Re.start*ze,Kt=(Re.start+Re.count)*ze;ge!==null&&(tt=Math.max(tt,ge.start*ze),Kt=Math.min(Kt,(ge.start+ge.count)*ze)),Le!==null?(tt=Math.max(tt,0),Kt=Math.min(Kt,Le.count)):De!=null&&(tt=Math.max(tt,0),Kt=Math.min(Kt,De.count));const Kn=Kt-tt;if(Kn<0||Kn===1/0)return;Y.setup(X,N,Ae,H,Le);let ji,nt=oe;if(Le!==null&&(ji=Dt.get(Le),nt=we,nt.setIndex(ji)),X.isMesh)N.wireframe===!0?(de.setLineWidth(N.wireframeLinewidth*ae()),nt.setMode(1)):nt.setMode(4);else if(X.isLine){let Ne=N.linewidth;Ne===void 0&&(Ne=1),de.setLineWidth(Ne*ae()),X.isLineSegments?nt.setMode(1):X.isLineLoop?nt.setMode(2):nt.setMode(3)}else X.isPoints?nt.setMode(0):X.isSprite&&nt.setMode(4);if(X.isInstancedMesh)nt.renderInstances(tt,Kn,X.count);else if(H.isInstancedBufferGeometry){const Ne=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Vl=Math.min(H.instanceCount,Ne);nt.renderInstances(tt,Kn,Vl)}else nt.render(tt,Kn)},this.compile=function(b,F){function H(N,X,ge){N.transparent===!0&&N.side===oi?(N.side=yn,N.needsUpdate=!0,fn(N,X,ge),N.side=ys,N.needsUpdate=!0,fn(N,X,ge),N.side=oi):fn(N,X,ge)}d=A.get(b),d.init(),S.push(d),b.traverseVisible(function(N){N.isLight&&N.layers.test(F.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),d.setupLights(p.physicallyCorrectLights),b.traverse(function(N){const X=N.material;if(X)if(Array.isArray(X))for(let ge=0;ge<X.length;ge++){const Ee=X[ge];H(Ee,b,N)}else H(X,b,N)}),S.pop(),d=null};let $=null;function te(b){$&&$(b)}function ce(){Ue.stop()}function pe(){Ue.start()}const Ue=new H0;Ue.setAnimationLoop(te),typeof self<"u"&&Ue.setContext(self),this.setAnimationLoop=function(b){$=b,he.setAnimationLoop(b),b===null?Ue.stop():Ue.start()},he.addEventListener("sessionstart",ce),he.addEventListener("sessionend",pe),this.render=function(b,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(h===!0)return;b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),he.enabled===!0&&he.isPresenting===!0&&(he.cameraAutoUpdate===!0&&he.updateCamera(F),F=he.getCamera()),b.isScene===!0&&b.onBeforeRender(p,b,F,y),d=A.get(b,S.length),d.init(),S.push(d),I.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),Z.setFromProjectionMatrix(I),G=this.localClippingEnabled,D=E.init(this.clippingPlanes,G,F),f=wn.get(b,g.length),f.init(),g.push(f),ht(b,F,0,p.sortObjects),f.finish(),p.sortObjects===!0&&f.sort(re,V),D===!0&&E.beginShadows();const H=d.state.shadowsArray;if(j.render(H,b,F),D===!0&&E.endShadows(),this.info.autoReset===!0&&this.info.reset(),ne.render(f,b),d.setupLights(p.physicallyCorrectLights),F.isArrayCamera){const N=F.cameras;for(let X=0,ge=N.length;X<ge;X++){const Ee=N[X];wt(f,b,Ee,Ee.viewport)}}else wt(f,b,F);y!==null&&(Se.updateMultisampleRenderTarget(y),Se.updateRenderTargetMipmap(y)),b.isScene===!0&&b.onAfterRender(p,b,F),Y.resetDefaultState(),M=-1,w=null,S.pop(),S.length>0?d=S[S.length-1]:d=null,g.pop(),g.length>0?f=g[g.length-1]:f=null};function ht(b,F,H,N){if(b.visible===!1)return;if(b.layers.test(F.layers)){if(b.isGroup)H=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(F);else if(b.isLight)d.pushLight(b),b.castShadow&&d.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Z.intersectsSprite(b)){N&&Q.setFromMatrixPosition(b.matrixWorld).applyMatrix4(I);const Ee=st.update(b),Ae=b.material;Ae.visible&&f.push(b,Ee,Ae,H,Q.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(b.isSkinnedMesh&&b.skeleton.frame!==Ve.render.frame&&(b.skeleton.update(),b.skeleton.frame=Ve.render.frame),!b.frustumCulled||Z.intersectsObject(b))){N&&Q.setFromMatrixPosition(b.matrixWorld).applyMatrix4(I);const Ee=st.update(b),Ae=b.material;if(Array.isArray(Ae)){const Le=Ee.groups;for(let ze=0,Re=Le.length;ze<Re;ze++){const De=Le[ze],tt=Ae[De.materialIndex];tt&&tt.visible&&f.push(b,Ee,tt,H,Q.z,De)}}else Ae.visible&&f.push(b,Ee,Ae,H,Q.z,null)}}const ge=b.children;for(let Ee=0,Ae=ge.length;Ee<Ae;Ee++)ht(ge[Ee],F,H,N)}function wt(b,F,H,N){const X=b.opaque,ge=b.transmissive,Ee=b.transparent;d.setupLightsView(H),ge.length>0&&Hi(X,F,H),N&&de.viewport(T.copy(N)),X.length>0&&qe(X,F,H),ge.length>0&&qe(ge,F,H),Ee.length>0&&qe(Ee,F,H),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Hi(b,F,H){const N=Me.isWebGL2;B===null&&(B=new Sr(1,1,{generateMipmaps:!0,type:fe.has("EXT_color_buffer_half_float")?Aa:_r,minFilter:zl,samples:N&&s===!0?4:0})),p.getDrawingBufferSize(U),N?B.setSize(U.x,U.y):B.setSize(fd(U.x),fd(U.y));const X=p.getRenderTarget();p.setRenderTarget(B),p.clear();const ge=p.toneMapping;p.toneMapping=ci,qe(b,F,H),p.toneMapping=ge,Se.updateMultisampleRenderTarget(B),Se.updateRenderTargetMipmap(B),p.setRenderTarget(X)}function qe(b,F,H){const N=F.isScene===!0?F.overrideMaterial:null;for(let X=0,ge=b.length;X<ge;X++){const Ee=b[X],Ae=Ee.object,Le=Ee.geometry,ze=N===null?Ee.material:N,Re=Ee.group;Ae.layers.test(H.layers)&&Yn(Ae,F,H,Le,ze,Re)}}function Yn(b,F,H,N,X,ge){b.onBeforeRender(p,F,H,N,X,ge),b.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),X.onBeforeRender(p,F,H,N,b,ge),X.transparent===!0&&X.side===oi?(X.side=yn,X.needsUpdate=!0,p.renderBufferDirect(H,F,N,X,b,ge),X.side=ys,X.needsUpdate=!0,p.renderBufferDirect(H,F,N,X,b,ge),X.side=oi):p.renderBufferDirect(H,F,N,X,b,ge),b.onAfterRender(p,F,H,N,X,ge)}function fn(b,F,H){F.isScene!==!0&&(F=ee);const N=Ce.get(b),X=d.state.lights,ge=d.state.shadowsArray,Ee=X.state.version,Ae=Ge.getParameters(b,X.state,ge,F,H),Le=Ge.getProgramCacheKey(Ae);let ze=N.programs;N.environment=b.isMeshStandardMaterial?F.environment:null,N.fog=F.fog,N.envMap=(b.isMeshStandardMaterial?Rt:Pt).get(b.envMap||N.environment),ze===void 0&&(b.addEventListener("dispose",Xe),ze=new Map,N.programs=ze);let Re=ze.get(Le);if(Re!==void 0){if(N.currentProgram===Re&&N.lightsStateVersion===Ee)return Mf(b,Ae),Re}else Ae.uniforms=Ge.getUniforms(b),b.onBuild(H,Ae,p),b.onBeforeCompile(Ae,p),Re=Ge.acquireProgram(Ae,Le),ze.set(Le,Re),N.uniforms=Ae.uniforms;const De=N.uniforms;(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(De.clippingPlanes=E.uniform),Mf(b,Ae),N.needsLights=iv(b),N.lightsStateVersion=Ee,N.needsLights&&(De.ambientLightColor.value=X.state.ambient,De.lightProbe.value=X.state.probe,De.directionalLights.value=X.state.directional,De.directionalLightShadows.value=X.state.directionalShadow,De.spotLights.value=X.state.spot,De.spotLightShadows.value=X.state.spotShadow,De.rectAreaLights.value=X.state.rectArea,De.ltc_1.value=X.state.rectAreaLTC1,De.ltc_2.value=X.state.rectAreaLTC2,De.pointLights.value=X.state.point,De.pointLightShadows.value=X.state.pointShadow,De.hemisphereLights.value=X.state.hemi,De.directionalShadowMap.value=X.state.directionalShadowMap,De.directionalShadowMatrix.value=X.state.directionalShadowMatrix,De.spotShadowMap.value=X.state.spotShadowMap,De.spotLightMatrix.value=X.state.spotLightMatrix,De.spotLightMap.value=X.state.spotLightMap,De.pointShadowMap.value=X.state.pointShadowMap,De.pointShadowMatrix.value=X.state.pointShadowMatrix);const tt=Re.getUniforms(),Kt=Ho.seqWithValue(tt.seq,De);return N.currentProgram=Re,N.uniformsList=Kt,Re}function Mf(b,F){const H=Ce.get(b);H.outputEncoding=F.outputEncoding,H.instancing=F.instancing,H.skinning=F.skinning,H.morphTargets=F.morphTargets,H.morphNormals=F.morphNormals,H.morphColors=F.morphColors,H.morphTargetsCount=F.morphTargetsCount,H.numClippingPlanes=F.numClippingPlanes,H.numIntersection=F.numClipIntersection,H.vertexAlphas=F.vertexAlphas,H.vertexTangents=F.vertexTangents,H.toneMapping=F.toneMapping}function tv(b,F,H,N,X){F.isScene!==!0&&(F=ee),Se.resetTextureUnits();const ge=F.fog,Ee=N.isMeshStandardMaterial?F.environment:null,Ae=y===null?p.outputEncoding:y.isXRRenderTarget===!0?y.texture.encoding:yr,Le=(N.isMeshStandardMaterial?Rt:Pt).get(N.envMap||Ee),ze=N.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Re=!!N.normalMap&&!!H.attributes.tangent,De=!!H.morphAttributes.position,tt=!!H.morphAttributes.normal,Kt=!!H.morphAttributes.color,Kn=N.toneMapped?p.toneMapping:ci,ji=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,nt=ji!==void 0?ji.length:0,Ne=Ce.get(N),Vl=d.state.lights;if(D===!0&&(G===!0||b!==w)){const Zt=b===w&&N.id===M;E.setState(N,b,Zt)}let pt=!1;N.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==Vl.state.version||Ne.outputEncoding!==Ae||X.isInstancedMesh&&Ne.instancing===!1||!X.isInstancedMesh&&Ne.instancing===!0||X.isSkinnedMesh&&Ne.skinning===!1||!X.isSkinnedMesh&&Ne.skinning===!0||Ne.envMap!==Le||N.fog===!0&&Ne.fog!==ge||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==E.numPlanes||Ne.numIntersection!==E.numIntersection)||Ne.vertexAlphas!==ze||Ne.vertexTangents!==Re||Ne.morphTargets!==De||Ne.morphNormals!==tt||Ne.morphColors!==Kt||Ne.toneMapping!==Kn||Me.isWebGL2===!0&&Ne.morphTargetsCount!==nt)&&(pt=!0):(pt=!0,Ne.__version=N.version);let $i=Ne.currentProgram;pt===!0&&($i=fn(N,F,X));let wf=!1,Ps=!1,Gl=!1;const Nt=$i.getUniforms(),Xi=Ne.uniforms;if(de.useProgram($i.program)&&(wf=!0,Ps=!0,Gl=!0),N.id!==M&&(M=N.id,Ps=!0),wf||w!==b){if(Nt.setValue(W,"projectionMatrix",b.projectionMatrix),Me.logarithmicDepthBuffer&&Nt.setValue(W,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),w!==b&&(w=b,Ps=!0,Gl=!0),N.isShaderMaterial||N.isMeshPhongMaterial||N.isMeshToonMaterial||N.isMeshStandardMaterial||N.envMap){const Zt=Nt.map.cameraPosition;Zt!==void 0&&Zt.setValue(W,Q.setFromMatrixPosition(b.matrixWorld))}(N.isMeshPhongMaterial||N.isMeshToonMaterial||N.isMeshLambertMaterial||N.isMeshBasicMaterial||N.isMeshStandardMaterial||N.isShaderMaterial)&&Nt.setValue(W,"isOrthographic",b.isOrthographicCamera===!0),(N.isMeshPhongMaterial||N.isMeshToonMaterial||N.isMeshLambertMaterial||N.isMeshBasicMaterial||N.isMeshStandardMaterial||N.isShaderMaterial||N.isShadowMaterial||X.isSkinnedMesh)&&Nt.setValue(W,"viewMatrix",b.matrixWorldInverse)}if(X.isSkinnedMesh){Nt.setOptional(W,X,"bindMatrix"),Nt.setOptional(W,X,"bindMatrixInverse");const Zt=X.skeleton;Zt&&(Me.floatVertexTextures?(Zt.boneTexture===null&&Zt.computeBoneTexture(),Nt.setValue(W,"boneTexture",Zt.boneTexture,Se),Nt.setValue(W,"boneTextureSize",Zt.boneTextureSize)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}const Wl=H.morphAttributes;if((Wl.position!==void 0||Wl.normal!==void 0||Wl.color!==void 0&&Me.isWebGL2===!0)&&ie.update(X,H,N,$i),(Ps||Ne.receiveShadow!==X.receiveShadow)&&(Ne.receiveShadow=X.receiveShadow,Nt.setValue(W,"receiveShadow",X.receiveShadow)),N.isMeshGouraudMaterial&&N.envMap!==null&&(Xi.envMap.value=Le,Xi.flipEnvMap.value=Le.isCubeTexture&&Le.isRenderTargetTexture===!1?-1:1),Ps&&(Nt.setValue(W,"toneMappingExposure",p.toneMappingExposure),Ne.needsLights&&nv(Xi,Gl),ge&&N.fog===!0&&qn.refreshFogUniforms(Xi,ge),qn.refreshMaterialUniforms(Xi,N,O,L,B),Ho.upload(W,Ne.uniformsList,Xi,Se)),N.isShaderMaterial&&N.uniformsNeedUpdate===!0&&(Ho.upload(W,Ne.uniformsList,Xi,Se),N.uniformsNeedUpdate=!1),N.isSpriteMaterial&&Nt.setValue(W,"center",X.center),Nt.setValue(W,"modelViewMatrix",X.modelViewMatrix),Nt.setValue(W,"normalMatrix",X.normalMatrix),Nt.setValue(W,"modelMatrix",X.matrixWorld),N.isShaderMaterial||N.isRawShaderMaterial){const Zt=N.uniformsGroups;for(let Hl=0,rv=Zt.length;Hl<rv;Hl++)if(Me.isWebGL2){const Ef=Zt[Hl];ve.update(Ef,$i),ve.bind(Ef,$i)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return $i}function nv(b,F){b.ambientLightColor.needsUpdate=F,b.lightProbe.needsUpdate=F,b.directionalLights.needsUpdate=F,b.directionalLightShadows.needsUpdate=F,b.pointLights.needsUpdate=F,b.pointLightShadows.needsUpdate=F,b.spotLights.needsUpdate=F,b.spotLightShadows.needsUpdate=F,b.rectAreaLights.needsUpdate=F,b.hemisphereLights.needsUpdate=F}function iv(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return m},this.getActiveMipmapLevel=function(){return x},this.getRenderTarget=function(){return y},this.setRenderTargetTextures=function(b,F,H){Ce.get(b.texture).__webglTexture=F,Ce.get(b.depthTexture).__webglTexture=H;const N=Ce.get(b);N.__hasExternalTextures=!0,N.__hasExternalTextures&&(N.__autoAllocateDepthBuffer=H===void 0,N.__autoAllocateDepthBuffer||fe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),N.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(b,F){const H=Ce.get(b);H.__webglFramebuffer=F,H.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(b,F=0,H=0){y=b,m=F,x=H;let N=!0,X=null,ge=!1,Ee=!1;if(b){const Le=Ce.get(b);Le.__useDefaultFramebuffer!==void 0?(de.bindFramebuffer(36160,null),N=!1):Le.__webglFramebuffer===void 0?Se.setupRenderTarget(b):Le.__hasExternalTextures&&Se.rebindTextures(b,Ce.get(b.texture).__webglTexture,Ce.get(b.depthTexture).__webglTexture);const ze=b.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Ee=!0);const Re=Ce.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(X=Re[F],ge=!0):Me.isWebGL2&&b.samples>0&&Se.useMultisampledRTT(b)===!1?X=Ce.get(b).__webglMultisampledFramebuffer:X=Re,T.copy(b.viewport),P.copy(b.scissor),_=b.scissorTest}else T.copy(k).multiplyScalar(O).floor(),P.copy(q).multiplyScalar(O).floor(),_=K;if(de.bindFramebuffer(36160,X)&&Me.drawBuffers&&N&&de.drawBuffers(b,X),de.viewport(T),de.scissor(P),de.setScissorTest(_),ge){const Le=Ce.get(b.texture);W.framebufferTexture2D(36160,36064,34069+F,Le.__webglTexture,H)}else if(Ee){const Le=Ce.get(b.texture),ze=F||0;W.framebufferTextureLayer(36160,36064,Le.__webglTexture,H||0,ze)}M=-1},this.readRenderTargetPixels=function(b,F,H,N,X,ge,Ee){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=Ce.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(Ae=Ae[Ee]),Ae){de.bindFramebuffer(36160,Ae);try{const Le=b.texture,ze=Le.format,Re=Le.type;if(ze!==kn&&le.convert(ze)!==W.getParameter(35739)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const De=Re===Aa&&(fe.has("EXT_color_buffer_half_float")||Me.isWebGL2&&fe.has("EXT_color_buffer_float"));if(Re!==_r&&le.convert(Re)!==W.getParameter(35738)&&!(Re===lr&&(Me.isWebGL2||fe.has("OES_texture_float")||fe.has("WEBGL_color_buffer_float")))&&!De){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=b.width-N&&H>=0&&H<=b.height-X&&W.readPixels(F,H,N,X,le.convert(ze),le.convert(Re),ge)}finally{const Le=y!==null?Ce.get(y).__webglFramebuffer:null;de.bindFramebuffer(36160,Le)}}},this.copyFramebufferToTexture=function(b,F,H=0){const N=Math.pow(2,-H),X=Math.floor(F.image.width*N),ge=Math.floor(F.image.height*N);Se.setTexture2D(F,0),W.copyTexSubImage2D(3553,H,0,0,b.x,b.y,X,ge),de.unbindTexture()},this.copyTextureToTexture=function(b,F,H,N=0){const X=F.image.width,ge=F.image.height,Ee=le.convert(H.format),Ae=le.convert(H.type);Se.setTexture2D(H,0),W.pixelStorei(37440,H.flipY),W.pixelStorei(37441,H.premultiplyAlpha),W.pixelStorei(3317,H.unpackAlignment),F.isDataTexture?W.texSubImage2D(3553,N,b.x,b.y,X,ge,Ee,Ae,F.image.data):F.isCompressedTexture?W.compressedTexSubImage2D(3553,N,b.x,b.y,F.mipmaps[0].width,F.mipmaps[0].height,Ee,F.mipmaps[0].data):W.texSubImage2D(3553,N,b.x,b.y,Ee,Ae,F.image),N===0&&H.generateMipmaps&&W.generateMipmap(3553),de.unbindTexture()},this.copyTextureToTexture3D=function(b,F,H,N,X=0){if(p.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ge=b.max.x-b.min.x+1,Ee=b.max.y-b.min.y+1,Ae=b.max.z-b.min.z+1,Le=le.convert(N.format),ze=le.convert(N.type);let Re;if(N.isData3DTexture)Se.setTexture3D(N,0),Re=32879;else if(N.isDataArrayTexture)Se.setTexture2DArray(N,0),Re=35866;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}W.pixelStorei(37440,N.flipY),W.pixelStorei(37441,N.premultiplyAlpha),W.pixelStorei(3317,N.unpackAlignment);const De=W.getParameter(3314),tt=W.getParameter(32878),Kt=W.getParameter(3316),Kn=W.getParameter(3315),ji=W.getParameter(32877),nt=H.isCompressedTexture?H.mipmaps[0]:H.image;W.pixelStorei(3314,nt.width),W.pixelStorei(32878,nt.height),W.pixelStorei(3316,b.min.x),W.pixelStorei(3315,b.min.y),W.pixelStorei(32877,b.min.z),H.isDataTexture||H.isData3DTexture?W.texSubImage3D(Re,X,F.x,F.y,F.z,ge,Ee,Ae,Le,ze,nt.data):H.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),W.compressedTexSubImage3D(Re,X,F.x,F.y,F.z,ge,Ee,Ae,Le,nt.data)):W.texSubImage3D(Re,X,F.x,F.y,F.z,ge,Ee,Ae,Le,ze,nt),W.pixelStorei(3314,De),W.pixelStorei(32878,tt),W.pixelStorei(3316,Kt),W.pixelStorei(3315,Kn),W.pixelStorei(32877,ji),X===0&&N.generateMipmaps&&W.generateMipmap(Re),de.unbindTexture()},this.initTexture=function(b){b.isCubeTexture?Se.setTextureCube(b,0):b.isData3DTexture?Se.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Se.setTexture2DArray(b,0):Se.setTexture2D(b,0),de.unbindTexture()},this.resetState=function(){m=0,x=0,y=null,de.reset(),Y.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}class C3 extends Y0{}C3.prototype.isWebGL1Renderer=!0;class _f extends on{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.backgroundIntensity=this.backgroundIntensity),n}get autoUpdate(){return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate}set autoUpdate(e){console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate=e}}class A3 extends qt{constructor(e,n,i,r,s,a,o,l,c){super(e,n,i,r,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class _l extends Xn{constructor(e=[new ke(0,-.5),new ke(.5,0),new ke(0,.5)],n=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:n,phiStart:i,phiLength:r},n=Math.floor(n),r=zt(r,0,Math.PI*2);const s=[],a=[],o=[],l=[],c=[],u=1/n,f=new z,d=new ke,g=new z,S=new z,p=new z;let h=0,m=0;for(let x=0;x<=e.length-1;x++)switch(x){case 0:h=e[x+1].x-e[x].x,m=e[x+1].y-e[x].y,g.x=m*1,g.y=-h,g.z=m*0,p.copy(g),g.normalize(),l.push(g.x,g.y,g.z);break;case e.length-1:l.push(p.x,p.y,p.z);break;default:h=e[x+1].x-e[x].x,m=e[x+1].y-e[x].y,g.x=m*1,g.y=-h,g.z=m*0,S.copy(g),g.x+=p.x,g.y+=p.y,g.z+=p.z,g.normalize(),l.push(g.x,g.y,g.z),p.copy(S)}for(let x=0;x<=n;x++){const y=i+x*u*r,M=Math.sin(y),w=Math.cos(y);for(let T=0;T<=e.length-1;T++){f.x=e[T].x*M,f.y=e[T].y,f.z=e[T].x*w,a.push(f.x,f.y,f.z),d.x=x/n,d.y=T/(e.length-1),o.push(d.x,d.y);const P=l[3*T+0]*M,_=l[3*T+1],C=l[3*T+0]*w;c.push(P,_,C)}}for(let x=0;x<n;x++)for(let y=0;y<e.length-1;y++){const M=y+x*e.length,w=M,T=M+e.length,P=M+e.length+1,_=M+1;s.push(w,T,_),s.push(P,_,T)}this.setIndex(s),this.setAttribute("position",new At(a,3)),this.setAttribute("uv",new At(o,2)),this.setAttribute("normal",new At(c,3))}static fromJSON(e){return new _l(e.points,e.segments,e.phiStart,e.phiLength)}}class yf extends Xn{constructor(e=1,n=8,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:n,thetaStart:i,thetaLength:r},n=Math.max(3,n);const s=[],a=[],o=[],l=[],c=new z,u=new ke;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,d=3;f<=n;f++,d+=3){const g=i+f/n*r;c.x=e*Math.cos(g),c.y=e*Math.sin(g),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[d]/e+1)/2,u.y=(a[d+1]/e+1)/2,l.push(u.x,u.y)}for(let f=1;f<=n;f++)s.push(f,f+1,0);this.setIndex(s),this.setAttribute("position",new At(a,3)),this.setAttribute("normal",new At(o,3)),this.setAttribute("uv",new At(l,2))}static fromJSON(e){return new yf(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class ca extends Xn{constructor(e=1,n=.4,i=8,r=6,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:n,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const a=[],o=[],l=[],c=[],u=new z,f=new z,d=new z;for(let g=0;g<=i;g++)for(let S=0;S<=r;S++){const p=S/r*s,h=g/i*Math.PI*2;f.x=(e+n*Math.cos(h))*Math.cos(p),f.y=(e+n*Math.cos(h))*Math.sin(p),f.z=n*Math.sin(h),o.push(f.x,f.y,f.z),u.x=e*Math.cos(p),u.y=e*Math.sin(p),d.subVectors(f,u).normalize(),l.push(d.x,d.y,d.z),c.push(S/r),c.push(g/i)}for(let g=1;g<=i;g++)for(let S=1;S<=r;S++){const p=(r+1)*g+S-1,h=(r+1)*(g-1)+S-1,m=(r+1)*(g-1)+S,x=(r+1)*g+S;a.push(p,h,x),a.push(h,m,x)}this.setIndex(a),this.setAttribute("position",new At(o,3)),this.setAttribute("normal",new At(l,3)),this.setAttribute("uv",new At(c,2))}static fromJSON(e){return new ca(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class K0 extends Ua{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Oe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=R0,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class eu extends K0{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ke(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return zt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(n){this.ior=(1+.4*n)/(1-.4*n)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Oe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Oe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Oe(1,1,1),this.specularColorMap=null,this._sheen=0,this._clearcoat=0,this._iridescence=0,this._transmission=0,this.setValues(e)}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gf);const ot=.04,wi=11*ot,tu=3.2*ot;function L3(t){const e=new _f;e.background=new Oe(197379);const n=(s,a,o,l,c,u,f,d,g,S)=>{const p=new Wn(new Ul(s,a),new Ol({color:new Oe(g).multiplyScalar(S),side:oi}));p.position.set(o,l,c),p.rotation.set(u,f,d),e.add(p)};n(.7,14,-5,2,1,0,Math.PI/2.4,.3,16777215,12),n(.4,14,5,1,-1,0,-Math.PI/2.2,-.5,16777215,10),n(14,.6,0,6,0,Math.PI/2,0,.4,16777215,7),n(.6,12,0,1,6,0,0,.9,14674175,8),n(.3,12,-2,3,-6,0,0,-.7,16769736,7),n(3,14,2.5,3,7,0,0,.35,16777215,1.6),n(10,10,0,7,0,Math.PI/2,0,0,2763306,1);const i=new hd(t),r=i.fromScene(e,.02).texture;return i.dispose(),r}function Z0({word:t=!0}={}){const e=d=>new ke(d[0],d[1]),n=new Qs,i=new eu({color:14211288,metalness:1,roughness:.09,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.5});Object.assign(i,{iridescence:.7,iridescenceIOR:1.5,iridescenceThicknessRange:[250,800]});const r=new Ol({color:16777215,toneMapped:!1}),s=new eu({color:2763824,metalness:.6,roughness:.38,envMapIntensity:.7}),a=new eu({color:328966,roughness:.35,clearcoat:.9,clearcoatRoughness:.06,envMapIntensity:.55}),o=[[.001,0],[wi-.6*ot,0],[wi,.5*ot],[wi,1*ot]].map(e),l=[[wi,1*ot]];for(let d=1;d<=24;d++){const g=d/24;l.push([wi-3.5*ot*(1-Math.cos(g*Math.PI/2)),1*ot+2.2*ot*Math.sin(g*Math.PI/2)])}l.push([.001,tu]);const c=[],u=(d,g,S)=>{c.push(d);const p=new Wn(d,g);return S==null||S(p),n.add(p),p};u(new _l(o,96),s),u(new _l(l.map(e),96),a),u(new ca(wi-.1*ot,.2*ot,16,160),i,d=>{d.rotation.x=Math.PI/2,d.position.y=1*ot}),u(new ca(wi+.04*ot,.12*ot,10,160),r,d=>{d.rotation.x=Math.PI/2,d.position.y=.5*ot,d.scale.z=.8}),u(new ca(6.6*ot,.07*ot,8,140),i,d=>{d.rotation.x=Math.PI/2,d.position.y=tu+.02*ot});let f=null;if(t){const d=document.createElement("canvas");d.width=d.height=256;const g=d.getContext("2d");g.fillStyle="rgba(214,214,214,.9)",g.font="600 60px Manrope, Helvetica, Arial, sans-serif",g.textAlign="center",g.textBaseline="middle",g.fillText("kinn",128,134),f=new A3(d),f.encoding=je,u(new yf(6.2*ot,48),new K0({map:f,transparent:!0,roughness:.4,depthWrite:!1}),S=>{S.rotation.x=-Math.PI/2,S.position.y=tu+.002})}return{group:n,ring:r,dispose:()=>{c.forEach(d=>d.dispose()),[i,r,s,a].forEach(d=>d.dispose()),f==null||f.dispose()}}}function P3(t,e={}){try{const n=new Y0({canvas:t,antialias:!0,alpha:e.alpha??!0,preserveDrawingBuffer:e.preserve??!1});return n.getContext()?(n.outputEncoding=je,n.toneMapping=A0,n.toneMappingExposure=1.3,n):null}catch{return null}}let To;function Q0(){if(To!==void 0)return To;const t=P3(void 0,{alpha:!0,preserve:!0});return To=t?{r:t,env:L3(t)}:null,To}const Co=new Map;function R3(t){if(Co.has(t))return Co.get(t);const e=Q0();if(!e)return Co.set(t,null),null;const{r:n,env:i}=e;n.setPixelRatio(1),n.setSize(t,t,!1),n.setClearColor(0,0);const r=new _f;r.environment=i;const s=Z0({word:!1});s.group.rotation.x=.16,r.add(s.group);const a=new nn(20,1,.1,20);a.position.set(0,2.62,.02),a.lookAt(0,0,0),n.render(r,a);const o=n.domElement.toDataURL("image/png");return s.dispose(),Co.set(t,o),o}const D3=1.5,Zi=2,qp=3,Yp=3.6,N3=()=>{var t;return typeof window<"u"&&!!((t=window.matchMedia)!=null&&t.call(window,"(prefers-reduced-motion: reduce)").matches)},k3=(t,e=0,n=1)=>Math.min(n,Math.max(e,t)),Ao=(t,e,n)=>k3((t-e)/(n-e)),Kp=t=>1-(1-t)**3,js=(t,e,n)=>t+(e-t)*n,nu=5.2,iu=30,Zp=.4;function I3({headline:t,sub:e,onDone:n}){const i=ye.useRef(null),r=ye.useRef(null),[s,a]=ye.useState("float"),[o,l]=ye.useState({w:338,h:718}),c=ye.useMemo(N3,[]),u=ye.useRef(n);u.current=n,ye.useEffect(()=>{const h=i.current;h&&l({w:h.clientWidth,h:h.clientHeight})},[]),ye.useEffect(()=>{const h=r.current,m=i.current;if(!h||!m)return;const x=m.clientWidth,y=m.clientHeight,M=c?null:Q0();let w=0;const T=[];if(!M)return a("click"),T.push(window.setTimeout(()=>a("open"),1100)),T.push(window.setTimeout(()=>u.current(),1600)),()=>T.forEach(clearTimeout);const{r:P,env:_}=M;P.setPixelRatio(Math.min(devicePixelRatio,2)),P.setSize(x,y,!1),P.setClearColor(0,0),h.appendChild(P.domElement),P.domElement.className="opening-canvas";const C=new _f;C.environment=_;const L=Z0({word:!0});C.add(L.group);const O=new nn(iu,x/y,.1,50),re=2*nu*Math.tan(iu/2*Math.PI/180),V=(Zp-.5)*re;O.position.set(0,V,nu),O.lookAt(0,V,0),P.compile(C,O);const k=new Oe(4053944),q=new Oe(16777215);let K=-1,Z="";const D=G=>{K<0&&(K=G);const B=(G-K)/1e3,I=L.group,U=Kp(Ao(B,D3,Zi)),Q=Math.sin(B*2.1)*.05*(1-U);I.rotation.x=js(Math.PI/2-.42+Math.sin(B*1.3)*.06,Math.PI/2,U),I.rotation.y=js(Math.sin(B*.9)*.45,0,U),I.rotation.z=js(Math.sin(B*.7)*.12,0,U),I.position.y=Q+js(.08,0,U),I.position.z=js(.35,0,U);const ee=Ao(B,Zi-.06,Zi+.22),ae=ee>0&&ee<1?Math.sin(ee*Math.PI)*.06:0;I.scale.setScalar(1-ae);const W=Kp(Ao(B,qp,Yp));I.position.z-=W*2.5,I.position.y+=W*.3,L.ring.color.copy(q).lerp(k,Ao(B,Zi-.05,Zi+.1)),P.render(C,O);const be=B<Zi?"float":B<Zi+.25?"click":B<qp?"traces":"open";be!==Z&&(Z=be,a(be)),B<Yp?w=requestAnimationFrame(D):u.current()};return w=requestAnimationFrame(D),()=>{cancelAnimationFrame(w),L.dispose(),P.domElement.remove()}},[c]);const f=2*nu*Math.tan(iu/2*Math.PI/180),d=wi/f*o.h,g=o.w/2,S=o.h*Zp,p=ye.useMemo(()=>F3(g,S,d,o.w,o.h),[g,S,d,o.w,o.h]);return v.jsxs("div",{ref:i,className:`opening phase-${s}${c?" reduced":""}`,onClick:()=>u.current(),role:"presentation",children:[v.jsxs("svg",{className:"opening-traces",width:o.w,height:o.h,viewBox:`0 0 ${o.w} ${o.h}`,"aria-hidden":"true",children:[v.jsxs("defs",{children:[v.jsxs("filter",{id:"glow",x:"-20%",y:"-20%",width:"140%",height:"140%",children:[v.jsx("feGaussianBlur",{stdDeviation:"2.4",result:"b"}),v.jsxs("feMerge",{children:[v.jsx("feMergeNode",{in:"b"}),v.jsx("feMergeNode",{in:"SourceGraphic"})]})]}),v.jsxs("radialGradient",{id:"corner",children:[v.jsx("stop",{offset:"0",stopColor:"#3ddbb8",stopOpacity:".55"}),v.jsx("stop",{offset:"1",stopColor:"#3ddbb8",stopOpacity:"0"})]})]}),v.jsx("circle",{className:"shock",cx:g,cy:S,r:d,fill:"none",stroke:"#3ddbb8",strokeWidth:"2"}),p.map((h,m)=>v.jsxs("g",{style:{"--d":`${h.delay}s`,"--len":h.len},children:[v.jsx("path",{className:`trace${h.thin?" thin":""}`,d:h.d}),v.jsx("path",{className:"pulse",d:h.d,filter:"url(#glow)"})]},m)),[[0,0],[o.w,0],[0,o.h],[o.w,o.h]].map(([h,m],x)=>v.jsx("circle",{className:"corner",cx:h,cy:m,r:90,fill:"url(#corner)"},x))]}),v.jsx("div",{ref:r,className:"opening-canvas-host"}),c&&v.jsx("div",{className:"opening-static-coin","aria-hidden":"true"}),v.jsxs("div",{className:"opening-words",children:[v.jsx("p",{className:"opening-headline",children:t}),v.jsx("p",{className:"opening-sub",children:e})]}),v.jsx("span",{className:"opening-skip",children:"Tap to skip"})]})}function F3(t,e,n,i,r){const s=[];return[[0,0],[i,0],[0,r],[i,r]].forEach(([o,l],c)=>{[-1,0,1].forEach(u=>{const f=Math.atan2(l-e,o-t)+u*.16,d=t+Math.cos(f)*(n+4),g=e+Math.sin(f)*(n+4),S=d+Math.cos(f)*22,p=g+Math.sin(f)*22,h=o===0?14+u*9+9:i-14-u*9-9,m=[[d,g],[S,p]],x=Math.abs(h-S);m.push([h,p+Math.sign(l-p)*x]);const y=p+Math.sign(l-p)*x,M=l===0?10:r-10,w=Math.max(2,Math.floor(Math.abs(M-y)/16));for(let P=1;P<=w;P++){const _=y+(M-y)*P/w;m.push([h+(P%2?5:-5)*(u===0?1:.6),_])}m.push([o===0?2:i-2,l===0?2:r-2]);let T=0;for(let P=1;P<m.length;P++)T+=Math.hypot(m[P][0]-m[P-1][0],m[P][1]-m[P-1][1]);s.push({d:m.map(([P,_],C)=>`${C?"L":"M"}${P.toFixed(1)},${_.toFixed(1)}`).join(" "),len:Math.round(T),delay:.04*c+.05*Math.abs(u),thin:u!==0})})}),s}const ru=7,su=23,z3=[0,0,0,0,0,0,0,.25,.45,.4,.35,.4,.55,.4,.35,.45,.6,1,.7,.55,.45,.35,.2,0];function O3(t,e){const n=ff(t.day*104729+11),{flexDeg:i,deepBends:r}=_s(t),s=z3.map((u,f)=>f>=ru&&f<su?Math.max(.05,u*(.75+n.next()*.5)):0),a=s.indexOf(Math.max(...s)),o=s[a],l=s.map((u,f)=>({hour:f,worn:f>=ru&&f<su,load:u/o,peak:u?Math.round(i*(.55+.45*(u/o))):0}));l[a].peak=i;const c=e===null?0:l.reduce((u,f)=>u+(f.peak>e?Math.round(3+(f.peak-e)*1.5):0),0);return{hours:l,peak:i,peakHour:a,deepBends:r,minutesPastLine:c,wornHours:su-ru}}function U3(t,e,n){if(n<3||t.call==="learning")return null;const i=y0(e,n);return Yt.map(r=>{const s=t.weights[xr(Ot.group,r)]*i[r];return{sensor:r,label:xs[r],weight:s,effect:s>.12?"raises":s<-.12?"lowers":"neutral"}}).sort((r,s)=>Math.abs(s.weight)-Math.abs(r.weight))}const au=t=>t===0?"12a":t<12?`${t}a`:t===12?"12p":`${t-12}p`;function J0(t){return t<=14?{name:"Heel slides",cue:"Slide your heel toward you, hold, slide back.",holdS:2}:t<=28?{name:"Wall slides",cue:"Back to the wall, slide down, hold, push up.",holdS:2}:{name:"Step-downs",cue:"Lower slowly from the step, hold, stand tall.",holdS:2}}const Js=10,B3=3;function V3(t,e){const n=J0(t),i=Math.max(70,Math.min(120,(e??100)-8)),r=ff(t*7919+17),s=Array.from({length:Js},(a,o)=>{const l=o>=7?(o-6)*3:0;return{peak:Math.round(i+r.normal(1,2.5)-l),holdMs:Math.round(Math.max(800,n.holdS*1e3+r.normal(250,350)-l*120))}});return{exercise:n,target:i,reps:s}}const jo=900,$o=700,md=500,G3=t=>jo+t.holdMs+$o+md,W3=t=>t.reps.reduce((e,n)=>e+G3(n),0),Qp=t=>t<.5?2*t*t:1-(-2*t+2)**2/2;function H3(t,e){let n=e;for(let i=0;i<t.reps.length;i++){const r=t.reps[i];if(n<jo)return{bend:Math.round(r.peak*Qp(n/jo)),done:i,current:i,phase:"rise"};if(n-=jo,n<r.holdMs)return{bend:r.peak,done:i,current:i,phase:"hold"};if(n-=r.holdMs,n<$o)return{bend:Math.round(r.peak*(1-Qp(n/$o))),done:i,current:i,phase:"lower"};if(n-=$o,n<md)return{bend:0,done:i+1,current:i,phase:"rest"};n-=md}return{bend:0,done:t.reps.length,current:t.reps.length,phase:"done"}}const gd=(t,e)=>t.peak>=e-B3;function j3(t,e){const n=t.reps.slice(0,e),i=n.filter(a=>gd(a,t.target)).length,r=n.length?Math.round(n.reduce((a,o)=>a+o.holdMs,0)/n.length/1e3*10)/10:0;let s=null;for(let a=n.length-1;a>=0&&!gd(n[a],t.target);a--)s=a+1;return{reps:n.length,fullRange:i,avgHoldS:r,firstTired:s!==null&&s<n.length?s:null}}function $3(t,e,n){return gd(t,e)?t.holdMs<n*1e3-300?"Full range. Hold it a beat longer.":"Full range. Good hold.":"A little deeper next time."}const X3=225,q3=270,Jp=150,em=54;function Sf({call:t,line:e,live:n=null,size:i=250}){const[r,s]=ye.useState(void 0);ye.useEffect(()=>{const m=requestAnimationFrame(()=>s(R3(Math.round(i*1.3))));return()=>cancelAnimationFrame(m)},[i]);const a=i/2,o=i*.47,l=i*.4,c=i*.62,u=(m,x)=>{const y=(X3-m/Jp*q3)*Math.PI/180;return[a+x*Math.cos(y),a-x*Math.sin(y)]},f=t==="learning"||e===null,d=n!==null?n:f?0:e,g=n!==null&&e!==null&&n>e,S=Array.from({length:em+1},(m,x)=>{const y=x/em*Jp,[M,w]=u(y,l),[T,P]=u(y,o);let _="seg";return y<=d?_+=n!==null?e!==null&&y>e?" on call-rest":" on call-push":` on call-${t}`:e!==null&&y>e&&(_+=" over"),v.jsx("line",{className:_,x1:M,y1:w,x2:T,y2:P},x)}),p=e!==null?[u(e,l-i*.035),u(e,o+i*.035)]:null,h=n!==null?g?"rest":"push":t;return v.jsxs("div",{className:`coin-dial glow-${h}`,style:{width:i,height:i},children:[v.jsxs("svg",{viewBox:`0 0 ${i} ${i}`,width:i,height:i,"aria-hidden":"true",children:[v.jsx("g",{strokeLinecap:"round",strokeWidth:i*.016,children:S}),p&&v.jsx("line",{className:"dial-tick",x1:p[0][0],y1:p[0][1],x2:p[1][0],y2:p[1][1],strokeWidth:i*.022,strokeLinecap:"round"})]}),v.jsxs("div",{className:"dial-coin",style:{width:c,height:c},children:[r?v.jsx("img",{src:r,alt:"",width:c,height:c}):v.jsx("span",{className:"flat-coin"}),v.jsx("div",{className:"dial-face",children:f&&n===null?v.jsx("span",{className:"dial-label",children:"No line yet"}):v.jsxs(v.Fragment,{children:[v.jsxs("span",{className:"dial-num",style:{fontSize:i*.17},children:[n??e,"°"]}),v.jsx("span",{className:"dial-label",children:n!==null?g?"Past your line":"Bend now":"Your line"})]})})]}),v.jsxs("span",{className:`dial-call ${n!==null?g?"call-rest":"call-push":`call-${t}`}`,children:[v.jsx(ev,{call:n!==null?g?"rest":"push":t}),n!==null?g?"Ease off":"Live":td[t]]})]})}function ev({call:t}){return v.jsxs("svg",{viewBox:"0 0 16 16",width:"14",height:"14","aria-hidden":"true",className:"call-shape",children:[t==="push"&&v.jsx("path",{d:"M3.5 10.5 8 6l4.5 4.5",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round"}),t==="ease"&&v.jsx("rect",{x:"2.5",y:"6.5",width:"11",height:"3",rx:"1.5",fill:"currentColor"}),t==="rest"&&v.jsx("circle",{cx:"8",cy:"8",r:"4.5",fill:"currentColor"}),t==="learning"&&v.jsx("circle",{cx:"8",cy:"8",r:"5.5",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeDasharray:"1.5 2.6",strokeLinecap:"round"})]})}const Y3=t=>Math.ceil(t/7);function K3({m:t,devices:e,onStart:n}){return v.jsxs("div",{className:"screen center-screen",children:[v.jsx("img",{className:"start-logo",src:"/learn/brand/kinn-lockup-ceramic.svg",width:82,height:24,alt:"kinn"}),v.jsxs("div",{className:"fill center",children:[v.jsx(Sf,{call:t.call,line:t.line,size:236}),e>0?v.jsxs(v.Fragment,{children:[v.jsxs("h2",{className:"headline",children:["Kinn starts from ",xn(e)," recoveries like yours."]}),v.jsxs("p",{className:"body muted",children:["Your first line is ",t.line,"°. It becomes more yours with every day you wear the strip and every night you check in."]})]}):v.jsxs(v.Fragment,{children:[v.jsx("h2",{className:"headline",children:"Kinn starts from scratch."}),v.jsx("p",{className:"body muted",children:"No one has worn Kinn before you, so the first days are guesses. It learns from every check-in."})]})]}),v.jsx("button",{type:"button",className:"btn",onClick:n,children:"Start day 1"})]})}function Z3({run:t,m:e,day:n,liveBend:i,onCheckIn:r,onSession:s,onDay:a}){const{battery:o}=M0(n),l=n>1?O3(t.days[n-2],t.mornings[n-2].line):null,c=by(t.days,n,"fatiguePct"),u=U3(e,t.days,n);return v.jsxs("div",{className:"screen today",children:[v.jsxs("div",{className:"today-top",children:[v.jsx(gy,{size:20}),v.jsxs("span",{className:"eyebrow",children:["Day ",n," · Week ",Y3(n)]}),v.jsxs("span",{className:"coin-chip",children:[v.jsx("span",{className:"live-dot","aria-hidden":"true"}),o,"%"]})]}),v.jsx(Q3,{run:t,day:n,onDay:a}),v.jsx("div",{className:"center dial-stage",children:v.jsx(Sf,{call:e.call,line:e.line,live:i,size:250})}),v.jsx("p",{className:"body center-text",children:z_(e)}),u&&v.jsx(J3,{drivers:u}),l&&v.jsx(eE,{d:l,line:t.mornings[n-2].line,fatigue:c}),e.call==="rest"?v.jsx("div",{className:"session-card rest-day",children:v.jsxs("span",{children:[v.jsx("span",{className:"label",children:"Today’s session"}),v.jsx("span",{className:"body-strong",children:"Rest day. No session today."})]})}):v.jsxs("button",{type:"button",className:"session-card",onClick:s,disabled:e.call==="learning",children:[v.jsxs("span",{children:[v.jsx("span",{className:"label",children:"Today’s session"}),v.jsxs("span",{className:"body-strong",children:[J0(n).name," · 10 reps"]})]}),v.jsx("span",{className:"btn-signal small",children:"Start"})]}),v.jsxs("button",{type:"button",className:"tonight",onClick:r,children:[v.jsx("span",{className:"label",children:"Tonight"}),v.jsx("span",{className:"body-strong",children:"Check in after your day"})]})]})}function Q3({run:t,day:e,onDay:n}){const i=Math.max(1,e-6),r=Array.from({length:7},(s,a)=>i+a);return v.jsx("div",{className:"week-strip",role:"list","aria-label":"Your last seven days",children:r.map(s=>{if(s>e)return v.jsxs("span",{role:"listitem",className:"wday future","aria-label":`Day ${s}, still to come`,children:[v.jsx("span",{className:"wday-n",children:s}),v.jsx("span",{className:"wday-dot"}),v.jsx("span",{className:"wday-flare"})]},s);const a=t.mornings[s-1],o=s<e&&t.days[s-1].flare;return v.jsxs("button",{type:"button",role:"listitem",className:`wday call-${a.call}${s===e?" today":""}`,onClick:()=>n(s),"aria-label":`Day ${s}: ${a.call}${o?", flare-up":""}`,"aria-current":s===e?"date":void 0,children:[v.jsx("span",{className:"wday-n",children:s}),v.jsx("span",{className:"wday-dot",children:v.jsx(ev,{call:a.call})}),v.jsx("span",{className:`wday-flare${o?" on":""}`,"aria-hidden":"true"})]},s)})})}function J3({drivers:t}){const e=Math.max(.6,...t.map(n=>Math.abs(n.weight)));return v.jsxs("section",{className:"card",children:[v.jsx("p",{className:"label",children:"Behind today’s call"}),t.slice(0,3).map(n=>v.jsxs("div",{className:"driver",children:[v.jsx("span",{className:"driver-name",children:n.label}),v.jsx("span",{className:"driver-bar","aria-hidden":"true",children:v.jsx("i",{className:n.effect,style:{width:`${Math.abs(n.weight)/e*50}%`,[n.weight>=0?"left":"right"]:"50%"}})}),v.jsx("span",{className:`driver-effect ${n.effect}`,children:n.effect==="raises"?"Raises risk":n.effect==="lowers"?"Lowers risk":"No effect"})]},n.sensor)),v.jsx("p",{className:"caption",children:"From your own model: each signal’s pull on a day like your recent ones."})]})}function eE({d:t,line:e,fatigue:n}){return v.jsxs("section",{className:"card",children:[v.jsxs("div",{className:"card-head",children:[v.jsx("p",{className:"label",children:"Yesterday on the strip"}),v.jsxs("span",{className:"caption",children:["peak at ",au(t.peakHour)]})]}),v.jsx("div",{className:"ribbon","aria-label":`Bending through yesterday, peaking at ${t.peak}° around ${au(t.peakHour)}`,children:t.hours.map(i=>v.jsx("i",{className:i.worn?e!==null&&i.peak>e?"past":"":"off",style:{height:`${i.worn?12+i.load*88:6}%`},title:i.worn?`${au(i.hour)}: up to ${i.peak}°`:void 0},i.hour))}),v.jsxs("div",{className:"ribbon-axis","aria-hidden":"true",children:[v.jsx("span",{children:"12a"}),v.jsx("span",{children:"6a"}),v.jsx("span",{children:"12p"}),v.jsx("span",{children:"6p"}),v.jsx("span",{children:"12a"})]}),v.jsxs("div",{className:"mini-grid",children:[v.jsxs("div",{children:[v.jsxs("span",{className:"metric small",children:[t.peak,"°"]}),v.jsx("span",{className:"caption",children:"peak bend"})]}),v.jsxs("div",{children:[v.jsxs("span",{className:`metric small${t.minutesPastLine?" call-rest":""}`,children:[t.minutesPastLine,"m"]}),v.jsx("span",{className:"caption",children:"past your line"})]}),v.jsxs("div",{children:[v.jsx("span",{className:"metric small",children:t.deepBends}),v.jsx("span",{className:"caption",children:"deep bends"})]}),v.jsxs("div",{children:[v.jsx("span",{className:"metric small",children:(n==null?void 0:n.value)??"—"}),v.jsx("span",{className:"caption",children:"muscle fatigue"})]})]}),n&&v.jsxs("p",{className:"caption",children:["Muscle fatigue was ",n.note.toLowerCase(),"."]})]})}const tE=2;function nE({m:t,day:e,onBack:n}){const i=ye.useMemo(()=>V3(e,t.line),[e,t.line]),r=W3(i),[s,a]=ye.useState(0),[o,l]=ye.useState(!1),c=ye.useRef(null);ye.useEffect(()=>{if(!o)return;let p=0;const h=m=>{c.current!==null&&a(x=>Math.min(r,x+(m-c.current)*tE)),c.current=m,p=requestAnimationFrame(h)};return p=requestAnimationFrame(h),()=>{cancelAnimationFrame(p),c.current=null}},[o,r]);const u=H3(i,s),f=u.phase==="done";ye.useEffect(()=>{f&&l(!1)},[f]);const d=j3(i,u.done),g=u.done>0?i.reps[u.done-1]:null,S=s===0?i.exercise.cue:f?null:u.phase==="hold"?"Hold it.":g&&u.phase!=="rise"?$3(g,i.target,i.exercise.holdS):"Bend.";return f?v.jsxs("div",{className:"screen",children:[v.jsx(Ca,{label:"Today",onClick:n}),v.jsx("p",{className:"eyebrow",children:"Session done"}),v.jsxs("h2",{className:"headline",children:[d.fullRange," of ",Js," reps hit full range."]}),v.jsxs("div",{className:"stats",children:[v.jsx(Br,{value:`${d.fullRange}/${Js}`,label:"full range"}),v.jsx(Br,{value:`${d.avgHoldS}s`,label:"avg hold"}),v.jsx(Br,{value:`${i.target}°`,label:"target"})]}),v.jsx("p",{className:"body muted",children:d.firstTired?`Your quad tired from rep ${d.firstTired}: the muscle sensor saw it before the reps got shorter. Kinn adds that to what it knows about your fatigue.`:"Every rep held its range to the end. Kinn adds this session to what it knows about you."}),v.jsx("button",{type:"button",className:"btn",onClick:n,children:"Done"})]}):v.jsxs("div",{className:"screen",children:[v.jsx(Ca,{label:"Today",onClick:n}),v.jsxs("p",{className:"eyebrow",children:["Session · ",i.exercise.name," to ",i.target,"°"]}),v.jsx("div",{className:"center",children:v.jsx(Sf,{call:"push",line:t.line,live:u.bend,size:230})}),v.jsxs("div",{className:"stats",children:[v.jsx(Br,{value:`${Math.min(u.done,Js)}/${Js}`,label:"reps"}),v.jsx(Br,{value:String(d.fullRange),label:"full range"}),v.jsx(Br,{value:d.reps?`${d.avgHoldS}s`:"—",label:"avg hold"})]}),v.jsx("p",{className:"cue","aria-live":"polite",children:S}),v.jsxs("div",{className:"session-actions",children:[v.jsx("button",{type:"button",className:o?"btn ghost":"btn-signal",onClick:()=>l(p=>!p),children:o?"Pause":s>0?"Resume":"Start session"}),s>0&&v.jsx("button",{type:"button",className:"btn ghost",onClick:()=>a(r),children:"End"})]})]})}function Br({value:t,label:e}){return v.jsxs("div",{className:"stat",children:[v.jsx("span",{className:"metric",children:t}),v.jsx("span",{className:"caption",children:e})]})}const iE={start:null,today:"today",session:"today",checkin:"today",learned:"learned",week:"learned",you:"you"};function rE({run:t,day:e,fleet:n,screen:i,onScreen:r,liveBend:s,onCheckIn:a,result:o,onNextDay:l,onDay:c,opening:u,onOpened:f}){const d=t.mornings[e-1],g=e>1?t.mornings[e-2]:null,S=s!==null&&d.line!==null&&s>d.line&&i==="today",p=iE[i];let h;switch(i){case"start":h=v.jsx(K3,{m:d,devices:n.devices,onStart:()=>r("today")});break;case"session":h=v.jsx(nE,{m:d,day:e,onBack:()=>r("today")},e);break;case"checkin":h=o&&o.day===e?v.jsx(Sy,{result:o,onNextDay:l}):v.jsx(yy,{day:e,onCheckIn:a,onBack:()=>r("today")});break;case"learned":h=v.jsx(Ty,{run:t,m:d,day:e,fleet:n,onWeek:()=>r("week")});break;case"week":h=v.jsx(Ly,{run:t,day:e,onBack:()=>r("learned")});break;case"you":h=v.jsx(Py,{day:e});break;default:h=v.jsx(Z3,{run:t,m:d,day:e,liveBend:s,onCheckIn:()=>r("checkin"),onSession:()=>r("session"),onDay:c})}return v.jsx("div",{className:"phone kinn-app","aria-label":"Kinn app",children:v.jsxs("div",{className:"phone-screen",children:[v.jsxs("div",{className:"status-bar","aria-hidden":"true",children:[v.jsx("span",{children:"9:41"}),v.jsx("span",{className:"island"}),v.jsxs("span",{className:"status-icons",children:[v.jsx("i",{}),v.jsx("i",{}),v.jsx("i",{}),v.jsx("b",{})]})]}),S&&v.jsxs("div",{className:"buzz",role:"alert",children:[v.jsx("span",{className:"buzz-ring","aria-hidden":"true"}),v.jsxs("span",{children:[v.jsx("strong",{children:"Past your line"}),v.jsxs("span",{children:[s,"° is over your ",d.line,"° line. Ease off."]})]})]}),v.jsx("div",{className:"app-body",children:h},`${i}-${e}-${(u==null?void 0:u.id)??0}`),u&&v.jsx(I3,{headline:u.kind==="first"?"Hi. Let’s learn your knee.":wy(d),sub:u.kind==="first"?"Coin connected. Strip on your right knee.":`Day ${e}. ${My(d,g)}`,onDone:f},u.id),p&&v.jsxs("nav",{className:"tab-bar","aria-label":"App sections",children:[v.jsx(ou,{active:p==="today",label:"Today",icon:v.jsx(vy,{}),onClick:()=>r("today")}),v.jsx(ou,{active:p==="learned",label:"Learned",icon:v.jsx(xy,{}),onClick:()=>r("learned")}),v.jsx(ou,{active:p==="you",label:"You",icon:v.jsx(_y,{}),onClick:()=>r("you")})]})]})})}function ou({active:t,label:e,icon:n,onClick:i}){return v.jsxs("button",{type:"button",className:t?"tab active":"tab","aria-current":t?"page":void 0,onClick:i,children:[n,v.jsx("span",{children:e})]})}const ir=F_,Vr=ly(ir),lu=ir.fleets.length-1,sE=()=>{var t;return typeof window<"u"&&((t=window.matchMedia)==null?void 0:t.call(window,"(prefers-reduced-motion: reduce)").matches)};function aE(){const[t,e]=ye.useState(0),[n,i]=ye.useState(1),[r,s]=ye.useState(lu),[a,o]=ye.useState(Vr[0].screen),[l,c]=ye.useState("phone"),[u,f]=ye.useState({}),[d,g]=ye.useState(null),[S,p]=ye.useState(null),[h,m]=ye.useState(!1),[x,y]=ye.useState({id:1,kind:"first"}),M=ir.fleets[r],w=ye.useMemo(()=>Vo(M.weights,M.devices,u),[M,u]),T=ye.useCallback(L=>{const O=Vr[L];e(L),i(O.day),s(O.fleetIndex),o(O.screen),c(O.focus),m(!1),g(null)},[]);ye.useEffect(()=>{const L=O=>{O.target.closest("input, textarea, select")||(O.key==="ArrowRight"&&T(Math.min(Vr.length-1,t+1)),O.key==="ArrowLeft"&&T(Math.max(0,t-1)))};return window.addEventListener("keydown",L),()=>window.removeEventListener("keydown",L)},[T,t]),ye.useEffect(()=>{if(!h)return;if(n>=Ln){m(!1);return}const L=window.setTimeout(()=>i(O=>Math.min(Ln,O+1)),sE()?0:380);return()=>window.clearTimeout(L)},[h,n]);const P=async L=>{const O="text"in L?await H_(L.text):{feel:L.feel,pain:null,activity:null,summary:"",readBy:"tap"};O.summary||(O.summary=O.feel==="flare"?"Your knee flared up today.":O.feel==="sore"?"A bit sore, normal for rehab.":"Your knee felt good today.");const re=O_(O),V={...u,[n]:re},k=Math.min(Ln,n+1)-1,q=Vo(M.weights,M.devices,V),K=Vo(M.weights,M.devices,{...u,[n]:!re}).mornings[k];f(V),g({day:n,checkin:O,after:q.mornings[k],other:K,risk:q.steps[n-1].risk})},_=Vr[t],C=Object.keys(u).length;return v.jsxs("div",{className:"page",children:[v.jsxs("header",{className:"top",children:[v.jsx("a",{className:"wordmark",href:"/","aria-label":"Kinn home",children:v.jsx("img",{src:"/learn/brand/kinn-lockup-ceramic.svg",width:75,height:22,alt:""})}),v.jsx("span",{className:"top-sub",children:"How Kinn learns"}),v.jsx("span",{className:"pill",children:"Simulated data"}),v.jsxs("nav",{className:"top-nav","aria-label":"Kinn site",children:[v.jsx("a",{href:"/",children:"Home"}),v.jsx("a",{href:"/progress/",children:"Progress"}),v.jsx("a",{href:"/#join",children:"Join waitlist"})]})]}),v.jsxs("section",{className:"intro",children:[v.jsxs("h1",{children:["Every Kinn gets smarter.",v.jsx("br",{}),v.jsx("span",{className:"dim",children:"From you, and from everyone."})]}),v.jsx("p",{className:"lede",children:"The strip measures how you move all day. Each check-in teaches your phone what pushes your knee too far, and each night every phone shares what it learned, never the readings, so the next person starts smarter."})]}),v.jsxs("main",{className:"stage",children:[v.jsxs("aside",{className:"story","aria-label":"Walkthrough",children:[v.jsx("ol",{className:"steps",children:Vr.map((L,O)=>v.jsxs("li",{children:[v.jsxs("button",{type:"button",className:O===t?"step active":"step","aria-current":O===t?"step":void 0,onClick:()=>T(O),children:[v.jsx("span",{className:"step-n",children:O+1}),v.jsx("span",{className:"step-title",children:L.title})]}),O===t&&v.jsx("p",{className:"step-body",children:L.body})]},L.id))}),v.jsxs("div",{className:"step-nav",children:[v.jsx("button",{type:"button",className:"ghost",disabled:t===0,onClick:()=>T(t-1),children:"← Back"}),v.jsx("button",{type:"button",className:"solid",disabled:t===Vr.length-1,onClick:()=>T(t+1),children:"Next →"})]}),v.jsxs("div",{className:"controls",children:[v.jsxs("div",{className:"control",children:[v.jsxs("div",{className:"control-head",children:[v.jsx("label",{htmlFor:"day",children:"Day"}),v.jsxs("span",{className:"control-value",children:[n," of ",Ln]})]}),v.jsxs("div",{className:"control-row",children:[v.jsx("button",{type:"button",className:"play","aria-label":h?"Pause":"Play the days",onClick:()=>{n>=Ln&&i(1),m(L=>!L),g(null),o(L=>L==="start"||L==="session"?"today":L)},children:h?"❚❚":"▶"}),v.jsx("input",{id:"day",type:"range",min:1,max:Ln,value:n,onChange:L=>{i(Number(L.target.value)),g(null),o(O=>O==="start"?"today":O)}})]})]}),v.jsxs("div",{className:"control",children:[v.jsxs("div",{className:"control-head",children:[v.jsx("label",{htmlFor:"fleet",children:"Wearers Kinn learned from"}),v.jsx("span",{className:"control-value",children:xn(M.devices)})]}),v.jsx("input",{id:"fleet",type:"range",min:0,max:lu,step:1,value:r,"aria-valuetext":`${xn(M.devices)} wearers`,onChange:L=>{s(Number(L.target.value)),g(null)}}),v.jsx("div",{className:"ticks","aria-hidden":"true",children:ir.fleetSizes.map(L=>v.jsx("span",{children:L>=1e3?`${L/1e3}k`:L},L))})]}),C>0&&v.jsxs("button",{type:"button",className:"link-button",onClick:()=>{f({}),g(null)},children:["Undo your ",C," check-in",C===1?"":"s"]})]})]}),v.jsxs("div",{className:"phone-col",children:[v.jsx(rE,{run:w,day:n,fleet:M,screen:a,onScreen:L=>{o(L),L!=="checkin"&&g(null)},liveBend:S,onCheckIn:P,result:d,onNextDay:()=>{i(L=>Math.min(Ln,L+1)),g(null),o("today"),n<Ln&&y({id:Date.now(),kind:"morning"})},onDay:L=>{i(L),g(null)},opening:x,onOpened:()=>y(null)}),v.jsxs("p",{className:"phone-note",children:[_.focus==="phone"?"This is the app. Tap around.":"The app updates as you drag."," ",v.jsx("button",{type:"button",className:"link-button",onClick:()=>y({id:Date.now(),kind:n===1?"first":"morning"}),children:"Replay the opening"})]})]}),v.jsx(fy,{curves:ir,fleetIndex:r,run:w,day:n,focus:l,liveBend:S,onLiveBend:p})]}),v.jsxs("footer",{className:"foot",children:[v.jsxs("details",{children:[v.jsx("summary",{children:"How the learning works"}),v.jsxs("div",{className:"how",children:[v.jsxs("p",{children:[v.jsx("strong",{children:"The model."})," A small logistic model estimates the chance that a day’s movement leads to a flare-up, from four signals: how far the knee bends (printed stretch traces), how many deep bends (stretch and motion), muscle fatigue (a muscle sensor over the quad) and warmth at the knee (skin temperature). Each kind of recovery has its own weights."]}),v.jsxs("p",{children:[v.jsx("strong",{children:"On the phone."})," Every morning the model makes its call before it knows how the day will go. The evening check-in is the answer, and the model takes one learning step from it, held close to the fleet model so a few odd days can’t send it off course."]}),v.jsxs("p",{children:[v.jsx("strong",{children:"Across phones."})," Each night is a round of federated averaging: phones start from the fleet model, learn on their own days, and send back only the new weights (",xn(ir.fleets[lu].weights.length)," numbers). The fleet averages them and sends the result to every phone and to tomorrow’s newcomers."]}),v.jsxs("p",{children:[v.jsx("strong",{children:"Scoring."})," “Right” is balanced accuracy: the average of flare-ups it warned about and calm days it called calm, so a model that always warns, or never does, scores 50%. Numbers come from ",xn(ir.newcomers)," simulated newcomers the fleet never saw."]}),v.jsxs("p",{children:[v.jsx("strong",{children:"What’s simulated."})," The wearers, readings and outcomes are simulated so the learning can be shown end to end; the math is the real thing. Kinn is in development and is not a medical device: it tracks and suggests, it doesn’t diagnose or treat."]})]})]}),v.jsx("p",{className:"foot-line",children:"Kinn · Trust your comeback · In development; not a medical device."})]})]})}h0(document.getElementById("root")).render(v.jsx(ye.StrictMode,{children:v.jsx(aE,{})}));
