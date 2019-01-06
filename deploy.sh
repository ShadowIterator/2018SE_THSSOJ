#!/bin/bash

printf "Please input your domain: "
read domain
printf "Please input database name: "
read db_database
printf "Please input database user name: "
read db_user
printf "Please input password: "
read -s db_password
printf "\nPlease input superuser name: "
read super_name
printf "Please input superuser email: "
read super_email
printf "Please input superuser password: "
read -s super_password

secret=$(LC_CTYPE=C tr -dc A-Za-z0-9 < /dev/urandom | fold -w ${1:-128} | head -n 1)
cookiesecret=$(LC_CTYPE=C tr -dc A-Za-z0-9 < /dev/urandom | fold -w ${1:-32} | head -n 1)

printf "POSTGRES_USER=$db_user
POSTGRES_PASSWORD=$db_password
POSTGRES_DB=$db_database\n" > .env

printf "db_database = '$db_database'
db_user = '$db_user'
db_password = '$db_password'
judgerSecret= '$secret'
superuser_username = '$super_name'
superuser_password = '$super_password'
superuser_email = '$super_email'
AppConfig = {
    'debug': False,
    'cookie_secret':'$cookiesecret',
}\n"> backend/settings/env_config.py

mkdir -p backend/judge_script 
mkdir -p backend/root/homeworks 
mkdir -p backend/root/judge_html_temp 
mkdir -p backend/root/problems 
mkdir -p backend/root/records 
mkdir -p backend/root/servefiles 
mkdir -p backend/root/tmp 
mkdir -p backend/test

printf "domain = 'http://tornado_web:8000'
secret = '$secret'\n" > judger/configs.py

printf "const URL = '$domain';
export {URL};\n" > frontend/src/ajax-utils/url.js

printf "Configuration files successfully generated.
Now you can run the following command to get the system start up.\n"

printf "(sudo) docker-compose down
(sudo) docker-compose build
(sudo) docker-compose up -d\n"
