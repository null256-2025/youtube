import axios from 'axios';
import { API_ENDPOINTS, DEFAULT_VALUES, ERROR_MESSAGES } from './constants';

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
 * チャンネルのキーワードを取得する
 */
export const getChannelKeywords = async (channelId, apiKey) => {
  try {
    const response = await axios.get(API_ENDPOINTS.YOUTUBE_CHANNELS, {
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
    return [];
  }
};

/**
 * チャンネルの動画のタグを取得する
 */
export const getChannelVideoTags = async (channelId, apiKey) => {
  try {
    // チャンネルの最新動画を取得
    const searchResponse = await axios.get(API_ENDPOINTS.YOUTUBE_SEARCH, {
      params: {
        key: apiKey,
        channelId: channelId,
        type: 'video',
        part: 'id',
        maxResults: DEFAULT_VALUES.VIDEO_SAMPLE_SIZE,
        order: 'date',
      },
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return [];
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

    const allTags = [];
    videosResponse.data.items.forEach(video => {
      if (video.snippet.tags) {
        allTags.push(...video.snippet.tags.map(tag => tag.toLowerCase()));
      }
    });

    return [...new Set(allTags)]; // 重複を除去
  } catch (error) {
    console.error('Error fetching video tags:', error);
    return [];
  }
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
 * 動画を検索してチャンネルIDを収集する
 */
export const searchVideosForChannels = async (searchTerms, apiKey, maxPagesPerTerm) => {
  const allChannelIds = new Set();

  for (const term of searchTerms) {
    let nextPageToken = null;
    for (let page = 0; page < maxPagesPerTerm; page++) {
      const searchResponse = await axios.get(API_ENDPOINTS.YOUTUBE_SEARCH, {
        params: {
          key: apiKey,
          q: term,
          type: 'video',
          part: 'snippet',
          maxResults: DEFAULT_VALUES.MAX_RESULTS,
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

  return [...allChannelIds];
};

/**
 * チャンネル情報を取得する
 */
export const fetchChannelsInfo = async (channelIds, apiKey) => {
  let fetchedChannels = [];
  const chunkSize = DEFAULT_VALUES.CHUNK_SIZE;
  
  for (let i = 0; i < channelIds.length; i += chunkSize) {
    const chunk = channelIds.slice(i, i + chunkSize);
    const channelIdsString = chunk.join(',');
    const channelsResponse = await axios.get(API_ENDPOINTS.YOUTUBE_CHANNELS, {
      params: {
        key: apiKey,
        id: channelIdsString,
        part: 'snippet,statistics',
      },
    });
    
    fetchedChannels = fetchedChannels.concat(channelsResponse.data.items);
  }

  return fetchedChannels;
};