import inquirer from 'inquirer';
import union from 'lodash.union';
import { getInstalledTemplates, removeTemplates } from '../api';
import { printErrors } from '../utilities';

const removeMultipleTemplates = (templatesList) => {
	if (templatesList.length > 0) {
		return removeTemplates(templatesList);
	}
	return inquirer
		.prompt([
			{
				type: 'checkbox',
				name: 'selectedTemplates',
				message: 'Select templates',
				choices: () => {
					let templates = null;
					templates = getInstalledTemplates();
					return Object.keys(templates);
				},
			},
			{
				type: 'confirm',
				name: 'confirm',
				message: 'Are you sure you want to remove those templates?',
				default: false,
				when: answers => answers.selectedTemplates.length > 0,
			},
		])
		.then((answers) => {
			if (answers.confirm === true) {
				console.log('');
				return removeTemplates(answers.selectedTemplates);
			}
			return process.exit(1);
		});
};

export default (template, moreTemplates) => {
	let templatesList = [];
	if (template) {
		templatesList.push(template);
	}
	if (moreTemplates) {
		templatesList = union(templatesList, moreTemplates);
	}
	removeMultipleTemplates(templatesList)
		.then(() => {
			console.log('');
			console.log('Success!');
		})
		.catch(({ summary, errors }) => {
			console.log('');
			printErrors(summary, errors || []);
			process.exit(1);
		});
};
