
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../utils/constants';

function AgreementModal({ onAgree }) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);

  const canAgree = hasReadTerms && hasReadPrivacy;

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h4 className="modal-title">
              <i className="bi bi-shield-check me-2"></i>
              サービス利用開始前の重要なお知らせ
            </h4>
          </div>
          <div className="modal-body">
            <div className="alert alert-info mb-4">
              <h5><i className="bi bi-info-circle me-2"></i>ご利用前に必ずお読みください</h5>
              <p className="mb-0">本サービスは<strong>BYOK（Bring Your Own Key）</strong>形式で、ユーザー様のYouTube Data API v3キーを使用します。安全にご利用いただくため、以下の重要事項をご確認ください。</p>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0"><i className="bi bi-exclamation-triangle me-2"></i>料金について</h6>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>API利用料金は<strong>お客様のGoogle Cloudアカウント</strong>に課金されます</li>
                      <li>1日10,000ユニットまで無料</li>
                      <li>超過分は従量課金制</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0"><i className="bi bi-shield-lock me-2"></i>プライバシー保護</h6>
                  </div>
                  <div className="card-body">
                    <ul className="mb-0">
                      <li>APIキーは<strong>ブラウザ内のみ</strong>に保存</li>
                      <li>当サーバーには一切送信されません</li>
                      <li>いつでもデータ削除可能</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-secondary mb-4">
              <h6><i className="bi bi-youtube me-2"></i>YouTube利用規約への同意</h6>
              <p className="mb-0">本サービスの利用により、<a href="https://www.youtube.com/t/terms" rel="noopener noreferrer">YouTube利用規約</a>および<a href="https://policies.google.com/privacy" rel="noopener noreferrer">Googleプライバシーポリシー</a>にも同意したものとみなされます。</p>
            </div>

            <div className="border rounded p-3 mb-4">
              <h6 className="mb-3">法的文書の確認</h6>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="termsCheck"
                  checked={hasReadTerms}
                  onChange={(e) => setHasReadTerms(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="termsCheck">
                  <Link to="/terms" className="text-decoration-none">
                    <i className="bi bi-file-text me-1"></i>利用規約
                  </Link>
                  を読み、内容に同意します
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="privacyCheck"
                  checked={hasReadPrivacy}
                  onChange={(e) => setHasReadPrivacy(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="privacyCheck">
                  <Link to="/privacy" className="text-decoration-none">
                    <i className="bi bi-shield-check me-1"></i>プライバシーポリシー
                  </Link>
                  を読み、内容に同意します
                </label>
              </div>
            </div>

            {!canAgree && (
              <div className="alert alert-warning">
                <i className="bi bi-info-circle me-2"></i>
                上記の利用規約とプライバシーポリシーをお読みいただき、チェックボックスにチェックを入れてください。
              </div>
            )}
          </div>
          <div className="modal-footer">
            <div className="d-flex justify-content-between w-100">
              <small className="text-muted align-self-center">
                <i className="bi bi-calendar me-1"></i>
                最終更新: {CONTACT_INFO.LAST_UPDATED}
              </small>
              <button
                type="button"
                className={`btn ${canAgree ? 'btn-primary' : 'btn-secondary'}`}
                onClick={onAgree}
                disabled={!canAgree}
              >
                <i className="bi bi-check-circle me-2"></i>
                同意してサービスを利用開始
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgreementModal;
