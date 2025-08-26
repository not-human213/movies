import os
import datetime
from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from helpers import apology, login_required, lookup, usd
import apis

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd
    
# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///watch.db")

print("in app") 
@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    print("in index")
    user_watchlist, discover_details, top_shows, top_movies = apis.home.get_home(session["user_id"])
    # print(top_movies)
    print(session["user_id"])
    return render_template("index.html",uw = user_watchlist, discover_details = discover_details, top_shows = top_shows, top_movies = top_movies)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():

    if request.method == "POST":
        if not request.form.get("symbol"):
            return apology("must provide a symbol")
        stocks = lookup(request.form.get("symbol"))
        if stocks == None:
            return apology("invalid symbol")
        return render_template("quoted.html", stock=stocks)

    else:
        return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":
        if not request.form.get("username"):
            return apology("must provide username", 400)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 400)
        elif not request.form.get("confirmation"):
            return apology("Re-type your password", 400)
        elif request.form.get("password") != request.form.get("confirmation"):
            return apology("passwords do not match", 400)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))
        if len(rows) > 0:
            return apology("username already taken")
        hashp = generate_password_hash(request.form.get("password"))
        db.execute("INSERT INTO users (username, hash) VALUES (?, ?)",
                   request.form.get("username"), hashp)
        return redirect("/")

    else:
        return render_template("register.html")


@app.route("/movies")
def movies():

    if (request.args.get("movie_id")):
        mdata = apis.movies.details(request.args.get("movie_id"), session["user_id"])
        return render_template("movie_details.html", movie_data = mdata)
    
    page = 0
    data = apis.movies.discover(page)
    return render_template("movies.html", moviesdata = data)

@app.route("/shows")
def shows():
    if (request.args.get("show_id")):
        sdata = apis.series.details(request.args.get("show_id"), session["user_id"])    
        return render_template("show_details.html", show_data = sdata)
    
    page = 0
    data = apis.series.discover(page)
    return render_template("shows.html", show_data = data)

@app.route("/season")
def season():
    season_id = request.args.get("season_id")
    print(season_id,"in app")
    show_id = request.args.get("show_id")
    data = apis.series.seasons(show_id, season_id)
    return render_template("season.html", season_data = data)

@app.route("/home")
def home():
    user_watchlist, discover_details, top_shows, top_movies = apis.home.get_home(session['user_id'])
    return render_template("index.html", uw = user_watchlist, discover_details = discover_details, top_shows = top_shows, top_movies = top_movies)


@app.route('/search')
def search_movies():
    query = request.args.get('query')
    full = request.args.get('full')
    if full == '0':
        if query:
            results = apis.search.search(query, full)
            return jsonify(results)
        return jsonify([])
    else:
        movies = []
        shows = []
        results = apis.search.search(query, full)
        if query:
            for i in results:
                if i['type'] == 0:
                    movies.append(i)
                else: 
                    shows.append(i)
            return render_template("search.html", movies = movies, shows = shows)
        return jsonify([])

     
@app.route('/watchlist', methods=["GET", "POST"])
def watchlist():
    user_id = session["user_id"]
    action = request.args.get('action')
    if request.method == "GET":     
        print("in app", user_id)
        watchlist = apis.watchlist_instance.disp(user_id)
        return jsonify(watchlist)
    
    else:
        if action == "add":
            data = request.json
            media_id = data.get('media_id')
            type = data.get('media_type')
            apis.watchlist.add(user_id, media_id, type)
            return jsonify({"success": True})
        elif action == "remove":
            data = request.json
            media_id = data.get('media_id')
            type = data.get('media_type')
            apis.watchlist.remove(user_id, media_id, type)
            return jsonify({"success": True})


@app.route('/arr', methods=["GET", "POST", "DELETE"])
def arr_route():
    user_id = session["user_id"]
    warr = request.args.get('arr')
    arr_instance = apis.arr(warr)

    if request.method == "GET":
        print("arr in app", warr)
        arr_conn = arr_instance.check_connection()
        if not arr_conn.get('status'):
            return jsonify({"error": f"Failed to connect to {warr}."}), 400

        action = request.args.get('action')
        if action == 'get_profiles':
            return jsonify(arr_instance.get_profiles())
        elif action == 'checkmovie':
            tmdbid = request.args.get('tmdbid')
            exists = arr_instance.isadded(tmdbid, user_id)
            return jsonify({"exists": exists})
        else:
            return jsonify({"error": "Invalid action"}), 400

    elif request.method == "POST":
        print(f"{warr} POST")
        arr_conn = arr_instance.check_connection()
        if not arr_conn.get('status'):
            return jsonify({"error": f"Failed to connect to {warr}."}), 400

        action = request.args.get('action')
        data = request.json

        if action == "add":
            # Check if already exists
            exists = arr_instance.isadded(data, user_id)
            if exists:
                return jsonify({"success": False, "message": "Already exists", "already_exists": True})
            added = arr_instance.add(data, user_id)
            if added:
                return jsonify({"success": True, "message": "Added successfully"})
            else:
                return jsonify({"success": False, "message": "Failed to add"})
        elif action == "remove":
            # Only for Radarr (movies)
            tmdbid = data.get('tmdbId')
            removed = arr_instance.remove(int(tmdbid))
            if removed:
                return jsonify({"success": True, "message": "Removed successfully"})
            else:
                return jsonify({"success": False, "message": "Failed to remove"})
        else:
            return jsonify({"error": "Invalid action"}), 400

    elif request.method == "DELETE":
        # Support DELETE for removing from Radarr/Sonarr
        data = request.json
        tmdbid = data.get('tmdbId')
        removed = arr_instance.remove(int(tmdbid))
        if removed:
            return jsonify({"success": True, "message": "Removed successfully"})
        else:
            return jsonify({"success": False, "message": "Failed to remove"})

    else:
        return jsonify({"error": "Invalid method"}), 405


