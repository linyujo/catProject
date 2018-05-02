import Message from '../models/message';
import cuid from 'cuid';
import sanitizeHtml from 'sanitize-html';

/**
 * 會員在一篇文章底下留言
 * 參數:x-www-form-urlencoded:
 * Message.postCuid,
 * Message.member,
 * Message.tag,
 * Message.message,
 * @returns {res.status(200).send({message: '成功訊息'})}
 */
export function postMessage (req, res) {
    const newMessage = new Message(req.body);
    newMessage.message =  sanitizeHtml(newMessage.message);
    // 取代_id的亂數
    newMessage.cuid = cuid();
    console.log('newMessage:',newMessage);
    newMessage
        .save()
        .then(() => {
            res.status(200).json({
                message: '新增message成功',
                cuid: newMessage.cuid,
                dateAdded: newMessage.dateAdded
            });
        })
        .catch(err => {
            res.status(500).json({message: `api/services/message postMessage錯誤`});
            console.log(err);
        });
}

export function getMessages (req, res) {
    Message
        .find({postCuid: req.params.postCuid}, {_id:0, __v:0})
        .sort({lastModify: 1}) // 預設最舊的的排在前面
        .then((messages) => {
            res.status(200).json({
                messages: messages
            });
        })
        .catch(err => {
            res.status(500);
            console.log(err);
        });
}