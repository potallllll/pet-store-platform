# 04 店员端小程序需求

> status: confirmed
> status_scope: confirmed_business_rules
> change_policy: record_required
> development_readiness: ready
> blocked_by: []
> version: V1.0
> implementation_policy: implement_confirmed_scope_only
## 1. 文件边界

本文件全部门店业务均遵守统一轻量规则：不设置老板审批或二次审批；退款、充值退款、免单的原因必填，其他动作原因一律选填；每次成功修改由系统自动记录实际操作人、服务端时间及修改前后值。后文若仍出现与此不同的旧措辞，以本条为准并应由审计脚本报错。

邀请码仅本店、老板只创建、单码全部顾客合计一次、创建后连续72小时且不设启停／换码／活动调整保持；兑换范围包含优惠券、服务活动和商品活动，每码只含一个内容，领取后的券权益初始有效期为一个日历月。到店结算时选择可用券，由服务端自动校验本店、顾客、适用项目、期限和并发状态，并在成功结算后自动核销、关联原单；未结算成功不得核销。老板创建后经微信自行转发员工，不设员工未使用邀请码查看／复制／分享入口，兑换历史归消费历史。

全小程序通知等级已确认仅“普通通知／重要通知”，店员端同样执行03f§10，复用F-MSG-012；预约等业务类型、渠道、任务完成规则独立。当前阶段业务短信按03f§13.2不发送，相关入口显示“暂未开放”；短信未来开放及未列触发／模板技术规则仍另议；本人通知设置三项按§3.0.3.1已确认，也不把所有重要通知当食品重新知悉。

本文件已确认范围另含§3.0.21结算锁定及补收／退款规则、§3.0.4.4当前员工列表三列及§3.0.3.5仅本人修改称呼、§3.0.4.3员工入职邀请12小时／单人使用／明确加入及员工称呼、无老板撤销、§3.0.3.4统一登录／手机号认证／身份识别及确认换绑；包括§3.0导航与功能归属、§3.2工作台分组／开单入口、§3.7预约管理及确认提醒、§3.8普通商品需求处理、§3.9上门喂养确认／撤销及联系方式门槛、§4.1开单基础、§4.3／4.4洗美、§4.5护理、§4.6挂单查询／补收与撤销、§5.1寄养入住／日常照护、§5.2过夜计费／实际离店结算、§5.4健康资料／特殊照护及异常沟通、§6.1消费争议回应及§6.5统一顾客风险门店端规则。未登记技术契约仍不得猜测实现。

本轮洗美以§4.3／4.4为准：五态、多宠一单、六项检查／复检，皮肤、耳道、眼睛、口腔、指甲、毛发与全身共七组均提供洗护前／后照片入口且全部选填；完成或中止费用明确后结算，挂单原因选填，改0后明确确认免单且免单原因必填。财务仅记录线下交易、可即时或工作结束后录入，不接外部收银／支付系统；预约和服务仍及时操作。全部消费最多两种支付方式，退款老板／有效员工均可办理、无需审批，消费先扣本金再扣赠送，退款按原付款渠道／原账户退回，确认记账自动联动余额／流水／适用库存。护理按§4.5，寄养过夜计费／实际离店结算及日价更正边界按§5.2；日常照护时间轴只保留喂食／遛狗／清扫笼子／其他四类，每条说明选填。代接、送医、代喂药等选“其他”登记。结算后金额锁定，有错走补收或退款。

不新增店长/收银员/美容师等系统角色，不重新定义客户端规则，不把后续阶段尚未决定的金额、权限、审批或服务状态机写成默认值。用户逐项确认后，更新对应正式业务位置与本文件状态范围，记录历史。

## 2. 现有约束与来源索引

| 已有事实（摘要，不另定规则） | 权威位置 | 对店员端分析的约束 |
|---|---|---|
| 老板与店员使用同一店员端；有效在职店员统一默认业务权限 | 02§1、§3、§4 | 不造第二个店长角色或逐员工权限开关；老板／平台专属权限及记录可见性仍由服务端校验 |
| 一商户一门店，员工只能属于一个商户/门店 | 01§3、02§4/§6 | 不做连锁店切换；租户归属和可工作门店字段不能混用 |
| 老板邀请、停用、删除（移出名单）和恢复员工；历史保留，会话失效 | 02§6～§8 | 恢复适用于被停用记录；删除后返聘由老板重新邀请，关联原员工身份并保留历史 |
| 高频低步骤，临时到店可直接开单，不强制预约 | 00产品交互原则、01§7、03a | 快速路径与完整路径都需要；不以少步骤绕过财务确认 |
| 客户提出期望时间，门店人工确认；建议新时间需客户确认 | 03a | 不设固定预约间隔或时段名额，仍须校验营业／关闭状态和预约版本；改期成功才替换原预约，见03a§11 |
| 到店消费订单可不限幅调价／免单，结算后锁定 | 01§7、03d§10.1、§3.0.9 | 本店老板及有效员工无需逐单审批；留痕、确认和零元不造付款继续校验；消费退款另按03d§12无需老板审批，不扩张为充值退款或任意改余额 |
| 洗护美容要有详细过程与结构化结果 | 01§13、03与03i§5 | 店员细流程到客户端简状态需显式映射，不用三态替代全部过程 |
| 寄养独立核心业务，动态按发生时间排序 | 01§14、03i§3.4 | 入住/照护/离店/补录/异常各自分析，不让补录冒充刚发生 |
| 加餐按普通商品销售；照护需要时另记 | 03e§17、03d§4.3 | 不创建独立投喂待办／确认或自动照护；真实喂食从原寄养照护另记 |
| 本店投诉回应与喂养对接 | 03h、03j、§6.1 | 投诉原职责不变；喂养保留用户自主接单，当前店仅确认／撤销，确认后店家看双方联系方式 |
| 积分奖励线下自提登记 | 03k§8～§9、02§2 | 无门店到货确认／领取凭证，实际交付后点已领取；总仓发货权限仍仅属Platform Super Admin |
| 会员、库存、业绩及对账等按各模块分别收口 | 01§10/§15、02§4、§3.0.10.1 | 日结／交接班／现金盘点本期排除；门店日常经营和老板设置全部在小程序，网页后台只给平台使用 |

## 3. 工作台与全部菜单（导航部分确认）

> analysis_priority: workbench_and_all_menus
> priority_confirmed_by_user_on: 2026-09-15
> menu_status: mixed
> navigation_status: confirmed
> detailed_menu_status: confirmed

### 3.0 已确认的导航与功能归属

> confirmed_by: user
> confirmed_on: 2026-09-15
> bottom_navigation: [工作台, 业务, 洗美, 客户, 我的]
> wash_groom_primary_entry: 洗美
> boarding_primary_entry: 业务/寄养
> business_menu_status: confirmed
> business_menu_order: [预约管理, 商品处理, 寄养, 上门喂养, 消费争议, 订单与收银]

“业务”页固定按上述六项顺序展示，承载对应业务的完整办理入口与历史查询。“商品处理”复用§3.2的商品需求、奖励自提分类；“消费争议”承接本店争议处理与历史查询；“订单与收银”是原订单和授权收银操作的统一入口，不另建订单账本。工作台快捷入口与业务入口使用相同业务对象和详情。菜单名称与顺序确认不授予额外权限，不关闭各业务状态、收款及异常处理的待决项。

底部导航名称与顺序以以上字段为唯一依据。“洗美”指洗护、美容，承载这两类业务；寄养归入“业务”，不设寄养独立底栏入口。这是菜单归属，不改变寄养作为独立核心业务的定位，也不新增系统角色。

五个底部入口的名称、顺序及洗护美容/寄养归属已确认，保留“业务”入口，不删除。工作台专注当天需要处理的事项；业务承载其所属业务的完整办理入口与历史查询，本页六个菜单及顺序以本节已确认字段为准，菜单内部细节仍待确认。洗美、客户、我的继续遵循各自已确认归属，不把所有端内功能都迁入业务。工作台分组、组内顺序与快捷项见§3.2已确认规则；其余二级菜单细节、视觉布局、手机/Web分工、权限与状态机仍待确认。工作台或其他页面如提供快捷入口，应进入同一业务对象与详情，不另建洗美或寄养模块；工作台快捷项名称与顺序已在§3.2确认，临时开单与会员开单的顾客资料入口差异也已确认，其余操作细节仍待确认。

#### 3.0.1 已确认：洗美页分组与入口

> status: confirmed
> status_scope: wash_groom_page_groups_create_entry_and_no_pickup_confirmation
> wash_groom_page_groups: [待接宠, 服务中, 待结算, 历史记录]
> wash_groom_pickup_confirmation: excluded
> wash_groom_create_entries: [临时开单, 会员开单]
> wash_groom_active_lists_confirmed_on: 2026-11-02
> wash_groom_waiting_scope: created_service_records_in_not_started_only
> wash_groom_unconverted_appointment_entry: 业务/预约管理
> wash_groom_waiting_sort: original_order_created_at_ascending
> wash_groom_in_progress_sort: actual_service_started_at_ascending
> wash_groom_pending_settlement_sort: original_order_created_at_ascending
> wash_groom_active_lists_cross_day: retain_until_original_business_state_changes
> wash_groom_active_lists_history_window: not_applied
> wash_groom_active_lists_search_keys: [customer_contact_mobile]
> wash_groom_active_lists_filters: [洗护／美容]
> wash_groom_active_lists_columns: [开单时间, 顾客, 宠物, 服务项目, 服务状态, 结算状态, 最终应收]
> wash_groom_active_lists_price_unknown_label: 待确认
> wash_groom_active_lists_multi_pet_price_label: 整单应收
> wash_groom_active_lists_action_entry: original_detail_only
> wash_groom_list_one_click_complete_or_collect: excluded
> wash_groom_history_confirmed_on: 2026-11-02
> wash_groom_history_service_states: [completed, cancelled, interrupted]
> wash_groom_history_settlement_required: false
> wash_groom_history_unsettled_entry: same_original_record_as_pending_settlement
> wash_groom_history_default_days: 15
> wash_groom_history_day_boundary: today_and_previous_fourteen_calendar_days_in_business_timezone
> wash_groom_history_date_field: order.created_at
> wash_groom_history_default_sort: order_created_at_descending
> wash_groom_history_search_keys: [customer_contact_mobile]
> wash_groom_history_filters: [洗护／美容, 服务状态, 结算状态, 开单日期]
> wash_groom_history_columns: [开单时间, 顾客, 宠物, 服务项目, 服务状态, 结算状态, 最终应收]
> wash_groom_history_price_scope: original_order_final_receivable_only
> wash_groom_history_multi_pet_price_label: 整单应收
> wash_groom_history_list_paid_amount: excluded

| 页面分组 | 已确认职责 |
|---|---|
| 待接宠 | 仅已开单且尚未开始的洗护／美容服务，按原单开单时间从早到晚；尚未开单的预约从业务／预约管理办理，不自动混入本组。 |
| 服务中 | 展示正在洗护／美容的服务，按各宠真实开始服务时间从早到晚。 |
| 待结算 | 服务已正常结束或已中止、尚未完成结算的洗美原单，按开单时间从早到晚，未处理跨天保留、不受历史15天限制；费用未明确可查看处理但不收款。挂单仍关联原单，不是已付款或第二消费单。 |
| 历史记录 | 查询已完成、已取消、已中止的洗护／美容服务，未结算亦可查；默认近15天，可按本店顾客手机号搜索及项目类型／服务状态／结算状态／日期筛选，展示原单最终应收。 |

页面只提供“临时开单”“会员开单”，复用§3.2／§4.1同一开单能力；工作台与洗美页不得分别创建独立流程或订单，不展示其他同义开单按钮。

页面分组不替代§4.3服务状态。洗美不设确认接走，不因完成或付款声明已接走；原待交付分组改为待结算，不保留同义入口。挂单统一在业务／订单与收银／挂单查看，复用原单；工作台只承接当日需处理提醒，不变成完整欠款目录。历史查询按下述已确认范围执行；未登记技术细节留给后续架构阶段，不得创建隐藏接走接口。

**待接宠／服务中／待结算列表（2026-11-02确认）**：

1. **待接宠范围**：只有已开单、存在原order_id／service_record_id且服务当前not_started的洗护／美容，按原Order F-CORE-013 created_at升序；纯预约无论是否已确认，只要未开单仍从业务／预约管理办理。确认预约不自动建单或开始服务，原预约转开单／停用项例外、前检查与主人决定继续按原规则校验。
2. **服务中排序**：真实in_progress服务按各自F-SVC-005 service_started_at升序，不用开单／预约／手机时间或列表打开时间替代；读取失败或缺真实时间如实提示，不伪造。多宠进度独立，一宠开始／完成不覆盖余宠，已完成重新处理仍按其原合法流程，不因列表分组另建服务对象。
3. **待结算及跨天**：正常结束或已中止、尚未结算的原记录按原order.created_at升序。未处理跨天保留，三个办理列表均按当前真实状态查询，不按午夜清空或套用历史默认15天条件；历史15天只作用于历史入口。中止金额未明确仍可进原详情处理，收款须原服务结束／费用明确等前置条件；原挂单按§4.6办理，不因进入待结算自动挂单／免单／收款。已结算后按真实状态退出待结算，不因旧缓存继续占位。
4. **搜索、筛选与列**：三个列表均按本店顾客手机号F-CUST-001搜索，支持洗护／美容类型筛选，组合当前分组状态生效；客户页／挂单／历史各自已确认的其他搜索筛选不变。列显示开单时间、顾客／宠物、服务项目、真实服务状态、原单结算状态和最终应收；唯一价格源F-ORD-014，不用参考价／实收替代，不另加列表实收。金额尚未明确时显示“待确认”，多宠一单标“整单应收”，不分摊逐宠或重复记收入；0应收不自动表示已免单或收款，内部备注／原始审计不公开。
5. **统一操作入口**：点击进入同一原单／原宠物服务详情，再按对应流程检查、开始、完成或结算；三个列表不提供一键完成、一键收款，不能仅在列表改标签或跳过检查／费用确认。只查询、搜索、筛选、刷新不改变服务／金额／库存／余额／通知，切店或换条件后迟到响应不得串旧数据。多宠服务可能按各自状态在不同分组关联同一原订单，分组不复制订单、金额或交易；取消／中止仍不能恢复原服务。工作台仍只承接当天事项，独立护理／寄养不混入洗美分组，本规则不推导为其他业务列表的动作限制或新状态机。

**历史记录查询（2026-11-02确认）**：

- **范围及原单**：已完成、已取消、已中止的洗护／美容均可查询，是否收款不是纳入历史的前提。已完成／已中止且尚未结算的，同一原单仍可从“待结算”和“历史记录”进入；中止费用未明确也可查询／处理，收款仍须原费用确认等前置条件。复用order_id／service_record_id，不复制订单／账目或据此计两次消费。多宠依各自真实服务状态展示，不能因一宠结束把余宠改已完成；同宠洗美护理加项仍归原洗美，独立护理／寄养／商品不混入洗美历史，独立护理仍从业务／订单与收银查询。
- **日期及排序**：默认按原订单开单时间查询最近15个自然日，使用F-CORE-009业务时区Asia/Shanghai，含今天及此前14天；日期起点含当日00:00、终点用所选末日次日00:00且不含该时刻，不能当成滚动360小时。开单时间沿原order_id的F-CORE-013 created_at，不用实际服务开始／完成、结算或补图时间。默认开单时间从新到旧；可选其他日期查更早记录，15天不是数据保留或删除期限。
- **搜索及筛选**：本历史入口按顾客手机号F-CUST-001搜索，按洗护／美容、真实服务状态、原单结算状态和开单日期筛选，条件组合生效、清除条件可重查。服务状态沿F-SVC-004在上述三种已结束状态内筛选，结算状态沿F-ORD-017已定义状态，不造统一总状态；已免单与已收款、服务完成与已结算分别显示。手机号仅查询当前Merchant原Customer有权数据，不读F-AUTH已验证手机号冒充线下联系方式、不跨店探测或消耗跨店共享查询次数。本轮不额外增加宠物昵称／订单号等历史搜索键；客户页§3.0.2及挂单§4.6既有搜索范围不变。
- **列表及价格**：显示开单时间、顾客／宠物、服务项目、服务状态、结算状态、价格。价格只展示本单F-ORD-014最终应收，不在列表另加实收或用F-ORD-015实收／F-ORD-008明细原始单价替代；多宠一单明确标“整单应收”，不擅自分摊到每宠，也不把同单金额重复记收入。最终应收未明确或读取失败时如实提示，不能补0、猜金额或假报成功；全未开始即全取消按原规则不收费，不以原参考价冒充欠款，也不记免单成交。0元应收不自动表示已免单／已收款，结算状态仍沿真实记录；详情内原有财务信息不因本列表简化而删除。
- **只读及权限**：点击进入原单／原宠物服务详情，仍按本店有效身份和原对象权限取数，不公开内部备注或原始审计。搜索／筛选／重复刷新只改变视图，不重开已终止服务、不改变服务／金额／余额／库存／通知状态；切店或换筛选后迟到响应不得覆盖当前条件。取消／中止后仍须新开单重新来，历史入口不能提供恢复原单绕过。

#### 3.0.2 已确认：客户页结构

本店老板和有效员工在办理预约、开单、服务、寄养、商品、退款或联系顾客时，可以查看该本店顾客的完整手机号，以便直接拨打；不做中间四位脱敏。权限只限当前Merchant已有Customer，不得用手机号跨店枚举。营业执照仍只有本店老板和平台管理员可看，普通员工不可见。

> status: confirmed
> status_scope: customer_page_search_list_switch_create_and_detail_sections
> customer_search_keys: [姓名, 昵称, 手机号, 宠物名称]
> customer_list_views: [按顾客, 按宠物]
> customer_create_entry: 新增顾客

- 客户页顶部提供统一搜索，支持按顾客姓名、昵称、手机号和宠物名称查找当前Merchant有权访问的记录；搜索不得绕过租户隔离或借手机号探测跨店私有资料。
- 列表可在“按顾客”和“按宠物”之间切换，两个视图引用同一Customer／Pet对象，不分别复制档案。
- 页面保留“新增顾客”入口；线下Customer可以先于平台User存在，后续安全绑定规则按03g执行。
- 顾客详情固定承载：基础资料、关联宠物、会员资产、订单／服务、本店私有备注，以及当前门店依法有权查看的服务履约记录。
- 宠物详情固定承载：基础资料、护理注意事项、服务记录，以及当前门店依法有权查看的跨店护理信息。
- 客户页结构确认不等于开放任意跨店搜索。跨店服务履约记录只能在§6.5.1已确认的真实业务触发中按03h§10.1校验；其他门店订单、余额、消费明细和内部备注不得展示。
- 本店老板／有效员工不能直接修改本金或赠送余额；需要退还充值时从原充值记录发起充值退款，原因必填。详情区出现不代表额外授权。

#### 3.0.3 已确认：普通员工“我的”菜单

> status: confirmed
> status_scope: ordinary_staff_me_menu_names_order_purposes_and_record_visibility
> confirmed_by: user
> confirmed_on: 2026-10-22
> staff_me_menu_order: [员工与门店信息, 我的工作记录, 我的业绩, 通知设置, 账号与安全, 帮助与反馈, 退出登录]

| 顺序 | 菜单 | 已确认用途 |
|---|---|---|
| 1 | 员工与门店信息 | 查看本人称呼、所属门店和当前账号状态；仅本人修改称呼，原因选填、自动留痕，老板不可代改，见§3.0.3.5。 |
| 2 | 我的工作记录 | 员工仅看本人实际经办／服务记录，老板默认全店、可切本人；四列时间／员工／项目／结算价格，价格实际已收款，只读点原业务，见§3.0.3.2，不返系统审计。 |
| 3 | 我的业绩 | 查看本人归属订单明细核对，老板可汇总本店员工；每单归属必须明确，每单一人默认开单人／员工只能转出当前本人归属／老板可改本店全部且变更原因选填，客户端商品确认时必选，消费实收／退款用于核对，最终业绩取退款后净消费；历史缺归属统一算本店老板。 |
| 4 | 通知设置 | 本人主动微信授权入口、站内普通／重要通知规则说明及短信暂未开放；不做逐业务开关，见§3.0.3.1。 |
| 5 | 账号与安全 | 微信登录、手机号认证、身份识别及确认换绑按§3.0.3.4／03g§3.1；其他安全设置不因菜单存在视为已定。 |
| 6 | 帮助与反馈 | 简短操作说明、文字必填截图选填的使用反馈；门店提交人时间自动记录，成功提示后由平台后台查看处理，见§3.0.3.3，无聊天／工单进度或门店公开展示。 |
| 7 | 退出登录 | 退出当前登录会话。 |

本节确认名称、顺序、用途和§3.0.5的记录可见性；业绩统计按§3.0.10，本人通知设置按§3.0.3.1；微信登录／手机号认证／按号码识别当前身份及确认换绑按§3.0.3.4。其他账号恢复、独立账号合并和未登记技术操作不得由前端猜测。店员统一业务资格见02§4；菜单不授予正文未列出的业务动作、修改业绩或管理门店的能力。“我的工作记录”引用原业务对象的工作事实视图，不直接返回原始系统审计，不创建第二套订单或财务账本。

“帮助与反馈”用于产品使用问题，不能替代03h正式投诉；投诉或跨店顾客风险有异议时统一提示联系客服，不新增小程序申诉、在线客服或私聊系统。退出登录结束会话，不删除员工历史或业务记录。

老板与员工共用同一店员端；老板在“我的”页面额外看到§3.0.4的“老板管理”入口，内部菜单及手机／Web分工仍待逐项确认。

##### 3.0.3.1 本人通知设置三项

> status: confirmed
> status_scope: staff_self_notification_settings_controls_only
> staff_notification_settings_entry: 我的/通知设置
> staff_notification_settings_owner: current_authenticated_user_only
> wechat_notification_authorization_trigger: explicit_self_initiated_action
> wechat_notification_permission_source: actual_platform_permission
> inapp_notification_generation: existing_business_event_rules
> per_business_notification_switches: excluded
> staff_notification_priority_editable: false
> business_sms_settings_availability: not_available
> business_sms_settings_label: 暂未开放
> business_sms_settings_enable_control: excluded
> wechat_template_permission_api_contract: pending_technical_phase

1. **微信提醒**：提供本人主动发起的微信通知授权操作入口，不在进入页面、打开订单或老板代操作时自动授权。不以未授权／拒绝／授权失败限制正常业务，站内消息及原业务记录照常。只能按微信实际返回的许可和当前可用条件决定授权结果与发送，不以按钮点击、本地开关或一次成功发送冒充长期／全部模板许可；当前许可读取失败如实提示，不假称已开启。实际模板、授权有效范围及接口映射等技术契约后续收口并先登记字段，不自行用永久Bool当发送资格。
2. **站内通知**：按原已确认业务事件生成普通通知／重要通知，不做逐业务通知开关，不允许本人或老板自行改变业务通知等级。沿03f原事件例外及防重，不将设置页改成所有事件都发通知；原中止护理／洗美及洗美补图说明不发等规则保持，不因打开设置或微信授权新增消息／待办。
3. **短信提醒**：业务短信统一显示“暂未开放”，无可启用开关，不发短信、不建发送／定时补发或失败重试队列；以后开放另行确认。这里只是业务提醒，03g已确认登录／手机号验证要求不因此取消。

老板与有效员工通过此公共菜单只管理本人，不替其他员工授权／开关，不修改他人的消息已读、未读或待办。页面权限和每次请求沿真实登录身份及本店任职；微信授权不建立员工关系、恢复停用员工访问或授予跨店业务资格。消息接收主体、模板及授权技术按真实平台身份映射，不为员工伪造Customer来套用客户消息字段。通知授权、消息等级、业务类型、渠道发送结果、已读和业务办理分别处理。

详细共享通知边界见03f§11.1／13.2；原通知设置产品ID保留，授权入口登记staff_me.authorize_wechat_notifications，不新增逐业务开关／短信启用ID。复用F-MSG-012及原消息字段，仍734、原永久号逻辑名类型状态不改，不将016～019发送审计当授权存储。其余模板和接口契约待技术阶段，不把本次业务设置确认当已接通微信授权／送达测试。

##### 3.0.3.2 我的工作记录：员工仅本人，老板默认全店

> status: confirmed
> status_scope: work_record_visibility_four_columns_actual_paid_price_and_readonly_navigation_only
> work_record_staff_scope: actual_self_work_facts_only
> work_record_staff_store_switch: excluded
> work_record_owner_default_scope: all_current_store_work_facts
> work_record_owner_scope_options: [current_store, self]
> work_record_list_columns: [时间, 员工, 项目, 结算价格]
> work_record_time_basis: original_business_work_fact_recorded_time
> work_record_sort: recorded_time_desc
> work_record_price_field: paid_amount
> work_record_price_basis: actual_recorded_receipts_in_original_order
> work_record_mutations: excluded
> work_record_complex_filters: excluded
> work_record_system_audit_details: excluded

**查看范围**：普通有效员工只能看本人实际经办／服务参与的本店工作事实，不显示“全店”切换，也不能用其他staff_id、scope、原对象ID、旧链接或缓存接口读取他人的工作记录。本人依据服务端登录身份、F-CORE-005原稳定员工及原业务真实经办／服务员工关联校验，不依据订单业绩归属F-ORD-038；老板合法更正业绩归属不转走或改写旧实际经办记录。老板默认看本店全店，可切本人，包含本店已停用／移出员工的历史事实；平台管理员仍原按职责资格。失效员工不能继续读本店，返聘沿原身份及合法访问规则，不复制历史。

**列表**：只显示时间、员工、项目、结算价格四列，按原工作事实形成的记录时间倒序，不拿原订单开单时间或实收日期替换工作记录时间。员工显示原实际经办／服务人员，项目取原服务／商品或业务项目摘要，不把业绩归属人、系统审计动作或新接手人冒充。原业务事实的稳定对象／人员／记录时间按所属已确认源数据映射，不新建工作记录台账或擅自补造历史；细分事件到既有字段的技术映射在实现前按注册表收口。这里不增加复杂搜索筛选或第二份业务数据。

**结算价格**：用户明确采用“实际已收款（与业绩实收一致）”，列表列名仍叫结算价格；关联消费订单时取原F-ORD-015 paid_amount的当前累计真实已记账收款，不用014最终应收、参考价、未记账线下口头金额或服务完成金额替代。确认未收款显示0并说明未收款，明确免单显示0并按原真实状态标已免单，不因数字0自动结算；未关联消费订单的工作事实显示“—”，不造订单／收入。未知或读取失败提示不可用，不当0；实际退款仍沿原016及退款事件记录，不把实收改成净消费。

一单多宠／多项目或同一订单关联多条工作事实时，金额取同一原单且标整单实收，不猜分摊给每宠／项目或把展示行相加当个人业绩。本列表按真实经办事实取范围，金额按原实际收款语义读取；“与业绩实收一致”不把人员筛选改为业绩归属，也不改变原§3.0.10真实事件期间、归属及退款统计口径，不新增汇总、退款或净额列。

**只读与跳转**：工作记录不能修改、删除，不显示系统审计前后快照或他人员工业绩汇总。点击进入当前有权的原业务详情，仍逐次复核身份／本店对象及字段权限；有一条本人工作事实不授予同单他人工作记录、无权原件或改他人业绩归属资格。原订单及服务协作访问沿各自既有业务权限，不把本次视图收紧扩大成取消其他合法协作；也不能借协作详情批量拉取他人工作记录。业务更正走原动作，保留历史不改记录。

复用staff_me.work_records，不新建老板工作记录菜单，四列展示源沿原工作事实、CORE／SVC／PAY／ORD和审计的合法最小业务投影，F-ORD-015只作原金额引用，不新增settlement_price／work_record_owner等长期同义字段。字段仍734、原号名类型状态及产品ID保持；记录时间／明细映射等剩余技术先按字段注册表收口，不定新保存期限或宣称前端／权限功能已实测。

##### 3.0.3.3 帮助与反馈三项

> status: confirmed
> status_scope: staff_help_instructions_and_minimal_product_usage_feedback_submission_only
> help_feedback_entry: 我的/帮助与反馈
> help_instruction_topics: [预约, 开单, 收款记账, 寄养, 商品入库]
> help_feedback_required_input: help_feedback_text
> help_feedback_optional_input: help_feedback_image_refs
> help_feedback_automatic_context: [merchant_id, store_id, staff_id, created_at]
> help_feedback_unique_owner_field: merchant_id
> help_feedback_receiving_surface: platform_web_management
> help_feedback_success_ui: submission_success_message_only
> help_feedback_chat: excluded
> help_feedback_ticket_progress_ui: excluded
> help_feedback_store_public_display: excluded
> help_feedback_platform_processing_contracts: pending_backend_stage

1. **操作说明**：提供预约、开单、收款记账、寄养、商品入库等简短说明，从当前已确认业务提炼，不新增复杂知识库、客服对话或另一套业务规则。说明与正式模块冲突时应修正说明，不由帮助文案反向改变已确认流程。
2. **提交反馈**：文字必填且不能全空白，截图选填；门店、实际提交人和时间由服务端自动记录，无需重复填写或选择员工。提交人沿当前有效老板／员工的原稳定staff_id，merchant_id唯一归属当前本Merchant，store_id为实际门店上下文，不让客户端冒充他人／别店。时间复用CORE013 created_at，为首次成功提交时刻，不用截图拍摄／点击按钮或重试时间。只收本次文字及主动选择的截图，不额外自动带出顾客资料、原始日志或私人证据附件。
3. **提交结果**：服务端保存成功后显示反馈已提交的提示，交平台后台按原平台管理资格查看处理；不新增聊天、工单进度、门店公开展示或小程序反馈历史／处理状态页面，也不因此生成站内、微信或短信通知。平台具体列表、处理动作及权限契约后续后台阶段确认，不预设回复时限、处理状态机或客服新角色。

反馈仅用于小程序产品使用问题，不替代03h消费争议或正式投诉，不自动建投诉对象、启动7天回应／3天补证、判责、退款或补偿；涉及正式争议时仍使用原入口，有异议则按规则联系客服。这里不复活已退役宠物交友F-SOC字段，不借其举报／反馈结构实现本功能。

截图不是必填；选择了截图后上传／提交失败应如实提示并保留输入，用户可重试或主动移除截图后提交，不静默丢图假成功。正文和图片引用须本店当前身份及资源归属校验，不能引用他人无权资源；反馈不是公开商品图或投诉公开副本。复用CORE010防重，同次提交重试返回原HELP001及原created_at，不重复反馈；不因成功提示创造第二条记录。

新增HELP001～003后字段共734，身份门店时间和幂等沿CORE002／003／005／013／010及原审计复用，不新造submitted_at／operator_id同义字段。原staff_me.help_feedback保留，提交动作登记staff_me.submit_help_feedback。其他查看管理权限、图片大小数量／资源与数据留存等未列技术细节后台及技术阶段收口，不自行给老板新增他人反馈读取入口或把全店订单权限当反馈原件权限；本期只确认本表单和平台接收方向。未改H5或真实提交代码，不以文档检查当实际反馈收集验收。

##### 3.0.3.4 微信登录、手机号认证与身份识别

> status: confirmed
> status_scope: login_mobile_authentication_identity_resolution_and_explicit_wechat_rebinding
> confirmed_by: user
> confirmed_on: 2026-11-05
> canonical_rule_source: 03g_section_3_1

统一完整流程只读03g§3.1：微信登录 → 服务端检查手机号认证，当前有效认证直接登录、未认证先认证 → 按已认证手机号对应账号的有效经营关系识别身份；无有效老板／员工身份则进入客户端。有重复绑定时先提示“手机号异常：该手机号已绑定其他微信，是否换绑？”，认证号码并确认后沿用原账号身份／历史，解除旧微信绑定并失效旧会话；取消不取得原身份，不另增旧微信确认或人工审批。此处“身份”不取Customer手填电话、门店注册号码或前端角色。

