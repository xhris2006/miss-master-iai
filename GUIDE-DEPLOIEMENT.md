# 🎓 Guide de Déploiement — Miss & Master IAI Mbalmayo
## Déploiement gratuit sur Vercel + Supabase

---

## 📋 VUE D'ENSEMBLE

| Composant | Service | Coût |
|-----------|---------|------|
| Frontend + API | Vercel | ✅ Gratuit |
| Base de données | Supabase | ✅ Gratuit |
| Authentification | Supabase Auth | ✅ Gratuit |
| Stockage photos | Supabase Storage | ✅ Gratuit (1 Go) |

Temps estimé : **30 à 45 minutes**

---

## ÉTAPE 1 — Créer le projet Supabase

### 1.1 Créer un compte
1. Va sur **https://supabase.com**
2. Clique **Start your project** → Sign up (avec Google ou email)
3. Clique **New Project**
4. Remplis :
   - **Name** : `miss-master-iai`
   - **Database Password** : crée un mot de passe fort (note-le quelque part)
   - **Region** : Europe (West) — le plus proche de l'Afrique de l'Ouest disponible
5. Clique **Create new project** → attends ~2 minutes

### 1.2 Récupérer les clés API
1. Dans ton projet Supabase, clique **Settings** (icône engrenage en bas à gauche)
2. Clique **API**
3. Note ces deux valeurs :
   - **Project URL** → ressemble à `https://abcdefgh.supabase.co`
   - **anon public** (sous "Project API keys") → longue clé qui commence par `eyJ...`

> ⚠️ **Ne partage jamais** la clé `service_role` ! Utilise uniquement `anon`.

### 1.3 Créer la base de données
1. Dans Supabase, clique **SQL Editor** (icône base de données, menu gauche)
2. Clique **New query**
3. Copie **tout le contenu** du fichier `supabase-schema.sql`
4. Colle-le dans l'éditeur
5. Clique **Run** (ou Ctrl+Enter)
6. Tu dois voir "Success. No rows returned"

### 1.4 Créer le bucket de stockage photos
1. Clique **Storage** dans le menu gauche
2. Clique **New bucket**
3. Remplis :
   - **Name** : `photos`
   - **Public bucket** : ✅ **Coché** (important !)
4. Clique **Create bucket**

