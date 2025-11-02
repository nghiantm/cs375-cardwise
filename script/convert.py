import pandas as pd

# filepath: c:\Users\nghia\Desktop\project\cc_scrape\script\processed\reward_output.csv
csv_path = r"./processed/reward_output.csv"

# Read the CSV, skipping any comment lines (e.g. lines that start with //)
df = pd.read_csv(csv_path, comment='/', header=None, names=['card', 'category', 'cashback_pct', 'point_mul'])

# Determine the equivalent value:
# If cashback_pct is non-zero, use it; otherwise, use point_mul.
df['computed_value'] = df['cashback_pct'].mask(df['cashback_pct'] == 0, df['point_mul'])

# Create the three new columns using the computed_value
df['point_cashback_equiv'] = df['computed_value']
df['point_travel_equiv'] = df['computed_value']
df['point_giftcard_equiv'] = df['computed_value']

# Optionally drop the computed_value helper column
df.drop(columns='computed_value', inplace=True)

# Save the updated CSV (overwriting the original file)
df.to_csv(csv_path, index=False)