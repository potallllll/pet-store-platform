# 03K 客户端「平台积分 + 每日签到 + 积分商城」模块

> status: mixed
> confirmed_scope: batch_confirmed_account_history_import_financial_boundaries_termination_support_and_reward_expiry_where_applicable_and_all_current_rules_except_section_8_4
> pending_scope: section_8_4
> change_policy: record_required
> development_readiness: partial
> blocked_by: [DEC-POINTS-02]
> parent_stage: 03_customer_miniapp
> version: V1.0

## 1. 产品定位

V1.0 新增平台级会员积分体系。

积分属于 Platform User，不属于某一家 Merchant / Customer 的会员余额。

必须与以下资产严格分离：

- 本金余额
- 赠送余额
- 商户优惠券
- 商户充值记录
- 商户钱包流水

平台积分不可提现、不可直接视为现金余额，不进入“我的钱包”资金账本。

本文件明确替代阶段 03 早期“客户端不设计积分机制”的旧总结规则；自本变更确认后，V1.0 正式包含平台积分体系。

## 2. 客户端入口

“我的”页面新增独立积分入口 / 积分摘要，不把积分塞入会员资产摘要卡。

建议结构：

- 当前积分
- 今日签到
- 积分商城
- 我的兑换
- 积分明细

会员资产摘要卡仍只展示当前可用余额、优惠券数量、本金余额和赠送余额。

## 3. 每日签到

每日签到必须完成一次有效激励视频广告观看后才算签到成功。

规则：

- 每个自然日最多成功签到一次。
- 广告未完整观看、加载失败或验证失败：签到不成功，不增加积分。
- 完整观看成功后由服务端生成当日签到奖励。
- 签到奖励每天为随机 1～10 积分。
- 随机值必须由服务端产生，前端不得决定最终积分。

## 4. 每周总奖励规则

自然周按服务端权威时间和全局业务时区 `Asia/Shanghai` 计算，范围为周一 00:00:00（含）至下一周周一 00:00:00（不含）。自然日和跨周归属不得由客户端本地时钟决定。

若用户一周 7 天均完成有效签到，则该自然周 7 次签到奖励累计必须正好为 50 积分。

因此每日“随机 1～10 分”不是完全无约束随机，而应由服务端采用受约束随机：

- 每日结果仍落在 1～10 分。
- 在用户持续完成整周签到的前提下，系统需保证剩余天数仍有可行分配空间。
- 第 7 次签到时补足该周精确总额 50 分，但当日结果仍必须在 1～10 分范围内。

> random_algorithm_owner: backend
> random_algorithm_status: pending_technical_design

产品需求只冻结“单日 1～10 分、全勤周严格 50 分、漏签不补足”的结果约束，不指定概率分布或随机算法。技术架构阶段必须冻结服务端算法版本与分布策略；客户端不得自行生成、预测或重算奖励。

每次成功签到以 `platform_user_id + Asia/Shanghai 自然日` 作为业务幂等范围，并保存最终 `awarded_points`、`algorithm_version`、服务端生成时间和关联广告权益记录。重复请求必须返回首次成功结果，算法升级不得改写历史奖励。

如果用户漏签：

- 只获得实际完成签到日期的积分。
- 不自动补足到 50 分。
- V1.0 不提供补签。
- 不因漏签而补发未获得积分。

示例：完整签到 7 天可出现 8 + 7 + 6 + 9 + 5 + 8 + 7 = 50，但具体每日结果每周可不同。

## 5. 积分账户与流水

积分必须使用独立积分账本，不允许只保存一个可被直接覆盖的余额字段。

至少记录：

- 变动类型
- 积分变动值（正 / 负）
- 变动前余额
- 变动后余额
- 来源业务 ID
- 时间
- 幂等键
- 备注 / 原因（如适用）

典型记录：

- 每日签到 +N
- 兑换优惠券 -N
- 兑换实物 -N
- 兑换取消返还 +N
- 平台人工调整（如后续允许）

积分消费记录在积分中心 / 积分商城体系内独立展示，不混入商户钱包流水。

## 6. 积分商城管理权

积分商城由 Platform Super Admin 统一管理；实物奖励的总仓发货操作要求当前 Platform Super Admin 同时持有 `reward_fulfillment.manage` 权限。

V1.0 不允许普通 Merchant Owner 自行决定平台积分商品的积分价格。

超级管理员至少可配置：

- 奖励名称
- 奖励图片
- 奖励类型
- 所需积分
- 平台奖励库存
- 上下架状态
- 每人兑换上限（可选）
- 有效期（如适用）
- 可兑换 / 可领取门店范围
- 优惠券面额与适用范围（券类）

