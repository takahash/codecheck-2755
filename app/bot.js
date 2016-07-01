function Bot(data) { 
  //Solve the challenge here and pass all the tests
  this.command = data.command;
  this.data = data.data;
}

Bot.prototype.generateHash = function() {

  var cmdAsc2Str = '';
  var dataAsc2Str = '';

  var cmdArray = this.command.split('');
  var dataArray = this.data.split('');

  console.log(this.command);
  console.log(this.data);

  cmdArray.forEach(function(val, index, ar) {
    cmdAsc2Str += val.charCodeAt(0);
  });
  var cmdAsc2Int = scientificNotation(cmdAsc2Str);
  console.log(cmdAsc2Int);
  if (cmdAsc2Str.length >= 22) {
    cmdAsc2Str = String(cmdAsc2Int).replace(/^.*\.|e\+/g, '');
    console.log(cmdAsc2Str);
  }

  dataArray.forEach(function(val, index, ar) {
    dataAsc2Str += val.charCodeAt(0);
  });
  var dataAsc2Int = scientificNotation(dataAsc2Str);
  console.log(dataAsc2Int);
  if (dataAsc2Str.length >= 22) {
    dataAsc2Str = String(dataAsc2Int).replace(/^.*\.|e\+/g, '');
    console.log(dataAsc2Str);
  }

  var sum = parseInt(cmdAsc2Str) + parseInt(dataAsc2Str);
  console.log(sum);

  var hash = sum.toString(16);
  console.log(hash);
  this.hash = hash;
}

// Convert the number into scientific notation with 16 digits after "."
// If power of e is greater than 20, get the number between "." and "e"
// Else return the number itself
function scientificNotation(num) {
  var data = parseInt(num).toExponential(16);
  result = (data.toString().split("e+")[1] > 20) ? data : parseInt(num)
  return result
}

module.exports = Bot;
