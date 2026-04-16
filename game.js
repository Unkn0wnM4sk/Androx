let canvas, ctx, animationId;

let p1, p2, ball;
let score1 = 0, score2 = 0;

let mode, aiSpeed, maxRounds;
let keys = {};

let waitingStart = false;
let lastScored = null;

let music;
let targetVolume = 0.4;

let trail = [];
let maxTrail = 15;

let maxSpeed = 12;
let speedIncrease = 0.0005;

/* ANDRA */
let lastAndraState = "Neutra";

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  music = document.getElementById("bgMusic");

  document.getElementById("startBtn").addEventListener("click", startGame);
});

/* MUSIC */
function fadeInMusic(){
  music.volume = 0;
  music.currentTime = 0;
  music.play().catch(() => {});

  let vol = 0;
  const fade = setInterval(() => {
    vol += 0.02;
    if(vol >= targetVolume){
      vol = targetVolume;
      clearInterval(fade);
    }
    music.volume = vol;
  }, 100);
}

function fadeOutMusic(){
  let vol = music.volume;

  const fade = setInterval(() => {
    vol -= 0.02;
    if(vol <= 0){
      vol = 0;
      music.pause();
      clearInterval(fade);
    }
    music.volume = vol;
  }, 100);
}

/* START */
function startGame(){
  if(animationId) cancelAnimationFrame(animationId);

  /* 🔥 TROCA FUNDO MENU → JOGO */
  document.body.style.backgroundImage = "url('./bg.png')";

  /* 🔥 ESCONDE O CARD (AQUI É A ÚNICA ADIÇÃO) */
  document.getElementById("andraProfile").style.display = "none";

  mode = parseInt(document.getElementById("mode").value);
  aiSpeed = parseFloat(document.getElementById("difficulty").value);
  maxRounds = parseInt(document.getElementById("rounds").value);

  document.getElementById("menu").style.display = "none";
  document.getElementById("gameWrap").style.display = "flex";

  if(mode === 1){
    document.getElementById("andraContainer").style.display = "flex";
  } else {
    document.getElementById("andraContainer").style.display = "none";
  }

  fadeInMusic();

  p1 = {x:20,y:150,w:10,h:100,speed:6};
  p2 = {x:670,y:150,w:10,h:100,speed:6};

  ball = {x:350,y:200,size:10,dx:0,dy:0};

  score1 = 0;
  score2 = 0;

  lastScored = null;

  updateAndra(true);

  startRound(true);
  loop();
}

/* INPUT */
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* MOVE */
function movePlayers(){
  if(keys["w"]) p1.y -= p1.speed;
  if(keys["s"]) p1.y += p1.speed;

  if(mode === 2){
    if(keys["ArrowUp"]) p2.y -= p2.speed;
    if(keys["ArrowDown"]) p2.y += p2.speed;
  }

  p1.y = Math.max(0, Math.min(canvas.height - p1.h, p1.y));
  p2.y = Math.max(0, Math.min(canvas.height - p2.h, p2.y));
}

/* IA */
function ai(){
  if(mode === 1){
    p2.y += (ball.y - (p2.y + p2.h/2)) * aiSpeed;
  }
}

/* COLLISION */
function collide(p){
  return ball.x < p.x+p.w &&
         ball.x+ball.size > p.x &&
         ball.y < p.y+p.h &&
         ball.y+ball.size > p.y;
}

/* ANIMAÇÃO */
function animateAndra(){
  const container = document.getElementById("andraContainer");

  container.style.transition = "transform 0.15s ease";
  container.style.transform = "translateY(calc(-50% - 15px))";

  setTimeout(() => {
    container.style.transform = "translateY(-50%)";
  }, 150);
}

/* ESTADO BASE */
function updateAndra(force = false){
  if(mode !== 1) return;

  let state = "Neutra";

  if(score2 === maxRounds - 1){
    state = "PoucoParaGanhar";
  }

  if(state !== lastAndraState || force){
    lastAndraState = state;
    document.getElementById("andraSprite").src = `./${state}.png`;
    animateAndra();
  }
}

/* ROUND */
function startRound(isFirst = false){
  waitingStart = true;

  ball.x = canvas.width/2;
  ball.y = canvas.height/2;

  trail = [];

  let flashes = 0;

  const interval = setInterval(() => {
    flashes++;

    ball.size = (ball.size === 10) ? 0 : 10;

    if(flashes >= 4){
      clearInterval(interval);

      ball.size = 10;
      waitingStart = false;

      let direction;

      if(isFirst){
        direction = Math.random() < 0.5 ? -1 : 1;
      } else {
        direction = lastScored === 1 ? -1 : 1;
      }

      ball.dx = 4 * direction;
      ball.dy = (Math.random()*4 - 2);
    }

  }, 200);
}

/* UPDATE */
function update(){
  if(waitingStart) return;

  movePlayers();
  ai();

  if(Math.abs(ball.dx) < maxSpeed){
    ball.dx *= (1 + speedIncrease);
    ball.dy *= (1 + speedIncrease);
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  trail.push({x: ball.x, y: ball.y});
  if(trail.length > maxTrail){
    trail.shift();
  }

  if(ball.y <= 0 || ball.y >= canvas.height - ball.size){
    ball.dy *= -1;
  }

  if(collide(p1) || collide(p2)){
    ball.dx *= -1;
    ball.dx *= 1.05;
    ball.dy *= 1.05;
  }

  /* IA MARCA */
  if(ball.x < 0){
    score2++;
    lastScored = 2;

    let img = document.getElementById("andraSprite");
    img.src = "";
    img.src = "./Vitória.png";

    animateAndra();

    setTimeout(() => {
      updateAndra(true);
    }, 800);

    checkEnd();
    startRound();
  }

  /* JOGADOR MARCA */
  if(ball.x > canvas.width){
    score1++;
    lastScored = 1;

    let img = document.getElementById("andraSprite");
    img.src = "";
    img.src = "./Marcou ponto.png";

    animateAndra();

    setTimeout(() => {
      updateAndra(true);
    }, 800);

    checkEnd();
    startRound();
  }

  document.getElementById("score1").innerText = score1;
  document.getElementById("score2").innerText = score2;
}

/* END */
function checkEnd(){
  if(score1 >= maxRounds || score2 >= maxRounds){
    cancelAnimationFrame(animationId);
    fadeOutMusic();

    if(score2 > score1){
      let img = document.getElementById("andraSprite");
      img.src = "";
      img.src = "./Vitória.png";
    }

    document.getElementById("gameWrap").style.display = "none";
    document.getElementById("endScreen").style.display = "flex";

    const winner = score1 > score2 ? "Jogador 1 venceu!" : "Jogador 2 venceu!";
    document.getElementById("winnerText").innerText = winner;
  }
}

/* DRAW */
function draw(){
  ctx.fillStyle = "#020617";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#334155";
  for(let i=0;i<canvas.height;i+=20){
    ctx.fillRect(canvas.width/2-2,i,4,10);
  }

  ctx.fillStyle = "white";
  ctx.fillRect(p1.x,p1.y,p1.w,p1.h);
  ctx.fillRect(p2.x,p2.y,p2.w,p2.h);

  for(let i = 0; i < trail.length; i++){
    let t = trail[i];
    let alpha = i / trail.length;

    ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
    ctx.fillRect(t.x, t.y, ball.size, ball.size);
  }

  if(ball.size > 0){
    ctx.fillStyle = "white";
    ctx.fillRect(ball.x,ball.y,ball.size,ball.size);
  }
}

/* LOOP */
function loop(){
  update();
  draw();
  animationId = requestAnimationFrame(loop);
}