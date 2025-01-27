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

    // Initialize Hammer.js for swipe gestures
    const modal = document.getElementById('nasaModal');
    const hammer = new Hammer(modal);
    
    hammer.on('swipeleft', () => {
        showNextImage();
    });
    
    hammer.on('swiperight', () => {
        showPreviousImage();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
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

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'ArrowLeft') {
                showPreviousImage();
            }
        }
    });
});

let nasaImages = [];
let currentImageIndex = 0;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 30000; // 30 секунд между запросами

async function fetchNasaImages() {
    const now = Date.now();
    const timeElapsed = now - lastFetchTime;
    
    // Проверяем кэш и время последнего запроса
    if (nasaImages.length > 0 && timeElapsed < FETCH_COOLDOWN) {
        const remainingTime = Math.ceil((FETCH_COOLDOWN - timeElapsed) / 1000);
        document.getElementById('nasaContent').innerHTML = `
            <div class="error-message">
                <i class="ri-time-line error-icon"></i>
                <p>Пожалуйста, подождите ${remainingTime} секунд перед следующим запросом</p>
                <div class="countdown">${remainingTime}</div>
            </div>
        `;
        
        // Запускаем таймер обратного отсчета
        const countdownElement = document.querySelector('.countdown');
        const countdownInterval = setInterval(() => {
            const remaining = Math.ceil((FETCH_COOLDOWN - (Date.now() - now)) / 1000);
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                fetchNasaImages();
            } else {
                countdownElement.textContent = remaining;
            }
        }, 1000);
        
        return;
    }

    const API_KEY = 'jFxeqCJRxZVCGpgZGWyHqaJ3sR9kdXbdEAWsHHEb';
    const COUNT = 3;

    try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=${COUNT}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('Expected array of images from NASA API');
        }
        
        lastFetchTime = Date.now();
        nasaImages = data;
        displayNasaImages(data);
        
        // Сохраняем в localStorage
        localStorage.setItem('nasaImages', JSON.stringify(data));
        localStorage.setItem('lastFetchTime', lastFetchTime.toString());
        
    } catch (error) {
        console.error('Error fetching NASA APOD:', error);
        
        // Пробуем загрузить из кэша при ошибке
        const cachedImages = localStorage.getItem('nasaImages');
        if (cachedImages) {
            nasaImages = JSON.parse(cachedImages);
            displayNasaImages(nasaImages);
            return;
        }
        
        const errorMessage = error.message.includes('429') 
            ? 'Превышен лимит запросов к API NASA. Пожалуйста, подождите немного и попробуйте снова.'
            : 'Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.';
            
        document.getElementById('nasaContent').innerHTML = `
            <div class="error-message">
                <i class="ri-error-warning-line error-icon"></i>
                <p>${errorMessage}</p>
                <button onclick="retryFetch()" class="retry-button">
                    <i class="ri-refresh-line"></i> Попробовать снова
                </button>
            </div>
        `;
    }
}

// При загрузке страницы пробуем загрузить данные из кэша
document.addEventListener('DOMContentLoaded', () => {
    const cachedImages = localStorage.getItem('nasaImages');
    const cachedTime = localStorage.getItem('lastFetchTime');
    
    if (cachedImages && cachedTime) {
        nasaImages = JSON.parse(cachedImages);
        lastFetchTime = parseInt(cachedTime);
    }
});

function retryFetch() {
    const nasaContent = document.getElementById('nasaContent');
    nasaContent.innerHTML = `
        <div class="nasa-loading">
            <div class="space-animation">
                <div class="space-scene">
                    <i class="ri-rocket-2-line rocket-icon"></i>
                    <i class="ri-meteor-line meteor-icon"></i>
                    <i class="ri-planet-line planet-icon"></i>
                    <i class="ri-star-line star-icon star1"></i>
                    <i class="ri-star-line star-icon star2"></i>
                    <i class="ri-star-line star-icon star3"></i>
                </div>
            </div>
            <div class="loading-text">
                <span class="loading-title">Исследуем космос</span>
                <span class="loading-subtitle">Загружаем удивительные снимки NASA...</span>
            </div>
        </div>
    `;
    fetchNasaImages();
}

function displayNasaImages(images) {
    if (!Array.isArray(images) || images.length === 0) {
        document.getElementById('nasaContent').innerHTML = `
            <div class="error-message">
                <i class="ri-error-warning-line error-icon"></i>
                <p>Нет доступных изображений</p>
                <button onclick="retryFetch()" class="retry-button">
                    <i class="ri-refresh-line"></i> Попробовать снова
                </button>
            </div>
        `;
        return;
    }

    const nasaContent = document.getElementById('nasaContent');
    nasaContent.innerHTML = `
        <div class="nasa-grid">
            ${images.map((image, index) => `
                <div class="nasa-card" onclick="openNasaModal(${index})">
                    <img src="${image.url}" alt="${image.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=NASA+Image+Not+Available'">
                    <div class="nasa-card-content">
                        <h3>${image.title}</h3>
                        <p class="nasa-date">${formatDate(image.date)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

let currentImageData = null;

async function openNasaModal(index) {
    currentImageData = nasaImages[index];
    const modal = document.getElementById('nasaModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modalImage');
    const modalDescription = document.getElementById('modalDescription');
    const modalDate = document.getElementById('modalDate');
    const modalCopyright = document.getElementById('modalCopyright');

    modalTitle.textContent = currentImageData.title;
    modalImage.src = currentImageData.hdurl || currentImageData.url;
    modalImage.alt = currentImageData.title;
    modalDescription.textContent = currentImageData.explanation;
    modalDate.textContent = formatDate(currentImageData.date);
    modalCopyright.textContent = currentImageData.copyright ? `© ${currentImageData.copyright}` : '';

    // Добавляем атрибуты для отслеживания оригинального текста
    modalTitle.setAttribute('data-original', currentImageData.title);
    modalDescription.setAttribute('data-original', currentImageData.explanation);

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

function showNextImage() {
    // Implement logic to show next image
}

function showPreviousImage() {
    // Implement logic to show previous image
}
