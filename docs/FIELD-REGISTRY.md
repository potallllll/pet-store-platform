# 全项目字段唯一注册表（Field Registry）

> status: mixed
> confirmed_scope: registry_rules_and_entries_marked_C_or_S
> pending_scope: entries_marked_P
> change_policy: record_required
> development_readiness: partial
> blocked_by: [DEC-COMPLAINT-07, DEC-COMPLAINT-08, DEC-RISK-01, DEC-PETSAFETY-01, DEC-EVIDENCE-01, DEC-STORE-CLAIM-01, DEC-FOOD-RESP-01, DEC-RISK-UI-01, DEC-FOOD-HEAT-01, DEC-FEED-02, DEC-POINTS-01, DEC-POINTS-02, DEC-LAUNCH-01, DEC-STAFF-01, DEC-STAFF-02, DEC-STAFF-03, DEC-STAFF-04, DEC-STAFF-05, DEC-STAFF-06, DEC-STAFF-07, DEC-STAFF-08]
> version: V1.0
> registry_owner: project_requirements
> canonical_logical_field_source: true

## 1. 文档目的

本文件用于固定全项目业务字段的**唯一注册号、统一逻辑字段名和业务含义**，供需求、前端、后端、API、Codex / AI、测试、数据迁移和后续数据库设计统一查询。

它解决以下问题：

- 同一含义被不同模块写成 `user_id / uid / member_user_id`；
- `Merchant / Store`、`User / Customer` 被混为一个字段；
- `订单状态 / 付款状态` 被一个 `status` 覆盖；退役的加餐执行状态不得重新启用；
- `平台积分 / 商户余额`、`曝光广告 / 激励广告权益` 被错误共用字段；
- 前端直接读取完整 Pet / Customer 实体，导致越权或字段泄露；
- 后续 AI / 新人临时创造新字段，造成接口与数据调取漂移。

本文件冻结的是**逻辑字段标识**。阶段 09 数据库设计可决定物理表、索引、存储类型和必要拆表，但默认应沿用这里的逻辑字段名；如果物理列名不同，必须建立显式映射，不得重新定义字段含义。

宠物当前食用品牌与食品品牌 / 厂家主资料的字段存在，不代表授予店员维护权；明确禁止店员维护，见03b§4.4。当前阶段投诉等业务短信暂未开放、不发送，入口／状态显示“暂未开放”，不排队重试或以后自动补发；食品风险仍另行形成店员待办，见03f§13.2～13.3；争议待办归属争议门店；未来如另行确认开放投诉短信，接收方向仍为争议门店注册号码（不授权当前发送），不另设独立争议通知号码；食品风险初次归属按03f§13.3：未明确争议店由平台承接原案暂不派店，之后平台据事实明确店再派，同案同店不重复；基础知悉记录按§14.4.1已登记；普通通知／重要通知与误点恢复轮次按§14.4.1已登记；已派后改店／多店、其他备注更正等剩余结构字段后续先登记，不复用微信发送字段或主人消息去重键。

业务规则仍由对应正式需求文档负责；本文件不利用字段表擅自确认原本处于 pending 的权限、金额、截止时间、状态迁移或审批规则。

---

## 2. 注册规则

### 2.1 永久注册号

每个字段使用不可复用的注册号：

`F-<DOMAIN>-<NNN>`

例如：

- `F-CORE-001 / platform_user_id`
- `F-PET-001 / pet_id`
- `F-ORD-001 / order_id`

注册号一旦使用，即使未来字段废弃也不得分配给新字段。

### 2.2 统一逻辑字段名

- 统一使用 `snake_case`。
- ID 统一使用 `_id` 结尾；多个 ID 使用 `_ids`。
- 时间点统一使用 `_at`；自然日使用 `_date`；日期范围使用 `_start_date / _end_date`。
- 布尔语义优先 `is_* / *_enabled / *_allowed`。
- 状态必须带业务前缀，例如 `order_status`、`payment_status`、`home_feeding_status`，禁止跨域只写一个含义不明的 `status`。
- 金额必须表达含义，例如 `original_receivable_amount`、`paid_amount`、`refund_amount`，禁止只写 `amount` 后依赖上下文猜测。

### 2.3 状态标记

| 标记 | 含义 | 是否可作为正式逻辑字段使用 |
|---|---|---|
| `C` | 正式需求已明确字段或明确语义 | 是 |
| `S` | 本注册表为已确认业务概念统一出的固定逻辑字段名，不新增业务规则 | 是 |
| `P` | 对应业务仍被 DEC / mixed 文档阻塞，仅预留注册号 | 否；确认前不得实现成正式规则 |
| `D` | 已退役字段，仅为永久注册号与历史迁移保留 | 否；新代码禁止继续写入 |

### 2.4 类型说明

本文类型是业务语义类型，不等于最终数据库类型：

- `ID`：稳定不可猜测业务标识；
- `Enum`：受控枚举；
- `Money`：金额语义，禁止浮点误差实现；
- `Datetime / Date`：服务端权威时间；涉及业务日 / 周按 `Asia/Shanghai`；
- `Ref / Ref[]`：对其他实体的稳定引用；
- `Text`：文本；
- `Bool`：布尔；
- `Number / Int`：数值；
- `JSON/Struct`：结构化内容，后续架构可拆表。

---

## 3. 全局身份、多租户与通用字段（CORE）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CORE-001 | `platform_user_id` | S | ID | 平台自然人 User 唯一标识。03m 中旧写法 `user_id` 统一映射到此字段。不得用 Customer 代替。 |
| F-CORE-002 | `merchant_id` | C | ID | Merchant / Tenant 唯一标识，是商户私有数据的核心租户隔离字段。V1 一商户一门店，但仍不得与 `store_id` 混用。 |
| F-CORE-003 | `store_id` | C | ID | Store 唯一标识。表达实际门店上下文、权益归属和可工作门店，不等于 Merchant。 |
| F-CORE-004 | `customer_id` | C | ID | 某Merchant的客户业务记录／关系标识，可在线下先建且关联Platform User可以为空；完成安全绑定后仍使用同一customer_id。余额、优惠券、门店订单等归属该关系。 |
| F-CORE-005 | `staff_id` | C | ID | 店员业务身份标识；停用或从本店名单逻辑删除均不删除该稳定身份，历史记录继续引用。 |
| F-CORE-006 | `merchant_owner_user_id` | S | ID | 商户老板所对应的平台/经营账号稳定引用；不新增“店长”角色。 |
| F-CORE-007 | `role_key` | S | Enum | 经营角色固定语义：`platform_super_admin / merchant_owner / staff`。Customer/User 不计入这三个经营角色。 |
| F-CORE-008 | `permission_key` | S | Text | 服务端能力标识。例：`reward_fulfillment.manage`；完整角色映射阶段08收口。02已确认店员使用统一默认业务集合，不提供逐员工配置；老板／平台专属及敏感记录边界继续校验。 |
| F-CORE-009 | `business_timezone` | C | Text | 全局业务判定时区，当前固定 `Asia/Shanghai`。不得以客户端本地时区决定签到、自然日等业务归属。 |
| F-CORE-010 | `idempotency_key` | C | Text | 同一次业务提交 / 回调的幂等键；重复请求必须恢复原结果，不新建第二笔。 |
| F-CORE-011 | `source_channel` | C | Enum | 业务来源渠道，例如 `mini_program / wechat / meituan / douyin / phone / walk_in / other`。不得用业务场景替代渠道。 |
| F-CORE-012 | `business_scenario` | C | Enum | 同一业务模型内的业务场景。已确认值至少含 `boarding_feed`；与 `source_channel` 分开。 |
| F-CORE-013 | `created_at` | S | Datetime | 业务记录创建时间；不等于实际业务发生时间。 |
| F-CORE-014 | `updated_at` | S | Datetime | 当前记录最近一次有效更新的服务端时间。 |
| F-CORE-015 | `status_reason` | S | Text | 状态变化原因的通用逻辑字段；不能用它替代各业务专用取消 / 拒绝 / 异常原因。 |

### 3.1 强制隔离规则

- `platform_user_id ≠ customer_id`。
- `merchant_id ≠ store_id`。
- 同一Platform User可在不同Merchant下关联不同Customer；同一Customer至多绑定一个当前有效Platform User，未绑定User的线下Customer仍是合法业务记录。
- 商户钱包、优惠券、订单、内部备注按 Merchant/Customer 隔离；平台积分、平台个人消息、养宠顾问个人额度归 Platform User。
- 任何“当前门店”都用 `store_id`；任何“租户归属”都用 `merchant_id`。

---

### 3.2 门店资料与修改审核（STORE_PROFILE）

门店资料及修改申请均使用F-CORE-003／`store_id`作为唯一Store归属，并关联F-CORE-002／`merchant_id`执行租户隔离；不得按名称或地址重新确定所属门店。04§3.0.6是四项资料、提交、审核和生效的业务依据。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-STORE-001 | `store_front_photo_ref` | C | Ref | 门店门头照片单张引用；最终图片固定1:1正方形，JPG／JPEG／PNG，不超过3MB（3,145,728字节），按04§3.0.6上传及校验。不等于门店头像、品牌Banner或广告素材。 |
| F-STORE-002 | `store_name` | C | Text | 门店名称；当前展示取有效版本，待审值仅存提交快照。 |
| F-STORE-003 | `store_address` | C | Text/Struct | 门店地址；当前展示取有效版本，结构化拆分或地图参数在后续技术设计中收口，不根据地址迁移Store归属。 |
| F-STORE-004 | `store_business_license_ref` | C | Ref | 门店营业执照单张图片引用；JPG／JPEG／PNG，不超过10MB（10,485,760字节），完整清晰，不套用门头正方形裁剪或3MB限制。仅供本店老板资料管理及Platform Super Admin平台审核，普通员工不可读，不向顾客公开。顾客接口不得返回原件、脱敏副本、缩略图或可访问材料的引用／链接；媒体访问须执行相同身份及门店范围校验，审核通过不改变可见范围。 |
| F-STORE-005 | `store_profile_version` | S | Int | 当前有效门店资料版本；只有对应提交被平台批准且生效后更新。 |
| F-STORE-006 | `store_profile_change_id` | S | ID | 单次修改提交的稳定标识；提交后四项快照不允许无痕改写。 |
| F-STORE-007 | `store_profile_base_version` | S | Int | 本次修改基于的有效版本；批准生效时再校验，旧版本审核结果不得覆盖新版本。 |
| F-STORE-008 | `store_profile_submitted_at` | S | Datetime | 老板实际提交修改的服务端时间，打开编辑页不写为已提交。 |
| F-STORE-009 | `store_profile_activated_at` | S | Datetime | 本次审核批准结果成功切换为有效版本的时间；区别于审核操作时间。 |
| F-STORE-010 | `store_profile_activated_change_id` | S | ID | 当前有效资料版本来源的已生效修改申请标识；不得关联待审／拒绝申请。首次注册初始资料可以为空，不据此新增注册审批。 |
| F-STORE-011 | `store_profile_next_submission_at` | S | Datetime | 本Store下次允许提交资料修改申请的时间，由服务端按上次已审核通过且成功生效的F-STORE-009加连续168小时计算，不按自然日截断。没有此类修改历史时为空，不用首次注册时间补造等待期。仅表示时间条件，仍须校验身份、单份待审、有效版本等；不是审核截止时间或自动提交时间。 |
| F-STORE-012 | `store_business_hours` | C | Struct | 本Store营业日期及时间范围，按Asia/Shanghai解释；由04§3.0.7本店老板维护，不表达固定预约间隔或名额。 |
| F-STORE-013 | `store_temporary_closures` | C | Struct[] | 本Store指定日期临时关闭的明确时间范围，可覆盖某段时间、半天或全天；不默认上午／下午分界，不表示平台停店或自动终止原预约／服务。 |
| F-STORE-014 | `store_business_settings_version` | S | Int | 营业时间／临时关闭有效配置版本；老板合法保存后更新，用于新申请／确认／改期与配置变更的一致性校验，不等同于资料审核有效版本F-STORE-005。 |

修改审核复用现有唯一元字段，不新增含义相同的第二套状态或快照字段：

- F-REV-001／`review_item_id`关联本次审核项，F-REV-004／`review_target_type=store_profile_change`，F-REV-005／`review_target_id=store_profile_change_id`；
- F-REV-007／`submitted_value`保存本次四项完整快照，键沿用F-STORE-001～004；当前有效资料与快照各自有明确版本上下文；
- F-REV-011／`current_review_status`在本业务使用`pending_review / approved / rejected / withdrawn`；撤回后原申请不能批准，修改重提使用新的F-STORE-006及F-REV-001并保留原申请历史。本业务未授予其余通用审核枚举对应动作。审核人／时间／批注复用F-REV-021／022／015；F-REV-003／`row_version`防止过期审核覆盖；
- 提交人、撤回人、撤回时间及前后状态变更复用F-AUD操作者、时间、对象、前后状态及请求标识；撤回不伪填平台审核员或审核完成时间，不能把前端保存成功当作审核通过；
- F-STORE-005与F-STORE-007校验的是业务有效版本，F-REV-003校验的是审核项版本，二者不能互相替代；
- 同一F-CORE-003／`store_id`下最多一个`pending_review`，创建申请须原子校验；撤回与批准通过状态／版本条件原子竞争，以服务端先成功转换者为准，批准与有效资料激活不能割裂。复用F-CORE-010及已有结果保证重试幂等，不凭请求到达顺序决定结果。
- 再次提交固定从上次审核通过并生效的F-STORE-009起等待连续168小时，由F-STORE-011表达可再次提交时间；服务端当前时间小于该值拒绝新提交，等于或大于才满足时间条件，直接API同样校验。F-REV-022与F-STORE-009语义不互换，拒绝／撤回／重复回调不重置起点；没有已生效修改历史时不凭首次注册时间生成等待期。重新校验当前有效版本关联的生效时间，不能信任客户端缓存或时钟，不把可提交误写成自动提交、自动审核通过。
- 复用审核元字段不批准本业务的批量导出／上传等未确认动作；营业执照不得因复用F-REV而进入顾客公开接口。

两项图片引用仅指向已成功上传并经服务端校验的本店材料；上传中的临时预览或失败引用不得进入提交快照。数量、格式、比例、大小及失败恢复按04§3.0.6执行，本模块1MB＝1024×1024字节。未改项沿用原有效引用，图片上传成功不等于审核生效，不据此新增图片数组或第二套同义资料字段。

F-STORE-012～014是04§3.0.7的独立经营配置，同样以F-CORE-003／store_id为唯一门店归属、merchant_id作租户隔离。它们不属于门店资料四项审核快照，不受F-STORE-011的168小时限制；保存与审计复用F-AUD，不能写入固定预约间隔或恢复退役名额字段。各端对营业／临时关闭使用同一有效版本。

### 3.3 门店线下顾客联系资料与新增提醒（CUSTOMER）

04§4.1服务开单的手机号／微信号至少填一个；资料唯一归属当前Merchant的F-CORE-004／customer_id，merchant_id执行租户隔离，store_id使用当前真实经营上下文。不是平台User身份或跨店可公开资料，不新增临时顾客角色／匿名共享客户，也不把同一联系值当全局唯一键自动合并。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CUST-001 | `customer_contact_mobile` | C | Text | 本Customer线下联系手机号；服务开单时与F-CUST-002至少一个非空，手工录入不等于已验证，不写入F-AUTH-001冒充验证结果。已有真实联系资料可带出，不能凭同号抢绑或合并。 |
| F-CUST-002 | `customer_contact_wechat` | C | Text | 本Customer线下联系微信号；服务开单时与F-CUST-001至少一个非空，可同时填写。不是微信昵称、OpenID／UnionID或已验证稳定微信身份，不据此开放线上资产或直接跨店查询。 |
| F-CUST-003 | `customer_creation_reminder_acknowledged_at` | S | Datetime | 04§6.5.1本次明确保存Customer成功后，对实际有权展示提醒点击已阅读继续的服务端时间；原customer_id／业务动作／涉及宠物及内容集合、实际操作者用原F-AUD关联。不由关闭／重试伪造，不成为永久免提醒或顾客共享同意，预约阅读仍独立用F-APPT-030。 |
| F-CUST-004 | `customer_creation_shared_reminder_unavailable` | S | Bool | 本次新增顾客保存后共享提醒查询暂不可用／无权展示的事实，true时统一提示可继续；不表示门店需核验资料真实性。false亦不等于无风险／资料已验证；原因不对外枚举，不覆盖共享授权／额度／冲突限制。 |
| F-CUST-005 | `customer_creation_reminder_continued_at` | S | Datetime | 新增顾客提醒不可用时，员工选择直接继续的服务端时间，无人工核对／资料真实性核验门槛；与F-CUST-004及原实际操作者／业务动作审计关联。不是顾客创建时间、共享查询成功、同意授权或核验完成，不重复建Customer／扣查询次数。 |

04§6.5.1对全部新老顾客的已确认新增／预约流程适用，本店不增加资料真实性核验；新增Customer先明确保存，再提示有权查看内容，提醒失败可直接继续，原输入要求及重复记录处理保持。已读及不可用继续用原业务动作／F-CORE-010幂等上下文和F-AUD的顾客／宠物集合／内容快照、实际人／时间关联；同次同内容一次、变化重读、新业务再提醒，不为去重另建全局客户对象或永久忽略开关。线上安全识别与跨店共享仍分别按03g、03h执行，不写已验证身份／共享同意，不新增所有权验证审批、批量授权或格式长度常数。

## 4. 登录、Customer 绑定与账号安全（AUTH）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-AUTH-001 | `verified_mobile` | C | Text | 已完成所有权验证的手机号。用于联系方式和当前 Merchant 历史 Customer 匹配，不是平台唯一主身份。 |
| F-AUTH-002 | `mobile_verified_at` | S | Datetime | 当前手机号最近一次成功验证时间。 |
| F-AUTH-003 | `current_store_id` | S | ID | 当前客户端门店上下文；切店后全部门店私有数据必须整体切换。 |
| F-AUTH-004 | `last_valid_store_id` | S | ID | 无明确外部目标的普通冷启动可使用的最近有效门店。失效时不得伪造默认门店。 |
| F-AUTH-005 | `customer_binding_status` | S | Enum | User ↔ Customer 关系状态，例如未建立 / 已绑定 / 候选冲突 / 已绑定其他 User / 待人工处理。具体存储枚举阶段 09 收口。 |
| F-AUTH-006 | `matched_customer_id` | S | ID | 当前 Merchant 内安全匹配到的历史 Customer；多候选时不得任意取值。 |
| F-AUTH-007 | `customer_match_count` | S | Int | 当前 Merchant、已验证手机号下可安全识别的候选数量，用于 0 / 1 / 多候选分支。 |
| F-AUTH-008 | `binding_token_id` | S | ID | 店员辅助绑定生成的一次性绑定凭证标识。 |
| F-AUTH-009 | `binding_token_expires_at` | C | Datetime | 一次性绑定凭证失效时间。 |
| F-AUTH-010 | `binding_token_used_at` | C | Datetime | 绑定凭证成功使用时间；使用后必须失效。 |
| F-AUTH-011 | `binding_created_by_staff_id` | C | ID | 生成 Customer 绑定凭证的店员。 |
| F-AUTH-012 | `binding_result` | S | Enum | 绑定成功 / 失败 / 已使用 / 已撤销 / 已过期等结果语义。 |
| F-AUTH-013 | `entry_target_type` | S | Enum | 外部进入目标类型，例如消息、分享、扫码门店、服务结果、公开需求。 |
| F-AUTH-014 | `entry_target_id` | S | ID/Text | 原始业务目标标识；验证 / 广告结束后必须恢复，不得一律跳首页。 |
| F-AUTH-015 | `entry_target_store_id` | S | ID | 原目标真实所属门店；本次有效目标优先于历史门店。 |
| F-AUTH-016 | `reduce_motion_enabled` | C | Bool | “减少动态效果”用户设置，控制现行模块的非必要位移动画；品牌Banner等已确认轮播遵循10a/10b，不据此恢复已退役社交轮播或确认风险模块轮播。 |
| F-AUTH-017 | `account_status` | S | Enum | User 账号当前状态；注销与退出会话分开。 |
| F-AUTH-018 | `session_status` | S | Enum | 当前登录 Session 有效性；退出登录只结束 Session，不删除业务数据。 |

---

## 5. 店员归属、邀请与当前已确认导航（STAFF）

> `04-staff-miniapp.md` 已确认范围以该文档confirmed_scope及已确认子节为准，含§3.0导航、洗美分组、客户页结构、“我的”、老板／员工管理、统一店员资格及记录可见性，§3.0.6～3.0.9的门店资料／营业设置／项目分类与生命周期／全部到店整单调价及免单，§3.2工作台分组顺序及§6.1、§6.5已确认职责。护理执行流程、其他菜单和未决业务仍按对应DEC收口；本注册表不授予业务权限。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-STAFF-001 | `staff_merchant_id` | C | ID | Staff 唯一租户归属，值必须对应 `merchant_id`。一个 Staff 不能属于多个 Merchant。 |
| F-STAFF-002 | `staff_store_assignment_id` | C | ID | 店员可工作门店关系记录标识；删除终止旧关系并保留历史，回原店返聘建立本轮有效关系并仍关联原staff_id；V1同一员工同时至多一家有效门店。 |
| F-STAFF-003 | `staff_store_id` | C | ID | Staff 当前唯一可工作 Store。 |
| F-STAFF-004 | `staff_status` | C | Enum | active / disabled / removed，分别为有效在职／停用／移出本店名单；后两者均禁止本店访问并失效会话，历史身份及业务引用保留。disabled可由老板恢复；removed回本店须新邀请被有效接受，沿用原staff_id进入active并追加任职关系及审计。变为disabled／removed不自动清空或转移原订单F-ORD-038；有效人员可继续原业务及收退款、后续实款归原员工，老板可查历史并明确更正。新归属选择仅active，老板纠正本店历史订单可选原历史身份，见04§3.0.10。 |
| F-STAFF-005 | `staff_invitation_id` | S | ID | 店员邀请记录。 |
| F-STAFF-006 | `staff_invitation_expires_at` | C | Datetime | 邀请失效时间。 |
| F-STAFF-007 | `staff_invitation_status` | C | Enum | 邀请有效 / 已使用 / 已撤销 / 已过期等状态。 |
| F-STAFF-008 | `staff_invitation_created_by` | C | ID | 创建邀请的老板/授权主体。 |
| F-STAFF-009 | `staff_invitation_used_by` | C | ID | 实际使用邀请加入的用户。 |
| F-STAFF-010 | `staff_invitation_used_at` | C | Datetime | 邀请使用时间。 |
| F-STAFF-011 | `staff_disabled_at` | S | Datetime | 最近一次停用实际生效时间；各次变更历史使用F-AUD审计，不覆盖旧事件。 |
| F-STAFF-012 | `staff_removed_at` | S | Datetime | 员工移出本店当前名单及终止有效关系的时间；不表示物理删除账号或经营历史。 |
| F-STAFF-013 | `staff_restored_at` | S | Datetime | 最近一次从disabled恢复active的生效时间；恢复使用当前统一店员资格。 |
| F-STAFF-014 | `staff_rejoined_at` | S | Datetime | 被移出员工通过老板新邀请重新回原店入职的实际生效时间，区别于停用恢复。各轮事件关联既有F-STAFF-005邀请及F-STAFF-002关系标识并追加F-AUD审计，不覆盖原删除和服务时间。 |

当前已确认的店员端一级功能标识固定为：

- `staff_nav.workbench` → 工作台
- `staff_nav.business` → 业务；寄养主入口归此
- `staff_nav.wash_groom` → 洗美；洗护、美容主入口归此
- `staff_nav.customers` → 客户
- `staff_nav.me` → 我的

店员默认业务集合、员工状态和返聘采用02／04已确认规则；`DEC-STAFF-01`～`08`尚未确认的待办流转、其他财务流程／审批、寄养位置等字段不得据统一权限自行补齐，不把已确认到店整单调价／免单重新列为待决。

---

