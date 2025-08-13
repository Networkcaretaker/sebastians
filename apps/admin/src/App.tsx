// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MenuItems from './pages/MenuItems';
import ItemDetail from './pages/ItemDetail'; 
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail'; 
import Login from './components/Login';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
// Add these imports after the existing ones
import Menus from './pages/Menus';
import Website from './pages/Website';
import MenuDetail from './pages/MenuDetail';
import Settings from './pages/Settings';
import ExportData from './pages/ExportData';
import ImportData from './pages/ImportData';

// Protected Route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/menu-items" element={<ProtectedRoute element={<MenuItems />} />} />
      <Route path="/menu-items/:itemId" element={<ProtectedRoute element={<ItemDetail />} />} />
      <Route path="/categories" element={<ProtectedRoute element={<Categories />} />} />
      <Route path="/categories/:categoryId" element={<ProtectedRoute element={<CategoryDetail />} />} />
      <Route path="/menus" element={<ProtectedRoute element={<Menus />} />} />
      <Route path="/menus/:menuId" element={<ProtectedRoute element={<MenuDetail />} />} />
      <Route path="/website" element={<ProtectedRoute element={<Website />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      <Route path="/test-export" element={<ProtectedRoute element={<ExportData />} />} />
      <Route path="/test-import" element={<ProtectedRoute element={<ImportData />} />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <div className="pt-4">
            <AppRoutes />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;