import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/OtherStoryView.css';

function OtherStoryView() {
  const [story, setStory] = useState(null);
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
      }
    };

    fetchStory();
  }, [id, navigate]);

  if (!story) {
    return <div>Loading...</div>;
  }

  return (
    <div className="other-story-view">
      <h1>{story.title}</h1>
      {story.imageUrl && <img src={story.imageUrl} alt={story.title} className="story-image" />}
      <p className="story-content">{story.content}</p>
    </div>
  );
}

export default OtherStoryView;