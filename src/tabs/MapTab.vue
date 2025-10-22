<script>
  /**
   * 🗺️ MapTab.vue - D3.js 世界地圖組件 (D3.js World Map Component)
   *
   * 使用 D3.js 繪製世界地圖，專為世界城市地圖展示設計。
   * 主要功能：
   * - 使用 D3.js 顯示世界地圖
   * - 提供城市導航功能
   * - 使用麥卡托投影 (Mercator Projection)
   * - 響應式設計
   *
   * 技術架構：
   * - Vue 3 Composition API
   * - D3.js 地圖繪製
   * - Pinia 狀態管理
   * - Bootstrap 5 樣式
   */

  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import * as d3 from 'd3';
  import { useDataStore } from '@/stores/dataStore.js';
  import { useDefineStore } from '@/stores/defineStore.js';

  export default {
    name: 'MapTab',
    emits: ['map-ready'],
    setup(_, { emit }) {
      // 📦 存儲實例
      const dataStore = useDataStore();
      const defineStore = useDefineStore();

      // 🗺️ 地圖相關變數
      const mapContainer = ref(null);
      const svgElement = ref(null);
      let svg = null;
      let projection = null;
      let path = null;
      let zoom = null;
      let g = null;

      // 🎛️ 地圖控制狀態
      const isMapReady = ref(false);
      const mapContainerId = ref(`d3-map-${Math.random().toString(36).substr(2, 9)}`);

      // 世界地圖數據
      const worldData = ref(null);

      // 移除圖層和國家相關的計算屬性 - 改為全屏世界地圖顯示

      /**
       * 📥 載入世界地圖數據
       */
      const loadWorldData = async () => {
        try {
          // 使用本地的 GeoJSON 檔案
          console.log('[MapTab] 開始載入 GeoJSON 數據...');
          const response = await fetch(
            `${process.env.BASE_URL}data/ne_110m_admin_0_countries.geojson`
          );

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          worldData.value = data;
          console.log('[MapTab] 世界地圖數據載入成功，特徵數量:', data.features?.length);
          return true;
        } catch (error) {
          console.error('[MapTab] 世界地圖數據載入失敗:', error);
          return false;
        }
      };

      /**
       * 🏗️ 創建地圖實例
       * 初始化 D3 地圖並設定基本配置
       */
      const createMap = () => {
        if (!mapContainer.value || !worldData.value) return false;

        const rect = mapContainer.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('[MapTab] 容器尺寸為零，延遲初始化');
          return false;
        }

        try {
          const width = rect.width;
          const height = rect.height;

          // 創建 SVG 元素
          svg = d3
            .select(mapContainer.value)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#f0f0f0');

          svgElement.value = svg.node();

          // 創建投影 - 使用麥卡托投影 (Mercator Projection)
          // 限制顯示範圍到北緯80度、南緯60度
          const northLatLimit = 80; // 北緯限制
          const southLatLimit = -60; // 南緯限制

          // 創建限制範圍的 GeoJSON（北緯80度、南緯60度）
          const limitedBounds = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [-180, southLatLimit],
                      [180, southLatLimit],
                      [180, northLatLimit],
                      [-180, northLatLimit],
                      [-180, southLatLimit],
                    ],
                  ],
                },
              },
            ],
          };

          projection = d3
            .geoMercator()
            .center([0, 0]) // 以本初子午線和赤道交點為中心
            .fitSize([width, height], limitedBounds); // 使用限制範圍進行縮放

          // 創建路徑生成器
          path = d3.geoPath().projection(projection);

          // 創建容器組
          g = svg.append('g');

          // 設置縮放行為（禁用所有互動）
          zoom = d3
            .zoom()
            .scaleExtent([1, 1]) // 禁用縮放
            .on('zoom', null); // 禁用縮放事件

          svg.call(zoom).on('wheel.zoom', null).on('dblclick.zoom', null);

          isMapReady.value = true;

          // 將地圖實例和方法一起傳遞
          const mapInterface = {
            svg,
            projection,
            path,
            navigateToLocation: (center) => navigateToLocation(center),
          };

          emit('map-ready', mapInterface);

          console.log('[MapTab] D3 地圖創建成功');
          return true;
        } catch (error) {
          console.error('[MapTab] D3 地圖創建失敗:', error);
          return false;
        }
      };

      /**
       * 🎨 繪製世界地圖
       */
      const drawWorldMap = async () => {
        if (!g || !worldData.value) {
          console.error('[MapTab] 無法繪製地圖: g=', !!g, 'worldData=', !!worldData.value);
          return;
        }

        try {
          // 直接使用 GeoJSON 數據（無需轉換）
          const countries = worldData.value;
          console.log('[MapTab] 開始繪製地圖，國家數量:', countries.features?.length);

          // 繪製國家邊界
          g.selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', (d) => {
              // 檢查國家顏色：台灣(紅色) > 參展(淺藍色) > 其他(淺灰色)
              const countryName = d.properties.name || d.properties.ADMIN || d.properties.NAME;
              if (dataStore.isHomeCountry(countryName)) return '#ff9999'; // 台灣：紅色
              if (dataStore.isCountryVisited(countryName)) return '#cce5ff'; // 參展：淺藍色
              return '#d0d0d0'; // 其他：淺灰色
            })
            .attr('stroke', '#666666')
            .attr('stroke-width', 0.5)
            .attr('class', 'country');

          console.log('[MapTab] 世界地圖繪製完成，已繪製', countries.features?.length, '個國家');
        } catch (error) {
          console.error('[MapTab] 世界地圖繪製失敗:', error);
        }
      };

      // addCityMarkers 函數已移除 - 不再需要城市標記

      /**
       * 🔴 繪製微型國家圓圈標記
       * 為那些在低解析度地圖中不存在的微型國家繪製圓圈
       * 參展：淡藍色 / 未造訪：灰色
       */
      const drawMicroStates = () => {
        if (!g || !projection) {
          console.error('[MapTab] 無法繪製微型國家: g=', !!g, 'projection=', !!projection);
          return;
        }

        try {
          console.log('[MapTab] 開始繪製微型國家圓圈，總數量:', dataStore.microStates.length);

          // 繪製所有微型國家的圓圈標記
          g.selectAll('.micro-state-marker')
            .data(dataStore.microStates)
            .enter()
            .append('circle')
            .attr('class', 'micro-state-marker')
            .attr('cx', (d) => projection(d.coordinates)[0])
            .attr('cy', (d) => projection(d.coordinates)[1])
            .attr('r', 3) // 圓圈半徑
            .attr('fill', (d) => {
              // 參展：淡藍色 / 未造訪：灰色
              return dataStore.isCountryVisited(d.name) ? '#cce5ff' : '#d0d0d0';
            })
            .attr('stroke', '#666666') // 深灰色邊框
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .append('title')
            .text((d) => d.name); // 滑鼠懸停顯示國家名稱

          console.log('[MapTab] 微型國家圓圈繪製完成');
        } catch (error) {
          console.error('[MapTab] 微型國家圓圈繪製失敗:', error);
        }
      };

      /**
       * 🌍 導航到指定位置（目前不使用，保留介面）
       * 使用麥卡托投影，將選定的國家設為地圖中心
       */
      const navigateToLocation = (center) => {
        if (!svg || !projection || !worldData.value) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // 麥卡托投影：使用 center 方法設置中心點並調整縮放
        const scale = Math.min(width, height) / 2;
        projection.center([center[0], center[1]]).scale(scale);

        // 更新所有路徑
        g.selectAll('path.country').attr('d', path);

        console.log('[MapTab] 地圖導航完成，中心:', center);
      };

      /**
       * 📏 刷新地圖尺寸
       * 當容器大小改變時重新計算地圖尺寸
       */
      const invalidateSize = () => {
        if (!svg || !mapContainer.value || !worldData.value) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        svg.attr('width', width).attr('height', height);

        // 自動調整投影以適應新的容器尺寸（限制到北緯80度、南緯60度）
        const northLatLimit = 80; // 北緯限制
        const southLatLimit = -60; // 南緯限制
        const limitedBounds = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-180, southLatLimit],
                    [180, southLatLimit],
                    [180, northLatLimit],
                    [-180, northLatLimit],
                    [-180, southLatLimit],
                  ],
                ],
              },
            },
          ],
        };
        projection.fitSize([width, height], limitedBounds);

        // 更新所有路徑
        g.selectAll('path.country').attr('d', path);

        // 清除舊的微型國家圓圈
        g.selectAll('.micro-state-marker').remove();
        // 重新繪製微型國家圓圈標記
        drawMicroStates();

        console.log('[MapTab] 地圖尺寸更新完成');
      };

      /**
       * 🚀 初始化地圖
       * 創建地圖並載入初始數據
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 先載入世界地圖數據
        const loaded = await loadWorldData();
        if (!loaded) {
          console.error('[MapTab] 無法載入世界地圖數據');
          return;
        }

        const tryCreateMap = async () => {
          if (attempts >= maxAttempts) {
            console.error('[MapTab] 地圖初始化失敗，已達到最大嘗試次數');
            return;
          }

          attempts++;
          console.log(`[MapTab] 嘗試創建地圖 (${attempts}/${maxAttempts})`);

          if (createMap()) {
            console.log('[MapTab] 地圖創建成功，開始繪製世界地圖');
            await drawWorldMap();
            // 繪製微型國家圓圈標記
            drawMicroStates();
          } else {
            console.log('[MapTab] 地圖創建失敗，100ms 後重試');
            setTimeout(tryCreateMap, 100);
          }
        };

        tryCreateMap();
      };

      // 📏 設置 ResizeObserver 監聽容器大小變化
      let resizeObserver = null;
      let resizeTimeout = null;

      const setupResizeObserver = () => {
        if (!mapContainer.value || !window.ResizeObserver) return;

        resizeObserver = new ResizeObserver(() => {
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }

          resizeTimeout = setTimeout(() => {
            console.log('🔄 容器大小變化，刷新地圖');
            invalidateSize();
          }, 200);
        });

        resizeObserver.observe(mapContainer.value);
        console.log('✅ ResizeObserver 已設置');
      };

      // 🧹 生命週期：組件掛載
      onMounted(() => {
        nextTick(() => {
          initMap();
          setupResizeObserver();
        });
      });

      // 🧹 生命週期：組件卸載
      onUnmounted(() => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        if (resizeObserver) {
          resizeObserver.disconnect();
        }

        if (svg) {
          svg.remove();
          svg = null;
        }

        projection = null;
        path = null;
        zoom = null;
        g = null;
        isMapReady.value = false;
      });

      // 👀 監聽器已移除 - 不再需要動態導航功能

      // 📤 返回組件公開的屬性和方法
      return {
        mapContainer,
        mapContainerId,
        invalidateSize,
        defineStore,
        navigateToLocation,
      };
    },
  };
</script>

<template>
  <!-- 🗺️ 地圖主容器 -->
  <div id="map-container" class="h-100 w-100 position-relative bg-transparent z-0">
    <!-- 🗺️ D3.js 地圖容器 -->
    <div :id="mapContainerId" ref="mapContainer" class="h-100 w-100"></div>
  </div>
</template>

<style scoped>
  @import '../assets/css/common.css';

  #map-container {
    overflow: hidden;
  }

  :deep(.country) {
    transition: fill 0.2s ease;
  }

  :deep(.country:hover) {
    fill: #c0c0c0;
  }

  :deep(.city-marker) {
    transition: r 0.2s ease;
  }

  :deep(.city-marker:hover) {
    r: 6;
  }

  /* 微型國家圓圈標記樣式 */
  :deep(.micro-state-marker) {
    transition: all 0.2s ease;
  }

  :deep(.micro-state-marker:hover) {
    r: 5;
    stroke: #333333;
    stroke-width: 2;
    filter: brightness(0.85);
  }
</style>
