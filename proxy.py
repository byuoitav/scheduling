from flask import Flask, abort, request
from flask.views import MethodView
from flask_cors import CORS
from flask_restplus import Api, Resource, fields
from exchange.calendarModel import CalendarField, ConversationId, EffectiveRights, Mailbox, Attendee, CalendarItem, Calendar
from exchange.utils import GetEvents, CreateCalendarEvent
#import json

app = Flask(__name__)
CORS(app)
api = Api(app, version='1.0', title='Exchange Resource Proxy',
    description='Proxy for exchange calendar resources',
)

## TODO: Implement HATEOAS

## TODO: Fix swagger demo representation

def convertDstTzInfo(string):
  tmp=string
  tmp.replace("<","\"")
  tmp.replace(">","\"")
  tmp.replace("DstTzInfo","")

root = api.namespace('v1.0', description='')
calns_v1_0 = api.namespace('v1.0/exchange/calendar/', description='Calendar operations')

#cal = api.model('calendar', {
#    '_end_timezone': fields.String(required=False, readOnly=False, description=""),
#    '_start_timezone': fields.String(required=False, readOnly=False, description=""),
#    'adjacent_meeting_count': fields.Integer(required=False, readOnly=False, description=""),
#    'allow_new_time_proposal': fields.Boolean(required=False, readOnly=False, description=""),
#    'appointment_reply_time': fields.DateTime(required=False, readOnly=False, description=""),
#    'appointment_sequence_number': fields.Integer(required=False, readOnly=False, description=""),
#    #'attachments': fields.List(),
#    'body': fields.String(required=False, readOnly=False, description=""),
#    'changekey': fields.String(required=False, readOnly=False, description=""),
#    'conference_type': fields.Integer(required=False, readOnly=False, description=""),
#    'conflicting_meeting_count': fields.Integer(required=False, readOnly=False, description=""),
#    #'conversation_id': fields.ClassName("ConversationId"),
#    'culture': fields.String(required=False, readOnly=False, description=""),
#    'datetime_created': fields.DateTime(required=False, readOnly=False, description=""),
#    'datetime_received': fields.DateTime(required=False, readOnly=False, description=""),
#    'datetime_sent': fields.DateTime(required=False, readOnly=False, description=""),
#    'display_to': fields.String(required=False, readOnly=False, description=""),
#    'duration': fields.String(required=False, readOnly=False, description=""),
#    #'effective_rights': fields.List(fields.ClassName("EffectiveRights")),
#    'end': fields.DateTime(required=False, readOnly=False, description=""),
#    'has_attachments': fields.Boolean(required=False, readOnly=False, description=""),
#    'importance': fields.String(required=False, readOnly=False, description=""),
#    'is_all_day': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_associated': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_cancelled': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_draft': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_from_me': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_meeting': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_recurring': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_resend': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_response_requested': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_submitted': fields.Boolean(required=False, readOnly=False, description=""),
#    'is_unmodified': fields.Boolean(required=False, readOnly=False, description=""),
#    'item_class': fields.String(required=False, readOnly=False, description=""),
#    'item_id': fields.String(required=False, readOnly=False, description=""),
#    'last_modified_name': fields.String(required=False, readOnly=False, description=""),
#    'last_modified_time': fields.DateTime(required=False, readOnly=False, description=""),
#    'legacy_free_busy_status': fields.String(required=False, readOnly=False, description=""),
#    'location': fields.String(required=False, readOnly=False, description=""),
#    'meeting_request_was_sent': fields.Boolean(required=False, readOnly=False, description=""),
#    'mime_content': fields.String(required=False, readOnly=False, description=""),
#    'my_response_type': fields.String(required=False, readOnly=False, description=""),
#    #'organizer': fields.ClassName("Mailbox"),
#    'reminder_due_by': fields.DateTime(required=False, readOnly=False, description=""),
#    'reminder_is_set': fields.Boolean(required=False, readOnly=False, description=""),
#    'reminder_minutes_before_start': fields.Integer(required=False, readOnly=False, description=""),
#    #'required_attendees': fields.List(fields.ClassName("Attendee")),
#    'sensitivity': fields.String(required=False, readOnly=False, description=""),
#    'size': fields.Integer(required=False, readOnly=False, description=""),
#    'start': fields.DateTime(required=False, readOnly=False, description=""),
#    'subject': fields.String(required=False, readOnly=False, description=""),
#    'text_body': fields.String(required=False, readOnly=False, description=""),
#    'type': fields.String(required=False, readOnly=False, description=""),
#    'uid': fields.String(required=False, readOnly=False, description="")
#})

event = api.model('event', {
  'end': fields.DateTime(required=True, readOnly=False, description=""),
  'start': fields.DateTime(required=True, readOnly=False, description=""),
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


    def get(self, id):
      for event in self.events:
          if event['id'] == id:
              return event
      api.abort(404, "Event {} doesn't exist".format(id))

    def refresh(self):
      retVal = GetEvents()
      return retVal

    def create_event(self,data):
      return CreateCalendarEvent(data['subject'],data['start'],data['end'])



DAO = CalendarDAO()

@calns_v1_0.route('/events', methods=['GET','POST'])
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
        return DAO.refresh()

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
        print('posted')
        data = request.get_json()
        #return CreateCalendarEvent(subject=data.subject,start=data['start'],end=data.end)
        return DAO.create_event(data)


@calns_v1_0.route('/events/<int:id>')
@calns_v1_0.response(404, 'Event not found')
@calns_v1_0.param('id', 'The task identifier')
class Event(Resource):
    '''Show a single event'''
    @calns_v1_0.doc('get_event')
    @calns_v1_0.marshal_with(event)
    @calns_v1_0.response(200, 'OK')
    @calns_v1_0.response(400, 'Bad Request')
    @calns_v1_0.response(401, 'Unauthorized')
    @calns_v1_0.response(403, 'Forbidden')
    @calns_v1_0.response(404, 'Not Found')
    @calns_v1_0.response(408, 'Request Timeout')
    @calns_v1_0.response(410, 'Gone')
    @calns_v1_0.response(500, 'Internal Server Error')
    @calns_v1_0.response(503, 'Service Unavailable')
    def get(self, id):
        '''Fetch a given resource'''
        return DAO.get(id)


if __name__ == '__main__':
    app.run(debug=True)
