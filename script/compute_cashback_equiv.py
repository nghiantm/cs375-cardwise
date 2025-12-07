#!/usr/bin/env python3
"""
Compute cashback equivalent percentage for reward rows.

For each row in reward_output.csv:
- Join with info_output.csv on card_id to get bank_id
- If point_mul > 0: cashback_equiv_pct = point_mul * bank_conversion_factor
- Else (cashback_pct > 0): cashback_equiv_pct = cashback_pct
- Output to script/final/reward_with_equivalents.csv

Bank conversion factors (points to % equivalent):
- bank_of_america: 0.5 (1 point = 0.5% cashback)
- chase: 0.5 (1 point = 0.5% cashback)
- discover: 1.0 (1 point = 1% cashback)
"""
import csv
import sys
from pathlib import Path

# Bank conversion factors: 1 point = X% cashback equivalent
BANK_CONVERSION_FACTORS = {
    'bank_of_america': 1,
    'chase': 1,
    'discover': 1,
}

def load_bank_ids(info_path):
    """Load card_id -> bank_id mapping from info_output.csv"""
    mapping = {}
    try:
        with open(info_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                card_id = row.get('card_id', '').strip()
                bank_id = row.get('bank_id', '').strip()
                if card_id:
                    mapping[card_id] = bank_id
    except Exception as e:
        print(f"Error loading info CSV: {e}")
        sys.exit(1)
    return mapping

def compute_cashback_equiv(cashback_pct, point_mul, bank_id):
    """Compute cashback equivalent percentage."""
    if point_mul > 0:
        factor = BANK_CONVERSION_FACTORS.get(bank_id, 0.5)
        return point_mul * factor
    else:
        return cashback_pct

def main():
    repo_root = Path(__file__).resolve().parent.parent
    
    info_path = repo_root / 'script' / 'processed' / 'info_output.csv'
    reward_path = repo_root / 'script' / 'processed' / 'reward_output.csv'
    output_path = repo_root / 'script' / 'processed' / 'reward_output_cashback_equiv_processed.csv'
    
    # Validate inputs
    if not info_path.is_file():
        print(f"Info CSV not found: {info_path}")
        sys.exit(1)
    if not reward_path.is_file():
        print(f"Reward CSV not found: {reward_path}")
        sys.exit(1)
    
    print(f"Loading bank_id mapping from {info_path}")
    bank_ids = load_bank_ids(info_path)
    print(f"Loaded {len(bank_ids)} cards")
    
    print(f"Processing rewards from {reward_path}")
    rows_processed = 0
    rows_with_error = 0
    
    try:
        # Read and process rows, write to output file directly
        with open(reward_path, newline='', encoding='utf-8') as infile, \
             open(output_path, 'w', newline='', encoding='utf-8') as outfile:
            
            reader = csv.DictReader(infile)
            fieldnames = ['card_id', 'category', 'cashback_pct', 'point_mul', 'cashback_equiv_pct']
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for row in reader:
                try:
                    card_id = row.get('card_id', '').strip()
                    category = row.get('category', '').strip()
                    cashback_pct = int(row.get('cashback_pct', 0))
                    point_mul = int(row.get('point_mul', 0))
                    
                    bank_id = bank_ids.get(card_id, 'unknown')
                    cashback_equiv = compute_cashback_equiv(cashback_pct, point_mul, bank_id)
                    
                    writer.writerow({
                        'card_id': card_id,
                        'category': category,
                        'cashback_pct': cashback_pct,
                        'point_mul': point_mul,
                        'cashback_equiv_pct': cashback_equiv,
                    })
                    rows_processed += 1
                except Exception as e:
                    print(f"Error processing row {rows_processed + 1}: {e}")
                    rows_with_error += 1
        
        print(f"✓ Output written to {output_path}")
        print(f"  Rows processed: {rows_processed}")
        if rows_with_error > 0:
            print(f"  Rows with errors: {rows_with_error}")
    except Exception as e:
        print(f"Error writing output: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
