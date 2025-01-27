document.addEventListener('DOMContentLoaded', () => {
    // Инициализация при открытии вкладки
    const cryptoTab = document.querySelector('[onclick="showWidget(\'crypto\')"]');
    if (cryptoTab) {
        cryptoTab.addEventListener('click', () => {
            loadCryptoData();
        });
    }
});

async function loadCryptoData() {
    showLoading(true);
    try {
        // Загрузка данных о топ-10 криптовалютах
        const [cryptoData, btcData] = await Promise.all([
            fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=ru')
                .then(response => response.json()),
            fetch('https://api.blockchain.info/stats')
                .then(response => response.json())
        ]);

        displayCryptoData(cryptoData);
        displayBitcoinInfo(btcData);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError();
    } finally {
        showLoading(false);
    }
}

function displayCryptoData(data) {
    const cryptoGrid = document.getElementById('cryptoGrid');
    if (!cryptoGrid) return;

    cryptoGrid.innerHTML = data.map(crypto => `
        <div class="crypto-card">
            <div class="crypto-card-header">
                <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                <div>
                    <div class="crypto-name">${crypto.name}</div>
                    <div class="crypto-symbol">${crypto.symbol.toUpperCase()}</div>
                </div>
            </div>
            <div class="crypto-price">$${formatNumber(crypto.current_price)}</div>
            <div class="crypto-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                ${Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
            </div>
            <div class="crypto-details">
                <div class="crypto-detail-item">
                    <span class="crypto-detail-label">Капитализация:</span>
                    <span>$${formatNumber(crypto.market_cap)}</span>
                </div>
                <div class="crypto-detail-item">
                    <span class="crypto-detail-label">Объём (24ч):</span>
                    <span>$${formatNumber(crypto.total_volume)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function displayBitcoinInfo(data) {
    const bitcoinInfo = document.getElementById('bitcoinInfo');
    if (!bitcoinInfo) return;

    bitcoinInfo.innerHTML = `
        <h2 class="bitcoin-info-title">Статистика сети Биткоин</h2>
        <div class="bitcoin-stats">
            <div class="bitcoin-stat-card">
                <div class="bitcoin-stat-label">Хешрейт</div>
                <div class="bitcoin-stat-value">${formatHashrate(data.hash_rate)}</div>
            </div>
            <div class="bitcoin-stat-card">
                <div class="bitcoin-stat-label">Сложность</div>
                <div class="bitcoin-stat-value">${formatNumber(Math.round(data.difficulty))}</div>
            </div>
            <div class="bitcoin-stat-card">
                <div class="bitcoin-stat-label">Транзакции (24ч)</div>
                <div class="bitcoin-stat-value">${formatNumber(data.n_tx)}</div>
            </div>
            <div class="bitcoin-stat-card">
                <div class="bitcoin-stat-label">Комиссии майнеров</div>
                <div class="bitcoin-stat-value">$${formatNumber(data.miners_revenue_usd)}</div>
            </div>
        </div>
    `;
}

function showLoading(show) {
    const cryptoContent = document.getElementById('cryptoContent');
    const cryptoGrid = document.getElementById('cryptoGrid');
    const bitcoinInfo = document.getElementById('bitcoinInfo');
    
    if (!cryptoContent || !cryptoGrid || !bitcoinInfo) return;

    if (show) {
        cryptoContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка данных...</div>
            </div>
        `;
        cryptoGrid.innerHTML = '';
        bitcoinInfo.innerHTML = '';
    } else {
        cryptoContent.innerHTML = '';
    }
}

function showError() {
    const cryptoContent = document.getElementById('cryptoContent');
    if (!cryptoContent) return;

    cryptoContent.innerHTML = `
        <div class="loading-container">
            <div style="text-align: center; color: var(--text-primary);">
                <p style="margin-bottom: 1rem;">Произошла ошибка при загрузке данных.</p>
                <button onclick="loadCryptoData()" class="crypto-tab">
                    Попробовать снова
                </button>
            </div>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + ' млрд';
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + ' млн';
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + ' тыс';
    }
    return num.toFixed(2);
}

function formatHashrate(hashrate) {
    const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
    let unitIndex = 0;
    
    while (hashrate >= 1000 && unitIndex < units.length - 1) {
        hashrate /= 1000;
        unitIndex++;
    }
    
    return hashrate.toFixed(2) + ' ' + units[unitIndex];
}

// Обновление данных каждые 30 секунд
setInterval(loadCryptoData, 30000);