### 1.5 Configurer l'authentification email
1. Clique **Authentication** → **Providers**
2. **Email** doit être activé (c'est le cas par défaut)
3. Clique **Authentication** → **Settings (URL Configuration)**
4. Dans **Site URL**, mets ton URL Vercel (tu l'auras après l'étape 2)
   - Pour l'instant mets `http://localhost:3000`
   - Tu reviendras la changer après déploiement

---

## ÉTAPE 2 — Déployer sur Vercel

### 2.1 Mettre le code sur GitHub
1. Va sur **https://github.com** → créer un compte si besoin
2. Clique **New repository**
   - Name : `miss-master-iai`
   - Private : ✅ (recommandé)
3. Clique **Create repository**
4. Sur ta machine, dans le dossier du projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TON_PSEUDO/miss-master-iai.git
   git push -u origin main
   ```

### 2.2 Créer le projet Vercel
1. Va sur **https://vercel.com** → Sign up (connecte-toi avec GitHub)
2. Clique **Add New Project**
3. Importe ton repo `miss-master-iai`
4. **Ne clique pas encore Deploy** — tu dois d'abord configurer les variables

### 2.3 ⚡ Variables d'environnement (CRUCIAL)
Dans Vercel, avant de déployer, clique **Environment Variables** et ajoute ces 6 variables une par une :

| Nom de la variable | Valeur | Exemple |
|--------------------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Ton URL Supabase (étape 1.2) | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ta clé anon (étape 1.2) | `eyJhbGci...` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | L'email de l'admin du site | `admin@iai-mbalmayo.cm` |
| `NEXT_PUBLIC_EDITION` | L'année du concours | `2026` |
| `NEXT_PUBLIC_VOTE_START_DATE` | Date début votes | `2026-10-01T00:00:00` |
| `NEXT_PUBLIC_VOTE_END_DATE` | Date fin votes | `2026-12-31T23:59:59` |

> 📅 **Format des dates** : `AAAA-MM-JJTHH:MM:SS`
> Exemple pour le 15 novembre 2025 à 20h : `2025-11-15T20:00:00`

5. Clique **Deploy** → attends ~3 minutes
6. Vercel te donne une URL comme `https://miss-master-iai.vercel.app` → **note-la**

### 2.4 Mettre à jour l'URL dans Supabase
1. Retourne dans Supabase → **Authentication** → **URL Configuration**
2. Remplace `http://localhost:3000` par ton URL Vercel
3. Ajoute aussi dans **Redirect URLs** : `https://miss-master-iai.vercel.app/**`
4. Clique **Save**

---

## ÉTAPE 3 — Créer le compte admin

1. Va sur ton site déployé
2. Clique **Se connecter** → **S'inscrire**
3. Utilise **exactement l'email** que tu as mis dans `NEXT_PUBLIC_ADMIN_EMAIL`
4. Vérifie ton email et clique le lien de confirmation
5. Reviens sur le site → connecte-toi
6. Tu verras maintenant le bouton **⚙️ Admin** dans la navigation

---

## ÉTAPE 4 — Utilisation quotidienne

### Ajouter des candidats
1. Connecte-toi avec le compte admin
2. Clique **⚙️ Admin** → **Candidats** → **+ Ajouter un candidat**
3. Remplis le formulaire : nom, catégorie (Miss/Master), promotion, description, photo
4. La photo est uploadée automatiquement dans Supabase Storage

### Suivre les votes
- Admin → **Tableau de bord** : statistiques en temps réel
- Page **/résultats** : classement visible par tous les visiteurs

---

## 🔄 POUR L'ANNÉE PROCHAINE

### Option 1 — Réinitialisation complète (recommandée)
1. Connecte-toi en admin → **⚙️ Admin** → **Paramètres**
2. Clique **"Réinitialiser toutes les données"**
3. Confirme → tous les candidats et votes sont supprimés
4. Dans Vercel → **Settings** → **Environment Variables**, modifie :
   - `NEXT_PUBLIC_EDITION` → `2026`
   - `NEXT_PUBLIC_VOTE_START_DATE` → nouvelle date de début
   - `NEXT_PUBLIC_VOTE_END_DATE` → nouvelle date de fin
5. Vercel redéploie automatiquement
6. Ajoute les nouveaux candidats → c'est reparti !

### Option 2 — Nouveau projet (pour garder l'historique)
Crée un nouveau projet Supabase et change les variables dans Vercel.

---

## 🔧 VALEURS À CHANGER CHAQUE ANNÉE

```
Fichier : Variables d'environnement Vercel
Chemin  : ton-projet.vercel.app > Settings > Environment Variables

NEXT_PUBLIC_EDITION          = 2026        ← Changer l'année
NEXT_PUBLIC_VOTE_START_DATE  = 2026-10-01T00:00:00  ← Nouvelle date début
NEXT_PUBLIC_VOTE_END_DATE    = 2026-12-31T23:59:59  ← Nouvelle date fin
NEXT_PUBLIC_ADMIN_EMAIL      = admin@...   ← Si l'admin change
```

---

## 🐛 PROBLÈMES FRÉQUENTS

### "Erreur 403 — Non autorisé" dans l'admin
→ L'email utilisé pour se connecter est différent de `NEXT_PUBLIC_ADMIN_EMAIL`
→ Vérifie que les deux correspondent exactement (majuscules, espaces)

### Les photos ne s'affichent pas
→ Vérifie que le bucket `photos` est bien en **Public** dans Supabase Storage
→ Vérifie que le domaine Supabase est dans `next.config.js` → `remotePatterns`

### "Invalid login credentials"
→ L'utilisateur n'a pas confirmé son email
→ Dans Supabase → Authentication → Users, tu peux confirmer manuellement

### Les votes ne se comptent pas
→ Vérifie que les fonctions RPC ont bien été créées (re-run le SQL schema)
→ Vérifie les politiques RLS dans Supabase → Authentication → Policies

### Le site ne se déploie pas sur Vercel
→ Vérifie que toutes les 6 variables d'environnement sont bien renseignées
→ Regarde les logs Vercel → Deployments → [ton déploiement] → Build Logs

---

## 📞 STRUCTURE DES FICHIERS

```
miss-master-iai/
├── app/
│   ├── page.tsx              ← Page principale (liste candidats)
│   ├── connexion/page.tsx    ← Page login / inscription
│   ├── resultats/page.tsx    ← Classement en temps réel
│   ├── admin/page.tsx        ← Panneau admin
│   ├── api/
│   │   ├── votes/route.ts    ← API : voter
│   │   ├── candidates/       ← API : CRUD candidats
│   │   └── admin/            ← API : reset + upload photo
│   ├── globals.css           ← Styles globaux
│   └── layout.tsx            ← Layout racine (header + footer)
├── components/
│   ├── Header.tsx            ← Navigation principale
│   ├── Countdown.tsx         ← Compte à rebours
│   ├── CandidateCard.tsx     ← Carte candidat
│   └── CandidateModal.tsx    ← Modal vote
├── lib/
│   ├── supabase.ts           ← Client Supabase (navigateur)
│   ├── supabase-server.ts    ← Client Supabase (serveur)
│   ├── config.ts             ← Configuration du concours
│   └── types.ts              ← Types TypeScript
├── supabase-schema.sql       ← Script SQL à exécuter dans Supabase
├── .env.local.example        ← Template des variables d'environnement
└── GUIDE-DEPLOIEMENT.md      ← Ce fichier
```

---

*Guide rédigé pour Miss & Master IAI Mbalmayo — Institut Africain d'Informatique*
