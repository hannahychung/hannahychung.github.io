

const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const nextBtn = document.getElementById('next-img');
const prevBtn = document.getElementById('prev-img');
const overlay = document.getElementById('close-modal');

let currentImages = [];
let currentIndex = 0;

document.querySelectorAll('.image-gallery img').forEach(img => {
    img.addEventListener('click', (e) => {
        const gallery = e.target.closest('.image-gallery');
        currentImages = Array.from(gallery.querySelectorAll('img')).map(i => i.src);
        currentIndex = currentImages.indexOf(e.target.src);
        openModal();
    });
});

function openModal() {
    modal.classList.remove('hidden');
    updateModalImage();
}

function updateModalImage() {
    modalImg.src = currentImages[currentIndex];
}

function closeModal() {
    modal.classList.add('hidden');
    currentImages = [];
    currentIndex = 0;
}

nextBtn.addEventListener('click', () => {
    if (currentIndex < currentImages.length - 1) {
        currentIndex++;
        updateModalImage();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateModalImage();
    }
});

overlay.addEventListener('click', closeModal);
