import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// We'll create these components in the next steps
import Home from './pages/Home';
import MenuDisplay from './pages/MenuDisplay';
import { AllergyVisibilityProvider } from './contexts/AllergyVisibilityContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AllergyVisibilityProvider>
        <Router>
          <div className="min-h-screen bg-black">
            <Routes>
              {/* Home page with navigation to published menus */}
              <Route path="/" element={<Home />} />
              
              {/* Individual menu display page */}
              <Route path="/menu/:menuId" element={<MenuDisplay />} />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
        </Router>
      </AllergyVisibilityProvider>
    </LanguageProvider>
  );
}

export default App;