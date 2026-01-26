

import Header from './components/Header.jsx';
import Movies from './pages/Movies.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import SerieDetails from './pages/SerieDetails.jsx';
import Favorites from './pages/Favorites.jsx';
import Messages from './pages/Messages.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Header />
      <main className="p-4">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/results" element={<Results />} />
          <Route path="/movie/:idSlug" element={<MovieDetails />} />
          <Route path="/serie/:idSlug" element={<SerieDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
