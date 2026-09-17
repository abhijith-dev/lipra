export default {
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^lipra$': '<rootDir>/../core/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  preset: 'ts-jest/presets/default-esm',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
};