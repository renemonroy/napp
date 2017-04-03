import temp from 'temp';
import fs from 'fs-extra';
import path from 'path';

import {
	getNAppRoot,
	getTemplatesRegistryRoot,
	getInstalledTemplates,
	updateTemplatesRegistry,
	createDirectory,
	pasteTemplate,
	configurePackage,
	installDependencies,
} from '../src/api';

temp.track();

describe('NApp', () => {
	describe('Utilities', () => {
		test('NApp root should exist', () => {
			const nappRoot = getNAppRoot();
			const basename = path.basename(nappRoot);
			expect(basename).toBe('napp');
		});
	});

	describe('Templates Management', () => {
		updateTemplatesRegistry();

		test('Should return installed templates', () => {
			const templates = getInstalledTemplates();
			expect(templates).toBeTruthy();
		});

		test('A basic template should exist in registry', () => {
			const templatesRegistry = getTemplatesRegistryRoot();
			const registryData = JSON.parse(fs.readFileSync(templatesRegistry, 'utf8'));
			expect(Object.keys(registryData)).toContain('react-basic');
		});
	});

	describe('Create project to current directory', () => {
		test('Add new folder on current directory', () => {
			const cwd = process.cwd();
			let projectRoot = null;
			const projectName = 'my-app';
			const location = temp.mkdirSync('ctx');
			process.chdir(location);
			projectRoot = createDirectory(projectName);
			process.chdir(cwd);
			expect(fs.readdirSync(`${projectRoot}`)).toBeTruthy();
		});

		test('Add new folder on specific directory', () => {
			const location = temp.mkdirSync('temp-dir');
			const projectRoot = createDirectory('my-second-dir', location);
			expect(fs.readdirSync(`${projectRoot}`)).toBeTruthy();
		});
	});

	describe('Paste template to project directory', () => {
		const templateName = 'react-basic';
		const projectName = 'my-app';
		const projectRoot = temp.mkdirSync(projectName);
		pasteTemplate(templateName, projectRoot);

		test('A package.json should exist', () => {
			expect(fs.existsSync(`${projectRoot}/package.json`)).toBeTruthy();
		});
		test('A public folder shoul exist', () => {
			expect(fs.existsSync(`${projectRoot}/public`)).toBeTruthy();
		});
		test('An index html shoul exist', () => {
			expect(fs.existsSync(`${projectRoot}/public/index.html`)).toBeTruthy();
		});
		test('A src folder should exist', () => {
			expect(fs.existsSync(`${projectRoot}/src`)).toBeTruthy();
		});
		test('An index script should exist', () => {
			expect(fs.existsSync(`${projectRoot}/src/index.js`)).toBeTruthy();
		});
	});

	describe('Configure current package.json', () => {
		let pckgFile = null;
		const projectName = 'my-app';
		const location = temp.mkdirSync(projectName);
		const packageJSON = `${location}/package.json`;
		fs.ensureFileSync(packageJSON);
		fs.writeJsonSync(packageJSON, { name: 'my-template', dependencies: {} });
		configurePackage({ name: projectName }, location);

		test('Package should contain determined requirements', () => {
			const pckgData = JSON.parse(fs.readFileSync(packageJSON, 'utf8'));
			expect(pckgData).toMatchObject({
				name: projectName,
				version: '0.1.0',
				private: true
			});
		});
	});

});
