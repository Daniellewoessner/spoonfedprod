import { JwtPayload, jwtDecode } from "jwt-decode";

// Define storage keys
export const StorageKeys = {
  savedRecipes: (userId: string) => `savedRecipes_${userId}`,
  userProfile: (userId: string) => `userProfile_${userId}`,
  token: 'id_token',
  username: 'username',
  userId: 'userId'
};

class AuthService {
  getProfile() {
    return jwtDecode(this.getToken());
  }

  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (err) {
      return true;
    }
  }

  getToken(): string {
    return sessionStorage.getItem(StorageKeys.token) || "";
  }

  getUserId(): string {
    const storedUserId = sessionStorage.getItem(StorageKeys.userId);
    if (storedUserId) return storedUserId;
    
    // Fallback to getting userId from token
    try {
      const decoded = this.getProfile();
      if (decoded && decoded.sub) {
        sessionStorage.setItem(StorageKeys.userId, decoded.sub);
        return decoded.sub;
      }
    } catch (error) {
      console.error('Error getting userId from token:', error);
    }
    
    // Final fallback to username
    return this.getUsername();
  }

  login(idToken: string, userName: string, userId?: string) {
    sessionStorage.setItem(StorageKeys.token, idToken);
    sessionStorage.setItem(StorageKeys.username, userName);
    
    // Set userId from parameter or try to get it from token
    if (userId) {
      sessionStorage.setItem(StorageKeys.userId, userId);
    } else {
      try {
        const decoded = this.getProfile();
        if (decoded && decoded.sub) {
          sessionStorage.setItem(StorageKeys.userId, decoded.sub);
        }
      } catch (error) {
        console.error('Error setting userId from token:', error);
      }
    }
    
    window.location.assign("/");
  }

  logout() {
    // Clear all auth-related items
    sessionStorage.removeItem(StorageKeys.token);
    sessionStorage.removeItem(StorageKeys.username);
    sessionStorage.removeItem(StorageKeys.userId);
    
    window.location.assign("/");
  }

  getUsername(): string {
    return sessionStorage.getItem(StorageKeys.username) || "";
  }

  // Storage helper functions
  saveToStorage(key: string, data: any): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  }

  loadFromStorage(key: string): any {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }


}
export default new AuthService();