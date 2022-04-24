#!/usr/bin/python3

import flask
import mysql.connector
import json
import hashlib
import bcrypt

app = flask.Flask(__name__)

app.config['SECRET_KEY'] = '4bb5c2a6ffd793fdb261a805e36f1ffc'

def sql_connection():
    sql_host = '192.168.1.14'
    sql_database = 'app'
    sql_user = 'reader'
    sql_user = 'root'
    sql_password = 'W7ycG_V6rfQ8Uf@&'
    sql_password = 'GVEN48gdneAOMN'
    return mysql.connector.MySQLConnection(host=sql_host,database=sql_database,user=sql_user,password=sql_password)


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

@app.route("/api/posts",methods=['GET'])
def posts():
    args = flask.request.args.to_dict()
    with sql_connection() as conn:
        if 'u' in args and 'from' in args and 'count' in args:
            cursor = conn.cursor(prepared=True)
            cursor.execute("select * from post where user_name = %s order by created desc limit %s offset %s",(args['u'],args['count'],args['from']))
            posts = cursor.fetchall()
        elif 'f' in args and 'from' in args and 'count' in args:
            cursor = conn.cursor(prepared=True)
            cursor.execute("select p.* from post p inner join follow f on p.user_name = f.followed where f.follower = %s order by p.created desc limit %s offset %s",(args['f'],args['count'],args['from']))
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
            cursor = conn.cursor(prepared=True)
            cursor.execute("select name from user where name like concat(\"%%\",%s,\"%%\") limit %s offset %s",(args['q'],args['count'],args['from']))
            users = cursor.fetchall()
        else:
            users=[]
        res = flask.jsonify(users)
    return res

@app.route("/api/register",methods=['POST'])
def register():
    ret = False
    if flask.request.method == 'POST':
        name = flask.request.form['name']
        salt = bcrypt.gensalt()
        hpassword = hashlib.sha256(flask.request.form['password'].encode('utf-8')+salt).hexdigest()
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
    if flask.request.method == 'POST':
        name = flask.request.form['name']
        password = flask.request.form['password']
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
            res = flask.render_template("404.html")
    return res

@app.errorhandler(404)
def error404(e):
    return flask.render_template("404.html")

if __name__ == "__main__":
    #from waitress import serve
    #serve(app, host = "0.0.0.0", port = 80)
    app.run(debug=True)
    