var mongoose = require( 'mongoose' );

var moveSchema = new mongoose.Schema({
  player: String,
  sign: String,
  row: Number,
  col: Number,
  date: Date
});

var gameSchema = new mongoose.Schema({
  game: {
    startDate: Date,
    moves: [moveSchema]
  }
});

mongoose.model('Game', gameSchema);
mongoose.model('Move', moveSchema);