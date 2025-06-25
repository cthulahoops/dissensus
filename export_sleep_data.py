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

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}", file=sys.stderr)
        return None


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


def export_to_csv(data, filename="sleep_data.csv"):
    """Export the sleep data to CSV format."""
    if not data:
        print("No data to export", file=sys.stderr)
        return False

    # Handle the specific API response structure
    if isinstance(data, dict) and "data" in data:
        api_data = data["data"]
        if "jsonData" in api_data:
            # Parse the JSON string
            try:
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
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON data: {e}", file=sys.stderr)
                return False
        else:
            records = [api_data]
    elif isinstance(data, list):
        records = data
    else:
        records = [data]

    if not records:
        print("No records found in the response", file=sys.stderr)
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
    try:
        with open(filename, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(flattened_records)

        print(f"Successfully exported {len(flattened_records)} records to {filename}")
        return True
    except Exception as e:
        print(f"Error writing CSV file: {e}", file=sys.stderr)
        return False


def main():
    """Main function to fetch data and export to CSV."""
    print("Fetching sleep session data...")
    data = fetch_sleep_data()

    if data is None:
        sys.exit(1)

    print("Data fetched successfully. Exporting to CSV...")

    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sleep_data_{timestamp}.csv"

    if export_to_csv(data, filename):
        print(f"Export completed: {filename}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
