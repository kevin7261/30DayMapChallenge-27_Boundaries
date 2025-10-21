<script>
  /**
   * 🗺️ MapTab.vue - D3.js 世界地圖組件 (D3.js World Map Component)
   *
   * 使用 D3.js 繪製世界地圖，專為世界城市地圖展示設計。
   * 主要功能：
   * - 使用 D3.js 顯示世界地圖
   * - 提供城市導航功能
   * - 支援多種投影方式
   * - 響應式設計
   *
   * 技術架構：
   * - Vue 3 Composition API
   * - D3.js 地圖繪製
   * - Pinia 狀態管理
   * - Bootstrap 5 樣式
   */

  import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
  import * as d3 from 'd3';
  import { useDataStore } from '@/stores/dataStore.js';
  import { useDefineStore } from '@/stores/defineStore.js';

  export default {
    name: 'MapTab',
    props: {
      currentCountry: { type: String, default: '國家名稱' },
    },
    emits: ['map-ready'],
    setup(props, { emit }) {
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

      // 📊 計算屬性：檢查是否有任何圖層可見
      const isAnyLayerVisible = computed(() => dataStore.getAllLayers().length > 0);

      // 🏙️ 當前國家信息
      const currentCountryInfo = computed(() => {
        if (!props.currentCountry) {
          return null;
        }

        const allLayers = dataStore.getAllLayers();
        const countryLayer = allLayers.find((layer) => layer.layerName === props.currentCountry);
        if (countryLayer) {
          return {};
        } else {
          return null;
        }
      });

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
        if (!mapContainer.value) return false;

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

          // 創建投影 - 使用方位等距投影 (Azimuthal Equidistant Projection)
          // 預設以台灣地理中心為投影中心
          projection = d3
            .geoAzimuthalEquidistant()
            .rotate([-120.982025, -23.973875]) // 以台灣地理中心為中心
            .scale(Math.min(width, height) / 7)
            .translate([width / 2, height / 2])
            .clipAngle(180);

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
       * 🎯 繪製距離圓圈
       * 從圓心開始，地球距離5000km畫一個淺灰虛線，畫在最上面
       */
      const drawDistanceCircles = () => {
        if (!g || !projection) return;

        // 地球半徑約6371km
        const earthRadius = 6371; // km
        const targetDistance = 5000; // km - 固定只畫5000km的圓圈

        // 移除舊的距離圓圈
        g.selectAll('.distance-circle').remove();

        console.log('[MapTab] 開始繪製5000km距離圓圈');

        // 將距離轉換為角度（弧度）
        // 在地球上，距離 = 角度 * 地球半徑
        const angle = targetDistance / earthRadius;

        // 創建圓圈路徑
        const circle = d3
          .geoCircle()
          .center([120.982025, 23.973875]) // 使用台灣地理中心作為圓心
          .radius(angle); // 以弧度為半徑

        // 繪製5000km圓圈 - 使用 append 確保畫在最上面
        g.append('path')
          .datum(circle())
          .attr('d', path)
          .attr('fill', 'none')
          .attr('stroke', '#cccccc') // 淺灰色
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5') // 淺虛線
          .attr('class', 'distance-circle')
          .style('opacity', 0.8)
          .style('pointer-events', 'none'); // 不影響其他互動

        console.log('[MapTab] 5000km距離圓圈繪製完成');
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
            .attr('fill', '#d0d0d0')
            .attr('stroke', '#666666')
            .attr('stroke-width', 0.5)
            .attr('class', 'country');

          console.log('[MapTab] 世界地圖繪製完成，已繪製', countries.features?.length, '個國家');
        } catch (error) {
          console.error('[MapTab] 世界地圖繪製失敗:', error);
        }
      };

      /**
       * 🎯 添加城市標記
       */
      const addCityMarkers = () => {
        if (!g) return;

        const cities = dataStore.getAllLayers();

        // 移除舊的標記
        g.selectAll('.city-marker').remove();
        g.selectAll('.city-label').remove();

        // 添加新的標記
        cities.forEach((city) => {
          const [lng, lat] = city.center;
          const [x, y] = projection([lng, lat]);

          // 添加圓點標記
          g.append('circle')
            .attr('class', 'city-marker')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', '#ff0000')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');

          // 添加城市名稱標籤
          g.append('text')
            .attr('class', 'city-label')
            .attr('x', x)
            .attr('y', y - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333333')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 3)
            .attr('paint-order', 'stroke')
            .text(city.layerName);
        });

        // 繪製距離圓圈（每5000km一個）- 在所有元素之後繪製，確保在最上層
        drawDistanceCircles();

        console.log('[MapTab] 城市標記添加完成');
      };

      /**
       * 🌍 導航到指定位置
       * 使用方位等距投影，將選定的國家設為地圖中心
       * 地球大小保持不變，只改變旋轉中心
       */
      const navigateToLocation = (center) => {
        if (!svg || !projection) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // 方位等距投影：使用 rotate 將選定位置旋轉到中心
        // rotate 接受 [lambda, phi, gamma]，其中 lambda 和 phi 是經緯度的負值
        // 地球大小保持固定，不隨導航改變
        projection.rotate([-center[0], -center[1]]).scale(Math.min(width, height) / 7);

        // 更新所有路徑
        g.selectAll('path.country').attr('d', path);

        // 更新城市標記（會自動繪製距離圓圈）
        addCityMarkers();

        console.log('[MapTab] 地圖導航完成，中心:', center);
      };

      /**
       * 📏 刷新地圖尺寸
       * 當容器大小改變時重新計算地圖尺寸
       */
      const invalidateSize = () => {
        if (!svg || !mapContainer.value) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        svg.attr('width', width).attr('height', height);

        projection.translate([width / 2, height / 2]).scale(Math.min(width, height) / 7);

        // 更新所有路徑
        g.selectAll('path.country').attr('d', path);

        // 更新城市標記（會自動繪製距離圓圈在最上層）
        addCityMarkers();

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
            addCityMarkers();
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

      // 👀 監聽器：監聽資料存儲中的圖層變化
      watch(
        () => dataStore.layers,
        () => {
          if (isMapReady.value) {
            addCityMarkers();
          }
        },
        { deep: true }
      );

      // 👀 監聽器：監聽當前國家變化
      watch(
        () => props.currentCountry,
        (newCountry) => {
          if (isMapReady.value && newCountry) {
            // currentCountry 是 layerName，需要找到對應的圖層
            const allLayers = dataStore.getAllLayers();
            const layer = allLayers.find((l) => l.layerName === newCountry);
            if (layer) {
              navigateToLocation(layer.center);
            }
          }
        }
      );

      // 📤 返回組件公開的屬性和方法
      return {
        mapContainer,
        mapContainerId,
        isAnyLayerVisible,
        currentCountryInfo,
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

    <!-- 中心點顯示 -->
    <div
      class="position-absolute top-50 start-50 translate-middle"
      style="z-index: 1000; pointer-events: none"
    >
      <div class="rounded-circle bg-white" style="width: 4px; height: 4px"></div>
    </div>
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
</style>
