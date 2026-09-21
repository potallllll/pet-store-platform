# 全项目字段唯一注册表（Field Registry）

> status: mixed
> confirmed_scope: registry_rules_and_entries_marked_C_or_S
> pending_scope: entries_marked_P
> change_policy: record_required
> development_readiness: partial
> version: V1.0
> registry_owner: project_requirements
> canonical_logical_field_source: true

## 1. 文档目的

本文件用于固定全项目业务字段的**唯一注册号、统一逻辑字段名和业务含义**，供需求、前端、后端、API、Codex / AI、测试、数据迁移和后续数据库设计统一查询。

它解决以下问题：

- 同一含义被不同模块写成 `user_id / uid / member_user_id`；
- `Merchant / Store`、`User / Customer` 被混为一个字段；
- `订单状态 / 付款状态 / 投喂执行状态` 被一个 `status` 覆盖；
- `平台积分 / 商户余额`、`曝光广告 / 激励广告权益` 被错误共用字段；
- 前端直接读取完整 Pet / Customer 实体，导致越权或字段泄露；
- 后续 AI / 新人临时创造新字段，造成接口与数据调取漂移。

本文件冻结的是**逻辑字段标识**。阶段 09 数据库设计可决定物理表、索引、存储类型和必要拆表，但默认应沿用这里的逻辑字段名；如果物理列名不同，必须建立显式映射，不得重新定义字段含义。

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
- 状态必须带业务前缀，例如 `order_status`、`payment_status`、`boarding_feed_execution_status`，禁止跨域只写一个含义不明的 `status`。
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
| F-CORE-004 | `customer_id` | C | ID | 某 Platform User 与某 Merchant 的客户关系标识。余额、优惠券、门店订单等归属该关系。 |
| F-CORE-005 | `staff_id` | C | ID | 店员业务身份标识；员工停用不删除，历史记录继续稳定引用。 |
| F-CORE-006 | `merchant_owner_user_id` | S | ID | 商户老板所对应的平台/经营账号稳定引用；不新增“店长”角色。 |
| F-CORE-007 | `role_key` | S | Enum | 经营角色固定语义：`platform_super_admin / merchant_owner / staff`。Customer/User 不计入这三个经营角色。 |
| F-CORE-008 | `permission_key` | S | Text | 细粒度权限标识。例：`reward_fulfillment.manage`；具体完整权限矩阵阶段 08 冻结。 |
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
- 同一 Platform User 在不同 Merchant 下拥有不同 Customer 关系。
- 商户钱包、优惠券、订单、内部备注按 Merchant/Customer 隔离；平台积分、平台个人消息、养宠顾问个人额度归 Platform User。
- 任何“当前门店”都用 `store_id`；任何“租户归属”都用 `merchant_id`。

---

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
| F-AUTH-016 | `reduce_motion_enabled` | C | Bool | “减少动态效果”用户设置，影响交友自动轮播和非必要位移动画。 |
| F-AUTH-017 | `account_status` | S | Enum | User 账号当前状态；注销与退出会话分开。 |
| F-AUTH-018 | `session_status` | S | Enum | 当前登录 Session 有效性；退出登录只结束 Session，不删除业务数据。 |

---

## 5. 店员归属、邀请与当前已确认导航（STAFF）

> `04-staff-miniapp.md` 当前只有 §3.0 导航与洗美/寄养归属已确认，其余店员流程字段仍为 pending。本节只冻结已有正式事实，不把讨论稿提前变成实现要求。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-STAFF-001 | `staff_merchant_id` | C | ID | Staff 唯一租户归属，值必须对应 `merchant_id`。一个 Staff 不能属于多个 Merchant。 |
| F-STAFF-002 | `staff_store_assignment_id` | C | ID | 店员可工作门店关系记录标识；V1 虽一店，也不能用单一 Merchant/Store 模糊字段代替。 |
| F-STAFF-003 | `staff_store_id` | C | ID | Staff 当前唯一可工作 Store。 |
| F-STAFF-004 | `staff_status` | S | Enum | 在职/停用等员工状态；停用不删除历史业务引用。 |
| F-STAFF-005 | `staff_invitation_id` | S | ID | 店员邀请记录。 |
| F-STAFF-006 | `staff_invitation_expires_at` | C | Datetime | 邀请失效时间。 |
| F-STAFF-007 | `staff_invitation_status` | C | Enum | 邀请有效 / 已使用 / 已撤销 / 已过期等状态。 |
| F-STAFF-008 | `staff_invitation_created_by` | C | ID | 创建邀请的老板/授权主体。 |
| F-STAFF-009 | `staff_invitation_used_by` | C | ID | 实际使用邀请加入的用户。 |
| F-STAFF-010 | `staff_invitation_used_at` | C | Datetime | 邀请使用时间。 |

当前已确认的店员端一级功能标识固定为：

- `staff_nav.workbench` → 工作台
- `staff_nav.business` → 业务；寄养主入口归此
- `staff_nav.wash_groom` → 洗美；洗护、美容主入口归此
- `staff_nav.customers` → 客户
- `staff_nav.me` → 我的