老板／员工停用、移出和门店停用不因换绑恢复，老板自助注册及员工新邀请／返聘仍按02。数据主键、历史经办及订单业绩不随微信变化；不合并两个既有账号、不创建重复员工、不跨租户。共享查询授权／身份冲突仍按03h。具体绑定／认证证明／会话接口先完成FIELD技术映射后实施，其他账号安全菜单细节不因此整体确认。

##### 3.0.3.5 仅本人修改员工称呼

> status: confirmed
> status_scope: self_only_staff_display_name_edit_entry_and_controls
> confirmed_by: user
> confirmed_on: 2026-11-05
> canonical_rule_source: 02_section_7_1
> staff_display_name_edit_entry: 我的/员工与门店信息
> staff_display_name_editor: record_owner_only
> owner_edit_other_staff_display_name: forbidden
> staff_display_name_edit_reason_required: false
> staff_display_name_edit_audit: automatic

本人从原“员工与门店信息”修改F-STAFF-015 staff_display_name，去除首尾空白后必填，原因选填、无需审批，真实变化自动保留前后值／人／时间。老板不能修改他人员工称呼，员工列表无代改入口；接口按真实登录账号、当前有效员工关系校验本人，不能修改传入staff_id对应他人、跨店或已失效记录。老板如有本人对应员工身份也仅按本人规则，不能由全店管理权限推出代改。

修改只影响当前称呼，员工身份、业绩归属与历史人员快照不变；同名不合并，原实际经办不重写。未变不伪造修改，失败保留输入且不假报成功，同请求重试不重复留痕；自动审计不授予普通员工读原始日志。完整名单／本人资格及保存规则只读02§7.1。复用staff_me.employee_store_info，新增动作staff_me.update_display_name，无老板代改产品ID或新字段，仍734；长度等未列技术细节继续收口。

#### 3.0.4 已确认：“老板管理”入口

> status: confirmed
> status_scope: owner_management_entry_and_employee_management_structure
> confirmed_by: user
> confirmed_on: 2026-10-22
> owner_management_entry_parent: staff_nav.me
> owner_management_entry_name: 老板管理
> owner_management_entry_visible_role: merchant_owner
> employee_management_menu_order: [员工列表, 邀请员工]
> employee_list_actions: [停用员工, 删除员工, 恢复员工]
> staff_permission_configuration: disabled
> removed_employee_rejoin_policy: new_owner_invitation_reuse_original_staff_identity

在店员端“我的”页面增加“老板管理”入口，仅当前商户的有效老板身份（02的Merchant Owner）可见并进入，普通员工不显示；与§3.0.3七项公共菜单共存。入口的具体视觉位置和内部菜单顺序留待后续确认。

入口访问由服务端校验当前身份及商户归属；普通员工直接访问入口目标时同样拒绝。具体管理动作继续遵循各自业务权限，入口确认不授予尚未确认的配置、财务或平台管理能力。

“老板管理 → 员工管理”固定设置“员工列表”和“邀请员工”两个菜单，按上述顺序展示。员工列表内承载停用员工、删除员工、恢复员工三个动作，不将它们另列为员工管理同级菜单，也不提供“配置权限”。停用／删除立即关闭目标员工本店访问并失效已有会话；恢复适用于被停用记录并使用当前统一店员资格。

“删除员工”表示移出本店当前员工名单、终止当前有效关系，保留原员工稳定标识、历史订单、服务、业绩、工作记录及系统操作日志；不物理删除经营记录或注销平台自然人账号。被删除员工重新回本店入职（包括误删后重新加入），由老板重新邀请，经员工接受与已验证身份关联后沿用原`staff_id`，保留历史任职／删除事件并建立本轮有效关系；不复活旧邀请或旧会话。完整规则见02§6.1；订单需要改归属时老板直接在原单更改，按§3.0.4.2／3.0.10，不另建订单交接流程。其他待办一律归门店，谁实际处理就记谁，不做领取、转交或个人派单。

老板管理中的“门店资料”“营业与预约设置”“服务项目管理”分别见§3.0.6／3.0.7／3.0.8。系统操作日志的门店查看入口为“老板管理 → 操作日志”，三列倒序列表／前后信息详情／只读按§3.0.4.1已确认，平台管理员仍从平台管理查看；与其他老板菜单相对排序和其他未列技术细节继续收口。优惠券管理入口及五项见§3.0.15，仅老板维护模板；“创建邀请码”入口及五项见§3.0.17.1，仅老板创建，结果页可复制／分享，内部菜单相对排序未定；其他门店配置菜单仍为候选，已确认的员工管理、门店资料、营业与预约设置及服务项目管理边界不因此回退。

##### 3.0.4.1 老板查看操作日志三项

> status: confirmed
> status_scope: owner_system_audit_log_entry_list_and_readonly_detail_only
> owner_audit_log_entry: 我的/老板管理/操作日志
> owner_audit_log_readers: [merchant_owner]
> owner_audit_log_list_columns: [时间, 操作人, 操作内容]
> owner_audit_log_sort: audit_created_at_desc
> owner_audit_log_detail_content: authorized_before_and_after_state
> owner_audit_log_mutations: excluded
> owner_audit_log_data_recovery: excluded
> employee_work_records: staff_self_only_owner_store_default

1. **入口**：本店有效老板在小程序“我的 → 老板管理 → 操作日志”查看本店日志。普通员工没有该入口，即使本人是操作者，也不能通过旧链接、详情ID或直接请求读取系统操作日志；平台管理员继续从原平台管理按职责查看，不借此新增店员端平台管理入口。
2. **列表与详情**：列表按F-AUD-010实际审计事件时间倒序显示时间、操作人、操作内容。操作人沿002／003真实类型及稳定身份展示，系统事件如实标系统，员工停用／移出不改原操作人，不用业绩归属或当前接手人冒充。操作内容沿004动作及005／006原对象表达，时间不拿交易发生日或开单日替代。点击对应001日志查看007／008修改前后信息，只提取当前老板对本店原业务有权查看的字段；不直接倾倒原始快照或从日志开放无权证据正文／未脱敏原件／附件。相关材料与媒体仍按原独立权限校验，未知或读取失败不假填0、空白成功或“无修改”。
3. **只读**：查看页面不允许修改、删除日志或用于恢复数据；原业务成功后新增审计及自动留痕照常，不能因页面只读停止记录。不提供撤销日志、回滚快照或恢复原值按钮，查询也不产生业务变更。需要纠错仍回原业务按各自已确认规则处理，不因看见旧值绕过原状态、原因、权限或版本校验。员工“我的工作记录”按§3.0.3.2仅看本人，老板默认看本店全店；不将系统审计详情混入工作记录。

本节确认最简入口、三列倒序与只读详情，不新增日志导出／表格入口、复杂检索或恢复流程；小程序表格导入导出仍按§3.0.10.2排除。菜单相对排序、分页加载及其他未列技术契约后续收口，不任意设保存期限或清理历史，不从本节推定平台日志界面已完成。复用F-AUD-001～011及原身份租户字段，仍734，原号逻辑名类型状态不改；登记staff_owner.system_audit_logs与staff_owner.system_audit_log_detail，其他业务产品ID不改。本次仅同步需求，未测试实际日志查询／字段权限。

##### 3.0.4.2 老板查看全部本店订单，直接更改归属

> status: confirmed
> status_scope: owner_store_order_visibility_and_direct_existing_attribution_action_only
> owner_order_visibility: all_orders_in_current_store
> owner_order_attribution_entry: existing_order_management_and_original_order_detail
> owner_order_attribution_field: order_performance_staff_id
> owner_order_attribution_change_reason_required: false
> owner_order_attribution_change_audit: required
> order_handover_application: excluded
> order_handover_confirmation: excluded
> order_handover_assignment_workflow: excluded
> inactive_staff_order_attribution_auto_transfer: false
> historical_operator_identity: retained

老板有权查看本店全部订单，不以本人开单／当前业绩归属限制订单管理范围；仍校验真实老板身份、本Merchant／Store及原业务字段权限，不开放他店或无权原件材料。“后台更改”沿已有老板订单管理及原订单详情的操作，不新增交接后台／菜单，不从本条新增“仅Web能改”限制；原已确认手机业务资格保持，Web界面技术细节仍在对应阶段收口。

门店消费订单需要更改归属时，老板直接沿原F-ORD-038 order_performance_staff_id及§3.0.10原动作处理，变更原因选填，保留旧／新归属、实际修改人及服务端时间。收款／免单后仍可只更改业绩归属，不重开订单或解锁金额，不增加交接申请、确认、员工接受、派单或审批流程。员工停用或移出后订单不自动归老板；历史缺少归属的订单统一算本店老板，历史实际操作者不被新归属覆盖。

目标人员、员工只转当前本人归属／老板可改本店全部、老板历史纠错可选历史身份例外、失效员工访问关闭、原因及版本防重，均沿原§3.0.10，不因本条放宽或取消员工已有合法权限。合法更正后整单已发生及后续实际收退款的业绩归属按原规则归集，真实交易日期、经办人、金额资金库存和服务记录不变；不是将所有历史改写为接手员工操作。

本条只收口订单归属处理方式，不新增“交接负责人”字段或第二套订单／派单台账，不给预约、消费争议、食品提醒、充值等其他对象强加消费订单的业绩归属；其余待办仍按各自本店归属、访问及未决细节执行。复用原725字段、订单动作及产品ID，未新增交接菜单；原统计口径和系统日志只读规则保持。本次仅同步需求，不宣称订单权限／归属更正已功能实测。

##### 3.0.4.3 员工入职邀请：12小时有效，不提供撤销

> status: confirmed
> status_scope: staff_invitation_validity_single_use_no_revocation_and_join_confirmation_display_name
> confirmed_by: user
> confirmed_on: 2026-11-05
> canonical_rule_source: 02_section_6_0
> staff_invitation_validity_hours: 12
> staff_invitation_owner_revocation: excluded
> staff_invitation_successful_join_limit: 1
> staff_join_page_content: [门店名称, 门店地址, 本人认证手机号, 员工称呼]
> staff_join_confirmation: explicit_user_action
> staff_display_name_required: true

老板从原“员工管理 → 邀请员工”创建入职二维码／链接，自服务端成功创建起连续12小时有效；扫码、分享、登录或重试不重置截止，恰好到期拒绝确认加入。老板不设撤销按钮或撤销接口，不经删除／重建等方式提前失效，未使用邀请只能按原截止自动过期。到期不移出已成功加入员工，也不删除原邀请／使用历史；旧已撤销记录如有只读保留、不能再用，不作为新建流程。完整资格、时点及字段规则只读02§6.0～6.0.1。每份邀请只供一名员工成功加入，成功后不能再给其他人入职；并发及重试按原邀请统一防重，不影响原12小时未使用到期规则。

仍按02／03g完成登录认证、明确加入、有效门店及不跨店任职等校验；返聘仍新邀请并沿原身份／历史。复用staff_owner.invite_employee及原F-STAFF-005～010、CORE013创建时间与CORE010防重，不增加撤销产品ID或到期通知；不修改顾客活动邀请码72小时／一次规则或佐证邀请撤回。加入确认页与员工称呼另按下述本轮已确认范围，其他未明确细节不据此整体通过。

员工确认页按02§6.0.1：显示当前门店名称、地址及本人认证手机号，填写必填员工称呼（默认实际可用微信昵称，可修改；无昵称手填），点击“确认加入”才建立有效任职，扫码／认证不自动入职。从邀请目标登录后保留原目标、返回本页，重验原12小时截止及当前资格。已在本店提示已加入不重复消耗，停用／他店任职仍按原规则拒绝，移出返聘需新邀请。

F-STAFF-015 staff_display_name仅为当前员工称呼，员工列表／订单／工作记录／业绩展示沿此字段；仍以CORE005 staff_id及稳定User识别，允许同名，不用昵称匹配身份。返聘优先原称呼、沿原身份历史，历史人员快照和实际经办不回写；失败不标成功，不补造昵称或新员工。注册staff_invitation.join_confirmation及staff_invitation.accept，不新增老板审批／撤销；入职后本人修改入口／权限按§3.0.3.5已定；昵称来源映射及长度等其余细节先收口，旧数据不猜迁移。字段累计734，旧728永久号／逻辑名／类型标记及验收ID保留。

##### 3.0.4.4 老板当前员工列表

> status: confirmed
> status_scope: owner_current_employee_list_columns_scope_and_no_name_edit
> confirmed_by: user
> confirmed_on: 2026-11-05
> canonical_rule_source: 02_section_7_1
> employee_list_reader: current_store_merchant_owner
> employee_list_columns: [员工称呼, 手机号, 员工状态]
> employee_list_staff_statuses: [active, disabled]
> removed_staff_in_current_list: excluded
> owner_edit_other_staff_display_name: forbidden

原员工列表仅本店有效老板查看，三列员工称呼／手机号／状态（在职、停用）；字段来源及服务端范围按02§7.1。移出员工不列入当前名单，旧订单、业绩、工作记录及原任职历史保留，不新建“已移出”员工列表菜单或删除历史。原停用／删除／恢复三个操作及返聘新邀请规则保持；不增加代改称呼按钮或动作，老板全店订单管理权不扩大为改员工资料。

称呼只由本人从§3.0.3.5入口修改，原因非必填、系统自动留痕；仅统一当前称呼展示，不反写历史快照或业绩归属。复用staff_owner.employee_list、STAFF015／004及关联User的AUTH001，不另造人员手机号或状态副本；普通员工／跨店及旧请求均不能读全店名单，无真实来源不猜填手机号。未列排序、分页及其他技术契约继续后续收口，本轮不改原角色边界。

#### 3.0.5 已确认：统一员工权限与记录可见性

> status: confirmed
> status_scope: uniform_staff_business_access_and_record_read_boundaries
> confirmed_by: user
> confirmed_on: 2026-10-22
> staff_business_access_policy: uniform_default
> work_record_readers: [active_store_staff, merchant_owner, platform_super_admin]
> work_record_staff_scope: actual_self_work_facts_only
> work_record_owner_default_scope: all_current_store_work_facts
> performance_self_view: enabled
> commission_feature_status: retired
> commission_implementation_policy: forbidden
> system_audit_readers: [merchant_owner, platform_super_admin]

有效在职员工统一默认具有本店全部已确认店员业务权限，取消逐员工配置。老板管理仅本店老板可用；平台管理仅Platform Super Admin可用。统一资格不改变明确禁止的店员维护品牌等动作，不开放尚未确认的业务流程或绕过金额、状态、审批、租户隔离校验，权威规则见02§4。

“工作记录”是接宠、洗美、商品处理等真实经办／服务事实，普通有效员工仅看本人，老板默认看本店全店，见§3.0.3.2；“系统操作日志”是调价、退款、删除员工等审计明细，只向本店老板和平台管理员开放。记录工作事实的操作人可展示，但不能把完整原始审计混入工作记录接口。

“我的业绩”正常保留，本店老板及平台管理员按职责查看员工业绩，每笔消费订单必须明确业绩归属，与实际经办事实分开，经营统计和老板汇总／员工本人核对按§3.0.10已确认；一单一人、默认／改选、客户端商品必选和员工金额／原归属退款按该节已定；归属更正及失效员工订单接续按该节已定，其余未列细则按待决范围收口。工作记录、业务详情、统计、导出及媒体等所有取数路径须执行相同的角色／字段边界；员工停用或移出后不再具有本店读取资格。

提成功能已取消，店员端、老板管理及平台管理均不提供提成配置、计算、结算、明细、报表或导出；该退役规则不取消业绩查看，也不得借“业绩”名称重新实现提成。

#### 3.0.6 门店资料：四项内容与修改审核

> status: mixed
> confirmed_scope: four_profile_fields_review_activation_withdrawal_single_pending_request_wait_upload_rules_and_license_non_public_rule
> pending_scope: platform_review_page_details
> blocked_by: []
> confirmed_by: user
> confirmed_on: 2026-10-22
> store_profile_entry: 老板管理/门店资料
> store_profile_fields: [门店门头, 门店名称, 门店地址, 门店营业执照]
> store_profile_change_activation: after_platform_approval
> store_profile_max_pending_requests_per_store: 1
> store_profile_pending_edit_policy: withdraw_then_new_submission
> store_profile_withdraw_approval_conflict_policy: first_successful_server_transition_wins
> store_profile_post_activation_wait_hours: 168
> store_profile_wait_start_field: store_profile_activated_at
> store_profile_wait_enforcement_point: submission
> store_profile_wait_calculation_status: confirmed
> store_business_license_customer_visibility: not_public
> store_business_license_readers: [merchant_owner, platform_super_admin]
> store_profile_image_formats: [jpg, jpeg, png]
> store_front_photo_count: 1
> store_front_photo_aspect_ratio: "1:1"
> store_front_photo_max_bytes: 3145728
> store_business_license_image_count: 1
> store_business_license_image_max_bytes: 10485760
> store_profile_upload_sources: [camera, album]

“我的 → 老板管理 → 门店资料”包含门店门头照片、门店名称、门店地址、门店营业执照四项。老板可查看本店当前有效资料，点击“修改”进入编辑，提交修改申请后由Platform Super Admin在平台Web后台审核；老板与普通员工均不能自行批准。

修改流程：当前有效资料 → 老板修改并提交 → 后台待审核 → 审核通过并生效 → 相关展示界面读取新资料。点击“修改”只是打开编辑，不表示已提交或已通过。

- 保存本次提交的完整四项资料快照及所基于的有效版本；未改变的项沿用原值，审核员审核的是确定快照。已提交内容不得在审核员不知情时改写。
- 审核中继续展示原有效资料，不能先覆盖门店名称、地址或门头，再等待后台补审；老板可在管理页区分“当前有效资料”和“本次待审修改”。
- 后台审核通过后，服务端将整份已审核快照与对应有效版本一起生效；不能只改部分字段、先通知通过再发布，或将未审核的新编辑内容混入。拒绝时原资料继续有效，管理页显示结果与原因，老板可按下述等待期规则修改后重新提交审核。
- 客户端、店员端和Web中使用门店资料的现行展示位置均按各自字段可见范围读取当前有效版本；生效后刷新相关视图／缓存，不因四项一起生效而公开营业执照。历史订单、服务、投诉及审计中的原事实、快照和Store归属不随名称／地址修改而被覆盖。
- 每次修改、审核和生效均关联同一Store并保留提交人、审核人、时间、前后版本及结果。重复提交／批准不得重复生效；基线版本已变化的旧审核结果不能覆盖新的有效版本，须重新核对并审核。
- 本节限定“已创建门店的资料修改”需要审核；02§5原有老板自助注册并创建门店的规则继续执行，不据本次要求增加首次注册人工批准、停店或账号审批。
- 门店门头照片不自动替代客户端品牌Banner、门店头像或广告素材；本次只确认资料项，不改变已有页面广告位规则。

修改申请与撤回规则已确认：

1. 同一Store同时最多只有一份待审核申请；服务端原子校验，重复点击或并发请求不能创建第二份待审申请。历史申请不因该限制被删除。
2. 待审核时不得直接改写已提交快照；本店老板可撤回申请，修改后重新提交为新的申请及审核项，不能恢复或覆盖原申请。重新提交仍须符合单份待审及审核通过后的等待期规则。
3. 撤回成功后旧申请为`withdrawn`，后台不能再批准或激活该申请；保留原提交快照、撤回人、时间和操作历史。撤回不改变当前有效资料。
4. 已审核通过并生效的申请不能撤回，后续修改必须重新申请；从上次审核通过并生效的服务端时间起，满连续168小时后才允许再次提交修改申请，不按自然日或第7天零点提前放行。拒绝或撤回本身不新起等待期，也不能解除既有等待期；不能借撤回／重提绕过限制。
5. 撤回与批准同时发生时，以服务端先成功完成的状态转换为准，不以前端点击顺序、网络请求到达或管理员打开审核页的时间为准。撤回先成功则批准失败；批准并生效先成功则撤回失败。状态校验、版本校验及批准生效须保证原子性，不允许两边都成功。
6. 操作后明确显示真实结果：撤回成功、已撤回不能批准、已通过并生效不能撤回，或状态变化后需要刷新；失败不能显示成功。重试返回已有结果，不重复撤回、批准、生效或创建申请。

再次提交的时间校验已确认：

- 起点唯一使用本Store上次已审核通过且成功生效的`store_profile_activated_at`（F-STORE-009），不使用提交时间、审核页操作时间、通知时间或前端缓存时间。
- `store_profile_next_submission_at`（F-STORE-011）由服务端根据该起点加连续168小时计算；服务端当前时间小于该时间则拒绝新提交，等于或大于才满足时间条件，同时仍须满足本店老板身份、单份待审、有效基线版本等原有条件。提交入口和直接API调用执行同一校验，不只依赖按钮置灰或客户端倒计时。
- 页面可以展示服务端给出的可再次提交时间；按Asia/Shanghai显示，但不得截断到日期零点。该等待期限制的是提交申请，不额外禁止查看资料或准备编辑，也不允许改写仍处于待审的快照，不据此新增自动保存草稿功能。
- 每次新的修改申请审核通过并生效后，均以上次最新生效时间重新计算168小时。首次自助注册的初始资料不冒充一次修改审核通过；没有已通过并生效的修改历史时，不凭注册时间新起本等待期。拒绝、撤回、失败和重复回调均不能重置起点。
- 新提交时以当前有效版本关联的服务端时间重新校验；旧页面、旧缓存或修改客户端时钟不能绕过等待期。168小时到期不自动提交、自动通过或自动改变展示资料。

营业执照不向顾客公开，仅供本店老板资料管理及Platform Super Admin平台审核使用，普通员工不开放读取。顾客页面及接口不得展示或返回营业执照原件、脱敏副本、缩略图或可访问材料的引用／链接；媒体访问同样由服务端校验身份与门店范围，不能只在前端隐藏。审核通过不改变该可见范围。

图片上传规则已确认，仅适用于本节门店资料，不覆盖其他模块的图片／广告素材要求：

- 门头照片1张，最终提交图片固定正方形（像素宽高相等、比例1:1），不超过3MB，能清楚辨认门店及招牌。不要求某个未经确认的固定像素尺寸；不能把仅在页面用正方形容器裁切显示当作上传文件已符合比例。非正方形照片须由老板确认1:1裁剪后再提交，不直接拉伸变形。
- 营业执照1张，不超过10MB；证照内容须完整、清晰，不裁掉内容。营业执照不套用门头的正方形比例或裁剪要求，也不套用3MB上限。
- 两项均支持JPG／JPEG／PNG，支持拍照或从相册选择，提交前可预览、替换。门头裁剪不得裁掉识别门店所必需的招牌内容；执照内容不完整或无法辨认时由后台拒绝并注明原因，不据此新增强制OCR或自动批准。
- 本模块文件大小统一按1MB＝1024×1024字节计量：门头上限3,145,728字节，营业执照上限10,485,760字节；按实际上传并提交审核的文件校验，等于上限允许，超过上限拒绝。前端提示与服务端使用同一计量和上限。
- 前端预校验，服务端再次校验数量、文件实际类型／可解码性、实际字节数，以及门头的实际像素宽高；不能只相信文件扩展名、前端宽高或请求中的文件大小。媒体上传、引用及读取须校验本店身份和归属，不能将其他门店的材料混入申请。
- 上传中、失败或校验未通过的新图片不能作为有效提交材料；明确提示原因并允许重试。新图成功上传前不丢弃原资料／有效引用，不能把预览成功当作上传成功或审核通过。任一拟替换图片尚未成功上传并校验时，不提交该份不完整申请；未修改图片沿用原有效引用，不强迫老板每次重传两张。
- 上传／替换成功仅为编辑材料准备完成，不直接改写当前有效资料或待审快照；仍须按本节提交、撤回、审核和生效规则处理。失败重试不重复创建审核申请，不改变168小时等待期，也不放宽营业执照访问范围。

待确认：阶段05的平台Web具体审核页面。平台处理申请的审核等待时长不设未经确认的默认值，不与上述生效后168小时的再次提交等待期混用。已确认的资料字段、提交、撤回、审核、生效、等待期、上传规则和字段可见范围继续有效。

#### 3.0.7 已确认：营业与预约设置仅两项

> status: confirmed
> status_scope: two_item_business_settings_and_manual_booking_boundary
> confirmed_by: user
> confirmed_on: 2026-10-22
> business_settings_entry: 老板管理/营业与预约设置
> business_settings_menu_order: [营业时间, 临时关闭]
> business_settings_editor_role: merchant_owner
> business_settings_activation: after_successful_server_save
> business_settings_platform_review: not_required
> business_settings_profile_wait: not_applicable
> booking_model: manual_store_confirmation
> fixed_booking_interval: retired
> hard_slot_capacity: retired

面向社区小店，日常可由老板加一名店员处理；这是简化设计依据，不是只允许两名员工的系统限制。老板管理中的“营业与预约设置”仅有“营业时间”和“临时关闭”两项，不设置预约间隔、时段名额、个人排班，也不把取消的参数藏到Web或以默认值继续执行。

- 营业时间：设置门店营业日期及时间范围；不据此生成固定预约间隔网格。临时关闭：在指定日期关闭某段时间、半天或全天，服务端以明确时间范围保存，不擅自定义统一的“上午／下午”分界或默认营业时间。
- 仅本店有效老板可修改两项配置；普通店员可按业务需要读取当前有效营业信息、处理预约，但不能修改该配置。服务端校验身份及Store归属，不能只隐藏入口。
- 合法配置经服务端成功保存后生效，保留操作者、前后版本、时间及变更内容；不走门店门头／名称／地址／执照的审核申请，不套用§3.0.6的168小时等待期。客户端、店员端和Web读取同一有效配置。
- 顾客在营业范围内提出期望到店日期时间，由门店结合实际忙闲人工确认、提出新时间或拒绝。取消固定预约间隔、时段名额限制及其占用／释放机制，不取消真实确认、6小时修改截止、多宠批次一致性、原预约保护和幂等；完整跨端规则及验收以03a§11为准。
- 临时关闭或营业时间变化只改变后续申请／确认的时间资格，不自动取消已经确认的预约。受影响记录进入门店处理清单并逐笔通知；门店应明确处理原承诺，不静默改时间。新提交与营业设置变更的竞态按03a§11.5校验配置／预约版本。
- 寄养建议容量提示继续按03a§7，不在本菜单增加第三项。平台停用门店、在住寄养照护、正在进行的洗美服务不能因“临时关闭预约”被自动终止。

#### 3.0.8 已确认：四类项目管理及表单／启停规则

> status: confirmed
> status_scope: catalog_categories_service_form_lifecycle_and_existing_booking_exception_only
> confirmed_by: user
> confirmed_on: 2026-10-22
> service_item_management_entry: 老板管理/服务项目管理
> service_item_management_editor_role: merchant_owner
> service_item_management_actions: [新增, 修改, 停用, 恢复]
> business_item_category_order: [洗护, 美容, 护理, 商品]
> service_item_form_fields: [项目名称, 所属大类, 参考价, 服务说明]
> service_item_name_max_chars: 30
> service_item_description_max_chars: 300
> service_item_reference_price_required: true
> service_item_reference_price_zero_allowed: false
> service_item_reference_price_decimal_places: 2
> service_item_same_name_policy: warn_not_block
> service_item_new_enabled: true
> service_item_activation: after_successful_server_save
> service_item_platform_review: not_required
> service_item_profile_wait: not_applicable
> care_customer_booking: disabled
> product_catalog_integration: select_existing_product_and_sku
> service_item_labor_calculation: excluded
> service_item_employee_scheduling: excluded
> service_item_complex_package_configuration: excluded

本入口的大类固定为洗护、美容、护理、商品四项，不增加多级服务分类。前三类共用服务项目主资料及四项表单；护理仅供门店临时开单／会员开单，暂不开放客户端预约，独立护理按§4.5轻量流程、不进入洗美主导航或新增AI报告。同宠洗美中的护理加项按§4.5复用原单和进度，不能降低洗美检查要求。原寄养仍在独立业务中办理，不因四类列表中没有寄养而被删除，也不擅自加入本列表。

“商品”类别只选择／关联本店已有商品及SKU，商品名称、售价、介绍、规格和库存仍以03e唯一主资料为准；不在此新建商品，不复制成service_item，不把服务表单当作最简商品建档或绕过库存。不对已有关联商品强制重填／截断服务表单四项；商品维护权限和字段继续按原模块。

前三类服务项目表单规则：

| 字段 | 规则 |
|---|---|
| 项目名称 | 必填，去首尾空白后1～30字；纯空白不算名称。 |
| 所属大类 | 必选洗护／美容／护理；商品分支改为选择已有商品／SKU，不新建服务项目。 |
| 参考价 | 必填、大于0、最多两位小数；不以0元表示价格待定，不等于最终成交价。 |
| 服务说明 | 选填，最多300字；不强制上传项目图片。 |

字数按Unicode字符（码点）计数而不是文件字节，前后端统一。金额以服务端精确金额类型校验，非法数字／超两位小数拒绝，不静默四舍五入。同一大类、去首尾空白后同名时提醒老板但不禁止，始终以稳定ID区分，不自动合并同名项目。

- 仅本店有效老板可新增、修改、停用、恢复服务项目，普通员工只选择项目并办理业务；服务端校验角色、merchant_id和store_id。新增成功默认启用，修改保存后生效，不需要平台审核或168小时等待。修改已停用项目仍保持停用，只有明确恢复动作才重新启用；恢复沿用原service_item_id和历史，不新建同名替代项。商品关联不自动修改SKU售价、库存或上下架状态。
- 预约和开单读取同一服务项目。停用后不能用于全新预约、直接新开单或旧预约中新加的服务／宠物；服务器复核状态与版本，不能只隐藏列表或依赖旧缓存。商品分支继续走真实商品／SKU可售及库存校验。
- 停用前已经提交且尚未终结的待确认／已确认预约，可按原项目、原宠物继续人工确认及转开单；原提交快照及ID是豁免依据。该例外不复活已取消／超时预约，不允许复制预约或新增停用项目／宠物，不豁免营业关闭、6小时修改截止、双方确认及多宠一致性。项目恢复或改名不回写原预约事实。
- 新申请与停用并发时按服务端成功状态／版本判断：停用先成功则拒绝全新选择；申请先成功则保存原快照、纳入旧预约例外。确认及转开单须关联原有效预约及原服务项，不能仅凭同名或客户端声明是旧预约而放行。
- 修改／停用／恢复不物理删除项目，不删除或无痕覆盖旧订单、服务、预约。管理动作保留操作者、时间、项目版本及前后状态；重试不重复创建项目／恢复关系或写入业务结果，失败不显示成功。
- 不加入工时核算、员工排班或复杂服务套餐配置，不恢复固定预约间隔／硬名额；实际服务时间／时长保留；会员充值按§3.0.11逐次填写及选择赠送，不设充值套餐。护理12项流程按§4.5执行，未登记技术细节不得由实现自行补成新业务授权。

#### 3.0.9 已确认：全部到店订单调价与零元免单

> status: confirmed
> status_scope: onsite_consumption_order_price_adjustment_and_waiver_only
> confirmed_by: user
> confirmed_on: 2026-10-22
> onsite_adjustment_scope: all_onsite_consumption_orders
> onsite_adjustment_roles: [merchant_owner, active_store_staff]
> onsite_adjustment_input: final_receivable_amount
> onsite_adjustment_business_limit: none
> onsite_adjustment_owner_approval: not_required
> onsite_adjustment_reason_options: [实际护理情况, 到店优惠, 录入更正, 其他]
> onsite_waiver_enabled: true
> onsite_waiver_action: 确认免单
> onsite_waiver_payment_status: waived

