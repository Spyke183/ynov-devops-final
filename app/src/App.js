import { useState, useEffect, useCallback } from 'react';
import './App.css';
import {
  validateField,
  isValidName,
  isValidEmail,
  isValidBirthDate,
  isValidZipCode,
  isValidCity,
} from './validators';
import { getUsers, addUser, login, deleteUser, getPrivateUsers } from './api';

/**
 * Composant principal : formulaire d'inscription (sauvegarde en base via l'API),
 * liste des inscrits, et espace admin (connexion, suppression, infos privees).
 * @return {JSX.Element} Le composant App.
 */
function App() {
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    email: '',
    birthDate: '',
    city: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(false);

  /**
   * Charge la liste des inscrits : complete (infos privees) si admin, reduite sinon.
   * @param {object|null} creds - Identifiants admin, ou null.
   */
  const loadUsers = useCallback(async (creds) => {
    try {
      if (creds) {
        setUsers(await getPrivateUsers(creds.email, creds.password));
      } else {
        const data = await getUsers();
        setUsers(data.users);
      }
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadUsers(null);
  }, [loadUsers]);

  /**
   * Gere le changement d'un champ du formulaire et valide en temps reel.
   * @param {Event} e - Evenement de changement.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (value === '') {
      setErrors((prev) => ({ ...prev, [name]: false }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: !validateField(name, value) }));
    }
  };

  /** @return {boolean} True si tous les champs sont valides. */
  const isFormValid = () =>
    isValidName(form.lastName) &&
    isValidName(form.firstName) &&
    isValidEmail(form.email) &&
    isValidBirthDate(form.birthDate) &&
    isValidCity(form.city) &&
    isValidZipCode(form.zipCode);

  /** @return {boolean} True si tous les champs sont vides. */
  const isFormEmpty = () =>
    form.lastName === '' &&
    form.firstName === '' &&
    form.email === '' &&
    form.birthDate === '' &&
    form.city === '' &&
    form.zipCode === '';

  /**
   * Soumet le formulaire : enregistre l'inscrit en base si valide.
   */
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setErrors({
        lastName: !isValidName(form.lastName),
        firstName: !isValidName(form.firstName),
        email: !isValidEmail(form.email),
        birthDate: !isValidBirthDate(form.birthDate),
        city: !isValidCity(form.city),
        zipCode: !isValidZipCode(form.zipCode)
      });
      setErrorToast(true);
      setTimeout(() => setErrorToast(false), 3000);
      return;
    }
    await addUser({
      last_name: form.lastName,
      first_name: form.firstName,
      email: form.email,
      birth_date: form.birthDate,
      city: form.city,
      zip_code: form.zipCode
    });
    await loadUsers(admin);
    setForm({ lastName: '', firstName: '', email: '', birthDate: '', city: '', zipCode: '' });
    setErrors({});
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  /** Gere le changement des champs de connexion admin. */
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  /** Connecte l'admin et recharge la liste avec les infos privees. */
  const handleLogin = async () => {
    try {
      await login(loginForm.email, loginForm.password);
      const creds = { email: loginForm.email, password: loginForm.password };
      setAdmin(creds);
      setLoginError(false);
      await loadUsers(creds);
    } catch {
      setLoginError(true);
    }
  };

  /** Deconnecte l'admin et revient a la liste reduite. */
  const handleLogout = () => {
    setAdmin(null);
    loadUsers(null);
  };

  /**
   * Supprime un inscrit (admin uniquement).
   * @param {number} id - Identifiant de l'inscrit.
   */
  const handleDelete = async (id) => {
    await deleteUser(id, admin.email, admin.password);
    await loadUsers(admin);
  };

  return (
    <div className="app">
      <h1>Formulaire d'inscription</h1>

      <nav style={{ marginBottom: 20 }}>
        <a href="docs/index.html" data-testid="docs-link">
          Voir la documentation
        </a>
      </nav>

      {toast && (
        <div data-testid="toast" role="status" style={{ color: 'green' }}>
          Inscription réussie !
        </div>
      )}

      {errorToast && (
        <div data-testid="error-toast" role="alert" style={{ color: 'red' }}>
          Veuillez corriger les champs en erreur.
        </div>
      )}

      <div>
        <label htmlFor="lastName">Nom</label>
        <input id="lastName" name="lastName" placeholder="Nom" value={form.lastName} onChange={handleChange} />
        {errors.lastName && <span style={{ color: 'red' }} data-testid="error-lastName">Nom invalide</span>}
      </div>

      <div>
        <label htmlFor="firstName">Prénom</label>
        <input id="firstName" name="firstName" placeholder="Prénom" value={form.firstName} onChange={handleChange} />
        {errors.firstName && <span style={{ color: 'red' }} data-testid="error-firstName">Prénom invalide</span>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        {errors.email && <span style={{ color: 'red' }} data-testid="error-email">Email invalide</span>}
      </div>

      <div>
        <label htmlFor="birthDate">Date de naissance</label>
        <input id="birthDate" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
        {errors.birthDate && <span style={{ color: 'red' }} data-testid="error-birthDate">Vous devez avoir 18 ans minimum</span>}
      </div>

      <div>
        <label htmlFor="city">Ville</label>
        <input id="city" name="city" placeholder="Ville" value={form.city} onChange={handleChange} />
        {errors.city && <span style={{ color: 'red' }} data-testid="error-city">Ville invalide</span>}
      </div>

      <div>
        <label htmlFor="zipCode">Code postal</label>
        <input id="zipCode" name="zipCode" placeholder="Code postal" value={form.zipCode} onChange={handleChange} />
        {errors.zipCode && <span style={{ color: 'red' }} data-testid="error-zipCode">Code postal invalide</span>}
      </div>

      <button onClick={handleSubmit} disabled={isFormEmpty()} data-testid="submit-btn">
        S'inscrire
      </button>

      <hr />

      {admin ? (
        <div data-testid="admin-panel">
          <p>Connecté en admin ({admin.email})</p>
          <button onClick={handleLogout} data-testid="logout-btn">Déconnexion</button>
        </div>
      ) : (
        <div data-testid="admin-login">
          <h3>Connexion administrateur</h3>
          <input
            name="email"
            placeholder="Email admin"
            value={loginForm.email}
            onChange={handleLoginChange}
            data-testid="login-email"
          />
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={loginForm.password}
            onChange={handleLoginChange}
            data-testid="login-password"
          />
          <button onClick={handleLogin} data-testid="login-btn">Se connecter</button>
          {loginError && <span style={{ color: 'red' }} data-testid="login-error">Identifiants invalides</span>}
        </div>
      )}

      <h2>Liste des inscrits ({users.length})</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id} data-testid="user-item">
            {u.first_name} {u.last_name}
            {admin && (
              <>
                {' '}- {u.email} - {u.birth_date} - {u.city} {u.zip_code}{' '}
                <button onClick={() => handleDelete(u.id)} data-testid="delete-btn">Supprimer</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
