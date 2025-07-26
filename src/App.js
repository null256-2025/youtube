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
  const [maxPagesPerTerm, setMaxPagesPerTerm] = useState(4); // ユーザーが選択可能な検索ページ数
  const [channelAgeMonths, setChannelAgeMonths] = useState(3); // チャンネル開設期間（月）

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
    if (searchTerms.length < 3) {
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

  // チャンネルのキーワードを取得する関数
  const getChannelKeywords = async (channelId) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          key: apiKey,
          id: channelId,
          part: 'brandingSettings',
        },
      });
      
      const keywords = response.data.items[0]?.brandingSettings?.channel?.keywords;
      return keywords ? keywords.split(',').map(k => k.trim().toLowerCase()) : [];
    } catch (error) {
      console.error('Error fetching channel keywords:', error);
      // エラーが発生した場合は空配列を返して処理を継続
      return [];
    }
  };

  // チャンネルの動画のタグを取得する関数
  const getChannelVideoTags = async (channelId) => {
    try {
      // チャンネルの最新動画を取得
      const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: apiKey,
          channelId: channelId,
          type: 'video',
          part: 'id',
          maxResults: 10, // 最新10本の動画をチェック
          order: 'date',
        },
      });

      if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
        return [];
      }

      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
      
      // 動画の詳細情報（タグ含む）を取得
      const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          key: apiKey,
          id: videoIds,
          part: 'snippet',
        },
      });

      const allTags = [];
      videosResponse.data.items.forEach(video => {
        if (video.snippet.tags) {
          allTags.push(...video.snippet.tags.map(tag => tag.toLowerCase()));
        }
      });

      return [...new Set(allTags)]; // 重複を除去
    } catch (error) {
      console.error('Error fetching video tags:', error);
      // エラーが発生した場合は空配列を返して処理を継続
      return [];
    }
  };

  // キーワードがタグに含まれているかチェックする関数
  const checkKeywordMatch = (keywords, tags, searchTerm) => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // チャンネルキーワードでのマッチ
    const keywordMatch = keywords.some(keyword =>
      keyword.includes(searchTermLower) || searchTermLower.includes(keyword)
    );
    
    // 動画タグでのマッチ
    const tagMatch = tags.some(tag =>
      tag.includes(searchTermLower) || searchTermLower.includes(tag)
    );
    
    return keywordMatch || tagMatch;
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

    setMessage('検索中... (タグ分析のため通常より時間がかかります)');
    setChannels([]);
    setLogs([]);

    try {
      const channelAgeDate = new Date();
      channelAgeDate.setMonth(channelAgeDate.getMonth() - channelAgeMonths);

      let allChannelIds = new Set();

      // 各検索キーワードで動画を検索し、チャンネルIDを収集
      for (const term of activeSearchTerms) {
        let nextPageToken = null;
        for (let page = 0; page < maxPagesPerTerm; page++) {
          const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
              key: apiKey,
              q: term,
              type: 'video',
              part: 'snippet',
              maxResults: 50,
              pageToken: nextPageToken,
            },
          });

          if (searchResponse.data.items) {
            searchResponse.data.items.forEach(item => {
              if (item.snippet.channelId) {
                allChannelIds.add(item.snippet.channelId);
              }
            });
          }

          nextPageToken = searchResponse.data.nextPageToken;
          if (!nextPageToken) {
            break;
          }
        }
      }

      const uniqueChannelIds = [...allChannelIds];

      if (uniqueChannelIds.length === 0) {
        setMessage('条件に合うチャンネルが見つかりませんでした。');
        return;
      }

      // チャンネル情報を取得
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

      // 各チャンネルのタグ情報を取得し、キーワードマッチングを行う（リアルタイム表示）
      let processedCount = 0;
      const totalChannels = fetchedChannels.length;

      for (const channel of fetchedChannels) {
        processedCount++;
        setMessage(`分析中... (${processedCount}/${totalChannels})`);

        // チャンネル開設日のチェック
        const channelPublishedDate = new Date(channel.snippet.publishedAt);
        const isChannelNewEnough = channelPublishedDate >= channelAgeDate;

        // 基本的な条件チェック（チャンネル開設日を含む）
        const meetsBasicCriteria = parseInt(channel.statistics.subscriberCount) >= minSubscriberCount &&
                                   parseInt(channel.statistics.viewCount) >= minViewCount &&
                                   isChannelNewEnough;

        if (meetsBasicCriteria) {
          // チャンネルのキーワードと動画のタグを取得
          const channelKeywords = await getChannelKeywords(channel.id);
          const videoTags = await getChannelVideoTags(channel.id);

          // 検索キーワードとのマッチングをチェック
          const hasMatchingTags = activeSearchTerms.some(term =>
            checkKeywordMatch(channelKeywords, videoTags, term)
          );

          const channelData = {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            thumbnail: channel.snippet.thumbnails.default.url,
            subscriberCount: channel.statistics.subscriberCount,
            viewCount: channel.statistics.viewCount,
            videoCount: channel.statistics.videoCount,
            publishedAt: channel.snippet.publishedAt,
            channelKeywords: channelKeywords,
            videoTags: videoTags,
            hasMatchingTags: hasMatchingTags,
          };

          // ログに即座に追加
          setLogs(prevLogs => [...prevLogs, {
            channel: channelData,
            meetsCriteria: meetsBasicCriteria,
            hasMatchingTags: hasMatchingTags
          }]);

          // マッチするチャンネルは結果に即座に追加
          if (hasMatchingTags) {
            setChannels(prevChannels => {
              const newChannels = [...prevChannels, channelData];
              // 再生回数順でソート
              return newChannels.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
            });
          }
        } else {
          const channelData = {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            thumbnail: channel.snippet.thumbnails.default.url,
            subscriberCount: channel.statistics.subscriberCount,
            viewCount: channel.statistics.viewCount,
            videoCount: channel.statistics.videoCount,
            publishedAt: channel.snippet.publishedAt,
            channelKeywords: [],
            videoTags: [],
            hasMatchingTags: false,
          };

          // ログに即座に追加
          setLogs(prevLogs => [...prevLogs, {
            channel: channelData,
            meetsCriteria: meetsBasicCriteria,
            hasMatchingTags: false
          }]);
        }
      }

      // 最終メッセージを設定
      setTimeout(() => {
        setChannels(prevChannels => {
          if (prevChannels.length === 0) {
            setMessage('指定したキーワードのタグを持つチャンネルが見つかりませんでした。');
          } else {
            setMessage(`分析完了！${prevChannels.length}件のマッチするチャンネルが見つかりました。`);
          }
          return prevChannels;
        });
      }, 100);

    } catch (error) {
      console.error('Error searching channels:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        
        if (error.response.status === 403) {
          const errorReason = error.response.data.error?.errors?.[0]?.reason;
          const errorMessage = error.response.data.error?.message || '';
          
          // メッセージ内容またはreasonでクォータ制限を判定
          const isQuotaError = errorReason === 'quotaExceeded' ||
                              errorMessage.toLowerCase().includes('quota') ||
                              errorMessage.toLowerCase().includes('exceeded');
          
          if (isQuotaError) {
            setMessage('APIクォータ制限に達しました。Google Cloud ConsoleでAPIクォータを確認してください。');
          } else if (errorReason === 'forbidden' || errorMessage.toLowerCase().includes('forbidden')) {
            setMessage('APIキーが無効です。正しいYouTube Data API v3キーを入力してください。');
          } else if (errorReason === 'accessNotConfigured' || errorMessage.toLowerCase().includes('not configured')) {
            setMessage('YouTube Data API v3が有効化されていません。Google Cloud ConsoleでAPIを有効化してください。');
          } else {
            setMessage(`APIアクセスエラーが発生しました: ${errorMessage || 'APIキーまたは権限を確認してください。'}`);
          }
        } else if (error.response.status === 400) {
          const errorMessage = error.response.data.error?.message;
          setMessage(`リクエストエラーが発生しました: ${errorMessage || '検索条件を確認してください。'}`);
        } else {
          const errorMessage = error.response.data.error?.message;
          setMessage(`エラーが発生しました (${error.response.status}): ${errorMessage || 'APIキーまたはリクエスト内容を確認してください。'}`);
        }
      } else {
        setMessage('ネットワークエラーが発生しました。インターネット接続を確認してください。');
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">YouTubeチャンネル分析</h1>
      <p className="text-center text-muted">指定したキーワードがチャンネルのタグや動画のタグに含まれるチャンネルを分析します。</p>

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
              <label className="form-label">検索キーワード (最大3つ)</label>
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
              {searchTerms.length < 3 && (
                <button className="btn btn-outline-secondary" type="button" onClick={addSearchTerm}>
                  キーワードを追加
                </button>
              )}
            </div>
            <div className="row">
              <div className="col-md-3 mb-3">
                <label htmlFor="channelAgeMonths" className="form-label">チャンネル開設期間</label>
                <select
                  className="form-control"
                  id="channelAgeMonths"
                  value={channelAgeMonths}
                  onChange={(e) => setChannelAgeMonths(Number(e.target.value))}
                >
                  <option value={1}>1ヶ月以内</option>
                  <option value={2}>2ヶ月以内</option>
                  <option value={3}>3ヶ月以内</option>
                  <option value={4}>4ヶ月以内</option>
                  <option value={5}>5ヶ月以内</option>
                  <option value={6}>6ヶ月以内</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
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
              <div className="col-md-3 mb-3">
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
              <div className="col-md-3 mb-3">
                <label htmlFor="maxPagesPerTerm" className="form-label">検索ページ数 (1ページ=50件)</label>
                <select
                  className="form-control"
                  id="maxPagesPerTerm"
                  value={maxPagesPerTerm}
                  onChange={(e) => setMaxPagesPerTerm(Number(e.target.value))}
                >
                  <option value={1}>1ページ (50件/キーワード)</option>
                  <option value={2}>2ページ (100件/キーワード)</option>
                  <option value={3}>3ページ (150件/キーワード)</option>
                  <option value={4}>4ページ (200件/キーワード)</option>
                  <option value={5}>5ページ (250件/キーワード)</option>
                </select>
              </div>
            </div>
            <button className="btn btn-success w-100" onClick={searchChannels}>
              <i className="bi bi-search me-2"></i>タグベースでチャンネルを検索・分析
            </button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-4 text-center">検索ログ</h2>
          <ul className="list-group">
            {logs.map((log, index) => (
              <li key={index} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <a href={`https://www.youtube.com/channel/${log.channel.id}`} target="_blank" rel="noopener noreferrer" className="me-3">
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
                      登録者数: {parseInt(log.channel.subscriberCount).toLocaleString()} / 総再生回数: {parseInt(log.channel.viewCount).toLocaleString()}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
