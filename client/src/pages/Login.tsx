import { useState, FormEvent, ChangeEvent } from "react";
import Auth from '../utils/auth.js';

import { login } from "../api/authAPI";

interface LoginData {
  username: string;
  password: string;
}

const Login = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      alert("Both fields are required!");
      return;
    }

    try {
      const data = await login(loginData);
      Auth.login(data.token);
    } catch (err) {
      console.error('Failed to login', err);
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={loginData.username}
          onChange={handleChange}
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={loginData.password}
          onChange={handleChange}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default Login;