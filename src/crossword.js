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
        return wordlist.matches(this.get(), false);
      },
      
      _each: function(callback) {
        var delta = direction == Constants.ACROSS ? 1 : size;
        for (var i = 0; i < length; i++) {
          var cellIndex = startId + i * delta;
          callback(i, cellIndex);
        }
      },

      hasBlanks: function() {
        return this.get().indexOf("_") > -1;
      },
      
      getDirection: function() {
        return direction;
      },
      
      set: function(word) {
        var newCells = cells.slice();
        this._each(function(index, cellIndex) {
          newCells[cellIndex] = word[index];
        });
        wordlist.remove(word)
        return new Crossword(newCells, across, down, wordlist);
      },      

      get: function() {
        var result = "";
        this._each(function(_, cellIndex) {
          result += cells[cellIndex];
        });
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
    isValid: function() {
      var words = this.getWords();
      for (var i = 0, word; word = words[i]; i++) {
        var wl = wordlist.matches(word.get(), false);
        if (wl == 0) {
          return false;
        }
      }
      return true;
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
//      used.push(word);
    },
    matches: function(searchWord, omitUsed) {
      var cleanTerm = searchWord.replace(new RegExp(Constants.UNPLAYABLE, "g"), "\\w"),
          re = new RegExp(cleanTerm), result = [];
      for (var i = 0, word; word = words[i]; i++) {
        if (omitUsed) {
          if (used.indexOf(word) == -1 && re.test(word)) {
            result.push(word);
          }
          
        } else {
          if (re.test(word)) {
            result.push(word);
          }
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
  
  var options = word.getOptions();
  for (var j = 0, option; option = options[j]; j++) {
    var newState = word.set(option);

    if (newState.isValid()) {
      
      if (progressCallback) {
        progressCallback(newState);
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
