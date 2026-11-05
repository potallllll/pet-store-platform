"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const setHTML = (element, html) => {
  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  element.replaceChildren(...Array.from(parsed.body.childNodes));
};
const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

const icons = {
  home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-5 3.5-7 8-7s7.2 2 8 7"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  sparkle:'<path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.7-4 2.8-6 6-6s5.3 2 6 6m0-5c3.4-.5 5.4 1.2 6 4"/>',
  bag:'<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  boarding:'<path d="M4 19V8h16v11M7 8V5h10v3M3 19h18M8 13h8"/>',
  wash:'<path d="M12 3C9 7 6 10 6 14a6 6 0 0 0 12 0c0-4-3-7-6-11Z"/><path d="M9 15c.6 1.8 1.7 2.7 3.5 3"/>',
  wallet:'<path d="M3 6h15v14H3z"/><path d="M3 9h18v7h-5a3 3 0 0 1 0-6h5M6 3h12v3"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"/><path d="M10 20h4"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  back:'<path d="m15 18-6-6 6-6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  close:'<path d="M5 5l14 14M19 5 5 19"/>',
  pet:'<path d="M8 11c-2 0-3-2-2-4s3-1 3 1m7 3c2 0 3-2 2-4s-3-1-3 1M6 15c-2-1-4 1-3 3s3 2 4 0m11-3c2-1 4 1 3 3s-3 2-4 0"/><path d="M8 18c0-4 2-7 4-7s4 3 4 7c0 3-2 4-4 3-2 1-4 0-4-3Z"/>',
  warning:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
  feed:'<path d="M5 12h14l-2 8H7l-2-8Z"/><path d="M8 12c0-4 2-7 4-9 2 2 4 5 4 9"/>',
  box:'<path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 7 8 4v10l-8-4V7Zm16 0-8 4v10l8-4V7Z"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6m-6 4h6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.6 3h-4l-.3 3.1a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 3.1h4l.3-3.1a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  chart:'<path d="M4 20V9m6 11V4m6 16v-7m5 7H2"/>',
  camera:'<path d="M4 7h4l2-3h4l2 3h4v13H4V7Z"/><circle cx="12" cy="13" r="4"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 18h4"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z"/><path d="m9 12 2 2 4-5"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 0 1 5 1c0 2-2.5 2-2.5 4m0 3h.01"/>',
  log:'<path d="M5 3h14v18H5z"/><path d="M8 7h8m-8 4h8m-8 4h5"/>',
  gift:'<path d="M3 9h18v12H3zM2 6h20v4H2zM12 6v15"/><path d="M12 6c-3 0-5-1-5-3 0-1 1-2 2-2 2 0 3 3 3 5Zm0 0c3 0 5-1 5-3 0-1-1-2-2-2-2 0-3 3-3 5Z"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  logout:'<path d="M10 4H4v16h6m5-4 4-4-4-4m4 4H9"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  edit:'<path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>'
};
const icon = (name, label = "") => `<svg viewBox="0 0 24 24" ${label ? `role="img" aria-label="${escapeHTML(label)}"` : 'aria-hidden="true"'}>${icons[name] || icons.grid}</svg>`;

const initialState = () => ({
  role:"customer", perspective:"owner", route:"customer-home", previousRoute:null, tab:"home", scenario:"busy",
  launchVisible:true, launchMode:"图片", adState:"loaded", advisorSide:"left", advisorEligible:true,
  cart:[], signed:false, points:1280, couponCount:4, toastId:0, activeTab:{}, modal:null,
  appointmentSubmitted:false, reminderRead:false, orderPaid:false, washState:"in_progress", boardingCareCount:3,
  foodRiskAcknowledged:false, disputeResponded:false, importedHistory:false, riskSubmitted:false, employeeStatus:"active",
  goods:[
    {id:"g1",name:"冻干鸡肉粒",price:39,stock:"有货",category:"零食"},
    {id:"g2",name:"低敏主粮",price:128,stock:"库存紧张",category:"主粮"},
    {id:"g3",name:"洁齿磨牙棒",price:29,stock:"有货",category:"护理"}
  ]
});
let state = initialState();

const routes = [
  ["customer-home","客户端：首页与当前服务","首页"],["customer-appointment","客户端：预约","预约"],["customer-boarding","客户端：寄养动态与加餐","寄养"],
  ["customer-result","客户端：洗美结果与 AI 报告","洗美"],["customer-risk","客户端：消费争议与食品风险","消费争议"],["customer-feeding","客户端：上门喂养需求市场","上门喂养"],
  ["customer-products","客户端：商品与购物车","商品"],["customer-pets","客户端：宠物档案与历史导入","宠物档案"],["customer-wallet","客户端：钱包、券与邀请码","钱包"],
  ["customer-points","客户端：积分签到与奖励自提","积分"],["customer-orders","客户端：订单与退款展示","订单"],["customer-messages","客户端：普通/重要通知","消息"],
  ["customer-complaints","客户端：投诉与建议","投诉"],["customer-settings","客户端：账号与设置","账号"],["customer-advisor","客户端：养宠顾问","顾问"],
  ["staff-workbench","店员端：当日工作台","工作台"],["staff-business","店员端：业务全部菜单","业务"],["staff-appointments","店员端：预约管理","预约"],
  ["staff-goods","店员端：商品处理","商品处理"],["staff-boarding","店员端：寄养入住与照护","寄养"],["staff-feeding","店员端：上门喂养确认","上门喂养"],
  ["staff-disputes","店员端：消费争议回应","消费争议"],["staff-orders","店员端：订单、收银与挂单","收银"],["staff-wash","店员端：洗美办理","洗美"],
  ["staff-wash-detail","店员端：洗美服务详情","洗美流程"],["staff-customers","店员端：客户资料与跨店提醒","客户"],["staff-customer-detail","店员端：客户详情与资产","客户详情"],
  ["staff-me","店员端：我的","我的"],["staff-performance","店员端：业绩与工作记录","业绩"],["staff-owner","店员端：老板管理","老板管理"],
  ["staff-store","店员端：门店资料与营业设置","门店资料"],["staff-employees","店员端：员工管理","员工"],["staff-services","店员端：服务项目管理","项目"],
  ["staff-coupons","店员端：优惠券、活动券与邀请码","优惠券"],["staff-products","店员端：商品、库存与双入库","库存"],["staff-logs","店员端：操作日志","日志"]
];

const navCustomer = [
  {id:"appointment",label:"预约",route:"customer-appointment",icon:"calendar"},
  {id:"home",label:"首页",route:"customer-home",icon:"home"},
  {id:"me",label:"我的",route:"customer-me",icon:"user"}
];
const navStaff = [
  {id:"workbench",label:"工作台",route:"staff-workbench",icon:"grid"},
  {id:"business",label:"业务",route:"staff-business",icon:"receipt"},
  {id:"wash",label:"洗美",route:"staff-wash",icon:"wash"},
  {id:"customers",label:"客户",route:"staff-customers",icon:"users"},
  {id:"me",label:"我的",route:"staff-me",icon:"user"}
];

function navigate(route, options = {}) {
  if (!route || route === state.route) return;
  state.previousRoute = state.route;
  state.route = route;
  state.role = route.startsWith("staff-") ? "staff" : "customer";
  if (state.role === "customer") state.tab = route === "customer-appointment" ? "appointment" : route === "customer-me" ? "me" : state.tab === "appointment" ? "home" : state.tab;
  else state.tab = route.includes("workbench") ? "workbench" : route.includes("wash") ? "wash" : route.includes("customer") ? "customers" : route === "staff-me" || route.startsWith("staff-owner") || ["staff-performance","staff-store","staff-employees","staff-services","staff-coupons","staff-products","staff-logs"].includes(route) ? "me" : "business";
  render();
  if (!options.keepScroll) $("#app-main").scrollTop = 0;
  $("#app-main").focus({preventScroll:true});
}

function pageTitle(title, subtitle = "") {
  return `<div class="app-title"><div>${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}<h1>${escapeHTML(title)}</h1></div></div>`;
}
function backHeader(title, subtitle = "") {
  return `<div class="app-title"><button class="icon-button" type="button" data-action="back" aria-label="返回">${icon("back")}</button><div>${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}<h1>${escapeHTML(title)}</h1></div></div>`;
}
function sectionHead(title, action = "", actionRoute = "") {
  return `<div class="section-heading"><h2>${escapeHTML(title)}</h2>${action ? `<button class="link" type="button" data-route="${actionRoute}">${escapeHTML(action)}</button>` : ""}</div>`;
}
function statusPill(text, tone = "") { return `<span class="pill ${tone}">${escapeHTML(text)}</span>`; }
function menuItem(label, desc, route, iconName = "grid", badge = "") {
  return `<button class="menu-item" type="button" data-route="${route}"><span class="menu-item-icon">${icon(iconName)}</span><span class="menu-item-copy"><strong>${escapeHTML(label)}</strong><small>${escapeHTML(desc)}</small></span>${badge ? `<span class="badge-count">${badge}</span>` : '<span class="chevron">›</span>'}</button>`;
}
function emptyState(title, copy, action = "", route = "") {
  return `<div class="card empty-state">${icon("pet")}<h3>${escapeHTML(title)}</h3><p>${escapeHTML(copy)}</p>${action ? `<button class="button small" type="button" data-route="${route}">${escapeHTML(action)}</button>` : ""}</div>`;
}
function notice(copy, tone = "", iconName = "warning") { return `<div class="notice ${tone}">${icon(iconName)}<span>${copy}</span></div>`; }
function money(value) { return `¥${Number(value).toFixed(2)}`; }

function renderHeader() {
  const headers = {
    "customer-home":`<div class="app-title home-store-title"><div><p>上海 · 梧桐社区</p><div class="home-store-line"><h1>暖爪宠物生活馆</h1><button class="home-store-switch" type="button" data-action="switch-store">切换门店</button></div></div></div><div class="app-header-actions"><button class="icon-button" data-route="customer-messages" type="button" aria-label="消息">${icon("bell")}<span class="badge-count" style="position:absolute;transform:translate(13px,-12px)">3</span></button></div>`,
    "customer-appointment":pageTitle("预约","选择期望到店时间"),"customer-me":pageTitle("我的","会员与宠物资料"),
    "staff-workbench":`${pageTitle("今日工作台","11月5日 · 暖爪宠物生活馆")}<span class="pill success">营业中</span>`,
    "staff-business":pageTitle("业务","完整办理与历史查询"),"staff-wash":pageTitle("洗美","洗护与美容"),"staff-customers":pageTitle("客户","本店客户与宠物"),"staff-me":pageTitle("我的",state.perspective === "owner" ? "老板视角" : "员工视角")
  };
  const routeInfo = routes.find(([id]) => id === state.route);
  const fallback = backHeader(routeInfo ? routeInfo[1].split("：").pop() : "功能详情", state.role === "staff" ? "店员端" : "客户端");
  setHTML($("#app-header"), headers[state.route] || fallback);
}

function renderBottomNav() {
  const nav = state.role === "customer" ? navCustomer : navStaff;
  const html = nav.map((item) => `<button type="button" class="${state.tab === item.id ? "is-active" : ""}" data-route="${item.route}" aria-current="${state.tab === item.id ? "page" : "false"}">${icon(item.icon)}<span>${item.label}</span></button>`).join("");
  const el = $("#bottom-nav"); el.className = `bottom-nav ${state.role}`; setHTML(el, html);
}

function renderAdvisor() {
  const show = state.role === "customer" && state.advisorEligible && !state.launchVisible && state.route !== "customer-advisor";
  setHTML($("#advisor-slot"), show ? `<button class="advisor-button ${state.advisorSide === "right" ? "right" : ""}" type="button" data-route="customer-advisor" aria-label="打开养宠顾问">${icon("sparkle")}</button>` : "");
}

function renderLaunch() {
  if (!state.launchVisible) return "";
  return `<div class="launch-cover" role="dialog" aria-modal="true" aria-label="启动封面广告原型">
    <div class="launch-top"><span class="launch-label">原型广告 · ${escapeHTML(state.launchMode)}</span><button class="launch-skip" type="button" data-action="dismiss-launch">跳过广告</button></div>
    <div class="launch-copy"><p>陪伴每一次安心到店</p><h1>毛孩子的<br>暖心日常</h1><p>这里模拟图片、视频与微信官方广告三种启动模式；失败或无填充会恢复原目标。</p></div>
    <div class="launch-controls" role="group" aria-label="广告模式调试">${["图片","视频","微信广告","No Fill","Failed"].map(m=>`<button type="button" data-launch-mode="${m}">${m}</button>`).join("")}</div>
  </div>`;
}

