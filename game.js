let canvas, ctx, animationId;

let p1, p2, ball;
let score1 = 0, score2 = 0;

let mode, aiSpeed, maxRounds;
let keys = {};

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  document.getElementById("startBtn").addEventListener("click", startGame);
});

/* START */
function startGame(){
  if(animationId) cancelAnimationFrame(animationId);

  mode = parseInt(document.getElementById("mode").value);
  aiSpeed = parseFloat(document.getElementById("difficulty").value);
  maxRounds = parseInt(document.getElementById("rounds").value);

  document.getElementById("menu").style.display = "none";
  document.getElementById("gameWrap").style.display = "flex";

  p1 = {x:20,y:150,w:10,h:100,speed:6};
  p2 = {x:670,y:150,w:10,h:100,speed:6};

  ball = {x:350,y:200,size:10,dx:4,dy:3};

  score1 = 0;
  score2 = 0;

  loop();
}

/* INPUT */
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

/* MOVIMENTO */
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

/* COLISÃO */
function collide(p){
  return ball.x < p.x+p.w &&
         ball.x+ball.size > p.x &&
         ball.y < p.y+p.h &&
         ball.y+ball.size > p.y;
}

/* UPDATE */
function update(){
  movePlayers();
  ai();

  ball.x += ball.dx;
  ball.y += ball.dy;

  if(ball.y <= 0 || ball.y >= canvas.height - ball.size){
    ball.dy *= -1;
  }

  if(collide(p1) || collide(p2)){
    ball.dx *= -1;
  }

  if(ball.x < 0){
    score2++;
    checkEnd();
    resetBall();
  }

  if(ball.x > canvas.width){
    score1++;
    checkEnd();
    resetBall();
  }

  document.getElementById("score1").innerText = score1;
  document.getElementById("score2").innerText = score2;
}

/* FINAL */
function checkEnd(){
  if(score1 >= maxRounds || score2 >= maxRounds){
    cancelAnimationFrame(animationId);

    document.getElementById("gameWrap").style.display = "none";
    document.getElementById("endScreen").style.display = "flex";

    const winner = score1 > score2 ? "Jogador 1 venceu!" : "Jogador 2 venceu!";
    document.getElementById("winnerText").innerText = winner;
  }
}

/* RESET */
function resetBall(){
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.dx *= -1;
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
  ctx.fillRect(ball.x,ball.y,ball.size,ball.size);
}

/* LOOP */
function loop(){
  update();
  draw();
  animationId = requestAnimationFrame(loop);
}