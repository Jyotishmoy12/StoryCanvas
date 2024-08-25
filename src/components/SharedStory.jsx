import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/SharedStory.css'; // Make sure to create this CSS file

function SharedStory() {
  const [story, setStory] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchStory = async () => {
      const storyDoc = await getDoc(doc(db, 'stories', id));
      if (storyDoc.exists()) {
        setStory({ id: storyDoc.id, ...storyDoc.data() });
      } else {
        console.log("No such story!");
      }
    };

    fetchStory();
  }, [id]);

  if (!story) return <div className="loading">Loading...</div>;

  return (
    <div className="shared-story-container">
      <div className="shared-story">
        <h1 className="story-title">{story.title}</h1>
        {story.imageUrl && (
          <div className="story-image-container">
            <img src={story.imageUrl} alt={story.title} className="story-image" />
          </div>
        )}
        <div className="story-content">
          <p>{story.content}</p>
        </div>
      </div>
    </div>
  );
}

export default SharedStory;