## 6. 预约（APPT）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-APPT-001 | `appointment_id` | S | ID | 预约唯一标识。预约与正式订单 / 服务记录分离。 |
| F-APPT-002 | `appointment_type` | C | Enum | `wash / groom / boarding`。 |
| F-APPT-003 | `appointment_status` | C | Enum | 客户侧至少：待确认、待确认新时间、已确认、已取消、已完成。不得复用服务状态。 |
| F-APPT-004 | `customer_id` | C | ID | 预约所属当前 Merchant Customer。 |
| F-APPT-005 | `pet_ids` | C | Ref[] | 一次预约选择的真实宠物；内部每只宠物建立独立服务项。 |
| F-APPT-006 | `appointment_pet_item_id` | S | ID | 多宠预约中的单宠服务项标识。 |
| F-APPT-007 | `service_category` | S | Enum | 实际服务业务大类：洗护／美容／护理／寄养；护理只供门店开单，不表示预约允许护理。不是经营项目四类入口的business_item_category，也不包含商品。 |
| F-APPT-008 | `service_item_id` | S | ID | 本店服务主资料稳定标识，预约及门店服务开单共用；修改／停用／恢复沿用原ID。商品用原product_id／sku_id，不伪造service_item；边界见04§3.0.8。 |
| F-APPT-009 | `requested_start_at` | S | Datetime | 客户提出的期望到店日期时间，须在营业范围内且未临时关闭，不要求对应固定间隔时段。提交不等于已确认，人工确认及版本切换按03a§11。 |
| F-APPT-010 | `boarding_checkout_at` | S | Datetime | 寄养预约预计离店日期时间。仅寄养使用。 |
| F-APPT-011 | `reference_price` | C | Money | 项目主资料及预约展示的参考价统一逻辑名；主资料值由老板维护，预约当时值按业务上下文保留事实／快照，不能混为同一可覆盖对象。参考价不锁定成交价，本单收款前调价用F-ORD金额字段，不回写项目主资料或预约快照。 |
| F-APPT-012 | `special_request` | C | Text | 本次寄养等场景的临时特殊要求。 |
| F-APPT-013 | `store_suggested_start_at` | S | Datetime | 门店提出的新时间；客户未接受前不得静默覆盖原时间。 |
| F-APPT-014 | `store_response_reason` | S | Text | 04§3.7门店拒绝预约／建议改期的选填真实原因；可空，快捷原因可不选，“其他”也不强制补文字；有填才展示，不自动编造理由，不以API／持久化非空限制拦截。不能放宽挂单、退款、调价等原必填原因。 |
| F-APPT-015 | `customer_time_response_at` | S | Datetime | 客户接受/拒绝门店建议时间的时间。 |
| F-APPT-016 | `appointment_cancel_reason` | S | Text | 预约取消原因。 |
| F-APPT-017 | `appointment_canceled_at` | S | Datetime | 预约取消时间。 |
| F-APPT-018 | `appointment_created_at` | S | Datetime | 预约申请创建时间。 |
| F-APPT-019 | `slot_capacity` | D | Int | 已退役的洗护／美容时段硬名额，永久注册号保留；新代码、API、配置及校验不读写或使用隐藏默认值，仅供历史迁移识别。不是寄养建议容量。 |
| F-APPT-020 | `slot_reserved_count` | D | Int | 已退役的时段占用名额计数，永久注册号保留；不得据此拒绝申请／确认或恢复占用／释放任务。 |
| F-APPT-021 | `reschedule_proposal_id` | S | ID | 单次有效改期提议稳定标识；旧提议不得覆盖新版本。 |
| F-APPT-022 | `appointment_version` | S | Int | 预约乐观并发版本；确认、改期、开始服务使用同一版本校验。 |
| F-APPT-023 | `reschedule_proposal_status` | C | Enum | active / accepted / rejected / withdrawn / expired / superseded；任一时刻最多一个active提议。 |
| F-APPT-024 | `reschedule_proposed_by_actor_type` | S | Enum | customer / staff；用于判断由哪一方提出以及下一步确认方。 |
| F-APPT-025 | `reschedule_proposed_by_actor_id` | S | ID | 发起改期提议的稳定操作者标识。 |
| F-APPT-026 | `reschedule_proposal_expires_at` | S | Datetime | 改期提议有效截止；不得晚于03a§11.5规定的最早截止。 |
| F-APPT-027 | `slot_reservation_status` | D | Enum | 已退役的名额状态；none / reserved / used / released仅供历史迁移识别，不能用于当前预约状态机或后台任务。 |
| F-APPT-028 | `customer_change_cutoff_at` | S | Datetime | 客户可修改／接受改期的服务端截止；等于或晚于该时间禁止修改。已确认预约按当前有效开始时间与建议新开始时间对应截止的较早者计算，未确认申请按当前申请的预约开始时间与建议新开始时间对应截止的较早者计算。取消规则不复用本字段。 |
| F-APPT-029 | `appointment_service_item_snapshot` | S | Struct[] | 预约原提交的真实服务项／宠物关联、service_item_id、项目版本及当时名称／参考价等事实快照，用于停用前旧预约继续确认／转开单的例外校验；不凭同名、旧缓存或客户端声明放行新宠物／停用项目，也不复活终结预约。 |
| F-APPT-030 | `appointment_reminder_acknowledged_at` | S | Datetime | 04§3.7当前预约确认动作中，对实际展示且有权查看的提醒明确点击已阅读继续的服务端时间；原预约／当前版本／所展示提醒及操作者复用F-AUD关联。展示、关闭或点击空白不写此值，不是确认预约或永久忽略开关，不授权取共享数据。 |
| F-APPT-031 | `appointment_shared_reminder_check_incomplete` | S | Bool | 04§3.7／6.5.1当前预约共享提醒查询暂不可用／无法展示的事实，不表示需要门店核验顾客资料真实性；不可用时true并统一提示“共享提醒暂不可用，可继续”。false也不等于无风险或平台事实已核验；不暴露可枚举他店数据的差异原因，不降低原共享权限。 |
| F-APPT-032 | `appointment_reminder_manual_continue_at` | S | Datetime | 共享提醒不可用时，员工选择直接继续当前预约业务的服务端记录时间；不要求门店资料真实性核验或先人工核对。原预约／版本、实际操作者及查询不可用事实用F-AUD关联保留，不要求新增必填原因。不是共享查询成功、预约确认时间、身份冲突解除或自动收款；原本店身份／营业／截止／版本等校验仍须通过。 |

03a§11的当前模型为门店人工确认。F-APPT-019／020／027退役不删除历史、不回收注册号，也不删除预约版本、改期提议或6小时截止字段。新申请、人工确认及接受改期关联F-STORE-012～014校验目标时间，不以固定间隔网格或硬名额计数限制接待；同一预约并发转换仍校验F-APPT-022，多宠同批全成全败。寄养建议容量提醒按03a§7单独执行，不借此恢复洗美名额。

### 6.1 轻量服务项目主资料（SERVICE_ITEM）

04§3.0.8已确认四类入口、三类服务的四项表单／校验、保存生效、启停恢复及旧预约例外；03d§10.1／04§3.0.9已确认全部到店消费订单不限幅整单调价及免单。主资料以store_id为唯一Store归属、merchant_id作租户隔离；服务标识复用F-APPT-008，实际服务大类F-APPT-007，参考价F-APPT-011。不另建第二套项目或价款账本。

F-SITEM-005四类是管理／开单入口归类，不等于客户端预约类型F-APPT-002、实际服务类型F-SVC-002或商品自定义分类F-PROD-003。商品分支仅选择／关联本店F-PROD-001／002已有商品／SKU，名称、售价、说明及库存从原商品主资料读取，不复制为service_item或用服务表单限制截断既有商品；护理仅门店开单，不新增客户端护理预约，原寄养业务仍独立保留。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-SITEM-001 | `service_item_enabled` | S | Bool | 服务项目可用状态；新增成功默认true，老板停用设false、恢复沿用原ID设true。停用阻止全新选择，原预约原项例外须校验F-APPT-029及有效预约，不放行新宠物／项目或终结预约。 |
| F-SITEM-002 | `service_item_version` | S | Int | 服务项目主资料版本；用于修改／停用与新业务提交的并发校验，不能用新内容覆盖旧预约、订单或服务事实／快照，不代替F-APPT-022预约版本。 |
| F-SITEM-003 | `service_item_name` | C | Text | 三类服务项目名称，必填、去首尾空白后1～30个Unicode字符；同类同名提醒不禁止，不按名称合并或覆盖历史，名称不替代稳定ID。 |
| F-SITEM-004 | `service_item_description` | C | Text | 三类服务说明，选填、最多300个Unicode字符，不强制图片或夹带工时／排班／复杂套餐参数。 |
| F-SITEM-005 | `business_item_category` | C | Enum | 管理／开单入口固定wash / groom / care / product，对应洗护／美容／护理／商品；前三类使用服务主资料，product仅关联原商品／SKU，不重写预约、服务或商品分类枚举。 |

三类服务参考价复用F-APPT-011，必填、大于0、最多两位小数，不用0表示待定；字数按Unicode码点而非字节校验。四项服务表单不覆盖03e商品字段及SKU售价。项目由本店老板维护，新增／修改合法保存后生效，不需平台审核或168小时等待；原ID恢复不改历史。F-AUD记录变更；不新增工时／排班／复杂服务套餐，护理12项流程按04§4.5，其余明确未决细节仍待对应DEC，不把本节确认扩大为完整平台已解阻。

本单收费复用F-ORD-008／009／010保留原始明细及应收，F-ORD-011／012仅历史读取、退役禁新写，F-ORD-013统一记录包含券及活动优惠的人工调价差额、F-ORD-014最终应收；F-ORD-018～020及033记录原因、操作人及服务端时间。不能直接改写reference_price、明细原价或paid_amount冒充本单调价；实收或免单成功后锁定及幂等／并发校验见03d§10.1、04§3.0.9。

---

## 7. 宠物档案、护理、寄养资料与服务相册（PET）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PET-001 | `pet_id` | C | ID | 宠物稳定标识。只作为业务关联，不自动授予读取完整档案的权限。 |
| F-PET-002 | `pet_name` | C | Text | 宠物名称／门店表单“宠物昵称”唯一字段；首次建档及04§4.1服务开单必填，不另建dog_name，不限制仅狗使用。 |
| F-PET-003 | `pet_type` | C | Enum/Text | 猫 / 狗 / 其他；首次建档必填。 |
| F-PET-004 | `pet_avatar` | C | Ref | 宠物头像，选填。 |
| F-PET-005 | `pet_breed` | C | Text | 品种：客户端首次建档选填，门店宠物服务开单必填，缺失补齐／已有值复用；确不明确可填混种／不详，不强迫猜或AI认定。普通商品不强制宠物，公开范围按对应视图。 |
| F-PET-006 | `pet_sex` | C | Enum | 性别，选填。 |
| F-PET-007 | `pet_birth_date` | C | Date | 出生日期，选填。 |
| F-PET-008 | `pet_age` | C | Number/Text | 由出生日期派生的展示年龄，不要求每年人工覆盖。 |
| F-PET-009 | `current_weight` | C | Number | 当前最新体重；历史值另存体重记录。 |
| F-PET-010 | `is_neutered` | C | Bool | 是否绝育。 |
| F-PET-011 | `temperament` | C | Enum/Text | 性格，如温顺、胆小、活泼、敏感等。 |
| F-PET-012 | `fear_water` | S | Bool | 护理注意：怕水。 |
| F-PET-013 | `fear_dryer` | S | Bool | 护理注意：怕吹风。 |
| F-PET-014 | `fear_nail_trim` | S | Bool | 护理注意：怕剪指甲。 |
| F-PET-015 | `stress_prone` | S | Bool | 护理注意：容易应激。 |
| F-PET-016 | `stranger_sensitive` | S | Bool | 护理注意：不喜欢陌生人。 |
| F-PET-017 | `care_notes` | C | Text | 客户可维护的其他护理注意事项。 |
| F-PET-018 | `feeding_habit` | C | Text/Struct | 长期喂食习惯。 |
| F-PET-019 | `meals_per_day` | C | Int | 每日餐数。 |
| F-PET-020 | `food_source` | S | Enum | 自带粮 / 门店粮等长期偏好。 |
| F-PET-021 | `walk_habit` | C | Text/Struct | 遛宠习惯。 |
| F-PET-022 | `allergy_notes` | C | Text | 已明确记录的过敏情况；属于敏感宠物资料，仅在实际照护必要且有权限的场景使用。 |
| F-PET-023 | `diet_restrictions` | C | Text | 禁食 / 忌口信息。 |
| F-PET-024 | `long_term_medication` | C | Text | 长期用药信息；敏感资料。 |
| F-PET-025 | `special_care` | C | Text | 特殊照护文字要求，含04§5.4代喂药时主人交代的药名／用法用量等；本次要求进入F-BOARD-020快照，临时修改不自动回写长期资料。来源长期用药仍F-PET-024，不等于门店已接收或已执行，系统／AI不生成或修改用药方案。 |
| F-PET-026 | `boarding_feed_allowed` | C | Bool | 寄养期间是否允许额外投喂零食；控制寄养加餐入口。 |
| F-PET-027 | `boarding_notes` | C | Text | 其他寄养备注。 |
| F-PET-028 | `merchant_internal_pet_notes` | C | Text | 当前 Merchant 内部门店备注，客户端默认不可见且不得跨商户共享。 |
| F-PET-029 | `pet_archive_status` | S | Enum | 正常 / 已归档等语义；有历史数据的宠物不物理删除。 |
| F-PET-030 | `pet_archived_at` | S | Datetime | 宠物归档时间。 |
| F-PET-031 | `pet_weight_record_id` | S | ID | 单条体重历史记录。 |
| F-PET-032 | `weight_value` | C | Number | 本次体重值。 |
| F-PET-033 | `weight_measured_at` | C | Datetime | 测量 / 记录时间。 |
| F-PET-034 | `weight_source_type` | C | Enum | 客户、店员、服务记录等数据来源。 |
| F-PET-035 | `weight_recorded_by_id` | C | ID | 记录人（如适用）。 |
| F-PET-036 | `service_media_id` | S | ID | 宠物服务相册单个媒体标识。 |
| F-PET-037 | `service_record_id` | C | ID | 照片所属真实服务记录；04§4.4洗美／§4.5独立护理正常已完成均可补图（含已结算），归属原店／宠物／服务不变，保留原媒体关联及修改审计，不重开或改账。 |
| F-PET-038 | `comparison_group_id` | S | ID | 同一次服务 N 组前后对比中的组标识。 |
| F-PET-039 | `media_stage` | S | Enum | `before / after`，表达服务前 / 服务后。 |
| F-PET-040 | `media_sort_order` | S | Int | 同一服务 / 对比组中的稳定排序。 |
| F-PET-041 | `media_asset_ref` | S | Ref | 图片 / 视频资源引用。 |
| F-PET-042 | `social_public_allowed` | D | Bool | 已退役宠物交友照片公开字段；仅用于旧数据迁移，不得在新业务继续写入。 |
| F-PET-043 | `pet_safety_profile_id` | S | ID | 宠物行为与服务安全档案标识。 |
| F-PET-044 | `pet_behavior_tag_keys` | S | Text[]/Struct | 标准化服务行为标签，如怕吹风、抗拒剪指甲、护食、挣脱倾向等。 |
| F-PET-045 | `pet_behavior_source_type` | S | Enum | `owner_reported / staff_observed / incident_recorded / verified_by_multiple_services`。 |
| F-PET-046 | `pet_behavior_last_observed_at` | S | Datetime | 最近观察 / 确认该行为的时间。 |
| F-PET-047 | `pet_behavior_source_store_id` | S | ID | 行为记录来源门店；不因此授予该门店读取其他商户资料权限。 |
| F-PET-048 | `pet_behavior_source_service_record_id` | S | ID | 关联真实服务事件时使用。 |
| F-PET-049 | `cross_store_safety_share_status` | P | Enum | 跨门店安全档案共享状态；可见范围和主人授权受 DEC-PETSAFETY-01 阻塞。 |
| F-PET-050 | `pet_safety_review_status` | P | Enum | 平台跨店共享审核状态；审核规则未完全冻结。 |
| F-PET-051 | `current_food_brand_id` | C | ID | 当前食用的标准宠物食品品牌；0～1 个。作为食品风险订阅主匹配键。 |
| F-PET-052 | `current_food_brand_display_name` | S | Text | 当前客户端显示品牌名称。 |
| F-PET-053 | `current_food_brand_input_type` | S | Enum | `catalog / custom`；标准列表或“其他”自定义输入。 |
| F-PET-054 | `current_food_brand_custom_text` | C | Text | 选择“其他”时保存用户原始品牌输入；标准品牌时为空。 |
| F-PET-055 | `current_food_brand_match_status` | S | Enum | `matched / pending_identification`；未可靠归一时不得强行风险匹配。 |
| F-PET-056 | `current_food_brand_updated_at` | S | Datetime | 当前品牌最近一次更新 / 清空时间。 |

---

## 8. 服务记录、洗护美容结果与寄养动态（SVC / BOARD）

### 8.1 服务、洗美与护理结果

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-SVC-001 | `service_record_id` | S | ID | 一次真实洗护／美容／护理／寄养服务记录标识。 |
| F-SVC-002 | `service_type` | C | Enum | 洗护／美容／护理／寄养；独立care护理仅门店开单，按04§4.5，不开放客户端预约、护理AI报告或医疗流程。同宠洗美护理加项不改原服务类型／另建care流程；商品不属于此枚举。 |
| F-SVC-003 | `service_customer_status` | C | Enum | 客户侧简化状态；洗美不得直接暴露全部店员内部步骤。洗美按04§4.4、独立护理按§4.5，中止均无本次顾客过程／完成结果、不发中止通知；精确状态文案仍待确认，不假映射completed。 |
| F-SVC-004 | `service_internal_status` | S | Enum | 洗美及04§4.5独立护理复用not_started／in_progress／completed／cancelled／interrupted，由本店有效员工手动操作；开单不自动开始。已完成仅未结算原单可重新处理、原因选填但审计，已结算不重开。04§4.4洗美／独立护理一旦cancelled或interrupted，原记录不得转回not_started／in_progress／completed，误点或未结算也不例外；要开始须新order_id／service_record_id，从not_started及新检查重新办理，旧单历史保留，不提供恢复动作／通知。不为同宠洗美护理加项另设进度，不自动付款／交付，不套寄养。 |
| F-SVC-005 | `service_started_at` | S | Datetime | 实际开始服务时间。 |
| F-SVC-006 | `service_completed_at` | S | Datetime | 实际完成服务时间。 |
| F-SVC-007 | `service_result_viewed_at` | S | Datetime | 客户真正查看本次结果时间；查看后完成卡可退出首页当前服务。 |
| F-SVC-008 | `service_summary` | C | Text/Struct | 本次服务摘要／结构化服务记录；04§4.4洗美／§4.5独立护理正常已完成均允许本店老板／有效员工更正普通文字，含已结算、无审批／原因选填，旧内容及修改人／时间留存、顾客默认最新有权内容，不覆盖检查结论／实际时间／收费。洗美／独立护理中止不向顾客返回本次过程或完成结果，已保存的内部真实记录不删除；中止选填说明复用F-AUD-009，不另建原因字段。独立护理普通过程文字选填、无文字如实展示项目和结果，不免除异常／无法检查等必要说明，不混入内部备注或伪造正常。 |
| F-SVC-009 | `service_staff_ids` | S | Ref[] | 实际服务员工稳定引用；员工离职不改写历史。 |
| F-SVC-010 | `service_duration` | C | Number | 实际服务时长记录语义，计算口径后续架构可细化；04§3.0.8排除员工工时核算不删除本字段，也不得据此新增员工工时、工资或提成算法。 |
| F-SVC-011 | `service_abnormal_notes` | C | Text | 服务中异常情况。 |
| F-SVC-012 | `ai_report_task_id` | S | ID | AI 洗护报告任务标识；须顾客主动选择并满足原授权／有效资格才创建，不因服务完成、补图／普通文字更正或页面打开自动创建／重生成，不授予店员代为触发。 |
| F-SVC-013 | `ai_report_status` | S | Enum | 未创建 / 生成中 / 已完成 / 失败等真实任务状态。 |
| F-SVC-014 | `ai_report_entitlement_id` | S | ID | 对应 `ai_report` 激励广告获得的报告资格。 |
| F-SVC-015 | `ai_report_content` | S | Struct/Text | 已生成的洗美护理／外观观察报告，不作为医疗诊断；门店补图／普通文字更正不自动覆写或重生成原报告，原真实任务／报告保留，不冒充已分析新素材；AI仍由顾客选择、沿原资格，新素材再分析版本／复用契约待后续。文中的护理观察不等于独立care业务可生成AI报告，care无此新增能力。 |
| F-SVC-016 | `pre_service_check_status` | C | Enum | 共用not_checked／no_obvious_abnormality／abnormal／unable_to_check，默认未检查。洗美按六项F-SVC-020；独立护理按04§4.5只做一次真实整体三选一，不强填六项。未检查不得开始，异常／无法检查须F-SVC-021主人决定及说明，不伪记正常或输出医疗诊断。 |
| F-SVC-017 | `pre_service_checked_at` | S | Datetime | 本service_record_id前检查实际完成的服务端记录时间；不通过空勾选或补录时间伪造检查，不与服务实际开始时间混用。 |
| F-SVC-018 | `pre_service_checked_by_staff_id` | S | ID | 实际检查的本店有效员工；关联稳定staff_id，离职不改历史，照片不强制。 |
| F-SVC-019 | `service_record_version` | S | Int | 同一宠物服务记录的操作版本，供检查／开始／完成／重新处理／时间更正及04§4.4已完成补图／普通文字更正及§4.5独立护理相同补改等竞态校验；补改沿本版本及F-AUD保留前后内容／人／时间，原因F-AUD-009选填；独立护理真实补改保存的消息按F-AUD原稳定请求／事件及本版本去重，不以F-SVC-023造新完成事件，重试不重复，旧版本不能覆盖新改；不替代订单金额版本或审核row_version，不表示所有待决动作已获批准。 |
| F-SVC-020 | `pre_service_check_items` | C | Struct[] | 洗美service_record_id的skin／ears／eyes／mouth／nails／coat六项真实结果及必要说明，不默认正常；独立护理不强制此六项数组，改用F-SVC-016整体检查。同宠洗美护理加项仍须原洗美六项，不因加项减免。非中止服务本人可见真实护理注意事项；洗美中止按04§4.4不对顾客返回本次过程，内部已保存检查保留、不能跳过原开始检查。内部备注不混入。 |
| F-SVC-021 | `pre_service_owner_decision` | C | Enum | 洗美／护理异常或无法检查时宠物主人已明确表达的continue_authorized或discontinue，未记录为空、不默认同意；店员记录告知及真实决定，说明复用F-SVC-008／011，操作时间／人复用F-AUD。不是线上身份验证、医疗同意书或跨店共享授权。 |
| F-SVC-022 | `post_service_has_new_abnormality` | C | Bool | 洗美及独立护理完成前是否新增异常，未确认为空，须真实确认为false或true；true须F-SVC-011说明，不强制照片或重复整套前检查，不因无照片拒绝完成。 |
| F-SVC-023 | `service_result_version` | S | Int | 本宠普通结果的真实发布版本；完成发布，未结算重新处理后旧版保留历史、非当前最终，再完成新版本并对应新完成事件。正常已完成后仅补图／改普通文字不构成新的完成发布，不推进本完成轮次或重置查看事实；内容补改版本用F-SVC-019及F-AUD，不冒充顾客看过新增内容。不是AI权益／任务版本，不自动重置资格或启动AI。 |
| F-SVC-024 | `service_result_viewed_version` | S | Int | 本人顾客实际查看的普通结果版本，配合F-SVC-007记录；不能用已看旧版冒充看过重新完成的新结果。旧版及当前版可见性仍须同一Customer权限校验。 |

洗美多宠一order_id、每宠独立service_record_id／pet_id及对应原明细，按merchant_id隔离，不新建第二账本。全部服务结束且异常费用明确可一起结算，不按宠拆账／分次付款；正常完成后收费，中止可明确实际应收／原因后结算、不伪记完成，全未开始即全取消不收费、不记免单成交。照片可选、普通结果正常完成发布，无接走确认；洗美中止说明选填（F-AUD-009），不向顾客提供本次过程／完成结果、不发中止通知，内部已有事实／素材留存。中止状态保存不以收费原因为前提，收费另按原实际应收及独立原因；未结算重开原因选填，挂单手动且原因必填，改0后仍明确免单，不自动结算。

F-SVC-005／006允许按04§4.3补录／更正实际时间：须原因及原值／更正记录，结束不早于开始、不填未来，不重写原操作时间、付款或真实服务事实。操作人／时间／前后值／原因复用F-AUD，不增加提成／默认业绩分配；其他有效员工可接手。

独立护理按04§4.5复用原order_id、每宠service_record_id／pet_id、服务项、前检查／主人决定／复检、普通结果与版本字段，不新增一套care_order或care_check同义字段。同客多宠一单、独立进度、正常完成后收款／中止实际费用例外、一起结算，全未开始取消不收费。完成发布本人普通结果，不等记账，不新增护理AI；未结算重开原因选填、保留历史，已结算不重开。同宠洗美加护理共用原单／进度，不改service_type、不减免六项检查；不授权商品／寄养混单或扩展跨店共享。 2026-11-02补充：中止操作说明F-AUD-009选填、无顾客本次过程／结果或中止消息，原内部事实保留，独立收费原因另按原规则；正常已完成含已结算补图／普通文字更正，本店有效人员无审批、原因选填、保留前后内容／人／时间、顾客默认最新，不改检查结论／实际时间／收费明细、不重开不改账。真实开始／完成与再次完成／补改保存分别普通／重要／普通通知，沿原F-MSG生成，授权微信可用时尝试，短信暂未开放；请求／事件／019版本防重，新消息独立未读，023／024仍是原完成／查看轮次。同宠洗美加护理不另发护理消息，洗美补改仍不通知；无新增AI。

取消／中止后重新开单共用说明（04§4.4）：洗美／独立护理原F-SVC-004为cancelled／interrupted时不接受恢复；误点、未结算亦同，不新增恢复状态／原因／通知字段或保留可调用的恢复接口。使用正常开单生成新的F-ORD-001／F-SVC-001及本次项目／前检查／主人决定／实际时间，初始not_started和not_checked；可沿已有Customer／Pet引用，不复制旧检查、结果／已读或AI任务作为新事实。原终止历史／审计／财务保持，旧F-SVC-019版本请求不复活旧记录；新单按正常原对象／版本／幂等校验，不自动收退款／结清或转移旧款券库存。既有F-SVC和F-ORD永久ID、版本字段继续供原业务使用，不因移除恢复方案而退役；已完成未结算重新处理、正常内容补改、食品提醒恢复待知悉不受本项排除影响。

