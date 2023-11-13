/*
credits:
music from pixabay & sound effects from freesound.org
*/

//game variables
let gameover = false;
let message;
// obstacles variable
let horizontals = [];
//food variables
foods = [];
foodbool = false;
foodval = 7; //how much mass it gains when eats
charactersizeloss = 0.04; //how much mass it decreases
//powerup variables
let powerupmsg;
powerupdistance = 3.4; //square how far or often powerup comes
powerups = [];
let poweruptimer = 0;
let powerup = false; // main variable to active powerup
let invisible = false;
let slowness = false;
let slownessval = 0.4; //factor of how slow in powerup
let health = false;
let powerupduration = 10000; //10 seconds
let main_blink;
//main character variable
let character;
let fall = false;
let gravity_amount = 0.2;
let isPressed = false;
let firstpress = false;
//leaderboard/highscore variables
let highscoretime = 0;
let highscorestring;
let starttime;
let elapsedtime = 0;
let scorestring;
let scorepause = true;
let timerStarted = false;
//game over/play again text
let gameovertext = false;
let blinking = true;
let gameoverduration = 2500; //gameover text time
let show_playagain = false;
let playagain_size = 1;
let gameoversoundplaying = false;
//game restart
let restart = true;
//background
let stars= [];
let count = 0;


/*--------------
PRELOAD
--------------*/

function preload(){
  //font
  gameoverFont = loadFont('game_over.ttf');
  titleFont = loadFont('starzone.ttf');
  //images
  astronaut = loadImage('astronaut.png');
  astronautfall = loadImage('astronautfall.png');
  asteroid = loadImage('asteroid.png');
  oxygen = loadImage('oxygen.png');
  star = loadImage('mariostar.png')
  //music
  gameplaymusic = loadSound('space-background.mp3')
  menumusic = loadSound('menu.mp3');
  //sound effects
  breath = loadSound('breathsound.wav');
  gameoversound = loadSound('gameover.wav');
  powerupsound = loadSound('powerupsound.wav');
  collisionsound = loadSound('impactsound.mp3');
  inflate = loadSound('wingflap.wav'); //sound for going up
}

/*--------------
SETUP AND LOOP
--------------*/

function setup() {
  createCanvas(windowWidth,windowHeight);
  // main character
  character = new main();
  //timer
  starttime = millis();
  //sound
  gameplaymusic.setVolume(0.1);
  // menumusic.setVolume(0.5);
  // menumusic.play()
  // gameplaymusic.play();
  gameplaymusic.loop();
  breath.setVolume(0.15);
  gameoversound.setVolume(0.3);
  powerupsound.setVolume(0.06);
  collisionsound.setVolume(0.2);
  inflate.setVolume(0.4);
  
  //stars background
  for(let i = 40; i<width;i+=50){
    for(let j = 40; j<height;j+=50){
      stars[count] = new Star(i, j)
      count++;
    }
  }
}

function draw() {
    
    background(10);
    for(let i = 0; i<count; i++){
      stars[i].move();
      stars[i].render();
  }
  //GAME PLAY
  gamePlay()
  
  //timer code
  if (firstpress == true){
    scorepause = false;
  }
  if (gameover == true){
    scorepause = true;
  }
  if (scorepause == false && timerStarted == false){
    starttime = millis();
    timerStarted = true;
  }
  if (firstpress){
    timerscore()
  }

  //GAME OVER
  if (gameover == true){
    gameovertext = true
    //gameover sound
    if (!gameoversoundplaying && !gameoversound.isPlaying()) {
    gameoversound.play();
    gameoversoundplaying = true;
    }
    //stop background sound
    gameplaymusic.stop();
    //function
    gameOver();
  }
}

/*--------------
OBJECT CLASSES
--------------*/

