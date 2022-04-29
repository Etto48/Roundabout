import flask
import mysql.connector

MAX_COUNT = 32

def get_post_data(arg):
    content_type = flask.request.headers.get('Content-Type')
    if content_type == "application/json":
        if(arg not in flask.request.json):
            flask.abort(400,"")
        ret = flask.request.json[arg]
    else:
        if(arg not in flask.request.form):
            flask.abort(400,"")
        ret = flask.request.form[arg]
    return ret

def get_user_name():
    return flask.session['name'] if 'name' in flask.session else None

def sql_connection():
    sql_host = 'localhost'
    sql_database = 'roundabout'
    sql_user = 'roundabout'
    sql_password = 'W7ycG_V6rfQ8Uf@&'
    return mysql.connector.MySQLConnection(host=sql_host,database=sql_database,user=sql_user,password=sql_password)