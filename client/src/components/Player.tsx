import React from "react";
import ReactPlayer from "react-player";

interface PlayerProps {
    url: string;
}

const Player: React.FC<PlayerProps> = ({ url }) => {
    return (
        <div className="flex justify-center">
            <ReactPlayer
                url={url}
                controls
            />
        </div>
    );
}

export default Player;
