import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import ViewOtherStories from './components/ViewOtherStories'
import Account from './components/account'
import UploadStories from './components/UploadStories'
import SignUp from './components/SignUp';
import Login from './components/Login';
import StoryDetails from './components/StoryDetails';
import OtherStoryView from './components/OtherStoryView';
import LikedStories from './components/LikedStories';
import SharedStory from './components/SharedStory'
const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view-stories" element={<ViewOtherStories />} />
          <Route path="/account" element={<Account />} />
          <Route path="/upload" element={<UploadStories />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/story/:id" element={<StoryDetails />} />
          <Route path="/other-story/:id" element={<OtherStoryView />} />
          <Route path="/liked-story/:storyId" element={<LikedStories />} />
          <Route path="/shared-story/:id" element={<SharedStory />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App