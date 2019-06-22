const path = require("path");
const PostCompileWebpackPlugin = require("post-compile-webpack-plugin");
const touch = require("touch");

module.exports = (_env, argv) => {
  return {
    entry: "./src/index.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "build")
    },
    plugins: [
      new PostCompileWebpackPlugin(() => {
        const isDev = argv && argv.mode === "development";

        if (isDev) {
          // `web-ext` reloads the extension as soon as `build/index.js`
          // is modified, but unfortunately webpack modifies the file
          // before it has finished building.
          // In order to make `web-ext` detect the changes
          // we modify the file again after a short delay.
          // After a little testing it seems like the delay
          // has to be > 1000ms
          setTimeout(() => {
            touch("build/index.js");
          }, 1100);
        }
      })
    ]
  };
};