### 8.2 寄养与时间轴

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-BOARD-001 | `boarding_id` | C | ID | 一次有效寄养业务标识。 |
| F-BOARD-002 | `boarding_status` | C | Enum | 客户侧寄养中／已离店（承接原已完成业务语义）／已取消；04§5.2在结算流程确认本批应收时自动记已离店，无第二确认接走。付款另用F-ORD-017，已离店未收款可挂单，不保持在住或继续计费；不因欠款回退在住。 |
| F-BOARD-003 | `check_in_at` | C | Datetime | 寄养记录的实际入住时间，必填、默认当前时间；不能与F-APPT-009预约计划时间混用。确认须实际到店，改值保留原值与操作记录。 |
| F-BOARD-004 | `expected_checkout_at` | S | Datetime | 本次预计离店时间，必填且晚于实际入住；到点只提醒，不自动离店／续住／加费，实际离店仍是F-BOARD-005。 |
| F-BOARD-005 | `actual_checkout_at` | S | Datetime | 真实离店时间，默认服务端当前时间，结算费用确认时可补填真实过去时间；服务端校验check_in_at≤本值≤当前时间，改值保留原值／人／记录时间。同次本批费用确认即记已离店，非另一次确认接走。未收款／挂单亦以本值停止本次计费，不用预约／预计／收款或录入时间代替；后续收款不重写本值，历史更正仍待04§5.3。 |
| F-BOARD-006 | `boarding_day_index` | S | Int | 当前第几天的展示派生值，不是计费晚数；计费统一F-BOARD-029，不因03:00计费规则静默修改原日序展示。 |
| F-BOARD-007 | `boarding_event_id` | S | ID | 寄养时间轴单条动态。 |
| F-BOARD-008 | `boarding_event_type` | C | Enum | 原时间轴事件类型继续含喂食、饮水、排泄、遛宠、玩耍、休息、清洁、特殊照护（含代喂药）、媒体、加餐、异常、自定义等；04§5.1统一照护表单只单选feeding=喂食／walking=遛狗／cleaning=清扫笼子，不新增同义动作字段，也不删除其他既有事件；04§5.4特殊照护统一包含代喂药，原事件类型与原时间轴复用，不设独立药品订单／喂药快捷动作。 |
| F-BOARD-009 | `occurred_at` | C | Datetime | 实际发生时间；统一照护录入必须选择并确认，允许真实历史补录、不录未来已完成动作，时间轴按此倒序，不由照片或录入时间代替。 |
| F-BOARD-010 | `recorded_at` | C | Datetime | 系统录入时间；补录时不得冒充真实发生时间。 |
| F-BOARD-011 | `boarding_event_content` | S | Text/Struct | 动态正文／结构化动作内容；04§5.4特殊照护记录本次真实执行内容，异常记录具体观察及已采取处理，不要求疾病诊断。不以保存要求／接收决定替代真实执行，不包含系统／AI生成的用药方案；内部内容仍受F-BOARD-025控制。 |
| F-BOARD-012 | `boarding_event_media_refs` | S | Ref[] | 与该宠物／该次事件关联的真实图片／视频；统一照护及04§5.4特殊照护／异常照片均选填、无每日配额、不跨宠自动复用，缺图不阻止保存真实记录，沿用媒体权限。健康／疫苗资料照片另归F-BOARD-032，不伪造执行事件。 |
| F-BOARD-013 | `boarding_event_created_by_staff_id` | S | ID | 录入该动态的店员；04§5.4特殊照护实际执行人另用F-BOARD-036，不用补录者冒充执行者。 |
| F-BOARD-014 | `notify_customer` | C | Bool | 是否主动提醒顾客，不决定F-BOARD-025可见性；false不隐藏顾客可见动态，内部记录即使勾选也不能发给顾客。异常通知原默认规则保留，通知／已读不关闭处理待办。 |
| F-BOARD-015 | `boarding_feed_execution_status` | D | Enum | 2026-11-01退役：取消商品加餐独立投喂执行流程。保留永久注册号／逻辑名供追溯，不创建新字段／API或继续写入；真实照护需要时使用F-BOARD-007～013另记，不以付款推断喂食。 |
| F-BOARD-016 | `fed_at` | D | Datetime | 2026-11-01退役：取消商品加餐独立投喂执行流程。保留永久注册号／逻辑名供追溯，不创建新字段／API或继续写入；真实照护需要时使用F-BOARD-007～013另记，不以付款推断喂食。 |
| F-BOARD-017 | `fed_by_staff_id` | D | ID | 2026-11-01退役：取消商品加餐独立投喂执行流程。保留永久注册号／逻辑名供追溯，不创建新字段／API或继续写入；真实照护需要时使用F-BOARD-007～013另记，不以付款推断喂食。 |
| F-BOARD-018 | `feed_timeline_event_id` | D | ID | 2026-11-01退役：取消商品加餐独立投喂执行流程。保留永久注册号／逻辑名供追溯，不创建新字段／API或继续写入；真实照护需要时使用F-BOARD-007～013另记，不以付款推断喂食。 |
| F-BOARD-019 | `boarding_location_label` | S | Text | 本次寄养位置的选填简单文字，如A01笼位／客厅散养；同店相同位置已有在住宠物只提醒，不代表房型／房价／笼位库存或硬容量。 |
| F-BOARD-020 | `boarding_profile_snapshot` | S | Struct | 本次寄养资料，按F-PET-018～027等已确认寄养字段带入；临时修改只影响当前寄养，明确同步且有原字段维护权才回写长期档案。不是第二个Pet，不含可由员工代改的当前食品品牌或跨店授权。当前加餐必须读取本次有效资料，不能只读长期档案旧值。 |
| F-BOARD-021 | `boarding_belongings` | S | Text/Struct | 选填随带物品文字及真实媒体引用；不强制逐件建档，不自动成为销售／库存对象，不因入住就默认向顾客或其他门店公开。 |
| F-BOARD-022 | `boarding_admission_check_status` | S | Enum | not_checked／no_obvious_abnormality／abnormal／unable_to_check，默认未检查；入住前必须真实三选一，异常／无法检查须说明及沟通后接收决定，不强填洗美六项、不表示医学检查。 |
| F-BOARD-023 | `boarding_admission_notes` | S | Text | 入住异常／无法检查的必要说明，以及与宠物主人沟通后本店接收或不接收决定的说明；04§5.4主人提供的本次健康资料文字／核对备注复用本值，不强制无异常时伪填病情。资料状态031、选填照片032分别记录；不接收不创建有效入住。 |
| F-BOARD-024 | `boarding_admission_decision` | S | Enum | accepted／declined；本店员工核对后的真实接收／不接收决定，未完成为空，不默认接收。疫苗资料可不上传、缺资料不自动拒绝的人工决定按04§5.4，缺必需检查仍不得入住；不是老板审批或有效入住本身，也不代表医学准入判断。 |
| F-BOARD-025 | `boarding_event_visibility` | S | Enum | customer_visible／store_internal，由明确所属入口／表单确定，不从notify_customer推断。store_internal不进入顾客API、动态数量、缩略图、时间轴或消息；customer_visible关闭提醒仍可查看。 |
| F-BOARD-026 | `boarding_abnormal_handling_status` | S | Enum | pending／handled，关联原寄养异常；实际处理并有F-BOARD-027结果后，员工明确标已处理。消息发送／顾客已读／普通照护保存／跨天不自动关闭；操作者、时间及变更复用F-AUD，不等于寄养已结束。 |
| F-BOARD-027 | `boarding_abnormal_handling_result` | S | Text | 异常已处理时必填的真实处理结果；不是医学判断，处理人与时间留痕，不以通知状态代替。 |
| F-BOARD-028 | `boarding_profile_unverified_fields` | S | Ref[] | 本次仍待核实的寄养资料字段注册号列表，与F-BOARD-020配合；未知不填假餐数／无过敏／允许零食。F-PET-026未核实不判允许，本次加餐不拿长期旧授权绕过，矛盾须核实、不伪造安全结论。 |
| F-BOARD-029 | `boarding_billable_nights` | S | Int | 04§5.2结算计费晚数，由服务端按Asia/Shanghai每日03:00统计check_in_at<截点≤actual_checkout_at的非负整数；每晚收一天，0晚无寄养费。入住截点排除、离店截点包含；不同于F-BOARD-006日序，不按24小时向上取整或录入／预计离店算。未实际离店的试算须明确是预计值，不冒充最终计费／实收，也不自动扣款或免单；逐宠乘本次F-ORD-008日价得基础金额，合并结算不改本宠晚数；日价更正／离店后金额调整按04§5.2第14～18项，不改变实际晚数；挂单查询／人工联系及撤销按04§4.6，不由本字段另定计费／催款规则。 |
| F-BOARD-030 | `boarding_checkout_confirmed_at` | S | Datetime | 服务端接受本批结算应收确认、同次记录该宠实际离店的业务确认时间，复用本批原订单／明细和审计关联；不是新的一步确认接走。不同于F-BOARD-005真实离店与F-ORD-023财务settled_at；未付款仍可有本值而无财务settled_at，后续收款不重写。操作者／前后值复用F-AUD，不生成虚假付款或第二账本。 |
| F-BOARD-031 | `boarding_health_material_status` | S | Enum | 04§5.4本次疫苗／健康资料状态provided／not_provided／unverified（已提供／未提供／待核实），人工如实记录，不预填已提供；provided不代表核实通过或已完成疫苗。缺资料不自动拒绝，必要入住检查仍须完成。 |
| F-BOARD-032 | `boarding_health_material_refs` | S | Ref[] | 本次接宠时主人提供的健康／疫苗资料选填照片引用；空数组合法，说明复用F-BOARD-023，不借用随带物品或创建第二宠物档案，不因上传即认定疫苗有效或公开／跨店共享。 |
| F-BOARD-033 | `boarding_special_care_acceptance` | S | Enum | 本次寄养对应特殊照护要求（含代喂药）的门店接收决定accepted／declined；未确认时为空，不默认接受，不因长期用药有值自动接收。具体接收哪些要求在F-BOARD-020内原F-PET-025本次文字要求中明确；拒绝相应特殊照护不等于自动拒绝整笔入住，不表示已执行或医学授权。 |
| F-BOARD-034 | `boarding_abnormal_contact_status` | S | Enum | 关联原寄养异常事件的真实主人联系状态contacted／not_reached（已联系／暂未联系上）；未记录时为空，不默认已联系或主人同意，不等于F-BOARD-026已处理。后续更新前后状态用原审计保留，不公开内部联络信息。 |
| F-BOARD-035 | `boarding_abnormal_contact_result` | S | Text | 原寄养异常的真实沟通结果、主人明确表达的决定及未联系上的事实说明；与F-BOARD-034关联原F-BOARD-007，不凭电话／通知／已读生成同意，不把结果文本保存当作异常关闭；内部沟通备注不自动向顾客或跨店公开。 |
| F-BOARD-036 | `boarding_event_performed_by_staff_id` | S | ID | 04§5.4特殊照护（含代喂药）事件的真实执行人，关联本宠原寄养事件；与F-BOARD-013录入人分开，不能将补录者默认写成执行者。实际执行时间复用F-BOARD-009，录入时间010、内容011、选填媒体012；不另建喂药业务对象或医疗方案。 |

04§5.1确认本店同一pet_id最多一笔未结束有效寄养，多宠每只独立boarding_id／位置／时间；结合原预约、Customer／Pet、F-CORE-010幂等请求及审计防重复／并发，不以昵称或手机号自动合并，多宠一起结算按04§5.2、不能合并各宠入住事实。统一照护复用F-BOARD-007～013，不新建care_event同义字段；加餐商品按普通销售，真实喂食需要时从原照护表单另记，不生成销售／扣库存／扣余额，不要求先收款；F-BOARD-015～018已退役，不再作为现行执行依赖。04§5.2已确认03:00过夜计数与实际离店结算，延期／提前离店据实重算、0晚无寄养费；复用F-CORE-009与实际入住／离店，计费晚数F-BOARD-029，不用预计／录入时间或F-BOARD-006。日价复用F-ORD-008在入住时逐宠设置、本次保存，基础明细F-ORD-009＝本宠日价×本宠F-BOARD-029，同店同客多宠可一起结算并汇总F-ORD-010；不另造boarding_daily_rate同义字段。04§5.2第14～18项已确认：离店确认前可留痕更正整次正日价，不分段／不自动跟随门店涨价；免费走最终应收调0及明确免单，0晚费用仍为0。已离店未付只调原本批最终应收，不重写日价／晚数／基础快照／离店；已收款／免单不直接改账。挂单查询／人工联系及撤销按04§4.6，健康资料／特殊照护及异常沟通按04§5.4已定；特殊交接与离店时间等历史更正、已结算独立更正流程仍待决，医疗处置／紧急升级等仍待DEC-STAFF-05／06。

寄养分批离店按04§5.2分别结算，复用F-ORD-001／005／029／030关联本批原寄养明细，F-ORD-009／010／014／015、F-PAY及免单记录只对应本批有效范围；其余在住明细不被标已结算，已结算明细不重新入账。F-BOARD-005／029按每宠真实时间与晚数保留，不新增同义分批账本或覆盖其他宠物；挂单查询／人工联系及撤销按04§4.6；优惠／退款分摊等未确认规则不由字段存在而解锁。

04§5.2费用确认同次记已离店，无第二确认接走；F-BOARD-030记录业务确认时间，F-BOARD-005记录真实离店，F-ORD-023只记实际收款／明确免单成功的财务结算，两者不能共用。已离店未付保留F-ORD-017未结算，手动F-ORD-034／035挂单原因必填并复用F-AUD-009，不新建第二挂账单；付清／免单解除标记。补收款不重写F-BOARD-005／029或重新积累计费，亦不因欠款把F-BOARD-002设为在住。

---

## 9. 钱包、余额流水与单次充值（WALLET）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-WAL-001 | `wallet_account_id` | S | ID | 某 Merchant Customer 的商户钱包账户标识。平台积分不进入此账户。 |
| F-WAL-002 | `available_balance` | C | Money | 客户当前总可用余额；客户端资产卡主金额。 |
| F-WAL-003 | `principal_balance` | C | Money | 当前本金余额；老板／有效员工可按04§3.0.14以本字段填写修改后的非负目标值，系统计算差额并留流水，不以此改原充值实收。 |
| F-WAL-004 | `bonus_balance` | C | Money | 当前赠送余额；余额修改时可填写非负目标值并按差额留流水，与本金分开，不通过直接改总额丢失分项。 |
| F-WAL-005 | `available_coupon_count` | C | Int | 当前 Merchant 下可使用优惠券数量。 |
| F-WAL-006 | `balance_ledger_id` | S | ID | 单条不可删除的余额流水。 |
| F-WAL-007 | `balance_change_type` | C | Enum | 充值、赠送、消费、退款、人工增加、人工扣减、冲正、历史初始化等。 |
| F-WAL-008 | `balance_before` | C | Money | 变动前总余额。 |
| F-WAL-009 | `balance_delta` | C | Money | 本次总余额变化值。 |
| F-WAL-010 | `balance_after` | C | Money | 变动后总余额。 |
| F-WAL-011 | `principal_delta` | C | Money | 本次本金部分真实变化；消费先扣本金，退款只恢复原交易本金部分、不与赠送互转，须关联原消费流水／订单。 |
| F-WAL-012 | `bonus_delta` | C | Money | 本次赠送部分真实变化；消费本金不足才扣赠送，原赠送退款退原赠送，不转本金或现金；部分退款分配待03c§5。 |
| F-WAL-013 | `related_business_type` | S | Enum/Text | 关联订单、充值单、退款等业务类型。 |
| F-WAL-014 | `related_business_id` | C | ID | 关联订单或充值单等真实业务。 |
| F-WAL-015 | `wallet_operator_staff_id` | C | ID | 人工/门店侧关键钱包操作员工。 |
| F-WAL-016 | `wallet_change_reason` | C | Text | 调整／冲正／退款等原因；原充值更正／撤销或当前余额修改时均必填、去空白非空，沿04§3.0.13。本次原因不能用旧赠送备注自动代填，前后值／经办／时间沿原审计保存。 |
| F-WAL-017 | `wallet_note` | C | Text | 充值及钱包备注／凭证说明；单次充值有赠送余额或赠券时必填（去空白后非空），无赠送时选填，复用本字段而非套餐备注；见03c§3～4、04§3.0.11。 |
| F-WAL-018 | `recharge_package_id` | D | ID | 充值套餐已取消；仅历史引用／迁移保留，新业务禁止写入，不得作为单次充值必选项。 |
| F-WAL-019 | `recharge_package_name` | D | Text | 充值套餐名称已退役，仅历史追溯；不得改作单次充值名称。 |
| F-WAL-020 | `recharge_paid_amount` | C | Money | 本次实际充值本金／实收金额，单次充值填写，不再取套餐配置；不含赠送余额或优惠券，不把到账总额当实收。原逻辑名及原值／流水保留，当前有效本金可按03c§4.2／04§3.0.13有原因更正、联动差额并留历次记录。 |
| F-WAL-021 | `recharge_bonus_amount` | C | Money | 本次充值选填的赠送余额，无赠送为0；与本金分开，本值大于0时F-WAL-017备注必填。原逻辑名保留，不从套餐自动套用。 |
| F-WAL-022 | `recharge_total_credit` | C | Money | 本次实际余额到账总额＝本次020本金＋021赠送余额，系统计算；不含赠券折现额、不等于充值实收。 |
| F-WAL-023 | `recharge_bonus_coupon_items` | C | Ref[]/Struct | 本次充值时选择的本商户已有优惠券及数量，选填；非空时017备注必填，成功记账后发放一次并关联本次充值，不依赖套餐或另建人工赠券事实。 |
| F-WAL-024 | `recharge_package_enabled` | D | Bool | 充值套餐启停字段已退役，仅历史追溯，新业务禁止写入。 |
| F-WAL-025 | `recharge_package_starts_at` | D | Datetime | 充值套餐生效时间已退役，仅历史追溯；不得充当充值实际发生时间。 |
| F-WAL-026 | `recharge_package_expires_at` | D | Datetime | 充值套餐失效时间已退役，仅历史追溯；不得改作充值或赠送的新期限。 |
| F-WAL-027 | `recharge_package_note` | D | Text | 充值套餐备注已退役，仅历史追溯；单次充值赠送备注统一用017，禁止新写此字段。 |

单次充值按03c§2～4／04§3.0.11：不设套餐，020～023为本次真实充值输入及计算结果，017在021大于0或023非空时必填，无赠送选填；不能只前端校验、用空白／默认备注绕过。有赠送余额与赠券可同时选择，既有顾客钱包本金／赠送及优惠券分开记账，成功请求重试不重复到账／发券。关联充值沿原013／014、顾客与商户沿原核心身份，真实经办沿015，流水稳定ID及审计仍保留；尚未明确的充值交易标识／实际发生时间映射先按原DEC收口，不凭套餐字段退役新造同义ID／时间或伪造接口接通。上述D字段永久ID不删除、不转义、不复用；历史充值快照与已发权益不因取消套餐清除，020～023的旧历史配置资料不能被当作本次实际交易自动入账。

充值记录查询（04§3.0.12／03c§4.1）：顾客详情／充值记录、业务／订单与收银／充值记录两入口复用同一原充值业务及013／014关联，不给充值造F-ORD-001消费订单，不复制余额流水／收入；当前门店／顾客／原钱包读取权限必须同时校验。六列日期、顾客、实收金额、赠送余额、赠券、经办人，金额／权益／经办依次沿020／021／023／015，详情备注017、真实余额前后变化008～012，顾客手机号用F-CUST-001；不把到账022／赠送算作充值实收，不以业绩归属代替实际经办。手机号／日期组合查询、默认今天及昨天／本月／自定义、沿业务时区。订单日期已明确为原充值单据的F-CORE-013 created_at，日期列与日期筛选统一沿该原充值记录创建时间、按完整生成时间倒序；不是消费订单创建时间、实际收款时间、退役套餐时间或后续修改时间，不新增含糊date／同义创建时间字段。昨天收款今天补录生成单据，今天列表可查并按今天生成时间排序；实际收款日期与服务端录入时间仍分开保留，收入统计归昨天真实收款期，不以今天单据列表合计替代真实期间实收。原充值业务标识／实际时间等剩余技术映射按原DEC先注册，不借此宣称新接口已接通；原成功记录及流水不覆盖删除，允许从原详情按下段更正当前有效金额及券、留原因和差额，余额退还已统一修改当前余额，平台异常细节仍待决；普通查询不改余额或重发权益。复用原705字段，未新增同义字段／持久化列表状态。

充值更正／撤销（03c§4.2／04§3.0.13）：老板及本店有效员工可更正原充值当前有效020本金／021赠送／023赠券，原因016及审计F-AUD-009必填，原017赠送备注保留；界面编辑不等于覆盖原历史。沿原013／014关联原充值，原020～023快照及历次前后值保留、当前值可核对；钱包011／012按新旧有效额差额分开调整、006生成真实流水，008～010前后余额与015真实钱包经办、F-AUD-007～011前后值／原因／修改人时间／请求留存。整笔撤销按当前有效内容回退并追加关联反向记录，未变券不重发、成功重试不重复；需要回退本金／赠送不足或需要撤回券已用时门店拒绝并提示只能超管处理，不自动负数／改已消费历史、不部分改资产。平台异常只给platform_super_admin，具体平台数据联动／页面仍待阶段05／06／08。实收按更正后真实本金及原实际收款日期，误录撤销不当真实退款或新收款；更正不改原充值created_at／原经办人或拿新增总额重复入账，技术并发及原交易身份时间剩余契约仍先按注册表收口。复用原705字段与原幂等审计，不新增同义金额、原因、任意余额直写或平台角色字段。

当前余额修改及充值余额退还统一操作（03c§4.3／04§3.0.14）：顾客详情／会员资产／修改余额，输入沿现有003目标本金、004目标赠送及016必填原因，不新增target_balance／refund_request等同义字段或退款状态。系统按当前001钱包、顾客与商户身份取当前余额，011／012分别记目标－当前值，002总额由分项计算；006及008～010保留真实调整流水、前后余额，015和原审计记经办／时间／原因，稳定请求沿F-CORE-010。目标非负，提交基准已变化须重新核对，幂等重试不重复增扣、失败不部分更新。此处无需关联原充值才能修改余额，013／014只沿本次真实调整业务／原审计对象关联，不伪造消费order_id或充值单；原流水与020～023充值事实保持，不从余额差额生成真实收退款／新增充值收入或反改业绩。仅本店老板／有效员工办理，顾客只按原资产／流水范围读结果，原始审计权限不扩大；原充值撤销不足／已用券的超管异常边界不因改余额绕过。保留原705字段／永久号，不新建第二钱包账本或独立充值退款流程。





---

## 10. 优惠券与邀请码（COUPON / INVITE）

### 10.1 优惠券

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CPN-001 | `coupon_template_id` | S | ID | 商户优惠券模板稳定标识；本店老板管理，停用／恢复沿原ID保留历史，不提供删除，见04§3.0.15。 |
| F-CPN-002 | `coupon_instance_id` | S | ID | 发给本商户具体Customer的正式券实例，每张稳定唯一；券说明、适用范围与期限沿发放快照，不被后来模板修改／停用回写，所有券手动核销按03c§10～11；历史合法延期保留，不新建锁定延期。 |
| F-CPN-003 | `coupon_name` | C | Text | 券名称。 |
| F-CPN-004 | `coupon_type` | C | Enum | 满减 / 金额抵扣 / 折扣。 |
| F-CPN-005 | `discount_amount` | C | Money | 金额类优惠值。 |
| F-CPN-006 | `discount_rate` | C | Number | 折扣券比例。 |
| F-CPN-007 | `minimum_spend` | C | Money | 使用门槛（如适用）。 |
| F-CPN-008 | `max_discount_amount` | C | Money | 折扣券最高优惠金额（如适用）。 |
| F-CPN-009 | `applicable_scope` | C | Enum/Struct | 全部消费／洗护／美容／护理／寄养／商品；新增护理选项，不扩大旧洗护／美容限定实例，模板修改不回写已发券范围。 |
| F-CPN-010 | `valid_from` | S | Datetime | 优惠券有效开始；邀请码来源取本次服务端兑换成功取得券的时间，见03c§9.3。 |
| F-CPN-011 | `valid_until` | C | Datetime | 当前实际有效截止；邀请码来源初始值为成功领取时间顺延一个日历月，月末无同日取下月月末同一时刻，其他来源沿原期限。手动核销时按此截止校验，不再因开单／选券暂停计时或新延期；历史合法延长的截止及记录保留，不批量回退。 |
| F-CPN-012 | `coupon_enabled` | C | Bool | 模板新增成功默认true，老板停用false／恢复true，禁止停用后新发；不作为已发实例继续核销的否决条件，不把旧实例自动失效／过期或恢复成未用。 |
| F-CPN-013 | `coupon_status` | S | Enum | 可用、已使用、已过期及removed（持有券已删除）等结果；本店老板／有效员工手动核销写已使用，未核销券可直接删除。仅整单取消／全额退款例外可手动退回，原截止未到则可用、已到则过期；无日常误点撤销，保留前后状态及核销／删除／退回历史。已锁定仅历史读，原异常超管及迁移边界见03c§11。 |
| F-CPN-014 | `coupon_source_type` | S | Enum | 充值赠送、人工赠送、邀请码兑换、平台积分兑换。 |
| F-CPN-015 | `points_redemption_id` | C | ID | 平台积分兑换发券时关联的兑换记录。 |
| F-CPN-016 | `coupon_locked_order_id` | D | ID | 选券锁定关联原单退役，仅保留历史，禁止新写；不得复用为新的手动核销关联订单字段，原单关联技术契约另行收口。 |
| F-CPN-017 | `coupon_redeemed_at` | S | Datetime | 普通券最近一轮真实手动核销成功的服务端时间；本轮成功重试不改时间，不拿结算时间冒充。合法退回不抹原核销记录，再次真实核销可记录新轮次，历次核销及退回人／时间沿审计保留；历史自动核销事实不伪装成新手动操作。不借此承载活动券或退回时间。 |
| F-CPN-018 | `coupon_note` | C | Text | 可选备注。 |
| F-CPN-019 | `coupon_locked_at` | D | Datetime | 选券锁定开始时间退役，仅保留历史，禁止新写；不转义为领取／手动核销时间。 |
| F-CPN-020 | `coupon_unlocked_at` | D | Datetime | 解除选券锁定时间退役，仅保留历史，禁止新写；不转义为退款恢复／撤销核销时间。 |
| F-CPN-021 | `coupon_grant_quantity` | S | Int | 本次独立人工赠券的数量，正整数，见03c§9.2／04§3.0.15；不是商品数量、充值赠券配置或邀请码绑定数量，不新增业务上限。 |

