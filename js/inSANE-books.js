// =========================================================================
// 状態管理用のグローバル変数（データは外部の4ファイルから window.INSANE_DATABASE に入る）
// =========================================================================
let currentCategory = "アビリティ";
let selectedTag = ""; // 全表示の時は空文字

// =========================================================================
// 1. カテゴリ切り替え（アビリティ／狂気）
// =========================================================================
function switchCategory(index) {
    const categories = ["アビリティ", "狂気"];
    currentCategory = categories[index];
    selectedTag = ""; // カテゴリが変わったら選択をリセット

    // ナビボタンの active クラス切り替え
    const btns = document.querySelectorAll('.category-nav .cat-btn');
    btns.forEach((b, i) => b.classList.toggle('active', i === index));

    // セレクトボックスの選択肢を再生成 ＆ 再描画
    renderTagOptions();
    renderAndFilter();
}

// =========================================================================
// 2. 新版・旧版ボタンの切り替え処理
// =========================================================================
function setVersion(btn, version) {
    const group = btn.parentElement;
    group.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('version-status').value = version;
    selectedTag = ""; // バージョンが変わったら選択をリセット

    renderTagOptions();
    renderAndFilter();
}

// =========================================================================
// 3. セレクトボックスの <option> を動的に生成する
// =========================================================================
function renderTagOptions() {
    const selectEl = document.getElementById('tag-filter');
    if (!selectEl) return;
    selectEl.innerHTML = ""; // 一旦リセット

    // 分割ファイルからマージされたデータを安全に取得
    const db = window.INSANE_DATABASE || {};
    const version = document.getElementById('version-status').value;
    const tags = db[currentCategory]?.["tags"]?.[version] || [];

    // 先頭に「すべての分類」を作成
    const allOption = document.createElement('option');
    allOption.value = "";
    allOption.textContent = "すべての分類";
    selectEl.appendChild(allOption);

    // データベースのタグ配列をループして option を錬成
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        selectEl.appendChild(option);
    });

    // 選択状態をリセット
    selectEl.value = "";
}

// セレクトボックスが変更された時の処理
function selectTagOption(val) {
    selectedTag = val;
    renderAndFilter();
}

// =========================================================================
// 4. テーブルヘッダー ＆ 行の動的生成・フィルタリング（コピーボタン全装填）
// =========================================================================
function renderAndFilter() {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    if (!thead || !tbody) return;

    thead.innerHTML = "";
    tbody.innerHTML = "";

    const db = window.INSANE_DATABASE || {};
    const version = document.getElementById('version-status').value;
    const keyword = document.getElementById('keyword-search').value.toLowerCase();

    if (!db[currentCategory] || !db[currentCategory]["headers"] || !db[currentCategory]["headers"][version]) return;

    // 1. ヘッダー(th)の動的錬成
    const headers = db[currentCategory]["headers"][version];
    const trHead = document.createElement('tr');
    headers.forEach(hText => {
        const th = document.createElement('th');
        th.textContent = hText;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // 2. データ行の錬成
    const rawList = db[currentCategory][version] || [];

    rawList.forEach(item => {
        const itemTag = item.type || item.category || "";
        if (selectedTag && itemTag !== selectedTag && item.supplement !== selectedTag) return;

        const fullText = Object.values(item).join(" ").toLowerCase();
        if (keyword && !fullText.includes(keyword)) return;

        const tr = document.createElement('tr');
        tr.className = 'item-row';
        
        // データの主キー（名前）を事前に取得（コピー時の特定用）
        const primaryName = item.name || "不明";
        
        headers.forEach(hText => {
            const td = document.createElement('td');
            let cellValue = "";

            if (hText === "タイプ") cellValue = item.type;
            else if (hText === "アビリティ名" || hText === "狂気名") cellValue = item.name;
            else if (hText === "指定特技") cellValue = item.skill;
            else if (hText === "効果") cellValue = item.effect;
            else if (hText === "記載") cellValue = item.book;
            else if (hText === "取得条件") cellValue = item.condition;
            else if (hText === "サプリメント") cellValue = item.supplement;
            else if (hText === "カテゴリ") cellValue = item.category;
            else if (hText === "英字") cellValue = item.letter;
            else if (hText === "トリガー") cellValue = item.trigger;

            // 【超強化】すべてのセルを「テキスト」と「ホバー時に出るコピーボタン」の構造にする
            td.className = "copyable-cell";
            if (hText === "効果" || hText === "トリガー") {
                td.classList.add("long-text-cell"); // 長い文章用のクラス
            }
            
            td.innerHTML = `
                <span class="cell-data">${cellValue || ""}</span>
                <button class="copy-inline-btn" onclick="copyDynamicCell(this, '${hText}', '${primaryName}')"> </button>
            `;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// =========================================================================
// 5. 新・コピー機能（全セル対応型）
// =========================================================================
function copyDynamicCell(btn, headerName, itemName) {
    const textToCopy = btn.parentElement.querySelector('.cell-data').textContent.trim();
    
    // Discordにそのまま投下できる美しい整形フォーマット
    const formattedText = `**【${currentCategory}：${itemName}】**\n${headerName}：${textToCopy}`;

    navigator.clipboard.writeText(formattedText).then(() => {
        const originalText = btn.textContent;
        btn.textContent = "OK!";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove("copied");
        }, 1000);
    });
}