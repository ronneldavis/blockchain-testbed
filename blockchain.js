const crypto = require('crypto');

module.exports = class blockChain{
    
    constructor(){
        this.chain = [];
        this.genesisBlock = {
            index: 0,
            timestamp: 1511818270000,
            data: "Genesis block",
            previousHash: "-1",
            nonce: 0
        }

        this.genesisBlock.hash = this.createHash(this.genesisBlock);
        this.chain.push(this.genesisBlock);
        this.currentBlock = this.genesisBlock;
    }
    
    createHash({ timestamp, data, index, previousHash, nonce }){
        return crypto.createHash('SHA256').update(timestamp+data+index+previousHash+nonce).digest('hex');
    }
    
    addToChain(block){
        if(this.checkNewBlockIsValid(block, this.currentBlock)){
            this.chain.push(block);
            this.currentBlock = block;
            return true;
        }
        return false;
    }
    
    proofOfWork(block){
       while(true){
           block.hash = this.createHash(block);
           if(block.hash.slice(-3) == "000") return block;
           else block.nonce++ ;
       } 
    }
    
    createBlock(data){
        let newBlock = {
            timestamp: new Date().getTime(),
            data: data,
            index: this.currentBlock.index + 1,
            previousHash: this.currentBlock.hash,
            nonce: 0
        }

        newBlock.hash = this.createHash(newBlock);
        return newBlock;
    }
    
    getLatestBlock(){ return this.currentBlock; }
    getTotalBlocks(){ return this.chain.length; }
    getChain(){ return this.chain; }
    
    hashIsValid(block){
        return this.createHash(block) == block.hash;
    }
    
    checkNewBlockIsValid(block, previousBlock){
        if(previousBlock.index !== block.index - 1) return false;
        if(previousBlock.hash !== block.previousHash) return false;
        if(!this.hashIsValid(block)) return false;
        return true;
    }
    
    checkNewChainIsValid(newChain){
        if(this.createHash(newChain[0]) !== this.genesisBlock.hash){
            return false;
        }
        let previousBlock = newChain[0];
        let blockIndex = 1;
        while(blockIndex < newChain.length){
            let block = newChain[blockIndex];
            if(block.previousHash !== this.createHash(previousBlock)){
                return false;
            }

            if(block.hash.slice(-3) !== "000"){	
                return false;
            }

            previousBlock = block;
            blockIndex++;
        }
        
        return true;
    }
    
    replaceChain(newChain){
        this.chain = newChain;
        this.currentBlock = this.chain[this.chain.length-1];
    }
    
}
