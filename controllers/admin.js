const {pool}=require('../db')

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

const getInmateRoles=(req, res)=>{
    pool.query(`SELECT Role FROM INMATE_ROLE
                WHERE Hostel_Admission_No=$1`, [req.query.hostelAdmNo], (err, resp) => {
        if (err) {
            throw err
        }

        res.send(resp.rows.map(item=>item.role))
    })
}

const updateInmateRole=(req,res)=>{
    pool.query(`INSERT INTO INMATE_ROLE (Hostel_Admission_No, Role)
                Values ($1, $2)`, [req.body.hostelAdmNo, req.body.role], (err, resp) => {
        if (err) {
          throw err
        }
        console.log('user roles:', resp.rows)
    })
    console.log("req :", req.query)
    res.send('Admin is up!')
}

const removeInmateRole=(req,res)=>{
    pool.query(`DELETE FROM INMATE_ROLE 
                WHERE Hostel_Admission_No=$1 AND Role=$2 returning *`, [req.query.hostelAdmNo, req.query.role], (err, resp) => {
        if (err) {
          throw err
        }
        console.log('user:', resp.rows)
    })
    console.log("req deleted L ", req.query)
    res.send('Admin is up!')
}

//Non inmate functions
const nonInmateList=(req,res)=>{

    pool.query(`SELECT * FROM Users u, STUDENT s, BATCH b
                where s.batchId=b.batchId and u.User_Id=s.Admission_No and
                s.stage='noninmate'`, (err, resp) => {
        if (err) {
            throw err
        }

        console.log('user:', resp.rows)

        res.send(resp.rows)
    })
}

//Faculty functions
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
    pool.query(`SELECT Role FROM ROLES_FACULTY
                WHERE UserId=$1`, [req.query.penNo], (err, resp) => {
        if (err) {
            throw err
        }

        res.send(resp.rows.map(item=>item.role))
    })
}

const postFacultyRole=(req,res)=>{
    console.log("here",req.body)
    pool.query(`INSERT INTO Roles_Faculty(UserId, Role)
                Values ($1, $2) RETURNING *`, [req.body.penNo, req.body.role], (err, respRoles) => {
        if (err) {
            console.log("err1 : ",err)
        }

        // console.log(req)

        if(req.body.role=="SA") //staff advisor
        {

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
    
                                res.send({message : "Success"})
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

                        res.send({message : "Success"})
                    })
                }
                               
            })
        }
        else if(req.body.role=="HOD") //hod
        {
            console.log('hyy')
            pool.query(`INSERT INTO hod(roleid, department)
                    Values ($1, $2) RETURNING *`, [respRoles.rows[0].roleid, req.body.dept], (err, resp) => {
                if (err) {
                    console.log("err4 : ",err)
                }

                res.send({message : "Success"})
            })
        }
        else
        {
            res.send({message : "Success"})
        }

    })
}

const removeFacultyRole=(req,res)=>{
    console.log("delete called at bacend", req.query)
    pool.query(`DELETE FROM ROLES_FACULTY 
                WHERE UserID=$1 AND Role=$2 returning *`, [req.query.penNo, req.query.role], (err, resp) => {
        if (err) {
          throw err
        }
        console.log('deleted:', resp.rows)

        res.send({message : "success"})
    })
}

//Hostel Registry
const hostelRegistry=(req,res)=>{

    pool.query(`SELECT * FROM HOSTEL_OUT ho, INMATE_TABLE it, STUDENT s, BATCH b
                where ho.Hostel_Admission_No=it.Hostel_Admission_No and it.Admission_No=s.Admission_No
                and s.BatchId=b.BatchId`, [req.query.hostel], (err, res) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('user:', res.rows)

        res.send(res.rows)
    })
}

//Applications Paths
const getPathsData=(req,res)=>{

    pool.query(`SELECT * FROM PATH`, (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('user:', resp.rows)

        var responseData=[]
        
        var counter=0;
        resp.rows.forEach((item, index)=>{
            pool.query(`SELECT Name, Certificate_ID
                        FROM CERTIFICATES
                        WHERE PathNo=$1`, [item.pathno], (err, respCert) => {
                
                counter++;
                if (err) {
                    console.log(err)
                }
                else
                {
                    console.log("im here")
                    responseData.push({
                        start: item.start_user,
                        pathNo: item.pathno,
                        path: item.path,
                        certificates:respCert.rows.length>0?respCert.rows.map(item=>(
                            {
                                name:item.name,
                                certificateId:item.certificate_id
                            }
                        )):[]
                    })
                }

                if(counter==resp.rows.length)
                {
                    console.log(responseData)
                    res.send(responseData)
                }
            })
        })
    })
}

