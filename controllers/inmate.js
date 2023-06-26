const { pool } = require("../db");
const notification = require("../controllers/notification");
const { query } = require("express");
const dateConverter = (inputdate) => {
  const date = new Date(inputdate);
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let year = date.getFullYear();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  return [year, month, day].join("-");
};

const applyHostelOut = async (req, res) => {
  try {
    const { user_id, fromDate, toDate, reason } = req.body;
    const getadmno = await pool.query(
      "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
      [user_id]
    );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    const hostelout = await pool.query(
      "INSERT INTO hostel_out(hostel_admission_no,fromdate,todate,reason) VALUES($1,$2,$3,$4)",
      [hostel_admno, fromDate, toDate, reason]
    );
    res.json(hostelout);
  } catch (e) {
    console.error(e);
  }
};

const submitComplaint = async (req, res) => {
  try {
    const { user_id, complaint } = req.body;
    const complaints = await pool.query(
      "INSERT INTO complaints(user_id,complaint) VALUES($1,$2)",
      [user_id, complaint]
    );
    res.json(complaints);
  } catch (e) {
    console.error(e);
  }
};

const submitRoomChange = async (req, res) => {
  try {
    const { user_id, preferredRoom, changeReason } = req.body;
    const getadmno = await pool.query(
      "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
      [user_id]
    );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    const currentroom = await pool.query(
      `select inmate_room.room_id from inmate_room where hostel_admission_no=$1`,
      [hostel_admno]
    );
    const croom = currentroom.rows[0].room_id;
    const roomchangereq = await pool.query(
      "INSERT INTO room_request values($1,$2,$3,FALSE) returning *",
      [hostel_admno, preferredRoom, changeReason]
    );
    res.json(roomchangereq);
  } catch (e) {
    console.error(e);
  }
};

const viewMessOutHistory = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const messoutUpdate = await pool.query(
      "update messout set showtodate=true where hostel_admission_no=(SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1) and todate<current_date and showtodate=false",
      [user_id]
    );
    const messouts = await pool.query(
      "SELECT * FROM messout WHERE hostel_admission_no=(SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1)",
      [user_id]
    );
    res.json(messouts);
  } catch (e) {
    console.error(e);
  }
};
const messoutpredaysk = async (req, res) => {
    try {
      const query =
        req.query.hostel === "MH"
          ? "SELECT value FROM messrequirements WHERE key='messoutpredaysk'"
          : "SELECT value FROM messrequirementsLH WHERE key='messoutpredaysk'";
      const days = await pool.query(query);
      res.json(days.rows);
    } catch (e) {
      console.error(e);
    }
  };

const messOutDays = async (req, res) => {
  try {
    const query =
      req.query.hostel === "MH"
        ? "SELECT value FROM messrequirements WHERE key='messoutdays'"
        : "SELECT value FROM messrequirementsLH WHERE key='messoutdays'";
    const days = await pool.query(query);
    res.json(days.rows);
  } catch (e) {
    console.error(e);
  }
};
const maxMessOutDays = async (req, res) => {
  try {
    const query =
      req.query.hostel == "MH"
        ? "SELECT value FROM messrequirements WHERE key='messoutdaysmaximum'"
        : "SELECT value FROM messrequirementsLH WHERE key='messoutdaysmaximum'";
    const days = await pool.query(query);
    res.json(days.rows);
  } catch (err) {
    console.log(err.message);
  }
};

const maxMessoutDaysinMonth = async (req, res) => {
  try {
    const query =
      req.query.hostel === "MH"
        ? "SELECT value FROM messrequirements WHERE key='messout_days_max_in_month'"
        : "SELECT value FROM messrequirementsLH WHERE key='messout_days_max_in_month'";
    const days = await pool.query(query);
    res.json(days.rows);
  } catch (err) {
    console.log(err.message);
  }
};

