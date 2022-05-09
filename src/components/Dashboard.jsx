import { Query } from 'appwrite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, mediaCollectionId, storageBucketId } from '../api';
import './Dashboard.css';

export default function Dashboard({ user, setUser }) {
  const [selected, setSelected] = useState();
  const [items, setItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  /**
   * Load audio tracks in useEffect
   */
  useEffect(async () => {
    if (user) {
      const { documents } = await api.database.listDocuments(
        mediaCollectionId,
        [Query.equal('userId', user.$id)]
      );

      setItems(documents);
    }
  }, [user]);

  /**
   * Subscribe to realtime updates for
   * transcribed audio files
   */
  useEffect(() => {
    const unsubscribe = api.subscribe(
      [`collections.${mediaCollectionId}.documents`],
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
    return item.status == 2
      ? 'Transcribed'
      : item.status === 1
      ? 'Processing'
      : 'Uploaded';
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
      setProcessing(true);
      const file = e.target.file.files[0];
      const description = e.target.description.value;

      const uploadedFile = await api.storage.createFile(
        storageBucketId,
        'unique()',
        file
      );
      await api.database.createDocument(mediaCollectionId, 'unique()', {
        userId: user.$id,
        fileId: uploadedFile.$id,
        status: 0,
        description,
      });

      e.target.description.value = '';
      e.target.file.value = '';
    } catch (e) {
      console.log(`Error: ${e}`);
    } finally {
      setProcessing(false);
    }
  }

  function getTranscript(item) {
    return JSON.parse(item.transcripts).results.channels[0].alternatives[0]
      .transcript;
  }

  async function logout() {
    await api.account.deleteSession('current');
    setUser(null);
    navigate('/');
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="title">{user ? user.name : ''}</div>
        <div className="leave" onClick={logout}>
          Logout
        </div>
      </div>

      <div className="upload-container">
        <form className="upload-form" onSubmit={upload}>
          <div>
            Description:{' '}
            <input
              className="upload-description"
              type="text"
              name="description"
              placeholder="Enter Description"
              required
            />
          </div>

          <div>
            File: <input className="file" type="file" name="file" required />
          </div>

          <div className="upload-button">
            <button disabled={processing} type="submit">
              Upload
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-item-container">
        <table className="collection">
          <thead>
            <tr>
              <th className="description">Description</th>
              <th className="status">Status</th>
              <th className="action">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              return (
                <tr key={item['$id']}>
                  <td
                    className={
                      'dashboard-item' +
                      (selected && item['$id'] === selected.$id
                        ? ' selected'
                        : '')
                    }
                  >
                    {item.description}
                  </td>
                  <td>{getStatus(item)}</td>
                  <td>
                    {item.status === 2 ? (
                      <div onClick={() => select(item)}>View</div>
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="transcript-container">
        {selected ? (
          <>
            <span className="transcript">{getTranscript(selected)}</span>
          </>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
