// api/generate.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { title, envie } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Clé API manquante dans Vercel' });
    }

    // NOUVEAU PROMPT : On demande les ingrédients et les instructions !
    const prompt = `Tu es un chef cuisinier expert et artisanal. 
    L'utilisateur a ces ingrédients ou idées : "${title}". 
    Il a cette envie : "${envie}".
    
    Crée une recette sur-mesure fantastique.
    Tu DOIS répondre UNIQUEMENT avec un objet JSON valide (sans aucun autre texte, sans markdown). 
    Voici la structure stricte que tu dois respecter :
    {
      "nom": "Nom appétissant de la recette",
      "categorie": "Plat",
      "origine": "Création magique",
      "tempsCuisson": "XX min",
      "description": "Une description très alléchante et chaleureuse de 2 phrases.",
      "tags": ["Un tag court (ex: Confort, Rapide...)"],
      "imageFallback": "[ Illustration de la recette générée ]",
      "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité", "ingrédient 3"],
      "instructions": ["Première étape de préparation", "Deuxième étape", "Dernière étape"]
    }`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        let textResult = data.candidates[0].content.parts[0].text;
        textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const recipeData = JSON.parse(textResult);
        recipeData.id = Date.now();
        recipeData.isFavorite = true; 

        res.status(200).json(recipeData);
    } catch (error) {
        console.error("Erreur API:", error);
        res.status(500).json({ error: "L'alchimiste a raté sa potion." });
    }
}
