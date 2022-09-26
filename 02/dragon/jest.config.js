module.exports = {
    preset: 'ts-jest',
    testMatch: ['<rootDir>/src/__tests__/**/*.spec.ts'],
    transform: { "^.+\\.ts?$": "ts-jest" },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
}
