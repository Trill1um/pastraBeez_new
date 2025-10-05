import bee from "../assets/bee-anim.mp4";
import bee_up from "../assets/new_bee.gif";

export const FlyingBee = ({ style }) => {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={`pointer-events-none ${style}`}
    >
      <source src={bee} type="video/webm" />
      <img src={bee_up} />
      Your browser does not support the video tag.
    </video>
  );
};
