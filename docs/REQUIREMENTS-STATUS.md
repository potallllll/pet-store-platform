# Requirements Status

> version: V1.0
> current_stage: 04_staff_miniapp
> stage_status: discussing
> client_baseline_status: confirmed_with_blocked_decisions
> change_policy: record_required

## 总进度

- ✅ 00 总工作流程
- ✅ 01 项目定位
- ✅ 02 用户角色与账号体系
- ✅ 03 客户端小程序
- 🟡 04 店员端小程序
- ⬜ 05 Web 管理后台
- ⬜ 06 核心业务规则
- ⬜ 07 完整业务流程
- ⬜ 08 权限体系
- ⬜ 09 数据库设计
- 🟡 10 UI / Design System（客户端部分提前并行）
- ⬜ 11 技术架构
- ⬜ 12 测试与验收
- ⬜ 13 V1.0 需求冻结
- ⬜ 14 Codex Master Prompt
- ⬜ 15 Codex 开发
- ⬜ 16 项目审查
- ⬜ 17 Codex 整改
- ⬜ 18 最终验收

## 文档治理入口

- 新成员 / AI 首先阅读根目录 `AGENTS.md`。
- 完整文档地图与冲突处理规则见 `docs/README.md`。
- 本文件只表示阶段与基线状态，不替代详细业务规格。

## 客户端基线状态

- 当前客户端基线状态由顶部 `client_baseline_status` 字段表示。
- 完整正式文件地图只读 `README.md`；业务规则只读对应模块文档，本文件不复制业务结论。
- 除下表列出的 `status: mixed` 文件外，其他当前客户端正式模块以各自文件头状态字段为准。

| 文件 | 已确认范围 | 待确认范围 | 阻塞决策 |
|---|---|---|---|
| `03a-customer-appointment.md` | §1～§10 | §11 | `DEC-APPT-01` |
| `03j-customer-home-feeding-marketplace.md` | 除 §8.3 外的当前规则 | §8.3 | `DEC-FEED-01`～`03` |
| `03k-customer-loyalty-points.md` | 除 §8.4 外的当前规则 | §8.4 | `DEC-POINTS-01`～`02` |
| `03p-customer-launch-cover-ad.md` | 除 §6.1 待决运营数值外的当前规则 | §6.1 待决运营数值 | `DEC-LAUNCH-01` |

## 状态字段定义

- `status: discussing`：讨论中，可调整，不作为正式依据。
- `status: pending`：待确认，不得作为冻结实现依据。
- `status: confirmed`：已确认；仅 `status_scope` 指定范围生效，后续修改必须记录变更。
- `status: mixed`：同一文件同时含已确认与待确认范围；必须读取 `confirmed_scope`、`pending_scope` 和 `blocked_by`。
- `status: future`：以后版本，V1.0 不实现。
- `change_policy: record_required`：修改现行规则时必须同步正式正文，并把原规则、新规则和影响范围写入 `docs/history/`；历史内容本身不具有现行效力。


## 客户端待决索引

客户端范围已确认不等于全部跨端参数已冻结。以下决策关闭前，相关按钮、权限、截止时间、财务或运营常数不得进入正式实现。

| 决策 ID | 待确认内容 | 权威位置 / 后续阶段 |
|---|---|---|
| DEC-APPT-01 | 申请不占位、确认占位、改期原子切换的完整推荐模型 | 03a §11；用户确认后同步正式预约规则 |
| DEC-FEED-01 | 修改 / 取消主体、截止及确认权限 | 03j §8.3；阶段06 |
| DEC-FEED-02 | 门店响应时限与停店接续 | 03j §8.3；阶段06及平台运营 |
| DEC-FEED-03 | 需求失效的时间口径 | 03j §8.3；阶段06 |
| DEC-POINTS-01 | 用户取消权限及发货后处理 | 03k §8.4；阶段06 |
| DEC-POINTS-02 | 自提期限与停店改店规则 | 03k §8.4；阶段06及平台履约 |
| DEC-LAUNCH-01 | 广告加载统一等待上限与运营默认值 | 03p §6.1；客户端接入 / 运营配置前 |

待决不代表允许前端自行设默认权限、截止或财务政策；进入对应能力的正式开发 / 验收前必须闭合。已确认的不变量、界面状态和恢复路径可先用于设计与开发准备。


历史同步记录见 [`history/2026-client-requirements-changes.md`](history/2026-client-requirements-changes.md)。
