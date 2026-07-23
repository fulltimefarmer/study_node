'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  children: ReactNode;
  width?: string;
  loading?: boolean;
}

export default function Modal({
  open,
  title,
  onClose,
  onConfirm,
  confirmText = '确定',
  cancelText = '取消',
  children,
  width = 'w-[520px',
  loading = false,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${width}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="text-lg font-semibold text-gray-800">{title}</span>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {onConfirm && (
          <div className="modal-footer">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-blue-500 hover:text-blue-500 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? '处理中...' : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
