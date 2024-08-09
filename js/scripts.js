let backendUrl; // 全局变量用于存储后端URL

// 获取后端信息的函数
// 获取后端信息的函数
async function fetchBackendInfo() {
    try {
        console.log("Fetching backend info...");
        const response = await fetch('https://textdb.online/tll_json?timestamp=' + new Date().getTime()); // 添加时间戳防止缓存
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        
        let fetchedBackendUrl = data["当前网址"].trim(); // 使用 let 定义局部变量
        const updateTime = data["更新时间"]; // 获取时间戳
        const author = data["脚本作者"].trim();
        console.log("Backend URL:", fetchedBackendUrl);
        console.log("Update Time:", updateTime); // 显示时间戳
        console.log("Script Author:", author);
        
        globalThis.backendUrl = fetchedBackendUrl; // 尝试使用 window 对象
        console.log("Setting global backendUrl:", globalThis.backendUrl); // 新增调试信息
        
        return { backendUrl: fetchedBackendUrl, updateTime, author };
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
        document.getElementById("update-time").textContent = timestampToDate(backendInfo.updateTime); // 调用函数转换时间戳
        console.log("Setting update time:", timestampToDate(backendInfo.updateTime)); // 显示更新时间

        try {
            const response = await fetch(`${globalThis.backendUrl}/connection_status`);
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

// 将毫秒级的时间戳转换为日期和时间的格式
function timestampToDate(timestamp) {
    var date = new Date(timestamp); // 直接使用毫秒级的时间戳
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2); // getMonth() 返回的月份是从0开始的
    var day = ("0" + date.getDate()).slice(-2);
    var hour = ("0" + date.getHours()).slice(-2);
    var minute = ("0" + date.getMinutes()).slice(-2);
    var second = ("0" + date.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}


// 更新文件列表的函数
async function updateFileList() {
    console.log("Using backendUrl before fetch:", globalThis.backendUrl); // 使用 globalThis.backendUrl

    try {
        const response = await fetch(`${globalThis.backendUrl}/list`);
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
        downloadLink.href = `${globalThis.backendUrl}/download/${encodeURIComponent(fileName)}`;
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
document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Starting initialization...");
        const backendInfo = await fetchBackendInfo();
        if (!backendInfo.error) {
            console.log("Starting checkStatus...");
            await checkStatus();
            console.log("Starting updateFileList...");
            await updateFileList();
        }
    } catch (error) {
        console.error("Error initializing:", error);
    }

    document.getElementById("check-status-button").addEventListener("click", checkStatus);
});