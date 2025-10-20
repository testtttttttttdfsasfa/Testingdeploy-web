export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    }[type] || 'info';
    
    const color = {
        success: 'text-green-600',
        error: 'text-red-600',
        info: 'text-blue-600',
        warning: 'text-yellow-600'
    }[type] || 'text-blue-600';
    
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <i data-lucide="${icon}" class="h-5 w-5 ${color}"></i>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
                <i data-lucide="x" class="h-4 w-4"></i>
            </button>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Initialize icons in toast
    lucide.createIcons();
    
    // Auto remove after duration
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