`DEC-STAFF-01`～`08` 未关闭前，不在本注册表冻结待办归属、收款审批、寄养位置、员工默认权限等讨论字段。

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
| F-APPT-007 | `service_category` | S | Enum | 洗护 / 美容 / 寄养大类。 |
| F-APPT-008 | `service_item_id` | S | ID | 商户配置的具体预约服务项目。 |
| F-APPT-009 | `requested_start_at` | S | Datetime | 客户选择的预约开始时间。只能来自门店开放时段。 |
| F-APPT-010 | `boarding_checkout_at` | S | Datetime | 寄养预约预计离店日期时间。仅寄养使用。 |
| F-APPT-011 | `reference_price` | C | Money | 预约页参考价，不代表最终结算金额。 |
| F-APPT-012 | `special_request` | C | Text | 本次寄养等场景的临时特殊要求。 |
| F-APPT-013 | `store_suggested_start_at` | S | Datetime | 门店提出的新时间；客户未接受前不得静默覆盖原时间。 |
| F-APPT-014 | `store_response_reason` | S | Text | 门店拒绝或建议调整时的原因。 |
| F-APPT-015 | `customer_time_response_at` | S | Datetime | 客户接受/拒绝门店建议时间的时间。 |
| F-APPT-016 | `appointment_cancel_reason` | S | Text | 预约取消原因。 |
| F-APPT-017 | `appointment_canceled_at` | S | Datetime | 预约取消时间。 |
| F-APPT-018 | `appointment_created_at` | S | Datetime | 预约申请创建时间。 |
| F-APPT-019 | `slot_capacity` | P | Int | DEC-APPT-01 容量模型待确认；确认前不得按 §11 提案实现为正式字段。 |
| F-APPT-020 | `slot_reserved_count` | P | Int | 同上；仅保留注册号，不作为当前正式接口字段。 |
| F-APPT-021 | `reschedule_proposal_id` | P | ID | 改期提议版本模型属于 DEC-APPT-01，确认前不冻结。 |

---

## 7. 宠物档案、护理、寄养资料与服务相册（PET）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PET-001 | `pet_id` | C | ID | 宠物稳定标识。只作为业务关联，不自动授予读取完整档案的权限。 |
| F-PET-002 | `pet_name` | C | Text | 宠物名称；首次建档必填。 |
| F-PET-003 | `pet_type` | C | Enum/Text | 猫 / 狗 / 其他；首次建档必填。 |
| F-PET-004 | `pet_avatar` | C | Ref | 宠物头像，选填。 |
| F-PET-005 | `pet_breed` | C | Text | 品种，选填；是否在其他业务公开必须由对应公开视图明确允许。 |
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
| F-PET-025 | `special_care` | C | Text | 特殊照护要求。 |
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
| F-PET-037 | `service_record_id` | C | ID | 照片所属真实服务记录。 |
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

---

## 8. 服务记录、洗护美容结果与寄养动态（SVC / BOARD）

### 8.1 服务与洗美结果

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-SVC-001 | `service_record_id` | S | ID | 一次真实洗护 / 美容 / 寄养服务记录标识。 |
| F-SVC-002 | `service_type` | C | Enum | 洗护 / 美容 / 寄养。 |
| F-SVC-003 | `service_customer_status` | C | Enum | 客户侧简化状态；洗美不得直接暴露全部店员内部步骤。 |
| F-SVC-004 | `service_internal_status` | S | Enum | 店员内部细状态容器；完整枚举待阶段 04/06 冻结。不得用客户端三态替代。 |
| F-SVC-005 | `service_started_at` | S | Datetime | 实际开始服务时间。 |
| F-SVC-006 | `service_completed_at` | S | Datetime | 实际完成服务时间。 |
| F-SVC-007 | `service_result_viewed_at` | S | Datetime | 客户真正查看本次结果时间；查看后完成卡可退出首页当前服务。 |
| F-SVC-008 | `service_summary` | C | Text/Struct | 本次服务摘要 / 结构化服务记录。 |
| F-SVC-009 | `service_staff_ids` | S | Ref[] | 实际服务员工稳定引用；员工离职不改写历史。 |
| F-SVC-010 | `service_duration` | C | Number | 服务时长语义；计算口径后续架构可细化。 |
| F-SVC-011 | `service_abnormal_notes` | C | Text | 服务中异常情况。 |
| F-SVC-012 | `ai_report_task_id` | S | ID | AI 洗护报告任务标识；服务完成本身不自动创建。 |
| F-SVC-013 | `ai_report_status` | S | Enum | 未创建 / 生成中 / 已完成 / 失败等真实任务状态。 |
| F-SVC-014 | `ai_report_entitlement_id` | S | ID | 对应 `ai_report` 激励广告获得的报告资格。 |
| F-SVC-015 | `ai_report_content` | S | Struct/Text | 已生成的护理 / 外观观察报告，不作为医疗诊断。 |

### 8.2 寄养与时间轴

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-BOARD-001 | `boarding_id` | C | ID | 一次有效寄养业务标识。 |
| F-BOARD-002 | `boarding_status` | C | Enum | 客户侧至少寄养中 / 已完成 / 已取消；内部可更细。 |
| F-BOARD-003 | `check_in_at` | C | Datetime | 实际/计划入住日期时间，具体上下文由记录类型决定。 |
| F-BOARD-004 | `expected_checkout_at` | S | Datetime | 预计离店时间。 |
| F-BOARD-005 | `actual_checkout_at` | S | Datetime | 实际离店时间。 |
| F-BOARD-006 | `boarding_day_index` | S | Int | 当前第几天的展示派生值。 |
| F-BOARD-007 | `boarding_event_id` | S | ID | 寄养时间轴单条动态。 |
| F-BOARD-008 | `boarding_event_type` | C | Enum | 喂食、饮水、排泄、遛宠、玩耍、休息、清洁、用药/特殊照护、媒体、加餐、异常、自定义等。 |
| F-BOARD-009 | `occurred_at` | C | Datetime | 真实发生时间；时间轴按此倒序。 |
| F-BOARD-010 | `recorded_at` | C | Datetime | 系统录入时间；补录时不得冒充真实发生时间。 |
| F-BOARD-011 | `boarding_event_content` | S | Text/Struct | 动态正文 / 结构化动作内容。 |
| F-BOARD-012 | `boarding_event_media_refs` | S | Ref[] | 与该动态同一时间点关联的图片 / 视频。 |
| F-BOARD-013 | `boarding_event_created_by_staff_id` | S | ID | 录入该动态的店员。 |
| F-BOARD-014 | `notify_customer` | C | Bool | 异常记录等是否通知客户；内部记录可由店员明确关闭。 |
| F-BOARD-015 | `boarding_feed_execution_status` | C | Enum | `pending / waiting_feed / fed / abnormal_pending / canceled` 对应语义；付款状态必须另记。 |
| F-BOARD-016 | `fed_at` | C | Datetime | 实际投喂发生时间。只在实际执行成功时写入。 |
| F-BOARD-017 | `fed_by_staff_id` | C | ID | 实际执行投喂并确认的店员。 |
| F-BOARD-018 | `feed_timeline_event_id` | S | ID | 投喂成功后唯一关联的寄养动态，重复确认不得产生第二条。 |

---

## 9. 钱包、余额流水、充值套餐（WALLET）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-WAL-001 | `wallet_account_id` | S | ID | 某 Merchant Customer 的商户钱包账户标识。平台积分不进入此账户。 |
| F-WAL-002 | `available_balance` | C | Money | 客户当前总可用余额；客户端资产卡主金额。 |
| F-WAL-003 | `principal_balance` | C | Money | 充值本金余额。 |
| F-WAL-004 | `bonus_balance` | C | Money | 赠送余额。 |
| F-WAL-005 | `available_coupon_count` | C | Int | 当前 Merchant 下可使用优惠券数量。 |
| F-WAL-006 | `balance_ledger_id` | S | ID | 单条不可删除的余额流水。 |
| F-WAL-007 | `balance_change_type` | C | Enum | 充值、赠送、消费、退款、人工增加、人工扣减、冲正、历史初始化等。 |
| F-WAL-008 | `balance_before` | C | Money | 变动前总余额。 |
| F-WAL-009 | `balance_delta` | C | Money | 本次总余额变化值。 |
| F-WAL-010 | `balance_after` | C | Money | 变动后总余额。 |
| F-WAL-011 | `principal_delta` | C | Money | 本次本金部分变化。 |
| F-WAL-012 | `bonus_delta` | C | Money | 本次赠送部分变化。 |
| F-WAL-013 | `related_business_type` | S | Enum/Text | 关联订单、充值单、退款等业务类型。 |
| F-WAL-014 | `related_business_id` | C | ID | 关联订单或充值单等真实业务。 |
| F-WAL-015 | `wallet_operator_staff_id` | C | ID | 人工/门店侧关键钱包操作员工。 |
| F-WAL-016 | `wallet_change_reason` | C | Text | 调整 / 冲正 / 退款等原因。 |
| F-WAL-017 | `wallet_note` | C | Text | 可选备注 / 凭证说明。 |
| F-WAL-018 | `recharge_package_id` | S | ID | 充值套餐标识。 |
| F-WAL-019 | `recharge_package_name` | C | Text | 套餐名称。 |
| F-WAL-020 | `recharge_paid_amount` | C | Money | 套餐实际收款金额。 |
| F-WAL-021 | `recharge_bonus_amount` | C | Money | 套餐赠送余额。 |
| F-WAL-022 | `recharge_total_credit` | C | Money | 实际到账总额。 |
| F-WAL-023 | `recharge_bonus_coupon_items` | C | Ref[]/Struct | 套餐自动赠送的优惠券及数量。 |
| F-WAL-024 | `recharge_package_enabled` | C | Bool | 套餐启用 / 停用。 |
| F-WAL-025 | `recharge_package_starts_at` | C | Datetime | 可选生效时间。 |
| F-WAL-026 | `recharge_package_expires_at` | C | Datetime | 可选失效时间。 |
| F-WAL-027 | `recharge_package_note` | C | Text | 套餐备注。 |

---

## 10. 优惠券与邀请码（COUPON / INVITE）

