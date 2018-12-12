import os
import psycopg2

from flask import Flask

app = Flask(__name__)

DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

@app.route("/")
def hello():
    return "Hello Worldz!"
