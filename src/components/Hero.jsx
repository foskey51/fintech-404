"use client";
import { cn } from "../lib/util";
import { motion, AnimatePresence } from "motion/react";
import React, { useRef, useState, useEffect } from "react";
import { PiMouseSimple } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const Hero = ({
    children,
    className

}) => {
    const containerRef = useRef(null);
    const parentRef = useRef(null);

    const beams = [
        {
            initialX: 10,
            translateX: 10,
            duration: 7,
            repeatDelay: 3,
            delay: 2,
        },
        {
            initialX: 600,
            translateX: 600,
            duration: 3,
            repeatDelay: 3,
            delay: 4,
        },
        {
            initialX: 100,
            translateX: 100,
            duration: 7,
            repeatDelay: 7,
            className: "h-6",
        },
        {
            initialX: 400,
            translateX: 400,
            duration: 5,
            repeatDelay: 14,
            delay: 4,
        },
        {
            initialX: 800,
            translateX: 800,
            duration: 11,
            repeatDelay: 2,
            className: "h-20",
        },
        {
            initialX: 1000,
            translateX: 1000,
            duration: 4,
            repeatDelay: 2,
            className: "h-12",
        },
        {
            initialX: 1200,
            translateX: 1200,
            duration: 6,
            repeatDelay: 4,
            delay: 2,
            className: "h-6",
        },
    ];

    const navigate = useNavigate();

    return (
        <div
            ref={parentRef}
            className={cn(
                "h-screen  bg-gradient-to-b from-white to-neutral-100 dark:from-neutral-950 dark:to-neutral-950 relative flex items-center w-full justify-center overflow-hidden",
                className
            )}>
            {beams.map((beam) => (
                <CollisionMechanism
                    key={beam.initialX + "beam-idx"}
                    beamOptions={beam}
                    containerRef={containerRef}
                    parentRef={parentRef} />
            ))}
            {children}

            {/* NavBar*/}
            <div className="flex p-6 justify-between absolute top-0 left-0 text-white ">
                <img src="/logo.png"   className="size-15 mix-blend-screen"></img>
                <a className="text-4xl font-bold mt-4 ">ranSec</a>
            </div>

            {/* Subtitle */}
            <div className="absolute top-40 left-0 w-full text-white ">
                <div className="relative max-w-7xl mx-auto px-4 py-20">
                    {/* Gradient background blur */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl z-0" />

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent leading-tight">
                                Stay ahead of fraud with smart, predictive analytics with <span className="font-bold text-gray-300">TranSec</span>
                            </h1>
                            <div className="flex justify-center">
                            <button onClick={() => navigate('/dashboard')} className=' mt-8 bg-transparent border-2 border-[#B87BFF]  p-4 pl-9 pr-9 rounded-xl hover:bg-[#7C80FF] tracking-widest text-2xl'>Try Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex mt-auto pb-10 ">
                <PiMouseSimple color="white" size={50}  />
            </div>


            <div
                ref={containerRef}
                className="absolute bottom-0 bg-neutral-100 w-full inset-x-0 pointer-events-none"
                style={{
                    boxShadow:
                        "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset",
                }}></div>
        </div>
    );
};

const CollisionMechanism = React.forwardRef(({ parentRef, containerRef, beamOptions = {} }, ref) => {
    const beamRef = useRef(null);
    const [collision, setCollision] = useState({
        detected: false,
        coordinates: null,
    });
    const [beamKey, setBeamKey] = useState(0);
    const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false);

    useEffect(() => {
        const checkCollision = () => {
            if (
                beamRef.current &&
                containerRef.current &&
                parentRef.current &&
                !cycleCollisionDetected
            ) {
                const beamRect = beamRef.current.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const parentRect = parentRef.current.getBoundingClientRect();

                if (beamRect.bottom >= containerRect.top) {
                    const relativeX =
                        beamRect.left - parentRect.left + beamRect.width / 2;
                    const relativeY = beamRect.bottom - parentRect.top;

                    setCollision({
                        detected: true,
                        coordinates: {
                            x: relativeX,
                            y: relativeY,
                        },
                    });
                    setCycleCollisionDetected(true);
                }
            }
        };

        const animationInterval = setInterval(checkCollision, 50);

        return () => clearInterval(animationInterval);
    }, [cycleCollisionDetected, containerRef]);

    useEffect(() => {
        if (collision.detected && collision.coordinates) {
            setTimeout(() => {
                setCollision({ detected: false, coordinates: null });
                setCycleCollisionDetected(false);
            }, 2000);

            setTimeout(() => {
                setBeamKey((prevKey) => prevKey + 1);
            }, 2000);
        }
    }, [collision]);

    return (
        <>
            <motion.div
                key={beamKey}
                ref={beamRef}
                animate="animate"
                initial={{
                    translateY: beamOptions.initialY || "-200px",
                    translateX: beamOptions.initialX || "0px",
                    rotate: beamOptions.rotate || 0,
                }}
                variants={{
                    animate: {
                        translateY: beamOptions.translateY || "1800px",
                        translateX: beamOptions.translateX || "0px",
                        rotate: beamOptions.rotate || 0,
                    },
                }}
                transition={{
                    duration: beamOptions.duration || 8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                    delay: beamOptions.delay || 0,
                    repeatDelay: beamOptions.repeatDelay || 0,
                }}
                className={cn(
                    "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
                    beamOptions.className
                )} />
            <AnimatePresence>
                {collision.detected && collision.coordinates && (
                    <Explosion
                        key={`${collision.coordinates.x}-${collision.coordinates.y}`}
                        className=""
                        style={{
                            left: `${collision.coordinates.x}px`,
                            top: `${collision.coordinates.y}px`,
                            transform: "translate(-50%, -50%)",
                        }} />
                )}
            </AnimatePresence>
        </>
    );
});

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({
    ...props
}) => {
    const spans = Array.from({ length: 20 }, (_, index) => ({
        id: index,
        initialX: 0,
        initialY: 0,
        directionX: Math.floor(Math.random() * 80 - 40),
        directionY: Math.floor(Math.random() * -50 - 10),
    }));

    return (
        <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"></motion.div>
            {spans.map((span) => (
                <motion.span
                    key={span.id}
                    initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
                    animate={{
                        x: span.directionX,
                        y: span.directionY,
                        opacity: 0,
                    }}
                    transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
                    className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            ))}
        </div>
    );
};


export default Hero;