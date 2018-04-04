module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
    // jasmine: true
  },
  globals: {
    jQuery: true,
    $: true
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }]
  }
};
