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
        this.countdownActive = false;
        this.gameStarted = false;
        this.inventory = [];
        this.selectedItemIndex = 0;
        this.isMobile = this.detectMobile();
        
        this.init();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
            this.countdownActive = count > 0;
        });

        this.socket.on('countdownEnd', () => {
            document.getElementById('gameTimer').textContent = 'FIGHT!';
            this.countdownActive = false;
            this.gameStarted = true;
        });

        this.socket.on('playerEliminated', (data) => {
            if (data.playerId === this.socket.id && data.reason === 'earlyMovement') {
                alert('You moved too early! You have been eliminated and can only spectate.');
                this.spectatorMode = true;
                this.showSpectatorScreen();
            }
        });

        this.socket.on('itemPickup', (data) => {
            if (data.playerId === this.socket.id) {
                this.inventory.push(data.item);
                this.updateInventoryDisplay();
            }
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
            
            // Prevent movement during countdown
            if (this.countdownActive && (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 'a' || 
                e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'd')) {
                this.socket.emit('earlyMovement');
                e.preventDefault();
                return;
            }
            
            // Inventory navigation
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.navigateInventory(e.key === 'ArrowUp' ? -1 : 1);
                e.preventDefault();
            }
            
            // Use item
            if (e.key === 'Enter' && this.inventory.length > 0) {
                this.useSelectedItem();
                e.preventDefault();
            }
            
            // Attack with spacebar
            if (e.key === ' ' && this.currentPlayer && this.currentPlayer.alive && this.gameStarted) {
                this.handleAttack();
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mobile touch controls
        if (this.isMobile) {
            this.setupMobileControls();
        }
    }

    setupMobileControls() {
        // Create mobile control overlay
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="movement-pad">
                <button class="move-btn" data-direction="w">↑</button>
                <div class="middle-row">
                    <button class="move-btn" data-direction="a">←</button>
                    <button class="move-btn" data-direction="d">→</button>
                </div>
                <button class="move-btn" data-direction="s">↓</button>
            </div>
            <div class="action-buttons">
                <button class="action-btn" id="attackBtn">Attack</button>
                <button class="action-btn" id="useItemBtn">Use Item</button>
            </div>
        `;
        document.body.appendChild(mobileControls);

        // Touch movement
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.keys[direction] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.keys[direction] = false;
            });
        });

        // Touch actions
        document.getElementById('attackBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.currentPlayer && this.currentPlayer.alive && this.gameStarted) {
                this.handleAttack();
            }
        });

        document.getElementById('useItemBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.inventory.length > 0) {
                this.useSelectedItem();
            }
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

        // Update inventory display
        this.updateInventoryDisplay();
    }

    navigateInventory(direction) {
        if (this.inventory.length === 0) return;
        
        this.selectedItemIndex += direction;
        if (this.selectedItemIndex < 0) this.selectedItemIndex = this.inventory.length - 1;
        if (this.selectedItemIndex >= this.inventory.length) this.selectedItemIndex = 0;
        
        this.updateInventoryDisplay();
    }

    useSelectedItem() {
        if (this.inventory.length === 0) return;
        
        const item = this.inventory[this.selectedItemIndex];
        this.socket.emit('useItem', { itemId: item.id });
    }

    updateInventoryDisplay() {
        const inventoryDiv = document.getElementById('inventoryDisplay');
        if (!inventoryDiv) {
            // Create inventory display if it doesn't exist
            const inventoryContainer = document.createElement('div');
            inventoryContainer.id = 'inventoryDisplay';
            inventoryContainer.className = 'inventory-display';
            document.querySelector('.game-ui').appendChild(inventoryContainer);
        }
        
        const display = document.getElementById('inventoryDisplay');
        if (this.inventory.length === 0) {
            display.innerHTML = '<div class="inventory-empty">No items</div>';
            return;
        }
        
        display.innerHTML = this.inventory.map((item, index) => `
            <div class="inventory-item ${index === this.selectedItemIndex ? 'selected' : ''}">
                <span class="item-icon" style="color: ${item.color}">${item.icon}</span>
                <span class="item-name">${item.name}</span>
            </div>
        `).join('');
    }

    updateSpectatorUI() {
        if (this.gameState) {
            document.getElementById('spectatorAliveCount').textContent = this.gameState.aliveCount;
        }
    }

    handleMovement() {
        if (!this.currentPlayer || !this.currentPlayer.alive || !this.gameState || this.countdownActive) return;

        let dx = 0;
        let dy = 0;
        const speed = 4;

        if (this.keys['w']) dy -= speed;
        if (this.keys['s']) dy += speed;
        if (this.keys['a']) dx -= speed;
        if (this.keys['d']) dx += speed;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // Math.sqrt(2)/2
            dy *= 0.707;
        }

        if (dx !== 0 || dy !== 0) {
            const newX = Math.max(0, Math.min(800, this.currentPlayer.x + dx));
            const newY = Math.max(0, Math.min(600, this.currentPlayer.y + dy));
            
            // Update position locally for smooth movement
            this.currentPlayer.x = newX;
            this.currentPlayer.y = newY;
            
            // Send to server
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

        // Draw items (weapons, resources, random items)
        if (this.gameState.items) {
            this.gameState.items.forEach(item => {
                if (!item.taken) {
                    this.drawItem(ctx, item);
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

    drawItem(ctx, item) {
        // Draw colored dot based on item type
        let color = '#00ff00'; // Default green for weapons
        if (item.type === 'resource') color = '#ffff00'; // Yellow for resources
        if (item.type === 'random') color = '#00ffff';   // Cyan for random items
        
        // Draw outer glow
        const glowGradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, 12);
        glowGradient.addColorStop(0, color + '80');
        glowGradient.addColorStop(1, color + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw main dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw inner highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(item.x - 2, item.y - 2, 2, 0, 2 * Math.PI);
        ctx.fill();
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
        const radius = 25; // Bigger player size
        
        // Draw player image or placeholder
        if (player.image) {
            const img = new Image();
            img.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(player.x, player.y, radius, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(img, player.x - radius, player.y - radius, radius * 2, radius * 2);
                ctx.restore();
                
                // Draw border for current player
                if (player.id === this.socket.id) {
                    ctx.strokeStyle = '#e74c3c';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(player.x, player.y, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            };
            img.src = player.image;
        } else {
            // Fallback circle
            ctx.fillStyle = player.id === this.socket.id ? '#e74c3c' : '#3498db';
            ctx.beginPath();
            ctx.arc(player.x, player.y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw player name
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeText(player.name, player.x, player.y - 35);
        ctx.fillText(player.name, player.x, player.y - 35);

        // Draw health bar
        const barWidth = 40;
        const barHeight = 6;
        const barX = player.x - barWidth / 2;
        const barY = player.y + 35;

        // Health bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar fill
        ctx.fillStyle = player.health > 50 ? '#00ff00' : player.health > 25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, (barWidth * player.health) / 100, barHeight);
        
        // Health bar border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
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
