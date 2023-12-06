let spendingCategoryElement;

let editSpendingCategory;

document.addEventListener("DOMContentLoaded", function () {
    spendingCategoryElement = document.getElementById("spending-categories");

    document.getElementById("budget-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const category = document.getElementById("budget-category").value;

        if (category === "") {
            addAlert("danger", "Category cannot be empty");
            return;
        }

        const amount = document.getElementById("budget-amount").value;

        if (amount === "") {
            addAlert("danger", "Amount cannot be empty");
            return;
        }

        let budgetData = localStorage.getItem("budgetData") || "{}";
        budgetData = JSON.parse(budgetData);

        if (budgetData[category] !== undefined) {
            addAlert("danger", "Category already exists");
            return;
        } else {
            budgetData[category] = { budgetAmount: amount, transactions: [] };

            localStorage.setItem("budgetData", JSON.stringify(budgetData));
            addAlert("success", "Category added successfully");
            displayData();
        }

        event.target.reset();
    });

    document.getElementById("cancel-edit").addEventListener("click", function () {
        document.getElementById("edit-overlay").style.display = "none";
    });

    document.getElementById("edit-budget-form").addEventListener("submit", function (event) {
        event.preventDefault();

        const category = document.getElementById("edit-budget-category").value;

        if (category === "") {
            addAlert("danger", "Category cannot be empty");
            return;
        }

        const amount = document.getElementById("edit-budget-amount").value;

        if (amount === "") {
            addAlert("danger", "Amount cannot be empty");
            return;
        }
        let budgetData = localStorage.getItem("budgetData") || "{}";
        budgetData = JSON.parse(budgetData);

        let copyOfOldSpendingCategoryTransactions = JSON.parse(JSON.stringify(budgetData[editSpendingCategory].transactions));

        delete budgetData[editSpendingCategory];

        budgetData[category] = { budgetAmount: amount, transactions: copyOfOldSpendingCategoryTransactions };

        localStorage.setItem("budgetData", JSON.stringify(budgetData));

        document.getElementById("edit-overlay").style.display = "none";

        displayData();

        event.target.reset();
    });

    displayData();
});

function handleSubmit(event) {
    event.preventDefault();

    const category = document.getElementById("budget-category").value;

    if (category === "") {
        addAlert("danger", "Category cannot be empty");
        return;
    }

    let amount = document.getElementById("budget-amount").value;

    if (amount === "" || isNaN(amount)) {
        addAlert("danger", "Amount cannot be empty");
        return;
    }

    amount = Number(amount);

    let budgetData = localStorage.getItem("budgetData") || "{}";
    budgetData = JSON.parse(budgetData);

    if (budgetData[category] !== undefined) {
        addAlert("danger", "Category already exists");
        return;
    } else {
        budgetData[category] = { budgetAmount: amount, transactions: [] };

        localStorage.setItem("budgetData", JSON.stringify(budgetData));
        addAlert("success", "Category added successfully");
        displayData();
    }

    event.target.reset();
}

function displayData() {
    spendingCategoryElement.innerHTML = "";
    let budgetData = localStorage.getItem("budgetData");
    if (budgetData === null) {
        return;
    }
    budgetData = JSON.parse(budgetData);
    for (let spendingCategory in budgetData) {
        createSpendingCategoryCard(spendingCategory, budgetData[spendingCategory].budgetAmount, budgetData[spendingCategory].transactions);
    }
}

function createSpendingCategoryCard(spendingCategory, budgetAmount, transactions) {
    let cardDiv = document.createElement("div");
    cardDiv.className = "card";

    let cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";
    let cardTitleDiv = document.createElement("div");
    cardTitleDiv.style.display = "flex";
    cardBodyDiv.appendChild(cardTitleDiv);

    let cardTitle = document.createElement("h2");
    cardTitle.className = "card-title";
    cardTitle.textContent = `${spendingCategory} ($${calculateTotal(transactions)} / $${budgetAmount}) ${((calculateTotal(transactions) / budgetAmount) * 100).toFixed(2)}%`;
    cardTitleDiv.appendChild(cardTitle);

    let editButton = document.createElement("img");

    editButton.src = "../images/edit.png";
    editButton.alt = "Edit";
    editButton.style.cursor = "pointer";
    editButton.classList.add("edit-button");
    editButton.onclick = function () {
        editBudget(spendingCategory);
    };

    cardTitleDiv.appendChild(editButton);

    let deleteButton = document.createElement("img");

    deleteButton.src = "../images/trash.png";
    deleteButton.alt = "Delete";
    deleteButton.style.cursor = "pointer";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function () {
        deleteBudget(spendingCategory);
    };
    cardTitleDiv.appendChild(deleteButton);

    let tableDiv = document.createElement("div");
    tableDiv.className = "table-responsive";

    let table = document.createElement("table");
    table.className = "table";

    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    let trHead = document.createElement("tr");

    let headers = ["Transaction Name", "Amount", "Date"];
    headers.forEach((headerText) => {
        let th = document.createElement("th");
        th.textContent = headerText;
        trHead.appendChild(th);
    });

    thead.appendChild(trHead);

    transactions.forEach((transaction) => {
        let tr = document.createElement("tr");

        let tdName = document.createElement("td");
        tdName.textContent = transaction.name;

        let tdAmount = document.createElement("td");
        tdAmount.textContent = `$${transaction.amount}`;

        let tdDate = document.createElement("td");
        tdDate.textContent = transaction.date;

        tr.appendChild(tdName);
        tr.appendChild(tdAmount);
        tr.appendChild(tdDate);

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(table);
    cardBodyDiv.appendChild(cardTitleDiv);
    cardBodyDiv.appendChild(tableDiv);
    cardDiv.appendChild(cardBodyDiv);

    spendingCategoryElement.appendChild(cardDiv);
}

function calculateTotal(transactions) {
    if (transactions.length === 0) {
        return 0;
    }
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

function editBudget(spendingCategory) {
    editSpendingCategory = spendingCategory;

    let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};
    let budget = budgetData[spendingCategory];

    document.getElementById("edit-budget-category").value = spendingCategory;
    document.getElementById("edit-budget-amount").value = budget.budgetAmount;

    document.getElementById("edit-overlay").style.display = "block";
}

function deleteBudget(spendingCategory) {
    let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};
    delete budgetData[spendingCategory];
    localStorage.setItem("budgetData", JSON.stringify(budgetData));
    editSpendingCategory = null;
    document.getElementById("edit-overlay").style.display = "none";
    displayData();
}