function customerHome() {
  if (state.scenario === "empty") return `<div class="page-stack">${emptyState("今天没有进行中的服务","预约洗护、美容或寄养后，服务进度会显示在这里。","去预约","customer-appointment")}${riskCard()}${feedingPreview()}${productPreview()}${adBlock()}</div>`;
  if (state.scenario === "failure") return `<div class="page-stack"><section class="section">${sectionHead("当前服务")}<div class="card danger"><strong>当前服务暂时无法加载</strong><p class="card-subtitle">其他模块仍可正常使用。</p><div class="action-row"><button class="button outline small" type="button" data-action="retry-home">重新加载</button></div></div></section>${riskCard()}${feedingPreview()}${productPreview()}${adBlock()}</div>`;
  return `<div class="page-stack">
    <section class="section">${sectionHead("当前服务","查看全部","customer-orders")}
      <article class="card"><div class="pet-row"><div class="pet-avatar">豆</div><div class="pet-info"><div class="card-header"><div><h3>豆包 · 洗护</h3><p>正在吹毛，预计 16:20 完成</p></div>${statusPill("洗护中","info")}</div></div></div><div class="service-ribbon"><span style="width:68%"></span></div><div class="action-row"><button class="button small" type="button" data-route="customer-result">查看服务进度</button><button class="button outline small" type="button" data-action="later">稍后查看</button></div></article>
      <article class="card"><div class="pet-row"><div class="pet-avatar">团</div><div class="pet-info"><div class="card-header"><div><h3>团子 · 寄养第 3 天</h3><p>今日 3 条动态 · 15:10 遛狗</p></div>${statusPill("在住","info")}</div></div></div><div class="meta-row"><span>11月3日—11月7日</span><span>有 2 张新照片</span></div><div class="action-row"><button class="button small" type="button" data-route="customer-boarding">查看寄养动态</button></div></article>
    </section>${riskCard()}${feedingPreview()}${productPreview()}${adBlock()}
  </div>`;
}

function riskCard() { return `<section class="section risk-preview">${sectionHead("消费争议","查看全部","customer-risk")}<div class="card risk-card-compact"><div class="card-header"><div><p class="eyebrow">公开信息 · 未解决优先</p><h3 class="card-title">附近门店与宠物食品</h3><p class="card-subtitle">分清用户反馈、商家回应与平台核验。</p></div>${icon("shield")}</div><div class="action-row"><button class="button outline small" data-route="customer-risk" type="button">附近门店</button><button class="button outline small" data-route="customer-risk" type="button">宠物食品</button></div>${state.scenario === "risk" ? `<div class="notice danger" style="margin-top:8px">${icon("warning")}<span>你记录的当前食用品牌有新的公开反馈，尚未完成平台核验。</span></div>` : ""}</div></section>`; }
function feedingPreview() { return `<section class="section">${sectionHead("上门喂养","更多需求","customer-feeding")}<div class="card"><div class="card-header"><div><h3 class="card-title">周末帮忙喂猫</h3><p class="card-subtitle">徐汇区 · 11月8日—9日 · 每天 2 次</p></div>${statusPill("待接单")}</div><div class="meta-row"><span>预算 ¥80/天</span><span>需要换水与清理猫砂</span></div><div class="action-row"><button class="button small" type="button" data-route="customer-feeding">查看详情</button><button class="button outline small" type="button" data-action="publish-feed">发布需求</button></div></div></section>`; }
function productPreview() { return `<section class="section">${sectionHead("附近小区的人都在买","查看更多","customer-products")}<div class="toolbar">${state.goods.map(g=>`<button class="card compact" type="button" data-route="customer-products" style="min-width:132px;text-align:left"><div class="media-tile" style="height:76px;aspect-ratio:auto;margin-bottom:8px">${icon("bag")}</div><strong>${g.name}</strong><div class="price">${money(g.price)}</div><small>${g.stock}</small></button>`).join("")}</div></section>`; }
function adBlock() { return state.adState === "loaded" ? `<section class="section"><div class="ad-placeholder"><div><strong>微信 Banner 广告调试占位</strong>home_bottom_banner · loaded（不发积分/AI 权益）</div></div><div class="toolbar"><button class="link" type="button" data-ad="no_fill">无填充</button><button class="link" type="button" data-ad="failed">失败</button><button class="link" type="button" data-ad="disabled">关闭</button></div></section>` : `<div class="route-note">广告状态：${state.adState}，广告位已自动收起 · <button class="link" data-ad="loaded" type="button">恢复调试</button></div>`; }

function customerAppointment() {
  if (state.appointmentSubmitted) return `<div class="page-stack">${notice("预约申请已提交，等待门店确认；实际到店时间以门店确认结果为准。","info","check")}<div class="card"><div class="card-header"><div><h2 class="card-title">豆包 · 洗护</h2><p class="card-subtitle">11月8日 14:30 · 期望到店时间</p></div>${statusPill("待门店确认")}</div><div class="meta-row"><span>参考价 ¥88</span><span>申请号 AP2026110501</span></div><div class="action-row"><button class="button outline" type="button" data-action="modify-appointment">修改申请</button><button class="button ghost" type="button" data-action="cancel-demo">取消申请</button></div></div>${menuItem("我的预约","待确认 1 · 已确认 2 · 历史 8","customer-appointment","calendar")}</div>`;
  return `<div class="page-stack"><div class="notice info">${icon("calendar")}<span>门店不设置固定时段名额。选择营业时间内的期望到店时间，由门店人工确认。</span></div><form class="form" data-form="appointment" novalidate>
    <div class="field"><label for="appt-pet">宠物</label><select id="appt-pet" name="pet"><option value="豆包">豆包 · 比熊</option><option value="团子">团子 · 柴犬</option></select></div>
    <div class="field"><span class="field-label">服务</span><div class="choice-list"><label class="choice"><input type="radio" name="service" value="洗护" checked><span><strong>洗护</strong><small>参考价 ¥88，到店后可按实际情况调整</small></span></label><label class="choice"><input type="radio" name="service" value="美容"><span><strong>美容</strong><small>参考价 ¥168</small></span></label><label class="choice"><input type="radio" name="service" value="寄养"><span><strong>寄养</strong><small>入住后由门店按宠物设置每日价格</small></span></label></div></div>
    <div class="field"><label for="appt-date">日期</label><input id="appt-date" name="date" type="date" value="2026-11-08" required><p class="field-help">原型接受系统原生日期选择器</p></div>
    <div class="field"><label for="appt-time">期望到店时间</label><input id="appt-time" name="time" type="time" value="14:30" required></div>
    <div class="field"><label for="appt-note">本次特殊要求（选填）</label><textarea id="appt-note" name="note" placeholder="例如：对吹风机比较紧张"></textarea></div>
    <button class="button full" type="submit">提交预约申请</button>
  </form></div>`;
}

function customerMe() {
  return `<div class="page-stack"><section class="card tint"><div class="card-header"><div><p class="eyebrow">暖爪会员</p><h2 class="card-title">林女士</h2><p class="card-subtitle">138****6608 · 已认证手机号</p></div><div class="pet-avatar round">林</div></div><div class="stat-grid" style="margin-top:14px"><button class="stat-card" data-route="customer-wallet" type="button"><strong>¥286</strong><span>会员余额</span></button><button class="stat-card" data-route="customer-wallet" type="button"><strong>${state.couponCount}</strong><span>优惠券/活动券</span></button><button class="stat-card" data-route="customer-points" type="button"><strong>${state.points}</strong><span>平台积分</span></button></div></section><div class="menu-list">
    ${menuItem("我的宠物","2只宠物 · 档案、护理和服务记录","customer-pets","pet")}
    ${menuItem("我的钱包","余额明细、优惠券与邀请码兑换","customer-wallet","wallet")}
    ${menuItem("我的订单","服务、商品、结算与退款结果","customer-orders","receipt")}
    ${menuItem("积分中心","签到、积分商城与我的兑换","customer-points","gift")}
    ${menuItem("消息","普通通知与重要通知","customer-messages","bell","3")}
    ${menuItem("投诉与建议","提交投诉、我的投诉与补证","customer-complaints","warning")}
    ${menuItem("账号与设置","手机号、隐私、注销与退出","customer-settings","settings")}
  </div></div>`;
}

function customerBoarding() {
  return `<div class="page-stack"><div class="card tint"><div class="pet-row"><div class="pet-avatar">团</div><div class="pet-info"><div class="card-header"><div><h3>团子 · 寄养第 3 天</h3><p>11月3日入住 · 预计11月7日离店</p></div>${statusPill("在住","info")}</div></div></div><div class="stat-grid" style="margin-top:12px"><div class="stat-card"><strong>${state.boardingCareCount}</strong><span>今日动态</span></div><div class="stat-card"><strong>¥98</strong><span>本次日价</span></div><div class="stat-card"><strong>3</strong><span>当前计费晚数</span></div></div></div>
    <div class="card"><div class="card-header"><div><h3 class="card-title">寄养加餐</h3><p class="card-subtitle">按普通商品需求处理，不自动生成投喂记录。</p></div>${icon("feed")}</div><div class="action-row"><button class="button" type="button" data-action="add-snack">选择零食</button></div></div>
    ${sectionHead("今天 · 11月5日")}<div class="timeline"><div class="timeline-item"><strong>遛狗</strong><time>15:10 · 小周记录</time><p>小区内散步 20 分钟，精神状态良好。</p><div class="media-strip"><div class="media-tile">照片 1</div><div class="media-tile">照片 2</div></div></div><div class="timeline-item"><strong>喂食</strong><time>08:30 · 店长记录</time><p>按本次寄养要求完成早饭。</p></div><div class="timeline-item"><strong>特殊照护 · 代喂药</strong><time>08:35</time><p>已按主人要求完成；实际执行与主人要求分开记录。</p></div></div>
    ${sectionHead("昨天 · 11月4日")}<div class="timeline"><div class="timeline-item"><strong>清扫笼子</strong><time>18:20</time><p>已更换垫布并完成清洁。</p></div></div></div>`;
}

function customerResult() {
  return `<div class="page-stack"><div class="card"><div class="card-header"><div><p class="eyebrow">SR2026110508</p><h2 class="card-title">豆包 · 洗护结果</h2><p class="card-subtitle">服务中 · 当前可查看已发布内容</p></div>${statusPill(state.washState === "completed" ? "洗护完毕" : "洗护中",state.washState === "completed" ? "success" : "info")}</div><div class="service-ribbon"><span style="width:${state.washState === "completed" ? 100 : 68}%"></span></div></div><section class="section">${sectionHead("护理前后对比")}<div class="photo-compare"><div class="compare-half compare-after">护理后</div><div class="compare-half compare-before">护理前</div><div class="compare-line"></div></div><div class="tabs"><button class="is-active" type="button">毛发护理</button><button type="button">爪部清洁</button><button type="button">耳道护理</button></div></section><div class="card"><h3 class="card-title">本次服务摘要</h3><p class="card-subtitle">六项服务前检查已完成；毛发略干燥，建议一周内减少频繁洗澡。</p><div class="meta-row"><span>最终应收 ¥88</span><span>结算状态：待结算</span></div></div><div class="card tint"><div class="card-header"><div><h3 class="card-title">AI 洗护分析</h3><p class="card-subtitle">由顾客主动选择生成，需满足当前门店权益与用户额度。</p></div>${icon("sparkle")}</div><div class="action-row"><button class="button" type="button" data-action="generate-report">选择生成报告</button><button class="button outline" type="button" data-action="simulate-ad">广告解锁模拟</button></div></div></div>`;
}

