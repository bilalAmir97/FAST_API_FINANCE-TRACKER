// assets/js/main.js - Main JavaScript file for handling interactions and API calls.

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Router: Decide which page's logic to run ---
    if (document.querySelector('.login-card') && document.getElementById('loginForm')) {
        handleLoginPage();
    } else if (document.getElementById('registerForm')) {
        handleRegisterPage();
    } else if (document.querySelector('.app-layout')) {
        setupSidebarToggle(); // Initialize sidebar toggle
        // Check for specific page indicators
        if (document.querySelector('.history-table')) {
            handleHistoryPage();
        } else {
            handleDashboardPage();
        }
    }

});

/**
 * Handles the responsive sidebar toggle.
 */
function setupSidebarToggle() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content'); // Optional: for closing on click outside

    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate close
            sidebar.classList.toggle('is-active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                sidebar.classList.contains('is-active') && 
                !sidebar.contains(e.target) && 
                !hamburgerBtn.contains(e.target)) {
                sidebar.classList.remove('is-active');
            }
        });
    }
}

/**
 * Handles logic for the History Page
 */
async function handleHistoryPage() {
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    const display = document.getElementById('username-display');
    if (display) display.textContent = username;

    try {
        console.log(`Fetching history for: ${username}`);
        const response = await fetch(`${API_BASE_URL}/transactions/${username}`);
        const rawData = await response.json();
        console.log("Raw History Data:", rawData);

        // Handle different response structures (Array vs Object)
        let transactions = [];
        if (Array.isArray(rawData)) {
            transactions = rawData;
        } else if (rawData.transactions && Array.isArray(rawData.transactions)) {
            transactions = rawData.transactions;
        }

        const tableBody = document.getElementById('history-table-body');
        const searchInput = document.getElementById('history-search');

        function renderTable(txs) {
            tableBody.innerHTML = ''; // Clear existing rows

            if (!txs || txs.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: rgba(255,255,255,0.5);">No transactions found.</td></tr>';
                return;
            }

            txs.forEach(tx => {
                let typeClass = '';
                let amountClass = '';
                let counterparty = '-';
                let typeLabel = tx.type || 'Unknown';
                let statusBadge = '<span class="status-badge completed">Completed</span>';

                // Determine styling based on transaction type
                if (tx.type === 'deposit' || tx.type === 'transfer_in') {
                    amountClass = 'deposit'; // Green
                    typeClass = 'text-success';
                    if (tx.type === 'transfer_in') {
                        typeLabel = 'Received';
                        counterparty = tx.from_user || 'Unknown';
                    }
                } else if (tx.type === 'withdrawal' || tx.type === 'transfer_out') {
                    amountClass = 'withdrawal'; // Red
                    if (tx.type === 'transfer_out') {
                        typeLabel = 'Transfer';
                        counterparty = tx.to_user || 'Unknown';
                    }
                }

                // Format Date
                const dateObj = new Date(tx.timestamp);
                const dateStr = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

                const row = document.createElement('tr');
                row.className = 'history-row'; // Class for animation
                
                // Apply colors inline or via class in CSS (assuming .deposit/.withdrawal classes exist)
                const amountColor = amountClass === 'deposit' ? '#55efc4' : '#ff7675';

                row.innerHTML = `
                    <td>${dateStr}</td>
                    <td style="text-transform: capitalize;">${typeLabel}</td>
                    <td>${counterparty}</td>
                    <td>${statusBadge}</td>
                    <td class="text-right" style="color: ${amountColor}; font-weight: bold;">
                        ${amountClass === 'deposit' ? '+' : '-'}$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Trigger Stagger Animation for rows
            if (window.gsap) {
                gsap.from(".history-row", {
                    y: 20,
                    opacity: 0,
                    stagger: 0.05,
                    duration: 0.5,
                    ease: "power2.out",
                    clearProps: "all" // Clear props after animation to avoid layout issues
                });
            }
        }

        // Initial Render
        renderTable(transactions);

        // Filter Logic
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = transactions.filter(tx => 
                    (tx.type && tx.type.toLowerCase().includes(term)) || 
                    (tx.to_user && tx.to_user.toLowerCase().includes(term)) ||
                    (tx.from_user && tx.from_user.toLowerCase().includes(term))
                );
                renderTable(filtered);
            });
        }

    } catch (error) {
        console.error('History load error:', error);
        const tableBody = document.getElementById('history-table-body');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ff7675;">Error loading data.</td></tr>';
    }
}

/**
 * Handles logic for the Registration Page
 */
function handleRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const pin = document.getElementById('regPin').value;

        if (!/^\d{4}$/.test(pin)) {
            alert('PIN must be a 4-digit number.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    email: email,
                    phone: phone,
                    pin: pin
                })
            });

            if (response.ok) {
                alert('Account Created! Please login.');
                window.location.href = 'index.html';
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please check your connection.');
        }
    });
}

/**
 * Handles all logic for the Login Page
 */
function handleLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = loginForm.querySelector('#username').value;
        const pin = loginForm.querySelector('#password').value;

        if (!username || !/^\d{4}$/.test(pin)) {
            alert('Please enter a valid username and 4-digit PIN.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/authenticate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin })
            });

            if (response.ok) {
                // Store username for dashboard use
                localStorage.setItem('username', username);
                
                // Set flag for welcome message
                sessionStorage.setItem("justLoggedIn", "true");

                // Animation and Redirect
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.detail}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please check your connection.');
        }
    });
}

/**
 * Handles all logic for the Dashboard Page
 */
function handleDashboardPage() {
    const username = localStorage.getItem('username');
    if (!username) {
        alert('Please log in first.');
        window.location.href = 'index.html';
        return;
    }

    // --- Initial Data Fetch ---
    fetchDashboardData(username);
    
    // --- Initialize Gold Dust Particles ---
    createGoldDust();

    // --- Modal & Transaction Logic ---
    const modal = document.getElementById('transaction-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const transactionForm = document.getElementById('transaction-form');
    const recipientGroup = document.getElementById('recipient-group');
    const recipientInput = document.getElementById('recipient-username');
    let currentTransactionType = null;

    function openModal(type) {
        currentTransactionType = type;
        modalTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Funds';
        
        // Toggle Recipient Field
        if (type === 'transfer') {
            recipientGroup.classList.remove('hidden');
            recipientInput.setAttribute('required', 'true');
        } else {
            recipientGroup.classList.add('hidden');
            recipientInput.removeAttribute('required');
        }
        
        window.animateModalOpen(modal);
    }

    function closeModal() {
        window.animateModalClose(modal);
        transactionForm.reset();
        currentTransactionType = null;
    }

    // Event Listeners for opening modal (Sidebar)
    document.getElementById('nav-deposit').addEventListener('click', (e) => { e.preventDefault(); openModal('deposit'); });
    document.getElementById('nav-withdraw').addEventListener('click', (e) => { e.preventDefault(); openModal('withdraw'); });
    
    // Quick Access Event Listeners
    document.getElementById('qa-deposit').addEventListener('click', () => openModal('deposit'));
    document.getElementById('qa-withdraw').addEventListener('click', () => openModal('withdraw'));
    document.getElementById('qa-transfer').addEventListener('click', () => openModal('transfer'));
    document.getElementById('qa-cards').addEventListener('click', () => {
        alert("Cards feature coming soon!");
    });

    // Sidebar Transfer Link (assuming you add an ID or selector for it)
    const transferLink = document.querySelector('a[href="transfers.html"]'); // Currently it points to a page, we hijack it for modal
    if (transferLink) {
        transferLink.addEventListener('click', (e) => { 
            e.preventDefault(); 
            openModal('transfer'); 
        });
    }

    // Also bind quick action buttons if they exist
    const payBtn = document.querySelector('.action-btn.pay');
    if(payBtn) payBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('deposit'); });
    
    const reqBtn = document.querySelector('.action-btn.request');
    if(reqBtn) reqBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('withdraw'); });
    
    const sendBtn = document.querySelector('.action-btn.send');
    if(sendBtn) sendBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('transfer'); });


    closeModalBtn.addEventListener('click', closeModal);

    // Handle Transaction Submit
    transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('trans-amount').value);
        
        if (!amount || amount <= 0) {
            window.showDynamicIsland('Please enter a valid amount', 'error');
            window.animateModalShake(modal);
            return;
        }

        try {
            let endpoint, body;

            if (currentTransactionType === 'transfer') {
                const toUser = recipientInput.value;
                if (!toUser) {
                    window.showDynamicIsland('Please enter a recipient', 'error');
                    window.animateModalShake(modal);
                    return;
                }
                endpoint = '/transfer';
                body = JSON.stringify({ from_user: username, to_user: toUser, amount });
            } else {
                endpoint = currentTransactionType === 'deposit' ? '/deposit' : '/withdraw';
                body = JSON.stringify({ username, amount });
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });

            const data = await response.json();

            if (response.ok) {
                window.showDynamicIsland(`${currentTransactionType.charAt(0).toUpperCase() + currentTransactionType.slice(1)} Successful`, 'success');
                closeModal();
                if (currentTransactionType === 'transfer') {
                    window.fireConfetti();
                }
                fetchDashboardData(username); // Refresh data
            } else {
                window.showDynamicIsland(data.detail || 'Transaction failed', 'error');
                window.animateModalShake(modal);
            }
        } catch (error) {
            console.error('Transaction error:', error);
            window.showDynamicIsland('Network error', 'error');
        }
    });

    // --- Profile Dropdown Logic ---
    const profileToggle = document.querySelector('.profile-toggle');
    const profileDropdown = document.getElementById('profile-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (profileToggle && profileDropdown) {
        // Toggle Dropdown
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Close on Outside Click
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileToggle.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });

        // Handle Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Clear session/local storage
                localStorage.removeItem('username');
                sessionStorage.clear();
                
                // Animation and Redirect
                document.body.classList.add('fade-out');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            });
        }
    }
}

/**
 * Fetches and renders user data from the backend.
 */
async function fetchDashboardData(username) {
    try {
        // 1. Fetch Balance
        const balanceRes = await fetch(`${API_BASE_URL}/balance/${username}`);
        if (!balanceRes.ok) throw new Error('Failed to fetch balance');
        const balanceData = await balanceRes.json();

        // 2. Fetch Transactions
        const txRes = await fetch(`${API_BASE_URL}/transactions/${username}`);
        if (!txRes.ok) throw new Error('Failed to fetch transactions');
        const txData = await txRes.json();

        // 3. Render Data
        renderDashboard(username, balanceData.balance, txData.transactions);

    } catch (error) {
        console.error('Dashboard load error:', error);
        // Handle error (e.g., show notification)
    }
}

/**
 * Updates the DOM with fetched data.
 */
function renderDashboard(username, balance, transactions) {
    // Check for welcome message
    if (sessionStorage.getItem("justLoggedIn") === "true") {
        if (window.showDynamicIsland) {
             window.showDynamicIsland("Welcome back, " + username + "!", "success");
        }
        sessionStorage.removeItem("justLoggedIn");
    }

    // Update Header
    document.getElementById('username-display').textContent = username;
    document.getElementById('account-status').textContent = 'Active';
    document.getElementById('account-type').textContent = 'Premium Savings';

    // Animate Balance
    if (window.animateBalanceCount) {
        window.animateBalanceCount('#balance-amount', balance);
    } else {
        document.getElementById('balance-amount').textContent = '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Render Transactions
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = ''; 

    if (!transactions || transactions.length === 0) {
        activityList.innerHTML = '<p style="text-align:center; padding: 1rem; color: rgba(255,255,255,0.5);">No recent activity.</p>';
    } else {
        // 1. Sort by date (newest first)
        // Assuming 'timestamp' is an ISO string, which sorts correctly as string or date
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // 2. Limit to 5
        const recentTransactions = sortedTransactions.slice(0, 5);

        recentTransactions.forEach(tx => {
            let iconClass, colorClass, description, amountPrefix;
            
            if (tx.type === 'deposit') {
                iconClass = 'fa-arrow-down';
                colorClass = 'deposit'; // Green
                description = 'Deposit';
                amountPrefix = '+';
            } else if (tx.type === 'withdrawal') {
                iconClass = 'fa-arrow-up';
                colorClass = 'withdrawal'; // Red
                description = 'Withdrawal';
                amountPrefix = '-';
            } else if (tx.type === 'transfer_out') {
                iconClass = 'fa-paper-plane';
                colorClass = 'withdrawal';
                description = `Transfer to ${tx.to_user}`;
                amountPrefix = '-';
            } else if (tx.type === 'transfer_in') {
                iconClass = 'fa-hand-holding-usd';
                colorClass = 'deposit';
                description = `Received from ${tx.from_user}`;
                amountPrefix = '+';
            }

            // Parse date
            const date = new Date(tx.timestamp).toLocaleDateString();

            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="icon ${colorClass}"><i class="fas ${iconClass}"></i></div>
                <div class="activity-info">
                    <h3>${description}</h3>
                    <p>${date}</p>
                </div>
                <div class="activity-amount ${colorClass}">
                    ${amountPrefix}$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            `;
            activityList.appendChild(item);
        });

        // 3. "View All" Logic
        if (transactions.length > 5) {
            const viewAllBtn = document.createElement('a');
            viewAllBtn.href = 'history.html';
            viewAllBtn.className = 'view-all-btn';
            viewAllBtn.innerHTML = 'View Full Activity <i class="fas fa-chevron-right"></i>';
            activityList.appendChild(viewAllBtn);
        }
    }

    // Trigger Dashboard Entry Animation
    if (window.animateDashboardPage) {
        window.animateDashboardPage();
    }
}

/**
 * Shows a Dynamic Island notification.
 * @param {string} message The message to display.
 * @param {string} type The type of notification ('success', 'error').
 */
window.showDynamicIsland = (message, type) => {
    let island = document.querySelector('.dynamic-island');
    if (!island) {
        island = document.createElement('div');
        island.className = 'dynamic-island';
        document.body.appendChild(island);
    }

    // Icon based on type
    const iconClass = type === 'success' ? 'fa-check-circle' : 
                      type === 'error' ? 'fa-times-circle' : 'fa-info-circle';

    island.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;

    // Add active class to animate in
    // Use requestAnimationFrame to ensure DOM update before adding class if newly created
    requestAnimationFrame(() => {
        island.classList.add('active');
    });

    // Hide after 3 seconds
    setTimeout(() => {
        island.classList.remove('active');
    }, 3000);
};

/**
 * Creates the Gold Dust particle effect.
 */
function createGoldDust() {
    const container = document.createElement('div');
    container.className = 'dust-container';
    
    for (let i = 0; i < 30; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust';
        
        // Randomize properties
        const left = Math.random() * 100;
        const duration = Math.random() * 15 + 15; // 15s to 30s
        const delay = Math.random() * 20; // 0s to 20s delay
        
        dust.style.left = `${left}%`;
        dust.style.animationDuration = `${duration}s`;
        dust.style.animationDelay = `-${delay}s`; // Negative delay to start mid-animation
        
        container.appendChild(dust);
    }
    
    document.body.appendChild(container);
}
