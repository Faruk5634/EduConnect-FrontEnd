import type { ReactNode } from 'react';

export default function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <span className={className}>{children}</span>;
}
