export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
    try {
        const containerId = 'educonnect-toast-container';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.bottom = '24px';
            container.style.right = '24px';
            container.style.zIndex = '9999';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '10px';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.innerText = message;
        toast.style.minWidth = '240px';
        toast.style.maxWidth = '420px';
        toast.style.padding = '12px 16px';
        toast.style.borderRadius = '10px';
        toast.style.boxShadow = '0 8px 30px rgba(2,6,23,0.6)';
        toast.style.color = '#0f172a';
        toast.style.fontWeight = '600';
        toast.style.fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'opacity 200ms ease, transform 200ms ease';

        if (type === 'success') {
            toast.style.background = '#dcfce7';
            toast.style.border = '1px solid #16a34a33';
        } else if (type === 'error') {
            toast.style.background = '#fee2e2';
            toast.style.border = '1px solid #ef444433';
        } else {
            toast.style.background = '#bfdbfe';
            toast.style.border = '1px solid #3b82f633';
        }

        container.appendChild(toast);

        // trigger enter animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // auto dismiss
        const timeout = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => {
                toast.remove();
                if (container && container.childElementCount === 0) container.remove();
            }, 250);
        }, duration);

        // allow manual dismiss on click
        toast.addEventListener('click', () => {
            clearTimeout(timeout);
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => {
                toast.remove();
                if (container && container.childElementCount === 0) container.remove();
            }, 200);
        });
    } catch (e) {
        // fallback to alert if something goes terribly wrong
        try { alert(message); } catch { /* noop */ }
    }
}

