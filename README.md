# AI ROI Calculator – Azure AI Edition

A comprehensive web-based ROI calculator for Azure AI use cases, built with React + TypeScript + Vite.

## Features

- **📊 Dashboard** – Overview of ROI metrics, cumulative cash flow charts, and use-case scorecard
- **🏢 Company Assumptions** – Configure salary, overhead, working hours, discount rate, and planning horizon
- **🤖 AI Models** – Pre-configured Azure OpenAI models (GPT-4o, GPT-4o mini, GPT-3.5 Turbo, Phi-3, etc.) with token pricing; add custom models
- **📋 Use Cases** – Per-use-case ROI sheets (like Excel tabs) with full assumptions including:
  - Number of users & interaction frequency
  - Minutes saved per interaction & automation rate
  - Token usage (input/output) per interaction
  - Implementation cost & ongoing maintenance
  - Live preview of ROI, NPV, payback period
- **🔗 MCP Servers** – Configure Model Context Protocol connections to on-premise systems (SAP, SharePoint, Azure SQL, etc.) with cost modelling
- **📄 Report** – Printable executive summary with per-use-case breakdowns

## Calculations

- **Annual benefit** = Time savings (hours × hourly rate) + Automation savings (fully automated tasks)
- **Annual AI cost** = (Input tokens × input rate + Output tokens × output rate) × annual interactions
- **ROI %** = (Net annual benefit − Implementation cost) / Implementation cost × 100
- **Payback period** = Implementation cost / Net annual benefit (months)
- **NPV** = Discounted cash flows over 3 and 5 years at the configured WACC

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Stack

- **React 19** + TypeScript
- **Vite** (build tool)
- **Recharts** (charts)
- **Lucide React** (icons)

## Azure OpenAI Pricing Reference (May 2025)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| GPT-4o | $5.00 | $15.00 |
| GPT-4o mini | $0.15 | $0.60 |
| GPT-4 Turbo | $10.00 | $30.00 |
| GPT-3.5 Turbo | $0.50 | $1.50 |
| Phi-3 Mini | $0.13 | $0.13 |

> Prices are estimates. Always verify with the [Azure pricing calculator](https://azure.microsoft.com/en-us/pricing/calculator/).
