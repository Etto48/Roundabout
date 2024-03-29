import flask
from Roundabout.tools import *
import bcrypt
import hashlib
import re

app_api = flask.Blueprint('app_api', __name__, url_prefix='/api')

@app_api.route("/like",methods=['POST'])
def like():
    ret = False
    name =  get_user_name()
    check_auth(name)
    with sql_connection() as conn:
        post_id = get_post_data('post_id')
        # set or reset like
        sr = get_post_data('sr')
        cursor = conn.cursor(prepared=True)
        if sr=='s': #set
            cursor.execute(\
                """replace into liked (post_id,user_name) values(%s,%s)""",
                (post_id,name)
            )
            ret = True
            conn.commit()
        elif sr=='r': #reset
            cursor.execute(\
                """delete from liked where post_id = %s and user_name = %s""",
                (post_id,name)
            )
            ret = True
            conn.commit()
    return flask.jsonify(response=ret)

@app_api.route("/new-comment",methods=['POST'])
def new_comment():
    name = get_user_name()
    check_auth(name)
    p = get_post_data('p')
    text = get_post_data('text')
    if len(text)==0:
        flask.abort(400,"Text must be non empty")
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute(\
            """insert into `comment` (post_id,text,user_name) values (%s,%s,%s)""",
            (p,text,name)
        )
        cursor.execute("select last_insert_id()")
        comment_id = cursor.fetchone()
        cursor.execute("select * from comment where id = %s",(comment_id[0],))
        comment = cursor.fetchone()
        conn.commit()
    return flask.jsonify(comment=comment)

@app_api.route("/comments",methods=['GET'])
def comments():
    args = flask.request.args.to_dict()
    #name =  get_user_name()
    with sql_connection() as conn:
        if 'p' in args and 'from' in args and 'count' in args:
            count = min(int(args['count']),MAX_COUNT)
            cursor = conn.cursor(prepared=True)
            cursor.execute(\
                """select c.* from comment c where c.post_id=%s order by c.created desc limit %s offset %s""",
                (args['p'],args['count'],args['from'])
            )
            comments = cursor.fetchall()
        else:
            flask.abort(400,"You must provide \"p\", \"from\" and \"count\"")
        res = flask.jsonify(comments)
    return res


@app_api.route("/new-post",methods=['POST'])
def new_post():
    name = get_user_name()
    check_auth(name)
    text=get_post_data('text')
    if len(text)==0:
        flask.abort(400,"Text must be non empty")
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute(\
            """insert into post (user_name,text) values (%s,%s)""",
            (name,text)
        )
        cursor.execute("select last_insert_id()")
        post_id = cursor.fetchone()
        cursor.execute("select p.*,0,0,false from post p where id = %s",(post_id[0],))
        post = cursor.fetchone()
        conn.commit()
    return flask.jsonify(post=post)

@app_api.route("/posts",methods=['GET'])
def posts():
    args = flask.request.args.to_dict()
    name =  get_user_name()
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
                """select distinct p.*, ifnull(l.likes,0), ifnull(c.comments,0), ifnull(ld.o,false)
                from post p 
                inner join
                    (select * from follow union select %s,%s) f on p.user_name = f.followed 
                left outer join 
	                (select post_id, count(*) as likes from liked group by post_id) as l on p.id=l.post_id
                left outer join 
                    (select post_id, count(*) as comments from `comment` group by post_id) as c on p.id=c.post_id 
                left outer join
                    (select post_id,true as o from liked where user_name = %s) as ld on p.id = ld.post_id
                where (f.follower = %s and f.followed is not null) order by p.created desc limit %s offset %s""",
                (args['f'],args['f'],name,args['f'],count,args['from'])
            )
            posts = cursor.fetchall()
        elif 'extra' in args and 'from' in args and 'count' in args:
            if args['extra']=='hot':
                count = min(int(args['count']),MAX_COUNT)
                cursor = conn.cursor(prepared=True)
                cursor.execute(\
                    """select p.*, ifnull(l.likes,0) as likes, ifnull(c.comments,0) as comments, ifnull(ld.o,false) as liked, ifnull(rl.likes,0) as recent_likes
                    from post p 
                    left outer join 
                        (select post_id, count(*) as likes from liked group by post_id) as l on p.id=l.post_id 
                    left outer join 
                        (select post_id, count(*) as comments from `comment` group by post_id) as c on p.id=c.post_id 
                    left outer join
                        (select post_id,true as o from liked where user_name = %s) as ld on p.id = ld.post_id
                    left outer join
                        (select post_id, count(*) as likes 
                            from liked where liked.created >= (current_timestamp() - interval 7 day)group by post_id) 
                            as rl on p.id=rl.post_id
                    order by recent_likes desc, p.created desc limit %s offset %s""",
                    (name,args['count'],args['from']))
                posts = cursor.fetchall()
            else:
                flask.abort(400,"\"extra\" mode not found")
        else:
            flask.abort(400,"You must provide \"u\"|\"f\"|\"extra\", \"from\" and \"count\"")
        res = flask.jsonify(posts)            
    return res

