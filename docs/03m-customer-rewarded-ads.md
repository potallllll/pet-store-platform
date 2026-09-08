# 03M 客户端「激励广告权益」公共模块

> status: confirmed
> status_scope: full_document
> change_policy: record_required
> parent_stage: 03 客户端微信小程序
> version: V1.0

## 1. 模块定位

V1.0 将客户端所有“完整观看广告后获得某项权益”的能力统一为一个公共激励广告权益模块，避免 AI 洗护报告、每日签到、养宠顾问分别实现三套广告完成判断。

当前至少支持三个 placement：

- `ai_report`：授予指定服务 AI 报告查看 / 生成资格
- `daily_checkin`：授予当日签到成功资格，由积分模块生成当日积分
- `pet_advisor`：授予养宠顾问 3 次有效提问额度

本模块不负责纯曝光广告位。以下广告属于独立模块：

- `home_bottom_banner`：首页底部微信 Banner 曝光广告，见 `03o-customer-home-banner-ad.md`。
- `launch_cover_ad`：小程序启动封面广告，可使用自定义图片 / 视频或微信官方广告，见 `03p-customer-launch-cover-ad.md`。

纯曝光广告不得自动进入 Reward Entitlement 流程。

## 2. 核心原则

- 广告是否完整观看必须由可信广告 SDK 回调 / 服务端可验证结果判定，前端自行修改状态不得直接发放权益。
- 同一次广告完成回调必须幂等，同一业务键不得重复发放权益。
- 广告未完整观看、用户主动中途退出、广告加载失败或验证失败，不发放对应权益。
- 已成功发放的广告权益不得因为后续 AI Provider、网络或其他下游服务失败而被无理由撤销。
- 不同 placement 的权益默认不可互相通用。
- Reward Entitlement 不能绕过目标业务自身的权限 / 门店权益校验。

## 3. AI 洗护报告

`ai_report` 广告完成后：

- 只授予指定服务 / 指定报告的查看资格。
- 服务端获得有效资格后才创建 / 启动 AI 报告任务。
- AI 后续失败时可按既有规则重试，不要求重复观看广告。

完整业务规则仍以客户端 AI 洗护报告文档为准。

## 4. 每日签到

`daily_checkin` 广告完成后：

- 只授予当前自然日的一次签到完成资格。
- 积分模块在服务端校验用户当日尚未签到后，生成 1～10 分受约束随机奖励。
- 完整自然周 7 天签到累计必须为 50 分；具体规则见 `03k-customer-loyalty-points.md`。
- 同日重复广告完成不得产生第二次签到积分。

## 5. 养宠顾问

`pet_advisor` 广告完成后：

- 每次成功发放 3 次有效提问额度。
- 额度继续绑定 Platform User。
- 同一次广告不得重复增加 3 次。
- AI 回答失败不得消费次数。
- 发起广告解锁与后续调用 AI 时，当前 `store_id` 对应 Store 必须仍具有有效 `pet_advisor` 付费权益且已向本店客户开启；权益唯一归属字段为 `owner_type=store`、`owner_id=store_id`，不得用 Merchant 购买关系替代资格校验。
- 门店无付费权益 / 已过期 / 已关闭时，不允许用户仅通过直接触发 `pet_advisor` placement 绕过门店功能资格。
- 用户已有但未用完的个人提问额度不因门店权益失效而删除；只是暂时不能在无资格门店上下文继续使用。

完整门店权益规则见 `03l-customer-pet-advisor.md`。

## 6. 建议数据语义

具体数据库结构阶段 09 冻结，但至少应能表达：

- `user_id`
- `placement`
- `business_key`
- `ad_session_id`
- `reward_type`
- `reward_amount / entitlement`
- `status`
- `verified_at`
- `granted_at`
- `idempotency_key`
- `merchant_id / store_id`（当目标业务存在门店资格约束时，用于校验上下文；不代表额度必须按门店累计）

不得只在前端 Local Storage 中记录“看过广告”。

## 7. 故障隔离

激励广告模块故障时：

- 对应需要广告解锁的权益暂时不可获得。
- 普通洗护结果、寄养、预约、商品、钱包、收银等核心业务必须继续可用。
- 每日签到可提示广告暂时不可用，但不得伪造签到成功。
- 养宠顾问没有可用免费 / 已解锁额度时可提示稍后重试；已有有效额度不应因为广告模块短时故障被误判为无效，但仍必须满足当前门店付费权益条件。
- 首页底部 Banner 和启动封面广告故障不通过本模块处理，也不得影响 Reward Entitlement 账本。

## 8. V1.0 关键验收场景

### C-AD-01：完整观看

完整观看广告并通过验证后，只发放对应 placement 权益一次。

### C-AD-02：中途退出

中途退出不发放权益。

### C-AD-03：重复回调

同一 `ad_session_id / idempotency_key` 多次回调只记一次。

### C-AD-04：下游失败

广告权益已经成功发放后，下游 AI / 网络失败不要求再次看广告。

### C-AD-05：养宠顾问门店资格

当前门店无有效养宠顾问付费权益时，即使用户有历史剩余额度，也不得在该门店上下文继续调用顾问；切换回符合资格门店后额度继续可用。

### C-AD-06：曝光广告不发权益

首页底部 Banner / 启动封面广告展示或点击不得增加积分、AI 报告资格或养宠顾问提问次数。

## 9. 需求变更记录

历史变更已移至 [`docs/history/2026-client-requirements-changes.md`](history/2026-client-requirements-changes.md)。本文件正文仅保留当前有效规则。
