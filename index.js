const express = require('express');
const location = require('./models/locations')
const dotenv = require('dotenv');
const mongoose  = require('mongoose');
const { ReplSet } = require('mongodb');
dotenv.config({path:'./config.env'});
const DB = process.env.DATABASE;
mongoose.connect(DB,{
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify: true

}).then(() =>{console.log("success!!");}); 

function createUser(l1,l2,flag){
//const Location = mongoose.model('Location',locSchema);
const testloc = new location({
    isInfected:flag,
    location:{
        type: "Point",
        coordinates: [
             l1,
             l2
        ]
    }
});
testloc.save();
}
const app = express();
app.use(express.json()); 
/*app.get('/',(req,res) =>{
    res.status(200).json({message : 'Hello from the server!',appName : 'api'});
});*/

//processing
app.post('/',async(req,res) =>{

    const t=req.body['type'];

    if(t==1){
        const name=req.body['name'];
        const id = req.body['id'];
        const l1 = req.body['l1'];
        const l2 = req.body['l2'];
        const flag = req.body['flag'];
        createUser(name,id,l1,l2,flag);
        res.status(200).json({"ans":"done"});
    }
    else if(t==2){
        const b=req.body['paths'];
        const distances=req.body['distances'];
        //const ans=await minDensity(routes,distances);
        var min_dens=Infinity;
        var ans=0;
        const points=await location.find({location: {$near :{$maxDistance:10000,$geometry:{type:"Point",coordinates:[b[0][0][0],b[0][0][1]]}}},isInfected:true});
        for(let i=0;i<b.length;i++){
            //going through all the routes available
            var dens=0;
            
            for(let j=0;j<b[i].length;j++){
                //going through all the points in the path
                const l1=b[i][j][0];
                const l2=b[i][j][1];
                const ans=await location.find({location: {$near :{$maxDistance:100,$geometry:{type:"Point",coordinates:[l1,l2]}}},isInfected:true});
                dens+=ans.length;
                console.log(ans.length);
            }
            dens=dens/b[i].length;
            if(dens<min_dens){
               min_dens=dens;
                ans=i;
            }else if(dens==min_dens && distances[i]<distances[ans] ){
                ans=i;
            }
        }
        res.status(200).json({"ans":ans,"path":b[ans],"points":points});
    }
    else{
        res.status(200).json({"ans":""});
    }
});

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`App running on ${port}...`);
});


