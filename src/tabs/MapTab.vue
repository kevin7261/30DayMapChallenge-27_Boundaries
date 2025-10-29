<script>
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * 🗺️ MapTab.vue - D3.js 台灣地圖組件
   * ═══════════════════════════════════════════════════════════════════════════
   *
   * @fileoverview
   * 這是一個基於 D3.js 的台灣地圖視覺化組件，同時顯示縣市界線和登革熱網格數據。
   * 本組件負責載入、處理和渲染台灣直轄市、縣(市)界線和登革熱病例網格數據。
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 📋 核心功能
   * ─────────────────────────────────────────────────────────────────────────
   * 1. 縣市邊界渲染：
   *    ✓ 載入直轄市、縣(市)界線1140318.geojson
   *    ✓ 繪製所有台灣直轄市、縣(市)界線
   *
   * 2. 登革熱網格渲染：
   *    ✓ 載入 dengue_grid_counts_1km_2023_land_only.geojson
   *    ✓ 根據 level 屬性繪製5級風險等級網格
   *    ✓ 只顯示病例數 > 0 的網格
   *    ✓ 使用5級色票：深藍(1) → 綠(2) → 黃橙(3) → 橙(4) → 紅(5)（最上層）
   *
   * 3. 視覺元素：
   *    ✓ 縣市界線：淺灰細邊框，無填充（底層）
   *    ✓ 登革熱網格：5級色票填充，無邊框（最上層）
   *    ✓ 白色地圖背景
   *
   * 4. 交互功能：
   *    ✓ 滾輪縮放控制
   *    ✓ 拖動平移導航
   *    ✓ 滑鼠懸停顯示網格屬性資訊
   *    ✓ 網格高亮效果
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🎨 配色主題
   * ─────────────────────────────────────────────────────────────────────────
   * 白色      #ffffff  → 地圖背景
   * 淺灰色    #cccccc  → 縣市邊框
   * 無填充    none     → 縣市區域
   * 5級色票            → 登革熱風險等級（最上層）
   *   Level 1  #1a237e → 深藍色
   *   Level 2  #4caf50 → 綠色
   *   Level 3  #fbc02d → 黃橙色
   *   Level 4  #ff6f00 → 橙色
   *   Level 5  #d32f2f → 紅色
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🛠️ 技術棧
   * ─────────────────────────────────────────────────────────────────────────
   * @requires vue                 - Vue 3.2+ (Composition API)
   * @requires d3                  - D3.js 7.8+ (地圖繪製庫)
   * @requires @/stores/dataStore  - Pinia 狀態管理
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 📁 數據來源
   * ─────────────────────────────────────────────────────────────────────────
   * 直轄市、縣(市)界線：直轄市、縣(市)界線1140318.geojson
   * 登革熱網格數據：dengue_grid_counts_1km_2023_land_only.geojson
   * 路徑：public/data/geojson/
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🔧 使用方式
   * ─────────────────────────────────────────────────────────────────────────
   * <MapTab @map-ready="handleMapReady" />
   *
   * @event map-ready - 地圖初始化完成時觸發，返回地圖實例
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 📝 維護者
   * ─────────────────────────────────────────────────────────────────────────
   * @author Kevin Cheng
   * @version 4.0.0
   * @since 2024
   * @license MIT
   *
   * ═══════════════════════════════════════════════════════════════════════════
   */

  // ═══════════════════════════════════════════════════════════════════════════
  // 📦 依賴導入 (Dependencies Import)
  // ═══════════════════════════════════════════════════════════════════════════

  // Vue 3 核心功能
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  // D3.js 地圖庫
  import * as d3 from 'd3';

  // Pinia 狀態管理
  import { useDataStore } from '@/stores/dataStore';

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 組件定義 (Component Definition)
  // ═══════════════════════════════════════════════════════════════════════════

  export default {
    name: 'MapTab',

    // 組件觸發的事件
    emits: [
      'map-ready', // 地圖初始化完成時觸發，傳遞地圖實例
    ],

    /**
     * ───────────────────────────────────────────────────────────────────────
     * 🎬 組件設置函數 (Component Setup Function)
     * ───────────────────────────────────────────────────────────────────────
     * 使用 Vue 3 Composition API 設置組件邏輯
     *
     * @param {Object} _ - Props（本組件不使用）
     * @param {Object} context - 設置上下文
     * @param {Function} context.emit - 事件觸發函數
     * @returns {Object} 返回模板可用的響應式數據和方法
     */
    setup(_, { emit }) {
      // ═══════════════════════════════════════════════════════════════════════
      // 📦 狀態管理與依賴 (State Management & Dependencies)
      // ═══════════════════════════════════════════════════════════════════════

      // Pinia 數據存儲（保留供未來擴展使用）
      // eslint-disable-next-line no-unused-vars
      const dataStore = useDataStore();

      // ═══════════════════════════════════════════════════════════════════════
      // 🗺️ 地圖相關變數 (Map-Related Variables)
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * 地圖 DOM 容器引用
       * @type {Ref<HTMLElement|null>}
       */
      const mapContainer = ref(null);

      /**
       * D3.js SVG 元素
       * @type {d3.Selection|null}
       */
      let svg = null;

      /**
       * D3.js 投影函數
       * @type {d3.GeoProjection|null}
       */
      let projection = null;

      /**
       * D3.js 路徑生成器
       * @type {d3.GeoPath|null}
       */
      let path = null;

      /**
       * D3.js 縮放行為
       * @type {d3.ZoomBehavior|null}
       */
      let zoom = null;

      /**
       * SVG 主容器組
       * @type {d3.Selection|null}
       */
      let g = null;

      /**
       * 工具提示元素
       * @type {HTMLElement|null}
       */
      let tooltip = null;

      // ═══════════════════════════════════════════════════════════════════════
      // 🎛️ 控制狀態 (Control States)
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * 地圖就緒狀態標記
       * true = 地圖已初始化完成，false = 尚未初始化
       * @type {Ref<boolean>}
       */
      const isMapReady = ref(false);

      /**
       * 地圖容器唯一 ID
       * 使用隨機字符串確保多實例時不會衝突
       * @type {Ref<string>}
       */
      const mapContainerId = ref(`leaflet-map-${Math.random().toString(36).substr(2, 9)}`);

      /**
       * 顯示模式
       * 'map' = 使用地圖投影顯示（目前結果）
       * 'grid' = 直接使用 grid_x, grid_y 繪製網格
       * @type {Ref<string>}
       */
      const displayMode = ref('map');

      // ═══════════════════════════════════════════════════════════════════════
      // 📊 GeoJSON 數據儲存 (GeoJSON Data Storage)
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * 縣市 GeoJSON 數據
       * 來源：直轄市、縣(市)界線1140318.geojson
       * @type {Ref<Object|null>}
       */
      const countyData = ref(null);

      /**
       * 登革熱網格 GeoJSON 數據
       * 來源：dengue_grid_counts_1km_2023_land_only.geojson
       * @type {Ref<Object|null>}
       */
      const dengueData = ref(null);

      /**
       * 📥 載入直轄市、縣(市)界線 GeoJSON 數據
       */
      const loadCountyData = async () => {
        try {
          console.log('[MapTab] 開始載入直轄市、縣(市)界線 GeoJSON 數據...');

          // 載入縣市 GeoJSON 檔案
          const countyResponse = await fetch(
            `${process.env.BASE_URL}data/geojson/直轄市、縣(市)界線1140318.geojson`
          );

          // 檢查響應
          if (!countyResponse.ok) {
            throw new Error(`直轄市、縣(市)界線數據載入失敗: HTTP ${countyResponse.status}`);
          }

          // 解析 JSON
          countyData.value = await countyResponse.json();

          console.log('[MapTab] 直轄市、縣(市)界線數據載入成功');
          console.log('  - 縣市數量:', countyData.value.features?.length || 0);

          return true;
        } catch (error) {
          console.error('[MapTab] 直轄市、縣(市)界線數據載入失敗:', error);
          return false;
        }
      };

      /**
       * 🛠️ 創建工具提示元素
       */
      const createTooltip = () => {
        if (!mapContainer.value) return;

        // 移除已存在的工具提示
        const existingTooltip = mapContainer.value.querySelector('.map-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }

        // 創建新的工具提示元素
        tooltip = document.createElement('div');
        tooltip.className = 'map-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.padding = '4px 8px';

        mapContainer.value.appendChild(tooltip);
        console.log('[MapTab] 工具提示元素創建成功');
      };

      /**
       * 📥 載入登革熱網格 GeoJSON 數據
       */
      const loadDengueData = async () => {
        try {
          console.log('[MapTab] 開始載入登革熱網格 GeoJSON 數據...');

          // 載入登革熱網格 GeoJSON 檔案
          const dengueResponse = await fetch(
            `${process.env.BASE_URL}data/geojson/dengue_grid_counts_1km_2023_land_only.geojson`
          );

          // 檢查響應
          if (!dengueResponse.ok) {
            throw new Error(`登革熱網格數據載入失敗: HTTP ${dengueResponse.status}`);
          }

          // 解析 JSON
          dengueData.value = await dengueResponse.json();

          console.log('[MapTab] 登革熱網格數據載入成功');
          console.log('  - 網格數量:', dengueData.value.features?.length || 0);

          return true;
        } catch (error) {
          console.error('[MapTab] 登革熱網格數據載入失敗:', error);
          return false;
        }
      };

      /**
       * 🗺️ 繪製直轄市、縣(市)界線
       */
      const drawCounties = () => {
        if (!g || !countyData.value) {
          console.error(
            '[MapTab] 無法繪製直轄市、縣(市)界線: g=',
            !!g,
            'countyData=',
            !!countyData.value
          );
          return;
        }

        try {
          console.log('[MapTab] 開始繪製直轄市、縣(市)界線 GeoJSON');

          // 繪製所有縣市
          g.selectAll('.county')
            .data(countyData.value.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'county')
            .attr('fill', 'none') // 不填充
            .attr('stroke', '#cccccc') // 淺灰色邊框
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.6);

          console.log('[MapTab] 直轄市、縣(市)界線 GeoJSON 繪製完成');
        } catch (error) {
          console.error('[MapTab] 直轄市、縣(市)界線 GeoJSON 繪製失敗:', error);
        }
      };

      /**
       * 🏗️ 創建網格畫布（不依賴地圖投影）
       * 用於 grid 模式，直接使用 grid_x, grid_y 繪製
       */
      const createGridCanvas = () => {
        if (!mapContainer.value) return false;

        const rect = mapContainer.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('[MapTab] 容器尺寸為零，延遲初始化');
          return false;
        }

        try {
          // 清除舊的 SVG
          if (svg) {
            svg.remove();
          }

          const width = rect.width;
          const height = rect.height;

          // 創建 SVG 元素（不帶地圖投影）
          svg = d3
            .select(mapContainer.value)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#ffffff'); // 白色背景

          // 創建容器組（不使用地圖投影）
          g = svg.append('g');

          // 設置縮放行為（用於網格縮放）
          zoom = d3
            .zoom()
            .scaleExtent([0.5, 50]) // 允許縮放 0.5x 到 50x
            .on('zoom', (event) => {
              g.attr('transform', event.transform);
            });

          svg.call(zoom);

          // 創建工具提示元素
          createTooltip();

          isMapReady.value = true;

          console.log('[MapTab] 網格畫布創建成功');
          return true;
        } catch (error) {
          console.error('[MapTab] 網格畫布創建失敗:', error);
          return false;
        }
      };

      /**
       * 🗺️ 繪製網格（使用 grid_x, grid_y，不使用座標）
       * 完全獨立的實現，不依賴地圖投影
       */
      const drawGridOnly = () => {
        if (!g || !dengueData.value) {
          console.error('[MapTab] 無法繪製網格: g=', !!g, 'dengueData=', !!dengueData.value);
          return;
        }

        try {
          console.log('[MapTab] 開始繪製網格（使用 grid_x, grid_y）');

          // 清除舊的網格
          g.selectAll('.dengue-grid').remove();

          // 顏色映射
          const levelColors = {
            0: '#e0e0e0', // 淡灰色（level 0）
            1: '#1a237e', // 深藍色（深色）
            2: '#4caf50', // 綠色（較亮）
            3: '#fbc02d', // 黃橙色（金色）
            4: '#ff6f00', // 橙色（明亮）
            5: '#d32f2f', // 紅色（深色）
          };

          // 顏色映射函數
          const getColorByLevel = (level) => {
            if (level === 0 || level === null || level === undefined) {
              return levelColors[0];
            }
            return levelColors[level] || levelColors[1];
          };

          // 透明度映射函數
          const getOpacityByLevel = (level) => {
            const levelNum = level || 0;
            const opacityMap = {
              0: 0.5,
              1: 0.7,
              2: 0.75,
              3: 0.8,
              4: 0.85,
              5: 0.9,
            };
            return opacityMap[levelNum] || opacityMap[0];
          };

          // 過濾有 grid_x 和 grid_y 的數據
          const gridsWithXY = dengueData.value.features.filter(
            (d) =>
              d.properties.grid_x !== null &&
              d.properties.grid_x !== undefined &&
              d.properties.grid_y !== null &&
              d.properties.grid_y !== undefined
          );

          if (gridsWithXY.length === 0) {
            console.error('[MapTab] 無法找到 grid_x 或 grid_y 屬性');
            return;
          }

          // 計算 grid_x 和 grid_y 的範圍
          const gridXValues = gridsWithXY.map((d) => d.properties.grid_x);
          const gridYValues = gridsWithXY.map((d) => d.properties.grid_y);

          const minX = d3.min(gridXValues);
          const maxX = d3.max(gridXValues);
          const minY = d3.min(gridYValues);
          const maxY = d3.max(gridYValues);

          console.log('[MapTab] Grid 範圍:', { minX, maxX, minY, maxY });

          // 獲取 SVG 尺寸
          const svgWidth = +svg.attr('width') || mapContainer.value.getBoundingClientRect().width;
          const svgHeight =
            +svg.attr('height') || mapContainer.value.getBoundingClientRect().height;

          // 創建比例尺（帶有一些邊距）
          const padding = 50;
          const availableWidth = svgWidth - 2 * padding;
          const availableHeight = svgHeight - 2 * padding;

          // 計算 grid 範圍（包括邊界）
          const rangeX = maxX - minX + 1;
          const rangeY = maxY - minY + 1;

          // 計算理論單元大小（根據可用空間和範圍）
          const cellWidthFromX = availableWidth / rangeX;
          const cellHeightFromY = availableHeight / rangeY;

          // 使用較小的值作為統一的單元大小，確保所有網格都是正方形且能完整顯示
          const cellSize = Math.min(cellWidthFromX, cellHeightFromY);

          // 根據實際單元大小計算實際使用的空間
          const actualWidth = cellSize * rangeX;
          const actualHeight = cellSize * rangeY;

          // 計算居中偏移量
          const offsetX = (svgWidth - actualWidth) / 2;
          const offsetY = (svgHeight - actualHeight) / 2;

          // 創建比例尺（使用統一的單元大小，並居中顯示）
          const scaleX = d3
            .scaleLinear()
            .domain([minX, maxX + 1])
            .range([offsetX, offsetX + actualWidth]);
          // Y 軸：grid_y 最小值在上方，最大值在下方（SVG 坐標系：y=0 在頂部，向下遞增）
          const scaleY = d3
            .scaleLinear()
            .domain([minY, maxY + 1])
            .range([offsetY, offsetY + actualHeight]);

          console.log('[MapTab] Grid 單元大小:', {
            cellSize,
            rangeX,
            rangeY,
            cellWidthFromX,
            cellHeightFromY,
          });

          // 網格單元大小（統一為正方形）
          const cellWidth = cellSize;
          const cellHeight = cellSize;

          // 按 level 排序：level 0 在底層，level 1-5 在上層
          const sortedGrids = gridsWithXY.sort((a, b) => {
            const levelA = a.properties.level || 0;
            const levelB = b.properties.level || 0;
            return levelA - levelB;
          });

          // 繪製網格矩形
          g.selectAll('.dengue-grid')
            .data(sortedGrids)
            .enter()
            .append('rect')
            .attr('class', 'dengue-grid')
            .attr('x', (d) => scaleX(d.properties.grid_x))
            .attr('y', (d) => scaleY(d.properties.grid_y))
            .attr('width', cellWidth)
            .attr('height', cellHeight)
            .attr('fill', (d) => getColorByLevel(d.properties.level))
            .attr('fill-opacity', (d) => getOpacityByLevel(d.properties.level))
            .attr('stroke', 'none')
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
              d3.select(this).attr('fill-opacity', 1);
              if (tooltip) {
                const properties = d.properties;
                tooltip.innerHTML = `
                  <div>Grid ID: ${properties.grid_id || 'N/A'}</div>
                  <div>Grid X: ${properties.grid_x || 'N/A'}</div>
                  <div>Grid Y: ${properties.grid_y || 'N/A'}</div>
                  <div>Point Count: ${properties.point_count || 0}</div>
                  <div>Level: ${properties.level || 'N/A'}</div>
                `;
                const [mouseX, mouseY] = d3.pointer(event, mapContainer.value);
                tooltip.style.left = mouseX + 10 + 'px';
                tooltip.style.top = mouseY - 10 + 'px';
                tooltip.style.opacity = 1;
              }
            })
            .on('mousemove', function (event) {
              if (tooltip) {
                const [mouseX, mouseY] = d3.pointer(event, mapContainer.value);
                tooltip.style.left = mouseX + 10 + 'px';
                tooltip.style.top = mouseY - 10 + 'px';
              }
            })
            .on('mouseout', function (event, d) {
              const level = d.properties.level || 0;
              d3.select(this).attr('fill-opacity', getOpacityByLevel(level));
              if (tooltip) {
                tooltip.style.opacity = 0;
              }
            });

          console.log('[MapTab] 網格繪製完成');
          console.log('  - 網格數量:', sortedGrids.length);
        } catch (error) {
          console.error('[MapTab] 網格繪製失敗:', error);
        }
      };

      /**
       * 🎛️ 切換顯示模式
       * @param {string} mode - 'map' 或 'grid'
       */
      const toggleDisplayMode = async (mode) => {
        displayMode.value = mode;
        console.log('[MapTab] 切換顯示模式:', mode);

        if (displayMode.value === 'map') {
          // 地圖模式：需要地圖投影，載入縣市界線
          if (!countyData.value) {
            await loadCountyData();
          }
          if (!projection || !path) {
            // 如果還沒有創建地圖，先創建
            const rect = mapContainer.value.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const width = rect.width;
              const height = rect.height;

              // 清除舊的 SVG
              if (svg) {
                svg.remove();
              }

              // 創建 SVG 和地圖投影
              svg = d3
                .select(mapContainer.value)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', '#ffffff');

              projection = d3
                .geoMercator()
                .center([121, 23.5])
                .scale(12000)
                .translate([width / 2, height / 2]);

              path = d3.geoPath().projection(projection);
              g = svg.append('g');

              zoom = d3
                .zoom()
                .scaleExtent([0.5, 50])
                .on('zoom', (event) => {
                  g.attr('transform', event.transform);
                });

              svg.call(zoom);
              createTooltip();
              isMapReady.value = true;
            }
          }
          // 繪製縣市界線和登革熱網格
          drawCounties();
          drawDengueGrid();
        } else {
          // Grid 模式：不需要地圖投影，只載入登革熱數據，直接繪製網格
          if (!dengueData.value) {
            await loadDengueData();
          }
          // 清除縣市界線數據（不需要）
          countyData.value = null;
          // 創建網格畫布（不使用地圖投影）
          createGridCanvas();
          // 繪製網格
          drawGridOnly();
        }
      };

      /**
       * 🗺️ 繪製登革熱網格
       */
      const drawDengueGrid = () => {
        if (!g || !dengueData.value) {
          console.error('[MapTab] 無法繪製登革熱網格: g=', !!g, 'dengueData=', !!dengueData.value);
          return;
        }

        try {
          console.log('[MapTab] 開始繪製登革熱網格 GeoJSON');

          // 先清除舊的圖層，避免重複疊加造成數字與顏色不一致
          g.selectAll('.dengue-grid').remove();
          g.selectAll('.dengue-grid-label').remove();

          // 創建顏色映射，根據 level 值使用5級色票
          const maxLevel = d3.max(dengueData.value.features, (d) => d.properties.level);
          // 顏色映射：淡灰(0) → 深藍(1) → 綠(2) → 黃橙(3) → 橙(4) → 紅(5)
          const levelColors = {
            0: '#e0e0e0', // 淡灰色（level 0）
            1: '#1a237e', // 深藍色（深色）
            2: '#4caf50', // 綠色（較亮）
            3: '#fbc02d', // 黃橙色（金色）
            4: '#ff6f00', // 橙色（明亮）
            5: '#d32f2f', // 紅色（深色）
          };

          // 顏色映射函數
          const getColorByLevel = (level) => {
            // 如果 level 是 0 或未定義，返回淡灰色
            if (level === 0 || level === null || level === undefined) {
              return levelColors[0];
            }
            return levelColors[level] || levelColors[1];
          };

          // 透明度映射函數
          const getOpacityByLevel = (level) => {
            const levelNum = level || 0;
            const opacityMap = {
              0: 0.5, // level 0 淡灰色，較透明
              1: 0.7,
              2: 0.75,
              3: 0.8,
              4: 0.85,
              5: 0.9,
            };
            return opacityMap[levelNum] || opacityMap[0];
          };

          // 繪製所有網格（包括 level 0）
          // 按 level 排序：level 0 在底層，level 1-5 在上層
          const gridsWithData = dengueData.value.features.sort((a, b) => {
            const levelA = a.properties.level || 0;
            const levelB = b.properties.level || 0;
            return levelA - levelB; // 先繪製 level 0，再繪製 level 1-5
          });

          console.log('[DEBUG] 總共要繪製的網格數:', gridsWithData.length);

          // Map 模式：使用地圖投影繪製（使用 GeoJSON coordinates）
          console.log('[MapTab] 使用 Map 模式繪製（地圖投影）');

          // 繪製所有登革熱網格
          g.selectAll('.dengue-grid')
            .data(gridsWithData)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'dengue-grid')
            .attr('fill', (d) => getColorByLevel(d.properties.level))
            .attr('fill-opacity', (d) => getOpacityByLevel(d.properties.level))
            .attr('stroke', 'none')
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
              d3.select(this).attr('fill-opacity', 1);
              if (tooltip) {
                const properties = d.properties;
                tooltip.innerHTML = `
                  <div>Grid ID: ${properties.grid_id || 'N/A'}</div>
                  <div>Point Count: ${properties.point_count || 0}</div>
                  <div>Level: ${properties.level || 'N/A'}</div>
                `;
                const [mouseX, mouseY] = d3.pointer(event, mapContainer.value);
                tooltip.style.left = mouseX + 10 + 'px';
                tooltip.style.top = mouseY - 10 + 'px';
                tooltip.style.opacity = 1;
              }
            })
            .on('mousemove', function (event) {
              if (tooltip) {
                const [mouseX, mouseY] = d3.pointer(event, mapContainer.value);
                tooltip.style.left = mouseX + 10 + 'px';
                tooltip.style.top = mouseY - 10 + 'px';
              }
            })
            .on('mouseout', function (event, d) {
              const level = d.properties.level || 0;
              d3.select(this).attr('fill-opacity', getOpacityByLevel(level));
              if (tooltip) {
                tooltip.style.opacity = 0;
              }
            });

          console.log('[MapTab] 登革熱網格（地圖模式）繪製完成');
          console.log('  - 最大 level:', maxLevel);
        } catch (error) {
          console.error('[MapTab] 登革熱網格繪製失敗:', error);
        }
      };

      /**
       * 🏗️ 創建地圖實例
       * 初始化 D3.js 地圖並設定基本配置
       */
      const createMap = () => {
        if (!mapContainer.value) return false;

        const rect = mapContainer.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('[MapTab] 容器尺寸為零，延遲初始化');
          return false;
        }

        try {
          const width = rect.width;
          const height = rect.height;

          // 台灣中心位置：緯度 23.5°, 經度 121°

          // 創建 SVG 元素
          svg = d3
            .select(mapContainer.value)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#ffffff'); // 白色背景

          // 創建投影 - 麥卡托投影，聚焦在台灣
          projection = d3
            .geoMercator()
            .center([121, 23.5]) // 中心點在台灣
            .scale(12000) // 更大的縮放比例，更聚焦在台灣
            .translate([width / 2, height / 2]);

          // 創建路徑生成器
          path = d3.geoPath().projection(projection);

          // 創建容器組
          g = svg.append('g');

          // 設置縮放行為
          zoom = d3
            .zoom()
            .scaleExtent([0.5, 50]) // 允許縮放 0.5x 到 50x
            .on('zoom', (event) => {
              g.attr('transform', event.transform);
            });

          svg.call(zoom);

          // 創建工具提示元素
          createTooltip();

          isMapReady.value = true;

          // 將地圖實例傳遞給父組件
          emit('map-ready', { svg, projection, path });

          console.log('[MapTab] D3.js 地圖創建成功');
          return true;
        } catch (error) {
          console.error('[MapTab] D3.js 地圖創建失敗:', error);
          return false;
        }
      };

      /**
       * 🚀 初始化地圖
       * 根據初始顯示模式創建對應的視圖
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 根據顯示模式載入不同的數據
        if (displayMode.value === 'map') {
          // 地圖模式：需要載入縣市界線和登革熱數據
          console.log('[MapTab] 開始載入地圖模式數據...');
          const [countyLoaded, dengueLoaded] = await Promise.all([
            loadCountyData(),
            loadDengueData(),
          ]);

          if (!countyLoaded) {
            console.error('[MapTab] 無法載入直轄市、縣(市)界線數據');
            return;
          }

          if (!dengueLoaded) {
            console.error('[MapTab] 無法載入登革熱網格數據');
            return;
          }

          console.log('[MapTab] 所有數據載入完成，開始創建地圖');

          const tryCreateMap = async () => {
            if (attempts >= maxAttempts) {
              console.error('[MapTab] 地圖初始化失敗，已達到最大嘗試次數');
              return;
            }

            attempts++;
            console.log(`[MapTab] 嘗試創建地圖 (${attempts}/${maxAttempts})`);

            if (createMap()) {
              console.log('[MapTab] 地圖創建成功，開始繪製圖層');
              // 先繪製縣市界線（底層）
              drawCounties();
              // 再繪製登革熱網格（上層）
              drawDengueGrid();
            } else {
              console.log('[MapTab] 地圖創建失敗，100ms 後重試');
              setTimeout(tryCreateMap, 100);
            }
          };

          tryCreateMap();
        } else {
          // Grid 模式：只需要載入登革熱數據，不需要縣市界線
          console.log('[MapTab] 開始載入網格模式數據...');
          const dengueLoaded = await loadDengueData();

          if (!dengueLoaded) {
            console.error('[MapTab] 無法載入登革熱網格數據');
            return;
          }

          console.log('[MapTab] 數據載入完成，開始創建網格畫布');

          const tryCreateGrid = async () => {
            if (attempts >= maxAttempts) {
              console.error('[MapTab] 網格初始化失敗，已達到最大嘗試次數');
              return;
            }

            attempts++;
            console.log(`[MapTab] 嘗試創建網格畫布 (${attempts}/${maxAttempts})`);

            if (createGridCanvas()) {
              console.log('[MapTab] 網格畫布創建成功，開始繪製網格');
              drawGridOnly();
            } else {
              console.log('[MapTab] 網格畫布創建失敗，100ms 後重試');
              setTimeout(tryCreateGrid, 100);
            }
          };

          tryCreateGrid();
        }
      };

      // 🧹 生命週期：組件掛載
      onMounted(() => {
        nextTick(() => {
          initMap();
        });
      });

      // 🧹 生命週期：組件卸載
      onUnmounted(() => {
        if (svg) {
          svg.remove();
          svg = null;
        }

        // 清理工具提示
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }

        projection = null;
        path = null;
        zoom = null;
        g = null;
        isMapReady.value = false;
      });

      // 📤 返回組件公開的屬性和方法
      return {
        mapContainer,
        mapContainerId,
        displayMode,
        toggleDisplayMode,
      };
    },
  };
</script>

<template>
  <!-- 🗺️ 地圖主容器 -->
  <div id="map-container" class="h-100 w-100 position-relative bg-transparent z-0">
    <!-- 🗺️ Leaflet 地圖容器 -->
    <div :id="mapContainerId" ref="mapContainer" class="h-100 w-100"></div>

    <!-- 🎛️ 左側中間控制面板 -->
    <div
      class="position-absolute"
      style="top: 50%; left: 0; transform: translateY(-50%); z-index: 1000; padding: 1rem"
    >
      <div class="bg-dark bg-opacity-75 rounded-3 p-3">
        <!-- 🎛️ 顯示模式選擇區域 -->
        <div class="">
          <div class="d-flex flex-column gap-1">
            <button
              type="button"
              class="btn border-0 my-country-btn my-font-sm-white px-4 py-3"
              :class="[displayMode === 'map' ? 'active' : '']"
              @click="toggleDisplayMode('map')"
            >
              地圖模式
            </button>
            <button
              type="button"
              class="btn border-0 my-country-btn my-font-sm-white px-4 py-3"
              :class="[displayMode === 'grid' ? 'active' : '']"
              @click="toggleDisplayMode('grid')"
            >
              網格模式
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import '../assets/css/common.css';

  #map-container {
    overflow: hidden;
  }

  :deep(.leaflet-container) {
    background: #ffffff; /* 白色背景 */
  }

  :deep(.leaflet-popup-content-wrapper) {
    background: rgba(0, 43, 127, 0.95); /* 諾魯深藍色半透明 */
    color: #ffc61e; /* 金黃色文字 */
    border: 2px solid #ffc61e; /* 金黃色邊框 */
  }

  :deep(.leaflet-popup-tip) {
    background: rgba(0, 43, 127, 0.95); /* 諾魯深藍色半透明 */
  }

  :deep(.leaflet-tooltip) {
    background-color: rgba(0, 43, 127, 0.95) !important; /* 諾魯深藍色 */
    color: #ffc61e !important; /* 金黃色文字 */
    border: 1px solid #ffc61e !important; /* 金黃色邊框 */
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 4px;
    line-height: 1.4;
  }

  :deep(.map-tooltip) {
    background-color: #333; /* 深灰色背景 */
    color: #fff; /* 白色文字 */
    border: none; /* 無邊框 */
  }
</style>
