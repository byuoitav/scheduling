#!/usr/bin/env python3

#import asyncio
import maya
import os
import sqlite3
import threading
import time
from flask import Flask, abort, request, g, send_from_directory, jsonify
from flask.views import MethodView
from flask_cors import CORS
from flask_restplus import Api, Resource, fields
from exchange.calendarModel import CalendarField, ConversationId, EffectiveRights, Mailbox, Attendee, CalendarItem, Calendar
from exchange.utils import GetEvents, CreateCalendarEvent, DeleteCalendarEvent

loop = None
dbname = "events.db"

app = Flask(__name__)

def writeCache(array):
    sql = ''' INSERT INTO events(end, start, subject, body, conflicting_meeting_count, display_to, duration, location, type, uid) VALUES(?,?,?,?,?,?,?,?,?,?) '''
    db = connect_db()
    cur = db.cursor()
    for o in array:
        try:
            s = (str(o.start)).replace(" ","T")
            e = (str(o.end)).replace(" ","T")
            smaya = maya.parse(s).datetime()
            emaya = maya.parse(e).datetime()
            cur.execute(sql,(emaya, smaya, o.subject, o.body,o.conflicting_meeting_count,o.display_to,o.duration,o.location,o.type,o.uid))
            db.commit()
        except:
            pass

def cache_db():
    while True:
        events = GetEvents()
        writeCache(events)
        time.sleep(15)

@app.before_first_request
def startCaching():
    db = initdb_command()
    thread = threading.Thread(target=cache_db)
    thread.start()

CORS(app)

api = Api(app, version='1.0', title='Exchange Resource Proxy', description='Proxy for exchange calendar resources')

def connect_db():
    rv = sqlite3.connect(dbname)
    rv.row_factory = sqlite3.Row
    return rv

def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

