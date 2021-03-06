import { Query } from 'appwrite';
import { useEffect, useState } from 'react';
import './Dashboard.css';
import DashboardHeader from './DashboardHeader';

export default function Dashboard({ user, setUser }) {
  const [selected, setSelected] = useState();
  const [items, setItems] = useState([]);
  const [processing, setProcessing] = useState(false);

  /**
   * Load audio tracks in useEffect
   */
  useEffect(async () => {

  }, [user]);

  /**
   * Subscribe to realtime updates for
   * transcribed audio files
   */
  useEffect(() => {

  }, []);

  function select(item) {
    if (item !== selected) {
      setSelected(item);
    } else {
      setSelected(null);
    }
  }

  /**
   * Get status of transcript processing
   * 
   * @param {*} item 
   * @returns 
   */
  function getStatus(item) {
    if (item.status === 2) {
      return 'Transcribed';
    } else if (item.status === 1) {
      return 'Processing';
    } else {
      return 'Uploaded';
    }
  }

  /**
   * Upload audio file to storage
   * and create a new media document
   * @param {} e 
   */
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

      e.target.description.value = '';
      e.target.file.value = '';
    } catch (e) {
      console.log(`Error: ${e}`);
    } finally {
      setProcessing(false);
    }
  }

  /**
   * Get transcript for audio file
   * @param {} item 
   * @returns 
   */
  function getTranscript(item) {
    return '';
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} setUser={setUser} />

      <div className="upload-container">
        <form className="upload-form" onSubmit={upload}>
          <div>
            Description:
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
          <span className="transcript">{getTranscript(selected)}</span>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
