/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable func-names   */
const uuidv4 = require('uuid/v4');
const { expect } = require('chai');
const { NodeLruCacheInterface } = require('../../src/caches/LRUCache/LRUCache-Interface.js');


const insertionsSet = 1000;
const timeToDie = 10;
const LRU = new NodeLruCacheInterface(10000);

function check(done, f) {
  try {
    f();
    done();
  } catch (e) {
    done(e);
  }
}
const setOperations = [...Array(insertionsSet)].map(() => ({
  keys: uuidv4(), flags: 0, ttl: timeToDie, size: 36, data: uuidv4(),
}));


describe('💽 LRUCache', function () {
  this.timeout(0);

  describe('#cache Get', () => {
    it('Get should bring the data between "\\r\\n{data}\\r\\n" ', (done) => {
      setOperations.forEach(args => LRU.cacheSet({ ...args, ttl: 10000000 })); // Save data
      const dataSet = setOperations.map(({ data }) => data);
      const getRes = setOperations.map(({ keys }) => (LRU.cacheGet(keys)).split('\r\n')[1]);
      expect(getRes).to.eql(dataSet); // fails
      done();
    });
  });

  describe('#cache Set', () => {
    it('Correct set insertions', (done) => {
      setOperations.forEach(args => LRU.cacheSet(args));
      expect(LRU.cache.map.size).to.be.equal(insertionsSet);
      done();
    });
  });

  describe('#Expiration', () => {
    it('Every element should expire', (done) => {
      setTimeout(() => {
        check(done, () => {
          expect(LRU.cache.map.size).to.be.equal(0);
          expect(LRU.cache.ttl.size).to.be.equal(0);
        });
      }, timeToDie * 1000);
    });

    it('Every Element should be alive', (done) => {
      setOperations.forEach(args => LRU.cacheSet(args));
      expect(LRU.cache.map.size).to.be.equal(insertionsSet);
      expect(LRU.cache.ttl.size).to.be.equal(insertionsSet);
      done();
    });
  });

  describe('#cache Add', () => {
    it('2 add operations should return stored and not stored, value shouldnt change after second op', (done) => {
      const opAdd = setOperations[0];
      // eslint-disable-next-line no-underscore-dangle
      LRU.cache._clean();
      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);
      const res2 = LRU.cacheAdd({ ...opAdd, data: uuidv4() });
      const get2 = LRU.cacheGet(opAdd.keys);

      expect(res1).to.be.eql('STORED\r\n');
      expect(res2).to.be.eql('NOT_STORED\r\n');
      expect(get1).to.be.eql(get2);
      done();
    });
  });


  describe('#cache Add', () => {
    it('2 add operations should return stored and not stored, value shouldnt change after second op', (done) => {
      const opAdd = setOperations[0];
      // eslint-disable-next-line no-underscore-dangle
      LRU.cache._clean();
      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);
      const res2 = LRU.cacheAdd({ ...opAdd, data: uuidv4() });
      const get2 = LRU.cacheGet(opAdd.keys);

      expect(res1).to.be.eql('STORED\r\n');
      expect(res2).to.be.eql('NOT_STORED\r\n');
      expect(get1).to.be.eql(get2);
      done();
    });
  });

  describe('#cache Replace', () => {
    it('Replace" means "store this data, but only if the server *does* already hold data for this key', (done) => {
      const opAdd = setOperations[0];
      // eslint-disable-next-line no-underscore-dangle
      LRU.cache._clean();

      const res0 = LRU.cacheReplace(opAdd);
      const get0 = LRU.cacheGet(opAdd.keys);

      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);
      const newData = uuidv4();
      const res2 = LRU.cacheReplace({ ...opAdd, data: newData });
      const get2 = LRU.cacheGet(opAdd.keys);

      expect(res0).to.be.eql('NOT_STORED\r\n', 'should return notStored if key doesnt exist');
      expect(get0).to.be.eql('', 'should return undefined after incorrect replace');
      expect(res1).to.be.eql('STORED\r\n', 'this add should be correct and return stored');
      expect(res2).to.be.eql('STORED\r\n', 'after correct add replace should return stored');
      expect(get2).not.be.eql(get1, 'data after replace should change');
      expect(get2.split('\r\n')[1]).to.be.eql(newData, 'get after replace should return the new data stored');
      done();
    });
  });

  describe('#cache Append', () => {
    it('Append data if data exists', (done) => {
      const opAdd = setOperations[0];
      // eslint-disable-next-line no-underscore-dangle

      const newData = uuidv4();
      const oldData = opAdd.data;
      const concatD = oldData + newData;
      LRU.cache._clean();

      const res0 = LRU.cacheAppend(opAdd);
      const get0 = LRU.cacheGet(opAdd.keys);

      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);

      const res2 = LRU.cacheAppend({ ...opAdd, data: newData });
      const get2 = LRU.cacheGet(opAdd.keys);

      expect(res0).to.be.eql('NOT_STORED\r\n', 'should return notStored if key doesnt exist');
      expect(get0).to.be.eql('', 'should return undefined after incorrect replace');
      expect(res1).to.be.eql('STORED\r\n', 'this add should be correct and return stored');
      expect(res2).to.be.eql('STORED\r\n', 'after correct add replace should return stored');
      expect(get2).not.be.eql(get1, 'data after append should change');
      expect(get2.split('\r\n')[1]).to.be.eql(concatD, 'get after replace append should appended data');
      done();
    });
  });

  describe('#cache Prepend', () => {
    it('Prepend data if data exists', (done) => {
      const opAdd = setOperations[0];
      // eslint-disable-next-line no-underscore-dangle

      const newData = uuidv4();
      const oldData = opAdd.data;
      const concatD = newData + oldData;
      LRU.cache._clean();

      const res0 = LRU.cachePrepend(opAdd);
      const get0 = LRU.cacheGet(opAdd.keys);

      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);
      const res2 = LRU.cachePrepend({ ...opAdd, data: newData });
      const get2 = LRU.cacheGet(opAdd.keys);

      expect(res0).to.be.eql('NOT_STORED\r\n', 'should return notStored if key doesnt exist');
      expect(get0).to.be.eql('', 'should return undefined after incorrect replace');
      expect(res1).to.be.eql('STORED\r\n', 'this add should be correct and return stored');
      expect(res2).to.be.eql('STORED\r\n', 'after correct add replace should return stored');
      expect(get2).not.be.eql(get1, 'data after prepend should change');
      expect(get2.split('\r\n')[1]).to.be.eql(concatD, 'get after replace append should prepend data');
      done();
    });
  });


  describe('#cache Prepend', () => {
    it('Prepend data if data exists', (done) => {
      const opAdd = setOperations[0];
      // eslint-disable-next-line no-underscore-dangle

      const newData = uuidv4();
      const oldData = opAdd.data;
      const concatD = newData + oldData;
      LRU.cache._clean();

      const res0 = LRU.cachePrepend(opAdd);
      const get0 = LRU.cacheGet(opAdd.keys);

      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);

      const res2 = LRU.cachePrepend({ ...opAdd, data: newData });
      const get2 = LRU.cacheGet(opAdd.keys);

      expect(res0).to.be.eql('NOT_STORED\r\n', 'should return notStored if key doesnt exist');
      expect(get0).to.be.eql('', 'should return undefined after incorrect replace');
      expect(res1).to.be.eql('STORED\r\n', 'this add should be correct and return stored');
      expect(res2).to.be.eql('STORED\r\n', 'after correct add replace should return stored');
      expect(get2).not.be.eql(get1, 'data after prepend should change');
      expect(get2.split('\r\n')[1]).to.be.eql(concatD, 'get after replace append should prepend data');
      done();
    });
  });

  describe('#cache Cas', () => {
    it('"cas" is a check and set operation which means "store this data but only if no one else has updated since I last fetched it."', (done) => {
      const opAdd = setOperations[0];
      const oldData = opAdd.data;
      const newData = uuidv4();
      LRU.cache._clean();

      const res0 = LRU.cacheCas(opAdd);
      const get0 = LRU.cacheGet(opAdd.keys);

      const res1 = LRU.cacheAdd(opAdd);
      const get1 = LRU.cacheGet(opAdd.keys);

      const cas = get1.split('\r\n')[0].slice(-37, -1);

      const res2 = LRU.cacheCas({ ...opAdd, data: newData, cas });
      const get2 = LRU.cacheGet(opAdd.keys);

      const res3 = LRU.cacheAdd({ ...opAdd, data: uuidv4() });
      const newCas = res3.split('\r\n')[0].slice(-37, -1);


      const res4 = LRU.cacheCas({ ...opAdd, data: newData, cas });


      expect(res0).to.be.eql('NOT_FOUND\r\n', 'err 1 should return notStored if key doesnt exist');
      expect(get0).to.be.eql('', 'err 2 should return undefined after incorrect Cas');
      expect(res1).to.be.eql('STORED\r\n', 'err 3 this add should be correct and return stored');
      expect(res2).to.be.eql('STORED\r\n', 'err 4 after correct add replace should return stored');
      expect(get2).not.be.eql(get1, 'err 5data after prepend should change');
      expect(get2.split('\r\n')[1]).to.be.eql(newData, 'err 6 get after replace append should prepend data');
      expect(cas).not.be.eql(newCas, 'err 7 cas should change after Add');
      expect(res4).not.be.eql('STORED\r\n', 'err 8 cas should fail after cas changed');
      expect(res4).be.eql('EXISTS\r\n', 'err 9 cas should return exists if cant change');
      expect(newData).not.be.eql(oldData, 'err 10 data should change');
      done();
    });
  });
});