def close_db(error):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('exchange/schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
            db.commit()

def initdb_command():
    init_db()
    print('Initialized the database.')

def show_entries():
    db = get_db()
    cur = db.execute('select hostname, room from events order by id desc')
    entries = cur.fetchall()
    return entries

def convertDstTzInfo(string):
    tmp = string
    tmp.replace("<", "\"")
    tmp.replace(">", "\"")
    tmp.replace("DstTzInfo", "")


root = api.namespace('v1.0', description='')
calns_v1_0 = api.namespace('v1.0/exchange/calendar/', description='Calendar operations')

event = api.model('event', {
  'end': fields.String(required=True, readOnly=False, description=""),
  'start': fields.String(required=True, readOnly=False, description=""),
  'subject': fields.String(required=True, readOnly=False, description=""),

  '_end_timezone': fields.String(required=False, readOnly=False, description=""),
  '_start_timezone': fields.String(required=False, readOnly=False, description=""),
  'adjacent_meeting_count': fields.Integer(required=False, readOnly=False, description=""),
  'allow_new_time_proposal': fields.Boolean(required=False, readOnly=False, description=""),
  'appointment_reply_time': fields.DateTime(required=False, readOnly=False, description=""),
  'appointment_sequence_number': fields.Integer(required=False, readOnly=False, description=""),
  #'attachments': fields.List(),
  'body': fields.String(required=False, readOnly=False, description=""),
  'changekey': fields.String(required=False, readOnly=False, description=""),
  'conference_type': fields.Integer(required=False, readOnly=False, description=""),
  'conflicting_meeting_count': fields.Integer(required=False, readOnly=False, description=""),
  #'conversation_id': fields.ClassName("ConversationId"),
  'culture': fields.String(required=False, readOnly=False, description=""),
  'datetime_created': fields.DateTime(required=False, readOnly=False, description=""),
  'datetime_received': fields.DateTime(required=False, readOnly=False, description=""),
  'datetime_sent': fields.DateTime(required=False, readOnly=False, description=""),
  'display_to': fields.String(required=False, readOnly=False, description=""),
  'duration': fields.String(required=False, readOnly=False, description=""),
  #'effective_rights': fields.List(fields.ClassName("EffectiveRights")),
  'has_attachments': fields.Boolean(required=False, readOnly=False, description=""),
  'importance': fields.String(required=False, readOnly=False, description=""),
  'is_all_day': fields.Boolean(required=False, readOnly=False, description=""),
  'is_associated': fields.Boolean(required=False, readOnly=False, description=""),
  'is_cancelled': fields.Boolean(required=False, readOnly=False, description=""),
  'is_draft': fields.Boolean(required=False, readOnly=False, description=""),
  'is_from_me': fields.Boolean(required=False, readOnly=False, description=""),
  'is_meeting': fields.Boolean(required=False, readOnly=False, description=""),
  'is_recurring': fields.Boolean(required=False, readOnly=False, description=""),
  'is_resend': fields.Boolean(required=False, readOnly=False, description=""),
  'is_response_requested': fields.Boolean(required=False, readOnly=False, description=""),
  'is_submitted': fields.Boolean(required=False, readOnly=False, description=""),
  'is_unmodified': fields.Boolean(required=False, readOnly=False, description=""),
  'item_class': fields.String(required=False, readOnly=False, description=""),
  'item_id': fields.String(required=False, readOnly=False, description=""),
  'last_modified_name': fields.String(required=False, readOnly=False, description=""),
  'last_modified_time': fields.DateTime(required=False, readOnly=False, description=""),
  'legacy_free_busy_status': fields.String(required=False, readOnly=False, description=""),
  'location': fields.String(required=False, readOnly=False, description=""),
  'meeting_request_was_sent': fields.Boolean(required=False, readOnly=False, description=""),
  'mime_content': fields.String(required=False, readOnly=False, description=""),
  'my_response_type': fields.String(required=False, readOnly=False, description=""),
  #'organizer': fields.ClassName("Mailbox"),
  'reminder_due_by': fields.DateTime(required=False, readOnly=False, description=""),
  'reminder_is_set': fields.Boolean(required=False, readOnly=False, description=""),
  'reminder_minutes_before_start': fields.Integer(required=False, readOnly=False, description=""),
  #'required_attendees': fields.List(fields.ClassName("Attendee")),
  'sensitivity': fields.String(required=False, readOnly=False, description=""),
  'size': fields.Integer(required=False, readOnly=False, description=""),
  'text_body': fields.String(required=False, readOnly=False, description=""),
  'type': fields.String(required=False, readOnly=False, description=""),
  'uid': fields.String(required=False, readOnly=False, description="")
})


class CalendarDAO(object):
    def __init__(self):
      self.events = []

    def get(self, item_id):
        for event in self.events:
            if event['id'] == item_id:
                return event
        api.abort(404, "Event {} doesn't exist".format(item_id))

    def refresh(self):
      retVal = GetEvents()
      return retVal

    def refreshFromDb(self):
      db = get_db()
      cur = db.cursor()
      cur.execute('SELECT * FROM events')
      retVal = cur.fetchall()
      return retVal

    def create_event(self,data):
      return CreateCalendarEvent(data['Subject'],data['Start'],data['End'])

    def delete(self,eventId):
      return DeleteCalendarEvent(eventId)


DAO = CalendarDAO()

@calns_v1_0.route('/events', methods=['GET', 'POST'])
class EventList(Resource):
    @calns_v1_0.doc('get_events')
    @calns_v1_0.marshal_list_with(event)
    @calns_v1_0.response(200, 'OK')
    @calns_v1_0.response(204, 'No Content')
    @calns_v1_0.response(400, 'Bad Request')
    @calns_v1_0.response(401, 'Unauthorized')
    @calns_v1_0.response(404, 'Not Found')
    @calns_v1_0.response(408, 'Request Timeout')
    @calns_v1_0.response(500, 'Internal Server Error')
    @calns_v1_0.response(503, 'Service Unavailable')
    def get(self):
        '''List all events'''
        return DAO.refreshFromDb()

    @calns_v1_0.doc('create_event')
    @calns_v1_0.marshal_list_with(event)
    @calns_v1_0.param('subject', 'The event title')
    @calns_v1_0.param('start', 'The event start time')
    @calns_v1_0.param('end', 'The event end time')
    @calns_v1_0.response(201, 'Created')
    @calns_v1_0.response(400, 'Bad Request')
    @calns_v1_0.response(401, 'Unauthorized')
    @calns_v1_0.response(403, 'Forbidden')
    @calns_v1_0.response(404, 'Not Found')
    @calns_v1_0.response(408, 'Request Timeout')
    @calns_v1_0.response(409, 'Conflict')
    @calns_v1_0.response(413, 'Payload Too Large')
    @calns_v1_0.response(500, 'Internal Server Error')
    @calns_v1_0.response(503, 'Service Unavailable')
    def post(self):
        '''Creates an event'''
        data = request.get_json()
        return DAO.create_event(data)


@calns_v1_0.route('/events/<string:item_id>', methods=['GET', 'PUT', 'DELETE'])
@calns_v1_0.param('item_id', 'The event item_id')
@calns_v1_0.response(200, 'OK')
@calns_v1_0.response(400, 'Bad Request')
@calns_v1_0.response(401, 'Unauthorized')
@calns_v1_0.response(403, 'Forbidden')
@calns_v1_0.response(404, 'Not Found')
@calns_v1_0.response(408, 'Request Timeout')
@calns_v1_0.response(410, 'Gone')
@calns_v1_0.response(500, 'Internal Server Error')
@calns_v1_0.response(503, 'Service Unavailable')
class Event(Resource):
    @calns_v1_0.doc('get_event')
    @calns_v1_0.marshal_with(event)
    def get(self, item_id):
        '''Fetch a given resource'''
        return DAO.get(item_id)

    @calns_v1_0.doc('delete_event')
    @calns_v1_0.marshal_with(event)
    def delete(self, item_id):
        '''Delete specified resource'''
        return DAO.delete(item_id)

# serve the static files
@app.route('/web/')
def serve_web_index(filename=None):
    return send_from_directory("web-dist", "index.html")

@app.route('/web/<path:filename>')
def serve_web_files(filename):
    return send_from_directory("web-dist", filename.split('/', 1)[-1])

@app.route('/env/')
def returnEnvVars():
    env = {}
    env['hostname'] = os.getenv("PI_HOSTNAME")
    env['allowbooknow'] = os.getenv("ALLOW_BOOK_NOW")
    return jsonify(env)


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    startCaching()
    app.run(debug=False)
