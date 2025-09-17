const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware")
const chatController = require("../controllers/chat.controller")


const router = express.Router();

/* POST /api/chat/ */
router.post('/', authMiddleware.authUser, chatController.createChat)


/* GET /api/chat/ */
router.get('/', authMiddleware.authUser, chatController.getChats)


/* GET /api/chat/messages/:id */
router.get('/messages/:id', authMiddleware.authUser, chatController.getMessages)

/* PATCH /api/chat/:id */
router.patch('/:id', authMiddleware.authUser, chatController.renameChat)

/* DELETE /api/chat/:id */
router.delete('/:id', authMiddleware.authUser, chatController.deleteChat)


module.exports = router;