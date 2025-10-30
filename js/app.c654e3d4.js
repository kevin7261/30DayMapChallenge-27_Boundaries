(function(){"use strict";var e={9960:function(e,t,o){var a=o(5130),n=o(657),r=o(6768);const l={id:"app",class:"d-flex flex-column vh-100"},s={class:"d-flex flex-column overflow-hidden"};function i(e,t,o,a,n,i){const c=(0,r.g2)("router-view");return(0,r.uX)(),(0,r.CE)("div",l,[(0,r.Lk)("div",s,[(0,r.bF)(c)])])}var c={name:"App"},u=o(1241);const p=(0,u.A)(c,[["render",i]]);var f=p,d=o(1387);const v={class:"vh-100 vw-100 overflow-hidden"};function g(e,t,o,a,n,l){const s=(0,r.g2)("MapTab");return(0,r.uX)(),(0,r.CE)("div",v,[(0,r.bF)(s,{onMapReady:a.setMapInstance},null,8,["onMapReady"])])}const h={id:"map-container",class:"h-100 w-100 position-relative bg-transparent z-0"},m=["id"];function M(e,t,o,a,n,l){return(0,r.uX)(),(0,r.CE)("div",h,[(0,r.Lk)("div",{id:a.mapContainerId,ref:"mapContainer",class:"h-100 w-100"},null,8,m)])}var y=o(144),b=o(5357);const T=(0,n.nY)("data",(()=>{const e=(0,y.KR)(null),t=t=>{e.value=t};return{mapInstance:e,setMapInstance:t}}),{persist:!0});
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
 */var w={name:"MapTab",emits:["map-ready"],setup(e,{emit:t}){T();const o=(0,y.KR)(null);let a=null,n=null,l=null,s=null,i=null,c=null;const u=(0,y.KR)(!1),p=(0,y.KR)(`leaflet-map-${Math.random().toString(36).substr(2,9)}`),f=(0,y.KR)("map"),d=(0,y.KR)(null);let v=100,g=0,h=null,m=null;const M=()=>{if(v=100,g=0,d.value?.features){for(const e of d.value.features){const t=e.properties||{},o=t["(1) 得票率 (%)"]||0,a=t["(2) 得票率 (%)"]||0,n=t["(3) 得票率 (%)"]||0,r=Math.max(o,a,n);r<v&&(v=r,h={COUNTYNAME:t.COUNTYNAME,TOWNNAME:t.TOWNNAME,pct:r}),r>g&&(g=r,m={COUNTYNAME:t.COUNTYNAME,TOWNNAME:t.TOWNNAME,pct:r})}v>g&&(v=g),m&&console.log(`[MapTab] 最高勝出得票率: ${m.pct.toFixed(2)}% → 100% opacity @ ${m.COUNTYNAME} ${m.TOWNNAME}`),h&&console.log(`[MapTab] 最低勝出得票率: ${h.pct.toFixed(2)}% → 20% opacity @ ${h.COUNTYNAME} ${h.TOWNNAME}`)}},w=(0,y.KR)(null),N=async()=>{try{console.log("[MapTab] 開始載入直轄市、縣(市)界線 GeoJSON 數據...");const e=await fetch("/30DayMapChallenge-27_Boundaries/data/geojson/總統_得票地圖_合併.geojson");if(!e.ok)throw new Error(`直轄市、縣(市)界線數據載入失敗: HTTP ${e.status}`);return d.value=await e.json(),console.log("[MapTab] 直轄市、縣(市)界線數據載入成功"),console.log("  - 縣市數量:",d.value.features?.length||0),M(),!0}catch(e){return console.error("[MapTab] 直轄市、縣(市)界線數據載入失敗:",e),!1}},O=async()=>{try{console.log("[MapTab] 開始載入乾隆臺灣番界 GeoJSON 數據...");const e=await fetch("/30DayMapChallenge-27_Boundaries/data/geojson/乾隆臺灣番界.geojson");if(!e.ok)throw new Error(`乾隆臺灣番界數據載入失敗: HTTP ${e.status}`);return w.value=await e.json(),console.log("[MapTab] 乾隆臺灣番界數據載入成功"),console.log("  - 邊界線數量:",w.value.features?.length||0),!0}catch(e){return console.error("[MapTab] 乾隆臺灣番界數據載入失敗:",e),!1}},x=()=>{if(!o.value)return;const e=o.value.querySelector(".map-tooltip");e&&e.remove(),c=document.createElement("div"),c.className="map-tooltip",c.style.position="absolute",c.style.pointerEvents="none",c.style.opacity="0",c.style.padding="4px 8px",o.value.appendChild(c),console.log("[MapTab] 工具提示元素創建成功")},A=e=>{const t=e["(1) 得票率 (%)"]||0,o=e["(2) 得票率 (%)"]||0,a=e["(3) 得票率 (%)"]||0,n=Math.max(t,o,a);return n===t?"#00A8AC":n===o?"#4CAF50":"#1976D2"},C=e=>{const t=e["(1) 得票率 (%)"]||0,o=e["(2) 得票率 (%)"]||0,a=e["(3) 得票率 (%)"]||0,n=Math.max(t,o,a),r=v,l=g,s=Math.max(0,l-r);if(0===s)return 1;if(Math.abs(n-l)<1e-9)return 1;const i=(n-r)/s,c=.2+.8*i;return c},E=()=>{if(i&&w.value)try{console.log("[MapTab] 開始繪製乾隆臺灣番界 GeoJSON");const e=e=>"紅線"===e?"#e53935":"藍線"===e?"#1e88e5":"紫線"===e?"#8e24aa":e&&e.includes("藍線暫定界")?"#1e88e5":"#999999",t=e=>e&&e.includes("暫定界")?"6,4":null;i.selectAll(".historical-boundary").data(w.value.features).enter().append("path").attr("d",l).attr("class","historical-boundary").attr("fill","none").attr("stroke",(t=>e(t.properties?.name))).attr("stroke-width",2).attr("stroke-opacity",.95).attr("stroke-linecap","round").attr("stroke-linejoin","round").attr("stroke-dasharray",(e=>t(e.properties?.name))).on("mouseover",(function(e,t){const o=t.properties,a=`\n                <div style="font-weight: bold; margin-bottom: 4px;">${o.name}</div>\n                <div style="color: #666;">${o.Note}</div>\n              `;c.innerHTML=a,c.style.opacity="1"})).on("mousemove",(function(e){c.style.left=e.pageX+10+"px",c.style.top=e.pageY-10+"px"})).on("mouseout",(function(){c.style.opacity="0"})),console.log("[MapTab] 乾隆臺灣番界 GeoJSON 繪製完成")}catch(e){console.error("[MapTab] 乾隆臺灣番界 GeoJSON 繪製失敗:",e)}else console.error("[MapTab] 無法繪製乾隆臺灣番界: g=",!!i,"historicalBoundaryData=",!!w.value)},k=()=>{if(i&&d.value)try{console.log("[MapTab] 開始繪製直轄市、縣(市)界線 GeoJSON"),i.selectAll(".county").data(d.value.features).enter().append("path").attr("d",l).attr("class","county").attr("fill",(e=>A(e.properties))).attr("fill-opacity",(e=>C(e.properties))).attr("stroke","#ffffff").attr("stroke-width",.5).attr("stroke-opacity",.8).on("mouseover",(function(e,t){const o=t.properties,a=o["(1) 得票率 (%)"]||0,n=o["(2) 得票率 (%)"]||0,r=o["(3) 得票率 (%)"]||0,l=o["(1) 柯文哲 吳欣盈"]||0,s=o["(2) 賴清德 蕭美琴"]||0,i=o["(3) 侯友宜 趙少康"]||0,u=Math.max(a,n,r);let p="";p=u===a?"柯文哲 吳欣盈":u===n?"賴清德 蕭美琴":"侯友宜 趙少康";const f=v,d=g,h=Math.max(0,d-f);let m=1;if(0!==h)if(Math.abs(u-d)<1e-9)m=1;else{const e=(u-f)/h;m=.2+.8*e}b.Ltv(this).attr("stroke","#ff0000").attr("stroke-width",1);const M=`\n                <div style="font-weight: bold; margin-bottom: 4px;">${o.COUNTYNAME} ${o.TOWNNAME}</div>\n                <div style="margin-bottom: 6px; padding: 4px; background: rgba(0,0,0,0.1); border-radius: 3px;">\n                  <strong>最高得票：${p}</strong><br>\n                  <small>透明度：${(100*m).toFixed(1)}%</small>\n                </div>\n                <div style="color: #00A8AC;">柯文哲 吳欣盈: ${a.toFixed(1)}% (${l.toLocaleString()}票)</div>\n                <div style="color: #4CAF50;">賴清德 蕭美琴: ${n.toFixed(1)}% (${s.toLocaleString()}票)</div>\n                <div style="color: #1976D2;">侯友宜 趙少康: ${r.toFixed(1)}% (${i.toLocaleString()}票)</div>\n              `;c.innerHTML=M,c.style.opacity="1"})).on("mousemove",(function(e){c.style.left=e.pageX+10+"px",c.style.top=e.pageY-10+"px"})).on("mouseout",(function(){c.style.opacity="0",b.Ltv(this).attr("stroke","#ffffff").attr("stroke-width",.5)})),console.log("[MapTab] 直轄市、縣(市)界線 GeoJSON 繪製完成")}catch(e){console.error("[MapTab] 直轄市、縣(市)界線 GeoJSON 繪製失敗:",e)}else console.error("[MapTab] 無法繪製直轄市、縣(市)界線: g=",!!i,"countyData=",!!d.value)},$=async()=>{if(f.value="map",console.log("[MapTab] 切換顯示模式: map (grid 已停用)"),"map"===f.value){if(d.value||await N(),w.value||await O(),a&&!n&&(a.remove(),a=null),n&&l)a&&s&&a.call(s.transform,b.GSI);else{const e=o.value.getBoundingClientRect();if(e.width>0&&e.height>0){const t=e.width,r=e.height;a&&a.remove(),a=b.Ltv(o.value).append("svg").attr("width",t).attr("height",r).style("background","#ffffff"),n=b.bAh().center([121,23.5]).scale(12e3).translate([t/2,r/2]),l=b.zFW().projection(n),i=a.append("g"),s=b.s_O().scaleExtent([.5,50]).on("zoom",(e=>{i.attr("transform",e.transform)})),a.call(s),a.call(s.transform,b.GSI),x(),u.value=!0}}k(),w.value&&E()}},j=()=>{if(!o.value)return!1;const e=o.value.getBoundingClientRect();if(0===e.width||0===e.height)return console.warn("[MapTab] 容器尺寸為零，延遲初始化"),!1;try{const r=e.width,c=e.height;return a=b.Ltv(o.value).append("svg").attr("width",r).attr("height",c).style("background","#ffffff"),n=b.bAh().center([121,23.5]).scale(12e3).translate([r/2,c/2]),l=b.zFW().projection(n),i=a.append("g"),s=b.s_O().scaleExtent([.5,50]).on("zoom",(e=>{i.attr("transform",e.transform)})),a.call(s),a.call(s.transform,b.GSI),x(),u.value=!0,t("map-ready",{svg:a,projection:n,path:l}),console.log("[MapTab] D3.js 地圖創建成功"),!0}catch(r){return console.error("[MapTab] D3.js 地圖創建失敗:",r),!1}},_=async()=>{let e=0;const t=20;if("map"===f.value){console.log("[MapTab] 開始載入地圖模式數據...");const o=await N(),a=await O();if(!o)return void console.error("[MapTab] 無法載入縣市界線數據");a||console.warn("[MapTab] 無法載入乾隆臺灣番界數據，將只顯示縣市界線"),console.log("[MapTab] 數據載入完成，開始創建地圖");const n=async()=>{e>=t?console.error("[MapTab] 地圖初始化失敗，已達到最大嘗試次數"):(e++,console.log(`[MapTab] 嘗試創建地圖 (${e}/${t})`),j()?(console.log("[MapTab] 地圖創建成功，開始繪製圖層"),k(),w.value&&E()):(console.log("[MapTab] 地圖創建失敗，100ms 後重試"),setTimeout(n,100)))};n()}};return(0,r.sV)((()=>{(0,r.dY)((()=>{_()}))})),(0,r.hi)((()=>{a&&(a.remove(),a=null),c&&(c.remove(),c=null),n=null,l=null,s=null,i=null,u.value=!1})),{mapContainer:o,mapContainerId:p,displayMode:f,toggleDisplayMode:$}}};const N=(0,u.A)(w,[["render",M],["__scopeId","data-v-206e51b8"]]);var O=N,x={name:"HomeView",components:{MapTab:O},setup(){const e=T(),t=t=>e.setMapInstance(t);return{setMapInstance:t}}};const A=(0,u.A)(x,[["render",g]]);var C=A;const E=[{path:"/",name:"Home",component:C}],k=(0,d.aE)({history:(0,d.LA)("/30DayMapChallenge-27_Boundaries/"),routes:E});var $=k;o(323);console.log("🎨 樣式文件載入完成");const j=(0,a.Ef)(f),_=(0,n.Ey)();j.use($),j.use(_),j.mount("#app"),console.log("🚀 空間分析視覺化平台已啟動"),console.log("📦 Pinia 狀態管理已初始化"),console.log("🗺️ Vue Router 路由系統已就緒"),console.log("🎨 Bootstrap 5 UI 框架已載入"),console.log("🗺️ D3.js 地圖庫已準備就緒"),console.log("🔤 Font Awesome 圖示庫已載入")}},t={};function o(a){var n=t[a];if(void 0!==n)return n.exports;var r=t[a]={exports:{}};return e[a].call(r.exports,r,r.exports,o),r.exports}o.m=e,function(){var e=[];o.O=function(t,a,n,r){if(!a){var l=1/0;for(u=0;u<e.length;u++){a=e[u][0],n=e[u][1],r=e[u][2];for(var s=!0,i=0;i<a.length;i++)(!1&r||l>=r)&&Object.keys(o.O).every((function(e){return o.O[e](a[i])}))?a.splice(i--,1):(s=!1,r<l&&(l=r));if(s){e.splice(u--,1);var c=n();void 0!==c&&(t=c)}}return t}r=r||0;for(var u=e.length;u>0&&e[u-1][2]>r;u--)e[u]=e[u-1];e[u]=[a,n,r]}}(),function(){o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,{a:t}),t}}(),function(){o.d=function(e,t){for(var a in t)o.o(t,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={524:0};o.O.j=function(t){return 0===e[t]};var t=function(t,a){var n,r,l=a[0],s=a[1],i=a[2],c=0;if(l.some((function(t){return 0!==e[t]}))){for(n in s)o.o(s,n)&&(o.m[n]=s[n]);if(i)var u=i(o)}for(t&&t(a);c<l.length;c++)r=l[c],o.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return o.O(u)},a=self["webpackChunk_30DayMapChallenge_27_Boundaries"]=self["webpackChunk_30DayMapChallenge_27_Boundaries"]||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))}();var a=o.O(void 0,[504],(function(){return o(9960)}));a=o.O(a)})();
//# sourceMappingURL=app.c654e3d4.js.map