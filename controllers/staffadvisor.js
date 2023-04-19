const {pool}=require('../db')
const mailer = require('../controllers/mailer')
const CryptoJS = require("crypto-js");
const notification=require('../controllers/notification')
//Inmate Functions
const inmateList=(req,res)=>{

    pool.query(`SELECT * FROM Users u, STUDENT s, BATCH b, INMATE_TABLE it, INMATE_ROOM ir, HOSTEL_ROOM hr, HOSTEL_BLOCKS hb
                where s.BatchId=b.batchId and u.User_Id=s.Admission_No and s.Admission_No=it.Admission_No and
                it.Hostel_Admission_No=ir.Hostel_Admission_No and ir.Room_Id=hr.Room_Id and 
                hr.block_id=hb.block_id and hb.hostel=$1`, [req.query.hostel], (err, resp) => {
        if (err) {
            throw err
        }

        console.log('user:', resp.rows)

        res.send(resp.rows)
    })
}

const viewCertificates = async (req,res)=>{
    try{
        const user_id=req.query.user_id
        // const certificates=await pool.query('SELECT CA.application_id,CA.certificate_id,CA.date,C.name,CA.approved,CA.rejected,CA.status,CA.feedback,CA.application_form FROM certificate_application as CA,certificates as C WHERE CA.certificate_id=C.certificate_id')
        const certificates=await pool.query('SELECT ST.admission_no,u.name as studentname,B.programme,C.name as certificatename,CA.application_id,CA.date,CA.status,CA.application_form,p.path FROM Roles_faculty as RF, Staff_advisor as SA, student as ST, certificate_application as CA, certificates as C, path as P, users as U,batch as B WHERE Rf.Userid=$1 and Rf.roleid=SA.roleid and SA.batchid=B.batchid and B.batchid=ST.batchid and ST.admission_no = CA.admission_no and CA.certificate_id=C.certificate_id and ST.admission_no=u.user_id and C.pathno=P.pathno',[user_id])
        var requiredCertificates=[]
        for (var i=0;i<certificates.rows.length;i++)
        { 
            var myArray = certificates.rows[i].path.split("-");
            console.log(myArray)
            if(myArray[certificates.rows[i].status]=='SA'){
                requiredCertificates.push(certificates.rows[i])
            }
        }

           
        console.log(certificates.rows)
        console.log(req.query)
        res.json(requiredCertificates)
    }
    catch(e){
        console.error(e)
    }
    
}

const approveApplication = async (req,res)=>{
    const applicationid=req.body.application_id
    console.log(`SELECT P.path,CA.status 
    from certificate_application as CA,certificates as C,path as P 
    where CA.application_id=${applicationid} and CA.certificate_id=C.certificate_id and C.pathno=P.pathno`)

    const query=await pool.query(`SELECT P.path,CA.status 
    from certificate_application as CA,certificates as C,path as P 
    where CA.application_id=${applicationid} and CA.certificate_id=C.certificate_id and C.pathno=P.pathno`)
    console.log(query.rows[0])
    var {path,status}=(query.rows[0])
    var patharray=path.split("-")
    console.log(patharray)
    if(status===(patharray.length)-1){
        console.log(`update certificate_application set approved=TRUE where application_id=${applicationid} returning *`)
        // const query=await pool.query(`update certificate_application set approved=TRUE and where application_id=${applicationid} returning *`)
        pool.query(`update certificate_application set approved=TRUE where application_id=${applicationid} returning *`,(err,resp)=>{
            if(err)
                console.log(err)
            res.send(query.rows)
        })
    }
    else{
        console.log(`update certificate_application set status=status+1 where application_id=${applicationid} returning *`)
        const query=await pool.query(`update certificate_application set status=status+1 where application_id=${applicationid} returning *`)
        console.log(query.rows)
        notification.notifyEmail(query.rows[0].admission_no,query.rows[0].certificate_id,query.rows[0].status,path);
        res.send(query.rows)
    }
   
}

function encrypt(data,key){
    let encJson = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
     return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));

  }

const signUpInvite = async (req,res)=>{
    console.log(req.body)
    // setup e-mail data, even with unicode symbol
    var staffadvid=req.body.UserId
    const getbatchId=await pool.query(`select batchid from staff_advisor where roleid 
    in(select roleid from roles_faculty where userid=$1 and role='SA')`,[staffadvid])
    console.log(getbatchId.rows)
    var ptext=getbatchId.rows[0].batchid
    req.body.jsonData.forEach(async(user) => {
        // Encrypt
        var text=ptext+':'+user.EmailId+':'+user.Name+':'+user.AdmissionNo
        console.log(text)
        // var ciphertext = CryptoJS.AES.encrypt(JSON.stringify({ptext}), 'secret key 123').toString();
        var ciphertext = encrypt(text,'secret key 123')
        var mailOptions = {
            from: 'cethostelmanagement@outlook.com', // sender address (who sends)
            to: `${user.EmailId}`, // list of receivers (who receives)
            subject: `SignUp Invitation`, // Subject line
            text: `Hi ${user.Name}`, // plaintext body
            html: `<b>Hi ${user.Name}</b> <br> <p>Inviting you to sign up</p><br>
                   <a href="http://localhost:3000/signup?cred=${ciphertext}">Click here</a>` // html body
        };
    
        // send mail with defined transport object
        await mailer.transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
    
            console.log('Message sent: ' + info.response);
            res.send("Success")
        });
        // ptext=getbatchId.rows[0].batchId
    });
    

}


module.exports={inmateList,
    viewCertificates,
    approveApplication,
    signUpInvite,
}