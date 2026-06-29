// database.js
// Base de données avec persistance LocalStorage

// 1. Nos recettes par défaut (catalogue de base)
const defaultRecipes = [
    {
        id: 1,
        nom: "Risotto aux Champignons Sauvages",
        categorie: "Plat",
        origine: "italienne",
        tempsCuisson: "35 min",
        description: "Un grand classique crémeux lié au parmesan vieux, agrémenté de cèpes fraîchement cueillis et d'une pointe d'huile de truffe.",
        tags: ["Artisanal & Chaud"],
        isFavorite: false,
        imageFallback: "[ Illustration Risotto ]"
    },
    {
        id: 2,
        nom: "Gyoza Dorés au Porc et Ciboule",
        categorie: "Entrée",
        origine: "japonaise",
        tempsCuisson: "45 min",
        description: "Raviolis japonais croustillants d'un côté et fondants de l'autre, farcis avec soin et servis avec une sauce vinaigrée au sésame.",
        tags: ["Précis & Savoureux"],
        isFavorite: false,
        imageFallback: "[ Illustration Gyoza ]"
    },
    {
        id: 3,
        nom: "Tarte Tatin aux Pommes Confites",
        categorie: "Dessert",
        origine: "française",
        tempsCuisson: "50 min",
        description: "Pommes caramélisées de longues heures au beurre demi-sel sur une pâte feuilletée croustillante maison. Servie tiède.",
        tags: ["Gourmand & Tradition"],
        isFavorite: false,
        imageFallback: "[ Illustration Tatin ]"
    },
    {
        id: 4,
        nom: "Smash Burger au Cheddar Affiné",
        categorie: "Plat",
        origine: "fast food",
        tempsCuisson: "20 min",
        description: "Viande de bœuf croustillante sur les bords, oignons caramélisés sous le smash, sauce secrète maison dans un pain brioché toasté.",
        tags: ["Sur le pouce"],
        isFavorite: true,
        imageFallback: "[ Illustration Burger ]"
    },
    {
        id: 5,
        nom: "Poulet du Général Tao",
        categorie: "Plat",
        origine: "chinoise",
        tempsCuisson: "40 min",
        description: "Morceaux de poulet frits enrobés d'une sauce sirupeuse, douce et légèrement épicée, parsemés de graines de sésame torréfiées.",
        tags: ["Sucré-Salé"],
        isFavorite: false,
        imageFallback: "[ Illustration Poulet Tao ]"
    },
    {
        id: 6,
        nom: "Macaroni and Cheese Truffé",
        categorie: "Plat",
        origine: "américaine",
        tempsCuisson: "30 min",
        description: "Le summum du réconfort : des pâtes enrobées d'une béchamel fondante au cheddar mature, gratinées au four avec de la chapelure panko.",
        tags: ["Réconfortant"],
        isFavorite: false,
        imageFallback: "[ Illustration Mac & Cheese ]"
    }
];

// 2. Récupération des données depuis le navigateur
// On parse le JSON stocké. Si c'null (vide), on utilise nos recettes par défaut.
let magicRecipes = JSON.parse(localStorage.getItem('magic_recipes_db'));

if (!magicRecipes) {
    magicRecipes = defaultRecipes;
    // On sauvegarde immédiatement la base par défaut dans le navigateur
    localStorage.setItem('magic_recipes_db', JSON.stringify(magicRecipes));
}

// 3. Fonction utilitaire pour sauvegarder tout nouveau changement
function saveDatabase() {
    localStorage.setItem('magic_recipes_db', JSON.stringify(magicRecipes));
}
