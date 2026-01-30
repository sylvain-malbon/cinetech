import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";

export default function Login() {
    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saved, setSaved] = useState(false);
    const [storedUser, setStoredUser] = useLocalStorage('cinetech_user', '');
    const [storedEmail, setStoredEmail] = useLocalStorage('cinetech_email', '');

    const sanitize = (v) => v ? v.replace(/^@+/, '').trim() : '';

    function handleSubmit(e) {
        e.preventDefault();
        const p = sanitize(pseudo) || 'anonyme';
        try {
            setStoredUser(p);
            setStoredEmail(email || '');
            setSaved(true);
        } catch (err) {
            console.error('localStorage error', err);
        }
    }

    return (
        <div className="max-w-md mx-auto bg-gray-900 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 text-white">Se connecter</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm text-gray-300">Pseudo</label>
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-semibold">@</span>
                    <input
                        className="flex-1 p-2 rounded bg-gray-800 text-white focus:outline-none"
                        value={pseudo}
                        onChange={e => setPseudo(e.target.value)}
                        placeholder="choisir un pseudo"
                    />
                </div>

                <label className="block text-sm text-gray-300">E-mail</label>
                <input
                    className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                />

                <label className="block text-sm text-gray-300">Mot de passe</label>
                <input
                    className="w-full p-2 rounded bg-gray-800 text-white focus:outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                />

                <button type="submit" className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded hover:bg-yellow-300 transition">Se connecter</button>
                {saved && <div className="text-green-400 text-sm mt-2">Connecté !</div>}
            </form>
        </div>
    );
}
