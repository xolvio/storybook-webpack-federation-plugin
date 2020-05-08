/* eslint-disable */
const td = require("testdouble");
require("testdouble-jest")(td, jest);

const glob = td.replace("glob");
const ModuleFederationPlugin = td.replace(
  "webpack/lib/container/ModuleFederationPlugin"
);
const globs = ["./src/components/**/*.ts{,x}", "./src/elements/**/*.ts{,x}"];

beforeEach(() => {
  td.reset();
  td.when(glob.sync(globs[0])).thenReturn([
    "./src/components/icons/FlipchartIcon.tsx",
    "./src/components/icons/FlipchartIcon.stories.tsx",
    "./src/components/icons/ScreenIcon.tsx",
    "./src/components/icons/ScreenIcon.stories.tsx",
    "./src/components/icons/ShapesIcon.tsx",
    "./src/components/Sections.tsx",
    "./src/components/Title.tsx",
  ]);
  td.when(glob.sync(globs[1])).thenReturn([
    "./src/elements/Background.tsx",
    "./src/elements/ButtonPrimary.tsx",
    "./src/elements/Confetti7Rows.tsx",
    "./src/elements/Confetti7Rows.stories.tsx",
    "./src/elements/InlineButton.ts",
    "./src/elements/typography.tsx",
  ]);
});

const { returnPaths } = require("./index");

test("returnPaths returns the compiled paths without stories", () => {
  expect(returnPaths(globs)).toEqual([
    "./src/components/icons/FlipchartIcon.tsx",
    "./src/components/icons/ScreenIcon.tsx",
    "./src/components/icons/ShapesIcon.tsx",
    "./src/components/Sections.tsx",
    "./src/components/Title.tsx",
    "./src/elements/Background.tsx",
    "./src/elements/ButtonPrimary.tsx",
    "./src/elements/Confetti7Rows.tsx",
    "./src/elements/InlineButton.ts",
    "./src/elements/typography.tsx",
  ]);
});

test("returnPaths returns the compiled paths without stories using RegExp", () => {
  expect(returnPaths(globs, /stories\./)).toEqual([
    "./src/components/icons/FlipchartIcon.tsx",
    "./src/components/icons/ScreenIcon.tsx",
    "./src/components/icons/ShapesIcon.tsx",
    "./src/components/Sections.tsx",
    "./src/components/Title.tsx",
    "./src/elements/Background.tsx",
    "./src/elements/ButtonPrimary.tsx",
    "./src/elements/Confetti7Rows.tsx",
    "./src/elements/InlineButton.ts",
    "./src/elements/typography.tsx",
  ]);
});

const { prepareExposesObject } = require("./index");

console.log(
  prepareExposesObject([
    "./src/components/icons/FlipchartIcon.tsx",
    "./src/components/icons/ScreenIcon.tsx",
    "./src/components/icons/ShapesIcon.tsx",
    "./src/components/Sections.tsx",
    "./src/components/Title.tsx",
    "./src/elements/Background.tsx",
    "./src/elements/ButtonPrimary.tsx",
    "./src/elements/Confetti7Rows.tsx",
    "./src/elements/InlineButton.ts",
    "./src/elements/typography.tsx",
  ])
);

test("prepareExposesObject works for a single path", () => {
  expect(
    prepareExposesObject(["./src/components/icons/FlipchartIcon.tsx"])
  ).toEqual({
    exposes: {
      "components/icons/FlipchartIcon":
        "./src/components/icons/FlipchartIcon.tsx",
    },
  });
});

test("prepareExposesObject works with two paths", () => {
  expect(
    prepareExposesObject([
      "./src/components/icons/FlipchartIcon.tsx",
      "./src/elements/Confetti7Rows.tsx",
    ])
  ).toEqual({
    exposes: {
      "components/icons/FlipchartIcon":
        "./src/components/icons/FlipchartIcon.tsx",
      "elements/Confetti7Rows": "./src/elements/Confetti7Rows.tsx",
    },
  });
});

test("prepareExposesObject works with different file extension", () => {
  expect(prepareExposesObject(["./src/elements/Confetti7Rows.ts"])).toEqual({
    exposes: {
      "elements/Confetti7Rows": "./src/elements/Confetti7Rows.ts",
    },
  });
});

test("prepareExposesObject works with different file extension", () => {
  expect(prepareExposesObject(["./src/elements/Confetti7Rows.ts"])).toEqual({
    exposes: {
      "elements/Confetti7Rows": "./src/elements/Confetti7Rows.ts",
    },
  });
});

