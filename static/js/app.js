let budget = 0;
let products = [];
let currentProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCategories();
    loadCart();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('setBudgetBtn').addEventListener('click', setBudget);
    document.getElementById('budgetInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') setBudget();
    });
    
    document.getElementById('lookupProductBtn').addEventListener('click', lookupProduct);
    document.getElementById('productIdInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') lookupProduct();
    });
    
    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
    
    document.getElementById('searchProducts').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    
    document.getElementById('addFromModalBtn').addEventListener('click', addFromModal);
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const select = document.getElementById('categoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayProducts(productsToDisplay) {
    const container = document.getElementById('productList');
    if (productsToDisplay.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No products found</p>';
        return;
    }
    
    container.innerHTML = productsToDisplay.map(product => {
        const isVariable = product.variable_weight;
        const priceDisplay = isVariable 
            ? `₹${product.price_per_kg}/kg` 
            : `₹${product.price}`;
        const weightDisplay = isVariable 
            ? '<span class="badge bg-success">Weighed Item</span>' 
            : `${product.expected_weight}g`;
        
        return `
            <div class="product-item p-2 mb-2 border-bottom" onclick="showProductLocation('${product.product_id}')">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${product.name}</strong>
                        <br>
                        <small class="text-muted">ID: ${product.product_id}</small>
                        <span class="badge bg-secondary category-badge ms-1">${product.category}</span>
                    </div>
                    <div class="text-end">
                        <span class="text-primary fw-bold">${priceDisplay}</span>
                        <br>
                        <small class="text-muted">${weightDisplay}</small>
                    </div>
                </div>
                <small class="text-success"><i class="bi bi-geo-alt"></i> ${product.aisle}</small>
            </div>
        `;
    }).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = products;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.product_id.toLowerCase().includes(searchTerm)
        );
    }
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    displayProducts(filtered);
}

function showProductLocation(productId) {
    const product = products.find(p => p.product_id === productId);
    if (product) {
        currentProduct = product;
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalAisle').textContent = product.aisle;
        const modal = new bootstrap.Modal(document.getElementById('locationModal'));
        modal.show();
    }
}

function addFromModal() {
    if (currentProduct) {
        document.getElementById('productIdInput').value = currentProduct.product_id;
        if (!currentProduct.variable_weight && currentProduct.expected_weight) {
            document.getElementById('measuredWeightInput').value = currentProduct.expected_weight;
        } else {
            document.getElementById('measuredWeightInput').value = '';
        }
        lookupProduct();
        bootstrap.Modal.getInstance(document.getElementById('locationModal')).hide();
    }
}

function setBudget() {
    const input = document.getElementById('budgetInput');
    budget = parseFloat(input.value) || 0;
    
    if (budget > 0) {
        document.getElementById('budgetDisplay').classList.remove('d-none');
        document.getElementById('totalBudget').textContent = `₹${budget.toFixed(2)}`;
        updateBudgetDisplay();
    }
}

async function updateBudgetDisplay() {
    if (budget <= 0) return;
    
    try {
        const response = await fetch('/api/budget/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ budget: budget })
        });
        const data = await response.json();
        
        document.getElementById('totalSpent').textContent = `₹${data.total_spent.toFixed(2)}`;
        document.getElementById('remainingBudget').textContent = `₹${data.remaining.toFixed(2)}`;
        
        const progressBar = document.getElementById('budgetProgress');
        const percentage = Math.min(data.percentage_used, 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${percentage.toFixed(1)}%`;
        
        progressBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        const alertDiv = document.getElementById('budgetAlert');
        
        if (data.status === 'exceeded') {
            progressBar.classList.add('bg-danger');
            alertDiv.innerHTML = `<div class="alert alert-danger budget-warning mb-0 py-2">
                <i class="bi bi-exclamation-triangle-fill"></i> ${data.message}
            </div>`;
            document.getElementById('remainingBudget').classList.remove('text-success');
            document.getElementById('remainingBudget').classList.add('text-danger');
        } else if (data.status === 'warning') {
            progressBar.classList.add('bg-warning');
            alertDiv.innerHTML = `<div class="alert alert-warning mb-0 py-2">
                <i class="bi bi-exclamation-circle"></i> ${data.message}
            </div>`;
            document.getElementById('remainingBudget').classList.add('text-success');
            document.getElementById('remainingBudget').classList.remove('text-danger');
        } else {
            progressBar.classList.add('bg-success');
            alertDiv.innerHTML = '';
            document.getElementById('remainingBudget').classList.add('text-success');
            document.getElementById('remainingBudget').classList.remove('text-danger');
        }
    } catch (error) {
        console.error('Error checking budget:', error);
    }
}

async function lookupProduct() {
    const productId = document.getElementById('productIdInput').value.trim().toUpperCase();
    if (!productId) {
        showScanResult('Please enter a Product ID', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/product/${productId}`);
        if (response.ok) {
            const product = await response.json();
            document.getElementById('productPreview').classList.remove('d-none');
            document.getElementById('previewName').textContent = product.name;
            
            if (product.variable_weight) {
                document.getElementById('previewPrice').textContent = `₹${product.price_per_kg}/kg`;
                document.getElementById('previewWeight').textContent = 'Variable (weigh item)';
                document.getElementById('previewPrice').classList.add('text-success');
            } else {
                document.getElementById('previewPrice').textContent = `₹${product.price}`;
                document.getElementById('previewWeight').textContent = `${product.expected_weight}g`;
                document.getElementById('previewPrice').classList.remove('text-success');
            }
            
            currentProduct = product;
        } else {
            document.getElementById('productPreview').classList.add('d-none');
            showScanResult('Product not found. Please check the ID.', 'danger');
            currentProduct = null;
        }
    } catch (error) {
        console.error('Error looking up product:', error);
        showScanResult('Error looking up product', 'danger');
    }
}

