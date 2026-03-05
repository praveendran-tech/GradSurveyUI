import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DataManagementPage } from './pages/DataManagementPage';
import { DownloadPage } from './pages/DownloadPage';
import { ReportPage } from './pages/ReportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/manage" element={<DataManagementPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
