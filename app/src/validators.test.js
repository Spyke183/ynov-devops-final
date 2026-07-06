import {
    isValidName,
    isValidEmail,
    isValidBirthDate,
    isValidZipCode,
    isValidCity,
    validateField
} from './validators';

describe('isValidName', () => {
    it('accepte un nom simple', () => expect(isValidName('Dupont')).toBe(true));
    it('accepte les accents (é, è, ê)', () => expect(isValidName('Héloïse')).toBe(true));
    it('accepte les trémas (ï, ü)', () => expect(isValidName('Loïc')).toBe(true));
    it('accepte les tirets', () => expect(isValidName('Marie-Claire')).toBe(true));
    it('accepte les apostrophes', () => expect(isValidName("D'Artagnan")).toBe(true));
    it('accepte les espaces (prénoms composés)', () => expect(isValidName('Jean Pierre')).toBe(true));
    it('refuse une chaîne vide', () => expect(isValidName('')).toBe(false));
    it('refuse uniquement des espaces', () => expect(isValidName('   ')).toBe(false));
    it('refuse les chiffres', () => expect(isValidName('Dupont2')).toBe(false));
    it('refuse les caractères spéciaux (!)', () => expect(isValidName('Dupont!')).toBe(false));
    it('refuse les symboles (@)', () => expect(isValidName('Dup@nt')).toBe(false));
    it('refuse null', () => expect(isValidName(null)).toBe(false));
    it('refuse undefined', () => expect(isValidName(undefined)).toBe(false));
    it('refuse un nombre', () => expect(isValidName(123)).toBe(false));
});

describe('isValidEmail', () => {
    it('accepte un email standard', () => expect(isValidEmail('test@gmail.com')).toBe(true));
    it('accepte un email avec sous-domaine', () => expect(isValidEmail('jean@mail.co.uk')).toBe(true));
    it('accepte un email avec point', () => expect(isValidEmail('jean.dupont@gmail.com')).toBe(true));
    it('refuse sans @', () => expect(isValidEmail('testgmail.com')).toBe(false));
    it('refuse sans domaine', () => expect(isValidEmail('test@')).toBe(false));
    it('refuse sans extension', () => expect(isValidEmail('test@gmail')).toBe(false));
    it('refuse avec espace', () => expect(isValidEmail('test @gmail.com')).toBe(false));
    it('refuse une chaîne vide', () => expect(isValidEmail('')).toBe(false));
    it('refuse null', () => expect(isValidEmail(null)).toBe(false));
    it('refuse undefined', () => expect(isValidEmail(undefined)).toBe(false));
});

describe('isValidBirthDate', () => {
    it('accepte une personne de 20 ans', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 20);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(true);
    });
    it('accepte une personne de 50 ans', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 50);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(true);
    });
    it('accepte exactement 18 ans (anniversaire aujourd\'hui)', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(true);
    });
    it('refuse une personne de 17 ans', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 17);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(false);
    });
    it('refuse 17 ans et 364 jours (anniversaire demain)', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        date.setDate(date.getDate() + 1);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(false);
    });
    it('refuse une date aberrante (01/01/0001)', () => expect(isValidBirthDate('0001-01-01')).toBe(false));
    it('refuse une année avant 1900', () => expect(isValidBirthDate('1899-12-31')).toBe(false));
    it('refuse un âge supérieur à 120 ans', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 130);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(false);
    });
    it('refuse une date dans le futur', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        expect(isValidBirthDate(date.toISOString().split('T')[0])).toBe(false);
    });
    it('refuse une date invalide (string non parsable)', () => expect(isValidBirthDate('abc')).toBe(false));
    it('refuse une chaîne vide', () => expect(isValidBirthDate('')).toBe(false));
    it('refuse null', () => expect(isValidBirthDate(null)).toBe(false));
    it('refuse undefined', () => expect(isValidBirthDate(undefined)).toBe(false));
    it('refuse un nombre', () => expect(isValidBirthDate(20000101)).toBe(false));
});

describe('isValidZipCode', () => {
    it('accepte un code postal Paris', () => expect(isValidZipCode('75001')).toBe(true));
    it('accepte un code postal en province', () => expect(isValidZipCode('06560')).toBe(true));
    it('refuse 4 chiffres', () => expect(isValidZipCode('7500')).toBe(false));
    it('refuse 6 chiffres', () => expect(isValidZipCode('750011')).toBe(false));
    it('refuse les lettres', () => expect(isValidZipCode('7500A')).toBe(false));
    it('refuse une chaîne vide', () => expect(isValidZipCode('')).toBe(false));
    it('refuse null', () => expect(isValidZipCode(null)).toBe(false));
    it('refuse un nombre', () => expect(isValidZipCode(75001)).toBe(false));
});

describe('isValidCity', () => {
    it('accepte une ville simple', () => expect(isValidCity('Paris')).toBe(true));
    it('accepte les tirets', () => expect(isValidCity('Aix-en-Provence')).toBe(true));
    it('accepte les accents', () => expect(isValidCity('Évreux')).toBe(true));
    it('accepte les apostrophes', () => expect(isValidCity("L'Haÿ-les-Roses")).toBe(true));
    it('refuse les chiffres', () => expect(isValidCity('Paris75')).toBe(false));
    it('refuse les caractères spéciaux', () => expect(isValidCity('Paris!')).toBe(false));
    it('refuse une chaîne vide', () => expect(isValidCity('')).toBe(false));
    it('refuse null', () => expect(isValidCity(null)).toBe(false));
});

describe('validateField', () => {
    it('valide lastName via isValidName', () => expect(validateField('lastName', 'Dupont')).toBe(true));
    it('invalide lastName', () => expect(validateField('lastName', '123')).toBe(false));
    it('valide firstName via isValidName', () => expect(validateField('firstName', 'Jean')).toBe(true));
    it('valide email', () => expect(validateField('email', 'jean@test.com')).toBe(true));
    it('invalide email', () => expect(validateField('email', 'pasunemail')).toBe(false));
    it('valide birthDate (20 ans)', () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 20);
        expect(validateField('birthDate', date.toISOString().split('T')[0])).toBe(true);
    });
    it('valide zipCode', () => expect(validateField('zipCode', '75001')).toBe(true));
    it('invalide zipCode', () => expect(validateField('zipCode', 'abc')).toBe(false));
    it('valide city', () => expect(validateField('city', 'Lyon')).toBe(true));
    it('retourne false pour un champ inconnu', () => expect(validateField('unknown', 'value')).toBe(false));
});
