function fetchBackendInfo() {
    return fetch('https://textdb.online/tianlala')
        .then(response => response.text())
        .then(text => {
            const lines = text.split('\n');
            const backendUrl = lines[0].replace('当前脚本IP： ', '').trim();
            const updateTime = lines[2].replace('更新时间：', '').trim();
            return { backendUrl, updateTime };
        })
        .catch(error => {
            console.error('Error fetching backend info:', error);
            return null;
        });
}

async function checkStatus() {
    const backendInfo = await fetchBackendInfo();
    if (backendInfo) {
        document.getElementById("backend-url").textContent = backendInfo.backendUrl;
        document.getElementById("update-time").textContent = backendInfo.updateTime;
        document.getElementById("status-message").textContent = "连接正常";
        document.getElementById("status-message").className = "text-success";
    } else {
        document.getElementById("status-message").textContent = "无法获取后端信息";
        document.getElementById("status-message").className = "text-danger";
    }
}

document.getElementById("check-status-button").addEventListener("click", checkStatus);

// 在页面加载时执行一次连接状态检测
window.addEventListener("load", checkStatus);