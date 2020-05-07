import * as chai from 'chai';
import benchmarkRunner from 'fonto-benchmark-runner';

describe('add single benchmark', () => {
	let text: string = '';
	before(() => {
		text = '';
	});

	beforeEach(() => {
		benchmarkRunner.removeBenchmarks();
	});

	it('can add a benchmark', async () => {
		text = 'hello';
		let called = 0;

		benchmarkRunner.addBenchmark('match', () => {
			called++;
			return (text.match(/o/) as any).index;
		});

		await benchmarkRunner.run();

		chai.assert.isTrue(called > 0, 'The function is called at least once.');
	});

	it('can run only the function with "only"', async () => {
		text = 'hello';

		let calledMatch = 0;
		let calledIndexOf = 0;

		benchmarkRunner.only.addBenchmark('match', () => {
			calledMatch++;
			return (text.match(/o/) as any).index;
		});

		benchmarkRunner.addBenchmark('indexOf', () => {
			calledIndexOf++;
			return text.indexOf('o');
		});

		await benchmarkRunner.run();

		chai.assert.isTrue(calledMatch > 0, 'The function with "only" is called at least once.');
		chai.assert.isTrue(calledIndexOf === 0, 'The function without "only" is never called.');
	});

	it('can skip a function with "skip"', async () => {
		text = 'hello';

		let calledMatch = 0;
		let calledIndexOf = 0;

		benchmarkRunner.skip.addBenchmark('match', () => {
			calledMatch++;
			return (text.match(/o/) as any).index;
		});

		benchmarkRunner.addBenchmark('indexOf', () => {
			calledIndexOf++;
			return text.indexOf('o');
		});

		await benchmarkRunner.run();

		chai.assert.isTrue(calledMatch === 0, 'The function with "skip" is never called.');
		chai.assert.isTrue(
			calledIndexOf > 0,
			'The function without "skip" is called at least once.'
		);
	});

	it('can set up and tear down', async () => {
		let called = 0;
		let setupCalled = false;
		let teardownCalled = false;

		const arr = [];

		function setup() {
			setupCalled = true;
			for (let i = 0; i < 10; i++) {
				arr.push(i);
			}
		}
		function teardown() {
			teardownCalled = true;
			arr.length = 0;
		}

		benchmarkRunner.addBenchmark(
			'array#sort',
			() => {
				called++;
				chai.assert.equal(arr.length, 10, 'Setup and teardown functions work correctly');
				arr.sort((a, b) => a - b);
			},
			setup,
			teardown
		);

		await benchmarkRunner.run();

		chai.assert.isTrue(called > 0, 'The function is called at least once.');
		chai.assert.isTrue(setupCalled, 'The setup function is called before benchmarking.');
		chai.assert.isTrue(teardownCalled, 'The teardown function is called after benchmarking.');
	});
});
