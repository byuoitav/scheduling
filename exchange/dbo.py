import os
import sqlite3
from flask import Flask,g

def connect_db(name):
    rv = sqlite3.connect(name)
    rv.row_factory = sqlite3.Row
    return rv

def get_db(name):
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db(name)
    return g.sqlite_db

def close_db(error):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db(name):
    with app.app_context():
        db = get_db(name)
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
            db.commit()

def initdb_command():
    self.init_db()
    print('Initialized the database.')

def show_entries(name):
    db = get_db(name)
    cur = db.execute('select hostname, room from panels order by id desc')
    entries = cur.fetchall()
    return entries
