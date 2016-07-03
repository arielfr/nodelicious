var webpack = require("webpack"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    ExtractStyles = new ExtractTextPlugin('css/[name].css');

module.exports = {
    entry: {
        index: './webpack/src/scripts/index.js',
        login: './webpack/src/scripts/login.js',
        vendors: ['./bower_components/bootstrap/dist/js/bootstrap.js', './bower_components/bootstrap-material-design/dist/js/material.js', './bower_components/bootstrap-material-design/dist/js/ripples.js']
    },
    output: {
        path: './assets',
        filename: 'js/[name].js'
    },
    resolve: {
        root: './',
        alias: {
            jquery: 'bower_components/jquery/dist/jquery.min'
        }
    },
    module: {
        loaders: [
            /*
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            },
             */
            {
                test: /\.css$/,
                loader: ExtractStyles.extract("style-loader", "css-loader?-url&-import")
            },
            {
                test: /\.less$/,
                loader: ExtractStyles.extract("style-loader", "css-loader?-url!less-loader")
            }
        ]
    },
    plugins: [
        ExtractStyles,
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendors',
            filename: 'js/[name].js',
            minChunks: Infinity
        }),
        new CopyWebpackPlugin([
            {
                from: './images/**'
            },
            {
                from: './fonts/**'
            },
            {
                from: './bower_components/bootstrap/dist/css/bootstrap.css',
                to: 'css',
                flatten: true
            },
            {
                from: './bower_components/bootstrap/dist/css/bootstrap.css.map',
                to: 'css',
                flatten: true
            },
            {
                from: './bower_components/bootstrap-material-design/dist/css/ripples.css',
                to: 'css',
                flatten: true
            },
            {
                from: './bower_components/bootstrap-material-design/dist/css/ripples.css.map',
                to: 'css',
                flatten: true
            }
        ],
            {
                copyUnmodified: false
            }
        ),
        //Put jQuery in global
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};