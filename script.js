// Initialize empty arrays for earnings and expenses
let earnings = [];
let expenses = [];
let budget = 0;
let myBarChart; // Variable to hold Chart.js bar chart instance
let myPieChart; // Variable to hold Chart.js pie chart instance

const categories = {
    Housing: ['Rent', 'Mortgage', 'Property Taxes', 'Home Insurance'],
    Utilities: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone'],
    Transportation: ['Fuel', 'Public Transport', 'Car Insurance', 'Maintenance'],
    Food: ['Groceries', 'Dining Out', 'Takeout'],
    Entertainment: ['Movies', 'Concerts', 'Hobbies', 'Streaming Services'],
    Healthcare: ['Medical Bills', 'Insurance', 'Prescriptions'],
    Education: ['Tuition', 'Books', 'Supplies', 'Courses'],
    PersonalCare: ['Clothing', 'Grooming', 'Fitness'],
    Debt: ['Loan Repayments', 'Credit Card Payments'],
    Miscellaneous: ['Gifts', 'Donations', 'Other']
};

// Function to load data from localStorage
function loadDataFromStorage() {
    const storedData = JSON.parse(localStorage.getItem('expenseTrackerData'));
    if (storedData) {
        earnings = storedData.earnings || [];
        expenses = storedData.expenses || [];
        budget = storedData.budget || 0;
    }
}

// Function to save data to localStorage
function saveDataToStorage() {
    const data = { earnings, expenses, budget };
    localStorage.setItem('expenseTrackerData', JSON.stringify(data));
}

// Function to add earnings
function addEarnings() {
    const incomeSource = document.getElementById('incomeSource').value;
    const incomeAmount = parseFloat(document.getElementById('incomeAmount').value);
    const incomeDate = document.getElementById('incomeDate').value;

    if (incomeSource && !isNaN(incomeAmount) && incomeAmount > 0 && incomeDate) {
        earnings.push({ source: incomeSource, amount: incomeAmount, date: incomeDate });
        saveDataToStorage();
        updateUI();
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
        document.getElementById('incomeDate').value = '';
    } else {
        alert('Please enter a valid source, amount, and date for earnings.');
    }
}

// Function to add expenses
function addExpense() {
    const expenseCategory = document.getElementById('expenseCategory').value;
    const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
    const expenseDate = document.getElementById('expenseDate').value;

    if (expenseCategory && !isNaN(expenseAmount) && expenseAmount > 0 && expenseDate) {
        expenses.push({ category: expenseCategory, amount: expenseAmount, date: expenseDate });
        saveDataToStorage();
        updateUI();
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDate').value = '';
    } else {
        alert('Please enter a valid category, amount, and date for expenses.');
    }
}

// Function to delete earnings at a specific index
function deleteEarnings(index) {
    earnings.splice(index, 1);
    saveDataToStorage();
    updateUI();
}

// Function to delete expenses at a specific index
function deleteExpense(index) {
    expenses.splice(index, 1);
    saveDataToStorage();
    updateUI();
}

// Function to set the budget
function setBudget() {
    budget = parseFloat(document.getElementById('budgetAmount').value);

    if (!isNaN(budget) && budget > 0) {
        saveDataToStorage();
        updateUI();
    } else {
        alert('Please enter a valid budget amount.');
    }
}

// Function to calculate recommendations
function calculateRecommendations() {
    const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const balance = totalEarnings - totalExpenses;
    const difference = balance - budget;

    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = '';

    if (budget > 0) {
        if (difference < 0) {
            const amountToReduce = Math.abs(difference);
            recommendationsDiv.innerHTML = `<p>You need to reduce your expenses by Rs${amountToReduce.toFixed(2)} to meet your budget.</p>`;
            const sortedExpenses = expenses.sort((a, b) => b.amount - a.amount);

            let remainingAmount = amountToReduce;

            for (const expense of sortedExpenses) {
                if (remainingAmount <= 0) break;
                const reductionAmount = Math.min(expense.amount, remainingAmount);
                recommendationsDiv.innerHTML += `<p>Consider reducing your ${expense.category} expenses by Rs${reductionAmount.toFixed(2)}</p>`;
                remainingAmount -= reductionAmount;
            }
        } else {
            recommendationsDiv.innerHTML = `<p>You are within your budget. Great job!</p>`;
        }
    }
}