适用于所有到店消费订单，包括洗护、美容、护理、商品及原门店寄养消费结算，不受订单最初来源渠道影响；不因此开放充值免单、余额任意调整、积分兑换免费或退款／冲正权限。

- 本店老板及有效在职员工可在结算完成前修改本单最终应收总额，不设业务金额／比例上限，不要求老板逐单审批。先只做整单最终应收输入及系统计算差额，不新增逐项调价分摊算法。仍须服务端鉴权、有效非负金额／最多两位小数、状态及金额版本校验，不能用“不限额”绕过这些校验。
- 原价、优惠、调价差额、最终应收分别保存，不改全店项目参考价、SKU售价或其他订单。保存前展示修改前／后金额并明确确认；调价原因选填，只有最终应收改为0并确认免单时免单原因必填。系统自动记录操作人、服务端时间及修改前后金额，重试不重复加差额。
- 最终应收为0时必须明确执行“确认免单”，仅输入0或显示0不等于已结算。老板和有效员工均可办理，原因／操作人／时间保留；最终应收、实收、收入均为0，payment_status=waived，不伪造现金／微信等付款记录、不扣会员余额。非零应收不能执行免单，已经实际收款的订单不能直接改成免单。
- 免单成功与真实收款成功同样锁定本单金额，收款／免单／调价等并发只允许一个合法金额版本转换成功。免单不取消订单，不自动完成护理／洗美、交付或投喂；商品订单仍在03e既有成交节点一次正式出库，收入为0。
- 金额、库存、券、通知与顾客展示按03d§1.1／10.1／12及03e；挂单原因选填、最多两种支付及无需老板审批的消费退款按§4.4。财务只作线下交易记账，不接外部通道；部分退款按03c§5.1。除§4.5同宠洗美护理加项外禁止跨业务混结；结算后金额锁定，有错只走补收或退款。

#### 3.0.10 经营统计与员工业绩

1. 老板默认查看本店消费实收、消费退款、净消费和各员工业绩；员工只看本人。金额只按真实已记账收退款统计，业绩＝实际消费实收－已确认退款，充值单列，免单和未收款不增加业绩。
2. 每笔消费订单只归属一名本店员工。员工开单默认本人；客户端商品需求由门店确认时必选归属人。员工只能把当前归属自己的订单改给本店其他有效员工，老板可改本店全部订单；原因选填，系统自动留前后归属、人和时间。
3. 员工停用／移出不自动转移原订单。历史订单已有归属时继续保留；缺少归属的历史订单统一回填本店老板的稳定员工身份并记录系统回填审计。退款扣回原订单当前有效归属人的业绩，不归退款经办人。
4. “我的业绩”列表包含已收款、未收款和免单，显示日期、订单号、顾客、业务项目、应收、实收；支持手机号、日期、业务类型筛选，按订单生成时间倒序。老板可按员工汇总，员工只查本人。
5. “我的工作记录”员工只看本人，老板默认看全店；显示时间、员工、项目、实际已收款。操作日志仅老板和平台管理员查看，本店普通员工不读取原始审计。
6. 本期不做日结、交接班、现金盘点或独立对账。老板直接使用经营统计和原交易明细核对。
7. 门店日常经营和老板设置全部在小程序；Web后台只给平台使用。V1不提供门店表格导入导出或批量导入。
#### 3.0.11 充值金额、可选赠送与必填备注

> status: mixed
> status_scope: manual_store_recharge_and_gift_selection
> confirmed_scope: no_package_manual_principal_optional_bonus_coupons_and_conditional_required_note
> pending_scope: platform_exception_details_and_remaining_transaction_time_contracts
> confirmed_by: user
> confirmed_on: 2026-11-03
> recharge_package_feature_status: retired
> recharge_entry_mode: manual_per_transaction
> recharge_optional_gifts: [bonus_balance, coupon_items]
> recharge_gift_note_required: when_bonus_amount_positive_or_coupon_items_nonempty
> recharge_note_field: wallet_note
> recharge_grants: after_successful_recharge_confirmation

本店老板／有效员工按原充值业务资格为选定本店顾客办理：填写本次实际充值本金，按需填写赠送余额、选择本商户已有优惠券及数量。**不设充值套餐**，老板管理不提供套餐配置／启停／恢复，充值时不选套餐、也不受套餐固定金额约束；已有优惠券模板管理权限不变，不将本次选券扩成店员维护模板。

**只要有赠送余额或赠券，备注必填**；只赠券同样需要，去空白后无内容拒绝提交；无任何赠送时备注选填。复用F-WAL-017 wallet_note保存本次真实说明，不用退役的套餐备注、默认文字或其他业务原因字段代替。本金020、赠送021、到账022、所选赠券023分别保存，本次本金＋赠送余额自动算到账，券不折现金计入到账或充值实收；例如300本金赠30只实收300、余额增加330。仅赠券时余额不额外增加，仍按本次选择发券及记备注。

确认真实线下收款并成功记账后，按本次内容更新本金／赠送余额、流水及所选优惠券，一次成功请求不重复入账发券，失败不报到账；本店商户／顾客／操作者、金额与所选券、备注条件由服务端校验。原历史充值、赠送及已发券保留，不因套餐取消无痕更改。客户端仍无充值入口，只按原规则查看资产和真实明细。

F-WAL-018／019／024～027仅套餐专属字段退役保留注册号，020～023沿用为单次充值内容，不新增同义字段。充值统计沿真实本次实收、本金及赠送分开；交易标识／实际发生日期的技术映射仍须先登记，不把配置或到账总额当实收。本节不批准无痕冲正或任意改余额；充值退还只按§3.0.14从原充值发起充值退款。消费扣款先本金后赠送、消费退款原路退回，详见03c§2～5。

#### 3.0.12 充值记录查询

> status: mixed
> status_scope: staff_recharge_record_query
> confirmed_scope: customer_and_store_entries_six_columns_mobile_date_query_document_created_at_desc_and_readonly_record_details
> pending_scope: platform_exception_details_and_remaining_transaction_contracts
> confirmed_by: user
> confirmed_on: 2026-11-03
> recharge_record_customer_entry: 顾客详情/充值记录
> recharge_record_store_entry: 业务/订单与收银/充值记录
> recharge_record_columns: [日期, 顾客, 实收金额, 赠送余额, 赠送优惠券, 经办人]
> recharge_record_filters: [顾客手机号, 日期]
> recharge_record_default_date: 今天
> recharge_record_date_options: [今天, 昨天, 本月, 自定义日期]
> recharge_record_sort: recharge_document_created_at_desc
> recharge_record_document_date_mapping: recharge_record_created_at
> recharge_record_date_column_basis: recharge_record_created_at
> recharge_record_date_filter_basis: recharge_record_created_at
> recharge_record_direct_overwrite: forbidden

1. **两个入口**：顾客详情查看该顾客充值记录，“业务 → 订单与收银 → 充值记录”查看当前门店的原充值记录。两入口复用同一原充值业务及流水，顾客入口固定当前本店顾客，不复制充值单／资产或把充值建成消费订单；老板及有效员工沿当前本店顾客／钱包记录原有读取权限查询，不能凭新增入口查看其他商户资产、他人员工业绩或原始系统日志。
2. **六列内容**：日期、顾客、实收金额、赠送余额、赠送优惠券、经办人。实收沿F-WAL-020实际本金，不把021赠送或022含赠送到账额加作实收；赠送余额沿021、赠券及数量沿023、真实经办沿015，不用消费订单业绩归属或后来查询人替换经办。金额尚不可读／查询失败如实提示，不用0假报成功；无赠送按原真实0／无券展示，不凭列表写入或补发赠送。
3. **查询筛选**：支持本店顾客手机号及日期组合查询，默认今天，可选昨天、本月、自定义日期，沿F-CORE-009业务时区Asia/Shanghai；所选起点含当日00:00、终点用末日次日00:00不含，不套洗美历史15天，也不触发跨店共享查询或新增顾客核验。
4. **日期及排序**：用户已明确“订单日期”为充值单据生成日期。日期列、日期筛选和排序统一取原充值记录的F-CORE-013 created_at，按完整生成时间从新到旧；日期查询边界按前项业务时区。昨天真实收款、今天补录生成单据的记录显示今天的单据日期、在今天的查询范围内并按今天生成时间排序，不回填昨天或按实际收款时刻排序。实际收款日期及服务端录入时间仍分别保留、详情可核对；充值收入统计按真实收款发生期，例中充值实收归昨天，不能以今天单据列表合计替代今天实际收款统计。不得将消费订单created_at、套餐时间、客户端时钟或后续备注修改时间代替原充值单据生成时间，也不因补录伪造昨天已入余额。
5. **详情及历史保护**：可看本次本金、赠送余额、赠券及数量、备注、真实余额变化，关联原充值及流水记录；备注等字段仍按原对象／角色范围返回，不将内部审计当详情。已成功记账的原充值／流水锁定，不提供更正本金、赠送、赠券、撤销充值或直接修改余额；需要退还时从原充值记录发起§3.0.14充值退款。历史记录已有不完整资料如实显示，不据当前余额／模板倒算旧值；读取不产生新资产、订单、通知或重复收入。

充值与消费统计分开、赠送非实收、无套餐及赠送备注必填按§3.0.10～11／03c保持。单据生成日期与实际收款日期的业务分工已确认；这不等于真实充值交易身份／实际收款时间字段及接口已联调，剩余技术映射须先按FIELD-REGISTRY收口。

#### 3.0.13 已记账充值锁定

充值成功后原实收、赠送、赠券、实际发生时间和经办人锁定，不提供更正、撤销或直接覆盖。录错且需要退钱时，从原充值记录发起§3.0.14充值退款。

#### 3.0.14 充值退款

本店老板／有效员工从原充值记录发起全额或部分充值退款，无审批；退款原因必填。系统校验原充值未退实收和当前可扣本金，确认后扣减本金、写退款及钱包流水，原充值保留。赠送余额／赠券未使用时，完整退款一并收回；已使用权益和部分退款的精确回收公式按03c§4.3的技术待决范围处理，不得扣成负数或直接改余额。所有成功与失败均按权限、版本和幂等处理，成功后自动记录操作人、服务端时间及改前改后。
#### 3.0.15 优惠券管理与单独赠券五项

> status: confirmed
> status_scope: coupon_management_and_manual_grant_five_rules
> confirmed_by: user
> confirmed_on: 2026-11-03
> coupon_management_entry: 老板管理/优惠券管理
> coupon_template_management_role: merchant_owner
> coupon_manual_grant_entry: 顾客详情/会员资产/赠送优惠券
> coupon_manual_grant_actors: [merchant_owner, active_store_staff]
> coupon_manual_grant_reason_required: false
> coupon_manual_grant_owner_approval: not_required
> coupon_scope_options: [全部消费, 洗护, 美容, 护理, 寄养, 商品]
> coupon_template_new_default_enabled: true
> coupon_template_actions: [新增, 修改, 停用, 恢复]
> coupon_template_delete: forbidden
> coupon_template_changes_affect: future_issuance_only
> coupon_template_disabled_existing_instances: original_instance_rules_remain_effective

1. **老板管理入口**：“我的 → 老板管理 → 优惠券管理”，本店老板新增／修改本商户模板；模板沿03c§8原三类券及表单，普通员工不能通过入口或直接API维护。该权限不从独立赠券继承，平台既有按职责权限本次不变。
2. **独立赠券**：顾客详情 → 会员资产 → 赠送优惠券，本店老板／有效员工均可选已有启用模板和数量，赠送原因选填，无需审批，不要求充值、不限原经办人。数量为正整数，沿F-CPN-021；F-AUD-009保存选填原因，人员／服务端时间及前后数量自动沿原审计记录。失败不报成功、重试不重复，不伪造充值／付款或积分业务。
3. **护理范围**：适用范围新增护理，全部消费／洗护／美容／寄养／商品沿原规则保留。旧洗护／美容限定券不扩大，模板将来新增护理也不回写既有实例；不开放顾客护理预约或新增护理AI。
4. **启停与恢复**：新建模板默认启用，老板可停用／恢复，不提供删除。停用阻止后续新发放，各原发券来源按真实当前模板校验；已有券仍按发放时条件使用，不因停用变过期／失效或被撤回。恢复用原模板ID与历史，不复活已用／过期券，也不重复补发。
5. **只影响未来发放**：模板名称／优惠条件／适用范围／期限等变更仅作用于后续发券，已发实例保留发放快照。历史合法延期后的截止与记录保留，当前不再新建选券锁定／暂停延期；模板修改不能替代人工修改已发券。

03c§8／9.2为钱包详细规则，沿F-CPN-001～021及原顾客／商户／审计／F-CORE-010完成权限、状态与去重，模板或身份变化后旧页面不能继续发放／管理。记录前后值、人／时间及本次发放实例，不把模板维护当作修改已发券、撤销已用券、改余额或变更积分库存的权限；顾客持券直接减量／删除按§3.0.16已定，其他模板校验细分和剩余跨渠道技术契约仍待对应阶段，不借五项确认宣布整端已实现。

#### 3.0.16 顾客赠券数量手工减少／删除

> status: confirmed
> status_scope: direct_customer_held_gift_coupon_quantity_reduction_and_deletion
> confirmed_by: user
> confirmed_on: 2026-11-03
> coupon_delete_entry: 顾客详情/优惠券或活动券
> coupon_delete_actors: [merchant_owner, active_store_staff]
> coupon_delete_owner_approval: not_required
> coupon_delete_requires_original_grant_actor: false
> coupon_delete_separate_mistake_workflow: excluded
> coupon_delete_reason_required: false
> coupon_delete_effect: remove_selected_held_coupon_instances_and_recalculate_available_count
> coupon_delete_status: removed
> coupon_delete_history: preserve_grant_and_operation_history
> coupon_delete_used_coupon_exception: platform_super_admin_only

顾客详情的优惠券／活动券只提供查看未使用、已使用、已过期和删除未使用券；不再脱离订单直接核销。结算时选择可用券，由服务端自动校验并在结算成功后核销、绑定原单。老板和有效员工仍可直接减少未使用且未锁定的赠券数量或删除具体券，不另设误发审批；删除原因选填，系统自动记录实际经办、服务端时间、被删实例及前后数量。

- **操作对象**：明确当前本店／顾客的具体F-CPN-002持有实例，减少至0即移除本次可操作赠券；F-WAL-005可用券数量按真实剩余实例派生，不只改显示数字。删除数量由被删实例数计算，不复用发券数量021为剩余持券数，不新增第二套券库存；增加赠券仍走原发放资格。
- **原状态保护**：只能删除未使用且未锁定的持有赠券；结算锁定、自动核销、取消解锁和并发校验均以服务端当前状态为准。已使用券不能删除或重复核销；不得通过删除改已发生消费或解除原订单状态。
- **删除与留痕**：界面叫删除，沿013记removed并退出可用列表，原模板／来源／发放及本次操作记录不物理删除；原模板无删除规则保持。客户端保留可使用／历史券两组，已删除属历史，不新增误发流程或第三组操作菜单。普通员工查看业务摘要不等于可读原始系统审计。
- **不联动其他业务**：减少赠券不自动撤销原充值／兑换、不改钱包本金／赠送余额，不退积分、不生成退款／新付款或自动补发券。删错后如需增加券，由门店按已有赠券规则手工办理，不能直接把已删除实例复活而抹掉历史。
- **校验与重复**：服务端当前门店／顾客／有效身份及券状态校验，选填原因沿原F-AUD-009，前后状态及数量、人时间与请求沿F-AUD-007～011／F-CORE-010；失败不部分删除，同次成功重试返回原结果、不再次减数量。并发结算核销／删除只按当前合法状态成功。

本节承接03c§9.2.1；原706字段／ID继续使用，013仅扩展removed状态、不改变注册号／逻辑名／类型。未列的已用券异常后台数据处理及其他内容更改仍按原待决项，不把本轮直接删除承诺扩成任意改历史交易或宣称已实际验收。

#### 3.0.17 邀请码创建与一次兑换

> status: mixed
> confirmed_scope: owner_wechat_distribution_and_no_staff_unused_invite_code_surfaces_and_owner_invite_creation_five_rules_fixed_one_generated_code_and_copy_share_result_and_single_content_coupon_or_service_or_product_activity_one_calendar_month_claimed_validity_owner_create_only_issuing_store_only_single_total_redemption_fixed_72_hours_and_checkout_coupon_validation_and_automatic_redemption
> pending_scope: activity_entitlement_contracts_and_consumption_history_redemption_record_mapping
> invite_code_create_actor: merchant_owner
> invite_code_management_actions: [create]
> invite_code_total_redemptions: 1
> invite_code_validity_hours: 72
> invite_code_validity_start: server_creation_time
> invite_code_lifecycle_controls: excluded
> invite_code_supported_redemptions: [coupon, service_activity, product_activity]
> invite_code_content_cardinality: exactly_one
> invite_code_content_quantity: 1
> invite_code_generation: server_generated_only
> invite_code_create_entry: 老板管理/创建邀请码
> invite_code_result_actions: [copy, share]
> invite_code_read_copy_share_actors: [merchant_owner]
> staff_unused_invite_code_access: excluded
> invite_code_staff_distribution_channel: owner_wechat_manual_forwarding
> invite_claimed_entitlement_initial_validity: one_calendar_month_from_successful_redemption
> invite_activity_redemption_result: pending_use_entitlement
> invite_activity_fulfillment: automatic_redemption_after_successful_checkout
> invite_activity_price_handling: configured_coupon_discount_at_checkout
> invite_activity_automatic_checkout_discount: true
> invite_activity_order_reservation: excluded
> coupon_redemption_mode: automatic_after_successful_checkout
> coupon_checkout_price_mode: configured_coupon_discount_then_optional_manual_adjustment
> coupon_auto_recommendation: optional_display_only_server_validation_required
> coupon_checkout_auto_redemption: required
> coupon_lock_and_pause_validity: active_for_checkout_concurrency
> coupon_action_entry: 订单结算页选券；顾客详情仅查看或删除未使用券
> coupon_action_order_selection: required_for_redemption_not_required_for_deletion
> coupon_mistake_redemption_undo: excluded
> coupon_return_mode: excluded
> coupon_return_on_partial_refund: excluded
> coupon_operation_history: preserve_actor_time_and_prior_records

详细规则唯一见03c§9.3。本店老板只创建邀请码，每码只含一个选定优惠券兑换项目、服务活动或商品活动，不能多个模板／活动或跨类型混装；不设启停／恢复／换码／活动调整或改已创建码。全部顾客合计成功一次，服务端创建后连续72小时可兑、恰好到期拒绝。

领取所得权益（含邀请码券）初始有效期从服务端成功领取起顺延一个日历月，按Asia/Shanghai保留时分秒、下月无同日取月末；11月4日10:00领，12月4日10:00到期，不从码创建或到店起算。码到期不提前终止已领权益；结算选券时和最终提交时均由服务端校验未过期，恰好到期拒绝。选券后进入短时锁定，结算失败、取消或锁定超时自动解锁；结算成功后自动核销。

服务／商品活动先领取待使用活动券；到店后必须在真实服务单／商品单结算页选择，由服务端按配置计算优惠并在结算成功后自动核销、关联原单。顾客详情只能查看或删除未使用且未锁定券，不提供脱离订单的手工核销。输入邀请码不会直接开待处理订单，也不写实际服务、交付、实收或免单；本期取消／退款不退券。原本店资格、成功结果与计次一致、失败无部分权益及并发重试防重保持；004／008D、007固定1、009只0或1不变。

普通券和活动券统一在结算页选择。服务端校验本店、顾客、适用项目、门槛、有效期和并发状态，按券已配置内容计入当前结算；最终提交成功后自动核销并关联原单，并发只能成功一次，同次重试恢复原成功且不改首次核销时间。失败不得改券、金额、库存或原单。最终应收为0时仍明确确认免单且免单原因必填；非免单调价原因选填。服务和商品库存继续走原业务。

所有券入口及操作按03c§11：顾客详情仅查看券状态或删除未使用且未锁定的券；核销必须在结算选券后由服务端自动完成并关联原单。锁定、核销、失败解锁、重复提交和取消／退款后的处理均使用同一券状态机，保留实例、原有效期、操作人、服务端时间和前后状态。旧手工核销记录只读追溯，不得恢复手工核销按钮。

##### 3.0.17.1 老板创建邀请码五项

> status: confirmed
> status_scope: owner_invite_creation_form_quantity_generation_and_result_only
> invite_code_create_entry: 老板管理/创建邀请码
> invite_code_create_actor: merchant_owner
> invite_code_content_quantity: 1
> invite_code_generation: server_generated_only
> invite_code_result_actions: [copy, share]

入口“我的 → 老板管理 → 创建邀请码”，仅本店有效老板，普通员工入口／直接请求均不能创建；老板可经微信将码转发员工，员工不需小程序未用码查看入口，按§3.0.17.2。兑换类型只选一项：优惠券选本店已有可发放模板；服务／商品选本店现有项目／SKU并填写简短活动说明，如洗护体验一次／美容八折，不新建重复主资料、套餐或自动优惠算法。

数量固定券1张／服务1次／商品1份，不设数量输入，不能多模板／多活动混装或请求中传其他数量。码由服务端生成，不支持手工指定／修改；成功重试返回本次原码及原创建／截止时间，不重开72小时或新建第二码。创建时不发券／开单／占扣库存。

创建成功结果页显示码、兑换内容、原F-INV-006兑换截止，支持老板复制／分享，并提示“领取后一个月有效”；未领取不显示伪造权益到期日。复制分享不计兑换次数、不延长期限、不授权员工访问老板页；顾客实际兑换仍按本店／一次／72小时及原资格。老板可直接通过微信将结果发给员工，不设置员工在小程序内查看未使用码的流程或入口，详见§3.0.17.2。

详细规则按03c§9.3.1。类型／活动说明为F-INV-013／014，服务引用原F-APPT-008、商品原F-PROD-002，F-INV-003单一模板及数量1，012备注仍选填不代活动说明。内部菜单排序、分享载体及剩余技术映射按原阶段收口；用券统一走结算选择、服务端自动校验和成功后核销。

##### 3.0.17.2 老板经微信发码，员工不设未使用邀请码查看入口

> status: confirmed
> status_scope: owner_wechat_handoff_no_staff_unused_invite_code_surfaces
> invite_code_create_actor: merchant_owner
> invite_code_read_copy_share_actors: [merchant_owner]
> staff_unused_invite_code_access: excluded
> invite_code_staff_distribution_channel: owner_wechat_manual_forwarding

这里“未使用邀请码”指尚未兑换的码，不是顾客已领取但未核销的券。

老板创建邀请码后，沿本次结果页复制／分享，再通过微信自行发给员工。员工在微信接收／转发即可，不设置小程序未使用码的列表、详情、搜索及由该入口复制分享的能力；上一轮员工通用邀请码读取分发方案取消，不留“入口待定”菜单。

员工不获得老板管理、创建修改删除码或直接接口批量读取未使用码的资格；旧入口／旧详情链接和直接请求同样受限，微信收到码不等于经营权限。系统不新增自动发微信、收码待办或确认收到操作。

同一码经微信发送不重开72小时、兑换次数或领取期限，不发券／核销／改价；顾客仍按原本店／单内容数量1／一次／期限及资格兑换。员工在顾客详情可查看或删除未使用且未锁定的优惠券／活动券，核销只在真实订单结算成功后由服务端完成；取消退款不退券。兑换历史归消费历史、不设独立菜单，不删原兑换历史，也不因此新增查询权限。

staff_invite_code.view／copy／share退役保留标识防止复活，不改造成历史查询；老板原创建／结果复制分享继续。详细规则唯一见03c§9.3.2，活动权益等剩余契约仍按原范围收口。

#### 3.0.18 商品管理六项

> status: confirmed
> status_scope: staff_product_management_six_rules_only
> product_management_entry: 业务/商品处理/商品管理
> product_management_actors: [merchant_owner, active_store_staff]
> product_spec_mode: single_only
> product_sku_count: 1
> product_required_fields: [product_name, product_category_id, sale_price, on_hand_inventory_qty]
> product_optional_fields: [product_image_refs, barcode, cost_price, product_description]

详细规则按03e§15：老板／有效员工在业务／商品处理／商品管理操作本店商品。新增名称／分类／各SKU售价／初始库存必填，图片／条码／成本／介绍选填；每商品固定一个规格及唯一SKU、一份售价库存，不支持按需增加规格；不同容量口味分别建商品。售价只影响新开单，原单不回写、结算仍手动改价。

补货／盘点直接调整账面总库存目标，保留前后值／真实人时间、计算差额，不覆盖已预占；F-PROD-026总量、009预占及008派生可售同时校验，不能用旧页面覆盖成交／预占新值。上架下架支持，有销售／库存记录不物理删除，下架不自动取消原订单或清历史。原缺货／预占／成交／退货规则保持；服务项目管理的商品分支仍只关联这里已有SKU，员工不因此获得三类服务主资料或品牌厂家维护权。

##### 3.0.18.1 商品分类与商品生命周期五项

> status: confirmed
> status_scope: product_categories_and_lifecycle_five_rules_only
> product_category_entry: 业务/商品处理/商品管理/商品分类
> product_category_actors: [merchant_owner, active_store_staff]
> product_category_operations: [create, rename, reorder, delete]
> product_category_delete_product_policy: auto_move_all_products_to_fallback_category
> product_category_fallback_name: 其他
> product_category_fallback_editable_name: false
> product_category_fallback_deletable: false
> product_restore_policy: reuse_original_product_and_sku_ids
> unused_product_delete_policy: no_business_references_no_inventory_movements_and_single_sku_stock_and_reservations_zero

按03e§15.3，本店老板／有效员工均可自定义商品分类、新增改名排序删除；删除有商品的分类时，全部商品自动移到本店固定“其他”，包括下架商品，不需先手动转移。其他以原product_category_id及029标识唯一归本Merchant，名称不改、不能删除，避免删除后无承接分类；迁移与删除一致成功、失败不留部分无分类商品，重试不重复。只改当前分类，商品SKU／价格库存／上下架和历史快照不改，不涉及服务四大类或品牌厂家维护。

下架停止新购买，原订单继续处理、库存可查可调；恢复上架老板员工都能操作，沿原product_id／sku_id，不复制库存、不重开订单。仅无任何业务引用／无库存变动且唯一SKU总量预占均0的误建商品可删除，服务项目／订单需求／邀请码活动／入库等有引用或曾入库后调0仍不能删，有销售／库存历史仍只能下架。服务端按当前任职租户、最新引用和库存／并发校验，删除／分类迁移及真实人时间留历史，不删原操作记录、不复用ID；不把下架恢复当删除恢复。复用原产品ID及字段，新027分类名称028顺序029兜底标识后734，旧722身份类型状态不变；细节和剩余数据库／旧多SKU数据映射（如有）技术边界按03e§15.3／15.6，不宣称实际功能已测。

##### 3.0.18.2 商品管理列表五项

> status: confirmed
> status_scope: staff_product_management_list_query_display_sort_and_detail_navigation_only
> staff_product_list_entry: 业务/商品处理/商品管理
> staff_product_list_actors: [merchant_owner, active_store_staff]
> staff_product_list_tabs: [enabled, disabled]
> staff_product_list_default_tab: enabled
> staff_product_list_default_date_limit: none
> staff_product_list_search: [product_name, barcode]
> staff_product_list_filters: [product_category_id]
> staff_product_list_sort: created_at_desc
> staff_product_list_created_at_scope: product
> staff_product_zero_stock_auto_unpublish: false
> staff_product_sku_display: single_product_single_sku
> staff_product_detail_inventory: [on_hand_inventory_qty, reserved_inventory_qty, available_inventory_qty]

按03e§15.4，商品管理按原020分已上架／已下架，默认已上架，查本店全部当前商品而非经办人商品，不套最近15日历史查询。库存为0不自动下架，上架不保证有货，原缺货校验保持。支持名称／条码查询、分类筛选；删除分类自动转其他后按当前有效分类查，不回写原业务历史或跨店取数。

列表显示商品名称、固定唯一规格说明（如有）、售价、可售库存和上下架状态，直接关联本商品唯一SKU，无多规格标记或展开。详情查看该唯一SKU的026总量／009预占／008可售，精确库存仅本店老板有效员工，不对客扩开放；不将进货成本当售价或总量当可售。按原商品CORE013创建时间倒序，不拿编辑、入库或SKU新增时间代替；点商品进详情，再沿原资格修改资料／调整库存／上下架，不另增列表绕行。恢复上架及误建删除按§3.0.18.1，入库错误去库存管理按§3.0.19，权限租户对象及库存版本规则保持。

复用原725字段及staff_product.management入口列表，新增query_products和product_detail产品ID，不造同义字段／平行SKU；读取失败不假0／下架，查询不改库存。旧多SKU数据映射（如有）、其他AI或计量技术仍待收口，本次文档不表示真实功能验收。

##### 3.0.18.3 库存操作保持简单

> status: confirmed
> status_scope: simple_inventory_view_edit_and_automatic_audit_only
> inventory_view_owner: staff_product.product_detail
> inventory_edit_action: staff_product.adjust_inventory
> inventory_edit_label: 修改库存
> inventory_edit_input: on_hand_inventory_qty
> inventory_audit_policy: automatic_before_after_actor_and_server_time
> inventory_movement_menu: excluded
> inventory_movement_query_page: excluded
> stock_intake_records_policy: retained

按03e§15.5：商品详情沿原SKU看总库存／预占／可售，点“修改库存”填当前正确总量后保存，原库存管理入口复用同一动作，不另造库存或录入流程。仅改026目标、不改009预占／008派生，原非负整数、目标不能低于预占、本店有效任职对象／最新状态并发防重不放宽，不增加人工登记历史／审批／原因必填步骤。

系统自动保存前后数量、实际人和服务端时间，不新增“库存变动记录”菜单／查询列表／筛选页。已保存历史及原审计权限保持，Web其他分工仍待确认；已确认§3.0.20入库记录列表查询／只读详情保留，库存错误仍通过原修改处理，不改原入库历史或伪造新入库单。复用原725字段及product_detail／adjust_inventory，不新增菜单产品ID；简化界面不等于取消留痕／越店鉴权，也不当真实库存功能验收。

##### 3.0.18.4 每种商品只有一个规格

> status: confirmed
> status_scope: one_spec_per_product_customer_staff_and_intake_flows_only
> product_spec_mode: single_only
> product_sku_count: 1
> product_spec_selection_ui: excluded
> product_variant_management: excluded
> different_product_variants_policy: separate_products
> product_technical_sku_identity: retained
> legacy_multi_sku_migration: pending_if_existing_data_requires_it

按03e§3／15.6，一种商品固定只有一个规格，差异容量口味分别建商品。取消先前默认单规格可增加／多规格展开说法及未确认的规格停用恢复删除提案；无规格管理菜单或选择弹层。保留原product_id与唯一sku_id一对一，不混用身份／改旧引用；规格说明011选填且只展示固定内容，不新增必填。商品售价库存、上下架恢复／有历史不删等仍按商品操作，不增独立规格生命周期。

新商品及唯一SKU一致建档，一份价格库存。客户端、店员开单／商品关联、邀请码及AI入库均选商品后直接引用唯一SKU，仍校验本店商品归属及关系，不能隐藏界面却接受第二个SKU；AI不把不同容量自动加为同商品规格。旧多SKU映射如需迁移先核实，不自动合并清零复制库存或覆盖历史订单入库，不能任取首个SKU。复用734字段及原商品产品ID，不新增或退役SKU字段；其余技术契约待定，本次未改H5或声称历史数据已迁移。

#### 3.0.19 商品入库／AI拍照入库，会员验证后置

