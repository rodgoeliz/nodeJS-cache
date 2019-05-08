/* eslint-disable prefer-arrow-callback */
/* eslint-disable object-curly-newline */
/* eslint-disable func-names */
/* eslint-disable no-undef */
/* eslint-disable no-new */
const dotenv = require('dotenv').config();
const { expect } = require('chai');
const net = require('net');
const { Server } = require('../src/server.js');
const { CacheMiddleWare } = require('../src/cacheMiddleWare.js');
const { CacheParser } = require('../src/cacheParser.js');
const { NodeLruCacheInterface } = require('../src/caches/LRUCache/LRUCache-Interface');
const { getValid, randomSetValid, randomValidOp } = require('./utils.js');

const lruCache = new NodeLruCacheInterface();
new Server({
  port: process.env.PORT,
  address: process.env.SERVER,
  cacheMiddleWare: new CacheMiddleWare(new CacheParser(), lruCache),
});

const timesToTest = 100;
const setOperationList = [...Array(timesToTest)].map(randomSetValid);
const operationList = [...Array(timesToTest)].map(randomValidOp);

const keys = setOperationList.map(op => op.keys);

describe('🤖 Test tcp server', function () {
  this.timeout(0);


  describe('#Random Value', function () {
    it('Random valid operation', (done) => {
      operationList.forEach(({ strCommand }) => {
        const client = net.connect({ address: process.env.SERVER, port: process.env.PORT },
          () => {
            client.write(strCommand);
          });
        client.on('data', (data) => {
          expect(data.toString()).not.to.be.equal('CLIENT_ERROR invalid_Command\r\n', `returned ${data.toString()} with ${strCommand}`);
          client.end();
        });
      });

      done();
    });
  });

  describe('#SET Value', function () {
    it('Valid set operation with no [no reply] should return stored', (done) => {
      setOperationList.forEach(({ strCommand }) => {
        const client = net.connect({ address: process.env.SERVER, port: process.env.PORT },
          () => {
            client.write(strCommand);
          });
        client.on('data', (data) => {
          expect(data.toString()).to.equal('STORED\r\n', `returned ${data.toString()} with ${strCommand}`);
          client.end();
        });
      });

      done();
    });
  });
  describe('#Get Value', function () {
    it(`Cas unique && returned equal to (${timesToTest}) amount created`, (done) => {
      const client = net.connect({ address: process.env.SERVER, port: process.env.PORT },
        () => {
          client.write(getValid(keys).strCommand);
        });
      client.setTimeout(1000);
      client.setEncoding('utf8');

      // When connection disconnected.
      client.on('data', (d) => {
        const [, ...splitData] = (d.toString()).split('VALUE');
        //       return `VALUE ${key} ${flags} ${size} [${cas}]\r\n${data}\r\n`;

        const parsedSplitData = splitData.map((line) => {
          [value, key, flag, size, cas] = line.split(' ');
          return { value, key, flag, size, cas };
        });

        const casList = parsedSplitData.map(a => a.cas.split('\r\n')[0]);
        const casSet = new Set(casList);
        expect(casList).to.have.lengthOf(casSet.size, 'cas not unique');
        expect(splitData).to.have.lengthOf(timesToTest, `returned equal to (${timesToTest}) amount created`);
        client.end();
      });

      done();
    });
  });
});
