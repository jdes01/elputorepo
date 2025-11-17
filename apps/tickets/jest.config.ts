import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "tsconfig": "tsconfig.spec.json"
      }
    ]
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage"
};

export default config;
