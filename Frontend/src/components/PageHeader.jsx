import { motion } from 'framer-motion';

export const PageHeader = ({ title, subtitle, actions }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-3">{actions}</div>
  </motion.div>
);
