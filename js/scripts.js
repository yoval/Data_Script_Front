let backendUrl; // 全局变量用于存储后端URL

// 获取后端信息的函数
async function fetchBackendInfo() {
    try {
        console.log("Fetching backend info...");
        const response = await fetch('https://textdb.online/tianlala');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        console.log("Fetch text:", text);
        const lines = text.split('\n');
        backendUrl = lines[0].replace('当前脚本IP： ', '').trim();
        const updateTime = lines[2].replace('更新时间：', '').trim();
        console.log("Backend URL:", backendUrl);
        return { backendUrl, updateTime };
    } catch (error) {
        console.error("Error fetching backend info:", error);
        return { error: "无法获取后端信息" };
    }
}

// 检查连接状态的函数
async function checkStatus() {
    const backendInfo = await fetchBackendInfo();
    const statusMessageElement = document.getElementById("status-message");

    if (backendInfo.error) {
        statusMessageElement.textContent = backendInfo.error;
        statusMessageElement.className = "text-danger";
    } else {
        document.getElementById("backend-url").textContent = backendInfo.backendUrl;
        document.getElementById("update-time").textContent = backendInfo.updateTime;

        try {
            const response = await fetch(`http://${backendUrl}/connection_status`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            statusMessageElement.textContent = "连接成功";
            statusMessageElement.className = "text-success";
        } catch (error) {
            statusMessageElement.textContent = "连接失败";
            statusMessageElement.className = "text-danger";
        }
    }
}

// 页面加载时执行的操作
document.addEventListener("DOMContentLoaded", () => {
    checkStatus();
    document.getElementById("check-status-button").addEventListener("click", checkStatus);
});

// 更新文件列表的函数
async function updateFileList() {
    try {
        const response = await fetch(`http://${backendUrl}/list`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fileListData = await response.json();
        updateFileTable(fileListData);
    } catch (error) {
        console.error("Error fetching file list:", error);
    }
}

// 更新表格文件的函数
function updateFileTable(fileListData) {
    const fileListElement = document.getElementById("file-list");
    fileListElement.innerHTML = ""; // 清空现有的表格内容

    fileListData.forEach(fileInfo => {
        const [fileName, creationDate] = fileInfo;
        const row = document.createElement("tr");

        const fileNameCell = document.createElement("td");
        const downloadLink = document.createElement("a");
        downloadLink.href = `http://${backendUrl}/download/${encodeURIComponent(fileName)}`;
        downloadLink.textContent = fileName;
        fileNameCell.appendChild(downloadLink);

        const creationDateCell = document.createElement("td");
        // 将 GMT 时间转换为本地时间
        const localCreationDate = new Date(creationDate).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        creationDateCell.textContent = localCreationDate;

        row.appendChild(fileNameCell);
        row.appendChild(creationDateCell);

        fileListElement.appendChild(row);
    });
}

// 页面加载时执行的操作
document.addEventListener("DOMContentLoaded", () => {
    fetchBackendInfo().then(() => {
        checkStatus();
        updateFileList();
    });
    document.getElementById("check-status-button").addEventListener("click", checkStatus);
});