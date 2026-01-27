

import Header from './components/Header.jsx';
import Movies from './pages/Movies.jsx';
import Series from './pages/Series.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import Details from './pages/Details.jsx';
import Favorites from './pages/Favorites.jsx';
import Messages from './pages/Messages.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="bg-gray-800 min-h-screen">
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/results" element={<Results />} />
            <Route path="/movies/:idSlug" element={<Details />} />
            <Route path="/series" element={<Series />} />
            <Route path="/series/:idSlug" element={<Details />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