### 10.1 优惠券

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CPN-001 | `coupon_template_id` | S | ID | 商户优惠券模板。 |
| F-CPN-002 | `coupon_instance_id` | S | ID | 发放给具体 Customer 的正式优惠券实例。 |
| F-CPN-003 | `coupon_name` | C | Text | 券名称。 |
| F-CPN-004 | `coupon_type` | C | Enum | 满减 / 金额抵扣 / 折扣。 |
| F-CPN-005 | `discount_amount` | C | Money | 金额类优惠值。 |
| F-CPN-006 | `discount_rate` | C | Number | 折扣券比例。 |
| F-CPN-007 | `minimum_spend` | C | Money | 使用门槛（如适用）。 |
| F-CPN-008 | `max_discount_amount` | C | Money | 折扣券最高优惠金额（如适用）。 |
| F-CPN-009 | `applicable_scope` | C | Enum/Struct | 全部消费 / 洗护 / 美容 / 寄养 / 商品等。 |
| F-CPN-010 | `valid_from` | S | Datetime | 优惠券有效开始。 |
| F-CPN-011 | `valid_until` | C | Datetime | 优惠券有效截止。 |
| F-CPN-012 | `coupon_enabled` | C | Bool | 模板启用 / 停用。 |
| F-CPN-013 | `coupon_status` | S | Enum | 可用、已锁定、已使用、已过期等业务状态。 |
| F-CPN-014 | `coupon_source_type` | S | Enum | 充值赠送、人工赠送、邀请码兑换、平台积分兑换。 |
| F-CPN-015 | `points_redemption_id` | C | ID | 平台积分兑换发券时关联的兑换记录。 |
| F-CPN-016 | `coupon_locked_order_id` | S | ID | 收银选择后临时锁定的订单；未完成收款则恢复可用。 |
| F-CPN-017 | `coupon_redeemed_at` | S | Datetime | 确认订单收款后的正式核销时间。 |
| F-CPN-018 | `coupon_note` | C | Text | 可选备注。 |

### 10.2 邀请码

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-INV-001 | `invite_code_id` | S | ID | 邀请码记录标识。 |
| F-INV-002 | `invite_code` | C | Text | 客户输入的邀请码内容。必须属于当前 Merchant。 |
| F-INV-003 | `bound_coupon_items` | C | Ref[]/Struct | 绑定优惠券及数量。 |
| F-INV-004 | `invite_code_enabled` | C | Bool | 启用 / 停用。 |
| F-INV-005 | `invite_code_starts_at` | C | Datetime | 生效时间。 |
| F-INV-006 | `invite_code_expires_at` | C | Datetime | 失效时间。 |
| F-INV-007 | `max_redemptions_total` | C | Int | 总兑换次数上限（可选）。 |
| F-INV-008 | `max_redemptions_per_customer` | C | Int | 单 Customer 次数上限；默认同码同 Customer 一次。 |
| F-INV-009 | `redeemed_count` | C | Int | 已兑换次数。 |
| F-INV-010 | `invite_code_created_by` | C | ID | 创建人。 |
| F-INV-011 | `invite_code_created_at` | C | Datetime | 创建时间。 |
| F-INV-012 | `invite_code_note` | C | Text | 可选备注。 |

---

## 11. 商品、SKU、购物车与库存（PROD）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PROD-001 | `product_id` | S | ID | 商品 SPU / 商品主体标识。 |
| F-PROD-002 | `sku_id` | C | ID | 商品规格 SKU 标识；独立售价与库存。 |
| F-PROD-003 | `product_category_id` | S | ID | 商户自定义商品分类。 |
| F-PROD-004 | `product_name` | C | Text | 商品名称。 |
| F-PROD-005 | `product_image_refs` | C | Ref[] | 商品图片。 |
| F-PROD-006 | `sale_price` | C | Money | 当前 SKU 售价 / 参考售价。 |
| F-PROD-007 | `inventory_status` | C | Enum | 客户侧仅：有货 / 库存紧张 / 暂时无货；默认不暴露精确数量。 |
| F-PROD-008 | `available_inventory_qty` | S | Int | 后台真实可售库存数量；不默认返回普通客户端。 |
| F-PROD-009 | `reserved_inventory_qty` | S | Int | 已确认未收款订单的预占库存。 |
| F-PROD-010 | `product_description` | C | Text | 商品介绍。 |
| F-PROD-011 | `sku_spec_values` | S | Struct | 口味、容量、包装等规格值。 |
| F-PROD-012 | `boarding_feed_enabled` | C | Bool | SKU / 商品是否允许用于寄养加餐。 |
| F-PROD-013 | `ingredient_tags` | C | Struct/Text[] | 可选结构化食材标签。 |
| F-PROD-014 | `flavor_tags` | C | Struct/Text[] | 可选口味标签。 |
| F-PROD-015 | `allergen_tags` | C | Struct/Text[] | 可选过敏原标签；只基于明确数据匹配，不用 AI 猜测。 |
| F-PROD-016 | `barcode` | C | Text | 可选条码。 |
| F-PROD-017 | `cost_price` | C | Money | 可选成本价；客户端不应公开。 |
| F-PROD-018 | `brand_name` | C | Text | 可选品牌。 |
| F-PROD-019 | `is_recommended` | C | Bool | 可选推荐状态。 |
| F-PROD-020 | `product_enabled` | S | Bool | 商品是否可售 / 上架。 |
| F-PROD-021 | `cart_id` | S | ID | 当前 User + Merchant 的购物车标识。切店不得把 A 店购物车提交到 B 店。 |
| F-PROD-022 | `cart_item_id` | S | ID | 购物车明细。 |
| F-PROD-023 | `cart_quantity` | C | Int | SKU 数量。 |
| F-PROD-024 | `cart_note` | C | Text | 客户提交购买需求时可选备注。 |
| F-PROD-025 | `order_hold_expires_at` | S | Datetime | 商品订单确认后的库存保留截止；默认业务规则为 24 小时，可由商户配置允许值。 |

---

## 12. 订单、金额、付款与退款（ORDER / PAYMENT）

