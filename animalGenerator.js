// 3D Animal Model Generator for Three.js
class AnimalModelGenerator {
    constructor() {
        this.materials = {};
        this.geometries = {};
        this.initializeMaterials();
    }

    initializeMaterials() {
        // Pre-create common materials for better performance
        this.materials = {
            basic: new THREE.MeshLambertMaterial(),
            fur: new THREE.MeshLambertMaterial({ roughness: 0.8 }),
            scales: new THREE.MeshLambertMaterial({ roughness: 0.3 }),
            feathers: new THREE.MeshLambertMaterial({ roughness: 0.6 }),
            skin: new THREE.MeshLambertMaterial({ roughness: 0.4 })
        };
    }

    createAnimalModel(animalData) {
        const group = new THREE.Group();
        group.userData = { animalData };

        switch(animalData.category) {
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
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#8B4513' 
        });

        // Body (main torso)
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * data.size, 0.8 * data.size, 8, 16);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4 * data.size;
        group.add(body);

        // Head
        const headSize = data.subcategory === 'elephant' ? 0.6 : 0.4;
        const headGeometry = new THREE.SphereGeometry(headSize * data.size, 16, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, (0.8 + headSize) * data.size, 0.6 * data.size);
        group.add(head);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1 * data.size, 0.12 * data.size, 0.6 * data.size, 8);
        const legPositions = [
            [-0.2 * data.size, 0.3 * data.size, 0.3 * data.size],
            [0.2 * data.size, 0.3 * data.size, 0.3 * data.size],
            [-0.2 * data.size, 0.3 * data.size, -0.3 * data.size],
            [0.2 * data.size, 0.3 * data.size, -0.3 * data.size]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            group.add(leg);
        });

        // Add specific features based on subcategory
        this.addMammalFeatures(data, group, bodyMaterial);

        return group;
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

    createBird(data, group) {
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#8B4513' 
        });

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.3 * data.size, 12, 8);
        bodyGeometry.scale(1, 1.5, 0.8);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5 * data.size;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.2 * data.size, 12, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.9 * data.size, 0.4 * data.size);
        group.add(head);

        // Beak
        const beakGeometry = new THREE.ConeGeometry(0.05 * data.size, 0.15 * data.size, 6);
        const beakMaterial = new THREE.MeshLambertMaterial({ color: data.beak || '#FFA500' });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 0.9 * data.size, 0.6 * data.size);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);

        // Wings
        const wingGeometry = new THREE.SphereGeometry(0.25 * data.size, 8, 6);
        wingGeometry.scale(0.3, 1, 1.5);
        const leftWing = new THREE.Mesh(wingGeometry, bodyMaterial);
        const rightWing = new THREE.Mesh(wingGeometry, bodyMaterial);
        leftWing.position.set(-0.35 * data.size, 0.6 * data.size, 0);
        rightWing.position.set(0.35 * data.size, 0.6 * data.size, 0);
        group.add(leftWing, rightWing);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.03 * data.size, 0.03 * data.size, 0.3 * data.size, 6);
        const legMaterial = new THREE.MeshLambertMaterial({ color: '#FFA500' });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1 * data.size, 0.15 * data.size, 0);
        rightLeg.position.set(0.1 * data.size, 0.15 * data.size, 0);
        group.add(leftLeg, rightLeg);

        // Add bird-specific features
        this.addBirdFeatures(data, group, bodyMaterial);

        return group;
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

        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: data.color || '#228B22' 
        });

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.4 * data.size, 12, 8);
        bodyGeometry.scale(1.5, 0.6, 1);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3 * data.size;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25 * data.size, 12, 8);
        headGeometry.scale(1.2, 0.8, 1);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.4 * data.size, 0.6 * data.size);
        group.add(head);

        // Legs (for lizards, not snakes)
        if (data.subcategory !== 'serpent') {
            const legGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.08 * data.size, 0.25 * data.size, 6);
            const legPositions = [
                [-0.3 * data.size, 0.15 * data.size, 0.2 * data.size],
                [0.3 * data.size, 0.15 * data.size, 0.2 * data.size],
                [-0.3 * data.size, 0.15 * data.size, -0.2 * data.size],
                [0.3 * data.size, 0.15 * data.size, -0.2 * data.size]
            ];

            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, bodyMaterial);
                leg.position.set(pos[0], pos[1], pos[2]);
                group.add(leg);
            });
        }

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.05 * data.size, 0.15 * data.size, 0.8 * data.size, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 0.3 * data.size, -0.8 * data.size);
        tail.rotation.x = Math.PI / 2;
        group.add(tail);

        return group;
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