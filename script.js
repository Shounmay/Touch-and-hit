const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const scoreEl = document.querySelector(".score");
const startbtnEl = document.querySelector("#start-btn");
const modalEl = document.querySelector(".modal-container");
const highscoreEl = document.querySelector("#high-score");
let score = 0;

console.log(gsap);
canvas.width = innerWidth;
canvas.height = innerHeight;

// Player
const Player = function (x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;

  this.draw = function () {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
  };
};
const y = canvas.height / 2;
const x = canvas.width / 2;

let player = new Player(x, y, 30, "white");

// Projectile

let Projectile = function (x, y, radius, color, velocity) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;
  this.velocity = velocity;

  this.draw = function () {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
  };

  this.update = function () {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  };
};

let projectiles = [];

addEventListener("click", function (event) {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});
// Particle -creation while enemy brust
let Particle = function (x, y, radius, color, velocity) {
  const friction = 0.99;
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;
  this.velocity = velocity;
  this.alpha = 1;

  this.draw = function () {
    context.save();
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
    context.restore();
  };

  this.update = function () {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  };
};

let particles = [];

// Enemy-Creation

let enemies = [];

const Enemy = function (x, y, radius, color, velocity) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;
  this.velocity = velocity;

  this.draw = function () {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
  };

  this.update = function () {
    this.draw();

    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  };
};
const spawnenemy = function () {
  setInterval(function () {
    const min_radii = 8;
    const max_radii = 30;
    const radius = Math.random() * (max_radii - min_radii) + min_radii;
    let x = 0;
    let y = 0;
    if (Math.random() < 0.5) {
      x = Math.random < 0.5 ? 0 - radius : radius + canvas.width;
      y = Math.random() * canvas.height;
    } else {
      y = Math.random() < 0.5 ? 0 - radius : radius + canvas.height;
      x = Math.random() * canvas.width;
    }

    const color = `hsl(${Math.random() * 360},50%,50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
};

let animateid;
const animate = function () {
  animateid = requestAnimationFrame(animate);
  context.fillStyle = "rgba(0,0,0,0.1)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();

    // removing projectiles that are off-screen

    if (
      projectile.x + projectile.radius < 1 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(function () {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    // check collision among player and enemy
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animateid);
      modalEl.style.display = "flex";
      highscoreEl.innerHTML = score;
      startbtnEl.innerHTML = "Restart";
    }
    //check collison and remove enemy that collided
    projectiles.forEach((projectile, projectile_index) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - projectile.radius - enemy.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6,
              }
            )
          );
        }
        // shrink bigger enemy once hit
        if (enemy.radius - 10 > 5) {
          // score-updation
          score += 100;

          gsap.to(enemy, {
            radius: enemy.radius - 5,
          });
          setTimeout(function () {
            projectiles.splice(projectile_index, 1);
          }, 0);
        } else {
          // score-updation
          score += 250;

          setTimeout(function () {
            enemies.splice(index, 1);
            projectiles.splice(projectile_index, 1);
          }, 0);
        }
        scoreEl.innerHTML = score;
      }
    });
  });
};
// Initial conditions
function init() {
  score = 0;
  scoreEl.innerHTML = 0;
  player = new Player(x, y, 30, "white");
  projectiles = [];
  enemies = [];
  particles = [];
}
startbtnEl.addEventListener("click", function () {
  init();
  animate();
  spawnenemy();
  modalEl.style.display = "none";
});