### 12.1 订单

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-ORD-001 | `order_id` | S | ID | 正式服务 / 商品订单标识。预约不使用该 ID。 |
| F-ORD-002 | `order_type` | S | Enum | 服务 / 商品；服务可进一步由 `service_type` 区分。 |
| F-ORD-003 | `order_status` | S | Enum | 订单业务状态。不得与 `payment_status`、`boarding_feed_execution_status` 共用。 |
| F-ORD-004 | `customer_visible_status` | C | Enum | 客户端聚合后的业务状态。 |
| F-ORD-005 | `order_item_id` | S | ID | 商品或服务订单明细。 |
| F-ORD-006 | `requested_quantity` | S | Int | 客户原始购买需求数量。 |
| F-ORD-007 | `confirmed_quantity` | S | Int | 门店确认后的实际数量；需保留原始需求，不无痕覆盖。 |
| F-ORD-008 | `item_original_unit_price` | S | Money | 明细原始单价。 |
| F-ORD-009 | `item_original_amount` | S | Money | 商品 / 服务明细原价合计。 |
| F-ORD-010 | `original_receivable_amount` | C | Money | 系统自动计算的原始应收。 |
| F-ORD-011 | `automatic_discount_amount` | C | Money | 自动优惠金额。 |
| F-ORD-012 | `coupon_discount_amount` | C | Money | 优惠券优惠金额。 |
| F-ORD-013 | `manual_adjustment_amount` | C | Money | 人工调价金额，可正可负；不能覆盖其他金额。 |
| F-ORD-014 | `final_receivable_amount` | C | Money | 调价/优惠后最终应收。 |
| F-ORD-015 | `paid_amount` | C | Money | 实际已收款金额。 |
| F-ORD-016 | `refund_amount` | C | Money | 已退款金额；不得通过改写原实付实现退款。 |
| F-ORD-017 | `payment_status` | S | Enum | 未收款 / 已收款 / 部分退款 / 已退款等财务结果语义。 |
| F-ORD-018 | `manual_adjustment_reason` | C | Text | 人工调价原因。 |
| F-ORD-019 | `manual_adjusted_by_staff_id` | C | ID | 调价操作人。 |
| F-ORD-020 | `manual_adjusted_at` | C | Datetime | 调价时间。 |
| F-ORD-021 | `manual_adjustment_note` | C | Text | 可选调价备注。 |
| F-ORD-022 | `order_confirmed_at` | S | Datetime | 门店确认商品/订单内容的时间。 |
| F-ORD-023 | `settled_at` | S | Datetime | 收款结算成立时间。 |
| F-ORD-024 | `order_canceled_at` | S | Datetime | 订单取消时间。 |
| F-ORD-025 | `order_cancel_reason` | S | Text | 人工 / 自动取消原因。 |
| F-ORD-026 | `auto_cancel_reason` | C | Text | 未付款超过保留时间等系统自动取消原因。 |
| F-ORD-027 | `source_channel` | C | Enum | 复用 F-CORE-011。订单来源分析不得另造 `order_source`。 |
| F-ORD-028 | `business_scenario` | C | Enum | 复用 F-CORE-012；寄养加餐固定 `boarding_feed`。 |
| F-ORD-029 | `boarding_id` | C | ID | 寄养加餐订单必须稳定关联当前寄养。 |
| F-ORD-030 | `pet_id` | C | ID | 服务 / 寄养加餐等与具体宠物的关联。 |
| F-ORD-031 | `original_request_snapshot` | S | Struct | 客户原始购买需求快照；门店改单不得无痕覆盖。 |

### 12.2 付款拆分

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-PAY-001 | `payment_record_id` | S | ID | 一次正式收款记录。 |
| F-PAY-002 | `payment_split_id` | S | ID | 组合支付中的单一支付拆分。 |
| F-PAY-003 | `payment_method` | C | Enum | 会员余额 / 微信 / 支付宝 / 现金 / 其他配置方式。 |
| F-PAY-004 | `payment_amount` | C | Money | 当前支付方式实际金额。 |
| F-PAY-005 | `payment_confirmed_by_staff_id` | S | ID | 确认实际收款的有权限店员。客户不能自行写此结果。 |
| F-PAY-006 | `payment_confirmed_at` | S | Datetime | 店员确认收款时间。 |
| F-PAY-007 | `refund_record_id` | S | ID | 退款记录标识。 |
| F-PAY-008 | `refund_reason` | S | Text | 退款原因。 |
| F-PAY-009 | `refunded_at` | S | Datetime | 退款结果成立时间。 |

---

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
| F-MSG-012 | `message_priority` | C | Enum | 重要 / 普通 / 低优先级。 |
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

F-SOC-001 ～ F-SOC-020 的永久注册号继续保留用于历史迁移，但状态统一视为 `D`。原字段不得用于新“消费避雷 / 投诉”业务，也不得重新解释为投诉字段。

旧字段族包括 social_enabled、social_nickname、pet_friend_invitation_id、invitation_status 等；完整旧定义见归档文件 `docs/history/03h-customer-pet-social.archived.md` 和 Git 历史。

