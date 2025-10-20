// Main Entry point file
import { Finance } from './components/finance.js';
import { Events } from './components/events.js';
import { Settings } from './components/settings.js';
import { showToast } from './utils/toast.js';

class App {
    constructor() {
        this.currentSection = 'finance';
        this.currentComponent = null; // Track current component instance
        this.menuItems = [
            { 
                id: 'finance', 
                label: 'Finance', 
                icon: 'dollar-sign',
                component: Finance
            },
            { 
                id: 'events', 
                label: 'Events', 
                icon: 'calendar',
                component: Events
            },
            { 
                id: 'settings', 
                label: 'Settings', 
                icon: 'settings',
                component: Settings
            },
        ];
        
        this.init();
    }

    init() {
        lucide.createIcons();
        
        this.renderMenu();
        
        this.loadSection('finance');
    
        setTimeout(() => {
            showToast('Selamat datang di Report Gereja Damai!', 'info');
        }, 500);
    }

    renderMenu() {
        const menuList = document.getElementById('menu-list');
        menuList.innerHTML = '';

        this.menuItems.forEach(item => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            
            button.className = `menu-item w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                this.currentSection === item.id 
                    ? 'active' 
                    : 'text-gray-700 hover:bg-gray-100'
            }`;
            
            button.innerHTML = `
                <i data-lucide="${item.icon}" class="h-4 w-4"></i>
                <span>${item.label}</span>
            `;
            
            button.addEventListener('click', () => this.loadSection(item.id));
            
            li.appendChild(button);
            menuList.appendChild(li);
        });

        // Re-initialize Lucide icons for new elements
        lucide.createIcons();
    }

    async loadSection(sectionId) {
        // Destroy previous component if it has cleanup method
        if (this.currentComponent && typeof this.currentComponent.destroy === 'function') {
            this.currentComponent.destroy();
        }
        
        this.currentSection = sectionId;
        
        // Update menu active state
        this.renderMenu();
        
        // Show loading
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-64">
                <div class="spinner"></div>
            </div>
        `;

        // Find component
        const menuItem = this.menuItems.find(item => item.id === sectionId);
        
        if (menuItem) {
            try {
                // Load component
                const component = new menuItem.component();
                this.currentComponent = component; // Save reference
                await component.render(mainContent);
                
                // Add fade-in animation
                mainContent.querySelector('div').classList.add('fade-in');
                
                // Re-initialize Lucide icons
                lucide.createIcons();
            } catch (error) {
                console.error('Error loading section:', error);
                showToast('Gagal memuat halaman', 'error');
                mainContent.innerHTML = `
                    <div class="flex items-center justify-center h-64 text-red-600">
                        <div class="text-center">
                            <p class="text-lg font-semibold">Error</p>
                            <p class="text-sm">${error.message}</p>
                        </div>
                    </div>
                `;
            }
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

export default App;
