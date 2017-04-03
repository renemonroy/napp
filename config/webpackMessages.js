var chalk = require('chalk');

exports.showDevServerSuccess = function() {
	console.log(chalk.green('Compiled successfully!'));
	return;
};

exports.showDevServerInstructions = function(config) {
	console.log('');
	console.log('The app is running at: ' + chalk.cyan(config.protocol + '://' + config.host + ':' + config.port + '/'));
	console.log('');
	console.log('Note that the development build is not optimized and using production');
	console.log('configuration slows down the compilation time drastically.');
	console.log('');
	console.log('To create a production build, use ' + chalk.cyan('npm run build') + '.');
	return;
};

exports.showDevServerErrors = function(messages) {
	console.log(chalk.red('Failed to compile.'));
	console.log();
	messages.errors.forEach((message) => {
		console.log(message);
		console.log();
	});
	return;
};

exports.showDevServerWarnings = function(messages) {
	console.log(chalk.yellow('Compiled with warnings.'));
	console.log();
	messages.warnings.forEach((message) => {
		console.log(message);
		console.log();
	});
	console.log('You may use special comments to disable some warnings.');
	console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
	console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
};
