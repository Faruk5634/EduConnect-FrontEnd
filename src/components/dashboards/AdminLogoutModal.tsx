import { LogOut } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

type Props = {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function AdminLogoutModal({ open, onCancel, onConfirm }: Props) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            className="glass-panel rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/40 relative animate-scale-in z-50 text-center"
        >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-3xl"><LogOut className="w-6 h-6" /></div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800 text-slate-800">Sistemden Çıkış</h3>
            <p className="text-slate-500 font-medium text-sm mt-2 mb-8">Oturumunuzu sonlandırmak istediğinize emin misiniz?</p>
            <div className="flex justify-center gap-4">
                <Button tone="secondary" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold transition-colors">İPTAL</Button>
                <Button tone="danger" onClick={onConfirm} className="flex-1 py-3 rounded-xl font-bold transition-all shadow-lg">ÇIKIŞ YAP</Button>
            </div>
        </Modal>
    );
}
