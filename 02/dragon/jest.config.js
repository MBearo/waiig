module.exports = {
    preset: 'ts-jest',
    testMatch: ['<rootDir>/src/__tests__/**/*.spec.ts'],
    transform: {
        "^.+\\.ts?$": ["ts-jest", {
            // "diagnostics": {
            //     "ignoreCodes": [6133, 6031, 18003]
            // }
        }]
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
}
