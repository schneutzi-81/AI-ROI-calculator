# AI-ROI-calculator

This repository contains a source-only Excel calculator generator to make a quick AI ROI case for the Messe Berlin GenAI Platform Azure estimate.

## Source-only workbook workflow

GitHub stores the workbook source files, not the generated binary `.xlsx` file. The Excel workbook is generated locally from:

- `data/azure_estimate.csv` — editable Azure cost line items and cost type classifications.
- `scripts/generate_roi_excel.py` — pure Python standard-library workbook generator.

The generated `Messe_Berlin_GenAI_ROI_Calculator.xlsx` file is ignored by Git so it can be created, opened in Excel, and shared separately without pushing a binary file to GitHub.

## Build the Excel workbook

Run either command from the repository root:

```bash
make build
```

or:

```bash
python scripts/generate_roi_excel.py
```

This creates `Messe_Berlin_GenAI_ROI_Calculator.xlsx` locally.

## Workbook contents

The generated workbook includes:

- Editable assumptions for adoption, working days, minutes saved, loaded hourly cost, productivity realization, other monthly costs, one-time implementation cost, and scaling buffers.
- Default ROI scenarios for 50 users, 100 users, and 1,000 users.
- Azure cost assumptions based on the provided Microsoft Azure estimate total of €1,283.75/month, split into fixed platform cost plus variable GPT-4o and embedding usage.

## Validate the build

Run:

```bash
make check
```

The check target compiles the Python generator, builds the workbook locally, and validates the generated `.xlsx` ZIP structure.
