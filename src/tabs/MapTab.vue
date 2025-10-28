<script>
  /**
   * 🗺️ MapTab.vue - Leaflet OSM 地點地圖組件 (Leaflet OSM Places Map Component)
   *
   * 使用 Leaflet 繪製 OpenStreetMap 地點資料。
   * 主要功能：
   * - 使用 Leaflet 顯示 OSM 底圖和地點多邊形
   * - 自動縮放到地點範圍
   * - 支持縮放和平移
   * - 響應式設計
   * - 地點資訊提示
   * - 顯示赤道線和經緯網格
   *
   * 技術架構：
   * - Vue 3 Composition API
   * - Leaflet 地圖庫
   * - GeoJSON 資料格式
   */

  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { useDataStore } from '@/stores/dataStore';

  export default {
    name: 'MapTab',
    emits: ['map-ready'],
    setup(_, { emit }) {
      // 🏪 數據存儲
      const dataStore = useDataStore();

      // 🗺️ 地圖相關變數
      const mapContainer = ref(null);
      let map = null;
      let placesLayer = null;
      // eslint-disable-next-line no-unused-vars
      let roadsLayer = null;
      // eslint-disable-next-line no-unused-vars
      let transportLayer = null;
      // eslint-disable-next-line no-unused-vars
      let waterLayer = null;
      let graticuleLayer = null;

      // 🎛️ 地圖控制狀態
      const isMapReady = ref(false);
      const mapContainerId = ref(`leaflet-map-${Math.random().toString(36).substr(2, 9)}`);

      // GeoJSON 數據
      const placesData = ref(null);
      const roadsData = ref(null);
      const transportData = ref(null);
      const waterData = ref(null);

      /**
       * 📥 載入所有 OSM GeoJSON 數據
       */
      const loadAllData = async () => {
        try {
          console.log('[MapTab] 開始載入 OSM GeoJSON 數據...');

          // 並行載入所有 GeoJSON 檔案
          const [placesResponse, roadsResponse, transportResponse, waterResponse] =
            await Promise.all([
              fetch(`${process.env.BASE_URL}data/geojson/gis_osm_places_a_free_1.geojson`),
              fetch(`${process.env.BASE_URL}data/geojson/gis_osm_roads_free_1.geojson`),
              fetch(`${process.env.BASE_URL}data/geojson/gis_osm_transport_a_free_1.geojson`),
              fetch(`${process.env.BASE_URL}data/geojson/gis_osm_water_a_free_1.geojson`),
            ]);

          // 檢查所有響應
          if (!placesResponse.ok) throw new Error(`地點數據載入失敗: ${placesResponse.status}`);
          if (!roadsResponse.ok) throw new Error(`道路數據載入失敗: ${roadsResponse.status}`);
          if (!transportResponse.ok)
            throw new Error(`交通數據載入失敗: ${transportResponse.status}`);
          if (!waterResponse.ok) throw new Error(`水域數據載入失敗: ${waterResponse.status}`);

          // 並行解析 JSON
          [placesData.value, roadsData.value, transportData.value, waterData.value] =
            await Promise.all([
              placesResponse.json(),
              roadsResponse.json(),
              transportResponse.json(),
              waterResponse.json(),
            ]);

          console.log('[MapTab] 所有 OSM 數據載入成功:');
          console.log('  - 地點數量:', placesData.value.features?.length);
          console.log('  - 道路數量:', roadsData.value.features?.length);
          console.log('  - 交通設施數量:', transportData.value.features?.length);
          console.log('  - 水域數量:', waterData.value.features?.length);

          return true;
        } catch (error) {
          console.error('[MapTab] OSM 數據載入失敗:', error);
          return false;
        }
      };

      /**
       * 🌐 繪製經緯網格
       */
      const drawGraticule = () => {
        if (!map) return;

        // 創建經緯網格圖層組
        graticuleLayer = L.layerGroup().addTo(map);

        // 繪製經線（每10度一條）- 使用白色半透明
        for (let lng = -180; lng <= 180; lng += 10) {
          const meridian = [
            [90, lng],
            [-90, lng],
          ];
          L.polyline(meridian, {
            color: '#FFFFFF', // 白色
            weight: 0.5,
            opacity: 0.2,
            interactive: false,
          }).addTo(graticuleLayer);
        }

        // 繪製緯線（每10度一條）- 使用白色半透明
        for (let lat = -80; lat <= 80; lat += 10) {
          const parallel = [
            [lat, -180],
            [lat, 180],
          ];
          L.polyline(parallel, {
            color: '#FFFFFF', // 白色
            weight: 0.5,
            opacity: 0.2,
            interactive: false,
          }).addTo(graticuleLayer);
        }

        console.log('[MapTab] 經緯網格繪製完成');
      };

      /**
       * 🌍 繪製赤道線
       */
      const drawEquator = () => {
        if (!map) return;

        // 創建赤道線（緯度 0°）- 使用諾魯國旗的金黃色
        // 諾魯國旗上的黃色橫條代表赤道
        const equatorCoords = [
          [0, -180],
          [0, 180],
        ];

        L.polyline(equatorCoords, {
          color: '#FFC61E', // 金黃色（諾魯國旗配色）
          weight: 4,
          opacity: 1,
          interactive: false,
        }).addTo(map);

        console.log('[MapTab] 赤道線繪製完成');
      };

      /**
       * 🏗️ 創建地圖實例
       * 初始化 Leaflet 地圖並設定基本配置
       */
      const createMap = () => {
        if (!mapContainer.value) return false;

        const rect = mapContainer.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('[MapTab] 容器尺寸為零，延遲初始化');
          return false;
        }

        try {
          // 創建 Leaflet 地圖（不使用底圖，不顯示縮放按鈕）
          map = L.map(mapContainer.value, {
            center: [0, 0], // 初始中心在赤道
            zoom: 2,
            zoomControl: false, // 不顯示 +/- 按鈕
            attributionControl: false, // 不顯示歸屬信息
            preferCanvas: true, // 使用 Canvas 渲染以提高性能
          });

          // 存儲地圖實例到 store
          dataStore.setMapInstance(map);

          isMapReady.value = true;

          // 將地圖實例傳遞給父組件
          emit('map-ready', { map });

          console.log('[MapTab] Leaflet 地圖創建成功');
          return true;
        } catch (error) {
          console.error('[MapTab] Leaflet 地圖創建失敗:', error);
          return false;
        }
      };

      /**
       * 🌊 繪製水域圖層
       */
      const drawWater = () => {
        if (!map || !waterData.value) return;

        console.log('[MapTab] 開始繪製水域，數量:', waterData.value.features?.length);

        // 使用深藍色（諾魯國旗的主色）
        waterLayer = L.geoJSON(waterData.value, {
          style: {
            fillColor: '#001b4d', // 更深的藍色
            fillOpacity: 0.8,
            color: '#002B7F', // 諾魯藍邊框
            weight: 1,
          },
        }).addTo(map);

        console.log('[MapTab] 水域繪製完成');
      };

      /**
       * 🛣️ 繪製道路圖層
       */
      const drawRoads = () => {
        if (!map || !roadsData.value) return;

        console.log('[MapTab] 開始繪製道路，數量:', roadsData.value.features?.length);

        // 使用金黃色（諾魯國旗的黃色）
        roadsLayer = L.geoJSON(roadsData.value, {
          style: {
            color: '#FFC61E', // 金黃色
            weight: 1.5,
            opacity: 0.7,
          },
        }).addTo(map);

        console.log('[MapTab] 道路繪製完成');
      };

      /**
       * 🚉 繪製交通設施圖層
       */
      const drawTransport = () => {
        if (!map || !transportData.value) return;

        console.log('[MapTab] 開始繪製交通設施，數量:', transportData.value.features?.length);

        // 使用白色（諾魯國旗的白色）
        transportLayer = L.geoJSON(transportData.value, {
          style: {
            fillColor: '#FFFFFF', // 白色
            fillOpacity: 0.7,
            color: '#FFC61E', // 金黃色邊框
            weight: 1,
          },
        }).addTo(map);

        console.log('[MapTab] 交通設施繪製完成');
      };

      /**
       * 🎨 繪製 OSM 地點
       */
      const drawPlaces = () => {
        if (!map || !placesData.value) {
          console.error('[MapTab] 無法繪製地點: map=', !!map, 'placesData=', !!placesData.value);
          return;
        }

        try {
          console.log('[MapTab] 開始繪製地點，數量:', placesData.value.features?.length);

          // 創建 GeoJSON 圖層（使用諾魯國旗配色）
          // 諾魯國旗配色：深藍色 #002B7F、金黃色 #FFC61E、白色 #FFFFFF
          placesLayer = L.geoJSON(placesData.value, {
            style: {
              fillColor: '#002B7F', // 深藍色填充
              fillOpacity: 0.9,
              color: '#FFC61E', // 金黃色邊框
              weight: 2,
            },
            interactive: false, // 禁用所有交互功能
          }).addTo(map);

          // 自動調整地圖視野到數據範圍
          if (placesLayer.getBounds().isValid()) {
            map.fitBounds(placesLayer.getBounds(), { padding: [50, 50] });
          }

          console.log(
            '[MapTab] OSM 地點繪製完成，已繪製',
            placesData.value.features?.length,
            '個地點'
          );
        } catch (error) {
          console.error('[MapTab] OSM 地點繪製失敗:', error);
        }
      };

      /**
       * 🚀 初始化地圖
       * 創建地圖並載入初始數據
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 先載入所有 OSM 數據
        const loaded = await loadAllData();
        if (!loaded) {
          console.error('[MapTab] 無法載入 OSM 數據');
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
            console.log('[MapTab] 地圖創建成功，開始繪製所有圖層');
            // 繪製經緯網格（最底層）
            drawGraticule();
            // 繪製赤道線
            drawEquator();
            // 繪製地點（最底層的資料圖層）
            drawPlaces();
            // 繪製水域
            drawWater();
            // 繪製道路
            drawRoads();
            // 繪製交通設施（最上層）
            drawTransport();
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
        if (map) {
          map.remove();
          map = null;
        }

        placesLayer = null;
        roadsLayer = null;
        transportLayer = null;
        waterLayer = null;
        graticuleLayer = null;
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
    background: #001b4d; /* 深藍色背景（諾魯國旗主題） */
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
    background-color: rgba(0, 43, 127, 0.95); /* 諾魯深藍色 */
    color: #ffc61e; /* 金黃色文字 */
    border: 1px solid #ffc61e; /* 金黃色邊框 */
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.4;
  }
</style>
