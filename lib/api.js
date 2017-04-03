'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.buildApp = exports.runApp = exports.createApp = exports.runDevServer = exports.compileAssets = exports.setupCompiler = exports.defineEnvironmentConfig = exports.installDependencies = exports.configurePackage = exports.createDirectory = exports.checkRequiredFiles = exports.removeTemplates = exports.destroyTemplates = exports.createTemplate = exports.installTemplate = exports.useRemoteTemplate = exports.useLocalTemplate = exports.updateTemplatesRegistry = exports.checkTemplateCandidate = exports.getInstalledTemplates = exports.isValidTemplateTree = exports.getTemplatesRegistryRoot = exports.isValidAppName = exports.isSafeToCreateAppIn = exports.getRequiredTemplateFiles = exports.getNAppRoot = undefined;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _validateNpmPackageName = require('validate-npm-package-name');

var _validateNpmPackageName2 = _interopRequireDefault(_validateNpmPackageName);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _directoryTree = require('directory-tree');

var _directoryTree2 = _interopRequireDefault(_directoryTree);

var _objSubset = require('obj-subset');

var _objSubset2 = _interopRequireDefault(_objSubset);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _connectHistoryApiFallback = require('connect-history-api-fallback');

var _connectHistoryApiFallback2 = _interopRequireDefault(_connectHistoryApiFallback);

var _downloadGitRepo = require('download-git-repo');

var _downloadGitRepo2 = _interopRequireDefault(_downloadGitRepo);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _paths = require('../config/paths');

var _paths2 = _interopRequireDefault(_paths);

var _settings = require('../config/settings.json');

var _settings2 = _interopRequireDefault(_settings);

var _template = require('../config/template.json');

var _template2 = _interopRequireDefault(_template);

