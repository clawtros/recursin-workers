var shuffle = require("./shuffle");

const Constants = {
  UNPLAYABLE: "_",
  ACROSS: Symbol("ACROSS"),
  DOWN: Symbol("DOWN")
}

function Crossword(cells, across, down, wordlist) {
  var size = parseInt(Math.sqrt(cells.length)),
      words = [],
      i, w;

  function Word(startId, length, direction) {
    return {
      getOptions: function() {
        return wordlist.matches(this.get(), true);
      },

      hasBlanks: function() {
        return this.get().indexOf("_") > -1;
      },
      
      getDirection: function() {
        return direction;
      },
      
      set: function(word) {
        var newCells = cells.slice(),
            delta = direction == Constants.ACROSS ? 1 : size;
        for (var i = 0; i < length; i++) {
          var cellIndex = startId + i * delta;
          newCells[cellIndex] = word[i];
        }
        return new Crossword(newCells, across, down, wordlist);
      },      

      get: function() {
        var result = "",
            delta = direction == Constants.ACROSS ? 1 : size;
        for (var i = 0; i < length; i++) {
          var cellIndex = startId + i * delta;
          result += cells[cellIndex];
        }
        return result;
      }
    }
  }

  for (i in across) {
    words.push(new Word(parseInt(i), across[i].length, Constants.ACROSS));
  }
  for (i in down) {
    words.push(new Word(parseInt(i), down[i].length, Constants.DOWN));
  }
  
  return {
    toString: function() {
      var result = "";
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
          result += cells[j + i * size];
        }
        result += "\n";
      }
      return result;
    },
    getWords: function(forDirection) {
      
      if (forDirection) {
        return words.filter(function(e) {
          return e.getDirection() === forDirection;
        });
      }
      return words;
    },

    getValidity: function() {
      var words = this.getWords(),
          sum = 0;
      for (var i = 0, word; word = words[i]; i++) {
        var wl = wordlist.matches(word.get(), false).length;
        if (wl == 0) {
          return false;
        }
        sum += wl;
      }
      return sum;
    },
    
    isComplete: function() {
      return cells.indexOf(Constants.UNPLAYABLE) == -1;
    }
  }
}

function WordList(words) {
  var used = [];
  return {
    remove: function(word) {
      used.push(word);
    },
    matches: function(searchWord, omitUsed) {
      var matchIndexes = [], result = [];
      for (var i = 0, l = searchWord.length; i < l; i++) {
        if (searchWord[i] !== Constants.UNPLAYABLE) {
          matchIndexes.push(i);
        }
      }
      for (var j = 0, word; word = words[j]; j++) {
        var matched = true;
        for (var i = 0, l = matchIndexes.length; i < l; i++) {
          if (word[matchIndexes[i]] !== searchWord[matchIndexes[i]]) {
            matched = false;
            continue;
          }
        }
        if (matched && word.length === searchWord.length) {
          result.push(word);  
        }
      }
      return result;
    }
  }
}


function solve(crossword, callback, progressCallback) {
  
  if (crossword.isComplete()) {
    callback(crossword);
    return true;
  }

  var words = crossword.getWords(),
      candidates = words.filter(function(e) {
        return e.hasBlanks();
      }),
      word = candidates[parseInt(Math.random() * candidates.length)];
  
  if (!word) {
    return false;
  }
  
  var options = shuffle(word.getOptions());
  
  for (var j = 0, option; option = options[j]; j++) {
    var newState = word.set(option),
        validity = newState.getValidity();
    
    if (validity !== false) {
      if (progressCallback) {
        progressCallback(newState, j + " " + validity);
      }
      if (solve(newState, callback, progressCallback) === true) {
        return true;
      }
    }
  }
  return false;
  
}

module.exports = {
  Crossword: Crossword,
  WordList: WordList,
  Constants: Constants,
  solve: solve
}
