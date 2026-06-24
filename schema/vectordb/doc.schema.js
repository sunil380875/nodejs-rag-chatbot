import client from "../../db/vectordb.js";

async function generate() {
  await client.createCollection("doc", {
    vectors: {
      size: 768,
      distance: "Cosine",
    },
  });
//   await client.deleteCollection("doc");

  console.log("Collection created");
}


generate().catch(console.error);