var _utilities = require('./utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * NAPP RELATED
 * ==================================================================== */

/* eslint global-require: [0] */
/* eslint import/no-dynamic-require: [0] */
var getNAppRoot = exports.getNAppRoot = function getNAppRoot() {
	return _path2.default.join(__dirname, '..');
};

var getRequiredTemplateFiles = exports.getRequiredTemplateFiles = function getRequiredTemplateFiles(root) {
	return _template2.default.requiredFiles.map(function (file) {
		return _path2.default.resolve(root, file);
	});
};

var isSafeToCreateAppIn = exports.isSafeToCreateAppIn = function isSafeToCreateAppIn(root) {
	var validFiles = _template2.default.ignoredFiles;
	return _fsExtra2.default.readdirSync(root).every(function (file) {
		return validFiles.indexOf(file) >= 0;
	});
};

var isValidAppName = exports.isValidAppName = function isValidAppName(name) {
	var its = (0, _validateNpmPackageName2.default)(name);
	if (!its.validForNewPackages) {
		var errors = (its.errors || []).concat(its.warnings || []);
		return 'Sorry, ' + errors.join(' and ') + ' .';
	}
	return true;
};

/**
 * TEMPLATES
 * ==================================================================== */

var getTemplatesRegistryRoot = exports.getTemplatesRegistryRoot = function getTemplatesRegistryRoot() {
	return _path2.default.join(getNAppRoot(), 'templates/registry.json');
};

var isValidTemplateTree = exports.isValidTemplateTree = function isValidTemplateTree(templateTree) {
	return (0, _objSubset2.default)(templateTree, _template2.default.validTree);
};

var getInstalledTemplates = exports.getInstalledTemplates = function getInstalledTemplates() {
	return JSON.parse(_fsExtra2.default.readFileSync(getTemplatesRegistryRoot(), 'utf8'));
};

var checkTemplateCandidate = exports.checkTemplateCandidate = function checkTemplateCandidate(directory, preferredName) {
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
	return new Promise(function (resolve, reject) {
		var spinner = (0, _ora2.default)(step + ' Validate template candidate').start();
		if (!directory) {
			spinner.fail();
			reject({ summary: 'No directory specified.' });
		}
		var templateName = preferredName || _path2.default.basename(directory);
		var appNameValidation = isValidAppName(templateName);
		if (appNameValidation !== true) {
			spinner.fail();
			reject({
				summary: 'Directory name should follow NPM naming convention.',
				errors: [appNameValidation]
			});
		}
		var templateTree = (0, _directoryTree2.default)(directory);
		if (!isValidTemplateTree(templateTree)) {
			spinner.fail();
			reject({
				summary: 'Project structure does not match minumum requirements'
			});
		} else {
			spinner.succeed();
			resolve(templateTree);
		}
	});
};

var updateTemplatesRegistry = exports.updateTemplatesRegistry = function updateTemplatesRegistry() {
	var step = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	return new Promise(function (resolve) {
		var useSpinner = step !== '';
		var spinner = null;
		if (useSpinner) {
			spinner = (0, _ora2.default)(step + ' Update templates registry').start();
		}
		var templates = {};
		var templatesRoot = getNAppRoot() + '/templates';
		var templatesList = _fsExtra2.default.readdirSync(templatesRoot).filter(function (file) {
			return _fsExtra2.default.statSync(_path2.default.join(templatesRoot, file)).isDirectory();
		});
		templatesList.forEach(function (template) {
			var templateRoot = templatesRoot + '/' + template;
			var packageJSON = templateRoot + '/package.json';
			var templateTree = (0, _directoryTree2.default)(templateRoot);
			if (isValidTemplateTree(templateTree)) {
				templates[template] = {
					path: templateRoot,
					package: JSON.parse(_fsExtra2.default.readFileSync(packageJSON, 'utf8')),
					tree: templateTree
				};
			}
		});
		_fsExtra2.default.writeJsonSync(getTemplatesRegistryRoot(), templates);
		if (useSpinner) {
			spinner.succeed();
		}
		resolve(templates);
	});
};

var useLocalTemplate = exports.useLocalTemplate = function useLocalTemplate(templateName, directory) {
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

	var spinner = (0, _ora2.default)(step + ' Paste local template to new directory').start();
	var nappRoot = getNAppRoot();
	var dir = _path2.default.resolve(directory, '.');
	var templateDirectory = nappRoot + '/templates/' + templateName;
	if (!isSafeToCreateAppIn(dir) || !_fsExtra2.default.existsSync(templateDirectory)) {
		spinner.fail();
		console.log('');
		_utilities.log.error('The template ' + _chalk2.default.white(templateName) + ' is not found or is invalid.');
		process.exit(1);
	}
	_fsExtra2.default.copySync(templateDirectory, dir);
	spinner.succeed();
	return directory;
};

var useRemoteTemplate = exports.useRemoteTemplate = function useRemoteTemplate(repository, directory, options) {
	var step = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
	return new Promise(function (resolve, reject) {
		var spinner = (0, _ora2.default)(step + ' Paste remote template to new directory').start();
		(0, _downloadGitRepo2.default)(repository, directory, options, function (err) {
			if (err) {
				spinner.fail();
				reject({
					summary: 'Failed to download repotory ' + repository,
					errors: [err.message.trim]
				});
			} else {
				spinner.succeed();
				resolve(directory);
			}
		});
	});
};

// export const useTemplateMiddleware = (appConfig, step = '') => (
// 	new Promise((resolve, reject) => {
// 		const { defaultTemplate } = settings;
// 		const { template = defaultTemplate } = appConfig;
// 		resolve();
// 	})
// );

var installTemplate = exports.installTemplate = function installTemplate(templateDirectory, preferredName) {
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
	return new Promise(function (resolve, reject) {
		var spinner = (0, _ora2.default)(step + ' Paste candidate into templates directory').start();
		var templateName = preferredName || _path2.default.basename(templateDirectory);
		var templatesRoot = _path2.default.resolve(getNAppRoot(), 'templates/');
		var targetDirectory = _path2.default.join(templatesRoot, templateName);
		var templatePackage = _path2.default.join(templateDirectory, 'package.json');
		if (!_fsExtra2.default.existsSync(templatePackage)) {
			spinner.fail();
			reject({ summary: 'A file package.json wasn\'t found in the template' });
		}
		if (_fsExtra2.default.existsSync(targetDirectory)) {
			spinner.fail();
			reject({ summary: 'A template with name ' + _chalk2.default.white(templateName) + ' already exists.' });
		} else {
			if (preferredName) {
				var packageObj = _fsExtra2.default.readJsonSync(templatePackage);
				_fsExtra2.default.writeJsonSync(templatePackage, (0, _lodash2.default)({}, packageObj, {
					name: preferredName
				}));
			}
			_fsExtra2.default.copySync(templateDirectory, targetDirectory, {
				filter: function filter(filePath) {
					if (filePath.match(/node_modules/) || filePath.match(/build/)) {
						return false;
					}
					return true;
				}
			});
			spinner.succeed();
			resolve(targetDirectory);
		}
	});
};

var createTemplate = exports.createTemplate = function createTemplate(directory, preferredName) {
	return new Promise(function (resolve, reject) {
		Promise.resolve().then(function () {
			return checkTemplateCandidate(directory, preferredName, '[1/3]');
		}).then(function () {
			return installTemplate(directory, preferredName, '[2/3]');
		}).then(function () {
			return updateTemplatesRegistry('[3/3]');
		}).then(function (registry) {
			var templateName = _path2.default.basename(directory);
			resolve(registry[templateName]);
		}).catch(function (e) {
			reject(e);
		});
	});
};

var destroyTemplates = exports.destroyTemplates = function destroyTemplates() {
	var templates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	return new Promise(function (resolve) {
		var spinner = (0, _ora2.default)(step + ' Remove templates(s) from file system').start();
		var registry = getInstalledTemplates();
		templates.forEach(function (templateId) {
			if (registry[templateId]) {
				var templateRoot = _path2.default.resolve(registry[templateId].path);
				updateTemplatesRegistry();
				_fsExtra2.default.removeSync(templateRoot);
			}
		});
		spinner.succeed();
		resolve();
	});
};

var removeTemplates = exports.removeTemplates = function removeTemplates() {
	var templates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	return new Promise(function (resolve, reject) {
		Promise.resolve().then(function () {
			return destroyTemplates(templates, '[1/2]');
		}).then(function () {
			return updateTemplatesRegistry('[2/2]');
		}).then(function () {
			resolve();
		}).catch(function (e) {
			reject(e);
		});
	});
};

/**
 * PROJECTS RELATED
 * ==================================================================== */

var checkRequiredFiles = exports.checkRequiredFiles = function checkRequiredFiles(files) {
	var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	return new Promise(function (resolve, reject) {
		var spinner = (0, _ora2.default)(step + ' Check for required files').start();
		var currentFilePath = null;
		try {
			files.forEach(function (filePath) {
				currentFilePath = filePath;
				_fsExtra2.default.accessSync(filePath, _fsExtra2.default.F_OK);
			});
			spinner.succeed();
			resolve();
		} catch (err) {
			var dirName = _path2.default.dirname(currentFilePath);
			var fileName = _path2.default.basename(currentFilePath);
			spinner.fail();
			reject({
				summary: 'Couldn\'t find a required file:',
				errors: [fileName + ' at ' + dirName]
			});
		}
	});
};

var createDirectory = exports.createDirectory = function createDirectory(directoryName, dir) {
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

	var spinner = (0, _ora2.default)(step + ' Create or use directory ' + _chalk2.default.white(directoryName)).start();
	var directory = _path2.default.resolve(dir || '', directoryName);
	var appName = _path2.default.basename(directory);
	_fsExtra2.default.ensureDirSync(directory);
	if (!isSafeToCreateAppIn(directory)) {
		spinner.fail();
		console.log('');
		_utilities.log.error('The directory ' + _chalk2.default.white(appName) + ' contains files that could conflict.', 'Try using a new directory name.');
		process.exit(1);
	}
	spinner.succeed();
	return directory;
};

var configurePackage = exports.configurePackage = function configurePackage(config, directory) {
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

	var spinnerStr = step + ' Configure ' + _chalk2.default.white('package.json') + ' with project\'s data';
	var spinner = (0, _ora2.default)(spinnerStr).start();
	var currentPackage = _path2.default.resolve(directory, './package.json');
	var currentPackageData = null;
	if (!_fsExtra2.default.existsSync(currentPackage)) {
		spinner.fail();
		console.log('');
		_utilities.log.error('A package.json does not exist in the current directory.');
		process.exit(1);
	}
	currentPackageData = JSON.parse(_fsExtra2.default.readFileSync(currentPackage, 'utf8'));
	var packageJSON = Object.assign({}, currentPackageData, {
		name: config.name,
		version: '0.1.0',
		private: true,
		scripts: {
			start: 'napp run',
			build: 'napp build'
		}
	});
	if (_settings2.default.useBabel === true) {
		packageJSON.dependencies['babel-polyfill'] = '*';
	}
	if (_settings2.default.useEslint === true) {
		packageJSON.devDependencies.eslint = '*';
		if (_settings2.default.useBabel === true) {
			packageJSON.devDependencies['babel-eslint'] = '*';
		}
	}
	_fsExtra2.default.writeFileSync(currentPackage, JSON.stringify(packageJSON, null, 2));
	spinner.succeed();
	return directory;
};

var installDependencies = exports.installDependencies = function installDependencies(directory) {
	var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

	console.log('');
	console.log('Installing project dependencies...');
	console.log('');
	var childProc = _child_process2.default.spawn('npm', ['install', '--silent'], {
		shell: true,
		cwd: _path2.default.resolve(directory, '.'),
		stdio: 'inherit'
	});
	childProc.on('close', function (code) {
		var spinner = (0, _ora2.default)(step + ' Install project dependencies').start();
		if (code !== 0) {
			spinner.fail();
			console.log('');
			_utilities.log.error('Install process failed.');
			process.exit(1);
		}
		spinner.succeed();
	});
	return childProc;
};

var defineEnvironmentConfig = exports.defineEnvironmentConfig = function defineEnvironmentConfig() {
	var env = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'dev';
	var directory = arguments[1];
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
	return new Promise(function (resolve) {
		var spinner = (0, _ora2.default)(step + ' Define environment configuration').start();
		var configFiles = [];
		var configName = 'webpack.config.' + env + '.js';
		var extendName = 'webpack.extend.' + env + '.js';
		var predConfigRoot = _path2.default.join(getNAppRoot(), 'config/', configName);
		var files = _fsExtra2.default.readdirSync(directory).filter(function (filename) {
			return filename === configName || filename === extendName;
		});
		switch (files.length) {
			case 0:
				if (_fsExtra2.default.existsSync(predConfigRoot)) {
					configFiles.push(require(predConfigRoot));
				}
				break;
			case 1:
				if (files[0] === configName) {
					configFiles.push(require(_path2.default.join(directory, configName)));
				} else if (files[0] === extendName && _fsExtra2.default.existsSync(predConfigRoot)) {
					configFiles.push(require(predConfigRoot), require(_path2.default.join(directory, extendName)));
				}
				break;
			case 2:
				configFiles.push(require(_path2.default.join(directory, configName)), require(_path2.default.join(directory, extendName)));
				break;
			default:
		}
		if (configFiles.length === 0) {
			spinner.fail();
			_utilities.log.error('No configuration found that includes "' + env + '" on its name.', 'Notice that the only predefined environments are "dev" and "prod".');
			process.exit(1);
		} else {
			spinner.succeed();
			resolve(_webpackMerge2.default.smart(configFiles));
		}
	});
};

/**
 * COMPILER SETUP
 * ==================================================================== */

var setupCompiler = exports.setupCompiler = function setupCompiler(envConfig, handleStats) {
	var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
	return new Promise(function (resolve) {
		var spinner = (0, _ora2.default)(step + ' Setup webpack compiler').start();
		var compiler = (0, _webpack2.default)(envConfig);
		compiler.plugin('done', function (stats) {
			spinner.succeed();
			handleStats(stats.toJson({}, true));
		});
		resolve(compiler);
	});
};

var compileAssets = exports.compileAssets = function compileAssets(config) {
	var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	return new Promise(function (resolve, reject) {
		var spinner = (0, _ora2.default)(step + ' Bundle scripts and styles').start();
		(0, _webpack2.default)(config).run(function (err, stats) {
			var summary = 'Failed to compile.';
			if (err) {
				spinner.fail();
				reject({ summary: summary, errors: [err] });
			}
			if (stats.compilation.errors.length) {
				spinner.fail();
				reject({ summary: summary, errors: stats.compilation.errors });
			}
			if (process.env.CI && stats.compilation.warnings.length) {
				spinner.fail();
				reject({ summary: summary, errors: stats.compilation.warnings });
			}
			spinner.succeed();
			resolve(stats);
		});
	});
};

var runDevServer = exports.runDevServer = function runDevServer(envConfig, serverConfig, handleStats) {
	var step = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
	return new Promise(function (resolve, reject) {
		var spinner = (0, _ora2.default)(step + ' Configure compiler and dev server').start();
		var compiler = (0, _webpack2.default)(envConfig);
		compiler.plugin('done', function (stats) {
			(0, _utilities.clearConsole)();
			handleStats(stats.toJson({}, true), serverConfig);
		});
		var devServer = new _webpackDevServer2.default(compiler, {
			compress: true,
			clientLogLevel: 'none',
			contentBase: _paths2.default.public,
			quiet: true,
			watchOptions: {
				ignored: /node_modules/
			},
			https: serverConfig.protocol === 'https',
			host: serverConfig.host
		});
		devServer.use((0, _connectHistoryApiFallback2.default)({
			disableDotRule: true,
			htmlAcceptHeaders: ['text/html', '*/*']
		}));
		devServer.use(devServer.middleware);
		devServer.listen(serverConfig.port, function (err) {
			if (err) {
				reject({ summary: err });
				process.exit(1);
			}
			console.log('');
			console.log(_chalk2.default.cyan('Starting dev server...'));
			console.log('');
		});
		spinner.succeed();
		resolve();
	});
};

/**
 * MAIN ACTIONS
 * ==================================================================== */

var createApp = exports.createApp = function createApp(config) {
	var done = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

	Promise.resolve().then(function () {
		return createDirectory(config.name, '', '[1/4]');
	}).then(function (root) {
		return useLocalTemplate(config.template, root, '[2/4]');
	}).then(function (root) {
		return configurePackage(config, root, '[3/4]');
	}).then(function (root) {
		return installDependencies(root, '[4/4]');
	}).then(function (proc) {
		proc.on('close', function (code) {
			if (code === 0) {
				console.log('');
				console.log('Success!');
				done();
			}
		});
	}).catch(function (e) {
		throw new Error(e);
	});
};

var runApp = exports.runApp = function runApp(env, directory, serverConfig, compilerStatsHandler) {
	return new Promise(function (resolve, reject) {
		if (!directory) {
			reject({ summary: 'No directory specified.' });
		}
		Promise.resolve().then(function () {
			return defineEnvironmentConfig(env, directory, '[1/2]');
		}).then(function (envConfig) {
			return runDevServer(envConfig, serverConfig, compilerStatsHandler, '[2/2]');
		}).then(function () {
			resolve();
		}).catch(function (e) {
			reject(e);
		});
	});
};

var buildApp = exports.buildApp = function buildApp(directory) {
	return new Promise(function (resolve, reject) {
		if (!directory) {
			reject({ summary: 'No directory specified.' });
		}
		Promise.resolve().then(function () {
			return checkRequiredFiles(getRequiredTemplateFiles(directory), '[1/3]');
		}).then(function () {
			return defineEnvironmentConfig('prod', directory, '[2/3]');
		}).then(function (envConfig) {
			return compileAssets(envConfig, '[3/3]');
		}).then(function (stats) {
			resolve(stats);
		}).catch(function (e) {
			reject(e);
		});
	});
};
//# sourceMappingURL=api.js.map