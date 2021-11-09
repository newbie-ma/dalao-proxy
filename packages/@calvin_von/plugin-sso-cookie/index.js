const SSO = require('./content/sso');
const Cookie = require('./content/cookie');

let firstRequest;
let unlockFollowingReqs;
let followingReqsPending;
const lockFollowingReqs = () => {
    followingReqsPending = new Promise(resolve => {
        unlockFollowingReqs = () => setTimeout(() => {
            resolve();
        }, 1000);
    });
}


function beforeCreate() {
    firstRequest = true;
    lockFollowingReqs();
    // setLocker(SSO.authSSO);
}
function onRequest(context, next) {
    if (firstRequest) {
        firstRequest = false;
        next(null);
    }
    else {
        followingReqsPending.then(() => {
            next(null);
        });
    }
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

async function onProxyRespond(context, next) {
    try {
        const res = context.proxy.data.response.data;
        if (res.code === '300' || res.msg === '登录信息失效') {
            console.warn('[plugin-sso-cookie] login failed status detected, start to refresh cookies');
            lockFollowingReqs();
            await SSO.authSSO();
        }
    } catch (error) {
        console.error(error);
    }
    unlockFollowingReqs();
    next(null);
}


module.exports = {
    beforeCreate,
    onRequest,
    onProxySetup,
    onProxyRespond,
};
