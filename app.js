// app.js
// Logique et interactivité de l'application Magic Recipe

document.addEventListener("DOMContentLoaded", () => {
    // 1. SÉLECTION DES ÉLÉMENTS DU DOM
    const catalogGrid = document.getElementById("catalog-grid");
    const favoritesGrid = document.getElementById("favorites-grid");
    const favCountElement = document.getElementById("fav-count");
    const filterContainer = document.getElementById("catalog-filters");
    const navLinks = document.querySelectorAll(".nav-link");

    // 2. FONCTION DE RENDU D'UNE CARTE DE RECETTE (Génère le HTML d'une recette)
    function createRecipeCardHtml(recipe) {
        // Gestion de l'état du bouton favori (cœur plein si favori)
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
        // --- Rendu du catalogue filtré ---
        // On récupère la catégorie actuellement active
        const activeFilterButton = filterContainer.querySelector(".tab-button.active");
        const selectedOrigine = activeFilterButton ? activeFilterButton.getAttribute("data-origine") : "toutes";

        // Filtrage des recettes
        const filteredRecipes = selectedOrigine === "toutes" 
            ? magicRecipes 
            : magicRecipes.filter(recipe => recipe.origine === selectedOrigine);

        // Injection dans la grille du catalogue
        if (filteredRecipes.length === 0) {
            catalogGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-light); font-style: italic; padding: 2rem;">Aucune recette dans cette catégorie pour le moment.</p>`;
        } else {
            catalogGrid.innerHTML = filteredRecipes.map(recipe => createRecipeCardHtml(recipe)).join("");
        }

        // --- Rendu des Favoris ---
        const favoriteRecipes = magicRecipes.filter(recipe => recipe.isFavorite);
        
        // Mise à jour du compteur de favoris
        const count = favoriteRecipes.length;
        favCountElement.textContent = `${count} recette${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}`;

        // Injection dans la grille des favoris
        if (favoriteRecipes.length === 0) {
            favoritesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-light); font-style: italic; padding: 2rem;">Vous n'avez pas encore de recettes préférées. Cliquez sur le cœur d'une recette pour l'ajouter ici.</p>`;
        } else {
            favoritesGrid.innerHTML = favoriteRecipes.map(recipe => createRecipeCardHtml(recipe)).join("");
        }

        // Réattacher les écouteurs d'événements sur les boutons favoris fraîchement créés
        attachFavoriteButtonListeners();
    }

    // 4. GESTION DES CLICS SUR LES ONGLETS DE FILTRAGE
    filterContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-button")) {
            // Désactiver l'ancien onglet actif
            filterContainer.querySelector(".tab-button.active").classList.remove("active");
            // Activer le nouveau
            e.target.classList.add("active");
            // Rafraîchir l'affichage
            updateAppDisplay();
        }
    });

    // 5. LOGIQUE DU BOUTON FAVORIS (Le Cœur)
    function attachFavoriteButtonListeners() {
        // On sélectionne TOUS les boutons favoris présents sur l'écran (catalogue + section favoris)
        const favButtons = document.querySelectorAll(".recipe-fav-btn");
        
        favButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                // On récupère le bouton ou le SVG cliqué
                const btn = e.target.closest(".recipe-fav-btn");
                const recipeId = parseInt(btn.getAttribute("data-id"), 10);

                // Trouver la recette correspondante dans notre database locale
                const recipe = magicRecipes.find(r => r.id === recipeId);
                
                if (recipe) {
                    // Inverser l'état favori
                    recipe.isFavorite = !recipe.isFavorite;
                    // Mettre à jour l'affichage global de l'app
                    updateAppDisplay();
                }
            });
        });
    }

    // 6. ANIMATION DE LA NAVIGATION PRINCIPALE (Header)
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            document.querySelector(".nav-link.active").classList.remove("active");
            link.classList.add("active");
            // Laisse le comportement naturel de l'ancre (#creation, #catalogues...) s'exécuter
        });
    });

    // 7. INITIALISATION AU PREMIER CHARGEMENT
    updateAppDisplay();
});
