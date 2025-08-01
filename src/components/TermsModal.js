import React from 'react';

const TermsModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">利用規約</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-4">最終更新日: 2025年1月30日</p>
            
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">1. サービス概要</h2>
                <p>本サービス「YouTubeチャンネル分析ツール」は、YouTube Data API v3を利用してYouTubeチャンネルの分析を行うWebアプリケーションです。ユーザーが提供するAPIキーを使用して、指定されたキーワードに関連するチャンネル情報を検索・分析します。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">2. YouTube利用規約への同意</h2>
                <div className="alert alert-info">
                  <p className="mb-2"><strong>重要：</strong>本サービスを利用することで、以下に同意したものとみなされます：</p>
                  <ul className="mb-0">
                    <li><a href="https://www.youtube.com/t/terms">YouTube利用規約（YouTube Terms of Service）</a></li>
                    <li><a href="https://policies.google.com/privacy">Googleプライバシーポリシー</a></li>
                    <li><a href="https://developers.google.com/youtube/terms/api-services-terms-of-service">YouTube API利用規約</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">3. APIキーの利用について</h2>
                <h3 className="h5 mb-2">3.1 料金責任</h3>
                <p>YouTube Data API v3の利用に伴う料金は、ユーザーのGoogle Cloudアカウントに直接課金されます。当サービスは料金の支払いに関して一切の責任を負いません。</p>
                
                <h3 className="h5 mb-2">3.2 無料枠について</h3>
                <p>Google Cloudでは1日あたり10,000ユニットまでの無料枠が提供されていますが、この制限を超えた場合の料金はユーザーの負担となります。</p>
                
                <h3 className="h5 mb-2">3.3 APIキーの管理責任</h3>
                <p>ユーザーは自身のAPIキーを適切に管理し、第三者との共有や不正使用を防ぐ責任があります。APIキーの漏洩による損害について、当サービスは責任を負いません。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">4. 免責事項</h2>
                <h3 className="h5 mb-2">4.1 情報の正確性</h3>
                <p>本ツールが提供する分析結果、チャンネル情報、統計データ等の正確性について、当サービスは保証いたしません。</p>
                
                <h3 className="h5 mb-2">4.2 利用結果への責任</h3>
                <p>本サービスの利用により生じた直接的・間接的な損害、損失、機会損失等について、当サービスは一切の責任を負いません。</p>
                
                <h3 className="h5 mb-2">4.3 サービスの可用性</h3>
                <p>システムメンテナンス、障害、その他の理由によりサービスが利用できない場合があります。これらによる損害について責任を負いません。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">5. 禁止事項</h2>
                <p>以下の行為を禁止します：</p>
                <ul>
                  <li>APIキーの第三者との共有または譲渡</li>
                  <li>本ツールのリバースエンジニアリング、逆コンパイル</li>
                  <li>本サービスの運営を妨害する行為</li>
                  <li>虚偽の情報を入力する行為</li>
                  <li>YouTube利用規約に違反する行為</li>
                  <li>法令に違反する行為</li>
                  <li>その他、当サービスが不適切と判断する行為</li>
                </ul>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">6. 将来の有料プランについて</h2>
                <h3 className="h5 mb-2">6.1 有料プランの導入</h3>
                <p>将来的に有料プランを導入する可能性があります。有料プランの導入時は、事前に通知いたします。</p>
                
                <h3 className="h5 mb-2">6.2 返金ポリシー</h3>
                <p>有料プラン導入後の返金については、別途定める返金ポリシーに従います。原則として、サービス利用開始後の返金は行いません。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">7. サービスの変更・終了</h2>
                <h3 className="h5 mb-2">7.1 サービス内容の変更</h3>
                <p>当サービスは、ユーザーへの事前通知なしに、サービス内容を変更または機能を追加・削除することがあります。</p>
                
                <h3 className="h5 mb-2">7.2 サービスの終了</h3>
                <p>当サービスは、30日前の事前通知により、サービスを終了することがあります。サービス終了時は、保存されたデータの削除方法をご案内します。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">8. 準拠法・管轄裁判所</h2>
                <p>本利用規約は日本法に準拠し、本サービスに関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">9. 利用規約の変更</h2>
                <p>当サービスは、必要に応じて本利用規約を変更することがあります。重要な変更については、サービス内で通知いたします。変更後の継続利用により、変更に同意したものとみなします。</p>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h2 className="h4 mb-3">10. お問い合わせ</h2>
                <p>本利用規約に関するお問い合わせは、以下までご連絡ください：</p>
                <p><strong>連絡先：</strong> <a href="mailto:example@domain.com">example@domain.com</a></p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;