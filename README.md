# Storybook Webpack Federation Plugin

Exposes all the components in your Storybook as Webpack 5 federated components.

## Motivation

Design systems are all the fad these days, and we wanted to create an easy way to share them. Since Storybook has proven to be a great way do that, we figured why not also make the source of truth for the current state of components also be the place where you use them?

[Check out the article we wrote about it here.]() (coming very soon)
[Here is the exmaple repo that you can use to follow along](https://github.com/xolvio/webpack-federation-storybook-design-systems-demo)

## Installation

### For your Storybook

Install the plugin.

```bash
yarn add storybook-webpack-federation-plugin -D
```

Storybook currently uses Webpack 4, which means we have to do a few extra steps to install Webpack 5 as that's where federation has been added. Once Storybook starts using Webpack 5 we won't need to do these steps.

First we need to install the latest Webpack5 directly from Github:

```bash
yarn add webpack@"git://github.com/webpack/webpack.git#dev-1" webpack-cli -D
```

Storybook has its own webpack configuration that you can normally extend, but we can't do that yet so we have to create a new `webpack.config.js` specific for WP5. Here's an example configuration which you might want to customize based on your setup.

```javascript
const path = require("path");

module.exports = {
  cache: false,

  mode: "development",
  devtool: "source-map",

  optimization: {
    minimize: false,
  },

  resolve: {
    extensions: [".jsx", ".js", ".json", ".tsx", ".ts"],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve("babel-loader"),
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  output: {},

  plugins: [],
};
```

Next we'll import the Storybook Webpack Federation Plugin:

```javascript
const {
  StorybookWebpackFederationPlugin,
} = require("storybook-webpack-federation-plugin");
```

Add a new endpoint as an `output` of Storybook:

```javascript
  output: {
    // location of where the compiled Storybook lives
    path: path.resolve(__dirname, "storybook-static/federation"),
    // the url where Storybook will be accessible from
    publicPath: "//localhost:3030/federation/",
  },
```

And finally configure the plugin itself in the `plugins` section:

```javascript
plugins: [
    new StorybookWebpackFederationPlugin({
      name: "xolvio_ui", // this will be used by the consuming federation host
      files: { // paths to the components
        paths: ["./src/**/*.ts{,x}"],
      },
    }),
  ],
```

For convenience you'll probably want to set npm scripts for building your storybook and federation like this:

```json
"scripts": {
    "start": "start-storybook -p 9009 -s public,assets",
    "build": "yarn build:storybook && yarn build:federation",
    "build:federation": "rm -rf storybook-static/federation && webpack --mode production",
    "serve": "http-server ./storybook-static -p 3030 --cors",
    "build:storybook": "build-storybook -s public,assets"
}
```

Let's now build and serve it:

```bash
yarn build && yarn serve
```

And that's all for the Storybook side!

### For your app

Install the plugin:

```bash
yarn add storybook-webpack-federation-plugin -D
```

We need to make sure we are using the beta version of Webpack 5 here as well:

```bash
yarn add webpack@"git://github.com/webpack/webpack.git#dev-1" -D
```

Go to your `webpack.config.js` and require the plugin at the top as before:

```javascript
const {
  StorybookWebpackFederationPlugin,
} = require("storybook-webpack-federation-plugin");
```

Use it in the plugins section:

```javascript
  plugins: [
    new StorybookWebpackFederationPlugin({
      remotes: ["xolvio_ui"],
    }),
  ],
```

Let's add the Storybook endpoint that we exposed above in the app's `index.html`:

```html
<head>
  <script src="http://localhost:3030/federation/remoteEntry.js"></script>
</head>
```

There is one remaining change that you have to do, and it is a bit confusing.
Your entry point has to be a pure js file that uses a dynamic import.

`src/index.js`

```javascript
import("./bootstrap");
```

Example `src/bootstrap.tsx`

```typescript jsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));
```

Make sure your `webpack.config.js` file has the entry set to this new file:

```javascript
  entry: "./src/index",
```

Feel free to skip this explanation, and just trust us here. Nonetheless, if you are curious Webpack Federation authors explain it this way:

> As we are sharing code in the current built, we have to provide a promise and Webpack needs to boot.
> Then the normal Webpack runtime gets emitted, thus it’s going to promptly execute the entry point, subsequently, we have to adjust the impact of that.
> So a promise is that we can hold up that execution for a moment to let the Webpack runtime interface with any remotes and comprehends what it needs or already has.
> So the simplest method to do that is to move your normal entry point into bootstrap.js file and afterwards just progressively import that bootstrap.
> ( https://medium.com/swlh/webpack-5-module-federation-stitching-two-simple-bundles-together-fe4e6a069716 )

And now you can start using components from your published Storybook!

```javascript
import { Background } from "xolvio_ui/elements/Background";
import { Title } from "xolvio_ui/components/Title";
import { CenteredContentWrapper } from "xolvio_ui/helpers/CenteredContentWrapper";

export const Services = () => (
  <CenteredContentWrapper>
    <Background/>
    <Title title="hello" subheading="world" />
  </CenteredContentWrapper>
);

````

You can also use lazy loading:

```javascript
const CenteredContentWrapper = React.lazy(() =>
  import("xolvio_ui/CenteredContentWrapper")
);
const Background = React.lazy(() => import("xolvio_ui/Background"));
const Title = React.lazy(() => import("xolvio_ui/Title"));

export const Services = () => (
  <React.Suspense fallback={"Loading Components from the Design System"}>
    <CenteredContentWrapper>
      <Background />
      <Title title="hello" subheading="world" />
    </CenteredContentWrapper>
  </React.Suspense>
);
```

And that's all there is to it! Enjoy :)

We'll come back and update the docs to make this even easier once Storybook is using Webpack 5.

## Do I need this plugin?

We wanted to have the configuration focus on the essentials by using smart defaults and to use globs for exposing multiple modules instead of listing them one by one, which is error prone and boring.

So this is how you would do it if you wanted to use Webpack Federation without our plugin:

```javascript
new ModuleFederationPlugin({
  name: "xolvio_ui",
  library: { type: "var", name: "xolvio_ui" },
  filename: "remoteEntry.js",
  exposes: {
    CenteredContentWrapper: "./src/helpers/CenteredContentWrapper.tsx",
    Title: "./src/components/Title.tsx",
    Background: "./src/elements/Background.tsx",
    Sections: "./src/components/Sections.tsx",
    ScreenIcon: "./src/components/icons/ScreenIcon.tsx",
    FlipchartIcon: "./src/components/icons/FlipchartIcon.tsx",
    ShapesIcon: "./src/components/icons/ShapesIcon.tsx",
    // (..)
  },
  shared: ["react", "react-dom"],
})
```

And here's with our plugin:

```javascript
new StorybookWebpackFederationPlugin({
  name: "xolvio_ui",
  files: {
    paths: ["./src/**/*.ts{,x}"],
  },
});
```

## API

Below you can find a description of the fields in the configuration for this plugin:

```javascript
{
  // The name that the consumers will reference as the remote
  name: "xolvio_ui",

  files: {

    // an array of globs to match your component files
    paths: ["./src/components/**/*.ts{,x}"],

    // files with .stories. will get ignored, so they don't get exposed on the endpoints
    storiesExtension: ".stories.",

     // so your App can import "xolvio_ui/components/Title" instead of  "xolvio_ui/src/components/Title"
    removePrefix: "./src/",

  },

  // by default we share react and react-dom, you can add any aditional packages you would want to be shared
  shared: ["styled-components"],

  // you can import modules from other federated remotes into your Storybook as well!
  remotes: ["first-remote", "second-remote"]
}
```
