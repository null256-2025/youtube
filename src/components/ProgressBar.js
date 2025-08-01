import React from 'react';

const ProgressBar = ({ current, total, message }) => {
  if (total === 0) return null;
  
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">{message}</small>
        <small className="text-muted">{current}/{total} ({percentage}%)</small>
      </div>
      <div className="progress">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;