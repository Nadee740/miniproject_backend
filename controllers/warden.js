const { pool } = require("../db");
const ExcelJS = require("exceljs");
const workbook = new ExcelJS.Workbook();
//insert into perdaymessexpenses(bill_date,bill_no,particulars,supplier_id,bill_amount,hostel) values('2020-10-20',2,array['aa','a'],'2',290,'MH');
//create table supplier_list(supplier_id int,name varchar(20));
//create table perdaymessexpenses (id serial primary key,bill_date date,bill_no bigint,particulars varchar(50)[],supplier_id varchar(20),bill_amount float,hostel varchar(20),status int default 0,FOREIGN KEY(supplier_id) REFERENCES supplier_list(supplier_id) ON DELETE CASCADE ON UPDATE CASCADE);
const getSuplierList = async (req, res) => {
  try {
    const data = await pool.query("select * from supplier_list");
    res.send({
      status: "ok",
      msg: "succesfully obained data",
      data: data.rows,
    });
  } catch (err) {
    res.send({
      status: "failed",
      msg: err.message,
    });
  }
};

const addPerDayExpenses = async (req, res) => {
  try {
    const {
      bill_date,
      bill_number,
      particulars,
      supplier,
      bill_amount,
      hostel,
    } = req.body;
    console.log(req.body);
    if (!supplier.supplier_id) {
      const insertSupplier = await pool.query(
        "insert into supplier_list(name) values($1) returning *",
        [supplier.name]
      );
      console.log(insertSupplier.rows[0].supplier_id);
      const insertExp = await pool.query(
        "insert into perdaymessexpenses(bill_date,bill_no,particulars,supplier_id,bill_amount,hostel) values($1,$2,$3,$4,$5,$6) returning *",
        [
          bill_date,
          bill_number,
          particulars,
          insertSupplier.rows[0].supplier_id,
          bill_amount,
          hostel,
        ]
      );
      res.send({
        status: "ok",
        msg: "expense added",
        data: insertExp.rows[0],
      });
    } else {
      const insertExp = await pool.query(
        "insert into perdaymessexpenses(bill_date,bill_no,particulars,supplier_id,bill_amount,hostel) values($1,$2,$3,$4,$5,$6) returning *",
        [
          bill_date,
          bill_number,
          particulars,
          supplier.supplier_id,
          bill_amount,
          hostel,
        ]
      );
      res.send({
        status: "ok",
        msg: "expense added",
        data: insertExp.rows[0],
      });
    }
  } catch (err) {
    res.send({
      status: "failed",
      msg: err.message,
    });
  }
};

const getExpenseList = async (req, res) => {
  try {
    const isfaculty = req.query.isfaculty;
    if (isfaculty) {
      const status = req.query.status;
      const hostel = req.query.hostel;
      const expenseList = await pool.query(
        "select * from perdaymessexpenses where hostel=$1 and status=$2",
        [hostel, status]
      );
      res.send({
        status: "ok",
        msg: "succesfully got data",
        data: expenseList.rows,
      });
    } else {
      const status = req.query.status;
      const hostel = req.query.hostel;
      const expenseList = await pool.query(
        "select * from perdaymessexpenses where hostel=$1 and status>=$2",
        [hostel, status]
      );
      res.send({
        status: "ok",
        msg: "succesfully got data",
        data: expenseList.rows,
      });
    }
  } catch (err) {
    res.send({
      status: "failed",
      msg: err.message,
    });
  }
};

const updateExpenseList = async (req, res) => {
  try {
    const ids = req.body.ids;
    ids.map(async (id, index) => {
      const update = await pool.query(
        "update perdaymessexpenses set status=status+1 where id =$1 returning *",
        [id]
      );
      console.log(update.rows);
    });

    res.send({
      status: "ok",
      msg: "updated succesfully",
    });
  } catch (err) {
    res.send({
      status: "failed",
      msg: "something went wrong",
    });
  }
};
function updateProductByID(id, cols) {
  // Setup static beginning of query
  var query = ["UPDATE perdaymessexpenses"];
  query.push("SET");

  // Create another array storing each set command
  // and assigning a number value for parameterized query
  var set = [];
  Object.keys(cols).forEach(function (key, i) {
    set.push(key + " = ($" + (i + 1) + ")");
  });
  query.push(set.join(", "));

  // Add the WHERE statement to look up by id
  query.push("WHERE id = " + id);

  // Return a complete query string
  return query.join(" ");
}
const updateExpense = async (req, res) => {
  try {
    var query = updateProductByID(req.query.id, req.body);
    console.log(query);
    var colValues = Object.keys(req.body).map(function (key) {
      return req.body[key];
    });
    const update = await pool.query(query, colValues);
    res.send({
      status: "ok",
      msg: "updates",
    });
  } catch (err) {
    res.send({
      status: "failed",
      msg: err.message,
    });
  }
};

