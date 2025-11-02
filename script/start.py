#!/usr/bin/env python3
"""
Script: Process all CSV files in a directory through an LLM API (gpt-4.1-nano)
         using a specified prompt file, and aggregate results into a single CSV.

Prerequisites:
  - Python 3.8+
  - `openai` library (`pip install openai`)
  - Set environment variable OPENAI_API_KEY
  - Create a `prompt.txt` file in the working directory containing your transformation prompt.

Usage:
  1. Place your input CSV files in `./csv_files/` (or modify `input_dir`).
  2. Write your transformation prompt into `prompt.txt`.
  3. Run: python transform_csv_with_llm.py

Output:
  - `combined_output.csv` in the working directory.
"""
import os
import glob
import subprocess
import sys
import json
import openai
import csv
from dotenv import load_dotenv
import google.generativeai as genai

INPUT_DIR = "./raw/"
OUTPUT_DIR = "./processed/"
PROMPT_DIR = "./prompt/"

def load_prompt(prompt_file: str = "prompt.txt") -> str:
    """
    Load the LLM transformation prompt from a text file.
    """
    if not os.path.isfile(prompt_file):
        raise FileNotFoundError(f"Prompt file '{prompt_file}' not found.")
    with open(prompt_file, "r", encoding="utf-8") as pf:
        prompt = pf.read().strip()
    if not prompt:
        raise ValueError(f"Prompt file '{prompt_file}' is empty.")
    return prompt


def transform_with_llm(content: str, prompt: str) -> str:
    """
    Call the LLM API with the given prompt + content and return the transformed CSV text.
    """
    messages = [
        {"role": "system", "content": f"{prompt}"},
        {"role": "user", "content": f"{content}"}
    ]
    response = openai.chat.completions.create(
        model="gpt-4.1",
        messages=messages,
        temperature=0
    )

    return response.choices[0].message.content.strip()
    '''
    model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')
    chat = model.start_chat()
    response = chat.send_message(f"{prompt}\n\n{content}")
    return response.text.strip()
    '''
    
def run_all_py_files(folder_path):
    py_files = sorted(glob.glob(os.path.join(folder_path, "*.py")))
    for py_file in py_files:
        print(f"Running {py_file}...")
        # Use subprocess to run the file
        result = subprocess.run([sys.executable, py_file], capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(f"Error in {py_file}:\n{result.stderr}")

def combine_json_files(input_dir: str) -> list:
    combined = []
    json_files = sorted(glob.glob(os.path.join(input_dir, "*.json")))
    if not json_files:
        print(f"No JSON files found in {input_dir}.")
        return combined

    for file_path in json_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            # If each file contains a list of objects, extend the combined list.
            if isinstance(data, list):
                combined.extend(data)
            else:
                combined.append(data)
        except json.JSONDecodeError as e:
            print(f"Error decoding {file_path}: {e}")
    return combined

def main():
    load_dotenv()
    # Load API key
    openai.api_key = os.getenv("OPENAI_API_KEY")
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    if not openai.api_key:
        raise ValueError("Please set the OPENAI_API_KEY environment variable.")

    reward_output_path = OUTPUT_DIR + "reward_output.csv"
    info_output_path = OUTPUT_DIR + "info_output.csv"

    # Load transformation prompt from file
    reward_prompt = load_prompt(PROMPT_DIR + "reward_prompt.txt")
    info_prompt = load_prompt(PROMPT_DIR + "info_prompt.txt")

    # Find all CSV files in the input directory
    combined_json = combine_json_files(INPUT_DIR)
    if not combined_json:
        print(f"No valid JSON files found in {INPUT_DIR}.")
        return

    #reward_header = "card_id,category,cashback_pct,point_mul"
    #print(f"Found JSON files. Processing...")
    #with open(reward_output_path, "w", encoding="utf-8") as out_f:
    #    #out_f.write(reward_header + "\n")
    #    transformed = transform_with_llm(combined_json, reward_prompt)
    #    out_f.write(transformed + "\n")

    #print(f"Combined output written to {reward_output_path}")

    info_header = "card_id,card_name,card_type,bank_id,img_url,annual_fee,perks"
    with open(info_output_path, "w", encoding="utf-8") as out_f:
        out_f.write(info_header + "\n")
        transformed = transform_with_llm(combined_json, info_prompt)
        out_f.write(transformed + "\n", )

    print(f"Combined output written to {info_output_path}")

if __name__ == "__main__":
    #run_all_py_files("scrape/")

    main()
