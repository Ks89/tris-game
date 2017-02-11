'user strict';
(function () {
  angular
    .module('mySiteApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['game', '$log'];
  function homeCtrl(game, $log) {
    var vm = this;

    vm.pageHeader = {
      title: 'Welcome to Tris',
      strapline: '1.0.0'
    };

    vm.gameId = null;

    vm.board = initBoard();

    vm.reset = function () {
      $log.log("reset called");

      for (var i = 0; i < vm.board.length; i++) {
        for (var j = 0; j < vm.board[i].length; j++) {
          vm.board[i][j].value = '-';
          vm.board[i][j].state = false;
          vm.board[i][j].color = 'white';
        }
      }

      vm.currentPlayer = 'X';
      vm.winner = false;

      game.startGame()
        .then(function (result) {
          $log.log(result);
          vm.gameId = result.data.id;
        }, function(result) {
          $log.error("start game error");
          $log.error(result);
        });
    };

    vm.reset();

    function addMove(playerSign, row, col) {
      $log.log("addmove called with:");
      $log.log("row" + row + ", col" + col);
      $log.log(vm.board);
      var cell = vm.board[row][col];

      $log.log(cell);

      if (cell.state) {
        return;
      }

      if (!vm.winner) {
        cell.value = playerSign;
        cell.state = true;
        cell.color = 'black';
      }
    }


    vm.move = function (cell, row, col) {
      if(cell.state) {
        return;
      }

      addMove('X', row, col);

      var cellData = {
        gameId: vm.gameId,
        cell: { value: "X" },
        row: row,
        col: col
      };

      game.sendMove(cellData)
        .then(function (result) {
          $log.log(result);
          var endSeq = result.data.endSequence;

          if(result.data.moveRow !== undefined && result.data.moveCol !== undefined) {
            addMove('O', result.data.moveRow, result.data.moveCol);
          }

          if(endSeq && endSeq.length > 0) {
            $log.log("winner is: " + result.data.winner);
            vm.winner = true;
            vm.currentPlayer = result.data.winner === 'O' ? 'Server' : 'Umano';

            for(var indx=0; indx<endSeq.length; indx++) {
              vm.board[endSeq[indx].row][endSeq[indx].col].color = 'win';
            }

            // sets state=true to every cells
            for (var i = 0; i < vm.board.length; i++) {
              for (var j = 0; j < vm.board[i].length; j++) {
                vm.board[i][j].state = true;
              }
            }
          }

          if(req.body.message) {
            // TODO display "pareggio"
          }

        }, function(result) {
          $log.error("move error");
          $log.error(result);
        });
    };

    function initBoard() {
      return [
        [{value: '-', state: false, color: 'white'}, {value: '-', state: false, color: 'white'}, {value: '-', state: false, color: 'white'}],
        [{value: '-', state: false, color: 'white'}, {value: '-', state: false, color: 'white'}, {value: '-', state: false, color: 'white'}],
        [{value: '-', state: false, color: 'white'}, {value: '-', state: false, color: 'white'}, {value: '-', state: false, color: 'white'}]
      ];
    }
  }
})();