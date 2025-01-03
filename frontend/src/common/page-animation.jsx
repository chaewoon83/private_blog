import { AnimatePresence, motion } from "framer-motion";

const AnimationWrapper = ({ children, keyValue, initial = { opacity : 0 }, animate = { opacity: 1 }, exit = { opacity : 0 }, transition = { duration: 0.8 }, className }) => {
    return (

        <AnimatePresence>
            {/* exit animation only applied to direct children */}
            <motion.div
                key={keyValue}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={transition}
                className={className}
            >
                { children }
            </motion.div>
        </AnimatePresence>

    )
}

export default AnimationWrapper;