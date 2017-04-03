'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _settings = require('../../config/settings.json');

var _utilities = require('../utilities');

var _api = require('../api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var confirm = function confirm(project) {
	console.log(project);
	console.log('');
	_inquirer2.default.prompt([{
		type: 'confirm',
		name: 'confirm',
		message: '' + _chalk2.default.green('Is this ok?'),
		default: true
	}]).then(function (answers) {
		if (answers.confirm === true) {
			console.log('');
			(0, _api.createApp)(JSON.parse(project));
		}
	});
};

var showWizard = function showWizard() {
	(0, _utilities.clearConsole)();
	console.log('This utility will walk you through creating the initial files of your project.');
	console.log('The name of the project must follow NPM\'s naming pattern.');
	console.log('');
	console.log('Press ^C at any time to quit.');
	console.log('');
	_inquirer2.default.prompt([{
		type: 'input',
		name: 'name',
		message: '' + _chalk2.default.green('Project\'s Name:'),
		default: 'your-project',
		validate: _api.isValidAppName
	}, {
		type: 'list',
		name: 'template',
		message: '' + _chalk2.default.green('Template:'),
		default: _settings.defaultTemplate,
		choices: function choices() {
			var templates = null;
			templates = (0, _api.getInstalledTemplates)();
			return Object.keys(templates).map(function (templateId) {
				var _templates$templateId = templates[templateId].package,
				    name = _templates$templateId.name,
				    description = _templates$templateId.description;

				var short = _chalk2.default.cyan(name);
				return {
					name: short + ' ' + _chalk2.default.reset(description),
					value: templateId,
					short: short
				};
			});
		}
	}]).then(function (answers) {
		console.log('');
		confirm(JSON.stringify(answers, null, '  '));
	});
};

exports.default = function (projectName, source) {
	if (projectName && !source) {
		confirm(JSON.stringify({ name: projectName, template: _settings.defaultTemplate }, null, '  '));
	} else if (projectName && source) {
		confirm(JSON.stringify({ name: projectName, template: source }, null, '  '));
	} else {
		showWizard();
	}
};
//# sourceMappingURL=init.js.map