import os
from datetime import date, datetime, timedelta
from dateutil.parser import parse
from exchangelib import DELEGATE, IMPERSONATION, Account, Credentials, ServiceAccount, EWSDateTime, EWSTimeZone, Configuration, NTLM, CalendarItem, Message, Mailbox, Attendee, Q, ExtendedProperty, FileAttachment, ItemAttachment, HTMLBody, Build, Version
import exchangelib
from enum import Enum
from flask import abort
from couch import getCouchDoc

account = None

class DELETE_TYPE(Enum):
    delete = 1
    soft_delete = 2
    delete_notify = 3

def initAccount():
    global account
    info = None

    try:
        info = getCouchDoc()
    except Exception as e:
        raise Exception("unable to get couch doc: {}".format(e))

    uname = os.getenv("EXCHANGE_PROXY_USERNAME")
    pw = os.getenv("EXCHANGE_PROXY_PASSWORD")

    print("creating service account with uname: {}, password: {}".format(uname, pw))

    credentials = ServiceAccount(username=uname, password=pw)
    try:
        resource = info["resource"]
        if not resource:
            raise Exception("resource not set in config doc")

        autodiscover = info["autodiscover-url"]
        if not autodiscover:
            raise Exception("autodiscover-url not set in config doc")

        access = info["access-type"]
        if not access:
            raise Exception("access-type not set in config doc")
    except KeyError as e:
        raise Exception("missing key {} in config doc".format(e))
    except Exception as e:
        raise Exception(e)

    # split domain and resource id
    split = resource.rsplit("@", 1)
    if len(split) != 2 or not split[1]:
        raise Exception("badly formatted resource (got: {}, expected: <resource_id>@<domain>)".format(resource))

    accesstype = IMPERSONATION if access == 'impersonation' else DELEGATE

    # populate autodiscover cache with correct server, because Office365 TLS cert is broken
    # https://github.com/ecederstrand/exchangelib/issues/337
    protocol = exchangelib.autodiscover.AutodiscoverProtocol(
            service_endpoint=autodiscover,
            credentials=credentials, auth_type='basic')
    exchangelib.autodiscover._autodiscover_cache[(split[1], credentials)] = protocol

    account = Account(primary_smtp_address=resource, credentials=credentials, autodiscover=True, access_type=accesstype)
    print("Exchange account successfully set up")

