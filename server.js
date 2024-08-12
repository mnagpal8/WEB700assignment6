/*
********************************************************************************
*  WEB700 – Assignment 4
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Mukul Nagpal            Student ID: 147813232                Date: 6th July, 2024
*
* Online Vercel (Link): https://web-700-app-assignment4.vercel.app/
*
*******************************************************************************
*/

const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const collegeData = require('./modules/collegeData');
const exphbs = require('express-handlebars');

const app = express();

// Configure express-handlebars
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' + 
                ((url === app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('views', __dirname + '/views');
app.set('view engine', '.hbs');

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.)/, "") : route.replace(/\/(.)/, ""));    
    next();
});

// Middleware to serve static files from the views directory
app.use(express.static(path.join(__dirname, "views")));

// Middleware to serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// GET /students route
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(parseInt(req.query.course))
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => res.render("students", { message: "no results" }));
    } else {
        collegeData.getAllStudents()
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { students: data });
                } else {
                    res.render("students", { message: "no results" });
                }
            })
            .catch(err => res.render("students", { message: "no results" }));
    }
});

// GET /courses route
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            if (data.length > 0) {
                res.render("courses", { courses: data });
            } else {
                res.render("courses", { message: "no results" });
            }
        })
        .catch(err => res.render("courses", { message: "no results" }));
});

// GET /student/:studentNum route
app.get("/student/:studentNum", (req, res) => { 
    // initialize an empty object to store the values     
    let viewData = {}; 

    collegeData.getStudentByNum(req.params.studentNum).then((data) => {         
        if (data) { 
            viewData.student = data; //store student data in the "viewData" object as "student" 
        } else { 
            viewData.student = null; // set student to null if none were returned 
        } 
    }).catch((err) => { 
        viewData.student = null; // set student to null if there was an error  
    }).then(collegeData.getCourses) 
    .then((data) => { 
        viewData.courses = data; // store course data in the "viewData" object as "courses" 

        // loop through viewData.courses and once we have found the courseId that matches 
        // the student's "course" value, add a "selected" property to the matching          
        // viewData.courses object 
        for (let i = 0; i < viewData.courses.length; i++) { 
            if (viewData.courses[i].courseId == viewData.student.course) {                 
                viewData.courses[i].selected = true; 
            } 
        } 
    }).catch((err) => { 
        viewData.courses = []; // set courses to empty if there was an error 
    }).then(() => { 
        if (viewData.student == null) { // if no student - return an error             
            res.status(404).send("Student Not Found"); 
        } else { 
            res.render("student", { viewData: viewData }); // render the "student" view 
        } 
    }); 
}); 

// GET /course/:id route
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(parseInt(req.params.id))
        .then(data => {
            if (data) {
                res.render("course", { course: data }); // Render the "course" view with data
            } else {
                res.status(404).send("Course Not Found"); // No course found, send a 404 error
            }
        })
        .catch(err => {
            res.render("course", { message: "no results for course" });
    });
});

// GET /student/delete/:studentNum route
app.get("/student/delete/:studentNum", (req, res) => {
    // Extract student number from route parameters and convert to integer
    const studentNum = parseInt(req.params.studentNum, 10);

    // Call deleteStudentByNum from collegeData to delete the student
    collegeData.deleteStudentByNum(studentNum)
        .then(() => {
            // On successful deletion, redirect to the /students view
            res.redirect('/students');
        })
        .catch(err => {
            // On error, log the error and send a 500 status code with an error message
            console.error('Error deleting student:', err);
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

// GET /course/delete/:id route
app.get("/course/delete/:id", (req, res) => {
    // Extract course ID from request parameters
    const courseId = parseInt(req.params.id, 10);

    // Call deleteCourseById() with the extracted course ID
    collegeData.deleteCourseById(courseId)
        .then(() => {
            res.redirect('/courses'); // Redirect to the courses page after successful deletion
        })
        .catch(err => {
            console.error('Error deleting course:', err);
            res.status(500).send('Unable to Remove Course / Course not found');
        });
});

// GET / route
app.get("/", (req, res) => {
    res.render('home'); // Render the "home" view
});

// GET /about route
app.get("/about", (req, res) => {
    res.render('about'); // Render the "about" view
});

// GET /htmlDemo route
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo'); // Render the "htmlDemo" view
});

// GET /students/add route
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render("addStudent", { courses: data });
        })
        .catch(err => {
            console.error('Error fetching courses:', err);
            res.render("addStudent", { courses: [] });
        });
});

// POST /students/add route
app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students'); // Redirect to the students page after adding student
        })
        .catch(err => {
            console.error('Error adding student:', err);
            res.status(500).send('Error adding student'); // Handle error
        });
});

// POST /student/update route
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            res.status(500).send("Unable to update student: " + err);
        });
});

// GET /courses/add route
app.get("/courses/add", (req, res) => {
    res.render('addCourse'); 
});

// POST /courses/add route
app.post('/courses/add', (req, res) => {
    let courseData = req.body;
    for (let property in courseData) {
        if (courseData[property] === "") {
            courseData[property] = null;
        }
    }

    collegeData.addCourse(courseData)
        .then(() => {
            res.redirect('/courses'); 
        })
        .catch(err => {
            console.error('Error adding course:', err);
            res.status(500).send('Error adding course'); 
        });
});

// POST /course/update route
app.post('/course/update', (req, res) => {
    let courseData = req.body;
    for (let property in courseData) {
        if (courseData[property] === "") {
            courseData[property] = null;
        }
    }

    collegeData.updateCourse(courseData)
        .then(() => {
            res.redirect('/courses');
        })
        .catch(err => {
            res.status(500).send('Error updating course');
        });
});

app.use((req, res) => {
    res.status(404).render('404'); // Render the "404" view for unknown routes
});

app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
});