### 14.2 投诉（COMPLAINT）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CMP-001 | `complaint_id` | S | ID | 单条门店 / 宠物食品投诉唯一标识。 |
| F-CMP-002 | `complaint_target_type` | C | Enum | `store / pet_food`。 |
| F-CMP-003 | `complainant_user_id` | S | ID | 投诉人 Platform User。 |
| F-CMP-004 | `target_store_id` | S | ID | 门店投诉对象；食品投诉可空。 |
| F-CMP-005 | `target_product_id` | S | ID | 食品商品主体；门店投诉可空。 |
| F-CMP-006 | `target_sku_id` | S | ID | 食品具体 SKU / 规格，可空。 |
| F-CMP-007 | `product_batch_code` | S | Text | 食品批次 / 生产批次标识，用户能提供时记录。 |
| F-CMP-008 | `complaint_text` | C | Text | 用户原始投诉正文；允许无附件提交。 |
| F-CMP-009 | `complaint_submitted_at` | S | Datetime | 正式提交时间。 |
| F-CMP-010 | `content_review_status` | S | Enum | pending / approved / rejected / needs_revision 等基础内容审核状态。 |
| F-CMP-011 | `complaint_published_at` | S | Datetime | 基础审核通过后公开时间。 |
| F-CMP-012 | `complaint_workflow_status` | S | Enum | 提交、等待回应、补证、待裁决等流程状态；不得替代平台结论。 |
| F-CMP-013 | `business_response_status` | S | Enum | pending / responded / overdue。 |
| F-CMP-014 | `response_due_at` | C | Datetime | 基础审核通过且完成有效通知后计算的 7 天正式回应截止。 |
| F-CMP-015 | `response_position` | C | Enum | 认可 / 部分认可 / 不认可 / 无法确认。 |
| F-CMP-016 | `business_response_text` | C | Text | 商家正式回应正文。 |
| F-CMP-017 | `business_responded_at` | S | Datetime | 首个正式回应时间。 |
| F-CMP-018 | `business_response_overdue_at` | S | Datetime | 商家逾期未回应成立时间；不等于投诉成立。 |
| F-CMP-019 | `evidence_window_ends_at` | C | Datetime | 商家首个正式回应后双方 3 天补证截止。 |
| F-CMP-020 | `complaint_decision_status` | C | Enum | `established / partially_established / insufficient_evidence / not_supported`。 |
| F-CMP-021 | `complaint_resolution_status` | S | Enum | unresolved / resolved；与事实结论分离。 |
| F-CMP-022 | `complaint_resolved_at` | S | Datetime | 实际解决时间。 |
| F-CMP-023 | `complaint_appeal_status` | S | Enum | none / pending / decided 等申诉状态。 |
| F-CMP-024 | `platform_reviewer_user_id` | S | ID | 作出平台事实裁决的审核员。 |
| F-CMP-025 | `platform_decided_at` | S | Datetime | 平台裁决时间。 |
| F-CMP-026 | `decision_reason` | C | Text | 裁决理由与关键依据。 |
| F-CMP-027 | `complaint_claim_id` | S | ID | 投诉中一个可独立判断的事实点。 |
| F-CMP-028 | `complaint_claim_text` | S | Text | 事实点内容。 |
| F-CMP-029 | `complaint_claim_decision_status` | C | Enum | 单事实点成立 / 证据不足 / 不支持等结论。 |
| F-CMP-030 | `complaint_is_public` | S | Bool | 当前是否允许公开展示；不得由商家自行关闭。 |
| F-CMP-031 | `complaint_withdrawn_at` | S | Datetime | 投诉人撤回时间（如适用），历史审计仍保留。 |
| F-CMP-032 | `removed_for_violation_at` | S | Datetime | 因内容违规等下架时间，不等于事实结论。 |

### 14.3 投诉证据（EVIDENCE）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-EVD-001 | `complaint_evidence_id` | S | ID | 单条投诉证据。 |
| F-EVD-002 | `evidence_complaint_id` | C | ID | 所属投诉。 |
| F-EVD-003 | `evidence_type` | S | Enum | text / image / video / chat / order / receipt / platform_record / regulatory / test_report 等。 |
| F-EVD-004 | `evidence_submitter_type` | S | Enum | complainant / business / third_party / platform。 |
| F-EVD-005 | `evidence_submitter_id` | S | ID | 提交者稳定标识。 |
| F-EVD-006 | `evidence_asset_ref` | S | Ref | 图片 / 视频 / 文件资源。 |
| F-EVD-007 | `evidence_text` | S | Text | 文本证言 / 说明。 |
| F-EVD-008 | `is_business_invited_witness` | C | Bool | 第三方是否由被投诉商家邀请，审核端必须可见。 |
| F-EVD-009 | `evidence_relationship_type` | S | Enum/Text | 亲历、交易关系、旁观者、一般体验等与事件关系。 |
| F-EVD-010 | `evidence_submitted_at` | S | Datetime | 证据提交时间。 |
| F-EVD-011 | `evidence_weight_level` | P | Enum | 证据等级 / 权重模型受 DEC-EVIDENCE-01 阻塞，不得自行做投票分数。 |

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

### 14.5 平台批量审核（REVIEW）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-REV-001 | `review_item_id` | S | ID | 单条待审核对象；Excel 行号不得替代。 |
| F-REV-002 | `review_batch_id` | S | ID | 一次导出 / 上传审核批次。 |
| F-REV-003 | `row_version` | C | Int | 乐观并发版本；导出后原记录变化则拒绝旧行覆盖。 |
| F-REV-004 | `review_target_type` | S | Enum | complaint / pet_safety / customer_risk 等审核对象类型。 |
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

