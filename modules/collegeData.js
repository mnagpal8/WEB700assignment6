/*
********************************************************************************
*  WEB700 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Mukul Nagpal            Student ID: 147813232                Date: 26th July, 2024
*
*******************************************************************************
*/

const Sequelize = require('sequelize'); 
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'EDMPT7p0YoQH', {
    host: 'ep-black-cake-a59i9t4a.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query:{ raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define the relationship
Course.hasMany(Student, { foreignKey: 'course' });

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
};

exports.getAllStudents = () => {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

exports.getStudentsByCourse = (course) => {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                course: course
            }
        })
        .then(data => resolve(data))
        .catch(() => reject("no results returned"));
    });
};

exports.getStudentByNum = (num) => {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
        .then(data => resolve(data[0]))
        .catch(() => reject("no results returned"));
    });
};

exports.getCourses = () => {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
    });
};

exports.getCourseById = (id) => {
    return new Promise((resolve, reject) => {
        Course.findAll({
            where: {
                courseId: id
            }
        })
        .then(courses => resolve(courses[0]))
        .catch(() => reject("no results returned"));
    });
};

exports.addStudent = (studentData) => {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;
        for (const key in studentData) {
            if (studentData[key] === "") studentData[key] = null;
        }

        Student.create(studentData)
            .then(() => resolve())
            .catch(() => reject("unable to create student"));
    });
};

exports.updateStudent = (studentData) => {
    return new Promise((resolve, reject) => {
        studentData.TA = (studentData.TA) ? true : false;
        for (const key in studentData) {
            if (studentData[key] === "") studentData[key] = null;
        }

        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
        .then(() => resolve())
        .catch(() => reject("unable to update student"));
    });
};

exports.addCourse = (courseData) => {
  return new Promise((resolve, reject) => {
      for (const key in courseData) {
          if (courseData[key] === "") courseData[key] = null;
      }

      Course.create(courseData)
          .then(() => resolve())
          .catch(() => reject("unable to create course"));
  });
};


exports.updateCourse = (courseData) => {
  return new Promise((resolve, reject) => {
      for (const key in courseData) {
          if (courseData[key] === "") courseData[key] = null;
      }

      Course.update(courseData, {
          where: {
              courseId: courseData.courseId
          }
      })
      .then(() => resolve())
      .catch(() => reject("unable to update course"));
  });
};


exports.deleteCourseById = (id) => {
  return new Promise((resolve, reject) => {
      Course.destroy({
          where: {
              courseId: id
          }
      })
      .then(() => resolve())
      .catch(() => reject("unable to delete course"));
  });
};

exports.deleteStudentByNum = (studentNum) => {
  return new Promise((resolve, reject) => {
      Student.destroy({
          where: {
              studentNum: studentNum
          }
      })
      .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
              resolve(); // Student was deleted successfully
          } else {
              reject("no student found with the provided number");
          }
      })
      .catch(() => reject("unable to delete student"));
  });
};


