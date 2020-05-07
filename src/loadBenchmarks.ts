import * as glob from 'glob';

const cwd = process.cwd();

export function getImports(loadTS: boolean): string[] {
	const globString = loadTS
		? `${cwd}/performance/**/*.benchmark.ts`
		: `${__dirname}/../tmp/performance/**/*.benchmark.js`;
	const files = glob.sync(globString);
	console.log(files);
	return files;
}

export default async function loadBenchmarks(loadTS: boolean) {
	const imports = getImports(loadTS);
	for (const relativeImport of imports) {
		await import(relativeImport);
	}
}