> 产品原则已确认“共享客观风险事件，不共享主观人格评价”；具体授权、可见范围、保存与业务影响受 DEC-RISK-01 阻塞，因此本组字段均为 P。

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-CRISK-001 | `customer_risk_event_id` | P | ID | 平台级客观风险事件。 |
| F-CRISK-002 | `risk_subject_user_id` | P | ID | 被记录的 Platform User。 |
| F-CRISK-003 | `risk_event_type` | P | Enum | 爽约、拒付、威胁、已核验恶意退款等客观事件类型。 |
| F-CRISK-004 | `risk_event_source_merchant_id` | P | ID | 来源 Merchant。 |
| F-CRISK-005 | `risk_event_source_store_id` | P | ID | 来源 Store。 |
| F-CRISK-006 | `risk_event_business_id` | P | ID | 关联预约 / 订单 / 服务等事实对象。 |
| F-CRISK-007 | `risk_event_review_status` | P | Enum | 平台审核结果。 |
| F-CRISK-008 | `risk_event_effective_until` | P | Datetime | 有效 / 降权截止，规则未确认。 |
| F-CRISK-009 | `risk_event_appeal_status` | P | Enum | 顾客异议 / 申诉状态。 |

---

## 15. 上门喂养需求市场（FEED）

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-FEED-001 | `home_feeding_request_id` | S | ID | 平台级上门喂养需求唯一标识；不复用普通商品/服务订单。 |
| F-FEED-002 | `publisher_user_id` | S | ID | 发布者 Platform User。 |
| F-FEED-003 | `publisher_store_id` | C | ID | 发布时永久绑定的 Store；切换当前门店不得改变。 |
| F-FEED-004 | `pet_ids` | C | Ref[] | 选择已有宠物，可多只。 |
| F-FEED-005 | `pet_type_summary` | S | Text/Struct | 公开卡片的宠物类型摘要。 |
| F-FEED-006 | `pet_count` | C | Int | 需求中的宠物数量。 |
| F-FEED-007 | `pet_photo_refs` | C | Ref[] | 可选宠物照片。 |
| F-FEED-008 | `service_start_date` | C | Date | 上门喂养开始日期。 |
| F-FEED-009 | `service_end_date` | C | Date | 上门喂养结束日期。 |
| F-FEED-010 | `daily_time_window` | C | Text/Struct | 每日喂养时间或时间段。 |
| F-FEED-011 | `daily_visit_count` | C | Int | 每日上门次数。 |
| F-FEED-012 | `location_city` | S | Text | 公开真实城市。 |
| F-FEED-013 | `location_district` | S | Text | 公开真实区县。 |
| F-FEED-014 | `public_location_text` | S | Text | 小区名称 / 附近区域等模糊位置。不得泄露门牌号。 |
| F-FEED-015 | `private_exact_address` | S | Text | 精确地址，只有接单后合法必要且授权的门店对接流程可使用；公开接口禁止返回。 |
| F-FEED-016 | `daily_budget` | C | Money | 每日预算。V1 不代表平台托管资金。 |
| F-FEED-017 | `feeding_requirements` | C | Text | 喂养要求。 |
| F-FEED-018 | `special_notes` | C | Text | 特殊注意事项，选填。 |
| F-FEED-019 | `home_feeding_status` | S | Enum | 底层状态；客户端聚合为待接单 / 已接单待门店对接 / 进行中 / 已完成，另有已取消。 |
| F-FEED-020 | `accepted_user_id` | S | ID | 当前有效接单者 Platform User；首个有效请求原子锁定。 |
| F-FEED-021 | `accepted_at` | S | Datetime | 当前轮有效接单成立时间。 |
| F-FEED-022 | `acceptance_round` | S | Int | 接单取消后重新开放时区分新旧轮次；旧轮次迟到请求不得污染新轮次。 |
| F-FEED-023 | `share_deep_link` | S | Text | 微信聊天/群分享后进入对应需求详情的深链。 |
| F-FEED-024 | `store_coordination_status` | P | Enum | 门店内部对接细状态/动作仍受 DEC-FEED-02 阻塞，不冻结正式枚举。 |
| F-FEED-025 | `publisher_cancel_deadline` | P | Datetime | DEC-FEED-01 未确认，禁止提前实现。 |
| F-FEED-026 | `accept_deadline` | P | Datetime | DEC-FEED-03 未确认，禁止提前写死。 |
| F-FEED-027 | `public_expires_at` | P | Datetime | DEC-FEED-03 未确认。 |

---

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
| F-RWD-017 | `fulfillment_status` | C | Enum | 待总仓发货 / 已发往门店 / 门店已收货待自提 / 已领取 / 已取消。 |
| F-RWD-018 | `redemption_created_at` | S | Datetime | 兑换时间。 |
| F-RWD-019 | `fulfillment_task_id` | S | ID | 总仓到门店的实物履约任务。 |
| F-RWD-020 | `warehouse_shipped_at` | S | Datetime | Platform Super Admin 确认总仓发货时间。 |
| F-RWD-021 | `store_received_at` | S | Datetime | 指定领取门店实际收货时间。 |
| F-RWD-022 | `pickup_credential` | S | Text/Struct | 用户本人自提核验凭证 / 指引；不得成为其他门店越权核销凭证。 |
| F-RWD-023 | `picked_up_at` | S | Datetime | 实际领取时间。 |
| F-RWD-024 | `pickup_verified_by_staff_id` | S | ID | 指定门店实际核销人员。 |
| F-RWD-025 | `canceled_at` | S | Datetime | 已确认取消成立时间；取消权限本身仍受 DEC-POINTS-01 阻塞。 |
| F-RWD-026 | `points_refund_ledger_id` | S | ID | 取消后积分补偿流水；“已取消”不等于“积分已返还”。 |
| F-RWD-027 | `pickup_deadline` | P | Datetime | DEC-POINTS-02 未确认，自提期限不得提前写死。 |
| F-RWD-028 | `replacement_pickup_store_id` | P | ID | 是否允许改领取门店待 DEC-POINTS-02；确认前不得实现。 |

