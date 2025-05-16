// Script pour initialiser la base de données avec des données de test
import { Client } from 'pg';

// Configuration de la base de données (en dur dans le code - mauvaise pratique)
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'blog',
  user: 'postgres',
  password: 'postgres'
};

async function seedDatabase() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connecté à la base de données pour le seeding');
    
    // Suppression des tables existantes - Mauvaise pratique en production
    await client.query('DROP TABLE IF EXISTS posts CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    // Création de la table utilisateurs
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    
    // Création de la table articles
    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(50),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertion d'utilisateurs (mots de passe en clair - très mauvaise pratique)
    const insertUsersQuery = `
      INSERT INTO users (username, password) VALUES
      ('admin', 'admin123'),
      ('user1', 'password123')
    `;
    await client.query(insertUsersQuery);
    
    // Génération d'articles de test
    const articles = [];
    for (let i = 1; i <= 20; i++) {
      articles.push({
        title: `Article de test ${i}`,
        content: `Ceci est le contenu de l'article de test numéro ${i}. Il contient beaucoup de texte intéressant que personne ne lira jamais.`,
        author: i % 2 === 0 ? 'admin' : 'user1'
      });
    }
    
    // Insertion des articles un par un (inefficace - mais c'est délibéré)
    for (const article of articles) {
      // Échapper les apostrophes dans les chaînes de texte - mais toujours vulnérable aux injections
      const escapedTitle = article.title.replace(/'/g, "''");
      const escapedContent = article.content.replace(/'/g, "''");
      const days = Math.floor(Math.random() * 30);
      
      const query = `
        INSERT INTO posts (title, content, author, date)
        VALUES ('${escapedTitle}', '${escapedContent}', '${article.author}', NOW() - interval '${days} days')
      `;
      await client.query(query);
    }
    
    console.log('Base de données initialisée avec succès !');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    await client.end();
  }
}

// Exécuter le script
seedDatabase();
