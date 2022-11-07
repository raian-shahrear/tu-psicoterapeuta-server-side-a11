const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



// server initializing
app.get('/', (req, res) => {
  res.send('Tu Psicoterapeuta server is running...');
})
app.listen(port, () => {
  console.log(`Server is running on port:${port}`)
})