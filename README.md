# Hunger Games Simulator

A multiplayer web-based Hunger Games simulator that recreates the arena experience with real-time multiplayer gameplay.

## Features

### Core Gameplay
- **Multiplayer Support**: Real-time multiplayer with WebSocket connections
- **Player Registration**: Upload custom avatar images and enter player names
- **Randomized Elements**: 
  - Character abilities (Archery, Sword Fighting, Stealth, etc.)
  - District assignments (12 districts from the books)
  - Arena generation with different terrains
  - Weapon spawns at the cornucopia (3 random weapons)
  - Animal spawns with different danger levels

### Game Mechanics
- **Movement**: WASD controls for character movement
- **Survival Stats**: Health, Food, and Immune system levels that affect gameplay
- **Proximity System**: Players and animals only visible when close enough
- **Combat**: Attack nearby players with spacebar
- **Weapon System**: Pick up weapons from the cornucopia for combat advantages
- **Arena Terrains**: Sand (tan), Water (light blue), Forest (trees)
- **Countdown**: 10-second countdown before the games begin

### Game States
- **Lobby**: Wait for players to join (minimum 2 for testing)
- **Active Game**: Real-time gameplay with movement and combat
- **Spectator Mode**: Eliminated players can watch the remaining game
- **Game Over**: Results screen with winner announcement

## Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

1. **Join Game**: Enter your name and upload an avatar image
2. **Wait for Players**: Game needs minimum 2 players to start
3. **Game Start**: You'll be assigned a random district and ability
4. **Countdown**: 10-second countdown at the cornucopia
5. **Survival**: Use WASD to move, manage your health/food/immune stats
6. **Combat**: Get close to other players and press spacebar to attack
7. **Weapons**: Rush to the cornucopia to grab limited weapons
8. **Win Condition**: Be the last player standing!

## Game Elements

### Districts
- District 1 (Luxury goods) through District 12 (Mining)
- Each player is randomly assigned a district

### Abilities
- Archery, Sword Fighting, Stealth, Strength, Speed
- Swimming, Climbing, Tracking, Medicine, Survival
- Hand-to-Hand Combat, Camouflage, Knives, Spears

### Weapons (3 random at cornucopia)
- Bow and Arrows, Sword, Spear, Knife, Axe
- Mace, Trident, Crossbow, Dagger

### Animals
- Wolf, Bear, Tracker Jacker, Muttation, Snake
- Each with different danger and speed levels

## Technical Details

### Backend
- Node.js with Express server
- Socket.io for real-time multiplayer
- Multer for image upload handling
- Game state management and collision detection

### Frontend
- HTML5 Canvas for game rendering
- Real-time WebSocket communication
- Responsive design for different screen sizes
- Image preview and upload functionality

### Architecture
- Client-server architecture with authoritative server
- Real-time game state synchronization
- Proximity-based visibility system
- Spectator mode for eliminated players

## Development

For development with auto-restart:
```bash
npm run dev
```

## Social Media Integration

The game is designed to be shareable on social media platforms. Players can:
- Share their game results
- Upload custom avatar images
- Play with friends by sharing the game URL

## Browser Requirements

- Modern web browser with HTML5 Canvas support
- JavaScript enabled
- File upload support for avatar images
- WebSocket support for real-time multiplayer

Enjoy the Hunger Games Simulator! May the odds be ever in your favor! 🏹
