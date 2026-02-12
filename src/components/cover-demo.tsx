import React from "react";
import { Cover } from "@/components/ui/cover";

export default function CoverDemo() {
    return (
        <div>
            <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500">
                    THE WORLD WANTS
                </span>

                <Cover className="inline-block mt-4">
                    <span className="block text-white">
                        TO SEE YOUR VISION
                    </span>
                </Cover>
            </h1>
        </div>
    );
}
