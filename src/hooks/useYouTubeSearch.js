import { useState, useCallback } from 'react';
import {
  searchVideosForChannels,
  fetchBasicChannelsInfo,
  filterChannelsByCriteria,
  selectTopChannels,
  fetchDetailedChannelInfo,
  parseApiError,
  getQuotaUsage,
  resetQuotaUsage
} from '../utils/youtubeApi';
import { DEFAULT_VALUES, ERROR_MESSAGES } from '../utils/constants';
import { getCacheStats, clearOldCache } from '../utils/cache';

export const useYouTubeSearch = () => {
  const [channels, setChannels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 });
  const [quotaInfo, setQuotaInfo] = useState({ usage: 0, cacheHits: 0, cacheMisses: 0 });
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [pendingChannels, setPendingChannels] = useState([]);

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
    setMessage('検索中... (最適化されたアルゴリズムで高速処理)');
    setChannels([]);
    setLogs([]);
    
    // クォータ使用量をリセット
    resetQuotaUsage();
    
    // 古いキャッシュをクリーンアップ
    clearOldCache();

    try {
      // 段階1: 動画を検索してチャンネルIDを収集（最適化済み）
      setMessage('チャンネルを検索中...');
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

      // 段階2: 基本チャンネル情報のみを取得
      setMessage(`${uniqueChannelIds.length}件のチャンネルの基本情報を取得中...`);
      const allChannels = await fetchBasicChannelsInfo(uniqueChannelIds, apiKey);

      // 段階3: 条件に基づいてフィルタリング
      setMessage('条件に基づいてフィルタリング中...');
      const filteredChannels = filterChannelsByCriteria(
        allChannels,
        minSubscriberCount,
        minViewCount,
        channelAgeMonths
      );

      if (filteredChannels.length === 0) {
        setMessage(ERROR_MESSAGES.NO_CHANNELS_FOUND);
        setIsSearching(false);
        return;
      }

      // 段階4: プログレッシブ検索のための分割
      const initialBatchSize = Math.min(DEFAULT_VALUES.MAX_DETAILED_ANALYSIS, 10);
      const initialChannels = selectTopChannels(filteredChannels, initialBatchSize);
      const remainingChannels = filteredChannels.slice(initialBatchSize);
      
      // 残りのチャンネルを保存
      setPendingChannels(remainingChannels);
      setHasMoreResults(remainingChannels.length > 0);
      
      // 段階5: 初期バッチのみ詳細分析（並列処理）
      setMessage(`上位${initialChannels.length}件のチャンネルを詳細分析中...`);
      setSearchProgress({ current: 0, total: initialChannels.length });

      const detailedChannels = await fetchDetailedChannelInfo(
        initialChannels,
        apiKey,
        activeSearchTerms,
        (current, total) => {
          setSearchProgress({ current, total });
          setMessage(`詳細分析中... (${current}/${total})`);
        }
      );

      // 結果を処理
      const matchingChannels = [];

      for (const channelData of detailedChannels) {
        // ログに追加
        setLogs(prevLogs => [...prevLogs, {
          channel: channelData,
          meetsCriteria: true, // 既にフィルタリング済み
          hasMatchingTags: channelData.hasMatchingTags
        }]);

        // マッチするチャンネルを結果に追加
        if (channelData.hasMatchingTags) {
          matchingChannels.push(channelData);
          setChannels(prevChannels => {
            const newChannels = [...prevChannels, channelData];
            // 再生回数順でソート
            return newChannels.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
          });
        }
      }

      // 最終メッセージとクォータ情報を設定
      const finalQuotaUsage = getQuotaUsage();
      const cacheStats = getCacheStats();
      
      setTimeout(() => {
        if (matchingChannels.length === 0) {
          setMessage(ERROR_MESSAGES.NO_MATCHING_TAGS);
        } else {
          const quotaEfficiency = finalQuotaUsage.cacheHits > 0
            ? Math.round((finalQuotaUsage.cacheHits / (finalQuotaUsage.cacheHits + finalQuotaUsage.cacheMisses)) * 100)
            : 0;
          const moreResultsText = hasMoreResults ? `\n${remainingChannels.length}件の追加候補があります。` : '';
          setMessage(
            `分析完了！${matchingChannels.length}件のマッチするチャンネルが見つかりました。` +
            `\nクォータ使用量: ${finalQuotaUsage.total}/10,000 (${quotaEfficiency}% キャッシュ効率)` +
            moreResultsText
          );
        }
        
        setQuotaInfo({
          usage: finalQuotaUsage.total,
          cacheHits: finalQuotaUsage.cacheHits,
          cacheMisses: finalQuotaUsage.cacheMisses
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

  const loadMoreResults = useCallback(async (apiKey, searchTerms) => {
    if (!hasMoreResults || pendingChannels.length === 0 || isSearching) {
      return;
    }

    setIsSearching(true);
    const batchSize = 10;
    const nextBatch = pendingChannels.slice(0, batchSize);
    const remainingAfterBatch = pendingChannels.slice(batchSize);

    try {
      setMessage(`追加の${nextBatch.length}件のチャンネルを分析中...`);
      setSearchProgress({ current: 0, total: nextBatch.length });

      const detailedChannels = await fetchDetailedChannelInfo(
        nextBatch,
        apiKey,
        searchTerms,
        (current, total) => {
          setSearchProgress({ current, total });
          setMessage(`追加分析中... (${current}/${total})`);
        }
      );

      let newMatchingCount = 0;

      for (const channelData of detailedChannels) {
        // ログに追加
        setLogs(prevLogs => [...prevLogs, {
          channel: channelData,
          meetsCriteria: true,
          hasMatchingTags: channelData.hasMatchingTags
        }]);

        // マッチするチャンネルを結果に追加
        if (channelData.hasMatchingTags) {
          newMatchingCount++;
          setChannels(prevChannels => {
            const newChannels = [...prevChannels, channelData];
            return newChannels.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
          });
        }
      }

      // 状態を更新
      setPendingChannels(remainingAfterBatch);
      setHasMoreResults(remainingAfterBatch.length > 0);

      const finalQuotaUsage = getQuotaUsage();
      const moreResultsText = remainingAfterBatch.length > 0
        ? `\n${remainingAfterBatch.length}件の追加候補があります。`
        : '';
      
      setMessage(
        `${newMatchingCount}件の追加マッチが見つかりました。` +
        `\nクォータ使用量: ${finalQuotaUsage.total}/10,000` +
        moreResultsText
      );

      setQuotaInfo({
        usage: finalQuotaUsage.total,
        cacheHits: finalQuotaUsage.cacheHits,
        cacheMisses: finalQuotaUsage.cacheMisses
      });

    } catch (error) {
      console.error('Error loading more results:', error);
      setMessage(parseApiError(error));
    } finally {
      setIsSearching(false);
      setSearchProgress({ current: 0, total: 0 });
    }
  }, [hasMoreResults, pendingChannels, isSearching]);

  const clearResults = useCallback(() => {
    setChannels([]);
    setLogs([]);
    setMessage('');
    setSearchProgress({ current: 0, total: 0 });
    setQuotaInfo({ usage: 0, cacheHits: 0, cacheMisses: 0 });
    setHasMoreResults(false);
    setPendingChannels([]);
    resetQuotaUsage();
  }, []);

  return {
    channels,
    logs,
    message,
    isSearching,
    searchProgress,
    quotaInfo,
    hasMoreResults,
    searchChannels,
    loadMoreResults,
    clearResults,
    setMessage
  };
};