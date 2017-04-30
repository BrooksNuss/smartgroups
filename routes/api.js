//API endpoints for all database objects
//These include HTTP get, put, post, and delete methods
//for users, students, groups, classes, and seating charts.

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Student = mongoose.model('Student');
var Class = mongoose.model('Class');
var Group = mongoose.model('Group');
var SeatingChart = mongoose.model('SeatingChart');
var bCrypt = require('bcrypt-nodejs');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect to the login page
	return res.redirect('/login');
};

//Register the authentication middleware
router.use('/studentList', isAuthenticated);
router.use('/classList', isAuthenticated);
router.use('/groupList', isAuthenticated);

//USERS
router.route('/users/:username')
	
	//check for user
	.get(function(req, res){
		User.findOne({username: req.params.username}, function(err, data){
			if (err){
				return res.send(500, err);
			}
			return res.send(data);
		});
	})

	.put(function(req, res){
		//Gets username from above URL ^^^/users/:username
		User.findById(req.params.username, function(err, user){
			if (err){
				return res.send(500, err);
			}
			user.fname=req.body.fname;
			user.lname=req.body.lname;
			user.email=req.body.email;
			user.save(function(err, user){
				if(err){
					return res.send(500, err);
				}
				return res.json(user);
			})
		})
	})

	.delete(function(req, res){
		User.remove({_id: req.params.username}, function(err){
			if(err)
				return res.status(500).send(err)
			return res.send("deleted");
		})
	})

router.route('/users/')
	
	.get(function(req, res){
		User.find(function(err, users){
			if(err){
				return res.status(500).send(err);
			}
			return res.send(users);
		})
	})

router.route('/users/password/:_id')

	.put(function(req, res){
		User.findOne({_id: req.params._id}, function(err, newUser){
			if (err){
				return res.status(500).send(err);
			}
			newUser.password=bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null);
			newUser.save(function(err, updateUser){
				if(err){
					return res.status(500).send(err);
				}
				return res.send(updateUser);
			})
		})
	});

//STUDENTS
//api for all studentList
router.route('/studentList')
	
	//create a new student
	.post(function(req, res){
		var student = new Student();
		student.name = req.body.name;
		student.sid = req.body.sid;
		student.LType = req.body.LType;
		student.PType = req.body.PType;
		student.RLevel = req.body.RLevel;
		student.classes = req.body.classes;
		student.groups = req.body.groups;
		student.save(function(err, post) {
			if (err){
				return res.status(500).send(err);
			}
			return res.json(post);
		});
	})

	.get(function(req, res){
		Student.find(function(err, data){
			if(err){
				return res.send(500, err);
			}

			return res.send(data);
		});
	})

	//update specified student
	.put(function(req,res){
		Student.findById(req.body[0]._id, function(err, student){
			if(err) {
				res.send(err);
			}

			student.name = req.body[0].name;
			student.sid = req.body[0].sid;
			student.LType = req.body[0].LType;
			student.PType = req.body[0].PType;
			student.RLevel = req.body[0].RLevel;
			student.classes = req.body[0].classes;
			student.groups = req.body[0].groups;

			student.save(function(err, student){
				if(err)
					res.send(err);

				res.json(student);
			});
		});
	});

router.route('/studentList/array')
	
	//create a new array of students
	.post(function(req, res){

		var student = new Student();
		var returnList = [];
		// var bodyVar=JSON.parse(req.body);
		for(var i=0;i<req.body.length;i++){
			student.name = req.body.name;
			student.sid = req.body.sid;
			student.LType = req.body.LType;
			student.PType = req.body.PType;
			student.RLevel = req.body.RLevel;
			student.classes = req.body.classes;
			student.groups = req.body.groups;
			if(req.body[i].classes.length>0)
				student.classes = req.body[i].classes;
			if(req.body[i].groups.length>0)
				student.groups = req.body[i].groups;
			
			student.save(function(err, post) {
				if (err){
					return res.send(500, err);
				}
				else
					returnList.push(post);
			});
		};
		return res.json(returnList);
	});

//api for a specfic student
router.route('/studentList/:_id')
	
	//update specified student
	.put(function(req,res){
		Student.findById(req.body._id, function(err, student) {
			if (err)
				return res.send(err);

			student.name = req.body.name;
			student._id = req.body._id;
			student.LType = req.body.LType;
			student.PType = req.body.PType;
			student.RLevel = req.body.RLevel;
			student.classes = req.body.classes;
			student.groups = req.body.groups;

			//find all groups where studentlist contains this student.
			//then, remove this student from the group and do so with all other matching groups
			Group.find({studentList: {$elemMatch: {sid: req.body._id}}}, function(err, groups){
				if(err){
					return res.send(err);
				}
				groups.forEach(function(group){
					group.studentList.forEach(function(s, index){
						if(s.sid==student._id){
							group.studentList[index].name=student.name;
							Group.update({_id: group._id}, group, function(err, gUpdate){
								if(err)
									return res.status(500).send(err);
							});
						}
					})
				})
			});
			//same as above, but with classes instead of groups
			Class.find({studentList: {$elemMatch: {sid: req.body._id}}}, function(err, classes){
				if(err){
					return res.send(err);
				}
				classes.forEach(function(c){
					c.studentList.forEach(function(s, index){
						if(s.sid==student._id){
							c.studentList[index].name=student.name;
							Class.update({_id: c._id}, c, function(err, cUpdate){
								if(err)
									return res.status(500).send(err);
							});
						}
					})
				})
			});
			Student.update({_id: req.body._id}, student, {new: true}, function(err, studUpdate){
				if(err){
					return res.send(err);
				}
				return res.json({status: true, reason: "Success"});
			});
		});
	})

	//get specified student
	.get(function(req,res){
		Student.find({ _id: req.params._id}, function(err, student){
			if(err)
				return res.send(err);
			return res.json(student);
		});
	})
	//delete specified student
	.delete(function(req,res){
		Student.findById(req.params._id, function(err, student) {
			if (err)
				return res.send(err);
			//find all groups where studentlist contains this student.
			//then, remove this student from the group and do so with all other matching groups
			Group.find({studentList: {$elemMatch: {sid: req.params._id}}}, function(err, groups){
				groups.forEach(function(group){
					group.studentList.forEach(function(s, index){
						if(s.sid==req.params._id){
							group.studentList.splice(index, 1);
							group.save(function(err, gUpdate){});
						}
					})
				})
			});
			//same as above, but with classes instead of groups
			Class.find({studentList: {$elemMatch: {sid: req.params._id}}}, function(err, classes){
				classes.forEach(function(c){
					c.studentList.forEach(function(s, index){
						if(s.sid==req.params._id){
							c.studentList.splice(index, 1);
							c.save(function(err, cUpdate){});
						}
					})
				})
			});
			Student.remove({_id: req.params._id}, function(err){
				if(err)
					return res.send(err);
				return res.send({status: true, reason: "Success"});
			});
		});
	});

//access students by class
router.route('/studentList/class/:_id')
	.get(function(req, res){
		Student.find({classes: {$elemMatch: {cid: req.params._id}}}, function(err, data){
			if(err){
				return res.send(500, err);
			}

			return res.send(data);
		});
	});

//access students by group
router.route('/studentList/group/:group')

	.get(function(req, res){
		Student.find({groups: {$elemMatch: {gid: req.params.group}}}, function(err, data){
			if(err){
				return res.send(500, err);
			}

			return res.send(data);
		});
	});

//CLASSES
//api for all classes
router.route('/classList')
	
	//create a new class
	.post(function(req, res){

		var class1 = new Class();
		class1.name = req.body.name;
		class1.teacher = req.body.teacher;
		class1.studentList = req.body.studentList;
		class1.groupList = req.body.groupList;
		class1.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(class1);
		});
	})

	.get(function(req, res){
		Class.find(function(err, data){
			if(err){
				return res.send(500, err);
			}

			return res.send(data);
		});
	});

router.route('/classList/teacher/:teacher')

	.get(function(req, res){
		Class.find({teacher: req.params.teacher}, function(err, data){
			if(err){
				return res.send(500, err);
			}
			return res.send(data);
		});
	});

