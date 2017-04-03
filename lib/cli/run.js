'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _utilities = require('../utilities');

var _api = require('../api');

var _formatWebpackMessages = require('../../utils/formatWebpackMessages');

var _formatWebpackMessages2 = _interopRequireDefault(_formatWebpackMessages);

var _webpackMessages = require('../../config/webpackMessages');

var _webpackMessages2 = _interopRequireDefault(_webpackMessages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isFirstCompile = null;

var getDefaultConfig = function getDefaultConfig(port) {
	return {
		port: process.env.PORT || port || 3000,
		protocol: process.env.HTTPS === 'true' ? 'https' : 'http',
		host: process.env.HOST || 'localhost'
	};
};

var requestPortChange = function requestPortChange(port) {
	console.log(_chalk2.default.yellow('Something is already running at port ' + port + '.'));
	return _inquirer2.default.prompt([{
		type: 'confirm',
		name: 'changePort',
		message: 'Would you like to run the app at another port instead?',
		default: true
	}, {
		type: 'input',
		name: 'port',
		message: 'What port?',
		when: function when(answers) {
			return answers.changePort;
		}
	}]);
};

var handleCompilerStats = function handleCompilerStats(stats, serverConfig) {
	var messages = (0, _formatWebpackMessages2.default)(stats);
	var isSuccessful = !messages.errors.length && !messages.warnings.length;
	var showInstructions = isSuccessful && isFirstCompile;
	console.log('');
	if (isSuccessful) {
		_webpackMessages2.default.showDevServerSuccess();
	}
	if (showInstructions) {
		_webpackMessages2.default.showDevServerInstructions(serverConfig);
		isFirstCompile = false;
	}
	if (messages.errors.length) {
		_webpackMessages2.default.showDevServerErrors(messages);
		return;
	}
	if (messages.warnings.length) {
		_webpackMessages2.default.showDevServerWarnings(messages);
	}
};

exports.default = function (_ref) {
	var env = _ref.env,
	    port = _ref.port;

	if (env === 'dev' || env === 'development') {
		process.env.NODE_ENV = 'development';
	} else if (env === 'prod' || env === 'production') {
		process.env.NODE_ENV = 'production';
	} else {
		process.env.NODE_ENV = env;
	}
	isFirstCompile = true;
	var serverConfig = getDefaultConfig(port);
	console.log('');
	Promise.resolve().then(function () {
		return (0, _utilities.ensureAvailablePort)(serverConfig.port, requestPortChange);
	}).then(function (availablePort) {
		return Object.assign({}, serverConfig, { port: availablePort });
	}).then(function (realServerConfig) {
		return (0, _api.runApp)(env, process.cwd(), realServerConfig, handleCompilerStats);
	}).catch(function (e) {
		_utilities.log.error(e);
		process.exit(1);
	});
};
//# sourceMappingURL=run.js.map