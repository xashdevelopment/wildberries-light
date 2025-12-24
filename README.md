# Wildberries Light - Vercel Serverless Edition

## Структура проекта для Vercel

```
wildberries-light/
├── api/
│   ├── search.js      # Прокси API для поиска товаров
│   └── health.js      # Проверка работоспособности
├── index.html         # Фронтенд приложения
├── vercel.json        # Конфигурация Vercel
├── package.json       # NPM зависимости
└── test.cjs           # Тесты (Playwright)
```

## Развёртывание на Vercel

### Способ 1: Через GitHub (Рекомендуется)

1. **Создайте репозиторий на GitHub:**
   ```bash
   cd /workspace/wildberries-light
   git init
   git add .
   git commit -m "Initial commit: Wildberries Light for Vercel"
   ```

2. **Загрузите на GitHub:**
   - Создайте новый репозиторий на [github.com](https://github.com)
   ```bash
   git remote add origin https://github.com/ваш-никнейм/wildberries-light.git
   git branch -M main
   git push -u origin main
   ```

3. **Подключите к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "Add New..." → "Project"
   - Выберите ваш репозиторий
   - Vercel автоматически определит:
     - Framework: None (другие)
     - Build Command: `npm run build` (или оставьте пустым)
     - Output Directory: `.`
   - Нажмите "Deploy"

### Способ 2: Через Vercel CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Разверните
cd /workspace/wildberries-light
vercel --prod
```

## Локальная разработка

```bash
# Установите Vercel CLI
npm i -g vercel

# Запустите локальный сервер разработки
cd /workspace/wildberries-light
vercel dev
```

После запуска откройте [http://localhost:3000](http://localhost:3000)

## API Endpoints

После развёртывания будут доступны:

| Endpoint | Описание |
|----------|----------|
| `/` | Главная страница |
| `/api/search?query=товар` | Поиск товаров |
| `/api/health` | Проверка состояния API |

## Примеры запросов

### Поиск товаров
```bash
curl "https://ваш-проект.vercel.app/api/search?query=Samsung"
```

### Проверка здоровья
```bash
curl "https://ваш-проект.vercel.app/api/health"
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

### API Proxy (api/search.js)
- Использует Vercel Serverless Functions
- Обходит CORS ограничения
- Проксирует запросы к Wildberries API
- Автоматически форматирует ответы

### Image Sharding
Wildberries использует распределённую систему хранения изображений:
- Серверы: `basket-01.wbbasket.ru` — `basket-15.wbbasket.ru`
- URL паттерн: `https://basket-{shard}.wbbasket.ru/vol{vol}/part{part}/{nmId}-1.jpg`

### Ограничения бесплатного тарифа Vercel
- 100 ГБ трафика/месяц
- 100 часов Serverless Functions/месяц
- Функции засыпают после бездействия

## Устранение проблем

### Ошибка "AbortSignal.timeout is not a function"
Исправлено! Теперь используется кроссбраузерный `AbortController`.

### CORS ошибки
API настроен с правильными заголовками CORS для работы с фронтендом.

### Функции не работают после деплоя
1. Проверьте логи в Vercel Dashboard
2. Убедитесь, что файлы в директории `api/`
3. Проверьте `/api/health` endpoint

## Лицензия

MIT
