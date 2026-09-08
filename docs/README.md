# 需求文档阅读指南

本目录是 `pet-store-platform` 的正式需求文档区。

## 1. 对人和 AI 都适用的规则

1. 聊天记录、临时原型、旧 AI 方案、外部参考和其他仓库内容，不自动成为正式需求。
2. 只有 `status: confirmed` 的范围才能作为正式依据；`status: mixed` 必须同时读取 `confirmed_scope`、`pending_scope` 和 `blocked_by`，不得把整份文件视为已确认。
3. 状态字段使用稳定英文枚举：`discussing`、`pending`、`confirmed`、`mixed`、`future`；中文解释见 `REQUIREMENTS-STATUS.md`。
4. 若已确认文档之间出现明确冲突，不得自行推断，必须提出并通过需求变更解决。
5. 需求修改必须记录原规则、新规则和影响范围。

机器读取时还必须检查：`status_scope`、`confirmed_scope`、`pending_scope`、`development_readiness` 和 `blocked_by`。`development_readiness: partial` 表示只允许实现不依赖待决项的范围，不能用页面隐藏、临时默认值或 Mock 绕过阻塞决策。

## 2. 文档职责与优先级

- `REQUIREMENTS-STATUS.md`：当前阶段、完成状态和基线摘要。
- `00-project-workflow.md`：需求治理、开发流程和全局交互原则。
- `01-project-positioning.md`：产品边界、多租户和跨模块原则。
- `02-roles-and-accounts.md`：角色、账号归属和员工生命周期。
- `03-customer-miniapp.md`：当前客户端总纲。
- `03a`～`03h`：预约、宠物、钱包、订单、商品、消息、身份、宠物交友详细规则。
- `03i-customer-screen-blueprint.md`：当前客户端主产品页面蓝图。
- `03j`～`03m`：上门喂养、平台积分、养宠顾问、激励广告权益详细业务规则。
- 原 `03n-customer-screen-blueprint-extension.md` 已归档；现行内容由 `03i` 与对应业务子模块承接。
- `03o-customer-home-banner-ad.md`：首页底部微信 Banner 曝光广告。
- `03p-customer-launch-cover-ad.md`：小程序启动封面广告，支持自定义图片 / 视频 / 微信官方广告。
- `10a-customer-ui-design-system.md`：客户端通用视觉基线。
- `10b-customer-homepage-ui-spec.md`：首页 UI 详细规格。
- `10c-customer-launch-cover-ad-ui-spec.md`：启动封面广告 UI / 调试规格。

同一业务范围内，详细子模块解释总纲；页面结构以当前 `03i` 为统一收口，新增详细场景按对应子模块和 UI 规格执行。若出现无法同时满足的冲突，必须停止实现并提出冲突。

当前项目阶段、各文件状态例外和待决决策不在本文件重复，统一读取 `REQUIREMENTS-STATUS.md`。

## 3. 客户端预览 / 原型读取顺序

### 3.1 完整客户端或跨模块原型

生成完整客户端 H5、跨模块 Demo、整套 UI 骨架或全量交互原型前，至少读取：

1. 根目录 `AGENTS.md`
2. 本文件
3. `REQUIREMENTS-STATUS.md`
4. `03-customer-miniapp.md`
5. `03a`～`03m`、`03o`～`03p`（不读取已归档的 `03n`）
6. `10a-customer-ui-design-system.md`
7. 任务涉及首页时读取 `10b-customer-homepage-ui-spec.md`
8. 任务涉及小程序启动 / 封面广告时读取 `10c-customer-launch-cover-ad-ui-spec.md`

### 3.2 单模块或单页面任务

只处理一个明确模块或页面时，至少读取：

1. 根目录 `AGENTS.md`
2. 本文件
3. `REQUIREMENTS-STATUS.md`
4. `03-customer-miniapp.md`
5. `03i-customer-screen-blueprint.md`
6. 与任务直接相关的详细子模块文档
7. 涉及 UI 时读取 `10a-customer-ui-design-system.md`
8. 涉及首页时读取 `10b-customer-homepage-ui-spec.md`
9. 涉及启动 / 封面广告时读取 `10c-customer-launch-cover-ad-ui-spec.md`

若单页面行为跨越身份、消息、订单、钱包、广告或其他业务域，必须追加读取对应子模块；不得因采用单模块清单而忽略实际依赖。无法判断依赖范围时，使用完整客户端清单。

其中：

- `03i` 是当前统一页面地图和核心验收矩阵。
- `03o` 是首页底部 Banner 广告，不是顶部品牌 Banner，也不是激励广告。
- `03p` 是启动 / 符合频控的重新进入时、恢复本次业务目标前的封面广告层；不得在普通页面内部导航时反复弹出。
- 临时 H5 只是沟通 / 验收工具，不是正式需求源。

具体业务结论只读取对应正式模块文档，不在本阅读指南复制。

## 4. 文件命名约定

- 数字前缀表示阶段，例如 `03` 为客户端阶段。
- 字母子编号表示阶段子模块，例如 `03a`、`03b`。
- 文件名使用当前正式产品术语，不继续沿用已废弃旧称。

## 5. 暂不放入正式需求目录的内容

除非明确要作为正式资产，否则不放入需求目录：

- 临时 H5 / UI 演示文件
- 聊天导出
- 其他 AI 原始方案
- 未确认 brainstorm
- 无关仓库资料
- 生成过程临时文件

## 6. 需求变更记录位置

- 当前有效规则只写在正式模块文档中，不在正文保留已废弃的“原规则”。
- 历史变更证据统一移至 [`history/2026-client-requirements-changes.md`](history/2026-client-requirements-changes.md)。
- 页面地图 / 关键原型交互变更同步 `03i`；业务细节同步对应子模块；阶段和待决状态同步 `REQUIREMENTS-STATUS.md`。
- 历史文件只用于追溯，不属于正式需求来源，不得从历史文件恢复已废弃行为。

## 7. 变更历史

历史同步记录见 [`history/2026-client-requirements-changes.md`](history/2026-client-requirements-changes.md)；历史表述不得作为当前实现依据。
