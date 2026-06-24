import app from "./app.js"
let port = process.env.PORT
app.listen(port, () => {
    console.log(`http://127.0.0.1:${port}`)
});

