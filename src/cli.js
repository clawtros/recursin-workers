var jscw = require("./src/crossword");
var nytwords = require('./src/nytwords');


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function makeSquare(size, wordlist) {
  var cells = [], across = {}, down = {};
  
  for (var i = 0; i < size; i++) {
    across[i * size] = {
      length: size
    }
    down[i] = {
      length: size
    }
  }

  for (var j = 0; j < size * size; j++) {
    cells.push("_");
  }

  return new jscw.Crossword(cells, across, down,
                            jscw.WordList(
                              shuffle(
                                nytwords.filter(function(e) {
                                  return e.length == size;
                                })
                              )
                            ));
}

/* 
 * jscw.solve(makeSquare(size), function(result) {
 *   console.log(result.toString())
 *   console.log("----")
 *   var words = result.getWords();
 *   for (var i = 0, word; word = words[i]; i++) {
 *     console.log(word.get());
 *   }
 * });  */
console.log("HERE");
window.testThing = function(size, progressCallback) {

  jscw.solve(makeSquare(size), function() {}, progressCallback);  
}
