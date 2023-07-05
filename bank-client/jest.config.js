// eslint-disable-next-line no-undef
module.exports = {
	transform: {
		'\\.js$': 'babel-jest',
	},
	testEnvironment: 'jsdom',
	testEnvironmentOptions: {},
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/__mocks__/fileMock.js',
		'\\.(css|scss)$': 'identity-obj-proxy',
		ymaps3: '<rootDir>/__mocks__/ymaps3.js',
		navigo: '<rootDir>/__mocks__/navigo.js',
	},
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	coveragePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
	collectCoverage: false,
	automock: true,
};
