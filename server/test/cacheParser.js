/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

const { expect } = require('chai');
const { CacheParser } = require('../src/cacheParser.js');
const { randomGetValid, randomSetValid, randomString, randomCasValid, randomValidOp } = require('./utils.js');


const parser = new CacheParser();
const timesToTest = 300;
const setOperationList = [...Array(timesToTest)].map(randomSetValid);
const getOperationList = [...Array(timesToTest)].map(randomGetValid);
const randomValidOPList = [...Array(timesToTest)].map(randomValidOp);

describe('👾 CacheParser', () => {
  describe('#Random valid op should be okey', () => {
    it('Work please', () => {
      randomValidOPList.forEach((randomGetN) => {
        const input = randomGetN.strCommand;
        const parsedOp = parser.parseOp(input);
        const valid = parser.validOperation(parsedOp);
        expect(valid).to.be.true;
      });
    });
  });

  describe('#validOperation()', () => {
    const { validOperations: opList } = parser;

    it('should return true if valid operation', () => {
      opList.forEach((op) => {
        expect(parser.validOperation({ op })).to.equal(true);
      });
    });

    it('should return false if invalid operation', () => {
      for (let i = 0; i < timesToTest; i += 1) {
        const dataString = randomString();
        expect(parser.validOperation(dataString)).to.equal(opList.includes(dataString));
      }
    });
  });
  describe('#parseCommand(String)', () => {
    it('valid operations should have property valid after parsed', () => {
      for (let i = 0; i < timesToTest; i += 1) {
        const randomSetN = randomSetValid();
        const parseSet = parser.parseCommand(randomSetN.strCommand);
        expect(parseSet).to.have.deep.property('valid', true);
      }
    });
  });

  describe('#parseOp(String)', () => {
    it('setOperation', () => {
      setOperationList.forEach((randomSetN) => {
        const parseSet = parser.parseOp(randomSetN.strCommand);
        expect(parseSet).to.have.all.keys('data', 'flags', 'keys', 'op', 'size', 'ttl', 'rest', 'cas');
      });
    });

    it('getOperation', () => {
      getOperationList.forEach((randomGetN) => {
        const parseGet = parser.parseOp(randomGetN.strCommand);
        expect(parseGet).to.have.all.keys('keys', 'op', 'rest', 'data');
      });
    });
  });

  describe('#parseCommand(String) SET operation', () => {
    it('valid set operations shouls have all keys', () => {
      setOperationList.forEach((randomSetN) => {
        const parseSet = parser.parseCommand(randomSetN.strCommand);
        expect(parseSet).to.have.all.keys('data', 'flags', 'keys', 'noReply', 'op', 'size', 'ttl', 'valid', 'cas');
      });
    });

    it('parsed Object should have same same properties', () => {
      setOperationList.forEach((randomSetN) => {
        const parseSet = parser.parseCommand(randomSetN.strCommand);
        const { randomSetN: { strCommand, ...rest } } = { randomSetN };
        expect(parseSet).to.eql({ cas: [], ...rest }); // manually added cas for test
      });
    });
  });

  describe('#parseCommand(String) GET operation', () => {
    it('valid get operations shouls have all keys', () => {
      getOperationList.forEach((randomGetN) => {
        const parseGet = parser.parseCommand(randomGetN.strCommand);
        expect(parseGet).to.have.all.keys('keys', 'op', 'valid');
      });
    });

    it('get parsed Object should have same same properties', () => {
      getOperationList.forEach((randomGetN) => {
        const parseGet = parser.parseCommand(randomGetN.strCommand);
        const { randomGetN: { strCommand, ...rest } } = { randomGetN };
        expect(parseGet).to.eql(rest);
      });
    });
  });

  describe('#parseCommand(String) Cas operation', () => {
    it('Parse should be equal on Cas', () => {
      const validCas = randomCasValid();
      const parseCas = parser.parseCommand(validCas.strCommand);
      const { validCas: { strCommand, ...rest } } = { validCas };
      expect(parseCas).to.eql(rest);
    });
  });
  
});
