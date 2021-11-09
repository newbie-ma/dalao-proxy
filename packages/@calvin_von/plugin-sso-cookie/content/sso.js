const SSOAuth = module.exports;
const axios = require('axios');
const url = require('url');
const Cookie = require('./cookie');

const params = new url.URLSearchParams({
  "username": "fengjiahui",
  "password": "DDEECFjh051412?",
  "deviceid": null,
  "redirect_uri": "https://mis-test.diditaxi.com.cn/auth?app_id=1842&version=1.0&jumpto=http://boss-test.intra.xiaojukeji.com&callback_index=0",
});

const request = axios.default.create({
  maxRedirects: 0,
  validateStatus: function (status) {
    return status >= 200 && status < 303;
  },
});

request.interceptors.request.use(config => {
  log(`${config.method} ${config.url}`);
  return config;
});
request.interceptors.response.use(
  res => {
    log(`${res.config.method} ${res.config.url} ${res.status}`);
    if (res.status === 302) return res;
    if (res.data.code === 0 && res.data.errno === 0) {
      return res;
    }
    return Promise.reject(res);
  },
  err => {
    log(`${err.config.method} ${err.config.url} ${err.status}`);
    return Promise.reject(err.data);
  }
);

SSOAuth.authSSO = async () => {
  try {
    const { data: loginData } = await request('https://me-test.xiaojukeji.com/user_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      data: params.toString()
    });

    const callbackUrl = loginData.redirect;
    const { headers: { location, 'set-cookie': _cookie } } = await request(callbackUrl);

    const { headers: { 'set-cookie': cookie } } = await request(location, {
      headers: { cookie: _cookie }
    });
    log('writing cookie...');
    Cookie.write(cookie);
    log('Cookie refresh SUCCEED!');

  } catch (error) {
    log('SSO auth failed');
    throw error;
  }
}

function log(...message) {
  console.log('[plugin-sso-cookie] ', ...message);
}