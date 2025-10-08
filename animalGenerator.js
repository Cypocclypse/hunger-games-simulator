// 3D Animal Model Generator for Three.js
class AnimalModelGenerator {
    constructor() {
        this.materials = {};
        this.geometries = {};
        this.initializeMaterials();
    }

    initializeMaterials() {
        // Pre-create common materials for better performance with realistic textures
        this.materials = {
            // Fur materials with different textures
            furShort: new THREE.MeshPhongMaterial({ 
                roughness: 0.9, 
                shininess: 5,
                bumpScale: 0.3 
            }),
            furLong: new THREE.MeshPhongMaterial({ 
                roughness: 0.95, 
                shininess: 2,
                bumpScale: 0.5 
            }),
            furWool: new THREE.MeshLambertMaterial({ 
                roughness: 1.0,
                transparent: true,
                opacity: 0.95 
            }),
            
            // Scale materials
            scalesSmooth: new THREE.MeshPhongMaterial({ 
                roughness: 0.1, 
                shininess: 100,
                metalness: 0.3 
            }),
            scalesRough: new THREE.MeshPhongMaterial({ 
                roughness: 0.4, 
                shininess: 30,
                bumpScale: 0.2 
            }),
            
            // Feather materials
            feathersSmooth: new THREE.MeshPhongMaterial({ 
                roughness: 0.6, 
                shininess: 20,
                transparent: true,
                opacity: 0.9 
            }),
            feathersDown: new THREE.MeshLambertMaterial({ 
                roughness: 0.9,
                transparent: true,
                opacity: 0.8 
            }),
            
            // Skin and hide materials
            skinSmooth: new THREE.MeshPhongMaterial({ 
                roughness: 0.4, 
                shininess: 50 
            }),
            skinRough: new THREE.MeshLambertMaterial({ 
                roughness: 0.8 
            }),
            hide: new THREE.MeshLambertMaterial({ 
                roughness: 0.9 
            }),
            
            // Special materials
            wet: new THREE.MeshPhongMaterial({ 
                roughness: 0.1, 
                shininess: 200,
                transparent: true,
                opacity: 0.95 
            }),
            shell: new THREE.MeshPhongMaterial({ 
                roughness: 0.2, 
                shininess: 80,
                metalness: 0.1 
            }),
            horn: new THREE.MeshPhongMaterial({ 
                roughness: 0.3, 
                shininess: 60 
            })
        };
        
        // Create procedural textures
        this.createProceduralTextures();
    }

    createProceduralTextures() {
        this.textures = {};
        
        // Fur texture
        this.textures.fur = this.generateFurTexture();
        
        // Scale texture
        this.textures.scales = this.generateScaleTexture();
        
        // Feather texture
        this.textures.feathers = this.generateFeatherTexture();
        
        // Spot pattern
        this.textures.spots = this.generateSpotTexture();
        
        // Stripe pattern
        this.textures.stripes = this.generateStripeTexture();
    }

    generateFurTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create fur-like noise pattern
        const imageData = ctx.createImageData(256, 256);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 0.3 + 0.7;
            const gray = Math.floor(255 * noise);
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
            data[i + 3] = 255;  // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    generateScaleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#404040';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw scale pattern
        for (let y = 0; y < 256; y += 16) {
            for (let x = 0; x < 256; x += 16) {
                const offset = (y / 16) % 2 === 0 ? 0 : 8;
                ctx.fillStyle = `hsl(${Math.random() * 20 + 50}, 30%, ${Math.random() * 20 + 40}%)`;
                ctx.beginPath();
                ctx.arc(x + offset, y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(x + offset - 2, y - 2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    generateFeatherTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#606060';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw feather-like lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const length = Math.random() * 30 + 10;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    generateSpotTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw spots
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 15 + 5;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    generateStripeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, 256, 256);
        
        // Draw stripes
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        for (let i = 0; i < 256; i += 20) {
            ctx.fillRect(i, 0, 10, 256);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 3);
        return texture;
    }

    createAnimalModel(animalData) {
        const group = new THREE.Group();
        group.userData = { animalData };

        switch(animalData.category) {
            case 'humans':
                return this.createHuman(animalData, group);
            case 'mammals':
                return this.createMammal(animalData, group);
            case 'birds':
                return this.createBird(animalData, group);
            case 'reptiles':
                return this.createReptile(animalData, group);
            case 'amphibians':
                return this.createAmphibian(animalData, group);
            case 'fish':
                return this.createFish(animalData, group);
            case 'arthropods':
                return this.createArthropod(animalData, group);
            case 'mythical':
                return this.createMythical(animalData, group);
            default:
                return this.createGenericAnimal(animalData, group);
        }
    }

    createMammal(data, group) {
        // Choose appropriate material based on animal type
        const bodyMaterial = this.getMammalMaterial(data);
        bodyMaterial.color.setHex(parseInt(data.color?.replace('#', '0x') || '0x8B4513'));

        // Body (main torso) with realistic proportions
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * data.size, 0.8 * data.size, 12, 24);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4 * data.size;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head with proper sizing
        const headSize = this.getHeadSize(data);
        const headGeometry = new THREE.SphereGeometry(headSize * data.size, 20, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, (0.8 + headSize) * data.size, 0.6 * data.size);
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Legs with proper animal anatomy
        const legGeometry = new THREE.CapsuleGeometry(0.08 * data.size, 0.6 * data.size, 8, 12);
        const legPositions = this.getLegPositions(data);
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(pos[0] * data.size, pos[1] * data.size, pos[2] * data.size);
            leg.castShadow = true;
            leg.receiveShadow = true;
            group.add(leg);
        });

        // Add realistic ears
        this.addRealisticEars(data, group, bodyMaterial);

        // Add tail
        this.addTail(data, group, bodyMaterial);

        // Add specific features based on subcategory
        this.addMammalFeatures(data, group, bodyMaterial);

        // Add fur details and patterns
        this.addFurDetails(data, group);