> status: mixed
> confirmed_scope: manual_and_ai_photo_stock_intake_current_no_membership_original_form_explicit_posting_inventory_management_correction_photo_usage_five_rules_and_future_membership
> pending_scope: future_membership_commercial_terms_other_document_equivalence_unit_conversion_cost_updates_and_remaining_technical_contracts
> stock_intake_entries: [商品入库, AI拍照入库]
> manual_stock_intake_entry: 业务/商品处理/商品管理/商品入库
> ai_stock_intake_entry: 业务/商品处理/商品管理/AI拍照入库
> stock_intake_actors: [merchant_owner, active_store_staff]
> stock_intake_membership_phase: future
> stock_intake_membership_check_current_phase: not_required
> stock_intake_future_paid_owner_type: store
> stock_intake_future_feature_key: ai_stock_intake
> stock_intake_review_page: excluded
> stock_intake_ai_result_destination: original_stock_intake_form
> stock_intake_posting_trigger: explicit_one_click_intake

商品管理设置两个平级入口：“商品入库”手工选择SKU、填实际入库量及可选进货价，原表单点击“一键入库”，不要求拍照／AI；“AI拍照入库”拍摄识别后直接填回原入库表单，可修改并补齐必要信息，店员点击“一键入库”后才生效。取消独立核对页面、逐行核对勾选及二次核对步骤，不是AI识别完成自动入库。两入口都由本店老板／有效员工使用，原SKU关联、新商品补齐必填后同次入库，新商品入10最终10。入库量增加库存，不作为盘点库存目标覆盖原总量。

当前按普通功能，不校验会员／付费、不要求有ai_stock_intake权益，非会员或原权益过期停用不应因此被禁用，也不伪造有效会员／要求后台先开通。门店任职、租户、SKU／数量／状态／版本及防重必须后端校验；关闭会员前置不关闭这些基础校验，也不改变养宠顾问原付费规则。

后期会员只预留Store归属及ai_stock_intake功能语义，价格额度开通与启用时机另定，不阻塞本阶段普通功能；将来对AI入口及后端识别／AI来源确认入库统一增加验证，不能只锁按钮或把AI来源改manual绕过。手工入库未另确认不加会员限制，不重建库存或改已入库历史；本次范围变更不宣称阶段已切换为正式实现。

两方式复用入库单／SKU／库存／前后历史与一致性，F-INTAKE-012 method区分manual／ai_photo；手工图片／AI原始数据可空，直接待确认入库，不伪造识别成功；pending_review为原技术枚举，表示原表单待点击入库，不产生核对页。点击“一键入库”才入库，失败无半单建档／库存；同单换入口、双击重试／并发／重复回调不能再加库存。进货价不自动改售价／成本或造财务，私有单据不对客公开，历史真实人时间保留。734字段及详细规则见03e§15.1／FIELD§11.1；其余AI技术、同图以外票据等价识别／单位换算／成本更新等仍待收口，不以文档审计当真实功能测试。

入库出错按03e§15.1.5，老板／有效员工自行到“业务／商品处理／商品管理／库存管理”使用原库存调整，填写当前正确库存目标；有后续出入库时不拿原入库数量覆盖当前量。原入库记录保留，后续调整记录前后数量／人／时间，不新增作废撤销流程；选错SKU核实后分别调相关库存，预占／可售及版本防重不放宽。库存管理复用staff_product.adjust_inventory，不另造账本，不因此开放原进货价／财务历史修改。

##### 3.0.19.1 AI拍照入库五项使用细节

> status: confirmed
> status_scope: ai_intake_photo_sources_multi_image_form_failure_fallback_missing_fields_and_same_image_warning_only
> stock_intake_photo_sources: [camera, phone_album]
> stock_intake_multi_image_destination: one_original_intake_form
> stock_intake_recognition_failure_actions: [retry_recognition, edit_original_form_manually]
> stock_intake_missing_required_fields_ui: inline_in_original_form
> stock_intake_purchase_price_required: false
> stock_intake_same_image_match_scope: current_merchant_store_posted_records
> stock_intake_same_image_policy: warn_view_original_allow_continue
> stock_intake_same_product_duplicate_policy: never_block_by_product_match_alone

详细规则按03e§15.1.6：可现拍／选相册，多张照片结果合并到同一原入库表单；识别失败可重试或原表单手填，不要求先识别成功。AI入口改手填仍保留ai_photo来源和真实失败／图片，不伪造成功或改manual；重试不无声覆盖人工修改。商品规格数量不明确在原表单提示，必要SKU／数量及新商品资料补齐，进货价选填不补0；不恢复核对页或二次核对，仍点“一键入库”才生效。

再次使用曾在本店成功入库的同一照片，提示“可能重复入库”，可查看原记录、仍允许当前新单继续，无理由必填或审批；不凭相同商品拦截。F-INTAKE-013服务端逐图指纹关联003图片及原001，仅本店posted比对／原单鉴权，不泄露其他门店或客户端私有票据。该允许继续不豁免同一原单防重：同单重试／并发仍只入一次，失败无半单。保留原单历史、错误库存管理改，734字段／旧721身份状态保持，图像大小／数量、跨页重叠内容、变换图片等价等其余技术契约待收口，不以同图提醒当已覆盖所有重复票据。

#### 3.0.20 入库记录五项

> status: confirmed
> status_scope: posted_stock_intake_records_list_query_and_readonly_detail_only
> stock_intake_records_entry: 业务/商品处理/商品管理/入库记录
> stock_intake_records_actors: [merchant_owner, active_store_staff]
> stock_intake_records_scope: posted_only_current_merchant_store
> stock_intake_records_default_period: last_15_business_calendar_days_including_today
> stock_intake_records_date_basis: stock_intake_posted_at
> stock_intake_records_sort: stock_intake_posted_at_desc
> stock_intake_records_filters: [date_range, stock_intake_method]
> stock_intake_records_search: [product_name, barcode]
> stock_intake_posted_original_editable: false
> stock_intake_correction_policy: inventory_management_adjustment
> stock_intake_correction_entry: 业务/商品处理/商品管理/库存管理
> stock_intake_original_void_workflow: excluded

按03e§15.2，本店老板／有效员工可在“商品管理 → 入库记录”统一查商品入库及AI拍照入库的成功记录，不限本人经办；不把识别中、待点击入库或失败当已入库。列表显示入库时间、入库单号、商品摘要、入库方式、操作人，按010成功入库时间倒序；001作为单号，009真实确认人，不拿创建／票面日期／拍摄人替代。

默认最近15个Asia/Shanghai业务自然日（含今天前14天），可改日期查更早，不是删除期限。筛日期／全部或两种方式，搜索商品名称／条码，逐次本店鉴权；方式012不为筛选修改。详情显示本次商品规格、数量、进货价、当次入库前后账面总库存及人时间，有照片可查看；手工无照片正常，未知进货价显示未填写、不补0。前后值取历史事实，不用今日库存倒算、不替代为可售／预占。

已成功原记录只读，原始资料／数量价格方式时间不覆盖，入错数量／选错商品在库存管理自行调整并保留后续记录，不新增原单作废／撤销流程。查询与原图逐次校验任职租户对象，私有进货资料不对客；业务摘要不扩大原始审计可读权限。复用734字段及原SKU／审计，不造新账本；产品ID及详细映射见FIELD§11.1与03e§15.2。图片仅方案示意，不作为固定数据或已开发验收证据。

#### 3.0.21 结算后锁定，错误走补收或退款

消费订单实际收款或明确免单成功后，金额、付款拆分和实际收款时间锁定，取消“更正收款”入口。少收时从原单登记真实补收，原因选填；多收或不应收时走消费退款，原因必填。两者均无需审批，保留原收款及新记录，自动记录实际操作人、时间和聚合金额改前改后；不得重做服务、库存、寄养离店或优惠券核销。详细规则见03d§11.1。


#### 3.0.22 全平台账号唯一，不做跨店档案导入

账号按认证手机号全平台唯一；一个平台账号同时只能归属一家有效经营门店，已经是某店老板或员工时不能再成为其他店老板／员工。V1不提供其他门店顾客／宠物档案或服务护理历史导入入口；员工不得代导入，原导入产品ID退役。顾客风险仍按03h手机号匹配、授权和限频规则独立处理。


#### 3.0.23 活动历史、奖励自提期限与消费争议异议入口

> status: confirmed
> status_scope: activity_history_entry_reward_pickup_expiry_and_complaint_support_message_only
> confirmed_by: user
> confirmed_on: 2026-11-05

- 活动兑换／后续核销事实归原顾客消费历史，不设独立活动兑换历史菜单，不造本店成交／实收／业绩；按03c§9.3.3保留原实例和业务关联。
- 平台积分实物奖励成功兑换后，在领取门店有效时发货前后均不可主动取消；真实发货起连续720小时未登记领取，系统默认已领取，标明timeout_default来源，不伪造实际领取人／时间。领取门店账号停用时，系统自动取消原兑换、退回积分并发送重要通知，不允许顾客改选门店；已发货实物异常由平台在原兑换单处理，门店无操作入口，见03k§8。
- 消费争议、投诉和跨店顾客风险均不提供小程序自助申诉；异议只提示联系客服。原正式回应、处理情况、裁决及证据历史不变。

### 3.1 五个入口的建议职责

下表一级入口及洗护美容／寄养归属遵循§3.0；客户入口的已确认结构见§3.0.2，普通员工“我的”菜单及老板管理入口见§3.0.3／3.0.4，其余职责细化与二级菜单内容仍为提案。

| 一级入口 | 唯一主职责 | 二级菜单与主要内容 | 不混入 |
|---|---|---|---|
| 工作台 | 当天需要处理的事项与办理快捷入口 | 分组和组内顺序以§3.2为准；其他布局与辅助入口仍待确认 | 不新建第二套订单；不靠“已读”结束任务 |
| 业务 | 包含寄养的综合业务办理与历史查询 | 预约管理 → 商品处理 → 寄养 → 上门喂养 → 消费争议 → 订单与收银（菜单及顺序已确认，内部流程按来源细化） | 不复制洗美模块；预约独立于正式订单；实物奖励不混普通销售库存；寄养位置不是复杂房型预订，收款不是实际投喂 |
| 洗美 | 洗护、美容业务办理 | 临时开单、会员开单及待接宠／服务中／待结算／历史记录，见§3.0.1 | 不承载独立护理或寄养；同宠洗美中的护理加项按§4.5，不设确认接走，不将服务完成当收款或离店 |
| 客户 | 当前商户客户及关联宠物 | 按§3.0.2搜索／双视图／新增顾客，以及顾客与宠物详情；资料匹配异常处理仍待确认 | 不跨商户共享资产／内部记录；不可由页面直接改余额；不提供任意号码跨店探测入口 |
| 我的 | 本人身份与操作支持 | 七项公共菜单及顺序按§3.0.3；老板额外显示§3.0.4“老板管理”入口，员工管理结构已确认，其余菜单待确认 | 不增加“店长”角色；普通员工不显示系统日志 |

“待结算”“异常”等可作为同一业务对象的筛选入口，不生成新的业务账本。客户详情里的历史、钱包与宠物入口跳往同一对象的统一详情，不复制一套独立编辑页面。

### 3.2 已确认：工作台定位、分组与组内顺序

全部门店待办统一归属门店，不建立个人领取、转交、移交审批或抢单机制。任一当前有效员工按业务资格处理，系统记录实际处理人；一个员工开始查看不锁住其他人，提交时按最新状态防止重复处理。员工停用／离店后不需要转交，其他有效员工直接继续原待办，历史经办事实保留。

> status: confirmed
> status_scope: workbench_daily_focus_groups_order_entry_roles_and_goods_processing_categories
> pending_items_order: [预约确认, 商品处理, 上门喂养, 其他]
> active_services_order: [今日洗美, 在住寄养, 其他服务]
> exceptions_order: [投诉回应, 寄养异常, 洗护异常, 其他异常]
> quick_actions_order: [查客户／宠物, 临时开单, 寄养入住, 会员开单]
> workbench_focus: matters_requiring_attention_today
> business_entry_retained: true

工作台只专注当天需要处理的事项，不承担完整业务目录和历史记录浏览；保留已确认的四类区块及快捷操作。“业务”不是第二个工作台：用于其所属业务的完整办理与历史查询。两处复用同一业务对象、列表与详情，工作台只带入当天处理所需的筛选上下文。

“当天处理”不等于“今天创建”：跨天仍未完成、逾期、在住寄养等持续中的事项，若当天仍需处理或关注，不能因创建日期早于今天而消失。已完成且当天无需再处理的历史事项在所属业务入口查询。消费争议按§3.2.1已确认的三步流转；其他任务按各自正式业务规则进入／退出，不得擅自以午夜清空待办。

| 区块 | 按顺序展示的项目 | 归属说明 |
|---|---|---|
| 待处理 | 预约确认 → 商品处理 → 上门喂养 → 其他 | 商品处理包含商品购买需求及奖励自提事项；其他包含按§3.2.1归入的消费争议及食品风险待办 |
| 服务中 | 今日洗美 → 在住寄养 → 其他服务 | 是工作台业务分组，不把组名当作底层统一服务状态 |
| 异常与临期 | 投诉回应 → 寄养异常 → 洗护异常 → 其他异常 | 投诉回应用于关联回应的异常／临期事项；消费争议逾期待回应触发按§3.2.1，提前预警阈值等其余细节仍待收口 |
| 快捷操作 | 查客户／宠物 → 临时开单 → 寄养入住 → 会员开单 | 四个入口均保留；两种开单复用同一订单模型，仅顾客资料取得方式不同 |

已确认的“商品处理”分类：

> goods_processing_categories: [商品需求, 奖励自提]

| 分类 | 处理内容 | 原业务依据 |
|---|---|---|
| 商品需求 | 处理客户端提交的商品购买需求 | 03e商品需求与订单规则 |
| 奖励自提 | 查看本店奖励兑换，实际交给顾客后点已领取，不需要领取凭证 | 03k积分奖励自提规则 |

两类事项分别展示、进入原业务详情，不合并订单、库存或状态。奖励取消到货确认及领取凭证，不设奖励收货分类；老板／本店有效员工从所选门店的原兑换单登记实际领取，沿03k校验发货／取消／已领取状态，保留员工／时间／门店和防重复。已发往门店不表示已到货，不自动发可领取通知；门店线下联系后实际交付再点已领取，普通销售不能代替奖励登记。

已确认的开单入口分工：

- **临时开单**：用于临时顾客或现场新建资料；手机号／微信号至少填写一个，宠物服务须填写宠物昵称和品种，再选择商品或服务项目。护理选择进入§4.5，不在底栏或洗美页新增独立护理入口。
- **会员开单**：先从本店已有顾客下拉列表选择顾客，不再手填手机号／微信号；宠物服务仍须选择或补齐宠物昵称和品种，再进入同一商品或服务项目选择。这里的“会员”仅指本店已有顾客快捷选择，不新增付费会员等级、套餐或权限。
- 两个入口复用同一套开单能力和订单模型；差别只在顾客资料取得方式，不因入口不同重复创建Customer、Pet、订单或服务记录，也不预选具体项目、价格或宠物。
- 复用开单能力不等于合并商品与服务订单；基础资料及多宠入口按§4.1已确认范围执行，普通商品不强制选择宠物。商品与服务混合结算、收款时点等未决事项不因入口复用而确认。

已确认边界：

- 奖励自提仍归“商品处理”，不另列工作台同级入口；取消奖励收货分类／到货确认／领取凭证。普通商品销售与平台奖励仍分别使用原订单、库存及详情，不以销售收款代替奖励领取记录；不授予总仓发货或退积分，成功兑换不提供取消。
- “其他”不是删除功能或新增业务的授权：待处理区块仍须承接按§3.2.1归入的消费争议和食品风险待办。当天进行中的独立护理归“服务中 → 其他服务”，护理异常归“异常与临期 → 其他异常”，按§4.5复用原护理对象；同宠洗美护理加项不另生成护理事项。其他未明确类型仍待逐项确认，不自动创建新业务状态。
- 消费争议按§3.2.1更新或移动同一原投诉卡片，同一争议不在两区重复显示／计数；不复制投诉或产生独立回应流程。其他类型事项的跨区块去重与未确认展示细节仍待确认。
- 快捷入口复用原业务对象，不新建第二套订单；名称和位置不意味着自动授权，也不意味着点击即创建订单。
- 争议门店归属、全体有效在职员工正式回应继续按§6.1／6.5执行；短信当前暂未开放，未来接收方向预留争议门店注册号码，不授权发送。

工作台不扩展为营业额／业绩排行看板或完整功能目录；经营统计入口已按§3.0.10确认在老板管理；其他未列统计／管理入口仍待确认。区块最终视觉位置、通知入口、卡片展示字段、红点计数、空态及具体任务排序算法仍待确认；组内入口顺序不等于每个业务列表内任务记录的排序规则。

#### 3.2.1 已确认：消费争议待办三步流转

> status: confirmed
> status_scope: store_consumer_dispute_workbench_projection_only
> confirmed_by: user
> confirmed_on: 2026-11-02
> unique_card_key: complaint_id
> max_current_cards_per_complaint: 1
> pending_response_location: 待处理/其他
> overdue_pending_response_location: 异常与临期/投诉回应
> evidence_window_location: 待处理/其他
> evidence_window_label: 补证中
> awaiting_platform_without_store_action: absent_from_workbench
> explicit_platform_material_request_location: 待处理/其他
> platform_resolved_projection: absent_from_workbench_history_retained
> cross_day_unfinished_policy: retain
> view_read_or_handling_progress_closes_todo: false
> food_risk_todos_in_scope: false
> remaining_pending_scope: early_warning_thresholds_future_sms_enablement_material_request_technical_contract_and_remaining_task_details

1. **未回应**：本店需正式回应的消费争议显示在“待处理／其他”；平台已判定逾期仍未回应时，同一卡片移到“异常与临期／投诉回应”。同一complaint_id在两区合计只显示一张当前卡、计数一次；重复读取／通知或换员工不增加卡片／投诉。7天具体截止与真实剩余时间仍按§6.1.1重点展示，字段缺失不捏造期限或逾期。
2. **已回应**：首个正式回应成功后，同一卡片改“补证中”，放回“待处理／其他”，突出原3天补证截止与真实剩余时间；原逾期仅留历史，不继续按待回应异常显示。补证按需提交，不强制上传。原补证期结束且当前没有需门店操作的事项时移出工作台，包括仅等待平台核验的情况；平台明确提出仍需本店办理的补材料要求时，在“待处理／其他”再次显示同一原争议入口，不新建投诉。再次出现时展示真实补材料要求，不把已结束的原3天伪显示为仍在进行。平台额外材料期限按03h§4.4单独记录，不修改F-CMP-019重开3天；请求的具体技术字段与完成判断后续按平台任务规则收口，不用Mock请求冒充已接通。
3. **平台确认已解决**：平台成功将原争议确认resolved后，移出工作台，原争议和全部历史仍在“业务／消费争议”查询。该退出条件优先于仍有旧待回应／补证卡片的显示，不把卡片移除伪造成已正式回应、改写裁决、完成平台材料请求或删除历史逾期；平台确认失败不提前移除。

未完成且当前仍需门店处理／关注的事项跨天保留，不按午夜清空。查看、已读、通知送达或提交03h§6.2处理进展都不自动关闭仍需办理的回应／补材料事项，也不因每次处理进展新增卡片。原补材料要求是否已履行按真实请求及对应规则判断，不以普通进展记录代替完成。业务入口始终复用同一原投诉及访问权限，卡片只是当天关注视图，不是新的统一状态机；不新增持久化workbench_status、第二deadline或“移出工作台＝已解决”的写入规则。

阶段／期限／平台请求状态读取失败或尚未同步时，不据此推断已补证结束、无门店需办或已完成，显示待同步并重试；鉴权失效仍按原权限关闭访问，不靠旧卡保留材料权限。

本节仅确认门店消费争议投影，不关闭独立食品风险知悉待办；食品风险由平台直接联系厂家，门店只接收知悉通知，只有另行明确主张门店自身销售／处理行为的部分才进入消费争议回应。短信当前暂未开放。再次显示卡片不扩大原件／未审材料的可见权限，不自动重启回应／补证或已解决后的新流程。

### 3.3 全部功能清单及手机 / Web 分工建议

下表是**完整分析目录**，不是“全部权限已授予”的功能开关表。§3.0导航、§3.2工作台分组与组内顺序、§6.1／6.5跨端职责已确认；下表其他菜单位置、细项与分工为proposed；“已有方向”仅表示原文要求考虑该能力，不表示细则已就绪。

| 功能组 | 分析菜单 | 建议手机入口 | Web侧分工建议 / 阻塞 | 已有依据 |
|---|---|---|---|---|
| 预约 | 人工确认、提出新时间、拒绝、预约历史 | 业务/预约管理，工作台待办直达 | 营业与预约设置仅老板操作；无固定间隔／时段名额，确认／改期按03a§11校验营业状态及版本 | 03a、§3.0.7 |
| 洗护美容 | 临时／会员开单、六项检查／复检、七组洗护前后选填照片／普通结果、近15天默认历史及手机号／状态日期筛选 | 待接宠／服务中／待结算／历史及两种开单入口；未结算重新处理原因选填，不设确认接走 | §4.4已确认范围不回退，终止提示已定，其他未列边界按原待决 | §3.0.1／4.3／4.4、01§13、03i |
| 独立护理 | 工作台临时／会员开单选择护理；五态、简短检查、本人普通结果、多宠及完成后结算 | 完整订单／历史：业务／订单与收银；当天在做／异常：其他服务／其他异常 | 不进入洗美主导航、不开顾客预约或护理AI；同宠洗美加护理仅原单共用进度 | §4.5、03d§4.4 |
| 寄养 | 入住、在住、位置、照护、动态、异常、延住/提前离店、交接、历史 | 业务/寄养（归属已确认） | 位置选填简单文字／重复仅提醒按§5.1；过夜计费／实际离店结算按§5.2，入住逐宠日价／多宠一起结算按§5.2，日价更正／免费／历史保护按§5.2第14～18项、健康资料／特殊照护含代喂药／异常沟通按§5.4；挂单查询／人工联系及误挂撤销按§4.6；代接／送医等用每日照护记录登记，结算单独核对时间；完整报表及其他平台技术另定 | 01§14、03e§17 |
| 商品 | 商品管理六项、快速销售、购买需求、确认数量金额和销售历史；商品入库／AI拍照入库 | 业务/商品处理/商品需求及商品管理；两种入库在商品管理内 | 主资料／售价／SKU及库存调整老板员工均可手机操作，当前两入口无会员前置，后期AI会员验证及剩余技术契约另定 | 03e§15／15.1、§3.0.18／19 |
| 收银记账 | 待结算、券、整单调价、登记实收／免单、手动挂单 | 原服务／商品详情及业务／订单与收银／挂单 | 财务仅账本、不接外部收银接口；全部消费最多两种支付、改0后明确免单，其他业务时序／账本更正待决 | §3.0.9／4.4、03d§1.1／10.1 |
| 交易异常 | 消费补收、消费退款、充值退款 | 原消费单或原充值单详情，本店老板／有效员工均可办理，无需审批 | 消费结算后原金额锁定；少收追加补收，多收／不应收追加退款；充值退还走充值退款，不直接改余额 | §3.0.14／3.0.21／4.4、03c§4.3、03d§11～12 |
| 客户 | 搜索/添加/详情、历史客户匹配异常、客户通知 | 客户 | Excel／CSV批量导入归Web后续设计，手机本期无入口；其他复杂处理另定 | 02§9、03g、03f |
| 宠物 | 档案、基础/护理/寄养资料、体重、服务历史、当前食用品牌、行为与服务安全记录（跨店细节待确认） | 客户详情，或从洗美、业务/寄养带入 | 内部备注与客户资料权限分清，不替客户自动授权 | 01§5、03b、03h |
| 会员 | 余额/本金/赠送/流水、逐次充值及可选赠送、充值记录查询、充值退款、优惠券查看与处理 | 客户详情按权限操作 | 充值不设套餐，有赠送备注必填，记录查询两入口与六列见§3.0.11～12／03c；订单日期为原充值单据生成日期；原充值成功后锁定，不提供更正、撤销或直接修改余额，退还只从原充值走§3.0.14充值退款，原流水不覆盖 | 01§8～9、03c |
| 库存 | 商品总库存／预占／可售核对、补货盘点及手工／AI两种入库 | 业务/商品处理/商品管理，两种入库在其内 | 本店老板员工在库存管理自行调整入库错误，预占不覆盖；AI填原表单点击后一次入库，无独立核对页；剩余Web分工及技术契约待定 | 03e§15／15.1、§3.0.18／19 |
| 投诉回应 | 正式回应、证据、第三方佐证、补证、裁决/申诉状态 | 工作台待处理/其他；异常与临期/投诉回应；业务/消费争议（已确认） | 平台负责审核与裁决；本店动作基线见§6.1，其他动作权限与手机/Web分工待确认 | 03h、§6.1～6.3 |
| 上门喂养 | 待确认、已确认、历史；仅确认／撤销 | 工作台待处理／业务/上门喂养 | 当前店确认后仅本店可看双方联系方式；修改与实际服务在线下，无进度跟踪 | 03j§8～9.3 |
| 积分实物履约 | 本店已发货奖励、实际交付后登记已领取、历史 | 工作台/待处理/商品处理下的奖励自提；业务/商品处理/奖励自提 | 无奖励收货分类／到货确认／领取凭证；老板与有效员工沿03k登记真实领取，不做总仓发货；正常超期默认已领取，领取门店停用则系统自动取消、退积分并发重要通知，不允许改店 | 02§2／4、03k |
| 财务 | 原收退款记账及经营统计／原明细核对，无独立对账或日结／交接班／现金盘点 | 老板管理/经营统计及原交易详情，不新建对账入口 | 正常记账补录保持；门店日常经营和老板设置全部在小程序，Web后台只给平台使用 | §3.0.10～3.0.10.2、01§10/§15 |
| 员工业绩 | 老板汇总本店、员工核对本人归属订单；每单归属必须明确 | 我的/我的业绩；老板管理/经营统计；平台管理员按职责查看 | 一单一人，员工只转本人当前归属、老板改本店全部，原因选填；业绩按实际收款减退款，历史缺归属统一算本店老板 | 01§10、02§4、§3.0.10 |
| 员工管理 | 员工列表、邀请员工；停用／删除／恢复放在列表内；无权限配置 | 我的/老板管理/员工管理（§3.0.4已确认） | 删除后回本店由老板重新邀请关联原身份；订单归属老板原单直接更改、无交接流程按§3.0.4.2已定，其他未列手机Web／待办细节另定 | 02§6～8 |
| 门店配置 | 门店资料、营业与预约设置、四类项目及表单／启停恢复已确认；优惠券管理五项按§3.0.15已定；商品管理及两种入库已按§3.0.18／19确认主流程，通知模板及未列配置细节继续讨论，充值不设套餐 | 我的/老板管理/门店资料、营业与预约设置、服务项目管理已确认 | 洗护美容护理项目主资料仅老板维护；商品主资料和库存按§3.0.18老板员工可维护，服务菜单的商品分支只关联已有SKU；护理仅门店开单，结算调价不改主资料 | §3.0.6～3.0.9、01、02、03各子模块 |
| 付费能力 | 养宠顾问既有权益；AI拍照入库会员为未来阶段 | 养宠顾问管理入口仍候选；两种入库当前普通功能 | pet_advisor原付费不变，ai_stock_intake不作当前校验，后期价格额度／开通及验证另定；不开放顾客聊天 | 03l、03e§15.1、§3.0.19 |
| 日志与数据 | 系统操作日志及平台数据治理 | 老板小程序查看本店操作日志；平台人员使用Web后台 | 门店不使用Web经营后台；平台批量审核、数据治理和平台日志保留在Web | §3.0.4.1／3.0.10.2、01§11～12/§15、02 |
| 账号支持 | 当前身份、登录异常、通知权限说明、帮助、退出 | 我的 | 不建设已排除的在线客服/私聊系统 | 02、03f及全局边界 |

### 3.4 明确不属于店员菜单的能力

- 平台跨商户数据、商户停用等平台管理：不向Merchant Owner/Staff开放。
- 平台积分奖励配置/定价、总仓发货：不是门店库存/核销菜单的附带权限；总仓发货只给持有reward_fulfillment.manage的Platform Super Admin。
- 平台广告单元/广告密钥/全局启动广告配置：不放入普通店员菜单。
- 客户养宠顾问聊天正文：不因老板付费或店员服务关系就可查看。
- 客户线上支付、客户充值入口、快递电商、跨客户私聊：不能因为店员菜单分析而重新加入已排除范围。

### 3.5 权限、状态与页面一致性（设计约束建议）

- 页面可见、数据可读、动作可执行分开审查，后端是权限权威；“菜单已确认”不等于“该员工已授权”。
- 与当前身份完全无关的管理项隐藏；可读但不可操作的详情明确原因；直接打开无权目标时安全拒绝，不泄露他人的资源存在性或字段。
- 区分无任务、筛选无结果、加载失败、会话失效、门店/员工停用；无权限不能伪装成“今天没业务”。
- 列表筛选和位置返回可恢复；业务详情到客户/宠物再返回时保留原上下文。搜索/刷新不能让迟到数据覆盖当前条件。
- 记账／执行动作提交中保留输入，服务端确认后才显示成功；网络未取得结果先查同一请求，不重复写账／投喂／核销。此处是普通请求防重，不是外部支付通道的“结果未知／对账”业务状态机。
- 页面名称与主按钮动词全端统一；通知已读、任务已处理、服务完成、已收款、已接走不得互换。
- 具体颜色、字号、控件、滚动容器和基础库归后续店员UI规范；本轮不把10a客户端视觉规范自动指定为店员端设计系统，也不创建重复的运行时DESIGN.md。

### 3.6 本轮剩余待确认的结构决定

导航与洗护美容/寄养归属已按§3.0确认，不再作为待选方案。

1. 工作台专注当天处理事项、保留业务入口及四个工作台区块已按§3.0／3.2确认；业务页六项菜单与顺序已按§3.0确认；经营统计入口及五项按§3.0.10已定；各菜单其他内部细节、未列统计／管理入口及辅助内容仍待确认。
2. 门店日常经营和老板设置全部在小程序，门店不提供Web经营后台或表格导入导出；Web后台只给平台人员用于平台管理、审核和数据治理。独立对账、日结、交接班和现金盘点均不做。

以上规则均为已确认正文；未列资金、权限或状态不得由实现自行扩张。

### 3.7 已确认：预约管理、选填原因与确认提醒

> status: confirmed
> status_scope: appointment_staff_handling_and_confirmation_reminders_only
> confirmed_by: user
> confirmed_on: 2026-10-25
> appointment_workbench_scope: all_current_store_actionable_requests_including_future_arrival_dates
> appointment_customer_response_waiting: excluded_from_store_confirmation_queue
> appointment_record_entry: 业务/预约管理
> appointment_query_groups: [待处理, 已确认待到店, 历史记录]
> appointment_query_filters: date_and_wash_groom_boarding_type
> appointment_query_groups_are_states: false
> appointment_pending_sort: requested_arrival_time_ascending_then_submission_time_ascending
> appointment_rejection_reason_required: false
> appointment_reschedule_reason_required: false
> appointment_other_reason_text_required: false
> appointment_operator_display: internal_actor_and_time_customer_store_and_result_only
> appointment_handler_roles: [merchant_owner, active_store_staff]
> appointment_known_reminder_acknowledgement: explicit_read_and_continue_before_confirmation
> appointment_reminder_auto_rejection: excluded
> appointment_shared_check_unavailable_label: 共享提醒暂不可用，可继续
> appointment_shared_check_unavailable_policy: direct_continue_with_unavailable_record_no_staff_verification_or_safe_default
> appointment_identity_conflict_effect: block_shared_query_no_staff_merge_or_authorization_bypass
> appointment_manual_continue_scope: appointment_business_only_not_shared_data_access
> appointment_confirmation_creates_service: false
> appointment_new_customer_reminder_extension: shared_rules_confirmed_in_section_6_5_1

