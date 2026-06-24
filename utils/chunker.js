/**
 * Splits a large text into smaller chunks with optional overlap.
 * 
 * @param {string} text - The input text to chunk.
 * @param {number} chunkSize - The maximum number of characters in a chunk.
 * @param {number} overlap - The number of characters to overlap between chunks.
 * @returns {string[]} An array of text chunks.
 */
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
    if (!text || typeof text !== "string") return [];
    
    const chunks = [];
    let i = 0;
    
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += (chunkSize - overlap);
    }
    
    return chunks;
};
