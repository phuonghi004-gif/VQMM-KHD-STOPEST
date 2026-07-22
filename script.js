// Cấu hình 6 ô phần thưởng xen kẽ hai màu Đỏ thẫm và Trắng theo yêu cầu
const prizes = [
    { text: "Giảm 30%", color: "#a30000", textColor: "#ffffff" },
    { text: "Giảm 50%", color: "#ffffff", textColor: "#a30000" },
    { text: "Tặng 1 tháng", color: "#a30000", textColor: "#ffffff" },
    { text: "Giảm 30%", color: "#ffffff", textColor: "#a30000" },
    { text: "Giảm 50%", color: "#a30000", textColor: "#ffffff" },
    { text: "Tặng 1 tháng", color: "#ffffff", textColor: "#a30000" }
];

const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const numSegments = prizes.length;
const segmentAngle = (2 * Math.PI) / numSegments;
let isSpinning = false;

// Hàm vẽ vòng quay chuẩn màu
function drawWheel() {
    if (!canvas) return;
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        // Vẽ các ô hình quạt
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 2, startAngle, endAngle);
        ctx.fillStyle = prizes[i].color;
        ctx.fill();
        
        // Viền của các ô quay
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#a30000";
        ctx.stroke();

        // Vẽ văn bản chữ phần thưởng
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = prizes[i].textColor;
        ctx.font = "bold 22px 'Segoe UI'";
        ctx.fillText(prizes[i].text, radius - 30, 0);
        ctx.restore();
    }
}

window.onload = function() {
    drawWheel();
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) {
        spinBtn.addEventListener('click', startSpin);
    }
};

// Hàm bắt đầu quay và check SĐT chặn
function startSpin() {
    if (isSpinning) return;

    const nameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');

    const fullname = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!fullname || !phone) {
        alert("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!");
        return;
    }
    if (!/^\d{9,11}$/.test(phone)) {
        alert("Số điện thoại không hợp lệ (Phải từ 9 đến 11 số)!");
        return;
    }

    // KHÓA LÓGIC THEO SỐ ĐIỆN THOẠI (Mỗi SĐT chỉ được quay duy nhất 1 lần)
    let usedPhones = JSON.parse(localStorage.getItem('stopest_used_phones')) || [];
    if (usedPhones.includes(phone)) {
        alert("Số điện thoại này đã tham gia quay thưởng trước đó rồi!");
        return;
    }

    isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    // Chọn ngẫu nhiên 1 ô trúng giải
    const prizeIndex = Math.floor(Math.random() * numSegments);
    
    // Tính toán góc dừng tuyệt đối lệch tâm 12 giờ của hệ Canvas
    // Kim chỉ nằm ở góc 270 độ. Mỗi ô rộng 60 độ. Tâm ô i là (i * 60) + 30.
    const targetAngleDegree = 270 - (prizeIndex * 60 + 30);
    const totalRotation = 2880 + targetAngleDegree; // Quay 8 vòng lớn trước khi dừng

    canvas.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        const finalPrize = prizes[prizeIndex].text;
        
        // Hiển thị giao diện thắng giải
        if (document.getElementById('result-text')) {
            document.getElementById('result-text').innerText = finalPrize;
        }
        if (document.getElementById('result-box')) {
            document.getElementById('result-box').classList.remove('hidden');
        }
        if (spinBtn) {
            spinBtn.innerText = "ĐÃ HẾT LƯỢT QUAY";
        }
        if (document.getElementById('status-message')) {
            document.getElementById('status-message').innerText = "Chúc mừng bạn đã trúng giải!";
        }
        if (document.getElementById('input-fields')) {
            document.getElementById('input-fields').style.display = 'none';
        }

        // Lưu Số điện thoại vừa quay thành công vào danh sách đen để chặn
        usedPhones.push(phone);
        localStorage.setItem('stopest_used_phones', JSON.stringify(usedPhones));

        // Đẩy thông tin về Google Form của bạn
        sendDataToGoogle(fullname, phone, finalPrize);

        isSpinning = false;
    }, 4000); 
}

// Hàm gửi API ẩn về Google Form tự đóng tab (Khắc phục lỗi Zalo Webview)
function sendDataToGoogle(name, phone, prize) {
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeboYa4TZbA28yF3Tnlf_EVdLgy7tYRNxIIOpLJjYtqJVNIbQ/formResponse";
    const finalUrl = `${baseUrl}?entry.810076137=${encodeURIComponent(name)}&entry.1928279920=${encodeURIComponent(phone)}&entry.2010302772=${encodeURIComponent(prize)}&submit=Submit`;

    const newWindow = window.open(finalUrl, '_blank');
    if (newWindow) {
        setTimeout(() => {
            newWindow.close();
        }, 600); 
    }
}
