const SSO = require('./content/sso');

module.exports = function (program) {
  program
    .command('cookie')
    .description('refresh SSO cookie immediately')
    .action(async function () {
      await SSO.authSSO();
      process.exit(0);
    });
};

