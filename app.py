import os
import psycopg2

from flask import Flask, render_template

app = Flask(__name__)

DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

@app.route("/")
def home():
    cur = conn.cursor()
    cur.execute("SELECT * FROM authors;")

    authors = cur.fetchall()

    return render_template("home.html", authors=authors)
