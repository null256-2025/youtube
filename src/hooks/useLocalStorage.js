import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, SUCCESS_MESSAGES } from '../utils/constants';

export const useLocalStorage = () => {
  const [apiKey, setApiKey] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 初期化時にローカルストレージから値を読み込み
  useEffect(() => {
    const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const isAgreed = localStorage.getItem(STORAGE_KEYS.AGREED_TO_TERMS) === 'true';
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    setAgreed(isAgreed);
  }, []);

  // APIキーを保存
  const saveApiKey = useCallback((key) => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    setApiKey(key);
    return SUCCESS_MESSAGES.API_KEY_SAVED;
  }, []);

  // 利用規約への同意を保存
  const saveAgreement = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.AGREED_TO_TERMS, 'true');
    setAgreed(true);
  }, []);

  // すべてのデータを削除
  const clearAllData = useCallback(() => {
    // LocalStorage削除
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.AGREED_TO_TERMS);
    
    // IndexedDBの削除（キャッシュデータ）
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('youtube_cache');
    }
    
    // 状態リセット
    setApiKey('');
    setAgreed(false);
    
    return SUCCESS_MESSAGES.DATA_CLEARED;
  }, []);

  return {
    apiKey,
    agreed,
    setApiKey,
    saveApiKey,
    saveAgreement,
    clearAllData
  };
};