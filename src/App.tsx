import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import PreviewPhoto from "./components/PhotoCapture/PreviewPhoto";
import PhotoGallery from "./components/PhotoGallery/PhotoGallery";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preview-photo" element={<PreviewPhoto />} />
        <Route path="/photo-gallery" element={<PhotoGallery />} />
      </Routes>
    </Router>
  );
}

export default App;
