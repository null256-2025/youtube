import React from 'react';

const ChannelCard = React.memo(({ channel }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100">
        <img src={channel.thumbnail} className="card-img-top" alt={channel.title} />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{channel.title}</h5>
          <p className="card-text">
            <strong>登録者数:</strong> {parseInt(channel.subscriberCount).toLocaleString()}人<br />
            <strong>総再生回数:</strong> {parseInt(channel.viewCount).toLocaleString()}回<br />
            <strong>動画数:</strong> {parseInt(channel.videoCount).toLocaleString()}本<br />
            <strong>開設日:</strong> {new Date(channel.publishedAt).toLocaleDateString()}
          </p>
          
          {channel.channelKeywords && channel.channelKeywords.length > 0 && (
            <div className="mb-2">
              <small className="text-muted">
                <strong>チャンネルキーワード:</strong><br />
                <span className="badge bg-light text-dark me-1 mb-1">
                  {channel.channelKeywords.slice(0, 3).join(', ')}
                  {channel.channelKeywords.length > 3 && '...'}
                </span>
              </small>
            </div>
          )}
          
          {channel.videoTags && channel.videoTags.length > 0 && (
            <div className="mb-2">
              <small className="text-muted">
                <strong>動画タグ:</strong><br />
                {channel.videoTags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="badge bg-secondary me-1 mb-1">{tag}</span>
                ))}
                {channel.videoTags.length > 3 && <span className="badge bg-secondary">+{channel.videoTags.length - 3}</span>}
              </small>
            </div>
          )}
          
          <a href={`https://www.youtube.com/channel/${channel.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mt-auto">
            YouTubeで見る
          </a>
        </div>
      </div>
    </div>
  );
});

ChannelCard.displayName = 'ChannelCard';

export default ChannelCard;