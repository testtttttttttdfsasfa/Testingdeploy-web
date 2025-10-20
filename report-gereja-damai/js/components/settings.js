import { showToast } from '../utils/toast.js';

export class Settings {
    constructor() {
        this.settings = {
            churchName: 'Gereja Damai Kristus',
            pastorName: 'Rev. Michael Johnson',
            address: '123 Main Street, Anytown, ST 12345',
            phone: '(555) 123-4567',
            email: 'info@geredamaikristus.org',
            website: 'https://geredamaikristus.org',
            adminName: 'John Administrator',
            adminEmail: 'admin@geredamaikristus.org',
            emailNotifications: true,
            memberNotifications: true,
            donationNotifications: true,
            eventNotifications: true,
            autoBackup: true,
            memberPortal: true,
        };
    }

    async render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div>
                    <h1 class="text-3xl font-bold">Settings</h1>
                    <p class="text-gray-600 mt-1">Manage church information and system preferences</p>
                </div>

                <!-- Church Information -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="church" class="h-5 w-5"></i>
                        <h3 class="text-lg font-semibold">Church Information</h3>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">Basic information about your church</p>
                    
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Church Name</label>
                                <input type="text" id="church-name" class="input" value="${this.settings.churchName}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Pastor Name</label>
                                <input type="text" id="pastor-name" class="input" value="${this.settings.pastorName}">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-1">Address</label>
                            <textarea id="address" class="input" rows="2">${this.settings.address}</textarea>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Phone Number</label>
                                <input type="text" id="phone" class="input" value="${this.settings.phone}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Email Address</label>
                                <input type="email" id="email" class="input" value="${this.settings.email}">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-1">Website</label>
                            <input type="url" id="website" class="input" value="${this.settings.website}">
                        </div>
                        
                        <button id="save-church-info" class="btn btn-primary">
                            Save Church Information
                        </button>
                    </div>
                </div>

                <!-- User Management -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="users" class="h-5 w-5"></i>
                        <h3 class="text-lg font-semibold">User Management</h3>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">Manage system users and permissions</p>
                    
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Admin Name</label>
                                <input type="text" id="admin-name" class="input" value="${this.settings.adminName}">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Admin Email</label>
                                <input type="email" id="admin-email" class="input" value="${this.settings.adminEmail}">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-1">Default User Role</label>
                            <select id="user-role" class="input">
                                <option value="admin">Administrator</option>
                                <option value="staff">Staff Member</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="member" selected>Member</option>
                            </select>
                        </div>
                        
                        <button id="save-user-settings" class="btn btn-primary">
                            Update User Settings
                        </button>
                    </div>
                </div>

                <!-- Notification Settings -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="mail" class="h-5 w-5"></i>
                        <h3 class="text-lg font-semibold">Notification Settings</h3>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">Configure email and notification preferences</p>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium text-sm">Email Notifications</p>
                                <p class="text-sm text-gray-600">Receive email notifications for system events</p>
                            </div>
                            <label class="relative inline-block w-12 h-6">
                                <input type="checkbox" id="email-notif" class="peer sr-only" ${this.settings.emailNotifications ? 'checked' : ''}>
                                <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600"></span>
                                <span class="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium text-sm">New Member Notifications</p>
                                <p class="text-sm text-gray-600">Get notified when new members join</p>
                            </div>
                            <label class="relative inline-block w-12 h-6">
                                <input type="checkbox" id="member-notif" class="peer sr-only" ${this.settings.memberNotifications ? 'checked' : ''}>
                                <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600"></span>
                                <span class="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium text-sm">Donation Notifications</p>
                                <p class="text-sm text-gray-600">Get notified about new donations</p>
                            </div>
                            <label class="relative inline-block w-12 h-6">
                                <input type="checkbox" id="donation-notif" class="peer sr-only" ${this.settings.donationNotifications ? 'checked' : ''}>
                                <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600"></span>
                                <span class="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium text-sm">Event Notifications</p>
                                <p class="text-sm text-gray-600">Get notified about upcoming events</p>
                            </div>
                            <label class="relative inline-block w-12 h-6">
                                <input type="checkbox" id="event-notif" class="peer sr-only" ${this.settings.eventNotifications ? 'checked' : ''}>
                                <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600"></span>
                                <span class="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                            </label>
                        </div>
                        
