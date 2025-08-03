import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Doctor from "../../public/Doctor.jsx";
import "../index.css";

const RotatingDoctor = () => {
    const groupRef = useRef();
    const mouse = useRef(0);
    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current = x;
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
    useFrame(() => {
        if (groupRef.current) {
            const targetY = mouse.current * Math.PI / 3;
            groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08;
        }
    });
    return (
        <group ref={groupRef} position={[0, 11, -15]} scale={[2, 2, 2]}>
            <Doctor />
        </group>
    );
};

const Doctor3D = ({ onLoad }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onLoad?.();
        }, 1000);

        return () => clearTimeout(timer);
    }, [onLoad]);

    return (
        <div className="w-full max-w-md h-[60vh] md:h-[70vh] flex items-center justify-center">
            <Canvas className="w-full h-full bg-transparent">
                <Suspense fallback={null}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow />
                    <RotatingDoctor />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Doctor3D;
