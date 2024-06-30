// Firebase configuration
const firebaseConfig = {
    // Your Firebase config here
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Get references to Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Function to register a new user
  function register(username, email, password) {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Save additional user info to Firestore
        return db.collection('users').doc(user.uid).set({
          username: username,
          email: email
        });
      })
      .then(() => {
        console.log("User registered successfully");
      })
      .catch((error) => {
        console.error("Error registering user:", error);
      });
  }
  
  // Function to login
  function login(email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User logged in successfully");
        loadUserData(user.uid);
      })
      .catch((error) => {
        console.error("Error logging in:", error);
      });
  }
  
  // Function to load user data
  function loadUserData(userId) {
    db.collection('users').doc(userId).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          console.log("User data:", userData);
          // Update local storage with user data
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          console.log("No user data found");
        }
      })
      .catch((error) => {
        console.error("Error loading user data:", error);
      });
  }
  
  // Function to save user data
  function saveUserData(userId, data) {
    db.collection('users').doc(userId).update(data)
      .then(() => {
        console.log("User data saved successfully");
        // Update local storage
        localStorage.setItem('userData', JSON.stringify(data));
      })
      .catch((error) => {
        console.error("Error saving user data:", error);
      });
  }
  
  // Function to check if user is logged in and load data
  function checkAuthState() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User is logged in");
        loadUserData(user.uid);
      } else {
        console.log("User is not logged in");
        localStorage.removeItem('userData');
      }
    });
  }
  
  // Call this function when your app initializes
  checkAuthState();
  
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
    displayInventory();
}

// Function to edit an item in the inventory
function editItem(id, name, quantity, location, status, condition, icloud, shopee, tiktok) {
    const index = inventory.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
        inventory[index] = { ...inventory[index], name, quantity, location, status, condition, icloud, shopee, tiktok };
        saveInventory();
        displayInventory();
    }
}

// Function to delete an item from the inventory
function deleteItem(id) {
    inventory = inventory.filter(item => item.id !== parseInt(id));
    saveInventory();
    displayInventory();
}

// Function to display the inventory
function displayInventory() {
    const tableBody = document.querySelector('#inventory-table tbody');
    tableBody.innerHTML = '';
    
    inventory.forEach((item) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.location}</td>
            <td>${item.status}</td>
            <td>${item.condition}</td>
            <td>${item.icloud || ''}</td>
            <td>${item.shopee || ''}</td>
            <td>${item.tiktok || ''}</td>
            <td>
                <button onclick="showEditPopup(${item.id})">Edit</button>
                <button onclick="showDeletePopup(${item.id})">Delete</button>
            </td>
        `;
    });
}

// Function to show edit popup
function showEditPopup(id) {
    const item = inventory.find(item => item.id === parseInt(id));
    if (item) {
        Swal.fire({
            title: 'Edit Item',
            html:
                `<input id="swal-name" class="swal2-input" value="${item.name}" placeholder="Name">` +
                `<input id="swal-quantity" class="swal2-input" value="${item.quantity}" placeholder="Quantity">` +
                `<input id="swal-location" class="swal2-input" value="${item.location}" placeholder="Location">` +
                `<select id="swal-status" class="swal2-input">
                    <option value="in used" ${item.status === 'in used' ? 'selected' : ''}>In Used</option>
                    <option value="available" ${item.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="broken" ${item.status === 'broken' ? 'selected' : ''}>Broken</option>
                </select>` +
                `<select id="swal-condition" class="swal2-input">
                    <option value="good" ${item.condition === 'good' ? 'selected' : ''}>Good</option>
                    <option value="broken" ${item.condition === 'broken' ? 'selected' : ''}>Broken</option>
                </select>` +
                `<input id="swal-icloud" class="swal2-input" value="${item.icloud || ''}" placeholder="iCloud">` +
                `<input id="swal-shopee" class="swal2-input" value="${item.shopee || ''}" placeholder="Shopee">` +
                `<input id="swal-tiktok" class="swal2-input" value="${item.tiktok || ''}" placeholder="TikTok">`,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-name').value,
                    quantity: document.getElementById('swal-quantity').value,
                    location: document.getElementById('swal-location').value,
                    status: document.getElementById('swal-status').value,
                    condition: document.getElementById('swal-condition').value,
                    icloud: document.getElementById('swal-icloud').value,
                    shopee: document.getElementById('swal-shopee').value,
                    tiktok: document.getElementById('swal-tiktok').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                editItem(id, result.value.name, result.value.quantity, result.value.location, 
                         result.value.status, result.value.condition, result.value.icloud, 
                         result.value.shopee, result.value.tiktok);
                Swal.fire('Updated!', 'The item has been updated.', 'success');
            }
        });
    }
}

// Function to show delete popup
function showDeletePopup(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteItem(id);
            Swal.fire(
                'Deleted!',
                'Your item has been deleted.',
                'success'
            );
        }
    });
}

// Event listener for form submission
document.getElementById('item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const quantity = document.getElementById('quantity').value;
    const location = document.getElementById('location').value;
    const status = document.getElementById('status').value;
    const condition = document.getElementById('condition').value;
    const icloud = document.getElementById('icloud').value;
    const shopee = document.getElementById('shopee').value;
    const tiktok = document.getElementById('tiktok').value;
    
    addItem(name, quantity, location, status, condition, icloud, shopee, tiktok);
    
    Swal.fire('Added!', 'The item has been added to the inventory.', 'success');
    
    // Reset form fields
    this.reset();
});

// Initial display of inventory
displayInventory();
