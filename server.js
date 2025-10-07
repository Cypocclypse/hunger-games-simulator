const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Serve static files
app.use(express.static(__dirname));

// Game state
let gameState = {
    players: new Map(),
    gameActive: false,
    gameStarted: false,
    arena: null,
    countdown: 10,
    countdownActive: false,
    animals: [],
    items: [],
    spectators: new Set()
};

// Districts (12 districts like in the books)
const DISTRICTS = [
    { id: 1, name: "District 1", specialty: "Luxury goods" },
    { id: 2, name: "District 2", specialty: "Masonry & weapons" },
    { id: 3, name: "District 3", specialty: "Technology" },
    { id: 4, name: "District 4", specialty: "Fishing" },
    { id: 5, name: "District 5", specialty: "Power" },
    { id: 6, name: "District 6", specialty: "Transportation" },
    { id: 7, name: "District 7", specialty: "Lumber" },
    { id: 8, name: "District 8", specialty: "Textiles" },
    { id: 9, name: "District 9", specialty: "Grain" },
    { id: 10, name: "District 10", specialty: "Livestock" },
    { id: 11, name: "District 11", specialty: "Agriculture" },
    { id: 12, name: "District 12", specialty: "Mining" }
];

// Abilities
const ABILITIES = [
    "Archery", "Sword Fighting", "Stealth", "Strength", "Speed", 
    "Swimming", "Climbing", "Tracking", "Medicine", "Survival",
    "Hand-to-Hand Combat", "Camouflage", "Knives", "Spears"
];

// Items for cornucopia area
const ITEMS = {
    weapons: [
        { name: "Bow and Arrows", damage: 25, icon: "🏹" },
        { name: "Sword", damage: 30, icon: "⚔️" },
        { name: "Spear", damage: 20, icon: "🗡️" },
        { name: "Knife", damage: 15, icon: "🔪" },
        { name: "Axe", damage: 35, icon: "🪓" },
        { name: "Mace", damage: 28, icon: "🔨" },
        { name: "Trident", damage: 32, icon: "🔱" },
        { name: "Crossbow", damage: 27, icon: "🏹" }
    ],
    resources: [
        { name: "Food Pack", effect: "food", amount: 40, icon: "🍖" },
        { name: "Medicine", effect: "health", amount: 30, icon: "💊" },
        { name: "Water Bottle", effect: "immune", amount: 25, icon: "💧" },
        { name: "Energy Bar", effect: "food", amount: 20, icon: "🍫" },
        { name: "First Aid Kit", effect: "health", amount: 50, icon: "🏥" }
    ],
    random: [
        { name: "Shield", effect: "defense", amount: 15, icon: "🛡️" },
        { name: "Speed Boost", effect: "speed", amount: 10, icon: "⚡" },
        { name: "Invisibility Cloak", effect: "stealth", amount: 30, icon: "👻" },
        { name: "Fire Starter", effect: "damage", amount: 5, icon: "🔥" }
    ]
};

// Animals
const ANIMALS = [
    { type: "Wolf", danger: 8, speed: 6 },
    { type: "Bear", danger: 9, speed: 4 },
    { type: "Tracker Jacker", danger: 7, speed: 8 },
    { type: "Muttation", danger: 10, speed: 7 },
    { type: "Snake", danger: 6, speed: 5 }
];

class GameEngine {
    static generateArena() {
        const arena = {
            width: 800,
            height: 600,
            terrain: [],
            cornucopia: { x: 400, y: 300 },
            startingPositions: []
        };

        // Generate terrain (simplified grid system)
        for (let x = 0; x < arena.width; x += 20) {
            for (let y = 0; y < arena.height; y += 20) {
                const random = Math.random();
                let terrain = 'sand'; // default
                
                if (random < 0.3) terrain = 'forest';
                else if (random < 0.4) terrain = 'water';
                else terrain = 'sand';
                
                arena.terrain.push({ x, y, type: terrain });
            }
        }

        // Generate starting positions in a perfect circle around cornucopia
        const centerX = arena.cornucopia.x;
        const centerY = arena.cornucopia.y;
        const radius = 180; // Increased radius for better spacing
        
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * 2 * Math.PI;
            arena.startingPositions.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }

        return arena;
    }

    static generateItems() {
        const items = [];
        const centerX = 400;
        const centerY = 300;
        
        // Generate items in concentric circles around cornucopia
        // Weapons (green) - closest to center
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const radius = 50 + Math.random() * 30;
            const weapon = ITEMS.weapons[Math.floor(Math.random() * ITEMS.weapons.length)];
            items.push({
                id: uuidv4(),
                type: 'weapon',
                name: weapon.name,
                damage: weapon.damage,
                icon: weapon.icon,
                color: '#00ff00',
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                taken: false
            });
        }
        
        // Resources (yellow) - middle ring
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * 2 * Math.PI;
            const radius = 90 + Math.random() * 40;
            const resource = ITEMS.resources[Math.floor(Math.random() * ITEMS.resources.length)];
            items.push({
                id: uuidv4(),
                type: 'resource',
                name: resource.name,
                effect: resource.effect,
                amount: resource.amount,
                icon: resource.icon,
                color: '#ffff00',
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                taken: false
            });
        }
        
        // Random items (cyan) - outer ring
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * 2 * Math.PI;
            const radius = 140 + Math.random() * 30;
            const randomItem = ITEMS.random[Math.floor(Math.random() * ITEMS.random.length)];
            items.push({
                id: uuidv4(),
                type: 'random',
                name: randomItem.name,
                effect: randomItem.effect,
                amount: randomItem.amount,
                icon: randomItem.icon,
                color: '#00ffff',
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                taken: false
            });
        }
        
        return items;
    }

    static generateAnimals(count = 5) {
        const animals = [];
        for (let i = 0; i < count; i++) {
            const animalType = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
            animals.push({
                id: uuidv4(),
                ...animalType,
                x: Math.random() * 800,
                y: Math.random() * 600,
                direction: Math.random() * 2 * Math.PI
            });
        }
        return animals;
    }

    static assignPlayerAttributes(player) {
        // Assign random district
        const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
        
        // Assign random ability
        const ability = ABILITIES[Math.floor(Math.random() * ABILITIES.length)];
        
        // Assign starting position
        const availablePositions = gameState.arena.startingPositions.filter(pos => 
            !Array.from(gameState.players.values()).some(p => p.startX === pos.x && p.startY === pos.y)
        );
        
        const startPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        
        return {
            ...player,
            district,
            ability,
            startX: startPos.x,
            startY: startPos.y,
            x: startPos.x,
            y: startPos.y,
            health: 100,
            food: 100,
            immune: 100,
            alive: true,
            weapon: null
        };
    }
}

