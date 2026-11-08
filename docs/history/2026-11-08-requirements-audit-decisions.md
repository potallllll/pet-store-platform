# 2026-11-08 PRD 独立审计决策变更记录

> status: archived
> implementation_policy: forbidden
> change_policy: record_required
> decision_date: 2026-11-08
> decision_scope: pet_store_platform_prd_audit_findings

本文件仅记录本次需求变更的历史依据，不是当前实现规格。当前有效规则以本次更新后的正式业务文档为准；不得从本文件恢复旧规则或推导未确认功能。

## 1. 上门喂养业务状态来源

- **确认决定：** `docs/03j-customer-home-feeding-marketplace.md` §8 是上门喂养业务状态的唯一正式来源。
- **展示边界：** `03i`、`10b`及原型只可展示／映射`03j`状态，不得另建“进行中”“已完成”等业务状态，也不得把“已结束”解释为实际服务完成。
- **当前规则位置：** `03j` §8、`03i` §3.6、`10b` §8.2及§14。

## 2. 宠物基础档案跨店复制

- **确认决定：** V1.0允许顾客明确授权后，将其选定的宠物基础档案字段一次性复制到新商户。
- **复制性质：** 一次性快照，不是持续同步；源商户原Pet与Customer关系不变；目标商户创建独立Pet记录。
- **明确排除：** Customer完整档案、订单、消费金额、会员余额、优惠券、服务报告、护理历史、内部备注、员工评价及经营分析标签。
- **权限边界：** 手机号匹配、门店人员声明或跨店顾客风险查询均不能代替顾客授权。
- **当前规则位置：** `01` §2、§4、§5；`03g` §12；`02` §2；`FIELD-REGISTRY` §4.1保留旧F-CSH与旧权限标识退役，不得复用。

## 3. 寄养客户端时间轴

- **确认决定：** 客户端时间轴动作类型完全跟随店员端统一照护表单。
- **唯一动作类型：** 喂食、遛狗、清扫笼子、其他。
- **展示边界：** 说明文字、照片／视频为记录内容或附件，不是新增动作类型；代喂药、送医、代接、异常处理等按店员实际录入类型展示；寄养加餐继续作为普通商品卡独立展示。
- **当前规则位置：** `04` §5.1／§5.4、`03i` §3.4及C-BOARDING-01、`REQUIREMENTS-STATUS`、执行标准§4.2。

## 4. 投诉公开内容、原始材料与身份信息保存期限

| 数据类型 | 确认期限 | 起算时间 |
|---|---:|---|
| 公开脱敏投诉内容 | 1年 | 首次公开时间 |
| 原始投诉视频 | 3个月 | 单个视频资源成功上传／接收时间 |
| 原始投诉图片 | 1年 | 单个图片资源成功上传／接收时间 |
| 必要的投诉关联身份信息 | 1年 | 每项身份信息首次收集时间 |

- 用户账号注销不触发上述投诉资料提前删除，也不延长或重置保存期限。
- 到期按现行规则停止公开展示，并删除或不可逆匿名化对应内容；具体例外保全必须记录依据、范围、责任人与复核／解除条件。
- 跨店顾客风险数据仍按`03h` §10.1的12个月展示期及3年受限留存规则执行，不与投诉资料期限混用。
- **当前规则位置：** `03h` §6、§12.1；`03i` §3.5及C-COMPLAINT-05；`REQUIREMENTS-STATUS`。

## 5. 平台审核职责与权限映射

- **确认决定：** 不新增平台客服、审核员或仲裁员系统角色；相关审核职责由既有 `Platform Super Admin` 承担。
- **权限键：**
  - `complaint_review.decide`：投诉事实裁决。
  - `complaint_review.resolve`：投诉解决状态确认。
  - `evidence.review`：投诉证据审核／脱敏。
  - `customer_risk.review`：跨店顾客风险审核。
- Merchant Owner 与 Staff 不获得上述平台审核权限；服务端必须按权限键校验并记录审计。
- **当前规则位置：** `02` §2、`03h` §5.1／§6.1／§7.1／§10.4。

## 6. 开发准入

- **确认决定：** `REQUIREMENTS-STATUS.md` 的 `development_readiness` 使用合法枚举值 `blocked`，直到以下执行决策关闭：
  - `DEC-EXEC-01`：开发批次、排除范围、目标仓库／分支及冻结前有限开发许可。
  - `DEC-EXEC-02`：小程序技术栈、后端／数据库、AppID与环境、API契约负责人及部署目标。
- 需求讨论、技术调研、数据库方案、UI设计与测试计划可继续；正式代码开发不得以本次需求变更已合并为理由提前开始。
- **当前规则位置：** `REQUIREMENTS-STATUS.md` 元数据及`docs/execution/deepseek-execution-standard.md` §1。

## 7. 本次变更文件范围

本次变更涉及当前正式文件：`01-project-positioning.md`、`02-roles-and-accounts.md`、`03g-customer-identity-security.md`、`03h-customer-risk-feedback.md`、`03i-customer-screen-blueprint.md`、`03j-customer-home-feeding-marketplace.md`、`10b-customer-homepage-ui-spec.md`、`REQUIREMENTS-STATUS.md`、`FIELD-REGISTRY.md`及`docs/execution/deepseek-execution-standard.md`。

本次没有实现小程序、后端或Web后台功能；数据库／API层面的具体保留期限字段、资源清理任务和宠物基础档案复制接口仍须在阶段09／11登记后设计与验收。
