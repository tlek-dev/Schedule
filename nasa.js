document.addEventListener('DOMContentLoaded', () => {
    // Initialize NASA APOD data when the tab is shown
    const nasaTab = document.querySelector('[onclick="showWidget(\'nasa\')"]');
    if (nasaTab) {
        nasaTab.addEventListener('click', () => {
            const nasaContent = document.getElementById('nasaContent');
            if (nasaContent && nasaContent.children.length <= 1) {
                fetchNasaImages();
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('nasaModal');
        if (e.target === modal) {
            closeNasaModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNasaModal();
        }
    });
});

async function fetchNasaImages() {
    const API_KEY = 'DEMO_KEY'; // Replace with your NASA API key
    const COUNT = 9; // Number of images to fetch

    try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=${COUNT}`);
        const data = await response.json();
        displayNasaImages(data);
    } catch (error) {
        console.error('Error fetching NASA APOD:', error);
        document.getElementById('nasaContent').innerHTML = `
            <div class="text-center text-red-500">
                Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.
            </div>
        `;
    }
}

function displayNasaImages(images) {
    const nasaContent = document.getElementById('nasaContent');
    if (!nasaContent) return;

    nasaContent.innerHTML = images.map(image => `
        <div class="nasa-card" onclick="showNasaDetails(${JSON.stringify(image).replace(/"/g, '&quot;')})">
            <img src="${image.url}" alt="${image.title}" class="nasa-image">
            <div class="nasa-info">
                <h3 class="nasa-title">${image.title}</h3>
                <p class="nasa-date">${formatDate(image.date)}</p>
            </div>
        </div>
    `).join('');
}

let currentImageData = null;

async function showNasaDetails(image) {
    currentImageData = image;
    const modal = document.getElementById('nasaModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalDate = document.getElementById('modalDate');
    const modalCopyright = document.getElementById('modalCopyright');

    modalTitle.textContent = image.title;
    modalImage.src = image.hdurl || image.url;
    modalImage.alt = image.title;
    modalDescription.textContent = image.explanation;
    modalDate.textContent = formatDate(image.date);
    modalCopyright.textContent = image.copyright ? `© ${image.copyright}` : '';

    // Добавляем атрибуты для отслеживания оригинального текста
    modalTitle.setAttribute('data-original', image.title);
    modalDescription.setAttribute('data-original', image.explanation);

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

async function translateContent(lang) {
    if (!currentImageData) return;

    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    try {
        // Показываем индикатор загрузки
        modalTitle.style.opacity = '0.5';
        modalDescription.style.opacity = '0.5';

        // Получаем оригинальный текст
        const originalTitle = modalTitle.getAttribute('data-original');
        const originalDescription = modalDescription.getAttribute('data-original');

        // Используем Google Translate API
        const translateText = async (text, targetLang) => {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
            const data = await response.json();
            return data[0].map(item => item[0]).join('');
        };

        // Переводим заголовок и описание
        const [translatedTitle, translatedDescription] = await Promise.all([
            translateText(originalTitle, lang),
            translateText(originalDescription, lang)
        ]);

        // Обновляем содержимое
        modalTitle.textContent = translatedTitle;
        modalDescription.textContent = translatedDescription;

        // Обновляем дату в соответствии с выбранным языком
        const modalDate = document.getElementById('modalDate');
        const date = new Date(currentImageData.date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        modalDate.textContent = date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'kk-KZ', options);

    } catch (error) {
        console.error('Ошибка перевода:', error);
        alert('Произошла ошибка при переводе. Пожалуйста, попробуйте позже.');
    } finally {
        // Убираем индикатор загрузки
        modalTitle.style.opacity = '1';
        modalDescription.style.opacity = '1';
    }
}

function closeNasaModal() {
    const modal = document.getElementById('nasaModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}
