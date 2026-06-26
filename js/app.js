const { createApp, ref, computed, onMounted, nextTick, watch } = Vue;

createApp({
    setup() {
        const currentTab = ref("form");
        const userTemplates = ref([]);
        const tray = ref([]);
        const currentTrayIndex = ref(null);
        const selectedMadnessId = ref("nm-1");

        const filter = ref({
            version: "new",
            world: "all",
            searchQuery: "",
        });

        const loadUserTemplates = () => {
            const saved = localStorage.getItem("insane_user_templates");
            if (saved) {
                try {
                    userTemplates.value = JSON.parse(saved);
                } catch (e) {
                    console.error("テンプレートの読み込みに失敗しました。", e);
                }
            }
        };
        loadUserTemplates();

        const saveAsTemplate = () => {
            const name = prompt(
                "テンプレート名を入力してください：",
                currentCard.value.titleBox.titleJa || "新規オリジナル狂気",
            );
            if (!name) return;

            const newTemplate = {
                madnessId: "user-" + Date.now(),
                templateName: name,
                cardData: JSON.parse(JSON.stringify(currentCard.value)),
            };

            userTemplates.value.push(newTemplate);
            localStorage.setItem(
                "insane_user_templates",
                JSON.stringify(userTemplates.value),
            );

            filter.value.world = "custom";
            selectedMadnessId.value = newTemplate.madnessId;
            alert(`「${name}」をマイテンプレートに保存`);
        };

        const deleteTemplate = (id) => {
            if (!confirm("本当に削除しますか？")) return;
            userTemplates.value = userTemplates.value.filter(
                (t) => t.madnessId !== id,
            );
            localStorage.setItem(
                "insane_user_templates",
                JSON.stringify(userTemplates.value),
            );
            selectedMadnessId.value = "custom";
        };

        const exportTemplates = () => {
            if (userTemplates.value.length === 0) {
                alert("保存されているテンプレートがありません。");
                return;
            }
            const dataStr = JSON.stringify(userTemplates.value, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `inSANE_templates_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };

        const importTemplates = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (!Array.isArray(imported))
                        throw new Error("データ形式が違います。");

                    imported.forEach((newT) => {
                        if (
                            !userTemplates.value.some(
                                (t) => t.madnessId === newT.madnessId,
                            )
                        ) {
                            userTemplates.value.push(newT);
                        }
                    });

                    localStorage.setItem(
                        "insane_user_templates",
                        JSON.stringify(userTemplates.value),
                    );
                    alert("テンプレートを正常にインポート");
                    filter.value.world = "custom";
                    e.target.value = "";
                } catch (err) {
                    alert("ファイルの読み込みに失敗しました。");
                }
            };
            reader.readAsText(file);
        };

        const applyTemplate = () => {
            if (selectedMadnessId.value === "custom") {
                currentCard.value.titleBox.titleJa = "";
                currentCard.value.titleBox.titleEn = "";
                currentCard.value.triggerBox.text = "";
                currentCard.value.descBox.text = "";
                return;
            }

            const userT = userTemplates.value.find(
                (t) => t.madnessId === selectedMadnessId.value,
            );
            if (userT) {
                Object.assign(
                    currentCard.value,
                    JSON.parse(JSON.stringify(userT.cardData)),
                );
                return;
            }

            const list = window.mockMadnessList || [];
            const t = list.find((m) => m.madnessId === selectedMadnessId.value);
            if (t) {
                currentCard.value.titleBox.titleJa = t.titleJa || "";
                currentCard.value.titleBox.titleEn = t.titleEn || "";
                currentCard.value.triggerBox.text = t.trigger || "";
                currentCard.value.descBox.text = t.desc || "";
            }
        };

        watch(
            filter,
            () => {
                nextTick(() => {
                    const list = filteredMadnessList.value;
                    if (filter.value.world === "custom") {
                        const exists = userTemplates.value.some(
                            (t) => t.madnessId === selectedMadnessId.value,
                        );
                        if (!exists && selectedMadnessId.value !== "custom") {
                            selectedMadnessId.value = "custom";
                        }
                        return;
                    }

                    if (list.length > 0) {
                        const exists = list.some(
                            (m) => m.madnessId === selectedMadnessId.value,
                        );
                        if (!exists) {
                            selectedMadnessId.value = list[0].madnessId;
                        }
                    } else {
                        selectedMadnessId.value = "custom";
                    }
                });
            },
            { deep: true },
        );

        const filteredMadnessList = computed(() => {
            if (filter.value.world === "custom") return [];

            const list = window.mockMadnessList || [];
            let result = list.filter((m) => {
                if (m.version !== filter.value.version) return false;
                if (
                    filter.value.world !== "all" &&
                    m.world !== filter.value.world
                )
                    return false;
                return true;
            });

            if (filter.value.searchQuery) {
                const s = filter.value.searchQuery.toLowerCase();
                result = result.filter(
                    (m) => m.titleJa && m.titleJa.toLowerCase().includes(s),
                );
            }
            return result;
        });

        const filteredUserTemplates = computed(() => {
            let result = userTemplates.value;

            if (filter.value.searchQuery) {
                const s = filter.value.searchQuery.toLowerCase();
                result = result.filter((t) => {
                    const title = t.cardData.titleBox.titleJa || t.templateName;
                    return title && title.toLowerCase().includes(s);
                });
            }
            return result;
        });

        // 1. カードの初期データ定義
        const currentCard = ref({
            id: "",
            bgColor: "#FFFFFF",
            bgPattern: "pat-grid",
            patternColor: "#E5E7EB",
            bgImage: null,
            illrImage: null,
            illustration: "#BDBDBD",
            fontStyle: "font-gothic",
            textColor: "#000000",
            isCustom: false,
            madnessId: "nm-1",
            borderColor: "#222222",

            cardBox: {
                showBorder: true,
                borderWidth: 4,
                borderColor: "#000000",
            },
            titleBox: {
                titleJa: "",
                titleEn: "",
                fontSizeJa: 64,
                fontSizeEn: 24,
                textColor: "#000000",
                fontStyle: "font-gothic",
            },
            triggerBox: {
                text: "",
                fontSize: 32,
                textColor: "#000000",
                fontStyle: "font-gothic",
                alignY: "justify-center",
                alignX: "text-center",
                letterSpacing: 0,
                showBorder: true,
                borderWidth: 4,
                borderColor: "#000000",
                bgColor: "#FFFFFF",
                bgOpacity: 90,
                decorImage: null,
                decorWidth: 100,
            },
            illrBox: {
                showBorder: true,
                borderWidth: 4,
                borderColor: "#000000",
                bgColor: "#BDBDBD",
            },
            descBox: {
                text: "",
                fontSize: 36,
                textColor: "#000000",
                fontStyle: "font-gothic",
                alignY: "justify-start",
                alignX: "text-left",
                letterSpacing: 0,
                showBorder: true,
                borderWidth: 4,
                borderColor: "#000000",
                bgColor: "#FFFFFF",
                bgOpacity: 90,
                decorImage: null,
                decorWidth: 100,
            },
            stamp: {
                show: true,
                rotate: -15,
                image: "https://raw.githubusercontent.com/chan4510/mysite/6c3a5898488a24491968f1453ee66253994f4ccb/images/active-stamp.png",
            },
        });

        const hexToRgba = (hex, opacity) => {
            if (!hex) return "rgba(255, 255, 255, 1)";
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
        };

        const onFileChange = (e, type) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                if (type === "stamp.image") {
                    currentCard.value.stamp.image = url;
                } else {
                    currentCard.value[type] = url;
                }
            }
        };

        const onTriggerDecorChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                currentCard.value.triggerBox.decorImage =
                    URL.createObjectURL(file);
            }
        };

        const onDescDecorChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                currentCard.value.descBox.decorImage =
                    URL.createObjectURL(file);
            }
        };

        const markAsCustom = () => {
            if (!currentCard.value.isCustom) {
                currentCard.value.isCustom = true;
                selectedMadnessId.value = "custom";
                currentCard.value.madnessId = "o-1";
            }
        };

        const pushToTray = () => {
            const copy = JSON.parse(JSON.stringify(currentCard.value));
            copy.id = "card_" + Date.now();
            if (currentTrayIndex.value !== null) {
                tray.value[currentTrayIndex.value] = copy;
                currentTrayIndex.value = null;
            } else {
                tray.value.push(copy);
            }
            if (window.innerWidth < 768) currentTab.value = "tray";
        };

        const loadFromTray = (index) => {
            currentTrayIndex.value = index;
            currentCard.value = JSON.parse(JSON.stringify(tray.value[index]));
            selectedMadnessId.value = currentCard.value.isCustom
                ? "custom"
                : currentCard.value.madnessId;
        };

        const loadFromTrayMobile = (index) => {
            loadFromTray(index);
            currentTab.value = "form";
        };
        const removeFromTray = (index) => {
            tray.value.splice(index, 1);
            if (currentTrayIndex.value === index) currentTrayIndex.value = null;
        };
        const clearTray = () => {
            tray.value = [];
            currentTrayIndex.value = null;
        };

        const downloadZip = async () => {
            if (tray.value.length === 0) return;
            const zip = new JSZip();
            const backup = JSON.parse(JSON.stringify(currentCard.value));

            for (let i = 0; i < tray.value.length; i++) {
                currentCard.value = tray.value[i];
                await nextTick();
                const element = document.getElementById("card-capture-target");
                const canvas = await html2canvas(element, {
                    width: 960,
                    height: 1440,
                    scale: 1,
                });
                const imgData = canvas.toDataURL("image/png").split(",")[1];
                const fileName = `${i + 1}_${currentCard.value.titleJa.replace(/[\/\\:\*\?"<>\|]/g, "")}.png`;
                zip.file(fileName, imgData, { base64: true });
            }

            currentCard.value = backup;
            const content = await zip.generateAsync({
                type: "blob",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "madness_cards.zip";
            link.click();
        };

        onMounted(() => {
            lucide.createIcons();
        });

        return {
            currentTab,
            currentCard,
            tray,
            currentTrayIndex,
            selectedMadnessId,
            filter,
            filteredMadnessList,
            userTemplates,
            filteredUserTemplates,
            hexToRgba,
            onFileChange,
            onTriggerDecorChange,
            onDescDecorChange,
            applyTemplate,
            markAsCustom,
            pushToTray,
            loadFromTray,
            loadFromTrayMobile,
            removeFromTray,
            clearTray,
            downloadZip,
            saveAsTemplate,
            deleteTemplate,
            exportTemplates,
            importTemplates,
        };
    },
}).mount("#app");
