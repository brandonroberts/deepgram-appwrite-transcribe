const sdk = require("node-appwrite");

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
  let functions = new sdk.Functions(client);
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

  // use document data to get file id
  const eventData = JSON.parse(req.env['APPWRITE_FUNCTION_EVENT_DATA']);

  // update document for processing
  await database.updateDocument(eventData.$collection, eventData.$id, {
    ...eventData,
    status: 1
  });
  
  // get file from storage
  const file = await storage.getFileView(eventData.$collection, eventData.fileId);

  setTimeout(async() => {
    // transcribe file
    
    // update document with transcription
    await database.updateDocument(eventData.$collection, eventData.$id, {
      ...eventData,
      status: 2
    });
    
    res.json({
      success: true
    });

  }, 3000);
};
