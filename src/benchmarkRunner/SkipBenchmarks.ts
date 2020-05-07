import Benchmark from 'benchmark';
import BenchmarkCollection from './BenchmarkCollection';

export default class SkipBenchmarks extends BenchmarkCollection {
	public getBenchmarks(): {
		benchmark: Benchmark;
		setup?: () => void;
		teardown?: () => void;
	}[] {
		return this._benchmarks;
	}

	public getComparisons(): {
		benchmarks: Benchmark[];
		name: string;
		setup?: () => void;
		teardown?: () => void;
	}[] {
		return this._comparisons;
	}

	public hasBenchmarks(): boolean {
		return this._benchmarks.length !== 0;
	}

	public hasComparisons(): boolean {
		return this._comparisons.length !== 0;
	}

	public removeBenchmarks() {
		this._benchmarks.length = 0;
		this._comparisons.length = 0;
	}
}