const getMessRequirements = async (req, res) => {
  try {
    const daysK = await pool.query(
        "SELECT value FROM messrequirements WHERE key='messoutpredaysk'"
      );

    const days = await pool.query(
      "SELECT value FROM messrequirements WHERE key='messoutdays'"
    );
    const daysmax = await pool.query(
      "SELECT value FROM messrequirements WHERE key='messoutdaysmaximum'"
    );
    const daysmaxinmonth = await pool.query(
      "SELECT value FROM messrequirements WHERE key='messout_days_max_in_month'"
    );

    res.json({
      daysK:daysK.rows,
      min: days.rows,
      max: daysmax.rows,
      maxinmonth: daysmaxinmonth.rows,
    });
  } catch (e) {
    console.error(e);
  }
};
const getMessRequirementsLH = async (req, res) => {
  try {
    const daysK = await pool.query(
        "SELECT value FROM messrequirementsLH WHERE key='messoutpredaysk'"
      );
    const days = await pool.query(
      "SELECT value FROM messrequirementsLH WHERE key='messoutdays'"
    );
    const daysmax = await pool.query(
      "SELECT value FROM messrequirementsLH WHERE key='messoutdaysmaximum'"
    );
    const daysmaxinmonth = await pool.query(
      "SELECT value FROM messrequirementsLH WHERE key='messout_days_max_in_month'"
    );
    
    console.log({
        daysK:daysK.rows,
        min: days.rows,
        max: daysmax.rows,
        maxinmonth: daysmaxinmonth.rows,
      });

    res.json({
      daysK:daysK.rows,
      min: days.rows,
      max: daysmax.rows,
      maxinmonth: daysmaxinmonth.rows,
    });
  } catch (e) {
    console.error(e);
  }
};

const renderFormTemplate = async (req, res) => {
  try {
    const type = req.query.user_type;
    var usertype = "";
    switch (type) {
      case "inmate":
        usertype = "IN";
        break;
      case "noninmate":
        usertype = "NIN";
        break;
    }
    const query = await pool.query(
      "SELECT * FROM certificates,path where certificates.pathno=path.pathno AND (path.start_user=$1 or path.start_user='S')",
      [usertype]
    );
    res.json(query.rows);
  } catch (e) {
    console.error(e);
  }
};

const applyCertificate = async (req, res) => {
  try {
    const { user_id, certificate_id } = req.body;
    delete req.body.user_id;
    delete req.body.certificate_id;
    const applicationform = JSON.stringify(req.body);
    // const getadmno=await pool.query("SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",[user_id])
    // const hostel_admno=getadmno.rows[0].hostel_admission_no
    const date = new Date();
    const getPath = await pool.query(`select path from path p,certificates c 
        where p.pathno=c.pathno and c.certificate_id=${certificate_id}`);
    console.log(getPath);
    var approved = false;
    if (getPath.rows[0].path == null) {
      approved = true;
    }
    const query = await pool.query(
      "INSERT INTO certificate_application(admission_no,certificate_id,date,approved,rejected,status,application_form) VALUES($1,$2,$3,$4,FALSE,0,$5) RETURNING *",
      [user_id, certificate_id, date, approved, applicationform]
    );
    console.log(query);

    notification.notifyEmail(
      query.rows[0].admission_no,
      query.rows[0].certificate_id,
      query.rows[0].status,
      getPath.rows[0].path
    );
    res.send("success");
  } catch (e) {
    console.error(e);
  }
};

