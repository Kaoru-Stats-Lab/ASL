/** @license ASL Core v4.9.5 | Taxonomy & Filter Integrated */
function renderASLLandingPage(data) {
    const container = document.getElementById('asl-lp-grid');
    if (!container) return;

    // 1. URLパラメータから女優ID (?a=xxxx) を取得
    const urlParams = new URLSearchParams(window.location.search);
    const actressFilter = urlParams.get('a');

    // 2. フィルタリングロジック
    let displayData = data;
    if (actressFilter) {
        // IDが一致するか、名前に検索ワードが含まれる場合に絞り込む
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

    // 4. HTML描画（タクソノミーとナラティブを確実に反映）
    container.innerHTML = optimizedList.map(item => {
        const observation = item.NARRATIVE ? item.NARRATIVE.substring(0, 45) + '...' : 'Under Analysis...';
        const poster = item.IMAGE_URLS ? item.IMAGE_URLS.split(',')[0] : '';
        
        return `
        <article class="analysis-card" onclick="_st_upd({id:'${item.CID}', t:'${item.TIER}', p1:'${item.CUP}', p2:'${item.HEIGHT}'})">
            <a href="/p/${item.CID}.html">
                <div class="visual-frame">
                    <img src="${poster}" alt="${item.CID}" loading="lazy">
                </div>
                <div class="analysis-data">
                    <div class="data-header">
                        <span class="badge-${item.TIER}">${item.TIER}</span>
                        <span class="t-score">T-${parseFloat(item.T_SCORE).toFixed(1)}</span>
                    </div>
                    <h2 class="subject-name">${item.ACTRESS_NAME}</h2>
                    <div class="taxonomy-row">
    ${item.SERIES_NAME ? `<span class="tag">#${item.SERIES_NAME}</span>` : ''}
    <span class="tag">#${item.CUP || 'N/A'}cup</span>
    <span class="tag">#${item.HEIGHT || '???'}cm</span>
</div>
                    <p class="narrative-peek">
                        <span class="label">OBSERVATION:</span> ${observation}
                    </p>
                </div>
            </a>
        </article>
        `;
    }).join('');
}