                        <button id="save-notifications" class="btn btn-primary">
                            Save Notification Settings
                        </button>
                    </div>
                </div>

                <!-- System Settings -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="settings" class="h-5 w-5"></i>
                        <h3 class="text-lg font-semibold">System Settings</h3>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">General system configuration</p>
                    
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Time Zone</label>
                                <select id="timezone" class="input">
                                    <option value="est" selected>Eastern Standard Time</option>
                                    <option value="cst">Central Standard Time</option>
                                    <option value="mst">Mountain Standard Time</option>
                                    <option value="pst">Pacific Standard Time</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Date Format</label>
                                <select id="date-format" class="input">
                                    <option value="mdy">MM/DD/YYYY</option>
                                    <option value="dmy" selected>DD/MM/YYYY</option>
                                    <option value="ymd">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium text-sm">Automatic Backup</p>
                                <p class="text-sm text-gray-600">Automatically backup data daily</p>
                            </div>
                            <label class="relative inline-block w-12 h-6">
                                <input type="checkbox" id="auto-backup" class="peer sr-only" ${this.settings.autoBackup ? 'checked' : ''}>
                                <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600"></span>
                                <span class="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium text-sm">Member Portal</p>
                                <p class="text-sm text-gray-600">Allow members to access their information online</p>
                            </div>
                            <label class="relative inline-block w-12 h-6">
                                <input type="checkbox" id="member-portal" class="peer sr-only" ${this.settings.memberPortal ? 'checked' : ''}>
                                <span class="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition peer-checked:bg-blue-600"></span>
                                <span class="absolute cursor-pointer left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                            </label>
                        </div>
                        
                        <button id="save-system-settings" class="btn btn-primary">
                            Save System Settings
                        </button>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i data-lucide="database" class="h-5 w-5"></i>
                        <h3 class="text-lg font-semibold">Data Management</h3>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">Backup and restore system data</p>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium">Database Backup</p>
                                <p class="text-sm text-gray-600">Last backup: ${new Date().toLocaleDateString('id-ID')} at 2:00 AM</p>
                            </div>
                            <button id="create-backup" class="btn btn-outline">
                                Create Backup
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between py-3 border-b">
                            <div>
                                <p class="font-medium">Data Export</p>
                                <p class="text-sm text-gray-600">Export member and donation data</p>
                            </div>
                            <button id="export-data" class="btn btn-outline">
                                Export Data
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between py-3">
                            <div>
                                <p class="font-medium">System Reset</p>
                                <p class="text-sm text-gray-600">Reset all system settings to default</p>
                            </div>
                            <button id="reset-system" class="btn bg-red-600 text-white hover:bg-red-700">
                                Reset System
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        lucide.createIcons();
    }

    attachEventListeners() {
        // Save church info
        document.getElementById('save-church-info').addEventListener('click', () => {
            showToast('Church information updated successfully!', 'success');
        });

        // Save user settings
        document.getElementById('save-user-settings').addEventListener('click', () => {
            showToast('User settings updated successfully!', 'success');
        });

        // Save notifications
        document.getElementById('save-notifications').addEventListener('click', () => {
            showToast('Notification settings saved!', 'success');
        });

        // Save system settings
        document.getElementById('save-system-settings').addEventListener('click', () => {
            showToast('System settings saved!', 'success');
        });

        // Create backup
        document.getElementById('create-backup').addEventListener('click', () => {
            showToast('Creating database backup...', 'info');
            setTimeout(() => {
                showToast('Backup created successfully!', 'success');
            }, 2000);
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            showToast('Exporting data...', 'info');
            setTimeout(() => {
                showToast('Data exported successfully!', 'success');
            }, 2000);
        });

        // Reset system
        document.getElementById('reset-system').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all system settings? This action cannot be undone.')) {
                showToast('System reset initiated...', 'warning');
                setTimeout(() => {
                    showToast('System has been reset to default settings', 'info');
                }, 2000);
            }
        });
    }
}
