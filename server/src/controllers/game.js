var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var Move = mongoose.model('Move');
var Utils = require('../utils/util.js');

const sizeRow = 3;
const sizeCol = 3;

/**
 * @api {post} /api/game Start a new game
 * @apiVersion 1.0.0
 * @apiName PostGame
 * @apiGroup Game
 *
 * @apiDescription Start a new game. You can call this service without parameters.
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Content-Type": "application/json",
 *     }
 *
 * @apiSuccess {Object} An object with the start date and the game id
 *
 * @apiSuccessExample {json} Success-Response: It contains server's move in row=2 and col=1
 *    HTTP/1.1 200 OK
 *    {
 *      "id": "58a36a1de6c5c3179023d464",
 *      "startDate": "2017-02-14T20:35:41.696Z"
 *    }
 *
 * @apiError SavingError 500 Unknown error while saving on db.
 */
module.exports.newGame = function (req, res) {
  // TODO start a new game with sizeRow and sizeCol as params to support different grid sizes
  console.log("new game called");
  let startDate = new Date();
  let game = new Game({
    game: {
      startDate: startDate,
      moves: []
    }
  });
  game.save((err, savedGame) => {
    if (err) {
      Utils.sendJSONres(res, 500, 'Unknown error while starting a new game');
    } else {
      Utils.sendJSONres(res, 200, {id: savedGame._id, startDate: startDate});
    }
  });
};


/**
 * @api {put} /api/game Put a new move
 * @apiVersion 1.0.0
 * @apiName PutMove
 * @apiGroup Game
 *
 * @apiDescription Send a player's move to the server. The response object will contain the server's move and eventually the winning sequence.
 *
 * @apiParam {String} gameId id of the current game (required).
 * @apiParam {Integer} row index (from 0 to rowSize - 1) (required).
 * @apiParam {Integer} col index (from 0 to colSize - 1)  (required).
 * @apiParam {Object} cell object with a string 'value' property inside that represents player's sign ('X' string) (required).
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Content-Type": "application/json",
 *     }
 *
 * @apiSuccess {Object} An object with the endSequence, moveRow, moveCol, winner or simply a message.
 *
 * @apiSuccessExample {json} Success-Response: It contains server's move in row=2 and col=1
 *    HTTP/1.1 200 OK
 *      {
 *        "endSequence": [],
 *        "moveRow": 2,
 *        "moveCol": 1
 *      }
 * @apiSuccessExample {json} Success-Response: if the game ends with player 'X' as winner
 *    HTTP/1.1 200 OK
 *      {
 *          "endSequence":[{"row":0,"col":2},{"row":1,"col":2},{"row":2,"col":2}],
 *          "winner":"X"
 *      }
 * @apiSuccessExample {json} Success-Response: if the winner is the server ('O')
 *    HTTP/1.1 200 OK
 *      {
 *          "endSequence":[{"row":0,"col":0},{"row":1,"col":1},{"row":2,"col":2}],
 *          "moveRow":0,
 *          "moveCol":0,
 *          "winner":"O"
 *      }
 *      }
 * @apiSuccessExample {json} Success-Response: if the game is finished without a winner
 *    HTTP/1.1 200 OK
 *      {
 *          "message":"pareggio"
 *      }
 *
 * @apiError BadInputParams 400 Bad input params.
 * @apiError GameIdNotFound 400 <code>gameId</code> not found on db.
 * @apiError SavingError 500 Unknown error while saving on db.
 */
module.exports.update = function (req, res) {

  console.log(`updated called with id:${req.body.gameId}, row:${req.body.row}, col:${req.body.col}`);
  console.log(req.body.cell);

  let moveCell = req.body.cell;
  let moveRow = parseInt(req.body.row);
  let moveCol = parseInt(req.body.col);
  let gameId = req.body.gameId;

  if (moveRow >= sizeRow || moveCol >= sizeCol) {
    Utils.sendJSONres(res, 400, "Bad input params");
  }

  //init (TODO init with an algorithm based on both sizeCol and sizeRow)
  let game = [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']];

  Game.findOne({_id: gameId}, (err, gameDb) => {
    if (!gameDb || err) {
      Utils.sendJSONres(res, 400, 'Game id not found, please start a new game.');
      return;
    }

    //update grid with moves
    for (let i = 0; i < gameDb.game.moves.length; i++) {
      game[gameDb.game.moves[i].row][gameDb.game.moves[i].col] = gameDb.game.moves[i].sign;
    }

    // update with user's move
    game[moveRow][moveCol] = moveCell.value;

    console.log("------------current grid------------");
    for (let i = 0; i < sizeRow; i++) {
      console.log(game[i] + ",");
    }

    let endSequence = checkForEndOfGame(game, moveCell.value);
    console.log(endSequence);

    if(getFreeCellsCount(game) === 0 && endSequence.length === 0) {
      Utils.sendJSONres(res, 200, {message: "pareggio"});
      return;
    }

    let dataToSend = {
      endSequence: endSequence,
      winner: moveCell.value,
    };

    let serverRow = Math.floor((Math.random() * sizeRow)); // from 0 to sizeRow-1
    let serverCol = Math.floor((Math.random() * sizeCol)); // from 0 to sizeCol-1
    while(game[serverRow][serverCol] !== '-' && endSequence.length === 0) {
      serverRow = Math.floor((Math.random() * sizeRow)); // from 0 to sizeRow-1
      serverCol = Math.floor((Math.random() * sizeCol)); // from 0 to sizeCol-1
    }

    if(endSequence.length === 0) {
      game[serverRow][serverCol] = 'O';
    }

    gameDb.game.moves.push(new Move({
      player: moveCell.value,
      sign: moveCell.value,
      row: moveRow,
      col: moveCol,
      date: new Date()
    }));


    if(endSequence.length === 0) {
      gameDb.game.moves.push(new Move({
        player: 'O',
        sign: 'O',
        row: serverRow,
        col: serverCol,
        date: new Date()
      }));

      endSequence = checkForEndOfGame(game, 'O');
      console.log("endseq server");
      console.log(endSequence);

      if(getFreeCellsCount(game) === 0 && endSequence.length === 0) {
        Utils.sendJSONres(res, 200, {message: "pareggio"});
        return;
      }

      dataToSend = {
        endSequence: endSequence,
        moveRow: serverRow,
        moveCol: serverCol,
        winner: endSequence.length === 0 ? undefined : 'O'
      };
    }

    gameDb.save((err, savedGame) => {
      if (err) {
        Utils.sendJSONres(res, 500, 'Error while saving');
      } else {
        console.log("------------final grid with server move------------");
        for (let i = 0; i < sizeRow; i++) {
          console.log(game[i] + ",");
        }

        Utils.sendJSONres(res, 200, dataToSend);
      }
    });
  });
};


function getFreeCellsCount(grid) {
  let count = 0;
  for (let i = 0; i < sizeRow; i++) {
    for (let j = 0; j < sizeCol; j++) {
      if(grid[i][j] === '-') {
        count++;
      }
    }
  }
  return count;
}


function checkForEndOfGame(grid, playerSign) {
  let rowRes = rowMatch(grid, playerSign);
  let colRes = colMatch(grid, playerSign);
  let diag1Res = diag1Match(grid, playerSign);
  let diag2Res = diag2Match(grid, playerSign);

  if(rowRes.length > 0) {
    return rowRes;
  }
  if(colRes.length > 0) {
    return colRes;
  }
  if(diag1Res.length > 0) {
    return diag1Res;
  }
  if(diag2Res.length > 0) {
    return diag2Res;
  }
  return [];
}

function rowMatch(grid, playerSign) {
  let winningSequence = [];
  for (let i = 0; i < sizeRow; i++) {
    for (let j = 0; j < sizeCol; j++) {
      if(grid[i][j] === playerSign) {
        winningSequence.push({row: i, col: j});
      }
    }

    if(winningSequence.length === sizeCol) {
      return winningSequence;
    } else {
      winningSequence = [];
    }
  }
  return winningSequence;
}

function colMatch(grid, playerSign) {
  let winningSequence = [];
  for (let j = 0; j < sizeCol; j++) {
    for (let i = 0; i < sizeRow; i++) {
      if(grid[i][j] === playerSign) {
        winningSequence.push({row: i, col: j});
      }
    }

    if(winningSequence.length === sizeRow) {
      return winningSequence;
    } else {
      winningSequence = [];
    }
  }
  return winningSequence;
}

function diag1Match(grid, playerSign) {
  let winningSequence = [];
  for (let i = 0; i < sizeRow; i++) {
    if(grid[i][i] === playerSign) {
      winningSequence.push({row: i, col: i});
    }
  }

  if(winningSequence.length !== sizeRow) {
    winningSequence = [];
  }
  return winningSequence;
}

function diag2Match(grid, playerSign) {
  let winningSequence = [];
  for (let i = 0; i < sizeRow; i++) {
    if(grid[i][sizeCol - 1 - i] === playerSign) {
      winningSequence.push({row: i, col: sizeCol - 1 - i});
    }
  }

  if(winningSequence.length !== sizeRow) {
    winningSequence = [];
  }
  return winningSequence;
}