// Socket connection handling
io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Player joins the game
    socket.on('joinGame', (playerData) => {
        if (gameState.gameStarted) {
            socket.emit('gameInProgress');
            return;
        }

        const player = {
            id: socket.id,
            name: playerData.name,
            image: playerData.image,
            socketId: socket.id
        };
        
        gameState.players.set(socket.id, player);
        
        // Broadcast updated player list
        io.emit('playersUpdate', {
            players: Array.from(gameState.players.values()),
            count: gameState.players.size
        });
        
        socket.emit('joinedGame', player);
    });

    // Start game (when enough players)
    socket.on('startGame', () => {
        if (gameState.players.size < 2) { // Minimum 2 for testing, can be increased
            socket.emit('notEnoughPlayers');
            return;
        }

        if (gameState.gameStarted) return;

        gameState.gameStarted = true;
        gameState.gameActive = true;
        
        // Generate arena and game elements
        gameState.arena = GameEngine.generateArena();
        gameState.items = GameEngine.generateItems();
        gameState.animals = GameEngine.generateAnimals();
        
        // Assign attributes to all players
        for (let [playerId, player] of gameState.players) {
            gameState.players.set(playerId, GameEngine.assignPlayerAttributes(player));
        }
        
        // Start countdown
        io.emit('gameStarting', {
            arena: gameState.arena,
            items: gameState.items,
            animals: gameState.animals,
            players: Array.from(gameState.players.values())
        });
        
        gameState.countdownActive = true;
        startCountdown();
    });

    // Early movement detection
    socket.on('earlyMovement', () => {
        const player = gameState.players.get(socket.id);
        if (player && gameState.countdownActive) {
            player.alive = false;
            player.eliminatedReason = 'Early movement - blown up by mines';
            gameState.spectators.add(socket.id);
            io.emit('playerEliminated', { 
                playerId: socket.id, 
                reason: 'earlyMovement',
                message: `${player.name} moved too early and was eliminated!`
            });
            broadcastGameState();
        }
    });

    // Player movement
    socket.on('playerMove', (moveData) => {
        const player = gameState.players.get(socket.id);
        if (!player || !player.alive || !gameState.gameActive || gameState.countdownActive) return;

        // Update player position (with bounds checking)
        player.x = Math.max(0, Math.min(800, moveData.x));
        player.y = Math.max(0, Math.min(600, moveData.y));
        
        // Check for item pickup
        gameState.items.forEach(item => {
            if (!item.taken && 
                Math.abs(player.x - item.x) < 35 && 
                Math.abs(player.y - item.y) < 35) {
                item.taken = true;
                
                if (!player.inventory) player.inventory = [];
                player.inventory.push(item);
                
                io.to(socket.id).emit('itemPickup', { 
                    playerId: socket.id, 
                    item: {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        icon: item.icon,
                        color: item.color
                    }
                });
            }
        });
        
        // Broadcast player positions (only visible players)
        broadcastGameState();
    });

    // Item usage
    socket.on('useItem', (data) => {
        const player = gameState.players.get(socket.id);
        if (!player || !player.alive || !player.inventory) return;
        
        const itemIndex = player.inventory.findIndex(item => item.id === data.itemId);
        if (itemIndex === -1) return;
        
        const item = player.inventory[itemIndex];
        
        // Apply item effects
        switch (item.effect) {
            case 'health':
                player.health = Math.min(100, player.health + item.amount);
                break;
            case 'food':
                player.food = Math.min(100, player.food + item.amount);
                break;
            case 'immune':
                player.immune = Math.min(100, player.immune + item.amount);
                break;
            case 'defense':
                player.defense = (player.defense || 0) + item.amount;
                break;
            case 'speed':
                player.speedBoost = (player.speedBoost || 0) + item.amount;
                break;
        }
        
        // Remove item from inventory
        player.inventory.splice(itemIndex, 1);
        
        io.to(socket.id).emit('itemUsed', { 
            item: item.name,
            effect: `${item.effect} +${item.amount}`
        });
        
        broadcastGameState();
    });

    // Player attack
    socket.on('playerAttack', (targetId) => {
        const attacker = gameState.players.get(socket.id);
        const target = gameState.players.get(targetId);
        
        if (!attacker || !target || !attacker.alive || !target.alive) return;
        
        // Check if players are close enough
        const distance = Math.sqrt(
            Math.pow(attacker.x - target.x, 2) + 
            Math.pow(attacker.y - target.y, 2)
        );
        
        if (distance < 50) {
            // Calculate damage based on weapon and ability
            let damage = 20;
            if (attacker.weapon) damage += 15;
            if (attacker.ability === 'Sword Fighting' && attacker.weapon === 'Sword') damage += 10;
            if (attacker.ability === 'Archery' && attacker.weapon === 'Bow and Arrows') damage += 10;
            
            target.health -= damage;
            
            if (target.health <= 0) {
                target.alive = false;
                target.health = 0;
                gameState.spectators.add(targetId);
                io.to(targetId).emit('eliminated');
                io.emit('playerKilled', { killer: attacker.name, victim: target.name });
                
                checkGameEnd();
            }
            
            broadcastGameState();
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        gameState.players.delete(socket.id);
        gameState.spectators.delete(socket.id);
        
        io.emit('playersUpdate', {
            players: Array.from(gameState.players.values()),
            count: gameState.players.size
        });
        
        if (gameState.gameActive) {
            checkGameEnd();
        }
    });
});