const getExpenseInfo = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const data = await pool.query(
      "select * from perdaymessexpenses where id=$1",
      [id]
    );
    res.send({
      status: "ok",
      msg: "got data",
      data: data.rows,
    });
  } catch (err) {
    res.send({
      status: "failed",
      msg: err.message,
    });
  }
};

const hostelRegistry = async (req, res) => {
  try {
    const query =
      await pool.query(`SELECT users.name,hostel_out.hostel_admission_no,batch.department,users.mobile_no,users.email,hostel_out.fromdate,hostel_out.todate,hostel_out.reason,hostel_blocks.hostel
        FROM users,inmate_table,hostel_out,batch,student,inmate_room,hostel_room,hostel_blocks WHERE hostel_out.hostel_admission_no=inmate_table.hostel_admission_no and inmate_table.admission_no=users.user_id and inmate_table.admission_no=student.admission_no and student.batchid=batch.batchid and hostel_out.hostel_admission_no=inmate_room.hostel_admission_no and inmate_room.room_id=hostel_room.room_id and hostel_room.block_id=hostel_blocks.block_id`);
    console.log("hyy", query.rows);
    res.json(query.rows);
  } catch (e) {
    console.log(e);
  }
};

const getHostelApplications = async (req, res) => {
  try {
    const query = await pool.query(
      "SELECT * from hostel_application,users where hostel_application.user_id=users.user_id"
    );
    console.log(query.rows, "hyy");
    res.json(query.rows);
  } catch (e) {}
};

const getMessAttendance = async (req, res) => {
  try {
    const hostel = req.query.hostel;
    const datemonth = req.query.date[5] + req.query.date[6];
    const date = req.query.date + "-" + 18;
    const days = await pool.query(
      "SELECT DATE_PART('days',DATE_TRUNC('month',date($1) )+ '1 MONTH'::INTERVAL - '1 DAY'::INTERVAL)",
      ["2023-05-18"]
    );
    console.log(days.rows);
    const messList = await pool.query(
      "select m.hostel_admission_no,u.name,case (select extract (month from current_date)) when $2 then (select extract (days from current_date)) else (SELECT DATE_PART('days',DATE_TRUNC('month', date($1))+ '1 MONTH'::INTERVAL - '1 DAY'::INTERVAL)) end-sum(case when extract(month from fromdate) = $2 then case when current_date>=todate then todate+1-fromdate else case when current_date>=fromdate then current_date+1-fromdate else 0 end end else case when extract(month from todate) = $2 then extract(day from todate) else 0 end end) as val from messout as m,users as u,inmate_table it where it.hostel_admission_no=m.hostel_admission_no and u.user_id=it.admission_no group by m.hostel_admission_no,u.name;",
      [date, datemonth]
    );
    res.send({
      status: "ok",
      msg: "got mess attendance",
      data: messList.rows,
    });
  } catch (err) {
    console.log({
      status: "failed",
      msg: err.message,
    });
    res.send({
      status: "failed",
      msg: err.message,
    });
  }
};

