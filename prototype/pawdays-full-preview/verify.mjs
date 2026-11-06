import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./dist/index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./dist/styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("./dist/app.js", import.meta.url), "utf8");
const renderHeaderStart = js.indexOf("function renderHeader");
const homeHeaderStart = js.indexOf('"customer-home"', renderHeaderStart);
const homeHeader = js.slice(homeHeaderStart, js.indexOf('"customer-appointment"', homeHeaderStart));
const homeBody = js.slice(js.indexOf("function customerHome"), js.indexOf("function riskCard"));
const washDetail = js.slice(js.indexOf("function staffWashDetail"), js.indexOf("function staffCustomers"));
const customerPets = js.slice(js.indexOf("function customerPets"), js.indexOf("function customerWallet"));
const staffDisputes = js.slice(js.indexOf("function staffDisputes"), js.indexOf("function staffOrders"));
const staffCustomerDetail = js.slice(js.indexOf("function staffCustomerDetail"), js.indexOf("function staffMe"));
const openOrderSheet = js.slice(js.indexOf("function openOrderSheet"), js.indexOf("function handleForm"));

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
  ["Store recommendation heading", js.includes('sectionHead("本店推荐"') && !js.includes('附近小区的人都在买')],
  ["Home store switch in top header", homeHeader.includes('暖爪宠物生活馆') && homeHeader.includes('home-store-switch') && homeHeader.includes('data-action="switch-store"')],
  ["Home body starts without duplicate store banner", !homeBody.includes('暖爪宠物生活馆') && !homeBody.includes('hero-banner') && !homeBody.includes('store-bar')],
  ["Temporary and member ordering", js.includes('临时开单') && js.includes('会员开单') && !js.includes('到店开单') && !js.includes('洗美开单')],
  ["Shared order service and price fields", openOrderSheet.includes('name="serviceType" required') && openOrderSheet.includes('洗护') && openOrderSheet.includes('美容') && openOrderSheet.includes('其他') && openOrderSheet.includes('name="price" type="number"') && openOrderSheet.includes('inputmode="decimal" required')],
  ["Optional wash photo groups", js.includes('六个检查位置和全身') && js.includes('wash-before-') && js.includes('wash-after-')],
  ["Exactly seven wash photo positions", washDetail.includes('["皮肤","耳道","眼睛","口腔","指甲","毛发","全身"]')],
  ["Exactly fourteen optional wash photo inputs", (washDetail.match(/type="file"/g) || []).length === 2 && washDetail.includes('photoParts.map') && !washDetail.includes('required type="file"')],
  ["Compact dispute module", css.includes('.risk-card-compact') && css.includes('.risk-preview')],
  ["Small store switch with full touch target", css.includes('.home-store-switch') && css.includes('min-height:44px') && css.includes('font-size:11px')],
  ["Seven-day response", js.includes('7天回应')],
  ["Four dispute groups", ["待回应","补充材料中","待平台裁决","已结束"].every(group => staffDisputes.includes(group))],
  ["Dispute filters and three-day evidence", staffDisputes.includes('手机号／争议编号') && staffDisputes.includes('3天补证') && staffDisputes.includes('逾期优先')],
  ["Food responsibility split", staffDisputes.includes('平台直接联系厂家') && staffDisputes.includes('门店不参与前置核实') && staffDisputes.includes('审核通过厂家回应即算回应')],
  ["Customer risk records hidden", customerPets.includes('顾客端不显示任何已审核或未审核顾客风险') && !customerPets.includes('顾客风险 · 顾客相关')],
  ["Unified cross-store risk sections", staffCustomerDetail.includes('宠物护理注意事项') && staffCustomerDetail.includes('顾客风险 · 顾客相关') && staffCustomerDetail.includes('顾客风险 · 宠物相关') && !staffCustomerDetail.includes('宠物行为与服务安全')],
  ["Read-only staff food brand", staffCustomerDetail.includes('当前食用品牌（只读）') && staffCustomerDetail.includes('主人暂未填写') && !staffCustomerDetail.includes('edit-food-brand')],
  ["Risk submit review simulation", js.includes('data-form="customer-risk"') && js.includes('原型未连接真实审核后台')],
  ["No ordinary cross-store history import", js.includes('V1不提供跨店普通档案、服务报告或护理历史导入') && !js.includes('授权导入可触发') && !js.includes('一键导入其他门店')],
  ["Settlement coupon validation", js.includes('checkout-coupon') && js.includes('结算成功后自动核销并关联本单') && !js.includes('data-action="redeem-coupon"')],
  ["Settlement locked and no balance edit", js.includes('结算成功后金额、付款拆分和收款时间锁定') && js.includes('充值退款') && !js.includes('data-action="adjust-balance"') && !js.includes('data-action="correct-payment"')],
  ["Only required reasons", js.includes('挂单原因（选填）') && js.includes('调价原因（选填）') && js.includes('免单原因') && js.includes('退款原因') && !js.includes('变更原因必填')],
  ["Feeding lifecycle and reassignment", js.includes('到结束日期自动结束') && js.includes('自动转给最近有效门店') && js.includes('附近暂无服务门店') && js.includes('新店重新确认后可查看双方完整联系方式')],
  ["Reward disabled-store refund", js.includes('原领取门店已停用') && js.includes('积分已退回') && js.includes('重要通知') && js.includes('不让顾客改选门店')],
  ["Points mall physical only", js.includes('V1积分商城只兑换实物')],
  ["Suggestion is platform only", js.includes('建议只提供给平台查看') && js.includes('不生成门店回应待办')],
  ["Launch timing", js.includes('资源最多等待2秒') && js.includes('图片展示3秒') && js.includes('scheduleLaunchAutoDismiss') && js.includes('}, 3000)')],
  ["Wash supplement is silent", washDetail.includes('补图或修改普通说明均不发送通知')],
  ["Owner-only license", js.includes('ownerOnlyRoutes') && js.includes('营业执照等老板专属信息')],
  ["Sanitized HTML helper", js.includes('querySelectorAll("script,style,link,meta,iframe,object,embed,base")') && js.includes('name.startsWith("on")') && js.includes('value.startsWith("javascript:")') && js.includes('replaceChildren')],
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
