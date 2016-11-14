'use strict';
module.exports = decompress;

function decompress(buffer) {
  var charArray = [];
  var hash = {};
  for (var i = 0; i < buffer.length; i++) {
    var value = buffer[i];
    if (value === 255) {
      i++;
      var index = buffer[i];
      i++;
      var charOne = String.fromCharCode(buffer[i]);
      i++;
      var charTwo = String.fromCharCode(buffer[i]);
      hash[index] = [charOne, charTwo];
      charArray.push(charOne);
      charArray.push(charTwo);
    } else if (hash[value]) {
      var charPair = hash[value];
      charArray.push(charPair[0]);
      charArray.push(charPair[1]);
    } else {
      charArray.push(String.fromCharCode(value));
    }
  }
  return charArray.join('');
}
