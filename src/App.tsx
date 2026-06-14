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
import DistrictMapAtlas from './pages/DistrictMapAtlas';
import EditorPage from './pages/EditorPage';
import ExhibitionHall from './pages/ExhibitionHall';
import ExhibitDetail from './pages/ExhibitDetail';
import CompareArea from './pages/CompareArea';
import TourPage from './pages/TourPage';

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
                        <Route path="/map-atlas" element={<DistrictMapAtlas />} />
                        <Route path="/editor" element={<EditorPage />} />
                        <Route path="/exhibition" element={<ExhibitionHall />} />
                        <Route path="/exhibition/exhibit/:id" element={<ExhibitDetail />} />
                        <Route path="/exhibition/compare" element={<CompareArea />} />
                        <Route path="/exhibition/tour" element={<TourPage />} />
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
