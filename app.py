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

    author_ids = author_ids.split(',')
    author_ids = [author_id for author_id in author_ids if author_id.isnumeric() and 1 <= int(author_id) <= 15]

    if not author_ids:
        return ''

    random_id = random.choice(author_ids)

    print('-----------')
    print('author id:', random_id)


    cur = conn.cursor()
    cur.execute("SELECT content FROM works \
                WHERE author_id = {0} \
                ORDER BY random() \
                LIMIT 1".format(random_id))

    result = ''.join(cur.fetchone())
    result = result.split('\n')

    # print(result)
    # print(type(result))

    if (len(result) > 10):
        # grab 10 lines
        begin_index = random.randint(0, len(result) - 11)
        end_index = begin_index + 10

        print('begin: ', begin_index)
        print('end: ', end_index)
        result = '\n'.join(result[begin_index:begin_index + 10])
    else:
        return ''

    print('len: ', len(result))

    return result
