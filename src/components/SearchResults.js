import React from 'react';
import ChannelCard from './ChannelCard';

const SearchResults = React.memo(({ channels }) => {
  if (channels.length === 0) return null;

  return (
    <div className="mt-5">
      <h2 className="mb-4 text-center">検索結果</h2>
      <div className="row">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
});

SearchResults.displayName = 'SearchResults';

export default SearchResults;