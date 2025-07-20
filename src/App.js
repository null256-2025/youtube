import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [channels, setChannels] = useState([]);
  const [message, setMessage] = useState('');
  const [minSubscriberCount, setMinSubscriberCount] = useState(1000);
  const [minViewCount, setMinViewCount] = useState(10000);
  const [searchTerms, setSearchTerms] = useState(['']);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('youtube_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySave = () => {
    localStorage.setItem('youtube_api_key', apiKey);
    setMessage('APIキーを保存しました！');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSearchTermChange = (index, value) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
  };

  const addSearchTerm = () => {
    if (searchTerms.length < 5) {
      setSearchTerms([...searchTerms, '']);
    }
  };

  const removeSearchTerm = (index) => {
    if (searchTerms.length > 1) {
      const newSearchTerms = [...searchTerms];
      newSearchTerms.splice(index, 1);
      setSearchTerms(newSearchTerms);
    }
  };

  const searchChannels = async () => {
    if (!apiKey) {
      setMessage('APIキーを入力してください。');
      return;
    }

    const activeSearchTerms = searchTerms.filter(term => term.trim() !== '');
    if (activeSearchTerms.length === 0) {
        setMessage('検索キーワードを1つ以上入力してください。');
        return;
    }

    setMessage('検索中... (最大1〜2分程度かかる場合があります)');
    setChannels([]);
    setLogs([]);

    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const publishedAfter = threeMonthsAgo.toISOString();

      let allChannels = [];
      const maxPagesPerTerm = 4; // 1ページ50件 x 4 = 200件/キーワード

      for (const term of activeSearchTerms) {
        let nextPageToken = null;
        for (let page = 0; page < maxPagesPerTerm; page++) {
          const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
              key: apiKey,
              q: term,
              type: 'channel',
              part: 'snippet',
              maxResults: 50,
              publishedAfter: publishedAfter,
              pageToken: nextPageToken,
            },
          });

          if (searchResponse.data.items) {
            allChannels = allChannels.concat(searchResponse.data.items);
          }

          nextPageToken = searchResponse.data.nextPageToken;
          if (!nextPageToken) {
            break; // 次のページがなければ終了
          }
        }
      }

      const validChannelItems = allChannels.filter(item => item && item.id && item.id.channelId);
      const channelIdSet = new Set(validChannelItems.map(item => item.id.channelId));
      const uniqueChannelIds = [...channelIdSet];

      if (uniqueChannelIds.length === 0) {
        setMessage('条件に合うチャンネルが見つかりませんでした。');
        return;
      }

      let fetchedChannels = [];
      const chunkSize = 50;
      for (let i = 0; i < uniqueChannelIds.length; i += chunkSize) {
        const chunk = uniqueChannelIds.slice(i, i + chunkSize);
        const channelIdsString = chunk.join(',');
        const channelsResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            key: apiKey,
            id: channelIdsString,
            part: 'snippet,statistics',
          },
        });
        fetchedChannels = fetchedChannels.concat(channelsResponse.data.items);
      }

      const mappedChannels = fetchedChannels.map(item => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.default.url,
        subscriberCount: item.statistics.subscriberCount,
        viewCount: item.statistics.viewCount,
        videoCount: item.statistics.videoCount,
        publishedAt: item.snippet.publishedAt,
      }));

      const currentLogs = [];
      const filteredChannels = mappedChannels.filter(channel => {
        const meetsCriteria = parseInt(channel.subscriberCount) >= minSubscriberCount && parseInt(channel.viewCount) >= minViewCount;
        currentLogs.push({ channel, meetsCriteria });
        return meetsCriteria;
      });

      setLogs(currentLogs);
      filteredChannels.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));

      setChannels(filteredChannels);
      if (filteredChannels.length === 0) {
        setMessage('条件に合うチャンネルが見つかりませんでした。');
      } else {
        setMessage(`${filteredChannels.length}件のチャンネルが見つかりました。`);
      }

    } catch (error) {
      console.error('Error searching channels:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setMessage('チャンネルの検索中にエラーが発生しました。APIキーが正しいか、またはリクエスト制限に達していないか確認してください。');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">YouTube音楽チャンネル分析</h1>
      <p className="text-center text-muted">直近3ヶ月に開設され、人気急上昇中の音楽チャンネルを発見します。</p>

      <div className="card mb-4">
        <div className="card-header">
          APIキー設定
        </div>
        <div className="card-body">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="YouTube Data API v3 キーを入力"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleApiKeySave}>
              APIキーを保存
            </button>
          </div>
          {message && <div className="alert alert-info mt-2">{message}</div>}
          <p className="text-muted mt-3">
            APIクォータの残量確認は、<a href="https://console.cloud.google.com/apis/dashboard" target="_blank" rel="noopener noreferrer">Google Cloud ConsoleのAPIダッシュボード</a>で行ってください。
          </p>
        </div>
      </div>

      {apiKey && (
        <div className="card mb-4">
          <div className="card-header">
            検索条件
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">検索キーワード (最大5つ)</label>
              {searchTerms.map((term, index) => (
                <div key={index} className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control"
                    value={term}
                    onChange={(e) => handleSearchTermChange(index, e.target.value)}
                    placeholder={`キーワード ${index + 1}`}
                  />
                  {searchTerms.length > 1 && (
                    <button className="btn btn-outline-danger" type="button" onClick={() => removeSearchTerm(index)}>
                      削除
                    </button>
                  )}
                </div>
              ))}
              {searchTerms.length < 5 && (
                <button className="btn btn-outline-secondary" type="button" onClick={addSearchTerm}>
                  キーワードを追加
                </button>
              )}
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="minSubscriberCount" className="form-label">最低登録者数</label>
                <input
                  type="number"
                  className="form-control"
                  id="minSubscriberCount"
                  value={minSubscriberCount}
                  onChange={(e) => setMinSubscriberCount(Number(e.target.value))}
                  placeholder="例: 1000"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="minViewCount" className="form-label">最低総再生回数</label>
                <input
                  type="number"
                  className="form-control"
                  id="minViewCount"
                  value={minViewCount}
                  onChange={(e) => setMinViewCount(Number(e.target.value))}
                  placeholder="例: 10000"
                />
              </div>
            </div>
            <button className="btn btn-success w-100" onClick={searchChannels}>
              <i className="bi bi-search me-2"></i>直近3ヶ月で人気の音楽チャンネルを検索
            </button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-4 text-center">検索ログ</h2>
          <ul className="list-group">
            {logs.map((log, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <a href={`https://www.youtube.com/channel/${log.channel.id}`} target="_blank" rel="noopener noreferrer">
                    {log.channel.title}
                  </a>
                  <small className="d-block text-muted">
                    登録者数: {parseInt(log.channel.subscriberCount).toLocaleString()} / 総再生回数: {parseInt(log.channel.viewCount).toLocaleString()}
                  </small>
                </div>
                {log.meetsCriteria ? (
                  <i className="bi bi-check-circle-fill text-success fs-4"></i>
                ) : (
                  <i className="bi bi-x-circle-fill text-danger fs-4"></i>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {channels.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-4 text-center">検索結果</h2>
          <div className="row">
            {channels.map((channel) => (
              <div key={channel.id} className="col-md-6 col-lg-4 mb-4">
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
                    <a href={`https://www.youtube.com/channel/${channel.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mt-auto">
                      YouTubeで見る
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
