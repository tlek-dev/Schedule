document.getElementById('clearHistory').addEventListener('click', () => {
    const historyGrid = document.getElementById('colorHistory');
    historyGrid.innerHTML = ''; // Очищаем сетку истории
    localStorage.removeItem('colorHistory'); // Очищаем историю из localStorage
});

document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const colorDisplay = document.getElementById('colorDisplay');
    const rgbValue = document.getElementById('rgbValue');
    const hexValue = document.getElementById('hexValue');
    const redInput = document.getElementById('redInput');
    const greenInput = document.getElementById('greenInput');
    const blueInput = document.getElementById('blueInput');
    const hexInput = document.getElementById('hexInput');
    const colorHistory = document.getElementById('colorHistory');

    // История цветов
    let colorHistoryArray = JSON.parse(localStorage.getItem('colorHistory') || '[]');
    
    // Обновление отображения цвета
    function updateColorDisplay(r, g, b) {
        const color = `rgb(${r}, ${g}, ${b})`;
        const hex = rgbToHex(r, g, b);
        
        colorDisplay.style.backgroundColor = color;
        rgbValue.textContent = `RGB: ${r}, ${g}, ${b}`;
        hexValue.textContent = `HEX: ${hex}`;
        hexInput.value = hex;
        
        // Сохранение в историю
        addToHistory(hex);
    }

    // Конвертация RGB в HEX
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
    }

    // Конвертация HEX в RGB
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return [r, g, b];
    }

    // Добавление цвета в историю
    function addToHistory(hex) {
        if (!colorHistoryArray.includes(hex)) {
            colorHistoryArray.unshift(hex);
            if (colorHistoryArray.length > 20) {
                colorHistoryArray.pop();
            }
            localStorage.setItem('colorHistory', JSON.stringify(colorHistoryArray));
            updateHistoryDisplay();
        }
    }

    // Обновление отображения истории
    function updateHistoryDisplay() {
        colorHistory.innerHTML = '';
        colorHistoryArray.forEach(hex => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.style.backgroundColor = hex;
            historyItem.setAttribute('data-color', hex);
            historyItem.title = hex;
            
            historyItem.addEventListener('click', () => {
                const [r, g, b] = hexToRgb(hex);
                redInput.value = r;
                greenInput.value = g;
                blueInput.value = b;
                updateColorDisplay(r, g, b);
            });
            
            colorHistory.appendChild(historyItem);
        });
    }

    // Обработчики событий для RGB инпутов
    [redInput, greenInput, blueInput].forEach(input => {
        input.addEventListener('input', () => {
            let r = Math.min(255, Math.max(0, parseInt(redInput.value) || 0));
            let g = Math.min(255, Math.max(0, parseInt(greenInput.value) || 0));
            let b = Math.min(255, Math.max(0, parseInt(blueInput.value) || 0));
            
            redInput.value = r;
            greenInput.value = g;
            blueInput.value = b;
            
            updateColorDisplay(r, g, b);
        });
    });

    // Обработчик события для HEX инпута
    hexInput.addEventListener('input', (e) => {
        let hex = e.target.value;
        if (hex.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
            const [r, g, b] = hexToRgb(hex);
            redInput.value = r;
            greenInput.value = g;
            blueInput.value = b;
            updateColorDisplay(r, g, b);
        }
    });

    // Инициализация истории
    updateHistoryDisplay();
});
