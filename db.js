const { Pool } = require('pg')
const pool=new Pool({
    user:"postgres",
    password:"11092002",
    // host:"ec2-44-196-223-128.compute-1.amazonaws.com",
    host:"localhost",
    port:5432,
    database:"miniproject",

})
// const pool=new Pool({
//     user:"miniproject",
//     password:"11092002",
//     // host:"ec2-44-196-223-128.compute-1.amazonaws.com",
//     host:"postgresql-125486-0.cloudclusters.net",
//     port:19060,
//     database:"miniproject",

// })

const users=[
    {
        username: "user",
        password: "1234",
        roles:["admin", "staff advisor", "hod", "warden", "hosteloffice", "sergeant"]
    }
]

module.exports = {pool, users}