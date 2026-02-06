// Mock Data for the Inventory System
const products = [
    { id: 1, name: "Wireless Headphones", category: "Electronics", quantity: 45, price: 120, status: "In Stock" },
    { id: 2, name: "Mechanical Keyboard", category: "Electronics", quantity: 12, price: 85, status: "In Stock" },
    { id: 3, name: "Ergonomic Office Chair", category: "Furniture", quantity: 5, price: 250, status: "Low Stock" },
    { id: 4, name: "USB-C Hub", category: "Accessories", quantity: 0, price: 40, status: "Out of Stock" },
    { id: 5, name: "Gaming Monitor 27\"", category: "Electronics", quantity: 8, price: 300, status: "Low Stock" },
    { id: 6, name: "Desk Lamp", category: "Furniture", quantity: 30, price: 45, status: "In Stock" },
    { id: 7, name: "Notebook Set", category: "Stationery", quantity: 100, price: 15, status: "In Stock" },
    { id: 8, name: "Bluetooth Mouse", category: "Electronics", quantity: 2, price: 25, status: "Low Stock" },
];

const mockSalesData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    stockIn: [150, 200, 180, 220, 250, 300],
    stockOut: [120, 160, 140, 190, 210, 240]
};

// Application Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Determine if we are running locally or on a server to decide how to load components
    const isLocal = window.location.protocol === 'file:';

    if (isLocal) {
        // Fallback warnings if opened as file://
        console.warn('Running in file:// mode. Fetch API may not work for components. Please use a local server.');
        // In a real scenario, we might inject hardcoded strings here, but for this exercise 
        // we will assume the user sets up a server or we'll try fetch anyway.
        // For robustness, I will try fetch, if it fails, I'll manually set innerHTML for demo.
    }

    try {
        await loadComponent('#sidebar-container', 'sidebar.html');
        await loadComponent('#header-container', 'header.html');
        await loadComponent('#cards-container', 'dashboard-cards.html');

        initializeDashboard();
    } catch (error) {
        console.error("Error loading components:", error);
    }
});

// Component Loader
async function loadComponent(selector, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const html = await response.text();
        document.querySelector(selector).innerHTML = html;
    } catch (e) {
        console.error(e);
        // Fallback logic for file protocol or missing files (Optional for robustness)
        document.querySelector(selector).innerHTML = `<div class="alert alert-danger">Error loading component: ${path}. Please run on localhost.</div>`;
    }
}

// Initialize Logic
function initializeDashboard() {
    updateDate();
    calculateStats();
    renderCharts();
    renderProductTable(products);
    setupSearchListener();
    setupSidebarInteractions();
}

function updateDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

function calculateStats() {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
    const outStock = products.filter(p => p.quantity === 0).length;

    // Simulate daily sales
    const todaySales = "$1,240";

    // Update DOM (Check if elements exist first, they are loaded async)
    if (document.getElementById('total-products')) document.getElementById('total-products').textContent = totalProducts;
    if (document.getElementById('total-stock')) document.getElementById('total-stock').textContent = totalStock;
    if (document.getElementById('low-stock')) document.getElementById('low-stock').textContent = lowStock + outStock; // Grouping low + out
    if (document.getElementById('today-sales')) document.getElementById('today-sales').textContent = todaySales;
}

// Chart Visualization
function renderCharts() {
    const ctxBar = document.getElementById('barChart');
    const ctxPie = document.getElementById('pieChart');

    if (ctxBar && ctxPie) {
        // Bar Chart
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: mockSalesData.months,
                datasets: [
                    {
                        label: 'Stock In',
                        data: mockSalesData.stockIn,
                        backgroundColor: '#4f46e5',
                        borderRadius: 5,
                    },
                    {
                        label: 'Stock Out',
                        data: mockSalesData.stockOut,
                        backgroundColor: '#8b5cf6',
                        borderRadius: 5,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Pie Chart
        const categories = {};
        products.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });

        new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// Table Logic
function renderProductTable(data) {
    const tbody = document.getElementById('product-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach(product => {
        let badgeClass = 'status-instock';
        if (product.status === 'Low Stock') badgeClass = 'status-low';
        if (product.status === 'Out of Stock') badgeClass = 'status-out';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold text-dark">${product.name}</td>
            <td class="text-muted">${product.category}</td>
            <td class="fw-bold">${product.quantity}</td>
            <td><span class="status-badge ${badgeClass}">${product.status}</span></td>
            <td>
                <button class="btn btn-sm btn-light text-primary"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-light text-danger"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setupSearchListener() {
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            );
            renderProductTable(filtered);
        });
    }
}

// Navigation Placeholder
function navigate(page) {
    // Prevent default anchor behavior is handled by onclick returning false usually, but here we just update UI

    // Update active class
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        // Simple check if the click target or its parent was this item
        // In a real app we'd pass 'this' or use event delegation
    });

    // Find the clicked element (this is a bit tricky with 'onclick' inline without passing 'this')
    // Instead, let's just re-attach listeners after sidebar loads
}

// Add this to initializeDashboard or component loader
async function setupSidebarInteractions() {
    // Wait for sidebar to be in DOM
    const sidebar = document.querySelector('#sidebar-container');
    if (!sidebar) return;

    // Use event delegation
    sidebar.addEventListener('click', (e) => {
        const link = e.target.closest('.menu-item');
        if (link) {
            e.preventDefault();
            document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
            link.classList.add('active');
            console.log("Navigated to:", link.innerText.trim());
        }
    });
}
