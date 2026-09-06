# 需求文档阅读指南

本目录是 `pet-store-platform` 的正式需求文档区。

## 1. 对人和 AI 都适用的规则

1. 聊天记录、临时原型、旧 AI 方案、外部参考和其他仓库内容，不自动成为正式需求。
2. 只有本仓库中标记为 `已确认` 的需求，才能作为正式实现依据。
3. `讨论中` 可以调整；`待确认` 不可当作冻结实现依据；`以后版本` 不进入当前 V1.0 实现。
4. 若已确认文档之间出现明确冲突，不得自行推断，必须提出并通过需求变更解决。
5. 需求修改必须记录原规则、新规则和影响范围。

## 2. 文档职责与优先级

- `REQUIREMENTS-STATUS.md`：当前阶段、完成状态和基线摘要。
- `00-project-workflow.md`：需求治理、开发流程和全局交互原则。
- `01-project-positioning.md`：产品边界、多租户和跨模块原则。
- `02-roles-and-accounts.md`：角色、账号归属和员工生命周期。
- `03-customer-miniapp.md`：当前客户端总纲。
- `03a`～`03h`：预约、宠物、钱包、订单、商品、消息、身份、宠物交友详细规则。
- `03i-customer-screen-blueprint.md`：当前客户端主产品页面蓝图。
- `03j`～`03m`：上门喂养、平台积分、养宠顾问、激励广告权益详细业务规则。
- `03n-customer-screen-blueprint-extension.md`：新增功能与寄养动态的详细页面 / 原型补充。
- `03o-customer-home-banner-ad.md`：首页底部微信 Banner 曝光广告。
- `03p-customer-launch-cover-ad.md`：小程序启动封面广告，支持自定义图片 / 视频 / 微信官方广告。
- `10a-customer-ui-design-system.md`：客户端通用视觉基线。
- `10b-customer-homepage-ui-spec.md`：首页 UI 详细规格。
- `10c-customer-launch-cover-ad-ui-spec.md`：启动封面广告 UI / 调试规格。

同一业务范围内，详细子模块解释总纲；页面结构以当前 `03i` 为统一收口，新增详细场景按对应子模块和 UI 规格执行。若出现无法同时满足的冲突，必须停止实现并提出冲突。

## 3. 当前项目状态

当前版本：V1.0。

当前阶段：**04 店员端小程序需求讨论**。

阶段 00～03 已形成正式客户端基线；阶段 03 可以通过明确需求变更继续更新。客户端 UI / Design System 与客户端开发准备可与阶段 04 讨论并行进行。

## 4. 已确认文档索引

### 00～02 全局

- `00-project-workflow.md`：项目需求与 Codex 开发总流程
- `01-project-positioning.md`：项目定位
- `02-roles-and-accounts.md`：用户角色与账号体系

### 03 客户端微信小程序

- `03-customer-miniapp.md`：当前客户端总纲
- `03a-customer-appointment.md`：预约
- `03b-customer-pet-profile.md`：我的宠物 / 宠物档案
- `03c-customer-wallet.md`：我的钱包 / 余额 / 优惠券 / 邀请码
- `03d-customer-orders.md`：我的订单
- `03e-customer-products.md`：商品浏览 + 购买需求 + 寄养加餐商品链路
- `03f-customer-messages.md`：消息中心 + 微信通知
- `03g-customer-identity-security.md`：登录 / 手机号绑定 / 历史客户识别 / 账号安全
- `03h-customer-pet-social.md`：宠物交友
- `03i-customer-screen-blueprint.md`：当前客户端主产品蓝图 + 关键验收矩阵
- `03j-customer-home-feeding-marketplace.md`：平台级上门喂养需求市场
- `03k-customer-loyalty-points.md`：平台积分 / 广告签到 / 积分商城 / 总仓到店自提
- `03l-customer-pet-advisor.md`：养宠顾问 AI 聊天 + 付费门店权益门槛
- `03m-customer-rewarded-ads.md`：统一激励广告权益
- `03n-customer-screen-blueprint-extension.md`：新增功能 / 寄养动态页面蓝图补充
- `03o-customer-home-banner-ad.md`：首页底部微信 Banner 广告
- `03p-customer-launch-cover-ad.md`：启动封面广告

### 10 UI / Design System（客户端提前并行）

- `10a-customer-ui-design-system.md`：客户端 Design System 基线
- `10b-customer-homepage-ui-spec.md`：首页具体尺寸 / 间距 / 卡片 / Banner / 广告位
- `10c-customer-launch-cover-ad-ui-spec.md`：启动封面广告图片 / 视频 / 微信广告模式 UI 与调试

## 5. 客户端预览 / 原型读取规则

生成客户端 H5、页面 Demo、UI 骨架、交互原型或正式客户端页面前，至少读取：

1. 根目录 `AGENTS.md`
2. 本文件
3. `REQUIREMENTS-STATUS.md`
4. `03-customer-miniapp.md`
5. `03a`～`03p`
6. `10a-customer-ui-design-system.md`
7. 任务涉及首页时读取 `10b-customer-homepage-ui-spec.md`
8. 任务涉及小程序启动 / 封面广告时读取 `10c-customer-launch-cover-ad-ui-spec.md`

其中：

- `03i` 是当前统一页面地图和核心验收矩阵。
- `03n` 提供新增功能与寄养动态的更细交互补充。
- `03o` 是首页底部 Banner 广告，不是顶部品牌 Banner，也不是激励广告。
- `03p` 是进入首页前的启动封面广告，不得在普通页面内部导航时反复弹出。
- 临时 H5 只是沟通 / 验收工具，不是正式需求源。

