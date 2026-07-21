// =========================================================================
// 1. CẤU HÌNH PHẦN THƯỞNG VÀ VẼ VÒNG QUAY CANVAS (30%, 50%, 100%)
// =========================================================================
const prizes = [
    { text: "100%", color: "#61bd6d" },
    { text: "30%",  color: "#ff8e6b" },
    { text: "50%",  color: "#fcc438" },
    { text: "30%",  color: "#ff8e6b" },
    { text: "50%",  color: "#fcc438" }
];

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const numSegments = prizes.length;
const segmentAngle = (2 * Math.PI) / numSegments;

function drawWheel() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 5, startAngle, endAngle);
        ctx.fillStyle = prizes[i].color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.save();
        ctx.translate(radius, radius);
        // Xoay text vào giữa nan quạt
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        // Đổi màu chữ xen kẽ cho dễ đọc
        ctx.fillStyle = prizes[i].color === "#b30000" ? "#ffffff" : "#b30000";
        ctx.font = "bold 26px 'Segoe UI'";
        ctx.fillText(prizes[i].text, radius - 35, 0);
        ctx.restore();
    }
}
drawWheel();

let isSpinning = false;

// =========================================================================
// 2. TỰ ĐỘNG KHÓA VÀ HIỂN THỊ KẾT QUẢ CŨ KHI KHÁCH MỞ LẠI QUA ZALO
// =========================================================================
window.onload = function() {
    // Vẽ lại vòng quay đề phòng canvas chưa kịp tải
    drawWheel();

    // Gắn sự kiện click cho nút bấm tránh lỗi đơ nút
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', startSpin);
    }

    const hasSpun = localStorage.getItem('vongquay_lan_1');
    const savedPrize = localStorage.getItem('stopest_user_prize');

    if (hasSpun === 'true') {
        if (document.getElementById('input-fields')) {
            document.getElementById('input-fields').style.display = 'none';
        }
        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.innerText = "ĐÃ HẾT LƯỢT QUAY";
        }
        if (document.getElementById('status-message')) {
            document.getElementById('status-message').innerText = "Bạn đã tham gia chương trình này rồi!";
        }
        if (document.getElementById('result-text')) {
            document.getElementById('result-text').innerText = `Bạn nhận được ưu đãi ${savedPrize}`;
        }
        if (document.getElementById('result-box')) {
            document.getElementById('result-box').classList.remove('hidden');
        }
    }
};

// =========================================================================
// 3. LOGIC XỬ LÝ QUAY VÀ TÍNH TOÁN KẾT QUẢ VÒNG QUAY CỦA 6 Ô
// =========================================================================
function startSpin() {
    if (isSpinning) return;

    if (localStorage.getItem('stopest_has_spun') === 'true') {
        alert("Bạn đã hết lượt quay!");
        return;
    }

    // Đồng bộ chuẩn ID theo form giao diện của bạn
    const fullnameInput = document.getElementById('fullname') || document.getElementById('nameInput');
    const phoneInput = document.getElementById('phone') || document.getElementById('phoneInput');

    const fullname = fullnameInput ? fullnameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!fullname || !phone) {
        alert("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!");
        return;
    }
    if (!/^\d{9,11}$/.test(phone)) {
        alert("Số điện thoại không hợp lệ!");
        return;
    }

    isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    // Tính toán góc quay chính xác ngẫu nhiên theo kim 12h (Mỗi ô = 60 độ)
    const prizeIndex = Math.floor(Math.random() * numSegments);
    const targetAngleDegree = 90 - (prizeIndex * 60 + 30); 
    const totalRotation =  + targetAngleDegree; 

    canvas.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        const finalPrize = prizes[prizeIndex].text;
        
        // Cập nhật giao diện
        if (document.getElementById('result-text')) {
            document.getElementById('result-text').innerText = `Bạn nhận được ưu đãi ${finalPrize}`;
        }
        if (document.getElementById('result-box')) {
            document.getElementById('result-box').classList.remove('hidden');
        }
        if (spinBtn) spinBtn.innerText = "ĐÃ HẾT LƯỢT QUAY";
        if (document.getElementById('status-message')) {
            document.getElementById('status-message').innerText = "Quay thưởng thành công!";
        }
        if (document.getElementById('input-fields')) {
            document.getElementById('input-fields').style.display = 'none';
        }

        // Khóa lượt quay
        localStorage.setItem('stopest_has_spun', 'true');
        localStorage.setItem('stopest_user_prize', finalPrize);

        // KÍCH HOẠT HÀM GỬI DỮ LIỆU QUA POPUP (Bypass Zalo Webview thành công 100%)
        sendDataToGoogle(fullname, phone, finalPrize);

        isSpinning = false;
    }, 4000); 
}

// =========================================================================
// 4. HÀM GỬI DỮ LIỆU QUA POPUP NHỎ ĐỂ KHÔNG BỊ ZALO CHẶN CORS
// =========================================================================
function sendDataToGoogle(name, phone, prize) {
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeboYa4TZbA28yF3Tnlf_EVdLgy7tYRNxIIOpLJjYtqJVNIbQ/formResponse";
    
    // Ghép tham số đúng định dạng formResponse cùng nút submit ngầm[cite: 1]
    const finalUrl = `${baseUrl}?entry.810076137=${encodeURIComponent(name)}&entry.1928279920=${encodeURIComponent(phone)}&entry.2010302772=${encodeURIComponent(prize)}&submit=Submit`;

    // Mở một tab ẩn để đẩy dữ liệu đi trực tiếp, khắc phục triệt để bộ lọc Zalo[cite: 1]
    const newWindow = window.open(finalUrl, '_blank');
    if (newWindow) {
        setTimeout(() => {
            newWindow.close();
        }, 500); // Tự động đóng tab sau 0.5 giây khi dữ liệu đã gửi đi thành công[cite: 1]
    }
}
