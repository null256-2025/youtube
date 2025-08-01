import React from 'react';
import { DEFAULT_VALUES } from '../utils/constants';

const SearchForm = ({
  searchTerms,
  setSearchTerms,
  minSubscriberCount,
  setMinSubscriberCount,
  minViewCount,
  setMinViewCount,
  maxPagesPerTerm,
  setMaxPagesPerTerm,
  channelAgeMonths,
  setChannelAgeMonths,
  onSearch,
  isSearching
}) => {
  const handleSearchTermChange = (index, value) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[index] = value;
    setSearchTerms(newSearchTerms);
  };

  const addSearchTerm = () => {
    if (searchTerms.length < DEFAULT_VALUES.MAX_SEARCH_TERMS) {
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

  return (
    <div className="card mb-4">
      <div className="card-header">
        検索条件
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">検索キーワード (最大{DEFAULT_VALUES.MAX_SEARCH_TERMS}つ)</label>
          {searchTerms.map((term, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={term}
                onChange={(e) => handleSearchTermChange(index, e.target.value)}
                placeholder={`キーワード ${index + 1}`}
                disabled={isSearching}
              />
              {searchTerms.length > 1 && (
                <button 
                  className="btn btn-outline-danger" 
                  type="button" 
                  onClick={() => removeSearchTerm(index)}
                  disabled={isSearching}
                >
                  削除
                </button>
              )}
            </div>
          ))}
          {searchTerms.length < DEFAULT_VALUES.MAX_SEARCH_TERMS && (
            <button 
              className="btn btn-outline-secondary" 
              type="button" 
              onClick={addSearchTerm}
              disabled={isSearching}
            >
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
              disabled={isSearching}
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
              disabled={isSearching}
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
              disabled={isSearching}
            />
          </div>
          
          <div className="col-md-3 mb-3">
            <label htmlFor="maxPagesPerTerm" className="form-label">検索ページ数 (1ページ=50件)</label>
            <select
              className="form-control"
              id="maxPagesPerTerm"
              value={maxPagesPerTerm}
              onChange={(e) => setMaxPagesPerTerm(Number(e.target.value))}
              disabled={isSearching}
            >
              <option value={1}>1ページ (50件/キーワード)</option>
              <option value={2}>2ページ (100件/キーワード)</option>
              <option value={3}>3ページ (150件/キーワード)</option>
              <option value={4}>4ページ (200件/キーワード)</option>
              <option value={5}>5ページ (250件/キーワード)</option>
            </select>
          </div>
        </div>
        
        <button 
          className="btn btn-success w-100" 
          onClick={onSearch}
          disabled={isSearching}
        >
          <i className="bi bi-search me-2"></i>
          {isSearching ? '分析中...' : 'タグベースでチャンネルを検索・分析'}
        </button>
      </div>
    </div>
  );
};

export default SearchForm;