// 3D Hunger Games Simulator
class HungerGamesClient {
    constructor() {
        this.socket = io();
        this.currentPlayer = null;
        this.gameState = null;
        this.keys = {};
        this.spectatorMode = false;
        this.countdownActive = false;
        this.gameStarted = false;
        this.inventory = [];
        this.selectedItemIndex = 0;
        this.isMobile = this.detectMobile();
        
        // Animal Selection System
        this.animalDatabase = new AnimalModelDatabase();
        this.animalGenerator = new AnimalModelGenerator();
        this.selectedAnimal = null;
        this.previewScene = null;
        this.previewCamera = null;
        this.previewRenderer = null;
        this.currentCategory = 'all';
        this.currentSearch = '';
        
        // 3D Engine Components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.playerMeshes = new Map();
        this.itemMeshes = new Map();
        this.animalMeshes = new Map();
        this.terrain = null;
        this.cornucopia = null;
        
        // 3D Settings
        this.cameraMode = 'third-person'; // 'first-person' or 'third-person'
        this.mouseLocked = false;
        
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
            if (data.selectedAnimals) {
                this.updateAnimalAvailability(data.selectedAnimals);
            }
        });

        this.socket.on('animalTaken', (data) => {
            alert(`The ${data.animalId} has already been selected by another player. Please choose a different animal.`);
            this.selectedAnimal = null;
            this.displayAnimals();
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

        // Animal selection system
        this.setupAnimalSelector();

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
            
            // Switch camera mode with C key
            if (e.key.toLowerCase() === 'c' && this.gameStarted) {
                this.switchCameraMode();
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
                <button class="action-btn" id="cameraSwitchBtn">Camera</button>
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

        document.getElementById('cameraSwitchBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameStarted) {
                this.switchCameraMode();
            }
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.spectatorCanvas = document.getElementById('spectatorCanvas');
        this.setup3D();
    }

    setup3D() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(this.canvas.parentElement.clientWidth, this.canvas.parentElement.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB); // Sky blue
        
        // Add lights
        this.setupLighting();
        
        // Setup controls
        this.setupControls();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse lock for first-person mode
        if (!this.isMobile) {
            this.canvas.addEventListener('click', () => {
                if (this.cameraMode === 'first-person') {
                    this.canvas.requestPointerLock();
                }
            });
            
            document.addEventListener('pointerlockchange', () => {
                this.mouseLocked = document.pointerLockElement === this.canvas;
            });
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    setupControls() {
        if (!this.isMobile) {
            // Desktop - we'll handle movement manually for better control
            this.controls = null; // We'll implement custom controls
        }
    }

    onWindowResize() {
        const container = this.canvas.parentElement;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    setupAnimalSelector() {
        this.setupAnimalPreview();
        this.setupSearchAndFilters();
        this.displayAnimals();
    }

    setupAnimalPreview() {
        // Setup 3D preview canvas for selected animal
        const canvas = document.getElementById('animalPreviewCanvas');
        this.previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.previewRenderer.setSize(150, 150);
        this.previewRenderer.shadowMap.enabled = true;
        this.previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Preview scene
        this.previewScene = new THREE.Scene();

        // Preview camera
        this.previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
        this.previewCamera.position.set(2, 2, 2);
        this.previewCamera.lookAt(0, 0.5, 0);

        // Preview lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.previewScene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.previewScene.add(directionalLight);

        // Preview animation loop
        const animatePreview = () => {
            requestAnimationFrame(animatePreview);
            
            // Rotate the selected animal slowly
            if (this.selectedAnimal && this.previewScene.children.length > 2) {
                this.previewScene.children[2].rotation.y += 0.01;
            }
            
            this.previewRenderer.render(this.previewScene, this.previewCamera);
        };
        animatePreview();
    }

    setupSearchAndFilters() {
        // Search functionality
        const searchInput = document.getElementById('animalSearch');
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.displayAnimals();
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.displayAnimals();
            });
        });
    }

    displayAnimals() {
        const grid = document.getElementById('animalGrid');
        grid.innerHTML = '';

        let animals;
        if (this.currentCategory === 'all') {
            animals = this.currentSearch ? 
                this.animalDatabase.searchAnimals(this.currentSearch) : 
                this.animalDatabase.getAvailableAnimals();
        } else {
            animals = this.animalDatabase.getAnimalsByCategory(this.currentCategory);
            if (this.currentSearch) {
                animals = animals.filter(animal => 
                    animal.name.toLowerCase().includes(this.currentSearch.toLowerCase())
                );
            }
        }

        animals.forEach(animal => {
            const card = document.createElement('div');
            card.className = 'animal-card';
            if (this.selectedAnimal && this.selectedAnimal.id === animal.id) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <div class="animal-preview-mini" style="background-color: ${animal.color};">
                    ${this.getAnimalEmoji(animal)}
                </div>
                <h4>${animal.name}</h4>
                <p>${animal.category}${animal.subcategory ? ' - ' + animal.subcategory : ''}</p>
            `;

            card.addEventListener('click', () => {
                this.selectAnimal(animal);
            });

            grid.appendChild(card);
        });

        // Update display count
        const count = animals.length;
        if (count === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #bdc3c7; padding: 2rem;">No animals found matching your search.</div>';
        }
    }

    getAnimalEmoji(animal) {
        // Simple emoji mapping for visual preview
        const emojiMap = {
            // Humans
            'human_male': '👨', 'human_female': '👩', 'athlete': '🏃‍♂️', 'survivor': '🧗‍♂️',
            'tribute_district1': '👑', 'tribute_district2': '⚒️', 'tribute_district4': '🎣',
            'tribute_district11': '🌾', 'tribute_district12': '⛏️', 'career_tribute': '⚔️',
            
            // Mammals
            'lion': '🦁', 'tiger': '🐅', 'leopard': '🐆', 'cheetah': '🐆', 'elephant': '🐘',
            'grizzly': '🐻', 'polarbear': '🐻‍❄️', 'blackbear': '🐻', 'pandabear': '🐼',
            'wolf': '🐺', 'fox': '🦊', 'arcticfox': '🦊', 'fennecfox': '🦊',
            'deer': '🦌', 'elk': '🦌', 'moose': '🫎', 'horse': '🐎',
            'zebra': '🦓', 'giraffe': '🦒', 'rhinoceros': '🦏', 'hippopotamus': '🦛',
            'chimpanzee': '🐒', 'gorilla': '🦍', 'orangutan': '🦧', 'lemur': '🐒',
            'buffalo': '🦌', 'wildebeest': '🐂', 'gazelle': '🦌', 'antelope': '�',
            
            // Birds
            'eagle': '🦅', 'owl': '🦉', 'hawk': '🦅', 'falcon': '🦅', 'vulture': '🦅',
            'peacock': '🦚', 'parrot': '🦜', 'toucan': '🦜', 'penguin': '🐧',
            'duck': '🦆', 'goose': '🪿', 'swan': '🦢', 'flamingo': '🦩', 
            'ostrich': '🦓', 'emu': '🦅', 'cassowary': '🦅',
            
            // Reptiles
            'python': '🐍', 'cobra': '🐍', 'viper': '🐍', 'rattlesnake': '🐍', 'anaconda': '🐍', 'mamba': '🐍',
            'iguana': '🦎', 'komodo': '🦎', 'gecko': '🦎', 'chameleon': '🦎', 'monitor': '🦎',
            'alligator': '🐊', 'crocodile': '🐊', 'caiman': '🐊', 'gharial': '🐊',
            'seaturtle': '🐢', 'snappingturtle': '🐢', 'tortoise': '🐢', 'boxturtle': '🐢',
            
            // Amphibians  
            'frog': '🐸', 'toad': '🐸', 'salamander': '🦎', 'axolotl': '🦎',
            
            // Fish
            'shark': '🦈', 'barracuda': '🐟', 'pike': '🐟', 'bass': '🐟',
            'angelfish': '🐠', 'clownfish': '🐠', 'tang': '🐠', 'pufferfish': '🐡',
            
            // Marine mammals
            'whale': '🐋', 'dolphin': '🐬', 'seal': '🦭', 'walrus': '🦭', 'otter': '🦦', 'manatee': '🐋',
            
            // Arthropods
            'spider': '🕷️', 'scorpion': '🦂', 'crab': '🦀', 'lobster': '🦞',
            
            // Mythical
            'dragon': '🐲', 'phoenix': '🔥', 'griffin': '🦅', 'unicorn': '🦄'
        };
        
        return emojiMap[animal.id] || (animal.category === 'humans' ? '👤' : '🐾');
    }

    selectAnimal(animal) {
        // Update selection in database
        if (this.selectedAnimal) {
            this.animalDatabase.releaseAnimal(this.selectedAnimal.id);
        }
        
        this.selectedAnimal = animal;
        this.animalDatabase.selectAnimal(animal.id);
        
        // Update UI
        document.querySelectorAll('.animal-card').forEach(card => card.classList.remove('selected'));
        event.currentTarget.classList.add('selected');
        
        // Show selected animal preview
        this.showAnimalPreview(animal);
    }

    showAnimalPreview(animal) {
        const selectedDiv = document.getElementById('selectedAnimal');
        selectedDiv.style.display = 'block';
        
        document.getElementById('selectedAnimalName').textContent = animal.name;
        document.getElementById('selectedAnimalCategory').textContent = 
            `${animal.category}${animal.subcategory ? ' - ' + animal.subcategory : ''}`;

        // Clear previous preview model
        while (this.previewScene.children.length > 2) {
            this.previewScene.remove(this.previewScene.children[2]);
        }

        // Add new 3D model to preview
        const animalModel = this.animalGenerator.createPreviewModel(animal);
        this.previewScene.add(animalModel);
    }

    joinGame() {
        const name = document.getElementById('playerName').value.trim();

        if (!name || !this.selectedAnimal) {
            alert('Please enter your name and select an animal.');
            return;
        }

        const playerData = {
            name: name,
            animalId: this.selectedAnimal.id,
            animalData: this.selectedAnimal
        };
        
        this.socket.emit('joinGame', playerData);
    }

    updatePlayersList(players, count) {
        const playersList = document.getElementById('playersList');
        const playerCount = document.getElementById('playerCount');
        const startButton = document.getElementById('startGame');

        playersList.innerHTML = '';
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            
            const animalEmoji = this.getAnimalEmoji(player.animalData || { id: 'unknown' });
            playerDiv.innerHTML = `
                <div class="player-avatar" style="background-color: ${player.animalData?.color || '#8B4513'};">
                    ${animalEmoji}
                </div>
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-animal">${player.animalData?.name || 'Unknown Animal'}</span>
                </div>
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

    updateAnimalAvailability(selectedAnimals) {
        // Update the animal database with currently selected animals
        this.animalDatabase.resetSelections();
        selectedAnimals.forEach(animalId => {
            this.animalDatabase.selectAnimal(animalId);
        });
        
        // Refresh the display if we're still in the lobby
        if (document.getElementById('lobby').classList.contains('active')) {
            this.displayAnimals();
        }
    }

    showGameScreen() {
        document.getElementById('lobby').classList.remove('active');
        document.getElementById('gameScreen').classList.add('active');
        this.create3DArena();
    }

    create3DArena() {
        // Create terrain
        this.createTerrain();
        
        // Create cornucopia
        this.createCornucopia();
        
        // Create environment elements
        this.createEnvironment();
    }

    createTerrain() {
        // Create large ground plane
        const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        
        // Create height variation
        const vertices = groundGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            // Add some random height variation
            vertices[i + 2] = Math.random() * 2 - 1; // Z coordinate (height)
        }
        groundGeometry.attributes.position.needsUpdate = true;
        groundGeometry.computeVertexNormals();
        
        // Create ground material with texture-like appearance
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8FBC8F, // Forest green
            wireframe: false 
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        this.terrain = ground;
    }

    createCornucopia() {
        // Create golden cornucopia at center
        const cornucopiaGroup = new THREE.Group();
        
        // Main horn shape
        const hornGeometry = new THREE.ConeGeometry(8, 12, 8);
        const hornMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700, // Gold
            shininess: 100 
        });
        const horn = new THREE.Mesh(hornGeometry, hornMaterial);
        horn.position.set(0, 6, 0);
        horn.rotation.z = Math.PI / 6; // Tilt it
        horn.castShadow = true;
        cornucopiaGroup.add(horn);
        
        // Base platform
        const baseGeometry = new THREE.CylinderGeometry(12, 12, 2, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xCD853F }); // Peru
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 1, 0);
        base.receiveShadow = true;
        cornucopiaGroup.add(base);
        
        this.scene.add(cornucopiaGroup);
        this.cornucopia = cornucopiaGroup;
    }

    createEnvironment() {
        // Add trees around the arena
        for (let i = 0; i < 50; i++) {
            this.createTree(
                (Math.random() - 0.5) * 180, // X position
                (Math.random() - 0.5) * 180  // Z position
            );
        }
        
        // Add rocks
        for (let i = 0; i < 20; i++) {
            this.createRock(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 150
            );
        }
    }

    createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 6);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 3, 0);
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(4);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(0, 8, 0);
        leaves.castShadow = true;
        treeGroup.add(leaves);
        
        treeGroup.position.set(x, 0, z);
        this.scene.add(treeGroup);
    }

    createRock(x, z) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 }); // Dim gray
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 1, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
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
        
        // Reset animal selection
        this.selectedAnimal = null;
        this.animalDatabase.resetSelections();
        document.getElementById('selectedAnimal').style.display = 'none';
        this.displayAnimals();
        
        this.currentPlayer = null;
        this.gameState = null;
        this.spectatorMode = false;
        this.gameStarted = false;
        this.countdownActive = false;
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
            dx *= 0.707;
            dy *= 0.707;
        }

        if (dx !== 0 || dy !== 0) {
            const newX = Math.max(0, Math.min(800, this.currentPlayer.x + dx));
            const newY = Math.max(0, Math.min(600, this.currentPlayer.y + dy));
            
            // Update position locally
            this.currentPlayer.x = newX;
            this.currentPlayer.y = newY;
            
            // Update 3D camera to follow player
            this.update3DCamera();
            
            // Send to server
            this.socket.emit('playerMove', { x: newX, y: newY });
        }
    }

    update3DCamera() {
        if (!this.currentPlayer || !this.camera) return;
        
        const playerMesh = this.playerMeshes.get(this.currentPlayer.id);
        if (!playerMesh) return;
        
        const playerPos = playerMesh.position;
        
        if (this.cameraMode === 'third-person') {
            // Third-person camera - follow behind and above
            const offset = new THREE.Vector3(0, 8, 12);
            this.camera.position.set(
                playerPos.x + offset.x,
                playerPos.y + offset.y,
                playerPos.z + offset.z
            );
            this.camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
            
        } else if (this.cameraMode === 'first-person') {
            // First-person camera - at player head level
            this.camera.position.set(
                playerPos.x,
                playerPos.y + 4.5, // Head height
                playerPos.z
            );
            
            // Look direction based on mouse movement (if mouse is locked)
            if (this.mouseLocked) {
                // Mouse look would be implemented here
            }
        }
    }

    switchCameraMode() {
        this.cameraMode = this.cameraMode === 'third-person' ? 'first-person' : 'third-person';
        this.update3DCamera();
        
        // Show/hide crosshair
        const crosshair = document.getElementById('crosshair');
        crosshair.style.display = this.cameraMode === 'first-person' ? 'block' : 'none';
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
        if (!this.renderer || !this.scene || !this.camera) return;

        // Update 3D elements
        if (this.gameState) {
            // Update players
            if (this.gameState.players) {
                this.gameState.players.forEach(player => {
                    if (player.alive) {
                        this.update3DPlayer(player);
                        if (!this.playerMeshes.has(player.id)) {
                            this.create3DPlayer(player);
                        }
                    } else {
                        // Remove dead players
                        const playerMesh = this.playerMeshes.get(player.id);
                        if (playerMesh) {
                            this.scene.remove(playerMesh);
                            this.playerMeshes.delete(player.id);
                        }
                    }
                });
            }

            // Update items
            if (this.gameState.items) {
                this.gameState.items.forEach(item => {
                    if (!item.taken && !this.itemMeshes.has(item.id)) {
                        this.create3DItem(item);
                    } else if (item.taken && this.itemMeshes.has(item.id)) {
                        // Remove taken items
                        const itemMesh = this.itemMeshes.get(item.id);
                        this.scene.remove(itemMesh);
                        this.itemMeshes.delete(item.id);
                    }
                });
            }

            // Animate items
            this.animate3DItems();
            
            // Update camera to follow player
            this.update3DCamera();
        }

        // Render the 3D scene
        this.renderer.render(this.scene, this.camera);
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

    create3DItem(item) {
        if (this.itemMeshes.has(item.id) || item.taken) {
            return;
        }
        
        const itemGroup = new THREE.Group();
        let geometry, material;
        
        switch (item.type) {
            case 'weapon':
                // Create weapon models
                if (item.name.includes('Sword')) {
                    geometry = new THREE.BoxGeometry(0.2, 3, 0.1);
                    material = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 }); // Silver
                } else if (item.name.includes('Bow')) {
                    geometry = new THREE.TorusGeometry(1, 0.1, 8, 16);
                    material = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); // Brown
                } else if (item.name.includes('Spear')) {
                    geometry = new THREE.CylinderGeometry(0.05, 0.05, 4);
                    material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
                } else {
                    // Default weapon
                    geometry = new THREE.BoxGeometry(0.5, 0.5, 1.5);
                    material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                }
                break;
                
            case 'resource':
                // Create resource models
                if (item.name.includes('Food') || item.name.includes('Energy')) {
                    geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
                    material = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
                } else if (item.name.includes('Medicine') || item.name.includes('Aid')) {
                    geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8);
                    material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
                } else {
                    geometry = new THREE.SphereGeometry(0.5);
                    material = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
                }
                break;
                
            case 'random':
                // Create special item models
                geometry = new THREE.OctahedronGeometry(0.6);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x00FFFF,
                    transparent: true,
                    opacity: 0.8
                });
                break;
                
            default:
                geometry = new THREE.SphereGeometry(0.5);
                material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, 0);
        mesh.castShadow = true;
        itemGroup.add(mesh);
        
        // Add floating animation
        mesh.userData.originalY = 1;
        mesh.userData.floatOffset = Math.random() * Math.PI * 2;
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: material.color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0, 1, 0);
        itemGroup.add(glow);
        
        // Position in 3D space
        itemGroup.position.set(
            (item.x - 400) / 10,
            0,
            (item.y - 300) / 10
        );
        
        this.scene.add(itemGroup);
        this.itemMeshes.set(item.id, itemGroup);
    }

    animate3DItems() {
        const time = Date.now() * 0.001;
        
        this.itemMeshes.forEach((itemGroup) => {
            const mesh = itemGroup.children[0];
            if (mesh && mesh.userData.originalY !== undefined) {
                // Floating animation
                mesh.position.y = mesh.userData.originalY + Math.sin(time * 2 + mesh.userData.floatOffset) * 0.3;
                
                // Rotation
                mesh.rotation.y += 0.02;
            }
        });
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

    create3DPlayer(player) {
        if (this.playerMeshes.has(player.id)) {
            return this.playerMeshes.get(player.id);
        }
        
        const playerGroup = new THREE.Group();
        
        // Create 3D animal model instead of humanoid
        if (player.animalData) {
            const animalModel = this.animalGenerator.createAnimalModel(player.animalData);
            
            // Add highlight for current player
            if (player.id === this.socket.id) {
                const highlightGeometry = new THREE.SphereGeometry(2, 16, 8);
                const highlightMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xe74c3c,
                    transparent: true,
                    opacity: 0.3,
                    wireframe: true
                });
                const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                highlight.position.y = 1;
                playerGroup.add(highlight);
            }
            
            playerGroup.add(animalModel);
        } else {
            // Fallback to basic model if no animal data
            const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: player.id === this.socket.id ? 0xe74c3c : 0x3498db 
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 1, 0);
            body.castShadow = true;
            playerGroup.add(body);
        }
        
        // Name tag
        this.createNameTag(player.name, playerGroup);
        
        // Health bar
        this.create3DHealthBar(player, playerGroup);
        
        // Position player in 3D space
        playerGroup.position.set(
            (player.x - 400) / 10, // Convert 2D coordinates to 3D scale
            0,
            (player.y - 300) / 10
        );
        
        this.scene.add(playerGroup);
        this.playerMeshes.set(player.id, playerGroup);
        
        return playerGroup;
    }

    createNameTag(name, parent) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(name, canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });
        
        const geometry = new THREE.PlaneGeometry(4, 1);
        const nameTag = new THREE.Mesh(geometry, material);
        nameTag.position.set(0, 6, 0);
        nameTag.lookAt(nameTag.position.clone().add(new THREE.Vector3(0, 0, 1)));
        
        parent.add(nameTag);
    }

    create3DHealthBar(player, parent) {
        // Background bar
        const bgGeometry = new THREE.PlaneGeometry(3, 0.3);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
        bgBar.position.set(0, 5.5, 0.1);
        parent.add(bgBar);
        
        // Health bar
        const healthGeometry = new THREE.PlaneGeometry(3 * (player.health / 100), 0.25);
        const healthColor = player.health > 50 ? 0x00ff00 : player.health > 25 ? 0xffff00 : 0xff0000;
        const healthMaterial = new THREE.MeshBasicMaterial({ color: healthColor });
        const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        healthBar.position.set(0, 5.5, 0.2);
        parent.add(healthBar);
        
        // Store reference for updates
        parent.userData.healthBar = healthBar;
        parent.userData.healthGeometry = healthGeometry;
    }

    update3DPlayer(player) {
        const playerMesh = this.playerMeshes.get(player.id);
        if (!playerMesh) return;
        
        // Update position
        playerMesh.position.set(
            (player.x - 400) / 10,
            0,
            (player.y - 300) / 10
        );
        
        // Update health bar
        if (playerMesh.userData.healthBar) {
            const healthPercent = player.health / 100;
            const newScale = Math.max(0.01, healthPercent);
            playerMesh.userData.healthBar.scale.x = newScale;
            
            // Update color
            const healthColor = player.health > 50 ? 0x00ff00 : player.health > 25 ? 0xffff00 : 0xff0000;
            playerMesh.userData.healthBar.material.color.setHex(healthColor);
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
