import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../styles/UploadStories.css';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Stability AI API key
const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY;

function UploadStories() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserStories(user.uid);
      } else {
        setUserStories([]);
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserStories = async (userId) => {
    try {
      const q = query(
        collection(db, 'stories'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserStories(storiesData);
    } catch (error) {
      console.error("Error fetching user stories: ", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add a flag to prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    if (!auth.currentUser) {
      toast.error('You must be logged in to upload a story.');
      setIsSubmitting(false);
      setIsUploading(false);
      return;
    } 
  
    if (!title || !content) {
      toast.warning('Please fill in all fields');
      setIsSubmitting(false);
      setIsUploading(false);
      return;
    }
  
    try {
      console.log('Starting story upload...');
      let imageUrl = '';
      if (image) {
        // For uploaded images
        const imageRef = ref(storage, `images/${auth.currentUser.uid}_${Date.now()}_${image.name}`);
        const uploadTask = uploadBytes(imageRef, image, {
          customMetadata: { 'contentType': image.type },
          onProgress: (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          }
        });
        await uploadTask;
        imageUrl = await getDownloadURL(imageRef);
      } else if (generatedImage) {
        // For AI-generated images
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `images/${auth.currentUser.uid}_${Date.now()}_ai_generated.png`);
        await uploadBytes(imageRef, blob, { contentType: 'image/png' });
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const newStory = {
        title,
        content,
        imageUrl,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        isAIGenerated: !!generatedImage,
        generatedContent: content.startsWith('AI Generated Story') ? content : null
      };
  
      console.log('Adding new story to Firestore...');
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      console.log('Story added successfully. Document ID:', docRef.id);
  
      setUserStories(prevStories => [{id: docRef.id, ...newStory}, ...prevStories]);
  
      // Reset states after successful upload
      setTitle('');
      setContent('');
      setImage(null);
      setGeneratedImage(null);
      setUploadProgress(0);
      toast.success('Story uploaded successfully!');
    } catch (error) {
      console.error('Error uploading story: ', error);
      toast.error('An error occurred while uploading the story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteDoc(doc(db, 'stories', id));
        setUserStories(prevStories => prevStories.filter(story => story.id !== id));
        toast.success('Story deleted successfully');
      } catch (error) {
        console.error('Error deleting story: ', error);
        toast.error('An error occurred while deleting the story.');
      }
    }
  };

  const handleStoryClick = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt for the AI.');
      return;
    }

    setGeneratingStory(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const generatedText = response.text();
      
      setTitle('');
      setContent(generatedText);
      setShowAIPrompt(false);
    } catch (error) {
      console.error('Error generating story with AI:', error);
      alert('An error occurred while generating the story. Please try again.');
    } finally {
      setGeneratingStory(false);
    }
  };

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) {
      alert('Please enter a prompt for the image generation.');
      return;
    }

    setGeneratingImage(true);
    try {
      const response = await fetch(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${STABILITY_API_KEY}`,
          },
          body: JSON.stringify({
            text_prompts: [
              {
                text: imagePrompt,
              },
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }

      const responseJSON = await response.json();
      const base64Image = responseJSON.artifacts[0].base64;
      setGeneratedImage(`data:image/png;base64,${base64Image}`);
      setShowImagePrompt(false);
    } catch (error) {
      console.error('Error generating image with AI:', error);
      alert('An error occurred while generating the image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleUseGeneratedImage = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], "ai-generated-image.png", { type: "image/png" });
        setImage(file);
        setGeneratedImage(null);
      } catch (error) {
        console.error('Error using generated image:', error);
        alert('An error occurred while using the generated image. Please try again.');
      }
    }
  };

  return (
    <div className="upload-page">
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="upload-container">
        <div className="header-actions">
          <h2>Upload and Manage Stories</h2>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        <div className="content-wrapper">
          <form className="upload-form glassmorphism" onSubmit={handleSubmit}>
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
              <label htmlFor="image" className="file-input-label">
                Choose Image
                <input type="file" id="image" onChange={handleImageChange} />
              </label>
              {image && <span className="file-name">{image.name}</span>}
              {generatedImage && (
                <div className="generated-image-preview">
                  <img src={generatedImage} alt="AI Generated" />
                  <button className="use-image" onClick={handleUseGeneratedImage}>Use This Image</button>
                </div>
              )}
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading the story please wait...' : 'Upload Story'}
          </button>
          {isUploading && (
            <div className="upload-loader">
              <div className="loader-spinner"></div>
              <span>Uploading story...</span>
            </div>
          )}
          </form>

          <div className="stories-section">
            <h3>Your Stories</h3>
            {userStories.length > 0 ? (
              <div className="story-grid">
                {userStories.map(story => (
                  <div key={story.id} className="story-card glassmorphism" onClick={() => handleStoryClick(story.id)}>
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
            ) : (
              <p>You haven't uploaded any stories yet.</p>
            )}
          </div>
        </div>

        {/* AI Text Generation Button */}
        <button className="ai-float-button text-ai" onClick={() => setShowAIPrompt(true)}>
          AI Text
        </button>

        {/* AI Image Generation Button */}
        <button className="ai-float-button image-ai" onClick={() => setShowImagePrompt(true)}>
          AI Image
        </button>

        {/* AI Text Prompt Modal */}
        {showAIPrompt && (
          <div className="ai-prompt-modal">
            <div className="ai-prompt-content">
              <h2>Generate a Story with AI</h2>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="Enter a prompt for the AI..."
              />
              <div className="ai-prompt-actions">
                <button onClick={handleAIGenerate} disabled={generatingStory}>
                  {generatingStory ? 'Generating...' : 'Generate'}
                </button>
                <button onClick={() => setShowAIPrompt(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* AI Image Prompt Modal */}
        {showImagePrompt && (
          <div className="ai-prompt-modal">
            <div className="ai-prompt-content">
              <h2>Generate an Image with AI</h2>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
              />
              <div className="ai-prompt-actions">
                <button onClick={handleImageGenerate} disabled={generatingImage}>
                  {generatingImage ? 'Generating...' : 'Generate Image'}
                </button>
                <button onClick={() => setShowImagePrompt(false)}>Cancel</button>
              </div>
              {generatingImage && (
                <div className="generating-indicator">
                  <span>AI is creating your image...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadStories;