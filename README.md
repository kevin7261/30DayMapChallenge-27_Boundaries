# 🗺️ 30 Day Map Challenge - Day 14: Data Challenge - OpenStreetMap

一個基於 Vue
3 和 Leaflet 的互動式 OpenStreetMap 數據視覺化應用，採用諾魯國旗配色主題，展示地點、道路、交通設施和水域等多層次地理資料。

## 📸 專案概覽

本專案是 **#30DayMapChallenge** 第 14 天的作品，主題為「Data Challenge -
OpenStreetMap」。使用 OpenStreetMap 提供的多種地理資料集，透過諾魯國旗的獨特配色（深藍、金黃、白色）呈現豐富的地理資訊。

### 核心特點

- 🇳🇷 **諾魯國旗配色主題**：深藍色、金黃色、白色的和諧搭配
- 🌊 **多層次資料呈現**：地點、水域、道路、交通設施四大圖層
- 🌍 **赤道線標示**：金黃色赤道線，呼應諾魯位於赤道附近的地理位置
- 📐 **經緯網格系統**：白色半透明經緯線，提供清晰的地理參考
- 🎨 **純數據可視化**：無底圖，專注於資料本身的呈現
- 🚫 **非交互式設計**：移除懸停和彈出功能，強調靜態美學

## ✨ 功能特色

### 🗺️ 地圖顯示

#### 圖層架構（由下至上）

