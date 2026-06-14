import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CollectionsProvider } from './context/CollectionsContext';
import { OralArchivesProvider } from './context/OralArchivesContext';
import { StatusTrackingProvider } from './context/StatusTrackingContext';
import { SignboardsProvider } from './context/SignboardsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignboardDetail from './pages/SignboardDetail';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';
import CompareReport from './pages/CompareReport';
import CollectionDetail from './pages/CollectionDetail';
import CityRoaming from './pages/CityRoaming';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <ThemeProvider>
      <SignboardsProvider>
        <FavoritesProvider>
          <CollectionsProvider>
            <OralArchivesProvider>
              <StatusTrackingProvider>
                <BrowserRouter>
                  <div className="app">
                    <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signboard/:id" element={<SignboardDetail />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/compare" element={<Compare />} />
                        <Route path="/compare-report" element={<CompareReport />} />
                        <Route path="/collection/:id" element={<CollectionDetail />} />
                        <Route path="/roaming" element={<CityRoaming />} />
                        <Route path="/editor" element={<EditorPage />} />
                      </Routes>
                    </main>
                  </div>
                </BrowserRouter>
              </StatusTrackingProvider>
            </OralArchivesProvider>
          </CollectionsProvider>
        </FavoritesProvider>
      </SignboardsProvider>
    </ThemeProvider>
  );
}

export default App;
