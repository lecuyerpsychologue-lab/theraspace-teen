module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return res.status(200).json({ demo: true });

  const { mode, data, context, history } = req.body;
  
  let systemPrompt = "Tu es Lya, IA psychologue experte TCC pour ados. Ton ton est cool, direct, empathique.";
  let userPrompt = "";
  let jsonFormat = true;

  switch (mode) {
    case 'CHAT_THERAPIST':
      systemPrompt = "Tu es PsIA, thérapeute virtuel. Écoute active. Si danger -> 15. Réponse comme un specialiste de la thérapie breve (max 5 phrases).";
      userPrompt = `Historique: ${JSON.stringify(history)}. User: "${data}"`;
      jsonFormat = false; 
      break;

    case 'GENERATE_ORACLE':
      systemPrompt = "Tu es un Bibliothécaire. Trouve un conte existant (Ésope, Zen). JSON: {title, story, source, moral}. Max 80 mots.";
      userPrompt = `Contexte: ${JSON.stringify(context || {})}`;
      break;

    case 'SYNTHESIZE_IDENTITY':
      systemPrompt = "Rédige un profil 'Cold Reading' valorisant en 100 mots max. Commence OBLIGATOIREMENT par 'Tu es une personne...'.";
      userPrompt = `Données: ${JSON.stringify(data)}`;
      jsonFormat = false;
      break;

    case 'ANALYZE_HERO':
      systemPrompt = "Programme estime de soi 8 semaines (60 jours). JSON: {archetype, analysis, score_comment, roadmap:[{week, focus, tasks:[string]}]}.";
      userPrompt = `Scores: ${JSON.stringify(data)}`;
      break;

    case 'GENERATE_SCENARIOS':
      systemPrompt = "Génère 15 situations ados réalistes (Social, Famille, Avenir). Mélange Pos/Neg. JSON: [{id, text, type}].";
      userPrompt = "Génère 15 situations.";
      break;

    case 'ANALYZE_ECHO':
        systemPrompt = "Analyse session TCC. JSON: {weather:{icon, text}, analysis}.";
        userPrompt = `Session: ${JSON.stringify(data)}`;
        break;

    case 'GENERATE_IDENTITY_QS':
      systemPrompt = "Génère 15 questions courtes pour connaître un ado. JSON: [string].";
      userPrompt = "Génère.";
      break;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "mistral-small-latest",
        response_format: jsonFormat ? { type: "json_object" } : { type: "text" },
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
      })
    });
    const result = await response.json();
    return res.status(200).json(jsonFormat ? JSON.parse(result.choices[0].message.content) : { text: result.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
