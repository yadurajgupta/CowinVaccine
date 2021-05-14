import json
import traceback
from datetime import datetime, timedelta
from time import sleep

import pandas as pd
import requests
from beepy import beep

# API documentation at              https://apisetu.gov.in/public/marketplace/api/cowin
# GET list of states                https://cdn-api.co-vin.in/api/v2/admin/location/states
# GET list of districts in state    https://cdn-api.co-vin.in/api/v2/admin/location/districts/state_id
# Look at the districts.csv and states.csv (generted by get_all_centers.py)
districts_names = [
    "Gurgaon",
]

vaccine = [
    # "COVAXIN",
    "COVISHIELD",
]

min_age_limit = [
    # 18,
    45,
]
date_to_look_from = 1  # (0 means today slot also works) (1 would mean look for slots from tommorow)
min_available_seats = 0
debug = False  # True remove min availibility
DISTRICT_INFO = None


def get_time():
    return datetime.now().strftime("%I:%M:%S")


def get_date(extra_ahead=0):
    return (datetime.now() + timedelta(days=extra_ahead)).strftime("%d-%m-%Y")


def get_district_info(names):
    districts_df = pd.read_csv("districts.csv")
    districts_df["district_name"] = districts_df["district_name"].str.lower()
    curr_districts = []
    for name in names:
        name = name.lower()
        if len(districts_df[districts_df["district_name"] == name]) == 1:
            row = districts_df[districts_df["district_name"] == name]
            index = row.index[0]
            curr_districts.append(
                districts_df[districts_df["district_name"].str.lower() == name.lower()].to_dict(orient="index")[index]
            )
        else:
            print("SOMETHING WRONG IN DISTRICT NAMES")
            print(f"{name} matching {len(districts_df[districts_df['district_name'] == name])} rows")
            if len(districts_df[districts_df["district_name"] == name]):
                print(districts_df[districts_df["district_name"]])
            raise Exception(f"CHECK DISTRICT NAMES")
    return curr_districts


def parse_sessions(session_infos):
    available = []
    for session in session_infos:
        if (
            (int(session["available_capacity"]) > min_available_seats or debug)
            and (int(session["min_age_limit"]) in min_age_limit)
            and (session["vaccine"] in vaccine)
        ):
            available.append(session)
    return available


def parse_center_info(center_info):
    available_sessions = parse_sessions(center_info["sessions"])
    if len(available_sessions) > 0 or debug:
        possible_sessions = []
        for session in available_sessions:
            possible_sessions.append(
                {
                    "name": center_info["name"],
                    "pincode": center_info["pincode"],
                    # "address": center_info["address"],
                    # "state_name": center_info["state_name"],
                    "district_name": center_info["district_name"],
                    "fee_type": center_info["fee_type"],
                    "session_date": session["date"],
                    "available_capacity": int(session["available_capacity"]),
                    "min_age_limit": int(session["min_age_limit"]),
                    "vaccine": session["vaccine"],
                }
            )
        return possible_sessions
    else:
        return []


def get_centers(districts_info):
    centers = []
    for district in districts_info:
        try:
            response = requests.get(
                "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict",
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
                params=(
                    ("district_id", district["district_id"]),
                    ("date", get_date(date_to_look_from)),
                ),
            )
            response = json.loads(response.content.decode("utf8"))
            centers.extend(response["centers"])
        except Exception as _:
            print(response)
            print(district)
            beep(2)
            traceback.print_exc()
    return centers


def get_fresh_response(num=1):
    print(num, get_time())
    global DISTRICT_INFO
    if DISTRICT_INFO is None:
        DISTRICT_INFO = get_district_info(districts_names)
    centers = get_centers(DISTRICT_INFO)
    if len(centers) == 0 and len(districts_names) > 1:
        raise Exception("SOMETHING WRONG WITH REQUEST")
    else:
        print(f"FOUND { len(centers) } POSSIBLE CENTERS")
        lst = []
        for center in centers:
            parsed_content = parse_center_info(center)
            if len(parsed_content):
                lst.extend(parsed_content)
        if len(lst) == 0:
            print("NOTHING FREE")
        else:
            available_centers = {}
            for center in lst:
                if center["district_name"] not in available_centers:
                    available_centers[center["district_name"]] = []
                available_centers[center["district_name"]].append(center)
            with open("result.txt", "w") as file:
                file.writelines([f"Found {len(lst)} ON {get_date()} AT {get_time()}\n"])
                for district in available_centers:
                    file.writelines([district, "\n"])
                    file.flush()
                    for center in available_centers[district]:
                        file.writelines([json.dumps(center, indent=1), "\n"])
                        file.flush()
                        print(district, json.dumps(center, indent=1))
                        if center["available_capacity"] >= 10:
                            beep(1)
            sleep(5)


num = 1
while True:
    try:
        get_fresh_response(num)
    except Exception as _:
        print("SOMETHING WRONG")
        traceback.print_exc()
        beep(2)
    finally:
        sleep(3)
        num += 1
