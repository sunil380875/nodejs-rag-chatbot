import ollama from "ollama";

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

/**
 * Builds a contextual chunk by prepending a generated context.
 * 
 * @param {string} fullDocument - The full document text.
 * @param {string} chunk - The specific text chunk.
 * @returns {Promise<string>} The chunk prepended with its context.
 */
export async function buildContextualChunk(fullDocument, chunk) {
    const prompt = `
            You are given a full document and one chunk from it.
            Your job is to write 2-3 sentences describing what this chunk is about,
            in the context of the full document. Be specific — mention section names,
            clause numbers, or topic headings if relevant.

            <document>
            ${fullDocument.slice(0, 3000)} 
            </document>

            <chunk>
            ${chunk}
            </chunk>

            Respond with ONLY the context description. No preamble.
            `;

    const response = await ollama.chat({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
    });
    const context = response.message.content.trim();
    return `${context}\n\n${chunk}`;
}
