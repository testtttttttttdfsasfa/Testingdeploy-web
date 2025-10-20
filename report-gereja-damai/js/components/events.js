import { eventsAPI } from '../utils/api.js';
import { showToast } from '../utils/toast.js';
import { Modal, showConfirm } from '../utils/modal.js';

export class Events {
    constructor() {
        this.events = [];
        this.selectedDate = new Date();
        this.selectedKategori = 'all';
        this.categories = [
            'Misa & Liturgi',
            'Kegiatan Komunitas',
            'Doa & Devosi',
            'Pastoral & Acara Khusus'
        ];
    }

    async render(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold">Kalender Kegiatan</h1>
                        <p class="text-gray-600 mt-1">Kelola jadwal kegiatan dan acara Gereja Damai Kristus</p>
                    </div>
                    <button id="btn-add-event" class="btn btn-primary">
                        <i data-lucide="plus" class="h-4 w-4"></i>
                        Tambah Kegiatan
                    </button>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats-cards">
                    <!-- Stats will be inserted here -->
                </div>

                <!-- Calendar & Upcoming Events -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Calendar -->
                    <div class="card">
                        <h3 class="text-lg font-semibold mb-4">Kalender</h3>
                        <div id="calendar-container">
                            <!-- Calendar will be rendered here -->
                        </div>
                        <div id="selected-date-events" class="mt-4">
                            <!-- Events for selected date -->
                        </div>
                    </div>

                    <!-- Upcoming Events -->
                    <div class="card lg:col-span-2">
                        <h3 class="text-lg font-semibold mb-4">Kegiatan Mendatang</h3>
                        <p class="text-sm text-gray-600 mb-4">Jadwal kegiatan dalam 2 minggu ke depan</p>
                        <div id="upcoming-events" class="space-y-3">
                            <!-- Upcoming events will be inserted here -->
                        </div>
                    </div>
                </div>

                <!-- All Events -->
                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">Semua Kegiatan</h3>
                            <p class="text-sm text-gray-600">Daftar lengkap jadwal kegiatan gereja</p>
                        </div>
                        <select id="filter-kategori" class="input w-64">
                            <option value="all">Semua Kategori</option>
                            ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div id="all-events" class="space-y-3">
                        <!-- All events will be inserted here -->
                    </div>
                </div>
            </div>
        `;

        await this.loadEvents();
        this.attachEventListeners();
        lucide.createIcons();
    }

    async loadEvents() {
        try {
            const result = await eventsAPI.getEvents();
            
            if (result.success) {
                this.events = result.data;
                this.renderStats();
                this.renderCalendar();
                this.renderUpcomingEvents();
                this.renderAllEvents();
            } else {
                throw new Error(result.error || 'Failed to fetch events');
            }
        } catch (error) {
            console.error('Error loading events:', error);
            showToast('Gagal memuat data kegiatan', 'error');
        }
    }

    renderStats() {
        const currentDate = new Date();
        
        // This week
        const weekFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thisWeekEvents = this.events.filter(event => {
            const eventDate = new Date(event.waktu_mulai);
            return eventDate >= currentDate && eventDate <= weekFromNow;
        }).length;

        // This month
        const thisMonthEvents = this.events.filter(event => {
            const eventDate = new Date(event.waktu_mulai);
            return eventDate.getMonth() === currentDate.getMonth() &&
                   eventDate.getFullYear() === currentDate.getFullYear();
        }).length;

        // Next 2 weeks
        const twoWeeksFromNow = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        const upcomingCount = this.events.filter(event => {
            const eventDate = new Date(event.waktu_mulai);
            return eventDate >= currentDate && eventDate <= twoWeeksFromNow;
        }).length;

        const stats = [
            { label: 'Minggu Ini', value: thisWeekEvents, subtitle: 'kegiatan terjadwal' },
            { label: 'Bulan Ini', value: thisMonthEvents, subtitle: 'total kegiatan' },
            { label: 'Total Kegiatan', value: this.events.length, subtitle: 'dalam database' },
            { label: '2 Minggu Ke Depan', value: upcomingCount, subtitle: 'kegiatan mendatang' }
        ];

        const container = document.getElementById('stats-cards');
        container.innerHTML = stats.map(stat => `
            <div class="card">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-sm font-medium text-gray-600">${stat.label}</p>
                    <i data-lucide="calendar" class="h-4 w-4 text-gray-600"></i>
                </div>
                <p class="text-2xl font-bold">${stat.value}</p>
                <p class="text-xs text-gray-500">${stat.subtitle}</p>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderCalendar() {
        const container = document.getElementById('calendar-container');
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        let html = `
            <div class="mb-3">
                <div class="flex items-center justify-between">
                    <button id="prev-month" class="p-1 hover:bg-gray-100 rounded">
                        <i data-lucide="chevron-left" class="h-4 w-4"></i>
                    </button>
                    <span class="font-medium">${monthNames[month]} ${year}</span>
                    <button id="next-month" class="p-1 hover:bg-gray-100 rounded">
                        <i data-lucide="chevron-right" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                <div class="font-medium text-gray-600">Min</div>
                <div class="font-medium text-gray-600">Sen</div>
                <div class="font-medium text-gray-600">Sel</div>
                <div class="font-medium text-gray-600">Rab</div>
                <div class="font-medium text-gray-600">Kam</div>
                <div class="font-medium text-gray-600">Jum</div>
                <div class="font-medium text-gray-600">Sab</div>
            </div>
            <div class="grid grid-cols-7 gap-1">
        `;
        
        // Empty slots before first day
        for (let i = 0; i < startDay; i++) {
            html += '<div class="aspect-square"></div>';
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const hasEvents = this.events.some(event => {
                const eventDate = new Date(event.waktu_mulai);
                return eventDate.getDate() === day &&
                       eventDate.getMonth() === month &&
                       eventDate.getFullYear() === year;
            });

            const isSelected = this.selectedDate.getDate() === day &&
                             this.selectedDate.getMonth() === month &&
                             this.selectedDate.getFullYear() === year;

            const isToday = new Date().getDate() === day &&
                          new Date().getMonth() === month &&
                          new Date().getFullYear() === year;

            html += `
                <button 
                    class="aspect-square p-1 text-sm rounded hover:bg-gray-100 relative
                           ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                           ${isToday && !isSelected ? 'bg-blue-50' : ''}"
                    data-date="${year}-${month}-${day}"
                >
                    ${day}
                    ${hasEvents ? '<span class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>' : ''}
                </button>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // Attach calendar event listeners
        document.getElementById('prev-month').addEventListener('click', () => {
            this.selectedDate = new Date(year, month - 1, 1);
            this.renderCalendar();
            this.renderSelectedDateEvents();
            lucide.createIcons();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.selectedDate = new Date(year, month + 1, 1);
            this.renderCalendar();
            this.renderSelectedDateEvents();
            lucide.createIcons();
        });

        // Day click handlers
        container.querySelectorAll('[data-date]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const [y, m, d] = e.target.dataset.date.split('-').map(Number);
                this.selectedDate = new Date(y, m, d);
                this.renderCalendar();
                this.renderSelectedDateEvents();
                lucide.createIcons();
            });
        });

        lucide.createIcons();
        this.renderSelectedDateEvents();
    }

    renderSelectedDateEvents() {
        const eventsOnDate = this.events.filter(event => {
            const eventDate = new Date(event.waktu_mulai);
            return eventDate.getDate() === this.selectedDate.getDate() &&
                   eventDate.getMonth() === this.selectedDate.getMonth() &&
                   eventDate.getFullYear() === this.selectedDate.getFullYear();
        });

        const container = document.getElementById('selected-date-events');
        
        if (eventsOnDate.length > 0) {
            container.innerHTML = `
                <h4 class="font-medium text-sm mb-2">
                    Kegiatan pada ${this.formatDateShort(this.selectedDate.toISOString())}:
                </h4>
                ${eventsOnDate.map(event => `
                    <div class="text-sm p-2 bg-gray-50 rounded mb-2">
                        <div class="flex items-center gap-2 mb-1">
                            <i data-lucide="clock" class="h-3 w-3"></i>
                            <span>${this.formatTime(event.waktu_mulai)}</span>
                        </div>
                        <div class="font-medium">${event.nama_kegiatan}</div>
                        <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded ${this.getKategoriColor(event.kategori)}">
                            ${event.kategori}
                        </span>
                    </div>
                `).join('')}
            `;
        } else {
            container.innerHTML = `
                <div class="text-sm text-gray-500 text-center py-4">
                    Tidak ada kegiatan pada tanggal ini
                </div>
            `;
        }

        lucide.createIcons();
    }

    renderUpcomingEvents() {
        const currentDate = new Date();
        const twoWeeksFromNow = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000);

        const upcoming = this.events
            .filter(event => {
                const eventDate = new Date(event.waktu_mulai);
                return eventDate >= currentDate && eventDate <= twoWeeksFromNow;
            })
            .sort((a, b) => new Date(a.waktu_mulai) - new Date(b.waktu_mulai));

        const container = document.getElementById('upcoming-events');
        
        if (upcoming.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    Tidak ada kegiatan dalam 2 minggu ke depan
                </div>
            `;
            return;
        }

        container.innerHTML = upcoming.map(event => `
            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0 text-center">
                    <div class="text-lg font-semibold">
                        ${new Date(event.waktu_mulai).getDate()}
                    </div>
                    <div class="text-xs text-gray-600">
                        ${new Date(event.waktu_mulai).toLocaleDateString('id-ID', { month: 'short' })}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 class="font-medium">${event.nama_kegiatan}</h4>
                        <span class="px-2 py-0.5 text-xs rounded ${this.getKategoriColor(event.kategori)}">
                            ${event.kategori}
                        </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div class="flex items-center gap-1">
                            <i data-lucide="clock" class="h-3 w-3"></i>
                            ${this.formatTime(event.waktu_mulai)}
                            ${event.waktu_selesai ? ` - ${this.formatTime(event.waktu_selesai)}` : ''}
                        </div>
                        <div class="flex items-center gap-1">
                            <i data-lucide="map-pin" class="h-3 w-3"></i>
                            ${event.lokasi}
                        </div>
                        ${event.penanggung_jawab ? `
                            <div class="flex items-center gap-1">
                                <i data-lucide="user" class="h-3 w-3"></i>
                                ${event.penanggung_jawab}
                            </div>
                        ` : ''}
                    </div>
                    ${event.deskripsi ? `
                        <p class="text-sm text-gray-600 mt-2 line-clamp-2">${event.deskripsi}</p>
                    ` : ''}
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }

    renderAllEvents() {
        const filtered = this.selectedKategori === 'all'
            ? this.events
            : this.events.filter(e => e.kategori === this.selectedKategori);

        const container = document.getElementById('all-events');
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    Tidak ada kegiatan ditemukan
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(event => `
            <div class="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 class="font-medium">${event.nama_kegiatan}</h4>
                        <span class="px-2 py-0.5 text-xs rounded ${this.getKategoriColor(event.kategori)}">
                            ${event.kategori}
                        </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <div class="flex items-center gap-1">
                            <i data-lucide="calendar" class="h-3 w-3"></i>
                            ${this.formatDate(event.waktu_mulai)}
                        </div>
                        <div class="flex items-center gap-1">
                            <i data-lucide="clock" class="h-3 w-3"></i>
                            ${this.formatTime(event.waktu_mulai)}
                            ${event.waktu_selesai ? ` - ${this.formatTime(event.waktu_selesai)}` : ''}
                        </div>
                        <div class="flex items-center gap-1">
                            <i data-lucide="map-pin" class="h-3 w-3"></i>
                            ${event.lokasi}
                        </div>
                        ${event.penanggung_jawab ? `
                            <div class="flex items-center gap-1">
                                <i data-lucide="user" class="h-3 w-3"></i>
                                ${event.penanggung_jawab}
                            </div>
                        ` : ''}
                    </div>
                    ${event.deskripsi ? `
                        <p class="text-sm text-gray-600">${event.deskripsi}</p>
                    ` : ''}
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <button data-delete-id="${event.id}" class="p-2 text-red-600 hover:bg-red-50 rounded">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Attach delete handlers
        container.querySelectorAll('[data-delete-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.deleteId);
                this.handleDeleteEvent(id);
            });
        });

        lucide.createIcons();
    }

    attachEventListeners() {
        // Filter kategori
        document.getElementById('filter-kategori').addEventListener('change', (e) => {
            this.selectedKategori = e.target.value;
            this.renderAllEvents();
        });

        // Add event button
        document.getElementById('btn-add-event').addEventListener('click', () => {
            this.showAddEventModal();
        });
    }

    showAddEventModal() {
        const content = `
            <form id="form-event" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Nama Kegiatan *</label>
                    <input type="text" id="input-nama" class="input" placeholder="Contoh: Misa Minggu Pagi" required>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Kategori *</label>
                    <select id="input-kategori" class="input" required>
                        ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Waktu Mulai *</label>
                        <input type="datetime-local" id="input-mulai" class="input" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Waktu Selesai</label>
                        <input type="datetime-local" id="input-selesai" class="input">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Lokasi</label>
                    <input type="text" id="input-lokasi" class="input" value="Gereja Utama">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Penanggung Jawab</label>
                    <input type="text" id="input-pj" class="input" placeholder="Nama penanggung jawab">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Kontak</label>
                    <input type="text" id="input-kontak" class="input" placeholder="Nomor telepon / email">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Deskripsi</label>
                    <textarea id="input-deskripsi" class="input" rows="3" placeholder="Deskripsi kegiatan..."></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" onclick="window.currentModal.close()" class="btn btn-outline">
                        Batal
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Simpan
                    </button>
                </div>
            </form>
        `;

        const modal = new Modal('Tambah Kegiatan Baru', content);
        modal.show();

        document.getElementById('form-event').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddEvent();
        });
    }

    async handleAddEvent() {
        const formData = {
            nama_kegiatan: document.getElementById('input-nama').value,
            kategori: document.getElementById('input-kategori').value,
            waktu_mulai: document.getElementById('input-mulai').value,
            waktu_selesai: document.getElementById('input-selesai').value,
            lokasi: document.getElementById('input-lokasi').value,
            penanggung_jawab: document.getElementById('input-pj').value,
            kontak: document.getElementById('input-kontak').value,
            deskripsi: document.getElementById('input-deskripsi').value,
        };

        try {
            const result = await eventsAPI.createEvent(formData);
            
            if (result.success) {
                showToast('Kegiatan berhasil ditambahkan!', 'success');
                window.currentModal.close();
                await this.loadEvents();
            } else {
                throw new Error(result.error || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            showToast('Gagal menambahkan kegiatan', 'error');
        }
    }

    async handleDeleteEvent(id) {
        showConfirm('Apakah Anda yakin ingin menghapus kegiatan ini?', async () => {
            try {
                const result = await eventsAPI.deleteEvent(id);
                
                if (result.success) {
                    showToast('Kegiatan berhasil dihapus!', 'success');
                    await this.loadEvents();
                } else {
                    throw new Error(result.error || 'Failed to delete event');
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                showToast('Gagal menghapus kegiatan', 'error');
            }
        });
    }

    // Helper functions
    getKategoriColor(kategori) {
        switch (kategori) {
            case 'Misa & Liturgi': return 'bg-blue-100 text-blue-800';
            case 'Kegiatan Komunitas': return 'bg-green-100 text-green-800';
            case 'Doa & Devosi': return 'bg-purple-100 text-purple-800';
            case 'Pastoral & Acara Khusus': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateShort(dateString) {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        });
    }
}
