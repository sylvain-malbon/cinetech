// src/utils/slug.js
export default function slugify(str) {
    return str
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents (diacritics)
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Remove multiple -
        .toLowerCase();
}
