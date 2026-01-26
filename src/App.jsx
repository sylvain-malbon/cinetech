import Header from './components/Header.jsx';
import { useEffect } from 'react';

function App() {
  useEffect(() => { console.log(import.meta.env.VITE_TMDB_API_KEY) }, [])
  return (
    <>
      <Header />
      {/* Ici tu ajouteras le routing et le rendu des pages */}
      <main className="p-4">
        <h1 className="text-2xl font-bold text-center mt-8">Bienvenue sur Cinetech</h1>
      </main>
    </>
  );
}

export default App;
