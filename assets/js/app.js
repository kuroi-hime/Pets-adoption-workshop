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

// Connecter les boutons aux fonctions
likeBtn.addEventListener('click', () => handleAction('like'));
skipBtn.addEventListener('click', () => handleAction('skip'));

// Fonctionnalité du bouton recommencer
document.getElementById('restart-btn').addEventListener('click', function() {
    // Cacher le résumé
    document.getElementById('summary').classList.add('hidden');
    // Montrer l'application principale
    document.getElementById('app-container').classList.remove('hidden');
    // Réinitialiser les variables
    adoptedPets.length = 0; // Vider le tableau des animaux adoptés
    currentCardIndex = 0;   // Réinitialiser à la première carte
    // Recharger les données et recommencer
    petData = getPetData();
    if (petData.length > 0) {
        renderNextCard();
    }
});

// Obtenir les éléments du formulaire
const petForm = document.getElementById('pet-form');
const petIdInput = document.getElementById('pet-id');
const petNameInput = document.getElementById('pet-name');
const petAgeInput = document.getElementById('pet-age');
const petImgInput = document.getElementById('pet-img');
const petDescInput = document.getElementById('pet-desc');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formCancelBtn = document.getElementById('form-cancel-btn');

// Fonction pour valider les entrées du formulaire
function validateForm() {
    let isValid = true;
    
    // Effacer les messages d'erreur précédents
    document.querySelectorAll('.error-message').forEach(msg => msg.classList.remove('show'));
    document.querySelectorAll('input').forEach(input => input.classList.remove('error'));
    
    // Valider le nom (doit faire 2-30 caractères)
    if (petNameInput.value.length < 2 || petNameInput.value.length > 30) {
        showError('name-error', petNameInput);
        isValid = false;
    }
    
    // Valider l'âge (doit être 1-20)
    const age = parseInt(petAgeInput.value);
    if (age < 1 || age > 20) {
        showError('age-error', petAgeInput);
        isValid = false;
    }
    
    // Valider l'URL (doit être un format d'URL valide)
    try {
        new URL(petImgInput.value);
    } catch {
        showError('img-error', petImgInput);
        isValid = false;
    }
    
    // Valider la description (doit faire 5-100 caractères)
    if (petDescInput.value.length < 5 || petDescInput.value.length > 100) {
        showError('desc-error', petDescInput);
        isValid = false;
    }
    
    return isValid;
}

// Fonction pour afficher un message d'erreur
function showError(errorId, input) {
    document.getElementById(errorId).classList.add('show');
    input.classList.add('error');
}

// Fonction pour gérer la soumission du formulaire
function handleFormSubmit(e) {
    // Empêcher la soumission par défaut du formulaire
    e.preventDefault();
    
    // Valider le formulaire d'abord
    if (!validateForm()) {
        return; // Arrêter si la validation échoue
    }

    // Créer un objet animal à partir des données du formulaire
    const pet = {
        name: petNameInput.value.trim(),
        age: parseInt(petAgeInput.value),
        img: petImgInput.value.trim(),
        desc: petDescInput.value.trim(),
        id: parseInt(petIdInput.value) || Date.now() // Utiliser l'ID existant ou en créer un nouveau
    };

    // Vérifier si nous mettons à jour un animal existant ou en créons un nouveau
    if (parseInt(petIdInput.value)) {
        updatePet(pet); // Mettre à jour existant
    } else {
        addPet(pet); // Créer nouveau
    }

    // Réinitialiser le formulaire et actualiser le tableau
    resetForm();
    renderPetTable();
}

// Fonction pour réinitialiser le formulaire à l'état initial
function resetForm() {
    petForm.reset(); // Effacer tous les champs du formulaire
    petIdInput.value = '';
    formSubmitBtn.textContent = 'Ajouter Animal';
    formCancelBtn.classList.add('hidden');
    
    // Réinitialiser le titre du formulaire
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Ajouter un Nouvel Animal';
    }
}

// Ajouter un écouteur d'événement au formulaire
petForm.addEventListener('submit', handleFormSubmit);
formCancelBtn.addEventListener('click', resetForm);

// Obtenir les éléments de filtre
const searchInput = document.getElementById('search-input');
const ageFilter = document.getElementById('age-filter');
const sortSelect = document.getElementById('sort-select');
const clearFiltersBtn = document.getElementById('clear-filters');

// Objet pour stocker les paramètres de filtre actuels
let currentFilters = {
    search: '',
    age: '',
    sort: 'name-asc'
};