// main character
class main {
  constructor() {
    this.pos = createVector(width/4, height+100);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = 10;
    this.size = this.mass * 5;

    //blinking and timer for powerup
    this.blinking = false;
    this.powerupduration = powerupduration;
    this.previoustime = millis();
  }
  applyForce(force) {
    force.div(this.mass);
    this.acc.add(force);
  }
  update() {
    //physics stuff to jump
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    //if no powerup, do this
    if (health == false){
      //SIZE DECREASE, if 0 then game over
    this.size -= charactersizeloss
    if (this.size <= 0){
      gameover = true;
      message = "Died of hunger!"
    }
  }
    //blinking for end of powerup timer
    if (powerup == true){
      let currenttime = millis();
      let timeelapsed = currenttime - this.previoustime;
      
      if (timeelapsed >= this.powerupduration - 3000 && timeelapsed <= this.powerupduration){
        this.blinking = true;
      } else {
        this.blinking = false;
      }
      
      //if powerup time is up, reset and set blinking to false
      if (timeelapsed > this.powerupduration || powerup == false){
        this.blinking = false;
        this.previoustime = 0;
      }
  }
}
  menu(){ //MENU ONLY...CHARACTER GOING UP
    if (firstpress == false){
      this.yspeed = -3
      this.pos.y += this.yspeed
      //check boundary
      if (this.pos.y < -200){
        this.pos.y = width+200
      }
    }
  }
  
  boundaries() {
    //if falls, game over
    if (firstpress == true){
      if (this.pos.y > height + this.size*2) {
      gameover = true;
      message = "Fell out the map!"
      this.vel.y = 0;
      //cannot go higher than ceiling
    } else if (this.pos.y < this.size/2) {
      this.pos.y = this.size/2;
      this.vel.y = 0;
    }
    }
  }
  
  jump() {
    let accY = -1;
    let newAcc = createVector(0, accY);
    this.acc.add(newAcc);
  }

  collideCheck(obstacle) {
    let distance = dist(this.pos.x, this.pos.y, obstacle.x, obstacle.y);
    return distance < this.size/2 + obstacle.diam/2;
  }
  
  display() {
    if (this.blinking == true && powerup) {
      // set fill to blink
      main_blink = true;
    } else {
      // set fill to white
      main_blink = false;
    }
    imageMode(CENTER);
    if (!fall){
      image(astronaut,this.pos.x, this.pos.y-20, this.size*2,this.size*2);
    } else if (fall){
      image(astronautfall,this.pos.x, this.pos.y, this.size*1.7,this.size*1.7);
    }
  }
}

//horizontal obstacles
class horizontalObject {
  constructor(){
    this.diam = 50;
    this.x = windowWidth+this.diam;
    this.y = random(0+this.diam,height-this.diam);
    this.xspeed = random(-3,-14);
  }
  update(){
    //if powerup true, else regular speed
    if (slowness == true){
      this.x += (this.xspeed*slownessval);
    }
    if (slowness == false){
      this.x += this.xspeed
    }
    //reset location
    if (this.x <= 0-this.diam){
      this.x = windowWidth+this.diam
      this.y = random(0+this.diam,height-this.diam);
  }
}
  display(){
    noStroke();
    imageMode(CENTER);
    image(asteroid,this.x,this.y,this.diam*2,this.diam*2);
  }
}

//food/"OXYGEN TANK"
class food {
  constructor(){
    this.diam = 10
    this.x = windowWidth+this.diam;
    this.y = random(0,height);
    this.xspeed = random(3,10); 
  }
  update(){
    //if powerup true, else regular speed
    if (slowness == true){
      this.x -= (this.xspeed*slownessval);
    }
    if (slowness == false){
      this.x -= this.xspeed
    }
    //reset location
    if (this.x <= 0-(this.diam)){
      this.x = windowWidth+this.diam;
      this.y = random(0,height);
    }
  }
  display(){
    imageMode(CENTER);
    image(oxygen,this.x,this.y,this.diam*4,this.diam*4);
  }
}

//powerups
class powerupObject {
  constructor(){
    this.diam = 20
    this.x = windowWidth+(this.diam**powerupdistance);
    this.y = random(0,height);
    this.xspeed = 10; 
  }
  update(){
    this.x-= this.xspeed
    
    //reset location
    if (this.x <= 0-(this.diam**powerupdistance)){
      this.x = windowWidth+(this.diam);
      this.y = random(0,height);
    }
  }
  display(){
    fill(0,0,255);
    noStroke();
    imageMode(CENTER);
    image(star,this.x,this.y,this.diam*2,this.diam*2);
  }
}
  
