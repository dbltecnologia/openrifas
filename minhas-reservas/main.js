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
const salesRef = database.ref('sales');


function verRifa(route) {
    window.location.href = route
}

function showHideReservas(element) {
    var selected = element.value;
    document.querySelectorAll('.row-rifa').forEach((el) => {
        el.classList.add('d-none')
    });

    if (selected == 0) {
        document.querySelectorAll('.row-rifa').forEach((el) => {
            el.classList.remove('d-none')
        });
    } else {
        document.querySelectorAll(`.rifa-${selected}`).forEach((el) => {
            el.classList.remove('d-none')
        });
    }
}

function loading() {
    var el = document.getElementById('loadingSystem');
    el.classList.toggle("d-none");
}

function startInterface(){
            
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('telephone');

    const cardContainer = document.getElementById('container-reservas');

    salesRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const childData = childSnapshot.val();

            if(childData.type === 0){
                return                
            }
            

            if (childData.telephone.replace(/\D/g, '') === idFromUrl.replace(/\D/g, '')) {

                if(childData.cotas){
                    childData.cotas = childData.cotas.split(',');
                    const total = childData.cotas.length;

                    const cardElement = document.createElement('div');
                    cardElement.innerHTML = `
                        <div class="card-body">
                            <div class="row align-items-center row-gutter-sm">
                                <div class="col-auto">
                                    <div class="position-relative rounded-pill overflow-hidden box-shadow-08"
                                        style="width: 56px; height: 56px;">
                                        <div
                                            style="display: block; overflow: hidden; position: absolute; inset: 0px; box-sizing: border-box; margin: 0px;">
                                            <img alt="" src="${childData.productImage}" decoding="async" data-nimg="fill"
                                                style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;">
                                            <noscript></noscript>
                                        </div>
                                    </div>
                                </div>
                                <div class="col ps-2">
                                    <small class="compra-data font-xss opacity-50">${childData.orderDateTime}</small>
                                    <div class="compra-title font-weight-500">${childData.productName}</div>
                                    <small class="font-xss opacity-75 text-uppercase">Compra Aprovada (${childData.status})</small>
                                    <small class="font-xss opacity-75 text-uppercase">Status (${total})</small>
                                    <div class="compra-cotas font-xs" style="max-height: 200px;overflow: auto;">
                                        ${childData.cotas.map(cota => `<span class="badge bg-success me-1">${cota}</span>`).join('')}
                                    </div
                                </div>
                            </div>
                        </div>
                    `;
                    cardContainer.appendChild(cardElement);
                }
                    


                
            }
        });
    });
    
}

$(document).ready(function() {
    startInterface();    
});