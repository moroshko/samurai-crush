function Game($game, config, players) {
  var score = 0;
  var board;
  var canvas = $game.find('canvas')[0];
  var $swapButton = $game.find('button');
  var context = canvas.getContext('2d');
  var selectedCells;

  canvas.width = config.boardSizeX * config.cellSize;
  canvas.height = config.boardSizeY * config.cellSize;

  function loadPlayerImages(callback) {
    var imagesLoadedCount = 0;

    players.forEach(function(player) {
      player.image = new Image();

      player.image.addEventListener('load', function() {
        imagesLoadedCount += 1;

        if (imagesLoadedCount == players.length) {
          callback();
        }
      });

      player.image.src = player.imageUrl;
    });
  }

  function getRandomPlayerId(excludePlayerIds) {
    var playerIds = [];

    for (var i = 0; i < players.length; i++) {
      if (excludePlayerIds.indexOf(i) == -1) {
        playerIds.push(i);
      }
    }

    var randomIndex = Math.floor(playerIds.length * Math.random());

    return playerIds[randomIndex];
  }

  function initBoard() {
    board = [];

    for (var y = 0; y < config.boardSizeY; y++) {
      var row = [];

      for (var x = 0; x < config.boardSizeX; x++) {
        var excludePlayerIds = [];

        if ((y > 1) && (board[y - 1][x].playerId == board[y - 2][x].playerId)) {
          excludePlayerIds.push(board[y - 1][x].playerId);
        }

        if ((x > 1) && (row[x - 1].playerId == row[x - 2].playerId)) {
          excludePlayerIds.push(row[x - 1].playerId);
        }

        if (excludePlayerIds.length == players.length) {
          throw "Failed to initialise the board";
        }

        var playerId = getRandomPlayerId(excludePlayerIds);

        row.push({
          playerId: playerId,
          offsetX: 0,
          offsetY: 0
        });
      }

      board.push(row);
    }
  }

  function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (var y = 0; y < config.boardSizeY; y++) {
      for (var x = 0; x < config.boardSizeX; x++) {
        var cell = board[y][x];

        if (cell.playerId !== undefined) {
          var cellX = config.cellSize * x + cell.offsetX;
          var cellY = config.cellSize * (config.boardSizeY - y - 1) - cell.offsetY;
          
          drawCell(players[cell.playerId], cellX, cellY, cell.opacity || 1);
        }
      }
    }

    selectedCells.forEach(function(selectedCell) {
      context.globalAlpha = 1;
      context.strokeStyle = "#000000";
      context.lineWidth = 3;
      context.strokeRect(
        config.cellSize * selectedCell.x, 
        config.cellSize * (config.boardSizeY - selectedCell.y - 1),
        config.cellSize, 
        config.cellSize
      );
    });
  }

  function drawCell(player, x, y, opacity) {
    context.globalAlpha = opacity;
    context.fillStyle = player.color;
    context.fillRect(x, y, config.cellSize, config.cellSize);
    context.globalAlpha = 0.3 * opacity;
    context.drawImage(player.image, x, y, config.cellSize, config.cellSize);
  }

  // Swaps (x, y) with (x + 1, y)
  function swapX(x, y, callback) {
    var animationId;
    var cell1 = board[y][x];
    var cell2 = board[y][x + 1];
    var offset = 0;

    setSelectedCells([]);
    
    function repeatOften() {
      drawBoard();
      
      offset += 2;
      cell1.offsetX = offset;
      cell2.offsetX = -offset;
      
      if (offset > config.cellSize) {
        var cell1PlayerId = cell1.playerId;

        cell1.playerId = cell2.playerId;
        cell1.offsetX = 0;

        cell2.playerId = cell1PlayerId;
        cell2.offsetX = 0;

        cancelAnimationFrame(animationId);

        if (callback) {
          callback();
        }
      } else {
        animationId = requestAnimationFrame(repeatOften);
      }
    }

    animationId = requestAnimationFrame(repeatOften);
  }

  // Swaps (x, y) with (x, y + 1)
  function swapY(x, y, callback) {
    var animationId;
    var cell1 = board[y][x];
    var cell2 = board[y + 1][x];
    var offset = 0;

    setSelectedCells([]);
    
    function repeatOften() {
      drawBoard();
      
      offset += 2;
      cell1.offsetY = offset;
      cell2.offsetY = -offset;
      
      if (offset > config.cellSize) {
        var cell1PlayerId = cell1.playerId;

        cell1.playerId = cell2.playerId;
        cell1.offsetY = 0;

        cell2.playerId = cell1PlayerId;
        cell2.offsetY = 0;

        cancelAnimationFrame(animationId);

        if (callback) {
          callback();
        }
      } else {
        animationId = requestAnimationFrame(repeatOften);
      }
    }

    animationId = requestAnimationFrame(repeatOften);
  }

  function setSelectedCells(selectedCellsArray) {
    selectedCells = selectedCellsArray;
    $swapButton.toggle(selectedCells.length == 2);
  }

  function inBoard(x, y) {
    return (x >= 0) && (x < config.boardSizeX) && 
           (y >= 0) && (y < config.boardSizeY);
  }

  function findCrushes(cells) {
    var cellsToClear = [];
    var pointsEarned = 0;

    cells.forEach(function(cell) {
      var playerId = board[cell.y][cell.x].playerId;
      var minX = maxX = cell.x;
      var minY = maxY = cell.y;
      var points = 0;

      function samePlayer(x, y) {
        return inBoard(x, y) && (board[y][x].playerId == playerId);
      }

      // Horizontal crush
      if (samePlayer(cell.x - 1, cell.y)) {
        minX -= 1;

        if (samePlayer(cell.x - 2, cell.y)) {
          minX -= 1;
        }
      }

      if (samePlayer(cell.x + 1, cell.y)) {
        maxX += 1;

        if (samePlayer(cell.x + 2, cell.y)) {
          maxX += 1;
        }
      }

      // Vertical crush
      if (samePlayer(cell.x, cell.y - 1)) {
        minY -= 1;

        if (samePlayer(cell.x, cell.y - 2)) {
          minY -= 1;
        }
      }

      if (samePlayer(cell.x, cell.y + 1)) {
        maxY += 1;

        if (samePlayer(cell.x, cell.y + 2)) {
          maxY += 1;
        }
      }

      // Calculate the score
      var horizontal = maxX - minX + 1;
      var vertical = maxY - minY + 1;

      function is(a, b) {
        return ((horizontal == a) && (vertical == b)) ||
               ((horizontal == b) && (vertical == a));
      }

      if (is(3, 1) || is(3, 2)) {
        points += config.points.three;
      } else if (is(4, 1) || is(4, 2)) {
        points += config.points.four;
      } else if (is(5, 1) || is(5, 2) || is(5, 3) || is(3, 3) || is(3, 4)) {
        points += config.points.five;
      }

      // Calculate cells to clear
      if (points > 0) {
        pointsEarned += points;

        if (horizontal >= 3) {
          for (var x = minX; x <= maxX; x++) {
            cellsToClear.push({ x: x, y: cell.y });
          }
        }

        if (vertical >= 3) {
          for (var y = minY; y <= maxY; y++) {
            // Don't add twice the cell itself
            if ((horizontal >= 3) && (y == cell.y)) {
              continue;
            }

            cellsToClear.push({ x: cell.x, y: y });
          }
        }
      }
    });

    if (pointsEarned > 0) {
      crush(cellsToClear, pointsEarned);
    } else {
      selectedCells = cells;
      swap(false);
    }
  }

  function crush(cells, pointsEarned, callback) {
    var animationId;
    var opacity = 1;
    
    function repeatOften() {
      drawBoard();
      
      opacity -= 1/30;
      
      cells.forEach(function(cell) {
        board[cell.y][cell.x].opacity = opacity;
      });
      
      if (opacity < 0) {
        cells.forEach(function(cell) {
          board[cell.y][cell.x].playerId = undefined;
          board[cell.y][cell.x].opacity = 1;
        });

        cancelAnimationFrame(animationId);

        if (callback) {
          callback();
        }
      } else {
        animationId = requestAnimationFrame(repeatOften);
      }
    }

    animationId = requestAnimationFrame(repeatOften);
  }

  function swap(findCrushesAfterSwap) {
    if (findCrushesAfterSwap === undefined) {
      findCrushesAfterSwap = true;
    }

    var callback;

    if (selectedCells[0].y == selectedCells[1].y) {
      // Horizontal swap
      var x = Math.min(selectedCells[0].x, selectedCells[1].x);
      var y = selectedCells[0].y;

      if (findCrushesAfterSwap) {
        callback = function() {
          findCrushes([
            { x: x, y: y }, 
            { x: x + 1, y: y }
          ]);
        };
      }

      swapX(x, y, callback);
    } else {
      // Vertical swap
      var x = selectedCells[0].x; 
      var y = Math.min(selectedCells[0].y, selectedCells[1].y);

      if (findCrushesAfterSwap) {
        callback = function() {
          findCrushes([
            { x: x, y: y }, 
            { x: x, y: y + 1 }
          ]);
        };
      }

      swapY(x, y, callback);
    }
  }

  $(canvas).click(function(event) {
    var mouseX = event.pageX - canvas.offsetLeft;
    var mouseY = event.pageY - canvas.offsetTop;
    var x = Math.floor(mouseX / config.cellSize);
    var y = config.boardSizeY - Math.floor(mouseY / config.cellSize) - 1;
    
    if (selectedCells.length == 1) {
      var selectedX = selectedCells[0].x;
      var selectedY = selectedCells[0].y;

      if ((x == selectedX) && (y == selectedY)) {
        setSelectedCells([]);
      } else if (((x == selectedX) && (Math.abs(y - selectedY) == 1)) || 
                 ((y == selectedY) && (Math.abs(x - selectedX) == 1))) {
        setSelectedCells([selectedCells[0], { x: x, y: y }]);
      } else {
        setSelectedCells([{ x: x, y: y }]);
      }
    } else {
      setSelectedCells([{ x: x, y: y }]);
    }

    drawBoard();
  });

  $swapButton.click(swap);

  loadPlayerImages(function() {
    initBoard();
    setSelectedCells([]);
    drawBoard();
    $game.show();
  });
}
