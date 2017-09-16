module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
    node: true,
    jasmine: true
  },
  rules: {
    'prefer-destructuring': ['error', { object: false, array: false }],
    'comma-dangle': ['error', 'never']
  }
};
