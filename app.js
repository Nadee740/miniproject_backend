const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const cors = require("cors");
const app = express();
// const auth=require('./routes/auth')
const excelToJson = require("convert-excel-to-json");
const multer = require("multer");
const admin = require("./routes/admin");
const student = require("./routes/student");
const inmate = require("./routes/inmate");
const hod = require("./routes/hod");
const warden = require("./routes/warden");
const staffadvisor = require("./routes/staffadvisor");
const certificates = require("./routes/certificates");
const bodyParser = require("body-parser");
var passport = require("passport");
const bcryptjs = require("bcryptjs");
const { pool } = require("./db");
const bcrypt = require("bcryptjs");
const mailer = require('./controllers/mailer')
const CryptoJS = require("crypto-js");
const notification=require('./controllers/notification')
//----------------------MIDDLEWARES-----------------------
//Body parser middleware - passport returned ad request without this
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://miniproject-frontend-lime.vercel.app",
  ],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
//session middleware
app.use(
  sessions({
    secret: "secretkey",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(cookieParser("secretkey"));
app.use(passport.initialize());
// app.use(passport.session())

const configurePassport = require("./passportConfig");
configurePassport(passport);

const port = 8080;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const uploadFile = multer({ storage: storage });
async function importExcelData2Psql(filePath, req, res) {
  // -> Read Excel File to Json Data
  // const excelData = excelToJson({
  //   sourceFile: filePath,
  //   header: {
  //     rows: 1,
  //   },
  //   columnToKey: {
  //     A: "Sl.No",
  //     B: "AD.NO",
  //     C: "New Room number",
  //     D: "Name",
  //     E: "Course",
  //     F: "Branch",
  //     G: "Semester",},
  //   Sheet1: [
  //     {
  //       name: "Customers",

  //     },
  //   ],
  // });
  const excelData = excelToJson({
    sourceFile: filePath,
    header: {
      rows: 1,
    },
    columnToKey: {
      A: "a",
      B: "b",
      C: "c",
      D: "d",
      E: "e",
      F: "f",
      G: "g",
    },
    Sheet1: [
      {
        name: "user",
      },
    ],
  });
  let arr = [];
  try {
    excelData.Sheet1.map(async (row, index) => {
      if (row.c) {
        const block = row.c[0];
        const room = row.c.substring(1, 4);
        const userid = row.b;
        const pass = "1318" + row.b;
        const password = await bcrypt.hash(pass, 8);
        const name = row.d;
        const designation = "student";
        const is_admin = false;
        const insert_user = await pool.query(
          "insert into users(user_id,password,name,designation,is_admin) values($1,$2,$3,$4,$5)",
          [userid, password, name, designation, is_admin]
        );
        const insert_student = await pool.query(
          "insert into student(admission_no,stage) values($1,'inmate')",
          [userid]
        );
        const insert_inmate = await pool.query(
          "insert into inmate_table values($1,$1)",
          [userid]
        );
        const insert_inmate_room = await pool.query(
          "insert into inmate_room select $1,room_id from hostel_room as hr,hostel_blocks as hb where hb.block_name=$2 and hr.room_no=$3 and hr.block_id=hb.block_id;",
          [userid, block, room]
        );

        arr.push(row);
        console.log(arr.length);
      }

      ///INSERTING ROOMS INTO PSQL FROM EXCEL

      //   const block_id = await pool.query(
      //     "select block_id from hostel_blocks where block_name=$1",
      //     [row.b]
      //   );
      //   console.log(block_id.rows[0]);
      //   for (let i = row.c; i <= row.d; i++) {
      //     // const insertblock = await pool.query(
      //     //   "insert into hostel_room(block_id,room_no,floor_no) values ($1,$2,$3)",
      //     //   [block_id.rows[0].block_id, i, String(i)[0]]
      //     // );
      //     // console.log(insertblock)
      //     arr.push({
      //       room_no: i,
      //       floor_no: String(i)[0],
      //       block_name: row.b,
      //     //   block_id: block_id.rows[0].block_id,
      //       hostel: row.a,
      //     });
      //   console.log(arr.length)
      ///INSERTING ROOMS INTO PSQL FROM EXCEL END

      //   }
    });
    if (arr.length == 3)
      res.send({
        tot: excelData.Sheet1.length,
        length: arr.length,
        data: arr,
      });
  } catch (err) {
    console.log(err);
  }

  // var result = excelData.Sheet1.find(item => item.Name.toLowerCase().includes("athira"));
}
//----------------------ROUTES-----------------------
app.get(
  "/upload-excel-data",
  uploadFile.single("import-excel"),
  async (req, res) => {
    const d = await importExcelData2Psql(
      "E:/Mini Project/Details/test inmate details MH.xlsx",
      req,
      res
    );
  }
);
app.get("/", async (req, res) => {
  // const hash = bcryptjs.hashSync('1',10);
  // const updateUser=await pool.query("update users set password =$1 where user_id=$2 returning *",[hash,4])
  // const userid='18MH015';
  // const password=await bcrypt.hash('131818MH015',8);
  // const name='ANIRUDH RAMESH'
  // const designation='student'
  // const is_admin=false
  // pool.query("insert into users(user_id,password,name,designation,is_admin) values($1,$2,$3,$4,$5)",[userid,password,name,designation,is_admin],(err, resp)=>{
  //   res.send(resp)
  // })
});

//----------------------auth routes----------------------
app.get("/auth", (req, res) => {
  res.send("Auth is up!");
});

app.post("/auth/login", passport.authenticate("local"), (req, res) => {
  console.log(req.user, "ju");
  //Uncomment the follwing to use cookie to store username at client
  // res.cookie('user', req.user.username , {signed: true})

  res.send(req.user);
});
app.get("/out", (req, res) => {
  console.log(req.user);
  console.log("hy");
  try {
    req.session.destroy();
    req.logOut();
  } catch (err) {
    console.log(err);
  }
});

app.get("/logout", (req, res) => {
  try {
    //   req.session.destroy()
    //         console.log(req.user)
    //         console.log("logout called , nadee");
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      }
      res.send("success");
    });
  } catch (err) {
    next(err);
  }
});