## 7. 奖励类型

### 7.1 线下消费优惠券

积分可兑换门店线下消费优惠券，例如：

- 固定金额优惠券
- 洗护优惠券
- 美容优惠券
- 寄养优惠券
- 其他平台允许的商户消费券

兑换前用户应选择适用 / 领取门店（若该奖励要求绑定门店）。

兑换成功后：

积分系统负责扣减积分并保存兑换记录；
钱包 / 优惠券域负责向所选 Merchant Customer 发放正式优惠券。

两者不得共用同一账本；跨模块失败必须支持幂等和补偿，避免积分已扣但优惠券未发或重复发券。

兑换门店需处于奖励允许范围内并有效；若尚未建立所选 Merchant Customer 关系，先按 `03g` 完成必要身份与关系校验，再确认扣积分。选择领取 / 使用门店本身不得读取其他门店的资产或自动共享宠物档案。

跨模块结果未确定时，客户端显示“兑换处理中”并可回到同一兑换记录查询；补偿已启动但尚未到账时显示“返还处理中”。只在优惠券已成功发放或积分补偿流水已成功入账后展示对应成功结果。

### 7.2 实物奖励

支持兑换：

- 狗粮
- 猫粮
- 冻干
- 零食
- 其他平台积分实物奖励

V1.0 不提供用户快递到家。

统一采用：

> 总仓发货到指定门店 → 实物线下到店 → 实际领取后店员登记；发货后30天未登记则系统默认已领取（无到货确认／领取凭证）。

## 8. 总仓到门店自提流程

> status: confirmed
> status_scope: physical_reward_shipment_actual_or_timeout_default_pickup_without_cancellation_receipt_or_credential
> confirmed_by: user
> confirmed_on: 2026-11-05
> reward_store_receipt_confirmation: retired
> reward_store_receipt_todo: excluded
> reward_pickup_credential: retired
> reward_pickup_scan_or_code_required: false
> reward_pickup_confirmation: manual_actual_handover_or_timeout_default
> reward_pickup_roles: [merchant_owner, active_store_staff]
> reward_pickup_store_scope: selected_pickup_store_only
> reward_pickup_start_state: warehouse_shipped_and_not_canceled
> reward_arrival_auto_inference: excluded
> reward_arrival_auto_notification: excluded
> reward_fulfillment_states: [待总仓发货, 已发往门店, 已领取]
> reward_pickup_validity_hours_after_shipment: 720
> reward_pickup_expiry_anchor: warehouse_shipped_at
> reward_manual_cancellation: excluded_before_and_after_shipment
> reward_shipped_manual_cancellation: excluded
> reward_unclaimed_expiry_action: default_mark_received_without_points_return
> reward_disabled_store_reassignment: excluded
> reward_disabled_store_contact: customer_service_phone_call

确认兑换成功并扣积分后，生成原总仓发货任务，持有reward_fulfillment.manage的Platform Super Admin确认发往顾客原选门店。实物到店和联系线下完成，无到货确认或领取凭证。顾客实际领取后，所选店老板／有效员工在原兑换单点击“已领取”；发货后连续30天未登记领取的，按§8.5由系统默认已领取。

### 8.1 提交与展示

- 服务端校验原积分、奖励上架／限额、平台独立库存和所选门店资格；同请求只扣积分／占库存／生成原兑换单一次，兑换失败的原子回滚与失败补偿沿原规则，不将“成功兑换不取消不退积分”误作失败也扣积分。
- 成功兑换后，发货前后均不能主动取消，不提供顾客、门店或总仓取消入口／接口；积分不退回，不生成新取消或返还任务。既有历史取消／合法失败补偿记录保留，不能清除或伪造完成。
- 已发往门店不表示已经到货或现在即可领取，详情提示联系原门店确认时间；不生成领取码、二维码、收货确认或自动到货通知。页面访问、预计日期及一般定时任务不能推断到货；只有§8.5明确的30天规则允许系统默认完成。
- 实际交付后本店老板／有效员工手动登记，保留F-RWD-023真实领取时间及024真实员工，F-RWD-029来源为manual_actual。不需顾客签字、凭证、短信或老板审批。
- 详情主状态均可为“已领取”，但须区分“门店登记领取”和“超期默认已领取”；后者显示系统处理来源／时间，不宣称已实际交付、不显示虚构的实际领取人或时间。
- 原真实发货及人工领取通知保留；默认完成仅更新真实系统状态，不冒发“顾客已实际领取”消息，不新增短信、自动电话或独立逾期提醒。

