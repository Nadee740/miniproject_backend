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
//----------------------MIDDLEWARES-----------------------
//Body parser middleware - passport returned ad request without this
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

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
async function importExcelData2MongoDB(filePath, req, res) {
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
    Sheet2: [
      {
        name: "user",
      },
    ],
  });
  let arr = [];
  try {
    excelData.Sheet2.map(async (row, index) => {
    //   const block_id = await pool.query(
    //     "select block_id from hostel_blocks where block_name=$1",
    //     [row.b]
    //   );
    //   console.log(block_id.rows[0]);
      for (let i = row.c; i <= row.d; i++) {
        // const insertblock = await pool.query(
        //   "insert into hostel_room(block_id,room_no,floor_no) values ($1,$2,$3)",
        //   [block_id.rows[0].block_id, i, String(i)[0]]
        // );
        // console.log(insertblock)
        arr.push({
          room_no: i,
          floor_no: String(i)[0],
          block_name: row.b,
        //   block_id: block_id.rows[0].block_id,
          hostel: row.a,
        });
      console.log(arr.length)
    
        
      }
    });
    res.send({
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
    const d = await importExcelData2MongoDB(
      "E:/Mini Project/Details/Hostel_Room Details.xlsx",
      req,
      res
    );
  }
);
app.get("/", async (req, res) => {
    res.send('App is Live!')
    // const userid='21LH121';
    // const password=await bcrypt.hash('131821LH121',8);
    // const name='Athira b'
    // const email='tve20cs037@cet.ac.in'
    // const mobile_no='9496895715'
    // const designation='student'
    // const is_admin=false
    // pool.query("insert into users(user_id,password,name,email,mobile_no,designation,is_admin) values($1,$2,$3,$4,$5,$6,$7)",[userid,password,name,email,mobile_no,designation,is_admin],(err, resp)=>{
    //   console.log(resp.rows)
    // })
});

//----------------------auth routes----------------------
app.get("/auth", (req, res) => {
  res.send("Auth is up!");
});

app.post("/auth/login", passport.authenticate("local"), (req, res) => {
  console.log(req.user);
  //Uncomment the follwing to use cookie to store username at client
  // res.cookie('user', req.user.username , {signed: true})

  res.send(req.user);
});
app.get('/out',(req,res)=>{
    console.log(req.user)
    console.log("hy")
    try{
        req.session.destroy()
        req.logOut()
    }catch(err)
    {
        console.log(err);
    }

})

app.get("/logout", (req,res)=>{
    try{
        //   req.session.destroy()
//         console.log(req.user)
//         console.log("logout called , nadee");
        req.session.destroy(function(err) {
            if (err) { console.log(err) }
            res.send("success");
   });
 
    }catch(err)
    {
        next(err)
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
