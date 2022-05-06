const sdk = require("node-appwrite");
const { Deepgram } = require('@deepgram/sdk');

/*
  'req' variable has:
    'headers' - object with request headers
    'payload' - object with request body data
    'env' - object with environment variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
*/

module.exports = async function (req, res) {
  const client = new sdk.Client();

  // You can remove services you don't use
  let database = new sdk.Database(client);
  let storage = new sdk.Storage(client);

  if (
    !req.env['APPWRITE_FUNCTION_ENDPOINT'] ||
    !req.env['APPWRITE_FUNCTION_API_KEY']
  ) {
    console.warn("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    client
      .setEndpoint(req.env['APPWRITE_FUNCTION_ENDPOINT'])
      .setProject(req.env['APPWRITE_FUNCTION_PROJECT_ID'])
      .setKey(req.env['APPWRITE_FUNCTION_API_KEY'])
      .setSelfSigned(true);
  }

  // deepgram client
  const deepgram = new Deepgram(req.env['DEEPGRAM_API_KEY']);

  // use document data to get file id
  const eventData = JSON.parse(req.env['APPWRITE_FUNCTION_EVENT_DATA']);

  // update document for processing
  await database.updateDocument(eventData.$collection, eventData.$id, {
    ...eventData,
    status: 1
  });
  
  // get file from storage
  const fileInfo = await storage.getFile('audio', eventData.fileId);
  const file = await storage.getFileView(eventData.$collection, eventData.fileId);

  // transcribe file using Deepgram
  const transcriptData = await deepgram.transcription.preRecorded({
    stream: file,
    mimetype: fileInfo.mimeType,
  });

  // update document with transcription information
  await database.updateDocument(eventData.$collection, eventData.$id, {
    ...eventData,
    transcripts: JSON.stringify(transcriptData),
    status: 2
  });
  
  res.json({
    success: true
  });
};
