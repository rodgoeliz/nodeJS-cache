/* eslint-disable no-new */
/* eslint-disable no-unused-vars */
const dotenv = require('dotenv').config();
const { Server } = require('./src/server.js');
const { CacheMiddleWare } = require('./src/cacheMiddleWare.js');
const { CacheParser } = require('./src/cacheParser.js');
const { NodeLruCacheInterface } = require('./src/caches/LRUCache/LRUCache-Interface');

new Server({
  port: process.env.PORT,
  address: process.env.SERVER,
  cacheMiddleWare: new CacheMiddleWare(new CacheParser(), new NodeLruCacheInterface()),
});

// new Server({ port: 1338, address:process.env.SERVER, cache:  cache });
