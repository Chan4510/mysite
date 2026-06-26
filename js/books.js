    function filterItems() {
            const keyword = document.querySelector('#keyword').value.toLowerCase();
            const category = document.querySelector('#category').value;

            document.querySelectorAll('.item').forEach(item => {
                const name = item.querySelector('.name').textContent.toLowerCase();
                // 名前(キーワード)一致
                const matchKeyword = name.includes(keyword);
                // 区分一致の論理：
                // 1. "all" かどうか
                // 2. 親(item自体)がそのクラスを持っているか (大分類用)
                // 3. 子(td)の中にそのクラスを持つものがいるか (小分類用)
                const matchCategory = (
                    category === "all" || 
                    item.classList.contains(category) || 
                    item.querySelector(`.${category}`) !== null
                );

                if (matchKeyword && matchCategory) {
                    item.removeAttribute('hidden');
                } else {
                    item.setAttribute('hidden', '');
                }
            });

            // テーブル自体の表示制御
            document.querySelectorAll('.data-table').forEach(table => {
                const hasVisibleItem = !!table.querySelector('.item:not([hidden])');
                table.hidden = !hasVisibleItem;
            });
        }

        document.querySelector('#keyword').addEventListener('input', filterItems);
        document.querySelector('#category').addEventListener('change', filterItems);

    function filterItems() {
            const keyword = document.querySelector('#keyword').value.toLowerCase();
            const category = document.querySelector('#category').value;

            document.querySelectorAll('.item').forEach(item => {
                const name = item.querySelector('.name').textContent.toLowerCase();
                // 名前(キーワード)が一致するか
                const matchKeyword = name.includes(keyword);
                // 指定した小分類クラスを持つtdが、その行の中に存在するか
                // もしくは "all" が選択されているか
                const matchCategory = (category === "all" || item.querySelector(`.${category}`) !== null);

                if (matchKeyword && matchCategory) {
                    item.removeAttribute('hidden');
                } else {
                    item.setAttribute('hidden', '');
                }
            });

            // テーブル自体の表示制御（中身が全部消えたテーブルは見せない）
            document.querySelectorAll('.data-table').forEach(table => {
                const hasVisibleItem = !!table.querySelector('.item:not([hidden])');
                table.hidden = !hasVisibleItem;
            });
        }

        document.querySelector('#keyword').addEventListener('input', filterItems);
        document.querySelector('#category').addEventListener('change', filterItems);