const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
app.use('/lil-gui', express.static(path.join(__dirname, 'node_modules/lil-gui/dist/lil-gui.esm.js')));
app.use('/cannon-es', express.static(path.join(__dirname, 'node_modules/cannon-es/dist/cannon-es.js')))

app.listen(3000, () =>
  console.log('Visit http://127.0.0.1:3000')
);