const postPath=(req,res)=>{

    pool.query(`INSERT INTO PATH (path, start_user)
                values($1, $2)
                RETURNING *`, [req.body.path, req.body.start], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('path inserted:', resp.rows)

        res.send(resp.rows)
    })
}

const deletePath=(req,res)=>{

    pool.query(`DELETE from path where PathNo=$1 RETURNING *`, [req.query.pathNo], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }

        console.log("req : ", req.query)
        res.send(resp.rows)
    })
}

const mapCertificate=(req,res)=>{

    pool.query(`UPDATE CERTIFICATES
                SET PathNo=$1
                WHERE Certificate_ID=$2 AND PathNo IS Null RETURNING *`, [req.body.pathNo, req.body.certificateId], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        
        pool.query(`SELECT Name, Certificate_ID
                    FROM CERTIFICATES
                    WHERE PathNo=$1`, [req.body.pathNo], (err, respCert) => {
            if (err) {
                console.log(err)
                throw err
            }

            //sending response
            res.send(respCert.rows.map(item=>(
                {
                    name:item.name,
                    certificateId:item.certificate_id
                }
            )))
        })
    })
}

const deleteMapping=(req,res)=>{

    pool.query(`UPDATE CERTIFICATES
                SET PathNo=null
                WHERE Certificate_Id=$1 RETURNING *`, [req.query.certificateId], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }

        if(resp.rows.length==0)
            res.send({message:"No rows are updated"})

        pool.query(`SELECT Name, Certificate_ID
                    FROM CERTIFICATES
                    WHERE PathNo=$1`, [req.query.pathNo], (err, respCert) => {
            if (err) {
                console.log(err)
                throw err
            }

            //sending response
            res.send(respCert.rows.map(item=>(
                {
                    name:item.name,
                    certificateId:item.certificate_id
                }
            )))
        })
    })
}

//Create/Edit application
const getCertificates=(req,res)=>{

    pool.query(`SELECT * FROM CERTIFICATES`, (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }

        res.send(resp.rows)
    })
}

const createApplication=(req,res)=>{

    pool.query(`INSERT INTO CERTIFICATES(Name, Application_template)
                VALUES ($1, $2) 
                RETURNING *`, [req.body.certificateName, req.body.certificateTemplate], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }

        res.send(resp.rows)
    })
}

const deleteApplication=(req,res)=>{

    pool.query(`DELETE FROM CERTIFICATES
                WHERE Certificate_ID=$1
                RETURNING *`, [req.query.certificateId], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('certificate deleted : ',req.query,resp.rows)

        res.send(resp.rows)
    })
}

const updateApplication=(req,res)=>{
    
    console.log( "body : ",req.body)
    pool.query(`UPDATE CERTIFICATES
                SET application_template=$1
                WHERE Certificate_ID=$2
                RETURNING *`, [req.body.certificateTemplate, req.body.certificateId], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('certificate updated : ', resp.rows)

        res.send(resp.rows)
    })
}

const getTableAndCols=(req,res)=>{
    console.log( "body : ",req.query)

    pool.query(`SELECT template_text, application_template
                FROM CERTIFICATES c
                WHERE c.certificate_id=$1`, [req.query.certificateId], (err, resp) => {
        if (err) {
            console.log(err)
        }
        console.log('path details : ', resp.rows)

        var certificateData=resp.rows[0]

        var columnsData=[] //to store the column names
        var tables=[] //to store the table names

        pool.query(`SELECT column_name FROM information_schema.columns
                    WHERE TABLE_NAME = 'users';`, (err, resp) => {
            if (err) {
                console.log(err)
            }

            tables.push('users') 
            columnsData=resp.rows.filter(item=>(item.column_name!='is_admin'&&item.column_name!='password'))

            columnsData=columnsData.map(item=>'users.'+item.column_name)

            pool.query(`SELECT column_name FROM information_schema.columns
                        WHERE TABLE_NAME = 'student'`, async (err, resp) =>{
                if (err) {
                    console.log(err)
                    throw err
                }

                tables.push('student')
                columnsData=[...columnsData, ...resp.rows.map(item=>'student.'+item.column_name)]


                var inmateData=await pool.query(`SELECT column_name 
                                                FROM information_schema.columns
                                                WHERE TABLE_NAME = 'inmate_table'`)
                
                tables.push('inmate_table')
                var tempArray=inmateData.rows.filter(item=>item.column_name!='admission_no') 
                columnsData=[...columnsData, ...tempArray.map(item=>'inmate_table.'+item.column_name)]

                //hostel data
                var hostelData=await pool.query(`SELECT column_name 
                                                FROM information_schema.columns
                                                WHERE TABLE_NAME = 'hostel_blocks'`)

                tables.push('hostel_blocks')
                tempArray=hostelData.rows.filter(item=>(item.column_name!='block_id')) 
                columnsData=[...columnsData, ...tempArray.map(item=>'hostel_blocks.'+item.column_name)]

                //certificate template columns
                var tempJson=JSON.parse(certificateData.application_template)

                tables.push('certificate_application')
                console.log("tempJSON : ",Object.keys(tempJson))
                
                columnsData=[...columnsData, ...Object.keys(tempJson).map(key=>("json.certificate_application.application_form."+key))]
                //since certificate template field and its value are stored as a json string in the certificate_application,
                //the key will be stored in the template_text as json.certificate_application.application_from.key

                res.send({
                    "templateText":certificateData.template_text,
                    "tables":tables,
                    "columnsData":columnsData
                })
                
            })


        })

    })
}

