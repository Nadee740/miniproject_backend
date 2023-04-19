const {pool} = require('../db')
const notification=require('../controllers/notification')
const dateConverter = (inputdate)=>{
        const date=new Date(inputdate);
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        let year = date.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return [year, month, day].join('-');
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

const submitComplaint = async (req,res)=>{
    try{
        const {user_id,complaint}=req.body
        const complaints=await pool.query("INSERT INTO complaints(user_id,complaint) VALUES($1,$2)",[user_id,complaint])
        res.json(complaints)
    }
    catch(e){
        console.error(e)
    }
}

const submitRoomChange = async(req,res)=>{
    try{
        const {user_id,preferredRoom,changeReason}=req.body
        const getadmno=await pool.query("SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",[user_id])
        const hostel_admno=getadmno.rows[0].hostel_admission_no
        const currentroom=await pool.query(`select inmate_room.room_id from inmate_room where hostel_admission_no=$1`,[hostel_admno])
        const croom=currentroom.rows[0].room_id
        const roomchangereq=await pool.query("INSERT INTO room_request values($1,$2,$3,FALSE) returning *",[hostel_admno,preferredRoom,changeReason])    
        res.json(roomchangereq)
    }
    catch(e){
        console.error(e)
    }
}

const viewMessOutHistory = async (req,res)=>{
    try{
        const user_id=req.query.user_id
        const messouts=await pool.query("SELECT * FROM messout WHERE hostel_admission_no=(SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1)",[user_id])
        res.json(messouts)
    }
    catch (e){
        console.error(e)
    }
}

const messOutDays = async (req,res)=>{
    try{
        const days=await pool.query("SELECT value FROM messrequirements WHERE key='messoutdays'")
        res.json(days.rows)
    }
    catch (e){
        console.error(e)
    }
}

const renderFormTemplate = async (req,res)=>{
    try{
        const type=req.query.user_type
        var usertype=""
        switch(type) {
            case "inmate":
              usertype="IN"
              break;
            case "noninmate":
              usertype="NIN"
              break;
          }
        const query=await pool.query("SELECT * FROM certificates,path where certificates.pathno=path.pathno AND (path.start_user=$1 or path.start_user='S')",[usertype])
        res.json(query.rows)
    }
    catch (e){
        console.error(e)
    }
}

const applyCertificate = async(req,res)=>{
    try{
        const {user_id,certificate_id}=req.body
        delete req.body.user_id
        delete req.body.certificate_id
        const applicationform=JSON.stringify(req.body)
        // const getadmno=await pool.query("SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",[user_id])
        // const hostel_admno=getadmno.rows[0].hostel_admission_no
        const date=new Date()
        const getPath=await pool.query(`select path from path p,certificates c 
        where p.pathno=c.pathno and c.certificate_id=${certificate_id}`)
        console.log(getPath)
        var approved=false
        if(getPath.rows[0].path==null){
            approved=true
        }
        const query=await pool.query("INSERT INTO certificate_application(admission_no,certificate_id,date,approved,rejected,status,application_form) VALUES($1,$2,$3,$4,FALSE,0,$5) RETURNING *",[user_id,certificate_id,date,approved,applicationform])
        console.log(query)

        notification.notifyEmail(query.rows[0].admission_no,query.rows[0].certificate_id,query.rows[0].status,getPath.rows[0].path);
        res.send("success")
    }
    catch(e){
        console.error(e)
    }
}

const viewCertificates = async (req,res)=>{
    try{
        const user_id=req.query.user_id
        const certificates=await pool.query('SELECT CA.application_id,CA.certificate_id,CA.date,C.name,CA.approved,CA.rejected,CA.status,CA.feedback,CA.application_form,p.path FROM certificate_application as CA,certificates as C,path as P WHERE admission_no=$1 AND CA.certificate_id=C.certificate_id and C.pathno=P.pathno',[user_id])
        console.log(certificates.rows)
        res.json(certificates.rows)
    }
    catch(e){
        console.error(e)
    }  
}

const applyMessOut = async (req,res)=>{
    try{
        const {user_id,fromDate,toDate} = req.body
        console.log(req.body)
        const getadmno=await pool.query("SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",[user_id])
        const hostel_admno=getadmno.rows[0].hostel_admission_no
        const messout=await pool.query("INSERT INTO messout VALUES($1,$2,$3) RETURNING *",[hostel_admno,fromDate,toDate])
        console.log(messout)
        // res.json(messout.rows[0])
        res.json(messout)
    }
    catch(e){
        console.log(e)
        
    } 
}

const viewMessBill = async(req,res)=>{
    try{
        const query=await pool.query(`select * from messbill where hostel_admission_no=(select hostel_admission_no from inmate_table where admission_no=$1)`,[req.query.user_id])
        res.json(query.rows)
    }
    catch(e){
        console.log(e)
    }
}

const messOutRequests = async (req,res) =>{
    try{
        const requests=await pool.query(`SELECT mo.hostel_admission_no,mo.fromdate,mo.todate,u.name from messout as mo,inmate_table as it,inmate_room as ir,hostel_room as hr,hostel_blocks as hb,users as u
        WHERE mo.hostel_admission_no=it.hostel_admission_no AND it.admission_no = u.user_id AND it.hostel_admission_no=ir.hostel_admission_no AND ir.room_id=hr.room_id
        AND hr.block_id=hb.block_id AND hb.hostel='MH'`)
        console.log(requests)
        res.json(requests)
    }
    catch(e){
        console.log(e)
    } 
}

const currentMessInmates = async (req,res) =>{
    try{
        const date=new Date();
        let month = (date.getMonth() + 1).toString();
        let day = date.getDate().toString();
        let year = date.getFullYear();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        const inputdate=[year, month, day].join('-');
        // const query=await pool.query(`SELECT users.name,inmate_table.hostel_admission_no,hostel_room.room_no,hostel_blocks.block_name 
        // from messout,inmate_table,users,inmate_room,hostel_room,hostel_blocks 
        // where $1 between messout.fromdate and messout.todate 
        // and inmate_table.hostel_admission_no != messout.hostel_admission_no 
        // and inmate_table.admission_no = users.user_id 
        // and inmate_table.hostel_admission_no = inmate_room.hostel_admission_no 
        // and inmate_room.room_id = hostel_room.room_id 
        // and hostel_room.block_id = hostel_blocks.block_id`,[inputdate])
        const query=await pool.query(`SELECT users.name,inmate_table.hostel_admission_no, hostel_room.room_no,hostel_blocks.block_name
        FROM inmate_table,users,inmate_room,hostel_room,hostel_blocks
        WHERE inmate_table.hostel_admission_no NOT IN(SELECT messout.hostel_admission_no from messout where $1 between messout.fromdate and messout.todate)
        and inmate_table.admission_no = users.user_id 
        and inmate_table.hostel_admission_no = inmate_room.hostel_admission_no 
        and inmate_room.room_id = hostel_room.room_id 
        and hostel_room.block_id = hostel_blocks.block_id
        and hostel_blocks.hostel='MH'`,[inputdate])
        console.log(query.rows)
        res.send(query.rows)
    }
    catch(e){
        console.log(e)
    } 
}

const uploadMessBill = async (req,res) =>{
    try{
        console.log(req.body)
        req.body.jsonData.map(async item=>{
            const query= await pool.query("INSERT INTO messbill(hostel_admission_no,month,attendance,mess_charge,extras,feast,lf,af,total,dues) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[item.Hostel_Admission_No,req.body.date.toString(),item.Attendance,item.Mess_Charge,item.Extras,item.Feast,item.LF,item.AF,item.Total,item.Dues])
            console.log(query)
            res.send("Success")
        })
        
    }
    catch(e){
        console.log(e)
    } 
}

const cancelMessOut = async(req,res)=>{
    try{
        const {user_id,fromdate,todate}=req.query
        const fdate=dateConverter(fromdate)
        const tdate=dateConverter(todate)
        const query = await pool.query('DELETE FROM messout WHERE hostel_admission_no=(SELECT hostel_admission_no from inmate_table where admission_no=$1) and fromdate=$2 and todate=$3 returning *',[user_id,fdate,tdate])
        console.log(query)
        res.json(query.rows)
    }
    catch(e){
        console.log(e)
    }
}

module.exports={
    applyHostelOut,
    submitComplaint,
    submitRoomChange,
    viewMessOutHistory,
    messOutDays,
    renderFormTemplate,
    applyCertificate,
    viewCertificates,
    applyMessOut,
    messOutRequests,
    currentMessInmates,
    uploadMessBill,
    cancelMessOut,
    viewMessBill
}
