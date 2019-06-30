require('dotenv').config();

const moment = require('moment');
const schedule = require('node-schedule');
const twilio = require('twilio');
var express = require('express');

var router = express.Router();

const jack = process.env.JACK;
const fromNumber = process.env.CJA_BOARD_BROADCAST_NUMBER;
const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const notify = client.notify.services(process.env.CJA_BOARD_BROADCAST_SERVICE_SID);

const broadcastSuccessMessage = 'Boom! Message broadcast to all subscribers.\n'
const broadcastFailMessage = 'Well this is awkward. Your message failed to send, try again later.\n'

function broadcastMessage() {
  notify.notifications.create({
    tag: 'all',
    body: body
  }).then((response) => {
    console.log(broadcastSuccessMessage, response);
  }).catch(err => {
    console.log(broadcastFailMessage, err);
  })
}

function sendMessage(body) {
  client.messages
    .create({
      body: body,
      from: fromNumber,
      to: jack
    })
    .then(message => console.log(message.sid));
}
function scheduleMessage(dateString, body) {
  const date = dateString ? moment(dateString) : moment();
  const sendDate = date.add(3, 'minutes');
  const content = body ? body : `This message should be received at ${sendDate.format('H:mm')}.`;
  schedule.scheduleJob(sendDate.toDate(), sendMessage(content));
}
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/send', function (req, res, next) {
  scheduleMessage();
});

module.exports = router;
