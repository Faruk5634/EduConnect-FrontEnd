import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: 'primary' | 'secondary' | 'danger';
};

export default function Button({ tone = 'primary', className = '', ...props }: ButtonProps) {
    const toneClass = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger'
    }[tone];

    return <button className={`${toneClass} ${className}`} {...props} />;
}
