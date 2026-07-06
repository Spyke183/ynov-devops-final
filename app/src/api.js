// URL du serveur d'API, construite a partir de la variable d'environnement.
const API_URL = process.env.REACT_APP_API_URL || `http://localhost:${process.env.REACT_APP_SERVER_PORT || '8000'}`;

/**
 * Recupere la liste publique des inscrits (informations reduites) et le total.
 * @return {Promise<{count: number, users: Array}>}
 */
export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Erreur lors du chargement des inscrits');
  return response.json();
}

/**
 * Enregistre un nouvel inscrit en base.
 * @param {object} user - Les champs du formulaire.
 * @return {Promise<object>} L'identifiant cree.
 */
export async function addUser(user) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error("Erreur lors de l'enregistrement");
  return response.json();
}

/**
 * Connexion administrateur.
 * @param {string} email
 * @param {string} password
 * @return {Promise<object>}
 */
export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Identifiants invalides');
  return response.json();
}

/**
 * Supprime un inscrit (reserve a l'admin).
 * @param {number} id
 * @param {string} adminEmail
 * @param {string} adminPassword
 * @return {Promise<object>}
 */
export async function deleteUser(id, adminEmail, adminPassword) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-email': adminEmail, 'x-admin-password': adminPassword },
  });
  if (!response.ok) throw new Error('Suppression refusee');
  return response.json();
}

/**
 * Liste complete des inscrits avec leurs informations privees (reserve a l'admin).
 * @param {string} adminEmail
 * @param {string} adminPassword
 * @return {Promise<Array>}
 */
export async function getPrivateUsers(adminEmail, adminPassword) {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { 'x-admin-email': adminEmail, 'x-admin-password': adminPassword },
  });
  if (!response.ok) throw new Error('Acces refuse');
  const data = await response.json();
  return data.users;
}