//api for a specfic class by _id
router.route('/classList/:_id')

	.put(function(req,res){
		Class.findById(req.body._id, function(err, c){
			if(err)
				return res.send(err);

            // Make hashtable of ids in B/new
			var bodyIds = {}
			req.body.studentList.forEach(function(obj){
			    bodyIds[obj.sid] = obj;
			});

			// Return all elements in A/old/db, unless in B/new
			let studentDifference=c.studentList.filter(function(obj){
			    return !(obj.sid in bodyIds);
			});

			c.name = req.body.name;
			c.teacher = req.body.teacher;
			c.groupList = req.body.groupList;
			c.studentList = req.body.studentList;
			c._id = req.body._id;


			//get all students in this group
			var sidArr = [];
			c.studentList.forEach(function(student){
				sidArr.push(student.sid);
			});
			var gidArr = [];
			c.groupList.forEach(function(group){
				gidArr.push(group.gid);
			});
			var remSidArr = [];
			studentDifference.forEach(function(student){
				remSidArr.push(student.sid);
			})

			console.log("\n\n\n\n\n\n\n\n\n\nSTUDENTDIFF"+JSON.stringify(studentDifference));
			console.log("incoming studentList:"+JSON.stringify(req.body.studentList));
			console.log("existing studentList:"+JSON.stringify(c.studentList));
			Student.find({_id: {$in: remSidArr}}, function(err, remStudents){
				remStudents.forEach(function(student){
					student.classes.forEach(function(c1, index){
						console.log("STUDENT: "+student);
						if(student.classes){
							if(c1.cid==c._id){
								student.classes.splice(index, 1);
								Student.update({_id: student._id}, student, function(err, numCh){
									if(err){
										return res.status(500).send(err);
									}
									console.log(numCh);
								})
							}
						}
					})
				})
			})

			Student.find({_id: {$in: sidArr}}, function(err, students){
				if(err){
					return res.send(err);
				}
				students.forEach(function(student, index){
					if(student.classes.length>0){
						student.classes.forEach(function(studentClass){
							if(studentClass.cid==c.id){
								studentClass.name=c.name;
								Student.update({_id: student._id}, student, function(err, snum){
									if(err){
										return res.send(err);
									}
								})
							}
						})
					}
					//handles no classes added yet
					else{
						student.classes.push({cid: c.id, name: c.name});
						Student.update({_id: student._id}, student, function(err, snum){
							if(err){
								return res.send(err);
							}
						})
					}
				})
				c.save(function(err, c1){
					if(err){
						return res.send(err);
					}
					console.log(c1.studentList);
					return res.json(c1);
				});
			});

			//same as above, but with only the single class of the group being changed
			Group.find({_id: {$in: gidArr}}, function(err, groups){
				if(err){
					return res.send(err);
				}
				groups.forEach(function(group){
					group.class.name=c.name;
					group.class.cid=c.id;
					Group.update({_id: group._id}, group, function(err, snum){
						if(err){
							return res.send(err);
						}
					})
				})
			});
		});
	})

	//get specified group
	.get(function(req,res){
		Class.find({_id: req.params.class}, function(err, c){
			if(err)
				res.send(err);
			res.json(c);
		});
	})
	//delete specified group
	.delete(function(req,res){
		Class.findById(req.params._id, function(err, c) {
			if (err)
				return res.send(err);
			else{
				if(c.studentList.length==0){
					//PREVENT REMOVAL OF NON EMPTY CLASSES
					//Allow removal of empty classes with groups
					//remove leftover groups here
					Group.remove({"class.cid": req.params._id}, function(err){
						if(err)
							return res.send(err);
					});
					//remove the class
					Class.remove({_id: req.params._id}, function(err){
						if(err)
							return res.send(err);
						else
							return res.json({status: true, reason: "Success"});
					});
				}
				else
					return res.json({status: false, reason: "Class not empty! Remove all students first!"});
			}
		});
	});

//GROUPS
//api for all groups
router.route('/groupList')
	
	//create a new group
	.post(function(req, res){

		var group = new Group();
		group.name = req.body.name;
		group.size = req.body.size;
		group.activityType = req.body.activityType;
		group.selectType = req.body.selectType;
		group.class = req.body.class;
		group.studentList = req.body.studentList;
		group.save(function(err, post) {
			if (err){
				return res.send(500, err);
			}
			return res.json(post);
		});
	})

	//shouldn't be used
	.get(function(req, res){
		Group.find(function(err, data){
			if(err){
				return res.send(500, err);
			}

			return res.send(data);
		});
	});

router.route('/groupList/array')
	
	//create a new array of group
	.post(function(req, res){

		//Alternate way of inserting documents. Supposedly more efficient.
		//Accepts and handles arrays very well!!!
		Group.collection.insert(req.body, function(err, post) {
			if (err)
				return res.send(500, err);
			else{
				for(let i=0;i<post.ops.length;i++){
					post.ops[i].studentList.forEach(function(element){
						Student.findById(element.sid, function(err, student){
							student.groups.push({gid: post.ops[i]._id.toString(), name: post.ops[i].name});
							student.save(function(err, studUp){
								console.log(studUp.name+" updated!");
							})
						})
					})
					Class.findById(post.ops[0].class.cid, function(err, c){
						c.groupList.push({gid: post.ops[i]._id.toString(), name: post.ops[i].name});
						c.save(function(err, cUp){
							console.log(cUp.name+" updated!");
						})
					})
				}
				return res.json(post.ops);
			}
		});
	});

router.route('/groupList/class/:class')

	.get(function(req, res){
		Group.find({"class.cid": {$in: req.params.class}}, function(err, data){
			if(err){
				return res.send(500, err);
			}

			return res.send(data);
		});
	});

