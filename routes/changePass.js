const app = require('express').Router();
const bcrypt = require('bcryptjs');
const { Customer, Shopkeeper } = require('../model/users');

app.get('/', (req, res) => {
    res.render('cpass', { alerts: req.flash('alert') });
});


app.post('/', async (req, res) => {
    const old = req.body.old;
    const newpass = req.body.new;

    let user = req.session.user;
    if(user.userType == 'Customer'){
        user = await Customer.findOne({ email : user.email });
    } else if(userType == 'Shopkeeper'){
        user = await Shopkeeper.findOne({ email : user.email });
    }
  
    if (user) {
        if(bcrypt.compareSync(old, user.password)){
            user.password = bcrypt.hashSync(newpass, 12);
            await user.save();

            req.session.user = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                pincode: user.pincode,
                userType: user.userType
            };
            console.log(req.session);
            console.log(req.session.user);
            req.flash('alert',
            {
                type: 'success',
                msg: 'Password has been change successfully!'

            });
            
            req.session.save(function (err) {
                if(user.userType == 'Customer'){
                    return res.redirect('/c');
                } else if(user.userType == 'Shopkeeper'){
                    return res.redirect('/s');
                } else {
                    return res.redirect('/logout');
                }
            });
             
        } else {
            req.flash('alert',
            {
                type: 'danger',
                msg: 'Incorrect Password!'

            }
        );

        return res.redirect('/change-password');
        }

    } else {
        req.flash('alert',
            {
                type: 'danger',
                msg: 'User did not found!'

            }
        );

        return res.redirect('/change-password');
      
    }
});



module.exports = app;