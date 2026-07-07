import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GOVERNMENT_SCHEMES, MOCK_LEADERBOARD, MOCK_TRANSPARENCY_STATS } from "./mockData";

// Initialize Firebase from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// App references
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;

export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
};

// Initialize Firebase if config exists
if (isFirebaseConfigured()) {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApp();
    }
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    console.log("Firebase live connection initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to simulator", error);
    firebaseApp = null;
  }
}

export const getFirebaseAuth = () => firebaseAuth;

/* ==========================================
   MOCK / SIMULATOR FALLBACK DATA STORAGE
   ========================================== */
const getMockStorage = (key, defaultVal) => {
  const data = localStorage.getItem(`sahayak_mock_${key}`);
  return data ? JSON.parse(data) : defaultVal;
};

const setMockStorage = (key, val) => {
  localStorage.setItem(`sahayak_mock_${key}`, JSON.stringify(val));
};

// Seed initial values in mock databases if empty
if (!localStorage.getItem("sahayak_mock_users")) {
  setMockStorage("users", {
    "mock-user-123": {
      uid: "mock-user-123",
      email: "guest@sahayak.gov",
      displayName: "Guest Citizen",
      civicPoints: 150,
      language: "en",
      occupation: "Farmer",
      state: "Maharashtra",
      income: 120000,
      age: 34,
      gender: "Male",
      onboarded: true
    }
  });
}

if (!localStorage.getItem("sahayak_mock_notifications")) {
  setMockStorage("notifications", [
    {
      id: "n-1",
      userId: "mock-user-123",
      text: "Welcome to Sahayak! Complete your profile to get matched scheme eligibility.",
      read: false,
      timestamp: Date.now() - 3600000
    }
  ]);
}

if (!localStorage.getItem("sahayak_mock_complaints")) {
  setMockStorage("complaints", [
    {
      id: "complaint-001",
      userId: "mock-user-123",
      issueType: "Pothole",
      severity: "High",
      department: "Roads/PWD",
      description: "Huge crater near the main market square. Extremely dangerous for two-wheelers.",
      imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop&q=60",
      status: "Resolved",
      officerName: "Sneha Patil",
      officerContact: "+91 98765 43211",
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000
    }
  ]);
}

if (!localStorage.getItem("sahayak_mock_documents")) {
  setMockStorage("documents", []);
}

if (!localStorage.getItem("sahayak_mock_schemes")) {
  setMockStorage("schemes", GOVERNMENT_SCHEMES);
}

// Mock subscribers list for real-time listener simulation
const mockSubscribers = new Set();
const mockNotificationSubscribers = new Set();
const mockVaultSubscribers = new Set();

const triggerMockUpdate = () => {
  mockSubscribers.forEach(cb => {
    const list = getMockStorage("complaints", []);
    cb(list);
  });
};

const triggerMockNotificationUpdate = () => {
  mockNotificationSubscribers.forEach(cb => {
    const list = getMockStorage("notifications", []);
    cb(list);
  });
};

const triggerMockVaultUpdate = () => {
  mockVaultSubscribers.forEach(cb => {
    const list = getMockStorage("documents", []);
    cb(list);
  });
};

/* ==========================================
   AUTHENTICATION & USER METHODS
   ========================================== */

/**
 * Sync or create user profile document in Firestore
 */
export const syncUserProfileDoc = async (user, displayName = "Citizen") => {
  const userDocRef = doc(firebaseDb, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  let userData = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || displayName,
    civicPoints: 0,
    language: "en",
    onboarded: false,
    createdAt: Date.now()
  };

  if (!userDoc.exists()) {
    await setDoc(userDocRef, userData);
  } else {
    userData = userDoc.data();
    // Ensure critical fields are safe
    if (userData.civicPoints === undefined) {
      userData.civicPoints = userData.points || 0;
    }
  }
  return userData;
};

/**
 * Register user with Email/Password (Priority 1)
 */
