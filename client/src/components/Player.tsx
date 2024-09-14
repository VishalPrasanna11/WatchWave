import exp from "constants"
import ReactPlayer from "react-player"

const Player = () => {
    return (
        <div className="flex justify-center">
            <ReactPlayer
                // url="https://www.youtube.com/watch?v=Tn6-PIqc4UM&ab_channel=Fireship"
                url ="https://streamable.com/zqa242"
                controls    
            />
        </div>
    )
}

export default Player;