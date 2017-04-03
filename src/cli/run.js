import inquirer from 'inquirer';
import chalk from 'chalk';
import { log, ensureAvailablePort } from '../utilities';
import { runApp } from '../api';
import formatWebpackMessages from '../../utils/formatWebpackMessages';
import webpackMessages from '../../config/webpackMessages';

let isFirstCompile = null;

const getDefaultConfig = port => ({
	port: process.env.PORT || port || 3000,
	protocol: process.env.HTTPS === 'true' ? 'https' : 'http',
	host: process.env.HOST || 'localhost',
});

const requestPortChange = (port) => {
	console.log(chalk.yellow(`Something is already running at port ${port}.`));
	return inquirer.prompt([
		{
			type: 'confirm',
			name: 'changePort',
			message: 'Would you like to run the app at another port instead?',
			default: true,
		},
		{
			type: 'input',
			name: 'port',
			message: 'What port?',
			when: answers => answers.changePort,
		},
	]);
};

const handleCompilerStats = (stats, serverConfig) => {
	const messages = formatWebpackMessages(stats);
	const isSuccessful = !messages.errors.length && !messages.warnings.length;
	const showInstructions = isSuccessful && isFirstCompile;
	console.log('');
	if (isSuccessful) {
		webpackMessages.showDevServerSuccess();
	}
	if (showInstructions) {
		webpackMessages.showDevServerInstructions(serverConfig);
		isFirstCompile = false;
	}
	if (messages.errors.length) {
		webpackMessages.showDevServerErrors(messages);
		return;
	}
	if (messages.warnings.length) {
		webpackMessages.showDevServerWarnings(messages);
	}
};

export default ({ env, port }) => {
	if (env === 'dev' || env === 'development') {
		process.env.NODE_ENV = 'development';
	} else if (env === 'prod' || env === 'production') {
		process.env.NODE_ENV = 'production';
	} else {
		process.env.NODE_ENV = env;
	}
	isFirstCompile = true;
	const serverConfig = getDefaultConfig(port);
	console.log('');
	Promise.resolve()
		.then(() => ensureAvailablePort(serverConfig.port, requestPortChange))
		.then(availablePort => (Object.assign({}, serverConfig, { port: availablePort })))
		.then(realServerConfig => runApp(env, process.cwd(), realServerConfig, handleCompilerStats))
		.catch((e) => {
			log.error(e);
			process.exit(1);
		});
};
