#!/usr/bin/env python3
"""Generate the Messe Berlin GenAI Azure ROI calculator workbook.

The workbook is intentionally generated with only Python's standard library so it
can be recreated in lightweight environments without Excel-specific packages.
"""

from __future__ import annotations

import csv
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT = REPO_ROOT / "Messe_Berlin_GenAI_ROI_Calculator.xlsx"
AZURE_ESTIMATE_CSV = REPO_ROOT / "data" / "azure_estimate.csv"

AZURE_CSV_HEADERS = [
    "Service category",
    "Service type",
    "Custom name",
    "Region",
    "Description",
    "Estimated monthly cost",
    "Estimated upfront cost",
    "Cost type",
]


def parse_euro_amount(value: str) -> float:
    """Parse a CSV euro amount stored as a plain or localized decimal string."""
    normalized = value.strip().replace("€", "")
    if "," in normalized:
        normalized = normalized.replace(".", "").replace(",", ".")
    return float(normalized or 0)


def load_azure_line_items(path: Path = AZURE_ESTIMATE_CSV) -> list[list[Any]]:
    """Load Azure estimate rows from a human-editable CSV source file."""
    with path.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        if reader.fieldnames != AZURE_CSV_HEADERS:
            raise ValueError(f"Expected CSV headers {AZURE_CSV_HEADERS}, got {reader.fieldnames}")

        return [
            [
                row["Service category"],
                row["Service type"],
                row["Custom name"],
                row["Region"],
                row["Description"],
                parse_euro_amount(row["Estimated monthly cost"]),
                parse_euro_amount(row["Estimated upfront cost"]),
                row["Cost type"],
            ]
            for row in reader
        ]

SCENARIOS = [50, 100, 1000]


@dataclass
class Cell:
    value: Any = None
    style: int | None = None
    formula: str | None = None


class Sheet:
    def __init__(self, name: str, widths: dict[int, float] | None = None):
        self.name = name
        self.cells: dict[tuple[int, int], Cell] = {}
        self.widths = widths or {}
        self.merges: list[str] = []

    def set(self, row: int, col: int, value: Any = None, style: int | None = None, formula: str | None = None) -> None:
        self.cells[(row, col)] = Cell(value, style, formula)

    def merge(self, ref: str) -> None:
        self.merges.append(ref)


def col_name(col: int) -> str:
    name = ""
    while col:
        col, rem = divmod(col - 1, 26)
        name = chr(65 + rem) + name
    return name


def cell_ref(row: int, col: int) -> str:
    return f"{col_name(col)}{row}"


def xml_text(value: Any) -> str:
    return escape(str(value), {'"': '&quot;'})


def build_sheet_xml(sheet: Sheet) -> str:
    max_row = max((r for r, _ in sheet.cells), default=1)
    max_col = max((c for _, c in sheet.cells), default=1)
    parts = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
        f'<dimension ref="A1:{cell_ref(max_row, max_col)}"/>',
        '<sheetViews><sheetView workbookViewId="0"/></sheetViews>',
        '<sheetFormatPr defaultRowHeight="15"/>',
    ]
    if sheet.widths:
        parts.append('<cols>')
        for col, width in sorted(sheet.widths.items()):
            parts.append(f'<col min="{col}" max="{col}" width="{width}" customWidth="1"/>')
        parts.append('</cols>')
    parts.append('<sheetData>')
    for row in range(1, max_row + 1):
        row_cells = [(c, sheet.cells[(row, c)]) for c in range(1, max_col + 1) if (row, c) in sheet.cells]
        if not row_cells:
            continue
        parts.append(f'<row r="{row}">')
        for col, cell in row_cells:
            ref = cell_ref(row, col)
            style = f' s="{cell.style}"' if cell.style is not None else ''
            if cell.formula:
                cached = cell.value if cell.value is not None else 0
                parts.append(f'<c r="{ref}"{style}><f>{xml_text(cell.formula)}</f><v>{cached}</v></c>')
            elif isinstance(cell.value, (int, float)) and not isinstance(cell.value, bool):
                parts.append(f'<c r="{ref}"{style}><v>{cell.value}</v></c>')
            elif cell.value is None:
                parts.append(f'<c r="{ref}"{style}/>')
            else:
                parts.append(f'<c r="{ref}" t="inlineStr"{style}><is><t>{xml_text(cell.value)}</t></is></c>')
        parts.append('</row>')
    parts.append('</sheetData>')
    if sheet.merges:
        parts.append(f'<mergeCells count="{len(sheet.merges)}">')
        for ref in sheet.merges:
            parts.append(f'<mergeCell ref="{ref}"/>')
        parts.append('</mergeCells>')
    parts.append('<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>')
    parts.append('</worksheet>')
    return ''.join(parts)


