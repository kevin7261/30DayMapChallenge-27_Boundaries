/**
 * 📦 數據存儲模組 (Data Store Module)
 *
 * 管理城市圖層數據和地圖導航功能
 * 使用 Pinia 狀態管理系統和 Vue 3 Composition API
 */

// 核心依賴
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 🏪 數據存儲商店定義 (Data Store Definition)
 *
 * 使用 Pinia 的 defineStore 創建一個名為 'data' 的狀態管理商店。
 * 採用 Composition API 語法，提供更好的 TypeScript 支援和代碼組織。
 *
 * @returns {Object} 包含所有狀態和方法的商店對象
 */
export const useDataStore = defineStore(
  'data', // 商店唯一標識符
  () => {
    /**
     * 🔴 微型國家座標 (Micro-states Coordinates)
     *
     * 這些國家在低解析度地圖中不存在，用圓圈標記顯示
     * 格式：{ name: '國家名稱', coordinates: [經度, 緯度] }
     * 按洲別分組
     */
    const microStates = ref([
      // 亞洲 (Asia)
      { name: 'Bahrain', coordinates: [50.5577, 26.0667] }, // 巴林
      { name: 'Maldives', coordinates: [73.2207, 3.2028] }, // 馬爾地夫
      { name: 'Singapore', coordinates: [103.8198, 1.3521] }, // 新加坡

      // 歐洲 (Europe)
      { name: 'Andorra', coordinates: [1.5218, 42.5063] }, // 安道爾
      { name: 'Liechtenstein', coordinates: [9.5215, 47.141] }, // 列支敦士登
      { name: 'Malta', coordinates: [14.3754, 35.9375] }, // 馬爾他
      { name: 'Monaco', coordinates: [7.4246, 43.7384] }, // 摩納哥
      { name: 'San Marino', coordinates: [12.4578, 43.9424] }, // 聖馬利諾
      { name: 'Vatican', coordinates: [12.4534, 41.9029] }, // 梵蒂岡

      // 北美洲 (North America)
      { name: 'Antigua and Barbuda', coordinates: [-61.8456, 17.0608] }, // 安地卡及巴布達
      { name: 'Barbados', coordinates: [-59.5432, 13.1939] }, // 巴巴多斯
      { name: 'Dominica', coordinates: [-61.371, 15.415] }, // 多米尼克
      { name: 'Grenada', coordinates: [-61.679, 12.1165] }, // 格瑞那達
      { name: 'Saint Kitts and Nevis', coordinates: [-62.783, 17.3578] }, // 聖克里斯多福及尼維斯
      { name: 'Saint Lucia', coordinates: [-60.9789, 13.9094] }, // 聖露西亞
      { name: 'Saint Vincent and the Grenadines', coordinates: [-61.2872, 13.2528] }, // 聖文森及格瑞那丁

      // 非洲 (Africa)
      { name: 'Cabo Verde', coordinates: [-23.6052, 16.5388] }, // 維德角
      { name: 'Comoros', coordinates: [43.3333, -11.6455] }, // 葛摩
      { name: 'Mauritius', coordinates: [57.5522, -20.1609] }, // 模里西斯
      { name: 'São Tomé and Príncipe', coordinates: [6.6131, 0.1864] }, // 聖多美普林西比
      { name: 'Seychelles', coordinates: [55.492, -4.6796] }, // 塞席爾

      // 大洋洲 (Oceania)
      { name: 'Kiribati', coordinates: [-157.363, 1.8709] }, // 吉里巴斯
      { name: 'Marshall Islands', coordinates: [171.1845, 7.1315] }, // 馬紹爾群島
      { name: 'Micronesia', coordinates: [158.1625, 6.9248] }, // 密克羅尼西亞
      { name: 'Nauru', coordinates: [166.9315, -0.5228] }, // 諾魯
      { name: 'Niue', coordinates: [-169.9167, -19.0544] }, // 紐埃
      { name: 'Palau', coordinates: [134.5825, 7.515] }, // 帛琉
      { name: 'Samoa', coordinates: [-172.1046, -13.759] }, // 薩摩亞
      { name: 'Tonga', coordinates: [-175.1982, -21.1789] }, // 東加
      { name: 'Tuvalu', coordinates: [179.1962, -8.5167] }, // 吐瓦魯
      { name: 'Vanuatu', coordinates: [166.9591, -15.3767] }, // 萬那杜
    ]);

    /**
     * 🔵 邦交國列表 (Allied Countries List)
     *
     * 這些國家在地圖上會以黃色標示
     * 名稱需與 GeoJSON 中的 properties.NAME 欄位完全匹配
     * 按地區分組
     */
    const alliedCountries = ref([
      // 亞太地區 (Asia-Pacific)
      'Palau', // 帛琉共和國
      'Marshall Islands', // 馬紹爾群島共和國
      'Tuvalu', // 吐瓦魯國

      // 拉丁美洲及加勒比海地區 (Latin America and Caribbean)
      'Belize', // 貝里斯
      'Guatemala', // 瓜地馬拉共和國
      'Haiti', // 海地共和國
      'Paraguay', // 巴拉圭共和國
      'Saint Kitts and Nevis', // 聖克里斯多福及尼維斯聯邦
      'Saint Lucia', // 聖露西亞
      'Saint Vincent and the Grenadines', // 聖文森及格瑞那丁

      // 非洲地區 (Africa)
      'eSwatini', // 史瓦帝尼王國

      // 歐洲地區 (Europe)
      'Vatican', // 教廷
    ]);

    /**
     * 🔍 檢查國家類型的輔助函數
     *
     * @param {string} countryName - 國家名稱
     * @param {Array} countryList - 要檢查的國家列表
     * @returns {boolean} 是否在列表中
     */
    const isCountryInList = (countryName, countryList) => {
      if (!countryName) return false;

      // 僅允許完全匹配；名稱以 GeoJSON 的欄位為準
      const normalizedName = countryName.trim();
      return countryList.some((country) => normalizedName === country);
    };

    /**
     * 🔵 檢查國家是否為邦交國 (Check if Country is Allied)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為邦交國
     */
    const isAlliedCountry = (countryName) => {
      return isCountryInList(countryName, alliedCountries.value);
    };

    // ------------------------------------------------------------
    // 地圖實例管理
    const mapInstance = ref(null);

    const setMapInstance = (map) => {
      mapInstance.value = map;
    };

    return {
      mapInstance, // 地圖實例
      setMapInstance, // 設定地圖實例
      alliedCountries, // 邦交國列表
      isAlliedCountry, // 檢查國家是否為邦交國
      microStates, // 微型國家座標列表
    };
  },
  {
    persist: true,
  }
);