1. **工作台预约确认范围**：所有当前确实需要本店确认／决定的有效申请都进入工作台预约确认，包括到店日期为明天或更晚的申请；“当天处理”按当前待办判断，不按到店日期等于今天过滤。等待顾客接受门店新时间的记录不混入待门店确认队列；按03a§11已取消、超时或无需本店动作的旧请求不继续计待确认，不复活原申请。
2. **完整预约管理**：“业务 → 预约管理”查询完整记录，分待处理、已确认待到店、历史记录，支持日期及洗护／美容／寄养筛选。它们是查询分组，不新增底层状态，不因移组自动取消或生成服务；原预约及提议状态／到期处理仍依03a。
3. **排序**：待处理按当前申请／改期期望到店时间从早到晚，同时间按申请提交先后排列。已确认原预约在改期成功前仍有效，原承诺时间单独保留，不用列表排序或新时间显示静默覆盖；多宠同批及并发规则不变。
4. **接单信息**：详情集中展示本店有权查看的顾客联系方式、各宠物资料、项目、期望时间、寄养预计离店时间及本次特殊要求；参考价仍不锁定实际结算价。跨店共享只展示原授权／同意／匹配范围内的提醒，不把接单详情变成其他门店私有资料入口。
5. **拒绝／建议改期原因选填**：空原因可合法拒绝预约或提出新时间，不因前端必填、API／DTO、服务端、数据库空值限制或“其他”分支补文字拦截。可选快捷原因“门店忙碌、临时无法接待、需沟通服务安排、其他”，也可填写真实说明；选择其他不强制补文字。实际填写时向顾客展示真实内容，未填只显示真实处理结果，不伪造忙碌等默认原因。全局只有消费退款、充值退款和免单原因必填；挂单、调价及其他原因均选填。
6. **处理人留痕**：本店老板和有效员工均可处理，不限定原接单人、不新增老板审批。内部记录实际操作人和服务端时间，客户端展示门店及结果，不展示员工个人联系方式；普通业务记录与原始系统审计仍按原可见性规则区分。
7. **有提醒须明确阅读**：确认预约时，存在明确关联且本店有权查看的护理注意事项／风险提醒，须独立弹窗并点击“已阅读，继续”后再执行预约确认；只关闭弹窗、点空白或展示成功不等于已阅读。阅读不自动确认预约、不解除风险，不根据提示自动拒单；只对当前预约确认动作留痕，不据此建立全局忽略／永久不再提醒。新增顾客与预约的共同阅读／去重／失败接续按§6.5.1，新老顾客均适用。
8. **共享提醒暂不可用仍可继续**：共享提醒查询失败或暂不可用时统一提示“共享提醒暂不可用，可继续”，员工可直接继续当前预约确认，无需门店核验顾客资料真实性或先人工核对；保留查询不可用、选择继续及实际操作记录，不能记成已查明无风险或共享查询成功。该放行仅指预约业务，不授予共享查询权限：授权／同意撤回、限额、身份冲突等仍按03h阻断相应共享取数；冲突由平台核验，员工不得选一个身份强行查询、合并身份、补假授权或重置次数。对外不暴露可用于判断他店顾客／风险记录是否存在的差异化失败原因。原本店身份／宠物归属、营业／关闭、6小时修改截止、预约版本及状态等业务校验仍须通过，不因选择继续而绕过。

确认预约仍不等于实际到店、开始服务、寄养入住或收款；到店后沿原开单／检查／入住动作办理。字段复用F-APPT-014／018／022／029、原查询F-CRISK-010（确实发生时）及F-AUD；阅读和选择继续的唯一字段见FIELD-REGISTRY§6，不制造第二预约对象或伪造查询。新增顾客阅读／失败接续、重复提醒频率按§6.5.1；其他风险业务影响只能使用03h已确认规则。

### 3.8 已确认：普通商品需求处理8项

> status: confirmed
> status_scope: product_request_handling_including_boarding_snack_sales_only
> confirmed_by: user
> confirmed_on: 2026-11-01
> goods_request_entry: 业务/商品处理/商品需求
> goods_request_query_groups: [待处理, 待付款, 历史记录]
> goods_request_query_groups_are_states: false
> goods_request_pending_sort: submission_time_ascending
> goods_request_unsettled_sort: hold_expiry_ascending_never_auto_cancel_last
> goods_request_search: current_store_customer_contact_order_id_product_name_only
> goods_request_scenarios: ordinary_purchase_and_boarding_feed_on_original_order
> goods_request_shortage_actions: reduce_quantity_or_remove_items_before_settlement
> goods_request_empty_result: cancel_not_empty_order_or_waived_sale
> goods_request_quantity_change_reason_required: false
> goods_request_item_removal_reason_required: false
> goods_request_manual_cancellation_reason_required: false
> goods_request_reason_optional_scope: all_goods_requests_including_boarding_snacks_before_settlement
> goods_request_price_adjustment_and_refund_reasons: preserve_existing_required_rules
> goods_request_preparation_step: excluded
> goods_request_delivery_confirmation_step: excluded
> goods_request_sale_completion: actual_payment_recorded_or_explicit_waiver
> goods_request_sale_completion_proves_collection: false
> goods_request_cross_request_checkout_merge: excluded
> goods_request_same_cart_multi_item: one_original_request
> goods_request_inventory_and_timeout: preserve_03e_reservation_and_default_24_hours
> goods_request_boarding_feed_execution: retired_ordinary_sale_optional_separate_care
> goods_request_auto_care_event: false
> goods_request_care_requires_payment: false

1. **查询分组**：“业务 → 商品处理 → 商品需求”分待处理、待付款、历史记录，分别查询待门店处理的需求、已确认但尚未结算的需求及其余历史；它们是查询条件，不新增底层状态、不因切组创建订单／取消／收款。加餐商品同样适用，交易完成即归交易历史，无独立投喂待办。奖励自提仍按§3.2及03k独立于普通商品，不混普通销售库存。
2. **排序**：待处理按原需求提交时间早到晚；待付款按保留截止时间近到远，“不自动取消”排在有截止时间之后。跨天仍需办理的有效事项继续按§3.2显示，不能只查今天新建；不把排序当成延期或重置保留期。
3. **搜索范围**：按本店顾客联系方式（手机号／微信号）、订单号、商品名称查找；服务端限制本店且为当前员工有权查看的记录，不跨店搜顾客，不借搜索触发跨店风险查询。
4. **加餐按普通商品销售**：显示真实业务场景，来源渠道仍独立。加餐复用原商品需求、确认／库存／记账及成交状态，不另造订单；取消独立待执行加餐、确认已投喂及投喂异常流程。收款／免单不自动生成喂食动态，需要记录时从原寄养照护表单另记实际喂食，照片选填、无需先收款；本次在住／主人要求／饮食限制仍约束入口及真实照护，见03e§17。
5. **缺货处理**：结算前可减量或移除缺货项，剩余有效商品可继续确认；全部数量归零时取消原需求，保留原始申请及处理历史，不造空商品订单或零元免单成交。已确认订单修改按03e重新校验／调整原SKU预占，释放不再需要的预占，不重复占库；结算成功后不通过改量／移除改写历史。
6. **商品需求原因选填**：结算前改数量、移除项或人工取消商品需求（含加餐商品），原因均选填；前端、API／DTO、服务端及持久化不得因未填阻断，有填保留真实说明，无填不编造缺货等理由。实际操作人、服务端时间、原始／当前内容及状态仍留痕；调价、退款的原因要求及系统超时原因记录不变。
7. **交易与实物交接分开**：普通商品不新增独立备货或确认交付步骤，真实收款记账或明确确认免单后按03e完成销售、一次出库及券处理。客户端“已完成”只表示商品交易完成，不记录或推断顾客已取走；实物在线下交接。平台奖励自提核销仍按03k；实际照护需要时另记，不由销售推断。
8. **需求不合并结算**：不同购买需求分别处理，同一顾客两次提交暂不合并结算；同一次购物车多个商品仍是一笔原需求／原订单，不拆成重复订单。不是寄养多宠合并结算或同宠洗美加护理原单加项，不扩展其他混单许可。

复用原订单／明细／SKU、F-ORD-006／007／031原数量与快照、F-PROD-025保留截止、F-CORE-013原提交创建时间、F-ORD-032金额版本及F-AUD。选填原因复用F-AUD-009，不新建全局取消原因必填规则；查询组不是持久化的新状态。库存仍按03e自动预占、默认24小时保留、未结算取消／超时释放、收款／明确免单一次出库，重试与并发不重复。商品维护／手工库存及两种入库（当前无会员前置）按§3.0.18／19；入库错误由库存管理调整，部分退款按03c§5.1。门店经营与老板设置只在小程序，网页后台只供平台。

### 3.9 已确认：上门喂养确认／撤销与店家联系方式权限

> status: confirmed
> status_scope: home_feeding_store_confirm_cancel_and_store_only_contacts
> confirmed_by: user
> confirmed_on: 2026-11-01
> home_feeding_authority: 03j_sections_8_and_9
> home_feeding_store_actions: [确认, 撤销]
> home_feeding_query_groups: [待确认, 已确认, 历史记录]
> home_feeding_contacts: current_store_only_after_confirmation
> home_feeding_progress_tracking: retired

- “业务 → 上门喂养”查询完整记录，用户有效接单后才进当前店工作台待确认，本轮按accepted_at早到晚。门店确认后移出待确认队列，已确认／已撤销／已过期仍可查；查询组不创建新状态。
- 本店老板／有效员工均可确认／撤销，无老板审批／原经办限制；确认必须已有有效接单用户且当前负责版本及状态合法。确认后仅当前店可读双方既有合法授权联系资料，确认前及撤销后不允许新读取，需求方／接单用户不能互看对方号码。
- 接单后的安排修改由门店自行线下协商；APP不提供修改／重新确认表单、协商备注照片、独立接单退出、重新开放、开始服务／完成服务。仅展示原发布信息及撮合确认状态，不把线下实际服务当APP跟踪结果。
- 原发布店、当前负责店及负责版本分离。临时休息不影响本功能；账号停用自动交最近有效其他平台店，以原发布店位置为起点，保留原需求／接单人／历史。旧店失权，新店需再次确认才可看双方联系方式，原确认保留历史；不搬其他顾客／钱包或公开旧店资料。
- 首次上门接单截止及无有效接单自动过期按03j§9.3；门店确认不等于服务完成，不按日期自动结束有有效接单的需求。不设固定响应时限／催办，不生成收款／营业额。
- 需求方本人或当前店可以撤销整笔未终止需求，原因选填且原历史留痕；无APP修改／重新开放，需要新招募由需求方新发布。具体状态、撤销与确认／迁移竞态及字段统一读03j／FIELD-REGISTRY§15，DEC-FEED-01／03已确认，02仅余地理技术与异常界面。


## 4. 宠物服务开单、洗护／美容与护理已确认流程

### 4.1 已确认的开单基础与尚待确认的流程细节

临时开单／会员开单属于快速开单：完成所属业务必须的开单前检查并成功提交后，服务记录直接进入“服务中”，不再显示额外“开始服务”按钮；检查失败或资料不完整不得假开始。由普通预约到店生成的服务仍先进入“待开始”，店员核对后手动点击开始。两条路径使用同一订单、服务状态和审计模型，只是开始动作触发方式不同。

> status: mixed
> confirmed_scope: service_entry_basic_requirements_guest_customer_multi_pet_add_entry_and_staff_manual_status_operation
> pending_scope: remaining_workflow_edges_not_confirmed_in_sections_4_3_to_4_5
> blocked_by: []
> confirmed_by: user
> confirmed_on: 2026-10-22
> service_entry_required_pet_fields: [pet_name, pet_breed]
> service_entry_contact_policy: at_least_one_mobile_or_wechat
> service_entry_modes: [temporary_order, member_order]
> temporary_order_customer_input: mobile_or_wechat_at_least_one
> member_order_customer_input: select_existing_current_store_customer
> member_order_manual_mobile_or_wechat: excluded
> service_entry_shared_order_model: true
> service_entry_service_choice_required: true
> service_entry_service_choice_values: [wash, grooming, other]
> service_entry_service_choice_labels: [洗护, 美容, 其他]
> service_entry_price_required: true
> service_entry_price_minimum: 0
> service_entry_price_decimal_places: 2
> guest_customer_supported: true
> guest_customer_requires_online_registration: false
> multi_pet_add_action: 新增宠物
> service_status_operation_mode: staff_manual
> ordinary_product_requires_pet: false

本节确认宠物服务开单的最低基础资料和两种入口，不替代服务项目选择、寄养入住照护资料或后续已确认的安全检查。普通商品销售不强制选择宠物，不为买商品强建宠物档案；寄养加餐等原本必须关联宠物的场景仍遵守原规则。

| 基础资料 | 当前规则及唯一来源 |
|---|---|
| 宠物昵称 | 每只办理服务的宠物必填，复用F-PET-002／pet_name；不另建dog_name，保留猫／狗／其他现有类型。 |
| 联系方式 | 当前顾客手机号或微信号至少一个非空，可都填；复用／填写本Customer联系资料，见F-CUST-001／002。同一顾客多只宠物不要求逐只重复输入联系方式。 |
| 品种 | 每只办理服务的宠物必填，复用F-PET-005／pet_breed；已有资料自动带出，缺失时在开单中补齐，不要求重新建同一宠物。 |
| 服务项目 | 临时开单和会员开单都必须从“洗护／美容／其他”中选择一项；这是本次快速开单的界面选择范围。 |
| 价格 | 两种开单都必须填写本单开单价格，非负、最多两位小数；结算前仍可按现有调价／免单规则处理，不回写项目参考价。 |

- 临时开单使用本节联系方式规则，可建立本店稳定Customer后继续；会员开单必须从当前门店已有顾客下拉选择，不展示手机号／微信号手填框。两种开单都必须选择服务项目并填写价格，选中或创建顾客后复用同一后续宠物、检查、状态和结算流程。
- 本节快速开单下拉中的“其他”只表示本次快速开单的界面归类，不表示新增正式`service_type=other`、删除护理／商品或改变老板管理中的四类项目。正式项目主资料仍为洗护／美容／护理／商品；护理和商品继续按各自现行规则办理，实现不得把本下拉三项反向覆盖§3.0.8或FIELD-REGISTRY中的正式类型。

- 新增宠物仍保留03b已有的宠物类型规则，已知资料自动带出；不以本轮三项基础信息为由删除既有类型，或把头像、生日、性别、体重、完整档案擅自增加为统一开单必填。品种必填仅针对本节服务开单，客户端首次建档继续可不填品种。
- 支持临时顾客：由本店老板／有效员工在线下创建或选用本Merchant的Customer，填写上述资料即可继续开单，不强制顾客先注册小程序、成为会员或先绑定Platform User。临时顾客不是新系统角色、共享匿名Customer或另一套订单；依然使用稳定customer_id／pet_id及本店订单关联，历史保留。
- 手工录入的手机号／微信号仅为联系资料，不是已验证登录身份，不能自动绑定User、合并同号顾客、转移资产，或当作已核验跨店查询身份。线上历史识别、绑定冲突及跨店共享仍分别按03g与03h／§6.5.1执行，不因只填微信号开单就跳过验证或授权。
- 多宠开单提供“新增宠物”，当前顾客上下文逐只添加、关联真实pet_id及项目，不按同名合并或覆盖已选宠物，不绕过停用项目／原预约原宠物例外。洗美按§4.3、独立护理按§4.5一笔消费订单／每宠独立进度／一起结算，不按宠拆账或分次付款；其余类型不自动照搬。
- 服务状态由本店老板／有效员工手动操作切换，服务端校验本店对象、当前状态及合法迁移，记录操作者、服务端变更时间和前后状态，不能只改前端标签；重试不重复产生服务结果，并发不能用旧状态覆盖新状态。
- “手动切换”不等于任意跳步或修改付款／离店事实。洗美按§4.3／4.4，独立护理按§4.5；已确认五态、未结算重开、结果发布及适用时间更正各按所属范围，不能靠切状态造付款或已接走；中止顾客标签及其他未列状态更正仍按对应DEC；取消／中止不恢复原服务、要开始重新开单已定，不回退已确认项。

### 4.1.1 不跨业务混合结算

> status: confirmed
> status_scope: cross_business_combined_checkout_excluded
> confirmed_by: user
> confirmed_on: 2026-11-05
> cross_business_combined_checkout: excluded
> checkout_business_families: [洗美, 独立护理, 寄养, 商品]
> existing_same_pet_wash_care_addon: retained_in_original_wash_service
> same_business_multi_pet_checkout: existing_rules_unchanged

商品、洗美、独立护理、寄养按各自业务单分别结算，不把不同业务单合成一次系统结算／付款分摊；同一顾客、手机号或到店时间相同也不合并。只关联已有商品SKU不等于可与服务混结，寄养加餐仍普通商品单，不并入寄养收费。原同宠洗美内护理加项是原洗美服务加项、不生成独立护理单，继续原洗美检查／进度／结算；同一业务已确认的多宠一起结算、寄养分批接走规则保留。不新增混合订单模型、跨业务优惠分摊或一笔新总账，跨业务混合不再列待决。

### 4.2 洗护／美容流程细节（待确认）

建议优先把下列一条链走通，逐节点确认字段、权限、状态和客户可见结果。

| 节点 | 已知边界 | 推荐低负担设计（待确认） | 待决定 |
|---|---|---|---|
| 找客户/宠物 | §4.1三项资料及临时顾客已确认 | 一个搜索入口，已有资料带出 | 复杂复用／绑定冲突具体操作 |
| 开单／服务 | 五态，未结算可重新处理且原因选填 | 项目按每宠进度管理，不额外工序打卡 | 跨类型混结禁止；其他未列状态更正；取消／中止后重新开单已定 |
| 服务前检查 | 六项强制，异常／无法检查先告知主人决定 | 真实结果、不默认正常，完成前简短复检 | 检查异常具体交互等契约细化，不作医疗判断 |
| 结果发布 | 完成发布；已完成允许补图／改普通说明，含已结算，原因选填、全店有效人员可办、顾客默认最新且历史留存 | 补改不重开／不发通知／不改账，AI由顾客主动选择并校验原资格；重开再完成仍按原完成通知 | 终止提示已定；其他更正及AI新素材再分析版本契约 |
| 收款／挂单 | 正常完成或中止费用明确后结算，全未开始取消不收费；财务只记账 | 未付先待结算、手动挂单原因选填，记清收款／免单后自动解除 | 跨业务混结禁止；结算锁定后少收补收、多收或不应收退款；部分退款按03c§5.1已定 |
| 离店 | 无确认接走，原待交付已改待结算 | 不伪造已接走，不用离店字段判定能否重开 | 不影响寄养离店／奖励自提登记 |

上表只索引已确认与待决范围，洗美正常完成后收款及中止实际收费例外按§4.4执行，不预收；不将本轮顺序扩展商品／加餐／寄养／护理。

### 4.3 已确认：洗护／美容16项流程及剩余边界

> status: mixed
> confirmed_scope: wash_groom_five_states_mandatory_precheck_optional_photos_result_publication_multi_pet_single_order_post_completion_collection_hold_direction_no_pickup_confirmation_and_time_correction
> pending_scope: remaining_edges_listed_in_section_4_4_only
> blocked_by: []
> confirmed_by: user
> confirmed_on: 2026-10-22
> workflow_scope: wash_groom_only
> service_state_values: [not_started, in_progress, completed, cancelled, interrupted]
> service_creation_state: not_started
> pre_service_check_required: true
> service_photo_required: false
> service_photo_positions: [skin, ears, eyes, mouth, nails, coat, full_body]
> service_photo_stages: [before, after]
> service_photo_slot_count: 14
> service_photo_partial_save: allowed
> service_result_publish: on_service_completion
> multi_pet_order_model: one_customer_one_order_independent_pet_service_records
> multi_pet_settlement: together_no_per_pet_split_or_installments
> bulk_complete_all_pets: excluded
> actual_collection_timing: after_completion_or_confirmed_interruption
> unpaid_departure_handling: order_on_hold
> pickup_confirmation: excluded
> actual_service_time_correction: allowed_with_reason_and_audit

适用本轮洗护／美容，独立护理另按§4.5；寄养专用流程、普通商品／寄养加餐不自动使用本节顺序。§3.0.9／03d§10.1调价及免单留痕仍在；实际收费、中止例外与退款角色按§4.4，不新增预付或按宠付款。

| 当前状态 | 已确认动作及结果 |
|---|---|
| 待开始 not_started | 开单后默认状态；完成强制前检查后手动开始进入服务中；未开始可取消，填写原因。 |
| 服务中 in_progress | 手动完成进入已完成；做不下去记已中止，中止说明选填，空说明可成功，不假记完成。 |
| 已完成 completed | 发布普通结果；正常服务完成后可实际收款。未结算可重新处理回服务中，原因选填、操作留痕；已结算不直接重开原单，见§4.4。 |
| 已取消 cancelled | 表示尚未开始即取消，保留原记录；无论是否误点、是否未结算，原服务均不恢复。要开始须重新开单／建立新服务记录，从待开始重新检查办理，不自动退款／免单或改旧状态。 |
| 已中止 interrupted | 表示已开始后中止，中止说明选填，门店保留已发生的操作事实／原记录及时间，顾客端无本次中止过程，不发中止通知，详见§4.4。实际应收与收费原因明确后仍可按原中止例外结算，不改正常完成。原服务不直接恢复，误点也一样；要开始须按§4.4重新开单，从待开始重新走流程。顾客端已取消／已中止统一显示“服务异常，已终止”；底层真实状态仍分开，费用及重新开单规则不变。 |

- 强制前检查按§4.4六项执行，不默认正常，异常／无法检查如实标注并先告知主人；取消尚未开始服务不要求伪造检查，已检查不等于医学安全保证。
- 洗美详情固定提供皮肤、耳道、眼睛、口腔、指甲、毛发、全身七组，每组“洗护前／洗护后”两个上传入口，共14个；全部选填、允许分次保存和后补，无图／缺一侧不阻止完成，不使用占位图冒充已上传。六个检查位置与全身不是七项强制检查：强制检查仍只有前六项，全身只增加照片对比组。复用F-PET-036～041的原服务媒体、before／after、比较组与稳定排序，固定顺序按本句七组排列，不新增同义媒体账本。完成发布普通结果，不等付款、不自动AI；重开后旧普通结果保留历史、当前显示服务中，再次完成可再通知一次，AI权益不自动重置，见§4.4。
- 同顾客多宠一单、逐宠记录与进度，不一键全部完成、不跨顾客并单；一宠完成／取消不改其他宠物。全部服务正常完成或已取消／中止且相应费用明确后可一起结算，不等于自动收款；全未开始即全取消按§4.4零收费取消处理。
- 结算前可增加宠物／项目并校验可用性；不另设项目开始／完成状态，按每宠进度判断删改。宠物待开始时可移除项目并留痕；服务中不直接删已关联项目，误加通过有原因的更正，实际中止保留事实。已结算不改收费原明细；正常已完成后的补照片／普通说明按§4.4允许，不解锁账目；一起结算、不按宠拆账／分次付款，不新增逐宠优惠分摊。
- 洗美正常完成后实际收款，不预收；中止服务按§4.4实际应收／原因办理例外，不按比例自动算、不伪记完成。全未开始即全取消不收费、不记免单成交。结算步骤可改最终应收0，仍须明确确认免单才成功，不自动因保存0结算；不跳过本单结算前置校验，旧款不抹去或自动退款。
- 完成未收款先待结算；店员手动点击挂单后进入挂单列表，挂单原因选填，不自动将所有待结算标为挂单。保留原单／应收，不是付款或取消，不套商品超时。顾客待结算／真实金额、内部备注不公开；付清／明确免单成功自动解除标记、保留历史。入口业务／订单与收银／挂单，不用接走字段触发。
- 本店有效员工均可接手，无开单人专属锁或额外接手审批；每步记录实际操作者，不新增提成；业绩归属仍按§3.0.10原单唯一归属，不因接手或实际操作人变化自动改归属。原审计可见性仍按02§4，普通员工不因经办而取得系统日志访问权。
- 开始／完成默认记录真实操作时间，允许补录／更正实际服务时间，须原因并保留原值和录入／更正时间，不能填未来时间或结束早于开始；不改付款结果、既有真实事实或静默覆盖历史，不借补录自动跳状态。记录版本、当前状态及金额版本共同校验并发／重试，服务重开或改时间不能解锁已结算金额。

### 4.4 已确认：洗美第二批流程细则及剩余问题

> status: mixed
> confirmed_scope: confirmed_partial_refund_allocation_as_03c_section_5_1_and_completed_wash_groom_photo_and_ordinary_text_amendment_and_wash_groom_interruption_optional_explanation_no_customer_process_no_notice_and_approved_wash_groom_batches_and_offline_financial_ledger_with_staff_refunds_and_automatic_asset_updates
> pending_scope: ai_version_contract_hold_reminders_and_remaining_ledger_corrections
> blocked_by: []
> confirmed_by: user
> confirmed_on: 2026-10-22
> reopen_allowed: unsettled_order_only
> reopen_reason_required: false
> all_unstarted_cancelled_charge: none
> completed_wash_groom_amendment: photos_and_ordinary_text_only
> completed_wash_groom_amendment_settlement_scope: settled_and_unsettled
> completed_wash_groom_amendment_actors: [merchant_owner, active_store_staff]
> completed_wash_groom_amendment_approval_required: false
> completed_wash_groom_amendment_reason_required: false
> completed_wash_groom_amendment_customer_display: latest_authorized_content
> completed_wash_groom_amendment_notification: excluded_all_channels
> ai_report_generation_trigger: customer_explicit_choice_with_existing_eligibility
> terminated_restart_confirmed_on: 2026-11-02
> terminated_restart_scope: wash_groom_and_independent_care_only
> cancelled_or_interrupted_restart: new_order_and_new_service_record_required
> cancelled_or_interrupted_restore: excluded_even_for_misclick_and_unsettled_orders
> cancelled_or_interrupted_restore_notice: excluded
> restarted_service_creation_state: not_started
> restarted_service_precheck: new_record_required_by_service_type
> original_termination_history: retain
> interruption_reason_required: false
> interruption_customer_process: excluded
> interruption_notification: excluded_all_channels
> interruption_existing_internal_records: retain
> interrupted_billing: actual_receivable_with_optional_reason
> item_state_model: per_pet_service_state_no_separate_item_lifecycle
> pre_service_check_items: [skin, ears, eyes, mouth, nails, coat]
> service_photo_positions: [skin, ears, eyes, mouth, nails, coat, full_body]
> service_photo_stages: [before, after]
> service_photo_required: false
> pre_service_owner_decision_required: abnormal_or_unable_to_check
> post_service_new_abnormality_confirmation: required
> hold_customer_display: 待结算
> hold_release: automatic_on_successful_settlement
> hold_entry: 业务/订单与收银/挂单
> hold_trigger: staff_manual_after_pending_settlement
> hold_reason_required: false
> zero_price_entry: final_receivable_amount_at_checkout
> zero_price_save_settles_order: false
> zero_price_explicit_confirmation_required: true
> checkout_max_payment_methods: 2
> refund_owner_confirmation_required: false
> payment_refund_cross_business_scope: all_store_consumption_orders
> financial_mode: offline_transaction_ledger
> external_payment_integration: excluded
> financial_entry_timing: immediate_or_after_work
> operational_updates: timely_during_business
> ledger_side_effects: automatic_wallet_ledger_and_applicable_inventory_updates
> refund_roles: [merchant_owner, active_store_staff]
> refund_method_values: original_payment_methods
> refund_default_method: original_payment_methods
> refund_original_method_restriction: required
> refund_auto_restock: false
> wallet_deduction_order: principal_then_bonus
> wallet_refund_component_rule: restore_original_components
> partial_refund_allocation: confirmed
> partial_refund_channel_allocation: manual_original_channel_amounts
> wallet_partial_refund_order: principal_remaining_then_bonus_remaining
> breed_unknown_values_allowed: [混种, 不详]

- **重新处理**：只有尚未结算的订单可将已完成宠物服务重新处理为服务中；原因选填，不能因空原因拒绝，但始终审计操作者、时间、前后版本。重开与本节洗美中止操作说明均选填；取消、调价、退款、项目／时间更正及中止收费的独立原因要求仍按原动作，不把这些条件前置为保存中止状态的必填说明。财务尚未录入不等于真实款项不存在，不能因重开抹去已经发生的线下交易或重复收款。已结算不重开原单，须另开服务或适用更正，不解锁旧金额。
- **中止展示与通知（2026-11-02确认）**：洗护／美容的中止说明选填，空说明不阻止本店有效员工从服务中保存中止，不要求补照片、填写过程或完成前复检来伪造完成。顾客端不提供本次中止的服务过程、过程照片／检查时间轴或普通完成结果，不生成中止报告／AI任务；不能从详情接口、摘要、缩略图或消息反向暴露过程。这里只改变中止后的顾客展示，不删除门店已真实保存的检查、素材或操作历史，也不取消开始服务前原必需检查／异常决定。中止动作不生成站内、微信或短信通知、不显示发送成功；先前合法产生的其他业务消息不删除、不冒充中止通知。仅更新原服务真实状态，不伪填完成时间、已完成、实收或退款，不因不通知跳过状态校验／原租户权限；重试不重复操作。说明沿原用途／权限，填写不代表自动公开；复用F-AUD-009选填说明及原人／时间／前后值，不新增同义原因字段。顾客端已取消／已中止统一显示“服务异常，已终止”；取消／中止后要再开始统一按本节重新开单，原服务不恢复，本轮不把提议的标签自动当已批准；独立护理中止另按§4.5本轮确认，寄养不据此改规则。
- **取消／中止收费**：全部宠物都在开始前取消时不收费、整单取消并留记录，不产生免单成交或收款。已开始后可先保存中止且中止说明选填；办理收费时仍由店员明确本次实际应收和独立收费原因后结算，是正常完成后收款的明确例外；不按比例自动算，不把中止改成完成。多宠其余服务结束、取消／中止费用明确后可一起结算；仍有待开始／服务中或异常费用未明确时不放行，不按宠分次收款。
- **结算零元**：结算步骤将final_receivable_amount改为0，按整单调价留原因／原价／差额／操作者，不改主资料；保存0仍未结算，须明确点击确认免单、服务端校验成功才waived。零元仍遵守本单结算前置条件；真实0收入／无支付／不扣余额及结算后锁定不变。
- **挂单触发／展示／解除**：洗美完成未收款先待结算，由本店有效员工明确点击挂单后进入列表，挂单原因选填，不自动把所有待结算视为挂单。顾客只见待结算／真实金额，不见内部原因／催款备注，不增加线上支付。实际付清或明确免单成功后自动解除当前标记、保留历史；重试不重复业务。入口业务／订单与收银／挂单，无新增底部入口，工作台只承接当天事项；不以接走确认或商品超时决定挂单。
- **六项检查与异常决定**：固定皮肤、耳道、眼睛、口腔、指甲、毛发六项；默认未检查，真实记录未见明显异常、发现异常或无法检查，不将无法检查伪记正常。异常／无法检查先告知主人，由店员记录主人已明确表达的同意继续或决定中止及说明；不能默认同意或自动放行，不增加老板审批、签字／上传照片强制要求，不形成医疗诊断，也不代替跨店共享授权。
- **七组洗护前后照片**：洗美详情按固定顺序展示皮肤、耳道、眼睛、口腔、指甲、毛发、全身；每组分别提供洗护前、洗护后入口，14个入口均非必传，支持分次保存、后补及按§4.4合法补改。照片入口不得默认已有、不以全身照片替代六个位置，也不因缺任一组阻止开始、完成或结算；中止后的对客隐藏仍按本节中止规则。
- **完成前复检**：完成前确认是否出现新增异常；无新增须真实确认，有新增须说明，不再重填完整六项，照片仍选填。非中止服务的前检查结果、复检护理注意事项向本人顾客展示；已中止服务按本节不展示本次过程，内部备注／员工评价／系统日志不公开。未经记录的检查或复检不得用默认正常绕过。
- **取消／中止后重新开始（2026-11-02确认）**：洗护／美容及独立护理一旦已取消或已中止，原服务不允许恢复为待开始、服务中或已完成；误点、未结算、未实际收款／未免单也不例外。需要开始服务时，门店重新开一张订单并建立新的service_record_id，初始not_started，从新单流程重新办理；不得只换页面标签、复用旧单ID／旧服务记录或通过通用恢复接口绕过。原order_id／service_record_id和取消／中止事实、检查／操作历史及原账目保留，不因新开单改写旧记录或复活余宠。
- **新单重新走流程**：本店老板／有效员工按原开单资格选择本店已有顾客／宠物资料，无需重复建顾客／宠物；重新选择当前合法项目，沿新单形成新的检查／主人决定／实际服务记录，不能复制旧检查为新单已检查、自动同意或直接已开始／已完成。洗美仍须六项前检查，独立护理仍按本业务简短前检查，后续手动开始、完成及完成前确认均按原规则。新建单不自动生成开始／完成通知或AI任务；真实新开始／完成后按所属业务原通知规则发送，旧单中止仍不发中止通知，不生成“恢复服务”消息。同宠洗美护理加项仍复用新洗美的原流程，不另造护理消息。
- **新旧账目独立**：旧单维持真实取消／中止和原费用／收款／挂单历史，按已确认原规则处理；新单记录本次新服务及其实际费用，不复制旧收款／退款或自动结清、作废旧单，不自动抵扣／转移旧款、旧券／库存占用。优惠／调价／免单按新单现有结算规则明确办理，不能因重新开单而重复记录同一笔交易或修改已结算旧账。新单创建与开始仍校验当前门店／员工／顾客宠物归属和原请求幂等，重复提交不重复建单／发业务消息；新旧服务与结果版本、已读及AI任务各归原对象，不能把旧完成结果当新单结果。旧单退款／账本更正等未列细节仍受原DEC约束，本项不新增混单或跨单冲正权限。
- **动作边界**：取消／中止后的“恢复原单”和“恢复通知”均不提供；历史方案只用于追溯，不得从旧聊天或档案恢复实现。已完成但未结算的“重新处理”、正常完成后的“补图／普通文字更正”、食品提醒“恢复待知悉”仍各按原已确认规则，不因本条一并取消；寄养、普通商品和预约不自动套用。

