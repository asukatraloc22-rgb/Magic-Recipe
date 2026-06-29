export default async function handler(req, res) {
    // On n'accepte que les requêtes de type POST (envoi de données)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { title, envie } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Clé API manquante dans Vercel' });
    }

    // Le Prompt (Les instructions strictes pour le Chef IA)
    const prompt = `Tu es un chef cuisinier expert et artisanal. 
    L'utilisateur a ces ingrédients ou idées : "${title}". 
    Il a cette envie : "${envie}".
    
    Crée une recette sur-mesure fantastique.
    Tu DOIS répondre UNIQUEMENT avec un objet JSON valide (sans aucun autre texte, sans markdown). 
    Voici la structure stricte que tu dois respecter :
    {
      "nom": "Nom appétissant de la recette",
      "categorie": "Plat", // Choisir entre: Entrée, Plat, ou Dessert
      "origine": "Création magique",
      "tempsCuisson": "XX min",
      "description": "Une description très alléchante et chaleureuse de 2 ou 3 phrases détaillant les textures et la préparation.",
      "tags": ["Un tag court (ex: Confort, Rapide...)"],
      "imageFallback": "[ Illustration de la recette ]"
    }`;

    try {
        // On fait l'appel à l'API de Google Gemini (modèle ultra rapide 2.5 Flash)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // On récupère le texte généré par l'IA
        let textResult = data.candidates[0].content.parts[0].text;
        
        // Nettoyage de sécurité : Parfois l'IA ajoute des balises ```json ... ```, on les retire
        textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // On transforme le texte en véritable objet JavaScript
        const recipeData = JSON.parse(textResult);

        // On ajoute les attributs techniques manquants pour ton app
        recipeData.id = Date.now();
        recipeData.isFavorite = true; // La création est toujours favorite par défaut

        // On renvoie la recette au frontend !
        res.status(200).json(recipeData);

    } catch (error) {
        console.error("Erreur API:", error);
        res.status(500).json({ error: "L'alchimiste a raté sa potion." });
    }
}
