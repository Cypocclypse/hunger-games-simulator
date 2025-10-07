// Game client-side logic
class HungerGamesClient {
    constructor() {
        this.socket = io();
        this.currentPlayer = null;
        this.gameState = null;
        this.keys = {};
        this.canvas = null;
        this.ctx = null;
        this.spectatorMode = false;
        
        this.init();
    }

    init() {
        this.setupSocketListeners();
        this.setupEventListeners();
        this.setupCanvas();
        this.startGameLoop();
    }

    setupSocketListeners() {
        this.socket.on('playersUpdate', (data) => {
            this.updatePlayersList(data.players, data.count);
        });

        this.socket.on('joinedGame', (player) => {
            this.currentPlayer = player;
            console.log('Joined game as:', player.name);
        });

        this.socket.on('gameStarting', (data) => {
            this.gameState = data;
            this.currentPlayer = data.players.find(p => p.id === this.socket.id);
            this.showGameScreen();
            this.updatePlayerInfo();
        });

        this.socket.on('countdownUpdate', (count) => {
            document.getElementById('gameTimer').textContent = `Countdown: ${count}`;
        });

        this.socket.on('countdownEnd', () => {
            document.getElementById('gameTimer').textContent = 'FIGHT!';
        });

        this.socket.on('gameState', (state) => {
            this.gameState = state;
            this.currentPlayer = state.currentPlayer;
            this.updateUI();
        });

        this.socket.on('spectatorState', (state) => {
            this.gameState = state;
            this.updateSpectatorUI();
        });

        this.socket.on('eliminated', () => {
            this.spectatorMode = true;
            this.showSpectatorScreen();
        });

        this.socket.on('gameOver', (data) => {
            this.showGameOverScreen(data);
        });

        this.socket.on('weaponTaken', (data) => {
            if (data.playerId === this.socket.id) {
                console.log('You picked up:', data.weapon);
            }
        });

        this.socket.on('playerKilled', (data) => {
            console.log(`${data.killer} eliminated ${data.victim}`);
        });

        this.socket.on('gameInProgress', () => {
            alert('Game is already in progress. Please wait for the next game.');
        });

        this.socket.on('notEnoughPlayers', () => {
            alert('Not enough players to start the game.');
        });
    }

    setupEventListeners() {
        // Player registration form
        document.getElementById('playerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.joinGame();
        });

        // Image preview
        document.getElementById('playerImage').addEventListener('change', (e) => {
            this.previewImage(e.target.files[0]);
        });

        // Start game button
        document.getElementById('startGame').addEventListener('click', () => {
            this.socket.emit('startGame');
        });

        // Play again buttons
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resetToLobby();
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetToLobby();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Attack with spacebar
            if (e.key === ' ' && this.currentPlayer && this.currentPlayer.alive) {
                this.handleAttack();
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spectatorCanvas = document.getElementById('spectatorCanvas');
        this.spectatorCtx = this.spectatorCanvas.getContext('2d');
    }

    previewImage(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    joinGame() {
        const name = document.getElementById('playerName').value.trim();
        const imageFile = document.getElementById('playerImage').files[0];

        if (!name || !imageFile) {
            alert('Please enter your name and select an image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const playerData = {
                name: name,
                image: e.target.result
            };
            this.socket.emit('joinGame', playerData);
        };
        reader.readAsDataURL(imageFile);
    }

    updatePlayersList(players, count) {
        const playersList = document.getElementById('playersList');
        const playerCount = document.getElementById('playerCount');
        const startButton = document.getElementById('startGame');

        playersList.innerHTML = '';
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            playerDiv.innerHTML = `
                <img src="${player.image}" alt="${player.name}">
                <span>${player.name}</span>
            `;
            playersList.appendChild(playerDiv);
        });

        playerCount.textContent = count;
        
