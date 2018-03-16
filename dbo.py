from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sqlalchemy_declarative import Base, Event

engine = None
session = None

def get_session():
    if (engine is None):
        engine = create_engine('sqlite:///events.db')

    # Bind the engine to the metadata of the Base class so that the
    # declaratives can be accessed through a DBSession instance
    Base.metadata.bind = engine

    DBSession = sessionmaker(bind=engine)

    # A DBSession() instance establishes all conversations with the database
    # and represents a "staging zone" for all the objects loaded into the
    # database session object. Any change made against the objects in the
    # session won't be persisted into the database until you call
    # session.commit(). If you're not happy about the changes, you can
    # revert all of them back to the last commit by calling
    # session.rollback()
    session = DBSession()

def insert_event(obj):
    if (session is None):
        get_session()

    event = Event(obj)
    session.add(event)
    session.commit()

def query_all_events():
    if (session is None):
        get_session

    events = session.query(Event).all()

    return events
