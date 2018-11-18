import requests

print("request res")
res = requests.get('http://127.0.0.1:8001/judge/' + 'xxxxxxx' + '/')
print(res.text)