var LocalStrategy = require('passport-local');
var {pool, users} = require('./db');
const bcryptjs = require('bcryptjs')

module.exports = function(passport){
  passport.use('local',new LocalStrategy((username, password, done)=>{
    pool.query(`SELECT * FROM USERS
                WHERE User_Id=$1`, [username], (err, resp) => {
        if (err) {
            console.log(err)
            // resp.status(400).send("Error while fetching data")
            done(err)
        }
        else
        {
          console.log('user:', resp.rows)
  
          if(resp.rows.length==0)
            return done(null, false, {message : "incorrect username"})
  
          bcryptjs.compare(password, resp.rows[0].password, function(err, result) {
            if(result==false)
              return done(null, false, {message : "incorrect passsword"})
          });

          var user={...resp.rows[0]}
          user.roles=[]

          if(user.designation=="faculty")
          {
            pool.query(`SELECT Role from ROLES_FACULTY
                        WHERE USERID=$1`, [user.user_id], (err, response)=>{
                        if(!err)
                        {
                          roles=[...response.rows]

                          //adding admin role if user is an admin
                          if(user.is_admin==true)
                          {
                            roles.push({role:'admin'})
                            roles.push({role:'WD'})
                          }
                   
                          var userWithRoles={
                            ...user,
                            roles:roles.map(item=>item.role)
                          }
                          console.log("userWithRoles : ",userWithRoles,'hyy')
                          return done(null,userWithRoles)
                        }
                      })
          }
          else if(user.designation=="student")
          {
            console.log("Im here now")
            //stages include : inmate, noninmate
            pool.query(`SELECT Stage from STUDENT
                        WHERE Admission_No=$1`, [user.user_id], (err, response)=>{
                        if(!err)
                        {
                          console.log("Hii im here now",)
                          user.stage=response.rows[0].stage
                          //only inmate has roles if any
                          if(response.rows[0].stage=="inmate")
                          {
                            pool.query(`SELECT Role from INMATE_TABLE it, INMATE_ROLE ir
                            WHERE it.Admission_No=$1 and it.Hostel_Admission_No=ir.Hostel_Admission_No`, [user.user_id], (err, response)=>{
                            if(!err)
                            {
                              console.log("I got here ",response.rows)
                              user.roles=response.rows.map(item=>item.role)
                              pool.query(`select hostel from hostel_blocks as hb,hostel_room as hr,inmate_table as it,inmate_room as ir where it.hostel_admission_no=ir.hostel_admission_no and ir.room_id=hr.room_id and hb.block_id=hr.block_id and it.admission_no=$1`,
                               [user.user_id], (errmsg, response_hostel)=>{
                              if(!errmsg)
                              {
                                  user.hostel=response_hostel.rows[0].hostel
                              return done(null,user)
                              }
                              else{
                                console.log(errmsg)
                              }
                            })

                            }
                            else
                            {
                              console.log(err)
                            }
                          })
                          }
                          else if(response.rows[0].stage=="noninmate")//non inmate
                          {
                            return done(null,user)
                          }
                        }
                        else
                        {
                          console.log(err)
                        }
                      })
          }
          else
            return done(null, user)

          
          
        }
    })
  
    // for(var key in users)
    // {
    //   // console.log(user[key].username , ",", username," :: ", users[key].password,",",password)
    //   if(users[key].username===username && users[key].password===password)
    //   {
    //     user={...users[key]} 
    //     break
    //   }
    // }
    // // console.log(user)
    
    // if(user!=null)
    // {
    //   return done(null, user)
    // }
    // else
    // {
    //   console.log("came here")
    //   return done(null, false, {message : "incorrect username or passsword"})
    // }
  
  }));
  
  passport.serializeUser(function(user, done) {
    console.log("user serialized", user)
    done(null, user.user_id);
  });
  
  passport.deserializeUser(function(username, done) {
    console.log("user deserialized : ",username)

    var user={}

    pool.query(`SELECT * from USERS
                WHERE User_ID=$1`, [username], (err, response)=>{
                if(!err)
                {
                  user={...response.rows[0]}
                  console.log(user.user_id)
                  if(user.designation=="faculty")
                  {
                      pool.query(`SELECT Role from ROLES_FACULTY
                                  WHERE USERID=$1`, [user.user_id], (err, response)=>{
                                  if(!err)
                                  {
                                    roles=[...response.rows]

                                    //adding admin role if user is an admin
                                    if(user.is_admin==true)
                                      roles.push({role:'admin'})

                                    var userWithRoles={
                                      ...user,
                                      roles:roles.map(item=>item.role)
                                    }
                                    console.log("userWithRoles : ",userWithRoles)
                                    return done(null,userWithRoles)
                                  }
                                })
                  }
                  else if(user.designation=="student")
                  {
                      console.log("Im here now")
                      //stages include : inmate, noninmate
                      pool.query(`SELECT Stage from STUDENT
                                  WHERE Admission_No=$1`, [user.user_id], (err, response)=>{
                                  if(!err)
                                  {
                                    console.log("Hii im here now")
                                    user.stage=response.rows[0].stage
                                    //only inmate has roles if any
                                    if(response.rows[0].stage=="inmate")
                                    {
                                      pool.query(`SELECT Role from INMATE_TABLE it, INMATE_ROLE ir
                                        WHERE it.Admission_No=$1 and it.Hostel_Admission_No=ir.Hostel_Admission_No`, [user.user_id], (err, response)=>{
                                        if(!err)
                                        {
                                          console.log("I got here ",response.rows)
                                          user.roles=response.rows.map(item=>item.role)
                                          pool.query(`select hostel from hostel_blocks as hb,hostel_room as hr,inmate_table as it,inmate_room as ir where it.hostel_admission_no=ir.hostel_admission_no and ir.room_id=hr.room_id and hb.block_id=hr.block_id and it.admission_no=$1`,
                                           [user.user_id], (errmsg, response_hostel)=>{
                                          if(!errmsg)
                                          {
                                            user.hostel=response_hostel.rows[0].hostel
                                          return done(null,user)
                                          }
                                          else{
                                            console.log(errmsg)
                                          }
                                        })

                                        }
                                        else
                                        {
                                          console.log(err)
                                        }
                                      })
                                    }
                                    else if(response.rows[0].stage=="noninmate")//non inmate
                                    {
                                      return done(null,user)
                                    }
                                  }
                                  else
                                  {
                                    console.log(err)
                                  }
                      })
                  }
                  else
                    return done(null, user)
                }
    })
  });
}
