// app.js

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

    const homeView = document.getElementById("home-view");
    const guideView = document.getElementById("guide-view");
    const detailView = document.getElementById("detail-view");
    const detailContent = document.getElementById("detail-content");
    const btnBack = document.getElementById("btn-back");

    function createRecipeCardHtml(recipe) {
        const favBtnClass = recipe.isFavorite ? "recipe-fav-btn active" : "recipe-fav-btn";
        const favIconColor = recipe.isFavorite ? "currentColor" : "none";

        return `
            <article class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-image-wrapper">
                    <div class="recipe-image-placeholder">${recipe.imageFallback || "[ Illustration ]"}</div>
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
            ? magicRecipes : magicRecipes.filter(recipe => recipe.origine === selectedOrigine);

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
                    saveDatabase(); 
                    updateAppDisplay();
                }
            });
        });
    }

    // Gestion propre de la navigation
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const currentActive = document.querySelector(".nav-link.active");
            if (currentActive) currentActive.classList.remove("active");
            link.classList.add("active");

            const targetId = link.getAttribute("href");

            if (targetId === "#guide-view") {
                homeView.style.display = "none";
                guideView.style.display = "block";
                detailView.style.display = "none";
            } else {
                homeView.style.display = "block";
                guideView.style.display = "none";
                detailView.style.display = "none";
            }
        });
    });

    // IA Backend
    generatorForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titleValue = titleInput.value.trim();
        const envieValue = envieInput.value.trim();
        if (!titleValue || !envieValue) return;

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "L'alchimiste compose votre recette...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: titleValue, envie: envieValue })
            });

            if (!response.ok) throw new Error("Erreur de génération du serveur");

            const newRecipe = await response.json();
            newRecipe.nom = `✨ ${newRecipe.nom}`;

            magicRecipes.unshift(newRecipe);
            saveDatabase();
            updateAppDisplay();
            generatorForm.reset();
            document.getElementById("mes-recettes").scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            alert("Oups, l'alchimiste a fait brûler la préparation. Vérifiez votre connexion !");
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
        }
    });

    // Affichage des détails au clic
    document.addEventListener("click", (e) => {
        const btnDetail = e.target.closest(".btn-detail");
        if (btnDetail) {
            const article = btnDetail.closest(".recipe-card");
            const recipeId = parseInt(article.getAttribute("data-id"), 10);
            const recipe = magicRecipes.find(r => r.id === recipeId);
            if (recipe) afficherDetails(recipe);
        }
    });

    function afficherDetails(recipe) {
        // Préparation des ingrédients (avec fallback si c'est une vieille recette sans ingrédients)
        let ingredientsHTML = "<li>Aucun ingrédient détaillé (Ancienne recette)</li>";
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
            ingredientsHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');
        }

        // Préparation des étapes
        let instructionsHTML = `<p>${recipe.description}</p>`;
        if (recipe.instructions && Array.isArray(recipe.instructions)) {
            instructionsHTML = recipe.instructions.map((inst, index) => `<p style="margin-bottom: 1rem;"><strong>Étape ${index + 1} :</strong> ${inst}</p>`).join('');
        }

        // Création du HTML complet avec la grande bannière image
        detailContent.innerHTML = `
            <div style="height: 250px; margin: -3rem -3rem 2rem -3rem; background: linear-gradient(135deg, var(--color-croute) 0%, #dcd3c5 100%); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-style: italic; color: var(--color-text-light); font-size: 1.5rem; border-bottom: 4px solid var(--color-cuivre);">
                ${recipe.imageFallback || "[ Illustration Magique ]"}
            </div>
            
            <span class="recipe-badge" style="position: relative; inset: auto; display: inline-block; margin-bottom: 1rem; border: 1px solid var(--color-sauge);">${recipe.categorie}</span>
            <h2 class="section-title" style="border: none; margin-bottom: 0.5rem; padding: 0; font-size: 2.5rem;">${recipe.nom}</h2>
            <div class="recipe-meta" style="font-size: 1rem;">${recipe.origine} • Temps estimé : ${recipe.tempsCuisson}</div>
            
            <div class="detail-grid">
                <div class="detail-ingredients">
                    <h3 style="font-family: var(--font-display); color: var(--color-cuivre); margin-bottom: 1rem;">Ingrédients</h3>
                    <ul>
                        ${ingredientsHTML}
                    </ul>
                </div>
                <div class="detail-instructions">
                    <h3 style="font-family: var(--font-display); color: var(--color-cuivre); margin-bottom: 1rem;">Préparation</h3>
                    ${instructionsHTML}
                </div>
            </div>
        `;
        
        homeView.style.display = "none";
        guideView.style.display = "none";
        detailView.style.display = "block";
        window.scrollTo(0, 0);
    }

    btnBack.addEventListener("click", () => {
        detailView.style.display = "none";
        homeView.style.display = "block";
    });

    updateAppDisplay();
});
