const express=require('express')
const router=express.Router()
const {pool}=require('../db')

const admin=require('../controllers/admin')

//inmate
router.get('/inmates', admin.inmateList)
router.get('/inmates/getRoles', admin.getInmateRoles)
router.post('/inmates/updateRole', admin.updateInmateRole)
router.get('/inmates/removeRole', admin.removeInmateRole)

//non inmate
router.get('/noninmates', admin.nonInmateList)

//faculty
router.get('/faculties', admin.facultyList)
router.get('/faculty/getRoles', admin.getFacultyRoles)
router.post('/faculty/postRole', admin.postFacultyRole)
router.get('/faculty/removeRole', admin.removeFacultyRole)

//application paths
router.get('/getPathsData', admin.getPathsData)
router.post('/postPath', admin.postPath)
router.get('/deletePath', admin.deletePath)
router.post('/mapCertificate', admin.mapCertificate)
router.get('/deleteMapping', admin.deleteMapping)

//create/edit application
router.get('/getCertificates', admin.getCertificates)
router.post('/createApplication', admin.createApplication)
router.get('/deleteApplication', admin.deleteApplication)
router.post('/updateApplication', admin.updateApplication)
router.get('/getTableAndCols', admin.getTableAndCols)
router.post('/updateCertificateTemplateText', admin.updateCertificateTemplateText)

//hostel blocks
router.get('/getBlocks', admin.getBlocks)
router.post('/addBlock', admin.addBlock)
router.post('/addFloor', admin.addFloor)
router.get('/deleteBlock', admin.deleteBlock)

//Seat Matrix
router.post('/updateSeatMatrix', admin.updateSeatMatrix)
router.get('/getRoomsInfo', admin.getRoomsInfo)

//Allotment Rules
router.get('/getHostelCols', admin.getHostelApplicationCols)
router.get('/getAllotmentColumns', admin.getAllotmentColumns)
router.post('/updateRule', admin.updateRule)
router.post('/updateHostelAllotmentOpen', admin.updateHostelAllotmentOpen)
router.get('/getHostelRequirements', admin.getHostelRequirements)

module.exports=router
