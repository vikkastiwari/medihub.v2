const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        // required: true
    },
    userType: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        // required: true
    },
    middleName: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        // required: true
    },
    dob:{
        type: String,
        // required: true
    },
    mobile: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    district: {
        type: String,
        // required: true
    },
    state: {
        type: String,
        // required: true
    },
    orders: [new mongoose.Schema({
        shopName: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        mobile:{
            type: String,
            required: true
        },
        type:{
            type:String,
            enum:['Pickup', 'Delivery'],
            required: true
        },
        status: {
            type: Number,
            default:false
        }
    })],
    requests: [new mongoose.Schema({
        shopName:{
            type: String,
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
        wantDate: {
            type: String,
            required: true
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
    })],
    verified: {
        type: Boolean,
        default: false
    },
    otp: String
});

const shopkeeperSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        // required: true
    },
    userType: {
        type: String,
        required: true
    },
    dob:{
        type: String,
        // required: true
    },
    shopName: {
        type: String,
        // required: true
    },
    firstName: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        // required: true
    },
    mobile: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    district: {
        type: String,
        // required: true
    },
    state: {
        type: String,
        // required: true
    },
    pickup: {
        type: Boolean,
        default: false
        // required: true
    },
    delivery: {
        type: Boolean,
        default: false
        // required: true
    },
    orders: [
        new mongoose.Schema({
        customerName: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        mobile:{
            type: String,
            required: true
        },
        type:{
            type:String,
            enum:['Pickup', 'Delivery'],
            required: true
        },
        status: {
            type: Number,
            default:false
        }
    })],
    requests: [
        new mongoose.Schema({
        customerName: {
            type: String,
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
        wantDate: {
            type: String,
            required: true
        },
        mobile:{
            type: String,
            required: true
        },
        type:{
            type:String,
            enum:['Pickup', 'Delivery'],
            required: true
        },
        status: {
            type: Number,
            required: true
        }
    })],
    verified: {
        type: Boolean,
        default: false
    },
    otp: String

}); 

const Customer = mongoose.model('customer', customerSchema);
const Shopkeeper = mongoose.model('shopkeeper', shopkeeperSchema);

// Customer.createCollection();
// Shopkeeper.createCollection();
// (async() =>{
//     const newShopkeeper = await Shopkeeper.create({ 
//         email: 'sethbimalesh@gmail.com',
//         password: '12345678',
//         pincode: '400101',
//         userType: 'Shopkeeper',
//         ownerName: 'Bimalesh',
//         shopName: 'Sandeep Pharma',
//         mobile: '7039581571',
//         address: 'Kandivali East',
//         district: 'Mumbai',
//         state: 'Maharashtra',
//         orders: [ mongoose.Types.ObjectId() ],
//         request: [ mongoose.Types.ObjectId() ]
//     });
// })();
// (async() =>{
//     const newCustomer = await Customer.create({ 
//         email: 'sethbimalesh@gmail.com',
//         password: '12345678',
//         pincode: '400101',
//         userType: 'Customer',
//         firstName: 'Bimalesh',
//         middleName: 'Jawahir',
//         lastName: 'Seth',
//         dob:'21-03-2001',
//         mobile: '7039581571',
//         address: 'Kandivali East',
//         district: 'Mumbai',
//         state: 'Maharashtra',
//         orders: [ mongoose.Types.ObjectId() ],
//         request: [ mongoose.Types.ObjectId() ]
//     });
// })();

module.exports = {
    Customer,
    Shopkeeper
};