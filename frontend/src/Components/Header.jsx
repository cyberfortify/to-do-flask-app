import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm"
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center py-3">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h4 mb-0 text-primary"
          >
            QuickTask
          </motion.h1>

          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="d-flex align-items-center gap-3"
            >
              <span className="text-muted">Welcome, {user.name}</span>
              <motion.button
                onClick={logout}
                className="btn btn-outline-danger btn-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}