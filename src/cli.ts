#!/usr/bin/env node

import { usage } from 'yargs';
import { ZEsLint } from './es-lint/es-lint.class';
import { ZFileLint } from './file-lint/file-lint.class';
import { ZHtmlHint } from './html-hint/html-hint.class';
import { ZJsonLint } from './json-lint/json-lint.class';
import { ZConfigJsonParser } from './config/config-json-parser.class';
import { ZConfigNullReader } from './config/config-null-reader.class';
import { ZConfigReader } from './config/config-reader.class';
import { IZLintJanitorArgs } from './lint-janitor/lint-janitor-args.interface';
import { ZLintJanitor } from './lint-janitor/lint-janitor.class';
import { ZStyleLint } from './style-lint/style-lint.class';
import { ZYamlLint } from './yaml-lint/yaml-lint.class';

const args: IZLintJanitorArgs = usage('$0 [options]').alias('c', 'config').describe('c', 'Optional config file to use.').string('c').help().parse() as any;

const logger = console;
const nullConfigReader = new ZConfigNullReader();
const jsonConfigReader = new ZConfigReader(new ZConfigJsonParser());

const htmlHint = new ZHtmlHint();
const jsonLint = new ZJsonLint();
const yamlLint = new ZYamlLint();

const zLint = new ZLintJanitor(logger);
zLint.esLint = new ZEsLint(logger);
zLint.styleLint = new ZStyleLint(logger);
zLint.htmlHint = new ZFileLint(htmlHint, jsonConfigReader, logger, 'html');
zLint.jsonLint = new ZFileLint(jsonLint, nullConfigReader, logger, 'json');
zLint.yamlLint = new ZFileLint(yamlLint, nullConfigReader, logger, 'yaml');

zLint.run(args).then((result) => (process.exitCode = result));
