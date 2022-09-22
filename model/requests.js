const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    shopkeeperId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    prescriptionImage: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        // required: true
    },
    userComment: {
        type: String,
        // required: true
    },
    shopkeeperComment: {
        type: String,
        // required: true
    },
    wantDate: {
        type: String,
        // required: true
    },
    provideDate:{
        type: String,
        // required: true
    },
    medicines:[{
        name:String,
        price:Number
    }],
    availability:{
        type:Number,
        // 0 - Not Available
        // 1 - Partially Available
        // 2 - Available
    },
    status: {
        type: Number,
        required: true
    },
    type:{
        type:String,
        enum:['Pickup', 'Delivery'],
        required: true
    }
});


const Request = mongoose.model('requests', requestSchema);

// Request.createCollection();
// (async() =>{
//     const newRequest = await Request.create({ 
//         customerId: mongoose.Types.ObjectId(),
//         shopkeeperId: mongoose.Types.ObjectId(),
//         date: '23-09-2020',
//         prescriptionImage: '/image/hello.jpg',
//         amount: 1000,
//         description: [{
//             from: String,
//             message: String
//         }],
//         wantDate: '25-09-2020',
//         getDate: '28-09-2020',
//         status: 'Fully Available'
//     });
// })();

module.exports = { Request };