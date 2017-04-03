import chalk from 'chalk';
import detectPort from 'detect-port';
import { exec } from 'child_process';
import paths from '../config/paths';

export const log = {
	error(msg, hint = null) {
		console.log(`${chalk.red('>>')} ${msg}`);
		if (hint && hint.length > 0) {
			console.log(`${chalk.blue('↳')}  ${hint}`);
		}
	},
};

export const printErrors = (summary, errors) => {
	log.error(summary);
	errors.forEach((err) => {
		console.log(err.message || err);
	});
};

export const clearConsole = () => {
	process.stdout.write(
		process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H',
  );
};

export const openFile = (fileRoot) => {
	let command = '';
	switch (process.platform) {
	case 'darwin':
		command = 'open';
		break;
	case 'win32':
	case 'win64':
		command = 'start';
		break;
	default:
		command = 'xdg-open';
		break;
	}
	exec(`${command} ${fileRoot}`);
};

export const ensureAvailablePort = (portToTest, prompter) => (
	new Promise((resolve, reject) => {
		const detectAvailablePort = (ptt) => {
			detectPort(ptt).then((port) => {
				if (port === ptt) {
					resolve(ptt);
				} else {
					prompter(ptt).then(({ changePort, port: newPort }) => {
						if (!changePort) {
							reject('Aborted.');
						} else {
							detectAvailablePort(parseInt(newPort, 10));
						}
					});
				}
			});
		};
		detectAvailablePort(portToTest);
	})
);

export const removeFileNameHash = fileName => (
	fileName
		.replace(paths.build, '')
		.replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3)
);