优惠券模板／独立赠券按03c§8／9.2、04§3.0.15：老板管理本店001模板，默认启用、停用／恢复无删除；老板及有效员工在顾客详情选本商户当前启用模板及021数量、原因必填无审批且不需充值。原因沿F-AUD-009，真实人／时间／稳定请求沿原F-AUD及F-CORE-010；F-CPN-018券备注仍可选，不以原备注自动代本次原因。成功生成本次数量的002实例、014来源人工赠送，失败不假报、成功重试不重复；当前店／顾客／身份／模板状态及内容由服务端校验。模板修改只影响以后发券，已发实例保留003～011等发放条件快照，011保留实际发放／历史合法延期截止，不再产生锁定暂停延期；不从后来模板重取优惠或用012停用拒旧券。新护理范围不改旧洗美限定券；不新增模板维护给员工或越店、原始审计、已用券撤回／改余额权限。新增021后永久字段累计706，原号／名／类型／状态不改，持有赠券直接减量／删除按下段已定，剩余跨渠道／模板版本和超管异常技术契约仍先登记收口。

顾客持券数量减少／手工删除（03c§9.2.1／04§3.0.16）：老板及有效员工可直接处理当前本店顾客的未使用、未占用具体002实例，不限原发放人，无独立误发／作废申请或老板审批；原因及真实人／时间／前后状态数量沿原F-AUD，稳定请求沿F-CORE-010。删除沿013记removed，F-WAL-005按剩余真实可用实例重新派生；不能只改券数或复用021发券数量当剩余数量，不新增同义券数字段。原实例来源014及发放、模板001和操作历史保留，客户端可使用／历史两组，removed属历史；不退积分／改钱包／自动撤充值兑换或补发券，所有券按03c§11在顾客详情直接核销／删除，不先开单选订单；已核销不能直接删除，仅实际整单取消／全额退款可手动退回原券，原期限不变；其他已用券异常与旧锁定迁移沿原边界。失败不部分更新、成功重试不重复删除，当前券状态变化须重新校验；原706字段号／名／类型／状态标记不变，仅明确013枚举。



### 10.2 邀请码

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-INV-001 | `invite_code_id` | S | ID | 邀请码记录标识。 |
| F-INV-002 | `invite_code` | C | Text | 系统为本店老板创建时生成的码内容，客户端顾客输入兑换；不再允许老板手工指定／修改。只限所属本店，沿merchant_id／store_id明确上下文，成功创建重试沿原码及时间，不新建第二码。 |
| F-INV-003 | `bound_coupon_items` | C | Ref[]/Struct | 仅优惠券分支，固定一个本店模板且数量1；不改注册类型，不接受多模板／数量配置／与活动混装。活动分支不用此字段冒充活动引用；其他赠券场景数量不因本规则改变。 |
| F-INV-004 | `invite_code_enabled` | D | Bool | 邀请码启停退役，仅留历史，禁止新写；当前码由成功兑换次数及固定到期时间判断可兑，不复用为已兑换状态。 |
| F-INV-005 | `invite_code_starts_at` | C | Datetime | 服务端创建即生效，固定等于F-INV-011，不可手工选择或改写。 |
| F-INV-006 | `invite_code_expires_at` | C | Datetime | 固定为F-INV-011加连续72小时；服务端当前时间恰好等于或晚于该时点不可兑换，不是兑换后券的到期时间。 |
| F-INV-007 | `max_redemptions_total` | C | Int | 单码全部顾客合计成功兑换上限，固定1，由系统约束，不提供配置；不是每位顾客各一次。 |
| F-INV-008 | `max_redemptions_per_customer` | D | Int | 单顾客可配上限退役，仅留历史，禁止新写；现行规则是单码全部顾客合计一次，不另配个人上限。 |
| F-INV-009 | `redeemed_count` | C | Int | 已成功兑换次数，只可0或1；与实际权益发放一致保存，失败不计次，成功重试不再计次或发券。 |
| F-INV-010 | `invite_code_created_by` | C | ID | 创建人。 |
| F-INV-011 | `invite_code_created_at` | C | Datetime | 创建时间。 |
| F-INV-012 | `invite_code_note` | C | Text | 创建时可选备注，不据此新增后续编辑流程；不代替014活动说明。 |
| F-INV-013 | `invite_code_content_type` | C | Enum | 创建时唯一兑换类型：coupon／service_activity／product_activity；只选一类且数量固定1。优惠券沿003，服务引用F-APPT-008，商品引用F-PROD-002，不新建同义主资料ID。 |
| F-INV-014 | `invite_code_activity_description` | C | Text | 服务／商品活动创建时填写的简短活动说明，去空白非空必填；优惠券分支沿模板内容，不额外必填。只是顾客可理解的活动内容，不是折扣公式；012备注仍选填。 |

邀请码按03c§9.3只创建、固定单码合计一次和创建后72小时；不提供启停／恢复／换码／活动调整。范围已包含优惠券及直接服务／商品活动，后两者先生成待使用活动券，到店由本店老板／有效员工手动核销；核销／删除入口已定且不先开单或选择订单；仅取消／全额退款退回核对实际用券及原业务关联，不要求先转成普通优惠券。所有普通优惠券与活动券统一手动核销，均不进自动推荐／折扣／锁定／结算核销流程，结算优惠由门店另行手动改价，核销不自动写金额／支付／库存或服务事实。创建五项按03c§9.3.1／04§3.0.17：老板管理／创建邀请码，仅老板创建；系统生成码，数量固定券1张／服务1次／商品1份，结果页显示码／内容／兑换截止及复制分享、提示领取后一个月有效；老板按03c§9.3.2／04§3.0.17.2经微信自行发码给员工，不设员工小程序未使用码列表详情及其复制分享入口；独立已兑换记录查询另行待定，不影响顾客持有券操作。F-INV-003固定单一模板及数量1，不改为活动引用；013／014新注册创建类型及说明，服务／商品引用原service_item_id／sku_id；码72小时与领取后期限分开。手动核销须当前本店／有效身份／顾客／未核销及未到期校验，原人／时间／前后状态和请求沿审计与防重；F-CPN-017现为普通券实际手动核销时间，013为该普通券自身状态，活动券不能借其冒充另一权益实例。当前永久字段累计708；活动权益实例、成功领取与使用截止、手动核销结果及订单关联等剩余契约仍须先注册，不能以708字段认定活动新契约已齐全，不得新建未注册持久字段或复用券实例／订单ID冒充权益ID。历史可配限制不作为当前默认值，不自动重新开放已用／过期码；旧码迁移若涉及存量按后续迁移决策处理，不无痕重写历史。

---

## 11. 商品、SKU、购物车与库存（PROD）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PROD-001 | `product_id` | S | ID | 商品 SPU / 商品主体标识。 |
| F-PROD-002 | `sku_id` | C | ID | 商品规格 SKU 标识；独立售价与库存。 |
| F-PROD-003 | `product_category_id` | S | ID | 本Merchant商品分类稳定标识，商品当前分类与分类主记录共用；自定义分类删除时商品自动移本店029兜底分类，不按同名或跨店猜目标，不复用原分类ID。 |
| F-PROD-004 | `product_name` | C | Text | 商品名称。 |
| F-PROD-005 | `product_image_refs` | C | Ref[] | 选填商品图片；缺图可建档，不用采购单据图片冒充客户商品图。 |
| F-PROD-006 | `sale_price` | C | Money | 当前 SKU 售价 / 参考售价。 |
| F-PROD-007 | `inventory_status` | C | Enum | 客户侧仅：有货 / 库存紧张 / 暂时无货；默认不暴露精确数量。 |
| F-PROD-008 | `available_inventory_qty` | S | Int | 后台真实可售库存数量；不默认返回普通客户端。 |
| F-PROD-009 | `reserved_inventory_qty` | S | Int | 已确认但尚未结算订单的预占库存；实际收款或明确免单成功后一次转出库，输入0未确认免单仍未结算。 |
| F-PROD-010 | `product_description` | C | Text | 商品介绍。 |
| F-PROD-011 | `sku_spec_values` | S | Struct | 口味、容量、包装等规格值。 |
| F-PROD-012 | `boarding_feed_enabled` | C | Bool | SKU / 商品是否允许用于寄养加餐。 |
| F-PROD-013 | `ingredient_tags` | C | Struct/Text[] | 可选结构化食材标签。 |
| F-PROD-014 | `flavor_tags` | C | Struct/Text[] | 可选口味标签。 |
| F-PROD-015 | `allergen_tags` | C | Struct/Text[] | 可选过敏原标签；只基于明确数据匹配，不用 AI 猜测。 |
| F-PROD-016 | `barcode` | C | Text | 可选条码。 |
| F-PROD-017 | `cost_price` | C | Money | 可选SKU成本价，客户端不公开；不是单次进货单价，AI识别进货价不自动覆盖此值，后续成本更新算法未定。 |
| F-PROD-018 | `brand_name` | C | Text | 可选品牌。 |
| F-PROD-019 | `is_recommended` | C | Bool | 可选推荐状态。 |
| F-PROD-020 | `product_enabled` | S | Bool | 商品是否可售／上架；下架仍可查调库存／办旧单，老板员工恢复上架复用原商品SKU，不以false代表删除，也不通过true恢复已删除商品。 |
| F-PROD-021 | `cart_id` | S | ID | 当前 User + Merchant 的购物车标识。切店不得把 A 店购物车提交到 B 店。 |
| F-PROD-022 | `cart_item_id` | S | ID | 购物车明细。 |
| F-PROD-023 | `cart_quantity` | C | Int | SKU 数量。 |
| F-PROD-024 | `cart_note` | C | Text | 客户提交购买需求时可选备注。 |
| F-PROD-025 | `order_hold_expires_at` | S | Datetime | 商品订单确认后的库存保留截止；默认业务规则为 24 小时，可由商户配置允许值。 |
| F-PROD-026 | `on_hand_inventory_qty` | S | Int | 本SKU账面总库存，非负整数、初始建档明确填写可为0；人工补货／盘点目标及AI确认入库更新此值，不覆盖009预占；008可售=026总量-009预占，目标低于预占拒绝并先处理原订单缺货。前后数量及人时间沿审计；旧库存总量迁移先收口，不以新字段缺失默认0覆盖原库存。 |
| F-PROD-027 | `product_category_name` | C | Text | 本店商品分类显示名称，可自定义改名；029兜底类别名称固定其他、不改名，不等于服务四大类或品牌厂家。 |
| F-PROD-028 | `product_category_sort_order` | C | Int | 本店商品分类展示顺序，由老板／有效员工调整，不改变分类／商品身份或库存，不另造平行排序字段。 |
| F-PROD-029 | `product_category_is_fallback` | S | Bool | 服务端标识本Merchant唯一固定其他分类，名称固定不可删；删除自定义分类时全部商品含下架自动转至其003，不能客户端伪造／改成普通分类或跨店转移。 |

商品分类与商品删除按03e§15.3／04§3.0.18.1五项：老板有效员工新增改名排序，删除分类时全部原003下商品含下架自动转本店唯一029= true的其他类别，无需先手转，其他不可改名删除。只改当前分类，不改SKU售价／020上下架及026／009库存、既有订单／入库快照和原历史；迁移及分类删除一致、防重留前后分类实际人时间。恢复上架沿原020和001／002，不复制库存；误建商品删除必须无任何业务引用、无库存变动、全部SKU总量预占为0，有销售／库存历史仍只下架，原AUD操作记录保留且身份不复用，物理删除表示等数据库技术另收口。新增027／028／029后725字段，旧722身份类型状态保持，复用原租户、幂等和审计，不新增老板审批或第二套商品库。

04§3.8商品需求查询分组不新增持久化状态。待处理排序复用F-CORE-013原需求created_at（不是后续确认／修改时间），待付款排序复用F-PROD-025及原保留配置，“不自动取消”排后，不为排序另造截止或重置期限。搜索用本店原Customer联系方式、F-ORD-001及F-PROD-004；来源渠道／业务场景复用F-ORD-027／028，不能混用或跨店取数。

普通商品结算前减量／移除／人工取消用原F-ORD-006／007／031保留申请与现状，F-ORD-032及原状态校验调整原SKU预占。选填说明复用F-AUD-009，未填可空，不在数据库或通用DTO把所有取消都设为原因必填；实际人／时间／前后值仍用原F-AUD。加餐商品同样适用，调价／退款原因要求不放宽。全部归零是取消，不是空单或免单成交。F-ORD-004普通商品已完成只表示交易完成，不生成顾客已取走／实物交付字段；不同需求不合并结算，同购物车多项仍复用原订单，不增加第二账本或修改平台奖励字段；退役的加餐执行字段不再启用。

---

### 11.1 商品管理及手工／AI拍照入库（STOCK_INTAKE）

商品管理按03e§15／04§3.0.18，老板与有效员工都可在业务／商品处理／商品管理维护本店主资料。名称004、分类003、各SKU售价006／初始总库存026必填，图片005、条码016、成本017、介绍010选填；默认单SKU，有多规格仍复用002／011。改售价不回写原单，有销售／库存历史不物理删除；手工库存调整只算差额，预占009不覆盖、008派生，旧表单不得覆盖成交／预占新值。业务前后数量摘要沿原对象和F-AUD，不新增第二套库存或逐员工审批。

两种入库按03e§15.1／04§3.0.19：商品管理下“商品入库”手填、“AI拍照入库”识别后直接填原入库表单，点击“一键入库”后才生效，无独立核对页，当前均普通功能，不查会员／付费。入库单唯一归merchant_id，store_id为实际门店上下文；每行归stock_intake_id，引用本店原SKU。未来ai_stock_intake会员按Store归属，仅预留商业化语义，不要求当前有F-ENT记录、不伪造默认有效，也不影响pet_advisor校验。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-INTAKE-001 | `stock_intake_id` | S | ID | 手工／AI来源共用入库确认单稳定标识，同单只能正式入库一次，不能换入口重复入库或用消费order_id／历史IMPORT任务冒充。 |
| F-INTAKE-002 | `stock_intake_item_id` | S | ID | 本单明细行稳定标识，唯一归属001，不用图片页码／表格行号作为身份。 |
| F-INTAKE-003 | `purchase_document_image_refs` | C | Ref[] | AI拍照入库的进货单据图引用；手工入库可无图片，不以其必填阻断。商家私有，不能当客户商品图；原媒体归属校验保持。 |
| F-INTAKE-004 | `stock_intake_status` | S | Enum | recognizing／pending_review／posted／failed；手工直接pending_review、不要求recognizing；pending_review保留原技术枚举，现指原入库表单待点击入库，不代表核对页面或强制逐行核对。AI识别仅填表、不等于入库；两方式只在确认成功posted后一次更新库存。 |
| F-INTAKE-005 | `stock_intake_extracted_data` | S | Struct[] | AI原始识别行及缺失不确定事实，仅回填原表单、始终不当可信指令，原结果与最终点击入库内容分开；手工来源可空，不伪造AI识别结果或补0。 |
| F-INTAKE-006 | `stock_intake_target_mode` | C | Enum | 每条确认行existing_sku／new_sku；前者引用本店原F-PROD-002，后者补齐03e§15字段后同次建档入库，不造同义SKU。 |
| F-INTAKE-007 | `stock_intake_quantity` | C | Int | 原入库表单点击“一键入库”时提交的本行实际入库量，正整数；不是购物车数量／目标总库存。已有SKU按差额增加026，新商品首次库存只由此量形成一次，不先初始化再加一遍。 |
| F-INTAKE-008 | `purchase_unit_price` | C | Money | 本行实际进货单价，手工填写或AI识别填原表单后随入库确认，可缺失保持未知，不虚填0／拿售价替代或从税费运费猜出；不自动变成006售价或017成本价，不凭此生成付款。 |
| F-INTAKE-009 | `stock_intake_confirmed_by_staff_id` | S | ID | 正式确认入库的本店实际老板／员工稳定staff_id，引用F-CORE-005，不能写成AI或原拍摄人冒充经办。 |
| F-INTAKE-010 | `stock_intake_posted_at` | S | Datetime | 正式入库成功的服务端时间，不等于拍摄／AI识别／单据印刷日期或供应商付款时间。 |
| F-INTAKE-011 | `stock_intake_row_version` | S | Int | 入库单识别填表／确认的当前版本；旧表单结果不能覆盖新修正／已入库状态，不能借F-ORD-032消费金额版本替代。 |
| F-INTAKE-012 | `stock_intake_method` | C | Enum | manual=商品入库，ai_photo=AI拍照入库；由真实创建路径确定、保留来源，不另建库存或将同单切方式重入；旧记录缺来源的迁移先定，不默认manual或改来源。当前不做会员验证，未来不能把AI来源伪改manual绕过新增校验。 |
| F-INTAKE-013 | `purchase_document_image_fingerprint` | S | Text | 服务端为003中的每张单据图片计算的内容指纹，逐图依原媒体引用归属；用作同一照片跨上传查询本店posted原单001的依据，不用文件名／新上传URL／商品文本或客户端自报值冒充。命中只提醒可查原单并允许新单继续，不豁免原单幂等；压缩裁剪／重拍等价技术策略待收口，不宣称所有物理重复票据已识别。 |

AI拍照入库五项按03e§15.1.6／04§3.0.19.1：现场拍摄或相册、多张003归同一001原表单及稳定行；失败可重试或原表单手填、仍012=ai_photo真实来源，不伪造005成功；必要商品规格数量原表单补齐，008未知不补0、不新核对页。新增013服务端逐图内容指纹；匹配当前Merchant／Store既有posted原单时只提示可能重复、可查原单且允许新单继续，匹配结果复用原001引用，不新建第二套历史记录／券或消费订单。图片相同提醒不取消001同单防重，不凭相同SKU认定重复；旧721字段身份类型状态保持，累计725。比对与原图原记录读取逐次本店鉴权，不能将识别失败或其他店记录当本店已入库，也不能客户端伪造指纹来作授权。

入库记录查询按03e§15.2／04§3.0.20：只列当前本店posted记录，两方式统一，老板／有效员工可查全店业务记录，非仅本人经办。单号复用001，列表／日期／排序复用010，方式012，实际确认人009；默认Asia/Shanghai最近15个自然日含今天前14天，可改日期，不构成保留期限。商品名／规格／条码复用原F-PROD字段及本次确认资料，筛日期／方式和名称条码查询不新增长期同义字段。明细007数量、008可空进货价（未填写不补0）、003可选私有图片与该次F-AUD前后库存摘要配对，前后总库存语义沿PROD026，不取当前值倒算、不以可售或预占替换；业务摘要不扩大F-AUD原始日志读取权限。已posted原单只读，入库错误由老板／有效员工在库存管理沿原stock调整修改当前量、记录后续前后值人时间，不新增作废撤销流程，字段仍725、原永久号逻辑名类型状态不改。

商品主资料、确认行目标和数量、原识别结果及前后库存分开保存；SKU／新商品资料复用原F-PROD字段，身份／权限／媒体和F-CORE-010幂等、F-AUD前后值及真实人时间复用，不把库存数当作无历史可写数字。整单确认与新商品建档／库存更新需一致，失败无半单，成功重试恢复原结果；已posted单不能重复确认／重新识别改库存，成功重试仍校验任职本店并恢复原结果；当前无会员状态阻断，未来验证也不能把原成功入库伪报失败。同单不同请求／员工并发也只入一次，不依赖前端按钮禁用。

现有字段累计725；当前两方式不要求会员／F-ENT，不关闭本店任职／数量状态／版本防重和私有媒体校验，不把AI技术、同图以外票据等价识别、单位换算／成本更新等当已齐全。会员校验、定价额度及开通仅未来范围，不作为当前正常功能前置；将来仅AI入口及后端识别／AI来源确认链路统一接入，不只隐藏按钮，不改来源／已入库历史。单据／进货价不公开、不自动记顾客消费／充值／供应商已付款。

## 12. 订单、金额、付款与退款（ORDER / PAYMENT）

