import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/StoryDetails.css';

function StoryDetails() {
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
          navigate('/upload');
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
    <div className="story-details">
      <div className="story-container">
        <button onClick={() => navigate('/upload')} className="back-button">
          &larr; Back to Stories
        </button>
        <h1 className="story-title">{story.title}</h1>
        {story.imageUrl && (
          <div className="image-container">
            <img src={story.imageUrl} alt={story.title} className="story-image" />
          </div>
        )}
        {story.generatedImage && (
          <div className="image-container">
            <img src={story.generatedImage} alt="AI Generated" className="story-image ai-generated" />
            <span className="ai-label">AI Generated</span>
          </div>
        )}
        <p className="story-content">{story.content}</p>
        {story.generatedContent && (
          <div className="ai-generated-content">
            <h2>AI Generated Content</h2>
            <p>{story.generatedContent}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryDetails;