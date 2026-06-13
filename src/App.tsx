import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CollectionsProvider } from './context/CollectionsContext';
import { OralArchivesProvider } from './context/OralArchivesContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignboardDetail from './pages/SignboardDetail';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';
import CollectionDetail from './pages/CollectionDetail';

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <CollectionsProvider>
          <OralArchivesProvider>
            <BrowserRouter>
              <div className="app">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signboard/:id" element={<SignboardDetail />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/collection/:id" element={<CollectionDetail />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </OralArchivesProvider>
        </CollectionsProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
