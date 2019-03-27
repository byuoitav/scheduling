import requests
import os

def getCouchDoc():
    # pull config from couch
    # get auth data for couch
    db_addr = os.getenv("DB_ADDRESS")
    db_uname = os.getenv("DB_USERNAME")
    db_pass = os.getenv("DB_PASSWORD")

    if not db_addr:
        raise Exception("DB_ADDRESS not set")

    if not db_uname:
        raise Exception("DB_USERNAME not set")

    if not db_pass:
        raise Exception("DB_PASSWORD not set")

    # build url
    sys = os.getenv("SYSTEM_ID")
    if not sys:
        raise Exception("SYSTEM_ID not set")

    url = db_addr + "/scheduling-configs/" + os.getenv("SYSTEM_ID")

    # make request
    resp = requests.get(url, auth=(db_uname, db_pass))
    if resp.status_code != 200:
        raise Exception("failed to get couch doc: <{}> {}".format(resp.status_code, resp.text))

    # remove extra data
    body = resp.json()
    del body['_id']
    del body['_rev']

    return body