### 12.1 订单

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-ORD-001 | `order_id` | S | ID | 正式服务 / 商品订单标识。预约不使用该 ID。 |
| F-ORD-002 | `order_type` | S | Enum | 服务 / 商品；服务可进一步由 `service_type` 区分。 |
| F-ORD-003 | `order_status` | S | Enum | 订单业务状态。不得与`payment_status`共用；加餐商品不再有独立投喂执行状态。 |
| F-ORD-004 | `customer_visible_status` | C | Enum | 客户端聚合后的业务状态。洗美／护理取消或中止后的原事实与历史保留，新开单有独立order_id及服务记录，不以新单回写旧状态或复活余宠，不自动转移／结清旧账；见04§4.4。 |
| F-ORD-005 | `order_item_id` | S | ID | 商品或服务订单明细。 |
| F-ORD-006 | `requested_quantity` | S | Int | 客户原始购买需求数量。 |
| F-ORD-007 | `confirmed_quantity` | S | Int | 门店确认后的实际数量；需保留原始需求，不无痕覆盖。 |
| F-ORD-008 | `item_original_unit_price` | S | Money | 明细原始单价；寄养为本店员工／老板在入住时逐宠填写的本次日价，随该boarding_id原明细保存，不强制统一价／老板价格表、不成为Pet永久价格。日价须大于0，不用未填默认0、其他宠物价格或后续主资料覆盖历史；按04§5.2第14～18项，离店费用确认前允许更正此本宠本次日价，整次按更正后单一价计算，每次旧值／新值／经办／时间用原审计保留，不分段。已确认离店即锁定本值与基础快照，即使未收款也只走F-ORD-013／014调整应收；已收款／免单不直接改账，免费不用零日价代替明确免单。 |
| F-ORD-009 | `item_original_amount` | S | Money | 商品／服务明细原价合计；寄养为本宠本次F-ORD-008日价×F-BOARD-029实际晚数，0晚基础寄养费0，不取其他宠价格或最大晚数套用；离店确认前按04§5.2更正本次日价后重算并保留旧值，已确认离店不以收款前调价覆盖本值；不冒充最终应收／实收。 |
| F-ORD-010 | `original_receivable_amount` | C | Money | 系统自动计算的原始应收；同店同客多宠寄养一起结算时汇总各宠F-ORD-009基础明细，逐宠价格／实际时间／晚数仍独立，优惠／人工调价后最终应收另记，不因一次支付重复统计收入。 |
| F-ORD-011 | `automatic_discount_amount` | D | Money | 自动优惠金额退役，仅保留历史，禁止新业务写入；现全部券及活动优惠经结算人工调价013处理，不复用为另一份人工优惠。 |
| F-ORD-012 | `coupon_discount_amount` | D | Money | 独立券优惠金额退役，仅保留历史，禁止新业务写入；现手动改最终应收，优惠差额只在013记一次，不双扣／反算或覆盖旧单券优惠。 |
| F-ORD-013 | `manual_adjustment_amount` | C | Money | 人工调价金额，可正可负；不能覆盖其他金额。 |
| F-ORD-014 | `final_receivable_amount` | C | Money | 调价／优惠后最终应收，非负、最多两位小数；整单输入，由服务端算差额，不设业务调价上限。0元须明确确认免单才结算，不以主资料参考价覆盖。 |
| F-ORD-015 | `paid_amount` | C | Money | 实际已收款金额。 |
| F-ORD-016 | `refund_amount` | C | Money | 已退款金额；不得通过改写原实付实现退款。 |
| F-ORD-017 | `payment_status` | S | Enum | 既有未收款／已收款／部分退款／已退款等结果；新增稳定值waived=已免单、无实际付款。waived表示明确免单已成功结算，不能伪造为已收款或仅因金额0自动写入；与服务／执行状态分离。 |
| F-ORD-018 | `manual_adjustment_reason` | C | Text | 人工调价原因。 |
| F-ORD-019 | `manual_adjusted_by_staff_id` | C | ID | 调价操作人。 |
| F-ORD-020 | `manual_adjusted_at` | C | Datetime | 调价时间。 |
| F-ORD-021 | `manual_adjustment_note` | C | Text | 可选调价备注。 |
| F-ORD-022 | `order_confirmed_at` | S | Datetime | 门店确认商品/订单内容的时间。 |
| F-ORD-023 | `settled_at` | S | Datetime | 实际收款或明确免单成功的服务端结算时间；免单不是payment_confirmed_at，不新建虚假支付记录。 |
| F-ORD-024 | `order_canceled_at` | S | Datetime | 订单取消时间。 |
| F-ORD-025 | `order_cancel_reason` | S | Text | 人工 / 自动取消原因。 |
| F-ORD-026 | `auto_cancel_reason` | C | Text | 尚未结算超过保留时间等系统自动取消原因；已收款／免单不得按未付款超时取消。 |
| F-ORD-027 | `source_channel` | C | Enum | 复用 F-CORE-011。订单来源分析不得另造 `order_source`。 |
| F-ORD-028 | `business_scenario` | C | Enum | 复用 F-CORE-012；寄养加餐固定 `boarding_feed`。 |
| F-ORD-029 | `boarding_id` | C | ID | 复用F-BOARD-001；寄养加餐订单必须稳定关联当前寄养，寄养消费明细逐宠关联本次寄养。多宠一起结算保留每个原明细的boarding_id，不用订单头单个值覆盖其他宠物，不另造同义寄养标识。 |
| F-ORD-030 | `pet_id` | C | ID | 具体服务记录／服务明细及寄养加餐与真实宠物的关联；寄养多宠结算按04§5.2逐明细关联本宠／boarding_id，不覆盖其他宠物。洗美多宠订单共用order_id，不能在订单头只存一个pet_id覆盖其他宠物，也不为不同顾客并单。 |
| F-ORD-031 | `original_request_snapshot` | S | Struct | 客户原始购买需求快照；门店改单不得无痕覆盖。 |
| F-ORD-032 | `order_amount_version` | S | Int | 同一订单金额版本，供调价、实际收款、免单及取消／超时等校验同一金额／状态；04§5.2寄养离店确认前日价更正、费用确认及离店后未付最终应收调整也复用，校验本批对象和当前版本。业务离店费用确认成功后锁日价／基础快照，但未收款时最终应收仍可留痕调整；财务收款或免单先成功则拒绝直接改价，调价先成功则旧金额／版本的离店费用确认或财务结算失败、重新核对。业绩归属038改选亦协调本原单结算上下文，成功改选推进当前版本、使旧确认／收款／免单请求重新核对；不改变金额值，不以F-SVC-019替代纯商品订单的结算版本。不能复用项目版本或审核row_version。 |
| F-ORD-033 | `manual_adjustment_reason_code` | S | Enum | actual_care / store_discount / input_correction / other，对应实际护理情况／到店优惠／录入更正／其他。调价原因必选；other须在F-ORD-018补文字，其余保存真实原因，不据原因名称开放收款后改价。 |
| F-ORD-034 | `order_on_hold` | C | Bool | 洗美／04§4.5护理完成或中止且实际费用明确、04§5.2寄养已离店未收款均先待结算；员工手动挂单且原因必填后true，不自动挂单。寄养挂单仍已离店、按F-BOARD-005停止计费，原因／催款备注不公开。原本批付清或明确免单成功自动解除、历史保留；护理挂单、误挂撤销及仅人工联系按04§4.6，撤销true→false仍待结算，只有确实挂过单才属已解除历史；不开放商品挂单或套用商品超时取消。 |
| F-ORD-035 | `order_held_at` | S | Datetime | 原单实际手动挂单的服务端时间，不伪填接走／付款时间；原因必填，复用F-AUD-009及人／时间／前后状态，不新增同义原因字段。04§4.6列表默认以本值升序；撤销／解除／再次挂单仍保留原时间历史，不伪造付款。联系实际时间另F-ORD-037，其余特殊更正仍待决。 |
| F-ORD-036 | `order_collection_note` | S | Text | 04§4.6选填的本店人工联系／催款备注，记录沟通情况与顾客答复，关联原订单及寄养原结算批次；不向顾客／跨店公开，不替代原挂单必填原因，也不表示已收款／免单。录入人／时间／前后值复用原审计，更新保留历史，不另建催款系统。 |
| F-ORD-037 | `order_collection_contacted_at` | S | Datetime | 04§4.6选填的真实联系时间，与F-ORD-036关联原范围；不因保存备注默认已联系，不用F-AUD-010录入时间冒充实际联系，不与挂单时间F-ORD-035、收款／实际离店时间混用。 |
| F-ORD-038 | `order_performance_staff_id` | S | ID | 一笔门店消费订单唯一有效业绩归属，引用本店原稳定staff_id（含老板原业务身份），独立于开单／服务／收退款经办人。员工开单默认实际开单人，客户端商品门店确认前可空、确认时必选且不默认老板／确认人；首次选择非更正。后续变更（含结算前）员工只能把当前本人归属转给本店其他合法人员，老板可改本店全部；原因F-AUD-009必填，前后人员／实际修改人／时间留历史。已结算须独立更正动作，整单已发生及后续收退款按原发生日期随新归属统计，全店合计／金额／资金／真实经办身份不变。032校验最新来源归属及版本、更正推进版本，旧请求不得改别人当前归属；参与人员仅可读本人相关更正业务摘要，不开放原始审计／他人汇总。归属人离职／停用／移出不清空或自动转移，不阻断本店有效人员办理原业务和收退款，后续实际款项沿保留归属统计；仅老板可更正失效人员已有归属。新开单／商品首次确认／普通转交仅选本店active员工，老板更正本店历史订单可选本店历史身份且原因必填，不恢复其访问权。顾客不可写、不跨店猜身份；历史缺归属回填等剩余细则见04§3.0.10。 |

全部到店消费订单整单调价不限业务金额／比例、无老板逐单审批，但须有效角色／对象、非负精确金额、前后确认、原因及版本校验。免单原因、操作者、时间复用F-AUD-009／002／003／010并关联原order_id与幂等请求；paid_amount、final_receivable_amount及收入均为0，settled_at及payment_status=waived共同表达已结算。无实际付款时不产生F-PAY-001～006记录或余额扣款；商品仍一次出库，服务／投喂不自动完成，详见03d§10.1。

寄养价格更正复用说明（04§5.2第14～18项）：F-ORD-008表示本次寄养当前有效日价，每次旧值／新值分别保留于F-AUD-007／008，操作对象／人／服务端时间／幂等请求复用F-AUD-002～006／010～011，不抹去入住初值或中间更正。F-ORD-032金额版本协调更正、费用确认和收款；确认离店后，F-ORD-008／009及离店费用快照锁定，未付只用F-ORD-013／014调整最终应收并沿用F-ORD-018～020／033原因及审计。F-BOARD-029晚数和实际离店不因改价改变，不新增boarding_daily_rate、分段价格表或第二账本；本说明不授予读取原始审计日志的新权限。

### 12.2 付款拆分

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PAY-001 | `payment_record_id` | S | ID | 一次正式收款记录。 |
| F-PAY-002 | `payment_split_id` | S | ID | 组合支付中的单一支付拆分。 |
| F-PAY-003 | `payment_method` | C | Enum | 会员余额／微信／支付宝／现金／其他配置方式；全部门店消费同次最多两种不同方式，合计须等于应收。余额本金／赠送内部拆分仍算一种，不向顾客披露内部拆分。免单不造支付方式／拆分。 |
| F-PAY-004 | `payment_amount` | C | Money | 当前支付方式实际金额。 |
| F-PAY-005 | `payment_confirmed_by_staff_id` | S | ID | 确认实际收款的有权限店员。客户不能自行写此结果。 |
| F-PAY-006 | `payment_confirmed_at` | S | Datetime | 店员确认记账的服务端录入时间；晚记账时不冒充线下实际交易时间，后者见F-PAY-018。 |
| F-PAY-007 | `refund_record_id` | S | ID | 退款记录标识。 |
| F-PAY-008 | `refund_reason` | S | Text | 退款原因。 |
| F-PAY-009 | `refunded_at` | S | Datetime | 实际退款结果成立时间；原微信／支付宝／现金等为真实线下原路退回时间，原会员余额为系统实际入原钱包时间。不改作审批或录入时间，晚录入见F-PAY-016。 |
| F-PAY-010 | `refund_request_id` | S | ID | 消费退款录入请求／草稿稳定标识，关联原order_id及同店Customer；同单最多一份未完成录入，完成且有剩余可退可再登记。老板／有效员工均可，无老板审批，草稿不是退款结果。不扩展充值退款／任意改余额／积分补偿。 |
| F-PAY-011 | `refund_requested_amount` | C | Money | 本次请求退款总额，独立于原实付／累计已退；确认校验当前原单／版本及剩余可退，等于本次各渠道金额合计，不退未实收或超过剩余额。 |
| F-PAY-012 | `refund_owner_approval_status` | D | Enum | 消费退款老板审批已取消，此字段退役；仅保留永久ID及历史映射，新代码不得写入或据此阻塞退款，也不得复用成退款执行状态。 |
| F-PAY-013 | `refund_request_version` | S | Int | 退款录入请求版本，用于确认同一原单／金额／当前草稿及防重复记账；无老板审批语义，不替代订单金额版本。 |
| F-PAY-014 | `refund_method` | S | Enum | 必须沿用原付款F-PAY-003的真实方式（会员余额／微信／支付宝／现金／其他原渠道），逐笔退原账户；不得自由改渠道，不表示系统外部打款。原钱包本金退本金、赠送退赠送；部分退款分配待03c§5。 |
| F-PAY-015 | `refund_method_amount` | S | Money | 本次退款中原渠道的真实金额；隶属F-PAY-007／014，追溯原F-PAY-001／002。合计等于本次退款，本次单渠道不超该渠道已付未退金额、累计不超该渠道原实付；部分退款渠道分配仍待决。 |
| F-PAY-016 | `refund_recorded_at` | S | Datetime | 服务端确认退款记账时间，与F-PAY-009实际时间区分，微信／支付宝／现金等原路退款可事后录入；原余额实际入账与录入确认一致，不伪造先前到账。 |
| F-PAY-017 | `refund_recorded_by_staff_id` | S | ID | 登记退款的本店老板／有效员工；是实际录入经办人，不是老板审批人，仍复用审计保留操作历史。 |
| F-PAY-018 | `payment_occurred_at` | S | Datetime | 真实收款发生时间；线下可与F-PAY-006录入时间不同，会员余额扣款按系统实际发生时间记录，不因晚记账伪造先前已扣余额。 |

本节字段仅表达线下交易账本及系统会员资产变化，不接第三方收款／退款接口。确认记账自动更新订单／余额流水／适用库存，所有优惠券及活动券由独立手动核销更新、不随结算自动核销；重试不重复记账；退款不等于退货，真实可再销售退货才按原SKU一次回库，按03d§1.1／12及03e。部分退款分配与其余账本更正继续待DEC-STAFF-05，字段存在不授权自行补全规则。

---

店员洗美三个办理列表取数（04§3.0.1）：待接宠存在原F-ORD-001／F-SVC-001且F-SVC-004为not_started，排序沿原Order F-CORE-013 created_at升序；纯预约仍用原F-APPT对象从预约管理办理，不借列表生成新单。服务中F-SVC-004=in_progress按各宠F-SVC-005真实开始时间升序；待结算按原order.created_at升序，不造结算队列时间／新截止。三个当前状态查询均不套历史15天，跨天未处理保留；手机号F-CUST-001、类型F-SVC-002和本店原对象权限取数，结算状态F-ORD-017。列中的最终应收只用F-ORD-014，未知金额显示待确认，多宠标整单应收、不新增价格确认状态字段／逐宠分摊或取实收参考价；详情动作仍校验原状态／记录及金额版本，列表查询不写服务／财务／通知。分组复用原单／服务，不增加queue_status／第二账本或将独立护理寄养放入洗美。

店员洗美历史查询取数（04§3.0.1）：开单时间／日期筛选固定原Order的F-CORE-013 created_at，15自然日默认沿F-CORE-009业务时区含今日及前14天，筛选终点为所选末日次日00:00不含；不是服务结束、补图或结算时间。手机号搜索F-CUST-001，类型F-SVC-002仅洗护／美容，已结束服务状态F-SVC-004（completed／cancelled／interrupted），结算状态沿F-ORD-017；各原单／宠物服务按本店原权限关联，不把订单／服务／付款状态合成新枚举。列表价格唯一F-ORD-014最终应收，多宠标整单应收，不新建history_price／分摊字段、不取F-ORD-015实收／F-ORD-008明细原始单价替代；本列表不另展示实收，原详情财务信息保留，未知金额不补0。历史与待结算引用同一F-ORD-001／F-SVC-001，不复制订单或收入；查询条件不新建持久化history_status、顾客副本或跨店查询记录，也不改原跨店共享限额／客户页／挂单搜索。

经营统计取数与业绩归属方向（04§3.0.10）：只统计已成功记账的真实消费收款／退款，消费实收沿F-PAY-001／002／004稳定拆分按F-PAY-018实际发生时间汇总；消费退款沿F-PAY-007／015按F-PAY-009实际时间汇总，不能将退款头／各渠道明细或F-ORD-015／016累计值重复计数。净消费为上述两项差额、可负数，不新造净收入流水；F-PAY-006／016为录入时间，不替代发生时间。余额消费仍是一笔消费，不把F-WAL-009／011／012流水再加一次；充值须按真实充值业务／流水单列，F-WAL-020按03c§3为本次充值实收，历史套餐配置资料不作期间交易／赠送不作实收，充值交易及发生时间的剩余映射须先注册收口，不能伪造已接通。日期沿F-CORE-009业务时区。

每笔门店消费订单唯一有效业绩归属字段F-ORD-038 order_performance_staff_id，引用F-CORE-005；默认实际员工开单人，客户端商品确认前可空、门店确认必选不默认老板。修改权限按服务端当前038与身份校验：员工仅能转出当前本人订单、老板本店全部，结算前后同样遵守、变更原因F-AUD-009必填；收款后仅用独立归属更正，不解锁金额或重开单。F-ORD-032协调并发，每次成功变更推进当前版本；F-AUD保留旧／新归属、人／时间／原因／稳定请求，重试不再次重算或转移。整单实收及历史／后续退款依各真实F-PAY-018／009发生日按更正后有效归属汇总，消费实收只取实际已记账付款，不按应收／参考价；净消费减真实退款，免单未收不加实收，充值另列。更正不生成新付款退款、改余额／库存或覆盖经办F-SVC-009／F-PAY-005／017；只重归属员工业绩，全店期间合计不变。参与更正的前后员工仅可读本人相关调入调出业务摘要，不能读原始审计或他人员工汇总；原业务详情权限不因此收紧或授予改他人归属。失效员工原归属及后续实际收退款保留，不自动转人或阻断本店有效人员办理；普通员工不能认领，仅老板可明确更正。新归属／普通转交仅本店active，老板更正本店历史订单可选本店历史身份、原因必填，仍无失效员工访问权。历史缺归属回填仍待确认，提成仍排除。

“我的业绩”订单核对列表（04§3.0.10）：沿当前F-ORD-038和当前本店员工身份限定本人，包含未收／明确免单，不以F-PAY事件存在作入列前提；老板查本店员工沿既有权限。六列日期／订单号／顾客／业务项目／应收／实收，依次复用Order F-CORE-013原created_at、F-ORD-001、原Customer／订单明细、F-ORD-014、F-ORD-015；未知应收待确认、读取失败不补0。手机号筛选F-CUST-001，日期和排序用原Order created_at（按业务时区、默认今天、日期从所选首日00:00含至末日次日00:00不含，时间倒序），业务类型沿F-ORD-002／原service_type，不新造performance_date／order_no／业绩金额快照或持久化列表状态。014／015是该订单当前最终应收／累计真实已记账收款，不是所选期间新增金额，015不以退款净额重写；顶部与指标真实交易明细仍按F-PAY-018／009实际发生期，不将列表累计值相加当期间业绩。未收／免单可列但不增加实收，整单多宠／组合付款／寄养分批不重复行或金额。本人调入／调出摘要单列，沿原F-AUD对象、007／008前后值、009原因、010时间作有权业务投影，不开放原始审计／他人业绩；不新增字段，转出不继续列当前本人归属或改变原经办人。

## 13. 消息中心与微信通知（MSG）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-MSG-001 | `message_id` | S | ID | 单条站内消息。 |
| F-MSG-002 | `message_scope` | C | Enum | `platform / merchant`。平台个人消息与门店个人消息可在同一时间流展示，但权限规则不同。 |
| F-MSG-003 | `recipient_user_id` | C | ID | 明确接收的 Platform User；平台消息必填。 |
| F-MSG-004 | `merchant_id` | C | ID | 门店消息必填的租户。 |
| F-MSG-005 | `customer_id` | C | ID | 门店消息对应 Customer；未安全绑定 User 前可先关联 Customer。 |
| F-MSG-006 | `related_store_id` | C | ID | 平台业务关联的绑定 / 领取门店，仅表达业务关联，不自动授予门店私有权限。 |
| F-MSG-007 | `message_type` | C | Enum | 预约、服务、寄养、商品、钱包、投诉 / 风险反馈、上门喂养、积分等。 |
| F-MSG-008 | `message_title` | C | Text | 消息标题。 |
| F-MSG-009 | `message_summary` | C | Text | 消息摘要 / 内容。 |
| F-MSG-010 | `related_business_type` | C | Enum/Text | 关联业务对象类型。 |
| F-MSG-011 | `related_business_id` | C | ID | 关联真实业务对象。 |
| F-MSG-012 | `message_priority` | C | Enum | 仅普通通知 / 重要通知，全小程序统一，见03f§10；不与F-MSG-007业务类型、发送渠道或已读／待办状态混用。原较低档映射普通通知，原始审计保留；等级本身不触发短信或食品重新知悉，不另建priority／notification_level同义字段。 |
| F-MSG-013 | `read_status` | C | Enum/Bool | 已读状态，由服务端保存。 |
| F-MSG-014 | `read_at` | C | Datetime | 成功打开消息内容或有权限业务详情后的已读时间。 |
| F-MSG-015 | `jump_target` | C | Struct/Text | 深链目标；必须由服务端校验业务归属与权限。 |
| F-MSG-016 | `wechat_notify_attempted` | C | Bool | 是否尝试微信通知。 |
| F-MSG-017 | `wechat_sent_at` | C | Datetime | 微信通知发送时间。 |
| F-MSG-018 | `wechat_send_status` | C | Enum | 成功 / 失败等结果；失败不回滚正式业务。 |
| F-MSG-019 | `wechat_failure_reason` | C | Text | 微信通知失败原因。 |
| F-MSG-020 | `manual_notice_staff_id` | C | ID | 店员主动通知时的操作员工。 |
| F-MSG-021 | `manual_notice_template` | C | Text/Enum | 请联系门店、预计延迟、可以接宠、确认新时间、自定义等模板。 |
| F-MSG-022 | `manual_notice_content` | C | Text | 实际主动通知内容。 |
| F-MSG-023 | `manual_notice_at` | C | Datetime | 主动通知操作时间。 |

---

## 14. 已退役宠物交友 + 投诉 / 风险反馈 / 审核（SOCIAL_DEPRECATED / COMPLAINT / EVIDENCE / RISK / REVIEW）

### 14.1 已退役宠物交友字段

F-SOC-001 ～ F-SOC-020 的永久注册号继续保留用于历史迁移，但状态统一视为 `D`。原字段不得用于新“消费争议 / 投诉”业务，也不得重新解释为投诉字段。

旧字段族包括 social_enabled、social_nickname、pet_friend_invitation_id、invitation_status 等；完整旧定义见归档文件 `docs/history/03h-customer-pet-social.archived.md` 和 Git 历史。

### 14.2 投诉（COMPLAINT）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CMP-001 | `complaint_id` | S | ID | 单条门店 / 宠物食品投诉唯一标识。 |
| F-CMP-002 | `complaint_target_type` | C | Enum | `store / pet_food`。 |
| F-CMP-003 | `complainant_user_id` | S | ID | 投诉人 Platform User。 |
| F-CMP-004 | `target_store_id` | S | ID | 门店投诉对象；食品投诉可空。03f§13.3食品风险无明确门店时沿原案由平台承接、暂不派店；后续平台据事实明确争议店后用于该店初次派发，原值／新值及依据沿审计保留，不用User当前店／购买品牌猜测。非空不等于门店质量责任或食品正式回应权限；已派后改店／多店仍待决。 |
| F-CMP-005 | `target_product_id` | S | ID | 食品商品主体；门店投诉可空。 |
| F-CMP-006 | `target_sku_id` | S | ID | 食品具体 SKU / 规格，可空。 |
| F-CMP-007 | `product_batch_code` | S | Text | 食品批次 / 生产批次标识，用户能提供时记录。 |
| F-CMP-008 | `complaint_text` | C | Text | 用户原始投诉正文；允许无附件提交。 |
| F-CMP-009 | `complaint_submitted_at` | S | Datetime | 正式提交时间。 |
| F-CMP-010 | `content_review_status` | S | Enum | pending / approved / rejected / needs_revision 等基础内容审核状态。 |
| F-CMP-011 | `complaint_published_at` | S | Datetime | 基础审核通过后公开时间。 |
| F-CMP-012 | `complaint_workflow_status` | S | Enum | 提交、等待回应、补证、待裁决等流程状态；不得替代平台结论。 |
| F-CMP-013 | `business_response_status` | S | Enum | pending / responded / overdue；首次正式回应受理成功即responded，与补证流程同次更新，不清除F-CMP-018历史逾期，不代表已解决或平台结论。 |
| F-CMP-014 | `response_due_at` | C | Datetime | 基础审核通过、投诉对象正确且完成有效通知后由平台生成的7天正式回应截止。04§6.1.1工作台争议卡片／业务列表／详情顶部唯一取本值重点展示，并按服务端当前时间派生真实剩余时间；不新增第二deadline或持久化倒计时，不随打开／换员工／通知重试重置。无值不伪填7天／逾期，不扩展食品多主体待决期限。 |
| F-CMP-015 | `response_position` | C | Enum | 认可 / 部分认可 / 不认可 / 无法确认；首次正式回应必填，成功后原值保留，不覆盖编辑／删除，不作为追加说明字段。 |
| F-CMP-016 | `business_response_text` | C | Text | 首次正式回应必填正文；无回应草稿，成功后原文保留，不覆盖／删除。后续说明用F-EVD-007追加，不建第二可覆盖正文，原附件关联保留。 |
| F-CMP-017 | `business_responded_at` | S | Datetime | 服务端首个成功正式回应时间，与已回应／补证流程及F-CMP-019同次记录；不因补充、换员工、重复／并发或通知重试重置。 |
| F-CMP-018 | `business_response_overdue_at` | S | Datetime | 商家逾期未回应成立时间；不等于投诉成立。 |
| F-CMP-019 | `evidence_window_ends_at` | C | Datetime | 服务端首个成功正式回应后双方共用的3天补证截止；回应成功自动转补证，04§6.1.2重点展示。03h§7.1常规第三方邀请提交／追加也沿用本值，到期关提交仍可读公开内容，不另造邀请／佐证3天期限；晚收到／验证／重复邀请／追加／并发／通知重试不重置。平台要求额外材料期限另记，不改本值。 |
| F-CMP-020 | `complaint_decision_status` | C | Enum | `established / partially_established / insufficient_evidence / not_supported`；事实最终裁决只由平台有权流程产生，与F-CMP-021解决情况独立，不以回应／退款／顾客意见或平台确认解决自动代写。 |
| F-CMP-021 | `complaint_resolution_status` | S | Enum | unresolved / resolved；03h§6.1只允许平台有权人员明确确认后标记resolved。门店／顾客只提交处理情况和意见，不能直接写入或以同意／退款／已读／时间经过自动结案；不复用F-CMP-020事实结论，未确认的恢复／更正规则仍待决。 |
| F-CMP-022 | `complaint_resolved_at` | S | Datetime | 实际解决时间，不是平台确认操作时间或顾客反馈时间；不得由退款／点击／消息时间自动代填。平台确认人、操作时间、前后值及请求复用F-AUD并关联原投诉；实际时间填报／更正规则后续确认。 |
| F-CMP-023 | `complaint_appeal_status` | S | Enum | none / pending / decided 等申诉状态。 |
| F-CMP-024 | `platform_reviewer_user_id` | S | ID | 作出平台事实裁决的审核员；不因另一平台人员确认已解决而覆盖，该解决确认操作者沿原F-AUD关联，不冒充事实裁决人。 |
| F-CMP-025 | `platform_decided_at` | S | Datetime | 平台事实裁决时间，不是解决确认操作时间或实际解决时间；解决确认不自动覆盖本值。 |
| F-CMP-026 | `decision_reason` | C | Text | 裁决理由与关键依据。 |
| F-CMP-027 | `complaint_claim_id` | S | ID | 投诉中一个可独立判断的事实点。 |
| F-CMP-028 | `complaint_claim_text` | S | Text | 事实点内容。 |
| F-CMP-029 | `complaint_claim_decision_status` | C | Enum | 单事实点成立 / 证据不足 / 不支持等结论。 |
| F-CMP-030 | `complaint_is_public` | S | Bool | 当前是否允许公开展示；不得由商家自行关闭。 |
| F-CMP-031 | `complaint_withdrawn_at` | S | Datetime | 投诉人撤回时间（如适用），历史审计仍保留。 |
| F-CMP-032 | `removed_for_violation_at` | S | Datetime | 因内容违规等下架时间，不等于事实结论。 |

