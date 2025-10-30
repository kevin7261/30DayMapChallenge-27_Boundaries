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
   *    ✓ 載入 總統_得票地圖_合併.geojson
   *    ✓ 繪製所有台灣直轄市、縣(市)界線
   *    ✓ 根據最高得票率進行顏色編碼
   *
   * 2. 歷史邊界渲染：
   *    ✓ 載入 乾隆臺灣番界.geojson
   *    ✓ 繪製乾隆十五年及二十五年番界線
   *    ✓ 淺灰色半透明填充作為背景層
   *
   * 3. 登革熱網格渲染：
   *    ✓ 載入 dengue_grid_counts_1km_2023_land_only.geojson
   *    ✓ 根據 level 屬性繪製5級風險等級網格
   *    ✓ 只顯示病例數 > 0 的網格
   *    ✓ 使用5級色票：深藍(1) → 綠(2) → 黃橙(3) → 橙(4) → 紅(5)（最上層）
   *
   * 4. 視覺元素：
   *    ✓ 歷史邊界：淺灰色半透明填充，中灰邊框（底層）
   *    ✓ 縣市界線：根據最高得票率填充顏色，深灰邊框（中層）
   *    ✓ 登革熱網格：5級色票填充，無邊框（最上層）
   *    ✓ 淺灰色地圖背景
   *
   * 5. 交互功能：
   *    ✓ 滾輪縮放控制
   *    ✓ 拖動平移導航
   *    ✓ 滑鼠懸停顯示得票率資訊
   *    ✓ 縣市區域高亮效果
   *
   * ─────────────────────────────────────────────────────────────────────────
   * 🎨 配色主題
   * ─────────────────────────────────────────────────────────────────────────
   * 淺灰色    #f5f5f5  → 地圖背景
   * 歷史邊界：
   *   淺灰色  #e0e0e0  → 乾隆番界填充
   *   中灰色  #999999  → 乾隆番界邊框
   * 縣市邊界：
   *   深灰色  #333333  → 縣市邊框
   * 得票率顏色編碼：
   *   白色    #ffffff  → 柯文哲 吳欣盈 (最高得票率)
   *   綠色    #4caf50  → 賴清德 蕭美琴 (最高得票率)
   *   藍色    #2196f3  → 侯友宜 趙少康 (最高得票率)
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
   * 縣市邊界：總統_得票地圖_合併.geojson
   * 歷史邊界：乾隆臺灣番界.geojson
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
       * 來源：總統_得票地圖_合併.geojson
       * @type {Ref<Object|null>}
       */
      const countyData = ref(null);

      /**
       * 乾隆臺灣番界 GeoJSON 數據
       * 來源：乾隆臺灣番界.geojson
       * @type {Ref<Object|null>}
       */
      const historicalBoundaryData = ref(null);

      /**
       * 📥 載入直轄市、縣(市)界線 GeoJSON 數據
       */
      const loadCountyData = async () => {
        try {
          console.log('[MapTab] 開始載入直轄市、縣(市)界線 GeoJSON 數據...');

          // 載入縣市 GeoJSON 檔案
          const countyResponse = await fetch(
            `${process.env.BASE_URL}data/geojson/總統_得票地圖_合併.geojson`
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
       * 📥 載入乾隆臺灣番界 GeoJSON 數據
       */
      const loadHistoricalBoundaryData = async () => {
        try {
          console.log('[MapTab] 開始載入乾隆臺灣番界 GeoJSON 數據...');

          // 載入歷史邊界 GeoJSON 檔案
          const historicalResponse = await fetch(
            `${process.env.BASE_URL}data/geojson/乾隆臺灣番界.geojson`
          );

          // 檢查響應
          if (!historicalResponse.ok) {
            throw new Error(`乾隆臺灣番界數據載入失敗: HTTP ${historicalResponse.status}`);
          }

          // 解析 JSON
          historicalBoundaryData.value = await historicalResponse.json();

          console.log('[MapTab] 乾隆臺灣番界數據載入成功');
          console.log('  - 邊界線數量:', historicalBoundaryData.value.features?.length || 0);

          return true;
        } catch (error) {
          console.error('[MapTab] 乾隆臺灣番界數據載入失敗:', error);
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
       * 🎨 根據得票率決定顏色
       * @param {Object} properties - GeoJSON 屬性
       * @returns {string} 顏色代碼
       */
      const getColorByVotePercentage = (properties) => {
        const vote1 = properties['(1) 得票率 (%)'] || 0;
        const vote2 = properties['(2) 得票率 (%)'] || 0;
        const vote3 = properties['(3) 得票率 (%)'] || 0;

        // 找出最高得票率
        const maxVote = Math.max(vote1, vote2, vote3);

        // 根據最高得票率決定顏色
        if (maxVote === vote1) {
          return '#ffffff'; // 白色 - 柯文哲 吳欣盈
        } else if (maxVote === vote2) {
          return '#4caf50'; // 綠色 - 賴清德 蕭美琴
        } else {
          return '#2196f3'; // 藍色 - 侯友宜 趙少康
        }
      };

      /**
       * 🗺️ 繪製乾隆臺灣番界
       */
      const drawHistoricalBoundary = () => {
        if (!g || !historicalBoundaryData.value) {
          console.error(
            '[MapTab] 無法繪製乾隆臺灣番界: g=',
            !!g,
            'historicalBoundaryData=',
            !!historicalBoundaryData.value
          );
          return;
        }

        try {
          console.log('[MapTab] 開始繪製乾隆臺灣番界 GeoJSON');

          const getHistoricalStroke = (name) => {
            if (name === '紅線') return '#e53935'; // 紅
            if (name === '藍線') return '#1e88e5'; // 藍
            if (name === '紫線') return '#8e24aa'; // 紫
            if (name && name.includes('藍線暫定界')) return '#1e88e5'; // 暫定界用藍色
            return '#999999';
          };

          const getDashArray = (name) => {
            if (name && name.includes('暫定界')) return '6,4';
            return null;
          };

          // 繪製歷史邊界線（以 polyline 呈現，無填色）
          g.selectAll('.historical-boundary')
            .data(historicalBoundaryData.value.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'historical-boundary')
            .attr('fill', 'none')
            .attr('stroke', (d) => getHistoricalStroke(d.properties?.name))
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.95)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-dasharray', (d) => getDashArray(d.properties?.name))
            .on('mouseover', function (event, d) {
              // 顯示工具提示
              const properties = d.properties;
              const tooltipContent = `
                <div style="font-weight: bold; margin-bottom: 4px;">${properties.name}</div>
                <div style="color: #666;">${properties.Note}</div>
              `;

              tooltip.innerHTML = tooltipContent;
              tooltip.style.opacity = '1';
            })
            .on('mousemove', function (event) {
              // 更新工具提示位置
              tooltip.style.left = event.pageX + 10 + 'px';
              tooltip.style.top = event.pageY - 10 + 'px';
            })
            .on('mouseout', function () {
              // 隱藏工具提示
              tooltip.style.opacity = '0';
            });

          console.log('[MapTab] 乾隆臺灣番界 GeoJSON 繪製完成');
        } catch (error) {
          console.error('[MapTab] 乾隆臺灣番界 GeoJSON 繪製失敗:', error);
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
            .attr('fill', (d) => getColorByVotePercentage(d.properties)) // 根據得票率填充顏色
            .attr('stroke', '#333333') // 深灰色邊框
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.8)
            .on('mouseover', function (event, d) {
              // 顯示工具提示
              const properties = d.properties;
              const vote1 = properties['(1) 得票率 (%)'] || 0;
              const vote2 = properties['(2) 得票率 (%)'] || 0;
              const vote3 = properties['(3) 得票率 (%)'] || 0;

              const tooltipContent = `
                <div style="font-weight: bold; margin-bottom: 4px;">${properties.COUNTYNAME} ${properties.TOWNNAME}</div>
                <div style="color: #ffffff;">柯文哲 吳欣盈: ${vote1.toFixed(1)}%</div>
                <div style="color: #4caf50;">賴清德 蕭美琴: ${vote2.toFixed(1)}%</div>
                <div style="color: #2196f3;">侯友宜 趙少康: ${vote3.toFixed(1)}%</div>
              `;

              tooltip.innerHTML = tooltipContent;
              tooltip.style.opacity = '1';
            })
            .on('mousemove', function (event) {
              // 更新工具提示位置
              tooltip.style.left = event.pageX + 10 + 'px';
              tooltip.style.top = event.pageY - 10 + 'px';
            })
            .on('mouseout', function () {
              // 隱藏工具提示
              tooltip.style.opacity = '0';
            });

          console.log('[MapTab] 直轄市、縣(市)界線 GeoJSON 繪製完成');
        } catch (error) {
          console.error('[MapTab] 直轄市、縣(市)界線 GeoJSON 繪製失敗:', error);
        }
      };

      /**
       * 🎛️ 切換顯示模式
       * @param {string} mode - 'map' 或 'grid'
       */
      const toggleDisplayMode = async () => {
        // 僅保留地圖模式
        displayMode.value = 'map';
        console.log('[MapTab] 切換顯示模式: map (grid 已停用)');

        if (displayMode.value === 'map') {
          // 地圖模式：需要地圖投影，載入縣市界線和歷史邊界
          if (!countyData.value) {
            await loadCountyData();
          }
          if (!historicalBoundaryData.value) {
            await loadHistoricalBoundaryData();
          }

          // 清除舊的 SVG（如果從其他模式切換過來）
          if (svg && !projection) {
            svg.remove();
            svg = null;
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
                .style('background', '#f5f5f5');

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

              // 重置縮放狀態，確保切換模式時不會受到之前模式的影響
              svg.call(zoom.transform, d3.zoomIdentity);

              createTooltip();
              isMapReady.value = true;
            }
          } else {
            // 如果已經創建了地圖，重置縮放狀態
            if (svg && zoom) {
              svg.call(zoom.transform, d3.zoomIdentity);
            }
          }
          // 先繪製縣市界線（底層）
          drawCounties();
          // 再繪製歷史邊界（最上層）
          if (historicalBoundaryData.value) {
            drawHistoricalBoundary();
          }
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
            .style('background', '#f5f5f5'); // 淺灰色背景

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

          // 重置縮放狀態，確保切換模式時不會受到之前模式的影響
          svg.call(zoom.transform, d3.zoomIdentity);

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
          // 地圖模式：載入縣市界線和歷史邊界數據
          console.log('[MapTab] 開始載入地圖模式數據...');
          const countyLoaded = await loadCountyData();
          const historicalLoaded = await loadHistoricalBoundaryData();

          if (!countyLoaded) {
            console.error('[MapTab] 無法載入縣市界線數據');
            return;
          }

          if (!historicalLoaded) {
            console.warn('[MapTab] 無法載入乾隆臺灣番界數據，將只顯示縣市界線');
          }

          console.log('[MapTab] 數據載入完成，開始創建地圖');

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
              // 再繪製歷史邊界（最上層）
              if (historicalBoundaryData.value) {
                drawHistoricalBoundary();
              }
            } else {
              console.log('[MapTab] 地圖創建失敗，100ms 後重試');
              setTimeout(tryCreateMap, 100);
            }
          };

          tryCreateMap();
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
  </div>
</template>

<style scoped>
  @import '../assets/css/common.css';

  #map-container {
    overflow: hidden;
    background: #f5f5f5; /* 淺灰色背景，確保容器底色不是白色 */
  }

  :deep(.leaflet-container) {
    background: #f5f5f5; /* 淺灰色背景 */
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
    background-color: rgba(0, 0, 0, 0.9); /* 深色半透明背景 */
    color: #fff; /* 白色文字 */
    border: 2px solid #fff; /* 白色邊框 */
    border-radius: 8px; /* 圓角 */
    padding: 12px; /* 內邊距 */
    font-size: 14px; /* 字體大小 */
    font-family: 'Arial', sans-serif; /* 字體 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* 陰影 */
    z-index: 1000; /* 確保在最上層 */
    max-width: 250px; /* 最大寬度 */
    line-height: 1.4; /* 行高 */
  }
</style>
