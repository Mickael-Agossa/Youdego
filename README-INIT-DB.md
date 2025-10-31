# Initialiser la base de données (Postgres dans Docker)

Ce fichier explique comment initialiser la base `youdego_db` fournie dans `docker-compose.yml`.

Fichiers ajoutés :
- `init.sql` : contient la création du type `user_role` et des tables `users` et `whatsapp`.

Pré-requis :
- Le conteneur PostgreSQL doit être en cours d'exécution (nom du conteneur : `youdego_postgres`).
- Le `.env` du projet définit l'utilisateur et la base : `DB_USER=Vaybe_youdego`, `DB_NAME=youdego_db`.

Commandes PowerShell (exécutées depuis la racine du projet `H:\Projets Vaybe\Youdego`) :

1) Copier `init.sql` dans le conteneur et l'exécuter :

```powershell
docker cp .\init.sql youdego_postgres:/init.sql
docker exec -i youdego_postgres psql -U Vaybe_youdego -d youdego_db -f /init.sql
```

2) Ou exécuter directement la requête via `psql -c` (utile pour petites commandes) :

```powershell
docker exec -i youdego_postgres psql -U Vaybe_youdego -d youdego_db -c "CREATE TABLE IF NOT EXISTS example (id SERIAL PRIMARY KEY);"
```

Notes :
- `init.sql` utilise `IF NOT EXISTS` — vous pouvez le relancer sans erreur.
- Si vous préférez automatiser, on peut ajouter un script npm `init-db` qui lance les commandes docker ci-dessus.
- Attention aux utilisateurs/roles : le conteneur Postgres a été initialisé avec l'utilisateur indiqué dans `.env` (`Vaybe_youdego`).

Souhaitez-vous que j'ajoute un script npm `init-db` et un petit script Node pour lire `.env` et lancer cela automatiquement ?
