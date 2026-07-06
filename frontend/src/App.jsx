import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import AppNavigation from './components/AppNavigation';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Home from './pages/Home';
import AuthenticatedRoute from './components/AuthRoute';
import AdvancedSearch from "./components/AdvancedSearch";
import MyRatings from "./pages/MyRatings";
import RentalDetails from "./components/RentalDetails";


// ── Protected Route ──────────────────────────────────────────
function ProtectedRoute() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppLayout() {
  return (
    <div className="App" style={{ width: "100%" }}>
      <AppNavigation />
      <Outlet />
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <About /> },
      { path: 'home', element: <Home /> },
      { path: 'advanced-search', element: <AdvancedSearch /> },
      { path: 'search', element: <Search /> },
      { path: "rentals/:id", element: <RentalDetails /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'my-ratings', element: <MyRatings /> },
      {
        element: <AuthenticatedRoute />,
      },
    ],
  },
], { basename: '/Rental-Search-Application/' });

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;

