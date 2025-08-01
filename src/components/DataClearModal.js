import React from 'react';

const DataClearModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">データの完全削除</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>以下のデータがすべて削除されます：</strong></p>
            <ul>
              <li>保存されたYouTube APIキー</li>
              <li>利用規約への同意状態</li>
              <li>検索結果のキャッシュデータ</li>
              <li>すべての設定情報</li>
            </ul>
            <p className="text-danger"><strong>この操作は取り消せません。</strong></p>
            <p>削除後、ページが自動的に再読み込みされます。</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              すべてのデータを削除する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataClearModal;