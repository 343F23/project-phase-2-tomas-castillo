let searching = false;
let tableBody;

let editInvestmentIndex;

document.addEventListener("DOMContentLoaded", function () {
    tableBody = document.getElementById("investments-body");
    document.getElementById("symbol-search-form").addEventListener("submit", function (event) {
        handleInvestmentNameChange(event);
    });

    document.getElementById("cancel-edit").addEventListener("click", function () {
        document.getElementById("edit-overlay").style.display = "none";
    });

    document.getElementById("investments-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const investmentName = document.getElementById("investment-name").value;
        const investmentSymbol = document.getElementById("investment-symbol").value;
        let numberOfShares = document.getElementById("investment-amount").value;
        const date = document.getElementById("investment-date").value;

        if (investmentName === "") {
            addAlert("danger", "Investment name cannot be empty");
            return;
        }

        if (investmentSymbol === "") {
            addAlert("danger", "Investment symbol cannot be empty");
            return;
        }

        let searchData = await searchStockSymbols(apiKey, investmentName);
        if (!searchData?.length) {
            addAlert("danger", "Invalid investment symbol");
            return;
        }

        if (numberOfShares === "" || isNaN(numberOfShares)) {
            addAlert("danger", "Number of shares cannot be empty");
            return;
        }

        numberOfShares = Number(numberOfShares);

        if (date === "") {
            addAlert("danger", "Investment date cannot be empty");
            return;
        }

        let investmentData = localStorage.getItem("investmentData") || "[]";
        investmentData = JSON.parse(investmentData);

        investmentData.push({
            investmentName,
            investmentSymbol,
            numberOfShares,
            date,
        });

        addAlert("success", "Investment added successfully");

        localStorage.setItem("investmentData", JSON.stringify(investmentData));

        displayData();
        event.target.reset();
    });

    document.getElementById("edit-investment-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        let numberOfShares = document.getElementById("edit-investment-amount").value;
        const date = document.getElementById("edit-investment-date").value;

        if (numberOfShares === "" || isNaN(numberOfShares)) {
            addAlert("danger", "Number of shares cannot be empty");
            return;
        }

        numberOfShares = Number(numberOfShares);

        if (date === "") {
            addAlert("danger", "Investment date cannot be empty");
            return;
        }

        let investmentData = localStorage.getItem("investmentData") || "[]";
        investmentData = JSON.parse(investmentData);

        investmentData[editInvestmentIndex].numberOfShares = numberOfShares;
        investmentData[editInvestmentIndex].date = date;

        addAlert("success", "Investment added successfully");

        localStorage.setItem("investmentData", JSON.stringify(investmentData));

        displayData();

        document.getElementById("edit-overlay").style.display = "none";

        event.target.reset();
    });

    displayData();
});

function displayData() {
    tableBody.innerHTML = "";
    let investmentData = localStorage.getItem("investmentData") || "[]";
    if (investmentData === null) {
        return;
    }
    investmentData = JSON.parse(investmentData);
    let index = 0;
    for (let investment of investmentData) {
        addInvestmentToTable(investment.investmentName, investment.investmentSymbol, investment.numberOfShares, investment.date, index++);
    }
}

function addInvestmentToTable(name, symbol, numberOfShares, date, index) {
    let row = document.createElement("tr");
    let nameCell = document.createElement("td");
    let symbolCell = document.createElement("td");
    let numberOfSharesCell = document.createElement("td");
    let dateCell = document.createElement("td");
    let deleteCell = document.createElement("td");
    let editCell = document.createElement("td");

    nameCell.textContent = name;
    symbolCell.textContent = symbol;
    numberOfSharesCell.textContent = numberOfShares;
    dateCell.textContent = date;

    let deleteButton = document.createElement("img");

    deleteButton.src = "../images/trash.png";
    deleteButton.alt = "Delete";
    deleteButton.style.cursor = "pointer";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function () {
        deleteInvestment(index);
    };
    deleteCell.appendChild(deleteButton);

    let editButton = document.createElement("img");

    editButton.src = "../images/edit.png";
    editButton.alt = "Edit";
    editButton.style.cursor = "pointer";
    editButton.classList.add("edit-button");
    editButton.onclick = function () {
        editInvestment(index);
    };
    editCell.appendChild(editButton);

    row.appendChild(nameCell);
    row.appendChild(symbolCell);
    row.appendChild(numberOfSharesCell);
    row.appendChild(dateCell);
    row.appendChild(editCell);
    row.appendChild(deleteCell);

    tableBody.appendChild(row);
}

