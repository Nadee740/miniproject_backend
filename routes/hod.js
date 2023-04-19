const express=require('express')
const router=express.Router()
const {pool}=require('../db')

const hod=require('../controllers/hod')


router.get('/inmates', hod.inmateList)
 

//HOD - view CERTIFICATE ROUTES

//View Certificates
router.get('/viewcertificates', hod.viewCertificates)

//faculty
router.get('/getHodDept',hod.getHodDept)
router.get('/faculties', hod.facultyList)
router.get('/faculty/getRoles', hod.getFacultyRoles)
router.post('/faculty/postRole', hod.postFacultyRole)
router.get('/faculty/removeRole', hod.removeFacultyRole)
module.exports=router