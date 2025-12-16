import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budget from './pages/Budget';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import UpiReminder from './components/UpiReminder';
import NotificationPermission from './components/NotificationPermission';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /><UpiReminder /><NotificationPermission /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /><UpiReminder /><NotificationPermission /></PrivateRoute>} />
          <Route path="/income" element={<PrivateRoute><Income /><UpiReminder /><NotificationPermission /></PrivateRoute>} />
          <Route path="/budget" element={<PrivateRoute><Budget /><UpiReminder /><NotificationPermission /></PrivateRoute>} />
          <Route path="/groups" element={<PrivateRoute><Groups /><UpiReminder /><NotificationPermission /></PrivateRoute>} />
          <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetails /><UpiReminder /><NotificationPermission /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Toast Container */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
