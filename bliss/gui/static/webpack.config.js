const webpack = require('webpack')
const path    = require('path')

var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: "./index.js",
    output: {
        path: __dirname + '/build',
        filename: "bliss.bundle.js"
    },
    module: {
        loaders: [
            {
                test:    /\.js$/,
                exclude: /node_modules/,
                loader:  'babel-loader',
                query:   { presets: ['es2015'] }
            },
            {
		test:   /\.css$/,
		loader: ExtractTextPlugin.extract("style-loader", "css-loader")
	    },
            {
		test:   /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
		loader: 'url?limit=10000&mimetype=application/font-woff'
	    },
            {
		test:   /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
		loader: 'url?limit=10000&mimetype=application/octet-stream'
	    },
            {
		test:   /\.eot(\?v=\d+\.\d+\.\d+)?$/,
		loader: 'file'
	    },
            {
		test:   /\.svg(\?v=\d+\.\d+\.\d+)?$/,
		loader: 'url?limit=10000&mimetype=image/svg+xml'
	    }
        ]
    },

    resolve: {
        root: path.resolve('./js')
    },

    plugins: [
        new ExtractTextPlugin("bliss.bundle.css")
    ]
};
