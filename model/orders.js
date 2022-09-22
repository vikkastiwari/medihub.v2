const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    shopkeeperId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    requestId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    provideDate:{
        type: String,
        // required: true
    },
    medicines:[{
        name:String,
        price:Number
    }],
    type:{
        type:String,
        enum:['Pickup', 'Delivery'],
        required: true
    },
    status:{
        type: Boolean,
        default: false
        //False - Not delivered and True - Delivered
    }
});


const Order = mongoose.model('orders', orderSchema);
// Order.createCollection();
// (async() =>{
//     const newOrder = await Order.create({ 
//         customerId: mongoose.Types.ObjectId(),
//         shopkeeperId: mongoose.Types.ObjectId(),
//         date: '23-09-2020',
//         description:'Medicine',
//         amount: 1000,
//         pickupTime:'23-09-2020',
//         pickupDate: '23-09-2020'
//     });
// })();
module.exports = { Order };