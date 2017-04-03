'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _api = require('../api');

var _utilities = require('../utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeTemplate = function makeTemplate(templateName) {
	var currentDirectory = _fs2.default.realpathSync(process.cwd());
	if (templateName) {
		return (0, _api.createTemplate)(currentDirectory, templateName);
	}
	var folderName = _path2.default.basename(currentDirectory);
	return _inquirer2.default.prompt([{
		type: 'confirm',
		name: 'change',
		message: 'Do you want to change the template name ' + _chalk2.default.white(folderName) + '?',
		default: true
	}, {
		type: 'input',
		name: 'name',
		message: '' + _chalk2.default.green('Template\'s Name:'),
		default: 'your-template',
		when: function when(answers) {
			return answers.change === true;
		}
	}]).then(function (_ref) {
		var change = _ref.change,
		    name = _ref.name;

		console.log('');
		return (0, _api.createTemplate)(currentDirectory, change ? name : null);
	});
};

exports.default = function (templateName) {
	console.log('Creating a template from current directory...');
	console.log('');
	makeTemplate(templateName).then(function () {
		console.log('');
		console.log('Success!');
		process.exit();
	}).catch(function (_ref2) {
		var summary = _ref2.summary,
		    errors = _ref2.errors;

		console.log('');
		(0, _utilities.printErrors)(summary, errors || []);
		process.exit(1);
	});
};
//# sourceMappingURL=make.js.map