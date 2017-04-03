var path = require('path');
var fs = require('fs');

var appDirectory = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

var nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp);

module.exports = {
  build: resolveApp('build'),
  public: resolveApp('public'),
  indexHtml: resolveApp('public/index.html'),
  indexJs: resolveApp('src/index.js'),
  packageJson: resolveApp('package.json'),
  src: resolveApp('src'),
	appNodeModules: resolveApp('node_modules'),
	ownNodeModules: resolveApp('node_modules'),
	nodePaths: nodePaths,
	babelPolyfill: resolveApp('node_modules/babel-polyfill'),
	root: appDirectory,
};
