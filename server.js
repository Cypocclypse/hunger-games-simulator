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
    animals: [],
    weapons: [],
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

// Weapons for cornucopia
const WEAPONS = [
    "Bow and Arrows", "Sword", "Spear", "Knife", "Axe", 
    "Mace", "Trident", "Crossbow", "Dagger"
];

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

        // Generate starting positions around the cornucopia
        const centerX = arena.cornucopia.x;
        const centerY = arena.cornucopia.y;
        const radius = 150;
        
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * 2 * Math.PI;
            arena.startingPositions.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }

        return arena;
    }

    static generateWeapons() {
        const shuffled = [...WEAPONS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3).map(weapon => ({
            type: weapon,
            x: 380 + Math.random() * 40,
            y: 280 + Math.random() * 40,
            taken: false
        }));
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
        gameState.weapons = GameEngine.generateWeapons();
        gameState.animals = GameEngine.generateAnimals();
        
        // Assign attributes to all players
        for (let [playerId, player] of gameState.players) {
            gameState.players.set(playerId, GameEngine.assignPlayerAttributes(player));
        }
        
        // Start countdown
        io.emit('gameStarting', {
            arena: gameState.arena,
            weapons: gameState.weapons,
            animals: gameState.animals,
            players: Array.from(gameState.players.values())
        });
        
        startCountdown();
    });

    // Player movement
    socket.on('playerMove', (moveData) => {
        const player = gameState.players.get(socket.id);
        if (!player || !player.alive || !gameState.gameActive) return;

        // Update player position (with bounds checking)
        player.x = Math.max(0, Math.min(800, moveData.x));
        player.y = Math.max(0, Math.min(600, moveData.y));
        
        // Check for weapon pickup
        gameState.weapons.forEach(weapon => {
            if (!weapon.taken && 
                Math.abs(player.x - weapon.x) < 30 && 
                Math.abs(player.y - weapon.y) < 30) {
                weapon.taken = true;
                player.weapon = weapon.type;
                io.emit('weaponTaken', { playerId: socket.id, weapon: weapon.type });
            }
        });
        
        // Broadcast player positions (only visible players)
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
            weapons: gameState.weapons,
            aliveCount: alivePlayers.length,
            currentPlayer: player
        });
    }
    
    // Send full state to spectators
    for (let spectatorId of gameState.spectators) {
        io.to(spectatorId).emit('spectatorState', {
            players: alivePlayers,
            animals: gameState.animals,
            weapons: gameState.weapons,
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
                animals: [],
                weapons: [],
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
