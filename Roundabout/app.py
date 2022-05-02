#!/usr/bin/python3

import flask
import mysql.connector
import json
import os

from .api import app_api
from .tools import *

app = flask.Flask(__name__)
app.register_blueprint(app_api)

app.config['SECRET_KEY'] = '4bb5c2a6ffd793fdb261a805e36f1ffc'


@app.route('/api-docs',methods=['GET'])
def api_doc():
    if 'key' in flask.request.args:
        if flask.request.args['key']=='pkf4ZbJ4owfY@o4sKEJ%dUunfJjv0OQN':
            return flask.render_template("api-docs.html")
    return flask.render_template("404.html"),404
    

@app.route("/")
@app.route("/index")
def root():
    name = get_user_name()
    if name is not None:
        return flask.render_template("home.html",name=name,location="Home")
    else:
        return flask.redirect("/login")

@app.route('/favicon.ico')
def favicon():
    return flask.send_from_directory(os.path.join(app.root_path, 'static/resources'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route("/login")
def login_page():
    name =  get_user_name()
    if name is not None:
        return flask.redirect("/")
    else:
        return flask.render_template("login.html")


@app.route("/register")
def register_page():
    name =  get_user_name()
    if name is not None:
        return flask.redirect("/")
    else:
        return flask.render_template("register.html")



@app.route("/p/<int:id>")
def post(id):
    name = get_user_name()
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute(\
            """select p.*, ifnull(l.likes,0), ifnull(c.comments,0), ifnull(ld.o,false)
                from post p
                left outer join 
	                (select post_id, count(*) as likes from liked group by post_id) as l on p.id=l.post_id
                left outer join 
                    (select post_id, count(*) as comments from `comment` group by post_id) as c on p.id=c.post_id 
                left outer join
                    (select post_id,true as o from liked where user_name = %s) as ld on p.id = ld.post_id
                where p.id = %s""",
                (name,id)
        )
        post = cursor.fetchone()
        if post is None:
            return flask.render_template("404.html"),404
    return flask.render_template("post.html",name=name,location=f"Post from {post[1]}",id=post[0],user_name=post[1],text=post[2],created=post[3].strftime('%a, %d %b %Y %H:%M:%S GMT'),likes=post[4],comments=post[5],liked=post[6])

@app.route("/u/<string:uname>")
def user(uname):
    name = get_user_name()
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute("select 1 from user where name = %s", (uname,))
        present = cursor.fetchone()
        if present:
            
            followed = check_follow(name,uname) if name is not None else None
            res = flask.render_template("user.html",name=name,uname=uname,location=f"u/{uname}",followed=followed)
        else:
            res = flask.render_template("404.html"),404
    return res

@app.errorhandler(404)
def error404(e):
    return flask.render_template("404.html"),404

if __name__ == "__main__":
    #from waitress import serve
    #serve(app, host = "0.0.0.0", port = 80)
    app.run(debug=True)
    