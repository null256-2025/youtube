// API関連の定数
export const API_ENDPOINTS = {
  YOUTUBE_SEARCH: 'https://www.googleapis.com/youtube/v3/search',
  YOUTUBE_CHANNELS: 'https://www.googleapis.com/youtube/v3/channels',
  YOUTUBE_VIDEOS: 'https://www.googleapis.com/youtube/v3/videos',
};

// デフォルト値
export const DEFAULT_VALUES = {
  MIN_SUBSCRIBER_COUNT: 1000,
  MIN_VIEW_COUNT: 10000,
  MAX_PAGES_PER_TERM: 4,
  CHANNEL_AGE_MONTHS: 3,
  MAX_SEARCH_TERMS: 3,
  CHUNK_SIZE: 50,
  MAX_RESULTS: 50,
  VIDEO_SAMPLE_SIZE: 10,
};

// ローカルストレージのキー
export const STORAGE_KEYS = {
  API_KEY: 'youtube_api_key',
  AGREED_TO_TERMS: 'agreed_to_terms',
};

// エラーメッセージ
export const ERROR_MESSAGES = {
  NO_API_KEY: 'APIキーを入力してください。',
  NO_SEARCH_TERMS: '検索キーワードを1つ以上入力してください。',
  NO_CHANNELS_FOUND: '条件に合うチャンネルが見つかりませんでした。',
  NO_MATCHING_TAGS: '指定したキーワードのタグを持つチャンネルが見つかりませんでした。',
  QUOTA_EXCEEDED: 'APIクォータ制限に達しました。Google Cloud ConsoleでAPIクォータを確認してください。',
  INVALID_API_KEY: 'APIキーが無効です。正しいYouTube Data API v3キーを入力してください。',
  API_NOT_CONFIGURED: 'YouTube Data API v3が有効化されていません。Google Cloud ConsoleでAPIを有効化してください。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
};

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  API_KEY_SAVED: 'APIキーを保存しました！',
  DATA_CLEARED: 'すべてのデータを削除しました。ページを再読み込みします。',
};