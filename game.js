const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');

canvas.width = 800;
canvas.height = 600;

let gameRunning = false;
let score = 0;
let gameSpeed = 5;
let frameCount = 0;

// Player (Arca)
const player = {
    x: 100,
    y: 400,
    width: 80,
    height: 120,
    velocityY: 0,
    jumping: false,
    gravity: 0.8,
    jumpPower: -15,
    image: new Image()
};

player.image.src = 'arca-sprite.png';

// Ground
const ground = {
    y: 520,
    height: 80
};

// Obstacles
let obstacles = [];
let clouds = [];

// Cloud class
class Cloud {
    constructor() {
        this.x = canvas.width + Math.random() * 200;
        this.y = Math.random() * 200;
        this.width = 80 + Math.random() * 60;
        this.height = 40 + Math.random() * 30;
        this.speed = 1 + Math.random() * 2;
    }
    
    update() {
        this.x -= this.speed;
        if (this.x + this.width < 0) {
            this.x = canvas.width + Math.random() * 200;
            this.y = Math.random() * 200;
        }
    }
    
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.height/2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/3, this.y - this.height/3, this.height/2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width*2/3, this.y, this.height/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Obstacle class
class Obstacle {
    constructor(type) {
        this.type = type; // 'dino', 'rock', 'tree'
        this.x = canvas.width;
        this.speed = gameSpeed;
        
        if (type === 'dino') {
            this.width = 60;
            this.height = 80;
            this.y = ground.y - this.height;
            this.color = '#8B4513';
        } else if (type === 'rock') {
            this.width = 40;
            this.height = 40;
            this.y = ground.y - this.height;
            this.color = '#696969';
        } else if (type === 'tree') {
            this.width = 30;
            this.height = 100;
            this.y = ground.y - this.height;
            this.color = '#228B22';
        }
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw() {
        if (this.type === 'dino') {
            // Simple T-Rex shape
            ctx.fillStyle = '#8B4513';
            // Body
            ctx.fillRect(this.x, this.y + 20, this.width - 10, this.height - 40);
            // Head
            ctx.fillRect(this.x + this.width - 30, this.y, 30, 30);
            // Legs
            ctx.fillRect(this.x + 5, this.y + this.height - 25, 15, 25);
            ctx.fillRect(this.x + 30, this.y + this.height - 25, 15, 25);
            // Eye
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x + this.width - 20, this.y + 8, 8, 8);
        } else if (this.type === 'rock') {
            ctx.fillStyle = '#696969';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'tree') {
            // Trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x + 5, this.y + 40, 20, 60);
            // Leaves
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(this.x + 15, this.y + 30, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    collidesWith(player) {
        return player.x < this.x + this.width - 10 &&
               player.x + player.width - 10 > this.x &&
               player.y < this.y + this.height - 10 &&
               player.y + player.height - 10 > this.y;
    }
}

// Initialize clouds
for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud());
}

// Input handling
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === ' ') {
        jump();
    }
});

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', jump);

function jump() {
    if (!gameRunning) return;
    if (!player.jumping) {
        player.velocityY = player.jumpPower;
        player.jumping = true;
    }
}

function startGame() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameRunning = true;
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    player.y = 400;
    player.velocityY = 0;
    player.jumping = false;
    frameCount = 0;
    gameLoop();
}

function restartGame() {
    startGame();
}

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'flex';
    finalScoreDisplay.textContent = `Score: ${score}`;
}

function spawnObstacle() {
    const types = ['dino', 'rock', 'tree'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    obstacles.push(new Obstacle(randomType));
}

function updatePlayer() {
    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // Ground collision
    if (player.y + player.height >= ground.y) {
        player.y = ground.y - player.height;
        player.velocityY = 0;
        player.jumping = false;
    }
}

function drawBackground() {
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    clouds.forEach(cloud => {
        cloud.update();
        cloud.draw();
    });
    
    // Ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
    
    // Grass on ground
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, ground.y, 10, 5);
    }
}

function drawPlayer() {
    if (player.image.complete) {
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function updateGame() {
    frameCount++;
    
    // Spawn obstacles
    if (frameCount % 100 === 0) {
        spawnObstacle();
    }
    
    // Update player
    updatePlayer();
    
    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        
        // Check collision
        if (obstacle.collidesWith(player)) {
            gameOver();
        }
        
        // Remove off-screen obstacles
        if (obstacle.isOffScreen()) {
            obstacles.splice(index, 1);
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
            
            // Increase difficulty
            if (score % 100 === 0) {
                gameSpeed += 0.5;
            }
        }
    });
}

function drawGame() {
    drawBackground();
    drawPlayer();
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
        obstacle.draw();
    });
}

function gameLoop() {
    if (!gameRunning) return;
    
    updateGame();
    drawGame();
    
    requestAnimationFrame(gameLoop);
}

// Preload player image
player.image.onload = () => {
    console.log('Arca sprite loaded!');
};