04§3.2.1工作台消费争议卡以F-CMP-001 complaint_id唯一关联原投诉，根据013回应状态、014回应截止、018逾期历史、019原补证截止及021平台解决状态派生分组／是否显示。每条争议单卡计数一次，不新增持久化workbench_status或复制投诉／期限；当前已回应不因018历史逾期仍留在待回应异常，021为平台resolved时退出卡片但不清除原回应／逾期字段。真实平台补材料请求另按对应任务规则读取，具体结构／完成与额外期限字段须后续先登记，不能伪填019重开3天；不把已读或处理进展当作完成信号。

03f§13.3食品风险初次派发复用F-CMP-001 complaint_id与004 target_store_id确定同案同店唯一归属；暂未明确店不造默认store_id或丢原案，明确后的重试不重复创建。主人消息按Platform User＋complaint_id独立去重，不能用主人／宠物／员工数量放大门店待办。确认关联的操作者、时间、事实依据及前后值复用F-AUD；食品风险知悉记录见§14.4.1，复用原投诉／门店组合唯一归属，不复制投诉或主人消息；其他平台派发／队列结构后续先登记，不以空字段或Mock宣称派发完成。

### 14.3 投诉证据（EVIDENCE）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-EVD-001 | `complaint_evidence_id` | S | ID | 单条投诉证据／说明稳定标识，同次请求重试不重复；03h§6.2每次处理情况及更正也独立记录，用015区分用途、不覆盖原文或另建订单。第三方同人同争议一份逻辑佐证可含多条材料／追加记录，按002／004／005归属，不按条数或邀请员工另建多份，不覆盖原回应／原佐证文字。 |
| F-EVD-002 | `evidence_complaint_id` | C | ID | 所属投诉。 |
| F-EVD-003 | `evidence_type` | S | Enum | text / image / video / chat / order / receipt / platform_record / regulatory / test_report 等。 |
| F-EVD-004 | `evidence_submitter_type` | S | Enum | complainant / business / third_party / platform。03h§6.2处理情况只由本案complainant或争议门店有权business人员提交，服务端按真实身份确定，第三方邀请不获得该资格；不据此放宽其他用途的提交权限。 |
| F-EVD-005 | `evidence_submitter_id` | S | ID | 实际提交者稳定标识。门店补充为本店老板／任一有效员工，资格及审计读取边界不变；third_party为沿03g完成必要验证的Platform User，不是邀请员工、昵称、手填手机号或Customer；03h§7.2既有作者的合法追加不受原卡片撤回阻断，仍校验本人／原投诉／原窗口。与002及004共同定位同一第三方对同一争议的一份逻辑佐证，不因重复邀请／切店／重试拆份。 |
| F-EVD-006 | `evidence_asset_ref` | S | Ref | 图片／视频／文件资源；03h§7.1第三方提交媒体选填，不强制身份证或消费订单。资源引用不等于公开授权；被邀请人仅可读已公开脱敏证据，不下发未脱敏原件／内部材料。 |
| F-EVD-007 | `evidence_text` | S | Text | 原文说明。03h§6.2处理情况简短说明必填，原文／更正逐条保留，未审仅实际提交者和平台有权人员可读，不从本值回填公开正文；媒体／退款凭证／签字不强制。§7.1第三方初次佐证文字必填及原窗口等规则不变，门店不得筛选／改写／删除不利佐证；不回写原回应、不等于审核／公开／裁决。 |
| F-EVD-008 | `is_business_invited_witness` | C | Bool | 第三方是否由被投诉商家邀请，审核端必须可见，沿真实邀请来源记录；不是由顾客随意声明的授权开关。标识／邀请不授予私有材料权限，不表示已提交／已审核或正式回应，不按邀请次数计多份佐证。 |
| F-EVD-009 | `evidence_relationship_type` | S | Enum/Text | 亲历、交易关系、旁观者、一般体验等与事件关系；03h§7.1第三方初次提交必填，不强制消费订单、不默认均为亲历；证据权重仍待DEC-EVIDENCE-01，不自动定责。 |
| F-EVD-010 | `evidence_submitted_at` | S | Datetime | 本条证据／说明的服务端实际提交时间。handling_progress在平台未确认解决且原对象可访问时可晚于原3天，不用它代填真实退款／实际解决时间或改写原截止；§7.1普通第三方初次／追加仍校验原窗口及适用邀请状态，规则不因处理入口放宽。 |
| F-EVD-011 | `evidence_weight_level` | P | Enum | 证据等级 / 权重模型受 DEC-EVIDENCE-01 阻塞，不得自行做投票分数。 |

03h§7.1的同人同争议一份佐证复用F-EVD-002／004／005唯一归属，多条材料／追加记录不产生多名佐证人。普通投诉证据／第三方佐证的单条审核及公开副本结构仍在后续技术设计按注册表登记；03h§6.2处理情况仅按14.3.2已登记范围执行，不扩展其他用途；不得复用F-CMP-010投诉基础审核状态或F-CMP-020事实结论冒充证据审核，也不得因尚未设计字段就直接公开未审原件。

### 14.3.1 佐证邀请卡片与撤回（WITNESS_INVITATION）

本对象属于EVIDENCE域的邀请记录，不是投诉、佐证正文或员工入职邀请；原F-EVD-001～011含义不改。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-EVD-012 | `witness_invitation_id` | S | ID | 一张逻辑佐证邀请卡片的稳定标识。转发副本／同次创建重试沿同一ID，明确再次邀请使用另一邀请记录，不改原撤回历史；不是佐证ID、User或私有材料授权令牌。 |
| F-EVD-013 | `witness_invitation_complaint_id` | C | ID | 该邀请唯一所属原complaint_id，创建后不改归属；本店权限由原投诉F-CMP-004 target_store_id及当前任职资格判定，不另存一套卡片门店／顾客所属字段，不据此推定食品多主体映射。 |
| F-EVD-014 | `witness_invitation_withdrawn_at` | S | Datetime | 可空；第一次实际撤回成功的服务端时间。非空仅阻止该邀请卡片新建佐证，不阻止既有作者在原窗口追加或当前公开浏览、不影响其他有效邀请。空值不代表自动可提交，仍须原身份／窗口／状态校验；不是证据删除／下架时间或新补证期限，重试不覆盖。 |

03h§7.2撤回人、选填原因、前后值和请求唯一复用F-AUD-002～011，原因用audit_reason，不另设强制撤回原因或重复经办字段。首次提交审计关联实际使用的F-EVD-012与F-EVD-001；撤回与该卡片首次提交校验同一最新状态并按先成功的操作生效，不能只判断客户端按钮或事后写日志。已提交作者的追加按F-EVD-002／004／005及原F-CMP-019窗口校验，不再要求原卡片未撤回；新顾客首次提交不得使用该例外。F-EVD-008商家邀请标识不能替代邀请状态，F-CMP-019仍是唯一原3天截止。F-AUD原始读取权限不因本节扩大。

### 14.3.2 处理情况用途与公开副本（HANDLING_PROGRESS）

本节字段属于F-EVD-001说明／证据记录，不属于14.3.1邀请卡片；处理情况沿原投诉F-EVD-002、实际作者004／005、原文007／原资源006及提交时间010，不另造处理订单。以下公开控制仅适用于handling_progress，不替普通投诉证据／第三方佐证的剩余审核和原件权限作默认决策。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-EVD-015 | `evidence_business_purpose` | C | Enum | complaint_evidence / handling_progress。服务端按原业务入口、真实作者和材料用途确定，提交后不改用途／投诉／作者归属；不能由客户端传handling_progress就绕过普通证据窗口。后者仅用于§6.2实际处理进展，平台未确认解决时可在原3天后提交，不重开证据窗口或替代申诉；不以文本猜测擅改既有记录用途。 |
| F-EVD-016 | `handling_progress_is_public` | S | Bool | 处理情况公开控制，初始false；仅平台有权流程完成审核／脱敏、准备好公开副本并实际发布后可为true，提交者不能赋值。false时原文／附件仅该条实际提交者（当前仍有访问权）与平台有权人员可读；true也不开放原件或替代原投诉当前公开／访问校验，不等于投诉成立／已解决，其他用途不复用此字段。 |
| F-EVD-017 | `handling_progress_public_text` | S | Text | 平台审核脱敏后的处理情况公开文本，只在016为true时对外提供；来源为已审核公开副本，不以007原文回填。不能让作者直接改公开文案，原文及追加历史仍保留；平台完整审核／更正／下架流程后续收口。 |
| F-EVD-018 | `handling_progress_public_media_refs` | S | Ref[] | 平台已审核脱敏并允许公开的处理情况媒体资源引用，媒体选填；仅016为true时公开，可是原媒体的受控脱敏副本，不返回006未脱敏原资源／私有下载地址，不因正文公开放开全部原附件。 |

未公开原材料读取校验004／005实际作者、当前身份／本店关系和原投诉访问权；老板或同店其他员工不是“提交者”的集体替身。工作记录／审计／消息／导出／缓存不得返回无权读取的原文与附件；审计仍保留实际人／时间／前后状态，关联原资源的读取单独按材料权限校验。审核状态机、拒绝／退回／下架恢复及平台角色权限等剩余细分不由上述Bool推定为已确认；本次只确定提交及公开门槛，不新增审核状态枚举或自动公开任务。

### 14.4 食品集中反馈信号（RISK）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-RISK-001 | `batch_risk_signal_id` | S | ID | 同一食品同一批次的集中反馈信号。 |
| F-RISK-002 | `risk_product_id` | C | ID | 对应商品主体。 |
| F-RISK-003 | `risk_sku_id` | S | ID | 对应 SKU（如适用）。 |
| F-RISK-004 | `risk_product_batch_code` | C | Text | 对应批次。 |
| F-RISK-005 | `independent_complaint_count_2d` | C | Int | 最近 2 天去重后的独立投诉数；至少 3 才可触发。 |
| F-RISK-006 | `distinct_source_store_count_2d` | S | Int | 最近 2 天不同来源门店数量，只影响优先级 / 排序。 |
| F-RISK-007 | `source_dispersion_weight` | P | Number | 跨门店来源加权具体系数尚未冻结；不得用于绕过 3 条硬门槛。 |
| F-RISK-008 | `risk_priority` | S | Number/Enum | 达到硬门槛后用于平台队列 / 列表优先级。 |
| F-RISK-009 | `risk_signal_status` | S | Enum | active / expired 等。 |
| F-RISK-010 | `risk_signal_started_at` | C | Datetime | “出现集中反馈”提示开始时间。 |
| F-RISK-011 | `risk_signal_expires_at` | C | Datetime | 当前确认提示开始后 2 个月到期；再次触发是否续期受 DEC-COMPLAINT-07。 |
| F-RISK-012 | `total_feedback_count` | S | Int | 聚合反馈总数；包括最终 not_supported。 |
| F-RISK-013 | `established_count` | S | Int | 成立数量。 |
| F-RISK-014 | `partially_established_count` | S | Int | 部分成立数量。 |
| F-RISK-015 | `insufficient_evidence_count` | S | Int | 证据不足数量。 |
| F-RISK-016 | `not_supported_count` | S | Int | 现有证据不支持数量；仍属于历史反馈。 |
| F-RISK-017 | `public_risk_signal_text` | C | Text/Enum | 当前固定对外语义“出现集中反馈”。 |
| F-RISK-018 | `issue_heat_value` | P | Number | 食品问题热度数值；范围和算法受 DEC-FOOD-HEAT-01 阻塞，前端不得自行计算。 |
| F-RISK-019 | `issue_heat_display` | S | Text/Struct | 服务端返回的热度展示结果；可承载“问题热度 86”等最终确认后的表现。 |
| F-RISK-020 | `issue_heat_updated_at` | S | Datetime | 当前问题热度最近计算时间。 |

### 14.4.1 门店食品风险知悉提醒（FOOD_RISK_NOTICE）

本对象是03f§13.3.1的本店知悉记录，不是F-RISK-001批次集中反馈信号或F-MSG-001主人消息；同原投诉与归属门店仅一条，风险原文／品牌／核验状态沿原公开对象读取，不复制私有顾客名单。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-RISK-021 | `food_risk_notice_id` | S | ID | 独立门店食品风险提醒稳定标识；按022＋023唯一，同案同店重复派发／通知不新增、不复活已知悉；未明确门店时不造本地提醒。 |
| F-RISK-022 | `food_risk_notice_complaint_id` | C | ID | 原食品complaint_id，与原品牌／公开风险／平台核验关联，不是主人消息ID或batch_risk_signal_id；不因知悉复制／修改原投诉。 |
| F-RISK-023 | `food_risk_notice_store_id` | C | ID | 该条提醒归属Store，初次沿原已明确争议门店生成；实际查看／知悉须当前本店身份及合法原对象关联，不信客户端传门店。已派后改店／多店及迁移规则未确认，不直接覆盖本值复用旧任务。 |
| F-RISK-024 | `food_risk_notice_acknowledged_at` | S | Datetime | 可空；当前026轮次内首次明确知悉成功的服务端时间。非空移出当前待办，消息已读／裁决／过期不伪填；普通通知不清空，本轮重试／并发不覆盖。仅真实平台新要求或已知悉后恢复成功时保存旧轮历史再将当前值置空，不能删旧知悉事实；不是投诉解决／安全结论或风险期限。 |
| F-RISK-025 | `food_risk_notice_note` | S | Text | 当前轮知悉的选填本店内部备注，空值可成功，无强制联系／证明；同轮重试不覆盖。重要通知／恢复开新轮前保留旧轮备注历史，新轮可空，不冒充旧备注为新声明。恢复原因另复用F-AUD-009且选填，不公开给顾客／跨店，不复用对外处理进展字段；其他直接改备注规则待后续。 |
| F-RISK-026 | `food_risk_notice_round` | S | Int | 当前知悉轮次／并发版本，服务端初始1。仅非重复的平台明确重新知悉要求，或从当前已知悉成功恢复待知悉时递增，始终沿同一notice_id／投诉／店。普通通知、重复通知、已待知悉时重复恢复不增轮；操作带当前轮校验，旧轮不能确认新轮，客户端不能自行回写／重置版本。历轮人／时间／备注／触发保留原审计及授权业务历史；不是新任务或2个月风险续期。 |

实际知悉操作者、门店／原提醒、前后值与请求复用F-AUD；普通员工可按本店业务权限查经办历史，不据此读原始审计。当前待知悉／已知悉从024派生，不另建同义status、总已处理状态或投诉resolved。空备注／无上传证明不阻断，失败不写时间；多人／重试只一份当前轮首次结果，旧轮结果仍保留。风险公开内容及原有权顾客宠物资料仍逐次鉴权，不因提醒存在就获得私有原件；普通通知／重要通知和误点恢复按03f§13.3.2：平台新要求源事件／稳定请求沿F-AUD-001／011关联原提醒，按完整历史去重，不能把重发通知当新要求；恢复仅本店有效人员、无需审批、原因选填。旧成功请求重试返回原历史结果，不改当前新轮。已派后改店／多店和其他备注更正／平台界面仍待后续。

### 14.5 平台批量审核（REVIEW）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-REV-001 | `review_item_id` | S | ID | 单条待审核对象；Excel 行号不得替代。 |
| F-REV-002 | `review_batch_id` | S | ID | 一次导出 / 上传审核批次。 |
| F-REV-003 | `row_version` | C | Int | 乐观并发版本；导出后原记录变化则拒绝旧行覆盖。 |
| F-REV-004 | `review_target_type` | S | Enum | complaint / pet_safety / customer_risk / store_profile_change等审核对象类型；门店资料修改关联F-STORE-006，不复用投诉对象。 |
| F-REV-005 | `review_target_id` | S | ID | 被审核真实业务对象。 |
| F-REV-006 | `review_content_type` | S | Enum/Text | 提交内容类型。 |
| F-REV-007 | `submitted_value` | S | Struct/Text | 原始提交内容快照；审核上传不得覆盖。 |
| F-REV-008 | `review_source_type` | S | Enum/Text | 来源类型。 |
| F-REV-009 | `review_source_business_id` | S | ID | 关联业务（如有）。 |
| F-REV-010 | `review_evidence_count` | S | Int | 导出时证据数量。 |
| F-REV-011 | `current_review_status` | S | Enum | pending_review / approved / rejected / needs_revision / escalated / withdrawn / superseded。 |
| F-REV-012 | `reviewer_decision` | S | Enum | 审核员填写结果。 |
| F-REV-013 | `approved_value` | S | Struct/Text | 审核后标准化内容（如行为标签）。 |
| F-REV-014 | `reviewer_reason_code` | S | Enum/Text | 标准化原因码。 |
| F-REV-015 | `reviewer_comment` | S | Text | 审核批注。 |
| F-REV-016 | `visibility_scope` | P | Enum/Struct | 跨店可见范围；具体权限仍由对应业务 DEC 确认。 |
| F-REV-017 | `effective_until` | P | Datetime | 对需要过期的共享信息生效截止。 |
| F-REV-018 | `severity_level` | S | Enum | 受控风险等级（如启用）。 |
| F-REV-019 | `require_followup` | S | Bool | 是否需后续人工处理。 |
| F-REV-020 | `followup_note` | S | Text | 后续处理说明。 |
| F-REV-021 | `reviewed_by_user_id` | S | ID | 平台审核员。 |
| F-REV-022 | `reviewed_at` | S | Datetime | 审核完成时间。 |
| F-REV-023 | `review_upload_idempotency_key` | S | Text | 重复上传同一审核文件 / 结果的幂等键。 |

### 14.6 跨门店顾客客观风险事件（CUSTOMER_RISK）

> 产品原则已确认“共享客观风险事件，不共享主观人格评价”，并已确认查询额度、授权撤回、身份冲突阻断、无条件申诉、12个月跨店展示、3年受限留存与到期处置。风险事件的完整提交／审核模型与业务自动影响仍受 DEC-RISK-01 阻塞；仅标记为 P 的字段不得实现成正式规则。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CRISK-001 | `customer_risk_event_id` | P | ID | 平台级客观风险事件。 |
| F-CRISK-002 | `risk_subject_user_id` | P | ID | 被记录的 Platform User。 |
| F-CRISK-003 | `risk_event_type` | P | Enum | 爽约、拒付、威胁、已核验恶意退款等客观事件类型。 |
| F-CRISK-004 | `risk_event_source_merchant_id` | P | ID | 来源 Merchant。 |
| F-CRISK-005 | `risk_event_source_store_id` | P | ID | 来源 Store。 |
| F-CRISK-006 | `risk_event_business_id` | P | ID | 关联预约 / 订单 / 服务等事实对象。 |
| F-CRISK-007 | `risk_event_review_status` | P | Enum | 平台审核结果。 |
| F-CRISK-008 | `risk_event_cross_store_visible_until` | C | Datetime | 跨店展示硬截止：首次可共享平台结论生效时间 + 12个月；等于或晚于该时间不得返回门店。申诉及普通更正不重置，提前撤回／撤销按更早时间停止。 |
| F-CRISK-009 | `risk_event_appeal_status` | C | Enum | submitted / under_review / original_decision_maintained / record_corrected / sharing_revoked；顾客可无条件提交，状态不等于申诉自动成立。 |
| F-CRISK-010 | `cross_store_risk_query_id` | S | ID | 单次跨店查询稳定标识。 |
| F-CRISK-011 | `query_viewing_store_id` | S | ID | 发起查询并持有月度额度的查看Store。 |
| F-CRISK-012 | `query_actor_staff_id` | S | ID | 实际查询员工；额度由查看Store内员工共享。 |
| F-CRISK-013 | `query_business_object_type` | S | Enum | customer_create / appointment_confirmation等已批准真实业务触发类型。 |
| F-CRISK-014 | `query_business_object_id` | S | ID | 当前Customer创建／预约处理对象等稳定关联；禁止为空对象绕过。 |
| F-CRISK-015 | `query_identity_fingerprint` | S | Text | 标准化身份的不可逆指纹，用于同顾客额度与审计。能唯一匹配Platform User时，同一主体的手机号与稳定微信身份必须归入同一指纹；未匹配时按本次规范化输入生成隔离指纹。不得保存原始手机号或以微信昵称充当该字段。 |
| F-CRISK-016 | `query_month_key` | S | Text | 按Asia/Shanghai计算的自然月，格式YYYY-MM。 |
| F-CRISK-017 | `query_count_in_month` | S | Int | 同一查看Store + 同一标准化身份 + query_month_key已计数次数，最大为3。 |
| F-CRISK-018 | `query_result_category` | S | Enum | success / no_match / identity_conflict / rate_limited / authorization_denied / error；仅供鉴权、审计和告警，对门店端仍最小披露。 |
| F-CRISK-019 | `related_request_id` | S | ID | 查询幂等请求标识；相同请求的网络重试不重复计数。 |
| F-CRISK-020 | `risk_share_store_authorization_status` | C | Enum | active / revoked；来源门店与查看门店分别记录自身授权，不能互相代替。 |
| F-CRISK-021 | `risk_share_store_authorized_at` | S | Datetime | 当前一轮门店授权生效时间。 |
| F-CRISK-022 | `risk_share_store_revoked_at` | S | Datetime | 当前一轮门店授权撤回时间；服务端确认后立即停止对应方向的新共享。 |
| F-CRISK-023 | `service_fulfillment_share_consent_status` | C | Enum | granted / revoked；顾客服务履约记录分项同意，不与宠物护理分项复用。 |
| F-CRISK-024 | `service_fulfillment_share_consented_at` | S | Datetime | 当前一轮顾客分项同意生效时间。 |
| F-CRISK-025 | `service_fulfillment_share_revoked_at` | S | Datetime | 当前一轮顾客分项同意撤回时间；撤回不删除不可变审计与真实业务事实。 |
| F-CRISK-026 | `identity_conflict_status` | C | Enum | none / pending_review / resolved / unresolved；冲突期间不得返回跨店风险结果。 |
| F-CRISK-027 | `identity_conflict_review_item_id` | S | ID | 冲突对应平台审核项，唯一归属F-REV-001；门店员工不得自行解除。 |
| F-CRISK-028 | `risk_event_appeal_id` | S | ID | 每轮申诉稳定标识；重复内容可关联审核案，但不得拒绝生成申诉记录。 |
| F-CRISK-029 | `risk_event_appeal_submitted_at` | S | Datetime | 申诉提交时间；不设时间、次数、费用或先决处理门槛。 |
| F-CRISK-030 | `risk_event_appeal_content` | C | Text/Struct | 顾客本轮申诉陈述及材料引用；身份核验仅用于防冒名。 |
| F-CRISK-031 | `risk_share_store_authorization_id` | S | ID | 每轮门店参与授权稳定标识；重新授权新建一轮，不覆盖撤回历史。 |
| F-CRISK-032 | `risk_share_authorizing_store_id` | S | ID | `F-CRISK-020`～`022`授权记录的唯一Store归属。 |
| F-CRISK-033 | `service_fulfillment_share_consent_id` | S | ID | 每轮顾客服务履约记录分项同意稳定标识。 |
| F-CRISK-034 | `service_fulfillment_share_consent_user_id` | S | ID | `F-CRISK-023`～`025`同意记录的唯一Platform User归属。 |
| F-CRISK-035 | `identity_conflict_id` | S | ID | 单次身份冲突稳定标识，关联查询与平台审核项，不复用Customer ID。 |
| F-CRISK-036 | `risk_event_appeal_subject_user_id` | S | ID | `F-CRISK-028`～`030`申诉记录的唯一Platform User主体；与风险事件主体关系须校验以防冒名。 |
| F-CRISK-037 | `risk_event_cross_store_visible_from` | S | Datetime | 首次形成可跨店共享的平台结论并实际生效时间；`F-CRISK-008`唯一基准，不因申诉或普通更正覆盖。 |
| F-CRISK-038 | `risk_evidence_retention_until` | S | Datetime | 原始事实、证据、审核过程与结论的受限保留截止；取`risk_event_cross_store_stopped_at`与最后一轮申诉办结中的较晚时间，再加3年。 |
| F-CRISK-039 | `risk_share_store_authorization_retention_until` | S | Datetime | 门店授权撤回、替换或失效时间 + 3年；有效授权期间为空，不得据空值删除。 |
| F-CRISK-040 | `service_fulfillment_share_consent_retention_until` | S | Datetime | 顾客分项同意撤回、替换或失效时间 + 3年；有效同意期间为空。 |
| F-CRISK-041 | `query_audit_retention_until` | S | Datetime | 单次查询发生时间 + 3年。 |
| F-CRISK-042 | `identity_conflict_retention_until` | S | Datetime | 身份冲突办结时间 + 3年；尚未办结时为空且不得自动删除。 |
| F-CRISK-043 | `risk_event_appeal_retention_until` | S | Datetime | 每轮申诉办结时间 + 3年；各轮分别计算。 |
| F-CRISK-044 | `retention_disposition_id` | S | ID | 单次到期处置审计记录稳定标识。 |
| F-CRISK-045 | `retention_target_type` | S | Enum | risk_evidence / store_authorization / customer_consent / query_audit / identity_conflict / appeal_material。 |
| F-CRISK-046 | `retention_target_id` | S | ID | 被处置记录的稳定标识，必须与`retention_target_type`对应，不复用业务主体ID。 |
| F-CRISK-047 | `retention_disposition_type` | C | Enum | deleted / irreversibly_anonymized / retained_by_independent_rule；最后一项不得恢复跨店展示。 |
| F-CRISK-048 | `retention_disposed_at` | S | Datetime | 删除、不可逆匿名化或转入独立规则留存的实际完成时间。 |
| F-CRISK-049 | `risk_event_cross_store_stopped_at` | S | Datetime | 该事件实际停止跨店展示的时间；12个月到期、来源门店授权撤回、顾客同意撤回或平台撤销时写入最早有效时间。查看门店只撤回本店参与授权不改全局事件时间。 |
| F-CRISK-050 | `risk_event_cross_store_stop_reason` | C | Enum | retention_expired / source_store_revoked / customer_consent_revoked / platform_sharing_revoked；与F-CRISK-049对应。 |

