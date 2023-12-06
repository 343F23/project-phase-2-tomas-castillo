const apiKey = "YYA8PI7C3J532JIH";

function addAlert(type, text) {
    let alertDiv = document.createElement("div");

    if (type === "success") {
        alertDiv.className = "alert alert-success";
    } else if (type === "danger") {
        alertDiv.className = "alert alert-danger";
    }

    alertDiv.role = "alert";
    alertDiv.innerText = text;

    document.getElementById("alert-container").appendChild(alertDiv);

    setTimeout(function () {
        alertDiv.remove();
    }, 3000);
}

async function fetchTimeSeriesDaily(symbol) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let timeSeriesData = data?.["Time Series (Daily)"];
        return timeSeriesData;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}
