// Clé de stockage - c'est comme un "nom de table" dans notre "base de données" localStorage
const STORAGE_KEY = 'petDB';

// Données initiales des animaux - ceci agit comme nos "données de départ" quand l'app démarre
// Chaque animal est un objet avec des propriétés : id, name, age, img, desc
const initialPetData = [
    { 
        id: 1678886400001,  // Identifiant unique (basé sur timestamp)
        name: 'Buddy', 
        age: 2, 
        img: 'https://i.pinimg.com/736x/27/13/a0/2713a0b48576c6626ad4c9b4c26619ec.jpg', 
        desc: 'Aime les longues promenades.' 
    },
    { 
        id: 1678886400002, 
        name: 'Misty', 
        age: 1, 
        img: 'https://cdn2.thecatapi.com/images/531.jpg', 
        desc: 'Expert en siestes.' 
    },
    { 
        id: 1678886400003, 
        name: 'Rex', 
        age: 4, 
        img: 'https://images.dog.ceo/breeds/boxer/n02108089_11032.jpg', 
        desc: 'Très joueur.' 
    },
    { 
        id: 1678886400004, 
        name: 'Whiskers', 
        age: 3, 
        img: 'https://apluscostumes.com/wp-content/uploads/2022/08/large-dog-costume-granny.jpg', 
        desc: 'Indépendant et câlin.' 
    }
];

// Obtenir des références aux éléments HTML
const appView = document.getElementById('app-view');
const cardContainer = document.getElementById('card-container');
const likeBtn = document.getElementById('like-btn');
const skipBtn = document.getElementById('skip-btn');
const adminView = document.getElementById('admin-view');
const toggleViewBtn = document.getElementById('toggle-view-btn');

/**
 * 📖 OPÉRATION DE LECTURE - Obtenir tous les animaux du localStorage
 * 
 * FLUX LOGIQUE :
 * 1. Essayer d'obtenir les données du localStorage avec notre clé
 * 2. Si les données existent, les analyser de chaîne JSON vers objet JavaScript
 * 3. Si aucune donnée n'existe, retourner un tableau vide
 * 
 * POURQUOI JSON.parse() ?
 * localStorage ne stocke que des chaînes, mais nous avons besoin d'objets JavaScript
 */
function getPetData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 💾 OPÉRATION DE SAUVEGARDE - Stocker les données d'animaux dans localStorage
 * 
 * FLUX LOGIQUE :
 * 1. Convertir l'objet/tableau JavaScript en chaîne JSON
 * 2. Stocker dans localStorage avec notre clé
 * 
 * POURQUOI JSON.stringify() ?
 * localStorage n'accepte que les chaînes, donc nous convertissons les objets en JSON
 */
function savePetData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 🚀 INITIALISATION - Configurer la base de données avec des données par défaut
 * 
 * FLUX LOGIQUE :
 * 1. Vérifier si la base de données est vide
 * 2. Si vide, peupler avec les données initiales
 * 3. Ceci assure que les utilisateurs ont toujours des animaux pour commencer
 */
function initializeDB() {
    const data = getPetData();
    if (data.length === 0) {
        savePetData(initialPetData);
    }
}

// CRÉER - Ajouter un nouvel animal
function addPet(pet) {
    // Obtenir les données actuelles
    const data = getPetData();
    // Ajouter le nouvel animal au tableau
    data.push(pet);
    // Sauvegarder les données mises à jour
    savePetData(data);
}

// METTRE À JOUR - Modifier un animal existant
function updatePet(updatedPet) {
    // Obtenir les données actuelles
    let data = getPetData();
    // Remplacer l'animal avec le même ID
    data = data.map(pet => (pet.id === updatedPet.id ? updatedPet : pet));
    // Sauvegarder les données mises à jour
    savePetData(data);
}

// SUPPRIMER - Retirer un animal
function deletePet(petId) {
    // Obtenir les données actuelles
    let data = getPetData();
    // Retirer l'animal avec l'ID correspondant
    data = data.filter(pet => pet.id !== petId);
    // Sauvegarder les données mises à jour
    savePetData(data);
}

// Variables pour suivre l'état de l'application
let petData = []; // Contiendra tous les animaux
let currentCardIndex = 0; // Quelle carte nous montrons
const adoptedPets = []; // Animaux que l'utilisateur a aimés

// Fonction pour créer le HTML d'une carte d'animal
function createCardElement(pet) {
    // Créer un nouvel élément div
    const card = document.createElement('div');
    // Ajouter une classe CSS
    card.classList.add('pet-card');
    // Stocker l'ID de l'animal dans un attribut de données
    card.dataset.id = pet.id;
    // Définir le contenu HTML en utilisant un littéral de gabarit
    card.innerHTML = `
        <img src="${pet.img}" alt="${pet.name}">
        <div class="pet-card-info">
            <h3>${pet.name} <span style="font-weight:normal; color: #555;">(${pet.age} ans)</span></h3>
            <p>${pet.desc}</p>
        </div>
    `;
    // Ajouter la fonctionnalité de glissement (nous l'ajouterons plus tard)
    card.addEventListener('mousedown', dragStart);
    card.addEventListener('touchstart', dragStart, { passive: false });
    return card;
}

// Fonction pour afficher la prochaine carte d'animal
function renderNextCard() {
    // Vérifier si nous avons montré tous les animaux
    if (currentCardIndex >= petData.length) {
        showSummary();
        return;
    }
    
    // Vider le conteneur
    cardContainer.innerHTML = '';
    // Obtenir l'animal actuel
    const pet = petData[currentCardIndex];
    // Créer l'élément carte
    const card = createCardElement(pet);
    // Ajouter au conteneur
    cardContainer.appendChild(card);
}

// Fonction pour gérer l'action aimer ou passer
function handleAction(action) {
    // Obtenir l'élément carte actuel
    const currentCard = cardContainer.querySelector('.pet-card');
    if (!currentCard) return; // Sortir s'il n'y a pas de carte
    
    if (action === 'like') {
        // Obtenir l'ID de l'animal depuis la carte
        const petId = parseInt(currentCard.dataset.id);
        // Trouver l'objet animal
        const pet = petData.find(p => p.id === petId);
        // Ajouter aux animaux adoptés
        adoptedPets.push(pet);
        // Ajouter la classe d'animation
        currentCard.classList.add('swipe-right');
    } else {
        // Ajouter la classe d'animation de passage
        currentCard.classList.add('swipe-left');
    }
    
    // Attendre que l'animation se termine, puis montrer la prochaine carte
    currentCard.addEventListener('transitionend', () => {
        currentCardIndex++;
        renderNextCard();
    }, { once: true });
}

// Fonction pour afficher le résumé des animaux adoptés
function showSummary() {
    // Cacher l'application principale
    document.getElementById('app-container').classList.add('hidden');
    // Montrer la section résumé
    document.getElementById('summary').classList.remove('hidden');
    
    const adoptedList = document.getElementById('adopted-list');
    adoptedList.innerHTML = '';
    
    if (adoptedPets.length === 0) {
        adoptedList.innerHTML = "<p>Vous n'avez adopté aucun animal cette fois-ci.</p>";
        return;
    }
    
    // Créer une carte pour chaque animal adopté
    adoptedPets.forEach(pet => {
        const adoptedCard = document.createElement('div');
        adoptedCard.classList.add('adopted-card');
        adoptedCard.innerHTML = `<img src="${pet.img}" alt="${pet.name}"><p>${pet.name}</p>`;
        adoptedList.appendChild(adoptedCard);
    });
}