function customerRisk() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">附近门店</button><button type="button">宠物食品</button><button type="button">我的关注</button></div>${notice("页面精确视觉仍受 DEC-RISK-UI-01 阻塞；当前仅按已确认信息语义进行方案预览。","info")}
    <div class="list"><button class="list-row is-clickable" type="button" data-action="risk-detail"><div class="list-row-main"><strong>某某宠物生活馆 · 用户反馈</strong><p>商家待回应 · 平台尚未核验 · 未解决</p></div><div class="list-row-side">${statusPill("7天回应","danger")}<small>1.2km</small></div></button><button class="list-row is-clickable" type="button" data-action="risk-detail"><div class="list-row-main"><strong>汪选低敏粮 · 牛肉批次</strong><p>近2天 3条独立反馈 · 平台核验中</p></div><div class="list-row-side">${statusPill("出现集中反馈","danger")}<small>问题热度 68</small></div></button><button class="list-row is-clickable" type="button" data-action="risk-detail"><div class="list-row-main"><strong>邻里宠物店 · 用户反馈</strong><p>已回应 · 现有证据不支持 · 已解决</p></div><div class="list-row-side">${statusPill("已解决","neutral")}<small>2.6km</small></div></button></div>
    <button class="button full" type="button" data-route="customer-complaints">去“我的”提交投诉</button></div>`;
}

function customerFeeding() {
  return `<div class="page-stack"><div class="action-row" style="margin-top:0"><button class="button" type="button" data-action="publish-feed">发布需求</button><button class="button outline" type="button" data-action="my-feed">我的发布</button><button class="button outline" type="button" data-action="my-taken">我的接单</button></div>${notice("需求方只有发布、撤销；接单后安排修改由门店线下协商，APP 不跟踪服务开始或完成。","info")}
    <div class="list"><div class="card"><div class="card-header"><div><h3 class="card-title">周末帮忙喂猫</h3><p class="card-subtitle">徐汇区 · 11月8—9日 · 每天2次</p></div>${statusPill("待接单")}</div><div class="meta-row"><span>¥80/天</span><span>清理猫砂、换水</span></div><div class="action-row"><button class="button small" type="button" data-action="take-feed">我要接单</button><button class="button outline small" type="button" data-action="share">分享</button></div></div><div class="card"><div class="card-header"><div><h3 class="card-title">假期上门照顾柴犬</h3><p class="card-subtitle">杭州 · 真实异地推荐 · 11月12日</p></div>${statusPill("待门店确认","info")}</div><div class="meta-row"><span>¥120/天</span><span>已锁定首位接单者</span></div></div></div></div>`;
}

function customerProducts() {
  const total = state.cart.reduce((sum,id)=>sum+(state.goods.find(g=>g.id===id)?.price||0),0);
  return `<div class="page-stack"><div class="search-control">${icon("search")}<input type="search" aria-label="搜索商品" placeholder="搜索本店商品"><button class="icon-button small" type="button" aria-label="清除搜索" hidden>×</button></div><div class="tabs"><button class="is-active" type="button">全部</button><button type="button">主粮</button><button type="button">零食</button><button type="button">护理</button></div><div class="list">${state.goods.map(g=>`<article class="card"><div class="pet-row"><div class="media-tile" style="width:76px;height:76px;aspect-ratio:auto">${icon("bag")}</div><div class="pet-info"><div class="card-header"><div><h3>${g.name}</h3><p>${g.category} · 每种商品唯一规格</p></div>${statusPill(g.stock,g.stock==="库存紧张"?"danger":"success")}</div><div class="price">${money(g.price)}</div></div></div><div class="action-row"><button class="button small" type="button" data-add-cart="${g.id}">加入购物车</button></div></article>`).join("")}</div><div class="card tint"><div class="card-header"><div><h3 class="card-title">购物车 ${state.cart.length} 件</h3><p class="card-subtitle">提交后是购买需求，不是线上付款。</p></div><strong class="price">${money(total)}</strong></div><div class="action-row"><button class="button full" ${state.cart.length ? "" : "disabled"} type="button" data-action="submit-product-request">提交购买需求</button></div></div></div>`;
}

function customerPets() {
  return `<div class="page-stack"><div class="action-row" style="margin-top:0"><button class="button" type="button" data-action="add-pet">新增宠物</button></div>${!state.importedHistory ? notice("发现其他门店有豆包的服务记录。是否由顾客本人授权导入当前门店？只导入档案和顾客可见服务护理历史。","info") : notice("已授权导入当前门店。金额、钱包、充值、券资产和内部备注未导入。","success","check")}
    ${!state.importedHistory ? `<button class="button full" type="button" data-action="import-history">本人确认，一键导入本店</button>` : ""}
    <div class="list"><article class="card"><div class="pet-row"><div class="pet-avatar">豆</div><div class="pet-info"><h3>豆包 · 比熊</h3><p>3岁 · 6.2kg · 最近服务 11月5日</p></div>${icon("chevron")}</div><div class="meta-row"><span>护理注意：吹风紧张</span><span>当前食用：汪选低敏粮</span></div><div class="action-row"><button class="button outline small" type="button" data-action="pet-detail">查看档案</button><button class="button outline small" type="button" data-action="edit-food-brand">食用品牌</button></div></article><article class="card"><div class="pet-row"><div class="pet-avatar">团</div><div class="pet-info"><h3>团子 · 柴犬</h3><p>5岁 · 在住寄养</p></div>${icon("chevron")}</div><div class="action-row"><button class="button outline small" type="button" data-route="customer-boarding">查看服务记录</button></div></article></div>
    <div class="card"><h3 class="card-title">共享给未来的门店</h3><p class="card-subtitle">宠物护理注意事项与服务履约记录分项选择、默认不勾选；授权变更需联系客服，当前无自助撤销入口。</p><div class="choice-list" style="margin-top:10px"><label class="choice"><input type="checkbox"><span><strong>宠物护理注意事项</strong><small>仅在未来门店真实业务环节按权限提醒</small></span></label><label class="choice"><input type="checkbox"><span><strong>服务履约记录</strong><small>同意有权门店在真实业务中查询统一“顾客风险”提醒</small></span></label></div><div class="notice info" style="margin-top:12px">${icon("shield")}<span>这里仅管理共享授权。顾客端不显示任何已审核或未审核顾客风险的存在、数量、状态、摘要、证据、来源或结果，也不会收到记录存在通知。</span></div></div></div>`;
}

function customerWallet() {
  return `<div class="page-stack"><div class="card tint"><div class="card-header"><div><p class="eyebrow">暖爪宠物生活馆</p><h2 style="margin:0;font-size:28px">¥286.00</h2><p class="card-subtitle">本金 ¥200 · 赠送余额 ¥86</p></div>${icon("wallet")}</div><p class="permission-note">消费时优先使用本金，再使用赠送余额；本店钱包与其他门店独立。</p></div><div class="tabs"><button class="is-active" type="button">余额明细</button><button type="button">优惠券/活动券</button><button type="button">邀请码兑换</button></div><div class="list"><div class="list-row"><div class="list-row-main"><strong>洗护消费</strong><p>11月2日 · 本金 -¥88</p></div><div class="list-row-side"><strong>-¥88</strong><small>余额 ¥286</small></div></div><div class="list-row"><div class="list-row-main"><strong>门店充值</strong><p>10月28日 · 本金 +¥300 · 赠送 +¥50</p></div><div class="list-row-side"><strong>+¥350</strong></div></div></div><div class="card"><h3 class="card-title">可用券 ${state.couponCount} 张</h3><p class="card-subtitle">所有券由店员在顾客详情手动核销或删除，结算优惠由店员手动改价；取消或退款不退券。</p><div class="action-row"><button class="button outline" type="button" data-action="coupon-list">查看优惠券</button><button class="button" type="button" data-action="redeem-code">兑换邀请码</button></div></div></div>`;
}

function customerPoints() {
  return `<div class="page-stack"><div class="card tint"><div class="card-header"><div><p class="eyebrow">平台积分</p><h2 style="margin:0;font-size:30px">${state.points}</h2><p class="card-subtitle">与门店钱包分开</p></div>${icon("gift")}</div><div class="action-row"><button class="button" type="button" data-action="sign-in">${state.signed ? "今日已签到" : "每日签到"}</button><button class="button outline" type="button" data-action="points-detail">积分明细</button></div></div><div class="card"><h3 class="card-title">本周积分</h3><div class="mini-chart">${[7,7,7,7,7,7,8].map((v,i)=>`<span style="height:${v*8}px" data-label="${['一','二','三','四','五','六','日'][i]}"></span>`).join("")}</div><p class="card-subtitle" style="margin-top:24px">7天合计 50 分（演示）</p></div>${sectionHead("积分商城")}<div class="list"><div class="card"><div class="card-header"><div><h3 class="card-title">宠物外出水杯</h3><p class="card-subtitle">800积分 · 总仓发货到店自提</p></div>${statusPill("可兑换","success")}</div><div class="action-row"><button class="button" type="button" data-action="redeem-reward">兑换并选择门店</button></div></div><div class="card"><div class="card-header"><div><h3 class="card-title">已兑换 · 洁齿礼包</h3><p class="card-subtitle">已发货至暖爪宠物生活馆 · 11月1日</p></div>${statusPill("待领取","info")}</div><p class="card-subtitle">发货后连续720小时未登记领取，系统默认已领取；不能取消，不退积分。</p></div></div></div>`;
}

function customerOrders() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">全部</button><button type="button">服务</button><button type="button">商品</button></div><div class="list"><button class="list-row is-clickable" type="button" data-route="customer-result"><div class="list-row-main"><strong>洗护 · 豆包</strong><p>11月5日 · 服务中 · 待结算</p></div><div class="list-row-side"><strong>¥88</strong><small>最终应收</small></div></button><button class="list-row is-clickable" type="button" data-route="customer-boarding"><div class="list-row-main"><strong>寄养 · 团子</strong><p>11月3日 · 在住 · 未结算</p></div><div class="list-row-side"><strong>¥294</strong><small>当前基础金额</small></div></button><div class="list-row"><div class="list-row-main"><strong>商品 · 冻干鸡肉粒</strong><p>11月2日 · 已免单 · 无实际支付</p></div><div class="list-row-side"><strong>¥0</strong><small>最终应收</small></div></div><div class="list-row"><div class="list-row-main"><strong>美容 · 豆包</strong><p>10月20日 · 已完成 · 部分退款</p></div><div class="list-row-side"><strong>实付 ¥120</strong><small>退款 ¥30</small></div></div></div>${notice("订单详情展示真实原始应收、调价差额、最终应收和实付；不使用当前项目参考价回算历史。","info")}</div>`;
}

function customerMessages() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">全部</button><button type="button">重要通知</button><button type="button">普通通知</button></div><div class="list"><button class="list-row is-clickable" type="button" data-route="customer-result"><span class="menu-item-icon">${icon("wash")}</span><div class="list-row-main"><strong>洗护服务已完成</strong><p>重要通知 · 豆包的本次服务结果可以查看</p></div><div class="list-row-side"><span class="badge-count">1</span><small>16:20</small></div></button><button class="list-row is-clickable" type="button" data-route="customer-risk"><span class="menu-item-icon">${icon("warning")}</span><div class="list-row-main"><strong>食品品牌有新的公开反馈</strong><p>重要通知 · 尚未完成平台核验</p></div><div class="list-row-side"><span class="badge-count">1</span><small>14:08</small></div></button><div class="list-row"><span class="menu-item-icon">${icon("boarding")}</span><div class="list-row-main"><strong>寄养新增动态</strong><p>普通通知 · 团子今天新增2张照片</p></div><div class="list-row-side"><small>12:30</small></div></div></div>${notice("整个小程序只有普通通知和重要通知两档；当前阶段业务短信暂未开放。","info")}</div>`;
}

function customerComplaints() {
  return `<div class="page-stack"><div class="card danger"><div class="card-header"><div><p class="eyebrow">重点规则</p><h2 class="card-title">商家须在 7 天内回应</h2><p class="card-subtitle">逾期仅显示“商家逾期未回应”，不自动等于投诉成立。</p></div>${icon("warning")}</div></div><div class="action-row" style="margin-top:0"><button class="button" type="button" data-action="new-complaint">提交投诉</button><button class="button outline" type="button" data-action="my-complaints">我的投诉</button></div><div class="card"><div class="card-header"><div><h3 class="card-title">CP20261029012 · 门店服务争议</h3><p class="card-subtitle">门店已回应 · 3天补证期剩余 1 天</p></div>${statusPill("平台核验中","info")}</div><div class="meta-row"><span>是否成立：待平台裁决</span><span>是否解决：未解决</span></div><div class="action-row"><button class="button outline small" type="button" data-action="add-evidence">追加补证</button><button class="button outline small" type="button" data-action="submit-progress">提交处理情况</button></div></div>${notice("消费争议不提供自助申诉；如有异议，请联系客服处理。","info")}</div>`;
}

function customerSettings() {
  return `<div class="page-stack"><div class="menu-list">${menuItem("手机号与微信","已认证 138****6608","customer-settings","phone")}${menuItem("隐私与跨店授权","普通历史导入的授权变更需联系客服","customer-settings","shield")}${menuItem("通知设置","站内通知与微信授权说明","customer-settings","bell")}${menuItem("注销账号","查看数据处理与注销说明","customer-settings","warning")}</div>${notice("微信登录后验证手机号。若手机号已绑定其他微信，将提示“手机号已绑定其他微信，是否换绑？”；身份由认证手机号确定。","info")}<button class="button outline full" type="button" data-action="logout">退出登录</button></div>`;
}

function customerAdvisor() {
  return `<div class="page-stack"><div class="card tint"><div class="card-header"><div><p class="eyebrow">门店付费权益</p><h2 class="card-title">养宠顾问</h2><p class="card-subtitle">当前门店已开通 · 本月免费次数 2</p></div>${icon("sparkle")}</div></div><div class="card"><div class="list"><div class="list-row"><div class="pet-avatar round" style="width:40px;height:40px">AI</div><div class="list-row-main"><strong>今天想了解什么？</strong><p>我可以基于你主动提供的信息给出一般养宠建议，不替代医疗诊断。</p></div></div><div class="list-row"><div class="list-row-main"><strong>你</strong><p>团子寄养回来后食欲变小，需要注意什么？</p></div></div></div></div><form class="form" data-form="advisor" novalidate><div class="field"><label for="advisor-q">输入问题</label><textarea id="advisor-q" name="question" required placeholder="描述宠物情况和你想了解的问题"></textarea></div><button class="button full" type="submit">发送问题</button></form><div class="card"><h3 class="card-title">调整悬浮入口位置</h3><div class="action-row"><button class="button outline small" type="button" data-advisor-side="left">左侧</button><button class="button outline small" type="button" data-advisor-side="right">右侧</button><button class="button ghost small" type="button" data-advisor-side="left">重置</button></div></div></div>`;
}

