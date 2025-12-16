SmartCart – Smart Shopping Cart Software Prototype

SmartCart is a full-stack web application that demonstrates the software logic of a smart shopping cart system. The project validates automated item handling, budget control, navigation assistance, and billing workflows at the software level. Physical hardware components such as barcode scanners, RFID readers, load cells, and indoor navigation beacons are simulated through software inputs to allow independent verification of the system logic.

This prototype is intended for academic evaluation, software validation, and future extension toward real-world hardware deployment.

Author

Jignesh Katta
B.Tech Computer Science and Engineering
Vellore Institute of Technology, Chennai
Core CSE
Registration Number: 23BCE5077

Technology Stack

Backend

Python

Flask

Frontend

HTML

CSS

JavaScript

Bootstrap 5

Data Storage

Local JSON-based product database

Key Features
Product Management

40 predefined products covering groceries, dairy, snacks, beverages, fruits, and vegetables

All prices represented in Indian Rupees (₹)

Support for both packaged items and variable-weight items

Fruits and vegetables priced dynamically per kilogram

Simulated Sensor Inputs

Product ID input simulates barcode or RFID scanning

Measured weight input simulates load cell readings

Weight verification with a tolerance of ±50 grams for packaged goods

Adjustable weights for fresh produce

Cart and Budget Management

Real-time cart updates with running total

User-defined shopping budget

Automatic warning at 80% budget utilization

Alert when the budget limit is exceeded

Product Navigation

Dedicated navigation section independent of cart contents

Search products by name or product ID

Filter products by category

Display aisle or location information for each product

Designed to be extendable to BLE beacon or indoor positioning systems

Billing and Checkout

Digital invoice generation

Itemized billing with individual prices

Automatic total calculation

Simulated checkout and payment confirmation

Installation and Setup
Clone or Download the Project
git clone https://github.com/KattaJignesh/SMARTCART.git
cd SmartKart

Create a Virtual Environment
python -m venv venv

Activate the Virtual Environment

Windows

venv\Scripts\activate


Mac / Linux

source venv/bin/activate

Install Dependencies
pip install flask

Run the Application
python app.py


Open the application in your browser at:

http://localhost:5000

Project Structure
SmartKart/
├── app.py                 # Flask backend application
├── data/
│   └── products.json      # Product database
├── templates/
│   └── index.html         # Main HTML template
└── static/
    ├── css/
    │   └── style.css      # Custom styles
    └── js/
        └── app.js         # Frontend logic

Usage Guide

Set Budget
Enter the shopping budget in Indian Rupees (₹).

Scan Item
Input a Product ID (e.g., P001, F001, V001) to simulate barcode or RFID scanning.

Weigh Item
Enter the measured weight in grams to simulate load cell input.

Add to Cart
Click “Add to Cart” to verify the item and update the cart.

Checkout
Click “Proceed to Checkout” to generate the digital invoice.

Notes on Hardware Integration

This implementation focuses exclusively on the software layer. In a real-world deployment:

Product ID input would be populated by barcode or RFID scanners

Weight input would be obtained directly from load cell sensors

Navigation could be enhanced using BLE beacons or indoor positioning systems

The software architecture is designed to support direct integration with such hardware components without modification to core business logic.

License

This project is developed for academic and research purposes.
