import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ className = "size-12" }) => {
    return (
        <Loader2 className={`animate-spin text-primary ${className}`} />
    );
};

export default LoadingSpinner;