        return group;
    }

    getMammalMaterial(data) {
        switch(data.subcategory) {
            case 'feline':
            case 'canine':
                return this.materials.furShort.clone();
            case 'bear':
                return this.materials.furLong.clone();
            case 'primate':
                return this.materials.skinRough.clone();
            case 'ungulate':
                return data.id === 'elephant' ? this.materials.skinRough.clone() : this.materials.furShort.clone();
            case 'marine':
                return this.materials.wet.clone();
            case 'rodent':
                return this.materials.furWool.clone();
            default:
                return this.materials.furShort.clone();
        }
    }

    getHeadSize(data) {
        const headSizes = {
            'elephant': 0.8,
            'hippopotamus': 0.7,
            'rhinoceros': 0.6,
            'giraffe': 0.3,
            'mouse': 0.3,
            'bear': 0.5,
            'lion': 0.45,
            'wolf': 0.4
        };
        return headSizes[data.id] || 0.4;
    }

    getLegPositions(data) {
        // Different leg positions for different animal types
        if (data.subcategory === 'ungulate') {
            return [
                [-0.15, 0.3, 0.4],  // Narrower stance for hoofed animals
                [0.15, 0.3, 0.4],
                [-0.15, 0.3, -0.4],
                [0.15, 0.3, -0.4]
            ];
        } else if (data.subcategory === 'feline') {
            return [
                [-0.2, 0.25, 0.3],  // Lower, more agile stance
                [0.2, 0.25, 0.3],
                [-0.2, 0.25, -0.3],
                [0.2, 0.25, -0.3]
            ];
        } else {
            return [
                [-0.2, 0.3, 0.3],   // Standard mammal stance
                [0.2, 0.3, 0.3],
                [-0.2, 0.3, -0.3],
                [0.2, 0.3, -0.3]
            ];
        }
    }

    addRealisticEars(data, group, baseMaterial) {
        const earMaterial = baseMaterial.clone();
        let earGeometry, earScale = 1, earPosition = [0.25, 1.3, 0.6];
        
        switch(data.subcategory) {
            case 'feline':
                earGeometry = new THREE.ConeGeometry(0.12 * data.size, 0.2 * data.size, 6);
                break;
            case 'canine':
                if (data.id === 'fennecfox') {
                    earGeometry = new THREE.ConeGeometry(0.15 * data.size, 0.4 * data.size, 8);
                    earScale = 1.5;
                } else {
                    earGeometry = new THREE.ConeGeometry(0.1 * data.size, 0.25 * data.size, 6);
                }
                break;
            case 'bear':
                earGeometry = new THREE.SphereGeometry(0.12 * data.size, 8, 6);
                break;
            case 'ungulate':
                if (data.id === 'elephant') {
                    earGeometry = new THREE.SphereGeometry(0.4 * data.size, 12, 8);
                    earGeometry.scale(0.1, 1, 1.5);
                    earScale = 1;
                } else {
                    earGeometry = new THREE.ConeGeometry(0.08 * data.size, 0.15 * data.size, 6);
                }
                break;
            default:
                earGeometry = new THREE.ConeGeometry(0.1 * data.size, 0.15 * data.size, 6);
        }

        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        
        leftEar.position.set(-earPosition[0] * data.size, earPosition[1] * data.size, earPosition[2] * data.size);
        rightEar.position.set(earPosition[0] * data.size, earPosition[1] * data.size, earPosition[2] * data.size);
        
        leftEar.scale.multiplyScalar(earScale);
        rightEar.scale.multiplyScalar(earScale);
        
        leftEar.castShadow = true;
        rightEar.castShadow = true;
        
        group.add(leftEar, rightEar);
    }

    addTail(data, group, baseMaterial) {
        const tailMaterial = baseMaterial.clone();
        let tailGeometry;
        
        if (data.subcategory === 'feline') {
            tailGeometry = new THREE.CapsuleGeometry(0.06 * data.size, 0.8 * data.size, 6, 12);
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0.6 * data.size, -0.8 * data.size);
            tail.rotation.x = Math.PI / 4;
            tail.castShadow = true;
            group.add(tail);
        } else if (data.subcategory === 'canine') {
            tailGeometry = new THREE.CapsuleGeometry(0.08 * data.size, 0.6 * data.size, 6, 12);
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0.7 * data.size, -0.7 * data.size);
            tail.rotation.x = Math.PI / 6;
            tail.castShadow = true;
            group.add(tail);
            
            // Fox tail tip
            if (data.tail === '#FFFFFF') {
                const tipMaterial = this.materials.furLong.clone();
                tipMaterial.color.setHex(0xFFFFFF);
                const tipGeometry = new THREE.SphereGeometry(0.12 * data.size, 8, 6);
                const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                tip.position.set(0, 1.0 * data.size, -1.0 * data.size);
                group.add(tip);
            }
        }
    }

    addFurDetails(data, group) {
        // Add fur texture details
        if (data.stripes) {
            this.addStripePattern(data, group);
        }
        if (data.spots || data.rosettes) {
            this.addSpotPattern(data, group);
        }
        
        // Add whiskers for appropriate animals
        if (data.subcategory === 'feline' || data.subcategory === 'rodent') {
            this.addWhiskers(data, group);
        }
    }

    addStripePattern(data, group) {
        const stripeMaterial = new THREE.MeshBasicMaterial({
            color: data.stripes || '#000000',
            transparent: true,
            opacity: 0.8
        });
        stripeMaterial.map = this.textures.stripes;
        
        // Apply stripes to body
        const stripeGeometry = new THREE.CapsuleGeometry(0.31 * data.size, 0.81 * data.size, 8, 16);
        const stripes = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripes.position.y = 0.4 * data.size;
        group.add(stripes);
    }

    addSpotPattern(data, group) {
        const spotMaterial = new THREE.MeshBasicMaterial({
            color: data.spots || data.rosettes || '#000000',
            transparent: true,
            opacity: 0.7
        });
        spotMaterial.map = this.textures.spots;
        
        // Apply spots to body
        const spotGeometry = new THREE.CapsuleGeometry(0.31 * data.size, 0.81 * data.size, 8, 16);
        const spots = new THREE.Mesh(spotGeometry, spotMaterial);
        spots.position.y = 0.4 * data.size;
        group.add(spots);
    }

    addWhiskers(data, group) {
        const whiskerMaterial = new THREE.MeshBasicMaterial({ color: '#333333' });
        const whiskerGeometry = new THREE.CylinderGeometry(0.005 * data.size, 0.005 * data.size, 0.3 * data.size, 4);
        
        // Add 6 whiskers (3 on each side)
        for (let i = 0; i < 6; i++) {
            const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
            const side = i < 3 ? -1 : 1;
            const offset = (i % 3) * 0.05 - 0.05;
            
            whisker.position.set(
                side * 0.4 * data.size,
                1.1 * data.size + offset,
                0.8 * data.size
            );
            whisker.rotation.y = side * Math.PI / 6;
            whisker.rotation.z = offset;
            
            group.add(whisker);
        }
    }

    addMammalFeatures(data, group, baseMaterial) {
        switch(data.subcategory) {
            case 'feline':
                this.addFelineFeatures(data, group, baseMaterial);
                break;
            case 'canine':
                this.addCanineFeatures(data, group, baseMaterial);
                break;
            case 'bear':
                this.addBearFeatures(data, group, baseMaterial);
                break;
            case 'primate':
                this.addPrimateFeatures(data, group, baseMaterial);
                break;
            case 'ungulate':
                this.addUngulateFeatures(data, group, baseMaterial);
                break;
            case 'marine':
                this.addMarineFeatures(data, group, baseMaterial);
                break;
            case 'rodent':
                this.addRodentFeatures(data, group, baseMaterial);
                break;
        }
    }

    addFelineFeatures(data, group, baseMaterial) {
        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.08 * data.size, 0.8 * data.size, 8);
        const tail = new THREE.Mesh(tailGeometry, baseMaterial);
        tail.position.set(0, 0.5 * data.size, -0.8 * data.size);
        tail.rotation.x = Math.PI / 6;
        group.add(tail);

        // Ears
        const earGeometry = new THREE.ConeGeometry(0.1 * data.size, 0.15 * data.size, 6);
        const leftEar = new THREE.Mesh(earGeometry, baseMaterial);
        const rightEar = new THREE.Mesh(earGeometry, baseMaterial);
        leftEar.position.set(-0.2 * data.size, 1.3 * data.size, 0.6 * data.size);
        rightEar.position.set(0.2 * data.size, 1.3 * data.size, 0.6 * data.size);
        group.add(leftEar, rightEar);

        // Mane for lions
        if (data.id === 'lion' && data.mane) {
            const maneMaterial = new THREE.MeshLambertMaterial({ color: data.mane });
            const maneGeometry = new THREE.SphereGeometry(0.6 * data.size, 16, 12);
            const mane = new THREE.Mesh(maneGeometry, maneMaterial);
            mane.position.set(0, 1.1 * data.size, 0.6 * data.size);
            group.add(mane);
        }

        // Stripes or spots
        if (data.stripes || data.spots) {
            this.addPattern(group, data);
        }
    }

    addCanineFeatures(data, group, baseMaterial) {
        // Snout
        const snoutGeometry = new THREE.CylinderGeometry(0.15 * data.size, 0.2 * data.size, 0.3 * data.size, 8);
        const snout = new THREE.Mesh(snoutGeometry, baseMaterial);
        snout.position.set(0, 1.0 * data.size, 0.8 * data.size);
        snout.rotation.x = Math.PI / 2;
        group.add(snout);

        // Ears
        const earGeometry = new THREE.ConeGeometry(0.12 * data.size, 0.2 * data.size, 6);
        const leftEar = new THREE.Mesh(earGeometry, baseMaterial);
        const rightEar = new THREE.Mesh(earGeometry, baseMaterial);
        
        // Fennec fox has large ears
        if (data.id === 'fennecfox') {
            leftEar.scale.set(2, 2, 2);
            rightEar.scale.set(2, 2, 2);
        }
        
        leftEar.position.set(-0.2 * data.size, 1.3 * data.size, 0.6 * data.size);
        rightEar.position.set(0.2 * data.size, 1.3 * data.size, 0.6 * data.size);
        group.add(leftEar, rightEar);

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.08 * data.size, 0.12 * data.size, 0.6 * data.size, 8);
        const tail = new THREE.Mesh(tailGeometry, baseMaterial);
        tail.position.set(0, 0.5 * data.size, -0.7 * data.size);
        tail.rotation.x = Math.PI / 4;
        group.add(tail);

        // White tail tip for foxes
        if (data.tail === '#FFFFFF') {
            const tipMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
            const tipGeometry = new THREE.SphereGeometry(0.1 * data.size, 8, 6);
            const tip = new THREE.Mesh(tipGeometry, tipMaterial);
            tip.position.set(0, 0.8 * data.size, -0.9 * data.size);
            group.add(tip);
        }
    }

    addBearFeatures(data, group, baseMaterial) {
        // Round ears
        const earGeometry = new THREE.SphereGeometry(0.15 * data.size, 12, 8);
        const leftEar = new THREE.Mesh(earGeometry, baseMaterial);
        const rightEar = new THREE.Mesh(earGeometry, baseMaterial);
        leftEar.position.set(-0.25 * data.size, 1.25 * data.size, 0.6 * data.size);
        rightEar.position.set(0.25 * data.size, 1.25 * data.size, 0.6 * data.size);
        group.add(leftEar, rightEar);

        // Snout
        const snoutGeometry = new THREE.CylinderGeometry(0.12 * data.size, 0.18 * data.size, 0.25 * data.size, 8);
        const snout = new THREE.Mesh(snoutGeometry, baseMaterial);
        snout.position.set(0, 1.0 * data.size, 0.75 * data.size);
        snout.rotation.x = Math.PI / 2;
        group.add(snout);

        // Panda patches
        if (data.id === 'pandabear') {
            const blackMaterial = new THREE.MeshLambertMaterial({ color: '#000000' });
            
            // Eye patches
            const eyePatchGeometry = new THREE.SphereGeometry(0.12 * data.size, 8, 6);
            const leftEyePatch = new THREE.Mesh(eyePatchGeometry, blackMaterial);
            const rightEyePatch = new THREE.Mesh(eyePatchGeometry, blackMaterial);
            leftEyePatch.position.set(-0.15 * data.size, 1.1 * data.size, 0.75 * data.size);
            rightEyePatch.position.set(0.15 * data.size, 1.1 * data.size, 0.75 * data.size);
            group.add(leftEyePatch, rightEyePatch);

            // Black ears
            leftEar.material = blackMaterial;
            rightEar.material = blackMaterial;
        }

        // Sun bear chest patch
        if (data.chest) {
            const chestMaterial = new THREE.MeshLambertMaterial({ color: data.chest });
            const chestGeometry = new THREE.SphereGeometry(0.2 * data.size, 12, 8);
            const chestPatch = new THREE.Mesh(chestGeometry, chestMaterial);
            chestPatch.position.set(0, 0.6 * data.size, 0.35 * data.size);
            chestPatch.scale.set(0.8, 0.6, 0.3);
            group.add(chestPatch);
        }
    }

    addPrimateFeatures(data, group, baseMaterial) {
        // Longer arms for primates
        const armGeometry = new THREE.CapsuleGeometry(0.06 * data.size, 0.8 * data.size, 6, 8);
        const leftArm = new THREE.Mesh(armGeometry, baseMaterial);
        const rightArm = new THREE.Mesh(armGeometry, baseMaterial);
        leftArm.position.set(-0.4 * data.size, 0.6 * data.size, 0);
        rightArm.position.set(0.4 * data.size, 0.6 * data.size, 0);
        leftArm.rotation.z = Math.PI / 6;
        rightArm.rotation.z = -Math.PI / 6;
        group.add(leftArm, rightArm);

        // Large hands
        const handGeometry = new THREE.SphereGeometry(0.08 * data.size, 8, 6);
        const leftHand = new THREE.Mesh(handGeometry, baseMaterial);
        const rightHand = new THREE.Mesh(handGeometry, baseMaterial);
        leftHand.position.set(-0.5 * data.size, 0.2 * data.size, 0.1 * data.size);
        rightHand.position.set(0.5 * data.size, 0.2 * data.size, 0.1 * data.size);
        group.add(leftHand, rightHand);

        // Distinctive face for different primates
        if (data.id === 'gorilla') {
            // Gorilla chest beating posture
            const chestGeometry = new THREE.SphereGeometry(0.4 * data.size, 12, 8);
            chestGeometry.scale(1, 1.2, 0.8);
            const chest = new THREE.Mesh(chestGeometry, baseMaterial);
            chest.position.set(0, 0.7 * data.size, 0.2 * data.size);
            group.add(chest);
        }

        if (data.tail === 'ringed' && data.id === 'lemur') {
            // Lemur striped tail
            const tailSegments = 6;
            for (let i = 0; i < tailSegments; i++) {
                const segmentMaterial = new THREE.MeshLambertMaterial({ 
                    color: i % 2 === 0 ? baseMaterial.color : '#FFFFFF' 
                });
                const segmentGeometry = new THREE.CylinderGeometry(0.04 * data.size, 0.06 * data.size, 0.15 * data.size, 8);
                const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
                segment.position.set(0, 0.3 * data.size, -0.8 * data.size - i * 0.12 * data.size);
                segment.rotation.x = Math.PI / 8;
                group.add(segment);
            }
        }
    }

    addUngulateFeatures(data, group, baseMaterial) {
        // Hooves instead of regular feet
        const hoofGeometry = new THREE.CylinderGeometry(0.06 * data.size, 0.08 * data.size, 0.1 * data.size, 6);
        const hoofMaterial = new THREE.MeshLambertMaterial({ color: '#2F4F4F' });
        
        const hoofPositions = [
            [-0.2 * data.size, 0.05 * data.size, 0.3 * data.size],
            [0.2 * data.size, 0.05 * data.size, 0.3 * data.size],
            [-0.2 * data.size, 0.05 * data.size, -0.3 * data.size],
            [0.2 * data.size, 0.05 * data.size, -0.3 * data.size]
        ];

        hoofPositions.forEach(pos => {
            const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
            hoof.position.set(pos[0], pos[1], pos[2]);
            group.add(hoof);
        });

        // Antlers for deer species
        if (data.antlers) {
            const antlerMaterial = new THREE.MeshLambertMaterial({ color: data.antlers });
            const antlerGeometry = new THREE.CylinderGeometry(0.02 * data.size, 0.04 * data.size, 0.4 * data.size, 6);
            
            // Main antler branches
            const leftAntler = new THREE.Mesh(antlerGeometry, antlerMaterial);
            const rightAntler = new THREE.Mesh(antlerGeometry, antlerMaterial);
            leftAntler.position.set(-0.15 * data.size, 1.4 * data.size, 0.3 * data.size);
            rightAntler.position.set(0.15 * data.size, 1.4 * data.size, 0.3 * data.size);
            leftAntler.rotation.z = -Math.PI / 8;
            rightAntler.rotation.z = Math.PI / 8;
            group.add(leftAntler, rightAntler);

            // Antler branches
            for (let i = 0; i < 4; i++) {
                const branchGeometry = new THREE.CylinderGeometry(0.01 * data.size, 0.02 * data.size, 0.15 * data.size, 4);
                const leftBranch = new THREE.Mesh(branchGeometry, antlerMaterial);
                const rightBranch = new THREE.Mesh(branchGeometry, antlerMaterial);
                
                leftBranch.position.set(-0.25 * data.size, 1.3 + i * 0.08 * data.size, 0.2 * data.size);
                rightBranch.position.set(0.25 * data.size, 1.3 + i * 0.08 * data.size, 0.2 * data.size);
                leftBranch.rotation.set(Math.PI/4, 0, -Math.PI/3);
                rightBranch.rotation.set(Math.PI/4, 0, Math.PI/3);
                
                group.add(leftBranch, rightBranch);
            }
        }

        // Tusks for elephants
        if (data.tusks) {
            const tuskMaterial = new THREE.MeshLambertMaterial({ color: data.tusks });
            const tuskGeometry = new THREE.CylinderGeometry(0.03 * data.size, 0.01 * data.size, 0.5 * data.size, 6);
            const leftTusk = new THREE.Mesh(tuskGeometry, tuskMaterial);
            const rightTusk = new THREE.Mesh(tuskGeometry, tuskMaterial);
            leftTusk.position.set(-0.15 * data.size, 1.0 * data.size, 0.8 * data.size);
            rightTusk.position.set(0.15 * data.size, 1.0 * data.size, 0.8 * data.size);
            leftTusk.rotation.x = Math.PI / 6;
            rightTusk.rotation.x = Math.PI / 6;
            group.add(leftTusk, rightTusk);
        }

        // Long neck for giraffes
        if (data.id === 'giraffe') {
            const neckGeometry = new THREE.CylinderGeometry(0.15 * data.size, 0.2 * data.size, 1.5 * data.size, 8);
            const neck = new THREE.Mesh(neckGeometry, baseMaterial);
            neck.position.set(0, 1.5 * data.size, 0.3 * data.size);
            neck.rotation.x = -Math.PI / 8;
            group.add(neck);

            // Reposition head higher for giraffe
            const existingHead = group.children.find(child => child.position.y > 0.8 * data.size);
            if (existingHead) {
                existingHead.position.y = 2.2 * data.size;
            }
        }

        // Trunk for elephants
        if (data.id === 'elephant') {
            const trunkSegments = 5;
            for (let i = 0; i < trunkSegments; i++) {
                const segmentGeometry = new THREE.CylinderGeometry(
                    (0.12 - i * 0.02) * data.size, 
                    (0.15 - i * 0.02) * data.size, 
                    0.2 * data.size, 8
                );
                const segment = new THREE.Mesh(segmentGeometry, baseMaterial);
                const curve = Math.sin((i / trunkSegments) * Math.PI) * 0.3;
                segment.position.set(curve * data.size, 0.9 * data.size - i * 0.18 * data.size, 0.8 * data.size + i * 0.1 * data.size);
                segment.rotation.x = (i / trunkSegments) * Math.PI / 4;
                group.add(segment);
            }
        }
    }

    addRodentFeatures(data, group, baseMaterial) {
        // Large front teeth
        const toothMaterial = new THREE.MeshLambertMaterial({ color: '#FFFACD' });
        const toothGeometry = new THREE.BoxGeometry(0.02 * data.size, 0.08 * data.size, 0.01 * data.size);
        const leftTooth = new THREE.Mesh(toothGeometry, toothMaterial);
        const rightTooth = new THREE.Mesh(toothGeometry, toothMaterial);
        leftTooth.position.set(-0.03 * data.size, 1.1 * data.size, 0.65 * data.size);
        rightTooth.position.set(0.03 * data.size, 1.1 * data.size, 0.65 * data.size);
        group.add(leftTooth, rightTooth);

        // Bushy tail for squirrels
        if (data.id === 'squirrel') {
            const tailGeometry = new THREE.SphereGeometry(0.2 * data.size, 8, 6);
            tailGeometry.scale(0.5, 1, 2);
            const tail = new THREE.Mesh(tailGeometry, baseMaterial);
            tail.position.set(0, 0.6 * data.size, -0.8 * data.size);
            tail.rotation.x = -Math.PI / 4;
            group.add(tail);
        }

        // Flat tail for beavers
        if (data.tail === 'flat' && data.id === 'beaver') {
            const tailGeometry = new THREE.BoxGeometry(0.3 * data.size, 0.05 * data.size, 0.4 * data.size);
            const tail = new THREE.Mesh(tailGeometry, baseMaterial);
            tail.position.set(0, 0.3 * data.size, -0.7 * data.size);
            group.add(tail);
        }

        // Quills for porcupines
        if (data.quills) {
            for (let i = 0; i < 20; i++) {
                const quillGeometry = new THREE.CylinderGeometry(0.005 * data.size, 0.002 * data.size, 0.15 * data.size, 4);
                const quillMaterial = new THREE.MeshLambertMaterial({ color: '#2F4F4F' });
                const quill = new THREE.Mesh(quillGeometry, quillMaterial);
                
                const angle = (i / 20) * Math.PI * 2;
                quill.position.set(
                    Math.cos(angle) * 0.25 * data.size,
                    0.4 * data.size + Math.random() * 0.3 * data.size,
                    Math.sin(angle) * 0.25 * data.size - 0.2 * data.size
                );
                quill.rotation.set(
                    Math.random() * Math.PI / 4,
                    angle,
                    Math.random() * Math.PI / 6
                );
                group.add(quill);
            }
        }
    }

    addMarineFeatures(data, group, baseMaterial) {
        // Flippers instead of legs for marine mammals
        const flipperGeometry = new THREE.SphereGeometry(0.15 * data.size, 8, 6);
        flipperGeometry.scale(2, 0.4, 1);
        
        const leftFlipper = new THREE.Mesh(flipperGeometry, baseMaterial);
        const rightFlipper = new THREE.Mesh(flipperGeometry, baseMaterial);
        leftFlipper.position.set(-0.4 * data.size, 0.3 * data.size, 0.2 * data.size);
        rightFlipper.position.set(0.4 * data.size, 0.3 * data.size, 0.2 * data.size);
        group.add(leftFlipper, rightFlipper);

        // Tail fluke
        const flukeGeometry = new THREE.SphereGeometry(0.3 * data.size, 8, 6);
        flukeGeometry.scale(2, 0.2, 0.8);
        const fluke = new THREE.Mesh(flukeGeometry, baseMaterial);
        fluke.position.set(0, 0.4 * data.size, -1.2 * data.size);
        group.add(fluke);

        // Blowhole for whales
        if (data.id === 'whale') {
            const blowholeGeometry = new THREE.CylinderGeometry(0.03 * data.size, 0.03 * data.size, 0.02 * data.size, 6);
            const blowhole = new THREE.Mesh(blowholeGeometry, new THREE.MeshBasicMaterial({ color: '#000000' }));
            blowhole.position.set(0, 1.2 * data.size, 0.2 * data.size);
            group.add(blowhole);
        }

        // Tusks for walruses
        if (data.tusks && data.id === 'walrus') {
            const tuskMaterial = new THREE.MeshLambertMaterial({ color: data.tusks });
            const tuskGeometry = new THREE.CylinderGeometry(0.02 * data.size, 0.01 * data.size, 0.3 * data.size, 6);
            const leftTusk = new THREE.Mesh(tuskGeometry, tuskMaterial);
            const rightTusk = new THREE.Mesh(tuskGeometry, tuskMaterial);
            leftTusk.position.set(-0.05 * data.size, 0.9 * data.size, 0.7 * data.size);
            rightTusk.position.set(0.05 * data.size, 0.9 * data.size, 0.7 * data.size);
            leftTusk.rotation.x = Math.PI / 4;
            rightTusk.rotation.x = Math.PI / 4;
            group.add(leftTusk, rightTusk);
        }
    }

    createBird(data, group) {
        // Choose feather material based on bird type
        const bodyMaterial = this.getBirdMaterial(data);
        bodyMaterial.color.setHex(parseInt(data.color?.replace('#', '0x') || '0x8B4513'));

        // Body with realistic bird proportions
        const bodyGeometry = new THREE.SphereGeometry(0.3 * data.size, 16, 12);
        bodyGeometry.scale(1, 1.5, 0.8);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5 * data.size;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head with appropriate sizing
        const headSize = this.getBirdHeadSize(data);
        const headGeometry = new THREE.SphereGeometry(headSize * data.size, 16, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.9 * data.size, 0.4 * data.size);
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Realistic beak based on bird type
        this.addRealisticBeak(data, group);

        // Wings with feather details
        this.addRealisticWings(data, group, bodyMaterial);

        // Bird legs and feet
        this.addBirdLegs(data, group);

        // Eyes
        this.addBirdEyes(data, group);

        // Tail feathers
        this.addTailFeathers(data, group, bodyMaterial);

        // Add bird-specific features
        this.addBirdFeatures(data, group, bodyMaterial);

        // Add feather details
        this.addFeatherDetails(data, group);

        return group;
    }

    getBirdMaterial(data) {
        if (data.subcategory === 'waterbird') {
            return this.materials.feathersSmooth.clone();
        } else if (data.id === 'owl') {
            return this.materials.feathersDown.clone();
        } else {
            return this.materials.feathersSmooth.clone();
        }
    }

    getBirdHeadSize(data) {
        const headSizes = {
            'ostrich': 0.15,
            'emu': 0.15,
            'cassowary': 0.18,
            'eagle': 0.18,
            'owl': 0.25,
            'hummingbird': 0.12,
            'pelican': 0.22
        };
        return headSizes[data.id] || 0.2;
    }

    addRealisticBeak(data, group) {
        const beakMaterial = new THREE.MeshPhongMaterial({ 
            color: data.beak || '#FFA500',
            shininess: 30
        });
        
        let beakGeometry;
        
        // Different beak shapes for different birds
        switch(data.subcategory) {
            case 'raptor':
                beakGeometry = new THREE.ConeGeometry(0.04 * data.size, 0.2 * data.size, 6);
                beakGeometry.translate(0, 0, 0.1 * data.size);
                beakGeometry.rotateX(Math.PI / 6); // Hooked beak
                break;
            case 'waterbird':
                if (data.id === 'pelican') {
                    beakGeometry = new THREE.BoxGeometry(0.06 * data.size, 0.08 * data.size, 0.4 * data.size);
                } else {
                    beakGeometry = new THREE.ConeGeometry(0.03 * data.size, 0.25 * data.size, 6);
                }
                break;
            default:
                beakGeometry = new THREE.ConeGeometry(0.05 * data.size, 0.15 * data.size, 6);
        }
        
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 0.9 * data.size, 0.6 * data.size);
        beak.rotation.x = Math.PI / 2;
        beak.castShadow = true;
        group.add(beak);

        // Add pelican pouch
        if (data.id === 'pelican') {
            const pouchMaterial = new THREE.MeshLambertMaterial({ 
                color: '#FFB6C1',
                transparent: true,
                opacity: 0.8
            });
            const pouchGeometry = new THREE.SphereGeometry(0.15 * data.size, 8, 6);
            pouchGeometry.scale(1, 0.6, 1.5);
            const pouch = new THREE.Mesh(pouchGeometry, pouchMaterial);
            pouch.position.set(0, 0.8 * data.size, 0.7 * data.size);
            group.add(pouch);
        }
    }

    addRealisticWings(data, group, bodyMaterial) {
        const wingMaterial = bodyMaterial.clone();
        
        // Wing geometry varies by bird type
        let wingGeometry;
        if (data.id === 'hummingbird') {
            wingGeometry = new THREE.SphereGeometry(0.15 * data.size, 8, 6);
            wingGeometry.scale(0.1, 0.5, 2);
        } else if (data.subcategory === 'raptor') {
            wingGeometry = new THREE.SphereGeometry(0.4 * data.size, 12, 8);
            wingGeometry.scale(0.2, 0.8, 2);
        } else {
            wingGeometry = new THREE.SphereGeometry(0.25 * data.size, 10, 6);
            wingGeometry.scale(0.3, 1, 1.5);
        }
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        
        leftWing.position.set(-0.35 * data.size, 0.6 * data.size, 0);
        rightWing.position.set(0.35 * data.size, 0.6 * data.size, 0);
        
        leftWing.castShadow = true;
        rightWing.castShadow = true;
        
        group.add(leftWing, rightWing);

        // Add wing feather details
        this.addWingFeathers(data, group, leftWing, rightWing);
    }

    addWingFeathers(data, group, leftWing, rightWing) {
        // Add individual feather details for larger birds
        if (data.size > 0.8) {
            const featherMaterial = new THREE.MeshBasicMaterial({
                color: data.color || '#8B4513',
                transparent: true,
                opacity: 0.9
            });
            
            for (let i = 0; i < 5; i++) {
                const featherGeometry = new THREE.PlaneGeometry(0.05 * data.size, 0.2 * data.size);
                const leftFeather = new THREE.Mesh(featherGeometry, featherMaterial);
                const rightFeather = new THREE.Mesh(featherGeometry, featherMaterial);
                
                leftFeather.position.set(
                    -0.4 * data.size + i * 0.02,
                    0.6 * data.size,
                    -0.1 * data.size + i * 0.05
                );
                rightFeather.position.set(
                    0.4 * data.size - i * 0.02,
                    0.6 * data.size,
                    -0.1 * data.size + i * 0.05
                );
                
                leftFeather.rotation.z = Math.PI / 6;
                rightFeather.rotation.z = -Math.PI / 6;
                
                group.add(leftFeather, rightFeather);
            }
        }
    }

    addBirdLegs(data, group) {
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: data.legColor || '#FFA500',
            shininess: 20
        });
        
        const legThickness = data.size > 1.5 ? 0.06 : 0.03;
        const legLength = data.subcategory === 'waterbird' ? 0.4 : 0.3;
        
        const legGeometry = new THREE.CylinderGeometry(
            legThickness * data.size, 
            legThickness * data.size, 
            legLength * data.size, 
            8
        );
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        
        leftLeg.position.set(-0.1 * data.size, 0.15 * data.size, 0);
        rightLeg.position.set(0.1 * data.size, 0.15 * data.size, 0);
        
        leftLeg.castShadow = true;
        rightLeg.castShadow = true;
        
        group.add(leftLeg, rightLeg);

        // Add feet/talons
        this.addBirdFeet(data, group, legMaterial);
    }

    addBirdFeet(data, group, legMaterial) {
        const footGeometry = new THREE.SphereGeometry(0.05 * data.size, 6, 4);
        footGeometry.scale(1.5, 0.5, 1);
        
        const leftFoot = new THREE.Mesh(footGeometry, legMaterial);
        const rightFoot = new THREE.Mesh(footGeometry, legMaterial);
        
        leftFoot.position.set(-0.1 * data.size, 0.03 * data.size, 0.05 * data.size);
        rightFoot.position.set(0.1 * data.size, 0.03 * data.size, 0.05 * data.size);
        
        group.add(leftFoot, rightFoot);

        // Add talons for raptors
        if (data.subcategory === 'raptor') {
            const talonMaterial = new THREE.MeshPhongMaterial({ 
                color: '#333333',
                shininess: 100
            });
            
            for (let i = 0; i < 6; i++) {
                const talonGeometry = new THREE.ConeGeometry(0.01 * data.size, 0.05 * data.size, 4);
                const talon = new THREE.Mesh(talonGeometry, talonMaterial);
                
                const foot = i < 3 ? leftFoot : rightFoot;
                const side = i < 3 ? -0.1 : 0.1;
                const offset = (i % 3) * 0.02 - 0.01;
                
                talon.position.set(side * data.size + offset, 0.02 * data.size, 0.08 * data.size);
                talon.rotation.x = Math.PI;
                
                group.add(talon);
            }
        }
    }

    addBirdEyes(data, group) {
        const eyeMaterial = new THREE.MeshPhongMaterial({ 
            color: data.eyeColor || '#000000',
            shininess: 200
        });
        
        const eyeGeometry = new THREE.SphereGeometry(0.03 * data.size, 8, 6);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        const eyeOffset = data.id === 'owl' ? 0.15 : 0.1;
        
        leftEye.position.set(-eyeOffset * data.size, 0.95 * data.size, 0.5 * data.size);
        rightEye.position.set(eyeOffset * data.size, 0.95 * data.size, 0.5 * data.size);
        
        group.add(leftEye, rightEye);
    }

    addTailFeathers(data, group, bodyMaterial) {
        if (data.id === 'peacock') {
            // Spectacular peacock tail
            const tailMaterial = new THREE.MeshPhongMaterial({
                color: '#4169E1',
                transparent: true,
                opacity: 0.8,
                shininess: 50
            });
            
            for (let i = 0; i < 8; i++) {
                const featherGeometry = new THREE.PlaneGeometry(0.1 * data.size, 0.6 * data.size);
                const feather = new THREE.Mesh(featherGeometry, tailMaterial);
                
                const angle = (i / 8) * Math.PI * 0.8 - Math.PI * 0.4;
                feather.position.set(
                    Math.sin(angle) * 0.3 * data.size,
                    0.7 * data.size,
                    -0.8 * data.size + Math.cos(angle) * 0.2 * data.size
                );
                feather.rotation.y = angle;
                
                group.add(feather);

                // Add eye patterns on peacock feathers
                const eyeGeometry = new THREE.SphereGeometry(0.03 * data.size, 8, 6);
                const eyeMaterial = new THREE.MeshBasicMaterial({ color: '#00FF00' });
                const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                eye.position.copy(feather.position);
                eye.position.y += 0.2 * data.size;
                group.add(eye);
            }
        } else {
            // Regular tail feathers
            const tailGeometry = new THREE.ConeGeometry(0.15 * data.size, 0.4 * data.size, 6);
            const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
            tail.position.set(0, 0.6 * data.size, -0.5 * data.size);
            tail.rotation.x = Math.PI / 2;
            tail.castShadow = true;
            group.add(tail);
        }
    }

    addFeatherDetails(data, group) {
        // Add subtle feather texture overlay
        if (this.textures.feathers) {
            const featherOverlay = new THREE.MeshBasicMaterial({
                map: this.textures.feathers,
                transparent: true,
                opacity: 0.3,
                blending: THREE.MultiplyBlending
            });
            
            const overlayGeometry = new THREE.SphereGeometry(0.31 * data.size, 12, 8);
            overlayGeometry.scale(1, 1.5, 0.8);
            const overlay = new THREE.Mesh(overlayGeometry, featherOverlay);
            overlay.position.y = 0.5 * data.size;
            group.add(overlay);
        }
    }

    addBirdFeatures(data, group, baseMaterial) {
        if (data.subcategory === 'waterbird' && data.neck === 'long') {
            // Extended neck for swans, herons, cranes
            const neckGeometry = new THREE.CylinderGeometry(0.08 * data.size, 0.12 * data.size, 0.6 * data.size, 8);
            const neck = new THREE.Mesh(neckGeometry, baseMaterial);
            neck.position.set(0, 0.8 * data.size, 0.2 * data.size);
            group.add(neck);
        }

        if (data.id === 'peacock' && data.tail === 'fanned') {
            // Peacock tail fan
            const tailGeometry = new THREE.CylinderGeometry(0.8 * data.size, 0.1 * data.size, 0.05 * data.size, 12);
            const tailMaterial = new THREE.MeshLambertMaterial({ 
                color: '#4169E1',
                transparent: true,
                opacity: 0.8 
            });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0.7 * data.size, -0.8 * data.size);
            tail.rotation.x = Math.PI / 2;
            group.add(tail);
        }

        if (data.id === 'penguin') {
            // Penguin belly
            const bellyMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
            const bellyGeometry = new THREE.SphereGeometry(0.25 * data.size, 12, 8);
            const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
            belly.position.set(0, 0.5 * data.size, 0.2 * data.size);
            belly.scale.set(0.7, 1.2, 0.5);
            group.add(belly);
        }
    }

    createReptile(data, group) {
        if (data.subcategory === 'serpent') {
            return this.createSnake(data, group);
        }

        // Choose appropriate scale material
        const bodyMaterial = this.getReptileMaterial(data);
        bodyMaterial.color.setHex(parseInt(data.color?.replace('#', '0x') || '0x228B22'));

        // Body with realistic reptile proportions
        const bodyGeometry = new THREE.SphereGeometry(0.4 * data.size, 16, 12);
        bodyGeometry.scale(1.5, 0.6, 1);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3 * data.size;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head with reptile characteristics
        const headGeometry = new THREE.SphereGeometry(0.25 * data.size, 16, 12);
        headGeometry.scale(1.2, 0.8, 1);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.4 * data.size, 0.6 * data.size);
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Add reptile eyes
        this.addReptileEyes(data, group);

        // Legs (for lizards, not snakes)
        if (data.subcategory !== 'serpent') {
            this.addReptileLegs(data, group, bodyMaterial);
        }

        // Tail with appropriate shape
        this.addReptileTail(data, group, bodyMaterial);

        // Add scale details
        this.addScaleDetails(data, group);

        // Add specific reptile features
        this.addReptileFeatures(data, group, bodyMaterial);

        return group;
    }

    getReptileMaterial(data) {
        if (data.subcategory === 'crocodilian') {
            return this.materials.scalesRough.clone();
        } else if (data.id === 'gecko') {
            return this.materials.skinSmooth.clone();
        } else {
            return this.materials.scalesSmooth.clone();
        }
    }

    addReptileEyes(data, group) {
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: data.eyeColor || '#FFD700',
            shininess: 200,
            transparent: true,
            opacity: 0.9
        });
        
        const eyeGeometry = new THREE.SphereGeometry(0.04 * data.size, 8, 6);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        // Reptile eyes are often on top/sides of head
        leftEye.position.set(-0.15 * data.size, 0.5 * data.size, 0.7 * data.size);
        rightEye.position.set(0.15 * data.size, 0.5 * data.size, 0.7 * data.size);
        
        group.add(leftEye, rightEye);

        // Add vertical pupils for some reptiles
        if (data.subcategory === 'lizard' || data.id === 'gecko') {
            const pupilMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
            const pupilGeometry = new THREE.PlaneGeometry(0.01 * data.size, 0.03 * data.size);
            
            const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
            
            leftPupil.position.copy(leftEye.position);
            rightPupil.position.copy(rightEye.position);
            leftPupil.position.z += 0.01;
            rightPupil.position.z += 0.01;
            
            group.add(leftPupil, rightPupil);
        }
    }

    addReptileLegs(data, group, bodyMaterial) {
        const legGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.08 * data.size, 0.25 * data.size, 8);
        
        let legPositions;
        if (data.subcategory === 'crocodilian') {
            // Crocodilian legs are more spread out
            legPositions = [
                [-0.4 * data.size, 0.15 * data.size, 0.3 * data.size],
                [0.4 * data.size, 0.15 * data.size, 0.3 * data.size],
                [-0.4 * data.size, 0.15 * data.size, -0.3 * data.size],
                [0.4 * data.size, 0.15 * data.size, -0.3 * data.size]
            ];
        } else {
            // Lizard legs
            legPositions = [
                [-0.3 * data.size, 0.15 * data.size, 0.2 * data.size],
                [0.3 * data.size, 0.15 * data.size, 0.2 * data.size],
                [-0.3 * data.size, 0.15 * data.size, -0.2 * data.size],
                [0.3 * data.size, 0.15 * data.size, -0.2 * data.size]
            ];
        }

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            leg.receiveShadow = true;
            group.add(leg);
        });

        // Add clawed feet
        this.addReptileFeet(data, group, bodyMaterial);
    }

    addReptileFeet(data, group, bodyMaterial) {
        const footGeometry = new THREE.SphereGeometry(0.06 * data.size, 8, 6);
        footGeometry.scale(1.5, 0.5, 1.2);
        
        const positions = [
            [-0.3 * data.size, 0.03 * data.size, 0.25 * data.size],
            [0.3 * data.size, 0.03 * data.size, 0.25 * data.size],
            [-0.3 * data.size, 0.03 * data.size, -0.15 * data.size],
            [0.3 * data.size, 0.03 * data.size, -0.15 * data.size]
        ];

        positions.forEach(pos => {
            const foot = new THREE.Mesh(footGeometry, bodyMaterial);
            foot.position.set(pos[0], pos[1], pos[2]);
            foot.castShadow = true;
            group.add(foot);

            // Add claws
            const clawMaterial = new THREE.MeshPhongMaterial({ 
                color: '#333333',
                shininess: 100
            });
            
            for (let i = 0; i < 4; i++) {
                const clawGeometry = new THREE.ConeGeometry(0.005 * data.size, 0.03 * data.size, 4);
                const claw = new THREE.Mesh(clawGeometry, clawMaterial);
                claw.position.set(
                    pos[0] + (i - 1.5) * 0.02 * data.size,
                    pos[1] + 0.01 * data.size,
                    pos[2] + 0.05 * data.size
                );
                claw.rotation.x = Math.PI;
                group.add(claw);
            }
        });
    }

    addReptileTail(data, group, bodyMaterial) {
        let tailGeometry;
        
        if (data.subcategory === 'crocodilian') {
            // Powerful, laterally compressed tail
            tailGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.2 * data.size, 1.2 * data.size, 12);
            const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
            tail.position.set(0, 0.2 * data.size, -1.0 * data.size);
            tail.rotation.x = Math.PI / 2;
            tail.castShadow = true;
            tail.receiveShadow = true;
            group.add(tail);

            // Add tail ridges
            for (let i = 0; i < 8; i++) {
                const ridgeGeometry = new THREE.BoxGeometry(0.02 * data.size, 0.08 * data.size, 0.04 * data.size);
                const ridge = new THREE.Mesh(ridgeGeometry, bodyMaterial);
                ridge.position.set(0, 0.25 * data.size, -0.5 * data.size - i * 0.1 * data.size);
                group.add(ridge);
            }
        } else if (data.id === 'gecko') {
            // Gecko tail that can be regenerated
            tailGeometry = new THREE.CylinderGeometry(0.08 * data.size, 0.03 * data.size, 0.6 * data.size, 8);
            const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
            tail.position.set(0, 0.3 * data.size, -0.6 * data.size);
            tail.rotation.x = Math.PI / 2;
            tail.castShadow = true;
            group.add(tail);
        } else {
            // Regular lizard tail
            tailGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.15 * data.size, 0.8 * data.size, 10);
            const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
            tail.position.set(0, 0.3 * data.size, -0.8 * data.size);
            tail.rotation.x = Math.PI / 2;
            tail.castShadow = true;
            tail.receiveShadow = true;
            group.add(tail);
        }
    }

    addScaleDetails(data, group) {
        // Add scale texture overlay
        if (this.textures.scales) {
            const scaleOverlay = new THREE.MeshBasicMaterial({
                map: this.textures.scales,
                transparent: true,
                opacity: 0.4,
                blending: THREE.MultiplyBlending
            });
            
            const overlayGeometry = new THREE.SphereGeometry(0.41 * data.size, 12, 8);
            overlayGeometry.scale(1.5, 0.6, 1);
            const overlay = new THREE.Mesh(overlayGeometry, scaleOverlay);
            overlay.position.y = 0.3 * data.size;
            group.add(overlay);
        }

        // Add individual scale details for larger reptiles
        if (data.size > 1.2 && data.subcategory === 'crocodilian') {
            this.addIndividualScales(data, group);
        }
    }

    addIndividualScales(data, group) {
        const scaleMaterial = new THREE.MeshPhongMaterial({
            color: data.color || '#228B22',
            shininess: 50,
            transparent: true,
            opacity: 0.8
        });
        
        // Add prominent back scales
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 3; j++) {
                const scaleGeometry = new THREE.SphereGeometry(0.03 * data.size, 6, 4);
                scaleGeometry.scale(1, 0.3, 1);
                const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
                
                scale.position.set(
                    (j - 1) * 0.1 * data.size,
                    0.35 * data.size,
                    (i - 6) * 0.08 * data.size
                );
                
                scale.rotation.x = Math.random() * 0.2 - 0.1;
                scale.rotation.z = Math.random() * 0.2 - 0.1;
                
                group.add(scale);
            }
        }
    }

    addReptileFeatures(data, group, bodyMaterial) {
        // Add forked tongue for snakes and some lizards
        if (data.subcategory === 'serpent' || data.id === 'monitor') {
            this.addForkedTongue(data, group);
        }

        // Add iguana spines
        if (data.id === 'iguana') {
            this.addIguanaSpines(data, group, bodyMaterial);
        }

        // Add gecko toe pads
        if (data.id === 'gecko') {
            this.addGeckoToePads(data, group);
        }

        // Add chameleon features
        if (data.id === 'chameleon') {
            this.addChameleonFeatures(data, group, bodyMaterial);
        }
    }

    addForkedTongue(data, group) {
        const tongueMaterial = new THREE.MeshBasicMaterial({ color: '#FF69B4' });
        const tongueGeometry = new THREE.CylinderGeometry(0.005 * data.size, 0.005 * data.size, 0.15 * data.size, 4);
        const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
        tongue.position.set(0, 0.35 * data.size, 0.75 * data.size);
        tongue.rotation.x = Math.PI / 2;
        group.add(tongue);

        // Fork at the end
        const forkGeometry = new THREE.CylinderGeometry(0.002 * data.size, 0.002 * data.size, 0.03 * data.size, 4);
        const leftFork = new THREE.Mesh(forkGeometry, tongueMaterial);
        const rightFork = new THREE.Mesh(forkGeometry, tongueMaterial);
        
        leftFork.position.set(-0.01 * data.size, 0.35 * data.size, 0.82 * data.size);
        rightFork.position.set(0.01 * data.size, 0.35 * data.size, 0.82 * data.size);
        leftFork.rotation.x = Math.PI / 4;
        rightFork.rotation.x = -Math.PI / 4;
        
        group.add(leftFork, rightFork);
    }

    addIguanaSpines(data, group, bodyMaterial) {
        const spineMaterial = bodyMaterial.clone();
        spineMaterial.color.multiplyScalar(0.8); // Darker spines
        
        for (let i = 0; i < 10; i++) {
            const spineGeometry = new THREE.ConeGeometry(0.02 * data.size, 0.1 * data.size, 6);
            const spine = new THREE.Mesh(spineGeometry, spineMaterial);
            spine.position.set(0, 0.45 * data.size, (i - 5) * 0.08 * data.size);
            spine.rotation.x = Math.PI;
            group.add(spine);
        }
    }

    addGeckoToePads(data, group) {
        const padMaterial = new THREE.MeshPhongMaterial({ 
            color: '#FFB6C1',
            shininess: 10
        });
        
        // Add toe pads to feet (simplified)
        const positions = [
            [-0.3 * data.size, 0.03 * data.size, 0.25 * data.size],
            [0.3 * data.size, 0.03 * data.size, 0.25 * data.size],
            [-0.3 * data.size, 0.03 * data.size, -0.15 * data.size],
            [0.3 * data.size, 0.03 * data.size, -0.15 * data.size]
        ];

        positions.forEach(pos => {
            for (let i = 0; i < 5; i++) {
                const padGeometry = new THREE.SphereGeometry(0.008 * data.size, 6, 4);
                const pad = new THREE.Mesh(padGeometry, padMaterial);
                pad.position.set(
                    pos[0] + (i - 2) * 0.01 * data.size,
                    pos[1],
                    pos[2] + 0.05 * data.size
                );
                group.add(pad);
            }
        });
    }

    addChameleonFeatures(data, group, bodyMaterial) {
        // Rotating eyes
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: '#FFD700',
            shininess: 200
        });
        
        const eyeGeometry = new THREE.SphereGeometry(0.06 * data.size, 8, 6);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        // Chameleon eyes protrude more
        leftEye.position.set(-0.2 * data.size, 0.55 * data.size, 0.6 * data.size);
        rightEye.position.set(0.2 * data.size, 0.55 * data.size, 0.6 * data.size);
        
        group.add(leftEye, rightEye);

        // Casque (head crest)
        const casqueGeometry = new THREE.ConeGeometry(0.15 * data.size, 0.2 * data.size, 8);
        const casque = new THREE.Mesh(casqueGeometry, bodyMaterial);
        casque.position.set(0, 0.6 * data.size, 0.4 * data.size);
        casque.rotation.x = Math.PI;
        group.add(casque);
    }

    createSnake(data, group) {
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#228B22' 
        });

        // Snake body segments
        const segmentCount = 8;
        const segmentSize = 0.15 * data.size;
        
        for (let i = 0; i < segmentCount; i++) {
            const segmentGeometry = new THREE.SphereGeometry(segmentSize * (1 - i * 0.1), 8, 6);
            const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
            
            // Curved snake pose
            const angle = (i / segmentCount) * Math.PI * 2;
            segment.position.set(
                Math.sin(angle) * 0.3 * data.size,
                segmentSize,
                i * 0.2 * data.size - 0.8 * data.size
            );
            group.add(segment);
        }

        // Head (larger first segment)
        const headGeometry = new THREE.SphereGeometry(segmentSize * 1.2, 8, 6);
        headGeometry.scale(1.3, 1, 1);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, segmentSize, 0.2 * data.size);
        group.add(head);

        // Cobra hood
        if (data.id === 'cobra' && data.hood) {
            const hoodGeometry = new THREE.CylinderGeometry(0.4 * data.size, 0.2 * data.size, 0.1 * data.size, 8);
            const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
            hood.position.set(0, segmentSize + 0.1 * data.size, 0.1 * data.size);
            hood.rotation.x = Math.PI / 2;
            group.add(hood);
        }

        return group;
    }

    createFish(data, group) {
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#4169E1' 
        });

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.3 * data.size, 12, 8);
        bodyGeometry.scale(2, 1, 1);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5 * data.size;
        group.add(body);

        // Tail fin
        const tailGeometry = new THREE.ConeGeometry(0.3 * data.size, 0.4 * data.size, 6);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 0.5 * data.size, -0.6 * data.size);
        tail.rotation.x = Math.PI / 2;
        group.add(tail);

        // Dorsal fin
        const dorsalGeometry = new THREE.ConeGeometry(0.15 * data.size, 0.3 * data.size, 6);
        const dorsalFin = new THREE.Mesh(dorsalGeometry, bodyMaterial);
        dorsalFin.position.set(0, 0.8 * data.size, 0);
        group.add(dorsalFin);

        // Side fins
        const sideFinGeometry = new THREE.ConeGeometry(0.1 * data.size, 0.2 * data.size, 6);
        const leftFin = new THREE.Mesh(sideFinGeometry, bodyMaterial);
        const rightFin = new THREE.Mesh(sideFinGeometry, bodyMaterial);
        leftFin.position.set(-0.4 * data.size, 0.4 * data.size, 0.2 * data.size);
        rightFin.position.set(0.4 * data.size, 0.4 * data.size, 0.2 * data.size);
        leftFin.rotation.z = Math.PI / 4;
        rightFin.rotation.z = -Math.PI / 4;
        group.add(leftFin, rightFin);

        // Shark features
        if (data.id === 'shark') {
            // Shark fin
            dorsalFin.scale.set(1, 2, 1);
            
            // Teeth (white triangles)
            const toothMaterial = new THREE.MeshLambertMaterial({ color: '#FFFFFF' });
            for (let i = 0; i < 6; i++) {
                const toothGeometry = new THREE.ConeGeometry(0.02 * data.size, 0.05 * data.size, 3);
                const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
                tooth.position.set((i - 2.5) * 0.03 * data.size, 0.45 * data.size, 0.6 * data.size);
                tooth.rotation.x = Math.PI;
                group.add(tooth);
            }
        }

        return group;
    }

    createArthropod(data, group) {
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#654321' 
        });

        if (data.id === 'spider') {
            // Spider body
            const bodyGeometry = new THREE.SphereGeometry(0.2 * data.size, 8, 6);
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.2 * data.size;
            group.add(body);

            // Abdomen
            const abdomenGeometry = new THREE.SphereGeometry(0.15 * data.size, 8, 6);
            abdomenGeometry.scale(1, 1, 1.5);
            const abdomen = new THREE.Mesh(abdomenGeometry, bodyMaterial);
            abdomen.position.set(0, 0.2 * data.size, -0.3 * data.size);
            group.add(abdomen);

            // 8 legs
            for (let i = 0; i < 8; i++) {
                const legGeometry = new THREE.CylinderGeometry(0.02 * data.size, 0.02 * data.size, 0.4 * data.size, 4);
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                
                const side = i < 4 ? -1 : 1;
                const angle = (i % 4) * Math.PI / 2;
                
                leg.position.set(
                    side * 0.3 * data.size,
                    0.1 * data.size,
                    Math.cos(angle) * 0.2 * data.size
                );
                leg.rotation.z = side * Math.PI / 6;
                group.add(leg);
            }
        } else {
            // Generic arthropod (crab, lobster, scorpion)
            const bodyGeometry = new THREE.SphereGeometry(0.3 * data.size, 8, 6);
            bodyGeometry.scale(1.5, 0.8, 1);
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.3 * data.size;
            group.add(body);

            // Claws for crabs and lobsters
            if (data.claws) {
                const clawGeometry = new THREE.SphereGeometry(0.15 * data.size, 6, 4);
                clawGeometry.scale(1.5, 1, 0.8);
                const leftClaw = new THREE.Mesh(clawGeometry, bodyMaterial);
                const rightClaw = new THREE.Mesh(clawGeometry, bodyMaterial);
                leftClaw.position.set(-0.5 * data.size, 0.3 * data.size, 0.3 * data.size);
                rightClaw.position.set(0.5 * data.size, 0.3 * data.size, 0.3 * data.size);
                group.add(leftClaw, rightClaw);
            }
        }

        return group;
    }

    createMythical(data, group) {
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#B22222' 
        });

        if (data.id === 'dragon') {
            // Dragon body (elongated)
            const bodyGeometry = new THREE.SphereGeometry(0.4 * data.size, 12, 8);
            bodyGeometry.scale(2, 1, 1);
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.6 * data.size;
            group.add(body);

            // Dragon head
            const headGeometry = new THREE.SphereGeometry(0.3 * data.size, 12, 8);
            headGeometry.scale(1.5, 1, 1.2);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.8 * data.size, 0.8 * data.size);
            group.add(head);

            // Wings
            const wingMaterial = new THREE.MeshLambertMaterial({ 
                color: '#8B0000',
                transparent: true,
                opacity: 0.8 
            });
            const wingGeometry = new THREE.CylinderGeometry(0.6 * data.size, 0.2 * data.size, 0.05 * data.size, 6);
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.7 * data.size, 0.8 * data.size, 0);
            rightWing.position.set(0.7 * data.size, 0.8 * data.size, 0);
            leftWing.rotation.z = Math.PI / 3;
            rightWing.rotation.z = -Math.PI / 3;
            group.add(leftWing, rightWing);

            // Tail
            const tailGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.2 * data.size, 1.2 * data.size, 8);
            const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
            tail.position.set(0, 0.5 * data.size, -1.2 * data.size);
            tail.rotation.x = Math.PI / 6;
            group.add(tail);

            // Legs
            for (let i = 0; i < 4; i++) {
                const legGeometry = new THREE.CylinderGeometry(0.08 * data.size, 0.12 * data.size, 0.5 * data.size, 6);
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                const x = (i % 2) * 2 - 1;
                const z = Math.floor(i / 2) * 0.6 - 0.3;
                leg.position.set(x * 0.3 * data.size, 0.25 * data.size, z * data.size);
                group.add(leg);
            }
        } else {
            // Generic mythical creature (use mammal base)
            return this.createMammal(data, group);
        }

        return group;
    }

    createHuman(data, group) {
        const skinMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#FFDBAC' 
        });
        
        const clothingMaterial = new THREE.MeshLambertMaterial({ 
            color: this.getDistrictColor(data.id) 
        });

        // Body (torso)
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * data.size, 0.8 * data.size, 8, 16);
        const body = new THREE.Mesh(bodyGeometry, clothingMaterial);
        body.position.y = 1.0 * data.size;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25 * data.size, 16, 12);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.set(0, 1.6 * data.size, 0);
        head.castShadow = true;
        group.add(head);

        // Hair
        if (data.hair) {
            const hairMaterial = new THREE.MeshLambertMaterial({ color: data.hair });
            const hairGeometry = new THREE.SphereGeometry(0.28 * data.size, 12, 8);
            hairGeometry.scale(1, 0.8, 1);
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.set(0, 1.7 * data.size, -0.05 * data.size);
            group.add(hair);
        }

        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.08 * data.size, 0.6 * data.size, 6, 8);
        const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
        const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
        leftArm.position.set(-0.4 * data.size, 1.1 * data.size, 0);
        rightArm.position.set(0.4 * data.size, 1.1 * data.size, 0);
        leftArm.rotation.z = Math.PI / 8;
        rightArm.rotation.z = -Math.PI / 8;
        leftArm.castShadow = true;
        rightArm.castShadow = true;
        group.add(leftArm, rightArm);

        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.1 * data.size, 0.8 * data.size, 8, 12);
        const leftLeg = new THREE.Mesh(legGeometry, clothingMaterial);
        const rightLeg = new THREE.Mesh(legGeometry, clothingMaterial);
        leftLeg.position.set(-0.15 * data.size, 0.4 * data.size, 0);
        rightLeg.position.set(0.15 * data.size, 0.4 * data.size, 0);
        leftLeg.castShadow = true;
        rightLeg.castShadow = true;
        group.add(leftLeg, rightLeg);

        // Add district-specific accessories
        this.addDistrictAccessories(data, group, data.size);

        return group;
    }

    getDistrictColor(humanId) {
        const districtColors = {
            'tribute_district1': '#FFD700', // Gold - Luxury
            'tribute_district2': '#8B4513', // Brown - Masonry
            'tribute_district4': '#4682B4', // Steel Blue - Fishing
            'tribute_district11': '#228B22', // Forest Green - Agriculture
            'tribute_district12': '#2F4F4F', // Dark Slate - Mining
            'career_tribute': '#B22222',    // Fire Brick - Career
            'athlete': '#4169E1',          // Royal Blue - Athletic
            'survivor': '#556B2F'          // Dark Olive - Survivor
        };
        return districtColors[humanId] || '#696969'; // Default gray
    }

    addDistrictAccessories(data, group, size) {
        const accessoryMaterial = new THREE.MeshLambertMaterial({ color: '#8B4513' });
        
        if (data.id.includes('district1')) {
            // Gold jewelry
            const jewelryMaterial = new THREE.MeshLambertMaterial({ color: '#FFD700' });
            const necklace = new THREE.TorusGeometry(0.15 * size, 0.02 * size, 6, 12);
            const necklaceMesh = new THREE.Mesh(necklace, jewelryMaterial);
            necklaceMesh.position.set(0, 1.45 * size, 0.1 * size);
            group.add(necklaceMesh);
        }
        
        if (data.id.includes('district2')) {
            // Stone/weapon accessories
            const weaponGeometry = new THREE.BoxGeometry(0.05 * size, 0.3 * size, 0.02 * size);
            const weapon = new THREE.Mesh(weaponGeometry, accessoryMaterial);
            weapon.position.set(0.3 * size, 1.2 * size, -0.1 * size);
            group.add(weapon);
        }
        
        if (data.id.includes('district4')) {
            // Fishing net pattern on clothing
            const netMaterial = new THREE.MeshLambertMaterial({ 
                color: '#4682B4',
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
            const netGeometry = new THREE.SphereGeometry(0.32 * size, 8, 6);
            const net = new THREE.Mesh(netGeometry, netMaterial);
            net.position.y = 1.0 * size;
            group.add(net);
        }
        
        if (data.id.includes('district12')) {
            // Mining helmet
            const helmetGeometry = new THREE.SphereGeometry(0.27 * size, 12, 8);
            helmetGeometry.scale(1, 0.7, 1);
            const helmetMaterial = new THREE.MeshLambertMaterial({ color: '#2F4F4F' });
            const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
            helmet.position.set(0, 1.7 * size, 0);
            group.add(helmet);
            
            // Helmet light
            const lightGeometry = new THREE.SphereGeometry(0.03 * size, 6, 4);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: '#FFFF00' });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(0, 1.75 * size, 0.25 * size);
            group.add(light);
        }
        
        if (data.id === 'career_tribute') {
            // Multiple weapons
            const swordGeometry = new THREE.BoxGeometry(0.03 * size, 0.4 * size, 0.01 * size);
            const swordMaterial = new THREE.MeshLambertMaterial({ color: '#C0C0C0' });
            const sword = new THREE.Mesh(swordGeometry, swordMaterial);
            sword.position.set(-0.35 * size, 1.2 * size, -0.05 * size);
            sword.rotation.z = Math.PI / 6;
            group.add(sword);
        }
    }

    createAmphibian(data, group) {
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#228B22' 
        });

        // Amphibian body (more rounded and low to ground)
        const bodyGeometry = new THREE.SphereGeometry(0.3 * data.size, 12, 8);
        bodyGeometry.scale(1.2, 0.6, 1);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.2 * data.size;
        body.castShadow = true;
        group.add(body);

        // Head (large for amphibians)
        const headGeometry = new THREE.SphereGeometry(0.2 * data.size, 12, 8);
        headGeometry.scale(1.3, 0.8, 1);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.25 * data.size, 0.4 * data.size);
        head.castShadow = true;
        group.add(head);

        // Large eyes for frogs/toads
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: '#FFD700' });
        const eyeGeometry = new THREE.SphereGeometry(0.05 * data.size, 8, 6);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1 * data.size, 0.35 * data.size, 0.5 * data.size);
        rightEye.position.set(0.1 * data.size, 0.35 * data.size, 0.5 * data.size);
        group.add(leftEye, rightEye);

        // Four legs (short and webbed for amphibians)
        const legGeometry = new THREE.CylinderGeometry(0.04 * data.size, 0.06 * data.size, 0.15 * data.size, 6);
        const legPositions = [
            [-0.2 * data.size, 0.08 * data.size, 0.2 * data.size],
            [0.2 * data.size, 0.08 * data.size, 0.2 * data.size],
            [-0.25 * data.size, 0.08 * data.size, -0.2 * data.size],
            [0.25 * data.size, 0.08 * data.size, -0.2 * data.size]
        ];

        legPositions.forEach((pos, index) => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            
            // Webbed feet
            const footGeometry = new THREE.SphereGeometry(0.06 * data.size, 6, 4);
            footGeometry.scale(1.5, 0.5, 1.2);
            const foot = new THREE.Mesh(footGeometry, bodyMaterial);
            foot.position.set(pos[0], 0.02 * data.size, pos[2] + (index < 2 ? 0.1 : -0.1) * data.size);
            
            group.add(leg, foot);
        });

        // Special features
        if (data.spots) {
            this.addAmphibianSpots(group, data);
        }

        if (data.gills && data.id === 'axolotl') {
            // Axolotl external gills
            const gillMaterial = new THREE.MeshLambertMaterial({ 
                color: '#FF69B4',
                transparent: true,
                opacity: 0.8
            });
            
            for (let i = 0; i < 6; i++) {
                const gillGeometry = new THREE.ConeGeometry(0.02 * data.size, 0.08 * data.size, 4);
                const gill = new THREE.Mesh(gillGeometry, gillMaterial);
                const angle = (i / 6) * Math.PI * 2;
                gill.position.set(
                    Math.cos(angle) * 0.15 * data.size,
                    0.3 * data.size,
                    0.4 * data.size + Math.sin(angle) * 0.05 * data.size
                );
                gill.rotation.z = angle;
                group.add(gill);
            }
        }

        if (data.warts && data.id === 'toad') {
            // Add bumpy texture with small spheres
            for (let i = 0; i < 8; i++) {
                const wartGeometry = new THREE.SphereGeometry(0.02 * data.size, 4, 3);
                const wart = new THREE.Mesh(wartGeometry, bodyMaterial);
                wart.position.set(
                    (Math.random() - 0.5) * 0.4 * data.size,
                    0.15 + Math.random() * 0.15 * data.size,
                    (Math.random() - 0.5) * 0.6 * data.size
                );
                group.add(wart);
            }
        }

        return group;
    }

    addAmphibianSpots(group, data) {
        const spotMaterial = new THREE.MeshLambertMaterial({ color: data.spots });
        
        for (let i = 0; i < 6; i++) {
            const spotGeometry = new THREE.SphereGeometry(0.03 * data.size, 6, 4);
            spotGeometry.scale(1.5, 0.3, 1.5);
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            spot.position.set(
                (Math.random() - 0.5) * 0.5 * data.size,
                0.22 * data.size,
                (Math.random() - 0.5) * 0.7 * data.size
            );
            group.add(spot);
        }
    }

    createGenericAnimal(data, group) {
        // Fallback for any animals not specifically handled
        return this.createMammal(data, group);
    }

    // Helper method to add patterns like stripes or spots
    addPattern(group, data) {
        // This would add procedural patterns - simplified for now
        if (data.stripes) {
            // Add stripe geometry
        }
        if (data.spots || data.rosettes) {
            // Add spot geometry
        }
    }

    // Create a simplified preview version for the selection screen
    createPreviewModel(animalData) {
        const preview = this.createAnimalModel(animalData);
        preview.scale.set(0.5, 0.5, 0.5);
        return preview;
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalModelGenerator;
} else {
    window.AnimalModelGenerator = AnimalModelGenerator;
}