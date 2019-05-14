# ⚠️      This is a work in progress

### You shouldn't expect things to “just work”

🚨 This project uses ES9 features related to destructuring
```object spread property' is only available in ES9```

# Memcached 
`memcached` is a Memcached server made in Node.js.

### Interesting bits .

The cache I ended up using, uses timeouts to expire the key value pair in the LRU



You can swap the cache its using in few steps by adding a new cache in src/caches/ see node-lru-cache.js for example

### protocol

This memcached is based in the protocol present in https://github.com/memcached/memcached/blob/master/doc/protocol.txt

## Installation
Clone this project 
```
cd node-cache/server
npm install
```
create .env file in node-cache/server
env file should have SERVER and PORT defined
SERVER="127.0.0.1"
PORT = 1337


For server mode
```
cd node-cache/server
npm start 
```

To run tests 
```
cd node-cache/server
npm test
```

### Testing using console
```
printf "get mykey2\r\n" | nc 127.0.0.1 1337
printf "set mykey2 0 60 4\r\ndata\r\n" | nc 127.0.0.1 1337
```
### Testing using parallel connections
You can stress test this project using tcpkali https://github.com/satori-com/tcpkali

```
tcpkali  --connections 100 127.0.0.1:1337 -1"get mykey2 2\r\n" --connect-rate=1k
```
