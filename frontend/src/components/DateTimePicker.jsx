import { CalendarDays } from "lucide-react";
import { presets } from "../data/timeSlotPresets";
import { Button } from "@/components/ui/button";
import {
  format,
  getHours,
  getMinutes,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";

function DateTimePicker({ examState, examStateHandlers }) {
  return (
    <div className="w-fit flex  gap-2">
      <DatePicker
        date={examState.startTime}
        setDate={examStateHandlers.changeStartTime}
      />
      <TimePicker
        date={examState.startTime}
        setDate={examStateHandlers.changeStartTime}
      />
    </div>
  );
}

export default DateTimePicker;

function TimePicker({ date, setDate }) {
  const [ampm, setAmpm] = useState("AM");
  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");

  useEffect(() => {
    let hours = getHours(date);
    setAmpm(hours >= 12 ? "PM" : "AM");
    hours = hours % 12 || 12; // convert 24h → 12h
    setHourInput(hours.toString());
    setMinuteInput(getMinutes(date).toString());
  }, [date]);

  const changeTime = (h, m, ampmValue = ampm) => {
    let hours = parseInt(h);
    let minutes = parseInt(m);

    if (isNaN(hours) || hours < 1 || hours > 12) return;
    if (isNaN(minutes) || minutes < 0 || minutes > 59) return;

    if (ampmValue === "PM" && hours !== 12) hours += 12;
    if (ampmValue === "AM" && hours === 12) hours = 0;

    const newDate = setHours(setMinutes(date, minutes), hours);
    setDate(newDate);
  };

  const handleAmpmToggle = () => {
    const val = ampm === "AM" ? "PM" : "AM";
    setAmpm(val);
    changeTime(hourInput, minuteInput, val);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          asChild
          variant={"outline"}
          className={"w-[300px] h-fit rounded-xl"}
        >
          <div className="flex flex-col items-start gap-y-0">
            <div className="flex  items-center gap-x-2">
              <Clock size={64} />
              Select Time
            </div>
            <div className="text-2xl font-[600]">{format(date, "hh:mm a")}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={"font-inter "}>
        <div className="flex flex-col items-center font-[500] w-[300px]">
          Select Time
          <Separator className="my-2" />
          <div className="flex gap-x-2 items-center mx-5">
            <input
              value={hourInput}
              onChange={(e) => {
                if (
                  parseInt(e.target.value) < 1 ||
                  parseInt(e.target.value) > 12
                )
                  return;
                changeTime(e.target.value, minuteInput);
              }}
              className="text-4xl w-[80px] h-[80px] border-none text-center font-[700]"
              maxLength={2}
            />
            <span className="text-4xl font-[700]">:</span>
            <input
              value={minuteInput}
              onChange={(e) => {
                if (
                  parseInt(e.target.value) < 0 ||
                  parseInt(e.target.value) > 59
                )
                  return;
                changeTime(hourInput, e.target.value);
              }}
              className="text-4xl w-[80px] h-[80px] border-none text-center font-[700]"
              maxLength={2}
            />
            <span
              onClick={handleAmpmToggle}
              className="text-4xl font-[700] hover:bg-accent rounded cursor-pointer px-2 py-1"
            >
              {ampm}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-center gap-2 flex-wrap my-2">
            {presets.map((preset) => (
              <Button
                key={preset.title}
                variant={"outline"}
                onClick={() => {
                  changeTime(preset.hours, preset.minutes, preset.ampm);
                }}
                className="w-[80px]"
              >
                {preset.title}
              </Button>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DatePicker({ date, setDate }) {
  const handleDateChoosing = (newDate) => {
    const today = new Date();
    if (isBefore(startOfDay(newDate), startOfDay(today))) {
      toast("You cannot select a past date.");
      return;
    }
    setDate(newDate);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          asChild
          variant={"outline"}
          className={"w-[300px] h-fit rounded-xl"}
        >
          <div className="flex flex-col items-start gap-y-0">
            <div className="flex  items-center gap-x-2">
              <CalendarDays size={64} />
              Select a Day
            </div>
            <div className="text-2xl font-[600]">
              {format(date, "do MMMM, yyyy")}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChoosing}
          className="p-10 font-inter font-[500]"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
