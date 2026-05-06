.PHONY: build check clean

build:
	python scripts/generate_roi_excel.py

check:
	python -m py_compile scripts/generate_roi_excel.py
	python scripts/generate_roi_excel.py
	unzip -t Messe_Berlin_GenAI_ROI_Calculator.xlsx

clean:
	rm -f Messe_Berlin_GenAI_ROI_Calculator.xlsx
