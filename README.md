# My Beautiful App - Test d'entretien technique

Ce projet a été créé pour servir de base d'évaluation technique pour les candidats développeurs. L'application est intentionnellement conçue avec des imperfections et des problèmes que les candidats devront identifier et potentiellement corriger.

## Présentation de l'application

Il s'agit d'une application de blog simple avec les fonctionnalités suivantes :
- Affichage d'une liste d'articles avec pagination
- Page d'administration pour la création d'articles
- Système d'authentification pour accéder à l'administration

## Stack technique

- **Frontend** : React, TypeScript
- **Backend** : Node.js natif avec TypeScript
- **Base de données** : PostgreSQL
- **Architecture** : Monorepo

## Prérequis

- Node.js v24.0.0 ou supérieur (pour le support natif de TypeScript)
- Docker et Docker Compose
- Yarn

## Structure du projet

```
my-beautiful-app/
├── packages/
│   ├── client/          # Frontend React
│   ├── server/          # Backend Node.js
│   └── shared/          # Types et interfaces partagés
├── docker-compose.yml   # Configuration des conteneurs
├── package.json         # Configuration du monorepo
└── tsconfig.json        # Configuration TypeScript
```

## Installation

1. Cloner le dépôt
2. Installer les dépendances :
   ```
   yarn install
   ```
3. Démarrer la base de données PostgreSQL :
   ```
   docker compose up -d
   ```
4. Initialiser la base de données :
   ```
   yarn seed:db
   ```

## Lancement de l'application

1. Démarrer le serveur et le client :
   ```
   yarn dev
   ```
2. Accéder à l'application dans votre navigateur :
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:3001

## Connexion à l'administration

Utiliser les identifiants suivants :
- Utilisateur : `admin`
- Mot de passe : `admin123`

## Consignes pour les candidats

En tant que candidat, vous êtes invité à :

1. Explorer le code et identifier les problèmes, les anti-patterns et les vulnérabilités
2. Proposer des solutions pour améliorer la qualité, la sécurité et la maintenabilité du code
3. Expliquer vos choix et vos décisions techniques

Bonne chance !