export const registerWithEmail = async (email, password, displayName) => {
  if (firebaseAuth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      return await syncUserProfileDoc(user, displayName);
    } catch (e) {
      console.error("Firebase Registration failed", e);
      throw e;
    }
  }

  // Mock register fallback
  const users = getMockStorage("users", {});
  const mockUid = `mock-${Math.random().toString(36).substr(2, 9)}`;
  const newUser = {
    uid: mockUid,
    email,
    displayName,
    civicPoints: 0,
    language: "en",
    onboarded: false,
    createdAt: Date.now()
  };
  users[mockUid] = newUser;
  setMockStorage("users", users);
  
  addNotification(mockUid, "Welcome to Sahayak! Let's get started by setting up your basic profile.");
  return newUser;
};

/**
 * Login user with Email/Password (Priority 1)
 */
export const loginWithEmail = async (email, password) => {
  if (firebaseAuth) {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      return await syncUserProfileDoc(user);
    } catch (e) {
      console.error("Firebase Login failed", e);
      // Map standard firebase errors to human readable strings
      let userFriendlyMsg = "Login failed. Please check your credentials.";
      if (e.code === "auth/wrong-password") {
        userFriendlyMsg = "Incorrect password. Please try again.";
      } else if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
        userFriendlyMsg = "No account found with this email or invalid credentials.";
      }
      throw new Error(userFriendlyMsg);
    }
  }

  // Mock login fallback
  const users = getMockStorage("users", {});
  const foundUser = Object.values(users).find(u => u.email === email);
  if (!foundUser) {
    throw new Error("No account found with this email in mock database.");
  }
  // Simply mock wrong password if entered 'wrong' for demonstration testing
  if (password === "wrong") {
    throw new Error("Incorrect password. Please try again.");
  }
  return foundUser;
};

/**
 * Sign In with Google (Priority 1)
 */
export const loginWithGoogle = async () => {
  if (firebaseAuth) {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(firebaseAuth, provider);
      const user = userCredential.user;
      return await syncUserProfileDoc(user);
    } catch (e) {
      console.error("Firebase Google Sign In failed", e);
      throw e;
    }
  }

  // Mock Google sign in
  const users = getMockStorage("users", {});
  const mockUid = "mock-google-user";
  const googleUser = {
    uid: mockUid,
    email: "google.citizen@gmail.com",
    displayName: "Google User",
    civicPoints: 0,
    language: "en",
    onboarded: false,
    createdAt: Date.now()
  };
  users[mockUid] = googleUser;
  setMockStorage("users", users);
  return googleUser;
};

/**
 * Sign In with Apple (Priority 1)
 */
export const loginWithApple = async () => {
  if (firebaseAuth) {
    console.log("Apple Sign-in triggered in Firebase mode");
  }
  
  // Mock Apple/Mac Sign-in
  const users = getMockStorage("users", {});
  const mockUid = "mock-apple-user";
  const appleUser = {
    uid: mockUid,
    email: "apple.citizen@icloud.com",
    displayName: "Apple Citizen",
    civicPoints: 0,
    language: "en",
    onboarded: false,
    createdAt: Date.now()
  };
  users[mockUid] = appleUser;
  setMockStorage("users", users);
  return appleUser;
};

/**
 * Continue as Guest Fallback Option (Priority 1)
 */
export const loginAsGuest = async () => {
  if (firebaseAuth) {
    try {
      const userCredential = await signInAnonymously(firebaseAuth);
      const user = userCredential.user;
      return await syncUserProfileDoc(user, "Guest Citizen");
    } catch (e) {
      console.error("Firebase Guest/Anonymous Login failed", e);
    }
  }

  // Mock guest fallback
  const users = getMockStorage("users", {});
  const mockUid = "mock-user-123";
  return users[mockUid];
};

/**
 * Sign out user
 */
export const logoutUser = async () => {
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
};

/* ==========================================
   FIRESTORE CRUD OPERATIONS
   ========================================== */

export const fetchSchemes = async () => {
  if (firebaseDb) {
    try {
      const schemesCol = collection(firebaseDb, "schemes");
      const snapshot = await getDocs(schemesCol);
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        for (const scheme of GOVERNMENT_SCHEMES) {
          await setDoc(doc(firebaseDb, "schemes", scheme.id), scheme);
        }
        return GOVERNMENT_SCHEMES;
      }
    } catch (e) {
      console.error("Failed to fetch schemes from Firestore", e);
    }
  }
  return getMockStorage("schemes", GOVERNMENT_SCHEMES);
};

