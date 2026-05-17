import csv
import json


def csv_to_json(input: str, output: str) -> None:
    data = []

    with open(input) as csv_file:
        reader = csv.DictReader(csv_file)
        list_of_data = []

        for row in reader:
            data = []

            for key, value in row.items():
                data.append(value)

            list_of_data.append(data)

    with open(output, "w", encoding="utf-8") as json_file:
        json.dump(list_of_data, json_file, indent=2)

    print(f"✅ Dane z {input} zapisane do: {output}")