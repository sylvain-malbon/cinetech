import { useState, useEffect, useCallback } from "react";

// Hook simple pour synchroniser une clé du localStorage avec l'état React
export default function useLocalStorage(key, initialValue) {
    const readValue = useCallback(() => {
        if (typeof window === 'undefined') return typeof initialValue === 'function' ? initialValue() : initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? item : (typeof initialValue === 'function' ? initialValue() : initialValue);
        } catch (e) {
            console.error('useLocalStorage read error', e);
            return typeof initialValue === 'function' ? initialValue() : initialValue;
        }
    }, [key, initialValue]);

    const [storedValue, setStoredValue] = useState(readValue);

    // Toujours relire la valeur à chaque render (pour éviter les désyncs après login/logout)
    useEffect(() => {
        setStoredValue(readValue());
    });

    useEffect(() => {
        setStoredValue(readValue());
        // listen storage events from other tabs
        function handleStorage(e) {
            if (!e || !e.key) {
                // custom dispatched event (no key) -> refresh
                setStoredValue(readValue());
                return;
            }
            if (e.key === key) {
                setStoredValue(e.newValue);
            }
        }
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [key, readValue]);

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, valueToStore);
                // notify listeners (same-tab)
                try { window.dispatchEvent(new Event('storage')); } catch (e) { /* ignore */ }
            }
            setStoredValue(valueToStore);
        } catch (e) {
            console.error('useLocalStorage set error', e);
        }
    }, [key, storedValue]);

    const remove = useCallback(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
                try { window.dispatchEvent(new Event('storage')); } catch (e) { /* ignore */ }
            }
            setStoredValue(undefined);
        } catch (e) {
            console.error('useLocalStorage remove error', e);
        }
    }, [key]);

    return [storedValue, setValue, remove];
}
// Hook personnalisé pour utiliser le localStorage
