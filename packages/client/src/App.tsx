import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Post } from './types';

// Composant monolithique trop grand - devrait être divisé
const App = () => {
  // Trop d'états locaux - devraient être dans un contexte ou Redux
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const navigate = useNavigate();
  
  // Déclaration dupliquée inutilement - devrait être dans des constantes ou config
  const apiBaseUrl = window.globalState.apiBaseUrl;
  const postsPerPage = 10;
  
  // useEffect avec dépendances manquantes - fetchPosts devrait être dans la liste des dépendances
  useEffect(() => {
    fetchPosts();
  }, [currentPage]); // Manque fetchPosts dans les dépendances
  
  // useEffect avec mélange de responsabilités - devrait être séparé
  useEffect(() => {
    // Vérification token stocké en local
    const token = localStorage.getItem('token');
    if (token) {
      // Problème de sécurité - pas de vérification de validité du token
      setIsLoggedIn(true);
      window.globalState.isLoggedIn = true;
      
      // Manipulation DOM directe dans React - mauvaise pratique
      document.body.classList.add('logged-in');
    }
    
    // Définition du mode sombre
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Effet secondaire qui devrait être dans son propre useEffect
    const handleResize = () => {
      // Logique qui n'a rien à voir avec la vérification du token
      if (window.innerWidth < 768) {
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Nettoyage incomplet - ne nettoie pas tous les effets secondaires
    return () => {
      window.removeEventListener('resize', handleResize);
      // Manque le nettoyage de document.body.classList
    };
  }, []);
  
  // Fonction qui fait trop de choses - devrait être divisée
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Concatenation d'URL problématique
      const response = await fetch(apiBaseUrl + '/posts?page=' + currentPage + '&limit=' + postsPerPage);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des articles');
      }
      
      const data = await response.json();
      
      // Logique de transformation qui devrait être dans un service séparé
      const transformedPosts = data.data.map((post: any) => ({
        ...post,
        date: new Date(post.date).toLocaleDateString('fr-FR'),
      }));
      
      setPosts(transformedPosts);
      setTotalPages(Math.ceil(data.total / postsPerPage));
    } catch (err) {
      // Gestion d'erreur insuffisante
      console.error('Erreur:', err);
      setError('Impossible de charger les articles');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction qui mélange la logique de validation et la logique d'API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation dans le handler au lieu d'utiliser un hook de formulaire
    if (!username.trim() || !password.trim()) {
      setLoginError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setLoginError(null);
      
      // Envoi de mot de passe en clair - mauvaise pratique de sécurité
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Identifiants incorrects');
      }
      
      const data = await response.json();
      
      // Gestion de token non sécurisée
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsLoggedIn(true);
      window.globalState.isLoggedIn = true;
      window.globalState.userData = data.user;
      
      // Navigation impérative au lieu d'utiliser des hooks de navigation
      navigate('/admin');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setLoginError('Identifiants incorrects');
    }
  };
  
  // Fonction qui devrait utiliser useCallback
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.globalState.isLoggedIn = false;
    window.globalState.userData = null;
    navigate('/');
  };
  
  // Mauvaise pratique : toggles avec manipulation de localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    window.globalState.darkMode = newDarkMode;
    
    // Manipulation directe du DOM dans React
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };
  
  // Fonction de création de post avec logique métier intégrée
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Vous devez être connecté pour créer un article'); // alert() au lieu d'un UI propre
      return;
    }
    
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${apiBaseUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          author: user.username
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'article');
      }
      
      setNewPostTitle('');
      setNewPostContent('');
      
      // Refetchs inefficace de toutes les données
      fetchPosts();
      
      navigate('/');
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la création de l\'article');
    }
  };
  
  // Render avec conditionnels compliqués - devrait utiliser des composants séparés
  return (
    <div className={darkMode ? 'app dark-mode' : 'app'}>
      <header className="header">
        <div className="container">
          <h1>My Beautiful Blog</h1>
          <nav>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              {isLoggedIn ? (
                <>
                  <li><Link to="/admin">Administration</Link></li>
                  <li><button onClick={handleLogout}>Déconnexion</button></li>
                </>
              ) : (
                <li><Link to="/login">Connexion</Link></li>
              )}
              <li>
                <button onClick={toggleDarkMode}>
                  {darkMode ? 'Mode clair' : 'Mode sombre'}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="post-list-container">
                <h2>Articles récents</h2>
                
                {isLoading && <p>Chargement...</p>}
                
                {error && <p className="error">{error}</p>}
                
                {!isLoading && !error && posts.length === 0 && (
                  <p>Aucun article disponible</p>
                )}
                
                {posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <div className="post-meta">
                      <span>Par {post.author}</span>
                      <span>Le {post.date}</span>
                    </div>
                  </div>
                ))}
                
                {/* Pagination simple sans composant réutilisable */}
                <div className="pagination">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Précédent
                  </button>
                  
                  <span>
                    Page {currentPage} sur {totalPages}
                  </span>
                  
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            }
          />
          
          <Route
            path="/login"
            element={
              <div className="login-container">
                <h2>Connexion</h2>
                
                <form onSubmit={handleLogin} className="login-form">
                  {loginError && <p className="error">{loginError}</p>}
                  
                  <div className="form-group">
                    <label htmlFor="username">Nom d'utilisateur</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <button type="submit">Se connecter</button>
                </form>
              </div>
            }
          />
          
          <Route
            path="/admin"
            element={
              isLoggedIn ? (
                <div className="admin-container">
                  <h2>Administration</h2>
                  
                  <div className="create-post-form">
                    <h3>Créer un nouvel article</h3>
                    
                    <form onSubmit={handleCreatePost}>
                      <div className="form-group">
                        <label htmlFor="title">Titre</label>
                        <input
                          type="text"
                          id="title"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="content">Contenu</label>
                        <textarea
                          id="content"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={10}
                        />
                      </div>
                      
                      <button type="submit">Publier</button>
                    </form>
                  </div>
                </div>
              ) : (
                // Redirection manuelle - devrait utiliser Navigate de react-router
                <div className="unauthorized">
                  <p>Vous devez être connecté pour accéder à cette page</p>
                  <button onClick={() => navigate('/login')}>
                    Aller à la page de connexion
                  </button>
                </div>
              )
            }
          />
          
          {/* Route wildcard mal placée - devrait être la dernière */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <h2>Page non trouvée</h2>
                <p>La page que vous cherchez n'existe pas.</p>
                <Link to="/">Retour à l'accueil</Link>
              </div>
            }
          />
        </Routes>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 My Beautiful Blog</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