function staffWorkbench() {
  return `<div class="page-stack"><div class="stat-grid"><div class="stat-card"><strong>6</strong><span>待处理</span></div><div class="stat-card"><strong>4</strong><span>服务中</span></div><div class="stat-card"><strong>3</strong><span>异常/临期</span></div></div><section class="section">${sectionHead("待处理","进入完整业务","staff-business")}<div class="list"><button class="list-row is-clickable" type="button" data-route="staff-appointments"><div class="list-row-main"><strong>预约确认</strong><p>2笔 · 最近期望到店 14:30</p></div><span class="badge-count">2</span></button><button class="list-row is-clickable" type="button" data-route="staff-goods"><div class="list-row-main"><strong>商品处理</strong><p>商品需求 1 · 奖励自提 1</p></div><span class="badge-count">2</span></button><button class="list-row is-clickable" type="button" data-route="staff-feeding"><div class="list-row-main"><strong>上门喂养</strong><p>待门店确认 1</p></div><span class="badge-count">1</span></button><button class="list-row is-clickable" type="button" data-route="staff-disputes"><div class="list-row-main"><strong>其他</strong><p>待回应消费争议 1 · 食品风险待知悉</p></div><span class="badge-count">2</span></button></div></section>
    <section class="section">${sectionHead("服务中")}<div class="list"><button class="list-row is-clickable" type="button" data-route="staff-wash"><div class="list-row-main"><strong>今日洗美</strong><p>豆包 · 吹毛中 · 15:10开始</p></div>${statusPill("2","info")}</button><button class="list-row is-clickable" type="button" data-route="staff-boarding"><div class="list-row-main"><strong>在住寄养</strong><p>团子等 2 只 · 今日照护 5 条</p></div>${statusPill("2","info")}</button><div class="list-row"><div class="list-row-main"><strong>其他服务</strong><p>独立护理 1</p></div>${statusPill("1","info")}</div></div></section>
    <section class="section">${sectionHead("异常与临期")}<div class="list"><button class="list-row is-clickable" data-route="staff-disputes" type="button"><div class="list-row-main"><strong>投诉回应</strong><p>剩余 18 小时 · 7天回应期限</p></div>${statusPill("重点","danger")}</button><button class="list-row is-clickable" data-route="staff-boarding" type="button"><div class="list-row-main"><strong>寄养异常</strong><p>1只宠物需确认异常处理结果</p></div>${statusPill("1","danger")}</button><div class="list-row"><div class="list-row-main"><strong>洗护异常 / 其他异常</strong><p>当前无待处理</p></div>${statusPill("0","neutral")}</div></div></section>
    <section class="section">${sectionHead("快捷操作")}<div class="quick-grid"><button type="button" data-route="staff-customers">${icon("search")}<span>查客户/宠物</span></button><button type="button" data-action="temporary-order">${icon("plus")}<span>临时开单</span></button><button type="button" data-route="staff-boarding">${icon("boarding")}<span>寄养入住</span></button><button type="button" data-action="member-order">${icon("wash")}<span>会员开单</span></button></div></section></div>`;
}

function staffBusiness() {
  const items = [
    ["预约管理","待处理、已确认待到店、历史记录","staff-appointments","calendar","2"],
    ["商品处理","商品需求与奖励自提","staff-goods","bag","2"],
    ["寄养","入住、照护、离店结算与历史","staff-boarding","boarding","2"],
    ["上门喂养","门店确认、撤销与联系方式","staff-feeding","feed","1"],
    ["消费争议","回应、追加材料与处理情况","staff-disputes","warning","1"],
    ["订单与收银","待结算、挂单、收退款与更正","staff-orders","receipt","3"]
  ];
  return `<div class="page-stack"><div class="menu-list">${items.map(i=>menuItem(...i)).join("")}</div>${notice("工作台只专注当天需要处理的事项；完整办理与历史查询统一在业务页。","info")}</div>`;
}

function staffAppointments() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">待处理 2</button><button type="button">已确认待到店</button><button type="button">历史记录</button></div><div class="toolbar"><button class="button outline small" type="button">日期</button><button class="button outline small" type="button">洗护/美容</button><button class="button outline small" type="button">寄养</button></div><div class="list"><article class="card"><div class="card-header"><div><h3 class="card-title">豆包 · 洗护</h3><p class="card-subtitle">期望 11月8日 14:30 · 林女士 138****6608</p></div>${statusPill("待确认")}</div><div class="meta-row"><span>提交 11月5日 09:10</span><span>特殊要求：吹风紧张</span></div><div class="notice danger" style="margin-top:10px">${icon("warning")}<span>有宠物护理注意事项。确认预约前须独立阅读。</span></div><div class="action-row"><button class="button" type="button" data-action="confirm-appointment">确认预约</button><button class="button outline" type="button" data-action="suggest-time">建议改期</button><button class="button ghost" type="button" data-action="reject-appointment">拒绝</button></div></article><article class="card"><div class="card-header"><div><h3 class="card-title">可可 · 寄养</h3><p class="card-subtitle">期望 11月10日入住 · 11月13日离店</p></div>${statusPill("待确认")}</div><p class="card-subtitle">共享提醒暂不可用，可继续；不表示已查明无风险。</p><div class="action-row"><button class="button" type="button" data-action="continue-unavailable">继续确认</button></div></article></div></div>`;
}

function staffGoods() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">商品需求</button><button type="button">奖励自提</button></div><div class="tabs"><button class="is-active" type="button">待处理</button><button type="button">待付款</button><button type="button">历史记录</button></div><div class="search-control">${icon("search")}<input type="search" aria-label="搜索商品处理" placeholder="联系方式/订单号/商品名"><button class="icon-button small" type="button" aria-label="清除搜索" hidden>×</button></div><article class="card"><div class="card-header"><div><h3 class="card-title">PR2026110506 · 寄养加餐</h3><p class="card-subtitle">冻干鸡肉粒 × 1 · 团子</p></div>${statusPill("待处理")}</div><p class="card-subtitle">按普通商品销售，不设独立投喂、到货确认或领取凭证流程。</p><div class="action-row"><button class="button" type="button" data-action="confirm-goods">确认需求</button><button class="button outline" type="button" data-action="edit-goods">减量/移除</button><button class="button ghost" type="button" data-action="cancel-goods">取消</button></div></article><article class="card"><div class="card-header"><div><h3 class="card-title">积分奖励 · 洁齿礼包</h3><p class="card-subtitle">已发货至本店 · 顾客林女士</p></div>${statusPill("待领取","info")}</div><p class="card-subtitle">实际交付后登记已领取；超期系统默认已领取，不伪造实际领取时间或员工。</p><div class="action-row"><button class="button" type="button" data-action="pickup-reward">登记实际领取</button></div></article></div>`;
}

function staffBoarding() {
  return `<div class="page-stack"><div class="action-row" style="margin-top:0"><button class="button" type="button" data-action="boarding-checkin">寄养入住</button><button class="button outline" type="button" data-action="boarding-history">寄养记录</button></div><div class="tabs"><button class="is-active" type="button">在住 2</button><button type="button">待离店结算</button><button type="button">历史</button></div><article class="card"><div class="pet-row"><div class="pet-avatar">团</div><div class="pet-info"><div class="card-header"><div><h3>团子 · 位置 A3</h3><p>11月3日 10:20 入住 · 日价 ¥98</p></div>${statusPill("在住","info")}</div></div></div><div class="meta-row"><span>当前计费3晚</span><span>预计11月7日离店</span><span>今日照护3条</span></div><div class="action-row"><button class="button small" type="button" data-action="add-care-record">新增照护记录</button><button class="button outline small" type="button" data-action="boarding-settle">离店结算</button><button class="button outline small" type="button" data-action="boarding-detail">查看/修改记录</button></div></article>${notice("统一照护表单：逐宠单选喂食/遛狗/清扫笼子 → 选择实际时间 → 照片选填。代喂药放在特殊照护；代接、送医等也由每日照护记录登记。","info")}<div class="card"><h3 class="card-title">计费规则</h3><p class="card-subtitle">北京时间凌晨3点为截点；实际入住＜截点≤实际离店的每个截点收一天。结算页单独核对入住和实际离店时间，付款或免单前填错可留痕修改并重算。</p></div></div>`;
}

function staffFeeding() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">待确认 1</button><button type="button">已确认</button><button type="button">历史记录</button></div><article class="card"><div class="card-header"><div><h3 class="card-title">周末帮忙喂猫</h3><p class="card-subtitle">首位接单用户已锁定 · 徐汇区</p></div>${statusPill("待门店确认")}</div><div class="meta-row"><span>11月8日—9日</span><span>¥80/天</span><span>接单 10:32</span></div><div class="action-row"><button class="button" type="button" data-action="confirm-feeding">确认对接</button><button class="button outline" type="button" data-action="cancel-feeding">撤销</button></div></article>${notice("确认后仅当前负责门店可查看双方必要联系方式；后续修改由门店线下协商，APP不提供开始/完成跟踪。门店账号停用后不换店，由客服人工电话通知。","info")}</div>`;
}

function staffDisputes() {
  const tab = state.activeTab.disputes || "待回应";
  const groups = ["待回应","补充材料中","待平台裁决","已结束"];
  const rows = {
    "待回应": [
      {id:"CP20261028007",customer:"陈先生",subject:"美容服务争议",submitted:"10月28日 09:20",status:"已逾期，仍需回应",deadline:"原截止 11月4日 09:20",tone:"danger"},
      {id:"CP20261029012",customer:"林女士",subject:"洗护服务争议",submitted:"10月29日 10:00",status:"待正式回应",deadline:"剩余18小时 · 11月6日 10:00",tone:"danger"}
    ],
    "补充材料中": [{id:"CP20261026003",customer:"周女士",subject:"商品处理争议",submitted:"10月26日 14:30",status:"补充材料中",deadline:"3天补证剩余1天",tone:"info"}],
    "待平台裁决": [{id:"CP20261022009",customer:"吴先生",subject:"寄养服务争议",submitted:"10月22日 18:10",status:"待平台裁决",deadline:"平台处理中",tone:"info"}],
    "已结束": [{id:"CP20261012005",customer:"赵女士",subject:"护理服务争议",submitted:"10月12日 11:40",status:"平台裁决：不成立",deadline:"10月20日结束",tone:"neutral"}]
  };
  return `<div class="page-stack"><div class="card danger"><div class="card-header"><div><p class="eyebrow">重点待办</p><h2 class="card-title">剩余 18 小时 · 7天回应</h2><p class="card-subtitle">只有明确涉及门店销售或处理行为的争议由本店在7天内正式回应。</p></div>${statusPill(state.disputeResponded ? "已回应" : "待回应","danger")}</div></div><div class="tabs">${groups.map(g=>`<button class="${tab===g?"is-active":""}" type="button" data-staff-dispute-tab="${g}">${g}</button>`).join("")}</div><div class="search-control">${icon("search")}<input type="search" aria-label="按顾客手机号或争议编号查询" placeholder="手机号／争议编号"><button class="icon-button small" type="button" data-action="filter-disputes" aria-label="查询争议">查</button></div><div class="toolbar"><button class="button outline small" type="button" data-action="filter-disputes">状态</button><button class="button outline small" type="button" data-action="filter-disputes">日期</button></div><div class="list">${rows[tab].map(r=>`<article class="card"><div class="card-header"><div><h3 class="card-title">${r.id} · ${r.customer}</h3><p class="card-subtitle">${r.subject} · 提交 ${r.submitted}</p></div>${statusPill(r.status,r.tone)}</div><div class="meta-row"><span>当前期限：${r.deadline}</span><span>${tab==="待回应"?"逾期优先排序":"按当前阶段归组"}</span></div>${r.id==="CP20261029012"&&!state.disputeResponded?`<div class="action-row"><button class="button" type="button" data-action="respond-dispute">直接回应</button><button class="button outline" type="button" data-action="invite-witness">邀请佐证</button><button class="button outline" type="button" data-action="submit-progress">提交处理情况</button></div>`:""}</article>`).join("")}</div>${state.disputeResponded&&tab==="补充材料中"?notice("首个正式回应已提交，当前重点期限为3天补充材料截止；原7天逾期历史不会删除。","success","check"):""}<article class="card"><div class="card-header"><div><h3 class="card-title">食品投诉与风险提醒</h3><p class="card-subtitle">门店销售／处理部分与品牌／厂家部分拆分状态和期限</p></div>${statusPill(state.foodRiskAcknowledged ? "已知悉" : "待知悉",state.foodRiskAcknowledged ? "success" : "danger")}</div><p class="card-subtitle">仅本店销售或处理行为部分生成7天回应；品牌、厂家或产品质量部分由管理员先核实门店、再联系厂家并在Web后台录入回信。厂家未回复显示“厂家暂未回应／平台核查中”，不会自动认定责任或结案。</p>${!state.foodRiskAcknowledged ? `<div class="action-row"><button class="button" type="button" data-action="ack-food-risk">已知悉</button></div>` : ""}</article>${notice("本店老板和所有有效员工可继续处理本店争议，不领取、不转交；消费争议没有自助申诉，如有异议请联系客服。最终裁决由平台决定。","info")}</div>`;
}

