/* eslint global-require: [0] */
/* eslint import/no-dynamic-require: [0] */
import fs from 'fs-extra';
import path from 'path';
import childProcess from 'child_process';
import validatePackageName from 'validate-npm-package-name';
import chalk from 'chalk';
import ora from 'ora';
import dirTree from 'directory-tree';
import isSubset from 'obj-subset';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackMerge from 'webpack-merge';
import historyApiFallback from 'connect-history-api-fallback';
import downloadGitRepo from 'download-git-repo';
import merge from 'lodash.merge';
import paths from '../config/paths';
import settings from '../config/settings.json';
import templateConfig from '../config/template.json';
import { log, clearConsole } from './utilities';

/**
 * NAPP RELATED
 * ==================================================================== */

export const getNAppRoot = () => (
	path.join(__dirname, '..')
);

export const getRequiredTemplateFiles = root => (
	templateConfig.requiredFiles.map(file => path.resolve(root, file))
);

export const isSafeToCreateAppIn = (root) => {
	const validFiles = templateConfig.ignoredFiles;
	return fs.readdirSync(root).every(file => (
		validFiles.indexOf(file) >= 0
	));
};

export const isValidAppName = (name) => {
	const its = validatePackageName(name);
	if (!its.validForNewPackages) {
		const errors = (its.errors || []).concat(its.warnings || []);
		return `Sorry, ${errors.join(' and ')} .`;
	}
	return true;
};

/**
 * TEMPLATES
 * ==================================================================== */

export const getTemplatesRegistryRoot = () => (
	path.join(getNAppRoot(), 'templates/registry.json')
);

export const isValidTemplateTree = templateTree => (
	isSubset(templateTree, templateConfig.validTree)
);

export const getInstalledTemplates = () => (
	JSON.parse(fs.readFileSync(getTemplatesRegistryRoot(), 'utf8'))
);

export const checkTemplateCandidate = (directory, preferredName, step = '') => (
	new Promise((resolve, reject) => {
		const spinner = ora(`${step} Validate template candidate`).start();
		if (!directory) {
			spinner.fail();
			reject({ summary: 'No directory specified.' });
		}
		const templateName = preferredName || path.basename(directory);
		const appNameValidation = isValidAppName(templateName);
		if (appNameValidation !== true) {
			spinner.fail();
			reject({
				summary: 'Directory name should follow NPM naming convention.',
				errors: [appNameValidation],
			});
		}
		const templateTree = dirTree(directory);
		if (!isValidTemplateTree(templateTree)) {
			spinner.fail();
			reject({
				summary: 'Project structure does not match minumum requirements',
			});
		} else {
			spinner.succeed();
			resolve(templateTree);
		}
	})
);

export const updateTemplatesRegistry = (step = '') => (
	new Promise((resolve) => {
		const useSpinner = step !== '';
		let spinner = null;
		if (useSpinner) {
			spinner = ora(`${step} Update templates registry`).start();
		}
		const templates = {};
		const templatesRoot = `${getNAppRoot()}/templates`;
		const templatesList = fs.readdirSync(templatesRoot).filter(file => (
			fs.statSync(path.join(templatesRoot, file)).isDirectory()
		));
		templatesList.forEach((template) => {
			const templateRoot = `${templatesRoot}/${template}`;
			const packageJSON = `${templateRoot}/package.json`;
			const templateTree = dirTree(templateRoot);
			if (isValidTemplateTree(templateTree)) {
				templates[template] = {
					path: templateRoot,
					package: JSON.parse(fs.readFileSync(packageJSON, 'utf8')),
					tree: templateTree,
				};
			}
		});
		fs.writeJsonSync(getTemplatesRegistryRoot(), templates);
		if (useSpinner) {
			spinner.succeed();
		}
		resolve(templates);
	})
);

