import Benchmark from 'benchmark';

export type testFunction = () => void;
export type setupFunction = () => void | Promise<void>;
export type teardownFunction = () => void | Promise<void>;

export type SingleBenchmark = {
	benchmark: Benchmark;
	setup?: setupFunction;
	teardown?: teardownFunction;
};

export type ComparisonBenchmark = {
	benchmarks: Benchmark[];
	name: string;
	setup?: setupFunction;
	teardown?: teardownFunction;
};