//passport.session() middleware calls deSerializeUser function and passes the user to req.user if the user is authenticated
app.get("/auth/isAuthenticated", passport.session(), (req, res, next) => {
  //   console.log("req.user : ",req.session.passport)
  console.log("req.user : ", req.user);
  //Uncomment the follwing to retrieve username from the cookie from client browser
  // console.log("cookie is : ",req.signedCookies)
  if (req.user != undefined) res.send(req.user);
  else res.send(null);
});
//----------------------End of auth routes----------------------

//----------------------Auth routes--------------------------
app.post("/facultysignup", async (req, res, next) => {
  console.log(req.body);
  const saltRounds = 10;
  const hash = bcryptjs.hashSync(req.body.password, saltRounds);
  pool.query(
    `insert into users(user_id,password,name,email,mobile_no,designation,is_admin) 
  values($1,$2,$3,$4,$5,'faculty',FALSE) returning *`,
    [req.body.penNo, hash, req.body.name, req.body.email, req.body.phoneNo],
    (err, resp) => {
      if (err) throw err;
      user = resp.rows[0];

      pool.query(
        `insert into faculty(pen_no,designation) values($1,$2)`,
        [req.body.penNo, req.body.designation],
        (err, resp1) => {
          if (err) throw err;

          res.send({ message: "success" });
        }
      );
    }
  );
});

app.post("/studentsignup", async (req, res) => {
  try {
    const saltRounds = 10;
    const hash = bcryptjs.hashSync(req.body.password, saltRounds);
    console.log("here");
    const query = await pool.query(
      `insert into users(user_id,password,name,email,mobile_no,designation,is_admin) values($1,$2,$3,$4,$5,'student',FALSE)`,
      [
        req.body.admissionNo,
        hash,
        req.body.name,
        req.body.email,
        req.body.phoneNo,
      ]
    );
    console.log(req.body);
    const yod = await pool.query(`select year from batch where batchid=$1`, [
      req.body.batchId,
    ]);
    console.log(
      req.body.admissionNo,
      req.body.batchId,
      yod.rows[0].year,
      req.body.address
    );
    const secquery = await pool.query(
      `insert into student(admission_no,batchid,year_of_admission,address,stage) values($1,$2,$3,$4,'noninmate')`,
      [
        req.body.admissionNo,
        req.body.batchId,
        yod.rows[0].year,
        req.body.address,
      ]
    );
    console.log(secquery);
  } catch (e) {
    console.log(e);
  }
});

app.post("/changepassword", async (req, res) => {
  const admission_no = req.body.admission_no;
  const oldpassword = req.body.oldpassword;
  const newpassword = req.body.newpassword;
  const retypedpassword = req.body.retypedpassword;
  console.log(newpassword, admission_no, retypedpassword);
  if (newpassword === retypedpassword) {
    try {
      const saltRounds = 10;
      const hash = bcryptjs.hashSync(newpassword, saltRounds);
      const updateUser = await pool.query(
        "update users set password =$1 where user_id=$2 returning *",
        [hash, admission_no]
      );

      res.send({
        status: "ok",
        msg: "Succesfully updated the password",
      });
    } catch (err) {
      res.send({
        status: "failed",
        msg: err.msg,
      });
    }
  }
});

function encrypt(data,key){
    let encJson = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
     return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));

  }
app.post("/forgot-password",async(req,res)=>{
    try{
       const email=req.body.email;
       const username=req.body.username;
        console.log(req.body)
        const getUserData=await pool.query(`select * from users where user_id=$1 and email=$2`,[username,email])
        if(getUserData.rowCount<1){
            throw new Error("User not found");
        }

        // console.log(getbatchId.rows)
        // var ptext=getbatchId.rows[0].batchid
        
        //     // Encrypt
        var text=username+':'+email
            console.log(text)
        //  var ciphertext = CryptoJS.AES.encrypt(JSON.stringify({text}), 'secret key 123').toString();
         var ciphertext = encrypt(text,'secret key 123')
         console.log("Messge",ciphertext)
            var mailOptions = {
                from: 'cethostelmanagement@outlook.com', // sender address (who sends)
                to: `${email}`, // list of receivers (who receives)
                subject: `Forgot Password`, // Subject line
                text: `Hi ${email}`, // plaintext body
                html: `<b>Hi ${email}</b> <br> <p>Please click on the Link to change password</p><br>
                       <a href="http://localhost:3000/set-new-password?cred=${ciphertext}">Click here</a>` // html body
            };
    
            await mailer.transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
        

                console.log("Messge",mailOptions)
                console.log('Message sent: ' + info.response);
                res.send({
                    status:"ok",
                    msg:"email send to client"
                })
            });

        
}
    catch(err)
    {
        console.log(err.msg)
        res.send({
            status:'failed',
            msg:err.msg
        })
    }
})

//----------------------admin routes----------------------
app.use("/admin", admin);
//----------------------End of auth routes----------------------

//----------------------student routes----------------------
app.use("/student", student);
//----------------------End of student----------------------

//----------------------inmate routes----------------------
app.use("/inmate", inmate);

app.use("/staffadvisor", staffadvisor);
app.use("/hod", hod);
app.use("/warden", warden);

//----------------------certificate routes----------------------
app.use("/certificates", certificates);


app.listen(port, () => {
 
  console.log(`App listening on port ${port}`);
});
//----------------------End of student----------------------
