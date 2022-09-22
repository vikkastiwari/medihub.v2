const app = require('express').Router();
const bcrypt = require('bcryptjs');
const { Customer, Shopkeeper } = require('../model/users');

app.get('/', (req, res) => {
    return res.render('login', { alerts: req.flash('alert') });
});


app.post('/', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userType = req.body.user;
    // console.log(email);
    // console.log(password);
    // console.log(userType);
    // return res.redirect('/login');

    let user;
    if (userType == 'Customer') {
        user = await Customer.findOne({ email });
    } else if (userType == 'Shopkeeper') {
        user = await Shopkeeper.findOne({ email });
    } else {
        req.flash('alert',
            {
                type: 'danger',
                msg: 'Something went wrong. Try again!'

            }
        );
        return res.redirect('/login');
    }

    if (user) {
        if (bcrypt.compareSync(password, user.password)) {
            req.session.user = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                pincode: user.pincode,
                userType: user.userType
            };
            // console.log(req.session);
            // console.log(req.session.user);

            req.session.save(function (err) {
                if (userType == 'Customer') {
                    return res.redirect('/c');
                } else if (userType == 'Shopkeeper') {
                    return res.redirect('/s');
                } else {
                    req.flash('alert',
                        {
                            type: 'danger',
                            msg: 'Something went wrong. Try again!'

                        }
                    );
                    return res.redirect('/login');
                }
            });

        } else {
            req.flash('alert',
                {
                    type: 'danger',
                    msg: 'Incorrect Password!'

                }
            );

            return res.redirect('/login');
        }

    } else {
        req.flash('alert',
            {
                type: 'danger',
                msg: 'User does not exist!'

            }
        );

        return res.redirect('/login');

    }
});



module.exports = app;