//background stars
class Star{
  constructor(_x,_y){
    this.x = _x;
    this.y = _y - random(-5, 5);
    this.offset = random(.001,0.01);
    this.inc = random(.001,0.01);
    this.scale = random(1, 5);
    this.alpha = random(0,200);
  }
  render(){
    fill(255, this.alpha);
    noStroke();
    ellipse(this.x, this.y, this.scale);
  }
  move(){
    this.offset+=this.inc;
    let dist = noise(this.offset)*this.scale;
    this.x-=dist;
    if(this.x<0) this.x=width+5;
  }
}

/*--------------
KEY PRESSED FUNCTIONS
--------------*/
function keyPressed() {
  if (keyCode === 32) {
    isPressed = true;
    fall = false;
    if (!inflate.isPlaying()) {
    inflate.play();
} 
}
}
function keyReleased() {
  if (keyCode === 32) {
    isPressed = false;
    fall = true;
}
}
function mousePressed(){
  if (restart != true){
    isPressed = true;
}
}
function mouseReleased() {
  if (restart != true){
    isPressed = false;
  }
}

/*---------------
DIFFERENT WINDOW FUNCTIONS
--------------*/

function gamePlay(){
  
  //MENU TEXT
  if (firstpress == false && restart == true){
    fill(255);
    textFont(gameoverFont);
    textSize(50);
    // textAlign(CENTER, BOTTOM)
    // text("hold the space bar to move",width/2,height/3)
    textAlign(CENTER,BASELINE)
    text("hold space bar to drift. collect oxygen tanks and avoid asteroids to survive. collect powerups for a boost!",width/2,height/2)
    textAlign(CENTER,BOTTOM);
    fill(255,50)
    // text("coded by marcus rouquet",width/2,height-height/30)
    // textAlign(CENTER,BOTTOM)
    // text("beat your score, don't die",width/2,height-height/3)
    textSize(windowHeight/6);
    fill(255,map(sin(frameCount * 0.08), -1, 1, 50, 150));
    textFont(titleFont);
    textAlign(CENTER,TOP);
    text("COSMICOLLIDE",width/2,height/4.5);
  }
  
  // MAIN CHARACTER UPDATE
  if (isPressed && gameover == false) {
    character.jump();
  }
    character.boundaries();
    //start obstacles once mouse pressed
  if (isPressed == true){
    firstpress = true;
  }
  
  //MENU TO GAMEPLAY
  if (firstpress == true){
    //main character gravity
  let gravity = createVector(0, pow(character.mass * gravity_amount, 2));
  character.applyForce(gravity);
  character.update();
    
    //horizontal obstacle 
  for (let o = 0; o < 6; o++){
    horizontal = horizontals.push(new horizontalObject());
    horizontals[o].update()
    horizontals[o].display()
  
    // check for collision with main character
    if (character.collideCheck(horizontals[o])) {
      if (invisible == false){ // make sure powerup not activated
        collisionsound.play();
        gameover = true;
        message = "You collided with an obstacle!"
      }
    }
  }
    
    //new foods
    for (let f = 0; f < 3; f++){
      foodObject = foods.push(new food());
      
    //check for food collision
      if(character.collideCheck(foods[f])){
        //remove food from array
        foods.splice(f, 1);
        breath.play();
        //increase size of character only if powerup off
        if (health == false){
          character.size += foodval;
        }
  }

  // update and display food
    foods[f].update();
    foods[f].display();
  
}
    
    //POWERUPS
    
    if (powerup == true && gameover == false){
      //powerup msg
      if (main_blink){
        fill(255, map(sin(frameCount * 0.08), -1, 1, 50, 200))
      }else{
        fill(255);
      }
      textSize(70);
      textAlign(CENTER,BASELINE);
      textFont(gameoverFont);
      text(powerupmsg + " powerup",width/2,height/2);
    }
    
    
  for (let p = 0; p < 1; p++){
    power = powerups.push(new powerupObject());
    powerups[p].update()
    powerups[p].display()
  
    //check for powerup collision
      if(character.collideCheck(powerups[p])){
        //remove powerup from array
        powerups.splice(p, 1);
        //sound
        powerupsound.play();
        //timer
        character.previoustime = millis();
        //powerup activated if collided
        powerup = true;
        poweruptimer = powerupduration; //10000 = 10 seconds
        if (powerup == true){
          choosePowerup(); //call function
        }
  }
    //powerup only runs for 10 seconds once activated
    if (powerup == true){
      poweruptimer -= deltaTime
      if (poweruptimer <= 0){
        poweruptimer = 0;
        powerup = false;
        poweruppicker = 0; //RESET RANDOM PICKER
        
        //reset powerups
        invisible = false;
        slowness = false;
        health = false;
      }
    }
}   
}
    character.menu();
    character.display();
}

