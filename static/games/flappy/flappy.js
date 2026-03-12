// Flappy Bird Game - Cybersecurity Themed
class FlappyGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameRunning = false;
        this.gameOverFlag = false;
        this.score = 0;
        this.gameSpeed = 4;
        this.maxGameSpeed = 12;
        this.gameSpeedIncrement = 0.00003;

        this.bird = {
            x: 60,
            y: 0,
            width: 35,
            height: 28,
            dy: 0,
            gravity: 0.45,
            flapStrength: -9,
            frameIndex: 0,
            frameCounter: 0
        };

        this.pipes = [];
        this.pipeGap = 90;
        this.pipeWidth = 50;
        this.pipeSpacing = 150;
        this.nextPipeX = 0;
        this.pipesPassed = 0;
        this.lastFrameTime = Date.now();

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.bird.y = this.canvas.height / 2;
        this.nextPipeX = this.canvas.width;
    }

    setupEventListeners() {
        const handleFlap = () => {
            if (!this.gameRunning && !this.gameOverFlag) {
                this.startGame();
            } else if (this.gameRunning && !this.gameOverFlag) {
                this.bird.dy = this.bird.flapStrength;
            } else if (this.gameOverFlag) {
                this.resetGame();
            }
        };

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlap();
            }
        });

        this.canvas.addEventListener('click', handleFlap);
    }

    startGame() {
        this.gameRunning = true;
        this.gameOverFlag = false;
        this.score = 0;
        this.gameSpeed = 4;
        this.bird.y = this.canvas.height / 2;
        this.bird.dy = 0;
        this.pipes = [];
        this.pipesPassed = 0;
        this.nextPipeX = this.canvas.width;
        this.gameLoop();
    }

    resetGame() {
        this.gameOverFlag = false;
        this.gameRunning = false;
        this.bird.y = this.canvas.height / 2;
        this.bird.dy = 0;
    }

    update() {
        this.bird.dy += this.bird.gravity;
        this.bird.y += this.bird.dy;
        this.bird.frameCounter++;

        if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
            this.gameOverFlag = true;
            this.gameRunning = false;
            return;
        }

        if (this.nextPipeX < this.canvas.width) {
            const minGap = 70;
            const maxGap = this.canvas.height - this.pipeGap - 100;
            const gapStart = Math.random() * (maxGap - minGap) + minGap;

            this.pipes.push({
                x: this.nextPipeX,
                topHeight: gapStart,
                bottomStart: gapStart + this.pipeGap,
                width: this.pipeWidth,
                scored: false
            });
            this.nextPipeX += this.pipeSpacing;
            this.pipeSpacing = Math.max(130, 150 - this.score / 30);
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.gameSpeed;

            if (this.checkCollision(this.bird, this.pipes[i])) {
                this.gameOverFlag = true;
                this.gameRunning = false;
            }

            if (!this.pipes[i].scored && this.pipes[i].x + this.pipes[i].width < this.bird.x) {
                this.score += 10;
                this.pipes[i].scored = true;

                if (this.gameSpeed < this.maxGameSpeed) {
                    this.gameSpeed += this.gameSpeedIncrement;
                }
            }

            if (this.pipes[i].x < -this.pipes[i].width) {
                this.pipes.splice(i, 1);
            }
        }
    }

    checkCollision(bird, pipe) {
        const birdLeft = bird.x;
        const birdRight = bird.x + bird.width;
        const birdTop = bird.y;
        const birdBottom = bird.y + bird.height;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + pipe.width;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomStart) {
                return true;
            }
        }
        return false;
    }

    drawBird() {
        const x = this.bird.x;
        const y = this.bird.y;
        const w = this.bird.width;
        const h = this.bird.height;

        this.ctx.shadowColor = 'rgba(88, 166, 255, 0.5)';
        this.ctx.shadowBlur = 10;

        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(x + w * 0.65, y + h * 0.4, 5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x + w * 0.7, y + h * 0.35, 2, 0, Math.PI * 2);
        this.ctx.fill();

        const wingFlap = Math.sin(this.bird.frameCounter * 0.1) * 15;
        this.ctx.fillStyle = 'rgba(255, 235, 59, 0.7)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 8, y + h / 2, 8, 10 + wingFlap, 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(x + w * 0.8, y + h / 2);
        this.ctx.lineTo(x + w + 5, y + h / 2 - 4);
        this.ctx.lineTo(x + w, y + h / 2 + 4);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.shadowColor = 'transparent';
    }

    drawPipe(pipe) {
        this.ctx.shadowColor = 'rgba(88, 166, 255, 0.3)';
        this.ctx.shadowBlur = 8;

        this.ctx.fillStyle = '#58a6ff';
        this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);

        this.ctx.strokeStyle = '#79b8ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);

        this.ctx.fillStyle = '#58a6ff';
        this.ctx.fillRect(pipe.x, pipe.bottomStart, pipe.width, this.canvas.height - pipe.bottomStart);

        this.ctx.strokeRect(pipe.x, pipe.bottomStart, pipe.width, this.canvas.height - pipe.bottomStart);

        this.ctx.shadowColor = 'transparent';
    }

    draw() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#0d1117');
        gradient.addColorStop(1, '#161b22');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(88, 166, 255, 0.1)';
        this.ctx.lineWidth = 1;
        const gridSize = 40;
        const offset = (this.score * 0.2) % gridSize;

        for (let i = -1; i < this.canvas.width / gridSize + 1; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * gridSize + offset, 0);
            this.ctx.lineTo(i * gridSize + offset, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i < this.canvas.height / gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * gridSize);
            this.ctx.lineTo(this.canvas.width, i * gridSize);
            this.ctx.stroke();
        }

        for (let pipe of this.pipes) {
            this.drawPipe(pipe);
        }

        this.drawBird();

        this.ctx.fillStyle = '#58a6ff';
        this.ctx.font = 'bold 20px Courier New';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('> SCORE: ' + this.score, this.canvas.width - 20, 40);
        this.ctx.fillText('> SPEED: ' + this.gameSpeed.toFixed(1) + 'x', this.canvas.width - 20, 70);

        if (!this.gameRunning && !this.gameOverFlag) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#58a6ff';
            this.ctx.font = 'bold 32px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('≡ CYBER BIRD ≡', this.canvas.width / 2, this.canvas.height / 2 - 60);

            this.ctx.fillStyle = '#79b8ff';
            this.ctx.font = '16px Courier New';
            this.ctx.fillText('$ Press SPACE or Click to Flap', this.canvas.width / 2, this.canvas.height / 2 + 10);
            this.ctx.fillText('$ Navigate through the firewalls!', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }

        if (this.gameOverFlag) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = 'bold 32px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('[!] SYSTEM CRASH [!]', this.canvas.width / 2, this.canvas.height / 2 - 40);

            this.ctx.fillStyle = '#58a6ff';
            this.ctx.font = 'bold 18px Courier New';
            this.ctx.fillText('Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2 + 10);

            this.ctx.fillStyle = '#79b8ff';
            this.ctx.font = '14px Courier New';
            this.ctx.fillText('Press SPACE or Click to Reboot', this.canvas.width / 2, this.canvas.height / 2 + 50);
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
    const flappyCanvas = document.getElementById('flappy-canvas');
    if (flappyCanvas) {
        new FlappyGame(flappyCanvas);
    }
});