function staffOrders() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">待结算</button><button type="button">挂单</button><button type="button">收退款记录</button></div><div class="list"><button class="list-row is-clickable" type="button" data-route="staff-wash-detail"><div class="list-row-main"><strong>OD2026110508 · 豆包洗护</strong><p>服务已完成 · 最终应收 ¥88</p></div><div class="list-row-side">${statusPill("待结算")}<small>15:20开单</small></div></button><div class="list-row"><div class="list-row-main"><strong>OD2026110412 · 独立护理</strong><p>挂单原因：顾客稍后到店 · 原应收 ¥60</p></div><div class="list-row-side">${statusPill("挂单","danger")}<small>昨日 18:40</small></div></div><div class="list-row"><div class="list-row-main"><strong>OD2026110306 · 寄养</strong><p>已离店/挂单未收款 · 按实际接走停止计费</p></div><div class="list-row-side"><strong>¥294</strong><small>待结算</small></div></div></div><div class="card"><h3 class="card-title">正常更正收款</h3><p class="card-subtitle">老板和有效员工可更正实际收款金额、方式、实际收款时间，原因必填；以更正后实收为准，改为0需明确确认免单。</p><div class="action-row"><button class="button outline" type="button" data-action="correct-payment">演示更正收款</button></div></div>${notice("本期不做免单后重新收费、整笔收款撤销或额外补款等特殊流程。","info")}</div>`;
}

function staffWash() {
  const tab = state.activeTab.wash || "待接宠";
  const groups = ["待接宠","服务中","待结算","历史记录"];
  const rows = {
    "待接宠":[["糯米 · 美容","11:20开单 · 待开始","¥168"]],
    "服务中":[["豆包 · 洗护","15:10开始 · 吹毛中","¥88"],["奥利 · 美容","14:20开始 · 修剪中","¥198"]],
    "待结算":[["可乐 · 洗护","已完成 · 未收款","¥98"],["皮皮 · 美容","已中止 · 费用待确认","待确认"]],
    "历史记录":[["毛球 · 洗护","11月4日 · 已完成/已收款","¥88"],["布丁 · 美容","11月3日 · 已取消/未结算","¥0"]]
  };
  return `<div class="page-stack"><div class="action-row" style="margin-top:0"><button class="button" type="button" data-action="temporary-order">临时开单</button><button class="button outline" type="button" data-action="member-order">会员开单</button></div><div class="tabs">${groups.map(g=>`<button class="${tab===g?"is-active":""}" type="button" data-staff-wash-tab="${g}">${g}</button>`).join("")}</div><div class="search-control">${icon("search")}<input type="search" aria-label="按顾客手机号搜索洗美" placeholder="顾客手机号"><button class="icon-button small" type="button" aria-label="清除搜索" hidden>×</button></div><div class="list">${rows[tab].map(r=>`<button class="list-row is-clickable" type="button" data-route="staff-wash-detail"><div class="list-row-main"><strong>${r[0]}</strong><p>${r[1]}</p></div><div class="list-row-side"><strong>${r[2]}</strong><small>最终应收</small></div></button>`).join("")}</div>${tab==="历史记录"?notice("默认查询近15个自然日，支持手机号、洗护/美容、服务状态、结算状态和日期筛选；价格只显示最终应收。","info"):""}</div>`;
}

function staffWashDetail() {
  const photoParts = ["皮肤","耳道","眼睛","口腔","指甲","毛发","全身"];
  return `<div class="page-stack"><div class="card"><div class="card-header"><div><p class="eyebrow">OD2026110508</p><h2 class="card-title">豆包 · 洗护</h2><p class="card-subtitle">林女士 · 138****6608 · 比熊</p></div>${statusPill(state.washState === "completed" ? "已完成" : "服务中",state.washState === "completed" ? "success" : "info")}</div><div class="service-ribbon"><span style="width:${state.washState === "completed" ? 100 : 62}%"></span></div><div class="meta-row"><span>业绩归属：店长小林</span><span>参考价 ¥88</span></div></div><div class="card"><h3 class="card-title">服务前六项检查</h3><div class="check-grid" style="margin-top:10px">${["皮肤","耳道","眼睛","口腔","指甲","毛发"].map(x=>`<label class="check-item"><span>${x}</span><select aria-label="${x}检查结果"><option>未见明显异常</option><option>发现异常</option><option>无法检查</option></select></label>`).join("")}</div><p class="field-help" style="margin-top:8px">发现异常或无法检查时，须先告知主人并记录主人明确决定。</p></div><form class="card form" data-form="wash-photos" novalidate><div class="card-header"><div><h3 class="card-title">洗护前后照片</h3><p class="card-subtitle">六个检查位置和全身，各可上传洗护前、洗护后照片；全部选填，可分次补充。</p></div>${icon("camera")}</div><div class="wash-photo-grid">${photoParts.map((part,index)=>`<fieldset class="wash-photo-row"><legend>${part}</legend><div class="wash-photo-pair"><label class="photo-field" for="wash-before-${index}"><span>洗护前</span><input id="wash-before-${index}" name="wash-before-${index}" type="file" accept="image/*"></label><label class="photo-field" for="wash-after-${index}"><span>洗护后</span><input id="wash-after-${index}" name="wash-after-${index}" type="file" accept="image/*"></label></div></fieldset>`).join("")}</div><button class="button outline full" type="submit">保存已选照片</button></form><div class="card"><h3 class="card-title">服务状态</h3><div class="action-row"><button class="button outline small" type="button" data-action="start-wash">开始服务</button><button class="button small" type="button" data-action="complete-wash">完成服务</button><button class="button ghost small" type="button" data-action="interrupt-wash">中止服务</button></div><p class="card-subtitle">取消/中止后要重新开始，必须重新开单；不恢复原服务。</p></div><div class="card"><h3 class="card-title">结算</h3><div class="price-line"><span>原始应收</span><span>¥88.00</span></div><div class="price-line"><span>人工调价</span><span>¥0.00</span></div><div class="price-line total"><span>最终应收</span><span class="price">¥88.00</span></div><div class="action-row"><button class="button" type="button" data-action="checkout-order">完成服务后收款</button><button class="button outline" type="button" data-action="hold-order">挂单</button><button class="button ghost" type="button" data-action="waive-order">调为0并免单</button></div></div></div>`;
}

function staffCustomers() {
  return `<div class="page-stack"><div class="search-control">${icon("search")}<input id="customer-search" type="search" aria-label="搜索客户或宠物" placeholder="姓名/昵称/手机号/宠物名称"><button class="icon-button small" data-action="clear-customer-search" type="button" aria-label="清除搜索" hidden>×</button></div><div class="tabs"><button class="is-active" type="button">按顾客</button><button type="button">按宠物</button></div><button class="button full" type="button" data-action="add-customer">新增顾客</button><div class="list"><button class="list-row is-clickable" type="button" data-route="staff-customer-detail"><div class="pet-avatar round" style="width:46px;height:46px">林</div><div class="list-row-main"><strong>林女士 · 暖爪会员</strong><p>138****6608 · 豆包、团子 · 余额 ¥286</p></div>${icon("chevron")}</button><button class="list-row is-clickable" type="button" data-route="staff-customer-detail"><div class="pet-avatar round" style="width:46px;height:46px">陈</div><div class="list-row-main"><strong>陈先生 · 临时顾客</strong><p>微信号已留 · 可可</p></div>${icon("chevron")}</button></div>${notice("本店不核验顾客资料真实性。新增顾客保存成功后、确认预约时，对全部新老顾客执行独立注意事项/风险提醒；提醒不可用可直接继续。","info")}</div>`;
}

function staffCustomerDetail() {
  return `<div class="page-stack"><div class="card tint"><div class="card-header"><div><h2 class="card-title">林女士</h2><p class="card-subtitle">138****6608 · 微信已留 · 本店会员</p></div><div class="pet-avatar round">林</div></div><div class="stat-grid" style="margin-top:12px"><div class="stat-card"><strong>¥286</strong><span>余额</span></div><div class="stat-card"><strong>${state.couponCount}</strong><span>券</span></div><div class="stat-card"><strong>2</strong><span>宠物</span></div></div></div><div class="menu-list">${menuItem("关联宠物","豆包、团子 · 护理注意事项","staff-customer-detail","pet")}${menuItem("订单与服务","本店订单、服务护理历史","staff-orders","receipt")}${menuItem("会员资产","充值、修改余额、赠券与核销","staff-customer-detail","wallet")}${menuItem("本店私有备注","不会跨店共享","staff-customer-detail","edit")}</div><div class="card"><h3 class="card-title">宠物当前食用品牌（只读）</h3><div class="list"><div class="list-row"><div class="list-row-main"><strong>豆包 · 汪选低敏粮</strong><p>由主人在客户端维护；商品购买、寄养粮食和历史导入不会覆盖</p></div></div><div class="list-row"><div class="list-row-main"><strong>团子 · 主人暂未填写</strong><p>如需更新，请提示主人在客户端填写；店员不能代填</p></div></div></div></div><div class="card"><div class="card-header"><div><h3 class="card-title">跨店共享资料</h3><p class="card-subtitle">仅展示审核通过、授权有效且12个月展示期内的最小信息</p></div>${statusPill("本月查询 1/3","info")}</div><div class="list"><div class="list-row"><div class="list-row-main"><strong>宠物护理注意事项 · 豆包</strong><p>吹风时对高频噪声紧张，请逐步适应</p></div><div class="list-row-side"><small>来源：安心宠护</small></div></div><div class="list-row"><div class="list-row-main"><strong>顾客风险 · 顾客相关</strong><p>2026-08-16 · 到店后临时改变服务范围，与门店现场协商后取消</p></div><div class="list-row-side"><small>来源：邻里宠屋</small><small>有效至 2027-08-16</small></div></div><div class="list-row"><div class="list-row-main"><strong>顾客风险 · 宠物相关 · 豆包</strong><p>2026-09-03 · 吹毛过程中持续躲避高频吹风设备，暂停后恢复</p></div><div class="list-row-side"><small>来源：安心宠护</small><small>有效至 2027-09-03</small></div></div></div><div class="action-row"><button class="button outline" type="button" data-action="submit-customer-risk">提交顾客风险</button></div>${state.riskSubmitted?notice("已提交客服审核（原型模拟）。审核前仅原提交人可撤回后重提；顾客端不会显示记录存在或状态。","info"):""}<p class="permission-note">不显示未脱敏证据、内部备注，不支持下载、批量导出或转发；同店员工查看已取得结果不重复扣查询次数。</p></div><div class="action-row"><button class="button" type="button" data-action="recharge">充值</button><button class="button outline" type="button" data-action="edit-balance">修改余额</button><button class="button outline" type="button" data-action="gift-coupon">赠券</button></div><div class="card"><h3 class="card-title">优惠券/活动券</h3><p class="card-subtitle">可直接手动核销或删除，不要求先开单或选择订单；误点不撤销，取消/退款也不退券。</p><div class="action-row"><button class="button outline small" type="button" data-action="manual-redeem">手动核销</button><button class="button ghost small" type="button" data-action="delete-coupon">删除一张</button></div></div>${notice("若发现其他门店服务记录，只能由顾客本人确认后授权导入当前门店；普通历史授权无顾客自助撤销入口，变更需联系客服。","info")}</div>`;
}

function staffMe() {
  return `<div class="page-stack"><div class="card tint"><div class="card-header"><div><p class="eyebrow">暖爪宠物生活馆</p><h2 class="card-title">${state.perspective === "owner" ? "店长小林 · 老板" : "小周 · 店员"}</h2><p class="card-subtitle">账号正常 · 手机号已认证</p></div><div class="pet-avatar round">${state.perspective === "owner" ? "林" : "周"}</div></div></div><div class="menu-list">${menuItem("员工与门店信息","查看本人称呼、门店和账号状态","staff-me","user")}${menuItem("我的工作记录",state.perspective === "owner" ? "老板默认查看全店，可切本人" : "仅查看本人实际经办记录","staff-performance","log")}${menuItem("我的业绩","按实际收款与退款后净消费核对","staff-performance","chart")}${menuItem("通知设置","微信授权、站内两档、短信暂未开放","staff-me","bell")}${menuItem("账号与安全","微信登录、手机号认证与换绑","staff-me","shield")}${menuItem("帮助与反馈","文字必填、截图选填","staff-me","help")}${state.perspective === "owner" ? menuItem("老板管理","门店、员工、统计、项目与商品","staff-owner","settings") : ""}${menuItem("退出登录","结束当前登录会话","staff-me","logout")}</div>${notice("本人称呼只能本人修改，老板不能代改。","info")}</div>`;
}