- **已完成后补图／普通文字更正（2026-11-02确认）**：仅正常已完成的洗护／美容，可补充真实照片或修改普通服务说明，包含已结算订单；不以重新处理、退回服务中或撤销结算为前提。本店老板／任一有效员工均可，无审批／原经办限制，修改原因选填。保留修改前后内容、媒体关联、实际修改人和服务端时间，顾客默认读取当前有权查看的最新内容，不向顾客开放内部备注或原始审计。范围不包含检查结论、主人异常决定、实际服务时间、项目／收费明细，这些各沿原规则；不能把普通文字更正当作无痕修改既有事实。
- **补改不重做业务**：补图／改普通说明只修改原服务内容，不改变服务已完成、真实完成时间、结算状态／金额、余额／流水／库存，不重开原服务、不造新消费。复用F-SVC-008、F-PET-036～041及F-SVC-019；校验原店／顾客／宠物／服务、当前状态及版本，旧页面不得覆盖别人的新修改，同请求重试不重复素材／审计。此次补改不生成站内／微信／短信通知或新的完成事件，不重复首次完成通知，也不因补图自动改变已读为未读；旧已读仅证明当时查看，不冒充已看过新增内容。F-SVC-023／024继续表达原完成发布／实际查看轮次，不冒充补改内容版本；修改前后内容和历史沿F-SVC-019及F-AUD留存。
- **AI由顾客选择**：生成AI洗护报告由顾客在本人结果页主动选择，沿03§10／03i§5.2～5.4的原授权／有效资格、真实任务与失败重试规则；门店补图／改文字、完成或页面打开都不自动生成／重生成。旧报告及其真实任务保留，不因普通结果更新而覆写成已分析新素材，也不自动重置广告权益。新素材再次分析的版本绑定、任务／报告复用和资格消耗仍待AI契约收口，不把主动选择推导为无限生成、免原资格或允许店员代点；本轮不新增AI报告更新通知。中止仍无过程／无报告／无中止通知，独立护理的对应补改与消息另按§4.5本轮确认，寄养不自动套用。
- **多宠结果与重新发布**：订单按宠物分别显示项目、进度和普通结果，整单统一总金额，不生成逐宠付款入口。重新处理后顾客显示服务中，旧普通结果保留历史但不作为当前最终；再次完成形成新结果版本并可再发送一次完成通知，同一状态转换重试不重复发。AI权益不自动重置，不因重开删旧报告、自动AI或反复要求广告；涉及新素材版本再次分析的资格／复用细节仍按AI原规则及后续契约收口。
- **财务定位与组合记账（全部门店消费订单）**：财务仅作线下交易账本，老板／有效员工可即时或工作结束后录入，实际交易时间与录入时间区分；预约确认、六项检查、服务状态及结果仍及时操作。洗护／美容／护理／寄养／商品同次结算最多两种真实支付方式，按F-PAY-003不同方式计数、合计等于应收；余额内部本金／赠送算一种。一种亦可，本条不授予任意按宠分次付款或商品／服务混合单许可；寄养分批离店分别结算另按§5.2；无实际付款不填拆分。不接外部收银或支付／退款接口，不设计外部通道失败、未知结果或自动退款恢复流程，内部余额／流水仍真实更新且不重复扣增。
- **消费退款无需老板审批**：本店老板和有效员工均可登记退款，原因必填、保留原单／金额／实际经办人／实际退款时间和录入时间。不设置老板审批、拒绝理由或撤回批准。同单最多一份未完成退款录入，完成且仍有可退金额可再登记；不退超过已实收扣除已退的剩余额，不改原实付，免单无款可退。
- **本金先扣／退款原路**：消费使用会员余额先扣本金、不足再扣赠送，分别记录原实际扣款。退款全部按原付款渠道／原账户：钱包退原钱包、本金退本金／赠送退赠送；微信／支付宝退各原付款账户，现金退现金，其他付款按原渠道。不改退另一渠道、不将赠送转本金或余额提现。组合全退按各原渠道剩余实付，部分退款按03c§5.1已定：分别填写各原渠道金额，不超各自原付减已退；仅钱包本次退款系统先退原剩余本金、再退原剩余赠送，合计本次钱包退款，不按比例或用当前余额倒算。
- **退款记账与联动**：外部款项在线下核实并原路退回后登记，系统不接外部退款接口；原余额部分在本次确认时实际入原钱包并形成流水，确认后自动更新订单／流水／适用库存，券依03c§11原退款原则及取消／退款也不恢复核销的规则处理，不能假定结算自动核销。退款不是退货，真实收回且可再次销售才按原SKU登记回库、无需老板逐单审批。不得错充其他顾客、重复入账、超各原渠道已付未退金额或改写服务／投喂事实，按03d§1.1／12；不扩展充值退款、任意改余额或积分补偿。
- **项目／品种**：不另设每个项目的开始／完成状态，以每宠整体进度判断可否直接移除；服务中不直接删已有项，误加走有原因的更正，保留原关联及金额历史。品种确不明确可填混种／不详，仍保留猫／狗／其他类型，不强迫猜测或AI识别；客户端首次建档品种选填不变。

前一批20题及补充已确认规则与本轮明确变更按本节执行，不恢复外部支付通道或退款审批。挂单查询／人工联系及误挂撤销按§4.6已确认，终止顾客提示“服务异常，已终止”已定；商品退款不自动回库及真实退货联动仅按已确认范围。其他未列状态更正、除§4.5同宠洗美护理加项外的未决混合业务、AI版本契约和其余账本更正仍待对应DEC；部分退款分配按03c§5.1已定，不以默认值或Mock绕过，不宣称整端已就绪。

**终止结果文案（2026-11-05）**：顾客端已取消或已中止的服务结果均提示“服务异常，已终止”。这是页面结果提示，不是新增通知；未开始取消与开始后中止仍保存不同真实状态，收费、历史、无中止过程／照片／AI、重新开始必须新开单等原规则不变。仍在处理中但出现待处理异常的服务，不能提前显示已终止；普通预约／商品取消和寄养离店不套用此服务终止文案。

服务结果纠错仅允许正常完成后补照片或修改普通说明，并保留旧内容和自动审计。除这两类外，项目、状态、检查结论、服务结果或其他业务事实填错，一律不得覆盖原服务；必须重新开单，原记录保留。顾客端取消／中止仍提示“服务异常，已终止”，要重新开始同样必须新开单。

### 4.4.1 全部门店消费订单部分退款分配

> status: confirmed
> status_scope: partial_refund_allocation_for_all_store_consumption_orders
> confirmed_by: user
> confirmed_on: 2026-11-05
> canonical_rule_source: 03c_section_5_1
> partial_refund_channel_allocation: manual_original_channel_amounts
> wallet_partial_refund_order: principal_remaining_then_bonus_remaining

原退款录入由本店老板／有效员工填写各原付款渠道本次退多少，无老板审批；合计等于本次退款，各项不超过原付款扣除已确认退款的剩余额，不能另选未实际用过的渠道或账户。钱包本次退款系统先恢复本单原扣未退本金、不足再恢复原扣未退赠送，不按原支付比例或当前余额算，不允许手改赠送为本金；多次退款不重置原额度。完整算法、例子、确认／并发和字段只读03c§5.1。

退款原因必填，只有真实确认的退款在原订单归属员工及实际退款日期的业绩中作减项，最终业绩为实收减退款，实收原记录及归属保持，不扣给退款经办人。外部原路退款线下进行，钱包确认时真实入账，草稿不算已退，失败不半加款，重试／并发不重复或超退。充值退还必须从原充值记录发起充值退款，不提供“修改余额”。

### 4.5 已确认：护理开单12项轻量流程

> status: confirmed
> status_scope: care_twelve_item_workflow_only
> confirmed_by: user
> confirmed_on: 2026-10-22
> care_create_entry: 工作台/临时开单或会员开单/护理
> care_record_entry: 业务/订单与收银
> care_workbench_service_group: 服务中/其他服务
> care_workbench_exception_group: 异常与临期/其他异常
> care_customer_booking: disabled
> care_wash_groom_nav: excluded
> care_wash_groom_add_on: same_pet_same_order_shared_service_progress
> care_state_values: [not_started, in_progress, completed, cancelled, interrupted]
> care_creation_state: not_started
> care_state_changes: staff_manual
> care_precheck_required: true
> care_precheck_model: overall_observation_not_six_item_form
> care_precheck_owner_decision: abnormal_or_unable_to_check
> care_postcheck_new_abnormality: required
> care_photo_required: false
> care_routine_note_required: false
> care_result_publish: on_service_completion
> care_ai_report: excluded
> care_multi_pet_order: one_customer_one_order_independent_pet_service_records
> care_settlement: together_after_completion_or_confirmed_interruption
> care_all_unstarted_cancelled_charge: none
> care_interrupted_billing: actual_receivable_with_optional_reason
> care_reopen_allowed: unsettled_order_only
> care_reopen_reason_required: false
> care_notice_rules_confirmed_on: 2026-11-02
> care_start_notice: ordinary_notification
> care_completion_and_recompletion_notice: important_notification
> care_completed_amendment_notice: ordinary_notification
> care_notice_channels: in_app_and_attempt_authorized_available_wechat
> care_interruption_reason_required: false
> care_interruption_customer_process: excluded
> care_interruption_notice: excluded_all_channels
> care_completed_amendment: photos_and_ordinary_text_settled_and_unsettled
> care_completed_amendment_actors: [merchant_owner, active_store_staff]
> care_completed_amendment_approval_required: false
> care_completed_amendment_reason_required: false

本节12项包含2026-11-02确认的护理通知、中止和完成后补改补充，复用本店老板／有效员工资格、§4.1基础资料及原Customer／Pet／订单／服务记录，不新增角色、底栏、预约类型或另一套账本。独立护理是service_type=care；洗美中的护理项目是原洗美服务加项，不因此把原服务改成care。

1. **入口**：工作台“临时开单”或“会员开单”选择护理后进入本流程，不强制顾客先预约或注册；两种入口的顾客资料差异按§3.2／§4.1，不新增底部菜单，“洗美”仍专指洗护／美容。护理项目仍由老板按§3.0.8维护，员工只选本店合法可用项目。
2. **工作台与历史**：当天进行中的独立护理归“服务中 → 其他服务”，护理异常归“异常与临期 → 其他异常”；两处带入同一原单／宠物服务记录，不复制护理待办或凭已读关闭异常。完整护理订单和历史从“业务 → 订单与收银”查询；跨天仍需处理时按§3.2保留，不把历史全塞工作台。
3. **洗美加护理的有限例外**：同只宠物在洗美中增加护理项目，挂原单、共用该宠物服务进度，不再创建第二条独立护理流程或另收一笔。它仍遵守洗美六项前检查、复检和原单结算规则，不以简短护理前检查替代。此项只确认同宠洗美加护理，不开放商品／寄养混单、跨顾客合单或本期禁止的其他跨业务混结；已结算原单不借加项改历史。
4. **独立护理五态**：新建not_started，店员手动开始为in_progress，手动完成为completed；未开始取消为cancelled，开始后无法继续为interrupted，不把中止记完成。服务端校验本店对象、当前状态及记录版本，保留实际操作者／时间，重试不重复产生业务；不因开单、付款或页面进入自动开始／完成；真实开始成功后生成一次普通通知，正常完成成功后生成一次重要通知，明细按本节末尾。
5. **简短强制前检查**：开始前必须真实选择“未见明显异常／发现异常／无法检查”之一，默认未检查，不预填正常；后两项须说明，记录告知宠物主人后其明确的继续／中止决定，不默认同意；主人未同意继续不得开始，决定不做时保留真实取消结果，不假装已开始。未检查或必要说明／主人决定缺失不能开始；取消尚未开始服务不要求伪造检查。不强制填写完整洗美六项表，不作医学诊断，也不代替共享授权。
6. **照片、说明和普通过程备注**：均选填，缺照片、说明或普通备注不阻止完成；正常已完成后（含已结算）可补图／改普通说明，详见本节末尾，不伪造素材。只有退款、充值退款和免单的“原因”必填，护理异常、无法检查、中止、调价等原因／说明均选填；系统仍自动记录状态和前后值。
7. **完成前确认**：必须真实确认有无新增异常；无新增可直接确认，有新增必须说明，不再重复整套前检查，照片仍选填。不能用自动填false或收款代替完成确认。
8. **顾客查看**：完成后即发布本宠普通护理结果，顾客可从同一服务订单／宠物服务记录查看项目、真实结果及护理注意事项，不等财务记账。没有照片／普通过程文字如实展示，不编造“正常”；内部备注／员工评价／原始审计不公开。不新增护理AI报告或广告解锁任务，也不把本节当作已确认跨店共享范围。
9. **多宠**：同一顾客可一单多宠，每宠独立service_record_id／pet_id、项目和进度；一宠完成／取消不覆盖其他宠物，最后一起结算，不跨顾客合单或按宠分次收款。与洗美／商品／寄养的其他组合仍按第3项及未决边界，不扩大为任意混单。
10. **收款时点**：正常护理完成后才收款，不预收；财务按03d§1.1只记账，可即时或工作结束后录入，不接在线支付。多宠均结束且取消／中止费用明确后一起结算；未记账如实保留服务已完成与未结算，不提前写已付。原整单调价、明确免单、最多两种支付、先本金后赠送、无老板审批且原路退款等统一规则不变，部分退款算法统一按03c§5.1，不另定护理例外；护理挂单／人工联系按§4.6已确认。
11. **取消与中止**：全部宠物均未开始就取消时不收费、保留取消记录，不伪造免单成交。已开始后中止的操作说明选填，空说明允许保存，不强制过程／补图或完成前复检；顾客无本次中止过程／过程照片或检查时间轴，不发布普通完成结果，站内／微信／短信均不发中止消息，店内既有真实检查／素材和操作历史保留。开始前必要检查／异常主人决定不免除，不假记完成或实收；如收费仍由店员明确实际应收及独立收费原因后结算，不自动按比例计算，也不假记完成；费用明确且同单其余服务结束后可按中止例外结算。中止不是自动退款、冲正或库存回退。
12. **重新处理**：已完成且尚未结算的护理可重新处理回服务中，原因选填但必须留操作记录；已结算不得重开原单或解锁历史金额。旧结果保留历史、当前不再冒充最终完成结果，再次完成后发布真实当前结果、形成新完成事件并生成一次重要通知，仍须完成前新增异常确认；取消／中止后不恢复原服务，要开始须按§4.4重新开单／新服务记录，重新检查和手动开始，误点也不例外。

**正常完成后的补图／普通文字更正**：本店老板／任一有效员工均可办理，包含已结算，无审批或原经办限制，原因选填。保留前后内容／原媒体关联、实际修改人和服务端时间，顾客默认最新有权内容，内部备注／原始审计不公开。仅限普通说明和补充真实照片，不含检查结论、主人异常决定、实际服务时间或收费明细；这些继续按原规则。补改不重开、不解锁账目、不改完成／结算状态及时间、余额／流水／库存，不新增护理AI。原F-SVC-008、F-PET-036～041、F-SVC-019及F-AUD复用，旧页面不得覆盖新修改，重试不重复素材或历史。

**独立护理消息**：护理真实开始发送普通通知，正常完成／重新完成发送重要通知；完成后补图或修改普通说明均不发送站内、微信或短信通知。草稿、打开页面、无内容变化、失败请求和重试不发消息。中止护理不发送消息。洗美补图／改普通说明同样不通知。

护理前检查复用F-SVC-016～019／021，完成前确认复用F-SVC-022，普通结果／版本复用F-SVC-008／023～024；六项F-SVC-020仍只用于洗美，不为护理再造同义检查字段。护理挂单／人工联系及撤销按§4.6；护理开始发送普通通知，完成／再次完成发送重要通知，正常完成后补图／改普通文字不通知；取消／中止后按§4.4新开单，本期不新增其他服务结果纠错流程。洗美终止提示、部分退款分配分别按本节和03c§5.1；未登记AI技术契约不得由实现猜测。

### 4.6 已确认：挂单查询、补记收款与误挂撤销

> status: confirmed
> status_scope: held_consumption_order_query_collection_and_manual_revocation_only
> confirmed_by: user
> confirmed_on: 2026-10-24
> hold_business_scope: [wash_groom, care, boarding]
> hold_entry: 业务/订单与收银/挂单
> hold_trigger: staff_manual_after_business_completion_and_receivable_confirmed
> hold_reason_required: false
> hold_cross_day_visibility: retain_until_cleared_in_business_list
> hold_workbench_history: no_daily_reinsertion_of_historical_debt
> hold_default_sort: order_held_at_ascending
> hold_filters: business_type_and_active_or_cleared
> hold_search: customer_contact_or_pet_nickname_or_order_number_within_current_merchant
> hold_boarding_scope: original_checkout_batch_only
> hold_collection_channel: store_manual_contact_system_records_only
> hold_automatic_collection_notice: excluded_sms_and_wechat
> hold_cross_day_effect: no_late_fee_or_auto_order_cancellation
> hold_collection_note_required: false
> hold_partial_repayment: excluded
> hold_checkout_max_payment_methods: 2
> hold_auto_release: actual_full_collection_or_explicit_waiver
> hold_manual_revocation: allowed_while_active_and_unsettled
> hold_revocation_effect: pending_settlement_preserve_receivable_order_and_history
> hold_internal_notes_visibility: current_store_only_not_customer_or_cross_store
> hold_business_state_effect: none_no_service_reopen_or_boarding_reactivation
> hold_concurrency: original_scope_state_version_and_idempotency

1. **护理可手动挂单**：独立护理完成或中止、同单服务结束且实际费用明确后，尚未收款可按洗美方式主动挂单，原因选填；默认仍待结算，不自动把未付款都设为挂单。本节统一洗美／护理／寄养已确认范围，不放开商品挂单、预收未完成服务或其他禁止的跨业务混结。老板／本店有效员工按原业务资格操作，无老板审批。
2. **跨天在业务中持续查询**：“业务 → 订单与收银 → 挂单”保留本店未解除记录，跨日不会消失、自动结清或自动重新计费。历史欠款不每天重复放入工作台，工作台仍专注当天实际事项，不改变其他跨天仍需实际执行的服务／异常处理规则。付清／免单或合法撤销标记后，历史仍可查询。
3. **列表排序和筛选**：默认按挂单时间F-ORD-035从早到晚，支持洗美／护理／寄养及未解除／已解除筛选。“已解除”只含确实挂过单的历史，不把从未挂过单的所有订单混入；已解除不等于已收款，须同时显示真实待结算／收款／免单结果。重复挂单等历史由原审计保留，不无痕覆盖。
4. **查找和寄养分批**：可按本店顾客联系方式（手机号／微信号）、宠物昵称或订单号搜索，不跨店探测。寄养按原结算批次及相应明细展示，补收只处理原本批费用；其他仍在住宠物不因同客欠款被合并、预收、结束或重新计费，不新建第二账本。
5. **人工联系，不自动催款**：门店自行电话／微信等联系顾客，系统只记录真实沟通，不接入自动催款短信、微信消息／定时提醒任务。本轮不因跨天自动加滞纳金、利息或取消订单，不套商品未付款超时取消规则，投诉等其他业务短信当前也按03f§13.2暂未开放，不能据此发送。
6. **联系备注选填**：可选记联系时间、沟通情况与顾客答复，属于本店内部备注，不向顾客或其他门店公开；空备注不阻止合法查询、撤销或收款。联系实际时间与备注录入时间／人分开，不以保存备注或顾客承诺代替实际收款。挂单原因同样选填，记录及系统审计权限保持。
7. **原批次一次记清，不新增分期**：每个原结算批次按当前合法最终应收核对全额实际收款后确认，仍最多两种支付方式、会员余额内部本金／赠送算一种。暂不增加分期或分几次还款，不以不足额付款标记原批已付；不能因晚记账／补记再生成新寄养、第二笔相同收款或重复收入。最终应收调整、明确免单、实际交易时间、先本金后赠送及财务锁定沿原规则，未实际收款／明确免单不伪造已结算；成功后自动解除挂单并留历史。
8. **误挂可撤销标记**：本店老板／有效员工可对仍在挂单且未结算的原记录撤销挂单标记，回到待结算，保留原挂单原因、挂单及撤销操作／时间／前后状态；不要求新增老板审批或撤销原因必填。只移除挂单标记，不删订单、不改应收、不生成付款／免单、不解除欠款，不重新打开已完成服务或将已离店寄养恢复在住。实际收款／免单、撤销、调价并发须校验原范围、当前状态和金额版本；收款／免单已先成功的旧撤销请求不得改回未付款或覆盖历史，重试不重复动作。

原F-ORD-034／035承接当前标记／挂单时间，原F-AUD记录挂单、撤销、解除前后值／人／时间／幂等；补充联系备注和实际联系时间的唯一字段见FIELD-REGISTRY§12。业务历史摘要依原工作记录权限提供，不授予员工读取原始系统审计日志的新权限。未确认的服务状态联动、已结算更正等仍待对应DEC；部分退款按03c§5.1已定，不因本节确认恢复删除订单或任意冲正。

## 5. 寄养入住、照护与离店结算（已确认范围及剩余边界）

### 5.1 已确认：寄养16项及统一照护录入

> status: confirmed
> status_scope: boarding_admission_and_basic_care_sixteen_rules_only
> confirmed_by: user
> confirmed_on: 2026-10-23
> boarding_admission_trigger: staff_confirm_after_actual_arrival
> boarding_check_in_time_required: true
> boarding_expected_checkout_time_required: true
> boarding_expected_checkout_validation: later_than_check_in
> boarding_multi_pet_model: independent_boarding_records_per_pet
> boarding_multi_pet_combined_settlement: allowed_same_merchant_same_customer
> boarding_duplicate_active_stay: blocked_same_merchant_same_pet
> boarding_location_required: false
> boarding_location_model: free_text_no_room_booking
> boarding_location_duplicate_policy: warn_not_block
> boarding_admission_check_required: true
> boarding_admission_check_model: overall_observation_not_six_item_form
> boarding_profile_edit_default: current_stay_only
> boarding_profile_archive_sync: explicit_action_and_existing_field_permissions
> boarding_diet_confirmation_required: true
> boarding_unknown_diet_handling: mark_unverified_no_safe_or_allowed_default
> boarding_belongings_required: false
> boarding_care_record_entry: single_form
> boarding_care_action_values: [feeding, walking, cleaning, other]
> boarding_care_action_labels: [喂食, 遛狗, 清扫笼子, 其他]
> boarding_care_action_selection: single
> boarding_care_record_steps: [action, occurred_at, optional_note, optional_photos, confirm]
> boarding_care_time_policy: explicit_actual_occurred_at
> boarding_care_photo_required: false
> boarding_care_batch_completion: excluded
> boarding_daily_media_quota: excluded
> boarding_event_visibility: independent_of_notify_customer
> boarding_abnormal_close: staff_confirms_actual_handling_with_result
> boarding_checkout_due_policy: remind_only_no_auto_end_renew_or_fee
> boarding_billing_and_collection: confirmed_in_section_5_2
> boarding_actual_checkout: confirmed_with_checkout_receivable_independent_of_payment
> boarding_vaccination_admission: confirmed_in_section_5_4_materials_and_manual_decision_only
> boarding_special_care_execution: confirmed_in_section_5_4_special_care_including_medication
> boarding_shift_handover: pending

只确认本轮16项，第11项以用户补充的统一录入为准。沿用“业务 → 寄养”、工作台“寄养入住／在住寄养／寄养异常”及原Customer／Pet／boarding_id，老板与有效员工按本店业务资格办理。预约不等于入住、付款不等于投喂；本节只定义入住与照护，计费／收款另按§5.2，离店交付等剩余操作按§5.3。

1. **预约转入住**：宠物实际到店后，员工选择原预约、核对本次宠物与资料并明确确认入住；关联原预约／Pet，不重复创建独立入住，不因预约时间到自动入住。未到店仍是预约，检查／资料未完成不能伪记寄养中。
2. **入住时间**：实际入住时间、预计离店时间必填，实际入住默认当前时间，预计离店必须晚于实际入住；修改保留原值、操作者和录入时间，不用计划时间冒充实际到店，不以改预计时间自动续住或计费。
3. **多宠**：同客可一次添加多宠，每只独立boarding_id、Pet、入住／预计离店时间和位置，不用一只的状态覆盖另一只；本店同一顾客多宠允许按§5.2一起结算，每只独立日价与实际晚数，不因合并结算合并宠物或照护进度。
4. **重复入住**：本Merchant同一真实pet_id已有未结束的有效寄养时，不再建立第二笔有效入住；先核对原记录。重复提交返回原结果，并发确认同宠只能产生一笔有效入住；不以昵称去重、合并Pet或跨店查询私有记录。
5. **位置**：选填简单文字，如A01笼位、客厅散养，不做房型／房价／房间预订系统，不强制建立笼位库存或套用商品SKU。
6. **位置重复**：同店相同位置已有在住宠物时提醒、不硬性阻断，可用于同主人宠物共同安置；建议最大寄养容量仍按03a§7只提醒，不因本节新增硬容量拦截。
7. **入住检查**：必须真实记录未见明显异常／发现异常／无法检查之一，默认未检查；后两项须说明，记录与宠物主人沟通后门店接收或不接收的真实决定。不强填洗美六项，不作医学检查；必要记录未完成不得确认入住，不接收不能生成有效寄养。疫苗资料非强制／缺失不自动拒绝及人工接收按§5.4，不默认已完成疫苗。
8. **本次资料**：长期寄养资料带入本次快照，临时修改只影响此次；只有明确选择“同步宠物档案”且当前员工对该字段有维护权限，才更新相应长期字段，保留同步前后记录。不能改写其他寄养历史，也不借同步修改主人专属的当前食品品牌、跨店授权或平台品牌主资料。
9. **饮食确认**：入住核对粮食来源、每日餐数、过敏／忌口和额外零食授权。未知如实标待核实，不填假餐数、不默认无过敏／无忌口或允许零食。当前寄养加餐读取本次有效资料及最新必要限制；额外零食授权未核实不能按允许处理，不因长期档案旧值或本次未回写而绕过本次限制。
10. **随带物品**：可选文字／照片记录自带粮、食盆、牵引绳、玩具等，不强制逐件建档，不自动创建商品库存／收费项目。
11. **四类照护记录**：每次先选当前宠物／寄养，使用同一个录入表单，按“选择一个动作 → 选择实际发生时间 → 上传照片（选填）→ 确认保存”。四个按钮固定为喂食、遛狗、清扫笼子、其他，复用F-BOARD-008的feeding／walking／cleaning，不建三套表单或另一套护理业务；每条都可选填一句简短说明，选择“其他”时也不强制说明。时间必填且须确认是实际发生时间，不用系统录入时间代填历史执行、不记录未来已完成事项。确认后只生成本宠本次一条真实照护记录及对应可见动态，重试不重复；不能由选项、照片或模板自动推断已完成全天照护。
12. **逐宠录入**：V1逐只记录，不做一键全部喂食／全部照护完成，不把同一照片自动套给其他宠物，不批量伪造执行事实。
13. **照片与频率**：照护照片选填，保留上传步骤但不上传也可保存；普通图片／视频动态也不设置每天必须几张或几条。无图不阻止记录真实照护，不填占位图或伪造时间。发生时间与系统录入时间分离，补录按真实发生时间插回时间轴。
14. **可见性与通知**：顾客可见动态与本店内部备注明确区分，记录所属入口／表单明确其可见范围；不从通知勾选推断公开或私有。关闭“通知顾客”只是不主动提醒，不隐藏原本顾客可见动态；内部记录不进入顾客时间轴、数量、缩略图或消息，不因勾选通知泄露。通知失败不回滚真实记录，也不把已读当处理完成。
15. **异常处理**：异常进入工作台寄养异常，关联原宠物／寄养／异常记录。有效员工实际处理后填写处理结果，再明确标记已处理；处理人／时间／前后状态留痕。顾客已读、消息发送成功、普通照护保存或跨天都不自动关闭异常，不把本条当作已确认医疗处置／异常升级规则。
16. **到期提醒**：到预计离店时间仍未离店，只提醒核对，保持真实在住状态；不自动结束、续住、加费、退款或确认已接走。计费／延期与提前离店按§5.2实际时间计算，离店交付等其余操作按§5.3，不能用预计离店到点推导真实执行。

寄养日常照护时间轴的类型统一简化为喂食、遛狗、清扫笼子、其他四种；饮水、排泄、玩耍、特殊照护、代喂药、代接、送医等需要登记时归入“其他”并用选填说明／照片补充，异常工作台仍按§5.1第15项单独处理；不据此新增其他快捷入口或医疗流程。加餐商品按普通销售，需要记录喂食时从此表单另记真实照护，不创建销售／扣库存／扣余额；不要求先有商品单或先收款，商品提交／结算不自动写动态，不保留独立投喂执行确认。

### 5.2 已确认：入住定价、过夜计费、离店与挂单

