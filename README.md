# Youdégo Backend

API Node.js/Express + PostgreSQL (Docker) avec authentification JWT, vérification WhatsApp, gestion livreurs et réinitialisation de mot de passe.

## Sommaire
- Prérequis
- Démarrage rapide (Docker)
- Initialisation base de données
- Configuration WhatsApp (optionnelle)
- Scénarios de test (Postman / PowerShell)
  - Admin: login et token
  - Mot de passe oublié / réinitialisation
  - Inscription client/commerçant
  - Création et vérification livreur
  - Liste des livreurs (admin)
- Notes & dépannage

---

## Prérequis
- Docker + Docker Compose
- Windows PowerShell (les exemples ci-dessous l’utilisent)

## Démarrage rapide (Docker)
Depuis le dossier du projet:

```powershell
# Construire et lancer
docker compose up --build -d
# ou en précisant le chemin si vous êtes ailleurs
# docker compose -f "h:\\Projets Vaybe\\Youdego\\docker-compose.yml" up --build -d
```

Backend: http://localhost:5001

## Initialisation base de données
Appliquez le script `init.sql` dans le conteneur Postgres (idempotent):

```powershell
docker cp .\init.sql youdego_postgres:/init.sql
docker exec -i youdego_postgres psql -U Vaybe_youdego -d youdego_db -f /init.sql
```

Si vous modifiez `init.sql`, rejouez simplement les deux commandes.

## Configuration WhatsApp (optionnelle)
- Variables `.env` utiles:
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_TEMPLATE_NAME` (optionnel, ex: otp_code)
  - `WHATSAPP_TEMPLATE_LANG` (par défaut `fr`)
- Sans configuration WhatsApp, l’envoi est simulé et l’OTP s’affiche dans les logs backend:

```powershell
docker logs --tail 200 -f youdego_backend
# Chercher des lignes: [DEBUG] OTP for ... : 12345
```

## Scénarios de test (Postman / PowerShell)
Base URL: `http://localhost:5001/api`
Header par défaut: `Content-Type: application/json`

### 1) Admin: login et token (JWT ~90 jours)
```powershell
$body = @{ phone = '+229 0155963913'; password = 'VOTRE_MOT_DE_PASSE' } | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/auth/login' -Headers @{ 'Content-Type'='application/json' } -Body $body
$response.token
```
- Utilisez ensuite `Authorization: Bearer <token>` pour les routes admin.

> Astuce: si le mot de passe est inconnu, utilisez le flow "mot de passe oublié" ci-dessous ou re-générez un hash bcrypt dans le conteneur backend:  
> `docker exec -i youdego_backend node -e "console.log(require('bcrypt').hashSync('Admin@2025!', 10))"`

### 2) Mot de passe oublié / réinitialisation
- Demander un code (via WhatsApp ou logs si simulation):
```powershell
$body = @{ phone = '+229 0155963913' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/auth/forgot-password' -Headers @{ 'Content-Type'='application/json' } -Body $body
```
- Réinitialiser avec le code reçu (valide 15 minutes):
```powershell
$body = @{ phone = '+229 0155963913'; code = '12345'; newPassword = 'Admin@2025!' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/auth/reset-password' -Headers @{ 'Content-Type'='application/json' } -Body $body
```

### 3) Inscription client/commerçant
```powershell
$body = @{
  firstName = 'Mickael'
  lastName  = 'Agossa'
  email     = 'mickael+test@example.com'
  phone     = '+229 0102030405'
  password  = 'Test@2025!'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/auth/register' -Headers @{ 'Content-Type'='application/json' } -Body $body
```
- Un code WhatsApp (ou log) est envoyé pour vérifier le compte.

### 4) Création et vérification livreur (admin)
- Créer un livreur:
```powershell
$token = $response.token # le token admin récupéré plus haut
$headers = @{ 'Content-Type'='application/json'; Authorization = "Bearer $token" }

$body = @{
  firstName = 'Jean'
  lastName  = 'Dupont'
  email     = "jean.dupont+$(Get-Date -UFormat %s)@example.com"
  phone     = '+229 0102030406'
  password  = 'Livreur@2025!'
  vehicle_plate = 'AB-123-CD'
  id_document_type = 'CNI'
  id_document_number = 'CNI123456'
  id_document_url = 'https://example.com/cni.jpg'
  profile_photo_url = 'https://example.com/photo.jpg'
} | ConvertTo-Json

$create = Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/auth/admin/create-livreur' -Headers $headers -Body $body
$livreurId = $create.livreur.id
```
- Récupérer le code OTP: via WhatsApp réel ou logs `[DEBUG] OTP for ...`.
- Vérifier le code:
```powershell
$body = @{ userId = $livreurId; code = '12345' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/auth/verify' -Headers @{ 'Content-Type'='application/json' } -Body $body
```

### 5) Liste des livreurs (admin)
```powershell
Invoke-RestMethod -Method Get -Uri 'http://localhost:5001/api/auth/admin/livreurs' -Headers $headers
```

## Notes & dépannage
- Le champ `phone` doit correspondre exactement à la valeur en base lors du login. Évitez les espaces. Exemple pour normaliser un compte existant:  
  `docker exec -i youdego_postgres psql -U Vaybe_youdego -d youdego_db -c "UPDATE users SET phone='+2290155963913' WHERE phone='+229 0155963913';"`
- JWT: 90 jours (modifiable dans `src/controllers/authController.js`).
- Code WhatsApp: 30 jours (modifiable dans `src/models/whatsappModel.js`).
- Code reset: 15 minutes (modifiable dans `src/models/passwordResetModel.js`).
- Si vous modifiez le code backend, reconstruisez:  
  `docker compose up --build -d`

---

Bon test ! Si besoin d’une collection Postman prête à l’emploi avec variables, on peut l’ajouter rapidement.
