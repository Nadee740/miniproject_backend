const express=require('express')
const router=express.Router()
const warden=require('../controllers/warden')

//Hostel Registry
router.get("/get-supplier-list",warden.getSuplierList)

router.post("/add-expense",warden.addPerDayExpenses)

router.get("/get-mess-expense",warden.getExpenseList)

router.post("/update-expense-status",warden.updateExpenseList);

router.get("/get-expense-info",warden.getExpenseInfo)

router.post("/update-expense-info",warden.updateExpense)

router.get('/hostelregistry',warden.hostelRegistry)

router.get('/gethostelapplications',warden.getHostelApplications)

router.get('/get-mess-attendance',warden.getMessAttendance)

router.get('/generateranklist',warden.generateRankList)

router.get('/getcertificateapplications',warden.getCertificateApplications)


module.exports=router;