### 8.2 状态、主体与动作

| 状态 / 条件 | 主体 | 动作与校验 | 结果 / 客户端反馈 |
|---|---|---|---|
| 兑换处理中 / 结果未知 | 兑换用户 | 查询同一原请求 | 原结果或仍处理中，不重复扣积分／生成单据 |
| 待总仓发货 | 持有reward_fulfillment.manage的Platform Super Admin | 确认真实发货；无取消动作 | 已发往门店，保留原所选店与真实发货时间，不自动推断到货 |
| 已发往门店、未到默认截止且实际已交付 | 所选门店老板／有效员工 | 在原单手动登记已领取，校验有效任职、本店、原单与最新状态 | 已领取，来源manual_actual，保留实际领取时间／员工 |
| 已发往门店且达到发货起720小时，尚未登记领取 | 服务端到期处理 | 同一原单幂等默认已领取，不退积分 | 已领取，来源timeout_default，显示“超期默认已领取”，实际领取时间／员工保持未登记 |
| 已领取 | 兑换用户、原有权门店人员 | 查询原结果 | 不重复扣分、发放或出库；重复请求不改首次来源及时间 |
| 原领取门店停用 | 平台客服 | 保留原店与原单，由客服人工电话通知顾客协调领取 | 不自动或手动换店，不自动取消／退积分；停用门店员工不恢复经营权限，原720小时截止不重置 |

### 8.3 并发与记录

- 手动领取和系统到期默认完成都校验同一原兑换单最新状态；只能形成一次有效完成。同次成功请求重试返回原结果，不重扣积分、重复发放或改变首次来源。系统默认后不能再点出第二笔实际领取结果，事后纠错由平台原异常处理设计收口。
- 来源manual_actual才记录真实F-RWD-023／024；来源timeout_default写F-RWD-030系统默认完成时间，F-RWD-023／024不得拿定时任务时间、虚构员工代填。两者共享原兑换单，不能将默认完成统计为门店已实际交付。
- 原奖励库存与商品库存分离，到期默认、门店停用或客服电话联系不再次扣／加库存、不表示实物已退仓或已真实领取，不增加门店消费／收款／业绩。
- 未发货不生成720小时自提截止；原已取消／失败记录不被本次新规则复活，已实际领取的不被定时任务覆盖。成功兑换的本期流程不再产生新的取消状态或积分退回。
- 客服人工电话通知不是小程序自动语音／短信接口，不新增通知类别或给门店、任意客服账号平台写权限。

### 8.4 决策收口与剩余平台契约

DEC-POINTS-01的取消业务边界已确认：成功兑换后发货前后均不能取消、不退积分，不再阻塞取消入口设计，不得继续预留待开发取消入口。

| 决策 ID | 剩余待确认内容 | 收口阶段 / 影响 |
|---|---|---|
| DEC-POINTS-02 | 不换店、客服人工电话通知及超期默认已领取已确认；客服具体平台权限／电话处理记录、事后错误登记等剩余异常技术契约 | 阶段05／06／08；不重开取消、换店或到货确认流程 |

### 8.5 发货后30天未登记领取，系统默认已领取

> status: confirmed
> status_scope: shipped_physical_reward_timeout_default_received_without_points_return
> confirmed_by: user
> confirmed_on: 2026-11-05
> reward_pickup_validity_hours_after_shipment: 720
> reward_pickup_expiry_anchor: warehouse_shipped_at
> reward_manual_cancel_after_shipment: excluded
> reward_pickup_expiry_action: default_mark_received_no_points_return
> reward_pickup_expiry_boundary: now_greater_than_or_equal_to_pickup_deadline

- 原真实发货时间F-RWD-020加连续720小时为F-RWD-027 cutoff；不从兑换、预计到店或联系时间计，切店／联系／重试不重置。
- 服务端达到或超过截止，原单仍已发往门店且未登记领取时，同次写已领取、F-RWD-029=timeout_default及F-RWD-030实际系统处理时间。展示“已领取”及“超期默认已领取”说明；这不是取消，不写F-RWD-025、不生成积分返还／补偿、不改原扣积分。
- 默认完成不证明顾客实际拿到实物，F-RWD-023／024保持未登记；系统操作者及前后状态／请求沿原F-AUD留存，不伪造店员经办、签字、到货或实际领取时间。
- 人工登记与到期任务并发按原状态只成功一种结果；已成功人工领取的重试保留原实际来源，超期任务不会覆盖。默认任务迟到仍以原发货截止判断、处理时间如实记录，同次重试不重复完成。
- 门店停用不换店、不重置截止，由客服人工电话通知；到期默认不自动增加库存或确认实物去向。原真实领取通知与失败补偿保持，不因本规则新增短信或虚假实际领取通知。