---

## 17. 养宠顾问与门店 Feature Entitlement（ENT / ADVISOR）

### 17.1 门店权益

| 注册号 | 统一逻辑字段名 | 状态 | 类型 | 解释 |
|---|---|---:|---|---|
| F-ENT-001 | `feature_entitlement_id` | S | ID | 单条 Store Feature Entitlement。 |
| F-ENT-002 | `owner_type` | C | Enum | 当前养宠顾问固定 `store`。 |
| F-ENT-003 | `owner_id` | C | ID | 当前值必须等于对应 `store_id`；不能用 purchaser Merchant 替代资格归属。 |
| F-ENT-004 | `purchaser_merchant_id` | C | ID | 购买 / 管理 / 审计关联，不参与替代 Store 资格判断。 |
| F-ENT-005 | `feature_key` | C | Text | 当前确认 `pet_advisor`。 |
| F-ENT-006 | `entitlement_status` | C | Enum | 有效 / 过期 / 停用等权益状态。 |
| F-ENT-007 | `enabled_by_merchant` | C | Bool | Merchant Owner 在有效平台权益前提下是否向本店客户开启。 |
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
| F-AUD-004 | `action_key` | S | Text | 本次动作，例如调价、绑定、收款确认、核销等。 |
| F-AUD-005 | `object_type` | S | Text/Enum | 被操作业务对象类型。 |
| F-AUD-006 | `object_id` | S | ID | 被操作对象标识。 |
| F-AUD-007 | `old_state` | C | Struct/Text | 原状态 / 原关系 / 原值快照（按业务需要）。 |
| F-AUD-008 | `new_state` | C | Struct/Text | 新状态 / 新关系 / 新值快照。 |
| F-AUD-009 | `audit_reason` | C | Text | 人工高风险操作、换绑、调价、调整等原因。 |
| F-AUD-010 | `audit_created_at` | S | Datetime | 审计事件时间。 |
| F-AUD-011 | `related_request_id` | S | Text/ID | 对应幂等请求 / 操作请求，便于重复动作追踪。 |

余额、积分、订单、库存、员工离职、Customer 换绑、调价、收款、退款 / 冲正、寄养执行、兑换核销等历史不得通过普通更新无痕覆盖。

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
| `status`（跨域 API） | 使用业务前缀状态字段 | `order_status / payment_status / boarding_feed_execution_status / fulfillment_status` 含义完全不同。 |
| `pay_status` | `payment_status` | 与订单业务状态分离。 |
| `feed_status` | `boarding_feed_execution_status` 或 `home_feeding_status` | 寄养加餐与上门喂养是两个不同业务。 |
| `order_source` | `source_channel` | 来源渠道全局统一。 |
| `boarding_feed` 作为渠道 | `business_scenario = boarding_feed` | 业务场景不得覆盖渠道 `mini_program`。 |
| `ad_status` | `reward_status / load_status / launch_ad_load_status` | 激励权益、首页曝光广告、启动广告状态机不同。 |
| `ad_type` | `placement` + 对应模块的 `mode` | placement 表示业务广告位；launch `mode` 表示图片/视频/微信来源。 |
| `owner_store_id`（顾问权益） | `owner_type=store` + `owner_id=store_id` | Feature Entitlement 使用通用 owner 结构，Merchant 只作购买关联。 |
| 仅凭 `pet_id` 直接返回完整 Pet | 按业务最小视图返回 | `pet_id` 只是对象标识；投诉、宠物安全档案或其他模块均不得据此读取完整 PetProfile。 |
| `occurred_at = recorded_at` | 分别保存 | 寄养补录必须按真实发生时间排序。 |
| `paid = fed` | `payment_status` + `boarding_feed_execution_status` | 已收款不等于已投喂。 |
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

---

## 25. Pending 字段处理规则

以下字段族当前不得被“字段注册表存在”误认为需求已确认：

- `F-APPT-019`～`021`：预约容量/改期模型，受 `DEC-APPT-01` 阻塞；
- `F-PET-049`～`050`：宠物行为安全档案跨店共享与审核，受 `DEC-PETSAFETY-01` 阻塞；
- `F-EVD-011`：第三方证据权重模型，受 `DEC-EVIDENCE-01` 阻塞；
- `F-RISK-007`：不同门店来源具体加权系数尚未冻结；3条独立投诉硬门槛不受该字段影响；
- `F-REV-016`～`017`：跨店审核结果可见范围 / 有效期按对应风险业务 DEC 确认；
- `F-CRISK-001`～`009`：跨门店顾客客观风险事件完整字段族受 `DEC-RISK-01` 阻塞；
- `F-FEED-024`～`027`：上门喂养修改/取消/响应/失效时限，受 `DEC-FEED-01`～`03` 阻塞；
- `F-RWD-027`～`028`：积分自提期限 / 改领取门店，受 `DEC-POINTS-02` 阻塞；
- 启动广告具体秒数默认值/范围受 `DEC-LAUNCH-01` 阻塞；字段存在但不能写死运营常数；
- 店员端 §3.0 之外的工作台、二级菜单、收款/审批、寄养位置、待办归属、员工权限等字段受 `DEC-STAFF-01`～`08` 阻塞。

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
- `04-staff-miniapp.md` 当前已确认 §3.0 与来自 01/02/03 的已确认跨端约束

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