test("prepareExposesObject works with different path prefix", () => {
  expect(
    prepareExposesObject(["./lib/elements/Confetti7Rows.ts"], "./lib/")
  ).toEqual({
    exposes: {
      "elements/Confetti7Rows": "./lib/elements/Confetti7Rows.ts",
    },
  });
});

const { returnShared } = require("./index");

test("return shared returns react and react-dom by default", () => {
  expect(returnShared()).toEqual(["react", "react-dom"]);
});

test("return shared compiles the defaults with the passed items", () => {
  expect(returnShared(["styled-components", "modifyjs"])).toEqual([
    "react",
    "react-dom",
    "styled-components",
    "modifyjs",
  ]);
});

const { returnStorybookConfig } = require("./index");

test("returnStorybookConfig works", () => {
  expect(
    returnStorybookConfig({
      name: "xolvio_ui",
      files: {
        paths: globs,
        storiesExtension: ".stories",
        removePrefix: "./src/",
      },
      shared: ["styled-components"],
    })
  ).toEqual({
    name: "xolvio_ui",
    library: { type: "var", name: "xolvio_ui" },
    filename: "remoteEntry.js",
    exposes: {
      "components/icons/FlipchartIcon":
        "./src/components/icons/FlipchartIcon.tsx",
      "components/icons/ScreenIcon": "./src/components/icons/ScreenIcon.tsx",
      "components/icons/ShapesIcon": "./src/components/icons/ShapesIcon.tsx",
      "components/Sections": "./src/components/Sections.tsx",
      "components/Title": "./src/components/Title.tsx",
      "elements/Background": "./src/elements/Background.tsx",
      "elements/ButtonPrimary": "./src/elements/ButtonPrimary.tsx",
      "elements/Confetti7Rows": "./src/elements/Confetti7Rows.tsx",
      "elements/InlineButton": "./src/elements/InlineButton.ts",
      "elements/typography": "./src/elements/typography.tsx",
    },
    shared: ["react", "react-dom", "styled-components"],
  });
});

const { returnAppConfig } = require("./index");

test("returnAppConfig works", () => {
  expect(
    returnAppConfig({
      name: "app",
      remotes: ["xolvio_ui"],
      shared: ["styled-components"],
    })
  ).toEqual({
    name: "app",
    library: { type: "var", name: "app" },
    filename: "remoteEntry.js",
    remotes: {
      "xolvio_ui": "xolvio_ui",
    },
    shared: ["react", "react-dom", "styled-components"],
  });
});

test("returnAppConfig works if nothing extra shared", () => {
  expect(
    returnAppConfig({
      name: "myApp",
      remotes: ["xolvio_ui"],
    })
  ).toEqual({
    name: "myApp",
    library: { type: "var", name: "myApp" },
    filename: "remoteEntry.js",
    remotes: {
      "xolvio_ui": "xolvio_ui",
    },
    shared: ["react", "react-dom"],
  });
});

test("returnAppConfig works if no name", () => {
  expect(
    returnAppConfig({
      remotes: ["xolvio_ui"],
    })
  ).toEqual({
    name: "app",
    library: { type: "var", name: "app" },
    filename: "remoteEntry.js",
    remotes: {
      "xolvio_ui": "xolvio_ui",
    },
    shared: ["react", "react-dom"],
  });
});

const { returnRemotes } = require("./index");

test("it parses an array and returns an remotes object", () => {
  expect(returnRemotes(["xolvio_ui", "someOther"])).toEqual({
    "xolvio_ui": "xolvio_ui",
    someOther: "someOther",
  });
});

const { StorybookWebpackFederationPlugin } = require("./index");

test("it returns the app config through ModuleFederationPlugin if remotes are specified", () => {
  new StorybookWebpackFederationPlugin({
    remotes: ["xolvio_ui"],
  });
  td.verify(
    ModuleFederationPlugin({
      name: "app",
      library: { type: "var", name: "app" },
      filename: "remoteEntry.js",
      remotes: {
        "xolvio_ui": "xolvio_ui",
      },
      shared: ["react", "react-dom"],
    })
  );
});

