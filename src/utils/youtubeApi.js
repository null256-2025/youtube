import axios from 'axios';
import { API_ENDPOINTS, DEFAULT_VALUES, ERROR_MESSAGES } from './constants';
import { getCachedData, setCachedData, CACHE_TYPES } from './cache';

/**
 * APIエラーを解析してユーザーフレンドリーなメッセージを返す
 */
export const parseApiError = (error) => {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { status, data } = error.response;
  const errorReason = data.error?.errors?.[0]?.reason;
  const errorMessage = data.error?.message || '';

  if (status === 403) {
    const isQuotaError = errorReason === 'quotaExceeded' ||
                        errorMessage.toLowerCase().includes('quota') ||
                        errorMessage.toLowerCase().includes('exceeded');
    
    if (isQuotaError) {
      return ERROR_MESSAGES.QUOTA_EXCEEDED;
    } else if (errorReason === 'forbidden' || errorMessage.toLowerCase().includes('forbidden')) {
      return ERROR_MESSAGES.INVALID_API_KEY;
    } else if (errorReason === 'accessNotConfigured' || errorMessage.toLowerCase().includes('not configured')) {
      return ERROR_MESSAGES.API_NOT_CONFIGURED;
    } else {
      return `APIアクセスエラーが発生しました: ${errorMessage || 'APIキーまたは権限を確認してください。'}`;
    }
  } else if (status === 400) {
    return `リクエストエラーが発生しました: ${errorMessage || '検索条件を確認してください。'}`;
  } else {
    return `エラーが発生しました (${status}): ${errorMessage || 'APIキーまたはリクエスト内容を確認してください。'}`;
  }
};

/**
 * チャンネルのキーワードを取得する（キャッシュ対応）
 */
export const getChannelKeywords = async (channelId, apiKey) => {
  // キャッシュから取得を試行
  const cachedKeywords = getCachedData(CACHE_TYPES.CHANNEL_KEYWORDS, channelId);
  if (cachedKeywords !== null) {
    return cachedKeywords;
  }

  try {
    const response = await axios.get(API_ENDPOINTS.YOUTUBE_CHANNELS, {
      params: {
        key: apiKey,
        id: channelId,
        part: 'brandingSettings',
      },
    });

    // クォータ使用量を追跡（チャンネル情報は1ユニット）
    trackQuotaUsage('channels', 1, false);
    
    const keywords = response.data.items[0]?.brandingSettings?.channel?.keywords;
    const result = keywords ? keywords.split(',').map(k => k.trim().toLowerCase()) : [];
    
    // 結果をキャッシュに保存
    setCachedData(CACHE_TYPES.CHANNEL_KEYWORDS, channelId, result);
    
    return result;
  } catch (error) {
    console.error('Error fetching channel keywords:', error);
    // エラーの場合も空配列をキャッシュ（短時間のみ）
    setCachedData(CACHE_TYPES.CHANNEL_KEYWORDS, channelId, []);
    return [];
  }
};

/**
 * チャンネルの動画のタグを取得する（キャッシュ対応・最適化版）
 */
