
// Variables

var startDate = new Date();
var endDate = new Date('');
var dateDiff;
var days, hours, minutes, seconds;
var $day = $('#dias');
var $hour = $('#horas');
var $minute = $('#minutos');
var $second = $('#segundos');
var $debug = $('#debug');
var timer;

var tempo = new Number(900);
var qtd = 1;

var qtdNumbers = 10000;
var valorFinal = 0

// Constants
const valuePrices = 0.35
const descontos = '[{"numeros":25,"desconto":1},{"numeros":50,"desconto":1},{"numeros":100,"desconto":2},{"numeros":250,"desconto":2}]';
const urlParams = new URLSearchParams(window.location.search);
const idFromUrl = urlParams.get('id');

let total;
let productData = {};
let numeroAleatorio = 0

// Firebase Config
var firebaseConfig = {
    apiKey: "AIzaSyBvYdKJIQjkqToxJVVwbOo7WG7pN7PCacE",
    authDomain: "antoniofilho-ef6a2.firebaseapp.com",
    databaseURL: "https://antoniofilho-ef6a2-default-rtdb.firebaseio.com",
    projectId: "antoniofilho-ef6a2",
    storageBucket: "antoniofilho-ef6a2.appspot.com",
    messagingSenderId: "637424531884",
    appId: "1:637424531884:web:cad8ccb57a1edaa8516209",
    measurementId: "G-F09W9QJCWM"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();



// Initialize Mercado Pago
const mp = new MercadoPago("APP_USR-63df9498-165e-4212-81e5-5ddda9e21c91");

// Initialize Firebase
const database = firebase.database();  


// Firebase
const cardRef = database.ref('cards');
const salesRef = database.ref('sales');


cardRef.orderByKey().equalTo(idFromUrl).on('value', (snapshot) => {


    const cards = snapshot.val();

    const cardContainer = document.getElementById('cardContainer');
    const cardDescription = document.getElementById('cardDescription');
    const premios = document.getElementById('premios');
    const hiddenData = document.getElementById('hiddenData')
    const promocoes = document.getElementById('promocoes')

    cardContainer.innerHTML = '';
    cardDescription.innerHTML = '';
    premios.innerHTML = '';

    for (const key in cards) {
        
        const card = cards[key];     
        productData = card



        if (card.type === 0) {
            console.log('Tipo 0', key)
            continue;
        } 

        const cardElement = document.createElement('div');
        cardElement.innerHTML = `
            <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner" style="margin-top: -20px;">
                    <div class="carousel-item active" style="margin-top: 30px;" id="slide-foto-101">
                        <img src="${card.image}"
                            style="border-top-right-radius: 20px;border-top-left-radius: 20px; "
                            class="d-block w-100" alt="..." />
                    </div>
                </div>

                <div class="title-rifa-destaque light">
                    <h1>${card.title}</h1>
                    <p>${card.description}</p>
                    <div style="width: 100%;">
                        <span class="badge mt-2 bg-success blink">Adquira já!</span>
                    </div>
                </div>
            </div>
        `;

        premios.innerHTML = `
            <div class="col-md-12 text-center">
                <label><strong>Prêmio 1: </strong>${card.title}</label>
            </div>
        `;
        cardContainer.appendChild(cardElement);

        const hiddencardElement = document.createElement('div');
        hiddencardElement.innerHTML = `    
            <input type="hidden" id="qtdManual">
            <input type="hidden" class="form-control" name="productName" value="${card.productName}">            
        `;
        hiddenData.appendChild(hiddencardElement);


        const promocoesElement = document.createElement('div');
        promocoesElement.innerHTML = `
            <div class="card-body body-promo light">
                <div class="row">
                    ${card.promocoes.map(promocao => `
                        <div class="col-6" style="margin-bottom: 8px;" onclick="addQtd('${promocao.qtd}', '${promocao.value}')">
                            <div class="bg-success" style="color: #fff; text-align: center; border-radius: 6px;">
                                <strong>${promocao.qtd} POR - R$: ${promocao.value}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        promocoes.appendChild(promocoesElement);
    }

    for (const key in cards) {
        
        const card = cards[key];
        
        const cardElement = document.createElement('div');
        cardElement.innerHTML = `
            <div class="container mt-4"></div>
            <div class="" style="">
                <h5 class="mt-1 title-promo light">
                    📋 Descrição
                </h5>
            </div>
            <div class="card mt-3 desc light">
                <p>
                    <p><font color="#000000" style="background-color: rgb(255, 255, 0);">${card.rules}</font></p>
                </p>
            </div>`;

        cardContainer.appendChild(cardElement);
    }

    
    
});

function getRandomParticipants() {
    return new Promise((resolve, reject) => {
        const cardRef = database.ref('participants');
        cardRef.on('value', (snapshot) => {
            const participants = snapshot.val();
            const arrayParticipants = [];
            
            for (const key in participants) {
                const participant = participants[key];
                arrayParticipants.push(participant.name);
            }            

            const randomParticipant = arrayParticipants[Math.floor(Math.random() * arrayParticipants.length)];
            resolve(randomParticipant);
        }, (error) => {
            reject(error);
        });
    });
}

function getParticipantsByPhone(phone) {
    return new Promise((resolve, reject) => {
        const cardRef = database.ref('participants');
        cardRef.on('value', (snapshot) => {
            const participants = snapshot.val();
            const filteredParticipants = [];
            
            for (const key in participants) {
                const participant = participants[key];
                if (participant.phone === phone) {
                    filteredParticipants.push(participant);
                }
            }            

            resolve(filteredParticipants);
        }, (error) => {
            reject(error);
        });
    });
}


// Uteis

function infoParticipante(msg) {
    Swal.fire(msg)
}

function update() {
    var diffMilissegundos = endDate - startDate;
    var diffSegundos = Math.floor(diffMilissegundos / 1000);
    var diffMinutos = Math.floor(diffSegundos / 60);
    var diffHoras = Math.floor(diffMinutos / 60);
    var diffDias = Math.floor(diffHoras / 24);

    seconds = diffSegundos % 60;
    minutes = diffMinutos % 60;
    hours = diffHoras % 24;
    days = diffDias;

    $day.text(days);
    $hour.text(hours);
    $minute.text(minutes);
    $second.text(seconds);

    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        window.location.reload();
    }

    startDate.setSeconds(startDate.getSeconds() + 1);
}


