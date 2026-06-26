const checkbox = document.getElementById('switch');
const body = document.body;
const title = document.querySelector(".Mode");

// 初期化：HTMLでbodyにdark/lightがついてなかった時の保険
if (!body.classList.contains('dark') && !body.classList.contains('light')) {
    body.classList.add('dark');
}

checkbox.addEventListener("change", () => {
    // 1. 文字の書き換え
    title.textContent = checkbox.checked ? "light" : "dark";

    // 2. クラスの入れ替え（これなら他のクラスに影響しない）
    if (checkbox.checked) {
        body.classList.replace('dark', 'light');
    } else {
        body.classList.replace('light', 'dark');
    }
});