> status: confirmed
> status_scope: boarding_pricing_corrections_checkout_departure_and_basic_hold_rules_only
> confirmed_by: user
> confirmed_on: 2026-10-24
> boarding_billing_unit: overnight
> boarding_billing_timezone: Asia/Shanghai
> boarding_billing_cutoff: 03:00:00
> boarding_billing_interval: check_in_exclusive_actual_checkout_inclusive
> boarding_billable_days: count_daily_cutoffs_in_actual_stay
> boarding_no_overnight_fee: zero
> boarding_collection_timing: at_or_after_actual_departure_no_prepayment
> boarding_extension_early_departure: recalculate_from_actual_stay
> boarding_expected_time_billing_effect: none
> boarding_billing_auto_charge: excluded
> boarding_daily_rate_set_by: [merchant_owner, active_store_staff]
> boarding_daily_rate_set_at: admission
> boarding_daily_rate_scope: current_pet_current_stay
> boarding_daily_rate_required: true
> boarding_daily_rate_field: F-ORD-008
> boarding_daily_rate_validation: positive_money
> boarding_rate_correction_before_checkout: allowed_same_store_owner_and_active_staff_without_approval
> boarding_rate_correction_effect: reprice_entire_current_stay_preserve_before_after_actor_time
> boarding_segmented_pricing: excluded
> boarding_store_price_change_effect: no_automatic_change_to_current_stay
> boarding_zero_daily_rate: excluded_use_final_zero_explicit_waiver
> boarding_departed_unpaid_adjustment: settlement_time_reconfirmation_recalculates_nights_other_adjustments_final_receivable_only
> boarding_settled_direct_edit: forbidden_paid_or_waived
> boarding_rate_correction_version: reuse_order_amount_version
> boarding_pet_base_amount: own_daily_rate_times_own_billable_nights
> boarding_combined_settlement: allowed_same_merchant_same_customer
> boarding_combined_amount: sum_selected_boarding_item_base_amounts_before_existing_discounts_adjustments
> boarding_partial_departure_settlement: separate_at_each_actual_departure
> boarding_settlement_items: current_departing_unconfirmed_items_then_original_unpaid_batch
> boarding_remaining_pets: keep_boarding_unsettled_without_prepayment
> boarding_departure_trigger: confirm_current_checkout_receivable
> boarding_separate_departure_confirmation: excluded
> boarding_checkout_payment_dependency: none
> boarding_actual_checkout_default: current_server_time
> boarding_actual_checkout_edit: actual_past_time_with_previous_values_and_audit
> boarding_settlement_time_confirmation: explicit_separate_check_in_and_checkout_block
> boarding_settlement_time_correction: allowed_before_payment_or_waiver_recalculate_preserve_history
> boarding_special_pickup_and_medical_flow: daily_care_record_only_no_separate_workflow
> boarding_actual_checkout_validation: check_in_lte_actual_checkout_lte_server_now
> boarding_billing_stop: actual_checkout_at_even_if_unpaid
> boarding_unpaid_departure_state: departed_pending_settlement
> boarding_hold_trigger: staff_manual_after_checkout_receivable_confirmed
> boarding_hold_reason_required: false
> boarding_hold_auto_release: paid_or_explicit_waiver
> boarding_belongings_checkout: show_recorded_items_no_mandatory_checks_photos_or_signature

1. **按过夜而非24小时或自然日计费**：北京时间（F-CORE-009，Asia/Shanghai）每天凌晨03:00:00为唯一截点。以实际入住check_in_at和实际离店actual_checkout_at计算：统计满足`check_in_at < 当日03:00:00 <= actual_checkout_at`的截点数量，每个计一晚、收一天寄养费。服务端计算，不能按手机时区、跨午夜次数、当前“第几天”、预约计划或预计离店时间收费，也不按实际小时数除24向上取整。
2. **两个边界**：未经过任何截点为0晚、不收寄养费；恰好03:00入住不立即计一晚，恰好03:00离店计入刚经过的截点。不另设最低一天、半天／小时费或未过夜保底费。此处为寄养本身费用，不能据此免除另有真实商品／加项的费用，亦不批准商品与寄养混单。
3. **费用确认与收款分开**：在本批订单结算流程中核对费用及实际离店时间，确认本批应收的同一操作即记录本批宠物已离店，不另设确认离店／确认接走或顾客线上签字步骤，不要求先付清。实际收款可以当时或之后办理，不预收未离店宠物；actual_checkout_at是计费终点，不以费用确认时间、收款时间或系统录入时间代替。线下真实交易仍按03d§1.1即时或工作结束后记账，未录收款／明确免单不得伪造财务已结算、扣余额或记实收。仅打开结算页／试算／保存未确认草稿不产生离店。
4. **延期／提前离店**：均只按真实入住至实际离店重新计算，不按原预约／预计天数锁定费用，不自动附加延期罚金或提前离店违约金。预计到点仍只提醒；跨03:00会影响最终实际天数，但不触发自动续住、扣余额、资金流水或已结算。每宠日价按第6项在入住时设置，其他独立收费项目未在本轮确定，不能据“按实际时间”自行设置小时费、罚金或折扣公式。
5. **零晚与财务边界**：0晚不收寄养费，不生成虚假付款。若本单最终应收确为0，仍按03d§10.1明确“确认免单”完成零元结算，不能因跨点数为0自动waived或关闭寄养。人工调价、两种支付上限、先本金后赠送及退款原路的统一规则保持；提前离店不自动生成退款，对已记账历史的更正、退款金额及部分分配仍待原DEC。实际离店与财务收款是不同事实，离店由本节第10～13项的订单应收确认触发，欠款不阻止真实离店；代接／送医等按每日照护记录登记，结算核对入住离店时间可改，已结算历史保持原规则。

6. **入住时逐宠设置日价**：本店有效员工或老板在办理寄养入住时，为每只宠物填写本次寄养每天价格，允许不同宠物价格不同。日价必须明确填写、大于0并随该宠本次寄养计费明细保存，复用F-ORD-008；不能遗漏、用0冒充未填、强制统一价，不能按品种／体型／Pet长期属性自动推断价格，也不要求先由老板维护房型／SKU／价格表或逐单审批。本次价格不自动覆盖该宠历史寄养、同客其他宠物、其他门店或成为宠物永久固定价格。入住后更正日价按第14～18项；结算前整单最终应收仍可按03d§10.1调价，与日价更正分别留痕。
7. **逐宠算再合计**：每只寄养基础费用＝该宠本次日价×该宠实际计费晚数。按原order_item_id关联boarding_id／pet_id，日价复用F-ORD-008、计费晚数F-BOARD-029、基础明细金额F-ORD-009；服务端精确计算，不按最贵宠物、平均价或统一离店时间覆盖其他宠物。0晚基础寄养费为0，既有优惠／调价／明确免单规则继续有效，基础金额不冒充最终应收或实收。
8. **允许多宠一起结算**：同Merchant、同Customer的多只宠物寄养可一起核算并一次结算，不要求每宠单独收款；逐宠明细保留各自真实入住／离店、日价、晚数和基础金额，再汇总F-ORD-010，并按原规则形成最终应收与真实支付／免单。复用正式订单／明细和付款能力，不新增第二结算账本，不把一只宠物的付款重复记到每宠收入，不把同手机号的不同Customer或跨店记录直接合并；本次不开放与洗美／商品／加餐混合结算。合并结算不等于所有宠物已离店，也不允许以付款为由批量完成照护。分批接走时按第9项分别结算；寄养挂单按第12项，已结算记录再合并、单宠退款分摊仍待§5.3，不借合并许可预收未离店宠物。

9. **分批接走分别结算**：同客多宠分批离店时，每批按本批实际离店的宠物分别结算，不等最后一只离店后统一付款，不要求所有宠物同时结束。每宠仍按自己的入住／真实离店、日价和03:00截点计数，不能用第一批／最后一批时间覆盖其他宠物；同一批同时离店的多宠仍可按第8项一起结算。只选本批真实接走、尚未确认过离店费用的寄养明细，按原order_id／order_item_id／boarding_id关联本批费用快照及后续付款或免单；已离店未收款从原待结算／挂单继续收款，不再次办理离店或重复计算一段寄养；未离店宠物保持真实在住和未结算，不预收，不被一起关闭或标已付。已结算明细不再纳入后续批次、不复制重收费；本批最终应收／调价与最多两种支付按本批有效结算范围应用，不能把包含其他在住宠物的总单直接标全部已结算。此为寄养分批离店规则，不解除洗美／独立护理既有“不按宠分次付款”约束，不批准任意拆分单只宠物的一次费用；寄养欠款／挂单按第11／12项，已结算更正仍待§5.3。

10. **订单结算即离店的唯一含义**：本店老板／有效员工在本批结算页核对实际接走宠物、真实离店时间和本批应收，明确确认本次应收后，由服务端同次操作保存本批费用快照并将相应寄养记为已离店。该操作就是结算流程中的离店动作，不再要求另点办理离店／确认接走，不要求主人线上确认、签字或先付款。费用确认使用F-BOARD-030记录系统确认时间，人／原值／本批范围及变更复用审计；它不是actual_checkout_at或F-ORD-023财务settled_at。重复／并发同一操作只确认一次，不覆盖其他宠物；只打开页面、试算或未确认草稿不离店。实际未接走时不得因提前算钱／预付款伪记离店。
11. **真实时间与已离店未收款**：实际离店时间默认服务端当前时间，店员可填写真实过去时间；服务端校验不早于实际入住、不晚于当前时间，修改保留原值、经办人和录入时间，不用预计时间或收款时间代填。确认本批费用后，即使尚未收款也显示已离店／待结算，停止在住展示与继续计费；剩余欠款只是财务待办，不保持寄养中、不阻止同宠后续真实新入住。后续跨03:00、挂单天数或晚记账均不增加本次寄养晚数／费用，不自动利息或催款费。后续收款只处理原本批应收／真实交易，不重建寄养、不重写真实离店时间或重复计费；尚未收款／免单的原批时间填错按第17项在结算页核对修正，已结算不由本条开放时间改账。
12. **手动挂单与解除**：已离店尚未收款先保留待结算，不自动将全部待结算设为挂单；本店老板／有效员工主动点击挂单后才进入“业务 → 订单与收银 → 挂单”，挂单原因选填。顾客看到已离店／待结算及真实应收，不展示内部挂单原因／催款备注，不新增客户端在线支付。挂单保留原寄养、费用及实际离店，无老板审批，不因挂单／跨天恢复在住。原本批实际付清或明确免单成功后，自动解除当前挂单标记、保留历史；收款仍按最多两种支付、先本金后赠送、线下账本及防重复规则，未实际收款不生成实收／资金流水或扣余额。挂单查询／人工联系及撤销按§4.6；结算后金额错误只走补收或退款，不照搬商品未收款超时取消消费。
13. **随带物品交还提醒**：结算页展示本次入住登记的随带物品，提醒交还；无登记显示未登记，不伪造物品。无需逐件强制勾选、照片、顾客签名或第二个确认接走步骤，发现遗漏可备注并留原寄养关联，不因欠款隐藏提醒。此项不批准新物品库存、赔偿或特殊责任转移政策。

14. **离店确认前可更正日价**：入住后、尚未按第10项确认本宠离店费用时，本店老板及有效员工均可更正该宠本次日价，无需老板审批。更正后的日价须大于0，遵守Money精度校验；服务端以更正后单一日价重算整次寄养基础费用，保留每次修改前后价格、操作人和服务端时间，不无痕覆盖入住时的价格。复用F-ORD-008／009／010、F-ORD-032金额版本及原审计字段；日价更正与最终应收调整分别记录，不新增同义日价字段。离店确认／收款／免单与改价竞态须校验同一当前版本，旧金额须重新核对，不能绕过已离店或已结算锁定。
15. **一次寄养一个日价**：本次不做按日期／阶段分段计价。第14项更正后的价格适用于整次寄养，不仅适用于更正后的晚数；门店中途涨价不自动影响已入住记录，协商优惠仍可在结算时调整最终应收，不据此新增房型、旺季价表或复杂套餐。
16. **日价不可为0，免费在结算办理**：入住及更正日价均须大于0。免费寄养沿用03d§10.1：将本批最终应收调整为0后明确点击“确认免单”，保留原日价、实际晚数、基础金额与调价记录；不得以日价0、未填默认0或仅输入最终0代替免单。不跨03:00为0晚、寄养基础费0仍合法，不因日价大于0收取最低一晚；最终0应收仍须明确免单，不造付款或扣余额。
17. **结算页单独核对时间，填错可改**：本批结算页单独列出每宠实际入住和实际离店时间，本店老板／有效员工明确核对两项；错误可在该处修正，再由服务端按03:00规则重算本宠晚数／基础金额及本批应收，并重新确认当前费用。此规则也适用于已离店但尚未收款／免单的原待结算或挂单批次。校验入住≤离店≤当前服务端时间，保留旧时间、旧计费快照、新时间／金额、实际修改人及服务端时间；不伪造新的离店或恢复在住。已实际收款或明确免单后不得直接改时间重算财务。
18. **已收款／免单不直接改账**：结算成功后原日价、晚数、最终应收、实收、付款拆分和时间锁定。少收只能在原单追加真实补收，原因选填；多收或不应收只能追加退款，原因必填。不得通过重开、覆盖历史、更正收款或修改余额绕过。

计费示例（均为北京时间，不含人工调价或其他独立费用）：

| 实际入住 | 实际离店 | 计费晚数／天数 |
|---|---|---|
| 10月23日10:00 | 10月23日20:00 | 0 |
| 10月23日22:00 | 10月24日02:59 | 0 |
| 10月24日02:00 | 10月24日03:00 | 1 |
| 10月24日03:00 | 10月24日10:00 | 0 |
| 10月23日10:00 | 10月24日10:00 | 1 |
| 10月23日10:00 | 10月25日03:00 | 2 |
| 10月24日03:00 | 10月25日03:00 | 1 |

多宠合计示例：同店同客A宠本次80元／天、实际2晚，基础费用160元；B宠本次120元／天、实际2晚，基础费用240元，一起结算的寄养基础合计400元。若各自晚数不同，仍逐宠分别乘自己的晚数，不取最大晚数套全部；分批接走时按第9项分别结算，不等最后一只离店再统一收款。

计费晚数统一F-BOARD-029，不复用“当前第几天”F-BOARD-006，日价／基础金额复用F-ORD-008／009，不新增重复寄养订单／账本或同义boarding_daily_rate；日价更正／免费边界按第14～18项，其余未决流程按下一节，不能因本节确认就宣布寄养整体可实现。

分批示例：A、B于10月23日10:00入住，A日价80元、24日10:00离店，结算A的1晚80元；B日价120元，此时继续在住、不收B费用。B于25日10:00离店，再结算B的2晚240元，不重收A，也不将A改算2晚；示例不含优惠／调价。

已确认离店挂单示例：A于24日10:00实际接走、1晚80元，员工确认本批应收即已离店；没有付款则待结算，主动挂单须原因。没有另行人工调价时，到26日补收80元只更新原账本／解除挂单，A仍是24日离店1晚，不增加为3晚；仍在住的B完全独立。如需收款前调整应收按第17项，不能按跨天自动加减费或补记不存在的付款。

日价更正示例：本宠入住时误填80元／晚，离店费用确认前更正为100元／晚，实际2晚则基础费用200元，保留80→100及经办／时间，不按一晚80＋一晚100分段算。若原已确认离店2晚160元、尚未收款且真实时间无误，仅价格协商应收改为200元，保留80元日价／2晚／160元基础快照，按原规则留因调整最终应收为200元；不改离店、增加晚数或影响余宠。若免费，保留基础费用，将最终应收调0并明确免单；若已收款／免单则不直接改账。

### 5.3 剩余待决（本轮未确认）

- §5.2已确认过夜计数、03:00截点／两端边界、0晚无寄养费、实际离店确认费用、收款可后续、延期／提前离店按实际天数、入住逐宠人工日价、同店同客多宠一起结算、分批接走分别结算、第10～13项离店／挂单及第14～18项价格更正／免单／历史保护，不回退为整块待决。挂单查询／人工联系及撤销按§4.6已确认；入住／离店时间在结算时单独核对、未收款／免单前可更正重算；代接、送医等仅在每日照护记录登记、不建独立特殊交接／送医流程，已结算历史与平台技术仍按原规则；不擅设半天费、最低一天、延期罚金或欠款离店门槛。
- §5.4已确认健康资料非强制、资料缺失人工接收、特殊照护含代喂药及真实执行、异常记录／联系／实际处理与提前接走衔接，不回退为整块待决。代接、送医等真实情况在原每日照护记录填写内容、实际时间和选填照片，不新建代接身份核验、送医审批、医疗处置或责任转移系统流程；主人联系／异常实际处理及原可见性仍保持，主人授权变化及剩余平台技术另行收口。
- 已确认的位置文字、重复位置仅提醒、单宠有效入住防重、三动作统一录入、实际时间／选填照片及可见性独立，不回退为整体待决；加餐商品按03e§17普通销售、照护需要时另记，原入口授权／饮食限制及商品库存规则保持。

### 5.4 已确认：健康资料、特殊照护与异常沟通

> status: confirmed
> status_scope: boarding_health_materials_special_care_and_basic_abnormal_handling_only
> confirmed_by: user
> confirmed_on: 2026-10-24
> boarding_health_material_upload_required: false
> boarding_health_material_status: [provided, not_provided, unverified]
> boarding_health_material_missing_policy: manual_store_decision_no_auto_rejection_or_vaccinated_default
> boarding_special_care_requirements: simple_text_current_stay_snapshot
> boarding_medication_entry: within_special_care_only
> boarding_medication_instructions: human_records_owner_instructions_no_system_or_ai_generation_or_change
> boarding_special_care_acceptance: explicit_store_decision_no_default_acceptance
> boarding_special_care_execution: per_pet_actual_content_time_performer_optional_photos
> boarding_daily_care_actions: unchanged_feeding_walking_cleaning
> boarding_complex_care_scheduling: excluded
> boarding_abnormal_record: actual_time_observation_handling_optional_photos_not_diagnosis
> boarding_abnormal_contact: record_actual_contact_status_result_and_explicit_owner_decision
> boarding_owner_not_reached: no_assumed_consent_or_auto_closure
> boarding_abnormal_close: actual_handling_result_and_explicit_staff_confirmation
> boarding_abnormal_early_checkout: existing_actual_checkout_billing_no_auto_waiver_or_refund
> boarding_clinical_treatment_and_emergency_escalation: pending

1. **疫苗与健康资料**：疫苗资料不强制上传；可以记录主人提供的信息、备注及选填照片，资料状态如实记为已提供／未提供／待核实。已提供不等于已核实、已完成疫苗或医学判断；未提供／待核实不得默认已完成疫苗。记录只用于本次接宠核对，不新增疫苗证件自动识别、有效期推断或医学准入阈值。
2. **资料缺失与接收决定**：系统不因上述资料缺失自动拒绝入住，本店员工核实后记录实际接收或不接收决定；这不免除§5.1的简短强制入住检查、异常／无法检查说明及必要沟通记录。缺材料与缺必需检查是不同情形，未完成必要检查仍不得确认入住；不接收不得生成有效在住，不新增老板审批。
3. **特殊照护归属**：饮食要求、活动限制、长期用药说明等先用简单文字记在本次寄养资料中。代喂药统一归入“特殊照护”，不设独立代喂药业务模块、菜单、订单或第四个日常快捷动作，不增加复杂照护套餐、工时或照护排班。长期资料与本次快照继续按§5.1的明确同步／原字段权限分离。
4. **主人要求与门店接收分开记录**：需要代喂药时，人工如实记录主人交代的药品名称、用法用量等要求，并明确记录门店是否接收本次相应特殊照护要求；没有确认不默认接收，不因主人填写长期用药就自动视为门店已接收。系统和AI不生成或修改用药方案；门店未接收不伪造执行，亦不等于自动拒绝整笔寄养。具体医疗处置不由本条批准。
5. **特殊照护执行记录**：从原寄养详情的统一照护记录中逐宠登记真实执行内容、实际时间及实际执行人，照片选填；关联原boarding_id／pet_id及时间轴事件，录入人和录入时间与实际执行人／时间分别保存。代喂药、代接、送医等都选“其他”并可选填一句说明，不复制独立动态或流程；仅填写要求、保存接收决定或到预计时间不算已经执行，不批量自动完成。统一照护表单固定为喂食／遛狗／清扫笼子／其他四种类型，普通喂食与商品加餐也不混同。
6. **异常登记**：发现异常时，记录实际发生时间、具体观察情况及已采取的处理，照片选填，关联原宠物／寄养并进入工作台“寄养异常”；不要求填写疾病诊断，不把观察描述自动转为医疗结论。内部备注、本人顾客可见记录和主动通知仍依§5.1分别控制，不通过异常表单公开内部记录。
7. **联系主人与处理完成分开**：记录真实联系状态（已联系／暂未联系上）、沟通结果及主人明确表达的决定；未联系上不能默认主人同意任何事项。一次电话、消息发送成功、已读、填写沟通记录或主人回复本身均不自动关闭异常；仍须实际处理、有结果并由员工明确标记已处理。此项不新增短信渠道、自动催办、诊疗授权或未联系上的紧急处置默认方案。
8. **异常提前接走**：沿用§5.2的真实离店及费用确认流程，按实际接走时间停止计费，不按异常登记／联系／处理结束时间停止。优惠、明确免单、退款分别按原规则；不因发生异常自动免单、退款、离店或关闭异常，也不提前关闭同客其他宠物。代接、送医等真实情况记入每日照护记录，不建立医疗、送医审批或特殊交接独立流程；主人要求变更后的授权范围及剩余平台技术另定。

字段复用与新增唯一登记见FIELD-REGISTRY§8.2：资料说明复用F-BOARD-023，特殊照护要求使用F-BOARD-020本次快照内原F-PET-025，长期用药来源仍为F-PET-024。执行复用F-BOARD-007～013、025；补充健康资料状态／媒体、特殊照护接收、异常联系及真实执行人字段，不另建药品、用药方案或医疗订单。上述确认不解锁其余DEC、不表示整端可正式开发。

### 5.5 本店老板与有效员工可修改寄养每日照护记录

> status: confirmed
> status_scope: store_owner_and_active_staff_amend_own_store_boarding_daily_care_content_time_and_media
> change_policy: record_required
> development_readiness: partial
> confirmed_by: user
> confirmed_on: 2026-11-05
> boarding_daily_record_amendment: allowed_in_staff_miniapp
> boarding_daily_record_editors: [merchant_owner, active_staff]
> boarding_daily_record_editor_scope: current_merchant_only
> boarding_daily_record_history: retain_before_after_editor_and_server_time

寄养每日照护记录填错，本店老板／任一当前有效员工均可在店员端原寄养记录中修改，包含类型、选填一句话、真实发生时间及照片等原字段，不因跨日而整条锁死；沿原记录及宠物／寄养关联保留前后内容、实际修改人和时间，不能无痕替换历史或把未执行照护改成已执行。此规则是改每日照护记录，不自动修改实收、日价、晚数、实际离店或已结算账目；入住／离店时间填错须在§5.2结算页单独核对修正；财务另按原收款更正／退款规则。

本节不限制为原录入人，也不要求老板审批；服务端校验当前任职、本店原寄养／宠物／记录关联，跨店、停用或已移出员工不能修改。修改沿原记录留存前后内容、原录入人与实际修改人／服务端时间，原录入时间不冒充修改时间；旧页面与并发修改须复核当前版本，同次成功请求重试不重复记录或执行照护，不产生新订单、收款、库存或业绩。顾客可见性仍按原F-BOARD-025及媒体权限，不因修改公开内部记录。

本节仅确认每日照护记录内容、真实发生时间与照片等原字段的修改资格；入住／离店时间与计费纠错按§5.2结算核对，已结算账目按原规则；代接、送医等由每日照护记录登记，不另建流程。食品风险和奖励自提内部备注填错时，仅由门店联系客服处理，不提供门店直接修改入口；其他业务内部备注继续按各自原有维护规则，不统一改成联系客服。后台具体处理人员／界面和数据契约仍在平台设计阶段收口，不据“联系客服”给任意员工或客服账号新增平台写权限。

## 6. 跨端交付契约待澄清表

| 触发 | 来源对象 | 已有客户侧结果 | 店员侧还需确认 |
|---|---|---|---|
| 客户申请预约 | 预约而非服务订单 | 等待门店人工确认/接受新时间 | 确认时注意事项／风险独立弹窗见§6.5.1；营业／关闭及版本按03a§11，工作台／查询分组、内部处理人、拒绝／改期原因选填及预约阅读／提醒不可用选择继续按§3.7已确认；新增顾客及新老顾客共同提醒／去重规则按§6.5.1已确认，不恢复时段容量拦截 |
| 洗护/美容完成 | 服务记录与结果 | 普通结果、N组对比、原完成消息；补图／普通文字更正不另发消息 | §4.4已确认含已结算补改／留历史／全店有效人员；其他更正与AI新素材契约待决 |
| 客户购买/加餐 | 统一商品购买需求 | 普通商品交易与真实照护分开 | §3.8商品8项及03e§17普通销售已定；无独立投喂待办／确认，照护需要时另记，未决库存分工不扩展 |
| 客户公开投诉门店 / 食品 | 投诉记录 | 用户反馈已公开 / 等待回应 | 门店投诉由店员端正式回应；食品投诉由后台发现问题后客服邮件联系厂家，后续回应映射待决；不得由门店自行判定成立 |
| 喂养有效接单 | 原publisher_store_id、当前current_coordination_store_id | 待门店确认／已确认／已撤销／已过期 | 当前店仅确认／撤销；确认后仅店家看双方联系方式，线下协商修改，不跟踪服务进度；见§3.9／03j |
| 总仓发货到门店 | 平台奖励兑换单 | 已发往门店／已领取 | 取消门店到货确认及领取凭证，所选店老板／有效员工实际交付后点已领取；发货不推断到货，不赋予总仓权限，见03k§8 |
| 退款/冲正完成 | 原交易与反向记录 | 历史金额/处理结果可查 | 消费退款无需老板审批，按真实账本、退货及优惠券规则联动；其余冲正规则仍待决 |

已确认基线按来源文档与§6.1生效；尚未确定的动作权限和状态细节须与04/06/08联动确认。客户端实现者不能用Mock店员按钮把真实依赖算作已接通。

### 6.1 已确认：投诉回应与门店内部风险记录基线

当当前门店成为公开投诉对象时，店员端 / 老板端必须能进入正式投诉处理对象，而不是通过私聊替代。本店所有在职且账号 / 门店关系有效的员工均可提交正式回应，老板同样可回应；不得要求只由指定员工提交或额外设置老板审批作为回应前提。离职 / 停用后的访问限制继续有效，其他门店员工不能回应本店投诉。

门店可：

- 选择回应立场：认可 / 部分认可 / 不认可 / 无法确认；
- 提交正式回应文字；
- 上传图片 / 视频等证据；
- 邀请多名第三方顾客提供佐证；
- 在平台规定的 3 天补证期继续补充材料；
- 查看平台最终裁决和申诉状态。

门店不得：

- 删除用户原投诉；
- 把“已回应”写成“投诉已解决”；
- 自行把投诉改为不成立；
- 用第三方人数投票覆盖平台裁决。

7 天回应期由平台投诉模块计算。逾期后仍可回应，但历史逾期状态保留。

#### 6.1.1 已确认：7天正式回应期限重点展示

> status: confirmed
> status_scope: store_complaint_seven_day_response_deadline_prominence_only
> confirmed_by: user
> confirmed_on: 2026-11-01
> response_deadline_primary_label: 请在7天内正式回应
> response_deadline_locations: [工作台争议待办卡片, 业务消费争议列表, 争议详情顶部]
> response_deadline_display_values: exact_deadline_and_actual_remaining_time
> response_deadline_source: response_due_at
> response_deadline_clock: server_time
> response_deadline_overdue_label: 已逾期，仍需正式回应
> response_deadline_food_scope: no_expansion_of_pending_multi_party_response_rules

- **重点文案固定为“请在7天内正式回应”**。在工作台待处理／其他中的消费争议卡片、异常与临期／投诉回应卡片（有该事项时）、业务／消费争议列表及详情顶部清晰展示；不用仅放在底部说明、折叠帮助、短信或只用颜色提示。各入口读取同一原投诉，不复制待办或改变跨区块去重规则。
- 紧邻展示具体截止时间“截止：YYYY-MM-DD HH:mm”及真实剩余时间。读取平台response_due_at与服务端当前时间计算，不把“7天”每次打开都重新起算，也不因查看／换员工／通知重试延长。剩余不足一天时明确剩余小时／分钟，不向上显示为仍有整天；显示时区按本业务有效时区统一，不用手机时间改变实际期限。
- 截止起点与正式回应条件仍按03h§4.3：基础内容审核通过、投诉对象正确且完成对已入驻回应主体的系统通知后，由平台生成截止；不从用户点击提交、审核中或店员首次打开开始扣7天。截止尚未生成／读取失败时明确“回应截止时间待同步”，不捏造截止、剩余7天或已逾期。
- 尚未正式回应且平台已判定逾期时，重点显示“已逾期，仍需正式回应”及原截止，保留历史逾期事实；逾期不等于投诉成立。正式回应后不再把当前事项显示为尚有7天待回应，当前补证期另按03h§4.4展示，原逾期历史不删除、不混成新回应倒计时。
- 本节确认期限重点展示；直接提交、原回应保留和补充规则按§6.1.2已确认执行，业务消费争议列表／历史查询按§6.1.8。短信当前暂未开放，未来发送规则另议；工作台流转按§3.2.1。适用于本店已明确承担正式回应的门店消费争议；食品投诉按03h§2.4拆分对象，只有明确涉及门店销售／处理行为的门店部分承担7天回应，品牌／厂家部分由后台处理。


#### 6.1.2 已确认：直接回应与追加补充

> status: confirmed
> status_scope: store_complaint_direct_response_and_append_only_supplements
> confirmed_by: user
> confirmed_on: 2026-11-01
> response_draft_enabled: false
> response_required_inputs: [response_position, business_response_text]
> response_media_required: false
> original_response_mutation_policy: immutable_after_successful_submission
> supplement_mode: append_only_during_existing_evidence_window
> response_and_supplement_actors: [current_store_owner, current_store_active_staff]
> owner_approval_required: false
> original_handler_required: false
> evidence_window_trigger: first_successful_formal_response
> evidence_window_duration: 3_days
> evidence_window_reset_on_supplement: false
> evidence_deadline_source: evidence_window_ends_at
> overdue_history_policy: retain

1. **直接提交**：不设消费争议回应草稿或草稿列表。选择回应立场并填写正式回应文字后直接提交，图片／视频可选；不要求先上传附件、老板审批或指定经办人。成功以服务端实际受理为准，点击按钮、上传中／失败、已阅或私下沟通均不算已回应。
2. **原回应保留，后续追加**：成功提交的原立场、正文、附件及首次回应时间保留，不提供覆盖编辑或删除原回应的操作。双方原有3天补证期内，门店可追加说明或材料，逐条保留提交人、时间及原投诉关联，不能用追加内容冒充原回应、改写原时间或重开补证期。追加复用F-EVD证据记录及F-AUD审计；不另造回应草稿、可覆盖的第二正文或第二期限。材料审核／公开脱敏仍按03h§7／12，不因可追加而把原件自动公开。
3. **全店可处理**：当前争议门店的老板与账号／本店任职关系均有效的所有员工，都可提交正式回应及在有效窗口内追加说明／材料，不限原经办人、无需老板审批。每次操作由服务端校验当前身份、本店、原投诉、最新状态和窗口；停用／移出本店及其他门店不得操作，第三方邀请人员及邀请人可见范围另按§6.1.3，被邀请人6项按03h§7.1／本文件§6.1.4；邀请撤回按§6.1.5／03h§7.2，其余未决细分保留，不因此获得平台裁决权。
4. **回应成功自动进入补证**：服务端首次受理正式回应时，同次记录business_responded_at、responded状态、补证流程及双方共用的evidence_window_ends_at；原待回应事项切换为3天补证信息。相关工作台卡片、业务列表及详情顶部突出补证具体截止与按服务端时间计算的真实剩余时间，不再催报尚未回应；历史逾期事实保留，已回应不等于已解决或投诉成立。读取截止失败明确待同步，不捏造新的3天。
5. 同次请求重试只返回原结果，不重复回应、启动窗口或发出同一状态通知；不同员工并发首次提交时只受理一个原回应，另一提交明确提示已有回应并读取最新记录，不静默覆盖，也不把未获确认的内容自动当作补充。需要追加时，由员工在有效窗口内明确提交补充。
6. 补证结束按03h§4.4进入待平台裁决，不开放无限期补充；平台主动要求的额外材料期限单独记录，不改原3天截止。平台已作最终裁决后的异议只提示联系客服处理，不通过新增回应覆盖结论。第三方邀请人员及邀请人可见范围按§6.1.3已确认；被邀请人查看／提交6项按03h§7.1；邀请撤回按§6.1.5已确认；未来短信开放及未确认审核／脱敏细分继续保留，食品对象分工按03h§2.4。