export const useLocalTemplate = (templateName, directory, step = '') => {
	const spinner = ora(`${step} Paste local template to new directory`).start();
	const nappRoot = getNAppRoot();
	const dir = path.resolve(directory, '.');
	const templateDirectory = `${nappRoot}/templates/${templateName}`;
	if (!isSafeToCreateAppIn(dir) || !fs.existsSync(templateDirectory)) {
		spinner.fail();
		console.log('');
		log.error(`The template ${chalk.white(templateName)} is not found or is invalid.`);
		process.exit(1);
	}
	fs.copySync(templateDirectory, dir);
	spinner.succeed();
	return directory;
};

export const useRemoteTemplate = (repository, directory, step = '') => (
	new Promise((resolve, reject) => {
		const spinner = ora(`${step} Paste remote template to new directory`).start();
		downloadGitRepo(repository, directory, { clone: true }, (err) => {
			if (err) {
				spinner.fail();
				reject({
					summary: `Failed to download repotory ${repository}`,
					errors: [err.message.trim],
				});
			} else {
				spinner.succeed();
				resolve(directory);
			}
		});
	})
);

export const useTemplateMiddleware = (template = settings.defaultTemplate, directory, step = '') => {
	if (template.indexOf('/') > -1) {
		return useRemoteTemplate(template, directory, step);
	}
	return useLocalTemplate(template, directory, step);
};

export const installTemplate = (templateDirectory, preferredName, step = '') => (
	new Promise((resolve, reject) => {
		const spinner = ora(`${step} Paste candidate into templates directory`).start();
		const templateName = preferredName || path.basename(templateDirectory);
		const templatesRoot = path.resolve(getNAppRoot(), 'templates/');
		const targetDirectory = path.join(templatesRoot, templateName);
		const templatePackage = path.join(templateDirectory, 'package.json');
		if (!fs.existsSync(templatePackage)) {
			spinner.fail();
			reject({ summary: 'A file package.json wasn\'t found in the template' });
		}
		if (fs.existsSync(targetDirectory)) {
			spinner.fail();
			reject({ summary: `A template with name ${chalk.white(templateName)} already exists.` });
		} else {
			if (preferredName) {
				const packageObj = fs.readJsonSync(templatePackage);
				fs.writeJsonSync(templatePackage, merge({}, packageObj, {
					name: preferredName,
				}));
			}
			fs.copySync(templateDirectory, targetDirectory, {
				filter: (filePath) => {
					if (filePath.match(/node_modules/) || filePath.match(/build/)) {
						return false;
					}
					return true;
				},
			});
			spinner.succeed();
			resolve(targetDirectory);
		}
	})
);

export const createTemplate = (directory, preferredName) => (
	new Promise((resolve, reject) => {
		Promise.resolve()
			.then(() => checkTemplateCandidate(directory, preferredName, '[1/3]'))
			.then(() => installTemplate(directory, preferredName, '[2/3]'))
			.then(() => updateTemplatesRegistry('[3/3]'))
			.then((registry) => {
				const templateName = path.basename(directory);
				resolve(registry[templateName]);
			})
			.catch((e) => {
				reject(e);
			});
	})
);

export const destroyTemplates = (templates = [], step = '') => (
	new Promise((resolve) => {
		const spinner = ora(`${step} Remove templates(s) from file system`).start();
		const registry = getInstalledTemplates();
		templates.forEach((templateId) => {
			if (registry[templateId]) {
				const templateRoot = path.resolve(registry[templateId].path);
				updateTemplatesRegistry();
				fs.removeSync(templateRoot);
			}
		});
		spinner.succeed();
		resolve();
	})
);

export const removeTemplates = (templates = []) => (
	new Promise((resolve, reject) => {
		Promise.resolve()
			.then(() => destroyTemplates(templates, '[1/2]'))
			.then(() => updateTemplatesRegistry('[2/2]'))
			.then(() => {
				resolve();
			})
			.catch((e) => {
				reject(e);
			});
	})
);

/**
 * PROJECTS RELATED
 * ==================================================================== */

