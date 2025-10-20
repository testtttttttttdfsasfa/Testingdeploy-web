export class Modal {
    constructor(title, content) {
        this.title = title;
        this.content = content;
        this.onClose = null;
    }

    show() {
        const container = document.getElementById('modal-container');
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.addEventListener('click', () => this.close());
        
        const modal = document.createElement('div');
        modal.className = 'modal-content';
        modal.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold">${this.title}</h2>
                <button onclick="window.currentModal.close()" class="text-gray-400 hover:text-gray-600">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <div class="modal-body">
                ${this.content}
            </div>
        `;
        
        modal.addEventListener('click', (e) => e.stopPropagation());
        
        container.innerHTML = '';
        container.appendChild(overlay);
        container.appendChild(modal);
        
        // Initialize icons
        lucide.createIcons();
        
        // Store reference
        window.currentModal = this;
    }

    close() {
        const container = document.getElementById('modal-container');
        container.innerHTML = '';
        
        if (this.onClose) {
            this.onClose();
        }
        
        window.currentModal = null;
    }
}

export function showConfirm(message, onConfirm) {
    const content = `
        <p class="text-gray-600 mb-6">${message}</p>
        <div class="flex justify-end gap-2">
            <button onclick="window.currentModal.close()" class="btn btn-outline">
                Batal
            </button>
            <button onclick="window.confirmAction()" class="btn btn-primary">
                Ya, Hapus
            </button>
        </div>
    `;
    
    const modal = new Modal('Konfirmasi', content);
    
    window.confirmAction = () => {
        onConfirm();
        modal.close();
    };
    
    modal.show();
}
