import chalk from 'chalk';
import { getInstalledTemplates } from '../api';

export default () => {
	let strOutput = '';
	const registry = getInstalledTemplates();
	const templates = Object.keys(registry);
	const templatesSize = templates.length;
	const templatesStr = templatesSize === 1 ? 'template' : 'templates';
	templates.forEach((templateId) => {
		const { name, description } = registry[templateId].package;
		const short = chalk.cyan(name);
		strOutput = `${short} ${chalk.reset(description)}\n${strOutput}`;
	});
	console.log('');
	console.log(strOutput);
	console.log(chalk.white(`${templatesSize} ${templatesStr} installed`));
};
