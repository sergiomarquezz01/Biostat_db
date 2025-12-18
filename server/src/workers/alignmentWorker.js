// server/workers/alignmentWorker.js
const { parentPort, workerData } = require('worker_threads');

// Algoritmo simplificado para asegurar que devuelva datos inmediatamente
function computeScore(s1, s2) {
    let score = 0;
    const minLen = Math.min(s1.length, s2.length);
    for (let i = 0; i < minLen; i++) {
        if (s1[i] === s2[i]) score += 2; // Coincidencia
        else score -= 1; 
    }
    return score;
}

const { seqA, seqB } = workerData;
const result = computeScore(seqA, seqB);


parentPort.postMessage(result);