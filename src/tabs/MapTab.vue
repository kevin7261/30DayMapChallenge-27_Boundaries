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

          // 繪製所有網格（包括 level 0）
          // 按 level 排序：level 0 在底層，level 1-5 在上層
          const gridsWithData = dengueData.value.features.sort((a, b) => {
            const levelA = a.properties.level || 0;
            const levelB = b.properties.level || 0;
            return levelA - levelB; // 先繪製 level 0，再繪製 level 1-5
          });

          console.log('[DEBUG] 總共要繪製的網格數:', gridsWithData.length);
          console.log(
            '[DEBUG] 前 5 個網格的 level:',
            gridsWithData.slice(0, 5).map((d) => ({
              grid_id: d.properties.grid_id,
              level: d.properties.level,
              point_count: d.properties.point_count,
            }))
          );

          // 繪製所有登革熱網格
          g.selectAll('.dengue-grid')
            .data(gridsWithData)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'dengue-grid')
            .attr('fill', (d) => {
              const color = getColorByLevel(d.properties.level);
              // Debug: 只記錄前 10 個
              if (gridsWithData.indexOf(d) < 10) {
                console.log(
                  '[DEBUG] Grid',
                  d.properties.grid_id,
                  '- level:',
                  d.properties.level,
                  ', color:',
                  color
                );
              }
              return color;
            })
            .attr('fill-opacity', (d) => {
              const level = d.properties.level || 0;
              // 根據 level 調整透明度，level 越高越不透明
              const opacityMap = {
                0: 0.5, // level 0 淡灰色，較透明
                1: 0.7,
                2: 0.75,
                3: 0.8,
                4: 0.85,
                5: 0.9,
              };
              return opacityMap[level] || opacityMap[0];
            })
            .attr('stroke', 'none') // 移除邊框
            .style('cursor', 'pointer') // 添加手型游標
            .on('mouseover', function (event, d) {
              // 高亮效果：增加透明度
              d3.select(this).attr('fill-opacity', 1);

              // 顯示工具提示
              if (tooltip) {
                const properties = d.properties;
                tooltip.innerHTML = `
                  <div>Grid ID: ${properties.grid_id || 'N/A'}</div>
                  <div>Point Count: ${properties.point_count || 0}</div>
                  <div>Level: ${properties.level || 'N/A'}</div>
                `;

                // 獲取滑鼠位置
                const [mouseX, mouseY] = d3.pointer(event, mapContainer.value);

                // 設置工具提示位置
                tooltip.style.left = mouseX + 10 + 'px';
                tooltip.style.top = mouseY - 10 + 'px';
                tooltip.style.opacity = 1;
              }
            })
            .on('mousemove', function (event) {
              // 更新工具提示位置
              if (tooltip) {
                const [mouseX, mouseY] = d3.pointer(event, mapContainer.value);
                tooltip.style.left = mouseX + 10 + 'px';
                tooltip.style.top = mouseY - 10 + 'px';
              }
            })
            .on('mouseout', function (event, d) {
              // 恢復原始透明度
              const level = d.properties.level || 0;
              const opacityMap = {
                0: 0.5, // level 0 淡灰色，較透明
                1: 0.7,
                2: 0.75,
                3: 0.8,
                4: 0.85,
                5: 0.9,
              };
              d3.select(this).attr('fill-opacity', opacityMap[level] || opacityMap[0]);

              // 隱藏工具提示
              if (tooltip) {
                tooltip.style.opacity = 0;
              }
            });

          console.log('[MapTab] 登革熱網格 GeoJSON 繪製完成');
          console.log('  - 最大 level:', maxLevel);
        } catch (error) {
          console.error('[MapTab] 登革熱網格 GeoJSON 繪製失敗:', error);
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
       * 創建地圖並載入初始數據
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 同時載入兩個數據集
        console.log('[MapTab] 開始載入所有數據集...');
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