function startCountdown() {
    if (tempo >= 0) {
        var minutes = Math.floor(tempo / 60);
        var seconds = tempo % 60;

        var formattedTime = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        $("#promoMinutes").html(formattedTime);

        setTimeout(startCountdown, 1000);
        tempo--;
    } else {
        window.open('../controllers/logout.php', '_self');
    }
}


function validarQtd() {
    var numbersA = parseInt(document.getElementById('numbersA').value);
    var qtdMaximoNum = productData.totalNumbers;
    var disponivel = parseInt('999968');
    if (numbersA > disponivel) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Quantidade indisponível!',
            footer: 'Disponível: ' + disponivel
        });
    } else {
        if (numbersA > qtdMaximoNum) {
            $("#numbersA").css('border-color', 'red')
            $("#numbersA").val(qtdMaximoNum)
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Quantidade máxima de numeros selecionados não pode ser maior que ' + qtdMaximoNum + '!',
            });
        } else {

            qtdNumbers = numbersA;
            valorFinal = qtdNumbers * valuePrices;

            console.log('## validarQtd Quantidade', qtdNumbers)
            console.log('## Valor', valorFinal)

            
            openModalCheckout();
        }
    }
}

function openModalCheckout() {
    $('#qtd-checkout').text(qtdNumbers)
    $('#rifa-checkout').text(productData.title)
    $('#staticBackdrop').modal('show')
}

function validaMaxMin(operacao) {
    const input = document.getElementById('numbersA');
    var oldValue = input.value
    var max = parseInt(input.max)
    var min = parseInt(input.min)

    if (operacao === '+') {
        var newValue = parseInt(oldValue) + 1;
        if (newValue > max) return false;
    } else if (operacao === '-') {
        var newValue = parseInt(oldValue) - 1;
        if (newValue < min) return false;
    }

    return true;
}

