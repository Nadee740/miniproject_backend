const express=require('express')
const router=express.Router()
const notification=require('../controllers/notification')
const {pool}=require('../db')

router.post('/sendnotification',notification.notifyEmail)

module.exports=router