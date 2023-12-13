const { create, findAll, findById, findByChapterId, countModuleByChapterId, updateModuleById, deleteModulebyId } = require('../repositories/module.js')
const { findById: findChapterById, updateChapterById } = require('../repositories/chapter.js')
const { findByPk: findCourseById, updateCourseRepo } = require('../repositories/course')

const { ApplicationError } = require('../../error/index.js')

const createModuleService = async (payload) => {
  try {
    const { chapter_id, duration } = payload

    const { total_module_duration: totalModuleDuration, course: { id: course_id } } = await findChapterById(chapter_id)
    const total_module_duration = Number(totalModuleDuration) + Number(duration)

    const { total_duration: totalDuration } = await findCourseById(course_id)
    const total_duration = Number(totalDuration) + Number(duration)

    const { count: totalModuleByChapter } = await countModuleByChapterId(chapter_id)
    const index = Number(totalModuleByChapter) + 1

    const module = await create({ ...payload, index })
    if (module) {
      await updateChapterById({ total_module_duration }, chapter_id)
      await updateCourseRepo({ total_duration }, course_id)
    }

    return module
  } catch (error) {
    throw new ApplicationError(error.message, 500)
  }
}

const getAllModulesService = async (chapter_id) => {
  try {
    if (chapter_id) {
      const modules = await findByChapterId(chapter_id)
      return modules
    }

    const modules = await findAll()
    return modules
  } catch (error) {
    throw new ApplicationError(error.message, 500)
  }
}

const getDetailModuleService = async (id) => {
  try {
    const module = await findById(id)

    if (!module) {
      throw new ApplicationError('Module id not found', 404)
    }

    return module
  } catch (error) {
    throw new ApplicationError(error.message, error.statusCode || 500)
  }
}

const updateModuleService = async (payload, id) => {
  try {
    const module = await findById(id)
    const { chapter: { id: chapter_id }, duration } = module
    const { duration: newDuration } = payload

    const { total_module_duration: totalModuleDuration, course: { id: course_id } } = await findChapterById(chapter_id)
    const total_module_duration = Number(totalModuleDuration) - Number(duration) + Number(newDuration)

    const { total_duration: totalDuration } = await findCourseById(course_id)
    const total_duration = Number(totalDuration) - Number(duration) + Number(newDuration)

    // eslint-disable-next-line no-unused-vars
    const [_, updatedModule] = await updateModuleById(payload, id)
    if (updatedModule) {
      await updateChapterById({ total_module_duration }, chapter_id)
      await updateCourseRepo({ total_duration }, course_id)
    }

    return updatedModule
  } catch (error) {
    throw new ApplicationError(error.message, 500)
  }
}

const deleteModuleService = async (id) => {
  try {
    const module = await findById(id)
    const { chapter: { id: chapter_id }, duration } = module

    const { total_module_duration: totalModuleDuration, course: { id: course_id } } = await findChapterById(chapter_id)
    const total_module_duration = Number(totalModuleDuration) - Number(duration)

    const { total_duration: totalDuration } = await findCourseById(course_id)
    const total_duration = Number(totalDuration) - Number(duration)

    const deleted = await deleteModulebyId(id)
    if (deleted) {
      await updateChapterById({ total_module_duration }, chapter_id)
      await updateCourseRepo({ total_duration }, course_id)
    }
  } catch (error) {
    throw new ApplicationError(error.message, 500)
  }
}

module.exports = {
  createModuleService,
  getAllModulesService,
  getDetailModuleService,
  updateModuleService,
  deleteModuleService
}