const updateCertificateTemplateText=(req, res)=>{
    console.log( "body : ",req.body)
    pool.query(`UPDATE CERTIFICATES
                SET template_text=$1
                WHERE Certificate_ID=$2
                RETURNING *`, [req.body.templateText, req.body.certificateId], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log('certificate updated : ', resp.rows)

        res.send(resp.rows)
    })
}

//Hostel Blocks
const getBlocks=(req,res)=>{ //this function will be reused for seatMatrix also

    pool.query(`SELECT MIN(Room_No) as rangeFrom, MAX(Room_No) as rangeTo, block_name, hb.block_id, floor_no
                FROM HOSTEL_ROOM hr right join HOSTEL_BLOCKS hb
                ON hr.block_id=hb.block_id 
                WHERE hb.Hostel=$1
                GROUP BY hb.block_id, block_name, floor_no`, [req.query.hostel], (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }

        console.log(resp.rows)

        res.send(resp.rows)
    })
}

const addBlock=(req,res)=>{

    pool.query(`INSERT INTO HOSTEL_BLOCKS(hostel, block_name)
                VALUES($1, $2)
                RETURNING *`, [req.body.hostel, req.body.blockName], (err, resp) => {
        if (err) {
            console.log(err)

            console.log(req.body)
        }

        res.send(resp.rows)
    })
}

const addFloor=async (req,res)=>{

    for(var room=req.body.rangeFrom; room<=req.body.rangeTo;room++)
    {
        try
        {
            var roomEntered = await pool.query(`INSERT INTO HOSTEL_ROOM(room_no, current_inmates, floor_no, block_id)
                        VALUES($1,0,$2,$3)
                        RETURNING *`, [room, req.body.floorNo, req.body.blockId])
            console.log(roomEntered.rows)
        }
        catch(e)
        {
            console.log(e)
        }
    }

    pool.query(`SELECT MIN(Room_No) as rangeFrom, MAX(Room_No) as rangeTo, floor_no
                FROM HOSTEL_ROOM hr
                WHERE block_id=$1 and floor_no=$2
                GROUP BY floor_no`,[req.body.blockId, req.body.floorNo], (err, resp)=>{
                    console.log(resp.rows)

                    res.send(resp.rows[0])
                })

    console.log("finished")
}

const deleteBlock=(req,res)=>{

    pool.query(`DELETE FROM HOSTEL_BLOCKS
                WHERE block_id=$1 RETURNING *`, [req.query.blockId], (err, resp) => {
        if (err) {
            console.log(err)

            console.log(req.body)
        }

        console.log("here ",resp.rows)
        res.send(resp.rows)
    })
}

const applyHostelOut = async(req,res)=>{
    try{
        const {user_id,fromDate,toDate,reason}=req.body
        const getadmno=await pool.query("SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",[user_id])
        const hostel_admno=getadmno.rows[0].hostel_admission_no
        const hostelout=await pool.query('INSERT INTO hostel_out(hostel_admission_no,fromdate,todate,reason) VALUES($1,$2,$3,$4)',[hostel_admno,fromDate,toDate,reason])
        res.json(hostelout)
    }
    catch(e){
        console.error(e)
    }
}

//seat matrix
const updateSeatMatrix=(req,res)=>{
    
    console.log( "body : ",req.body)

    var count=0;
    for(var index in req.body.roomData)
    {
            var room=req.body.roomData[index]

            // console.log(`UPDATE HOSTEL_ROOM
            // SET user_type=${room.userType}, maximum_inmates=${room.maximumInmates}
            // WHERE room_no=${room.roomNo} and floor_no=${req.body.floorNo}
            // and block_id=${req.body.blockId}
            // RETURNING *`)
            // console.log(room)
            pool.query(`UPDATE HOSTEL_ROOM
                        SET user_type=$1, maximum_inmates=$2
                        WHERE room_no=${room.roomNo} and floor_no=${req.body.floorNo}
                        and block_id=${req.body.blockId}
                        RETURNING *`, [room.userType, room.maximumInmates], (err, resp) => {
                if (err) {
                    console.log(err)
                }
                
                console.log(resp.rows)
                count++
                console.log(count," - ",req.body.roomData.length)
                if(count==req.body.roomData.length)
                {
                    console.log("updated")
                    res.send({message : "Updated"})
                }
            })

    }
}

