import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-5 py-4 border-top">
      <div className="text-center">
        <p className="text-muted mb-2">
          <small>
            <i className="bi bi-youtube me-1"></i>
            Powered by YouTube API
          </small>
        </p>
        <p className="text-muted mb-0">
          <small>
            本サービスを利用することで、
            <a 
              href="https://www.youtube.com/t/terms" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-decoration-none"
            >
              YouTube利用規約
            </a>
            に同意したものとみなされます
          </small>
        </p>
      </div>
    </footer>
  );
};

export default Footer;