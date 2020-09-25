import BenchmarkCollection from './BenchmarkCollection';
import OnlyBenchmarks from './OnlyBenchmarks';
import SkipBenchmarks from './SkipBenchmarks';

class BenchmarkRunner extends BenchmarkCollection {
	private readonly _only: OnlyBenchmarks = new OnlyBenchmarks();
	private readonly _skip: SkipBenchmarks = new SkipBenchmarks();

	public get only(): BenchmarkCollection {
		return this._only;
	}

	public get skip(): BenchmarkCollection {
		return this._skip;
	}

	public removeBenchmarks() {
		this._only.removeBenchmarks();
		this._skip.removeBenchmarks();
		this._benchmarks.length = 0;
		this._comparisons.length = 0;
	}

	public async run(logInCsvFormat: boolean): Promise<void> {
		let benchmarks = this._benchmarks;
		let comparisons = this._comparisons;
		if (this._only.hasBenchmarks()) {
			benchmarks = this._only.getBenchmarks();
			comparisons = this._only.getComparisons();
		}

		console.log(`Running ${benchmarks.length} benchmarks`);
		if (logInCsvFormat && benchmarks.length > 0) {
			console.log('test name, op/sec, rme, number of running');
		}
		for (const benchmark of benchmarks) {
			if (benchmark.setup !== undefined) {
				benchmark.setup();
			}

			benchmark.benchmark.on('complete', (event: Event) => {
				if (logInCsvFormat) {
					const resultDetails = event.target as any;
					console.log(
						`${resultDetails.name}, ${resultDetails.hz}, ${resultDetails.stats.rme}%, ${resultDetails.stats.sample.length}`
					);
				} else {
					console.log(String(event.target));
				}

				const error = (event.target as any).error;
				if (error) {
					console.error(error);
				}
			});

			benchmark.benchmark.run({ async: false });

			if (benchmark.teardown !== undefined) {
				benchmark.teardown();
			}
		}

		// Ignore skipped benchmarks if there are functions running exclusively.
		if (!this._only.hasBenchmarks() && this._skip.hasBenchmarks()) {
			const skippedBenchmarks = this._skip.getBenchmarks();
			for (const skippedBenchmark of skippedBenchmarks) {
				console.log(skippedBenchmark.benchmark.toString());
			}
		}

		console.log(`\nRunning ${comparisons.length} comparisons`);
		if (logInCsvFormat && comparisons.length) {
			console.log(
				'comparison name, test name, op/sec, rme, number of running, comparison to first sample'
			);
		}

		for (const comparison of comparisons) {
			if (!logInCsvFormat) {
				console.log(`------------${comparison.name}------------`);
			}

			const operationsPerSecond: { name: string; ops: number }[] = [];
			let baseHz = null;
			for (const benchmark of comparison.benchmarks) {
				if (comparison.setup !== undefined) {
					await comparison.setup();
				}

				benchmark.on('complete', (event: Event) => {
					if (logInCsvFormat) {
						const resultDetails = event.target as any;
						if (baseHz === null) {
							baseHz = resultDetails.hz;
						}
						console.log(
							`${comparison.name}, ${resultDetails.name}, ${resultDetails.hz}, ${
								resultDetails.stats.rme
							}%, ${resultDetails.stats.sample.length}, ${
								(resultDetails.hz / baseHz) * 100
							}%`
						);
					} else {
						console.log(String(event.target));
					}

					const error = (event.target as any).error;
					if (error) {
						console.error(error);
					} else if (!logInCsvFormat) {
						operationsPerSecond.push({
							name: (benchmark as any).name,
							ops: (event.target as any).hz as number,
						});
					}
				});

				benchmark.run({ async: false });

				if (comparison.teardown !== undefined) {
					await comparison.teardown();
				}
			}

			// one line between each comparison set
			console.log('');

			if (!logInCsvFormat) {
				const base = operationsPerSecond[0];
				for (let i = 0; i < operationsPerSecond.length; i++) {
					const ops = operationsPerSecond[i];
					if (i === 0) {
						console.log(`${ops.name} 100%`);
					} else {
						console.log(`${ops.name} ${(ops.ops / base.ops) * 100}%`);
					}
				}
			}
		}

		// Ignore skipped comparisons if there are functions running exclusively.
		if (!this._only.hasBenchmarks() && this._skip.hasComparisons()) {
			const skippedBenchmarks = this._skip.getComparisons();
			for (const skippedBenchmark of skippedBenchmarks) {
				console.log(skippedBenchmark.benchmarks.toString());
			}
		}
	}
}

const benchmarkRunner = new BenchmarkRunner();
export default benchmarkRunner;
