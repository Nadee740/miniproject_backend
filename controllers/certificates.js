const {pool}=require('../db')

const downloadCertificate = async (req,res)=>{

        console.log("Helloo")
        try{
            
            const query=await pool.query(`select template_text from certificates where certificate_id=${req.query.certificate_id}`)
            console.log(query.rows[0])
            var matchesArray=query.rows[0].template_text.match(/<<.*?>>/g)
    
            console.log(matchesArray)
    
            const nonJsonCols=matchesArray.map(item=>item.slice(2,-2)).filter(item=>item.split('.')[0]!="json")
            const jsonCols=matchesArray.map(item=>item.slice(2,-2)).filter(item=>item.split('.')[0]=="json")
            // const details=await pool.query(`select users.name from certificate_application,users
            // where certificate_application.application_id=${req.query.application_id} and certificate_application.admission_no=users.user_id`)
            // console.log(details.rows)
            const admNo=req.query.admission_no
            const applicationId=req.query.application_id

            var studentData=await pool.query(`SELECT ${nonJsonCols.filter(item=>item.split('.')[0]=="users"||item.split('.')[0]=="student").join(',')} FROM
            users, student
            where 
            users.user_id=student.admission_no and
            student.admission_no=$1`,[admNo])

            
            var inmateData=await pool.query(`SELECT ${nonJsonCols.filter(item=>item.split('.')[0]!="users"&&item.split('.')[0]!="student").join(',')} FROM
            users, student, inmate_table, inmate_room, hostel_room, hostel_blocks
            where 
            users.user_id=student.admission_no and
            student.admission_no=inmate_table.admission_no and
            inmate_table.hostel_admission_no=inmate_room.hostel_admission_no and
            inmate_room.room_id=hostel_room.room_id and
            hostel_room.block_id=hostel_blocks.block_id and
            student.admission_no=$1`,[admNo])  

            var applicationForm=await pool.query(`SELECT application_form from certificate_application
            WHERE application_id=$1`,[applicationId])

            var applicationFormObject=JSON.parse(applicationForm.rows[0].application_form)

            var keyValues={...studentData.rows[0], ...inmateData.rows[0],...applicationFormObject}
            console.log(keyValues)

            var certificateContent=query.rows[0].template_text
            matchesArray.forEach(pattern=>{
                console.log(pattern, keyValues[pattern.slice(2,-2).split('.').slice(-1)])
                certificateContent=certificateContent.replace(pattern, keyValues[pattern.slice(2,-2).split('.').slice(-1)])
            })

            console.log(certificateContent)

            res.send({certificateContent:certificateContent})
        }catch(e){
            console.log(e)
        }
   
}

module.exports={downloadCertificate}