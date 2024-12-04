import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  stylistic: {
    semi: true,
    lessOpinionated: true,
    overrides: {
      'style/brace-style': ['error', '1tbs'],
    },
  },
}, {
  rules: {
    'node/prefer-global/process': 'off',
    'react-refresh/only-export-components': 'off',
  },
});
