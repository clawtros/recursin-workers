var jscw = require("./crossword");
var nytwords = require('./nytwords');
var nytwords2 = require('./nyt2');
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

function makeGrid(cells) {
  var across = {}, down = {}, size = parseInt(Math.sqrt(cells.length)),
      rows = [], columns = [];
  

  for (var i = 0; i < size; i++) {
    var row = cells.slice(size * i, size * i + size);
    rows.push(row);
  }

  var r, offset = 0;
  for (var ri = 0, r; r = rows[ri]; ri++) {
    var currentword;
    
    for (var i = 0; i < r.length; i++) {
      if (r[i] === "_") {
        if (currentword === undefined) {
          currentword = { offset: offset, length: 0 } 
        }
        currentword.length = currentword.length + 1;
      }       
      if (currentword !== undefined &&
          (r[i] == "#" || i == (r.length - 1)) &&
          currentword.length > 0) {
            across[currentword.offset] = { length: currentword.length };
            currentword = undefined;
      }

      offset = offset + 1;
    }
  }
  
  for (var i = 0; i < size; i++) {
    var columnIndices = [];
    for (var j = 0; j < size; j++) {
      columnIndices.push(j * size + i);
    }    
    columns.push(columnIndices.map(function(e) { return cells[e] }));
  }
  console.log(columns)
  var c, offset = 0, colnum = 0;
  for (var colnum = 0, c; c = columns[colnum]; colnum++) {
    var currentword, offset = size * colnum;
    for (var i = 0; i < c.length; i++) {
      if (c[i] == "_") {
        if (currentword === undefined) {
          currentword = { offset: colnum + i * size , length: 0 } 
        }
        currentword.length = currentword.length + 1;
      }

      if (currentword !== undefined && (c[i] == "#" || i == (c.length - 1)) && currentword.length > 0) {
        down[currentword.offset] = { length: currentword.length }
        currentword = undefined;
      }
      
    }

  }
  console.log(across, down);
  
  return new jscw.Crossword(cells, across, down, jscw.WordList(shuffle(nytwords2)));
}


function onSuccess(result) {
  self.postMessage({
    type: "complete",
    "grid": result.toString(),
    words: result.getWords().map(function(e) {
      return e.value
    })
  });
}

function onProgress(result, validity) {
  self.postMessage({type:"progress", validity: validity, "grid": result.toString()});
}

self.addEventListener("message", function(message) {
  if (message.data.size) {
    jscw.solve(makeSquare(message.data.size), onSuccess, onProgress);  
  } else if (message.data.cells) {
    jscw.solve(makeGrid(message.data.cells), onSuccess, onProgress);    
  }

});

