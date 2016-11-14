'use strict';
module.exports = compress;

var usedBytes = new Array(256);
var bytePairCounts = new Array(65536);

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
  var i, j;
  var bytePairIndex;
  var charCode;
  var usedBytesLength = usedBytes.length;
  var bytePairCountsLength = bytePairCounts.length;
  // Reset the counts
  for (i = 0; i < usedBytesLength; i++) {
    usedBytes[i] = false;
    for (j = 0; j < usedBytesLength; j++) {
      bytePairCounts[i * usedBytesLength + j] = 0;
    }
  }
  // Build counts for byte pairs and mark used bytes
  var lastCharCode = -1;
  var stringLength = string.length;
  for (i = 0; i < stringLength; i++) {
    charCode = string.charCodeAt(i);
    usedBytes[charCode] = true;
    if (lastCharCode >= 0) {
      bytePairIndex = lastCharCode * 256 + charCode;
      bytePairCounts[bytePairIndex]++;
    }
    lastCharCode = charCode;
  }
  // 255 is used to indicate reference declarations and cannot exist in the string
  if (usedBytes[255]) {
    throw new Error('The provided string contains invalid data and is uncompressable.');
  }
  // Find all possible encoding slots (excluding 255)
  var encodingSlots = [];
  for (i = 0; i < usedBytesLength - 1; i++) {
    if (!usedBytes[i]) {
      encodingSlots.push(i);
    }
  }
  // Assign frequent repeating byte pairs to each encoding slot
  var numSlots = encodingSlots.length;
  var encodeBytePairs = [];
  var sortFunction = function(a, b) {
    return bytePairCounts[b] - bytePairCounts[a];
  };
  for (i = 0; i < bytePairCountsLength; i++) {
    if (bytePairCounts[i] > 3) {
      encodeBytePairs.push(i);
    }
    if (encodeBytePairs.length > numSlots) {
      encodeBytePairs.sort(sortFunction);
      encodeBytePairs.pop();
    }
  }
  // Make the encoding hash
  var encodeHash = {};
  for (i = 0; i < numSlots; i++) {
    encodeHash[encodeBytePairs[i]] = {
      first: true,
      value: encodingSlots[i]
    };
  }
  // Do the encoding
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
