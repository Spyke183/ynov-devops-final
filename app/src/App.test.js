import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { getUsers, addUser, login, deleteUser, getPrivateUsers } from './api';

// On simule le module api : aucun vrai appel reseau pendant les tests.
jest.mock('./api');

/** Retourne une date YYYY-MM-DD pour un age donne. */
const dateForAge = (years) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().split('T')[0];
};

/** Remplit le formulaire d'inscription avec des valeurs valides par defaut. */
const fillForm = (overrides = {}) => {
  const v = {
    lastName: 'Dupont', firstName: 'Jean', email: 'jean@test.com',
    birthDate: dateForAge(20), city: 'Paris', zipCode: '75001', ...overrides
  };
  fireEvent.change(screen.getByLabelText('Nom'), { target: { name: 'lastName', value: v.lastName } });
  fireEvent.change(screen.getByLabelText('Prénom'), { target: { name: 'firstName', value: v.firstName } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { name: 'email', value: v.email } });
  fireEvent.change(screen.getByLabelText('Date de naissance'), { target: { name: 'birthDate', value: v.birthDate } });
  fireEvent.change(screen.getByLabelText('Ville'), { target: { name: 'city', value: v.city } });
  fireEvent.change(screen.getByLabelText('Code postal'), { target: { name: 'zipCode', value: v.zipCode } });
};

/** Rend l'App en attendant le chargement initial (getUsers). */
const renderApp = async () => {
  await act(async () => { render(<App />); });
};

/** Remplit les identifiants admin et clique sur « Se connecter ». */
const loginAsAdmin = async () => {
  fireEvent.change(screen.getByTestId('login-email'), { target: { name: 'email', value: 'loise.fenoll@ynov.com' } });
  fireEvent.change(screen.getByTestId('login-password'), { target: { name: 'password', value: 'test-admin-pwd' } });
  await act(async () => { fireEvent.click(screen.getByTestId('login-btn')); });
};

beforeEach(() => {
  jest.clearAllMocks();
  getUsers.mockResolvedValue({ count: 0, users: [] });
  getPrivateUsers.mockResolvedValue([]);
  addUser.mockResolvedValue({ id: 1 });
  login.mockResolvedValue({ isAdmin: true });
  deleteUser.mockResolvedValue({ deleted: 1 });
});

describe('Rendu initial', () => {
  it('affiche le titre et les champs', async () => {
    await renderApp();
    expect(screen.getByText("Formulaire d'inscription")).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toBeInTheDocument();
    expect(screen.getByLabelText('Code postal')).toBeInTheDocument();
  });

  it('le bouton est désactivé quand tous les champs sont vides', async () => {
    await renderApp();
    expect(screen.getByTestId('submit-btn')).toBeDisabled();
  });

  it('affiche le formulaire de connexion admin', async () => {
    await renderApp();
    expect(screen.getByTestId('admin-login')).toBeInTheDocument();
  });
});

describe('Chargement des inscrits', () => {
  it('affiche la liste réduite renvoyée par l\'API', async () => {
    getUsers.mockResolvedValueOnce({ count: 2, users: [
      { id: 1, first_name: 'Jean', last_name: 'Dupont' },
      { id: 2, first_name: 'Marie', last_name: 'Martin' }
    ] });
    await renderApp();
    expect(screen.getAllByTestId('user-item')).toHaveLength(2);
    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it('affiche une liste vide si le chargement échoue', async () => {
    getUsers.mockRejectedValueOnce(new Error('network'));
    await renderApp();
    expect(screen.queryAllByTestId('user-item')).toHaveLength(0);
  });
});

describe('Validation des champs', () => {
  it('affiche une erreur si le nom contient des chiffres', async () => {
    await renderApp();
    fireEvent.change(screen.getByLabelText('Nom'), { target: { name: 'lastName', value: '123' } });
    expect(screen.getByTestId('error-lastName')).toBeInTheDocument();
  });

  it("l'erreur disparaît si on vide le champ", async () => {
    await renderApp();
    const email = screen.getByLabelText('Email');
    fireEvent.change(email, { target: { name: 'email', value: 'invalide' } });
    expect(screen.getByTestId('error-email')).toBeInTheDocument();
    fireEvent.change(email, { target: { name: 'email', value: '' } });
    expect(screen.queryByTestId('error-email')).not.toBeInTheDocument();
  });
});

describe('Soumission du formulaire', () => {
  it('enregistre l\'inscrit via l\'API et affiche le toaster de succès', async () => {
    await renderApp();
    fillForm();
    await act(async () => { fireEvent.click(screen.getByTestId('submit-btn')); });
    expect(addUser).toHaveBeenCalledTimes(1);
    expect(addUser).toHaveBeenCalledWith(expect.objectContaining({ last_name: 'Dupont', first_name: 'Jean' }));
    expect(screen.getByTestId('toast')).toBeInTheDocument();
  });

  it('affiche le toaster d\'erreur si la soumission est invalide', async () => {
    await renderApp();
    fillForm({ email: 'pasunemail' });
    await act(async () => { fireEvent.click(screen.getByTestId('submit-btn')); });
    expect(addUser).not.toHaveBeenCalled();
    expect(screen.getByTestId('error-toast')).toBeInTheDocument();
  });

  it("le toaster d'erreur disparaît après 3 secondes", async () => {
    getUsers.mockReturnValue(new Promise(() => {}));
    jest.useFakeTimers();
    render(<App />);
    fillForm({ email: 'pasunemail' });
    fireEvent.click(screen.getByTestId('submit-btn'));
    expect(screen.getByTestId('error-toast')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(3000); });
    expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});

describe('Espace administrateur', () => {
  it('connexion réussie : affiche le panneau admin et les infos privées', async () => {
    getPrivateUsers.mockResolvedValueOnce([
      { id: 1, first_name: 'Jean', last_name: 'Dupont', email: 'jean@test.com', birth_date: '2000-01-01', city: 'Paris', zip_code: '75001' }
    ]);
    await renderApp();
    fireEvent.change(screen.getByTestId('login-email'), { target: { name: 'email', value: 'loise.fenoll@ynov.com' } });
    fireEvent.change(screen.getByTestId('login-password'), { target: { name: 'password', value: 'test-admin-pwd' } });
    await act(async () => { fireEvent.click(screen.getByTestId('login-btn')); });
    expect(login).toHaveBeenCalledWith('loise.fenoll@ynov.com', 'test-admin-pwd');
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
    expect(screen.getByText(/jean@test.com/)).toBeInTheDocument();
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
  });

  it('connexion échouée : affiche une erreur', async () => {
    login.mockRejectedValueOnce(new Error('invalide'));
    await renderApp();
    await act(async () => { fireEvent.click(screen.getByTestId('login-btn')); });
    expect(screen.getByTestId('login-error')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();
  });

  it('déconnexion : revient au formulaire de connexion', async () => {
    await renderApp();
    await act(async () => { fireEvent.click(screen.getByTestId('login-btn')); });
    expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByTestId('logout-btn')); });
    expect(screen.getByTestId('admin-login')).toBeInTheDocument();
  });

  it('suppression d\'un inscrit par l\'admin', async () => {
    getPrivateUsers.mockResolvedValueOnce([
      { id: 7, first_name: 'A', last_name: 'B', email: 'a@b.c', birth_date: '2000-01-01', city: 'X', zip_code: '00000' }
    ]);
    await renderApp();
    await loginAsAdmin();
    await act(async () => { fireEvent.click(screen.getByTestId('delete-btn')); });
    expect(deleteUser).toHaveBeenCalledWith(7, 'loise.fenoll@ynov.com', 'test-admin-pwd');
  });
});
