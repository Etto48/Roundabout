import flask
import mysql.connector

MAX_COUNT = 32

def get_post_data(arg):
    content_type = flask.request.headers.get('Content-Type')
    if content_type == "application/json":
        if(arg not in flask.request.json):
            flask.abort(400,f"Expected post parameter {arg}")
        ret = flask.request.json[arg]
    else:
        if(arg not in flask.request.form):
            flask.abort(400,f"Expected post parameter {arg}")
        ret = flask.request.form[arg]
    return ret

def get_user_name():
    name = flask.session['name'] if 'name' in flask.session else None
    name = validate_username(name)
    return name

def sql_connection():
    sql_host = 'localhost'
    sql_database = 'roundabout'
    sql_user = 'roundabout'
    sql_password = 'W7ycG_V6rfQ8Uf@&'
    return mysql.connector.MySQLConnection(host=sql_host,database=sql_database,user=sql_user,password=sql_password)

def check_auth(name):
    if name is None:
        flask.abort(401,"You must be logged in to perform this action")

def validate_username(name):
    if name is not None:
        with sql_connection() as conn:
            cursor = conn.cursor(prepared=True)
            cursor.execute("select 1 from user where name = %s",(name,))
            present = cursor.fetchone() 
        if not present:
            flask.session.clear()
            return None
    return name

def check_follow(follower,followed):
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute("select 1 from follow where follower=%s and followed=%s", (follower,followed))
        ret = cursor.fetchone()
        if ret:
            return True
        else:
            return False