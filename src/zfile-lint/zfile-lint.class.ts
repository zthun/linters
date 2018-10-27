import chalk from 'chalk';
import { readFile } from 'fs';
import * as G from 'glob';
import { promisify } from 'util';
import { IZConfigReader } from '../zlint-config/zconfig-reader.interface';
import { IZLinter } from '../zlint/zlinter.interface';
import { IZContentLinter } from './zcontent-linter.interface';

/**
 * Represnets an object that can lint files one at a time.
 */
export class ZFileLint implements IZLinter {
  private _globOptions: G.IOptions;

  /**
   * Initializes a new instance of this object.
   * 
   * @param contentLint The linter for an individual file.
   * @param configReader The config reader.
   * @param logger The logger to use.
   * @param type The file type.
   */
  public constructor(private contentLint: IZContentLinter, private configReader: IZConfigReader, private logger: Console, private type: string) {
    this._globOptions = {
      dot: true
    };
  }

  /**
   * Lints the collection of json files.
   * 
   * @param src The file list of blobs to lint.
   * @param config The optional path to the config file.
   */
  public async lint(src: string[], config?: string): Promise<boolean> {
    const pread = promisify(readFile);
    let options = {};

    let result = true;
    let allFiles = [];

    for (const pattern of src) {
      allFiles = allFiles.concat(G.sync(pattern, this._globOptions));
    }

    if (allFiles.length === 0) {
      return result;
    }

    if (config) {
      try {
        options = await this.configReader.read(config);
      } catch (err) {
        this.logger.error(chalk.red(err));
        return false;
      }
    }

    this.logger.log(chalk.green.italic(`Checking syntax for ${allFiles.length} ${this.type} files.`));
    this.logger.log();

    for (const file of allFiles) {
      try {
        const content = await pread(file, 'utf-8');
        await this.contentLint.lint(content, options);
      } catch (err) {
        result = false;
        this._format(file, err);
      }
    }

    return result;
  }

  /**
   * Formats a file error to the logger.
   * 
   * @param file The file that failed to parse. 
   * @param err The error that occurred.
   */
  private _format(file: string, err: any) {
    const fileFormat = `Errors in ${file}.`;
    this.logger.error(chalk.red.underline(fileFormat));
    this.logger.error(chalk.red(err));
  }
}