        if (count >= 2) { // Minimum players for testing
            startButton.style.display = 'block';
        } else {
            startButton.style.display = 'none';
        }
    }

    showGameScreen() {
        document.getElementById('lobby').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
    }

    showSpectatorScreen() {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('spectatorScreen').classList.add('active');
    }

    showGameOverScreen(data) {
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('spectatorScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.add('active');
        
        const announcement = document.getElementById('winnerAnnouncement');
        const results = document.getElementById('gameResults');
        
        if (data.winner && data.winner !== 'No one') {
            announcement.textContent = `${data.winner} Wins!`;
            announcement.style.color = '#f1c40f';
        } else {
            announcement.textContent = 'Game Over - No Winner';
            announcement.style.color = '#e74c3c';
        }
        
        // Show final standings
        const alivePlayers = data.players.filter(p => p.alive);
        const deadPlayers = data.players.filter(p => !p.alive);
        
        results.innerHTML = `
            <h3>Final Results:</h3>
            ${alivePlayers.length > 0 ? `<p><strong>Winner:</strong> ${alivePlayers[0].name}</p>` : ''}
            <p><strong>Total Players:</strong> ${data.players.length}</p>
            <p><strong>Survivors:</strong> ${alivePlayers.length}</p>
        `;
    }

    resetToLobby() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('lobby').classList.add('active');
        
        // Reset form
        document.getElementById('playerForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        this.currentPlayer = null;
        this.gameState = null;
        this.spectatorMode = false;
    }

    updatePlayerInfo() {
        if (this.currentPlayer) {
            document.getElementById('playerDistrict').textContent = 
                `District: ${this.currentPlayer.district.name}`;
            document.getElementById('playerAbility').textContent = 
                `Ability: ${this.currentPlayer.ability}`;
        }
    }

    updateUI() {
        if (!this.currentPlayer) return;

        // Update health bars
        document.getElementById('healthBar').style.width = `${this.currentPlayer.health}%`;
        document.getElementById('healthValue').textContent = Math.floor(this.currentPlayer.health);
        
        document.getElementById('foodBar').style.width = `${this.currentPlayer.food}%`;
        document.getElementById('foodValue').textContent = Math.floor(this.currentPlayer.food);
        
        document.getElementById('immuneBar').style.width = `${this.currentPlayer.immune}%`;
        document.getElementById('immuneValue').textContent = Math.floor(this.currentPlayer.immune);

        // Update alive count
        if (this.gameState) {
            document.getElementById('aliveCount').textContent = this.gameState.aliveCount;
        }
    }

    updateSpectatorUI() {
        if (this.gameState) {
            document.getElementById('spectatorAliveCount').textContent = this.gameState.aliveCount;
        }
    }

    handleMovement() {
        if (!this.currentPlayer || !this.currentPlayer.alive || !this.gameState) return;

        let dx = 0;
        let dy = 0;
        const speed = 3;

        if (this.keys['w'] || this.keys['arrowup']) dy -= speed;
        if (this.keys['s'] || this.keys['arrowdown']) dy += speed;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= speed;
        if (this.keys['d'] || this.keys['arrowright']) dx += speed;

        if (dx !== 0 || dy !== 0) {
            const newX = this.currentPlayer.x + dx;
            const newY = this.currentPlayer.y + dy;
            
            this.socket.emit('playerMove', { x: newX, y: newY });
        }
    }

    handleAttack() {
        if (!this.gameState || !this.currentPlayer.alive) return;

        // Find nearby players to attack
        const nearbyPlayers = this.gameState.players.filter(player => {
            if (player.id === this.currentPlayer.id || !player.alive) return false;
            
            const distance = Math.sqrt(
                Math.pow(this.currentPlayer.x - player.x, 2) + 
                Math.pow(this.currentPlayer.y - player.y, 2)
            );
            
            return distance < 50;
        });

        if (nearbyPlayers.length > 0) {
            // Attack the closest player
            const target = nearbyPlayers[0];
            this.socket.emit('playerAttack', target.id);
        }
    }

    render() {
        const canvas = this.spectatorMode ? this.spectatorCanvas : this.canvas;
        const ctx = this.spectatorMode ? this.spectatorCtx : this.ctx;
        
        if (!ctx || !this.gameState) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw terrain
        if (this.gameState.arena || this.gameState.players) {
            this.drawTerrain(ctx);
        }

        // Draw cornucopia
        this.drawCornucopia(ctx);

        // Draw weapons
        if (this.gameState.weapons) {
            this.gameState.weapons.forEach(weapon => {
                if (!weapon.taken) {
                    this.drawWeapon(ctx, weapon);
                }
            });
        }

        // Draw animals
        if (this.gameState.animals) {
            this.gameState.animals.forEach(animal => {
                this.drawAnimal(ctx, animal);
            });
        }

        // Draw players
        if (this.gameState.players) {
            this.gameState.players.forEach(player => {
                if (player.alive) {
                    this.drawPlayer(ctx, player);
                }
            });
        }
    }

    drawTerrain(ctx) {
        // Simple terrain representation
        for (let x = 0; x < 800; x += 20) {
            for (let y = 0; y < 600; y += 20) {
                const random = Math.sin(x * 0.01) + Math.cos(y * 0.01);
                
                if (random > 0.5) {
                    ctx.fillStyle = '#8fbc8f'; // Forest (green)
                    ctx.fillRect(x, y, 20, 20);
                    ctx.fillStyle = '#228b22';
                    ctx.fillText('🌲', x + 5, y + 15);
                } else if (random > 0) {
                    ctx.fillStyle = '#87ceeb'; // Water (light blue)
                    ctx.fillRect(x, y, 20, 20);
                } else {
                    ctx.fillStyle = '#deb887'; // Sand (tan)
                    ctx.fillRect(x, y, 20, 20);
                }
            }
        }
    }

    drawCornucopia(ctx) {
        const x = 400;
        const y = 300;
        
        // Draw cornucopia
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ff8c00';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏺', x, y + 7);
    }

    drawWeapon(ctx, weapon) {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(weapon.x - 5, weapon.y - 5, 10, 10);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚔️', weapon.x, weapon.y + 3);
    }

    drawAnimal(ctx, animal) {
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(animal.x, animal.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        
        let emoji = '🐺';
        if (animal.type === 'Bear') emoji = '🐻';
        else if (animal.type === 'Snake') emoji = '🐍';
        else if (animal.type === 'Tracker Jacker') emoji = '🐝';
        
        ctx.fillText(emoji, animal.x, animal.y + 5);
    }

    drawPlayer(ctx, player) {
        // Draw player image or placeholder
        if (player.image) {
            const img = new Image();
            img.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(player.x, player.y, 15, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(img, player.x - 15, player.y - 15, 30, 30);
                ctx.restore();
            };
            img.src = player.image;
        } else {
            // Fallback circle
            ctx.fillStyle = player.id === this.socket.id ? '#e74c3c' : '#3498db';
            ctx.beginPath();
            ctx.arc(player.x, player.y, 15, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw player name
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x, player.y - 25);

        // Draw health bar
        const barWidth = 30;
        const barHeight = 4;
        const barX = player.x - barWidth / 2;
        const barY = player.y + 20;

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(barX, barY, (barWidth * player.health) / 100, barHeight);

        // Draw weapon indicator
        if (player.weapon) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '16px Arial';
            ctx.fillText('⚔️', player.x + 20, player.y);
        }
    }

    startGameLoop() {
        const gameLoop = () => {
            this.handleMovement();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new HungerGamesClient();
});
