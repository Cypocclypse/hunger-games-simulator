// Comprehensive 3D Animal Model Database
class AnimalModelDatabase {
    constructor() {
        this.animals = {
            mammals: {
                feline: [
                    { id: 'lion', name: 'Lion', color: '#D4A574', mane: '#8B4513', size: 1.2 },
                    { id: 'tiger', name: 'Tiger', color: '#FF8C00', stripes: '#000000', size: 1.1 },
                    { id: 'leopard', name: 'Leopard', color: '#FFDB58', spots: '#8B4513', size: 0.9 },
                    { id: 'cheetah', name: 'Cheetah', color: '#F4A460', spots: '#000000', size: 0.8 },
                    { id: 'jaguar', name: 'Jaguar', color: '#D2691E', rosettes: '#000000', size: 1.0 },
                    { id: 'puma', name: 'Puma', color: '#D2B48C', size: 0.9 },
                    { id: 'lynx', name: 'Lynx', color: '#BC8F8F', tufts: '#8B4513', size: 0.7 },
                    { id: 'ocelot', name: 'Ocelot', color: '#F4A460', rosettes: '#8B4513', size: 0.5 },
                    { id: 'serval', name: 'Serval', color: '#F4A460', spots: '#000000', size: 0.6 },
                    { id: 'caracal', name: 'Caracal', color: '#D2691E', tufts: '#000000', size: 0.6 }
                ],
                canine: [
                    { id: 'wolf', name: 'Wolf', color: '#696969', size: 1.0 },
                    { id: 'coyote', name: 'Coyote', color: '#A0522D', size: 0.8 },
                    { id: 'fox', name: 'Red Fox', color: '#FF4500', tail: '#FFFFFF', size: 0.6 },
                    { id: 'arcticfox', name: 'Arctic Fox', color: '#F8F8FF', size: 0.5 },
                    { id: 'fennecfox', name: 'Fennec Fox', color: '#F5DEB3', ears: 'large', size: 0.3 },
                    { id: 'jackal', name: 'Jackal', color: '#D2691E', size: 0.7 },
                    { id: 'dingo', name: 'Dingo', color: '#D2B48C', size: 0.9 },
                    { id: 'africandog', name: 'African Wild Dog', color: '#8B4513', patches: 'multicolor', size: 0.8 }
                ],
                bear: [
                    { id: 'grizzly', name: 'Grizzly Bear', color: '#8B4513', size: 1.5 },
                    { id: 'polarbear', name: 'Polar Bear', color: '#F8F8FF', size: 1.6 },
                    { id: 'blackbear', name: 'Black Bear', color: '#000000', size: 1.3 },
                    { id: 'pandabear', name: 'Giant Panda', color: '#FFFFFF', patches: '#000000', size: 1.2 },
                    { id: 'sunbear', name: 'Sun Bear', color: '#000000', chest: '#FFFF00', size: 0.8 },
                    { id: 'slothbear', name: 'Sloth Bear', color: '#2F4F4F', chest: '#F5DEB3', size: 1.0 }
                ],
                primate: [
                    { id: 'chimpanzee', name: 'Chimpanzee', color: '#8B4513', size: 0.9 },
                    { id: 'gorilla', name: 'Gorilla', color: '#2F4F4F', size: 1.4 },
                    { id: 'orangutan', name: 'Orangutan', color: '#FF4500', size: 1.1 },
                    { id: 'baboon', name: 'Baboon', color: '#A0522D', size: 0.8 },
                    { id: 'macaque', name: 'Macaque', color: '#D2B48C', size: 0.6 },
                    { id: 'lemur', name: 'Ring-tailed Lemur', color: '#808080', tail: 'ringed', size: 0.5 },
                    { id: 'gibbon', name: 'Gibbon', color: '#654321', size: 0.7 }
                ],
                ungulate: [
                    { id: 'elephant', name: 'African Elephant', color: '#696969', tusks: '#F5F5DC', size: 2.0 },
                    { id: 'rhinoceros', name: 'Rhinoceros', color: '#708090', horn: '#F5F5DC', size: 1.8 },
                    { id: 'hippopotamus', name: 'Hippopotamus', color: '#696969', size: 1.6 },
                    { id: 'giraffe', name: 'Giraffe', color: '#DEB887', patches: '#8B4513', size: 2.5 },
                    { id: 'zebra', name: 'Zebra', color: '#FFFFFF', stripes: '#000000', size: 1.2 },
                    { id: 'horse', name: 'Wild Horse', color: '#8B4513', size: 1.3 },
                    { id: 'deer', name: 'White-tailed Deer', color: '#D2B48C', antlers: '#F5DEB3', size: 1.0 },
                    { id: 'elk', name: 'Elk', color: '#8B4513', antlers: '#F5DEB3', size: 1.4 },
                    { id: 'moose', name: 'Moose', color: '#654321', antlers: '#8B4513', size: 1.8 },
                    { id: 'buffalo', name: 'American Bison', color: '#654321', size: 1.7 },
                    { id: 'wildebeest', name: 'Wildebeest', color: '#696969', size: 1.3 },
                    { id: 'gazelle', name: 'Gazelle', color: '#F5DEB3', size: 0.8 },
                    { id: 'antelope', name: 'Antelope', color: '#D2B48C', size: 0.9 },
                    { id: 'impala', name: 'Impala', color: '#DEB887', size: 0.8 }
                ],
                rodent: [
                    { id: 'squirrel', name: 'Red Squirrel', color: '#8B4513', size: 0.3 },
                    { id: 'beaver', name: 'Beaver', color: '#654321', tail: 'flat', size: 0.8 },
                    { id: 'porcupine', name: 'Porcupine', color: '#8B4513', quills: true, size: 0.6 },
                    { id: 'capybara', name: 'Capybara', color: '#8B4513', size: 1.0 },
                    { id: 'chinchilla', name: 'Chinchilla', color: '#C0C0C0', size: 0.3 },
                    { id: 'groundhog', name: 'Groundhog', color: '#8B4513', size: 0.5 },
                    { id: 'marmot', name: 'Marmot', color: '#D2B48C', size: 0.4 }
                ],
                marine: [
                    { id: 'whale', name: 'Humpback Whale', color: '#2F4F4F', size: 3.0 },
                    { id: 'dolphin', name: 'Bottlenose Dolphin', color: '#708090', size: 1.2 },
                    { id: 'seal', name: 'Harbor Seal', color: '#696969', spots: '#2F4F4F', size: 1.0 },
                    { id: 'walrus', name: 'Walrus', color: '#8B4513', tusks: '#F5F5DC', size: 1.5 },
                    { id: 'otter', name: 'Sea Otter', color: '#654321', size: 0.8 },
                    { id: 'manatee', name: 'Manatee', color: '#696969', size: 1.8 }
                ]
            },
            birds: {
                raptor: [
                    { id: 'eagle', name: 'Bald Eagle', color: '#654321', head: '#FFFFFF', size: 1.0 },
                    { id: 'hawk', name: 'Red-tailed Hawk', color: '#8B4513', tail: '#B22222', size: 0.8 },
                    { id: 'falcon', name: 'Peregrine Falcon', color: '#2F4F4F', size: 0.7 },
                    { id: 'owl', name: 'Great Horned Owl', color: '#8B4513', tufts: true, size: 0.8 },
                    { id: 'vulture', name: 'Turkey Vulture', color: '#2F4F4F', head: '#FF0000', size: 1.1 },
                    { id: 'kestrel', name: 'American Kestrel', color: '#D2691E', size: 0.5 },
                    { id: 'osprey', name: 'Osprey', color: '#654321', head: '#FFFFFF', size: 0.9 }
                ],
                waterbird: [
                    { id: 'swan', name: 'Mute Swan', color: '#FFFFFF', neck: 'long', size: 1.2 },
                    { id: 'duck', name: 'Mallard Duck', color: '#654321', head: '#006400', size: 0.6 },
                    { id: 'goose', name: 'Canada Goose', color: '#654321', neck: '#000000', size: 1.0 },
                    { id: 'pelican', name: 'Brown Pelican', color: '#8B4513', pouch: true, size: 1.3 },
                    { id: 'flamingo', name: 'Flamingo', color: '#FF69B4', neck: 'curved', size: 1.1 },
                    { id: 'heron', name: 'Great Blue Heron', color: '#4682B4', neck: 'long', size: 1.2 },
                    { id: 'crane', name: 'Sandhill Crane', color: '#808080', size: 1.4 }
                ],
                exotic: [
                    { id: 'peacock', name: 'Peacock', color: '#4169E1', tail: 'fanned', size: 1.0 },
                    { id: 'parrot', name: 'Scarlet Macaw', color: '#FF0000', wings: 'colorful', size: 0.8 },
                    { id: 'toucan', name: 'Toucan', color: '#000000', beak: '#FF8C00', size: 0.7 },
                    { id: 'penguin', name: 'Emperor Penguin', color: '#000000', belly: '#FFFFFF', size: 1.0 },
                    { id: 'ostrich', name: 'Ostrich', color: '#000000', neck: 'long', size: 2.0 },
                    { id: 'emu', name: 'Emu', color: '#654321', size: 1.8 },
                    { id: 'cassowary', name: 'Cassowary', color: '#000000', casque: true, size: 1.6 }
                ]
            },
            reptiles: {
                serpent: [
                    { id: 'python', name: 'Burmese Python', color: '#8B4513', pattern: 'diamond', size: 1.5 },
                    { id: 'cobra', name: 'King Cobra', color: '#2F4F4F', hood: true, size: 1.8 },
                    { id: 'viper', name: 'Gaboon Viper', color: '#8B4513', pattern: 'geometric', size: 1.0 },
                    { id: 'rattlesnake', name: 'Diamondback Rattlesnake', color: '#D2B48C', rattle: true, size: 1.2 },
                    { id: 'anaconda', name: 'Green Anaconda', color: '#006400', size: 2.0 },
                    { id: 'mamba', name: 'Black Mamba', color: '#2F2F2F', size: 1.4 }
                ],
                lizard: [
                    { id: 'iguana', name: 'Green Iguana', color: '#228B22', spines: true, size: 1.0 },
                    { id: 'komodo', name: 'Komodo Dragon', color: '#696969', size: 1.8 },
                    { id: 'gecko', name: 'Tokay Gecko', color: '#4169E1', spots: '#FF4500', size: 0.3 },
                    { id: 'chameleon', name: 'Panther Chameleon', color: '#32CD32', eyes: 'rotating', size: 0.4 },
                    { id: 'monitor', name: 'Nile Monitor', color: '#2F4F4F', bands: '#FFFF00', size: 1.2 },
                    { id: 'skink', name: 'Blue-tongued Skink', color: '#8B4513', tongue: '#0000FF', size: 0.5 }
                ],
                crocodilian: [
                    { id: 'alligator', name: 'American Alligator', color: '#2F4F4F', size: 2.2 },
                    { id: 'crocodile', name: 'Saltwater Crocodile', color: '#556B2F', size: 2.5 },
                    { id: 'caiman', name: 'Black Caiman', color: '#000000', size: 1.8 },
                    { id: 'gharial', name: 'Gharial', color: '#696969', snout: 'narrow', size: 2.0 }
                ],
                turtle: [
                    { id: 'seaturtle', name: 'Green Sea Turtle', color: '#228B22', size: 1.2 },
                    { id: 'snappingturtle', name: 'Snapping Turtle', color: '#2F4F4F', spikes: true, size: 0.8 },
                    { id: 'tortoise', name: 'Galápagos Tortoise', color: '#654321', size: 1.5 },
                    { id: 'boxturtle', name: 'Box Turtle', color: '#8B4513', pattern: 'radiating', size: 0.4 }
                ]
            },
            amphibians: [
                { id: 'frog', name: 'American Bullfrog', color: '#228B22', size: 0.3 },
                { id: 'toad', name: 'Cane Toad', color: '#8B4513', warts: true, size: 0.4 },
                { id: 'salamander', name: 'Fire Salamander', color: '#000000', spots: '#FFFF00', size: 0.3 },
                { id: 'axolotl', name: 'Axolotl', color: '#FFB6C1', gills: true, size: 0.4 }
            ],
            fish: {
                predator: [
                    { id: 'shark', name: 'Great White Shark', color: '#708090', size: 2.0 },
                    { id: 'barracuda', name: 'Great Barracuda', color: '#C0C0C0', size: 1.2 },
                    { id: 'pike', name: 'Northern Pike', color: '#556B2F', size: 1.0 },
                    { id: 'bass', name: 'Largemouth Bass', color: '#228B22', size: 0.8 }
                ],
                exotic: [
                    { id: 'angelfish', name: 'Angelfish', color: '#FFD700', stripes: '#000000', size: 0.4 },
                    { id: 'clownfish', name: 'Clownfish', color: '#FF4500', stripes: '#FFFFFF', size: 0.3 },
                    { id: 'tang', name: 'Blue Tang', color: '#4169E1', size: 0.4 },
                    { id: 'pufferfish', name: 'Pufferfish', color: '#FFFF00', spines: true, size: 0.5 }
                ]
            },
            arthropods: [
                { id: 'spider', name: 'Tarantula', color: '#654321', legs: 8, size: 0.3 },
                { id: 'scorpion', name: 'Emperor Scorpion', color: '#000000', claws: true, size: 0.4 },
                { id: 'crab', name: 'Coconut Crab', color: '#B22222', claws: 'large', size: 0.6 },
                { id: 'lobster', name: 'American Lobster', color: '#8B0000', size: 0.8 }
            ],
            mythical: [
                { id: 'dragon', name: 'Fire Dragon', color: '#B22222', wings: true, size: 2.0 },
                { id: 'phoenix', name: 'Phoenix', color: '#FF4500', flames: true, size: 1.2 },
                { id: 'griffin', name: 'Griffin', color: '#D2691E', wings: 'eagle', size: 1.5 },
                { id: 'unicorn', name: 'Unicorn', color: '#FFFFFF', horn: 'spiral', size: 1.3 }
            ]
        };
        
        this.selectedModels = new Set(); // Track selected models
        this.initializeSearchIndex();
    }

