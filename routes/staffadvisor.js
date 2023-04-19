const express=require('express')
const router=express.Router()

const staffadvisor=require('../controllers/staffadvisor')


router.get('/inmates', staffadvisor.inmateList)
 

//StaffAdvisor - view CERTIFICATE ROUTES

//View Certificates
router.get('/viewcertificates', staffadvisor.viewCertificates)
router.post('/approveapplication', staffadvisor.approveApplication)

//SignUp Invite
router.post('/signupinvite', staffadvisor.signUpInvite)
module.exports=router