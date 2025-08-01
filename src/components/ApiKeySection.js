import React from 'react';

const ApiKeySection = ({
  apiKey,
  setApiKey,
  onSaveApiKey,
  message,
  onShowDataClearModal,
  onShowTermsModal,
  onShowPrivacyModal
}) => {
  return (
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
          <button className="btn btn-primary" onClick={onSaveApiKey}>
            APIキーを保存
          </button>
        </div>
        {message && <div className="alert alert-info mt-2">{message}</div>}
        
        <div className="alert alert-warning mt-3">
          <h6><i className="bi bi-exclamation-triangle me-2"></i>重要な注意事項</h6>
          <ul className="mb-2">
            <li><strong>料金について：</strong>YouTube Data API v3の利用料金は、あなたのGoogle Cloudアカウントに直接課金されます</li>
            <li><strong>無料枠：</strong>1日あたり10,000ユニットまで無料でご利用いただけます</li>
            <li><strong>APIキーの管理：</strong>APIキーは他人と共有せず、適切に管理してください</li>
            <li><strong>データ保存：</strong>APIキーはあなたのブラウザにのみ保存され、当サーバーには送信されません</li>
          </ul>
          <p className="mb-0">
            APIクォータの残量確認は、
            <a 
              href="https://console.cloud.google.com/apis/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Google Cloud ConsoleのAPIダッシュボード
            </a>
            で行ってください。
          </p>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            <i className="bi bi-shield-check me-1"></i>
            データ保護について詳しくは
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-underline"
              style={{ fontSize: 'inherit', verticalAlign: 'baseline' }}
              onClick={onShowPrivacyModal}
            >
              プライバシーポリシー
            </button>
            をご確認ください
          </small>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onShowDataClearModal}
            title="保存されたすべてのデータを削除します"
          >
            <i className="bi bi-trash me-1"></i>データを消去
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySection;