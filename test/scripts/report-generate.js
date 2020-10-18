const { join } = require('path');
const allure = require('allure-commandline');

const generation = allure(['generate', `"${join(process.cwd(), 'allure-results')}"`]);

generation.on('exit', function (exitCode) {
    console.log('Generation is finished with code:', exitCode);
});