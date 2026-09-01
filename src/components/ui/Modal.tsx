import type { ReactNode } from 'react';

type ModalProps = {
    open: boolean;
    children: ReactNode;
    onClose?: () => void;
    className?: string;
};

export default function Modal({ open, children, onClose, className = '' }: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className={className} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