test("it returns the storybook config through ModuleFederationPlugin if files are specified", () => {
  new StorybookWebpackFederationPlugin({
    name: "xolvio_ui",
    files: {
      paths: globs,
      storiesExtension: ".stories",
      removePrefix: "./src/",
    },
    shared: ["styled-components"],
  });
  td.verify(
    ModuleFederationPlugin({
      name: "xolvio_ui",
      library: { type: "var", name: "xolvio_ui" },
      filename: "remoteEntry.js",
      exposes: {
        "components/icons/FlipchartIcon":
          "./src/components/icons/FlipchartIcon.tsx",
        "components/icons/ScreenIcon": "./src/components/icons/ScreenIcon.tsx",
        "components/icons/ShapesIcon": "./src/components/icons/ShapesIcon.tsx",
        "components/Sections": "./src/components/Sections.tsx",
        "components/Title": "./src/components/Title.tsx",
        "elements/Background": "./src/elements/Background.tsx",
        "elements/ButtonPrimary": "./src/elements/ButtonPrimary.tsx",
        "elements/Confetti7Rows": "./src/elements/Confetti7Rows.tsx",
        "elements/InlineButton": "./src/elements/InlineButton.ts",
        "elements/typography": "./src/elements/typography.tsx",
      },
      shared: ["react", "react-dom", "styled-components"],
    })
  );
});

test("it returns the config with remotes and exposes if files and remotes are specified", () => {
  new StorybookWebpackFederationPlugin({
    name: "xolvio_ui",
    files: {
      paths: globs,
      storiesExtension: ".stories",
      removePrefix: "./src/",
    },
    remotes: ["xolvio_ui"],
    shared: ["styled-components"],
  });
  td.verify(
    ModuleFederationPlugin({
      name: "xolvio_ui",
      library: { type: "var", name: "xolvio_ui" },
      filename: "remoteEntry.js",
      remotes: {
        "xolvio_ui": "xolvio_ui",
      },
      exposes: {
        "components/icons/FlipchartIcon":
          "./src/components/icons/FlipchartIcon.tsx",
        "components/icons/ScreenIcon": "./src/components/icons/ScreenIcon.tsx",
        "components/icons/ShapesIcon": "./src/components/icons/ShapesIcon.tsx",
        "components/Sections": "./src/components/Sections.tsx",
        "components/Title": "./src/components/Title.tsx",
        "elements/Background": "./src/elements/Background.tsx",
        "elements/ButtonPrimary": "./src/elements/ButtonPrimary.tsx",
        "elements/Confetti7Rows": "./src/elements/Confetti7Rows.tsx",
        "elements/InlineButton": "./src/elements/InlineButton.ts",
        "elements/typography": "./src/elements/typography.tsx",
      },
      shared: ["react", "react-dom", "styled-components"],
    })
  );
});

test("it returns the simple config for storybook if only names and files are passed", () => {
  new StorybookWebpackFederationPlugin({
    name: "xolvio_ui",
    files: {
      paths: globs,
    },
  });
  td.verify(
    ModuleFederationPlugin({
      name: "xolvio_ui",
      library: { type: "var", name: "xolvio_ui" },
      filename: "remoteEntry.js",
      exposes: {
        "components/icons/FlipchartIcon":
          "./src/components/icons/FlipchartIcon.tsx",
        "components/icons/ScreenIcon": "./src/components/icons/ScreenIcon.tsx",
        "components/icons/ShapesIcon": "./src/components/icons/ShapesIcon.tsx",
        "components/Sections": "./src/components/Sections.tsx",
        "components/Title": "./src/components/Title.tsx",
        "elements/Background": "./src/elements/Background.tsx",
        "elements/ButtonPrimary": "./src/elements/ButtonPrimary.tsx",
        "elements/Confetti7Rows": "./src/elements/Confetti7Rows.tsx",
        "elements/InlineButton": "./src/elements/InlineButton.ts",
        "elements/typography": "./src/elements/typography.tsx",
      },
      shared: ["react", "react-dom"],
    })
  );
});

test.skip("it returns the simple config for storybook if only names and files are passed", () => {
  new StorybookWebpackFederationPlugin({
    name: "xolvio_ui",
    files: globs,
  });
  td.verify(
    ModuleFederationPlugin({
      name: "xolvio_ui",
      library: { type: "var", name: "xolvio_ui" },
      filename: "remoteEntry.js",
      exposes: {
        "components/icons/FlipchartIcon":
          "./src/components/icons/FlipchartIcon.tsx",
        "components/icons/ScreenIcon": "./src/components/icons/ScreenIcon.tsx",
        "components/icons/ShapesIcon": "./src/components/icons/ShapesIcon.tsx",
        "components/Sections": "./src/components/Sections.tsx",
        "components/Title": "./src/components/Title.tsx",
        "elements/Background": "./src/elements/Background.tsx",
        "elements/ButtonPrimary": "./src/elements/ButtonPrimary.tsx",
        "elements/Confetti7Rows": "./src/elements/Confetti7Rows.tsx",
        "elements/InlineButton": "./src/elements/InlineButton.ts",
        "elements/typography": "./src/elements/typography.tsx",
      },
      shared: ["react", "react-dom"],
    })
  );
});
