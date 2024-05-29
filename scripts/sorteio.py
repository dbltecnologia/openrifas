import random
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

class FirebaseDatabase:
    def __init__(self):
        cred = credentials.Certificate('firebase.json')
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://antoniofilho-ef6a2-default-rtdb.firebaseio.com/'
        })
        self.ref = db.reference()

    def read_data(self, path):
        return self.ref.child(path).get()

    def write_data(self, path, data):
        self.ref.child(path).push(data).key
        
    def set_data(self, path, data):
        self.ref.child(path).set(data)

    def update_data(self, path, data):
        self.ref.child(path).update(data)


def perform_raffle(cotas, productKey):        
    for key in cotas:
        
        print(f"Key: {key}")
        
        if key != productKey:
            continue
        
        numbers = cotas[key].split(',')
        random_numbers = random.sample(numbers, 10)
        print(f"Sorteio para a chave {key}: {random_numbers}")
     



# Instantiate the FirebaseDatabase class
firebase_db = FirebaseDatabase()

productKey = "-Nr2VWx8vEzavpFnjd1i"

sales = firebase_db.read_data('sales')
sales_filter = []

for key in sales:            
    
    if sales[key]['productKey'] != productKey:
        continue
    
    print(f"Adicionando Sales: {sales[key]}")
    sales_filter.append(sales[key].cotas)
    

print('sales_filter', sales_filter)   

# Read data from a specific path
# data = firebase_db.read_data('cotas')

# perform_raffle(data, productKey)
