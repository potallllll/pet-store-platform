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
    for path, text in current_text.items():
        if "blocked_by:" in text.split("\n## ", 1)[0] and "DEC-APPT-01" in metadata(text).get("blocked_by", ""):
            add(results, "error", "appointment.stale_blocker", Path(path), "closed DEC-APPT-01 remains in blocked_by")

    prohibited = {
        "独立风险查询入口": "cross-store risk lookup must not become an arbitrary standalone query",
        "不确认此前建议的客户页全部结构": "customer page structure was subsequently confirmed",
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
