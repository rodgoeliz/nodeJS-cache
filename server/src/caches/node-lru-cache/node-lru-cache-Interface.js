/* eslint-disable object-curly-newline */
/* eslint-disable class-methods-use-this */
// https://github.com/isaacs/node-lru-cache
const LRU = require('lru-cache');
const uuidv4 = require('uuid/v4');

class NodeLruCacheInterface {
  constructor(options = 1000) {
    this.cache = new LRU(options);
  }

  cacheGet(key) {
    const entry = this.cache.get(key);

    if (entry !== undefined) {
      const { flags, size, cas, data } = entry;
      return `VALUE ${key} ${flags} ${size} [${cas}]\r\n${data}\r\n`;
    }
    return '';
  }

  cacheSet({ keys, flags, ttl, size, data }) {
    const cas = uuidv4();
    this.cache.set(keys, { data, cas, size, flags }, ttl * 1000);
    return 'STORED\r\n';
  }

  cacheAdd(operation) {
    if (!this.cache.has(operation.keys)) return this.cacheSet(operation);
    return 'NOT_STORED\r\n';
  }

  cacheReplace(operation) {
    if (this.cache.has(operation.keys)) return this.cacheSet(operation);
    return 'NOT_STORED\r\n';
  }

  cacheAppend(operation) {
    const entry = this.cache.get(operation.keys);

    if (entry !== undefined) {
      const newData = entry.data + operation.data;
      return this.cacheSet({ ...operation, data: newData });
    }
    return 'NOT_STORED\r\n';
  }

  cachePrepend(operation) {
    const entry = this.cache.get(operation.keys);
    if (entry !== undefined) {
      const newData = operation.data + entry.data;
      return this.cacheSet({ ...operation, data: newData });
    }
    return operation.noReply ? '' : 'NOT_STORED\r\n';
  }

  cacheCas(operation) {
    const entry = this.cache.get(operation.keys);
    let opRes = 'NOT_FOUND\r\n';
    if (entry !== undefined) {
      if (entry.cas === operation.cas) {
        opRes = this.cacheSet(operation);
      } else {
        opRes = 'EXISTS\r\n';
      }
    }
    return opRes;
  }
}

exports.NodeLruCacheInterface = NodeLruCacheInterface;