function startCountdown() {
    const countdownInterval = setInterval(() => {
        io.emit('countdownUpdate', gameState.countdown);
        gameState.countdown--;
        
        if (gameState.countdown < 0) {
            clearInterval(countdownInterval);
            gameState.countdownActive = false;
            io.emit('countdownEnd');
            startGameLoop();
        }
    }, 1000);
}

function startGameLoop() {
    const gameLoop = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(gameLoop);
            return;
        }
        
        // Update animal positions
        gameState.animals.forEach(animal => {
            animal.x += Math.cos(animal.direction) * animal.speed;
            animal.y += Math.sin(animal.direction) * animal.speed;
            
            // Keep animals in bounds
            if (animal.x < 0 || animal.x > 800) animal.direction = Math.PI - animal.direction;
            if (animal.y < 0 || animal.y > 600) animal.direction = -animal.direction;
            
            // Randomly change direction occasionally
            if (Math.random() < 0.02) {
                animal.direction = Math.random() * 2 * Math.PI;
            }
        });
        
        // Decrease player stats over time
        for (let [playerId, player] of gameState.players) {
            if (player.alive) {
                player.food = Math.max(0, player.food - 0.1);
                player.immune = Math.max(0, player.immune - 0.05);
                
                // Health decreases if food is low
                if (player.food < 20) {
                    player.health = Math.max(0, player.health - 0.2);
                }
                
                if (player.health <= 0) {
                    player.alive = false;
                    gameState.spectators.add(playerId);
                    io.to(playerId).emit('eliminated');
                    checkGameEnd();
                }
            }
        }
        
        broadcastGameState();
    }, 100);
}

function broadcastGameState() {
    const alivePlayers = Array.from(gameState.players.values()).filter(p => p.alive);
    
    for (let [playerId, player] of gameState.players) {
        // Each player only sees nearby players and animals
        const visiblePlayers = alivePlayers.filter(p => {
            if (p.id === playerId) return true;
            const distance = Math.sqrt(
                Math.pow(player.x - p.x, 2) + 
                Math.pow(player.y - p.y, 2)
            );
            return distance < 100; // Visibility range
        });
        
        const visibleAnimals = gameState.animals.filter(animal => {
            const distance = Math.sqrt(
                Math.pow(player.x - animal.x, 2) + 
                Math.pow(player.y - animal.y, 2)
            );
            return distance < 100;
        });
        
        io.to(playerId).emit('gameState', {
            players: visiblePlayers,
            animals: visibleAnimals,
            items: gameState.items,
            aliveCount: alivePlayers.length,
            currentPlayer: player
        });
    }
    
    // Send full state to spectators
    for (let spectatorId of gameState.spectators) {
        io.to(spectatorId).emit('spectatorState', {
            players: alivePlayers,
            animals: gameState.animals,
            items: gameState.items,
            aliveCount: alivePlayers.length
        });
    }
}

function checkGameEnd() {
    const alivePlayers = Array.from(gameState.players.values()).filter(p => p.alive);
    
    if (alivePlayers.length <= 1) {
        gameState.gameActive = false;
        
        const winner = alivePlayers[0];
        io.emit('gameOver', {
            winner: winner ? winner.name : 'No one',
            players: Array.from(gameState.players.values())
        });
        
        // Reset game state
        setTimeout(() => {
            gameState = {
                players: new Map(),
                gameActive: false,
                gameStarted: false,
                arena: null,
                countdown: 10,
                countdownActive: false,
                animals: [],
                items: [],
                spectators: new Set()
            };
        }, 5000);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Hunger Games Simulator running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
