import Benchmark from 'benchmark';
import {
	ComparisonBenchmark,
	SingleBenchmark,
	setupFunction,
	teardownFunction,
	testFunction,
} from './Types';

export default abstract class BenchmarkCollection {
	protected readonly _benchmarks: SingleBenchmark[] = [];
	protected readonly _comparisons: ComparisonBenchmark[] = [];

	public addBenchmark(
		name: string,
		test: testFunction,
		setup?: setupFunction,
		teardown?: teardownFunction
	): void {
		this._benchmarks.push({
			benchmark: new Benchmark(name, test),
			// We do not use the setup and teardown which is offered within the API of benchmarkjs
			// as several attempts to get this working did not yield any successful results.
			setup,
			teardown,
		});
	}

	public compareBenchmarks(
		name: string,
		setup?: setupFunction,
		teardown?: teardownFunction,
		...benchmarks: {
			name: string;
			test: testFunction;
		}[]
	): void {
		// We do not use the setup and teardown which is offered within the API of benchmarkjs
		// as several attempts to get this working did not yield any successful results. We also
		// allow only 1 setup and teardown as all functions which compare with one another should
		// use the same data to test with.
		const comparison: ComparisonBenchmark = { name, benchmarks: [], setup, teardown };
		for (const benchmark of benchmarks) {
			comparison.benchmarks.push(new Benchmark(benchmark.name, benchmark.test));
		}
		this._comparisons.push(comparison);
	}
}
