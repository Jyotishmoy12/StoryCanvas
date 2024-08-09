import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/OtherStoryView.css';

function OtherStoryView() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [user] = useAuthState(auth);
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to comment.');
      return;
    }
    if (!comment.trim()) return;

    try {
      const storyRef = doc(db, 'stories', id);
      const newComment = {
        id: Date.now().toString(), // Use timestamp as a unique ID
        text: comment,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        createdAt: Timestamp.now()
      };

      await updateDoc(storyRef, {
        comments: arrayUnion(newComment)
      });

      // Refresh the story data to include the new comment
      const updatedStoryDoc = await getDoc(storyRef);
      setStory({ id: updatedStoryDoc.id, ...updatedStoryDoc.data() });
      setComment('');
    } catch (error) {
      console.error("Error adding comment: ", error);
      alert('Error adding comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentToDelete) => {
    if (!user || user.uid !== commentToDelete.userId) {
      alert('You can only delete your own comments.');
      return;
    }

    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, {
        comments: arrayRemove(commentToDelete)
      });

      // Refresh the story data to reflect the deleted comment
      const updatedStoryDoc = await getDoc(storyRef);
      setStory({ id: updatedStoryDoc.id, ...updatedStoryDoc.data() });
    } catch (error) {
      console.error("Error deleting comment: ", error);
      alert('Error deleting comment. Please try again.');
    }
  };

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

        <div className="comment-section">
          <h2>Comments</h2>
          {story.comments && story.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <strong>{comment.userName}</strong>
                <small>{comment.createdAt.toDate().toLocaleString()}</small>
              </div>
              <p>{comment.text}</p>
              {user && user.uid === comment.userId && (
                <button onClick={() => handleDeleteComment(comment)} className="delete-comment">
                  Delete
                </button>
              )}
            </div>
          ))}

          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
              <button type="submit">Post Comment</button>
            </form>
          ) : (
            <p>Please log in to comment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtherStoryView;