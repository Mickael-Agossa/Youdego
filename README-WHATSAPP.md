# API WhatsApp Cloud – Mise en place et intégration

Ce projet peut envoyer des messages WhatsApp réels via l'API officielle Meta (WhatsApp Cloud API). Voici comment l'activer, étape par étape.

## 1) Pré-requis côté Meta
- Créez un compte développeur Meta : https://developers.facebook.com/
- Créez une application (Create App), ajoutez le produit « WhatsApp ».
- Dans « Prise en main » (Getting started), récupérez :
  - `PHONE_NUMBER_ID` (identifiant du numéro d'envoi),
  - `WABA ID` (WhatsApp Business Account),
  - un jeton d’accès (temporaire au départ).

Pour un jeton permanent (production) :
- Créez un « System User » dans Business Manager, assignez les permissions `whatsapp_business_messaging` et `whatsapp_business_management` à votre WABA.
- Générez un Permanent Access Token avec ces permissions.

Référence : https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/

## 2) Créer un template de message OTP (recommandé)
Pour envoyer un OTP hors de la fenêtre de 24h, utilisez un message template de catégorie AUTHENTICATION.
- Dans WhatsApp Manager > Message Templates > Create Template
- Nom (ex) : `otp_code`
- Langue : `fr_FR`
- Corps : « Votre code de vérification est {{1}}. »
- Soumettez pour approbation (quelques minutes en général).

Une fois approuvé, vous pourrez envoyer ce template à n’importe quel destinataire (facturation selon Meta).

## 3) Variables d’environnement (.env)
Ajoutez les variables suivantes à votre fichier `.env` (des clés vides ont déjà été ajoutées) :

```
# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=VOTRE_TOKEN
WHATSAPP_PHONE_NUMBER_ID=VOTRE_PHONE_NUMBER_ID
# Template OTP recommandé
WHATSAPP_TEMPLATE_NAME=otp_code
WHATSAPP_TEMPLATE_LANG=fr_FR
```

Redémarrez le backend après modification de `.env` :

```powershell
docker restart youdego_backend
```

## 4) Format du numéro de téléphone
- Utilisez le format international (E.164), sans espaces ni symboles.
- Exemple : `+33 6 12 34 56 78` → `33612345678` (le code retire automatiquement les non‑chiffres avant l’envoi).

## 5) Intégration dans le code
- Fichier : `src/utils/whatsapp.js`
  - Si `WHATSAPP_ACCESS_TOKEN` et `WHATSAPP_PHONE_NUMBER_ID` sont définis, l’envoi se fait via `POST https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages`.
  - Si `WHATSAPP_TEMPLATE_NAME` est défini et qu’un code (5 chiffres) est détecté, un template est envoyé avec ce code en paramètre.
  - Sinon, un message texte simple est envoyé (utile si fenêtre 24h active ou numéro de test Meta).
  - Si les variables ne sont pas configurées, l’envoi bascule en simulation (log console).

## 6) Tester rapidement
- Avec un template approuvé `otp_code` :
  - Inscrivez un utilisateur via POST `/api/auth/register` (voir aussi README-INIT-DB.md pour la base),
  - Vérifiez sur le téléphone destinataire ou regardez les logs si en simulation.
- Sans template (mode texte) :
  - Fonctionne pour des numéros de test / fenêtre de 24h.

## 7) Dépannage
- 400/401 (Graph API) : vérifiez `WHATSAPP_ACCESS_TOKEN` et les permissions.
- 400 « invalid recipient » : format du téléphone (E.164) et existence du compte WhatsApp.
- 409 « rate limit/throughput » : respectez les limites Meta.
- Erreurs de template (47x) : template approuvé, nom/exact, langue `fr_FR`, bon nombre de paramètres.

## 8) Alternatives
- Twilio WhatsApp API (sandbox, onboarding simplifié), payant : https://www.twilio.com/whatsapp

Besoin d’un endpoint de test WhatsApp ou d’une collection Postman ? Dites‑le et je l’ajoute.
