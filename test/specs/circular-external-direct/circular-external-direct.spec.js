const { expect } = require('chai');

const $RefParser = require('../../../lib');
const path = require('../../utils/path');

const dereferencedSchema = require('./dereferenced');
const parsedSchema = require('./parsed');

describe('Schema with direct circular (recursive) external $refs', function () {
  it('should parse successfully', async function () {
    const parser = new $RefParser();
    const schema = await parser.parse(path.rel('specs/circular-external-direct/circular-external-direct-root.yaml'));
    expect(schema).to.equal(parser.schema);
    expect(schema).to.deep.equal(parsedSchema.schema);
    expect(parser.$refs.paths()).to.deep.equal([
      path.abs('specs/circular-external-direct/circular-external-direct-root.yaml'),
    ]);

    // The "circular" flag should NOT be set
    // (it only gets set by `dereference`)
    expect(parser.$refs.circular).to.equal(false);
    expect(parser.$refs.circularRefs).to.have.length(0);
  });

  it('should dereference successfully', async function () {
    const parser = new $RefParser();
    const schema = await parser.dereference(
      path.rel('specs/circular-external-direct/circular-external-direct-root.yaml')
    );
    expect(schema).to.equal(parser.schema);
    expect(schema).to.deep.equal(dereferencedSchema);

    // The "circular" flag should be set
    expect(parser.$refs.circular).to.equal(true);
    expect(parser.$refs.circularRefs).to.have.length(1);
    expect(parser.$refs.circularRefs[0]).to.contain('#/foo/foo');
  });
});
