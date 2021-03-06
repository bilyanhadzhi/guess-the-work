import os
import random
import psycopg2
import json

from flask import Flask, render_template, request

app = Flask(__name__)

DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

@app.route("/", methods=['GET'])
def home():
    return render_template("home.html")

@app.route("/play", methods=['GET'])
def play():
    cur = conn.cursor()
    cur.execute("SELECT * FROM authors;")

    authors = cur.fetchall()

    return render_template("play.html", authors=authors)

@app.route("/api/get_excerpt", methods=['GET'])
def api_get_excerpt():
    author_ids = request.args.get('author_ids')
    show_answer = request.args.get('show_answer')

    if not author_ids:
        author_ids = []
        for i in range(1, 15):
            author_ids.append(i)
    else:
        author_ids = author_ids.split(',')
        author_ids = [author_id for author_id in author_ids if author_id.isnumeric() and 1 <= int(author_id) <= 15]

    if not author_ids:
        return ''

    random_id = random.choice(author_ids)

    print('-----------')
    print('author id:', random_id)

    cur = conn.cursor()
    cur.execute("SELECT file_name, title FROM works \
                WHERE author_id = {0} \
                ORDER BY random() \
                LIMIT 1".format(random_id))

    print('query done')
    work = cur.fetchone()

    print(work)

    with open('works/' + work[0]) as fin:
        txt = fin.read()
        content_begin = txt.find('cb')
        content_end = txt.find('ce')
        content = txt[content_begin+3:content_end]

    result = content.split('\n')
    # print(type(result))

    if (len(result) > 10 and len(result) < 1000):
        # grab 10 lines
        begin_index = random.randint(0, len(result) - 11)
        end_index = begin_index + 5

        print('begin: ', begin_index)
        print('end: ', end_index)
        result = '<br>'.join(result[begin_index:end_index])
    else:
        if (len(result) <= 10):
            result = '<br>'.join(result[0:len(result)])
        else:
            # grab 10 lines
            begin_index = random.randint(100, len(result) - 101)
            end_index = begin_index + 5

            print('begin: ', begin_index)
            print('end: ', end_index)
            result = '<br>'.join(result[begin_index:end_index])

    print('len: ', len(result))

    if (show_answer in ['1', 'true', 'yes', 'y']):
        result += "<br><br><br>"
        result += "(\"{0}\")".format(work[1])

    return result

@app.route("/api/get_all_titles", methods=['GET'])
def api_get_all_titles():
    cur = conn.cursor()
    cur.execute("SELECT title FROM works")

    all_titles = cur.fetchall()

    all_titles[:] = sorted([title[0] for title in all_titles])

    # print(all_titles)

    return json.dumps(all_titles)

@app.route("/api/submit_answer", methods=['POST'])
def submit_answer():
    if request.method == 'POST':
        excerpt = request.form.get('excerpt')
        answer = request.form.get('answer')

        if answer == '' or excerpt == '':
            return ''

        cur = conn.cursor()

        pattern = '%' + excerpt + '%'

        print(type(pattern))
        cur.execute("SELECT title FROM works \
                    WHERE content LIKE '{0}'".format(pattern))

        real_answer = cur.fetchone()

        answer_is_correct = answer.lower() == real_answer[0].lower()

        if answer_is_correct:
            return '1'
        else:
            return '0'
    else:
        return 'gotta be POST bro'
