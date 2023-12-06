document.addEventListener("DOMContentLoaded", async function () {
    displayInvestmentTrends();
    displayBudgetTrends();
});

async function displayInvestmentTrends() {
    const body = document.getElementById("investment-trends-card-body");

    let investmentData = JSON.parse(localStorage.getItem("investmentData")) || [];

    let uniqueSymbols = new Set();
    for (let investment of investmentData) {
        uniqueSymbols.add(investment.investmentSymbol);
    }
    uniqueSymbols = Array.from(uniqueSymbols);

    for (let symbol of uniqueSymbols) {
        console.log(symbol);
        let card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("mb-3");

        let cardHeader = document.createElement("div");
        cardHeader.classList.add("card-header");
        cardHeader.classList.add("d-flex");
        cardHeader.classList.add("justify-content-between");
        cardHeader.classList.add("align-items-center");

        let cardTitle = document.createElement("h4");
        cardTitle.classList.add("mb-0");
        cardTitle.innerText = symbol;

        let cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        let graph = document.createElement("canvas");
        graph.id = `${symbol}-graph`;

        let timeSeriesData = await fetchTimeSeriesDaily(symbol);

        let xAxis = [];
        let yAxis = [];
        for (let date of Object.keys(timeSeriesData).reverse().slice(0, 30)) {
            xAxis.push(date);
            yAxis.push(timeSeriesData[date]["4. close"]);
        }

        new Chart(graph, {
            type: "line",
            data: {
                labels: xAxis,
                datasets: [
                    {
                        label: "Price",
                        data: yAxis,
                        fill: false,
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.1,
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        display: true,
                    },
                },
            },
        });

        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);
        cardBody.appendChild(graph);
        card.appendChild(cardBody);

        body.appendChild(card);
    }
}

function displayBudgetTrends() {
    const body = document.getElementById("budget-trends-card-body");

    let budgetData = JSON.parse(localStorage.getItem("budgetData")) || {};

    for (let category in budgetData) {
        if (budgetData[category].transactions.length === 0) continue;
        let card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("mb-3");

        let cardHeader = document.createElement("div");
        cardHeader.classList.add("card-header");
        cardHeader.classList.add("d-flex");
        cardHeader.classList.add("justify-content-between");
        cardHeader.classList.add("align-items-center");

        let cardTitle = document.createElement("h4");
        cardTitle.classList.add("mb-0");
        cardTitle.innerText = category;

        let cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        let graph = document.createElement("canvas");
        graph.id = `${category}-graph`;

        let transactions = budgetData[category].transactions;
        let xAxis = [];
        let yAxis = [];

        transactions = transactions.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        for (let transaction of transactions) {
            let date = transaction.date;
            let amount = transaction.amount;
            if (xAxis.includes(date)) {
                let index = xAxis.indexOf(date);
                yAxis[index] += amount;
            } else {
                xAxis.push(date);
                yAxis.push(amount);
            }
        }

        new Chart(graph, {
            type: "line",
            data: {
                labels: xAxis,
                datasets: [
                    {
                        label: "Amount",
                        data: yAxis,
                        fill: false,
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.1,
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        display: true,
                    },
                },
            },
        });

        cardHeader.appendChild(cardTitle);
        card.appendChild(cardHeader);
        cardBody.appendChild(graph);
        card.appendChild(cardBody);

        body.appendChild(card);
    }
}
