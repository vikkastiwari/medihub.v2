// const winston = require('winston');


module.exports = (err, req, res, next) =>{
    console.log('Error : ' + err);
    
    return res.send(`
    <div style="text-align:center;">
        <h2 style="color: red;">500 Internal Server Error</h2>
    </div>
`);
   
}