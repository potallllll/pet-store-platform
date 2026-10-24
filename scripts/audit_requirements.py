#!/usr/bin/env python3
"""Audit the current requirements repository without encoding old branch conclusions."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import unquote


META_RE = re.compile(r"^>\s*([a-z][a-z0-9_]*):\s*(.*?)\s*$", re.MULTILINE)
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
ID_RE = re.compile(r"^\|\s*(C-[A-Z0-9-]+)\s*\|", re.MULTILINE)


def metadata(text: str) -> dict[str, str]:
    header = text.split("\n## ", 1)[0]
    return dict(META_RE.findall(header))


def add(results: list[dict[str, str]], severity: str, code: str, path: Path, message: str) -> None:
    results.append({"severity": severity, "code": code, "path": path.as_posix(), "message": message})


def audit_metadata(root: Path, results: list[dict[str, str]]) -> None:
    exempt = {"README.md", "REQUIREMENTS-STATUS.md"}
    for path in sorted((root / "docs").glob("*.md")):
        if path.name in exempt:
            continue
        text = path.read_text(encoding="utf-8")
        meta = metadata(text)
        for key in ("status", "development_readiness", "blocked_by"):
            if key not in meta:
                add(results, "error", "metadata.missing", path.relative_to(root), f"missing {key}")
        if meta.get("status") == "mixed":
            for key in ("confirmed_scope", "pending_scope"):
                if key not in meta:
                    add(results, "error", "metadata.mixed_scope", path.relative_to(root), f"mixed document missing {key}")
        if meta.get("status") == "confirmed" and "status_scope" not in meta:
            add(results, "error", "metadata.confirmed_scope", path.relative_to(root), "confirmed document missing status_scope")
        if meta.get("blocked_by") and not re.fullmatch(r"\[(?:\s*DEC-[A-Z0-9-]+\s*(?:,\s*DEC-[A-Z0-9-]+\s*)*)?\]", meta["blocked_by"]):
            add(results, "error", "metadata.blocked_by", path.relative_to(root), "blocked_by must be [] or a DEC ID list")

    for path in sorted((root / "docs" / "history").glob("*.md")):
        if path.name == "README.md":
            continue
        meta = metadata(path.read_text(encoding="utf-8"))
        if meta.get("status") != "archived" or meta.get("implementation_policy") != "forbidden":
            add(results, "error", "history.policy", path.relative_to(root), "history file must be archived and implementation_policy forbidden")


def audit_links(root: Path, results: list[dict[str, str]]) -> None:
    for path in sorted(root.rglob("*.md")):
        if ".git" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        for raw in LINK_RE.findall(text):
            target = raw.strip().split(maxsplit=1)[0].strip("<>")
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            file_part = unquote(target.split("#", 1)[0])
            if not file_part:
                continue
            resolved = (path.parent / file_part).resolve()
            if not resolved.exists():
                add(results, "error", "link.missing", path.relative_to(root), f"missing target: {target}")


def table_ids(text: str, start_heading: str, end_heading: str | None = None) -> list[str]:
    start = text.find(start_heading)
    if start < 0:
        return []
    chunk = text[start:]
    if end_heading:
        end = chunk.find(end_heading)
        if end >= 0:
            chunk = chunk[:end]
    return ID_RE.findall(chunk)


def audit_acceptance_ids(root: Path, results: list[dict[str, str]]) -> None:
    blueprint_path = root / "docs" / "03i-customer-screen-blueprint.md"
    tracker_path = root / "docs" / "execution" / "customer-delivery-tracker.md"
    blueprint = table_ids(blueprint_path.read_text(encoding="utf-8"), "### 14.1", "### 14.2")
    tracker = ID_RE.findall(tracker_path.read_text(encoding="utf-8"))
    if not blueprint:
        add(results, "error", "acceptance.missing", blueprint_path.relative_to(root), "no acceptance IDs found in section 14.1")
        return
    duplicates = sorted({item for item in blueprint if blueprint.count(item) > 1})
    if duplicates:
        add(results, "error", "acceptance.duplicate", blueprint_path.relative_to(root), f"duplicate IDs: {', '.join(duplicates)}")
    if blueprint != tracker:
        missing = [item for item in blueprint if item not in tracker]
        extra = [item for item in tracker if item not in blueprint]
        add(
            results,
            "error",
            "acceptance.tracker_mismatch",
            tracker_path.relative_to(root),
            f"tracker must match the section 14.1 ID order; missing={missing}, extra={extra}",
        )


def audit_current_invariants(root: Path, results: list[dict[str, str]]) -> None:
    current_files = [path for path in (root / "docs").rglob("*.md") if "history" not in path.parts]
    current_text = {path.relative_to(root).as_posix(): path.read_text(encoding="utf-8") for path in current_files}

    appointment = current_text["docs/03a-customer-appointment.md"]
    if metadata(appointment).get("status") != "confirmed" or "DEC-APPT-01" in metadata(appointment).get("blocked_by", ""):
        add(results, "error", "appointment.decision", Path("docs/03a-customer-appointment.md"), "DEC-APPT-01 must remain confirmed and unblocked")
    for key, expected in {
        "booking_model": "manual_store_confirmation",
        "fixed_booking_interval": "retired",
        "hard_slot_capacity": "retired",
        "slot_reservation": "retired",
    }.items():
        if metadata(appointment).get(key) != expected:
            add(results, "error", "appointment.manual_model", Path("docs/03a-customer-appointment.md"), f"{key} must be {expected}")
    registry = current_text["docs/FIELD-REGISTRY.md"]
    registered_ids = re.findall(r"^\|\s*(F-[A-Z0-9-]+)\s*\|", registry, re.MULTILINE)
    duplicate_fields = sorted({item for item in registered_ids if registered_ids.count(item) > 1})
    if duplicate_fields:
        add(results, "error", "registry.duplicate_id", Path("docs/FIELD-REGISTRY.md"), f"duplicate registered field IDs: {', '.join(duplicate_fields)}")
    for field_id in ("F-APPT-019", "F-APPT-020", "F-APPT-027", "F-PAY-012"):
        row = next((line for line in registry.splitlines() if line.startswith(f"| {field_id} |")), "")
        cells = [cell.strip() for cell in row.split("|")]
        if len(cells) < 4 or cells[3] != "D":
            add(results, "error", "registry.retired_field", Path("docs/FIELD-REGISTRY.md"), f"{field_id} must remain registered as D (retired)")

    # Check the confirmed subsection, not the staff document's still-mixed overall status.
    staff_path = Path("docs/04-staff-miniapp.md")
    staff = current_text[staff_path.as_posix()]
    catalog = staff.split("#### 3.0.8", 1)[-1].split("#### 3.0.9", 1)[0]
    catalog_meta = dict(META_RE.findall(catalog)) if "#### 3.0.8" in staff else {}
    for key, expected in {
        "status": "confirmed",
        "business_item_category_order": "[洗护, 美容, 护理, 商品]",
        "care_customer_booking": "disabled",
        "product_catalog_integration": "select_existing_product_and_sku",
        "service_item_new_enabled": "true",
        "service_item_name_max_chars": "30",
        "service_item_description_max_chars": "300",
    }.items():
        if catalog_meta.get(key) != expected:
            add(results, "error", "catalog.confirmed_rules", staff_path, f"section 3.0.8 {key} must be {expected}")

    wash_flow = staff.split("### 4.3 ", 1)[-1].split("\n### 4.4 ", 1)[0]
    wash_meta = dict(META_RE.findall(wash_flow)) if "### 4.3 " in staff else {}
    for key, expected in {
        "workflow_scope": "wash_groom_only",
        "service_state_values": "[not_started, in_progress, completed, cancelled, interrupted]",
        "pre_service_check_required": "true",
        "service_photo_required": "false",
        "service_result_publish": "on_service_completion",
        "multi_pet_order_model": "one_customer_one_order_independent_pet_service_records",
        "multi_pet_settlement": "together_no_per_pet_split_or_installments",
        "bulk_complete_all_pets": "excluded",
        "actual_collection_timing": "after_completion_or_confirmed_interruption",
        "unpaid_departure_handling": "order_on_hold",
        "pickup_confirmation": "excluded",
    }.items():
        if wash_meta.get(key) != expected:
            add(results, "error", "wash_groom.confirmed_flow", staff_path, f"section 4.3 {key} must be {expected}")

    details = staff.split("### 4.4 ", 1)[-1].split("\n### 4.5 ", 1)[0].split("\n## 5.", 1)[0]
    detail_meta = dict(META_RE.findall(details)) if "### 4.4 " in staff else {}
    for key, expected in {
        "reopen_allowed": "unsettled_order_only",
        "reopen_reason_required": "false",
        "pre_service_check_items": "[skin, ears, eyes, mouth, nails, coat]",
        "post_service_new_abnormality_confirmation": "required",
        "hold_trigger": "staff_manual_after_pending_settlement",
        "hold_reason_required": "true",
        "hold_release": "automatic_on_successful_settlement",
        "zero_price_save_settles_order": "false",
        "zero_price_explicit_confirmation_required": "true",
        "checkout_max_payment_methods": "2",
        "refund_owner_confirmation_required": "false",
        "payment_refund_cross_business_scope": "all_store_consumption_orders",
        "financial_mode": "offline_transaction_ledger",
        "external_payment_integration": "excluded",
        "financial_entry_timing": "immediate_or_after_work",
        "operational_updates": "timely_during_business",
        "ledger_side_effects": "automatic_wallet_ledger_and_applicable_inventory_updates",
        "refund_roles": "[merchant_owner, active_store_staff]",
        "refund_method_values": "original_payment_methods",
        "refund_default_method": "original_payment_methods",
        "refund_original_method_restriction": "required",
        "refund_auto_restock": "false",
        "wallet_deduction_order": "principal_then_bonus",
        "wallet_refund_component_rule": "restore_original_components",
        "partial_refund_allocation": "pending",
    }.items():
        if detail_meta.get(key) != expected:
            add(results, "error", "wash_groom.confirmed_details", staff_path, f"section 4.4 {key} must be {expected}")

    care = staff.split("### 4.5 ", 1)[-1].split("\n## 5.", 1)[0]
    care_meta = dict(META_RE.findall(care)) if "### 4.5 " in staff else {}
    for key, expected in {
        "status": "confirmed",
        "status_scope": "care_twelve_item_workflow_only",
        "care_create_entry": "工作台/到店开单/护理",
        "care_record_entry": "业务/订单与收银",
        "care_workbench_service_group": "服务中/其他服务",
        "care_workbench_exception_group": "异常与临期/其他异常",
        "care_customer_booking": "disabled",
        "care_wash_groom_nav": "excluded",
        "care_wash_groom_add_on": "same_pet_same_order_shared_service_progress",
        "care_state_values": "[not_started, in_progress, completed, cancelled, interrupted]",
        "care_creation_state": "not_started",
        "care_state_changes": "staff_manual",
        "care_precheck_required": "true",
        "care_precheck_model": "overall_observation_not_six_item_form",
        "care_precheck_owner_decision": "abnormal_or_unable_to_check",
        "care_postcheck_new_abnormality": "required",
        "care_photo_required": "false",
        "care_routine_note_required": "false",
        "care_result_publish": "on_service_completion",
        "care_ai_report": "excluded",
        "care_multi_pet_order": "one_customer_one_order_independent_pet_service_records",
        "care_settlement": "together_after_completion_or_confirmed_interruption",
        "care_all_unstarted_cancelled_charge": "none",
        "care_interrupted_billing": "actual_receivable_with_reason",
        "care_reopen_allowed": "unsettled_order_only",
        "care_reopen_reason_required": "false",
    }.items():
        if care_meta.get(key) != expected:
            add(results, "error", "care.confirmed_rules", staff_path, f"section 4.5 {key} must be {expected}")

    boarding = staff.split("### 5.1 ", 1)[-1].split("\n### 5.2 ", 1)[0]
    boarding_meta = dict(META_RE.findall(boarding)) if "### 5.1 " in staff else {}
    for key, expected in {
        "status": "confirmed",
        "status_scope": "boarding_admission_and_basic_care_sixteen_rules_only",
        "boarding_admission_trigger": "staff_confirm_after_actual_arrival",
        "boarding_check_in_time_required": "true",
        "boarding_expected_checkout_time_required": "true",
        "boarding_expected_checkout_validation": "later_than_check_in",
        "boarding_multi_pet_model": "independent_boarding_records_per_pet",
        "boarding_multi_pet_combined_settlement": "allowed_same_merchant_same_customer",
        "boarding_duplicate_active_stay": "blocked_same_merchant_same_pet",
        "boarding_location_required": "false",
        "boarding_location_model": "free_text_no_room_booking",
        "boarding_location_duplicate_policy": "warn_not_block",
        "boarding_admission_check_required": "true",
        "boarding_admission_check_model": "overall_observation_not_six_item_form",
        "boarding_profile_edit_default": "current_stay_only",
        "boarding_profile_archive_sync": "explicit_action_and_existing_field_permissions",
        "boarding_diet_confirmation_required": "true",
        "boarding_unknown_diet_handling": "mark_unverified_no_safe_or_allowed_default",
        "boarding_belongings_required": "false",
        "boarding_care_record_entry": "single_form",
        "boarding_care_action_values": "[feeding, walking, cleaning]",
        "boarding_care_action_labels": "[喂食, 遛狗, 清扫笼子]",
        "boarding_care_action_selection": "single",
        "boarding_care_record_steps": "[action, occurred_at, optional_photos, confirm]",
        "boarding_care_time_policy": "explicit_actual_occurred_at",
        "boarding_care_photo_required": "false",
        "boarding_care_batch_completion": "excluded",
        "boarding_daily_media_quota": "excluded",
        "boarding_event_visibility": "independent_of_notify_customer",
        "boarding_abnormal_close": "staff_confirms_actual_handling_with_result",
        "boarding_checkout_due_policy": "remind_only_no_auto_end_renew_or_fee",
        "boarding_billing_and_collection": "confirmed_in_section_5_2",
        "boarding_actual_checkout": "confirmed_with_checkout_receivable_independent_of_payment",
        "boarding_vaccination_admission": "pending",
        "boarding_special_care_execution": "pending",
        "boarding_shift_handover": "pending",
    }.items():
        if boarding_meta.get(key) != expected:
            add(results, "error", "boarding.confirmed_rules", staff_path, f"section 5.1 {key} must be {expected}")

    boarding_billing = staff.split("### 5.2 ", 1)[-1].split("\n### 5.3 ", 1)[0]
    billing_meta = dict(META_RE.findall(boarding_billing)) if "### 5.2 " in staff else {}
    for key, expected in {
        "status": "confirmed",
        "status_scope": "boarding_admission_pricing_checkout_departure_and_basic_hold_rules_only",
        "boarding_billing_unit": "overnight",
        "boarding_billing_timezone": "Asia/Shanghai",
        "boarding_billing_cutoff": "03:00:00",
        "boarding_billing_interval": "check_in_exclusive_actual_checkout_inclusive",
        "boarding_billable_days": "count_daily_cutoffs_in_actual_stay",
        "boarding_no_overnight_fee": "zero",
        "boarding_collection_timing": "at_or_after_actual_departure_no_prepayment",
        "boarding_extension_early_departure": "recalculate_from_actual_stay",
        "boarding_expected_time_billing_effect": "none",
        "boarding_billing_auto_charge": "excluded",
        "boarding_daily_rate_set_by": "[merchant_owner, active_store_staff]",
        "boarding_daily_rate_set_at": "admission",
        "boarding_daily_rate_scope": "current_pet_current_stay",
        "boarding_daily_rate_required": "true",
        "boarding_daily_rate_field": "F-ORD-008",
        "boarding_pet_base_amount": "own_daily_rate_times_own_billable_nights",
        "boarding_combined_settlement": "allowed_same_merchant_same_customer",
        "boarding_combined_amount": "sum_selected_boarding_item_base_amounts_before_existing_discounts_adjustments",
        "boarding_partial_departure_settlement": "separate_at_each_actual_departure",
        "boarding_settlement_items": "current_departing_unconfirmed_items_then_original_unpaid_batch",
        "boarding_remaining_pets": "keep_boarding_unsettled_without_prepayment",
        "boarding_departure_trigger": "confirm_current_checkout_receivable",
        "boarding_separate_departure_confirmation": "excluded",
        "boarding_checkout_payment_dependency": "none",
        "boarding_actual_checkout_default": "current_server_time",
        "boarding_actual_checkout_edit": "actual_past_time_with_previous_values_and_audit",
        "boarding_actual_checkout_validation": "check_in_lte_actual_checkout_lte_server_now",
        "boarding_billing_stop": "actual_checkout_at_even_if_unpaid",
        "boarding_unpaid_departure_state": "departed_pending_settlement",
        "boarding_hold_trigger": "staff_manual_after_checkout_receivable_confirmed",
        "boarding_hold_reason_required": "true",
        "boarding_hold_auto_release": "paid_or_explicit_waiver",
        "boarding_belongings_checkout": "show_recorded_items_no_mandatory_checks_photos_or_signature",
    }.items():
        if billing_meta.get(key) != expected:
            add(results, "error", "boarding.billing_rules", staff_path, f"section 5.2 {key} must be {expected}")

    for field_id, field_name in {
        "F-ORD-008": "item_original_unit_price",
        "F-ORD-009": "item_original_amount",
        "F-ORD-010": "original_receivable_amount",
        "F-ORD-029": "boarding_id",
        "F-ORD-034": "order_on_hold",
        "F-ORD-035": "order_held_at",
        "F-BOARD-019": "boarding_location_label",
        "F-BOARD-020": "boarding_profile_snapshot",
        "F-BOARD-021": "boarding_belongings",
        "F-BOARD-022": "boarding_admission_check_status",
        "F-BOARD-023": "boarding_admission_notes",
        "F-BOARD-024": "boarding_admission_decision",
        "F-BOARD-025": "boarding_event_visibility",
        "F-BOARD-026": "boarding_abnormal_handling_status",
        "F-BOARD-027": "boarding_abnormal_handling_result",
        "F-BOARD-028": "boarding_profile_unverified_fields",
        "F-BOARD-029": "boarding_billable_nights",
        "F-BOARD-030": "boarding_checkout_confirmed_at",
    }.items():
        row = next((line for line in registry.splitlines() if line.startswith(f"| {field_id} |")), "")
        cells = [cell.strip() for cell in row.split("|")]
        if len(cells) < 4 or cells[2] != f"`{field_name}`" or cells[3] not in {"C", "S"}:
            add(results, "error", "boarding.field_mapping", Path("docs/FIELD-REGISTRY.md"), f"{field_id} must remain active as {field_name}")

    orders_path = Path("docs/03d-customer-orders.md")
    orders = current_text[orders_path.as_posix()]
    settlement = orders.split("### 10.1 ", 1)[-1].split("\n## 11.", 1)[0]
    settlement_meta = dict(META_RE.findall(settlement)) if "### 10.1 " in orders else {}
    for key, expected in {
        "status": "confirmed",
        "adjustment_scope": "all_onsite_consumption_orders",
        "adjustment_business_limit": "none",
        "adjustment_owner_approval": "not_required",
        "adjustment_roles": "[merchant_owner, active_store_staff]",
        "adjustment_input": "final_receivable_amount",
        "waiver_payment_status": "waived",
        "waiver_requires_explicit_confirmation": "true",
        "waiver_actual_payment_amount": "0",
        "waiver_revenue_amount": "0",
        "checkout_max_payment_methods": "2",
        "refund_owner_confirmation_required": "false",
    }.items():
        if settlement_meta.get(key) != expected:
            add(results, "error", "settlement.confirmed_rules", orders_path, f"section 10.1 {key} must be {expected}")

    ledger = orders.split("### 1.1 ", 1)[-1].split("\n## 2.", 1)[0]
    ledger_meta = dict(META_RE.findall(ledger)) if "### 1.1 " in orders else {}
    for key, expected in {
        "status": "confirmed",
        "status_scope": "store_consumption_financial_ledger_only",
        "financial_mode": "offline_transaction_ledger",
        "external_payment_integration": "excluded",
        "financial_entry_timing": "immediate_or_after_work",
        "operational_updates": "timely_during_business",
        "ledger_side_effects": "automatic_wallet_ledger_and_applicable_inventory_updates",
        "refund_owner_confirmation_required": "false",
        "refund_roles": "[merchant_owner, active_store_staff]",
        "refund_method_values": "original_payment_methods",
        "refund_default_method": "original_payment_methods",
        "refund_original_method_restriction": "required",
        "refund_auto_restock": "false",
        "wallet_deduction_order": "principal_then_bonus",
        "wallet_refund_component_rule": "restore_original_components",
        "partial_refund_allocation": "pending",
    }.items():
        if ledger_meta.get(key) != expected:
            add(results, "error", "ledger.confirmed_rules", orders_path, f"section 1.1 {key} must be {expected}")

    wallet_path = Path("docs/03c-customer-wallet.md")
    wallet_meta = metadata(current_text[wallet_path.as_posix()])
    if wallet_meta.get("status") != "mixed" or "DEC-STAFF-05" not in wallet_meta.get("blocked_by", ""):
        add(results, "error", "wallet.allocation_pending", wallet_path, "unresolved partial refund allocation must remain explicit and blocked")

    for key, expected in {
        "wallet_deduction_order": "principal_then_bonus",
        "wallet_refund_component_rule": "restore_original_components",
        "partial_refund_allocation": "pending",
    }.items():
        if wallet_meta.get(key) != expected:
            add(results, "error", "wallet.confirmed_rules", wallet_path, f"{key} must be {expected}")

    for path, text in current_text.items():
        if "blocked_by:" in text.split("\n## ", 1)[0] and "DEC-APPT-01" in metadata(text).get("blocked_by", ""):
            add(results, "error", "appointment.stale_blocker", Path(path), "closed DEC-APPT-01 remains in blocked_by")

    prohibited = {
        "申请不占位、确认原子占位": "appointment hard-slot reservations were retired; use manual confirmation",
        "客户不能自由输入预约时间，只能选择门店开放的预约时段": "fixed booking intervals were retired",
        "时段名额以后端提交时实时校验为准": "hard slot capacity must not control current appointments",
        "独立风险查询入口": "cross-store risk lookup must not become an arbitrary standalone query",
        "不确认此前建议的客户页全部结构": "customer page structure was subsequently confirmed",
        "退款须本店老板确认": "consumption refunds no longer require owner approval",
        "退款老板确认（全部门店消费订单）": "consumption refunds no longer require owner approval",
        "refund_owner_confirmation_required: true": "consumption refunds no longer require owner approval",
        "默认余额优先": "refunds must follow original payment routes",
        "优先退会员余额": "refunds must follow original payment routes",
        "不限制原付款方式": "refunds must follow original payment routes",
        "不受原付款方式限制": "refunds must follow original payment routes",
        "护理执行细节另议": "the twelve approved care workflow rules are confirmed",
        "具体护理过程状态／内容待": "the twelve approved care workflow rules are confirmed",
        "护理执行流程仍待DEC-STAFF-04": "the twelve approved care workflow rules are confirmed",
        "护理过程未决不得冒充已通过": "approved care workflow scope must not be classified as wholly pending",
        "寄养主链分析（未确认细节）": "boarding admission and basic-care approved scope is no longer wholly pending",
    }
    for phrase, message in prohibited.items():
        for path, text in current_text.items():
            if phrase in text:
                add(results, "error", "current.stale_phrase", Path(path), message)

    retirement_markers = ("原", "旧", "退役", "移除", "归档", "取代", "替代", "禁止", "不得", "不再", "恢复")
    for path, text in current_text.items():
        if path == "docs/FIELD-REGISTRY.md":
            continue
        for line in text.splitlines():
            if re.search(r"\b(?:F-SOC-|C-SOCIAL-)\d+\b|宠物交友", line) and not any(marker in line for marker in retirement_markers):
                add(results, "error", "retired.social", Path(path), "retired pet-social identifier or terminology appears as a current rule")
                break


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--output", default="requirements-audit.json")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    results: list[dict[str, str]] = []
    audit_metadata(root, results)
    audit_links(root, results)
    audit_acceptance_ids(root, results)
    audit_current_invariants(root, results)

    report = {
        "schema_version": 1,
        "root": root.as_posix(),
        "markdown_file_count": len([p for p in root.rglob("*.md") if ".git" not in p.parts]),
        "errors": sum(item["severity"] == "error" for item in results),
        "warnings": sum(item["severity"] == "warning" for item in results),
        "findings": results,
    }
    output = (root / args.output).resolve()
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
