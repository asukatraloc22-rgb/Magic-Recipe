// app.js
// Logique, interactivité et persistance des données

document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.getElementById("catalog-grid");
    const favoritesGrid = document.getElementById("favorites-grid");
    const favCountElement = document.getElementById("fav-count");
    const filterContainer = document.getElementById("catalog-filters");
    const navLinks = document.querySelectorAll(".nav-link");
    
    const generatorForm = document.getElementById("generator-form");
    const titleInput = document.getElementById("recipe-title");
    const envieInput = document.getElementById("recipe-envie");
    const submitBtn = generatorForm.querySelector("button[type='submit']");

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

    filterContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-button")) {
            filterContainer.querySelector(".tab-button.active").classList.remove("active");
            e.target.classList.add("active");
            updateAppDisplay();
        }
    });

    function attachFavoriteButtonListeners() {
        const favButtons = document.querySelectorAll(".recipe-fav-btn");
        favButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const btn = e.target.closest(".recipe-fav-btn");
                const recipeId = parseInt(btn.getAttribute("data-id"), 10);
                const recipe = magicRecipes.find(r => r.id === recipeId);
                
                if (recipe) {
                    recipe.isFavorite = !recipe.isFavorite;
                    // NOUVEAU : Sauvegarde dans le navigateur après un changement de favori
                    saveDatabase(); 
                    updateAppDisplay();
                }
            });
        });
    }

   // 6. GESTION DES VUES (SINGLE PAGE APPLICATION)
    const homeView = document.getElementById("home-view");
    const guideView = document.getElementById("guide-view");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            // Mise à jour visuelle du bouton actif dans le menu
            const currentActive = document.querySelector(".nav-link.active");
            if (currentActive) currentActive.classList.remove("active");
            link.classList.add("active");

            // Récupération de la cible du lien (ex: "#creation" ou "#guide-view")
            const targetId = link.getAttribute("href");

            if (targetId === "#guide-view") {
                // On masque l'accueil et on affiche le guide
                homeView.style.display = "none";
                guideView.style.display = "block";
            } else {
                // On affiche l'accueil et on masque le guide
                homeView.style.display = "block";
                guideView.style.display = "none";
                // Le navigateur se chargera ensuite de scroller naturellement vers la bonne section
            }
        });
    });

 // ---------------------------------------------------------
    // 7. GÉNÉRATEUR DE RECETTE (IA RÉELLE VIA VERCEL)
    // ---------------------------------------------------------
    generatorForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titleValue = titleInput.value.trim();
        const envieValue = envieInput.value.trim();

        if (!titleValue || !envieValue) return;

        // Feedback visuel pendant que l'IA réfléchit
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "L'alchimiste compose votre recette...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        try {
            // Appel à notre Backend sécurisé sur Vercel
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: titleValue, envie: envieValue })
            });

            if (!response.ok) {
                throw new Error("Erreur de génération du serveur");
            }

            // On récupère la recette générée par Gemini !
            const newRecipe = await response.json();

            // On ajoute une petite étincelle magique au nom
            newRecipe.nom = `✨ ${newRecipe.nom}`;

            // On l'ajoute à la base de données et on sauvegarde
            magicRecipes.unshift(newRecipe);
            saveDatabase();
            updateAppDisplay();

            // Nettoyage du formulaire
            generatorForm.reset();

            // On fait défiler l'écran vers le résultat
            document.getElementById("mes-recettes").scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            alert("Oups, l'alchimiste a fait brûler la préparation. Vérifiez votre connexion ou réessayez !");
        } finally {
            // Retour à la normale du bouton, quoi qu'il arrive
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
        }
    }); 

    // ---------------------------------------------------------
    // 8. GESTION DE LA VUE DÉTAIL D'UNE RECETTE
    // ---------------------------------------------------------
    const detailView = document.getElementById("detail-view");
    const detailContent = document.getElementById("detail-content");
    const btnBack = document.getElementById("btn-back");

    // Écoute des clics sur les boutons "Voir les détails" (délégation d'événement)
    document.addEventListener("click", (e) => {
        const btnDetail = e.target.closest(".btn-detail");
        if (btnDetail) {
            // Remonter jusqu'à la carte pour trouver l'ID
            const article = btnDetail.closest(".recipe-card");
            const recipeId = parseInt(article.getAttribute("data-id"), 10);
            const recipe = magicRecipes.find(r => r.id === recipeId);
            
            if (recipe) {
                afficherDetails(recipe);
            }
        }
    });

    // Fonction d'affichage de la recette
    function afficherDetails(recipe) {
        // Construit le HTML interne avec les données de la recette
        detailContent.innerHTML = `
            <span class="recipe-badge" style="position: relative; inset: auto; display: inline-block; margin-bottom: 1rem;">${recipe.categorie}</span>
            <h2 class="section-title" style="border: none; margin-bottom: 0.5rem; padding: 0; font-size: 3rem;">${recipe.nom}</h2>
            <div class="recipe-meta" style="font-size: 1rem;">${recipe.origine} • Temps estimé : ${recipe.tempsCuisson}</div>
            
            <div class="detail-grid">
                <div class="detail-ingredients">
                    <h3 style="font-family: var(--font-display); color: var(--color-cuivre); margin-bottom: 1rem;">Ingrédients</h3>
                    <ul>
                        <li>Ingrédients de base</li>
                        <li>Assaisonnements</li>
                        <li>Une bonne pincée d'amour</li>
                        </ul>
                </div>
                <div class="detail-instructions">
                    <h3 style="font-family: var(--font-display); color: var(--color-cuivre); margin-bottom: 1rem;">Préparation</h3>
                    <p>${recipe.description}</p>
                    <p><em>(Cette section sera bientôt rédigée étape par étape par notre alchimiste culinaire !)</em></p>
                </div>
            </div>
        `;
        
        // Bascule des vues
        homeView.style.display = "none";
        guideView.style.display = "none";
        detailView.style.display = "block";
        
        // Remonte en haut de la page
        window.scrollTo(0, 0);
    }

    // Fonction du bouton Retour
    btnBack.addEventListener("click", () => {
        detailView.style.display = "none";
        homeView.style.display = "block";
    });

    updateAppDisplay();
});
