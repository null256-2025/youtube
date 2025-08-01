import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AgreementModal from '../components/AgreementModal';
import ApiKeySection from '../components/ApiKeySection';
import SearchForm from '../components/SearchForm';
import SearchResults from '../components/SearchResults';
import SearchLogs from '../components/SearchLogs';
import DataClearModal from '../components/DataClearModal';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';
import ProgressBar from '../components/ProgressBar';
import Footer from '../components/Footer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useYouTubeSearch } from '../hooks/useYouTubeSearch';
import { DEFAULT_VALUES } from '../utils/constants';

function Home() {
  // ローカルストレージ管理
  const { apiKey, agreed, setApiKey, saveApiKey, saveAgreement, clearAllData } = useLocalStorage();
  
  // YouTube検索機能
  const { channels, logs, message, isSearching, searchProgress, searchChannels, setMessage } = useYouTubeSearch();
  
  // 検索条件の状態管理
  const [minSubscriberCount, setMinSubscriberCount] = useState(DEFAULT_VALUES.MIN_SUBSCRIBER_COUNT);
  const [minViewCount, setMinViewCount] = useState(DEFAULT_VALUES.MIN_VIEW_COUNT);
  const [searchTerms, setSearchTerms] = useState(['']);
  const [maxPagesPerTerm, setMaxPagesPerTerm] = useState(DEFAULT_VALUES.MAX_PAGES_PER_TERM);
  const [channelAgeMonths, setChannelAgeMonths] = useState(DEFAULT_VALUES.CHANNEL_AGE_MONTHS);
  
  // モーダル表示状態
  const [showDataClearModal, setShowDataClearModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // APIキー保存ハンドラー
  const handleApiKeySave = () => {
    const successMessage = saveApiKey(apiKey);
    setMessage(successMessage);
    setTimeout(() => setMessage(''), 3000);
  };

  // 利用規約同意ハンドラー
  const handleAgree = () => {
    saveAgreement();
  };

  // データ削除ハンドラー
  const handleClearAllData = () => {
    const successMessage = clearAllData();
    
    // 検索条件もリセット
    setSearchTerms(['']);
    setMinSubscriberCount(DEFAULT_VALUES.MIN_SUBSCRIBER_COUNT);
    setMinViewCount(DEFAULT_VALUES.MIN_VIEW_COUNT);
    setMaxPagesPerTerm(DEFAULT_VALUES.MAX_PAGES_PER_TERM);
    setChannelAgeMonths(DEFAULT_VALUES.CHANNEL_AGE_MONTHS);
    
    setShowDataClearModal(false);
    setMessage(successMessage);
    
    // ページを再読み込み
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // 検索実行ハンドラー
  const handleSearch = () => {
    searchChannels({
      apiKey,
      searchTerms,
      minSubscriberCount,
      minViewCount,
      maxPagesPerTerm,
      channelAgeMonths
    });
  };

  return (
    <div className="container mt-5">
      {!agreed && <AgreementModal onAgree={handleAgree} />}
      
      <h1 className="mb-4 text-center">YouTubeチャンネル分析</h1>
      <p className="text-center text-muted">
        指定したキーワードがチャンネルのタグや動画のタグに含まれるチャンネルを分析します。
      </p>

      <ApiKeySection
        apiKey={apiKey}
        setApiKey={setApiKey}
        onSaveApiKey={handleApiKeySave}
        message={message}
        onShowDataClearModal={() => setShowDataClearModal(true)}
        onShowTermsModal={() => setShowTermsModal(true)}
        onShowPrivacyModal={() => setShowPrivacyModal(true)}
      />

      {apiKey && (
        <SearchForm
          searchTerms={searchTerms}
          setSearchTerms={setSearchTerms}
          minSubscriberCount={minSubscriberCount}
          setMinSubscriberCount={setMinSubscriberCount}
          minViewCount={minViewCount}
          setMinViewCount={setMinViewCount}
          maxPagesPerTerm={maxPagesPerTerm}
          setMaxPagesPerTerm={setMaxPagesPerTerm}
          channelAgeMonths={channelAgeMonths}
          setChannelAgeMonths={setChannelAgeMonths}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      )}

      {isSearching && searchProgress.total > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <ProgressBar
              current={searchProgress.current}
              total={searchProgress.total}
              message="チャンネル分析中..."
            />
          </div>
        </div>
      )}

      <SearchLogs logs={logs} />
      <SearchResults channels={channels} />

      <DataClearModal
        show={showDataClearModal}
        onClose={() => setShowDataClearModal(false)}
        onConfirm={handleClearAllData}
      />

      <TermsModal
        show={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <PrivacyModal
        show={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <Footer />
    </div>
  );
}

export default Home;
