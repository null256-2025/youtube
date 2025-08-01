
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
          <footer className="bg-light border-top mt-5 py-4">
            <div className="container">
              <div className="row">
                <div className="col-md-8">
                  <div className="d-flex flex-wrap align-items-center">
                    <Link to="/terms" className="text-decoration-none me-4 mb-2">
                      <i className="bi bi-file-text me-1"></i>利用規約
                    </Link>
                    <Link to="/privacy" className="text-decoration-none me-4 mb-2">
                      <i className="bi bi-shield-check me-1"></i>プライバシーポリシー
                    </Link>
                    <a
                      href="https://www.youtube.com/t/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none text-muted me-4 mb-2"
                    >
                      <i className="bi bi-youtube me-1"></i>YouTube利用規約
                    </a>
                  </div>
                </div>
                <div className="col-md-4 text-md-end">
                  <small className="text-muted">
                    <i className="bi bi-youtube me-1"></i>
                    Powered by YouTube API
                  </small>
                </div>
              </div>
              <hr className="my-3" />
              <div className="row">
                <div className="col-12 text-center">
                  <small className="text-muted">
                    © 2025 YouTubeチャンネル分析ツール |
                    本サービスの利用により、YouTube利用規約に同意したものとみなされます
                  </small>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
