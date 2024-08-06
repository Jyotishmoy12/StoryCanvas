import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/UploadStories.css';

function UploadStories() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStories(storiesData);
    } catch (error) {
      console.error("Error fetching stories: ", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'stories'), {
        title,
        content,
        imageUrl,
        createdAt: new Date()
      });

      setTitle('');
      setContent('');
      setImage(null);
      alert('Story uploaded successfully!');
      fetchStories();
    } catch (error) {
      console.error('Error uploading story: ', error);
      alert('An error occurred while uploading the story.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteDoc(doc(db, 'stories', id));
        alert('Story deleted successfully');
        fetchStories();
      } catch (error) {
        console.error('Error deleting story: ', error);
        alert('An error occurred while deleting the story.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
      alert('An error occurred while logging out.');
    }
  };

  return (
    <div className="upload-container">
      <div className="header-actions">
        <h2>Upload and Manage Stories</h2>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter story title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story here"
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input type="file" id="image" onChange={handleImageChange} />
        </div>
        <button type="submit" className="submit-btn">Upload Story</button>
      </form>

      <div className="stories-section">
        <h3>Your Stories</h3>
        <div className="story-grid">
          {stories.map(story => (
            <div key={story.id} className="story-card" onClick={() => setSelectedStory(story)}>
              {story.imageUrl && <img src={story.imageUrl} alt={story.title} className="story-card-image" />}
              <div className="story-card-content">
                <h4 className="story-card-title">{story.title}</h4>
                <p className="story-card-description">{story.content.substring(0, 100)}...</p>
                <div className="story-card-actions">
                  <button className="btn-delete" onClick={(e) => handleDelete(story.id, e)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStory && (
        <div className="modal" onClick={() => setSelectedStory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setSelectedStory(null)}>&times;</span>
            {selectedStory.imageUrl && <img src={selectedStory.imageUrl} alt={selectedStory.title} className="modal-image" />}
            <h2 className="modal-title">{selectedStory.title}</h2>
            <p>{selectedStory.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadStories;