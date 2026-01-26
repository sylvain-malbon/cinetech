import slugify from './slug.js';

const testString = 'Tron : Ares';
const result = slugify(testString);
console.log(`Résultat du slugify sur '${testString}':`, result);
if (result === 'tron-ares') {
    console.log('Test OK: tron-ares');
} else if (result === '') {
    console.log('Test échoué: chaîne vide');
} else {
    console.log('Test échoué: résultat inattendu:', result);
}
