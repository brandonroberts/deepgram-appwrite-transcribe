import { Query } from 'appwrite';
import { useEffect, useState } from 'react';
import { api } from '../api';
import './Dashboard.css';

export default function Dashboard({ user }) {
  const [selected, setSelected] = useState('');
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
    const unsubscribe = api.subscribe([''], (data) => {});

    return () => {
      unsubscribe();
    };
  }, []);

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

      <div className="dashboard-item-container">
        {items.map((item) => {
          return (
            <div key={item['$id']}>
              <div
                className={
                  'dashboard-item' +
                  (item['$id'] === selected ? ' selected' : '')
                }
              >
                {item.description}
                <img src={`https://picsum.photos/seed/${item.$id}/200/200`} />
                {item.status == 2 ? 'Transcribed' : item.status === 1 ? 'Processing' : 'Uploaded'}
              </div>
            </div>
          );
        })}
      </div>

      {/* <form className="dashboard-form" onSubmit={vote}>
        <button disabled={!selected} type="submit">Vote</button>
      </form> */}
    </div>
  );
}
