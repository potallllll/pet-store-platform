# AGENTS.md

本仓库当前处于**需求设计阶段**，不是可自由实现的代码仓库。任何 AI 编码工具、自动化代理或新加入的开发者在执行任务前，必须先阅读本文件与 `docs/README.md`。

## 1. 当前唯一正式需求来源

- 项目状态：`docs/REQUIREMENTS-STATUS.md`
- 工作流程与全局交互原则：`docs/00-project-workflow.md`
- 项目定位：`docs/01-project-positioning.md`
- 角色与账号：`docs/02-roles-and-accounts.md`
- 当前客户端总纲：`docs/03-customer-miniapp.md`
- 客户端详细子模块：`docs/03a-*.md` ～ `docs/03p-*.md`
- 当前客户端主产品蓝图：`docs/03i-customer-screen-blueprint.md`
- 新增功能 / 寄养动态详细页面补充：`docs/03n-customer-screen-blueprint-extension.md`
- 首页底部微信 Banner 广告：`docs/03o-customer-home-banner-ad.md`
- 启动封面广告：`docs/03p-customer-launch-cover-ad.md`
- 客户端 UI Design System：`docs/10a-customer-ui-design-system.md`
- 客户端首页详细 UI 规格：`docs/10b-customer-homepage-ui-spec.md`
- 启动封面广告 UI 规格：`docs/10c-customer-launch-cover-ad-ui-spec.md`

聊天记录、临时 H5、外部方案、旧 AI 方案、口头描述、其他仓库内容均不是正式规格，除非已经同步到本仓库的已确认文档。

## 2. 冲突处理

- 先查看文档状态；`已确认` 才可作为正式开发依据。
- 详细子模块文档用于解释总纲；全局安全、租户隔离、财务审计原则同时生效。
- `03i-customer-screen-blueprint.md` 是当前统一客户端页面地图与关键验收蓝图。
- `03n-customer-screen-blueprint-extension.md` 用于细化新增的上门喂养、积分、养宠顾问、广告权益和寄养动态时间轴。
- `03o-customer-home-banner-ad.md` 负责首页底部微信 Banner 广告曝光位；不得与激励广告权益混为一套业务。
- `03p-customer-launch-cover-ad.md` 负责小程序启动 / 重新进入时的封面广告；不得把页面内部导航误实现成反复弹启动广告。
- `10a` / `10b` / `10c` 负责已确认客户端视觉、首页 UI 和启动封面 UI 规格，不得反向修改业务规则。
- 如果两个已确认文件存在无法同时满足的明确冲突，**不得自行选择、脑补或静默修改**；必须提出冲突并等待需求变更处理。
- `REQUIREMENTS-STATUS.md` 负责阶段与基线摘要，不替代详细业务规格。

## 3. 当前阶段

当前正在进入 **04 店员端小程序需求讨论**，同时允许按用户确认的并行流程进行客户端 UI / Design System 与客户端开发准备。

阶段 03 客户端已经形成正式基线。后续修改阶段 03 时必须记录需求变更，不得无痕覆盖。

在阶段 13 “V1.0 需求冻结”之前，除非用户明确要求实现原型或代码，否则不要把当前需求文档擅自转成正式产品实现。

## 4. 生成客户端预览 / 原型的强制规则

当任务要求生成：

- 客户端 H5 预览
- 客户端页面 Demo
- 客户端 UI 骨架
- 客户端交互原型
- 从需求文档生成客户端页面

执行者必须在生成前读取：

1. 本文件
2. `docs/README.md`
3. `docs/REQUIREMENTS-STATUS.md`
4. `docs/03-customer-miniapp.md`
5. `docs/03a`～`03p` 客户端详细文档
6. `docs/10a-customer-ui-design-system.md`
7. `docs/10b-customer-homepage-ui-spec.md`（涉及首页时必须读取）
8. `docs/10c-customer-launch-cover-ad-ui-spec.md`（涉及启动 / 封面广告时必须读取）

必须按照当前 `03i` 主蓝图及已确认详细文档覆盖完整客户端结构。首页预览必须明确区分顶部品牌 Banner、底部 `home_bottom_banner` 广告位和启动前的 `launch_cover_ad`。

临时 H5 只是验收 / 沟通工具，不是正式需求源；如果 H5 与正式 GitHub 文档冲突，应修改 H5。

## 5. 关键命名与最新客户端边界

- 管理角色只有：Platform Super Admin、Merchant Owner、Staff。
- **没有独立“店长”系统角色**；老板可使用店员端并默认拥有全部店员权限。
- 管理端统一称“店员端小程序（老板也可使用）”。
- 客户端入口名称为“我的钱包”，不是“我的会员”。
- 客户端无会员充值入口、无真实线上支付。
- V1.0 正式包含 Platform User 级平台积分体系，独立于商户钱包。
- V1.0 正式包含平台级上门喂养需求市场。
- 养宠顾问已改为**门店级付费权益**：只有当前 Merchant / Store 有有效 `pet_advisor` 权益、门店已开启、当前用户已建立本店 Customer 关系时才开放；门店购买不得把功能全平台开放给该用户。
- 养宠顾问用户额度仍按 Platform User 累计：终身前三次免费，之后每完整广告解锁 3 次；切换付费门店不重新赠送前三次。
- 首页业务顺序：当前门店 → 当前服务 → 宠物交友 → 上门喂养 → 推荐商品。
- 首页精选商品之后、底部导航之前存在 `home_bottom_banner` 微信 Banner 广告曝光位；广告失败 / 无填充时收起，不影响业务。
- 小程序启动 / 符合频控的重新进入时可展示 `launch_cover_ad`；支持平台自定义图片、自定义视频或微信官方广告，素材与广告模式由 Platform Super Admin 单独配置。
- `launch_cover_ad` 失败 / 无填充 / 关闭不得阻塞进入首页；页面内部 Tab / 详情跳转不得重复弹启动广告。
- 顶部生活方式 Banner 不是微信广告位；底部 Banner、启动封面广告也都不属于激励广告权益。
- 寄养详情支持按真实发生时间倒序的动态时间轴；实际投喂完成后寄养加餐写回时间轴。

## 6. 禁止事项

后续进入 Codex / 开发阶段后仍必须遵守：

- 不得删除、弱化或跳过难实现的已冻结需求。
- 不得用 Mock、TODO、静态假数据或仅 UI 演示冒充正式实现；开发 / H5 的广告 Mock 必须明确标注调试用途，正式生产切换真实广告组件。
- 不得绕过租户隔离、权限、Feature Entitlement、服务端校验、财务审计和错误处理。
- 不得让前端直接可信地决定金额、余额、积分、库存、权限、门店付费权益、广告权益或支付结果。
- 不得硬编码密钥、Token、广告 Credential 或散落广告单元配置。
- 不得通过切换门店、直接调用 `pet_advisor` API / placement 等方式绕过养宠顾问付费门店资格。
- 不得因为构建 / 测试失败而注释掉功能或修改业务规则来“过测试”。

## 7. 阅读入口

完整文件索引、文档优先级和当前基线见 `docs/README.md`。