const generateRankList = async (req, res) => {
  try {
    const headerquery = await pool.query(
      `SELECT * from allotment_columns order by column_letter`
    );
    const existingcolquery = await pool.query(
      `SELECT * from allotment_columns where column_type='existing'`
    );
    const colData = existingcolquery.rows.map((col) => col.columns);
    console.log(colData.join(","), "nenj");
    const queryText =
      "SELECT " +
      colData.join(",") +
      ",users.user_id from hostel_application, student_progress, users where hostel_application.user_id=users.user_id";
    const query = await pool.query(queryText);
    console.log(queryText, "nad");
    const worksheet = workbook.addWorksheet("RankList");
    worksheet.columns = [];
    var temp = [];
    headerquery.rows.forEach((element) => {
      if (element.column_type === "existing") {
        temp.push({
          header: element.columns.split(".")[1],
          key: element.columns.split(".")[1],
        });
        //Existing column format : 'table.columnname'
      } else {
        temp.push({ header: element.columns, key: element.columns });
        //Derived column format : 'columnname'
      }
    });
    temp.push({ header: "user_id", key: "user_id" });
    temp.push({ header: "rank", key: "rank" });

    worksheet.columns = [...temp];
    console.log(worksheet.columns, "hu");
    const noofrows = query.rows.length;
    console.log(headerquery, "Hyeye");
    var rows = [];
    for (let i = 0; i < noofrows; i++) {
      var row = [];
      headerquery.rows.forEach((col) => {
        if (col.column_type === "existing") {
          row.push(query.rows[i][col.columns.split(".")[1]]);
        }
      });
      row.push(query.rows[i]["user_id"]);
      // Object.keys(query.rows[i]).forEach(colHeader => {
      //     row.push(query.rows[i][colHeader])
      // });
      rows.push(row);
    }

    console.log(rows, "rowstest");
    worksheet.addRows(rows);
    worksheet.eachRow((row, rowNo) => {
      console.log(rowNo);

      if (rowNo != 1) {
        headerquery.rows.forEach((col) => {
          if (col.column_type === "derived") {
            var matchesArray = col.formula.match(/<.*?>/g);

            console.log(matchesArray);
            var formula = col.formula;

            matchesArray.forEach((pattern) => {
              formula = formula.replace(
                pattern,
                pattern.slice(1, -1) + "" + rowNo
              );
            });

            console.log(formula);

            worksheet.getCell(col.column_letter + "" + rowNo).value = {
              formula: formula,
            };
          }
        });
      }
    });

    var sortedRows = [];
    worksheet.eachRow((row, rowNo) => {
      console.log(rowNo);

      if (rowNo != 1) {
        var newRow = [];
        row.eachCell((cell, cellNo) => {
          console.log(cell.value, "value");
          newRow.push(cell.value ? cell.value : "");
        });

        sortedRows.push(newRow);
      }
    });

    console.log(sortedRows, "sce");
    const hostelRequirements = await pool.query(
      "select rank_rule from hostel_requirements"
    );
    console.log(hostelRequirements.rows[0].rank_rule, "rule");
    const colLetter = hostelRequirements.rows[0].rank_rule.split(":")[0];
    const order = hostelRequirements.rows[0].rank_rule.split(":")[2];

    sortedRows = sortedRows.sort(function (a, b) {
      console.log(a, "endoo");
      if (order == "Asc")
        return (
          a[colLetter.charPointAt(0) - 65] - b[colLetter.charPointAt(0) - 65]
        );
      else
        return (
          a[colLetter.charPointAt(0) - 65] - b[colLetter.charPointAt(0) - 65]
        );
    });
    const sorted_worksheet = workbook.addWorksheet("RankList-Sorted-test");

    sorted_worksheet.columns = [...temp];
    sorted_worksheet.addRows(sortedRows);

    sorted_worksheet.eachRow(async (row, rowNo) => {
      console.log(rowNo, row);
      if (rowNo != 1) {
        var newRow = [];
        const userId = row.getCell("user_id").value;
        row.getCell("rank").value = rowNo - 1;

        const hostelRequirements = await pool.query(
          `INSERT INTO rank_list(user_id, rank, verified)
                values($1, $2, $3)`,
          [userId, rowNo - 1, false]
        );
      }
    });
    ///commented
    // const rankCol = worksheet.getColumn('rank');
    // rankCol.eachCell(async function(cell, rowNumber) {
    //     cell.value=rowNumber
    //     worksheet.getRow(rowNumber).getCell('rank').value={rowNumber}
    //     // const userId=worksheet.getRow(rowNumber).getCell("user_id").value
    //     // const hostelRequirements=await pool.query(`INSERT INTO rank_list(user_id, rank, verified)
    //     // values($1, $2, $3)`,[userId, rowNumber, false])

    // });

    workbook.removeWorksheet("RankList");
    console.log("running");
    await workbook.xlsx.writeFile("Ranklist.xlsx");
  } catch (e) {
    console.log(e);
  }
};

const getCertificateApplications = async (req, res) => {
  const certificates = await pool.query(
    `SELECT ST.admission_no,u.name as studentname,B.programme,C.name as certificatename,CA.application_id,CA.date,CA.status,CA.application_form,p.path FROM student as ST, certificate_application as CA, certificates as C, path as P, users as U,batch as B WHERE B.batchid=ST.batchid and ST.admission_no = CA.admission_no and CA.certificate_id=C.certificate_id and ST.admission_no=u.user_id and C.pathno=P.pathno`
  );
  console.log(certificates.rows);
  var requiredCertificates = [];
  for (var i = 0; i < certificates.rows.length; i++) {
    var myArray = certificates.rows[i].path.split("-");
    console.log(myArray);
    if (myArray[certificates.rows[i].status] == "WD") {
      requiredCertificates.push(certificates.rows[i]);
    }
  }
  console.log(requiredCertificates);
  res.json(requiredCertificates);
};

module.exports = {
  getSuplierList,
  addPerDayExpenses,
  getExpenseInfo,
  getExpenseList,
  updateExpense,
  updateExpenseList,
  getMessAttendance,
  hostelRegistry,
  getHostelApplications,
  generateRankList,
  getCertificateApplications,
};
