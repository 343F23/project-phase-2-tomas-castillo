let tableBody;

let editTransactionIndex;
let editTransactionCategory;

document.addEventListener("DOMContentLoaded", function () {
    populateCategories();

    tableBody = document.getElementById("transactions-body");

    displayData();

    document.getElementById("transaction-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const transactionName = document.getElementById("transaction-name").value;
        let transactionAmount = document.getElementById("transaction-amount").value;
        const transactionDate = document.getElementById("transaction-date").value;
        const spendingCategory = document.getElementById("category").value;

        if (transactionName === "") {
            addAlert("danger", "Transaction name cannot be empty");
            return;
        }

        if (transactionAmount === "" || isNaN(transactionAmount)) {
            addAlert("danger", "Transaction amount cannot be empty");
            return;
        }

        transactionAmount = Number(transactionAmount);

        if (transactionDate === "") {
            addAlert("danger", "Transaction date cannot be empty");
            return;
        }

        if (spendingCategory === "") {
            addAlert("danger", "Spending category cannot be empty");
            return;
        }

        let budgetData = localStorage.getItem("budgetData") || "{}";
        budgetData = JSON.parse(budgetData);

        if (budgetData[spendingCategory] === undefined) {
            addAlert("danger", "Spending category does not exist");
            return;
        }

        budgetData[spendingCategory].transactions.push({
            name: transactionName,
            amount: transactionAmount,
            date: transactionDate,
        });

        addAlert("success", "Transaction added successfully");

        localStorage.setItem("budgetData", JSON.stringify(budgetData));

        displayData();
        event.target.reset();
    });

    document.getElementById("cancel-edit").addEventListener("click", function () {
        document.getElementById("edit-overlay").style.display = "none";
    });

    document.getElementById("edit-transaction-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const transactionName = document.getElementById("edit-transaction-name").value;
        let transactionAmount = document.getElementById("edit-transaction-amount").value;
        const transactionDate = document.getElementById("edit-transaction-date").value;

        if (transactionName === "") {
            addAlert("danger", "Transaction name cannot be empty");
            return;
        }

        if (transactionAmount === "" || isNaN(transactionAmount)) {
            addAlert("danger", "Transaction amount cannot be empty");
            return;
        }

        transactionAmount = Number(transactionAmount);

        if (transactionDate === "") {
            addAlert("danger", "Transaction date cannot be empty");
            return;
        }

        let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};
        budgetData[editTransactionCategory].transactions[editTransactionIndex] = {
            name: transactionName,
            amount: transactionAmount,
            date: transactionDate,
        };
        localStorage.setItem("budgetData", JSON.stringify(budgetData));

        document.getElementById("edit-overlay").style.display = "none";

        displayData();
    });
});

function displayData() {
    tableBody.innerHTML = "";
    let budgetData = localStorage.getItem("budgetData");
    if (budgetData === null) {
        return;
    }
    budgetData = JSON.parse(budgetData);
    for (let spendingCategory in budgetData) {
        let index = 0;
        for (let transaction of budgetData[spendingCategory].transactions) {
            addTransactionToTable(transaction.name, transaction.amount, transaction.date, spendingCategory, index++);
        }
    }
}

function populateCategories() {
    const categoriesSelect = document.getElementById("category");
    const budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};

    categoriesSelect.innerHTML = "";

    let defaultOption = document.createElement("option");
    defaultOption.textContent = "Select a Category";
    defaultOption.value = "";
    categoriesSelect.appendChild(defaultOption);

    for (let category in budgetData) {
        let option = document.createElement("option");
        option.textContent = category;
        option.value = category;
        categoriesSelect.appendChild(option);
    }
}

function addTransactionToTable(name, amount, date, spendingCategory, index) {
    let row = document.createElement("tr");
    let nameCell = document.createElement("td");
    let amountCell = document.createElement("td");
    let dateCell = document.createElement("td");
    let categoryCell = document.createElement("td");
    let deleteCell = document.createElement("td");
    let editCell = document.createElement("td");

    nameCell.textContent = name;
    amountCell.textContent = `$${amount}`;
    dateCell.textContent = date;
    categoryCell.textContent = spendingCategory;

    let deleteButton = document.createElement("img");

    deleteButton.src = "./images/trash.png";
    deleteButton.alt = "Delete";
    deleteButton.style.cursor = "pointer";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function () {
        deleteTransaction(index, spendingCategory);
    };
    deleteCell.appendChild(deleteButton);

    let editButton = document.createElement("img");

    editButton.src = "./images/edit.png";
    editButton.alt = "Edit";
    editButton.style.cursor = "pointer";
    editButton.classList.add("edit-button");
    editButton.onclick = function () {
        editTransaction(index, spendingCategory);
    };
    editCell.appendChild(editButton);

    row.appendChild(nameCell);
    row.appendChild(amountCell);
    row.appendChild(dateCell);
    row.appendChild(categoryCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);

    tableBody.appendChild(row);
}

function deleteTransaction(index, spendingCategory) {
    let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};

    budgetData[spendingCategory].transactions.splice(index, 1);

    localStorage.setItem("budgetData", JSON.stringify(budgetData));

    editTransactionIndex = null;
    editTransactionCategory = null;
    document.getElementById("edit-overlay").style.display = "none";
    displayData();
}

function editTransaction(index, spendingCategory) {
    editTransactionIndex = index;
    editTransactionCategory = spendingCategory;

    let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};
    let transaction = budgetData[spendingCategory].transactions[index];

    document.getElementById("edit-transaction-name").value = transaction.name;
    document.getElementById("edit-transaction-amount").value = transaction.amount;
    document.getElementById("edit-transaction-date").value = transaction.date;

    document.getElementById("edit-overlay").style.display = "block";

    document.getElementById("edit-transaction-form").dataset.index = index;
    document.getElementById("edit-transaction-form").dataset.spendingCategory = spendingCategory;
}