function infoPromo() {
    Swal.fire('Escolha os números abaixo, o desconto será aplicado automaticamente!');
}

function addQtd(e, valor = null) {
    const input = document.getElementById('numbersA');
    const qtdMaximoNum = productData.numberMax;
    const qtdManimaNum = productData.numberMin;

    console.log('Adicionando')
    console.log('Quantidade', e)    
    console.log('Valor', valor)       
    
    if (valor != null) {
        
        qtdNumbers = e;
        valorFinal = valor;

        openModalCheckout();

        
    } else {
        if (e === '+') {
            input.value = parseInt(input.value) + 1;
        } else if (e === '-') {
            if (input.value <= qtdManimaNum) {
                $("#numbersA").val(qtdManimaNum);
                return;
            }
            input.value = parseInt(input.value) - 1;
        } else {
            input.value = parseInt(input.value) + parseInt(e);
        }

        if (input.value >= qtdMaximoNum) {
            $("#numbersA").css('border-color', 'red');
            $("#numbersA").val(qtdMaximoNum);
        } else {
            $("#numbersA").css('border-color', 'green');
        }

    }
}




function openModal() {    
    $('#exampleModal').modal('show');
}

function loading() {
    var el = document.getElementById('loadingSystem');
    el.classList.toggle("d-none");
}

function checkCustomer() {

    var phone = $('#telephone1').val()
    if (phone == null || phone == '') {
        alert('Informe o telefone para continuar!');
        $('#telephone1').focus();
        return;
    } else if (phone.length < 8) {
        alert('Informe um telefone válido!');
        $('#telephone1').select();
        return;
    }

    loading()

    getParticipantsByPhone(phone)
        .then(function(response) {
            loading()
            if (response.customer == null) {
                novoCliente(phone);
            } else {
                findCustomer(response.customer)
            }
        })
        .catch(function(error) {
            Swal.fire(
                'Erro Desconhecido!',
                '',
                'error'
            )
        });
}

function findCustomer(customer) {
    console.log('findCustomer')
    
    document.getElementById('customer-name').innerHTML = customer.nome;
    document.getElementById('customer-phone').innerHTML = customer.telephone;
    document.getElementById('name').value = customer.nome;
    document.getElementById('phone-cliente').value = customer.telephone;

    document.getElementById('customer').value = customer.id;
    document.getElementById('div-customer').classList.toggle('d-none');
    document.getElementById('btn-checkout').innerHTML = 'Concluir reserva';
    document.getElementById('btn-checkout-action').setAttribute("onclick", "loading()")
    document.getElementById('btn-checkout-action').type = 'submit'
    document.getElementById('btn-alterar').innerHTML = 'Alterar Conta';
    document.getElementById('btn-alterar').classList.remove('d-none');
    document.getElementById('div-info').classList.add('d-none');
    document.getElementById('div-telefone').classList.add('d-none');
}

function clearModal() {
    document.getElementById('div-nome').classList.add('d-none');
    document.getElementById('info-footer').innerHTML = 'Informe seu telefone para continuar.';
    document.getElementById('btn-checkout').innerHTML = 'Continuar';
    document.getElementById('btn-checkout-action').setAttribute("onclick", "checkCustomer()")
    document.getElementById('btn-alterar').classList.add('d-none');
    document.getElementById('btn-checkout-action').type = 'button'
    document.getElementById('phone-cliente').value = ''
    document.getElementById('customer').value = 0;
    document.getElementById('div-customer').classList.add('d-none');
    document.getElementById('div-info').classList.remove('d-none');
    document.getElementById('div-telefone').classList.remove('d-none');
    document.getElementById('div-cpf').classList.remove('d-none');
}

function novoCliente(phone) {
    document.getElementById('div-nome').classList.toggle('d-none');
    document.getElementById('btn-checkout-action').setAttribute("onclick", "checkCpf()")
    document.getElementById('btn-checkout-action').type = 'button'
    document.getElementById('phone-cliente').value = phone
    document.getElementById('customer').value = 0;
}

