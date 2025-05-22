import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Importujemy Router i Routes
import './index.css';
import CrudPage from './CRUD/page.jsx'; // Importujemy stronę CRUD
import App from './App.jsx'; // Główna strona aplikacji

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>  {/* Dodajemy Router wokół aplikacji */}
      <Routes>
        <Route path="/" element={<App />} />  {/* Główna strona */}
        <Route path="/crud" element={<CrudPage />} />  {/* Strona CRUD */}
      </Routes>
    </Router>
  </StrictMode>,
);
