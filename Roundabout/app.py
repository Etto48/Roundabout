#!/usr/bin/python3

import flask
import mysql.connector
import json
import hashlib
import os
import bcrypt

app = flask.Flask(__name__)

app.config['SECRET_KEY'] = '4bb5c2a6ffd793fdb261a805e36f1ffc'

""" API DOCS
/api/like POST (add or remove a like)
  post_id: target post id
  sr: 's' to add 'r' to remove the like
  ->{response=True|False}
/api/posts GET (download some posts)
  u: if you want the posts of the user u
  f: if you want the posts of the users followed by f
  from: first post to start downloading
  count: number of post to download (max: 32)
  ->[[id,user_name,text,created,likes,comments,liked],...] array of array
/api/users GET (find a user)
  q: query string
  from: first user to start downloading
  count: number of users to download (max: 32)  
  ->[[user_name],...] array of array but the ones inside are just [str]
/api/register POST (create an account)
  name: username
  password: password
  ->{response: True|False}
/api/logout GET (exit from account)
  ->{response: True}
/api/login POST (log in an account)
  name: username
  password: password
  ->{response: True|False}
"""


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

def sql_connection():
    sql_host = 'localhost'
    sql_database = 'roundabout'
    sql_user = 'roundabout'
    sql_password = 'W7ycG_V6rfQ8Uf@&'
    return mysql.connector.MySQLConnection(host=sql_host,database=sql_database,user=sql_user,password=sql_password)

MAX_COUNT = 32

@app.route("/")
@app.route("/index")
def root():
    name =  flask.session['name'] if 'name' in flask.session else None
    if name is not None:
        with sql_connection() as conn:
            cursor = conn.cursor(prepared=True)
            cursor.execute("select 1 from user where name = %s",(name,))
            present = cursor.fetchone() 
        if not present:
            flask.session.clear()
            return flask.redirect("/login")
        return flask.render_template("home.html",name=name,location="Home")
    else:
        return flask.redirect("/login")

@app.route('/favicon.ico')
def favicon():
    return flask.send_from_directory(os.path.join(app.root_path, 'static/resources'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route("/login")
def login_page():
    name =  flask.session['name'] if 'name' in flask.session else None
    if name is not None:
        return flask.redirect("/")
    else:
        return flask.render_template("login.html")


@app.route("/register")
def register_page():
    name =  flask.session['name'] if 'name' in flask.session else None
    if name is not None:
        return flask.redirect("/")
    else:
        return flask.render_template("register.html")

@app.route("/api/like",methods=['POST'])
def like():
    ret = False
    name =  flask.session['name'] if 'name' in flask.session else None
    if name is None:
        return flask.jsonify(response=False)
    else:
        with sql_connection() as conn:
            post_id = get_post_data('post_id')
            # set or reset like
            sr = get_post_data('sr')
            cursor = conn.cursor(prepared=True)
            if sr=='s': #set
                cursor.execute(\
                    """replace into liked values(%s,%s)""",
                    (post_id,name)
                )
                ret = True
                conn.commit()
            elif sr=='r': #reset
                cursor.execute(\
                    """delete from liked where post_id=%s and user_name=%s""",
                    (post_id,name)
                )
                ret = True
                conn.commit()
    return flask.jsonify(response=ret)



@app.route("/api/posts",methods=['GET'])
def posts():
    args = flask.request.args.to_dict()
    name =  flask.session['name'] if 'name' in flask.session else None
    with sql_connection() as conn:
        if 'u' in args and 'from' in args and 'count' in args:
            count = min(int(args['count']),MAX_COUNT)
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
                where p.user_name=%s order by p.created desc limit %s offset %s""",
                (name,args['u'],count,args['from'])
            )
            posts = cursor.fetchall()
        elif 'f' in args and 'from' in args and 'count' in args:
            count = min(int(args['count']),MAX_COUNT)
            cursor = conn.cursor(prepared=True)
            cursor.execute(\
                """select p.*, ifnull(l.likes,0), ifnull(c.comments,0), ifnull(ld.o,false)
                from post p inner join follow f on p.user_name = f.followed 
                left outer join 
	                (select post_id, count(*) as likes from liked group by post_id) as l on p.id=l.post_id
                left outer join 
                    (select post_id, count(*) as comments from `comment` group by post_id) as c on p.id=c.post_id 
                left outer join
                    (select post_id,true as o from liked where user_name = %s) as ld on p.id = ld.post_id
                where f.follower = %s order by p.created desc limit %s offset %s""",
                (name,args['f'],count,args['from'])
            )
            posts = cursor.fetchall()
        else:
            posts=[]
        res = flask.jsonify(posts)            
    return res

@app.route("/api/users",methods=['GET'])
def users():
    args = flask.request.args.to_dict()
    with sql_connection() as conn:
        if 'q' in args and 'from' in args and 'count' in args:
            count = min(int(args['count']),MAX_COUNT)
            cursor = conn.cursor(prepared=True)
            cursor.execute("select name from user where name like concat(\"%%\",%s,\"%%\") limit %s offset %s",(args['q'],count,args['from']))
            users = cursor.fetchall()
        else:
            users=[]
        res = flask.jsonify(users)
    return res

@app.route("/api/register",methods=['POST'])
def register():
    ret = False
    name = get_post_data('name')
    salt = bcrypt.gensalt()
    hpassword = hashlib.sha256(get_post_data('password').encode('utf-8')+salt).hexdigest()
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute("select 1 from user where name = %s",(name,))
        already_present = cursor.fetchone()
        if already_present:
            ret = False
        else:
            cursor.execute("insert into user (name,salt,hashed_password) values (%s,%s,%s)",(name,salt,hpassword))
            conn.commit()
            ret = True
            flask.session['name']=name
    return flask.jsonify(response=ret)

@app.route("/api/logout")
def logout():
    flask.session.clear()
    return flask.jsonify(response=True)

@app.route("/api/login",methods=['POST'])
def login():
    ret = False
    name = get_post_data('name')
    password = get_post_data('password')
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute("select salt from user where name = %s",(name,))
        salt = cursor.fetchone()
        if salt is not None:
            hpassword = hashlib.sha256((password+salt[0]).encode('utf-8')).hexdigest()
            cursor.execute("select 1 from user where name = %s and hashed_password = %s",(name,hpassword))
            correct = cursor.fetchone()
            if correct:
                ret = True
                flask.session['name']=name
    return flask.jsonify(response=ret)

@app.route("/p/<int:id>")
def post(id):
    name = flask.session['name'] if 'name' in flask.session else None
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
    return flask.render_template("post.html",name=name,location=f"p/{id}",id=post[0],user_name=post[1],text=post[2],created=post[3].strftime('%a, %d %b %Y %H:%M:%S GMT'),likes=post[4],comments=post[5],liked=post[6])

@app.route("/u/<string:uname>")
def user(uname):
    name = flask.session['name'] if 'name' in flask.session else None
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute("select 1 from user where name = %s", (uname,))
        present = cursor.fetchone()
        if present:
            res = flask.render_template("user.html",name=name,uname=uname,location=f"u/{uname}")
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
    