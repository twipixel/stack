const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const RemoveWebpackPlugin = require('remove-webpack-plugin');

const phaserModule = path.join(__dirname, '/node_modules/phaser-ce/');
const p2 = path.join(phaserModule, 'build/custom/p2.js');
const pixi = path.join(phaserModule, 'build/custom/pixi.js');
const phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
const assets = path.join(__dirname, 'assets/');


/**
 * Webpack V2 설정
 * https://webpack.js.org/configuration/
 */
module.exports = {

    /**
     * https://webpack.js.org/concepts/entry-points/
     * https://webpack.js.org/concepts/entry-points/#separate-app-and-vendor-entries
     */
    entry: {
        app: [
            'babel-polyfill',
            path.resolve(__dirname, 'src/index.js')
        ],

        vendor: ['pixi', 'p2', 'phaser']
    },

    output: {

        pathinfo: true,

        path: path.resolve(__dirname, 'dist'),

        filename: 'bundle.js',

        publicPath: '/assets/',
    },

    /**
     * https://webpack.js.org/guides/migrating/
     * module.loaders is now module.rules
     */
    module: {

        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],

                /**
                 * 패키지 폴더 제외
                 */
                exclude: [
                    /node_modules/,
                    //path.resolve(__dirname, 'app/demo-files')
                ],

                use: 'babel-loader',
            },
            { test: /p2\.js/, use: ['expose-loader?p2'] },
            { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
            { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] }
        ],
    },

    resolve: {

        modules: [
            'node_modules',
        ],

        extensions: ['.js', '.json', '.jsx', '.css'],

        alias: {
            p2: p2,
            pixi: pixi,
            phaser: phaser,
            assets: assets
        },
    },

    context: __dirname, // string (absolute path!)
    // the home directory for webpack
    // the entry and module.rules.loader option
    //   is resolved relative to this directory

    target: 'web', // enum
    // the environment in which the bundle should run
    // changes chunk loading behavior and available modules

    plugins: [

        //new RemoveWebpackPlugin('dist'),

        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor'/* chunkName= */, filename: 'vendor.bundle.js'/* filename= */}),

        new CopyWebpackPlugin([{
                from: 'src/index.html',
                to: path.resolve(__dirname, 'dist/')
            }],
            {
                ignore: [ '*.md']
            }),

        /*new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            output: {
                comments: false
            },
            compress: {
                warnings: false
            }
        }),*/

        new BrowserSyncPlugin({
            host: 'localhost',
            port: 9000,
            server: {
                baseDir: './'
            },
            startPath: 'dist/index.html',
        }),

    ],

    watch: true,

    /**
     * sourcemap: 실제 map 파일을 생성 (map 파일을 따로 생성)
     * : 컴파일된 파일에서도 원래의 파일 구조를 확인할 수 있는 옵션
     * (inline 은 map 파일을 따로 생성하지 않고 bundle에 포함 시킵니다.)
     */
    devtool: 'source-map',

};
