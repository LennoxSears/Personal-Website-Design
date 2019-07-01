const express = require('express')
const app = express()
app.use(express.static('public'))

app.listen(80, function() {
  console.log('listening on 80')
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
