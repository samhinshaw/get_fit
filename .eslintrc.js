module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    node: true,
    es6: true
    // jasmine: true
  },
  rules: {
    // never prefer destructuring... not ready for that yet, I like object.attribut
    'prefer-destructuring': ['error', { object: false, array: false }],
    // don't use dangling commas!!
    'comma-dangle': ['error', 'never'],
    // actually, we're running node, so allow all console methods (warn, err, log)
    'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
    'no-debugger': 'off',
    'no-underscore-dangle': ['error', { allow: ['_id'] }]
  }
};
