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
     */
    const microStates = ref([
      // 歐洲微型國家
      { name: 'Andorra', coordinates: [1.5218, 42.5063] }, // 安道爾
      { name: 'Liechtenstein', coordinates: [9.5215, 47.141] }, // 列支敦士登
      { name: 'San Marino', coordinates: [12.4578, 43.9424] }, // 聖馬利諾
      { name: 'Vatican', coordinates: [12.4534, 41.9029] }, // 梵蒂岡
      { name: 'Vatican City', coordinates: [12.4534, 41.9029] }, // 梵蒂岡（別名）
      { name: 'Monaco', coordinates: [7.4246, 43.7384] }, // 摩納哥
      { name: 'Malta', coordinates: [14.3754, 35.9375] }, // 馬爾他

      // 加勒比海島國（微型）
      { name: 'Barbados', coordinates: [-59.5432, 13.1939] }, // 巴巴多斯
      { name: 'Antigua and Barbuda', coordinates: [-61.8456, 17.0608] }, // 安地卡及巴布達
      { name: 'Saint Kitts and Nevis', coordinates: [-62.783, 17.3578] }, // 聖克里斯多福及尼維斯
      { name: 'Saint Lucia', coordinates: [-60.9789, 13.9094] }, // 聖露西亞
      { name: 'Saint Vincent and the Grenadines', coordinates: [-61.2872, 13.2528] }, // 聖文森及格瑞那丁
      { name: 'Grenada', coordinates: [-61.679, 12.1165] }, // 格瑞那達
      { name: 'Dominica', coordinates: [-61.371, 15.415] }, // 多米尼克

      // 印度洋島國
      { name: 'Seychelles', coordinates: [55.492, -4.6796] }, // 塞席爾
      { name: 'Mauritius', coordinates: [57.5522, -20.1609] }, // 模里西斯
      { name: 'Comoros', coordinates: [43.3333, -11.6455] }, // 葛摩
      { name: 'Maldives', coordinates: [73.2207, 3.2028] }, // 馬爾地夫

      // 非洲島國
      { name: 'Cabo Verde', coordinates: [-23.6052, 16.5388] }, // 維德角
      { name: 'Cape Verde', coordinates: [-23.6052, 16.5388] }, // 維德角（別名）
      { name: 'São Tomé and Príncipe', coordinates: [6.6131, 0.1864] }, // 聖多美普林西比

      // 中東/波斯灣（微型）
      { name: 'Bahrain', coordinates: [50.5577, 26.0667] }, // 巴林

      // 東南亞（微型）
      { name: 'Singapore', coordinates: [103.8198, 1.3521] }, // 新加坡

      // 太平洋島國（微型）
      { name: 'Palau', coordinates: [134.5825, 7.515] }, // 帛琉
      { name: 'Nauru', coordinates: [166.9315, -0.5228] }, // 諾魯
      { name: 'Tuvalu', coordinates: [179.1962, -8.5167] }, // 吐瓦魯
      { name: 'Marshall Islands', coordinates: [171.1845, 7.1315] }, // 馬紹爾群島
      { name: 'Micronesia', coordinates: [158.1625, 6.9248] }, // 密克羅尼西亞
      { name: 'Tonga', coordinates: [-175.1982, -21.1789] }, // 東加
      { name: 'Samoa', coordinates: [-172.1046, -13.759] }, // 薩摩亞
      { name: 'Niue', coordinates: [-169.9167, -19.0544] }, // 紐埃
      { name: 'Kiribati', coordinates: [-157.363, 1.8709] }, // 吉里巴斯
    ]);

    /**
     * 🔵 參與國家列表 (Participant Countries List)
     *
     * 這些國家在地圖上會以淺藍色標示
     * 名稱需與 GeoJSON 中的 properties.NAME 欄位完全匹配
     * 按英文字母順序排列
     */
    const participantCountries = ref([
      'Algeria', // 阿爾及利亞
      'Angola', // 安哥拉
      'Antigua and Barbuda', // 安地卡及巴布達
      'Armenia', // 亞美尼亞
      'Australia', // 澳大利亞
      'Austria', // 奧地利
      'Azerbaijan', // 亞塞拜然
      'Bahrain', // 巴林
      'Bangladesh', // 孟加拉
      'Barbados', // 巴巴多斯
      'Belgium', // 比利時
      'Belize', // 貝里斯
      'Benin', // 貝南
      'Bhutan', // 不丹
      'Bolivia', // 玻利維亞
      'Brazil', // 巴西
      'Brunei', // 汶萊
      'Bulgaria', // 保加利亞
      'Burkina Faso', // 布吉納法索
      'Burundi', // 蒲隆地
      'Cabo Verde', // 維德角
      'Cape Verde', // 維德角（別名）
      'Cambodia', // 柬埔寨
      'Cameroon', // 喀麥隆
      'Canada', // 加拿大
      'Central African Rep.', // 中非共和國（縮寫）
      'Central African Republic', // 中非共和國
      'Chad', // 查德
      'Chile', // 智利
      'China', // 中國
      "People's Republic of China", // 中華人民共和國
      'Colombia', // 哥倫比亞
      'Comoros', // 葛摩
      "Côte d'Ivoire", // 象牙海岸
      'Ivory Coast', // 象牙海岸（別名）
      'Croatia', // 克羅埃西亞
      'Cuba', // 古巴
      'Czech Republic', // 捷克共和國
      'Czechia', // 捷克
      'Dem. Rep. Congo', // 剛果民主共和國（縮寫）
      'Democratic Republic of the Congo', // 剛果民主共和國
      'Denmark', // 丹麥
      'Djibouti', // 吉布地
      'Dominican Rep.', // 多明尼加（縮寫）
      'Dominican Republic', // 多明尼加
      'Egypt', // 埃及
      'Eq. Guinea', // 赤道幾內亞（縮寫）
      'Equatorial Guinea', // 赤道幾內亞
      'eSwatini', // 史瓦帝尼
      'Eswatini', // 史瓦帝尼（別名）
      'Ethiopia', // 衣索比亞
      'Fiji', // 斐濟
      'Finland', // 芬蘭
      'France', // 法國
      'Gabon', // 加彭
      'Gambia', // 甘比亞
      'Germany', // 德國
      'Ghana', // 迦納
      'Grenada', // 格瑞那達
      'Guatemala', // 瓜地馬拉
      'Guinea', // 幾內亞
      'Guinea-Bissau', // 幾內亞比索
      'Guyana', // 蓋亞那
      'Haiti', // 海地
      'Honduras', // 宏都拉斯
      'Hungary', // 匈牙利
      'Iceland', // 冰島
      'India', // 印度
      'Indonesia', // 印尼
      'Ireland', // 愛爾蘭
      'Israel', // 以色列
      'Italy', // 義大利
      'Jamaica', // 牙買加
      'Japan', // 日本
      'Jordan', // 約旦
      'Kazakhstan', // 哈薩克
      'Kenya', // 肯亞
      'South Korea', // 韓國
      'Kosovo', // 科索沃
      'Kuwait', // 科威特
      'Kyrgyzstan', // 吉爾吉斯
      'Laos', // 寮國
      'Latvia', // 拉脫維亞
      'Lesotho', // 賴索托
      'Liberia', // 賴比瑞亞
      'Lithuania', // 立陶宛
      'Luxembourg', // 盧森堡
      'Madagascar', // 馬達加斯加
      'Malawi', // 馬拉威
      'Malaysia', // 馬來西亞
      'Mali', // 馬利
      'Malta', // 馬爾他
      'Marshall Islands', // 馬紹爾群島
      'Mauritania', // 茅利塔尼亞
      'Mauritius', // 模里西斯
      'Micronesia', // 密克羅尼西亞
      'Moldova', // 摩爾多瓦
      'Monaco', // 摩納哥
      'Mongolia', // 蒙古
      'Montenegro', // 蒙特內哥羅
      'Mozambique', // 莫三比克
      'Nauru', // 諾魯
      'Nepal', // 尼泊爾
      'Netherlands', // 荷蘭
      'Nigeria', // 奈及利亞
      'North Macedonia', // 北馬其頓
      'Norway', // 挪威
      'Oman', // 阿曼
      'Pakistan', // 巴基斯坦
      'Palau', // 帛琉
      'Palestine', // 巴勒斯坦
      'Panama', // 巴拿馬
      'Papua New Guinea', // 巴布亞紐幾內亞
      'Paraguay', // 巴拉圭
      'Peru', // 秘魯
      'Philippines', // 菲律賓
      'Poland', // 波蘭
      'Portugal', // 葡萄牙
      'Qatar', // 卡達
      'Romania', // 羅馬尼亞
      'Rwanda', // 盧安達
      'Saint Kitts and Nevis', // 聖克里斯多福及尼維斯
      'Saint Lucia', // 聖露西亞
      'Saint Vincent and the Grenadines', // 聖文森及格瑞那丁
      'Samoa', // 薩摩亞
      'San Marino', // 聖馬利諾
      'São Tomé and Príncipe', // 聖多美普林西比
      'Saudi Arabia', // 沙烏地阿拉伯
      'Senegal', // 塞內加爾
      'Serbia', // 塞爾維亞
      'Republic of Serbia', // 塞爾維亞共和國
      'Seychelles', // 塞席爾
      'Sierra Leone', // 獅子山
      'Singapore', // 新加坡
      'Slovakia', // 斯洛伐克
      'Slovenia', // 斯洛維尼亞
      'Solomon Is.', // 索羅門群島（縮寫）
      'Solomon Islands', // 索羅門群島
      'Somalia', // 索馬利亞
      'S. Sudan', // 南蘇丹（縮寫）
      'South Sudan', // 南蘇丹
      'Spain', // 西班牙
      'Sri Lanka', // 斯里蘭卡
      'Sudan', // 蘇丹
      'Suriname', // 蘇利南
      'Sweden', // 瑞典
      'Switzerland', // 瑞士
      'Taiwan', // 台灣
      'Tajikistan', // 塔吉克
      'Tanzania', // 坦尚尼亞
      'Thailand', // 泰國
      'Timor-Leste', // 東帝汶
      'Togo', // 多哥
      'Tonga', // 東加
      'Trinidad and Tobago', // 千里達及托巴哥
      'Tunisia', // 突尼西亞
      'Turkey', // 土耳其
      'Türkiye', // 土耳其（官方名稱）
      'Turkmenistan', // 土庫曼
      'Tuvalu', // 吐瓦魯
      'Uganda', // 烏干達
      'Ukraine', // 烏克蘭
      'United Arab Emirates', // 阿拉伯聯合大公國
      'United Kingdom', // 英國
      'United States', // 美國
      'United States of America', // 美利堅合眾國
      'Uruguay', // 烏拉圭
      'Uzbekistan', // 烏茲別克
      'Vanuatu', // 萬那杜
      'Vatican', // 梵蒂岡
      'Vietnam', // 越南
      'Yemen', // 葉門
      'Zambia', // 尚比亞
      'Zimbabwe', // 辛巴威
    ]);

    /**
     * 🟢 退出國家列表 (Withdrawn Countries List)
     *
     * 這些國家已退出，在地圖上會以綠色標示
     * 包含退出日期
     */
    const withdrawnCountries = ref([
      'Afghanistan', // 阿富汗 (1 November 2024)
      'Argentina', // 阿根廷 (18 June 2024)
      'Botswana', // 波札那 (27 December 2024)
      'El Salvador', // 薩爾瓦多 (27 December 2024)
      'Estonia', // 愛沙尼亞 (14 November 2023)
      'Greece', // 希臘 (29 November 2024)
      'Iran', // 伊朗 (27 December 2024)
      'Mexico', // 墨西哥 (14 November 2023)
      'Niger', // 尼日 (1 November 2024)
      'Niue', // 紐埃 (18 June 2024)
      'Russia', // 俄羅斯 (28 November 2023)
      'Russian Federation', // 俄羅斯聯邦（別名）
      'South Africa', // 南非 (27 December 2024)
    ]);

    /**
     * 🔴 未參與國家列表 (Non-Participant Countries List)
     *
     * 這些國家未參與，在地圖上會以紅色標示
     */
    const nonParticipantCountries = ref([
      'Albania', // 阿爾巴尼亞
      'Andorra', // 安道爾
      'Bahamas', // 巴哈馬
      'Belarus', // 白俄羅斯
      'Bosnia and Herzegovina', // 波士尼亞與赫塞哥維納
      'Bosnia and Herz.', // 波士尼亞與赫塞哥維納（縮寫）
      'Congo', // Republic of the Congo（GeoJSON NAME）
      'Cook Islands', // 庫克群島
      'Costa Rica', // 哥斯大黎加
      'Cyprus', // 賽普勒斯
      'Dominica', // 多米尼克
      'Ecuador', // 厄瓜多
      'Eritrea', // 厄利垂亞
      'Georgia', // 喬治亞
      'Iraq', // 伊拉克
      'Kiribati', // 吉里巴斯
      'Lebanon', // 黎巴嫩
      'Libya', // 利比亞
      'Liechtenstein', // 列支敦士登
      'Maldives', // 馬爾地夫
      'Morocco', // 摩洛哥
      'Myanmar', // 緬甸
      'Burma', // 緬甸（別名）
      'Namibia', // 納米比亞
      'New Zealand', // 紐西蘭
      'Nicaragua', // 尼加拉瓜
      'North Korea', // 北韓
      'Dem. Rep. Korea', // 北韓（縮寫）
      'Korea', // 北韓（簡稱）
      'Syria', // 敘利亞
      'Syrian Arab Republic', // 敘利亞（官方名稱）
      'Venezuela', // 委內瑞拉
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
     * 🔵 檢查國家是否為參與國 (Check if Country is Participant)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為參與國家
     */
    const isParticipantCountry = (countryName) => {
      return isCountryInList(countryName, participantCountries.value);
    };

    /**
     * 🟢 檢查國家是否為退出國 (Check if Country is Withdrawn)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為退出國家
     */
    const isWithdrawnCountry = (countryName) => {
      return isCountryInList(countryName, withdrawnCountries.value);
    };

    /**
     * 🔴 檢查國家是否為未參與國 (Check if Country is Non-Participant)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為未參與國家
     */
    const isNonParticipantCountry = (countryName) => {
      return isCountryInList(countryName, nonParticipantCountries.value);
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
      participantCountries, // 參與國家列表
      withdrawnCountries, // 退出國家列表
      nonParticipantCountries, // 未參與國家列表
      isParticipantCountry, // 檢查國家是否為參與國
      isWithdrawnCountry, // 檢查國家是否為退出國
      isNonParticipantCountry, // 檢查國家是否為未參與國
      microStates, // 微型國家座標列表
    };
  },
  {
    persist: true,
  }
);