def GetEvents():
    events = []

    ews_url = account.protocol.service_endpoint
    ews_auth_type = account.protocol.auth_type
    primary_smtp_address = account.primary_smtp_address
    tz = EWSTimeZone.timezone('America/Denver')

    ## Get reference date objects. "today" first gets the date object, then sets it to beginning of day.
    today = date.today()
    tomorrow = date.today() + timedelta(days=1)

    ## Get Calendar Items
    dayEventsView = account.calendar.view(start=tz.localize(EWSDateTime(today.year, today.month, today.day)),end=tz.localize(EWSDateTime(tomorrow.year, tomorrow.month, tomorrow.day)))
    calendarItems = dayEventsView.all()

    for item in calendarItems:
      tmpCalendarItem = CalendarItem()
      tmpCalendarItem.account = item.account
      tmpCalendarItem.adjacent_meeting_count = item.adjacent_meeting_count
      tmpCalendarItem.allow_new_time_proposal = item.allow_new_time_proposal
      tmpCalendarItem.appointment_reply_time = item.appointment_reply_time
      tmpCalendarItem.appointment_sequence_number = item.appointment_sequence_number
      tmpCalendarItem.attachments = item.attachments
      tmpCalendarItem.body = item.body
      tmpCalendarItem.categories = item.categories
      tmpCalendarItem.changekey = item.changekey
      tmpCalendarItem.conference_type = item.conference_type
      tmpCalendarItem.conflicting_meeting_count = item.conflicting_meeting_count
      tmpCalendarItem.conversation_id = item.conversation_id
      tmpCalendarItem.culture = item.culture
      tmpCalendarItem.datetime_created = item.datetime_created
      tmpCalendarItem.datetime_received = item.datetime_received
      tmpCalendarItem.datetime_sent = item.datetime_sent
      tmpCalendarItem.deleted_occurrences = item.deleted_occurrences
      tmpCalendarItem.display_cc = item.display_cc
      tmpCalendarItem.display_to = item.display_to
      tmpCalendarItem.duration = item.duration
      tmpCalendarItem.effective_rights = item.effective_rights
      tmpCalendarItem.end = item.end
      tmpCalendarItem.extern_id = item.extern_id
      tmpCalendarItem.first_occurrence = item.first_occurrence
      tmpCalendarItem.folder = item.folder
      tmpCalendarItem.has_attachments = item.has_attachments
      tmpCalendarItem.headers = item.headers
      tmpCalendarItem.importance = item.importance
      tmpCalendarItem.in_reply_to = item.in_reply_to
      tmpCalendarItem.is_all_day = item.is_all_day
      tmpCalendarItem.is_associated = item.is_associated
      tmpCalendarItem.is_cancelled = item.is_cancelled
      tmpCalendarItem.is_draft = item.is_draft
      tmpCalendarItem.is_from_me = item.is_from_me
      tmpCalendarItem.is_meeting = item.is_meeting
      tmpCalendarItem.is_online_meeting = item.is_online_meeting
      tmpCalendarItem.is_recurring = item.is_recurring
      tmpCalendarItem.is_resend = item.is_resend
      tmpCalendarItem.is_response_requested = item.is_response_requested
      tmpCalendarItem.is_submitted = item.is_submitted
      tmpCalendarItem.is_unmodified = item.is_unmodified
      tmpCalendarItem.item_class = item.item_class
      tmpCalendarItem.item_id = item.item_id
      tmpCalendarItem.last_modified_name = item.last_modified_name
      tmpCalendarItem.last_modified_time = item.last_modified_time
      tmpCalendarItem.last_occurrence = item.last_occurrence
      tmpCalendarItem.legacy_free_busy_status = item.legacy_free_busy_status
      tmpCalendarItem.location = item.location
      tmpCalendarItem.meeting_request_was_sent = item.meeting_request_was_sent
      tmpCalendarItem.meeting_workspace_url = item.meeting_workspace_url
      tmpCalendarItem.mime_content = item.mime_content
      tmpCalendarItem.modified_occurrences = item.modified_occurrences
      tmpCalendarItem.my_response_type = item.my_response_type
      tmpCalendarItem.net_show_url = item.net_show_url
      tmpCalendarItem.optional_attendees = item.optional_attendees
      tmpCalendarItem.organizer = item.organizer
      tmpCalendarItem.original_start = item.original_start
      tmpCalendarItem.parent_folder_id = item.parent_folder_id
      tmpCalendarItem.recurrence = item.recurrence
      tmpCalendarItem.reminder_due_by = item.reminder_due_by
      tmpCalendarItem.reminder_is_set = item.reminder_is_set
      tmpCalendarItem.reminder_minutes_before_start = item.reminder_minutes_before_start
      tmpCalendarItem.required_attendees = item.required_attendees
      tmpCalendarItem.resources = item.resources
      tmpCalendarItem.sensitivity = item.sensitivity
      tmpCalendarItem.size = item.size
      tmpCalendarItem.start = item.start
      tmpCalendarItem.subject = item.subject
      tmpCalendarItem.text_body = item.text_body
      tmpCalendarItem.type = item.type
      tmpCalendarItem.uid = item.uid
      tmpCalendarItem.unique_body = item.unique_body
      events.append(tmpCalendarItem)

    return(events)

def CreateCalendarEvent(subject,start,end):
    events = []

    ews_url = account.protocol.service_endpoint
    ews_auth_type = account.protocol.auth_type
    primary_smtp_address = account.primary_smtp_address
    tz = EWSTimeZone.timezone('America/Denver')

    ## Get reference date objects
    startDate = datetime.strptime(start,"%Y-%m-%dT%H:%M:%S.%fZ")
    endDate = datetime.strptime(end,"%Y-%m-%dT%H:%M:%S.%fZ")

    tomorrow = date.today() + timedelta(days=1)

    item = CalendarItem(
        folder=account.calendar,
        subject=subject,
        start= tz.localize(EWSDateTime(startDate.year, startDate.month, startDate.day, startDate.hour, startDate.minute)),
        end=tz.localize(EWSDateTime(endDate.year, endDate.month, endDate.day, endDate.hour, endDate.minute))
        )

    item.save()
    return(item)

def DeleteCalendarEvent(eventid):
    ews_url = account.protocol.service_endpoint
    ews_auth_type = account.protocol.auth_type
    primary_smtp_address = account.primary_smtp_address

    eventsToDelete = []

    for event in account.calendar.all():
        if event.item_id == eventid:
            eventsToDelete.append(event)

        results = account.bulk_delete(eventsToDelete)
        success = False
        for result in results:
            success = result

        if success == True:
            return GetEvents()
        else:
            abort(404,str.format('Resource {0} Not found',eventid))
