import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, orderBy, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/ViewOtherStories.css';
import Navbar from "../components/Navbar"

function ViewOtherStories() {
  const [stories, setStories] = useState([]);
  const [user] = useAuthState(auth);
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
        ...doc.data(),
        likes: doc.data().likes || []
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

  const handleLike = async (e, storyId) => {
    e.stopPropagation(); // Prevent triggering handleStoryClick
    if (!user) {
      alert('Please log in to like stories.');
      return;
    }

    try {
      const storyRef = doc(db, 'stories', storyId);
      const story = stories.find(s => s.id === storyId);
      
      if (story.likes.includes(user.uid)) {
        // Unlike
        await updateDoc(storyRef, {
          likes: arrayRemove(user.uid)
        });
        setStories(stories.map(s => 
          s.id === storyId ? { ...s, likes: s.likes.filter(id => id !== user.uid) } : s
        ));
      } else {
        // Like
        await updateDoc(storyRef, {
          likes: arrayUnion(user.uid)
        });
        setStories(stories.map(s => 
          s.id === storyId ? { ...s, likes: [...s.likes, user.uid] } : s
        ));
      }
    } catch (error) {
      console.error("Error updating like: ", error);
      alert('Error updating like. Please try again.');
    }
  };

  const handleShare=(e, storyId)=>{
    e.stopPropagation();
    const shareLink=`${window.location.origin}/shared-story/${storyId}`;
    if(navigator.share){
      navigator.share({
        title: 'Check out the story',
        url: shareLink
      }).then(()=>{
        console.log('Shared successfully');
      })
      .catch((error)=>{
        console.error("Error sharing. Please try again", error);
      });
    }else{
      navigator.clipboard.writeText(shareLink).then(()=>{
        alert('Link copied to clipboard');
      })
      .catch((error)=>{
        console.error("failed to copy", error)
      })
    }
  }

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
              <div key={story.id} className="story-card">
                <div onClick={() => handleStoryClick(story.id)}>
                  {story.imageUrl && <img src={story.imageUrl} alt={story.title} className="story-card-image" />}
                  <div className="story-card-content">
                    <h4 className="story-card-title">{story.title}</h4>
                    <p className="story-card-description">{story.content.substring(0, 100)}...</p>
                  </div>
                </div>
                <div className="story-card-actions">
                  <button 
                    onClick={(e) => handleLike(e, story.id)}
                    className={`like-button ${user && story.likes.includes(user.uid) ? 'liked' : ''}`}
                  >
                    {user && story.likes.includes(user.uid) ? 'Unlike' : 'Like'} ({story.likes.length})
                  </button>
                  <button 
                    onClick={(e) => handleShare(e, story.id)}
                    className="share-button"
                  >
                    Share
                  </button>
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