async function addToCart() {
    const productId = document.getElementById('productIdInput').value.trim().toUpperCase();
    const measuredWeight = parseFloat(document.getElementById('measuredWeightInput').value);
    
    if (!productId) {
        showScanResult('Please enter a Product ID', 'warning');
        return;
    }
    
    if (isNaN(measuredWeight) || measuredWeight <= 0) {
        showScanResult('Please enter a valid measured weight', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                measured_weight: measuredWeight
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showScanResult(data.message, 'success');
            document.getElementById('productIdInput').value = '';
            document.getElementById('measuredWeightInput').value = '';
            document.getElementById('productPreview').classList.add('d-none');
            currentProduct = null;
            loadCart();
            updateBudgetDisplay();
        } else {
            showScanResult(data.error, 'danger');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showScanResult('Error adding item to cart', 'danger');
    }
}

async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        displayCart(data);
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function displayCart(data) {
    const container = document.getElementById('cartItems');
    const countBadge = document.getElementById('cartCount');
    const totalDisplay = document.getElementById('cartTotal');
    
    countBadge.textContent = `${data.item_count} item${data.item_count !== 1 ? 's' : ''}`;
    totalDisplay.textContent = `₹${data.total.toFixed(2)}`;
    
    if (data.cart.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Your cart is empty</p>';
        return;
    }
    
    container.innerHTML = data.cart.map((item, index) => {
        const weightInfo = item.variable_weight 
            ? `${item.measured_weight}g @ ₹${item.price_per_kg}/kg`
            : `Weight: ${item.measured_weight}g`;
        
        return `
            <div class="cart-item">
                <button class="btn btn-outline-danger btn-sm remove-btn" onclick="removeFromCart(${index})">
                    <i class="bi bi-x"></i>
                </button>
                <strong>${item.name}</strong>
                ${item.variable_weight ? '<span class="badge bg-success ms-1" style="font-size: 0.6rem;">Weighed</span>' : ''}
                <div class="d-flex justify-content-between mt-1">
                    <small class="text-muted">${weightInfo}</small>
                    <span class="text-primary">₹${item.price.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
}

async function removeFromCart(index) {
    try {
        const response = await fetch(`/api/cart/remove/${index}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            loadCart();
            updateBudgetDisplay();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

async function clearCart() {
    if (!confirm('Are you sure you want to clear the cart?')) return;
    
    try {
        await fetch('/api/cart/clear', { method: 'DELETE' });
        loadCart();
        updateBudgetDisplay();
        document.getElementById('invoiceSection').classList.add('d-none');
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

async function checkout() {
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            displayInvoice(data.invoice);
            loadCart();
            updateBudgetDisplay();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
    }
}

function displayInvoice(invoice) {
    const container = document.getElementById('invoiceSection');
    const content = document.getElementById('invoiceContent');
    
    const itemsHtml = invoice.items.map(item => {
        const details = item.variable_weight 
            ? `<small class="text-muted">(${item.measured_weight}g @ ₹${item.price_per_kg}/kg)</small>`
            : '';
        return `
            <div class="d-flex justify-content-between">
                <span>${item.name} ${details}</span>
                <span>₹${item.price.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    
    content.innerHTML = `
        <div class="invoice-header">
            <h4><i class="bi bi-receipt"></i> SmartKart</h4>
            <small>Digital Invoice</small>
        </div>
        <div class="mb-2">
            <small><strong>Invoice #:</strong> ${invoice.invoice_number}</small><br>
            <small><strong>Date:</strong> ${invoice.date}</small>
        </div>
        <div class="invoice-items">
            <strong>Items (${invoice.item_count}):</strong>
            ${itemsHtml}
        </div>
        <div class="invoice-total d-flex justify-content-between">
            <span>Total Amount:</span>
            <span class="text-success">₹${invoice.total.toFixed(2)}</span>
        </div>
        <hr>
        <div class="text-center">
            <span class="badge bg-success"><i class="bi bi-check-circle"></i> ${invoice.payment_status}</span>
            <p class="mt-2 mb-0 text-muted small">${invoice.message}</p>
        </div>
    `;
    
    container.classList.remove('d-none');
}

function showScanResult(message, type) {
    const container = document.getElementById('scanResult');
    container.innerHTML = `
        <div class="alert alert-${type} py-2 mb-0">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-circle' : 'x-circle'}"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}
