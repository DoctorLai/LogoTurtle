'use strict';

let should = require('chai').should();
let modules = require('../js/logo_funs');

describe('isNumeric', function() {
  it('true', function() {
    modules.isNumeric(1).should.equal(true);
    modules.isNumeric(1.2).should.equal(true);
    modules.isNumeric(0).should.equal(true);
    modules.isNumeric("00").should.equal(true);
    modules.isNumeric("11").should.equal(true);
  }); 
  it('false', function() {
    modules.isNumeric("0..0").should.equal(false);
    modules.isNumeric("11ff").should.equal(false);
    modules.isNumeric("ff").should.equal(false);
    modules.isNumeric("").should.equal(false);
  });   
});

describe('isValidVarName', function() {
  it('true', function() {
    modules.isValidVarName("aa11").should.equal(true);
    modules.isValidVarName("abc").should.equal(true);    
    modules.isValidVarName("ABC").should.equal(true);
    modules.isValidVarName("AxBxC").should.equal(true);
    modules.isValidVarName("Aa1234").should.equal(true);
    modules.isValidVarName("abd__234").should.equal(true);
  }); 
  it('false', function() {    
    modules.isValidVarName("0..0").should.equal(false);
    modules.isValidVarName("11ff").should.equal(false);
    modules.isValidVarName("000ff").should.equal(false);
    modules.isValidVarName("  kk d").should.equal(false);
    modules.isValidVarName("aa  kk d").should.equal(false);
  });   
});

