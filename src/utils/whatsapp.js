const axios = require('axios');

// Variables d'environnement nécessaires pour l'API WhatsApp Cloud (Meta)
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN; // Jeton d'accès (Graph API)
const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // ID du numéro expéditeur
const WA_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME; // Optionnel : nom du template (ex: otp_code)
const WA_TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || 'fr'; // Langue du template (ex: fr ou fr_FR)

// Normaliser le numéro de téléphone au format international (E.164) en gardant uniquement les chiffres
function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D+/g, '');
  return digits;
}

// Envoi via l'API Cloud : privilégie un template (hors fenêtre 24h) sinon message texte
async function sendViaCloudAPI({ to, message, codeParam }) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) {
    // Retour en simulation si non configuré
    console.log(`[SIMULATION] WhatsApp non configuré. Dest: ${to} | Message: ${message}`);
    return { simulated: true };
  }

  const url = `https://graph.facebook.com/v20.0/${WA_PHONE_NUMBER_ID}/messages`;
  const headers = {
    Authorization: `Bearer ${WA_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const useTemplate = !!WA_TEMPLATE_NAME && !!codeParam;

  const payload = useTemplate
    ? {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: WA_TEMPLATE_NAME,
          language: { code: WA_TEMPLATE_LANG },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: String(codeParam) },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message },
      };

  const { data } = await axios.post(url, payload, { headers });
  return data;
}

// message : texte libre contenant déjà l'OTP (depuis le contrôleur)
// On tente d'extraire un code 4-6 chiffres (priorité 5 chiffres) pour alimenter le template si disponible
const sendWhatsAppMessage = async (phone, message) => {
  const to = normalizePhone(phone);
  const match = String(message).match(/\b(\d{5})\b/) || String(message).match(/\b(\d{4,6})\b/);
  const codeParam = match ? match[1] : undefined;

  // Log de debug (hors production) pour faciliter les tests: affiche le code OTP détecté
  if (codeParam && process.env.NODE_ENV !== 'production') {
    console.log(`[DEBUG] OTP for ${to}: ${codeParam}`);
  }

  try {
    const res = await sendViaCloudAPI({ to, message, codeParam });
    if (res.simulated) return true;
    return true;
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data || err.message;
    console.error('Erreur envoi WhatsApp :', status, detail);
    throw new Error("Échec d'envoi WhatsApp");
  }
};

module.exports = { sendWhatsAppMessage };
