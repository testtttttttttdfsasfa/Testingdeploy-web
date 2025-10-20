// Tunggu hingga seluruh konten halaman siap
document.addEventListener('DOMContentLoaded', () => {

    // Ambil semua elemen yang dibutuhkan
    const eventCards = document.querySelectorAll('.event-card');
    const modalOverlay = document.getElementById('event-modal-overlay');
    const modal = document.getElementById('event-modal');
    const closeModalBtn = document.getElementById('modal-close-btn');

    // Ambil elemen di dalam modal untuk diisi data
    const modalTitle = document.getElementById('modal-title');
    const modalTag = document.getElementById('modal-tag');
    const modalDate = document.getElementById('modal-date');
    const modalTime = document.getElementById('modal-time');
    const modalLocation = document.getElementById('modal-location');
    const modalContactPerson = document.getElementById('modal-contact-person');
    const modalContactInfo = document.getElementById('modal-contact-info');
    const modalDescription = document.getElementById('modal-description');

    // Fungsi untuk membuka modal
    const openModal = () => {
        modalOverlay.classList.add('active');
        modal.classList.add('active');
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        modal.classList.remove('active');
    };

    // Tambahkan event listener ke setiap kartu acara
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            // Ambil data dari atribut 'data-*' pada kartu yang diklik
            const data = card.dataset;

            // Isi modal dengan data dari kartu
            modalTitle.textContent = data.title;
            modalTag.textContent = data.tag;
            modalDate.textContent = data.date;
            modalTime.textContent = data.time;
            modalLocation.textContent = data.location;
            modalContactPerson.textContent = data.contactPerson;
            modalContactInfo.textContent = data.contactInfo;
            modalContactInfo.href = `tel:${data.contactInfo}`;
            modalDescription.textContent = data.description;

            // Buka modal
            openModal();
        });
    });

    // Tambahkan event listener untuk tombol close dan overlay
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        // Hanya tutup jika klik dilakukan pada overlay, bukan pada modalnya
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
});