#!/usr/bin/env python3
"""
Insert CSV contents into MongoDB collections `info` and `reward`.

Defaults:
- Mongo URI: from env var `MONGODB_URI` or `mongodb://localhost:27017`
- DB name: from env var `MONGODB_DB` or `cardwise`
- Info CSV default: `script/processed/info_output.csv`
- Reward CSV default: `script/processed/reward_output.csv`

Usage examples:
    python script/insert_csv_to_mongo.py
    python script/insert_csv_to_mongo.py --info ./script/processed/info_output.csv --reward ./script/processed/reward_output.csv --mongo-uri "mongodb://user:pass@host:27017"
"""
import os
import argparse
import csv
import sys
from pathlib import Path
from pymongo import MongoClient, errors
from dotenv import load_dotenv


def parse_int(value, default=0):
    if value is None:
        return default
    try:
        v = str(value).strip()
        if v == "":
            return default
        return int(float(v))
    except Exception:
        return default


def upsert_info(coll, filepath):
    inserted = 0
    updated = 0
    with open(filepath, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if 'card_id' not in row or not row['card_id'].strip():
                continue
            doc = {
                'card_id': row.get('card_id','').strip(),
                'card_name': row.get('card_name','').strip(),
                'card_type': row.get('card_type','').strip(),
                'bank_id': row.get('bank_id','').strip(),
                'img_url': row.get('img_url','').strip(),
                'annual_fee': parse_int(row.get('annual_fee'), 0),
            }
            filt = {'card_id': doc['card_id']}
            res = coll.replace_one(filt, doc, upsert=True)
            if res.matched_count == 0 and res.upserted_id is not None:
                inserted += 1
            elif res.matched_count == 1:
                updated += 1
    return inserted, updated


def upsert_reward(coll, filepath):
    inserted = 0
    updated = 0
    with open(filepath, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if 'card_id' not in row or not row['card_id'].strip():
                continue
            card_id = row.get('card_id','').strip()
            category = row.get('category','').strip()
            doc = {
                'card_id': card_id,
                'category': category,
                'cashback_pct': parse_int(row.get('cashback_pct'), 0),
                'point_mul': parse_int(row.get('point_mul'), 0),
            }
            filt = {'card_id': card_id, 'category': category}
            res = coll.replace_one(filt, doc, upsert=True)
            if res.matched_count == 0 and res.upserted_id is not None:
                inserted += 1
            elif res.matched_count == 1:
                updated += 1
    return inserted, updated


def ensure_indexes(db):
    info_coll = db['info']
    reward_coll = db['reward']
    try:
        info_coll.create_index('card_id', unique=True)
        reward_coll.create_index([('card_id', 1), ('category', 1)], unique=True)
    except errors.OperationFailure as e:
        print(f"Warning: could not create unique index: {e}")


def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description='Insert CSVs into MongoDB collections info and reward')
    parser.add_argument('--mongo-uri', default=os.getenv('MONGODB_URI', 'mongodb://localhost:27017'), help='MongoDB URI')
    parser.add_argument('--db', default=os.getenv('MONGODB_DB', 'cardwise'), help='Database name')

    # Resolve defaults relative to the project root (two levels up from this file: repo_root)
    repo_root = Path(__file__).resolve().parent.parent
    default_info = repo_root / 'script' / 'processed' / 'info_output.csv'
    default_reward = repo_root / 'script' / 'processed' / 'reward_output.csv'

    parser.add_argument('--info', default=str(default_info), help='Path to info CSV')
    parser.add_argument('--reward', default=str(default_reward), help='Path to reward CSV')
    args = parser.parse_args()

    # Validate files exist
    if not os.path.isfile(args.info):
        print(f"Info CSV not found: {args.info}")
        sys.exit(2)
    if not os.path.isfile(args.reward):
        print(f"Reward CSV not found: {args.reward}")
        sys.exit(2)

    print(f"Connecting to MongoDB at {args.mongo_uri}, db={args.db}")
    try:
        client = MongoClient(args.mongo_uri, serverSelectionTimeoutMS=5000)
        # Trigger server selection to fail fast if unreachable
        client.admin.command('ping')
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)

    db = client[args.db]
    ensure_indexes(db)

    info_coll = db['info']
    reward_coll = db['reward']

    print(f"Upserting info from {args.info} -> {args.db}.info")
    i_ins, i_upd = upsert_info(info_coll, args.info)
    print(f"Info: inserted={i_ins}, updated={i_upd}")

    print(f"Upserting reward from {args.reward} -> {args.db}.reward")
    r_ins, r_upd = upsert_reward(reward_coll, args.reward)
    print(f"Reward: inserted={r_ins}, updated={r_upd}")

    print('Done')


if __name__ == '__main__':
    main()
