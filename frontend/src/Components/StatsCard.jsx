import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ total, completed, pending }) {
  const stats = [
    { value: total, label: 'Total Tasks', color: 'primary' },
    { value: completed, label: 'Completed', color: 'success' },
    { value: pending, label: 'Pending', color: 'warning' }
  ];

  return (
    <div className="row g-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="col-md-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <motion.div
            className={`card bg-${stat.color}-subtle border-${stat.color}-subtle`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="card-body text-center">
              <motion.h3
                className={`h2 mb-2 text-${stat.color}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {stat.value}
              </motion.h3>
              <p className="text-muted mb-0">{stat.label}</p>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}