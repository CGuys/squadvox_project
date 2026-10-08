const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth');

const userController = require('../controllers/userController');
const roomController = require('../controllers/roomController');
const trtcController = require('../controllers/trtcController');
const msgController = require('../controllers/msgController');
const reportController = require('../controllers/reportController');

// User Routes
router.post('/user/login', userController.login);
router.post('/user/saveInfo', authMiddleware, userController.saveInfo);
router.get('/user/getInfo', authMiddleware, userController.getInfo);

// Room Routes
router.post('/room/create', authMiddleware, roomController.createRoom);
router.get('/room/list', authMiddleware, roomController.listRooms);
router.post('/room/enter', authMiddleware, roomController.enterRoom);
router.post('/room/close', authMiddleware, roomController.closeRoom);
router.post('/room/kick', authMiddleware, roomController.kickMember);

// TRTC Routes
router.post('/trtc/getSig', authMiddleware, trtcController.getSig);

// Message Routes
router.post('/msg/send', authMiddleware, msgController.sendMessage);

// Report Routes
router.post('/report/submit', authMiddleware, reportController.submitReport);

module.exports = router;