function staffPerformance() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">我的业绩</button><button type="button">我的工作记录</button>${state.perspective === "owner"?'<button type="button">全店汇总</button>':""}</div><div class="stat-grid"><div class="stat-card"><strong>¥1,286</strong><span>消费实收</span></div><div class="stat-card"><strong>-¥80</strong><span>消费退款</span></div><div class="stat-card"><strong>¥1,206</strong><span>净消费</span></div></div><div class="toolbar"><button class="button outline small" type="button">手机号</button><button class="button outline small" type="button">日期</button><button class="button outline small" type="button">业务</button></div><table class="summary-table" aria-label="我的业绩订单列表"><thead><tr><th>日期/订单</th><th>顾客/项目</th><th>应收/实收</th></tr></thead><tbody><tr><td>11-05<br>0508</td><td>林女士<br>洗护</td><td>¥88<br>¥0</td></tr><tr><td>11-04<br>0412</td><td>陈先生<br>护理</td><td>¥60<br>¥60</td></tr><tr><td>11-03<br>0306</td><td>林女士<br>寄养</td><td>¥294<br>¥294</td></tr></tbody></table>${notice("一单只归属一人。员工只能把当前归属自己的订单转给别人，老板可修改本店全部订单；变更原因必填。业绩按实际已收款减已确认退款。","info")}</div>`;
}

function staffOwner() {
  return `<div class="page-stack"><div class="stat-grid"><button class="stat-card" data-route="staff-performance" type="button"><strong>¥3,820</strong><span>今日实收</span></button><button class="stat-card" data-route="staff-performance" type="button"><strong>-¥120</strong><span>今日退款</span></button><button class="stat-card" data-route="staff-performance" type="button"><strong>¥3,700</strong><span>净消费</span></button></div><div class="menu-list">${menuItem("门店资料","门头、名称、地址、营业执照与审核","staff-store","home")}${menuItem("营业与预约设置","营业时间、临时关闭两项","staff-store","calendar")}${menuItem("员工管理","邀请、停用、删除、恢复员工","staff-employees","users")}${menuItem("服务项目管理","洗护、美容、护理与商品关联","staff-services","wash")}${menuItem("优惠券与邀请码","赠券、核销、删除、创建一次性邀请码","staff-coupons","gift")}${menuItem("商品与库存","商品管理、手工入库、AI拍照入库","staff-products","box")}${menuItem("操作日志","三列倒序与只读详情","staff-logs","log")}</div>${notice("不做独立日结、交接班、现金盘点或对账；门店表格导入导出归 Web 后续设计，手机本期无入口。","info")}</div>`;
}

function staffStore() {
  return `<div class="page-stack"><form class="form" data-form="store-profile" novalidate><div class="field"><label for="store-cover">门店门头（固定正方形，不超过3MB）</label><div class="upload-zone">${icon("camera")}<p>点击选择门头照片</p><input id="store-cover" type="file" accept="image/*"></div></div><div class="field"><label for="store-name">门店名称</label><input id="store-name" value="暖爪宠物生活馆" required></div><div class="field"><label for="store-address">门店地址</label><input id="store-address" value="上海市徐汇区梧桐路88号" required></div><div class="field"><label for="license">营业执照</label><input id="license" type="file" accept="image/*,.pdf"><p class="field-help">仅用于后台审核，不向顾客公开。</p></div><button class="button full" type="submit">提交修改审核</button></form>${notice("同一门店同时只保留一份待审核申请；可撤回后修改再提交。审核批准生效后满168小时才允许再次提交。","info")}<div class="card"><h3 class="card-title">营业与预约设置</h3><div class="choice-list" style="margin-top:10px"><label class="choice"><input type="checkbox" checked><span><strong>营业时间</strong><small>09:00—20:00</small></span></label><label class="choice"><input type="checkbox"><span><strong>门店临时关闭</strong><small>不自动取消已确认预约</small></span></label></div></div></div>`;
}

function staffEmployees() {
  return `<div class="page-stack"><button class="button full" type="button" data-action="invite-employee">邀请员工（12小时有效）</button><div class="list"><div class="card"><div class="card-header"><div><h3 class="card-title">小周 · 店员</h3><p class="card-subtitle">138****1208 · 当前在职</p></div>${statusPill(state.employeeStatus === "active" ? "正常" : "已停用",state.employeeStatus === "active" ? "success" : "neutral")}</div><div class="action-row"><button class="button outline small" type="button" data-action="toggle-employee">${state.employeeStatus === "active" ? "停用员工" : "恢复员工"}</button><button class="button ghost small" type="button" data-action="remove-employee">删除员工</button></div></div><div class="card"><div class="card-header"><div><h3 class="card-title">阿成 · 历史员工</h3><p class="card-subtitle">已移出本店 · 历史订单/业绩/操作记录保留</p></div>${statusPill("已删除","neutral")}</div><p class="card-subtitle">重新入职时由老板重新邀请，并关联原员工身份。</p></div></div>${notice("不配置权限，老板和有效员工默认拥有店员业务权限；老板管理仅老板可用，平台管理仅平台管理员可用。","info")}</div>`;
}

function staffServices() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">洗护</button><button type="button">美容</button><button type="button">护理</button><button type="button">商品</button></div><button class="button full" type="button" data-action="new-service-item">新增项目</button><div class="list"><div class="list-row"><div class="list-row-main"><strong>基础洗护</strong><p>参考价 ¥88 · 客户端可预约</p></div>${statusPill("启用","success")}</div><div class="list-row"><div class="list-row-main"><strong>精修美容</strong><p>参考价 ¥168 · 客户端可预约</p></div>${statusPill("启用","success")}</div><div class="list-row"><div class="list-row-main"><strong>足部护理</strong><p>参考价 ¥58 · 仅门店开单</p></div>${statusPill("启用","success")}</div><div class="list-row"><div class="list-row-main"><strong>口腔护理（旧）</strong><p>已停用 · 可恢复并沿用原项目ID</p></div><button class="button outline small" type="button" data-action="restore-service">恢复</button></div></div>${notice("项目参考价在结算时必须支持修改；所有到店订单不设调价上限、不需老板审批，改为0需明确确认免单。","info")}</div>`;
}

function staffCoupons() {
  return `<div class="page-stack"><div class="tabs"><button class="is-active" type="button">优惠券</button><button type="button">活动券</button><button type="button">邀请码</button></div><div class="card"><h3 class="card-title">券管理</h3><p class="card-subtitle">券只表示顾客已领取的权益；结算时由店员手动改价，不自动计算优惠。</p><div class="action-row"><button class="button" type="button" data-action="create-coupon">创建优惠券</button><button class="button outline" type="button" data-route="staff-customer-detail">到顾客详情核销/删除</button></div></div><div class="card"><div class="card-header"><div><h3 class="card-title">本店活动邀请码</h3><p class="card-subtitle">每个码只能使用一次 · 创建后3天内可兑换</p></div>${statusPill("老板创建")}</div><p class="card-subtitle">一个邀请码只包含一个内容，可兑换优惠券、服务或商品活动；领取后统一一个月有效。员工无需在小程序查看未使用邀请码，老板可直接微信转发。</p><div class="action-row"><button class="button" type="button" data-action="create-invite-code">创建邀请码</button></div></div>${notice("本期所有券均不退回：整单取消、全额退款、部分退款都不恢复券，也不提供误点撤销核销。","info")}</div>`;
}

function staffProducts() {
  return `<div class="page-stack"><div class="action-row" style="margin-top:0"><button class="button" type="button" data-action="manual-stock-in">商品入库</button><button class="button outline" type="button" data-action="ai-stock-in">AI拍照入库</button></div><div class="search-control">${icon("search")}<input type="search" aria-label="搜索商品" placeholder="商品名称"><button class="icon-button small" type="button" aria-label="清除搜索" hidden>×</button></div><div class="list">${state.goods.map(g=>`<div class="list-row"><div class="media-tile" style="width:50px;height:50px;aspect-ratio:auto">${icon("box")}</div><div class="list-row-main"><strong>${g.name}</strong><p>${g.category} · 唯一规格 · 售价 ${money(g.price)}</p></div><div class="list-row-side"><strong>${g.id==='g2'?4:18}</strong><small>当前库存</small></div></div>`).join("")}</div><div class="menu-list">${menuItem("入库记录","默认最近15天，查看成功入库详情","staff-products","log")}${menuItem("商品分类","停用有商品分类时自动转移至“其他”","staff-products","grid")}${menuItem("上下架与库存修改","员工和老板均可操作，自动留痕","staff-products","edit")}</div>${notice("AI拍照入库当前按普通功能开发，后期增加门店付费会员验证。识别结果填入原入库表单，点击后入库；错误可在库存管理修改。","info")}</div>`;
}

function staffLogs() {
  return `<div class="page-stack"><div class="toolbar"><button class="button outline small" type="button">今天</button><button class="button outline small" type="button">全部员工</button><button class="button outline small" type="button">全部操作</button></div><table class="summary-table" aria-label="门店操作日志"><thead><tr><th>时间</th><th>员工</th><th>操作</th></tr></thead><tbody><tr><td>16:02</td><td>小周</td><td>完成豆包洗护</td></tr><tr><td>15:42</td><td>店长小林</td><td>修改订单业绩归属</td></tr><tr><td>14:18</td><td>小周</td><td>确认商品需求</td></tr></tbody></table>${notice("操作记录所有人可看；原始系统审计与敏感详情仍按权限限制。列表为时间、员工、操作三列倒序，详情只读。","info")}</div>`;
}

function renderRoute() {
  const routeMap = {
    "customer-home":customerHome,"customer-appointment":customerAppointment,"customer-me":customerMe,"customer-boarding":customerBoarding,"customer-result":customerResult,"customer-risk":customerRisk,"customer-feeding":customerFeeding,"customer-products":customerProducts,"customer-pets":customerPets,"customer-wallet":customerWallet,"customer-points":customerPoints,"customer-orders":customerOrders,"customer-messages":customerMessages,"customer-complaints":customerComplaints,"customer-settings":customerSettings,"customer-advisor":customerAdvisor,
    "staff-workbench":staffWorkbench,"staff-business":staffBusiness,"staff-appointments":staffAppointments,"staff-goods":staffGoods,"staff-boarding":staffBoarding,"staff-feeding":staffFeeding,"staff-disputes":staffDisputes,"staff-orders":staffOrders,"staff-wash":staffWash,"staff-wash-detail":staffWashDetail,"staff-customers":staffCustomers,"staff-customer-detail":staffCustomerDetail,"staff-me":staffMe,"staff-performance":staffPerformance,"staff-owner":staffOwner,"staff-store":staffStore,"staff-employees":staffEmployees,"staff-services":staffServices,"staff-coupons":staffCoupons,"staff-products":staffProducts,"staff-logs":staffLogs
  };
  const view = routeMap[state.route] || customerHome;
  setHTML($("#app-main"), `<div class="${state.role}-view">${view()}</div>`);
  const routeInfo = routes.find(([id])=>id===state.route);
  document.title = `${routeInfo ? routeInfo[1].split("：").pop() : "预览"} · PawDays ${state.role === "staff" ? "店员端" : "客户端"}`;
}

function render() {
  renderHeader(); renderRoute(); renderBottomNav(); renderAdvisor();
  setHTML($("#overlay-root"), renderLaunch());
  $$("#role-switch button").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.role===state.role));
  $$("#perspective-switch button").forEach(btn=>btn.classList.toggle("is-active",btn.dataset.perspective===state.perspective));
  $(".staff-perspective-block").hidden = state.role !== "staff";
  if (state.launchVisible) setTimeout(()=>$(".launch-skip")?.focus(),0);
}

function showToast(message, tone = "success") {
  const region = $("#toast-region");
  const toast = document.createElement("div"); toast.className = `toast ${tone}`; toast.setAttribute("role", tone === "error" ? "alert" : "status"); toast.textContent = message; region.append(toast);
  setTimeout(()=>toast.remove(),3200);
}

let overlayTrigger = null;
function openDialog({title,body,confirmLabel="确认",tone="",onConfirm=null,cancelLabel="取消",form=""}) {
  overlayTrigger = document.activeElement;
  const html = `<div class="dialog-backdrop" data-overlay="dialog"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">${escapeHTML(title)}</h2><p>${body}</p>${form}<div class="dialog-actions"><button class="button outline" type="button" data-action="close-overlay">${escapeHTML(cancelLabel)}</button><button class="button ${tone}" type="button" data-dialog-confirm>${escapeHTML(confirmLabel)}</button></div></div></div>`;
  setHTML($("#overlay-root"),html); const dialog=$(".dialog"); dialog._onConfirm=onConfirm; setTimeout(()=>$("[data-action='close-overlay']")?.focus(),0);
}
function openSheet(title, subtitle, body) {
  overlayTrigger=document.activeElement;
  setHTML($("#overlay-root"),`<div class="sheet-backdrop" data-overlay="sheet"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="sheet-header"><div><h2 id="sheet-title">${escapeHTML(title)}</h2><p>${escapeHTML(subtitle)}</p></div><button class="icon-button" type="button" data-action="close-overlay" aria-label="关闭">${icon("close")}</button></div>${body}</section></div>`); setTimeout(()=>$("[data-action='close-overlay']")?.focus(),0);
}
function closeOverlay() { setHTML($("#overlay-root"),""); overlayTrigger?.focus?.(); overlayTrigger=null; }

