import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Navbar from "../components/Navbar";
import '../styles/LikedStories.css';

function LikedStories() {
  const [user] = useAuthState(auth);
  const [story, setStory] = useState(null);
  const { storyId } = useParams();

  useEffect(() => {
    if (user && storyId) {
      fetchStory();
    }
  }, [user, storyId]);

  const fetchStory = async () => {
    try {
      const storyDoc = await getDoc(doc(db, 'stories', storyId));
      if (storyDoc.exists()) {
        setStory({ id: storyDoc.id, ...storyDoc.data() });
      } else {
        console.log("No such story!");
      }
    } catch (error) {
      console.error("Error fetching story: ", error);
      alert('Error fetching story. Please try again.');
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!story) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="liked-story-container">
        <h2>{story.title}</h2>
        {story.imageUrl && <img src={story.imageUrl} alt={story.title} className="liked-story-image" />}
        <p className="liked-story-content">{story.content}</p>
      </div>
    </>
  );
}

export default LikedStories;