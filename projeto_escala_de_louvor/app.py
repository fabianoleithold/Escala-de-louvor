from flask import Flask, render_template, request, redirect, url_for
import json
from datetime import datetime, timedelta
import random

app = Flask(__name__)

# Função para carregar e salvar dados no JSON
def load_users():
    try:
        with open('data/users.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

def save_users(users):
    with open('data/users.json', 'w') as file:
        json.dump(users, file, indent=4)

# Rota inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para cadastrar usuários
@app.route('/add_user', methods=['GET', 'POST'])
def add_user():
    if request.method == 'POST':
        users = load_users()
        users.append({
            'name': request.form['name'],
            'voice': request.form['voice'],
            'phone': request.form['phone']
        })
        save_users(users)
        return redirect(url_for('list_users'))
    return render_template('add_user.html')

# Rota para listar usuários
@app.route('/list_users')
def list_users():
    users = load_users()
    return render_template('list_users.html', users=users)

# Rota para adicionar disponibilidade
@app.route('/add_availability', methods=['GET', 'POST'])
def add_availability():
    if request.method == 'POST':
        users = load_users()
        user_name = request.form['name']
        available_dates = request.form.getlist('dates')
        for user in users:
            if user['name'] == user_name:
                user['availability'] = available_dates
        save_users(users)
        return redirect(url_for('list_users'))
    users = load_users()
    next_month = (datetime.now().replace(day=28) + timedelta(days=4)).month
    next_year = (datetime.now().replace(day=28) + timedelta(days=4)).year
    saturdays = []
    for day in range(1, 32):
        try:
            if datetime(next_year, next_month, day).weekday() == 5:
                saturdays.append(day)
        except ValueError:
            continue
    return render_template('add_availability.html', users=users, saturdays=saturdays)

# Rota para gerar a escala
@app.route('/generate_schedule')
def generate_schedule():
    users = load_users()
    schedule = {}
    next_month = (datetime.now().replace(day=1) + timedelta(days=32)).month
    next_year = datetime.now().year
    saturdays = [d for d in range(1, 32) 
                 if datetime(next_year, next_month, d).day == d 
                 and datetime(next_year, next_month, d).weekday() == 5]

    voice_counts = {'soprano': 1, 'contralto': 1, 'tenor': 2}
    for day in saturdays:
        day_schedule = {'soprano': [], 'contralto': [], 'tenor': []}
        for voice in day_schedule.keys():
            available_users = [user for user in users if user['voice'] == voice and str(day) in user.get('availability', [])]
            print(voice, available_users)
            if len(available_users) >= len(day_schedule[voice]):
                try:
                    day_schedule[voice] = random.sample(available_users, voice_counts[voice])
                except:
                    day_schedule[voice] = []
        schedule[day] = day_schedule

    formatted_schedule = {
        date: {
            voice: ", ".join([user['name'] for user in users])
            for voice, users in voices.items()
        } for date, voices in schedule.items()
    }
    print('formatted_schedule', formatted_schedule)
    return render_template('schedule.html', schedule=formatted_schedule)

if __name__ == '__main__':
    app.run(debug=True)
