module.exports = {
  extends: '@tofu-apis/eslint-config-ts-base',
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    // Disallow use of console.log since we should be using the logger instead.
    'no-console': 'error',
  },
};
