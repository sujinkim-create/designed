
import pandas as pd
import json
import re

def clean_text(text):
    if not isinstance(text, str):
        return {"pattern": "Unknown", "scenario": str(text)}
    
    # Try to extract pattern and scenario if they follow a specific format
    # This is a heuristic based on the user's request for "Pattern" and "Scenario"
    # Adjust regex based on actual data inspection if needed
    
    # Example heuristic: "Pattern: X. Scenario: Y"
    pattern_match = re.search(r'Pattern[:\s]+(.*?)(?:\.|Scenario|$)', text, re.IGNORECASE)
    scenario_match = re.search(r'Scenario[:\s]+(.*)', text, re.IGNORECASE)
    
    pattern = pattern_match.group(1).strip() if pattern_match else "General Grammar"
    scenario = scenario_match.group(1).strip() if scenario_match else text.strip()
    
    return {"pattern": pattern, "scenario": scenario}

try:
    print("Reading parquet file...")
    df = pd.read_parquet('train-00000-of-00001.parquet')
    
    print(f"Loaded {len(df)} rows.")
    
    output_data = []
    
    for idx, row in df.iterrows():
        # Assuming 'text' is the main column, but we fallback to first column if not found
        content = row.get('text', row.iloc[0])
        
        # Parse the structured data
        structured = clean_text(content)
        
        output_data.append({
            "id": idx + 1,
            "pattern": structured['pattern'],
            "scenario": structured['scenario']
        })
        
        if idx % 1000 == 0:
            print(f"Processed {idx} rows...")

    print("Saving to JSON...")
    with open('grammar_db.json', 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print("Done! Saved to grammar_db.json")

except Exception as e:
    print(f"Error: {e}")
