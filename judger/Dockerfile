FROM phusion/baseimage:master

CMD ["/sbin/my_init"]

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y python3 python3-dev python3-pip curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get update && apt-get install -y nodejs

COPY requirements.txt /usr/src/app/
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . /usr/src/app

RUN make

CMD ["python3", "-u", "JudgerServer.py"]

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
