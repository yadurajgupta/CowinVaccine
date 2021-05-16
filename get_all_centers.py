import csv
import json
from datetime import datetime

import requests
from tqdm import tqdm


def getTime():
    now = datetime.now()
    return now.strftime("%I:%M:%S")


def getDate():
    now = datetime.now()
    return now.strftime("%d-%m-%Y")


# API documentation at https://apisetu.gov.in/public/marketplace/api/cowin
# GET list of states https://cdn-api.co-vin.in/api/v2/admin/location/states
# GET list of districts in state https://cdn-api.co-vin.in/api/v2/admin/location/districts/state_id


def get_states():
    response = requests.get(
        "https://cdn-api.co-vin.in/api/v2/admin/location/states",
        headers={
            "authority": "cdn-api.co-vin.in",
            "accept": "*/*",
            "access-control-request-method": "GET",
            "access-control-request-headers": "authorization",
            "origin": "https://selfregistration.cowin.gov.in",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-fetch-dest": "empty",
            "referer": "https://selfregistration.cowin.gov.in/",
            "accept-language": "en-US,en;q=0.9",
        },
    )
    response = json.loads(response.content.decode("utf8"))
    return response["states"]


def get_districts(state_id):
    response = requests.get(
        f"https://cdn-api.co-vin.in/api/v2/admin/location/districts/{state_id}",
        headers={
            "authority": "cdn-api.co-vin.in",
            "accept": "*/*",
            "access-control-request-method": "GET",
            "access-control-request-headers": "authorization",
            "origin": "https://selfregistration.cowin.gov.in",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-fetch-dest": "empty",
            "referer": "https://selfregistration.cowin.gov.in/",
            "accept-language": "en-US,en;q=0.9",
        },
    )
    response = json.loads(response.content.decode("utf8"))
    return response["districts"]


with open("districts.csv", "w", newline="") as district_file:
    with open("states.csv", "w", newline="") as states_file:
        district_file_writer = csv.writer(district_file)
        states_file_writer = csv.writer(states_file)
        district_file_writer.writerow(["state_name", "state_id", "district_name", "district_id"])
        states_file_writer.writerow(["state", "state_id"])
        states = get_states()
        for state in tqdm(states):
            states_file_writer.writerow([state["state_name"], state["state_id"]])
            districts = get_districts(state["state_id"])
            for district in districts:
                district_file_writer.writerow(
                    [state["state_name"], state["state_id"], district["district_name"], district["district_id"]]
                )
