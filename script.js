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

    // LỚP BẢO MẬT 1: KIỂM TRA XEM THIẾT BỊ NÀY ĐÃ TỪNG QUAY CHƯA
    const deviceHasSpun = localStorage.getItem('stopest_device_spun');
    const savedPrize = localStorage.getItem('stopest_device_prize');

    if (deviceHasSpun === 'true') {
        if (document.getElementById('input-fields')) document.getElementById('input-fields').style.display = 'none';
        if (spinBtn) {
            spinBtn.disabled = true;
            spinBtn.innerText = "ĐÃ HẾT LƯỢT QUAY";
        }
        if (document.getElementById('status-message')) document.getElementById('status-message').innerText = "Thiết bị của bạn đã tham gia chương trình này rồi!";
        if (document.getElementById('result-text')) document.getElementById('result-text').innerText = savedPrize;
        if (document.getElementById('result-box')) document.getElementById('result-box').classList.remove('hidden');
    }
};

// Hàm bắt đầu quay, check đồng thời SĐT và Thiết bị
function startSpin() {
    if (isSpinning) return;

    // Kiểm tra lại lớp chặn thiết bị trước khi chạy tiếp
    if (localStorage.getItem('stopest_device_spun') === 'true') {
        alert("Thiết bị này đã hết lượt quay!");
        return;
    }

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

    // LỚP BẢO MẬT 2: KHÓA LOGIC THEO SỐ ĐIỆN THOẠI
    let usedPhones = JSON.parse(localStorage.getItem('stopest_used_phones')) || [];
    if (usedPhones.includes(phone)) {
        alert("Số điện thoại này đã tham gia quay thưởng trước đó rồi!");
        return;
    }

    isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    // Chọn ngẫu nhiên 1 ô trúng giải
    // BƯỚC 1: Tạo một số ngẫu nhiên từ 1 đến 100 để tính phần trăm
const randPercent = Math.floor(Math.random() * 100) + 1;
let prizeIndex;

// BƯỚC 2: Cài đặt tỷ lệ trúng ô "Tặng 1 tháng" là 5% (thay đổi số 5 theo ý bạn)
if (randPercent <= 5) {
    prizeIndex = 5; // <--- SỬA SỐ 5 NÀY THÀNH VỊ TRÍ ĐÚNG CỦA Ô "TẶNG 1 THÁNG" (ĐẾM TỪ 0)
} else {
    // 95% còn lại sẽ bốc ngẫu nhiên vào các ô khác trừ ô "Tặng 1 tháng" ra
    const otherPrizes = [];
    for (let i = 0; i < numSegments; i++) {
        if (i !== 5) { // <--- CŨNG SỬA SỐ 5 NÀY THÀNH VỊ TRÍ ĐÚNG CỦA Ô "TẶNG 1 THÁNG"
            otherPrizes.push(i);
        }
    }
    // Chọn ngẫu nhiên 1 ô trong danh sách các ô còn lại
    prizeIndex = otherPrizes[Math.floor(Math.random() * otherPrizes.length)];
}
    
    // Tính toán góc dừng tuyệt đối lệch tâm 12 giờ của hệ Canvas
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

        // KHOÁ THIẾT BỊ: Lưu trạng thái đã quay của thiết bị này
        localStorage.setItem('stopest_device_spun', 'true');
        localStorage.setItem('stopest_device_prize', finalPrize);

        // KHOÁ SĐT: Lưu Số điện thoại vào danh sách đen để chặn trên mọi máy khác
        usedPhones.push(phone);
        localStorage.setItem('stopest_used_phones', JSON.stringify(usedPhones));

        // Đẩy thông tin về Google Form của bạn
        sendDataToGoogle(fullname, phone, finalPrize);

        isSpinning = false;
    }, 4000); 
}

// Hàm gửi API ẩn về Google Form tự đóng tab
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
