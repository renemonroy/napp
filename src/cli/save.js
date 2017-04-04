import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createTemplate } from '../api';
import { printErrors } from '../utilities';

const saveTemplate = (templateName) => {
	const currentDirectory = fs.realpathSync(process.cwd());
	if (templateName) {
		return createTemplate(currentDirectory, templateName);
	}
	const folderName = path.basename(currentDirectory);
	return inquirer
		.prompt([
			{
				type: 'confirm',
				name: 'change',
				message: `Do you want to change the template name ${chalk.white(folderName)}?`,
				default: true,
			},
			{
				type: 'input',
				name: 'name',
				message: `${chalk.green('Template\'s Name:')}`,
				default: 'your-template',
				when: answers => answers.change === true,
			},
		])
		.then(({ change, name }) => {
			console.log('');
			return createTemplate(currentDirectory, change ? name : null);
		});
};

export default (templateName) => {
	console.log('Creating a template from current directory...');
	console.log('');
	saveTemplate(templateName)
		.then(() => {
			console.log('');
			console.log('Success!');
			process.exit();
		})
		.catch(({ summary, errors }) => {
			console.log('');
			printErrors(summary, errors || []);
			process.exit(1);
		});
};
