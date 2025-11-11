module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Disable unused variables error for Vercel builds
    'no-unused-vars': 'warn',
    // Allow unused variables in development
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};