def get_dict_attr(obj, attr):
  for obj in [obj] + obj.__class__.mro():
    if attr in obj.__dict__:
      return obj.__dict__[attr]
  raise AttributeError

def set_dict_attr(obj, attr, val):
  for obj in [obj] + obj.__class__.mro():
    if attr in obj.__dict__:
      obj.__dict__[attr] = val
      return
  raise AttributeError

def convertDstTzInfo(string):
  tmp=string
  tmp.replace("<","\"")
  tmp.replace(">","\"")
  tmp.replace("DstTzInfo","")

class CalendarField(object):
  def __init__(self, name,value_class,is_list,is_complex,default):
    self.name = name
    self.value_class = value_class
    self.is_list = is_list
    self.is_complex = is_complex
    self.default = default

class ConversationId(object):
  def __init__(self,ciId,changekey):
    self.id = ciId
    self.changekey = changekey

class EffectiveRights(object):
  def __init__(self,create_associated,create_contents,create_hierarchy,delete,modify,read,view_private_items):
    self.create_associated = create_associated
    self.create_contents = create_contents
    self.create_hierarchy = create_hierarchy
    self.delete = delete
    self.modify = modify
    self.read = read
    self.view_private_items = view_private_items

class Mailbox(object):
  def __init__(self,name,email_address,mailbox_type,item_id):
    self.name = name
    self.email_address = email_address
    self.mailbox_type = mailbox_type
    self.item_id = item_id

class Attendee(object):
  def __init__(self,mailbox,response_type,last_response_time):
    self.mailbox = mailbox
    self.response_type = response_type
    self.last_response_time = last_response_time

class CalendarItem(object):
  def __init__(self):
    self.mime_content= null
    self.item_id= null
    self.changekey= null
    self.parent_folder_id= null
    self.item_class= null
    self.subject= null
    self.sensitivity= null
    self.text_body= null
    self.body= null
    self.attachments= null
    self.datetime_received= null
    self.size= null
    self.categories= null
    self.importance= null
    self.in_reply_to= null
    self.is_submitted= null
    self.is_draft= null
    self.is_from_me= null
    self.is_resend= null
    self.is_unmodified= null
    self.headers= null
    self.datetime_sent= null
    self.datetime_created= null
    self.reminder_due_by= null
    self.reminder_is_set= null
    self.reminder_minutes_before_start= null
    self.display_cc= null
    self.display_to= null
    self.has_attachments= null
    self.extern_id= null
    self.culture= null
    self.effective_rights= null
    self.last_modified_name= null
    self.last_modified_time= null
    self.is_associated= null
    self.conversation_id= null
    self.unique_body= null
    self.uid= null
    self.start= null
    self.end= null
    self.original_start= null
    self.is_all_day= null
    self.legacy_free_busy_status= null
    self.location= null
    self.when= null
    self.is_meeting= null
    self.is_cancelled= null
    self.is_recurring= null
    self.meeting_request_was_sent= null
    self.is_response_requested= null
    self.type= null
    self.my_response_type= null
    self.organizer= null
    self.required_attendees= null
    self.optional_attendees= null
    self.resources= null
    self.conflicting_meeting_count= null
    self.adjacent_meeting_count= null
    self.duration= null
    self.appointment_reply_time= null
    self.appointment_sequence_number= null
    self.recurrence= null
    self.first_occurrence= null
    self.last_occurrence= null
    self.modified_occurrences= null
    self.deleted_occurrences= null
    self._meeting_timezone= null
    self._start_timezone= null
    self._end_timezone= null
    self.conference_type= null
    self.allow_new_time_proposal= null
    self.is_online_meeting= null
    self.meeting_workspace_url= null
    self.net_show_url= null

class Calendar(object):
    def __init__(self):
        self.events = []

    def appendEvent(self,obj):
        tmp = CalendarItem()
        for f in dir(c):
            if "__" not in f:
                try:
                    set_dict_attr(self,f,obj[f])
                except:
                    print("error")