async function handleInvestmentNameChange(event) {
    event.preventDefault();
    let investmentName = document.getElementById("investment-symbol-name").value;
    let searchData = await searchStockSymbols(apiKey, investmentName);

    if (!searchData?.length) {
        addAlert("danger", "Failed to search for stock symbols");
        return;
    }
    let searchResults = [];
    for (let data of searchData.splice(0, 3)) {
        let { "1. symbol": symbol, "2. name": name } = data;
        searchResults.push({ symbol, name });
    }
    addSymbolSearchResultsToPage(searchResults);
}

async function addSymbolSearchResultsToPage(searchData) {
    let searchResultsContainer = document.getElementById("symbol-search-results");
    searchResultsContainer.innerHTML = "";

    for (let data of searchData) {
        let { symbol, name } = data;
        let card = document.createElement("div");
        card.className = "card";
        card.style = "width: 18rem;";
        let cardBody = document.createElement("div");
        cardBody.className = "card-body";

        let cardTitle = document.createElement("button");
        cardTitle.className = "card-title";
        cardTitle.innerText = symbol;
        cardTitle.addEventListener("click", async function () {
            console.log("clicked on symbol: ", symbol);
            document.getElementById("investment-name").value = "";
            document.getElementById("investment-name").value = name;
            document.getElementById("investment-symbol").value = "";
            document.getElementById("investment-symbol").value = symbol;
        });

        let timeSeriesData = await fetchTimeSeriesDaily(symbol);
        let changePercent = computeLastDaysChangePercent(timeSeriesData);
        let changePercentText = document.createElement("p");
        changePercentText.className = "card-text";
        changePercentText.innerText = `Last Month Change: ${changePercent.toFixed(2)}%`;
        let cardText = document.createElement("p");
        cardText.className = "card-text";
        cardText.innerText = name;
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(changePercentText);
        card.appendChild(cardBody);
        searchResultsContainer.appendChild(card);
    }
}

async function searchStockSymbols(apiKey, keywords) {
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data?.bestMatches;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

function computeLastDaysChangePercent(timeSeriesData) {
    let last30Days = Object.keys(timeSeriesData).splice(0, 30);
    let currValue = timeSeriesData[last30Days[0]]["4. close"];
    let oldestValue = timeSeriesData[last30Days[last30Days.length - 1]]["4. close"];
    let changePercent = (currValue - oldestValue) / oldestValue;
    return changePercent * 100;
}

function editInvestment(index) {
    editInvestmentIndex = index;

    let investmentData = JSON.parse(localStorage.getItem("investmentData")) || {};
    let investment = investmentData[index];

    document.getElementById("edit-investment-amount").value = investment.numberOfShares;
    document.getElementById("edit-investment-date").value = investment.date;

    document.getElementById("edit-overlay").style.display = "block";

    document.getElementById("edit-transaction-form").dataset.index = index;
    document.getElementById("edit-transaction-form").dataset.spendingCategory = spendingCategory;
}

function deleteInvestment(index) {
    let investmentData = JSON.parse(localStorage.getItem("investmentData")) || {};

    investmentData.splice(index, 1);

    localStorage.setItem("investmentData", JSON.stringify(investmentData));

    editInvestmentIndex = null;
    document.getElementById("edit-overlay").style.display = "none";
    displayData();
}
