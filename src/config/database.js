import mongoose from "mongoose"

const connectDB = ()=> {
    mongoose.connect(process.env.MONGOURL, {
        dbName: "portfolio"
    }).then(()=> {
        console.log(`DB Connected Successfully`);
    }).catch((err)=> {
        console.log(`Error while db connect : ${err}`);
    })
}

export default connectDB;