const viewCertificates = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const certificates = await pool.query(
      "SELECT CA.application_id,CA.certificate_id,CA.date,C.name,CA.approved,CA.rejected,CA.status,CA.feedback,CA.application_form,p.path FROM certificate_application as CA,certificates as C,path as P WHERE admission_no=$1 AND CA.certificate_id=C.certificate_id and C.pathno=P.pathno",
      [user_id]
    );
    console.log(certificates.rows);
    res.json(certificates.rows);
  } catch (e) {
    console.error(e);
  }
};
const checkMessOut = async (req, res) => {
  try {
    const { user_id, hostel } = req.body;
    const getadmno = await pool.query(
      "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
      [user_id]
    );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    const updateMessTable = pool.query(
      "update messout set showtodate=true where todate<=current_date and hostel_admission_no=$1",
      [hostel_admno]
    );
    const messout = await pool.query(
      "select fromdate,todate from messout where hostel_admission_no=$1 and showtodate=false",
      [hostel_admno]
    );
    const date=new Date();
    const today=dateConverter(date);
    const datemonth=today[5]+today[6]
    //const date=req.query.date+"-"+18
    const countperMonth=await pool.query("select m.hostel_admission_no,u.name,sum(case when extract(month from fromdate) = $1 then case when current_date>=todate then todate+1-fromdate else case when current_date>=fromdate then current_date+1-fromdate end end else case when extract(month from todate) = $1 then extract(day from todate) end end) as countpermonth from messout as m,users as u,inmate_table it where fromdate<=current_date and it.hostel_admission_no=m.hostel_admission_no and u.user_id=it.admission_no and m.hostel_admission_no=$2 group by m.hostel_admission_no,u.name;",[datemonth,hostel_admno]);
    // console.log(messOutHistoryMOnth.rows[0])
    // const countperMonth = await pool.query(
    //   "select countpermonth from cumulativemessoutinmate where hostel_admission_no=$1",
    //   [hostel_admno]
    // );
    console.log(countperMonth.rows)
    let permissibledays = 0,
      day1 = 10000,
      day2 = 10000;
    const query =
      hostel === "MH"
        ? "select value from messrequirements where key='messout_days_max_in_month' or key='messoutdaysmaximum'"
        : "select value from messrequirementsLH where key='messout_days_max_in_month' or key='messoutdaysmaximum'";
    const messrequirements = await pool.query(query);
    console.log(messrequirements.rows[1].value);
    if (messrequirements.rows[0].value > 0) {
      if (countperMonth.rowCount > 0) {
        if (
          countperMonth.rows[0].countpermonth < messrequirements.rows[0].value
        ) {
          day1 =
            messrequirements.rows[0].value -
            countperMonth.rows[0].countpermonth;
        } else {
            console.log("pro");
          throw new Error("exceeded monthly limit");
        }
      }
    }
    if (messrequirements.rows[1].value > 0) {
      day2 = messrequirements.rows[1].value;
    }

    (day1 == day2) == 10000
      ? (permissibledays = permissibledays)
      : day1 < day2
      ? (permissibledays = day1)
      : (permissibledays = day2);
    if (messout.rows.length > 0) {
        console.log({
            AllowableDays: permissibledays,
            NomessOutDaysinMonth:countperMonth.rowCount > 0?countperMonth.rows[0].countpermonth:0,
            isMessout: true,
            status: true,
            data: messout.rows[0],
          },"hy");
      res.json({
        AllowableDays: permissibledays,
        NomessOutDaysinMonth:countperMonth.rowCount > 0?countperMonth.rows[0].countpermonth:0,
        isMessout: true,
        status: true,
        data: messout.rows[0],
      });
    } else {
      const checkIsEditable = await pool.query(
        "select * from messout where todate>current_date and hostel_admission_no=$1",
        [hostel_admno]
      );
      const messoutHistory=await pool.query(
        "select * from messout where hostel_admission_no=$1",
        [hostel_admno]
      );
      if (checkIsEditable.rowCount > 0 && messoutHistory.rowCount>0) {
        console.log({
            AllowableDays: permissibledays,
            fromdate: checkIsEditable.rows[0].fromdate,
            todate: checkIsEditable.rows[0].todate,
            isMessout: false,
            status: false,
            iseditable: false,
          },"halo")
        res.json({
            AllowableDays: permissibledays,
          fromdate: checkIsEditable.rows[0].fromdate,
          todate: checkIsEditable.rows[0].todate,
          isMessout: false,
          status: false,
          iseditable: false,
        });
      } else {
        console.log({
            NomessOutDaysinMonth:countperMonth.rowCount > 0?countperMonth.rows[0].countpermonth:0,
            AllowableDays: permissibledays,
            isMessout: false,
            status: false,
            iseditable: true,
          });
        res.json({
          NomessOutDaysinMonth:countperMonth.rowCount > 0?countperMonth.rows[0].countpermonth:0,
          AllowableDays: permissibledays,
          isMessout: false,
          status: false,
          iseditable: true,
        });
      }
    }
  } catch (err) {
    console.log(err.message,'hy');
    res.status(200).json({
      status: "failed",
      msg: "exceeded monthly limit cannot apply for messout",
    });
  }
};

