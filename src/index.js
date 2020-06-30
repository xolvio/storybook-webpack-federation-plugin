const glob = require("glob");
const path = require("path");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

const returnPaths = (globs = [], storiesExtension = /\.?stories\./) => {
  return globs
    .reduce((previousValue, currentValue) => {
      return [...previousValue, ...glob.sync(currentValue)];
    }, [])
    .filter((p) => !new RegExp(storiesExtension).test(p));
};

const prepareExposesObject = (paths, removePrefix = "./src/") => {
  return paths.length > 0
    ? paths.reduce(
        (previousValue, currentValue) => {
          const extension = path.extname(currentValue);

          return {
            exposes: {
              ...previousValue.exposes,
              [currentValue
                .replace(removePrefix, "./")
                .replace(extension, "")
                .replace(/\/index$/, "")]: currentValue,
            },
          };
        },
        { exposes: {} }
      )
    : {};
};

const returnShared = (extraToShare = []) => {
  return [...new Set(["react", "react-dom", ...extraToShare])];
};

const returnRemotes = (remotes) =>
  remotes.reduce((prev, curr) => {
    return { ...prev, [curr]: curr };
  }, {});

const prepareRemotesObject = (remotes) =>
  remotes.length > 0 ? { remotes: returnRemotes(remotes) } : {};

const returnStorybookConfig = ({
  name = "app",
  files = {},
  remotes = [],
  shared,
}) => ({
  name,
  library: { type: "var", name },
  filename: "remoteEntry.js",
  shared: returnShared(shared),
  ...prepareExposesObject(
    returnPaths(
      Array.isArray(files) ? files : files.paths,
      files.storiesExtension
    ),
    files.removePrefix
  ),
  ...prepareRemotesObject(remotes),
});

const returnAppConfig = (opts) => returnStorybookConfig(opts);

class StorybookWebpackFederationPlugin {
  constructor(options) {
    return new ModuleFederationPlugin(returnStorybookConfig(options));
  }
}

module.exports = {
  returnPaths,
  prepareExposesObject,
  returnShared,
  returnStorybookConfig,
  returnAppConfig,
  returnRemotes,
  StorybookWebpackFederationPlugin,
};
