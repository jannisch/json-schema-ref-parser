const yaml = require('js-yaml');
const { JSON_SCHEMA } = require('js-yaml');

const { ParserError } = require('../util/errors');

module.exports = {
  /**
   * The order that this parser will run, in relation to other parsers.
   *
   * @type {number}
   */
  order: 200,

  /**
   * Whether to allow "empty" files. This includes zero-byte files, as well as empty JSON objects.
   *
   * @type {boolean}
   */
  allowEmpty: true,

  /**
   * Determines whether this parser can parse a given file reference.
   * Parsers that match will be tried, in order, until one successfully parses the file.
   * Parsers that don't match will be skipped, UNLESS none of the parsers match, in which case
   * every parser will be tried.
   *
   * @type {RegExp|string[]|function}
   */
  canParse: ['.yaml', '.yml', '.json'], // JSON is valid YAML

  /**
   * Parses the given file as YAML
   *
   * @param {object} file           - An object containing information about the referenced file
   * @param {string} file.url       - The full URL of the referenced file
   * @param {string} file.extension - The lowercased file extension (e.g. ".txt", ".html", etc.)
   * @param {*}      file.data      - The file contents. This will be whatever data type was returned by the resolver
   * @returns {Promise}
   */
  // eslint-disable-next-line require-await
  async parse(file) {
    let data = file.data;
    if (Buffer.isBuffer(data)) {
      data = data.toString();
    }

    if (typeof data === 'string') {
      try {
        return yaml.load(data, { schema: JSON_SCHEMA });
      } catch (e) {
        throw new ParserError(e.message, file.url);
      }
    }

    // data is already a JavaScript value (object, array, number, null, NaN, etc.)
    return data;
  },
};
