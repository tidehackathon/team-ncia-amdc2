# thtw23

[User Guide](https://tide.act.nato.int/mediawiki/tidepedia/images/2/2c/TIDE_Hackathon_2023_-_Analytics_Dashboard_for_Interoperability_NCIA_AMDC2_-_User_Guide.pdf)

## Team: NCIA AMCD2

## How to run:

This is a simple Python3 Flask webapplication.

Create a Python virtual environment in this folder (in venv) and activate it.

Install whatever is in requirements.txt

## Required Environment Variables

Set the following environment variables:

* H4C_LOCAL=true if you want to run without https and debug enabled,

otherwise you need to set the following to run over HTTPS:

* H4C_CRT_FILE_PATH

* H4C_KEY_FILE_PATH

* DB_HOST=<host where you restored the backup>

* DB_USER=username for db

* DB_PASS=pass for db

Use the database backup file THTW23_DB_Backup in this folder to restore to any database server

## To Run
Run the entire thing with python3 app.py


## Structure of stuff inside this folder:

* controllers/controllers.py - REST controllers that run queries

* models - not used

* static - standalone frontend, main entry is index.html

* static/lib - all the JS libraries downloaded to freeze and avoid CDN (means it also works on machine without internet or network)

* tests - basic tests
