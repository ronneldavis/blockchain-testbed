const express = require('express');
const blockNode = require('./blocknode');

const http_port = 3000+Math.floor(Math.random()*10);
const node_port = 18081 + Math.floor(Math.random()*30);

console.log(`node server listening on port ${node_port}`);

const node1 = new blockNode(node_port);
const app = new express();
    
    
app.get('/chain', (req, res)=>{
    res.send(node1.chain.getChain());
})

app.get('/addNode/:port', (req, res)=>{
    node1.addPeer('localhost', req.params.port)
    res.send("Added node");
})

app.get('/mine/:data', (req, res)=>{
    let newBlock = node1.createBlock(req.params.data);
    console.log(node1.getStats())
    res.send(node1.getStats());
})

app.listen(http_port, () => {
    console.log(`http server listening on port ${http_port}`);
})