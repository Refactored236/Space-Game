function loadTexture(path) {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = path
      img.onload = () => {
        resolve(img)
      }
    })
  }
  
  function createEnemies(ctx, canvas, enemyTexture) {
    // TODO draw enemies
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
          ctx.drawImage(enemyTexture, x, y);
        }
      }
  }
  
  window.onload = async () => {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    // TODO load textures
    playerTexture = await loadTexture('./assets/player.png');
    enemyTexture = await loadTexture('./assets/enemyShip.png');
    // TODO draw black background
    ctx.fillstyle = 'black'
    ctx.fillRect(0,0,canvas.width, canvas.height)
    // TODO draw hero
    ctx.drawImage(playerTexture,canvas.width / 2 - 45,canvas.height - canvas.height / 4)

    // TODO uncomment the next line when you add enemies to screen
    createEnemies(ctx, canvas, enemyTexture);
  }
  