function reminderDialog(after) {
  openDialog({title:"跨店共享提醒",body:"<strong>宠物护理注意事项：</strong>豆包对吹风机声音较紧张，请逐步适应。<br><br><strong>顾客风险 · 宠物相关 · 豆包：</strong>2026-09-03 吹毛时持续躲避高频设备，暂停后恢复（来源：安心宠护；有效至2027-09-03）。<br><br>仅显示审核通过且当前有权查看的内容；阅读不代表接受责任、认定成立或自动拒单。",confirmLabel:"已阅读，继续",onConfirm:()=>{state.reminderRead=true;closeOverlay();after?.();}});
}

function actionHandler(action) {
  const simpleToast = {
    later:"已保留完成卡，稍后仍可查看", "switch-store":"门店切换演示：当前仍为暖爪宠物生活馆", "retry-home":"当前服务已重新加载", share:"分享卡片已生成（原型模拟）",
    "my-feed":"已切换到我的发布（原型模拟）","my-taken":"已切换到我的接单（原型模拟）","points-detail":"已打开积分明细（原型模拟）","coupon-list":"已打开优惠券列表（原型模拟）",
    "my-complaints":"已打开我的投诉（原型模拟）","add-evidence":"追加补证入口已打开（原型模拟）","submit-progress":"处理情况入口已打开（原型模拟）",
    "boarding-history":"已打开寄养历史（原型模拟）","boarding-detail":"已打开每日记录，可修改内容/时间/照片并保留历史","edit-goods":"可减量或移除缺货项，原因选填","boarding-checkin":"寄养入住表单已打开（原型模拟）",
    "correct-payment":"更正收款表单已打开：金额、方式、实际日期可改，原因必填","clear-customer-search":"搜索已清除","boarding-history":"寄养历史已打开","filter-disputes":"已按当前条件查询争议（原型本地数据）"
  };
  if (simpleToast[action]) return showToast(simpleToast[action]);
  if (action === "back") return state.previousRoute ? navigate(state.previousRoute) : navigate(state.role === "staff" ? "staff-workbench" : "customer-home");
  if (action === "dismiss-launch") { state.launchVisible=false; closeOverlay(); render(); return showToast("已恢复原业务目标"); }
  if (action === "close-overlay") return closeOverlay();
  if (action === "modify-appointment") { state.appointmentSubmitted=false; render(); return; }
  if (action === "cancel-demo") return openDialog({title:"撤销预约申请",body:"撤销后保留历史。本操作仅用于原型演示。",confirmLabel:"撤销申请",tone:"danger",onConfirm:()=>{state.appointmentSubmitted=false;closeOverlay();showToast("预约申请已撤销");render();}});
  if (action === "add-snack") return openSheet("选择寄养加餐","按普通商品需求处理",`<div class="list">${state.goods.slice(0,2).map(g=>`<button class="list-row is-clickable" type="button" data-add-cart="${g.id}"><div class="list-row-main"><strong>${g.name}</strong><p>${money(g.price)} · ${g.stock}</p></div><span class="chevron">›</span></button>`).join("")}</div><div class="notice info" style="margin-top:12px">${icon("feed")}<span>销售完成不等于已投喂；实际喂食需要时另记照护记录。</span></div>`);
  if (action === "generate-report") return openDialog({title:"生成 AI 洗护报告",body:"这是顾客主动选择的原型模拟。将校验当前门店权益、用户额度和真实服务素材。",confirmLabel:"开始生成",onConfirm:()=>{closeOverlay();showToast("AI报告进入生成中：1/5 正在准备素材");}});
  if (action === "simulate-ad") return showToast("激励广告模拟完成，已解锁一次报告资格");
  if (action === "publish-feed") return openSheet("发布上门喂养需求","发布后仅可撤销，不在APP修改",`<form class="form" data-form="publish-feed" novalidate><div class="field"><label for="feed-date">首次上门时间</label><input id="feed-date" type="datetime-local" required value="2026-11-08T09:00"></div><div class="field"><label for="feed-area">模糊地点</label><input id="feed-area" required value="上海市徐汇区"></div><div class="field"><label for="feed-budget">预算/天</label><input id="feed-budget" type="number" required value="80"></div><div class="field"><label for="feed-note">喂养要求</label><textarea id="feed-note" required>换水、添粮、清理猫砂</textarea></div><button class="button full" type="submit">发布需求</button></form>`);
  if (action === "take-feed") return openDialog({title:"接单确认",body:"你将成为首位有效接单者，之后由当前负责门店确认。门店确认前双方联系方式不会互相公开。",confirmLabel:"确认接单",onConfirm:()=>{closeOverlay();showToast("已接单，等待门店确认");}});
  if (action === "submit-product-request") { if (!state.cart.length) return; state.cart=[]; render(); return showToast("购买需求已提交，等待门店确认"); }
  if (action === "import-history") return openDialog({title:"授权导入当前门店",body:"仅导入顾客/宠物档案及顾客可见服务护理历史；金额、钱包、充值、优惠券和内部备注不会导入。授权变更需联系客服。",confirmLabel:"本人确认导入",onConfirm:()=>{state.importedHistory=true;closeOverlay();render();showToast("已授权导入当前门店");}});
  if (action === "edit-food-brand") return openSheet("当前食用宠物食品","由顾客本人维护",`<form class="form" data-form="food-brand" novalidate><div class="field"><label for="food-brand">标准品牌</label><select id="food-brand"><option>汪选低敏粮</option><option>喵鲜主食罐</option><option>其他</option></select></div><div class="field"><label for="custom-brand">其他品牌（选择其他时填写）</label><input id="custom-brand" placeholder="品牌名称"></div><button class="button full" type="submit">保存</button></form>`);
  if (action === "add-pet" || action === "pet-detail") return showToast(action === "add-pet" ? "新增宠物表单已打开（原型模拟）" : "宠物完整档案已打开（原型模拟）");
  if (action === "redeem-code") return openSheet("兑换邀请码","每码一次，创建后3天可兑换",`<form class="form" data-form="redeem-code" novalidate><div class="field"><label for="invite-code">本店邀请码</label><input id="invite-code" required maxlength="12" placeholder="输入邀请码"></div><button class="button full" type="submit">领取权益</button></form>`);
  if (action === "sign-in") { if (state.signed) return showToast("今天已经签到"); state.signed=true;state.points+=7;render();return showToast("签到成功，积分 +7"); }
  if (action === "redeem-reward") return openDialog({title:"兑换宠物外出水杯",body:"成功兑换后不能取消，不退积分；总仓发货到所选门店后自提。",confirmLabel:"确认兑换 800 积分",onConfirm:()=>{if(state.points<800){showToast("积分不足","error");return;}state.points-=800;closeOverlay();render();showToast("兑换成功，等待总仓发货");}});
  if (action === "new-complaint") return openSheet("提交投诉","文字必填，证据选填",`<form class="form" data-form="complaint" novalidate><div class="field"><label for="complaint-type">投诉对象</label><select id="complaint-type"><option>门店服务</option><option>宠物食品</option></select></div><div class="field"><label for="complaint-text">事实说明</label><textarea id="complaint-text" required placeholder="请描述发生的事实"></textarea></div><div class="field"><label for="complaint-file">图片/视频（选填）</label><input id="complaint-file" type="file" accept="image/*,video/*" multiple></div><button class="button full" type="submit">提交投诉</button></form>`);
  if (action === "logout") return openDialog({title:"退出登录",body:"退出当前会话不会删除账号、员工身份或业务历史。",confirmLabel:"退出登录",onConfirm:()=>{closeOverlay();showToast("已退出（原型模拟）");}});
  if (action === "confirm-appointment") return reminderDialog(()=>showToast("预约已确认；未自动开单或开始服务"));
  if (["suggest-time","reject-appointment"].includes(action)) return openSheet(action === "suggest-time" ? "建议新时间" : "拒绝预约","原因选填，“其他”也不强制说明",`<form class="form" data-form="appointment-handle" novalidate>${action === "suggest-time"?'<div class="field"><label for="new-time">建议时间</label><input id="new-time" type="datetime-local" value="2026-11-08T16:00"></div>':""}<div class="field"><label for="handle-reason">原因（选填）</label><select id="handle-reason"><option value="">不填写</option><option>门店忙碌</option><option>临时无法接待</option><option>需沟通服务安排</option><option>其他</option></select></div><button class="button full" type="submit">${action === "suggest-time" ? "发送新时间" : "确认拒绝"}</button></form>`);
  if (action === "continue-unavailable") return showToast("已记录共享提醒不可用并继续预约确认");
  if (["confirm-goods","confirm-feeding"].includes(action)) return showToast(action === "confirm-goods" ? "商品需求已确认，进入待付款" : "已确认对接，当前门店可查看必要联系方式");
  if (["cancel-goods","cancel-feeding"].includes(action)) return openDialog({title:"确认撤销",body:"原因选填，历史将保留。本操作仅演示业务状态。",confirmLabel:"确认撤销",tone:"danger",onConfirm:()=>{closeOverlay();showToast("已撤销并保留历史");}});
  if (action === "pickup-reward") return openDialog({title:"登记实际领取",body:"请仅在奖励实际交付给顾客后登记。该动作不要求领取凭证。",confirmLabel:"确认已实际领取",onConfirm:()=>{closeOverlay();showToast("已登记实际领取和真实经办员工");}});
  if (action === "add-care-record") return openSheet("新增照护记录","一笔记录选择一种操作",`<form class="form" data-form="care-record" novalidate><div class="field"><label for="care-action">照护操作</label><select id="care-action"><option>喂食</option><option>遛狗</option><option>清扫笼子</option><option>特殊照护</option><option>代接/送医等其他记录</option></select></div><div class="field"><label for="care-time">实际发生时间</label><input id="care-time" type="datetime-local" required value="2026-11-05T16:10"></div><div class="field"><label for="care-photo">照片（选填）</label><input id="care-photo" type="file" accept="image/*"></div><button class="button full" type="submit">确认保存</button></form>`);
  if (action === "boarding-settle") return openSheet("寄养离店结算","结算订单即视为离店",`<form class="form" data-form="boarding-settle" novalidate><div class="field"><label for="checkin-time">实际入住时间</label><input id="checkin-time" type="datetime-local" value="2026-11-03T10:20" required></div><div class="field"><label for="departure-time">实际离店时间</label><input id="departure-time" type="datetime-local" value="2026-11-06T16:20" required></div><div class="card flat"><div class="price-line"><span>日价 × 晚数</span><span>¥98 × 3</span></div><div class="price-line total"><span>最终应收</span><span class="price">¥294</span></div></div><button class="button full" type="submit">确认时间并结算</button></form>`);
  if (action === "respond-dispute") return openSheet("正式回应消费争议","直接提交，无草稿；原回应不可覆盖/删除",`<form class="form" data-form="dispute-response" novalidate><div class="field"><label for="position">回应立场</label><select id="position" required><option value="">请选择</option><option>认可部分事实</option><option>说明现有服务记录</option><option>对事实有异议</option></select></div><div class="field"><label for="response-text">回应文字</label><textarea id="response-text" required></textarea></div><div class="field"><label for="response-media">图片/视频（选填）</label><input id="response-media" type="file" accept="image/*,video/*"></div><button class="button full" type="submit">提交正式回应</button></form>`);
  if (action === "ack-food-risk") { state.foodRiskAcknowledged=true;render();return showToast("已知悉；不代表责任、成立或已解决"); }
  if (action === "invite-witness") return showToast("佐证邀请卡已生成；邀请人可看本店有权查看的该争议全部内容");
  if (action === "submit-customer-risk") return openSheet("提交顾客风险","仅记录本店真实发生的客观事件；提交后由客服审核",`<form class="form" data-form="customer-risk" novalidate><div class="field"><label for="risk-subject">风险对象</label><select id="risk-subject" required><option value="">请选择</option><option>顾客相关 · 林女士</option><option>宠物相关 · 豆包</option><option>宠物相关 · 团子</option></select></div><div class="field"><label for="risk-type">事件类型</label><select id="risk-type" required><option value="">请选择</option><option>服务沟通事件</option><option>服务安全事件</option><option>到店履约事件</option></select></div><div class="field"><label for="risk-time">实际发生时间</label><input id="risk-time" type="datetime-local" required value="2026-11-05T16:20"></div><div class="field"><label for="risk-description">客观经过</label><textarea id="risk-description" required placeholder="只写可核实的实际经过，不写性格、人格或主观标签"></textarea></div><div class="field"><label for="risk-media">图片／视频（选填）</label><input id="risk-media" type="file" accept="image/*,video/*" multiple></div><button class="button full" type="submit">提交客服审核</button></form>`);
  if (action === "temporary-order" || action === "member-order") return openOrderSheet(action);
  if (action === "add-customer") return openSheet("新增顾客","保存后触发独立提醒，不核验资料真实性",`<form class="form" data-form="add-customer" novalidate><div class="field"><label for="contact">手机号或微信号</label><input id="contact" required placeholder="至少填写一个"></div><div class="field"><label for="pet-name">宠物昵称</label><input id="pet-name"></div><div class="field"><label for="pet-breed">品种</label><input id="pet-breed"></div><button class="button full" type="submit">保存并继续</button></form>`);
  if (action === "start-wash") { state.washState="in_progress";render();return showToast("服务状态已切换为服务中"); }
  if (action === "complete-wash") return openDialog({title:"完成洗护服务",body:"请确认完成前复检没有新增异常；如有新增异常，须先填写说明并确认主人决定。",confirmLabel:"确认完成",onConfirm:()=>{state.washState="completed";closeOverlay();render();showToast("服务已完成并发布普通结果");}});
  if (action === "interrupt-wash") return openDialog({title:"中止服务",body:"中止说明选填。中止后顾客端不展示本次过程，不发送中止通知；如需再开始必须重新开单。",confirmLabel:"确认中止",tone:"danger",onConfirm:()=>{closeOverlay();showToast("服务异常，已终止；原记录已保留");}});
  if (action === "checkout-order") return openSheet("收款记账","最多两种支付方式，系统仅作线下交易账本",`<form class="form" data-form="checkout" novalidate><div class="field"><label for="final-amount">最终应收</label><input id="final-amount" type="number" min="0" step="0.01" value="88" required></div><div class="field"><label for="pay-method">付款方式</label><select id="pay-method"><option>会员余额</option><option>微信</option><option>支付宝</option><option>现金</option></select></div><div class="field"><label for="adjust-reason">调价原因（调价时必填）</label><input id="adjust-reason"></div><button class="button full" type="submit">确认收款记账</button></form>`);
  if (action === "hold-order") return openSheet("挂单","完成/中止且费用明确后可挂单",`<form class="form" data-form="hold-order" novalidate><div class="field"><label for="hold-reason">挂单原因</label><textarea id="hold-reason" required></textarea></div><button class="button full" type="submit">确认挂单</button></form>`);
  if (action === "waive-order") return openDialog({title:"确认免单",body:"最终应收将改为0，实收与收入均为0，不创建虚假付款或扣会员余额。",confirmLabel:"确认免单",tone:"danger",onConfirm:()=>{state.orderPaid=true;closeOverlay();showToast("已明确免单，实付0元");}});
  if (action === "recharge") return openSheet("会员充值","无充值套餐；赠送金额/赠券需备注",`<form class="form" data-form="recharge" novalidate><div class="field"><label for="principal">充值本金</label><input id="principal" type="number" required value="300"></div><div class="field"><label for="bonus">赠送金额（选填）</label><input id="bonus" type="number" value="50"></div><div class="field"><label for="recharge-note">备注</label><textarea id="recharge-note" required>充值赠送</textarea></div><label class="choice"><input type="checkbox"><span><strong>同时赠送优惠券</strong><small>手动选择券</small></span></label><button class="button full" type="submit">确认记账</button></form>`);
  if (["edit-balance","gift-coupon","manual-redeem","delete-coupon"].includes(action)) return showToast({"edit-balance":"修改余额入口已打开，原因必填","gift-coupon":"赠券入口已打开，原因必填","manual-redeem":"已手动核销一张券","delete-coupon":"已删除一张券"}[action]);
  if (action === "invite-employee") return showToast("员工邀请已创建，12小时后自动失效，无老板撤销按钮");
  if (action === "toggle-employee") { state.employeeStatus=state.employeeStatus==="active"?"disabled":"active";render();return showToast(state.employeeStatus==="active"?"员工已恢复":"员工已停用"); }
  if (action === "remove-employee") return openDialog({title:"移出本店员工名单",body:"历史订单、服务、业绩和操作记录将保留；重新入职须由老板重新邀请并关联原员工身份。",confirmLabel:"移出员工",tone:"danger",onConfirm:()=>{closeOverlay();showToast("员工已移出本店名单");}});
  if (["new-service-item","restore-service","create-coupon","create-invite-code"].includes(action)) return showToast({"new-service-item":"新增项目表单已打开","restore-service":"项目已恢复并沿用原项目ID","create-coupon":"优惠券创建表单已打开","create-invite-code":"一次性邀请码已创建，3天内有效"}[action]);
  if (action === "manual-stock-in") return openSheet("商品入库","手工填写入库信息",stockForm(false));
  if (action === "ai-stock-in") return openSheet("AI拍照入库","原型模拟：识别结果直接填入原入库表单",`<div class="upload-zone">${icon("camera")}<p>拍摄或从相册选择进货单据</p><input type="file" accept="image/*" multiple></div><div style="margin-top:14px">${stockForm(true)}</div>`);
}

