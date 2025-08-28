import { Button } from "@/components/ui/button";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";
import { useState } from "react";
import { useEffect } from "react";

function getRemainingTime(targetDate, now) {
  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;
  const seconds = differenceInSeconds(targetDate, now) % 60;

  return { days, hours, minutes, seconds };
}

function Countdown({ startTime, serverTime }) {
  const remainingTime = getRemainingTime(startTime, serverTime);
  const [days, setDays] = useState(remainingTime.days);
  const [hours, setHours] = useState(remainingTime.hours);
  const [minutes, setMinutes] = useState(remainingTime.minutes);
  const [seconds, setSeconds] = useState(remainingTime.seconds);

  const nameMapping = ["days", "hours", "minutes", "seconds"];
  // console.log("server time ", format(serverTime, "PPpp"));

  useEffect(() => {
    const newRemainingTime = getRemainingTime(startTime, serverTime);

    setDays(newRemainingTime.days);
    setHours(newRemainingTime.hours);
    setMinutes(newRemainingTime.minutes);
    setSeconds(newRemainingTime.seconds);
  }, [startTime, serverTime]);

  return (
    <div className="flex  items-center gap-2">
      {[days, hours, minutes, seconds].map((time, index) => (
        <div
          key={index}
          className=" w-20 h-20 flex flex-col bg-primary/20 text-2xl text-primary rounded-3xl items-center justify-center p-2 font-semibold"
        >
          <div>{time}</div>
          <div className="text-sm">{nameMapping[index]}</div>
        </div>
      ))}
    </div>
  );
}

export default Countdown;
