import fs from 'fs';
import { buildApp } from '../api';
import { printErrors } from '../utilities';

export default () => {
	process.env.NODE_ENV = 'production';
	console.log('Creating an optimized production build...');
	console.log('');
	buildApp(fs.realpathSync(process.cwd()))
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