function stockForm(prefilled) {
  return `<form class="form" data-form="stock-in" novalidate><div class="field"><label for="stock-product">商品</label><input id="stock-product" required value="${prefilled ? "冻干鸡肉粒" : ""}" placeholder="关联已有商品或补齐新商品"></div><div class="field"><label for="stock-qty">数量</label><input id="stock-qty" type="number" required value="${prefilled ? 12 : ""}"></div><div class="field"><label for="stock-cost">进货价</label><input id="stock-cost" type="number" step="0.01" value="${prefilled ? 22.5 : ""}"></div><button class="button full" type="submit">${prefilled ? "一键入库" : "确认入库"}</button></form>`;
}

function openOrderSheet(type) {
  const isMember = type === "member-order";
  const customerField = isMember
    ? `<div class="field"><label for="order-customer">选择顾客</label><select id="order-customer" name="customer" required><option value="">请选择已有顾客</option><option value="c1">林女士 · 138****6608</option><option value="c2">陈先生 · 微信已留</option></select><p class="field-help">会员开单从本店已有顾客中选择，不重复填写手机号或微信号。</p></div>`
    : `<div class="field"><label for="order-contact">手机号或微信号</label><input id="order-contact" name="contact" required placeholder="至少填写一个"></div>`;
  return openSheet(isMember ? "会员开单" : "临时开单",isMember ? "选择已有顾客后填写本次宠物信息" : "临时顾客直接填写联系方式和宠物信息",`<form class="form" data-form="${type}" novalidate>${customerField}<div class="field"><label for="order-pet-name">宠物昵称</label><input id="order-pet-name" name="petName" required></div><div class="field"><label for="order-pet-breed">品种</label><input id="order-pet-breed" name="petBreed" required></div><button class="button full" type="submit">保存并继续</button></form>`);
}

function handleForm(form) {
  const required = $$('[required]',form); const invalid = required.find(el=>!String(el.value||"").trim());
  $$(".field-error",form).forEach(el=>el.remove()); required.forEach(el=>{el.removeAttribute("aria-invalid");});
  if (invalid) { invalid.setAttribute("aria-invalid","true"); const error=document.createElement("p");error.className="field-error";error.textContent="请填写此项后继续";invalid.closest(".field")?.append(error);invalid.focus();return; }
  const type=form.dataset.form;
  if(type==="appointment"){state.appointmentSubmitted=true;render();showToast("预约申请已提交");return;}
  if(type==="advisor"){form.reset();showToast("问题已发送，AI回答为原型模拟");return;}
  if(type==="dispute-response"){state.disputeResponded=true;state.activeTab.disputes="补充材料中";closeOverlay();render();showToast("正式回应已提交，进入3天补证期");return;}
  if(type==="customer-risk"){state.riskSubmitted=true;closeOverlay();render();showToast("已提交客服审核；原型未连接真实审核后台");return;}
  if(type==="care-record"){state.boardingCareCount+=1;closeOverlay();render();showToast("照护记录已保存");return;}
  if(type==="boarding-settle"){closeOverlay();showToast("已核对时间并生成离店结算；结算即离店");return;}
  if(type==="checkout"){closeOverlay();showToast("收款已记入线下账本");return;}
  if(type==="store-profile"){showToast("门店资料修改已提交后台审核");return;}
  if(type==="stock-in"){closeOverlay();showToast("商品已入库，错误可在库存管理修改");return;}
  if(type==="publish-feed"){closeOverlay();showToast("上门喂养需求已发布");return;}
  if(type==="complaint"){closeOverlay();showToast("投诉已提交基础审核");return;}
  if(type==="redeem-code"){closeOverlay();showToast("权益领取成功，一个月内有效");return;}
  if(type==="wash-photos"){showToast("已保存当前选择的洗护前后照片（原型模拟）");return;}
  if(type==="temporary-order"||type==="member-order"||type==="add-customer"){closeOverlay();reminderDialog(()=>showToast(type==="member-order"?"会员开单资料已保存":"资料已保存并继续当前业务"));return;}
  closeOverlay();showToast("已保存（原型模拟）");
}

document.addEventListener("click", (event) => {
  const routeBtn=event.target.closest("[data-route]"); if(routeBtn){navigate(routeBtn.dataset.route);return;}
  const actionBtn=event.target.closest("[data-action]"); if(actionBtn){actionHandler(actionBtn.dataset.action);return;}
  const roleBtn=event.target.closest("[data-role]"); if(roleBtn){state.role=roleBtn.dataset.role;state.launchVisible=false;state.route=state.role==="staff"?"staff-workbench":"customer-home";state.tab=state.role==="staff"?"workbench":"home";render();return;}
  const perspective=event.target.closest("[data-perspective]"); if(perspective){state.perspective=perspective.dataset.perspective;render();return;}
  const launch=event.target.closest("[data-launch-mode]"); if(launch){const mode=launch.dataset.launchMode;if(mode==="No Fill"||mode==="Failed"){state.launchVisible=false;render();showToast(`${mode}：已恢复原目标`,"error");}else{state.launchMode=mode;render();}return;}
  const ad=event.target.closest("[data-ad]"); if(ad){state.adState=ad.dataset.ad;render();return;}
  const add=event.target.closest("[data-add-cart]"); if(add){state.cart.push(add.dataset.addCart);if($(".sheet")){closeOverlay();showToast("已加入寄养加餐购买需求");}else{render();showToast("已加入购物车");}return;}
  const washTab=event.target.closest("[data-staff-wash-tab]");if(washTab){state.activeTab.wash=washTab.dataset.staffWashTab;render();return;}
  const disputeTab=event.target.closest("[data-staff-dispute-tab]");if(disputeTab){state.activeTab.disputes=disputeTab.dataset.staffDisputeTab;render();return;}
  const advisor=event.target.closest("[data-advisor-side]");if(advisor){state.advisorSide=advisor.dataset.advisorSide;showToast(`悬浮入口已调整到${state.advisorSide==='left'?'左侧':'右侧'}`);return;}
  const dialogConfirm=event.target.closest("[data-dialog-confirm]");if(dialogConfirm){$(".dialog")?._onConfirm?.();return;}
  const scenario=event.target.closest("[data-scenario]");if(scenario){state.scenario=scenario.dataset.scenario;if(state.role==="customer")navigate("customer-home");else navigate("staff-workbench");render();showToast(`已切换为${scenario.textContent}场景`);return;}
});

document.addEventListener("submit",(event)=>{event.preventDefault();handleForm(event.target);});
document.addEventListener("keydown",(event)=>{
  if(event.key==="Escape" && $("[data-overlay]")){closeOverlay();return;}
  const overlay=$("[data-overlay]");if(event.key==="Tab"&&overlay){const focusables=$$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]',overlay);if(!focusables.length)return;const first=focusables[0],last=focusables.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});

const featureSearch=$("#feature-search"),featureResults=$("#feature-search-results"),featureClear=$("#feature-search-clear");
featureSearch.addEventListener("compositionstart",()=>featureSearch.dataset.composing="true");
featureSearch.addEventListener("compositionend",()=>{delete featureSearch.dataset.composing;updateFeatureSearch();});
featureSearch.addEventListener("input",()=>{if(!featureSearch.dataset.composing)updateFeatureSearch();});
featureClear.addEventListener("click",()=>{featureSearch.value="";updateFeatureSearch();featureSearch.focus();});
function updateFeatureSearch(){const q=featureSearch.value.trim().toLowerCase();featureClear.hidden=!q;if(!q){featureResults.hidden=true;setHTML(featureResults,"");return;}const found=routes.filter(([,name,tags])=>`${name}${tags}`.toLowerCase().includes(q)).slice(0,9);featureResults.hidden=false;setHTML(featureResults,found.length?found.map(([id,name])=>`<button type="button" data-route="${id}">${escapeHTML(name)}<small>${id.startsWith("staff")?"店员端":"客户端"}</small></button>`).join(""):`<p class="route-note">没有匹配功能</p>`);}

$("#reset-demo").addEventListener("click",()=>{state=initialState();render();showToast("演示数据已重置");});
render();
