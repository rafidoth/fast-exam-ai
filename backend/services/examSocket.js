const events = {
  GET_EXAM_ID: "exam-id",
  TIME_UPDATE: "time-update",
};

export function runSocket(io) {
  // Global timer - runs only once regardless of client connections
  setInterval(() => {
    io.emit(events.TIME_UPDATE, { time: Date.now() });
  }, 1000);

  io.on("connection", async (socket) => {
    console.log("new client connected");

    const examId = await socket.emitWithAck(events.GET_EXAM_ID);
    console.log("client wants to join the exam : ", examId);
    socket.join(examId);
  });
}