## 6. 当前关键产品结论

- V1.0 为多商户 SaaS；V1 约束一个 Merchant 对应一家 Store。
- 管理角色只有 Platform Super Admin、Merchant Owner、Staff；没有独立“店长”系统角色。
- 老板可使用店员端小程序，并默认拥有本店全部员工权限。
- 客户端底部导航固定为：预约 / 首页 / 我的。
- 首页当前正式业务顺序为：**当前门店 → 当前服务 → 宠物交友 → 上门喂养 → 推荐商品**。
- 首页顶部生活方式 Banner 是品牌视觉，不是微信广告位。
- 首页精选商品之后、底部导航之前存在 `home_bottom_banner` 微信 Banner 广告，用于曝光 / 点击变现；失败 / 无填充时收起。
- 小程序启动 / 符合频控的重新进入时可展示 `launch_cover_ad`；Platform Super Admin 可独立选择自定义图片、自定义视频或微信官方广告，并配置素材、时效、频次、跳过和测试 / 正式环境。
- 启动封面广告关闭、无填充、过期或加载失败时必须直接进入首页；内部页面跳转不重复弹启动广告。
- 首页寄养卡可进入“查看寄养动态”；寄养详情以真实发生时间倒序时间轴展示最新动作，按日期分组，媒体与对应动态绑定。
- 寄养中支持“投喂零食 / 寄养加餐”，复用统一商品购买需求；实际投喂完成后写入寄养时间轴。
- “我的”会员资产摘要卡固定展示当前可用余额、可使用优惠券数量、本金余额、赠送余额，整卡进入余额明细。
- “我的钱包”承载余额明细、优惠券、邀请码兑换；客户端无会员充值入口。
- V1.0 已正式新增平台积分体系；积分属于 Platform User，与商户钱包 / 本金 / 赠送 / 商户优惠券分离。
- 每日签到必须完整观看激励广告；每日 1～10 分受约束随机，周一至周日 7 天全签时累计严格 50 分；漏签不补足，不支持补签。
- 积分商城由 Platform Super Admin 管理；实物奖励使用总仓独立库存，履约为“总仓 → 用户选择门店 → 门店收货 → 用户自提 → 店员核销”。
- 上门喂养是平台级公开需求市场；所有平台用户可浏览，发布时绑定当前门店；第一位有效接单者锁定需求；接单后只由绑定门店对接。
- 上门喂养公开地址只到区县 + 小区名称 / 附近区域，不公开精确住宅地址、门牌号、手机号或微信。
- 宠物交友默认自动轮播并支持手动滑动；每屏 3 只、一轮最多 12 只，自己的主宠物固定第 4 位；真正可邀请卡使用底部浅色“可发送邀请”标签。
- 宠物交友单卡的互动指标是“热度”，基于最近 7 天有效点击与当前门店 7 日排名，不建立点赞业务。
- 洗护 / 美容结果支持 N 组前后独立拖动对比，不写死组数。
- AI 洗护报告只有客户获得有效查看资格后才按需生成；普通结果和前后对比不依赖 AI / 广告。
- **养宠顾问是门店付费权益，而不是全平台默认开放功能。** 当前 Merchant / Store 必须有有效 `pet_advisor` 权益且门店已开启，当前 Platform User 还必须与本店建立 Customer 关系，客户端才显示 / 允许使用养宠顾问。
- 同一用户切换到未付费 / 未开启门店时养宠顾问入口应消失；切回符合资格门店再恢复。门店 A 付费不授予门店 B 的使用资格。
- 养宠顾问额度仍按 Platform User 累计：终身前 3 次有效提问免费，之后每完整观看一次广告解锁 3 次；切换到另一付费门店不重新赠送前三次；AI 失败不扣次数。
- 门店购买养宠顾问不意味着 Merchant Owner / Staff 可以查看客户 AI 聊天正文。
- AI 洗护报告、每日签到、养宠顾问统一使用激励广告权益模块；`home_bottom_banner` 与 `launch_cover_ad` 属于纯曝光 / 运营广告，不发 Reward Entitlement。
- 商品为轻商城 / 购买需求；客户端无真实线上支付、普通商品快递、地址、运费和用户物流页面。
- 预约与正式订单分离。
- 财务、余额、积分、库存、退款、冲正、付费功能权益等必须可审计，不允许无痕覆盖历史数据。

## 7. 文件命名约定

- 数字前缀表示阶段，例如 `03` 为客户端阶段。
- 字母子编号表示阶段子模块，例如 `03a`、`03b`。
- 文件名使用当前正式产品术语，不继续沿用已废弃旧称。

## 8. 暂不放入正式需求目录的内容

除非明确要作为正式资产，否则不放入需求目录：

- 临时 H5 / UI 演示文件
- 聊天导出
- 其他 AI 原始方案
- 未确认 brainstorm
- 无关仓库资料
- 生成过程临时文件

## 9. 需求变更记录位置

- 具体业务变更：写入对应模块文档。
- 页面地图 / 关键原型交互：同步 `03i`；新增功能细节同步对应子模块 / 扩展文档。
- 阶段 / 基线：同步 `REQUIREMENTS-STATUS.md`。
- 跨项目治理：同步 `00-project-workflow.md`、本文件或 `AGENTS.md`。

当前不维护重复完整业务内容的中央 `CHANGELOG.md`。
