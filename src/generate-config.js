const readline = require('readline');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const defalutConfig = require('../config');
const pwd = process.cwd();
const custom_assign = require('./utils').custom_assign;

// questions
let questionObjs = [
    { label: 'Config file name', value: 'host', text: true, radio: false },
    { label: 'Proxy server host', value: 'host', text: true, radio: false },
    { label: 'Proxy server port', value: 'port', text: true, radio: false },
    { label: 'Proxy target server address', value: 'target', text: true, radio: false },
    { label: 'Should cache request', value: 'cache', text: false, radio: true },
    { label: 'Cache folder name', value: 'cacheDirname', text: true, radio: false },
];

// default answers
let defaultAnswers = [
    defalutConfig.configFilename,
    defalutConfig.host,
    defalutConfig.port,
    defalutConfig.target,
    defalutConfig.cache,
    defalutConfig.cacheDirname,
];

// user answers
const answers = [];
let index = 0;

function createConfigFile() {
    let generateConfig = {};
    questionObjs.forEach(function (questionObj, index) {
        generateConfig[questionObj.value] = answers[index];
    });

    generateConfig = _.assignWith({}, _.omit(defalutConfig, ['version', 'configFilename']), generateConfig, custom_assign);

    const fullConfigFilePath = path.resolve(pwd, defalutConfig.configFilename);
    fs.writeFileSync(fullConfigFilePath, JSON.stringify(generateConfig, null, 4));
    console.log(`> 😉  dalao says: 🎉  Congratulations, \`${fullConfigFilePath}\` has generated for you.`.green);
    console.log('  More details about proxy config or cache config, please see '.grey +  'https://github.com/CalvinVon/dalao-proxy#docs\n'.yellow);
}

/**
 * Run question loop
 * @param {Boolean} forceSkip if true skip all the questions
 */
function runQuestionLoop(forceSkip) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    if (forceSkip || index === questionObjs.length) {
        createConfigFile();
        rl.close();
        process.exit(0);
        return;
    }

    const questionObj = questionObjs[index];
    const defaultAnswer = defaultAnswers[index];
    let question = '> ';
    const { label, radio, text } = questionObj;
    if (text) {
        question += label + ' (' + defaultAnswer + '): ';
    }
    else if (radio) {
        question += label + ' (y/n, default: ' + (defaultAnswer ? 'yes' : 'no') + '): ';
    }

    rl.question(question, function (answer) {
        if (text) {
            answers.push(answer || defaultAnswer);
            index++;
        }
        else if (radio) {
            if (!answer) {
                answers.push(defaultAnswer);
                index++;
            }
            else {
                const yesMatched = /^(true|y|yes)$/i.test(answer);
                const noMatched = /^(false|no?)$/i.test(answer);
                if (yesMatched || noMatched) {
                    answers.push(yesMatched || defaultAnswer);
                    index++;
                }
                else {
                    console.log('> dalao says: 👋  enter `y/yes` or `n/no`'.red);
                }
            }
        }
        rl.close();
        runQuestionLoop();
    });
}

module.exports = function ConfigGenerator ({ force }) {
    if (!force) {
        const preHint = `
This utility will walk you through creating a config file.
It only covers the most common items, and tries to guess sensible defaults.

See \`dalao --help\` for definitive documentation on these fields
and exactly what they do.

Press ^C at any time to quit.
`;

    console.log(preHint);
    }
    return runQuestionLoop(force);
}