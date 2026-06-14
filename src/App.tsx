import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CollectionsProvider } from './context/CollectionsContext';
import { OralArchivesProvider } from './context/OralArchivesContext';
import { StatusTrackingProvider } from './context/StatusTrackingContext';
import { SignboardsProvider } from './context/SignboardsContext';
import { FontEvolutionProvider } from './context/FontEvolutionContext';
import { CityMemoryProvider } from './context/CityMemoryContext';
import { CalendarProvider } from './context/CalendarContext';
import { ResearchLabProvider } from './context/ResearchLabContext';
import { StreetCornerProvider } from './context/StreetCornerContext';
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
import FontEvolution from './pages/FontEvolution';
import FontFamilyDetail from './pages/FontFamilyDetail';
import CityMemory from './pages/CityMemory';
import SignboardCalendar from './pages/SignboardCalendar';
import SignboardResearchLab from './pages/SignboardResearchLab';
import RestorationArchive from './pages/RestorationArchive';
import StreetCornerRanking from './pages/StreetCornerRanking';
import StreetCornerDetail from './pages/StreetCornerDetail';

function App() {
  return (
    <ThemeProvider>
      <SignboardsProvider>
        <FontEvolutionProvider>
          <FavoritesProvider>
            <CollectionsProvider>
              <OralArchivesProvider>
                <StatusTrackingProvider>
                  <CityMemoryProvider>
                    <CalendarProvider>
                      <ResearchLabProvider>
                        <StreetCornerProvider>
                      <BrowserRouter>
                        <div className="app">
                          <Navbar />
                          <main>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/calendar" element={<SignboardCalendar />} />
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
                              <Route path="/font-evolution" element={<FontEvolution />} />
                              <Route path="/font-evolution/:id" element={<FontFamilyDetail />} />
                              <Route path="/city-memory" element={<CityMemory />} />
                              <Route path="/research-lab" element={<SignboardResearchLab />} />
                              <Route path="/restoration-archive" element={<RestorationArchive />} />
                              <Route path="/streetcorner" element={<StreetCornerRanking />} />
                              <Route path="/streetcorner/ranking/:rankingId" element={<StreetCornerDetail />} />
                              <Route path="/streetcorner/corner/:cornerId" element={<StreetCornerDetail />} />
                            </Routes>
                          </main>
                        </div>
                      </BrowserRouter>
                        </StreetCornerProvider>
                      </ResearchLabProvider>
                    </CalendarProvider>
                  </CityMemoryProvider>
                </StatusTrackingProvider>
              </OralArchivesProvider>
            </CollectionsProvider>
          </FavoritesProvider>
        </FontEvolutionProvider>
      </SignboardsProvider>
    </ThemeProvider>
  );
}

export default App;
