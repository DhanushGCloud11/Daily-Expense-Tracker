// Get HTML elements
const expenseForm = document.getElementById("expenseForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterType = document.getElementById("filterType");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

// Application data
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingId = null;

// Set today's date
const today = new Date().toISOString().split("T")[0];

dateInput.value = today;
dateInput.max = today;

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

// Save transactions in Local Storage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
}

// Update dashboard
function updateDashboard() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    totalIncome.textContent = formatCurrency(income);
    totalExpenses.textContent = formatCurrency(expenses);
    totalBalance.textContent = formatCurrency(income - expenses);
}

// Display transactions
function displayTransactions() {
    transactionList.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;
    const selectedType = filterType.value;

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch =
            transaction.description.toLowerCase().includes(searchValue);

        const matchesCategory =
            selectedCategory === "All" ||
            transaction.category === selectedCategory;

        const matchesType =
            selectedType === "All" ||
            transaction.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
    });

    if (filteredTransactions.length === 0) {
        transactionList.innerHTML =
            '<p class="empty-message">No transactions found.</p>';
        return;
    }

    filteredTransactions.sort((a, b) =>
        b.date.localeCompare(a.date) || b.id - a.id
    );

    filteredTransactions.forEach(transaction => {
        const item = document.createElement("div");
        item.className = "transaction-item";

        const details = document.createElement("div");
        details.className = "transaction-details";

        const title = document.createElement("h3");
        title.textContent = transaction.description;

        const info = document.createElement("p");
        info.textContent =
            `${transaction.category} • ${transaction.date}`;

        details.append(title, info);

        const right = document.createElement("div");

        const amount = document.createElement("div");
        amount.className =
            `transaction-amount ${
                transaction.type === "income" ? "income-text" : "expense-text"
            }`;

        amount.textContent =
            `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`;

        const actions = document.createElement("div");
        actions.className = "actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTransaction(transaction.id));

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTransaction(transaction.id));

        actions.append(editButton, deleteButton);
        right.append(amount, actions);

        item.append(details, right);
        transactionList.appendChild(item);
    });
}

// Add or update transaction
expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    if (date > today) {
        alert("Future dates are not allowed.");
        return;
    }

    const transactionData = {
        description,
        amount,
        type: typeInput.value,
        category: categoryInput.value,
        date
    };

    if (editingId !== null) {
        const index = transactions.findIndex(t => t.id === editingId);

        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                ...transactionData
            };
        }
    } else {
        transactions.push({
            id: Date.now(),
            ...transactionData
        });
    }

    saveTransactions();
    updateDashboard();
    displayTransactions();
    resetForm();
});

// Edit transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);

    if (!transaction) return;

    descriptionInput.value = transaction.description;
    amountInput.value = transaction.amount;
    typeInput.value = transaction.type;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;

    editingId = id;

    formTitle.textContent = "Edit Transaction";
    submitBtn.textContent = "Update Transaction";
    cancelBtn.hidden = false;

    expenseForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Delete transaction
function deleteTransaction(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    transactions = transactions.filter(t => t.id !== id);

    if (editingId === id) {
        resetForm();
    }

    saveTransactions();
    updateDashboard();
    displayTransactions();
}

// Reset form
function resetForm() {
    expenseForm.reset();
    dateInput.value = today;

    editingId = null;

    formTitle.textContent = "Add Transaction";
    submitBtn.textContent = "Add Transaction";
    cancelBtn.hidden = true;
}

// Cancel editing
cancelBtn.addEventListener("click", resetForm);

// Search and filters
searchInput.addEventListener("input", displayTransactions);
filterCategory.addEventListener("change", displayTransactions);
filterType.addEventListener("change", displayTransactions);

// Initial application rendering
updateDashboard();
displayTransactions();
