<script>
  /**
   * 🗺️ MapTab.vue - D3.js OSM 地點地圖組件 (D3.js OSM Places Map Component)
   *
   * 使用 D3.js 繪製 OpenStreetMap 地點資料。
   * 主要功能：
   * - 使用 D3.js 顯示 OSM 地點多邊形
   * - 自動縮放到地點範圍
   * - 使用麥卡托投影 (Mercator Projection)
   * - 響應式設計
   * - 地點資訊提示
   *
   * 技術架構：
   * - Vue 3 Composition API
   * - D3.js 地圖繪製
   * - GeoJSON 資料格式
   * - Bootstrap 5 樣式
   */

  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import * as d3 from 'd3';

  export default {
    name: 'MapTab',
    emits: ['map-ready'],
    setup(_, { emit }) {
      // 🗺️ 地圖相關變數
      const mapContainer = ref(null);
      let svg = null;
      let projection = null;
      let path = null;
      let zoom = null;
      let g = null;
      let tooltipDiv = null;

      // 🎨 顏色配置
      const colors = {
        participant: '#FFD700', // 黃色作為邦交國顏色
        other: '#1a1a1a', // 很深的灰色作為預設顏色
        border: 'none', // 不顯示邊框
        background: '#2a2a2a', // 海洋比國家淺一點的灰色
      };

      // 🎛️ 地圖控制狀態
      const isMapReady = ref(false);
      const mapContainerId = ref(`d3-map-${Math.random().toString(36).substr(2, 9)}`);

      // 世界地圖數據
      const worldData = ref(null);

      /**
       * 📥 載入 OSM 地點數據
       */
      const loadWorldData = async () => {
        try {
          // 載入 OSM 地點 GeoJSON 檔案
          console.log('[MapTab] 開始載入 OSM 地點 GeoJSON 數據...');
          const response = await fetch(
            `${process.env.BASE_URL}data/geojson/gis_osm_places_a_free_1.geojson`
          );

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          worldData.value = data;
          console.log('[MapTab] OSM 地點數據載入成功，特徵數量:', data.features?.length);
          return true;
        } catch (error) {
          console.error('[MapTab] OSM 地點數據載入失敗:', error);
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
            .style('background', colors.background);

          // 建立滑鼠提示框 (tooltip)
          d3.select(mapContainer.value).style('position', 'relative');
          tooltipDiv = d3
            .select(mapContainer.value)
            .append('div')
            .attr('class', 'map-tooltip')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('visibility', 'hidden')
            .style('z-index', '10');

          // 創建投影 - 使用麥卡托投影 (Mercator Projection)
          // 自動縮放到 GeoJSON 數據的範圍
          projection = d3.geoMercator().fitSize([width, height], worldData.value); // 自動適應數據範圍

          // 創建路徑生成器
          path = d3.geoPath().projection(projection);

          // 創建容器組
          g = svg.append('g');

          // 設置縮放行為（啟用縮放和平移）
          zoom = d3
            .zoom()
            .scaleExtent([1, 20]) // 允許縮放 1x 到 20x
            .on('zoom', (event) => {
              g.attr('transform', event.transform);
            });

          svg.call(zoom);

          isMapReady.value = true;

          // 將地圖實例傳遞給父組件
          const mapInterface = {
            svg,
            projection,
            path,
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
       * 🌍 繪製經緯網格和赤道線
       */
      const drawGraticule = () => {
        if (!g || !path) return;

        // 創建經緯網格生成器
        const graticule = d3.geoGraticule();

        // 繪製經緯網格（淺色背景線）
        g.insert('path', ':first-child')
          .datum(graticule)
          .attr('class', 'graticule')
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', '#444')
          .attr('stroke-width', 0.5)
          .style('opacity', 0.3);

        // 創建赤道線的 GeoJSON 數據（緯度 0°）
        // 使用更多點來確保線條平滑
        const equatorCoordinates = [];
        for (let lon = -180; lon <= 180; lon += 1) {
          equatorCoordinates.push([lon, 0]);
        }

        const equatorGeoJSON = {
          type: 'LineString',
          coordinates: equatorCoordinates,
        };

        // 繪製赤道線（顯眼的紅色）
        g.append('path')
          .datum(equatorGeoJSON)
          .attr('d', path)
          .attr('class', 'equator-line')
          .attr('fill', 'none')
          .attr('stroke', '#FF4444') // 紅色
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '10,5') // 虛線效果
          .style('opacity', 1);

        console.log('[MapTab] 經緯網格和赤道線繪製完成');
      };

      /**
       * 🎨 繪製 OSM 地點
       */
      const drawWorldMap = async () => {
        if (!g || !worldData.value) {
          console.error('[MapTab] 無法繪製地圖: g=', !!g, 'worldData=', !!worldData.value);
          return;
        }

        try {
          // 使用 OSM 地點 GeoJSON 數據
          const places = worldData.value;
          console.log('[MapTab] 開始繪製地點，數量:', places.features?.length);

          // 繪製地點多邊形
          const placePaths = g
            .selectAll('path.place')
            .data(places.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', '#4CAF50') // 綠色
            .attr('stroke', '#2E7D32') // 深綠色邊框
            .attr('stroke-width', 1)
            .attr('class', 'place')
            .style('cursor', 'pointer')
            .style('opacity', 0.8);

          // 滑鼠事件：顯示地點名稱 tooltip
          placePaths
            .on('mouseover', (event, d) => {
              d3.select(event.currentTarget).style('opacity', 1);
              const placeName = d.properties?.name || d.properties?.fclass || 'Unknown';
              const placeType = d.properties?.fclass || '';
              if (tooltipDiv) {
                tooltipDiv
                  .style('visibility', 'visible')
                  .html(`<strong>${placeName}</strong><br/>${placeType}`);
              }
            })
            .on('mousemove', (event) => {
              if (tooltipDiv) {
                const [x, y] = d3.pointer(event, mapContainer.value);
                tooltipDiv.style('left', `${x + 12}px`).style('top', `${y + 12}px`);
              }
            })
            .on('mouseout', (event) => {
              d3.select(event.currentTarget).style('opacity', 0.8);
              if (tooltipDiv) {
                tooltipDiv.style('visibility', 'hidden');
              }
            });

          console.log('[MapTab] OSM 地點繪製完成，已繪製', places.features?.length, '個地點');
        } catch (error) {
          console.error('[MapTab] OSM 地點繪製失敗:', error);
        }
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

        // 自動調整投影以適應 GeoJSON 數據範圍
        projection.fitSize([width, height], worldData.value);

        // 更新所有路徑
        g.selectAll('path.place').attr('d', path);

        // 更新經緯網格和赤道線
        g.selectAll('path.graticule').attr('d', path);
        g.selectAll('path.equator-line').attr('d', path);

        console.log('[MapTab] 地圖尺寸更新完成');
      };

      /**
       * 🚀 初始化地圖
       * 創建地圖並載入初始數據
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 先載入 OSM 地點數據
        const loaded = await loadWorldData();
        if (!loaded) {
          console.error('[MapTab] 無法載入 OSM 地點數據');
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
            console.log('[MapTab] 地圖創建成功，開始繪製經緯網格和 OSM 地點');
            // 先繪製經緯網格和赤道線
            drawGraticule();
            // 再繪製 OSM 地點
            await drawWorldMap();
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

        if (tooltipDiv) {
          tooltipDiv.remove();
          tooltipDiv = null;
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
        invalidateSize,
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

  :deep(.place) {
    transition:
      opacity 0.2s ease,
      filter 0.2s ease;
  }

  :deep(.place:hover) {
    filter: brightness(1.1);
  }

  :deep(.graticule) {
    pointer-events: none;
  }

  :deep(.equator-line) {
    pointer-events: none;
  }

  :deep(.map-tooltip) {
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.4;
  }
</style>