### 8.6 奖励自提内部备注纠错

> status: confirmed
> status_scope: reward_pickup_internal_note_correction_contact_customer_service_only
> confirmed_by: user
> confirmed_on: 2026-11-05
> reward_pickup_internal_note_correction: contact_customer_service
> reward_pickup_store_direct_note_amendment: excluded

奖励自提业务的内部备注填错，由门店联系客服处理，老板／员工不在门店端直接修改。原备注及更正前后内容、真实处理人和服务端时间须保留，备注不向顾客或其他门店公开；备注纠错不修改原兑换、积分、发货／领取事实或720小时截止，也不解锁取消或重领。平台具体处理人员／界面及数据契约仍由后续平台设计明确，不因联系客服新增任意客服写权限、独立工单系统或未登记备注字段。食品风险同样按03h§2.4及03f§13.3处理；其他业务内部备注仍按各自原规则维护。

## 9. 积分商城库存边界

积分实物奖励使用平台 / 总仓独立奖励库存，不直接占用某家门店普通商品销售库存。

至少概念上区分：

- `reward_inventory`：平台总仓积分奖励库存
- `store_product_inventory`：门店商品正常销售库存

总仓将积分奖励发到门店用于履约时，应记录真实总仓发货和顾客领取结果，不设置门店到货确认阶段，但不应无理由把积分奖励自动并入门店普通可售库存。

## 10. 我的兑换

客户端“我的兑换”至少展示：

- 奖励名称
- 消耗积分
- 领取 / 使用门店
- 当前状态
- 兑换时间

券类奖励可深链到对应优惠券；实物奖励显示真实发货和领取状态，不推断已到货，不展示领取凭证。

兑换记录属于 Platform User，切换当前门店后仍可查看；关联领取 / 使用门店须如实展示。查看具体商户优惠券时，按 `03g` / `03f` 校验对应门店 Customer 权限后进入，不把平台兑换记录作为越权凭证。

## 11. 故障隔离

积分系统故障不得导致：

- 商户钱包不可用
- 洗护 / 美容不可用
- 寄养不可用
- 商品正常销售不可用
- 订单收银不可用

积分签到 / 商城不可用时，只降级积分相关能力。

## 12. V1.0 关键验收场景

### C-POINTS-01：每日签到

- 点击签到后进入激励广告。
- 完整观看后签到成功。
- 当日增加 1～10 随机积分。
- 同一天不得重复获得签到积分。
- 同日重复请求返回首次成功的相同积分值；记录可追溯到算法版本、服务端生成时间和广告权益记录，客户端不重新随机。

### C-POINTS-02：完整自然周

- 用户周一至周日每天完成签到。
- 每天奖励均在 1～10 分。
- 7 天合计严格为 50 分。

### C-POINTS-03：漏签

- 未签到日期无积分。
- 该周不自动补足 50。
- 无补签。

### C-POINTS-04：兑换优惠券

- 扣积分后获得指定门店优惠券。
- 积分记录与商户优惠券记录分别可查。

### C-POINTS-05：兑换实物

- 选择领取门店。
- 仅持有 `reward_fulfillment.manage` 的 Platform Super Admin 可确认总仓发货到门店；Merchant Owner 与 Staff 不可执行。
- 无门店到货确认／奖励收货待办，无领取凭证／扫码验码；发货不自动表示到货或已领取。
- 门店线下联系，顾客实际领取后店员在原兑换单点已领取，记录门店／员工／时间，不需老板审批。

### 兑换边界验收补充

- 重复提交、网络重试及迟到回调不重复扣积分 / 占库存；最后一份库存并发兑换结果符合真实库存。
- 结果未知时可从我的兑换恢复查询；补偿未入账时显示返还处理中，不提前展示积分已返还。
- 未发货／历史已取消／其他门店不能人工登记领取；实际未交付不能人工假记。发货起720小时到期与人工登记并发只完成一次，分别保留manual_actual或timeout_default来源，默认完成不伪造实际领取时间／员工；成功重试不重复。
- 成功兑换后发货前后均不能取消、不退积分；发货起720小时未登记按§8.5默认已领取，非取消。门店停用不换店，由客服人工电话通知，原截止不重置，失败补偿及原历史保留。

## 13. 需求变更记录

历史变更已移至 [`docs/history/2026-client-requirements-changes.md`](history/2026-client-requirements-changes.md)。本文件正文仅保留当前有效规则。
