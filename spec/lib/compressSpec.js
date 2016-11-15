'use strict';
var compress = require('../../lib/compress');

describe('compress', function() {
  it('does nothing to an incompressible string', function() {
    var incompressible = 'ababab';
    var encoded = compress(incompressible);
    expect(encoded.toString()).toBe(incompressible);
  });

  it('compresses a compressible string', function() {
    var compressible = 'ababababcdcdcdcd';
    var encoded = compress(compressible);
    var aCharCode = compressible.charCodeAt(0);
    var bCharCode = compressible.charCodeAt(1);
    var cCharCode = compressible.charCodeAt(8);
    var dCharCode = compressible.charCodeAt(9);
    var expectEncoded = new Buffer(new Uint8Array([
      255,
      0,
      aCharCode,
      bCharCode,
      0,0,0,
      255,
      1,
      cCharCode,
      dCharCode,
      1,1,1
    ]).buffer)
    expect(encoded).toEqual(expectEncoded);
  });

  it('compresses a string into a pre-allocated buffer', function() {
    var compressible = 'abababab';
    var preAllocated = new Buffer(compressible.length);
    var encoded = compress(compressible, preAllocated);
    expect(encoded.buffer).toEqual(preAllocated.buffer);
  });

  it('throws an exception if the string contains a 255 byte', function() {
    var errorString = 'ab' + String.fromCharCode(255);
    expect(function() {
      compress(errorString);
    }).toThrowError();
  });
});
