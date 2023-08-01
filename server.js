const express = require('express');
const app = express();

const PORT = 3010;

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index.html')
})

app.listen(PORT, () => {
    console.log("the server is forever LISTENING on port " + PORT);
})