const applyMessOut = async (req, res) => {
  try {
    let { user_id, fromDate, toDate, hostel } = req.body;
    console.log(user_id, fromDate, toDate, hostel);
    const getadmno = await pool.query(
      "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
      [user_id]
    );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    if (req.query.update === "true") {
      console.log(req.query.update, req.query.oldmessout);
      const deleteOldRecord = await pool.query(
        "delete from messout where fromdate=$1 and hostel_admission_no=$2",
        [req.query.oldmessout, hostel_admno]
      );
      console.log(deleteOldRecord.rows);
    }

    const query =
      hostel === "MH"
        ? "select value from messrequirements where key='messoutdays'"
        : "select value from messrequirementsLH where key='messoutdays'";
    const messrequirements = await pool.query(query);
    //   (fromdate +1-$4)
    console.log(toDate);

    const messOutHistory2 = await pool.query(
      " select count(*) from messout where $1 between fromdate and todate and hostel_admission_no=$2",
      [fromDate, hostel_admno]
    );
    if (messOutHistory2.rows[0].count > 0) {
      throw new Error("Seems like applied for an existing messout days");
    }

    const messOutHistory = await pool.query(
      " select count(*) from messout where (hostel_admission_no=$3) and ($1 between fromdate and todate or $2 between fromdate and todate)",
      [fromDate, toDate, hostel_admno]
    );
    console.log(messOutHistory, hostel_admno, "hyy");

    if (messOutHistory.rows[0].count > 0) {
      const ntdate = new Date(fromDate);
      ntdate.setDate(ntdate.getDate() + messrequirements.rows[0].value - 1);
      const newfdate = dateConverter(ntdate);
      console.log(newfdate);
      const messOutHistory1 = await pool.query(
        " select min(fromdate) as val,count(*) from messout where $1 < fromdate and hostel_admission_no=$2",
        [newfdate, hostel_admno]
      );
      if (messOutHistory1.rows[0].count > 0) {
        const newtoDate = new Date(messOutHistory1.rows[0].val);
        newtoDate.setDate(newtoDate.getDate() - 1);
        toDate = dateConverter(newtoDate);
      } else {
        throw new Error("Seems like applied for an existing messout days hh");
      }
    }
    const messout = await pool.query(
      "INSERT INTO messout VALUES($1,$2,$3,false) RETURNING *",
      [hostel_admno, fromDate, toDate]
    );
    res.status(200).json({
      status: "ok",
      msg: "succesfully requested messout",
      data: messout.rows,
    });
  } catch (e) {
    res.json({
      status: "failed",
      msg: e.message,
    });
    console.log(e.message);
  }
};

const applyMessin = async (req, res) => {
  try {
    const { user_id, toDate } = req.body;
    const getadmno = await pool.query(
      "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
      [user_id]
    );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    const messout = await pool.query(
      "update messout set todate=$1,showtodate=true where hostel_admission_no=$2 and showtodate=false returning *",
      [toDate, hostel_admno]
    );
    const tdate = new Date(messout.rows[0].todate);
    const fdate = new Date(messout.rows[0].fromdate);
    const dif = (tdate.getTime() - fdate.getTime()) / (1000 * 3600 * 24) + 1;
    const updateCumulativeCount = await pool.query(
      "update cumulativemessoutinmate set  countpermonth=countpermonth+$1 where hostel_admission_no=$2 ",
      [dif, hostel_admno]
    );
    // res.json(messout.rows[0])
    res.json({
      status: "ok",
      msg: "succcesfully send mess in request",
      data: messout,
    });
  } catch (err) {
    res.json({
      status: "failed",
      msg: err.message,
    });
  }
};

