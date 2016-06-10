var shuffle = require("./shuffle");
var intersect = require('./intersect');

const Constants = {
  UNPLAYABLE: "_",
  ACROSS: Symbol("ACROSS"),
  DOWN: Symbol("DOWN")
}

var memo = {};
var bads = {};

function Crossword(cells, across, down, wordlist) {
  var size = parseInt(Math.sqrt(cells.length)),
      words = [],
      i, w;

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
        
        var wl = wordlist.matches(word.value).length;
        if (wl == 0 ||
            (!word.hasBlanks && seen.indexOf(word.value) > -1)) {
          bads[word.value] = true;
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
        return wordlist.matches(value);
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

      hasBlanks:  blanks,
      allBlanks:  allblanks,
      direction: direction,
      value: value,
    }
  }
}

function WordList(words) {
  var lookup = {},
      letterPositionLookup = {};
  
  for (var j = 0, word; word = words[j]; j++) {
    lookup[word] = true;
    for (var i = 0, l = word.length; i < l; i++) {
      letterPositionLookup[i] = letterPositionLookup[i] || {};
      letterPositionLookup[i][word[i]] = letterPositionLookup[i][word[i]] || [];
      letterPositionLookup[i][word[i]].push(word);
    }
  }
  
  return {
    matches: function(searchWord) {
      
      var matchIndexes = [],
          result = [];
      
      if (!memo[searchWord]) {
        if (searchWord.indexOf(Constants.UNPLAYABLE) == -1) {
          if (lookup[searchWord] === true) {
            result = [searchWord];
          } else {
            result = [];
          }
        } else {
          var sets = [];
          for (var i = 0, l = searchWord.length; i < l; i++) {
            if (searchWord[i] !== Constants.UNPLAYABLE) {
              sets.push(letterPositionLookup[i][searchWord[i]]);
            }
          }
          if (sets.length > 0) {
            result = intersect(sets);
          } else {
            result = words;
          }
        }
        memo[searchWord] = result;
      }
      return memo[searchWord];
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
      word = candidates[parseInt(Math.random() * candidates.length)],
      options = word.getOptions();
  
  for (var j = 0, option; option = options[j]; j++) {
    var newState = word.set(option);
    progressCallback(newState, j + " " + position);    
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