---

## 15. 上门喂养需求市场（FEED）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-FEED-001 | `home_feeding_request_id` | S | ID | 平台级上门喂养需求唯一标识；不复用普通商品/服务订单。 |
| F-FEED-002 | `publisher_user_id` | S | ID | 发布者 Platform User。 |
| F-FEED-003 | `publisher_store_id` | C | ID | 原始发布Store，永久保留且不随普通切店或账号停用接续覆盖；03j§9.2最近店选择始终以此店有效位置为起点，当前处理店另用F-FEED-030，不混为同一可改字段。 |
| F-FEED-004 | `pet_ids` | C | Ref[] | 选择已有宠物，可多只。 |
| F-FEED-005 | `pet_type_summary` | S | Text/Struct | 公开卡片的宠物类型摘要。 |
| F-FEED-006 | `pet_count` | C | Int | 需求中的宠物数量。 |
| F-FEED-007 | `pet_photo_refs` | C | Ref[] | 可选宠物照片。 |
| F-FEED-008 | `service_start_date` | C | Date | 上门喂养开始日期。 |
| F-FEED-009 | `service_end_date` | C | Date | 上门喂养结束日期。 |
| F-FEED-010 | `daily_time_window` | C | Struct | 每日喂养时间／时段，保留可计算的首日最早上门起始及每日安排，可附展示文字；与F-FEED-008在Asia/Shanghai计算唯一F-FEED-026截止，模糊文字／AI猜测不能决定接单资格，不是实际打卡记录。 |
| F-FEED-011 | `daily_visit_count` | C | Int | 每日上门次数。 |
| F-FEED-012 | `location_city` | S | Text | 公开真实城市。 |
| F-FEED-013 | `location_district` | S | Text | 公开真实区县。 |
| F-FEED-014 | `public_location_text` | S | Text | 小区名称 / 附近区域等模糊位置。不得泄露门牌号。 |
| F-FEED-015 | `private_exact_address` | S | Text | 精确地址，只有接单后合法必要且授权的门店对接流程可使用；公开接口禁止返回。 |
| F-FEED-016 | `daily_budget` | C | Money | 每日预算。V1 不代表平台托管资金。 |
| F-FEED-017 | `feeding_requirements` | C | Text | 喂养要求。 |
| F-FEED-018 | `special_notes` | C | Text | 特殊注意事项，选填。 |
| F-FEED-019 | `home_feeding_status` | S | Enum | 当前待接单／待门店确认（承接已接单待门店对接）／已确认／已撤销（原已取消语义）／expired已过期。已确认只表撮合确认，不表实际服务执行；旧门店对接中／服务中／已完成状态退役，仅留原历史，不新写或据日期生成。 |
| F-FEED-020 | `accepted_user_id` | S | ID | 当前有效接单者 Platform User；首个有效请求原子锁定。 |
| F-FEED-021 | `accepted_at` | S | Datetime | 当前轮有效接单成立时间。 |
| F-FEED-022 | `acceptance_round` | D | Int | 2026-11-01退役：退出／重新开放链路取消，不再创建新接单轮次。保留永久ID／逻辑名及既有历史，不再写入或作为新流程API／DTO／持久化必填依赖。 |
| F-FEED-023 | `share_deep_link` | S | Text | 微信聊天/群分享后进入对应需求详情的深链。 |
| F-FEED-024 | `store_coordination_status` | D | Enum | 2026-11-01退役：内部对接细状态与四步服务跟踪取消。保留永久ID／逻辑名及既有历史，不再写入或作为新流程API／DTO／持久化必填依赖。 |
| F-FEED-025 | `publisher_cancel_deadline` | D | Datetime | 2026-11-01退役：需求方仅发布／撤销，不新增固定撤销截止字段。保留永久ID／逻辑名及既有历史，不再写入或作为新流程API／DTO／持久化必填依赖。 |
| F-FEED-026 | `accept_deadline` | S | Datetime | 首次约定上门起始（日期＋首日最早时段起点，Asia/Shanghai）为唯一接单截止，不提前小时数。now严格小于才可用户接单，门店确认不复用此截止；已有有效接单不按日期终止。发布后无APP编辑／重新开放，线下协商不改本值，旧过期不复活。 |
| F-FEED-027 | `public_expires_at` | S | Datetime | 当前公开招募曝光退出时点，初始取F-FEED-026，提前接单／撤销按真实事件收口并留历史。无APP重新开放／编辑重算；不是旧分享禁访、记录删除或双方联系资料公开时间。 |
| F-FEED-028 | `store_coordination_note` | D | Text | 2026-11-01退役：协商线下完成，APP不维护沟通备注表单。保留永久ID／逻辑名及既有历史，不再写入或作为新流程API／DTO／持久化必填依赖。 |
| F-FEED-029 | `store_coordination_media_refs` | D | Ref[] | 2026-11-01退役：协商线下完成，APP不维护沟通照片／媒体表单。保留永久ID／逻辑名及既有历史，不再写入或作为新流程API／DTO／持久化必填依赖。 |
| F-FEED-030 | `current_coordination_store_id` | S | ID | 本上门喂养需求当前唯一负责对接Store，初始等于F-FEED-003；账号停用按03j§9.2系统自动改派最近有效店，不改变原发布门店或接单人。待办、业务操作及必要资料权限按本值与F-FEED-031校验，不是用户全局current_store_id，也不转移商户Customer／资产。 |
| F-FEED-031 | `coordination_assignment_version` | S | Int | 当前负责店版本，初始1，成功系统接续递增；确认／撤销／接单／迁移及联系方式取用校验最新值。联系资料另要求F-FEED-035等于本值，旧店确认不自动给新店；原新店／原因／系统时间用F-AUD保留，重试不重复待办／通知。 |
| F-FEED-032 | `acceptance_exited_at` | D | Datetime | 2026-11-01退役：APP不增加独立接单退出／重新开放操作。保留永久ID／逻辑名及既有历史，不再写入或作为新流程API／DTO／持久化必填依赖。 |
| F-FEED-033 | `home_feeding_store_confirmed_at` | S | Datetime | 当前记录最近一次门店明确确认成功的服务端时间，不是用户接单／服务开始／完成时间；历史各版用F-AUD保留，不因打开页面或自动转店伪造确认。 |
| F-FEED-034 | `home_feeding_store_confirmed_by_staff_id` | S | ID | 执行确认的当前店老板／有效员工，关联原需求／当前负责店及F-FEED-035；本店统一资格不等于老板审批，旧店经办历史不覆盖。 |
| F-FEED-035 | `home_feeding_store_confirmed_assignment_version` | S | Int | 本次门店确认对应F-FEED-031版本。仅当前店且本值等于当前负责版本、确认时间／人真实成立、需求未撤销／过期时可读双方联系资料；迁移保留旧确认历史但新店须再次确认，不凭业务状态“已确认”放行。 |

03j§9门店仅确认／撤销，需求方仅发布／撤销，用户自主接单保留；任何协商修改与实际服务在线下，不创建APP修改／重开／开始／完成／协商备注媒体。业务操作、待办和联系资料权限以原需求、F-FEED-030／031及有效接单者校验；F-FEED-022／024／025／028／029／032退役，不再作为状态机或新请求必填项。

双方联系方式由publisher_user_id／accepted_user_id关联原有合法授权联系资料（如F-AUTH-001 verified_mobile），角色上下文区分双方，不新增publisher_phone／acceptor_phone同义存储，不复制外店Customer、不伪造缺失资料。仅当前店老板／有效员工在真实确认且F-FEED-035匹配当前版本后可读；确认前店家、参与双方互读、公开／分享／消息／导出／缓存均不得越权返回。撤销／失权关闭新读取；精确地址仍按原必要授权，不因确认对用户公开。

账号停用按原发布店有效位置自动接续，原需求／接单人／发布信息／历史保留；新店需再次确认，旧版记录与原始审计保留但不向普通员工开放原始日志或其他门店数据。此例外不创建新店Customer、不转钱包／相册或改全局当前门店，临时休息不迁移。确认只记撮合事实，不生成服务开始／完成或财务；无有效接单到F-FEED-026截止过期，旧分享只读无双方联系资料。DEC-FEED-01／03已确认，02仅余地理技术／异常界面。

## 16. 平台积分、签到、积分商城与兑换履约（POINTS / REWARD）

### 16.1 积分账户与签到

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PTS-001 | `points_account_id` | S | ID | Platform User 的平台积分账户。不得按 Merchant 建立独立积分余额。 |
| F-PTS-002 | `points_balance` | S | Int | 当前平台积分余额，为积分账本汇总结果。 |
| F-PTS-003 | `points_ledger_id` | S | ID | 单条积分流水。 |
| F-PTS-004 | `points_change_type` | C | Enum | 签到、兑换券、兑换实物、取消返还、后续允许的平台调整等。 |
| F-PTS-005 | `points_delta` | C | Int | 本次积分变化值，正/负。 |
| F-PTS-006 | `points_before` | C | Int | 变动前积分。 |
| F-PTS-007 | `points_after` | C | Int | 变动后积分。 |
| F-PTS-008 | `points_source_business_id` | C | ID | 来源业务 ID。 |
| F-PTS-009 | `points_occurred_at` | C | Datetime | 积分变动时间。 |
| F-PTS-010 | `points_note` | C | Text | 备注 / 原因。 |
| F-PTS-011 | `daily_checkin_id` | S | ID | 单日签到结果。 |
| F-PTS-012 | `checkin_date` | S | Date | `Asia/Shanghai` 自然日。 |
| F-PTS-013 | `awarded_points` | C | Int | 当日服务端受约束随机 1～10 分。 |
| F-PTS-014 | `algorithm_version` | C | Text | 生成签到奖励的算法版本；升级不得改写历史结果。 |
| F-PTS-015 | `points_generated_at` | C | Datetime | 服务端实际生成当日积分结果时间。 |
| F-PTS-016 | `checkin_reward_entitlement_id` | S | ID | 关联 `daily_checkin` 激励广告权益记录。 |

### 16.2 积分奖励与兑换

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-RWD-001 | `reward_id` | S | ID | 积分商城奖励。 |
| F-RWD-002 | `reward_name` | C | Text | 奖励名称。 |
| F-RWD-003 | `reward_image_ref` | C | Ref | 奖励图片。 |
| F-RWD-004 | `reward_type` | C | Enum | 商户优惠券 / 实物等奖励类型。 |
| F-RWD-005 | `points_cost` | C | Int | 所需积分。 |
| F-RWD-006 | `reward_inventory` | C | Int | 平台/总仓独立奖励库存；不得等同 `store_product_inventory`。 |
| F-RWD-007 | `reward_active_status` | S | Enum | 上下架状态。 |
| F-RWD-008 | `per_user_limit` | C | Int | 每人兑换上限，可选。 |
| F-RWD-009 | `reward_valid_until` | C | Datetime | 奖励有效期（如适用）。 |
| F-RWD-010 | `allowed_store_ids` | C | Ref[] | 可兑换 / 可领取门店范围。 |
| F-RWD-011 | `reward_coupon_value` | C | Money | 券类奖励面额。 |
| F-RWD-012 | `reward_coupon_scope` | C | Struct/Enum | 券类奖励适用范围。 |
| F-RWD-013 | `points_redemption_id` | S | ID | 用户单次积分兑换单。 |
| F-RWD-014 | `pickup_store_id` | C | ID | 用户选择的领取 / 使用门店。不得因切店改变。 |
| F-RWD-015 | `redemption_points_cost` | S | Int | 本次实际消耗积分。 |
| F-RWD-016 | `points_processing_status` | S | Enum | 兑换处理中 / 已扣成功 / 返还处理中 / 已返还等积分处理结果；与履约状态分开。 |
| F-RWD-017 | `fulfillment_status` | C | Enum | 待总仓发货／已发往门店／已领取／已取消。取消门店已收货待自提阶段，不凭发货／预计日期推断到货或自动记领取；实际交付后所选店员工手动登记已领取，规则见03k§8。 |
| F-RWD-018 | `redemption_created_at` | S | Datetime | 兑换时间。 |
| F-RWD-019 | `fulfillment_task_id` | S | ID | 总仓到门店的实物履约任务。 |
| F-RWD-020 | `warehouse_shipped_at` | S | Datetime | Platform Super Admin 确认总仓发货时间。 |
| F-RWD-021 | `store_received_at` | D | Datetime | 2026-11-01退役：门店到货确认取消，保留永久ID／逻辑名供追溯，不再采集、写入或作为领取前置条件，不以发货时间补造到货时间。 |
| F-RWD-022 | `pickup_credential` | D | Text/Struct | 2026-11-01退役：取消顾客领取凭证，不再生成／要求领取码、二维码、扫码验码或凭证核验指引，保留永久ID／逻辑名供追溯。 |
| F-RWD-023 | `picked_up_at` | S | Datetime | 实际领取时间。 |
| F-RWD-024 | `pickup_verified_by_staff_id` | S | ID | 所选领取门店实际交付后点击已领取的老板／有效员工；保留原逻辑名，verified不表示校验顾客领取凭证。与F-RWD-023实际领取时间、F-RWD-013原单、F-RWD-014所选店及F-AUD关联，不新造同义经办字段。 |
| F-RWD-025 | `canceled_at` | S | Datetime | 已确认取消成立时间；取消权限本身仍受 DEC-POINTS-01 阻塞。 |
| F-RWD-026 | `points_refund_ledger_id` | S | ID | 取消后积分补偿流水；“已取消”不等于“积分已返还”。 |
| F-RWD-027 | `pickup_deadline` | P | Datetime | DEC-POINTS-02 未确认，自提期限不得提前写死。 |
| F-RWD-028 | `replacement_pickup_store_id` | P | ID | 是否允许改领取门店待 DEC-POINTS-02；确认前不得实现。 |

03k§8取消门店到货确认与领取凭证，F-RWD-021／022退役，不继续作为API／DTO／数据库必填项或领取状态门槛。F-RWD-017从真实已发往门店在实际交付后转换已领取；不新增到货时间、待自提状态或自动到货通知。F-RWD-023／024及原F-AUD保存实际领取／经办／门店／服务端操作事实，重试与有效取消竞态校验原单最新状态／幂等，不能因免凭证跨店登记或重复发放，不改普通商品库存／钱包。原取消／期限／停店改店待决规则保持。

---

## 17. 养宠顾问与门店 Feature Entitlement（ENT / ADVISOR）

### 17.1 门店权益

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-ENT-001 | `feature_entitlement_id` | S | ID | 单条 Store Feature Entitlement。 |
| F-ENT-002 | `owner_type` | C | Enum | 当前pet_advisor付费权益归store；ai_stock_intake未来会员也规划store，但当前两种入库不要求付费权益记录。 |
| F-ENT-003 | `owner_id` | C | ID | 当前值必须等于对应 `store_id`；不能用 purchaser Merchant 替代资格归属。 |
| F-ENT-004 | `purchaser_merchant_id` | C | ID | 购买 / 管理 / 审计关联，不参与替代 Store 资格判断。 |
| F-ENT-005 | `feature_key` | C | Text | 当前生效付费功能pet_advisor；ai_stock_intake仅预留未来门店会员能力，当前手工／AI拍照入库不校验此权益、不假造有效记录。未来定价额度开通另确认，不影响顾问原校验。 |
| F-ENT-006 | `entitlement_status` | C | Enum | 有效 / 过期 / 停用等权益状态。 |
| F-ENT-007 | `enabled_by_merchant` | C | Bool | pet_advisor在有效平台权益前提下由老板决定是否向本店客户开启；不转义为ai_stock_intake店内开关，拍摄入库不新增此配置门槛。 |
| F-ENT-008 | `starts_at` | C | Datetime | 权益开始时间。 |
| F-ENT-009 | `expires_at` | C | Datetime | 权益结束时间，可选。 |
| F-ENT-010 | `plan` | C | Text | 付费方案语义，具体值后续商业化阶段确定。 |
| F-ENT-011 | `entitlement_source` | C | Text | 权益来源。 |

### 17.2 顾问额度与聊天

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-ADV-001 | `advisor_quota_account_id` | S | ID | Platform User 的养宠顾问额度账户；不按门店重置。 |
| F-ADV-002 | `free_answer_used_count` | S | Int | 终身前三次免费有效回答已使用次数，最大 3。 |
| F-ADV-003 | `unlocked_answer_remaining` | S | Int | 激励广告解锁后尚未使用的有效回答次数。 |
| F-ADV-004 | `advisor_thread_id` | S | ID | 平台级个人聊天线程标识；门店付费不授予读取权限。 |
| F-ADV-005 | `advisor_message_id` | S | ID | 单条用户/AI消息。 |
| F-ADV-006 | `advisor_message_role` | S | Enum | user / assistant / system 等实现语义。 |
| F-ADV-007 | `advisor_message_content` | C | Text | 用户问题或 AI 回答正文。不得因门店购买功能向 Merchant/Staff 自动公开。 |
| F-ADV-008 | `advisor_answer_status` | S | Enum | 生成中 / 成功 / 失败等。只有成功有效回答才扣次数。 |
| F-ADV-009 | `quota_consumed` | S | Bool | 本次成功回答是否已幂等消费 1 次额度。 |
| F-ADV-010 | `advisor_context_store_id` | S | ID | 本次发送问题时的门店上下文，用于重新校验 Store 权益；不代表聊天数据归门店。 |

---

## 18. 激励广告权益（REWARDED_AD）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-AD-001 | `reward_entitlement_id` | S | ID | 一次可信广告完成后授予的业务权益记录。 |
| F-AD-002 | `platform_user_id` | S | ID | 权益对应 Platform User；替代 03m 中模糊 `user_id`。 |
| F-AD-003 | `placement` | C | Enum | 当前固定至少 `ai_report / daily_checkin / pet_advisor`。不得与曝光广告 placement 混用权益逻辑。 |
| F-AD-004 | `business_key` | C | Text | 权益对应的业务键，例如指定服务报告、自然日签到等。 |
| F-AD-005 | `ad_session_id` | C | Text/ID | 广告 SDK / 服务端验证会话。重复回调只能发一次权益。 |
| F-AD-006 | `reward_type` | C | Enum/Text | 权益类型。 |
| F-AD-007 | `reward_amount` | C | Number | 数量型奖励，如顾问 +3 次；不适用时可空。 |
| F-AD-008 | `entitlement_value` | S | Struct/Text | 非纯数值权益内容，如某服务 AI 报告资格。 |
| F-AD-009 | `reward_status` | C | Enum | 验证中 / 已授予 / 未授予等广告权益状态。 |
| F-AD-010 | `verified_at` | C | Datetime | 可信广告完成验证时间。 |
| F-AD-011 | `granted_at` | C | Datetime | 对应权益实际授予时间。 |
| F-AD-012 | `idempotency_key` | C | Text | 复用 F-CORE-010；同一广告完成回调不重复授予。 |
| F-AD-013 | `merchant_id` | C | ID | 目标业务存在门店资格约束时的上下文，可空。 |
| F-AD-014 | `store_id` | C | ID | `pet_advisor` 等需要 Store 资格时的上下文；不代表个人额度按门店累计。 |

---

## 19. 首页底部 Banner 广告（HOME_AD）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-HAD-001 | `placement` | C | Enum | 固定 `home_bottom_banner`。这是曝光广告，不发 Reward Entitlement。 |
| F-HAD-002 | `enabled` | C | Bool | 平台是否启用该广告位。 |
| F-HAD-003 | `ad_unit_id` | C | Text | 微信正式 Banner 广告单元配置；敏感配置不散落页面。 |
| F-HAD-004 | `environment` | C | Enum | development / test / production。 |
| F-HAD-005 | `load_status` | C | Enum | disabled / loading / loaded / no_fill / failed。 |
| F-HAD-006 | `last_error` | C | Text | 开发 / 日志侧错误，不直接暴露技术细节给普通客户。 |

---

## 20. 启动封面广告（LAUNCH_AD）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-LAD-001 | `placement` | C | Enum | 固定 `launch_cover_ad`。不授予积分、AI或顾问权益。 |
| F-LAD-002 | `enabled` | C | Bool | 启用 / 停用。 |
| F-LAD-003 | `mode` | C | Enum | `custom_image / custom_video / wechat_ad`。 |
| F-LAD-004 | `image_asset` | C | Ref | 自定义图片素材。 |
| F-LAD-005 | `video_asset` | C | Ref | 自定义视频素材。 |
| F-LAD-006 | `wechat_ad_unit_id` | C | Text | 微信官方广告模式的广告单元。 |
| F-LAD-007 | `click_target` | C | Text/Struct | 自定义素材可选点击目标。不得改写原业务返回路径。 |
| F-LAD-008 | `starts_at` | C | Datetime | 投放开始时间。 |
| F-LAD-009 | `ends_at` | C | Datetime | 投放结束时间。 |
| F-LAD-010 | `frequency_mode` | C | Enum | every_launch / once_per_day / interval / disabled。 |
| F-LAD-011 | `frequency_interval` | C | Number | interval 模式的间隔；具体运营值受 DEC-LAUNCH-01。 |
| F-LAD-012 | `skip_enabled` | C | Bool | 是否允许跳过 / 关闭。 |
| F-LAD-013 | `skip_after_seconds` | C | Number | 如适用；具体默认值/范围受 DEC-LAUNCH-01，不能自行写死。 |
| F-LAD-014 | `max_display_seconds` | C | Number | 最大展示时长；具体值受 DEC-LAUNCH-01。 |
| F-LAD-015 | `max_load_wait_seconds` | C | Number | 配置读取、主素材和一次 fallback 共用总等待上限；不得 fallback 时重新计时。具体值受 DEC-LAUNCH-01。 |
| F-LAD-016 | `environment` | C | Enum | development / test / production。 |
| F-LAD-017 | `fallback_behavior` | C | Struct/Enum | 最多一次有效 fallback 规则。 |
| F-LAD-018 | `launch_ad_load_status` | S | Enum | disabled / loading / loaded / no_fill / failed / expired。 |
| F-LAD-019 | `saved_entry_target_type` | S | Enum | 广告前保存的原外部 / 后台目标类型。 |
| F-LAD-020 | `saved_entry_target_id` | S | ID/Text | 原目标业务标识。 |
| F-LAD-021 | `saved_entry_store_id` | S | ID | 原目标门店上下文；广告结束不得被历史店覆盖。 |
| F-LAD-022 | `fallback_attempted` | S | Bool | 本次启动流程是否已尝试一次 fallback，防止循环兜底。 |
| F-LAD-023 | `business_restored_at` | S | Datetime | 已恢复正式业务页面的时间；之后迟到广告回调不得重新覆盖页面。 |

---

## 21. 历史订单导入（IMPORT）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-IMP-001 | `import_batch_id` | S | ID | 一次历史数据导入批次。 |
| F-IMP-002 | `source_system_name` | C | Text | 来源平台名称。 |
| F-IMP-003 | `original_filename` | C | Text | 原文件名。 |
| F-IMP-004 | `imported_by_id` | C | ID | 导入人。 |
| F-IMP-005 | `imported_at` | C | Datetime | 导入时间。 |
| F-IMP-006 | `success_count` | C | Int | 成功条数。 |
| F-IMP-007 | `failure_count` | C | Int | 失败条数。 |
| F-IMP-008 | `duplicate_count` | C | Int | 重复条数。 |
| F-IMP-009 | `import_error_reason` | C | Text/Struct | 失败原因。 |
| F-IMP-010 | `legacy_order_number` | C | Text | 历史订单号，最低必需字段。 |
| F-IMP-011 | `legacy_consumed_at` | C | Datetime | 历史消费时间。 |
| F-IMP-012 | `legacy_customer_mobile` | C | Text | 历史客户手机号。不得未经验证直接暴露线上资产。 |
| F-IMP-013 | `legacy_consumed_amount` | C | Money | 历史消费金额。 |
| F-IMP-014 | `legacy_customer_name` | C | Text | 可选客户姓名 / 昵称。 |
| F-IMP-015 | `legacy_pet_name` | C | Text | 可选宠物名称。 |
| F-IMP-016 | `legacy_service_items` | C | Text/Struct | 可选服务项目。 |
| F-IMP-017 | `legacy_product_items` | C | Text/Struct | 可选商品信息。 |
| F-IMP-018 | `legacy_payment_method` | C | Text | 可选原支付方式。 |
| F-IMP-019 | `legacy_note` | C | Text | 可选备注。 |
| F-IMP-020 | `record_origin` | S | Enum | `native / imported`，用于区分本系统原生记录和历史导入；导入记录默认不影响当前库存/当期营业额/余额。 |