    initializeSearchIndex() {
        this.searchIndex = [];
        this.flatAnimals = [];
        
        for (const category in this.animals) {
            if (typeof this.animals[category] === 'object' && !Array.isArray(this.animals[category])) {
                // Nested categories (mammals, birds, reptiles, fish)
                for (const subcategory in this.animals[category]) {
                    this.animals[category][subcategory].forEach(animal => {
                        animal.category = category;
                        animal.subcategory = subcategory;
                        this.flatAnimals.push(animal);
                        this.searchIndex.push({
                            id: animal.id,
                            searchText: `${animal.name} ${category} ${subcategory}`.toLowerCase()
                        });
                    });
                }
            } else {
                // Direct categories (amphibians, arthropods, mythical)
                this.animals[category].forEach(animal => {
                    animal.category = category;
                    this.flatAnimals.push(animal);
                    this.searchIndex.push({
                        id: animal.id,
                        searchText: `${animal.name} ${category}`.toLowerCase()
                    });
                });
            }
        }
    }

    searchAnimals(query) {
        if (!query) return this.getAvailableAnimals();
        
        const lowerQuery = query.toLowerCase();
        const matchingIds = this.searchIndex
            .filter(item => item.searchText.includes(lowerQuery))
            .map(item => item.id);
            
        return this.flatAnimals.filter(animal => 
            matchingIds.includes(animal.id) && !this.selectedModels.has(animal.id)
        );
    }

