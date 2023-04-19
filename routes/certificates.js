const express=require('express')
const router=express.Router()
const certificates=require('../controllers/certificates')
const {pool}=require('../db')

router.get('/download',certificates.downloadCertificate)

module.exports=router;