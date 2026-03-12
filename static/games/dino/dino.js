// Chrome Dino Game - Retro Pixel Style
class DinoGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameRunning = false;
        this.gameOverFlag = false;
        this.score = 0;
        this.gameSpeed = 6;
        this.maxGameSpeed = 20;
        this.gameSpeedIncrement = 0.00002;

        this.groundY = 0;

        this.dino = {
            x: 50,
            y: 0,
            width: 50,
            height: 50,
            dy: 0,
            jumpStrength: -12,
            grounded: true,
            frameIndex: 0,
            frameCounter: 0
        };

        this.obstacles = [];
        this.lastObstacleTime = 0;
        this.obstacleSpawnRate = 100;
        this.gravity = 0.6;
        this.lastFrameTime = Date.now();

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.groundY = this.canvas.height - 30;
        this.dino.y = this.groundY - this.dino.height;
    }

    setupEventListeners() {
        const handleJump = () => {
            if (!this.gameRunning && !this.gameOverFlag) {
                this.startGame();
            } else if (this.dino.grounded && !this.gameOverFlag) {
                this.dino.dy = this.dino.jumpStrength;
                this.dino.grounded = false;
            } else if (this.gameOverFlag) {
                this.resetGame();
            }
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
            }
        });

        this.canvas.addEventListener('click', handleJump);
    }

    startGame() {
        this.gameRunning = true;
        this.gameOverFlag = false;
        this.score = 0;
        this.gameSpeed = 6;
        this.obstacles = [];
        this.dino.y = this.groundY - this.dino.height;
        this.dino.dy = 0;
        this.gameLoop();
    }

    resetGame() {
        this.gameOverFlag = false;
        this.gameRunning = false;
        this.dino.y = this.groundY - this.dino.height;
        this.dino.dy = 0;
        this.dino.grounded = true;
    }

    spawnObstacle() {
        const types = ['cactus-small', 'cactus-large', 'bird'];
        const type = types[Math.floor(Math.random() * types.length)];

        let obstacle = { x: this.canvas.width, type: type, width: 30, height: 50 };

        if (type === 'cactus-small') {
            obstacle.width = 25;
            obstacle.height = 35;
            obstacle.y = this.groundY - obstacle.height;
        } else if (type === 'cactus-large') {
            obstacle.width = 30;
            obstacle.height = 55;
            obstacle.y = this.groundY - obstacle.height;
        } else if (type === 'bird') {
            obstacle.width = 35;
            obstacle.height = 25;
            obstacle.y = this.groundY - 60;
        }

        this.obstacles.push(obstacle);
    }

    update() {
        this.dino.dy += this.gravity;
        this.dino.y += this.dino.dy;

        if (this.dino.y + this.dino.height >= this.groundY) {
            this.dino.y = this.groundY - this.dino.height;
            this.dino.dy = 0;
            this.dino.grounded = true;
        }

        this.dino.frameCounter++;

        const now = Date.now();
        if (now - this.lastObstacleTime > this.obstacleSpawnRate) {
            this.spawnObstacle();
            this.lastObstacleTime = now;
            this.obstacleSpawnRate = Math.max(60, 100 - this.score / 20);
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.gameSpeed;

            const padding = 5;
            if (this.checkCollision(
                this.dino.x + padding, this.dino.y + padding,
                this.dino.width - padding * 2, this.dino.height - padding * 2,
                this.obstacles[i].x + padding, this.obstacles[i].y + padding,
                this.obstacles[i].width - padding * 2, this.obstacles[i].height - padding * 2
            )) {
                this.gameOverFlag = true;
                this.gameRunning = false;
            }

            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
                if (this.gameSpeed < this.maxGameSpeed) {
                    this.gameSpeed += this.gameSpeedIncrement;
                }
            }
        }
    }

    checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    drawDino() {
        const x = this.dino.x;
        const y = this.dino.y;
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.fillRect(x + 10, y + 20, 25, 20);
        this.ctx.fillRect(x + 25, y + 5, 15, 18);
        this.ctx.fillRect(x, y + 15, 10, 10);
        this.ctx.fillStyle = '#0d1117';
        this.ctx.fillRect(x + 30, y + 8, 5, 5);
        this.ctx.fillStyle = '#58a6ff';
        const legOffsetX = Math.sin(this.dino.frameCounter * 0.05) * 3;
        this.ctx.fillRect(x + 18 + legOffsetX, y + 38, 8, 12);
        this.ctx.fillRect(x + 28 - legOffsetX, y + 38, 8, 12);
    }

    drawObstacle(obs) {
        this.ctx.fillStyle = '#ff6b6b';
        if (obs.type === 'cactus-small') {
            this.ctx.fillRect(obs.x + 8, obs.y, 10, obs.height);
            this.ctx.fillRect(obs.x + 4, obs.y + 8, 5, 10);
            this.ctx.fillRect(obs.x + 18, obs.y + 8, 5, 10);
        } else if (obs.type === 'cactus-large') {
            this.ctx.fillRect(obs.x + 4, obs.y, 8, obs.height);
            this.ctx.fillRect(obs.x + 12, obs.y - 10, 8, obs.height + 10);
            this.ctx.fillRect(obs.x + 20, obs.y, 8, obs.height);
        } else if (obs.type === 'bird') {
            this.ctx.fillRect(obs.x + 5, obs.y + 8, 20, 10);
            this.ctx.fillRect(obs.x + 22, obs.y + 5, 8, 8);
            const wingFlap = Math.sin(this.dino.frameCounter * 0.1) * 3;
            this.ctx.fillRect(obs.x + 2, obs.y + 12 - wingFlap, 8, 4);
            this.ctx.fillRect(obs.x + 25, obs.y + 12 - wingFlap, 8, 4);
        }
    }

    draw() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0d1117');
        gradient.addColorStop(1, '#161b22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(88, 166, 255, 0.1)';
        const cloudOffset = (this.score * 0.5) % 200;
        this.ctx.fillRect(100 - cloudOffset, 50, 60, 20);
        this.ctx.fillRect(300 - cloudOffset, 80, 80, 25);

        this.ctx.strokeStyle = '#30363d';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#30363d';
        this.ctx.lineWidth = 1;
        const dashOffset = (this.score * 0.5) % 40;
        for (let i = -1; i < this.canvas.width / 40; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * 40 + dashOffset, this.groundY + 10);
            this.ctx.lineTo(i * 40 + 20 + dashOffset, this.groundY + 10);
            this.ctx.stroke();
        }

        this.drawDino();

        for (let obs of this.obstacles) {
            this.drawObstacle(obs);
        }

        this.ctx.fillStyle = '#58a6ff';
        this.ctx.font = 'bold 20px Courier New';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('SCORE: ' + this.score, this.canvas.width - 20, 40);
        this.ctx.fillText('SPEED: ' + this.gameSpeed.toFixed(1) + 'x', this.canvas.width - 20, 70);

        if (!this.gameRunning && !this.gameOverFlag) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#58a6ff';
            this.ctx.font = 'bold 36px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('▓▒░ DINO RUN ░▒▓', this.canvas.width / 2, this.canvas.height / 2 - 60);
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('Press SPACE or Click to Jump', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText('Avoid obstacles to survive!', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }

        if (this.gameOverFlag) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = 'bold 32px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.fillStyle = '#58a6ff';
            this.ctx.font = 'bold 20px Courier New';
            this.ctx.fillText('Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('Click or Press SPACE to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }

    gameLoop() {
        if (this.gameRunning || this.gameOverFlag) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        } else {
            this.draw();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dinoCanvas = document.getElementById('dino-canvas');
    if (dinoCanvas) {
        new DinoGame(dinoCanvas);
    }
});
