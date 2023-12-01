const { detailUserServices } = require('../services/user.js')
const { verifyToken } = require('../services/auth.js')
require('dotenv').config()

const authorization = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorize' })
    }
    const authHeader = req.headers.authorization
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1]
    const user = verifyToken(token, process.env.ACCESS_TOKEN)
    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ status: 'FAIL', message: error.message })
  }
}

const onlyAdmin = async (req, res, next) => {
  try {
    const currentUser = req.user
    const userId = currentUser.id
    const user = await detailUserServices(userId)
    if (user.role !== 'admin') {
      return res.status(403).json({ status: 'FAIL', message: 'Forbidden' })
    }
    next()
  } catch (error) {
    res.status(500).json({ status: 'FAIL', message: error.message })
  }
}

module.exports = { authorization, onlyAdmin }
