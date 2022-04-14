
const express = require("express");
const app =express();
const sha256 =require('crypto-js/sha256');
const { json } = require("express/lib/response");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
class Block{
    constructor(
        index,
        timestamp,
        transaction,
        precedingHash=''
    ){
       this.index=index;
       this.timestamp=timestamp;
       this.transaction =transaction;
       this.precedingHash =precedingHash ;
       this.hash =this.computeHash();
    }

    computeHash(){
        return sha256(
            this.index+
            this.precedingHash+this.timestamp+
            JSON.stringify(this.transaction)
        ).toString();
    }
}
class Blockchain{
    constructor(){
        this.id="";
        this.name="";
        this.blockchain="";
        this.difficulty="";

    }
    create(id,name,genesis){
        this.id =id;
        this.name =name;
        this.blockchain=[this.startGenesisBlock(genesis)]
    }
    startGenesisBlock(genesis){
        return new Block(
            0,genesis.date,genesis.transaction,"0"
        )


    }
    obtainLatestBlock(){
        return this.blockchain[this.blockchain.length-1];
    }
    addNewBlock(newBlock){
        newBlock.precedingHash =this.obtainLatestBlock().hash;
        newBlock.hash =newBlock.computeHash();
        this.blockchain.push(newBlock);
    }
    checkChainValidity(){
        for(let i=1;i<this.blockchain.length;i++){
            const currentBlock =this.blockchain[i];
            const precedingBlock =this.blockchain[i];
            if(currentBlock.hash !== currentBlock.computeHash()){
                return false;
            }
            if(currentBlock.precedingHash !== precedingBlock.hash){
                return false;
            }
            return true;
        }
    }


}
const GlobalChain =new Blockchain();
class DKCoin{
    constructor(){
        this.chain=[]
    }
    
    validateNewChain=(req,res,next)=>{
        if(req.body){
           if( req.body.id &&
            req.body.name &&
            req.body.genesis &&
            req.body.genesis.date &&
            req.body.genesis.transaction){
                    next()
            }else{
                res.status(400)
                .send({message:' Requst format is not corret!'})
            }
        }else{
            res.status(200).send({message:'Requst format corret'})
        }
    }

    createNewChain=(req,res)=>{
        const chain =GlobalChain.create(
            req.body.id,
            req.body.name,
            req.body.genesis
        )
        res
        .status(200)
        .send({
            message:'Chain create',data:GlobalChain
        })
    }
    appendNewchild=(req,res)=>{
        const block =new Block(
            this.chain.length,
            req.body.timestamp,
            req.body.transaction,
        )
        GlobalChain.addNewBlock(block);
        res.status(200).send({message:'Block added'})
    }
    getChain =(req,res)=>{
            res.status(200).send({chain : GlobalChain})

    }
}
const Controler =new DKCoin();
app.post('/api/blockchain',Controler.validateNewChain,Controler.createNewChain)
app.get('/api/blockchain',Controler.getChain)
app.post('/api/blockchain/appendNewchild',Controler.appendNewchild,Controler.appendNewchild)
app.listen(9090,()=>{
    console.log('Run You blockchain')
})
