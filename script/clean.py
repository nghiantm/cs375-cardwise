import re

# filepath: script/processed/info_output.csv
input_path = r"./processed/info_output.csv"
output_path = r"./processed/info_output_cleaned.csv"

# Read the content of the CSV file
with open(input_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove all occurrences of "\x"
clean_content = re.sub(r'\\x', '', content)

# Write the cleaned content to a new file
with open(output_path, "w", encoding="utf-8") as f:
    f.write(clean_content)

print(f"Cleaned CSV written to {output_path}")