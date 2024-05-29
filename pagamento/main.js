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

// Initialize Firebase
const database = firebase.database();
const salesRef = database.ref('sales');
const cotasRef = database.ref('cotas');

// Copy function
function copiar() {
    var copyText = document.getElementById("brcodepix");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.getElementById("clip_btn").innerHTML = 'COPIADO';
    alert("Chave PIX COPIA E COLA copiado com sucesso.");
}

// Countdown timer
let freezeTimmer = new Date().setMinutes(new Date().getMinutes());
let countdownDate = new Date().setMinutes(new Date().getMinutes() + -110)
let countDifference = countdownDate - freezeTimmer;
let timerInterval;
const
    qRminutesElem = document.querySelector("#qrminutes"),
    qRsecondsElem = document.querySelector("#qrseconds"),
    timerRunnigContent = document.querySelector("#divCart"),
    timerEndContent = document.querySelector("#divPixTimeOut"),
    cpProgressElementBar = document.querySelector("#cpprogress"),
    qrProgressElementBar = document.querySelector("#qrprogress");

let productData = {};


function startInterface(){
            
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('key');
    
    startDev();

    salesRef.orderByKey().equalTo(idFromUrl).on('value', (snapshot) => {

        const sales = snapshot.val();

        console.log('Iniciando pagamento')
        console.log(sales)

        const pixqrContainer = document.getElementById("pixqrcontainer");
        const pixcontainer = document.getElementById("pixcontainer");
        const productdescription = document.getElementById("productdescription");
        const detalhesProduto = document.getElementById("detalhesProduto");
        
        for (const key in sales) {
        
            const item = sales[key];
            item.orderNumber = Math.floor(Math.random() * 1000);
            item.status = item.status ? 'Confirmado' : 'Aguardando pagamento';
            item.cotas = item.cotas ? item.cotas : 'Aguardando pagamento';
            item.key = key;

            productData = item       
            

            if(item.qrcode.qrCode){
                pixqrContainer.innerHTML = `
                <input type="text" readonly
                    style="width: 100%; height: 40px;background-color: #fff;border: 1px solid #000;border-style: solid;border-radius: 5px;color: #000;"
                    id="brcodepix"
                    value="${item.qrcode.qrCode}">
                </input>
                <button type="button" id="clip_btn" class="btn blob bg-success"
                    style="color: #fff;font-weight: bold;min-width: 130px;margin-left:5px; height: 40px;"
                    data-toggle="tooltip" data-placement="top" title="COPIAR" onclick="copiar()">COPIAR</i></button>`;
            }
            

                    
            pixcontainer.innerHTML = `
                <img src="data:image/png;base64,${item.qrcode.qrCodeBase64}" style="width: 50%;">
            `;   
            
            productdescription.innerHTML = `
            <div class="card-rifa light">
                <div class="img-rifa">
                    <img src="${item.productImage}" alt="" srcset="">
                </div>
                <div class="title-rifa title-rifa-destaque light">
                    <h1>${item.productName}</h1>
                    <p>${item.productName}</p>
                    <div style="width: 100%;">
                        <span class="badge mt-2 bg-success blink">Adquira já!</span>
                        <br>
                        <span class="data-sorteio light" style="font-size: 12px;">Data do sorteio: 
                            ${item.sorteio}
                        </span>
                    </div>
                </div>
            </div> `     


            detalhesProduto.innerHTML = `
                <label>
                    <i class="fas fa-info-circle"></i>&nbsp; Detalhes da sua compra
                </label>
                <br>
                <label>
                    <strong>Ação: </strong> ${item.productName}
                </label>
                <br>
                <label>
                    <strong>Comprador: </strong> ${item.name}
                </label>
                <br>
                <label>
                    <strong>Telefone: </strong> ${item.telephone}
                </label>
                <br>
                <label>
                    <strong>Pedido: </strong> #${item.orderNumber}
                </label>
                <br>
                <label>
                    <strong>Data/horário: </strong> ${item.orderDateTime}
                </label>
                <br>
                <label>
                    <strong>Expira Em: </strong> ${item.expirationDateTime}
                </label>
                <br>
                <label>
                    <strong>Situação: </strong> ${item.status}
                </label>
                <br>
                <label>
                    <strong>Quantidade: </strong> ${item.quantity}
                </label>
                <br>
                <label>
                    <strong>Total: </strong> R$ ${item.totalAmount}
                </label>
                <br>
                <label>
                    <strong>Cotas: </strong>
                    <div id="div-cotas" style="max-height: 200px;overflow: auto;">
                        <span id="cotas-pending">${item.cotas}</span>
                    </div>
                </label>
            `;
        }

        if(!productData.payments)
            sendPayment();

    });
    
    salesRef.child(idFromUrl).child('status').on('value', (snapshot) => {
        const status = snapshot.val();
        if (status === true) {
            document.getElementById("divCart").classList.add('d-none');
            document.getElementById('payment-icon').style.color = 'green';
            document.getElementById('payment-text').innerHTML = 'PAGAMENTO CONFIRMADO!';
            document.getElementById('payment-sub').innerHTML = 'Boa Sorte !';
            //clearInterval(timerPix);
            clearInterval(timerInterval);
            document.getElementById("progress-bar").classList.add('d-none');
            createQuotas();
        }
    });

    const now = new Date().getTime();
    const countdown = now + (60 * 1000 * 60); 

    const startCountdown = () => {
        
        const current = new Date().getTime();
        const difference = (countdown - current) / 1000;

        let countedDifference = Math.floor(difference) * 1000;
        let countedFinalTimmer = Math.floor(countdownDate - freezeTimmer);
        let progressBar = progressBarPercent(countedDifference, countedFinalTimmer);

        if (difference < 1) {
            endCountdown();
        }

        let days = Math.floor((difference / (60 * 60 * 24)));
        let hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
        let minutes = Math.floor((difference % (60 * 60)) / 60);
        let seconds = Math.floor(difference % 60);

        qRminutesElem.innerHTML = formatZero(minutes);
        qRsecondsElem.innerHTML = formatZero(seconds);
        qrProgressElementBar.setAttribute("aria-valuenow", progressBar[0]);
        qrProgressElementBar.classList.add(progressBar[1]);
        qrProgressElementBar.style.width = progressBar[0] + '%'
    }

    const endCountdown = () => {
        document.getElementById("divCart").classList.add('d-none');
        document.getElementById('payment-icon').style.color = 'red';
        document.getElementById('payment-icon').classList = 'fas fa-times-circle';
        document.getElementById('payment-text').innerHTML = 'RESERVA EXPIRADA!'
        document.getElementById('payment-sub').innerHTML = 'Realize uma nova reserva!'
        document.getElementById('cotas-pending').innerHTML = "Expiradas";
        document.getElementById("progress-bar").classList.add('d-none');
        clearInterval(timerInterval);
        document.getElementById("progress-bar").classList.add('d-none');
        clearInterval(timerInterval);
        timerRunnigContent.className = 'hidden';
    }
    
    const expiracao = 10
    window.addEventListener('load', () => {
        if (expiracao > 0) {
            startCountdown();
            timerInterval = setInterval(startCountdown, 1000);
        }
    });
}