const getRoomsInfo=(req, res)=>{
    pool.query(`SELECT * FROM HOSTEL_ROOM
                WHERE block_id=$1 and floor_no=$2 order by room_no`, [req.query.blockId, req.query.floorNo], (err, resp) => {
        if (err) {
            console.log(err)
        }
        
        console.log(resp.rows)
        res.send(resp.rows)
    })
}

//allotment rules
const updateHostelAllotmentOpen=(req,res)=>{
    pool.query(`UPDATE hostel_requirements SET hostel_allotment_open=$1 RETURNING *`,[req.body.open],(err,resp)=>{
        console.log(resp.rows[0])
        res.send(resp.rows[0])
    })
}

const getHostelApplicationCols=(req,res)=>{
    
    pool.query(`SELECT column_name FROM information_schema.columns
                        WHERE TABLE_NAME = 'hostel_application'`, async (err, resp) =>{
        if (err) {
            console.log(err)
            throw err
        }

        var columnsData=[...resp.rows.map(item=>'hostel_application'+'.'+item.column_name)]

        pool.query(`SELECT column_name FROM information_schema.columns
                    WHERE TABLE_NAME = 'student_progress' and column_name!='admission_no'`, async (err, resp) =>{
            if (err) {
            console.log(err)
            throw err
            }

            columnsData=[...columnsData, ...resp.rows.map(item=>'student_progress'+'.'+item.column_name)]

            // console.log(columnsData)

            res.send(columnsData)

        })
        
    })
}

const getAllotmentColumns=(req, res)=>{
    console.log("called")
    pool.query('SELECT * FROM allotment_columns order by column_letter', (err, resp) => {
        if (err) {
            console.log(err)
            throw err
        }

        const data=[...resp.rows]

        res.send({
            columnData:data.map(col=>({
                            columnType: col.column_type,
                            columnName: col.columns,
                            columnLetter: col.column_letter,
                            formula: col.formula,
                        }))
        })

    })
}

const getHostelRequirements=(req,res)=>{
    pool.query('SELECT * FROM hostel_requirements',(err, resp1)=>{ 
       if(resp1.rowCount>0){
        const rankRule=resp1.rows[0].rank_rule
        const allotmentOpen=resp1.rows[0].hostel_allotment_open

        res.send({
            rankRule: rankRule,
            allotmentOpen:allotmentOpen
        })
       }
     
    })
}

const updateRule=async(req,res)=>{

    console.log(req.body,req.body.rankRuleData,'check')
    try{
        pool.query('DELETE from allotment_columns RETURNING *').then((err1, resp)=>{

            if(err1){
                console.log(err1)
            }

            var count=0;

            console.log("req.body : ",req.body.columnsData)
            req.body.columnsData.forEach(async (colData)=>{
    
                pool.query(`INSERT INTO allotment_columns (column_type,columns, column_letter, formula)
                VALUES ($1,$2,$3,$4)
                RETURNING *`, [colData.columnType, colData.columnName,colData.columnLetter,colData.formula],(err, resp)=>{

                    if(err)
                    {
                        console.log(err)
                    }

                    
                    count++;
                    console.log(count)
                    if(count==req.body.columnsData.length)
                    {
                        pool.query(`UPDATE hostel_requirements SET rank_rule=$1`,[req.body.rankRuleData],(err,resp)=>{
                            res.send({message : "success"})
                        })
                    }
                })
    
            })
        })
    }catch(err){
        console.log(err)
    }

}

module.exports={
    //inmate
    inmateList, 
    getInmateRoles,
    updateInmateRole, 
    removeInmateRole,

    //noninmate
    nonInmateList,

    //faculty
    facultyList, 
    getFacultyRoles,
    postFacultyRole,
    removeFacultyRole,

    //hostel registry
    hostelRegistry,

    //application paths
    getPathsData,
    postPath,
    deletePath,
    mapCertificate,
    deleteMapping,

    //create/edit application
    getCertificates,
    createApplication,
    deleteApplication,
    updateApplication,
    getTableAndCols,
    updateCertificateTemplateText,

    //hostel blocks
    getBlocks,
    addBlock,
    addFloor,
    deleteBlock,

    //seatMatrix
    updateSeatMatrix,
    getRoomsInfo,

    //allotment rules
    updateHostelAllotmentOpen,
    getHostelApplicationCols,
    getAllotmentColumns,
    getHostelRequirements,
    updateRule
}