def styles_xml() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="4">
    <numFmt numFmtId="164" formatCode="€#,##0.00;[Red]-€#,##0.00"/>
    <numFmt numFmtId="165" formatCode="0.0%"/>
    <numFmt numFmtId="166" formatCode="0.0"/>
    <numFmt numFmtId="167" formatCode="#,##0"/>
  </numFmts>
  <fonts count="3">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="14"/><name val="Calibri"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1F4E78"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD9EAF7"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="9">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>'''


def make_inputs() -> Sheet:
    s = Sheet("Inputs", {1: 34, 2: 18, 3: 70})
    s.set(1, 1, "Messe Berlin GenAI Platform ROI Calculator", 1)
    s.merge("A1:C1")
    s.set(3, 1, "Input metric", 2); s.set(3, 2, "Value", 2); s.set(3, 3, "Description", 2)
    inputs = [
        ("Adoption rate", 0.70, "Share of total users actively using the GenAI platform", 5),
        ("Working days per month", 21, "Average business days per month", 7),
        ("Minutes saved per active user per day", 10, "Editable productivity assumption", 6),
        ("Average loaded hourly cost", 45, "Salary plus employer cost", 4),
        ("Productivity realization factor", 0.60, "Conservative factor for monetizable saved time", 5),
        ("Other monthly costs", 0, "Support, training, licenses, operations, etc.", 4),
        ("One-time implementation cost", 0, "Consulting, setup, migration, internal rollout", 4),
        ("Baseline users for Azure estimate", 100, "Current Azure token estimate is treated as the 100-user baseline", 7),
        ("Scaling buffer - 50 users", 0.00, "Optional infrastructure buffer", 5),
        ("Scaling buffer - 100 users", 0.00, "Optional infrastructure buffer", 5),
        ("Scaling buffer - 1,000 users", 0.30, "Planning buffer for larger rollout", 5),
    ]
    for idx, (label, value, desc, value_style) in enumerate(inputs, 4):
        s.set(idx, 1, label, 8)
        s.set(idx, 2, value, value_style)
        s.set(idx, 3, desc, 8)
    s.set(17, 1, "Edit the values in column B to update the ROI Matrix formulas.", 3)
    s.merge("A17:C17")
    return s


def make_azure_base(azure_line_items: list[list[Any]]) -> Sheet:
    s = Sheet("Azure Cost Base", {1: 24, 2: 28, 3: 38, 4: 18, 5: 80, 6: 18, 7: 18, 8: 20})
    s.set(1, 1, "Microsoft Azure Estimate - Messe Berlin GenAI Platform", 1)
    s.merge("A1:H1")
    headers = ["Service category", "Service type", "Custom name", "Region", "Description", "Monthly cost", "Upfront cost", "Cost type"]
    for col, header in enumerate(headers, 1):
        s.set(3, col, header, 2)
    for r, item in enumerate(azure_line_items, 4):
        for c, value in enumerate(item, 1):
            style = 4 if c in (6, 7) else 8
            s.set(r, c, value, style)
    total_row = 4 + len(azure_line_items)
    s.set(total_row, 5, "Total", 2)
    s.set(total_row, 6, None, 4, f"SUM(F4:F{total_row-1})")
    s.set(total_row, 7, None, 4, f"SUM(G4:G{total_row-1})")
    fixed_row = total_row + 2
    s.set(fixed_row, 5, "Fixed platform cost", 3)
    s.set(fixed_row, 6, None, 4, f'SUMIF(H4:H{total_row-1},"Fixed",F4:F{total_row-1})')
    s.set(fixed_row + 1, 5, "GPT-4o variable cost at 100 users", 3)
    s.set(fixed_row + 1, 6, None, 4, f'SUMIF(H4:H{total_row-1},"Variable GPT",F4:F{total_row-1})')
    s.set(fixed_row + 2, 5, "Embedding variable cost at 100 users", 3)
    s.set(fixed_row + 2, 6, None, 4, f'SUMIF(H4:H{total_row-1},"Variable Embedding",F4:F{total_row-1})')
    return s


def make_roi_matrix(azure_summary_start_row: int) -> Sheet:
    s = Sheet("ROI Matrix", {1: 42, 2: 18, 3: 18, 4: 18, 5: 60})
    s.set(1, 1, "ROI Matrix by User Scenario", 1)
    s.merge("A1:E1")
    s.set(3, 1, "Metric", 2)
    for i, users in enumerate(SCENARIOS, 2):
        s.set(3, i, f"{users} users", 2)
    s.set(3, 5, "Formula / explanation", 2)

    rows = [
        ("Users", [50, 100, 1000], None, "Scenario user count", 7),
        ("Active users", [None]*3, "{col}4*Inputs!$B$4", "Users x adoption rate", 7),
        ("Fixed Azure platform cost", [None]*3, f"'Azure Cost Base'!$F${azure_summary_start_row}", "Fixed services from Azure estimate", 4),
        ("GPT-4o usage cost", [None]*3, f"'Azure Cost Base'!$F${azure_summary_start_row + 1}*({{col}}$4/Inputs!$B$11)", "Scales with users from 100-user baseline", 4),
        ("Embedding usage cost", [None]*3, f"'Azure Cost Base'!$F${azure_summary_start_row + 2}*({{col}}$4/Inputs!$B$11)", "Scales with users from 100-user baseline", 4),
        ("Estimated Azure monthly cost", [None]*3, "SUM({col}6:{col}8)", "Fixed + GPT + embeddings", 4),
        ("Estimated Azure annual cost", [None]*3, "{col}9*12", "Monthly Azure cost x 12", 4),
        ("Azure cost per user / month", [None]*3, "{col}9/{col}$4", "Azure monthly cost divided by users", 4),
        ("Azure cost per user / year", [None]*3, "{col}10/{col}$4", "Azure annual cost divided by users", 4),
        ("Other monthly costs", [None]*3, "Inputs!$B$9", "Editable support/training/operations cost", 4),
        ("Monthly productivity benefit", [None]*3, "{col}$4*Inputs!$B$4*Inputs!$B$5*Inputs!$B$6/60*Inputs!$B$7*Inputs!$B$8", "Users x adoption x days x minutes / 60 x hourly cost x realization", 4),
        ("Monthly net benefit", [None]*3, "{col}14-{col}9-{col}13", "Benefit minus Azure and other monthly costs", 4),
        ("Annual net benefit", [None]*3, "{col}15*12", "Monthly net benefit x 12", 4),
        ("ROI %", [None]*3, "{col}15/({col}9+{col}13)", "Monthly net benefit / monthly cost", 5),
        ("One-time implementation cost", [None]*3, "Inputs!$B$10", "Editable one-time project cost", 4),
        ("Payback period in months", [None]*3, "IF({col}15>0,{col}18/{col}15,\"No payback\")", "Implementation cost / monthly net benefit", 6),
        ("Break-even minutes / active user / day", [None]*3, "({col}9+{col}13)*60/({col}$4*Inputs!$B$4*Inputs!$B$5*Inputs!$B$7*Inputs!$B$8)", "Minutes saved needed to cover monthly cost", 6),
        ("Scaling buffer", [None]*3, None, "Optional buffer; sourced from Inputs", 5),
        ("Azure monthly cost incl. buffer", [None]*3, "{col}9*(1+{col}21)", "Azure monthly cost with selected buffer", 4),
    ]
    for r_offset, (metric, values, formula, explanation, style) in enumerate(rows, 4):
        row = r_offset
        s.set(row, 1, metric, 8)
        for c_idx, col in enumerate(range(2, 5)):
            letter = col_name(col)
            if metric == "Scaling buffer":
                input_row = {2: 12, 3: 13, 4: 14}[col]
                s.set(row, col, None, 5, f"Inputs!$B${input_row}")
            elif formula:
                s.set(row, col, None, style, formula.format(col=letter))
            else:
                s.set(row, col, values[c_idx], style)
        s.set(row, 5, explanation, 8)
    s.set(25, 1, "Default productivity assumptions: 70% adoption, 21 working days/month, 10 minutes saved per active user/day, €45 loaded hourly cost, 60% realization.", 3)
    s.merge("A25:E25")
    return s


def workbook_xml(sheets: list[Sheet]) -> str:
    sheet_entries = ''.join(
        f'<sheet name="{escape(sheet.name)}" sheetId="{idx}" r:id="rId{idx}"/>'
        for idx, sheet in enumerate(sheets, 1)
    )
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>{sheet_entries}</sheets>
  <calcPr calcId="0" fullCalcOnLoad="1" forceFullCalc="1"/>
</workbook>'''


