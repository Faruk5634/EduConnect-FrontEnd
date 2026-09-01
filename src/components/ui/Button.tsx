import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: 'primary' | 'secondary' | 'danger';
};

export default function Button({ tone = 'primary', className = '', ...props }: ButtonProps) {
    const toneClass = {
        primary: 'bg-blue-700 hover:bg-blue-800 text-white',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        danger: 'bg-red-600 hover:bg-red-700 text-white'
    }[tone];

    return <button className={`${toneClass} ${className}`} {...props} />;
}
