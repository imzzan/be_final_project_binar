const { detailCourseServices } = require('../services/course')

const isCourseExist = async (req, res, next) => {
  try {
    const { id } = req.params
    const course = await detailCourseServices(id)

    req.course = course
    next()
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'FAIL',
      message: error.message
    })
  }
}

const isCourseExistInPayload = async (req, res, next) => {
  try {
    const { course_id: id } = req.body
    await detailCourseServices(id)

    next()
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'FAIL',
      message: error.message
    })
  }
}

module.exports = {
  isCourseExist,
  isCourseExistInPayload
}
