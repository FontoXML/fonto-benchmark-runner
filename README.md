# fonto-benchmark-runner [![Build Status](https://travis-ci.org/FontoXML/fonto-benchmark-runner.svg?branch=master)](https://travis-ci.org/FontoXML/fonto-benchmark-runner)

This tool can measure the performance of a function and compare the performances of different functions in both NodeJS and in the browser. It takes Typescript files as input.

How to use:

-   Create files in a performance folder in your project with names ending with .benchmark.ts
-   Run `npx fonto-benchmark-runner` to run your performance tests in node.
-   Add `--log-csv` to the command in order to Log performance results in csv format. If you need to write the results
    to the current directory, run `npx fonto-benchmark-runner --log-csv > results.csv`.
    Please make sure that your benchmark or comparison names do not include comma (,) if you want to display
    your results in a sheet. Otherwise, more than one cell will be created for the name and it
    shifts some of the data.
