import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/OtherStoryView.css';

function OtherStoryView() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const storyDoc = await getDoc(doc(db, 'stories', id));
        if (storyDoc.exists()) {
          setStory({ id: storyDoc.id, ...storyDoc.data() });
        } else {
          console.log('No such story!');
          navigate('/view-stories');
        }
      } catch (error) {
        console.error("Error fetching story: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="other-story-view">
      <div className="story-container">
        <h1 className="story-title">{story.title}</h1>
        {story.imageUrl && (
          <div className="image-container">
            <img src={story.imageUrl} alt={story.title} className="story-image" />
          </div>
        )}
        <p className="story-content">{story.content}</p>
      </div>
    </div>
  );
}

export default OtherStoryView;