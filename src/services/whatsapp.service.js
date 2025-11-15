const ACCESS_TOKEN = process.env.META_WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_ID;

export async function sendWhatsAppMessageMeta(phone, message) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  
  // Node 18+ provides a global fetch API
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone.startsWith("+") ? phone : `+229${phone}`,
      type: "text",
      text: { body: message }
    }),
  });

  const data = await res.json();
  if (data.error) console.error("Erreur WhatsApp:", data.error);
  return data;
}
