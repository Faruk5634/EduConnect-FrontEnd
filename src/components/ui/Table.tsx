import type { ReactNode } from 'react';

export default function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <table className={className}>{children}</table>;
}
