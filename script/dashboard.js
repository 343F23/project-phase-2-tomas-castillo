document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("exportBtn").addEventListener("click", function () {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "localStorageData.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById("clearBtn").addEventListener("click", function () {
        localStorage.clear();
        addAlert("success", "User Data Cleared");
    });
});
