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
router.get('/messoutdays',inmate.messOutDays)

//Apply for MessOut
router.post('/applymessout',inmate.applyMessOut)


//INMATE - CERTIFICATE ROUTES

//View Certificates
router.get('/viewcertificates',inmate.viewCertificates)

//Apply for a certificate
router.post('/applycertificate',inmate.applyCertificate)




//MESS SECRETARY
//Update MessOut Rule
router.put('/messoutdays',async (req,res)=>{
    try{
        const {noofDays}=req.body
        const messout=await pool.query("UPDATE messrequirements SET value=$1 WHERE key='messoutdays'",[noofDays])
        console.log(messout)
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