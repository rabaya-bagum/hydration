const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  { ignores: ['node_modules/*', 'dist/*', '.expo/*', 'supabase/functions/*'] },
  // JSX text in React Native is not HTML: apostrophes and quotes are fine.
  { rules: { 'react/no-unescaped-entities': 'off' } },
];
