// app.js
// Logique et interactivité de l'application Magic Recipe

document.addEventListener("DOMContentLoaded", () => {
    // 1. SÉLECTION DES ÉLÉMENTS DU DOM
    const catalogGrid = document.getElementById("catalog-grid");
    const favoritesGrid = document.getElementById("favorites-grid");
    const favCountElement = document.getElementById("fav-count");
    const filterContainer = document.getElementById("catalog-filters");
    const navLinks = document.querySelectorAll(".nav-link");
    
    // Nouveaux éléments pour le générateur
    const generatorForm = document.getElementById("generator-form");
    const titleInput = document.getElementById("recipe-title");
    const envieInput = document.getElementById("recipe-envie");
    const submitBtn = generatorForm.querySelector("button[type='submit']");

    // 2. FONCTION DE RENDU D'UNE CARTE DE RECETTE
    function createRecipeCardHtml(recipe) {
        const favBtnClass = recipe.isFavorite ? "recipe-fav-btn active" : "recipe-fav-btn";
        const favIconColor = recipe.isFavorite ? "currentColor" : "none";

        return `
            <article class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-image-wrapper">
                    <div class="recipe-image-placeholder">${recipe.imageFallback}</div>
                    <span class="recipe-badge">${recipe.categorie}</span>
                    <button class="${favBtnClass}" aria-label="Ajouter ou retirer des préférées" data-id="${recipe.id}">
                        <svg width="20" height="20" fill="${favIconColor}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                </div>
                <div class="recipe-content">
                    <div class="recipe-meta">${recipe.origine} • ${recipe.tempsCuisson}</div>
                    <h3 class="recipe-name">${recipe.nom}</h3>
                    <p class="recipe-desc">${recipe.description}</p>
                    <div class="recipe-footer">
                        <span class="recipe-tag">${recipe.tags[0]}</span>
                        <button class="btn btn-secondary btn-detail" style="padding: 0.4rem 1rem; font-size: 0.8rem;">Voir les détails</button>
                    </div>
                </div>
            </article>
        `;
    }

    // 3. FONCTION PRINCIPALE D'AFFICHAGE
    function updateAppDisplay() {
        const activeFilterButton = filterContainer.querySelector(".tab-button.active");
        const selectedOrigine = activeFilterButton ? activeFilterButton.getAttribute("data-origine") : "toutes";

        const filteredRecipes = selectedOrigine === "toutes" 
            ? magicRecipes 
            : magicRecipes.filter(recipe => recipe.origine === selectedOrigine);

        if (filteredRecipes.length === 0) {
            catalogGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-light); font-style: italic; padding: 2rem;">Aucune recette dans cette catégorie pour le moment.</p>`;
        } else {
            catalogGrid.innerHTML = filteredRecipes.map(recipe => createRecipeCardHtml(recipe)).join("");
        }

        const favoriteRecipes = magicRecipes.filter(recipe => recipe.isFavorite);
        const count = favoriteRecipes.length;
        favCountElement.textContent = `${count} recette${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}`;

        if (favoriteRecipes.length === 0) {
            favoritesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-light); font-style: italic; padding: 2rem;">Vous n'avez pas encore de recettes préférées.</p>`;
        } else {
            favoritesGrid.innerHTML = favoriteRecipes.map(recipe => createRecipeCardHtml(recipe)).join("");
        }

        attachFavoriteButtonListeners();
    }

    // 4. GESTION DES CLICS SUR LES ONGLETS DE FILTRAGE
    filterContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-button")) {
            filterContainer.querySelector(".tab-button.active").classList.remove("active");
            e.target.classList.add("active");
            updateAppDisplay();
        }
    });

    // 5. LOGIQUE DU BOUTON FAVORIS (Le Cœur)
    function attachFavoriteButtonListeners() {
        const favButtons = document.querySelectorAll(".recipe-fav-btn");
        favButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const btn = e.target.closest(".recipe-fav-btn");
                const recipeId = parseInt(btn.getAttribute("data-id"), 10);
                const recipe = magicRecipes.find(r => r.id === recipeId);
                
                if (recipe) {
                    recipe.isFavorite = !recipe.isFavorite;
                    updateAppDisplay();
                }
            });
        });
    }

    // 6. ANIMATION DE LA NAVIGATION PRINCIPALE
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            document.querySelector(".nav-link.active").classList.remove("active");
            link.classList.add("active");
        });
    });

    // 7. SIMULATEUR DE GÉNÉRATION DE RECETTE (NOUVEAU)
    generatorForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        const titleValue = titleInput.value.trim();
        const envieValue = envieInput.value.trim();

        if (!titleValue || !envieValue) return;

        // Feedback visuel : on désactive le bouton et on change le texte
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Alchimie culinaire en cours...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        // Simulation d'un appel réseau / réflexion de l'IA (1.5 secondes)
        setTimeout(() => {
            // Création d'une nouvelle recette à la volée
            const newRecipe = {
                id: Date.now(), // Génère un ID unique basé sur l'heure exacte
                nom: `✨ ${titleValue}`,
                categorie: "Création",
                origine: "maison", 
                tempsCuisson: Math.floor(Math.random() * 20 + 10) + " min", // Temps aléatoire entre 10 et 30 min
                description: `Une création unique imaginée pour satisfaire votre envie : "${envieValue}". Mijotée avec amour par notre algorithme artisanal.`,
                tags: ["Généré sur-mesure"],
                isFavorite: true, // On l'ajoute automatiquement aux préférées
                imageFallback: "[ Illustration Création ]"
            };

            // Ajout au DEBUT du tableau de la base de données
            magicRecipes.unshift(newRecipe);

            // Rafraîchissement global de l'affichage
            updateAppDisplay();

            // Nettoyage du formulaire et retour à la normale du bouton
            generatorForm.reset();
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";

            // Défilement automatique vers la section "Mes recettes" pour voir le résultat
            document.getElementById("mes-recettes").scrollIntoView({ behavior: 'smooth' });

        }, 1500);
    });

    // 8. INITIALISATION AU PREMIER CHARGEMENT
    updateAppDisplay();
});
