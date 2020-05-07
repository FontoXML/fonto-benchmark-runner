# fonto-benchmark-runner
This tool can measure the performance of a function and compare the performances of different functions in both NodeJS and in the browser. It takes Typescript files as input.

How to use:

- Create files in a performance folder in your project with names ending with .benchmark.ts
- Run `fonto-benchmark-runner --node` to run your performance tests in node.
- Run `fonto-benchmark-runner --server` to run your performance tests in browsers and go `localhost:8080`.
