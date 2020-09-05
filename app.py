from flask import Flask, render_template,request, make_response,jsonify
from datetime import datetime

app = Flask(__name__)

def log(str_, prefix):
    with open("log.txt", "a") as file:
        file.write(f"[{prefix}]:::{datetime.today().strftime('%d-%m-%Y %H:%M:%S')} :: {str_}\n")




@app.route("/")
def home():
    log("{}".format(request.host_url),"Main Access")
    return render_template('index.html', best_point=0,c_level=0)

@app.route("/log_score/<score>")
def log_score(score):
    log("{} :: {}".format(request.host_url, score),"Score")
    return "Score logged succesfully"


@app.route('/log/')
def send_log():
    return jsonify(list(i.replace("\n","") for i in open('log.txt','r').readlines()))

if __name__ == "__main__":
    app.run()