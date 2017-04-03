'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.removeFileNameHash = exports.ensureAvailablePort = exports.openFile = exports.clearConsole = exports.printErrors = exports.log = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _detectPort = require('detect-port');

var _detectPort2 = _interopRequireDefault(_detectPort);

var _child_process = require('child_process');

var _paths = require('../config/paths');

var _paths2 = _interopRequireDefault(_paths);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = exports.log = {
	error: function error(msg) {
		var hint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		console.log(_chalk2.default.red('>>') + ' ' + msg);
		if (hint && hint.length > 0) {
			console.log(_chalk2.default.blue('↳') + '  ' + hint);
		}
	}
};

var printErrors = exports.printErrors = function printErrors(summary, errors) {
	log.error(summary);
	errors.forEach(function (err) {
		console.log(err.message || err);
	});
};

var clearConsole = exports.clearConsole = function clearConsole() {
	process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
};

var openFile = exports.openFile = function openFile(fileRoot) {
	var command = '';
	switch (process.platform) {
		case 'darwin':
			command = 'open';
			break;
		case 'win32':
		case 'win64':
			command = 'start';
			break;
		default:
			command = 'xdg-open';
			break;
	}
	(0, _child_process.exec)(command + ' ' + fileRoot);
};

var ensureAvailablePort = exports.ensureAvailablePort = function ensureAvailablePort(portToTest, prompter) {
	return new Promise(function (resolve, reject) {
		var detectAvailablePort = function detectAvailablePort(ptt) {
			(0, _detectPort2.default)(ptt).then(function (port) {
				if (port === ptt) {
					resolve(ptt);
				} else {
					prompter(ptt).then(function (_ref) {
						var changePort = _ref.changePort,
						    newPort = _ref.port;

						if (!changePort) {
							reject('Aborted.');
						} else {
							detectAvailablePort(parseInt(newPort, 10));
						}
					});
				}
			});
		};
		detectAvailablePort(portToTest);
	});
};

var removeFileNameHash = exports.removeFileNameHash = function removeFileNameHash(fileName) {
	return fileName.replace(_paths2.default.build, '').replace(/\/?(.*)(\.\w+)(\.js|\.css)/, function (match, p1, p2, p3) {
		return p1 + p3;
	});
};
//# sourceMappingURL=utilities.js.map