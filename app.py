from flask import Flask, render_template, request, jsonify
import os, re, datetime
from random import randrange
import psycopg2


app = Flask(__name__,
            static_url_path='',
            static_folder='static')

dbcon = psycopg2.connect(host=os.environ['DB_HOST'],
                       database='hackathon_dev',
                      user=os.environ['DB_USER'],
                     password=os.environ['DB_PASS'])

from controllers import controllers

@app.route("/board", methods=['POST'])
def saveBoard():
    data = request.form
    print("POST BOARD")
    print(data)
    name = request.form.get('name')
    board_json = request.form.get('board')

    cursor = dbcon.cursor()
    cursor.execute('SELECT * FROM public."T_Board" WHERE id_str=%s', [name])
    row = cursor.fetchone()
    if row is not None:
        cursor.execute('UPDATE public."T_Board" set board_json=%s WHERE id_str=%s', 
                        [board_json, name])
    else:
        cursor.execute('INSERT INTO public."T_Board"(board_json, id_str) VALUES(%s, %s)', 
                [board_json, name])
    dbcon.commit()
    cursor.close()
    return "OK!"

@app.route("/board", methods=['GET'])
def getBoard():
    name = request.args.get('name')
    print("GET BOARD")
    print(name)
    cursor = dbcon.cursor()
    cursor.execute('SELECT * FROM public."T_Board" WHERE id_str=%s', [name])
    row = cursor.fetchone()
    if row is not None:
        return row[2]
    else:
        return "noboard"


@app.route("/data", methods=['GET'])
def getData():
    print("serving data")
    return [randrange(0, 15), randrange(0, 15), randrange(0, 15), randrange(0, 15), randrange(0, 15), randrange(0, 15)]


@app.route("/")
def home():
    tab = request.args.get('tab')
    subtab = request.args.get('subtab')
    print(tab)
    print(subtab)
    return app.send_static_file("index.html")

if __name__ == '__main__':
    if "H4C_LOCAL" in os.environ and os.environ['H4C_LOCAL'] == 'true':
        app.run('0.0.0.0', port=8080, debug=True)   
    else:
        app.run('0.0.0.0', port=443, ssl_context=(os.environ['H4C_CRT_FILE_PATH'], os.environ['H4C_KEY_FILE_PATH']))
    
    #
