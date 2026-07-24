import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PhotoBooth from "./pages/PhotoBooth";
import Editor from "./pages/Editor";
import History from "./pages/History";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import { EditorProvider } from "./context/EditorContext";
import "./styles/Layout.css";

function App() {
  return (
    <Router>
      <EditorProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ambil-foto" element={<PhotoBooth />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </EditorProvider>
    </Router>
  );
}

export default App;
