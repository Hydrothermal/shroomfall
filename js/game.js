const WIDTH = 480;
const HEIGHT = 640;
const P_WIDTH = P_HEIGHT = 80;
const ROCK_INTERVAL = [300, 1400];
const CLOCK_INTERVAL = [5000, 6000];
const GENEROSITY = 7;
const entities = new Set();
let last = 0;
let depth, score, speed;
let dead, nextrock, nextclock;

class Entity {
    constructor(type, radius, x) {
        entities.add(this);

        this.type = type;
        this.x = x ?? randRange(64, WIDTH - 64);
        this.radius = radius;
        this.depth = depth;
    }

    get y() { return this === player ? 100 : this.depth - depth + HEIGHT + this.radius; }
    get left() { return this.x - this.radius; }
    get top() { return this.y - this.radius; }

    isColliding(target) {
        const dist = Math.sqrt((target.x - this.x) ** 2 + (target.y - this.y) ** 2);
        return dist <= this.radius + target.radius - (this.type === "rock" ? GENEROSITY : 0);
    }

    render(dt) {
        ctx.drawImage(this.image, this.left, this.y - this.radius);

        if(this.y + this.radius < 0) {
            this.destroy();
        }
    }

    destroy() {
        entities.delete(this);
    }
}

class Player extends Entity {
    constructor() {
        super("player", 40, WIDTH / 2);
        this.angle = 0;
    }

    render(dt) {
        const rotate_speed = 700 - (speed * 4);
        this.angle += (dt / rotate_speed) * Math.PI;
        ctx.fillStyle = "#0a0";

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(this.angle);
        ctx.drawImage(images.player, -player.radius, -player.radius);
        ctx.restore();
    }
}

class Rock extends Entity {
    constructor() {
        super("rock", 40);

        this.rocktype = randRange(1, 3);
        this.image = images[`rock_${this.rocktype}`];
    }

    collide() {
        endGame();
    }
}

class Clock extends Entity {
    constructor() {
        super("clock", 25);
        this.image = images.clock;
    }

    collide() {
        speed -= 20;
        this.destroy();
    }
}

function realscore() {
    return Math.floor(score / 100);
}

function setSpeed(dt) {
    speed += dt / 250;
    speed = Math.max(30, Math.min(200, speed));
}

function setNextRock() {
    nextrock = last + randRange(...ROCK_INTERVAL);
}

function setNextClock() {
    nextclock = last + randRange(...CLOCK_INTERVAL);
}

function endGame() {
    const highscore = Math.max(localStorage.getItem("highscore"), realscore());
    localStorage.setItem("highscore", highscore);

    canvas.parentNode.classList.add("dead");
    dead = true;

    for(let entity of entities) {
        entity.destroy();
    }
}

function loop(ts) {
    const dt = ts - last;
    last = ts;

    if(!dead) {
        setSpeed(dt);
        depth += dt * (speed / 100);
        score += dt;

        // generate stuff
        if(ts >= nextrock) {
            new Rock();
            setNextRock();
        }

        if(ts >= nextclock) {
            new Clock();
            setNextClock();
        }

        // check collisions
        for(let entity of entities) {
            if(entity !== player && entity.isColliding(player)) {
                entity.collide();
            }
        }
    }

    player.x = mouse.x ?? WIDTH / 2;
    render(dt);
}

function render(dt) {
    const wall_y = (0 - depth) % HEIGHT;

    // background
    ctx.fillStyle = "#eaeaea";
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if(dead) {
        ctx.drawImage(images.death, 0, 0);

        ctx.font = "20px 'Comic Sans MS'";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";

        ctx.drawImage(images.label, WIDTH / 2 - images.label.width / 2, 25);
        ctx.fillText(`final score: ${realscore()}`, WIDTH / 2, 25 + 10);
        ctx.drawImage(images.label, WIDTH / 2 - images.label.width / 2, 25 + 50);
        ctx.fillText(`high score: ${localStorage.getItem("highscore")}`, WIDTH / 2, 25 + 50 + 10);
    } else {
        // entities
        for(let entity of entities) {
            entity.render(dt);
        }

        // walls
        ctx.drawImage(images.wall, 0, wall_y);
        ctx.drawImage(images.wall, 0, wall_y + HEIGHT);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(images.wall, -WIDTH + images.wall.width, wall_y, images.wall.width * -1, images.wall.height);
        ctx.drawImage(images.wall, -WIDTH + images.wall.width, wall_y + HEIGHT, images.wall.width * -1, images.wall.height);
        ctx.restore();

        // score
        ctx.drawImage(images.label, 5, 5);
        ctx.font = "20px 'Comic Sans MS'";
        ctx.fillStyle = "#000";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        ctx.fillText(`score: ${realscore()}`, 14, 15);
    }

    requestAnimationFrame(loop);
}

function newGame() {
    canvas.parentNode.classList.remove("dead");
    depth = score = speed = 0;
    dead = false;

    player = new Player();
    setNextRock();
    setNextClock();
}

// initialize canvas
canvas.width = WIDTH;
canvas.height = HEIGHT;

// load images
Promise.all([
    loadImage("player", "img/player.png"),
    loadImage("label", "img/label.png"),
    loadImage("death", "img/death.png"),
    loadImage("wall", "img/wall.png"),
    loadImage("rock_1", "img/rock_1.png"),
    loadImage("rock_2", "img/rock_2.png"),
    loadImage("rock_3", "img/rock_3.png"),
    loadImage("clock", "img/clock.png"),
]).then(() => {
    newGame();
    requestAnimationFrame(loop);
});