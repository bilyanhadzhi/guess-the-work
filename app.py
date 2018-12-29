import os
import random
import psycopg2

from flask import Flask, render_template, request

app = Flask(__name__)

DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

@app.route("/", methods=['GET'])
def home():
    cur = conn.cursor()
    cur.execute("SELECT * FROM authors;")

    authors = cur.fetchall()

    return render_template("home.html", authors=authors)

@app.route("/api/get_excerpt", methods=['GET'])
def api_get_excerpt():
    author_ids = request.args.get('author_ids')

    if (author_ids is None):
        return 'No author IDs supplied', 404

    author_ids = author_ids.split(',')
    author_ids = [author_id for author_id in author_ids if author_id.isnumeric()]
    random_id = random.choice(author_ids)

    cur = conn.cursor()
    cur.execute("SELECT content FROM works \
                ORDER BY random() \
                LIMIT 1")

    result = cur.fetchone()

    print(result)
    print(type(result))

    return 'ok'
