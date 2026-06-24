import { QdrantClient } from "@qdrant/js-client-rest";
import ollama from "ollama";
const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});


// const chunks = [
//   "Node.js is a JavaScript runtime",
//   "Express.js is a web framework",
//   "CM of Westbangal is Sunil Kumar"
// ];

// const embeddingResponse = await ollama.embed({
//   model: "nomic-embed-text",
//   input: chunks,
// });

// await client.upsert("test_collection", {
//   wait: true,
//   points: chunks.map((text, index) => ({
//     id: index + 1,
//     vector: embeddingResponse.embeddings[index],
//     payload: { text },
//   })),
// });

// console.log("Saved to Qdrant");

// await client.deleteCollection("test_collection");
// await client.createCollection("test_collection", {
//   vectors: {
//     size: 768,
//     distance: "Cosine",
//   },
// });

// const operationInfo = await client.upsert("test_collection", {
//   wait: true,
//   points: [
//     { id: 1, vector: [0.05, 0.61, 0.76, 0.74], payload: { city: "Berlin" } },
//     { id: 2, vector: [0.19, 0.81, 0.75, 0.11], payload: { city: "London" } },
//     { id: 3, vector: [0.36, 0.55, 0.47, 0.94], payload: { city: "Moscow" } },
//     { id: 4, vector: [0.18, 0.01, 0.85, 0.80], payload: { city: "New York" } },
//     { id: 5, vector: [0.24, 0.18, 0.22, 0.44], payload: { city: "Beijing" } },
//     { id: 6, vector: [0.35, 0.08, 0.11, 0.44], payload: { city: "Mumbai" } },
//   ],
// });



// console.debug(operationInfo);
// const collections = await client.getCollections();



// console.log(collections);

// let searchResult = await client.query(
//     "test_collection", {
//     query: [0.2, 0.1, 0.9, 0.7],
//     limit: 3
// });

// console.debug(searchResult.points);

// let searchResult = await client.query("test_collection", {
//     query: [0.2, 0.1, 0.9, 0.7],
//     filter: {
//         must: [{ key: "city", match: { value: "London" } }],
//     },
//     with_payload: true,
//     limit: 3,
// });

// console.debug(JSON.stringify(searchResult));
let question = "Who is CM of westbangal?"
const queryEmbedding = await ollama.embed({
    model: "nomic-embed-text",
    input: question,
});

const results = await client.search("test_collection", {
    vector: queryEmbedding.embeddings[0],
    limit: 3,
});

const context = results
    .map(item => item.payload.text)
    .join("\n");
// console.log(context)
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

console.log(response.message.content, "coming response");