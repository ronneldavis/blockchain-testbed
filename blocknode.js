const blockChain = require("./blockchain");
const WebSocket = require('ws');

const BLOCK = "BLOCK";
const CHAIN = "CHAIN";
const REQUEST_BLOCK = "REQUEST_BLOCK";
const REQUEST_CHAIN = "REQUEST_CHAIN";

module.exports = class blockNode{
    
    constructor(port){
        this.sockets = [];
        this.port = port;
        this.chain = new blockChain();
        
        this.server = new WebSocket.Server({port:port});
        this.server.on('connection', (connection)=>{
            console.log("Connection open");
            this.initConnection(connection);
        })
    }
    
    initConnection(connection){
        this.messageHandler(connection);
        this.sockets.push(connection);
        
        this.requestLatestBlock(connection);
        
        connection.on("error", ()=> this.closeConnection(connection));
        connection.on("close", ()=> this.closeConnection(connection));
    }
    
    closeConnection(connection){
        console.log("Connection close");
        this.sockets.splice(this.sockets.indexOf(connection), 1);
    }
    
    messageHandler(connection){
        connection.on("message", (data)=>{
            console.log("Message in");
            const msg = JSON.parse(data);
            console.log(msg.event);
            switch(msg.event){
                case REQUEST_BLOCK:
                    this.requestLatestBlock(connection);
                    break;
                case REQUEST_CHAIN:
                    connection.send(JSON.stringify({ event: CHAIN, message: this.chain.getChain()}));
                    break;
                case CHAIN:
                    this.processReceivedChain(msg.message);
                    break;
                case BLOCK:
                    this.processReceivedBlock(msg.message);
                    break;  
                default:  
                    console.log('Unknown message');
            }
        })
    }
    
    requestLatestBlock(connection){
        connection.send(JSON.stringify({ event: BLOCK, message: this.chain.getLatestBlock()}))   
    }
    
    processReceivedChain(blocks){
        let newChain = blocks.sort((block1, block2) => (block1.index - block2.index))
        
         if(newChain.length > this.chain.getTotalBlocks() && this.chain.checkNewChainIsValid(newChain)){
            this.chain.replaceChain(newChain);
            console.log('Chain replaced');
        }
    }
    
    processReceivedBlock(block){
        let currentTopBlock = this.chain.getLatestBlock();
        if(block.index <= currentTopBlock.index) return;
        if(block.previousHash == currentTopBlock.hash){
            this.chain.addToChain(block);
        }
        else{
            this.broadcastMessage(REQUEST_CHAIN, "");
        }
    }
    
    broadcastMessage(event, message){
        this.sockets.forEach((node) => {
            node.send(JSON.stringify({event, message}));
        })
    }
    
    createBlock(data){
        let newBlock = this.chain.createBlock(data);
        this.chain.addToChain(newBlock);
        this.broadcastMessage(BLOCK, newBlock);
    }
    
    getStats(){
        return {
            blocks: this.chain.getTotalBlocks()
        }
    }
    
    addPeer(host, port){
        let connection = new WebSocket(`ws://${host}:${port}`);
        
        connection.on('error', (error) =>{
            console.log(error);
        });

        connection.on('open', (msg) =>{
            this.initConnection(connection);
        });
    }
}