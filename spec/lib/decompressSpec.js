'use strict';
var decompress = require('../../lib/decompress');

describe('decompress', function() {
  it('does nothing to uncompressed data', function() {
    var string = 'some unencoded string';
    var stringBuffer = new Buffer(string);
    var decompressedString = decompress(stringBuffer);
    expect(string).toEqual(decompressedString);
  });

  it('decodes references in compressed data', function() {
    var aCharCode = 'a'.charCodeAt(0);
    var bCharCode = 'b'.charCodeAt(0);
    var compressed = new Buffer(new Uint8Array([
      255,
      0,
      aCharCode,
      bCharCode,
      0, 0, 0
    ]));
    var decompressedString = decompress(compressed);
    expect(decompressedString).toEqual('abababab');
  });
});
