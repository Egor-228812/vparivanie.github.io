# VPARIVANIE

Магазин электронных сигарет.

## Локальный запуск

```bash
python server.py
```
Откройте http://localhost:3000

## Админ-панель

Откройте `/admin.html`
Пароль: `vparivanie2024`

## Деплой на GitHub Pages + Render

### 1. Заливаем код на GitHub

```bash
cd C:\Users\admin\OneDrive\Desktop\VPARIVANIE
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Egor-228812/vparivanie.github.io.git
git branch -M main
git push -u origin main
```

### 2. Включаем GitHub Pages

1. Откройте https://github.com/Egor-228812/vparivanie.github.io/settings/pages
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `(root)`
4. **Save**

Сайт будет доступен по адресу:
```
https://egor-228812.github.io/vparivanie.github.io/
```

### 3. Деплоим backend на Render

1. Зайдите на https://render.com/register (войдите через GitHub)
2. **New +** → **Web Service**
3. Выберите репозиторий `vparivanie.github.io`
4. Настройки:
   - **Name**: `vparivanie-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
5. Нажмите **Create Web Service**
6. Дождитесь деплоя (~2-3 минуты)
7. Вы получите URL вида: `https://vparivanie-api.onrender.com`

### 4. Обновляем URL в админке

После деплоя откройте `admin.js` и найдите строку:
```javascript
const API_BASE = '';
```

Замените на:
```javascript
const API_BASE = 'https://vparivanie-api.onrender.com';
```

И обновите все fetch запросы в `admin.js`, `одноразки.js`, `подики.js`, `расходники.js`, добавив `API_BASE` перед путями.

### 5. Проверка

- Сайт: `https://egor-228812.github.io/vparivanie.github.io/`
- Админка: `https://egor-228812.github.io/vparivanie.github.io/admin.html`
- Backend: `https://vparivanie-api.onrender.com`

При изменении наличия в админке и нажатии «Сохранить изменения» данные будут записываться в JSON-файлы на Render, и все пользователи увидят актуальные данные.

## Данные

Все товары хранятся в папке `data/` в формате JSON:
- `data/одноразки.json`
- `data/подики.json`
- `data/расходники.json`
