
function needlemanWunsch(seqA, seqB) {
    const MATCH = 1;
    const MISMATCH = -1;
    const GAP = -2;

    const n = seqA.length;
    const m = seqB.length;

    
    let matrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

   
    for (let i = 0; i <= n; i++) matrix[i][0] = i * GAP;
    for (let j = 0; j <= m; j++) matrix[0][j] = j * GAP;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const scoreMatch = matrix[i - 1][j - 1] + (seqA[i - 1] === seqB[j - 1] ? MATCH : MISMATCH);
            const scoreDelete = matrix[i - 1][j] + GAP;
            const scoreInsert = matrix[i][j - 1] + GAP;
            matrix[i][j] = Math.max(scoreMatch, scoreDelete, scoreInsert);
        }
    }

    return matrix[n][m];
}

module.exports = { needlemanWunsch };