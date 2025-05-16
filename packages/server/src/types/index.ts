// Types pour le serveur - Module d'exportation

// Interface pour un article de blog
export interface Post {
  id?: number;
  title: string;
  content: string;
  date?: string;
  author?: string;
}

// Interface pour l'authentification
export interface User {
  id?: number;
  username: string;
  password: string; // Stocké en clair délibérément (mauvaise pratique)
}

// Interface pour la réponse de connexion
export interface LoginResponse {
  token: string;
  user: User;
}

// Interface pour les erreurs API
export interface ApiError {
  error: string;
  code?: number;
}

// Type pour la pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

// Type de réponse pour les listes paginées
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
