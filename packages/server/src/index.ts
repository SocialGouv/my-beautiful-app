// Serveur Node.js (volontairement problématique)
import http from 'http';
import { parse as parseUrl } from 'url';
import type { User, Post } from './types/index'; // Importation explicite du fichier d'index
import { Client } from 'pg';
import jwt from 'jsonwebtoken';

// Variables globales - Mauvaise pratique délibérée
let db: Client; 
const JWT_SECRET = "mon_secret_trop_simple";
const users: User[] = [];
const posts: Post[] = [];

// Connexion à la base de données sans gestion d'erreur
async function connectToDB() {
  db = new Client({
    host: 'localhost',
    port: 5432,
    database: 'blog',
    user: 'postgres',
    password: 'postgres'
  });
  
  await db.connect();
  console.log('Connecté à la base de données');
}

// Fonction pour initialiser le serveur
async function startServer() {
  try {
    await connectToDB();
    
    // Mauvaise pratique : Pas de pooling de connexions
    
    const server = http.createServer((req, res) => {
      // Définir les headers CORS - Configuration trop permissive
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      
      // Répondre directement aux requêtes OPTIONS sans vérification
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      // Analyser l'URL et la méthode
      const url = req.url || '/';
      const method = req.method || 'GET';
      const parsedUrl = parseUrl(url, true);
      const path = parsedUrl.pathname || '/';
      
      // Récupérer le token d'authentification - Sans validation
      const authHeader = req.headers.authorization;
      let token = null;
      if (authHeader) {
        token = authHeader.split(' ')[1]; // Pas de vérification si le format est correct
      }
      
      // Gérer les différentes routes
      handleRoutes(req, res, path, method, token, parsedUrl.query);
    });
    
    // Démarrer le serveur HTTP
    server.listen(3001, () => {
      console.log('Serveur démarré sur http://localhost:3001');
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Fonction pour gérer les routes - Fonction monolithique (mauvaise pratique)
async function handleRoutes(req, res, path, method, token, query) {
  try {
    // API Posts
    if (path === '/api/posts' && method === 'GET') {
      // Récupération des articles avec pagination non optimisée
      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Requête SQL vulnérable à l'injection - Mauvaise pratique délibérée
      const sqlQuery = `SELECT * FROM posts ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`;
      const result = await db.query(sqlQuery);
      
      // Requête distincte pour compter le total - Non optimisé
      const countResult = await db.query('SELECT COUNT(*) FROM posts');
      const total = parseInt(countResult.rows[0].count);
      
      sendResponse(res, 200, {
        data: result.rows,
        total,
        page,
        limit
      });
    }
    // Récupérer un article par ID
    else if (path.match(/^\/api\/posts\/\d+$/) && method === 'GET') {
      const id = path.split('/')[3];
      // Concaténation de chaîne dans une requête SQL - Vulnérable aux injections
      const result = await db.query('SELECT * FROM posts WHERE id = ' + id);
      
      if (result.rows.length > 0) {
        sendResponse(res, 200, result.rows[0]);
      } else {
        sendResponse(res, 404, { error: 'Article non trouvé' });
      }
    }
    // Créer un nouvel article - Sans validation d'entrée
    else if (path === '/api/posts' && method === 'POST') {
      // Pas de vérification d'authentification pour certaines routes
      if (!token) {
        sendResponse(res, 401, { error: 'Non authentifié' });
        return;
      }
      
      // Récupération du body sans validation
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const postData = JSON.parse(body);
          
          // Pas de validation des données d'entrée
          // Pas d'échappement des caractères spéciaux
          
          // Mauvaise pratique : Concaténation de SQL vulnérable à l'injection
          const query = `
            INSERT INTO posts (title, content, author, date) 
            VALUES ('${postData.title}', '${postData.content}', '${postData.author}', NOW()) 
            RETURNING *
          `;
          
          const result = await db.query(query);
          sendResponse(res, 201, result.rows[0]);
        } catch (error) {
          console.error('Erreur lors de la création de l\'article:', error);
          sendResponse(res, 500, { error: 'Erreur serveur' });
        }
      });
      return; // Important pour éviter les problèmes avec les gestionnaires d'événements
    }
    // Authentification - Avec stockage mot de passe en clair
    else if (path === '/api/login' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const credentials = JSON.parse(body);
          
          // Requête vulnérable à l'injection SQL
          const query = `SELECT * FROM users WHERE username = '${credentials.username}' AND password = '${credentials.password}'`;
          const result = await db.query(query);
          
          if (result.rows.length > 0) {
            const user = result.rows[0];
            // Création de token sans expiration - Mauvaise pratique
            const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
            
            sendResponse(res, 200, {
              token,
              user: {
                id: user.id,
                username: user.username,
                // Exposer le mot de passe dans la réponse - Mauvaise pratique évidente
                password: user.password
              }
            });
          } else {
            sendResponse(res, 401, { error: 'Identifiants incorrects' });
          }
        } catch (error) {
          console.error('Erreur lors de la connexion:', error);
          sendResponse(res, 500, { error: 'Erreur serveur' });
        }
      });
      return;
    }
    // Route par défaut
    else {
      sendResponse(res, 404, { error: 'Route non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    sendResponse(res, 500, { error: 'Erreur serveur interne' });
  }
}

// Fonction pour envoyer une réponse
function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Démarrer le serveur
startServer();

// Pas de gestion de la fermeture propre de la connexion à la base de données
// Absence de tests
// Absence de logging structuré
// Code monolithique au lieu d'être modulaire