def workbook_rels(sheets: list[Sheet]) -> str:
    rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    ]
    for idx in range(1, len(sheets) + 1):
        rels.append(f'<Relationship Id="rId{idx}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{idx}.xml"/>')
    rels.append(f'<Relationship Id="rId{len(sheets)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>')
    rels.append('</Relationships>')
    return ''.join(rels)


def content_types(sheets: list[Sheet]) -> str:
    overrides = ''.join(
        f'<Override PartName="/xl/worksheets/sheet{idx}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for idx in range(1, len(sheets) + 1)
    )
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  {overrides}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>'''


def root_rels() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>'''


def core_props() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Messe Berlin GenAI ROI Calculator</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-05-06T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-05-06T00:00:00Z</dcterms:modified>
</cp:coreProperties>'''


def app_props() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
</Properties>'''


def write_workbook() -> None:
    azure_line_items = load_azure_line_items()
    azure_summary_start_row = 4 + len(azure_line_items) + 2
    sheets = [
        make_inputs(),
        make_azure_base(azure_line_items),
        make_roi_matrix(azure_summary_start_row),
    ]
    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types(sheets))
        zf.writestr("_rels/.rels", root_rels())
        zf.writestr("docProps/core.xml", core_props())
        zf.writestr("docProps/app.xml", app_props())
        zf.writestr("xl/workbook.xml", workbook_xml(sheets))
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels(sheets))
        zf.writestr("xl/styles.xml", styles_xml())
        for idx, sheet in enumerate(sheets, 1):
            zf.writestr(f"xl/worksheets/sheet{idx}.xml", build_sheet_xml(sheet))


if __name__ == "__main__":
    write_workbook()
    print(f"Wrote {OUTPUT}")