@app_api.route("/users",methods=['GET'])
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

@app_api.route("/register",methods=['POST'])
def register():
    name = get_post_data('name')
    if re.match("^[a-zA-Z0-9_-]{4,16}$",name) is None:
        return flask.jsonify(response=False,why='nregex')
    password = get_post_data('password')
    if re.match("^(?=.*?[a-z])(?=.*?[0-9]).{8,255}$",password) is None and\
        re.match("^(?=.*?[A-Z])(?=.*?[0-9]).{8,255}$",password) is None:
        return flask.jsonify(response=False,why='pregex')
    salt = bcrypt.gensalt()
    hpassword = hashlib.sha256(password.encode('utf-8')+salt).hexdigest()
    with sql_connection() as conn:
        cursor = conn.cursor(prepared=True)
        cursor.execute("select 1 from user where name = %s",(name,))
        already_present = cursor.fetchone()
        if already_present:
            return flask.jsonify(response=False,why='npresent')
        else:
            cursor.execute("insert into user (name,salt,hashed_password) values (%s,%s,%s)",(name,salt,hpassword))
            conn.commit()
            flask.session['name']=name
            return flask.jsonify(response=True)

@app_api.route("/logout")
def logout():
    flask.session.clear()
    return flask.jsonify(response=True)

@app_api.route("/login",methods=['POST'])
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

@app_api.route("/followers-count",methods=['GET'])
def followers_count():
    if 'u' in flask.request.args:
        return flask.jsonify(count=get_follower_count(flask.request.args['u']))
    else:
        flask.abort(400,"You must provide \"u\"")

@app_api.route("/followed-count",methods=['GET'])
def followed_count():
    if 'u' in flask.request.args:
        return flask.jsonify(count=get_followed_count(flask.request.args['u']))
    else:
        flask.abort(400,"You must provide \"u\"")

@app_api.route("/followers",methods=['GET'])
def followers():
    name = get_user_name()
    if 'u' in flask.request.args:
        u = flask.request.args['u']
        with sql_connection() as conn:
            cursor = conn.cursor(prepared=True)
            cursor.execute(\
                """select f1.follower,
                    ifnull((select 1 from follow f2 where f1.follower = f2.followed and f2.follower=%s),0)
                    from follow f1 where f1.followed=%s""",
                (name,u))
            f = cursor.fetchall()
    else:
        flask.abort(400,"You must provide \"u\"")
    return flask.jsonify(f)

@app_api.route("/followed",methods=['GET'])
def followed():
    name = get_user_name()
    if 'u' in flask.request.args:
        u = flask.request.args['u']
        with sql_connection() as conn:
            cursor = conn.cursor(prepared=True)
            cursor.execute(\
                """select f1.followed,
                    ifnull((select 1 from follow f2 where f1.followed = f2.followed and f2.follower=%s),0)
                    from follow f1 where f1.follower=%s""",
                (name,u))
            f = cursor.fetchall()
    else:
        flask.abort(400,"You must provide \"u\"")
    return flask.jsonify(f)

@app_api.route("/following",methods=['GET'])
def following():
    name = get_user_name()
    check_auth(name)
    if 'u' in flask.request.args:
        user_name = flask.request.args['u']
        return flask.jsonify(response=check_follow(name,user_name))
    else:
        flask.abort(400,"You must provide \"u\"")


@app_api.route("/follow",methods=['POST'])
def follow():
    ret = False
    name = get_user_name()
    check_auth(name)
    target = get_post_data('target')
    sr = get_post_data('sr')
    if name != target:
        with sql_connection() as conn:
            cursor = conn.cursor(prepared=True)
            if sr=='s':
                cursor.execute(\
                    """replace into follow (follower,followed) values (%s,%s)""",
                    (name,target))
                ret = True
                conn.commit()
            elif sr=='r':
                cursor.execute(\
                    """delete from follow where follower = %s and followed = %s""",
                    (name,target))
                ret = True
                conn.commit()
    return flask.jsonify(response=ret)