'use strict';
module.exports = compress;

/**
 * Compress the provided input string using byte pair encoding.
 * If `buffer` is provided, a view containing the compressed data is returned.
 *
 * @param {String} string The input string to compress.
 * @param {Buffer} [buffer] A buffer into which the compressed output should be written.
 * @returns {Buffer} A buffer containing the compressed output.
 */
function compress(string, buffer) {
  if (buffer === undefined) {
    buffer = new Buffer(string.length);
  }
  var i;
  var bytePairIndex;
  var charCode;
  var stringLength = string.length;
  var usedBytes = {};
  var bytePairs = {};
  var lastCharCode = -1;
  var numEncodeBytes = 255;
  // Generate usedBytes and bytePairs hash
  for (i = 0; i < stringLength; i++) {
    charCode = string.charCodeAt(i);
    if (usedBytes[charCode] === undefined) {
      numEncodeBytes--;
    }
    usedBytes[charCode] = true;
    if (lastCharCode >= 0) {
      bytePairIndex = lastCharCode * 256 + charCode;
      if (!bytePairs[bytePairIndex]) {
        bytePairs[bytePairIndex] = 0;
      }
      bytePairs[bytePairIndex]++;
    }
    lastCharCode = charCode;
  }
  if (usedBytes[255]) {
    throw new Error('The provided string contains invalid data and is uncompressable.');
  }
  // Generate encodeHash
  var encodeHash = {};
  var encodeByte = 0;
  var bytePairIndices = Object.keys(bytePairs);
  if (bytePairIndices.length > numEncodeBytes) {
    bytePairIndices.sort(function(a, b) {
      return bytePairs[b] - bytePairs[a];
    });
    bytePairIndices = bytePairIndices.slice(0, numEncodeBytes);
  }
  for (i = 0; i < bytePairIndices.length; i++) {
    bytePairIndex = bytePairIndices[i];
    if (bytePairs[bytePairIndex] > 3) {
      while (usedBytes[encodeByte]) {
        encodeByte++;
      }
      encodeHash[bytePairIndex] = {
        first: true,
        value: encodeByte
      };
      encodeByte++;
    }
  }
  // Encode the string
  var bufferIndex = 0;
  lastCharCode = -1;
  for (i = 0; i < stringLength; i++) {
    charCode = string.charCodeAt(i);
    if (lastCharCode >= 0) {
      bytePairIndex = lastCharCode * 256 + charCode;
      var encode = encodeHash[bytePairIndex];
      if (encode) {
        // Encode this byte pair
        if (encode.first) {
          buffer[bufferIndex] = 255;
          bufferIndex++;
          buffer[bufferIndex] = encode.value;
          bufferIndex++;
          buffer[bufferIndex] = lastCharCode;
          bufferIndex++;
          buffer[bufferIndex] = charCode;
          bufferIndex++;
          encode.first = false;
        } else {
          buffer[bufferIndex] = encode.value;
          bufferIndex++;
        }
        // Skip ahead by one since the current byte is already encoded
        i++;
        charCode = string.charCodeAt(i);
      } else {
        // Write plain byte to buffer
        buffer[bufferIndex] = lastCharCode;
        bufferIndex++;
        if (i === stringLength - 1) {
          // Write the last byte
          buffer[bufferIndex] = charCode;
          bufferIndex++;
        }
      }
    }
    lastCharCode = charCode;
  }
  return buffer.slice(0, bufferIndex);
}
