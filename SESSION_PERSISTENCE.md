# Session Persistence Across Tabs - Implementation Guide

## ✅ What Was Implemented

Your user sessions now persist across browser tabs using `localStorage` and the Storage API.

## How It Works

### 1. **AuthContext** (`/client/src/context/AuthContext.tsx`)
- Stores JWT token and user info in `localStorage`
- Listens for storage changes across tabs
- Automatically syncs login/logout across all tabs
- Validates token on page load

### 2. **Cross-Tab Sync**
When you login/logout in one tab:
- `localStorage` is updated
- Browser triggers `storage` event in all other tabs
- Other tabs automatically update their auth state

## Usage in Your App

### Login (Already Updated)
```tsx
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();

// Login persists across tabs automatically
await login(email, password);
```

### Logout (Already Updated in Layout)
```tsx
const { logout } = useAuth();

// Logout syncs across all tabs
logout();
```

### Check Current User
```tsx
const { user, isLoading } = useAuth();

if (isLoading) return <div>Loading...</div>;
if (!user) return <div>Not logged in</div>;

return <div>Welcome {user.email}!</div>;
```

### Authenticated API Calls

**Option 1: Use the helper hook**
```tsx
import { useAuthFetch } from '../context/AuthContext';

const authFetch = useAuthFetch();

// Automatically includes Authorization header
const response = await authFetch('http://localhost:3000/api/spending');
```

**Option 2: Manual fetch with token**
```tsx
import { useAuth } from '../context/AuthContext';

const { token } = useAuth();

const response = await fetch('http://localhost:3000/api/spending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Example: Update SpendingHistory.tsx

```tsx
import { useAuth, useAuthFetch } from "../context/AuthContext";

export default function SpendingHistory() {
  const { user, isLoading } = useAuth();
  const authFetch = useAuthFetch();
  
  const fetchTransactions = async () => {
    try {
      const response = await authFetch("http://localhost:3000/api/spending");
      // Token is automatically included!
      
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTransactions(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    return <div>Please log in to view spending history</div>;
  }

  // Rest of component...
}
```

## Configuration

### Environment Variables
Create `/client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

For production:
```env
VITE_API_URL=https://your-backend.com/api
```

## Testing Cross-Tab Sync

1. Open your app in two browser tabs
2. Login in Tab 1
3. Check Tab 2 - user should be logged in
4. Logout in Tab 2
5. Check Tab 1 - user should be logged out

## What Persists

✅ **User email**
✅ **User ID**
✅ **JWT token**
✅ **User's owned cards**
✅ **Login state across all tabs**

## Security Notes

- Tokens are stored in `localStorage` (accessible to JavaScript)
- Tokens expire based on backend config (default: 7 days)
- Logout clears all stored data
- Invalid tokens are automatically cleared on page load

## Development Mode

When `USE_DEV_AUTH=true` in server:
- Frontend still works normally
- Can login/logout as usual
- Sessions still persist across tabs
- Backend just bypasses JWT validation

## Build for Production

```bash
cd client
npm run build
```

This creates a `dist` folder ready for deployment.