// Fonction pour obtenir les données d'animaux filtrées et triées
function getFilteredPets() {
    let data = getPetData();
    
    // Appliquer le filtre de recherche
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        data = data.filter(pet => 
            pet.name.toLowerCase().includes(searchTerm) || 
            pet.desc.toLowerCase().includes(searchTerm)
        );
    }
    
    // Appliquer le filtre d'âge
    if (currentFilters.age) {
        if (currentFilters.age === '4') {
            // 4+ ans
            data = data.filter(pet => pet.age >= 4);
        } else {
            // Correspondance d'âge exacte
            data = data.filter(pet => pet.age == currentFilters.age);
        }
    }
    
    // Appliquer le tri
    data.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'age-asc': return a.age - b.age;
            case 'age-desc': return b.age - a.age;
            default: return 0;
        }
    });
    
    return data;
}

// Écouteur d'événement d'entrée de recherche
searchInput.addEventListener('input', (e) => {
    currentFilters.search = e.target.value;
    renderPetTable();
});

// Écouteur d'événement de filtre d'âge
ageFilter.addEventListener('change', (e) => {
    currentFilters.age = e.target.value;
    renderPetTable();
});

// Écouteur d'événement de sélection de tri
sortSelect.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    renderPetTable();
});

// Bouton effacer les filtres
clearFiltersBtn.addEventListener('click', () => {
    currentFilters = { search: '', age: '', sort: 'name-asc' };
    searchInput.value = '';
    ageFilter.value = '';
    sortSelect.value = 'name-asc';
    renderPetTable();
});

/**
 * 📊 SYSTÈME DE RENDU DE TABLEAU - Afficher les animaux dans un tableau HTML
 * 
 * PROBLÈME : Montrer les données d'animaux filtrées dans un format lisible
 * SOLUTION : Générer dynamiquement des lignes de tableau HTML
 * 
 * FLUX LOGIQUE :
 * 1. Obtenir les données filtrées
 * 2. Vider le contenu existant du tableau
 * 3. Mettre à jour l'affichage du nombre d'animaux
 * 4. Générer du HTML pour chaque animal
 * 5. Ajouter des boutons d'action (Éditer/Supprimer)
 */
function renderPetTable() {
    const data = getFilteredPets();
    const petTableBody = document.getElementById('pet-table-body');
    petTableBody.innerHTML = ''; // Vider le contenu existant
    
    // METTRE À JOUR L'AFFICHAGE DU NOMBRE D'ANIMAUX
    const petCount = document.getElementById('pet-count');
    if (petCount) {
        // Pluralisation correcte : "1 animal" vs "2 animaux"
        petCount.textContent = `${data.length} animal${data.length !== 1 ? 'aux' : ''}`;
    }

    // GÉRER LES RÉSULTATS VIDES
    if (data.length === 0) {
        petTableBody.innerHTML = '<tr><td colspan="4">Aucun animal trouvé.</td></tr>';
        return;
    }

    // GÉNÉRER LES LIGNES DU TABLEAU
    data.forEach(pet => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pet.name}</td>
            <td>${pet.age}</td>
            <td>${pet.desc}</td>
            <td>
                <button class="edit-btn" data-id="${pet.id}">Modifier</button>
                <button class="delete-btn" data-id="${pet.id}">Supprimer</button>
            </td>
        `;
        petTableBody.appendChild(row);
        /*
        ATTRIBUTS DE DONNÉES EXPLIQUÉS :
        - data-id="${pet.id}" stocke l'ID de l'animal dans le bouton
        - Plus tard, nous pouvons récupérer cet ID quand le bouton est cliqué
        - Ceci connecte le bouton aux données spécifiques de l'animal
        */
    });
}

// Fonction pour basculer entre les vues app et admin
function toggleViews() {
    const isAdminView = !adminView.classList.contains('hidden');
    
    if (isAdminView) {
        // Basculer vers la vue app
        adminView.classList.add('hidden');
        appView.classList.remove('hidden');
        toggleViewBtn.textContent = 'Gérer les Animaux';
        // Redémarrer l'app avec des données fraîches
        petData = getPetData();
        currentCardIndex = 0;
        adoptedPets.length = 0;
        if (petData.length > 0) {
            renderNextCard();
        }
    } else {
        // Basculer vers la vue admin
        adminView.classList.remove('hidden');
        appView.classList.add('hidden');
        toggleViewBtn.textContent = 'Voir l\'App ❤️';
        renderPetTable();
    }
}

// Ajouter un écouteur d'événement au bouton de basculement
toggleViewBtn.addEventListener('click', toggleViews);