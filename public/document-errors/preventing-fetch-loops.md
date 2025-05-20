
# Preventing API Fetch Loops

## Issue Description

API fetch loops occur when components make repeated API calls that trigger re-renders, which in turn trigger more API calls. This can lead to:

1. Excessive network traffic
2. Poor application performance
3. Rate limiting by the API service
4. Browser freezing/crashing

## Common Patterns Leading to Loops

1. **Missing Dependency Arrays**:
   ```javascript
   // Problematic code - no dependency array
   useEffect(() => {
     fetchData();
   });
   
   // Fixed code - with proper dependencies
   useEffect(() => {
     fetchData();
   }, [id]); // Only re-fetch when id changes
   ```

2. **Circular Dependencies**:
   ```javascript
   // Problematic pattern
   const [data, setData] = useState([]);
   const [filter, setFilter] = useState('');
   
   useEffect(() => {
     fetchData(filter).then(result => setData(result));
   }, [filter, data]); // Including data creates circular dependency
   
   // Fixed pattern
   useEffect(() => {
     fetchData(filter).then(result => setData(result));
   }, [filter]); // Only re-fetch when filter changes
   ```

3. **State Updates During Renders**:
   ```javascript
   // Problematic pattern
   function Component() {
     const [count, setCount] = useState(0);
     
     // This causes infinite re-renders!
     setCount(count + 1);
     
     return <div>{count}</div>;
   }
   ```

## Solution Strategies

### 1. Use Proper Dependency Arrays

Always specify exact dependencies in useEffect hooks:

```javascript
useEffect(() => {
  async function fetchData() {
    const result = await fetchUsers(params);
    setUsers(result);
  }
  fetchData();
}, [params.id, params.filter]); // Only the specific dependencies that should trigger refetch
```

### 2. Implement Debouncing

For frequent updates like search inputs:

```javascript
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### 3. Add Request Tracking

Implement a circuit breaker pattern to detect and prevent loops:

```javascript
const [requestCount, setRequestCount] = useState(0);

useEffect(() => {
  if (requestCount > 5) {
    console.error("Too many requests detected, stopping the loop");
    return;
  }
  
  setRequestCount(prev => prev + 1);
  fetchData().finally(() => {
    // Reset counter after successful request
    setTimeout(() => setRequestCount(0), 2000);
  });
}, [trigger]);
```

### 4. Use React Query Effectively

With TanStack Query, use these features to prevent loops:

```javascript
const { data } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 1000 * 60, // Data stays fresh for 1 minute
  cacheTime: 1000 * 60 * 5, // Cache data for 5 minutes
  refetchOnWindowFocus: false, // Prevent refetch on focus
});
```

### 5. Implement Data Normalization

Normalize data to minimize cascading updates:

```javascript
// Before: nested state triggers many re-renders
const [users, setUsers] = useState({
  user1: { posts: [...] },
  user2: { posts: [...] }
});

// After: normalized state is more stable
const [users, setUsers] = useState({
  byId: { user1: {}, user2: {} },
  posts: { post1: {}, post2: {} },
  userPosts: { user1: ['post1', 'post2'], user2: [] }
});
```

## Code Patterns to Apply

For user data fetching specifically:

1. **Central Data Store**:
```javascript
const userStore = create((set) => ({
  users: [],
  isLoading: false,
  fetchUsers: async (params) => {
    // Fetch logic with proper error handling
  }
}));
```

2. **Memoized Selectors**:
```javascript
// Avoid recreating functions on each render
const fetchUsers = useCallback(async () => {
  // fetch logic
}, [necessary, dependencies]);
```

3. **Component Key Reset**:
When dealing with complex forms:
```jsx
// Use key to completely reset component state when needed
<UserForm key={`user-form-${userId}`} userId={userId} />
```

4. **Error Circuit Breaking**:
```javascript
const [errorCount, setErrorCount] = useState(0);

useEffect(() => {
  if (errorCount > 3) {
    toast.error("Too many errors occurred, please try again later");
    return;
  }
  
  fetchUsers().catch(() => {
    setErrorCount(prev => prev + 1);
  });
}, [trigger]);
```

## Debugging Tools

1. **Component Render Counter**:
```jsx
function useRenderCounter(componentName) {
  const count = useRef(0);
  console.log(`${componentName} rendered ${++count.current} times`);
}

function MyComponent() {
  useRenderCounter('MyComponent');
  // rest of component
}
```

2. **Network Request Logging**:
```javascript
const fetchWithLogging = async (url, options) => {
  console.log(`Fetching ${url}`, options);
  const response = await fetch(url, options);
  console.log(`Response from ${url}`, response.status);
  return response;
};
```

3. **React DevTools Profiler**:
Use the React DevTools Profiler to identify components that re-render frequently.

## Specific Application Areas

The following areas have been optimized to prevent fetch loops:

1. **User List Page**: 
   - Debounced filter changes
   - Memoized display data
   - Pagination state management

2. **Dashboard Components**:
   - Centralized data fetching
   - Stale-while-revalidate pattern
   - Minimized props passing

3. **Data Entry Forms**:
   - Local state for form values
   - Batch submission patterns
   - Optimistic UI updates

## Related Documentation

- See `public/document-errors/user-roles-infinite-loop.md` for specific details on user role issues
- See `public/document-errors/performance-optimizations.md` for performance improvements
