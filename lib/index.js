'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _updateNotifier = require('update-notifier');

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

var _cli = require('./cli');

var _cli2 = _interopRequireDefault(_cli);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _api = require('./api');

var _utilities = require('./utilities');

var _settings = require('../config/settings.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (_settings.notifyUpdates) {
	(0, _updateNotifier2.default)({ pkg: _package2.default }).notify();
}

_commander2.default.version(_package.version).usage(_chalk2.default.green('<command>') + ' [options]').option('-c, --config', 'Open settings in default editor').option('-r, --refresh', 'Update common utilities');

_commander2.default.command('init [projectName] [source]').description('Initialize a new project inside current directory').action(_cli2.default.init);

_commander2.default.command('run').description('Run the project within a dev server').option('-e, --env <name>', 'The environment\'s configuration to use').option('-p, --port <number>', 'Port to use on dev server', parseInt).action(_cli2.default.run);

_commander2.default.command('build').description('Build bundles of scripts and styles in production mode').action(_cli2.default.build);

_commander2.default.command('list').alias('ls').description('List all templates installed').action(_cli2.default.list);

_commander2.default.command('make [template]').alias('mk').description('Make a template from current folder').action(_cli2.default.make);

_commander2.default.command('remove [template] [templates...]').alias('rm').description('Remove templates from file system').action(_cli2.default.remove);

_commander2.default.command('*').description('Unknown commands return error').action(function () {
	return console.log(_chalk2.default.red('>>'), 'Unknown command');
});

_commander2.default.parse(process.argv);

if (_commander2.default.refresh) {
	(0, _api.updateTemplatesRegistry)();
}

if (_commander2.default.config) {
	(0, _utilities.openFile)(_path2.default.join((0, _api.getNAppRoot)(), 'config/settings.json'));
}
//# sourceMappingURL=index.js.map