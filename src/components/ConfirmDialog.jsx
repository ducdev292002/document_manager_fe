import ModalPortal from './ModalPortal';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', danger = true }) => {
  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
        <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                danger ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'
              }`}
            >
              {danger ? '⚠️' : 'ℹ️'}
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-800">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{message}</p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onCancel} className="btn-secondary">
              Hủy
            </button>
            <button onClick={onConfirm} className={danger ? 'btn-danger-solid' : 'btn-primary'}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ConfirmDialog;
