const API_BASE = 'https://vparivanie-api.onrender.com';

function getLocalData() {
    try {
        const raw = localStorage.getItem('vparivanie_admin_data');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

async function loadCartridges() {
    try {
        const res = await fetch(`${API_BASE}/data/карики.json`);
        const data = await res.json();
        return data.items || [];
    } catch (err) {
        const local = getLocalData();
        if (local && local.cartridges) {
            return local.cartridges;
        }
        return [];
    }
}

function renderCartridgeCards(items) {
    const grid = document.getElementById('cartridgeGrid');
    if (!grid) return;

    grid.innerHTML = '';

    items.forEach((item, index) => {
        const status = item.availability ? 'in-stock' : 'out-of-stock';
        const statusLabel = item.availability ? 'есть в наличии' : 'нет в наличии';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-info">
                <div class="product-name">${item.name}</div>
                <div class="product-price">${item.price}</div>
                <span class="product-status ${status}">${statusLabel}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const items = await loadCartridges();
    renderCartridgeCards(items);
});
