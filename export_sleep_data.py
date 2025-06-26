#!/usr/bin/env python3
"""
Export sleep session data from Consensus Sleep Diary API to CSV format.
"""

import requests
import csv
import json
from datetime import datetime
import sys
import os
import argparse


def fetch_sleep_data():
    """Fetch sleep session data from the API."""
    # Get the API token from environment variable
    api_token = os.getenv('CONSENSUS_API_TOKEN')
    if not api_token:
        print("Error: CONSENSUS_API_TOKEN environment variable not set", file=sys.stderr)
        print("Please set the environment variable or source a .env file with your API token", file=sys.stderr)
        return None
    
    url = "https://app.consensussleepdiary.com/api/v1/sleepsession/"

    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:136.0) Gecko/20100101 Firefox/136.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-GB,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Authorization": f"Bearer {api_token}",
        "DNT": "1",
        "Connection": "keep-alive",
        "Referer": "https://app.consensussleepdiary.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def flatten_dict(d, parent_key="", sep="_"):
    """
    Flatten a nested dictionary for CSV export.
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            # Convert lists to JSON strings
            items.append((new_key, json.dumps(v)))
        else:
            items.append((new_key, v))
    return dict(items)


def map_answers_to_questions(answers):
    """Map the answers array to meaningful question labels."""
    # Based on the sleep diary interface, these are the questions in order
    question_labels = [
        "time_got_into_bed",  # What time did you get into bed?
        "time_tried_to_sleep",  # What time did you try to go to sleep?
        "time_to_fall_asleep_mins",  # How long did it take you to fall asleep? (minutes)
        "times_woke_up_count",  # How many times did you wake up, not counting your final awakening?
        "total_awake_time_mins",  # In total, how long did these awakenings last? (minutes)
        "final_awakening_details",  # Final awakening details [time, time_in_bed_mins, ...]
        "time_got_out_of_bed",  # What time did you get out of bed for the day?
        "sleep_quality_rating",  # How would you rate the quality of your sleep?
        "medication_sleep_aids",  # Sleep medications/aids
        "caffeine_alcohol_1",  # Caffeine/alcohol details 1
        "caffeine_alcohol_2",  # Caffeine/alcohol details 2
        "caffeine_alcohol_3",  # Caffeine/alcohol details 3
        "additional_notes",  # Additional notes
    ]

    mapped_answers = {}
    for i, answer in enumerate(answers):
        if i < len(question_labels):
            label = question_labels[i]
            if isinstance(answer, dict) and "v" in answer:
                mapped_answers[label] = answer["v"]
            elif isinstance(answer, list):
                # Handle nested structures like final awakening details
                if label == "final_awakening_details" and len(answer) >= 2:
                    if isinstance(answer[0], dict) and "v" in answer[0]:
                        mapped_answers["final_awakening_time"] = answer[0]["v"]
                    if isinstance(answer[1], dict) and "v" in answer[1]:
                        mapped_answers["time_in_bed_after_final_awakening_mins"] = (
                            answer[1]["v"]
                        )
                    # Store the full array as JSON for completeness
                    mapped_answers[label] = json.dumps(answer)
                else:
                    mapped_answers[label] = json.dumps(answer)
            else:
                mapped_answers[label] = answer

    return mapped_answers


def process_data(data):
    """Process raw API data into structured records."""
    if not data:
        return None

    # Handle the specific API response structure
    if isinstance(data, dict) and "data" in data:
        api_data = data["data"]
        if "jsonData" in api_data:
            # Parse the JSON string
            json_data = json.loads(api_data["jsonData"])
            if "days" in json_data:
                records = json_data["days"]
                # Process each record
                for record in records:
                    # Add metadata
                    record["uid"] = api_data.get("uid")
                    record["userId"] = api_data.get("userId")
                    record["startedAt"] = api_data.get("startedAt")
                    record["createdAt"] = api_data.get("createdAt")
                    record["updatedAt"] = api_data.get("updatedAt")

                    # Map answers to questions
                    if "answers" in record:
                        mapped_answers = map_answers_to_questions(record["answers"])
                        record.update(mapped_answers)
                        # Remove the raw answers array since we've mapped it
                        del record["answers"]

                    # Handle comments structure
                    if "comments" in record and isinstance(
                        record["comments"], dict
                    ):
                        if "v" in record["comments"]:
                            record["comments"] = record["comments"]["v"]
            else:
                records = [json_data]
        else:
            records = [api_data]
    elif isinstance(data, list):
        records = data
    else:
        records = [data]

    if not records:
        print("No records found in the response", file=sys.stderr)
        return None

    return records


def export_to_csv(records, filename):
    """Export the processed records to CSV format."""
    if not records:
        print("No data to export", file=sys.stderr)
        return False

    # Flatten all records
    flattened_records = []
    for record in records:
        flattened_records.append(flatten_dict(record))

    # Get all unique field names
    fieldnames = set()
    for record in flattened_records:
        fieldnames.update(record.keys())
    fieldnames = sorted(list(fieldnames))

    # Write to CSV
    with open(filename, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(flattened_records)

    print(f"Successfully exported {len(flattened_records)} records to {filename}")
    return True


def export_to_json(records, filename):
    """Export the processed records to JSON format."""
    if not records:
        print("No data to export", file=sys.stderr)
        return False

    with open(filename, "w", encoding="utf-8") as jsonfile:
        json.dump(records, jsonfile, indent=2, ensure_ascii=False)

    print(f"Successfully exported {len(records)} records to {filename}")
    return True


def detect_format_from_filename(filename):
    """Detect output format based on file extension."""
    if filename.lower().endswith('.json'):
        return 'json'
    elif filename.lower().endswith('.csv'):
        return 'csv'
    else:
        return None


def main():
    """Main function to fetch data and export to specified format."""
    parser = argparse.ArgumentParser(
        description="Export sleep session data from Consensus Sleep Diary API"
    )
    parser.add_argument(
        "-f", "--format",
        choices=["csv", "json"],
        help="Output format (csv or json). If not specified, will be detected from output filename."
    )
    parser.add_argument(
        "-o", "--output",
        help="Output filename. If not specified, will generate timestamped filename."
    )
    
    args = parser.parse_args()
    
    print("Fetching sleep session data...")
    data = fetch_sleep_data()

    if data is None:
        sys.exit(1)
    
    # Process the raw API data
    records = process_data(data)
    if not records:
        sys.exit(1)

    print("Data fetched successfully. Processing export...")
    
    # Determine output format and filename
    output_format = args.format
    output_file = args.output
    
    # If no output file specified, generate timestamped filename
    if not output_file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if output_format == "json":
            output_file = f"sleep_data_{timestamp}.json"
        else:
            output_file = f"sleep_data_{timestamp}.csv"
            output_format = "csv"  # default to CSV if no format specified
    
    # If no format specified, try to detect from filename
    if not output_format:
        detected_format = detect_format_from_filename(output_file)
        if detected_format:
            output_format = detected_format
        else:
            print("Warning: Could not detect format from filename. Defaulting to CSV.")
            output_format = "csv"
    
    # Export data in the specified format
    success = False
    if output_format == "json":
        success = export_to_json(records, output_file)
    else:
        success = export_to_csv(records, output_file)
    
    if success:
        print(f"Export completed: {output_file}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
