## SmartKart – Smart Shopping Cart Software Prototype

SmartKart is a full-stack web application that demonstrates the software logic of a smart shopping cart system. The project focuses on validating item verification, budget management, product navigation, and billing workflows at the software layer.

Physical hardware components such as barcode scanners, RFID readers, load cells, and indoor navigation systems are simulated through controlled software inputs to allow independent testing and evaluation of the system logic.

This prototype is designed for academic evaluation, software validation, and future extension toward real-world hardware deployment.

---

## Author

**Jignesh Katta**
B.Tech – Computer Science and Engineering (Core)
Vellore Institute of Technology, Chennai
Registration Number: **23BCE5077**

---

## Technology Stack

**Backend**

* Python 3.11
* Flask

**Frontend**

* HTML5
* CSS3
* JavaScript (ES6)
* Bootstrap 5

**Data Storage**

* Local JSON file

---

## Key Features

### Product Management

* Product database containing groceries, dairy products, snacks, beverages, fruits, and vegetables
* Prices represented in Indian Rupees (₹)
* Support for both fixed-weight and variable-weight items

### Simulated Sensor Inputs

* Product ID input simulates barcode or RFID scanning
* Weight input simulates load cell measurements
* Weight tolerance of ±50 grams for packaged items
* Dynamic pricing for fruits and vegetables based on weight

### Cart and Budget Control

* Real-time cart updates with running total
* User-defined shopping budget
* Warning when spending reaches 80% of the budget
* Alert when the budget limit is exceeded

### Product Navigation

* Dedicated navigation section independent of cart contents
* Search products by name or product ID
* Filter products by category
* Display aisle or location information for each product

### Billing and Checkout

* Digital invoice generation
* Itemized billing with individual prices
* Automatic total calculation
* Simulated checkout and payment confirmation

---

## Installation and Setup

### Prerequisites

* Python 3.8 or higher

### Steps

```bash
# Clone the repository
git clone https://github.com/KattaJignesh/SMARTCART.git
cd SmartKart

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install flask

# Run the application
python app.py
```

Open the application in your browser at:

```
http://localhost:5000
```

---

## Project Structure

```
SmartKart/
├── app.py                 Flask backend server
├── README.md              Project documentation
├── data/
│   └── products.json      Product database
├── templates/
│   └── index.html         Main HTML template
└── static/
    ├── css/
    │   └── style.css      Custom styles
    └── js/
        └── app.js         Frontend logic
```

---

## Usage

1. Set the shopping budget in Indian Rupees (₹).
2. Enter a Product ID to simulate barcode or RFID scanning.
3. Enter the measured weight in grams to simulate load cell input.
4. Add the item to the cart and monitor budget updates.
5. Proceed to checkout to generate the digital invoice.

---

## Simulated Hardware Components

| Hardware Component      | Simulation Method           |
| ----------------------- | --------------------------- |
| Barcode Scanner         | Manual Product ID input     |
| RFID Reader             | Manual Product ID input     |
| Load Cell               | Manual weight input (grams) |
| Indoor Navigation (BLE) | Aisle/location mapping      |

---

## Core Logic Overview

### Weight Verification

* For packaged items, the measured weight is compared with the expected weight stored in the database.
* Items are accepted if the absolute difference is within ±50 grams.

### Variable Weight Pricing

* Fruits and vegetables are priced per kilogram.
* Final price is calculated dynamically based on the entered weight.

### Budget Monitoring

* Spending below 80% of the budget is considered safe.
* Spending at or above 80% triggers a warning.
* Spending beyond the budget triggers an alert.

---

## License

This project is developed for academic and educational purposes.

---

## Future Scope

* Integration with real barcode or RFID scanners
* Load cell sensor integration via microcontroller (ESP32/Raspberry Pi)
* BLE-based indoor positioning for real-time navigation
* POS and payment gateway integration


