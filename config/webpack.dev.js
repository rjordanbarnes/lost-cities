const webpack = require("webpack");

module.exports = {
    entry: ['./src/app.js',
            'webpack/hot/dev-server',
            'webpack-hot-middleware/client'],
    output: {
        path: '/',
        filename: 'bundle.js',
        publicPath: 'http://localhost:8889/'
        // filename: './dist/bundle.js'
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.min.js'
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run post css actions
                    options: {
                        plugins: function () { // post css plugins, can be exported to postcss.config.js
                            return [
                                require('precss'),
                                require('autoprefixer')
                            ];
                        }
                    }
                }]
            }
        ]
    },
    target: 'web'
};