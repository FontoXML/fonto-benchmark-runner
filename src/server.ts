import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import http, { IncomingMessage, ServerResponse } from 'http';
import ts from 'typescript';
import * as glob from 'glob';
import * as staticAlias from 'node-static';
import * as rollup from 'rollup';

import importBenchmarks from './rollup-plugin-import-benchmarks';

export default function runServer({ port = 8080 } = { port: 8080 }) {
	const cwd = process.cwd();

	const builtFileServer = new staticAlias.Server(`${__dirname}/../lib`);
	const performanceFileServer = new staticAlias.Server(`${__dirname}/../lib`);
	const rootFileServer = new staticAlias.Server(`${cwd}`);
	const modulesFileServer = new staticAlias.Server(`${cwd}/node_modules`);

	// First: start TSC in watch mode, compiling performance/**/*.ts to some tmp folder
	// Then: use rollup to bundle that into one file, again in watch mode
	// Then: host that file

	const fileNames = glob.sync(`${__dirname}/**/*.ts`);
	const performanceTestFiles = glob.sync(`${cwd}/performance/**/*.benchmark.ts`);

	console.log('server starting');

	// TODO: do this in a watch
	let program = ts.createProgram(fileNames, {
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.NodeJs,
		outDir: `${__dirname}/../tmp`,
		strict: false,
	});
	let program2 = ts.createProgram(performanceTestFiles, {
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.NodeJs,
		outDir: `${__dirname}/../tmp/performance`,
		paths: {
			slimdom: [`${cwd}/node_modules/slimdom/dist/slimdom.d.ts`],
			'slimdom-sax-parser': [`${cwd}node_modules/slimdom-sax-parser/index.js`],
		},
		strict: false,
	});

	let emitResult = program.emit();
	let emitResult2 = program2.emit();

	const watch = rollup.watch({
		// This is just the generated list of imports
		input: `${__dirname}/../lib/runBenchmarks.js`,
		output: [
			{
				name: 'run-performance-tests',
				file: `${__dirname}/../lib/run-performance-tests.js`,
				format: 'umd',
				exports: 'named',
				sourcemap: true,
			},
		],
		onwarn(warning) {
			// Ignore "this is undefined" warning triggered by typescript's __extends helper
			if (warning.code === 'THIS_IS_UNDEFINED') {
				return;
			}

			console.error(warning.message);
		},
		plugins: [
			importBenchmarks(),
			alias({
				entries: {
					'@fontoxml/fonto-benchmark-runner': `${__dirname}/../lib/benchmarkRunner/BenchmarkRunner.js`,
				},
			}),
			resolve(),
			commonjs(),
		],
	});

	let builtBundle = 'console.log("Not built yet")';

	watch.on('event', async (event) => {
		console.log(event);
		if (event.code === 'BUNDLE_END') {
			const bundle = event.result;
			const { output } = await bundle.generate({
				name: 'main',
				format: 'umd',
			});

			console.log('build end!');

			builtBundle = output[0].code;
		}
	});

	http.createServer((request: IncomingMessage, response: ServerResponse) => {
		request
			.addListener('end', () => {
				//
				// Serve files!
				//
				if (request.url.startsWith('/test')) {
					console.log('Serving .' + request.url);
					rootFileServer.serve(request, response);
					return;
				}

				switch (request.url) {
					case '/run-performance-tests.js':
					case '/run-performance-tests.js.map':
						console.log('Serving ./lib' + request.url);
						builtFileServer.serve(request, response);
						break;
					case '/lodash/lodash.js':
					case '/platform/platform.js':
					case '/benchmark/benchmark.js':
					case '/slimdom/dist/slimdom.js':
						console.log('Serving ./node_modules' + request.url);
						modulesFileServer.serve(request, response);
						break;
					case '/benchmark/fonto-benchmark-runner.js':
						console.log('Serving index.js');
						request.url = '/index.js';
						builtFileServer.serve(request, response);
						break;
					default:
						console.log('Serving unknown./' + request.url);
						performanceFileServer.serve(request, response);
						break;
				}
			})
			.resume();
	}).listen(port);

	console.log(`Now listening on localhost:${port}`);
}
