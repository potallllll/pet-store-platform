#!/usr/bin/env python3
"""Audit the active requirements baseline and the Q0-Q51 consistency guards."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import unquote


META_RE = re.compile(r"^>\s*([a-z][a-z0-9_]*):\s*(.*?)\s*$", re.MULTILINE)
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
ACCEPTANCE_ID_RE = re.compile(r"^\|\s*(C-[A-Z0-9-]+)\s*\|", re.MULTILINE)
FIELD_ROW_RE = re.compile(r"^\|\s*(F-[A-Z0-9-]+)\s*\|\s*`([^`]+)`\s*\|\s*([A-Z])\s*\|", re.MULTILINE)


def metadata(text: str) -> dict[str, str]:
    return dict(META_RE.findall(text.split("\n## ", 1)[0]))


def add(results: list[dict[str, str]], code: str, path: Path | str, message: str) -> None:
    results.append({"severity": "error", "code": code, "path": Path(path).as_posix(), "message": message})


def audit_metadata(root: Path, results: list[dict[str, str]]) -> None:
    exempt = {"README.md", "REQUIREMENTS-STATUS.md"}
    for path in sorted((root / "docs").glob("*.md")):
        if path.name in exempt:
            continue
        meta = metadata(path.read_text(encoding="utf-8"))
        for key in ("status", "development_readiness", "blocked_by"):
            if key not in meta:
                add(results, "metadata.missing", path.relative_to(root), f"missing {key}")
        if meta.get("status") == "mixed":
            for key in ("confirmed_scope", "pending_scope"):
                if key not in meta:
                    add(results, "metadata.mixed_scope", path.relative_to(root), f"mixed document missing {key}")
        if meta.get("status") == "confirmed" and "status_scope" not in meta:
            add(results, "metadata.confirmed_scope", path.relative_to(root), "confirmed document missing status_scope")
        blocked = meta.get("blocked_by", "")
        if blocked and not re.fullmatch(r"\[(?:\s*DEC-[A-Z0-9-]+\s*(?:,\s*DEC-[A-Z0-9-]+\s*)*)?\]", blocked):
            add(results, "metadata.blocked_by", path.relative_to(root), "blocked_by must be [] or a DEC ID list")

    for path in sorted((root / "docs" / "history").glob("*.md")):
        if path.name == "README.md":
            continue
        meta = metadata(path.read_text(encoding="utf-8"))
        if meta.get("status") != "archived" or meta.get("implementation_policy") != "forbidden":
            add(results, "history.policy", path.relative_to(root), "history file must be archived and implementation_policy forbidden")


def audit_links(root: Path, results: list[dict[str, str]]) -> None:
    for path in sorted(root.rglob("*.md")):
        if ".git" in path.parts:
            continue
        for raw in LINK_RE.findall(path.read_text(encoding="utf-8")):
            target = raw.strip().split(maxsplit=1)[0].strip("<>")
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            file_part = unquote(target.split("#", 1)[0])
            if file_part and not (path.parent / file_part).resolve().exists():
                add(results, "link.missing", path.relative_to(root), f"missing target: {target}")


def audit_acceptance_ids(root: Path, results: list[dict[str, str]]) -> None:
    blueprint_path = root / "docs" / "03i-customer-screen-blueprint.md"
    tracker_path = root / "docs" / "execution" / "customer-delivery-tracker.md"
    blueprint_text = blueprint_path.read_text(encoding="utf-8")
    start = blueprint_text.find("### 14.1")
    end = blueprint_text.find("### 14.2", start)
    blueprint = ACCEPTANCE_ID_RE.findall(blueprint_text[start:end]) if start >= 0 and end > start else []
    tracker = ACCEPTANCE_ID_RE.findall(tracker_path.read_text(encoding="utf-8"))
    if not blueprint:
        add(results, "acceptance.missing", blueprint_path.relative_to(root), "no acceptance IDs found in section 14.1")
    duplicates = sorted({item for item in blueprint if blueprint.count(item) > 1})
    if duplicates:
        add(results, "acceptance.duplicate", blueprint_path.relative_to(root), f"duplicate IDs: {', '.join(duplicates)}")
    if blueprint != tracker:
        add(results, "acceptance.tracker_mismatch", tracker_path.relative_to(root), "tracker must match section 14.1 ID order")


def audit_fields(root: Path, results: list[dict[str, str]]) -> None:
    path = root / "docs" / "FIELD-REGISTRY.md"
    text = path.read_text(encoding="utf-8")
    rows = FIELD_ROW_RE.findall(text)
    ids = [row[0] for row in rows]
    for item in sorted({item for item in ids if ids.count(item) > 1}):
        add(results, "registry.duplicate_id", path.relative_to(root), f"duplicate field ID: {item}")

    statuses = {field_id: status for field_id, _, status in rows}
    expected = {
        "F-CSH-001": "D", "F-CSH-002": "D", "F-PAY-019": "D",
        "F-CMP-023": "D", "F-CRISK-009": "D", "F-CRISK-028": "D",
        "F-CRISK-029": "D", "F-CRISK-030": "D", "F-CRISK-036": "D",
        "F-PET-049": "D", "F-RWD-011": "D", "F-RWD-012": "D",
        "F-RWD-025": "S", "F-RWD-028": "D", "F-BOARD-008": "C",
        "F-WAL-003": "C", "F-WAL-004": "C", "F-CPN-016": "S",
    }
    for field_id, expected_status in expected.items():
        if statuses.get(field_id) != expected_status:
            add(results, "registry.current_status", path.relative_to(root), f"{field_id} must be {expected_status}")


def audit_current_rules(root: Path, results: list[dict[str, str]]) -> None:
    current_paths = [p for p in (root / "docs").rglob("*.md") if "history" not in p.parts]
    texts = {p.relative_to(root).as_posix(): p.read_text(encoding="utf-8") for p in current_paths}

    def require(rel: str, *tokens: str) -> None:
        text = texts.get(rel, "")
        for token in tokens:
            if token not in text:
                add(results, "current.missing_rule", rel, f"missing current rule: {token}")

    require("docs/REQUIREMENTS-STATUS.md",
            "只有消费退款、充值退款和免单的原因必填",
            "结算成功后，最终应收、实收、付款拆分和收款时间锁定",
            "V1 不做跨店顾客／宠物档案或服务护理历史导入",
            "门店日常经营和老板设置全部在店员小程序",
            "商品标题使用“本店推荐”")
    require("docs/03c-customer-wallet.md",
            "取消“修改余额”入口", "从一笔已成功充值记录发起全额或部分充值退款",
            "所有优惠券与活动券统一在结算时选择并自动核销", "结算成功后自动核销")
    require("docs/03d-customer-orders.md",
            "少收只能在原单登记一笔真实补收", "不提供“更正收款”",
            "快速开单完成必要检查并提交后直接进入服务中",
            "寄养中／待结算／已完成／已取消", "补图或修改普通说明均不发送通知")
    require("docs/03g-customer-identity-security.md",
            "同一平台账号在同一时刻只能归属一个有效经营门店",
            "V1不提供跨店档案复用", "不显示“使用已有宠物档案”或“一键导入其他门店记录”")
    if "### 5.5" in texts["docs/03g-customer-identity-security.md"]:
        add(results, "identity.deleted_section", "docs/03g-customer-identity-security.md", "deleted cross-store import section 5.5 must not remain")
    require("docs/03h-customer-risk-feedback.md",
            "跨店风险只按已认证手机号唯一匹配Platform User", "不提供自助申诉",
            "证据等级只分高／中／低三档", "平台直接联系厂家",
            "审核通过即记为厂家回应", "不设置厂家回应期限",
            "再次投诉，但必须提交与上一案不同的新证据",
            "从最新一次触发时间重新计算2个月", "未入驻",
            "食品问题热度只对外显示“低／中／高”三档")
    require("docs/03j-customer-home-feeding-marketplace.md",
            "待接单 → 待门店确认 → 已确认 → 已结束",
            "附近暂无服务门店", "定位失败时提示顾客手动选择区县",
            "新店必须重新点击确认", "查看双方完整联系方式")
    require("docs/03k-customer-loyalty-points.md",
            "V1积分商城只允许兑换平台实物奖励",
            "自动取消并原路退回本次积分", "顾客不能重新选择门店",
            "实物错发、损坏、少件、无法领取等异常全部由平台在原兑换单处理")
    require("docs/03p-customer-launch-cover-ad.md",
            "总等待上限固定最多2秒", "自定义图片展示3秒且始终允许跳过")
    require("docs/04-staff-miniapp.md",
            "> status: confirmed", "owner_order_attribution_change_reason_required: false",
            "coupon_manual_grant_reason_required: false", "coupon_delete_reason_required: false",
            "boarding_care_action_values: [feeding, walking, cleaning, other]",
            "每条都可选填一句简短说明", "全部门店待办统一归属门店",
            "可以查看该本店顾客的完整手机号", "营业执照仍只有本店老板和平台管理员可看",
            "历史缺少归属的订单统一算本店老板")
    require("docs/03i-customer-screen-blueprint.md",
            "本店推荐", "简版卡片", "不发补改通知",
            "取消／中止后要重新开始必须新开单")
    require("docs/03i-customer-screen-blueprint.md", "不再保留“宠物好友邀请”消息类型")
    require("docs/execution/deepseek-execution-standard.md",
            "只有消费退款、充值退款和免单原因必填", "V1 不提供跨店顾客／宠物档案、服务报告或护理历史导入")
    require("docs/execution/deepseek-start-prompt.md",
            "禁止“更正收款”和直接改余额", "V1不做跨店顾客／宠物档案、服务报告或护理历史导入")

    active = "\n".join(texts.values())
    forbidden = {
        "附近小区的人都在买": "retired homepage product heading",
        "coupon_manual_grant_reason_required: true": "coupon grant reason must be optional",
        "coupon_delete_reason_required: true": "coupon deletion reason must be optional",
        "owner_order_attribution_change_reason_required: true": "attribution reason must be optional",
        "原挂单／退款／调价原因仍必填": "only refunds remain required in this list",
        "护理完成／中止且实际费用明确后可手动挂单，缺原因拒绝": "hold reason must be optional",
        "history_import_confirmer: authenticated_customer_self": "ordinary cross-store import is retired",
        "reward_disabled_store_contact: customer_service_phone_call": "disabled pickup store now auto-cancels and refunds points",
        "所有优惠券与活动统一手动处理": "coupons must be selected and validated at checkout",
        "不自动核销任何券；优惠券及活动券另由门店手动点击核销": "manual coupon redemption is retired",
        "invite_activity_fulfillment: manual_redeem_by_owner_or_active_staff": "activity vouchers redeem only after successful checkout",
        "coupon_checkout_auto_redemption: excluded": "checkout auto-redemption is required",
    }
    for phrase, explanation in forbidden.items():
        if phrase in active:
            add(results, "current.retired_residue", "docs", f"{explanation}: {phrase}")


def audit_engineering_guards(root: Path, results: list[dict[str, str]]) -> None:
    workflow = (root / ".github" / "workflows" / "requirements-audit.yml").read_text(encoding="utf-8")
    for token in (
        "python scripts/audit_requirements.py",
        "node --check prototype/pawdays-full-preview/dist/app.js",
        "node prototype/pawdays-full-preview/verify.mjs",
        "prototype/**",
    ):
        if token not in workflow:
            add(results, "ci.missing_guard", ".github/workflows/requirements-audit.yml", f"missing CI guard: {token}")
    app = (root / "prototype" / "pawdays-full-preview" / "dist" / "app.js").read_text(encoding="utf-8")
    for token in ('querySelectorAll("script,style,link,meta,iframe,object,embed,base")', 'name.startsWith("on")', 'value.startsWith("javascript:")', "replaceChildren"):
        if token not in app:
            add(results, "prototype.safety", "prototype/pawdays-full-preview/dist/app.js", f"missing DOM safety guard: {token}")
    if re.search(r"(?:window\.)?(?:alert|confirm|prompt)\s*\(", app):
        add(results, "prototype.native_dialog", "prototype/pawdays-full-preview/dist/app.js", "native dialog call is forbidden")
    if re.search(r"\.innerHTML\s*=", app):
        add(results, "prototype.raw_inner_html", "prototype/pawdays-full-preview/dist/app.js", "raw innerHTML assignment is forbidden")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--output")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    results: list[dict[str, str]] = []
    audit_metadata(root, results)
    audit_links(root, results)
    audit_acceptance_ids(root, results)
    audit_fields(root, results)
    audit_current_rules(root, results)
    audit_engineering_guards(root, results)
    report = {
        "schema_version": 2,
        "root": root.as_posix(),
        "markdown_file_count": len([p for p in root.rglob("*.md") if ".git" not in p.parts]),
        "errors": len(results),
        "warnings": 0,
        "findings": results,
    }
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 1 if results else 0


if __name__ == "__main__":
    raise SystemExit(main())
