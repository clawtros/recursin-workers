var expect = require('chai').expect;
var Crossword = require('../src/crossword').Crossword;
var WordList = require('../src/crossword').WordList;
var Constants = require('../src/crossword').Constants;
var solve = require('../src/crossword').solve;
var nytwords = require('../src/nytwords');


function getSmallCrossword() {
  return new Crossword(
    "_".split(""),
    {
      0: {
        length: 1
      }
    }, {
      0: {
        length: 1
      }
    },
    WordList(["a"]));
}

function getMediumCrossword() {
  return new Crossword(
    "abcdefghi".split(""),
    {
      0: {
        length: 3
      },
      3: {
        length: 3
      }
    }, {
      0: {
        length: 3
      },
      1: {
        length: 3
      }
    },
    WordList(["abc", "def", "ghi", "beh", "adg", "cfi"]));
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

  return new Crossword(cells, across, down,
                       WordList(
                           nytwords.filter(function(e) {
                             return e.length == size;
                           })
                         ));
}


describe('crossword-test', function() {
  it('should pass this canary test', function() {
    expect(true).to.eql(true);
  });
  
  it('words should return cell values', function() {
    expect(getSmallCrossword().getWords()[0].value).to.eql("_");    
  });

  it('should check underscores for completion', function() {
    expect(getSmallCrossword().getWords()[0].hasBlanks()).to.eql(true);    
  });

  it('should return false without underscores', function() {
    expect(getMediumCrossword().getWords(Constants.DOWN)[1].hasBlanks()).to.eql(false);    
  });

  it('set words should return new crossword state', function() {
    expect(getSmallCrossword().getWords()[0].set("a").getWords()[0].value).to.eql("a");
  });

  it('set words should check length', function() {
    expect(getSmallCrossword().getWords()[0].set("aa")).to.throw;
  });
  
  it('medium across words should return cell values', function() {
    expect(getMediumCrossword().getWords(Constants.ACROSS)[0].value).to.eql("abc");    
  });

  it('offset medium across words should return cell values', function() {
    expect(getMediumCrossword().getWords(Constants.ACROSS)[1].value).to.eql("def");
  });

  it('should return cell values for medium down words', function() {
    expect(getMediumCrossword().getWords(Constants.DOWN)[0].value).to.eql("adg");    
  });

  it('medium offset down words should return cell values', function() {
    expect(getMediumCrossword().getWords(Constants.DOWN)[1].value).to.eql("beh");    
  });

  it('should return all words if direction is unspecified', function() {
    expect(getMediumCrossword().getWords().length).to.eql(4);    
  });
});

describe('wordlist-test', function() {  
  it('should match exact queries', function() {
    expect(new WordList(["ccc", "aaa", "bbb"]).matches("aaa")).to.eql(["aaa"]);
  });
  it('should match approximates', function() {
    expect(WordList(["abc", "def", "ghi", "beh", "adg", "cfi"]).matches("__g")).to.eql(["adg"])
    expect(WordList(["abc", "def", "ghi", "beh", "adg", "cfi"]).matches("__h")).to.eql(["beh"])
    expect(WordList(["abc", "def", "ghi", "beh", "adg", "cfi"]).matches("__i")).to.eql(["ghi", "cfi"])
  });
  
  it('should match appropriate terms', function() {
    expect(new WordList(["ccc", "aaa", "bbb"]).matches("a__")).to.eql(["aaa"]);
  });

  it('should match all terms', function() {
    expect(new WordList(["ccc", "aaa", "bbb"]).matches("___")).to.eql(["ccc", "aaa", "bbb"]);
  });

});

describe('solver-test', function() {  
  it('should return the crossword if it is solved', function(done) {
    var cw = getMediumCrossword();
    solve(cw, function(result) {
      done();
    }, function() {});
  });

  it('should solve small crosswords', function(done) {
    var unsolved = getMediumCrossword().getWords()[0].set("___"),
        complete = getMediumCrossword();
    solve(unsolved, function(result) {
      expect(result.toString()).to.eql(complete.toString());
      done();
    }, function(result) { console.log(result.toString())});
  });
  
  /* 
   * it('should fill a tiny word square', function(done) {
   *   var unsolved = makeSquare(4);
   *   solve(unsolved, function(result) {
   *     done();
   *   }, function() {});
   * });*/
 
});