export const checkRequiredFiles = (files, step = '') => (
	new Promise((resolve, reject) => {
		const spinner = ora(`${step} Check for required files`).start();
		let currentFilePath = null;
		try {
			files.forEach((filePath) => {
				currentFilePath = filePath;
				fs.accessSync(filePath, fs.F_OK);
			});
			spinner.succeed();
			resolve();
		} catch (err) {
			const dirName = path.dirname(currentFilePath);
			const fileName = path.basename(currentFilePath);
			spinner.fail();
			reject({
				summary: 'Couldn\'t find a required file:',
				errors: [`${fileName} at ${dirName}`],
			});
		}
	})
);

export const createDirectory = (directoryName, dir, step = '') => {
	const spinner = ora(`${step} Create or use directory ${chalk.white(directoryName)}`).start();
	const directory = path.resolve(dir || '', directoryName);
	const appName = path.basename(directory);
	fs.ensureDirSync(directory);
	if (!isSafeToCreateAppIn(directory)) {
		spinner.fail();
		console.log('');
		log.error(
			`The directory ${chalk.white(appName)} contains files that could conflict.`,
			'Try using a new directory name.',
		);
		process.exit(1);
	}
	spinner.succeed();
	return directory;
};

export const configurePackage = (config, directory, step = '') => {
	const spinnerStr = `${step} Configure ${chalk.white('package.json')} with project's data`;
	const spinner = ora(spinnerStr).start();
	const currentPackage = path.resolve(directory, './package.json');
	let currentPackageData = null;
	if (!fs.existsSync(currentPackage)) {
		spinner.fail();
		console.log('');
		log.error('A package.json does not exist in the current directory.');
		process.exit(1);
	}
	currentPackageData = JSON.parse(fs.readFileSync(currentPackage, 'utf8'));
	const packageJSON = Object.assign({}, currentPackageData, {
		name: config.name,
		version: '0.1.0',
		private: true,
		scripts: {
			start: 'napp run',
			build: 'napp build',
		},
	});
	if (settings.useBabel === true) {
		packageJSON.dependencies['babel-polyfill'] = '*';
	}
	if (settings.useEslint === true) {
		packageJSON.devDependencies.eslint = '*';
		if (settings.useBabel === true) {
			packageJSON.devDependencies['babel-eslint'] = '*';
		}
	}
	fs.writeFileSync(currentPackage, JSON.stringify(packageJSON, null, 2));
	spinner.succeed();
	return directory;
};

export const installDependencies = (directory, step = '') => {
	console.log('');
	console.log('Installing project dependencies...');
	console.log('');
	const childProc = childProcess.spawn('npm', ['install', '--silent'], {
		shell: true,
		cwd: path.resolve(directory, '.'),
		stdio: 'inherit',
	});
	childProc.on('close', (code) => {
		const spinner = ora(`${step} Install project dependencies`).start();
		if (code !== 0) {
			spinner.fail();
			console.log('');
			log.error('Install process failed.');
			process.exit(1);
		}
		spinner.succeed();
	});
	return childProc;
};

export const defineEnvironmentConfig = (env = 'dev', directory, step = '') => (
	new Promise((resolve) => {
		const spinner = ora(`${step} Define environment configuration`).start();
		const configFiles = [];
		const configName = `webpack.config.${env}.js`;
		const extendName = `webpack.extend.${env}.js`;
		const predConfigRoot = path.join(getNAppRoot(), 'config/', configName);
		const files = fs.readdirSync(directory).filter(filename => (
			(filename === configName) || (filename === extendName)
		));
		switch (files.length) {
		case 0:
			if (fs.existsSync(predConfigRoot)) {
				configFiles.push(require(predConfigRoot));
			}
			break;
		case 1:
			if (files[0] === configName) {
				configFiles.push(require(path.join(directory, configName)));
			} else if (files[0] === extendName && fs.existsSync(predConfigRoot)) {
				configFiles.push(
					require(predConfigRoot),
					require(path.join(directory, extendName)),
				);
			}
			break;
		case 2:
			configFiles.push(
				require(path.join(directory, configName)),
				require(path.join(directory, extendName)),
			);
			break;
		default:
		}
		if (configFiles.length === 0) {
			spinner.fail();
			log.error(
				`No configuration found that includes "${env}" on its name.`,
				'Notice that the only predefined environments are "dev" and "prod".',
			);
			process.exit(1);
		} else {
			spinner.succeed();
			resolve(webpackMerge.smart(configFiles));
		}
	})
);

