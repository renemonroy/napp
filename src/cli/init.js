import inquirer from 'inquirer';
import chalk from 'chalk';
import { defaultTemplate } from '../../config/settings.json';
import { clearConsole } from '../utilities';
import {
	getInstalledTemplates,
	isValidAppName,
	createApp,
} from '../api';

const confirm = (project) => {
	console.log(project);
	console.log('');
	inquirer
		.prompt([{
			type: 'confirm',
			name: 'confirm',
			message: `${chalk.green('Is this ok?')}`,
			default: true,
		}])
		.then((answers) => {
			if (answers.confirm === true) {
				console.log('');
				createApp(JSON.parse(project));
			}
		});
};

const showWizard = () => {
	clearConsole();
	console.log('This utility will walk you through creating the initial files of your project.');
	console.log('The name of the project must follow NPM\'s naming pattern.');
	console.log('');
	console.log('Press ^C at any time to quit.');
	console.log('');
	inquirer
		.prompt([
			{
				type: 'input',
				name: 'name',
				message: `${chalk.green('Project\'s Name:')}`,
				default: 'your-project',
				validate: isValidAppName,
			},
			{
				type: 'list',
				name: 'template',
				message: `${chalk.green('Template:')}`,
				default: defaultTemplate,
				choices: () => {
					let templates = null;
					templates = getInstalledTemplates();
					return Object.keys(templates).map((templateId) => {
						const { name, description } = templates[templateId].package;
						const short = chalk.cyan(name);
						return {
							name: `${short} ${chalk.reset(description)}`,
							value: templateId,
							short,
						};
					});
				},
			},
		])
		.then((answers) => {
			console.log('');
			confirm(JSON.stringify(answers, null, '  '));
		});
};

export default (projectName, source) => {
	if (projectName && !source) {
		confirm(JSON.stringify({ name: projectName, template: defaultTemplate }, null, '  '));
	} else if (projectName && source) {
		confirm(JSON.stringify({ name: projectName, template: source }, null, '  '));
	} else {
		showWizard();
	}
};
