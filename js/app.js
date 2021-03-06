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

  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width
    }
  }
}

class Hero extends GameObject {
  constructor(x, y){
      super(x,y);
      (this.width = 99), (this.height = 75);
      this.type = "Hero";
      this.speed = { x: 0, y: 0 };
      this.cooldown = 0;
      this.livesRemaining = 3;
  }
  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 400;
 
    let id = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown -= 100;
      } else {
        clearInterval(id);
      }
    }, 200);
  }
  canFire() {
    return this.cooldown === 0;
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
      ,500)
  }
}

class LaserExplosion extends GameObject {
  constructor(x,y) {
    super(x,y);
    (this.width = 98), (this.height = 70);
    this.type = 'LaserExplosion';
    this.img = laserExplosionImg;
  }
}

class Laser extends GameObject {
  constructor(x, y) {
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = laserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100)
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

  clear() {
    this.listeners = {};
  }

}

//Constants
const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP",
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
  KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
  GAME_END_WIN: "GAME_END_WIN",
  GAME_END_LOSS: "GAME_END_LOSS",
};

//Variables
let heroImg, 
    enemyImg, 
    laserImg,
    laserExplosionImg,
    lifeImg,
    canvas, 
    ctx, 
    gameObjects = [], 
    hero, 
    eventEmitter = new EventEmitter(),
    score = 0,
    gameLoopId;

//Functions
//using a promise, load the relevant image into the game
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
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
      for (let y = 0; y < 40 * 5; y += 50) {
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
    gameObjects.push(hero);
  }

  //look at both enemy and laser objects and based on collision remove them from the game "dead"
  function updateGameObjects() {
    const enemies = gameObjects.filter(go => go.type === 'Enemy');
    const lasers = gameObjects.filter((go) => go.type === "Laser");
  // laser hit something
    lasers.forEach((l) => {
      enemies.forEach((m) => {
        if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
        eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
          first: l,
          second: m,
        });
      }
     });
  }); 

  //Enemy contact
  enemies.forEach(enemy => {
    let heroRect =  hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())){
        eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, {enemy});
        heroRect = 0;
    }
  })
   
    gameObjects = gameObjects.filter(go => !go.dead);
    //mark explosions as dead
     gameObjects.forEach((go) => {
       if(go.type === 'LaserExplosion'){
         go.dead = true;
       }
     })
  }

  //function to add score details to the screen at bottom right
  function printScore(message) {
    ctx.font = '40px Arial';
    ctx.strokeStyle = `rgb(210,39,48)`;
    ctx.textAlign = 'left';
    ctx.strokeText(message, 10, canvas.height - 50);
  }

  function drawLife() {
    //start drawing life image in 180 from side
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.livesRemaining; i++){
      ctx.drawImage(
        lifeImg, 
        //For each image shift position
        START_POS + (45 * (i+1)),
        canvas.height - 80
        );
    }
  }

  function displayMessage(message, color = 'rgb(210,39,48)'){
    ctx.font = '40px Arial';
    ctx.strokeStyle = color;
    ctx.textAlign = 'center';
    //console.log(message);
    ctx.strokeText(message, canvas.width / 2, canvas.height / 2);
  }

  function decrementLife() {
    hero.livesRemaining--;
    if (hero.livesRemaining === 0) {
      //Game over
      hero.dead = true;
    }
  }

  //End condition Checks
  function isHeroDead() {
    return hero.livesRemaining <= 0;
  }

  function allEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
  }

  //Intial the full game state, creating hero/enemies and registering events to em it
  function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();
    score = 0;
    //Handle published messages on key commands
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
      hero.y -=15 ;
    })
  
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
      hero.y += 15;
    });
  
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
      hero.x -= 15;
    });
  
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
      hero.x += 15;
    });

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
      if (hero.canFire()) {
        hero.fire();
      }
    });

    //Handle Laser/Enemy Collision
    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
      first.dead = true;
      second.dead = true;
      //explode the ship
      gameObjects.push(new LaserExplosion(second.x , second.y))
      //increment score
      score += 100; 

      if (allEnemiesDead()) {
        eventEmitter.emit(Messages.GAME_END_WIN);
      }
    });
    
    //Handle Enemy/Hero Collision
    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, {enemy}) => {
      console.log(enemy);
      //destroys the enemy
      enemy.dead = true;
      //lose a life
      decrementLife();

      if (isHeroDead())  {
        eventEmitter.emit(Messages.GAME_END_LOSS);
        return; // loss before victory
        //Check if that was the end of the enemies
      } else if (allEnemiesDead()) {
        eventEmitter.emit(Messages.GAME_END_WIN);
      }
    }
    );

    eventEmitter.on(Messages.GAME_END_WIN, () => {
      endGame(true);
    });
    
    eventEmitter.on(Messages.GAME_END_LOSS, () => {
      endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
      resetGame();
    })

  }

  //handle end state of game
  function endGame(success){
    clearInterval(gameLoopId);

    //delay slightly to handle and draws in progress
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (success) {
          displayMessage(
            "Victory!!! - Press [Enter] to start a new game",
            "green"
          );
        } else {
          displayMessage(
            "You died !!! Press [Enter] to start a new game");
        }
      },200)
  }

  //handle reset of the game
  function resetGame() {
    if(gameLoopId){
      clearInterval(gameLoopId);
      eventEmitter.clear();
      initGame();
      gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        printScore('Score: ' + score);
        updateGameObjects();
        drawLife();
        drawGameObjects(ctx);
      }, 100);
    }
  }

  //Draw each game object on the canvas
  //Calling the GameObject draw function
  function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
  }

  //Function takes two rectangles and returns true/false, based on any intersection
  function intersectRect(r1, r2) {
    return !(r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top);
  }

//On Window Load (start)
  window.onload = async () => {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    //Load core assets
    heroImg = await loadTexture('./assets/player.png');
    enemyImg = await loadTexture('./assets/enemyShip.png');
    laserImg = await loadTexture('./assets/laserRed.png');
    laserExplosionImg = await loadTexture('./assets/laserRedShot.png');
    lifeImg = await loadTexture('./assets/life.png');
    
    //Initialise the game
    initGame();
    gameLoopId = setInterval(() => {
         
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,canvas.width, canvas.height);
        printScore('Score: ' + score);
        updateGameObjects();
        drawLife();
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

  //Keyup listners to all controls
  //ToDo: Refactor to handle "held" direction key
  //On ToDo: Currently altered to keydown to handle consistent move
  window.addEventListener("keydown", (evt) => {
    if (evt.key === "ArrowUp") {
      eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
      eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
      eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
      eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    } else if(evt.key === " ") { //Space bar 
     eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    }
    else if(evt.key === "Enter") {
      eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    }
  });