import app from "./app.js"

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`Server is runing on PORT ${PORT}`);
}).on("error", (err)=> {
    console.error(`Something went wrong with the server : ${err}`);
});

