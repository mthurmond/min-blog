const s3 = require('../routes/s3')
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

describe("generateUploadURL", function() {
    it("returns an object with a url property", function() {
        return s3.generateUploadURL('123-test-key').should.eventually.have.property('url')
    })

    it("returns an object with a filename property", function() {
        return s3.generateUploadURL('123-test-key').should.eventually.have.property('filename')
    })
})