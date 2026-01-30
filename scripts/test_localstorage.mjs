// simple test runner for localStorage utils
import url from 'url';
import path from 'path';

// Polyfill window + localStorage + CustomEvent for testing
const makeLocalStorage = () => {
    const store = new Map();
    return {
        getItem(key) { return store.has(key) ? store.get(key) : null; },
        setItem(key, val) { store.set(key, String(val)); },
        removeItem(key) { store.delete(key); },
        clear() { store.clear(); },
        _store() { return new Map(store); }
    };
};

globalThis.CustomEvent = class CustomEvent {
    constructor(type, init = {}) { this.type = type; this.detail = init.detail; }
};

const events = [];
const fakeLocal = makeLocalStorage();

globalThis.window = {
    localStorage: fakeLocal,
    dispatchEvent(e) { events.push(e); }
};
// some modules access localStorage directly (not window.localStorage)
globalThis.localStorage = fakeLocal;

const scriptPath = path.resolve('./src/utils/localStorage.js');
const fileUrl = url.pathToFileURL(scriptPath).href;

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg || 'Assertion failed');
};

const results = [];

try {
    const lib = await import(fileUrl);

    // Test 1: repair on corrupted JSON
    try {
        window.localStorage.setItem('cinetech_favorites', 'not-a-json');
        events.length = 0;
        const favs = lib.getFavorites();
        assert(Array.isArray(favs) && favs.length === 0, 'getFavorites should return [] on corrupted JSON');
        assert(window.localStorage.getItem('cinetech_favorites') === null, 'corrupted key should be removed');
        const repaired = events.find(e => e.type === 'cinetech:localStorageRepaired');
        assert(repaired, 'cinetech:localStorageRepaired must be dispatched');
        results.push('repair: PASS');
    } catch (e) {
        results.push('repair: FAIL - ' + e.message);
    }

    // Test 2: addFavorite dispatches storage and persists
    try {
        window.localStorage.clear();
        events.length = 0;
        lib.addFavorite({ id: 42, media_type: 'movie' });
        const raw = window.localStorage.getItem('cinetech_favorites');
        assert(raw && raw.includes('42'), 'favorite not persisted');
        // debug: print events
        // console.log('events after addFavorite:', events.map(e => e.type));
        const evt = events.find(e => e.type === 'storage');
        if (!evt) {
            console.log('DEBUG events:', events.map(e => ({ type: e.type, detail: e.detail })));
        }
        assert(evt, 'storage event must be dispatched on addFavorite');
        results.push('addFavorite: PASS');
    } catch (e) {
        results.push('addFavorite: FAIL - ' + e.message);
    }

    // Test 3: removeFavorite dispatches storage and removes
    try {
        events.length = 0;
        lib.addFavorite({ id: 43, media_type: 'movie' });
        lib.removeFavorite({ id: 42, media_type: 'movie' });
        const raw2 = window.localStorage.getItem('cinetech_favorites');
        assert(raw2 && raw2.includes('43') && !raw2.includes('42'), 'removeFavorite did not update storage correctly');
        const evt2 = events.find(e => e.type === 'storage');
        assert(evt2, 'storage event must be dispatched on removeFavorite');
        results.push('removeFavorite: PASS');
    } catch (e) {
        results.push('removeFavorite: FAIL - ' + e.message);
    }

    // Test 4: clamp page logic
    try {
        const clampPage = (page, favoritesLength, perPage) => {
            const totalPages = Math.ceil(favoritesLength / perPage);
            return Math.min(page, Math.max(1, totalPages));
        };
        assert(clampPage(3, 25, 20) === 2, 'clamp should reduce page from 3 to 2');
        assert(clampPage(1, 5, 20) === 1, 'clamp should keep page 1');
        assert(clampPage(5, 100, 20) === 5, 'clamp should keep page within bounds');
        results.push('clampPage: PASS');
    } catch (e) {
        results.push('clampPage: FAIL - ' + e.message);
    }

    console.log('\nTest results:');
    results.forEach(r => console.log(' -', r));
    process.exit(0);
} catch (e) {
    console.error('Test harness error:', e);
    process.exit(2);
}