function gameOver(){
  // glowing game over text for few seconds
  if (blinking == true){
    setTimeout(function() {
    show_playagain = true;
    blinking = false;
}, gameoverduration);
  }
  if (blinking == true){
    fill(255,128 + sin(frameCount * 0.1) * 255);
  } else {
    noFill()
  }
  
  //gameover text
  textFont(gameoverFont);
  textSize(width/7);
  textAlign(CENTER, BASELINE)
  text("GAME OVER",width/2,height/2)
  
  //play again text
  if (show_playagain == true){
    //detect mouse intersection to click to replay
    if (mouseX > width / 2 - textWidth("PLAY AGAIN") / 2 &&
        mouseX < width / 2 + textWidth("PLAY AGAIN") / 2 &&
        mouseY > height / 2 - 55 && mouseY < height / 2 + 10){
      playagain_size = 1.05;
      if (mouseIsPressed){
        restart = true;
        resetGame();
      }
    } else{
      playagain_size = 1;
    }
    fill(255);
    textFont(gameoverFont);
    textSize(width/7*playagain_size);
    textAlign(CENTER, BASELINE)
    text("PLAY AGAIN",width/2,height/2)
  }
  //high score text
  fill(255);
  textSize(50);
  textAlign(CENTER, BASELINE);
  textFont(gameoverFont);
  text("HIGHSCORE "+highscorestring,width/2,height/2 + 40);
}

function resetGame(){
  // reset game variables
  gameover = false;
  message = '';
  horizontals = [];
  foods = [];
  foodbool = false;
  powerups = [];
  powerup = false;
  invisible = false;
  slowness = false;
  health = false;
  gameovertext = false;
  gameoverbegin = 0;
  show_playagain = false;
  playagain_size = 1;
  poweruptimer = 0;
  scorepause = true;
  firstpress = false;
  timerStarted = false;
  blinking = true;
  gameoversoundplaying = false;
  fall = false;
  
  //reset main character
  character = new main();

  //reset high score timer and elapsed time
  starttime = millis();
  elapsedtime = 0;
  
  //restart music
  gameplaymusic.play();
}

/*--------------
POWERUP OPTIONS
--------------*/

function choosePowerup(){
  //CHOOSE POWERUP RANDOM
  let poweruppicker = floor(random(1,4));
  
  //POWERUP OPTIONS
  
  if (powerup == true){ // double check powerup is on
    //invincible
  if (poweruppicker == 1){
    invisible = true; //removes collision detection from obstacles
    powerupmsg = "invincible"
  }
  //slowness
  if (poweruppicker == 2){
    slowness = true; //changes horizontal obstacle xspeed to
    powerupmsg = "slowness"
  }
  //health
  if (poweruppicker == 3){
    health = true; //temporarily removes hunger
    powerupmsg = "deep breath"
  }
}
  return powerupmsg;
}
/*--------------
SCORING FUNCTIONS
--------------*/

function timerscore(){
  //calculate elapsed time if game is playing
  if (scorepause == false){
    let timedelta = (millis()-starttime)/1000;
    elapsedtime += timedelta;
    starttime = millis();
  }
  //conversion
  let hours = floor(elapsedtime/3600);
  let minutes = floor((elapsedtime%3600)/60);
  let seconds = floor(elapsedtime%60);
  
  //display
  scorestring = nf(hours,2)+":"+nf(minutes,2)+":"+nf(seconds,2)
  fill(255);
  textSize(100);
  textAlign(CENTER, TOP);
  textFont(gameoverFont);
  text(scorestring,width/2,height/30);
  
  if (!gameover){ //show high score at top
    text(scorestring,width/2,height/30);
  textSize(45);
  text(highscorestring,width/2,height/9.5);
  }
  
  if (elapsedtime > highscoretime){
    highscoretime = elapsedtime;
    highscorestring = scorestring;
  }
}
