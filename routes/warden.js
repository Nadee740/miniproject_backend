const express=require('express')
const router=express.Router()
const warden=require('../controllers/warden')

//Hostel Registry
router.get('/hostelregistry',warden.hostelRegistry)

router.get('/gethostelapplications',warden.getHostelApplications)

router.get('/generateranklist',warden.generateRankList)

router.get('/getcertificateapplications',warden.getCertificateApplications)


module.exports=router;