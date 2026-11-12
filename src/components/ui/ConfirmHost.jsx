import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useConfirmStore } from './confirm';
import Button from './Button';
import Modal from './Modal';

export default function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  if (!request) return null;

  const close = (answer) => {
    request.resolve(answer);
    useConfirmStore.setState({ request: null });
  };

  return (
    <Modal
      title={request.title || 'Confirmer'}
      size="sm"
      onClose={() => close(false)}
      footer={
        <>
          <Button variant="secondary" onClick={() => close(false)}>Annuler</Button>
          <Button variant={request.danger === false ? 'primary' : 'danger'} onClick={() => close(true)} autoFocus>
            {request.confirmLabel || 'Supprimer'}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="h-10 w-10 shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm text-dark-600 pt-2">{request.message}</p>
      </div>
    </Modal>
  );
}
