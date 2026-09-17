export default {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  preset: 'ts-jest/presets/default-esm',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
};