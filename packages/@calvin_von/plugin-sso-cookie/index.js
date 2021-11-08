const SSO = require('./content/sso');
const Cookie = require('./content/cookie');

let lock;
let lockPending = Promise.resolve();

function beforeCreate() {
    // SSO.authSSO();
}
function onRequest(context, next) {
    next(null);
}
function onRouteMatch(context, next) {
    next(null);
}
function beforeProxy(context, next) {
    next(null);
}
function onProxySetup(context) {
    const { config, proxy } = context;
    const { request } = proxy;
    try {
        const cookies = Cookie.get();
        request.setHeader('cookie', cookies);
    } catch (error) {
        SSO.authSSO();
    }
}
function onProxyRespond(context, next) {
    next(null);
}
function afterProxy(context) { }
function onPipeRequest(context, next) {
    next(null, context.chunk);
}
function onPipeResponse(context, next) {
    next(null, context.chunk);
}

module.exports = {
    beforeCreate,
    onRequest,
    onRouteMatch,
    beforeProxy,
    onProxySetup,
    onProxyRespond,
    afterProxy,
    onPipeRequest,
    onPipeResponse
};