    getAvailableAnimals() {
        return this.flatAnimals.filter(animal => !this.selectedModels.has(animal.id));
    }

    getAnimalsByCategory(category, subcategory = null) {
        if (subcategory) {
            return this.animals[category][subcategory]?.filter(animal => 
                !this.selectedModels.has(animal.id)
            ) || [];
        }
        
        if (Array.isArray(this.animals[category])) {
            return this.animals[category].filter(animal => !this.selectedModels.has(animal.id));
        }
        
        let result = [];
        for (const sub in this.animals[category]) {
            result = result.concat(
                this.animals[category][sub].filter(animal => !this.selectedModels.has(animal.id))
            );
        }
        return result;
    }

    selectAnimal(animalId) {
        this.selectedModels.add(animalId);
        return this.flatAnimals.find(animal => animal.id === animalId);
    }

    releaseAnimal(animalId) {
        this.selectedModels.delete(animalId);
    }

    resetSelections() {
        this.selectedModels.clear();
    }

    getAnimalById(id) {
        return this.flatAnimals.find(animal => animal.id === id);
    }

    getAllCategories() {
        return Object.keys(this.animals);
    }

    getSubcategories(category) {
        if (Array.isArray(this.animals[category])) return [];
        return Object.keys(this.animals[category]);
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalModelDatabase;
} else {
    window.AnimalModelDatabase = AnimalModelDatabase;
}