# 🌍 22_Data challenge-Natural Earth - 世界國家地圖

一個基於 Vue 3 和 D3.js 的全屏世界地圖應用程式，使用麥卡托投影顯示 Natural
Earth 數據。

## 📋 目錄

- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [專案結構](#專案結構)
- [安裝與運行](#安裝與運行)
- [使用說明](#使用說明)
- [API 文檔](#api-文檔)
- [開發指南](#開發指南)
- [部署說明](#部署說明)

## ✨ 功能特色

### 🗺️ 地圖功能

- **全屏世界地圖**: 地圖自動適應瀏覽器窗口大小，無邊距全屏顯示
- **麥卡托投影**: 使用標準的麥卡托投影 (Mercator Projection)
- **經緯度網格**: 顯示每 30 度的經緯度網格線
- **Natural Earth 數據**: 使用高品質的 Natural Earth 地理數據
- **響應式設計**: 自動適配各種設備和窗口尺寸

### 🎨 視覺設計

- **國家著色**: 台灣（紅色）、參展國家（淺藍色）、其他國家（淺灰色）
- **清晰邊界**: 深灰色國家邊界線
- **網格輔助**: 淺灰色虛線經緯度網格
- **簡潔界面**: 無控制面板，專注於地圖本身

### 🚀 技術特色

- **Vue 3 Composition API**: 現代化的 Vue 開發模式
- **D3.js 地圖繪製**: 強大的數據視覺化庫
- **Pinia 狀態管理**: 高效的響應式狀態管理
- **模組化架構**: 清晰的代碼組織和維護性

## 🏗️ 技術架構

### 前端技術棧

- **Vue 3.3+**: 前端框架
- **D3.js 7.8+**: 數據視覺化和地圖繪製庫
- **Pinia**: 狀態管理
- **Bootstrap 5**: UI 框架
- **Vue CLI**: 構建工具

### 核心組件

- **HomeView**: 主頁面組件，提供全屏地圖容器
- **MapTab**: 地圖顯示組件，使用 D3.js 繪製麥卡托投影世界地圖
- **dataStore**: 數據管理，處理國家數據
- **defineStore**: 配置管理，處理地圖狀態

## 📁 專案結構

```
22_Data-challenge-Natural-Earth/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── css/               # 樣式文件
│   │       ├── common.css     # 通用樣式
│   │       └── variables.css  # CSS 變數
│   ├── stores/
│   │   ├── dataStore.js       # 國家數據存儲
│   │   └── defineStore.js     # 配置存儲
│   ├── tabs/
│   │   └── MapTab.vue         # 地圖組件
│   ├── views/
│   │   └── HomeView.vue       # 主頁面
│   ├── main.js                # 應用入口
│   └── router/
│       └── index.js           # 路由配置
├── package.json
└── README.md
```

## 🚀 安裝與運行

### 環境要求

- Node.js 16.0+
- npm 7.0+ 或 yarn 1.22+

### 安裝步驟

1. **克隆專案**

   ```bash
   git clone https://github.com/kevin7261/30DayMapChallenge-22_Data-challenge-Natural-Earth.git
   cd 30DayMapChallenge-22_Data-challenge-Natural-Earth
   ```

2. **安裝依賴**

   ```bash
   npm install
   # 或
   yarn install
   ```

3. **啟動開發服務器**

   ```bash
   npm run serve
   # 或
   yarn serve
   ```

4. **構建生產版本**
   ```bash
   npm run build
   # 或
   yarn build
   ```

### 開發服務器

- 本地地址:
  `http://localhost:8080/30DayMapChallenge-22_Data-challenge-Natural-Earth/`
- 網路地址:
  `http://[your-ip]:8080/30DayMapChallenge-22_Data-challenge-Natural-Earth/`

## 📖 使用說明

### 基本操作

1. **地圖顯示**

   - 開啟網頁後，地圖會自動填滿整個瀏覽器窗口
   - 使用麥卡托投影以本初子午線和赤道交點為中心
   - 顯示全球所有國家和地區

2. **視覺元素**

   - **台灣**：以紅色標示
   - **參展國家**：以淺藍色標示
   - **其他國家**：以淺灰色標示
   - **經緯度網格**：每 30 度顯示一條淺灰色虛線

3. **響應式調整**
   - 調整瀏覽器窗口大小時，地圖會自動重新適應
   - 保持最佳的地圖顯示比例

## 📚 技術細節

### 地圖投影

- **投影類型**: 麥卡托投影 (Mercator Projection)
- **投影中心**: [0, 0] (本初子午線和赤道交點)
- **自動縮放**: 使用 `fitSize()` 自動調整以適應容器

### 數據來源

- **Natural Earth**: 使用 110m 解析度的國家邊界數據
- **檔案格式**: GeoJSON
- **檔案位置**: `/public/data/ne_110m_admin_0_countries.geojson`

### 國家著色規則

```javascript
// dataStore.js 中的邏輯
isHomeCountry(countryName); // 台灣 → 紅色 (#ff9999)
isCountryVisited(countryName); // 參展 → 淺藍色 (#cce5ff)
// 其他 → 淺灰色 (#d0d0d0)
```

## 🛠️ 開發指南

### 修改國家著色

1. **編輯著色邏輯**

   在 `src/stores/dataStore.js` 中修改：

   ```javascript
   isHomeCountry(countryName) {
     // 修改判斷邏輯
     return countryName === 'Taiwan' || countryName === 'ROC';
   }

   isCountryVisited(countryName) {
     const visitedCountries = ['Japan', 'USA', 'France', 'Germany'];
     return visitedCountries.includes(countryName);
   }
   ```

2. **修改顏色**

   在 `src/tabs/MapTab.vue` 的 `drawWorldMap()` 函數中：

   ```javascript
   .attr('fill', (d) => {
     const countryName = d.properties.name || d.properties.ADMIN;
     if (dataStore.isHomeCountry(countryName)) return '#ff9999'; // 台灣
     if (dataStore.isCountryVisited(countryName)) return '#cce5ff'; // 參展
     return '#d0d0d0'; // 其他
   })
   ```

### 調整投影設置

在 `src/tabs/MapTab.vue` 的 `createMap()` 函數中：

```javascript
projection = d3
  .geoMercator()
  .center([0, 0]) // 修改投影中心
  .fitSize([width, height], worldData.value);
```

### 開發工具

- **Vue DevTools**: 調試 Vue 組件和狀態
- **D3.js Debug**: 使用瀏覽器開發者工具調試 SVG 和投影
- **ESLint**: 代碼質量檢查

## 🚀 部署說明

### GitHub Pages 部署

1. **構建專案**

   ```bash
   npm run build
   ```

2. **部署到 GitHub Pages**

   ```bash
   npm run deploy
   ```

3. **訪問網站**

   ```
   https://kevin7261.github.io/30DayMapChallenge-22_Data-challenge-Natural-Earth/
   ```

### 環境變數

創建 `.env` 文件配置環境變數：

```env
# 開發環境
NODE_ENV=development
VUE_APP_API_URL=http://localhost:3000

# 生產環境
NODE_ENV=production
VUE_APP_API_URL=https://your-api-domain.com
```

### 性能優化

1. **代碼分割**: 使用動態導入減少初始包大小
2. **圖片優化**: 移除不必要的 GeoJSON 文件
3. **緩存策略**: 配置適當的 HTTP 緩存頭

## 🤝 貢獻指南

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 查看 [LICENSE](LICENSE) 文件了解詳情。

## 📞 聯繫方式

- 專案維護者: [Your Name]
- 電子郵件: [your.email@example.com]
- 專案連結:
  [https://github.com/kevin7261/30DayMapChallenge-22_Data-challenge-Natural-Earth](https://github.com/kevin7261/30DayMapChallenge-22_Data-challenge-Natural-Earth)

## 🙏 致謝

- [D3.js](https://d3js.org/) - 數據視覺化庫
- [Natural Earth](https://www.naturalearthdata.com/) - 免費地理數據
- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [Bootstrap](https://getbootstrap.com/) - CSS 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 狀態管理庫

---

**22_Data challenge-Natural Earth** - 探索世界國家的點之美 🌍✨
