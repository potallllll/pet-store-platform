import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./dist/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./dist/styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("./dist/app.js", import.meta.url), "utf8");
const renderHeaderStart = js.indexOf("function renderHeader");
const homeHeaderStart = js.indexOf('"customer-home"', renderHeaderStart);
const homeHeader = js.slice(homeHeaderStart, js.indexOf('"customer-appointment"', homeHeaderStart));
const homeBody = js.slice(js.indexOf("function customerHome"), js.indexOf("function riskCard"));
const washDetail = js.slice(js.indexOf("function staffWashDetail"), js.indexOf("function staffCustomers"));

const checks = [
  ["HTML language", html.includes('lang="zh-CN"')],
  ["Viewport", html.includes('name="viewport"')],
  ["Main landmark", html.includes('id="app-main"')],
  ["Live region", html.includes('aria-live="polite"')],
  ["Client navigation", js.includes('预约') && js.includes('首页') && js.includes('我的')],
  ["Staff navigation", js.includes('工作台') && js.includes('业务') && js.includes('洗美') && js.includes('客户')],
  ["Launch ad modes", js.includes('微信广告') && js.includes('No Fill')],
  ["Boarding 03:00 rule", js.includes('凌晨3点')],
  ["Boarding snack before timeline", js.indexOf('寄养加餐') < js.indexOf('今天 · 11月5日')],
  ["Neighborhood product heading", js.includes('附近小区的人都在买')],
  ["Home store switch in top header", homeHeader.includes('暖爪宠物生活馆') && homeHeader.includes('home-store-switch') && homeHeader.includes('data-action="switch-store"')],
  ["Home body starts without duplicate store banner", !homeBody.includes('暖爪宠物生活馆') && !homeBody.includes('hero-banner') && !homeBody.includes('store-bar')],
  ["Temporary and member ordering", js.includes('临时开单') && js.includes('会员开单') && !js.includes('到店开单') && !js.includes('洗美开单')],
  ["Optional wash photo groups", js.includes('六个检查位置和全身') && js.includes('wash-before-') && js.includes('wash-after-')],
  ["Exactly seven wash photo positions", washDetail.includes('["皮肤","耳道","眼睛","口腔","指甲","毛发","全身"]')],
  ["Exactly fourteen optional wash photo inputs", (washDetail.match(/type="file"/g) || []).length === 2 && washDetail.includes('photoParts.map') && !washDetail.includes('required type="file"')],
  ["Compact dispute module", css.includes('.risk-card-compact') && css.includes('.risk-preview')],
  ["Small store switch with full touch target", css.includes('.home-store-switch') && css.includes('min-height:44px') && css.includes('font-size:11px')],
  ["Seven-day response", js.includes('7天回应')],
  ["No native dialog calls", !/(?:window\.)?(?:alert|confirm|prompt)\s*\(/.test(js)],
  ["No raw innerHTML assignment", !/\.innerHTML\s*=/.test(js)],
  ["Global scrollbar", css.includes('scrollbar-color') && css.includes('::-webkit-scrollbar-thumb')],
  ["Reduced motion", css.includes('prefers-reduced-motion')],
  ["Textarea resize disabled", css.includes('.field textarea') && css.includes('resize:none')],
  ["No hash links", !html.includes('href="#"') && !js.includes('href="#"')]
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
if (failed.length) process.exit(1);
console.log(`PASS ${checks.length} static checks`);
