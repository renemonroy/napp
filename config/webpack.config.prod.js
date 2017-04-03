var path = require('path');
var url = require('url');
var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var paths = require('./paths');
var settings = require('./settings.json');

process.noDeprecation = true;

function ensureSlash(root, needsSlash) {
	var hasSlash = root.endsWith('/');
	if (hasSlash && !needsSlash) {
		return root.substr(root, root.length - 1);
	} else if (!hasSlash && needsSlash) {
		return root + '/';
	}
	return root;
}

var homepagePath = require(paths.packageJson).homepage;
var homepagePathname = homepagePath ? url.parse(homepagePath).pathname : '/';
var publicPath = ensureSlash(homepagePathname, true);
var publicUrl = ensureSlash(homepagePathname, false);

var webpackProdConfig = {
	bail: true,
	devtool: 'source-map',
	entry: [
		paths.indexJs,
	],
	output: {
		path: paths.build,
		filename: 'static/js/[name].[chunkhash:8].js',
		chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
		publicPath: `.${publicPath}`,
	},
	resolve: {
		modules: ['node_modules', paths.appNodeModules].concat(paths.nodePaths),
		extensions: ['.js', '.json', '.jsx'],
	},
	resolveLoader: {
		modules: [
			path.join(__dirname, '../node_modules'),
			paths.appNodeModules,
		],
	},
	module: {
		rules: [
			{
				test: /\.styl$/,
				loader: 'style-loader!css-loader!stylus-loader',
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: 'file-loader?name=static/fonts/[name].[ext]',
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(paths.build, {
			root: process.cwd(),
			verbose: false,
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.indexHtml,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				screw_ie8: true,
				warnings: false,
			},
			mangle: {
				screw_ie8: true,
			},
			output: {
				comments: false,
				screw_ie8: true,
			},
			sourceMap: true,
		}),
		new ExtractTextPlugin('static/css/[name].[contenthash:8].css'),
		new ManifestPlugin({
			fileName: 'asset-manifest.json',
		}),
	],
};

if (settings.useBabel === true) {
	webpackProdConfig.entry.splice(1, 0, 'babel-polyfill');
	webpackProdConfig.module.rules.splice(0, 0, {
		test: /\.(js|jsx)$/,
		loader: 'babel-loader',
		include: [
			paths.src,
		],
	});
}

module.exports = webpackProdConfig;
