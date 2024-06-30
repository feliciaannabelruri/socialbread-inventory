// Firebase configuration
const firebaseConfig = {
    // Your Firebase config here
  };
  
  // Initialize Firebase
  import { initializeApp } from 'firebase/app';
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
  import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Function to register a new user
  async function register(username, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save additional user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email
      });
      
      console.log("User registered successfully");
      return user;
    } catch (error) {
      console.error("Error registering user:", error.message);
      throw error;
    }
  }
  
  // Function to login
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User logged in successfully");
      await loadUserData(user.uid);
      return user;
    } catch (error) {
      console.error("Error logging in:", error.message);
      throw error;
    }
  }
  
  // Function to load user data
  async function loadUserData(userId) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User data:", userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        return userData;
      } else {
        console.log("No user data found");
        return null;
      }
    } catch (error) {
      console.error("Error loading user data:", error.message);
      throw error;
    }
  }
  
  // Function to save user data
  async function saveUserData(userId, data) {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      console.log("User data saved successfully");
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error("Error saving user data:", error.message);
      throw error;
    }
  }
  
  // Function to check if user is logged in and load data
  function checkAuthState(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is logged in");
        await loadUserData(user.uid);
      } else {
        console.log("User is not logged in");
        localStorage.removeItem('userData');
      }
      if (callback) callback(user);
    });
  }
  
  // Initialize inventory from localStorage or create an empty array
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
  
  // Function to save inventory to localStorage
  function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }
  
  // Function to add an item to the inventory
  function addItem(name, quantity, location, status, condition, icloud, shopee, tiktok) {
    const newItem = {
      id: Date.now(),
      name,
      quantity,
      location,
      status,
      condition,
      icloud,
      shopee,
      tiktok
    };
    inventory.push(newItem);
    saveInventory();
    return newItem;
  }
  
  // Function to edit an item in the inventory
  function editItem(id, name, quantity, location, status, condition, icloud, shopee, tiktok) {
    const index = inventory.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      inventory[index] = { 
        ...inventory[index], 
        name, 
        quantity, 
        location, 
        status, 
        condition, 
        icloud, 
        shopee, 
        tiktok 
      };
      saveInventory();
      return inventory[index];
    }
    return null;
  }
  
  // Function to delete an item from the inventory
  function deleteItem(id) {
    inventory = inventory.filter(item => item.id !== parseInt(id));
    saveInventory();
  }
  
  // Export functions
  export {
    register,
    login,
    loadUserData,
    saveUserData,
    checkAuthState,
    addItem,
    editItem,
    deleteItem,
    inventory
  };
  