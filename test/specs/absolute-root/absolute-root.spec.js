const nodePath = require('path');

const { expect } = require('chai');

const $RefParser = require('../../..');
const url = require('../../../lib/util/url');
const helper = require('../../utils/helper');
const path = require('../../utils/path');

const bundledSchema = require('./bundled');
const dereferencedSchema = require('./dereferenced');
const parsedSchema = require('./parsed');

// Store the OS root directory
const root = nodePath.resolve('/');

// Store references to the original methods
const originalProcessCwd = process.cwd;
const originalUrlCwd = url.cwd;

/**
 * A mock `process.cwd()` implementation that always returns the root diretory
 */
function mockProcessCwd() {
  return root;
}

/**
 * Temporarily mocks `process.cwd()` while calling the real `url.cwd()` implemenation
 */
function mockUrlCwd() {
  try {
    process.cwd = mockProcessCwd;
    // eslint-disable-next-line prefer-spread
    return originalUrlCwd.apply(null, arguments);
  } finally {
    process.cwd = originalProcessCwd;
  }
}

describe('When executed in the context of root directory', function () {
  beforeEach('Mock process.cwd and url.cwd', function () {
    url.cwd = mockUrlCwd;
  });

  afterEach('Restore process.cwd and url.cwd', function () {
    url.cwd = originalUrlCwd;
    process.cwd = originalProcessCwd; // already restored by the finally block above, but just in case
  });

  it('should parse successfully from an absolute path', async function () {
    const parser = new $RefParser();
    const schema = await parser.parse(path.abs('specs/absolute-root/absolute-root.yaml'));
    expect(schema).to.equal(parser.schema);
    expect(schema).to.deep.equal(parsedSchema.schema);
    expect(parser.$refs.paths()).to.deep.equal([path.abs('specs/absolute-root/absolute-root.yaml')]);
  });

  it('should parse successfully from a url', async function () {
    const parser = new $RefParser();
    const schema = await parser.parse(path.url('specs/absolute-root/absolute-root.yaml'));
    expect(schema).to.equal(parser.schema);
    expect(schema).to.deep.equal(parsedSchema.schema);
    expect(parser.$refs.paths()).to.deep.equal([path.url('specs/absolute-root/absolute-root.yaml')]);
  });

  it(
    'should resolve successfully from an absolute path',
    helper.testResolve(
      path.abs('specs/absolute-root/absolute-root.yaml'),
      path.abs('specs/absolute-root/absolute-root.yaml'),
      parsedSchema.schema,
      path.abs('specs/absolute-root/definitions/definitions.json'),
      parsedSchema.definitions,
      path.abs('specs/absolute-root/definitions/name.yaml'),
      parsedSchema.name,
      path.abs('specs/absolute-root/definitions/required-string.yaml'),
      parsedSchema.requiredString
    )
  );

  it(
    'should resolve successfully from a url',
    helper.testResolve(
      path.url('specs/absolute-root/absolute-root.yaml'),
      path.url('specs/absolute-root/absolute-root.yaml'),
      parsedSchema.schema,
      path.url('specs/absolute-root/definitions/definitions.json'),
      parsedSchema.definitions,
      path.url('specs/absolute-root/definitions/name.yaml'),
      parsedSchema.name,
      path.url('specs/absolute-root/definitions/required-string.yaml'),
      parsedSchema.requiredString
    )
  );

  it('should dereference successfully', async function () {
    const parser = new $RefParser();
    const schema = await parser.dereference(path.abs('specs/absolute-root/absolute-root.yaml'));
    expect(schema).to.equal(parser.schema);
    expect(schema).to.deep.equal(dereferencedSchema);

    // Reference equality
    expect(schema.properties.name).to.equal(schema.definitions.name);
    expect(schema.definitions['required string'])
      .to.equal(schema.definitions.name.properties.first)
      .to.equal(schema.definitions.name.properties.last)
      .to.equal(schema.properties.name.properties.first)
      .to.equal(schema.properties.name.properties.last);

    // The "circular" flag should NOT be set
    expect(parser.$refs.circular).to.equal(false);
    expect(parser.$refs.circularRefs).to.have.length(0);
  });

  it('should bundle successfully', async function () {
    const parser = new $RefParser();
    const schema = await parser.bundle(path.abs('specs/absolute-root/absolute-root.yaml'));
    expect(schema).to.equal(parser.schema);
    expect(schema).to.deep.equal(bundledSchema);
  });
});
