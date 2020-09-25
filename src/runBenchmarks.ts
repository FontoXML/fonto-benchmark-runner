import benchmarkRunner from './benchmarkRunner/BenchmarkRunner';
import loadBenchmarks from './loadBenchmarks';

export default async function run(logInCsvFormat) {
	await loadBenchmarks(true);
	await benchmarkRunner.run(logInCsvFormat);
}
