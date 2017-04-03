'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _api = require('../api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
	var strOutput = '';
	var registry = (0, _api.getInstalledTemplates)();
	var templates = Object.keys(registry);
	var templatesSize = templates.length;
	var templatesStr = templatesSize === 1 ? 'template' : 'templates';
	templates.forEach(function (templateId) {
		var _registry$templateId$ = registry[templateId].package,
		    name = _registry$templateId$.name,
		    description = _registry$templateId$.description;

		var short = _chalk2.default.cyan(name);
		strOutput = short + ' ' + _chalk2.default.reset(description) + '\n' + strOutput;
	});
	console.log('');
	console.log(strOutput);
	console.log(_chalk2.default.white(templatesSize + ' ' + templatesStr + ' installed'));
};
//# sourceMappingURL=list.js.map