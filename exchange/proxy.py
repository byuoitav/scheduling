from flask import Flask, abort, request
from flask_restplus import Api, Resource, fields
from calendarModel import CalendarField, ConversationId, EffectiveRights, Mailbox, Attendee, CalendarItem, Calendar
from utils import GetEvents

app = Flask(__name__)
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
calns_v1_0 = api.namespace('v1.0/calendar/', description='Calendar operations')

cal = api.model('calendar', {
    '_end_timezone': fields.String(required=True, readOnly=False, description=""),
    '_start_timezone': fields.String(required=True, readOnly=False, description=""),
    'adjacent_meeting_count': fields.Integer(required=True, readOnly=False, description=""),
    'allow_new_time_proposal': fields.Boolean(required=True, readOnly=False, description=""),
    'appointment_reply_time': fields.DateTime(required=True, readOnly=False, description=""),
    'appointment_sequence_number': fields.Integer(required=True, readOnly=False, description=""),
    #'attachments': fields.List(),
    'body': fields.String(required=True, readOnly=False, description=""),
    'changekey': fields.String(required=True, readOnly=False, description=""),
    'conference_type': fields.Integer(required=True, readOnly=False, description=""),
    'conflicting_meeting_count': fields.Integer(required=True, readOnly=False, description=""),
    #'conversation_id': fields.ClassName("ConversationId"),
    'culture': fields.String(required=True, readOnly=False, description=""),
    'datetime_created': fields.DateTime(required=True, readOnly=False, description=""),
    'datetime_received': fields.DateTime(required=True, readOnly=False, description=""),
    'datetime_sent': fields.DateTime(required=True, readOnly=False, description=""),
    'display_to': fields.String(required=True, readOnly=False, description=""),
    'duration': fields.String(required=True, readOnly=False, description=""),
    #'effective_rights': fields.List(fields.ClassName("EffectiveRights")),
    'end': fields.DateTime(required=True, readOnly=False, description=""),
    'has_attachments': fields.Boolean(required=True, readOnly=False, description=""),
    'importance': fields.String(required=True, readOnly=False, description=""),
    'is_all_day': fields.Boolean(required=True, readOnly=False, description=""),
    'is_associated': fields.Boolean(required=True, readOnly=False, description=""),
    'is_cancelled': fields.Boolean(required=True, readOnly=False, description=""),
    'is_draft': fields.Boolean(required=True, readOnly=False, description=""),
    'is_from_me': fields.Boolean(required=True, readOnly=False, description=""),
    'is_meeting': fields.Boolean(required=True, readOnly=False, description=""),
    'is_recurring': fields.Boolean(required=True, readOnly=False, description=""),
    'is_resend': fields.Boolean(required=True, readOnly=False, description=""),
    'is_response_requested': fields.Boolean(required=True, readOnly=False, description=""),
    'is_submitted': fields.Boolean(required=True, readOnly=False, description=""),
    'is_unmodified': fields.Boolean(required=True, readOnly=False, description=""),
    'item_class': fields.String(required=True, readOnly=False, description=""),
    'item_id': fields.String(required=True, readOnly=False, description=""),
    'last_modified_name': fields.String(required=True, readOnly=False, description=""),
    'last_modified_time': fields.DateTime(required=True, readOnly=False, description=""),
    'legacy_free_busy_status': fields.String(required=True, readOnly=False, description=""),
    'location': fields.String(required=True, readOnly=False, description=""),
    'meeting_request_was_sent': fields.Boolean(required=True, readOnly=False, description=""),
    'mime_content': fields.String(required=True, readOnly=False, description=""),
    'my_response_type': fields.String(required=True, readOnly=False, description=""),
    #'organizer': fields.ClassName("Mailbox"),
    'reminder_due_by': fields.DateTime(required=True, readOnly=False, description=""),
    'reminder_is_set': fields.Boolean(required=True, readOnly=False, description=""),
    'reminder_minutes_before_start': fields.Integer(required=True, readOnly=False, description=""),
    #'required_attendees': fields.List(fields.ClassName("Attendee")),
    'sensitivity': fields.String(required=True, readOnly=False, description=""),
    'size': fields.Integer(required=True, readOnly=False, description=""),
    'start': fields.DateTime(required=True, readOnly=False, description=""),
    'subject': fields.String(required=True, readOnly=False, description=""),
    'text_body': fields.String(required=True, readOnly=False, description=""),
    'type': fields.String(required=True, readOnly=False, description=""),
    'uid': fields.String(required=True, readOnly=False, description="")
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



DAO = CalendarDAO()

@calns_v1_0.route('/events')
class EventList(Resource):
    '''Shows a list all events'''
    @calns_v1_0.doc('list_events')
    @calns_v1_0.marshal_list_with(cal)
    def get(self):
        '''List all events'''
        return DAO.refresh()


@calns_v1_0.route('/events/<int:id>')
@calns_v1_0.response(404, 'Event not found')
@calns_v1_0.param('id', 'The task identifier')
class Event(Resource):
    '''Show a single event'''
    @calns_v1_0.doc('get_event')
    @calns_v1_0.marshal_with(cal)
    def get(self, id):
        '''Fetch a given resource'''
        return DAO.get(id)


if __name__ == '__main__':
    app.run(debug=True)
