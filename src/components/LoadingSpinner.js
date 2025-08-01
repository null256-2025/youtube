import React from 'react';

const LoadingSpinner = ({ message = '読み込み中...', size = 'md' }) => {
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : '';
  
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-4">
      <div className={`spinner-border text-primary ${spinnerSize}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted mb-0">{message}</p>
    </div>
  );
};

export default LoadingSpinner;