export const updateUserProfile = async (uid, profileData) => {
  if (firebaseDb) {
    try {
      const userDocRef = doc(firebaseDb, "users", uid);
      await updateDoc(userDocRef, { ...profileData, onboarded: true });
      const updatedSnap = await getDoc(userDocRef);
      return updatedSnap.data();
    } catch (e) {
      console.error("Failed to update user profile in Firestore", e);
    }
  }
  
  const users = getMockStorage("users", {});
  if (users[uid]) {
    users[uid] = { ...users[uid], ...profileData, onboarded: true };
    setMockStorage("users", users);
    return users[uid];
  }
  return null;
};

export const uploadImageFile = async (uid, file, dataUrl) => {
  if (firebaseStorage) {
    try {
      const filename = `${uid}_${Date.now()}.jpg`;
      const fileRef = ref(firebaseStorage, `complaints/${filename}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (e) {
      console.error("Firebase Storage upload failed", e);
    }
  }
  return dataUrl;
};

export const createComplaint = async (complaint) => {
  if (firebaseDb) {
    try {
      const docRef = await addDoc(collection(firebaseDb, "complaints"), {
        ...complaint,
        timestamp: Date.now()
      });
      await addNotification(complaint.userId, `Your report for ${complaint.issueType} has been successfully filed.`);
      return docRef.id;
    } catch (e) {
      console.error("Failed to create complaint in Firestore", e);
    }
  }
  
  const list = getMockStorage("complaints", []);
  const newId = `complaint-${Math.random().toString(36).substr(2, 9)}`;
  const newComplaint = {
    id: newId,
    ...complaint,
    timestamp: Date.now()
  };
  list.unshift(newComplaint);
  setMockStorage("complaints", list);
  triggerMockUpdate();
  
  addNotification(complaint.userId, `Your report for ${complaint.issueType} has been successfully filed.`);
  return newId;
};

export const listenToComplaints = (uid, callback) => {
  if (firebaseDb) {
    try {
      const q = query(
        collection(firebaseDb, "complaints"),
        where("userId", "==", uid)
      );
      
      return onSnapshot(q, (snapshot) => {
        const complaints = [];
        snapshot.forEach((doc) => {
          complaints.push({ id: doc.id, ...doc.data() });
        });
        complaints.sort((a, b) => b.timestamp - a.timestamp);
        callback(complaints);
      });
    } catch (e) {
      console.error("Firestore onSnapshot subscription failed", e);
    }
  }
  
  const listener = (allComplaints) => {
    const userComplaints = allComplaints.filter(c => c.userId === uid);
    callback(userComplaints);
  };
  
  mockSubscribers.add(listener);
  const currentList = getMockStorage("complaints", []).filter(c => c.userId === uid);
  callback(currentList);
  
  return () => {
    mockSubscribers.delete(listener);
  };
};

export const fetchLeaderboard = async () => {
  if (firebaseDb) {
    try {
      const usersCol = collection(firebaseDb, "users");
      const q = query(usersCol, orderBy("civicPoints", "desc"));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return snapshot.docs.map((doc, idx) => {
          const data = doc.data();
          return {
            rank: idx + 1,
            name: data.displayName || "Anonymous Citizen",
            points: data.civicPoints || 0,
            reports: Math.floor((data.civicPoints || 0) / 50),
            avatar: idx % 2 === 0 ? "👨" : "👩"
          };
        }).slice(0, 10);
      }
    } catch (e) {
      console.error("Leaderboard Firestore load failed, attempting default points sort", e);
    }
  }
  
  const leaderboard = [...MOCK_LEADERBOARD];
  const users = getMockStorage("users", {});
  const localUser = users["mock-user-123"];
  if (localUser && localUser.civicPoints > 0) {
    const existingIdx = leaderboard.findIndex(x => x.name === localUser.displayName);
    if (existingIdx !== -1) {
      leaderboard[existingIdx].points = localUser.civicPoints;
      leaderboard[existingIdx].reports = Math.floor(localUser.civicPoints / 50);
    } else {
      leaderboard.push({
        rank: 6,
        name: localUser.displayName,
        points: localUser.civicPoints,
        reports: Math.floor(localUser.civicPoints / 50),
        avatar: "👤"
      });
    }
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((item, idx) => {
      item.rank = idx + 1;
    });
  }
  
  return leaderboard.slice(0, 5);
};

export const updateUserPoints = async (uid, amount) => {
  if (firebaseDb) {
    try {
      const userDocRef = doc(firebaseDb, "users", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const currentPoints = docSnap.data().civicPoints || 0;
        const newPoints = Math.max(0, currentPoints + amount);
        await updateDoc(userDocRef, { civicPoints: newPoints });
        
        if (amount > 0) {
          await addNotification(uid, `🎉 You earned +${amount} Civic Points for your service!`);
        } else {
          await addNotification(uid, `Redeemed perk: -${Math.abs(amount)} Civic Points deducted.`);
        }
        
        return newPoints;
      }
    } catch (e) {
      console.error("Firestore user points update failed", e);
    }
  }
  
  const users = getMockStorage("users", {});
  if (users[uid]) {
    const pts = users[uid].civicPoints !== undefined ? users[uid].civicPoints : (users[uid].points || 0);
    users[uid].civicPoints = Math.max(0, pts + amount);
    setMockStorage("users", users);
    
    if (amount > 0) {
      addNotification(uid, `🎉 You earned +${amount} Civic Points for your service!`);
    } else {
      addNotification(uid, `Redeemed perk: -${Math.abs(amount)} Civic Points deducted.`);
    }

    return users[uid].civicPoints;
  }
  return 0;
};

export const setComplaintStatus = async (id, status) => {
  if (firebaseDb) {
    try {
      const docRef = doc(firebaseDb, "complaints", id);
      const snap = await getDoc(docRef);
      await updateDoc(docRef, { status: status });
      if (snap.exists()) {
        const data = snap.data();
        await addNotification(data.userId, `Report Status Update: Your ${data.issueType} issue is now "${status}".`);
      }
      return true;
    } catch (e) {
      console.error("Failed to update status on Firestore", e);
    }
  }
  
  const list = getMockStorage("complaints", []);
  const idx = list.findIndex(c => c.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    setMockStorage("complaints", list);
    triggerMockUpdate();
    
    addNotification(list[idx].userId, `Report Status Update: Your ${list[idx].issueType} issue is now "${status}".`);
    return true;
  }
  return false;
};

export const fetchCommunityStats = async () => {
  let liveResolved = 0;
  let liveActive = 0;
  
  if (firebaseDb) {
    try {
      const snap = await getDocs(collection(firebaseDb, "complaints"));
      snap.forEach(d => {
        const c = d.data();
        if (c.status === "Resolved") liveResolved++;
        else liveActive++;
      });
    } catch (e) {
      console.error("Stats count failed, using mocks");
    }
  } else {
    const list = getMockStorage("complaints", []);
    list.forEach(c => {
      if (c.status === "Resolved") liveResolved++;
      else liveActive++;
    });
  }

  return {
    resolvedThisMonth: MOCK_TRANSPARENCY_STATS.resolvedThisMonth + liveResolved,
    avgResolutionDays: MOCK_TRANSPARENCY_STATS.avgResolutionDays,
    totalReported: MOCK_TRANSPARENCY_STATS.totalReported + liveResolved + liveActive,
    satisfactionRate: MOCK_TRANSPARENCY_STATS.satisfactionRate,
    departmentBreakdown: MOCK_TRANSPARENCY_STATS.departmentBreakdown,
    recentPublicComplaints: getMockStorage("complaints", MOCK_TRANSPARENCY_STATS.recentPublicComplaints)
  };
};

/* ==========================================
   DOCUMENT VAULT METHODS (Priority 3)
   ========================================== */

/**
 * Upload personal vault file to Firebase Storage
 */
export const uploadVaultDocumentFile = async (uid, docType, file, dataUrl) => {
  if (firebaseStorage) {
    try {
      const filename = `${docType}_${Date.now()}_${file.name}`;
      const fileRef = ref(firebaseStorage, `documents/${uid}/${filename}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (e) {
      console.error("Firebase Storage Vault upload failed", e);
    }
  }
  // Simulator fallback data URL
  return dataUrl;
};

/**
 * Store metadata record of vault document in Firestore
 */
export const createVaultDocumentRecord = async (record) => {
  const finalRecord = {
    ...record,
    uploadedAt: Date.now()
  };

  if (firebaseDb) {
    try {
      const docRef = await addDoc(collection(firebaseDb, "documents"), finalRecord);
      await addNotification(record.uid, `New vault document (${record.docType}) uploaded and verified.`);
      return docRef.id;
    } catch (e) {
      console.error("Failed to create document vault record in Firestore", e);
    }
  }

  // Fallback
  const list = getMockStorage("documents", []);
  const newId = `doc-${Math.random().toString(36).substr(2, 9)}`;
  const newRecord = {
    id: newId,
    ...finalRecord
  };
  list.unshift(newRecord);
  setMockStorage("documents", list);
  triggerMockVaultUpdate();

  addNotification(record.uid, `New vault document (${record.docType}) uploaded and verified.`);
  return newId;
};

/**
 * Listen to vault documents in real-time
 */
export const listenToVaultDocuments = (uid, callback) => {
  if (firebaseDb) {
    try {
      const q = query(
        collection(firebaseDb, "documents"),
        where("uid", "==", uid)
      );

      return onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        docs.sort((a, b) => b.uploadedAt - a.uploadedAt);
        callback(docs);
      });
    } catch (e) {
      console.error("Firestore vault documents listener failed", e);
    }
  }

  // Fallback
  const listener = (allDocs) => {
    const userDocs = allDocs.filter(d => d.uid === uid);
    callback(userDocs);
  };

  mockVaultSubscribers.add(listener);
  const currentList = getMockStorage("documents", []).filter(d => d.uid === uid);
  callback(currentList);

  return () => {
    mockVaultSubscribers.delete(listener);
  };
};

