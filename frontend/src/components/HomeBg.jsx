import { useState, useEffect, useRef } from "react";
import bee from "../assets/new_bee.gif";
import honeyRight from "../assets/honey-bg-right.svg";
import honeyLeft from "../assets/honey-bg-left.svg";

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const directions = [
  { name: "ltr", x: 1, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
  { name: "rtl", x: -1, y: 0, scaleX: -1, scaleY: 1, rotation: 0 },
  { name: "ttb", x: 0, y: 1, scaleX: 1, scaleY: 1, rotation: 90 },
  { name: "btt", x: 0, y: -1, scaleX: 1, scaleY: 1, rotation: -90 },
  { name: "diag1", x: 1, y: 1, scaleX: 1, scaleY: 1, rotation: 45 },
  { name: "diag2", x: -1, y: 1, scaleX: -1, scaleY: 1, rotation: 45 },
  { name: "diag3", x: 1, y: -1, scaleX: 1, scaleY: 1, rotation: -45 },
  { name: "diag4", x: -1, y: -1, scaleX: -1, scaleY: 1, rotation: -45 },
];
const MAX=20;
const bg=()=> {
  const FlyingBees = ({ count = 3, interval = 1200, speed = 2 }) => {
    const [bees, setBees] = useState([]);
    const animationRef = useRef();
    const spawnRef = useRef();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
  
    // Spawn bees at intervals
    useEffect(() => {
      function spawnBee() {
        const dir = directions[randInt(0, directions.length - 1)];
        // Start off-screen
        let x, y;
        if (dir.x === 1) x = -80;
        else if (dir.x === -1) x = screenW + 80;
        else x = randInt(0, screenW);
        if (dir.y === 1) y = -80;
        else if (dir.y === -1) y = screenH + 80;
        else y = randInt(0, screenH);
        setBees((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).slice(2),
            x,
            y,
            dir,
          },
        ]);
      }
      spawnRef.current = setInterval(() => {
        for (let i=0; i<count; i++)
        if (bees.length<MAX) spawnBee();
      }, interval);
      return () => clearInterval(spawnRef.current);
    }, [count, interval, screenW, screenH, bees.length]);
  
    // Animate bees
    useEffect(() => {
      function animate() {
        setBees((prev) => prev
          .map((bee) => ({
            ...bee,
            x: bee.x + bee.dir.x * speed,
            y: bee.y + bee.dir.y * speed,
          }))
          .filter((bee) =>
            bee.x > -120 && bee.x < screenW + 120 && bee.y > -120 && bee.y < screenH + 120
          )
        );
        animationRef.current = requestAnimationFrame(animate);
      }
      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
    }, [speed, screenW, screenH]);
  
    return (
      <>
        {bees.map((beeObj) => (
          <img
            key={beeObj.id}
            src={bee}
            alt="bee"
            className="fixed pointer-events-none z-0 w-20 opacity-80 blur-xs aspect-auto transition-transform duration-200"
            style={{
              left: beeObj.x,
              top: beeObj.y,
              transform: `scaleX(${beeObj.dir.scaleX}) scaleY(${beeObj.dir.scaleY}) rotate(${beeObj.dir.rotation}deg)`,
            }}
          />
        ))}
      </>
    );
  }

  return (
    <div className="min-h-screen min-w-screen w-full z-0 fixed">
      <img src={honeyRight} alt="" className="blur opacity-80 right-0 w-1/2 absolute z-0 -top-100 flex" />
      <img src={honeyLeft} alt="" className="blur opacity-80 -left-50 w-3/5 z-0 absolute -top-100 flex" />
      <FlyingBees count={1} interval={3000} speed={0.5} />
    </div>
  )
}

export default bg;