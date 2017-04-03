'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _api = require('../api');

var _utilities = require('../utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
	process.env.NODE_ENV = 'production';
	console.log('Creating an optimized production build...');
	console.log('');
	(0, _api.buildApp)(_fs2.default.realpathSync(process.cwd())).then(function () {
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
//# sourceMappingURL=build.js.map