export const getChannelVideoTags = async (channelId, apiKey) => {
  // キャッシュから取得を試行
  const cachedTags = getCachedData(CACHE_TYPES.CHANNEL_VIDEO_TAGS, channelId);
  if (cachedTags !== null) {
    return cachedTags;
  }

  try {
    // チャンネルの最新動画を取得（サンプル数を削減）
    const searchResponse = await axios.get(API_ENDPOINTS.YOUTUBE_SEARCH, {
      params: {
        key: apiKey,
        channelId: channelId,
        type: 'video',
        part: 'id',
        maxResults: 5, // 10から5に削減
        order: 'date',
      },
    });

    // クォータ使用量を追跡（検索は100ユニット）
    trackQuotaUsage('search', 100, false);

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      const emptyResult = [];
      setCachedData(CACHE_TYPES.CHANNEL_VIDEO_TAGS, channelId, emptyResult);
      return emptyResult;
    }

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
    
    // 動画の詳細情報（タグ含む）を取得
    const videosResponse = await axios.get(API_ENDPOINTS.YOUTUBE_VIDEOS, {
      params: {
        key: apiKey,
        id: videoIds,
        part: 'snippet',
      },
    });

    // クォータ使用量を追跡（動画詳細は1ユニット）
    trackQuotaUsage('videos', 1, false);

    const allTags = [];
    videosResponse.data.items.forEach(video => {
      if (video.snippet.tags) {
        allTags.push(...video.snippet.tags.map(tag => tag.toLowerCase()));
      }
    });

    const result = [...new Set(allTags)]; // 重複を除去
    
    // 結果をキャッシュに保存
    setCachedData(CACHE_TYPES.CHANNEL_VIDEO_TAGS, channelId, result);
    
    return result;
  } catch (error) {
    console.error('Error fetching video tags:', error);
    // エラーの場合も空配列をキャッシュ
    setCachedData(CACHE_TYPES.CHANNEL_VIDEO_TAGS, channelId, []);
    return [];
  }
};

/**
 * レート制限付きの遅延関数
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 並列処理でチャンネルの詳細情報を効率的に取得する
 */
