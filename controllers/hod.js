const {pool}=require('../db')

//Inmate Functions
const inmateList=(req,res)=>{

    pool.query(`SELECT * FROM Users u, STUDENT s, BATCH b, INMATE_TABLE it, INMATE_ROOM ir, HOSTEL_ROOM hr, HOSTEL_BLOCKS hb
                where s.BatchId=b.batchId and u.User_Id=s.Admission_No and s.Admission_No=it.Admission_No and
                it.Hostel_Admission_No=ir.Hostel_Admission_No and ir.Room_Id=hr.Room_Id and 
                hr.block_id=hb.block_id and hb.hostel=$1`, [req.query.hostel], (err, resp) => {
        // if (err) {
        //     throw err
        // }

        console.log('user:', resp.rows)

        res.send(resp.rows)
    })
}

const viewCertificates = async (req,res)=>{
    try{
        const user_id=req.query.user_id
        console.log(user_id)
        const certificates=await pool.query(`
        SELECT ST.admission_no,u.name as studentname,B.programme,C.name as certificatename,
        CA.application_id,CA.date,CA.status,CA.application_form,p.path 
        FROM student as ST, certificate_application as CA, 
        certificates as C, path as P, users as U,batch as B 
        WHERE B.batchid=ST.batchid and ST.admission_no = CA.admission_no and 
        CA.certificate_id=C.certificate_id and ST.admission_no=u.user_id and C.pathno=P.pathno
        and B.department in(select hod.department from roles_faculty,hod where roles_faculty.userid=$1 and roles_faculty.roleid=hod.roleid)`,[user_id])
        var requiredCertificates=[]
        for (var i=0;i<certificates.rows.length;i++)
        { 
            var myArray = certificates.rows[i].path.split("-");
            // console.log(myArray)
            if(myArray[certificates.rows[i].status]=='HOD'){
                requiredCertificates.push(certificates.rows[i])
            }
        }

        // console.log(requiredCertificates)
        console.log(requiredCertificates)
        // console.log(req.query)
        res.json(requiredCertificates)
    }
    catch(e){
        console.error(e)
    }
    
}

//staff advisor role adding
// const facultyList=(req,res)=>{

//     var rows=[]
//     pool.query(`select department from HOD h, roles_faculty rf, faculty f 
//                 where 
//                 f.pen_no=rf.user_id and
//                 rf.roleid=h.roleid and
//                 f.pen_no=$1`, [req.query.penNo], (err, resp)=>{
        
//         if(err)
//         {
//             console.log(err)
//         }

//         pool.query(`SELECT *  FROM Users u, FACULTY f, roles_faculty rf, staff_advisor s, batch b
//                     where 
//                     u.User_Id=f.PEN_NO and 
//                     f.pen_no=rf.user_id and 
//                     rf.roleid=staff_advisor.roleid and
//                     rf.batchid=batch.batchid
//                     and batch.department=$1`,[resp.rows[0].department], (err, resp1) => {
//             if (err) {
//                 console.log(err)
//                 throw err
//             }
//             console.log('user:', resp1.rows)
//             res.send(resp1.rows)
//         })
//     })
// }

const getHodDept=(req, res)=>{
    console.log(`select department from HOD h, roles_faculty rf, faculty f 
    where 
    f.pen_no=${req.query.hodPenNo} and
    f.pen_no=rf.userid and
    rf.roleid=h.roleid`)
    pool.query(`select department from HOD h, roles_faculty rf, faculty f 
                where 
                f.pen_no=$1 and
                f.pen_no=rf.userid and
                rf.roleid=h.roleid`, [req.query.hodPenNo], (err, resp)=>{
    
        if(err)
        {
            console.log(err)
        }

        console.log("dsad",resp.rows)
        res.send(resp.rows[0])
    })
}

const facultyList=(req,res)=>{

    var rows=[]
    pool.query(`SELECT *  FROM Users u, FACULTY f
                where u.User_Id=f.PEN_NO`, (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('user:', resp.rows)
        res.send(resp.rows)
    })
}

const getFacultyRoles=(req, res)=>{
    
    console.log(req.query)
    pool.query(`SELECT Role, rf.roleid FROM ROLES_FACULTY rf, staff_advisor s, batch b
        WHERE
        rf.UserId=$1 and
        rf.roleid=s.roleid and
        s.batchid=b.batchid and
        b.department=$2`, [req.query.advPenNo, req.query.dept], (err, resp1) => {
        if (err) {
        throw err
        }

        res.send(resp1.rows.map(item=>({
            role:item.role,
            roleid:item.roleid
        })))
    })
}

const postFacultyRole=(req,res)=>{
    console.log("here",req.body)
    try{

        pool.query(`INSERT INTO Roles_Faculty(UserId, Role)
                    Values ($1, 'SA') RETURNING *`, [req.body.penNo], (err, respRoles) => {
            if (err) {
                console.log("err1 : ",err)
            }
    
            pool.query(`SELECT * FROM BATCH 
                        WHERE 
                        batch_name=$1 and semester=$2 and course=$3 and department=$4
                        and programme=$5`, [req.body.batchName, req.body.sem, req.body.course, req.body.dept, req.body.program], (err, respGetBatch) => {
                if (err) {
                    console.log("err2 : ",err)
                }
    
                if(respGetBatch.rows.length==0)
                {
                    pool.query(`INSERT INTO BATCH(programme, department, course, year, semester, batch_name)
                                Values ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.body.program, req.body.dept, req.body.course, req.body.year, req.body.sem, req.body.batchName], (err, respBatch) => {
                        if (err) {
                            console.log("err2 : ",err)
                        }
    
                        pool.query(`INSERT INTO staff_advisor(roleid, batchid)
                                    Values ($1, $2) RETURNING *`, [respRoles.rows[0].roleid, respBatch.rows[0].batchid], (err, resp1) => {
                                if (err) {
                                    console.log("err2=3 : ",err)
                                }
    
                                res.send(resp1.data)
                            })
                        })
                }
                else
                {
                    pool.query(`INSERT INTO staff_advisor(roleid, batchid)
                            Values ($1, $2) RETURNING *`, [respRoles.rows[0].roleid, respGetBatch.rows[0].batchid], (err, resp) => {
                        if (err) {
                            console.log("err2=3 : ",err)
                        }
    
                        res.send({message : "success"})
                    })
                }
                                
            })
    
            res.setHeader('Content-Type', 'text/plain');
            res.send({message : "success"})
        })
    }catch(e){
        console.log(e)
    }
}

const removeFacultyRole=(req,res)=>{
    console.log("delete called at bacend", JSON.parse(req.query.role)["roleid"])
    pool.query(`DELETE FROM ROLES_FACULTY 
                WHERE UserID=$1 AND roleid=$2 returning *`, [req.query.penNo, JSON.parse(req.query.role)["roleid"]], (err, resp) => {
        if (err) {
          throw err
        }
        console.log('deleted:', resp.rows)

        res.setHeader('Content-Type', 'text/plain');
        res.send("success")
    })
}

module.exports={
    inmateList,
    viewCertificates,
    getHodDept,
    facultyList,
    getFacultyRoles,
    postFacultyRole,
    removeFacultyRole

}