module.exports = {
  "core": {
    "builder": 'webpack5',
  },
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "webpackFinal": (config) => {
    const babelRule = config.module.rules.find(rule => rule.use[0]?.loader?.includes('babel-loader'));
    babelRule.resolve = {
      fullySpecified: false
    };
    return config;
  }
}
