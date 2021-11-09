const SSO = require('./content/sso');
const Cookie = require('./content/cookie');

let lock;
let lockPending = Promise.resolve();

function beforeCreate() {
    // setLocker(SSO.authSSO);
}
function onRequest(context, next) {
    waitLocker(() => next(null));
    // only allow first request pass lock
    lock = true;
}

function onProxySetup(context) {
    const { proxy } = context;
    const { request } = proxy;
    try {
        const cookies = Cookie.get();
        request.setHeader('cookie', cookies);
    } catch (error) {
        console.warn('[plugin-sso-cookie] no cookies found, hold page and try to send another request.');
    }
}

function onProxyRespond(context, next) {
    const res = context.proxy.data.response.data;
    if (res.code === '300' || res.msg === '登录信息失效') {
        setLocker(SSO.authSSO);
        console.warn('[plugin-sso-cookie] login failed status detected, start to refresh cookies');
    }
    next(null);
}


module.exports = {
    beforeCreate,
    onRequest,
    onProxySetup,
    onProxyRespond,
};



function waitLocker(fn) {
    if (lock) {
        console.log('locked, waiting!');
        lockPending.then(() => {
            console.log('unlocked, continue!');
            fn();
        })
    }
    else {
        fn();
    }
}

function setLocker(fn) {
    lock = true;
    console.log('set locker');
    lockPending = new Promise(async (resolve) => {
        await fn();
        lock = false;
        resolve();
    });
}
