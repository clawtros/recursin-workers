var shuffle = require("./shuffle");
var intersect = require('./intersect');

const Constants = {
  UNPLAYABLE: "_",
  ACROSS: Symbol("ACROSS"),
  DOWN: Symbol("DOWN")
}

function Crossword(cells, across, down, wordlist, bads) {
  var size = parseInt(Math.sqrt(cells.length)),
      words = [],
      bads = {},
      i, w;

  for (i in across) {
    words.push(Word(parseInt(i), across[i].length, Constants.ACROSS));
  }
  for (i in down) {
    words.push(Word(parseInt(i), down[i].length, Constants.DOWN));
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
    wordList: wordlist,
    
    getWords: function(forDirection) {      
      if (forDirection) {
        return words.filter(function(e) {
          return e.direction === forDirection;
        });
      }
      return words;
    },
    getValidity: function() {
      var words = this.getWords(),
          seen = [];      
      for (var i = 0, word; word = words[i]; i++) {
        if (bads[word.value] === true) {
          return false;
        }
        var wl = wordlist.matches(word).length;
        if (wl === 0 || (!word.hasBlanks && seen.indexOf(word.value) > -1)) {
          if (wl === 0) {
            bads[word.value] = true; 
          }
          return false;
        }
        seen.push(word.value);
      }
      return true;
    },    
    isComplete: function() {
      return cells.indexOf(Constants.UNPLAYABLE) == -1;
    }
  }

  function Word(startId, length, direction) {
    var value = "",
        blanks = false,
        allblanks = true;
        delta = direction == Constants.ACROSS ? 1 : size;
    
    for (var i = 0; i < length; i++) {
      var cellIndex = startId + i * delta;
      value += cells[cellIndex];
      if (cells[cellIndex] === Constants.UNPLAYABLE) {
        blanks = true;
      } else {
        allblanks = false;
      }      
    }
    
    return {
      getOptions: function() {
        return wordlist.matches(this);
      },
      
      set: function(word) {
        var newCells = cells.slice(),
            delta = direction == Constants.ACROSS ? 1 : size;
        for (var i = 0; i < length; i++) {
          var cellIndex = startId + i * delta;
          newCells[cellIndex] = word[i];
        }
        return new Crossword(newCells, across, down, wordlist, bads);
      },      
      hasBlanks:  blanks,
      allBlanks:  allblanks,
      direction: direction,
      value: value,
    }
  }
}

function WordList(words, memo) {
  var lookup = {},
      letterPositionLookup = {},
      memo = {};

  for (var j = 0, word; word = words[j]; j++) {
    memo[word] = [word];
    for (var i = 0, l = word.length; i < l; i++) {
      letterPositionLookup[word.length] = letterPositionLookup[word.length] || {};
      letterPositionLookup[word.length][i] = letterPositionLookup[word.length][i] || {};
      letterPositionLookup[word.length][i][word[i]] = letterPositionLookup[word.length][i][word[i]] || [];
      letterPositionLookup[word.length][i][word[i]].push(word);
    }
  }
  
  return {
    matches: function(searchWord) {      
      var matchIndexes = [],
          result = [],
          searchValue = searchWord.value;

      if (!memo[searchValue]) {        
        if (!searchWord.hasBlanks) {
          if (lookup[searchValue] === true) {
            result = [searchValue];
          } else {
            result = [];
          }
        } else {
          if (!searchWord.allBlanks) {
            var sets = [];
            for (var i = 0, l = searchValue.length; i < l; i++) {
              if (searchValue[i] !== Constants.UNPLAYABLE) {
                sets.push(letterPositionLookup[searchValue.length][i][searchValue[i]]);
              }
            }
            result = intersect.big(sets);
          } else {
            result = words;
          }
        }  
        memo[searchValue] = result;
      }
      return memo[searchValue];
    }
  }
}

function solve(crossword, successCallback, progressCallback, position) {
  if (crossword.isComplete()) {
    successCallback(crossword);
    return true;
  }
  
  var position = position || 0,
      words = crossword.getWords(position % 2 == 0 ? Constants.ACROSS : Constants.DOWN),
      candidates = words.filter(function(e) {
        return e.hasBlanks
      }),
      word = candidates.sort(function(a, b) { return a.getOptions().length > b.getOptions().length })[0],
      options = word.getOptions();
  
  for (var j = 0, option; option = options[j]; j++) {
    var newState = word.set(option);
    progressCallback(newState, (newState.getWords().map(function(e) {
      return e.value  }).join("\t\t") ));
    if (newState.getValidity() !== false) {
    
      if (solve(newState, successCallback, progressCallback, position + 1) === true) {
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
