$(function() {
  Math.seedrandom('Samurai Crush.');

  var config = {
    boardSizeX: 8,
    boardSizeY: 8,
    cellSize: 64,
    points: {
      three: 60,
      four: 120,
      five: 200
    }
  };

  $('.game').each(function(index, game) {
    new Game($(game), config, [
      {
        color: '#FF5757',
        imageUrl: 'http://www.gravatar.com/avatar/a15edb68faa1c7acc37f4541d1e955a8'
      },
      {
        color: '#579DFF',
        imageUrl: 'http://www.gravatar.com/avatar/4831484cf40a9a84efff2694122b5f47'
      },
      {
        color: '#FFFC57',
        imageUrl: 'http://www.gravatar.com/avatar/b8657f369f4495288b1911aa0c4ccafc'
      },
      {
        color: '#7BFF57',
        imageUrl: 'http://www.gravatar.com/avatar/10db85939a774eb26d42cb6fed045bb5'
      },
      {
        color: '#C157FF',
        imageUrl: 'http://www.gravatar.com/avatar/6b98d78b75437b0c74bd98dfad356692'
      }
    ]);
  });
});










