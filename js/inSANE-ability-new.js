window.INSANE_DATABASE = window.INSANE_DATABASE || {};
window.INSANE_DATABASE["アビリティ"] = window.INSANE_DATABASE["アビリティ"] || {};

window.INSANE_DATABASE["アビリティ"]["headers"] = window.INSANE_DATABASE["アビリティ"]["headers"] || {};
window.INSANE_DATABASE["アビリティ"]["headers"]["new"] = ["タイプ", "アビリティ名", "指定特技", "効果", "取得条件", "記載"];

window.INSANE_DATABASE["アビリティ"]["tags"] = window.INSANE_DATABASE["アビリティ"]["tags"] || {};
window.INSANE_DATABASE["アビリティ"]["tags"]["new"] = ["攻撃", "サポート", "装備"];

window.INSANE_DATABASE["アビリティ"]["new"] = [
    { "type": "攻撃", "name": "基本攻撃（新）", "skill": "自由", "effect": "新版の効果テキスト。", "condition": "なし", "book": "p150" }
    // 今後、新版のアビリティ（新サプリとかのやつ）が増えたらここに足していく
];