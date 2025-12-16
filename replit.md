# SmartKart - Smart Shopping Cart Software Prototype

## Overview
SmartKart is a full-stack web application that serves as a software-only prototype to validate the logic of a Smart Shopping Cart system. Hardware components (barcode scanners, RFID readers, load cells, BLE beacons) are simulated through manual inputs.

## Tech Stack
- **Backend**: Python Flask
- **Frontend**: HTML, CSS, JavaScript with Bootstrap 5
- **Data Storage**: Local JSON file

## Project Structure
```
├── app.py                 # Flask application (main backend)
├── data/
│   └── products.json      # Product database
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css      # Custom styles
│   └── js/
│       └── app.js         # Frontend JavaScript
└── replit.md              # Project documentation
```

## Key Features
1. **Product Database**: JSON-based storage with 20 Indian grocery products (prices in ₹)
2. **Simulated Sensor Inputs**: Product ID (barcode/RFID) and measured weight (load cell)
3. **Weight Verification**: ±50g tolerance for item validation
4. **Cart Management**: Add/remove items with real-time total updates
5. **Budget Control**: Set budget, track spending, 80% warning, exceed alerts
6. **Product Navigation**: Search, filter by category, view aisle locations
7. **Billing & Checkout**: Generate digital invoice with simulated payment

## Running the Application
The app runs on Flask development server at `0.0.0.0:5000`

## API Endpoints
- `GET /api/products` - Get all products
- `GET /api/categories` - Get all categories
- `GET /api/product/<id>` - Get single product
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart contents
- `DELETE /api/cart/remove/<index>` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/budget/check` - Check budget status
- `POST /api/checkout` - Process checkout

## Currency
All prices are in Indian Rupees (₹)
