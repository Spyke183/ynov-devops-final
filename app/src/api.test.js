import { getUsers, addUser, login, deleteUser, getPrivateUsers } from './api';

const okJson = (data) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
const fail = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });

describe('api', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('getUsers', () => {
    it('renvoie la liste en cas de succès', async () => {
      global.fetch = jest.fn(() => okJson({ count: 1, users: [{ id: 1 }] }));
      const data = await getUsers();
      expect(data.count).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/users');
    });
    it('lève une erreur si la réponse est KO', async () => {
      global.fetch = jest.fn(() => fail());
      await expect(getUsers()).rejects.toThrow();
    });
  });

  describe('addUser', () => {
    it('envoie un POST et renvoie l\'id créé', async () => {
      global.fetch = jest.fn(() => okJson({ id: 5 }));
      const res = await addUser({ last_name: 'Dupont' });
      expect(res.id).toBe(5);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/users',
        expect.objectContaining({ method: 'POST' })
      );
    });
    it('lève une erreur si KO', async () => {
      global.fetch = jest.fn(() => fail());
      await expect(addUser({})).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('renvoie isAdmin en cas de succès', async () => {
      global.fetch = jest.fn(() => okJson({ isAdmin: true }));
      const res = await login('a@b.c', 'pw');
      expect(res.isAdmin).toBe(true);
    });
    it('lève une erreur si identifiants invalides', async () => {
      global.fetch = jest.fn(() => fail());
      await expect(login('x', 'y')).rejects.toThrow('Identifiants invalides');
    });
  });

  describe('deleteUser', () => {
    it('envoie un DELETE avec les en-têtes admin', async () => {
      global.fetch = jest.fn(() => okJson({ deleted: 3 }));
      const res = await deleteUser(3, 'a@b.c', 'pw');
      expect(res.deleted).toBe(3);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/users/3',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
    it('lève une erreur si KO', async () => {
      global.fetch = jest.fn(() => fail());
      await expect(deleteUser(1, 'x', 'y')).rejects.toThrow();
    });
  });

  describe('getPrivateUsers', () => {
    it('renvoie la liste complète en cas de succès', async () => {
      global.fetch = jest.fn(() => okJson({ users: [{ id: 1, email: 'a@b.c' }] }));
      const list = await getPrivateUsers('a@b.c', 'pw');
      expect(list[0].email).toBe('a@b.c');
    });
    it('lève une erreur si accès refusé', async () => {
      global.fetch = jest.fn(() => fail());
      await expect(getPrivateUsers('x', 'y')).rejects.toThrow();
    });
  });
});
