// Supprime complètement un commentaire pour un item
export function deleteComment(item) {
    let coms = getComments();
    coms = coms.filter(c => !(c.id === item.id && c.media_type === (item.media_type || (item.title ? 'movie' : 'tv'))));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(coms));
}
// Clé utilisée pour stocker les commentaires
const COMMENTS_KEY = 'cinetech_comments';

// Récupère tous les commentaires
export function getComments() {
    const coms = localStorage.getItem(COMMENTS_KEY);
    return coms ? JSON.parse(coms) : [];
}

// Ajoute ou met à jour un commentaire pour un item
export function saveComment(item, content) {
    let coms = getComments();
    // Un seul commentaire par item (id+type)
    const idx = coms.findIndex(c => c.id === item.id && c.media_type === (item.media_type || (item.title ? 'movie' : 'tv')));
    let replies = [];
    if (idx !== -1 && Array.isArray(coms[idx].replies)) {
        replies = coms[idx].replies;
    } else if (item.replies && Array.isArray(item.replies)) {
        replies = item.replies;
    }
    // Préserver l'auteur existant si présent, sinon utiliser item.author ou 'anonyme' par défaut
    const existingAuthor = (idx !== -1 && coms[idx] && coms[idx].author) ? coms[idx].author : (item.author || 'anonyme');
    console.log('saveComment: item.author=', item.author, 'existingAuthor=', existingAuthor, 'item=', item);
    // Inclure poster_path et autres infos utiles pour l'affichage dans Comments
    const newCom = {
        id: item.id,
        media_type: item.media_type || (item.title ? 'movie' : 'tv'),
        title: item.title || item.name,
        name: item.name,
        poster_path: item.poster_path || (idx !== -1 && coms[idx] && coms[idx].poster_path),
        content,
        replies,
        author: existingAuthor
    };
    if (idx !== -1) {
        coms[idx] = newCom;
    } else {
        coms.push(newCom);
    }
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(coms));
}

// Récupère le commentaire d'un item
export function getComment(item) {
    const coms = getComments();
    const found = coms.find(c => c.id === item.id && c.media_type === (item.media_type || (item.title ? 'movie' : 'tv')));
    return found ? found.content : "";
}

// Clé utilisée pour stocker les favoris
const FAVORITES_KEY = 'cinetech_favorites';

// Récupère la liste des favoris depuis le localStorage
export function getFavorites() {
    const favs = localStorage.getItem(FAVORITES_KEY);
    return favs ? JSON.parse(favs) : [];
}

// Ajoute un favori (film ou série)
export function addFavorite(item) {
    const favs = getFavorites();
    // Évite les doublons (par id)
    if (!favs.some(f => f.id === item.id && f.media_type === item.media_type)) {
        favs.push(item);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    }
}

// Retire un favori (film ou série)
export function removeFavorite(item) {
    let favs = getFavorites();
    favs = favs.filter(f => !(f.id === item.id && f.media_type === item.media_type));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

// Vérifie si un item est déjà en favori
export function isFavorite(item) {
    const favs = getFavorites();
    return favs.some(f => f.id === item.id && f.media_type === item.media_type);
}
