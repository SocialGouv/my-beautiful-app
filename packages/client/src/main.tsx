import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './main.css';

// Variables globales dans window - mauvaise pratique
// Des développeurs seniors devraient utiliser un état géré proprement avec Context ou Redux
window.globalState = {
  isLoggedIn: false,
  userData: null,
  darkMode: localStorage.getItem('darkMode') === 'true',
  apiBaseUrl: 'http://localhost:3001/api'
};

// Pas de gestion d'erreurs au niveau racine
// Absence de error boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode désactivé - mauvaise pratique qui empêche de détecter les problèmes
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Manipulation directe du DOM en dehors de React - toujours mauvaise pratique
// Un développeur senior utiliserait des refs ou des hooks
document.addEventListener('DOMContentLoaded', function() {
  const root = document.documentElement;
  
  // État global géré par manipulation DOM directe au lieu de React
  if (window.globalState.darkMode) {
    root.classList.add('dark-mode');
  }
  
  // Événements attachés directement au window au lieu de composants React
  window.addEventListener('storage', function(e) {
    if (e.key === 'darkMode') {
      window.globalState.darkMode = e.newValue === 'true';
      if (window.globalState.darkMode) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
    }
  });
  
  // Absence de cleanup des event listeners
});
