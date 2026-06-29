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

    // Si l'utilisateur n'a rien mis dans "envie", on donne une consigne par défaut
    const envieInstruction = envie 
        ? `Le contexte ou l'envie particulière est : "${envie}". Adapte la recette en fonction.` 
        : `L'utilisateur n'a pas précisé d'envie. Donne-lui la meilleure version authentique et classique de ce plat.`;

    const prompt = `Tu es un chef cuisinier expert et artisanal. 
    L'utilisateur te demande une recette pour : "${title}". 
    ${envieInstruction}
    
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
      "imageKeyword": "delicious culinary food photography of [ENGLISH NAME OF DISH], extremely realistic, 4k",
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
