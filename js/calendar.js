    // グローバル変数
    const canvas = document.getElementById('wallpaper-canvas');
    const viewport = document.getElementById('preview-viewport');
    const bgUpload = document.getElementById('bg-upload');

    // 1. 画像読み込み
    bgUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            canvas.style.backgroundImage = `url('${event.target.result}')`;
            fitToScreen();
        };
        reader.readAsDataURL(file);
    });

    // 2. カレンダー更新ロジック
    function update() {
        const year = parseInt(document.getElementById('year').value);
        const month = parseInt(document.getElementById('month').value);
        const calBody = document.getElementById('cal-body');
        const color = document.getElementById('color').value;
        const fontSize = document.getElementById('size-slider').value;
        const font = document.getElementById('font').value;

        // 追加：月齢表示の有無とサイズ
        const showMoon = document.getElementById('show-moon')?.checked ?? true;
        const moonSize = document.getElementById('moon-size')?.value ?? 32;

        // スタイル反映
        const area = document.getElementById('calendar-area');
        area.style.color = color;
        area.style.fontFamily = font;
        area.style.fontSize = fontSize + "px";

        // タイトル更新
        document.getElementById('year-num').textContent = year;
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById('month-name').textContent = monthNames[month];

        // カレンダー計算
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();

        let html = "";
        let dateCount = 1 - firstDay;

        for (let i = 0; i < 6; i++) {
            html += "<tr>";
            for (let j = 0; j < 7; j++) {
                let displayDate, className = "";
                let targetDate; // 月齢計算用の正確な日付オブジェクト

                if (dateCount < 1) {
                    displayDate = prevLastDate + dateCount;
                    className = "other-month";
                    targetDate = new Date(year, month - 1, displayDate);
                } else if (dateCount > lastDate) {
                    displayDate = dateCount - lastDate;
                    className = "other-month";
                    targetDate = new Date(year, month + 1, displayDate);
                } else {
                    displayDate = dateCount;
                    targetDate = new Date(year, month, displayDate);
                    if (j === 0) className = "sun";
                    if (j === 6) className = "sat";
                }

                // 月齢タグの生成
                let moonTag = "";
                if (showMoon) {
                    // 簡易月齢計算（2000年1月6日の新月を基準とした近似値）
                    const baseDate = new Date(2000, 0, 6);
                    const diffDays = (targetDate - baseDate) / (1000 * 60 * 60 * 24);
                    const moonAge = diffDays % 29.53059;
                    const moonIndex = Math.floor(moonAge % 30); // 0-29の範囲に収める

                    // 画像が表示されない対策：パスが正しいか、コンソールで確認しろ
                    // Moon_0.png から Moon_29.png がフォルダにある前提やぞ
                    moonTag = `<img src="moon/Moon_${moonIndex}.png" class="moon-img" style="width:${moonSize}px;" onerror="console.error('Image not found: Moon_${moonIndex}.png')">`;
                }

                html += `<td class="${className}"><span class="date-num">${displayDate}</span>${moonTag}</td>`;
                dateCount++;
            }
            html += "</tr>";
            if (dateCount > lastDate && i >= 4) break;
        }
        calBody.innerHTML = html;
    }

    // 3. サイズ変更とスケーリング
    function changeSize(w, h) {
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        fitToScreen();
    }

    function fitToScreen() {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const vW = viewport.clientWidth;
        const vH = viewport.clientHeight;
        if (!w || !h) return;
        const scale = Math.min(vW / w, vH / h) * 0.9;
        canvas.style.transform = `scale(${scale})`;
    }

    // 4. 配置切り替え
    function setPos(pos) {
        const area = document.getElementById('calendar-area');
        area.classList.remove('pos-top', 'pos-center', 'pos-bottom');
        area.classList.add(`pos-${pos}`);
        if(pos === 'top') { area.style.top = "10%"; area.style.bottom = "auto"; area.style.transform = "none"; }
        if(pos === 'center') { area.style.top = "50%"; area.style.transform = "translateY(-50%)"; }
        if(pos === 'bottom') { area.style.top = "auto"; area.style.bottom = "10%"; area.style.transform = "none"; }
    }

    window.onload = () => { update(); fitToScreen(); };
    window.onresize = fitToScreen;

    function applyQuickColor(hex) {
        const colorPicker = document.getElementById('color');
        colorPicker.value = hex; // カラーピッカーの値を更新
        update(); // カレンダーを再描画
    }

    // もしこういう処理があるなら、backgroundColorを明示的にnullにする
        html2canvas(document.querySelector("#wallpaper-canvas"), {
            backgroundColor: null,
            // ...他のオプション
        }).then(canvas => {
            // 保存処理
        });
    async function saveWallpaper() {
        const canvasElement = document.getElementById('wallpaper-canvas');
        const saveBtn = event.target;

        // 二重クリック防止
        saveBtn.innerText = "生成中...";
        saveBtn.disabled = true;

        // 1. スケーリングを一時解除（これをせんとボケボケになる）
        const originalTransform = canvasElement.style.transform;
        canvasElement.style.transform = 'none';

        try {
            // 2. html2canvasでキャプチャ
            const canvas = await html2canvas(canvasElement, {
                useCORS: true, // 画像の外部読み込み対策
                scale: 1,      // 元のサイズで書き出し
                logging: false,
            });

            // 3. ダウンロード処理
            const link = document.createElement('a');
            const year = document.getElementById('year').value;
            const month = document.getElementById('month').value;
            link.download = `Wallpaper_${year}_${parseInt(month)+1}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("生成に失敗したわ：", err);
            alert("画像の生成に失敗したぞ。コンソールを見ろ。");
        } finally {
            // 4. スケーリングを戻す
            canvasElement.style.transform = originalTransform;
            saveBtn.innerText = "画像を保存する";
            saveBtn.disabled = false;
        }
    }