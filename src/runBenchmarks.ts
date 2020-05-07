import benchmarkRunner from './benchmarkRunner/BenchmarkRunner';
import loadBenchmarks from './loadBenchmarks';

export default async function run() {
	await loadBenchmarks(true);
	await benchmarkRunner.run();
}
