var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var paths = require('./paths');
var settings = require('./settings.json');

process.noDeprecation = true;

var webpackDevConfig = {
	devtool: 'cheap-module-source-map',
	entry: [
		require.resolve('../utils/webpackHotDevClient'),
		paths.indexJs
	],
	output: {
		path: paths.build,
		pathinfo: true,
		filename: 'static/js/bundle.js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
        test: /\.css$/,
				loader: 'style-loader!css-loader',
			},
			{
				test: /\.styl$/,
				loader: 'style-loader!css-loader!stylus-loader'
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: 'file-loader?name=static/fonts/[name].[ext]'
			}
		]
	},
	resolve: {
		modules: ['node_modules', paths.appNodeModules].concat(paths.nodePaths),
		extensions: ['.js', '.json', '.jsx']
	},
	resolveLoader: {
		modules: [
			path.join(__dirname, '../node_modules'),
			paths.appNodeModules,
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.indexHtml,
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		}),
		new webpack.HotModuleReplacementPlugin(),
		new CaseSensitivePathsPlugin()
	]
};

if (settings.useBabel === true) {
	webpackDevConfig.entry.splice(1, 0, 'babel-polyfill');
	webpackDevConfig.module.rules.splice(0, 0, {
		test: /\.(js|jsx)$/,
		loader: 'babel-loader',
		include: [
			paths.src,
		],
		query: {
			cacheDirectory: true,
		}
	});
}

if (settings.useEslint === true) {
	webpackDevConfig.module.rules.splice(0, 0, {
		enforce: 'pre',
		test: /\.(js|jsx)$/,
		loader: 'eslint-loader',
		include: paths.src,
	});
}

module.exports = webpackDevConfig;
