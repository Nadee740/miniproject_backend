const express=require('express')
const router=express.Router()
const inmate=require('../controllers/inmate')
const {pool}=require('../db')

//Render certificate form
router.get('/formtemplate',inmate.renderFormTemplate)

//INMATE - HOSTEL ROUTES

//Hostel Out Form
router.post('/hostelout',inmate.applyHostelOut)

//Complaint Box
router.post('/complaintbox',inmate.submitComplaint)

//Room Change
router.post('/roomchange',inmate.submitRoomChange)

//INMATE - MESSROUTES

//View Messbill-dues
router.get('/viewmessbill', inmate.viewMessBill)

//View MessOut history
router.get('/messouthistory',inmate.viewMessOutHistory)

//Cancel messout
router.delete('/cancelmessout',inmate.cancelMessOut)

//View MessOut days
router.get('/messoutpredaysk',inmate.messoutpredaysk)
router.get('/messoutdays',inmate.messOutDays)
router.get('/maximum-messoutdays',inmate.maxMessOutDays)
router.get('/maximum-messoutdays-month',inmate.maxMessoutDaysinMonth)

router.get('/mess-requirements',inmate.getMessRequirements)
router.get('/mess-requirements-LH',inmate.getMessRequirementsLH)

//Apply for MessOut
router.post('/applymessout',inmate.applyMessOut)
router.post('/applymessin',inmate.applyMessin)
router.post('/editmessdata',inmate.editMessoutData)
router.post('/editprevmessoutdata',inmate.editPrevMessData)
router.post('/checkmessout',inmate.checkMessOut)
router.post('/cancelmessout',inmate.cancelMessOut);


//INMATE - CERTIFICATE ROUTES

//View Certificates
router.get('/viewcertificates',inmate.viewCertificates)

//Apply for a certificate
router.post('/applycertificate',inmate.applyCertificate)




//MESS SECRETARY
//Update MessOut Rule
router.put('/messoutpredaysk',async (req,res)=>{
    try{
        const {noofDays}=req.body
        const query=req.query.hostel==="MH"?"UPDATE messrequirements SET value=$1 WHERE key='messoutpredaysk'":"UPDATE messrequirementsLH SET value=$1 WHERE key='messoutpredaysk'"
        const messout=await pool.query(query,[noofDays])
        console.log(messout)
    }
    catch(e){
        console.error(e)
    }
})

router.put('/messoutdays',async (req,res)=>{
    try{
        const {noofDays}=req.body
        const query=req.query.hostel==="MH"?"UPDATE messrequirements SET value=$1 WHERE key='messoutdays'":"UPDATE messrequirementsLH SET value=$1 WHERE key='messoutdays'"
        const messout=await pool.query(query,[noofDays])
        console.log(messout)
    }
    catch(e){
        console.error(e)
    }
})
router.put('/messoutmaximumdays',async (req,res)=>{
    try{
        const {noofDays}=req.body
        const query=req.query.hostel==="MH"?"UPDATE messrequirements SET value=$1 WHERE key='messoutdaysmaximum' returning * ":"UPDATE messrequirementsLH SET value=$1 WHERE key='messoutdaysmaximum' returning * "
        const messout=await pool.query(query,[noofDays])
        res.json(messout)
    }
    catch(e){
        console.error(e)
    }
})
router.put('/messoutmaximumdays-month',async (req,res)=>{
    console.log(req.query.hostel)
    try{
        const {noofDays}=req.body
        const query=req.query.hostel==="MH"?"UPDATE messrequirements SET value=$1 WHERE key='messout_days_max_in_month' returning * ":"UPDATE messrequirementsLH SET value=$1 WHERE key='messout_days_max_in_month' returning * "
        const messout=await pool.query(query,[noofDays])
        res.json(messout)
    }
    catch(e){
        console.error(e)
    }
})

//View Messout Requests
router.get('/messoutrequests', inmate.messOutRequests)

//View Current Inmates (Also for Mess Director)
router.get('/viewmessinmates',inmate.currentMessInmates)

//MESS DIRECTOR
router.post('/uploadbill',inmate.uploadMessBill)







module.exports=router