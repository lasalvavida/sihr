# Sihr
A Node.js module that uses
[byte pair encoding](https://en.wikipedia.org/wiki/Byte_pair_encoding)
to compress UTF-8 strings.

## What does Sihr do?
Sihr looks for pairs of bytes in your input data that are repeated and encodes duplicates as references to the first occurrence. Compressed data produced by Sihr will never be longer than the input data.

## How does Sihr work?
1. Looks through the input data to determine which character code bytes are unused.
2. Finds pairs of bytes in the input data that are repeated at least three times.
 * Why three?
 * The first occurrence of a byte pair is replaced by `[255, referenceByte, b0, b1]`. `255` marks that this is a reference declaration, and `referenceByte` should be replaced with `b0,b1` if it appears again in the data. Since the declaration has an overhead of two bytes, the byte pair must occur at least two more times to break even.
3. The most frequent byte pairs are assigned to the unused character codes, and the unused character codes are used as references to compress the data.

## Usage
### Get Sihr on npm
```
npm install sihr
```

### Compress string -> buffer
```javascript
var myString = 'hello world';
var compressedBuffer = sihr.compress(myString);
```
You can re-use a pre-allocated buffer for the compression to reduce memory overhead. A buffer view to the portion representing the compressed data will be returned.

Because Sihr will never inflate input data, you can do this safely as long as the buffer is at least as long as the input string.
```javascript
// Pre-allocate buffer for compressed string
var preAllocatedBuffer = new Buffer(myString.length);
var compressedPreAllocatedBuffer = sihr.compress(myString, preAllocatedBuffer);
```

### Decompress buffer -> string
```javascript
var decodedString = sihr.decompress(compressedBuffer);
// > 'hello world!'
```

## Contributing
Pull requests and suggested improvements are welcome. Changes to the compression approach will be considered provided that they:
* Don't introduce substantial overhead. Compression and decompression should be fast.
* Do not present the possibility of inflating input data. There are other Node.js modules that sacrifice this criteria to get better compression ratios.
I made this design choice so that buffers could be safely re-used to reduce the overhead of memory allocation. If that isn't important to your application I would recommend using [smaz](https://github.com/personalcomputer/smaz.js) or the built-in [zlib](https://nodejs.org/api/zlib.html).

## License
Sihr is released under the MIT license. See [LICENSE](./LICENSE) for more details.
