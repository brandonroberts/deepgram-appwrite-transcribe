import json, asyncio
from appwrite.client import Client
from deepgram import Deepgram

# You can remove imports of services you don't use
from appwrite.services.database import Database
from appwrite.services.storage import Storage

"""
  'req' variable has:
    'headers' - object with request headers
    'payload' - object with request body data
    'env' - object with environment variables

  'res' variable has:
    'send(text, status)' - function to return text response. Status code defaults to 200
    'json(obj, status)' - function to return JSON response. Status code defaults to 200

  If an error is thrown, a response with code 500 will be returned.
"""

def main(req, res):
  client = Client()

  # You can remove services you don't use
  database = Database(client)
  storage = Storage(client)

  if not req.env.get('APPWRITE_FUNCTION_ENDPOINT') or not req.env.get('APPWRITE_FUNCTION_API_KEY'):
    print('Environment variables are not set. Function cannot use Appwrite SDK.')
  else:
    (
    client
      .set_endpoint(req.env.get('APPWRITE_FUNCTION_ENDPOINT', None))
      .set_project(req.env.get('APPWRITE_FUNCTION_PROJECT_ID', None))
      .set_key(req.env.get('APPWRITE_FUNCTION_API_KEY', None))
      .set_self_signed(True)
    )

  # deepgram client
  dg_client = Deepgram(req.env.get('DEEPGRAM_API_KEY'))

  # use document data to get file id
  event_data = json.loads(req.env.get('APPWRITE_FUNCTION_EVENT_DATA'))

  # update document for processing
  doc = event_data.copy()
  doc['status'] = 1
  result = database.update_document(event_data['$collection'], event_data['$id'], doc)

  # get file from storage
  file_info = storage.get_file('audio', event_data['fileId'])
  file = storage.get_file_view(event_data['$collection'], event_data['fileId'])

  # transcribe file using Deepgram
  response = asyncio.run(dg_client.transcription.prerecorded({
    'buffer': file,
    'mimetype': file_info['mimeType'],
  }))

  # update document with transcription information
  doc = result.copy()
  doc['transcripts'] = json.dumps(response)
  doc['status'] = 2
  result = database.update_document(event_data['$collection'], event_data['$id'], doc)

  return res.json({
    'success': True
  })