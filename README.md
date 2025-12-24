# Wildberries Light - Render.com Edition

## Структура проекта для Render.com

```
wildberries-light/
├── api/
│   ├── search.js      # Прокси API для поиска товаров
│   └── health.js      # Проверка работоспособности
├── index.html         # Фронтенд приложения
├── server.js          # Express сервер для Render
├── package.json       # NPM зависимости
└── test.cjs           # Тесты (Playwright)
```

## Развёртывание на Render.com

### Способ 1: Через GitHub (Рекомендуется)

1. **Репозиторий уже создан на GitHub:**
   ```
   https://github.com/xashdevelopment/wildberries-light
   ```

2. **Загрузите обновлённые файлы на GitHub:**
   ```bash
   cd /workspace/wildberries-light
   git add .
   git commit -m "Adapt for Render.com deployment"
   git push origin main
   ```
   git remote add origin https://github.com/ваш-никнейм/wildberries-light.git
   git branch -M main
   git push -u origin main
   ```

2. **Подключите к Render.com:**
   - Зайдите на [render.com](https://render.com)
   - Нажмите "Add New..." → "Web Service"
   - Выберите ваш GitHub аккаунт и репозиторий `wildberries-light`
   - Настройки:
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Нажмите "Create Web Service"

### Способ 2: Через Render CLI

```bash
# Установите Render CLI (опционально)
npm install -g @render-com/cli

# Создайте Web Service через веб-интерфейс Render.com
```

## Локальная разработка

```bash
# Установите зависимости
npm install

# Запустите локальный сервер
npm start
```

После запуска откройте [http://localhost:3000](http://localhost:3000)

## API Endpoints

После развёртывания на Render.com будут доступны:

| Endpoint | Описание |
|----------|----------|
| `/` | Главная страница |
| `/api/search?query=товар` | Поиск товаров |
| `/api/health` | Проверка состояния API |

## Примеры запросов

### Поиск товаров
```bash
curl "https://wildberries-light.onrender.com/api/search?query=Samsung"
```

### Проверка здоровья
```bash
curl "https://wildberries-light.onrender.com/api/health"
```

## Тестирование

```bash
# Запуск тестов
node test.cjs

# Все тесты должны пройти успешно:
# Passed: 19
# Failed: 0
```

## Технические детали

### Express Server (server.js)
- Использует Express.js для обработки запросов
- Обходит CORS ограничения
- Проксирует запросы к Wildberries API
- Автоматически форматирует ответы
- Служит статические файлы (index.html)

### API Proxy (api/search.js)
- Импортируется в Express сервер
- Обходит CORS ограничения
- Проксирует запросы к Wildberries API
- Автоматически форматирует ответы

### Image Sharding
Wildberries использует распределённую систему хранения изображений:
- Серверы: `basket-01.wbbasket.ru` — `basket-15.wbbasket.ru`
- URL паттерн: `https://basket-{shard}.wbbasket.ru/vol{vol}/part{part}/{nmId}-1.jpg`

### Ограничения бесплатного тарифа Render
- 750 часов серверного времени/месяц
- Приложение засыпает после 15 минут бездействия
- Первый запрос после сна может занять 30-60 секунд

## Устранение проблем

### Ошибка "AbortSignal.timeout is not a function"
Исправлено! Теперь используется кроссбраузерный `AbortController`.

### CORS ошибки
API настроен с правильными заголовками CORS для работы с фронтендом.

### Функции не работают после деплоя
1. Проверьте логи в Render Dashboard
2. Убедитесь, что Build Command: `npm install`
3. Убедитесь, что Start Command: `npm start`
4. Проверьте `/api/health` endpoint

### Приложение "засыпает"
- Это нормально для бесплатного тарифа Render
- Первый запрос после сна займёт 30-60 секунд
- Платно (Pro) предотвращает засыпание

## Лицензия

MIT
