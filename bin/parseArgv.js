'use strict';

const path = require('path');

function generateHelp(
	packageJson,
	commandName,
	description,
	parsedOptionConfigurationByOptionName
) {
	return Object.keys(parsedOptionConfigurationByOptionName).reduce((help, optionName) => {
		const optionConfiguration = parsedOptionConfigurationByOptionName[optionName];

		help += `\t${optionConfiguration.identifier}\t${optionConfiguration.description}\n`;

		return help;
	}, `${commandName} - ${packageJson.name}\n${description}\n\noptions:\n`);
}

function parseOptionConfigurationByOptionName(optionConfigurationByOptionName) {
	return Object.keys(optionConfigurationByOptionName).reduce(
		(parsedConfigurationByOptionName, optionName) => {
			const parsedConfiguration = Object.assign(
				{},
				optionConfigurationByOptionName[optionName]
			);
			const identifierParts = parsedConfiguration.identifier.split(' ');
			parsedConfiguration.isRequired = !parsedConfiguration.identifier.startsWith('[');
			parsedConfiguration.isValueRequired =
				!!identifierParts[1] && !identifierParts[1].startsWith('[');
			parsedConfiguration.longName = identifierParts[0].replace(/[\[\]]/g, '');

			parsedConfigurationByOptionName[optionName] = parsedConfiguration;
			return parsedConfigurationByOptionName;
		},
		{}
	);
}

function parseOptions(options, parsedOptionConfigurationByOptionName) {
	const optionValueByOptionName = {};

	let i = 0;
	while (i < options.length) {
		const option = options[i];
		const optionName = Object.keys(parsedOptionConfigurationByOptionName).find(
			optionName => parsedOptionConfigurationByOptionName[optionName].longName === option
		);
		if (!optionName) {
			throw new Error(`Unexpected option "${option}"`);
		}

		const valueOrNextOption = options[i + 1];
		if (valueOrNextOption && !valueOrNextOption.startsWith('-')) {
			optionValueByOptionName[optionName] = valueOrNextOption;
			i += 2;
		} else if (!parsedOptionConfigurationByOptionName[optionName].isValueRequired) {
			optionValueByOptionName[optionName] = true;
			i++;
		} else {
			throw new Error(`Missing required value for option "${option}".`);
		}
	}

	return optionValueByOptionName;
}

function addDefaultValues(optionValueByOptionName, parsedOptionConfigurationByOptionName) {
	return Object.keys(parsedOptionConfigurationByOptionName).reduce(
		(previousOptionDefaultValuePromise, optionName) => {
			return previousOptionDefaultValuePromise.then(optionValueByOptionName => {
				if (optionValueByOptionName[optionName] !== undefined) {
					return optionValueByOptionName;
				}

				const parsedOptionConfiguration = parsedOptionConfigurationByOptionName[optionName];
				if (parsedOptionConfiguration.isRequired) {
					throw new Error(
						`Missing required option ${parsedOptionConfiguration.identifier}.`
					);
				}

				if (parsedOptionConfiguration.defaultValue) {
					if (typeof parsedOptionConfiguration.defaultValue !== 'function') {
						optionValueByOptionName[optionName] =
							parsedOptionConfiguration.defaultValue;
						return optionValueByOptionName;
					}

					const defaultValueOrPromise = parsedOptionConfiguration.defaultValue();

					if (typeof defaultValueOrPromise.then !== 'function') {
						optionValueByOptionName[optionName] = defaultValueOrPromise;
						return optionValueByOptionName;
					}

					return defaultValueOrPromise.then(defaultValue => {
						optionValueByOptionName[optionName] = defaultValue;
						return optionValueByOptionName;
					});
				}

				if (parsedOptionConfiguration.isValueRequired === false) {
					optionValueByOptionName[optionName] = false;
				}

				return optionValueByOptionName;
			});
		},
		Promise.resolve(optionValueByOptionName)
	);
}

function parseArgv(packageJson, argv, configuration) {
	const options = argv.slice(2);
	const parsedOptionConfiguration = parseOptionConfigurationByOptionName(configuration.options);
	if (options.indexOf('--help') !== -1) {
		return Promise.resolve({
			help: generateHelp(
				packageJson,
				path.basename(argv[1]),
				configuration.description,
				parsedOptionConfiguration
			)
		});
	}

	const optionValueByOptionName = parseOptions(options, parsedOptionConfiguration);
	return addDefaultValues(optionValueByOptionName, parsedOptionConfiguration);
}

module.exports = parseArgv;
