import { motion } from 'framer-motion'
import Logo from '@/assets/logos/singlelogo.svg'

const LoadingSpinner = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm"
    >
      <motion.img
        src={Logo}
        alt="Loading Logo"
        className="size-32"
        animate={{ rotate: [-10, 10] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />

      <motion.div
        className="mt-12 flex flex-col items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <motion.span
          className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-3xl font-bold tracking-widest text-transparent"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          De Fleur
        </motion.span>
        <div className="mt-6 flex space-x-3">
          {[0, 1, 2, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full bg-indigo-400"
              animate={{
                y: ['0%', '-100%', '0%'],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: [0.76, 0, 0.24, 1]
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LoadingSpinner
