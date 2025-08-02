/**
 * YouTube APIレスポンスキャッシュシステム
 * チャンネル情報、キーワード、タグ情報をローカルストレージにキャッシュ
 */

const CACHE_PREFIX = 'youtube_cache_';
const CACHE_EXPIRY_HOURS = 24; // 24時間でキャッシュ期限切れ

/**
 * キャッシュキーを生成する
 */
const generateCacheKey = (type, id) => {
  return `${CACHE_PREFIX}${type}_${id}`;
};

/**
 * キャッシュエントリが有効かチェックする
 */
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry || !cacheEntry.timestamp) {
    return false;
  }
  
  const now = Date.now();
  const expiryTime = cacheEntry.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
  return now < expiryTime;
};

/**
 * キャッシュからデータを取得する
 */
export const getCachedData = (type, id) => {
  try {
    const cacheKey = generateCacheKey(type, id);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const parsedData = JSON.parse(cachedData);
    
    if (!isCacheValid(parsedData)) {
      // 期限切れのキャッシュを削除
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return parsedData.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

/**
 * データをキャッシュに保存する
 */
export const setCachedData = (type, id, data) => {
  const cacheKey = generateCacheKey(type, id);
  const cacheEntry = {
    data,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error writing to cache:', error);
    // ローカルストレージが満杯の場合、古いキャッシュを削除
    if (error.name === 'QuotaExceededError') {
      clearOldCache();
      // 再試行
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      } catch (retryError) {
        console.error('Failed to cache data after cleanup:', retryError);
      }
    }
  }
};

/**
 * 古いキャッシュエントリを削除する
 */
export const clearOldCache = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const cachedData = JSON.parse(localStorage.getItem(key));
          if (!isCacheValid(cachedData)) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // 破損したキャッシュエントリも削除
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} old cache entries`);
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};

/**
 * 全てのキャッシュを削除する
 */
export const clearAllCache = () => {
  try {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared all ${keysToRemove.length} cache entries`);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

/**
 * キャッシュ統計を取得する
 */
export const getCacheStats = () => {
  try {
    let totalEntries = 0;
    let validEntries = 0;
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        totalEntries++;
        const value = localStorage.getItem(key);
        totalSize += value.length;
        
        try {
          const cachedData = JSON.parse(value);
          if (isCacheValid(cachedData)) {
            validEntries++;
          }
        } catch (error) {
          // 破損したエントリはカウントしない
        }
      }
    }
    
    return {
      totalEntries,
      validEntries,
      expiredEntries: totalEntries - validEntries,
      totalSizeKB: Math.round(totalSize / 1024)
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      totalSizeKB: 0
    };
  }
};

// キャッシュタイプの定数
export const CACHE_TYPES = {
  CHANNEL_BASIC: 'channel_basic',
  CHANNEL_KEYWORDS: 'channel_keywords',
  CHANNEL_VIDEO_TAGS: 'channel_video_tags',
  SEARCH_RESULTS: 'search_results'
};