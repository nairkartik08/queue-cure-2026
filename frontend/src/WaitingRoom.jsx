import { useEffect, useState }
from "react";

import socket from "./socket";

function WaitingRoom() {

  const [
    currentToken,
    setCurrentToken
  ] = useState("");

  useEffect(() => {

    socket.on(
      "tokenUpdated",
      (data) => {

        setCurrentToken(
          data.currentToken
        );

      }
    );

    return () => {

      socket.off(
        "tokenUpdated"
      );

    };

  }, []);

  return (

    <div
      style={{
        textAlign: "center",
        marginTop: "100px"
      }}
    >

      <h1>
        Waiting Room
      </h1>

      <h2>
        Now Serving
      </h2>

      <h1>
        {currentToken}
      </h1>

    </div>

  );
}

export default WaitingRoom;

