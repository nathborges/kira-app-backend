require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const app = express();
app.use(bodyParser.json());

const port = 3333;

const assistant = new AssistantV2({
    version: '2021-11-27',
    authenticator: new IamAuthenticator({
      apikey: process.env.API_KEY,
    }),
    serviceUrl: process.env.WATSON_URL,
  });

app.get('/new-session', async function(req, res) {
    var session = await assistant.createSession({
        assistantId: process.env.ASSISTANT_ID,
    }, (res) => {
        return res;
    });

    return res.status(200).json({sessionId: session.result.session_id});
});

app.post('/message', async function(req, res) {
    var assistantId = process.env.ASSISTANT_ID || '12f5fef5-da51-4456-b2af-0dabc839c984';

    var payload = {
        assistantId: assistantId,
        input: {}
    };

    if (req.body) {

        if (req.body.input) {
            payload.input = req.body.input;
        }
        
        if (req.body.sessionId) {
            payload.sessionId = req.body.sessionId;
        }

        var response = await assistant.message(payload, function(err, data) {
            var returnObject = null;
            if (err) {
                console.error(JSON.stringify(err, null, 2));
                returnObject = res.status(err.code || 500).json(err);
            } else {
                returnObject = res.json(data);
            }
            
            return returnObject;
        }).catch((err) => {
            return res.status(err.status).json({"message": err.message}); 
        });

        return res.status(200).json(response);
    }
});

app.delete('/delete-session', async function(req, res) {
    var assistantId = process.env.ASSISTANT_ID;

    var payload = {
        assistantId: assistantId
    };

    if (req.body) {
        if (req.body.sessionId) {
            payload.sessionId = req.body.sessionId;
        }

        var response = await assistant.deleteSession(payload, (err, data) => {
            var returnObject = null;
            if (err) {
                console.error(JSON.stringify(err, null, 2));
                returnObject = res.status(err.code || 500).json(err);
            } else {
                returnObject = res.json(data);
            }
            
            return returnObject;
        }).catch((err) => {
            var err = {
                message: "Sessão não existe",
            }
            return res.status(400).json(err); 
        });

        return res.status(200).json(response);
    }
});

app.listen(port, () => console.log(`Running on port ${port}`));