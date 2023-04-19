const {pool}=require('../db')
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const hostelRegistry = async (req,res)=>{
    try{
        const query=await pool.query(`SELECT users.name,hostel_out.hostel_admission_no,batch.department,users.mobile_no,users.email,hostel_out.fromdate,hostel_out.todate,hostel_out.reason,hostel_blocks.hostel
        FROM users,inmate_table,hostel_out,batch,student,inmate_room,hostel_room,hostel_blocks WHERE hostel_out.hostel_admission_no=inmate_table.hostel_admission_no and inmate_table.admission_no=users.user_id and inmate_table.admission_no=student.admission_no and student.batchid=batch.batchid and hostel_out.hostel_admission_no=inmate_room.hostel_admission_no and inmate_room.room_id=hostel_room.room_id and hostel_room.block_id=hostel_blocks.block_id`)
        console.log('hyy',query.rows)
        res.json(query.rows)
    }
    catch(e){
        console.log(e)
    }

}

const getHostelApplications = async (req,res)=>{
    try{
        const query=await pool.query('SELECT * from hostel_application,users where hostel_application.user_id=users.user_id')
        console.log(query.rows,'hyy')
        res.json(query.rows)
    }
    catch(e){

    }
}

const generateRankList= async(req,res) =>{
    try{

        const headerquery=await pool.query(`SELECT * from allotment_columns order by column_letter`)
        const existingcolquery=await pool.query(`SELECT * from allotment_columns where column_type='existing'`)
        const colData=existingcolquery.rows.map(col=>col.columns)
        console.log(colData.join(','),'nenj')
        const queryText='SELECT '+ colData.join(',') + ',users.user_id from hostel_application, student_progress, users where hostel_application.user_id=users.user_id'
        const query=await pool.query(queryText);
        console.log(queryText,'nad')
        const worksheet = workbook.addWorksheet('RankList');
        worksheet.columns=[]
        var temp=[]
        headerquery.rows.forEach(element => {
            if(element.column_type==='existing'){
                temp.push({header:element.columns.split('.')[1],key:element.columns.split('.')[1]})
                //Existing column format : 'table.columnname'
            }
            else{
                temp.push({header:element.columns,key:element.columns})
                //Derived column format : 'columnname'
            }
        });
        temp.push({header:"user_id", key:"user_id"})
        temp.push({header:"rank", key:"rank"})
        
        worksheet.columns=[...temp]
        console.log(worksheet.columns,'hu')
        const noofrows=query.rows.length
        console.log(headerquery,'Hyeye')
        var rows=[]
        for(let i=0;i<noofrows;i++){
            var row=[]
            headerquery.rows.forEach(col=>{
                if(col.column_type==='existing')
                {
                    row.push(query.rows[i][col.columns.split('.')[1]])
                }
            })
            row.push(query.rows[i]['user_id'])
            // Object.keys(query.rows[i]).forEach(colHeader => {
            //     row.push(query.rows[i][colHeader])
            // });
            rows.push(row)
        }

        console.log(rows,'rowstest')
        worksheet.addRows(rows);
        worksheet.eachRow((row, rowNo)=>{
            console.log(rowNo)

            if(rowNo!=1)
            {
                headerquery.rows.forEach(col=>{
                    
                    if(col.column_type==='derived')    
                    {
                        var matchesArray=col.formula.match(/<.*?>/g)
    
                        console.log(matchesArray)
                        var formula=col.formula
    
                        matchesArray.forEach(pattern=>{
                            formula=formula.replace(pattern, (pattern.slice(1,-1)+""+rowNo))
                        })
    
                        console.log(formula)
                        
                        worksheet.getCell(col.column_letter+''+rowNo).value={formula:formula}

                    }
                })
            }
        })

        
        var sortedRows=[]
        worksheet.eachRow((row, rowNo)=>{
            console.log(rowNo)

            if(rowNo!=1)
            {
                var newRow=[]
                row.eachCell((cell, cellNo)=>{
                    console.log(cell.value,'value')
                    newRow.push(cell.value?cell.value:"")
                })
                
            sortedRows.push(newRow)
            }

        })

        
        console.log(sortedRows,'sce')
        const hostelRequirements=await pool.query('select rank_rule from hostel_requirements')
        console.log(hostelRequirements.rows[0].rank_rule,'rule')
        const colLetter=hostelRequirements.rows[0].rank_rule.split(':')[0]
        const order=hostelRequirements.rows[0].rank_rule.split(':')[2]

        sortedRows = sortedRows.sort(function(a, b) { 
            console.log(a,'endoo')
            if(order=='Asc')
                return a[colLetter.charPointAt(0)-65] - b[colLetter.charPointAt(0)-65]; 
            else
                return a[colLetter.charPointAt(0)-65] - b[colLetter.charPointAt(0)-65]; 
        });
        const sorted_worksheet = workbook.addWorksheet('RankList-Sorted-test');


        sorted_worksheet.columns=[...temp]
        sorted_worksheet.addRows(sortedRows)

        sorted_worksheet.eachRow(async (row, rowNo)=>{
            console.log(rowNo,row)
            if(rowNo!=1)
            {
                var newRow=[]
                const userId=row.getCell("user_id").value
                row.getCell("rank").value=rowNo-1
                
                const hostelRequirements=await pool.query(`INSERT INTO rank_list(user_id, rank, verified)
                values($1, $2, $3)`,[userId, rowNo-1, false])
            }

        })
        ///commented
         // const rankCol = worksheet.getColumn('rank');
        // rankCol.eachCell(async function(cell, rowNumber) {
        //     cell.value=rowNumber
        //     worksheet.getRow(rowNumber).getCell('rank').value={rowNumber}
        //     // const userId=worksheet.getRow(rowNumber).getCell("user_id").value
        //     // const hostelRequirements=await pool.query(`INSERT INTO rank_list(user_id, rank, verified)
        //     // values($1, $2, $3)`,[userId, rowNumber, false])

        // });

        workbook.removeWorksheet("RankList")
        console.log("running")
        await workbook.xlsx.writeFile("Ranklist.xlsx");

    }
    catch(e){
        console.log(e)
    }
}

const getCertificateApplications = async (req,res)=>{
    const certificates=await pool.query(`SELECT ST.admission_no,u.name as studentname,B.programme,C.name as certificatename,CA.application_id,CA.date,CA.status,CA.application_form,p.path FROM student as ST, certificate_application as CA, certificates as C, path as P, users as U,batch as B WHERE B.batchid=ST.batchid and ST.admission_no = CA.admission_no and CA.certificate_id=C.certificate_id and ST.admission_no=u.user_id and C.pathno=P.pathno`)
    console.log(certificates.rows)
    var requiredCertificates=[]
        for (var i=0;i<certificates.rows.length;i++)
        { 
            var myArray = certificates.rows[i].path.split("-");
            console.log(myArray)
            if(myArray[certificates.rows[i].status]=='WD'){
                requiredCertificates.push(certificates.rows[i])
            }
    }
    console.log(requiredCertificates)
    res.json(requiredCertificates)
}

module.exports={hostelRegistry,getHostelApplications,generateRankList,getCertificateApplications}