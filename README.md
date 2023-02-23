# thtw23

Team: NCIA AMCD2

How to run:

This is a simple Python3 Flask webapplication.

Create a Python virtual environment in this folder (in venv) and activate it.
Install whatever is in requirements.txt
set the following environment variables 

H4C_LOCAL=true if you want to run without https and debug enabled,
otherwise you need to set
H4C_CRT_FILE_PATH
H4C_KEY_FILE_PATH
to run over HTTPS

DB_HOST=host where you restored the backup
DB_USER=username for db
DB_PASS=pass for db

use the database backup file THTW23_DB_Backup in this folder to restore to any database server


run the entire thing with python3 app.py

structure of stuff inside this folder:
controllers/controllers.py - REST controllers that run queries
models - not used
static - standalone frontend, main entry is index.html
static/lib - all the JS libraries downloaded to freeze and avoid CDN (means it also works on machine without internet or network)
tests - basic tests