const viewMessBill = async (req, res) => {
  try {
    const query = await pool.query(
      `select * from messbill where hostel_admission_no=(select hostel_admission_no from inmate_table where admission_no=$1)`,
      [req.query.user_id]
    );
    res.json(query.rows);
  } catch (e) {
    console.log(e);
  }
};
const editMessoutData = async (req, res) => {
  try {
    console.log("hy")
    const fromdate = req.body.fromdate;
    const todate = req.body.todate;
    const editedMessoutFromdate = req.body.editedMessoutFromdate;
    const editedMessouttodate = req.body.editedMessouttodate;
    const { user_id, hostel } = req.body;
    const getadmno = await pool.query(
      "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
      [user_id]
    );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    const updateMessTable = pool.query(
      "update messout set showtodate=true where todate<=current_date and hostel_admission_no=$1",
      [hostel_admno]
    );
    const messout = await pool.query(
      "select fromdate,todate from messout where hostel_admission_no=$1 and showtodate=false",
      [hostel_admno]
    );
    const date=new Date();
    const today=dateConverter(date);
    const datemonth=today[5]+today[6]
    const countperMonth=await pool.query("select m.hostel_admission_no,u.name,sum(case when extract(month from fromdate) = $1 then case when current_date>=todate then todate+1-fromdate else case when current_date>=fromdate then current_date+1-fromdate end end else case when extract(month from todate) = $1 then extract(day from todate) end end) as countpermonth from messout as m,users as u,inmate_table it where fromdate<=current_date and it.hostel_admission_no=m.hostel_admission_no and u.user_id=it.admission_no and m.hostel_admission_no=$2 group by m.hostel_admission_no,u.name;",[datemonth,hostel_admno]);
    let permissibledays = 0,
      day1 = 10000,
      day2 = 10000;
    const query =
      hostel === "MH"
        ? "select value from messrequirements where key='messout_days_max_in_month' or key='messoutdaysmaximum'"
        : "select value from messrequirementsLH where key='messout_days_max_in_month' or key='messoutdaysmaximum'";
    const minimumValueQUery=hostel ==="MH" ? "select value from messrequirements where key='messoutdays'": "select value from messrequirementsLH where key='messoutdays'";
    const minimumValue=await pool.query(minimumValueQUery);
    const messrequirements = await pool.query(query); //mess requiremets.rows has first month max value and then mess out max
    if (messrequirements.rows[1].value > 0) {
      if (countperMonth.rowCount > 0) {
        if (
          countperMonth.rows[0].countpermonth < messrequirements.rows[0].value
        ) {
          day1 =
            messrequirements.rows[0].value -
            countperMonth.rows[0].countpermonth;
            if((todate - today) /(1000 * 3600 * 24) + 1>day1){
                console.log("exceeded monthly limit");
                throw new Error("exceeded monthly limit");
            }
        } else {
            console.log("exceeded monthly limit");
          throw new Error("exceeded monthly limit");
        }
      }
    }
    if (messrequirements.rows[1].value > 0) {
      day2 = messrequirements.rows[1].value;
    }

    (day1 == day2) == 10000
      ? (permissibledays = permissibledays)
      : day1 < day2
      ? (permissibledays = day1)
      : (permissibledays = day2);
    const Fromdate = new Date(editedMessoutFromdate);
    const Todate = new Date(editedMessouttodate);
    console.log("hyy",permissibledays, (Todate - Fromdate) / (1000 * 3600 * 24) + 1);
    if (permissibledays < (Todate - Fromdate) / (1000 * 3600 * 24)) {
        console.log("exceeded monthly limit");
      throw new Error("exceeded monthly limit");
    }
    else if((Todate - Fromdate) / (1000 * 3600 * 24) + 1<minimumValue.rows[0].value){
        console.log("Date selected is low");
        throw new Error("Date selected is low")
    }
    //update messout set fromdate=$1 and todate=$2
    else {
      const EditedFromdate = dateConverter(editedMessoutFromdate);
      const EditedTodate = dateConverter(editedMessouttodate);
      console.log(EditedFromdate, EditedTodate);
      const EditData = await pool.query(
        "update messout set fromdate=$1,todate=$2  where hostel_admission_no=$3 and fromdate=$4 and todate=$5 returning *",
        [EditedFromdate, EditedTodate, hostel_admno,dateConverter(req.body.fromdate),dateConverter(req.body.todate)]
      );
      res.send({
        status: "ok",
        msg: "updated mess data",
        data: EditData.rows,
      });
    }
  } catch (err) {
    res.send({
      status: "failed",
      msg: "error updating mess data",
    });
  }
};

const editPrevMessData = async (req, res) => {
  try {
    const fromdate = req.body.prevfromdate;
    const todate = req.body.prevtodate;
    const newfromdate = req.body.newfromdate;
    const newtodate = req.body.newtodate;
    const user_id=req.body.user_id;
    console.log(dateConverter(fromdate), dateConverter(todate),dateConverter(newfromdate), dateConverter(newtodate));
    const getadmno = await pool.query(
        "SELECT hostel_admission_no FROM inmate_table WHERE admission_no=$1",
        [user_id]
      );
    const hostel_admno = getadmno.rows[0].hostel_admission_no;
    const update=await pool.query("update messout set fromdate=$4,todate=$5 where hostel_admission_no=$1 and fromdate=$2 and todate=$3 returning *",[hostel_admno,dateConverter(fromdate),dateConverter(todate),dateConverter(newfromdate),dateConverter(newtodate)])
    console.log(update.rows)
    res.send({
        data:update.rows,
        status:"ok"
    })
  } catch (err) {
    res.send({
      status: "failed",
      failed: err.message,
    });
  }
};


