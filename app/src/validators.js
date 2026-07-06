/**
 * Vérifie si un nom, prénom ou ville est valide.
 * Accepte : lettres (a-z, A-Z), accents (À-ÖØ-öø-ÿ), espaces, tirets, apostrophes.
 * Refuse : chiffres, symboles mathématiques (×÷), caractères spéciaux.
 * @param {string} name - La chaîne à valider.
 * @return {boolean} True si valide, false sinon.
 */
export function isValidName(name) {
    return typeof name === 'string'
        && name.trim().length > 0
        && /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(name);
}

/**
 * Vérifie si un email est au format valide.
 * @param {string} email - L'email à valider.
 * @return {boolean} True si valide, false sinon.
 */
export function isValidEmail(email) {
    return typeof email === 'string'
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Vérifie si la date de naissance correspond à une personne majeure (>= 18 ans).
 * Rejette les dates aberrantes : année hors de [1900, année courante]
 * (ex : 0001-01-01) et tout âge supérieur à 120 ans.
 * @param {string} date - Date de naissance au format YYYY-MM-DD.
 * @return {boolean} True si majeur et date plausible, false sinon.
 */
export function isValidBirthDate(date) {
    if (!date || typeof date !== 'string') return false;
    const birthDate = new Date(date);
    if (isNaN(birthDate.getTime())) return false;
    const today = new Date();
    // Garde-fou : on rejette les années aberrantes (ex : 0001).
    const birthYear = birthDate.getFullYear();
    if (birthYear < 1900 || birthYear > today.getFullYear()) return false;
    let age = today.getFullYear() - birthYear;
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }
    return age >= 18 && age <= 120;
}

/**
 * Vérifie si un code postal est au format français (5 chiffres).
 * @param {string} zip - Le code postal à valider.
 * @return {boolean} True si valide, false sinon.
 */
export function isValidZipCode(zip) {
    return typeof zip === 'string' && /^[0-9]{5}$/.test(zip);
}

/**
 * Vérifie si un nom de ville est valide (mêmes règles que isValidName).
 * @param {string} city - La ville à valider.
 * @return {boolean} True si valide, false sinon.
 */
export function isValidCity(city) {
    return typeof city === 'string'
        && city.trim().length > 0
        && /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(city);
}

/**
 * Valide un champ du formulaire par son nom.
 * @param {string} fieldName - Nom du champ (lastName, firstName, email, birthDate, city, zipCode).
 * @param {string} value - Valeur du champ.
 * @return {boolean} True si le champ est valide, false sinon.
 */
export function validateField(fieldName, value) {
    switch (fieldName) {
        case 'lastName':
        case 'firstName':
            return isValidName(value);
        case 'email':
            return isValidEmail(value);
        case 'birthDate':
            return isValidBirthDate(value);
        case 'zipCode':
            return isValidZipCode(value);
        case 'city':
            return isValidCity(value);
        default:
            return false;
    }
}
