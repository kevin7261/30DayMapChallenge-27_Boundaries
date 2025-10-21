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
     * 🏠 台灣 (Taiwan)
     *
     * 台灣在地圖上會以紅色標示
     */
    const homeCountry = ref('Taiwan');

    /**
     * 🌍 已造訪國家列表 (Visited Countries List)
     *
     * 這些國家在地圖上會以淺藍色標示
     * 名稱需與 GeoJSON 中的 properties.NAME 欄位完全匹配
     * 按英文字母順序排列
     */
    const visitedCountries = ref([
      'Algeria',
      'Angola',
      'Antigua and Barbuda',
      'Armenia',
      'Australia',
      'Austria',
      'Azerbaijan',
      'Bahrain',
      'Bangladesh',
      'Barbados',
      'Belgium',
      'Belize',
      'Benin',
      'Bhutan',
      'Bolivia',
      'Brazil',
      'Brunei',
      'Bulgaria',
      'Burkina Faso',
      'Burundi',
      'Cabo Verde',
      'Cambodia',
      'Cameroon',
      'Canada',
      'Central African Rep.',
      'Central African Republic',
      'Chad',
      'Chile',
      'China',
      "People's Republic of China",
      'Colombia',
      'Comoros',
      "Côte d'Ivoire",
      'Ivory Coast',
      'Croatia',
      'Cuba',
      'Czech Republic',
      'Czechia',
      'Dem. Rep. Congo',
      'Democratic Republic of the Congo',
      'Denmark',
      'Djibouti',
      'Dominican Rep.',
      'Dominican Republic',
      'Egypt',
      'Eq. Guinea',
      'Equatorial Guinea',
      'eSwatini',
      'Eswatini',
      'Ethiopia',
      'Fiji',
      'Finland',
      'France',
      'Gabon',
      'Gambia',
      'Germany',
      'Ghana',
      'Grenada',
      'Guatemala',
      'Guinea',
      'Guinea-Bissau',
      'Guyana',
      'Haiti',
      'Honduras',
      'Hungary',
      'Iceland',
      'India',
      'Indonesia',
      'Ireland',
      'Israel',
      'Italy',
      'Jamaica',
      'Japan',
      'Jordan',
      'Kazakhstan',
      'Kenya',
      'South Korea',
      'Kosovo',
      'Kuwait',
      'Kyrgyzstan',
      'Laos',
      'Latvia',
      'Lesotho',
      'Liberia',
      'Lithuania',
      'Luxembourg',
      'Madagascar',
      'Malawi',
      'Malaysia',
      'Mali',
      'Malta',
      'Marshall Islands',
      'Mauritania',
      'Mauritius',
      'Micronesia',
      'Moldova',
      'Monaco',
      'Mongolia',
      'Montenegro',
      'Mozambique',
      'Nauru',
      'Nepal',
      'Netherlands',
      'Nigeria',
      'North Macedonia',
      'Norway',
      'Oman',
      'Pakistan',
      'Palau',
      'Palestine',
      'Panama',
      'Papua New Guinea',
      'Paraguay',
      'Peru',
      'Philippines',
      'Poland',
      'Portugal',
      'Qatar',
      'Romania',
      'Rwanda',
      'Saint Kitts and Nevis',
      'Saint Lucia',
      'Saint Vincent and the Grenadines',
      'Samoa',
      'San Marino',
      'São Tomé and Príncipe',
      'Saudi Arabia',
      'Senegal',
      'Serbia',
      'Republic of Serbia',
      'Seychelles',
      'Sierra Leone',
      'Singapore',
      'Slovakia',
      'Slovenia',
      'Solomon Is.',
      'Solomon Islands',
      'Somalia',
      'S. Sudan',
      'South Sudan',
      'Spain',
      'Sri Lanka',
      'Sudan',
      'Suriname',
      'Sweden',
      'Switzerland',
      'Tajikistan',
      'Tanzania',
      'Thailand',
      'Timor-Leste',
      'Togo',
      'Tonga',
      'Trinidad and Tobago',
      'Tunisia',
      'Turkey',
      'Türkiye',
      'Turkmenistan',
      'Tuvalu',
      'Uganda',
      'Ukraine',
      'United Arab Emirates',
      'United Kingdom',
      'United States',
      'United States of America',
      'Uruguay',
      'Uzbekistan',
      'Vanuatu',
      'Vatican',
      'Vietnam',
      'Yemen',
      'Zambia',
      'Zimbabwe',
    ]);

    /**
     * 🏠 檢查國家是否為台灣 (Check if Country is Taiwan)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為台灣
     */
    const isHomeCountry = (countryName) => {
      if (!countryName) return false;
      return countryName.trim() === homeCountry.value;
    };

    /**
     * 🔍 檢查國家是否已造訪 (Check if Country is Visited)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為已造訪國家
     */
    const isCountryVisited = (countryName) => {
      if (!countryName) return false;

      // 標準化國家名稱進行比對
      const normalizedName = countryName.trim();

      return visitedCountries.value.some((visitedCountry) => {
        // 完全匹配
        if (normalizedName === visitedCountry) return true;

        // 部分匹配（例如 "United States" 匹配 "United States of America"）
        if (normalizedName.includes(visitedCountry) || visitedCountry.includes(normalizedName)) {
          return true;
        }

        return false;
      });
    };

    // ------------------------------------------------------------
    // 選中的地圖物件（用於清除選取狀態）
    const selectedFeature = ref(null);

    const setSelectedFeature = (feature) => {
      selectedFeature.value = feature;
    };

    // ------------------------------------------------------------
    // 地圖實例管理
    const mapInstance = ref(null);

    const setMapInstance = (map) => {
      mapInstance.value = map;
    };

    return {
      selectedFeature, // 選中的地圖要素
      setSelectedFeature, // 設定選中的地圖要素
      mapInstance, // 地圖實例
      setMapInstance, // 設定地圖實例
      homeCountry, // 台灣（紅色標示）
      isHomeCountry, // 檢查國家是否為台灣
      visitedCountries, // 已造訪國家列表
      isCountryVisited, // 檢查國家是否已造訪
    };
  },
  {
    persist: true,
  }
);
