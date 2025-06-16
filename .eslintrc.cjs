module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'i18n-json', '@typescript-eslint', 'no-hardcoded-strings'],
  rules: {
    // Custom rule to prevent hardcoded strings in JSX
    'no-hardcoded-strings/no-hardcoded-strings': [
      'error',
      {
        // Ignore common attribute values that are typically not translated
        ignore: [
          'className',
          'id',
          'data-testid',
          'aria-label',
          'aria-labelledby',
          'aria-describedby',
          'role',
          'type',
          'for',
          'name',
          'alt',
          'title',
          'placeholder',
          'value',
          'src',
          'href',
          'to',
          'as',
          'rel',
          'target',
          'method',
          'enctype',
          'accept',
          'autoComplete',
          'spellCheck',
          'dir',
          'lang',
          'http-equiv',
          'content',
          'charset',
          'crossOrigin',
          'integrity',
          'nonce',
          'referrerPolicy',
          'sizes',
          'useMap',
          'wrap',
          'formAction',
          'formEncType',
          'formMethod',
          'formNoValidate',
          'formTarget',
          'maxLength',
          'minLength',
          'pattern',
          'readOnly',
          'required',
          'size',
          'step',
          'autoCapitalize',
          'autoCorrect',
          'autoSave',
          'itemProp',
          'itemScope',
          'itemType',
          'itemID',
          'itemRef',
        ],
        // Ignore specific strings that are commonly used and don't need translation
        ignoreStrings: [
          '\d+', // Numbers
          '^[a-f0-9-]+$', // UUIDs and similar
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', // UUID format
          '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', // Hex colors
          '^https?://', // URLs
          '^data:', // Data URLs
          '^[\w-]+\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar\.gz)$', // File extensions
          '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', // Email addresses
          '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$', // IP addresses
          '^[0-9A-Fa-f]{2}([-:]?[0-9A-Fa-f]{2}){5}$', // MAC addresses
          '^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$', // GUID format
          '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:[0-9]{2})?$', // ISO 8601 dates
        ],
        // Ignore specific files or directories
        ignoreFiles: [
          '**/*.test.tsx',
          '**/*.test.ts',
          '**/*.spec.tsx',
          '**/*.spec.ts',
          '**/__mocks__/**',
          '**/__tests__/**',
          '**/test-utils/**',
          '**/mocks/**',
          '**/__snapshots__/**',
          '**/public/**',
          '**/dist/**',
          '**/node_modules/**',
          '**/coverage/**',
          '**/build/**',
          '**/.next/**',
          '**/out/**',
        ],
        // Allow template literals with expressions
        allowTemplateLiterals: true,
        // Allow string concatenation with template literals
        allowTemplateLiteralsWithExpression: true,
        // Allow string concatenation with plus operator
        allowConcatenation: false,
        // Allow strings in object properties
        allowObjectProperties: false,
        // Allow strings in array elements
        allowArrayElements: false,
        // Allow strings in JSX text
        allowJsxText: false,
        // Allow strings in JSX attributes
        allowJsxAttributes: false,
        // Allow strings in JSX expressions
        allowJsxExpressions: false,
        // Allow strings in JSX fragments
        allowJsxFragment: false,
        // Allow strings in JSX spread attributes
        allowJsxSpread: false,
        // Allow strings in JSX namespaced names
        allowJsxNamespacedNames: false,
        // Allow strings in JSX member expressions
        allowJsxMemberExpressions: false,
        // Allow strings in JSX identifiers
        allowJsxIdentifiers: false,
        // Allow strings in JSX empty expressions
        allowJsxEmptyExpressions: false,
        // Allow strings in JSX element types
        allowJsxElementTypes: false,
        // Allow strings in JSX opening elements
        allowJsxOpeningElements: false,
        // Allow strings in JSX closing elements
        allowJsxClosingElements: false,
        // Allow strings in JSX self-closing elements
        allowJsxSelfClosingElements: false,
        // Allow strings in JSX attributes
        allowJsxAttributeValues: false,
        // Allow strings in JSX spread attributes
        allowJsxSpreadAttributes: false,
        // Allow strings in JSX text
        allowJsxText: false,
        // Allow strings in JSX expressions
        allowJsxExpressions: false,
        // Allow strings in JSX fragments
        allowJsxFragment: false,
        // Allow strings in JSX spread attributes
        allowJsxSpread: false,
        // Allow strings in JSX namespaced names
        allowJsxNamespacedNames: false,
        // Allow strings in JSX member expressions
        allowJsxMemberExpressions: false,
        // Allow strings in JSX identifiers
        allowJsxIdentifiers: false,
        // Allow strings in JSX empty expressions
        allowJsxEmptyExpressions: false,
        // Allow strings in JSX element types
        allowJsxElementTypes: false,
        // Allow strings in JSX opening elements
        allowJsxOpeningElements: false,
        // Allow strings in JSX closing elements
        allowJsxClosingElements: false,
        // Allow strings in JSX self-closing elements
        allowJsxSelfClosingElements: false,
        // Allow strings in JSX attributes
        allowJsxAttributeValues: false,
        // Allow strings in JSX spread attributes
        allowJsxSpreadAttributes: false,
        // Allow strings in JSX text
        allowJsxText: false,
        // Allow strings in JSX expressions
        allowJsxExpressions: false,
        // Allow strings in JSX fragments
        allowJsxFragment: false,
        // Allow strings in JSX spread attributes
        allowJsxSpread: false,
        // Allow strings in JSX namespaced names
        allowJsxNamespacedNames: false,
        // Allow strings in JSX member expressions
        allowJsxMemberExpressions: false,
        // Allow strings in JSX identifiers
        allowJsxIdentifiers: false,
        // Allow strings in JSX empty expressions
        allowJsxEmptyExpressions: false,
        // Allow strings in JSX element types
        allowJsxElementTypes: false,
        // Allow strings in JSX opening elements
        allowJsxOpeningElements: false,
        // Allow strings in JSX closing elements
        allowJsxClosingElements: false,
        // Allow strings in JSX self-closing elements
        allowJsxSelfClosingElements: false,
        // Allow strings in JSX attributes
        allowJsxAttributeValues: false,
        // Allow strings in JSX spread attributes
        allowJsxSpreadAttributes: false,
        // Allow strings in JSX text
        allowJsxText: false,
        // Allow strings in JSX expressions
        allowJsxExpressions: false,
        // Allow strings in JSX fragments
        allowJsxFragment: false,
        // Allow strings in JSX spread attributes
        allowJsxSpread: false,
        // Allow strings in JSX namespaced names
        allowJsxNamespacedNames: false,
        // Allow strings in JSX member expressions
        allowJsxMemberExpressions: false,
        // Allow strings in JSX identifiers
        allowJsxIdentifiers: false,
        // Allow strings in JSX empty expressions
        allowJsxEmptyExpressions: false,
        // Allow strings in JSX element types
        allowJsxElementTypes: false,
        // Allow strings in JSX opening elements
        allowJsxOpeningElements: false,
        // Allow strings in JSX closing elements
        allowJsxClosingElements: false,
        // Allow strings in JSX self-closing elements
        allowJsxSelfClosingElements: false,
        // Allow strings in JSX attributes
        allowJsxAttributeValues: false,
        // Allow strings in JSX spread attributes
        allowJsxSpreadAttributes: false,
      },
    ],
    // Other ESLint rules...
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off', // We use TypeScript for type checking
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react/display-name': 'off', // Allow anonymous components
    '@typescript-eslint/no-explicit-any': 'warn', // Warn about any types
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Allow unused vars with _ prefix
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
};