const messOutRequests = async (req, res) => {
  try {
    console.log(req.query.date, "nadee");
    let requests = await pool.query(
      `SELECT mo.hostel_admission_no,mo.fromdate,mo.todate,u.name from messout as mo,inmate_table as it,inmate_room as ir,hostel_room as hr,hostel_blocks as hb,users as u
        WHERE mo.hostel_admission_no=it.hostel_admission_no AND it.admission_no = u.user_id AND it.hostel_admission_no=ir.hostel_admission_no AND ir.room_id=hr.room_id
        AND hr.block_id=hb.block_id AND hb.hostel=$1`,
      [req.query.hostel]
    );
    if (req.query.date != 0) {
      console.log(req.query.date, "nadee");
      requests = await pool.query(
        `SELECT mo.hostel_admission_no,mo.fromdate,mo.todate,u.name from messout as mo,inmate_table as it,inmate_room as ir,hostel_room as hr,hostel_blocks as hb,users as u
              WHERE mo.hostel_admission_no=it.hostel_admission_no AND it.admission_no = u.user_id AND it.hostel_admission_no=ir.hostel_admission_no AND ir.room_id=hr.room_id
              AND hr.block_id=hb.block_id AND hb.hostel=$1 AND $2 between mo.fromdate AND mo.todate`,
        [req.query.hostel, req.query.date]
      );
    }
    console.log(requests.rows);
    res.json(requests);
  } catch (e) {
    console.log(e);
  }
};

const currentMessInmates = async (req, res) => {
  try {
    const hostel = req.query.hostel;
    const date = new Date(req.query.date);
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    let year = date.getFullYear();
    if (month.length < 2) {
      month = "0" + month;
    }
    if (day.length < 2) {
      day = "0" + day;
    }
    const inputdate = [year, month, day].join("-");
    // const query=await pool.query(`SELECT users.name,inmate_table.hostel_admission_no,hostel_room.room_no,hostel_blocks.block_name
    // from messout,inmate_table,users,inmate_room,hostel_room,hostel_blocks
    // where $1 between messout.fromdate and messout.todate
    // and inmate_table.hostel_admission_no != messout.hostel_admission_no
    // and inmate_table.admission_no = users.user_id
    // and inmate_table.hostel_admission_no = inmate_room.hostel_admission_no
    // and inmate_room.room_id = hostel_room.room_id
    // and hostel_room.block_id = hostel_blocks.block_id`,[inputdate])
    const query = await pool.query(
      `SELECT users.name,inmate_table.hostel_admission_no, hostel_room.room_no,hostel_blocks.block_name
        FROM inmate_table,users,inmate_room,hostel_room,hostel_blocks
        WHERE inmate_table.hostel_admission_no NOT IN(SELECT messout.hostel_admission_no from messout where $1 between messout.fromdate and messout.todate)
        and inmate_table.admission_no = users.user_id 
        and inmate_table.hostel_admission_no = inmate_room.hostel_admission_no 
        and inmate_room.room_id = hostel_room.room_id 
        and hostel_room.block_id = hostel_blocks.block_id
        and hostel_blocks.hostel=$2`,
      [inputdate, hostel]
    );
    console.log(query.rows);
    res.send(query.rows);
  } catch (e) {
    console.log(e);
  }
};

const uploadMessBill = async (req, res) => {
  try {
    console.log(req.body);
    req.body.jsonData.map(async (item) => {
      const query = await pool.query(
        "INSERT INTO messbill(hostel_admission_no,month,attendance,mess_charge,extras,feast,lf,af,total,dues) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          item.Hostel_Admission_No,
          req.body.date.toString(),
          item.Attendance,
          item.Mess_Charge,
          item.Extras,
          item.Feast,
          item.LF,
          item.AF,
          item.Total,
          item.Dues,
        ]
      );
      console.log(query);
      res.send("Success");
    });
  } catch (e) {
    console.log(e);
  }
};

const cancelMessOut = async (req, res) => {
  try {
    const { user_id, fromDate, toDate } = req.body;
    const fdate = dateConverter(fromDate);
    const tdate = dateConverter(toDate);
    const query = await pool.query(
      "DELETE FROM messout WHERE hostel_admission_no=(SELECT hostel_admission_no from inmate_table where admission_no=$1) and fromdate=$2 and todate=$3 returning *",
      [user_id, fdate, tdate]
    );
    console.log(query);
    res.json(query.rows);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  applyHostelOut,
  submitComplaint,
  submitRoomChange,
  viewMessOutHistory,
  getMessRequirements,
  getMessRequirementsLH,
  messoutpredaysk ,
  messOutDays,
  maxMessoutDaysinMonth,
  editPrevMessData,
  maxMessOutDays,
  checkMessOut,
  cancelMessOut,
  renderFormTemplate,
  applyCertificate,
  viewCertificates,
  applyMessOut,
  applyMessin,
  editMessoutData,
  messOutRequests,
  currentMessInmates,
  uploadMessBill,
  cancelMessOut,
  viewMessBill,
};
