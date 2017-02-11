'user strict';
(function() {

  angular
    .module('mySiteApp')
    .service('game', game);

  game.$inject = ['$http', '$log'];
  function game ($http, $log) {

    var sendMove = function(data) {
      $log.log("Service called with data:");
      $log.log(data);

      return $http.put('/api/game', data);
    };

    var startGame = function() {
      $log.log("Service called");

      return $http.post('/api/game');
    };

    return {
      sendMove: sendMove,
      startGame: startGame
    };
  }

})();