const formatZero = (time) => {
    let dateFormated,
        calculated = Math.floor(Math.log10(time) + 1);

    if (calculated < 1) {
        dateFormated = `<span>0${time}</span>`;
    }
    if (calculated === 1) {
        dateFormated = `<span>0${time}</span>`;
    }
    if (calculated > 1) {
        dateFormated = `<span>${time}</span>`;
    }

    return dateFormated;
}

const progressBarPercent = (difference, timeTotal) => {
    let color;
    let percent = Math.floor((difference * 100) / timeTotal);
    switch (percent) {
        case 100:
            color = "bg-success";
            break;
        case 55:
            color = "bg-info";
            break;
        case 35:
            color = "bg-warning";
            break;
        case 25:
            color = "bg-danger";
            break;
    }

    return data = new Array(percent, color);
}

function startDev(){


    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('key');


    setTimeout(() => {   
       console.log('Mudando status do pagamento ')
       salesRef.child(idFromUrl).child('status').set(true);
    }, 5000);

}

function createQuotas() {

    const qtdNCota = productData.qtdNCota;
    const quantity = productData.quantity;
    const numberMin = productData.numberMin;
    const numberMax = productData.numberMax;
    const totalNumbers = productData.totalNumbers;

    console.log('Criando cotas');
    console.log('Produto', productData);
    console.log('Quantidade de números de cada cota para esse produto: ', qtdNCota);
    console.log('Quantidade de cotas que o cliente tá comprando: ', quantity);
    console.log('Total de cotas que o produto pode ter: ', totalNumbers);

    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('key');

    cotasRef.child(idFromUrl).once('value', (snapshot) => {

        const existingCotas = snapshot.val();
        const updatedCotas = existingCotas ? existingCotas.split(', ') : [];

        if (updatedCotas.length >= totalNumbers) {
            Swal.fire({
                title: 'Erro',
                text: 'O Máximo de Cotas já foram geradas! Favor entrar em contato com o suporte!'
            });
            return;
        }

        productData.cotas = [];
        const uniqueNumbers = new Set(updatedCotas.map(Number));

        while (productData.cotas.length < quantity) {
            
            let tmp = new Set();

            while (tmp.size < qtdNCota) {
                let number;
                do {
                    number = Math.floor(Math.random() * (numberMax - numberMin + 1)) + numberMin;
                } while (tmp.has(number) || uniqueNumbers.has(number));
                tmp.add(number);
            }

            const tmpArray = Array.from(tmp);
            productData.cotas.push(tmpArray);
            tmpArray.forEach(num => uniqueNumbers.add(num));
        }


        console.log('Cotas geradas Tamanho: ', productData.cotas.length);
        console.log('Cotas geradas: ', productData.cotas);

        const finalCotas = Array.from(uniqueNumbers).join(', ');
        cotasRef.child(productData.productKey).set(finalCotas);
        salesRef.child(idFromUrl).child('cotas').set(productData.cotas.flat().join(', '));

        Swal.fire({
            title: 'Sucesso',
            text: 'Cotas geradas com sucesso!'
        });

        setTimeout(() => {

           window.location.href = "../index.html";
        }, 10000);
    });
}


function sendPayment() {
    
    const productCost = productData.totalAmount;
    const productDescription = productData.productDescription;
    const payerFirstName = productData.name.split(" ")[0];
    const payerLastName = productData.name.split(" ")[1];
    const payerEmail = "diego.freebsd@gmail.com";
    const identificationNumber = productData.cpf;    

    const data = {

        status: 'Criado',
        transactionAmount: Number(productCost),
        description: productDescription,
        payer: {
            firstName: payerFirstName,
            lastName: payerLastName,
            email: payerEmail,
            identification: {
                type: 'CPF',
                number: identificationNumber,
            }
        },
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('key');

    salesRef.child(idFromUrl).child('payments').set(data);

    Swal.fire({
        title: 'Processando pagamento',
        text: 'Favor realizar o pagamento'
    });
            
};



$(document).ready(function() {
    startInterface();    
});