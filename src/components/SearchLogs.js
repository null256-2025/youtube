import React from 'react';

const SearchLogs = React.memo(({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="mt-5">
      <h2 className="mb-4 text-center">検索ログ</h2>
      <ul className="list-group">
        {logs.map((log, index) => (
          <li key={index} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-2">
                  <a 
                    href={`https://www.youtube.com/channel/${log.channel.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="me-3"
                  >
                    {log.channel.title}
                  </a>
                  <div className="d-flex gap-2">
                    {log.meetsCriteria ? (
                      <span className="badge bg-success">条件達成</span>
                    ) : (
                      <span className="badge bg-danger">条件未達</span>
                    )}
                    {log.hasMatchingTags ? (
                      <span className="badge bg-primary">タグマッチ</span>
                    ) : (
                      <span className="badge bg-secondary">タグ不一致</span>
                    )}
                  </div>
                </div>
                <small className="d-block text-muted mb-2">
                  登録者数: {parseInt(log.channel.subscriberCount).toLocaleString()} / 
                  総再生回数: {parseInt(log.channel.viewCount).toLocaleString()}
                </small>
                {log.channel.channelKeywords && log.channel.channelKeywords.length > 0 && (
                  <small className="d-block text-muted mb-1">
                    <strong>チャンネルキーワード:</strong> {log.channel.channelKeywords.slice(0, 5).join(', ')}
                    {log.channel.channelKeywords.length > 5 && '...'}
                  </small>
                )}
                {log.channel.videoTags && log.channel.videoTags.length > 0 && (
                  <small className="d-block text-muted">
                    <strong>動画タグ:</strong> {log.channel.videoTags.slice(0, 5).join(', ')}
                    {log.channel.videoTags.length > 5 && '...'}
                  </small>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

SearchLogs.displayName = 'SearchLogs';

export default SearchLogs;