#!/usr/bin/env python3
"""Fail-closed requirements audit. No production code or business defaults are changed."""
from __future__ import annotations
import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote

BASE = '83aeacb6cf1ebe597fc9670f9d5c357a27da334f'
ID = re.compile(r'\bC-[A-Z]+(?:-[A-Z]+)*-\d{2}\b')
LINK = re.compile(r'(?<!!)\[[^\]]+\]\(([^)]+)\)')
HEADING = re.compile(r'^(#{1,6})\s+(.+?)\s*#*\s*$', re.M)


def git_text(ref, path):
    return subprocess.check_output(['git', 'show', f'{ref}:{path}'], text=True)


def section(text, start, end=None):
    a = text.find(start)
    if a < 0:
        raise ValueError('Missing section: '+start)
    b = text.find(end, a+len(start)) if end else -1
    return text[a:b if b >= 0 else None]


def slug(s):
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'[`*_~]', '', s).strip().lower()
    s = re.sub(r'[^\w\-\s\u4e00-\u9fff]', '', s)
    return re.sub(r'\s+', '-', s)


def headings(text):
    counts = Counter(); result = set()
    for m in HEADING.finditer(text):
        raw = slug(m.group(2)); n = counts[raw]; counts[raw] += 1
        result.add(raw if n == 0 else f'{raw}-{n}')
    result.update(re.findall(r'<a\s+(?:name|id)=["\']([^"\']+)', text))
    return result


def audit(root):
    errors=[]; warnings=[]; docs={p.relative_to(root).as_posix():p.read_text(encoding='utf-8') for p in root.rglob('*.md') if '.git' not in p.parts}
    def fail(kind, message): errors.append({'kind':kind,'message':message})
    def warn(kind, message): warnings.append({'kind':kind,'message':message})
    for path, text in docs.items():
        for raw in LINK.findall(text):
            target=unquote(raw.split(' "')[0].strip('<>'))
            if re.match(r'^[a-z][a-z0-9+.-]*:',target,re.I) or target.startswith('//'): continue
            filepart,_,anchor=target.partition('#')
            dest=(root/path).parent.joinpath(filepart or Path(path).name).resolve()
            try: rel=dest.relative_to(root.resolve()).as_posix()
            except ValueError: fail('link',f'{path}: path escapes repository: {target}'); continue
            if rel not in docs:
                if not dest.exists(): fail('link',f'{path}: missing {target}')
                elif anchor: warn('anchor',f'{path}: non-Markdown anchor not checked: {target}')
            elif anchor and anchor not in headings(docs[rel]): fail('anchor',f'{path}: missing {target}')
    idx=docs['docs/03i-customer-screen-blueprint.md']
    table=section(idx,'## 14.1 唯一验收 ID 索引','## 14.2')
    ids=re.findall(r'^\|\s*(C-[A-Z-]+-\d{2})\s*\|',table,re.M)
    for name,n in Counter(ids).items():
        if n!=1: fail('id',f'{name}: {n} definitions in 14.1')
    defined=set(ids)
    for path,text in docs.items():
        if path.endswith('03n-customer-screen-blueprint-extension.md'): continue
        for value in set(ID.findall(text)):
            if value not in defined: fail('id',f'{path}: undefined {value}')
    # Confirmed decisions must not be described as pending in current instructions.
    forbidden=[('docs/03i-customer-screen-blueprint.md',r'03a\s*§?11[^\n]{0,100}(?:待确认|提案未确认)'),('docs/README.md',r'03a[^\n]{0,100}§11[^\n]{0,40}待确认'),('docs/REQUIREMENTS-STATUS.md',r'DEC-APPT-01[^\n]{0,40}待确认')]
    for path,pat in forbidden:
        if re.search(pat,docs[path]): fail('decision',f'{path}: appointment confirmation not synchronized')
    if 'Customer：User 与某一 Merchant 之间的客户关系。' in docs['docs/03g-customer-identity-security.md']:
        fail('identity','03g still requires User for every Customer')
    if '自动取消后释放库存并恢复尚未核销的优惠券' in docs['docs/03f-customer-messages.md']:
        fail('coupon','03f unconditional coupon restore')
    if '默认最小内容高度' in docs['docs/10b-customer-homepage-ui-spec.md']:
        fail('ui','10b mixes default and minimum height')
    # Exact legacy ID definitions are compared against the baseline, not just counted.
    old=git_text(BASE,'docs/03i-customer-screen-blueprint.md')
    oldtab=section(old,'### 14.1 唯一验收 ID 索引','### 14.2')
    olddefs={m.group(1):m.group(2).strip() for m in re.finditer(r'^\|\s*(C-[A-Z-]+-\d{2})\s*\|\s*([^|]+)',oldtab,re.M)}
    newdefs={m.group(1):m.group(2).strip() for m in re.finditer(r'^\|\s*(C-[A-Z-]+-\d{2})\s*\|\s*([^|]+)',table,re.M)}
    for key,value in olddefs.items():
        if key not in newdefs: fail('migration',f'Legacy ID removed: {key}')
        elif value!=newdefs[key]: warn('migration',f'{key}: wording changed; inspect semantic equivalence: {value} -> {newdefs[key]}')
    oldn=git_text(BASE,'docs/03n-customer-screen-blueprint-extension.md')
    olde=git_text(BASE,'docs/03e-customer-products.md')
    currentn=docs['docs/03n-customer-screen-blueprint-extension.md']
    if BASE not in currentn: fail('migration','03n historical base SHA missing')
    for section_name in ['## 4. 寄养详情','## 5. 首页上门喂养','## 6. 上门喂养发布','## 7. “我的”积分','## 8. 每日签到','## 9. 积分商城','## 10. 养宠顾问','## 11. 养宠顾问首次','## 12. 激励广告','## 13. 关键验收','## 14. 原型']:
        if section_name not in oldn: fail('migration',f'Baseline 03n missing expected section {section_name}')
    for term in ['17.4.1','17.5','17.6','17.7','17.8','17.9']:
        if term not in olde or term not in docs['docs/03e-customer-products.md']: fail('migration',f'03e section {term} missing')
    # Large rewrite must retain original requirements; a documented semantic review is required.
    review=docs.get('docs/REQUIREMENTS-REVIEW-20260908.md','')
    if '逐条迁移复核结果' not in review: fail('migration','Missing explicit 03i/03n/03e semantic migration review')
    report={'base':BASE,'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'files':len(docs),'links_checked':sum(len(LINK.findall(t)) for t in docs.values()),'acceptance_ids':len(ids),'errors':errors,'warnings':warnings,'result':'PASS' if not errors else 'FAIL'}
    return report


def main():
    p=argparse.ArgumentParser();p.add_argument('--root',default='.');p.add_argument('--output',default='requirements-audit.json');a=p.parse_args()
    report=audit(Path(a.root).resolve())
    Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report['result']=='PASS' else 1

if __name__=='__main__':sys.exit(main())
