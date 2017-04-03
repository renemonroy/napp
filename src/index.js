import path from 'path';
import program from 'commander';
import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import cli from './cli';
import pkg, { version } from '../package.json';
import { getNAppRoot, updateTemplatesRegistry } from './api';
import { openFile } from './utilities';
import { notifyUpdates } from '../config/settings.json';

if (notifyUpdates) {
	updateNotifier({ pkg }).notify();
}

program
	.version(version)
	.usage(`${chalk.green('<command>')} [options]`)
	.option('-c, --config', 'Open settings in default editor')
	.option('-r, --refresh', 'Update common utilities');

program
	.command('init [projectName] [source]')
	.description('Initialize a new project inside current directory')
	.option('-C, --clone', 'Force to init a project by downloading a template via ssh')
	.action(cli.init);

program
	.command('run')
	.description('Run the project within a dev server')
	.option('-e, --env <name>', 'The environment\'s configuration to use')
	.option('-p, --port <number>', 'Port to use on dev server', parseInt)
	.action(cli.run);

program
	.command('build')
	.description('Build bundles of scripts and styles in production mode')
	.action(cli.build);

program
	.command('list')
	.alias('ls')
	.description('List all templates installed')
	.action(cli.list);

program
	.command('make [template]')
	.alias('mk')
	.description('Make a template from current folder')
	.action(cli.make);

program
	.command('remove [template] [templates...]')
	.alias('rm')
	.description('Remove templates from file system')
	.action(cli.remove);

program
	.command('*')
	.description('Unknown commands return error')
	.action(() => console.log(chalk.red('>>'), 'Unknown command'));

program
	.parse(process.argv);

if (program.refresh) {
	updateTemplatesRegistry();
}

if (program.config) {
	openFile(path.join(getNAppRoot(), 'config/settings.json'));
}
