/**
 * ASL Optimized LP Renderer
 * @param {Array} data - JSONから取得した全インデックスデータ
 */
function renderASLLandingPage(data) {
    const container = document.getElementById('asl-lp-grid');
    if (!container) return;

    // 1. 秘匿プロトコルによるパーソナライズ・ソート
    // _st_get_w はブラウザの履歴(p1, p2, uid)を見て重みを返す
    const optimizedList = data.map(item => {
        const personalWeight = typeof _st_get_w === 'function' ? _st_get_w(item) : 0;
        
        // 基礎重みの計算（Tierの権威性とT-SCOREの客観性）
        const tierScores = { "Diamond": 1000, "Platinum": 500, "Gold": 100 };
        const baseWeight = (tierScores[item.TIER] || 0) + (parseFloat(item.T_SCORE) || 0);
        
        return { ...item, _final_w: baseWeight + personalWeight };
    }).sort((a, b) => b._final_w - a._final_w);

    // 2. HTML生成（鑑定書スタイル）
    container.innerHTML = optimizedList.slice(0, 60).map(item => {
        // Narrative(V列)の冒頭を「解析要旨」として抽出
        const observation = item.NARRATIVE ? item.NARRATIVE.substring(0, 40) + '...' : 'Under Analysis...';
        
        return `
        <article class="analysis-card" onclick="_st_upd({id:'${item.CID}', t:'${item.TIER}', p1:'${item.CUP}', p2:'${item.HEIGHT}'})">
            <a href="/p/${item.CID}.html">
                <div class="visual-frame">
                    <img src="${item.IMAGE_URLS.split(',')[0]}" alt="${item.CID}" loading="lazy">
                </div>
                <div class="analysis-data">
                    <div class="data-header">
                        <span class="badge-${item.TIER}">${item.TIER}</span>
                        <span class="t-score">T-${parseFloat(item.T_SCORE).toFixed(1)}</span>
                    </div>
                    <h2 class="subject-name">${item.ACTRESS_NAME}</h2>
                    <div class="taxonomy-row">
                        <span class="tag">#${item.SERIES_NAME || 'Unique'}</span>
                        <span class="tag">#${item.CUP}cup</span>
                        <span class="tag">#${item.HEIGHT}cm</span>
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
