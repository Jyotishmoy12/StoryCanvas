import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/ViewOtherStories.css';
import Navbar from "../components/Navbar"

function ViewOtherStories() {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllStories();
  }, []);

  const fetchAllStories = async () => {
    try {
      const q = query(
        collection(db, 'stories'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Fetched stories:", storiesData);
      setStories(storiesData);
    } catch (error) {
      console.error("Error fetching stories: ", error);
      alert('Error fetching stories. Please try again.');
    }
  };

  const handleStoryClick = (storyId) => {
    navigate(`/other-story/${storyId}`);
  };

  return (
    <>
      <Navbar/>
      <div className="view-stories-container">
        <div className="header-actions">
          <h2>View Stories</h2>
        </div>
        <div className="stories-section">
          <div className="story-grid">
            {stories.map(story => (
              <div key={story.id} className="story-card" onClick={() => handleStoryClick(story.id)}>
                {story.imageUrl && <img src={story.imageUrl} alt={story.title} className="story-card-image" />}
                <div className="story-card-content">
                  <h4 className="story-card-title">{story.title}</h4>
                  <p className="story-card-description">{story.content.substring(0, 100)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewOtherStories;