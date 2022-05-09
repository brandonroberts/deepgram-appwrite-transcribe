import { Query } from 'appwrite';
import { useEffect, useState } from 'react';
import { api } from '../api';
import './Dashboard.css';

export default function Dashboard({ user }) {
  const [selected, setSelected] = useState();
  const [items, setItems] = useState([]);

  /**
   * Load audio tracks in useEffect
   */
  useEffect(async () => {
    if (user) {
      const { documents } = await api.database.listDocuments('audio', [
        Query.equal('userId', user.$id),
      ]);

      setItems(documents);
    }
  }, [user]);

  /**
   * Subscribe to realtime updates for
   * transcribed audio files
   */
  useEffect(() => {
    const unsubscribe = api.subscribe(
      ['collections.audio.documents'],
      (data) => {
        if (data.event === 'database.documents.create') {
          const item = data.payload;

          setItems((prevItems) => [...prevItems, item]);
        }

        if (data.event === 'database.documents.update') {
          const item = data.payload;

          setItems((prevItems) =>
            prevItems.map((prevItem) =>
              prevItem.$id === item.$id ? item : prevItem
            )
          );
        }

        if (data.event === 'database.documents.delete') {
          const item = data.payload;

          setItems((prevItems) =>
            prevItems.filter((prevItem) => prevItem.$id !== item.$id)
          );
        }        
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  function select(item) {
    setSelected(item);
  }

  function getStatus(item) {
    return item.status == 2 ? (
      <div>
        Transcribed
        <div onClick={() => select(item)}>View</div>
      </div>
    ) : item.status === 1 ? (
      'Processing'
    ) : (
      'Uploaded'
    )
  }

  async function upload(e) {
    e.preventDefault();

    /**
     * Upload the file to Appwrite
     * and get the file ID
     * Add the file to the audio collection
     * with uploaded status of 0
     */
    try {
      const file = e.target.file.files[0];
      const description = e.target.description.value;

      const uploadedFile = await api.storage.createFile(
        'audio',
        'unique()',
        file
      );
      await api.database.createDocument('audio', 'unique()', {
        userId: user.$id,
        fileId: uploadedFile.$id,
        status: 0,
        description,
      });

      e.target.description.value = '';
      e.target.file.value = '';
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }

  return (
    <div className="dashboard-container">
      <span className="name">Hello {user ? user.name : ''}</span>
      <span className="instructions">Please select a file to upload</span>
      <form className="upload-form" onSubmit={upload}>
        <div>
          Description:{' '}
          <input
            type="text"
            name="description"
            placeholder="Enter Description"
            required
          />
        </div>

        <div>
          File: <input type="file" name="file" required />
        </div>
        <button type="submit">Upload</button>
      </form>

      <div>
        {selected ? (
          <>
            <span className="transcript">
              {
                JSON.parse(selected.transcripts).results.channels[0]
                  .alternatives[0].transcript
              }
            </span>
          </>
        ) : (
          ''
        )}
      </div>      

      <div className="dashboard-item-container">
        {items.map((item) => {
          return (
            <div key={item['$id']}>
              <div
                className={
                  'dashboard-item' +
                  (selected && item['$id'] === selected.$id ? ' selected' : '')
                }
              >
                {item.description}
                <img src={`https://picsum.photos/seed/${item.$id}/200/200`} />
                {getStatus(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
