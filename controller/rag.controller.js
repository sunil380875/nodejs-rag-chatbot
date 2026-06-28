import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";
import ollama from "ollama";
import client from "../db/vectordb.js";
import { chunkText, buildContextualChunk } from "../utils/chunker.js";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

class RagController {
    ingestDocument = catchAsync(async (req, res) => {
        const { text, type = "text" } = req.body;

        if (!text || typeof text !== 'string') {
            throw new AppError(400, "Valid text must be provided");
        }

        const chunks = chunkText(text, 1000, 200);

        const contextualChunks = [];
        for (const chunk of chunks) {
            contextualChunks.push(await buildContextualChunk(text, chunk));
        }

        const embeddingResponse = await ollama.embed({
            model: "nomic-embed-text",
            input: contextualChunks,
        });

        // Store chunks in Qdrant with the type metadata
        await client.upsert("doc", {
            wait: true,
            points: chunks.map((chunk, index) => ({
                id: Date.now() + index,
                vector: embeddingResponse.embeddings[index],
                payload: {
                    text: chunk,
                    contextualChunk: contextualChunks[index],
                    type: type
                },
            })),
        });

        res.status(200).json(
            new ApiResponse(200, {
                totalChunks: chunks.length,
                type: type
            }, "Document processed and saved successfully")
        );
    });

    ingestPdf = catchAsync(async (req, res) => {
        if (!req.file) {
            throw new AppError(400, "PDF file must be provided");
        }

        const type = "pdf";
        const pdfData = await pdfParse(req.file.buffer, { quiet: true });
        const text = pdfData.text;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            throw new AppError(400, "Failed to extract text from PDF or PDF is empty");
        }
        const chunks = chunkText(text, 1000, 200);

        const contextualChunks = [];
        for (const chunk of chunks) {
            contextualChunks.push(await buildContextualChunk(text, chunk));
        }

        const embeddingResponse = await ollama.embed({
            model: "nomic-embed-text",
            input: contextualChunks,
        });

        // Store chunks in Qdrant with the type metadata
        await client.upsert("doc", {
            wait: true,
            points: chunks.map((chunk, index) => ({
                id: Date.now() + index,
                vector: embeddingResponse.embeddings[index],
                payload: {
                    text: chunk,
                    contextualChunk: contextualChunks[index],
                    type: type
                },
            })),
        });
        res.status(200).json(
            new ApiResponse(200, {
                totalChunks: chunks.length,
                type: type
            }, "PDF processed and saved successfully")
        );
    });

    askQuestion = catchAsync(async (req, res) => {
        const { question } = req.body;
        if (!question || typeof question !== 'string') {
            throw new AppError(400, "Valid question must be provided");
        }
        const queryEmbedding = await ollama.embed({
            model: "nomic-embed-text",
            input: question,
        });

        const results = await client.search("doc", {
            vector: queryEmbedding.embeddings[0],
            limit: 3,
        });

        const context = results
            .map(item => item.payload.contextualChunk || item.payload.text)
            .join("\n");

        const response = await ollama.chat({
            model: "llama3",
            messages: [
                {
                    role: "system",
                    content: `
            You are a RAG assistant.

            Rules:
            1. Answer ONLY from the provided context.
            2. Do not use outside knowledge.
            3. If the answer is not in the context, reply exactly:
            "I don't know."
            4. Keep answers under 100 words.
            5. Use Professional text to answer.
            6. Don't use According to the provided context while answer.
            7. Provide latest data year wise

            Context:
            ${context}
            `
                },
                {
                    role: "user",
                    content: question
                }
            ]
        });

        res.status(200).json(
            new ApiResponse(200, {
                response: response.message.content,
            }, "Response fetched successfully")
        );
    });
}

export default new RagController();