---

## 22. 审计与不可变更历史（AUDIT）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-AUD-001 | `audit_log_id` | S | ID | 单条审计记录。 |
| F-AUD-002 | `actor_type` | S | Enum | platform_admin / merchant_owner / staff / customer / system 等操作者类型。 |
| F-AUD-003 | `actor_id` | S | ID | 操作者稳定标识。 |
| F-AUD-004 | `action_key` | S | Text | 本次动作，例如调价、绑定、收款确认、核销、跨店服务履约记录查询等。 |
| F-AUD-005 | `object_type` | S | Text/Enum | 被操作业务对象类型。 |
| F-AUD-006 | `object_id` | S | ID | 被操作对象标识。 |
| F-AUD-007 | `old_state` | C | Struct/Text | 原状态 / 原关系 / 原值快照（按业务需要）。 |
| F-AUD-008 | `new_state` | C | Struct/Text | 新状态 / 新关系 / 新值快照。 |
| F-AUD-009 | `audit_reason` | C | Text | 人工高风险操作、换绑、调价、调整等原因。 |
| F-AUD-010 | `audit_created_at` | S | Datetime | 审计事件时间。 |
| F-AUD-011 | `related_request_id` | S | Text/ID | 对应幂等请求／操作请求，便于重复动作追踪。跨店查询还必须通过object_type／object_id关联新增顾客或预约等真实业务对象。 |

余额、积分、订单、库存、员工离职、Customer 换绑、调价、收款、退款 / 冲正、寄养执行、兑换核销等历史不得通过普通更新无痕覆盖。

F-AUD系统操作日志只允许本店Merchant Owner和Platform Super Admin按职责查看；Staff即使是actor_id也不能据此读取完整审计。员工可见的工作记录从原业务事实生成最小视图，不能将F-AUD原始内容或审计附件混入工作记录、业务详情、导出接口。03h§6.2未公开处理材料另受作者／平台可见边界约束，老板的日志查看资格不授予他人原件；日志操作事实可按原权限提供，私有正文／附件不混入无权角色的快照或下载结果。

---

## 23. 高风险字段禁止混用表

| 禁止写法 / 旧写法 | 统一使用 | 原因 |
|---|---|---|
| `user_id`（无上下文） | `platform_user_id` | User 是平台身份；避免与 Customer / Staff 混淆。03m 旧 `user_id` 以后按此映射。 |
| `member_id` | 视语义使用 `customer_id` / `wallet_account_id` | “会员”可能指商户客户或钱包账户，禁止模糊。 |
| `tenant_id` | `merchant_id` | 当前项目正式产品术语为 Merchant。 |
| `shop_id` / `branch_id` | `store_id` | 当前正式门店实体统一 Store。 |
| 单一 `merchant_store_id` | 分别 `merchant_id` + `store_id` | 即使 V1 一商户一门店也保持不同业务含义。 |
| `balance` | `available_balance / principal_balance / bonus_balance` | 防止本金、赠送与总余额混写。 |
| `points` | `points_balance / points_delta / awarded_points / points_cost` | 平台积分的余额、变动、签到奖励、兑换成本含义不同。 |
| `amount` | 使用具体金额字段 | 原始应收、最终应收、实付、退款、调价不能混为一个值。 |
| `status`（跨域 API） | 使用业务前缀状态字段 | `order_status / payment_status / home_feeding_status / fulfillment_status` 含义完全不同。 |
| `pay_status` | `payment_status` | 与订单业务状态分离。 |
| `feed_status` | 上门喂养使用`home_feeding_status`；寄养照护使用原事件字段 | 商品加餐无独立执行状态，不映射到退役F-BOARD-015。 |
| `order_source` | `source_channel` | 来源渠道全局统一。 |
| `boarding_feed` 作为渠道 | `business_scenario = boarding_feed` | 业务场景不得覆盖渠道 `mini_program`。 |
| `ad_status` | `reward_status / load_status / launch_ad_load_status` | 激励权益、首页曝光广告、启动广告状态机不同。 |
| `ad_type` | `placement` + 对应模块的 `mode` | placement 表示业务广告位；launch `mode` 表示图片/视频/微信来源。 |
| `owner_store_id`（顾问权益） | `owner_type=store` + `owner_id=store_id` | Feature Entitlement 使用通用 owner 结构，Merchant 只作购买关联。 |
| 仅凭 `pet_id` 直接返回完整 Pet | 按业务最小视图返回 | `pet_id` 只是对象标识；投诉、宠物安全档案或其他模块均不得据此读取完整 PetProfile。 |
| `occurred_at = recorded_at` | 分别保存 | 寄养补录必须按真实发生时间排序。 |
| `paid = fed` | 商品交易用`payment_status`，真实喂食另记寄养照护 | 收款不自动生成照护，不再映射退役的加餐执行状态。 |
| `canceled = points_refunded` | `fulfillment_status` + `points_processing_status` | 积分兑换取消不等于积分补偿已到账。 |

---

## 24. 固定枚举 / 常量注册

### 24.1 广告 placement

- `ai_report`
- `daily_checkin`
- `pet_advisor`
- `home_bottom_banner`
- `launch_cover_ad`

前三项属于激励广告权益；后两项属于曝光/启动广告，不得自动发 Reward Entitlement。

### 24.2 商品来源渠道 `source_channel`

当前统一：

`mini_program / wechat / meituan / douyin / phone / walk_in / other`

### 24.3 客户端底部导航

固定产品标识：

- `customer_nav.appointment` → 预约
- `customer_nav.home` → 首页
- `customer_nav.me` → 我的

### 24.4 店员端底部导航

当前已确认：

- `staff_nav.workbench` → 工作台
- `staff_nav.business` → 业务
- `staff_nav.wash_groom` → 洗美
- `staff_nav.customers` → 客户
- `staff_nav.me` → 我的

### 24.5 投诉平台结论

`established / partially_established / insufficient_evidence / not_supported`

投诉是否解决使用独立 `complaint_resolution_status`，不得把 resolved 当作事实结论。

### 24.6 启动广告模式

`custom_image / custom_video / wechat_ad`

### 24.7 首页 Banner 加载状态

`disabled / loading / loaded / no_fill / failed`

### 24.8 启动广告加载状态

`disabled / loading / loaded / no_fill / failed / expired`

### 24.9 跨店顾客风险查询额度

- 计数键：`query_viewing_store_id + query_identity_fingerprint + query_month_key`；
- 时区：`Asia/Shanghai`；
- 上限：每个自然月3次；
- 手机号与稳定微信身份唯一指向同一Platform User时使用同一主体指纹，不得换标识重置；
- 成功、无匹配、身份冲突计数；相同`related_request_id`网络重试不重复计数；
- 店内员工共享额度，换员工、重复建空Customer或更换入口不得重置。

### 24.10 客户预约修改截止

- 固定提前量：预约开始前6小时；
- 等于或晚于截止时间禁止客户修改／接受改期；
- 已确认预约按当前有效开始时间与建议新开始时间中的较早者计算，未确认申请按当前申请时间与建议新时间中的较早者计算；
- 使用服务端时间与`Asia/Shanghai`业务时区复核；本常量不自动限制服务开始前取消。

### 24.11 跨店服务履约记录保存期限

- 跨店展示：`P12M`，从`risk_event_cross_store_visible_from`起算；等于或晚于`risk_event_cross_store_visible_until`时不得返回门店；
- 证据／审核：从`risk_event_cross_store_stopped_at`与最后一轮申诉办结中的较晚时间起`P3Y`；
- 已结束的门店授权／顾客同意：从撤回、替换或失效时间起`P3Y`；有效记录不提前删除；
- 查询审计：每次查询发生时间起`P3Y`；身份冲突：办结时间起`P3Y`；每轮申诉：本轮办结时间起`P3Y`；
- `P12M`与`P3Y`按`Asia/Shanghai`日历月／日历年计算，不按固定天数近似；
- 申诉不暂停或重置12个月跨店展示期；授权撤回、平台撤销共享结论可使展示更早终止；
- 到期后删除或不可逆匿名化非必需数据并写入F-CRISK-044～048；独立规则要求继续保留的记录保持受限且不得恢复门店可见性。

---

### 24.12 普通员工“我的”菜单标识

以下稳定产品标识按04§3.0.3的固定顺序使用，仅标识入口，不是权限码：

| 产品标识 | 菜单名称 |
|---|---|
| `staff_me.employee_store_info` | 员工与门店信息 |
| `staff_me.work_records` | 我的工作记录 |
| `staff_me.performance` | 我的业绩 |
| `staff_me.notification_settings` | 通知设置 |
| `staff_me.account_security` | 账号与安全 |
| `staff_me.help_feedback` | 帮助与反馈 |
| `staff_me.logout` | 退出登录 |

老板专属入口另使用`staff_me.owner_management` → 老板管理，所属页面为`staff_nav.me`，仅当前商户有效Merchant Owner可见并进入；04§3.0.4为业务依据。该产品标识不是权限码，不改变七项公共菜单的顺序。

`staff_me.performance_commission`永久退役且不得复用；旧入口仅可恢复到现行业绩入口`staff_me.performance`，任何角色均不得据旧标识重新获得提成功能。提成功能已取消，不新增其配置、计算、结算、明细、报表、导出字段或API；历史档案保留不代表批准该业务。`staff_me.work_records`沿用原标识，可查看本店其他员工的工作事实，不能按该标识返回系统操作日志。

老板管理已确认的产品标识如下；仅标识菜单／动作，不是新增权限码：

| 产品标识 | 名称与归属 |
|---|---|
| `staff_owner.employee_management` | 老板管理／员工管理 |
| `staff_owner.store_profile` | 老板管理／门店资料，四项内容及审核生效按04§3.0.6；与其他老板管理菜单的排序未定 |
| `staff_owner.business_settings` | 老板管理／营业与预约设置，仅两项，见04§3.0.7；与其他老板管理菜单的排序未定 |
| `staff_owner.business_hours` | 营业与预约设置／营业时间，组内第一项，仅本店老板修改 |
| `staff_owner.temporary_closure` | 营业与预约设置／临时关闭，组内第二项，仅本店老板修改；不是平台停用门店 |
| `staff_owner.business_statistics` | 老板管理／经营统计，04§3.0.10五项及员工业绩查看方向已确认；仅本店老板进入，本店员工用原staff_me.performance看本人，与其他老板菜单排序未定 |
| `staff_owner.service_item_management` | 老板管理／服务项目管理，入口及操作边界按04§3.0.8；与其他老板菜单的排序未定 |
| `staff_product.management` | 业务／商品处理／商品管理，老板／有效员工，商品管理六项已确认 |
| `staff_product.create` | 新增本店商品／SKU，名称分类售价初始库存必填，图片条码成本介绍选填 |
| `staff_product.edit` | 维护本店商品／SKU，售价只影响后续开单，旧单不回写 |
| `staff_product.adjust_inventory` | 商品管理／库存管理，手工补货／盘点或入库错误修改当前正确目标量，前后值及人时间留痕，预占保持、原入库不改写 |
| `staff_product.publish` | 本店商品上架／下架后恢复上架，沿原商品SKU，不复制库存；校验当前资格对象，非删除恢复 |
| `staff_product.unpublish` | 本店商品下架，新购买停止，历史订单及库存记录保留 |
| `staff_product.category_management` | 商品管理／商品分类，本店老板及有效员工维护本店商品分类 |
| `staff_product.create_category` | 新增本店自定义商品分类，不冒充服务大类或食品主资料 |
| `staff_product.rename_category` | 修改自定义分类名称，系统其他兜底分类名称固定 |
| `staff_product.reorder_categories` | 调整本店分类展示顺序，沿原分类标识 |
| `staff_product.delete_category` | 删除分类并将全部商品含下架自动转本店其他，一致防重留痕；其他不可删 |
| `staff_product.delete_unused_product` | 仅无业务引用／无库存变动、全部SKU总量预占均0商品可删，留操作记录、不复用ID |
| `staff_product.manual_intake` | 商品管理／商品入库，手工选SKU／填入库量及可选进货价，不要求拍图或AI |
| `staff_product.confirm_manual_intake` | 手工来源确认，复用同一入库／SKU库存及防重，不以数量覆盖总库存 |
| `staff_product.photo_intake` | 商品管理／AI拍照入库，老板／有效员工，当前无会员前置；保留原产品ID，不改造其他功能 |
| `staff_product.recognize_purchase_document` | AI识别只填回原入库表单，无独立核对页，当前不校验会员，未点一键入库不加库存 |
| `staff_product.select_purchase_document_images` | AI拍照入库现拍／相册及多张照片选择，归同一原入库表单，不自动改库 |
| `staff_product.view_duplicate_intake` | 同一照片命中本店已入库原记录后查看，仍逐次鉴权，提醒允许新单继续但原单不重入 |
| `staff_product.confirm_photo_intake` | AI来源在原表单点击一键入库，当前无会员验证；同一单及新商品只入一次，后期会员验证再统一接入 |
| `staff_product.intake_records` | 商品管理／入库记录，两方式统一查本店posted业务记录，老板／有效员工，不限本人经办 |
| `staff_product.query_intake_records` | 默认成功入库日期最近15自然日，按日期／方式筛选及商品名称／条码查询，成功时间倒序 |
| `staff_product.intake_record_detail` | 本店已入库原明细只读、当次前后总库存／进货价未知不补0及有权原图；入库错误去库存管理调整，原单不作废 |
| `staff_owner.invite_code_creation` | 老板管理／创建邀请码页面，仅本店有效老板，内部菜单排序未定 |
| `staff_owner.create_invite_code` | 创建提交，单内容／数量固定1／系统生成，不支持手工指定、启停或修改 |
| `staff_owner.invite_code_result` | 本次成功创建结果页，码／内容／真实兑换截止及领取后一个月有效提示 |
| `staff_owner.copy_invite_code` | 本次结果页复制系统生成码，不消耗兑换资格或改变期限 |
| `staff_owner.share_invite_code` | 老板本次创建结果页分享，不授予员工创建或绕过顾客兑换校验；下列员工通用读取分发ID已退役，老板仍沿原结果页能力 |
| `staff_invite_code.view` | RETIRED：员工通用邀请码列表／详情读取分发方案已取消，老板经微信发码；仅保留标识防止复用，不再实施或改作历史查询 |
| `staff_invite_code.copy` | RETIRED：员工小程序既有码复制入口随读取方案取消，微信接收转发不需要此能力；老板创建结果页复制仍用staff_owner.copy_invite_code |
| `staff_invite_code.share` | RETIRED：员工小程序既有码分享入口随读取方案取消；老板创建结果页分享及微信自行转发保留，不把此标识改作新能力 |
| `staff_owner.coupon_management` | 老板管理／优惠券管理，04§3.0.15五项已确认，仅本店老板维护模板，与其他老板菜单排序未定 |
| `staff_owner.create_coupon_template` | 优惠券管理／新增模板，默认启用，仅本店老板 |
| `staff_owner.edit_coupon_template` | 优惠券管理／修改模板，仅影响以后发券，已发实例不回写 |
| `staff_owner.disable_coupon_template` | 优惠券管理／停用模板，阻止新发、已有实例按原条件使用 |
| `staff_owner.restore_coupon_template` | 优惠券管理／恢复模板，沿原ID及历史，不复活已用／过期券 |
| `staff_owner.create_service_item` | 服务项目管理内／新增服务项目，仅本店老板；三类服务四项表单及校验已确认，商品分支只关联已有SKU |
| `staff_owner.edit_service_item` | 服务项目管理内／修改项目，仅本店老板，不回写历史业务事实 |
| `staff_owner.disable_service_item` | 服务项目管理内／停用项目，仅本店老板，不物理删除或自动取消旧预约 |
| `staff_owner.restore_service_item` | 服务项目管理内／恢复已停用服务项目，仅本店老板，沿用原service_item_id和历史 |
| `staff_owner.employee_list` | 员工管理／员工列表 |
| `staff_owner.invite_employee` | 员工管理／邀请员工 |
| `staff_owner.disable_employee` | 员工列表内／停用员工 |
| `staff_owner.remove_employee` | 员工列表内／删除员工，逻辑移出本店名单 |
| `staff_owner.restore_employee` | 员工列表内／恢复员工，适用于被停用记录 |

系统日志的门店入口归老板管理，平台入口归平台管理；具体菜单名称及排序尚待确认，不先注册候选菜单标识。老板经营统计五项、员工本人核对及老板汇总方向按04§3.0.10已确认，订单唯一归属／默认改选／客户端商品确认必选与员工金额及原归属退款按该节已定；结算后独立归属更正／员工只转本人／老板本店全部／原因必填及实际收款重归属已定，失效员工订单保留归属及后续实款／有效人员可接续业务／老板可更正和历史目标例外已定，历史缺归属回填等剩余细则和其他未列老板管理菜单仍待确认；返聘流程已确认，复用新邀请、原员工及本轮门店关系，不另建“返聘人员”角色或重复staff_id。

独立赠券入口固定产品标识为`staff_customer.gift_coupon`，归“顾客详情 → 会员资产 → 赠送优惠券”，老板及本店有效员工按04§3.0.15办理、原因必填无审批，不要求充值；这是产品入口标识，不新增逐员工权限配置或老板模板管理资格。

原`staff_customer.delete_gift_coupon`保留原赠券减量／删除语义，不改永久标识含义；其原会员资产路径可打开同一顾客券数据。所有优惠券／活动券通用入口及动作新增以下产品标识（不是后台权限码）：

| product_id | 当前唯一用途 |
|---|---|
| `staff_customer.coupon_activity_vouchers` | 顾客详情／优惠券或活动券，老板／有效员工直接操作本店顾客持有券 |
| `staff_customer.redeem_coupon_or_activity_voucher` | 具体券／手动核销，不要求先开单或选订单 |
| `staff_customer.delete_coupon_or_activity_voucher` | 具体未核销持有券／删除，原实例与操作历史保留，不删除模板或已核销事实 |
| `staff_customer.return_coupon_or_activity_voucher` | 仅实际整单取消／全额退款业务中的手动退回券，不提供日常撤销核销，原截止不变，部分退款不退回 |

普通券退回人／时间及原核销／取消或全额退款事实沿原F-AUD对象／事件／前后值记录，原实例及期限保留；具体跨业务关联技术映射、活动券实例与操作结果字段须先注册，不能把D锁定字段转义为核销／退回关联。原始系统审计读取权限不因顾客券业务操作记录可读而扩大。



门店资料的四个内容字段、修改审核生效、单份待审、撤回后修改重提、撤回／批准竞态、从上次审核通过并生效起满168小时才允许再次提交、图片上传规则及营业执照不向顾客公开已确认，见§3.2。平台审核页细节仍受DEC-STAFF-01约束；不能把本表字段存在视为这些细节已确认。

## 25. Pending 字段处理规则

以下字段族当前不得被“字段注册表存在”误认为需求已确认：

- `F-PET-049`～`050`：宠物行为安全档案跨店共享与审核，受 `DEC-PETSAFETY-01` 阻塞；
- `F-EVD-011`：第三方证据权重模型，受 `DEC-EVIDENCE-01` 阻塞；
- `F-RISK-007`：不同门店来源具体加权系数尚未冻结；3条独立投诉硬门槛不受该字段影响；
- `F-RISK-018`：问题热度具体数值范围 / 公式受 `DEC-FOOD-HEAT-01` 阻塞；
- `F-REV-016`～`017`：跨店审核结果可见范围 / 有效期按对应风险业务 DEC 确认；
- `F-CRISK-001`～`007`：跨门店顾客客观风险事件的完整提交／审核与自动业务影响受 `DEC-RISK-01` 阻塞；`F-CRISK-008`～`050`只落实已确认的申诉、查询额度、授权撤回、身份冲突、保存期限和到期处置，不代表事件提交权限或其他自动业务影响已确认；新老顾客的新增／预约阅读和查询不可用继续按04§3.7／6.5.1，不开放共享取数；
- `F-FEED-022`／`024`／`025`／`028`／`029`／`032`已退役；F-FEED-026／027及033～035为已确认范围。上门喂养仅DEC-FEED-02的地理技术／异常界面剩余，不从D字段恢复旧操作；
- `F-RWD-027`～`028`：积分自提期限 / 改领取门店，受 `DEC-POINTS-02` 阻塞；
- 启动广告具体秒数默认值/范围受 `DEC-LAUNCH-01` 阻塞；字段存在但不能写死运营常数；
- 工作台其他细节／二级菜单、其余混合业务、部分退款分配、账本更正／冲正、护理其他未列取消／更正消息／挂单等剩余细节、寄养§5.3剩余流程及待办流转等未决字段仍受DEC-STAFF-01～08约束。统一资格／记录可见性／取消提成／返聘、项目生命周期／旧预约例外、洗美两批、护理12项及寄养入住／基础照护16项及§5.2过夜计费／实际离店结算、全部消费不限幅调价／明确免单／最多两种支付及线下交易账本已定；消费退款无需老板审批，消费先扣本金再扣赠送，退款按原付款渠道／原账户退回，确认后自动联动资产／适用库存。外部支付通道及其失败恢复不在V1范围，不恢复退役审批字段或据此解锁其他流程。

Pending 字段确认后：

1. 回原业务文档确认规则；
2. 将本表对应字段状态从 `P` 改为 `C` 或 `S`；
3. 不改变原注册号；
4. 记录变更历史。

---

## 26. API / 前后端使用要求

1. 新 API、DTO、事件、缓存 Key、日志结构涉及本文字段时，优先使用本文统一逻辑字段名。
2. 不得为了页面方便把完整数据库实体直接返回客户端；按页面/权限构造最小数据视图。
3. 同一字段不得因客户端 / 店员端 / Web 不同而重新起名；端侧展示名可以不同，逻辑字段名保持一致。
4. 列表摘要与详情如果表达同一业务事实，使用同一字段或明确派生字段，不建立第二份事实数据。
5. 枚举状态需由服务端给出权威结果，前端不能自行推导财务、权限或执行成功。
6. ID 只能作为定位业务对象的标识，不自动构成读取该对象全部字段的权限。
7. 金额、余额、积分、库存、优惠券、广告权益等关键变化必须通过账本/流水/审计事实表达，不允许直接覆盖历史。
8. 如果现有代码或旧文档使用别名，迁移时应在适配层映射到本文字段，禁止在新代码继续扩大别名。

---

## 27. 新增字段流程

以后新增任何正式业务字段，按以下顺序：

1. 先确认它属于哪个业务域；
2. 检查本注册表是否已经存在同义字段；
3. 如果存在，必须复用原注册号和逻辑字段名；
4. 如果不存在，分配该域下一个未使用注册号；
5. 写明中文含义、类型、归属、可见范围和权威写入方；
6. 如果业务规则尚待确认，状态只能标 `P`；
7. 同步受影响的正式需求文档；
8. 需求变更留历史；
9. 再进入 API / 数据库 / 前端实现。

禁止由开发或 AI 因为“当前接口缺字段”直接临时增加 `xxx2`、`new_xxx`、`temp_xxx`、`extra_data` 等长期字段。

---

## 28. 当前覆盖来源

本 V1.0 注册表基于当前 `main` 的正式需求：

- `01-project-positioning.md`
- `02-roles-and-accounts.md`
- `03-customer-miniapp.md`
- `03a`～`03m`、`03o`～`03p`
- `04-staff-miniapp.md` 当前已确认§3.0、§3.2、§6.1、§6.5与来自01/02/03的已确认跨端约束

`03n` 已归档，不作为字段来源。UI 颜色、字号、间距等 Design Token 不属于本业务字段注册表。

---

## 29. 变更记录

### 2026-09-15：建立 V1.0 字段唯一注册表

- 建立永久注册号 `F-<DOMAIN>-<NNN>`。
- 固定全项目逻辑字段命名规则。
- 收口 User / Customer、Merchant / Store、订单 / 付款 / 执行状态、钱包 / 积分、广告类型等高风险混用。
- 将当前确认业务字段纳入统一查询表。
- 对仍被 DEC 阻塞的字段仅保留 `P` 注册号，不提前确认业务规则。
- 明确阶段 09 可设计物理数据库，但不得无记录改变本文逻辑字段含义。


### 2026-09-21：宠物交友退役并建立投诉 / 风险字段族

- 原 F-SOC 字段保留永久注册号但退役，禁止新业务复用。
- 新增 F-CMP / F-EVD / F-RISK / F-REV / F-CRISK 字段族。
- 新增 F-PET-043～050 宠物行为与服务安全档案字段。
- 固定 7 天回应、3 天补证、单审核员裁决、2天/3条集中反馈和2个月风险提示所需逻辑字段。
- 未确认的跨店共享可见性、证据权重和来源加权系数继续标 P。


### 2026-09-21：新增宠物当前食品品牌、品牌风险提醒与问题热度

- 新增 F-PET-051～056：每只宠物当前食用标准品牌 / “其他”自定义品牌、归一状态和更新时间。
- 食品风险订阅以标准 brand_id 匹配；未归一自定义品牌不得进行不可靠模糊推送。
- 新增 F-RISK-018～020：服务端问题热度展示；正式热度公式继续由 DEC-FOOD-HEAT-01 阻塞。
- 同一 User + complaint_id 的通知去重由消息 / 业务幂等规则执行。
