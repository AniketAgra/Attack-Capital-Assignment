const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');


async function createChat(req, res) {

    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    });

    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }
    });

}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user._id });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages
    })

}

async function renameChat(req, res) {
    const user = req.user;
    const chatId = req.params.id;
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
    }

    const chat = await chatModel.findOneAndUpdate(
        { _id: chatId, user: user._id },
        { title: title.trim(), lastActivity: Date.now() },
        { new: true }
    );

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    return res.status(200).json({
        message: 'Chat renamed successfully',
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }
    });
}

async function deleteChat(req, res) {
    const user = req.user;
    const chatId = req.params.id;

    const chat = await chatModel.findOneAndDelete({ _id: chatId, user: user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Also delete associated messages
    await messageModel.deleteMany({ chat: chat._id });

    return res.status(200).json({ message: 'Chat deleted successfully' });
}

module.exports = {
    createChat,
    getChats,
    getMessages,
    renameChat,
    deleteChat
};