/**
 * COMPILER SETUP
 * ==================================================================== */

export const setupCompiler = (envConfig, handleStats, step = '') => (
	new Promise((resolve) => {
		const spinner = ora(`${step} Setup webpack compiler`).start();
		const compiler = webpack(envConfig);
		compiler.plugin('done', (stats) => {
			spinner.succeed();
			handleStats(stats.toJson({}, true));
		});
		resolve(compiler);
	})
);

export const compileAssets = (config, step = '') => (
	new Promise((resolve, reject) => {
		const spinner = ora(`${step} Bundle scripts and styles`).start();
		webpack(config).run((err, stats) => {
			const summary = 'Failed to compile.';
			if (err) {
				spinner.fail();
				reject({ summary, errors: [err] });
			}
			if (stats.compilation.errors.length) {
				spinner.fail();
				reject({ summary, errors: stats.compilation.errors });
			}
			if (process.env.CI && stats.compilation.warnings.length) {
				spinner.fail();
				reject({ summary, errors: stats.compilation.warnings });
			}
			spinner.succeed();
			resolve(stats);
		});
	})
);

export const runDevServer = (envConfig, serverConfig, handleStats, step = '') => (
	new Promise((resolve, reject) => {
		const spinner = ora(`${step} Configure compiler and dev server`).start();
		const compiler = webpack(envConfig);
		compiler.plugin('done', (stats) => {
			clearConsole();
			handleStats(stats.toJson({}, true), serverConfig);
		});
		const devServer = new WebpackDevServer(compiler, {
			compress: true,
			clientLogLevel: 'none',
			contentBase: paths.public,
			quiet: true,
			watchOptions: {
				ignored: /node_modules/,
			},
			https: serverConfig.protocol === 'https',
			host: serverConfig.host,
		});
		devServer.use(historyApiFallback({
			disableDotRule: true,
			htmlAcceptHeaders: ['text/html', '*/*'],
		}));
		devServer.use(devServer.middleware);
		devServer.listen(serverConfig.port, (err) => {
			if (err) {
				reject({ summary: err });
				process.exit(1);
			}
			console.log('');
			console.log(chalk.cyan('Starting dev server...'));
			console.log('');
		});
		spinner.succeed();
		resolve();
	})
);

/**
 * MAIN ACTIONS
 * ==================================================================== */

export const createApp = (config, done = () => {}) => {
	Promise.resolve()
		.then(() => createDirectory(config.name, '', '[1/4]'))
		.then(directory => useTemplateMiddleware(config.template, directory, '[2/4]'))
		.then(root => configurePackage(config, root, '[3/4]'))
		.then(root => installDependencies(root, '[4/4]'))
		.then((proc) => {
			proc.on('close', (code) => {
				if (code === 0) {
					console.log('');
					console.log('Success!');
					done();
				}
			});
		})
		.catch((e) => {
			throw new Error(e);
		});
};

export const runApp = (env, directory, serverConfig, compilerStatsHandler) => (
	new Promise((resolve, reject) => {
		if (!directory) {
			reject({ summary: 'No directory specified.' });
		}
		Promise.resolve()
			.then(() => defineEnvironmentConfig(env, directory, '[1/2]'))
			.then(envConfig => runDevServer(envConfig, serverConfig, compilerStatsHandler, '[2/2]'))
			.then(() => {
				resolve();
			})
			.catch((e) => {
				reject(e);
			});
	})
);

export const buildApp = directory => (
	new Promise((resolve, reject) => {
		if (!directory) {
			reject({ summary: 'No directory specified.' });
		}
		Promise.resolve()
			.then(() => checkRequiredFiles(getRequiredTemplateFiles(directory), '[1/3]'))
			.then(() => defineEnvironmentConfig('prod', directory, '[2/3]'))
			.then(envConfig => compileAssets(envConfig, '[3/3]'))
			.then((stats) => {
				resolve(stats);
			})
			.catch((e) => {
				reject(e);
			});
	})
);