function checkCpf() {
    document.getElementById('div-cpf').classList.toggle('d-none');
    document.getElementById('info-footer').innerHTML = 'Informe os dados corretos para recebimento das premiações.';
    document.getElementById('btn-checkout').innerHTML = 'Concluir cadastro e pagar';
    document.getElementById('btn-checkout-action').setAttribute("onclick", "loading()")
    document.getElementById('btn-checkout-action').type = 'submit'
    document.getElementById('btn-alterar').classList.innerHTML = 'Alterar informações';
    document.getElementById('btn-alterar').classList.toggle('d-none');
}


function getLastBuyers(){
    getRandomParticipants()
    .then((participant) => {
        document.getElementById('messageIn').innerHTML = participant + ' acabou de comprar';
    })
}


function search(event){
    event.preventDefault();
    const telephone3 = document.getElementById('telephone3').value;
    window.location.href = `../minhas-reservas/index.html?telephone=${telephone3}`;    
}

function finish(event){
    event.preventDefault();    

    const form = document.getElementById('form-checkout');
    const inputs = form.getElementsByTagName('input');

    const quantity = parseInt(document.getElementById('numbersA').value);


    console.log('Quantidade comprada:', quantity, qtdNumbers)

    const allItems = {};

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const name = input.getAttribute('name');
        const value = input.value;

        allItems[name] = value;
    }

    if(allItems['telephone'] === '' || allItems['telephone'] === null){
        alert('Informe o telefone para continuar!');
        return;
    }

    if(allItems['name'] === '' || allItems['name'] === null){
        alert('Informe o nome para continuar!');
        return;
    }

    if(allItems['cpf'] === '' || allItems['cpf'] === null){
        alert('Informe o CPF para continuar!');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');

    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);

    const expiresDate = new Date();
    expiresDate.setMinutes(expiresDate.getMinutes() + 10);

    const expires = expiresDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });    
    const options = { day: '2-digit', month: 'long', year: 'numeric' };

    const sorteioDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()).toLocaleDateString('pt-BR', options);
    
    const valor = valorFinal * qtdNumbers


    allItems['type'] = 0;
    allItems['productKey'] = idFromUrl;
    allItems['productImage'] = productData.image;
    allItems['productName'] = productData.title;
    allItems['sorteio'] = sorteioDate;
    allItems['orderNumber'] = Math.floor(Math.random() * 1000000);
    allItems['orderDateTime'] = new Date().toLocaleDateString('pt-BR', options);
    allItems['expirationDateTime'] = expires;
    allItems['status'] = 'Aguardando pagamento';
    allItems['numberMax'] = productData.numberMax;
    allItems['numberMin'] = productData.numberMin;
    allItems['productDescription'] = productData.description;
    allItems['quantity'] = qtdNumbers;
    allItems['qtdNCota'] = productData.qtdNCota;
    allItems['totalAmount'] = valor;
    allItems['totalNumbers'] = productData.totalNumbers ? productData.totalNumbers : 1000;
    allItems['datetime'] = new Date().toISOString();
    allItems['qrcopiacola'] = "00020126580014br.gov.bcb.pix013693c1114f-8a83-4589-a81f-348c8be099b0520400005303986540510.005802BR5917BHBRUNOHENRIQUE986011so sebastio62240520mpqrinter725593379576304860B";
    allItems['qrcode'] = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABWQAAAVkAQAAAAB79iscAAAPP0lEQVR4Xu3XWZJcOQ5E0dhB73+XtYNoEwY6COLJ1GbJUkb29Y8QBwA8L//0en9Q/nn1k+8ctPeC9l7Q3gvae0F7L2jvBe29oL0XtPeC9l7Q3gvae0F7L2jvBe29oL0XtPeC9l7Q3gvae0F7L2jvBe29oL0XtPeC9l7Q3gvae0F7L2jvBe29oL0XtPeC9l7Q3gvae0F7L2jvBe29VO2r5z+/zvST+dXlP6rTgHbbVrHNedq2i5ocjxZtBi1aD1q0HrRoPWjRetCi9XyyVufbVl3blONMnvjZeqssM90eJWhfaK0E7QutlaB9obUStC+0VoL2hdZK0L7QWsmP0aq/avNC2zb9aNu0MSd7o9guzq+a51nQovWgRetBi9aDFq0HLVoPWrSen6bNca1EZ+2iltgHbYlircRrPxa02wXaDFq0HrRoPWjRetCi9aBF6/lZWpH3rvKsOqYz+zc68qeebR2xPRkRtNuZ/Yt2KkPrmabE9mRE0G5n9i/aqQytZ5oS25MRQbud2b9opzK0nmlKbE9GBO12Zv+incq+ubZt65A2rlG2i7nD0kq2C50paNvF3GFBm9v6Ynsb7TpT0LaLucOCNrf1xfY22nWmoG0Xc4cFbW7ri+1ttOtMQdsu5g4L2tzWF9vbf13bItS/+3My0H7Vz8lA+1U/JwPtV/2cDLRf9XMy0H7Vz8lA+1U/JwPtV/2cDLRf9XMy0H7Vz8n4eO0f5Z/ojyH2H0g7e9X/McZKZ9ttlFu2KdH4GLRoPWjRetCi9aBF60GL1oMWreeTtfmsYscCNJ4eq6st9VvU+/svVYnOLGi3oF27HjtG20fVh9Ba0KL1oEXrQYvWgxat5+9p28z2tkrmbT6h2xqb94631aGzqeQYhTZva04K2tb1my3aPgpt3tacFLSt6zdbtH0U2rytOSloW9dvtmj7KLR5W3NS0Lau32z/fa2V6WdueMX0zGGUW4r88APVHmrFWbcmryXa2KJF61u0aH2LFq1v0aL1LVq0vkX7kVpLVlSK3tlK9MTxLdvbv+fVj8ziYd5aokUbOWq3M7Ro0UamXhUP89YSLdrIUbudoUWLNjL1qniYt5Zo0ZZduYxx261WGmcnlaLvy0zf3L5edfUW7RstWrTlFu0bLVq05RbtGy1atOX2x2g1U5SK33hHrDgznbW/g0Xb2qHHdRG3WqPdgtaCFq0HLVoPWrQetGg9aNF6Pka71UbyM6LOVubOn+P7Hr90+1yVPJ7VLVq0HrRoPWjRetCi9aBF60GL1vPJWstZW3lb2vepRB1tpXlxkVP0fapr34w2LrKjrdDWM7QrmoK2XukWLVq0qkOL1ldo0foK7V/SWtYgz6RQ/6HNs/bO/M3bF6iu3mobZ/seLdrImuBBi9aDFq0HLVoPWrQetGg931ercbGKityqX+/kxdQWK21zQK1rJe8nRpRoPZehLXWt5P3EiBKt5zK0pa6VvJ8YUaL1XIa21LWS9xMjSrSey9CWulbyfmJEidZzGdpS10reT4wo0XouQ1vqWsn7iRElWs9laEtdK3k/MaJE67kMbalrJe8nRpRoPZehLXWt5P3EiBKt57LvqzWKrSwpa9C6tbQPar02T8ZzwOp5uK0PrSVatMd5NE+8cxza7RZtPnb02jy0aH0eWrQ+Dy1an4cWrc/7em2bXt/OSfFsvt1W1W1TMpqs8e3rG1RtaNGiRYt2bXOF1rcRtC+0FrQvtBa0L7SWz9VWSvux1i0JidTBelt1usizJpseql9lQYvWgxatBy1aD1q0HrRoPWjRej5Zq+R0JUrUmonbpESyt64ycZBnx7dsX1CD1oIWrQctWg9atB60aD1o0XrQfrDWorKjwZ7d+q2gruzF/Km3Oa991fGQbvWnqoK19KhiqN22b7RoM1ZQV2jR+gotWl+hResrtGh9hRatr/5trUWtNdllm+o5V4rmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+OkCbYvmxcG5ylfr+Onik7UaUgF2sUHbhW51FvlnfcF2dnQ8zNNFBC1aD1q0HrRoPWjRetCi9aBF6/lkrdVmNFjbqLPoQr0nvn64Bkz4dpvbGrRoPWjRetCi9aBF60GL1oMWredztS3xSHrqs+22fZWSHfUzNsX0B6q9x4fv+5I6xIIWrQctWg9atB60aD1o0XrQovV8N63V6ue9xmWXZsYqS2qHoi9o8/K2Xejx+qTIaBW0ClqvQ4vW69Ci9Tq0aL0OLVqvQ/tZ2ky+Fl32b73IwfukUlyTn9t4B9RWD72rYy1LjoYXWrRoV4f9i7ZeoPXVQ+/qWMuSo+GFFi3a1WH/oq0XaH310Ls61rLkaHih/X/S2n2szv72zjDp7J2g21fVb96+Ph61EgUtWg9atB60aD1o0XrQovWgRev5MdrpnfpiG6cz9drtQ3F9yLI9qWJ9AdrjxYfi+pAFLVoPWrQetGg9aNF60KL1oP02Wks12lZdtsp3IkbZvqr1akDtPb8g1u3dbR5atBm0aLNtLT1o0XrQovWgRetBi9bzQVobt02KPHjUsQ6Ksb7dBrxqW2zPXq0iaLe2OEOL1s/QovUztGj9DC1aP0OL1s/QfpK2zozLs2vj2XEFqG3abn+H9pHTtlriTGu02xYt2r1O2yjJurZF+xte26JFu9dpGyVZ17Zof8NrW7Ro9zptoyTr2hbtb3hti/YDtQ1q06Ohv6O3NUBnTas29baHdHaQ0aL1oEXrQYvWgxatBy1aD1q0ng/XxuoVg2O14Q/ytq3vnMVVlnXHqC1o0XrQovWgRetBi9aDFq0HLVrPz9Ba2mN1a+/osddO2ToaqhYr29BjioIWrQctWg9atB60aD1o0XrQovX8DG32a3B9W8/mhabXt89tnGVUUr9ge/LYRsla2s6fQIvWn0CL1p9Ai9afQIvWn0CL1p9Ai9af+AStZsb8ND61FpTcraP2tqF2tn1Q+9vU8Ra0aD1o0XrQovWgRetBi9aDFq3n47WpaD+1a8pUl1/Qtkr9Fn1k+1HQos0BWtf+8wct2lMxZapDm6n95w9atKdiylSHNlP7zx+0aE/FlKkObab2nz/fTfubca3rXT/N3okfO8vbmiyJ2+3DG9QSF7mKoM3bGrRoPWjRetCi9aBF60GL1oP2s7Rx1HkaF/0yTltNsd52tnmOtNv2V0KrKdbbztCiRYu2nqFFixZtPUOLFu2naNuQ6LOzCW/J6U17nG111Z0lutVPjKqvrSVatOv8hdbO0L7Q2hnaF1o7Q/tCa2doX2jtDO3rg7Tqr7w2WK3vSqmePIuV1W1vt7rH11ovWp3FyurQovU6tGi9Di1ar0OL1uvQovU6tJ+lVRpvm6mLViJAfayhdKt5W5s+SK9F0KL1oEXrQYvWgxatBy1aD1q0ns/VzjJLbfBoFVGJ6tpZxuonfP161SloVYc2g3aM1aN1CVq0LkGL1iVo0boELVqXfE+tLqdWzbTY7TZuGlC/vv1Yxza0nuVq/1Ot5fgYWrT+GFq0/hhatP4YWrT+GFq0/hhatP7Y99Va9ssyJG63bc0JqAN0a9GXNrzGt3lxtpYetN2DFi3aDFoPWrQetGg9aNF60H5rbR1i20x9u72TbY2nEnXoWXVM8+pF/qyLtURbO9BGq20zaL1jmocWLdo+HW1eoEWLdrWhRfu3tJZotWRXu2hf1d6JVW6jrn1u+7O0z9W2Ba2CdktToO0D0Lbpre5Y5Tbq0L4PBdo+AG2b3uqOVW6jDu37UKDtA9C26a3uWOU26tC+D8UnaBUNqUUbrwJSoRe1tX/bvNqhTKPitbX0bG3H9AjakmlUvLaWnq3tmB5BWzKNitfW0rO1HdMjaEumUfHaWnq2tmN6BG3JNCpeW0vP1nZMj6AtmUbFa2vp2dqO6RG0JdOoeG0tPVvbMT2CtmQaFa+tpWdrO6ZH0JZMo+K1tfRsbcf0CNqSaVS8tpaere2YHvkO2la7KvoTVfFaz+aqUeqZLtQ7Tc4vjWK0uXp6B63Xzu+gHSejzai3dtjZNMUu1DtNRptRb+2ws2mKXah3mow2o97aYWfTFLtQ7zQZbUa9tcPOpil2od5pMtqMemuHnU1T7EK902S0GfXWDjubptiFeqfJaDPqrR12Nk2xC/VOk/8XrQ2xrbnbTEE3irbr3s/qSvOyLTpUp7Q/WnRorcrYov0VtUUHWrTegRatd6BF6x1o0XoHWrTegfZ7aadYo4xNq5WKH7f6Kjtu2umbs28F7cMWbYsGtxXa3pt9K2gftmhbNLit0Pbe7FtB+7BF26LBbYW292bfCtqHLdoWDW6rv66N6crm0eqIPbu9ffRuZ/973XpoLdGu3gfFn9ath9YS7ep9UPxp3XpoLdGu3gfFn9ath9YS7ep9UPxp3XpoLdGu3gfFn9ath9YS7ep9UPxp3XpoLdGu3gfFn9ath9YS7ep9UPxp3XpoLdGu3gfFn9ath9by47QbRa1GmSYJ2l6sA/IizrbEqSXfUF29taBF60GL1oMWrQctWg9atB60aD0fro0xkk3v6KtMm6sp7UtbR71tOb8UbQtaC1q0HrRoPWjRetCi9aBF6/kJ2lfMjJK23b6qdmxDqyzHR1Kr4jYF7dGxDUWLFq0HLVoPWrQetGg9aNF6foJ2m6QXa9vZMfXOFzbqHBq3WzHax975wkadQ+MW7dkx9c4XNuocGrdoz46pd76wUefQuEV7dky984WNOofGLdqzY+qdL2zUOTRu0Z4dU+98YaPOoXGL9uyYeucLG3UOjVu0Z8fUO1/YqHNo3KI9O6be+cJGnUPj9mdp27adKfXtfCfetOSFxTwVlavYtsmW7UsjaPMxbdCi9aBF60GL1oMWrQctWg/aT9O2tIb2mG7zrE7ZvrSWZF3taOPzVqPW2VqiHUrQbmXHOLRofwWtb6MubzVqna0l2qEE7VZ2jEOL9lfQ+jbq8laj1tlaoh1K/j+13z9o7wXtvaC9F7T3gvZe0N4L2ntBey9o7wXtvaC9F7T3gvZe0N4L2ntBey9o7wXtvaC9F7T3gvZe0N4L2ntBey9o7wXtvaC9F7T3gvZe0N4L2ntBey9o7wXtvaC9F7T3gvZe0N4L2nv5MO1/AS5uk5dXKdRuAAAAAElFTkSuQmCC";

    console.log('allItems: ', allItems);  


    const database = firebase.database();
    const salesRef = database.ref('sales');
    const newSaleRef = salesRef.push(allItems);
    const pushKey = newSaleRef.key;

    const message = document.createElement('div');
    message.textContent = 'Favor aguarde...';
    document.body.appendChild(message);

    setTimeout(() => {
        valorFinal = 0
        qtdNumbers = 0
        window.location.href = `../pagamento/index.html?key=${pushKey}`;
    }, 10000);

}

function dismissModal(){
    $('#staticBackdrop').modal('hide')
}

function startInterface(){
    
    getLastBuyers();
    startCountdown();  

    $('.fechar-modal').click(function(){
        $('#staticBackdrop').modal('hide')
    })
    $('#staticBackdrop').on('hide.bs.modal', function() {
        clearModal()
    })

    $('input.keydown').on('keydown', function(e) {
        var code = e.which || e.keyCode;

        if (code == 13) {
            event.preventDefault();
            checkCustomer()
        }
    });
}
    
// Starting interface

startInterface()