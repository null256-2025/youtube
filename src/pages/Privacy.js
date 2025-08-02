
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CONTACT_INFO } from '../utils/constants';

function Privacy() {
  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4">プライバシーポリシー</h1>
          <p className="text-muted mb-4">最終更新日: {CONTACT_INFO.LAST_UPDATED}</p>
          
          <div className="alert alert-info mb-4">
            <h5><i className="bi bi-shield-check me-2"></i>プライバシー保護への取り組み</h5>
            <p className="mb-0">本サービスは、ユーザーのプライバシーを最重要視し、個人情報の保護に努めています。本ポリシーでは、データの収集、利用、保護について詳しく説明します。</p>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">1. 収集するデータの種類</h2>
              
              <h3 className="h5 mb-2">1.1 ユーザーが直接提供するデータ</h3>
              <ul>
                <li><strong>YouTube Data API v3キー：</strong>サービス機能の提供に必要</li>
                <li><strong>検索キーワード：</strong>チャンネル分析の実行に使用</li>
                <li><strong>検索条件設定：</strong>登録者数、再生回数等の条件</li>
              </ul>
              
              <h3 className="h5 mb-2">1.2 自動的に収集されるデータ</h3>
              <ul>
                <li><strong>利用規約への同意状態：</strong>法的要件の遵守のため</li>
                <li><strong>分析結果のキャッシュ：</strong>パフォーマンス向上のため</li>
                <li><strong>アプリケーション設定：</strong>ユーザー体験の向上のため</li>
              </ul>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">2. データの利用目的</h2>
              <ul>
                <li><strong>サービス提供：</strong>YouTubeチャンネルの分析機能の提供</li>
                <li><strong>ユーザー体験の向上：</strong>設定の保存、結果のキャッシュ</li>
                <li><strong>法的要件の遵守：</strong>利用規約への同意状態の管理</li>
                <li><strong>サービス改善：</strong>匿名化された利用統計の分析</li>
              </ul>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">3. データの保存場所と期間</h2>
              
              <h3 className="h5 mb-2">3.1 保存場所</h3>
              <div className="alert alert-success">
                <p className="mb-2"><strong>重要：</strong>すべてのデータはユーザーのブラウザ内にのみ保存されます</p>
                <ul className="mb-0">
                  <li><strong>LocalStorage：</strong>APIキー、設定、同意状態</li>
                  <li><strong>IndexedDB：</strong>分析結果のキャッシュデータ</li>
                  <li><strong>当サーバー：</strong>一切のユーザーデータを保存しません</li>
                </ul>
              </div>
              
              <h3 className="h5 mb-2">3.2 保存期間</h3>
              <ul>
                <li><strong>APIキー・設定：</strong>ユーザーが削除するまで永続的に保存</li>
                <li><strong>分析結果キャッシュ：</strong>30日で自動削除</li>
                <li><strong>同意状態：</strong>ユーザーが削除するまで保存</li>
              </ul>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">4. 第三者へのデータ提供</h2>
              
              <h3 className="h5 mb-2">4.1 YouTube APIへのデータ送信</h3>
              <p>サービス機能の提供のため、以下のデータがYouTube APIに送信されます：</p>
              <ul>
                <li>ユーザーのAPIキー（認証のため）</li>
                <li>検索キーワード（検索実行のため）</li>
                <li>検索条件（結果絞り込みのため）</li>
              </ul>
              
              <h3 className="h5 mb-2">4.2 その他の第三者提供</h3>
              <p>上記以外で、ユーザーの同意なく第三者にデータを提供することはありません。</p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">5. ユーザーの権利</h2>
              
              <h3 className="h5 mb-2">5.1 データアクセス権</h3>
              <p>ユーザーは、ブラウザの開発者ツールを使用して、保存されているデータを確認できます。</p>
              
              <h3 className="h5 mb-2">5.2 データ削除権</h3>
              <div className="alert alert-warning">
                <p className="mb-2"><strong>データ削除方法：</strong></p>
                <ul className="mb-0">
                  <li><strong>完全削除：</strong>「データを消去」ボタンで全データ削除</li>
                  <li><strong>個別削除：</strong>ブラウザ設定からLocalStorage/IndexedDBを削除</li>
                  <li><strong>APIキーのみ：</strong>APIキー入力欄を空にして保存</li>
                </ul>
              </div>
              
              <h3 className="h5 mb-2">5.3 データポータビリティ権</h3>
              <p>保存されたデータは標準的なブラウザストレージに保存されており、ユーザーが自由にエクスポート可能です。</p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">6. セキュリティ対策</h2>
              
              <h3 className="h5 mb-2">6.1 データ保護措置</h3>
              <ul>
                <li><strong>HTTPS通信：</strong>すべての通信を暗号化</li>
                <li><strong>ローカル保存：</strong>サーバーにデータを送信しない設計</li>
                <li><strong>APIキー保護：</strong>ブラウザ内でのみ使用、第三者に送信しない</li>
              </ul>
              
              <h3 className="h5 mb-2">6.2 ユーザーへの推奨事項</h3>
              <ul>
                <li>APIキーを他人と共有しない</li>
                <li>公共のコンピューターでは使用後にデータを削除する</li>
                <li>定期的にAPIキーを再生成する</li>
              </ul>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">7. Cookie・LocalStorageについて</h2>
              
              <h3 className="h5 mb-2">7.1 使用する技術</h3>
              <ul>
                <li><strong>LocalStorage：</strong>設定とAPIキーの保存</li>
                <li><strong>IndexedDB：</strong>分析結果のキャッシュ</li>
                <li><strong>Cookie：</strong>現在使用していません</li>
              </ul>
              
              <h3 className="h5 mb-2">7.2 無効化方法</h3>
              <p>ブラウザ設定でLocalStorageを無効化できますが、サービスの機能が制限される場合があります。</p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">8. Google User Data Policy準拠</h2>
              <p>本サービスは、<a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google User Data Policy</a>に準拠しています：</p>
              <ul>
                <li>ユーザーデータの最小限の収集</li>
                <li>透明性のあるデータ利用</li>
                <li>ユーザーによるデータ制御の保証</li>
                <li>適切なセキュリティ対策の実装</li>
              </ul>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">9. プライバシーポリシーの変更</h2>
              <p>本ポリシーを変更する場合は、サービス内で通知いたします。重要な変更については、30日前に事前通知を行います。変更後の継続利用により、変更に同意したものとみなします。</p>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">10. お問い合わせ</h2>
              <p>プライバシーに関するご質問、データの削除依頼、その他のお問い合わせは、以下までご連絡ください：</p>
              <div className="alert alert-light">
                <p className="mb-2"><strong>連絡先情報：</strong></p>
                <ul className="mb-0">
                  <li><strong>メールアドレス：</strong> <a href={`mailto:${CONTACT_INFO.EMAIL}`}>{CONTACT_INFO.EMAIL}</a></li>
                  <li><strong>対応時間：</strong> 平日 9:00-18:00（土日祝日を除く）</li>
                  <li><strong>回答期間：</strong> 原則として7営業日以内</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <a href="/" className="btn btn-primary me-2">ホームに戻る</a>
            <button className="btn btn-outline-danger" onClick={() => {
              if (window.confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
                localStorage.clear();
                if ('indexedDB' in window) {
                  indexedDB.deleteDatabase('youtube_cache');
                }
                alert('すべてのデータを削除しました。');
                window.location.href = '/';
              }
            }}>
              <i className="bi bi-trash me-1"></i>データを消去
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
