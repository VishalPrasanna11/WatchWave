import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import AccountPage from "./components/Pages/Dashboard/Account";
import UsersPage from "./components/Pages/Dashboard/WatchPage";
import DashboardPage from "./components/Pages/Dashboard/Dash";
import CategoriesPage from "./components/Pages/Dashboard/Upload";
import WatchPage from "./components/Pages/Dashboard/WatchPage";
import ProtectRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
        
        {/* Wrap protected routes inside a ProtectRoute */}
       
        <Route path="/upload" element={<CategoriesPage />} />
        <Route path="/account" element={<AccountPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
