import { useState, useCallback } from 'react';
import {
  searchVideosForChannels,
  fetchChannelsInfo,
  getChannelKeywords,
  getChannelVideoTags,
  checkKeywordMatch,
  parseApiError
} from '../utils/youtubeApi';
import { DEFAULT_VALUES, ERROR_MESSAGES } from '../utils/constants';

export const useYouTubeSearch = () => {
  const [channels, setChannels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 });

  const searchChannels = useCallback(async ({
    apiKey,
    searchTerms,
    minSubscriberCount,
    minViewCount,
    maxPagesPerTerm,
    channelAgeMonths
  }) => {
    if (!apiKey) {
      setMessage(ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    const activeSearchTerms = searchTerms.filter(term => term.trim() !== '');
    if (activeSearchTerms.length === 0) {
      setMessage(ERROR_MESSAGES.NO_SEARCH_TERMS);
      return;
    }

    setIsSearching(true);
    setMessage('検索中... (タグ分析のため通常より時間がかかります)');
    setChannels([]);
    setLogs([]);

    try {
      const channelAgeDate = new Date();
      channelAgeDate.setMonth(channelAgeDate.getMonth() - channelAgeMonths);

      // 動画を検索してチャンネルIDを収集
      const uniqueChannelIds = await searchVideosForChannels(
        activeSearchTerms,
        apiKey,
        maxPagesPerTerm
      );

      if (uniqueChannelIds.length === 0) {
        setMessage(ERROR_MESSAGES.NO_CHANNELS_FOUND);
        setIsSearching(false);
        return;
      }

      // チャンネル情報を取得
      const fetchedChannels = await fetchChannelsInfo(uniqueChannelIds, apiKey);

      // 各チャンネルのタグ情報を取得し、キーワードマッチングを行う
      let processedCount = 0;
      const totalChannels = fetchedChannels.length;

      for (const channel of fetchedChannels) {
        processedCount++;
        setSearchProgress({ current: processedCount, total: totalChannels });
        setMessage(`分析中... (${processedCount}/${totalChannels})`);

        // チャンネル開設日のチェック
        const channelPublishedDate = new Date(channel.snippet.publishedAt);
        const isChannelNewEnough = channelPublishedDate >= channelAgeDate;

        // 基本的な条件チェック
        const meetsBasicCriteria = parseInt(channel.statistics.subscriberCount) >= minSubscriberCount &&
                                  parseInt(channel.statistics.viewCount) >= minViewCount &&
                                  isChannelNewEnough;

        let channelData = {
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

        if (meetsBasicCriteria) {
          // チャンネルのキーワードと動画のタグを取得
          const channelKeywords = await getChannelKeywords(channel.id, apiKey);
          const videoTags = await getChannelVideoTags(channel.id, apiKey);

          // 検索キーワードとのマッチングをチェック
          const hasMatchingTags = activeSearchTerms.some(term =>
            checkKeywordMatch(channelKeywords, videoTags, term)
          );

          channelData = {
            ...channelData,
            channelKeywords,
            videoTags,
            hasMatchingTags,
          };

          // マッチするチャンネルは結果に即座に追加
          if (hasMatchingTags) {
            setChannels(prevChannels => {
              const newChannels = [...prevChannels, channelData];
              // 再生回数順でソート
              return newChannels.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
            });
          }
        }

        // ログに即座に追加
        setLogs(prevLogs => [...prevLogs, {
          channel: channelData,
          meetsCriteria: meetsBasicCriteria,
          hasMatchingTags: channelData.hasMatchingTags
        }]);
      }

      // 最終メッセージを設定
      setTimeout(() => {
        setChannels(prevChannels => {
          if (prevChannels.length === 0) {
            setMessage(ERROR_MESSAGES.NO_MATCHING_TAGS);
          } else {
            setMessage(`分析完了！${prevChannels.length}件のマッチするチャンネルが見つかりました。`);
          }
          return prevChannels;
        });
      }, 100);

    } catch (error) {
      console.error('Error searching channels:', error);
      setMessage(parseApiError(error));
    } finally {
      setIsSearching(false);
      setSearchProgress({ current: 0, total: 0 });
    }
  }, []);

  const clearResults = useCallback(() => {
    setChannels([]);
    setLogs([]);
    setMessage('');
    setSearchProgress({ current: 0, total: 0 });
  }, []);

  return {
    channels,
    logs,
    message,
    isSearching,
    searchProgress,
    searchChannels,
    clearResults,
    setMessage
  };
};