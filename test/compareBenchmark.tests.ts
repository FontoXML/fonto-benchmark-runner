import * as chai from 'chai';
import benchmarkRunner from 'fonto-benchmark-runner';

describe('compareBenchmark', () => {
	let text: string;

	before(() => {
		text = '';
	});

	beforeEach(() => {
		benchmarkRunner.removeBenchmarks();
	});

	it('can compare the performances of two functions', async () => {
		let calledMatch = 0;
		let calledIndexOf = 0;

		benchmarkRunner.compareBenchmarks(
			'find the index of a character',
			() => {
				text = 'hello';
			},
			undefined,
			{
				name: 'match',
				test: () => {
					calledMatch++;
					return (text.match(/o/) as any).index;
				},
			},
			{
				name: 'indexOf',
				test: () => {
					calledIndexOf++;
					return text.indexOf('o');
				},
			}
		);

		await benchmarkRunner.run();

		chai.assert.isTrue(
			calledMatch > 0 && calledIndexOf > 0,
			'Both functions are called at least once.'
		);
	});
});
