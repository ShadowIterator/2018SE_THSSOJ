#!/bin/bash

printf "Please input your domain: "
read domain
printf "Please input database name: "
read db_database
printf "Please input database user name: "
read db_user
printf "Please input password: "
read -s db_password
printf "Please input superuser name: "
read super_name
printf "Please input superuser email: "
read super_email
printf "Please input superuser password: "
read super_password

secret=$(LC_CTYPE=C tr -dc A-Za-z0-9 < /dev/urandom | fold -w ${1:-128} | head -n 1)

printf "POSTGRES_USER=$db_user\nPOSTGRES_PASSWORD=$db_password\nPOSTGRES_DB=$db_database\n" > .env
printf "db_database = '$db_database'\ndb_user = '$db_user'\ndb_password = '$db_password'\njudgerSecret= '$secret'\nsuperuser_username = '$super_name'\nsuperuser_password = '$super_password'\nsuperuser_email = '$super_email'\n" > backend/settings/env_config.py
printf "domain = 'http://tornado_web:8000'\nsecret = '$secret'\n" > judger/configs.py
printf "const URL = '$domain';\nexport {URL};\n" > frontend/src/ajax-utils/url.js

printf "Configuration files successfully generated.\nNow you can run the following command to get the system start up.\n"
printf "(sudo) docker-compose down\n(sudo) docker-compose build\n(sudo) docker-compose up\n"
