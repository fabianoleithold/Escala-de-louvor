let people = [];
const adminPassword = 'louvor123'; // Senha do administrador

// Função para obter todos os sábados do mês atual
function getSaturdaysInMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const saturdays = [];

    for (let i = 1; i <= 31; i++) {
        const date = new Date(year, month, i);
        if (date.getMonth() === month && date.getDay() === 6) {
            saturdays.push(date.getDate());
        }
    }

    return saturdays;
}

// Função para preencher os sábados indisponíveis no formulário de registro
function populateUnavailableSaturdays() {
    const saturdays = getSaturdaysInMonth();
    const unavailableDays = document.getElementById('unavailableDays');

    saturdays.forEach(day => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = day;
        checkbox.id = 'day' + day;
        const label = document.createElement('label');
        label.htmlFor = 'day' + day;
        label.textContent = `Sábado, ${day}`;
        const br = document.createElement('br');
        unavailableDays.appendChild(checkbox);
        unavailableDays.appendChild(label);
        unavailableDays.appendChild(br);
    });
}

populateUnavailableSaturdays();

function registerPerson() {
    const personNameInput = document.getElementById('personName').value.trim().toLowerCase();
    const voiceTypeInput = document.getElementById('voiceType').value;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const unavailableDays = Array.from(checkboxes, checkbox => checkbox.value);

    if (personNameInput === '' || unavailableDays.length === 0) {
        alert('Por favor, preencha o nome da pessoa e selecione pelo menos um sábado indisponível.');
        return;
    }

    const isAlreadyRegistered = people.some(person => person.name.toLowerCase() === personNameInput);
    if (isAlreadyRegistered) {
        alert('Este usuário já fez o registro.');
        return;
    }

    const person = {
        name: personNameInput,
        category: voiceTypeInput,
        unavailableDays: unavailableDays
    };

    people.push(person);
    updatePeopleList(); // Atualizar a lista de pessoas cadastradas
    clearForm();
    document.getElementById('adminSection').style.display = 'block';
}

function clearForm() {
    document.getElementById('personName').value = '';
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

function authenticateAdmin() {
    const adminPasswordInput = document.getElementById('adminPassword').value;

    if (adminPasswordInput === adminPassword) {
        generateSchedule();
    } else {
        alert('Senha incorreta. Tente novamente.');
    }
}

function generateSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';

    const saturdays = getSaturdaysInMonth();
    const totalPeople = people.length;
    const availableSopranos = Math.ceil(totalPeople * 0.5);
    const availableContraltos = Math.ceil(totalPeople * 0.25);
    const availableTenores = Math.ceil(totalPeople * 0.25);

    let sopranos = [];
    let contraltos = [];
    let tenores = [];

    people.forEach(person => {
        if (person.category === 'Soprano') {
            sopranos.push(person);
        } else if (person.category === 'Contralto') {
            contraltos.push(person);
        } else if (person.category === 'Tenor') {
            tenores.push(person);
        }
    });

    saturdays.forEach(saturday => {
        let selectedSopranos = sopranos.splice(0, Math.min(availableSopranos, 3));
        let selectedContraltos = contraltos.splice(0, Math.min(availableContraltos, 2));
        let selectedTenores = tenores.splice(0, Math.min(availableTenores, 2));

        const selectedPeople = selectedSopranos.concat(selectedContraltos, selectedTenores);

        const saturdayHeader = document.createElement('h4');
        saturdayHeader.textContent = `Sábado, ${saturday}:`;
        scheduleList.appendChild(saturdayHeader);

        const ul = document.createElement('ul');
        selectedPeople.forEach(person => {
            const li = document.createElement('li');
            li.textContent = `${person.name} (${person.category})`;
            ul.appendChild(li);
        });
        scheduleList.appendChild(ul);
    });

    document.getElementById('output').style.display = 'block';

    // Armazenar a escala gerada no localStorage
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = `${year}-${month}-01`; // Armazenar no primeiro dia do mês
    storeSchedule(date, selectedPeople);
}

function storeSchedule(date, schedule) {
    localStorage.setItem(date, JSON.stringify(schedule));
}

function querySchedule() {
    const queryDate = document.getElementById('queryDate').value;
    const scheduleResult = document.getElementById('scheduleResult');
    const schedule = JSON.parse(localStorage.getItem(queryDate));

    if (schedule) {
        let html = '<h4>Escala para ' + queryDate + ':</h4>';
        html += '<ul>';
        schedule.forEach(person => {
            html += '<li>' + person.name + ' (' + person.category + ')</li>';
        });
        html += '</ul>';
        scheduleResult.innerHTML = html;
    } else {
        scheduleResult.innerHTML = '<p>Nenhuma escala encontrada para a data especificada.</p>';
    }
}

// Função para atualizar a lista de pessoas cadastradas
function updatePeopleList() {
    const peopleList = document.getElementById('peopleList');
    peopleList.innerHTML = '';
    people.forEach(person => {
        const li = document.createElement('li');
        li.textContent = `${person.name} - ${person.category}`;
        peopleList.appendChild(li);
    });
}
