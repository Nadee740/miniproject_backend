const express=require('express')
const router=express.Router()
const {pool}=require('../db')
router.get('/',(req,res) =>{
    res.status(200).send('Student here')
})

router.post('/hostelapplication',async (req,res)=>{
    console.log(req.body)
    const query=await pool.query(`INSERT INTO hostel_application(user_id,dob,religion,caste,category,
        admission_criteria,parent_name,parent_number,parent_address,local_guardian_name,local_guardian_number,local_guardian_address,
        annual_income,bpl,present_address,
        eligible_for_concession,university_cgpa,rank) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) returning *`,[req.body.user_id,req.body.dob,req.body.religion,
        req.body.caste,req.body.category,req.body.admission_criteria,req.body.parent_name,req.body.parent_number,req.body.parent_address
        ,req.body.local_guardian_name,req.body.local_guardian_number,req.body.local_guardian_address,req.body.annual_income
        ,req.body.bpl,req.body.parent_address,req.body.eligible_for_concession,req.body.cgpa,req.body.rank])
        console.log(query)
    const semmarks=[]
    // const marksquery= await pool.query(`INSERT into student_progress(admission_no,semester,university_marks) values($1,$2,$3)`,[req.body.user_id,req.body.semester,req.body.grade])
})

router.post('/noninmate',async (req,res)=>{
    try{
        
    }
    catch(e){
        console.error(e)
    }
})

router.get('/checkapplied',async (req,res)=>{
    try{
        const query=(`select userid from hostel_application where userid=$1`[req.query.userid])
        console.log(query)
    }
    catch(e){
        console.log(e)
    }
})

module.exports=router