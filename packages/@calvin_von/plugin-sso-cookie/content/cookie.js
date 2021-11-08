const fs = require('fs-extra');
const path = require('path');
const Cookie = module.exports;

Cookie.filePath = path.join(
  process.cwd(),
  'node_modules',
  '.dalao',
  'refresh-cookie.json'
);

Cookie.write = (cookies) => {
  fs.ensureFileSync(Cookie.filePath);
  fs.writeJsonSync(Cookie.filePath, { default: cookies });
}

Cookie.get = (route = 'default') => {
  fs.ensureFileSync(Cookie.filePath);
  const json = fs.readJsonSync(Cookie.filePath) || {};
  return json[route];
}