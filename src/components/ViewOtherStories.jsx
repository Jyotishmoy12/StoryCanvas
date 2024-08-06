import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';

function ViewOtherStories() {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const storiesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setStories(storiesData);
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteDoc(doc(db, 'stories', id));
        alert('Story deleted successfully');
        fetchStories();
        if (selectedStory && selectedStory.id === id) {
          setSelectedStory(null);
        }
      } catch (error) {
        console.error('Error deleting story: ', error);
        alert('An error occurred while deleting the story.');
      }
    }
  };

  const handleLogout = () => {
    // Implement logout functionality here
    alert('Logout functionality to be implemented');
  };

  return (
    <div className="container">
      <h2>View Stories</h2>
      <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      <div className="story-cards">
        {stories.map(story => (
          <div key={story.id} className="story-card" onClick={() => handleStoryClick(story)}>
            {story.imageUrl && <img src={story.imageUrl} alt={story.title} />}
            <div className="story-card-content">
              <h3>{story.title}</h3>
              <p>{story.content.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>
      {selectedStory && (
        <div className="story-detail">
          <h2>{selectedStory.title}</h2>
          {selectedStory.imageUrl && <img src={selectedStory.imageUrl} alt={selectedStory.title} />}
          <p>{selectedStory.content}</p>
          <button className="btn btn-close" onClick={() => setSelectedStory(null)}>Close</button>
          <button className="btn btn-delete" onClick={() => handleDelete(selectedStory.id)}>Delete Story</button>
        </div>
      )}
    </div>
  );
}

export default ViewOtherStories;