// CLEAN BEFORE PUBLISH
module.exports = {
  // Fields in package.json to remove
  fields: ["scripts", "devDependencies"],
  // Files to remove
  files: [
    ".github",
    ".clean-publish.js",
    ".eslintignore",
    ".eslintrc",
    ".gitignore",
    ".huskyrc.js",
    ".yarnrc",
    "commitlint.config.js",
    "lint-staged.config.js",
    "webpack-federation.png",
  ],
  "package-manager": "yarn",
};
