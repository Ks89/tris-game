const ctrlGame = require('../controllers/game');

module.exports = function (express) {
	let router = express.Router();

  router.post('/game', ctrlGame.newGame);

	router.put('/game', ctrlGame.update);

	module.exports = router;
	return router;
};