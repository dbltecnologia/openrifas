const mercadopago = require('mercadopago');
const firebase = require('firebase-admin');  
// const mercadoPagoAccessToken = "APP_USR-2864466641074428-022111-a07098446a2ea720b560b2dc97ff53d1-321577763"
const mercadoPagoAccessToken = "APP_USR-5735246619593649-100802-a37c308cb1b2e92d89781b392ac61755-123275461"
const express = require("express");

const cors = require('cors');

mercadopago.configurations.setAccessToken(mercadoPagoAccessToken);

// Initialize Firebase
const functions = require("firebase-functions");

const firebaseConfig = {
  databaseURL: "https://antoniofilho-ef6a2-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

const processedItems = [];

exports.processSales = functions.database.ref('sales/{saleId}').onWrite(async (change, context) => {  
  const saleId = context.params.saleId;
  const saleData = change.after.val();

  if (saleData.payments && saleData.payments.status === 'Criado' && !processedItems.includes(saleId)) {
    try {
      processedItems.push(saleId);

      const dataPayment = {
        payment_method_id: "pix",
        description: saleData.payments.description,
        transaction_amount: Number(saleData.payments.transactionAmount),
        payer: {
          email: saleData.payments.payer.email,
          first_name: saleData.payments.payer.firstName,
          last_name: saleData.payments.payer.lastName,
          identification: {
            type: saleData.payments.payer.identification.type,
            number: saleData.payments.payer.identification.number,
          }
        }
      };

      const { response } = await mercadopago.payment.create(dataPayment);
      const dataSave = {
        id: response.id,
        status: response.status,
        detail: response.status_detail,
        qrCode: response.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: response.point_of_interaction.transaction_data.qr_code_base64,
      };

      saleData.payments.status = 'Aguardando pagamento';

      await firebase.database().ref('sales').child(saleId).child('qrcode').set(dataSave);
      await firebase.database().ref('sales').child(saleId).child('payments').child('status').set('Aguardando pagamento');

      await firebase.database().ref('payments').child(response.id).set({saleId: saleId, status: response.status, datetime: new Date().toISOString()});

      setTimeout(() => {
        const index = processedItems.indexOf(saleId);
        if (index > -1) {
          processedItems.splice(index, 1);
        }
      }, 60000);

    } catch (error) {
      console.log(error);
      const { errorMessage, errorStatus } = validateError(error);
      console.log(errorMessage, errorStatus);

      saleData.payments.error = errorMessage;
      saleData.payments.status = 'Falha';

      await firebase.database().ref('sales').child(saleId).child('payments').update(saleData);
    }
  }
});


function validateError(error) {
  let errorMessage = 'Unknown error cause';
  let errorStatus = 400;

  if(error.cause) {
    const sdkErrorMessage = error.cause[0].description;
    errorMessage = sdkErrorMessage || errorMessage;

    const sdkErrorStatus = error.status;
    errorStatus = sdkErrorStatus || errorStatus;
  }

  return { errorMessage, errorStatus };
}


const app = express();
app.use(cors({ origin: true }));

const paymentCallback = (req, res) => {

    const response = req.body;

    if(response && response.action === 'payment.updated') {

        const paymentRef = firebase.database().ref('payments').child(response.data.id);

        paymentRef.once('value', (snapshot) => {
            const paymentData = snapshot.val();
            const saleId = paymentData.saleId;
        
            firebase.database().ref('sales').child(saleId).child('qrcode').update({status: 'Finalizado', detail: 'Finalizado', datetimeUpdated: new Date().toISOString()});
            firebase.database().ref('sales').child(saleId).child('payments').update({status: 'Finalizado', datetimeUpdated: new Date().toISOString()});
            firebase.database().ref('sales').child(saleId).child('status').set(true);
    
            console.log('Pagamento Status atualizado para finalizado', saleId);
            res.sendStatus(200); 

        });
    } else {        
        res.sendStatus(200); 

    }

    
};

app.post("/paymentcallback", paymentCallback);

exports.api = functions.https.onRequest(app);