门店内部可以维护顾客 / 宠物的本店备注。主观顾客人格评价只允许本 Merchant 私有；跨门店方向仅允许客服审核后的统一“顾客风险”客观事件。宠物相关事件必须关联具体宠物，不建立独立“行为与服务安全档案”，也不传播自由文本“凶 / 难搞”等评价。

投诉裁决、跨店顾客风险及其中宠物相关事件的详细边界见 `03h-customer-risk-feedback.md`。

#### 6.1.3 已确认：第三方邀请人员与邀请人可见范围

> status: confirmed
> status_scope: store_complaint_witness_inviter_eligibility_and_inviter_view_only
> confirmed_by: user
> confirmed_on: 2026-11-01
> witness_inviter_roles: [current_store_owner, current_store_active_staff]
> inviter_owner_approval_required: false
> inviter_original_handler_required: false
> inviter_view_scope: all_currently_authorized_content_of_this_store_complaint
> inviter_view_authority: existing_role_store_and_field_permissions
> invitee_view_scope_status: confirmed
> invitee_view_scope_authority: 03h_section_7_1
> invitation_grants_additional_read_access: false

- **谁能邀请**：争议门店老板和所有账号／本店任职关系有效的员工均可邀请第三方顾客佐证，不限原经办人、无需老板审批；不授权跨店、停用或已移出本店的人员操作。每次邀请及读取由服务端校验当前资格、本店和原投诉，不以旧页面／链接代替权限。
- **“邀请人能看到所有”的唯一含义**：发起邀请的门店人员，可以查看本店及其当前角色有权查看的该争议全部内容；不能因发过邀请而增加字段／材料权限、跨店读数据或获得平台审核后台权限。普通员工不因此读取原始系统审计日志，老板／平台管理员原有专属边界仍按02§4执行。
- 邀请人与被邀请佐证人是两个主体；本次确认只规定邀请人的查看范围，不将该范围传给被邀请人，不表示证据原件、内部备注、联系方式或后台记录随邀请开放。被邀请人的公开内容查看、既有账号验证、文字／关系必填、平台审核、原3天截止及同人同争议去重按03h§7.1／本文件§6.1.4确认；邀请撤回已按§6.1.5／03h§7.2确认，其他未决细分仍按§6.2／6.3后续确认，不自行以“看到所有”补全。
- 邀请不等于第三方已提交佐证、不代替门店正式回应，不重置7天回应／3天补证截止，也不表示已解决或投诉成立；原有“由被投诉门店邀请提供佐证”的标识及非投票原则保持。食品门店／品牌厂家回应分工按03h§2.4，证据权重及其他待决不因本节整体解阻。

#### 6.1.4 已确认：邀请卡片与顾客佐证流程

> status: confirmed
> status_scope: staff_handoff_to_invited_witness_six_confirmed_rules
> confirmed_by: user
> confirmed_on: 2026-11-01
> witness_business_authority: 03h_section_7_1
> invitation_entry: shared_invitation_card
> store_witness_approval_required: false
> store_can_rewrite_or_delete_witness_statement: false
> witness_deadline_source: evidence_window_ends_at
> witness_uniqueness: complaint_and_platform_user
> invitation_withdrawal_status: confirmed
> invitation_withdrawal_authority: 03h_section_7_2

门店人员按§6.1.3分享邀请卡片，顾客在客户端原争议提交；顾客端6项唯一明细见03h§7.1：只看当前公开及已脱敏内容，不开放联系方式／内部备注／未脱敏原件／后台记录；沿现有账号与必要手机号验证，不另传身份证；佐证文字和事件关系必填、媒体及订单选填；平台统一审核、不经门店挑选审批；原3天截止不因晚收或重复邀请重置，到期关闭提交但仍可读公开内容；同一Platform User对同一争议一份逻辑佐证，原文保留、期内明确追加。

不同员工邀请同一人不得复制独立佐证；邀请本身不表示对方已提交、已审公开或门店已正式回应，不改变结论／解决状态。门店不能改写、删除或隐藏对自己不利的佐证；不得把邀请人原权限带给顾客。未审佐证仍按平台审核权限处理，不作为公开内容下发；平台审核也不自动授予门店读取未审原件的权限，门店读取仍按§6.1.3。邀请撤回按§6.1.5已确认；其他未确认审核／脱敏／恢复细分及证据权重仍待决。

#### 6.1.5 已确认：撤回佐证邀请

> status: confirmed
> status_scope: staff_witness_invitation_withdrawal_four_rules
> confirmed_by: user
> confirmed_on: 2026-11-01
> withdrawal_business_authority: 03h_section_7_2
> withdrawal_actors: [current_store_owner, current_store_active_staff]
> owner_approval_required: false
> original_inviter_required: false
> reason_required: false
> withdrawn_invitation_blocks: new_statement_creation_via_this_card_only
> existing_author_supplement_policy: allowed_in_original_window
> concurrent_first_submission_policy: first_successful_server_operation
> evidence_deadline_source: evidence_window_ends_at

本店老板／所有有效员工均可撤回本店佐证邀请，不限原邀请人、无需审批、原因选填；当前资格、原邀请与原投诉归属仍由服务端校验。撤回仅使该卡片不能再新建佐证，不影响其他有效邀请或公开浏览，不关闭整条投诉、不拉黑顾客。已成功提交的原文／附件保留，该实际作者仍能在原3天窗口追加，不要求原卡片继续有效，不把撤回当作证据删除或下架。

通过该卡片首次提交与撤回以服务端先成功者为准：撤回先成功则拒绝首次提交；提交先成功则保留，随后撤回不阻止本人合法追加。首次提交已成功但响应丢失的同次重试返回原成功结果，不因其后撤回改报失败或重复建份；重复撤回只返回原结果，不重复效果或覆盖原撤回事实；再次邀请不重置原截止。唯一明细见03h§7.2，字段使用F-EVD-012～014、F-CMP-019及原审计，工作事实摘要不开放原始审计。审核／脱敏与权重等剩余待决保留。

#### 6.1.6 已确认：平台统一裁决与确认解决

> status: confirmed
> status_scope: staff_and_customer_cannot_directly_close_complaints
> confirmed_by: user
> confirmed_on: 2026-11-02
> business_authority: 03h_section_6_1
> fact_decision_authority: platform_only
> resolution_confirmation_authority: platform_only
> store_can_mark_resolved: false
> complainant_can_mark_resolved: false
> party_actions: submit_processing_facts_materials_and_opinions_only
> remaining_pending_scope: platform_review_criteria_role_permission_mapping_resolution_time_post_resolution_changes_and_support_contact_configuration
> processing_progress_authority: 03h_section_6_2

当前争议门店老板／有效员工和本案投诉人可提交处理情况及意见，不能直接将争议标记已解决或修改事实结论；顾客反馈已处理好也只作为意见材料。是否成立与是否已解决均由平台有权人员最终确认，但使用独立状态，不把其中一项操作自动当另一项完成。店员端／客户端不提供直接生效的确认结案动作，直接请求同样由服务端拒绝越权写入。

仅平台成功明确确认后才更新解决状态和对应消息；回应、补证、退款、双方意见一致、消息已读或时间经过均不自动结案。原事实结论、逾期、回应／补证截止、公开记录及排序规则仍按03h；不新增门店审批或第二套处理订单。复用F-CMP-020／021／022及F-AUD，平台操作时间与实际解决时间不混用，不授予原始审计读取权。唯一明细见03h§6.1；处理情况5项按03h§6.2／本文件§6.1.7已确认；平台核验标准／角色权限、实际解决时间／误标更正、已解决后的新进展和申诉等剩余规则后续确认，不预设默认值。

#### 6.1.7 已确认：提交处理情况

> status: confirmed
> status_scope: staff_processing_progress_five_rules
> confirmed_by: user
> confirmed_on: 2026-11-02
> business_authority: 03h_section_6_2
> entry_location: original_complaint_detail
> entry_label: 提交处理情况
> owner_approval_required: false
> original_handler_required: false
> description_required: true
> media_required: false
> record_business_purpose: handling_progress
> post_evidence_window_submission: allowed_while_not_platform_resolved
> unpublished_material_readers: [actual_submitter_with_current_access, authorized_platform]
> publication_policy: platform_reviewed_redacted_copy_only
> financial_side_effects: none

本店老板／所有有效员工和本案投诉人可在原争议详情点“提交处理情况”，不需原经办人或老板审批；简短说明必填、图片视频选填，不强制退款凭证／签字。逐次独立保存人／时间／原文／附件，写错追加更正，不覆盖删除；原投诉／当前身份／本店访问权仍校验，第三方佐证人与其他门店不因此取得提交资格。

平台尚未确认已解决时，3天补证结束后仍可记录实际处理进展；与原争议补证用不同用途标识，不重开补证、不覆写事实结论，裁决异议仍按申诉。平台已确认resolved后不借此新提交／自助恢复，历史仍保留。原文未公开时仅该条实际提交者及平台有权人员可看，老板／其他员工／投诉对方不能通过管理、工作记录、日志、导出或附件引用绕过；公开只展示平台已审核脱敏的副本，普通员工原始审计权限不扩大。

复用原F-EVD记录、增加015用途及016～018公开控制／副本字段，实际提交时间不冒充实际解决或退款时间。同次重试返回原结果、无重复；该操作不自动回应／结案、不更新财务或库存，实际收退款仍走原账本。唯一明细见03h§6.2；平台审核角色和技术接口后续登记，异议只提示联系客服，不新增申诉状态机。

#### 6.1.8 已确认：消费争议列表与历史查询

> status: confirmed
> status_scope: staff_consumer_dispute_list_groups_filters_sort_fields_and_history
> confirmed_by: user
> confirmed_on: 2026-11-05
> dispute_list_groups: [待回应, 补充材料中, 待平台裁决, 已结束]
> dispute_list_filters: [customer_mobile, dispute_id, status, date]
> dispute_list_actors: [merchant_owner, active_store_staff]
> dispute_claim_or_assignment: excluded

- “业务 → 消费争议”按待回应、补充材料中、待平台裁决、已结束四组展示本店有权记录。待回应先列已逾期，再按真实7天回应截止时间排序；不存在客户端本地重算期限。
- 列表显示争议编号、顾客、争议事项、提交时间、当前状态和当前回应截止时间；支持顾客手机号、争议编号、状态和日期查询。首个正式回应成功后，当前重点期限改为3天补充材料截止，原7天逾期历史仍保留。
- 本店老板和所有有效员工均可查看本店记录、直接按原规则回应／追加，不设置领取人、个人待办归属或转交前置。员工停用／离店后保留其历史回应，其他有效员工直接继续处理，不覆盖原经办事实。
- 已结束包括平台已裁决、平台已确认解决及其他合法终止记录；底层真实状态分别展示，不统一改写成“已解决”，不把列表归组当成平台裁决或结案。

消费争议／投诉及跨店顾客风险都不提供小程序申诉，异议仅提示“如有异议，请联系客服处理”；已确认回应、处理情况与平台裁决规则保持，旧申诉历史只读保留。

食品风险调查由平台直接联系厂家并在Web后台处理；门店只收到一条知悉通知，不参与前置核实、厂家沟通或厂家回信维护。食品风险内部备注填错由门店联系客服更正，不提供老板／员工直接修改入口，原备注与更正经办历史保留。该限制也适用于奖励自提内部备注，其他业务不套用，见03k§8.2；平台具体处理契约不增加店员调查或维护厂家回信权限。

### 6.2 待确认：跨店风险技术与异常操作

以下仍未冻结：

- 证据原件／公开脱敏副本、取证与第三人隐私等细分；§6.1.2的无草稿、原回应不可覆盖／删除、追加补充及全店有效员工可处理已确认，不再作为待决；
- 未确认的审核／脱敏／异常恢复细分；邀请人员及邀请人查看按§6.1.3、被邀请人6项按03h§7.1／本文件§6.1.4、邀请撤回4项按03h§7.2／本文件§6.1.5已确认，不再整体列为待决；
- 统一顾客风险的客服平台角色映射、审核／驳回／撤回接口与数据库／API对象映射；提交人员、必填材料、审核前撤回重提、审核后联系客服处理及顾客不可见已按03h§10.4～10.5确认；
- 顾客风险中的宠物相关记录不再作为独立“宠物行为与服务安全”菜单或第二套授权；现有宠物细节字段与统一风险对象的技术映射待阶段09／11登记；
- 顾客有异议时联系客服；小程序不创建、展示或跟踪申诉记录，平台客服处理不向门店开放申诉维护权限。

这些细节的业务边界已经确认；平台角色映射、接口与数据迁移在阶段05／08／09收口，不得据技术未完成恢复独立宠物安全分类或自助申诉。

### 6.3 新功能的后续店员端讨论清单

> discussion_status: pending
> implementation_policy: analysis_only
> source: 03h_sections_2_to_12_and_03b_03f

本节是后续讨论议程，不新增已确认业务、权限码或默认值；已确认内容继续引用§6.1及原模块。每次讨论工作台、业务、客户或权限时，须核对本表，不能只删除旧菜单而漏掉新功能承接。

| 业务项 | 当前已确认规则 | 后续技术工作 | 唯一来源 |
|---|---|---|---|
| 投诉入口与待办 | 客户端入口“我的 → 投诉与建议”；建议只给平台看，门店无需回应。消费争议待办归争议门店，四组列表、期限排序、全店有效员工回应／追加及离职历史接续已定 | 异常恢复在技术阶段设计；不得将领取／转交／原经办人设为回应前提 | §3.2.1、§6.1.2、§6.1.8；03h |
| 正式回应 | §6.1.2已确认无草稿直接提交，立场／文字必填、媒体选填；原回应保留，3天窗口内逐条追加，全店老板／有效员工可处理，无审批或原经办限制；首次提交并发不覆盖、不重启窗口 | 证据细分与审计实现按阶段06／08收口；不得恢复草稿、覆盖修订或老板审批 | §6.1.2；03h§4；阶段06／08 |
| 回应与补证截止 | 03h的7天回应／首个正式回应后3天补证；§6.1.1重点展示7天期限，§6.1.2回应成功自动转补证、突出补证截止且保留历史逾期，短信当前暂未开放 | 裁决后异议仅提示联系客服；既有逾期仍可回应，不能自行重置截止 | 03h§4；§6.1.1～6.1.2 |
| 证据上传与关联 | 图片／视频、订单／预约／付款／服务事实；隐私处理与审计 | 原件与公开脱敏副本、授权取证、上传恢复、修订和第三人隐私在阶段06／08实现 | 03h§7／12；阶段06／08 |
| 第三方佐证 | 邀请、查看、撤回和追加边界已定；证据等级只分高／中／低且由审核员人工判断，标明商家邀请但不按人数投票 | 审核／脱敏／异常恢复在阶段06实现；不得继承邀请人权限或由门店筛选删除不利佐证 | §6.1.3～§6.1.5；03h§7.1～7.2；阶段06 |
| 解决情况与申诉 | 03h§6.1／§6.1.6平台最终确认两个独立状态；03h§6.2／§6.1.7处理情况5项已定：原详情入口、说明必填／媒体选填、追加历史、未解决时补证后实际进展、未审作者／平台可见及公开脱敏副本 | 平台核验标准／角色权限、实际解决时间／误标更正、已解决后的新进展、消费争议无自助申诉、仅提示联系客服；不得由顾客直接或默认自动结案，不以处理情况延长补证 | 03h§5／6.1～6.2；§6.1.6～6.1.7；阶段05/06/08 |
| 食品投诉回应主体 | 平台直接联系厂家并在Web后台录入真实回信，审核通过即算厂家回应且不设期限；门店只收知悉通知，不参与前置核实或厂家沟通。只有另行明确主张门店自身销售／处理行为的部分，才按门店消费争议7天回应 | 不得默认本店负责品牌／厂家问题，任何回应都不自动结案 | 03h§2.4；03f§13.3 |
| 当前食用品牌维护 | 店员不能维护宠物当前食用品牌或食品品牌／厂家主资料；仅本店原有权老板／员工只读，空值显示主人未填写、过期只引导主人更新；寄养本次粮食、商品购买和旧历史兼容数据均不回填 | 不得擅自把购买品牌写成食用品牌 | 03b§4.4 |
| 食品风险提醒承接 | 门店只收一条知悉通知；本店有效人员无需领取／转交／审批，明确点已知悉后移出工作台，备注选填、历史保留；食品问题由平台直接联系厂家 | 备注纠错和平台接口在阶段05／08实现；知悉不等于质量责任、投诉已解决或正式回应 | 03f§13.3～13.3.2；§6.5.2；03h§2.4 |
| 顾客风险 | 统一含顾客相关和宠物相关两种对象；只按认证手机号匹配，双方门店授权、顾客分项同意、每月3次、12个月展示及3年受限留存；客服审核，顾客端不显示记录且无自助申诉 | 客服角色／接口和统一对象技术映射在阶段05／08／09实现；不得恢复独立宠物安全分类、微信号匹配、门店自审或顾客端读取 | 03h§10.1～10.5 |
| 平台与门店职责分界 | 日常经营和老板设置全部在小程序；平台裁决、批量审核和厂家处理只在平台Web后台 | 平台审核员映射和后台页面在阶段05／08实现；门店只查询自身有权材料与结果 | 02；03h§5／9；§3.0 |

### 6.4 后续技术阶段的跨模块边界

以下业务原则已经确认，剩余内容只允许在阶段05～09补技术契约，不得重新打开已拍板业务流程：

- 02只定义三个经营角色，03h使用“平台审核员”。需明确其与Platform Super Admin及裁决权限的映射；不自行新增审核员角色，也不自动给Merchant Owner/Staff平台裁决权。
- 03h§6规定公开投诉长期保留，同时03g§10要求注销时处理个人身份数据、03h§12要求公开内容隐私保护。需明确公开脱敏版本、原始证据、审计记录分别如何保留、下架与匿名化，不能把“长期公开”解释成永远公开个人信息。
- 03h§6规定投诉未解决优先且组内时间倒序；食品／批次风险只显示低／中／高三档。投诉记录列表、食品聚合列表和平台审核队列必须分开实现，热度不得覆盖投诉列表的已确认排序。
- 03h§6.1已确认平台最终决定是否已解决，门店／顾客只能提交处理情况及意见，不能直接结案。平台核验标准、角色权限、实际解决时间和误标更正在平台阶段设计；消费争议不新增自助申诉，异议统一联系客服。

### 6.5 已确认：入口、维护权限与通知承接

本节确认以下跨端职责与正式回应人员范围；未登记的技术接口和平台角色映射在后续阶段收口：

- 客户端“我的 → 投诉与建议”是投诉入口；“消费争议”为首页模块名称。这不是对店员端投诉菜单位置的确认。
- 门店正式回应在店员端进行，本店所有有效在职员工及老板均可直接提交和在3天窗口内追加；无草稿，原回应不可覆盖／删除，无老板审批／原经办限制，回应成功自动转补证并突出截止，见§6.1.2。第三方邀请人员及邀请人可见范围见§6.1.3；是否成立及是否已解决均归平台最终确认，门店／顾客只提交处理情况和意见，见§6.1.6／03h§6.1，不得扩大到跨店回应或平台裁决。
- 食品问题由平台直接联系厂家并在Web后台处理；门店不参与前置核实、厂家沟通或厂家回应维护，只收到一条知悉通知并记录已知悉。厂家回信由平台录入并审核，通过即算回应且不设期限；未录入显示“平台核查中”，任何回应不自动结案，见03h§2.4。
- 店员不能维护宠物当前食用品牌，也不能维护食品品牌／厂家主资料；仅本店原本有权查看顾客／宠物资料的老板和有效员工只读。空值显示“主人暂未填写”，可能过期时只引导主人客户端更新；寄养本次粮食、商品购买和历史导入都不回填长期品牌，见03b§4.4。
- 投诉提醒与逾期处理的短信当前暂未开放，相关入口／状态只显示“暂未开放”，不发送、不排队重试或自动补发，不提供启用开关；站内／微信原规则、7天／3天期限及待办照常。以后开放另行确认，接收方向仍预留争议门店注册号码，不另设争议通知手机号；号码变更／验证后续收口，见03f§13.2。
- 食品风险由平台直接联系厂家；明确关联门店时只向该店生成一条知悉待办，同案同店不重复，不把知悉任务变成核实或厂家回应。门店知悉按03f§13.3.1／§6.5.2：本店有效人员都可看有权内容后点已知悉、备注选填，成功才移卡留历史，不以通知发送／已读代替；更新及误点恢复按03f§13.3.2。备注纠错由平台处理，门店无厂家沟通或厂家资料维护权限。

#### 6.5.1 已确认：新增顾客与确认预约时独立弹窗提醒

> status: confirmed
> status_scope: customer_creation_and_appointment_risk_reminder_business_rules
> reminder_triggers: [新增顾客, 确认预约]
> reminder_presentation: separate_dialog
> reminder_content: [宠物护理注意事项, 顾客风险]
> confirmed_by: user
> confirmed_on: 2026-10-25
> reminder_customer_scope: all_new_and_returning_customers_at_confirmed_business_triggers
> customer_local_truth_verification_required: false
> customer_creation_reminder_timing: after_explicit_customer_save_success
> customer_creation_reminder_failure_effect: preserve_saved_customer_no_rollback_or_duplicate_create
> customer_reminder_read_action: explicit_read_and_continue_when_authorized_content_exists
> reminder_unavailable_label: 共享提醒暂不可用，可继续
> reminder_unavailable_continuation: direct_without_staff_truth_verification_or_manual_check
> reminder_unavailable_result: preserve_unavailable_fact_no_safe_or_query_success_claim
> reminder_same_operation_deduplication: same_customer_pet_set_and_content_once
> reminder_retry_and_back_navigation: reuse_same_business_operation_no_repeated_popup_or_query_charge
> reminder_changed_pet_or_content: require_new_read_acknowledgement_for_current_authorized_content
> reminder_new_business_operation: remind_again_no_permanent_ignore
> reminder_repeat_display_query_effect: no_automatic_new_shared_query
> reminder_shared_query_quota: preserve_three_per_store_customer_natural_month_and_request_idempotency
> reminder_audit: actual_actor_read_and_unavailable_continue_separately
> reminder_read_is_customer_share_consent: false
> reminder_scope_is_bulk_query_authorization: false

- 新增顾客、门店确认客户预约这两个环节，若存在与当前顾客／宠物明确关联、当前门店有权查看的注意事项或风险提示，必须以独立弹窗提醒，不能只藏在详情页、普通消息或列表标签中。
- “确认预约订单”在本项目中对应确认预约对象，不是确认收款、创建服务订单或完成服务；预约与正式订单继续区分。
- 共享顾客风险提醒只允许在新增顾客、确认预约等已确认真实业务动作中查询，并稳定关联当前Customer创建／预约处理对象；不得提供可任意输入手机号、微信号或其他标识的独立查询、批量查询或导出入口。查询按03h§10.1执行：来源门店授权共享本店提醒，查看门店也已授权参与共享，且顾客已单独同意共享服务履约记录；只按顾客已认证手机号唯一匹配，不使用微信身份、昵称或手填联系方式。同一查看门店对同一顾客每自然月最多查询3次，店内所有员工共享额度；相同请求重试不得重复扣次，换员工或重复建空Customer不得重置。该权限不开放其他门店私有资料，也不自动关联宠物；宠物注意事项仍须明确对应宠物。标识冲突、来源不明、达到限额或无提醒数据时，不得猜测对象、暴露可用于枚举的差异原因、伪造风险或宣称“已安全检查／无风险”。
- 弹窗只分宠物护理注意事项和顾客风险；顾客风险内部明确“顾客相关／宠物相关”并在宠物相关时标明具体宠物，不再显示独立宠物安全分类。食品风险仍是独立业务提醒，不混入本弹窗或被省略成“平台已确认有问题”。
- 弹窗展示顾客风险时，采用03h§10.1～10.5的双方门店授权、顾客分项同意、认证手机号唯一匹配、月度查询额度、授权撤回、冲突阻断、保存及客服审核规则。只返回审核通过、授权有效且在12个月展示期内的事件类型、发生日期、审核后客观说明、来源门店和有效期，不返回未脱敏原件／内部备注，不提供下载导出转发。店员点击“已阅读，继续”只表示已读，不代表接受责任、认定成立或自动拒单。冲突时不展示任何内容并转平台核验；异议统一提示联系客服，不提供申诉入口。
- 顾客建档由明确保存动作完成；弹窗展示、关闭或阅读不再次建档、不自动确认预约、拒绝服务或解除风险，也不授予跨店访问权。填写完整性／格式、本店重复记录处理、线上绑定及共享权限等原有系统规则继续生效，不新增门店核验顾客资料真实性的流程。

新增顾客阅读／失败接续及重复提醒规则已按以下六项确认，预约确认提醒保留且适用于全部新老顾客。统一顾客风险的技术映射及详情页精确UI在后续阶段收口；不自行新增全局忽略／永久不再提醒。

1. **保存后仅做提醒**：本店无需核验顾客资料真实性，不要求线下Customer先完成短信／微信所有权证明、线上User绑定或门店人工核对才能保存；原填写完整性／格式及重复记录处理照常。顾客明确保存成功后再显示提醒；查询失败或关闭弹窗不回滚已保存顾客、不重复创建，也不能借回退重试建空Customer重置查询额度。
2. **有内容须明确阅读**：有当前顾客／明确关联宠物且本店有权查看的已知提醒时，独立弹窗点击“已阅读，继续”后进入顾客详情；关闭不算已阅读，已保存资料仍保留。暂无可展示内容不伪造阅读／风险，不强制增加宠物或猜测关联；适用于全部顾客的已确认真实流程，不局限首次消费或已绑定平台User。
3. **不可用可直接继续**：共享提醒查询失败、额度已用完或按原权限不能展示时，统一提示“共享提醒暂不可用，可继续”，可直接继续当前业务，不要求门店核验资料或人工核对后再放行。记录不可用和实际选择继续，不写成无风险／查询成功／已验证身份；这不授予共享取数权限，原授权撤回、冲突阻断／平台核验、额度及线上绑定安全规则保持。对外不区分可用于枚举他店顾客／风险记录的失败原因。
4. **同次同内容只弹一次**：同一真实新增顾客或确认预约操作内，同一顾客、同一涉及宠物集合及相同提醒内容不反复弹；网络重试、返回页面沿用原业务动作／幂等上下文，不重扣查询额度。宠物或提醒内容变化后，针对当前有权展示的内容重新阅读；去重记录不是绕过撤权／到期的缓存授权。
5. **新业务再次提醒**：下一笔真实预约等独立已确认业务操作，有合法可展示内容时再次提醒，不能沿用旧阅读变成永久不提醒。再次弹窗本身不自动发起新跨店查询；新真实业务需要查询时仍按03h鉴权和每自然月3次限制，同次同请求重试不重复计次，不增加后台轮询或全量顾客扫描。
6. **分开记录阅读和继续**：保留实际操作人、阅读时间与查询不可用时选择继续的时间，不能把员工阅读当作顾客分项共享同意，不能把选择继续当作核验完成或共享查询成功。创建及预约复用各自原对象／幂等和原审计；普通工作历史摘要不开放完整系统审计。预约复用F-APPT-030～032，新增顾客字段唯一见FIELD-REGISTRY§3.3，不另建核验审批／风险查询入口。

客户页整体结构已在§3.0.2确认；顾客／宠物详情固定设“跨店共享资料”，只分宠物护理注意事项和顾客风险；后者按顾客相关／宠物相关显示。字段密度和视觉仍待UI收口，弹窗要求继续独立生效，不能因为详情页已有信息而取消新增顾客／确认预约提醒。

顾客端“共享宠物护理注意事项给未来的门店”只对应护理信息，不是顾客风险告知／同意。顾客端采用“服务履约记录”说明统一顾客风险共享用途，与护理分项分别勾选、默认不勾选；但顾客端不显示任何已审核或未审核风险记录的存在、状态或内容，也不发送记录存在通知。门店授权或标识匹配不能代替顾客分项同意。

#### 6.5.2 食品风险门店知悉

食品问题由平台直接联系厂家，门店不参与前置核实、厂家沟通或厂家回应维护。涉事门店只收到一条知悉待办；待办归门店，任一有效员工点击“已知悉”即可，系统记录实际处理人，不设领取、转交、审批、证明上传或原经办限制。厂家回信由平台Web录入，审核通过即算回应且不设期限；未录入显示“平台核查中”。知悉不等于责任成立或案件解决。


#### 6.5.3 顾客风险提交与跨店查看

本店老板／有效员工可从顾客或宠物详情提交客观顾客风险，必须关联本店真实业务事实并经平台客服审核；审核前不跨店展示，审核后门店不能直接改删，需联系客服处理。顾客端始终不显示记录存在、摘要、状态或内容。

跨店匹配只使用顾客已认证手机号，不使用微信号、昵称或其他标识。来源门店、查看门店和顾客分项授权仍须有效，查询只在新增顾客、确认预约等真实业务触发，每店同顾客每自然月最多3次并自动审计。顾客相关与宠物相关记录均可在同一“顾客风险”区域跨店查看；宠物相关须关联具体宠物。顾客不提供申诉入口，有异议统一提示联系客服处理。

## 7. 本端当前规则归属

| 规则范围 | 唯一归属 |
|---|---|
| 门店日常经营、老板设置、小程序／Web边界 | §3.0、02 |
| 顾客识别、快速开单、多宠与混结 | §4.1、03g |
| 门店待办、实际处理人、食品知悉 | §3.2、§6.5.2、03f |
| 快速开单、服务开始、补图与纠错 | §4.3～§4.5、03d、03f |
| 结算锁定、补收、消费退款、充值退款 | §3.0.13～§3.0.14、§3.0.21、03c、03d |
| 寄养计费、离店、照护时间轴 | §5.1～§5.5 |
| 手机号、营业执照、通知等级 | §3.0.3～§3.0.6、02、03f |
| 订单业绩归属与历史缺失归属 | §3.0.10、03d |
| 普通跨店导入退役与顾客风险查询 | §3.0.22、§6.5、03g、03h |

## 8. 后续工程收口

本文件的店员端产品规则已确认。进入实现前仍须在 `docs/execution/` 单独关闭开发顺序与技术栈决策，并按 `FIELD-REGISTRY.md` 完成尚未登记的接口／字段契约；这些工程事项不得反向改变本文件业务规则。

正式验收编号、店员完整UI规范和技术方案由后续阶段收口。需求文档确认只表示规则一致，不表示小程序、后端、微信能力或权限已经实现或验收。

## 9. 变更记录

见 [执行治理与店员分析变更历史](history/2026-execution-and-staff-changes.md)。