/* ==========================================
   NOTIFICATION SYSTEM
   ========================================== */

export const addNotification = async (uid, text) => {
  const notifObj = {
    userId: uid,
    text,
    read: false,
    timestamp: Date.now()
  };

  if (firebaseDb) {
    try {
      await addDoc(collection(firebaseDb, "notifications"), notifObj);
      return;
    } catch (e) {
      console.error("Failed to add notification to Firestore", e);
    }
  }

  const list = getMockStorage("notifications", []);
  const newNotif = {
    id: `n-${Math.random().toString(36).substr(2, 9)}`,
    ...notifObj
  };
  list.unshift(newNotif);
  setMockStorage("notifications", list);
  triggerMockNotificationUpdate();
};

export const listenToNotifications = (uid, callback) => {
  if (firebaseDb) {
    try {
      const q = query(
        collection(firebaseDb, "notifications"),
        where("userId", "==", uid)
      );
      
      return onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => b.timestamp - a.timestamp);
        callback(list);
      });
    } catch (e) {
      console.error("Firestore listenToNotifications failed", e);
    }
  }

  const listener = (allNotifications) => {
    const userNotifs = allNotifications.filter(n => n.userId === uid);
    callback(userNotifs);
  };

  mockNotificationSubscribers.add(listener);
  const currentList = getMockStorage("notifications", []).filter(n => n.userId === uid);
  callback(currentList);

  return () => {
    mockNotificationSubscribers.delete(listener);
  };
};

export const markNotificationRead = async (notificationId) => {
  if (firebaseDb) {
    try {
      const docRef = doc(firebaseDb, "notifications", notificationId);
      await updateDoc(docRef, { read: true });
      return;
    } catch (e) {
      console.error("Failed to mark notification read in Firestore", e);
    }
  }

  const list = getMockStorage("notifications", []);
  const idx = list.findIndex(n => n.id === notificationId);
  if (idx !== -1) {
    list[idx].read = true;
    setMockStorage("notifications", list);
    triggerMockNotificationUpdate();
  }
};
