FROM python:3.7

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN mkdir -p judge_script root/homeworks root/judge_html_temp root/problems root/records root/servefiles root/tmp test
COPY requirements.txt /usr/src/app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /usr/src/app
CMD ["python", "-u", "main.py"]