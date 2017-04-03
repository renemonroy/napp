'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _lodash = require('lodash.union');

var _lodash2 = _interopRequireDefault(_lodash);

var _api = require('../api');

var _utilities = require('../utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var removeMultipleTemplates = function removeMultipleTemplates(templatesList) {
	if (templatesList.length > 0) {
		return (0, _api.removeTemplates)(templatesList);
	}
	return _inquirer2.default.prompt([{
		type: 'checkbox',
		name: 'selectedTemplates',
		message: 'Select templates',
		choices: function choices() {
			var templates = null;
			templates = (0, _api.getInstalledTemplates)();
			return Object.keys(templates);
		}
	}, {
		type: 'confirm',
		name: 'confirm',
		message: 'Are you sure you want to remove those templates?',
		default: false,
		when: function when(answers) {
			return answers.selectedTemplates.length > 0;
		}
	}]).then(function (answers) {
		if (answers.confirm === true) {
			console.log('');
			return (0, _api.removeTemplates)(answers.selectedTemplates);
		}
		return process.exit(1);
	});
};

exports.default = function (template, moreTemplates) {
	var templatesList = [];
	if (template) {
		templatesList.push(template);
	}
	if (moreTemplates) {
		templatesList = (0, _lodash2.default)(templatesList, moreTemplates);
	}
	removeMultipleTemplates(templatesList).then(function () {
		console.log('');
		console.log('Success!');
	}).catch(function (_ref) {
		var summary = _ref.summary,
		    errors = _ref.errors;

		console.log('');
		(0, _utilities.printErrors)(summary, errors || []);
		process.exit(1);
	});
};
//# sourceMappingURL=remove.js.map