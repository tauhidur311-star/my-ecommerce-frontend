module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Disable unused variables error for Vercel builds
    'no-unused-vars': 'off',
    // Disable TypeScript unused variables check
    '@typescript-eslint/no-unused-vars': 'off'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};