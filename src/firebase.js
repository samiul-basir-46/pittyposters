import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC_prMKVpDA6Ae4m_9VP7LSt0KsbXALNrw',
  authDomain: 'pittyposterofficials.firebaseapp.com',
  projectId: 'pittyposterofficials',
  storageBucket: 'pittyposterofficials.firebasestorage.app',
  messagingSenderId: '778701183048',
  appId: '1:778701183048:web:de1e0f0aeb7a8362f3e07d',
  measurementId: 'G-H34S1J9RZW',
}

const app = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(app)
