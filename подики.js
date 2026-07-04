const API_BASE = 'https://vparivanie-api.onrender.com';

function getLocalData() {
    try {
        const raw = localStorage.getItem('vparivanie_admin_data');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

async function loadPods() {
    try {
        const res = await fetch(`${API_BASE}/data/подики.json`);
        const data = await res.json();
        return data.items || [];
    } catch (err) {
        const local = getLocalData();
        if (local && local.pods) {
            return local.pods;
        }
        return [];
    }
}

function renderPodCards(items) {
    const grid = document.getElementById('podGrid');
    if (!grid) return;

    grid.innerHTML = '';

    items.forEach((item, index) => {
        const imageMap = {
            'Xros 5 mini': 'images/xros_5_mini.png',
            'Xros 5': 'images/xros_5.png',
            'Xros cube': 'images/xros_cube.png'
        };
        const imgSrc = imageMap[item.name] || 'images/any_pod.png';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image"><img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;"></div>
            <div class="product-info">
                <div class="product-name">${item.name}</div>
                <div class="product-description">Pod-система</div>
                <div class="product-price">${item.price}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const items = await loadPods();
    renderPodCards(items);
});
