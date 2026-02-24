/** @license ASL Core v4.9.5 | Taxonomy & Filter Integrated | Direct Cart Enabled */
function renderASLLandingPage(data) {
    const container = document.getElementById('asl-lp-grid');
    if (!container) return;

    // 1. URLパラメータから女優ID (?a=xxxx) を取得
    const urlParams = new URLSearchParams(window.location.search);
    const actressFilter = urlParams.get('a');

    // 2. フィルタリングロジック
    let displayData = data;
    if (actressFilter) {
        displayData = data.filter(item => 
            String(item.ACTRESS_ID) === actressFilter || 
            (item.ACTRESS_NAME && item.ACTRESS_NAME.includes(actressFilter))
        );
    }

    // 3. 秘匿プロトコルによる重み付けソート
    const optimizedList = displayData.map(item => {
        const personalWeight = typeof _st_get_w === 'function' ? _st_get_w(item) : 0;
        const tierScores = { "Diamond": 1000, "Platinum": 500, "Gold": 100 };
        const baseWeight = (tierScores[item.TIER] || 0) + (parseFloat(item.T_SCORE) || 0);
        return { ...item, _final_w: baseWeight + personalWeight };
    }).sort((a, b) => b._final_w - a._final_w);

    // 4. HTML描画
    container.innerHTML = optimizedList.map(item => {
        const observation = item.NARRATIVE ? item.NARRATIVE.substring(0, 45) + '...' : 'Under Analysis...';
        const poster = item.IMAGE_URLS ? item.IMAGE_URLS.split(',')[0] : '';
        const cup = item.CUP && item.CUP !== 'undefined' ? item.CUP : 'N/A';
        const height = item.HEIGHT && item.HEIGHT !== 'undefined' ? item.HEIGHT : '???';

        // 設定：アフィリエイトIDとリンク
        const affId = "banzaimillio-991";
        const detailUrl = `/p/${item.CID}.html`;
        // ダイレクトカートURL
        const cartUrl = `https://al.dmm.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fservice%2Fdigital%2F-%2Fcart%2F%3D%2Fadd%2Fid%3D${item.CID}%2F&afid=${affId}`;

        return `
        <article class="analysis-card">
            <div class="visual-frame" onclick="_st_upd({id:'${item.CID}', t:'${item.TIER}', p1:'${cup}', p2:'${height}'}); location.href='${detailUrl}';">
                <img src="${poster}" alt="${item.CID}" loading="lazy">
            </div>
            
            <div class="analysis-data">
                <div class="data-header">
                    <span class="badge-${item.TIER}">${item.TIER}</span>
                    <span class="t-score">T-${parseFloat(item.T_SCORE || 0).toFixed(1)}</span>
                </div>
                <h2 class="subject-name">${item.ACTRESS_NAME || 'Unknown'}</h2>
                <div class="taxonomy-row">
                    ${item.SERIES_NAME ? `<span class="tag">#${item.SERIES_NAME}</span>` : ''}
                    <span class="tag">#${cup}cup</span>
                    <span class="tag">#${height}cm</span>
                </div>
                <p class="narrative-peek">
                    <span class="label">OBSERVATION:</span> ${observation}
                </p>

                <div class="action-row" style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn-detail" onclick="location.href='${detailUrl}'" style="flex: 1; padding: 10px 5px; font-size: 0.7rem; font-weight: 900; background: #e9ecef; border: none; cursor: pointer; border-radius: 2px;">
                        🔍 ANALYSIS
                    </button>
                    <button class="btn-cart" onclick="this.innerHTML='CONNECTING...'; location.href='${cartUrl}'" style="flex: 1; padding: 10px 5px; font-size: 0.7rem; font-weight: 900; background: #ff8c00; color: #fff; border: none; cursor: pointer; border-radius: 2px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                        🛒 SECURE
                    </button>
                </div>
            </div>
        </article>
        `;
    }).join('');
}