// Function to update the balance display
function updateBalance() {
    const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const balance = totalEarnings - totalExpenses;

    document.getElementById('balance').textContent = `Your Balance: Rs ${balance.toFixed(2)}`;
}

// Function to update the UI with current data
function updateUI() {
    updateBalance();
    calculateRecommendations();
    displayTransactions();
    updateBarChart();
    updatePieChart();
}

// Function to display transactions in the UI
function displayTransactions() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    earnings.forEach((earning, index) => {
        const transactionItem = document.createElement('div');
        transactionItem.textContent = `${earning.source}: +Rs ${earning.amount.toFixed(2)} (${earning.date})`;
        transactionItem.classList.add('transaction-item', 'earnings');

        // Delete button for earnings
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('black-button'); // Add a class for styling
        deleteButton.onclick = () => deleteEarnings(index);
        transactionItem.appendChild(deleteButton);

        transactionList.appendChild(transactionItem);
    });

    expenses.forEach((expense, index) => {
        const transactionItem = document.createElement('div');
        transactionItem.textContent = `${expense.category}: -Rs ${expense.amount.toFixed(2)} (${expense.date})`;
        transactionItem.classList.add('transaction-item', 'expenses');

        // Delete button for expenses
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('black-button'); // Add a class for styling
        deleteButton.onclick = () => deleteExpense(index);
        transactionItem.appendChild(deleteButton);

        transactionList.appendChild(transactionItem);
    });
}

// Event listener to load data and initialize UI
document.addEventListener('DOMContentLoaded', function () {
    loadDataFromStorage();
    updateUI();
});

// Function to update the bar chart
function updateBarChart() {
    const allLabels = [...earnings.map(earning => earning.source), ...expenses.map(expense => expense.category)];
    const uniqueLabels = [...new Set(allLabels)];

    const earningsData = uniqueLabels.map(label => {
        const earning = earnings.find(e => e.source === label);
        return earning ? earning.amount : 0;
    });

    const expensesData = uniqueLabels.map(label => {
        const expense = expenses.find(e => e.category === label);
        return expense ? expense.amount : 0;
    });

    const chartCtx = document.getElementById('earningsChart').getContext('2d');

    if (myBarChart) {
        myBarChart.destroy(); // Destroy previous instance if exists
    }

    myBarChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: uniqueLabels,
            datasets: [
                {
                    label: 'Earnings',
                    data: earningsData,
                    backgroundColor: '#4caf50',
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: '#FF5733',
                },
            ],
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true, // Ensure y-axis starts at 0
                },
            },
        },
    });
}

// Function to update the pie chart
function updatePieChart() {
    const expenseCategories = Object.keys(categories);
    const totalExpensesByCategory = expenseCategories.map(category => {
        const categoryExpenses = expenses.filter(expense => categories[category].includes(expense.category));
        return categoryExpenses.reduce((total, expense) => total + expense.amount, 0);
    });

    const pieChartCtx = document.getElementById('expensesPieChart').getContext('2d');

    if (myPieChart) {
        myPieChart.destroy(); // Destroy previous instance if exists
    }

    myPieChart = new Chart(pieChartCtx, {
        type: 'pie',
        data: {
            labels: expenseCategories,
            datasets: [{
                label: 'Expenses by Category',
                data: totalExpensesByCategory,
                backgroundColor: [
                    '#FF5733',
                    '#FFC300',
                    '#C70039',
                    '#900C3F',
                    '#581845',
                    '#2E86C1',
                    '#AED6F1',
                    '#1ABC9C',
                ],
            }],
        },
    });
}