1. **經緯網格層** 🌐

   - 每 10° 繪製一條經緯線
   - 顏色：白色 (#FFFFFF)
   - 透明度：0.2（半透明）
   - 作用：提供全球地理參考框架

2. **赤道線層** ☀️

   - 位置：緯度 0°
   - 顏色：金黃色 (#FFC61E)
   - 線寬：4px
   - 意義：諾魯國旗上的黃色橫條代表赤道

3. **地點圖層** (gis_osm_places_a_free_1.geojson) 📍

   - 填充色：諾魯藍 (#002B7F)
   - 邊框色：金黃色 (#FFC61E)
   - 邊框寬度：2px
   - 透明度：0.9
   - 內容：行政區劃、聚落等地點多邊形

4. **水域圖層** (gis_osm_water_a_free_1.geojson) 🌊

   - 填充色：深藍色 (#001b4d)
   - 邊框色：諾魯藍 (#002B7F)
   - 邊框寬度：1px
   - 透明度：0.8
   - 內容：湖泊、河流、海洋等水體

5. **道路圖層** (gis_osm_roads_free_1.geojson) 🛣️

   - 線條色：金黃色 (#FFC61E)
   - 線寬：1.5px
   - 透明度：0.7
   - 內容：道路網絡（LineString 幾何）

6. **交通設施圖層** (gis_osm_transport_a_free_1.geojson) 🚉
   - 填充色：白色 (#FFFFFF)
   - 邊框色：金黃色 (#FFC61E)
   - 邊框寬度：1px
   - 透明度：0.7
   - 內容：機場、港口、車站等交通設施

### 🎨 配色主題：諾魯國旗

**為什麼選擇諾魯？**

- 🌊 諾魯是世界上最小的島國之一，與 OpenStreetMap 的細節呈現理念呼應
- 🌍 諾魯位於赤道附近，其國旗上的黃色橫條正代表赤道
- 🏝️ 作為太平洋島國，其配色與海洋主題完美契合

**配色規範**

| 顏色名稱 | 色碼      | 用途               | RGB 值             |
| -------- | --------- | ------------------ | ------------------ |
| 諾魯深藍 | `#002B7F` | 地點填充、水域邊框 | RGB(0, 43, 127)    |
| 背景深藍 | `#001b4d` | 地圖背景、水域填充 | RGB(0, 27, 77)     |
| 金黃色   | `#FFC61E` | 赤道線、道路、邊框 | RGB(255, 198, 30)  |
| 白色     | `#FFFFFF` | 經緯網格、交通設施 | RGB(255, 255, 255) |

### 🔧 交互功能

- ✅ **滾輪縮放**：鼠標滾輪控制地圖縮放級別
- ✅ **拖動平移**：點擊拖動瀏覽不同區域
- ✅ **觸控支持**：完整的移動設備手勢支持
- ❌ **無交互圖層**：所有數據圖層設置為 `interactive: false`
- ❌ **無懸停效果**：專注於靜態視覺呈現
- ❌ **無彈出窗口**：移除所有 popup 和 tooltip

### 📱 響應式設計

- 自動適應不同螢幕尺寸
- 地圖視圖自動調整到數據範圍
- 支援桌面和移動設備

## 🛠️ 技術架構

### 核心技術棧

| 技術       | 版本 | 用途                        |
| ---------- | ---- | --------------------------- |
| Vue 3      | 3.2+ | 前端框架（Composition API） |
| Leaflet    | 1.9+ | 地圖渲染和交互              |
| Pinia      | 2.1+ | 狀態管理                    |
| Bootstrap  | 5.3+ | UI 樣式框架                 |
| Vue Router | 4.5+ | 單頁面路由                  |

### 為什麼選擇 Leaflet？

1. **輕量高效**：相比 D3.js，Leaflet 專為地圖設計，性能更優
2. **原生支持**：內建縮放、平移等地圖交互功能
3. **GeoJSON 友好**：完美支持 OSM 的 GeoJSON 格式
4. **插件豐富**：擁有龐大的插件生態系統
5. **移動優化**：原生支持觸控手勢

### 專案結構

```
30DayMapChallenge-14_Data-challenge-OpenStreetMap/
│
├── public/                          # 靜態資源目錄
│   ├── data/                        # 數據文件
│   │   ├── geojson/                 # GeoJSON 數據集
│   │   │   ├── gis_osm_places_a_free_1.geojson       # 地點多邊形
│   │   │   ├── gis_osm_places_a_free_1.qmd           # 元數據
│   │   │   ├── gis_osm_roads_free_1.geojson          # 道路網絡
│   │   │   ├── gis_osm_roads_free_1.qmd              # 元數據
│   │   │   ├── gis_osm_transport_a_free_1.geojson    # 交通設施
│   │   │   ├── gis_osm_transport_a_free_1.qmd        # 元數據
│   │   │   ├── gis_osm_water_a_free_1.geojson        # 水域
│   │   │   └── gis_osm_water_a_free_1.qmd            # 元數據
│   │   └── README.md                # 數據說明文檔
│   ├── favicon.ico                  # 網站圖標
│   └── index.html                   # HTML 模板
│
├── src/                             # 源代碼目錄
│   ├── assets/                      # 資源文件
│   │   ├── css/
│   │   │   ├── common.css           # 通用樣式
│   │   │   └── variables.css        # CSS 變數定義
│   │   └── logo.png                 # Logo 圖片
│   │
│   ├── stores/                      # Pinia 狀態管理
│   │   ├── dataStore.js             # 數據狀態管理
│   │   └── defineStore.js           # Store 配置
│   │
│   ├── tabs/                        # 標籤頁組件
│   │   └── MapTab.vue               # 🗺️ 地圖組件（核心）
│   │
│   ├── views/                       # 視圖頁面
│   │   └── HomeView.vue             # 主頁視圖
│   │
│   ├── router/                      # 路由配置
│   │   └── index.js                 # Vue Router 設定
│   │
│   ├── App.vue                      # 根組件
│   └── main.js                      # 應用程序入口
│
├── dist/                            # 構建輸出目錄
├── node_modules/                    # NPM 依賴包
│
├── .gitignore                       # Git 忽略規則
├── babel.config.js                  # Babel 配置
├── jsconfig.json                    # JavaScript 配置
├── package.json                     # NPM 包配置
├── package-lock.json                # 依賴鎖定文件
├── vue.config.js                    # Vue CLI 配置
└── README.md                        # 📖 本文件
```

### 核心組件說明

#### MapTab.vue - 地圖組件

這是整個應用的核心組件，負責所有地圖相關的功能。

**主要功能模塊：**

1. **數據載入模塊** (`loadAllData`)

   - 並行載入四個 GeoJSON 文件
   - 使用 Promise.all 優化載入速度
   - 錯誤處理和狀態反饋

2. **地圖初始化模塊** (`createMap`)

   - 創建 Leaflet 地圖實例
   - 配置地圖選項（禁用縮放按鈕、歸屬信息）
   - 設置初始視圖（中心點在赤道）

3. **經緯網格繪製** (`drawGraticule`)

   - 繪製經線（-180° 到 180°，每 10°）
   - 繪製緯線（-80° 到 80°，每 10°）
   - 白色半透明樣式

4. **赤道線繪製** (`drawEquator`)

   - 繪製緯度 0° 的水平線
   - 金黃色實線，線寬 4px
   - 橫跨全球（-180° 到 180°）

5. **數據圖層繪製**

   - `drawPlaces()`: 地點多邊形圖層
   - `drawWater()`: 水域圖層
   - `drawRoads()`: 道路線條圖層
   - `drawTransport()`: 交通設施圖層

6. **生命週期管理**
   - `onMounted`: 初始化地圖
   - `onUnmounted`: 清理資源，移除事件監聽

#### dataStore.js - 狀態管理

簡化的狀態管理，主要存儲地圖實例：

```javascript
{
  mapInstance: null,        // Leaflet 地圖實例引用
  setMapInstance: Function  // 設置地圖實例的方法
}
```

## 🚀 快速開始

### 環境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0 或 **yarn**: >= 1.22.0
- **瀏覽器**: 支持 ES6+ 的現代瀏覽器（Chrome 90+, Firefox 88+, Safari 14+）

### 安裝步驟

#### 1. 克隆專案

```bash
# HTTPS 方式
git clone https://github.com/kevin7261/30DayMapChallenge-14_Data-challenge-OpenStreetMap.git

# SSH 方式（需要配置 SSH key）
git clone git@github.com:kevin7261/30DayMapChallenge-14_Data-challenge-OpenStreetMap.git

# 進入專案目錄
cd 30DayMapChallenge-14_Data-challenge-OpenStreetMap/website/30DayMapChallenge-14_Data-challenge-OpenStreetMap
```

#### 2. 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

**主要依賴項：**

```json
{
  "dependencies": {
    "vue": "^3.2.13", // Vue 3 框架
    "vue-router": "^4.5.1", // 路由管理
    "pinia": "^2.1.0", // 狀態管理
    "leaflet": "^1.9.4", // 地圖庫
    "bootstrap": "^5.3.0", // UI 框架
    "@fortawesome/fontawesome-free": "^6.7.2" // 圖標庫
  }
}
```

#### 3. 啟動開發服務器

```bash
npm run serve
```

開發服務器將在
`http://localhost:8080/30DayMapChallenge-14_Data-challenge-OpenStreetMap/` 啟動

**開發服務器特性：**

- 🔥 熱模塊替換（HMR）
- 🔧 自動重新載入
- 📝 即時錯誤提示
- 🚀 快速編譯

#### 4. 構建生產版本

```bash
npm run build
```

構建產物將輸出到 `dist/` 目錄

**構建優化：**

- ✅ 代碼壓縮
- ✅ Tree Shaking
- ✅ 資源優化
- ✅ Source Map 生成

#### 5. 部署到 GitHub Pages

```bash
npm run deploy
```

這將自動構建並部署到 GitHub Pages

## 📚 開發指南

### 修改地圖配色

在 `src/tabs/MapTab.vue` 中修改各圖層的顏色：

```javascript
// 地點圖層配色
placesLayer = L.geoJSON(placesData.value, {
  style: {
    fillColor: '#002B7F', // 填充色：諾魯深藍
    fillOpacity: 0.9, // 填充透明度
    color: '#FFC61E', // 邊框色：金黃色
    weight: 2, // 邊框寬度
  },
});

// 水域圖層配色
waterLayer = L.geoJSON(waterData.value, {
  style: {
    fillColor: '#001b4d', // 填充色：背景深藍
    fillOpacity: 0.8,
    color: '#002B7F', // 邊框色：諾魯藍
    weight: 1,
  },
});

// 道路圖層配色
roadsLayer = L.geoJSON(roadsData.value, {
  style: {
    color: '#FFC61E', // 線條色：金黃色
    weight: 1.5, // 線寬
    opacity: 0.7, // 透明度
  },
});

// 交通設施圖層配色
transportLayer = L.geoJSON(transportData.value, {
  style: {
    fillColor: '#FFFFFF', // 填充色：白色
    fillOpacity: 0.7,
    color: '#FFC61E', // 邊框色：金黃色
    weight: 1,
  },
});
```

### 調整圖層順序

在 `initMap()` 函數中調整繪製順序（先繪製的在下層）：

```javascript
if (createMap()) {
  drawGraticule(); // 1. 經緯網格（最底層）
  drawEquator(); // 2. 赤道線
  drawPlaces(); // 3. 地點圖層 ⬅️ 可調整順序
  drawWater(); // 4. 水域圖層
  drawRoads(); // 5. 道路圖層
  drawTransport(); // 6. 交通設施（最上層）
}
```

### 啟用交互功能

如需啟用懸停和彈出功能，修改 `drawPlaces()` 函數：

```javascript
placesLayer = L.geoJSON(placesData.value, {
  style: {
    /* 樣式配置 */
  },
  interactive: true, // 改為 true 啟用交互
  onEachFeature: (feature, layer) => {
    // 添加彈出窗口
    const placeName = feature.properties?.name || 'Unknown';
    layer.bindPopup(`<strong>${placeName}</strong>`);

    // 添加工具提示
    layer.bindTooltip(placeName);

    // 添加懸停效果
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 1 });
      },
      mouseout: (e) => {
        e.target.setStyle({ fillOpacity: 0.9 });
      },
    });
  },
});
```

### 修改經緯網格密度

在 `drawGraticule()` 函數中調整間隔：

```javascript
// 經線間隔（當前：每 10°）
for (let lng = -180; lng <= 180; lng += 10) {
  // 改為 20 可減少密度
  // ...
}

// 緯線間隔（當前：每 10°）
for (let lat = -80; lat <= 80; lat += 10) {
  // 改為 15 可減少密度
  // ...
}
```

### 調整地圖初始視圖

在 `createMap()` 函數中修改：

```javascript
map = L.map(mapContainer.value, {
  center: [0, 0], // 中心點 [緯度, 經度]
  zoom: 2, // 初始縮放級別（1-19）
  minZoom: 1, // 最小縮放級別
  maxZoom: 18, // 最大縮放級別
  zoomControl: false, // 是否顯示 +/- 按鈕
});
```

### 添加新的數據圖層

1. **準備 GeoJSON 數據**

   - 將文件放入 `public/data/geojson/`
   - 確保是有效的 GeoJSON 格式

2. **添加數據引用**

   ```javascript
   const newLayerData = ref(null);
   ```

3. **載入數據**

   ```javascript
   const loadAllData = async () => {
     const newResponse = await fetch(
       `${process.env.BASE_URL}data/geojson/new-layer.geojson`
     );
     newLayerData.value = await newResponse.json();
   };
   ```

4. **創建繪製函數**

   ```javascript
   const drawNewLayer = () => {
     if (!map || !newLayerData.value) return;

     L.geoJSON(newLayerData.value, {
       style: {
         fillColor: '#YOUR_COLOR',
         // ... 樣式配置
       },
     }).addTo(map);
   };
   ```

5. **添加到初始化流程**
   ```javascript
   if (createMap()) {
     // ... 其他圖層
     drawNewLayer(); // 在適當位置調用
   }
   ```

## 📊 數據來源

### OpenStreetMap (OSM)

本專案使用的所有 GeoJSON 數據來自 **OpenStreetMap**，一個自由、開放的地圖項目。

**數據集詳情：**

| 文件名                               | 內容         | 幾何類型                     | 大小（約） |
| ------------------------------------ | ------------ | ---------------------------- | ---------- |
| `gis_osm_places_a_free_1.geojson`    | 地點、行政區 | Polygon / MultiPolygon       | 數 MB      |
| `gis_osm_roads_free_1.geojson`       | 道路網絡     | LineString / MultiLineString | 數 MB      |
| `gis_osm_transport_a_free_1.geojson` | 交通設施     | Polygon / Point              | < 1 MB     |
| `gis_osm_water_a_free_1.geojson`     | 水域         | Polygon / MultiPolygon       | 數 MB      |

**數據屬性字段：**

```javascript
// 地點數據屬性示例
{
  "name": "地點名稱",
  "fclass": "功能分類（如 city, town, village）",
  "population": "人口數（如有）"
}

// 道路數據屬性示例
{
  "name": "道路名稱",
  "fclass": "道路類型（如 motorway, primary, secondary）",
  "oneway": "單行道標記"
}
```

**數據來源：**

- 官網：https://www.openstreetmap.org/
- 授權：[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)
- 貢獻者：全球 OpenStreetMap 社群

**數據下載：**

- Geofabrik：https://download.geofabrik.de/
- BBBike：https://extract.bbbike.org/

### 授權說明

根據 ODbL 授權條款：

- ✅ 可自由使用、修改和分發數據
- ✅ 可用於商業用途
- ⚠️ 必須註明數據來源（OpenStreetMap 貢獻者）
- ⚠️ 衍生作品需使用相同授權

## 🎨 樣式自訂

### CSS 變數系統

在 `src/assets/css/variables.css` 中定義了全局 CSS 變數：

```css
:root {
  /* 諾魯國旗配色 */
  --nauru-blue: #002b7f;
  --nauru-yellow: #ffc61e;
  --nauru-dark-blue: #001b4d;

  /* 地圖樣式 */
  --map-background: var(--nauru-dark-blue);
  --equator-color: var(--nauru-yellow);
  --grid-color: #ffffff;

  /* UI 元素 */
  --popup-bg: rgba(0, 43, 127, 0.95);
  --popup-text: var(--nauru-yellow);
}
```

### 組件樣式

在 `MapTab.vue` 中的 `<style scoped>` 區塊：

```css
/* 地圖容器背景 */
:deep(.leaflet-container) {
  background: #001b4d; /* 深藍色背景 */
}

/* 彈出窗口樣式 */
:deep(.leaflet-popup-content-wrapper) {
  background: rgba(0, 43, 127, 0.95);
  color: #ffc61e;
  border: 2px solid #ffc61e;
}

/* 工具提示樣式 */
:deep(.leaflet-tooltip) {
  background-color: rgba(0, 43, 127, 0.95) !important;
  color: #ffc61e !important;
  border: 1px solid #ffc61e !important;
}
```

## 🌐 線上展示

### GitHub Pages

**正式網站：**
https://kevin7261.github.io/30DayMapChallenge-14_Data-challenge-OpenStreetMap/

**專案倉庫：**
https://github.com/kevin7261/30DayMapChallenge-14_Data-challenge-OpenStreetMap

### 本地預覽

構建後可使用任何靜態文件服務器預覽：

```bash
# 使用 Python 3
cd dist
python -m http.server 8000

# 使用 Node.js http-server
npx http-server dist -p 8000

# 使用 serve
npx serve dist
```

## 📝 開發指令

### 常用指令

```bash
# 安裝依賴
npm install

# 啟動開發服務器（熱重載）
npm run serve

# 構建生產版本
npm run build

# 代碼檢查（ESLint）
npm run lint

# 自動修復代碼問題
npm run lint:fix

# 代碼格式化（Prettier）
npm run prettier

# 格式化檢查
npm run prettier:check

# 完整格式化（Prettier + ESLint）
npm run format

# 部署到 GitHub Pages
npm run deploy
```

### 開發工作流程

```bash
# 1. 開發新功能
git checkout -b feature/new-feature
npm run serve  # 啟動開發服務器

# 2. 代碼檢查和格式化
npm run format

# 3. 構建測試
npm run build

# 4. 提交代碼
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 5. 部署（僅主分支）
git checkout main
npm run deploy
```

## 🔧 配置文件

### vue.config.js

```javascript
module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/30DayMapChallenge-14_Data-challenge-OpenStreetMap/'
      : '/',
  // 其他配置...
};
```

### babel.config.js

```javascript
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
};
```

### .gitignore

```
node_modules/
dist/
.DS_Store
*.log
.env.local
```

## 🐛 常見問題

### 地圖不顯示

**問題：** 地圖容器是空白的

**解決方案：**

1. 確認已安裝 Leaflet CSS：`import 'leaflet/dist/leaflet.css'`
2. 檢查容器有明確的高度：`height: 100%`
3. 檢查控制台是否有 GeoJSON 載入錯誤

### 數據載入失敗

**問題：** GeoJSON 文件 404 錯誤

**解決方案：**

1. 確認文件路徑正確：`public/data/geojson/`
2. 檢查 `process.env.BASE_URL` 設置
3. 驗證 GeoJSON 格式有效性

### 圖層順序錯誤

**問題：** 某些圖層被其他圖層覆蓋

**解決方案：**

1. 調整 `initMap()` 中的繪製順序
2. 先繪製的圖層在下層
3. 使用 `layer.bringToFront()` 或 `layer.bringToBack()` 動態調整

### 性能問題

**問題：** 大量數據時地圖卡頓

**解決方案：**

1. 啟用 Canvas 渲染：`preferCanvas: true`
2. 簡化 GeoJSON 幾何（使用 mapshaper）
3. 使用圖層分組和控制器
4. 實現數據懶加載

## 🤝 貢獻指南

歡迎所有形式的貢獻！以下是參與方式：

### 報告問題

1. 在
   [Issues](https://github.com/kevin7261/30DayMapChallenge-14_Data-challenge-OpenStreetMap/issues)
   頁面創建新 Issue
2. 提供詳細的錯誤描述和復現步驟
3. 附上螢幕截圖或錯誤日誌

### 提交代碼

1. **Fork 專案**

   ```bash
   # 在 GitHub 上點擊 Fork 按鈕
   ```

2. **克隆 Fork 的倉庫**

   ```bash
   git clone https://github.com/YOUR_USERNAME/30DayMapChallenge-14_Data-challenge-OpenStreetMap.git
   cd 30DayMapChallenge-14_Data-challenge-OpenStreetMap
   ```

3. **創建功能分支**

   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **提交更改**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **推送到 GitHub**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **創建 Pull Request**
   - 在 GitHub 上打開 Pull Request
   - 描述你的更改和目的
   - 等待代碼審查

### 代碼規範

- 遵循 ESLint 和 Prettier 配置
- 使用有意義的變數和函數名稱
- 添加必要的註釋
- 提交前運行 `npm run format`

### Commit 規範

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新功能
fix: 修復 bug
docs: 文檔更新
style: 代碼格式調整
refactor: 重構代碼
test: 測試相關
chore: 構建/工具相關
```

## 📄 授權

本專案採用 **MIT License** 授權。

```
MIT License

Copyright (c) 2024 Kevin Cheng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 數據授權

OpenStreetMap 數據採用
[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)
授權。

## 🙏 致謝

### 開源項目

- **[Leaflet](https://leafletjs.com/)** - 領先的開源地圖庫
- **[Vue.js](https://vuejs.org/)** - 漸進式 JavaScript 框架
- **[OpenStreetMap](https://www.openstreetmap.org/)** - 自由的世界地圖
- **[Pinia](https://pinia.vuejs.org/)** - Vue 3 狀態管理
- **[Bootstrap](https://getbootstrap.com/)** - 流行的 CSS 框架

### 數據提供

- **OpenStreetMap 貢獻者** - 感謝全球志願者提供免費地理數據
- **Geofabrik** - 提供 OSM 數據下載服務

### 靈感來源

- **#30DayMapChallenge** - 由 Topi Tjukanov 發起的地圖挑戰
- **諾魯共和國** - 獨特的國旗配色靈感

## 📮 聯繫方式

- **GitHub**: [@kevin7261](https://github.com/kevin7261)
- **Project Link**:
  [30DayMapChallenge-14_Data-challenge-OpenStreetMap](https://github.com/kevin7261/30DayMapChallenge-14_Data-challenge-OpenStreetMap)

## 📌 項目狀態

- ✅ **開發中**
- 🚀 **已部署** @ GitHub Pages
- 📅 **最後更新**: 2024

---

<div align="center">

**#30DayMapChallenge** 🗺️ **Day 14**: Data Challenge - OpenStreetMap

Made with ❤️ using Vue 3 + Leaflet

🇳🇷 Inspired by the flag of Nauru

[⬆ 回到頂部](#-30-day-map-challenge---day-14-data-challenge---openstreetmap)

</div>