export const fetchDetailedChannelInfo = async (channels, apiKey, searchTerms, onProgress = null) => {
  const detailedChannels = [];
  const batchSize = 3; // 並列処理数を制限
  const delayBetweenBatches = 100; // バッチ間の遅延（ms）
  
  // チャンネルをバッチに分割
  for (let i = 0; i < channels.length; i += batchSize) {
    const batch = channels.slice(i, i + batchSize);
    
    // バッチ内のチャンネルを並列処理
    const batchPromises = batch.map(async (channel) => {
      try {
        // チャンネルのキーワードと動画のタグを並列取得
        const [channelKeywords, videoTags] = await Promise.all([
          getChannelKeywords(channel.id, apiKey),
          getChannelVideoTags(channel.id, apiKey)
        ]);

        // 検索キーワードとのマッチングをチェック
        const hasMatchingTags = searchTerms.some(term =>
          checkKeywordMatch(channelKeywords, videoTags, term)
        );

        return {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails.default.url,
          subscriberCount: channel.statistics.subscriberCount,
          viewCount: channel.statistics.viewCount,
          videoCount: channel.statistics.videoCount,
          publishedAt: channel.snippet.publishedAt,
          channelKeywords,
          videoTags,
          hasMatchingTags,
        };
      } catch (error) {
        console.error(`Error fetching details for channel ${channel.id}:`, error);
        // エラーが発生した場合も基本情報は保持
        return {
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
      }
    });

    // バッチの処理を待機
    const batchResults = await Promise.all(batchPromises);
    detailedChannels.push(...batchResults);

    // 進捗を報告
    if (onProgress) {
      onProgress(detailedChannels.length, channels.length);
    }

    // 次のバッチまで遅延（レート制限対策）
    if (i + batchSize < channels.length) {
      await delay(delayBetweenBatches);
    }
  }

  return detailedChannels;
};

/**
 * キーワードがタグに含まれているかチェックする
 */
export const checkKeywordMatch = (keywords, tags, searchTerm) => {
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

/**
 * 動画を検索してチャンネルIDを収集する（最適化版・クォータ追跡対応）
 */
export const searchVideosForChannels = async (searchTerms, apiKey, maxPagesPerTerm = 2) => {
  const allChannelIds = new Set();
  const maxResultsPerPage = 25; // 50から25に削減

  for (const term of searchTerms) {
    let nextPageToken = null;
    for (let page = 0; page < maxPagesPerTerm; page++) {
      try {
        const searchResponse = await axios.get(API_ENDPOINTS.YOUTUBE_SEARCH, {
          params: {
            key: apiKey,
            q: term,
            type: 'video',
            part: 'snippet',
            maxResults: maxResultsPerPage,
            pageToken: nextPageToken,
          },
        });

        // クォータ使用量を追跡（検索は100ユニット）
        trackQuotaUsage('search', 100, false);

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
      } catch (error) {
        console.error('Error in video search:', error);
        trackQuotaUsage('search', 100, false); // エラーでもクォータは消費される
        throw error;
      }
    }
  }

  return [...allChannelIds];
};

/**
 * チャンネルの基本情報のみを効率的に取得する（キャッシュ対応）
 */
export const fetchBasicChannelsInfo = async (channelIds, apiKey) => {
  let fetchedChannels = [];
  const uncachedChannelIds = [];
  
  // キャッシュから取得可能なチャンネルを確認
  for (const channelId of channelIds) {
    const cachedChannel = getCachedData(CACHE_TYPES.CHANNEL_BASIC, channelId);
    if (cachedChannel !== null) {
      fetchedChannels.push(cachedChannel);
      trackQuotaUsage('channels', 1, true); // キャッシュヒット
    } else {
      uncachedChannelIds.push(channelId);
    }
  }
  
  // キャッシュにないチャンネルのみAPIから取得
  if (uncachedChannelIds.length > 0) {
    const chunkSize = DEFAULT_VALUES.CHUNK_SIZE;
    
    for (let i = 0; i < uncachedChannelIds.length; i += chunkSize) {
      const chunk = uncachedChannelIds.slice(i, i + chunkSize);
      const channelIdsString = chunk.join(',');
      
      try {
        const channelsResponse = await axios.get(API_ENDPOINTS.YOUTUBE_CHANNELS, {
          params: {
            key: apiKey,
            id: channelIdsString,
            part: 'snippet,statistics', // 基本情報のみ
          },
        });
        
        // 取得したチャンネルをキャッシュに保存
        channelsResponse.data.items.forEach(channel => {
          setCachedData(CACHE_TYPES.CHANNEL_BASIC, channel.id, channel);
        });
        
        fetchedChannels = fetchedChannels.concat(channelsResponse.data.items);
        trackQuotaUsage('channels', chunk.length, false); // APIリクエスト
      } catch (error) {
        console.error('Error fetching basic channel info:', error);
        trackQuotaUsage('channels', chunk.length, false);
        throw error;
      }
    }
  }

  return fetchedChannels;
};

/**
 * クォータ使用量を追跡する
 */
let quotaUsage = {
  search: 0,
  channels: 0,
  videos: 0,
  total: 0,
  cacheHits: 0,
  cacheMisses: 0
};

export const trackQuotaUsage = (type, cost, fromCache = false) => {
  if (fromCache) {
    quotaUsage.cacheHits += 1;
  } else {
    quotaUsage.cacheMisses += 1;
    quotaUsage[type] += cost;
    quotaUsage.total += cost;
  }
};

export const getQuotaUsage = () => {
  return { ...quotaUsage };
};

export const resetQuotaUsage = () => {
  quotaUsage = {
    search: 0,
    channels: 0,
    videos: 0,
    total: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
};

/**
 * 条件に基づいてチャンネルをフィルタリングする
 */
export const filterChannelsByCriteria = (channels, minSubscriberCount, minViewCount, channelAgeMonths) => {
  const channelAgeDate = new Date();
  channelAgeDate.setMonth(channelAgeDate.getMonth() - channelAgeMonths);

  return channels.filter(channel => {
    const subscriberCount = parseInt(channel.statistics.subscriberCount) || 0;
    const viewCount = parseInt(channel.statistics.viewCount) || 0;
    const channelPublishedDate = new Date(channel.snippet.publishedAt);
    const isChannelNewEnough = channelPublishedDate >= channelAgeDate;

    return subscriberCount >= minSubscriberCount &&
           viewCount >= minViewCount &&
           isChannelNewEnough;
  });
};

/**
 * 上位チャンネルのみを選択する
 */
export const selectTopChannels = (channels, maxChannels = 20) => {
  return channels
    .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount))
    .slice(0, maxChannels);
};
