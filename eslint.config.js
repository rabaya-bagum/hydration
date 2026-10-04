const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  { ignores: ['node_modules/*', 'dist/*', '.expo/*', 'supabase/functions/*'] },
  // JSX text in React Native is not HTML: apostrophes and quotes are fine.
  { rules: { 'react/no-unescaped-entities': 'off' } },
  { files: ['e2e/**/*.js', '*.config.js'], languageOptions: { globals: { __dirname: 'readonly', process: 'readonly', require: 'readonly', module: 'readonly', console: 'readonly' } } },
];
