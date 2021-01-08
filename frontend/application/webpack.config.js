const webpack = require("webpack");
const path = require("path");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const { VueLoaderPlugin } = require("vue-loader");

/* --- configuration --- */
// Legacy: ES5
// Module: ES6
const legacy =
    process.env.LEGACY &&
    (process.env.LEGACY === "true" || process.env.LEGACY === "1");

// debug == development
const debug =
    process.env.DEBUG &&
    (process.env.DEBUG === "true" || process.env.DEBUG === "1");

process.env.NODE_ENV = debug ? 'debug' : 'production';

// Paths
let publicPath = `/webresources/build/module/`;
if(legacy) {
    publicPath = `/webresources/build/legacy/`;
}
const resourcesPath = path.resolve(
    __dirname,
    "../../craft/web/webresources",
);
const buildPath = path.resolve(
    __dirname,
    "../../craft/web/webresources/build/",
    `${legacy ? "legacy" : "module"}`,
);

// CSS Loader / PostCSS configuration
const cssLoaderConfig = [
    {
        loader: "css-loader",
        options: {
            // import: true,
            importLoaders: 1,
            sourceMap: debug,
        },
    },
    {
        loader: "postcss-loader",
        options: {
            ident: "postcss",
            sourceMap: debug ? "inline" : false,
            plugins: [
                require("postcss-import"),
                require("tailwindcss")({ config: './application/tailwind.config.js' }),
                require("postcss-preset-env")({
                    stage: 1,
                    sourceMap: true,
                    features: {
                        "custom-properties": {
                            preserve: false,
                        },
                        "custom-media-queries": true,
                        "focus-within-pseudo-class": false,
                    },
                    browsers: "> 0.5% in CH, Firefox ESR, not dead",
                }),
                require("autoprefixer"),
            ]
        },
    },
];

if (!debug) {
    cssLoaderConfig[1].options.plugins.push(
        require("cssnano")({
            preset: [
                "default",
                {
                    calc: false,
                },
            ],
        }),
    );
}

// Entries with polyfills
const entry = {
    main: [
        "objectFitPolyfill",
        "intersection-observer",
        "./application/polyfills",
        "./application/src/main.ts",
    ],
    critical: "./application/src/styles/bundles/styles-critical.css",
    helium: "./application/src/styles/bundles/styles-async.css",
};

if (legacy) {
    entry["main"].unshift("core-js/stable", "whatwg-fetch", "matchmedia-polyfill");
}

module.exports = {
    entry,
    output: {
        filename: "[name].js",
        path: buildPath,
        publicPath,
    },
    resolve: {
        extensions: [".ts", ".js", ".css"],
        alias: {
            "vue": "vue/dist/vue.esm-bundler.js",
        },
    },
    plugins: [
        new FixStyleOnlyEntriesPlugin(),
        new CleanWebpackPlugin( {
            cleanStaleWebpackAssets: false
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
        })
    ],
    module: {
        rules: [
            {
                // Vue Single file components
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        i18n: "@kazupon/vue-i18n-loader",
                    },

                    // Transforms asset paths in Vue templates to require expressions that webpack can handle
                    transformToRequire: {
                        video: "src",
                        source: "src",
                        img: "src",
                        image: "xlink:href",
                    },
                },
            },
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                    silent: true,
                    // overwrite tsconfig.json configuration
                    compilerOptions: legacy
                        ? {
                              target: "es5",
                          }
                        : {},
                },
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, ...cssLoaderConfig],
            },
            {
                // All assets that have to be packaged
                test: /\.(png|svg|jpg|gif|ttf|otf|woff|woff2)$/,
                use: [
                    {
                        loader: "file-loader",

                        options: {
                            esModule: false,
                        },
                    },
                ],
            },
        ],
    },
    devtool: debug ? "inline-source-map" : undefined,
};
