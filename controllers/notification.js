const mailer=require('./mailer')
const {pool}=require('../db')
const notifyEmail = async (admissionNo,certificateId,status,path)=>{
    console.log("called",admissionNo, certificateId, status, path)
    var patharray=path.split("-")
    console.log(patharray)
    var recipientemail="";
    var recipientname="";
    const student=await pool.query(`select users.name from users where users.user_id=$1`,[admissionNo])
    var studentname=student.rows[0].name
    const getCertificate=await pool.query(`select name from certificates where certificate_id=$1`,[certificateId])
    var certificateName=getCertificate.rows[0].name

    console.log(status)
    if(patharray[status]==="SA"){
        const getEmail = await pool.query(`select u.email,u.name from users u,roles_faculty r,staff_advisor s,batch b
        where b.batchid=s.batchid and s.roleid=r.roleid and r.userid=u.user_id and b.batchid 
        in(select batchid from student where admission_no=$1)`,[admissionNo])
        console.log(getEmail.rows,admissionNo)
        recipientemail=getEmail.rows[0]?.email
        recipientname=getEmail.rows[0]?.name
    }
    if(patharray[status]==="HOD"){
        const getEmail = await pool.query(`select u.email,u.name from users u,roles_faculty r,student s,hod h,batch b
        where h.department=b.department and h.roleid=r.roleid and r.userid=u.user_id and b.batchid 
        in(select batchid from student where admission_no=$1)`,[admissionNo])
        console.log("email : ",getEmail.rows)
        recipientemail=getEmail.rows[0].email
        recipientname=getEmail.rows[0].name
    }

    var mailOptions = {
        from: 'cethostelmanagement@outlook.com', // sender address (who sends)
        to: `${recipientemail}`, // list of receivers (who receives)
        subject: `${studentname} - ${certificateName} Application`, // Subject line
        text: `Hi ${recipientname}`, // plaintext body
        html: `<b>Hi ${recipientname}</b> <br> <p><span style="text-transform:capitalize">${studentname}</span> has applied for ${certificateName} which needs approval.</p><br>
               <a href="http://localhost:3000/}">Click here to login</a>` // html body
    };

    // send mail with defined transport object
    mailer.transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }

        console.log('Message sent: ' + info.response);
        
    });
}

module.exports={notifyEmail}