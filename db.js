const { Pool } = require('pg')

// const pool=new Pool({
//     user:"postgres",
//     password:"11092002",
//     // host:"ec2-44-196-223-128.compute-1.amazonaws.com",
//     host:"database-1.cdg24o18bv3f.ap-south-1.rds.amazonaws.com",
//     port:5432,
//     database:"test",

// })
const pool=new Pool({
    user:"postgres",
    password:"11092002",
    // host:"ec2-44-196-223-128.compute-1.amazonaws.com",
    host:"localhost",
    port:5432,
    database:"miniproject",

})

const users=[
    {
        username: "user",
        password: "1234",
        roles:["admin", "staff advisor", "hod", "warden", "hosteloffice", "sergeant"]
    }
]

module.exports = {pool, users}