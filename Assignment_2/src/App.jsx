import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './App.css';

import Footer from './components/Footer';
import Header from './components/Header';
import Nav from './components/Nav';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Home from './pages/Home';

function AppLayout() {
  return (
    <div className="App">
      <Header />
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element : <AppLayout />,
    children: [
      {index: true, element: <About />},
      {path: 'home', element: <Home />},
      {path: 'search', element: <Search />},
      {path: 'login', element: <Login />}, 
      {path: 'register', element: <Register />}
    ]
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;

