from flask import Flask, render_template, request, jsonify, session
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SESSION_SECRET', 'smartkart-dev-key')

DATA_FILE = 'data/products.json'

def load_products():
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)
    return data['products']

def get_product_by_id(product_id):
    products = load_products()
    for product in products:
        if product['product_id'] == product_id:
            return product
    return None

def get_categories():
    products = load_products()
    categories = set()
    for product in products:
        categories.add(product['category'])
    return sorted(list(categories))

WEIGHT_TOLERANCE = 50

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    products = load_products()
    return jsonify(products)

@app.route('/api/categories', methods=['GET'])
def get_all_categories():
    categories = get_categories()
    return jsonify(categories)

@app.route('/api/product/<product_id>', methods=['GET'])
def get_single_product(product_id):
    product = get_product_by_id(product_id)
    if product:
        return jsonify(product)
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    product_id = data.get('product_id')
    measured_weight = data.get('measured_weight')
    
    if not product_id or measured_weight is None:
        return jsonify({'success': False, 'error': 'Product ID and measured weight are required'}), 400
    
    product = get_product_by_id(product_id)
    if not product:
        return jsonify({'success': False, 'error': 'Product not found'}), 404
    
    is_variable_weight = product.get('variable_weight', False)
    
    if is_variable_weight:
        if measured_weight <= 0:
            return jsonify({
                'success': False,
                'error': 'Please enter a valid weight for this item.'
            }), 400
        
        price_per_kg = product.get('price_per_kg', 0)
        calculated_price = round((measured_weight / 1000) * price_per_kg, 2)
        
        cart_item = {
            'product_id': product['product_id'],
            'name': product['name'],
            'price': calculated_price,
            'price_per_kg': price_per_kg,
            'measured_weight': measured_weight,
            'category': product['category'],
            'aisle': product['aisle'],
            'variable_weight': True,
            'added_at': datetime.now().isoformat()
        }
    else:
        expected_weight = product['expected_weight']
        weight_difference = abs(measured_weight - expected_weight)
        
        if weight_difference > WEIGHT_TOLERANCE:
            return jsonify({
                'success': False,
                'error': f'Weight mismatch! Expected: {expected_weight}g, Measured: {measured_weight}g. Difference ({weight_difference}g) exceeds tolerance of ±{WEIGHT_TOLERANCE}g.',
                'expected_weight': expected_weight,
                'measured_weight': measured_weight,
                'difference': weight_difference
            }), 400
        
        cart_item = {
            'product_id': product['product_id'],
            'name': product['name'],
            'price': product['price'],
            'expected_weight': product['expected_weight'],
            'measured_weight': measured_weight,
            'category': product['category'],
            'aisle': product['aisle'],
            'variable_weight': False,
            'added_at': datetime.now().isoformat()
        }
    
    if 'cart' not in session:
        session['cart'] = []
    
    cart = session['cart']
    cart.append(cart_item)
    session['cart'] = cart
    session.modified = True
    
    return jsonify({
        'success': True,
        'message': f'{product["name"]} added to cart successfully!',
        'item': cart_item,
        'cart': cart
    })

@app.route('/api/cart', methods=['GET'])
def get_cart():
    cart = session.get('cart', [])
    total = sum(item['price'] for item in cart)
    return jsonify({
        'cart': cart,
        'total': total,
        'item_count': len(cart)
    })

@app.route('/api/cart/remove/<int:index>', methods=['DELETE'])
def remove_from_cart(index):
    cart = session.get('cart', [])
    if 0 <= index < len(cart):
        removed_item = cart.pop(index)
        session['cart'] = cart
        session.modified = True
        return jsonify({
            'success': True,
            'message': f'{removed_item["name"]} removed from cart',
            'cart': cart
        })
    return jsonify({'success': False, 'error': 'Invalid cart index'}), 400

@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    session['cart'] = []
    session.modified = True
    return jsonify({'success': True, 'message': 'Cart cleared'})

@app.route('/api/budget/check', methods=['POST'])
def check_budget():
    data = request.json
    budget = data.get('budget', 0)
    cart = session.get('cart', [])
    total_spent = sum(item['price'] for item in cart)
    remaining = budget - total_spent
    percentage_used = (total_spent / budget * 100) if budget > 0 else 0
    
    status = 'ok'
    message = ''
    
    if total_spent > budget:
        status = 'exceeded'
        message = f'Budget exceeded by ₹{abs(remaining):.2f}!'
    elif percentage_used >= 80:
        status = 'warning'
        message = f'Warning: You have used {percentage_used:.1f}% of your budget!'
    
    return jsonify({
        'budget': budget,
        'total_spent': total_spent,
        'remaining': remaining,
        'percentage_used': percentage_used,
        'status': status,
        'message': message
    })

@app.route('/api/checkout', methods=['POST'])
def checkout():
    cart = session.get('cart', [])
    
    if not cart:
        return jsonify({'success': False, 'error': 'Cart is empty'}), 400
    
    total = sum(item['price'] for item in cart)
    
    invoice = {
        'invoice_number': f'INV-{datetime.now().strftime("%Y%m%d%H%M%S")}',
        'date': datetime.now().strftime('%d-%m-%Y %H:%M:%S'),
        'items': cart,
        'item_count': len(cart),
        'total': total,
        'payment_status': 'Simulated - Successful',
        'message': 'Thank you for shopping with SmartKart!'
    }
    
    session['cart'] = []
    session['last_invoice'] = invoice
    session.modified = True
    
    return jsonify({
        'success': True,
        'invoice': invoice
    })

@app.route('/api/invoice', methods=['GET'])
def get_last_invoice():
    invoice = session.get('last_invoice')
    if invoice:
        return jsonify({'success': True, 'invoice': invoice})
    return jsonify({'success': False, 'error': 'No recent invoice found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
