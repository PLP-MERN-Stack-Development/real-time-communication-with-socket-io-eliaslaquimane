import React, { useState } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';

const Sign = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="sign-container">
      <div className="toggle-buttons">
        <button
          onClick={() => setIsLogin(true)}
          className={isLogin ? 'active' : ''}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={!isLogin ? 'active' : ''}
        >
          Sign Up
        </button>
      </div>
      <div className="form-section">
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default Sign;
