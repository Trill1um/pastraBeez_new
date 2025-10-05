import bee from "../assets/bee-anim.mp4";
import bee_up from "../assets/new_bee.gif";
import bee_static from "../assets/flying_bee.webp";

export const FlyingBee = ({ style }) => {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={style}
    >
      <source src={bee} type="video/webm" />
      <img src={bee_up} />
      {/* <img src={bee_static} alt="static bee" /> */}
      Your browser does not support the video tag.
    </video>
  );
};
