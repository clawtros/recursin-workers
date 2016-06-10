var jscw = require("./crossword");
var nytwords = require('./nytwords');
var shuffle = require('./shuffle');

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

self.addEventListener("message", function(message) {
  jscw.solve(makeSquare(message.data.size), function(result) {
    self.postMessage({
      type: "complete",
      "grid": result.toString(),
      words: result.getWords().map(function(e) {
        return e.value
      })
    });
  }, function (result, validity) {
    self.postMessage({type:"progress", validity: validity, "grid": result.toString()});
  });  
})
  
