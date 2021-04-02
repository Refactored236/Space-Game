// Classes
class GameObject {
  constructor(x, y) {
      this.x = x;
      this.y = y;
      this.dead = false;
      this.type = "";
      this.width = 0;
      this.height = 0;
      this.img = undefined;
  }

  draw(ctx){
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}

class Hero extends GameObject {
  constructor(x, y){
      super(x,y);
      this.type = "Hero";
      this.speed = 0;
  }
}

class Enemy extends GameObject {
  constructor (x,y){
      super(x,y);
      (this.width = 98), (this.height = 50);
      this.type = "Enemy";
      let id = setInterval(() => {
          if (this.y < canvas.height - this.height) {
              this.y += 5;
          }
          else {
              console.log('Stopped at', this.y);
              clearInterval(id);
          }
      }
      ,300)
  }
}

class EventEmitter {
  constructor(){
    this.listeners = {};
  }
  
  on(message, listener) {
    if (!this.listeners[message]){
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }

  emit(message, payload = null) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((l) => l(message, payload));
    }
  }

}

//Constants
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
};

//Variables
let heroImg, 
    enemyImg, 
    laserImg,
    canvas, ctx, 
    gameObjects = [], 
    hero, 
    eventEmitter = new EventEmitter();

//Functions
function loadTexture(path) {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = path
      img.onload = () => {
        resolve(img)
      }
    })
  }
  
  function createEnemies() {
    // TODO draw enemies
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
      for (let y = 0; y < 50 * 5; y += 50) {
        const enemy = new Enemy(x, y);
        enemy.img = enemyImg;
        gameObjects.push(enemy);
      }
    }
  }
  
  function createHero() {
    hero = new Hero(
      canvas.width / 2 - 45,
      canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    hero.height = 50;
    hero.width =50;
    gameObjects.push(hero);
  }

  function initGame() {
    gameObjects = [];
    //createEnemies();
    createHero();

    //Handle published messages on key commands
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
      hero.y -=5 ;
    })
  
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
      hero.y += 5;
    });
  
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
      hero.x -= 5;
    });
  
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
      hero.x += 5;
    });

  }

  function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
  }

//On Window Load (start?)
  window.onload = async () => {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    heroImg = await loadTexture('./assets/player.png');
    enemyImg = await loadTexture('./assets/enemyShip.png');
    laserImg = await loadTexture('./assets/laserRed.png');
    
    //Initialise the game
    initGame();

    let gameLoopId = setInterval(() => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillstyle = 'black'
        ctx.fillRect(0,0,canvas.width, canvas.height);
        drawGameObjects(ctx);
      },100)
  }
  
  let onKeyDown = function(e) {
    console.log(e.keyCode);

    switch (e.keyCode) {
      case 37:
      case 39:
      case 38:
      case 40: // Arrow keys
      case 32:
        e.preventDefault();
        break; // Space
      default:
        break; // do not block other keys
    }
  };

  window.addEventListener("keydown", onKeyDown);

  window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
      eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
      eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
      eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
      eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    }
  });