//api for a specfic group
router.route('/groupList/:id')
	
	//update specified group
	.put(function(req,res){
		Group.findById(req.params.id, function(err, group){
			if(err)
				return res.send(err);

			group.name = req.body.name;
			group.size = req.body.size;
			group.activityType = req.body.activityType;
			group.selectType = req.body.selectType;
			group.class = req.body.class;
			group.studentList = req.body.studentList;
			group._id = req.body._id;


			//get all students in this group
			var sidArr = [];
			group.studentList.forEach(function(student){
				sidArr.push(student.sid);
			})

			//for each student in the group, scan its groups to find the one matching the current group
			//change that group to have the new name, same old _id tho
			Student.find({_id: {$in: sidArr}}, function(err, students){
				if(err){
					return res.send(err);
				}
				students.forEach(function(student){
					student.groups.forEach(function(studentGroup){
						if(studentGroup.gid==group._id){
							studentGroup.name=group.name;
							Student.update({_id: student._id}, student, function(err, snum){
								if(err){
									return res.send(err);
								}
							})
						}
					})
				})
			});

			//same as above, but with only the single class of the group being changed
			Class.findOne({_id: group.class.cid}, function(err, c){
				if(err)
					return res.send(err);
				c.groupList.forEach(function(cGroup, index){
					if(cGroup.gid==group._id){
						c.groupList[index].name=group.name;
						Class.update({_id: c._id}, c, function(err, cnum){
							if(err){
								return res.send(err);
							}
						})
					}
				})
				//update the group
				Group.update({_id: group._id}, group, function(err, group1){
					if(err){
						return res.send(err);
					}
					console.log(group1);
					return res.json({status: true, reason: "Success"});
				});
			});
			
			
		});
	})
	//get specified group
	.get(function(req,res){
		Group.findById(req.params.id, function(err, group){
			if(err)
				return res.send(err);
			return res.json(group);
		});
	})
	//delete specified group
	.delete(function(req,res){
		Group.findById(req.params.id, function(err, group) {
			if (err)
				return res.send(err);
			//find all groups where studentlist contains this student.
			//then, remove this student from the group and do so with all other matching groups
			Student.find({"groups": {$elemMatch: {gid: req.params.id}}}, function(err, students){
				students.forEach(function(student){
					student.groups.forEach(function(g, index){
						if(g.gid==req.params.id){
							student.groups.splice(index, 1);
							Student.findOneAndUpdate({_id: student._id}, student, {new: true}, function(err, sUpdate){
							});
						}
					})
				})
			});
			Class.find({"groupList": {$elemMatch: {gid: req.params.id}}}, function(err, classes){
				classes.forEach(function(c){
					c.groupList.forEach(function(c1, index){
						if(c1.gid==req.params.id){
							c.groupList.splice(index, 1);
							Class.update({_id: c._id}, c, function(err, cUpdate){});
						}
					})
				})
			})
			Group.remove({_id: req.params.id}, function(err){
				if(err)
					return res.send(err);
				return res.json({status: true, reason: "Success"});
			});
		});
	});

router.route('/seatingcharts/:_id')

	.get(function(req, res){
		SeatingChart.findOne({_id: req.params._id}, function(err, chart){
			if(err)
				return res.status(500).send(err);
			return res.send(chart);
		})
	})

	.put(function(req, res){
		SeatingChart.findOne({_id: req.params._id}, function(err, sc){
			if(err)
				return res.status(500).send(err);
			sc.data = req.body.data;
			sc.name = req.body.name;
			sc.save(function(err, chart){
				if(err)
					return res.status(500).send(err);
				return res.send(chart);
			})
		})
	})

	.delete(function(req, res){
		SeatingChart.remove({_id: req.params._id}, function(err, delChart){
			if(err)
				return res.status(500).send(err);
			return res.send("Deleted");
		})
	});

router.route('/seatingcharts/')

	.get(function(req, res){
		SeatingChart.find(function(err, charts){
			if(err)
				return res.status(500).send(err);
			return charts;
		})
	})

	.post(function(req, res){
		console.log(req.body);
		var sc = new SeatingChart;
		sc.data = req.body.data;
		sc.class = req.body.class;
		sc.name = req.body.name;
		sc.save(function(err, chart){
			if(err)
				return res.status(500).send(err);
			return res.send(chart);
		})
	});

router.route('/seatingcharts/class/:_id')

	.get(function(req,res){
		SeatingChart.find({class: req.params._id}, function(err, classCharts){
			if(err)
				return res.status(500).send(err);
			return res.send(classCharts);
		})
	})

module.exports = router;